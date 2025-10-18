# レジストリ記述ガイド

**最終更新**: 2025年10月18日
**対象バージョン**: レジストリスキーマ v1.0.0

---

## 目次

- [概要](#概要)
- [レジストリ構造](#レジストリ構造)
- [フィールドリファレンス](#フィールドリファレンス)
  - [ルート構造](#ルート構造)
  - [プロジェクト（Project）](#プロジェクトproject)
  - [ドキュメント（Document）](#ドキュメントdocument)
  - [バージョン（Version）](#バージョンversion)
  - [言語（Language）](#言語language)
  - [カテゴリ（Category）](#カテゴリcategory)
  - [グローバル設定（Settings）](#グローバル設定settings)
  - [共通定義（Common）](#共通定義common)
  - [コンテンツメタデータ（DocumentContent）](#コンテンツメタデータdocumentcontent)
  - [貢献者情報（Contributor）](#貢献者情報contributor)
  - [用語集（Glossary）](#用語集glossary)
  - [ライセンス（License）](#ライセンスlicense)
- [サンプルコード](#サンプルコード)
- [ベストプラクティス](#ベストプラクティス)
- [トラブルシューティング](#トラブルシューティング)
- [JSON Schema対応表](#json-schema対応表)

---

## 概要

### レジストリの目的と役割

レジストリ（`registry/docs.json`）は、新ドキュメントサイトジェネレーターの**単一ソース・オブ・トゥルース（Single Source of Truth）**です。

**主な役割**:

1. **データ駆動型アーキテクチャの中核**
   - プロジェクト、バージョン、言語、ドキュメント、カテゴリの全定義を一元管理
   - CLI、ビルドシステム、バリデーションツールが同じデータを参照

2. **変更管理の透明性**
   - JSON形式で人間が読める
   - Gitで差分追跡が容易
   - レビューとバージョン管理が明確

3. **自動化の基盤**
   - CLIコマンド（add/update/remove）がレジストリを操作
   - ビルド時にレジストリからサイト構造を生成
   - バリデーションでデータ整合性を保証

### データ駆動型アーキテクチャの説明

```
┌─────────────────────────────────────────────────────────┐
│                   registry/docs.json                     │
│              （単一ソース・オブ・トゥルース）                  │
└─────────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│     CLI     │    │    Build    │    │  Validator  │
│  (add/update)│    │  (Astro)    │    │  (validate) │
└─────────────┘    └─────────────┘    └─────────────┘
```

**利点**:

- **一貫性**: すべてのツールが同じデータソースを参照
- **メンテナンス性**: 定義の変更は一箇所で完結
- **拡張性**: 新しいフィールドの追加が容易
- **品質保証**: JSON Schemaとバリデーションで自動検証

---

## レジストリ構造

### 階層構造

```
registry/docs.json
├── $schemaVersion (必須)         # スキーマバージョン（SemVer）
├── metadata (任意)               # 運用メタデータ
├── projects[] (必須、最低1件)     # プロジェクトリスト
│   ├── id (必須)
│   ├── displayName{} (必須)     # 多言語表記
│   ├── description{} (必須)
│   ├── languages[] (必須、最低1件)
│   │   ├── code (必須)
│   │   ├── displayName (必須)
│   │   ├── default (任意)
│   │   ├── fallback (任意)
│   │   └── status (任意)
│   ├── versions[] (必須、最低1件)
│   │   ├── id (必須)
│   │   ├── name (必須)
│   │   ├── isLatest (任意)
│   │   └── status (任意)
│   ├── categories[] (任意)
│   │   ├── id (必須)
│   │   ├── order (必須)
│   │   ├── titles{} (必須)
│   │   ├── docs[] (任意)
│   │   └── children[] (任意)   # 再帰的
│   ├── documents[] (任意)
│   │   ├── id (必須)
│   │   ├── slug (必須)
│   │   ├── title{} (必須)
│   │   ├── versions[] (必須)
│   │   ├── content{} (必須)
│   │   │   └── [lang]
│   │   │       ├── path (必須)
│   │   │       └── status (必須)
│   │   ├── keywords[] (任意)
│   │   ├── tags[] (任意)
│   │   └── related[] (任意)
│   ├── licenses[] (任意)
│   └── glossary[] (任意)
└── settings{} (必須)
    ├── defaultLocale (必須)
    ├── defaultVersion (必須)
    ├── build{} (必須)
    └── deploy{} (必須)
```

### エンティティ間の関係

```
Project
  │
  ├─ hasMany ─> Language (1:N)
  ├─ hasMany ─> Version (1:N)
  ├─ hasMany ─> Category (1:N)
  ├─ hasMany ─> Document (1:N)
  ├─ hasMany ─> License (1:N)
  └─ hasMany ─> Glossary (1:N)

Document
  ├─ references ─> Version[] (M:N)
  ├─ references ─> Category (M:1)
  ├─ references ─> Document[] (related)
  └─ hasMany ─> DocumentContent (1:N, 言語別)

Category
  ├─ references ─> Document[] (M:N)
  └─ hasMany ─> Category[] (children, 再帰)

DocumentContent
  └─ belongsTo ─> Language (N:1)
```

---

## フィールドリファレンス

### ルート構造

**対応ファイル**: `registry/docs.schema.json`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|-----------|------|
| `$schemaVersion` | string | ✅ | - | スキーマのSemVerバージョン（例: `"1.0.0"`） |
| `metadata` | object | ❌ | `{}` | レジストリ生成日時や担当者などの運用メタデータ。キーは任意。 |
| `projects` | array | ✅ | - | 管理対象プロジェクトのリスト。最低1件必要。 |
| `settings` | object | ✅ | - | レジストリ全体に適用される設定値。 |

**バリデーションルール**:

- `$schemaVersion`: 正規表現 `^\d+\.\d+\.\d+$`（SemVer形式）
- `projects`: 最低1件必要（`minItems: 1`）
- `projects[].id`: プロジェクト間で一意

**例**:

```json
{
  "$schemaVersion": "1.0.0",
  "metadata": {
    "createdAt": "2025-10-16T05:07:47.247Z",
    "createdBy": "migrate-to-registry.js"
  },
  "projects": [ /* ... */ ],
  "settings": { /* ... */ }
}
```

---

### プロジェクト（Project）

**対応ファイル**: `registry/schema/project.schema.json`

#### 基本フィールド

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|-----------|------|
| `id` | string | ✅ | - | プロジェクト識別子（例: `"sample-docs"`） |
| `displayName` | object | ✅ | - | プロジェクト名の多言語表記 |
| `description` | object | ✅ | - | プロジェクト概要の多言語説明 |
| `icon` | string | ❌ | - | @docs/ui で提供されるアイコン名 |
| `tags` | array | ❌ | `[]` | トップページ表示やフィルター用タグ（最大20件） |
| `visibility` | string | ❌ | `"public"` | 公開範囲（`public`/`internal`/`draft`） |
| `routes` | object | ❌ | `{}` | カスタムルーティング設定 |
| `options` | object | ❌ | `{}` | ビルドやUIのオプション（将来の拡張用） |

#### 子エンティティ

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `languages` | array | ✅ | プロジェクトで利用する言語設定（最低1件） |
| `versions` | array | ✅ | 管理するバージョン一覧（最低1件） |
| `categories` | array | ❌ | カテゴリツリーのルートノード |
| `documents` | array | ❌ | ドキュメント定義 |
| `licenses` | array | ❌ | ライセンス情報リスト |
| `glossary` | array | ❌ | 用語集エントリリスト |

**バリデーションルール**:

- `id`: 小文字英数字とハイフンのみ（`^[a-z0-9-]+$`）
- `displayName`, `description`: 最低1言語必要（`minProperties: 1`）
- `tags`: 最大20件、重複不可
- `languages`: 最低1件必要、デフォルト言語は最大1つ
- `versions`: 最低1件必要

**例**:

```json
{
  "id": "sample-docs",
  "displayName": {
    "en": "Sample Documentation",
    "ja": "サンプルドキュメント"
  },
  "description": {
    "en": "Sample documentation site",
    "ja": "サンプルドキュメントサイト"
  },
  "icon": "book",
  "tags": ["tutorial", "guide"],
  "visibility": "public",
  "languages": [ /* ... */ ],
  "versions": [ /* ... */ ],
  "categories": [ /* ... */ ],
  "documents": [ /* ... */ ]
}
```

---

### ドキュメント（Document）

**対応ファイル**: `registry/schema/document.schema.json`

#### 基本フィールド

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|-----------|------|
| `id` | string | ✅ | - | ドキュメントID（例: `"project-001"`） |
| `slug` | string | ✅ | - | URL用スラッグ（例: `"guide/getting-started"`） |
| `title` | object | ✅ | - | 各言語でのタイトル |
| `summary` | object | ❌ | `{}` | カード表示や検索メタ用の要約 |
| `keywords` | array | ❌ | `[]` | 検索キーワード（最大20件） |
| `tags` | array | ❌ | `[]` | 分類やフィルタ用タグ（最大20件） |
| `related` | array | ❌ | `[]` | 関連ドキュメントID（最大20件） |
| `versions` | array | ✅ | - | 対応バージョンID（最低1件） |
| `content` | object | ✅ | - | 言語別コンテンツメタ（最低1言語） |
| `visibility` | string | ❌ | `"public"` | 公開範囲（`public`/`internal`/`draft`） |
| `status` | string | ❌ | `"draft"` | ライフサイクルステータス |
| `contributors` | array | ❌ | `[]` | 貢献者情報リスト |
| `license` | string | ❌ | - | ライセンスID（`licenses[]`を参照） |

**バリデーションルール**:

- `id`: 小文字英数字とハイフンのみ（`^[a-z0-9-]+$`）
- `slug`: 小文字英数字、ハイフン、アンダースコア、スラッシュ（`^[a-z0-9-_/]+$`）
- `title`: 最低1言語必要
- `keywords`, `tags`, `related`: 最大20件、重複不可
- `versions`: 最低1件必要、重複不可
- `content`: 最低1言語必要、キーは言語コード形式

**status の値**:

- `planning`: 企画段階
- `draft`: 下書き
- `in-review`: レビュー中
- `published`: 公開済み
- `archived`: アーカイブ

**例**:

```json
{
  "id": "getting-started",
  "slug": "guide/getting-started",
  "title": {
    "en": "Getting Started",
    "ja": "はじめに"
  },
  "summary": {
    "en": "Quick start guide",
    "ja": "クイックスタートガイド"
  },
  "keywords": ["tutorial", "beginner"],
  "tags": ["guide"],
  "related": ["installation-guide"],
  "versions": ["v1", "v2"],
  "content": {
    "en": {
      "path": "content/getting-started/en.mdx",
      "status": "published"
    },
    "ja": {
      "path": "content/getting-started/ja.mdx",
      "status": "published"
    }
  },
  "visibility": "public",
  "status": "published"
}
```

---

### バージョン（Version）

**対応ファイル**: `registry/schema/version.schema.json`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|-----------|------|
| `id` | string | ✅ | - | バージョン識別子（例: `"v1"`, `"v2.1"`） |
| `name` | string | ✅ | - | 表示用名称（例: `"Version 1.0"`） |
| `date` | string | ❌ | - | バージョン公開日（ISO 8601形式） |
| `isLatest` | boolean | ❌ | `false` | 既定表示する最新バージョンか |
| `status` | string | ❌ | `"active"` | サポート状況 |
| `changelog` | string | ❌ | - | 変更履歴（MarkdownパスまたはURL） |

**バリデーションルール**:

- `id`: 正規表現 `^v[0-9]+(\.[0-9]+)*$`（例: `v1`, `v2.0`, `v2.1.3`）
- `name`: 1〜40文字
- `date`: ISO 8601形式（`format: "date-time"`）
- `isLatest`: プロジェクト内で最大1つのみ
- `status`: `active`, `maintenance`, `deprecated`, `archived` のいずれか

**status の値**:

- `active`: アクティブサポート
- `maintenance`: メンテナンスモード
- `deprecated`: 非推奨
- `archived`: アーカイブ済み

**例**:

```json
{
  "id": "v2",
  "name": "Version 2.0",
  "date": "2025-01-15T00:00:00.000Z",
  "isLatest": true,
  "status": "active",
  "changelog": "https://example.com/changelog/v2"
}
```

---

### 言語（Language）

**対応ファイル**: `registry/schema/language.schema.json`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|-----------|------|
| `code` | string | ✅ | - | 言語コード（BCP 47形式、例: `"en"`, `"ja"`, `"zh-Hans"`） |
| `displayName` | string | ✅ | - | 言語の表示名（例: `"English"`, `"日本語"`） |
| `description` | string | ❌ | - | 言語に関する補足説明 |
| `default` | boolean | ❌ | `false` | プロジェクト内の既定言語か |
| `fallback` | string | ❌ | - | フォールバック言語コード |
| `status` | string | ❌ | `"active"` | 公開状態 |
| `lastUpdated` | string | ❌ | - | 設定の最終更新日時（ISO 8601形式） |
| `reviewer` | string | ❌ | - | レビュー担当者やメンテナー |

**バリデーションルール**:

- `code`: BCP 47形式（`^[a-z]{2}(-[A-Za-z0-9]+)*$`）
- `displayName`: 1〜60文字
- `default`: プロジェクト内で最大1つのみ
- `fallback`: 有効な言語コード（`languages[]`に存在すること）
- `status`: `active`, `beta`, `deprecated` のいずれか

**status の値**:

- `active`: 公開中
- `beta`: ベータ版（翻訳進行中）
- `deprecated`: 非推奨（廃止予定）

**例**:

```json
{
  "code": "ja",
  "displayName": "日本語",
  "description": "Japanese translation",
  "default": false,
  "fallback": "en",
  "status": "active",
  "lastUpdated": "2025-10-15T10:00:00.000Z",
  "reviewer": "translator-team"
}
```

---

### カテゴリ（Category）

**対応ファイル**: `registry/schema/category.schema.json`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|-----------|------|
| `id` | string | ✅ | - | カテゴリ識別子（例: `"getting-started"`） |
| `order` | integer | ✅ | - | 表示順（昇順で並べ替え、0以上） |
| `titles` | object | ✅ | - | カテゴリ名の多言語表記 |
| `description` | object | ❌ | `{}` | カテゴリ説明（多言語） |
| `docs` | array | ❌ | `[]` | カテゴリに紐づくドキュメントID（最低1件推奨） |
| `children` | array | ❌ | `[]` | サブカテゴリの配列（再帰的） |
| `icon` | string | ❌ | - | @docs/ui のアイコン識別子 |

**バリデーションルール**:

- `id`: 小文字英数字とハイフンのみ（`^[a-z0-9-]+$`）
- `order`: 0以上の整数
- `titles`: 最低1言語必要
- `docs`: 重複不可、有効なドキュメントID
- `children`: 再帰的な構造（同じスキーマを参照）

**例**:

```json
{
  "id": "guide",
  "order": 1,
  "titles": {
    "en": "Guide",
    "ja": "ガイド"
  },
  "description": {
    "en": "User guides and tutorials",
    "ja": "ユーザーガイドとチュートリアル"
  },
  "docs": ["getting-started", "installation"],
  "children": [
    {
      "id": "advanced",
      "order": 1,
      "titles": {
        "en": "Advanced Topics",
        "ja": "高度なトピック"
      },
      "docs": ["advanced-config"]
    }
  ],
  "icon": "book"
}
```

---

### グローバル設定（Settings）

**対応ファイル**: `registry/schema/settings.schema.json`

#### ルートフィールド

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `defaultLocale` | string | ✅ | デフォルト言語コード（BCP 47形式） |
| `defaultVersion` | string | ✅ | デフォルトバージョンID（例: `"v1"`） |
| `build` | object | ✅ | ビルドに関する設定 |
| `deploy` | object | ✅ | デプロイに関する設定 |
| `backup` | object | ❌ | CLIバックアップに関する設定 |
| `topPage` | object | ❌ | トップページ向けの表示制御 |
| `search` | object | ❌ | 検索設定（Algolia等の導入余地） |
| `experimental` | object | ❌ | 実験的なフラグ |

#### build 設定

| フィールド | 型 | デフォルト | 説明 |
|-----------|------|-----------|------|
| `search` | string | `"pagefind"` | 検索エンジン（`pagefind`/`none`） |
| `sitemap` | boolean | `true` | サイトマップ生成を有効にするか |
| `sidebar` | object | `{}` | サイドバー生成フラグ |
| `sidebar.autoGenerate` | boolean | `true` | サイドバー自動生成 |
| `sidebar.includeHidden` | boolean | `false` | 非表示ドキュメントを含めるか |

#### deploy 設定

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `provider` | string | ✅ | デプロイプロバイダ（`cloudflare-pages`） |
| `basePath` | string | ✅ | デプロイ時のベースパス（例: `"/docs"`） |

#### backup 設定

| フィールド | 型 | デフォルト | 説明 |
|-----------|------|-----------|------|
| `enabled` | boolean | `true` | バックアップ機能を有効にするか |
| `retentionDays` | integer | - | バックアップ保持日数 |

#### topPage 設定

| フィールド | 型 | 説明 |
|-----------|------|------|
| `featuredProjects` | array | 注目プロジェクトのIDリスト |

**例**:

```json
{
  "defaultLocale": "en",
  "defaultVersion": "v1",
  "build": {
    "search": "pagefind",
    "sitemap": true,
    "sidebar": {
      "autoGenerate": true,
      "includeHidden": false
    }
  },
  "deploy": {
    "provider": "cloudflare-pages",
    "basePath": "/docs"
  },
  "backup": {
    "enabled": true,
    "retentionDays": 30
  },
  "topPage": {
    "featuredProjects": ["sample-docs", "api-reference"]
  }
}
```

---

### 共通定義（Common）

**対応ファイル**: `registry/schema/partials/common.schema.json`

このファイルは他のスキーマから参照される共通型定義を提供します。

#### languageCode

- **型**: string
- **パターン**: `^[a-z]{2}(-[A-Za-z0-9]+)*$`
- **説明**: BCP 47形式の言語コード
- **例**: `"en"`, `"ja"`, `"zh-Hans"`, `"pt-BR"`

#### versionId

- **型**: string
- **パターン**: `^v[0-9]+(\.[0-9]+)*$`
- **説明**: バージョン識別子（`v` + 数値）
- **例**: `"v1"`, `"v2.0"`, `"v2.1.3"`

#### entityId

- **型**: string
- **パターン**: `^[a-z0-9-]+$`
- **説明**: エンティティID（小文字英数字とハイフンのみ）
- **例**: `"sample-docs"`, `"getting-started"`

#### slug

- **型**: string
- **パターン**: `^[a-z0-9-_/]+$`
- **説明**: URL用スラッグ（ベースパスを含まない）
- **例**: `"guide/getting-started"`, `"reference/api/overview"`

#### localeStringMap

- **型**: object
- **説明**: 言語コードをキーにした文言マッピング
- **制約**: 最低1言語必要（`minProperties: 1`）
- **例**:
  ```json
  {
    "en": "Getting Started",
    "ja": "はじめに",
    "zh-Hans": "入门指南"
  }
  ```

#### tagsArray

- **型**: array
- **アイテム**: string（1〜64文字）
- **制約**: 最大20件、重複不可
- **例**: `["tutorial", "beginner", "guide"]`

#### visibility

- **型**: string
- **値**: `public`, `internal`, `draft`
- **説明**: 公開範囲（ビルド時のフィルタリングに利用）

#### documentLifecycleStatus

- **型**: string
- **値**: `planning`, `draft`, `in-review`, `published`, `archived`
- **説明**: ドキュメント制作・翻訳の進捗状態

---

### コンテンツメタデータ（DocumentContent）

**対応ファイル**: `registry/schema/partials/document-content.schema.json`

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `path` | string | ✅ | コンテンツファイルの相対パス（`.md`/`.mdx`） |
| `status` | string | ✅ | コンテンツの公開状態 |
| `source` | object | ❌ | 翻訳元リポジトリやブランチ情報 |
| `syncHash` | string | ❌ | 同期検知用ハッシュ値（8〜64文字の16進数） |
| `lastUpdated` | string | ❌ | 最終更新日時（ISO 8601形式） |
| `reviewer` | string | ❌ | 翻訳やレビュー担当者 |
| `wordCount` | integer | ❌ | コンテンツの語数指標 |

**status の値**:

- `draft`: 下書き
- `in-review`: レビュー中
- `published`: 公開済み
- `missing`: ファイル欠落

**source オブジェクト**:

| フィールド | 型 | 説明 |
|-----------|------|------|
| `repository` | string | リポジトリURL |
| `branch` | string | ブランチ名 |
| `commit` | string | コミットハッシュ（7〜40文字の16進数） |
| `path` | string | ファイルパス |

**例**:

```json
{
  "path": "content/getting-started/ja.mdx",
  "status": "published",
  "source": {
    "repository": "https://github.com/example/docs-source",
    "branch": "main",
    "commit": "abc1234",
    "path": "docs/getting-started.md"
  },
  "syncHash": "a1b2c3d4e5f6",
  "lastUpdated": "2025-10-15T10:00:00.000Z",
  "reviewer": "translator-team",
  "wordCount": 1500
}
```

---

### 貢献者情報（Contributor）

**対応ファイル**: `registry/schema/partials/contributor.schema.json`

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `name` | string | ✅ | 氏名またはハンドル名 |
| `role` | string | ✅ | 担当役割 |
| `organization` | string | ❌ | 所属やチーム名 |
| `link` | string | ❌ | SNSやGitHubなどのURL |
| `avatar` | string | ❌ | アバター画像のURL |

**role の値**:

- `author`: 著者
- `translator`: 翻訳者
- `reviewer`: レビュアー
- `maintainer`: メンテナー
- `approver`: 承認者

**例**:

```json
{
  "name": "John Doe",
  "role": "translator",
  "organization": "Translation Team",
  "link": "https://github.com/johndoe",
  "avatar": "https://avatars.githubusercontent.com/u/123456"
}
```

---

### 用語集（Glossary）

**対応ファイル**: `registry/schema/partials/glossary.schema.json`

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `id` | string | ✅ | 用語ID（小文字英数字とハイフン） |
| `term` | string | ✅ | 用語の原文 |
| `titles` | object | ✅ | 用語の多言語表記 |
| `definition` | object | ✅ | 用語の説明文（多言語） |
| `aliases` | array | ❌ | 同義語や略称（最大5件） |
| `relatedDocs` | array | ❌ | 関連ドキュメントID |
| `visibility` | string | ❌ | 公開範囲 |
| `tags` | array | ❌ | タグ（最大20件） |

**例**:

```json
{
  "id": "cli",
  "term": "CLI",
  "titles": {
    "en": "Command Line Interface",
    "ja": "コマンドラインインターフェース"
  },
  "definition": {
    "en": "A text-based interface for interacting with software",
    "ja": "ソフトウェアと対話するためのテキストベースのインターフェース"
  },
  "aliases": ["command-line", "terminal"],
  "relatedDocs": ["cli-guide", "installation"],
  "visibility": "public",
  "tags": ["tech", "interface"]
}
```

---

### ライセンス（License）

**対応ファイル**: `registry/schema/partials/license.schema.json`

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `id` | string | ✅ | ライセンス識別子 |
| `name` | string | ✅ | ライセンス名称（例: `"MIT"`, `"CC BY 4.0"`） |
| `url` | string | ✅ | ライセンス本文へのURL |
| `attribution` | string | ❌ | 帰属表示に使用する文面 |
| `notes` | string | ❌ | 補足事項や注意点 |
| `icons` | array | ❌ | ライセンス表示用アイコン |

**例**:

```json
{
  "id": "cc-by-4.0",
  "name": "Creative Commons Attribution 4.0 International",
  "url": "https://creativecommons.org/licenses/by/4.0/",
  "attribution": "Licensed under CC BY 4.0. Original work by Example Corp.",
  "notes": "Derivative works must provide attribution.",
  "icons": ["cc", "by"]
}
```

---

## サンプルコード

### 新規プロジェクト追加のdiff例

```diff
 {
   "$schemaVersion": "1.0.0",
   "projects": [
+    {
+      "id": "api-reference",
+      "displayName": {
+        "en": "API Reference",
+        "ja": "APIリファレンス"
+      },
+      "description": {
+        "en": "Complete API documentation",
+        "ja": "完全なAPIドキュメント"
+      },
+      "languages": [
+        {
+          "code": "en",
+          "displayName": "English",
+          "status": "active",
+          "default": true
+        }
+      ],
+      "versions": [
+        {
+          "id": "v1",
+          "name": "Version 1.0",
+          "isLatest": true,
+          "status": "active"
+        }
+      ],
+      "categories": [],
+      "documents": []
+    }
   ],
   "settings": { /* ... */ }
 }
```

**実行コマンド**:

```bash
pnpm docs-cli add project api-reference \
  --display-name-en "API Reference" \
  --display-name-ja "APIリファレンス" \
  --description-en "Complete API documentation" \
  --description-ja "完全なAPIドキュメント"
```

---

### ドキュメント更新のdiff例

```diff
 {
   "id": "getting-started",
   "slug": "guide/getting-started",
   "title": {
     "en": "Getting Started",
     "ja": "はじめに"
   },
-  "status": "draft",
+  "status": "published",
   "keywords": [
-    "tutorial"
+    "tutorial",
+    "beginner",
+    "quickstart"
   ],
   "content": {
     "en": {
       "path": "content/getting-started/en.mdx",
-      "status": "draft"
+      "status": "published"
     }
   }
 }
```

**実行コマンド**:

```bash
pnpm docs-cli update doc sample-docs getting-started \
  --status published \
  --keywords tutorial,beginner,quickstart
```

---

### バージョン追加のdiff例

```diff
 {
   "id": "sample-docs",
   "versions": [
     {
       "id": "v1",
       "name": "Version 1.0",
-      "isLatest": true,
+      "isLatest": false,
       "status": "active"
     },
+    {
+      "id": "v2",
+      "name": "Version 2.0",
+      "isLatest": true,
+      "status": "active",
+      "date": "2025-10-18T00:00:00.000Z"
+    }
   ]
 }
```

**実行コマンド**:

```bash
pnpm docs-cli add version sample-docs v2 \
  --name "Version 2.0" \
  --set-latest \
  --copy-from v1
```

---

## ベストプラクティス

### ID命名規則

**推奨パターン**:

- **プロジェクトID**: `sample-docs`, `api-reference`
  - 小文字英数字とハイフンのみ
  - 意味が明確で、URLフレンドリー

- **ドキュメントID**: `project-001`, `project-002`, `getting-started`
  - プロジェクトIDをプレフィックスとした連番（CLI自動生成）
  - または、意味のあるID（手動指定）

- **カテゴリID**: `getting-started`, `advanced`, `api`
  - 階層を反映したID（例: `api-rest`, `api-graphql`）

- **バージョンID**: `v1`, `v2`, `v2.1`, `v2.1.3`
  - `v` + SemVer形式
  - メジャーバージョンのみ、またはメジャー.マイナー

**避けるべきパターン**:

- ❌ 大文字を含む（`Sample-Docs`）
- ❌ スペースを含む（`sample docs`）
- ❌ 特殊文字（`sample_docs!`）
- ❌ 日本語や絵文字（`サンプル`, `📚docs`）

---

### バージョン管理戦略

**1. メジャーバージョンのみ管理**

```json
{
  "versions": [
    {"id": "v1", "name": "Version 1"},
    {"id": "v2", "name": "Version 2"}
  ]
}
```

**用途**: シンプルな製品（大きな変更のみバージョン分け）

**2. メジャー.マイナー管理**

```json
{
  "versions": [
    {"id": "v1.0", "name": "Version 1.0"},
    {"id": "v1.1", "name": "Version 1.1"},
    {"id": "v2.0", "name": "Version 2.0"}
  ]
}
```

**用途**: 頻繁に機能追加がある製品

**3. 完全なSemVer管理**

```json
{
  "versions": [
    {"id": "v1.0.0", "name": "Version 1.0.0"},
    {"id": "v1.0.1", "name": "Version 1.0.1 (Patch)"},
    {"id": "v1.1.0", "name": "Version 1.1.0"}
  ]
}
```

**用途**: 詳細なバージョン管理が必要な製品

---

### 翻訳ステータスの管理

**ドキュメントレベル**（`documents[].status`）:

- `planning`: 企画段階（執筆前）
- `draft`: 下書き（執筆中）
- `in-review`: レビュー中
- `published`: 公開済み
- `archived`: アーカイブ（削除予定）

**コンテンツレベル**（`content[lang].status`）:

- `draft`: 翻訳下書き
- `in-review`: レビュー中
- `published`: 公開済み
- `missing`: ファイル欠落（要対応）

**運用フロー**:

1. 新規ドキュメント追加: `status: "draft"`, `content.en.status: "draft"`
2. 英語版レビュー完了: `content.en.status: "in-review"`
3. 英語版公開: `content.en.status: "published"`, `status: "in-review"`
4. 日本語版翻訳完了: `content.ja.status: "in-review"`
5. すべての言語公開: `status: "published"`

---

### 可視性の設定

**visibility の使い分け**:

- `public`: 一般公開（デフォルト）
  - 本番環境でビルド対象
  - 検索エンジンにインデックス

- `internal`: 内部公開
  - 本番環境でビルド対象（社内限定）
  - robots.txt で検索エンジンから除外

- `draft`: 下書き
  - 本番環境でビルド対象外
  - 開発環境のみ表示

**組み合わせ例**:

```json
{
  "id": "internal-api",
  "visibility": "internal",
  "status": "published"
}
```

→ 社内向けに公開済み、外部には非公開

```json
{
  "id": "future-feature",
  "visibility": "draft",
  "status": "draft"
}
```

→ 執筆中、本番環境には未反映

---

## トラブルシューティング

### よくあるバリデーションエラーと対処法

#### エラー1: `SCHEMA_VALIDATION_ERROR`

**メッセージ例**:

```
❌ スキーマ検証エラー: /projects/0/languages/0/code must match pattern "^[a-z]{2}(-[A-Za-z0-9]+)*$"
```

**原因**: 言語コードがBCP 47形式ではない（例: `EN` → `en`）

**対処法**:

1. 小文字に修正（`EN` → `en`）
2. 地域コードを追加（`zh` → `zh-Hans` or `zh-Hant`）

**修正例**:

```diff
 {
-  "code": "EN",
+  "code": "en",
   "displayName": "English"
 }
```

---

#### エラー2: `LANGUAGE_NOT_FOUND`

**メッセージ例**:

```
❌ 言語エラー: ドキュメント "getting-started" のコンテンツ言語 "fr" がプロジェクト "sample-docs" の languages に存在しません
```

**原因**: `content` に含まれる言語コードが `languages[]` に定義されていない

**対処法**:

1. `languages[]` に言語を追加
2. または、`content` から不要な言語を削除

**修正例（言語を追加）**:

```bash
pnpm docs-cli add language sample-docs fr --display-name "Français"
```

---

#### エラー3: `VERSION_NOT_FOUND`

**メッセージ例**:

```
❌ バージョンエラー: ドキュメント "api-guide" のバージョン "v3" がプロジェクト "sample-docs" の versions に存在しません
```

**原因**: `documents[].versions` に含まれるバージョンIDが `versions[]` に定義されていない

**対処法**:

1. `versions[]` にバージョンを追加
2. または、`documents[].versions` から不要なバージョンを削除

**修正例（バージョンを追加）**:

```bash
pnpm docs-cli add version sample-docs v3 --name "Version 3.0"
```

---

#### エラー4: `DOCUMENT_ID_DUPLICATE`

**メッセージ例**:

```
❌ ドキュメントエラー: ドキュメントID "getting-started" が重複しています（プロジェクト: sample-docs）
```

**原因**: 同じプロジェクト内で同じドキュメントIDが複数存在

**対処法**:

1. 重複したドキュメントIDを変更
2. または、重複したエントリを削除

**修正例**:

```bash
# 重複を確認
pnpm docs-cli list docs sample-docs

# 片方を削除
pnpm docs-cli remove doc sample-docs getting-started --force
```

---

#### エラー5: `MULTIPLE_DEFAULT_LANGUAGES`

**メッセージ例**:

```
❌ 言語エラー: プロジェクト "sample-docs" に複数のデフォルト言語が設定されています（en, ja）
```

**原因**: `languages[]` で複数の言語が `default: true` になっている

**対処法**:

1. 1つを除いてすべての `default` を `false` に変更

**修正例**:

```bash
pnpm docs-cli update language sample-docs ja --no-default
```

---

### レジストリ修正時のチェックリスト

**手動編集後の確認手順**:

```bash
# 1. スキーマバリデーション（基本チェック）
pnpm docs-cli validate

# 2. 厳格モード（警告もエラー扱い）
pnpm docs-cli validate --strict

# 3. 完全バリデーション（syncHashも含む）
pnpm docs-cli validate --full

# 4. JSON形式でレポート生成
pnpm docs-cli validate --json > validation-report.json
```

**チェック項目**:

- [ ] JSON構文が正しい（`,` や `}` の抜け漏れなし）
- [ ] `$schemaVersion` が正しい（例: `"1.0.0"`）
- [ ] すべての必須フィールドが存在
- [ ] ID、スラッグ、言語コードが命名規則に準拠
- [ ] プロジェクト内でIDが一意（重複なし）
- [ ] 参照整合性（言語、バージョン、ライセンス、カテゴリのIDが存在）
- [ ] デフォルト言語・最新バージョンが1つのみ
- [ ] `visibility` と `status` の組み合わせが適切

---

### 参照整合性エラーの解決方法

**問題**: ドキュメントが参照する言語/バージョンが存在しない

**診断コマンド**:

```bash
# すべてのドキュメントの参照整合性をチェック
pnpm docs-cli validate --strict

# 特定プロジェクトのみチェック
pnpm docs-cli validate --project sample-docs
```

**解決手順**:

1. **エラーメッセージを確認**

```
❌ バージョンエラー: ドキュメント "api-guide" のバージョン "v3" がプロジェクト "sample-docs" の versions に存在しません
```

2. **存在するバージョンを確認**

```bash
pnpm docs-cli list versions sample-docs
```

3. **不足しているバージョンを追加**

```bash
pnpm docs-cli add version sample-docs v3 --name "Version 3.0"
```

4. **または、ドキュメントから不要な参照を削除**

```bash
pnpm docs-cli update doc sample-docs api-guide --versions v1,v2
```

5. **再度バリデーション**

```bash
pnpm docs-cli validate
```

---

## JSON Schema対応表

### スキーマファイル一覧

| ファイルパス | $id | 説明 |
|-------------|-----|------|
| `registry/docs.schema.json` | `docs.schema.json` | ルートスキーマ |
| `registry/schema/project.schema.json` | `schema/project.schema.json` | プロジェクト定義 |
| `registry/schema/document.schema.json` | `schema/document.schema.json` | ドキュメント定義 |
| `registry/schema/version.schema.json` | `schema/version.schema.json` | バージョン定義 |
| `registry/schema/language.schema.json` | `schema/language.schema.json` | 言語定義 |
| `registry/schema/category.schema.json` | `schema/category.schema.json` | カテゴリ定義 |
| `registry/schema/settings.schema.json` | `schema/settings.schema.json` | グローバル設定 |
| `registry/schema/partials/common.schema.json` | `schema/partials/common.schema.json` | 共通定義 |
| `registry/schema/partials/document-content.schema.json` | `schema/partials/document-content.schema.json` | コンテンツメタ |
| `registry/schema/partials/contributor.schema.json` | `schema/partials/contributor.schema.json` | 貢献者情報 |
| `registry/schema/partials/glossary.schema.json` | `schema/partials/glossary.schema.json` | 用語集 |
| `registry/schema/partials/license.schema.json` | `schema/partials/license.schema.json` | ライセンス |

### $ref参照マップ

| 参照元 | $ref | 解決先 |
|-------|------|-------|
| `docs.schema.json` | `./schema/project.schema.json` | プロジェクト定義 |
| `docs.schema.json` | `./schema/settings.schema.json` | グローバル設定 |
| `project.schema.json` | `./language.schema.json` | 言語定義 |
| `project.schema.json` | `./version.schema.json` | バージョン定義 |
| `project.schema.json` | `./category.schema.json` | カテゴリ定義 |
| `project.schema.json` | `./document.schema.json` | ドキュメント定義 |
| `document.schema.json` | `./partials/common.schema.json#/$defs/entityId` | エンティティID |
| `document.schema.json` | `./partials/document-content.schema.json` | コンテンツメタ |
| `category.schema.json` | `#` | 自己参照（再帰構造） |

---

## 関連ドキュメント

- [CLIユーザーガイド](./docs-cli.md) - レジストリ操作のCLIコマンドリファレンス
- [CI/CD運用ガイド](./ci-cd.md) - 自動バリデーションとデプロイフロー
- [テストポリシーガイド](./testing.md) - レジストリのテスト戦略
- [レジストリスキーマ CHANGELOG](../../registry/schema/CHANGELOG.md) - スキーマ変更履歴
- [レジストリスキーマ VERSIONING](../../registry/schema/VERSIONING.md) - バージョニングガイド
- [DECISIONS.md](../DECISIONS.md) - Phase 1の設計判断

---

**最終更新**: 2025年10月18日
**次回レビュー**: Phase 2開始前（スキーマ更新時）
