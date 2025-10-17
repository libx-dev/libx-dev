/**
 * update languageコマンド実装
 *
 * 言語設定を更新
 */

import { createLogger, LOG_LEVELS } from '../../utils/logger.js';
import { getConfigManager } from '../../utils/config.js';
import { createRegistryManager } from '../../utils/registry.js';
import { createBackupManager } from '../../utils/backup.js';

/**
 * update languageコマンドのメイン処理
 */
export default async function updateLanguageCommand(projectId, langCode, globalOpts, cmdOpts) {
  const logger = globalOpts.json
    ? createLogger({ jsonMode: true })
    : createLogger({ verbose: globalOpts.verbose });

  if (globalOpts.verbose) {
    logger.setLevel(LOG_LEVELS.DEBUG);
  }

  try {
    logger.info(`言語更新: ${projectId} / ${langCode}`);
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

    const language = project.languages.find(l => l.code === langCode);
    if (!language) {
      logger.error(`言語 "${langCode}" が見つかりません`);
      process.exit(1);
    }

    const updates = {};
    if (cmdOpts.displayName !== undefined) updates.displayName = cmdOpts.displayName;
    if (cmdOpts.status !== undefined) {
      if (!['active', 'inactive'].includes(cmdOpts.status)) {
        throw new Error('ステータスは "active" または "inactive" である必要があります');
      }
      updates.status = cmdOpts.status;
    }
    if (cmdOpts.fallback !== undefined) {
      // フォールバック言語の存在確認
      if (!project.languages.find(l => l.code === cmdOpts.fallback)) {
        throw new Error(`フォールバック言語 "${cmdOpts.fallback}" が見つかりません`);
      }
      updates.fallback = cmdOpts.fallback;
    }

    if (cmdOpts.setDefault) {
      // 既存のデフォルト言語を更新
      project.languages.forEach(l => {
        if (l.default) l.default = false;
      });
      language.default = true;
    }

    if (Object.keys(updates).length === 0 && !cmdOpts.setDefault) {
      logger.warn('更新する項目がありません');
      process.exit(0);
    }

    if (globalOpts.dryRun) {
      logger.info('dry-run モード: 以下の変更が実行されます\n');
      logger.info('更新内容:');
      Object.entries(updates).forEach(([key, value]) => {
        logger.info(`  ${key}: ${value}`);
      });
      if (cmdOpts.setDefault) {
        logger.info(`  default: true`);
      }
      process.exit(0);
    }

    const backupManager = createBackupManager({
      backupDir: configManager.get('backupDir'),
      projectRoot: configManager.projectRoot,
    });

    backupManager.backupFile(configManager.getRegistryPath());

    Object.assign(language, updates);
    logger.success('言語を更新しました');

    registryManager.save();
    logger.success('レジストリ保存完了');

    logger.separator();
    logger.success(`✨ 言語 "${langCode}" の更新が完了しました!`);

  } catch (error) {
    logger.error(`言語更新に失敗しました: ${error.message}`);
    if (globalOpts.verbose) logger.error(error.stack);
    process.exit(1);
  }
}
