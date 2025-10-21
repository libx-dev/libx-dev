# Phase 3-5 から Phase 3-6 への引き継ぎ文書

**作成日**: 2025-10-21
**Phase 3-5 完了日**: 2025-10-21
**Phase 3-6 開始予定日**: 2025-10-22

---

## 📋 Phase 3-5 完了状況サマリー

### ✅ 完了した作業

Phase 3-5では、**移行作業計画の策定**を完了しました。

#### 主要な成果物

1. **移行ダッシュボード** (`docs/new-generator-plan/status/migration-dashboard.md`, 約400行)
   - 4プロジェクトの詳細な棚卸し
   - 優先度と推奨移行順序の決定
   - 詳細ステータス管理（変換→検証→レビュー→承認→デプロイ）
   - CI/自動化の活用計画

2. **移行スケジュール** (`docs/new-generator-plan/status/migration-schedule.md`, 約300行)
   - 3 Sprintの詳細計画（25日間）
   - Sprint 1: project-template移行（2025-10-22〜2025-10-27）
   - Sprint 2: test-verification移行（2025-10-28〜2025-11-03）
   - Sprint 3: sample-docs + libx-docs移行（2025-11-04〜2025-11-15）
   - 5つのマイルストーン定義

3. **リスク評価** (`docs/new-generator-plan/status/migration-risks.md`, 約300行)
   - 10個の主要リスクの特定
   - 影響度・発生確率の評価
   - 各リスクの緩和策とアクションプラン
   - CI/自動化によるリスク検出方法

4. **コミュニケーション計画** (`docs/new-generator-plan/status/communication-plan.md`, 約200行)
   - 文書ベースのコミュニケーションチャネル
   - 週次レビュー会議の計画
   - 週次レポートテンプレート
   - 将来的なコントリビューター向けフレームワーク

5. **DECISIONS.md更新** (約200行追加)
   - **libx-docs廃止決定**（2025-11-15目標）
   - 3フェーズの廃止手順
   - 代替案との詳細比較
   - 決定の根拠と影響分析

---

## 🎯 Phase 3-6 への重要な引き継ぎ事項

### 1. 移行計画ドキュメントの活用

Phase 3-6では、Phase 3-5で策定した移行計画を**実際の移行手順書**に反映する必要があります。

#### a. migration-dashboard.md の活用

**ファイル**: `docs/new-generator-plan/status/migration-dashboard.md`

**Phase 3-6での活用方法**:
- **マイグレーション手順書（タスク1）**に移行対象プロジェクト情報を反映
- 各プロジェクトのステップ（変換→検証→レビュー→承認→デプロイ）を手順書のセクションとして展開
- CI/自動化の活用計画を手順書のベストプラクティスとして記載

**具体例**:
```markdown
# マイグレーション手順書（guides/migration.md）

## 1. 対象プロジェクト

（migration-dashboard.mdの「プロジェクト一覧」を引用）

## 2. 移行手順

### 2.1 変換フェーズ
（migration-dashboard.mdの「変換ステップ」を詳細化）

### 2.2 検証フェーズ
（migration-dashboard.mdの「検証ステップ」を詳細化）
...
```

---

#### b. migration-schedule.md の活用

**ファイル**: `docs/new-generator-plan/status/migration-schedule.md`

**Phase 3-6での活用方法**:
- **マイグレーション手順書**にタイムラインセクションを追加
- Sprint計画を「推奨移行順序」として記載
- マイルストーンを「チェックポイント」として記載

**具体例**:
```markdown
# マイグレーション手順書（guides/migration.md）

## 4. 推奨移行スケジュール

（migration-schedule.mdの「Sprint計画」を引用）

### 4.1 Sprint 1（2025-10-22〜2025-10-27）
- 対象: project-template
- 目標: 移行手順の確立
- チェックポイント: M2（2025-10-27）
```

---

#### c. migration-risks.md の活用

**ファイル**: `docs/new-generator-plan/status/migration-risks.md`

**Phase 3-6での活用方法**:
- **FAQ/トラブルシューティング（タスク5）**に10個のリスクを反映
- 各リスクの緩和策を「対処法」として記載
- CI/自動化による検出方法を「確認方法」として記載

**具体例**:
```markdown
# FAQ/トラブルシューティング

## Q1: データ損失が心配です。どうすればよいですか？

**リスク**: R1 - データ損失リスク（影響度: 高、発生確率: 低）

**対処法**:
（migration-risks.mdの「緩和策」を引用）
- `.backups/`ディレクトリでの自動バックアップ
- Dry-runモードでの事前確認
...

**確認方法**:
（migration-risks.mdの「検出方法」を引用）
```

---

#### d. communication-plan.md の活用

**ファイル**: `docs/new-generator-plan/status/communication-plan.md`

**Phase 3-6での活用方法**:
- **進捗共有と記録（タスク6）**に週次レポートテンプレートを統合
- 文書ベースのコミュニケーションフローを手順書に記載
- 将来的なコントリビューター向けガイドを作成

**具体例**:
```markdown
# 進捗共有ガイド（guides/progress-tracking.md）

## 週次レポート作成方法

（communication-plan.mdの「週次レポートテンプレート」を引用）

### テンプレート
- 今週の移行実績
- Artifact確認結果
- リスク・課題
- 来週の計画
```

---

### 2. CI/自動化インフラとの連携

Phase 3-4で構築したCI/自動化インフラを、Phase 3-6のドキュメントに反映します。

#### a. Migration Workflowの詳細な使用例

**Phase 3-6での対応**:
- **CIガイド更新（タスク4）**: `examples/ci.md`に以下を追加

