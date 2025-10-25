/**
 * remove docコマンドのユニットテスト
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

describe('remove docコマンド', () => {
  let testEnv;
  let removeDocCommand;
  let originalCwd;

  beforeEach(async () => {
    testEnv = setupTest('remove-doc');

    // レジストリを再作成（各テストで初期状態に戻す）
    const registry = createTestRegistry({ documentCount: 3 }); // 3つのドキュメントを持つプロジェクト
    fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

    // カレントディレクトリを変更
    originalCwd = process.cwd();
    process.chdir(testEnv.tempDir);

    // ConfigManagerのシングルトンをリセット
    vi.resetModules();

    const configModule = await import('../../../../src/utils/config.js');
    configModule.resetConfigManager();

    // モジュールを動的にインポート
    const removeModule = await import('../../../../src/commands/remove/doc.js');
    removeDocCommand = removeModule.default;

    // モックをリセット
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 元のディレクトリに戻す
    process.chdir(originalCwd);
    testEnv.cleanup();
  });

  describe('正常系', () => {
    it('ドキュメントを削除できる（確認あり、コンテンツ削除なし）', async () => {
      // 確認プロンプトでYesを返す
      mockPrompt
        .mockResolvedValueOnce({ confirm: true }) // ドキュメント削除確認
        .mockResolvedValueOnce({ deleteContent: false }); // コンテンツ削除確認

      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { force: false };

      await removeDocCommand('test-project-1', 'doc-1', globalOpts, cmdOpts);

      // 確認プロンプトが呼ばれたことを確認
      expect(mockPrompt).toHaveBeenCalledTimes(2);

      // process.exitは呼ばれない（catchブロックに入らない）
      expect(mockExit).not.toHaveBeenCalled();

      // レジストリからドキュメントが削除されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const document = project.documents.find(d => d.slug === 'doc-1');

      expect(document).toBeUndefined();
    });

    it('ドキュメントを削除できる（--forceオプション、コンテンツ削除あり）', async () => {
      // コンテンツ削除確認のみ
      mockPrompt.mockResolvedValueOnce({ deleteContent: true });

      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { force: true };

      await removeDocCommand('test-project-1', 'doc-1', globalOpts, cmdOpts);

      // 確認プロンプトが1回だけ呼ばれる（コンテンツ削除確認のみ）
      expect(mockPrompt).toHaveBeenCalledTimes(1);
    });

    it('ドキュメントを削除できる（--yesオプション、deleteContentオプション指定）', async () => {
      const globalOpts = { verbose: false, json: false, yes: true, dryRun: false };
      const cmdOpts = { force: false, deleteContent: true };

      await removeDocCommand('test-project-1', 'doc-1', globalOpts, cmdOpts);

      // 確認プロンプトが呼ばれないことを確認
      expect(mockPrompt).not.toHaveBeenCalled();
    });

    it('dry-runモードで実行できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: true, dryRun: true };
      const cmdOpts = { force: false, deleteContent: true };

      await removeDocCommand('test-project-1', 'doc-1', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);

      // レジストリが変更されていないことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const document = project.documents.find(d => d.slug === 'doc-1');

      expect(document).toBeDefined(); // ドキュメントが残っている
    });

    it('確認プロンプトでNoを選択すると削除をキャンセルする', async () => {
      // 確認プロンプトでNoを返す
      mockPrompt.mockResolvedValueOnce({ confirm: false });

      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { force: false };

      await removeDocCommand('test-project-1', 'doc-1', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);

      // レジストリが変更されていないことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const document = project.documents.find(d => d.slug === 'doc-1');

      expect(document).toBeDefined(); // ドキュメントが残っている
    });

    it('バックアップファイルが作成される', async () => {
      const globalOpts = { verbose: false, json: false, yes: true, dryRun: false };
      const cmdOpts = { force: false, deleteContent: false };

      await removeDocCommand('test-project-1', 'doc-1', globalOpts, cmdOpts);

      // バックアップディレクトリが作成されたことを確認
      const backupDir = path.join(testEnv.tempDir, '.backups');
      expect(fs.existsSync(backupDir)).toBe(true);

      // バックアップファイルが存在することを確認
      const backupFiles = fs.readdirSync(backupDir);
      expect(backupFiles.length).toBeGreaterThan(0);
    });

    it('verboseモードで詳細ログを出力する', async () => {
      const globalOpts = { verbose: true, json: false, yes: true, dryRun: false };
      const cmdOpts = { force: false, deleteContent: false };

      await removeDocCommand('test-project-1', 'doc-1', globalOpts, cmdOpts);

      // console.logが複数回呼ばれたことを確認（詳細ログ）
      expect(mockConsoleLog.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('異常系', () => {
    it('存在しないプロジェクトIDの場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { force: false };

      await removeDocCommand('non-existent-project', 'doc-1', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('存在しないドキュメントスラッグの場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { force: false };

      await removeDocCommand('test-project-1', 'non-existent-doc', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('verboseモードでエラースタックを表示する', async () => {
      const globalOpts = { verbose: true, json: false, yes: false, dryRun: false };
      const cmdOpts = { force: false };

      await removeDocCommand('non-existent-project', 'doc-1', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);

      // ログが出力されたことを確認（loggerがエラーをconsole.logで出力する場合がある）
      const totalLogCalls = mockConsoleLog.mock.calls.length + mockConsoleError.mock.calls.length;
      expect(totalLogCalls).toBeGreaterThan(0);
    });
  });

  describe('エッジケース', () => {
    it('複数のドキュメントがある場合、指定したドキュメントのみ削除する', async () => {
      const globalOpts = { verbose: false, json: false, yes: true, dryRun: false };
      const cmdOpts = { force: false, deleteContent: false };

      await removeDocCommand('test-project-1', 'doc-1', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');

      // doc-1が削除され、doc-2とdoc-3が残っていることを確認
      expect(project.documents).toHaveLength(2);
      expect(project.documents.find(d => d.slug === 'doc-1')).toBeUndefined();
      expect(project.documents.find(d => d.slug === 'doc-2')).toBeDefined();
      expect(project.documents.find(d => d.slug === 'doc-3')).toBeDefined();
    });

    it('最後のドキュメントを削除できる', async () => {
      // 1つのドキュメントのみを持つレジストリを作成
      const registry = createTestRegistry({ documentCount: 1 });
      fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: false, yes: true, dryRun: false };
      const cmdOpts = { force: false, deleteContent: false };

      await removeDocCommand('test-project-1', 'doc-1', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry2 = JSON.parse(registryContent);
      const project = registry2.projects.find(p => p.id === 'test-project-1');

      expect(project.documents).toHaveLength(0);
    });

    it('JSONモードで実行できる', async () => {
      const globalOpts = { verbose: false, json: true, yes: true, dryRun: false };
      const cmdOpts = { force: false, deleteContent: false };

      await removeDocCommand('test-project-1', 'doc-1', globalOpts, cmdOpts);

      // レジストリからドキュメントが削除されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const document = project.documents.find(d => d.slug === 'doc-1');

      expect(document).toBeUndefined();
    });

    it('スラッシュを含むスラッグを削除できる', async () => {
      // スラッシュを含むスラッグを持つドキュメントを追加
      const registry = createTestRegistry({ documentCount: 1 });
      registry.projects[0].documents[0].slug = 'guide/getting-started';
      fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: false, yes: true, dryRun: false };
      const cmdOpts = { force: false, deleteContent: false };

      await removeDocCommand('test-project-1', 'guide/getting-started', globalOpts, cmdOpts);

      // レジストリからドキュメントが削除されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry2 = JSON.parse(registryContent);
      const project = registry2.projects.find(p => p.id === 'test-project-1');

      expect(project.documents).toHaveLength(0);
    });
  });
});
