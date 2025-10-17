/**
 * initコマンド実装
 *
 * 設定ファイルを初期化
 */

import inquirer from 'inquirer';
import { createLogger, LOG_LEVELS } from '../utils/logger.js';
import { getConfigManager, generateConfigTemplate } from '../utils/config.js';

export default async function initCommand(globalOpts, cmdOpts) {
  const logger = createLogger({ verbose: globalOpts.verbose });

  if (globalOpts.verbose) {
    logger.setLevel(LOG_LEVELS.DEBUG);
  }

  try {
    logger.info('docs-cli 設定ファイルを初期化します');
    logger.separator();

    const configManager = getConfigManager();

    // 既存の設定ファイルがある場合は確認
    if (configManager.exists()) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: '設定ファイルは既に存在します。上書きしますか?',
          default: false,
        },
      ]);

      if (!overwrite) {
        logger.info('初期化をキャンセルしました');
        process.exit(0);
      }
    }

    // 設定テンプレートを生成
    const template = generateConfigTemplate();

    // 対話式で設定値を取得
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'registryPath',
        message: 'レジストリファイルのパス:',
        default: template.registryPath,
      },
      {
        type: 'input',
        name: 'projectRoot',
        message: 'プロジェクトルートディレクトリ:',
        default: template.projectRoot,
      },
      {
        type: 'input',
        name: 'contentRoot',
        message: 'コンテンツルートディレクトリ:',
        default: template.contentRoot,
      },
      {
        type: 'input',
        name: 'defaultLang',
        message: 'デフォルト言語:',
        default: template.defaultLang,
      },
      {
        type: 'number',
        name: 'backupRotation',
        message: 'バックアップ保持数:',
        default: template.backupRotation,
      },
    ]);

    // 設定を保存
    const config = {
      ...template,
      ...answers,
    };

    configManager.save(config);

    logger.success(`設定ファイルを作成しました: ${configManager.configPath}`);
    logger.separator();

    process.exit(0);
  } catch (error) {
    logger.error(`設定ファイルの初期化に失敗しました: ${error.message}`);
    if (globalOpts.verbose) {
      logger.error(error.stack);
    }
    process.exit(1);
  }
}
