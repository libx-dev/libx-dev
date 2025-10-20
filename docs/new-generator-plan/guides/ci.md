# CIガイド - CI/自動化ワークフロー

**作成日**: 2025-10-21
**Phase**: Phase 3-4
**ステータス**: 実装完了

---

## 📋 目次

1. [概要](#概要)
2. [前提条件](#前提条件)
3. [GitHub Actions設定](#github-actions設定)
4. [環境変数とSecrets](#環境変数とsecrets)
5. [ワークフロー設計パターン](#ワークフロー設計パターン)
6. [Artifact管理](#artifact管理)
7. [通知とエラーハンドリング](#通知とエラーハンドリング)
8. [ベストプラクティス](#ベストプラクティス)
9. [トラブルシューティング](#トラブルシューティング)

---

## 概要

このガイドでは、Phase 3-4で実装したCI/自動化ワークフローの設定方法と運用方法を説明します。

### 対象読者

- CI/CDパイプラインを設定する開発者
- GitHub Actionsを使用する管理者
- 移行作業を自動化したいチーム

### 提供機能

1. **Migration Workflow** - 移行作業の自動化
2. **互換性チェック** - 旧スクリプトとの互換性確認
3. **移行レポート生成** - 移行進捗の可視化
4. **Artifact管理** - レポート・ログの保存
5. **通知機能** - 警告・エラーの自動通知

---

## 前提条件

### 必須

- [ ] pnpm 9.x以上がインストールされている
- [ ] Node.js 20.x以上がインストールされている
- [ ] `docs-cli` パッケージがインストールされている
- [ ] GitHub Actionsが有効になっている

### 推奨

- [ ] `.docs-cli/config.ci.json` が設定されている
- [ ] 互換レイヤーがインストールされている（Phase 3-3）
- [ ] レジストリファイル（`registry/docs.json`）が存在する

---

## GitHub Actions設定

### ワークフローファイル

`.github/workflows/migration.yml` が自動的に作成されています。

### トリガー設定

#### 1. 手動トリガー（workflow_dispatch）

GitHub ActionsのUIから手動で実行できます。

**パラメータ**:

| パラメータ | 説明 | デフォルト値 | 必須 |
|----------|------|-----------|------|
| `project` | プロジェクトID | - | いいえ |
| `version` | バージョンID | - | いいえ |
| `mode` | 実行モード（`new-cli` / `compat`） | `new-cli` | はい |
| `dry-run` | Dry-runモード | `true` | いいえ |

**実行方法**:

1. GitHubリポジトリの **Actions** タブを開く
2. **Migration Workflow** を選択
3. **Run workflow** をクリック
4. パラメータを入力して **Run workflow** を実行

#### 2. プルリクエストトリガー

以下のファイルが変更された場合に自動実行されます：

- `.github/workflows/migration.yml`
- `.docs-cli/**`
- `packages/cli/**`
- `scripts/compat/**`

---

## 環境変数とSecrets

### 環境変数

#### 基本的な環境変数

```yaml
env:
  DOCS_CLI_CONFIG: .docs-cli/config.ci.json
  NODE_ENV: production
  CI: true
```

#### オプショナルな環境変数

```yaml
env:
  DOCS_CLI_VERBOSE: true          # 詳細ログを出力
  DOCS_CLI_DRY_RUN: false         # Dry-runモード
  DOCS_CLI_SUPPRESS_WARNING: true # 警告を抑制
```

### Secrets

現在、Migration Workflowでは外部サービスとの連携が必要ないため、Secretsは不要です。

**将来的に必要になる可能性があるSecrets**:

| Secret名 | 説明 | 用途 |
|---------|------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare APIトークン | デプロイ時 |
| `SLACK_WEBHOOK_URL` | Slack Webhook URL | 通知時 |
| `NPM_TOKEN` | npm認証トークン | パッケージ公開時 |

**Secretsの設定方法**:

1. リポジトリの **Settings** → **Secrets and variables** → **Actions** を開く
2. **New repository secret** をクリック
3. Secret名と値を入力
4. **Add secret** をクリック

---

## ワークフロー設計パターン

### パターン1: 新CLIモードでの移行

```yaml
# 新しいdocs-cliコマンドを使用する推奨パターン
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile

      # 新CLIコマンドを実行
      - name: プロジェクト作成
        run: pnpm exec docs-cli add project my-project --display-name-en "My Project"

      - name: バリデーション
        run: pnpm validate

      - name: ビルド
        run: pnpm build
```

### パターン2: 互換モードでの移行

```yaml
# 既存スクリプトからの移行パターン
jobs:
  migrate-compat:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # ... (setup steps)

      # 互換ラッパーを使用（警告抑制）
      - name: プロジェクト作成（互換モード）
        run: node scripts/compat/create-project.js my-project "My Project" "私のプロジェクト" --suppress-warning

      # 互換性チェック
      - name: 互換性チェック
        run: pnpm exec docs-cli compat check
        continue-on-error: true
```

### パターン3: 段階的な移行

```yaml
# 一部のスクリプトを新CLIに移行し、残りは互換ラッパーを使用
jobs:
  migrate-hybrid:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # ... (setup steps)

      # 新CLI（移行済み）
      - name: プロジェクト作成
        run: pnpm exec docs-cli add project my-project

      # 互換ラッパー（移行予定）
      - name: 言語追加
        run: node scripts/compat/add-language.js my-project ja --suppress-warning

      # 互換性チェックで進捗確認
      - name: 移行進捗確認
        run: pnpm exec docs-cli compat report
```

---

## Artifact管理

### Artifactの種類

| Artifact名 | 内容 | 保持期間 | サイズ目安 |
|-----------|------|---------|-----------|
| `compat-check-log` | 互換性チェックログ | 7日 | < 1 MB |
| `migration-reports` | 移行レポート（MD + HTML） | 30日 | < 5 MB |
| `build-logs-new-cli` | ビルドログ（新CLI） | 7日 | < 10 MB |
| `build-logs-compat` | ビルドログ（互換） | 7日 | < 10 MB |

### Artifactの設定

```yaml
- name: レポートをアップロード
  uses: actions/upload-artifact@v4
  with:
    name: migration-reports
    path: |
      reports/migration/
    retention-days: 30
```

### Artifactのダウンロード

#### GitHub UIから

1. Actions タブ → ワークフロー実行を選択
2. **Artifacts** セクションからダウンロード

#### GitHub CLIから

```bash
# 最新のArtifactをダウンロード
gh run download --name migration-reports
```

### 保存ポリシー

- **互換性チェックログ**: 7日間保持（頻繁に実行されるため）
- **移行レポート**: 30日間保持（長期的な進捗管理に使用）
- **ビルドログ**: 7日間保持（トラブルシューティング用）

**ストレージ容量の管理**:

```yaml
# 古いArtifactを定期的に削除
- name: 古いArtifactを削除
  uses: actions/github-script@v7
  with:
    script: |
      const days = 30;
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const artifacts = await github.rest.actions.listArtifactsForRepo({
        owner: context.repo.owner,
        repo: context.repo.repo,
      });
      for (const artifact of artifacts.data.artifacts) {
        if (new Date(artifact.created_at) < cutoff) {
          await github.rest.actions.deleteArtifact({
            owner: context.repo.owner,
            repo: context.repo.repo,
            artifact_id: artifact.id,
          });
        }
      }
```

---

## 通知とエラーハンドリング

### GitHub Commentsへの通知

互換性チェックで警告が検出された場合、PRに自動コメントが投稿されます。

```yaml
- name: 警告通知をPRにコメント
  if: needs.compatibility-check.outputs.has-warnings == 'true'
  uses: actions/github-script@v7
  with:
    script: |
      const message = `⚠️ 互換性チェックで警告が検出されました...`;
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: message
      });
```

### Slack通知（オプション）

```yaml
- name: Slack通知
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
    text: '移行ワークフローが失敗しました'
```

### エラーハンドリング

#### continue-on-error

警告レベルのエラーは続行:

```yaml
- name: 互換性チェック
  run: pnpm exec docs-cli compat check
  continue-on-error: true
```

#### 条件付き実行

```yaml
- name: ビルド
  if: github.event.inputs.dry-run != 'true'
  run: pnpm build
```

#### リトライ戦略

```yaml
- name: ビルド（リトライ付き）
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    command: pnpm build
```

---

## ベストプラクティス

### 1. Dry-runモードを活用

初回実行時は必ず `dry-run: true` で実行:

```yaml
dry-run: true  # 最初はtrue
```

### 2. 段階的な移行

一度に全てのスクリプトを移行せず、段階的に移行:

```
Phase 1: 互換ラッパーをインストール
Phase 2: 一部のスクリプトを新CLIに移行
Phase 3: 残りのスクリプトを新CLIに移行
Phase 4: 互換ラッパーを削除
```

### 3. 定期的な互換性チェック

週次で互換性チェックを実行し、進捗を確認:

```yaml
on:
  schedule:
    - cron: '0 0 * * 1'  # 毎週月曜日
```

### 4. レポートのレビュー

移行レポートを定期的にレビューし、進捗を追跡:

```bash
# レポートを生成
pnpm exec docs-cli compat report

# チェックリストを確認
cat reports/migration/migration-checklist.md
```

### 5. バックアップの管理

`.backups/` ディレクトリのサイズを定期的に確認:

```bash
# バックアップサイズを確認
du -sh .backups/

# 古いバックアップを削除
find .backups/ -mtime +30 -delete
```

---

## トラブルシューティング

### Q1: ワークフローが失敗する

**症状**: Migration Workflowが途中で失敗する

**確認事項**:
1. Artifactから `compat-check-log` をダウンロード
2. エラーメッセージを確認
3. `.docs-cli/config.ci.json` の設定を確認

**解決策**:
```bash
# ローカルで再現
export DOCS_CLI_CONFIG=.docs-cli/config.ci.json
pnpm exec docs-cli compat check
```

### Q2: 互換性チェックで警告が出る

**症状**: 互換性チェックで警告が検出される

**確認事項**:
1. 旧スクリプトが `scripts/` に残っているか
2. 互換ラッパーが `scripts/compat/` にインストールされているか

**解決策**:
```bash
# 互換性チェック実行
pnpm exec docs-cli compat check

# レポート生成
pnpm exec docs-cli compat report
```

### Q3: Artifactがダウンロードできない

**症状**: Artifactが見つからない、またはダウンロードできない

**確認事項**:
1. リポジトリのアクセス権限
2. Artifactの保持期間（`retention-days`）

**解決策**:
```yaml
# 保持期間を延長
retention-days: 90  # 30日 → 90日
```

### Q4: 環境変数が反映されない

**症状**: `.docs-cli/config.ci.json` が読み込まれない

**確認事項**:
1. `DOCS_CLI_CONFIG` 環境変数が設定されているか
2. ファイルパスが正しいか

**解決策**:
```yaml
env:
  DOCS_CLI_CONFIG: .docs-cli/config.ci.json  # パスを確認
```

### Q5: タイムアウトエラー

**症状**: ビルドがタイムアウトする

**確認事項**:
1. `.docs-cli/config.ci.json` のタイムアウト設定
2. ビルド対象のプロジェクト数

**解決策**:
```json
{
  "ci": {
    "timeouts": {
      "build": 1200  // 600秒 → 1200秒（20分）
    }
  }
}
```

---

## 参考資料

### ドキュメント

- [Phase 3-4計画](../phase-3-4-ci-automation.md)
- [CI実行例](../examples/ci.md)
- [互換レイヤーガイド](./compat-layer.md)
- [Phase 3-3完了レポート](../phase-3-3-completion-report.md)

### GitHub Actions公式ドキュメント

- [Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
- [Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

### ツール

- [docs-cli](../../packages/cli/README.md)
- [pnpm](https://pnpm.io/)
- [GitHub CLI](https://cli.github.com/)

---

**最終更新**: 2025-10-21
**作成者**: Claude Code (AI Assistant)
