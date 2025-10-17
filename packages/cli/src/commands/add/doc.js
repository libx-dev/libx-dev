/**
 * add docコマンド実装
 *
 * 新しいドキュメントを追加
 */

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { createLogger, LOG_LEVELS } from '../../utils/logger.js';
import { getConfigManager } from '../../utils/config.js';
import { createRegistryManager } from '../../utils/registry.js';
import { createBackupManager } from '../../utils/backup.js';

/**
 * スラッグをバリデーション
 */
function validateSlug(slug) {
  if (!/^[a-z0-9-/]+$/.test(slug)) {
    return 'スラッグは小文字英数字、ハイフン、スラッシュのみ使用できます';
  }
  return true;
}

/**
 * スラッグからファイル名を生成
 */
function slugToFilename(slug) {
  return slug.replace(/\//g, '-');
}

/**
 * MDXテンプレートを生成
 */
function generateMdxTemplate(docId, title, lang, metadata = {}) {
  const {
    summary = '',
    keywords = [],
    tags = [],
    category = '',
  } = metadata;

  return `---
title: "${title}"
summary: "${summary}"
docId: "${docId}"
lang: "${lang}"
${keywords.length > 0 ? `keywords: [${keywords.map(k => `"${k}"`).join(', ')}]` : ''}
${tags.length > 0 ? `tags: [${tags.map(t => `"${t}"`).join(', ')}]` : ''}
${category ? `category: "${category}"` : ''}
---

# ${title}

ここにコンテンツを記述してください。
`;
}

/**
 * MDXファイルを作成
 */
function createMdxFile(filePath, content, logger) {
  const dir = path.dirname(filePath);

  // ディレクトリが存在しない場合は作成
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // ファイルが既に存在する場合は警告
  if (fs.existsSync(filePath)) {
    logger.warn(`ファイルが既に存在します: ${filePath}`);
    return false;
  }

  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    logger.debug(`MDXファイル作成: ${filePath}`);
    return true;
  } catch (error) {
    throw new Error(`MDXファイルの作成に失敗しました: ${error.message}`);
  }
}

/**
 * ドキュメント情報を対話式で取得
 */
async function getDocumentInfo(projectId, slug, cmdOpts, project, logger) {
  const nonInteractive = cmdOpts.yes || process.env.DOCS_CLI_NON_INTERACTIVE === 'true';

  // バージョンを決定
  let targetVersion = cmdOpts.version;
  if (!targetVersion || targetVersion === 'latest') {
    const latestVersion = project.versions.find(v => v.isLatest);
    targetVersion = latestVersion?.id || project.versions[0]?.id;
  }

  // バージョンの存在確認
  const version = project.versions.find(v => v.id === targetVersion);
  if (!version) {
    throw new Error(`バージョン "${targetVersion}" が見つかりません`);
  }

  // タイトルを取得
  const titles = {};
  for (const lang of project.languages) {
    const langCode = lang.code;
    const optionKey = `title${langCode === 'en' ? 'En' : langCode === 'ja' ? 'Ja' : ''}`; // titleEn, titleJa

    let title = cmdOpts[optionKey];

    if (!title) {
      if (nonInteractive) {
        // スラッグから自動生成
        title = slug
          .split('/')
          .pop()
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      } else {
        const answer = await inquirer.prompt([
          {
            type: 'input',
            name: 'title',
            message: `ドキュメントタイトル (${langCode}):`,
            default: slug
              .split('/')
              .pop()
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '),
          },
        ]);
        title = answer.title;
      }
    }

    titles[langCode] = title;
  }

  // サマリーを取得
  let summary = cmdOpts.summary || '';
  if (!summary && !nonInteractive) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'summary',
        message: 'ドキュメントの概要 (省略可):',
        default: '',
      },
    ]);
    summary = answer.summary;
  }

  // カテゴリを取得
  let categoryId = cmdOpts.category;
  if (!categoryId && project.categories && project.categories.length > 0 && !nonInteractive) {
    const choices = [
      { name: 'なし', value: null },
      ...project.categories.map(cat => ({
        name: `${cat.id} - ${cat.displayName?.en || cat.id}`,
        value: cat.id,
      })),
    ];

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'categoryId',
        message: 'カテゴリを選択してください:',
        choices,
        default: null,
      },
    ]);
    categoryId = answer.categoryId;
  }

  // キーワードとタグ
  const keywords = cmdOpts.keywords ? cmdOpts.keywords.split(',').map(k => k.trim()) : [];
  const tags = cmdOpts.tags ? cmdOpts.tags.split(',').map(t => t.trim()) : [];

  return {
    targetVersion: version.id,
    titles,
    summary,
    categoryId,
    keywords,
    tags,
  };
}

/**
 * add docコマンドのメイン処理
 */
