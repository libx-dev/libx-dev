# CLI運用ガイド

このガイドは、docs-cliツールを使用した日常的な運用タスクの実践的な手順を説明します。

## 目次

- [はじめに](#はじめに)
- [環境セットアップ](#環境セットアップ)
- [プロジェクト管理](#プロジェクト管理)
- [バージョン管理](#バージョン管理)
- [言語管理](#言語管理)
- [ドキュメント管理](#ドキュメント管理)
- [バックアップ・ロールバック](#バックアップロールバック)
- [よくあるエラーと対処法](#よくあるエラーと対処法)
- [CI/CD統合](#cicd統合)

---

## はじめに

`docs-cli`は、新ドキュメントサイトジェネレーターの中核となるCLIツールです。以下のタスクを効率的に実行できます：

- ✅ プロジェクト、バージョン、言語、ドキュメントの追加・更新・削除
- ✅ レジストリバリデーション
- ✅ コンテンツ検索
- ✅ データエクスポート
- ✅ 自動バックアップ・ロールバック

### 前提条件

- **Node.js**: v18.0.0以上
- **pnpm**: v8.0.0以上
- **Git**: v2.30.0以上（バージョン管理）

### 用語

- **レジストリ**: プロジェクト、バージョン、言語、ドキュメントのメタデータを管理するJSONファイル
- **dry-run**: 実際には変更を実行せず、プレビューのみを行うモード
- **バックアップ**: 変更前のレジストリ状態を自動保存する機能

---

## 環境セットアップ

### 初回セットアップ

#### 1. リポジトリのクローン

```bash
# リポジトリをクローン
git clone https://github.com/<user>/libx-dev.git
cd libx-dev

# 依存関係インストール
pnpm install
```

#### 2. 設定ファイル初期化

```bash
# 設定ファイルを対話式に作成
pnpm docs-cli init
```

**対話プロンプト例**:
```
? レジストリファイルのパス: registry/docs.json
? プロジェクトルートディレクトリ: apps/
? コンテンツルートディレクトリ: src/content/docs/
? デフォルト言語: en
? バックアップ保持数: 5
? バックアップディレクトリ: .backups
```

**生成される設定ファイル** (`.docs-cli/config.json`):
```json
{
  "registryPath": "registry/docs.json",
  "projectRoot": "apps/",
  "contentRoot": "src/content/docs/",
  "nonInteractive": false,
  "defaultLang": "en",
  "backupRotation": 5,
  "backupDir": ".backups"
}
```

#### 3. 動作確認

```bash
# バージョン確認
pnpm docs-cli --version

# ヘルプ表示
pnpm docs-cli --help

# プロジェクト一覧表示
pnpm docs-cli list projects
```

---

## プロジェクト管理

### ワークフロー1: 新規プロジェクトの追加

#### ステップ1: プロジェクト情報を準備

**必要な情報**:
- プロジェクトID: `my-docs` （小文字英数字とハイフン）
- 英語表示名: `My Documentation`
- 日本語表示名: `私のドキュメント`
- 英語説明文: `Comprehensive documentation for my project`
- 日本語説明文: `プロジェクトの包括的なドキュメント`
- サポート言語: `en,ja`

#### ステップ2: dry-runで確認

```bash
# dry-runモードで実行内容を確認
pnpm docs-cli add project my-docs --dry-run
```

**出力例**:
```
[DRY RUN] 以下の変更が実行されます：

プロジェクト追加:
  ID: my-docs
  表示名 (en): My Documentation
  表示名 (ja): 私のドキュメント

作成されるディレクトリ:
  apps/my-docs/
  apps/my-docs/src/content/docs/v1/en/
  apps/my-docs/src/content/docs/v1/ja/

レジストリ変更:
  + projects[0]: { id: 'my-docs', ... }
```

#### ステップ3: 実際に追加

##### 対話式（推奨）:

```bash
# 対話式でプロジェクト追加
pnpm docs-cli add project my-docs
```

**対話プロンプト例**:
```
? 英語表示名: My Documentation
? 日本語表示名: 私のドキュメント
? 英語説明文: Comprehensive documentation for my project
? 日本語説明文: プロジェクトの包括的なドキュメント
? サポート言語 (カンマ区切り): en,ja
? テンプレートプロジェクト: project-template
✔ プロジェクト 'my-docs' を追加しました
```

##### 非対話式（CI/CD用）:

```bash
# 全オプション指定で追加
pnpm docs-cli add project my-docs \
  --display-name-en "My Documentation" \
  --display-name-ja "私のドキュメント" \
  --description-en "Comprehensive documentation for my project" \
  --description-ja "プロジェクトの包括的なドキュメント" \
  --languages "en,ja" \
  --yes
```

#### ステップ4: 確認

```bash
# プロジェクト一覧で確認
pnpm docs-cli list projects

# レジストリバリデーション
pnpm docs-cli validate

# ディレクトリ構造確認
ls -la apps/my-docs/src/content/docs/
```

**期待される出力**:
```
apps/my-docs/src/content/docs/
└── v1/
    ├── en/
    │   └── index.mdx
    └── ja/
        └── index.mdx
```

---

### ワークフロー2: プロジェクト情報の更新

#### ユースケース: 表示名の変更

```bash
# dry-runで確認
pnpm docs-cli update project my-docs \
  --display-name-en "My New Documentation" \
  --dry-run

# 実際に更新
pnpm docs-cli update project my-docs \
  --display-name-en "My New Documentation"
```

#### ユースケース: プロジェクトのアーカイブ

```bash
# ステータスをarchivedに変更
pnpm docs-cli update project old-docs --status archived
```

#### ユースケース: 説明文の更新

```bash
# 日本語説明文を更新
pnpm docs-cli update project my-docs \
  --description-ja "プロジェクトの詳細なドキュメント"
```

---

### ワークフロー3: プロジェクトの削除

#### ステップ1: プロジェクト情報を確認

```bash
# プロジェクト詳細を確認
pnpm docs-cli list projects
```

#### ステップ2: dry-runで確認

```bash
# dry-runで削除内容を確認
pnpm docs-cli remove project old-docs --dry-run --yes
```

**出力例**:
```
[DRY RUN] 以下のプロジェクトを削除します：

プロジェクト: old-docs
  表示名: Old Documentation
  ドキュメント数: 15
  バージョン数: 2
  言語数: 2

注意: コンテンツファイル (apps/old-docs/) は保持されます
```

#### ステップ3: 削除実行

```bash
# 確認プロンプト付きで削除
pnpm docs-cli remove project old-docs

# 確認なしで削除（注意）
pnpm docs-cli remove project old-docs --force
```

**対話プロンプト例**:
```
プロジェクト 'old-docs' を削除しますか？
  ドキュメント数: 15
  バージョン数: 2
  言語数: 2

注意: コンテンツファイル (apps/old-docs/) は保持されます

? 削除を実行しますか？ (y/N)
```

#### ステップ4: コンテンツディレクトリの削除（任意）

```bash
# レジストリから削除後、手動でコンテンツを削除
rm -rf apps/old-docs/

# または Git で管理している場合
git rm -r apps/old-docs/
git commit -m "Remove old-docs project"
```

---

## バージョン管理

### ワークフロー4: 新規バージョンの追加

#### シナリオ: v2を追加（v1からコンテンツをコピー）

##### ステップ1: 現在のバージョンを確認

```bash
# バージョン一覧表示
pnpm docs-cli list versions my-docs
```

**出力例**:
```
プロジェクト: my-docs

バージョン:
  - v1 (Version 1.0) [latest] [active]
```

##### ステップ2: dry-runで確認

```bash
# v2を追加（v1からコピー）
pnpm docs-cli add version my-docs v2 --dry-run
```

**出力例**:
```
[DRY RUN] 以下の変更が実行されます：

バージョン追加:
  ID: v2
  名前: Version 2.0
  コピー元: v1
  最新バージョンとして設定: yes

作成されるディレクトリ:
  apps/my-docs/src/content/docs/v2/en/
  apps/my-docs/src/content/docs/v2/ja/

コピーされるファイル:
  apps/my-docs/src/content/docs/v1/en/ → v2/en/ (5 files)
  apps/my-docs/src/content/docs/v1/ja/ → v2/ja/ (5 files)

レジストリ変更:
  + projects[0].versions[1]: { id: 'v2', ... }
  ~ projects[0].versions[0].isLatest: true → false
```

##### ステップ3: 実際に追加

```bash
# 対話式で追加
pnpm docs-cli add version my-docs v2

# 非対話式で追加
pnpm docs-cli add version my-docs v2 \
  --name "Version 2.0" \
  --yes
```

**対話プロンプト例**:
```
? バージョン表示名: Version 2.0
? v1からコンテンツをコピーしますか？ Yes
? 最新バージョンとして設定しますか？ Yes
✔ バージョン 'v2' を追加しました
```

##### ステップ4: 確認

```bash
# バージョン一覧で確認
pnpm docs-cli list versions my-docs

# ディレクトリ構造確認
ls -la apps/my-docs/src/content/docs/v2/
```

---

#### シナリオ: Beta版の追加（最新版として設定しない）

```bash
# Beta版を追加（最新版として設定しない）
pnpm docs-cli add version my-docs v3-beta \
  --name "Version 3.0 Beta" \
  --no-set-latest \
  --yes
```

---

#### シナリオ: 空のバージョン追加（コンテンツコピーなし）

```bash
# 前バージョンからコピーせずに追加
pnpm docs-cli add version my-docs v3 --no-copy --yes
```

---

### ワークフロー5: バージョン情報の更新

#### ユースケース: バージョン名の変更

```bash
# バージョン名を更新
pnpm docs-cli update version my-docs v2 --name "Version 2.1"
```

#### ユースケース: 最新バージョンの変更

```bash
# v3を最新バージョンに設定（v2は自動的に解除される）
pnpm docs-cli update version my-docs v3 --set-latest
```

#### ユースケース: 旧バージョンを非推奨に設定

```bash
# v1を非推奨に設定
pnpm docs-cli update version my-docs v1 --status deprecated
```

---

## 言語管理

### ワークフロー6: 新規言語の追加

#### シナリオ: 中国語（簡体字）を追加

##### ステップ1: サポート言語を確認

**サポートされている言語**:
- `en` - English
- `ja` - 日本語
- `zh-Hans` - 简体中文
- `zh-Hant` - 繁體中文
- `es` - Español
- `pt-BR` - Português (Brasil)
- `ko` - 한국어
- `de` - Deutsch
- `fr` - Français
- `ru` - Русский
- `ar` - العربية
- `id` - Bahasa Indonesia
- `tr` - Türkçe
- `hi` - हिन्दी
- `vi` - Tiếng Việt

##### ステップ2: dry-runで確認

```bash
# dry-runで確認
pnpm docs-cli add language my-docs zh-Hans --dry-run
```

**出力例**:
```
[DRY RUN] 以下の変更が実行されます：

言語追加:
  コード: zh-Hans
  表示名: 简体中文
  テンプレート言語: en

作成されるディレクトリ:
  apps/my-docs/src/content/docs/v1/zh-Hans/
  apps/my-docs/src/content/docs/v2/zh-Hans/

コピーされるファイル:
  apps/my-docs/src/content/docs/v1/en/ → v1/zh-Hans/ (5 files)
  apps/my-docs/src/content/docs/v2/en/ → v2/zh-Hans/ (5 files)

翻訳マーカー:
  <!-- TODO: zh-Hans - この文書は翻訳が必要です -->

レジストリ変更:
  + projects[0].languages[2]: { code: 'zh-Hans', ... }
```

##### ステップ3: 実際に追加

```bash
# 対話式で追加
pnpm docs-cli add language my-docs zh-Hans

# 非対話式で追加
pnpm docs-cli add language my-docs zh-Hans \
  --display-name "简体中文" \
  --template-lang en \
  --auto-template
```

**対話プロンプト例**:
```
? 言語表示名: 简体中文
? テンプレート言語を選択してください: en
? テンプレートファイルを自動生成しますか？ Yes
✔ 言語 'zh-Hans' を追加しました
```

##### ステップ4: 確認

```bash
# 言語一覧で確認
pnpm docs-cli list languages my-docs

# ディレクトリ構造確認
ls -la apps/my-docs/src/content/docs/v1/
```

**期待される出力**:
```
apps/my-docs/src/content/docs/v1/
├── en/
├── ja/
└── zh-Hans/   # 新規追加
```

---

### ワークフロー7: 言語情報の更新

#### ユースケース: デフォルト言語の変更

```bash
# 日本語をデフォルト言語に設定
pnpm docs-cli update language my-docs ja --set-default
```

#### ユースケース: フォールバック言語の設定

```bash
# 韓国語のフォールバック言語を日本語に設定
pnpm docs-cli update language my-docs ko --fallback ja
```

---

## ドキュメント管理

### ワークフロー8: 新規ドキュメントの追加

#### シナリオ: インストールガイドを追加

##### ステップ1: スラッグを決定

**スラッグ命名規則**:
- 小文字英数字、ハイフン、スラッシュのみ使用
- ネストしたパスはスラッシュで区切る（例: `guide/installation`）

**例**:
- `getting-started` - シンプルなスラッグ
- `guide/installation` - ネストしたパス
- `api/authentication` - API関連ドキュメント

##### ステップ2: dry-runで確認

```bash
# dry-runで確認
pnpm docs-cli add doc my-docs guide/installation --dry-run
```

**出力例**:
```
[DRY RUN] 以下の変更が実行されます：

ドキュメント追加:
  ID: my-docs-002 (自動生成)
  スラッグ: guide/installation
  タイトル (en): Installation
  タイトル (ja): インストール

作成されるファイル:
  apps/my-docs/src/content/docs/v1/en/guide/installation.mdx
  apps/my-docs/src/content/docs/v1/ja/guide/installation.mdx
  apps/my-docs/src/content/docs/v2/en/guide/installation.mdx
  apps/my-docs/src/content/docs/v2/ja/guide/installation.mdx

レジストリ変更:
  + projects[0].versions[0].documents[1]: { id: 'my-docs-002', ... }
```

##### ステップ3: 実際に追加

```bash
# 対話式で追加
pnpm docs-cli add doc my-docs guide/installation

# 非対話式で追加
pnpm docs-cli add doc my-docs guide/installation \
  --title-en "Installation Guide" \
  --title-ja "インストールガイド" \
  --summary "How to install the library" \
  --category guide \
  --keywords "install,setup,quickstart" \
  --tags "beginner,tutorial" \
  --yes
```

**対話プロンプト例**:
```
? 英語タイトル: Installation Guide
? 日本語タイトル: インストールガイド
? 概要: How to install the library
? カテゴリID: guide
? キーワード (カンマ区切り): install,setup,quickstart
? タグ (カンマ区切り): beginner,tutorial
✔ ドキュメント 'guide/installation' を追加しました (ID: my-docs-002)
```

##### ステップ4: 確認

```bash
# ドキュメント一覧で確認
pnpm docs-cli list docs my-docs

# ファイル存在確認
cat apps/my-docs/src/content/docs/v1/en/guide/installation.mdx
```

**生成されるMDXファイル例**:
```mdx
---
title: Installation Guide
summary: How to install the library
docId: my-docs-002
slug: guide/installation
keywords: [install, setup, quickstart]
tags: [beginner, tutorial]
---

# Installation Guide

[TODO: ドキュメントの内容をここに記述してください]
```

---

### ワークフロー9: ドキュメント情報の更新

#### ユースケース: タイトルの変更

```bash
# タイトルを更新
pnpm docs-cli update doc my-docs guide/installation \
  --title-en "Installation & Setup Guide" \
  --title-ja "インストール＆セットアップガイド"
```

#### ユースケース: ステータスの変更

```bash
# ドラフトから公開に変更
pnpm docs-cli update doc my-docs guide/installation --status published
```

#### ユースケース: キーワード・タグの更新

```bash
# キーワードとタグを更新
pnpm docs-cli update doc my-docs guide/installation \
  --keywords "install,setup,quickstart,npm,pnpm" \
  --tags "beginner,tutorial,getting-started"
```

---

### ワークフロー10: ドキュメントの削除

#### ステップ1: ドキュメント情報を確認

```bash
# ドキュメント一覧で確認
pnpm docs-cli list docs my-docs
```

#### ステップ2: dry-runで確認

```bash
# dry-runで削除内容を確認
pnpm docs-cli remove doc my-docs guide/old-feature --dry-run --yes
```

**出力例**:
```
[DRY RUN] 以下のドキュメントを削除します：

ドキュメント: guide/old-feature (my-docs-005)
  タイトル: Old Feature
  影響を受けるファイル: 4

注意: コンテンツファイルは保持されます
```

#### ステップ3: 削除実行

```bash
# 確認プロンプト付きで削除（レジストリのみ）
pnpm docs-cli remove doc my-docs guide/old-feature

# コンテンツファイルも削除
pnpm docs-cli remove doc my-docs guide/old-feature --delete-content

# 確認なしで削除（注意）
pnpm docs-cli remove doc my-docs guide/old-feature --force --delete-content
```

**対話プロンプト例**:
```
ドキュメント 'guide/old-feature' を削除しますか？
  ID: my-docs-005
  影響を受けるファイル: 4

注意: コンテンツファイルは保持されます
（--delete-contentオプションでコンテンツも削除）

? 削除を実行しますか？ (y/N)
```

---

## バックアップ・ロールバック

### 自動バックアップ

すべての変更操作（add, update, remove）は、実行前に自動的にバックアップが作成されます。

#### バックアップの保存場所

```bash
# バックアップディレクトリ構造
.backups/
├── 2025-10-25T10-30-00-000Z/
│   └── registry/
│       └── docs.json
├── 2025-10-25T11-15-00-000Z/
│   └── registry/
│       └── docs.json
└── 2025-10-25T12-00-00-000Z/
    └── registry/
        └── docs.json
```

#### バックアップの確認

```bash
# バックアップ一覧
ls -la .backups/

# 特定のバックアップを確認
cat .backups/2025-10-25T10-30-00-000Z/registry/docs.json
```

---

### 手動ロールバック

#### ステップ1: バックアップタイムスタンプを確認

```bash
# バックアップ一覧を表示
ls -t .backups/
```

**出力例**:
```
2025-10-25T12-00-00-000Z/
2025-10-25T11-15-00-000Z/
2025-10-25T10-30-00-000Z/
```

#### ステップ2: 復元するバックアップを選択

```bash
# 特定のバックアップを確認
cat .backups/2025-10-25T11-15-00-000Z/registry/docs.json | jq .
```

#### ステップ3: ロールバック実行

```bash
# バックアップから復元
cp .backups/2025-10-25T11-15-00-000Z/registry/docs.json registry/docs.json

# レジストリバリデーション
pnpm docs-cli validate
```

---

### 自動ロールバック

コマンド実行中にエラーが発生した場合、自動的にロールバックが実行されます。

**例**:
```bash
# エラーが発生した場合の出力
pnpm docs-cli add doc my-docs invalid-doc

❌ エラーが発生しました
⚠️ 変更をロールバックしています...
✔ ロールバック完了
```

---

## よくあるエラーと対処法

### エラー1: レジストリファイルが見つかりません

**エラーメッセージ**:
```
❌ エラー: レジストリファイルが見つかりません: registry/docs.json
```

**原因**:
- 設定ファイルのパスが間違っている
- レジストリファイルが存在しない

**対処法**:
```bash
# 設定ファイルを確認
cat .docs-cli/config.json

# レジストリファイルの存在確認
ls -la registry/

# 設定ファイルを再初期化
pnpm docs-cli init
```

---

### エラー2: バリデーションエラー

**エラーメッセージ**:
```
❌ バリデーションエラー:
  - プロジェクト 'my-docs' のバージョン 'v1' に必須フィールド 'name' がありません
```

**原因**:
- レジストリスキーマが古い
- 必須フィールドが不足

**対処法**:
```bash
# 詳細ログでエラー箇所を確認
pnpm docs-cli validate --verbose

# JSON形式で詳細を出力
pnpm docs-cli validate --report json > validation-errors.json

# エラー箇所を修正後、再度バリデーション
pnpm docs-cli validate
```

---

### エラー3: プロジェクトが見つかりません

**エラーメッセージ**:
```
❌ エラー: プロジェクト 'my-docs' が見つかりません
```

**原因**:
- プロジェクトIDが間違っている
- プロジェクトが削除されている

**対処法**:
```bash
# プロジェクト一覧で確認
pnpm docs-cli list projects

# 正しいプロジェクトIDで再実行
pnpm docs-cli add version correct-project-id v2
```

---

### エラー4: バージョンIDが無効です

**エラーメッセージ**:
```
❌ エラー: バージョンID 'version-2' は無効です。有効な形式: v1, v2.0, v1.2.3
```

**原因**:
- バージョンIDの形式が正しくない

**対処法**:
```bash
# 有効な形式でバージョンIDを指定
pnpm docs-cli add version my-docs v2
pnpm docs-cli add version my-docs v2.0
pnpm docs-cli add version my-docs v2.1.3
```

---

### エラー5: 言語コードが無効です

**エラーメッセージ**:
```
❌ エラー: 言語コード 'chinese' はサポートされていません
```

**原因**:
- サポートされていない言語コードを指定

**対処法**:
```bash
# サポートされている言語コードを確認
# zh-Hans (简体中文)
# zh-Hant (繁體中文)

# 正しい言語コードで再実行
pnpm docs-cli add language my-docs zh-Hans
```

---

### エラー6: スラッグが無効です

**エラーメッセージ**:
```
❌ エラー: スラッグ 'Guide/Installation' は無効です。小文字英数字、ハイフン、スラッシュのみ使用できます
```

**原因**:
- スラッグに大文字が含まれている
- 使用できない文字が含まれている

**対処法**:
```bash
# 小文字英数字、ハイフン、スラッシュのみを使用
pnpm docs-cli add doc my-docs guide/installation  # ✅ 正しい
pnpm docs-cli add doc my-docs guide-installation  # ✅ 正しい

# 大文字は使用不可
pnpm docs-cli add doc my-docs Guide/Installation  # ❌ 間違い
```

---

### エラー7: デフォルト言語を削除できません

**エラーメッセージ**:
```
❌ エラー: デフォルト言語 'en' を削除できません。まず別の言語をデフォルトに設定してください
```

**原因**:
- デフォルト言語を削除しようとしている

**対処法**:
```bash
# 先に別の言語をデフォルトに設定
pnpm docs-cli update language my-docs ja --set-default

# その後、元のデフォルト言語を削除
pnpm docs-cli remove language my-docs en
```

---

### エラー8: 最後の言語を削除できません

**エラーメッセージ**:
```
❌ エラー: 最後の1言語を削除することはできません
```

**原因**:
- プロジェクトには少なくとも1つの言語が必要

**対処法**:
- 言語を削除する代わりに、ステータスを`inactive`に設定
```bash
pnpm docs-cli update language my-docs en --status inactive
```

---

## CI/CD統合

### GitHub Actions統合

#### 例1: 新規プロジェクト自動追加

```yaml
name: Add New Project

on:
  workflow_dispatch:
    inputs:
      project_id:
        description: 'プロジェクトID'
        required: true
      display_name_en:
        description: '英語表示名'
        required: true
      display_name_ja:
        description: '日本語表示名'
        required: true

jobs:
  add-project:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Add project
        run: |
          pnpm docs-cli add project ${{ github.event.inputs.project_id }} \
            --display-name-en "${{ github.event.inputs.display_name_en }}" \
            --display-name-ja "${{ github.event.inputs.display_name_ja }}" \
            --yes
        env:
          DOCS_CLI_NON_INTERACTIVE: true

      - name: Validate registry
        run: pnpm docs-cli validate --strict

      - name: Commit changes
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add .
          git commit -m "Add project: ${{ github.event.inputs.project_id }}"
          git push
```

---

#### 例2: バージョン自動追加

```yaml
name: Add Version

on:
  workflow_dispatch:
    inputs:
      project_id:
        description: 'プロジェクトID'
        required: true
      version_id:
        description: 'バージョンID (例: v2)'
        required: true
      version_name:
        description: 'バージョン表示名 (例: Version 2.0)'
        required: true

jobs:
  add-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Add version
        run: |
          pnpm docs-cli add version ${{ github.event.inputs.project_id }} \
            ${{ github.event.inputs.version_id }} \
            --name "${{ github.event.inputs.version_name }}" \
            --yes
        env:
          DOCS_CLI_NON_INTERACTIVE: true

      - name: Validate registry
        run: pnpm docs-cli validate --strict

      - name: Commit changes
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add .
          git commit -m "Add version: ${{ github.event.inputs.version_id }} to ${{ github.event.inputs.project_id }}"
          git push
```

---

#### 例3: レジストリ自動バリデーション

```yaml
name: Validate Registry

on:
  pull_request:
    paths:
      - 'registry/**'
  push:
    branches:
      - main
    paths:
      - 'registry/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Validate registry (strict mode)
        run: pnpm docs-cli validate --strict --check-content

      - name: Export validation report
        if: failure()
        run: |
          pnpm docs-cli validate --report json > validation-report.json

      - name: Upload validation report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: validation-report
          path: validation-report.json
```

---

## まとめ

本ガイドでは、docs-cliツールを使用した以下の運用タスクを説明しました：

- ✅ 環境セットアップと初期化
- ✅ プロジェクトの追加・更新・削除
- ✅ バージョン管理（新規バージョン追加、バージョン情報更新）
- ✅ 言語管理（新規言語追加、デフォルト言語設定）
- ✅ ドキュメント管理（新規ドキュメント追加、メタデータ更新、削除）
- ✅ バックアップ・ロールバック
- ✅ よくあるエラーと対処法
- ✅ CI/CD統合

**推奨事項**:
- すべての操作でdry-runモードを使用して変更内容を事前確認
- レジストリバリデーションを定期的に実行
- バックアップが自動作成されることを確認
- CI/CDで自動バリデーションを設定

**関連ドキュメント**:
- [docs-cliユーザーガイド](./docs-cli.md) - コマンドリファレンス
- [ビルド・デプロイ運用ガイド](./build-deploy-operations.md) - ビルド・デプロイ手順
- [コンテンツ管理ガイド](./content-management.md) - コンテンツ作成手順
- [FAQ](./faq.md) - よくある質問
- [トラブルシューティングガイド](./troubleshooting.md) - 詳細なトラブルシューティング

---

**作成日**: 2025-10-25
**最終更新**: 2025-10-25
**バージョン**: 1.0.0
