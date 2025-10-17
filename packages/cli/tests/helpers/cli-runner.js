/**
 * CLI実行ヘルパー
 *
 * CLIコマンドを実行し、出力をキャプチャするユーティリティを提供します。
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CLIバイナリのパス
 */
const CLI_BIN = path.resolve(__dirname, '../../bin/docs-cli.js');

/**
 * CLIコマンドを実行
 *
 * @param {string[]} args - コマンドライン引数
 * @param {Object} options - 実行オプション
 * @param {string} options.cwd - 作業ディレクトリ
 * @param {Object} options.env - 環境変数
 * @param {string} options.input - 標準入力に送るデータ
 * @param {number} options.timeout - タイムアウト（ミリ秒）
 * @returns {Promise<Object>} 実行結果 { exitCode, stdout, stderr }
 */
export function runCLI(args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const {
      cwd = process.cwd(),
      env = {},
      input = null,
      timeout = 10000,
    } = options;

    const childEnv = {
      ...process.env,
      ...env,
      // 非対話モードを強制
      DOCS_CLI_NON_INTERACTIVE: 'true',
    };

    const child = spawn('node', [CLI_BIN, ...args], {
      cwd,
      env: childEnv,
      stdio: input ? 'pipe' : 'inherit',
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    // タイムアウト設定
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, timeout);

    // 標準出力をキャプチャ
    if (child.stdout) {
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }

    // 標準エラー出力をキャプチャ
    if (child.stderr) {
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    // 標準入力に書き込み
    if (input && child.stdin) {
      child.stdin.write(input);
      child.stdin.end();
    }

    // プロセス終了時の処理
    child.on('close', (exitCode) => {
      clearTimeout(timer);

      if (timedOut) {
        reject(new Error(`CLI command timed out after ${timeout}ms`));
      } else {
        resolve({
          exitCode: exitCode || 0,
          stdout,
          stderr,
        });
      }
    });

    // エラー処理
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

/**
 * CLIコマンドを実行し、成功を期待
 *
 * @param {string[]} args - コマンドライン引数
 * @param {Object} options - 実行オプション
 * @returns {Promise<Object>} 実行結果
 */
export async function runCLISuccess(args, options = {}) {
  const result = await runCLI(args, options);
  if (result.exitCode !== 0) {
    throw new Error(
      `CLI command failed with exit code ${result.exitCode}\n` +
      `STDOUT: ${result.stdout}\n` +
      `STDERR: ${result.stderr}`
    );
  }
  return result;
}

/**
 * CLIコマンドを実行し、失敗を期待
 *
 * @param {string[]} args - コマンドライン引数
 * @param {Object} options - 実行オプション
 * @returns {Promise<Object>} 実行結果
 */
export async function runCLIFailure(args, options = {}) {
  const result = await runCLI(args, options);
  if (result.exitCode === 0) {
    throw new Error(
      `CLI command unexpectedly succeeded\n` +
      `STDOUT: ${result.stdout}\n` +
      `STDERR: ${result.stderr}`
    );
  }
  return result;
}

/**
 * CLIコマンドを実行し、出力をパース
 *
 * JSONモードで実行し、出力をパースして返します。
 *
 * @param {string[]} args - コマンドライン引数（--json自動追加）
 * @param {Object} options - 実行オプション
 * @returns {Promise<Object>} パースされた出力
 */
export async function runCLIJSON(args, options = {}) {
  const argsWithJSON = [...args, '--json'];
  const result = await runCLISuccess(argsWithJSON, options);

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(
      `Failed to parse CLI JSON output: ${error.message}\n` +
      `STDOUT: ${result.stdout}`
    );
  }
}

/**
 * 対話式CLIコマンドをシミュレート
 *
 * inquirerのプロンプトに自動応答するヘルパー
 *
 * @param {string[]} args - コマンドライン引数
 * @param {string[]} answers - プロンプトへの応答リスト
 * @param {Object} options - 実行オプション
 * @returns {Promise<Object>} 実行結果
 */
export async function runCLIInteractive(args, answers = [], options = {}) {
  const input = answers.join('\n') + '\n';
  return runCLI(args, {
    ...options,
    input,
    env: {
      ...options.env,
      // 対話モードを有効化
      DOCS_CLI_NON_INTERACTIVE: 'false',
    },
  });
}

/**
 * dry-runモードでCLIコマンドを実行
 *
 * @param {string[]} args - コマンドライン引数（--dry-run自動追加）
 * @param {Object} options - 実行オプション
 * @returns {Promise<Object>} 実行結果
 */
export async function runCLIDryRun(args, options = {}) {
  const argsWithDryRun = [...args, '--dry-run'];
  return runCLISuccess(argsWithDryRun, options);
}
