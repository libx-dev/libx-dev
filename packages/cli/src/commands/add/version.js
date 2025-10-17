/**
 * add versionコマンド実装（スタブ）
 *
 * 既存プロジェクトに新バージョンを追加
 */

import { getLogger } from '../../utils/logger.js';

const logger = getLogger();

export default async function addVersionCommand(projectId, versionId, globalOpts, cmdOpts) {
  logger.warn('add version コマンドは実装中です');
  logger.info(`プロジェクト: ${projectId}`);
  logger.info(`バージョン: ${versionId}`);
  logger.info('オプション:', cmdOpts);

  // TODO: Phase 1-4 以降で完全実装
  process.exit(0);
}
