#!/usr/bin/env node

/**
 * 互換レイヤー: create-project.js
 *
 * このスクリプトは既存の create-project.js の互換ラッパーです。
 * 新しい docs-cli add project コマンドを呼び出します。
 *
 * 非推奨: このスクリプトはフェーズ5完了後3ヶ月でサポート終了予定です。
 * 新しいCLIコマンドへの移行を推奨します。
 *
 * 使用例:
 * node scripts/compat/create-project.js my-project "My Documentation" "私のドキュメント"
 *
 * 新CLI:
 * docs-cli add project my-project \
 *   --display-name-en "My Documentation" \
 *   --display-name-ja "私のドキュメント"
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
  console.log(chalk.cyan('  docs-cli add project <project-id> [options]'));
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
    console.error('使用法: node scripts/compat/create-project.js <project-name> <display-name-en> <display-name-ja> [options]');
    console.error('');
    console.error('引数:');
    console.error('  project-name      プロジェクトディレクトリ名（英数字・ハイフンのみ）');
    console.error('  display-name-en   英語表示名');
    console.error('  display-name-ja   日本語表示名');
    console.error('');
    console.error('オプション:');
    console.error('  --description-en=<text>  英語説明文');
    console.error('  --description-ja=<text>  日本語説明文');
    console.error('  --icon=<name>            アイコン名（デフォルト: file-text）');
    console.error('  --tags=<tag1,tag2>       カンマ区切りタグ（デフォルト: documentation）');
    console.error('  --template=<name>        テンプレートプロジェクト（デフォルト: project-template）');
    console.error('  --skip-test              動作確認テストをスキップ');
    console.error('  --suppress-warning       非推奨警告を表示しない');
    console.error('');
    console.error('新CLI:');
    console.error(chalk.cyan('  docs-cli add project <project-id> [options]'));
    process.exit(1);
  }

  const [projectName, displayNameEn, displayNameJa] = args.slice(0, 3);
  const options = {};

  // オプション引数を解析
  for (let i = 3; i < args.length; i++) {
    const arg = args[i];
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
    displayNameEn,
    displayNameJa,
    descriptionEn: options['description-en'],
    descriptionJa: options['description-ja'],
    icon: options.icon,
    tags: options.tags,
    template: options.template,
    skipTest: options['skip-test'] || false,
    suppressWarning: options['suppress-warning'] || false
  };
}

/**
 * 旧引数を新CLIオプションに変換
 */
function convertToCliOptions(args) {
  const options = [];

  options.push(`--display-name-en "${args.displayNameEn}"`);
  options.push(`--display-name-ja "${args.displayNameJa}"`);

  if (args.descriptionEn) {
    options.push(`--description-en "${args.descriptionEn}"`);
  }

  if (args.descriptionJa) {
    options.push(`--description-ja "${args.descriptionJa}"`);
  }

  if (args.template) {
    options.push(`--template ${args.template}`);
  }

  // タグは新CLIではまだサポートされていないため、警告を表示
  if (args.tags) {
    console.log(chalk.yellow(`⚠️  警告: --tags オプションは新CLIではまだサポートされていません`));
    console.log(chalk.yellow(`   タグ: ${args.tags}`));
  }

  // アイコンは新CLIではまだサポートされていないため、警告を表示
  if (args.icon) {
    console.log(chalk.yellow(`⚠️  警告: --icon オプションは新CLIではまだサポートされていません`));
    console.log(chalk.yellow(`   アイコン: ${args.icon}`));
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
    const cliCommand = `docs-cli add project ${args.projectName} ${cliOptions}`;

    console.log(chalk.cyan('🔄 新CLIコマンドを実行します:'));
    console.log(chalk.gray(`   ${cliCommand}`));
    console.log('');

    // 新CLIコマンドを実行
    execSync(cliCommand, {
      stdio: 'inherit',
      shell: true,
    });

    console.log('');
    console.log(chalk.green('✅ プロジェクト作成完了'));
    console.log('');
    console.log('次のステップ:');
    console.log('  1. 新しいCLIコマンドへの移行を検討してください');
    console.log(chalk.cyan('     docs-cli add project --help'));
    console.log('');

  } catch (error) {
    console.error('');
    console.error(chalk.red('❌ エラーが発生しました:'));
    console.error(chalk.red(`   ${error.message}`));
    console.error('');
    console.error('詳細については以下を実行してください:');
    console.error(chalk.cyan('  docs-cli add project --help'));
    process.exit(1);
  }
}

main();
