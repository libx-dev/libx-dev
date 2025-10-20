#!/usr/bin/env node

/**
 * 互換レイヤー: create-document.js
 *
 * このスクリプトは既存の create-document.js の互換ラッパーです。
 * 新しい docs-cli add document コマンドを呼び出します。
 *
 * 非推奨: このスクリプトはフェーズ5完了後3ヶ月でサポート終了予定です。
 * 新しいCLIコマンドへの移行を推奨します。
 *
 * 使用例:
 * node scripts/compat/create-document.js sample-docs en v2 guide "Getting Started"
 * node scripts/compat/create-document.js sample-docs en v2 --interactive
 *
 * 新CLI:
 * docs-cli add document sample-docs v2 en guide "Getting Started"
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
  console.log(chalk.cyan('  docs-cli add document <project-id> <version> <lang> <category> <title>'));
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

  if (args.length < 3) {
    console.error('使用法: node scripts/compat/create-document.js <project-name> <lang> <version> [category] [title] [options]');
    console.error('');
    console.error('引数:');
    console.error('  project-name    プロジェクト名');
    console.error('  lang            言語 (en, ja)');
    console.error('  version         バージョン (v1, v2)');
    console.error('  category        カテゴリ名（省略可）');
    console.error('  title           ドキュメントタイトル（省略可）');
    console.error('');
    console.error('オプション:');
    console.error('  --interactive   インタラクティブモードで実行');
    console.error('  --suppress-warning  非推奨警告を表示しない');
    console.error('');
    console.error('新CLI（引数順序が異なります）:');
    console.error(chalk.cyan('  docs-cli add document <project-id> <version> <lang> <category> <title>'));
    process.exit(1);
  }

  const [projectName, lang, version, ...rest] = args.slice(0, 3);
  const positionalArgs = args.slice(3).filter(arg => !arg.startsWith('--'));
  const category = positionalArgs[0];
  const title = positionalArgs[1];
  const options = {};

  // オプション引数を解析
  for (const arg of args.slice(3)) {
    if (arg.startsWith('--')) {
      if (arg.includes('=')) {
        const [key, value] = arg.substring(2).split('=', 2);
        options[key] = value;
      } else {
        options[arg.substring(2)] = true;
      }
    }
  }

  return {
    projectName,
    lang,
    version,
    category,
    title,
    interactive: options['interactive'] || false,
    suppressWarning: options['suppress-warning'] || false
  };
}

/**
 * 旧引数を新CLIオプションに変換
 */
function convertToCliCommand(args) {
  // 新CLIでは引数順序が異なる: <project-id> <version> <lang> <category> <title>
  const parts = [
    'docs-cli add document',
    args.projectName,
    args.version,
    args.lang
  ];

  if (args.category) {
    parts.push(args.category);
  }

  if (args.title) {
    parts.push(`"${args.title}"`);
  }

  // 新CLIではまだサポートされていないオプションの警告
  if (args.interactive) {
    console.log(chalk.yellow(`⚠️  警告: --interactive オプションは新CLIではまだサポートされていません`));
  }

  return parts.join(' ');
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

    // categoryとtitleが必要
    if (!args.category || !args.title) {
      console.error('');
      console.error(chalk.red('❌ エラー: category と title は必須です'));
      console.error('');
      console.error('使用法:');
      console.error('  node scripts/compat/create-document.js <project-name> <lang> <version> <category> <title>');
      console.error('');
      console.error('例:');
      console.error('  node scripts/compat/create-document.js sample-docs en v2 guide "Getting Started"');
      process.exit(1);
    }

    // 新CLIコマンドを構築
    const cliCommand = convertToCliCommand(args);

    console.log(chalk.cyan('🔄 新CLIコマンドを実行します:'));
    console.log(chalk.gray(`   ${cliCommand}`));
    console.log('');
    console.log(chalk.yellow('⚠️  注意: 新CLIでは引数の順序が異なります'));
    console.log(chalk.gray('   旧: <project> <lang> <version> <category> <title>'));
    console.log(chalk.gray('   新: <project> <version> <lang> <category> <title>'));
    console.log('');

    // 新CLIコマンドを実行
    execSync(cliCommand, {
      stdio: 'inherit',
      shell: true,
    });

    console.log('');
    console.log(chalk.green('✅ ドキュメント作成完了'));
    console.log('');
    console.log('次のステップ:');
    console.log('  1. 新しいCLIコマンドへの移行を検討してください');
    console.log(chalk.cyan('     docs-cli add document --help'));
    console.log('');

  } catch (error) {
    console.error('');
    console.error(chalk.red('❌ エラーが発生しました:'));
    console.error(chalk.red(`   ${error.message}`));
    console.error('');
    console.error('詳細については以下を実行してください:');
    console.error(chalk.cyan('  docs-cli add document --help'));
    process.exit(1);
  }
}

main();
