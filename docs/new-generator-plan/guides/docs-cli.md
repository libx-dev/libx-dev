# docs-cli ユーザーガイド

`docs-cli` は、新しいドキュメントサイトジェネレーターのメインCLIツールです。プロジェクト、バージョン、言語、ドキュメントの管理を統一されたインターフェースで行えます。

## インストール

```bash
# モノレポルートから
pnpm install
```

## 基本的な使い方

### ヘルプとバージョン確認

```bash
# バージョン表示
pnpm docs-cli --version

# ヘルプ表示
pnpm docs-cli --help

# 特定コマンドのヘルプ
pnpm docs-cli <command> --help
```

### グローバルオプション

すべてのコマンドで使用可能なオプション:

- `--config <path>` - 設定ファイルパス（デフォルト: `.docs-cli/config.json`）
- `--dry-run` - 変更をプレビューのみ（実行しない）
- `--verbose, -v` - 詳細ログ出力
- `--json` - JSON形式で出力
- `--yes, -y` - 対話をスキップ（CI用）

## コマンドリファレンス

### init - 設定ファイル初期化

設定ファイル（`.docs-cli/config.json`）を対話式に作成します。

```bash
pnpm docs-cli init
```

**生成される設定ファイル例**:
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

### add project - 新規プロジェクト追加

レジストリに新規プロジェクトを追加します。

```bash
pnpm docs-cli add project <project-id> [options]
```

**オプション**:
- `--display-name-en <name>` - 英語表示名
- `--display-name-ja <name>` - 日本語表示名
- `--description-en <text>` - 英語説明文
- `--description-ja <text>` - 日本語説明文
- `--languages <codes>` - サポート言語（カンマ区切り、デフォルト: `en,ja`）
- `--template <name>` - テンプレートプロジェクト（デフォルト: `project-template`）

**例**:
```bash
# 対話式でプロジェクト追加
pnpm docs-cli add project my-docs

# 非対話式（CI用）
pnpm docs-cli add project my-docs \
  --display-name-en "My Documentation" \
  --display-name-ja "私のドキュメント" \
  --languages "en,ja,zh-Hans" \
  --yes
```

**dry-runモードで確認**:
```bash
pnpm docs-cli add project my-docs --dry-run
```

### add version - バージョン追加

既存プロジェクトに新しいバージョンを追加します（実装中）。

```bash
pnpm docs-cli add version <project-id> <version-id> [options]
```

**オプション**:
- `--name <name>` - バージョン表示名
- `--copy-from <version>` - コピー元バージョン
- `--status <status>` - ステータス（`active`, `deprecated`, `draft`）
- `--date <date>` - リリース日（ISO 8601形式）

**例**:
```bash
# v2を作成（v1からコピー）
pnpm docs-cli add version my-docs v2 \
  --name "Version 2.0" \
  --copy-from v1 \
  --status active
```

### add language - 言語追加

既存プロジェクトに新しい言語を追加します（実装中）。

```bash
pnpm docs-cli add language <project-id> <lang-code> [options]
```

**オプション**:
- `--display-name <name>` - 言語表示名
- `--template-lang <code>` - テンプレート言語（デフォルト: `en`）
- `--auto-template` - 対話なしでテンプレート生成

**例**:
```bash
# 中国語（簡体字）を追加
pnpm docs-cli add language my-docs zh-Hans \
  --display-name "简体中文" \
  --template-lang en

# 自動テンプレート生成
pnpm docs-cli add language my-docs ko --auto-template
```

### add doc - ドキュメント追加

新しいドキュメントを追加します（実装中）。

```bash
pnpm docs-cli add doc <project-id> <slug> [options]
```

**オプション**:
- `--version <version>` - 対象バージョン（デフォルト: `latest`）
- `--title-en <title>` - 英語タイトル
- `--title-ja <title>` - 日本語タイトル
- `--category <category>` - カテゴリID
- `--order <number>` - 表示順序

**例**:
```bash
# 新しいドキュメント追加
pnpm docs-cli add doc my-docs getting-started \
  --title-en "Getting Started" \
  --title-ja "はじめに" \
  --category guide \
  --version v1
```

### validate - レジストリバリデーション

レジストリファイル（`registry/docs.json`）の整合性を検証します。

```bash
pnpm docs-cli validate [registry-path] [options]
```

**オプション**:
- `--strict` - 厳格モード（警告もエラー扱い）
- `--check-content` - コンテンツファイルの存在チェック
- `--check-sync-hash` - syncHashの整合性チェック
- `--report <format>` - レポート形式（`text`, `json`）

**例**:
```bash
# 基本バリデーション
pnpm docs-cli validate

# 厳格モード
pnpm docs-cli validate --strict

# 完全チェック
pnpm docs-cli validate --check-content --check-sync-hash

# JSON形式で出力
pnpm docs-cli validate --report json
```

