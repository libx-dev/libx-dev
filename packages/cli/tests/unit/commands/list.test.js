/**
 * listコマンドのユニットテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupTest, createTestRegistry } from '../../helpers/fixtures.js';
import path from 'path';
import fs from 'fs';

// process.exitをモック
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {});

// console.logをモック（JSON出力のため）
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

// console.errorをモック（エラー出力の確認のため）
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('listコマンド', () => {
  let testEnv;
  let listCommand;
  let originalCwd;

  beforeEach(async () => {
    testEnv = setupTest('list');

    // カレントディレクトリを変更してConfigManagerが正しいパスを使うようにする
    originalCwd = process.cwd();
    process.chdir(testEnv.tempDir);

    // ConfigManagerのシングルトンをリセット
    vi.resetModules();

    // ConfigManagerをリセット
    const configModule = await import('../../../src/utils/config.js');
    configModule.resetConfigManager();

    // モジュールを動的にインポート
    const listModule = await import('../../../src/commands/list.js');
    listCommand = listModule.default;

    // モックをリセット
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 元のディレクトリに戻す
    process.chdir(originalCwd);
    testEnv.cleanup();
  });

  describe('正常系 - projects', () => {
    it('プロジェクト一覧を表示できる', async () => {
      const globalOpts = { verbose: false, json: false };
      const cmdOpts = {};

      await listCommand('projects', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('JSON形式でプロジェクト一覧を出力できる', async () => {
      const globalOpts = { verbose: false, json: true };
      const cmdOpts = {};

      await listCommand('projects', globalOpts, cmdOpts);

      // JSON出力が呼ばれたことを確認
      expect(mockConsoleLog).toHaveBeenCalled();
      const calls = mockConsoleLog.mock.calls;
      const jsonCall = calls.find(call => {
        const output = call[0];
        return typeof output === 'string' && output.trim().startsWith('[');
      });
      expect(jsonCall).toBeDefined();
      const result = JSON.parse(jsonCall[0]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('statusフィルタでプロジェクトをフィルタできる', async () => {
      // デフォルトのレジストリにステータスを追加
      const registry = createTestRegistry({ projectCount: 2 });
      registry.projects[0].status = 'active';
      registry.projects[0].categories = [];
      registry.projects[0].languages[0].default = true;
      registry.projects[1].status = 'archived';
      registry.projects[1].categories = [];
      registry.projects[1].languages[0].default = true;

      // デフォルトのregistryPathに上書き
      fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: true };
      const cmdOpts = { status: 'active' };

      await listCommand('projects', globalOpts, cmdOpts);

      // フィルタ結果を確認
      const calls = mockConsoleLog.mock.calls;
      const jsonCall = calls.find(call => {
        const output = call[0];
        return typeof output === 'string' && output.trim().startsWith('[');
      });
      const result = JSON.parse(jsonCall[0]);
      expect(result.length).toBe(1);
      expect(result[0].status).toBe('active');
    });
  });

  describe('正常系 - docs', () => {
    it('ドキュメント一覧を表示できる', async () => {
      const globalOpts = { verbose: false, json: false };
      const cmdOpts = { projectId: 'test-project-1' };

      await listCommand('docs', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('JSON形式でドキュメント一覧を出力できる', async () => {
      const globalOpts = { verbose: false, json: true };
      const cmdOpts = { projectId: 'test-project-1' };

      await listCommand('docs', globalOpts, cmdOpts);

      // JSON出力が呼ばれたことを確認
      expect(mockConsoleLog).toHaveBeenCalled();
      const calls = mockConsoleLog.mock.calls;
      const jsonCall = calls.find(call => {
        const output = call[0];
        return typeof output === 'string' && output.trim().startsWith('[');
      });
      expect(jsonCall).toBeDefined();
      const result = JSON.parse(jsonCall[0]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('バージョンでドキュメントをフィルタできる', async () => {
      // バージョン付きドキュメントを作成
      const registry = createTestRegistry();
      registry.projects[0].categories = [];
      registry.projects[0].languages[0].default = true;
      registry.projects[0].documents[0].versions = ['v1'];
      registry.projects[0].documents[1].versions = ['v1', 'v2'];

      // デフォルトのregistryPathに上書き
      fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: true };
      const cmdOpts = { projectId: 'test-project-1', version: 'v1' };

      await listCommand('docs', globalOpts, cmdOpts);

      // フィルタ結果を確認
      const calls = mockConsoleLog.mock.calls;
      const jsonCall = calls.find(call => {
        const output = call[0];
        return typeof output === 'string' && output.trim().startsWith('[');
      });
      const result = JSON.parse(jsonCall[0]);
      expect(result.length).toBe(2);
    });
  });

  describe('正常系 - versions', () => {
    it('バージョン一覧を表示できる', async () => {
      const globalOpts = { verbose: false, json: false };
      const cmdOpts = { projectId: 'test-project-1' };

      await listCommand('versions', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('JSON形式でバージョン一覧を出力できる', async () => {
      const globalOpts = { verbose: false, json: true };
      const cmdOpts = { projectId: 'test-project-1' };

      await listCommand('versions', globalOpts, cmdOpts);

      // JSON出力が呼ばれたことを確認
      expect(mockConsoleLog).toHaveBeenCalled();
      const calls = mockConsoleLog.mock.calls;
      const jsonCall = calls.find(call => {
        const output = call[0];
        return typeof output === 'string' && output.trim().startsWith('[');
      });
      expect(jsonCall).toBeDefined();
      const result = JSON.parse(jsonCall[0]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('正常系 - languages', () => {
    it('言語一覧を表示できる', async () => {
      const globalOpts = { verbose: false, json: false };
      const cmdOpts = { projectId: 'test-project-1' };

      await listCommand('languages', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('JSON形式で言語一覧を出力できる', async () => {
      const globalOpts = { verbose: false, json: true };
      const cmdOpts = { projectId: 'test-project-1' };

      await listCommand('languages', globalOpts, cmdOpts);

      // JSON出力が呼ばれたことを確認
      expect(mockConsoleLog).toHaveBeenCalled();
      const calls = mockConsoleLog.mock.calls;
      const jsonCall = calls.find(call => {
        const output = call[0];
        return typeof output === 'string' && output.trim().startsWith('[');
      });
      expect(jsonCall).toBeDefined();
      const result = JSON.parse(jsonCall[0]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('異常系', () => {
    it('不明なエンティティタイプの場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false };
      const cmdOpts = {};

      await listCommand('invalid', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('存在しないプロジェクトIDの場合、エラーを返す（docs）', async () => {
      const globalOpts = { verbose: false, json: false };
      const cmdOpts = { projectId: 'non-existent-project' };

      await listCommand('docs', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('存在しないプロジェクトIDの場合、エラーを返す（versions）', async () => {
      const globalOpts = { verbose: false, json: false };
      const cmdOpts = { projectId: 'non-existent-project' };

      await listCommand('versions', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('存在しないプロジェクトIDの場合、エラーを返す（languages）', async () => {
      const globalOpts = { verbose: false, json: false };
      const cmdOpts = { projectId: 'non-existent-project' };

      await listCommand('languages', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('エッジケース', () => {
    it('空のプロジェクト配列でも正常に動作する', async () => {
      // 空のレジストリを作成
      const registry = createTestRegistry({ projectCount: 0 });

      // デフォルトのregistryPathに上書き
      fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: true };
      const cmdOpts = {};

      await listCommand('projects', globalOpts, cmdOpts);

      // 空の配列が返る
      const calls = mockConsoleLog.mock.calls;
      const jsonCall = calls.find(call => {
        const output = call[0];
        return typeof output === 'string' && output.trim().startsWith('[');
      });
      const result = JSON.parse(jsonCall[0]);
      expect(result.length).toBe(0);
    });

    it('verboseモードで詳細ログを出力する', async () => {
      const globalOpts = { verbose: true, json: false };
      const cmdOpts = {};

      await listCommand('projects', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });
});
