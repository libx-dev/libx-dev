/**
 * migrate from-libx コマンドの統合テスト
 *
 * E2Eフローのテスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'fs';
import migrateFromLibx from '../../../src/commands/migrate/from-libx.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = resolve(__dirname, '../../fixtures/migrate-from-libx/sample-small/apps/test-project');
const TEMP_DIR = resolve(__dirname, '../../tmp/migrate-integration');

describe('migrate from-libx (統合テスト)', () => {
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

  describe('正常系', () => {
    it('既存プロジェクトを新レジストリ形式に変換できる', async () => {
      const targetPath = join(TEMP_DIR, 'docs.json');

      const globalOpts = {
        dryRun: false,
        verbose: false,
      };

      const cmdOpts = {
        source: FIXTURES_DIR,
        projectId: 'test-project',
        target: targetPath,
        topPage: '/nonexistent/path', // topPageは存在しなくてもOK
        backup: join(TEMP_DIR, '.backups'),
      };

      await migrateFromLibx(globalOpts, cmdOpts);

      // レジストリファイルが作成されたことを確認
      expect(existsSync(targetPath)).toBe(true);

      // レジストリの内容を確認
      const registry = JSON.parse(readFileSync(targetPath, 'utf-8'));

      expect(registry.$schemaVersion).toBe('1.0.0');
      expect(registry.projects).toHaveLength(1);

      const project = registry.projects[0];
      expect(project.id).toBe('test-project');
      expect(project.displayName).toEqual({
        en: 'Test Project',
        ja: 'テストプロジェクト',
      });
      expect(project.languages).toHaveLength(2);
      expect(project.versions).toHaveLength(1);
      expect(project.categories).toHaveLength(1);
      expect(project.documents).toHaveLength(2);

      // ドキュメントのコンテンツメタを確認
      const doc = project.documents[0];
      expect(doc.content).toBeDefined();
      expect(doc.content.en).toBeDefined();
      expect(doc.content.en.status).toBe('published');
      expect(doc.content.en.syncHash).toBeDefined();
      expect(doc.content.en.path).toContain('content/');
    });

    it('dry-runモードではファイルを作成しない', async () => {
      const targetPath = join(TEMP_DIR, 'docs-dry.json');

      const globalOpts = {
        dryRun: true,
        verbose: false,
      };

      const cmdOpts = {
        source: FIXTURES_DIR,
        projectId: 'test-project',
        target: targetPath,
        topPage: '/nonexistent/path',
        backup: join(TEMP_DIR, '.backups'),
      };

      await migrateFromLibx(globalOpts, cmdOpts);

      // ファイルが作成されていないことを確認
      expect(existsSync(targetPath)).toBe(false);
    });

    it('既存レジストリに新しいプロジェクトを追加できる', async () => {
      const targetPath = join(TEMP_DIR, 'docs-append.json');

      // 既存レジストリを作成
      const existingRegistry = {
        $schemaVersion: '1.0.0',
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'test',
        },
        projects: [
          {
            id: 'existing-project',
            displayName: { en: 'Existing Project' },
            description: { en: 'An existing project' },
            languages: [{ code: 'en', displayName: 'English', default: true }],
            versions: [{ id: 'v1', name: 'Version 1', isLatest: true, status: 'stable' }],
            categories: [],
            documents: [],
          },
        ],
        settings: {
          siteUrl: 'https://example.com',
          defaultLocale: 'en',
          siteName: 'Test Site',
        },
      };

      writeFileSync(targetPath, JSON.stringify(existingRegistry, null, 2));

      const globalOpts = {
        dryRun: false,
        verbose: false,
      };

      const cmdOpts = {
        source: FIXTURES_DIR,
        projectId: 'test-project',
        target: targetPath,
        topPage: '/nonexistent/path',
        backup: join(TEMP_DIR, '.backups'),
      };

      await migrateFromLibx(globalOpts, cmdOpts);

      // レジストリの内容を確認
      const registry = JSON.parse(readFileSync(targetPath, 'utf-8'));

      expect(registry.projects).toHaveLength(2);
      expect(registry.projects[0].id).toBe('existing-project');
      expect(registry.projects[1].id).toBe('test-project');
    });

    it('同じプロジェクトIDの場合、上書きする', async () => {
      const targetPath = join(TEMP_DIR, 'docs-overwrite.json');

      // 既存レジストリを作成（同じプロジェクトID）
      const existingRegistry = {
        $schemaVersion: '1.0.0',
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'test',
        },
        projects: [
          {
            id: 'test-project',
            displayName: { en: 'Old Test Project' },
            description: { en: 'This should be replaced' },
            languages: [{ code: 'en', displayName: 'English', default: true }],
            versions: [],
            categories: [],
            documents: [],
          },
        ],
        settings: {
          siteUrl: 'https://example.com',
          defaultLocale: 'en',
          siteName: 'Test Site',
        },
      };

      writeFileSync(targetPath, JSON.stringify(existingRegistry, null, 2));

      const globalOpts = {
        dryRun: false,
        verbose: false,
      };

      const cmdOpts = {
        source: FIXTURES_DIR,
        projectId: 'test-project',
        target: targetPath,
        topPage: '/nonexistent/path',
        backup: join(TEMP_DIR, '.backups'),
      };

      await migrateFromLibx(globalOpts, cmdOpts);

      // レジストリの内容を確認
      const registry = JSON.parse(readFileSync(targetPath, 'utf-8'));

      expect(registry.projects).toHaveLength(1);
      expect(registry.projects[0].displayName.en).toBe('Test Project'); // 新しい値
    });
  });

  describe('異常系', () => {
    it('ソースディレクトリが存在しない場合、エラーを投げる', async () => {
      const targetPath = join(TEMP_DIR, 'docs-error.json');

      const globalOpts = {
        dryRun: false,
        verbose: false,
      };

      const cmdOpts = {
        source: '/nonexistent/path',
        projectId: 'test-project',
        target: targetPath,
        topPage: '/nonexistent/path',
        backup: join(TEMP_DIR, '.backups'),
      };

      await expect(migrateFromLibx(globalOpts, cmdOpts)).rejects.toThrow();
    });

    it('プロジェクトIDが指定されていない場合、エラーを投げる', async () => {
      const targetPath = join(TEMP_DIR, 'docs-error.json');

      const globalOpts = {
        dryRun: false,
        verbose: false,
      };

      const cmdOpts = {
        source: FIXTURES_DIR,
        projectId: undefined,
        target: targetPath,
        topPage: '/nonexistent/path',
        backup: join(TEMP_DIR, '.backups'),
      };

      await expect(migrateFromLibx(globalOpts, cmdOpts)).rejects.toThrow();
    });

    it('設定ファイルが存在しない場合、エラーを投げる', async () => {
      const targetPath = join(TEMP_DIR, 'docs-error.json');

      const globalOpts = {
        dryRun: false,
        verbose: false,
      };

      const cmdOpts = {
        source: TEMP_DIR, // 空のディレクトリ
        projectId: 'test-project',
        target: targetPath,
        topPage: '/nonexistent/path',
        backup: join(TEMP_DIR, '.backups'),
      };

      await expect(migrateFromLibx(globalOpts, cmdOpts)).rejects.toThrow();
    });
  });
});
