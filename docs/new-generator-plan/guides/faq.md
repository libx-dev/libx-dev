# FAQ（よくある質問）

このドキュメントは、新ドキュメントサイトジェネレーターに関するよくある質問と回答をまとめています。

## 目次

- [レジストリ関連](#レジストリ関連)
- [CLI関連](#cli関連)
- [ビルド関連](#ビルド関連)
- [翻訳関連](#翻訳関連)
- [互換レイヤー](#互換レイヤー)
- [デプロイ関連](#デプロイ関連)
- [パフォーマンス関連](#パフォーマンス関連)

---

## レジストリ関連

### Q1: レジストリスキーマのバージョンは何ですか？

**A**: 現在のレジストリスキーマバージョンは`0.0.1`です。

**確認方法**:
```bash
# レジストリファイルを確認
cat registry/docs.json | jq '.$schemaVersion'
```

**出力例**:
```json
"0.0.1"
```

---

### Q2: 多言語フィールドの形式は？

**A**: `title`, `description`, `summary`などの多言語フィールドは、**オブジェクト形式**を使用してください。

**正しい形式**:
```json
{
  "title": {
    "en": "My Project",
    "ja": "私のプロジェクト"
  },
  "description": {
    "en": "Project description",
    "ja": "プロジェクトの説明"
  }
}
```

**誤った形式**（文字列型）:
```json
{
  "title": "My Project",      // ❌ 多言語対応していない
  "description": "Project description"  // ❌ 多言語対応していない
}
```

**移行スクリプト**: Phase 4-1でスキーマ移行スクリプトを使用して、既存のレジストリを更新済みです。

---

### Q3: レジストリバリデーションエラーが発生します

**A**: 以下のコマンドで詳細なエラー情報を確認できます。

**基本バリデーション**:
```bash
pnpm docs-cli validate
```

**詳細ログ付き**:
```bash
pnpm docs-cli validate --verbose
```

**JSON形式で出力**:
```bash
pnpm docs-cli validate --report json > validation-errors.json
cat validation-errors.json | jq .
```

**よくあるバリデーションエラー**:

1. **必須フィールド不足**
   ```
   エラー: プロジェクト 'my-docs' に必須フィールド 'displayName' がありません
   ```
   **対処法**: レジストリに`displayName`フィールドを追加

2. **無効なバージョンID**
   ```
   エラー: バージョンID 'version-1' は無効です（有効: v1, v2.0）
   ```
   **対処法**: バージョンIDを`v1`形式に変更

3. **スキーマバージョン不一致**
   ```
   エラー: スキーマバージョン '0.0.0' はサポートされていません
   ```
   **対処法**: `$schemaVersion`を`0.0.1`に更新

---

### Q4: `$schema`フィールドと`$schemaVersion`の違いは？

**A**:
- `$schemaVersion`: **使用してください**（レジストリのバージョン管理）
- `$schema`: **削除してください**（JSON Schema定義用、現在未使用）

**正しい形式**:
```json
{
  "$schemaVersion": "0.0.1",
  "projects": [...]
}
```

**誤った形式**:
```json
{
  "$schema": "./schema.json",    // ❌ 削除
  "$schemaVersion": "0.0.1",
  "projects": [...]
}
```

---

## CLI関連

### Q5: CLIコマンドが失敗した場合の対処法は？

**A**: 以下の手順で問題を特定・解決します。

#### 1. dry-runモードで確認

```bash
# dry-runで実行内容を確認
pnpm docs-cli add project my-docs --dry-run
```

#### 2. 詳細ログを有効化

```bash
# verboseモードで実行
pnpm docs-cli add project my-docs --verbose
```

#### 3. バックアップを確認

コマンド失敗時は自動的にロールバックされますが、手動で確認することもできます：

```bash
# バックアップ一覧
ls -t .backups/

# 最新のバックアップを確認
cat .backups/<timestamp>/registry/docs.json
```

---

### Q6: バックアップから復元するには？

**A**: 以下の手順で復元します。

```bash
# 1. バックアップタイムスタンプを確認
ls -t .backups/

# 2. 特定のバックアップを確認
cat .backups/2025-10-25T10-30-00-000Z/registry/docs.json | jq .

# 3. 復元実行
cp .backups/2025-10-25T10-30-00-000Z/registry/docs.json registry/docs.json

# 4. バリデーション
pnpm docs-cli validate
```

---

### Q7: dry-runモードとは？

**A**: dry-runモードは、**実際には変更を実行せず、変更内容のプレビューのみを表示するモード**です。

**使用例**:
```bash
# プロジェクト追加のプレビュー
pnpm docs-cli add project my-docs --dry-run

# ドキュメント削除のプレビュー
pnpm docs-cli remove doc sample-docs old-feature --dry-run
```

**出力例**:
```
[DRY RUN] 以下の変更が実行されます：

プロジェクト追加:
  ID: my-docs
  表示名 (en): My Documentation

作成されるディレクトリ:
  apps/my-docs/

レジストリ変更:
  + projects[0]: { id: 'my-docs', ... }

注意: これはプレビューです。実際には変更されません。
```

**推奨事項**: すべての操作でdry-runを実行してから本番実行することを推奨します。

---

### Q8: CI/CDで非対話式に実行するには？

**A**: `--yes`オプションを使用します。

**例**:
```bash
# 非対話式でプロジェクト追加
pnpm docs-cli add project my-docs \
  --display-name-en "My Documentation" \
  --display-name-ja "私のドキュメント" \
  --yes

# 環境変数でも設定可能
DOCS_CLI_NON_INTERACTIVE=true pnpm docs-cli add project my-docs
```

**GitHub Actionsの例**:
```yaml
- name: Add project
  run: |
    pnpm docs-cli add project my-docs \
      --display-name-en "My Documentation" \
      --yes
  env:
    DOCS_CLI_NON_INTERACTIVE: true
```

---

## ビルド関連

### Q9: ビルドエラー「Build failed: Command failed with exit code 1」が発生します

**A**: 以下の原因が考えられます。

#### 原因1: TypeScript型エラー

```bash
# ローカルでビルドを試行
cd apps/demo-docs
pnpm build

# エラーメッセージを確認
# 例: Type error: Property 'foo' does not exist on type 'Bar'
```

**対処法**: 型エラーを修正します。

#### 原因2: ESLintエラー

```bash
# ESLintエラーを確認
pnpm lint
```

**対処法**: `pnpm lint --fix`で自動修正、またはエラー箇所を手動修正します。

#### 原因3: 依存関係の不足

```bash
# 依存関係を再インストール
pnpm install
```

---

### Q10: サイドバーJSONファイルが生成されません

**A**: 以下の手順で生成します。

```bash
# サイドバーJSON生成
pnpm build:sidebar

# 特定プロジェクトのみ生成（対話式）
pnpm build:sidebar-selective
```

**生成先**:
```
apps/demo-docs/src/generated/
├── sidebar-v1-en.json
└── sidebar-v1-ja.json
```

**確認方法**:
```bash
# ファイル存在確認
ls -la apps/demo-docs/src/generated/

# JSON構文チェック
jq . apps/demo-docs/src/generated/sidebar-v1-en.json
```

---

### Q11: Pagefind検索インデックスが生成されません

**A**: 以下を確認してください。

#### 1. postbuildスクリプトの設定

**確認**:
```bash
cat apps/sample-docs/package.json | grep -A 2 "postbuild"
```

**期待値**:
```json
{
  "scripts": {
    "postbuild": "pagefind --site dist --glob \"**/*.html\""
  }
}
```

#### 2. Pagefind依存関係のインストール

```bash
# 依存関係を確認
cat apps/sample-docs/package.json | grep "pagefind"

# 未インストールの場合
cd apps/sample-docs
pnpm add -D pagefind
```

#### 3. ビルド実行

```bash
# ビルド実行（postbuildも自動実行）
cd apps/sample-docs
pnpm build

# インデックス生成確認
ls -la dist/pagefind/
```

---

### Q12: ベースパスが正しく設定されません

**A**: `astro.config.mjs`の`base`設定を確認します。

**demo-docsの場合**（ルートに配置）:
```javascript
export default defineConfig({
  base: '/',  // ルート
  // ...
});
```

**sample-docsの場合**（`/docs/sample-docs/`に配置）:
```javascript
export default defineConfig({
  base: '/docs/sample-docs/',  // プレフィックス付き
  // ...
});
```

**確認方法**:
```bash
# 設定を確認
cat apps/demo-docs/astro.config.mjs | grep -A 5 "base:"

# ビルド後のHTMLを確認
cat apps/demo-docs/dist/v1/en/getting-started/index.html | grep -o 'href="[^"]*"'
```

---

## 翻訳関連

### Q13: 翻訳マーカーとは何ですか？

**A**: 翻訳マーカーは、**翻訳が必要なコンテンツに自動挿入されるコメント**です。

**形式**:
```mdx
<!-- TODO: ja - この文書は翻訳が必要です -->
```

**挿入タイミング**:
- 新規言語追加時（`pnpm docs-cli add language`）
- テンプレート自動生成時（`--auto-template`オプション）

**削除タイミング**:
- 翻訳完了後、手動で削除

**例**:
```mdx
<!-- TODO: ja - この文書は翻訳が必要です -->

---
title: Installation Guide
summary: How to install the library
---

# Installation Guide

[英語のコンテンツ]
```

↓ 翻訳後

```mdx
---
title: インストールガイド
summary: ライブラリのインストール方法
---

# インストールガイド

[日本語のコンテンツ]
```

---

### Q14: 翻訳ステータスを確認するには？

**A**: レジストリの`translationStatus`フィールドで確認できます（任意機能）。

**レジストリ例**:
```json
{
  "documents": [
    {
      "id": "sample-docs-001",
      "slug": "getting-started",
      "translationStatus": {
        "en": "complete",      // 完了
        "ja": "complete",      // 完了
        "zh-Hans": "pending",  // 翻訳待ち
        "ko": "in-progress"    // 翻訳中
      }
    }
  ]
}
```

**ステータス値**:
- `complete`: 翻訳完了
- `pending`: 翻訳待ち
- `in-progress`: 翻訳中
- `outdated`: 原文更新により古くなった

---

### Q15: デフォルト言語を変更するには？

**A**: `pnpm docs-cli update language`コマンドを使用します。

```bash
# 日本語をデフォルト言語に設定
pnpm docs-cli update language sample-docs ja --set-default

# 確認
pnpm docs-cli list languages sample-docs
```

**出力例**:
```
言語:
  - ja (日本語) [default] [active]
  - en (English) [active]
```

---

## 互換レイヤー

### Q16: 互換レイヤーとは何ですか？

**A**: 互換レイヤーは、**旧プロジェクト構造（libx-dev）から新ジェネレーターへの移行を支援する機能**です。

**主な機能**:
- 旧レジストリ形式の読み込み
- パス変換（旧構造 → 新構造）
- マイグレーション警告の表示

**使用例**:
```bash
# 旧レジストリから新レジストリへ移行
pnpm docs-cli migrate --from registry/old-docs.json
```

---

### Q17: マイグレーション時の注意点は？

**A**: 以下の点に注意してください。

#### 1. バックアップを作成

```bash
# レジストリをバックアップ
cp registry/docs.json registry/docs.json.backup
```

#### 2. dry-runで確認

```bash
# dry-runでマイグレーション内容を確認
pnpm docs-cli migrate --from registry/old-docs.json --dry-run
```

#### 3. バリデーション

```bash
# マイグレーション後、バリデーション
pnpm docs-cli validate --strict
```

---

## デプロイ関連

### Q18: Cloudflare Pagesデプロイが失敗します

**A**: 以下の原因が考えられます。

#### 原因1: ビルドコマンドが間違っている

**確認方法**:
- Cloudflare Dashboard → `Workers & Pages` → `[Project Name]` → `Settings` → `Builds & deployments`

**正しい設定**:
- Build command: `pnpm build`
- Build output directory: `dist`
- Root directory: `/`
- Node.js version: `18`

#### 原因2: 環境変数が不足

**必要な環境変数**:
- `NODE_VERSION`: `18`
- `PNPM_VERSION`: `8`

**設定方法**:
- Cloudflare Dashboard → `Settings` → `Environment variables`

#### 原因3: ビルドログを確認

```bash
# Cloudflare Dashboardでビルドログを確認
# Workers & Pages → [Project Name] → Deployments → [Latest Deployment] → Build log
```

---

### Q19: デプロイ後、ページが404エラーになります

**A**: ルーティング設定を確認してください。

#### 原因1: ベースパスが間違っている

**確認**:
```bash
# astro.config.mjsのbase設定を確認
cat apps/sample-docs/astro.config.mjs | grep -A 5 "base:"
```

**期待値**:
```javascript
base: '/docs/sample-docs/',  // sample-docsの場合
```

#### 原因2: ビルド出力が正しくない

```bash
# ビルド出力のディレクトリ構造を確認
ls -la dist/

# 期待値:
# dist/
# ├── v1/               # demo-docs
# └── docs/
#     └── sample-docs/  # sample-docs
```

---

## パフォーマンス関連

### Q20: Lighthouseスコアが低い場合の対処法は？

**A**: カテゴリ別に対処法が異なります。

#### Performance < 90

**原因と対処法**:
1. **大きな画像**: WebPに変換、サイズを500KB以下に
2. **JavaScriptバンドル**: コード分割、未使用コードの削除
3. **CSSサイズ**: minify、未使用CSSの削除

**確認**:
```bash
# ビルド出力サイズを確認
du -sh dist/
find dist/ -name "*.js" -exec ls -lh {} \;
find dist/ -name "*.css" -exec ls -lh {} \;
```

#### Accessibility < 95

**原因と対処法**:
1. **スキップリンクがない**: DocLayout.astroで実装済み（Phase 4-2）
2. **見出し階層が正しくない**: h1 → h2 → h3の順に修正
3. **カラーコントラスト不足**: WCAG AA基準（4.5:1以上）に調整

#### Best Practices < 90

**原因と対処法**:
1. **HTTPS未使用**: Cloudflare Pagesは自動的にHTTPS化
2. **ブラウザエラー**: Console Errorsを確認して修正

#### SEO < 90

**原因と対処法**:
1. **メタディスクリプションがない**: フロントマターに`summary`を追加
2. **titleタグがない**: フロントマターに`title`を追加
3. **hreflangタグがない**: 多言語対応の場合、自動生成される

---

## まとめ

本FAQでは、以下のカテゴリの質問に回答しました：

- ✅ レジストリ関連（スキーマバージョン、多言語フィールド、バリデーション）
- ✅ CLI関連（コマンド失敗、バックアップ、dry-run、CI/CD統合）
- ✅ ビルド関連（ビルドエラー、サイドバーJSON、Pagefind、ベースパス）
- ✅ 翻訳関連（翻訳マーカー、翻訳ステータス、デフォルト言語）
- ✅ 互換レイヤー（マイグレーション）
- ✅ デプロイ関連（Cloudflare Pages、404エラー）
- ✅ パフォーマンス関連（Lighthouseスコア改善）

**さらに詳しい情報**:
- [CLI運用ガイド](./cli-operations.md)
- [ビルド・デプロイ運用ガイド](./build-deploy-operations.md)
- [コンテンツ管理ガイド](./content-management.md)
- [トラブルシューティングガイド](./troubleshooting.md)

**質問がある場合**:
- チームSlack: `#libx-dev-support`
- GitHubで Issue作成: [libx-dev/issues](https://github.com/<user>/libx-dev/issues)

---

**作成日**: 2025-10-25
**最終更新**: 2025-10-25
**バージョン**: 1.0.0