### list - 一覧表示

プロジェクト、ドキュメント、バージョン、言語の一覧を表示します。

#### プロジェクト一覧

```bash
pnpm docs-cli list projects [options]
```

**オプション**:
- `--status <status>` - ステータスでフィルタ

**例**:
```bash
pnpm docs-cli list projects
pnpm docs-cli list projects --status active
```

#### ドキュメント一覧

```bash
pnpm docs-cli list docs <project-id> [options]
```

**オプション**:
- `--version <version>` - バージョンでフィルタ
- `--lang <lang>` - 言語でフィルタ
- `--status <status>` - ステータスでフィルタ

**例**:
```bash
pnpm docs-cli list docs my-docs
pnpm docs-cli list docs my-docs --version v1 --lang ja
```

#### バージョン一覧

```bash
pnpm docs-cli list versions <project-id> [options]
```

**オプション**:
- `--status <status>` - ステータスでフィルタ

**例**:
```bash
pnpm docs-cli list versions my-docs
pnpm docs-cli list versions my-docs --status active
```

#### 言語一覧

```bash
pnpm docs-cli list languages <project-id> [options]
```

**オプション**:
- `--status <status>` - ステータスでフィルタ

**例**:
```bash
pnpm docs-cli list languages my-docs
pnpm docs-cli list languages my-docs --status active
```

## 設定ファイル

`.docs-cli/config.json` で動作をカスタマイズできます。

### 設定項目

| フィールド | 説明 | デフォルト値 |
|-----------|------|-------------|
| `registryPath` | レジストリファイルパス | `registry/docs.json` |
| `projectRoot` | プロジェクトルートディレクトリ | `apps/` |
| `contentRoot` | コンテンツルートディレクトリ | `src/content/docs/` |
| `nonInteractive` | 非対話モード | `false` |
| `defaultLang` | デフォルト言語 | `en` |
| `backupRotation` | バックアップ保持数 | `5` |
| `backupDir` | バックアップディレクトリ | `.backups` |

### 環境変数

設定ファイルの代わりに環境変数で設定を上書きできます。

- `DOCS_CLI_CONFIG` - 設定ファイルパス
- `DOCS_CLI_NON_INTERACTIVE` - 非対話モード（`true`/`false`）
- `DOCS_CLI_LOG_LEVEL` - ログレベル（`debug`, `info`, `warn`, `error`）
- `DOCS_CLI_REGISTRY_PATH` - レジストリパス

**例**:
```bash
DOCS_CLI_NON_INTERACTIVE=true pnpm docs-cli add project my-docs --yes
```

## バックアップとロールバック

すべての変更操作は自動的にバックアップされます。

### バックアップの保存場所

バックアップは `.backups/<timestamp>/` に保存されます:

```
.backups/
└── 2025-10-16T14-30-00-000Z/
    └── registry/
        └── docs.json
```

### 自動ロールバック

コマンド実行中にエラーが発生した場合、自動的にロールバックが実行されます。

### バックアップのクリーンアップ

古いバックアップは自動的にローテーションされます（デフォルト: 5世代保持）。

## CI/CD統合

非対話モードを使用してCI/CDパイプラインに統合できます。

**GitHub Actions例**:
```yaml
- name: Add new project
  run: |
    pnpm docs-cli add project new-docs \
      --display-name-en "New Documentation" \
      --display-name-ja "新しいドキュメント" \
      --yes
  env:
    DOCS_CLI_NON_INTERACTIVE: true

- name: Validate registry
  run: pnpm docs-cli validate --strict
```

## トラブルシューティング

### エラー: レジストリファイルが見つかりません

```bash
# レジストリパスを明示的に指定
pnpm docs-cli --config .docs-cli/config.json validate
```

### エラー: バリデーション失敗

```bash
# 詳細ログで原因を確認
pnpm docs-cli validate --verbose

# JSON形式で詳細を出力
pnpm docs-cli validate --report json
```

### バックアップから復元

手動でバックアップから復元する場合:

```bash
cp -r .backups/<timestamp>/registry/docs.json registry/docs.json
```

## 今後の実装予定

Phase 1-3では基盤を構築しました。以下の機能はPhase 1-4以降で実装予定です:

- [ ] `add version` の完全実装
- [ ] `add language` の完全実装（既存スクリプトからの移植）
- [ ] `add doc` の完全実装
- [ ] `update` コマンド群
- [ ] `remove` コマンド群
- [ ] `migrate` コマンド（Phase 3連携）
- [ ] `search` コマンド
- [ ] `export` コマンド

## 参考リンク

- [Phase 1-3 計画書](../phase-1-3-cli-core.md)
- [DECISIONS.md](../DECISIONS.md)
- [packages/cli/README.md](../../../packages/cli/README.md)
