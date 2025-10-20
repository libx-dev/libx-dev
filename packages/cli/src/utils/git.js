/**
 * Git情報取得ユーティリティ
 *
 * Git履歴からファイルの最終更新日時、コミットハッシュ、レビュー担当者などを取得します。
 */

import { execSync } from 'child_process';
import { statSync, existsSync } from 'fs';
import * as logger from './logger.js';

/**
 * ファイルの最終更新日時を取得
 *
 * @param {string} filePath - ファイルパス
 * @returns {string|null} ISO 8601形式の日時、またはnull
 */
export function getLastUpdated(filePath) {
  try {
    // Gitリポジトリ内のファイルかチェック
    if (isInGitRepo()) {
      const output = execSync(`git log -1 --format=%cI "${filePath}"`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'], // stderrを無視
      });
      const date = output.trim();
      if (date) {
        return date;
      }
    }

    // Gitが使えない場合はファイルのmtimeを使用
    if (existsSync(filePath)) {
      const stats = statSync(filePath);
      return stats.mtime.toISOString();
    }

    return null;
  } catch (error) {
    logger.warn(`最終更新日時の取得に失敗: ${filePath}`);
    return null;
  }
}

/**
 * ファイルの最終コミットハッシュを取得
 *
 * @param {string} filePath - ファイルパス
 * @returns {string|null} コミットハッシュ、またはnull
 */
export function getLastCommit(filePath) {
  try {
    if (isInGitRepo()) {
      const output = execSync(`git log -1 --format=%H "${filePath}"`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      return output.trim() || null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * ファイルの最終コミッター名を取得（レビュー担当者として使用）
 *
 * @param {string} filePath - ファイルパス
 * @returns {string|null} コミッター名、またはnull
 */
export function getLastCommitter(filePath) {
  try {
    if (isInGitRepo()) {
      const output = execSync(`git log -1 --format=%cn "${filePath}"`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      return output.trim() || null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * リポジトリのリモートURLを取得
 *
 * @returns {string|null} リモートURL、またはnull
 */
export function getRemoteUrl() {
  try {
    if (isInGitRepo()) {
      const output = execSync('git remote get-url origin', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      return output.trim() || null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * 現在のブランチ名を取得
 *
 * @returns {string|null} ブランチ名、またはnull
 */
export function getCurrentBranch() {
  try {
    if (isInGitRepo()) {
      const output = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      return output.trim() || null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Gitリポジトリ内かどうかを確認
 *
 * @returns {boolean} Gitリポジトリ内ならtrue
 */
function isInGitRepo() {
  try {
    execSync('git rev-parse --is-inside-work-tree', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * ファイルのGitソース情報を取得
 *
 * @param {string} filePath - ファイルパス
 * @param {string} relativePath - リポジトリルートからの相対パス
 * @returns {Object|null} ソース情報、またはnull
 */
export function getSourceInfo(filePath, relativePath) {
  try {
    const repository = getRemoteUrl();
    const branch = getCurrentBranch();
    const commit = getLastCommit(filePath);

    if (!repository) {
      return null;
    }

    return {
      repository,
      branch: branch || 'main',
      commit: commit || undefined,
      path: relativePath,
    };
  } catch (error) {
    logger.warn(`ソース情報の取得に失敗: ${filePath}`);
    return null;
  }
}
