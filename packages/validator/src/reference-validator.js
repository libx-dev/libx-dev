/**
 * 参照整合性バリデーター
 *
 * レジストリ内の参照（ID参照）の整合性をチェックします。
 * - documents[].versions が projects[].versions[].id に存在するか
 * - documents[].content[lang] が projects[].languages[].code に存在するか
 * - documents[].license が projects[].licenses[].id に存在するか
 * - categories[].docs[docId] が projects[].documents[].id に存在するか
 * - glossary[].relatedDocs[docId] の存在確認
 */

import { ValidationError, ValidationWarning, ValidationErrorCollection } from './errors.js';
import { getErrorMessage } from './messages.js';

/**
 * 参照整合性バリデータークラス
 */
export class ReferenceValidator {
  /**
   * レジストリデータの参照整合性をチェック
   *
   * @param {Object} registryData - レジストリデータ
   * @param {Object} options - オプション
   * @param {boolean} options.strict - 厳格モード（警告もエラーとして扱う）
   * @returns {ValidationErrorCollection} バリデーション結果
   */
  validate(registryData, options = {}) {
    const errors = new ValidationErrorCollection();
    const { strict = false } = options;

    if (!registryData.projects || !Array.isArray(registryData.projects)) {
      return errors;
    }

    // 各プロジェクトをチェック
    for (let i = 0; i < registryData.projects.length; i++) {
      const project = registryData.projects[i];
      const basePath = `projects[${i}]`;

      this.validateProject(project, basePath, errors, { strict });
    }

    // プロジェクトID重複チェック
    this.checkProjectIdDuplicates(registryData.projects, errors);

    return errors;
  }

  /**
   * プロジェクト単位の検証
   *
   * @param {Object} project - プロジェクトオブジェクト
   * @param {string} basePath - ベースパス
   * @param {ValidationErrorCollection} errors - エラーコレクション
   * @param {Object} options - オプション
   */
  validateProject(project, basePath, errors, options) {
    // 言語コードマップを構築
    const languageCodes = new Set(
      (project.languages || []).map(lang => lang.code)
    );

    // バージョンIDマップを構築
    const versionIds = new Set(
      (project.versions || []).map(ver => ver.id)
    );

    // ライセンスIDマップを構築
    const licenseIds = new Set(
      (project.licenses || []).map(lic => lic.id)
    );

    // ドキュメントIDマップを構築
    const documentIds = new Set(
      (project.documents || []).map(doc => doc.id)
    );

    // ドキュメントの検証
    if (project.documents && Array.isArray(project.documents)) {
      this.validateDocuments(
        project.documents,
        `${basePath}.documents`,
        { languageCodes, versionIds, licenseIds, documentIds },
        errors,
        options
      );
    }

    // カテゴリの検証
    if (project.categories && Array.isArray(project.categories)) {
      this.validateCategories(
        project.categories,
        `${basePath}.categories`,
        documentIds,
        errors,
        options
      );
    }

    // 用語集の検証
    if (project.glossary && Array.isArray(project.glossary)) {
      this.validateGlossary(
        project.glossary,
        `${basePath}.glossary`,
        documentIds,
        errors,
        options
      );
    }

    // 言語設定の検証
    this.validateLanguages(project.languages || [], `${basePath}.languages`, errors, options);

    // バージョン設定の検証
    this.validateVersions(project.versions || [], `${basePath}.versions`, errors, options);
  }

