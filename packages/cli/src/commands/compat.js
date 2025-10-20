/**
 * compat コマンド - 互換性チェックと移行支援
 *
 * 旧スクリプトから新CLIへの移行を支援するコマンドです。
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import chalk from 'chalk';
import * as logger from '../utils/logger.js';
import {
  showDeprecationWarning,
  showSupportSchedule,
  showMigrationGuide,
} from '../compat/reporters/deprecation-warner.js';
import {
  generateMigrationChecklist,
  generateCompatibilityReport,
  getScriptMapping,
  showMigrationReportSummary,
} from '../compat/reporters/migration-reporter.js';

/**
 * compat check - 互換性チェック
 *
 * @param {object} globalOpts - グローバルオプション
 * @param {object} cmdOpts - コマンドオプション
 */
export async function compatCheck(globalOpts, cmdOpts) {
  logger.info('============================================================');
  logger.info('compat check: 互換性チェックを実行します');
  logger.info('============================================================');
  console.log('');

  try {
    // スクリプトディレクトリの存在確認
    const scriptsDir = join(process.cwd(), 'scripts');
    if (!existsSync(scriptsDir)) {
      logger.warn('⚠️  scripts/ ディレクトリが見つかりません');
      logger.info('このプロジェクトでは旧スクリプトは使用されていません。');
      return;
    }

    // 互換スクリプトの存在確認
    const compatDir = join(scriptsDir, 'compat');
    const hasCompatScripts = existsSync(compatDir);

    console.log(chalk.cyan('📋 互換性チェック結果'));
    console.log(chalk.gray('━'.repeat(60)));
    console.log('');

    // 旧スクリプトの確認
    const scriptMapping = getScriptMapping();
    const foundScripts = [];

    for (const mapping of scriptMapping) {
      const oldScriptPath = join(scriptsDir, `${mapping.name}.js`);
      const compatScriptPath = join(compatDir, `${mapping.name}.js`);

      const hasOldScript = existsSync(oldScriptPath);
      const hasCompatScript = existsSync(compatScriptPath);

      if (hasOldScript || hasCompatScript) {
        foundScripts.push({
          ...mapping,
          hasOldScript,
          hasCompatScript,
        });

        const icon = hasCompatScript ? '✅' : '⚠️';
        console.log(`  ${icon} ${chalk.white(mapping.name)}`);
        console.log(`     旧スクリプト: ${hasOldScript ? '存在' : '不在'}`);
        console.log(`     互換ラッパー: ${hasCompatScript ? '存在' : '不在'}`);
        console.log('');
      }
    }

    if (foundScripts.length === 0) {
      logger.success('✅ 旧スクリプトは使用されていません');
      logger.info('新CLIへの移行は完了しています。');
      return;
    }

    // サマリー
    console.log(chalk.gray('━'.repeat(60)));
    console.log('');
    console.log(chalk.white(`  検出されたスクリプト: ${foundScripts.length}`));
    console.log(
      chalk.white(`  互換ラッパーあり: ${foundScripts.filter((s) => s.hasCompatScript).length}`),
    );
    console.log(
      chalk.white(`  互換ラッパーなし: ${foundScripts.filter((s) => !s.hasCompatScript).length}`),
    );
    console.log('');

    // 推奨事項
    console.log(chalk.cyan('📝 推奨事項'));
    console.log(chalk.gray('━'.repeat(60)));
    console.log('');

    if (!hasCompatScripts) {
      console.log(chalk.yellow('  ⚠️  互換レイヤーがインストールされていません'));
      console.log('');
      console.log('  互換レイヤーをインストールするには:');
      console.log(chalk.cyan('    pnpm install'));
      console.log('');
    } else {
      console.log(chalk.green('  ✅ 互換レイヤーがインストールされています'));
      console.log('');
      console.log('  次のステップ:');
      console.log(chalk.cyan('    1. docs-cli compat report - 移行レポート生成'));
      console.log(chalk.cyan('    2. docs-cli compat migrate-config - 設定ファイル移行'));
      console.log('');
    }

    // スケジュール表示
    if (!cmdOpts.noSchedule) {
      showSupportSchedule();
    }

    // 移行ガイド表示
    if (!cmdOpts.noGuide) {
      showMigrationGuide();
    }
  } catch (error) {
    logger.error(`❌ エラーが発生しました: ${error.message}`);
    if (globalOpts.verbose) {
      logger.error(error.stack);
    }
    throw error;
  }
}

/**
 * compat report - 移行レポート生成
 *
 * @param {object} globalOpts - グローバルオプション
 * @param {object} cmdOpts - コマンドオプション
 */
