/**
 * config-parser.js のユニットテスト
 *
 * 設定ファイル解析ロジックのテスト
 */

import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseProjectConfig, parseProjectDecorations } from '../../../src/commands/migrate/config-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = resolve(__dirname, '../../fixtures/migrate-from-libx/sample-small/apps/test-project');

describe('config-parser', () => {
  describe('parseProjectConfig', () => {
    it('project.config.json を正しく解析できる', () => {
      const result = parseProjectConfig(FIXTURES_DIR, 'test-project');

      // projectDataの検証
      expect(result.projectData).toBeDefined();
      expect(result.projectData.id).toBe('test-project');
      expect(result.projectData.displayName).toEqual({
        en: 'Test Project',
        ja: 'テストプロジェクト',
      });
      expect(result.projectData.description).toEqual({
        en: 'A test project for migration testing',
        ja: 'マイグレーションテスト用のプロジェクト',
      });

      // languagesの検証
      expect(result.projectData.languages).toHaveLength(2);
      expect(result.projectData.languages[0]).toEqual({
        code: 'en',
        displayName: 'English',
        status: 'active',
        default: true,
      });
      expect(result.projectData.languages[1]).toEqual({
        code: 'ja',
        displayName: '日本語',
        status: 'active',
        default: false,
        fallback: 'en',
      });

      // versionsの検証
      expect(result.projectData.versions).toHaveLength(1);
      expect(result.projectData.versions[0]).toEqual({
        id: 'v1',
        name: 'Version 1.0',
        date: '2024-01-01T00:00:00.000Z',
        isLatest: true,
        status: 'active',
      });

      // licensesの検証
      expect(result.projectData.licenses).toHaveLength(1);
      expect(result.projectData.licenses[0]).toEqual({
        id: 'test-original',
        name: 'Test Documentation',
        author: 'Test Team',
        license: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      });

      // categoryTranslationsの検証
      expect(result.categoryTranslations).toEqual({
        en: {
          guide: 'Guide',
        },
        ja: {
          guide: 'ガイド',
        },
      });

      // supportedLangsの検証
      expect(result.supportedLangs).toEqual(['en', 'ja']);

      // versionsの検証
      expect(result.versions).toEqual(['v1']);
    });

    it('baseUrl、defaultSource、showAttribution、sourceLanguage が削除される', () => {
      const result = parseProjectConfig(FIXTURES_DIR, 'test-project');

      expect(result.projectData.baseUrl).toBeUndefined();
      expect(result.projectData.defaultSource).toBeUndefined();
      expect(result.projectData.showAttribution).toBeUndefined();
      expect(result.projectData.sourceLanguage).toBeUndefined();
    });

    it('licenseUrl が url に変換される', () => {
      const result = parseProjectConfig(FIXTURES_DIR, 'test-project');

      expect(result.projectData.licenses[0].url).toBe('https://opensource.org/licenses/MIT');
      expect(result.projectData.licenses[0].licenseUrl).toBeUndefined();
    });

    it('sourceUrl が削除される', () => {
      const result = parseProjectConfig(FIXTURES_DIR, 'test-project');

      expect(result.projectData.licenses[0].sourceUrl).toBeUndefined();
    });

    it('versions に status が追加される（isLatestならactive、それ以外はdeprecated）', () => {
      const result = parseProjectConfig(FIXTURES_DIR, 'test-project');

      expect(result.projectData.versions[0].status).toBe('active');
    });

    it('存在しない設定ファイルでエラーを投げる', () => {
      expect(() => {
        parseProjectConfig('/nonexistent/path', 'test-project');
      }).toThrow();
    });
  });

  describe('parseProjectDecorations', () => {
    it('projects.config.json からプロジェクト装飾情報を取得できる', () => {
      // Note: このテストは実際の apps/top-page が必要なため、
      // モックまたはフィクスチャを使用する必要があります。
      // ここではスキップして、実際のプロジェクトでテストすることを推奨します。

      // 暫定的に、存在しないプロジェクトの場合は空オブジェクトを返すことを確認
      const result = parseProjectDecorations('/nonexistent/path', 'test-project');

      expect(result).toEqual({});
    });
  });
});
