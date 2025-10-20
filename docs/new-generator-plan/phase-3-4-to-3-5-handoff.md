# Phase 3-4 から Phase 3-5 への引き継ぎ文書

**作成日**: 2025-10-21
**Phase 3-4 完了日**: 2025-10-21
**Phase 3-5 開始予定日**: 2025-10-22

---

## 📋 Phase 3-4 完了状況サマリー

### ✅ 完了した作業

Phase 3-4では、**CI/自動化ワークフロー**の設計と実装を完了しました。

#### 主要な成果物

1. **GitHub Actionsワークフロー** (`.github/workflows/migration.yml`, 約400行)
   - 手動トリガー（workflow_dispatch）のサポート
   - プルリクエストでの自動実行
   - 2つの実行モード（new-cli / compat）
   - Dry-runモードのサポート

2. **CI用設定ファイル** (`.docs-cli/`, 約340行)
   - config.ci.json - CI環境用設定
   - config.ci.example.json - サンプル設定（コメント付き）
   - README.md - 設定ディレクトリの使用方法

3. **Artifact管理機能**
   - 互換性チェックログ（7日保持）
   - 移行レポート（30日保持）
   - ビルドログ（7日保持）

4. **通知機能**
   - 互換性チェック警告の自動検出
   - PRへの自動コメント投稿

5. **ドキュメント** (約900行)
   - `docs/new-generator-plan/examples/ci.md` - CI実行例（約300行）
   - `docs/new-generator-plan/guides/ci.md` - CIガイド（約600行）

6. **DECISIONS.md更新**
   - Phase 3-4の決定事項を記録（約300行追加）

---

## 🎯 Phase 3-5 への重要な引き継ぎ事項

### 1. CI/自動化インフラの存在と活用

Phase 3-5では、実際の移行作業を計画・実施します。Phase 3-4で構築したCI/自動化インフラを活用してください。

#### a. Migration Workflowの活用

```yaml
# GitHub Actions での実行例
# .github/workflows/migration.yml を使用

# 手動トリガーでの実行
1. GitHub Actions UIから実行
2. パラメータ設定:
   - project: 移行対象プロジェクトID
   - version: バージョンID（オプション）
   - mode: new-cli (推奨) または compat
   - dry-run: true (初回は必ず true)

# プルリクエストでの自動実行
- CI関連ファイルの変更時に自動実行
- 互換性チェックと移行レポート生成
```

**重要**: 実際の移行作業では、まず `dry-run: true` で動作を確認してから `dry-run: false` で実行してください。

#### b. Artifact管理の活用

```yaml
# 移行レポートの活用
1. GitHub Actions の Artifacts から migration-reports をダウンロード
2. migration-checklist.md で移行手順を確認
3. compatibility-report.html で互換性状況を確認

# ビルドログの活用
1. build-logs-* Artifact をダウンロード
2. エラーや警告を確認
3. トラブルシューティングに活用
```

### 2. CI用設定ファイルの活用

#### `.docs-cli/config.ci.json` の設定項目

Phase 3-5での移行作業では、以下の設定項目が重要です:

```json
{
  "migrate": {
    "backup": true,           // バックアップを必ず有効化
    "backupDir": ".backups",
    "maxBackups": 10,         // 移行作業では増やすことを推奨
    "dryRun": false
  },
  "artifacts": {
    "enabled": true,          // Artifactを必ず有効化
    "reports": "reports/migration",
    "retentionDays": 30       // 移行期間中は延長を検討
  },
  "validation": {
    "strictMode": true,       // 厳格モードを推奨
    "checkSyncHash": true,
    "failOnWarning": false    // 警告時は続行（レポートで確認）
  }
}
```

**推奨事項**:
- 移行期間中は `maxBackups` を20程度に増やす
- `retentionDays` を60日程度に延長（長期的な進捗管理）
- `strictMode` を有効化して品質を担保

### 3. 2つの実行モードの使い分け

Phase 3-5での移行作業では、プロジェクトの状況に応じてモードを使い分けてください。

#### new-cli モード（推奨）

