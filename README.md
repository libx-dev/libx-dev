# libx

複数のAstroプロジェクトをモノレポ構造で管理するドキュメントサイトです。主に英語の技術ドキュメントを日本語に翻訳したコンテンツを扱います。

## 特徴

- モノレポ構造による効率的な管理
- 共通UIコンポーネントとテーマ
- 多言語対応（英語・日本語）
- ドキュメントのバージョン管理
- Cloudflare Pagesへの自動デプロイ

## プロジェクト構造

```
libx-dev/
├── packages/         # 共有パッケージ
│   ├── ui/           # 共通UIコンポーネント
│   ├── theme/        # 共通テーマ
│   ├── i18n/         # 国際化ユーティリティ
│   └── versioning/   # バージョン管理機能
├── apps/             # 各ドキュメントプロジェクト
├── config/           # 共通設定
└── scripts/          # ユーティリティスクリプト
```

## 開発環境のセットアップ

### 前提条件

- Node.js 18以上
- pnpm 8以上
- Git

### セットアップ手順

1. リポジトリのクローン：
   ```bash
   git clone https://github.com/libx-dev/libx-dev.git
   cd libx-dev
   ```

2. 依存関係のインストール：
   ```bash
   pnpm install
   ```

3. 開発サーバーの起動：
   ```bash
   # すべてのプロジェクトを起動
   pnpm dev
   
   # 特定のプロジェクトのみ起動
   pnpm --filter=project-template dev
   pnpm --filter=top-page dev
   ```

### ローカルサーバーでの確認

ビルド後のサイトをローカルで確認するには：

```bash
# プロジェクトをビルド
pnpm build

# ローカルサーバーを起動（ポート8080）
bash scripts/dev/start_server.sh
```

サーバーが起動すると `http://localhost:8080` でサイトにアクセスできます。

**注意**: `start_server.sh` スクリプトは `scripts/dev/` ディレクトリに配置されています。

## 新規プロジェクトの追加方法

### 自動プロジェクト作成スクリプト（推奨）

新しいドキュメントプロジェクトを自動で作成するスクリプトを利用できます：

```bash
# 基本的な使用
pnpm create:project プロジェクト名 "英語表示名" "日本語表示名"

# 例: API文書プロジェクトを作成
pnpm create:project api-docs "API Documentation" "API文書"

# オプション付きで作成
pnpm create:project my-project "My Documentation" "私のドキュメント" \
  --description-en="Comprehensive documentation" \
  --description-ja="包括的なドキュメント" \
  --icon="book" \
  --tags="documentation,guide"

# テストスキップで高速作成
pnpm create:project quick-project "Quick Project" "クイックプロジェクト" --skip-test
```

このスクリプトは以下の処理を自動で実行します：
- テンプレートプロジェクト（project-template）のコピー
- 全設定ファイルの自動更新（package.json、astro.config.mjs、project.config.json等）
- 依存関係の自動インストール
- 動作確認テスト
- トップページへのプロジェクト追加

#### 利用可能なオプション

| オプション | 説明 | デフォルト値 |
|-----------|------|-------------|
| `--description-en` | 英語説明文 | "Documentation for [表示名]" |
| `--description-ja` | 日本語説明文 | "[表示名]のドキュメントです" |
| `--icon` | アイコン名 | "file-text" |
| `--tags` | カンマ区切りタグ | "documentation" |
| `--template` | テンプレートプロジェクト | "project-template" |
| `--skip-test` | 動作テストをスキップ | false |

#### 利用可能なアイコン
`file-text`, `book`, `code`, `settings`, `database`, `globe`, `layers`, `package` など

### 手動でのプロジェクト作成

自動スクリプトを使わない場合の手動作成方法：

1. 新しいAstroプロジェクトを作成：
   ```bash
   pnpm create astro apps/new-project --template minimal
   ```

2. 共有パッケージの依存関係を追加：
   ```bash
   pnpm --filter=new-project add @docs/ui @docs/theme @docs/i18n @docs/versioning
   ```

3. プロジェクト設定の調整：
   - `astro.config.mjs`の設定
   - `src/config/project.config.ts`の設定
   - 多言語対応の設定
   - バージョン管理の設定

手動作成の詳細手順は`docs/NEW_PROJECT_CREATION_GUIDE.md`を参照してください。

