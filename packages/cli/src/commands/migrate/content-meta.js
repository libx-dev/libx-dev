/**
 * コンテンツメタ生成モジュール
 *
 * ドキュメントの各言語版について、コンテンツメタ情報を生成します。
 * - path: コンテンツファイルの相対パス
 * - status: published / missing / draft / in-review
 * - syncHash: SHA-256ハッシュ
 * - lastUpdated: 最終更新日時
 * - source: リポジトリ情報
 * - reviewer: レビュー担当者
 * - wordCount: 語数（コードブロック除外、本文のみ）
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import * as logger from '../../utils/logger.js';
import { calculateFileHash } from '../../utils/hash.js';
import {
  getLastUpdated,
  getLastCommitter,
  getSourceInfo,
} from '../../utils/git.js';

/**
 * ドキュメントのコンテンツステータスを判定
 *
 * 判定ロジック:
 * 1. ファイルが存在しない → "missing"
 * 2. フロントマターに `inReview: true` → "in-review"
 * 3. フロントマターに `draft: true` → "draft"
 * 4. それ以外 → "published"
 *
 * @param {string} filePath - ファイルパス
 * @param {Object} frontmatter - フロントマターデータ
 * @returns {string} ステータス (published / missing / draft / in-review)
 */
function determineContentStatus(filePath, frontmatter) {
  if (!existsSync(filePath)) {
    return 'missing';
  }

  // in-reviewチェック（優先度高）
  if (frontmatter?.inReview === true || frontmatter?.['in-review'] === true) {
    return 'in-review';
  }

  // draftチェック
  if (frontmatter?.draft === true) {
    return 'draft';
  }

  // デフォルトはpublished
  return 'published';
}

/**
 * MDX本文の語数をカウント（コードブロック除外）
 *
 * カウント対象:
 * - 本文テキストのみ
 *
 * カウント対象外:
 * - コードブロック（``` ～ ```）
 * - インラインコード（`code`）
 * - マークダウン記号（#, *, _, など）
 *
 * @param {string} content - MDX本文
 * @returns {number} 語数
 */
