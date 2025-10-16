/**
 * LibX Docs Validator - エントリポイント
 *
 * レジストリバリデーションの統合インターフェースを提供します。
 */

import path from 'path';
import { ValidationError, ValidationErrorCollection } from './errors.js';
import { getErrorMessage } from './messages.js';
import { SchemaValidator, createSchemaValidator } from './schema-validator.js';
import { ReferenceValidator, createReferenceValidator } from './reference-validator.js';
import { ContentValidator, createContentValidator } from './content-validator.js';
import { MetaValidator, createMetaValidator } from './meta-validator.js';

// 各クラスと関数をエクスポート
export {
  ValidationError,
  ValidationWarning,
  ValidationErrorCollection,
} from './errors.js';

export { getErrorMessage } from './messages.js';

export {
  SchemaValidator,
  createSchemaValidator,
} from './schema-validator.js';

export {
  ReferenceValidator,
  createReferenceValidator,
} from './reference-validator.js';

export {
  ContentValidator,
  createContentValidator,
} from './content-validator.js';

export {
  MetaValidator,
  createMetaValidator,
} from './meta-validator.js';

/**
 * 統合バリデーションを実行
 *
 * すべてのバリデーター（スキーマ、参照整合性、コンテンツ、メタ情報）を実行します。
 *
 * @param {Object} registryData - レジストリデータ
 * @param {Object} options - バリデーションオプション
 * @param {string} options.projectRoot - プロジェクトルートパス
 * @param {boolean} options.strict - 厳格モード（警告もエラーとして扱う）
 * @param {boolean} options.checkContent - コンテンツファイルチェックを実行するか
 * @param {boolean} options.checkSyncHash - syncHash チェックを実行するか
 * @param {number} options.maxKeywords - keywords の最大数（デフォルト: 10）
 * @param {number} options.maxTags - tags の最大数（デフォルト: 10）
 * @returns {ValidationErrorCollection} 統合されたバリデーション結果
 */
export function validateRegistry(registryData, options = {}) {
  const {
    projectRoot = process.cwd(),
    strict = false,
    checkContent = true,
    checkSyncHash = false,
    maxKeywords = 10,
    maxTags = 10,
  } = options;

  const allErrors = new ValidationErrorCollection();

  try {
    // 1. スキーマバリデーション
    const schemaValidator = createSchemaValidator(projectRoot);
    const schemaErrors = schemaValidator.validate(registryData);
    mergeErrors(allErrors, schemaErrors);

    // スキーマエラーがあれば、以降のバリデーションはスキップ
    if (schemaErrors.hasErrors()) {
      return allErrors;
    }

    // 2. 参照整合性バリデーション
    const referenceValidator = createReferenceValidator();
    const referenceErrors = referenceValidator.validate(registryData, { strict });
    mergeErrors(allErrors, referenceErrors);

    // 3. コンテンツファイルバリデーション（オプション）
    if (checkContent) {
      const contentValidator = createContentValidator(projectRoot);
      const contentErrors = contentValidator.validate(registryData, { checkSyncHash });
      mergeErrors(allErrors, contentErrors);
    }

    // 4. メタ情報バリデーション
    const metaValidator = createMetaValidator();
    const metaErrors = metaValidator.validate(registryData, { maxKeywords, maxTags });
    mergeErrors(allErrors, metaErrors);

  } catch (error) {
    // 予期しないエラーをキャプチャ
    const { message, hint } = getErrorMessage('UNKNOWN_ERROR');
    allErrors.add(new ValidationError(
      'UNKNOWN_ERROR',
      `${message}: ${error.message}`,
      hint,
      null
    ));
  }

  return allErrors;
}

/**
 * エラーコレクションをマージ
 *
 * @param {ValidationErrorCollection} target - マージ先
 * @param {ValidationErrorCollection} source - マージ元
 */
function mergeErrors(target, source) {
  for (const error of source.getAll()) {
    target.add(error);
  }
}

/**
 * バリデーション結果のサマリーを生成
 *
 * @param {ValidationErrorCollection} errors - バリデーション結果
 * @returns {Object} サマリー情報
 */
export function generateSummary(errors) {
  const summary = errors.getSummary();

  return {
    success: !errors.hasErrors(),
    errorCount: summary.errorCount,
    warningCount: summary.warningCount,
    totalCount: summary.totalCount,
    errors: errors.errors.map(e => e.toJSON()),
    warnings: errors.warnings.map(w => w.toJSON()),
  };
}
