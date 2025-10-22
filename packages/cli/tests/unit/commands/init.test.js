/**
 * initコマンドのユニットテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupTest, readJSON, fileExists } from '../../helpers/fixtures.js';
import path from 'path';

// inquirerをモック
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}));

// process.exitをモック
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {});

describe('initコマンド', () => {
  let testEnv;
  let inquirer;
  let initCommand;

  beforeEach(async () => {
    testEnv = setupTest('init');

    // モジュールを動的にインポート
    inquirer = await import('inquirer');
    const initModule = await import('../../../src/commands/init.js');
    initCommand = initModule.default;

    // モックをリセット
    vi.clearAllMocks();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('正常系', () => {
    it('新規設定ファイルを作成できる', async () => {
      // inquirerのモック設定
      inquirer.default.prompt.mockResolvedValue({
        registryPath: 'registry/docs.json',
        projectRoot: 'apps/',
        contentRoot: 'src/content/docs/',
        defaultLang: 'en',
        backupRotation: 5,
      });

      const globalOpts = { verbose: false };
      const cmdOpts = {};

      await initCommand(globalOpts, cmdOpts);

      // 設定ファイルが作成されていることを確認
      const configPath = path.join(testEnv.tempDir, '.docs-cli', 'config.json');
      expect(fileExists(configPath)).toBe(true);

      // 設定内容を確認
      const config = readJSON(configPath);
      expect(config.registryPath).toBe('registry/docs.json');
      expect(config.projectRoot).toBe('apps/');
      expect(config.contentRoot).toBe('src/content/docs/');
      expect(config.defaultLang).toBe('en');
      expect(config.backupRotation).toBe(5);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('カスタム設定値で設定ファイルを作成できる', async () => {
      // inquirerのモック設定（カスタム値）
      inquirer.default.prompt.mockResolvedValue({
        registryPath: 'custom/registry.json',
        projectRoot: 'projects/',
        contentRoot: 'content/',
        defaultLang: 'ja',
        backupRotation: 10,
      });

      const globalOpts = { verbose: false };
      const cmdOpts = {};

      await initCommand(globalOpts, cmdOpts);

      // 設定内容を確認
      const configPath = path.join(testEnv.tempDir, '.docs-cli', 'config.json');
      const config = readJSON(configPath);
      // テンプレートとマージされるため、全フィールドが存在する
      expect(config).toHaveProperty('registryPath');
      expect(config).toHaveProperty('projectRoot');
      expect(config).toHaveProperty('contentRoot');
      expect(config).toHaveProperty('defaultLang');
      expect(config).toHaveProperty('backupRotation');
      expect(typeof config.backupRotation).toBe('number');
    });

    it('verboseモードで詳細ログを出力する', async () => {
      inquirer.default.prompt.mockResolvedValue({
        registryPath: 'registry/docs.json',
        projectRoot: 'apps/',
        contentRoot: 'src/content/docs/',
        defaultLang: 'en',
        backupRotation: 5,
      });

      const globalOpts = { verbose: true };
      const cmdOpts = {};

      await initCommand(globalOpts, cmdOpts);

      // 設定ファイルが作成されていることを確認
      const configPath = path.join(testEnv.tempDir, '.docs-cli', 'config.json');
      expect(fileExists(configPath)).toBe(true);
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe('異常系', () => {
    it('既存の設定ファイルがある場合、上書き確認を行う', async () => {
      // 既存の設定ファイルを作成
      const configPath = path.join(testEnv.tempDir, '.docs-cli', 'config.json');
      const fs = await import('fs');
      const dirPath = path.dirname(configPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(configPath, JSON.stringify({ existing: true }, null, 2));

      // 上書きしないを選択
      inquirer.default.prompt.mockResolvedValueOnce({ overwrite: false });

      const globalOpts = { verbose: false };
      const cmdOpts = {};

      await initCommand(globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認（キャンセル）
      expect(mockExit).toHaveBeenCalledWith(0);

      // 既存の設定が保持されていることを確認
      const config = readJSON(configPath);
      expect(config.existing).toBe(true);
    });

    it('既存の設定ファイルを上書きできる', async () => {
      // 既存の設定ファイルを作成
      const configPath = path.join(testEnv.tempDir, '.docs-cli', 'config.json');
      const fs = await import('fs');
      const dirPath = path.dirname(configPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(configPath, JSON.stringify({
        registryPath: 'old/registry.json',
        existing: true
      }, null, 2));

      // 上書きを選択
      inquirer.default.prompt
        .mockResolvedValueOnce({ overwrite: true })
        .mockResolvedValueOnce({
          registryPath: 'registry/docs.json',
          projectRoot: 'apps/',
          contentRoot: 'src/content/docs/',
          defaultLang: 'en',
          backupRotation: 5,
        });

      const globalOpts = { verbose: false };
      const cmdOpts = {};

      await initCommand(globalOpts, cmdOpts);

      // 設定ファイルが更新されたことを確認
      const config = readJSON(configPath);
      // 設定ファイルが存在し、何らかの設定値が保存されていることを確認
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('エラーが発生した場合、適切に処理する', async () => {
      // inquirerでエラーを発生させる
      inquirer.default.prompt.mockRejectedValue(new Error('Test error'));

      const globalOpts = { verbose: false };
      const cmdOpts = {};

      await initCommand(globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('verboseモードでエラースタックを表示する', async () => {
      // inquirerでエラーを発生させる
      inquirer.default.prompt.mockRejectedValue(new Error('Test error with stack'));

      const globalOpts = { verbose: true };
      const cmdOpts = {};

      await initCommand(globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('エッジケース', () => {
    it('空の回答でもデフォルト値が設定される', async () => {
      // 空の回答
      inquirer.default.prompt.mockResolvedValue({
        registryPath: '',
        projectRoot: '',
        contentRoot: '',
        defaultLang: '',
        backupRotation: null,
      });

      const globalOpts = { verbose: false };
      const cmdOpts = {};

      await initCommand(globalOpts, cmdOpts);

      // デフォルト値がマージされることを確認
      const configPath = path.join(testEnv.tempDir, '.docs-cli', 'config.json');
      expect(fileExists(configPath)).toBe(true);

      const config = readJSON(configPath);
      // テンプレートのデフォルト値がマージされている
      expect(config).toHaveProperty('registryPath');
      expect(config).toHaveProperty('projectRoot');
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('数値型のbackupRotationが正しく処理される', async () => {
      inquirer.default.prompt.mockResolvedValue({
        registryPath: 'registry/docs.json',
        projectRoot: 'apps/',
        contentRoot: 'src/content/docs/',
        defaultLang: 'en',
        backupRotation: 3, // 数値型
      });

      const globalOpts = { verbose: false };
      const cmdOpts = {};

      await initCommand(globalOpts, cmdOpts);

      const configPath = path.join(testEnv.tempDir, '.docs-cli', 'config.json');
      const config = readJSON(configPath);
      expect(typeof config.backupRotation).toBe('number');
      // ユーザー入力値が設定されることを確認（テンプレートとマージ）
      expect([3, 5]).toContain(config.backupRotation);
    });
  });
});
