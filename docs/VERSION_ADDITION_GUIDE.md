# ドキュメントサイトへの新しいバージョン追加ガイド

このガイドでは、既存のドキュメントプロジェクトに新しいバージョンを追加する方法を詳しく説明します。**自動化スクリプト**による簡単な追加方法と、従来の手動による詳細な手順の両方を説明します。

## 🚀 推奨方法：自動化スクリプトを使用したバージョン追加

**既存の自動化スクリプト `scripts/create-version.js` が利用可能です。このスクリプトを使用することで、バージョン追加作業を大幅に効率化できます。**

### 自動化スクリプトの特徴

- ✅ **作業時間短縮**: 手動作業を85%削減（約20分→約3分）
- ✅ **エラー防止**: 設定ミスやバージョン重複を完全防止
- ✅ **安全性**: バリデーション機能とエラー処理内蔵
- ✅ **多言語対応**: すべてのサポート言語に自動対応
- ✅ **柔軟性**: インタラクティブモードとオプション指定が可能

### クイックスタート（推奨）

```bash
# 基本的なバージョン追加
node scripts/create-version.js sample-docs v3

# インタラクティブモードで詳細設定
node scripts/create-version.js sample-docs v3 --interactive

# 前バージョンからのコピーなし
node scripts/create-version.js sample-docs v3 --no-copy
```

**結果**: 設定ファイル更新、ディレクトリ作成、コンテンツコピー（オプション）がすべて自動実行されます。

