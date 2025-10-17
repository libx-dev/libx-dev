/**
 * add docコマンド実装（スタブ）
 *
 * 新しいドキュメントを追加
 */

import { getLogger } from '../../utils/logger.js';

const logger = getLogger();

export default async function addDocCommand(projectId, slug, globalOpts, cmdOpts) {
  logger.warn('add doc コマンドは実装中です');
  logger.info(`プロジェクト: ${projectId}`);
  logger.info(`スラッグ: ${slug}`);
  logger.info('オプション:', cmdOpts);

  // TODO: Phase 1-4 以降で完全実装
  process.exit(0);
}
