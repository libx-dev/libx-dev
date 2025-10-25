/**
 * listコマンド実装
 *
 * プロジェクト、ドキュメント、バージョン、言語の一覧表示
 */

import chalk from 'chalk';
import { createLogger, LOG_LEVELS } from '../utils/logger.js';
import { getConfigManager } from '../utils/config.js';
import { createRegistryManager } from '../utils/registry.js';

/**
 * listコマンドの共通処理
 */
export default async function listCommand(entity, globalOpts, cmdOpts) {
  // ロガーの初期化
  const logger = globalOpts.json
    ? createLogger({ jsonMode: true })
    : createLogger({ verbose: globalOpts.verbose });

  if (globalOpts.verbose) {
    logger.setLevel(LOG_LEVELS.DEBUG);
  }

  try {
    // 設定とレジストリマネージャーを初期化
    const configManager = getConfigManager();
    const registryManager = createRegistryManager({
      registryPath: configManager.getRegistryPath(),
      projectRoot: configManager.projectRoot,
    });

    registryManager.load();
    const registry = registryManager.get();

    // エンティティタイプに応じて処理を分岐
    switch (entity) {
      case 'projects':
        await listProjects(registry, cmdOpts, logger, globalOpts.json);
        break;
      case 'docs':
        await listDocs(registry, cmdOpts, logger, globalOpts.json);
        break;
      case 'versions':
        await listVersions(registry, cmdOpts, logger, globalOpts.json);
        break;
      case 'languages':
        await listLanguages(registry, cmdOpts, logger, globalOpts.json);
        break;
      default:
        logger.error(`不明なエンティティタイプ: ${entity}`);
        process.exit(1);
        return; // テスト環境でprocess.exitがモックされている場合のため
    }

    process.exit(0);
    return; // テスト環境でprocess.exitがモックされている場合のため
  } catch (error) {
    logger.error(`一覧表示エラー: ${error.message}`);
    if (globalOpts.verbose) {
      logger.error(error.stack);
    }
    process.exit(1);
    return; // テスト環境でprocess.exitがモックされている場合のため
  }
}

/**
 * プロジェクト一覧を表示
 */
async function listProjects(registry, options, logger, jsonMode) {
  let projects = registry.projects || [];

  // フィルタリング
  if (options.status) {
    projects = projects.filter(p => p.status === options.status);
  }

  if (jsonMode) {
    console.log(JSON.stringify(projects, null, 2));
    return;
  }

  logger.info(chalk.bold(`\n📦 プロジェクト一覧 (${projects.length}件)\n`));

  if (projects.length === 0) {
    logger.warn('プロジェクトが見つかりません');
    return;
  }

  for (const project of projects) {
    const displayName = project.displayName?.ja || project.displayName?.en || project.id;
    const description = project.description?.ja || project.description?.en || '';
    const langCount = project.languages?.length || 0;
    const versionCount = project.versions?.length || 0;
    const docCount = project.documents?.length || 0;

    logger.info(chalk.cyan(`  ${project.id}`) + chalk.gray(` - ${displayName}`));
    if (description) {
      logger.info(chalk.gray(`    ${description}`));
    }
    logger.info(chalk.gray(`    言語: ${langCount}件 | バージョン: ${versionCount}件 | ドキュメント: ${docCount}件`));
    logger.newline();
  }
}

/**
 * ドキュメント一覧を表示
 */