export default async function addDocCommand(projectId, slug, globalOpts, cmdOpts) {
  // ロガーの初期化
  const logger = globalOpts.json
    ? createLogger({ jsonMode: true })
    : createLogger({ verbose: globalOpts.verbose });

  if (globalOpts.verbose) {
    logger.setLevel(LOG_LEVELS.DEBUG);
  }

  try {
    logger.info(`ドキュメント追加: ${projectId} / ${slug}`);
    logger.separator();

    // スラッグのバリデーション
    const validationResult = validateSlug(slug);
    if (validationResult !== true) {
      logger.error(validationResult);
      process.exit(1);
    }

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
    }

    // ドキュメント情報を取得
    const docInfo = await getDocumentInfo(projectId, slug, cmdOpts, project, logger);

    // 次のドキュメントIDを生成
    const docId = registryManager.getNextDocId(projectId);
    logger.debug(`生成されたドキュメントID: ${docId}`);

    // dry-runチェック
    if (globalOpts.dryRun) {
      logger.info('dry-run モード: 以下の変更が実行されます\n');
      logger.info('ドキュメント情報:');
      logger.info(`  ドキュメントID: ${docId}`);
      logger.info(`  スラッグ: ${slug}`);
      logger.info(`  対象バージョン: ${docInfo.targetVersion}`);
      logger.info(`  タイトル:`);
      Object.entries(docInfo.titles).forEach(([lang, title]) => {
        logger.info(`    ${lang}: ${title}`);
      });
      if (docInfo.summary) {
        logger.info(`  概要: ${docInfo.summary}`);
      }
      if (docInfo.categoryId) {
        logger.info(`  カテゴリ: ${docInfo.categoryId}`);
      }
      process.exit(0);
    }

    // バックアップマネージャーの初期化
    const backupManager = createBackupManager({
      backupDir: configManager.get('backupDir'),
      projectRoot: configManager.projectRoot,
    });

    // レジストリファイルをバックアップ
    backupManager.backupFile(configManager.getRegistryPath());

    // 新しいドキュメントエントリを作成
    const document = {
      id: docId,
      slug: slug,
      title: docInfo.titles,
      summary: docInfo.summary || '',
      versions: [docInfo.targetVersion],
      content: {},
      ...(docInfo.keywords.length > 0 && { keywords: docInfo.keywords }),
      ...(docInfo.tags.length > 0 && { tags: docInfo.tags }),
      status: 'draft',
      visibility: 'public',
      lastUpdated: new Date().toISOString(),
    };

    // 各言語のコンテンツパスを設定
    const projectPath = path.join(configManager.projectRoot, 'apps', projectId);
    const filename = slugToFilename(slug);

    for (const lang of project.languages) {
      const langCode = lang.code;
      const contentPath = `${docInfo.targetVersion}/${langCode}/${filename}.mdx`;
      const fullPath = path.join(projectPath, 'src', 'content', 'docs', contentPath);

      document.content[langCode] = {
        path: contentPath,
        status: 'draft',
        lastUpdated: new Date().toISOString(),
      };

      // MDXファイルを作成
      const mdxContent = generateMdxTemplate(
        docId,
        docInfo.titles[langCode] || docInfo.titles.en || slug,
        langCode,
        {
          summary: docInfo.summary,
          keywords: docInfo.keywords,
          tags: docInfo.tags,
          category: docInfo.categoryId,
        }
      );

      createMdxFile(fullPath, mdxContent, logger);
      backupManager.recordCreated(fullPath);
      logger.debug(`  ✓ ${langCode}: ${contentPath}`);
    }

    // レジストリに追加
    registryManager.addDocument(projectId, document);
    logger.success(`レジストリに追加: ${docId}`);

    // カテゴリに追加
    if (docInfo.categoryId) {
      const category = project.categories?.find(c => c.id === docInfo.categoryId);
      if (category) {
        if (!category.docs) {
          category.docs = {};
        }
        if (!category.docs[docId]) {
          category.docs[docId] = {
            order: Object.keys(category.docs).length + 1,
          };
        }
        logger.success(`カテゴリに追加: ${docInfo.categoryId}`);
      }
    }

    // レジストリを保存
    registryManager.save();
    logger.success('レジストリ保存完了');

    logger.separator();
    logger.success(`✨ ドキュメント "${docId}" の追加が完了しました!`);
    logger.info(`\n作成されたファイル:`);
    for (const lang of project.languages) {
      const contentPath = document.content[lang.code].path;
      logger.info(`  ${lang.code}: apps/${projectId}/src/content/docs/${contentPath}`);
    }
    logger.info(`\n次のステップ:`);
    logger.info(`  1. 作成されたMDXファイルを編集してコンテンツを追加`);
    logger.info(`  2. pnpm docs-cli list docs ${projectId} - ドキュメント一覧を確認`);
    logger.info(`  3. pnpm docs-cli validate - レジストリの検証`);

  } catch (error) {
    logger.error(`ドキュメント追加に失敗しました: ${error.message}`);

    if (globalOpts.verbose) {
      logger.error(error.stack);
    }

    process.exit(1);
  }
}
