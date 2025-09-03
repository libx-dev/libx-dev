#!/usr/bin/env node

/**
 * libx-docsからlibx-devへのコンテンツ同期スクリプト
 * 
 * 使用例:
 * node scripts/sync-content.js                    # 全プロジェクト同期
 * node scripts/sync-content.js sample-docs        # 特定プロジェクト同期
 * node scripts/sync-content.js --validate-only    # バリデーションのみ
 * node scripts/sync-content.js --force            # 強制同期（変更検知無視）
 * 
 * このスクリプトは以下の処理を実行します:
 * 1. libx-docsリポジトリからプロジェクトリストを取得
 * 2. 各プロジェクトのconfig.jsonを読み込み
 * 3. コンテンツ構造のバリデーション
 * 4. 変更検知と同期の必要性判定
 * 5. libx-devへのコンテンツ同期
 * 6. 設定ファイルの更新
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import {
  isExcludedDirectory,
  validateProjectStructure,
  calculateDirectoryHash,
  loadConfig,
  saveConfig,
  getLatestCommitHash,
  copyDirectory,
  removeDirectory,
  projectExistsInLibxDev,
  displayValidationIssues,
  benchmarkHashCalculation
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
    validateOnly: false,
    force: false,
    verbose: false,
    dryRun: false,
    contentHash: false,
    benchmark: false
  };

  for (const arg of args) {
    if (arg === '--validate-only') {
      options.validateOnly = true;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--content-hash') {
      options.contentHash = true;
    } else if (arg === '--benchmark') {
      options.benchmark = true;
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
libx-docs コンテンツ同期ツール

使用法:
  node scripts/sync-content.js [project-name] [options]

引数:
  project-name     同期対象のプロジェクト名（省略時は全プロジェクト）

オプション:
  --validate-only  バリデーションのみ実行（同期は行わない）
  --force          変更検知を無視して強制同期
  --content-hash   ファイル内容もハッシュに含めて変更検知（より正確だが低速）
  --benchmark      ハッシュ計算のパフォーマンステストを実行
  --verbose        詳細ログを出力
  --dry-run        実際の変更は行わず、実行予定の操作を表示
  --help, -h       このヘルプを表示

例:
  node scripts/sync-content.js
  node scripts/sync-content.js sample-docs
  node scripts/sync-content.js --validate-only
  node scripts/sync-content.js sample-docs --force --verbose
  node scripts/sync-content.js sample-docs --content-hash
`);
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
 * 単一プロジェクトを処理
 * @param {string} projectName プロジェクト名
 * @param {Object} options 処理オプション
 * @returns {Promise<Object>} 処理結果
 */
