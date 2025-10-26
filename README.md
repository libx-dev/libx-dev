# libx

新しいドキュメントサイトジェネレーターシステムです。レジストリベースのアーキテクチャにより、複数のドキュメントプロジェクトを効率的に管理します。

## 特徴

- **レジストリ駆動**: JSON形式のレジストリファイルで全てのドキュメントを管理
- **Astro統合**: Astroインテグレーションとして動作する`@docs/generator`パッケージ
- **強力なCLI**: `docs-cli`による効率的なドキュメント管理
- **多言語対応**: 複数言語のドキュメントを簡単に管理
- **バージョン管理**: ドキュメントのバージョニング機能を標準装備
- **全文検索**: Pagefindによる高速な全文検索
- **型安全**: TypeScriptによる型安全なスキーマ検証

## プロジェクト構造

```
libx-dev/
├── packages/           # コアパッケージ
│   ├── cli/            # docs-cli コマンドラインツール
│   ├── generator/      # Astroインテグレーション・サイトジェネレーター
│   ├── runtime/        # ランタイムコンポーネント
│   ├── validator/      # レジストリ検証ツール
│   ├── ui/             # 共通UIコンポーネント
│   ├── theme/          # 共通テーマシステム
│   ├── i18n/           # 国際化ユーティリティ
│   └── versioning/     # バージョン管理機能
├── apps/               # ドキュメントプロジェクト
│   ├── demo-docs/      # デモプロジェクト
│   └── top-page/       # トップページ（プロジェクト一覧）
├── registry/           # レジストリファイル
│   ├── docs.json       # メインレジストリ
│   ├── demo-docs.json  # デモプロジェクト用レジストリ
│   └── schema/         # JSONスキーマ定義
├── scripts/            # ユーティリティスクリプト
│   ├── validate-registry.js  # レジストリ検証
│   ├── capture-screenshots.js # スクリーンショット取得
│   ├── compat/         # 互換レイヤー（旧スクリプトとの互換性）
│   ├── dev/            # 開発ユーティリティ
│   ├── plugins/        # remarkプラグイン
│   └── schemas/        # スキーマファイル
├── config/             # 共通設定
│   ├── eslint/         # ESLint設定
│   └── tsconfig/       # TypeScript設定
├── templates/          # プロジェクトテンプレート
├── test-projects/      # テストプロジェクト
└── docs/               # プロジェクトドキュメント
    └── new-generator-plan/  # 新ジェネレーター計画書
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
   # デモプロジェクトの開発サーバーを起動
   pnpm dev

   # トップページの開発サーバーを起動
   pnpm dev:top-page
   ```

   ブラウザで `http://localhost:4321` を開いてドキュメントサイトを確認できます。

### ローカルサーバーでの確認

ビルド後のサイトをローカルで確認するには：

```bash
# プロジェクトをビルド
pnpm build

# ローカルサーバーを起動（ポート8080）
bash scripts/dev/start_server.sh
```

サーバーが起動すると `http://localhost:8080` でサイトにアクセスできます。

## docs-cli の使用方法

`docs-cli` は、ドキュメントプロジェクトの管理を簡単にする強力なコマンドラインツールです。

### 基本的な使用方法

```bash
# CLIのヘルプを表示
pnpm docs-cli --help

# プロジェクトの作成
pnpm docs-cli add project my-docs \
  --display-name-en "My Documentation" \
  --display-name-ja "私のドキュメント"

# 言語の追加
pnpm docs-cli add language my-docs ja

# バージョンの追加
pnpm docs-cli add version my-docs v2.0

# ドキュメントの作成
pnpm docs-cli add document my-docs v1.0 en guides "Getting Started"

# プロジェクト一覧の表示
pnpm docs-cli list projects

# バージョン一覧の表示
pnpm docs-cli list versions my-docs
```

### レジストリの検証

```bash
# 基本的な検証
pnpm validate

# 厳密な検証（警告もエラーとして扱う）
pnpm validate:strict

# 完全な検証（コンテンツファイルの存在確認含む）
pnpm validate:full
```

詳細は [docs-cli ガイド](docs/new-generator-plan/guides/docs-cli.md)を参照してください。

## 新規プロジェクトの作成

新しいドキュメントプロジェクトを作成するには、`docs-cli`を使用します：

```bash
# 基本的なプロジェクト作成
pnpm docs-cli add project api-docs \
  --display-name-en "API Documentation" \
  --display-name-ja "API文書"

# より詳細な設定で作成
pnpm docs-cli add project user-guide \
  --display-name-en "User Guide" \
  --display-name-ja "ユーザーガイド" \
  --description-en "Comprehensive user documentation" \
  --description-ja "包括的なユーザードキュメント"
```

