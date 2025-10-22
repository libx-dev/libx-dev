/**
 * validateコマンドのユニットテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupTest, createTestRegistry, fileExists } from '../../helpers/fixtures.js';
import path from 'path';
import fs from 'fs';

// process.exitをモック
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {});

// console.logをモック（JSON出力のため）
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('validateコマンド', () => {
  let testEnv;
  let validateCommand;

  beforeEach(async () => {
    testEnv = setupTest('validate');

    // モジュールを動的にインポート
    const validateModule = await import('../../../src/commands/validate.js');
    validateCommand = validateModule.default;

    // モックをリセット
    vi.clearAllMocks();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('正常系', () => {
    it('正常なレジストリのバリデーションが成功する', async () => {
      // 完全なレジストリを作成（警告が出ないように）
      const registry = createTestRegistry();
      registry.settings = {};
      registry.projects[0].categories = [];
      registry.projects[0].languages[0].default = true;
      registry.projects[0].documents.forEach(doc => {
        doc.versions = ['v1'];
        doc.status = 'published';
        doc.visibility = 'public';
        doc.summary = { en: 'Summary', ja: '要約' };
      });

      const registryPath = path.join(testEnv.tempDir, 'registry', 'complete.json');
      const dirPath = path.dirname(registryPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: false };
      const cmdOpts = {};

      await validateCommand(registryPath, globalOpts, cmdOpts);

      // process.exit(0)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('レジストリパスが指定されない場合、デフォルトパスを使用する', async () => {
      // デフォルトパスにレジストリを作成
      const defaultPath = path.join(testEnv.tempDir, 'registry', 'docs.json');
      const registry = createTestRegistry();
      registry.settings = {};
      registry.projects[0].categories = [];
      registry.projects[0].languages[0].default = true;
      registry.projects[0].documents.forEach(doc => {
        doc.versions = ['v1'];
        doc.status = 'published';
        doc.visibility = 'public';
        doc.summary = { en: 'Summary', ja: '要約' };
      });

      const dirPath = path.dirname(defaultPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(defaultPath, JSON.stringify(registry, null, 2));

      // カレントディレクトリを変更
      const originalCwd = process.cwd();
      process.chdir(testEnv.tempDir);

      const globalOpts = { verbose: false, json: false };
      const cmdOpts = {};

      await validateCommand(null, globalOpts, cmdOpts);

      // 元のディレクトリに戻す
      process.chdir(originalCwd);

      // バリデーション成功
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('JSON形式で結果を出力できる', async () => {
      // 完全なレジストリを作成
      const registry = createTestRegistry();
      registry.settings = {};
      registry.projects[0].categories = [];
      registry.projects[0].languages[0].default = true;
      registry.projects[0].documents.forEach(doc => {
        doc.versions = ['v1'];
        doc.status = 'published';
        doc.visibility = 'public';
        doc.summary = { en: 'Summary', ja: '要約' };
      });

      const registryPath = path.join(testEnv.tempDir, 'registry', 'json-test.json');
      const dirPath = path.dirname(registryPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: true };
      const cmdOpts = {};

      await validateCommand(registryPath, globalOpts, cmdOpts);

      // JSON出力が呼ばれたことを確認（JSON文字列を探す）
      expect(mockConsoleLog).toHaveBeenCalled();
      const calls = mockConsoleLog.mock.calls;
      const jsonCall = calls.find(call => {
        const output = call[0];
        return typeof output === 'string' && output.trim().startsWith('{');
      });
      expect(jsonCall).toBeDefined();
      const result = JSON.parse(jsonCall[0]);

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errorCount');
      expect(result).toHaveProperty('warningCount');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(result.valid).toBe(true);
    });

    it('verboseモードで詳細ログを出力する', async () => {
      // 完全なレジストリを作成
      const registry = createTestRegistry();
      registry.settings = {};
      registry.projects[0].categories = [];
      registry.projects[0].languages[0].default = true;
      registry.projects[0].documents.forEach(doc => {
        doc.versions = ['v1'];
        doc.status = 'published';
        doc.visibility = 'public';
        doc.summary = { en: 'Summary', ja: '要約' };
      });

      const registryPath = path.join(testEnv.tempDir, 'registry', 'verbose-test.json');
      const dirPath = path.dirname(registryPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: true, json: false };
      const cmdOpts = {};

      await validateCommand(registryPath, globalOpts, cmdOpts);

      // バリデーション成功
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe('バリデーションオプション', () => {
    it('厳格モードで警告がある場合、エラーとして扱う', async () => {
      // 警告が出るレジストリを作成（settingsフィールドなし）
      const registry = createTestRegistry();
      delete registry.settings; // 警告を発生させる

      const registryPath = path.join(testEnv.tempDir, 'registry', 'test-strict.json');
      const dirPath = path.dirname(registryPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: false };
      const cmdOpts = { strict: true };

      await validateCommand(registryPath, globalOpts, cmdOpts);

      // 厳格モードでは警告もエラー扱い
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('通常モードでは警告があっても成功する', async () => {
      // 警告が出るレジストリを作成（settingsなし、categoriesなし、default languageなし）
      const registry = createTestRegistry();
      delete registry.settings; // 警告
      registry.projects[0].categories = [];
      // default言語を設定（エラーにならないように）
      registry.projects[0].languages[0].default = true;
      registry.projects[0].documents.forEach(doc => {
        doc.versions = ['v1'];
        doc.status = 'published';
        doc.visibility = 'public';
        // summaryなしで警告を発生させる
      });

      const registryPath = path.join(testEnv.tempDir, 'registry', 'test-warnings.json');
      const dirPath = path.dirname(registryPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: false };
      const cmdOpts = { strict: false };

      await validateCommand(registryPath, globalOpts, cmdOpts);

      // 警告があっても成功
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('checkContentオプションを指定できる', async () => {
      const registryPath = testEnv.registryPath;
      const globalOpts = { verbose: false, json: false };
      const cmdOpts = { checkContent: true };

      await validateCommand(registryPath, globalOpts, cmdOpts);

      // バリデーション実行
      expect(mockExit).toHaveBeenCalled();
    });

    it('checkSyncHashオプションを指定できる', async () => {
      const registryPath = testEnv.registryPath;
      const globalOpts = { verbose: false, json: false };
      const cmdOpts = { checkSyncHash: true };

      await validateCommand(registryPath, globalOpts, cmdOpts);

      // バリデーション実行
      expect(mockExit).toHaveBeenCalled();
    });
  });

  describe('異常系', () => {
    it('レジストリファイルが存在しない場合、エラーを返す', async () => {
      const nonExistentPath = path.join(testEnv.tempDir, 'non-existent.json');
      const globalOpts = { verbose: false, json: false };
      const cmdOpts = {};

      await validateCommand(nonExistentPath, globalOpts, cmdOpts);

      // process.exit(1)が呼ばれたことを確認
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('不正なJSONフォーマットの場合、エラーを返す', async () => {
      const invalidJsonPath = path.join(testEnv.tempDir, 'registry', 'invalid.json');
      const dirPath = path.dirname(invalidJsonPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      // 不正なJSON
      fs.writeFileSync(invalidJsonPath, '{ invalid json }');

      const globalOpts = { verbose: false, json: false };
      const cmdOpts = {};

      await validateCommand(invalidJsonPath, globalOpts, cmdOpts);

      // process.exit(2)が呼ばれたことを確認（実行エラー）
      expect(mockExit).toHaveBeenCalledWith(2);
    });

    it('verboseモードでエラースタックを表示する', async () => {
      const invalidJsonPath = path.join(testEnv.tempDir, 'registry', 'invalid2.json');
      const dirPath = path.dirname(invalidJsonPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(invalidJsonPath, '{ invalid json }');

      const globalOpts = { verbose: true, json: false };
      const cmdOpts = {};

      await validateCommand(invalidJsonPath, globalOpts, cmdOpts);

      // エラー終了
      expect(mockExit).toHaveBeenCalledWith(2);
    });

    it('必須フィールドが不足している場合、エラーを返す', async () => {
      // $schemaVersionフィールドがないレジストリ
      const invalidRegistry = {
        metadata: {},
        projects: [],
      };

      const registryPath = path.join(testEnv.tempDir, 'registry', 'invalid-schema.json');
      const dirPath = path.dirname(registryPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(registryPath, JSON.stringify(invalidRegistry, null, 2));

      const globalOpts = { verbose: false, json: false };
      const cmdOpts = {};

      await validateCommand(registryPath, globalOpts, cmdOpts);

      // バリデーション失敗
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('projectsが配列でない場合、エラーを返す', async () => {
      const invalidRegistry = {
        $schemaVersion: '1.0.0',
        metadata: {},
        projects: 'invalid', // 配列でない
      };

      const registryPath = path.join(testEnv.tempDir, 'registry', 'invalid-projects.json');
      const dirPath = path.dirname(registryPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(registryPath, JSON.stringify(invalidRegistry, null, 2));

      const globalOpts = { verbose: false, json: false };
      const cmdOpts = {};

      await validateCommand(registryPath, globalOpts, cmdOpts);

      // バリデーション失敗
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('エッジケース', () => {
    it('空のプロジェクト配列でもバリデーション成功する', async () => {
      const emptyRegistry = {
        $schemaVersion: '1.0.0',
        metadata: {
          generatorVersion: '1.0.0',
          lastModified: new Date().toISOString(),
        },
        projects: [], // 空配列
        settings: {},
      };

      const registryPath = path.join(testEnv.tempDir, 'registry', 'empty-projects.json');
      const dirPath = path.dirname(registryPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(registryPath, JSON.stringify(emptyRegistry, null, 2));

      const globalOpts = { verbose: false, json: false };
      const cmdOpts = {};

      await validateCommand(registryPath, globalOpts, cmdOpts);

      // バリデーション成功
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('reportオプションがjsonの場合、JSON形式で出力する', async () => {
      // 完全なレジストリを作成
      const registry = createTestRegistry();
      registry.settings = {};
      registry.projects[0].categories = [];
      registry.projects[0].languages[0].default = true;
      registry.projects[0].documents.forEach(doc => {
        doc.versions = ['v1'];
        doc.status = 'published';
        doc.visibility = 'public';
        doc.summary = { en: 'Summary', ja: '要約' };
      });

      const registryPath = path.join(testEnv.tempDir, 'registry', 'report-json.json');
      const dirPath = path.dirname(registryPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: false, json: false };
      const cmdOpts = { report: 'json' };

      await validateCommand(registryPath, globalOpts, cmdOpts);

      // JSON出力が呼ばれたことを確認（JSON文字列を探す）
      expect(mockConsoleLog).toHaveBeenCalled();
      const calls = mockConsoleLog.mock.calls;
      const jsonCall = calls.find(call => {
        const output = call[0];
        return typeof output === 'string' && output.trim().startsWith('{');
      });
      expect(jsonCall).toBeDefined();
      const result = JSON.parse(jsonCall[0]);

      expect(result.valid).toBe(true);
    });

    it('複数のバリデーションオプションを同時に指定できる', async () => {
      // 完全なレジストリを作成
      const registry = createTestRegistry();
      registry.settings = {};
      registry.projects[0].categories = [];
      registry.projects[0].languages[0].default = true;
      registry.projects[0].documents.forEach(doc => {
        doc.versions = ['v1'];
        doc.status = 'published';
        doc.visibility = 'public';
        doc.summary = { en: 'Summary', ja: '要約' };
      });

      const registryPath = path.join(testEnv.tempDir, 'registry', 'multi-opts.json');
      const dirPath = path.dirname(registryPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

      const globalOpts = { verbose: true, json: false };
      const cmdOpts = {
        strict: false,
        checkContent: true,
        checkSyncHash: true,
      };

      await validateCommand(registryPath, globalOpts, cmdOpts);

      // バリデーション実行成功
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });
});