async function processProject(projectName, options) {
  const projectPath = path.join(libxDocsPath, projectName);
  const configPath = path.join(projectPath, 'config.json');
  
  console.log(`\\n📁 プロジェクト: ${projectName}`);
  
  // 1. config.jsonを読み込み
  const config = await loadConfig(configPath);
  if (!config) {
    return {
      success: false,
      error: 'config.jsonの読み込みに失敗しました',
      projectName
    };
  }
  
  if (options.verbose) {
    console.log(`   📋 設定読み込み完了: ${config.supportedLangs.length}言語, ${config.versions.length}バージョン`);
  }
  
  // 2. プロジェクト構造のバリデーション
  console.log(`   🔍 構造バリデーション中...`);
  const validation = await validateProjectStructure(
    projectPath,
    config.supportedLangs,
    config.versions
  );
  
  if (!validation.isValid) {
    console.log(`   ❌ バリデーション失敗:`);
    displayValidationIssues(validation.issues);
    
    if (!options.force) {
      return {
        success: false,
        error: 'バリデーション失敗。--forceオプションで強制実行可能です。',
        projectName,
        validation
      };
    } else {
      console.log(`   ⚠️  --forceオプションにより続行します`);
    }
  } else {
    console.log(`   ✅ バリデーション成功`);
  }
  
  // バリデーションのみモードの場合はここで終了
  if (options.validateOnly) {
    return {
      success: validation.isValid,
      projectName,
      validation,
      action: 'validate-only'
    };
  }
  
  // 3. ベンチマーク実行（オプション）
  if (options.benchmark) {
    console.log(`   🔧 パフォーマンステスト実行中...`);
    const benchmarkResult = await benchmarkHashCalculation(projectPath, options.verbose);
    
    console.log(`   📊 ベンチマーク結果:`);
    console.log(`      構造のみ: ${benchmarkResult.structureOnly.time}ms`);
    console.log(`      内容込み: ${benchmarkResult.withContent.time}ms`);
    console.log(`      性能差: ${benchmarkResult.comparison.timesSlower.toFixed(2)}倍遅い`);
    console.log(`      対象ファイル: ${benchmarkResult.structureOnly.fileCount}個`);
    
    return {
      success: true,
      projectName,
      action: 'benchmark',
      benchmarkResult
    };
  }

  // 4. 変更検知
  if (options.verbose && options.contentHash) {
    console.log(`   🔍 ファイル内容も含めた詳細な変更検知を実行中...`);
  }
  
  const currentHash = await calculateDirectoryHash(projectPath, options.contentHash);
  const needsSync = options.force || 
                   !config.syncMetadata?.contentHash || 
                   config.syncMetadata.contentHash !== currentHash;
  
  if (!needsSync) {
    console.log(`   ✅ 変更なし - 同期スキップ`);
    return {
      success: true,
      projectName,
      action: 'no-changes'
    };
  }
  
  console.log(`   📥 同期が必要です`);
  
  if (options.dryRun) {
    console.log(`   🎭 DRY-RUN: 以下の操作を実行予定:`);
    console.log(`      - libx-devへのコンテンツコピー`);
    console.log(`      - プロジェクト設定の更新`);
    if (!(await projectExistsInLibxDev(rootDir, projectName))) {
      console.log(`      - 新規プロジェクトの作成`);
    }
    return {
      success: true,
      projectName,
      action: 'dry-run'
    };
  }
  
  // 5. libx-devでの処理
  const syncResult = await syncToLibxDev(projectName, config, projectPath, options);
  
  // 6. 同期メタデータの更新
  if (syncResult.success) {
    config.lastUpdated = new Date().toISOString();
    config.syncMetadata = {
      lastSyncCommit: getLatestCommitHash(libxDocsPath),
      lastSyncTime: new Date().toISOString(),
      contentHash: currentHash
    };
    
    await saveConfig(configPath, config);
    console.log(`   ✅ 同期完了`);
  }
  
  return {
    success: syncResult.success,
    projectName,
    action: syncResult.success ? 'synced' : 'failed',
    error: syncResult.error,
    validation
  };
}

/**
 * libx-devに同期
 * @param {string} projectName プロジェクト名
 * @param {Object} config プロジェクト設定
 * @param {string} sourcePath libx-docsのプロジェクトパス
 * @param {Object} options オプション
 * @returns {Promise<Object>} 同期結果
 */
