# Phase 4-3: デプロイランブック（実行手順書）

**作成日**: 2025-10-26
**作成者**: Claude (Phase 4-3 Release Preparation)
**ステータス**: 📝 実行手順書
**バージョン**: v1.0.0
**想定実施日**: 2025-11-01（金）14:00-16:00 JST

---

## 📋 概要

本ドキュメントは、本番環境へのデプロイを実施する際の詳細な手順書（ランブック）です。デプロイ担当者はこの手順に従って作業を進めてください。

### 使用方法

1. **デプロイ前**: 本ドキュメント全体を一読し、手順を理解する
2. **デプロイ中**: 各ステップを順番に実行し、チェックボックスにチェックを入れる
3. **デプロイ後**: 完了報告を記録し、関係者に通知する

### 担当者情報

| 役割 | 担当者 | 連絡先 | 備考 |
|-----|-------|--------|------|
| **デプロイリーダー** | [名前] | [Slack/電話] | 全体統括 |
| **技術担当** | [名前] | [Slack/電話] | デプロイ実行 |
| **QA担当** | [名前] | [Slack/電話] | 動作確認 |
| **インフラ担当** | [名前] | [Slack/電話] | Cloudflare操作 |
| **プロダクトオーナー** | [名前] | [Slack/電話] | 最終承認 |

### 緊急連絡先

**緊急時**: #libx-deployment-emergency

**技術リード**: [電話番号]
**プロダクトオーナー**: [電話番号]

---

## ⏱️ デプロイタイムライン

| 時刻 | フェーズ | 所要時間 | 担当者 |
|------|---------|---------|--------|
| 13:30-14:00 | Phase 0: 事前準備 | 30分 | デプロイリーダー |
| 14:00-14:15 | Phase 1: デプロイ前チェック | 15分 | 技術担当 |
| 14:15-14:20 | Phase 2: デプロイ実行 | 5分 | 技術担当 |
| 14:20-15:00 | Phase 3: ビルド・デプロイ待機 | 40分 | 自動実行 |
| 15:00-15:40 | Phase 4: デプロイ後確認 | 40分 | QA担当 |
| 15:40-16:00 | Phase 5: 完了報告 | 20分 | デプロイリーダー |

**総所要時間**: 2時間30分

---

## 📝 Phase 0: 事前準備（13:30-14:00）

### ステップ0.1: チーム集合確認

**実施時刻**: 13:30

- [ ] デプロイリーダー: 待機確認
- [ ] 技術担当: 待機確認
- [ ] QA担当: 待機確認
- [ ] インフラ担当: 待機確認
- [ ] プロダクトオーナー: 待機確認（オプション）

**Slackメッセージ**:
```
@channel デプロイチーム集合確認 🚀

本番デプロイを13:30より開始します。
各担当者は準備完了したら ✅ リアクションをお願いします。

**デプロイ情報**:
- バージョン: v1.0.0
- 開始予定: 14:00 JST
- 完了予定: 16:00 JST
```

### ステップ0.2: 環境確認

**実施時刻**: 13:35

**ローカル環境確認**:

```bash
# Node.jsバージョン確認
node --version
# 期待値: v20.x.x

# pnpmバージョン確認
pnpm --version
# 期待値: v9.x.x

# Gitバージョン確認
git --version
# 期待値: v2.30.0以上
```

**確認結果**:
- [ ] Node.js: v20.x.x
- [ ] pnpm: v9.x.x
- [ ] Git: v2.30.0以上

### ステップ0.3: 権限確認

**実施時刻**: 13:40

**Cloudflare Dashboard**:
- [ ] ログイン可能
- [ ] libxプロジェクトへのアクセス権限あり
- [ ] API Tokenが有効

**GitHub**:
- [ ] mainブランチへのプッシュ権限あり
- [ ] GitHub Actionsの確認権限あり

### ステップ0.4: ステークホルダーへの通知

**実施時刻**: 13:45

**Slackメッセージ**:
```
@channel 本番デプロイを開始します 🚀

**デプロイ情報**:
- 環境: 本番（Cloudflare Pages）
- バージョン: v1.0.0
- 開始時刻: 2025-11-01 14:00 JST
- 推定完了時刻: 2025-11-01 16:00 JST

**デプロイ担当**:
- デプロイリーダー: [名前]
- 技術担当: [名前]
- QA担当: [名前]

**進捗報告**: このチャンネルで随時更新します
**緊急連絡先**: [電話番号]
```

