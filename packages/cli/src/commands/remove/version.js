/**
 * remove versionコマンド実装
 *
 * プロジェクトからバージョンを削除（確認プロンプト付き）
 */

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { createLogger, LOG_LEVELS } from '../../utils/logger.js';
import { getConfigManager } from '../../utils/config.js';
import { createRegistryManager } from '../../utils/registry.js';
import { createBackupManager } from '../../utils/backup.js';

/**
 * コンテンツディレクトリを削除
 */
function deleteContentDirectory(projectId, versionId, projectRoot, logger) {
  const contentDir = path.join(projectRoot, 'apps', projectId, 'src', 'content', 'docs', versionId);

  if (!fs.existsSync(contentDir)) {
    logger.warn(`コンテンツディレクトリが見つかりません: ${contentDir}`);
    return false;
  }

  try {
    fs.rmSync(contentDir, { recursive: true, force: true });
    logger.success(`コンテンツディレクトリを削除しました: ${contentDir}`);
    return true;
  } catch (error) {
    logger.error(`コンテンツディレクトリの削除に失敗しました: ${error.message}`);
    return false;
  }
}

/**
 * remove versionコマンドのメイン処理
 */
export default async function removeVersionCommand(projectId, versionId, globalOpts, cmdOpts) {
  const logger = globalOpts.json
    ? createLogger({ jsonMode: true })
    : createLogger({ verbose: globalOpts.verbose });

  if (globalOpts.verbose) {
    logger.setLevel(LOG_LEVELS.DEBUG);
  }

  try {
    logger.info(`バージョン削除: ${projectId} / ${versionId}`);
    logger.separator();

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
      process.exit(1);
    }

    // バージョン存在チェック
    const version = project.versions?.find(v => v.id === versionId);
    if (!version) {
      logger.error(`バージョン "${versionId}" が見つかりません`);
      process.exit(1);
    }

    // バージョン情報を表示
    logger.warn('以下のバージョンを削除しようとしています:');
    logger.info(`  プロジェクト: ${project.displayName?.en || project.id}`);
    logger.info(`  バージョンID: ${version.id}`);
    logger.info(`  表示名: ${version.name || version.id}`);
    logger.info(`  最新版: ${version.isLatest ? 'はい' : 'いいえ'}`);
    logger.info(`  ステータス: ${version.status || 'active'}`);
    logger.newline();

    // 確認プロンプト
    if (!cmdOpts.force && !globalOpts.yes) {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `本当にバージョン "${versionId}" を削除しますか? この操作は取り消せません。`,
          default: false,
        },
      ]);

      if (!answers.confirm) {
        logger.info('削除をキャンセルしました');
        process.exit(0);
      }
    }

    // コンテンツ削除の確認
    let deleteContent = cmdOpts.deleteContent;
    if (deleteContent === undefined && !globalOpts.yes) {
      const contentAnswers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'deleteContent',
          message: 'コンテンツファイルも削除しますか?',
          default: false,
        },
      ]);
      deleteContent = contentAnswers.deleteContent;
    }

    if (globalOpts.dryRun) {
      logger.info('dry-run モード: 以下の変更が実行されます\n');
      logger.info(`バージョン "${versionId}" をレジストリから削除`);
      if (deleteContent) {
        logger.info(`コンテンツディレクトリを削除: apps/${projectId}/src/content/docs/${versionId}/`);
      } else {
        logger.warn('注意: コンテンツファイルは削除されません');
      }
      process.exit(0);
    }

    const backupManager = createBackupManager({
      backupDir: configManager.get('backupDir'),
      projectRoot: configManager.projectRoot,
    });

    backupManager.backupFile(configManager.getRegistryPath());

    // バージョンを削除
    registryManager.removeVersion(projectId, versionId);
    logger.success('バージョンをレジストリから削除しました');

    // コンテンツディレクトリを削除
    if (deleteContent) {
      deleteContentDirectory(projectId, versionId, configManager.projectRoot, logger);
    }

    registryManager.save();
    logger.success('レジストリ保存完了');

    logger.separator();
    logger.success(`✨ バージョン "${versionId}" の削除が完了しました!`);

    if (!deleteContent) {
      logger.newline();
      logger.warn(`⚠️  注意: コンテンツファイル（apps/${projectId}/src/content/docs/${versionId}/）は削除されていません。`);
      logger.info('必要に応じて手動で削除してください:');
      logger.info(`  rm -rf apps/${projectId}/src/content/docs/${versionId}`);
    }

  } catch (error) {
    logger.error(`バージョン削除に失敗しました: ${error.message}`);
    if (globalOpts.verbose) logger.error(error.stack);
    process.exit(1);
  }
}