**追加内容**:
```markdown
## Phase 3の移行作業でのCI活用例

### 例4: Sprint 1でのproject-template移行

**ステップ1**: Dry-runモード実行
```yaml
# GitHub Actions手動実行
project: project-template
version: v1
mode: new-cli
dry-run: true
```

**ステップ2**: Artifactから移行レポート確認
- migration-reports/migration-checklist.md
- migration-reports/compatibility-report.html

**ステップ3**: 問題なければ本番実行
```yaml
dry-run: false
```

**ステップ4**: 再度Artifactから結果確認
- build-logs/project-template-build.log
```

---

#### b. Artifact管理とレポート生成

**Phase 3-6での対応**:
- **差分レポートガイド（タスク2）**: Artifactの閲覧方法を詳しく記載

**追加内容**:
```markdown
# 差分レポートガイド（guides/diff-report.md）

## Artifactからのレポート取得

### 1. GitHub Actionsから取得
1. リポジトリの「Actions」タブを開く
2. Migration Workflowの実行履歴を選択
3. Artifactsセクションから以下をダウンロード:
   - migration-reports（30日保持）
   - compat-check-log（7日保持）
   - build-logs-*（7日保持）

### 2. レポートの種類

#### migration-reports
- migration-checklist.md: 移行チェックリスト
- compatibility-report.html: 互換性レポート（視覚的）
- compatibility-report.json: 互換性レポート（機械可読）

#### 活用方法
（Phase 3-2で実装した差分レポート機能の詳細を記載）
```

---

### 3. libx-docs廃止計画の反映

Phase 3-5で決定したlibx-docs廃止計画を、Phase 3-6のドキュメントに反映します。

#### a. 廃止手順のドキュメント化

**Phase 3-6での対応**:
- **マイグレーション手順書（タスク1）**: libx-docs特有の手順を追加

**追加内容**:
```markdown
# マイグレーション手順書（guides/migration.md）

## 5. libx-docs特有の移行手順

### 5.1 最終同期（2025-11-11実施予定）

**実行内容**:
1. Git履歴確認
   ```bash
   cd ../libx-docs
   git log --oneline --since="2025-10-01"
   ```

2. syncHashによる差分検出
   ```bash
   pnpm exec docs-cli validate --check-sync
   ```

3. 最終バックアップ作成
   ```bash
   pnpm exec docs-cli migrate-from-libx \
     --source ../libx-docs \
     --project-id libx-docs \
     --dry-run \
     --backup
   ```

### 5.2 移行実行（2025-11-12〜2025-11-14実施予定）

（DECISIONS.mdの「フェーズ2: 移行実行」の詳細を記載）

### 5.3 リポジトリ廃止（2025-11-15実施予定）

（DECISIONS.mdの「フェーズ3: リポジトリ廃止」の詳細を記載）
```

---

#### b. FAQ/トラブルシューティングへの反映

**Phase 3-6での対応**:
- **FAQ/トラブルシューティング（タスク5）**: libx-docs関連のFAQを追加

**追加内容**:
```markdown
# FAQ/トラブルシューティング

## libx-docs関連

### Q: libx-docsは今後も使えますか？

**回答**: libx-docsは2025-11-15にアーカイブ化（Read-only化）予定です。

**理由**: （DECISIONS.mdの「廃止の理由」を引用）
1. 新レジストリ形式への移行完了
2. 二重管理のコスト削減
3. シンプルな運用フローの実現

**代替方法**: 全コンテンツはlibx-dev内の新レジストリ形式で管理されます。

### Q: libx-docsの過去の履歴はどうなりますか？

**回答**: GitHubでアーカイブ化され、Read-onlyで参照可能です。

**詳細**: （DECISIONS.mdの「フェーズ3: リポジトリ廃止」を引用）
```

---

## 🔧 Phase 3-6 実装時の推奨事項

### タスク1: マイグレーション手順書作成 ✅

**目標**: 準備 → 実行 → 検証 → ロールバックの完全な手順書を作成

**実装推奨内容**:

#### 1-1. Phase 3-5成果物の統合

**migration-dashboard.mdから引用**:
- プロジェクト一覧（4プロジェクト）
- 各プロジェクトの詳細情報（言語数、バージョン数、優先度）
- ステップ定義（変換→検証→レビュー→承認→デプロイ）

**migration-schedule.mdから引用**:
- 3 Sprintの詳細計画
- 推奨移行順序
- タイムライン

**migration-risks.mdから引用**:
- リスク対策（特にR1: データ損失リスク）
- バックアップ・ロールバック手順

**communication-plan.mdから引用**:
- 進捗報告方法
- 週次レポート作成手順

---

#### 1-2. 実際の移行実績の反映（Sprint実施後）

**重要**: Sprint 1-3の実施後、実際の移行作業で得られた知見を手順書に反映してください。

**反映内容**:
```markdown
# マイグレーション手順書（guides/migration.md）

## 実際の移行実績

### Sprint 1（project-template）での学び
- 実際にかかった時間: X時間（予定: 6日間）
- 発生した問題: （具体的な問題）
- 解決方法: （具体的な解決方法）
- 手順の改善点: （改善した手順）

### Sprint 2（test-verification）での学び
...

### Sprint 3（sample-docs + libx-docs）での学び
...

## 改訂履歴
- 2025-10-22: 初版作成
- 2025-10-27: Sprint 1実績を反映（v1.1）
- 2025-11-03: Sprint 2実績を反映（v1.2）
- 2025-11-15: Sprint 3実績を反映（v2.0最終版）
```

---

### タスク2: 差分レポートガイド作成 ✅

**目標**: HTML/CSV/JSONの見方、レビュープロセス、承認方法を文書化

**実装推奨内容**:

#### 2-1. Phase 3-2で実装した差分レポート機能の文書化

**Phase 3-2の成果物を参照**:
- `phase-3-2-completion-report.md`: 差分レポート機能の詳細
- `guides/migration-data.md`: データ変換の詳細

