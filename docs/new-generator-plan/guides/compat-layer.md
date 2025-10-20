# 互換レイヤーガイド

**最終更新**: 2025-10-21
**ステータス**: Phase 3-3 実装完了

---

## 📋 目次

1. [概要](#概要)
2. [サポート期間](#サポート期間)
3. [互換スクリプト一覧](#互換スクリプト一覧)
4. [使用方法](#使用方法)
5. [移行ガイド](#移行ガイド)
6. [トラブルシューティング](#トラブルシューティング)
7. [FAQ](#faq)

---

## 概要

互換レイヤーは、既存の旧スクリプト（`scripts/*.js`）から新しい `docs-cli` コマンドへの段階的移行を支援するための仕組みです。

### 目的

- 既存ユーザーの作業を中断させない
- 新CLIへのスムーズな移行を促進
- 明確な移行タイムラインと手順を提供

### 主な機能

1. **互換ラッパースクリプト** - 旧スクリプトから新CLIを呼び出す薄いラッパー
2. **非推奨警告システム** - 使用時に適切な警告を表示
3. **移行レポート生成** - 移行チェックリストと互換性レポートを自動生成
4. **設定ファイル移行** - 旧設定から新設定への自動変換

---

## サポート期間

### タイムライン

| マイルストーン | 予定日 | 説明 |
|------------|-------|------|
| Phase 3-3 完了 | 2025-10-21 | 互換レイヤー実装完了 |
| Phase 4 完了 | 2025-11-30 | QA・リリース準備完了 |
| Phase 5 完了 | 2025-12-31 | リリース後の継続改善完了 |
| **サポート終了** | **2026-03-31** | 互換レイヤーのサポート終了 |

**注**: 日付は暫定的なものであり、プロジェクトの進行状況により変更される可能性があります。

### サポート終了までの流れ

1. **Phase 3-3 完了時点**
   - 互換レイヤーの提供開始
   - 非推奨警告の表示開始

2. **Phase 4 完了時点**
   - 新CLIの正式リリース
   - ドキュメントの完成

3. **Phase 5 完了時点**
   - フィードバック対応完了
   - 安定版としての運用開始

4. **サポート終了（Phase 5 完了後3ヶ月）**
   - 互換レイヤーの削除
   - 旧スクリプトの削除

---

## 互換スクリプト一覧

### 1. create-project.js

**場所**: `scripts/compat/create-project.js`

**旧スクリプト**:
```bash
node scripts/create-project.js <project-name> <display-name-en> <display-name-ja>
```

**新CLI**:
```bash
docs-cli add project <project-id> \
  --display-name-en "<name>" \
  --display-name-ja "<name>"
```

**互換ラッパー経由**:
```bash
node scripts/compat/create-project.js my-docs "My Documentation" "私のドキュメント"
```

**未サポートのオプション**:
- `--icon` - アイコン設定（警告表示のみ）
- `--tags` - タグ設定（警告表示のみ）
- `--skip-test` - テストスキップ（警告表示のみ）

---

### 2. add-language.js

**場所**: `scripts/compat/add-language.js`

**旧スクリプト**:
```bash
node scripts/add-language.js <project-name> <lang-code> [display-name] [description]
```

**新CLI**:
```bash
docs-cli add language <project-id> <lang-code> \
  --display-name "<name>"
```

**互換ラッパー経由**:
```bash
node scripts/compat/add-language.js sample-docs ko
```

**未サポートのオプション**:
- `<description>` - 説明文（警告表示のみ）
- `--auto-template` - 自動テンプレート生成（警告表示のみ）
- `--skip-test` - テストスキップ（警告表示のみ）
- `--skip-top-page` - トップページ更新スキップ（警告表示のみ）
- `--interactive` - 対話モード（警告表示のみ）

---

### 3. create-version.js

**場所**: `scripts/compat/create-version.js`

**旧スクリプト**:
```bash
node scripts/create-version.js <project-name> <version>
```

**新CLI**:
```bash
docs-cli add version <project-id> <version-id>
```

**互換ラッパー経由**:
```bash
node scripts/compat/create-version.js sample-docs v3
```

**未サポートのオプション**:
- `--interactive` - 対話モード（警告表示のみ）

---

### 4. create-document.js

**場所**: `scripts/compat/create-document.js`

**⚠️  重要**: 引数の順序が変更されています

**旧スクリプト**:
```bash
node scripts/create-document.js <project-name> <lang> <version> <category> <title>
```

**新CLI**:
```bash
docs-cli add document <project-id> <version> <lang> <category> <title>
```

**引数順序の違い**:
```
旧: <project> <lang> <version> <category> <title>
新: <project> <version> <lang> <category> <title>
     ^^^^^^^^  ^^^^^^^^^^^^^^^^  ← 順序が入れ替わった
```

**互換ラッパー経由**:
```bash
node scripts/compat/create-document.js sample-docs en v2 guide "Getting Started"
```

**未サポートのオプション**:
- `--interactive` - 対話モード（警告表示のみ）

---

## 使用方法

### 基本的な使用方法

互換ラッパースクリプトは、既存の旧スクリプトと同じように使用できます:

```bash
# プロジェクト作成
node scripts/compat/create-project.js my-docs "My Documentation" "私のドキュメント"

# 言語追加
node scripts/compat/add-language.js my-docs ko

# バージョン作成
node scripts/compat/create-version.js my-docs v2

# ドキュメント作成
node scripts/compat/create-document.js my-docs en v1 guide "Getting Started"
```

### 非推奨警告の抑制

警告を非表示にする場合は、`--suppress-warning` オプションを使用します:

```bash
node scripts/compat/create-project.js my-docs "My Docs" "私のドキュメント" --suppress-warning
```

**注**: 警告を抑制すると、新CLIへの移行タイムラインが表示されなくなります。通常は警告を表示することを推奨します。

### CI/CD での使用

CI/CD パイプラインで使用する場合は、警告を抑制すると良いでしょう:

```yaml
# .github/workflows/build.yml
steps:
  - name: プロジェクト作成
    run: node scripts/compat/create-project.js my-docs "My Docs" "私のドキュメント" --suppress-warning
```

---

## 移行ガイド

### ステップ1: 互換性チェック

まず、互換性チェックを実行して現在の状況を確認します:

```bash
docs-cli compat check
```

このコマンドは以下をチェックします:
- 既存スクリプトの使用状況
- 互換レイヤーのインストール状況
- 移行が必要な箇所

### ステップ2: 移行レポート生成

次に、移行レポートを生成します:

```bash
docs-cli compat report
```

このコマンドは以下を生成します:
- **移行チェックリスト** (`reports/migration/migration-checklist.md`)
- **互換性レポート** (`reports/migration/compatibility-report.html`)

### ステップ3: 設定ファイル移行

設定ファイルを新形式に移行します:

```bash
docs-cli compat migrate-config
```

このコマンドは以下を実行します:
- 旧設定（`.env`, `project.config.json`）の検出
- 新設定（`.docs-cli/config.json`）への変換
- バックアップの作成

### ステップ4: スクリプトの置き換え

移行チェックリストに従って、スクリプトを段階的に置き換えます。

#### package.json の更新例

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

### ステップ5: テストと検証

新CLIコマンドの動作を確認します:

```bash
# ビルドテスト
pnpm build

# E2Eテスト
pnpm test:e2e

# バリデーション
docs-cli validate
```

### ステップ6: ドキュメント更新

以下のドキュメントを更新します:
- `README.md`
- `CONTRIBUTING.md`
- チーム内ドキュメント
- CI/CD ドキュメント

---

## トラブルシューティング

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

### Q: 未サポートのオプションがある

**A**: 新CLIでは一部のオプションがまだサポートされていません。

**対応方法**:
1. 警告メッセージを確認
2. 代替方法を検討
3. Issue を作成して機能リクエスト

### Q: 引数の順序が違う

**A**: `create-document` コマンドでは引数の順序が変更されています。

**旧**: `<project> <lang> <version> <category> <title>`
**新**: `<project> <version> <lang> <category> <title>`

互換ラッパー経由で使用する場合は、旧形式のままで問題ありません。

### Q: CI/CD が失敗する

**A**: 以下を確認してください:

1. 非推奨警告を抑制しているか
   ```bash
   --suppress-warning
   ```

2. `docs-cli` がインストールされているか
   ```yaml
   - run: pnpm install
   ```

3. 実行権限があるか
   ```yaml
   - run: chmod +x scripts/compat/*.js
   ```

---

## FAQ

### Q: いつまで互換レイヤーを使用できますか?

**A**: 互換レイヤーのサポート終了は **2026-03-31** を予定しています（Phase 5 完了後3ヶ月）。

それまでに新CLIへの移行を完了してください。

### Q: 新CLIと互換ラッパーの違いは何ですか?

**A**: 互換ラッパーは内部で新CLIを呼び出しています。

**互換ラッパー**:
- 旧スクリプトと同じインターフェース
- 非推奨警告を表示
- 一部のオプションは警告のみ

**新CLI**:
- モダンなコマンドライン体験
- すべての機能をサポート
- 長期的なサポート

### Q: 移行は必須ですか?

**A**: はい、2026-03-31 までに移行を完了する必要があります。

サポート終了後は、互換レイヤーが削除され、旧スクリプトは動作しなくなります。

### Q: 移行支援はありますか?

**A**: はい、以下のツールとドキュメントを提供しています:

1. **互換性チェック**: `docs-cli compat check`
2. **移行レポート**: `docs-cli compat report`
3. **設定移行**: `docs-cli compat migrate-config`
4. **ドキュメント**: `docs/new-generator-plan/guides/`

### Q: バグを見つけた場合はどうすれば良いですか?

**A**: GitHub の Issue として報告してください:

1. Issue を作成
2. 再現手順を記載
3. エラーメッセージを添付
4. 環境情報を記載（OS、Node.js バージョンなど）

---

## 関連リンク

- [新CLIドキュメント](../../packages/cli/README.md)
- [Phase 3-3 計画書](../phase-3-3-compat-layer.md)
- [意思決定ログ](../DECISIONS.md)
- [移行FAQ](./migration-faq.md)

---

**更新履歴**:
- 2025-10-21: 初版作成（Phase 3-3 実装完了）
