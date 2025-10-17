/**
 * add versionコマンド実装
 *
 * 既存プロジェクトに新バージョンを追加
 */

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { createLogger, LOG_LEVELS } from '../../utils/logger.js';
import { getConfigManager } from '../../utils/config.js';
import { createRegistryManager } from '../../utils/registry.js';
import { createBackupManager } from '../../utils/backup.js';

/**
 * バージョンID形式を検証
 */
function validateVersionId(versionId) {
  if (!/^v\d+(\.\d+)*$/.test(versionId)) {
    return 'バージョンIDは v1, v2.0, v2.1 のような形式である必要があります';
  }
  return true;
}

/**
 * 前バージョンからコンテンツをコピー
 */
async function copyFromPreviousVersion(projectId, newVersionId, previousVersionId, languages, projectRoot, logger) {
  logger.progress(`前バージョン ${previousVersionId} からコンテンツをコピー中...`);

  const projectPath = path.join(projectRoot, 'apps', projectId);
  let copiedCount = 0;

  for (const lang of languages) {
    const prevContentDir = path.join(projectPath, 'src', 'content', 'docs', previousVersionId, lang);
    const newContentDir = path.join(projectPath, 'src', 'content', 'docs', newVersionId, lang);

    if (fs.existsSync(prevContentDir)) {
      try {
        // ディレクトリを作成
        fs.mkdirSync(newContentDir, { recursive: true });

        // ファイルを再帰的にコピー
        copyDirectoryRecursive(prevContentDir, newContentDir);
        copiedCount++;
        logger.debug(`  ✓ ${lang}: コピー完了`);
      } catch (error) {
        logger.warn(`  ⚠ ${lang}: コピー中にエラーが発生しました - ${error.message}`);
      }
    } else {
      // 空のディレクトリを作成
      fs.mkdirSync(newContentDir, { recursive: true });
      logger.debug(`  ✓ ${lang}: 空のディレクトリを作成`);
    }
  }

  logger.progressDone(`${copiedCount}/${languages.length} 言語のコンテンツをコピーしました`);
}

/**
 * ディレクトリを再帰的にコピー
 */
function copyDirectoryRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * 空のディレクトリ構造を作成
 */
function createEmptyDirectories(projectId, versionId, languages, projectRoot, logger) {
  logger.progress(`バージョン ${versionId} のディレクトリ構造を作成中...`);

  const projectPath = path.join(projectRoot, 'apps', projectId);

  for (const lang of languages) {
    const contentDir = path.join(projectPath, 'src', 'content', 'docs', versionId, lang);
    fs.mkdirSync(contentDir, { recursive: true });
    logger.debug(`  ✓ ${lang}: ${contentDir}`);
  }

  logger.progressDone(`${languages.length} 言語のディレクトリを作成しました`);
}

/**
 * バージョン情報を対話式で取得
 */
async function getVersionInfo(projectId, versionId, cmdOpts, project, logger) {
  const nonInteractive = cmdOpts.yes || process.env.DOCS_CLI_NON_INTERACTIVE === 'true';

  // バージョン名
  let versionName = cmdOpts.name;
  if (!versionName) {
    if (nonInteractive) {
      versionName = `Version ${versionId.replace('v', '')}`;
    } else {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'versionName',
          message: 'バージョンの表示名を入力してください:',
          default: `Version ${versionId.replace('v', '')}`,
        },
      ]);
      versionName = answers.versionName;
    }
  }

  // 前バージョンからのコピー
  let copyFromPrevious = cmdOpts.copyFrom;
  let previousVersionId = null;

  const latestVersion = project.versions.find(v => v.isLatest);

  if (!copyFromPrevious && latestVersion && !cmdOpts.noCopy) {
    if (nonInteractive) {
      copyFromPrevious = true;
      previousVersionId = latestVersion.id;
    } else {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'copyFromPrevious',
          message: `前バージョン (${latestVersion.id}) からコンテンツをコピーしますか?`,
          default: true,
        },
      ]);
      copyFromPrevious = answers.copyFromPrevious;
      if (copyFromPrevious) {
        previousVersionId = latestVersion.id;
      }
    }
  } else if (copyFromPrevious && typeof copyFromPrevious === 'string') {
    previousVersionId = copyFromPrevious;
  }

  // 最新バージョンとして設定するか
  let setAsLatest = cmdOpts.setLatest !== undefined ? cmdOpts.setLatest : true;
  if (!nonInteractive && cmdOpts.setLatest === undefined) {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'setAsLatest',
        message: 'このバージョンを最新として設定しますか?',
        default: true,
      },
    ]);
    setAsLatest = answers.setAsLatest;
  }

  return {
    versionName,
    copyFromPrevious,
    previousVersionId,
    setAsLatest,
  };
}