**記載内容**:
```markdown
# 差分レポートガイド（guides/diff-report.md）

## 差分レポートの種類

### 1. HTML形式（視覚的レビュー用）
- ファイル: `compatibility-report.html`
- 用途: ステークホルダーへの共有、視覚的な確認
- 内容: カラーコーディングされた差分、統計グラフ

### 2. CSV形式（表計算ソフト用）
- ファイル: `compatibility-report.csv`
- 用途: フィルタリング、ソート、集計
- 内容: プロジェクトID、ドキュメントID、差分種別、詳細

### 3. JSON形式（機械可読）
- ファイル: `compatibility-report.json`
- 用途: CI/自動化、スクリプト処理
- 内容: 完全な差分情報、メタデータ

## レビュープロセス

（migration-dashboard.mdの「レビューステップ」を詳細化）

### ステップ1: 差分レポート取得
1. Migration WorkflowのArtifactからダウンロード
2. 対応するプロジェクトのレポートを開く

### ステップ2: 重大差分の確認
- 赤色（削除）: コンテンツが失われていないか確認
- 黄色（変更）: 意図しない変更でないか確認
- 緑色（追加）: 新規追加が正しいか確認

### ステップ3: 承認/却下判断
- 承認基準: （具体的な基準）
- 却下基準: （具体的な基準）

### ステップ4: 承認記録
- `status/migration-dashboard.md`のステータス更新
- 承認日時、承認者を記録
```

---

#### 2-2. レビュー結果記録テンプレート

**communication-plan.mdとの連携**:
```markdown
# 差分レポートガイド（guides/diff-report.md）

## レビュー結果記録テンプレート

### プロジェクト: project-template
### レビュー日: 2025-10-27
### レビュー担当者: （名前）

**差分レポート**: migration-reports-20251027/compatibility-report.html

**レビュー結果**:
- [ ] 重大差分なし
- [ ] 軽微な差分のみ（詳細: ）
- [ ] 要修正（詳細: ）

**承認/却下**: ✅ 承認 / ❌ 却下

**コメント**: （具体的なコメント）

**次のアクション**: （必要な場合）

---

（このテンプレートを`status/migration-dashboard.md`または週次レポートに記録）
```

---

### タスク3: 互換レイヤーガイド更新 ✅

**目標**: 互換レイヤーの使用方法、警告メッセージ、サポート期間を明記

**実装推奨内容**:

#### 3-1. Phase 3-3で実装した互換レイヤーの文書化

**Phase 3-3の成果物を参照**:
- `phase-3-3-completion-report.md`: 互換レイヤーの詳細
- `guides/compat-layer.md`: 既存ガイド（更新が必要）

**更新内容**:
```markdown
# 互換レイヤーガイド（guides/compat-layer.md）

## サポート期間

**重要**: 互換レイヤーは **2026-03-31にサポート終了** 予定です。

**タイムライン**:
```
2025-10-21: Phase 3-4完了（CI/自動化実装）
2025-10-22: Phase 3-5開始（移行作業計画）
2025-11-15: Phase 3完了（移行作業完了）
2025-12-31: Phase 5完了予定（リリース後改善）
2026-03-31: 互換モードサポート終了 ← サポート期限
```

**推奨アクション**:
- 新規移行作業は可能な限り **new-cliモード** を使用
- compatモードは既存ワークフローの移行時のみ使用
- 2026-03-31までに新CLIへ完全移行

## 使用方法

### new-cliモード（推奨）
（詳細な使用方法）

### compatモード（暫定対応）
（詳細な使用方法）

### 警告メッセージの意味

#### 警告1: "互換モードは2026-03-31にサポート終了します"
**意味**: compatモードを使用している場合の警告
**対応**: new-cliモードへの移行を検討

#### 警告2: "このコマンドは非推奨です"
**意味**: 旧コマンド形式を使用している場合の警告
**対応**: 新コマンド形式へ移行（例: `docs-cli add-language`）
```

---

### タスク4: CIガイド更新 ✅

**目標**: examples/ci.mdにPhase 3成果物を追加、Secretsと環境変数を整理

**実装推奨内容**:

#### 4-1. examples/ci.mdへのPhase 3成果物の追加

**Phase 3-4の成果物を参照**:
- `phase-3-4-completion-report.md`: Migration Workflowの詳細
- `examples/ci.md`: 既存ガイド（更新が必要）

**追加内容**:
```markdown
# CI実行例（examples/ci.md）

## Phase 3の移行作業でのCI活用例

### 例4: Sprint 1 - project-template移行

**背景**: Phase 3-5で策定した移行計画に基づき、Sprint 1でproject-templateを移行

**ステップ**:

1. **Dry-runモードで事前確認**
   ```yaml
   # GitHub Actions手動実行
   project: project-template
   version: v1
   mode: new-cli
   dry-run: true
   ```

2. **Artifactから移行レポート確認**
   - migration-reports/migration-checklist.md
   - migration-reports/compatibility-report.html
   - （Phase 3-2の差分レポート機能を活用）

3. **リスク確認**
   - migration-risks.mdで特定したR1-R10のリスクを確認
   - 互換性チェックログで問題がないか確認

4. **本番実行（問題なければ）**
   ```yaml
   dry-run: false
   ```

5. **実行結果の記録**
   - migration-dashboard.mdのステータス更新
   - 週次レポート作成（communication-plan.mdのテンプレート使用）

**実績**:
- 実行時間: （Sprint 1実施後に記入）
- 発生した問題: （Sprint 1実施後に記入）
- 解決方法: （Sprint 1実施後に記入）

---

### 例5: Sprint 2 - test-verification移行（3言語対応）

（同様の構成）

---

### 例6: Sprint 3 - libx-docs最終移行と廃止

**背景**: Phase 3-5で決定したlibx-docs廃止計画に基づく最終移行

**ステップ**:

1. **最終同期実行**
   ```bash
   # libx-docsから最新の変更を取得
   cd ../libx-docs
   git pull origin main

   # syncHashによる差分検出
   cd ../libx-dev
   pnpm exec docs-cli validate --check-sync
   ```

2. **Migration Workflow実行**
   （DECISIONS.mdの「フェーズ2: 移行実行」の手順）

3. **リポジトリ廃止作業**
   （DECISIONS.mdの「フェーズ3: リポジトリ廃止」の手順）
```

