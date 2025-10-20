# Phase 3-3 から Phase 3-4 への引き継ぎ文書

**作成日**: 2025-10-21
**Phase 3-3 完了日**: 2025-10-21
**Phase 3-4 開始予定日**: 2025-10-22

---

## 📋 Phase 3-3 完了状況サマリー

### ✅ 完了した作業

Phase 3-3では、**互換レイヤー**の実装と**段階的削除計画**を完了しました。

#### 主要な成果物

1. **互換ラッパースクリプト** (4ファイル、750行)
   - `scripts/compat/create-project.js`
   - `scripts/compat/add-language.js`
   - `scripts/compat/create-version.js`
   - `scripts/compat/create-document.js`
   - `scripts/compat/README.md`

2. **非推奨警告・レポート生成システム** (2ファイル、810行)
   - `packages/cli/src/compat/reporters/deprecation-warner.js`
   - `packages/cli/src/compat/reporters/migration-reporter.js`

3. **CLIコマンド統合** (3コマンド、450行)
   - `docs-cli compat check` - 互換性チェック
   - `docs-cli compat report` - 移行レポート生成
   - `docs-cli compat migrate-config` - 設定ファイル移行

4. **ドキュメント** (3ファイル、2,190行)
   - `docs/new-generator-plan/guides/compat-layer.md` - 互換レイヤー完全ガイド
   - `scripts/compat/README.md` - 互換スクリプト利用ガイド
   - `docs/new-generator-plan/DECISIONS.md` - Phase 3-3の決定事項追加

---

## 🎯 Phase 3-4 への重要な引き継ぎ事項

### 1. 互換レイヤーの存在と活用

Phase 3-4では、CI/自動化ワークフローを実装します。このワークフローでは、以下の2つの実行モードをサポートする必要があります：

#### a. 新CLIモード（推奨）
```yaml
# GitHub Actions での実行例
- name: プロジェクトを作成
  run: docs-cli add project my-project --display-name-en "My Project" --display-name-ja "私のプロジェクト"

- name: バージョンを追加
  run: docs-cli add version my-project v1 --copy-from latest

- name: 言語を追加
  run: docs-cli add language my-project ja
```

#### b. 互換ラッパーモード（既存ユーザー向け）
```yaml
# 既存スクリプトを引き続き使用する場合
- name: プロジェクトを作成（互換モード）
  run: node scripts/compat/create-project.js my-project "My Project" "私のプロジェクト"

- name: 互換性チェック
  run: docs-cli compat check
```

**重要**: CI環境では非推奨警告を抑制するため、`--suppress-warning` オプションを付与してください。

```yaml
- name: プロジェクトを作成（警告抑制）
  run: node scripts/compat/create-project.js my-project "My Project" "私のプロジェクト" --suppress-warning
```

### 2. 互換レイヤーのサポート終了スケジュール

**サポート終了日**: **2026-03-31** (Phase 5完了後3ヶ月)

| マイルストーン | 予定日 | 説明 |
|------------|-------|------|
| Phase 3-3 完了 | 2025-10-21 | 互換レイヤー実装完了 |
| Phase 3-4 開始 | 2025-10-22 | CI/自動化実装開始 |
| Phase 4 完了 | 2025-11-30 | QA・リリース準備完了 |
| Phase 5 完了 | 2025-12-31 | リリース後の継続改善完了 |
| **サポート終了** | **2026-03-31** | 互換レイヤーのサポート終了 |

**CI/自動化実装時の推奨事項**:
- 新しいワークフローは新CLIコマンドを使用する
- 既存ワークフローの移行は段階的に実施（互換ラッパーで動作を維持）
- 移行完了時には `docs-cli compat check` でチェックを実施

### 3. CI環境での互換性チェックの活用

Phase 3-4のCI/自動化ワークフロー実装時には、以下のコマンドを活用してください：

#### a. 互換性チェック
```yaml
- name: 互換性チェック
  run: docs-cli compat check --no-schedule --no-guide
```

**用途**: CI環境で旧スクリプトが残っている場合に検出し、警告を出す

#### b. 移行レポート生成
```yaml
- name: 移行レポート生成
  run: docs-cli compat report --output reports/migration

- name: レポートをArtifactとして保存
  uses: actions/upload-artifact@v3
  with:
    name: migration-reports
    path: reports/migration/
```

**用途**: 移行の進捗状況を可視化し、レビューを容易にする

#### c. 設定ファイル移行
```yaml
- name: 設定ファイル移行
  run: docs-cli compat migrate-config
```