**送信確認**:
- [ ] Slack #libx-deployment に投稿
- [ ] Slack #general に通知（オプション）
- [ ] メール送信（プロダクトオーナー宛）

---

## ✅ Phase 1: デプロイ前チェック（14:00-14:15）

### ステップ1.1: コード品質チェック

**実施時刻**: 14:00

**実行コマンド**:

```bash
# モノレポルートへ移動
cd /path/to/libx-dev

# Lintチェック
pnpm lint
```

**期待結果**: エラー0件

**確認結果**:
- [ ] ✅ Lint成功
- [ ] エラー数: 0件

**フォーマットチェック**:

```bash
pnpm prettier --check .
```

**期待結果**: 警告のみ許容

**確認結果**:
- [ ] ✅ フォーマットチェック完了
- [ ] 警告のみ（エラーなし）

**テスト実行**:

```bash
pnpm test:coverage
```

**期待結果**: 全テスト成功、カバレッジ60%以上

**確認結果**:
- [ ] ✅ 全テスト成功（325/325）
- [ ] カバレッジ: 60.28%以上

**レジストリバリデーション**:

```bash
pnpm validate
```

**期待結果**: バリデーション成功

**確認結果**:
- [ ] ✅ バリデーション成功

### ステップ1.2: ビルドチェック

**実施時刻**: 14:05

**サイドバーJSON生成**:

```bash
pnpm build:sidebar
```

**期待結果**: JSONファイル生成成功

**確認**:
```bash
find apps/*/src/generated -name "sidebar-*.json" -type f
```

**確認結果**:
- [ ] ✅ JSONファイル生成成功
- [ ] ファイル数: [記録]

**ビルド実行**:

```bash
pnpm build
```

**期待結果**: ビルド成功、エラー0件

**確認結果**:
- [ ] ✅ ビルド成功
- [ ] エラー数: 0件
- [ ] 警告数: [記録]

**ビルド成果物確認**:

```bash
# ビルド成果物の確認
ls -la dist/

# ビルドサイズ確認
du -sh dist/

# HTMLファイル数確認
find dist/ -name "*.html" | wc -l
```

**確認結果**:
- [ ] ✅ dist/ディレクトリ存在
- [ ] ビルドサイズ: [記録] MB
- [ ] HTMLファイル数: [記録] ファイル

### ステップ1.3: ローカルプレビュー確認

**実施時刻**: 14:10

**プレビューサーバー起動**:

```bash
# demo-docsプレビュー
cd apps/demo-docs
pnpm preview --port 4321 &

# sample-docsプレビュー
cd ../sample-docs
pnpm preview --port 4322 &
```

**動作確認**:

| URL | 期待結果 | 確認結果 |
|-----|---------|---------|
| http://localhost:4321/v1/en/getting-started/ | 正常表示 | [ ] ✅ / [ ] ❌ |
| http://localhost:4321/v1/ja/getting-started/ | 正常表示 | [ ] ✅ / [ ] ❌ |
| http://localhost:4322/docs/sample-docs/v1/en/ | 正常表示 | [ ] ✅ / [ ] ❌ |
| http://localhost:4322/docs/sample-docs/v1/ja/ | 正常表示 | [ ] ✅ / [ ] ❌ |

**確認項目**:
- [ ] ページが正常に表示される
- [ ] サイドバーが表示される
- [ ] ヘッダー・フッターが表示される
- [ ] 検索機能が動作する（sample-docs）
- [ ] 言語切替が動作する

**プレビューサーバー停止**:
```bash
# プレビューサーバーを停止
pkill -f "pnpm preview"
```

### ステップ1.4: Gitタグ作成

**実施時刻**: 14:13

```bash
# モノレポルートへ戻る
cd /path/to/libx-dev

# タグ作成
git tag -a v1.0.0 -m "Release v1.0.0 - Initial production deployment"

# タグをリモートにプッシュ
git push origin v1.0.0
```

**確認結果**:
- [ ] ✅ タグ作成成功
- [ ] ✅ リモートへプッシュ成功

**コミットハッシュ記録**:

```bash
# 現在のコミットハッシュを記録（切り戻し用）
git log -1 --oneline > deployment-commit-v1.0.0.txt
cat deployment-commit-v1.0.0.txt
```

**記録**:
```
コミットハッシュ: [記録]
コミットメッセージ: [記録]
```

---

## 🚀 Phase 2: デプロイ実行（14:15-14:20）

### ステップ2.1: デプロイ開始通知

**実施時刻**: 14:15