---

#### 4-2. Secretsと環境変数の整理

**追加内容**:
```markdown
# CI実行例（examples/ci.md）

## Secrets と環境変数の一覧

### 必須

| Secret名 | 用途 | 設定方法 |
|---------|------|---------|
| GITHUB_TOKEN | GitHub API アクセス | 自動設定（Actions標準） |

### 任意（Phase 3-4で実装）

| Secret名 | 用途 | 設定方法 |
|---------|------|---------|
| SLACK_WEBHOOK_URL | Slack通知（将来的） | Settings > Secrets > New secret |
| CODECOV_TOKEN | カバレッジレポート（将来的） | Settings > Secrets > New secret |

### 環境変数

| 変数名 | デフォルト値 | 説明 |
|-------|------------|------|
| NODE_VERSION | 20 | Node.jsバージョン |
| PNPM_VERSION | 8 | pnpmバージョン |

## 運用上の注意

### 注意1: Artifact保持期間
- migration-reports: 30日（Phase 3-5で60日への延長を推奨）
- compat-check-log: 7日
- build-logs-*: 7日

**推奨**: 重要なレポートはローカルにもダウンロード

### 注意2: バックアップ管理
- `.backups/`ディレクトリは自動ローテーション（maxBackups設定）
- 定期的に古いバックアップを削除（30日以上前）

### 注意3: 互換モードのサポート終了
- 2026-03-31にサポート終了
- new-cliモードへの移行を計画的に実施
```

---

### タスク5: FAQ/トラブルシューティング ✅

**目標**: migration-risks.mdの10個のリスクをFAQに反映、実際の移行作業で発生した問題を追加

**実装推奨内容**:

#### 5-1. migration-risks.mdからのFAQ作成

**Phase 3-5の成果物を活用**:
- `migration-risks.md`: 10個のリスクと緩和策

