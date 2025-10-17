/**
 * ロガーユーティリティ
 *
 * カラー出力、ログレベル、JSON出力をサポートします。
 */

import chalk from 'chalk';

/**
 * ログレベル定義
 */
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4,
};

/**
 * Loggerクラス
 */
export class Logger {
  constructor(options = {}) {
    this.level = options.level || LOG_LEVELS.INFO;
    this.jsonMode = options.jsonMode || false;
    this.verbose = options.verbose || false;
    this.logs = [];
  }

  /**
   * ログレベルを設定
   */
  setLevel(level) {
    this.level = level;
  }

  /**
   * JSONモードを設定
   */
  setJsonMode(enabled) {
    this.jsonMode = enabled;
  }

  /**
   * 詳細モードを設定
   */
  setVerbose(enabled) {
    this.verbose = enabled;
    if (enabled && this.level > LOG_LEVELS.DEBUG) {
      this.level = LOG_LEVELS.DEBUG;
    }
  }

  /**
   * DEBUGレベルのログ
   */
  debug(message, data = null) {
    if (this.level <= LOG_LEVELS.DEBUG) {
      this._log('debug', message, data, chalk.gray);
    }
  }

  /**
   * INFOレベルのログ
   */
  info(message, data = null) {
    if (this.level <= LOG_LEVELS.INFO) {
      this._log('info', message, data, chalk.blue);
    }
  }

  /**
   * 成功メッセージ
   */
  success(message, data = null) {
    if (this.level <= LOG_LEVELS.INFO) {
      this._log('success', message, data, chalk.green);
    }
  }

  /**
   * WARNレベルのログ
   */
  warn(message, data = null) {
    if (this.level <= LOG_LEVELS.WARN) {
      this._log('warn', message, data, chalk.yellow);
    }
  }

  /**
   * ERRORレベルのログ
   */
  error(message, data = null) {
    if (this.level <= LOG_LEVELS.ERROR) {
      this._log('error', message, data, chalk.red);
    }
  }

  /**
   * 内部ログ出力メソッド
   */
  _log(level, message, data, colorFn) {
    const logEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(logEntry);

    if (this.jsonMode) {
      console.log(JSON.stringify(logEntry));
    } else {
      const icon = this._getIcon(level);
      const coloredMessage = colorFn ? colorFn(`${icon} ${message}`) : `${icon} ${message}`;
      console.log(coloredMessage);
      if (data && this.verbose) {
        console.log(chalk.gray(JSON.stringify(data, null, 2)));
      }
    }
  }

  /**
   * レベルに応じたアイコンを取得
   */
  _getIcon(level) {
    const icons = {
      debug: '🔍',
      info: 'ℹ️',
      success: '✅',
      warn: '⚠️',
      error: '❌',
    };
    return icons[level] || 'ℹ️';
  }

  /**
   * プログレスバー風の表示
   */
  progress(message) {
    if (this.level <= LOG_LEVELS.INFO && !this.jsonMode) {
      process.stdout.write(chalk.cyan(`⏳ ${message}...`));
    }
  }

  /**
   * プログレス完了
   */
  progressDone(message = '完了') {
    if (this.level <= LOG_LEVELS.INFO && !this.jsonMode) {
      console.log(chalk.green(` ${message}`));
    }
  }

  /**
   * プログレス失敗
   */
  progressFail(message = '失敗') {
    if (this.level <= LOG_LEVELS.INFO && !this.jsonMode) {
      console.log(chalk.red(` ${message}`));
    }
  }

  /**
   * 区切り線を表示
   */
  separator() {
    if (!this.jsonMode) {
      console.log(chalk.gray('─'.repeat(50)));
    }
  }

  /**
   * 改行
   */
  newline() {
    if (!this.jsonMode) {
      console.log('');
    }
  }

  /**
   * すべてのログを取得
   */
  getAllLogs() {
    return this.logs;
  }

  /**
   * ログをクリア
   */
  clearLogs() {
    this.logs = [];
  }
}

/**
 * デフォルトロガーインスタンス
 */
let defaultLogger = new Logger();

/**
 * デフォルトロガーを取得
 */
export function getLogger() {
  return defaultLogger;
}

/**
 * デフォルトロガーを設定
 */
export function setDefaultLogger(logger) {
  defaultLogger = logger;
}

/**
 * 新しいロガーインスタンスを作成
 */
export function createLogger(options) {
  return new Logger(options);
}

/**
 * 便利な関数をエクスポート
 */
export const debug = (...args) => defaultLogger.debug(...args);
export const info = (...args) => defaultLogger.info(...args);
export const success = (...args) => defaultLogger.success(...args);
export const warn = (...args) => defaultLogger.warn(...args);
export const error = (...args) => defaultLogger.error(...args);
export const progress = (...args) => defaultLogger.progress(...args);
export const progressDone = (...args) => defaultLogger.progressDone(...args);
export const progressFail = (...args) => defaultLogger.progressFail(...args);
export const separator = () => defaultLogger.separator();
export const newline = () => defaultLogger.newline();
