/**
 * 非推奨警告システム
 *
 * 互換レイヤー経由で実行された際に適切な警告を表示し、
 * 新CLIへの移行を促進します。
 */

import chalk from 'chalk';
import * as logger from '../../utils/logger.js';

/**
 * 非推奨警告のタイプ
 */
export const DeprecationLevel = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
};

/**
 * サポート終了スケジュール
 */
export const SupportSchedule = {
  PHASE_3_3_COMPLETE: '2025-10-21',
  PHASE_4_COMPLETE: '2025-11-30',
  PHASE_5_COMPLETE: '2025-12-31',
  END_OF_SUPPORT: '2026-03-31',
};

/**
 * 非推奨警告を表示
 *
 * @param {object} options - オプション
 * @param {string} options.scriptName - スクリプト名
 * @param {string} options.newCommand - 新しいCLIコマンド
 * @param {string} [options.level] - 警告レベル
 * @param {boolean} [options.showSchedule] - スケジュールを表示するか
 * @param {string[]} [options.unsupportedOptions] - 未サポートのオプション一覧
 */
export function showDeprecationWarning(options) {
  const {
    scriptName,
    newCommand,
    level = DeprecationLevel.WARNING,
    showSchedule = true,
    unsupportedOptions = [],
  } = options;

  console.log('');
  console.log(chalk.yellow('⚠️  非推奨警告'));
  console.log(chalk.yellow('━'.repeat(60)));
  console.log(chalk.yellow(`このスクリプト (${scriptName}) は非推奨です。`));
  console.log('');
  console.log('新しいCLIコマンドへの移行を推奨します:');
  console.log(chalk.cyan(`  ${newCommand}`));
  console.log('');

  if (unsupportedOptions.length > 0) {
    console.log(chalk.yellow('未サポートのオプション:'));
    for (const option of unsupportedOptions) {
      console.log(chalk.gray(`  - ${option}`));
    }
    console.log('');
  }

  console.log('詳細は以下を参照してください:');
  console.log(chalk.blue('  docs/new-generator-plan/guides/compat-layer.md'));
  console.log('');

  if (showSchedule) {
    console.log(chalk.yellow('サポート終了予定: 2026-03-31 (フェーズ5完了後3ヶ月)'));
    console.log(chalk.yellow('━'.repeat(60)));
  }

  console.log('');
}

/**
 * バナー形式の詳細な非推奨警告を表示
 *
 * @param {object} options - オプション
 * @param {string} options.scriptName - スクリプト名
 * @param {string} options.newCommand - 新しいCLIコマンド
 * @param {object[]} [options.argumentMapping] - 引数マッピング
 * @param {string[]} [options.migrationSteps] - 移行手順
 */
export function showDetailedDeprecationWarning(options) {
  const {
    scriptName,
    newCommand,
    argumentMapping = [],
    migrationSteps = [],
  } = options;

  console.log('');
  console.log(chalk.bgYellow.black(' '.repeat(60)));
  console.log(chalk.bgYellow.black('  ⚠️  非推奨スクリプト警告  '));
  console.log(chalk.bgYellow.black(' '.repeat(60)));
  console.log('');

  console.log(chalk.yellow(`スクリプト: ${scriptName}`));
  console.log(chalk.yellow('このスクリプトは非推奨です。サポート終了予定: 2026-03-31'));
  console.log('');

  console.log(chalk.cyan('新しいCLIコマンド:'));
  console.log(chalk.white(`  ${newCommand}`));
  console.log('');

  if (argumentMapping.length > 0) {
    console.log(chalk.cyan('引数マッピング:'));
    console.log(chalk.gray('━'.repeat(60)));
    for (const mapping of argumentMapping) {
      console.log(chalk.white(`  ${mapping.old}`));
      console.log(chalk.gray(`    → ${mapping.new}`));
      console.log('');
    }
  }

  if (migrationSteps.length > 0) {
    console.log(chalk.cyan('移行手順:'));
    for (let i = 0; i < migrationSteps.length; i++) {
      console.log(chalk.white(`  ${i + 1}. ${migrationSteps[i]}`));
    }
    console.log('');
  }

  console.log(chalk.cyan('詳細情報:'));
  console.log(chalk.blue('  docs/new-generator-plan/guides/compat-layer.md'));
  console.log('');

  console.log(chalk.bgYellow.black(' '.repeat(60)));
  console.log('');
}

/**
 * サポート終了スケジュールを表示
 */
export function showSupportSchedule() {
  console.log('');
  console.log(chalk.cyan('📅 サポート終了スケジュール'));
  console.log(chalk.gray('━'.repeat(60)));
  console.log('');

  const schedule = [
    { milestone: 'Phase 3-3 完了', date: SupportSchedule.PHASE_3_3_COMPLETE, description: '互換レイヤー実装完了' },
    { milestone: 'Phase 4 完了', date: SupportSchedule.PHASE_4_COMPLETE, description: 'QA・リリース準備完了' },
    { milestone: 'Phase 5 完了', date: SupportSchedule.PHASE_5_COMPLETE, description: 'リリース後の継続改善完了' },
    { milestone: 'サポート終了', date: SupportSchedule.END_OF_SUPPORT, description: '互換レイヤーのサポート終了' },
  ];

  for (const item of schedule) {
    const isComplete = new Date(item.date) < new Date();
    const icon = isComplete ? '✅' : '⏳';
    console.log(`  ${icon} ${chalk.white(item.milestone)}`);
    console.log(`     ${chalk.gray(item.date)} - ${chalk.gray(item.description)}`);
    console.log('');
  }

  console.log(chalk.gray('━'.repeat(60)));
  console.log('');
}

