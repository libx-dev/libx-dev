# ドキュメントサイトへの新しいドキュメント追加ガイド

このガイドでは、既存のドキュメントプロジェクトに新しいドキュメント（MDXファイル）を追加する方法を詳しく説明します。**自動化スクリプト**による簡単な追加方法と、従来の手動による詳細な手順の両方を説明します。

## 🚀 推奨方法：自動化スクリプトを使用したドキュメント追加

**既存の自動化スクリプト `scripts/create-document.js` が利用可能です。このスクリプトを使用することで、ドキュメント追加作業を大幅に効率化できます。**

### 自動化スクリプトの特徴

- ✅ **作業時間短縮**: 手動作業を90%削減（約10分→約1分）
- ✅ **スマート管理**: 自動カテゴリ分析、ファイル番号採番
- ✅ **エラー防止**: パス検証、形式チェック、ファイル名正規化
- ✅ **インタラクティブ**: 既存構造の表示と対話型選択
- ✅ **テンプレート**: 標準的なMDXテンプレートの自動生成

### クイックスタート（推奨）

```bash
# インタラクティブモードで作成（推奨）
node scripts/create-document.js sample-docs ja v2 --interactive

# コマンドラインで直接指定
node scripts/create-document.js sample-docs en v2 guide "Getting Started"

# 日本語ドキュメントを作成
node scripts/create-document.js sample-docs ja v2 guide "はじめに"
```

**結果**: プロジェクト分析、カテゴリ選択、ファイル作成、テンプレート生成がすべて自動実行されます。

