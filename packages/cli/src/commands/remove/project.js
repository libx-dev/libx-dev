/**
 * remove projectコマンド実装
 *
 * プロジェクトを削除（確認プロンプト付き）
 */

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { createLogger, LOG_LEVELS } from '../../utils/logger.js';
import { getConfigManager } from '../../utils/config.js';
import { createRegistryManager } from '../../utils/registry.js';
import { createBackupManager } from '../../utils/backup.js';

/**
 * remove projectコマンドのメイン処理
 */
export default async function removeProjectCommand(projectId, globalOpts, cmdOpts) {
  const logger = globalOpts.json
    ? createLogger({ jsonMode: true })
    : createLogger({ verbose: globalOpts.verbose });

  if (globalOpts.verbose) {
    logger.setLevel(LOG_LEVELS.DEBUG);
  }

  try {
    logger.info(`プロジェクト削除: ${projectId}`);
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

    // プロジェクト情報を表示
    logger.warn('以下のプロジェクトを削除しようとしています:');
    logger.info(`  ID: ${project.id}`);
    logger.info(`  表示名: ${project.displayName?.en || project.id}`);
    logger.info(`  ドキュメント数: ${project.documents?.length || 0}`);
    logger.info(`  バージョン数: ${project.versions?.length || 0}`);
    logger.info(`  言語数: ${project.languages?.length || 0}`);
    logger.newline();

    // 確認プロンプト
    if (!cmdOpts.force && !globalOpts.yes) {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `本当にプロジェクト "${projectId}" を削除しますか? この操作は取り消せません。`,
          default: false,
        },
      ]);

      if (!answers.confirm) {
        logger.info('削除をキャンセルしました');
        process.exit(0);
      }
    }

    if (globalOpts.dryRun) {
      logger.info('dry-run モード: 以下の変更が実行されます\n');
      logger.info(`プロジェクト "${projectId}" をレジストリから削除`);
      logger.warn('注意: コンテンツファイルは削除されません');
      process.exit(0);
    }

    const backupManager = createBackupManager({
      backupDir: configManager.get('backupDir'),
      projectRoot: configManager.projectRoot,
    });

    backupManager.backupFile(configManager.getRegistryPath());

    // プロジェクトを削除
    registryManager.removeProject(projectId);
    logger.success('プロジェクトをレジストリから削除しました');

    registryManager.save();
    logger.success('レジストリ保存完了');

    logger.separator();
    logger.success(`✨ プロジェクト "${projectId}" の削除が完了しました!`);
    logger.newline();
    logger.warn('⚠️  注意: コンテンツファイル（apps/${projectId}/）は削除されていません。');
    logger.info('必要に応じて手動で削除してください:');
    logger.info(`  rm -rf apps/${projectId}`);

  } catch (error) {
    logger.error(`プロジェクト削除に失敗しました: ${error.message}`);
    if (globalOpts.verbose) logger.error(error.stack);
    process.exit(1);
  }
}
