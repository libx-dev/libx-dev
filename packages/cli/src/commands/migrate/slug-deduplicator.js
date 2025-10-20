/**
 * スラッグ重複検知と自動リネーム
 *
 * 同じスラッグを持つドキュメントを検知して、自動的に番号を付与します。
 */

import * as logger from '../../utils/logger.js';

/**
 * スラッグの重複を検知して自動リネーム
 *
 * @param {Object[]} documents - ドキュメント配列
 * @returns {Object[]} 重複解決済みドキュメント配列
 */
export function deduplicateSlugs(documents) {
  const slugCounts = new Map();
  const deduplicatedDocs = [];

  for (const doc of documents) {
    const originalSlug = doc.slug;
    const originalId = doc.id;

    if (!slugCounts.has(originalSlug)) {
      // 初めて見るスラッグ
      slugCounts.set(originalSlug, 1);
      deduplicatedDocs.push(doc);
    } else {
      // 重複するスラッグ
      const count = slugCounts.get(originalSlug);
      slugCounts.set(originalSlug, count + 1);

      // 番号を付与
      const newSlug = `${originalSlug}-${count + 1}`;
      const newId = `${originalId}-${count + 1}`;

      logger.warn(`⚠️  スラッグ重複検知: ${originalSlug} → ${newSlug}`);
      logger.warn(`    ドキュメントID: ${originalId} → ${newId}`);

      // 新しいスラッグとIDでドキュメントを作成
      deduplicatedDocs.push({
        ...doc,
        slug: newSlug,
        id: newId,
      });
    }
  }

  return deduplicatedDocs;
}

/**
 * スラッグの重複を検出（リネームなし）
 *
 * @param {Object[]} documents - ドキュメント配列
 * @returns {Object[]} 重複しているスラッグのリスト
 */
export function findDuplicateSlugs(documents) {
  const slugMap = new Map();
  const duplicates = [];

  for (const doc of documents) {
    if (!slugMap.has(doc.slug)) {
      slugMap.set(doc.slug, [doc]);
    } else {
      slugMap.get(doc.slug).push(doc);
    }
  }

  // 重複しているスラッグを抽出
  for (const [slug, docs] of slugMap.entries()) {
    if (docs.length > 1) {
      duplicates.push({
        slug,
        count: docs.length,
        documents: docs.map(d => ({
          id: d.id,
          title: d.title,
          _categoryId: d._categoryId,
        })),
      });
    }
  }

  return duplicates;
}

/**
 * 重複スラッグのレポートを出力
 *
 * @param {Object[]} duplicates - findDuplicateSlugs() の戻り値
 */
export function reportDuplicateSlugs(duplicates) {
  if (duplicates.length === 0) {
    logger.success('✅ スラッグの重複はありません');
    return;
  }

  logger.warn(`\n⚠️  スラッグの重複が ${duplicates.length} 件見つかりました:\n`);

  for (const dup of duplicates) {
    logger.warn(`スラッグ: ${dup.slug} (${dup.count} 件)`);
    for (const doc of dup.documents) {
      logger.warn(`  - ID: ${doc.id}, カテゴリ: ${doc._categoryId}`);
    }
    logger.warn('');
  }
}
