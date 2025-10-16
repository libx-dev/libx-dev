# マイグレーションスクリプト設計文書

**作成日**: 2025-10-16
**ステータス**: 設計中

## 目的

既存の `apps/*/src/config/project.config.json` から新しい `registry/docs.json` 形式への自動変換を行うマイグレーションスクリプトを設計・実装する。

## 対象プロジェクト

1. `sample-docs` - サンプルドキュメント（2バージョン、2言語）
2. `test-verification` - テスト検証用プロジェクト
3. `libx-docs` - libx本体ドキュメント

## データマッピング仕様

### 1. プロジェクト基本情報

#### 旧形式 (`project.config.json`)
```json
{
  "basic": {
    "baseUrl": "/docs/sample-docs",
    "supportedLangs": ["en", "ja"],
    "defaultLang": "en"
  },
  "translations": {
    "en": {
      "displayName": "Sample Documentation",
      "displayDescription": "..."
    },
    "ja": {
      "displayName": "サンプルドキュメント",
      "displayDescription": "..."
    }
  }
}
```

#### 新形式 (`docs.json`)
```json
{
  "projects": [
    {
      "id": "sample-docs",  // baseUrlから抽出
      "displayName": {
        "en": "Sample Documentation",
        "ja": "サンプルドキュメント"
      },
      "description": {
        "en": "...",
        "ja": "..."
      }
    }
  ]
}
```

**変換ロジック**:
- `id`: `basic.baseUrl` から `/docs/` 以降を抽出
- `displayName`: `translations[lang].displayName` を集約
- `description`: `translations[lang].displayDescription` を集約

### 2. 言語設定

#### 旧形式
```json
{
  "basic": {
    "supportedLangs": ["en", "ja"],
    "defaultLang": "en"
  },
  "languageNames": {
    "en": "English",
    "ja": "日本語"
  }
}
```

#### 新形式
```json
{
  "languages": [
    {
      "code": "en",
      "displayName": "English",
      "default": true,
      "status": "active"
    },
    {
      "code": "ja",
      "displayName": "日本語",
      "fallback": "en",
      "status": "active"
    }
  ]
}
```

**変換ロジック**:
- `code`: `supportedLangs[]` から取得
- `displayName`: `languageNames[code]` から取得
- `default`: `defaultLang` と一致する言語に設定
- `fallback`: デフォルト言語以外は `defaultLang` を設定
- `status`: 全て `"active"` で初期化

### 3. バージョン設定

#### 旧形式
```json
{
  "versioning": {
    "versions": [
      {
        "id": "v1",
        "name": "Version 1.0",
        "date": "2024-01-01T00:00:00.000Z",
        "isLatest": false
      },
      {
        "id": "v2",
        "name": "Version 2.0",
        "date": "2025-01-01T00:00:00.000Z",
        "isLatest": true
      }
    ]
  }
}
```

