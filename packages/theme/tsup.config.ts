import { defineConfig } from 'tsup';

/**
 * @docs/theme パッケージのビルド設定
 *
 * 出力形式:
 * - ESM (index.js) - モダンな環境向け
 * - CJS (index.cjs) - レガシー環境向け
 * - 型定義 (index.d.ts) - TypeScript型サポート
 * - CSS配布 (src/css/*.css) - そのまま配布
 */
export default defineConfig({
  // エントリーポイント
  entry: ['src/index.ts', 'src/colors.ts', 'src/typography.ts', 'src/spacing.ts'],

  // 出力形式: ESM と CJS の両方
  format: ['esm', 'cjs'],

  // 型定義ファイル (.d.ts) を生成
  dts: true,

  // ビルド前にdist/をクリーンアップ
  clean: true,

  // ソースマップを生成（デバッグ用）
  sourcemap: true,

  // 最小化しない（デバッグ容易性のため）
  minify: false,

  // コード分割を無効化（単一ファイル出力）
  splitting: false,

  // Tree-shaking有効化（未使用コード削除）
  treeshake: true,

  // 出力ディレクトリ
  outDir: 'dist',

  // 外部依存関係（バンドルしない）
  external: [],

  // TypeScriptの設定
  tsconfig: './tsconfig.build.json',
});
