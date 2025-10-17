/**
 * remove docコマンド実装
 *
 * ドキュメントを削除（確認プロンプト付き）
 */

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { createLogger, LOG_LEVELS } from '../../utils/logger.js';
import { getConfigManager } from '../../utils/config.js';
import { createRegistryManager } from '../../utils/registry.js';
import { createBackupManager } from '../../utils/backup.js';

/**
 * スラッグからファイル名を生成（接頭辞なし）
 */
function slugToFilename(slug) {
  return `${slug}.mdx`;
}

/**
 * 全バージョン・全言語のドキュメントファイルを削除
 */
function deleteDocumentFiles(projectId, slug, versions, languages, projectRoot, logger) {
  const projectPath = path.join(projectRoot, 'apps', projectId);
  let deletedCount = 0;
  let totalAttempts = 0;

  logger.progress('ドキュメントファイルを削除中...');

  for (const version of versions) {
    for (const lang of languages) {
      const filename = slugToFilename(slug);
      const filePath = path.join(projectPath, 'src', 'content', 'docs', version.id, lang, filename);

      totalAttempts++;

      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          logger.debug(`  ✓ ${version.id}/${lang}: ${filename} を削除`);
          deletedCount++;
        } catch (error) {
          logger.warn(`  ⚠ ${version.id}/${lang}: 削除中にエラーが発生しました - ${error.message}`);
        }
      } else {
        logger.debug(`  - ${version.id}/${lang}: ファイルが存在しません`);
      }
    }
  }

  logger.progressDone(`${deletedCount}/${totalAttempts} ファイルを削除しました`);
}

/**
 * remove docコマンドのメイン処理
 */
export default async function removeDocCommand(projectId, slug, globalOpts, cmdOpts) {
  const logger = globalOpts.json
    ? createLogger({ jsonMode: true })
    : createLogger({ verbose: globalOpts.verbose });

  if (globalOpts.verbose) {
    logger.setLevel(LOG_LEVELS.DEBUG);
  }

  try {
    logger.info(`ドキュメント削除: ${projectId} / ${slug}`);
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

    // ドキュメント存在チェック
    const document = project.documents?.find(d => d.slug === slug);
    if (!document) {
      logger.error(`ドキュメント "${slug}" が見つかりません`);
      process.exit(1);
    }

    // ドキュメント情報を表示
    logger.warn('以下のドキュメントを削除しようとしています:');
    logger.info(`  プロジェクト: ${project.displayName?.en || project.id}`);
    logger.info(`  スラッグ: ${document.slug}`);
    logger.info(`  ドキュメントID: ${document.id || document.docId || 'なし'}`);
    logger.info(`  タイトル: ${document.title?.en || document.slug}`);
    logger.info(`  ステータス: ${document.status || 'draft'}`);
    logger.info(`  影響を受けるファイル数: ${(project.versions?.length || 0) * (project.languages?.length || 0)}`);
    logger.newline();

    // 確認プロンプト
    if (!cmdOpts.force && !globalOpts.yes) {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `本当にドキュメント "${slug}" を削除しますか? この操作は取り消せません。`,
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
      logger.info(`ドキュメント "${slug}" をレジストリから削除`);
      if (deleteContent) {
        const filename = slugToFilename(slug);
        logger.info(`全バージョン・全言語のコンテンツファイルを削除: apps/${projectId}/src/content/docs/*/*/${filename}`);
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

    // ドキュメントを削除
    registryManager.removeDocument(projectId, slug);
    logger.success('ドキュメントをレジストリから削除しました');

    // コンテンツファイルを削除
    if (deleteContent) {
      const languages = project.languages.map(l => l.code);
      deleteDocumentFiles(projectId, slug, project.versions, languages, configManager.projectRoot, logger);
    }

    registryManager.save();
    logger.success('レジストリ保存完了');

    logger.separator();
    logger.success(`✨ ドキュメント "${slug}" の削除が完了しました!`);

    if (!deleteContent) {
      const filename = slugToFilename(slug);
      logger.newline();
      logger.warn(`⚠️  注意: コンテンツファイル（apps/${projectId}/src/content/docs/*/*/${filename}）は削除されていません。`);
      logger.info('必要に応じて手動で削除してください:');
      logger.info(`  find apps/${projectId}/src/content/docs -name "${filename}" -delete`);
    }

  } catch (error) {
    logger.error(`ドキュメント削除に失敗しました: ${error.message}`);
    if (globalOpts.verbose) logger.error(error.stack);
    process.exit(1);
  }
}
