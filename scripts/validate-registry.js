#!/usr/bin/env node

/**
 * レジストリバリデーションCLI
 *
 * 使用例:
 * node scripts/validate-registry.js                     # 基本バリデーション
 * node scripts/validate-registry.js --strict            # 厳格モード（警告もエラー扱い）
 * node scripts/validate-registry.js --report=json       # JSON形式レポート出力
 * node scripts/validate-registry.js --check-content     # コンテンツファイルチェック
 * node scripts/validate-registry.js --check-sync-hash   # syncHashチェック
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateRegistry, generateSummary } from '../packages/validator/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// カラー出力用のヘルパー
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

/**
 * コマンドライン引数を解析
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    registryPath: null,
    strict: false,
    reportFormat: 'text', // 'text' | 'json'
    checkContent: false,
    checkSyncHash: false,
    help: false,
  };

  for (const arg of args) {
    if (arg === '--strict') {
      options.strict = true;
    } else if (arg.startsWith('--report=')) {
      options.reportFormat = arg.split('=')[1];
    } else if (arg === '--check-content') {
      options.checkContent = true;
    } else if (arg === '--check-sync-hash') {
      options.checkSyncHash = true;
      options.checkContent = true; // syncHash チェックは content チェックを含む
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (!arg.startsWith('--')) {
      options.registryPath = arg;
    }
  }

  return options;
}

/**
 * ヘルプメッセージを表示
 */
function showHelp() {
  console.log(`
${colors.bold}LibX Docs レジストリバリデーションツール${colors.reset}

${colors.cyan}使用法:${colors.reset}
  node scripts/validate-registry.js [registry-path] [options]

${colors.cyan}引数:${colors.reset}
  registry-path     レジストリファイルのパス（省略時は registry/docs.json）

${colors.cyan}オプション:${colors.reset}
  --strict              厳格モード（警告もエラーとして扱う）
  --report=<format>     レポート形式（text | json）デフォルト: text
  --check-content       コンテンツファイルの存在チェックを実行
  --check-sync-hash     syncHash の整合性チェックを実行（--check-content を含む）
  --help, -h            このヘルプを表示

${colors.cyan}例:${colors.reset}
  node scripts/validate-registry.js
  node scripts/validate-registry.js --strict
  node scripts/validate-registry.js --report=json
  node scripts/validate-registry.js registry/docs.json --check-content
  node scripts/validate-registry.js --strict --check-sync-hash
`);
}

/**
 * レジストリファイルを読み込む
 */
function loadRegistryData(registryPath) {
  const fullPath = path.resolve(projectRoot, registryPath);

  if (!fs.existsSync(fullPath)) {
    console.error(`${colors.red}✗ エラー:${colors.reset} レジストリファイルが見つかりません: ${fullPath}`);
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`${colors.red}✗ エラー:${colors.reset} レジストリファイルの読み込みに失敗しました: ${error.message}`);
    process.exit(1);
  }
}

/**
 * テキスト形式でレポートを出力
 */
function printTextReport(errors, options) {
  console.log('\n' + colors.cyan + '═══════════════════════════════════════════' + colors.reset);
  console.log(colors.cyan + '  レジストリバリデーション結果' + colors.reset);
  console.log(colors.cyan + '═══════════════════════════════════════════' + colors.reset + '\n');

  const summary = errors.getSummary();

  // エラーを表示
  if (errors.errors.length > 0) {
    console.log(`${colors.red}${colors.bold}エラー (${errors.errors.length}件):${colors.reset}\n`);
    for (const error of errors.errors) {
      console.log(error.toString(true));
      console.log('');
    }
  }

  // 警告を表示
  if (errors.warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bold}警告 (${errors.warnings.length}件):${colors.reset}\n`);
    for (const warning of errors.warnings) {
      console.log(warning.toString(true));
      console.log('');
    }
  }

  // サマリー
  console.log(colors.cyan + '═══════════════════════════════════════════' + colors.reset);

  const hasErrors = errors.hasErrors(options.strict);

  if (!hasErrors) {
    console.log(`${colors.green}✓ バリデーション成功${colors.reset}`);
    if (summary.warningCount > 0) {
      console.log(`${colors.gray}  ${summary.warningCount}件の警告がありますが、致命的ではありません${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}✗ バリデーション失敗${colors.reset}`);
    console.log(`${colors.gray}  エラー: ${summary.errorCount}件${colors.reset}`);
    console.log(`${colors.gray}  警告: ${summary.warningCount}件${colors.reset}`);
  }

  console.log(colors.cyan + '═══════════════════════════════════════════' + colors.reset + '\n');

  return hasErrors ? 1 : 0;
}

/**
 * JSON形式でレポートを出力
 */
function printJsonReport(errors, options) {
  const summary = generateSummary(errors);
  summary.success = !errors.hasErrors(options.strict);

  console.log(JSON.stringify(summary, null, 2));

  return summary.success ? 0 : 1;
}

/**
 * メイン処理
 */
async function main() {
  const options = parseArguments();

  // ヘルプ表示
  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // レジストリパスのデフォルト設定
  const registryPath = options.registryPath || 'registry/examples/sample-basic.json';

  console.log(`${colors.blue}ℹ${colors.reset} レジストリファイル: ${registryPath}`);

  if (options.strict) {
    console.log(`${colors.yellow}⚠${colors.reset} 厳格モードが有効です（警告もエラーとして扱います）`);
  }

  if (options.checkContent) {
    console.log(`${colors.blue}ℹ${colors.reset} コンテンツファイルチェックを実行します`);
  }

  if (options.checkSyncHash) {
    console.log(`${colors.blue}ℹ${colors.reset} syncHash チェックを実行します`);
  }

  // レジストリデータを読み込む
  const registryData = loadRegistryData(registryPath);

  // バリデーション実行
  const errors = validateRegistry(registryData, {
    projectRoot,
    strict: options.strict,
    checkContent: options.checkContent,
    checkSyncHash: options.checkSyncHash,
  });

  // レポート出力
  let exitCode = 0;

  if (options.reportFormat === 'json') {
    exitCode = printJsonReport(errors, options);
  } else {
    exitCode = printTextReport(errors, options);
  }

  process.exit(exitCode);
}

main().catch((error) => {
  console.error(`${colors.red}✗ 予期しないエラー:${colors.reset} ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});