**Slackメッセージ**:
```
✅ デプロイ前チェック完了

**チェック結果**:
- ✅ Lint: 成功
- ✅ テスト: 325/325成功
- ✅ ビルド: 成功
- ✅ ローカルプレビュー: 正常

**次のステップ**:
mainブランチへのマージを開始します。
GitHub Actionsが自動的にデプロイを実行します。

**推定所要時間**: 約40分
```

**送信確認**:
- [ ] Slack投稿完了

### ステップ2.2: mainブランチへのマージ

**実施時刻**: 14:16

**事前確認**:

```bash
# 現在のブランチ確認
git branch --show-current

# 最新のmainブランチを取得
git fetch origin main
git checkout main
git pull origin main
```

**確認結果**:
- [ ] 最新のmainブランチに切り替わった

**マージまたはプッシュ**:

**ケース1: stagingブランチをマージする場合**

```bash
# stagingブランチをmainにマージ
git merge staging -m "chore: production deployment v1.0.0"

# リモートにプッシュ
git push origin main
```

**ケース2: 直接プッシュする場合**

```bash
# 既にmainブランチで作業している場合
git push origin main
```

**確認結果**:
- [ ] ✅ マージ成功
- [ ] ✅ リモートへプッシュ成功
- [ ] プッシュ時刻: [記録]

### ステップ2.3: GitHub Actions確認

**実施時刻**: 14:17

**GitHub Actionsページにアクセス**:

URL: https://github.com/[owner]/libx-dev/actions

**ワークフロー実行確認**:

- [ ] ワークフロー名: `Deploy to Production` または `Build and Deploy`
- [ ] トリガー: push (main)
- [ ] ステータス: 実行中（黄色の丸）

**実行ログの確認**:

ワークフローをクリックして詳細ページを開く

**確認項目**:
- [ ] pre-deployment-checksジョブが開始された
- [ ] ログにエラーがない

**進捗報告**:

**Slackメッセージ**:
```
🚀 デプロイ実行開始

**GitHub Actions**:
- ワークフロー: Deploy to Production
- トリガー: push to main
- ステータス: 実行中 🟡

**進捗**:
現在、pre-deployment-checksジョブを実行中です。
ビルド・デプロイには約40分かかります。

**GitHub Actions URL**: [URL]
```

**送信確認**:
- [ ] Slack投稿完了

---

## ⏳ Phase 3: ビルド・デプロイ待機（14:20-15:00）

### ステップ3.1: GitHub Actionsの監視

**実施期間**: 14:20-15:00

**確認項目**:

| ジョブ | ステータス | 完了時刻 | 備考 |
|-------|----------|---------|------|
| pre-deployment-checks | [ ] 成功 / [ ] 失敗 | [記録] | Lint、Test、ビルド |
| deploy-production | [ ] 成功 / [ ] 失敗 | [記録] | Cloudflare Pagesデプロイ |
| lighthouse-check (オプション) | [ ] 成功 / [ ] 失敗 | [記録] | Lighthouseスコア測定 |

**ログ確認**:

- [ ] pre-deployment-checksのログを確認
  - [ ] Lintエラーなし
  - [ ] テストエラーなし
  - [ ] ビルドエラーなし

- [ ] deploy-productionのログを確認
  - [ ] ビルド成功
  - [ ] Cloudflare Pagesへのデプロイ成功
  - [ ] デプロイURLが表示される

**デプロイURL記録**:
```
デプロイURL: [GitHub Actionsログから記録]
デプロイID: [GitHub Actionsログから記録]
```

### ステップ3.2: Cloudflare Pagesでの確認

**実施時刻**: [deploy-production完了後]

**Cloudflare Dashboardにアクセス**:

1. https://dash.cloudflare.com/ にログイン
2. `Workers & Pages` → `libx` を選択
3. `Deployments` タブを開く

**確認項目**:

- [ ] 最新のデプロイが"Success"になっている
- [ ] デプロイURL: [記録]
- [ ] デプロイ時刻: [記録]
- [ ] コミットハッシュ: [記録]

**スクリーンショット撮影**:
- [ ] Cloudflare Dashboardのデプロイ成功画面をスクリーンショット

### ステップ3.3: 進捗報告

**実施時刻**: [deploy-production完了後]

**Slackメッセージ**:
```
✅ デプロイ完了

**デプロイ情報**:
- デプロイURL: https://libx.pages.dev
- デプロイ時刻: 2025-11-01 [時刻] JST
- バージョン: v1.0.0
- コミット: [コミットハッシュ]

**次のステップ**:
現在、動作確認中です。
Lighthouseスコア測定、機能テストを実施します。

**推定完了時刻**: 15:40
```

