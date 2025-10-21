# マイグレーション手順書

**バージョン**: 1.0.0
**作成日**: 2025-10-21
**最終更新**: 2025-10-21
**Phase**: 3-6（ドキュメント整備）

---

## 📋 目次

1. [概要](#概要)
2. [対象プロジェクト](#対象プロジェクト)
3. [推奨移行スケジュール](#推奨移行スケジュール)
4. [移行手順](#移行手順)
5. [libx-docs特有の手順](#libx-docs特有の手順)
6. [ロールバック手順](#ロールバック手順)
7. [チェックリスト](#チェックリスト)
8. [実際の移行実績](#実際の移行実績)

---

## 概要

このドキュメントは、libx-devプロジェクトから新レジストリ形式への**完全な移行手順**を提供します。

### 目的

- 既存プロジェクトを新レジストリ形式へ安全に移行
- データ損失のリスクを最小化
- 段階的で検証可能な移行プロセスの提供

### 対象読者

- **移行作業担当者**: 実際に移行作業を実施する方
- **テックリード**: 移行作業を承認・監督する方
- **QA担当者**: ビルド・デプロイテストを実施する方

### 前提条件

- ✅ Phase 3-4完了（CI/自動化インフラ実装済み）
- ✅ Phase 3-5完了（移行作業計画策定済み）
- ✅ Node.js 18以降がインストール済み
- ✅ `docs-cli`がインストール済み（`packages/cli`）
- ✅ GitHub Actionsの実行権限あり

---

## 対象プロジェクト

Phase 3-5で棚卸しした4プロジェクトを移行します。

### 1. project-template（プロジェクトテンプレート）

| 項目 | 値 |
|-----|-----|
| **プロジェクトID** | `project-template` |
| **優先度** | 🔴 高（テンプレートとして使用） |
| **言語数** | 2言語（en, ja） |
| **バージョン数** | 1バージョン（v1） |
| **推奨移行順序** | **1番目**（最小規模、テスト用途） |
| **想定作業時間** | 2時間 |

**移行の目的**: 移行手順の確立とCI動作確認

---

### 2. test-verification（検証テスト）

| 項目 | 値 |
|-----|-----|
| **プロジェクトID** | `test-verification` |
| **優先度** | 🟡 中（多言語検証に重要） |
| **言語数** | 3言語（en, ja, ko） |
| **バージョン数** | 2バージョン（v1, v2） |
| **推奨移行順序** | **2番目**（多言語対応の検証） |
| **想定作業時間** | 4時間 |

**移行の目的**: 3言語対応プロジェクトでの移行検証

---

### 3. sample-docs（サンプルドキュメント）

| 項目 | 値 |
|-----|-----|
| **プロジェクトID** | `sample-docs` |
| **優先度** | 🟡 中（デモとして重要） |
| **言語数** | 2言語（en, ja） |
| **バージョン数** | 2バージョン（v1, v2） |
| **推奨移行順序** | **3番目**（本格移行） |
| **想定作業時間** | 5時間 |

**移行の目的**: デモサイトとしての品質確保

---

### 4. libx-docs（LibXドキュメント）

| 項目 | 値 |
|-----|-----|
| **プロジェクトID** | `libx-docs` |
| **優先度** | 🟢 低（廃止予定） |
| **言語数** | 2言語（en, ja） |
| **バージョン数** | 1バージョン（v1） |
| **推奨移行順序** | **4番目**（最終移行・廃止準備） |
| **想定作業時間** | 7時間 |

**移行の目的**: libx-docsリポジトリの廃止準備

---

## 推奨移行スケジュール

Phase 3-5で策定したスケジュールに従います。

### 全体タイムライン

```
2025-10-21  2025-10-22      2025-10-28      2025-11-04      2025-11-15
    |           |               |               |               |
    |           |<-- Sprint 1 ->|<-- Sprint 2 ->|<-- Sprint 3 ->|
    |           |               |               |               |
 Phase 3-5  開始準備    project-template  test-verification  sample-docs + libx-docs
  計画完了
                                                                 Phase 3 完了
```

### Sprint 1: project-template（2025-10-22〜2025-10-27）

**期間**: 6日間

**目標**: 最小規模プロジェクトでの移行手順の確立

| 日付 | タスク |
|-----|-------|
| **10/21（月）** | Phase 3-5計画完了 |
| **10/22（火）** | CI環境準備、バックアップ設定確認 |
| **10/23（水）** | project-template Dry-run |
| **10/24（木）** | project-template変換・検証 |
| **10/25（金）** | project-template本番実行 |
| **10/26（土）** | 週次レビュー |

**完了基準**:
- ✅ project-templateが新レジストリ形式に変換
- ✅ Migration Workflowが正常動作
- ✅ ビルドテスト成功
- ✅ 移行手順がドキュメント化

---

### Sprint 2: test-verification（2025-10-28〜2025-11-03）

**期間**: 7日間

**目標**: 3言語対応プロジェクトでの移行検証

| 日付 | タスク |
|-----|-------|
| **10/28（月）** | Sprint 1レビュー、改善点の洗い出し |
| **10/29（火）** | test-verification Dry-run |
| **10/30（水）** | 韓国語（ko）コンテンツ確認 |
| **10/31（木）** | test-verification変換・検証 |
| **11/01（金）** | test-verification本番実行 |
| **11/02（土）** | 週次レビュー |

**完了基準**:
- ✅ test-verificationが新レジストリ形式に変換
- ✅ 3言語すべてが正しく処理
- ✅ 多言語対応手順の確立

---

### Sprint 3: sample-docs + libx-docs（2025-11-04〜2025-11-15）

**期間**: 12日間

**目標**: sample-docsとlibx-docsの移行完了、libx-docs廃止準備

#### 前半: sample-docs（2025-11-04〜2025-11-08）

| 日付 | タスク |
|-----|-------|
| **11/04（月）** | Sprint 2レビュー |
| **11/05（火）** | sample-docs Dry-run |
| **11/06（水）** | v1/v2差分確認 |
| **11/07（木）** | sample-docs変換・検証 |
| **11/08（金）** | sample-docs本番実行 |

#### 後半: libx-docs（2025-11-11〜2025-11-15）

| 日付 | タスク |
|-----|-------|
| **11/09（土）** | 週次レビュー |
| **11/11（月）** | libx-docs最終同期 |
| **11/12（火）** | libx-docs Dry-run |
| **11/13（水）** | libx-docs変換・検証 |
| **11/14（木）** | libx-docs本番実行 |
| **11/15（金）** | Phase 3完了レポート作成 |

**完了基準**:
- ✅ sample-docsが新レジストリ形式に変換
- ✅ libx-docsが新レジストリ形式に変換
- ✅ libx-docsリポジトリ廃止手順が確定

---

## 移行手順

各プロジェクトの移行は、以下の5ステップで実施します。

### ステップ1: 準備（Preparation）

**目的**: 移行前の準備と環境確認

#### 1.1. バックアップの作成

```bash
# Git commitで現在の状態を保存
git add .
git commit -m "移行前のバックアップ: [project-name]"

# ブランチを作成（推奨）
git checkout -b migration/[project-name]
```

#### 1.2. CI設定の確認

```bash
# .docs-cli/config.ci.jsonの確認
cat .docs-cli/config.ci.json

# 推奨設定
# {
#   "migrate": {
#     "maxBackups": 20,  # バックアップ世代数
#     "dryRun": false
#   },
#   "validate": {
#     "strict": true
#   }
# }
```

#### 1.3. 現在の状態の確認

```bash
# プロジェクト設定の確認
cat apps/[project-id]/src/config/project.config.json

# コンテンツ構造の確認
tree apps/[project-id]/src/content/docs
```

---

### ステップ2: 変換（Conversion）

**目的**: 既存形式から新レジストリ形式へ変換

#### 2.1. Dry-run実行

**重要**: 必ずDry-runで事前確認してください。

```bash
# GitHub Actionsで実行（推奨）
# リポジトリ > Actions > Migration Workflow > Run workflow
# 入力:
#   project: [project-id]
#   version: v1
#   mode: new-cli
#   dry-run: true  # 重要
```

または、ローカルで実行:

```bash
pnpm exec docs-cli migrate-from-libx \
  --source apps/[project-id] \
  --project-id [project-id] \
  --dry-run
```

#### 2.2. Dry-run結果の確認

```bash
# GitHub ActionsのArtifactsから以下をダウンロード:
# - migration-reports/
#   - migration-checklist.md
#   - compatibility-report.html
#   - compatibility-report.json

# ローカル実行の場合:
# - コンソール出力を確認
# - 警告・エラーメッセージに注目
```

#### 2.3. 問題の修正（必要な場合）

Dry-run結果で問題が見つかった場合、修正します。

**よくある問題**:
- カテゴリ名に日本語が含まれる → リネーム
- docIDが重複 → ユニークなIDに変更
- 必須フィールドが不足 → 追加
- ライセンス情報が不足 → 追加

**参照**: [FAQ - Q4: 互換性チェックで警告が出ました](./migration-faq.md#q4-互換性チェックで警告が出ました)

#### 2.4. 本番実行

問題がなければ、本番実行します。

```bash
# GitHub Actionsで実行（推奨）
# 入力:
#   project: [project-id]
#   version: v1
#   mode: new-cli
#   dry-run: false  # 本番実行
```

または、ローカルで実行:

```bash
pnpm exec docs-cli migrate-from-libx \
  --source apps/[project-id] \
  --project-id [project-id]
```

---

### ステップ3: 検証（Verification）

**目的**: 変換結果の正確性を確認

#### 3.1. レジストリの確認

```bash
# 変換されたレジストリを確認
cat registry/docs.json | jq '.projects[] | select(.id=="[project-id]")'

# プロジェクト情報
cat registry/docs.json | jq '.projects[] | select(.id=="[project-id]") | {id, name, languages, versions}'

# ドキュメント数
cat registry/docs.json | jq '.projects[] | select(.id=="[project-id]") | .documents | length'
```

#### 3.2. 互換性チェック

```bash
# 互換性チェック実行
pnpm exec docs-cli compat check

# 詳細レポート生成
pnpm exec docs-cli compat report

# HTMLレポートを開く
open compatibility-report.html
```

#### 3.3. スキーマバリデーション

```bash
# スキーマバリデーション実行
pnpm exec docs-cli validate

# 詳細モード
pnpm exec docs-cli validate --verbose
```

---

### ステップ4: レビュー（Review）

**目的**: 差分レポートのレビューと承認

#### 4.1. 差分レポートの取得

```bash
# GitHub ActionsのArtifactsから取得
# Artifacts > migration-reports > ダウンロード

# 以下のファイルが含まれます:
# - migration-checklist.md
# - compatibility-report.html
# - compatibility-report.json
# - compatibility-report.csv
```

#### 4.2. レビュー項目

**重要な確認項目**:
- ✅ プロジェクト情報（ID、名前、説明）
- ✅ 言語設定（言語数、表示名）
- ✅ バージョン設定（バージョン数、ラベル）
- ✅ カテゴリ構造（カテゴリ数、順序）
- ✅ ドキュメント数（想定数と一致するか）
- ✅ コンテンツメタ情報（syncHash、lastUpdated）
- ✅ ライセンス情報（sources、translationLicense）

**差分の種類**:
- 🟢 緑色（追加）: 新規追加されたデータ
- 🟡 黄色（変更）: 変更されたデータ
- 🔴 赤色（削除）: 削除されたデータ

**参照**: [差分レポートガイド](./diff-report.md)

#### 4.3. レビュー結果の記録

```markdown
# レビュー結果記録

## プロジェクト: [project-id]
## レビュー日: 2025-XX-XX
## レビュー担当者: [担当者名]

**差分レポート**: migration-reports-YYYYMMDD/compatibility-report.html

**レビュー結果**:
- [x] 重大差分なし
- [ ] 軽微な差分のみ（詳細: ...）
- [ ] 要修正（詳細: ...）

**承認/却下**: ✅ 承認 / ❌ 却下

**コメント**: （具体的なコメント）

**次のアクション**: （必要な場合）
```

---

### ステップ5: 承認とデプロイ（Approval & Deployment）

**目的**: 承認後のビルド・デプロイテスト

#### 5.1. サイドバー生成

```bash
# サイドバーJSON生成
pnpm build:sidebar

# または特定プロジェクトのみ
pnpm build:sidebar-selective
# → 対話式でプロジェクトを選択
```

#### 5.2. ビルドテスト

```bash
# ローカルビルドテスト
pnpm build

# または特定プロジェクトのみ
pnpm --filter=[project-id] build
```

**ビルド成功の確認**:
```bash
# dist/ディレクトリの確認
ls -la dist/

# プロジェクトのビルド結果を確認
ls -la dist/docs/[project-id]/
```

#### 5.3. デプロイテスト（任意）

```bash
# Cloudflare Pagesにデプロイ（本番環境）
pnpm deploy

# またはプレビューデプロイ
# GitHub PRを作成すると自動的にプレビューデプロイされる
```

#### 5.4. 承認とマージ

```bash
# レビュー完了後、mainブランチにマージ
git checkout main
git merge migration/[project-id]
git push origin main
```

---

## libx-docs特有の手順

libx-docsは外部リポジトリとの同期が必要なため、特別な手順があります。

### 最終同期（2025-11-11実施予定）

**目的**: libx-docsリポジトリとの最終同期を実施

#### ステップ1: Git履歴確認

```bash
# libx-docsリポジトリの変更履歴を確認
cd ../libx-docs
git log --oneline --since="2025-10-01"

# 最終更新日時
git log -1 --format="%ai"

# 未コミットの変更があるか確認
git status
```

#### ステップ2: syncHashによる差分検出

```bash
# libx-devに戻る
cd ../libx-dev

# 同期状態の確認
pnpm exec docs-cli validate --check-sync

# 詳細な差分表示
pnpm exec docs-cli validate --check-sync --verbose
```

#### ステップ3: 最終バックアップ作成

```bash
# Dry-runモードでバックアップ作成
pnpm exec docs-cli migrate-from-libx \
  --source ../libx-docs \
  --project-id libx-docs \
  --dry-run \
  --backup

# バックアップの確認
ls -lt .backups/
```

---

### 移行実行（2025-11-12〜2025-11-14実施予定）

**目的**: libx-docsを新レジストリ形式へ変換

#### ステップ1: Dry-run実行

```bash
# GitHub ActionsでDry-run実行
# 入力:
#   project: libx-docs
#   version: v1
#   mode: new-cli
#   dry-run: true
```

#### ステップ2: ライセンス情報の確認

```bash
# project.config.jsonのlicensingセクション確認
cat apps/libx-docs/src/config/project.config.json | jq '.licensing'

# レジストリに正しく変換されているか確認
cat registry/docs.json | jq '.projects[] | select(.id=="libx-docs") | .licensing'
```

**参照**: [FAQ - Q17: ライセンス情報が不足しています](./migration-faq.md#q17-ライセンス情報が不足しています)

#### ステップ3: 本番実行

```bash
# GitHub Actionsで本番実行
# 入力:
#   project: libx-docs
#   version: v1
#   mode: new-cli
#   dry-run: false
```

#### ステップ4: ビルド・デプロイテスト

```bash
# ビルドテスト
pnpm --filter=libx-docs build

# デプロイテスト（プレビュー環境）
# GitHub PRを作成してプレビュー確認
```

---

### リポジトリ廃止（2025-11-15実施予定）

**目的**: libx-docsリポジトリをアーカイブ化

#### ステップ1: README更新

```bash
# libx-docsリポジトリのREADME更新
cd ../libx-docs
```

```markdown
# LibX Docs

**⚠️ このリポジトリはアーカイブされました**

このリポジトリは2025年11月15日にアーカイブ化されました。
全コンテンツは[libx-dev](https://github.com/your-org/libx-dev)に移行されています。

## 移行先

- **新リポジトリ**: https://github.com/your-org/libx-dev
- **新しいコンテンツ**: libx-dev/apps/libx-docs
- **新レジストリ**: libx-dev/registry/docs.json

## 過去の履歴

このリポジトリのGit履歴は保持されており、Read-onlyで参照可能です。
```

#### ステップ2: GitHubでアーカイブ化

```bash
# GitHubリポジトリ設定
# Settings > General > Danger Zone > Archive this repository

# アーカイブ化すると:
# - Read-onlyになる
# - 新規PR・Issueの作成不可
# - ファイルの編集不可
# - Git historyは保持される
```

#### ステップ3: 関連ドキュメント・スクリプトの更新

```bash
# libx-devに戻る
cd ../libx-dev

# libx-docs関連のスクリプトを削除または更新
# - scripts/sync-content.js（削除または非推奨化）
# - docs/LIBX_DOCS_SYNC.md（アーカイブ化の旨を追記）
# - CLAUDE.md（libx-docs関連の記述を更新）
```

**参照**: [DECISIONS.md - libx-docs廃止決定](../DECISIONS.md)

---

## ロールバック手順

移行作業中に問題が発生した場合のロールバック手順です。

### 方法1: Gitでのロールバック（推奨）

```bash
# 直前のコミットに戻る
git reset --hard HEAD

# 特定のコミットに戻る
git log --oneline  # コミットハッシュを確認
git reset --hard <commit-hash>

# リモートブランチにも反映（強制プッシュ）
git push --force origin migration/[project-name]
```

---

### 方法2: .backups/からの復元

```bash
# バックアップ一覧の確認
ls -lt .backups/

# 最新のバックアップから復元
# 例: backup-20251022-120000
cp -r .backups/backup-20251022-120000/* ./

# 復元後、変更をコミット
git add .
git commit -m "ロールバック: バックアップから復元"
```

---

### 方法3: Artifactsからの復元

```bash
# GitHub ActionsのArtifactsから復元

# 1. GitHub > Actions > Migration Workflow > 実行履歴
# 2. Artifacts > migration-reports > ダウンロード
# 3. 必要なファイルを手動で復元
```

---

## チェックリスト

各プロジェクトの移行時に使用するチェックリストです。

### 準備フェーズ

- [ ] Gitでバックアップを作成
- [ ] 移行ブランチを作成（`migration/[project-name]`）
- [ ] CI設定を確認（`.docs-cli/config.ci.json`）
- [ ] 現在のプロジェクト設定を確認（`project.config.json`）
- [ ] コンテンツ構造を確認

---

### 変換フェーズ

- [ ] Dry-run実行（GitHub Actions推奨）
- [ ] Dry-run結果を確認（Artifactsまたはコンソール）
- [ ] 警告・エラーを修正（必要な場合）
- [ ] 本番実行（GitHub Actions推奨）
- [ ] 実行ログを確認

---

### 検証フェーズ

- [ ] レジストリを確認（`registry/docs.json`）
- [ ] プロジェクト情報が正しいか確認
- [ ] ドキュメント数が一致するか確認
- [ ] 互換性チェック実行（`docs-cli compat check`）
- [ ] スキーマバリデーション実行（`docs-cli validate`）

---

### レビューフェーズ

- [ ] 差分レポートを取得（Artifacts）
- [ ] HTML形式で視覚的にレビュー
- [ ] 重大差分がないか確認（🔴赤色）
- [ ] レビュー結果を記録
- [ ] 承認または却下の判断

---

### デプロイフェーズ

- [ ] サイドバー生成（`pnpm build:sidebar`）
- [ ] ビルドテスト実行（`pnpm build`）
- [ ] ビルド成功を確認（`dist/`ディレクトリ）
- [ ] デプロイテスト実行（任意）
- [ ] mainブランチにマージ
- [ ] 週次レポート作成

---

## 実際の移行実績

このセクションは、Sprint 1-3の実施後に実績を記録します。

### Sprint 1（project-template）

**実施期間**: 2025-10-22〜2025-10-27
**ステータス**: （実施後に記入）

#### 実績サマリー

- **実際にかかった時間**: （記入）時間（予定: 2時間）
- **発生した問題**: （記入）
- **解決方法**: （記入）
- **手順の改善点**: （記入）

#### 詳細ログ

（実施後に記入）

---

### Sprint 2（test-verification）

**実施期間**: 2025-10-28〜2025-11-03
**ステータス**: （実施後に記入）

#### 実績サマリー

- **実際にかかった時間**: （記入）時間（予定: 4時間）
- **発生した問題**: （記入）
- **解決方法**: （記入）
- **手順の改善点**: （記入）

#### 詳細ログ

（実施後に記入）

---

### Sprint 3（sample-docs + libx-docs）

**実施期間**: 2025-11-04〜2025-11-15
**ステータス**: （実施後に記入）

#### sample-docs実績サマリー

- **実際にかかった時間**: （記入）時間（予定: 5時間）
- **発生した問題**: （記入）
- **解決方法**: （記入）
- **手順の改善点**: （記入）

#### libx-docs実績サマリー

- **実際にかかった時間**: （記入）時間（予定: 7時間）
- **発生した問題**: （記入）
- **解決方法**: （記入）
- **手順の改善点**: （記入）

#### 詳細ログ

（実施後に記入）

---

## 改訂履歴

| バージョン | 日付 | 変更内容 | 変更者 |
|-----------|------|---------|--------|
| v1.0 | 2025-10-21 | 初版作成（Phase 3-6タスク1） | Claude Code |
| v1.1 | （Sprint 1完了後） | Sprint 1実績を反映 | TBD |
| v1.2 | （Sprint 2完了後） | Sprint 2実績を反映 | TBD |
| v2.0 | （Sprint 3完了後） | Sprint 3実績を反映（最終版） | TBD |

---

## 関連ドキュメント

### Phase 3-5成果物

- [移行ダッシュボード](../status/migration-dashboard.md) - プロジェクト棚卸し、ステータス管理
- [移行スケジュール](../status/migration-schedule.md) - Sprint計画、マイルストーン
- [移行リスクログ](../status/migration-risks.md) - リスク評価、緩和策
- [コミュニケーション計画](../status/communication-plan.md) - 週次レポート、エスカレーション

### Phase 3ガイド

- [データ移行ガイド](./migration-data.md) - データ変換の詳細
- [差分レポートガイド](./diff-report.md) - レポートの見方、レビュー手順
- [FAQ/トラブルシューティング](./migration-faq.md) - よくある問題と解決方法
- [互換レイヤーガイド](./compat-layer.md) - 互換モードの使い方
- [CI実行例](../examples/ci.md) - Migration Workflowの実行方法

### 意思決定

- [DECISIONS.md](../DECISIONS.md) - libx-docs廃止決定など

---

**最終更新**: 2025-10-21
**作成者**: Claude Code (AI Assistant)
