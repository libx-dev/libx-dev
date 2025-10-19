# リリースフローガイド

**作成日**: 2025-10-19
**対象**: Phase 2-5 タスク3（リリースフロー設計）
**ステータス**: ✅ 完成

---

## 📋 概要

このガイドでは、共有パッケージ（`@docs/ui`, `@docs/theme`, `@docs/generator`, `@docs/i18n`, `@docs/versioning`）のバージョニングとリリースプロセスについて説明します。

Changesetsを使用したセマンティックバージョニング（SemVer）を採用し、一貫性のあるリリース管理を実現します。

---

## 🎯 バージョニング戦略

### Semantic Versioning (SemVer)

バージョン番号: `MAJOR.MINOR.PATCH`

- **MAJOR**: 破壊的変更（後方互換性なし）
  - 必須フィールドの追加・削除
  - APIシグネチャの変更
  - 既存機能の削除

- **MINOR**: 新機能追加（後方互換性あり）
  - オプショナルフィールドの追加
  - 新しいAPIの追加
  - 既存機能の拡張

- **PATCH**: バグフィックス
  - バグ修正
  - ドキュメント改善
  - 内部リファクタリング

### バージョン例

```
0.1.0 → 初期リリース
0.2.0 → 新機能追加（サイドバー生成機能）
0.2.1 → バグフィックス（ルーティング生成の修正）
1.0.0 → 安定版リリース
2.0.0 → 破壊的変更（レジストリスキーマ変更）
```

---

## 🔗 リンクパッケージ設定

以下のパッケージは**リンクパッケージ**として設定されており、常に同じバージョンで更新されます：

- `@docs/ui`
- `@docs/theme`
- `@docs/generator`
- `@docs/i18n`
- `@docs/versioning`

**理由**:
- これらのパッケージは密接に連携しており、バージョンの整合性が重要
- ユーザーが特定のバージョンセットを使用することで、互換性問題を防止

### 除外パッケージ

以下のパッケージは**リリース対象外**です：

- `@docs/runtime` - 実装パッケージ（内部利用のみ）
- `@docs/cli` - CLIツール（独自のバージョニング）
- `@docs/validator` - バリデーター（独自のバージョニング）

---

## 📝 リリースプロセス

### 1. 変更内容の記録

変更を行った後、Changesetを作成します。

```bash
pnpm changeset
```

**対話式プロンプト**:

1. **パッケージ選択**: 変更したパッケージを選択（スペースキーで選択、Enterで確定）
2. **変更タイプ選択**: major/minor/patchを選択
3. **変更内容入力**: 変更内容を簡潔に記述（日本語可）

**例**:

```bash
$ pnpm changeset

🦋  Which packages would you like to include?
◉ @docs/generator
◯ @docs/ui
◯ @docs/theme

🦋  What kind of change is this for @docs/generator?
○ major
● minor
○ patch

🦋  Please enter a summary for this change:
サイドバー生成機能にネストされたカテゴリのサポートを追加

🦋  Summary: サイドバー生成機能にネストされたカテゴリのサポートを追加
```

**結果**: `.changeset/xxx.md`ファイルが生成されます。

```markdown
---
"@docs/generator": minor
"@docs/ui": minor
"@docs/theme": minor
"@docs/i18n": minor
"@docs/versioning": minor
---

サイドバー生成機能にネストされたカテゴリのサポートを追加
```

### 2. 変更のコミット

Changesetファイルをコミットします。

```bash
git add .changeset/xxx.md
git commit -m "changeset: サイドバー生成機能にネストされたカテゴリのサポートを追加"
git push
```

### 3. バージョン更新

リリース準備が整ったら、バージョンを更新します。

```bash
pnpm version-packages
```

**実行内容**:
- 各パッケージの`package.json`のバージョンを更新
- `CHANGELOG.md`を自動生成または更新
- `.changeset/`ファイルを削除

**例**:

```bash
$ pnpm version-packages

🦋  All files have been updated. Review them and commit at your leisure
```

**生成されるファイル**:

- `packages/generator/package.json` - バージョンが0.1.0 → 0.2.0に更新
- `packages/generator/CHANGELOG.md` - 変更履歴が追加
- `packages/ui/package.json` - 同じくバージョン更新
- ...（リンクパッケージすべて）

