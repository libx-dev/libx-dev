#!/usr/bin/env node

/**
 * ドキュメントプロジェクトに新しい言語を自動追加するスクリプト
 * 
 * 使用例:
 * node scripts/add-language.js sample-docs ko
 * node scripts/add-language.js test-verification zh-Hans "简体中文" "简体中文文档" --template-lang=en --auto-template
 * 
 * このスクリプトは以下の処理を自動化します:
 * 1. 言語バリデーション（サポート済み言語の確認）
 * 2. プロジェクト設定の更新（project.config.json）
 * 3. トップページ設定の更新（projects.config.json）
 * 4. ディレクトリ構造の自動作成
 * 5. テンプレートファイルの自動生成
 * 6. ビルドテストの自動実行
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { 
  loadProjectConfig, 
  saveProjectConfig, 
  analyzeProjectStructure 
} from './document-utils.js';

// ESモジュールで__dirnameを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * バックアップとロールバック管理クラス
 */
class BackupManager {
  constructor() {
    this.backups = new Map();
    this.createdPaths = [];
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * ファイルをバックアップする
   */
  backupFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      this.backups.set(filePath, content);
      console.log(`  📋 バックアップ: ${filePath}`);
      return content;
    } catch (error) {
      console.warn(`  ⚠️  バックアップ警告: ${filePath} - ${error.message}`);
      return null;
    }
  }

  /**
   * 作成したパスを記録する
   */
  recordCreatedPath(path) {
    this.createdPaths.push(path);
    console.log(`  📝 作成記録: ${path}`);
  }

  /**
   * ロールバックを実行する
   */
  async rollback() {
    console.log('\n🔄 ロールバックを実行しています...');
    
    let rollbackSuccess = true;
    
    // 作成したファイル・ディレクトリを削除
    for (const createdPath of this.createdPaths.reverse()) {
      try {
        if (fs.existsSync(createdPath)) {
          const stats = fs.statSync(createdPath);
          if (stats.isDirectory()) {
            fs.rmSync(createdPath, { recursive: true, force: true });
            console.log(`  ✅ ディレクトリ削除: ${createdPath}`);
          } else {
            fs.unlinkSync(createdPath);
            console.log(`  ✅ ファイル削除: ${createdPath}`);
          }
        }
      } catch (error) {
        console.error(`  ❌ 削除失敗: ${createdPath} - ${error.message}`);
        rollbackSuccess = false;
      }
    }
    
    // バックアップからファイルを復元
    for (const [filePath, content] of this.backups) {
      try {
        fs.writeFileSync(filePath, content);
        console.log(`  ✅ ファイル復元: ${filePath}`);
      } catch (error) {
        console.error(`  ❌ 復元失敗: ${filePath} - ${error.message}`);
        rollbackSuccess = false;
      }
    }
    
    if (rollbackSuccess) {
      console.log('✅ ロールバック完了');
    } else {
      console.log('⚠️  ロールバック部分的成功 - 手動確認が必要です');
    }
    
    return rollbackSuccess;
  }

  /**
   * バックアップファイルを保存する（デバッグ用）
   */
  saveBackupFiles() {
    const backupDir = path.join(rootDir, '.backups', `language-addition-${this.timestamp}`);
    
    try {
      fs.mkdirSync(backupDir, { recursive: true });
      
      for (const [filePath, content] of this.backups) {
        const relativePath = path.relative(rootDir, filePath);
        const backupPath = path.join(backupDir, relativePath);
        const backupDirPath = path.dirname(backupPath);
        
        fs.mkdirSync(backupDirPath, { recursive: true });
        fs.writeFileSync(backupPath, content);
      }
      
      console.log(`📁 バックアップファイル保存: ${backupDir}`);
      return backupDir;
    } catch (error) {
      console.warn(`⚠️  バックアップファイル保存警告: ${error.message}`);
      return null;
    }
  }
}

/**
 * サポート済み言語のマップ（i18nパッケージから取得）
 */
const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'ja': '日本語',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
  'es': 'Español',
  'pt-BR': 'Português (Brasil)',
  'ko': '한국어',
  'de': 'Deutsch',
  'fr': 'Français',
  'ru': 'Русский',
  'ar': 'العربية',
  'id': 'Bahasa Indonesia',
  'tr': 'Türkçe',
  'hi': 'हिन्दी',
  'vi': 'Tiếng Việt'
};