プロジェクト作成後、自動的に以下が行われます：
- レジストリへの登録
- 初期バージョン（v1.0）の作成
- デフォルト言語（英語・日本語）の設定
- サンプルドキュメントの生成

## ビルドとデプロイ

### ビルドコマンド

```bash
# 全プロジェクトを統合ビルド（推奨）
pnpm build

# 統合ビルド（詳細オプション付き）
pnpm build:integrated        # 通常の統合ビルド
pnpm build:local            # ローカル開発用ビルド（ベースパス削除）
pnpm build:clean            # dist/ディレクトリのクリーンアップのみ

# 個別プロジェクトのビルド
pnpm build:demo-docs        # demo-docsのみ
pnpm build:top-page         # top-pageのみ

# プレビュー（統合ビルド後）
pnpm preview                # ローカルサーバー起動 (http://localhost:8080)

# 個別プロジェクトのプレビュー
pnpm preview:demo-docs      # demo-docsのみ (http://localhost:4321)
pnpm preview:top-page       # top-pageのみ (http://localhost:4321)
```

**重要**: `pnpm build` は全プロジェクトを統合して `dist/` ディレクトリに出力します：
- `/` → トップページ（プロジェクト一覧）
- `/docs/demo-docs/` → demo-docsプロジェクト
- その他のプロジェクトも `/docs/{project-id}/` に配置

### 統合ビルドの詳細オプション

統合ビルドスクリプトは、レジストリベースで自動的にプロジェクトを検出してビルドします。

```bash
# 直接実行（より詳細なオプション）
node scripts/build-integrated.js [オプション]

# オプション:
#   --local           ローカル開発環境用のビルド（ベースパス削除）
#   --skip-build      ビルドをスキップしてコピーのみ実行
#   --project <id>    特定プロジェクトのみビルド（例: demo-docs）
#   --clean           dist/のクリーンアップのみ実行
#   --help            ヘルプを表示

# 使用例:
node scripts/build-integrated.js --help                    # ヘルプ表示
node scripts/build-integrated.js --local                   # ローカル開発用ビルド
node scripts/build-integrated.js --project demo-docs       # demo-docsのみビルド
node scripts/build-integrated.js --skip-build              # コピーのみ
```

統合ビルドの特徴：

- **レジストリ駆動**: `registry/*.json` から自動的にプロジェクトを検出
- **重複排除**: 複数のレジストリに同じプロジェクトがある場合も正しく処理
- **柔軟な設定**: ローカル/本番環境用のビルドを切り替え可能
- **詳細な進捗表示**: 各ステップの所要時間を表示

### デプロイ

#### Cloudflare Pagesへのデプロイ

```bash
# ビルドしてCloudflare Pagesにデプロイ
pnpm deploy

# または段階的に
pnpm build
pnpm deploy:pages
```

プロジェクト名：`libx`

## レジストリシステム

新しいドキュメントサイトジェネレーターの中核となる機能です。

### レジストリファイルの構造

レジストリファイル（`registry/*.json`）には、ドキュメントプロジェクトの全ての情報が記録されます：

```json
{
  "project": {
    "id": "my-docs",
    "title": {
      "en": "My Documentation",
      "ja": "私のドキュメント"
    }
  },
  "versions": [
    {
      "id": "v1.0",
      "label": "Version 1.0"
    }
  ],
  "languages": [
    {
      "code": "en",
      "label": "English"
    }
  ],
  "documents": [
    {
      "slug": "getting-started",
      "version": "v1.0",
      "lang": "en",
      "category": "guides",
      "title": "Getting Started"
    }
  ]
}
```

### レジストリスキーマ

レジストリは厳密なJSONスキーマで検証されます：
- `registry/schema/project.schema.json` - プロジェクトスキーマ
- `registry/schema/version.schema.json` - バージョンスキーマ
- `registry/schema/language.schema.json` - 言語スキーマ
- `registry/schema/document.schema.json` - ドキュメントスキーマ

詳細は [レジストリガイド](docs/new-generator-plan/guides/registry.md)を参照してください。

## ドキュメント管理

### 新しいバージョンの追加

```bash
# プロジェクトに新しいバージョンを追加
pnpm docs-cli add version my-docs v2.0

# 前バージョンからコンテンツをコピーしない場合
pnpm docs-cli add version my-docs v2.0 --no-copy

# カスタム表示名を指定
pnpm docs-cli add version my-docs v2.0 --name "Version 2.0 (Beta)"
```

