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

既存プロジェクトに新しいバージョンを追加します。✅ **完全実装済み**

```bash
pnpm docs-cli add version <project-id> <version-id> [options]
```

**オプション**:
- `--name <name>` - バージョン表示名
- `--copy-from <version>` - コピー元バージョンを指定
- `--no-copy` - 前バージョンからコンテンツをコピーしない
- `--set-latest` - 最新バージョンとして設定（デフォルト: true）
- `--no-set-latest` - 最新バージョンとして設定しない

**主要機能**:
- ✅ バージョンID検証（v1, v2.0形式）
- ✅ 前バージョンからのコンテンツ自動コピー
- ✅ 最新バージョンフラグの自動更新
- ✅ 全言語対応のディレクトリ構造自動作成
- ✅ バックアップとロールバック機能

**例**:
```bash
# 対話式でv2を作成（v1からコピー）
pnpm docs-cli add version my-docs v2

# 非対話式（CI用）
pnpm docs-cli add version my-docs v2 \
  --name "Version 2.0" \
  --yes

# 前バージョンからコピーせずに作成
pnpm docs-cli add version my-docs v3 --no-copy

# 最新版として設定しない
pnpm docs-cli add version my-docs v2-beta --no-set-latest

# dry-runモードで確認
pnpm docs-cli add version my-docs v2 --dry-run
```

### add language - 言語追加

既存プロジェクトに新しい言語を追加します。✅ **完全実装済み**

```bash
pnpm docs-cli add language <project-id> <lang-code> [options]
```

**オプション**:
- `--display-name <name>` - 言語表示名
- `--template-lang <code>` - テンプレート言語（デフォルト: `en`）
- `--auto-template` - 対話なしでテンプレート生成

**サポート言語**: en, ja, zh-Hans, zh-Hant, es, pt-BR, ko, de, fr, ru, ar, id, tr, hi, vi

**主要機能**:
- ✅ 15言語のサポート
- ✅ テンプレート言語からの自動コピー
- ✅ 翻訳マーカーの自動挿入（`<!-- TODO: XX - この文書は翻訳が必要です -->`）
- ✅ デフォルト言語の設定
- ✅ フォールバック言語の自動設定
- ✅ 全バージョン対応のディレクトリ構造自動作成

**例**:
```bash
# 対話式で中国語（簡体字）を追加
pnpm docs-cli add language my-docs zh-Hans

# 非対話式でテンプレート自動生成
pnpm docs-cli add language my-docs ko \
  --display-name "한국어" \
  --template-lang en \
  --auto-template

# 韓国語を追加（対話なし）
pnpm docs-cli add language my-docs ko --yes

# dry-runモードで確認
pnpm docs-cli add language my-docs de --dry-run
```

### add doc - ドキュメント追加

新しいドキュメントを追加します。✅ **完全実装済み**

```bash
pnpm docs-cli add doc <project-id> <slug> [options]
```

**オプション**:
- `--version <version>` - 対象バージョン（デフォルト: `latest`）
- `--title-en <title>` - 英語タイトル
- `--title-ja <title>` - 日本語タイトル
- `--summary <text>` - ドキュメントの概要
- `--category <category>` - カテゴリID
- `--keywords <keywords>` - キーワード（カンマ区切り）
- `--tags <tags>` - タグ（カンマ区切り）

**主要機能**:
- ✅ 自動ドキュメントID生成（project-001, project-002...）
- ✅ スラッグのバリデーション（小文字英数字、ハイフン、スラッシュ）
- ✅ 全言語対応のMDXファイル自動生成
- ✅ フロントマター付きテンプレート生成
- ✅ カテゴリへの自動追加
- ✅ レジストリへの自動登録

