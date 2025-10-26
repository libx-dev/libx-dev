/**
 * add projectコマンド実装
 *
 * 新規プロジェクトをレジストリに追加
 */

import inquirer from 'inquirer';
import { createLogger, LOG_LEVELS } from '../../utils/logger.js';
import { getConfigManager } from '../../utils/config.js';
import { createRegistryManager } from '../../utils/registry.js';
import { createBackupManager } from '../../utils/backup.js';

/**
 * add projectコマンドのメイン処理
 */
export default async function addProjectCommand(projectId, globalOpts, cmdOpts) {
  // ロガーの初期化
  const logger = globalOpts.json
    ? createLogger({ jsonMode: true })
    : createLogger({ verbose: globalOpts.verbose });

  if (globalOpts.verbose) {
    logger.setLevel(LOG_LEVELS.DEBUG);
  }

  // バックアップマネージャーの初期化
  const configManager = getConfigManager();
  const backupManager = createBackupManager({
    backupDir: configManager.get('backupDir'),
    projectRoot: configManager.projectRoot,
  });

  try {
    logger.info(`新規プロジェクト追加: ${projectId}`);
    logger.separator();

    // プロジェクトIDのバリデーション
    if (!/^[a-z0-9-]+$/.test(projectId)) {
      logger.error('プロジェクトIDは小文字英数字とハイフンのみ使用できます');
      process.exit(1);
      return; // テスト環境でprocess.exitがモックされている場合のため
    }

    // レジストリマネージャーの初期化
    const registryManager = createRegistryManager({
      registryPath: configManager.getRegistryPath(),
      projectRoot: configManager.projectRoot,
    });

    registryManager.load();

    // 既存チェック
    if (registryManager.findProject(projectId)) {
      logger.error(`プロジェクト "${projectId}" は既に存在します`);
      process.exit(1);
      return; // テスト環境でprocess.exitがモックされている場合のため
    }

    // 対話式でプロジェクト情報を取得
    // 注意: dry-runモードでも情報は取得する
    const projectInfo = await getProjectInfo(projectId, cmdOpts, configManager, logger, globalOpts);

    // dry-runチェック
    if (globalOpts.dryRun) {
      logger.info('dry-run モード: 以下の変更が実行されます\n');
      logger.info(JSON.stringify(projectInfo, null, 2));
      process.exit(0);
      return; // テスト環境でprocess.exitがモックされている場合のため
    }

    // レジストリファイルをバックアップ
    backupManager.backupFile(configManager.getRegistryPath());

    // プロジェクトエントリを作成
    const project = {
      id: projectId,
      displayName: {
        en: projectInfo.displayNameEn,
        ja: projectInfo.displayNameJa,
      },
      description: {
        en: projectInfo.descriptionEn,
        ja: projectInfo.descriptionJa,
      },
      languages: projectInfo.languages.map((code, index) => ({
        code,
        displayName: getLanguageDisplayName(code),
        status: 'active',
        default: index === 0,
        ...(index > 0 && { fallback: projectInfo.languages[0] }),
      })),
      versions: [
        {
          id: 'v1',
          name: 'Version 1.0',
          isLatest: true,
          status: 'active',
          date: new Date().toISOString(),
        },
      ],
      documents: [],
      categories: [],
    };

    // レジストリに追加
    registryManager.addProject(project);
    registryManager.save();

    logger.success('レジストリにプロジェクトを追加しました');

    // プロジェクトディレクトリを作成（今後の実装で拡張）
    logger.info('プロジェクトディレクトリ作成は今後実装予定です');

    logger.separator();
    logger.success(`プロジェクト "${projectId}" の追加が完了しました！`);

    process.exit(0);
    return; // テスト環境でprocess.exitがモックされている場合のため
  } catch (error) {
    logger.error(`プロジェクト追加エラー: ${error.message}`);

    if (globalOpts.verbose) {
      logger.error(error.stack);
    }

    // ロールバック
    logger.warn('ロールバックを実行します...');
    await backupManager.rollback();

    process.exit(1);
    return; // テスト環境でprocess.exitがモックされている場合のため
  }
}

/**
 * プロジェクト情報を対話式で取得
 */
async function getProjectInfo(projectId, cmdOpts, configManager, logger, globalOpts = {}) {
  const nonInteractive = configManager.isNonInteractive() || cmdOpts.yes || globalOpts.yes || globalOpts.dryRun;

  // 対話式でない場合はオプションから取得
  if (nonInteractive) {
    return {
      displayNameEn: cmdOpts.displayNameEn || projectId,
      displayNameJa: cmdOpts.displayNameJa || projectId,
      descriptionEn: cmdOpts.descriptionEn || `Documentation for ${projectId}`,
      descriptionJa: cmdOpts.descriptionJa || `${projectId}のドキュメント`,
      languages: (cmdOpts.languages || 'en,ja').split(',').map(l => l.trim()),
    };
  }

  // 対話式で情報を取得
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'displayNameEn',
      message: '英語表示名:',
      default: cmdOpts.displayNameEn || projectId,
    },
    {
      type: 'input',
      name: 'displayNameJa',
      message: '日本語表示名:',
      default: cmdOpts.displayNameJa || projectId,
    },
    {
      type: 'input',
      name: 'descriptionEn',
      message: '英語説明文:',
      default: cmdOpts.descriptionEn || `Documentation for ${projectId}`,
    },
    {
      type: 'input',
      name: 'descriptionJa',
      message: '日本語説明文:',
      default: cmdOpts.descriptionJa || `${projectId}のドキュメント`,
    },
    {
      type: 'input',
      name: 'languages',
      message: 'サポート言語 (カンマ区切り):',
      default: cmdOpts.languages || 'en,ja',
      filter: (input) => input.split(',').map(l => l.trim()),
    },
  ]);

  return answers;
}

/**
 * 言語コードから表示名を取得
 */
function getLanguageDisplayName(code) {
  const languageNames = {
    en: 'English',
    ja: '日本語',
    'zh-Hans': '简体中文',
    'zh-Hant': '繁體中文',
    es: 'Español',
    'pt-BR': 'Português (Brasil)',
    ko: '한국어',
    de: 'Deutsch',
    fr: 'Français',
    ru: 'Русский',
    ar: 'العربية',
    id: 'Bahasa Indonesia',
    tr: 'Türkçe',
    hi: 'हिन्दी',
    vi: 'Tiếng Việt',
  };

  return languageNames[code] || code;
}
