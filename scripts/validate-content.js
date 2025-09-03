#!/usr/bin/env node

/**
 * libx-docsコンテンツ構造バリデーションスクリプト
 * 
 * 使用例:
 * node scripts/validate-content.js                 # 全プロジェクトをバリデーション
 * node scripts/validate-content.js sample-docs     # 特定プロジェクトをバリデーション
 * node scripts/validate-content.js --fix           # 可能な問題を自動修正
 * 
 * このスクリプトは以下のバリデーションを実行します:
 * 1. config.jsonスキーマ検証
 * 2. ディレクトリ構造の整合性チェック
 * 3. ファイル命名規則チェック
 * 4. 言語間コンテンツ一貫性チェック
 * 5. 必要に応じた自動修正の提案
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {
  isExcludedDirectory,
  validateProjectStructure,
  loadConfig,
  saveConfig,
  displayValidationIssues
} from './sync-utils.js';

// ESモジュールで__dirnameを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const libxDocsPath = path.resolve(rootDir, '..', 'libx-docs');

/**
 * コマンドライン引数を解析
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    projectName: null,
    fix: false,
    verbose: false,
    strict: false
  };

  for (const arg of args) {
    if (arg === '--fix') {
      options.fix = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--strict') {
      options.strict = true;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    } else if (!arg.startsWith('--')) {
      options.projectName = arg;
    }
  }

  return options;
}

/**
 * ヘルプメッセージを表示
 */
function showHelp() {
  console.log(`
libx-docs コンテンツバリデーションツール

使用法:
  node scripts/validate-content.js [project-name] [options]

引数:
  project-name     バリデーション対象のプロジェクト名（省略時は全プロジェクト）

オプション:
  --fix            可能な問題を自動修正
  --verbose        詳細ログを出力
  --strict         厳密なバリデーション（警告もエラーとして扱う）
  --help, -h       このヘルプを表示

例:
  node scripts/validate-content.js
  node scripts/validate-content.js sample-docs
  node scripts/validate-content.js --fix --verbose
  node scripts/validate-content.js sample-docs --strict
`);
}

// グローバルなスキーマキャッシュ
let schemaValidator = null;

/**
 * JSONスキーマバリデーターを初期化
 * @returns {Promise<Function>} バリデーター関数
 */
async function initializeSchemaValidator() {
  if (schemaValidator) {
    return schemaValidator;
  }
  
  try {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    
    const schemaPath = path.join(__dirname, 'schemas', 'libx-docs-config.schema.json');
    const schemaContent = await fs.readFile(schemaPath, 'utf8');
    const schema = JSON.parse(schemaContent);
    
    schemaValidator = ajv.compile(schema);
    return schemaValidator;
  } catch (error) {
    throw new Error(`スキーマファイル読み込みエラー: ${error.message}`);
  }
}

/**
 * config.jsonのスキーマバリデーション
 * @param {Object} config 設定オブジェクト
 * @param {Function} validator バリデーター関数
 * @returns {Object} バリデーション結果
 */
async function validateConfigSchema(config, validator) {
  try {
    const valid = validator(config);
    
    return {
      valid,
      errors: validator.errors || []
    };
  } catch (error) {
    return {
      valid: false,
      errors: [{ message: `バリデーションエラー: ${error.message}` }]
    };
  }
}

/**
 * プロジェクトの追加バリデーション
 * @param {string} projectPath プロジェクトパス
 * @param {Object} config プロジェクト設定
 * @param {Object} options オプション
 * @returns {Promise<Object>} バリデーション結果
 */
