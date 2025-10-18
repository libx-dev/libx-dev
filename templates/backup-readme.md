# バックアップディレクトリ

このディレクトリには、CLI操作によるレジストリファイルの自動バックアップが保存されます。

## ローテーションポリシー

- **デフォルト保持世代数**: 5世代
- **古いバックアップの処理**: 自動削除されます
- **設定変更**: `.docs-cli/config.json` の `backupRetention` フィールドで変更可能

## ディレクトリ構造

```
.backups/
├── 20251018-123456/     # タイムスタンプ付きディレクトリ
│   ├── docs.json        # レジストリバックアップ
│   └── created.json     # 作成されたファイルリスト
├── 20251018-134512/
│   ├── docs.json
│   └── created.json
└── 20251018-145623/
    └── docs.json
```

## バックアップ命名規則

- **ディレクトリ名**: `YYYYMMDD-HHMMSS`（例: `20251018-123456`）
- **タイムゾーン**: ローカルタイムゾーン
- **ファイル名**: 元のファイル名を保持（例: `docs.json`）

## 手動復元方法

### 最新のバックアップから復元

```bash
# 1. 最新のバックアップディレクトリを確認
ls -lt .backups/ | head -2

# 2. バックアップから復元
cp .backups/最新タイムスタンプ/docs.json registry/docs.json

# 3. バリデーション
pnpm docs-cli validate
```

### 特定のバックアップから復元

```bash
# 1. バックアップ一覧を確認
ls -l .backups/

# 2. 特定のバックアップから復元
cp .backups/20251018-123456/docs.json registry/docs.json

# 3. バリデーション
pnpm docs-cli validate
```

## CLIによる自動ロールバック

CLI操作中にエラーが発生した場合、自動的にロールバックされます。

```bash
# 例: ドキュメント追加時にエラーが発生
$ pnpm docs-cli add doc sample-docs guide/new-doc --title "New Doc"
❌ エラーが発生しました: Invalid version reference
🔄 変更をロールバックしています...
✅ ロールバック完了
```

## 手動バックアップの作成

重要な変更前に手動でバックアップを作成することをお勧めします。

```bash
# タイムスタンプ付きバックアップを作成
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
mkdir -p .backups/$TIMESTAMP
cp registry/docs.json .backups/$TIMESTAMP/
echo "✅ バックアップ作成: .backups/$TIMESTAMP/docs.json"
```

## バックアップのクリーンアップ

### 古いバックアップを手動削除

```bash
# 7日以上前のバックアップを削除
find .backups -type d -mtime +7 -exec rm -rf {} \;
```

### すべてのバックアップを削除

```bash
# 注意: すべてのバックアップが削除されます
rm -rf .backups/*
```

## 注意事項

### バージョン管理

- **Git管理**: このディレクトリは `.gitignore` に含まれています
- **推奨**: 本番環境では定期的な外部バックアップを実施してください

### ディスク容量

- バックアップは累積的に増加します
- 定期的にクリーンアップを実行してください
- 大規模なレジストリの場合、保持世代数を調整してください

### セキュリティ

- バックアップには機密情報が含まれる可能性があります
- 適切なアクセス権限を設定してください
- 外部へのコピー時は注意してください

## トラブルシューティング

### バックアップが作成されない

**原因**: `.backups/` ディレクトリが存在しない、または書き込み権限がない

**解決策**:

```bash
# ディレクトリを作成
mkdir -p .backups

# 権限を確認
ls -ld .backups
```

### ロールバックが失敗する

**原因**: バックアップファイルが破損している、または存在しない

**解決策**:

```bash
# バックアップファイルを確認
cat .backups/最新タイムスタンプ/docs.json | jq .

# JSONが有効か確認
pnpm docs-cli validate --file .backups/最新タイムスタンプ/docs.json
```

### バックアップディレクトリが肥大化

**原因**: 頻繁な変更により多数のバックアップが蓄積

**解決策**:

```bash
# 保持世代数を減らす（.docs-cli/config.json）
{
  "backupRetention": 3
}

# 手動でクリーンアップ
find .backups -type d -mtime +3 -exec rm -rf {} \;
```

## 関連ドキュメント

- [CLIユーザーガイド](../docs/new-generator-plan/guides/docs-cli.md) - CLI操作とバックアップ機能
- [レジストリガイド](../docs/new-generator-plan/guides/registry.md) - レジストリ構造とバリデーション
- [CI/CD運用ガイド](../docs/new-generator-plan/guides/ci-cd.md) - 自動バックアップとリカバリー戦略

---

**最終更新**: 2025年10月18日