**用途**: 旧設定ファイルを新形式に自動移行する

### 4. 引数順序の変更に注意（create-document）

**重要な変更点**: `create-document` コマンドの引数順序が変更されています。

#### 旧スクリプト
```bash
node scripts/create-document.js <project> <lang> <version> <category> <title>
```

#### 新CLI
```bash
docs-cli add document <project> <version> <lang> <category> <title>
```

**変更内容**: `<lang>` と `<version>` の順序が入れ替わりました（バージョンファーストに変更）

**CI実装時の注意**:
- 新CLIを使用する場合は、引数順序を変更してください
- 互換ラッパーを使用する場合は、旧引数順序のままで動作します（自動変換されます）

### 5. 未サポートオプション

以下のオプションは新CLIではサポートされていません。CI実装時には代替手段を検討してください。

#### create-project
- `--icon` - アイコン指定（将来実装予定）
- `--tags` - タグ指定（将来実装予定）
- `--skip-test` - テストスキップ（CI環境では不要）

#### add-language
- `--auto-template` - 自動テンプレート生成（新CLIではデフォルト動作）
- `--skip-test` - テストスキップ（CI環境では不要）
- `--skip-top-page` - トップページ更新スキップ（新CLIではオプションで対応）
- `--interactive` - 対話モード（CI環境では使用不可）

#### create-version
- `--interactive` - 対話モード（CI環境では使用不可）

#### create-document
- `--interactive` - 対話モード（CI環境では使用不可）

**対応方針**:
- CI環境では `--interactive` は使用しない
- `--skip-test` は新CLIでは不要（テストは別ステップで実行）
- その他のオプションは必要に応じて手動対応

---

## 🔧 Phase 3-4 実装時の推奨事項

### 1. ワークフロー設計

Phase 3-4では `migration.yml` ワークフローを作成します。以下の点を考慮してください：

#### a. 新CLIコマンドを優先的に使用
```yaml
name: Migration Workflow

on:
  workflow_dispatch:
    inputs:
      project:
        description: 'プロジェクトID'
        required: true
      version:
        description: 'バージョンID'
        required: true

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      # 新CLIコマンドを使用
      - name: プロジェクトを作成
        run: docs-cli add project ${{ github.event.inputs.project }} --display-name-en "${{ github.event.inputs.project }}" --display-name-ja "${{ github.event.inputs.project }}"

      - name: バージョンを追加
        run: docs-cli add version ${{ github.event.inputs.project }} ${{ github.event.inputs.version }}

      - name: バリデーション
        run: docs-cli validate

      - name: ビルド
        run: pnpm build

      # 互換性チェック
      - name: 互換性チェック
        run: docs-cli compat check

      # レポート生成
      - name: 移行レポート生成
        run: docs-cli compat report --output reports/migration

      # Artifactとして保存
      - name: レポートをアップロード
        uses: actions/upload-artifact@v3
        with:
          name: migration-reports
          path: reports/migration/
```

#### b. 既存ワークフローの移行（互換ラッパー使用）
```yaml
name: Legacy Migration Workflow (Compatibility Mode)

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # ... (pnpm, Node.js setup)

      # 互換ラッパーを使用（警告抑制）
      - name: プロジェクトを作成（互換モード）
        run: node scripts/compat/create-project.js my-project "My Project" "私のプロジェクト" --suppress-warning

      # 互換性チェックで警告を確認
      - name: 互換性チェック
        run: docs-cli compat check
        continue-on-error: true
```

### 2. 環境変数と設定ファイル

Phase 3-4のCI実装では、以下の設定ファイルを活用してください：

#### a. `.docs-cli/config.ci.json` の活用
```json
{
  "mode": "ci",
  "verbose": true,
  "suppressWarnings": true,
  "projects": {
    "default": {
      "basePath": "apps",
      "template": "project-template"
    }
  },
  "artifacts": {
    "reports": "reports/migration",
    "backups": ".backups",
    "logs": "logs"
  }
}
```

#### b. CI環境変数
```yaml
env:
  DOCS_CLI_CONFIG: .docs-cli/config.ci.json
  NODE_ENV: production
```

### 3. Artifact管理

Phase 3-4では、以下のArtifactを保存する必要があります：

1. **移行レポート** (`reports/migration/`)
   - `migration-checklist.md` - 移行チェックリスト（Markdown）
   - `compatibility-report.html` - 互換性レポート（HTML）

2. **バックアップ** (`.backups/`)
   - 互換ラッパー実行時のバックアップファイル