#### 新形式
```json
{
  "versions": [
    {
      "id": "v1",
      "name": "Version 1.0",
      "isLatest": false,
      "status": "deprecated",
      "releaseDate": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "v2",
      "name": "Version 2.0",
      "isLatest": true,
      "status": "active",
      "releaseDate": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**変換ロジック**:
- `id`, `name`, `isLatest`: そのまま転記
- `releaseDate`: `date` をリネーム
- `status`: `isLatest: true` なら `"active"`、それ以外は `"deprecated"`

### 4. カテゴリ設定

#### 旧形式
```json
{
  "translations": {
    "en": {
      "categories": {
        "guide": "Guide",
        "components": "Components",
        "advanced": "Advanced",
        "reference": "Reference"
      }
    },
    "ja": {
      "categories": {
        "guide": "ガイド",
        "components": "コンポーネント",
        "advanced": "高度な設定",
        "reference": "リファレンス"
      }
    }
  }
}
```

#### 新形式
```json
{
  "categories": [
    {
      "id": "guide",
      "order": 1,
      "titles": {
        "en": "Guide",
        "ja": "ガイド"
      },
      "docs": []
    },
    {
      "id": "components",
      "order": 2,
      "titles": {
        "en": "Components",
        "ja": "コンポーネント"
      },
      "docs": []
    }
  ]
}
```

**変換ロジック**:
- カテゴリIDは `translations[defaultLang].categories` のキーから取得
- `titles`: 全言語の翻訳を集約
- `order`: 定義順に自動採番（1から開始）
- `docs`: 初期状態では空配列（後でドキュメントスキャンで追加）

### 5. ライセンス情報

#### 旧形式
```json
{
  "licensing": {
    "sources": [
      {
        "id": "sample-original",
        "name": "Sample Documentation",
        "author": "libx-dev Team",
        "license": "MIT",
        "licenseUrl": "https://opensource.org/licenses/MIT",
        "sourceUrl": "https://github.com/libx-dev/libx-docs"
      }
    ],
    "defaultSource": "sample-original",
    "showAttribution": true,
    "sourceLanguage": "en"
  }
}
```

#### 新形式
```json
{
  "licenses": [
    {
      "id": "sample-original",
      "name": "MIT",
      "url": "https://opensource.org/licenses/MIT",
      "attribution": {
        "title": "Sample Documentation",
        "author": "libx-dev Team",
        "url": "https://github.com/libx-dev/libx-docs"
      },
      "sourceLanguage": "en"
    }
  ]
}
```

**変換ロジック**:
- `id`: `sources[].id` をそのまま使用
- `name`: `sources[].license` を使用
- `url`: `sources[].licenseUrl` を使用
- `attribution.title`: `sources[].name` を使用
- `attribution.author`: `sources[].author` を使用
- `attribution.url`: `sources[].sourceUrl` を使用
- `sourceLanguage`: `licensing.sourceLanguage` を使用

## ドキュメントコンテンツのスキャン

マイグレーションスクリプトは、`apps/{project}/src/content/docs/` 配下のMDXファイルをスキャンして、ドキュメントエントリを自動生成します。

### ディレクトリ構造の想定

```
apps/sample-docs/src/content/docs/
├── v1/
│   ├── en/
│   │   ├── 01-guide/
│   │   │   └── 01-getting-started.mdx
│   │   └── 02-reference/
│   │       └── 01-api.mdx
│   └── ja/
│       └── 01-guide/
│           └── 01-getting-started.mdx
└── v2/
    └── en/
        └── 01-guide/
            └── 01-getting-started.mdx
```

### ドキュメントエントリ生成ロジック

1. **ドキュメントID抽出**:
   - ファイルパス: `v1/en/01-guide/01-getting-started.mdx`
   - カテゴリ: `01-guide` → `guide`
   - ドキュメントID: `01-getting-started` → `getting-started`

2. **バージョンとスラッグの決定**:
   - バージョン: ディレクトリ名から `v1`
   - スラッグ: `guide/getting-started` （カテゴリ/ドキュメントID）

3. **MDXフロントマターの読み取り**:
```mdx
---
title: Getting Started
description: Learn how to get started
keywords: [intro, setup]
tags: [guide]
---
```

4. **ドキュメントエントリの生成**:
```json
{
  "id": "getting-started",
  "slug": "guide/getting-started",
  "title": {
    "en": "Getting Started",
    "ja": "はじめに"
  },
  "summary": {
    "en": "Learn how to get started",
    "ja": "はじめ方を学ぶ"
  },
  "versions": ["v1", "v2"],
  "status": "published",
  "visibility": "public",
  "keywords": ["intro", "setup"],
  "tags": ["guide"],
  "content": {
    "en": {
      "path": "content/getting-started/en.mdx",
      "status": "published",
      "lastUpdated": "2024-05-01T00:00:00Z"
    },
    "ja": {
      "path": "content/getting-started/ja.mdx",
      "status": "published"
    }
  }
}
```

## スクリプト実装仕様

### ファイル名
`scripts/migrate-to-registry.js`

### CLIオプション

```bash
node scripts/migrate-to-registry.js [options]

