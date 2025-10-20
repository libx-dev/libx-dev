/**
 * category-scanner.js のユニットテスト
 *
 * カテゴリスキャンロジックのテスト
 */

import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { scanAllCategories } from '../../../src/commands/migrate/category-scanner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = resolve(__dirname, '../../fixtures/migrate-from-libx/sample-small/apps/test-project');

describe('category-scanner', () => {
  describe('scanAllCategories', () => {
    it('ファイルシステムからカテゴリを正しくスキャンできる', () => {
      const categoryTranslations = {
        en: {
          guide: 'Guide',
        },
        ja: {
          guide: 'ガイド',
        },
      };

      const categories = scanAllCategories(
        FIXTURES_DIR,
        ['v1'],
        ['en', 'ja'],
        categoryTranslations
      );

      expect(categories).toHaveLength(1);

      const guide = categories[0];
      expect(guide.id).toBe('guide');
      expect(guide.order).toBe(1);
      expect(guide.titles).toEqual({
        en: 'Guide',
        ja: 'ガイド',
      });
      expect(guide.description).toEqual({
        en: '',
        ja: '',
      });
    });

    it('番号付きディレクトリのみをスキャンする', () => {
      // このテストは実際のディレクトリ構造に依存するため、
      // フィクスチャに番号なしディレクトリを追加して確認する必要があります。
      // ここでは基本的な動作を確認します。

      const categoryTranslations = {
        en: {
          guide: 'Guide',
        },
        ja: {
          guide: 'ガイド',
        },
      };

      const categories = scanAllCategories(
        FIXTURES_DIR,
        ['v1'],
        ['en', 'ja'],
        categoryTranslations
      );

      // 全てのカテゴリが番号付き（01-）で始まることを確認
      categories.forEach(category => {
        expect(category.order).toBeGreaterThan(0);
        expect(category.order).toBeLessThan(100);
      });
    });

    it('カテゴリ名がtranslationsから取得できる', () => {
      const categoryTranslations = {
        en: {
          guide: 'Guide',
        },
        ja: {
          guide: 'ガイド',
        },
      };

      const categories = scanAllCategories(
        FIXTURES_DIR,
        ['v1'],
        ['en', 'ja'],
        categoryTranslations
      );

      expect(categories[0].titles.en).toBe('Guide');
      expect(categories[0].titles.ja).toBe('ガイド');
    });

    it('translationsにない場合、title-caseに変換される', () => {
      const categoryTranslations = {
        en: {},
        ja: {},
      };

      const categories = scanAllCategories(
        FIXTURES_DIR,
        ['v1'],
        ['en', 'ja'],
        categoryTranslations
      );

      // 'guide' → 'Guide' に変換される
      expect(categories[0].titles.en).toBe('Guide');
      expect(categories[0].titles.ja).toBe('Guide');
    });

    it('カテゴリがorder順にソートされる', () => {
      const categoryTranslations = {
        en: {
          guide: 'Guide',
        },
        ja: {
          guide: 'ガイド',
        },
      };

      const categories = scanAllCategories(
        FIXTURES_DIR,
        ['v1'],
        ['en', 'ja'],
        categoryTranslations
      );

      // orderが昇順になっていることを確認
      for (let i = 1; i < categories.length; i++) {
        expect(categories[i].order).toBeGreaterThanOrEqual(categories[i - 1].order);
      }
    });

    it('存在しないディレクトリの場合、空配列を返す', () => {
      const categoryTranslations = {
        en: {},
        ja: {},
      };

      const categories = scanAllCategories(
        '/nonexistent/path',
        ['v1'],
        ['en', 'ja'],
        categoryTranslations
      );

      expect(categories).toEqual([]);
    });
  });
});
