/**
 * remove languageコマンド実装
 *
 * プロジェクトから言語を削除（確認プロンプト付き）
 */

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { createLogger, LOG_LEVELS } from '../../utils/logger.js';
import { getConfigManager } from '../../utils/config.js';
import { createRegistryManager } from '../../utils/registry.js';
import { createBackupManager } from '../../utils/backup.js';

/**
 * 全バージョンの言語コンテンツディレクトリを削除
 */
function deleteLanguageContent(projectId, langCode, versions, projectRoot, logger) {
  const projectPath = path.join(projectRoot, 'apps', projectId);
  let deletedCount = 0;

  for (const version of versions) {
    const langDir = path.join(projectPath, 'src', 'content', 'docs', version.id, langCode);

    if (fs.existsSync(langDir)) {
      try {
        fs.rmSync(langDir, { recursive: true, force: true });
        logger.debug(`  ✓ ${version.id}: 削除完了`);
        deletedCount++;
      } catch (error) {
        logger.warn(`  ⚠ ${version.id}: 削除中にエラーが発生しました - ${error.message}`);
      }
    } else {
      logger.debug(`  - ${version.id}: ディレクトリが存在しません`);
    }
  }

  if (deletedCount > 0) {
    logger.success(`${deletedCount}/${versions.length} バージョンのコンテンツを削除しました`);
  } else {
    logger.warn('削除されたコンテンツディレクトリはありませんでした');
  }
}

/**
 * remove languageコマンドのメイン処理
 */
export default async function removeLanguageCommand(projectId, langCode, globalOpts, cmdOpts) {
  const logger = globalOpts.json
    ? createLogger({ jsonMode: true })
    : createLogger({ verbose: globalOpts.verbose });

  if (globalOpts.verbose) {
    logger.setLevel(LOG_LEVELS.DEBUG);
  }

  try {
    logger.info(`言語削除: ${projectId} / ${langCode}`);
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

    // 言語存在チェック
    const language = project.languages?.find(l => l.code === langCode);
    if (!language) {
      logger.error(`言語 "${langCode}" が見つかりません`);
      process.exit(1);
    }

    // 言語が1つしかない場合は削除を拒否
    if (project.languages.length === 1) {
      logger.error('プロジェクトには最低1つの言語が必要です。最後の言語は削除できません。');
      process.exit(1);
    }

    // 言語情報を表示
    logger.warn('以下の言語を削除しようとしています:');
    logger.info(`  プロジェクト: ${project.displayName?.en || project.id}`);
    logger.info(`  言語コード: ${language.code}`);
    logger.info(`  表示名: ${language.displayName || language.code}`);
    logger.info(`  デフォルト言語: ${language.default ? 'はい' : 'いいえ'}`);
    logger.info(`  ステータス: ${language.status || 'active'}`);
    logger.info(`  影響を受けるバージョン数: ${project.versions?.length || 0}`);
    logger.newline();

    // デフォルト言語の場合は警告
    if (language.default) {
      logger.warn('⚠️  この言語はデフォルト言語です。削除後は別の言語をデフォルトに設定してください。');
      logger.newline();
    }

    // 確認プロンプト
    if (!cmdOpts.force && !globalOpts.yes) {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `本当に言語 "${langCode}" を削除しますか? この操作は取り消せません。`,
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
      logger.info(`言語 "${langCode}" をレジストリから削除`);
      if (deleteContent) {
        logger.info(`全バージョンのコンテンツディレクトリを削除: apps/${projectId}/src/content/docs/*/${langCode}/`);
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

    // 言語を削除
    registryManager.removeLanguage(projectId, langCode);
    logger.success('言語をレジストリから削除しました');

    // コンテンツディレクトリを削除
    if (deleteContent) {
      deleteLanguageContent(projectId, langCode, project.versions, configManager.projectRoot, logger);
    }

    registryManager.save();
    logger.success('レジストリ保存完了');

    logger.separator();
    logger.success(`✨ 言語 "${langCode}" の削除が完了しました!`);

    // デフォルト言語を削除した場合の警告
    if (language.default) {
      logger.newline();
      logger.warn('⚠️  デフォルト言語を削除しました。以下のコマンドで別の言語をデフォルトに設定してください:');
      logger.info(`  pnpm docs-cli update language ${projectId} <lang-code> --set-default`);
    }

    if (!deleteContent) {
      logger.newline();
      logger.warn(`⚠️  注意: コンテンツファイル（apps/${projectId}/src/content/docs/*/${langCode}/）は削除されていません。`);
      logger.info('必要に応じて手動で削除してください:');
      logger.info(`  rm -rf apps/${projectId}/src/content/docs/*/${langCode}`);
    }

  } catch (error) {
    logger.error(`言語削除に失敗しました: ${error.message}`);
    if (globalOpts.verbose) logger.error(error.stack);
    process.exit(1);
  }
}
