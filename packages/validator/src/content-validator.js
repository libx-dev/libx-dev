/**
 * コンテンツファイルバリデーター
 *
 * ドキュメントコンテンツファイルの存在と整合性をチェックします。
 * - documents[].content[lang].path のファイル存在確認
 * - status と実ファイルの一致チェック
 * - syncHash の再計算と差分検出（オプション）
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ValidationError, ValidationWarning, ValidationErrorCollection } from './errors.js';
import { getErrorMessage } from './messages.js';

/**
 * コンテンツファイルバリデータークラス
 */
export class ContentValidator {
  /**
   * コンストラクタ
   *
   * @param {string} projectRoot - プロジェクトルートパス
   */
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
  }

  /**
   * レジストリデータのコンテンツファイルをチェック
   *
   * @param {Object} registryData - レジストリデータ
   * @param {Object} options - オプション
   * @param {boolean} options.checkSyncHash - syncHash チェックを実行するか
   * @returns {ValidationErrorCollection} バリデーション結果
   */
  validate(registryData, options = {}) {
    const errors = new ValidationErrorCollection();
    const { checkSyncHash = false } = options;

    if (!registryData.projects || !Array.isArray(registryData.projects)) {
      return errors;
    }

    // 各プロジェクトをチェック
    for (let i = 0; i < registryData.projects.length; i++) {
      const project = registryData.projects[i];
      const basePath = `projects[${i}]`;

      this.validateProjectContent(project, basePath, errors, { checkSyncHash });
    }

    return errors;
  }

  /**
   * プロジェクトのコンテンツを検証
   *
   * @param {Object} project - プロジェクトオブジェクト
   * @param {string} basePath - ベースパス
   * @param {ValidationErrorCollection} errors - エラーコレクション
   * @param {Object} options - オプション
   */
  validateProjectContent(project, basePath, errors, options) {
    if (!project.documents || !Array.isArray(project.documents)) {
      return;
    }

    for (let i = 0; i < project.documents.length; i++) {
      const doc = project.documents[i];
      const docPath = `${basePath}.documents[${i}]`;

      this.validateDocumentContent(doc, docPath, errors, options);
    }
  }

  /**
   * ドキュメントのコンテンツを検証
   *
   * @param {Object} doc - ドキュメントオブジェクト
   * @param {string} docPath - ドキュメントパス
   * @param {ValidationErrorCollection} errors - エラーコレクション
   * @param {Object} options - オプション
   */
  validateDocumentContent(doc, docPath, errors, options) {
    if (!doc.content || typeof doc.content !== 'object') {
      return;
    }

    for (const lang of Object.keys(doc.content)) {
      const contentMeta = doc.content[lang];
      const contentPath = `${docPath}.content.${lang}`;

      this.validateContentMeta(contentMeta, contentPath, errors, options);
    }
  }

  /**
   * コンテンツメタデータを検証
   *
   * @param {Object} contentMeta - コンテンツメタデータ
   * @param {string} contentPath - コンテンツパス
   * @param {ValidationErrorCollection} errors - エラーコレクション
   * @param {Object} options - オプション
   */
  validateContentMeta(contentMeta, contentPath, errors, options) {
    const { checkSyncHash } = options;

    if (!contentMeta.path) {
      return;
    }

    const filePath = path.join(this.projectRoot, contentMeta.path);
    const fileExists = fs.existsSync(filePath);

    // ファイル存在チェック
    if (!fileExists) {
      // status が "missing" の場合は警告のみ
      if (contentMeta.status === 'missing') {
        const { message, hint } = getErrorMessage('CONTENT_FILE_NOT_FOUND', {
          path: contentMeta.path,
        });
        errors.add(new ValidationWarning(
          'CONTENT_FILE_NOT_FOUND',
          message,
          hint,
          `${contentPath}.path`
        ));
      } else {
        const { message, hint } = getErrorMessage('CONTENT_FILE_NOT_FOUND', {
          path: contentMeta.path,
        });
        errors.add(new ValidationError(
          'CONTENT_FILE_NOT_FOUND',
          message,
          hint,
          `${contentPath}.path`
        ));
      }
      return;
    }

    // status とファイル存在の整合性チェック
    if (contentMeta.status === 'missing' && fileExists) {
      const { message, hint } = getErrorMessage('CONTENT_STATUS_MISMATCH', {
        status: contentMeta.status,
      });
      errors.add(new ValidationWarning(
        'CONTENT_STATUS_MISMATCH',
        message,
        hint,
        `${contentPath}.status`
      ));
    }

    // syncHash チェック（オプション）
    if (checkSyncHash && contentMeta.syncHash && fileExists) {
      const currentHash = this.calculateFileHash(filePath);

      if (currentHash !== contentMeta.syncHash) {
        const { message, hint } = getErrorMessage('CONTENT_SYNCHASH_MISMATCH');
        errors.add(new ValidationWarning(
          'CONTENT_SYNCHASH_MISMATCH',
          message,
          hint,
          `${contentPath}.syncHash`
        ));
      }
    }
  }

  /**
   * ファイルのハッシュ値を計算
   *
   * @param {string} filePath - ファイルパス
   * @returns {string} SHA-256ハッシュ値
   */
  calculateFileHash(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const hash = crypto.createHash('sha256');
      hash.update(content);
      return hash.digest('hex').substring(0, 16); // 先頭16文字
    } catch (error) {
      return null;
    }
  }

  /**
   * syncHash を再計算してレジストリデータを更新
   *
   * @param {Object} registryData - レジストリデータ
   * @returns {Object} 更新されたレジストリデータ
   */
  recalculateSyncHashes(registryData) {
    if (!registryData.projects || !Array.isArray(registryData.projects)) {
      return registryData;
    }

    for (const project of registryData.projects) {
      if (!project.documents || !Array.isArray(project.documents)) {
        continue;
      }

      for (const doc of project.documents) {
        if (!doc.content || typeof doc.content !== 'object') {
          continue;
        }

        for (const lang of Object.keys(doc.content)) {
          const contentMeta = doc.content[lang];

          if (contentMeta.path) {
            const filePath = path.join(this.projectRoot, contentMeta.path);

            if (fs.existsSync(filePath)) {
              const newHash = this.calculateFileHash(filePath);
              if (newHash) {
                contentMeta.syncHash = newHash;
              }
            }
          }
        }
      }
    }

    return registryData;
  }
}

/**
 * デフォルトのコンテンツバリデーターを作成
 *
 * @param {string} projectRoot - プロジェクトルートパス
 * @returns {ContentValidator} ContentValidator インスタンス
 */
export function createContentValidator(projectRoot) {
  return new ContentValidator(projectRoot);
}
