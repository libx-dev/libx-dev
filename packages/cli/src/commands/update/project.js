/**
 * update projectコマンド実装
 *
 * プロジェクトメタデータを更新
 */

import inquirer from 'inquirer';
import { createLogger, LOG_LEVELS } from '../../utils/logger.js';
import { getConfigManager } from '../../utils/config.js';
import { createRegistryManager } from '../../utils/registry.js';
import { createBackupManager } from '../../utils/backup.js';

/**
 * 更新内容を対話式で取得
 */
async function getUpdateInfo(project, cmdOpts, logger) {
  const nonInteractive = cmdOpts.yes || process.env.DOCS_CLI_NON_INTERACTIVE === 'true';
  const updates = {};

  // 更新するフィールドをチェック
  const hasUpdates = cmdOpts.displayNameEn || cmdOpts.displayNameJa ||
                     cmdOpts.descriptionEn || cmdOpts.descriptionJa ||
                     cmdOpts.status;

  if (!hasUpdates && nonInteractive) {
    throw new Error('非対話モードでは少なくとも1つのオプションを指定してください');
  }

  // 表示名の更新
  if (cmdOpts.displayNameEn !== undefined) {
    updates.displayNameEn = cmdOpts.displayNameEn;
  }
  if (cmdOpts.displayNameJa !== undefined) {
    updates.displayNameJa = cmdOpts.displayNameJa;
  }

  // 説明文の更新
  if (cmdOpts.descriptionEn !== undefined) {
    updates.descriptionEn = cmdOpts.descriptionEn;
  }
  if (cmdOpts.descriptionJa !== undefined) {
    updates.descriptionJa = cmdOpts.descriptionJa;
  }

  // ステータスの更新
  if (cmdOpts.status !== undefined) {
    if (!['active', 'archived'].includes(cmdOpts.status)) {
      throw new Error('ステータスは "active" または "archived" である必要があります');
    }
    updates.status = cmdOpts.status;
  }

  // 対話式で更新内容を確認
  if (!nonInteractive && Object.keys(updates).length === 0) {
    logger.info('現在の設定:');
    logger.info(`  表示名 (en): ${project.displayName?.en || 'なし'}`);
    logger.info(`  表示名 (ja): ${project.displayName?.ja || 'なし'}`);
    logger.info(`  説明 (en): ${project.description?.en || 'なし'}`);
    logger.info(`  説明 (ja): ${project.description?.ja || 'なし'}`);
    logger.info(`  ステータス: ${project.status || 'active'}`);
    logger.newline();

    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'updateDisplayName',
        message: '表示名を更新しますか?',
        default: false,
      },
    ]);

    if (answers.updateDisplayName) {
      const nameAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'displayNameEn',
          message: '英語表示名:',
          default: project.displayName?.en,
        },
        {
          type: 'input',
          name: 'displayNameJa',
          message: '日本語表示名:',
          default: project.displayName?.ja,
        },
      ]);
      updates.displayNameEn = nameAnswers.displayNameEn;
      updates.displayNameJa = nameAnswers.displayNameJa;
    }

    const descAnswers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'updateDescription',
        message: '説明文を更新しますか?',
        default: false,
      },
    ]);

    if (descAnswers.updateDescription) {
      const descDetails = await inquirer.prompt([
        {
          type: 'input',
          name: 'descriptionEn',
          message: '英語説明文:',
          default: project.description?.en,
        },
        {
          type: 'input',
          name: 'descriptionJa',
          message: '日本語説明文:',
          default: project.description?.ja,
        },
      ]);
      updates.descriptionEn = descDetails.descriptionEn;
      updates.descriptionJa = descDetails.descriptionJa;
    }

    const statusAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'status',
        message: 'ステータスを更新しますか?',
        choices: [
          { name: '変更しない', value: null },
          { name: 'active', value: 'active' },
          { name: 'archived', value: 'archived' },
        ],
        default: null,
      },
    ]);

    if (statusAnswers.status) {
      updates.status = statusAnswers.status;
    }
  }

  return updates;
}

/**
 * update projectコマンドのメイン処理
 */
export default async function updateProjectCommand(projectId, globalOpts, cmdOpts) {
  // ロガーの初期化
  const logger = globalOpts.json
    ? createLogger({ jsonMode: true })
    : createLogger({ verbose: globalOpts.verbose });

  if (globalOpts.verbose) {
    logger.setLevel(LOG_LEVELS.DEBUG);
  }

  try {
    logger.info(`プロジェクト更新: ${projectId}`);
    logger.separator();

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
      return; // テスト環境でprocess.exitがモックされている場合のため
    }

    // 更新内容を取得
    const updates = await getUpdateInfo(project, cmdOpts, logger);

    if (Object.keys(updates).length === 0) {
      logger.warn('更新する項目がありません');
      process.exit(0);
      return; // テスト環境でprocess.exitがモックされている場合のため
    }

    // dry-runチェック
    if (globalOpts.dryRun) {
      logger.info('dry-run モード: 以下の変更が実行されます\n');
      logger.info('更新内容:');
      Object.entries(updates).forEach(([key, value]) => {
        logger.info(`  ${key}: ${value}`);
      });
      process.exit(0);
      return; // テスト環境でprocess.exitがモックされている場合のため
    }

    // バックアップマネージャーの初期化
    const backupManager = createBackupManager({
      backupDir: configManager.get('backupDir'),
      projectRoot: configManager.projectRoot,
    });

    // レジストリファイルをバックアップ
    backupManager.backupFile(configManager.getRegistryPath());

    // プロジェクトを更新
    const projectUpdates = {};

    if (updates.displayNameEn !== undefined || updates.displayNameJa !== undefined) {
      projectUpdates.displayName = { ...project.displayName };
      if (updates.displayNameEn !== undefined) {
        projectUpdates.displayName.en = updates.displayNameEn;
      }
      if (updates.displayNameJa !== undefined) {
        projectUpdates.displayName.ja = updates.displayNameJa;
      }
    }

    if (updates.descriptionEn !== undefined || updates.descriptionJa !== undefined) {
      projectUpdates.description = { ...project.description };
      if (updates.descriptionEn !== undefined) {
        projectUpdates.description.en = updates.descriptionEn;
      }
      if (updates.descriptionJa !== undefined) {
        projectUpdates.description.ja = updates.descriptionJa;
      }
    }

    if (updates.status !== undefined) {
      projectUpdates.status = updates.status;
    }

    registryManager.updateProject(projectId, projectUpdates);
    logger.success('プロジェクトを更新しました');

    // レジストリを保存
    registryManager.save();
    logger.success('レジストリ保存完了');

    logger.separator();
    logger.success(`✨ プロジェクト "${projectId}" の更新が完了しました!`);
    logger.info(`\n次のステップ:`);
    logger.info(`  1. pnpm docs-cli list projects - プロジェクト一覧を確認`);
    logger.info(`  2. pnpm docs-cli validate - レジストリの検証`);

  } catch (error) {
    logger.error(`プロジェクト更新に失敗しました: ${error.message}`);

    if (globalOpts.verbose) {
      logger.error(error.stack);
    }

    process.exit(1);
    return; // テスト環境でprocess.exitがモックされている場合のため
  }
}