**例**:
```bash
# 対話式でドキュメント追加
pnpm docs-cli add doc my-docs getting-started

# 非対話式（CI用）
pnpm docs-cli add doc my-docs installation \
  --title-en "Installation Guide" \
  --title-ja "インストールガイド" \
  --summary "How to install the library" \
  --category guide \
  --keywords "install,setup,quickstart" \
  --tags "beginner,tutorial" \
  --version v1 \
  --yes

# スラッシュを含むスラッグ（ネストしたパス）
pnpm docs-cli add doc my-docs api/authentication \
  --title-en "API Authentication" \
  --title-ja "API認証"

# dry-runモードで確認
pnpm docs-cli add doc my-docs new-feature --dry-run
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

## update - 更新コマンド群 ✅ **完全実装済み**

既存のプロジェクト、バージョン、言語、ドキュメントのメタデータを更新します。

### update project - プロジェクト更新

プロジェクトのメタデータ（表示名、説明、ステータス）を更新します。

```bash
pnpm docs-cli update project <project-id> [options]
```

**オプション**:
- `--display-name-en <name>` - 英語表示名
- `--display-name-ja <name>` - 日本語表示名
- `--description-en <text>` - 英語説明文
- `--description-ja <text>` - 日本語説明文
- `--status <status>` - ステータス（`active`, `archived`）

**例**:
```bash
# 表示名を更新
pnpm docs-cli update project my-docs \
  --display-name-en "My Documentation" \
  --display-name-ja "私のドキュメント"

# ステータスを更新
pnpm docs-cli update project my-docs --status archived

# dry-runモードで確認
pnpm docs-cli update project my-docs \
  --display-name-en "New Name" \
  --dry-run
```

### update version - バージョン更新

バージョンのメタデータを更新します。

```bash
pnpm docs-cli update version <project-id> <version-id> [options]
```

**オプション**:
- `--name <name>` - バージョン表示名
- `--status <status>` - ステータス（`active`, `deprecated`, `draft`）
- `--set-latest` - 最新バージョンとして設定

**主要機能**:
- ✅ 最新バージョンフラグの自動更新（既存の最新バージョンを自動解除）

**例**:
```bash
# バージョン名を更新
pnpm docs-cli update version my-docs v2 --name "Version 2.0"

# 最新バージョンとして設定
pnpm docs-cli update version my-docs v3 --set-latest

# ステータスを非推奨に変更
pnpm docs-cli update version my-docs v1 --status deprecated
```

### update language - 言語更新

言語設定を更新します。

```bash
pnpm docs-cli update language <project-id> <lang-code> [options]
```

**オプション**:
- `--display-name <name>` - 言語表示名
- `--status <status>` - ステータス（`active`, `inactive`）
- `--set-default` - デフォルト言語として設定
- `--fallback <lang-code>` - フォールバック言語

**主要機能**:
- ✅ デフォルト言語フラグの自動更新（既存のデフォルト言語を自動解除）

**例**:
```bash
# 表示名を更新
pnpm docs-cli update language my-docs ja --display-name "日本語 (Japanese)"

# デフォルト言語として設定
pnpm docs-cli update language my-docs ja --set-default

# フォールバック言語を変更
pnpm docs-cli update language my-docs ko --fallback ja
```

### update doc - ドキュメント更新

ドキュメントのメタデータを更新します。

```bash
pnpm docs-cli update doc <project-id> <doc-id|slug> [options]
```

**オプション**:
- `--title-en <title>` - 英語タイトル
- `--title-ja <title>` - 日本語タイトル
- `--summary <text>` - 概要
- `--status <status>` - ステータス（`draft`, `published`, `archived`）
- `--visibility <visibility>` - 可視性（`public`, `private`）
- `--keywords <keywords>` - キーワード（カンマ区切り）
- `--tags <tags>` - タグ（カンマ区切り）

**主要機能**:
- ✅ docIDまたはslugで検索可能
- ✅ 配列フィールドの完全置き換え

**例**:
```bash
# タイトルを更新
pnpm docs-cli update doc my-docs getting-started \
  --title-en "Getting Started Guide" \
  --title-ja "スタートガイド"

# ステータスを公開に変更
pnpm docs-cli update doc my-docs api/auth --status published

# キーワードとタグを更新
pnpm docs-cli update doc my-docs installation \
  --keywords "install,setup,quickstart" \
  --tags "beginner,tutorial"

# slugで検索して更新
pnpm docs-cli update doc my-docs "guide/installation" \
  --summary "How to install the library"
```

## remove - 削除コマンド群 ✅ **完全実装済み**

プロジェクト、バージョン、言語、ドキュメントを削除します。すべての削除コマンドには確認プロンプトがあります。

### remove project - プロジェクト削除

プロジェクトをレジストリから削除します。

```bash
pnpm docs-cli remove project <project-id> [options]
```

**オプション**:
- `--force` - 確認なしで削除

**主要機能**:
- ✅ プロジェクト詳細表示（ドキュメント数、バージョン数、言語数）
- ✅ 確認プロンプト（--forceでスキップ可能）
- ✅ レジストリからのみ削除（コンテンツファイルは保持）

**例**:
```bash
# プロジェクト削除（確認プロンプト付き）
pnpm docs-cli remove project old-docs

