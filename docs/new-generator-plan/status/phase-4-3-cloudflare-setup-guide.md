# Phase 4-3: Cloudflare Pages本番環境設定ガイド

**作成日**: 2025-10-26
**作成者**: Claude (Phase 4-3 Release Preparation)
**ステータス**: 📝 設定手順書
**対象環境**: 本番環境（Cloudflare Pages）

---

## 📋 概要

このガイドは、Cloudflare Pagesで新ドキュメントサイトジェネレーターの本番環境を構築するための完全な手順書です。初回セットアップから運用設定まで、ステップバイステップで説明します。

### 前提条件

- Cloudflareアカウントが作成済み
- GitHubリポジトリへのアクセス権限がある
- Cloudflare Pagesの基本的な知識がある
- 管理者権限を持っている

### 必要な情報

セットアップ前に以下の情報を準備してください:

| 項目 | 説明 | 例 |
|-----|------|-----|
| **Cloudflare Account ID** | CloudflareアカウントID | abc1234567890def |
| **GitHubリポジトリ** | デプロイ対象リポジトリ | libx-dev/libx-dev |
| **デプロイブランチ** | 本番デプロイブランチ | main |
| **カスタムドメイン** | 独自ドメイン（任意） | docs.example.com |
| **API Token** | Cloudflare API Token | - |

---

## 🚀 Part 1: Cloudflare Pagesプロジェクト作成

### ステップ1.1: Cloudflare Dashboardにログイン

1. https://dash.cloudflare.com/ にアクセス
2. Cloudflareアカウントでログイン
3. ダッシュボードが表示されることを確認

### ステップ1.2: Pages プロジェクトの作成

1. **左サイドバーから `Workers & Pages` を選択**

2. **`Create application` ボタンをクリック**

3. **`Pages` タブを選択**

4. **`Connect to Git` を選択**

### ステップ1.3: GitHubリポジトリの接続

1. **GitHub連携の承認**
   - `Connect GitHub` ボタンをクリック
   - GitHub認証画面が表示される
   - リポジトリアクセス権限を承認

2. **リポジトリの選択**
   - `libx-dev/libx-dev` を選択
   - または、検索ボックスで検索

3. **`Begin setup` をクリック**

### ステップ1.4: ビルド設定

**プロジェクト名の設定**:
```
Project name: libx
```

**本番ブランチの設定**:
```
Production branch: main
```

**ビルド設定**:

| 項目 | 値 | 説明 |
|-----|-----|------|
| **Framework preset** | None | カスタムビルド設定を使用 |
| **Build command** | `pnpm install && pnpm build:sidebar && pnpm build` | サイドバー生成 + ビルド |
| **Build output directory** | `dist` | ビルド成果物の出力先 |
| **Root directory (optional)** | (空白) | モノレポルートを使用 |

**環境変数**:

現時点では環境変数は不要です。将来的に追加する場合は、[Part 2: 環境変数設定](#part-2-環境変数設定) を参照してください。

**Node.jsバージョン**:

`Environment variables` セクションで以下を設定:

```
Name: NODE_VERSION
Value: 20
```

4. **`Save and Deploy` をクリック**

### ステップ1.5: 初回デプロイの確認

1. **デプロイ進行状況を監視**
   - ビルドログが表示される
   - ビルド完了まで約5-10分

2. **デプロイ成功を確認**
   - `Success` ステータスになることを確認
   - デプロイURLが表示される（例: `https://libx.pages.dev`）

3. **デプロイURLにアクセス**
   - ブラウザでデプロイURLを開く
   - サイトが正常に表示されることを確認

**確認ポイント**:
- ✅ ビルドが成功している
- ✅ デプロイが成功している
- ✅ サイトにアクセスできる
- ✅ ページが正常に表示される

---

## 🔧 Part 2: 環境変数設定

現時点では環境変数は不要ですが、将来的に必要になる可能性があります。

### 環境変数の設定方法

1. **Cloudflare Dashboard** → `Workers & Pages` → `libx`
2. **`Settings` タブをクリック**
3. **`Environment variables` セクションに移動**
4. **`Add variable` をクリック**

### 環境変数の種類

#### Production環境変数

本番環境でのみ有効な環境変数:

```
Environment: Production
```

例:
```
Name: API_ENDPOINT
Value: https://api.example.com
```

#### Preview環境変数

プレビューデプロイでのみ有効な環境変数:

```
Environment: Preview
```

例:
```
Name: API_ENDPOINT
Value: https://api-staging.example.com
```

### シークレット管理

機密情報（APIキー、トークン等）は暗号化されて保存されます:

```
Name: API_SECRET_KEY
Value: [シークレット値]
Type: Secret
```

**重要**: シークレット値は一度設定すると表示されません。記録が必要な場合は別途保管してください。

---

## 🌐 Part 3: カスタムドメイン設定

独自ドメインを使用する場合の設定手順です。

### ステップ3.1: カスタムドメインの追加

1. **Cloudflare Dashboard** → `Workers & Pages` → `libx`
2. **`Custom domains` タブをクリック**
3. **`Set up a custom domain` をクリック**

### ステップ3.2: ドメインの入力

1. **ドメイン名を入力**
   ```
   Domain: docs.example.com
   ```

2. **`Continue` をクリック**

### ステップ3.3: DNS設定

Cloudflareは自動的にDNSレコードを追加しようとします。

**ケース1: ドメインがCloudflareで管理されている場合**

- 自動的にCNAMEレコードが追加される
- `Activate domain` をクリック
- 数分でDNS設定が反映される

**ケース2: ドメインが外部DNSで管理されている場合**

手動でCNAMEレコードを追加:

```
Type: CNAME
Name: docs
Value: libx.pages.dev
TTL: Auto (または 3600)
```

**DNS設定例**:

| タイプ | 名前 | 値 | TTL |
|-------|------|-----|-----|
| CNAME | docs | libx.pages.dev | 3600 |

### ステップ3.4: SSL/TLS設定

Cloudflareは自動的にSSL証明書を発行します。

1. **SSL/TLSモードの確認**
   - `SSL/TLS` → `Overview`
   - モード: `Full (strict)` 推奨

2. **証明書の発行を待つ**
   - 数分～数時間で発行される
   - ステータスが `Active` になることを確認

3. **HTTPS強制リダイレクト**
   - `SSL/TLS` → `Edge Certificates`
   - `Always Use HTTPS` を `On` に設定

**確認ポイント**:
- ✅ カスタムドメインでアクセスできる
- ✅ HTTPSで接続できる
- ✅ HTTP→HTTPSリダイレクトが動作する
- ✅ SSL証明書が有効

---

## ⚙️ Part 4: ビルド設定の詳細

### ステップ4.1: ビルドコマンドの最適化

**現在の設定**:
```bash
pnpm install && pnpm build:sidebar && pnpm build
```

**推奨設定**（高速化）:
```bash
pnpm install --frozen-lockfile && pnpm build:sidebar && pnpm build
```

**変更手順**:
1. `Settings` → `Builds & deployments`
2. `Build command` を更新
3. `Save` をクリック

### ステップ4.2: Node.jsバージョン固定

**推奨バージョン**: Node.js 20

**設定方法**:
1. `Settings` → `Environment variables`
2. `NODE_VERSION` = `20` を設定
3. `Save` をクリック

### ステップ4.3: ビルドキャッシュ設定

Cloudflare Pagesは自動的に依存関係をキャッシュします。

**キャッシュ対象**:
- `node_modules/`
- `pnpm-lock.yaml`
- `.pnpm-store/`

**キャッシュクリア**（必要時）:
1. `Settings` → `Builds & deployments`
2. `Clear build cache` をクリック

### ステップ4.4: ビルドタイムアウト設定

**デフォルト**: 20分

**変更方法**（有料プランのみ）:
1. `Settings` → `Builds & deployments`
2. `Build timeout` を変更

---

## 🔒 Part 5: アクセス制御・権限管理

### ステップ5.1: チームメンバーの追加

1. **Cloudflare Dashboard** → アカウントホーム
2. **`Members` タブをクリック**
3. **`Invite member` をクリック**

**権限レベル**:

| 権限 | 説明 | 推奨対象 |
|-----|------|---------|
| **Administrator** | 全設定変更可能 | 技術リード、インフラ担当 |
| **Analytics** | 閲覧のみ | QAチーム、運用チーム |
| **Developer** | デプロイ・設定変更可能 | 開発者 |

### ステップ5.2: API Token の作成

GitHub Actionsでのデプロイに必要なAPI Tokenを作成します。

1. **Cloudflare Dashboard** → アカウントホーム
2. **`API Tokens` タブをクリック**
3. **`Create Token` をクリック**

**テンプレート選択**:
```
Template: Edit Cloudflare Workers
```

**権限設定**:
```
Account: [アカウント名] - Cloudflare Pages:Edit
Zone: All zones - Workers Scripts:Edit
```

**Token名**:
```
libx-github-actions-deploy
```

4. **`Continue to summary` → `Create Token`**
5. **Tokenをコピーして安全に保管**

**重要**: Tokenは一度しか表示されません。必ず記録してください。

### ステップ5.3: GitHub Secretsの設定

1. **GitHubリポジトリ** → `Settings` → `Secrets and variables` → `Actions`
2. **`New repository secret` をクリック**

**シークレット1: CLOUDFLARE_API_TOKEN**
```
Name: CLOUDFLARE_API_TOKEN
Value: [先ほど作成したToken]
```

**シークレット2: CLOUDFLARE_ACCOUNT_ID**
```
Name: CLOUDFLARE_ACCOUNT_ID
Value: [CloudflareアカウントID]
```

**Account IDの確認方法**:
- Cloudflare Dashboard → アカウントホーム
- URLの`https://dash.cloudflare.com/[ここがAccount ID]`

---

## 📊 Part 6: キャッシュポリシー設定

### ステップ6.1: ブラウザキャッシュ設定

Cloudflare Pagesのデフォルト設定で十分ですが、カスタマイズも可能です。

**推奨設定**:

| ファイルタイプ | Cache-Control | 説明 |
|-------------|---------------|------|
| **HTML** | `no-cache` | 常に最新版を取得 |
| **CSS/JS** | `max-age=31536000, immutable` | 1年間キャッシュ（ハッシュ付きファイル名） |
| **画像** | `max-age=86400` | 1日間キャッシュ |

### ステップ6.2: Cloudflare CDNキャッシュ設定

**カスタムキャッシュルール**（任意）:

1. `Caching` → `Configuration`
2. `Cache Rules` を作成

**ルール例**:
```
If: Request URL contains "/v1/"
Then: Browser Cache TTL = 1 hour
      Edge Cache TTL = 1 day
```

### ステップ6.3: Cache Purge（キャッシュクリア）

**全キャッシュクリア**:
```bash
# Cloudflare API経由
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

**URLベースキャッシュクリア**:
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://docs.example.com/v1/en/getting-started/"]}'
```

---

## 🌿 Part 7: プレビューブランチ設定

### ステップ7.1: プレビューデプロイの有効化

1. **Cloudflare Dashboard** → `Workers & Pages` → `libx`
2. **`Settings` → `Builds & deployments`**
3. **`Production branch`** と **`Preview branches`** を設定

**プレビューブランチパターン**:
```
Preview branches: All branches except main
```

または、特定のブランチパターン:
```
Preview branches: staging, feature/*, dev
```

### ステップ7.2: プレビューURL

プレビューデプロイのURLは自動生成されます:

```
https://[commit-hash].libx.pages.dev
https://[branch-name].libx.pages.dev
```

**例**:
```
https://staging.libx.pages.dev
https://abc1234.libx.pages.dev
```

### ステップ7.3: プレビューデプロイの確認

1. **任意のブランチにプッシュ**
   ```bash
   git checkout -b feature/test
   git push origin feature/test
   ```

2. **Cloudflare Dashboardでデプロイを確認**
   - `Deployments` タブ
   - プレビューデプロイが自動的に作成される

3. **プレビューURLにアクセス**
   - デプロイ詳細ページでURLを確認
   - ブラウザでアクセス

---

## 🔔 Part 8: Webhooks・通知設定

### ステップ8.1: デプロイ通知の設定

**Slack通知の設定**:

1. **Slack Incoming Webhookを作成**
   - Slack Workspace → Apps → Incoming Webhooks
   - Webhook URLを取得

2. **Cloudflare Dashboardで設定**
   - `Settings` → `Notifications`
   - `Add notification` をクリック

3. **通知タイプを選択**
   ```
   Type: Pages deployment
   Event: Deployment started, Deployment completed, Deployment failed
   ```

4. **Webhook URLを入力**
   ```
   Webhook URL: https://hooks.slack.com/services/...
   ```

**メール通知の設定**:

1. `Settings` → `Notifications`
2. `Add notification`
3. `Email` を選択
4. メールアドレスを入力

### ステップ8.2: GitHub通知との連携

GitHub Actionsでのデプロイ通知:

**.github/workflows/deploy-production.yml**（例）:
```yaml
- name: Notify deployment success
  if: success()
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.repos.createCommitComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        commit_sha: context.sha,
        body: '✅ 本番デプロイが完了しました'
      });
```

---

## 📈 Part 9: Analytics・ログ設定

### ステップ9.1: Cloudflare Web Analyticsの有効化

1. **Cloudflare Dashboard** → `Workers & Pages` → `libx`
2. **`Analytics` タブをクリック**
3. **`Enable Web Analytics` をクリック**

**取得データ**:
- ページビュー数
- ユニークビジター数
- デバイス種別
- 地域別アクセス
- リファラー

### ステップ9.2: ログの確認

**リアルタイムログ**:
```
Cloudflare Dashboard → Analytics → Logs → Real-time logs
```

**ログフィールド**:
- タイムスタンプ
- HTTPステータスコード
- リクエストパス
- IPアドレス
- ユーザーエージェント

### ステップ9.3: エラー監視の設定

**Cloudflare Pagesのデフォルトエラーページ**:
- 404エラー: 自動生成
- 500エラー: 自動生成

**カスタムエラーページ**（任意）:

`public/404.html` を作成:
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>ページが見つかりません</title>
</head>
<body>
  <h1>404 - ページが見つかりません</h1>
  <p><a href="/">ホームに戻る</a></p>
</body>
</html>
```

---

## 🔄 Part 10: ロールバック・バージョン管理

### ステップ10.1: デプロイ履歴の確認

1. **Cloudflare Dashboard** → `Workers & Pages` → `libx`
2. **`Deployments` タブをクリック**
3. **過去のデプロイ履歴が表示される**

### ステップ10.2: ロールバック手順

**方法1: Cloudflare Dashboardでのロールバック**

1. `Deployments` タブでロールバック先のデプロイを選択
2. `Manage deployment` をクリック
3. `Rollback to this deployment` を選択
4. 確認ダイアログで `Rollback` をクリック

**所要時間**: 約1-2分

**方法2: 特定のコミットを再デプロイ**

1. `Deployments` タブで該当デプロイを選択
2. `Retry deployment` をクリック

**所要時間**: 約5-10分（ビルド時間含む）

### ステップ10.3: バージョンタグの管理

**推奨タグ形式**:
```
v1.0.0 - メジャーリリース
v1.0.1 - パッチリリース
v1.1.0 - マイナーリリース
```

**タグ作成**:
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

---

## 🛡️ Part 11: セキュリティ設定

### ステップ11.1: HTTPS強制

**設定手順**:
1. `SSL/TLS` → `Edge Certificates`
2. `Always Use HTTPS` を `On` に設定

### ステップ11.2: セキュリティヘッダー

**推奨ヘッダー**（_headers ファイルで設定）:

`public/_headers`:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

### ステップ11.3: Rate Limiting

**Cloudflare Rate Limitingの設定**（有料プランのみ）:

1. `Security` → `Rate Limiting`
2. `Create Rate Limiting Rule`

**ルール例**:
```
If: Request URL contains "/api/"
Then: Limit requests to 100 per minute per IP
```

---

## 📝 Part 12: 設定チェックリスト

### 必須設定

- [ ] プロジェクト作成完了
- [ ] GitHubリポジトリ連携完了
- [ ] ビルドコマンド設定完了
- [ ] Node.jsバージョン設定（v20）
- [ ] 初回デプロイ成功
- [ ] デプロイURL動作確認

### 推奨設定

- [ ] カスタムドメイン設定
- [ ] SSL/TLS設定（Full Strict）
- [ ] HTTPS強制リダイレクト
- [ ] API Token作成
- [ ] GitHub Secrets設定
- [ ] プレビューブランチ設定
- [ ] デプロイ通知設定（Slack/Email）
- [ ] Web Analytics有効化

### セキュリティ設定

- [ ] セキュリティヘッダー設定
- [ ] チームメンバー権限設定
- [ ] API Token権限最小化
- [ ] 環境変数のシークレット化

---

## 🎯 完了基準

| 基準 | 達成状況 |
|-----|---------|
| ✅ プロジェクト作成完了 | [ ] 達成 / [ ] 未達 |
| ✅ GitHub連携完了 | [ ] 達成 / [ ] 未達 |
| ✅ 初回デプロイ成功 | [ ] 達成 / [ ] 未達 |
| ✅ カスタムドメイン設定完了 | [ ] 達成 / [ ] 未達 |
| ✅ SSL証明書発行完了 | [ ] 達成 / [ ] 未達 |
| ✅ API Token作成完了 | [ ] 達成 / [ ] 未達 |
| ✅ GitHub Secrets設定完了 | [ ] 達成 / [ ] 未達 |

---

## 📎 関連ドキュメント

- [phase-4-3-production-deployment-plan.md](./phase-4-3-production-deployment-plan.md) - 本番デプロイ計画書
- [phase-4-3-monitoring-setup.md](./phase-4-3-monitoring-setup.md) - モニタリング設定ガイド（作成予定）
- [phase-4-3-deployment-runbook.md](./phase-4-3-deployment-runbook.md) - デプロイランブック（作成予定）
- [build-deploy-operations.md](../guides/build-deploy-operations.md) - ビルド・デプロイ運用ガイド

---

## 🎉 まとめ

Cloudflare Pages本番環境のセットアップが完了すると、以下が実現されます:

**主要機能**:
- ✅ GitHub連携による自動デプロイ
- ✅ グローバルCDNによる高速配信
- ✅ 無料SSL証明書
- ✅ プレビューデプロイ
- ✅ ロールバック機能
- ✅ リアルタイムログ
- ✅ Web Analytics

**次のステップ**:
1. モニタリング設定（phase-4-3-monitoring-setup.md）
2. デプロイランブック作成（phase-4-3-deployment-runbook.md）
3. ローンチ判定会資料作成（phase-4-3-launch-readiness-review.md）

---

**作成者**: Claude Code (AI Assistant)
**作成日**: 2025-10-26
**最終更新**: 2025-10-26
**ステータス**: 📝 設定手順書