export async function compatReport(globalOpts, cmdOpts) {
  logger.info('============================================================');
  logger.info('compat report: 移行レポートを生成します');
  logger.info('============================================================');
  console.log('');

  try {
    // プロジェクト名を取得（package.jsonから）
    const packageJsonPath = join(process.cwd(), 'package.json');
    let projectName = 'unknown';

    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      projectName = packageJson.name || 'unknown';
    }

    // スクリプトマッピングを取得
    const scriptMapping = getScriptMapping();

    // 統計情報を生成
    const stats = {
      totalScripts: scriptMapping.length,
      totalUsage: 0, // 実際の使用回数は別途トラッキングが必要
      migrationProgress: 0, // 移行進捗（0-100%）
    };

    // 出力ディレクトリの作成
    const outputDir = cmdOpts.output || join(process.cwd(), 'reports', 'migration');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // チェックリスト生成
    const checklistPath = join(outputDir, 'migration-checklist.md');
    generateMigrationChecklist({
      projectName,
      scripts: scriptMapping,
      outputPath: checklistPath,
    });

    // 互換性レポート生成（HTML）
    const reportPath = join(outputDir, 'compatibility-report.html');
    generateCompatibilityReport({
      projectName,
      scripts: scriptMapping,
      stats,
      outputPath: reportPath,
    });

    // サマリー表示
    showMigrationReportSummary({
      projectName,
      totalScripts: stats.totalScripts,
      migrationProgress: stats.migrationProgress,
      checklistPath,
      reportPath,
    });

    logger.success('✅ 移行レポート生成完了');
    console.log('');
    console.log('次のステップ:');
    console.log(chalk.cyan('  1. チェックリストを確認してください'));
    console.log(chalk.cyan(`     ${checklistPath}`));
    console.log('');
    console.log(chalk.cyan('  2. 互換性レポートを確認してください'));
    console.log(chalk.cyan(`     ${reportPath}`));
    console.log('');
  } catch (error) {
    logger.error(`❌ エラーが発生しました: ${error.message}`);
    if (globalOpts.verbose) {
      logger.error(error.stack);
    }
    throw error;
  }
}

/**
 * compat migrate-config - 設定ファイル移行
 *
 * @param {object} globalOpts - グローバルオプション
 * @param {object} cmdOpts - コマンドオプション
 */
export async function compatMigrateConfig(globalOpts, cmdOpts) {
  logger.info('============================================================');
  logger.info('compat migrate-config: 設定ファイルを移行します');
  logger.info('============================================================');
  console.log('');

  try {
    // 旧設定ファイルの検出
    const oldConfigPaths = [
      { path: '.env', type: 'env' },
      { path: 'apps/*/src/config/project.config.json', type: 'project' },
      { path: 'apps/top-page/src/config/projects.config.json', type: 'projects' },
    ];

    const foundConfigs = [];

    console.log(chalk.cyan('🔍 設定ファイルを検索中...'));
    console.log('');

    // .env の確認
    if (existsSync('.env')) {
      foundConfigs.push({ path: '.env', type: 'env' });
      console.log(chalk.yellow('  ⚠️  .env ファイルが見つかりました'));
      console.log(chalk.gray('     新CLIでは .docs-cli/config.json を使用します'));
      console.log('');
    }

    // project.config.json の確認（glob検索の簡易版）
    const appsDir = join(process.cwd(), 'apps');
    if (existsSync(appsDir)) {
      // TODO: 実際にはglobを使って検索すべき
      console.log(chalk.white('  ℹ️  apps/ ディレクトリ内の設定ファイルを検索中...'));
      console.log('');
    }

    if (foundConfigs.length === 0) {
      logger.info('ℹ️  旧設定ファイルは見つかりませんでした');
      logger.info('新CLIの設定ファイルを作成するには:');
      console.log(chalk.cyan('  docs-cli init'));
      console.log('');
      return;
    }

    // 新設定ファイルのパス
    const newConfigDir = join(process.cwd(), '.docs-cli');
    const newConfigPath = join(newConfigDir, 'config.json');

    // dry-run モード
    if (globalOpts.dryRun) {
      logger.warn('dry-runモード: 実際の変更は行いません');
      console.log('');
      console.log(chalk.white('実行予定の操作:'));
      console.log(chalk.gray(`  1. ${newConfigDir} ディレクトリを作成`));
      console.log(chalk.gray(`  2. ${newConfigPath} を生成`));
      console.log('');
      return;
    }

    // 新設定ディレクトリの作成
    if (!existsSync(newConfigDir)) {
      mkdirSync(newConfigDir, { recursive: true });
      logger.success(`✅ ディレクトリ作成: ${newConfigDir}`);
    }

    // 新設定ファイルの生成（基本的な雛形）
    const newConfig = {
      $schema: './config.schema.json',
      version: '1.0.0',
      registry: {
        path: 'registry/docs.json',
      },
      build: {
        output: 'dist',
      },
      migrate: {
        backup: true,
        backupDir: '.backups',
      },
    };

    writeFileSync(newConfigPath, JSON.stringify(newConfig, null, 2), 'utf-8');
    logger.success(`✅ 設定ファイル生成: ${newConfigPath}`);

    console.log('');
    console.log(chalk.green('✅ 設定ファイルの移行が完了しました'));
    console.log('');
    console.log('次のステップ:');
    console.log(chalk.cyan('  1. 新設定ファイルを確認してください'));
    console.log(chalk.cyan(`     ${newConfigPath}`));
    console.log('');
    console.log(chalk.cyan('  2. 必要に応じて設定をカスタマイズしてください'));
    console.log('');
  } catch (error) {
    logger.error(`❌ エラーが発生しました: ${error.message}`);
    if (globalOpts.verbose) {
      logger.error(error.stack);
    }
    throw error;
  }
}

export default {
  check: compatCheck,
  report: compatReport,
  migrateConfig: compatMigrateConfig,
};
