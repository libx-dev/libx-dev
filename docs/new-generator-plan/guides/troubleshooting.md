# トラブルシューティングガイド

このガイドは、新ドキュメントサイトジェネレーターの運用中に発生する可能性のある問題とその解決方法を包括的にまとめています。

**対象読者**: 運用担当者、開発者、コンテンツ編集者、翻訳担当者

**関連ガイド**:
- [ビルド・デプロイ運用ガイド](./build-deploy-operations.md) - ビルド・デプロイの基本手順
- [CLI操作ガイド](./cli-operations.md) - CLIコマンドの詳細
- [FAQ](./faq.md) - よくある質問と回答

---

## 目次

- [一般的なトラブルシューティング手順](#一般的なトラブルシューティング手順)
- [1. ビルドエラー](#1-ビルドエラー)
- [2. CLI操作エラー](#2-cli操作エラー)
- [3. デプロイ問題](#3-デプロイ問題)
- [4. 検索機能問題](#4-検索機能問題)
- [5. パフォーマンス問題](#5-パフォーマンス問題)
- [6. アクセシビリティ問題](#6-アクセシビリティ問題)
- [7. 国際化問題](#7-国際化問題)
- [8. レジストリ問題](#8-レジストリ問題)
- [9. バックアップ・リストア問題](#9-バックアップリストア問題)
- [エスカレーション](#エスカレーション)

---

## 一般的なトラブルシューティング手順

問題が発生した場合は、以下の基本手順に従ってください：

### ステップ1: エラーメッセージの確認

```bash
# エラーの全文を記録
# スクリーンショットまたはテキストとして保存
```

**確認ポイント**:
- エラーメッセージの全文
- エラーが発生したコマンドまたは操作
- エラーコード（存在する場合）
- スタックトレース

### ステップ2: 環境の確認

```bash
# Node.jsバージョン確認
node --version  # v18.0.0以上が必要

# pnpmバージョン確認
pnpm --version  # v8.0.0以上が必要

# 作業ディレクトリ確認
pwd  # libx-devルートにいることを確認

# Gitステータス確認
git status  # 未コミットの変更を確認
```

### ステップ3: クリーンビルド

多くの問題は依存関係のクリーンインストールで解決します：

```bash
# node_modulesとロックファイルを削除
rm -rf node_modules pnpm-lock.yaml

# 依存関係を再インストール
pnpm install

# ビルドキャッシュをクリア
rm -rf apps/*/dist packages/*/dist

# 再ビルド
pnpm build
```

### ステップ4: ログの確認

```bash
# 詳細ログ出力モードで実行
pnpm build --verbose

# またはCLIコマンドで
docs-gen <command> --verbose
```

### ステップ5: 本ガイドで該当する問題を検索

以下のセクションから、発生しているエラーに最も近い症状を見つけてください。

---

## 1. ビルドエラー

### 1-1. レジストリスキーマエラー

#### 症状
```
Error: Registry validation failed: Invalid schema version
Error: Required field "summary" is missing in document
```

#### 原因
- レジストリJSONファイルがスキーマ定義に準拠していない
- 必須フィールドが不足している
- 型が不一致（文字列 vs オブジェクト）

#### 解決手順

**ステップ1: スキーマバージョンの確認**

```bash
# レジストリファイルの確認
cat registry/demo-docs.json | jq '.$schemaVersion'
```

**期待値**: `"0.0.1"`

**修正例**:
```json
{
  "$schemaVersion": "0.0.1",
  "projects": [...]
}
```

**ステップ2: 必須フィールドの確認**

レジストリのドキュメント定義には以下が必須です：

```json
{
  "id": "getting-started",
  "summary": {
    "en": "Getting Started Guide",
    "ja": "はじめに"
  },
  "description": {
    "en": "Quick start guide",
    "ja": "クイックスタートガイド"
  }
}
```

**重要**: Phase 4-1のスキーマ統一により、`summary`と`description`は**多言語オブジェクト形式**が標準です。

**ステップ3: バリデーション実行**

```bash
# レジストリをバリデーション
docs-gen validate registry/demo-docs.json
```

#### 予防策
- レジストリ編集時は必ず`docs-gen validate`を実行
- CI/CDパイプラインでバリデーションを自動化
- VSCodeでJSON Schemaバリデーションを有効化

#### 関連リンク
- [レジストリガイド](./registry.md)
- [Phase 4-1 スキーマ移行レポート](../status/phase-4-1-schema-migration-report.md)

---

### 1-2. 依存関係エラー

#### 症状
```
Error: Cannot find module '@docs/ui'
Error: Package 'astro' not found
ENOENT: no such file or directory
```

#### 原因
- `pnpm install`が未実行
- node_modulesが破損
- ワークスペース設定が不正

#### 解決手順

**ステップ1: 依存関係の再インストール**

```bash
# クリーンインストール
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**ステップ2: ワークスペース設定の確認**

```bash
# pnpm-workspace.yamlの存在確認
cat pnpm-workspace.yaml
```

**期待される内容**:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**ステップ3: 共有パッケージのビルド**

```bash
# 共有パッケージをビルド
cd packages/ui && pnpm build
cd packages/theme && pnpm build
cd packages/generator && pnpm build
```

#### 予防策
- `pnpm install`を定期的に実行
- CI/CDで依存関係を自動チェック
- package.jsonの変更後は必ず再インストール

#### 関連リンク
- [共有パッケージガイド](./shared-packages.md)

---

### 1-3. TypeScriptコンパイルエラー

#### 症状
```
Error: Type 'string' is not assignable to type 'LocalizedText'
Error: Property 'summary' does not exist on type 'Document'
```

#### 原因
- 型定義が不一致
- レジストリのデータ構造がTypeScript型定義と合わない
- 共有パッケージの型定義が古い

#### 解決手順

**ステップ1: 型定義ファイルの確認**

```bash
# generatorパッケージの型定義を確認
cat packages/generator/src/types.ts
```

**ステップ2: 多言語フィールドの型ガード実装**

Phase 4-1で確立されたパターン：

```typescript
// 多言語対応: summaryが多言語オブジェクトの場合は言語別に取得
const getLocalizedText = (text: any, lang: string): string => {
  if (typeof text === 'object' && text !== null) {
    return text[lang] || text['en'] || '';
  }
  return String(text || '');
};

const localizedSummary = getLocalizedText(summary, langStr);
```

**ステップ3: 共有パッケージの再ビルド**

```bash
# generatorパッケージを再ビルド
cd packages/generator
pnpm build
```

#### 予防策
- デフェンシブプログラミングの徹底（型ガード関数の使用）
- 型定義とレジストリスキーマの同期
- CI/CDでTypeScriptコンパイルエラーを検出

#### 関連リンク
- [Phase 4-1 サイドバー修正レポート](../status/phase-4-1-sidebar-fix-report.md)
- [Phase 4-1 検索修正レポート](../status/phase-4-1-search-fix-report.md)

---

### 1-4. Astroビルドエラー

#### 症状
```
Error: [plugin:vite:import-analysis] Failed to resolve entry for package
Error: Could not resolve './components/Sidebar.astro'
```

#### 原因
- Astroコンポーネントのインポートパスが不正
- .astroファイルが存在しない
- Astro設定が不正

#### 解決手順

**ステップ1: コンポーネントの存在確認**

```bash
# Sidebarコンポーネントの確認
ls -la packages/ui/src/components/Sidebar.astro
```

**ステップ2: インポートパスの確認**

```astro
---
// 正しいインポート方法
import { Sidebar } from '@docs/ui';
// または
import Sidebar from '@docs/ui/components/Sidebar.astro';
---
```

**ステップ3: Astro設定の確認**

```bash
# astro.config.mjsの確認
cat apps/demo-docs/astro.config.mjs
```

**期待される設定**:
```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  // ...
  vite: {
    resolve: {
      alias: {
        '@docs/ui': '/packages/ui/src',
        '@docs/theme': '/packages/theme/src',
      },
    },
  },
});
```

#### 予防策
- 共有パッケージのエクスポート定義を確認
- CI/CDでビルドを自動テスト
- 新規コンポーネント追加時は必ずビルド確認

#### 関連リンク
- [UIコンポーネントガイド](../../packages/ui/README.md)
- [Phase 2-2 UI統合レポート](../status/phase-2-2-completion-report.md)

---

### 1-5. ビルドタイムアウト

#### 症状
```
Error: Build timeout after 600 seconds
```

#### 原因
- ビルド対象が大きすぎる
- ページ数が多すぎる（1000ページ以上）
- 無限ループまたはメモリリーク

#### 解決手順

**ステップ1: ビルド対象の確認**

```bash
# レジストリのドキュメント数を確認
docs-gen list --json | jq '.projects[].versions[].documents | length'
```

**ステップ2: 選択的ビルドの使用**

```bash
# 特定のプロジェクトのみビルド
cd apps/demo-docs
pnpm build

# 統合ビルドは使用しない（開発時）
# pnpm build <- これはすべてのアプリをビルド
```

**ステップ3: メモリ使用量の確認**

```bash
# Node.jsのメモリ上限を増やす
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

#### 予防策
- プロジェクトを適切に分割（1プロジェクト500ページ以下を推奨）
- 開発時は選択的ビルドを使用
- CI/CDでタイムアウト値を適切に設定

#### 関連リンク
- [ビルド・デプロイ運用ガイド](./build-deploy-operations.md)

---

## 2. CLI操作エラー

### 2-1. コマンド実行エラー

#### 症状
```
Command 'docs-gen' not found
Permission denied
```

#### 原因
- CLIがインストールされていない
- PATHが通っていない
- 実行権限がない

#### 解決手順

**ステップ1: CLIのインストール確認**

```bash
# CLIパッケージの確認
ls -la packages/cli/bin/docs-gen.js

# 実行権限の確認
ls -l packages/cli/bin/docs-gen.js
```

**ステップ2: グローバルインストール（推奨）**

```bash
# モノレポルートで実行
cd packages/cli
pnpm link --global

# 確認
which docs-gen
docs-gen --version
```

**ステップ3: ローカル実行（代替方法）**

```bash
# node経由で直接実行
node packages/cli/bin/docs-gen.js --help

# またはpnpmスクリプト経由
pnpm run cli --help
```

#### 予防策
- 環境セットアップ時にCLIをグローバルインストール
- セットアップスクリプトの自動化

#### 関連リンク
- [CLI操作ガイド](./cli-operations.md)

---

### 2-2. バリデーションエラー

#### 症状
```
Error: Validation failed for project 'demo-docs'
Error: Document ID 'getting-started' already exists
```

#### 原因
- レジストリのデータが不正
- 重複するID
- 必須フィールドが不足

#### 解決手順

**ステップ1: 詳細ログで実行**

```bash
# verboseモードで詳細を確認
docs-gen validate --verbose
```

**ステップ2: 問題箇所の特定**

エラーメッセージから該当するプロジェクトIDとドキュメントIDを特定：

```bash
# 特定プロジェクトのみバリデーション
docs-gen validate --project demo-docs
```

**ステップ3: レジストリの修正**

```bash
# レジストリファイルを編集
vim registry/demo-docs.json

# 修正後に再バリデーション
docs-gen validate
```

#### 予防策
- レジストリ編集前にバックアップを作成
- `--dry-run`オプションで事前確認
- CI/CDでバリデーションを自動化

#### 関連リンク
- [レジストリガイド](./registry.md)

---

### 2-3. レジストリ更新失敗

#### 症状
```
Error: Failed to save registry file
EACCES: permission denied
```

#### 原因
- ファイルの書き込み権限がない
- ディスク容量不足
- レジストリファイルが他のプロセスで開かれている

#### 解決手順

**ステップ1: ファイル権限の確認**

```bash
# レジストリファイルの権限確認
ls -l registry/demo-docs.json

# 必要に応じて権限を変更
chmod 644 registry/demo-docs.json
```

**ステップ2: ディスク容量の確認**

```bash
# ディスク使用量確認
df -h

# 不要なファイルを削除
rm -rf node_modules/.cache
```

**ステップ3: プロセスの確認**

```bash
# レジストリファイルを開いているプロセスを確認（macOS/Linux）
lsof registry/demo-docs.json

# 該当プロセスを終了
kill <PID>
```

#### 予防策
- 定期的なディスク容量チェック
- レジストリファイルを複数のエディタで同時に開かない
- バックアップの定期作成

---

### 2-4. バックアップ/リストアエラー

#### 症状
```
Error: Backup file not found
Error: Failed to restore from backup
```

#### 原因
- バックアップディレクトリが存在しない
- バックアップファイルが破損
- タイムスタンプが不正

#### 解決手順

**ステップ1: バックアップディレクトリの確認**

```bash
# .backupsディレクトリの確認
ls -la .backups/

# バックアップファイルの一覧
ls -la .backups/registry-*
```

**ステップ2: バックアップファイルの検証**

```bash
# JSONファイルが有効かチェック
cat .backups/registry-demo-docs-20251025120000.json | jq '.'
```

**ステップ3: 手動リストア**

```bash
# 最新のバックアップを手動でコピー
cp .backups/registry-demo-docs-20251025120000.json registry/demo-docs.json

# レジストリをバリデーション
docs-gen validate
```

#### 予防策
- 重要な操作前にバックアップを確認
- バックアップの定期的な検証
- 外部ストレージへのバックアップコピー

#### 関連リンク
- [バックアップ・リストアガイド](./cli-operations.md#バックアップリストア)

---

## 3. デプロイ問題

### 3-1. Cloudflare Pagesビルドエラー

#### 症状
```
Build failed: Command exited with code 1
Error: @rollup/rollup-linux-x64-gnu not found
```

#### 原因
- Cloudflare Pages環境での依存関係エラー
- ビルドコマンドが不正
- 環境変数が未設定

#### 解決手順

**ステップ1: ビルドコマンドの確認**

Cloudflare Pagesの設定を確認：

```
Build command: pnpm build
Build output directory: dist
```

**ステップ2: 環境変数の設定**

Cloudflare Pagesダッシュボードで以下を設定：

```
NODE_VERSION=18
PNPM_VERSION=8
```

**ステップ3: package.jsonの確認**

```json
{
  "scripts": {
    "build": "pnpm build:integrated",
    "build:integrated": "node scripts/build-integrated.js"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

#### 予防策
- ローカルでビルドを確認してからデプロイ
- ステージング環境でテストデプロイ
- ビルドログを定期的に確認

#### 関連リンク
- [ビルド・デプロイ運用ガイド](./build-deploy-operations.md#cloudflare-pagesデプロイ)

---

### 3-2. ビルド出力問題

#### 症状
```
Error: dist directory not found
Error: Missing files in build output
```

#### 原因
- ビルドスクリプトが正しく実行されていない
- ビルド出力ディレクトリが不正
- ファイルコピーが失敗

#### 解決手順

**ステップ1: ビルド出力の確認**

```bash
# ビルドを実行
pnpm build

# 出力ディレクトリの確認
ls -la dist/
ls -la dist/docs/demo-docs/
ls -la dist/docs/sample-docs/
```

**期待されるディレクトリ構造**:
```
dist/
├── index.html (top-page)
└── docs/
    ├── demo-docs/
    │   └── v1/
    │       ├── en/
    │       └── ja/
    └── sample-docs/
        ├── v1/
        └── v2/
```

**ステップ2: ビルドスクリプトの確認**

```bash
# ビルドスクリプトの内容確認
cat scripts/build-integrated.js
```

**ステップ3: 個別アプリのビルド確認**

```bash
# demo-docsを個別にビルド
cd apps/demo-docs
pnpm build
ls -la dist/

# sample-docsを個別にビルド
cd apps/sample-docs
pnpm build
ls -la dist/
```

#### 予防策
- CI/CDでビルド出力を検証
- ビルド後の確認スクリプトを実行
- ステージング環境でテストデプロイ

---

### 3-3. ルーティング問題

#### 症状
```
404 Not Found
Page not found: /docs/demo-docs/v1/en/getting-started
```

#### 原因
- ベースパス設定が不正
- ファイル配置が不正
- Cloudflare Pagesのルーティング設定ミス

#### 解決手順

**ステップ1: ベースパスの確認**

```bash
# astro.config.mjsの確認
cat apps/demo-docs/astro.config.mjs | grep base
```

**期待される設定**:
```javascript
export default defineConfig({
  base: '/docs/demo-docs',
  // ...
});
```

**ステップ2: ファイル配置の確認**

```bash
# 期待されるファイルが存在するか確認
ls -la dist/docs/demo-docs/v1/en/getting-started/index.html
```

**ステップ3: Cloudflare Pagesリダイレクト設定**

`public/_redirects`ファイルを確認：

```
# SPAフォールバック
/docs/demo-docs/*  /docs/demo-docs/404.html  404
/docs/sample-docs/*  /docs/sample-docs/404.html  404
```

#### 予防策
- ローカルでプレビューサーバーを起動して確認
- ベースパス設定を統一
- CI/CDでリンクチェックを自動化

#### 関連リンク
- [Phase 2-1 ランタイム完了レポート](../status/phase-2-1-completion-report.md)

---

### 3-4. 環境変数設定ミス

#### 症状
```
Error: Environment variable 'BASE_URL' is not defined
```

#### 原因
- Cloudflare Pagesで環境変数が未設定
- .envファイルが読み込まれていない

#### 解決手順

**ステップ1: 環境変数の設定（Cloudflare Pages）**

Cloudflare Pagesダッシュボードで以下を設定：

```
Production:
  BASE_URL=/docs

Preview:
  BASE_URL=/preview
```

**ステップ2: .envファイルの確認**

```bash
# .envファイルの存在確認
cat .env

# 期待される内容
BASE_URL=/docs
NODE_ENV=production
```

**ステップ3: ビルドスクリプトでの環境変数読み込み確認**

```javascript
// scripts/build-integrated.js
import dotenv from 'dotenv';
dotenv.config();

const baseUrl = process.env.BASE_URL || '/docs';
```

#### 予防策
- .env.exampleファイルを用意
- CI/CDで環境変数を自動設定
- セキュリティセンシティブな情報はシークレット管理

---

## 4. 検索機能問題

### 4-1. Pagefindインデックス生成失敗

#### 症状
```
Error: Pagefind indexing failed
Error: No HTML files found to index
```

#### 原因
- postbuildスクリプトが実行されていない
- Pagefindが未インストール
- HTMLファイルが見つからない

#### 解決手順

**ステップ1: Pagefindのインストール確認**

```bash
# package.jsonの確認
cat apps/demo-docs/package.json | grep pagefind
```

**期待される内容**:
```json
{
  "devDependencies": {
    "pagefind": "^1.4.0"
  },
  "scripts": {
    "postbuild": "pagefind --site dist --glob \"**/*.html\""
  }
}
```

**ステップ2: postbuildスクリプトの実行確認**

```bash
# ビルドログでpostbuildが実行されているか確認
pnpm build 2>&1 | grep postbuild

# 手動でPagefindを実行
cd apps/demo-docs
pnpm exec pagefind --site dist --glob "**/*.html"
```

**ステップ3: インデックスファイルの確認**

```bash
# pagefindディレクトリの確認
ls -la apps/demo-docs/dist/pagefind/
```

**期待される出力**:
```
pagefind/
├── pagefind.js
├── pagefind-ui.css
├── pagefind-ui.js
└── index/
    └── *.pf_index
```

#### 予防策
- ビルド時にPagefindのログを確認
- CI/CDでインデックス生成を検証
- pagefind.tomlで設定を明示

#### 関連リンク
- [検索機能ガイド](./search.md)
- [Phase 4-1 to 4-2 引き継ぎドキュメント](../status/phase-4-1-to-4-2-handoff.md#1-pagefind検索機能)

---

### 4-2. 検索結果が表示されない

#### 症状
```
検索窓に入力しても結果が表示されない
検索結果が0件
```

#### 原因
- Pagefindのスクリプトが読み込まれていない
- ベースパスが不正
- インデックスが古い

#### 解決手順

**ステップ1: Pagefindスクリプトの読み込み確認**

```bash
# HTMLソースを確認
curl http://localhost:4321/docs/demo-docs/v1/en/getting-started/ | grep pagefind
```

**期待される出力**:
```html
<script src="/docs/demo-docs/pagefind/pagefind.js"></script>
```

**ステップ2: Search.astroコンポーネントの確認**

```bash
# Search.astroコンポーネントのベースパス処理を確認
cat packages/runtime/src/components/Search.astro | grep basePath
```

**期待されるコード**:
```astro
const pagefindPath = `${basePath}/pagefind/pagefind.js`;
```

**ステップ3: インデックスの再生成**

```bash
# インデックスを削除
rm -rf apps/demo-docs/dist/pagefind

# 再ビルド
cd apps/demo-docs
pnpm build

# インデックス生成を確認
ls -la dist/pagefind/
```

#### 予防策
- ビルド後に検索機能をテスト
- ブラウザの開発者ツールでエラーを確認
- CI/CDで検索機能のE2Eテストを実施

---

### 4-3. 検索パフォーマンス劣化

#### 症状
```
検索が遅い（3秒以上）
ブラウザが固まる
```

#### 原因
- インデックスサイズが大きすぎる（1MB以上）
- 対象ページ数が多すぎる（1000ページ以上）
- ブラウザのメモリ不足

#### 解決手順

**ステップ1: インデックスサイズの確認**

```bash
# インデックスサイズを確認
du -sh apps/demo-docs/dist/pagefind
```

**推奨値**: プロジェクトあたり500KB以下

**ステップ2: 除外パスの設定**

`pagefind.toml`を作成：

```toml
# apps/demo-docs/pagefind.toml
exclude_selectors = [
  "nav",
  "footer",
  ".sidebar",
  "[data-pagefind-ignore]"
]

# 除外パス
glob = "**/*.html"
exclude = [
  "**/draft/**",
  "**/internal/**"
]
```

**ステップ3: カスタム重み付け**

```html
<!-- 重要なコンテンツに重み付け -->
<div data-pagefind-weight="10">
  <h1>重要なタイトル</h1>
</div>

<!-- 低優先度のコンテンツ -->
<div data-pagefind-weight="0.5">
  <p>補足情報</p>
</div>
```

#### 予防策
- プロジェクトを適切に分割（1プロジェクト500ページ以下）
- draft/internalコンテンツを除外
- 定期的なインデックスサイズチェック

#### 関連リンク
- [Pagefind公式ドキュメント](https://pagefind.app/)

---

## 5. パフォーマンス問題

### 5-1. Lighthouseスコア低下

#### 症状
```
Lighthouse Performance: 70点（目標90点）
Lighthouse Accessibility: 85点（目標95点）
```

#### 原因
- 画像最適化不足
- CSS/JSファイルサイズが大きい
- レンダリングブロッキングリソース

#### 解決手順

**ステップ1: Lighthouseレポートの確認**

```bash
# Lighthouseを実行
lighthouse http://localhost:4321/docs/demo-docs/v1/en/getting-started/ \
  --output=html --output=json \
  --output-path=./lighthouse-report \
  --screenEmulation.mobile=true \
  --quiet \
  --chrome-flags="--headless"

# レポートを確認
open lighthouse-report.report.html
```

**ステップ2: 画像最適化**

```bash
# 画像をWebP形式に変換
cwebp input.png -o output.webp

# Astro設定で画像最適化を有効化
```

```javascript
// astro.config.mjs
export default defineConfig({
  image: {
    service: sharpImageService(),
  },
});
```

**ステップ3: CSS/JSの最適化**

```javascript
// astro.config.mjs
export default defineConfig({
  vite: {
    build: {
      minify: 'terser',
      cssCodeSplit: true,
    },
  },
});
```

#### 予防策
- CI/CDでLighthouseを自動測定
- スコア閾値を設定（Performance: 90、Accessibility: 95）
- 画像は事前に最適化

#### 関連リンク
- [Phase 4-1 パフォーマンスレポート](../status/phase-4-1-performance-report.md)
- [Phase 4-2 Lighthouse CI/CD完了レポート](../status/phase-4-2-accessibility-i18n-lighthouse-completion-report.md)

---

### 5-2. ページロード遅延

#### 症状
```
初回ロード時間: 5秒以上
LCP (Largest Contentful Paint): 4秒
```

#### 原因
- JavaScriptバンドルサイズが大きい
- 外部リソースの読み込み遅延
- サーバーレスポンスが遅い

#### 解決手順

**ステップ1: バンドルサイズの分析**

```bash
# ビルドサイズを確認
pnpm build 2>&1 | grep "dist/"

# または vite-bundle-visualizer を使用
pnpm add -D vite-bundle-visualizer
```

**ステップ2: コード分割**

```javascript
// 動的インポートを使用
const Search = lazy(() => import('./components/Search.astro'));
```

**ステップ3: プリロード設定**

```html
<!-- 重要なリソースをプリロード -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/pagefind/pagefind.js" as="script">
```

#### 予防策
- バンドルサイズを定期的に監視
- 不要な依存関係を削除
- CDN経由での配信を検討

---

### 5-3. 画像最適化失敗

#### 症状
```
Error: Sharp image processing failed
Warning: Image size exceeds 1MB
```

#### 原因
- Sharpライブラリが未インストール
- 画像ファイルが破損
- 画像サイズが大きすぎる

#### 解決手順

**ステップ1: Sharpのインストール確認**

```bash
# Sharpのインストール
pnpm add sharp

# 確認
pnpm list sharp
```

**ステップ2: 画像の手動最適化**

```bash
# ImageMagickで画像をリサイズ
convert input.png -resize 800x600 output.png

# または cwebpでWebP変換
cwebp -q 80 input.png -o output.webp
```

**ステップ3: Astro Image コンポーネントの使用**

```astro
---
import { Image } from 'astro:assets';
import myImage from '../images/photo.jpg';
---

<Image
  src={myImage}
  alt="説明"
  width={800}
  height={600}
  format="webp"
  quality={80}
/>
```

#### 予防策
- 画像は事前に最適化してからコミット
- 画像サイズの上限を設定（1MB以下推奨）
- CI/CDで画像サイズをチェック

---

## 6. アクセシビリティ問題

### 6-1. スクリーンリーダー対応不足

#### 症状
```
Lighthouse Accessibility: 80点
NVDA/JAWSで正しく読み上げられない
```

#### 原因
- ARIA属性が不足
- alt属性が不足
- スキップリンクが未実装

#### 解決手順

**ステップ1: スキップリンクの追加**

Phase 4-2で実装済みのパターンを適用：

```astro
<!-- DocLayout.astro -->
<body>
  <a href="#main-content" class="skip-link">メインコンテンツへスキップ</a>

  <div class="layout">
    <main class="content-container" id="main-content">
      <slot />
    </main>
  </div>
</body>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 0.75rem 1rem;
  background-color: var(--color-bg-accent, #0066cc);
  color: var(--color-text-inverse, #ffffff);
  text-decoration: none;
  font-weight: 600;
  z-index: 1000;
}

.skip-link:focus {
  top: 0;
}
</style>
```

**ステップ2: ARIA属性の追加**

```html
<!-- ナビゲーション -->
<nav aria-label="メインナビゲーション">
  <ul>
    <li><a href="/">ホーム</a></li>
  </ul>
</nav>

<!-- サイドバー -->
<aside aria-label="サイドバーナビゲーション">
  <!-- ... -->
</aside>

<!-- 検索 -->
<form role="search" aria-label="サイト内検索">
  <input type="search" aria-label="検索キーワード">
</form>
```

**ステップ3: 画像のalt属性**

```html
<!-- 装飾的な画像 -->
<img src="decoration.png" alt="" role="presentation">

<!-- 意味のある画像 -->
<img src="diagram.png" alt="システムアーキテクチャ図">
```

#### 予防策
- CI/CDでアクセシビリティテストを自動化（axe、Lighthouse）
- WCAG 2.1 AA基準を遵守
- スクリーンリーダーでの定期テスト

#### 関連リンク
- [Phase 4-2 アクセシビリティ完了レポート](../status/phase-4-2-accessibility-i18n-lighthouse-completion-report.md)
- [WCAG 2.1 ガイドライン](https://www.w3.org/WAI/WCAG21/quickref/)

---

### 6-2. コントラスト比不足

#### 症状
```
Lighthouse Accessibility: 要素のコントラスト比が不十分
```

#### 原因
- テキストと背景色のコントラスト比が4.5:1未満
- テーマシステムのカラーパレットが不適切

#### 解決手順

**ステップ1: コントラスト比の測定**

ブラウザの開発者ツール（Chrome/Edge）で確認：

1. 要素を選択
2. 「Styles」タブで色を確認
3. コントラスト比が表示される

**ステップ2: カラーパレットの調整**

```css
/* packages/theme/src/tokens/colors.css */
:root {
  /* 文字色（暗い背景の場合） */
  --color-text: #ffffff;
  --color-bg: #1a1a1a;
  /* コントラスト比: 15.8:1 ✅ */

  /* リンク色 */
  --color-link: #4da6ff;
  --color-link-hover: #66b3ff;
  /* コントラスト比: 7.2:1 ✅ */
}
```

**ステップ3: 自動チェックの導入**

```bash
# pa11y-ciでコントラスト比をチェック
pnpm add -D pa11y-ci

# 実行
pa11y-ci http://localhost:4321/docs/demo-docs/v1/en/
```

#### 予防策
- デザインシステムでコントラスト比を標準化
- CI/CDでコントラスト比チェックを自動化
- WCAG 2.1 AA基準（4.5:1）を遵守

---

### 6-3. キーボードナビゲーション問題

#### 症状
```
Tabキーで要素にフォーカスできない
Enterキーでリンクが動作しない
```

#### 原因
- `tabindex`が不正
- JavaScriptイベントリスナーがキーボードイベントを処理していない
- フォーカススタイルが不足

#### 解決手順

**ステップ1: フォーカス可能要素の確認**

```html
<!-- 正しい実装 -->
<button type="button">クリック</button>
<a href="/path">リンク</a>

<!-- 誤った実装 -->
<div onclick="...">クリック</div> <!-- tabindexなし -->
<span onclick="...">リンク</span> <!-- セマンティクスが不正 -->
```

**ステップ2: tabindexの適切な使用**

```html
<!-- tabindex="0": 自然なタブオーダーに追加 -->
<div tabindex="0" role="button" onclick="...">カスタムボタン</div>

<!-- tabindex="-1": プログラム的にフォーカス可能 -->
<div tabindex="-1" id="skip-target">スキップ先</div>

<!-- tabindex="1"以上: 使用しない（タブオーダーが複雑になる） -->
```

**ステップ3: フォーカススタイルの追加**

```css
/* 明確なフォーカススタイル */
*:focus {
  outline: 2px solid var(--color-focus, #ff6b00);
  outline-offset: 2px;
}

/* フォーカス時のスタイルを削除しない */
*:focus {
  outline: none; /* ❌ 絶対にしない */
}
```

#### 予防策
- セマンティックHTMLを使用（`<button>`、`<a>`等）
- カスタムコンポーネントは必ずキーボードテスト
- CI/CDでキーボードナビゲーションをテスト

---

## 7. 国際化問題

### 7-1. 翻訳表示エラー

#### 症状
```
日本語版でも英語が表示される
メタディスクリプションが英語のまま
```

#### 原因
- レジストリの多言語フィールドが不正
- 言語検出ロジックが動作していない
- フォールバックが機能していない

#### 解決手順

**ステップ1: レジストリの多言語フィールド確認**

Phase 4-1のスキーマ統一後の標準形式：

```json
{
  "title": {
    "en": "Getting Started",
    "ja": "はじめに"
  },
  "summary": {
    "en": "Quick start guide",
    "ja": "クイックスタートガイド"
  },
  "description": {
    "en": "Learn how to get started",
    "ja": "使い始め方を学ぶ"
  }
}
```

**ステップ2: 言語別テキスト取得ロジックの実装**

Phase 4-2で確立されたパターン：

```typescript
// 多言語対応ヘルパー関数
const getLocalizedText = (text: any, lang: string): string => {
  if (typeof text === 'object' && text !== null) {
    return text[lang] || text['en'] || '';
  }
  return String(text || '');
};

// 使用例
const localizedTitle = getLocalizedText(doc.title, 'ja');
const localizedSummary = getLocalizedText(doc.summary, 'ja');
```

**ステップ3: フォールバック確認**

```typescript
// フォールバック順序: 現在の言語 → 英語 → 空文字列
const getText = (textObj: any, lang: string): string => {
  if (typeof textObj === 'object' && textObj !== null) {
    return textObj[lang] || textObj['en'] || '';
  }
  return String(textObj || '');
};
```

#### 予防策
- レジストリ編集時に多言語オブジェクト形式を使用
- CI/CDで翻訳カバレッジをチェック
- 言語別のE2Eテストを実施

#### 関連リンク
- [Phase 4-2 アクセシビリティ完了レポート](../status/phase-4-2-accessibility-i18n-lighthouse-completion-report.md)
- [国際化ガイド](../../packages/i18n/README.md)

---

### 7-2. 言語切替失敗

#### 症状
```
言語切替ボタンをクリックしても変わらない
URLは変わるがコンテンツは変わらない
```

#### 原因
- ルーティング設定が不正
- 言語パラメータが取得できていない
- キャッシュが古い

#### 解決手順

**ステップ1: ルーティング設定の確認**

```bash
# Astroページファイルのパスパラメータを確認
cat apps/demo-docs/src/pages/[version]/[lang]/[...slug].astro | head -20
```

**期待されるコード**:
```astro
---
export async function getStaticPaths() {
  const paths = [];

  for (const version of versions) {
    for (const lang of languages) {
      for (const doc of documents) {
        paths.push({
          params: {
            version: version.id,
            lang: lang,
            slug: doc.slug,
          },
          props: { doc, version, lang },
        });
      }
    }
  }

  return paths;
}
---
```

**ステップ2: 言語切替コンポーネントの確認**

```astro
---
// LanguageSelector.astro
const { currentLang, availableLangs, currentPath } = Astro.props;

// 言語切替URLの生成
const getLanguageUrl = (lang: string) => {
  // /v1/en/getting-started → /v1/ja/getting-started
  return currentPath.replace(`/${currentLang}/`, `/${lang}/`);
};
---

<select onchange="location.href = this.value">
  {availableLangs.map(lang => (
    <option value={getLanguageUrl(lang)} selected={lang === currentLang}>
      {lang}
    </option>
  ))}
</select>
```

**ステップ3: ブラウザキャッシュのクリア**

```bash
# プレビューサーバーを再起動
pnpm preview

# ハードリロード（Ctrl+Shift+R / Cmd+Shift+R）
```

#### 予防策
- 言語切替ロジックをユニットテスト
- CI/CDで言語別ページの存在を確認
- ブラウザの開発者ツールでNetworkタブを確認

---

### 7-3. RTL言語表示問題

#### 症状
```
アラビア語版で左から右に表示される
レイアウトが崩れる
```

#### 原因
- `dir="rtl"`属性が未設定
- CSS flexbox/gridの方向が固定
- RTL対応のスタイルが不足

#### 解決手順

**ステップ1: HTML lang/dir属性の設定**

```astro
---
const isRTL = ['ar', 'he', 'fa'].includes(lang);
---

<html lang={lang} dir={isRTL ? 'rtl' : 'ltr'}>
```

**ステップ2: CSS論理プロパティの使用**

```css
/* 物理プロパティ（非推奨） */
.element {
  margin-left: 1rem;  /* ❌ RTL対応していない */
  padding-right: 2rem; /* ❌ RTL対応していない */
}

/* 論理プロパティ（推奨） */
.element {
  margin-inline-start: 1rem;  /* ✅ RTL自動対応 */
  padding-inline-end: 2rem;    /* ✅ RTL自動対応 */
}
```

**ステップ3: RTL専用スタイルの追加**

```css
/* RTL言語用のスタイル */
[dir="rtl"] .sidebar {
  left: auto;
  right: 0;
}

[dir="rtl"] .arrow-icon {
  transform: scaleX(-1); /* アイコンを反転 */
}
```

#### 予防策
- CSS論理プロパティを標準使用
- RTL言語でのE2Eテスト
- デザインシステムでRTL対応を標準化

#### 関連リンク
- [CSS論理プロパティ](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_Logical_Properties)

---

## 8. レジストリ問題

### 8-1. レジストリ破損

#### 症状
```
Error: Invalid JSON
SyntaxError: Unexpected token
```

#### 原因
- JSONファイルの構文エラー
- 手動編集時のミス
- ファイルの一部が破損

#### 解決手順

**ステップ1: JSON構文の検証**

```bash
# jqでJSON検証
cat registry/demo-docs.json | jq '.'

# 構文エラーの場所を特定
cat registry/demo-docs.json | jq '.' 2>&1
```

**ステップ2: バックアップからの復元**

```bash
# 最新のバックアップを確認
ls -lat .backups/registry-demo-docs-*.json | head -5

# バックアップから復元
cp .backups/registry-demo-docs-20251025120000.json registry/demo-docs.json

# バリデーション
docs-gen validate
```

**ステップ3: 差分の確認**

```bash
# バックアップと現在のファイルを比較
diff .backups/registry-demo-docs-20251025120000.json registry/demo-docs.json
```

#### 予防策
- レジストリ編集前に必ずバックアップ
- `docs-gen`コマンドを使用して編集（手動編集を避ける）
- Git経由でバージョン管理

#### 関連リンク
- [レジストリガイド](./registry.md)

---

### 8-2. レジストリ競合

#### 症状
```
Git conflict in registry/demo-docs.json
Error: Merge conflict
```

#### 原因
- 複数の担当者が同時にレジストリを編集
- Gitマージ時の競合

#### 解決手順

**ステップ1: 競合箇所の確認**

```bash
# 競合ファイルの表示
git status
git diff registry/demo-docs.json
```

**ステップ2: 競合の解決方法（オプション1: 手動マージ）**

```bash
# エディタで競合マーカーを編集
vim registry/demo-docs.json

# 競合マーカーの例
<<<<<<< HEAD
  "title": "Getting Started Guide"
=======
  "title": "クイックスタートガイド"
>>>>>>> feature-branch

# 両方を統合（多言語オブジェクト形式に変更）
  "title": {
    "en": "Getting Started Guide",
    "ja": "クイックスタートガイド"
  }
```

**ステップ3: 競合の解決方法（オプション2: 片方を採用）**

```bash
# 自分の変更を優先
git checkout --ours registry/demo-docs.json

# または相手の変更を優先
git checkout --theirs registry/demo-docs.json
```

**ステップ4: バリデーションと確定**

```bash
# JSON検証
cat registry/demo-docs.json | jq '.'

# レジストリバリデーション
docs-gen validate

# Git add and commit
git add registry/demo-docs.json
git commit -m "resolve: merge conflict in registry"
```

#### 予防策
- レジストリ編集前にプルリクエストを確認
- 編集範囲を分割（プロジェクトごと、バージョンごと）
- 定期的に`git pull`してリモートと同期

---

### 8-3. レジストリのパフォーマンス問題

#### 症状
```
レジストリの読み込みが遅い（10秒以上）
メモリ使用量が増加
```

#### 原因
- レジストリファイルが大きすぎる（10MB以上）
- プロジェクト数・ドキュメント数が多すぎる
- 非効率なデータ構造

#### 解決手順

**ステップ1: レジストリサイズの確認**

```bash
# レジストリファイルサイズを確認
ls -lh registry/*.json
du -sh registry/
```

**推奨サイズ**: 1プロジェクトあたり1MB以下

**ステップ2: レジストリの分割**

```bash
# プロジェクトごとにレジストリを分割
# registry/all-projects.json
# ↓
# registry/demo-docs.json
# registry/sample-docs.json
# registry/project-template.json
```

**ステップ3: 不要なフィールドの削除**

```bash
# レジストリから不要なフィールドを削除
# 例: $schema フィールド（バリデーション用のみ）
cat registry/demo-docs.json | jq 'del(."$schema")' > registry/demo-docs-clean.json
```

#### 予防策
- レジストリサイズを定期的に監視
- プロジェクトを適切に分割（1プロジェクト500ドキュメント以下）
- draft/deprecatedコンテンツを定期的にアーカイブ

---

## 9. バックアップ・リストア問題

### 9-1. バックアップ作成失敗

#### 症状
```
Error: Failed to create backup
Warning: Backup directory is full
```

#### 原因
- ディスク容量不足
- バックアップディレクトリの書き込み権限がない
- 既存バックアップファイルとの競合

#### 解決手順

**ステップ1: ディスク容量の確認**

```bash
# ディスク使用量確認
df -h

# .backupsディレクトリのサイズ確認
du -sh .backups/
```

**ステップ2: 古いバックアップの削除**

```bash
# 30日以上前のバックアップを削除
find .backups/ -name "registry-*.json" -mtime +30 -delete

# または手動で削除
rm .backups/registry-demo-docs-20250101*.json
```

**ステップ3: バックアップディレクトリの権限確認**

```bash
# 権限確認
ls -ld .backups/

# 権限修正
chmod 755 .backups/
```

#### 予防策
- バックアップの自動削除ポリシーを設定（30日保持）
- 外部ストレージへの定期バックアップ
- ディスク容量の定期監視

---

### 9-2. リストア失敗

#### 症状
```
Error: Cannot restore from backup
Error: Backup file is corrupted
```

#### 原因
- バックアップファイルが破損
- バックアップファイルが見つからない
- タイムスタンプが不正

#### 解決手順

**ステップ1: バックアップファイルの検証**

```bash
# JSONとして有効かチェック
cat .backups/registry-demo-docs-20251025120000.json | jq '.'

# ファイルサイズ確認（0バイトでないか）
ls -lh .backups/registry-demo-docs-20251025120000.json
```

**ステップ2: 別のバックアップから復元**

```bash
# 利用可能なバックアップを一覧表示
ls -lat .backups/registry-demo-docs-*.json | head -10

# 2番目に新しいバックアップから復元
cp .backups/registry-demo-docs-20251025110000.json registry/demo-docs.json
```

**ステップ3: Gitからの復元（最終手段）**

```bash
# Gitの履歴から復元
git log --oneline registry/demo-docs.json

# 特定のコミットから復元
git checkout <commit-hash> registry/demo-docs.json
```

#### 予防策
- 重要な操作前に複数のバックアップを作成
- 外部ストレージに定期的にバックアップをコピー
- Gitでバージョン管理を徹底

---

### 9-3. バックアップの自動化失敗

#### 症状
```
Cron job failed
Backup script not running
```

#### 原因
- cronジョブの設定ミス
- スクリプトの実行権限がない
- 環境変数が読み込まれていない

#### 解決手順

**ステップ1: cronジョブの確認**

```bash
# cronジョブの一覧表示
crontab -l

# 期待されるエントリ
0 2 * * * /path/to/libx-dev/scripts/backup-registry.sh
```

**ステップ2: バックアップスクリプトの確認**

```bash
# スクリプトの存在確認
ls -la scripts/backup-registry.sh

# 実行権限の確認
chmod +x scripts/backup-registry.sh

# 手動実行でテスト
./scripts/backup-registry.sh
```

**ステップ3: ログの確認**

```bash
# cronログの確認（システムによって場所が異なる）
# Linux
tail -f /var/log/cron

# macOS
tail -f /var/log/system.log | grep cron
```

#### 予防策
- バックアップスクリプトをテスト実行
- cronログを定期的に確認
- CI/CDでバックアップを自動化

---

## エスカレーション

### いつエスカレーションすべきか

以下の状況では、速やかにテックリードまたはプロダクトオーナーにエスカレーションしてください：

1. **重大な障害**
   - 本番環境でビルドが失敗
   - データ損失の可能性
   - セキュリティインシデント

2. **複雑な技術的問題**
   - 本ガイドに記載のない問題
   - 複数の問題が連鎖している
   - 解決に8時間以上かかる見込み

3. **ビジネスへの影響**
   - ユーザーがサイトにアクセスできない
   - 検索機能が完全に停止
   - パフォーマンスが著しく低下（50%以上）

### エスカレーション手順

**ステップ1: 情報の整理**

以下の情報を準備してください：

- エラーメッセージの全文
- 再現手順
- 試した解決策と結果
- 影響範囲（ユーザー数、プロジェクト数など）
- 緊急度（Low / Medium / High / Critical）

**ステップ2: エスカレーション先の選択**

| 問題の種類 | エスカレーション先 |
|-----------|------------------|
| ビルド・デプロイ問題 | インフラ担当 |
| CLI・レジストリ問題 | テックリード |
| アクセシビリティ問題 | フロントエンド担当 |
| 国際化問題 | コンテンツリード |
| セキュリティ問題 | セキュリティチーム |
| 本番障害 | プロダクトオーナー + テックリード |

**ステップ3: 連絡方法**

- **緊急（本番障害）**: 電話 + Slack #incidents チャンネル
- **高優先度**: Slack DM + GitHub Issue
- **通常**: GitHub Issue + 次回ミーティングで報告

### エスカレーション後のフォロー

1. **ドキュメントの更新**: 解決後は本ガイドに追記
2. **ポストモーテム**: 重大な障害の場合は振り返りを実施
3. **予防策の実装**: 再発防止策をCI/CDに組み込む

---

## 付録

### A. よく使うコマンド一覧

```bash
# ビルド
pnpm build                    # 統合ビルド
pnpm build:local              # ローカルビルド
cd apps/demo-docs && pnpm build  # 個別ビルド

# テスト
pnpm test                     # 全テスト実行
pnpm test:coverage            # カバレッジ測定
pnpm lint                     # Lint実行

# CLI
docs-gen init                 # 初期化
docs-gen validate             # レジストリバリデーション
docs-gen list                 # プロジェクト一覧
docs-gen add project <id>     # プロジェクト追加
docs-gen add doc <id>         # ドキュメント追加

# デバッグ
docs-gen <command> --verbose  # 詳細ログ
docs-gen <command> --dry-run  # 実行前確認

# バックアップ
docs-gen backup               # バックアップ作成
docs-gen restore <timestamp>  # リストア
```

### B. エラーコード一覧

| コード | 説明 | 対応セクション |
|--------|------|---------------|
| E001 | レジストリスキーマエラー | [1-1](#1-1-レジストリスキーマエラー) |
| E002 | 依存関係エラー | [1-2](#1-2-依存関係エラー) |
| E003 | TypeScriptコンパイルエラー | [1-3](#1-3-typescriptコンパイルエラー) |
| E101 | CLI実行エラー | [2-1](#2-1-コマンド実行エラー) |
| E102 | バリデーションエラー | [2-2](#2-2-バリデーションエラー) |
| E201 | デプロイエラー | [3-1](#3-1-cloudflare-pagesビルドエラー) |
| E301 | Pagefindエラー | [4-1](#4-1-pagefindインデックス生成失敗) |
| E401 | パフォーマンス問題 | [5-1](#5-1-lighthouseスコア低下) |
| E501 | アクセシビリティエラー | [6-1](#6-1-スクリーンリーダー対応不足) |
| E601 | 国際化エラー | [7-1](#7-1-翻訳表示エラー) |
| E701 | レジストリ破損 | [8-1](#8-1-レジストリ破損) |
| E801 | バックアップエラー | [9-1](#9-1-バックアップ作成失敗) |

### C. チェックリスト

#### 問題発生時のチェックリスト

- [ ] エラーメッセージを全文記録
- [ ] 環境を確認（Node.js、pnpmバージョン）
- [ ] クリーンビルドを試行
- [ ] 詳細ログで実行（--verboseオプション）
- [ ] 本ガイドで該当する問題を検索
- [ ] 解決策を実施
- [ ] 動作確認
- [ ] 予防策を実施
- [ ] （必要に応じて）エスカレーション

#### デプロイ前チェックリスト

- [ ] ローカルビルドが成功
- [ ] 全テストが成功
- [ ] Lighthouseスコアが基準値以上
- [ ] レジストリバリデーションが成功
- [ ] バックアップを作成
- [ ] ステージング環境でテスト
- [ ] ドキュメント更新（必要に応じて）

---

## 更新履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|------|----------|---------|--------|
| 2025-10-25 | 1.0.0 | 初版作成 | Claude (Phase 4-2) |

---

**このガイドに関する質問・フィードバック**:
- GitHub Issue: [libx-dev/issues](https://github.com/your-org/libx-dev/issues)
- Slack: #docs-support チャンネル
