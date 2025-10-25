# ビルド・デプロイ運用ガイド

このガイドは、新ドキュメントサイトジェネレーターのビルド・デプロイに関する運用手順を包括的に説明します。

## 目次

- [前提条件](#前提条件)
- [ローカルビルド](#ローカルビルド)
- [統合ビルド](#統合ビルド)
- [デプロイ前チェックリスト](#デプロイ前チェックリスト)
- [Cloudflare Pagesデプロイ](#cloudflare-pagesデプロイ)
- [デプロイ後確認](#デプロイ後確認)
- [ロールバック手順](#ロールバック手順)
- [トラブルシューティング](#トラブルシューティング)
- [エスカレーション](#エスカレーション)

---

## 前提条件

### 必要な環境

- **Node.js**: v18.0.0以上
- **pnpm**: v8.0.0以上
- **Git**: v2.30.0以上

### 環境セットアップ確認

```bash
# Node.jsバージョン確認
node --version  # v18.0.0以上であることを確認

# pnpmバージョン確認
pnpm --version  # v8.0.0以上であることを確認

# Gitバージョン確認
git --version   # v2.30.0以上であることを確認
```

### 依存関係インストール

```bash
# モノレポルートで実行
cd /path/to/libx-dev
pnpm install
```

**確認ポイント**:
- ✅ `node_modules`ディレクトリが作成されている
- ✅ エラーメッセージが表示されていない
- ✅ 全パッケージがインストールされている

---

## ローカルビルド

ローカルビルドは、開発・検証用途で個別のプロジェクトをビルドする際に使用します。

### 個別プロジェクトのビルド

#### demo-docsのビルド

```bash
# demo-docsディレクトリへ移動
cd apps/demo-docs

# ビルド実行
pnpm build
```

**ビルド成果物**:
- 出力先: `apps/demo-docs/dist/`
- 構造: `v1/en/`, `v1/ja/`

**確認コマンド**:
```bash
# ビルド成果物の確認
ls -la dist/
ls -la dist/v1/en/
ls -la dist/v1/ja/
```

#### sample-docsのビルド

```bash
# sample-docsディレクトリへ移動
cd apps/sample-docs

# ビルド実行
pnpm build
```

**ビルド成果物**:
- 出力先: `apps/sample-docs/dist/`
- 構造: `docs/sample-docs/v1/en/`, `docs/sample-docs/v1/ja/`, `docs/sample-docs/v2/en/`

**確認コマンド**:
```bash
# ビルド成果物の確認
ls -la dist/
ls -la dist/docs/sample-docs/v1/en/
ls -la dist/docs/sample-docs/v1/ja/
ls -la dist/docs/sample-docs/v2/en/
```

### ローカルプレビュー

ビルド後、ローカルでプレビューサーバーを起動して動作確認します。

```bash
# プレビューサーバー起動
pnpm preview

# カスタムポート指定
pnpm preview --port 4322
```

**アクセスURL**:
- demo-docs: `http://localhost:4321/v1/en/getting-started/`
- sample-docs: `http://localhost:4322/docs/sample-docs/v1/en/`

**確認ポイント**:
- ✅ ページが正しく表示される
- ✅ ナビゲーションが動作する
- ✅ サイドバーが表示される
- ✅ 検索機能が動作する（sample-docsのみ）
- ✅ 言語切替が動作する
- ✅ バージョン切替が動作する（sample-docsのみ）

---

## 統合ビルド

統合ビルドは、本番環境向けに全プロジェクトを統合してビルドする際に使用します。

### 統合ビルドの実行

#### 方法1: 統合ビルドスクリプト使用（推奨）

```bash
# モノレポルートで実行
pnpm build
```

**実行内容**:
1. 各プロジェクト（demo-docs、sample-docs等）を個別にビルド
2. ビルド成果物を統一された`dist/`ディレクトリにコピー
3. パスプレフィックスを処理

**成果物の構造**:
```
dist/
├── v1/                    # demo-docs (ルートに配置)
│   ├── en/
│   └── ja/
└── docs/
    └── sample-docs/       # sample-docs
        ├── v1/
        │   ├── en/
        │   └── ja/
        └── v2/
            └── en/
```

#### 方法2: 選択的ビルド

特定のプロジェクトのみをビルドする場合:

```bash
# 対話式で選択
pnpm build:selective

# 選択肢から該当プロジェクトを選択
# - demo-docs
# - sample-docs
# - (その他のプロジェクト)
```

### ローカル開発用ビルド

ベースパスなしでローカル開発用にビルドする場合:

```bash
# ローカル開発ビルド
pnpm build:local

# 選択的ローカルビルド
pnpm build:selective:local
```

**違い**:
- `pnpm build`: ベースパス `/docs/[project]/` が適用される
- `pnpm build:local`: ベースパスなし（ルートから配信）

### サイドバーJSON生成

ビルド前にサイドバーJSONファイルを生成する必要があります:

```bash
# 全プロジェクトのサイドバー生成
pnpm build:sidebar

# 選択的サイドバー生成
pnpm build:sidebar-selective
```

**成果物**:
- `apps/[project]/src/generated/sidebar-[version]-[lang].json`

**確認コマンド**:
```bash
# サイドバーJSONの確認
ls -la apps/demo-docs/src/generated/
cat apps/demo-docs/src/generated/sidebar-v1-en.json
```

### 完全なデプロイパイプライン

サイドバー生成 → ビルド → コピーを一括実行:

```bash
# 完全パイプライン
pnpm build:deploy

# 選択的パイプライン
pnpm build:deploy-selective
```

**実行内容**:
1. サイドバーJSON生成
2. 統合ビルド
3. `../libx/`へのコピー（外部リポジトリ連携用）

---

## デプロイ前チェックリスト

デプロイ前に以下の項目を確認してください。

### 1. ビルド確認

- [ ] **ビルドエラーなし**: `pnpm build` がエラーなく完了
- [ ] **警告メッセージ確認**: 重大な警告がないことを確認
- [ ] **成果物サイズ**: `dist/`のサイズが妥当（目安: 10MB以下）
- [ ] **HTMLファイル生成**: 全ページのHTMLファイルが生成されている

```bash
# ビルドサイズ確認
du -sh dist/

# HTMLファイル数確認
find dist/ -name "*.html" | wc -l
```

### 2. サイドバーJSON確認

- [ ] **全バージョン・全言語**: サイドバーJSONが存在する
- [ ] **JSON構文**: 全ファイルが有効なJSON形式
- [ ] **カテゴリ構造**: カテゴリとドキュメントが正しく配置されている

```bash
# サイドバーJSON存在確認
ls -la apps/demo-docs/src/generated/

# JSON構文チェック
for file in apps/demo-docs/src/generated/*.json; do
  echo "Checking $file..."
  jq . "$file" > /dev/null && echo "✅ Valid JSON" || echo "❌ Invalid JSON"
done
```

### 3. Pagefindインデックス確認

- [ ] **インデックス生成**: `dist/pagefind/` ディレクトリが存在（sample-docsのみ）
- [ ] **インデックスサイズ**: 500KB以下（目安）
- [ ] **検索ファイル数**: 10ファイル以上

```bash
# Pagefindインデックス確認（sample-docs）
ls -la apps/sample-docs/dist/pagefind/
du -sh apps/sample-docs/dist/pagefind/
```

### 4. レジストリバリデーション

- [ ] **スキーマ検証**: レジストリが最新スキーマに準拠
- [ ] **必須フィールド**: 全プロジェクトに必須フィールドが存在
- [ ] **多言語フィールド**: `title`, `description`が多言語オブジェクト形式

```bash
# レジストリバリデーション
pnpm docs-cli validate
```

### 5. ローカルプレビュー確認

- [ ] **全ページアクセス可能**: 404エラーがない
- [ ] **ナビゲーション動作**: サイドバー、ヘッダー、フッターが機能
- [ ] **検索機能**: Pagefind検索が動作（sample-docsのみ）
- [ ] **言語切替**: 言語切替UIが動作
- [ ] **バージョン切替**: バージョン切替UIが動作（複数バージョンの場合）

```bash
# プレビューサーバー起動
cd apps/sample-docs
pnpm preview --port 4322

# ブラウザでアクセス
# http://localhost:4322/docs/sample-docs/v1/en/
```

### 6. Lighthouseスコア確認

- [ ] **Performance**: 90以上
- [ ] **Accessibility**: 95以上
- [ ] **Best Practices**: 90以上
- [ ] **SEO**: 90以上

```bash
# Lighthouse測定（モバイル）
lighthouse http://localhost:4322/docs/sample-docs/v1/en/ \
  --output=html \
  --output-path=lighthouse-report-mobile.html \
  --screenEmulation.mobile=true \
  --quiet \
  --chrome-flags="--headless"

# Lighthouse測定（デスクトップ）
lighthouse http://localhost:4322/docs/sample-docs/v1/en/ \
  --output=html \
  --output-path=lighthouse-report-desktop.html \
  --preset=desktop \
  --quiet \
  --chrome-flags="--headless"
```

### 7. Git確認

- [ ] **コミット完了**: 全変更がコミットされている
- [ ] **プッシュ完了**: リモートリポジトリに反映されている
- [ ] **ブランチ確認**: デプロイ対象のブランチが正しい

```bash
# Gitステータス確認
git status

# 未コミット変更がないことを確認
git diff

# リモートと同期していることを確認
git log origin/main..HEAD  # 空であること
```

### 8. CI/CDステータス確認

- [ ] **CI成功**: GitHub Actionsが全て成功
- [ ] **テスト成功**: 全テストが成功
- [ ] **Lighthouseスコア**: CI/CDでのLighthouseスコアが閾値を満たしている

```bash
# GitHub ActionsのステータスをWebで確認
# https://github.com/<user>/<repo>/actions
```

---

## Cloudflare Pagesデプロイ

Cloudflare Pagesへのデプロイ手順を説明します。

### 事前準備

#### 1. Cloudflare Pagesプロジェクト作成

Cloudflare Dashboardで新規プロジェクトを作成します。

**手順**:
1. Cloudflare Dashboardにログイン
2. `Workers & Pages` → `Pages` → `Create a project`
3. GitHubリポジトリを接続
4. ビルド設定を入力

**ビルド設定**:
- Build command: `pnpm build`
- Build output directory: `dist`
- Root directory: `/`
- Node.js version: `18`

#### 2. 環境変数設定

必要に応じて環境変数を設定します。

**設定例**:
- `NODE_VERSION`: `18`
- `PNPM_VERSION`: `8`

### デプロイ方法

#### 方法1: GitHub連携による自動デプロイ（推奨）

GitHubリポジトリにプッシュすると、Cloudflare Pagesが自動的にビルド・デプロイを実行します。

**手順**:
1. 変更をコミット
2. GitHubにプッシュ
3. Cloudflare PagesがWebhookを受信して自動ビルド開始
4. ビルド完了後、自動デプロイ

**確認**:
- Cloudflare Dashboard → `Workers & Pages` → `[Project Name]` → `Deployments`
- ビルドステータスを確認

#### 方法2: Wranglerコマンドによる手動デプロイ

手動でデプロイする場合は、Wranglerコマンドを使用します。

**事前準備**:
```bash
# Wranglerインストール
pnpm add -g wrangler

# Cloudflareログイン
wrangler login
```

**デプロイ実行**:
```bash
# ビルド実行
pnpm build

# デプロイ実行
pnpm deploy:pages
```

**デプロイスクリプト** (`package.json`):
```json
{
  "scripts": {
    "deploy:pages": "wrangler pages deploy dist"
  }
}
```

### デプロイログ確認

デプロイ中は、Cloudflare Dashboardでリアルタイムログを確認できます。

**確認方法**:
1. Cloudflare Dashboard → `Workers & Pages` → `[Project Name]`
2. `Deployments` タブ → 最新のデプロイをクリック
3. `Build log` を確認

**重要なログメッセージ**:
- ✅ `Build succeeded!` - ビルド成功
- ✅ `Deployment complete!` - デプロイ完了
- ❌ `Build failed` - ビルド失敗（エラーログを確認）

---

## デプロイ後確認

デプロイ完了後、以下の項目を確認してください。

### 1. 基本動作確認

#### アクセス確認

```bash
# 本番URLにアクセス
# https://[project-name].pages.dev/
```

**確認ポイント**:
- [ ] **トップページ表示**: トップページが正しく表示される
- [ ] **各言語ページ**: 英語版・日本語版が正しく表示される
- [ ] **各バージョンページ**: 全バージョンが正しく表示される

#### ナビゲーション確認

- [ ] **サイドバー**: カテゴリとドキュメントが正しく表示される
- [ ] **ヘッダー**: プロジェクト名、バージョン選択、言語選択が表示される
- [ ] **フッター**: 著作権情報が表示される
- [ ] **パンくずリスト**: 現在位置が正しく表示される

#### リンク確認

- [ ] **内部リンク**: サイト内リンクが正しく動作する
- [ ] **外部リンク**: 外部リンクが正しく動作する（新規タブで開く）
- [ ] **アンカーリンク**: ページ内アンカーが正しく動作する

### 2. 検索機能確認（sample-docsのみ）

- [ ] **検索UI表示**: 検索ボックスが表示される
- [ ] **検索実行**: キーワード入力で検索結果が表示される
- [ ] **検索結果**: 正しいページが検索結果に表示される
- [ ] **検索ハイライト**: 検索キーワードがハイライトされる

**確認コマンド**:
```bash
# ブラウザのDevToolsでPagefindインデックスを確認
# Network タブ → pagefind.js の読み込みを確認
# Console タブ → エラーがないことを確認
```

### 3. パフォーマンス確認

#### Lighthouseスコア測定

```bash
# 本番URLでLighthouse測定
lighthouse https://[project-name].pages.dev/docs/sample-docs/v1/en/ \
  --output=html \
  --output-path=lighthouse-production.html \
  --quiet \
  --chrome-flags="--headless"
```

**目標スコア**:
- Performance: 90以上
- Accessibility: 95以上
- Best Practices: 90以上
- SEO: 90以上

#### Core Web Vitals確認

- [ ] **FCP (First Contentful Paint)**: 1.8秒以下
- [ ] **LCP (Largest Contentful Paint)**: 2.5秒以下
- [ ] **TBT (Total Blocking Time)**: 200ms以下
- [ ] **CLS (Cumulative Layout Shift)**: 0.1以下

### 4. アクセシビリティ確認

- [ ] **キーボードナビゲーション**: Tabキーでフォーカス移動できる
- [ ] **スキップリンク**: スキップリンクが機能する
- [ ] **スクリーンリーダー**: スクリーンリーダーで読み上げ可能
- [ ] **カラーコントラスト**: WCAG 2.1 AA基準を満たしている

### 5. 多言語対応確認

- [ ] **言語切替UI**: 言語切替ボタンが表示される
- [ ] **各言語ページ**: 全言語でページが正しく表示される
- [ ] **メタタグ**: `lang`属性、`hreflang`タグが正しく設定されている
- [ ] **メタディスクリプション**: 各言語で正しいメタディスクリプションが表示される

**確認コマンド**:
```bash
# HTMLソースを確認
curl -s https://[project-name].pages.dev/docs/sample-docs/v1/en/ | grep -o '<html lang="[^"]*"'
curl -s https://[project-name].pages.dev/docs/sample-docs/v1/ja/ | grep -o '<html lang="[^"]*"'
```

### 6. SEO確認

- [ ] **titleタグ**: 各ページに適切なタイトルが設定されている
- [ ] **meta description**: 各ページに適切なメタディスクリプションが設定されている
- [ ] **OGPタグ**: Open Graphタグが設定されている（オプション）
- [ ] **sitemap.xml**: サイトマップが生成されている（オプション）
- [ ] **robots.txt**: robots.txtが設定されている（オプション）

### 7. エラーページ確認

- [ ] **404ページ**: 存在しないURLで404ページが表示される
- [ ] **404ページデザイン**: 404ページが適切にデザインされている
- [ ] **404ページリンク**: 404ページからトップページへのリンクがある

**確認URL**:
```
https://[project-name].pages.dev/docs/sample-docs/v1/en/non-existent-page/
```

---

## ロールバック手順

デプロイ後に問題が発生した場合のロールバック手順です。

### 方法1: Cloudflare Dashboardでロールバック（推奨）

**手順**:
1. Cloudflare Dashboard → `Workers & Pages` → `[Project Name]`
2. `Deployments` タブを開く
3. ロールバック先のデプロイメントを選択
4. `Manage deployment` → `Rollback to this deployment` をクリック
5. 確認ダイアログで `Rollback` をクリック

**確認**:
- デプロイメントリストで、ロールバック先のデプロイメントが`Production`になっていることを確認

### 方法2: GitHubでrevertしてプッシュ

**手順**:
1. 問題のあるコミットを特定
2. Gitでrevert
3. GitHubにプッシュ
4. Cloudflare Pagesが自動的に再デプロイ

**実行例**:
```bash
# 問題のあるコミットを確認
git log --oneline -10

# コミットをrevert
git revert <commit-hash>

# リモートにプッシュ
git push origin main

# Cloudflare Pagesが自動的に再デプロイを開始
```

### ロールバック後の確認

- [ ] **本番URL確認**: ロールバック後のページが正しく表示される
- [ ] **機能確認**: ロールバック前と同様に機能が動作する
- [ ] **Lighthouseスコア**: パフォーマンスが維持されている

---

## トラブルシューティング

デプロイ中・デプロイ後に発生する一般的な問題と対処法です。

### ビルドエラー

#### エラー: `Build failed: Command failed with exit code 1`

**原因**:
- TypeScriptの型エラー
- ESLintエラー
- 依存関係の不足

**対処法**:
```bash
# ローカルでビルドを試行
pnpm build

# エラーメッセージを確認
# 型エラーの場合は修正
# 依存関係エラーの場合は pnpm install
```

#### エラー: `ENOENT: no such file or directory`

**原因**:
- ファイルパスが間違っている
- 生成されるべきファイルが存在しない

**対処法**:
```bash
# サイドバーJSONが存在するか確認
ls -la apps/demo-docs/src/generated/

# サイドバーJSONを再生成
pnpm build:sidebar
```

### デプロイエラー

#### エラー: `Deployment failed: Publish directory not found`

**原因**:
- ビルド出力ディレクトリ（`dist/`）が存在しない
- Cloudflare Pages設定が間違っている

**対処法**:
1. Cloudflare Dashboard → `Settings` → `Builds & deployments`
2. Build output directory が `dist` になっているか確認
3. ローカルでビルドして `dist/` が生成されるか確認

#### エラー: `Deployment failed: Build command returned non-zero exit code`

**原因**:
- ビルドコマンドが失敗している

**対処法**:
1. Cloudflare Dashboardでビルドログを確認
2. エラーメッセージに従って修正
3. ローカルで同じコマンド（`pnpm build`）を実行して再現確認

### ランタイムエラー

#### 問題: ページが404エラーになる

**原因**:
- ルーティング設定が間違っている
- ベースパスが間違っている

**対処法**:
```bash
# astro.config.mjsのbase設定を確認
cat apps/demo-docs/astro.config.mjs | grep -A 5 "base:"

# 期待値:
# base: '/docs/demo-docs/'  # sample-docsの場合
# base: '/'                 # demo-docsの場合
```

#### 問題: 検索機能が動作しない（sample-docsのみ）

**原因**:
- Pagefindインデックスが生成されていない
- Pagefind.jsが読み込まれていない

**対処法**:
```bash
# Pagefindインデックスが存在するか確認
ls -la apps/sample-docs/dist/pagefind/

# postbuildスクリプトが設定されているか確認
cat apps/sample-docs/package.json | grep -A 2 "postbuild"

# 期待値:
# "postbuild": "pagefind --site dist --glob \"**/*.html\""
```

#### 問題: スタイルが適用されていない

**原因**:
- CSSファイルのパスが間違っている
- ビルド時にCSSが生成されていない

**対処法**:
```bash
# ビルド出力にCSSファイルが存在するか確認
find dist/ -name "*.css"

# CSSファイルのパスを確認
cat dist/v1/en/getting-started/index.html | grep -o '<link rel="stylesheet"[^>]*>'
```

### パフォーマンス問題

#### 問題: Lighthouseスコアが低い（Performance < 90）

**原因**:
- 大きな画像ファイル
- JavaScriptバンドルサイズが大きい
- CSSが最適化されていない

**対処法**:
1. 画像を最適化（WebP形式、サイズ削減）
2. JavaScriptバンドルをコード分割
3. CSSをminify

```bash
# ビルド出力のサイズを確認
du -sh dist/
find dist/ -name "*.js" -exec ls -lh {} \;
find dist/ -name "*.css" -exec ls -lh {} \;
```

#### 問題: Lighthouseスコアが低い（Accessibility < 95）

**原因**:
- スキップリンクがない
- 見出し階層が正しくない
- カラーコントラストが不足

**対処法**:
1. スキップリンクを追加（DocLayout.astroで実装済み）
2. 見出し階層を修正
3. カラーコントラストを調整（`packages/theme`で設定）

---

## エスカレーション

問題が解決しない場合や、緊急対応が必要な場合のエスカレーション手順です。

### エスカレーションレベル

#### レベル1: セルフヘルプ

**対象**:
- 軽微な問題
- トラブルシューティングガイドで解決可能な問題

**対応時間**: 即座〜1時間

**手順**:
1. 本ガイドの[トラブルシューティング](#トラブルシューティング)セクションを確認
2. [FAQ](./faq.md)を確認
3. ローカルで再現して原因を特定

#### レベル2: チーム内相談

**対象**:
- セルフヘルプで解決しない問題
- 設定変更が必要な問題

**対応時間**: 1〜4時間

**手順**:
1. チームSlack/Chatで問題を共有
2. エラーメッセージ、再現手順、環境情報を添付
3. チームメンバーからのアドバイスを待つ

**テンプレート**:
```
【問題】
[問題の概要]

【エラーメッセージ】
[エラーメッセージ全文]

【再現手順】
1. [手順1]
2. [手順2]
3. [手順3]

【環境情報】
- Node.js: [バージョン]
- pnpm: [バージョン]
- OS: [OS名とバージョン]
- ブランチ: [ブランチ名]
- コミットハッシュ: [ハッシュ]

【試した対処法】
- [対処法1]
- [対処法2]
```

#### レベル3: 技術リード相談

**対象**:
- チーム内で解決しない問題
- アーキテクチャ変更が必要な問題
- セキュリティに関わる問題

**対応時間**: 4〜24時間

**手順**:
1. GitHubでIssueを作成
2. `priority: high` ラベルを追加
3. 技術リードにメンション
4. Slackで通知

**Issueテンプレート**:
```markdown
## 問題の概要
[問題の概要を記述]

## 再現手順
1. [手順1]
2. [手順2]
3. [手順3]

## 期待する動作
[期待する動作を記述]

## 実際の動作
[実際の動作を記述]

## エラーメッセージ
```
[エラーメッセージ全文]
```

## 環境情報
- Node.js: [バージョン]
- pnpm: [バージョン]
- OS: [OS名とバージョン]
- ブランチ: [ブランチ名]
- コミットハッシュ: [ハッシュ]

## 試した対処法
- [対処法1]
- [対処法2]

## 関連ドキュメント
- [関連ドキュメントへのリンク]

## スクリーンショット
[スクリーンショットがあれば添付]
```

#### レベル4: 緊急対応

**対象**:
- 本番環境で重大な問題が発生
- サービス停止の恐れがある問題
- セキュリティインシデント

**対応時間**: 即座

**手順**:
1. **即座にロールバック**: [ロールバック手順](#ロールバック手順)を実行
2. Slackの緊急チャンネルで通知
3. 技術リード・プロダクトマネージャーに電話連絡
4. インシデント報告書を作成

**インシデント報告テンプレート**:
```markdown
# インシデント報告書

## 基本情報
- **発生日時**: [YYYY-MM-DD HH:MM:SS]
- **検知者**: [名前]
- **影響範囲**: [影響を受けるページ/機能]
- **重大度**: Critical / High / Medium / Low

## 問題の概要
[問題の概要を記述]

## 影響
- **ユーザー影響**: [影響の有無と内容]
- **サービス停止時間**: [停止時間]

## 発生経緯
[問題が発生した経緯を時系列で記述]

## 対応内容
[実施した対応を時系列で記述]

## 根本原因
[問題の根本原因]

## 恒久対策
[今後の恒久対策]

## 関連Issue/PR
- [関連IssueやPRへのリンク]
```

### 連絡先

**チームSlack**: `#libx-dev-support`
**技術リード**: `@tech-lead`
**緊急連絡先**: [緊急連絡先情報]

---

## まとめ

本ガイドでは、ビルド・デプロイに関する以下の内容を説明しました：

- ✅ ローカルビルド手順
- ✅ 統合ビルド手順
- ✅ デプロイ前チェックリスト
- ✅ Cloudflare Pagesデプロイ手順
- ✅ デプロイ後確認項目
- ✅ ロールバック手順
- ✅ トラブルシューティング
- ✅ エスカレーション手順

**推奨事項**:
- デプロイ前チェックリストを必ず実行する
- ローカルでLighthouseスコアを測定する
- CI/CDが成功していることを確認する
- デプロイ後は必ず本番環境で動作確認する
- 問題が発生したら速やかにエスカレーションする

**関連ドキュメント**:
- [CLI運用ガイド](./cli-operations.md)
- [コンテンツ管理ガイド](./content-management.md)
- [FAQ](./faq.md)
- [トラブルシューティングガイド](./troubleshooting.md)

---

**作成日**: 2025-10-25
**最終更新**: 2025-10-25
**バージョン**: 1.0.0