/**
 * コマンドライン引数を解析する
 */
function parseArguments() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('使用法: node scripts/add-language.js <project-name> <language-code> [display-name] [description] [options]');
    console.error('');
    console.error('引数:');
    console.error('  project-name     プロジェクト名（例: sample-docs, test-verification）');
    console.error('  language-code    言語コード（例: ko, zh-Hans, de）');
    console.error('  display-name     言語表示名（省略時は自動設定）');
    console.error('  description      言語説明文（省略時は自動生成）');
    console.error('');
    console.error('オプション:');
    console.error('  --template-lang=<code>  コピー元言語（デフォルト: en）');
    console.error('  --auto-template         対話なしでテンプレート生成');
    console.error('  --skip-test             ビルドテストをスキップ');
    console.error('  --skip-top-page         トップページ設定更新をスキップ');
    console.error('  --interactive           対話モードで実行');
    console.error('');
    console.error('サポート言語:');
    Object.entries(SUPPORTED_LANGUAGES).forEach(([code, name]) => {
      console.error(`  ${code.padEnd(8)} ${name}`);
    });
    console.error('');
    console.error('例:');
    console.error('  node scripts/add-language.js sample-docs ko');
    console.error('  node scripts/add-language.js test-verification zh-Hans "简体中文" "简体中文文档"');
    console.error('  node scripts/add-language.js api-docs de --template-lang=en --auto-template');
    process.exit(1);
  }

  // オプション引数とポジショナル引数を分離
  const positionalArgs = [];
  const options = {};

  for (const arg of args) {
    if (arg.startsWith('--')) {
      if (arg.includes('=')) {
        const [key, value] = arg.substring(2).split('=', 2);
        options[key] = value;
      } else {
        // フラグオプション
        options[arg.substring(2)] = true;
      }
    } else {
      positionalArgs.push(arg);
    }
  }

  if (positionalArgs.length < 2) {
    console.error('❌ プロジェクト名と言語コードは必須です');
    process.exit(1);
  }

  const [projectName, languageCode, displayName, description] = positionalArgs;

  return {
    projectName,
    languageCode,
    displayName: displayName || SUPPORTED_LANGUAGES[languageCode] || languageCode,
    description: description || '',
    templateLang: options['template-lang'] || 'en',
    autoTemplate: options['auto-template'] || false,
    skipTest: options['skip-test'] || false,
    skipTopPage: options['skip-top-page'] || false,
    interactive: options.interactive || false
  };
}

/**
 * 言語コードのバリデーション
 */
function validateLanguageCode(languageCode) {
  const errors = [];
  
  if (!languageCode) {
    errors.push('言語コードが指定されていません');
    return errors;
  }
  
  if (!SUPPORTED_LANGUAGES[languageCode]) {
    errors.push(`言語コード "${languageCode}" はサポートされていません`);
    errors.push(`サポート済み言語: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`);
  }
  
  return errors;
}

/**
 * プロジェクトの存在確認とバリデーション
 */
function validateProject(projectName) {
  const errors = [];
  
  if (!projectName) {
    errors.push('プロジェクト名が指定されていません');
    return errors;
  }
  
  const projectPath = path.join(rootDir, 'apps', projectName);
  if (!fs.existsSync(projectPath)) {
    errors.push(`プロジェクト "${projectName}" が見つかりません: ${projectPath}`);
    return errors;
  }
  
  // プロジェクト設定ファイルの存在確認
  const configPath = path.join(projectPath, 'src', 'config', 'project.config.json');
  if (!fs.existsSync(configPath)) {
    errors.push(`プロジェクト設定ファイルが見つかりません: ${configPath}`);
  }
  
  return errors;
}

/**
 * 言語の重複チェック
 */
function checkLanguageDuplication(projectName, languageCode) {
  try {
    const config = loadProjectConfig(projectName);
    
    if (config.basic?.supportedLangs?.includes(languageCode)) {
      return [`言語 "${languageCode}" は既にプロジェクト "${projectName}" でサポートされています`];
    }
    
    return [];
  } catch (error) {
    return [`プロジェクト設定の確認中にエラーが発生しました: ${error.message}`];
  }
}

/**
 * テンプレート言語の確認
 */