function countWords(content) {
  if (!content || typeof content !== 'string') {
    return 0;
  }

  // コードブロックを除外（```言語名\n～\n```）
  let cleaned = content.replace(/```[\s\S]*?```/g, '');

  // インラインコードを除外（`code`）
  cleaned = cleaned.replace(/`[^`]+`/g, '');

  // HTMLコメントを除外（<!-- ～ -->）
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // マークダウン記号を空白に置換
  cleaned = cleaned
    .replace(/[#*_\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 空白で分割して語数をカウント
  return cleaned ? cleaned.split(/\s+/).length : 0;
}

/**
 * ドキュメントのコンテンツメタ情報を生成
 *
 * @param {string} projectPath - プロジェクトディレクトリのパス
 * @param {Object} document - ドキュメントデータ
 * @param {string[]} versionIds - バージョンIDの配列
 * @param {string[]} langCodes - 言語コードの配列
 * @returns {Object} content オブジェクト
 */
export function generateContentMeta(projectPath, document, versionIds, langCodes) {
  const content = {};

  logger.info(`コンテンツメタを生成中: ${document.id}`);

  for (const versionId of versionIds) {
    for (const lang of langCodes) {
      const fileKey = `${versionId}-${lang}`;
      const fileInfo = document._files?.[fileKey];

      if (!fileInfo) {
        // ファイルが存在しない場合
        content[lang] = content[lang] || {};
        content[lang].status = 'missing';
        logger.warn(`  ${lang}: ファイルなし`);
        continue;
      }

      const filePath = fileInfo.filePath;
      const relativePath = fileInfo.path;

      // ファイル存在確認
      if (!existsSync(filePath)) {
        content[lang] = content[lang] || {};
        content[lang].status = 'missing';
        logger.warn(`  ${lang}: ファイルが見つかりません - ${filePath}`);
        continue;
      }

      // フロントマターを解析してステータス判定
      let frontmatter = {};
      let mdxContent = '';
      try {
        const fileContent = readFileSync(filePath, 'utf-8');
        const parsed = matter(fileContent);
        frontmatter = parsed.data;
        mdxContent = parsed.content;
      } catch (error) {
        logger.warn(`  ${lang}: フロントマター解析エラー - ${error.message}`);
      }

      // コンテンツステータスを判定
      const status = determineContentStatus(filePath, frontmatter);

      // コンテンツメタを構築
      const meta = {
        path: convertToContentPath(relativePath),
        status: status,
      };

      // syncHashを計算
      try {
        meta.syncHash = calculateFileHash(filePath);
      } catch (error) {
        logger.warn(`  ${lang}: syncHash計算エラー - ${error.message}`);
      }

      // lastUpdatedを取得
      const lastUpdated = getLastUpdated(filePath);
      if (lastUpdated) {
        meta.lastUpdated = lastUpdated;
      }

      // reviewer（最終コミッター）を取得
      const committer = getLastCommitter(filePath);
      if (committer) {
        meta.reviewer = committer;
      }

      // source情報を取得
      const sourceInfo = getSourceInfo(filePath, relativePath);
      if (sourceInfo) {
        meta.source = sourceInfo;
      }

      // wordCountを計算（コードブロック除外）
      const wordCount = countWords(mdxContent);
      if (wordCount > 0) {
        meta.wordCount = wordCount;
      }

      // 言語別メタ情報を保存
      content[lang] = meta;

      logger.info(
        `  ${lang}: 完了 (status: ${meta.status}, wordCount: ${meta.wordCount || 0}, syncHash: ${meta.syncHash?.substring(0, 8)}...)`
      );
    }
  }

  logger.success(`コンテンツメタ生成完了: ${document.id}`);

  return content;
}

/**
 * 相対パスを新レジストリ形式のコンテンツパスに変換
 *
 * 例:
 *   src/content/docs/v2/ja/01-guide/01-getting-started.mdx
 *   → content/getting-started/ja.mdx
 *
 * @param {string} relativePath - プロジェクトルートからの相対パス
 * @returns {string} 新レジストリ形式のコンテンツパス
 */
function convertToContentPath(relativePath) {
  // パスを分解
  // 例: src/content/docs/v2/ja/01-guide/01-getting-started.mdx
  const parts = relativePath.split('/');

  // ファイル名から番号とスラッグを抽出
  const filename = parts[parts.length - 1]; // 01-getting-started.mdx
  const match = filename.match(/^(\d{2})-(.+)\.mdx$/);

  if (!match) {
    // フォールバック: そのまま返す
    return relativePath;
  }

  const [, , docSlug] = match; // getting-started

  // 言語コードを取得（パスの後ろから2番目がカテゴリ、3番目が言語）
  const lang = parts[parts.length - 3]; // ja

  // 新形式: content/{docId}/{lang}.mdx
  return `content/${docSlug}/${lang}.mdx`;
}

/**
 * 全ドキュメントのコンテンツメタ情報を生成
 *
 * @param {string} projectPath - プロジェクトディレクトリのパス
 * @param {Object[]} documents - ドキュメントデータの配列
 * @param {string[]} versionIds - バージョンIDの配列
 * @param {string[]} langCodes - 言語コードの配列
 * @returns {Object[]} コンテンツメタ情報が追加されたドキュメントデータの配列
 */
export function generateAllContentMeta(projectPath, documents, versionIds, langCodes) {
  logger.info('全ドキュメントのコンテンツメタを生成中...');

  let successCount = 0;
  let errorCount = 0;

  for (const document of documents) {
    try {
      document.content = generateContentMeta(
        projectPath,
        document,
        versionIds,
        langCodes
      );
      successCount++;
    } catch (error) {
      logger.error(`コンテンツメタ生成エラー: ${document.id} - ${error.message}`);
      document.content = {};
      errorCount++;
    }
  }

  logger.success(
    `コンテンツメタ生成完了: 成功 ${successCount}件、エラー ${errorCount}件`
  );

  return documents;
}
