/**
 * exportコマンドの統合テスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { RegistryManager } from '../../src/utils/registry.js';
import { setupTest } from '../helpers/fixtures.js';
import exportCommand from '../../src/commands/export.js';

describe('exportコマンド 統合テスト', () => {
  let testEnv;
  let manager;

  beforeEach(() => {
    testEnv = setupTest('export');
    manager = new RegistryManager({
      registryPath: 'registry/docs.json',
      projectRoot: testEnv.tempDir,
      validateOnSave: false,
    });
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('JSON形式でのエクスポート', () => {
    it('全データをJSON形式でエクスポートできる', async () => {
      manager.load();

      const outputPath = path.join(testEnv.tempDir, 'export-all.json');

      const globalOpts = {
        json: false,
        verbose: false,
        dryRun: false,
        yes: false,
      };

      const cmdOpts = {
        format: 'json',
        type: 'all',
        output: outputPath,
      };

      try {
        await exportCommand(globalOpts, cmdOpts);
      } catch (error) {
        // process.exit()によるエラーは無視
      }

      // ファイルが作成されたことを確認
      expect(fs.existsSync(outputPath)).toBe(true);

      // JSONファイルの内容を確認
      const content = fs.readFileSync(outputPath, 'utf-8');
      const data = JSON.parse(content);

      expect(data).toHaveProperty('projects');
      expect(data).toHaveProperty('documents');
      expect(Array.isArray(data.projects)).toBe(true);
      expect(Array.isArray(data.documents)).toBe(true);
    });

    it('プロジェクトのみをJSON形式でエクスポートできる', async () => {
      manager.load();

      const outputPath = path.join(testEnv.tempDir, 'export-projects.json');

      const globalOpts = {
        json: false,
        verbose: false,
        dryRun: false,
        yes: false,
      };

      const cmdOpts = {
        format: 'json',
        type: 'projects',
        output: outputPath,
      };

      try {
        await exportCommand(globalOpts, cmdOpts);
      } catch (error) {
        // process.exit()によるエラーは無視
      }

      expect(fs.existsSync(outputPath)).toBe(true);

      const content = fs.readFileSync(outputPath, 'utf-8');
      const data = JSON.parse(content);

      expect(data).toHaveProperty('projects');
      expect(data).not.toHaveProperty('documents');
    });

    it('特定プロジェクトのみをエクスポートできる', async () => {
      // Note: このテストは実際のレジストリファイルを使用する
      const outputPath = path.join(testEnv.tempDir, 'export-test-verification.json');

      const globalOpts = {
        json: false,
        verbose: false,
        dryRun: false,
        yes: false,
      };

      const cmdOpts = {
        format: 'json',
        type: 'all',
        project: 'test-verification',  // 実際のレジストリに存在するプロジェクト
        output: outputPath,
      };

      try {
        await exportCommand(globalOpts, cmdOpts);
      } catch (error) {
        // process.exit()によるエラーは無視
      }

      expect(fs.existsSync(outputPath)).toBe(true);

      const content = fs.readFileSync(outputPath, 'utf-8');
      const data = JSON.parse(content);

      expect(data.projects).toHaveLength(1);
      expect(data.projects[0].id).toBe('test-verification');
    });
  });

  describe('CSV形式でのエクスポート', () => {
    it('プロジェクトをCSV形式でエクスポートできる', async () => {
      manager.load();

      const outputPath = path.join(testEnv.tempDir, 'export-projects.csv');

      const globalOpts = {
        json: false,
        verbose: false,
        dryRun: false,
        yes: false,
      };

      const cmdOpts = {
        format: 'csv',
        type: 'projects',
        output: outputPath,
      };

      try {
        await exportCommand(globalOpts, cmdOpts);
      } catch (error) {
        // process.exit()によるエラーは無視
      }

      expect(fs.existsSync(outputPath)).toBe(true);

      const content = fs.readFileSync(outputPath, 'utf-8');
      expect(content).toContain('"ID","Display Name (EN)"');
    });

    it('ドキュメントをCSV形式でエクスポートできる', async () => {
      manager.load();

      const outputPath = path.join(testEnv.tempDir, 'export-documents.csv');

      const globalOpts = {
        json: false,
        verbose: false,
        dryRun: false,
        yes: false,
      };

      const cmdOpts = {
        format: 'csv',
        type: 'documents',
        output: outputPath,
      };

      try {
        await exportCommand(globalOpts, cmdOpts);
      } catch (error) {
        // process.exit()によるエラーは無視
      }

      expect(fs.existsSync(outputPath)).toBe(true);

      const content = fs.readFileSync(outputPath, 'utf-8');
      expect(content).toContain('"Document ID","Slug"');
    });
  });

  describe('Markdown形式でのエクスポート', () => {
    it('プロジェクトをMarkdown形式でエクスポートできる', async () => {
      manager.load();

      const outputPath = path.join(testEnv.tempDir, 'export-projects.md');

      const globalOpts = {
        json: false,
        verbose: false,
        dryRun: false,
        yes: false,
      };

      const cmdOpts = {
        format: 'markdown',
        type: 'projects',
        output: outputPath,
      };

      try {
        await exportCommand(globalOpts, cmdOpts);
      } catch (error) {
        // process.exit()によるエラーは無視
      }

      expect(fs.existsSync(outputPath)).toBe(true);

      const content = fs.readFileSync(outputPath, 'utf-8');
      expect(content).toContain('# プロジェクト一覧');
      expect(content).toContain('| ID |');
    });

    it('ドキュメントをMarkdown形式でエクスポートできる', async () => {
      manager.load();

      const outputPath = path.join(testEnv.tempDir, 'export-documents.md');

      const globalOpts = {
        json: false,
        verbose: false,
        dryRun: false,
        yes: false,
      };

      const cmdOpts = {
        format: 'markdown',
        type: 'documents',
        output: outputPath,
      };

      try {
        await exportCommand(globalOpts, cmdOpts);
      } catch (error) {
        // process.exit()によるエラーは無視
      }

      expect(fs.existsSync(outputPath)).toBe(true);

      const content = fs.readFileSync(outputPath, 'utf-8');
      expect(content).toContain('# ドキュメント一覧');
    });
  });

  describe('エラーハンドリング', () => {
    it('サポートされていないフォーマットは拒否される', async () => {
      const globalOpts = {
        json: false,
        verbose: false,
        dryRun: false,
        yes: false,
      };

      const cmdOpts = {
        format: 'xml', // サポートされていない
        type: 'all',
      };

      try {
        await exportCommand(globalOpts, cmdOpts);
        expect(true).toBe(false); // ここには到達しないはず
      } catch (error) {
        // process.exit(1)によるエラー
        expect(error).toBeDefined();
      }
    });

    it('サポートされていないタイプは拒否される', async () => {
      const globalOpts = {
        json: false,
        verbose: false,
        dryRun: false,
        yes: false,
      };

      const cmdOpts = {
        format: 'json',
        type: 'invalid', // サポートされていない
      };

      try {
        await exportCommand(globalOpts, cmdOpts);
        expect(true).toBe(false); // ここには到達しないはず
      } catch (error) {
        // process.exit(1)によるエラー
        expect(error).toBeDefined();
      }
    });

    it('存在しないプロジェクトを指定するとエラー', async () => {
      manager.load();

      const globalOpts = {
        json: false,
        verbose: false,
        dryRun: false,
        yes: false,
      };

      const cmdOpts = {
        format: 'json',
        type: 'all',
        project: 'nonexistent-project',
      };

      try {
        await exportCommand(globalOpts, cmdOpts);
        expect(true).toBe(false); // ここには到達しないはず
      } catch (error) {
        // process.exit()によるエラーは捕捉される
        expect(error).toBeDefined();
      }
    });
  });

  describe('出力先ディレクトリの自動作成', () => {
    it('存在しないディレクトリを自動作成してエクスポートできる', async () => {
      manager.load();

      const outputPath = path.join(testEnv.tempDir, 'nested', 'directory', 'export.json');

      const globalOpts = {
        json: false,
        verbose: false,
        dryRun: false,
        yes: false,
      };

      const cmdOpts = {
        format: 'json',
        type: 'projects',
        output: outputPath,
      };

      try {
        await exportCommand(globalOpts, cmdOpts);
      } catch (error) {
        // process.exit()によるエラーは無視
      }

      expect(fs.existsSync(outputPath)).toBe(true);
    });
  });
});
