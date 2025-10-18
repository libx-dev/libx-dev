# @docs/runtime

Astroランタイムパッケージ - レジストリ駆動のドキュメントサイト生成

## 概要

`@docs/runtime`は、`@docs/generator`を使用してレジストリ駆動でドキュメントサイトを生成するAstroプロジェクトです。Phase 2-2（UI/テーマ統合）の成果物として作成されました。

## 主要機能

- **動的ルーティング**: `[project]/[version]/[lang]/[...slug]`パターンでの自動ページ生成
- **サイドバー自動生成**: レジストリのカテゴリ構造からナビゲーションメニューを生成
- **メタデータ自動生成**: robots.txt、sitemap.xml、manifest.jsonを自動生成
- **OpenGraphメタデータ**: SEO最適化されたメタタグを自動挿入
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **ダークモード対応**: CSS変数によるテーマシステム

## ディレクトリ構造

```
packages/runtime/
├── src/
│   ├── pages/
│   │   └── [project]/[version]/[lang]/[...slug].astro  # 動的ルーティングページ
│   ├── layouts/
│   │   ├── BaseLayout.astro      # 基本レイアウト
│   │   └── DocLayout.astro       # ドキュメント専用レイアウト
│   ├── components/
│   │   ├── Sidebar.astro         # サイドバーナビゲーション
│   │   ├── Header.astro          # ヘッダー
│   │   └── Footer.astro          # フッター
│   └── lib/
│       └── utils.ts              # ユーティリティ関数
├── public/                       # 静的ファイル（メタデータ生成先）
├── scripts/
│   └── generate-metadata.js      # メタデータ生成スクリプト
├── astro.config.mjs              # Astro設定
├── package.json
├── tsconfig.json
└── README.md
```

## 使用方法

### 開発サーバーの起動

```bash
cd packages/runtime
pnpm dev
```

ブラウザで `http://localhost:4321` を開きます。

### ビルド

```bash
pnpm build
```

ビルド成果物は `dist/` ディレクトリに出力されます。

### プレビュー

```bash
pnpm preview
```

### 型チェック

```bash
pnpm typecheck
```

## メタデータ生成

ビルド前に自動的に以下のファイルが生成されます：

- **robots.txt**: 検索エンジンクローラー用の設定
- **sitemap.xml**: SEO用のサイトマップ
- **manifest.json**: PWA用のマニフェスト（各プロジェクト用）

生成は `scripts/generate-metadata.js` によって行われます。

## レジストリ駆動の仕組み

1. **レジストリ読み込み**: `loadRegistry()` で `registry/docs.json` を読み込み
2. **ルーティング生成**: `generateRoutes()` でAstro用のルーティング情報を生成
3. **サイドバー生成**: `generateSidebar()` でカテゴリ階層構造からサイドバーを生成
4. **ページ生成**: Astroが各ルートに対してHTMLページを生成

## 依存パッケージ

- `@docs/generator`: レジストリ駆動のルーティング・サイドバー・サイトマップ生成
- `@docs/ui`: 共有UIコンポーネント（Phase 2-3以降で統合予定）
- `@docs/theme`: テーマシステム
- `@docs/i18n`: 国際化ユーティリティ
- `@docs/versioning`: バージョン管理

## Phase 2-2 完了状況

### ✅ 完了項目

- [x] Astroランタイムパッケージ作成
- [x] package.json、astro.config.mjs、tsconfig.jsonの設定
- [x] 動的ルーティングページ `[...slug].astro` の実装
- [x] BaseLayout.astro、DocLayout.astro の実装
- [x] Sidebar、Header、Footerコンポーネントの実装
- [x] メタデータ生成スクリプトの実装

### ⏳ 今後の作業（Phase 2-3以降）

- [ ] MDXコンテンツの実際の読み込み実装
- [ ] 既存UIコンポーネント（@docs/ui）の統合度向上
- [ ] 新規コンポーネント追加（Glossary、RelatedDocs）
- [ ] 検索機能統合（Pagefind）
- [ ] パフォーマンス最適化

## 参考資料

- [Phase 2-2 UI/テーマ統合計画](../../docs/new-generator-plan/phase-2-2-ui-theme.md)
- [Phase 2-2 引き継ぎガイド](../../docs/new-generator-plan/status/phase-2-2-handoff.md)
- [@docs/generator README](../generator/README.md)
- [Astro公式ドキュメント](https://docs.astro.build/)

## ライセンス

このパッケージはlibx-devプロジェクトの一部です。