async function listDocs(registry, options, logger, jsonMode) {
  const projectId = options.projectId;
  const project = registry.projects?.find(p => p.id === projectId);

  if (!project) {
    logger.error(`プロジェクトが見つかりません: ${projectId}`);
    process.exit(1);
    return; // テスト環境でprocess.exitがモックされている場合のため
  }

  let docs = project.documents || [];

  // フィルタリング
  if (options.version) {
    docs = docs.filter(d => d.versions?.includes(options.version));
  }

  if (options.lang) {
    docs = docs.filter(d => d.content && d.content[options.lang]);
  }

  if (options.status) {
    docs = docs.filter(d => d.status === options.status);
  }

  if (jsonMode) {
    console.log(JSON.stringify(docs, null, 2));
    return;
  }

  logger.info(chalk.bold(`\n📄 ドキュメント一覧: ${projectId} (${docs.length}件)\n`));

  if (docs.length === 0) {
    logger.warn('ドキュメントが見つかりません');
    return;
  }

  for (const doc of docs) {
    const title = doc.title?.ja || doc.title?.en || doc.slug;
    const versions = doc.versions?.join(', ') || '-';
    const langs = doc.content ? Object.keys(doc.content).join(', ') : '-';

    logger.info(chalk.cyan(`  ${doc.id}`) + chalk.gray(` (${doc.slug})`));
    logger.info(chalk.gray(`    タイトル: ${title}`));
    logger.info(chalk.gray(`    バージョン: ${versions}`));
    logger.info(chalk.gray(`    言語: ${langs}`));
    logger.newline();
  }
}

/**
 * バージョン一覧を表示
 */
async function listVersions(registry, options, logger, jsonMode) {
  const projectId = options.projectId;
  const project = registry.projects?.find(p => p.id === projectId);

  if (!project) {
    logger.error(`プロジェクトが見つかりません: ${projectId}`);
    process.exit(1);
    return; // テスト環境でprocess.exitがモックされている場合のため
  }

  let versions = project.versions || [];

  // フィルタリング
  if (options.status) {
    versions = versions.filter(v => v.status === options.status);
  }

  if (jsonMode) {
    console.log(JSON.stringify(versions, null, 2));
    return;
  }

  logger.info(chalk.bold(`\n📌 バージョン一覧: ${projectId} (${versions.length}件)\n`));

  if (versions.length === 0) {
    logger.warn('バージョンが見つかりません');
    return;
  }

  for (const version of versions) {
    const latestBadge = version.isLatest ? chalk.green(' [最新]') : '';
    const statusBadge = version.status === 'active' ? chalk.green('[active]') :
                        version.status === 'deprecated' ? chalk.yellow('[deprecated]') :
                        chalk.gray('[draft]');

    logger.info(chalk.cyan(`  ${version.id}`) + chalk.gray(` - ${version.name}`) + latestBadge);
    logger.info(chalk.gray(`    ステータス: `) + statusBadge);
    if (version.date) {
      const date = new Date(version.date).toLocaleDateString('ja-JP');
      logger.info(chalk.gray(`    リリース日: ${date}`));
    }
    logger.newline();
  }
}

/**
 * 言語一覧を表示
 */
async function listLanguages(registry, options, logger, jsonMode) {
  const projectId = options.projectId;
  const project = registry.projects?.find(p => p.id === projectId);

  if (!project) {
    logger.error(`プロジェクトが見つかりません: ${projectId}`);
    process.exit(1);
    return; // テスト環境でprocess.exitがモックされている場合のため
  }

  let languages = project.languages || [];

  // フィルタリング
  if (options.status) {
    languages = languages.filter(l => l.status === options.status);
  }

  if (jsonMode) {
    console.log(JSON.stringify(languages, null, 2));
    return;
  }

  logger.info(chalk.bold(`\n🌐 言語一覧: ${projectId} (${languages.length}件)\n`));

  if (languages.length === 0) {
    logger.warn('言語が見つかりません');
    return;
  }

  for (const lang of languages) {
    const defaultBadge = lang.default ? chalk.green(' [デフォルト]') : '';
    const statusBadge = lang.status === 'active' ? chalk.green('[active]') : chalk.gray('[inactive]');
    const fallback = lang.fallback ? ` → ${lang.fallback}` : '';

    logger.info(chalk.cyan(`  ${lang.code}`) + chalk.gray(` - ${lang.displayName}`) + defaultBadge);
    logger.info(chalk.gray(`    ステータス: `) + statusBadge);
    if (fallback) {
      logger.info(chalk.gray(`    フォールバック: ${fallback}`));
    }
    logger.newline();
  }
}