# 確認なしで削除
pnpm docs-cli remove project old-docs --force

# dry-runモードで確認
pnpm docs-cli remove project old-docs --dry-run --yes
```

**注意**: デフォルトではレジストリからのみ削除し、コンテンツファイル（`apps/<project-id>/`）は保持されます。手動で削除する必要があります。

### remove version - バージョン削除

バージョンをレジストリから削除します。

```bash
pnpm docs-cli remove version <project-id> <version-id> [options]
```

**オプション**:
- `--force` - 確認なしで削除
- `--delete-content` - コンテンツファイルも削除

**主要機能**:
- ✅ バージョン情報表示
- ✅ 確認プロンプト
- ✅ オプショナルなコンテンツ削除
- ✅ 全言語のコンテンツディレクトリ削除

**例**:
```bash
# バージョン削除（レジストリのみ）
pnpm docs-cli remove version my-docs v1

# コンテンツファイルも削除
pnpm docs-cli remove version my-docs v1 --delete-content

# 確認なしで削除
pnpm docs-cli remove version my-docs v1 --force --yes
```

### remove language - 言語削除

言語をレジストリから削除します。

```bash
pnpm docs-cli remove language <project-id> <lang-code> [options]
```

**オプション**:
- `--force` - 確認なしで削除
- `--delete-content` - コンテンツファイルも削除

**主要機能**:
- ✅ 言語情報表示（デフォルト言語か、影響を受けるバージョン数）
- ✅ 最後の1言語は削除不可（バリデーション）
- ✅ デフォルト言語削除時の警告メッセージ
- ✅ オプショナルなコンテンツ削除
- ✅ 全バージョンのコンテンツディレクトリ削除

**例**:
```bash
# 言語削除（レジストリのみ）
pnpm docs-cli remove language my-docs ko

# コンテンツファイルも削除
pnpm docs-cli remove language my-docs ko --delete-content

# 確認なしで削除
pnpm docs-cli remove language my-docs ko --force --yes
```

**注意**: デフォルト言語を削除した後は、別の言語をデフォルトに設定する必要があります。

### remove doc - ドキュメント削除

ドキュメントをレジストリから削除します。

```bash
pnpm docs-cli remove doc <project-id> <doc-id|slug> [options]
```

**オプション**:
- `--force` - 確認なしで削除
- `--delete-content` - コンテンツファイルも削除

**主要機能**:
- ✅ ドキュメント情報表示（影響を受けるファイル数）
- ✅ docIDまたはslugで検索可能
- ✅ 確認プロンプト
- ✅ オプショナルなコンテンツ削除
- ✅ 全バージョン・全言語のMDXファイル削除

**例**:
```bash
# ドキュメント削除（レジストリのみ）
pnpm docs-cli remove doc my-docs getting-started

# slugで検索して削除
pnpm docs-cli remove doc my-docs "guide/installation"

# コンテンツファイルも削除
pnpm docs-cli remove doc my-docs api/auth --delete-content

# 確認なしで削除
pnpm docs-cli remove doc my-docs old-feature --force --yes
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

Phase 1-4 Week 1-2で主要なCRUDコマンド群を完成させました。以下の機能はWeek 3以降で実装予定です:

**Week 1-2で完成した機能**:
- [x] `add version` の完全実装 ✅
- [x] `add language` の完全実装 ✅
- [x] `add doc` の完全実装 ✅
- [x] `update` コマンド群（project, version, language, doc）✅
- [x] `remove` コマンド群（project, version, language, doc）✅

**Week 3以降の実装予定**:
- [ ] テストスイート構築（Vitest setup）
- [ ] ユニットテスト作成
- [ ] 統合テスト作成
- [ ] CI統合（GitHub Actions）
- [ ] `search` コマンド（ドキュメント検索機能）
- [ ] `export` コマンド（レジストリデータのエクスポート）
- [ ] `migrate` コマンドの詳細化（Phase 3連携）

## 参考リンク

- [Phase 1-3 計画書](../phase-1-3-cli-core.md)
- [DECISIONS.md](../DECISIONS.md)
- [packages/cli/README.md](../../../packages/cli/README.md)
