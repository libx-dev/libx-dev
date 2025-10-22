/**
 * remove projectコマンドのユニットテスト
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

describe('remove projectコマンド', () => {
  let testEnv;
  let removeProjectCommand;
  let originalCwd;

  beforeEach(async () => {
    testEnv = setupTest('remove-project');

    // レジストリを再作成（各テストで初期状態に戻す）
    const registry = createTestRegistry();
    fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

    // カレントディレクトリを変更
    originalCwd = process.cwd();
    process.chdir(testEnv.tempDir);

    // ConfigManagerのシングルトンをリセット
    vi.resetModules();

    const configModule = await import('../../../../src/utils/config.js');
    configModule.resetConfigManager();

    // モジュールを動的にインポート
    const removeModule = await import('../../../../src/commands/remove/project.js');
    removeProjectCommand = removeModule.default;

    // モックをリセット
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 元のディレクトリに戻す
    process.chdir(originalCwd);
    testEnv.cleanup();
  });

  describe('正常系', () => {
    it('プロジェクトを削除できる（確認あり）', async () => {
      // 確認プロンプトでYesを返す
      mockPrompt.mockResolvedValue({ confirm: true });

      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { force: false };

      await removeProjectCommand('test-project-1', globalOpts, cmdOpts);

      // 確認プロンプトが呼ばれたことを確認
      expect(mockPrompt).toHaveBeenCalled();

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);

      // レジストリからプロジェクトが削除されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      expect(project).toBeUndefined();
    });

    it('プロジェクトを削除できる（--forceオプション）', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { force: true };

      await removeProjectCommand('test-project-1', globalOpts, cmdOpts);

      // 確認プロンプトが呼ばれないことを確認
      expect(mockPrompt).not.toHaveBeenCalled();

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('プロジェクトを削除できる（--yesオプション）', async () => {
      const globalOpts = { verbose: false, json: false, yes: true, dryRun: false };
      const cmdOpts = { force: false };

      await removeProjectCommand('test-project-1', globalOpts, cmdOpts);

      // 確認プロンプトが呼ばれないことを確認
      expect(mockPrompt).not.toHaveBeenCalled();

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('dry-runモードで実行できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: true };
      const cmdOpts = { force: false };

      await removeProjectCommand('test-project-1', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);

      // レジストリが変更されていないことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      expect(project).toBeDefined();
    });

    it('確認プロンプトでNoを選択すると削除をキャンセルする', async () => {
      // 確認プロンプトでNoを返す
      mockPrompt.mockResolvedValue({ confirm: false });

      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { force: false };

      await removeProjectCommand('test-project-1', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);

      // レジストリが変更されていないことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      expect(project).toBeDefined();
    });

    it('バックアップファイルが作成される', async () => {
      const globalOpts = { verbose: false, json: false, yes: true, dryRun: false };
      const cmdOpts = { force: false };

      await removeProjectCommand('test-project-1', globalOpts, cmdOpts);

      // バックアップディレクトリが作成されたことを確認
      const backupDir = path.join(testEnv.tempDir, '.backups');
      expect(fs.existsSync(backupDir)).toBe(true);

      // バックアップファイルが存在することを確認
      const backupFiles = fs.readdirSync(backupDir);
      expect(backupFiles.length).toBeGreaterThan(0);
    });
  });

  describe('異常系', () => {
    it('存在しないプロジェクトIDの場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { force: false };

      await removeProjectCommand('non-existent-project', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('verboseモードでエラースタックを表示する', async () => {
      const globalOpts = { verbose: true, json: false, yes: false, dryRun: false };
      const cmdOpts = { force: false };

      await removeProjectCommand('non-existent-project', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('エッジケース', () => {
    it('複数のプロジェクトがある場合、指定したプロジェクトのみ削除する', async () => {
      // 2つのプロジェクトを持つレジストリを作成
      const registry = createTestRegistry({ projectCount: 2 });
      fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: false, yes: true, dryRun: false };
      const cmdOpts = { force: false };

      await removeProjectCommand('test-project-1', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const updatedRegistry = JSON.parse(registryContent);

      // test-project-1が削除され、test-project-2が残っていることを確認
      expect(updatedRegistry.projects.length).toBe(1);
      expect(updatedRegistry.projects[0].id).toBe('test-project-2');
    });

    it('プロジェクトにドキュメントがある場合でも削除できる', async () => {
      // ドキュメント付きプロジェクトを作成
      const registry = createTestRegistry({ documentCount: 5 });
      fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: false, yes: true, dryRun: false };
      const cmdOpts = { force: false };

      await removeProjectCommand('test-project-1', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });
});
