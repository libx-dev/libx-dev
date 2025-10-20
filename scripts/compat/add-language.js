#!/usr/bin/env node

/**
 * 互換レイヤー: add-language.js
 *
 * このスクリプトは既存の add-language.js の互換ラッパーです。
 * 新しい docs-cli add language コマンドを呼び出します。
 *
 * 非推奨: このスクリプトはフェーズ5完了後3ヶ月でサポート終了予定です。
 * 新しいCLIコマンドへの移行を推奨します。
 *
 * 使用例:
 * node scripts/compat/add-language.js sample-docs ko
 * node scripts/compat/add-language.js test-verification zh-Hans "简体中文" "简体中文文档"
 *
 * 新CLI:
 * docs-cli add language sample-docs ko
 * docs-cli add language test-verification zh-Hans \
 *   --display-name "简体中文" \
 *   --template-lang en
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
  console.log(chalk.cyan('  docs-cli add language <project-id> <lang-code> [options]'));
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
    console.error('使用法: node scripts/compat/add-language.js <project-name> <language-code> [display-name] [description] [options]');
    console.error('');
    console.error('引数:');
    console.error('  project-name    プロジェクト名');
    console.error('  language-code   言語コード（例: en, ja, ko, zh-Hans）');
    console.error('  display-name    言語表示名（オプション）');
    console.error('  description     説明文（オプション）');
    console.error('');
    console.error('オプション:');
    console.error('  --template-lang=<code>  テンプレート言語（デフォルト: en）');
    console.error('  --auto-template         対話なしでテンプレート生成');
    console.error('  --skip-test             ビルドテストをスキップ');
    console.error('  --skip-top-page         トップページ設定更新をスキップ');
    console.error('  --interactive           対話モードで実行');
    console.error('  --suppress-warning      非推奨警告を表示しない');
    console.error('');
    console.error('新CLI:');
    console.error(chalk.cyan('  docs-cli add language <project-id> <lang-code> [options]'));
    process.exit(1);
  }

  const [projectName, languageCode] = args.slice(0, 2);
  const positionalArgs = args.slice(2).filter(arg => !arg.startsWith('--'));
  const displayName = positionalArgs[0];
  const description = positionalArgs[1];
  const options = {};

  // オプション引数を解析
  for (const arg of args.slice(2)) {
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
    languageCode,
    displayName,
    description,
    templateLang: options['template-lang'],
    autoTemplate: options['auto-template'] || false,
    skipTest: options['skip-test'] || false,
    skipTopPage: options['skip-top-page'] || false,
    interactive: options['interactive'] || false,
    suppressWarning: options['suppress-warning'] || false
  };
}

/**
 * 旧引数を新CLIオプションに変換
 */
function convertToCliOptions(args) {
  const options = [];

  if (args.displayName) {
    options.push(`--display-name "${args.displayName}"`);
  }

  if (args.templateLang) {
    options.push(`--template-lang ${args.templateLang}`);
  }

  // 新CLIではまだサポートされていないオプションの警告
  if (args.description) {
    console.log(chalk.yellow(`⚠️  警告: description 引数は新CLIではまだサポートされていません`));
    console.log(chalk.yellow(`   説明文: ${args.description}`));
  }

  if (args.autoTemplate) {
    console.log(chalk.yellow(`⚠️  警告: --auto-template オプションは新CLIではまだサポートされていません`));
  }

  if (args.skipTest) {
    console.log(chalk.yellow(`⚠️  警告: --skip-test オプションは新CLIではまだサポートされていません`));
  }

  if (args.skipTopPage) {
    console.log(chalk.yellow(`⚠️  警告: --skip-top-page オプションは新CLIではまだサポートされていません`));
  }

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
    const cliCommand = `docs-cli add language ${args.projectName} ${args.languageCode} ${cliOptions}`;

    console.log(chalk.cyan('🔄 新CLIコマンドを実行します:'));
    console.log(chalk.gray(`   ${cliCommand}`));
    console.log('');

    // 新CLIコマンドを実行
    execSync(cliCommand, {
      stdio: 'inherit',
      shell: true,
    });

    console.log('');
    console.log(chalk.green('✅ 言語追加完了'));
    console.log('');
    console.log('次のステップ:');
    console.log('  1. 新しいCLIコマンドへの移行を検討してください');
    console.log(chalk.cyan('     docs-cli add language --help'));
    console.log('');

  } catch (error) {
    console.error('');
    console.error(chalk.red('❌ エラーが発生しました:'));
    console.error(chalk.red(`   ${error.message}`));
    console.error('');
    console.error('詳細については以下を実行してください:');
    console.error(chalk.cyan('  docs-cli add language --help'));
    process.exit(1);
  }
}

main();
