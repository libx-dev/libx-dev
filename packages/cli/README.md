# @docs/cli

LibX Docs ドキュメントサイトジェネレーターのコマンドラインインターフェース（CLI）です。

## 概要

`docs-cli` は、新しいドキュメントサイトジェネレーターのメイン操作インターフェースとして、以下の機能を提供します:

- プロジェクト、バージョン、言語、ドキュメントの追加・管理
- レジストリバリデーション
- バックアップとロールバック
- 設定管理

## インストール

```bash
# モノレポルートから
pnpm install
```

## 使用方法

### 基本コマンド

```bash
# ヘルプ表示
docs-cli --help

# バージョン表示
docs-cli --version

# 設定初期化
docs-cli init
```

### プロジェクト管理

```bash
# 新規プロジェクト追加
docs-cli add project <project-id>

# バージョン追加
docs-cli add version <project-id> <version-id>

# 言語追加
docs-cli add language <project-id> <lang-code>

# ドキュメント追加
docs-cli add doc <project-id> <slug>
```

### バリデーション

```bash
# 基本バリデーション
docs-cli validate

# 厳格モード
docs-cli validate --strict

# 完全チェック
docs-cli validate --check-content --check-sync-hash
```

### 一覧表示

```bash
# プロジェクト一覧
docs-cli list projects

# ドキュメント一覧
docs-cli list docs <project-id>

# バージョン一覧
docs-cli list versions <project-id>

# 言語一覧
docs-cli list languages <project-id>
```

## グローバルオプション

すべてのコマンドで使用可能なオプション:

- `--config <path>` - 設定ファイルパス（デフォルト: `.docs-cli/config.json`）
- `--dry-run` - 変更をプレビューのみ（実行しない）
- `--verbose, -v` - 詳細ログ出力
- `--json` - JSON形式で出力
- `--yes, -y` - 対話をスキップ（CI用）

## 設定ファイル

`.docs-cli/config.json` で動作をカスタマイズできます:

```json
{
  "registryPath": "registry/docs.json",
  "projectRoot": "apps/",
  "contentRoot": "src/content/docs/",
  "nonInteractive": false,
  "defaultLang": "en",
  "backupRotation": 5
}
```

## 環境変数

- `DOCS_CLI_CONFIG` - 設定ファイルパス
- `DOCS_CLI_NON_INTERACTIVE` - 非対話モード（CI用）
- `DOCS_CLI_LOG_LEVEL` - ログレベル（debug, info, warn, error）

## 開発

### ディレクトリ構造

```
packages/cli/
├── bin/
│   └── docs-cli.js          # エントリポイント
├── src/
│   ├── index.js             # メインCLIロジック
│   ├── commands/            # コマンド実装
│   ├── utils/               # ユーティリティ
│   └── templates/           # テンプレートファイル
└── tests/                   # テスト
```

### 新しいコマンドの追加

1. `src/commands/` 配下にコマンドファイルを作成
2. `src/index.js` にコマンドを登録
3. テストを追加

## ライセンス

MIT