**使用ケース**:
- 新規プロジェクトの追加
- 新しいバージョンの作成
- 将来的な標準アプローチ

**実行例**:
```yaml
mode: new-cli
dry-run: true  # 初回は必ず true
project: my-new-project
version: v1
```

#### compat モード

**使用ケース**:
- 既存スクリプトからの移行
- 段階的な移行作業
- サポート終了（2026-03-31）までの暫定対応

**実行例**:
```yaml
mode: compat
dry-run: true
project: legacy-project
```

**注意**: compat モードは2026-03-31にサポート終了予定です。Phase 3-5での移行作業では、可能な限り new-cli モードを使用してください。

---

## 🔧 Phase 3-5 実装時の推奨事項

### 1. 移行作業の計画策定

Phase 3-5では、以下の計画策定が必要です:

#### a. 対象プロジェクトの棚卸し

```markdown
# 移行ダッシュボード例
## プロジェクト一覧

| プロジェクトID | 言語数 | バージョン数 | コンテンツ量 | 優先度 | ステータス |
|--------------|-------|-----------|-----------|-------|----------|
| sample-docs  | 2     | 3         | 100ページ | 高    | 未着手   |
| api-docs     | 2     | 2         | 50ページ  | 中    | 未着手   |
```

**CI/自動化の活用**:
- Migration Workflow を dry-run モードで実行
- 移行レポートから現状を把握
- 互換性チェックで問題点を洗い出し

#### b. 移行スケジュールの策定

```markdown
# 移行スケジュール例
## スプリント1（Week 1-2）
- [ ] sample-docs の移行（dry-run）
- [ ] sample-docs の移行（本番）
- [ ] 移行レポートのレビュー

## スプリント2（Week 3-4）
- [ ] api-docs の移行（dry-run）
- [ ] api-docs の移行（本番）
- [ ] 移行レポートのレビュー
```

**CI/自動化の活用**:
- 各スプリントで Migration Workflow を定期実行
- Artifacts から進捗レポートを収集
- 自動通知で問題を早期発見

### 2. ステータス管理ダッシュボードの作成

#### 推奨ファイル構成

```
docs/new-generator-plan/status/
├── migration-dashboard.md       # 移行ダッシュボード（進捗可視化）
├── migration-risks.md           # リスクログ（リスク追跡）
├── migration-weekly-YYYYMMDD.md # 週次レポート
└── README.md                    # ステータス管理ガイド
```

**CI/自動化の活用**:
- Migration Workflow の Artifacts から自動的にデータを収集
- `docs-cli compat report` でレポートを生成
- GitHub Actions の Summary 機能で進捗を可視化

### 3. リスク評価と対策

Phase 3-5で想定されるリスクと、CI/自動化による対策:

| リスク | 影響度 | CI/自動化による対策 |
|-------|-------|------------------|
| 移行時のデータ損失 | 高 | `.backups/` 自動バックアップ、Artifacts保存 |
| 互換性問題 | 中 | `docs-cli compat check` で事前検出 |
| ビルドエラー | 中 | Migration Workflow で自動ビルドテスト |
| 手動作業の増加 | 低 | Dry-runモードで事前確認、自動化で削減 |

**推奨アプローチ**:
1. 各プロジェクトの移行前に `dry-run: true` で実行
2. Artifacts から互換性チェックログを確認
3. リスクログ（`migration-risks.md`）に記録
4. 対策を講じてから本番実行

### 4. コミュニケーション計画

#### 定例ミーティング

```markdown
# 移行進捗会議（週次）
- 日時: 毎週金曜日 10:00-10:30
- 参加者: テックリード、開発チーム、コンテンツリード、QAリード
- アジェンダ:
  1. 今週の移行実績（Artifacts レポート確認）
  2. 来週の移行予定
  3. リスク・課題の共有
  4. 互換性チェック結果のレビュー
```

**CI/自動化の活用**:
- Migration Workflow の実行結果を共有
- Artifacts をミーティング前に配布
- GitHub Actions の Summary を画面共有

