/**
 * update projectコマンドのユニットテスト
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

describe('update projectコマンド', () => {
  let testEnv;
  let updateProjectCommand;
  let originalCwd;

  beforeEach(async () => {
    testEnv = setupTest('update-project');

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
    const updateModule = await import('../../../../src/commands/update/project.js');
    updateProjectCommand = updateModule.default;

    // モックをリセット
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 元のディレクトリに戻す
    process.chdir(originalCwd);
    testEnv.cleanup();
  });

  describe('正常系', () => {
    it('プロジェクトの表示名を更新できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        displayNameEn: 'Updated Project',
        displayNameJa: '更新されたプロジェクト',
      };

      await updateProjectCommand('test-project-1', globalOpts, cmdOpts);

      // process.exitが呼ばれない（正常終了）
      expect(mockExit).not.toHaveBeenCalled();

      // レジストリが更新されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');

      expect(project.displayName.en).toBe('Updated Project');
      expect(project.displayName.ja).toBe('更新されたプロジェクト');
    });

    it('プロジェクトの説明文を更新できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        descriptionEn: 'Updated description',
        descriptionJa: '更新された説明',
      };

      await updateProjectCommand('test-project-1', globalOpts, cmdOpts);

      // レジストリが更新されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');

      expect(project.description.en).toBe('Updated description');
      expect(project.description.ja).toBe('更新された説明');
    });

    it('プロジェクトのステータスを更新できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        status: 'archived',
      };

      await updateProjectCommand('test-project-1', globalOpts, cmdOpts);

      // レジストリが更新されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');

      expect(project.status).toBe('archived');
    });

    it('複数の項目を同時に更新できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        displayNameEn: 'Multi Update',
        descriptionEn: 'Multi description',
        status: 'active',
      };

      await updateProjectCommand('test-project-1', globalOpts, cmdOpts);

      // レジストリが更新されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');

      expect(project.displayName.en).toBe('Multi Update');
      expect(project.description.en).toBe('Multi description');
      expect(project.status).toBe('active');
    });

    it('英語のみ更新できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        displayNameEn: 'English Only',
      };

      await updateProjectCommand('test-project-1', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');

      expect(project.displayName.en).toBe('English Only');
      // 日本語は元のまま
      expect(project.displayName.ja).toBe('テストプロジェクト 1');
    });

    it('日本語のみ更新できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        displayNameJa: '日本語のみ',
      };

      await updateProjectCommand('test-project-1', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');

      expect(project.displayName.ja).toBe('日本語のみ');
      // 英語は元のまま
      expect(project.displayName.en).toBe('Test Project 1');
    });

    it('dry-runモードで実行できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: true };
      const cmdOpts = {
        displayNameEn: 'Dry Run Test',
      };

      await updateProjectCommand('test-project-1', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);

      // レジストリが変更されていないことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');

      // 元のままであることを確認
      expect(project.displayName.en).toBe('Test Project 1');
    });

    it('バックアップファイルが作成される', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        displayNameEn: 'Backup Test',
      };

      await updateProjectCommand('test-project-1', globalOpts, cmdOpts);

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
        displayNameEn: 'Verbose Test',
      };

      await updateProjectCommand('test-project-1', globalOpts, cmdOpts);

      // console.logが複数回呼ばれたことを確認（詳細ログ）
      expect(mockConsoleLog.mock.calls.length).toBeGreaterThan(0);
    });

    it('JSONモードで実行できる', async () => {
      const globalOpts = { verbose: false, json: true, yes: false, dryRun: false };
      const cmdOpts = {
        displayNameEn: 'JSON Test',
      };

      await updateProjectCommand('test-project-1', globalOpts, cmdOpts);

      // レジストリが更新されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');

      expect(project.displayName.en).toBe('JSON Test');
    });
  });

  describe('異常系', () => {
    it('存在しないプロジェクトIDの場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        displayNameEn: 'Test',
      };

      await updateProjectCommand('non-existent-project', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('更新項目がない場合（非対話モード）、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true }; // 非対話モードだが更新項目なし

      await updateProjectCommand('test-project-1', globalOpts, cmdOpts);

      // getUpdateInfo内でエラーが発生してcatchブロックに入り、process.exit(1)が呼ばれる
      expect(mockExit).toHaveBeenCalledWith(1);

      // レジストリが変更されていないことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');

      // 元のままであることを確認
      expect(project.displayName.en).toBe('Test Project 1');
    });

    it('無効なステータスの場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        status: 'invalid-status',
      };

      await updateProjectCommand('test-project-1', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('verboseモードでエラースタックを表示する', async () => {
      const globalOpts = { verbose: true, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        displayNameEn: 'Test',
      };

      await updateProjectCommand('non-existent-project', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);

      // ログが出力されたことを確認
      const totalLogCalls = mockConsoleLog.mock.calls.length + mockConsoleError.mock.calls.length;
      expect(totalLogCalls).toBeGreaterThan(0);
    });
  });

  describe('エッジケース', () => {
    it('空文字列で更新できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        descriptionEn: '',
      };

      await updateProjectCommand('test-project-1', globalOpts, cmdOpts);

      // レジストリが更新されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');

      expect(project.description.en).toBe('');
    });

    it('ステータスをactiveからarchivedに変更できる', async () => {
      // 最初にactiveに設定
      const registry = createTestRegistry();
      registry.projects[0].status = 'active';
      fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        status: 'archived',
      };

      await updateProjectCommand('test-project-1', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const updatedRegistry = JSON.parse(registryContent);
      const project = updatedRegistry.projects.find(p => p.id === 'test-project-1');

      expect(project.status).toBe('archived');
    });

    it('長いテキストで更新できる', async () => {
      const longText = 'A'.repeat(500);
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        descriptionEn: longText,
      };

      await updateProjectCommand('test-project-1', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');

      expect(project.description.en).toBe(longText);
      expect(project.description.en.length).toBe(500);
    });
  });
});
