/**
 * バリデーションエラーメッセージの定義
 *
 * すべてのエラーコードに対応する日本語メッセージとヒントを提供します。
 */

/**
 * エラーメッセージのテンプレート
 *
 * プレースホルダー形式: {variable}
 */
export const ERROR_MESSAGES = {
  // スキーマ検証エラー
  SCHEMA_INVALID: {
    message: 'スキーマバリデーションに失敗しました',
    hint: 'スキーマ定義を確認してください',
  },
  SCHEMA_VERSION_MISSING: {
    message: '$schemaVersion フィールドが見つかりません',
    hint: 'ルートレベルに "$schemaVersion": "1.0.0" を追加してください',
  },
  SCHEMA_VERSION_INVALID: {
    message: '$schemaVersion が無効な形式です: {version}',
    hint: 'SemVer形式（例: "1.0.0"）で指定してください',
  },
  SCHEMA_VERSION_INCOMPATIBLE: {
    message: 'スキーマバージョン {version} はサポートされていません',
    hint: 'サポートされているバージョン: {supportedVersions}',
  },

  // プロジェクト検証エラー
  PROJECT_ID_DUPLICATE: {
    message: 'プロジェクトID "{id}" が重複しています',
    hint: 'プロジェクトIDは一意である必要があります',
  },
  PROJECT_ID_INVALID: {
    message: 'プロジェクトID "{id}" が無効な形式です',
    hint: '小文字英数字とハイフンのみ使用可能です（例: "sample-docs"）',
  },
  PROJECT_REQUIRED_FIELD_MISSING: {
    message: 'プロジェクト "{id}" に必須フィールド "{field}" がありません',
    hint: '{field} フィールドを追加してください',
  },

  // 言語検証エラー
  LANGUAGE_CODE_INVALID: {
    message: '言語コード "{code}" が無効な形式です',
    hint: 'BCP 47形式で指定してください（例: "en", "ja", "zh-Hans"）',
  },
  LANGUAGE_NOT_FOUND: {
    message: '言語 "{code}" がプロジェクトの言語リストに存在しません',
    hint: '利用可能な言語: {availableLanguages}',
  },
  LANGUAGE_DEFAULT_MULTIPLE: {
    message: 'デフォルト言語が複数指定されています',
    hint: 'default: true を持つ言語は1つだけにしてください',
  },
  LANGUAGE_DEFAULT_MISSING: {
    message: 'デフォルト言語が指定されていません',
    hint: 'いずれかの言語に default: true を設定してください',
  },

  // バージョン検証エラー
  VERSION_ID_INVALID: {
    message: 'バージョンID "{id}" が無効な形式です',
    hint: '"v"で始まる形式で指定してください（例: "v1", "v2.1"）',
  },
  VERSION_NOT_FOUND: {
    message: 'バージョン "{version}" がプロジェクトのバージョンリストに存在しません',
    hint: '利用可能なバージョン: {availableVersions}',
  },
  VERSION_LATEST_MULTIPLE: {
    message: '最新バージョン（isLatest: true）が複数指定されています',
    hint: 'isLatest: true を持つバージョンは1つだけにしてください',
  },
  VERSION_LATEST_MISSING: {
    message: '最新バージョンが指定されていません',
    hint: 'いずれかのバージョンに isLatest: true を設定してください',
  },

  // ドキュメント検証エラー
  DOCUMENT_ID_DUPLICATE: {
    message: 'ドキュメントID "{id}" がプロジェクト内で重複しています',
    hint: 'ドキュメントIDは一意である必要があります',
  },
  DOCUMENT_ID_INVALID: {
    message: 'ドキュメントID "{id}" が無効な形式です',
    hint: '小文字英数字とハイフンのみ使用可能です（例: "01-getting-started"）',
  },
  DOCUMENT_SLUG_DUPLICATE: {
    message: 'スラッグ "{slug}" が重複しています',
    hint: 'スラッグはプロジェクト内で一意である必要があります',
  },
  DOCUMENT_NOT_FOUND: {
    message: 'ドキュメントID "{id}" が見つかりません',
    hint: '参照先のドキュメントIDを確認してください',
  },

  // コンテンツ検証エラー
  CONTENT_FILE_NOT_FOUND: {
    message: 'コンテンツファイルが見つかりません: {path}',
    hint: 'ファイルパスを確認するか、status を "missing" に設定してください',
  },
  CONTENT_STATUS_MISMATCH: {
    message: 'ステータス "{status}" とファイル存在状態が一致しません',
    hint: 'ファイルが存在する場合は status を "published" または "draft" にしてください',
  },
  CONTENT_LANGUAGE_MISSING: {
    message: '言語 "{lang}" のコンテンツが定義されていません',
    hint: 'content.{lang} セクションを追加してください',
  },
  CONTENT_SYNCHASH_MISMATCH: {
    message: 'syncHash が現在のファイル内容と一致しません',
    hint: 'syncHash を再計算してください',
  },

  // カテゴリ検証エラー
  CATEGORY_ID_DUPLICATE: {
    message: 'カテゴリID "{id}" が重複しています',
    hint: 'カテゴリIDは階層内で一意である必要があります',
  },
  CATEGORY_DOCUMENT_NOT_FOUND: {
    message: 'カテゴリ "{categoryId}" に存在しないドキュメント "{docId}" が含まれています',
    hint: 'ドキュメントIDを確認するか、ドキュメントを追加してください',
  },
  CATEGORY_CIRCULAR_REFERENCE: {
    message: 'カテゴリ "{id}" に循環参照が検出されました',
    hint: 'カテゴリの階層構造を見直してください',
  },

  // ライセンス検証エラー
  LICENSE_ID_NOT_FOUND: {
    message: 'ライセンスID "{id}" が見つかりません',
    hint: 'licenses セクションにライセンス定義を追加してください',
  },
  LICENSE_URL_INVALID: {
    message: 'ライセンスURL "{url}" が無効な形式です',
    hint: '有効なURL形式で指定してください',
  },

  // 用語集検証エラー
  GLOSSARY_TERM_DUPLICATE: {
    message: '用語 "{term}" が重複しています',
    hint: '用語は一意である必要があります',
  },
  GLOSSARY_RELATED_DOC_NOT_FOUND: {
    message: '用語集の関連ドキュメント "{docId}" が見つかりません',
    hint: 'relatedDocs に指定されたドキュメントIDを確認してください',
  },

  // メタ情報検証エラー
  META_KEYWORDS_EXCESSIVE: {
    message: 'keywords の数が多すぎます（{count}個）',
    hint: 'keywords は10個以下にすることを推奨します',
  },
  META_TAGS_EXCESSIVE: {
    message: 'tags の数が多すぎます（{count}個）',
    hint: 'tags は10個以下にすることを推奨します',
  },

  // Visibility/Status 検証エラー
  VISIBILITY_STATUS_CONFLICT: {
    message: 'visibility "{visibility}" と status "{status}" の組み合わせが無効です',
    hint: 'visibility が "public" の場合、status は "published" である必要があります',
  },

  // 参照整合性エラー
  REFERENCE_INTEGRITY_FAILED: {
    message: '参照整合性チェックに失敗しました',
    hint: '参照先のIDやパスを確認してください',
  },

  // 一般的なエラー
  VALIDATION_FAILED: {
    message: 'バリデーションに失敗しました',
    hint: 'エラー内容を確認して修正してください',
  },
  UNKNOWN_ERROR: {
    message: '予期しないエラーが発生しました',
    hint: 'システム管理者に問い合わせてください',
  },
};

/**
 * エラーメッセージを取得し、プレースホルダーを置換する
 *
 * @param {string} code - エラーコード
 * @param {Object} params - プレースホルダーの値
 * @returns {Object} message と hint を含むオブジェクト
 */
export function getErrorMessage(code, params = {}) {
  const template = ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;

  const message = replacePlaceholders(template.message, params);
  const hint = template.hint ? replacePlaceholders(template.hint, params) : null;

  return { message, hint };
}

/**
 * プレースホルダーを実際の値に置換する
 *
 * @param {string} text - テンプレート文字列
 * @param {Object} params - 置換する値
 * @returns {string} 置換後の文字列
 */
function replacePlaceholders(text, params) {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });
}
