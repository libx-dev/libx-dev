/**
 * add versionコマンドのユニットテスト
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

describe('add versionコマンド', () => {
  let testEnv;
  let addVersionCommand;
  let originalCwd;

  beforeEach(async () => {
    testEnv = setupTest('add-version');

    // レジストリを再作成（各テストで初期状態に戻す）
    const registry = createTestRegistry(); // 1つのプロジェクトを持つレジストリ
    fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

    // カレントディレクトリを変更
    originalCwd = process.cwd();
    process.chdir(testEnv.tempDir);

    // ConfigManagerのシングルトンをリセット
    vi.resetModules();

    const configModule = await import('../../../../src/utils/config.js');
    configModule.resetConfigManager();

    // モジュールを動的にインポート
    const addModule = await import('../../../../src/commands/add/version.js');
    addVersionCommand = addModule.default;

    // モックをリセット
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 元のディレクトリに戻す
    process.chdir(originalCwd);
    testEnv.cleanup();
  });

  describe('正常系', () => {
    it('新規バージョンを追加できる（--yesオプション）', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        name: 'Version 2.0',
      };

      await addVersionCommand('test-project-1', 'v2', globalOpts, cmdOpts);

      // process.exitが呼ばれない（正常終了）
      expect(mockExit).not.toHaveBeenCalled();

      // レジストリにバージョンが追加されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v2');

      expect(version).toBeDefined();
      expect(version.name).toBe('Version 2.0');
      expect(version.isLatest).toBe(true);
    });

    it('デフォルト値で新規バージョンを追加できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addVersionCommand('test-project-1', 'v2', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v2');

      expect(version).toBeDefined();
      expect(version.name).toBe('Version 2'); // デフォルト値
      expect(version.isLatest).toBe(true);
    });

    it('マイナーバージョン（v2.1形式）を追加できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        name: 'Version 2.1',
      };

      await addVersionCommand('test-project-1', 'v2.1', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v2.1');

      expect(version).toBeDefined();
      expect(version.id).toBe('v2.1');
    });

    it('最新バージョンとして設定しない場合、既存のisLatestを維持できる', async () => {
      // レジストリにisLatestフラグ付きバージョンを設定
      const registry = createTestRegistry();
      registry.projects[0].versions[0].isLatest = true;
      fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        name: 'Version 2.0',
        setLatest: false,
      };

      await addVersionCommand('test-project-1', 'v2.0', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const updatedRegistry = JSON.parse(registryContent);
      const project = updatedRegistry.projects.find(p => p.id === 'test-project-1');
      const v1 = project.versions.find(v => v.id === 'v1');
      const v2 = project.versions.find(v => v.id === 'v2.0');

      expect(v1.isLatest).toBe(true); // v1がまだ最新
      expect(v2.isLatest).toBe(false);
    });

    it('dry-runモードで実行できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: true };
      const cmdOpts = {
        yes: true,
        name: 'Dry Run Test',
      };

      await addVersionCommand('test-project-1', 'v2', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);

      // レジストリが変更されていないことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v2');

      expect(version).toBeUndefined(); // バージョンが追加されていない
    });

    it('バックアップファイルが作成される', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        name: 'Backup Test',
      };

      await addVersionCommand('test-project-1', 'v2', globalOpts, cmdOpts);

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
        name: 'Verbose Test',
      };

      await addVersionCommand('test-project-1', 'v2', globalOpts, cmdOpts);

      // console.logが複数回呼ばれたことを確認（詳細ログ）
      expect(mockConsoleLog.mock.calls.length).toBeGreaterThan(0);
    });

    it('JSONモードで実行できる', async () => {
      const globalOpts = { verbose: false, json: true, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        name: 'JSON Test',
      };

      await addVersionCommand('test-project-1', 'v2', globalOpts, cmdOpts);

      // レジストリにバージョンが追加されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v2');

      expect(version).toBeDefined();
    });

    it('--noCopyオプションで前バージョンからのコピーをスキップできる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        name: 'No Copy Test',
        noCopy: true,
      };

      await addVersionCommand('test-project-1', 'v2', globalOpts, cmdOpts);

      // 正常終了を確認
      expect(mockExit).not.toHaveBeenCalled();
    });
  });

  describe('異常系', () => {
    it('存在しないプロジェクトIDの場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addVersionCommand('non-existent-project', 'v2', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('既に存在するバージョンIDの場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('無効なバージョンID（v接頭辞なし）の場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addVersionCommand('test-project-1', '2', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('無効なバージョンID（文字列混在）の場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addVersionCommand('test-project-1', 'v2.0.0-beta', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('verboseモードでエラースタックを表示する', async () => {
      const globalOpts = { verbose: true, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addVersionCommand('non-existent-project', 'v2', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);

      // ログが出力されたことを確認
      const totalLogCalls = mockConsoleLog.mock.calls.length + mockConsoleError.mock.calls.length;
      expect(totalLogCalls).toBeGreaterThan(0);
    });
  });

  describe('エッジケース', () => {
    it('複数のバージョンがある場合でも新規追加できる', async () => {
      // 既存のレジストリにv2を追加
      const registry = createTestRegistry();
      registry.projects[0].versions.push({
        id: 'v2',
        label: 'v2.0',
        status: 'stable',
        releaseDate: '2025-02-01',
        isLatest: false,
      });
      fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        name: 'Version 3.0',
      };

      await addVersionCommand('test-project-1', 'v3', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const updatedRegistry = JSON.parse(registryContent);
      const project = updatedRegistry.projects.find(p => p.id === 'test-project-1');

      // 3つのバージョンがあることを確認
      expect(project.versions.length).toBe(3);
      const v3 = project.versions.find(v => v.id === 'v3');
      expect(v3).toBeDefined();
      expect(v3.isLatest).toBe(true);
    });

    it('セマンティックバージョニング形式（v1.2.3）を追加できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        name: 'Version 1.2.3',
      };

      await addVersionCommand('test-project-1', 'v1.2.3', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v1.2.3');

      expect(version).toBeDefined();
      expect(version.id).toBe('v1.2.3');
    });

    it('前のisLatestフラグが正しく更新される', async () => {
      // レジストリにisLatestフラグ付きバージョンを設定
      const registry = createTestRegistry();
      registry.projects[0].versions[0].isLatest = true;
      fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        name: 'Version 2.0',
        setLatest: true,
      };

      await addVersionCommand('test-project-1', 'v2', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const updatedRegistry = JSON.parse(registryContent);
      const project = updatedRegistry.projects.find(p => p.id === 'test-project-1');
      const v1 = project.versions.find(v => v.id === 'v1');
      const v2 = project.versions.find(v => v.id === 'v2');

      expect(v1.isLatest).toBe(false); // v1のisLatestがfalseに更新される
      expect(v2.isLatest).toBe(true);  // v2がisLatest
    });
  });
});
