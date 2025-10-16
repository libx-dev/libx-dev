/**
 * バリデーションエラークラス
 *
 * すべてのバリデーションエラーを統一フォーマットで管理します。
 * エラーコード、メッセージ、ヒント、パスを含み、CLI での分かりやすい表示を支援します。
 */

export class ValidationError extends Error {
  /**
   * ValidationError コンストラクタ
   *
   * @param {string} code - エラーコード（例: 'MISSING_VERSION'）
   * @param {string} message - エラーメッセージ
   * @param {string|null} hint - ヒントメッセージ（任意）
   * @param {string|null} path - JSONパス（例: 'projects[0].documents[2].versions[0]'）
   */
  constructor(code, message, hint = null, path = null) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.hint = hint;
    this.path = path;
    this.severity = 'error'; // 'error' | 'warning' | 'info'

    // スタックトレースをキャプチャ
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * エラーオブジェクトをJSON形式にシリアライズ
   *
   * @returns {Object} JSONオブジェクト
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      hint: this.hint,
      path: this.path,
      severity: this.severity,
    };
  }

  /**
   * エラーを文字列に変換（カラー出力用）
   *
   * @param {boolean} useColors - カラー出力を使用するか
   * @returns {string} フォーマット済みエラーメッセージ
   */
  toString(useColors = true) {
    const colors = useColors ? {
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      cyan: '\x1b[36m',
      gray: '\x1b[90m',
      reset: '\x1b[0m',
    } : {
      red: '', yellow: '', cyan: '', gray: '', reset: '',
    };

    const severitySymbol = {
      error: `${colors.red}✗${colors.reset}`,
      warning: `${colors.yellow}⚠${colors.reset}`,
      info: `${colors.cyan}ℹ${colors.reset}`,
    }[this.severity];

    let output = `${severitySymbol} [${this.code}] ${this.message}`;

    if (this.path) {
      output += `\n  ${colors.gray}位置:${colors.reset} ${this.path}`;
    }

    if (this.hint) {
      output += `\n  ${colors.cyan}ヒント:${colors.reset} ${this.hint}`;
    }

    return output;
  }
}

/**
 * 警告レベルのバリデーションエラー
 */
export class ValidationWarning extends ValidationError {
  constructor(code, message, hint = null, path = null) {
    super(code, message, hint, path);
    this.severity = 'warning';
  }
}

/**
 * 複数のバリデーションエラーを集約するクラス
 */
export class ValidationErrorCollection {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * エラーを追加
   *
   * @param {ValidationError} error - バリデーションエラー
   */
  add(error) {
    if (error.severity === 'warning') {
      this.warnings.push(error);
    } else {
      this.errors.push(error);
    }
  }

  /**
   * エラーが存在するかチェック
   *
   * @param {boolean} includeWarnings - 警告も含めるか
   * @returns {boolean} エラーが存在する場合はtrue
   */
  hasErrors(includeWarnings = false) {
    return this.errors.length > 0 || (includeWarnings && this.warnings.length > 0);
  }

  /**
   * すべてのエラーと警告を取得
   *
   * @returns {Array<ValidationError>} エラーと警告の配列
   */
  getAll() {
    return [...this.errors, ...this.warnings];
  }

  /**
   * サマリー情報を取得
   *
   * @returns {Object} エラーと警告の件数
   */
  getSummary() {
    return {
      errorCount: this.errors.length,
      warningCount: this.warnings.length,
      totalCount: this.errors.length + this.warnings.length,
    };
  }

  /**
   * すべてのエラーをJSON配列に変換
   *
   * @returns {Array<Object>} JSONオブジェクトの配列
   */
  toJSON() {
    return this.getAll().map(error => error.toJSON());
  }

  /**
   * すべてのエラーを文字列に変換
   *
   * @param {boolean} useColors - カラー出力を使用するか
   * @returns {string} フォーマット済みエラーメッセージ
   */
  toString(useColors = true) {
    const all = this.getAll();
    if (all.length === 0) {
      return '';
    }

    return all.map(error => error.toString(useColors)).join('\n\n');
  }
}