**送信確認**:
- [ ] Slack投稿完了

---

## 🔍 Phase 4: デプロイ後確認（15:00-15:40）

### ステップ4.1: 基本動作確認

**実施時刻**: 15:00

**アクセス確認（curl）**:

```bash
# demo-docs英語版
curl -I https://libx.pages.dev/v1/en/getting-started/

# demo-docs日本語版
curl -I https://libx.pages.dev/v1/ja/getting-started/

# sample-docs英語版
curl -I https://libx.pages.dev/docs/sample-docs/v1/en/
```

**期待結果**: すべてHTTP 200

**確認結果**:

| URL | HTTPステータス | 結果 |
|-----|---------------|------|
| /v1/en/getting-started/ | [記録] | [ ] ✅ / [ ] ❌ |
| /v1/ja/getting-started/ | [記録] | [ ] ✅ / [ ] ❌ |
| /docs/sample-docs/v1/en/ | [記録] | [ ] ✅ / [ ] ❌ |

**手動動作確認**:

ブラウザで以下のURLにアクセスし、目視確認:

| 確認項目 | URL | 期待結果 | 結果 |
|---------|-----|---------|------|
| トップページ | https://libx.pages.dev/ | 正常表示 | [ ] ✅ / [ ] ❌ |
| 英語版ページ | https://libx.pages.dev/v1/en/getting-started/ | 正常表示 | [ ] ✅ / [ ] ❌ |
| 日本語版ページ | https://libx.pages.dev/v1/ja/getting-started/ | 正常表示 | [ ] ✅ / [ ] ❌ |
| サイドバー | - | 表示・動作する | [ ] ✅ / [ ] ❌ |
| ヘッダー | - | 正常表示 | [ ] ✅ / [ ] ❌ |
| フッター | - | 正常表示 | [ ] ✅ / [ ] ❌ |
| スキップリンク | - | フォーカス時表示 | [ ] ✅ / [ ] ❌ |

**sample-docs確認**:

| 確認項目 | URL | 期待結果 | 結果 |
|---------|-----|---------|------|
| 英語版v1 | https://libx.pages.dev/docs/sample-docs/v1/en/ | 正常表示 | [ ] ✅ / [ ] ❌ |
| 日本語版v1 | https://libx.pages.dev/docs/sample-docs/v1/ja/ | 正常表示 | [ ] ✅ / [ ] ❌ |
| 英語版v2 | https://libx.pages.dev/docs/sample-docs/v2/en/ | 正常表示 | [ ] ✅ / [ ] ❌ |
| 検索機能 | - | 検索結果表示 | [ ] ✅ / [ ] ❌ |
| バージョン切替 | - | 動作する | [ ] ✅ / [ ] ❌ |
| 言語切替 | - | 動作する | [ ] ✅ / [ ] ❌ |

### ステップ4.2: Lighthouseスコア測定

**実施時刻**: 15:15

**測定コマンド**:

```bash
# demo-docs英語版
lighthouse https://libx.pages.dev/v1/en/getting-started/ \
  --output=html --output=json \
  --output-path=lighthouse-prod-demo-en-v1.0.0 \
  --chrome-flags="--headless"

# demo-docs日本語版
lighthouse https://libx.pages.dev/v1/ja/getting-started/ \
  --output=html --output=json \
  --output-path=lighthouse-prod-demo-ja-v1.0.0 \
  --chrome-flags="--headless"

# sample-docs英語版
lighthouse https://libx.pages.dev/docs/sample-docs/v1/en/ \
  --output=html --output=json \
  --output-path=lighthouse-prod-sample-en-v1.0.0 \
  --chrome-flags="--headless"
```

**スコア記録**:

| ページ | Performance | Accessibility | Best Practices | SEO | 総合評価 |
|-------|-------------|---------------|----------------|-----|---------|
| demo-docs/en | [記録] | [記録] | [記録] | [記録] | [ ] ✅ / [ ] ❌ |
| demo-docs/ja | [記録] | [記録] | [記録] | [記録] | [ ] ✅ / [ ] ❌ |
| sample-docs/en | [記録] | [記録] | [記録] | [記録] | [ ] ✅ / [ ] ❌ |

**目標値確認**:

| メトリクス | 目標値 | すべてのページで達成 |
|----------|-------|------------------|
| Performance | 90以上 | [ ] ✅ / [ ] ❌ |
| Accessibility | 95以上 | [ ] ✅ / [ ] ❌ |
| Best Practices | 90以上 | [ ] ✅ / [ ] ❌ |
| SEO | 90以上 | [ ] ✅ / [ ] ❌ |

### ステップ4.3: 機能テスト

**実施時刻**: 15:30

**検索機能テスト（sample-docs）**:

1. https://libx.pages.dev/docs/sample-docs/v1/en/ にアクセス
2. 検索ボックスに「getting started」を入力
3. 検索結果が表示されることを確認
4. 検索結果をクリックして該当ページに遷移することを確認

**確認結果**:
- [ ] ✅ 検索結果が表示された
- [ ] ✅ 検索結果ページに遷移できた

**言語切替テスト**:

1. 英語版ページで言語切替UIをクリック
2. 日本語版ページに切り替わることを確認
3. URLが `/en/` → `/ja/` に変わることを確認

**確認結果**:
- [ ] ✅ 言語切替が動作した
- [ ] ✅ URLが正しく変更された

**バージョン切替テスト（sample-docs）**:

1. v1ページでバージョン切替UIをクリック
2. v2ページに切り替わることを確認
3. URLが `/v1/` → `/v2/` に変わることを確認

**確認結果**:
- [ ] ✅ バージョン切替が動作した
- [ ] ✅ URLが正しく変更された

**アクセシビリティテスト**:

1. Tabキーで各要素にフォーカス
2. スキップリンクがフォーカス時に表示されることを確認
3. すべてのインタラクティブ要素がキーボードでアクセス可能なことを確認

**確認結果**:
- [ ] ✅ スキップリンクが表示された
- [ ] ✅ キーボード操作可能

---

## 📝 Phase 5: 完了報告（15:40-16:00）

### ステップ5.1: デプロイレコード作成

**実施時刻**: 15:40

**デプロイレコードファイル作成**:

**docs/new-generator-plan/status/deployment-record-v1.0.0.md**:

```markdown
# デプロイレコード v1.0.0

**デプロイ日時**: 2025-11-01 14:00-16:00 JST
**バージョン**: v1.0.0
**コミットハッシュ**: [記録]
**デプロイURL**: https://libx.pages.dev
**デプロイ担当者**: [名前]

## デプロイ結果

- ✅ ビルド成功
- ✅ デプロイ成功
- ✅ 動作確認完了
- ✅ Lighthouseスコア目標達成

## Lighthouseスコア

| ページ | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| demo-docs/en | [記録] | [記録] | [記録] | [記録] |
| demo-docs/ja | [記録] | [記録] | [記録] | [記録] |
| sample-docs/en | [記録] | [記録] | [記録] | [記録] |

## 問題・課題

- [問題があれば記録]
- [なければ「なし」と記載]

## 次のアクション

- [必要に応じて記録]
- [なければ「なし」と記載]

## 備考

- [その他記録事項]
```

**確認**:
- [ ] デプロイレコード作成完了

### ステップ5.2: ステークホルダーへの完了報告

**実施時刻**: 15:45

**Slackメッセージ**:
```
🎉 本番デプロイが正常に完了しました！

**デプロイ情報**:
- 環境: 本番（Cloudflare Pages）
- 完了時刻: 2025-11-01 16:00 JST
- バージョン: v1.0.0
- URL: https://libx.pages.dev

**動作確認結果**:
✅ 全ページアクセス可能
✅ 全機能正常動作
✅ Lighthouseスコア目標達成
   - Performance: [記録]点
   - Accessibility: [記録]点
   - Best Practices: [記録]点
   - SEO: [記録]点

**デプロイレコード**: docs/new-generator-plan/status/deployment-record-v1.0.0.md

**今後の予定**:
- モニタリング開始: 即座
- 運用チームへの引き継ぎ: 2025-11-02

皆様のご協力ありがとうございました！ 🙏
```

**送信確認**:
- [ ] Slack #libx-deployment に投稿
- [ ] Slack #general に通知（オプション）
- [ ] メール送信（プロダクトオーナー、運用チーム宛）

### ステップ5.3: GitHub Issueのクローズ

**実施時刻**: 15:50

**関連Issueをクローズ**:

```bash
# デプロイ関連Issueをクローズ
gh issue close <issue-number> -c "✅ v1.0.0本番デプロイ完了"
```

**確認**:
- [ ] Issue #[番号]: クローズ完了
- [ ] Issue #[番号]: クローズ完了（必要に応じて追加）