### 4. バージョン更新のコミット

```bash
git add .
git commit -m "chore: バージョン0.2.0にリリース"
git push
```

### 5. npm公開（オプション）

**⚠️ 注意**: Phase 2-5では**npm公開は実施しません**。モノレポ内配布を継続します。

将来的にnpm公開する場合の手順:

```bash
# ビルド→公開
pnpm release
```

**実行内容**:
- すべてのパッケージをビルド（`pnpm build`）
- npm公開（`changeset publish`）
- Gitタグ作成

---

## 🤖 GitHub Actions自動リリース（オプション）

将来的にGitHub Actionsで自動リリースを設定する場合の手順です。

### ワークフローファイル

`.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm --filter=@docs/generator build && pnpm --filter=@docs/theme build && pnpm --filter=@docs/i18n build

      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          publish: pnpm release
          commit: 'chore: release packages'
          title: 'chore: release packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**動作**:

1. `main`ブランチへのpushをトリガー
2. 依存関係のインストール
3. パッケージのビルド
4. Changesetsが存在する場合、リリースPRを自動作成
5. リリースPRがマージされると、npm公開とGitタグ作成

**⚠️ 現在は無効化**: Phase 2-5では設定のみ作成し、有効化はしません。

---

## 📚 使用例

### シナリオ1: バグフィックス

```bash
# 1. バグを修正
# 2. Changeset作成
pnpm changeset
# → patch を選択
# → "ルーティング生成のパス解決バグを修正"と入力

# 3. コミット
git add .
git commit -m "fix: ルーティング生成のパス解決バグを修正"
git push

# 4. リリース準備
pnpm version-packages
# → 0.2.0 → 0.2.1

# 5. コミット
git add .
git commit -m "chore: バージョン0.2.1にリリース"
git push
```

### シナリオ2: 新機能追加

```bash
# 1. 新機能を実装
# 2. Changeset作成
pnpm changeset
# → minor を選択
# → "検索機能にファセットフィルタを追加"と入力

# 3-5. 同上
# → 0.2.1 → 0.3.0
```

### シナリオ3: 破壊的変更

```bash
# 1. 破壊的変更を実装
# 2. Changeset作成
pnpm changeset
# → major を選択
# → "レジストリスキーマをv2に変更（BREAKING CHANGE）"と入力

# 3-5. 同上
# → 0.3.0 → 1.0.0
```

---

## 🔍 トラブルシューティング

### Q1: Changesetが検出されない

**症状**: `pnpm version-packages`で「No changesets found」

**原因**: `.changeset/`ディレクトリにChangesetファイルがない

**解決策**:
```bash
pnpm changeset
```

### Q2: リンクパッケージが同時に更新されない

**症状**: 一部のパッケージだけバージョンが更新される

**原因**: `.changeset/config.json`の`linked`設定が正しくない

**解決策**: `.changeset/config.json`を確認
```json
{
  "linked": [
    ["@docs/ui", "@docs/theme", "@docs/generator", "@docs/i18n", "@docs/versioning"]
  ]
}
```

### Q3: ビルドエラーでリリースが失敗する

**症状**: `pnpm release`でビルドエラー

**解決策**:
```bash
# 各パッケージを個別にビルドして確認
pnpm --filter=@docs/generator build
pnpm --filter=@docs/theme build
pnpm --filter=@docs/i18n build
```

---

## 📖 参考資料

### 公式ドキュメント

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Semantic Versioning 2.0.0](https://semver.org/lang/ja/)
- [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/)

### プロジェクト内ドキュメント

- [Phase 2-5計画書](../phase-2-5-shared-packages.md)
- [Phase 2-5引き継ぎガイド](../status/phase-2-5-handoff.md)
- [依存関係チェックレポート](../status/phase-2-5-dependencies-report.md)

---

## 📝 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2025-10-19 | リリースフローガイド初版作成 | Claude |

---

**作成者**: Claude
**作成日**: 2025-10-19
**対象フェーズ**: Phase 2-5
**タスク**: タスク3（リリースフロー設計）
