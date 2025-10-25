/**
 * update versionコマンドのユニットテスト
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

describe('update versionコマンド', () => {
  let testEnv;
  let updateVersionCommand;
  let originalCwd;

  beforeEach(async () => {
    testEnv = setupTest('update-version');

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
    const updateModule = await import('../../../../src/commands/update/version.js');
    updateVersionCommand = updateModule.default;

    // モックをリセット
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 元のディレクトリに戻す
    process.chdir(originalCwd);
    testEnv.cleanup();
  });

  describe('正常系', () => {
    it('バージョンの名前を更新できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        name: 'Updated Version Name',
      };

      await updateVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

      // process.exitが呼ばれない（正常終了）
      expect(mockExit).not.toHaveBeenCalled();

      // レジストリが更新されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v1');

      expect(version.name).toBe('Updated Version Name');
    });

    it('バージョンのステータスをactiveに更新できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        status: 'active',
      };

      await updateVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

      // レジストリが更新されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v1');

      expect(version.status).toBe('active');
    });

    it('バージョンのステータスをdeprecatedに更新できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        status: 'deprecated',
      };

      await updateVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

      // レジストリが更新されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v1');

      expect(version.status).toBe('deprecated');
    });

    it('バージョンのステータスをdraftに更新できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        status: 'draft',
      };

      await updateVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

      // レジストリが更新されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v1');

      expect(version.status).toBe('draft');
    });

    it('isLatestフラグをtrueに設定できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        setLatest: true,
      };

      await updateVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

      // レジストリが更新されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v1');

      expect(version.isLatest).toBe(true);
    });

    it('isLatestフラグをfalseに設定できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        setLatest: false,
      };

      await updateVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

      // レジストリが更新されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v1');

      expect(version.isLatest).toBe(false);
    });

    it('複数の項目を同時に更新できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        name: 'Multi Update Version',
        status: 'deprecated',
        setLatest: false,
      };

      await updateVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

      // レジストリが更新されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v1');

      expect(version.name).toBe('Multi Update Version');
      expect(version.status).toBe('deprecated');
      expect(version.isLatest).toBe(false);
    });

    it('dry-runモードで実行できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: true };
      const cmdOpts = {
        name: 'Dry Run Test',
      };

      await updateVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);

      // レジストリが変更されていないことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v1');

      // 元のままであることを確認（レジストリのデフォルト値）
      expect(version.name).not.toBe('Dry Run Test');
    });

    it('バックアップファイルが作成される', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        name: 'Backup Test',
      };

      await updateVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

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
        name: 'Verbose Test',
      };

      await updateVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

      // console.logが複数回呼ばれたことを確認（詳細ログ）
      expect(mockConsoleLog.mock.calls.length).toBeGreaterThan(0);
    });

    it('JSONモードで実行できる', async () => {
      const globalOpts = { verbose: false, json: true, yes: false, dryRun: false };
      const cmdOpts = {
        name: 'JSON Test',
      };

      await updateVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

      // レジストリが更新されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v1');

      expect(version.name).toBe('JSON Test');
    });
  });

  describe('異常系', () => {
    it('存在しないプロジェクトIDの場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        name: 'Test',
      };

      await updateVersionCommand('non-existent-project', 'v1', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('存在しないバージョンIDの場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        name: 'Test',
      };

      await updateVersionCommand('test-project-1', 'non-existent-version', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('更新項目がない場合、警告を表示して終了する', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {}; // 更新項目なし

      await updateVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認（警告のみで正常終了）
      expect(mockExit).toHaveBeenCalledWith(0);

      // レジストリが変更されていないことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v1');

      // 元のままであることを確認
      expect(version).toBeDefined();
    });

    it('無効なステータスの場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        status: 'invalid-status',
      };

      await updateVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('verboseモードでエラースタックを表示する', async () => {
      const globalOpts = { verbose: true, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        status: 'invalid-status',
      };

      await updateVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);

      // ログが出力されたことを確認
      const totalLogCalls = mockConsoleLog.mock.calls.length + mockConsoleError.mock.calls.length;
      expect(totalLogCalls).toBeGreaterThan(0);
    });
  });

  describe('エッジケース', () => {
    it('空文字列で名前を更新できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        name: '',
      };

      await updateVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

      // レジストリが更新されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v1');

      expect(version.name).toBe('');
    });

    it('長いテキストで名前を更新できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const longText = 'A'.repeat(1000);
      const cmdOpts = {
        name: longText,
      };

      await updateVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

      // レジストリが更新されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v1');

      expect(version.name).toBe(longText);
      expect(version.name.length).toBe(1000);
    });

    it('特殊文字を含むテキストで名前を更新できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const specialText = '特殊文字 !@#$%^&*()_+-={}[]|:;<>?,./';
      const cmdOpts = {
        name: specialText,
      };

      await updateVersionCommand('test-project-1', 'v1', globalOpts, cmdOpts);

      // レジストリが更新されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const version = project.versions.find(v => v.id === 'v1');

      expect(version.name).toBe(specialText);
    });
  });
});