function validateTemplateLang(projectName, templateLang) {
  try {
    const config = loadProjectConfig(projectName);
    
    if (!config.basic?.supportedLangs?.includes(templateLang)) {
      return [`テンプレート言語 "${templateLang}" はプロジェクト "${projectName}" でサポートされていません`];
    }
    
    return [];
  } catch (error) {
    return [`テンプレート言語の確認中にエラーが発生しました: ${error.message}`];
  }
}

/**
 * プログレス表示用のヘルパー関数
 */
function showProgress(step, total, message) {
  console.log(`[${step}/${total}] ${message}`);
}

/**
 * プロジェクト設定ファイルを更新する
 */
function updateProjectConfig(projectName, languageCode, displayName, description, backupManager) {
  console.log('  プロジェクト設定ファイルを更新しています...');
  
  try {
    const projectPath = path.join(rootDir, 'apps', projectName);
    const configPath = path.join(projectPath, 'src', 'config', 'project.config.json');
    
    // バックアップを作成
    backupManager.backupFile(configPath);
    
    const config = loadProjectConfig(projectName);
    
    // supportedLangsに言語を追加
    if (!config.basic.supportedLangs.includes(languageCode)) {
      config.basic.supportedLangs.push(languageCode);
      console.log(`  ✅ supportedLangsに "${languageCode}" を追加`);
    }
    
    // languageNamesを更新
    if (!config.languageNames) {
      config.languageNames = {};
    }
    config.languageNames[languageCode] = displayName;
    console.log(`  ✅ 言語表示名を設定: ${languageCode} = "${displayName}"`);
    
    // translationsを更新
    if (!config.translations) {
      config.translations = {};
    }
    
    // 既存の翻訳設定から構造をコピー
    const existingLang = config.basic.supportedLangs.find(lang => lang !== languageCode && config.translations[lang]);
    const template = existingLang ? config.translations[existingLang] : {};
    
    config.translations[languageCode] = {
      displayName: config.translations[config.basic.defaultLang]?.displayName || projectName,
      displayDescription: description || `${displayName}のドキュメントです`,
      categories: template.categories || { guide: 'ガイド' }
    };
    console.log(`  ✅ 翻訳設定を追加`);
    
    // 設定を保存
    saveProjectConfig(projectName, config);
    console.log('  ✅ プロジェクト設定ファイルの更新完了');
    
    return true;
  } catch (error) {
    console.error('  ❌ プロジェクト設定ファイルの更新に失敗しました');
    console.error(`  エラー: ${error.message}`);
    throw error;
  }
}

/**
 * トップページ設定ファイルを更新する
 */
function updateTopPageConfig(languageCode, displayName, skipTopPage = false, backupManager) {
  if (skipTopPage) {
    console.log('  ⏩ トップページ設定の更新をスキップしました');
    return true;
  }
  
  console.log('  トップページ設定ファイルを更新しています...');
  
  try {
    const topPageConfigPath = path.join(rootDir, 'apps', 'top-page', 'src', 'config', 'projects.config.json');
    
    // バックアップを作成
    backupManager.backupFile(topPageConfigPath);
    
    const topPageConfig = JSON.parse(fs.readFileSync(topPageConfigPath, 'utf-8'));
    
    // supportedLangsに言語を追加
    if (!topPageConfig.siteConfig.supportedLangs.includes(languageCode)) {
      topPageConfig.siteConfig.supportedLangs.push(languageCode);
      console.log(`  ✅ トップページのsupportedLangsに "${languageCode}" を追加`);
    }
    
    // 各翻訳コンテンツを更新（基本的な内容で）
    const contentSections = ['siteDescription', 'heroTitle', 'heroDescription'];
    
    for (const section of contentSections) {
      if (topPageConfig.content[section] && !topPageConfig.content[section][languageCode]) {
        // 既存の翻訳から適切なデフォルト値を設定
        const defaultValues = {
          siteDescription: `Astroで構築されたドキュメントサイト`,
          heroTitle: 'ドキュメントハブ',
          heroDescription: '必要なすべてのドキュメントを一箇所で見つけることができます'
        };
        
        topPageConfig.content[section][languageCode] = defaultValues[section] || '';
        console.log(`  ✅ ${section}の翻訳を追加: "${defaultValues[section]}"`);
      }
    }
    
    // 設定を保存
    fs.writeFileSync(topPageConfigPath, JSON.stringify(topPageConfig, null, 2));
    console.log('  ✅ トップページ設定ファイルの更新完了');
    
    return true;
  } catch (error) {
    console.error('  ❌ トップページ設定ファイルの更新に失敗しました');
    console.error(`  エラー: ${error.message}`);
    throw error;
  }
}

