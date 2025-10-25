/**
 * update versionコマンド実装
 *
 * バージョンメタデータを更新
 */

import { createLogger, LOG_LEVELS } from '../../utils/logger.js';
import { getConfigManager } from '../../utils/config.js';
import { createRegistryManager } from '../../utils/registry.js';
import { createBackupManager } from '../../utils/backup.js';

/**
 * update versionコマンドのメイン処理
 */
export default async function updateVersionCommand(projectId, versionId, globalOpts, cmdOpts) {
  const logger = globalOpts.json
    ? createLogger({ jsonMode: true })
    : createLogger({ verbose: globalOpts.verbose });

  if (globalOpts.verbose) {
    logger.setLevel(LOG_LEVELS.DEBUG);
  }

  try {
    logger.info(`バージョン更新: ${projectId} / ${versionId}`);
    logger.separator();

    const configManager = getConfigManager();
    const registryManager = createRegistryManager({
      registryPath: configManager.getRegistryPath(),
      projectRoot: configManager.projectRoot,
    });

    registryManager.load();

    const project = registryManager.findProject(projectId);
    if (!project) {
      logger.error(`プロジェクト "${projectId}" が見つかりません`);
      process.exit(1);
      return;
    }

    const version = project.versions.find(v => v.id === versionId);
    if (!version) {
      logger.error(`バージョン "${versionId}" が見つかりません`);
      process.exit(1);
      return;
    }

    const updates = {};
    if (cmdOpts.name !== undefined) updates.name = cmdOpts.name;
    if (cmdOpts.status !== undefined) {
      if (!['active', 'deprecated', 'draft'].includes(cmdOpts.status)) {
        throw new Error('ステータスは "active", "deprecated", または "draft" である必要があります');
      }
      updates.status = cmdOpts.status;
    }

    if (cmdOpts.setLatest !== undefined) {
      if (cmdOpts.setLatest) {
        // 既存の最新バージョンを更新
        project.versions.forEach(v => {
          if (v.isLatest) v.isLatest = false;
        });
        version.isLatest = true;
      } else {
        version.isLatest = false;
      }
    }

    if (Object.keys(updates).length === 0 && cmdOpts.setLatest === undefined) {
      logger.warn('更新する項目がありません');
      process.exit(0);
      return;
    }

    if (globalOpts.dryRun) {
      logger.info('dry-run モード: 以下の変更が実行されます\n');
      logger.info('更新内容:');
      Object.entries(updates).forEach(([key, value]) => {
        logger.info(`  ${key}: ${value}`);
      });
      if (cmdOpts.setLatest !== undefined) {
        logger.info(`  isLatest: ${cmdOpts.setLatest}`);
      }
      process.exit(0);
      return;
    }

    const backupManager = createBackupManager({
      backupDir: configManager.get('backupDir'),
      projectRoot: configManager.projectRoot,
    });

    backupManager.backupFile(configManager.getRegistryPath());

    Object.assign(version, updates);
    logger.success('バージョンを更新しました');

    registryManager.save();
    logger.success('レジストリ保存完了');

    logger.separator();
    logger.success(`✨ バージョン "${versionId}" の更新が完了しました!`);

  } catch (error) {
    logger.error(`バージョン更新に失敗しました: ${error.message}`);
    if (globalOpts.verbose) logger.error(error.stack);
    process.exit(1);
    return;
  }
}
