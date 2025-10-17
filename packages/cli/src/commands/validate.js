/**
 * validateコマンド実装
 *
 * レジストリのバリデーションを実行
 */

import fs from 'fs';
import path from 'path';
import { validateRegistry, generateSummary } from '../../../validator/src/index.js';
import { getLogger, createLogger, LOG_LEVELS } from '../utils/logger.js';
import { getConfigManager } from '../utils/config.js';

/**
 * validateコマンドのメイン処理
 */
export default async function validateCommand(registryPath, globalOpts, cmdOpts) {
  // ロガーの初期化
  const logger = globalOpts.json
    ? createLogger({ jsonMode: true })
    : createLogger({ verbose: globalOpts.verbose });

  if (globalOpts.verbose) {
    logger.setLevel(LOG_LEVELS.DEBUG);
  }

  try {
    // 設定マネージャーを取得
    const configManager = getConfigManager();
    const projectRoot = configManager.projectRoot;

    // レジストリパスを決定
    const finalRegistryPath = registryPath || configManager.getRegistryPath();

    logger.info(`レジストリバリデーション開始: ${finalRegistryPath}`);
    logger.separator();

    // レジストリファイルの存在確認
    if (!fs.existsSync(finalRegistryPath)) {
      logger.error(`レジストリファイルが見つかりません: ${finalRegistryPath}`);
      process.exit(1);
    }

    // レジストリを読み込み
    const registryContent = fs.readFileSync(finalRegistryPath, 'utf-8');
    const registry = JSON.parse(registryContent);

    // バリデーションオプションの設定
    const validationOptions = {
      projectRoot,
      strict: cmdOpts.strict || false,
      checkContent: cmdOpts.checkContent || false,
      checkSyncHash: cmdOpts.checkSyncHash || false,
    };

    if (validationOptions.checkSyncHash) {
      validationOptions.checkContent = true; // syncHashチェックはcontentチェックを含む
    }

    logger.debug('バリデーションオプション:', validationOptions);

    // バリデーション実行
    const errors = validateRegistry(registry, validationOptions);

    // 結果の出力
    if (cmdOpts.report === 'json' || globalOpts.json) {
      // JSON形式で出力
      const summary = generateSummary(errors);
      console.log(JSON.stringify({
        success: !errors.hasErrors(),
        ...summary,
        errors: errors.errors.map(e => ({
          code: e.code,
          message: e.message,
          path: e.path,
          hint: e.hint,
        })),
        warnings: errors.warnings.map(w => ({
          code: w.code,
          message: w.message,
          path: w.path,
          hint: w.hint,
        })),
      }, null, 2));
    } else {
      // テキスト形式で出力
      if (errors.hasErrors()) {
        logger.error('バリデーションエラーが見つかりました');
        logger.newline();

        // エラーを表示
        for (const error of errors.errors) {
          logger.error(`[${error.code}] ${error.message}`);
          if (error.path) {
            logger.info(`  パス: ${error.path}`);
          }
          if (error.hint) {
            logger.info(`  ヒント: ${error.hint}`);
          }
          logger.newline();
        }
      }

      if (errors.warnings.length > 0) {
        logger.warn(`${errors.warnings.length}件の警告が見つかりました`);
        logger.newline();

        // 警告を表示
        for (const warning of errors.warnings) {
          logger.warn(`[${warning.code}] ${warning.message}`);
          if (warning.path) {
            logger.info(`  パス: ${warning.path}`);
          }
          if (warning.hint) {
            logger.info(`  ヒント: ${warning.hint}`);
          }
          logger.newline();
        }
      }

      if (!errors.hasErrors() && errors.warnings.length === 0) {
        logger.success('バリデーション成功！問題は見つかりませんでした');
      }

      // サマリー表示
      logger.separator();
      const summary = generateSummary(errors);
      logger.info(`エラー: ${summary.errorCount}件`);
      logger.info(`警告: ${summary.warningCount}件`);
      logger.info(`検証項目: ${summary.totalChecks}件`);
    }

    // 終了コード
    if (errors.hasErrors()) {
      process.exit(1);
    } else if (cmdOpts.strict && errors.warnings.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    logger.error(`バリデーション実行エラー: ${error.message}`);
    if (globalOpts.verbose) {
      logger.error(error.stack);
    }
    process.exit(2);
  }
}
