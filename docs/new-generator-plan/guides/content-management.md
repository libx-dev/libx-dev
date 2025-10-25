# コンテンツ管理ガイド

このガイドは、新ドキュメントサイトジェネレーターでのコンテンツ作成・管理・翻訳に関する実践的な手順を説明します。

## 目次

- [はじめに](#はじめに)
- [MDXコンテンツの作成](#mdxコンテンツの作成)
- [フロントマター](#フロントマター)
- [コンテンツ構造](#コンテンツ構造)
- [翻訳管理](#翻訳管理)
- [プレビュー・レビュー](#プレビューレビュー)
- [品質チェックリスト](#品質チェックリスト)
- [SEOベストプラクティス](#seoベストプラクティス)

---

## はじめに

### コンテンツフォーマット

新ドキュメントサイトジェネレーターは、以下のフォーマットをサポートします：

- **MDX**: Markdown + React コンポーネント（推奨）
- **Markdown**: 標準的なMarkdown（基本機能のみ）

### ディレクトリ構造

```
apps/[project-id]/src/content/docs/
└── [version]/
    └── [lang]/
        ├── index.mdx           # トップページ
        ├── getting-started.mdx # 単一ファイル
        └── guide/              # ネストしたディレクトリ
            ├── installation.mdx
            └── configuration.mdx
```

**例**（sample-docs）:
```
apps/sample-docs/src/content/docs/
├── v1/
│   ├── en/
│   │   ├── index.mdx
│   │   ├── getting-started.mdx
│   │   └── guide/
│   │       ├── installation.mdx
│   │       └── configuration.mdx
│   └── ja/
│       ├── index.mdx
│       ├── getting-started.mdx
│       └── guide/
│           ├── installation.mdx
│           └── configuration.mdx
└── v2/
    └── en/
        ├── index.mdx
        └── ...
```

---

## MDXコンテンツの作成

### ワークフロー1: 新規ドキュメント作成

#### ステップ1: CLIでドキュメント追加

```bash
# CLIで新規ドキュメント追加
pnpm docs-cli add doc sample-docs guide/quickstart \
  --title-en "Quick Start Guide" \
  --title-ja "クイックスタートガイド" \
  --summary "Get started with the library in 5 minutes" \
  --category guide \
  --keywords "quickstart,getting-started,tutorial" \
  --tags "beginner" \
  --yes
```

**生成されるファイル**:
- `apps/sample-docs/src/content/docs/v1/en/guide/quickstart.mdx`
- `apps/sample-docs/src/content/docs/v1/ja/guide/quickstart.mdx`
- `apps/sample-docs/src/content/docs/v2/en/guide/quickstart.mdx`（v2が存在する場合）

#### ステップ2: コンテンツを編集

**英語版** (`apps/sample-docs/src/content/docs/v1/en/guide/quickstart.mdx`):

```mdx
---
title: Quick Start Guide
summary: Get started with the library in 5 minutes
docId: sample-docs-003
slug: guide/quickstart
keywords: [quickstart, getting-started, tutorial]
tags: [beginner]
---

# Quick Start Guide

This guide will help you get started with the library in just 5 minutes.

## Prerequisites

Before you begin, ensure you have:

- Node.js v18.0.0 or higher
- npm or pnpm installed

## Installation

Install the library using npm:

\`\`\`bash
npm install my-library
\`\`\`

Or using pnpm:

\`\`\`bash
pnpm add my-library
\`\`\`

## Basic Usage

Here's a simple example:

\`\`\`javascript
import { MyLibrary } from 'my-library';

const lib = new MyLibrary();
lib.doSomething();
\`\`\`

## Next Steps

- Read the [Installation Guide](./installation)
- Explore the [API Reference](../api/overview)
- Check out [Examples](../examples/basic)
```

**日本語版** (`apps/sample-docs/src/content/docs/v1/ja/guide/quickstart.mdx`):

```mdx
---
title: クイックスタートガイド
summary: 5分でライブラリを使い始める
docId: sample-docs-003
slug: guide/quickstart
keywords: [quickstart, getting-started, tutorial]
tags: [beginner]
---

# クイックスタートガイド

このガイドでは、わずか5分でライブラリを使い始める方法を説明します。

## 前提条件

始める前に、以下を確認してください：

- Node.js v18.0.0以上
- npmまたはpnpmがインストールされていること

## インストール

npmを使用してインストール：

\`\`\`bash
npm install my-library
\`\`\`

またはpnpmを使用：

\`\`\`bash
pnpm add my-library
\`\`\`

## 基本的な使い方

シンプルな例：

\`\`\`javascript
import { MyLibrary } from 'my-library';

const lib = new MyLibrary();
lib.doSomething();
\`\`\`

## 次のステップ

- [インストールガイド](./installation)を読む
- [APIリファレンス](../api/overview)を確認
- [基本的な例](../examples/basic)をチェック
```

---

### MDX拡張機能

#### React コンポーネントの使用

MDXでは、インポートしたReactコンポーネントを直接使用できます：

```mdx
---
title: Advanced Usage
---

import { Card, Note, CodeBlock } from '@docs/ui';

# Advanced Usage

<Note type="info">
This is an informational note.
</Note>

## Key Features

<Card title="Feature 1" icon="rocket">
Fast and efficient processing
</Card>

<Card title="Feature 2" icon="lock">
Secure by default
</Card>

## Code Example

<CodeBlock lang="javascript" filename="example.js">
\`\`\`javascript
const example = () => {
  console.log('Hello, world!');
};
\`\`\`
</CodeBlock>
```

#### 利用可能なコンポーネント

**@docs/ui**パッケージから利用可能：

- `<Card>` - カード型コンテンツ
- `<Note>` - 情報・警告ボックス
- `<CodeBlock>` - シンタックスハイライト付きコードブロック
- `<Tabs>` - タブUI
- `<Accordion>` - アコーディオン
- `<Button>` - ボタン
- `<Badge>` - バッジ

詳細は[UIコンポーネントガイド](../../packages/ui/README.md)を参照。

---

## フロントマター

### 必須フィールド

すべてのMDXファイルには、以下のフロントマターフィールドが必須です：

```yaml
---
title: ドキュメントのタイトル
summary: ドキュメントの概要（1-2文）
docId: プロジェクトのドキュメントID（例: sample-docs-001）
slug: URLスラッグ（例: guide/installation）
---
```

### オプションフィールド

```yaml
---
# 必須フィールド
title: Installation Guide
summary: How to install the library
docId: sample-docs-002
slug: guide/installation

# オプションフィールド
keywords: [install, setup, npm, pnpm]       # SEO用キーワード
tags: [beginner, tutorial]                   # カテゴリタグ
author: John Doe                             # 著者名
date: 2025-10-25                             # 作成日
lastUpdated: 2025-10-25                      # 最終更新日
status: published                            # ステータス（draft, published, archived）
visibility: public                           # 可視性（public, private）
tableOfContents: true                        # 目次表示（デフォルト: true）
editUrl: https://github.com/.../edit/main/... # 編集リンク
---
```

### フロントマターのベストプラクティス

#### 1. タイトルは明確で簡潔に

```yaml
# ✅ 良い例
title: Installation Guide

# ❌ 悪い例
title: How to Install This Library on Your Computer
```

#### 2. サマリーは1-2文で要約

```yaml
# ✅ 良い例
summary: Learn how to install the library using npm or pnpm.

# ❌ 悪い例
summary: This guide will teach you everything you need to know about installing the library, including prerequisites, installation steps, and troubleshooting common issues.
```

#### 3. キーワードは5-10個

```yaml
# ✅ 良い例
keywords: [install, setup, npm, pnpm, quickstart]

# ❌ 悪い例（多すぎる）
keywords: [install, installation, setup, configuration, npm, pnpm, yarn, bun, package, manager, quickstart, getting-started, tutorial, guide]
```

---

## コンテンツ構造

### カテゴリとドキュメントの整理

#### レジストリでのカテゴリ定義

レジストリ（`registry/docs.json`）でカテゴリを定義します：

```json
{
  "projects": [
    {
      "id": "sample-docs",
      "versions": [
        {
          "id": "v1",
          "categories": [
            {
              "id": "guide",
              "displayName": {
                "en": "Guides",
                "ja": "ガイド"
              },
              "order": 1
            },
            {
              "id": "api",
              "displayName": {
                "en": "API Reference",
                "ja": "APIリファレンス"
              },
              "order": 2
            }
          ]
        }
      ]
    }
  ]
}
```

#### ドキュメントをカテゴリに配置

```json
{
  "documents": [
    {
      "id": "sample-docs-001",
      "slug": "guide/installation",
      "category": "guide",
      "order": 1
    },
    {
      "id": "sample-docs-002",
      "slug": "guide/configuration",
      "category": "guide",
      "order": 2
    },
    {
      "id": "sample-docs-010",
      "slug": "api/overview",
      "category": "api",
      "order": 1
    }
  ]
}
```

#### サイドバーでの表示順序

`order`フィールドでサイドバーの表示順序を制御します：

```json
{
  "categories": [
    { "id": "guide", "order": 1 },      # 最初に表示
    { "id": "api", "order": 2 },        # 2番目
    { "id": "examples", "order": 3 }    # 3番目
  ],
  "documents": [
    { "slug": "guide/installation", "order": 1 },    # カテゴリ内で最初
    { "slug": "guide/quickstart", "order": 2 },      # カテゴリ内で2番目
    { "slug": "guide/configuration", "order": 3 }    # カテゴリ内で3番目
  ]
}
```

---

## 翻訳管理

### ワークフロー2: コンテンツの翻訳

#### ステップ1: 翻訳ステータスの確認

翻訳が必要なドキュメントには、自動的に翻訳マーカーが挿入されます：

```mdx
<!-- TODO: ja - この文書は翻訳が必要です -->

---
title: Installation Guide
summary: How to install the library
docId: sample-docs-002
slug: guide/installation
---

# Installation Guide

[英語のコンテンツ]
```

#### ステップ2: 翻訳を実施

翻訳マーカーを削除し、コンテンツを翻訳します：

**翻訳前** (`apps/sample-docs/src/content/docs/v1/ja/guide/installation.mdx`):
```mdx
<!-- TODO: ja - この文書は翻訳が必要です -->

---
title: Installation Guide
summary: How to install the library
docId: sample-docs-002
slug: guide/installation
---

# Installation Guide

Install the library using npm...
```

**翻訳後**:
```mdx
---
title: インストールガイド
summary: ライブラリのインストール方法
docId: sample-docs-002
slug: guide/installation
---

# インストールガイド

npmを使用してライブラリをインストール...
```

#### ステップ3: 翻訳ステータスの更新

レジストリで翻訳ステータスを更新します（任意）：

```json
{
  "documents": [
    {
      "id": "sample-docs-002",
      "slug": "guide/installation",
      "translationStatus": {
        "en": "complete",
        "ja": "complete",      # 翻訳完了
        "zh-Hans": "pending"   # 翻訳待ち
      }
    }
  ]
}
```

---

### 翻訳のベストプラクティス

#### 1. フロントマターも翻訳

```yaml
# 英語版
---
title: Installation Guide
summary: How to install the library
keywords: [install, setup, npm]
---

# 日本語版
---
title: インストールガイド
summary: ライブラリのインストール方法
keywords: [インストール, セットアップ, npm]
---
```

#### 2. コードブロックは言語固有の例を提供

```mdx
# 英語版
\`\`\`bash
npm install my-library
\`\`\`

# 日本語版（同じコマンド、コメントを日本語化）
\`\`\`bash
# ライブラリをインストール
npm install my-library
\`\`\`
```

#### 3. リンクは相対パスを使用

```mdx
# ✅ 良い例（言語間で共通）
[API Reference](../api/overview)

# ❌ 悪い例（言語固有）
[API Reference](/docs/sample-docs/v1/en/api/overview)
```

#### 4. 画像ファイルは共有または言語別

```
# 共有画像（言語に依存しない）
apps/sample-docs/public/images/diagram.png

# 言語別画像（テキスト含む）
apps/sample-docs/public/images/en/screenshot.png
apps/sample-docs/public/images/ja/screenshot.png
```

---

## プレビュー・レビュー

### ローカルプレビュー

#### ステップ1: ビルド実行

```bash
# プロジェクトディレクトリへ移動
cd apps/sample-docs

# ビルド実行
pnpm build
```

#### ステップ2: プレビューサーバー起動

```bash
# プレビューサーバー起動
pnpm preview --port 4322
```

#### ステップ3: ブラウザで確認

```
# 英語版
http://localhost:4322/docs/sample-docs/v1/en/guide/installation

# 日本語版
http://localhost:4322/docs/sample-docs/v1/ja/guide/installation
```

**確認ポイント**:
- [ ] タイトルが正しく表示される
- [ ] サイドバーに表示される
- [ ] リンクが正しく動作する
- [ ] 画像が表示される
- [ ] コードブロックがハイライトされる
- [ ] 目次が生成される

---

### Gitワークフロー

#### ステップ1: ブランチ作成

```bash
# フィーチャーブランチ作成
git checkout -b docs/add-installation-guide
```

#### ステップ2: 変更をコミット

```bash
# 変更ファイルを確認
git status

# ステージング
git add apps/sample-docs/src/content/docs/

# コミット
git commit -m "Add installation guide (en, ja)"
```

#### ステップ3: プッシュとPR作成

```bash
# リモートにプッシュ
git push origin docs/add-installation-guide

# GitHubでPR作成
# https://github.com/<user>/libx-dev/pull/new/docs/add-installation-guide
```

#### ステップ4: レビュー対応

**レビューで確認される項目**:
- [ ] フロントマターが正しい
- [ ] 翻訳が完了している
- [ ] リンクが機能する
- [ ] コードサンプルが動作する
- [ ] 画像が表示される
- [ ] SEOキーワードが適切
- [ ] 文法・スペルチェック

---

## 品質チェックリスト

### コンテンツ品質

#### 1. 構造

- [ ] **見出し階層が正しい**: h1 → h2 → h3（スキップなし）
- [ ] **段落が適切**: 1段落 = 1トピック
- [ ] **リストを活用**: 手順や項目はリスト化
- [ ] **コードブロックにラベル**: ファイル名や言語を明記

#### 2. 文章

- [ ] **簡潔**: 1文は30語以下（日本語は60文字以下）
- [ ] **明確**: 専門用語には説明を追加
- [ ] **能動態**: 受動態より能動態を優先
- [ ] **一貫性**: 用語の統一（例: "プロジェクト" vs "プロジェクト"）

#### 3. リンク

- [ ] **内部リンク**: 相対パスを使用
- [ ] **外部リンク**: 新規タブで開く（`target="_blank"`）
- [ ] **アンカーリンク**: 見出しIDを使用
- [ ] **リンク切れチェック**: すべてのリンクが機能する

#### 4. 画像・メディア

- [ ] **alt属性**: すべての画像にalt属性
- [ ] **適切なサイズ**: 画像は500KB以下
- [ ] **フォーマット**: WebPまたはPNG（JPEGはグラデーション用）
- [ ] **レスポンシブ**: 画像が小画面でも表示される

#### 5. アクセシビリティ

- [ ] **見出しスキップなし**: h1 → h2 → h3
- [ ] **alt属性**: 画像に説明テキスト
- [ ] **カラーコントラスト**: WCAG AA基準（4.5:1以上）
- [ ] **キーボードナビゲーション**: リンクがTabキーで選択可能

---

## SEOベストプラクティス

### メタデータ最適化

#### 1. タイトルタグ

```yaml
# ✅ 良い例（50-60文字）
title: Installation Guide - My Library

# ❌ 悪い例（長すぎる）
title: The Complete Step-by-Step Installation Guide for My Library on Windows, macOS, and Linux
```

#### 2. メタディスクリプション

```yaml
# ✅ 良い例（150-160文字）
summary: Learn how to install My Library using npm or pnpm. Includes prerequisites, installation steps, and troubleshooting.

# ❌ 悪い例（短すぎる）
summary: Installation guide.
```

#### 3. キーワード選定

```yaml
# ✅ 良い例（関連性の高いキーワード）
keywords: [installation, setup, npm, pnpm, quickstart]

# ❌ 悪い例（無関係なキーワード）
keywords: [installation, react, vue, angular, svelte]
```

---

### URL構造

#### URLスラッグのベストプラクティス

```yaml
# ✅ 良い例
slug: guide/installation
slug: api/authentication
slug: examples/basic-usage

# ❌ 悪い例
slug: guide-installation        # スラッシュなし
slug: Guide/Installation        # 大文字
slug: guide_installation        # アンダースコア
```

---

### 内部リンク

#### 関連ドキュメントへのリンク

```mdx
# ページ下部に「関連ドキュメント」セクションを追加

## 関連ドキュメント

- [Configuration Guide](./configuration) - 設定方法の詳細
- [API Reference](../api/overview) - APIの完全なリファレンス
- [Troubleshooting](./troubleshooting) - よくある問題と解決法
```

---

### スキーママークアップ（将来実装）

将来的には、構造化データ（Schema.org）を自動生成する予定です：

```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Installation Guide",
  "description": "Learn how to install My Library",
  "keywords": "installation, setup, npm",
  "author": {
    "@type": "Person",
    "name": "John Doe"
  },
  "datePublished": "2025-10-25"
}
```

---

## まとめ

本ガイドでは、コンテンツ管理に関する以下の内容を説明しました：

- ✅ MDXコンテンツの作成方法
- ✅ フロントマターのスキーマとベストプラクティス
- ✅ カテゴリとドキュメントの構造化
- ✅ 翻訳ワークフローと管理
- ✅ プレビュー・レビュープロセス
- ✅ コンテンツ品質チェックリスト
- ✅ SEOベストプラクティス

**推奨事項**:
- すべてのコンテンツに必須フロントマターを設定
- 翻訳マーカーを削除してから公開
- ローカルプレビューで動作確認
- 品質チェックリストを確認
- SEOキーワードを適切に設定

**関連ドキュメント**:
- [CLI運用ガイド](./cli-operations.md) - ドキュメント追加コマンド
- [ビルド・デプロイ運用ガイド](./build-deploy-operations.md) - プレビュー・デプロイ手順
- [UIコンポーネントガイド](../../packages/ui/README.md) - 利用可能なコンポーネント
- [FAQ](./faq.md) - よくある質問

---

**作成日**: 2025-10-25
**最終更新**: 2025-10-25
**バージョン**: 1.0.0
