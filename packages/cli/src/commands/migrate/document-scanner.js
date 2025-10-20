/**
 * ドキュメントスキャンモジュール
 *
 * MDXファイルをスキャンしてフロントマターを解析し、
 * レジストリ形式のドキュメントデータを生成します。
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';
import matter from 'gray-matter';
import * as logger from '../../utils/logger.js';

/**
 * 番号付きファイルのパターン（例: 01-getting-started.mdx）
 */
const NUMBERED_FILE_PATTERN = /^(\d{2})-(.+)\.mdx$/;

/**
 * ドキュメントをスキャンしてレジストリ形式のドキュメントデータを生成
 *
 * @param {string} projectPath - プロジェクトディレクトリのパス
 * @param {string} projectId - プロジェクトID
 * @param {string} versionId - バージョンID
 * @param {string} lang - 言語コード
 * @param {string[]} supportedLangs - サポート言語リスト
 * @returns {Object[]} ドキュメントデータの配列
 */
export function scanDocuments(projectPath, projectId, versionId, lang, supportedLangs) {
  const contentDir = join(projectPath, 'src/content/docs', versionId, lang);

  if (!existsSync(contentDir)) {
    logger.warn(`コンテンツディレクトリが見つかりません: ${contentDir}`);
    return [];
  }

  logger.info(`ドキュメントをスキャン中: ${contentDir}`);

  const documents = [];
  const categories = readdirSync(contentDir).filter((entry) => {
    const fullPath = join(contentDir, entry);
    return statSync(fullPath).isDirectory();
  });

  for (const categoryDir of categories) {
    const categoryMatch = categoryDir.match(/^(\d{2})-(.+)$/);
    if (!categoryMatch) {
      continue;
    }

    const [, , categoryId] = categoryMatch;
    const categoryPath = join(contentDir, categoryDir);

    const files = readdirSync(categoryPath).filter((file) => file.endsWith('.mdx'));

    for (const file of files) {
      const match = file.match(NUMBERED_FILE_PATTERN);
      if (!match) {
        logger.warn(`  スキップ（番号なし）: ${file}`);
        continue;
      }

      const [, orderStr, docSlug] = match;
      const order = parseInt(orderStr, 10);
      const filePath = join(categoryPath, file);

      // フロントマターを解析
      const { data: frontmatter, content } = parseFrontmatter(filePath);

      // docIdはスラッグ部分（カテゴリなし）
      const docId = docSlug;

      // タイトルと要約を多言語オブジェクトとして構築
      const title = {};
      const summary = {};

      title[lang] = frontmatter.title || toTitleCase(docSlug);
      summary[lang] = frontmatter.description || '';

      // ドキュメントデータを構築
      const docData = {
        id: docId,
        slug: `${categoryId}/${docSlug}`,
        title: title,
        summary: summary,
        versions: [versionId],
        status: frontmatter.draft ? 'draft' : 'published',
        visibility: frontmatter.draft ? 'draft' : 'public',
        keywords: frontmatter.keywords || [],
        tags: frontmatter.tags || [],
        categoryId: categoryId,
        order: order,
        content: {},
      };

      documents.push({
        ...docData,
        _filePath: filePath,
        _relativePath: relative(projectPath, filePath),
        _wordCount: countWords(content),
      });

      logger.info(`  ドキュメント検出: ${docId} (${categoryId}, order: ${order})`);
    }
  }

  logger.success(`ドキュメントスキャン完了: ${documents.length}件`);

  return documents;
}

/**
 * MDXファイルのフロントマターを解析
 *
 * @param {string} filePath - MDXファイルのパス
 * @returns {Object} { data: frontmatter, content: 本文 }
 */
function parseFrontmatter(filePath) {
  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    return matter(fileContent);
  } catch (error) {
    logger.error(`フロントマターの解析に失敗: ${filePath} - ${error.message}`);
    return { data: {}, content: '' };
  }
}

/**
 * 本文の語数をカウント（簡易版）
 *
 * @param {string} content - 本文
 * @returns {number} 語数
 */
function countWords(content) {
  // コードブロックを除外
  const withoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '');
  // インラインコードを除外
  const withoutInlineCode = withoutCodeBlocks.replace(/`[^`]+`/g, '');
  // マークダウン記号を除外
  const withoutMarkdown = withoutInlineCode
    .replace(/[#*_\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 空白で分割して語数をカウント
  return withoutMarkdown ? withoutMarkdown.split(/\s+/).length : 0;
}

/**
 * 文字列をタイトルケースに変換
 *
 * @param {string} str - 変換する文字列
 * @returns {string} タイトルケースに変換された文字列
 */
function toTitleCase(str) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * 全バージョン・全言語のドキュメントをスキャンして統合
 *
 * @param {string} projectPath - プロジェクトディレクトリのパス
 * @param {string} projectId - プロジェクトID
 * @param {string[]} versionIds - バージョンIDの配列
 * @param {string[]} langCodes - 言語コードの配列
 * @returns {Object[]} 統合されたドキュメントデータの配列
 */
export function scanAllDocuments(projectPath, projectId, versionIds, langCodes) {
  logger.info('全バージョン・全言語のドキュメントをスキャン中...');

  const documentMap = new Map();

  // 各バージョン・各言語でスキャン
  for (const versionId of versionIds) {
    for (const lang of langCodes) {
      const documents = scanDocuments(projectPath, projectId, versionId, lang, langCodes);

      for (const doc of documents) {
        const key = doc.id;

        if (!documentMap.has(key)) {
          // 新規ドキュメント
          documentMap.set(key, {
            id: doc.id,
            slug: doc.slug,
            title: doc.title,
            summary: doc.summary,
            versions: [versionId],
            status: doc.status,
            visibility: doc.visibility,
            keywords: doc.keywords,
            tags: doc.tags,
            content: {},
            _categoryId: doc.categoryId,
            _order: doc.order,
            _files: {},
          });
        }

        // ドキュメントデータをマージ
        const existing = documentMap.get(key);

        // タイトル・要約をマージ
        Object.assign(existing.title, doc.title);
        Object.assign(existing.summary, doc.summary);

        // バージョンを追加
        if (!existing.versions.includes(versionId)) {
          existing.versions.push(versionId);
        }

        // ファイル情報を保存（後でコンテンツメタ生成に使用）
        const fileKey = `${versionId}-${lang}`;
        existing._files[fileKey] = {
          path: doc._relativePath,
          filePath: doc._filePath,
          wordCount: doc._wordCount,
        };
      }
    }
  }

  // Map から配列に変換
  const documents = Array.from(documentMap.values());

  logger.success(`ドキュメント統合完了: ${documents.length}件`);

  return documents;
}