**FAQ構成**:
```markdown
# FAQ/トラブルシューティング

## データ損失・バックアップ関連

### Q1: データ損失が心配です。どうすればよいですか？

**リスク**: R1 - データ損失リスク（影響度: 高、発生確率: 低）

**対処法**:
1. `.backups/`ディレクトリでの自動バックアップ
   - `migrate-from-libx`実行時に自動作成
   - maxBackups設定（デフォルト: 10、推奨: 20）

2. Dry-runモードでの事前確認
   ```bash
   pnpm exec docs-cli migrate-from-libx \
     --source apps/sample-docs \
     --project-id sample-docs \
     --dry-run
   ```

3. Git commitで履歴管理
   - 移行前に必ずコミット
   - 問題があれば `git reset --hard HEAD` でロールバック

**確認方法**:
- `.backups/`ディレクトリにバックアップが作成されているか確認
- バックアップのタイムスタンプが最新か確認

**参照**: migration-risks.md - R1

---

### Q2: バックアップが大量に溜まってしまいました

**リスク**: R9 - バックアップ肥大化（影響度: 低、発生確率: 高）

**対処法**:
1. 古いバックアップの削除
   ```bash
   # 30日以上前のバックアップを削除
   find .backups/ -mtime +30 -delete
   ```

2. maxBackups設定の調整
   ```json
   // .docs-cli/config.ci.json
   {
     "migrate": {
       "maxBackups": 20  // 移行期間中は増やす
     }
   }
   ```

3. 重要なバックアップはArtifactsにも保存
   - Migration WorkflowのArtifactに自動保存
   - 30日間保持（設定により60日に延長可能）

**参照**: migration-risks.md - R9

---

## 互換性・ビルド関連

### Q3: 互換性チェックで警告が出ました

**リスク**: R2 - 互換性問題（影響度: 中、発生確率: 中）

**対処法**:
1. `docs-cli compat check`でエラー内容を確認
   ```bash
   pnpm exec docs-cli compat check
   ```

2. 警告の種類に応じて対応
   - `deprecated-command`: 新コマンドへ移行
   - `missing-field`: レジストリに不足フィールドを追加
   - `schema-mismatch`: スキーマバージョンを更新

3. `docs-cli compat report`でレポート生成
   ```bash
   pnpm exec docs-cli compat report
   ```

**確認方法**:
- compatibility-report.htmlで視覚的に確認
- GitHub ActionsのArtifactからcompat-check-logを確認

**参照**: migration-risks.md - R2, guides/compat-layer.md

---

### Q4: ビルドエラーが発生しました

**リスク**: R4 - ビルドエラー（影響度: 中、発生確率: 中）

**対処法**:
1. エラーメッセージの確認
   - コンソール出力を確認
   - build-logs Artifactを確認

2. よくあるエラーと解決方法
   - `Module not found`: 依存関係のインストール不足 → `pnpm install`
   - `Invalid frontmatter`: MDXフロントマターの構文エラー → フロントマター修正
   - `Schema validation failed`: レジストリスキーマ不一致 → `docs-cli validate`で確認

3. Migration Workflowで自動ビルドテスト
   - ビルド成功を確認してから次のステップへ

**確認方法**:
- `pnpm build`でローカルビルドテスト
- Migration Workflowのビルドステップのログ確認

**参照**: migration-risks.md - R4

---

## 翻訳・コンテンツ関連

### Q5: 未翻訳のコンテンツがあります

**リスク**: R3 - 未翻訳コンテンツ（影響度: 中、発生確率: 高）

**対処法**:
1. `content.{lang}.status`を確認
   - `published`: 翻訳済み
   - `missing`: 未翻訳
   - `draft`: ドラフト

2. 未翻訳コンテンツの特定
   ```bash
   pnpm exec docs-cli validate --check-missing
   ```

3. 翻訳作業の計画
   - 優先度の高いページから翻訳
   - `status: "missing"`で一時的に非表示

**確認方法**:
- migration-dashboard.mdで未翻訳コンテンツ数を確認
- 差分レポートで翻訳状況を確認

**参照**: migration-risks.md - R3

---

## libx-docs関連

### Q6: libx-docsは今後も使えますか？

**リスク**: R6 - libx-docs同期状態の不一致（影響度: 中、発生確率: 中）

**回答**: libx-docsは **2025-11-15にアーカイブ化（Read-only化）** 予定です。

**理由**:
1. 新レジストリ形式への移行完了
2. 二重管理のコスト削減
3. シンプルな運用フローの実現

**廃止手順**:
- フェーズ1: 最終同期（2025-11-11）
- フェーズ2: 移行実行（2025-11-12〜2025-11-14）
- フェーズ3: リポジトリ廃止（2025-11-15）

**参照**: DECISIONS.md - libx-docs廃止決定, migration-risks.md - R6

---

### Q7: libx-docsの過去の履歴はどうなりますか？

**回答**: GitHubでアーカイブ化され、Read-onlyで参照可能です。

**詳細**:
- README更新（「このリポジトリはアーカイブされました」）
- GitHubで「Archive this repository」実行
- libx-devへの参照リンクを追加

**参照**: DECISIONS.md - フェーズ3: リポジトリ廃止

---

## CI/自動化関連

### Q8: CI環境の設定を間違えたかもしれません

**リスク**: R8 - CI環境の設定ミス（影響度: 低、発生確率: 低）

**対処法**:
1. `.docs-cli/config.ci.json`の確認
   - config.ci.example.jsonと比較
   - 必須フィールドが設定されているか確認

2. GitHub Actions Secretsの確認
   - GITHUB_TOKENが利用可能か確認
   - 必要に応じて追加のSecretsを設定

3. Migration Workflowのテスト実行
   ```yaml
   # 最小構成でテスト実行
   project: project-template
   version: v1
   mode: new-cli
   dry-run: true
   ```

**確認方法**:
- GitHub Actionsのログでエラーがないか確認
- Artifactが正常に生成されているか確認

**参照**: migration-risks.md - R8, examples/ci.md

---

## スケジュール関連

### Q9: スケジュールが遅れています

**リスク**: R10 - スケジュール遅延（影響度: 中、発生確率: 中）

**対処法**:
1. migration-dashboard.mdでステータス確認
   - どのプロジェクトで遅延しているか特定
   - どのステップで詰まっているか確認

2. リスクログの見直し
   - migration-risks.mdで該当するリスクを確認
   - 緩和策を実施

3. スケジュールの再調整
   - Sprint計画の見直し
   - 優先度の低いプロジェクトを延期

**確認方法**:
- migration-schedule.mdのマイルストーンと現状を比較
- 週次レポートで進捗を可視化

**参照**: migration-risks.md - R10, migration-schedule.md

---

## その他

### Q10: ライセンス情報が不足しています

**リスク**: R5 - ライセンス情報の不備（影響度: 中、発生確率: 低）

**対処法**:
1. project.config.jsonのlicensingセクション確認
   ```json
   {
     "licensing": {
       "sources": [
         {
           "id": "...",
           "name": "...",
           "author": "...",
           "license": "MIT",  // 確認
           "licenseUrl": "...",
           "sourceUrl": "..."
         }
       ]
     }
   }
   ```

2. レジストリへの変換時に引き継ぎ
   - `migrate-from-libx`が自動変換
   - 手動で不足情報を追加

3. 原文サイトでライセンスを確認
   - 翻訳元のライセンス情報を確認
   - 再配布可否と帰属表示を明記

**確認方法**:
- `docs-cli validate --check-licenses`で確認
- 生成されたサイトでライセンス表示を確認

**参照**: migration-risks.md - R5, PROJECT_PRINCIPLES.md - 法務・ライセンス
```

---

#### 5-2. 実際の移行作業で発生した問題の追加（Sprint実施後）

**重要**: Sprint 1-3の実施後、実際に発生した問題をFAQに追加してください。

**追加テンプレート**:
```markdown
# FAQ/トラブルシューティング

## Sprint実施中に発生した問題

### Sprint 1（project-template）

#### 問題1: （具体的な問題）
**発生日**: 2025-10-XX
**影響**: （影響範囲）
**原因**: （根本原因）
**解決方法**: （具体的な解決手順）
**再発防止策**: （今後の対策）

---

### Sprint 2（test-verification）

（同様の構成）

---

### Sprint 3（sample-docs + libx-docs）

（同様の構成）
```

---

### タスク6: 進捗共有と記録 ✅

**目標**: 週次レポートテンプレート活用、DECISIONS.md更新方法の明記

**実装推奨内容**:

#### 6-1. 週次レポート作成ガイド

