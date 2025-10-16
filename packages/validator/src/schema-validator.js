/**
 * スキーマバリデーター
 *
 * Ajv を使用してレジストリデータをスキーマに対して検証します。
 * $schemaVersion のチェックと互換性検証も含みます。
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ValidationError, ValidationErrorCollection } from './errors.js';
import { getErrorMessage } from './messages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * サポートされているスキーマバージョンのリスト
 */
const SUPPORTED_SCHEMA_VERSIONS = ['1.0.0'];

/**
 * スキーマバリデータークラス
 */
export class SchemaValidator {
  /**
   * コンストラクタ
   *
   * @param {string} schemaRootPath - スキーマルートディレクトリのパス
   */
  constructor(schemaRootPath) {
    this.schemaRootPath = schemaRootPath;
    this.ajv = new Ajv({
      strict: false,
      allErrors: true,
      verbose: true,
      validateSchema: false,
    });
    addFormats(this.ajv);

    // スキーマをロード
    this.schemas = this.loadSchemas();
  }

  /**
   * スキーマファイルをロードする
   *
   * @returns {Object} ロードされたスキーマ
   */
  loadSchemas() {
    const rootSchemaPath = path.join(this.schemaRootPath, 'docs.schema.json');

    if (!fs.existsSync(rootSchemaPath)) {
      throw new Error(`ルートスキーマが見つかりません: ${rootSchemaPath}`);
    }

    // 参照されるスキーマを事前にロード
    this.loadReferencedSchemas(this.schemaRootPath);

    // ルートスキーマをロード（参照スキーマの後に）
    const rootSchema = JSON.parse(fs.readFileSync(rootSchemaPath, 'utf-8'));

    return {
      root: rootSchema,
    };
  }

  /**
   * 参照されるスキーマを再帰的にロード
   *
   * @param {string} baseDir - ベースディレクトリ
   */
  loadReferencedSchemas(baseDir) {
    const schemaDir = path.join(baseDir, 'schema');

    if (!fs.existsSync(schemaDir)) {
      return;
    }

    const schemaFiles = [
      'project.schema.json',
      'document.schema.json',
      'category.schema.json',
      'language.schema.json',
      'version.schema.json',
      'settings.schema.json',
      'partials/common.schema.json',
      'partials/contributor.schema.json',
      'partials/document-content.schema.json',
      'partials/glossary.schema.json',
      'partials/license.schema.json',
    ];

    for (const file of schemaFiles) {
      const filePath = path.join(schemaDir, file);

      if (fs.existsSync(filePath)) {
        const schema = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // スキーマを$idで登録（$idがスキーマ内に含まれている）
        this.ajv.addSchema(schema);
      }
    }
  }

  /**
   * レジストリデータをバリデーションする
   *
   * @param {Object} registryData - レジストリデータ
   * @returns {ValidationErrorCollection} バリデーション結果
   */
  validate(registryData) {
    const errors = new ValidationErrorCollection();

    // 1. $schemaVersion のチェック
    this.validateSchemaVersion(registryData, errors);

    // 2. Ajv によるスキーマバリデーション
    this.validateWithAjv(registryData, errors);

    return errors;
  }

  /**
   * $schemaVersion の存在と互換性をチェック
   *
   * @param {Object} data - レジストリデータ
   * @param {ValidationErrorCollection} errors - エラーコレクション
   */
  validateSchemaVersion(data, errors) {
    // $schemaVersion の存在チェック
    if (!data.$schemaVersion) {
      const { message, hint } = getErrorMessage('SCHEMA_VERSION_MISSING');
      errors.add(new ValidationError(
        'SCHEMA_VERSION_MISSING',
        message,
        hint,
        '$schemaVersion'
      ));
      return;
    }

    const version = data.$schemaVersion;

    // SemVer形式のチェック
    const semverPattern = /^\d+\.\d+\.\d+$/;
    if (!semverPattern.test(version)) {
      const { message, hint } = getErrorMessage('SCHEMA_VERSION_INVALID', { version });
      errors.add(new ValidationError(
        'SCHEMA_VERSION_INVALID',
        message,
        hint,
        '$schemaVersion'
      ));
      return;
    }

    // サポートバージョンのチェック
    if (!SUPPORTED_SCHEMA_VERSIONS.includes(version)) {
      const { message, hint } = getErrorMessage('SCHEMA_VERSION_INCOMPATIBLE', {
        version,
        supportedVersions: SUPPORTED_SCHEMA_VERSIONS.join(', '),
      });
      errors.add(new ValidationError(
        'SCHEMA_VERSION_INCOMPATIBLE',
        message,
        hint,
        '$schemaVersion'
      ));
    }
  }

  /**
   * Ajv を使用してスキーマバリデーションを実行
   *
   * @param {Object} data - レジストリデータ
   * @param {ValidationErrorCollection} errors - エラーコレクション
   */
  validateWithAjv(data, errors) {
    const validate = this.ajv.compile(this.schemas.root);
    const valid = validate(data);

    if (!valid && validate.errors) {
      for (const error of validate.errors) {
        // Ajv エラーを ValidationError に変換
        const validationError = this.convertAjvError(error, data);
        errors.add(validationError);
      }
    }
  }

  /**
   * Ajv エラーを ValidationError に変換
   *
   * @param {Object} ajvError - Ajvエラーオブジェクト
   * @param {Object} data - レジストリデータ
   * @returns {ValidationError} ValidationError インスタンス
   */
  convertAjvError(ajvError, data) {
    const path = ajvError.instancePath || ajvError.dataPath || 'root';
    let message = ajvError.message || 'スキーマバリデーションエラー';
    let hint = null;
    let code = 'SCHEMA_INVALID';

    // エラーの種類に応じてメッセージをカスタマイズ
    switch (ajvError.keyword) {
      case 'required':
        code = 'PROJECT_REQUIRED_FIELD_MISSING';
        const field = ajvError.params?.missingProperty;
        message = `必須フィールド "${field}" がありません`;
        hint = `${field} フィールドを追加してください`;
        break;

      case 'type':
        message = `フィールドの型が不正です（期待: ${ajvError.params?.type}）`;
        hint = '正しい型で値を指定してください';
        break;

      case 'pattern':
        message = `フィールドの形式が不正です（パターン: ${ajvError.params?.pattern}）`;
        hint = '正しい形式で値を指定してください';
        break;

      case 'enum':
        message = `値が許可されていません（許可値: ${ajvError.params?.allowedValues?.join(', ')}）`;
        hint = '許可された値のいずれかを指定してください';
        break;

      case 'minItems':
        message = `配列の要素数が少なすぎます（最小: ${ajvError.params?.limit}）`;
        hint = '十分な数の要素を追加してください';
        break;

      case 'minProperties':
        message = `プロパティ数が少なすぎます（最小: ${ajvError.params?.limit}）`;
        hint = '必要なプロパティを追加してください';
        break;

      case 'additionalProperties':
        const additionalProp = ajvError.params?.additionalProperty;
        message = `許可されていないプロパティ "${additionalProp}" が含まれています`;
        hint = 'スキーマで定義されたプロパティのみを使用してください';
        break;

      default:
        message = ajvError.message || 'スキーマバリデーションエラー';
    }

    return new ValidationError(code, message, hint, path);
  }
}

/**
 * デフォルトのスキーマバリデーターを作成
 *
 * @param {string} projectRoot - プロジェクトルートパス
 * @returns {SchemaValidator} SchemaValidator インスタンス
 */
export function createSchemaValidator(projectRoot) {
  const schemaRootPath = path.join(projectRoot, 'registry');
  return new SchemaValidator(schemaRootPath);
}