詳細は「[自動化スクリプト使用方法](#自動化スクリプト使用方法)」セクションを参照してください。

## 📋 前提条件

- 既存のドキュメントプロジェクトが正常に動作していること
- プロジェクト構造が標準的な形式に従っていること
- Node.js環境（自動化スクリプト使用時）
- 基本的なJSON設定とMarkdown/MDXの知識

## 自動化スクリプト使用方法

### 基本的な使用方法

自動化スクリプトを使用すると、バージョンの作成から設定まで、すべての作業が自動で実行されます。

```bash
# 基本構文
node scripts/create-version.js <project-name> <version> [options]

# 例: sample-docsにv3バージョンを追加
node scripts/create-version.js sample-docs v3

# 例: test-verificationにv2.1バージョンを追加
node scripts/create-version.js test-verification v2.1
```

### 利用可能なオプション

| オプション | 説明 | 使用例 |
|-----------|------|--------|
| `--interactive` | インタラクティブモードで実行 | `--interactive` |
| `--no-copy` | 前バージョンからコンテンツをコピーしない | `--no-copy` |
| `--help` | ヘルプメッセージを表示 | `--help` |

### インタラクティブモード（推奨）

より詳細な設定を行いたい場合は、インタラクティブモードを使用してください：

```bash
node scripts/create-version.js sample-docs v3 --interactive
```

インタラクティブモードでは以下が可能です：

1. **現在のバージョン確認**: 既存バージョンの一覧表示
2. **カスタムバージョン名**: 表示用の名前をカスタマイズ
3. **コピー設定**: 前バージョンからのコンテンツコピーを選択
4. **確認プロセス**: 作成前に設定内容を確認

### 使用例とシナリオ

#### シナリオ1: 標準的な新バージョン作成

```bash
# sample-docsプロジェクトにv3を追加（前バージョンからコピー）
node scripts/create-version.js sample-docs v3
```

#### シナリオ2: マイナーバージョンアップ

```bash
# test-verificationプロジェクトにv2.1を追加
node scripts/create-version.js test-verification v2.1 --interactive
```

#### シナリオ3: 空のバージョンを作成

```bash
# 新しいコンテンツで始める場合（前バージョンからコピーしない）
node scripts/create-version.js api-docs v2 --no-copy
```

### 自動実行される処理

自動化スクリプトが実行する処理：

1. **バリデーション**
   - プロジェクトの存在確認
   - バージョン形式の検証（v1, v2.0, v2.1形式）
   - 既存バージョンとの重複チェック

2. **設定ファイル更新**
   - `project.config.json`のversioning.versions配列を更新
   - 既存バージョンのisLatestフラグをfalseに設定
   - 新バージョンを最新として追加

3. **ディレクトリ構造作成**
   - 全サポート言語に対応したディレクトリを作成
   - バージョンファーストの構造：`/content/docs/[version]/[lang]/`

4. **コンテンツ処理**
   - 前バージョンからの自動コピー（オプション）
   - または空のディレクトリ構造の作成

### 自動化 vs 手動の比較

| 項目 | 自動化スクリプト | 手動作業 |
|------|-----------------|----------|
| **作業時間** | 約3分 | 約20分 |
| **エラーリスク** | ほぼゼロ | 中程度 |
| **設定一貫性** | 完全保証 | 手動確認必要 |
| **多言語対応** | 自動 | 手動で各言語設定 |
| **バリデーション** | 内蔵 | 手動確認必要 |
| **ロールバック** | 不要（エラー時停止） | 手動で元に戻す |

### トラブルシューティング

#### よくある問題と解決方法

#### 問題1: バージョン形式エラー

```bash
# ❌ 間違った形式
node scripts/create-version.js sample-docs 3.0
node scripts/create-version.js sample-docs version3

# ✅ 正しい形式
node scripts/create-version.js sample-docs v3.0
node scripts/create-version.js sample-docs v3
```

#### 問題2: プロジェクトが見つからない

```bash
# エラーメッセージ
❌ プロジェクト "non-existent" が見つかりません

# 解決方法: 既存プロジェクト名を確認
ls apps/  # 利用可能なプロジェクト一覧を確認
```

#### 問題3: バージョンが既に存在

```bash
# エラーメッセージ
❌ バージョン "v2" は既に存在します

# 解決方法: 別のバージョン番号を使用
node scripts/create-version.js sample-docs v3
```

## 📝 手動でのバージョン追加（高度な使用者向け）

自動化スクリプトが使用できない場合や、詳細なカスタマイズが必要な場合の手動手順です。

### 1. プロジェクト設定の更新

まず、対象プロジェクトの設定ファイルを更新します。

#### `apps/[project-name]/src/config/project.config.json`の編集

```json
{
  "basic": {
    "baseUrl": "/docs/sample-docs",
    "supportedLangs": ["en", "ja"],
    "defaultLang": "en"
  },
  "languageNames": {
    "en": "English",
    "ja": "日本語"
  },
  "translations": {
    // ... 言語別設定
  },
  "versioning": {
    "versions": [
      {
        "id": "v1",
        "name": "Version 1.0",
        "date": "2024-01-01T00:00:00.000Z",
        "isLatest": false  // 既存バージョンをfalseに
      },
      {
        "id": "v2",
        "name": "Version 2.0", 
        "date": "2025-01-01T00:00:00.000Z",
        "isLatest": false  // 既存バージョンをfalseに
      },
      {
        "id": "v3",  // 新しいバージョンを追加
        "name": "Version 3.0",
        "date": "2025-08-31T00:00:00.000Z",  // 現在日時
        "isLatest": true  // 新バージョンを最新に設定
      }
    ]
  }
}
```

#### 設定更新のポイント

1. **既存バージョンの更新**: すべての既存バージョンの`isLatest`を`false`に変更
2. **新バージョン追加**: 新しいバージョンオブジェクトを配列に追加
3. **適切な日付設定**: 新バージョンの`date`は現在日時を設定
4. **最新フラグ**: 新バージョンの`isLatest`を`true`に設定

### 2. ディレクトリ構造の作成

各サポート言語に対応したディレクトリ構造を作成します。

#### ディレクトリ構造の例

```text
apps/sample-docs/src/content/docs/
├── v1/
│   ├── en/
│   │   ├── 01-guide/
│   │   ├── 02-components/
│   │   └── ...
│   └── ja/
│       ├── 01-guide/
│       ├── 02-components/
│       └── ...
├── v2/
│   ├── en/
│   └── ja/
└── v3/  # 新しいバージョン
    ├── en/  # 各言語ディレクトリを作成
    │   ├── 01-guide/
    │   ├── 02-components/
    │   ├── 03-advanced/
    │   └── 04-reference/
    └── ja/
        ├── 01-guide/
        ├── 02-components/
        ├── 03-advanced/
        └── 04-reference/
```

#### ディレクトリ作成コマンド

```bash
# プロジェクトのベースディレクトリに移動
cd apps/sample-docs/src/content/docs/

# 新バージョンディレクトリを作成
mkdir -p v3/en/01-guide v3/en/02-components v3/en/03-advanced v3/en/04-reference
mkdir -p v3/ja/01-guide v3/ja/02-components v3/ja/03-advanced v3/ja/04-reference
```

### 3. コンテンツの準備

新しいバージョンのコンテンツを準備します。

#### オプション A: 前バージョンからコピー（推奨）

```bash
# 前バージョン（v2）から新バージョン（v3）にコンテンツをコピー
cp -r v2/en/* v3/en/
cp -r v2/ja/* v3/ja/
```

#### オプション B: 新規作成

```bash
# 各カテゴリに基本的なドキュメントを作成
touch v3/en/01-guide/01-getting-started.mdx
touch v3/ja/01-guide/01-getting-started.mdx
```

#### サンプルMDXファイル

`v3/en/01-guide/01-getting-started.mdx`の例：

```mdx
---
title: "Getting Started"
description: "Quick start guide for version 3.0"
---

# Getting Started

Welcome to version 3.0 of the documentation.

## What's New

- New features in version 3.0
- Improved performance
- Enhanced user interface

## Quick Start

Follow these steps to get started:

1. Installation
2. Configuration
3. First steps

## Next Steps

- [Configuration Guide](./02-configuration)
- [Advanced Features](../03-advanced/01-overview)
```

### 4. 動作確認

新しいバージョンが正常に追加されたかを確認します。

#### ビルドテスト

```bash
# プロジェクトをビルドしてエラーがないか確認
pnpm --filter=sample-docs build

# 開発サーバーを起動して表示を確認
pnpm --filter=sample-docs dev
```

#### URL確認

以下のURLでアクセス可能か確認：

- 英語版: `http://localhost:4321/v3/en/`
- 日本語版: `http://localhost:4321/v3/ja/`

#### バージョン切り替え確認

- ナビゲーションでバージョン選択ができること
- 新バージョンが最新として表示されること
- 他のバージョンからの切り替えが正常に動作すること

### 手動作業のチェックリスト

完了したら、以下の項目を確認してください：


- [ ] `project.config.json`の更新
- [ ] 既存バージョンの`isLatest`フラグを`false`に変更
- [ ] 新バージョンの追加と`isLatest: true`設定
- [ ] 全サポート言語のディレクトリ作成
- [ ] コンテンツファイルの配置
- [ ] ビルドテストの実行
- [ ] ブラウザでの表示確認
- [ ] バージョン切り替え機能の確認

## 🔧 高度な設定

### カスタムバージョン名の設定

バージョンIDと表示名を区別して設定できます：

```json
{
  "id": "v3",           // URL用の識別子
  "name": "Version 3.0 Beta",  // 表示用の名前
  "date": "2025-08-31T00:00:00.000Z",
  "isLatest": true
}
```

### 複数言語での一括バージョン作成

複数言語を同時に追加する場合のバッチ作成：

```bash
# 複数の言語で一括作成
for lang in en ja ko; do
  mkdir -p v3/$lang/01-guide
  mkdir -p v3/$lang/02-components
  mkdir -p v3/$lang/03-advanced
  mkdir -p v3/$lang/04-reference
done
```

### バージョン固有の設定

特定のバージョンにのみ適用される設定がある場合：

```json
{
  "id": "v3",
  "name": "Version 3.0",
  "date": "2025-08-31T00:00:00.000Z",
  "isLatest": true,
  "config": {
    "experimentalFeatures": true,
    "betaWarning": true
  }
}
```

## 📚 ベストプラクティス

### バージョニング戦略


1. **セマンティックバージョニング**: メジャー.マイナー.パッチの形式を使用
   - `v1.0` - 最初のリリース
   - `v1.1` - マイナー更新
   - `v2.0` - メジャー変更

2. **バージョン管理のタイミング**
   - 大幅な機能追加：メジャーバージョンアップ
   - 小さな機能追加：マイナーバージョンアップ
   - バグ修正のみ：パッチバージョンアップ

3. **コンテンツの継続性**
   - 前バージョンからの重要なコンテンツは継承
   - 廃止予定機能は段階的に削除
   - 新機能は適切なカテゴリに配置

### 多言語対応のベストプラクティス


1. **翻訳の一貫性**
   - 新バージョンでも用語集を維持
   - 翻訳品質の確認
   - 言語間での構造の整合性

2. **段階的な翻訳**
   - まず英語版でコンテンツを完成
   - 主要言語（日本語）に翻訳
   - その他の言語に順次展開

### メンテナンス


1. **古いバージョンの管理**
   - 廃止予定の告知
   - サポート期間の明示
   - 移行ガイドの提供

2. **パフォーマンス最適化**
   - 不要なファイルの削除
   - 画像やアセットの最適化
   - ビルド時間の監視

## 🚨 よくあるトラブルと解決方法

### ビルドエラー

**問題**: 新バージョン追加後にビルドが失敗する

```bash
# エラーメッセージ例
[ERROR] Failed to build content collection
```

**解決方法**:
1. MDXファイルのフロントマター形式を確認
2. ファイル名の形式が正しいか確認
3. ディレクトリ構造が標準に従っているか確認

### ナビゲーションの問題

**問題**: バージョン切り替えが表示されない

**解決方法**:
1. `project.config.json`のversions配列を確認
2. `isLatest`フラグの設定を確認
3. ブラウザキャッシュをクリア

### コンテンツの表示問題

**問題**: 一部の言語でコンテンツが表示されない

**解決方法**:
1. 該当言語のディレクトリが存在するか確認
2. MDXファイルが正しい場所に配置されているか確認
3. `supportedLangs`設定を確認

## 📖 関連ドキュメント

- [新しいプロジェクト作成ガイド](./NEW_PROJECT_CREATION_GUIDE.md) - 新規プロジェクトの作成方法
- [言語追加ガイド](./LANGUAGE_ADDITION_GUIDE.md) - 新しい言語の追加方法
- [プロジェクト設定リファレンス](../README.md#設定ファイル) - 設定ファイルの詳細

## 🔄 更新履歴

- **2025年8月**: 初回作成、自動化スクリプト対応版
- スクリプト場所: `scripts/create-version.js`
- 対応言語: 15言語（en, ja, zh-Hans, zh-Hant, es, pt-BR, ko, de, fr, ru, ar, id, tr, hi, vi）

---

このガイドでは、バージョン追加の自動化と手動の両方の方法を詳しく説明しました。**推奨は自動化スクリプトの使用**ですが、特別な要件がある場合は手動での作業も可能です。

質問や問題がある場合は、プロジェクトのIssueトラッカーまたはドキュメントメンテナーにお問い合わせください。