**communication-plan.mdのテンプレート活用**:
```markdown
# 進捗共有ガイド（guides/progress-tracking.md または既存ガイドに追加）

## 週次レポート作成方法

### テンプレート

communication-plan.mdの「週次レポートテンプレート」を使用してください。

### 作成手順

1. **テンプレートをコピー**
   ```bash
   # 新規ファイル作成
   touch docs/new-generator-plan/status/migration-weekly-YYYYMMDD.md
   ```

2. **今週の移行実績を記入**
   - Migration Workflowの実行履歴を確認
   - migration-dashboard.mdのステータス更新状況を確認
   - 完了したタスクを記載

3. **Artifact確認結果を記入**
   - migration-reportsの確認結果
   - compat-check-logの警告・エラー
   - build-logsのビルド結果

4. **リスク・課題を記入**
   - migration-risks.mdから該当するリスクを引用
   - 新たに発見したリスクを追加
   - 対応状況を記録

5. **来週の計画を記入**
   - migration-schedule.mdの次のSprintタスクを引用
   - 優先度と担当者を明記

6. **決定事項を記入**
   - 重要な決定事項があればDECISIONS.mdに記録
   - 週次レポートからDECISIONS.mdへのリンク

### 実施タイミング

- **頻度**: 毎週土曜日
- **時間**: 10:00-10:30（30分）
- **形式**: テキストベース（Markdown）

### 保存場所

```
docs/new-generator-plan/status/
├── migration-weekly-20251026.md  # Sprint 1終了時
├── migration-weekly-20251102.md  # Sprint 2終了時
└── migration-weekly-20251115.md  # Sprint 3終了時（Phase 3完了）
```

---

#### 6-2. DECISIONS.md更新方法

**DECISIONS.mdへの記録基準**:
```markdown
# 進捗共有ガイド（guides/progress-tracking.md または既存ガイドに追加）

## DECISIONS.md更新方法

### 記録すべき決定事項

以下の場合はDECISIONS.mdに記録してください:

1. **移行方針の変更**
   - 例: プロジェクトの移行順序を変更
   - 例: Sprintスケジュールを延期

2. **技術的な重要決定**
   - 例: 新しいツールの導入
   - 例: スキーマフォーマットの変更

3. **リスク対応の決定**
   - 例: 重大リスクの緩和策実施
   - 例: ロールバック実行の決定

4. **libx-docs関連の決定**
   - 例: 廃止手順の変更
   - 例: 最終同期日の延期

### 記録フォーマット

DECISIONS.mdの既存フォーマットに従ってください:

```markdown
### 決定XX: （決定事項のタイトル）

- **決定日**: 2025-XX-XX
- **背景**: （決定に至った背景）
- **決定内容**: （具体的な決定内容）
- **理由**: （決定の理由・根拠）
- **影響**: （影響範囲・ステークホルダー）
- **代替案**: （検討した代替案）
- **承認者**: （承認者名）
- **関連**: （関連するドキュメントやIssue）
```

### 更新手順

1. DECISIONS.mdを開く
2. 該当セクションに新しい決定を追記
3. 決定番号を採番（連番）
4. 週次レポートからリンク
```

---

## 📁 参照すべきPhase 3-5の成果物

### 1. migration-dashboard.md（400行）

**ファイル**: `docs/new-generator-plan/status/migration-dashboard.md`

**Phase 3-6での活用箇所**:
- タスク1（マイグレーション手順書）: プロジェクト一覧、ステップ定義
- タスク2（差分レポートガイド）: レビュープロセス
- タスク6（進捗共有）: ステータス更新方法

**重要セクション**:
- プロジェクト一覧: 4プロジェクトの詳細情報
- 詳細ステータス管理: 変換→検証→レビュー→承認→デプロイ
- CI/自動化の活用: Migration Workflow実行計画

---

### 2. migration-schedule.md（300行）

**ファイル**: `docs/new-generator-plan/status/migration-schedule.md`

**Phase 3-6での活用箇所**:
- タスク1（マイグレーション手順書）: 推奨移行スケジュール
- タスク4（CIガイド）: Sprint別のCI活用例
- タスク6（進捗共有）: マイルストーン管理

**重要セクション**:
- 全体タイムライン: 25日間（2025-10-22〜2025-11-15）
- Sprint計画: Sprint 1-3の詳細
- マイルストーン: M1-M5の定義

---

### 3. migration-risks.md（300行）

**ファイル**: `docs/new-generator-plan/status/migration-risks.md`

**Phase 3-6での活用箇所**:
- タスク5（FAQ/トラブルシューティング）: 10個のリスクをFAQに反映
- タスク1（マイグレーション手順書）: リスク対策手順

**重要セクション**:
- リスク評価基準: 影響度・発生確率の定義
- 10個の主要リスク: R1-R10の詳細
- 緩和策とアクションプラン: 具体的な対応方法

---

### 4. communication-plan.md（200行）

**ファイル**: `docs/new-generator-plan/status/communication-plan.md`

**Phase 3-6での活用箇所**:
- タスク6（進捗共有）: 週次レポートテンプレート
- タスク1（マイグレーション手順書）: コミュニケーションフロー

**重要セクション**:
- コミュニケーションチャネル: 文書ベース、GitHub Issues
- 週次レビュー会議: 毎週土曜日 10:00-10:30
- 週次レポートテンプレート: 詳細なテンプレート

---

### 5. DECISIONS.md更新部分（200行追加）

**ファイル**: `docs/new-generator-plan/DECISIONS.md`

**Phase 3-6での活用箇所**:
- タスク1（マイグレーション手順書）: libx-docs廃止手順
- タスク5（FAQ/トラブルシューティング）: libx-docs関連FAQ

**重要セクション**:
- libx-docs廃止決定: 2025-11-15目標
- 3フェーズの廃止手順: 最終同期、移行実行、リポジトリ廃止
- 代替案との比較: 維持案、縮小案との比較

---

## 🚨 注意事項

### 1. Sprint実施後のドキュメント更新の重要性

**重要**: Phase 3-6のドキュメントは「生きたドキュメント」として運用してください。

**更新タイミング**:
```
Sprint 1完了（2025-10-27）
  ↓
マイグレーション手順書更新（v1.1）
  ↓
FAQ/トラブルシューティング追加
  ↓
Sprint 2完了（2025-11-03）
  ↓
マイグレーション手順書更新（v1.2）
  ↓
FAQ/トラブルシューティング追加
  ↓
Sprint 3完了（2025-11-15）
  ↓
マイグレーション手順書更新（v2.0最終版）
  ↓
