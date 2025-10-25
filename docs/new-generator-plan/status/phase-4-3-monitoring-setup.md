# Phase 4-3: モニタリング・観測設定ガイド

**作成日**: 2025-10-26
**作成者**: Claude (Phase 4-3 Release Preparation)
**ステータス**: 📝 設定計画書
**対象環境**: 本番環境

---

## 📋 概要

本ドキュメントは、新ドキュメントサイトジェネレーター本番環境のモニタリング・観測体制を確立するための設定ガイドです。デプロイ後の安定運用を実現するため、包括的な監視体制を構築します。

### モニタリングの目的

1. **パフォーマンス監視**: ページ速度、応答時間、リソース使用量の測定
2. **エラー監視**: エラー発生の即時検知と原因特定
3. **アクセス監視**: トラフィック状況、ユーザー行動の把握
4. **品質維持**: Lighthouseスコア、Core Web Vitalsの継続測定
5. **アラート体制**: 異常発生時の即座な通知

### モニタリング階層

```
┌─────────────────────────────────────┐
│  Layer 1: Cloudflare Analytics      │  基本的なアクセス解析
├─────────────────────────────────────┤
│  Layer 2: Lighthouse CI             │  パフォーマンス品質保証
├─────────────────────────────────────┤
│  Layer 3: Error Monitoring (Sentry) │  エラー・例外検知
├─────────────────────────────────────┤
│  Layer 4: Uptime Monitoring         │  死活監視
├─────────────────────────────────────┤
│  Layer 5: Custom Dashboard          │  統合ダッシュボード
└─────────────────────────────────────┘
```

---

## 🎯 Layer 1: Cloudflare Analytics

Cloudflareが提供する基本的なアクセス解析機能です。

### 1.1 Cloudflare Web Analyticsの有効化

**設定手順**:

1. **Cloudflare Dashboard** → `Workers & Pages` → `libx`
2. **`Analytics` タブをクリック**
3. **`Enable Web Analytics` をクリック**

**取得データ**:

| メトリクス | 説明 | 活用方法 |
|----------|------|---------|
| **ページビュー** | ページ閲覧数 | 人気ページの特定 |
| **ユニークビジター** | 一意の訪問者数 | ユーザー数の把握 |
| **バウンス率** | 直帰率 | コンテンツ品質の評価 |
| **セッション時間** | 滞在時間 | エンゲージメント測定 |
| **地域別アクセス** | 国・地域別集計 | ローカライゼーション評価 |
| **デバイス種別** | PC/モバイル/タブレット | レスポンシブ対応評価 |
| **リファラー** | 流入元 | マーケティング評価 |

### 1.2 Core Web Vitalsの監視

**重要指標**:

| 指標 | 目標値 | 説明 |
|-----|-------|------|
| **LCP** (Largest Contentful Paint) | 2.5秒以下 | 最大コンテンツの描画時間 |
| **FID** (First Input Delay) | 100ms以下 | 最初のインタラクションまでの時間 |
| **CLS** (Cumulative Layout Shift) | 0.1以下 | レイアウトの累積シフト |

**確認方法**:
```
Cloudflare Dashboard → Analytics → Web Analytics → Core Web Vitals
```

### 1.3 トラフィックパターンの分析

**確認項目**:

1. **ピーク時間帯**
   - 日次/週次のアクセスパターン
   - 急激なトラフィック増加の検知

2. **人気ページTop 10**
   - 最も閲覧されているページ
   - コンテンツ改善の優先順位付け

3. **404エラーページ**
   - 存在しないページへのアクセス
   - リンク切れの検知

4. **バウンス率が高いページ**
   - 離脱率の高いページ
   - コンテンツ品質の改善点

### 1.4 アラート設定

**Cloudflare Notificationsの設定**:

1. `Notifications` → `Add notification`
2. 通知タイプを選択:

| 通知タイプ | 条件 | 通知先 |
|----------|------|--------|
| **Traffic Anomaly** | 通常の150%以上のトラフィック | Slack、Email |
| **Error Rate** | 5xx エラー率が5%以上 | Slack、Email、SMS |
| **Origin Health** | オリジンサーバーダウン | Slack、Email、SMS |

**通知先設定**:
```
Slack Webhook: https://hooks.slack.com/services/...
Email: tech-lead@example.com, ops@example.com
```

---

## 📊 Layer 2: Lighthouse CI

継続的なパフォーマンス品質保証のため、Lighthouse CIを運用します。

### 2.1 Lighthouse CI GitHub Actionsの設定

**既存設定の確認**:

- Phase 4-2で設定済み
- ファイル: `.github/workflows/lighthouse.yml`
- トリガー: PR作成時