#### 利用チームへの告知

```markdown
# 告知テンプレート
件名: [重要] ドキュメントサイト移行作業のお知らせ

本文:
YYYY年MM月DD日より、ドキュメントサイトの移行作業を実施します。

## 移行期間
- 開始: YYYY-MM-DD
- 完了予定: YYYY-MM-DD

## 影響範囲
- 移行対象プロジェクト: sample-docs, api-docs
- 一時的なアクセス制限: なし
- サイトURL: 変更なし

## 確認方法
- 移行状況: GitHub Actions の Migration Workflow で確認可能
- レポート: Artifacts からダウンロード可能

## 問い合わせ先
- 技術的な質問: ...
- 移行スケジュール: ...
```

---

## 📚 Phase 3-5 で参照すべきPhase 3-4の成果物

### 1. ワークフローファイル

**ファイル**: `.github/workflows/migration.yml`

**活用方法**:
- そのまま使用可能（カスタマイズ不要）
- 手動トリガーで柔軟に実行
- Dry-runモードで安全に検証

**実行手順**:
```
1. GitHub リポジトリの Actions タブを開く
2. Migration Workflow を選択
3. Run workflow をクリック
4. パラメータを入力:
   - project: 移行対象プロジェクトID
   - version: バージョンID（オプション）
   - mode: new-cli
   - dry-run: true
5. Run workflow を実行
6. Artifacts から移行レポートをダウンロード
```

### 2. CI用設定ファイル

**ファイル**: `.docs-cli/config.ci.json`

**カスタマイズ推奨項目**:
```json
{
  "migrate": {
    "maxBackups": 20,        // 10 → 20 に増やす
    "dryRun": false          // 本番実行時は false
  },
  "artifacts": {
    "retentionDays": 60      // 30 → 60 に延長
  },
  "ci": {
    "timeouts": {
      "migrate": 1800        // 900 → 1800 (30分) に延長
    }
  }
}
```

**参考**: `.docs-cli/config.ci.example.json` にコメント付きの説明あり

### 3. ドキュメント

#### CI実行例

**ファイル**: `docs/new-generator-plan/examples/ci.md`

**内容**:
- 手動実行の具体例（3パターン）
- プルリクエストでの自動実行
- Artifactの確認方法
- トラブルシューティング

**Phase 3-5での活用**:
- 移行作業手順書のベースとして使用
- チーム内でのトレーニング資料として活用

#### CIガイド

**ファイル**: `docs/new-generator-plan/guides/ci.md`

**内容**:
- CI/自動化ワークフローの詳細設定
- 環境変数とSecrets管理
- ワークフロー設計パターン（3パターン）
- ベストプラクティス
- トラブルシューティング（5つのケース）

**Phase 3-5での活用**:
- CI環境のセットアップガイドとして使用
- 問題発生時のリファレンスとして活用

---

## 🚨 注意事項

### 1. Dry-runモードの必須使用

**重要**: Phase 3-5での移行作業では、必ず以下の順序で実行してください。

```
ステップ1: Dry-runモードで実行
  ↓
ステップ2: Artifactから移行レポートを確認
  ↓
ステップ3: 問題がないことを確認
  ↓
ステップ4: 本番実行（dry-run: false）
  ↓
ステップ5: 再度Artifactから結果を確認
```

**理由**:
- 意図しない変更を防止
- 事前に問題を検出
- レビューの機会を提供

### 2. バックアップの管理

**問題**: 移行作業でバックアップが大量に作成される

**対策**:
1. `.docs-cli/config.ci.json` で `maxBackups` を設定
2. 定期的に古いバックアップを削除
3. 重要なバックアップはArtifactsにも保存

**バックアップのクリーンアップ**:
```bash
# 30日以上前のバックアップを削除
find .backups/ -mtime +30 -delete

# または、docs-cli コマンドで管理（将来実装予定）
# docs-cli backup clean --older-than 30d
```

### 3. Artifactの保持期間

**デフォルト設定**:
- compat-check-log: 7日
- migration-reports: 30日
- build-logs-*: 7日

