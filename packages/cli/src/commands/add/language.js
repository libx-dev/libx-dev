/**
 * add languageコマンド実装（スタブ）
 *
 * 既存プロジェクトに新しい言語を追加
 */

import { getLogger } from '../../utils/logger.js';

const logger = getLogger();

export default async function addLanguageCommand(projectId, langCode, globalOpts, cmdOpts) {
  logger.warn('add language コマンドは実装中です');
  logger.info(`プロジェクト: ${projectId}`);
  logger.info(`言語コード: ${langCode}`);
  logger.info('オプション:', cmdOpts);

  // TODO: Phase 1-4 以降で完全実装
  // 既存の scripts/add-language.js を参考に実装予定
  process.exit(0);
}
