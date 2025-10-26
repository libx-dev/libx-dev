# Top Page

トップページプロジェクト - 全ドキュメントプロジェクトの一覧を表示するランディングページ

## 概要

このプロジェクトは、`registry/*.json` から全てのドキュメントプロジェクト情報を読み込み、カード形式で一覧表示するトップページです。新ドキュメントサイトジェネレーターのレジストリベースアーキテクチャを活用しています。

## 主な機能

- **レジストリ統合**: `registry/*.json` から全プロジェクトを自動読み込み
- **多言語対応**: 15言語をサポート
- **プロジェクトカード**: 各プロジェクトをカード形式で表示
- **言語切り替え**: ヘッダーから言語を切り替え可能
- **ダークモード**: ThemeToggleコンポーネントでダーク/ライトモード切り替え
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップに対応

## ディレクトリ構造

```
apps/top-page/
├── src/
│   ├── components/
│   │   ├── LanguageSelector.astro  # 言語切り替え
│   │   └── ProjectCard.astro       # プロジェクトカード
│   ├── config/
│   │   └── site.config.json        # サイト設定
│   ├── layouts/
│   │   └── MainLayout.astro        # 基本レイアウト
│   ├── lib/
│   │   ├── registry-schema.ts      # レジストリ型定義
│   │   ├── registry-loader.ts      # レジストリ読み込み
│   │   └── project-url-generator.ts # URL生成
│   ├── pages/
│   │   ├── index.astro             # ルートページ（リダイレクト）
│   │   └── [lang]/
│   │       └── index.astro         # 言語別トップページ
│   └── styles/
│       └── global.css              # グローバルスタイル
├── public/
│   └── favicon.svg
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## 開発

### 依存関係のインストール

```bash
pnpm install
```

### 開発サーバーの起動

```bash
pnpm dev:top-page
```

または、プロジェクトディレクトリ内で：

```bash
pnpm dev
```

### ビルド

```bash
pnpm build:top-page
```

### プレビュー

```bash
pnpm preview:top-page
```

## 設定

### サイト設定

`src/config/site.config.json` でサイト全体の設定を管理：

- `siteConfig`: サイトの基本設定（URL、言語、リポジトリなど）
- `content`: 多言語コンテンツ（サイト説明、ヒーロータイトルなど）

### レジストリ統合

トップページは `registry/*.json` から自動的に全プロジェクトを読み込みます。新しいプロジェクトを追加すると、自動的にトップページに表示されます。

## URL構造

- `/` - ルートページ（デフォルト言語にリダイレクト）
- `/{lang}/` - 言語別トップページ（例: `/ja/`, `/en/`）

## 使用パッケージ

- `@docs/ui` - 共通UIコンポーネント（Footer, ThemeToggle, Icon, Dropdownなど）
- `@docs/theme` - 共通テーマシステム
- `@docs/i18n` - 国際化ユーティリティ

## デプロイ

トップページは Cloudflare Pages のルートパス（`/`）にデプロイされます。

```bash
pnpm deploy
```

## ライセンス

このプロジェクトは libx-dev の一部です。
