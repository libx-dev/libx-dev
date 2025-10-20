/**
 * migrate from-libx コマンドのエッジケース統合テスト
 *
 * エッジケース（ファイル欠損、不正なフロントマター、スラッグ重複など）のテスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
import migrateFromLibx from '../../../src/commands/migrate/from-libx.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = resolve(__dirname, '../../fixtures/migrate-from-libx/edge-cases');
const TEMP_DIR = resolve(__dirname, '../../tmp/migrate-edge-cases');

describe('migrate from-libx (エッジケース)', () => {
  beforeEach(() => {
    // 一時ディレクトリを作成
    if (!existsSync(TEMP_DIR)) {
      mkdirSync(TEMP_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // 一時ディレクトリをクリーンアップ
    if (existsSync(TEMP_DIR)) {
      rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  });

  describe('ファイル欠損ケース', () => {
    it('一部の言語版が存在しない場合、status: "missing" を設定する', async () => {
      const sourcePath = join(FIXTURES_DIR, 'missing-files/apps/test-missing');
      const targetPath = join(TEMP_DIR, 'missing-files.json');

      const globalOpts = {
        dryRun: false,
        verbose: false,
      };

      const cmdOpts = {
        source: sourcePath,
        projectId: 'test-missing',
        target: targetPath,
        topPage: '/nonexistent/path',
        backup: join(TEMP_DIR, '.backups'),
      };

      await migrateFromLibx(globalOpts, cmdOpts);

      const registry = JSON.parse(readFileSync(targetPath, 'utf-8'));
      const project = registry.projects[0];
      const doc = project.documents[0];

      // 英語版は存在する
      expect(doc.content.en).toBeDefined();
      expect(doc.content.en.status).toBe('published');

      // 日本語版は存在しない
      expect(doc.content.ja).toBeDefined();
      expect(doc.content.ja.status).toBe('missing');
    });
  });

  describe('不正なフロントマターケース', () => {
    it('不正なフロントマターでもエラーを投げずに処理を継続する', async () => {
      const sourcePath = join(FIXTURES_DIR, 'invalid-frontmatter/apps/test-invalid');
      const targetPath = join(TEMP_DIR, 'invalid-frontmatter.json');

      const globalOpts = {
        dryRun: false,
        verbose: false,
      };

      const cmdOpts = {
        source: sourcePath,
        projectId: 'test-invalid',
        target: targetPath,
        topPage: '/nonexistent/path',
        backup: join(TEMP_DIR, '.backups'),
      };

      // エラーを投げないことを確認
      await expect(migrateFromLibx(globalOpts, cmdOpts)).resolves.not.toThrow();

      const registry = JSON.parse(readFileSync(targetPath, 'utf-8'));
      const project = registry.projects[0];

      // プロジェクトが正しく作成されていることを確認
      expect(project).toBeDefined();
      expect(project.id).toBe('test-invalid');
      expect(project.documents).toHaveLength(1);
    });

    it('不正なフロントマターの場合、デフォルト値を使用する', async () => {
      const sourcePath = join(FIXTURES_DIR, 'invalid-frontmatter/apps/test-invalid');
      const targetPath = join(TEMP_DIR, 'invalid-frontmatter.json');

      const globalOpts = {
        dryRun: false,
        verbose: false,
      };

      const cmdOpts = {
        source: sourcePath,
        projectId: 'test-invalid',
        target: targetPath,
        topPage: '/nonexistent/path',
        backup: join(TEMP_DIR, '.backups'),
      };

      await migrateFromLibx(globalOpts, cmdOpts);

      const registry = JSON.parse(readFileSync(targetPath, 'utf-8'));
      const project = registry.projects[0];
      const doc = project.documents[0];

      // ドキュメントが作成されていることを確認
      expect(doc).toBeDefined();
      expect(doc.id).toBe('invalid');
      expect(doc.title.en).toBeDefined(); // フロントマターから取得
    });
  });

  describe('スラッグ重複ケース', () => {
    it.skip('現在の実装ではスラッグ重複は発生しない（カテゴリID付きのため）', async () => {
      // 注: 現在の実装では、スラッグは「${categoryId}/${docSlug}」形式で生成されるため、
      // 異なるカテゴリに同じファイル名があっても、スラッグは重複しない。
      // 真のスラッグ重複を実現するには、カテゴリなしのスラッグ生成が必要。
      // このテストは将来的にスラッグ生成ロジックが変更された際に有効化する。

      const sourcePath = join(FIXTURES_DIR, 'duplicate-slugs/apps/test-duplicate');
      const targetPath = join(TEMP_DIR, 'duplicate-slugs.json');

      const globalOpts = {
        dryRun: false,
        verbose: false,
      };

      const cmdOpts = {
        source: sourcePath,
        projectId: 'test-duplicate',
        target: targetPath,
        topPage: '/nonexistent/path',
        backup: join(TEMP_DIR, '.backups'),
      };

      await migrateFromLibx(globalOpts, cmdOpts);

      const registry = JSON.parse(readFileSync(targetPath, 'utf-8'));
      const project = registry.projects[0];

      // 現在の期待値: カテゴリIDが含まれるため重複しない
      expect(project.documents.length).toBeGreaterThan(0);

      // すべてのスラッグがユニークであることを確認
      const slugs = project.documents.map(d => d.slug);
      const uniqueSlugs = new Set(slugs);
      expect(slugs.length).toBe(uniqueSlugs.size);
    });
  });
});
