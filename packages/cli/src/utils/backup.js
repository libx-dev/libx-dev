/**
 * バックアップ/ロールバック管理ユーティリティ
 *
 * ファイル変更時の自動バックアップと失敗時のロールバック機能を提供
 */

import fs from 'fs';
import path from 'path';
import { getLogger } from './logger.js';

const logger = getLogger();

/**
 * BackupManagerクラス
 */
export class BackupManager {
  constructor(options = {}) {
    this.backups = new Map();
    this.createdPaths = [];
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupDir = options.backupDir || '.backups';
    this.projectRoot = options.projectRoot || process.cwd();
    this.sessionDir = path.join(this.projectRoot, this.backupDir, this.timestamp);
  }

  /**
   * ファイルをバックアップ
   */
  backupFile(filePath) {
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(this.projectRoot, filePath);

    if (!fs.existsSync(absolutePath)) {
      logger.debug(`バックアップスキップ（ファイルが存在しません）: ${filePath}`);
      return null;
    }

    try {
      const content = fs.readFileSync(absolutePath, 'utf-8');
      this.backups.set(absolutePath, content);

      // バックアップディレクトリにもコピー
      const relativePath = path.relative(this.projectRoot, absolutePath);
      const backupPath = path.join(this.sessionDir, relativePath);
      const backupDirPath = path.dirname(backupPath);

      if (!fs.existsSync(backupDirPath)) {
        fs.mkdirSync(backupDirPath, { recursive: true });
      }

      fs.writeFileSync(backupPath, content, 'utf-8');
      logger.debug(`バックアップ成功: ${filePath} -> ${backupPath}`);

      return content;
    } catch (error) {
      logger.warn(`バックアップ警告: ${filePath} - ${error.message}`);
      return null;
    }
  }

  /**
   * 複数ファイルをバックアップ
   */
  backupFiles(filePaths) {
    const results = {};
    for (const filePath of filePaths) {
      results[filePath] = this.backupFile(filePath);
    }
    return results;
  }

  /**
   * 作成したパスを記録
   */
  recordCreatedPath(pathToRecord) {
    this.createdPaths.push(pathToRecord);
    logger.debug(`作成記録: ${pathToRecord}`);
  }

  /**
   * 作成したファイル/ディレクトリを記録
   */
  recordCreated(pathToRecord) {
    this.recordCreatedPath(pathToRecord);
  }

  /**
   * ロールバックを実行
   */
  async rollback() {
    logger.info('ロールバックを実行しています...');

    let rollbackSuccess = true;

    // 作成したファイル・ディレクトリを削除（逆順）
    for (let i = this.createdPaths.length - 1; i >= 0; i--) {
      const pathToDelete = this.createdPaths[i];
      try {
        if (fs.existsSync(pathToDelete)) {
          const stats = fs.statSync(pathToDelete);
          if (stats.isDirectory()) {
            fs.rmSync(pathToDelete, { recursive: true, force: true });
            logger.debug(`ディレクトリ削除: ${pathToDelete}`);
          } else {
            fs.unlinkSync(pathToDelete);
            logger.debug(`ファイル削除: ${pathToDelete}`);
          }
        }
      } catch (error) {
        logger.error(`削除失敗: ${pathToDelete} - ${error.message}`);
        rollbackSuccess = false;
      }
    }

    // バックアップしたファイルを復元
    for (const [filePath, content] of this.backups) {
      try {
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        fs.writeFileSync(filePath, content, 'utf-8');
        logger.debug(`ファイル復元: ${filePath}`);
      } catch (error) {
        logger.error(`復元失敗: ${filePath} - ${error.message}`);
        rollbackSuccess = false;
      }
    }

    if (rollbackSuccess) {
      logger.success('ロールバック完了');
    } else {
      logger.error('ロールバック中にエラーが発生しました');
    }

    return rollbackSuccess;
  }