**設定内容**:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main, staging]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - name: Run Lighthouse CI
        run: |
          cd apps/demo-docs
          lhci autorun
        continue-on-error: true
```

### 2.2 Lighthouse CI設定ファイル

**apps/demo-docs/.lighthouserc.json**:

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:4321/v1/en/getting-started/",
        "http://localhost:4321/v1/ja/getting-started/"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### 2.3 本番環境Lighthouseスコア監視

**週次Lighthouse測定スクリプト**:

**scripts/lighthouse-production.sh**:

```bash
#!/bin/bash

# 本番環境URL
PROD_URL="https://libx.pages.dev"

# ページリスト
PAGES=(
  "v1/en/getting-started/"
  "v1/ja/getting-started/"
  "docs/sample-docs/v1/en/"
)

# レポート保存先
REPORT_DIR="docs/new-generator-plan/status/lighthouse-reports/production"
mkdir -p "$REPORT_DIR"

# 日付
DATE=$(date +%Y%m%d)

# 各ページを測定
for PAGE in "${PAGES[@]}"; do
  echo "Measuring: $PROD_URL/$PAGE"

  lighthouse "$PROD_URL/$PAGE" \
    --output=html \
    --output=json \
    --output-path="$REPORT_DIR/$DATE-$(echo $PAGE | tr '/' '-')" \
    --chrome-flags="--headless"
done

echo "Reports saved to: $REPORT_DIR"
```

**週次実行設定（GitHub Actions）**:

**.github/workflows/lighthouse-production.yml**:

```yaml
name: Lighthouse Production (Weekly)

on:
  schedule:
    - cron: '0 10 * * 1'  # 毎週月曜日 10:00 UTC
  workflow_dispatch:

jobs:
  lighthouse-prod:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Lighthouse
        run: npm install -g lighthouse

      - name: Run Lighthouse
        run: bash scripts/lighthouse-production.sh

      - name: Upload reports
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-production-reports
          path: docs/new-generator-plan/status/lighthouse-reports/production
          retention-days: 90

      - name: Check scores
        run: |
          # JSONレポートから点数を抽出
          # 目標値未達の場合はアラート
          echo "Lighthouse scores check completed"
```

### 2.4 スコア推移の記録

**月次レポートテンプレート**:

**docs/new-generator-plan/status/lighthouse-monthly-YYYYMM.md**:

```markdown
# Lighthouse月次レポート (YYYY-MM)

## 概要

- 測定期間: YYYY-MM-01 ~ YYYY-MM-30
- 測定頻度: 週1回（月曜日 10:00 UTC）
- 測定ページ数: 3ページ

## スコア推移

| 日付 | ページ | Performance | Accessibility | Best Practices | SEO |
|------|--------|-------------|---------------|----------------|-----|
| YYYY-MM-DD | demo-docs/en | 100 | 100 | 100 | 100 |
| YYYY-MM-DD | demo-docs/ja | 100 | 100 | 100 | 100 |
| YYYY-MM-DD | sample-docs/en | 98 | 100 | 100 | 100 |

## 目標達成状況

- ✅ Performance: 全ページ90点以上
- ✅ Accessibility: 全ページ95点以上
- ✅ Best Practices: 全ページ90点以上
- ✅ SEO: 全ページ90点以上

## 改善が必要な項目

- なし

## 次月のアクション

