/**
 * add docコマンドのユニットテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupTest, createTestRegistry } from '../../../helpers/fixtures.js';
import path from 'path';
import fs from 'fs';

// inquirerをモック（vi.resetModules()の前に定義）
const mockPrompt = vi.fn();
vi.mock('inquirer', () => ({
  default: {
    prompt: mockPrompt,
  },
}));

// RegistryManagerをモックしてバリデーションを無効化（グローバル）
vi.mock('../../../../src/utils/registry.js', async () => {
  const actual = await vi.importActual('../../../../src/utils/registry.js');
  return {
    ...actual,
    createRegistryManager: (options) => {
      return actual.createRegistryManager({
        ...options,
        validateOnSave: false, // テスト環境ではバリデーションを無効化
      });
    },
  };
});

// process.exitをモック
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {});

// console.logをモック
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

// console.errorをモック
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('add docコマンド', () => {
  let testEnv;
  let addDocCommand;
  let originalCwd;

  beforeEach(async () => {
    testEnv = setupTest('add-doc');

    // レジストリを再作成（各テストで初期状態に戻す）
    const registry = createTestRegistry({ documentCount: 2 }); // 2つのドキュメントを持つプロジェクト
    fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

    // カレントディレクトリを変更
    originalCwd = process.cwd();
    process.chdir(testEnv.tempDir);

    // ConfigManagerのシングルトンをリセット
    vi.resetModules();

    const configModule = await import('../../../../src/utils/config.js');
    configModule.resetConfigManager();

    // モジュールを動的にインポート
    const addModule = await import('../../../../src/commands/add/doc.js');
    addDocCommand = addModule.default;

    // モックをリセット
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 元のディレクトリに戻す
    process.chdir(originalCwd);
    testEnv.cleanup();
  });

  describe('正常系', () => {
    it('新規ドキュメントを追加できる（--yesオプション、最小設定）', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        titleEn: 'Getting Started',
        titleJa: 'はじめに',
      };

      await addDocCommand('test-project-1', 'getting-started', globalOpts, cmdOpts);

      // process.exitが呼ばれない（正常終了）
      expect(mockExit).not.toHaveBeenCalled();

      // レジストリにドキュメントが追加されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const document = project.documents.find(d => d.slug === 'getting-started');

      expect(document).toBeDefined();
      expect(document.slug).toBe('getting-started');
      expect(document.title.en).toBe('Getting Started');
      expect(document.title.ja).toBe('はじめに');
      expect(document.status).toBe('draft');
    });

    it('新規ドキュメントを追加できる（デフォルト値でタイトル自動生成）', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addDocCommand('test-project-1', 'api-reference', globalOpts, cmdOpts);

      // レジストリにドキュメントが追加されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const document = project.documents.find(d => d.slug === 'api-reference');

      expect(document).toBeDefined();
      // スラッグから自動生成されたタイトル: "Api Reference"
      expect(document.title.en).toBe('Api Reference');
    });

    it('スラッシュ付きスラッグでドキュメントを追加できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        titleEn: 'Installation Guide',
      };

      await addDocCommand('test-project-1', 'guide/installation', globalOpts, cmdOpts);

      // レジストリにドキュメントが追加されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const document = project.documents.find(d => d.slug === 'guide/installation');

      expect(document).toBeDefined();
      expect(document.slug).toBe('guide/installation');
    });

    it('サマリー、キーワード、タグ付きでドキュメントを追加できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        titleEn: 'Quick Start',
        summary: 'Quick start guide for beginners',
        keywords: 'quick,start,beginner',
        tags: 'tutorial,guide',
      };

      await addDocCommand('test-project-1', 'quick-start', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const document = project.documents.find(d => d.slug === 'quick-start');

      expect(document).toBeDefined();
      expect(document.summary).toBe('Quick start guide for beginners');
      expect(document.keywords).toEqual(['quick', 'start', 'beginner']);
      expect(document.tags).toEqual(['tutorial', 'guide']);
    });

    it('dry-runモードで実行できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: true };
      const cmdOpts = {
        yes: true,
        titleEn: 'Dry Run Test',
      };

      await addDocCommand('test-project-1', 'dryrun-test', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);

      // レジストリが変更されていないことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const document = project.documents.find(d => d.slug === 'dryrun-test');

      expect(document).toBeUndefined(); // ドキュメントが追加されていない
    });

    it('バックアップファイルが作成される', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        titleEn: 'Backup Test',
      };

      await addDocCommand('test-project-1', 'backup-test', globalOpts, cmdOpts);

      // バックアップディレクトリが作成されたことを確認
      const backupDir = path.join(testEnv.tempDir, '.backups');
      expect(fs.existsSync(backupDir)).toBe(true);

      // バックアップファイルが存在することを確認
      const backupFiles = fs.readdirSync(backupDir);
      expect(backupFiles.length).toBeGreaterThan(0);
    });

    it('verboseモードで詳細ログを出力する', async () => {
      const globalOpts = { verbose: true, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        titleEn: 'Verbose Test',
      };

      await addDocCommand('test-project-1', 'verbose-test', globalOpts, cmdOpts);

      // console.logが複数回呼ばれたことを確認（詳細ログ）
      expect(mockConsoleLog.mock.calls.length).toBeGreaterThan(0);
    });

    it('JSONモードで実行できる', async () => {
      const globalOpts = { verbose: false, json: true, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        titleEn: 'JSON Test',
      };

      await addDocCommand('test-project-1', 'json-test', globalOpts, cmdOpts);

      // レジストリにドキュメントが追加されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const document = project.documents.find(d => d.slug === 'json-test');

      expect(document).toBeDefined();
    });

    it('バージョン指定でドキュメントを追加できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        titleEn: 'Version Test',
        version: 'v1',
      };

      await addDocCommand('test-project-1', 'version-test', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const document = project.documents.find(d => d.slug === 'version-test');

      expect(document).toBeDefined();
      expect(document.versions).toContain('v1');
    });
  });

  describe('異常系', () => {
    it('存在しないプロジェクトIDの場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addDocCommand('non-existent-project', 'test-doc', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('無効なスラッグ（大文字）の場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addDocCommand('test-project-1', 'InvalidSlug', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('無効なスラッグ（スペース含む）の場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addDocCommand('test-project-1', 'invalid slug', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('無効なスラッグ（アンダースコア含む）の場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addDocCommand('test-project-1', 'invalid_slug', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('verboseモードでエラースタックを表示する', async () => {
      const globalOpts = { verbose: true, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addDocCommand('non-existent-project', 'test-doc', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);

      // ログが出力されたことを確認
      const totalLogCalls = mockConsoleLog.mock.calls.length + mockConsoleError.mock.calls.length;
      expect(totalLogCalls).toBeGreaterThan(0);
    });
  });

  describe('エッジケース', () => {
    it('複数のドキュメントがある場合でも新規追加できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        titleEn: 'New Document',
      };

      await addDocCommand('test-project-1', 'new-doc', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');

      // 既存の2つ + 新規1つ = 合計3つ
      expect(project.documents).toHaveLength(3);
      const newDoc = project.documents.find(d => d.slug === 'new-doc');
      expect(newDoc).toBeDefined();
    });

    it('ハイフンを複数含むスラッグでドキュメントを追加できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        titleEn: 'Multi Hyphen Test',
      };

      await addDocCommand('test-project-1', 'my-awesome-long-slug', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const document = project.documents.find(d => d.slug === 'my-awesome-long-slug');

      expect(document).toBeDefined();
    });

    it('数字を含むスラッグでドキュメントを追加できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        titleEn: 'Version 2 Docs',
      };

      await addDocCommand('test-project-1', 'v2-migration-guide', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const document = project.documents.find(d => d.slug === 'v2-migration-guide');

      expect(document).toBeDefined();
    });

    it('深いディレクトリ階層のスラッグでドキュメントを追加できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        titleEn: 'Deep Path Test',
      };

      await addDocCommand('test-project-1', 'guides/advanced/configuration', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const document = project.documents.find(d => d.slug === 'guides/advanced/configuration');

      expect(document).toBeDefined();
      expect(document.slug).toBe('guides/advanced/configuration');
    });
  });
});