FAQ/トラブルシューティング追加
  ↓
Phase 3-6完了レポート作成
```

**更新内容**:
- 実際にかかった時間
- 発生した問題と解決方法
- 手順の改善点
- 新たに発見したリスク
- FAQ項目の追加

---

### 2. 実際の移行結果を反映した「生きたドキュメント」にする

**ドキュメントの進化**:

#### 初版（Sprint開始前）
- Phase 3-5の計画に基づく理論的な手順書
- migration-risks.mdのリスクを元にしたFAQ

#### v1.1（Sprint 1完了後）
- project-template移行の実績を反映
- 実際に発生した問題をFAQ追加
- 手順の改善点を反映

#### v1.2（Sprint 2完了後）
- test-verification移行の実績を反映
- 3言語対応の知見を追加
- 手順の更なる改善

#### v2.0最終版（Sprint 3完了後）
- 全プロジェクト移行の実績を反映
- libx-docs廃止の実績を記録
- 完全な「実績ベース」のドキュメント

---

### 3. Phase 3-4のCI/自動化ガイドとの整合性維持

**重要**: Phase 3-4で作成したCIガイドとの整合性を保ってください。

**確認事項**:
1. **examples/ci.md**
   - Phase 3-4で作成した例1-3と、Phase 3-6で追加する例4-6の整合性
   - コマンド形式、YAML形式の統一
   - Artifact名の一致

2. **guides/ci.md**
   - Phase 3-4で記載したSecrets・環境変数と、Phase 3-6で追加する項目の整合性
   - ワークフロー設計パターンとの整合性

3. **.docs-cli/config.ci.json**
   - Phase 3-4で定義した設定と、Phase 3-6で推奨する設定の整合性
   - 設定値の矛盾がないか確認

**更新時の注意**:
- Phase 3-4のドキュメントを参照しながら執筆
- 矛盾がある場合はPhase 3-4のドキュメントも更新
- 変更履歴を明記

---

### 4. ステークホルダー向けの情報共有

**Phase 3-6で作成するドキュメントの読者**:

#### 技術担当者
- マイグレーション手順書
- 差分レポートガイド
- 互換レイヤーガイド
- CIガイド

#### レビュー担当者
- 差分レポートガイド
- FAQ/トラブルシューティング

#### プロジェクトマネージャー
- 進捗共有ガイド
- 週次レポート

#### 将来的なコントリビューター
- 全ドキュメント（特にFAQ/トラブルシューティング）

**考慮事項**:
- 各読者のレベルに応じた説明
- 用語の統一（用語集の活用）
- 図表の活用（必要に応じて）

---

## ✅ Phase 3-6 開始前のチェックリスト

### Phase 3-5成果物の確認

- [ ] migration-dashboard.md（400行）を読んだ
- [ ] migration-schedule.md（300行）を読んだ
- [ ] migration-risks.md（300行）を読んだ
- [ ] communication-plan.md（200行）を読んだ
- [ ] DECISIONS.md更新部分（libx-docs廃止決定）を読んだ
- [ ] phase-3-5-completion-report.md（600行）を読んだ

---

### Sprint実施状況の確認

**注**: Phase 3-6は、Sprint実施と並行して進められます。

- [ ] Sprint 1の開始準備が整っている（2025-10-22開始予定）
- [ ] Migration Workflowのテスト実行が完了している
- [ ] CI設定のカスタマイズ（maxBackups、retentionDays）が完了している
- [ ] バックアップ戦略が確認されている

---

### 既存ガイドドキュメントの確認

Phase 3-6では既存ガイドの更新も含まれます。

- [ ] guides/migration-data.md（Phase 3-1で作成）を読んだ
- [ ] guides/compat-layer.md（Phase 3-3で作成）を読んだ
- [ ] guides/ci.md（Phase 3-4で作成）を読んだ
- [ ] examples/ci.md（Phase 3-4で作成）を読んだ

---

### ドキュメント作成環境の準備

- [ ] Markdownエディタが準備されている
- [ ] 必要に応じて図表作成ツールが準備されている（Mermaid、draw.ioなど）
- [ ] Gitコミットの準備（ブランチ作成など）

---

### Phase 3-4のCI/自動化ガイドの確認

整合性維持のため、Phase 3-4の成果物を再確認してください。

- [ ] phase-3-4-completion-report.md（600行）を読んだ
- [ ] .github/workflows/migration.yml（400行）を確認した
- [ ] .docs-cli/config.ci.json（340行）を確認した

---

## 🎯 Phase 3-6 での実装推奨順序

Phase 3-6のタスクは以下の順序で実装することを推奨します:

### 1. タスク5: FAQ/トラブルシューティング（最優先）

**理由**: Sprint 1-3と並行してFAQを充実させることで、実際の移行作業に即座に活用できる

**実装内容**:
- migration-risks.mdの10個のリスクをFAQに変換
- Sprint実施中に発生した問題を随時追加

**期間**: Sprint 1-3と並行（2025-10-22〜2025-11-15）

---

### 2. タスク1: マイグレーション手順書作成

**理由**: Sprint 1の開始前に初版を作成し、Sprint実施後に実績を反映

**実装内容**:
- Phase 3-5の成果物を統合した初版作成
- Sprint 1-3の実績を反映した更新（v1.1, v1.2, v2.0）

**期間**:
- 初版: Sprint 1開始前（2025-10-22前）
- v1.1: Sprint 1完了後（2025-10-27）
- v1.2: Sprint 2完了後（2025-11-03）
- v2.0: Sprint 3完了後（2025-11-15）

---

### 3. タスク2: 差分レポートガイド作成

**理由**: Sprint 1での差分レポート活用に必要

**実装内容**:
- Phase 3-2の差分レポート機能の文書化
- レビュープロセスの手順化

**期間**: Sprint 1開始前（2025-10-22前）

---

### 4. タスク4: CIガイド更新

**理由**: Sprint 1-3のCI活用例を追加

**実装内容**:
- examples/ci.mdに例4-6を追加
- Sprint実施後に実績を反映

**期間**: Sprint 1-3と並行（2025-10-22〜2025-11-15）

---

### 5. タスク3: 互換レイヤーガイド更新

**理由**: 優先度は中程度だが、サポート終了日の明記は重要

**実装内容**:
- サポート終了日（2026-03-31）の明記
- 警告メッセージの説明

**期間**: Sprint 1期間中（2025-10-22〜2025-10-27）

---

### 6. タスク6: 進捗共有と記録

**理由**: Sprint 1-3の進捗を週次レポートで記録

**実装内容**:
- 週次レポート作成ガイドの整備
- 毎週土曜日に週次レポート作成

**期間**: Sprint 1-3と並行（毎週土曜日）

---

## 💡 Phase 3-6 実装のヒント

### 1. migration-dashboard.mdを「マスターダッシュボード」として活用

**推奨アプローチ**:
- migration-dashboard.mdを常に最新の状態に保つ
- 各タスクで作成するドキュメントからmigration-dashboard.mdへリンク
- 逆に、migration-dashboard.mdから各ガイドへリンク

**実装例**:
```markdown
# migration-dashboard.md

