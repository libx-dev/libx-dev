/**
 * validateコマンド実装
 *
 * レジストリのバリデーションを実行
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { validateRegistry, logValidationResult } from '../validators/registry-validator.js';
import * as logger from '../utils/logger.js';

/**
 * validateコマンドのメイン処理
 */
export default async function validateCommand(registryPath, globalOpts, cmdOpts) {
  logger.info('='.repeat(60));
  logger.info('validate: レジストリのバリデーションを開始');
  logger.info('='.repeat(60));

  try {
    // レジストリパスを決定
    const finalRegistryPath = registryPath
      ? resolve(registryPath)
      : resolve('registry/docs.json');

    logger.info(`レジストリパス: ${finalRegistryPath}`);
    logger.info(`厳格モード: ${cmdOpts.strict ? 'はい' : 'いいえ'}`);
    logger.info(`コンテンツチェック: ${cmdOpts.checkContent ? 'はい' : 'いいえ'}`);
    logger.info(`syncHashチェック: ${cmdOpts.checkSyncHash ? 'はい' : 'いいえ'}`);
    logger.info('');

    // レジストリファイルの存在確認
    if (!existsSync(finalRegistryPath)) {
      logger.error(`レジストリファイルが見つかりません: ${finalRegistryPath}`);
      process.exit(1);
    }

    // レジストリを読み込み
    logger.info('レジストリを読み込み中...');
    const registryContent = readFileSync(finalRegistryPath, 'utf-8');
    const registry = JSON.parse(registryContent);

    // バリデーションオプションの設定
    const validationOptions = {
      strict: cmdOpts.strict || false,
      checkContent: cmdOpts.checkContent || false,
      checkSyncHash: cmdOpts.checkSyncHash || false,
    };

    // バリデーション実行
    logger.info('バリデーション実行中...');
    const result = validateRegistry(registry, validationOptions);

    // 結果の出力
    logger.info('');
    if (cmdOpts.report === 'json' || globalOpts.json) {
      // JSON形式で出力
      console.log(JSON.stringify({
        valid: result.valid,
        errorCount: result.errors.length,
        warningCount: result.warnings.length,
        errors: result.errors,
        warnings: result.warnings,
      }, null, 2));
    } else {
      // テキスト形式で出力
      logValidationResult(result);

      // 詳細な結果表示
      if (result.errors.length > 0) {
        logger.error(`\n詳細なエラー情報 (${result.errors.length}件):`);
        result.errors.forEach((err, i) => {
          logger.error(`${i + 1}. ${err}`);
        });
      }

      if (result.warnings.length > 0) {
        logger.warn(`\n詳細な警告情報 (${result.warnings.length}件):`);
        result.warnings.forEach((warn, i) => {
          logger.warn(`${i + 1}. ${warn}`);
        });
      }
    }

    // 終了コード
    logger.info('');
    logger.info('='.repeat(60));
    if (!result.valid) {
      logger.error('バリデーション失敗');
      process.exit(1);
    } else if (cmdOpts.strict && result.warnings.length > 0) {
      logger.error('バリデーション失敗（厳格モード: 警告あり）');
      process.exit(1);
    } else {
      logger.success('バリデーション成功');
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
