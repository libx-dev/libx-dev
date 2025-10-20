/**
 * カテゴリスキャンモジュール
 *
 * ファイルシステムから番号付きカテゴリディレクトリを検出し、
 * レジストリ形式のカテゴリデータを生成します。
 */

import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import * as logger from '../../utils/logger.js';
import { getCategoryNames } from './config-parser.js';

/**
 * 番号付きディレクトリのパターン（例: 01-guide, 02-components）
 */
const NUMBERED_DIR_PATTERN = /^(\d{2})-(.+)$/;

/**
 * カテゴリディレクトリをスキャンしてレジストリ形式のカテゴリデータを生成
 *
 * @param {string} projectPath - プロジェクトディレクトリのパス
 * @param {string} versionId - バージョンID
 * @param {string} lang - 言語コード
 * @param {Object} categoryTranslations - カテゴリ翻訳情報
 * @param {string[]} supportedLangs - サポート言語リスト
 * @returns {Object[]} カテゴリデータの配列
 */
export function scanCategories(
  projectPath,
  versionId,
  lang,
  categoryTranslations,
  supportedLangs
) {
  const contentDir = join(projectPath, 'src/content/docs', versionId, lang);

  if (!existsSync(contentDir)) {
    logger.warn(`コンテンツディレクトリが見つかりません: ${contentDir}`);
    return [];
  }

  logger.info(`カテゴリをスキャン中: ${contentDir}`);

  const entries = readdirSync(contentDir);
  const categories = [];

  for (const entry of entries) {
    const fullPath = join(contentDir, entry);

    // ディレクトリのみを対象
    if (!statSync(fullPath).isDirectory()) {
      continue;
    }

    // 番号付きディレクトリのみを対象
    const match = entry.match(NUMBERED_DIR_PATTERN);
    if (!match) {
      logger.warn(`  スキップ（番号なし）: ${entry}`);
      continue;
    }

    const [, orderStr, categorySlug] = match;
    const order = parseInt(orderStr, 10);

    // カテゴリIDはスラッグ部分
    const categoryId = categorySlug;

    // 多言語カテゴリ名を取得
    const titles = getCategoryNames(categoryTranslations, categoryId, supportedLangs);

    // このバージョン・言語でのドキュメント数をカウント
    const docCount = countDocumentsInCategory(fullPath);

    categories.push({
      id: categoryId,
      order: order,
      titles: titles,
      description: createEmptyLocalizedObject(supportedLangs), // 既存設定にはないため空
      docCount: docCount,
    });

    logger.info(`  カテゴリ検出: ${categoryId} (order: ${order}, docs: ${docCount})`);
  }

  // order順にソート
  categories.sort((a, b) => a.order - b.order);

  logger.success(`カテゴリスキャン完了: ${categories.length}件`);

  return categories;
}

/**
 * カテゴリ内のドキュメント数をカウント
 *
 * @param {string} categoryDir - カテゴリディレクトリのパス
 * @returns {number} ドキュメント数
 */
function countDocumentsInCategory(categoryDir) {
  const entries = readdirSync(categoryDir);
  let count = 0;

  for (const entry of entries) {
    if (entry.endsWith('.mdx') && NUMBERED_DIR_PATTERN.test(entry)) {
      count++;
    }
  }

  return count;
}

/**
 * 空の多言語オブジェクトを作成
 *
 * @param {string[]} langs - 言語コードの配列
 * @returns {Object} 空文字列で初期化された多言語オブジェクト
 */
function createEmptyLocalizedObject(langs) {
  const obj = {};
  for (const lang of langs) {
    obj[lang] = '';
  }
  return obj;
}

/**
 * 全バージョン・全言語のカテゴリをスキャンして統合
 *
 * @param {string} projectPath - プロジェクトディレクトリのパス
 * @param {string[]} versionIds - バージョンIDの配列
 * @param {string[]} langCodes - 言語コードの配列
 * @param {Object} categoryTranslations - カテゴリ翻訳情報
 * @returns {Object[]} 統合されたカテゴリデータの配列
 */
export function scanAllCategories(
  projectPath,
  versionIds,
  langCodes,
  categoryTranslations
) {
  logger.info('全バージョン・全言語のカテゴリをスキャン中...');

  const categoryMap = new Map();

  // 各バージョン・各言語でスキャン
  for (const versionId of versionIds) {
    for (const lang of langCodes) {
      const categories = scanCategories(
        projectPath,
        versionId,
        lang,
        categoryTranslations,
        langCodes
      );

      // カテゴリIDとorderでマージ
      for (const category of categories) {
        const key = `${category.id}-${category.order}`;
        if (!categoryMap.has(key)) {
          categoryMap.set(key, {
            id: category.id,
            order: category.order,
            titles: category.titles,
            description: category.description,
            docs: [],
          });
        }
      }
    }
  }

  // Map から配列に変換してソート
  const categories = Array.from(categoryMap.values());
  categories.sort((a, b) => a.order - b.order);

  logger.success(`カテゴリ統合完了: ${categories.length}件`);

  return categories;
}