async function syncToLibxDev(projectName, config, sourcePath, options) {
  const libxDevProjectPath = path.join(rootDir, 'apps', projectName);
  
  try {
    // プロジェクトが存在しない場合は作成
    const projectExists = await projectExistsInLibxDev(rootDir, projectName);
    
    if (!projectExists) {
      console.log(`   🆕 新規プロジェクト作成中...`);
      
      // create-project.jsスクリプトを実行
      const displayNameEn = config.displayName.en || projectName;
      const displayNameJa = config.displayName.ja || projectName;
      
      try {
        execSync(
          `node scripts/create-project.js "${projectName}" "${displayNameEn}" "${displayNameJa}" --skip-test`,
          { cwd: rootDir, stdio: options.verbose ? 'inherit' : 'pipe' }
        );
        console.log(`   ✅ プロジェクト作成完了`);
      } catch (error) {
        return {
          success: false,
          error: `プロジェクト作成エラー: ${error.message}`
        };
      }
    }
    
    // コンテンツディレクトリの同期
    const libxDevContentPath = path.join(libxDevProjectPath, 'src', 'content', 'docs');
    
    console.log(`   📋 コンテンツ同期中...`);
    
    // 既存のコンテンツを削除
    await removeDirectory(libxDevContentPath);
    
    // 新しいコンテンツをコピー
    const syncSuccess = await copyDirectory(sourcePath, libxDevContentPath);
    
    if (!syncSuccess) {
      return {
        success: false,
        error: 'コンテンツコピーに失敗しました'
      };
    }
    
    // config.jsonファイルは除外（libx-dev側では不要）
    const configInContent = path.join(libxDevContentPath, 'config.json');
    try {
      await fs.unlink(configInContent);
    } catch {
      // ファイルが存在しない場合は無視
    }
    
    // プロジェクト設定ファイルの更新
    console.log(`   ⚙️  プロジェクト設定更新中...`);
    
    const updateConfigResult = await updateLibxDevProjectConfig(
      libxDevProjectPath,
      config,
      options
    );
    
    if (!updateConfigResult.success) {
      return updateConfigResult;
    }
    
    // トップページ設定の更新
    const updateTopPageResult = await updateTopPageConfig(config, options);
    
    if (!updateTopPageResult.success) {
      console.warn(`   ⚠️  トップページ設定更新に失敗: ${updateTopPageResult.error}`);
      // トップページ設定の失敗は致命的ではないので続行
    }
    
    return { success: true };
    
  } catch (error) {
    return {
      success: false,
      error: `同期処理エラー: ${error.message}`
    };
  }
}

/**
 * libx-devプロジェクトの設定ファイルを更新
 * @param {string} projectPath プロジェクトパス
 * @param {Object} config プロジェクト設定
 * @param {Object} options オプション
 * @returns {Promise<Object>} 更新結果
 */
async function updateLibxDevProjectConfig(projectPath, config, options) {
  const projectConfigPath = path.join(projectPath, 'src', 'config', 'project.config.json');
  
  try {
    // 既存の設定を読み込み（存在する場合）
    let existingConfig = {};
    try {
      const existingContent = await fs.readFile(projectConfigPath, 'utf8');
      existingConfig = JSON.parse(existingContent);
    } catch {
      // 既存設定がない場合は空オブジェクトを使用
    }
    
    // 新しい設定を構築
    const newConfig = {
      basic: {
        baseUrl: config.baseUrl,
        supportedLangs: config.supportedLangs,
        defaultLang: config.defaultLang
      },
      languageNames: {},
      translations: {},
      versioning: {
        versions: config.versions.map(versionId => {
          const existingVersion = existingConfig.versioning?.versions?.find(v => v.id === versionId);
          return {
            id: versionId,
            name: existingVersion?.name || `Version ${versionId.replace('v', '')}`,
            date: existingVersion?.date || new Date().toISOString(),
            isLatest: versionId === config.latestVersion
          };
        })
      }
    };
    
    // 言語名の設定
    const languageNameMap = {
      'en': 'English',
      'ja': '日本語',
      'ko': '한국어',
      'zh-Hans': '简体中文',
      'zh-Hant': '繁體中文',
      'es': 'Español',
      'pt-BR': 'Português (Brasil)',
      'de': 'Deutsch',
      'fr': 'Français',
      'ru': 'Русский',
      'ar': 'العربية',
      'id': 'Bahasa Indonesia',
      'tr': 'Türkçe',
      'hi': 'हिन्दी',
      'vi': 'Tiếng Việt'
    };
    
    for (const lang of config.supportedLangs) {
      newConfig.languageNames[lang] = languageNameMap[lang] || lang.toUpperCase();
    }
    
    // 翻訳設定
    for (const lang of config.supportedLangs) {
      newConfig.translations[lang] = {
        displayName: config.displayName[lang] || config.displayName.en,
        displayDescription: config.description[lang] || config.description.en,
        categories: {}
      };
      
      // カテゴリ翻訳
      for (const [categoryKey, categoryTranslations] of Object.entries(config.categories || {})) {
        newConfig.translations[lang].categories[categoryKey] = 
          categoryTranslations[lang] || categoryTranslations.en || categoryKey;
      }
    }
    
    // 設定を保存
    await fs.mkdir(path.dirname(projectConfigPath), { recursive: true });
    await fs.writeFile(projectConfigPath, JSON.stringify(newConfig, null, 2), 'utf8');
    
    if (options.verbose) {
      console.log(`      ✅ project.config.json更新完了`);
    }
    
    return { success: true };
    
  } catch (error) {
    return {
      success: false,
      error: `プロジェクト設定更新エラー: ${error.message}`
    };
  }
}