  /**
   * ドキュメント配列の検証
   *
   * @param {Array} documents - ドキュメント配列
   * @param {string} basePath - ベースパス
   * @param {Object} references - 参照マップ
   * @param {ValidationErrorCollection} errors - エラーコレクション
   * @param {Object} options - オプション
   */
  validateDocuments(documents, basePath, references, errors, options) {
    const { languageCodes, versionIds, licenseIds, documentIds } = references;

    // ドキュメントIDとスラッグの重複チェック用
    const seenDocIds = new Set();
    const seenSlugs = new Set();

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const docPath = `${basePath}[${i}]`;

      // ドキュメントID重複チェック
      if (seenDocIds.has(doc.id)) {
        const { message, hint } = getErrorMessage('DOCUMENT_ID_DUPLICATE', { id: doc.id });
        errors.add(new ValidationError('DOCUMENT_ID_DUPLICATE', message, hint, `${docPath}.id`));
      }
      seenDocIds.add(doc.id);

      // スラッグ重複チェック
      if (doc.slug && seenSlugs.has(doc.slug)) {
        const { message, hint } = getErrorMessage('DOCUMENT_SLUG_DUPLICATE', { slug: doc.slug });
        errors.add(new ValidationError('DOCUMENT_SLUG_DUPLICATE', message, hint, `${docPath}.slug`));
      }
      if (doc.slug) {
        seenSlugs.add(doc.slug);
      }

      // バージョン参照チェック
      if (doc.versions && Array.isArray(doc.versions)) {
        for (let j = 0; j < doc.versions.length; j++) {
          const version = doc.versions[j];
          if (!versionIds.has(version)) {
            const { message, hint } = getErrorMessage('VERSION_NOT_FOUND', {
              version,
              availableVersions: Array.from(versionIds).join(', '),
            });
            errors.add(new ValidationError(
              'VERSION_NOT_FOUND',
              message,
              hint,
              `${docPath}.versions[${j}]`
            ));
          }
        }
      }

      // コンテンツ言語参照チェック
      if (doc.content && typeof doc.content === 'object') {
        for (const lang of Object.keys(doc.content)) {
          if (!languageCodes.has(lang)) {
            const { message, hint } = getErrorMessage('LANGUAGE_NOT_FOUND', {
              code: lang,
              availableLanguages: Array.from(languageCodes).join(', '),
            });
            errors.add(new ValidationError(
              'LANGUAGE_NOT_FOUND',
              message,
              hint,
              `${docPath}.content.${lang}`
            ));
          }
        }
      }

      // ライセンス参照チェック
      if (doc.license && licenseIds.size > 0 && !licenseIds.has(doc.license)) {
        const { message, hint } = getErrorMessage('LICENSE_ID_NOT_FOUND', { id: doc.license });
        errors.add(new ValidationError(
          'LICENSE_ID_NOT_FOUND',
          message,
          hint,
          `${docPath}.license`
        ));
      }

      // related ドキュメント参照チェック
      if (doc.related && Array.isArray(doc.related)) {
        for (let j = 0; j < doc.related.length; j++) {
          const relatedId = doc.related[j];
          if (!documentIds.has(relatedId)) {
            const { message, hint } = getErrorMessage('DOCUMENT_NOT_FOUND', { id: relatedId });
            errors.add(new ValidationWarning(
              'DOCUMENT_NOT_FOUND',
              message,
              hint,
              `${docPath}.related[${j}]`
            ));
          }
        }
      }

      // visibility と status の組み合わせチェック（strict モード）
      if (options.strict && doc.visibility === 'public' && doc.status !== 'published') {
        const { message, hint } = getErrorMessage('VISIBILITY_STATUS_CONFLICT', {
          visibility: doc.visibility,
          status: doc.status,
        });
        errors.add(new ValidationError(
          'VISIBILITY_STATUS_CONFLICT',
          message,
          hint,
          `${docPath}`
        ));
      }
    }
  }

  /**
   * カテゴリ配列の検証（再帰的）
   *
   * @param {Array} categories - カテゴリ配列
   * @param {string} basePath - ベースパス
   * @param {Set} documentIds - ドキュメントIDセット
   * @param {ValidationErrorCollection} errors - エラーコレクション
   * @param {Object} options - オプション
   * @param {Set} visited - 訪問済みカテゴリID（循環参照検出用）
   */
  validateCategories(categories, basePath, documentIds, errors, options, visited = new Set()) {
    const seenCategoryIds = new Set();

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const catPath = `${basePath}[${i}]`;

      // カテゴリID重複チェック
      if (seenCategoryIds.has(category.id)) {
        const { message, hint } = getErrorMessage('CATEGORY_ID_DUPLICATE', { id: category.id });
        errors.add(new ValidationError('CATEGORY_ID_DUPLICATE', message, hint, `${catPath}.id`));
      }
      seenCategoryIds.add(category.id);

      // 循環参照チェック
      if (visited.has(category.id)) {
        const { message, hint } = getErrorMessage('CATEGORY_CIRCULAR_REFERENCE', { id: category.id });
        errors.add(new ValidationError('CATEGORY_CIRCULAR_REFERENCE', message, hint, catPath));
        continue;
      }

      visited.add(category.id);

      // ドキュメント参照チェック
      if (category.docs && Array.isArray(category.docs)) {
        for (let j = 0; j < category.docs.length; j++) {
          const docId = category.docs[j];
          if (!documentIds.has(docId)) {
            const { message, hint } = getErrorMessage('CATEGORY_DOCUMENT_NOT_FOUND', {
              categoryId: category.id,
              docId,
            });
            errors.add(new ValidationError(
              'CATEGORY_DOCUMENT_NOT_FOUND',
              message,
              hint,
              `${catPath}.docs[${j}]`
            ));
          }
        }
      }

      // 子カテゴリの再帰検証
      if (category.children && Array.isArray(category.children)) {
        this.validateCategories(
          category.children,
          `${catPath}.children`,
          documentIds,
          errors,
          options,
          new Set(visited)
        );
      }

      visited.delete(category.id);
    }
  }

  /**
   * 用語集の検証
   *
   * @param {Array} glossary - 用語集配列
   * @param {string} basePath - ベースパス
   * @param {Set} documentIds - ドキュメントIDセット
   * @param {ValidationErrorCollection} errors - エラーコレクション
   * @param {Object} options - オプション
   */
  validateGlossary(glossary, basePath, documentIds, errors, options) {
    const seenTerms = new Set();

    for (let i = 0; i < glossary.length; i++) {
      const entry = glossary[i];
      const entryPath = `${basePath}[${i}]`;

      // 用語重複チェック
      if (entry.term && seenTerms.has(entry.term.toLowerCase())) {
        const { message, hint } = getErrorMessage('GLOSSARY_TERM_DUPLICATE', { term: entry.term });
        errors.add(new ValidationError('GLOSSARY_TERM_DUPLICATE', message, hint, `${entryPath}.term`));
      }
      if (entry.term) {
        seenTerms.add(entry.term.toLowerCase());
      }

      // 関連ドキュメント参照チェック
      if (entry.relatedDocs && Array.isArray(entry.relatedDocs)) {
        for (let j = 0; j < entry.relatedDocs.length; j++) {
          const docId = entry.relatedDocs[j];
          if (!documentIds.has(docId)) {
            const { message, hint } = getErrorMessage('GLOSSARY_RELATED_DOC_NOT_FOUND', { docId });
            errors.add(new ValidationWarning(
              'GLOSSARY_RELATED_DOC_NOT_FOUND',
              message,
              hint,
              `${entryPath}.relatedDocs[${j}]`
            ));
          }
        }
      }
    }
  }

  /**
   * 言語設定の検証
   *
   * @param {Array} languages - 言語配列
   * @param {string} basePath - ベースパス
   * @param {ValidationErrorCollection} errors - エラーコレクション
   * @param {Object} options - オプション
   */
  validateLanguages(languages, basePath, errors, options) {
    const defaultLanguages = languages.filter(lang => lang.default === true);

    if (defaultLanguages.length === 0) {
      const { message, hint } = getErrorMessage('LANGUAGE_DEFAULT_MISSING');
      errors.add(new ValidationWarning('LANGUAGE_DEFAULT_MISSING', message, hint, basePath));
    } else if (defaultLanguages.length > 1) {
      const { message, hint } = getErrorMessage('LANGUAGE_DEFAULT_MULTIPLE');
      errors.add(new ValidationError('LANGUAGE_DEFAULT_MULTIPLE', message, hint, basePath));
    }
  }

  /**
   * バージョン設定の検証
   *
   * @param {Array} versions - バージョン配列
   * @param {string} basePath - ベースパス
   * @param {ValidationErrorCollection} errors - エラーコレクション
   * @param {Object} options - オプション
   */
  validateVersions(versions, basePath, errors, options) {
    const latestVersions = versions.filter(ver => ver.isLatest === true);

    if (latestVersions.length === 0) {
      const { message, hint } = getErrorMessage('VERSION_LATEST_MISSING');
      errors.add(new ValidationWarning('VERSION_LATEST_MISSING', message, hint, basePath));
    } else if (latestVersions.length > 1) {
      const { message, hint } = getErrorMessage('VERSION_LATEST_MULTIPLE');
      errors.add(new ValidationError('VERSION_LATEST_MULTIPLE', message, hint, basePath));
    }
  }

  /**
   * プロジェクトID重複チェック
   *
   * @param {Array} projects - プロジェクト配列
   * @param {ValidationErrorCollection} errors - エラーコレクション
   */
  checkProjectIdDuplicates(projects, errors) {
    const seenIds = new Set();

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      if (seenIds.has(project.id)) {
        const { message, hint } = getErrorMessage('PROJECT_ID_DUPLICATE', { id: project.id });
        errors.add(new ValidationError(
          'PROJECT_ID_DUPLICATE',
          message,
          hint,
          `projects[${i}].id`
        ));
      }
      seenIds.add(project.id);
    }
  }
}

/**
 * デフォルトの参照整合性バリデーターを作成
 *
 * @returns {ReferenceValidator} ReferenceValidator インスタンス
 */
export function createReferenceValidator() {
  return new ReferenceValidator();
}