### ステップ5.4: モニタリング開始確認

**実施時刻**: 15:55

**Cloudflare Analytics確認**:
- [ ] Web Analytics有効化されている
- [ ] アクセスログが記録されている

**Lighthouse CI確認**:
- [ ] GitHub Actionsで継続的に測定される設定

**UptimeRobot確認**（設定済みの場合）:
- [ ] モニタリング開始
- [ ] アラート設定有効

### ステップ5.5: デプロイ完了

**実施時刻**: 16:00

**最終確認**:

- [ ] すべてのチェック項目が完了している
- [ ] デプロイレコードが作成されている
- [ ] ステークホルダーへ報告済み
- [ ] モニタリングが開始されている

**デプロイリーダー最終承認**:

- [ ] デプロイ成功を確認
- [ ] プロダクトオーナーに報告
- [ ] チーム解散通知

**Slackメッセージ**:
```
✅ デプロイ作業終了

本番デプロイが無事完了しました。
お疲れ様でした！

**デプロイチーム解散**: 16:00

今後はモニタリングを継続し、問題があれば #libx-alerts で通知します。
```

---

## 🚨 緊急時対応

### エラー発生時の対応フロー

**ステップ1: 状況確認**

- エラーメッセージを記録
- エラー発生箇所を特定（ビルド/デプロイ/動作確認）
- 影響範囲を評価

**ステップ2: 重大度判定**

| Level | 重大度 | 例 | 対応 |
|-------|-------|-----|------|
| Critical | サービス停止 | サイト全体ダウン | 即座に切り戻し |
| High | 重大な問題 | 主要機能停止 | 1時間以内に切り戻し判断 |
| Medium | 軽微な問題 | 一部ページ表示崩れ | 修正を試みる |

**ステップ3: エスカレーション**

1. 技術リードに連絡（Slack + 電話）
2. プロダクトオーナーに連絡（Criticalの場合）
3. #libx-deployment-emergency で状況共有

**ステップ4: 切り戻し実行**

切り戻しが必要と判断された場合:

**方法1: Cloudflare Dashboardでのロールバック（推奨）**

1. Cloudflare Dashboard → Workers & Pages → libx
2. Deployments タブを開く
3. 前回の正常版を選択
4. Manage deployment → Rollback to this deployment
5. 確認ダイアログで Rollback をクリック

**所要時間**: 約5分

**方法2: Git revertでの切り戻し**

```bash
# 問題のコミットをrevert
git revert HEAD

# リモートにプッシュ
git push origin main

# GitHub Actions自動実行を待つ
```

**所要時間**: 約15-20分

**ステップ5: インシデント報告**

切り戻し完了後、インシデントレポートを作成:

**docs/new-generator-plan/status/incident-report-[日付].md**:

```markdown
# インシデントレポート

**発生日時**: [記録]
**解決日時**: [記録]
**重大度**: Critical/High/Medium
**影響範囲**: [記録]

## 問題内容

[詳細記録]

## 対応内容

[対応手順記録]

## 根本原因

[原因分析]

## 再発防止策

[改善策]
```

---

## 📎 参照ドキュメント

- [phase-4-3-production-deployment-plan.md](./phase-4-3-production-deployment-plan.md) - 本番デプロイ計画書
- [phase-4-3-cloudflare-setup-guide.md](./phase-4-3-cloudflare-setup-guide.md) - Cloudflare設定ガイド
- [phase-4-3-monitoring-setup.md](./phase-4-3-monitoring-setup.md) - モニタリング設定ガイド
- [phase-4-3-launch-readiness-review.md](./phase-4-3-launch-readiness-review.md) - ローンチ判定会資料
- [troubleshooting.md](../guides/troubleshooting.md) - トラブルシューティング

---

## 🎉 まとめ

デプロイランブック（実行手順書）は、本番環境へのデプロイを安全かつ確実に実施するための詳細な手順書です。

**主要ポイント**:
- ✅ ステップバイステップの詳細手順
- ✅ チェックリスト形式で漏れなく実行
- ✅ 緊急時対応フロー完備
- ✅ 切り戻し手順明確化

**使用時の注意**:
1. デプロイ前に必ず全体を一読
2. 各ステップを順番に実行
3. チェックボックスを活用
4. 問題発生時は即座にエスカレーション

---

**作成者**: Claude Code (AI Assistant)
**作成日**: 2025-10-26
**最終更新**: 2025-10-26
**バージョン**: v1.0.0
**ステータス**: 📝 実行手順書
