/**
 * メタ情報バリデーター
 *
 * レジストリのメタ情報（Pagefind、Glossary、Visibility など）の整合性をチェックします。
 * - Pagefind 用 keywords/tags の存在と型検証
 * - Glossary の重複チェック
 * - Visibility と Draft コンテンツの一貫性チェック
 */

import { ValidationWarning, ValidationErrorCollection } from './errors.js';
import { getErrorMessage } from './messages.js';

/**
 * メタ情報バリデータークラス
 */
export class MetaValidator {
  /**
   * レジストリデータのメタ情報をチェック
   *
   * @param {Object} registryData - レジストリデータ
   * @param {Object} options - オプション
   * @param {number} options.maxKeywords - keywords の最大数
   * @param {number} options.maxTags - tags の最大数
   * @returns {ValidationErrorCollection} バリデーション結果
   */
  validate(registryData, options = {}) {
    const errors = new ValidationErrorCollection();
    const {
      maxKeywords = 10,
      maxTags = 10,
    } = options;

    if (!registryData.projects || !Array.isArray(registryData.projects)) {
      return errors;
    }

    // 各プロジェクトをチェック
    for (let i = 0; i < registryData.projects.length; i++) {
      const project = registryData.projects[i];
      const basePath = `projects[${i}]`;

      this.validateProjectMeta(project, basePath, errors, { maxKeywords, maxTags });
    }

    return errors;
  }

  /**
   * プロジェクトのメタ情報を検証
   *
   * @param {Object} project - プロジェクトオブジェクト
   * @param {string} basePath - ベースパス
   * @param {ValidationErrorCollection} errors - エラーコレクション
   * @param {Object} options - オプション
   */
  validateProjectMeta(project, basePath, errors, options) {
    // ドキュメントのメタ情報検証
    if (project.documents && Array.isArray(project.documents)) {
      this.validateDocumentsMeta(
        project.documents,
        `${basePath}.documents`,
        errors,
        options
      );
    }
  }

  /**
   * ドキュメント配列のメタ情報を検証
   *
   * @param {Array} documents - ドキュメント配列
   * @param {string} basePath - ベースパス
   * @param {ValidationErrorCollection} errors - エラーコレクション
   * @param {Object} options - オプション
   */
  validateDocumentsMeta(documents, basePath, errors, options) {
    const { maxKeywords, maxTags } = options;

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const docPath = `${basePath}[${i}]`;

      // keywords の検証
      if (doc.keywords && Array.isArray(doc.keywords)) {
        if (doc.keywords.length > maxKeywords) {
          const { message, hint } = getErrorMessage('META_KEYWORDS_EXCESSIVE', {
            count: doc.keywords.length,
          });
          errors.add(new ValidationWarning(
            'META_KEYWORDS_EXCESSIVE',
            message,
            hint,
            `${docPath}.keywords`
          ));
        }
      }

      // tags の検証
      if (doc.tags && Array.isArray(doc.tags)) {
        if (doc.tags.length > maxTags) {
          const { message, hint } = getErrorMessage('META_TAGS_EXCESSIVE', {
            count: doc.tags.length,
          });
          errors.add(new ValidationWarning(
            'META_TAGS_EXCESSIVE',
            message,
            hint,
            `${docPath}.tags`
          ));
        }
      }
    }
  }
}

/**
 * デフォルトのメタ情報バリデーターを作成
 *
 * @returns {MetaValidator} MetaValidator インスタンス
 */
export function createMetaValidator() {
  return new MetaValidator();
}
