#!/usr/bin/env node

/**
 * 互換レイヤー: create-version.js
 *
 * このスクリプトは既存の create-version.js の互換ラッパーです。
 * 新しい docs-cli add version コマンドを呼び出します。
 *
 * 非推奨: このスクリプトはフェーズ5完了後3ヶ月でサポート終了予定です。
 * 新しいCLIコマンドへの移行を推奨します。
 *
 * 使用例:
 * node scripts/compat/create-version.js sample-docs v3
 * node scripts/compat/create-version.js sample-docs v2.1 --no-copy
 *
 * 新CLI:
 * docs-cli add version sample-docs v3
 * docs-cli add version sample-docs v2.1 --no-copy
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

/**
 * 非推奨警告を表示
 */
function showDeprecationWarning() {
  console.log('');
  console.log(chalk.yellow('⚠️  非推奨警告'));
  console.log(chalk.yellow('━'.repeat(60)));
  console.log(chalk.yellow('このスクリプトは非推奨です。'));
  console.log('');
  console.log('新しいCLIコマンドへの移行を推奨します:');
  console.log(chalk.cyan('  docs-cli add version <project-id> <version-id> [options]'));
  console.log('');
  console.log('詳細は以下を参照してください:');
  console.log(chalk.blue('  docs/new-generator-plan/guides/compat-layer.md'));
  console.log('');
  console.log(chalk.yellow('サポート終了予定: フェーズ5完了後3ヶ月'));
  console.log(chalk.yellow('━'.repeat(60)));
  console.log('');
}

/**
 * コマンドライン引数を解析
 */
function parseArguments() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('使用法: node scripts/compat/create-version.js <project-name> <version> [options]');
    console.error('');
    console.error('引数:');
    console.error('  project-name    プロジェクト名');
    console.error('  version         新しいバージョン (例: v3, v2.1)');
    console.error('');
    console.error('オプション:');
    console.error('  --interactive   インタラクティブモードで実行');
    console.error('  --no-copy       前バージョンからコンテンツをコピーしない');
    console.error('  --name <name>   バージョン表示名');
    console.error('  --suppress-warning  非推奨警告を表示しない');
    console.error('');
    console.error('新CLI:');
    console.error(chalk.cyan('  docs-cli add version <project-id> <version-id> [options]'));
    process.exit(1);
  }

  const [projectName, version] = args.slice(0, 2);
  const options = {};

  // オプション引数を解析
  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      if (arg.includes('=')) {
        const [key, value] = arg.substring(2).split('=', 2);
        options[key] = value;
      } else if (arg === '--name' && i + 1 < args.length) {
        options['name'] = args[i + 1];
        i++;
      } else {
        options[arg.substring(2)] = true;
      }
    }
  }

  return {
    projectName,
    version,
    interactive: options['interactive'] || false,
    noCopy: options['no-copy'] || false,
    name: options['name'],
    suppressWarning: options['suppress-warning'] || false
  };
}

/**
 * 旧引数を新CLIオプションに変換
 */
function convertToCliOptions(args) {
  const options = [];

  if (args.noCopy) {
    options.push('--no-copy');
  }

  if (args.name) {
    options.push(`--name "${args.name}"`);
  }

  // 新CLIではまだサポートされていないオプションの警告
  if (args.interactive) {
    console.log(chalk.yellow(`⚠️  警告: --interactive オプションは新CLIではまだサポートされていません`));
  }

  return options.join(' ');
}

/**
 * メイン処理
 */
async function main() {
  try {
    // 引数を解析
    const args = parseArguments();

    // 非推奨警告を表示（抑制されていない場合）
    if (!args.suppressWarning) {
      showDeprecationWarning();
    }

    // 新CLIコマンドを構築
    const cliOptions = convertToCliOptions(args);
    const cliCommand = `docs-cli add version ${args.projectName} ${args.version} ${cliOptions}`;

    console.log(chalk.cyan('🔄 新CLIコマンドを実行します:'));
    console.log(chalk.gray(`   ${cliCommand}`));
    console.log('');

    // 新CLIコマンドを実行
    execSync(cliCommand, {
      stdio: 'inherit',
      shell: true,
    });

    console.log('');
    console.log(chalk.green('✅ バージョン作成完了'));
    console.log('');
    console.log('次のステップ:');
    console.log('  1. 新しいCLIコマンドへの移行を検討してください');
    console.log(chalk.cyan('     docs-cli add version --help'));
    console.log('');

  } catch (error) {
    console.error('');
    console.error(chalk.red('❌ エラーが発生しました:'));
    console.error(chalk.red(`   ${error.message}`));
    console.error('');
    console.error('詳細については以下を実行してください:');
    console.error(chalk.cyan('  docs-cli add version --help'));
    process.exit(1);
  }
}

main();
