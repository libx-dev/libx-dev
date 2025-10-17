/**
 * Loggerクラスのユニットテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger, LOG_LEVELS, getLogger, createLogger, setDefaultLogger } from '../../src/utils/logger.js';

describe('Logger', () => {
  let logger;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    logger = new Logger();
    // console.logをモック化
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('基本機能', () => {
    it('デフォルトのログレベルはINFO', () => {
      expect(logger.level).toBe(LOG_LEVELS.INFO);
    });

    it('デフォルトではJSONモードは無効', () => {
      expect(logger.jsonMode).toBe(false);
    });

    it('ログレベルを設定できる', () => {
      logger.setLevel(LOG_LEVELS.DEBUG);
      expect(logger.level).toBe(LOG_LEVELS.DEBUG);
    });

    it('JSONモードを設定できる', () => {
      logger.setJsonMode(true);
      expect(logger.jsonMode).toBe(true);
    });

    it('verboseモードを設定するとログレベルがDEBUGになる', () => {
      logger.setVerbose(true);
      expect(logger.verbose).toBe(true);
      expect(logger.level).toBe(LOG_LEVELS.DEBUG);
    });
  });

  describe('ログ出力', () => {
    it('INFOレベルのメッセージを出力できる', () => {
      logger.info('test message');
      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy.mock.calls[0][0]).toContain('test message');
    });

    it('DEBUGレベルのメッセージはデフォルトでは出力されない', () => {
      logger.debug('debug message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('DEBUGレベルに設定するとDEBUGメッセージが出力される', () => {
      logger.setLevel(LOG_LEVELS.DEBUG);
      logger.debug('debug message');
      expect(consoleLogSpy).toHaveBeenCalledOnce();
    });

    it('WARNレベルのメッセージを出力できる', () => {
      logger.warn('warning message');
      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy.mock.calls[0][0]).toContain('warning message');
    });

    it('ERRORレベルのメッセージを出力できる', () => {
      logger.error('error message');
      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy.mock.calls[0][0]).toContain('error message');
    });

    it('SUCCESSメッセージを出力できる', () => {
      logger.success('success message');
      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy.mock.calls[0][0]).toContain('success message');
    });
  });

  describe('JSONモード', () => {
    beforeEach(() => {
      logger.setJsonMode(true);
    });

    it('JSONモードではメッセージがJSON形式で出力される', () => {
      logger.info('test message');
      expect(consoleLogSpy).toHaveBeenCalledOnce();
      const output = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('test message');
      expect(parsed.timestamp).toBeDefined();
    });

    it('JSONモードでデータも含めて出力できる', () => {
      logger.info('test message', { key: 'value' });
      const output = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);
      expect(parsed.data).toEqual({ key: 'value' });
    });
  });

  describe('ログ履歴', () => {
    it('ログが内部に蓄積される', () => {
      logger.info('message 1');
      logger.warn('message 2');
      logger.error('message 3');

      const logs = logger.getAllLogs();
      expect(logs).toHaveLength(3);
      expect(logs[0].message).toBe('message 1');
      expect(logs[1].message).toBe('message 2');
      expect(logs[2].message).toBe('message 3');
    });

    it('ログをクリアできる', () => {
      logger.info('message 1');
      logger.info('message 2');
      expect(logger.getAllLogs()).toHaveLength(2);

      logger.clearLogs();
      expect(logger.getAllLogs()).toHaveLength(0);
    });

    it('ログエントリにタイムスタンプが含まれる', () => {
      logger.info('test');
      const logs = logger.getAllLogs();
      expect(logs[0].timestamp).toBeDefined();
      expect(new Date(logs[0].timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('プログレス表示', () => {
    it('プログレスメッセージを表示できる', () => {
      const stdoutWriteSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => {});

      logger.progress('processing');
      expect(stdoutWriteSpy).toHaveBeenCalledOnce();
      expect(stdoutWriteSpy.mock.calls[0][0]).toContain('processing');

      stdoutWriteSpy.mockRestore();
    });

    it('プログレス完了メッセージを表示できる', () => {
      logger.progressDone('完了');
      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy.mock.calls[0][0]).toContain('完了');
    });

    it('プログレス失敗メッセージを表示できる', () => {
      logger.progressFail('失敗');
      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy.mock.calls[0][0]).toContain('失敗');
    });
  });

  describe('ユーティリティ', () => {
    it('区切り線を表示できる', () => {
      logger.separator();
      expect(consoleLogSpy).toHaveBeenCalledOnce();
    });

    it('改行を出力できる', () => {
      logger.newline();
      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy.mock.calls[0][0]).toBe('');
    });

    it('JSONモードでは区切り線は表示されない', () => {
      logger.setJsonMode(true);
      logger.separator();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('グローバルロガー', () => {
    it('getLogger()でデフォルトロガーを取得できる', () => {
      const defaultLogger = getLogger();
      expect(defaultLogger).toBeInstanceOf(Logger);
    });

    it('createLogger()で新しいインスタンスを作成できる', () => {
      const newLogger = createLogger({ level: LOG_LEVELS.INFO });
      expect(newLogger).toBeInstanceOf(Logger);
      expect(newLogger.level).toBe(LOG_LEVELS.INFO);
    });

    it('setDefaultLogger()でデフォルトロガーを変更できる', () => {
      const newLogger = createLogger({ level: LOG_LEVELS.ERROR });
      setDefaultLogger(newLogger);
      const defaultLogger = getLogger();
      expect(defaultLogger).toBe(newLogger);
      expect(defaultLogger.level).toBe(LOG_LEVELS.ERROR);

      // 元に戻す
      setDefaultLogger(new Logger());
    });
  });

  describe('verboseモード', () => {
    it('verboseモードではデータも出力される', () => {
      logger.setVerbose(true);
      logger.info('message', { key: 'value' });

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy.mock.calls[1][0]).toContain('key');
      expect(consoleLogSpy.mock.calls[1][0]).toContain('value');
    });

    it('verboseモードでない場合はデータは出力されない', () => {
      logger.info('message', { key: 'value' });
      expect(consoleLogSpy).toHaveBeenCalledOnce();
    });
  });

  describe('SILENTモード', () => {
    beforeEach(() => {
      logger.setLevel(LOG_LEVELS.SILENT);
    });

    it('SILENTモードではすべてのログが抑制される', () => {
      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });
});
