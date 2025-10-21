# 移行FAQ・トラブルシューティング

**作成日**: 2025-10-21
**最終更新**: 2025-10-21
**Phase**: 3-6（ドキュメント整備）

---

## 📋 目次

1. [概要](#概要)
2. [データ損失・バックアップ関連](#データ損失バックアップ関連)
3. [互換性・ビルド関連](#互換性ビルド関連)
4. [翻訳・コンテンツ関連](#翻訳コンテンツ関連)
5. [libx-docs関連](#libx-docs関連)
6. [CI/自動化関連](#ci自動化関連)
7. [スケジュール関連](#スケジュール関連)
8. [その他](#その他)
9. [Sprint実施中に発生した問題](#sprint実施中に発生した問題)

---

## 概要

このドキュメントは、libx-devプロジェクトから新レジストリ形式への移行作業における**よくある質問（FAQ）**と**トラブルシューティング**をまとめたものです。

### 対象読者

- **移行作業担当者**: 実際に移行作業を実施する方
- **レビュー担当者**: 差分レポートをレビューする方
- **プロジェクトマネージャー**: 進捗とリスクを管理する方

### 使い方

1. **問題が発生した場合**: カテゴリ別に該当する問題を検索
2. **事前確認**: 移行前にリスクと対処法を把握
3. **実績の追加**: Sprint実施後に新たな問題を追記

### 参照元

このFAQは、Phase 3-5で作成した[移行リスクログ](../status/migration-risks.md)の10個のリスク（R1-R10）を元に作成されています。

---

## データ損失・バックアップ関連

### Q1: データ損失が心配です。どうすればよいですか？

**リスク**: R1 - データ損失リスク（影響度: 🔴 高、発生確率: 低）

**回答**: 以下の3層のバックアップ戦略で安全を確保しています。

#### 対処法

**レイヤー1: 自動バックアップ**
- `.backups/`ディレクトリでの自動バックアップ
- `migrate-from-libx`実行時に自動作成
- maxBackups設定（デフォルト: 10、推奨: 20）

```bash
# バックアップ設定の確認
cat .docs-cli/config.ci.json | grep maxBackups
```

**レイヤー2: Dry-runモードでの事前確認**
```bash
# 実際に変更せずに確認
pnpm exec docs-cli migrate-from-libx \
  --source apps/sample-docs \
  --project-id sample-docs \
  --dry-run
```

**レイヤー3: Git commitで履歴管理**
```bash
# 移行前に必ずコミット
git add .
git commit -m "移行前のバックアップ"

# 問題があればロールバック
git reset --hard HEAD
```

#### 確認方法

```bash
# バックアップの確認
ls -la .backups/

# 最新バックアップのタイムスタンプ確認
ls -lt .backups/ | head -5
```

**参照**: [移行リスクログ - R1](../status/migration-risks.md#r1-データ損失リスク最優先)

---

### Q2: バックアップが大量に溜まってしまいました

**リスク**: R9 - バックアップ肥大化（影響度: 🟢 低、発生確率: 高）

**回答**: 定期的なクリーンアップで管理できます。

#### 対処法

**方法1: 古いバックアップの削除**
```bash
# 30日以上前のバックアップを削除
find .backups/ -mtime +30 -delete

# 削除前に確認
find .backups/ -mtime +30 -ls
```

**方法2: maxBackups設定の調整**
```json
// .docs-cli/config.ci.json
{
  "migrate": {
    "maxBackups": 20  // 移行期間中は増やす（通常は10）
  }
}
```

**方法3: 重要なバックアップはArtifactsにも保存**
- Migration WorkflowのArtifactに自動保存
- 30日間保持（設定により60日に延長可能）
- GitHub ActionsのArtifactsタブからダウンロード可能

#### 確認方法

```bash
# バックアップディレクトリのサイズ確認
du -sh .backups/

# バックアップ世代数の確認
ls .backups/ | wc -l
```

**参照**: [移行リスクログ - R9](../status/migration-risks.md#r9-バックアップ肥大化監視)

---

### Q3: ロールバックが必要になった場合は？

**回答**: 3つのロールバック方法があります。

#### 方法1: Gitでのロールバック（推奨）

```bash
# 直前のコミットに戻る
git reset --hard HEAD

# 特定のコミットに戻る
git log --oneline  # コミットハッシュを確認
git reset --hard <commit-hash>
```

#### 方法2: .backups/からの復元

```bash
# バックアップ一覧の確認
ls -lt .backups/

# 特定のバックアップから復元
cp -r .backups/backup-20251022-120000/* ./
```

#### 方法3: Artifactsからの復元

1. GitHub Actionsの「Actions」タブを開く
2. Migration Workflowの実行履歴を選択
3. Artifactsセクションから`migration-reports`をダウンロード
4. 必要なファイルを復元

**参照**: [データ移行ガイド - エラーハンドリングとロールバック](./migration-data.md#エラーハンドリングとロールバック)

---

## 互換性・ビルド関連

### Q4: 互換性チェックで警告が出ました

**リスク**: R2 - 互換性問題（影響度: 🟡 中、発生確率: 中）

**回答**: 警告の種類に応じて対応します。

#### 対処法

**ステップ1: エラー内容の確認**
```bash
# 互換性チェック実行
pnpm exec docs-cli compat check

# 詳細レポート生成
pnpm exec docs-cli compat report
```

**ステップ2: 警告の種類別対応**

| 警告種別 | 意味 | 対応方法 |
|---------|------|---------|
| `deprecated-command` | 旧コマンドを使用 | 新コマンドへ移行 |
| `missing-field` | 必須フィールドが不足 | レジストリに追加 |
| `schema-mismatch` | スキーマバージョン不一致 | スキーマバージョンを更新 |
| `invalid-docId` | docIDの形式が不正 | docID形式を修正 |
| `broken-reference` | 参照先が存在しない | 参照を修正または削除 |

**ステップ3: レポート確認**
```bash
# HTML形式のレポート確認（ブラウザで開く）
open compatibility-report.html

# GitHub ActionsのArtifactから確認
# 1. リポジトリの「Actions」タブ
# 2. Migration Workflow実行履歴
# 3. Artifacts > compat-check-log
```

#### 確認方法

```bash
# 警告の総数確認
pnpm exec docs-cli compat check | grep "warning" | wc -l

# エラーの総数確認
pnpm exec docs-cli compat check | grep "error" | wc -l
```

**参照**:
- [移行リスクログ - R2](../status/migration-risks.md#r2-互換性問題優先)
- [互換レイヤーガイド](./compat-layer.md)

---

### Q5: ビルドエラーが発生しました

**リスク**: R4 - ビルドエラー（影響度: 🟡 中、発生確率: 中）

**回答**: エラーメッセージから原因を特定します。

#### よくあるエラーと解決方法

**エラー1: `Module not found`**
```bash
# 原因: 依存関係のインストール不足
# 解決: 依存関係を再インストール
pnpm install
```

**エラー2: `Invalid frontmatter`**
```markdown
# 原因: MDXフロントマターの構文エラー

# 解決: フロントマターを修正
---
title: "正しいタイトル"
description: "説明文"
---
```

**エラー3: `Schema validation failed`**
```bash
# 原因: レジストリスキーマ不一致
# 解決: スキーマバリデーション実行
pnpm exec docs-cli validate

# エラー詳細を確認
pnpm exec docs-cli validate --verbose
```

**エラー4: `Build timeout`**
```yaml
# 原因: ビルド時間超過
# 解決: GitHub Actionsのタイムアウトを延長

# .github/workflows/migration.yml
jobs:
  build:
    timeout-minutes: 30  # デフォルト: 20
```

#### 確認方法

**ローカルでのビルドテスト**
```bash
# ローカルビルド実行
pnpm build

# 特定プロジェクトのみビルド
pnpm --filter=sample-docs build
```

**GitHub Actionsでの確認**
1. Migration Workflowの実行ログを確認
2. Artifactsから`build-logs`をダウンロード
3. エラースタックトレースを確認

**参照**: [移行リスクログ - R4](../status/migration-risks.md#r4-ビルドエラー優先)

---

### Q6: 互換モードと新CLIモードの違いは？

**回答**: 以下の比較表を参照してください。

| 項目 | new-cliモード（推奨） | compatモード |
|-----|---------------------|-------------|
| **コマンド** | `docs-cli add-language` | `node scripts/add-language` |
| **パフォーマンス** | 高速 | やや遅い（ラッパー経由） |
| **警告表示** | なし | 非推奨警告が表示される |
| **サポート期間** | 無期限 | 2026-03-31まで |
| **推奨用途** | 新規作業すべて | 既存ワークフローの移行時のみ |

**移行推奨タイムライン**:
```
2025-10-21: Phase 3-4完了（CI/自動化実装）
2025-11-15: Phase 3完了（移行作業完了）
2026-03-31: 互換モードサポート終了 ← サポート期限
```

**参照**: [互換レイヤーガイド](./compat-layer.md#サポート期間)

---

## 翻訳・コンテンツ関連

### Q7: 未翻訳のコンテンツがあります

**リスク**: R3 - 未翻訳コンテンツ（影響度: 🟡 中、発生確率: 高）

**回答**: 翻訳状況を記録し、段階的に対応します。

#### 対処法

**ステップ1: 未翻訳コンテンツの確認**
```bash
# 未翻訳コンテンツをチェック
pnpm exec docs-cli validate --check-missing

# レジストリで確認
cat registry/docs.json | jq '.projects[] | select(.id=="sample-docs") | .documents[] | select(.content.ja.status=="missing")'
```

**ステップ2: `status`フィールドで記録**
```json
{
  "documents": [
    {
      "docId": "getting-started",
      "content": {
        "en": {
          "status": "published"
        },
        "ja": {
          "status": "missing",  // 未翻訳
          "lastUpdated": null
        },
        "ko": {
          "status": "draft"  // ドラフト
        }
      }
    }
  ]
}
```

**ステップ3: 翻訳作業の計画**
- 優先度の高いページから翻訳
- `status: "missing"`で一時的に非表示
- 翻訳完了後に`status: "published"`へ更新

#### ステータスの意味

| ステータス | 意味 | サイトでの表示 |
|-----------|------|-------------|
| `published` | 公開済み | 表示される |
| `draft` | ドラフト | 表示されない（設定により表示可能） |
| `missing` | 未翻訳 | 表示されない |
| `outdated` | 古い翻訳 | 警告付きで表示 |

#### 確認方法

```bash
# 移行ダッシュボードで未翻訳コンテンツ数を確認
cat docs/new-generator-plan/status/migration-dashboard.md | grep "未翻訳"

# 差分レポートで翻訳状況を確認
open migration-reports/compatibility-report.html
```

**参照**: [移行リスクログ - R3](../status/migration-risks.md#r3-未翻訳コンテンツ優先)

---

### Q8: 言語間でディレクトリ構造が異なります

**回答**: 言語間の整合性を確保する必要があります。

#### 対処法

**問題の例**:
```
apps/sample-docs/src/content/docs/v1/
├── en/
│   ├── 01-guide/
│   │   └── 01-getting-started.mdx
│   └── 02-reference/
│       └── 01-api.mdx
└── ja/
    └── 01-guide/  # 02-reference/ が欠けている
        └── 01-getting-started.mdx
```

**解決方法1: ディレクトリを作成**
```bash
# 欠けているディレクトリを作成
mkdir -p apps/sample-docs/src/content/docs/v1/ja/02-reference/
```

**解決方法2: プレースホルダーファイルを作成**
```bash
# プレースホルダーファイルを作成
touch apps/sample-docs/src/content/docs/v1/ja/02-reference/01-api.mdx
```

```markdown
---
title: "API リファレンス"
description: "翻訳準備中"
---

# API リファレンス

このページは翻訳準備中です。英語版を参照してください: [English Version](/v1/en/reference/api/)
```

**解決方法3: レジストリで`status: "missing"`**
```json
{
  "content": {
    "ja": {
      "status": "missing"
    }
  }
}
```

#### 確認方法

```bash
# ディレクトリ構造の比較
diff -r apps/sample-docs/src/content/docs/v1/en/ apps/sample-docs/src/content/docs/v1/ja/

# ファイル数の比較
echo "EN: $(find apps/sample-docs/src/content/docs/v1/en/ -type f | wc -l)"
echo "JA: $(find apps/sample-docs/src/content/docs/v1/ja/ -type f | wc -l)"
```

---

## libx-docs関連

### Q9: libx-docsは今後も使えますか？

**リスク**: R6 - libx-docs同期状態の不一致（影響度: 🟡 中、発生確率: 中）

**回答**: libx-docsは **2025-11-15にアーカイブ化（Read-only化）** 予定です。

#### 廃止の理由

1. **新レジストリ形式への移行完了**
   - 全コンテンツを新レジストリで管理可能
   - 外部リポジトリの維持が不要

2. **二重管理のコスト削減**
   - 同期スクリプトのメンテナンスコスト削減
   - 同期状態の不一致リスク回避

3. **シンプルな運用フローの実現**
   - 単一リポジトリ（libx-dev）での完結
   - モノレポ構造の利点を最大化

#### 廃止手順（3フェーズ）

**フェーズ1: 最終同期（2025-11-11実施予定）**
```bash
# 1. Git履歴確認
cd ../libx-docs
git log --oneline --since="2025-10-01"

# 2. syncHashによる差分検出
cd ../libx-dev
pnpm exec docs-cli validate --check-sync

# 3. 最終バックアップ作成
pnpm exec docs-cli migrate-from-libx \
  --source ../libx-docs \
  --project-id libx-docs \
  --dry-run \
  --backup
```

**フェーズ2: 移行実行（2025-11-12〜2025-11-14実施予定）**
- 新レジストリ形式への変換
- ビルド・デプロイテスト
- 移行完了確認

**フェーズ3: リポジトリ廃止（2025-11-15実施予定）**
- README更新（「このリポジトリはアーカイブされました」）
- GitHubで「Archive this repository」実行
- libx-devへの参照リンクを追加

**参照**:
- [DECISIONS.md - libx-docs廃止決定](../DECISIONS.md)
- [移行リスクログ - R6](../status/migration-risks.md#r6-libx-docs同期状態の不一致優先)

---

### Q10: libx-docsの過去の履歴はどうなりますか？

**回答**: GitHubでアーカイブ化され、Read-onlyで参照可能です。

#### 詳細

**アーカイブ後の状態**:
- ✅ Git履歴は保持される
- ✅ Read-onlyで参照可能
- ❌ 新規PR・Issueの作成不可
- ❌ ファイルの編集不可

**参照方法**:
```bash
# アーカイブ後も閲覧可能
# URL: https://github.com/your-org/libx-docs (Read-only)

# 必要に応じてクローン可能
git clone https://github.com/your-org/libx-docs
```

**参照**: [DECISIONS.md - フェーズ3: リポジトリ廃止](../DECISIONS.md)

---

### Q11: libx-docsの同期状態を確認したい

**回答**: `syncHash`を使用して差分を検出できます。

#### 確認方法

**方法1: CLIコマンド**
```bash
# 同期状態の確認
pnpm exec docs-cli validate --check-sync

# 詳細な差分表示
pnpm exec docs-cli validate --check-sync --verbose
```

**方法2: Gitでの確認**
```bash
# libx-docsの最終更新日時
cd ../libx-docs
git log -1 --format="%ai"

# libx-dev/apps/libx-docsの最終更新日時
cd ../libx-dev/apps/libx-docs
git log -1 --format="%ai"
```

**方法3: syncHashの比較**
```bash
# レジストリのsyncHashを確認
cat registry/docs.json | jq '.projects[] | select(.id=="libx-docs") | .documents[] | .content.en.syncHash'

# 実際のファイルのハッシュを計算
find apps/libx-docs/src/content/docs -name "*.mdx" -exec md5sum {} \;
```

#### 不一致が見つかった場合

1. 最新のlibx-docsリポジトリをpull
2. 差分を確認
3. 必要に応じて手動で同期
4. 最終同期（2025-11-11）で完全に同期

---

## CI/自動化関連

### Q12: CI環境の設定を間違えたかもしれません

**リスク**: R8 - CI環境の設定ミス（影響度: 🟢 低、発生確率: 低）

**回答**: 設定ファイルと実行ログを確認します。

#### 対処法

**ステップ1: 設定ファイルの確認**
```bash
# .docs-cli/config.ci.jsonの確認
cat .docs-cli/config.ci.json

# サンプル設定と比較
diff .docs-cli/config.ci.json .docs-cli/config.ci.example.json
```

**ステップ2: 必須フィールドのチェック**
```json
{
  "migrate": {
    "maxBackups": 20,  // 必須
    "dryRun": false    // 必須
  },
  "validate": {
    "strict": true     // 推奨
  }
}
```

**ステップ3: GitHub Actions Secretsの確認**
```bash
# リポジトリ設定で確認
# Settings > Secrets and variables > Actions

# 必須Secrets
# - GITHUB_TOKEN (自動設定)

# 任意Secrets（将来的）
# - SLACK_WEBHOOK_URL
# - CODECOV_TOKEN
```

**ステップ4: テスト実行**
```yaml
# GitHub Actions UIで最小構成でテスト
project: project-template
version: v1
mode: new-cli
dry-run: true
```

#### 確認方法

**GitHub Actionsのログ確認**
1. リポジトリの「Actions」タブ
2. Migration Workflowの実行履歴
3. エラーがないか確認

**Artifactの生成確認**
- `compat-check-log`: 生成されているか
- `migration-reports`: 生成されているか
- `build-logs`: 生成されているか（dry-run=false時のみ）

**参照**:
- [移行リスクログ - R8](../status/migration-risks.md#r8-ci環境の設定ミス監視)
- [CI実行例](../examples/ci.md)

---

### Q13: Migration Workflowが失敗します

**回答**: エラーの種類に応じて対応します。

#### よくあるエラー

**エラー1: `Permission denied`**
```bash
# 原因: GITHUB_TOKENの権限不足
# 解決: リポジトリ設定で権限を確認

# Settings > Actions > General > Workflow permissions
# "Read and write permissions" を選択
```

**エラー2: `Timeout exceeded`**
```yaml
# 原因: ワークフローのタイムアウト
# 解決: timeout-minutesを延長

# .github/workflows/migration.yml
jobs:
  migrate:
    timeout-minutes: 30  # デフォルト: 20
```

**エラー3: `Artifact upload failed`**
```bash
# 原因: Artifactサイズ超過
# 解決: 不要なファイルを除外

# .github/workflows/migration.yml
- uses: actions/upload-artifact@v4
  with:
    name: migration-reports
    path: |
      migration-*.md
      compatibility-report.*
      !**/*.log  # ログファイルを除外
```

#### 確認方法

```bash
# ワークフロー実行ログの確認
# GitHub > Actions > Migration Workflow > 実行履歴 > ログ

# エラーメッセージの検索
# ログ内で "error" または "failed" を検索
```

---

### Q14: Artifactが見つかりません

**回答**: 保持期間と実行履歴を確認します。

#### Artifactの保持期間

| Artifact | 保持期間 | 設定 |
|---------|---------|------|
| migration-reports | 30日（推奨: 60日） | retentionDays設定 |
| compat-check-log | 7日 | デフォルト |
| build-logs | 7日 | デフォルト |

**保持期間の延長方法**:
```yaml
# .github/workflows/migration.yml
- uses: actions/upload-artifact@v4
  with:
    name: migration-reports
    retention-days: 60  # 60日に延長
```

#### 確認方法

**ステップ1: 実行履歴の確認**
1. リポジトリの「Actions」タブ
2. Migration Workflowを選択
3. 実行履歴から該当の実行を検索

**ステップ2: Artifactsセクションの確認**
- 実行詳細ページの下部にArtifactsセクション
- 保持期間内のArtifactが表示される

**ステップ3: ローカルバックアップの確認**
```bash
# ローカルの.backups/ディレクトリを確認
ls -lt .backups/
```

---

## スケジュール関連

### Q15: スケジュールが遅れています

**リスク**: R10 - スケジュール遅延（影響度: 🟡 中、発生確率: 中）

**回答**: 進捗を確認し、スケジュールを調整します。

#### 対処法

**ステップ1: 進捗の確認**
```bash
# 移行ダッシュボードでステータス確認
cat docs/new-generator-plan/status/migration-dashboard.md

# どのプロジェクトで遅延しているか特定
# どのステップで詰まっているか確認
```

**ステップ2: リスクログの見直し**
```bash
# 該当するリスクを確認
cat docs/new-generator-plan/status/migration-risks.md

# 緩和策を実施
```

**ステップ3: スケジュールの再調整**

**調整パターン1: Sprint延長**
```
元のSprint 1: 2025-10-22〜2025-10-27（6日間）
延長後: 2025-10-22〜2025-10-29（8日間）+2日
```

**調整パターン2: 優先度の見直し**
```
優先度: 高
- project-template（必須）
- test-verification（多言語検証に必要）

優先度: 中
- sample-docs（デモサイト、延期可能）

優先度: 低
- libx-docs（廃止予定、Phase 3後でも可）
```

**調整パターン3: リソース追加**
- 追加の人員配置
- 作業時間の延長
- 並行作業の実施

#### 確認方法

**マイルストーンとの比較**
```bash
# 移行スケジュールのマイルストーンを確認
cat docs/new-generator-plan/status/migration-schedule.md | grep "マイルストーン"

# 現在の進捗と比較
# M1: Phase 3-5計画完了（2025-10-21） - 完了
# M2: Sprint 1完了（2025-10-27） - 未完了
```

**週次レポートで進捗を可視化**
```markdown
# docs/new-generator-plan/status/migration-weekly-20251026.md

## 進捗状況

- 予定: Sprint 1完了（2025-10-27）
- 実績: 2日遅延（2025-10-29完了予定）
- 遅延理由: 互換性チェックで予期しない警告が多数発生
```

**参照**:
- [移行リスクログ - R10](../status/migration-risks.md#r10-スケジュール遅延優先)
- [移行スケジュール](../status/migration-schedule.md)

---

### Q16: エスカレーションが必要な場合は？

**回答**: レベル別のエスカレーションパスに従います。

#### エスカレーションレベル

| レベル | 問題の種類 | 対応者 | 対応期限 | 報告方法 |
|-------|----------|--------|---------|---------|
| **L1** | 軽微な警告 | 開発担当 | 即座 | リスクログに記録 |
| **L2** | 互換性エラー | テックリード | 1日以内 | リスクログ + 週次レポート |
| **L3** | ビルド失敗 | テックリード + QA担当 | 2日以内 | リスクログ + DECISIONS.md |
| **L4** | 重大な問題 | 全員 | 緊急対応 | インシデントレポート作成 |

#### エスカレーションフロー

```
問題発生
  ↓
レベル判定（L1-L4）
  ↓
L1: リスクログに記録 → 開発担当が即座に対応
L2: 週次レポートで報告 → テックリード確認（1日以内）
L3: DECISIONS.mdに記録 → テックリード + QA担当（2日以内）
L4: 緊急ミーティング → 全員で対応、ロールバック検討
```

**参照**: [コミュニケーション計画 - エスカレーションパス](../status/communication-plan.md#エスカレーションパス)

---

## その他

### Q17: ライセンス情報が不足しています

**リスク**: R5 - ライセンス情報の不備（影響度: 🟡 中、発生確率: 低）

**回答**: project.config.jsonのlicensingセクションを確認します。

#### 対処法

**ステップ1: ライセンス情報の確認**
```json
// apps/sample-docs/src/config/project.config.json
{
  "licensing": {
    "sources": [
      {
        "id": "original-docs",
        "name": "Original Documentation",
        "author": "Original Author",
        "license": "MIT",  // ライセンスを確認
        "licenseUrl": "https://example.com/LICENSE",
        "sourceUrl": "https://example.com/docs"
      }
    ]
  }
}
```

**ステップ2: レジストリへの変換時に引き継ぎ**
```bash
# migrate-from-libxが自動変換
pnpm exec docs-cli migrate-from-libx \
  --source apps/sample-docs \
  --project-id sample-docs

# レジストリで確認
cat registry/docs.json | jq '.projects[] | select(.id=="sample-docs") | .licensing'
```

**ステップ3: 手動で不足情報を追加**
```json
// registry/docs.json
{
  "projects": [
    {
      "id": "sample-docs",
      "licensing": {
        "sources": [
          {
            "id": "original-docs",
            "name": "Original Documentation",
            "author": "Original Author",
            "license": "MIT",
            "licenseUrl": "https://example.com/LICENSE",
            "sourceUrl": "https://example.com/docs",
            "translationLicense": "CC BY 4.0",  // 翻訳ライセンス
            "translators": ["Translator Name"]  // 翻訳者
          }
        ]
      }
    }
  ]
}
```

**ステップ4: 原文サイトでライセンスを確認**
- 翻訳元のライセンス情報を確認
- 再配布可否と帰属表示を明記
- 必要に応じて連絡先を記録

#### 確認方法

```bash
# バリデーション実行
pnpm exec docs-cli validate --check-licenses

# 生成されたサイトでライセンス表示を確認
pnpm build
# ブラウザで http://localhost:3000/ を開く
# フッターのライセンス表示を確認
```

**参照**:
- [移行リスクログ - R5](../status/migration-risks.md#r5-ライセンス情報の不備優先)
- [PROJECT_PRINCIPLES.md - 法務・ライセンス](../../PROJECT_PRINCIPLES.md#7-法務ライセンス)

---

### Q18: 手動作業が多すぎます

**リスク**: R7 - 手動作業の増加（影響度: 🟢 低、発生確率: 中）

**回答**: Dry-runで事前確認し、手動補正箇所を記録します。

#### 対処法

**ステップ1: Dry-runで事前確認**
```bash
# 変換プレビューを確認
pnpm exec docs-cli migrate-from-libx \
  --source apps/sample-docs \
  --project-id sample-docs \
  --dry-run

# 警告メッセージを確認
# "Manual intervention required" のメッセージに注目
```

**ステップ2: 手動補正箇所の記録**
```markdown
# 手動補正ログ

## project-template（2025-10-25）

### 箇所1: カテゴリ名の修正
- ファイル: apps/project-template/src/content/docs/v1/en/01-guide/
- 問題: カテゴリ名に日本語が含まれる
- 対応: `01-ガイド/` → `01-guide/` にリネーム

### 箇所2: docIDの修正
- ファイル: registry/docs.json
- 問題: docIDが重複
- 対応: `getting-started` → `getting-started-v1` に変更
```

**ステップ3: 次回移行時の改善に反映**
```bash
# 改善案を記録
# docs/new-generator-plan/status/migration-improvements.md

## 改善案1: カテゴリ名のバリデーション強化
- 実装: CLIでカテゴリ名のバリデーションを追加
- 効果: 日本語カテゴリ名を自動検出

## 改善案2: docID重複チェック
- 実装: migrate-from-libx実行時に重複チェック
- 効果: 手動修正を削減
```

#### 確認方法

```bash
# 移行レポートで警告カウント
cat migration-reports/migration-checklist.md | grep "Manual intervention" | wc -l

# 作業時間の計測（タイムトラッキングツールを使用）
```

**参照**: [移行リスクログ - R7](../status/migration-risks.md#r7-手動作業の増加監視)

---

## Sprint実施中に発生した問題

このセクションは、Sprint 1-3の実施中に発生した実際の問題を記録します。

### Sprint 1（project-template）

**実施期間**: 2025-10-22〜2025-10-27

#### 問題1: （実施後に記入）

**発生日**: （記入）
**影響**: （記入）
**原因**: （記入）
**解決方法**: （記入）
**再発防止策**: （記入）

---

### Sprint 2（test-verification）

**実施期間**: 2025-10-28〜2025-11-03

#### 問題1: （実施後に記入）

**発生日**: （記入）
**影響**: （記入）
**原因**: （記入）
**解決方法**: （記入）
**再発防止策**: （記入）

---

### Sprint 3（sample-docs + libx-docs）

**実施期間**: 2025-11-04〜2025-11-15

#### 問題1: （実施後に記入）

**発生日**: （記入）
**影響**: （記入）
**原因**: （記入）
**解決方法**: （記入）
**再発防止策**: （記入）

---

## 更新履歴

| 日付 | 更新者 | 変更内容 |
|-----|--------|---------|
| 2025-10-21 | Claude Code | 初版作成（Phase 3-6タスク5） |
| （Sprint 1完了後） | TBD | Sprint 1の実績を追加 |
| （Sprint 2完了後） | TBD | Sprint 2の実績を追加 |
| （Sprint 3完了後） | TBD | Sprint 3の実績を追加 |

---

## 関連ドキュメント

- [移行リスクログ](../status/migration-risks.md) - このFAQの元となったリスク評価
- [移行ダッシュボード](../status/migration-dashboard.md) - 進捗状況の確認
- [移行スケジュール](../status/migration-schedule.md) - Sprint計画とマイルストーン
- [データ移行ガイド](./migration-data.md) - データ変換の詳細
- [互換レイヤーガイド](./compat-layer.md) - 互換モードの使い方
- [CI実行例](../examples/ci.md) - Migration Workflowの実行方法
- [DECISIONS.md](../DECISIONS.md) - libx-docs廃止決定など

---

**最終更新**: 2025-10-21
**作成者**: Claude Code (AI Assistant)
