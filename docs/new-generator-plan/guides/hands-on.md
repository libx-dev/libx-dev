# ハンズオン実習手順書

このドキュメントは、新ドキュメントサイトジェネレーターの実践的な演習手順を提供します。各演習は段階的に構成されており、実際の運用で必要なスキルを習得できます。

**対象読者**: トレーニング参加者全員

**関連資料**:
- [トレーニング計画書](./training-plan.md) - セッション構成
- [トレーニングスライド](./slides.md) - プレゼンテーション資料
- [CLI操作ガイド](./cli-operations.md) - コマンドリファレンス
- [トラブルシューティングガイド](./troubleshooting.md) - 問題解決

---

## 目次

- [事前準備](#事前準備)
- [演習1: 環境セットアップ](#演習1-環境セットアップ)
- [演習2: プロジェクト作成](#演習2-プロジェクト作成)
- [演習3: ドキュメント追加](#演習3-ドキュメント追加)
- [演習4: 翻訳追加](#演習4-翻訳追加)
- [演習5: バージョン管理](#演習5-バージョン管理)
- [演習6: トラブルシューティング](#演習6-トラブルシューティング)
- [総合演習](#総合演習)

---

## 事前準備

### 必要なツール

以下のツールがインストールされていることを確認してください：

| ツール | 必須バージョン | インストール確認コマンド |
|--------|--------------|----------------------|
| **Node.js** | v18.0.0以上 | `node --version` |
| **pnpm** | v8.0.0以上 | `pnpm --version` |
| **Git** | v2.30.0以上 | `git --version` |
| **VSCode** | 最新版（推奨） | `code --version` |

### インストール方法

**Node.js**（未インストールの場合）:

```bash
# macOS（Homebrewを使用）
brew install node@18

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows
# https://nodejs.org/ からインストーラーをダウンロード
```

**pnpm**（未インストールの場合）:

```bash
# Node.jsがインストールされている場合
npm install -g pnpm

# 確認
pnpm --version
```

### リポジトリのクローン

```bash
# libx-devリポジトリをクローン
git clone https://github.com/your-org/libx-dev.git
cd libx-dev

# 依存関係をインストール
pnpm install
```

**所要時間**: 初回は5-10分程度

---

## 演習1: 環境セットアップ

### 目的

- ローカル開発環境をセットアップする
- CLIツールをインストールして動作確認する
- サンプルプロジェクトをビルドする

### 推定時間

30分

---

### ステップ1-1: 依存関係のインストール確認

```bash
# モノレポルートに移動
cd /path/to/libx-dev

# Node.jsバージョン確認
node --version
# 期待される出力: v18.x.x 以上

# pnpmバージョン確認
pnpm --version
# 期待される出力: 8.x.x 以上

# 依存関係インストール
pnpm install
```

**期待される結果**:
- ✅ `node_modules` ディレクトリが作成される
- ✅ エラーメッセージが表示されない
- ✅ 最後に "Done in X.Xs" と表示される

---

### ステップ1-2: CLIツールのインストール

```bash
# CLIパッケージに移動
cd packages/cli

# グローバルインストール
pnpm link --global

# モノレポルートに戻る
cd ../..

# インストール確認
which docs-gen
# 期待される出力: /path/to/.../docs-gen

docs-gen --version
# 期待される出力: 0.0.1 (または最新バージョン)
```

**期待される結果**:
- ✅ `docs-gen` コマンドが使用可能
- ✅ バージョン番号が表示される

---

### ステップ1-3: サンプルプロジェクトのビルド

```bash
# demo-docsプロジェクトをビルド
cd apps/demo-docs
pnpm build

# ビルド出力を確認
ls -la dist/

# プレビューサーバーを起動
pnpm preview
```

**期待される結果**:
- ✅ `dist/` ディレクトリが作成される
- ✅ プレビューサーバーが起動する（http://localhost:4321）
- ✅ ブラウザでサイトが表示される

**ブラウザで確認**:
- http://localhost:4321/v1/en/getting-started/
- http://localhost:4321/v1/ja/getting-started/

---

### ステップ1-4: チェックポイント

以下をすべて確認できたら、次の演習に進んでください：

- [ ] Node.js v18以上がインストールされている
- [ ] pnpm v8以上がインストールされている
- [ ] 依存関係がインストールされている
- [ ] `docs-gen` コマンドが使用可能
- [ ] demo-docsがビルドできた
- [ ] プレビューサーバーでサイトが表示された

---

## 演習2: プロジェクト作成

### 目的

- CLIを使用して新規プロジェクトを作成する
- レジストリファイルの構造を理解する
- 作成したプロジェクトをビルドする

### 推定時間

45分

---

### ステップ2-1: 新規プロジェクトの作成

```bash
# モノレポルートに移動
cd /path/to/libx-dev

# 新規プロジェクトを作成（対話形式）
docs-gen add project

# 以下の情報を入力
# Project ID: training-docs
# Project Title (en): Training Documentation
# Project Title (ja): トレーニング文書
# Description (en): Documentation for training purposes
# Description (ja): トレーニング用ドキュメント
```

**期待される出力**:

```
✅ Project created successfully!
   Project ID: training-docs
   Registry: registry/training-docs.json
   App directory: apps/training-docs/
```

**期待される結果**:
- ✅ `registry/training-docs.json` ファイルが作成される
- ✅ `apps/training-docs/` ディレクトリが作成される

---

### ステップ2-2: レジストリファイルの確認

```bash
# レジストリファイルを確認
cat registry/training-docs.json
```

**期待される内容**:

```json
{
  "$schemaVersion": "0.0.1",
  "projects": [
    {
      "id": "training-docs",
      "title": {
        "en": "Training Documentation",
        "ja": "トレーニング文書"
      },
      "description": {
        "en": "Documentation for training purposes",
        "ja": "トレーニング用ドキュメント"
      },
      "versions": [
        {
          "id": "v1",
          "name": "Version 1.0",
          "status": "active",
          "isLatest": true
        }
      ],
      "languages": ["en", "ja"],
      "documents": [],
      "categories": {}
    }
  ]
}
```

**確認ポイント**:
- ✅ `$schemaVersion` が `"0.0.1"`
- ✅ `title`, `description` が多言語オブジェクト形式
- ✅ デフォルトバージョン `v1` が作成されている
- ✅ デフォルト言語 `en`, `ja` が設定されている

---

### ステップ2-3: プロジェクト構造の確認

```bash
# アプリディレクトリの構造を確認
tree apps/training-docs/ -L 3

# または
ls -la apps/training-docs/
ls -la apps/training-docs/src/
ls -la apps/training-docs/src/content/
```

**期待されるディレクトリ構造**:

```
apps/training-docs/
├── package.json
├── astro.config.mjs
├── tsconfig.json
├── public/
└── src/
    ├── components/
    ├── content/
    │   └── docs/
    │       └── v1/
    │           ├── en/
    │           └── ja/
    ├── layouts/
    └── pages/
```

---

### ステップ2-4: 初回ビルド

```bash
# training-docsプロジェクトをビルド
cd apps/training-docs
pnpm install  # プロジェクト固有の依存関係をインストール
pnpm build

# ビルド出力を確認
ls -la dist/
```

**期待される結果**:
- ✅ ビルドが成功する
- ✅ `dist/` ディレクトリが作成される
- ✅ エラーメッセージが表示されない

**トラブルシューティング**:

問題が発生した場合：

```bash
# 詳細ログで再実行
pnpm build --verbose

# または、トラブルシューティングガイドを参照
```

---

### ステップ2-5: チェックポイント

以下をすべて確認できたら、次の演習に進んでください：

- [ ] 新規プロジェクト `training-docs` が作成された
- [ ] レジストリファイルが正しく生成された
- [ ] アプリディレクトリが作成された
- [ ] 初回ビルドが成功した

---

## 演習3: ドキュメント追加

### 目的

- CLIを使用して新規ドキュメントを追加する
- MDXファイルを編集する
- ビルド後にドキュメントを確認する

### 推定時間

60分

---

### ステップ3-1: 新規ドキュメントの追加

```bash
# モノレポルートに移動
cd /path/to/libx-dev

# 新規ドキュメントを追加（対話形式）
docs-gen add doc

# 以下の情報を入力
# Project ID: training-docs
# Document ID: introduction
# Title (en): Introduction
# Title (ja): はじめに
# Summary (en): Introduction to the training system
# Summary (ja): トレーニングシステムの紹介
# Category: guide
```

**期待される出力**:

```
✅ Document created successfully!
   Project: training-docs
   Document ID: introduction
   Files created:
     - apps/training-docs/src/content/docs/v1/en/introduction.mdx
     - apps/training-docs/src/content/docs/v1/ja/introduction.mdx
```

---

### ステップ3-2: 英語版MDXファイルの編集

```bash
# 英語版ファイルを開く
vim apps/training-docs/src/content/docs/v1/en/introduction.mdx
# または
code apps/training-docs/src/content/docs/v1/en/introduction.mdx
```

**以下の内容に編集**:

```mdx
---
title: Introduction
summary: Introduction to the training system
description: Learn about the new documentation site generator training program
---

# Introduction

Welcome to the new documentation site generator training program!

## What You Will Learn

In this training, you will learn:

- **System Architecture**: Understanding the registry-driven design
- **CLI Operations**: Using commands to manage projects and documents
- **Content Management**: Creating and maintaining MDX content
- **Troubleshooting**: Solving common problems

## Prerequisites

Before starting, make sure you have:

- Node.js v18 or higher
- pnpm v8 or higher
- Basic knowledge of Markdown
- Git basics

## Next Steps

Continue to the next section: [Installation](./installation)

## Getting Help

If you have questions:
- Slack: #docs-support
- Email: support@example.com
```

**保存して閉じる** (Vim: `:wq`, VSCode: `Ctrl+S`)

---

### ステップ3-3: 日本語版MDXファイルの編集

```bash
# 日本語版ファイルを開く
vim apps/training-docs/src/content/docs/v1/ja/introduction.mdx
```

**以下の内容に編集**:

```mdx
---
title: はじめに
summary: トレーニングシステムの紹介
description: 新しいドキュメントサイトジェネレーターのトレーニングプログラムについて学ぶ
---

# はじめに

新しいドキュメントサイトジェネレーターのトレーニングプログラムへようこそ！

## 学習内容

このトレーニングでは、以下を学びます：

- **システムアーキテクチャ**: レジストリ駆動設計の理解
- **CLI操作**: コマンドを使用したプロジェクト・ドキュメント管理
- **コンテンツ管理**: MDXコンテンツの作成と保守
- **トラブルシューティング**: よくある問題の解決

## 前提条件

開始する前に、以下を準備してください：

- Node.js v18以上
- pnpm v8以上
- Markdownの基礎知識
- Gitの基本操作

## 次のステップ

次のセクションに進む: [インストール](./installation)

## ヘルプ

質問がある場合：
- Slack: #docs-support
- メール: support@example.com
```

**保存して閉じる**

---

### ステップ3-4: レジストリの確認

```bash
# レジストリファイルを確認
cat registry/training-docs.json | jq '.projects[].documents'
```

**期待される内容**:

```json
[
  {
    "id": "introduction",
    "slug": "introduction",
    "title": {
      "en": "Introduction",
      "ja": "はじめに"
    },
    "summary": {
      "en": "Introduction to the training system",
      "ja": "トレーニングシステムの紹介"
    },
    "category": "guide",
    "visibility": "public",
    "translationStatus": {
      "en": "published",
      "ja": "published"
    }
  }
]
```

---

### ステップ3-5: ビルドと確認

```bash
# training-docsを再ビルド
cd apps/training-docs
pnpm build

# プレビューサーバーを起動
pnpm preview --port 4322
```

**ブラウザで確認**:
- http://localhost:4322/v1/en/introduction/
- http://localhost:4322/v1/ja/introduction/

**確認ポイント**:
- ✅ ページが表示される
- ✅ タイトルが正しく表示される
- ✅ コンテンツが正しく表示される
- ✅ 言語切替が動作する（英語 ↔ 日本語）

---

### ステップ3-6: サイドバーの確認

プレビューサーバーで、左側のサイドバーを確認してください。

**期待される表示**:

```
Guides
└─ Introduction
```

---

### ステップ3-7: チェックポイント

以下をすべて確認できたら、次の演習に進んでください：

- [ ] 新規ドキュメント `introduction` が追加された
- [ ] 英語版・日本語版のMDXファイルが作成された
- [ ] MDXファイルを編集した
- [ ] ビルドが成功した
- [ ] ブラウザでドキュメントが表示された
- [ ] サイドバーにドキュメントが表示された

---

## 演習4: 翻訳追加

### 目的

- 既存ドキュメントに新しい言語を追加する
- 翻訳ステータスを管理する
- RTL言語（アラビア語）の動作を確認する

### 推定時間

45分

---

### ステップ4-1: 新規言語の追加

```bash
# モノレポルートに移動
cd /path/to/libx-dev

# 韓国語を追加
docs-gen add language

# 以下の情報を入力
# Project ID: training-docs
# Language code: ko
# Template language: en
```

**期待される出力**:

```
✅ Language added successfully!
   Project: training-docs
   Language: ko (Korean)
   Template files copied from: en
```

**期待される結果**:
- ✅ レジストリに `ko` が追加される
- ✅ `apps/training-docs/src/content/docs/v1/ko/` ディレクトリが作成される
- ✅ 英語版からテンプレートファイルがコピーされる

---

### ステップ4-2: レジストリの確認

```bash
# 言語一覧を確認
cat registry/training-docs.json | jq '.projects[].languages'
```

**期待される出力**:

```json
["en", "ja", "ko"]
```

**翻訳ステータスを確認**:

```bash
cat registry/training-docs.json | jq '.projects[].documents[].translationStatus'
```

**期待される出力**:

```json
{
  "en": "published",
  "ja": "published",
  "ko": "draft"
}
```

---

### ステップ4-3: 韓国語版の翻訳

```bash
# 韓国語版ファイルを開く
vim apps/training-docs/src/content/docs/v1/ko/introduction.mdx
```

**以下の内容に編集**（機械翻訳を使用しても可）:

```mdx
---
title: 소개
summary: 교육 시스템 소개
description: 새 문서 사이트 생성기 교육 프로그램에 대해 알아보기
---

# 소개

새 문서 사이트 생성기 교육 프로그램에 오신 것을 환영합니다!

## 학습 내용

이 교육에서는 다음을 학습합니다:

- **시스템 아키텍처**: 레지스트리 기반 설계 이해
- **CLI 작업**: 명령을 사용한 프로젝트 및 문서 관리
- **콘텐츠 관리**: MDX 콘텐츠 생성 및 유지 관리
- **문제 해결**: 일반적인 문제 해결

## 전제 조건

시작하기 전에 다음을 준비하세요:

- Node.js v18 이상
- pnpm v8 이상
- Markdown 기본 지식
- Git 기본 작업

## 다음 단계

다음 섹션으로 이동: [설치](./installation)

## 도움말

질문이 있으면:
- Slack: #docs-support
- 이메일: support@example.com
```

**保存して閉じる**

---

### ステップ4-4: 翻訳ステータスの更新

```bash
# 韓国語版をレビュー中に更新
docs-gen update doc \
  --project training-docs \
  --id introduction \
  --translation-status-ko review

# 確認
cat registry/training-docs.json | jq '.projects[].documents[0].translationStatus'
```

**期待される出力**:

```json
{
  "en": "published",
  "ja": "published",
  "ko": "review"
}
```

---

### ステップ4-5: レビュー後に公開

```bash
# 韓国語版を公開
docs-gen update doc \
  --project training-docs \
  --id introduction \
  --translation-status-ko published

# 確認
cat registry/training-docs.json | jq '.projects[].documents[0].translationStatus'
```

**期待される出力**:

```json
{
  "en": "published",
  "ja": "published",
  "ko": "published"
}
```

---

### ステップ4-6: ビルドと確認

```bash
# 再ビルド
cd apps/training-docs
pnpm build

# プレビューサーバーを起動
pnpm preview --port 4322
```

**ブラウザで確認**:
- http://localhost:4322/v1/ko/introduction/

**確認ポイント**:
- ✅ 韓国語版が表示される
- ✅ 言語切替で韓国語を選択できる
- ✅ タイトル・コンテンツが韓国語で表示される

---

### ステップ4-7: （オプション）RTL言語の追加

**アラビア語を追加**（RTL言語の動作確認用）:

```bash
# アラビア語を追加
docs-gen add language \
  --project training-docs \
  --lang ar \
  --template-lang en

# ビルド
cd apps/training-docs
pnpm build

# プレビューサーバーで確認
# http://localhost:4322/v1/ar/introduction/
```

**確認ポイント**:
- ✅ テキストが右から左に表示される
- ✅ レイアウトが反転する（サイドバーが右側）

---

### ステップ4-8: チェックポイント

以下をすべて確認できたら、次の演習に進んでください：

- [ ] 韓国語が追加された
- [ ] 韓国語版のMDXファイルが作成された
- [ ] 翻訳ステータスを更新した（draft → review → published）
- [ ] ビルドが成功した
- [ ] ブラウザで韓国語版が表示された
- [ ] （オプション）アラビア語でRTL表示を確認した

---

## 演習5: バージョン管理

### 目的

- 新しいバージョンを作成する
- バージョン間でドキュメントをコピーする
- 旧バージョンを非推奨化する

### 推定時間

45分

---

### ステップ5-1: 新規バージョンの作成

```bash
# モノレポルートに移動
cd /path/to/libx-dev

# 新規バージョンを作成
docs-gen add version

# 以下の情報を入力
# Project ID: training-docs
# Version ID: v2
# Version name: Version 2.0
# Status: active
# Is latest: yes
```

**期待される出力**:

```
✅ Version created successfully!
   Project: training-docs
   Version ID: v2
   Version name: Version 2.0
   Directory created: apps/training-docs/src/content/docs/v2/
```

---

### ステップ5-2: レジストリの確認

```bash
# バージョン一覧を確認
cat registry/training-docs.json | jq '.projects[].versions'
```

**期待される出力**:

```json
[
  {
    "id": "v1",
    "name": "Version 1.0",
    "status": "active",
    "isLatest": false
  },
  {
    "id": "v2",
    "name": "Version 2.0",
    "status": "active",
    "isLatest": true
  }
]
```

**確認ポイント**:
- ✅ `v2` が追加されている
- ✅ `v2` の `isLatest` が `true`
- ✅ `v1` の `isLatest` が `false` に自動更新されている

---

### ステップ5-3: v1からv2へドキュメントをコピー

```bash
# v1のintroductionをv2にコピー
cp -r apps/training-docs/src/content/docs/v1/en/introduction.mdx \
      apps/training-docs/src/content/docs/v2/en/introduction.mdx

cp -r apps/training-docs/src/content/docs/v1/ja/introduction.mdx \
      apps/training-docs/src/content/docs/v2/ja/introduction.mdx

cp -r apps/training-docs/src/content/docs/v1/ko/introduction.mdx \
      apps/training-docs/src/content/docs/v2/ko/introduction.mdx
```

**v2版の内容を更新**:

```bash
# v2の英語版を編集
vim apps/training-docs/src/content/docs/v2/en/introduction.mdx
```

**以下の内容に変更**（冒頭に追記）:

```mdx
---
title: Introduction (Version 2.0)
summary: Introduction to the training system - Version 2.0
description: Learn about the new documentation site generator training program (v2.0)
---

# Introduction (Version 2.0)

> **Note**: This is Version 2.0 of the documentation. For Version 1.0, see [here](/v1/en/introduction).

Welcome to the new documentation site generator training program Version 2.0!

...（以下、既存の内容）
```

**保存して閉じる**

---

### ステップ5-4: ビルドと確認

```bash
# 再ビルド
cd apps/training-docs
pnpm build

# プレビューサーバーを起動
pnpm preview --port 4322
```

**ブラウザで確認**:
- http://localhost:4322/v1/en/introduction/（Version 1.0）
- http://localhost:4322/v2/en/introduction/（Version 2.0）

**確認ポイント**:
- ✅ バージョン切替UIが表示される
- ✅ v1とv2を切り替えられる
- ✅ v2の内容が正しく表示される

---

### ステップ5-5: v1を非推奨化

```bash
# v1を非推奨に更新
docs-gen update version \
  --project training-docs \
  --id v1 \
  --status deprecated \
  --is-latest false

# 確認
cat registry/training-docs.json | jq '.projects[].versions'
```

**期待される出力**:

```json
[
  {
    "id": "v1",
    "name": "Version 1.0",
    "status": "deprecated",
    "isLatest": false
  },
  {
    "id": "v2",
    "name": "Version 2.0",
    "status": "active",
    "isLatest": true
  }
]
```

---

### ステップ5-6: 非推奨バージョンの表示確認

```bash
# 再ビルド
cd apps/training-docs
pnpm build

# プレビューサーバーで確認
```

**ブラウザで確認**:
- http://localhost:4322/v1/en/introduction/

**確認ポイント**:
- ✅ 非推奨バージョンに警告バナーが表示される（実装されている場合）
- ✅ バージョンセレクターで "deprecated" 表示

---

### ステップ5-7: チェックポイント

以下をすべて確認できたら、次の演習に進んでください：

- [ ] 新規バージョン `v2` が作成された
- [ ] v1からv2へドキュメントをコピーした
- [ ] v2版の内容を更新した
- [ ] ビルドが成功した
- [ ] ブラウザでバージョン切替が動作した
- [ ] v1を非推奨化した

---

## 演習6: トラブルシューティング

### 目的

- 意図的にエラーを発生させる
- エラーメッセージを読み解く
- トラブルシューティングガイドを活用して問題を解決する

### 推定時間

60分

---

### シナリオ6-1: レジストリスキーマエラー

#### 問題を発生させる

```bash
# レジストリファイルを手動で編集（バックアップ作成）
cp registry/training-docs.json registry/training-docs.json.backup

# レジストリを編集
vim registry/training-docs.json
```

**以下の変更を加える**（エラーを発生させる）:

```json
{
  "$schemaVersion": "0.0.1",
  "projects": [
    {
      "id": "training-docs",
      "title": "Training Documentation",  ← これを文字列形式に変更（エラー）
      ...
    }
  ]
}
```

**保存して閉じる**

#### エラーを確認

```bash
# バリデーション実行
docs-gen validate --verbose
```

**期待されるエラー**:

```
❌ Validation failed for project 'training-docs'
   - Field 'title' should be an object, but got string
```

#### 問題を解決

```bash
# 1. バックアップから復元
cp registry/training-docs.json.backup registry/training-docs.json

# 2. バリデーション確認
docs-gen validate
```

**期待される出力**:

```
✅ Validation successful
```

---

### シナリオ6-2: ビルドエラー

#### 問題を発生させる

```bash
# MDXファイルを編集（構文エラーを発生させる）
vim apps/training-docs/src/content/docs/v2/en/introduction.mdx
```

**以下の変更を加える**:

```mdx
---
title: Introduction (Version 2.0)
summary: Introduction to the training system - Version 2.0
description: Learn about...
# ↑ フロントマターを閉じる --- を削除

# Introduction (Version 2.0)

...
```

**保存して閉じる**

#### エラーを確認

```bash
# ビルド実行
cd apps/training-docs
pnpm build
```

**期待されるエラー**:

```
Error: Failed to parse frontmatter
  File: src/content/docs/v2/en/introduction.mdx
  Line: 5
```

#### 問題を解決

```bash
# MDXファイルを修正
vim apps/training-docs/src/content/docs/v2/en/introduction.mdx

# フロントマター終了の --- を追加
---
title: Introduction (Version 2.0)
summary: Introduction to the training system - Version 2.0
description: Learn about...
---  ← 追加

# 再ビルド
pnpm build
```

**期待される結果**:
- ✅ ビルドが成功する

---

### シナリオ6-3: Pagefindインデックス生成失敗

#### 問題を発生させる

```bash
# package.jsonからpostbuildスクリプトを削除
vim apps/training-docs/package.json
```

**以下の変更を加える**:

```json
{
  "scripts": {
    "build": "astro build",
    "postbuild": "pagefind --site dist --glob \"**/*.html\""  ← この行を削除
  }
}
```

**保存して閉じる**

#### エラーを確認

```bash
# ビルド実行
pnpm build

# Pagefindディレクトリが存在しないことを確認
ls -la dist/pagefind/
```

**期待されるエラー**:

```
ls: dist/pagefind/: No such file or directory
```

#### 問題を解決

```bash
# 1. postbuildスクリプトを復元
vim apps/training-docs/package.json

# 以下を追加
{
  "scripts": {
    "build": "astro build",
    "postbuild": "pagefind --site dist --glob \"**/*.html\""
  }
}

# 2. 再ビルド
pnpm build

# 3. Pagefindディレクトリ確認
ls -la dist/pagefind/
```

**期待される結果**:
- ✅ `dist/pagefind/` ディレクトリが作成される
- ✅ インデックスファイルが生成される

---

### シナリオ6-4: チェックポイント

以下をすべて確認できたら、総合演習に進んでください：

- [ ] レジストリスキーマエラーを発生させて解決した
- [ ] ビルドエラーを発生させて解決した
- [ ] Pagefindインデックス生成失敗を発生させて解決した
- [ ] エラーメッセージを正しく読み解けた
- [ ] トラブルシューティングの基本手順を理解した

---

## 総合演習

### 目的

- これまでの演習で学んだスキルを統合する
- 実際の運用シナリオをシミュレートする
- 完全なドキュメントプロジェクトを作成する

### 推定時間

90分

---

### シナリオ: 新製品のドキュメントサイト作成

あなたは新製品「SuperApp」のドキュメントサイトを作成することになりました。以下の要件を満たすドキュメントサイトを構築してください。

#### 要件

1. **プロジェクト作成**
   - プロジェクトID: `superapp-docs`
   - プロジェクト名（英語）: SuperApp Documentation
   - プロジェクト名（日本語）: SuperApp文書

2. **ドキュメント構成**
   - カテゴリー: guide, api, tutorial
   - ドキュメント:
     - `getting-started`（カテゴリー: guide）
     - `installation`（カテゴリー: guide）
     - `api-reference`（カテゴリー: api）
     - `first-app`（カテゴリー: tutorial）

3. **多言語対応**
   - 英語（en）
   - 日本語（ja）
   - スペイン語（es）

4. **バージョン管理**
   - v1.0（最新、公開中）
   - v0.9（非推奨）

5. **品質基準**
   - すべてのドキュメントが英語・日本語で公開済み
   - スペイン語版はレビュー中
   - ビルドが成功する
   - Lighthouseスコア: Performance 90以上、Accessibility 95以上

---

### ステップ1: プロジェクト作成

```bash
# 新規プロジェクトを作成
docs-gen add project \
  --id superapp-docs \
  --title-en "SuperApp Documentation" \
  --title-ja "SuperApp文書" \
  --description-en "Official documentation for SuperApp" \
  --description-ja "SuperApp公式ドキュメント"
```

---

### ステップ2: ドキュメント追加

```bash
# getting-startedを追加
docs-gen add doc \
  --project superapp-docs \
  --id getting-started \
  --title-en "Getting Started" \
  --title-ja "はじめに" \
  --category guide

# installationを追加
docs-gen add doc \
  --project superapp-docs \
  --id installation \
  --title-en "Installation" \
  --title-ja "インストール" \
  --category guide

# api-referenceを追加
docs-gen add doc \
  --project superapp-docs \
  --id api-reference \
  --title-en "API Reference" \
  --title-ja "APIリファレンス" \
  --category api

# first-appを追加
docs-gen add doc \
  --project superapp-docs \
  --id first-app \
  --title-en "Build Your First App" \
  --title-ja "初めてのアプリ開発" \
  --category tutorial
```

---

### ステップ3: コンテンツ作成

各ドキュメントのMDXファイルを編集してコンテンツを追加してください。

**ヒント**: 既存のdemo-docsやsample-docsを参考にしてください。

---

### ステップ4: スペイン語追加

```bash
# スペイン語を追加
docs-gen add language \
  --project superapp-docs \
  --lang es \
  --template-lang en

# スペイン語版を翻訳（機械翻訳を使用しても可）
# ...

# 翻訳ステータスをレビュー中に更新
docs-gen update doc --project superapp-docs --id getting-started --translation-status-es review
docs-gen update doc --project superapp-docs --id installation --translation-status-es review
docs-gen update doc --project superapp-docs --id api-reference --translation-status-es review
docs-gen update doc --project superapp-docs --id first-app --translation-status-es review
```

---

### ステップ5: v0.9バージョン追加

```bash
# v0.9を追加
docs-gen add version \
  --project superapp-docs \
  --id v0.9 \
  --name "Version 0.9" \
  --status deprecated \
  --is-latest false

# v0.9にコンテンツをコピー
# ...（v1.0からコピー）

# v1.0をv0.9に更新
docs-gen update version \
  --project superapp-docs \
  --id v1.0 \
  --name "Version 1.0" \
  --status active \
  --is-latest true
```

---

### ステップ6: ビルドと検証

```bash
# ビルド
cd apps/superapp-docs
pnpm install
pnpm build

# Lighthouseスコア測定
lighthouse http://localhost:4321/docs/superapp-docs/v1.0/en/getting-started/ \
  --output=html \
  --output=json \
  --output-path=./lighthouse-report
```

---

### ステップ7: 完了チェックリスト

以下をすべて確認できたら、総合演習完了です！

- [ ] プロジェクト `superapp-docs` が作成された
- [ ] 4つのドキュメントが追加された（getting-started, installation, api-reference, first-app）
- [ ] 英語・日本語版が公開済み（translationStatus: published）
- [ ] スペイン語版がレビュー中（translationStatus: review）
- [ ] v1.0（最新）とv0.9（非推奨）が作成された
- [ ] ビルドが成功した
- [ ] Lighthouseスコアが基準を満たした（Performance 90以上、Accessibility 95以上）
- [ ] プレビューサーバーでサイトが正しく表示された

---

## おめでとうございます！

すべての演習を完了しました。これで、新ドキュメントサイトジェネレーターの基本的な操作をマスターしました。

### 次のステップ

1. **実務での活用**: 実際のプロジェクトで学んだスキルを活用してください
2. **ドキュメント参照**: 詳細は各種ガイドを参照してください
3. **質問・サポート**: Slack #docs-supportで質問を投稿してください
4. **フィードバック**: トレーニングへのフィードバックをお寄せください

### 参考資料

- [CLI操作ガイド](./cli-operations.md)
- [コンテンツ管理ガイド](./content-management.md)
- [ビルド・デプロイ運用ガイド](./build-deploy-operations.md)
- [トラブルシューティングガイド](./troubleshooting.md)
- [FAQ](./faq.md)

---

## 更新履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|------|----------|---------|--------|
| 2025-10-25 | 1.0.0 | 初版作成 | Claude (Phase 4-2) |

---

**このハンズオン実習に関する質問・フィードバック**:
- Slack: #docs-support チャンネル
- トレーニング担当者: [name@example.com](mailto:name@example.com)
