# CI実行例

**作成日**: 2025-10-21
**Phase**: Phase 3-4
**ステータス**: 実装完了

---

## 📋 目次

1. [概要](#概要)
2. [GitHub Actions - Migration Workflow](#github-actions---migration-workflow)
3. [手動実行例](#手動実行例)
4. [プルリクエストでの自動実行](#プルリクエストでの自動実行)
5. [Artifactの確認方法](#artifactの確認方法)
6. [トラブルシューティング](#トラブルシューティング)

---

## 概要

このドキュメントでは、Phase 3-4で実装した**Migration Workflow**の実行例を紹介します。

### 実行モード

Migration Workflowは2つの実行モードをサポートしています：

1. **new-cli モード**（推奨） - 新しい `docs-cli` コマンドを使用
2. **compat モード** - 互換ラッパースクリプトを使用

---

## GitHub Actions - Migration Workflow

### ワークフローファイル

`.github/workflows/migration.yml`

### トリガー条件

1. **手動トリガー**（`workflow_dispatch`）
   - GitHub ActionsのUIから手動で実行
   - パラメータを指定可能

2. **プルリクエスト**（`pull_request`）
   - 関連ファイルの変更時に自動実行
   - 互換性チェックのみ実行

---

## 手動実行例

### 例1: 新CLIモードでプロジェクトを作成（Dry-run）

```yaml
# GitHub Actions UIでの入力例
project: my-new-docs
version: v1
mode: new-cli
dry-run: true
```

**実行内容**:
1. 互換性チェック実行
2. 移行レポート生成
3. プロジェクト作成（Dry-run、実際には作成されない）
4. バージョン追加（Dry-run）
5. バリデーション実行

**Artifacts**:
- `compat-check-log` - 互換性チェックログ
- `migration-reports` - 移行レポート（Markdown + HTML）

---

### 例2: 新CLIモードでプロジェクトを作成（実行）

```yaml
# GitHub Actions UIでの入力例
project: my-new-docs
version: v1
mode: new-cli
dry-run: false
```

**実行内容**:
1. 互換性チェック実行
2. 移行レポート生成
3. プロジェクト作成（実際に作成）
4. バージョン追加（実際に追加）
5. バリデーション実行
6. サイドバー生成
7. ビルド実行

**Artifacts**:
- `compat-check-log` - 互換性チェックログ
- `migration-reports` - 移行レポート
- `build-logs-new-cli` - ビルドログとバックアップ

---

### 例3: 互換モードでプロジェクトを作成

```yaml
# GitHub Actions UIでの入力例
project: legacy-docs
version:
mode: compat
dry-run: false
```

**実行内容**:
1. 互換性チェック実行
2. 移行レポート生成
3. 互換スクリプトの確認
4. プロジェクト作成（互換ラッパー経由）
5. バリデーション実行
6. サイドバー生成
7. ビルド実行

**Artifacts**:
- `compat-check-log` - 互換性チェックログ
- `migration-reports` - 移行レポート
- `build-logs-compat` - ビルドログとバックアップ

---

## プルリクエストでの自動実行

プルリクエスト作成時、以下のファイルが変更されている場合に自動実行されます：

- `.github/workflows/migration.yml`
- `.docs-cli/**`
- `packages/cli/**`
- `scripts/compat/**`

**実行内容**:
1. 互換性チェック実行
2. 移行レポート生成
3. 警告検出時にPRへコメント投稿

**PRコメント例**:

```markdown
## ⚠️ 互換性チェックで警告が検出されました

移行ワークフローの互換性チェックで警告が検出されました。

### 次のステップ
1. Artifacts から `compat-check-log` をダウンロード
2. ログを確認して警告内容を把握
3. 必要に応じて互換レイヤーの使用を検討

### 参考ドキュメント
- 互換レイヤーガイド
- Phase 3-4計画

**サポート終了日**: 2026-03-31
```

---

## Artifactの確認方法

### 1. GitHub ActionsのUIから確認

1. リポジトリの **Actions** タブを開く
2. **Migration Workflow** を選択
3. 実行履歴から該当の実行を選択
4. **Artifacts** セクションからダウンロード

### 2. 互換性チェックログ

**Artifact名**: `compat-check-log`

**内容**:
```
============================================================
compat check: 互換性チェックを実行します
============================================================

📋 互換性チェック結果
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ create-project
     旧スクリプト: 存在
     互換ラッパー: 存在

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  検出されたスクリプト: 4
  互換ラッパーあり: 4
  互換ラッパーなし: 0
```

### 3. 移行レポート

**Artifact名**: `migration-reports`

**ファイル構成**:
```
reports/migration/
├── migration-checklist.md    # Markdown形式のチェックリスト
└── compatibility-report.html # HTML形式のレポート
```

**migration-checklist.md の内容例**:

```markdown
# 移行チェックリスト

## 移行前の準備
- [ ] 新CLIのインストール
- [ ] バックアップの作成
- [ ] 互換性チェックの実行

## スクリプト別移行タスク
### create-project
- [ ] `node scripts/create-project.js` → `docs-cli add project` に置き換え
- [ ] 引数の確認（位置引数 → オプション引数）
...
```

### 4. ビルドログ

**Artifact名**: `build-logs-new-cli` または `build-logs-compat`

**内容**:
```
logs/
├── build.log         # ビルドログ
└── validate.log      # バリデーションログ

.backups/
└── ... # バックアップファイル
```

---

## Phase 3の移行作業でのCI活用例

このセクションは、Phase 3-6で追加されたSprint別のCI活用例です。

### 例4: Sprint 1 - project-template移行

**背景**: Phase 3-5で策定した移行計画に基づき、Sprint 1でproject-templateを移行

**実施期間**: 2025-10-22〜2025-10-27

#### ステップ1: Dry-runモードで事前確認

```yaml
# GitHub Actions UIでの手動実行
project: project-template
version: v1
mode: new-cli
dry-run: true
```

**目的**: 変換結果の事前確認、問題の早期発見

**確認ポイント**:
- 互換性チェックログで警告・エラーがないか
- 移行レポート（HTML）で差分を視覚的に確認
- `Deleted`が0であることを確認

#### ステップ2: Artifactから移行レポート確認

1. GitHub > Actions > Migration Workflow > 実行履歴
2. Artifacts > `migration-reports` > ダウンロード
3. `compatibility-report.html`をブラウザで開く

**確認内容**:
- サマリー: Added/Changed/Deleted の数
- 差分詳細: 各変更内容を確認
- 重大差分: 🔴赤色（Deleted）がないか

#### ステップ3: リスク確認

[移行リスクログ](../status/migration-risks.md)で特定したR1-R10のリスクを確認:
- R1: データ損失リスク → バックアップ確認
- R2: 互換性問題 → compat-check-logで確認
- R4: ビルドエラー → build-logsで確認

#### ステップ4: 本番実行（問題なければ）

```yaml
# GitHub Actions UIでの手動実行
project: project-template
version: v1
mode: new-cli
dry-run: false  # 本番実行
```

**実行後の確認**:
- ビルド成功: build-logs確認
- レジストリ更新: `registry/docs.json`確認
- デプロイテスト: プレビュー環境確認

#### ステップ5: 実行結果の記録

1. [移行ダッシュボード](../status/migration-dashboard.md)のステータス更新
2. [週次レポート](../status/migration-weekly-20251026.md)作成
3. [コミュニケーション計画](../status/communication-plan.md)のテンプレート使用

**実績**（Sprint 1実施後に記入）:
- 実行時間: （記入）
- 発生した問題: （記入）
- 解決方法: （記入）

---

### 例5: Sprint 2 - test-verification移行（3言語対応）

**背景**: 3言語（en/ja/ko）対応プロジェクトでの移行検証

**実施期間**: 2025-10-28〜2025-11-03

#### ステップ1: Sprint 1の改善点を反映

Sprint 1で発見した問題の修正を確認:
- （Sprint 1実施後に記入）

#### ステップ2: Dry-runモードで事前確認

```yaml
# GitHub Actions UIでの手動実行
project: test-verification
version: v1
mode: new-cli
dry-run: true
```

**特別な確認ポイント**:
- 3言語すべてのコンテンツが正しく処理されるか
- ko言語の未翻訳コンテンツの扱い（R3リスク）
- 言語間のディレクトリ構造の整合性

#### ステップ3: 韓国語コンテンツの確認

```bash
# ローカルで確認
ls -la apps/test-verification/src/content/docs/v1/ko/

# 互換性チェックログで確認
# Artifact > compat-check-log > ダウンロード
# "ko" で検索
```

**確認内容**:
- ko言語のファイル数
- 未翻訳コンテンツの有無
- `status: "missing"`の設定状況

#### ステップ4: 本番実行

```yaml
project: test-verification
version: v1
mode: new-cli
dry-run: false
```

#### ステップ5: 多言語対応の検証

```bash
# ビルド成功確認
ls -la dist/docs/test-verification/v1/

# 各言語のページが生成されているか確認
ls -la dist/docs/test-verification/v1/en/
ls -la dist/docs/test-verification/v1/ja/
ls -la dist/docs/test-verification/v1/ko/
```

**実績**（Sprint 2実施後に記入）:
- 実行時間: （記入）
- 発生した問題: （記入）
- 解決方法: （記入）

---

### 例6: Sprint 3 - libx-docs最終移行と廃止

**背景**: Phase 3-5で決定したlibx-docs廃止計画に基づく最終移行

**実施期間**: 2025-11-11〜2025-11-15

#### フェーズ1: 最終同期（2025-11-11）

**ステップ1: Git履歴確認**

```bash
# libx-docsリポジトリの変更確認
cd ../libx-docs
git log --oneline --since="2025-10-01"

# 最終更新日時
git log -1 --format="%ai"
```

**ステップ2: syncHashによる差分検出**

```bash
# libx-devに戻る
cd ../libx-dev

# 同期状態の確認
pnpm exec docs-cli validate --check-sync

# 詳細な差分表示
pnpm exec docs-cli validate --check-sync --verbose
```

**ステップ3: 最終バックアップ作成**

```yaml
# GitHub Actions UIでの手動実行
project: libx-docs
version: v1
mode: new-cli
dry-run: true  # バックアップ作成のためのDry-run
```

#### フェーズ2: 移行実行（2025-11-12〜2025-11-14）

**ステップ1: Dry-run実行**

```yaml
project: libx-docs
version: v1
mode: new-cli
dry-run: true
```

**特別な確認ポイント**:
- ライセンス情報の確認（R5リスク）
- libx-docs同期状態の確認（R6リスク）
- データ損失リスクの確認（R1リスク）

**ステップ2: ライセンス情報の確認**

```bash
# project.config.jsonのlicensingセクション確認
cat apps/libx-docs/src/config/project.config.json | jq '.licensing'

# レジストリに正しく変換されているか確認（Dry-run後）
cat registry/docs.json | jq '.projects[] | select(.id=="libx-docs") | .licensing'
```

**ステップ3: 本番実行**

```yaml
project: libx-docs
version: v1
mode: new-cli
dry-run: false
```

**ステップ4: ビルド・デプロイテスト**

```bash
# ビルドテスト
pnpm --filter=libx-docs build

# 生成されたファイルの確認
ls -la dist/docs/libx-docs/
```

#### フェーズ3: リポジトリ廃止（2025-11-15）

**ステップ1: README更新**

```bash
cd ../libx-docs
# README.mdを更新（アーカイブ化の旨を記載）
```

**ステップ2: GitHubでアーカイブ化**

```
# GitHub > Settings > General > Danger Zone
# "Archive this repository" を実行
```

**ステップ3: libx-dev側の更新**

```bash
cd ../libx-dev

# libx-docs関連のスクリプトを更新
# - scripts/sync-content.js（削除または非推奨化）
# - docs/LIBX_DOCS_SYNC.md（アーカイブ化の旨を追記）
# - CLAUDE.md（libx-docs関連の記述を更新）
```

**実績**（Sprint 3実施後に記入）:
- 実行時間: （記入）
- 発生した問題: （記入）
- 解決方法: （記入）

---

## トラブルシューティング

### Q1: ワークフローが失敗する

**原因**:
- 必要な権限がない
- 設定ファイルが正しくない
- CLIコマンドのバグ

**解決策**:
1. Artifactから `compat-check-log` を確認
2. エラーメッセージを確認
3. `.docs-cli/config.ci.json` の設定を確認

### Q2: Artifactがダウンロードできない

**原因**:
- リポジトリのアクセス権限がない
- Artifactの保持期間が過ぎた

**解決策**:
1. リポジトリの権限を確認
2. `retention-days` の設定を確認（デフォルト: 7日〜30日）

### Q3: 互換性チェックで警告が出る

**原因**:
- 旧スクリプトが残っている
- 互換ラッパーがインストールされていない

**解決策**:
1. `docs-cli compat check` を実行
2. `docs-cli compat report` でレポート生成
3. 移行ガイドに従って対応

### Q4: Dry-runモードが動作しない

**原因**:
- 入力パラメータが正しくない
- ワークフローの条件分岐が誤っている

**解決策**:
1. GitHub Actions UIで `dry-run: true` を選択
2. ログで `--dry-run` フラグが付与されているか確認

---

## 参考資料

- [Phase 3-4計画](../phase-3-4-ci-automation.md)
- [CIガイド](../guides/ci.md)
- [互換レイヤーガイド](../guides/compat-layer.md)
- [Phase 3-3完了レポート](../phase-3-3-completion-report.md)

---

**最終更新**: 2025-10-21
**作成者**: Claude Code (AI Assistant)