3. **ログ** (`logs/`)
   - CLI実行ログ
   - ビルドログ

```yaml
- name: 移行レポートをアップロード
  uses: actions/upload-artifact@v3
  with:
    name: migration-reports
    path: |
      reports/migration/
      .backups/
      logs/
    retention-days: 30
```

### 4. 通知フロー

互換性チェックで警告が検出された場合、通知を送信してください：

```yaml
- name: 互換性チェック
  id: compat-check
  run: |
    docs-cli compat check > compat-check.log 2>&1
    echo "::set-output name=has-warnings::$(grep -q 'WARNING' compat-check.log && echo 'true' || echo 'false')"
  continue-on-error: true

- name: 警告通知
  if: steps.compat-check.outputs.has-warnings == 'true'
  uses: actions/github-script@v6
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '⚠️ 互換性チェックで警告が検出されました。\n\nレポートを確認してください: [Artifacts](https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }})'
      })
```

---

## 📚 参照ドキュメント

Phase 3-4実装時に参照すべきドキュメント：

### Phase 3-3で作成したドキュメント

1. **[互換レイヤーガイド](./guides/compat-layer.md)**
   - 互換スクリプトの使用方法
   - 移行ガイド
   - トラブルシューティング
   - FAQ

2. **[互換スクリプトREADME](../../scripts/compat/README.md)**
   - 各スクリプトの使用方法
   - 引数マッピング表
   - 未サポートオプション一覧

3. **[DECISIONS.md](./DECISIONS.md)**
   - Phase 3-3の設計判断
   - サポート終了スケジュール
   - 段階的削除計画

4. **[Phase 3-3完了レポート](./phase-3-3-completion-report.md)**
   - 実装内容の詳細
   - コード統計
   - 残存課題

### Phase 3-4で参照すべき計画書

1. **[Phase 3-4計画](./phase-3-4-ci-automation.md)**
   - CI/自動化の実装計画
   - タスク一覧
   - 完了条件

---

## 🚨 注意事項

### 1. 互換ラッパーの非推奨警告

**問題**: CI環境で互換ラッパーを使用すると、非推奨警告が表示され、ログが煩雑になる

**解決策**: `--suppress-warning` オプションを付与
```bash
node scripts/compat/create-project.js my-project "My Project" "私のプロジェクト" --suppress-warning
```

### 2. 引数順序の変更（create-document）

**問題**: CI環境で `create-document` の引数順序を間違えると、エラーになる

**解決策**:
- 新CLIを使用する場合: `<version> <lang>` の順序で指定
- 互換ラッパーを使用する場合: `<lang> <version>` の順序（自動変換）

### 3. 未サポートオプション

**問題**: 旧スクリプトで使用していたオプションが新CLIでサポートされていない

**解決策**:
- CI環境では `--interactive` は使用しない
- `--skip-test` は新CLIでは不要（テストは別ステップで実行）
- その他のオプションは必要に応じて手動対応

### 4. CI環境での対話モード

**問題**: 互換ラッパーでは一部の対話モードがサポートされていない

**解決策**:
- すべての引数を明示的に指定
- `--interactive` オプションは使用しない

---

## ✅ Phase 3-4開始前のチェックリスト

Phase 3-4を開始する前に、以下を確認してください：

- [ ] Phase 3-3の成果物がすべて完成している
  - [ ] 4つの互換ラッパースクリプト
  - [ ] 非推奨警告システム
  - [ ] compatコマンド（check, report, migrate-config）
  - [ ] ドキュメント（compat-layer.md, README.md, DECISIONS.md）

- [ ] 互換レイヤーの動作確認が完了している
  - [ ] `node scripts/compat/create-project.js` が動作する
  - [ ] `docs-cli compat check` が動作する
  - [ ] `docs-cli compat report` がレポートを生成する

- [ ] ドキュメントを読んでいる
  - [ ] [互換レイヤーガイド](./guides/compat-layer.md)
  - [ ] [Phase 3-4計画](./phase-3-4-ci-automation.md)
  - [ ] この引き継ぎ文書

- [ ] CI実装の方針を決定している
  - [ ] 新CLIコマンドを使用するか、互換ラッパーを使用するか
  - [ ] Artifact保存先とアクセス権限
  - [ ] 通知方法（GitHub Comments, Slack, etc.）

---

## 🎯 Phase 3-4での実装推奨順序

Phase 3-4のタスクは以下の順序で実装することを推奨します：

