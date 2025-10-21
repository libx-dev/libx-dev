# 移行スケジュール

**作成日**: 2025-10-21
**最終更新**: 2025-10-21
**Phase**: 3-5（移行作業計画）

---

## 📋 目次

1. [概要](#概要)
2. [全体タイムライン](#全体タイムライン)
3. [Sprint計画](#sprint計画)
4. [マイルストーン](#マイルストーン)
5. [リソース配分](#リソース配分)
6. [依存関係](#依存関係)
7. [調整ポイント](#調整ポイント)

---

## 概要

このドキュメントは、libx-devプロジェクトから新レジストリ形式への移行作業のスケジュールを定義します。

### 移行期間

- **開始日**: 2025-10-22（火）
- **終了予定日**: 2025-11-15（金）
- **期間**: 25日間（3週間 + 4日間）
- **スプリント数**: 3スプリント

### 移行対象

- **プロジェクト数**: 4プロジェクト
- **優先順序**:
  1. project-template（テスト・テンプレート）
  2. test-verification（多言語検証）
  3. sample-docs（本格移行）
  4. libx-docs（最終移行・廃止準備）

---

## 全体タイムライン

```
2025-10-21  2025-10-22      2025-10-28      2025-11-04      2025-11-15
    |           |               |               |               |
    |           |<-- Sprint 1 ->|<-- Sprint 2 ->|<-- Sprint 3 ->|
    |           |               |               |               |
 Phase 3-5  開始準備    project-template  test-verification  sample-docs + libx-docs
  計画完了
                                                                 Phase 3 完了
```

### 週次スケジュール

| 週 | 期間 | Sprint | 主要タスク |
|---|------|--------|-----------|
| **Week 1** | 10/21-10/27 | Sprint 1 | Phase 3-5計画完了、project-template移行 |
| **Week 2** | 10/28-11/03 | Sprint 2 | test-verification移行 |
| **Week 3** | 11/04-11/10 | Sprint 3（前半） | sample-docs移行 |
| **Week 4** | 11/11-11/15 | Sprint 3（後半） | libx-docs移行・廃止準備 |

---

## Sprint計画

### Sprint 1: プロジェクトテンプレート移行（2025-10-22〜2025-10-27）

**期間**: 6日間

**目標**: 最小規模プロジェクトでの移行手順の確立とテスト

#### タスク詳細

| 日付 | タスク | 成果物 | 担当 |
|-----|-------|--------|------|
| **10/21（月）** | Phase 3-5計画完了 | migration-dashboard.md, migration-schedule.md, migration-risks.md, DECISIONS.md更新 | Claude |
| **10/22（火）** | CI環境準備 | .docs-cli/config.ci.json調整、バックアップ設定確認 | TBD |
| **10/23（水）** | project-template Dry-run | Migration Workflow実行（dry-run: true） | TBD |
| **10/24（木）** | project-template変換・検証 | 変換結果レビュー、互換性チェック確認 | TBD |
| **10/25（金）** | project-template本番実行 | 本番変換、ビルドテスト、デプロイテスト | TBD |
| **10/26（土）** | 週次レビュー | migration-weekly-20251026.md作成 | TBD |
| **10/27（日）** | （予備日） | - | - |

#### 完了基準

- ✅ project-templateが新レジストリ形式に変換されている
- ✅ Migration Workflowが正常に動作している
- ✅ Artifactが正しく保存されている
- ✅ ビルドテストが成功している
- ✅ デプロイテストが成功している
- ✅ 移行手順がドキュメント化されている

#### 想定リスク

- CI環境の設定ミス → 事前にdry-runで確認
- 変換エラー → バックアップから復旧可能
- ビルドエラー → 互換性チェックで事前検出

---

### Sprint 2: 多言語検証プロジェクト移行（2025-10-28〜2025-11-03）

**期間**: 7日間

**目標**: 3言語（en/ja/ko）対応プロジェクトでの移行検証

#### タスク詳細

| 日付 | タスク | 成果物 | 担当 |
|-----|-------|--------|------|
| **10/28（月）** | Sprint 1レビュー | 改善点の洗い出し、手順のアップデート | TBD |
| **10/29（火）** | test-verification Dry-run | Migration Workflow実行（dry-run: true） | TBD |
| **10/30（水）** | 韓国語コンテンツ確認 | ko言語ファイルの存在確認、翻訳状況確認 | TBD |
| **10/31（木）** | test-verification変換・検証 | 変換結果レビュー、3言語整合性確認 | TBD |
| **11/01（金）** | test-verification本番実行 | 本番変換、ビルドテスト、デプロイテスト | TBD |
| **11/02（土）** | 週次レビュー | migration-weekly-20251102.md作成 | TBD |
| **11/03（日）** | （予備日） | - | - |

#### 完了基準

- ✅ test-verificationが新レジストリ形式に変換されている
- ✅ 3言語すべてが正しく処理されている
- ✅ ko言語の翻訳状況が明確化されている
- ✅ 多言語対応の移行手順が確立されている
- ✅ ビルドテストが成功している

#### 想定リスク

- ko言語コンテンツの未翻訳 → status: "missing"で記録
- 言語間の構造不整合 → 互換性チェックで検出
- バージョン管理の複雑化 → v1/v2の差分を明確化

---

### Sprint 3: 本格移行（2025-11-04〜2025-11-15）

**期間**: 12日間（2週間弱）

**目標**: sample-docsとlibx-docsの移行完了、libx-docs廃止準備

#### 前半: sample-docs移行（2025-11-04〜2025-11-08）

| 日付 | タスク | 成果物 | 担当 |
|-----|-------|--------|------|
| **11/04（月）** | Sprint 2レビュー | 改善点の洗い出し、手順のアップデート | TBD |
| **11/05（火）** | sample-docs Dry-run | Migration Workflow実行（dry-run: true） | TBD |
| **11/06（水）** | v1/v2差分確認 | バージョン間の差分確認、既存レジストリとのマージ確認 | TBD |
| **11/07（木）** | sample-docs変換・検証 | 変換結果レビュー、既存データとの整合性確認 | TBD |
| **11/08（金）** | sample-docs本番実行 | 本番変換、ビルドテスト、デプロイテスト | TBD |

#### 後半: libx-docs移行・廃止準備（2025-11-11〜2025-11-15）

| 日付 | タスク | 成果物 | 担当 |
|-----|-------|--------|------|
| **11/09（土）** | 週次レビュー | migration-weekly-20251109.md作成 | TBD |
| **11/10（日）** | （予備日） | - | - |
| **11/11（月）** | libx-docs最終同期 | libx-docsリポジトリとの最終同期確認 | TBD |
| **11/12（火）** | libx-docs Dry-run | Migration Workflow実行（dry-run: true） | TBD |
| **11/13（水）** | libx-docs変換・検証 | 変換結果レビュー、ライセンス情報確認 | TBD |
| **11/14（木）** | libx-docs本番実行 | 本番変換、ビルドテスト、デプロイテスト | TBD |
| **11/15（金）** | Phase 3完了レポート作成 | phase-3-completion-report.md作成、libx-docs廃止手順まとめ | TBD |

#### 完了基準

**sample-docs**:
- ✅ sample-docsが新レジストリ形式に変換されている
- ✅ v1とv2の両バージョンが正しく処理されている
- ✅ 既存registry/docs.jsonとのマージが成功している
- ✅ デモサイトとして正常に動作している

**libx-docs**:
- ✅ libx-docsが新レジストリ形式に変換されている
- ✅ libx-docsリポジトリとの同期が完了している
- ✅ ライセンス情報が正しく移行されている
- ✅ libx-docs廃止手順がドキュメント化されている

#### 想定リスク

- 既存レジストリとのマージ競合 → 事前にdry-runで確認
- libx-docs同期状態の不一致 → 最終同期を実施
- ライセンス情報の不備 → 互換性チェックで検出

---

## マイルストーン

### M1: Phase 3-5計画完了（2025-10-21）

- ✅ migration-dashboard.md作成
- ✅ migration-schedule.md作成
- ✅ migration-risks.md作成
- ✅ DECISIONS.md更新（libx-docs廃止決定）

### M2: Sprint 1完了（2025-10-27）

- ✅ project-template移行完了
- ✅ Migration Workflow動作確認
- ✅ 移行手順ドキュメント化
- ✅ 週次レポート作成

### M3: Sprint 2完了（2025-11-03）

- ✅ test-verification移行完了
- ✅ 多言語対応手順確立
- ✅ 週次レポート作成

### M4: Sprint 3前半完了（2025-11-08）

- ✅ sample-docs移行完了
- ✅ バージョン管理手順確立

### M5: Phase 3完了（2025-11-15）

- ✅ libx-docs移行完了
- ✅ 全4プロジェクト移行完了
- ✅ libx-docs廃止手順確定
- ✅ Phase 3完了レポート作成

---

## リソース配分

### 人的リソース

| 役割 | 担当者 | 稼働率 | 期間 |
|-----|--------|--------|------|
| テックリード | TBD | 20% | 全期間 |
| 開発担当 | TBD | 80% | 全期間 |
| QA担当 | TBD | 30% | Sprint 1-3 |
| コンテンツリード | TBD | 10% | Sprint 2-3 |

### 技術リソース

| リソース | 用途 | 期間 |
|---------|------|------|
| GitHub Actions | Migration Workflow実行 | 全期間 |
| Artifact Storage | レポート・ログ保存 | 全期間（30-60日保持） |
| .backups/ | バックアップ保存 | 全期間（最大20世代） |
| CI環境 | ビルド・テスト | 全期間 |

---

## 依存関係

### Sprint間の依存関係

```
Sprint 1（project-template）
  ↓ 移行手順の確立
Sprint 2（test-verification）
  ↓ 多言語対応手順の確立
Sprint 3前半（sample-docs）
  ↓ バージョン管理手順の確立
Sprint 3後半（libx-docs）
  ↓ 全プロジェクト移行完了
Phase 3完了
```

### タスク間の依存関係

**Sprint 1**:
1. CI環境準備 → Dry-run実行
2. Dry-run実行 → 変換・検証
3. 変換・検証 → 本番実行
4. 本番実行 → 週次レビュー

**Sprint 2**:
1. Sprint 1レビュー → Dry-run実行
2. Dry-run実行 → 韓国語コンテンツ確認
3. 韓国語コンテンツ確認 → 変換・検証
4. 変換・検証 → 本番実行

**Sprint 3**:
1. Sprint 2レビュー → sample-docs Dry-run
2. sample-docs本番実行 → libx-docs最終同期
3. libx-docs最終同期 → libx-docs Dry-run
4. libx-docs本番実行 → Phase 3完了レポート

---

## 調整ポイント

### 定例ミーティング

**週次レビュー会議**:
- **頻度**: 毎週土曜日 10:00-10:30（30分）
- **参加者**: テックリード、開発担当、QA担当、コンテンツリード
- **アジェンダ**:
  1. 今週の移行実績レビュー
  2. Artifacts確認（migration-reports、compat-check-log）
  3. リスク・課題の共有
  4. 来週の移行計画確認

**デイリースタンドアップ**（任意）:
- **頻度**: 毎日10分程度
- **形式**: Slackまたはメール
- **内容**: 昨日の進捗、今日の予定、ブロッカー

### 承認フロー

**変換実行の承認**:
1. Dry-run実行 → Artifact確認
2. 変換結果レビュー → テックリード承認
3. 本番実行 → 開発担当実施
4. ビルドテスト → QA担当確認
5. デプロイ → テックリード最終承認

### エスカレーションパス

**問題発生時の対応**:

| レベル | 問題の種類 | 対応者 | 対応期限 |
|-------|----------|--------|---------|
| **L1** | 軽微な警告 | 開発担当 | 即座 |
| **L2** | 互換性エラー | テックリード | 1日以内 |
| **L3** | ビルド失敗 | テックリード + QA担当 | 2日以内 |
| **L4** | 重大な問題 | 全員 | 緊急対応 |

---

## 進捗報告

### 週次レポート

**テンプレート**: `docs/new-generator-plan/status/migration-weekly-YYYYMMDD.md`

**内容**:
- 今週の移行実績
- Artifact確認結果
- リスク・課題
- 来週の計画

### Migration Workflow実行ログ

**記録項目**:
- 実行日時
- プロジェクト名
- 実行モード（new-cli / compat）
- Dry-run有無
- 結果（成功/失敗）
- Artifact URL

---

## CI/自動化の活用計画

### Migration Workflow実行計画

| Sprint | プロジェクト | 実行予定日 | モード | Dry-run |
|--------|------------|----------|--------|---------|
| 1 | project-template | 10/23（水） | new-cli | true |
| 1 | project-template | 10/25（金） | new-cli | false |
| 2 | test-verification | 10/29（火） | new-cli | true |
| 2 | test-verification | 11/01（金） | new-cli | false |
| 3 | sample-docs | 11/05（火） | new-cli | true |
| 3 | sample-docs | 11/08（金） | new-cli | false |
| 3 | libx-docs | 11/12（火） | new-cli | true |
| 3 | libx-docs | 11/14（木） | new-cli | false |

### Artifact保存計画

**保持期間延長**:
- migration-reports: 30日 → **60日**（Phase 3期間中）
- compat-check-log: 7日（変更なし）
- build-logs: 7日（変更なし）

---

## バッファとリスク緩和

### 時間バッファ

- Sprint 1: 1日（10/27）
- Sprint 2: 1日（11/03）
- Sprint 3: 2日（11/10, 予備日追加可能）

### リスク緩和策

1. **CI環境の事前テスト**: Sprint 1開始前にDry-run実行
2. **バックアップ戦略**: .backups/で20世代保持
3. **ロールバック手順**: 各Sprint開始前に確認
4. **エスカレーションパス**: 問題発生時の連絡先明確化

---

## 更新履歴

| 日付 | 更新者 | 変更内容 |
|-----|--------|---------|
| 2025-10-21 | Claude Code | 初版作成（Phase 3-5タスク2） |

---

## 関連ドキュメント

- [移行ダッシュボード](./migration-dashboard.md)
- [リスクログ](./migration-risks.md)（作成予定）
- [Phase 3-5計画](../phase-3-5-migration-plan.md)
- [Phase 3-4→3-5引き継ぎ](../phase-3-4-to-3-5-handoff.md)
- [CI実行例](../examples/ci.md)
- [CIガイド](../guides/ci.md)

---

**最終更新**: 2025-10-21
**作成者**: Claude Code (AI Assistant)
