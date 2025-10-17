/**
 * Vitest設定 - Validator パッケージ
 *
 * @docs/validator パッケージ専用のテスト設定を定義します。
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // テスト環境
    environment: 'node',

    // テストファイルパターン
    include: [
      'tests/**/*.test.js',
      'tests/**/*.spec.js',
    ],

    // 除外パターン
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
    ],

    // テストタイムアウト
    testTimeout: 10000,

    // カバレッジ設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: [
        '**/tests/**',
        '**/node_modules/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },

    // グローバル変数を有効化
    globals: true,
  },

  // プロジェクトルートからの相対パス解決
  resolve: {
    alias: {
      '@validator': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