オプション:
  --project=<name>   特定プロジェクトのみ移行（デフォルト: 全プロジェクト）
  --dry-run          実際の変換を行わず、プレビューのみ表示
  --validate         変換後にバリデーションを実行
  --output=<path>    出力先（デフォルト: registry/docs.json）
  --force            既存ファイルを上書き
  --help, -h         ヘルプ表示
```

### 実行フロー

1. **プロジェクト検出**
   - `apps/*/src/config/project.config.json` をスキャン
   - `--project` オプションでフィルタリング

2. **設定ファイル読み込み**
   - 各プロジェクトの `project.config.json` を読み込み
   - パース エラー時は警告を表示してスキップ

3. **データ変換**
   - 基本情報、言語、バージョン、カテゴリ、ライセンスをマッピング
   - エラー時は詳細なエラーメッセージを表示

4. **コンテンツスキャン**
   - `src/content/docs/` 配下のMDXファイルをスキャン
   - フロントマター解析（gray-matter 使用）
   - ドキュメントエントリを自動生成

5. **レジストリ生成**
   - `docs.json` 形式に統合
   - `$schemaVersion: "1.0.0"` を追加
   - `metadata` セクションに生成情報を追記

6. **バリデーション（--validate時）**
   - `validateRegistry()` を実行
   - エラーがあれば詳細を表示して終了

7. **出力**
   - `--dry-run` 時: JSON を標準出力に表示
   - 通常時: ファイルに書き込み
   - `--force` なしで既存ファイルがある場合は確認プロンプト

### エラーハンドリング

- **必須フィールド欠落**: 警告を表示し、デフォルト値で補完
- **ファイル読み込みエラー**: エラーメッセージを表示してスキップ
- **バリデーションエラー**: エラー詳細を表示して終了コード1で終了

### ログ出力

```
[INFO] プロジェクト検出: 3件
[INFO] sample-docs をマイグレーション中...
  ├─ 基本情報を変換
  ├─ 言語設定を変換 (2言語)
  ├─ バージョン設定を変換 (2バージョン)
  ├─ カテゴリを変換 (4カテゴリ)
  ├─ ライセンス情報を変換 (1件)
  └─ ドキュメントをスキャン (12ドキュメント)
[INFO] test-verification をマイグレーション中...
  └─ ...
[SUCCESS] マイグレーション完了
[INFO] 出力先: registry/docs.json
```

## テスト計画

### ユニットテスト（将来実装）

- データマッピング関数のテスト
- フロントマター解析のテスト
- エラーハンドリングのテスト

### 統合テスト

1. **dry-run モードテスト**
   ```bash
   node scripts/migrate-to-registry.js --dry-run
   ```
   - 出力が正しいJSON形式か確認
   - エラーが発生しないか確認

2. **特定プロジェクトのマイグレーション**
   ```bash
   node scripts/migrate-to-registry.js --project=sample-docs --output=registry/test-output.json
   ```
   - 生成されたJSONをバリデーション
   - スキーマに準拠しているか確認

3. **バリデーション付きマイグレーション**
   ```bash
   node scripts/migrate-to-registry.js --validate --output=registry/test-output.json
   ```
   - バリデーションが成功するか確認
   - エラーメッセージが適切か確認

## 次のステップ

1. ✅ 設計文書の作成（このファイル）
2. ⏳ スクリプトの実装
3. ⏳ dry-runモードでのテスト実行
4. ⏳ 実際のプロジェクトへの適用
5. ⏳ 生成されたレジストリのバリデーション
6. ⏳ Phase 1-2完了報告書への記録

---

**備考**:
- フロントマターに記載されていない情報（summary, keywords, tagsなど）は、デフォルト値または空で初期化
- ドキュメントのステータスは全て `"published"` で初期化（手動レビュー前提）
- 将来的なマイグレーションバージョン（v2など）も考慮した拡張可能な設計を目指す