- 継続監視
```

---

## 🐛 Layer 3: Error Monitoring (Sentry)

エラー・例外の検知と原因特定のため、Sentryを導入します。

### 3.1 Sentryプロジェクトの作成

**手順**:

1. https://sentry.io/ にアクセス
2. 新規プロジェクトを作成
   - プロジェクト名: `libx-docs`
   - プラットフォーム: `JavaScript`
3. DSN（Data Source Name）を取得

**DSN例**:
```
https://1234567890abcdef@o123456.ingest.sentry.io/7890123
```

### 3.2 Sentry SDKのインストール（オプション）

**現時点では不要**ですが、将来的にクライアントサイドエラー監視が必要になった場合の手順:

**package.json**:
```json
{
  "dependencies": {
    "@sentry/browser": "^7.0.0"
  }
}
```

**Sentry初期化コード**:

**apps/demo-docs/src/sentry.ts**:
```typescript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "https://1234567890abcdef@o123456.ingest.sentry.io/7890123",
  environment: import.meta.env.MODE,
  release: "libx-docs@1.0.0",
  tracesSampleRate: 0.1,
});
```

**レイアウトでインポート**:

**apps/demo-docs/src/layouts/DocLayout.astro**:
```astro
---
import '../sentry';
---
```

### 3.3 Sentryアラート設定

**アラートルール**:

1. **JavaScript Error Rate**
   - 条件: エラー率が1%以上
   - 通知: Slack、Email

2. **Unhandled Exception**
   - 条件: 未処理の例外が発生
   - 通知: Slack、Email、SMS

3. **Performance Degradation**
   - 条件: ページロード時間が5秒以上
   - 通知: Slack、Email

**通知先設定**:
```
Slack: #libx-errors
Email: tech-lead@example.com
```

### 3.4 エラーログの確認

**Sentry Dashboard**:
```
Issues → All Issues
```

**確認項目**:
- エラーメッセージ
- スタックトレース
- ブラウザ情報
- ユーザーエージェント
- URL
- 発生頻度

---

## ⏱️ Layer 4: Uptime Monitoring

サービスの死活監視を行います。

### 4.1 UptimeRobotの設定

**無料プランの活用**:

1. https://uptimerobot.com/ にアクセス
2. 新規モニターを作成

**モニター設定**:

| 項目 | 値 |
|-----|-----|
| **Monitor Type** | HTTP(s) |
| **Friendly Name** | libx-docs Production |
| **URL** | https://libx.pages.dev/v1/en/getting-started/ |
| **Monitoring Interval** | 5分ごと |

**追加モニター**:

| 名前 | URL |
|-----|-----|
| libx-docs-en | https://libx.pages.dev/v1/en/getting-started/ |
| libx-docs-ja | https://libx.pages.dev/v1/ja/getting-started/ |
| sample-docs-en | https://libx.pages.dev/docs/sample-docs/v1/en/ |

### 4.2 アラート設定

**通知先**:
```
Email: ops@example.com, tech-lead@example.com
Slack: #libx-uptime
SMS: [電話番号]
```

**アラート条件**:
- ダウンを検知したら即座に通知
- 5分以内に復旧しない場合は再通知

### 4.3 ステータスページの作成

**UptimeRobotパブリックステータスページ**:

1. UptimeRobot Dashboard → Status Pages → Create Status Page
2. 公開URL: `https://status.example.com`（カスタムドメイン）
3. 表示するモニター: 全モニター

**ステータスページの活用**:
- ユーザー向けサービス状況表示
- 過去のダウンタイム履歴
- 計画メンテナンス告知

---

## 📈 Layer 5: Custom Dashboard

統合ダッシュボードを作成し、すべてのメトリクスを一元管理します。

### 5.1 Grafana Cloudの設定（オプション）

**無料プランの活用**:

1. https://grafana.com/products/cloud/ にアクセス
2. 無料トライアルを開始
3. データソースを追加:
   - Cloudflare Analytics API
   - Sentry API
   - UptimeRobot API

**ダッシュボード構成**:

```
┌─────────────────────────────────────────┐
│  Real-time Traffic (Cloudflare)         │
│  - Current visitors                     │
│  - Requests per minute                  │
│  - Bandwidth usage                      │
├─────────────────────────────────────────┤
│  Performance Metrics (Lighthouse)       │
│  - Performance Score                    │
│  - Accessibility Score                  │
│  - Best Practices Score                 │
│  - SEO Score                            │
├─────────────────────────────────────────┤
│  Error Rate (Sentry)                    │
│  - JavaScript errors                    │
│  - Unhandled exceptions                 │
│  - Error rate trend                     │
├─────────────────────────────────────────┤
│  Uptime (UptimeRobot)                   │
│  - Uptime percentage                    │
│  - Response time                        │
│  - Last downtime                        │
└─────────────────────────────────────────┘
```

### 5.2 簡易ダッシュボードの作成

**Cloudflare Dashboardのカスタマイズ**:

1. よく見るメトリクスを「お気に入り」に追加
2. カスタムビューの作成

**Weekly Reportの自動生成**:

**scripts/generate-weekly-report.sh**:

```bash
#!/bin/bash

# 週次レポート生成スクリプト

DATE=$(date +%Y%m%d)
REPORT_FILE="docs/new-generator-plan/status/weekly-report-$DATE.md"

cat << EOF > "$REPORT_FILE"
# 週次運用レポート ($DATE)

## 概要

- レポート期間: $(date -d '7 days ago' +%Y-%m-%d) ~ $(date +%Y-%m-%d)
- 作成日: $(date +%Y-%m-%d)

## トラフィック統計

- ページビュー: [Cloudflareから取得]
- ユニークビジター: [Cloudflareから取得]
- バウンス率: [Cloudflareから取得]

## パフォーマンス

- Lighthouseスコア平均: [Lighthouseレポートから算出]
- Core Web Vitals: [Cloudflareから取得]

## エラー

- エラー発生件数: [Sentryから取得]
- 重大エラー: [Sentryから取得]

## アップタイム

- 稼働率: [UptimeRobotから取得]
- ダウンタイム: [UptimeRobotから取得]

## アクション項目

- [改善が必要な項目]
EOF

echo "Weekly report generated: $REPORT_FILE"
```

