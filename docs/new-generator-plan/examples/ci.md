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
