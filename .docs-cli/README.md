# .docs-cli 設定ディレクトリ

このディレクトリには、`docs-cli` コマンドの設定ファイルが含まれています。

## ファイル一覧

- `config.ci.json` - CI環境用の設定ファイル
- `config.ci.example.json` - CI環境用設定のサンプル（コメント付き）
- `README.md` - このファイル

## 使用方法

### CI環境での使用

GitHub ActionsなどのCI環境で使用する場合、環境変数 `DOCS_CLI_CONFIG` を設定します。

```yaml
env:
  DOCS_CLI_CONFIG: .docs-cli/config.ci.json
  NODE_ENV: production
```

### 設定ファイルのカスタマイズ

1. `config.ci.example.json` をコピーして新しい設定ファイルを作成
2. プロジェクトの要件に応じて設定を変更
3. CI環境で環境変数を設定

```bash
# ローカルでテスト
export DOCS_CLI_CONFIG=.docs-cli/config.ci.json
pnpm exec docs-cli validate
```

## 設定項目

### mode
実行モード:
- `ci` - CI環境
- `local` - ローカル開発
- `production` - 本番環境

### verbose
詳細ログを出力するか（`true` / `false`）

### suppressWarnings
警告を抑制するか（CI環境では `false` を推奨）

### registry
レジストリ設定:
- `path` - レジストリファイルのパス
- `validateOnLoad` - 読み込み時にバリデーションを実行するか
- `strictMode` - 厳格モードを有効にするか

### projects
プロジェクト設定:
- `basePath` - プロジェクトのベースパス
- `template` - プロジェクトテンプレート名
- `defaultLanguages` - デフォルト言語

### build
ビルド設定:
- `output` - ビルド出力ディレクトリ
- `sidebar.generate` - サイドバーを自動生成するか
- `sidebar.outputPath` - サイドバー出力パス
- `clean` - ビルド前にクリーンするか

### migrate
移行設定:
- `backup` - バックアップを作成するか
- `backupDir` - バックアップディレクトリ
- `maxBackups` - 最大バックアップ数
- `dryRun` - Dry-runモード

### artifacts
Artifact設定（CI環境用）:
- `enabled` - Artifactを有効にするか
- `reports` - レポート出力ディレクトリ
- `backups` - バックアップディレクトリ
- `logs` - ログディレクトリ
- `retentionDays` - 保持日数

### validation
バリデーション設定:
- `strictMode` - 厳格モード
- `checkLinks` - リンクチェックを実行するか
- `checkSyncHash` - syncHashをチェックするか
- `failOnWarning` - 警告時に失敗するか

### ci
CI固有の設定:
- `provider` - CIプロバイダー（`github-actions`, `gitlab-ci`, など）
- `notifications.enabled` - 通知を有効にするか
- `notifications.onWarning` - 警告時に通知するか
- `notifications.onError` - エラー時に通知するか
- `timeouts.build` - ビルドタイムアウト（秒）
- `timeouts.validate` - バリデーションタイムアウト（秒）
- `timeouts.migrate` - 移行タイムアウト（秒）

## 環境変数

以下の環境変数を使用できます:

| 環境変数 | 説明 | デフォルト値 |
|---------|------|------------|
| `DOCS_CLI_CONFIG` | 設定ファイルのパス | `undefined` |
| `NODE_ENV` | Node.js環境 | `development` |
| `CI` | CI環境フラグ | `false` |
| `DOCS_CLI_VERBOSE` | 詳細ログ | `false` |
| `DOCS_CLI_DRY_RUN` | Dry-runモード | `false` |

## トラブルシューティング

### 設定ファイルが読み込まれない

1. `DOCS_CLI_CONFIG` 環境変数が正しく設定されているか確認
2. 設定ファイルのパスが正しいか確認
3. JSON形式が正しいか確認（コメントを削除）

### バリデーションエラー

1. `config.ci.example.json` を参考に設定項目を確認
2. JSONスキーマ（`config.schema.json`）が存在する場合は参照

## 参考資料

- [Phase 3-4計画](../docs/new-generator-plan/phase-3-4-ci-automation.md)
- [互換レイヤーガイド](../docs/new-generator-plan/guides/compat-layer.md)
- [CI実行例](../docs/new-generator-plan/examples/ci.md)
