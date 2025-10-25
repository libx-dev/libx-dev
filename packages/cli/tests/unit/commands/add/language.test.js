/**
 * add languageコマンドのユニットテスト
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

describe('add languageコマンド', () => {
  let testEnv;
  let addLanguageCommand;
  let originalCwd;

  beforeEach(async () => {
    testEnv = setupTest('add-language');

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
    const addModule = await import('../../../../src/commands/add/language.js');
    addLanguageCommand = addModule.default;

    // モックをリセット
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 元のディレクトリに戻す
    process.chdir(originalCwd);
    testEnv.cleanup();
  });

  describe('正常系', () => {
    it('新規言語を追加できる（--yesオプション）', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        displayName: 'Korean',
      };

      await addLanguageCommand('test-project-1', 'ko', globalOpts, cmdOpts);

      // process.exitが呼ばれない（正常終了）
      expect(mockExit).not.toHaveBeenCalled();

      // レジストリに言語が追加されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const language = project.languages.find(l => l.code === 'ko');

      expect(language).toBeDefined();
      expect(language.displayName).toBe('Korean');
      expect(language.status).toBe('active');
    });

    it('デフォルト表示名で新規言語を追加できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addLanguageCommand('test-project-1', 'ko', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const language = project.languages.find(l => l.code === 'ko');

      expect(language).toBeDefined();
      expect(language.displayName).toBe('한국어'); // デフォルト値
    });

    it('テンプレート言語からコンテンツをコピーできる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        displayName: 'Korean',
        templateLang: 'en',
      };

      await addLanguageCommand('test-project-1', 'ko', globalOpts, cmdOpts);

      // 正常終了を確認
      expect(mockExit).not.toHaveBeenCalled();

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const language = project.languages.find(l => l.code === 'ko');

      expect(language).toBeDefined();
    });

    it('デフォルト言語として設定できる', async () => {
      // レジストリでenをデフォルトに設定
      const registry = createTestRegistry();
      registry.projects[0].languages[0].default = true; // en
      fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        displayName: 'Korean',
        setDefault: true,
      };

      await addLanguageCommand('test-project-1', 'ko', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const updatedRegistry = JSON.parse(registryContent);
      const project = updatedRegistry.projects.find(p => p.id === 'test-project-1');
      const koLang = project.languages.find(l => l.code === 'ko');
      const enLang = project.languages.find(l => l.code === 'en');

      expect(koLang.default).toBe(true);
      expect(enLang.default).toBe(false); // 既存のデフォルトがfalseになる
    });

    it('dry-runモードで実行できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: true };
      const cmdOpts = {
        yes: true,
        displayName: 'Korean',
      };

      await addLanguageCommand('test-project-1', 'ko', globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);

      // レジストリが変更されていないことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const language = project.languages.find(l => l.code === 'ko');

      expect(language).toBeUndefined(); // 言語が追加されていない
    });

    it('バックアップファイルが作成される', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        displayName: 'Korean',
      };

      await addLanguageCommand('test-project-1', 'ko', globalOpts, cmdOpts);

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
        displayName: 'Korean',
      };

      await addLanguageCommand('test-project-1', 'ko', globalOpts, cmdOpts);

      // console.logが複数回呼ばれたことを確認（詳細ログ）
      expect(mockConsoleLog.mock.calls.length).toBeGreaterThan(0);
    });

    it('JSONモードで実行できる', async () => {
      const globalOpts = { verbose: false, json: true, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        displayName: 'Korean',
      };

      await addLanguageCommand('test-project-1', 'ko', globalOpts, cmdOpts);

      // レジストリに言語が追加されたことを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const language = project.languages.find(l => l.code === 'ko');

      expect(language).toBeDefined();
    });

    it('autoTemplateオプションでテンプレートから自動コピーできる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        autoTemplate: true,
        displayName: 'Korean',
      };

      await addLanguageCommand('test-project-1', 'ko', globalOpts, cmdOpts);

      // 正常終了を確認
      expect(mockExit).not.toHaveBeenCalled();
    });
  });

  describe('異常系', () => {
    it('存在しないプロジェクトIDの場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addLanguageCommand('non-existent-project', 'ko', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('既に存在する言語コードの場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addLanguageCommand('test-project-1', 'en', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('サポートされていない言語コードの場合、エラーを返す', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addLanguageCommand('test-project-1', 'invalid-lang', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('verboseモードでエラースタックを表示する', async () => {
      const globalOpts = { verbose: true, json: false, yes: false, dryRun: false };
      const cmdOpts = { yes: true };

      await addLanguageCommand('non-existent-project', 'ko', globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);

      // ログが出力されたことを確認
      const totalLogCalls = mockConsoleLog.mock.calls.length + mockConsoleError.mock.calls.length;
      expect(totalLogCalls).toBeGreaterThan(0);
    });
  });

  describe('エッジケース', () => {
    it('複数の言語がある場合でも新規追加できる', async () => {
      // 既存のレジストリ（en + ja）にdeを追加
      const registry = createTestRegistry();
      registry.projects[0].languages.push({
        code: 'de',
        displayName: 'Deutsch',
        status: 'active',
        default: false,
      });
      fs.writeFileSync(testEnv.registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        displayName: 'Korean',
      };

      await addLanguageCommand('test-project-1', 'ko', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const updatedRegistry = JSON.parse(registryContent);
      const project = updatedRegistry.projects.find(p => p.id === 'test-project-1');

      // 4つの言語があることを確認（en + ja + de + ko）
      expect(project.languages.length).toBe(4);
      const ko = project.languages.find(l => l.code === 'ko');
      expect(ko).toBeDefined();
    });

    it('テンプレート言語が存在しない場合、空のディレクトリを作成する', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        displayName: 'Korean',
        templateLang: 'ja', // 存在しない言語
      };

      await addLanguageCommand('test-project-1', 'ko', globalOpts, cmdOpts);

      // 正常終了を確認
      expect(mockExit).not.toHaveBeenCalled();
    });

    it('中国語（簡体字）を追加できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const cmdOpts = {
        yes: true,
        displayName: '简体中文',
      };

      await addLanguageCommand('test-project-1', 'zh-Hans', globalOpts, cmdOpts);

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');
      const language = project.languages.find(l => l.code === 'zh-Hans');

      expect(language).toBeDefined();
      expect(language.code).toBe('zh-Hans');
    });

    it('複数のサポート済み言語を順次追加できる', async () => {
      const globalOpts = { verbose: false, json: false, yes: false, dryRun: false };
      const languages = [
        { code: 'ko', displayName: 'Korean' },
        { code: 'de', displayName: 'German' },
        { code: 'fr', displayName: 'French' },
      ];

      for (const lang of languages) {
        const cmdOpts = {
          yes: true,
          displayName: lang.displayName,
        };
        await addLanguageCommand('test-project-1', lang.code, globalOpts, cmdOpts);
      }

      // レジストリを確認
      const registryContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);
      const project = registry.projects.find(p => p.id === 'test-project-1');

      // 5つの言語があることを確認（元のen + 元のja + ko + de + fr）
      expect(project.languages.length).toBe(5);
    });
  });
});