## ビルドとデプロイ

### ビルドコマンド

以下のコマンドを使用してプロジェクトをビルドできます：

```bash
# 新しいドキュメントプロジェクトを作成
pnpm create:project

# 統合ビルドを実行（すべてのアプリケーションをビルドして統合）
pnpm build

# ローカル開発環境用のビルドを実行（ベースパスなし）
pnpm build:local

# 各アプリケーションを個別にビルド
pnpm build:separate

# サイドバーJSONファイルを生成
pnpm build:sidebar

```

### デプロイ

#### Cloudflare Pagesへのデプロイ

現在はCloudflare Wrangler CLIを使用してデプロイします。
プロジェクト名：`libx`

#### 手動デプロイ

ローカル環境から手動でデプロイする場合：

```bash
# Cloudflare Pagesに直接デプロイ
pnpm build && pnpm deploy:pages

# または一連のビルドプロセスとデプロイを実行
# 1. サイドバーを構築
# 2. 統合ビルドを実行
# 3. ビルド出力を../libx/にコピー
pnpm build:deploy

# ビルド出力を../libx/にコピーのみ実行
pnpm copy:docs
```

## libx-coreリポジトリへのコピー

このプロジェクトの主要な部分のみを抽出してlibx-coreリポジトリにコピーするためのスクリプトが用意されています。

### コピー対象

**含まれるもの:**
- `packages/` - 全共有パッケージ（ui, theme, i18n, versioning）
- `apps/project-template/` - プロジェクトテンプレート
- `apps/top-page/` - トップページアプリ
- `config/` - 共通設定ファイル
- `scripts/` - 自動化スクリプト
- 設定ファイル（package.json, pnpm-workspace.yaml, .eslintrc.cjs等）

**除外されるもの:**
- `node_modules/`, `dist/` 等のビルド成果物
- 不要なapps（sample-docs, test-verification）
- 開発専用ファイル（pnpm-lock.yaml, .github/workflows/）
- AI開発支援ファイル（CLAUDE.md, .claude/ 等）
- 既存のREADME.mdとLICENSEは保護（上書きしない）

### 使用方法

#### 推奨：選択的同期スクリプト（sync-to-libx-core.js）
Gitの履歴をすっきり保つため、必要なファイルのみを明示的に同期します：

```bash
# ドライラン（実際には同期しない、確認用）
pnpm sync:libx-core:dry-run

# 実際に選択的同期を実行
pnpm sync:libx-core

# 詳細ログ付きで実行
pnpm sync:libx-core:verbose

# 直接スクリプトを実行
node scripts/sync-to-libx-core.js --dry-run --verbose
node scripts/sync-to-libx-core.js

# ヘルプを表示
node scripts/sync-to-libx-core.js --help
```

**選択的同期の特徴:**
- ✅ 必要なファイル・ディレクトリのみを明示的に指定
- ✅ Gitの履歴に不要な削除記録が残らない
- ✅ README.mdとLICENSEファイルを自動保護
- ✅ Git状態の自動確認とレポート

#### 従来方式：全体コピースクリプト（copy-to-libx-core.js）
除外ルールベースでファイルをコピーします：

```bash
# ドライラン（実際にはコピーしない、確認用）
pnpm copy:libx-core:dry-run

# 実際にコピーを実行
pnpm copy:libx-core

# 直接スクリプトを実行
node scripts/copy-to-libx-core.js --dry-run
node scripts/copy-to-libx-core.js --help
```

**重要な注意事項:**
- 事前に `../libx-core/` ディレクトリが存在し、Gitリポジトリである必要があります
- 必ず最初にドライランで確認してからコピー/同期を実行してください
- 既存のlibx-coreのREADME.mdとLICENSEファイルは保護されます
- **推奨**: Gitの履歴をクリーンに保つため、`sync-to-libx-core.js`を使用してください

## 自動プロジェクト検出機能

`apps/top-page`では自動プロジェクト検出機能を使用しており、`apps/`ディレクトリ内のプロジェクトを自動的に検出してトップページに表示します。

### プロジェクト装飾設定

`apps/top-page/src/config/projects.config.json`でプロジェクトのアイコンやタグなどの装飾情報を設定できます：

