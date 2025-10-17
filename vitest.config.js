/**
 * Vitest設定 - ルート
 *
 * モノレポ全体のテスト設定を定義します。
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // テスト環境
    environment: 'node',

    // グローバルテストタイムアウト（10秒）
    testTimeout: 10000,

    // テストファイルパターン
    include: [
      'packages/*/tests/**/*.test.js',
      'packages/*/tests/**/*.spec.js',
    ],

    // 除外パターン
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.backups/**',
      '**/coverage/**',
    ],

    // カバレッジ設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'packages/*/src/**/*.js',
      ],
      exclude: [
        '**/node_modules/**',
        '**/tests/**',
        '**/dist/**',
      ],
      // カバレッジ閾値（80%目標）
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },

    // 並列実行設定
    threads: true,
    isolate: true,

    // レポーター
    reporters: ['verbose'],

    // グローバル変数（expect等）を自動インポート
    globals: true,
  },
});
