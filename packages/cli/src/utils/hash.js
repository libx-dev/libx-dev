/**
 * ハッシュ計算ユーティリティ
 *
 * ファイル内容のSHA-256ハッシュを計算します（syncHash生成用）。
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';

/**
 * ファイル内容のSHA-256ハッシュを計算
 *
 * @param {string} filePath - ファイルパス
 * @returns {string} SHA-256ハッシュ（16進数文字列）
 */
export function calculateFileHash(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return createHash('sha256').update(content).digest('hex');
  } catch (error) {
    throw new Error(`ハッシュ計算エラー: ${filePath} - ${error.message}`);
  }
}

/**
 * 文字列のSHA-256ハッシュを計算
 *
 * @param {string} content - 内容
 * @returns {string} SHA-256ハッシュ（16進数文字列）
 */
export function calculateStringHash(content) {
  return createHash('sha256').update(content).digest('hex');
}
