# CI/CD運用ガイド

このドキュメントは、新ドキュメントサイトジェネレーターのCI/CDパイプラインの概要と運用方法を説明します。

## 目次

- [CI/CDの概要](#cicdの概要)
- [ワークフロー構成](#ワークフロー構成)
- [ローカルでのテスト実行](#ローカルでのテスト実行)
- [CIの実行フロー](#ciの実行フロー)
- [失敗時のトラブルシューティング](#失敗時のトラブルシューティング)
- [デプロイフロー](#デプロイフロー)
- [バッジの追加](#バッジの追加)
- [今後の拡張予定](#今後の拡張予定)

---

## CI/CDの概要

このプロジェクトでは、以下の自動化を実現しています：

### 自動テスト
- ✅ **CLIパッケージのユニットテスト**: CLI機能の動作を検証
- ✅ **Validatorパッケージのユニットテスト**: バリデーションロジックの検証
- ✅ **統合テスト**: 複数パッケージを組み合わせたエンドツーエンドテスト
- ✅ **カバレッジレポート**: コードカバレッジ80%を目標

### 自動バリデーション
- ✅ **レジストリバリデーション（基本）**: スキーマと参照整合性チェック
- ✅ **レジストリバリデーション（厳格）**: 警告もエラー扱い
- ✅ **レジストリバリデーション（完全）**: コンテンツファイルとsyncHashチェック

### トリガー条件
- `main`ブランチへのpush
- `main`ブランチへのプルリクエスト
- 手動実行（`workflow_dispatch`）

---

## ワークフロー構成

### 1. Test and Validate（`.github/workflows/test-and-validate.yml`）

**目的**: テストとバリデーションの自動実行

**ジョブ構成**:

#### test-cli
- CLIパッケージのテスト実行
- カバレッジレポート生成
- 成果物アップロード（`cli-test-results`）

#### test-validator
- Validatorパッケージのテスト実行
- カバレッジレポート生成
- 成果物アップロード（`validator-test-results`）

#### test-integration
- 全パッケージの統合テスト
- 前提条件: `test-cli`, `test-validator`の成功
- 成果物アップロード（`test-results`）

#### test-coverage
- 総合カバレッジレポート生成
- 前提条件: `test-integration`の成功
- 成果物アップロード（`coverage-report`）

#### validate-registry-basic
- レジストリの基本バリデーション
- スキーマ検証、参照整合性チェック

#### validate-registry-strict
- レジストリの厳格バリデーション
- 警告もエラー扱い
- 前提条件: `validate-registry-basic`の成功

#### validate-registry-full
- レジストリの完全バリデーション
- コンテンツファイルとsyncHashチェック
- 前提条件: `validate-registry-strict`の成功
- `continue-on-error: true`（syncHashの不一致は警告レベル）

#### validate-pr-report
- プルリクエスト用の詳細レポート生成
- 前提条件: `test-integration`, `validate-registry-strict`の成功
- JSON形式のバリデーションレポートをアップロード

**パスフィルター**:
- `packages/cli/**`
- `packages/validator/**`
- `registry/**`
- `vitest.config.js`
- `package.json`
- `pnpm-lock.yaml`

### 2. Deploy to Cloudflare Pages（`.github/workflows/cloudflare-pages-deploy.yml`）

**目的**: Cloudflare Pagesへの自動デプロイ

**ジョブ構成**:

#### quality-check
- Lint実行
- フォーマットチェック
- `continue-on-error: true`（デプロイを止めない）

#### deploy
- サイドバー生成（`pnpm build:sidebar`）
- プロジェクトビルド（`pnpm build`）
- Cloudflare Pagesへデプロイ
- 前提条件: `quality-check`の完了
- `main`ブランチのみ実行

---

## ローカルでのテスト実行

CIと同じ環境でローカルテストを実行する方法：

### 全テスト実行

```bash
# 全パッケージのテスト
pnpm test

# ウォッチモード（開発時）
pnpm test:watch

# カバレッジレポート生成
pnpm test:coverage
```

### パッケージごとのテスト

```bash
# CLIパッケージのみ
pnpm test:cli

# Validatorパッケージのみ
pnpm test:validator

# 特定のテストファイルのみ
pnpm vitest run packages/cli/tests/unit/logger.test.js
```

### バリデーション実行

```bash
# 基本バリデーション
pnpm validate

# 厳格モード
pnpm validate:strict

# 完全バリデーション
pnpm validate:full
```

### Lint & Format

```bash
# Lint実行
pnpm lint

# フォーマット実行
pnpm format

# フォーマットチェック（CIと同じ）
pnpm prettier --check .
```

---

## CIの実行フロー

### プッシュ時のフロー

1. **トリガー**: `main`ブランチへのプッシュ
2. **並列実行**:
   - `test-cli` + `test-validator`
   - `validate-registry-basic`
3. **順次実行**:
   - `test-integration`（test-cli/test-validator完了後）
   - `test-coverage`（test-integration完了後）
   - `validate-registry-strict`（validate-registry-basic完了後）
   - `validate-registry-full`（validate-registry-strict完了後）

### プルリクエスト時のフロー

1. **トリガー**: `main`ブランチへのプルリクエスト
2. **上記フローに加えて**:
   - `validate-pr-report`（test-integration + validate-registry-strict完了後）
   - JSON形式のバリデーションレポートを生成・アップロード

### デプロイ時のフロー（mainブランチのみ）

1. **トリガー**: `main`ブランチへのプッシュ
2. **実行**:
   - `quality-check`（Lint + Format）
   - `deploy`（ビルド + Cloudflare Pagesデプロイ）

---

## 失敗時のトラブルシューティング

### テストが失敗する場合

#### 1. ローカルで再現

```bash
# 失敗したテストをローカルで実行
pnpm test

# 詳細ログ付きで実行
pnpm test --verbose
```

#### 2. CI Artifactsをダウンロード

- GitHub ActionsのSummaryページから`cli-test-results`、`validator-test-results`をダウンロード
- カバレッジレポート（`coverage/index.html`）を開いて詳細確認

#### 3. 修正と再実行

- テストを修正
- ローカルで確認：`pnpm test`
- コミット＆プッシュで再実行

### バリデーションが失敗する場合

#### 1. ローカルでバリデーション

```bash
# 基本バリデーション
pnpm validate

# 詳細ログ付き
pnpm validate --verbose

# JSON形式で出力
pnpm validate --report json
```

#### 2. エラーメッセージを確認

- エラーコード（例: `SCHEMA_INVALID`, `DOCUMENT_NOT_FOUND`）
- エラー箇所（ファイルパス、行番号）
- ヒント（修正方法の提案）

#### 3. 修正方法

- **スキーマエラー**: `registry/docs.json`の構造を修正
- **参照整合性エラー**: ID、バージョン、言語コードを確認
- **コンテンツファイルエラー**: MDXファイルの存在確認、パス修正

### Lintが失敗する場合

```bash
# Lint実行
pnpm lint

# 自動修正（可能な場合）
pnpm lint --fix

# フォーマット実行
pnpm format
```

### ビルドが失敗する場合

```bash
# ローカルでビルド
pnpm build

# サイドバー生成
pnpm build:sidebar

# ビルドログを確認
pnpm build 2>&1 | tee build.log
```

---

## デプロイフロー

### 自動デプロイ（mainブランチ）

1. **前提条件**: `main`ブランチにマージ
2. **自動実行**: `deploy`ジョブが実行される
3. **デプロイ先**: Cloudflare Pages（プロジェクト名: `libx`）

### 手動デプロイ

```bash
# サイドバー生成
pnpm build:sidebar

# ビルド
pnpm build

# デプロイ（Cloudflare Pages）
pnpm deploy:pages
```

### デプロイ環境変数

以下のシークレットが必要です（GitHub Secretsに設定済み）：

- `CLOUDFLARE_API_TOKEN`: Cloudflare APIトークン
- プロジェクト名: `libx`

---

## バッジの追加

### テストステータスバッジ

README.mdに以下のバッジを追加可能：

```markdown
![Test Status](https://github.com/username/libx-dev/actions/workflows/test-and-validate.yml/badge.svg)
```

### デプロイステータスバッジ

```markdown
![Deploy Status](https://github.com/username/libx-dev/actions/workflows/cloudflare-pages-deploy.yml/badge.svg)
```

### カバレッジバッジ

将来的にCodecovと統合した場合：

```markdown
[![codecov](https://codecov.io/gh/username/libx-dev/branch/main/graph/badge.svg)](https://codecov.io/gh/username/libx-dev)
```

---

## 今後の拡張予定

### Phase 2: CI機能の強化

1. **プルリクエストコメント自動投稿**
   - バリデーション結果をコメントとして投稿
   - テストカバレッジの変化を表示

2. **パフォーマンスベンチマーク**
   - ビルド時間の計測と可視化
   - バリデーション速度の追跡

3. **Codecov統合**
   - カバレッジレポートの自動アップロード
   - PRごとのカバレッジ変化を表示

### Phase 3: CD機能の強化

1. **プレビューデプロイ**
   - プルリクエストごとにプレビュー環境を自動生成
   - Cloudflare Pages Previewの活用

2. **ステージング環境**
   - `develop`ブランチをステージング環境にデプロイ
   - 本番デプロイ前の検証

3. **ロールバック機能**
   - デプロイ失敗時の自動ロールバック
   - 手動ロールバックのワークフロー

### Phase 4: モニタリングと通知

1. **Slack通知**
   - ビルド成功/失敗の通知
   - デプロイ完了通知

2. **エラーログ集約**
   - Sentryなどのエラートラッキング統合
   - ビルドエラーの自動レポート

---

## トラブルシューティングチートシート

| 症状 | 原因 | 解決方法 |
|-----|------|---------|
| テストが失敗する | コードのバグ | ローカルでテストを実行し、エラーメッセージを確認 |
| バリデーションが失敗する | レジストリデータの不整合 | `pnpm validate --verbose`でエラー箇所を特定 |
| Lintが失敗する | コーディングスタイルの違反 | `pnpm lint --fix`で自動修正 |
| ビルドが失敗する | 依存関係の問題 | `pnpm install --frozen-lockfile`で再インストール |
| CIが遅い | パスフィルターの設定不足 | 不要なファイル変更時はCI実行をスキップ |
| デプロイが失敗する | Cloudflare API認証エラー | `CLOUDFLARE_API_TOKEN`を確認 |

---

## 参考リンク

- [GitHub Actions ドキュメント](https://docs.github.com/en/actions)
- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages)
- [Vitest ドキュメント](https://vitest.dev/)
- [pnpm ドキュメント](https://pnpm.io/)

---

**最終更新**: 2025-10-18
**担当**: Phase 1-4 CI/CD統合チーム