## プロジェクト一覧

（プロジェクト一覧表）

**詳細な移行手順**: [マイグレーション手順書](../guides/migration.md)

## リスク管理

（リスク概要）

**詳細なリスク情報**: [移行リスクログ](./migration-risks.md)
**FAQ**: [FAQ/トラブルシューティング](../guides/faq.md)
```

---

### 2. Sprint実施後の「振り返りセッション」

**推奨アプローチ**:
```
Sprint完了
  ↓
振り返りセッション（30分〜1時間）
  ├─ 何が上手くいったか
  ├─ 何が上手くいかなかったか
  ├─ 発見したリスク
  └─ 改善点
  ↓
ドキュメント更新
  ├─ マイグレーション手順書
  ├─ FAQ/トラブルシューティング
  ├─ migration-risks.md（新リスク追加）
  └─ 週次レポート作成
  ↓
次のSprint開始
```

---

### 3. バージョン管理とタグ付け

**推奨アプローチ**:
```markdown
# マイグレーション手順書（guides/migration.md）

## 改訂履歴

| バージョン | 日付 | 変更内容 | 変更者 |
|-----------|------|---------|--------|
| v1.0 | 2025-10-22 | 初版作成 | Claude |
| v1.1 | 2025-10-27 | Sprint 1実績を反映 | Claude |
| v1.2 | 2025-11-03 | Sprint 2実績を反映 | Claude |
| v2.0 | 2025-11-15 | Sprint 3実績を反映（最終版） | Claude |
```

**Gitタグ**:
```bash
# 各バージョンでGitタグを作成
git tag -a migration-guide-v1.0 -m "マイグレーション手順書 v1.0（初版）"
git tag -a migration-guide-v1.1 -m "マイグレーション手順書 v1.1（Sprint 1実績反映）"
git tag -a migration-guide-v2.0 -m "マイグレーション手順書 v2.0（最終版）"
```

---

### 4. ドキュメントの相互リンク

**推奨アプローチ**:
- 各ドキュメント間で相互にリンクを張る
- 「詳細は〜を参照」形式で誘導
- 循環参照を避ける

**実装例**:
```markdown
# マイグレーション手順書（guides/migration.md）

## リスク管理

移行作業には以下のリスクがあります（詳細は[移行リスクログ](../status/migration-risks.md)を参照）:
- R1: データ損失リスク
- R2: 互換性問題
...

各リスクの対処法は[FAQ/トラブルシューティング](./faq.md)を参照してください。
```

---

## 📞 サポートとフィードバック

### Phase 3-6実装中に問題が発生した場合

1. **Phase 3-5成果物の確認**
   - migration-dashboard.md、migration-schedule.md、migration-risks.md、communication-plan.md
   - DECISIONS.md更新部分（libx-docs廃止決定）

2. **Phase 3-4成果物の確認**
   - phase-3-4-completion-report.md
   - guides/ci.md、examples/ci.md
   - .github/workflows/migration.yml

3. **Phase 3-1〜3-3成果物の確認**
   - guides/migration-data.md（Phase 3-1）
   - guides/compat-layer.md（Phase 3-3）

4. **引き継ぎドキュメントの確認**
   - phase-3-4-to-3-5-handoff.md
   - phase-3-5-to-3-6-handoff.md（本ドキュメント）

---

## 🎉 まとめ

Phase 3-5では、**移行作業の詳細計画**を策定しました。

**Phase 3-6への引き継ぎポイント**:

1. ✅ **移行計画ドキュメントを活用**: 4つのドキュメント（1,200行）を各タスクで活用
2. ✅ **CI/自動化インフラとの連携**: Phase 3-4のMigration Workflowを手順書に反映
3. ✅ **libx-docs廃止計画の反映**: DECISIONS.mdの廃止手順をドキュメント化
4. ✅ **「生きたドキュメント」として運用**: Sprint実施後に実績を反映
5. ✅ **Phase 3-4との整合性維持**: CIガイドとの矛盾を避ける
6. ✅ **推奨実装順序を守る**: タスク5 → タスク1 → タスク2 → タスク4 → タスク3 → タスク6

**次のステップ**: Phase 3-6（ドキュメント整備）の実装を開始してください。

---

**最終更新**: 2025-10-21
**作成者**: Claude Code (AI Assistant)
**Phase 3-5 完了レポート**: [phase-3-5-completion-report.md](./phase-3-5-completion-report.md)
**Phase 3-6 計画**: [phase-3-6-documentation.md](./phase-3-6-documentation.md)
