#!/usr/bin/env node

/**
 * LibX Docs CLI - エントリポイント
 *
 * このファイルはCLIの実行起点として機能します。
 * 実際のロジックは src/index.js に委譲されます。
 */

import('../src/index.js').then(module => {
  module.run().catch(error => {
    console.error('エラーが発生しました:', error.message);
    process.exit(1);
  });
}).catch(error => {
  console.error('CLIの初期化に失敗しました:', error.message);
  process.exit(1);
});