  /**
   * バックアップをクリーンアップ（古いバックアップを削除）
   */
  static cleanup(options = {}) {
    const backupDir = options.backupDir || '.backups';
    const projectRoot = options.projectRoot || process.cwd();
    const keepCount = options.keepCount || 5;
    const backupPath = path.join(projectRoot, backupDir);

    if (!fs.existsSync(backupPath)) {
      return;
    }

    try {
      const backups = fs.readdirSync(backupPath)
        .filter(name => {
          const fullPath = path.join(backupPath, name);
          return fs.statSync(fullPath).isDirectory();
        })
        .map(name => ({
          name,
          path: path.join(backupPath, name),
          mtime: fs.statSync(path.join(backupPath, name)).mtime,
        }))
        .sort((a, b) => b.mtime - a.mtime); // 新しい順

      // 保持数を超えたバックアップを削除
      const toDelete = backups.slice(keepCount);
      for (const backup of toDelete) {
        fs.rmSync(backup.path, { recursive: true, force: true });
        logger.debug(`古いバックアップを削除: ${backup.name}`);
      }

      if (toDelete.length > 0) {
        logger.info(`${toDelete.length}件の古いバックアップを削除しました`);
      }
    } catch (error) {
      logger.warn(`バックアップのクリーンアップに失敗: ${error.message}`);
    }
  }

  /**
   * バックアップ一覧を取得
   */
  static listBackups(options = {}) {
    const backupDir = options.backupDir || '.backups';
    const projectRoot = options.projectRoot || process.cwd();
    const backupPath = path.join(projectRoot, backupDir);

    if (!fs.existsSync(backupPath)) {
      return [];
    }

    try {
      const backups = fs.readdirSync(backupPath)
        .filter(name => {
          const fullPath = path.join(backupPath, name);
          return fs.statSync(fullPath).isDirectory();
        })
        .map(name => ({
          name,
          path: path.join(backupPath, name),
          mtime: fs.statSync(path.join(backupPath, name)).mtime,
        }))
        .sort((a, b) => b.mtime - a.mtime); // 新しい順

      return backups;
    } catch (error) {
      logger.warn(`バックアップ一覧の取得に失敗: ${error.message}`);
      return [];
    }
  }

  /**
   * 特定のバックアップから復元
   */
  static async restore(backupName, options = {}) {
    const backupDir = options.backupDir || '.backups';
    const projectRoot = options.projectRoot || process.cwd();
    const backupPath = path.join(projectRoot, backupDir, backupName);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`バックアップが見つかりません: ${backupName}`);
    }

    logger.info(`バックアップから復元中: ${backupName}`);

    try {
      // バックアップディレクトリ内のすべてのファイルを復元
      const restoreRecursive = (srcDir, destDir) => {
        const entries = fs.readdirSync(srcDir, { withFileTypes: true });

        for (const entry of entries) {
          const srcPath = path.join(srcDir, entry.name);
          const destPath = path.join(destDir, entry.name);

          if (entry.isDirectory()) {
            if (!fs.existsSync(destPath)) {
              fs.mkdirSync(destPath, { recursive: true });
            }
            restoreRecursive(srcPath, destPath);
          } else {
            const content = fs.readFileSync(srcPath, 'utf-8');
            fs.writeFileSync(destPath, content, 'utf-8');
            logger.debug(`復元: ${destPath}`);
          }
        }
      };

      restoreRecursive(backupPath, projectRoot);
      logger.success('復元完了');
      return true;
    } catch (error) {
      logger.error(`復元に失敗: ${error.message}`);
      return false;
    }
  }

  /**
   * バックアップセッション情報を取得
   */
  getSessionInfo() {
    return {
      timestamp: this.timestamp,
      sessionDir: this.sessionDir,
      backedUpFiles: Array.from(this.backups.keys()),
      createdPaths: [...this.createdPaths],
    };
  }
}

/**
 * バックアップマネージャーを作成
 */
export function createBackupManager(options) {
  return new BackupManager(options);
}

/**
 * エクスポート
 */
export default BackupManager;
