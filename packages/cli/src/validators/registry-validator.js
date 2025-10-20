/**
 * レジストリバリデーター
 *
 * レジストリ全体の構造と整合性を検証します。
 */

import * as logger from '../utils/logger.js';

/**
 * レジストリ全体をバリデーション
 *
 * @param {Object} registry - レジストリオブジェクト
 * @param {Object} options - バリデーションオプション
 * @returns {Object} { valid: boolean, errors: string[], warnings: string[] }
 */
export function validateRegistry(registry, options = {}) {
  const errors = [];
  const warnings = [];
  const strict = options.strict || false;

  // 必須フィールドの検証
  if (!registry.$schemaVersion) {
    errors.push('$schemaVersion フィールドが必要です');
  }

  if (!registry.metadata) {
    errors.push('metadata フィールドが必要です');
  } else {
    // メタデータの検証
    if (!registry.metadata.createdAt) {
      warnings.push('metadata.createdAt フィールドが推奨されます');
    }
  }

  if (!Array.isArray(registry.projects)) {
    errors.push('projects フィールドが配列である必要があります');
  } else {
    // 各プロジェクトの検証
    for (let i = 0; i < registry.projects.length; i++) {
      const project = registry.projects[i];
      const projectErrors = validateProject(project, options);

      // プロジェクトインデックスを追加
      projectErrors.errors.forEach(err => {
        errors.push(`projects[${i}]: ${err}`);
      });

      projectErrors.warnings.forEach(warn => {
        warnings.push(`projects[${i}]: ${warn}`);
      });
    }

    // プロジェクトIDの重複チェック
    const projectIds = registry.projects.map(p => p.id);
    const duplicateIds = projectIds.filter((id, index) => projectIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`プロジェクトIDが重複しています: ${duplicateIds.join(', ')}`);
    }
  }

  if (!registry.settings) {
    warnings.push('settings フィールドが推奨されます');
  }

  // strictモードでは警告もエラー扱い
  if (strict && warnings.length > 0) {
    errors.push(...warnings);
    warnings.length = 0;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * プロジェクトをバリデーション
 *
 * @param {Object} project - プロジェクトオブジェクト
 * @param {Object} options - バリデーションオプション
 * @returns {Object} { valid: boolean, errors: string[], warnings: string[] }
 */
export function validateProject(project, options = {}) {
  const errors = [];
  const warnings = [];

  // 必須フィールドの検証
  if (!project.id) {
    errors.push('id フィールドが必要です');
  } else {
    // IDの形式チェック（英数字とハイフンのみ）
    if (!/^[a-z0-9-]+$/.test(project.id)) {
      errors.push(`id は英小文字、数字、ハイフンのみ使用可能です: ${project.id}`);
    }
  }

  if (!project.displayName || typeof project.displayName !== 'object') {
    errors.push('displayName フィールドが必要です（オブジェクト形式）');
  } else {
    // デフォルト言語の存在チェック
    if (!project.displayName.en && !project.displayName.ja) {
      warnings.push('displayName に en または ja が推奨されます');
    }
  }

  if (!project.description || typeof project.description !== 'object') {
    errors.push('description フィールドが必要です（オブジェクト形式）');
  }

  if (!Array.isArray(project.languages)) {
    errors.push('languages フィールドが配列である必要があります');
  } else {
    // デフォルト言語の検証
    const defaultLangs = project.languages.filter(lang => lang.default);
    if (defaultLangs.length === 0) {
      errors.push('デフォルト言語が設定されていません');
    } else if (defaultLangs.length > 1) {
      errors.push('デフォルト言語は1つのみ設定可能です');
    }

    // 言語コードの重複チェック
    const langCodes = project.languages.map(l => l.code);
    const duplicateLangs = langCodes.filter((code, index) => langCodes.indexOf(code) !== index);
    if (duplicateLangs.length > 0) {
      errors.push(`言語コードが重複しています: ${duplicateLangs.join(', ')}`);
    }
  }

  if (!Array.isArray(project.versions)) {
    errors.push('versions フィールドが配列である必要があります');
  } else if (project.versions.length === 0) {
    warnings.push('バージョンが1つも登録されていません');
  } else {
    // バージョンIDの重複チェック
    const versionIds = project.versions.map(v => v.id);
    const duplicateVersions = versionIds.filter((id, index) => versionIds.indexOf(id) !== index);
    if (duplicateVersions.length > 0) {
      errors.push(`バージョンIDが重複しています: ${duplicateVersions.join(', ')}`);
    }
  }

  if (!Array.isArray(project.categories)) {
    errors.push('categories フィールドが配列である必要があります');
  } else {
    // カテゴリIDの重複チェック
    const categoryIds = project.categories.map(c => c.id);
    const duplicateCategories = categoryIds.filter((id, index) => categoryIds.indexOf(id) !== index);
    if (duplicateCategories.length > 0) {
      errors.push(`カテゴリIDが重複しています: ${duplicateCategories.join(', ')}`);
    }
  }

  if (!Array.isArray(project.documents)) {
    errors.push('documents フィールドが配列である必要があります');
  } else {
    // ドキュメントIDの重複チェック
    const docIds = project.documents.map(d => d.id);
    const duplicateDocs = docIds.filter((id, index) => docIds.indexOf(id) !== index);
    if (duplicateDocs.length > 0) {
      errors.push(`ドキュメントIDが重複しています: ${duplicateDocs.join(', ')}`);
    }

    // スラッグの重複チェック
    const slugs = project.documents.map(d => d.slug);
    const duplicateSlugs = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    if (duplicateSlugs.length > 0) {
      warnings.push(`スラッグが重複しています: ${duplicateSlugs.join(', ')}`);
    }

    // 各ドキュメントの検証
    for (let i = 0; i < project.documents.length; i++) {
      const doc = project.documents[i];
      const docErrors = validateDocument(doc, project, options);

      docErrors.errors.forEach(err => {
        errors.push(`documents[${i}] (${doc.id}): ${err}`);
      });

      docErrors.warnings.forEach(warn => {
        warnings.push(`documents[${i}] (${doc.id}): ${warn}`);
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * ドキュメントをバリデーション
 *
 * @param {Object} document - ドキュメントオブジェクト
 * @param {Object} project - 親プロジェクト
 * @param {Object} options - バリデーションオプション
 * @returns {Object} { valid: boolean, errors: string[], warnings: string[] }
 */
export function validateDocument(document, project, options = {}) {
  const errors = [];
  const warnings = [];

  // 必須フィールドの検証
  if (!document.id) {
    errors.push('id フィールドが必要です');
  }

  if (!document.slug) {
    errors.push('slug フィールドが必要です');
  }

  if (!document.title || typeof document.title !== 'object') {
    errors.push('title フィールドが必要です（オブジェクト形式）');
  }

  if (!document.summary || typeof document.summary !== 'object') {
    warnings.push('summary フィールドが推奨されます（オブジェクト形式）');
  }

  if (!Array.isArray(document.versions)) {
    errors.push('versions フィールドが配列である必要があります');
  } else if (document.versions.length === 0) {
    warnings.push('バージョンが1つも指定されていません');
  } else {
    // バージョンの存在チェック
    const projectVersionIds = project.versions.map(v => v.id);
    const invalidVersions = document.versions.filter(v => !projectVersionIds.includes(v));
    if (invalidVersions.length > 0) {
      errors.push(`存在しないバージョンが指定されています: ${invalidVersions.join(', ')}`);
    }
  }

  if (!document.status) {
    warnings.push('status フィールドが推奨されます');
  } else {
    // ステータスの値チェック
    const validStatuses = ['published', 'draft', 'archived'];
    if (!validStatuses.includes(document.status)) {
      errors.push(`status は ${validStatuses.join(', ')} のいずれかである必要があります`);
    }
  }

  if (!document.visibility) {
    warnings.push('visibility フィールドが推奨されます');
  } else {
    // 可視性の値チェック
    const validVisibilities = ['public', 'internal', 'private'];
    if (!validVisibilities.includes(document.visibility)) {
      errors.push(`visibility は ${validVisibilities.join(', ')} のいずれかである必要があります`);
    }
  }

  // カテゴリの存在チェック（_categoryId が存在する場合）
  if (document._categoryId) {
    const categoryExists = project.categories.some(c => c.id === document._categoryId);
    if (!categoryExists) {
      errors.push(`存在しないカテゴリが指定されています: ${document._categoryId}`);
    }
  }

  // コンテンツメタの検証
  if (document.content && typeof document.content === 'object') {
    const projectLangCodes = project.languages.map(l => l.code);
    const docLangCodes = Object.keys(document.content);

    // 未定義の言語コードのチェック
    const invalidLangs = docLangCodes.filter(lang => !projectLangCodes.includes(lang));
    if (invalidLangs.length > 0) {
      warnings.push(`プロジェクトで定義されていない言語が含まれています: ${invalidLangs.join(', ')}`);
    }

    // 各言語のコンテンツメタを検証
    for (const lang in document.content) {
      const contentMeta = document.content[lang];

      if (!contentMeta.status) {
        warnings.push(`content.${lang}.status フィールドが推奨されます`);
      } else {
        const validContentStatuses = ['published', 'missing', 'draft', 'in-review'];
        if (!validContentStatuses.includes(contentMeta.status)) {
          errors.push(`content.${lang}.status は ${validContentStatuses.join(', ')} のいずれかである必要があります`);
        }
      }

      if (options.checkSyncHash && !contentMeta.syncHash) {
        warnings.push(`content.${lang}.syncHash フィールドが推奨されます`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * バリデーション結果をログ出力
 *
 * @param {Object} result - バリデーション結果
 */
export function logValidationResult(result) {
  if (result.valid) {
    logger.success('✅ バリデーション成功');
  } else {
    logger.error('❌ バリデーション失敗');
  }

  if (result.errors.length > 0) {
    logger.error(`\nエラー (${result.errors.length}件):`);
    result.errors.forEach(err => logger.error(`  - ${err}`));
  }

  if (result.warnings.length > 0) {
    logger.warn(`\n警告 (${result.warnings.length}件):`);
    result.warnings.forEach(warn => logger.warn(`  - ${warn}`));
  }
}