---

## 🔔 アラート体制

### アラート階層と対応時間

| Level | 重大度 | 例 | 対応時間 | 通知先 |
|-------|-------|-----|---------|--------|
| **Critical** | サービス停止 | サイト全体ダウン | 即座（15分以内） | Slack、Email、SMS |
| **High** | 重大な問題 | エラー率10%以上 | 1時間以内 | Slack、Email |
| **Medium** | 軽微な問題 | パフォーマンス劣化 | 4時間以内 | Slack |
| **Low** | 情報 | トラフィック増加 | 対応不要 | Slack |

### 通知チャンネル

**Slack**:
```
#libx-alerts-critical - Critical alerts only
#libx-alerts - All alerts
#libx-monitoring - Monitoring data (週次レポート等)
```

**Email**:
```
tech-lead@example.com - All alerts
ops@example.com - Critical and High alerts
```

**SMS**:
```
[技術リード電話番号] - Critical alerts only
```

### オンコール体制

| 曜日 | 時間帯 | 担当者 | バックアップ |
|-----|-------|--------|------------|
| 月-金 | 9:00-18:00 | 技術リード | QAリード |
| 月-金 | 18:00-9:00 | オンコール担当 | 技術リード |
| 土日 | 24時間 | オンコール担当 | 技術リード |

---

## 📊 レポーティング

### 日次レポート

**自動生成**: なし（必要に応じて手動確認）

**確認項目**:
- Cloudflare Analytics
- エラー発生状況（Sentry）
- アップタイム（UptimeRobot）

### 週次レポート

**自動生成**: 毎週月曜日 10:00

**内容**:
- トラフィック統計
- パフォーマンスメトリクス
- エラー統計
- アップタイム統計

**配信先**: #libx-monitoring

### 月次レポート

**手動作成**: 毎月1日

**内容**:
- 月次トラフィック推移
- Lighthouseスコア推移
- 主要改善項目
- 次月の目標

**配信先**: プロダクトオーナー、技術リード、QAリード

---

## 🎯 モニタリング設定チェックリスト

### Layer 1: Cloudflare Analytics

- [ ] Web Analytics有効化
- [ ] Core Web Vitals監視
- [ ] トラフィックアラート設定
- [ ] エラーレートアラート設定

### Layer 2: Lighthouse CI

- [ ] GitHub Actions設定確認
- [ ] .lighthouserc.json設定
- [ ] 週次本番測定スクリプト作成
- [ ] 月次レポートテンプレート作成

### Layer 3: Error Monitoring

- [ ] Sentryプロジェクト作成（オプション）
- [ ] DSN取得（オプション）
- [ ] アラート設定（オプション）

### Layer 4: Uptime Monitoring

- [ ] UptimeRobot設定
- [ ] モニター作成（3モニター）
- [ ] アラート設定
- [ ] ステータスページ作成

### Layer 5: Custom Dashboard

- [ ] Grafana Cloud設定（オプション）
- [ ] 週次レポート自動生成スクリプト
- [ ] Slackチャンネル作成

---

## 📎 関連ドキュメント

- [phase-4-3-production-deployment-plan.md](./phase-4-3-production-deployment-plan.md) - 本番デプロイ計画書
- [phase-4-3-cloudflare-setup-guide.md](./phase-4-3-cloudflare-setup-guide.md) - Cloudflare設定ガイド
- [phase-4-3-deployment-runbook.md](./phase-4-3-deployment-runbook.md) - デプロイランブック（作成予定）
- [troubleshooting.md](../guides/troubleshooting.md) - トラブルシューティング

---

## 🎉 まとめ

モニタリング・観測設定が完了すると、以下が実現されます:

**主要機能**:
- ✅ リアルタイムトラフィック監視（Cloudflare Analytics）
- ✅ 継続的なパフォーマンス品質保証（Lighthouse CI）
- ✅ エラー・例外検知（Sentry）
- ✅ 死活監視（UptimeRobot）
- ✅ 統合ダッシュボード
- ✅ 多層アラート体制

**次のステップ**:
1. ローンチ判定会資料作成（phase-4-3-launch-readiness-review.md）
2. デプロイランブック作成（phase-4-3-deployment-runbook.md）

---

**作成者**: Claude Code (AI Assistant)
**作成日**: 2025-10-26
**最終更新**: 2025-10-26
**ステータス**: 📝 設定計画書