### 新しい言語の追加

```bash
# プロジェクトに新しい言語を追加
pnpm docs-cli add language my-docs de

# カスタム表示名を指定
pnpm docs-cli add language my-docs de --display-name "Deutsch"

# テンプレート言語を指定（既存の言語からコピー）
pnpm docs-cli add language my-docs ko --template-lang ja
```

**サポートされている言語**:
en, ja, zh-Hans, zh-Hant, es, pt-BR, ko, de, fr, ru, ar, id, tr, hi, vi

### 新しいドキュメントの追加

```bash
# ドキュメントを作成
pnpm docs-cli add document my-docs v1.0 en guides "Getting Started"

# カテゴリなしで作成
pnpm docs-cli add document my-docs v1.0 en "" "Introduction"

# 複数のドキュメントを効率的に作成
pnpm docs-cli add document my-docs v1.0 en api "Authentication"
pnpm docs-cli add document my-docs v1.0 en api "Rate Limiting"
pnpm docs-cli add document my-docs v1.0 en api "Error Handling"
```

## テストとCI/CD

### テストの実行

```bash
# 全てのテストを実行
pnpm test

# ウォッチモードでテスト
pnpm test:watch

# UIモードでテスト
pnpm test:ui

# カバレッジレポート付きテスト
pnpm test:coverage

# CLIパッケージのテストのみ
pnpm test:cli

# バリデーターパッケージのテストのみ
pnpm test:validator
```

### コード品質

```bash
# Lintの実行
pnpm lint

# コードフォーマット
pnpm format
```

詳細は [テストガイド](docs/new-generator-plan/guides/testing.md) と [CI/CDガイド](docs/new-generator-plan/guides/ci-cd.md) を参照してください。

## パッケージリリース

このプロジェクトは [Changesets](https://github.com/changesets/changesets) を使用してバージョン管理を行っています。

```bash
# 変更セットを作成
pnpm changeset

# バージョンを更新
pnpm version-packages

# パッケージを公開
pnpm release
```

詳細は [リリースフローガイド](docs/new-generator-plan/guides/release-flow.md) を参照してください。

## 互換性レイヤー

旧システムからの移行を支援するため、`scripts/compat/`に互換レイヤースクリプトが用意されています。

```bash
# 旧スクリプト（互換レイヤー経由）
node scripts/compat/create-project.js my-docs "My Documentation" "私のドキュメント"

# 新CLI（推奨）
pnpm docs-cli add project my-docs \
  --display-name-en "My Documentation" \
  --display-name-ja "私のドキュメント"
```

⚠️ **注意**: 互換レイヤースクリプトは非推奨です。新しい`docs-cli`コマンドへの移行を推奨します。

詳細は [scripts/compat/README.md](scripts/compat/README.md) を参照してください。

## トラブルシューティング

### よくある問題

**Q: ビルドが失敗する**
```bash
# node_modulesを削除して再インストール
rm -rf node_modules
pnpm install
```

**Q: レジストリ検証エラー**
```bash
# 詳細な検証を実行
pnpm validate:full

# スキーマの確認
cat registry/schema/project.schema.json
```

**Q: docs-cliが見つからない**
```bash
# CLIパッケージをビルド
pnpm --filter=@docs/cli build

# または直接実行
node packages/cli/bin/docs-cli.js --help
```

## ドキュメント

プロジェクトの詳細なドキュメントは `docs/new-generator-plan/` に格納されています：

- [アーキテクチャ概要](docs/new-generator-plan/architecture.md)
- [プロジェクト原則](docs/new-generator-plan/PROJECT_PRINCIPLES.md)
- [完全な計画書](docs/new-generator-plan/OVERVIEW.md)

### 主要ガイド

- [docs-cli ガイド](docs/new-generator-plan/guides/docs-cli.md)
- [レジストリガイド](docs/new-generator-plan/guides/registry.md)
- [共有パッケージガイド](docs/new-generator-plan/guides/shared-packages.md)
- [テストガイド](docs/new-generator-plan/guides/testing.md)
- [CI/CDガイド](docs/new-generator-plan/guides/ci-cd.md)
- [リリースフローガイド](docs/new-generator-plan/guides/release-flow.md)

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## コントリビューション

プロジェクトへの貢献を歓迎します。Issue や Pull Request をお気軽にお寄せください。

---

**開発者向けノート**: このREADMEは新ドキュメントサイトジェネレーター（Phase 2完了）に基づいて作成されています。旧システムの情報が必要な場合は、[旧システム削除計画](docs/new-generator-plan/LEGACY_CLEANUP_PLAN.md)を参照してください。