/**
 * トップページ設定を更新
 * @param {Object} config プロジェクト設定
 * @param {Object} options オプション
 * @returns {Promise<Object>} 更新結果
 */
async function updateTopPageConfig(config, options) {
  const topPageConfigPath = path.join(rootDir, 'apps', 'top-page', 'src', 'config', 'projects.config.json');
  
  try {
    const topPageConfig = await loadConfig(topPageConfigPath);
    if (!topPageConfig) {
      return {
        success: false,
        error: 'トップページ設定ファイルの読み込みに失敗'
      };
    }
    
    // プロジェクト装飾設定を更新または追加
    if (!topPageConfig.projectDecorations) {
      topPageConfig.projectDecorations = {};
    }
    
    topPageConfig.projectDecorations[config.projectName] = {
      icon: config.icon || 'file-text',
      tags: config.tags || ['documentation'],
      isNew: topPageConfig.projectDecorations[config.projectName]?.isNew || false
    };
    
    const saveSuccess = await saveConfig(topPageConfigPath, topPageConfig);
    
    if (options.verbose && saveSuccess) {
      console.log(`      ✅ トップページ設定更新完了`);
    }
    
    return { success: saveSuccess };
    
  } catch (error) {
    return {
      success: false,
      error: `トップページ設定更新エラー: ${error.message}`
    };
  }
}

/**
 * メイン処理
 */
async function main() {
  const options = parseArguments();
  
  console.log('🔄 libx-docs コンテンツ同期を開始します\\n');
  
  if (options.validateOnly) {
    console.log('🔍 バリデーションモード');
  }
  
  if (options.dryRun) {
    console.log('🎭 DRY-RUNモード - 実際の変更は行いません');
  }
  
  // libx-docsディレクトリの存在確認
  try {
    await fs.access(libxDocsPath);
  } catch {
    console.error(`❌ libx-docsディレクトリが見つかりません: ${libxDocsPath}`);
    process.exit(1);
  }
  
  // 処理対象プロジェクトの決定
  let projectsToProcess;
  
  if (options.projectName) {
    // 指定されたプロジェクトが存在するかチェック
    const projectPath = path.join(libxDocsPath, options.projectName);
    try {
      await fs.access(projectPath);
      projectsToProcess = [options.projectName];
    } catch {
      console.error(`❌ 指定されたプロジェクトが見つかりません: ${options.projectName}`);
      process.exit(1);
    }
  } else {
    projectsToProcess = await getProjectList();
  }
  
  console.log(`📋 処理対象: ${projectsToProcess.length}個のプロジェクト`);
  if (options.verbose) {
    console.log(`   プロジェクト: ${projectsToProcess.join(', ')}`);
  }
  
  // 各プロジェクトを処理
  const results = [];
  
  for (const projectName of projectsToProcess) {
    const result = await processProject(projectName, options);
    results.push(result);
  }
  
  // 結果サマリーを表示
  console.log('\\n📊 処理結果サマリー:');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`   ✅ 成功: ${successful.length}個`);
  console.log(`   ❌ 失敗: ${failed.length}個`);
  
  if (successful.length > 0) {
    console.log('\\n✅ 成功したプロジェクト:');
    for (const result of successful) {
      console.log(`   - ${result.projectName}: ${result.action || 'synced'}`);
    }
  }
  
  if (failed.length > 0) {
    console.log('\\n❌ 失敗したプロジェクト:');
    for (const result of failed) {
      console.log(`   - ${result.projectName}: ${result.error}`);
    }
    process.exit(1);
  }
  
  console.log('\\n🎉 同期処理が完了しました！');
}

// スクリプト実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`\\n💥 予期しないエラーが発生しました:`, error);
    process.exit(1);
  });
}