**Phase 3-5での推奨**:
- migration-reports: 60日に延長（長期的な進捗管理）
- 重要なレポートはローカルにもダウンロード

**変更方法**:
```yaml
# .github/workflows/migration.yml
- name: 移行レポートをアップロード
  uses: actions/upload-artifact@v4
  with:
    name: migration-reports
    path: reports/migration/
    retention-days: 60  # 30 → 60 に変更
```

### 4. 互換モードのサポート終了

**サポート終了日**: **2026-03-31**

**Phase 3-5での対応**:
- 新規移行作業は可能な限り new-cli モードを使用
- compat モードは既存ワークフローの移行時のみ使用
- 移行完了後は新CLIに統一

**タイムライン**:
```
2025-10-21: Phase 3-4 完了（CI/自動化実装）
2025-10-22: Phase 3-5 開始（移行作業計画）
2025-11-30: Phase 4 完了予定（QA・リリース準備）
2025-12-31: Phase 5 完了予定（リリース後改善）
2026-03-31: 互換モードサポート終了
```

**Phase 3-5での注意**:
- 移行作業は2026-03-31までに完了させる
- 新CLIモードへの移行を優先する

---

## ✅ Phase 3-5 開始前のチェックリスト

Phase 3-5を開始する前に、以下を確認してください：

### Phase 3-4の成果物確認

- [ ] `.github/workflows/migration.yml` が存在する
- [ ] `.docs-cli/config.ci.json` が存在する
- [ ] `docs/new-generator-plan/examples/ci.md` を読んだ
- [ ] `docs/new-generator-plan/guides/ci.md` を読んだ
- [ ] Phase 3-4完了レポートを読んだ

### CI環境の確認

- [ ] GitHub Actionsが有効になっている
- [ ] Migration Workflowが手動実行可能
- [ ] Artifactsがダウンロード可能
- [ ] 互換性チェックが正常に動作する

### 移行準備

- [ ] 移行対象プロジェクトをリストアップした
- [ ] 優先度を評価した
- [ ] 移行スケジュールの草案を作成した
- [ ] ステークホルダーに連絡した

### ドキュメント準備

- [ ] 移行ダッシュボードのテンプレートを準備
- [ ] リスクログのテンプレートを準備
- [ ] 週次レポートのテンプレートを準備

---

## 🎯 Phase 3-5 での実装推奨順序

Phase 3-5のタスクは以下の順序で実装することを推奨します:

### 1. 対象プロジェクトの棚卸し（タスク1）

**目標**: 移行対象プロジェクトを明確化

**実装内容**:
- libx-dev/libx-docs のプロジェクト一覧作成
- コンテンツ量、言語数、バージョン数の集計
- 優先度の評価（利用度、更新頻度、リスク）

**CI/自動化の活用**:
```bash
# 各プロジェクトで互換性チェック実行
pnpm exec docs-cli compat check

# 移行レポート生成
pnpm exec docs-cli compat report

# Artifactsから情報を収集
```

---

### 2. 移行スケジュール策定（タスク2）

**目標**: スプリント単位の移行計画を作成

**実装内容**:
- スプリント単位での移行対象割り当て
- マイルストーンの設定
- 担当者の決定

**CI/自動化の活用**:
- Migration Workflow を各スプリントで定期実行
- 進捗を GitHub Actions の Summary で可視化

---

### 3. ステータス管理（タスク3）

**目標**: 移行ダッシュボードで進捗を可視化

**実装内容**:
- `docs/new-generator-plan/status/migration-dashboard.md` 作成
- 各プロジェクトの進捗トラッキング
- 「変換→検証→レビュー→承認→デプロイ」のステップ管理

**CI/自動化の活用**:
- Artifacts から自動的にデータを収集
- GitHub Actions の Badge で進捗を表示

---

### 4. リスク評価（タスク4）

**目標**: リスクログで移行リスクを追跡

**実装内容**:
- リスクの洗い出し（未翻訳、ライセンス不備、巨大ファイル）
- 対策の定義
- `docs/new-generator-plan/status/migration-risks.md` の運用

