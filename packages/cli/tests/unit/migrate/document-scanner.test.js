/**
 * document-scanner.js のユニットテスト
 *
 * ドキュメントスキャンロジックのテスト
 */

import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { scanAllDocuments } from '../../../src/commands/migrate/document-scanner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = resolve(__dirname, '../../fixtures/migrate-from-libx/sample-small/apps/test-project');

describe('document-scanner', () => {
  describe('scanAllDocuments', () => {
    it('ファイルシステムからドキュメントを正しくスキャンできる', () => {
      const documents = scanAllDocuments(
        FIXTURES_DIR,
        'test-project',
        ['v1'],
        ['en', 'ja']
      );

      expect(documents).toHaveLength(2);

      // getting-started
      const gettingStarted = documents.find(doc => doc.id === 'getting-started');
      expect(gettingStarted).toBeDefined();
      expect(gettingStarted.slug).toBe('guide/getting-started');
      expect(gettingStarted.title).toEqual({
        en: 'Getting Started',
        ja: 'はじめに',
      });
      expect(gettingStarted.summary).toEqual({
        en: 'Quick start guide for Test Project',
        ja: 'Test Projectのクイックスタートガイド',
      });
      expect(gettingStarted.versions).toEqual(['v1']);
      expect(gettingStarted._categoryId).toBe('guide');
      expect(gettingStarted._order).toBe(1);

      // installation
      const installation = documents.find(doc => doc.id === 'installation');
      expect(installation).toBeDefined();
      expect(installation.slug).toBe('guide/installation');
      expect(installation.title).toEqual({
        en: 'Installation',
        ja: 'インストール',
      });
      expect(installation._categoryId).toBe('guide');
      expect(installation._order).toBe(2);
    });

    it('フロントマターから title と summary を取得できる', () => {
      const documents = scanAllDocuments(
        FIXTURES_DIR,
        'test-project',
        ['v1'],
        ['en', 'ja']
      );

      const doc = documents[0];
      expect(doc.title.en).toBeDefined();
      expect(doc.summary.en).toBeDefined();
    });

    it('番号付きファイルのみをスキャンする', () => {
      const documents = scanAllDocuments(
        FIXTURES_DIR,
        'test-project',
        ['v1'],
        ['en', 'ja']
      );

      // 全てのドキュメントがorder（番号）を持つことを確認
      documents.forEach(doc => {
        expect(doc._order).toBeGreaterThan(0);
        expect(doc._order).toBeLessThan(100);
      });
    });

    it('ファイル名からdocIdとslugを生成する', () => {
      const documents = scanAllDocuments(
        FIXTURES_DIR,
        'test-project',
        ['v1'],
        ['en', 'ja']
      );

      // '01-getting-started.mdx' → id: 'getting-started', slug: 'guide/getting-started'
      const doc = documents.find(doc => doc.id === 'getting-started');
      expect(doc).toBeDefined();
      expect(doc.id).toBe('getting-started');
      expect(doc.slug).toBe('guide/getting-started');
    });

    it('複数のバージョンと言語に対応する', () => {
      const documents = scanAllDocuments(
        FIXTURES_DIR,
        'test-project',
        ['v1'],
        ['en', 'ja']
      );

      // 各ドキュメントが両方の言語のタイトルを持つことを確認
      documents.forEach(doc => {
        expect(doc.title.en).toBeDefined();
        expect(doc.title.ja).toBeDefined();
      });
    });

    it('存在しないディレクトリの場合、空配列を返す', () => {
      const documents = scanAllDocuments(
        '/nonexistent/path',
        'test-project',
        ['v1'],
        ['en', 'ja']
      );

      expect(documents).toEqual([]);
    });

    it('_filesフィールドにファイルパス情報を保存する', () => {
      const documents = scanAllDocuments(
        FIXTURES_DIR,
        'test-project',
        ['v1'],
        ['en', 'ja']
      );

      const doc = documents[0];
      expect(doc._files).toBeDefined();
      expect(doc._files['v1-en']).toBeDefined();
      expect(doc._files['v1-en'].filePath).toContain('01-guide');
      expect(doc._files['v1-en'].path).toContain('src/content/docs');
    });
  });
});