/**
 * 言語用ディレクトリ構造を作成する
 */
function createDirectoryStructure(projectName, languageCode, templateLang = 'en', backupManager) {
  console.log('  言語用ディレクトリ構造を作成しています...');
  
  try {
    const config = loadProjectConfig(projectName);
    const projectPath = path.join(rootDir, 'apps', projectName);
    const docsPath = path.join(projectPath, 'src', 'content', 'docs');
    
    let createdDirs = 0;
    let skippedDirs = 0;
    
    // 各バージョンに対してディレクトリを作成
    if (config.versioning?.versions) {
      for (const version of config.versioning.versions) {
        const versionPath = path.join(docsPath, version.id);
        const langPath = path.join(versionPath, languageCode);
        const templatePath = path.join(versionPath, templateLang);
        
        // 言語ディレクトリが既に存在するかチェック
        if (fs.existsSync(langPath)) {
          console.log(`    スキップ: ${version.id}/${languageCode} (既に存在)`);
          skippedDirs++;
          continue;
        }
        
        // テンプレート言語ディレクトリが存在するかチェック
        if (!fs.existsSync(templatePath)) {
          console.log(`    警告: テンプレート ${version.id}/${templateLang} が見つかりません`);
          continue;
        }
        
        // 言語ディレクトリを作成
        fs.mkdirSync(langPath, { recursive: true });
        backupManager.recordCreatedPath(langPath);
        
        // テンプレート言語のカテゴリディレクトリをコピー
        const templateCategories = fs.readdirSync(templatePath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);
        
        for (const category of templateCategories) {
          const categoryPath = path.join(langPath, category);
          fs.mkdirSync(categoryPath, { recursive: true });
          backupManager.recordCreatedPath(categoryPath);
        }
        
        console.log(`    ✅ 作成: ${version.id}/${languageCode} (${templateCategories.length}カテゴリ)`);
        createdDirs++;
      }
    }
    
    console.log(`  ✅ ディレクトリ構造作成完了: ${createdDirs}個作成、${skippedDirs}個スキップ`);
    return { created: createdDirs, skipped: skippedDirs };
    
  } catch (error) {
    console.error('  ❌ ディレクトリ構造の作成に失敗しました');
    console.error(`  エラー: ${error.message}`);
    throw error;
  }
}

/**
 * テンプレートファイルを生成する
 */
function generateTemplateFiles(projectName, languageCode, templateLang = 'en', autoTemplate = false, backupManager) {
  console.log('  テンプレートファイルを生成しています...');
  
  try {
    const config = loadProjectConfig(projectName);
    const projectPath = path.join(rootDir, 'apps', projectName);
    const docsPath = path.join(projectPath, 'src', 'content', 'docs');
    
    let generatedFiles = 0;
    let skippedFiles = 0;
    
    // 各バージョンに対してファイルを生成
    if (config.versioning?.versions) {
      for (const version of config.versioning.versions) {
        const langPath = path.join(docsPath, version.id, languageCode);
        const templatePath = path.join(docsPath, version.id, templateLang);
        
        if (!fs.existsSync(langPath) || !fs.existsSync(templatePath)) {
          continue;
        }
        
        // テンプレート言語のファイル構造を取得
        const categories = fs.readdirSync(templatePath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);
        
        for (const category of categories) {
          const templateCategoryPath = path.join(templatePath, category);
          const langCategoryPath = path.join(langPath, category);
          
          if (!fs.existsSync(langCategoryPath)) {
            continue;
          }
          
          // カテゴリ内のMDXファイルを取得
          const templateFiles = fs.readdirSync(templateCategoryPath)
            .filter(file => file.endsWith('.mdx'))
            .sort();
          
          for (const templateFile of templateFiles) {
            const templateFilePath = path.join(templateCategoryPath, templateFile);
            const langFilePath = path.join(langCategoryPath, templateFile);
            
            // 既にファイルが存在する場合はスキップ
            if (fs.existsSync(langFilePath)) {
              skippedFiles++;
              continue;
            }
            
            // テンプレートファイルの内容を読み取り
            const templateContent = fs.readFileSync(templateFilePath, 'utf-8');
            
            // 基本的なテンプレート化（翻訳が必要な部分にマーカーを付ける）
            const processedContent = templateContent
              .replace(/^title:\s*"([^"]*)"$/gm, `title: "[要翻訳] $1"`)
              .replace(/^description:\s*"([^"]*)"$/gm, `description: "[要翻訳] $1"`)
              .replace(/^(#.*?)$/gm, `[要翻訳] $1`);
            
            // 新しい言語のファイルとして保存
            fs.writeFileSync(langFilePath, processedContent);
            backupManager.recordCreatedPath(langFilePath);
            generatedFiles++;
          }
        }
      }
    }
    
    console.log(`  ✅ テンプレートファイル生成完了: ${generatedFiles}個生成、${skippedFiles}個スキップ`);
    return { generated: generatedFiles, skipped: skippedFiles };
    
  } catch (error) {
    console.error('  ❌ テンプレートファイルの生成に失敗しました');
    console.error(`  エラー: ${error.message}`);
    throw error;
  }
}