```json
{
  "projectDecorations": {
    "sample-docs": {
      "icon": "file-text",
      "tags": ["sample", "documentation"],
      "isNew": true
    }
  }
}
```

## libx-docs コンテンツ同期

このプロジェクトでは、libx-docsリポジトリからのコンテンツ自動同期機能を提供しています。

### 基本的な同期

```bash
# 全プロジェクトを同期（高速な構造検知）
node scripts/sync-content.js

# 特定プロジェクトを同期
node scripts/sync-content.js sample-docs

# ファイル内容も含めた詳細な変更検知
node scripts/sync-content.js sample-docs --content-hash
```

### その他のオプション

```bash
# バリデーションのみ実行
node scripts/sync-content.js --validate-only

# パフォーマンステスト
node scripts/sync-content.js sample-docs --benchmark

# ドライラン（変更を実行せず確認のみ）
node scripts/sync-content.js --dry-run --verbose
```

詳細は `docs/LIBX_DOCS_SYNC.md` を参照してください。

## ドキュメント管理

### プロジェクト作成

新しいドキュメントプロジェクトを作成するには：

```bash
# 新しいプロジェクトを作成
pnpm create:project project-name "Project Name" "プロジェクト名"
```

詳細なオプションについては上記の「新規プロジェクトの追加方法」セクションを参照してください。

### 設定ファイル

ドキュメントの設定は以下のファイルで管理されています：

```text
apps/[project-name]/src/config/
└── project.config.json   # プロジェクト統合設定（JSON形式、メタデータ、バージョン、カテゴリ翻訳）

apps/top-page/src/config/
└── projects.config.json  # トップページのプロジェクト一覧設定（JSON形式）
```

### 新しいバージョンの追加

新しいドキュメントバージョンを作成するには、以下のコマンドを実行します：

```bash
# 基本的な使用方法
node scripts/create-version.js [project-name] [version]

# 例: sample-docsプロジェクトにv3バージョンを追加
node scripts/create-version.js sample-docs v3

# インタラクティブモードで実行（推奨）
node scripts/create-version.js sample-docs v3 --interactive

# 前バージョンからのコピーを行わない場合
node scripts/create-version.js sample-docs v3 --no-copy
```

このコマンド（改良版）は以下の処理を自動で行います：

- `project.config.json`のバージョン設定更新
- 全言語に対応したディレクトリ構造作成
- 前バージョンからのコンテンツコピー（オプション）
- バージョン管理の自動更新

### 新しい言語の追加

**🚀 推奨**: 自動化スクリプトを使用して新しい言語を追加できます：

```bash
# 基本的な言語追加
node scripts/add-language.js [project-name] [language-code]

# 例: sample-docsプロジェクトにドイツ語を追加
node scripts/add-language.js sample-docs de

# カスタム表示名・説明付き
node scripts/add-language.js sample-docs de "Deutsch" "Deutsche Dokumentation"

# 高度なオプション使用
node scripts/add-language.js sample-docs ko --template-lang=ja --skip-test
```

自動化スクリプトは以下の処理を自動で行います：

- 設定ファイルの更新（`project.config.json`、`projects.config.json`）
- 言語用ディレクトリ構造の作成
- テンプレートファイルの生成（翻訳マーカー付き）
- ビルドテストの自動実行
- エラー時の自動ロールバック

**サポート言語**: en, ja, zh-Hans, zh-Hant, es, pt-BR, ko, de, fr, ru, ar, id, tr, hi, vi

詳細な手順と手動方法については`docs/LANGUAGE_ADDITION_GUIDE.md`を参照してください。

### 新しいドキュメントの追加

新しいドキュメントを作成するには、以下のコマンドを実行します：

```bash
# 基本的な使用方法
node scripts/create-document.js <project-name> <lang> <version> [category] [title]

# 例: sample-docsの英語版v2にガイドドキュメントを追加
node scripts/create-document.js sample-docs en v2 guide "Getting Started"

# インタラクティブモードで実行（推奨）
node scripts/create-document.js sample-docs ja v2 --interactive
```

このコマンド（改良版）は以下の処理を自動で行います：

- 既存プロジェクト構造の自動解析
- カテゴリとファイル番号の自動採番
- 適切なディレクトリ構造での配置
- MDXテンプレートファイルの自動生成
- インタラクティブなカテゴリ選択機能
