/**
 * add projectコマンドのユニットテスト
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

describe('add projectコマンド', () => {
  let testEnv;
  let addProjectCommand;
  let originalCwd;

  beforeEach(async () => {
    testEnv = setupTest('add-project');

    // レジストリを再作成（各テストで初期状態に戻す）
    const registry = createTestRegistry({ projectCount: 0 }); // 空のレジストリ
    fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

    // カレントディレクトリを変更
    originalCwd = process.cwd();
    process.chdir(testEnv.tempDir);

    // ConfigManagerのシングルトンをリセット
    vi.resetModules();

    const configModule = await import('../../../../src/utils/config.js');
    configModule.resetConfigManager();

    // モジュールを動的にインポート
    const addModule = await import('../../../../src/commands/add/project.js');
    addProjectCommand = addModule.default;

    // モックをリセット
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 元のディレクトリに戻す
    process.chdir(originalCwd);
    testEnv.cleanup();
  });

  describe('正常系', () => {
    it('新規プロジェクトを追加できる（--yesオプションなし、cmdOptsに値を指定）', async () => {
      // inquirerの応答をモック
      mockPrompt.mockResolvedValue({
        displayNameEn: 'My New Project',
        displayNameJa: '新しいプロジェクト',
        descriptionEn: 'A new documentation project',
        descriptionJa: '新しいドキュメントプロジェクト',
        languages: ['en', 'ja'],
      });

      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      // 対話式でもinquirerのデフォルト値として使用される
      const cmdOpts = {
        displayNameEn: 'My New Project',
        displayNameJa: '新しいプロジェクト',
        descriptionEn: 'A new documentation project',
        descriptionJa: '新しいドキュメントプロジェクト',
      };

      // 環境変数でnon-interactiveモードを無効化
      delete process.env.DOCS_CLI_NON_INTERACTIVE;

      await addProjectCommand('my-project', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);

      // レジストリにプロジェクトが追加されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'my-project');

      expect(project).toBeDefined();
      expect(project.displayName.en).toBe('My New Project');
      expect(project.displayName.ja).toBe('新しいプロジェクト');
      expect(project.description.en).toBe('A new documentation project');
      expect(project.description.ja).toBe('新しいドキュメントプロジェクト');
      expect(project.languages).toHaveLength(2);
      expect(project.versions).toHaveLength(1);
      expect(project.versions[0].id).toBe('v1');
    });

    it('新規プロジェクトを追加できる（--yesオプション）', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        displayNameEn: 'Test Project',
        displayNameJa: 'テストプロジェクト',
        descriptionEn: 'Test description',
        descriptionJa: 'テスト説明',
        languages: 'en,ja',
      };

      await addProjectCommand('test-project', globalOpts, cmdOpts);

      // inquirerが呼ばれないことを確認
      expect(mockPrompt).not.toHaveBeenCalled();

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);

      // レジストリにプロジェクトが追加されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project');

      expect(project).toBeDefined();
      expect(project.displayName.en).toBe('Test Project');
      expect(project.displayName.ja).toBe('テストプロジェクト');
    });

    it('デフォルト値で新規プロジェクトを追加できる（--yesオプション、最小設定）', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
      };

      await addProjectCommand('minimal-project', globalOpts, cmdOpts);

      // レジストリにプロジェクトが追加されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'minimal-project');

      expect(project).toBeDefined();
      expect(project.displayName.en).toBe('minimal-project');
      expect(project.displayName.ja).toBe('minimal-project');
      expect(project.description.en).toBe('Documentation for minimal-project');
      expect(project.description.ja).toBe('minimal-projectのドキュメント');
      expect(project.languages).toHaveLength(2); // デフォルトは en,ja
      expect(project.languages[0].code).toBe('en');
      expect(project.languages[1].code).toBe('ja');
    });

    it('dry-runモードで実行できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: true };
      const cmdOpts = {
        yes: true,
        displayNameEn: 'Dry Run Project',
        displayNameJa: 'ドライランプロジェクト',
      };

      await addProjectCommand('dryrun-project', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);

      // レジストリが変更されていないことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'dryrun-project');

      expect(project).toBeUndefined(); // プロジェクトが追加されていない
    });

    it('バックアップファイルが作成される', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        displayNameEn: 'Backup Test',
      };

      await addProjectCommand('backup-project', globalOpts, cmdOpts);

      // バックアップディレクトリが作成されたことを確認
      const backupDir = path.join(testEnv.tempDir, '.backups');
      expect(fs.existsSync(backupDir)).toBe(true);

      // バックアップファイルが存在することを確認
      const backupFiles = fs.readdirSync(backupDir);
      expect(backupFiles.length).toBeGreaterThan(0);
    });

    it('複数言語をサポートするプロジェクトを追加できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        displayNameEn: 'Multi Language Project',
        languages: 'en,ja,zh-Hans,ko',
      };

      await addProjectCommand('multi-lang-project', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'multi-lang-project');

      expect(project).toBeDefined();
      expect(project.languages).toHaveLength(4);
      expect(project.languages[0].code).toBe('en');
      expect(project.languages[0].default).toBe(true);
      expect(project.languages[1].code).toBe('ja');
      expect(project.languages[1].fallback).toBe('en');
      expect(project.languages[2].code).toBe('zh-Hans');
      expect(project.languages[3].code).toBe('ko');
    });

    it('verboseモードで詳細ログを出力する', async () => {
      const globalOpts = { verbose: true, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        displayNameEn: 'Verbose Test',
      };

      await addProjectCommand('verbose-project', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);

      // console.logが複数回呼ばれたことを確認（詳細ログ）
      expect(mockConsoleLog.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('異常系', () => {
    it('既に存在するプロジェクトIDの場合、エラーを返す', async () => {
      // 既存プロジェクトを持つレジストリを作成
      const registry = createTestRegistry({ projectCount: 1 });
      fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addProjectCommand('test-project-1', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('無効なプロジェクトID（大文字）の場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addProjectCommand('InvalidProjectID', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('無効なプロジェクトID（スペース含む）の場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addProjectCommand('invalid project', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('無効なプロジェクトID（アンダースコア含む）の場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addProjectCommand('invalid_project', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('verboseモードでエラースタックを表示する', async () => {
      // 既存プロジェクトを持つレジストリを作成
      const registry = createTestRegistry({ projectCount: 1 });
      fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: true, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addProjectCommand('test-project-1', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('エッジケース', () => {
    it('レジストリが空の場合でもプロジェクトを追加できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addProjectCommand('first-project', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);

      expect(registry.projects).toHaveLength(1);
      expect(registry.projects[0].id).toBe('first-project');
    });

    it('複数のプロジェクトが存在する場合でも新規追加できる', async () => {
      // 2つのプロジェクトを持つレジストリを作成
      const registry = createTestRegistry({ projectCount: 2 });
      fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addProjectCommand('new-project', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const updatedRegistry = JSON.parse(registryContent);

      expect(updatedRegistry.projects).toHaveLength(3);
      const newProject = updatedRegistry.projects.find(p => p.id === 'new-project');
      expect(newProject).toBeDefined();
    });

    it('ハイフン付きプロジェクトIDを追加できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addProjectCommand('my-awesome-project', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'my-awesome-project');

      expect(project).toBeDefined();
    });

    it('数字を含むプロジェクトIDを追加できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addProjectCommand('project-v2-docs', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'project-v2-docs');

      expect(project).toBeDefined();
    });

    it('JSONモードで実行できる', async () => {
      const globalOpts = { verbose: false, json: true, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addProjectCommand('json-mode-project', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);

      // レジストリにプロジェクトが追加されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'json-mode-project');

      expect(project).toBeDefined();
    });
  });
});
