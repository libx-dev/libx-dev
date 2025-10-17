/**
 * BackupManagerクラスのユニットテスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { BackupManager, createBackupManager } from '../../src/utils/backup.js';
import { setupTest, cleanupTempDir } from '../helpers/fixtures.js';

describe('BackupManager', () => {
  let testEnv;
  let backupManager;

  beforeEach(() => {
    testEnv = setupTest('backup');
    backupManager = new BackupManager({
      projectRoot: testEnv.tempDir,
      backupDir: '.backups',
    });
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('基本機能', () => {
    it('BackupManagerインスタンスを作成できる', () => {
      expect(backupManager).toBeInstanceOf(BackupManager);
      expect(backupManager.projectRoot).toBe(testEnv.tempDir);
      expect(backupManager.backupDir).toBe('.backups');
    });

    it('タイムスタンプ付きのセッションディレクトリが設定される', () => {
      expect(backupManager.timestamp).toBeDefined();
      expect(backupManager.sessionDir).toContain('.backups');
      expect(backupManager.sessionDir).toContain(backupManager.timestamp);
    });

    it('createBackupManager関数でインスタンスを作成できる', () => {
      const manager = createBackupManager({ projectRoot: testEnv.tempDir });
      expect(manager).toBeInstanceOf(BackupManager);
    });
  });

  describe('ファイルバックアップ', () => {
    it('存在するファイルをバックアップできる', () => {
      const result = backupManager.backupFile(testEnv.registryPath);

      expect(result).toBeDefined();
      expect(result).toContain('"$schema"');

      // バックアップファイルが作成されている
      const relativePath = path.relative(testEnv.tempDir, testEnv.registryPath);
      const backupPath = path.join(backupManager.sessionDir, relativePath);
      expect(fs.existsSync(backupPath)).toBe(true);
    });

    it('存在しないファイルはスキップされる', () => {
      const nonExistentPath = path.join(testEnv.tempDir, 'nonexistent.json');
      const result = backupManager.backupFile(nonExistentPath);

      expect(result).toBeNull();
    });

    it('複数のファイルをバックアップできる', () => {
      const file1 = path.join(testEnv.tempDir, 'file1.txt');
      const file2 = path.join(testEnv.tempDir, 'file2.txt');

      fs.writeFileSync(file1, 'content1', 'utf-8');
      fs.writeFileSync(file2, 'content2', 'utf-8');

      const results = backupManager.backupFiles([file1, file2]);

      expect(results[file1]).toBe('content1');
      expect(results[file2]).toBe('content2');
    });

    it('相対パスを渡してもバックアップできる', () => {
      const relativePath = path.relative(testEnv.tempDir, testEnv.registryPath);
      const result = backupManager.backupFile(relativePath);

      expect(result).toBeDefined();
    });
  });

  describe('作成パスの記録', () => {
    it('作成したパスを記録できる', () => {
      const newPath = path.join(testEnv.tempDir, 'new-file.txt');
      backupManager.recordCreated(newPath);

      expect(backupManager.createdPaths).toContain(newPath);
    });

    it('複数のパスを記録できる', () => {
      backupManager.recordCreated('/path/to/file1');
      backupManager.recordCreated('/path/to/file2');

      expect(backupManager.createdPaths).toHaveLength(2);
    });
  });

  describe('ロールバック', () => {
    it('バックアップからファイルを復元できる', async () => {
      const originalContent = fs.readFileSync(testEnv.registryPath, 'utf-8');

      // バックアップ
      backupManager.backupFile(testEnv.registryPath);

      // ファイルを変更
      fs.writeFileSync(testEnv.registryPath, 'modified content', 'utf-8');
      expect(fs.readFileSync(testEnv.registryPath, 'utf-8')).toBe('modified content');

      // ロールバック
      const result = await backupManager.rollback();
      expect(result).toBe(true);

      // 元の内容に戻っている
      const restoredContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      expect(restoredContent).toBe(originalContent);
    });

    it('作成したファイルを削除できる', async () => {
      const newFile = path.join(testEnv.tempDir, 'new-file.txt');

      // 新規ファイル作成を記録
      fs.writeFileSync(newFile, 'new content', 'utf-8');
      backupManager.recordCreated(newFile);
      expect(fs.existsSync(newFile)).toBe(true);

      // ロールバック
      await backupManager.rollback();

      // ファイルが削除されている
      expect(fs.existsSync(newFile)).toBe(false);
    });

    it('作成したディレクトリを削除できる', async () => {
      const newDir = path.join(testEnv.tempDir, 'new-dir');

      // 新規ディレクトリ作成を記録
      fs.mkdirSync(newDir);
      backupManager.recordCreated(newDir);
      expect(fs.existsSync(newDir)).toBe(true);

      // ロールバック
      await backupManager.rollback();

      // ディレクトリが削除されている
      expect(fs.existsSync(newDir)).toBe(false);
    });

    it('バックアップと作成物削除を組み合わせてロールバックできる', async () => {
      const originalContent = fs.readFileSync(testEnv.registryPath, 'utf-8');
      const newFile = path.join(testEnv.tempDir, 'new-file.txt');

      // 既存ファイルのバックアップ
      backupManager.backupFile(testEnv.registryPath);

      // 既存ファイルを変更
      fs.writeFileSync(testEnv.registryPath, 'modified', 'utf-8');

      // 新規ファイル作成
      fs.writeFileSync(newFile, 'new content', 'utf-8');
      backupManager.recordCreated(newFile);

      // ロールバック
      await backupManager.rollback();

      // 既存ファイルが復元されている
      expect(fs.readFileSync(testEnv.registryPath, 'utf-8')).toBe(originalContent);

      // 新規ファイルが削除されている
      expect(fs.existsSync(newFile)).toBe(false);
    });
  });

  describe('バックアップクリーンアップ', () => {
    it('古いバックアップを削除できる', () => {
      const backupRoot = path.join(testEnv.tempDir, '.backups');

      // 複数のバックアップディレクトリを作成
      const backup1 = path.join(backupRoot, 'backup-1');
      const backup2 = path.join(backupRoot, 'backup-2');
      const backup3 = path.join(backupRoot, 'backup-3');

      fs.mkdirSync(backup1, { recursive: true });
      fs.mkdirSync(backup2, { recursive: true });
      fs.mkdirSync(backup3, { recursive: true });

      // 保持数2でクリーンアップ
      BackupManager.cleanup({
        projectRoot: testEnv.tempDir,
        keepCount: 2,
      });

      const remainingBackups = fs.readdirSync(backupRoot);
      expect(remainingBackups.length).toBeLessThanOrEqual(2);
    });
  });

  describe('バックアップ一覧', () => {
    it('バックアップ一覧を取得できる', () => {
      const backupRoot = path.join(testEnv.tempDir, '.backups');

      // バックアップディレクトリを作成
      const backup1 = path.join(backupRoot, 'backup-1');
      const backup2 = path.join(backupRoot, 'backup-2');

      fs.mkdirSync(backup1, { recursive: true });
      fs.mkdirSync(backup2, { recursive: true });

      const backups = BackupManager.listBackups({
        projectRoot: testEnv.tempDir,
      });

      expect(backups.length).toBeGreaterThanOrEqual(2);
      expect(backups[0]).toHaveProperty('name');
      expect(backups[0]).toHaveProperty('path');
      expect(backups[0]).toHaveProperty('mtime');
    });

    it('バックアップがない場合は空配列を返す', () => {
      const emptyDir = path.join(testEnv.tempDir, 'empty');
      fs.mkdirSync(emptyDir);

      const backups = BackupManager.listBackups({
        projectRoot: emptyDir,
      });

      expect(backups).toEqual([]);
    });
  });

  describe('セッション情報', () => {
    it('セッション情報を取得できる', () => {
      backupManager.backupFile(testEnv.registryPath);
      backupManager.recordCreated('/path/to/new-file');

      const info = backupManager.getSessionInfo();

      expect(info).toHaveProperty('timestamp');
      expect(info).toHaveProperty('sessionDir');
      expect(info).toHaveProperty('backedUpFiles');
      expect(info).toHaveProperty('createdPaths');

      expect(info.backedUpFiles).toContain(testEnv.registryPath);
      expect(info.createdPaths).toContain('/path/to/new-file');
    });
  });
});