/**
 * ビルドテストを実行する
 */
async function runBuildTest(projectName, skipTest = false) {
  if (skipTest) {
    console.log('  ⏩ ビルドテストをスキップしました');
    return { success: true, message: 'テストスキップ' };
  }

  console.log('  ビルドテストを実行しています...');
  
  try {
    console.log('    📦 プロジェクト個別ビルドテストを実行中...');
    
    execSync(`pnpm --filter=apps-${projectName} build`, {
      stdio: ['inherit', 'pipe', 'pipe'],
      timeout: 120000, // 2分タイムアウト
      cwd: rootDir
    });
    
    console.log('    ✅ ビルドテスト成功');
    return { success: true, message: 'ビルドテストが成功しました' };
    
  } catch (error) {
    console.error('    ❌ ビルドテストに失敗しました');
    console.error(`    エラー: ${error.message}`);
    return { success: false, message: `ビルドテストエラー: ${error.message}` };
  }
}

/**
 * 成功レポートを表示する
 */
function showSuccessReport(config, results) {
  console.log('\n🎉 新しい言語の追加が完了しました！\n');
  
  console.log('📋 追加された言語情報:');
  console.log(`  プロジェクト: ${config.projectName}`);
  console.log(`  言語コード: ${config.languageCode}`);
  console.log(`  言語表示名: ${config.displayName}`);
  console.log(`  テンプレート言語: ${config.templateLang}`);
  console.log('');
  
  console.log('📂 作成結果:');
  if (results.directory) {
    console.log(`  ディレクトリ: ${results.directory.created}個作成、${results.directory.skipped}個スキップ`);
  }
  if (results.files) {
    console.log(`  テンプレートファイル: ${results.files.generated}個生成、${results.files.skipped}個スキップ`);
  }
  console.log('');
  
  console.log('🧪 テスト結果:');
  console.log(`  ${results.test.success ? '✅' : '❌'} ${results.test.message}`);
  console.log('');
  
  console.log('🚀 次のステップ:');
  console.log('  1. 開発サーバーを起動:');
  console.log(`     pnpm --filter=apps-${config.projectName} dev`);
  console.log('');
  console.log('  2. ブラウザで新しい言語を確認:');
  console.log(`     http://localhost:4321/docs/${config.projectName}/v1/${config.languageCode}/`);
  console.log('');
  console.log('  3. 生成されたファイルの翻訳:');
  console.log(`     apps/${config.projectName}/src/content/docs/*/\${config.languageCode}/`);
  console.log('     * "[要翻訳]" マーカーが付いた箇所を適切に翻訳してください');
  console.log('');
  console.log('  4. 統合ビルドでテスト:');
  console.log('     pnpm build');
  
  if (!results.test.success) {
    console.log('\n⚠️  警告: ビルドテストが失敗しました。上記のエラーを確認して問題を解決してください。');
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🌐 ドキュメントプロジェクト言語追加スクリプト\n');
  
  // バックアップマネージャーを初期化
  const backupManager = new BackupManager();
  
  // 1. 引数解析
  showProgress(1, 8, '引数を解析しています...');
  const config = parseArguments();
  
  console.log(`プロジェクト: ${config.projectName}`);
  console.log(`追加する言語: ${config.languageCode} (${config.displayName})`);
  console.log(`テンプレート言語: ${config.templateLang}`);
  console.log('');
  
  // 2. バリデーション
  showProgress(2, 8, '入力内容を検証しています...');
  
  const validationErrors = [
    ...validateLanguageCode(config.languageCode),
    ...validateProject(config.projectName),
    ...checkLanguageDuplication(config.projectName, config.languageCode),
    ...validateTemplateLang(config.projectName, config.templateLang)
  ];
  
  if (validationErrors.length > 0) {
    console.error('❌ エラーが発生しました:');
    validationErrors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
  
  console.log('✅ バリデーション完了');
  console.log('');
  
  const results = {};
  let currentStep = 3;
  
  try {
    // 3. プロジェクト設定ファイルの更新
    showProgress(currentStep++, 8, 'プロジェクト設定を更新しています...');
    updateProjectConfig(config.projectName, config.languageCode, config.displayName, config.description, backupManager);
    console.log('✅ プロジェクト設定更新完了');
    console.log('');
    
    // 4. トップページ設定の更新
    showProgress(currentStep++, 8, 'トップページ設定を更新しています...');
    updateTopPageConfig(config.languageCode, config.displayName, config.skipTopPage, backupManager);
    console.log('✅ トップページ設定更新完了');
    console.log('');
    
    // 5. ディレクトリ構造の作成
    showProgress(currentStep++, 8, 'ディレクトリ構造を作成しています...');
    results.directory = createDirectoryStructure(config.projectName, config.languageCode, config.templateLang, backupManager);
    console.log('✅ ディレクトリ構造作成完了');
    console.log('');
    
    // 6. テンプレートファイルの生成
    showProgress(currentStep++, 8, 'テンプレートファイルを生成しています...');
    results.files = generateTemplateFiles(config.projectName, config.languageCode, config.templateLang, config.autoTemplate, backupManager);
    console.log('✅ テンプレートファイル生成完了');
    console.log('');
    
    // 7. ビルドテストの実行
    showProgress(currentStep++, 8, 'ビルドテストを実行しています...');
    results.test = await runBuildTest(config.projectName, config.skipTest);
    console.log('✅ テスト実行完了');
    console.log('');
    
    // 8. 完了レポート
    showProgress(currentStep++, 8, '完了レポートを生成しています...');
    showSuccessReport(config, results);
    
    // バックアップファイルを保存（デバッグ用）
    backupManager.saveBackupFiles();
    
    // 成功時は終了コード0、テスト失敗時は終了コード1
    process.exit(results.test.success ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ 言語追加処理中にエラーが発生しました:', error.message);
    console.error('詳細:', error.stack);
    
    // 自動ロールバックを実行
    console.log('\n🔄 自動ロールバックを開始します...');
    try {
      const rollbackSuccess = await backupManager.rollback();
      
      if (rollbackSuccess) {
        console.log('✅ ロールバック完了 - システムは元の状態に復元されました');
      } else {
        console.log('⚠️  ロールバック部分的成功');
        console.log('\n🔧 手動確認が必要なファイル:');
        console.log(`  - apps/${config.projectName}/src/config/project.config.json`);
        console.log('  - apps/top-page/src/config/projects.config.json');
        console.log(`  - apps/${config.projectName}/src/content/docs/*/\${config.languageCode}/`);
        
        const backupDir = backupManager.saveBackupFiles();
        if (backupDir) {
          console.log(`\n📁 バックアップファイルは以下に保存されました: ${backupDir}`);
        }
      }
      
    } catch (rollbackError) {
      console.error('\n❌ ロールバック処理中にもエラーが発生しました:', rollbackError.message);
      console.log('\n🚨 緊急事態: 手動でシステムを復旧してください');
      console.log('影響を受けた可能性のあるファイル:');
      console.log(`  - apps/${config.projectName}/src/config/project.config.json`);
      console.log('  - apps/top-page/src/config/projects.config.json');
      console.log(`  - apps/${config.projectName}/src/content/docs/*/\${config.languageCode}/`);
      
      // バックアップファイルを保存して復旧の手がかりを提供
      backupManager.saveBackupFiles();
    }
    
    process.exit(1);
  }
}

// エラーハンドリング付きでメイン処理を実行
main().catch(error => {
  console.error('\n❌ 予期しないエラーが発生しました:', error.message);
  console.error('スタックトレース:', error.stack);
  process.exit(1);
});