**CI/自動化の活用**:
- `docs-cli compat check` でリスクを事前検出
- 互換性チェックログから問題を抽出

---

### 5. コミュニケーション（タスク5）

**目標**: 定例ミーティングと告知計画の設定

**実装内容**:
- 定例ミーティングのスケジュール設定
- 週次レポートのテンプレート作成
- 利用チームへの告知計画

**CI/自動化の活用**:
- Artifacts を定例ミーティングで共有
- GitHub Actions の Summary を画面共有

---

### 6. libx-docs 方針検討（タスク6）

**目標**: libx-docs の今後の役割を判断

**実装内容**:
- 維持する場合の運用手順まとめ
- 縮小/廃止する場合の作業試算
- DECISIONS.md への記録

**CI/自動化の活用**:
- 移行レポートから現状を把握
- 判断材料として活用

---

## 💡 Phase 3-5 実装時のヒント

### 1. 段階的な移行アプローチ

**推奨アプローチ**:
```
Phase 1: 小規模プロジェクトで試行（1-2プロジェクト）
  ↓
Phase 2: 中規模プロジェクトで展開（3-5プロジェクト）
  ↓
Phase 3: 大規模プロジェクトで完了（全プロジェクト）
```

**CI/自動化の活用**:
- 各フェーズで Migration Workflow を実行
- Dry-runモードで安全に検証
- Artifactsで進捗を記録

### 2. 移行レポートの活用

**推奨アプローチ**:
1. `docs-cli compat report` でレポート生成
2. `migration-checklist.md` で手順確認
3. `compatibility-report.html` で互換性確認
4. 週次レポートに集約

**自動化**:
- GitHub Actions で定期的にレポート生成
- Artifacts に保存して履歴管理

### 3. バックアップ戦略

**推奨アプローチ**:
1. `.backups/` ディレクトリで自動バックアップ
2. 重要なマイルストーンでArtifacts保存
3. 定期的にクリーンアップ

**設定**:
```json
{
  "migrate": {
    "backup": true,
    "backupDir": ".backups",
    "maxBackups": 20  // 移行期間中は増やす
  }
}
```

---

## 📞 サポートとフィードバック

### Phase 3-5実装中に問題が発生した場合

1. **CI/自動化関連の問題**
   - [CIガイド](./guides/ci.md)のトラブルシューティングを確認
   - [CI実行例](./examples/ci.md)を参照
   - GitHub Actionsのログを確認

2. **移行作業関連の問題**
   - [Phase 3-5計画](./phase-3-5-migration-plan.md)を確認
   - `docs-cli compat check` でリスクを確認
   - Artifactsから移行レポートを確認

3. **互換レイヤー関連の問題**
   - [互換レイヤーガイド](./guides/compat-layer.md)を確認
   - `docs-cli compat report` でレポート生成

---

## 🎉 まとめ

Phase 3-4では、**CI/自動化ワークフロー**を構築しました。

**Phase 3-5への引き継ぎポイント**:

1. ✅ **Migration Workflow を活用**: 手動トリガーで柔軟に実行可能
2. ✅ **Dry-runモードを必ず使用**: 安全な移行作業を実現
3. ✅ **Artifact管理を活用**: 移行レポートとログの保存・確認
4. ✅ **2つの実行モードを使い分け**: new-cli（推奨）と compat
5. ✅ **CI用設定をカスタマイズ**: 移行作業に適した設定に調整
6. ✅ **ドキュメントを参照**: CI実行例とCIガイドを活用
7. ✅ **サポート終了日を認識**: 2026-03-31までに新CLIへ移行

**次のステップ**: Phase 3-5（移行作業計画）の実装を開始してください。

---

**最終更新**: 2025-10-21
**作成者**: Claude Code (AI Assistant)
**Phase 3-4 完了レポート**: [phase-3-4-completion-report.md](./phase-3-4-completion-report.md)
**Phase 3-5 計画**: [phase-3-5-migration-plan.md](./phase-3-5-migration-plan.md)