詳細は「[自動化スクリプト使用方法](#自動化スクリプト使用方法)」セクションを参照してください。

## 📋 前提条件

- 既存のドキュメントプロジェクトが正常に動作していること
- 対象のバージョンと언語が既に設定されていること
- Node.js環境（自動化スクリプト使用時）
- 基本的なMarkdown/MDXの知識

## 自動化スクリプト使用方法

### 基本的な使用方法

自動化スクリプトを使用すると、ドキュメントの作成からテンプレート生成まで、すべての作業が自動で実行されます。

```bash
# 基本構文
node scripts/create-document.js <project-name> <lang> <version> [category] [title] [options]

# 例: sample-docsの日本語版v2にガイドを追加
node scripts/create-document.js sample-docs ja v2 guide "はじめに"

# 例: test-verificationの英語版v2にリファレンスを追加
node scripts/create-document.js test-verification en v2 reference "API Overview"
```

### 利用可能なオプション

| オプション | 説明 | 使用例 |
|-----------|------|--------|
| `--interactive` | インタラクティブモードで実行（推奨） | `--interactive` |
| `--help` | ヘルプメッセージを表示 | `--help` |

### インタラクティブモード（推奨）

最も効率的で安全な方法は、インタラクティブモードを使用することです：

```bash
node scripts/create-document.js sample-docs ja v2 --interactive
```

インタラクティブモードでは以下が可能です：

1. **プロジェクト構造の表示**: 既存カテゴリとファイルの一覧
2. **カテゴリ選択**: 既存カテゴリから選択または新規作成
3. **スマート採番**: カテゴリとファイルの自動番号付け
4. **カスタム入力**: タイトルと説明の詳細設定
5. **プレビュー確認**: 作成予定ファイルの確認

### 使用例とシナリオ

#### シナリオ1: 既存カテゴリに新しいドキュメントを追加

```bash
# インタラクティブモードで既存の "guide" カテゴリに追加
node scripts/create-document.js sample-docs en v2 --interactive

# 表示される選択画面例:
# 1. 既存のカテゴリを使用
# 2. 新しいカテゴリを作成
# → "1" を選択

# 既存のカテゴリ:
# 1. guide (ガイド)
# 2. components (コンポーネント)
# → "1" を選択して guide カテゴリに追加
```

#### シナリオ2: 新しいカテゴリを作成してドキュメントを追加

```bash
# 新しい "troubleshooting" カテゴリを作成
node scripts/create-document.js api-docs ja v2 --interactive

# カテゴリ選択で "2. 新しいカテゴリを作成" を選択
# → "troubleshooting" と入力
# → "03-troubleshooting" ディレクトリが自動作成される
```

#### シナリオ3: コマンドラインで直接作成

```bash
# 既存のreferenceカテゴリにAPIドキュメントを追加
node scripts/create-document.js sample-docs en v2 reference "Configuration API"

# 新しいtutorialカテゴリを作成してチュートリアルを追加
node scripts/create-document.js sample-docs ja v2 tutorial "初級チュートリアル"
```

### 自動実行される処理

自動化スクリプトが実行する処理：

1. **プロジェクト分析**
   - プロジェクトの存在確認
   - 設定ファイル読み込み
   - 既存ディレクトリ構造の解析

2. **バリデーション**
   - 言語・バージョンの妥当性確認
   - ファイル名の形式チェック
   - パス構造の検証

3. **カテゴリ管理**
   - 既存カテゴリの番号分析
   - 新規カテゴリの番号自動採番
   - ディレクトリの自動作成

4. **ファイル処理**
   - ファイル名の正規化（日本語対応）
   - MDXテンプレートの自動生成
   - 適切な場所への配置

### 自動化 vs 手動の比較

| 項目 | 自動化スクリプト | 手動作業 |
|------|-----------------|----------|
| **作業時間** | 約1分 | 約10分 |
| **エラーリスク** | ほぼゼロ | 高い |
| **番号管理** | 完全自動 | 手動計算必要 |
| **ファイル名正規化** | 自動対応 | 手動変換 |
| **テンプレート生成** | 標準テンプレート | 手動作成 |
| **構造把握** | 自動表示 | 手動確認 |

### トラブルシューティング

#### よくある問題と解決方法

#### 問題1: プロジェクトまたはバージョンが見つからない

```bash
# エラーメッセージ例
❌ プロジェクト "non-existent" が見つかりません
❌ バージョン "v3" のディレクトリが存在しません

# 解決方法: 既存プロジェクトとバージョンを確認
ls apps/                           # プロジェクト一覧
ls apps/sample-docs/src/content/docs/  # バージョン一覧
```

#### 問題2: 言語形式エラー

```bash
# ❌ 間違った形式
node scripts/create-document.js sample-docs japanese v2

# ✅ 正しい形式
node scripts/create-document.js sample-docs ja v2
```

#### 問題3: ファイル名の文字化けや不正な文字

```bash
# ファイル名の正規化機能で自動解決されますが、
# 極端に長いタイトルは避けてください

# ✅ 適切な長さ
"Getting Started Guide"  → "01-getting-started-guide.mdx"

# ⚠️ 長すぎる例（自動で短縮されます）
"This is an extremely long title that might cause issues"
```

## 📝 手動でのドキュメント追加（高度な使用者向け）

自動化スクリプトが使用できない場合や、詳細なカスタマイズが必要な場合の手動手順です。

### 1. ディレクトリ構造の理解

ドキュメントファイルは以下の構造で配置されます：

```text
apps/[project-name]/src/content/docs/
└── [version]/          # バージョン (v1, v2, v2.1)
    └── [lang]/         # 言語 (en, ja, ko, etc.)
        └── [category]/ # カテゴリディレクトリ
            └── [file]  # MDXファイル
```

#### 実際の例

```text
apps/sample-docs/src/content/docs/
├── v2/
│   ├── en/
│   │   ├── 01-guide/
│   │   │   ├── 01-getting-started.mdx
│   │   │   ├── 02-creating-documents.mdx
│   │   │   └── 03-editing-documents.mdx
│   │   ├── 02-components/
│   │   │   ├── 01-overview.mdx
│   │   │   └── 02-icons.mdx
│   │   └── 03-advanced/
│   │       └── 01-customization.mdx
│   └── ja/
│       ├── 01-guide/
│       │   ├── 01-getting-started.mdx
│       │   └── 02-creating-documents.mdx
│       └── 02-components/
│           └── 01-overview.mdx
```

### 2. カテゴリとファイルの命名規則

#### カテゴリディレクトリの命名

- **形式**: `[番号]-[名前]` (例: `01-guide`, `02-components`)
- **番号**: 2桁のゼロパディング（01, 02, 03...）
- **名前**: 英数字とハイフンのみ（小文字推奨）

#### MDXファイルの命名

- **形式**: `[番号]-[名前].mdx` (例: `01-getting-started.mdx`)
- **番号**: 2桁のゼロパディング（01, 02, 03...）
- **名前**: URL-friendly形式（英数字とハイフン）

### 3. 手動でのディレクトリとファイル作成

#### ステップ1: カテゴリディレクトリの作成

```bash
# プロジェクトディレクトリに移動
cd apps/sample-docs/src/content/docs/v2/ja/

# 既存カテゴリの番号を確認
ls -la  # 01-guide, 02-components が存在する場合

# 新しいカテゴリを作成（03番を使用）
mkdir 03-troubleshooting
```

#### ステップ2: MDXファイルの作成

```bash
# 新しいドキュメントファイルを作成
cd 03-troubleshooting
touch 01-common-issues.mdx
```

#### ステップ3: MDXファイルの編集

作成したファイルに以下の内容を記述：

```mdx
---
title: "よくある問題"
description: "ドキュメント作成時によく発生する問題と解決方法"
---

# よくある問題

ドキュメント作成時によく発生する問題と、その解決方法について説明します。

## 概要

このドキュメントでは以下について説明します：

- よくあるエラーとその原因
- 効果的なトラブルシューティング手順
- 予防策とベストプラクティス

## 一般的な問題

### ビルドエラー

ビルド時にエラーが発生する場合の対処法：

1. **フロントマターの確認**
   - `title`と`description`が正しく設定されているか確認
   - YAML形式が正しいかチェック

2. **ファイル名の確認**
   - 特殊文字が含まれていないか確認
   - 適切な拡張子（.mdx）が使用されているか確認

### ナビゲーションの問題

ドキュメントがサイドバーに表示されない場合：

1. ディレクトリ構造の確認
2. ファイル名の番号付けの確認
3. カテゴリ設定の確認

## 解決方法

各問題の具体的な解決手順を説明します。

## 予防策

問題を事前に防ぐためのベストプラクティス：

- 適切な命名規則の遵守
- 定期的なビルドテスト
- コンテンツの段階的追加

## 次のステップ

- [ドキュメント作成ガイド](../01-guide/02-creating-documents)
- [高度なカスタマイズ](../03-advanced/01-customization)
```

### 4. MDXフロントマターの詳細設定

#### 必須フィールド

```yaml
---
title: "ドキュメントのタイトル"        # 表示タイトル（必須）
description: "ドキュメントの説明"      # SEO用説明（必須）
---
```

#### オプションフィールド

```yaml
---
title: "Advanced Configuration"
description: "Advanced settings and customization options"
sidebar_position: 3                    # サイドバーでの表示順序
sidebar_label: "Advanced Config"       # サイドバーでの表示名
tags: ["configuration", "advanced"]    # タグ分類
draft: false                          # 下書き状態（true=非表示）
---
```

### 5. カテゴリ翻訳の設定

新しいカテゴリを作成した場合、プロジェクト設定ファイルに翻訳を追加する必要があります。

#### `apps/[project-name]/src/config/project.config.json`の編集

```json
{
  "translations": {
    "en": {
      "categories": {
        "guide": "Guide",
        "components": "Components", 
        "advanced": "Advanced",
        "troubleshooting": "Troubleshooting"  // 新規追加
      }
    },
    "ja": {
      "categories": {
        "guide": "ガイド",
        "components": "コンポーネント",
        "advanced": "高度な設定",
        "troubleshooting": "トラブルシューティング"  // 新規追加
      }
    }
  }
}
```

### 手動作業のチェックリスト

完了したら、以下の項目を確認してください：

- [ ] 適切なディレクトリ構造での配置
- [ ] カテゴリディレクトリの正しい番号付け
- [ ] MDXファイルの正しい命名（番号-名前.mdx）
- [ ] フロントマター（title, description）の設定
- [ ] カテゴリ翻訳の追加（新規カテゴリの場合）
- [ ] ビルドテストの実行
- [ ] ブラウザでの表示確認
- [ ] サイドバーナビゲーションの確認

## 🎨 MDXの高度な機能

### コンポーネントの使用

MDXファイルでは、ReactコンポーネントやAstroコンポーネントを使用できます：

```mdx
---
title: "コンポーネント使用例"
description: "MDXファイルでのコンポーネント使用方法"
---

import { Tabs, TabItem } from '@docs/ui';
import { Card } from '@docs/ui';

# コンポーネント使用例

## タブコンポーネント

<Tabs>
  <TabItem label="JavaScript">
    ```js
    console.log('Hello, World!');
    ```
  </TabItem>
  <TabItem label="TypeScript">
    ```ts
    console.log('Hello, World!' as string);
    ```
  </TabItem>
</Tabs>

## カードコンポーネント

<Card title="注意点" type="warning">
  この機能は実験的な機能です。
</Card>
```

### コードブロックのハイライト

```mdx
# コードブロック例

## JavaScript

```js title="example.js" {2,4-6}
function greet(name) {
  console.log(`Hello, ${name}!`);  // ハイライト行
  
  // この範囲もハイライト
  if (name) {
    return `Welcome, ${name}`;
  }
}
```

## 実行結果付きのコード

```bash
$ npm install
added 245 packages in 3.2s
```
```

### アラートとコールアウト

```mdx
# アラート例

:::tip ヒント
効率的なドキュメント作成のコツをお教えします。
:::

:::warning 注意
この操作は元に戻すことができません。
:::

:::danger 危険
本番環境では使用しないでください。
:::

:::info 情報
追加の情報はリファレンスページを参照してください。
:::
```

## 🔧 高度な設定とカスタマイズ

### カスタムフロントマター

プロジェクト固有のフロントマターフィールドを追加できます：

```yaml
---
title: "API Reference"
description: "Complete API documentation"
# カスタムフィールド
api_version: "2.0"
last_updated: "2025-08-31"
author: "ドキュメントチーム"
category_priority: high
featured: true
related_pages: 
  - "/guide/getting-started"
  - "/advanced/configuration"
---
```

### 多言語コンテンツの管理

#### 言語固有のコンテンツ

```mdx
---
title: "Installation Guide"
description: "How to install and set up the project"
---

# Installation Guide

## Prerequisites

<!-- 英語固有の内容 -->
Before you begin, make sure you have:
- Node.js 18 or later
- npm or pnpm package manager
```

```mdx
---
title: "インストールガイド"
description: "プロジェクトのインストールと設定方法"
---

# インストールガイド

## 前提条件

<!-- 日本語固有の内容 -->
始める前に、以下が必要です：
- Node.js 18以上
- npmまたはpnpmパッケージマネージャー
```

### ファイル間リンク

適切な相対パスでリンクを作成：

```mdx
# ナビゲーションリンク

## 関連ページ

- [はじめに](./01-getting-started.md) - 同じカテゴリ内
- [コンポーネント概要](../02-components/01-overview.md) - 他カテゴリ
- [API リファレンス](../04-reference/01-api.md) - リファレンス

## 外部リンク

- [プロジェクト公式サイト](https://example.com)
- [GitHub リポジトリ](https://github.com/example/project)
```

## 📚 ベストプラクティス

### コンテンツ構成の指針

1. **構造化されたアプローチ**
   - 概要から詳細へ（トップダウン）
   - 段階的な説明（ステップバイステップ）
   - 実例とコード例の豊富な提供

2. **ユーザー視点の重視**
   - タスク指向の構成
   - よくある質問への回答
   - トラブルシューティング情報

3. **メンテナンス性の考慮**
   - 適切なファイル分割
   - 再利用可能なコンポーネント
   - 定期的な内容の見直し

### 文書品質の向上

1. **明確な表現**
   - 簡潔で分かりやすい文章
   - 専門用語の適切な説明
   - 一貫した用語の使用

2. **視覚的な工夫**
   - 適切な見出し構造
   - リストとテーブルの活用
   - コードブロックのハイライト

3. **ユーザビリティ**
   - 検索しやすいタイトル
   - 関連ページへのリンク
   - 次のアクションの明示

### 多言語ドキュメントの管理

1. **翻訳の一貫性**
   - 用語集の維持
   - 翻訳品質の確認
   - 文化的な配慮

2. **更新の同期**
   - 原文の更新通知
   - 翻訳状況の追跡
   - バージョン管理

## 🚨 よくあるトラブルと解決方法

### MDX構文エラー

#### 問題: フロントマターの形式エラー

```yaml
# ❌ 間違った形式
---
title: タイトルの引用符なし
description: 説明文の引用符なし
tags: [tag1, tag2  # 閉じ括弧なし
---

# ✅ 正しい形式
---
title: "適切なタイトル"
description: "適切な説明文"
tags: ["tag1", "tag2"]
---
```

#### 問題: MDXコンポーネントのインポートエラー

```mdx
# ❌ 間違ったインポート
import { NonExistentComponent } from '@docs/ui';

# ✅ 正しいインポート（利用可能なコンポーネントのみ）
import { Tabs, TabItem, Card } from '@docs/ui';
```

### ビルドとナビゲーションの問題

#### 問題: ドキュメントがサイドバーに表示されない

**原因と解決方法**:

1. **ファイル名の番号不備**
   ```bash
   # ❌ 番号なしまたは不正な番号
   getting-started.mdx
   1-getting-started.mdx
   
   # ✅ 正しい番号付け
   01-getting-started.mdx
   02-installation.mdx
   ```

2. **ディレクトリ構造の問題**
   ```bash
   # ❌ 不正な構造
   src/content/docs/ja/guide/  # バージョンなし
   
   # ✅ 正しい構造
   src/content/docs/v2/ja/01-guide/
   ```

#### 問題: リンク切れ

```mdx
# ❌ 絶対パスや不正なパス
[リンク](/docs/guide/getting-started)
[リンク](getting-started)

# ✅ 適切な相対パス
[リンク](./01-getting-started.md)
[リンク](../02-components/01-overview.md)
```

### パフォーマンスの問題

#### 問題: ビルド時間が長い

**解決策**:

1. **大きなファイルの分割**
   - 長いドキュメントを複数ファイルに分割
   - 適切なページ分割

2. **不要なコンポーネントインポートの削除**
   - 使用していないコンポーネントのインポート削除
   - 最適化されたインポート文の使用

## 📖 関連ドキュメント

- [新しいプロジェクト作成ガイド](./NEW_PROJECT_CREATION_GUIDE.md) - 新規プロジェクトの作成方法
- [バージョン追加ガイド](./VERSION_ADDITION_GUIDE.md) - 新しいバージョンの追加方法  
- [言語追加ガイド](./LANGUAGE_ADDITION_GUIDE.md) - 新しい言語の追加方法
- [プロジェクト設定リファレンス](../README.md#設定ファイル) - 設定ファイルの詳細

## 🔄 更新履歴

- **2025年8月**: 初回作成、自動化スクリプト対応版
- スクリプト場所: `scripts/create-document.js`
- ユーティリティ: `scripts/document-utils.js`
- 対応言語: 15言語（en, ja, zh-Hans, zh-Hant, es, pt-BR, ko, de, fr, ru, ar, id, tr, hi, vi）

---

このガイドでは、ドキュメント追加の自動化と手動の両方の方法を詳しく説明しました。**推奨は自動化スクリプトの使用**ですが、特別な要件がある場合は手動での作業も可能です。

質問や問題がある場合は、プロジェクトのIssueトラッカーまたはドキュメントメンテナーにお問い合わせください。