### 1. ワークフロー設計（タスク1）
**目標**: `migration.yml` の基本構造を作成

**実装内容**:
- Checkout + pnpm install
- 新CLIコマンドの実行
- バリデーション
- ビルド

**活用する互換レイヤー機能**:
- なし（新CLIコマンドを使用）

---

### 2. 環境設定（タスク2）
**目標**: `.docs-cli/config.ci.json` を作成し、CI環境変数を設定

**実装内容**:
- CI用設定ファイルの作成
- 環境変数の定義
- Secretsの整理

**活用する互換レイヤー機能**:
- `docs-cli compat migrate-config` - 旧設定ファイルの移行

---

### 3. Artifact管理（タスク4）
**目標**: 差分レポート、ビルドログ、バックアップをArtifactとして保存

**実装内容**:
- `reports/migration/` のアップロード
- `.backups/` のアップロード
- `logs/` のアップロード

**活用する互換レイヤー機能**:
- `docs-cli compat report` - 移行レポート生成

---

### 4. 通知/承認フロー（タスク3）
**目標**: 互換性チェックで警告が検出された場合に通知

**実装内容**:
- GitHub Commentsへの通知
- Slackへの通知（オプション）

**活用する互換レイヤー機能**:
- `docs-cli compat check` - 互換性チェック

---

### 5. テスト（タスク5）
**目標**: サンプルプロジェクトでCI/自動化ワークフローをテスト

**実装内容**:
- 成功パターンのテスト
- 失敗パターンのテスト
- リトライ戦略のテスト

**活用する互換レイヤー機能**:
- 互換ラッパーを使用した既存ワークフローのテスト

---

### 6. ドキュメント（タスク6）
**目標**: CI/自動化のドキュメントを作成

**実装内容**:
- `docs/new-generator-plan/examples/ci.md`
- `guides/ci.md`

**活用する互換レイヤー機能**:
- なし（ドキュメント作成）

---

## 💡 Phase 3-4実装時のヒント

### 1. 互換レイヤーを活用した段階的移行

**推奨アプローチ**:
1. まず新CLIコマンドでワークフローを作成
2. 既存ワークフローは互換ラッパーで動作を維持
3. 段階的に新CLIコマンドに移行
4. `docs-cli compat check` で移行進捗を確認

### 2. レポート生成の自動化

**推奨アプローチ**:
1. `docs-cli compat report` を定期的に実行
2. レポートをArtifactとして保存
3. 移行進捗を可視化

### 3. エラーハンドリング

**推奨アプローチ**:
1. 互換性チェックは `continue-on-error: true` で実行
2. 警告検出時は通知を送信
3. 致命的なエラーはワークフローを停止

---

## 📞 サポートとフィードバック

### Phase 3-4実装中に問題が発生した場合

1. **互換レイヤー関連の問題**
   - [互換レイヤーガイド](./guides/compat-layer.md)のトラブルシューティングを確認
   - [互換スクリプトREADME](../../scripts/compat/README.md)のFAQを確認

2. **CI/自動化関連の問題**
   - [Phase 3-4計画](./phase-3-4-ci-automation.md)のタスクを確認
   - GitHub Actionsのログを確認

3. **新CLIコマンド関連の問題**
   - [新CLIのREADME](../../packages/cli/README.md)を確認
   - `docs-cli --help` でコマンドヘルプを確認

---

## 🎉 まとめ

Phase 3-3では、**互換レイヤー**の実装と**段階的削除計画**を完了しました。

**Phase 3-4への引き継ぎポイント**:

1. ✅ **互換レイヤーを活用**: CI環境で新CLIと互換ラッパーの両方をサポート
2. ✅ **引数順序の変更に注意**: `create-document` コマンドの引数順序が変更
3. ✅ **未サポートオプションに注意**: CI環境では `--interactive` などを使用しない
4. ✅ **サポート終了スケジュールを認識**: 2026-03-31にサポート終了
5. ✅ **互換性チェックを活用**: `docs-cli compat check` で移行進捗を確認
6. ✅ **レポート生成を活用**: `docs-cli compat report` で移行レポートを生成

**次のステップ**: Phase 3-4（CI/自動化）の実装を開始してください。

---

**最終更新**: 2025-10-21
**作成者**: Claude Code (AI Assistant)
**Phase 3-3 完了レポート**: [phase-3-3-completion-report.md](./phase-3-3-completion-report.md)
**Phase 3-4 計画**: [phase-3-4-ci-automation.md](./phase-3-4-ci-automation.md)