async function validateProjectExtended(projectPath, config, _options) {
  const issues = [];
  
  // 1. 基本的なディレクトリ構造バリデーション
  const structureValidation = await validateProjectStructure(
    projectPath,
    config.supportedLangs,
    config.versions
  );
  
  issues.push(...structureValidation.issues);
  
  // 2. コンテンツファイルの存在チェック
  for (const version of config.versions) {
    for (const lang of config.supportedLangs) {
      const versionLangPath = path.join(projectPath, version, lang);
      
      try {
        const categories = await fs.readdir(versionLangPath);
        
        for (const category of categories) {
          const categoryPath = path.join(versionLangPath, category);
          const stat = await fs.stat(categoryPath);
          
          if (stat.isDirectory()) {
            const files = await fs.readdir(categoryPath);
            const mdxFiles = files.filter(file => file.endsWith('.mdx'));
            
            if (mdxFiles.length === 0) {
              issues.push({
                type: 'empty_category',
                version,
                language: lang,
                category,
                path: `${version}/${lang}/${category}`,
                message: `カテゴリ "${category}" にMDXファイルがありません`
              });
            }
          }
        }
      } catch (error) {
        // ディレクトリが存在しない場合は既に他のバリデーションで検出済み
      }
    }
  }
  
  // 3. 設定ファイルの整合性チェック
  const configIssues = await validateConfigConsistency(config, projectPath);
  issues.push(...configIssues);
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * 設定ファイルの整合性をチェック
 * @param {Object} config プロジェクト設定
 * @param {string} projectPath プロジェクトパス
 * @returns {Promise<Array>} 問題のリスト
 */
async function validateConfigConsistency(config, _projectPath) {
  const issues = [];
  
  // デフォルト言語がサポート言語に含まれているかチェック
  if (!config.supportedLangs.includes(config.defaultLang)) {
    issues.push({
      type: 'invalid_default_language',
      message: `デフォルト言語 "${config.defaultLang}" がサポート言語に含まれていません`
    });
  }
  
  // 最新バージョンがバージョンリストに含まれているかチェック
  if (!config.versions.includes(config.latestVersion)) {
    issues.push({
      type: 'invalid_latest_version',
      message: `最新バージョン "${config.latestVersion}" がバージョンリストに含まれていません`
    });
  }
  
  // displayNameとdescriptionがすべてのサポート言語で定義されているかチェック
  for (const lang of config.supportedLangs) {
    if (!config.displayName[lang]) {
      issues.push({
        type: 'missing_display_name',
        language: lang,
        message: `表示名が言語 "${lang}" で定義されていません`
      });
    }
    
    if (!config.description[lang]) {
      issues.push({
        type: 'missing_description',
        language: lang,
        message: `説明が言語 "${lang}" で定義されていません`
      });
    }
  }
  
  // カテゴリの翻訳が適切に定義されているかチェック
  for (const [categoryKey, categoryTranslations] of Object.entries(config.categories || {})) {
    for (const lang of config.supportedLangs) {
      if (!categoryTranslations[lang]) {
        issues.push({
          type: 'missing_category_translation',
          category: categoryKey,
          language: lang,
          message: `カテゴリ "${categoryKey}" の翻訳が言語 "${lang}" で定義されていません`
        });
      }
    }
  }
  
  return issues;
}

/**
 * 問題の自動修正を試行
 * @param {string} projectPath プロジェクトパス
 * @param {Object} config プロジェクト設定
 * @param {Array} issues 問題のリスト
 * @param {Object} options オプション
 * @returns {Promise<Object>} 修正結果
 */
async function attemptAutoFix(projectPath, config, issues, _options) {
  const fixed = [];
  const unfixed = [];
  let configChanged = false;
  
  for (const issue of issues) {
    switch (issue.type) {
      case 'missing_display_name':
        // デフォルト言語の表示名を他の言語にコピー
        if (config.displayName.en) {
          config.displayName[issue.language] = config.displayName.en;
          configChanged = true;
          fixed.push({
            ...issue,
            fix: `デフォルト言語の表示名をコピーしました: "${config.displayName.en}"`
          });
        } else {
          unfixed.push(issue);
        }
        break;
        
      case 'missing_description':
        // デフォルト言語の説明を他の言語にコピー
        if (config.description.en) {
          config.description[issue.language] = config.description.en;
          configChanged = true;
          fixed.push({
            ...issue,
            fix: `デフォルト言語の説明をコピーしました: "${config.description.en}"`
          });
        } else {
          unfixed.push(issue);
        }
        break;
        
      case 'missing_category_translation': {
        // デフォルト言語のカテゴリ翻訳を他の言語にコピー
        const categoryTranslations = config.categories[issue.category];
        if (categoryTranslations && categoryTranslations.en) {
          categoryTranslations[issue.language] = categoryTranslations.en;
          configChanged = true;
          fixed.push({
            ...issue,
            fix: `デフォルト言語のカテゴリ翻訳をコピーしました: "${categoryTranslations.en}"`
          });
        } else {
          unfixed.push(issue);
        }
        break;
      }
        
      default:
        unfixed.push(issue);
    }
  }
  
  // 設定ファイルを保存（変更があった場合）
  if (configChanged) {
    const configPath = path.join(projectPath, 'config.json');
    const saveSuccess = await saveConfig(configPath, config);
    
    if (!saveSuccess) {
      // 設定保存に失敗した場合、修正済みとした項目も未修正扱いにする
      unfixed.push(...fixed);
      fixed.length = 0;
    }
  }
  
  return {
    fixed,
    unfixed,
    configChanged
  };
}

/**
 * 単一プロジェクトをバリデーション
 * @param {string} projectName プロジェクト名
 * @param {Ajv} validator スキーマバリデーター
 * @param {Object} options オプション
 * @returns {Promise<Object>} バリデーション結果
 */
async function validateProject(projectName, validator, options) {
  const projectPath = path.join(libxDocsPath, projectName);
  const configPath = path.join(projectPath, 'config.json');
  
  console.log(`\\n📁 プロジェクト: ${projectName}`);
  
  // 1. config.jsonを読み込み
  const config = await loadConfig(configPath);
  if (!config) {
    return {
      success: false,
      projectName,
      error: 'config.jsonの読み込みに失敗しました'
    };
  }
  
  const allIssues = [];
  
  // 2. スキーマバリデーション
  console.log(`   🔍 スキーマバリデーション中...`);
  const schemaValidation = await validateConfigSchema(config, validator);
  
  if (!schemaValidation.valid) {
    console.log(`   ❌ スキーマバリデーション失敗:`);
    
    for (const error of schemaValidation.errors) {
      const issue = {
        type: 'schema_error',
        message: `${error.instancePath || 'root'}: ${error.message}`,
        schema: error.keyword,
        data: error.data
      };
      
      allIssues.push(issue);
      console.log(`      ⚠️  ${issue.message}`);
    }
  } else {
    console.log(`   ✅ スキーマバリデーション成功`);
  }
  
  // 3. 拡張バリデーション
  console.log(`   🔍 拡張バリデーション中...`);
  const extendedValidation = await validateProjectExtended(projectPath, config, options);
  
  allIssues.push(...extendedValidation.issues);
  
  if (extendedValidation.isValid) {
    console.log(`   ✅ 拡張バリデーション成功`);
  } else {
    console.log(`   ❌ 拡張バリデーション失敗:`);
    displayValidationIssues(extendedValidation.issues);
  }
  
  // 4. 自動修正の試行
  let fixResult = null;
  if (options.fix && allIssues.length > 0) {
    console.log(`   🔧 自動修正を試行中...`);
    fixResult = await attemptAutoFix(projectPath, config, allIssues, options);
    
    if (fixResult.fixed.length > 0) {
      console.log(`   ✅ ${fixResult.fixed.length}個の問題を自動修正しました:`);
      for (const fixedIssue of fixResult.fixed) {
        console.log(`      🔧 ${fixedIssue.fix}`);
      }
    }
    
    if (fixResult.unfixed.length > 0) {
      console.log(`   ⚠️  ${fixResult.unfixed.length}個の問題は手動修正が必要です`);
    }
  }
  
  const finalIssueCount = fixResult ? fixResult.unfixed.length : allIssues.length;
  const isValid = finalIssueCount === 0;
  
  return {
    success: isValid,
    projectName,
    totalIssues: allIssues.length,
    remainingIssues: finalIssueCount,
    fixedIssues: fixResult ? fixResult.fixed.length : 0,
    issues: fixResult ? fixResult.unfixed : allIssues
  };
}

/**
 * libx-docsからプロジェクトリストを取得
 * @returns {Promise<Array<string>>} プロジェクト名のリスト
 */
async function getProjectList() {
  try {
    const entries = await fs.readdir(libxDocsPath, { withFileTypes: true });
    
    const projects = [];
    for (const entry of entries) {
      if (entry.isDirectory() && !isExcludedDirectory(entry.name)) {
        // config.jsonが存在するプロジェクトのみを対象とする
        const configPath = path.join(libxDocsPath, entry.name, 'config.json');
        try {
          await fs.access(configPath);
          projects.push(entry.name);
        } catch {
          console.warn(`⚠️  プロジェクト "${entry.name}" にconfig.jsonが見つかりません。スキップします。`);
        }
      }
    }
    
    return projects;
  } catch (error) {
    console.error(`❌ libx-docsディレクトリの読み取りエラー: ${error.message}`);
    throw error;
  }
}

/**
 * メイン処理
 */
async function main() {
  const options = parseArguments();
  
  console.log('🔍 libx-docs コンテンツバリデーションを開始します\\n');
  
  if (options.fix) {
    console.log('🔧 自動修正モード');
  }
  
  if (options.strict) {
    console.log('⚠️  厳密モード');
  }
  
  // libx-docsディレクトリの存在確認
  try {
    await fs.access(libxDocsPath);
  } catch {
    console.error(`❌ libx-docsディレクトリが見つかりません: ${libxDocsPath}`);
    process.exit(1);
  }
  
  // スキーマバリデーターを初期化
  const validator = await initializeSchemaValidator();
  
  // 処理対象プロジェクトの決定
  let projectsToValidate;
  
  if (options.projectName) {
    // 指定されたプロジェクトが存在するかチェック
    const projectPath = path.join(libxDocsPath, options.projectName);
    try {
      await fs.access(projectPath);
      projectsToValidate = [options.projectName];
    } catch {
      console.error(`❌ 指定されたプロジェクトが見つかりません: ${options.projectName}`);
      process.exit(1);
    }
  } else {
    projectsToValidate = await getProjectList();
  }
  
  console.log(`📋 バリデーション対象: ${projectsToValidate.length}個のプロジェクト`);
  if (options.verbose) {
    console.log(`   プロジェクト: ${projectsToValidate.join(', ')}`);
  }
  
  // 各プロジェクトをバリデーション
  const results = [];
  
  for (const projectName of projectsToValidate) {
    const result = await validateProject(projectName, validator, options);
    results.push(result);
  }
  
  // 結果サマリーを表示
  console.log('\\n📊 バリデーション結果サマリー:');
  
  const valid = results.filter(r => r.success);
  const invalid = results.filter(r => !r.success);
  
  console.log(`   ✅ 有効: ${valid.length}個`);
  console.log(`   ❌ 無効: ${invalid.length}個`);
  
  if (options.fix) {
    const totalFixed = results.reduce((sum, r) => sum + (r.fixedIssues || 0), 0);
    const totalRemaining = results.reduce((sum, r) => sum + (r.remainingIssues || 0), 0);
    console.log(`   🔧 修正済み: ${totalFixed}個の問題`);
    console.log(`   ⚠️  残り: ${totalRemaining}個の問題`);
  }
  
  if (valid.length > 0) {
    console.log('\\n✅ 有効なプロジェクト:');
    for (const result of valid) {
      let statusText = result.projectName;
      if (result.fixedIssues > 0) {
        statusText += ` (${result.fixedIssues}個の問題を修正)`;
      }
      console.log(`   - ${statusText}`);
    }
  }
  
  if (invalid.length > 0) {
    console.log('\\n❌ 無効なプロジェクト:');
    for (const result of invalid) {
      let statusText = `${result.projectName}: ${result.remainingIssues || result.totalIssues}個の問題`;
      if (result.error) {
        statusText += ` (${result.error})`;
      }
      console.log(`   - ${statusText}`);
    }
    
    if (options.strict) {
      process.exit(1);
    }
  }
  
  console.log('\\n🎉 バリデーション処理が完了しました！');
  
  if (invalid.length > 0 && !options.strict) {
    console.log('💡 --strictオプションを使用すると、問題がある場合にプロセスが失敗で終了します。');
  }
  
  if (!options.fix && results.some(r => r.totalIssues > 0)) {
    console.log('💡 --fixオプションを使用すると、可能な問題を自動修正します。');
  }
}

// スクリプト実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`\\n💥 予期しないエラーが発生しました:`, error);
    process.exit(1);
  });
}