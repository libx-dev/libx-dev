# 互換レイヤースクリプト

このディレクトリには、既存の旧スクリプトから新しい `docs-cli` コマンドへの移行を支援する互換ラッパースクリプトが含まれています。

## ⚠️  重要な注意事項

**これらのスクリプトは非推奨です。** 新しい `docs-cli` コマンドへの移行を推奨します。

**サポート終了予定**: フェーズ5完了後3ヶ月

## 📁 互換スクリプト一覧

### 1. create-project.js

**旧スクリプト**: `scripts/create-project.js`

**新CLI**: `docs-cli add project`

**使用例**:
```bash
# 旧スクリプト（互換レイヤー経由）
node scripts/compat/create-project.js my-docs "My Documentation" "私のドキュメント"

# 新CLI（推奨）
docs-cli add project my-docs \
  --display-name-en "My Documentation" \
  --display-name-ja "私のドキュメント"
```

**引数マッピング**:
| 旧スクリプト | 新CLI |
|------------|-------|
| `<project-name>` | `<project-id>` |
| `<display-name-en>` | `--display-name-en <name>` |
| `<display-name-ja>` | `--display-name-ja <name>` |
| `--description-en=<text>` | `--description-en <text>` |
| `--description-ja=<text>` | `--description-ja <text>` |
| `--template=<name>` | `--template <name>` |

**未サポートのオプション**:
- `--icon` - 新CLIでは未実装（警告表示）
- `--tags` - 新CLIでは未実装（警告表示）
- `--skip-test` - 新CLIでは未実装（警告表示）

---

### 2. add-language.js

**旧スクリプト**: `scripts/add-language.js`

**新CLI**: `docs-cli add language`

**使用例**:
```bash
# 旧スクリプト（互換レイヤー経由）
node scripts/compat/add-language.js sample-docs ko

# 新CLI（推奨）
docs-cli add language sample-docs ko
```

**引数マッピング**:
| 旧スクリプト | 新CLI |
|------------|-------|
| `<project-name>` | `<project-id>` |
| `<language-code>` | `<lang-code>` |
| `<display-name>` | `--display-name <name>` |
| `--template-lang=<code>` | `--template-lang <code>` |

**未サポートのオプション**:
- `<description>` - 新CLIでは未実装（警告表示）
- `--auto-template` - 新CLIでは未実装（警告表示）
- `--skip-test` - 新CLIでは未実装（警告表示）
- `--skip-top-page` - 新CLIでは未実装（警告表示）
- `--interactive` - 新CLIでは未実装（警告表示）

---

### 3. create-version.js

**旧スクリプト**: `scripts/create-version.js`

**新CLI**: `docs-cli add version`

**使用例**:
```bash
# 旧スクリプト（互換レイヤー経由）
node scripts/compat/create-version.js sample-docs v3

# 新CLI（推奨）
docs-cli add version sample-docs v3
```

**引数マッピング**:
| 旧スクリプト | 新CLI |
|------------|-------|
| `<project-name>` | `<project-id>` |
| `<version>` | `<version-id>` |
| `--no-copy` | `--no-copy` |
| `--name <name>` | `--name <name>` |

**未サポートのオプション**:
- `--interactive` - 新CLIでは未実装（警告表示）

---

### 4. create-document.js

**旧スクリプト**: `scripts/create-document.js`

**新CLI**: `docs-cli add document`

**⚠️  重要**: 新CLIでは引数の順序が異なります

**使用例**:
```bash
# 旧スクリプト（互換レイヤー経由）
node scripts/compat/create-document.js sample-docs en v2 guide "Getting Started"

# 新CLI（推奨）
docs-cli add document sample-docs v2 en guide "Getting Started"
```

**引数マッピング**:
| 旧スクリプト | 新CLI |
|------------|-------|
| `<project-name> <lang> <version>` | `<project-id> <version> <lang>` |
| `<category>` | `<category>` |
| `<title>` | `<title>` |

**引数順序の違い**:
```
旧: <project> <lang> <version> <category> <title>
新: <project> <version> <lang> <category> <title>
     ^^^^^^^^  ^^^^^^^^^^^^^^^^  ← 順序が入れ替わった
```

**未サポートのオプション**:
- `--interactive` - 新CLIでは未実装（警告表示）

---

## 🚀 新CLIへの移行手順

### 1. 新CLIのインストール確認

```bash
docs-cli --version
```

### 2. 互換性チェックの実行

```bash
docs-cli compat check
```

このコマンドは以下をチェックします:
- 既存スクリプトの使用状況
- 新CLIとの互換性
- 移行が必要な箇所

### 3. 移行ガイドの確認

```bash
docs-cli compat report
```

このコマンドは以下を生成します:
- 移行チェックリスト
- 互換性レポート（HTML/Markdown）
- スクリプト別の移行手順

### 4. 設定ファイルの移行

```bash
docs-cli compat migrate-config
```

このコマンドは以下を実行します:
- 旧設定（`.env`, `project.config.json`）の検出
- 新設定（`.docs-cli/config.json`）への変換
- バックアップの作成

### 5. スクリプトの置き換え

既存のスクリプト呼び出しを新CLIコマンドに置き換えます。

**例**: `package.json` の scripts セクション

```json
{
  "scripts": {
    // 旧（非推奨）
    "create:project": "node scripts/create-project.js",

    // 新（推奨）
    "create:project": "docs-cli add project"
  }
}
```

---

## 📝 トラブルシューティング

### Q: 互換ラッパーが動作しない

**A**: 以下を確認してください:

1. `docs-cli` がインストールされているか
   ```bash
   docs-cli --version
   ```

2. 実行権限があるか
   ```bash
   chmod +x scripts/compat/*.js
   ```

3. Node.js のバージョンが適切か
   ```bash
   node --version  # v18.0.0 以上推奨
   ```

### Q: 非推奨警告を非表示にしたい

**A**: `--suppress-warning` オプションを使用してください:

```bash
node scripts/compat/create-project.js my-docs "My Docs" "私のドキュメント" --suppress-warning
```

### Q: 移行タイムラインを確認したい

**A**: 以下のドキュメントを参照してください:

- [互換レイヤーガイド](../../docs/new-generator-plan/guides/compat-layer.md)
- [意思決定ログ](../../docs/new-generator-plan/DECISIONS.md)

---

## 🔗 関連リンク

- [新CLIドキュメント](../../packages/cli/README.md)
- [互換レイヤーガイド](../../docs/new-generator-plan/guides/compat-layer.md)
- [移行ガイド](../../docs/new-generator-plan/guides/migration.md)
- [Phase 3-3 計画書](../../docs/new-generator-plan/phase-3-3-compat-layer.md)

---

## 📅 サポート終了スケジュール

| マイルストーン | 予定日 | 説明 |
|------------|-------|------|
| Phase 3-3 完了 | 2025-10-21 | 互換レイヤー実装完了 |
| Phase 4 完了 | 2025-11 | QA・リリース準備完了 |
| Phase 5 完了 | 2025-12 | リリース後の継続改善完了 |
| サポート終了 | 2026-03 | 互換レイヤーのサポート終了 |

**注**: 日付は暫定的なものであり、プロジェクトの進行状況により変更される可能性があります。

---

**最終更新**: 2025-10-21
**作成者**: Claude Code (AI Assistant)
