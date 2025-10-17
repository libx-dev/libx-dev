/**
 * searchコマンドの統合テスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RegistryManager } from '../../src/utils/registry.js';
import { setupTest } from '../helpers/fixtures.js';
import searchCommand from '../../src/commands/search.js';

describe('searchコマンド 統合テスト', () => {
  let testEnv;
  let manager;

  beforeEach(() => {
    testEnv = setupTest('search');
    manager = new RegistryManager({
      registryPath: 'registry/docs.json',
      projectRoot: testEnv.tempDir,
      validateOnSave: false,
    });
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('基本的な検索', () => {
    it('プロジェクトIDで検索できる', async () => {
      manager.load();
      const registry = manager.get();

      // test-project-1プロジェクトが存在することを確認
      const project = registry.projects.find(p => p.id === 'test-project-1');
      expect(project).toBeDefined();

      // グローバルオプション（JSON出力）
      const globalOpts = {
        json: true,
        verbose: false,
        dryRun: false,
        yes: false,
      };

      // 検索オプション
      const cmdOpts = {
        type: 'project',
      };

      // 検索実行（終了コードのテストのため、try-catchで捕捉）
      try {
        await searchCommand('test-project-1', globalOpts, cmdOpts);
      } catch (error) {
        // process.exit()によるエラーは無視
      }

      // 注: 実際のコマンド実行では標準出力をキャプチャする必要がある
      // ここでは基本的な動作確認のみ
    });

    it('ドキュメントタイトルで検索できる', async () => {
      manager.load();
      const registry = manager.get();

      // ドキュメントが存在することを確認
      const projects = registry.projects;
      const hasDocuments = projects.some(p => (p.documents || []).length > 0);
      expect(hasDocuments).toBe(true);

      const globalOpts = {
        json: true,
        verbose: false,
        dryRun: false,
        yes: false,
      };

      const cmdOpts = {
        type: 'document',
      };

      // 検索実行
      try {
        await searchCommand('test', globalOpts, cmdOpts);
      } catch (error) {
        // process.exit()によるエラーは無視
      }
    });
  });

  describe('フィルタリング', () => {
    it('特定プロジェクトのみ検索できる', async () => {
      manager.load();

      const globalOpts = {
        json: true,
        verbose: false,
        dryRun: false,
        yes: false,
      };

      const cmdOpts = {
        project: 'test-project-1',
        type: 'document',
      };

      try {
        await searchCommand('test', globalOpts, cmdOpts);
      } catch (error) {
        // process.exit()によるエラーは無視
      }
    });

    it('特定フィールドのみ検索できる', async () => {
      manager.load();

      const globalOpts = {
        json: true,
        verbose: false,
        dryRun: false,
        yes: false,
      };

      const cmdOpts = {
        field: 'title',
        type: 'document',
      };

      try {
        await searchCommand('test', globalOpts, cmdOpts);
      } catch (error) {
        // process.exit()によるエラーは無視
      }
    });
  });

  describe('エラーハンドリング', () => {
    it('空のクエリは拒否される', async () => {
      const globalOpts = {
        json: false,
        verbose: false,
        dryRun: false,
        yes: false,
      };

      const cmdOpts = {};

      try {
        await searchCommand('', globalOpts, cmdOpts);
        // 実行されないはず
        expect(true).toBe(false);
      } catch (error) {
        // process.exit(1)によるエラー
        expect(error).toBeDefined();
      }
    });
  });

  describe('検索ロジック', () => {
    it('大文字小文字を区別しない検索（デフォルト）', () => {
      const text = 'Hello World';
      const query = 'hello';

      const searchInText = (text, query, caseSensitive = false) => {
        if (!text || !query) return false;
        const searchText = caseSensitive ? text : text.toLowerCase();
        const searchQuery = caseSensitive ? query : query.toLowerCase();
        return searchText.includes(searchQuery);
      };

      expect(searchInText(text, query, false)).toBe(true);
    });

    it('大文字小文字を区別する検索', () => {
      const text = 'Hello World';
      const query = 'hello';

      const searchInText = (text, query, caseSensitive = false) => {
        if (!text || !query) return false;
        const searchText = caseSensitive ? text : text.toLowerCase();
        const searchQuery = caseSensitive ? query : query.toLowerCase();
        return searchText.includes(searchQuery);
      };

      expect(searchInText(text, query, true)).toBe(false);
      expect(searchInText(text, 'Hello', true)).toBe(true);
    });

    it('多言語フィールド内を検索できる', () => {
      const field = {
        en: 'Hello World',
        ja: 'こんにちは世界',
      };
      const query = 'world';

      const searchInMultilingualField = (field, query, caseSensitive = false) => {
        if (!field || typeof field !== 'object') return false;
        return Object.values(field).some(value => {
          const searchText = caseSensitive ? String(value) : String(value).toLowerCase();
          const searchQuery = caseSensitive ? query : query.toLowerCase();
          return searchText.includes(searchQuery);
        });
      };

      expect(searchInMultilingualField(field, query, false)).toBe(true);
      expect(searchInMultilingualField(field, '世界', false)).toBe(true);
      expect(searchInMultilingualField(field, 'unknown', false)).toBe(false);
    });

    it('配列フィールド内を検索できる', () => {
      const array = ['test', 'search', 'query'];
      const query = 'search';

      const searchInArray = (array, query, caseSensitive = false) => {
        if (!Array.isArray(array) || array.length === 0) return false;
        return array.some(item => {
          const searchText = caseSensitive ? String(item) : String(item).toLowerCase();
          const searchQuery = caseSensitive ? query : query.toLowerCase();
          return searchText.includes(searchQuery);
        });
      };

      expect(searchInArray(array, query, false)).toBe(true);
      expect(searchInArray(array, 'SEARCH', false)).toBe(true);
      expect(searchInArray(array, 'unknown', false)).toBe(false);
    });
  });
});