/**
 * 移行ガイドへのリンクを表示
 *
 * @param {string} [command] - 特定のコマンド（オプション）
 */
export function showMigrationGuide(command) {
  console.log('');
  console.log(chalk.cyan('📖 移行ガイド'));
  console.log(chalk.gray('━'.repeat(60)));
  console.log('');

  const guides = [
    { title: '互換レイヤー概要', path: 'docs/new-generator-plan/guides/compat-layer.md' },
    { title: '移行チェックリスト', path: 'docs/new-generator-plan/guides/migration-checklist.md' },
    { title: '新CLI使用方法', path: 'packages/cli/README.md' },
  ];

  for (const guide of guides) {
    console.log(chalk.white(`  ${guide.title}`));
    console.log(chalk.blue(`    ${guide.path}`));
    console.log('');
  }

  if (command) {
    console.log(chalk.white('  コマンド別ヘルプ:'));
    console.log(chalk.cyan(`    docs-cli ${command} --help`));
    console.log('');
  }

  console.log(chalk.gray('━'.repeat(60)));
  console.log('');
}

/**
 * 未サポートオプションの警告を表示
 *
 * @param {object[]} unsupportedOptions - 未サポートのオプション一覧
 * @param {string} unsupportedOptions[].name - オプション名
 * @param {string} unsupportedOptions[].value - オプション値
 * @param {string} [unsupportedOptions[].reason] - 未サポートの理由
 */
export function warnUnsupportedOptions(unsupportedOptions) {
  if (unsupportedOptions.length === 0) {
    return;
  }

  console.log('');
  console.log(chalk.yellow('⚠️  未サポートのオプション'));
  console.log(chalk.yellow('━'.repeat(60)));
  console.log('');

  for (const option of unsupportedOptions) {
    console.log(chalk.white(`  ${option.name}: ${chalk.gray(option.value)}`));
    if (option.reason) {
      console.log(chalk.gray(`    理由: ${option.reason}`));
    }
    console.log('');
  }

  console.log(chalk.yellow('これらのオプションは新CLIでは無視されます。'));
  console.log(chalk.yellow('━'.repeat(60)));
  console.log('');
}

/**
 * 引数順序変更の警告を表示
 *
 * @param {object} options - オプション
 * @param {string} options.oldOrder - 旧引数順序
 * @param {string} options.newOrder - 新引数順序
 * @param {string} options.example - 使用例
 */
export function warnArgumentOrderChange(options) {
  const { oldOrder, newOrder, example } = options;

  console.log('');
  console.log(chalk.yellow('⚠️  引数順序の変更'));
  console.log(chalk.yellow('━'.repeat(60)));
  console.log('');

  console.log(chalk.white('  旧スクリプト:'));
  console.log(chalk.gray(`    ${oldOrder}`));
  console.log('');

  console.log(chalk.white('  新CLI:'));
  console.log(chalk.cyan(`    ${newOrder}`));
  console.log('');

  if (example) {
    console.log(chalk.white('  使用例:'));
    console.log(chalk.cyan(`    ${example}`));
    console.log('');
  }

  console.log(chalk.yellow('━'.repeat(60)));
  console.log('');
}

/**
 * 成功メッセージと次のステップを表示
 *
 * @param {object} options - オプション
 * @param {string} options.action - 完了したアクション
 * @param {string} options.command - 新CLIコマンド
 * @param {string[]} [options.nextSteps] - 次のステップ
 */
export function showSuccessAndNextSteps(options) {
  const { action, command, nextSteps = [] } = options;

  console.log('');
  console.log(chalk.green(`✅ ${action}完了`));
  console.log('');

  if (nextSteps.length > 0) {
    console.log(chalk.cyan('次のステップ:'));
    for (let i = 0; i < nextSteps.length; i++) {
      console.log(chalk.white(`  ${i + 1}. ${nextSteps[i]}`));
    }
    console.log('');
  }

  console.log(chalk.white('新しいCLIコマンドへの移行を検討してください:'));
  console.log(chalk.cyan(`  ${command}`));
  console.log('');
}

/**
 * 互換レイヤー使用状況をログに記録
 *
 * @param {object} usage - 使用状況
 * @param {string} usage.scriptName - スクリプト名
 * @param {object} usage.args - 引数
 * @param {string} usage.timestamp - タイムスタンプ
 */
export function logCompatUsage(usage) {
  const logEntry = {
    type: 'compat-layer-usage',
    ...usage,
    timestamp: usage.timestamp || new Date().toISOString(),
  };

  logger.debug('互換レイヤー使用ログ', logEntry);
}

/**
 * 互換レイヤー統計を表示
 *
 * @param {object} stats - 統計情報
 * @param {number} stats.totalUsage - 総使用回数
 * @param {object} stats.byScript - スクリプト別使用回数
 * @param {string} stats.lastUsed - 最終使用日時
 */
export function showCompatStats(stats) {
  console.log('');
  console.log(chalk.cyan('📊 互換レイヤー使用統計'));
  console.log(chalk.gray('━'.repeat(60)));
  console.log('');

  console.log(chalk.white(`  総使用回数: ${stats.totalUsage}`));
  console.log(chalk.white(`  最終使用: ${stats.lastUsed}`));
  console.log('');

  if (stats.byScript && Object.keys(stats.byScript).length > 0) {
    console.log(chalk.white('  スクリプト別:'));
    for (const [script, count] of Object.entries(stats.byScript)) {
      console.log(chalk.gray(`    ${script}: ${count}回`));
    }
    console.log('');
  }

  console.log(chalk.gray('━'.repeat(60)));
  console.log('');
}
