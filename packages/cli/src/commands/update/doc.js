/**
 * update docコマンド実装
 *
 * ドキュメントメタデータを更新
 */

import { createLogger, LOG_LEVELS } from '../../utils/logger.js';
import { getConfigManager } from '../../utils/config.js';
import { createRegistryManager } from '../../utils/registry.js';
import { createBackupManager } from '../../utils/backup.js';

/**
 * update docコマンドのメイン処理
 */
export default async function updateDocCommand(projectId, docId, globalOpts, cmdOpts) {
  const logger = globalOpts.json
    ? createLogger({ jsonMode: true })
    : createLogger({ verbose: globalOpts.verbose });

  if (globalOpts.verbose) {
    logger.setLevel(LOG_LEVELS.DEBUG);
  }

  try {
    logger.info(`ドキュメント更新: ${projectId} / ${docId}`);
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
    }

    const document = registryManager.findDocument(projectId, docId);
    if (!document) {
      logger.error(`ドキュメント "${docId}" が見つかりません`);
      process.exit(1);
    }

    const updates = {};

    // タイトル更新
    if (cmdOpts.titleEn !== undefined || cmdOpts.titleJa !== undefined) {
      updates.title = { ...document.title };
      if (cmdOpts.titleEn !== undefined) updates.title.en = cmdOpts.titleEn;
      if (cmdOpts.titleJa !== undefined) updates.title.ja = cmdOpts.titleJa;
    }

    // その他のフィールド
    if (cmdOpts.summary !== undefined) updates.summary = cmdOpts.summary;
    if (cmdOpts.status !== undefined) {
      if (!['draft', 'published', 'archived'].includes(cmdOpts.status)) {
        throw new Error('ステータスは "draft", "published", または "archived" である必要があります');
      }
      updates.status = cmdOpts.status;
    }
    if (cmdOpts.visibility !== undefined) {
      if (!['public', 'private'].includes(cmdOpts.visibility)) {
        throw new Error('可視性は "public" または "private" である必要があります');
      }
      updates.visibility = cmdOpts.visibility;
    }

    // キーワードとタグ
    if (cmdOpts.keywords !== undefined) {
      updates.keywords = cmdOpts.keywords.split(',').map(k => k.trim());
    }
    if (cmdOpts.tags !== undefined) {
      updates.tags = cmdOpts.tags.split(',').map(t => t.trim());
    }

    if (Object.keys(updates).length === 0) {
      logger.warn('更新する項目がありません');
      process.exit(0);
    }

    // lastUpdatedを自動更新
    updates.lastUpdated = new Date().toISOString();

    if (globalOpts.dryRun) {
      logger.info('dry-run モード: 以下の変更が実行されます\n');
      logger.info('更新内容:');
      Object.entries(updates).forEach(([key, value]) => {
        if (typeof value === 'object' && !Array.isArray(value)) {
          logger.info(`  ${key}:`);
          Object.entries(value).forEach(([subKey, subValue]) => {
            logger.info(`    ${subKey}: ${subValue}`);
          });
        } else {
          logger.info(`  ${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
        }
      });
      process.exit(0);
    }

    const backupManager = createBackupManager({
      backupDir: configManager.get('backupDir'),
      projectRoot: configManager.projectRoot,
    });

    backupManager.backupFile(configManager.getRegistryPath());

    registryManager.updateDocument(projectId, docId, updates);
    logger.success('ドキュメントを更新しました');

    registryManager.save();
    logger.success('レジストリ保存完了');

    logger.separator();
    logger.success(`✨ ドキュメント "${docId}" の更新が完了しました!`);

  } catch (error) {
    logger.error(`ドキュメント更新に失敗しました: ${error.message}`);
    if (globalOpts.verbose) logger.error(error.stack);
    process.exit(1);
  }
}