/**
 * add versionコマンドのメイン処理
 */
export default async function addVersionCommand(projectId, versionId, globalOpts, cmdOpts) {
  // ロガーの初期化
  const logger = globalOpts.json
    ? createLogger({ jsonMode: true })
    : createLogger({ verbose: globalOpts.verbose });

  if (globalOpts.verbose) {
    logger.setLevel(LOG_LEVELS.DEBUG);
  }

  try {
    logger.info(`バージョン追加: ${projectId} / ${versionId}`);
    logger.separator();

    // バージョンIDのバリデーション
    const validationResult = validateVersionId(versionId);
    if (validationResult !== true) {
      logger.error(validationResult);
      process.exit(1);
    }

    // 設定とマネージャーの初期化
    const configManager = getConfigManager();
    const registryManager = createRegistryManager({
      registryPath: configManager.getRegistryPath(),
      projectRoot: configManager.projectRoot,
    });

    registryManager.load();

    // プロジェクト存在チェック
    const project = registryManager.findProject(projectId);
    if (!project) {
      logger.error(`プロジェクト "${projectId}" が見つかりません`);
      logger.info('利用可能なプロジェクト一覧を確認するには: pnpm docs-cli list projects');
      process.exit(1);
    }

    // バージョン重複チェック
    if (project.versions.find(v => v.id === versionId)) {
      logger.error(`バージョン "${versionId}" は既に存在します`);
      process.exit(1);
    }

    // バージョン情報を取得
    const versionInfo = await getVersionInfo(projectId, versionId, cmdOpts, project, logger);

    // dry-runチェック
    if (globalOpts.dryRun) {
      logger.info('dry-run モード: 以下の変更が実行されます\n');
      logger.info('バージョン情報:');
      logger.info(`  ID: ${versionId}`);
      logger.info(`  表示名: ${versionInfo.versionName}`);
      logger.info(`  最新版として設定: ${versionInfo.setAsLatest ? 'はい' : 'いいえ'}`);
      if (versionInfo.copyFromPrevious) {
        logger.info(`  コピー元: ${versionInfo.previousVersionId}`);
      }
      process.exit(0);
    }

    // バックアップマネージャーの初期化
    const backupManager = createBackupManager({
      backupDir: configManager.get('backupDir'),
      projectRoot: configManager.projectRoot,
    });

    // レジストリファイルをバックアップ
    backupManager.backupFile(configManager.getRegistryPath());

    // 既存の最新バージョンを更新
    if (versionInfo.setAsLatest) {
      project.versions.forEach(v => {
        if (v.isLatest) {
          v.isLatest = false;
          logger.debug(`既存の最新バージョン ${v.id} の isLatest を false に更新`);
        }
      });
    }

    // 新しいバージョンエントリを作成
    const version = {
      id: versionId,
      name: versionInfo.versionName,
      isLatest: versionInfo.setAsLatest,
      status: 'active',
      date: new Date().toISOString(),
    };

    // レジストリに追加
    registryManager.addVersion(projectId, version);
    logger.success(`レジストリに追加: ${versionId}`);

    // ディレクトリ構造の作成
    const languages = project.languages.map(l => l.code);

    if (versionInfo.copyFromPrevious && versionInfo.previousVersionId) {
      await copyFromPreviousVersion(
        projectId,
        versionId,
        versionInfo.previousVersionId,
        languages,
        configManager.projectRoot,
        logger
      );
      backupManager.recordCreated(
        path.join(configManager.projectRoot, 'apps', projectId, 'src', 'content', 'docs', versionId)
      );
    } else {
      createEmptyDirectories(projectId, versionId, languages, configManager.projectRoot, logger);
      backupManager.recordCreated(
        path.join(configManager.projectRoot, 'apps', projectId, 'src', 'content', 'docs', versionId)
      );
    }

    // レジストリを保存
    registryManager.save();
    logger.success('レジストリ保存完了');

    logger.separator();
    logger.success(`✨ バージョン "${versionId}" の追加が完了しました!`);
    logger.info(`\n次のステップ:`);
    logger.info(`  1. pnpm docs-cli list versions ${projectId} - バージョン一覧を確認`);
    logger.info(`  2. pnpm docs-cli add doc ${projectId} <slug> - ドキュメントを追加`);
    logger.info(`  3. pnpm docs-cli validate - レジストリの検証`);

  } catch (error) {
    logger.error(`バージョン追加に失敗しました: ${error.message}`);

    if (globalOpts.verbose) {
      logger.error(error.stack);
    }

    // ロールバック処理は呼び出し側（CLI本体）で行う
    process.exit(1);
  }
}
