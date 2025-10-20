# Phase 3.0 移行準備調査レポート

**作成日**: 2025-10-20
**目的**: Phase 3.1（データ変換ロジック）実装に向けた技術基盤調査と分析
**ステータス**: ✅ **調査完了**

---

## 📋 目次

1. [エグゼクティブサマリー](#エグゼクティブサマリー)
2. [既存設定ファイル形式の詳細分析](#既存設定ファイル形式の詳細分析)
3. [レジストリスキーマの完全仕様](#レジストリスキーマの完全仕様)
4. [データ変換マッピング表](#データ変換マッピング表)
5. [技術的ギャップ分析](#技術的ギャップ分析)
6. [Phase 3.1への推奨事項](#phase-31への推奨事項)

---

## エグゼクティブサマリー

### 調査結果の要約

既存の`project.config.json`と新レジストリ形式（`registry/docs.json`）の間には、**構造的な違いが存在するが、自動変換可能な範囲**であることを確認しました。

### 主要な発見

| 項目 | 現状 | 変換難易度 | 備考 |
|-----|------|-----------|------|
| **プロジェクトメタデータ** | `basic`, `translations`セクションに分散 | ✅ 低 | 1:1マッピング可能 |
| **言語設定** | `supportedLangs`, `languageNames`に分散 | ✅ 低 | 統合可能 |
| **バージョン設定** | `versioning.versions`配列 | ✅ 低 | 構造ほぼ同一 |
| **カテゴリ定義** | ファイルシステム構造（`01-guide/`） | 🟡 中 | ディレクトリスキャン必要 |
| **ドキュメント定義** | ファイルシステム構造（`01-getting-started.mdx`） | 🟡 中 | ファイルスキャン + フロントマター解析必要 |
| **ライセンス情報** | `licensing.sources`配列 | ✅ 低 | フィールド名調整のみ |
| **コンテンツメタ** | ❌ 未定義 | 🔴 高 | 新規生成が必要（`status`, `syncHash`など） |

### Phase 3.1への準備状況

- ✅ **設定ファイル構造の完全把握**: 既存3プロジェクトの設定を分析済み
- ✅ **レジストリスキーマの理解**: 必須フィールドと任意フィールドを特定
- ✅ **変換アルゴリズムの設計可能**: 次セクションで詳細マッピング提供
- ⚠️ **コンテンツメタ生成ロジックの設計必要**: Git履歴解析、syncHash計算アルゴリズム

---

## 既存設定ファイル形式の詳細分析

### 1. `project.config.json`の構造

**場所**: `apps/{project-id}/src/config/project.config.json`

**セクション構成**:

```json
{
  "basic": { /* 基本設定 */ },
  "languageNames": { /* 言語表示名 */ },
  "translations": { /* 多言語コンテンツ */ },
  "versioning": { /* バージョン定義 */ },
  "licensing": { /* ライセンス情報 */ }
}
```

#### 1-1. `basic`セクション

**フィールド**:

| フィールド | 型 | 必須 | 説明 | 例 |
|-----------|---|------|------|---|
| `baseUrl` | string | ✅ | プロジェクトのベースURL | `/docs/sample-docs` |
| `supportedLangs` | string[] | ✅ | サポート言語コード配列 | `["en", "ja"]` |
| `defaultLang` | string | ✅ | デフォルト言語コード | `"en"` |

**レジストリへのマッピング**:
- `baseUrl` → **削除**（新システムでは`/docs/{project-id}`で自動生成）
- `supportedLangs` → `project.languages[].code`に統合
- `defaultLang` → `project.languages[].default = true`に変換

---

#### 1-2. `languageNames`セクション

**フィールド**:

```json
{
  "en": "English",
  "ja": "日本語"
}
```

**レジストリへのマッピング**:
- キー（`en`, `ja`）→ `project.languages[].code`
- 値（`English`, `日本語`）→ `project.languages[].displayName`

---

#### 1-3. `translations`セクション

**構造**:

```json
{
  "en": {
    "displayName": "Sample Documentation",
    "displayDescription": "A comprehensive sample...",
    "categories": {
      "guide": "Guide",
      "components": "Components"
    }
  },
  "ja": { /* 同様 */ }
}
```

**レジストリへのマッピング**:
- `translations.{lang}.displayName` → `project.displayName.{lang}`
- `translations.{lang}.displayDescription` → `project.description.{lang}`
- `translations.{lang}.categories` → `project.categories[].name.{lang}`

**注意点**:
- カテゴリ名のみ定義されており、`order`, `description`, `icon`は未定義
- ディレクトリ構造から`order`を推定する必要あり

---

#### 1-4. `versioning`セクション

**構造**:

```json
{
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
```

**レジストリへのマッピング**:
- `versioning.versions[]` → `project.versions[]`
- フィールド追加が必要: `status: "stable"` (デフォルト値)

---

#### 1-5. `licensing`セクション

**構造**:

```json
{
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
```

**レジストリへのマッピング**:
- `licensing.sources[]` → `project.licenses[]`
- フィールド名変更:
  - `licenseUrl` → `url`
  - `sourceUrl` → `source` (または削除、ライセンス固有の情報ではないため)
- `defaultSource`, `showAttribution`, `sourceLanguage` → **削除**（新システムでは不要）

---

### 2. `projects.config.json`の構造（トップページ用）

**場所**: `apps/top-page/src/config/projects.config.json`

**セクション構成**:

```json
{
  "siteConfig": { /* サイト全体設定 */ },
  "content": { /* トップページコンテンツ */ },
  "projectDecorations": { /* プロジェクト表示設定 */ }
}
```

#### 2-1. `siteConfig`セクション

**フィールド**:

| フィールド | 型 | 説明 | レジストリマッピング |
|-----------|---|------|-------------------|
| `baseUrl` | string | サイトベースURL | `settings.siteUrl` |
| `supportedLangs` | string[] | グローバル言語リスト | **削除**（プロジェクトごとに定義） |
| `defaultLang` | string | グローバルデフォルト言語 | `settings.defaultLocale` |
| `repository` | string | リポジトリURL | `settings.repository` |
| `siteName` | string | サイト名 | `settings.siteName` |

#### 2-2. `content`セクション

**フィールド**:

```json
{
  "siteDescription": { "en": "...", "ja": "..." },
  "heroTitle": { "en": "...", "ja": "..." },
  "heroDescription": { "en": "...", "ja": "..." }
}
```

**レジストリへのマッピング**:
- → `settings.content`セクション（そのまま移行）

#### 2-3. `projectDecorations`セクション

**フィールド**:

```json
{
  "sample-docs": {
    "icon": "file-text",
    "tags": ["sample", "documentation"],
    "isNew": false
  }
}
```

**レジストリへのマッピング**:
- キー（`sample-docs`）→ 対応する`project.id`を検索
- `icon` → `project.icon`
- `tags` → `project.tags`
- `isNew` → **削除**（動的計算に変更: `createdAt`から90日以内など）

---

## レジストリスキーマの完全仕様

### 1. ルート構造

**必須フィールド**:
- `$schemaVersion`: string（例: `"1.0.0"`）
- `projects`: Project[]（最低1件）
- `settings`: Settings

**任意フィールド**:
- `metadata`: object（任意のキーを許容）

---

### 2. Project構造

**必須フィールド**:

| フィールド | 型 | 説明 |
|-----------|---|------|
| `id` | string | プロジェクト識別子（kebab-case） |
| `displayName` | LocalizedString | プロジェクト名 |
| `description` | LocalizedString | プロジェクト説明 |
| `languages` | Language[] | 言語設定（最低1件） |
| `versions` | Version[] | バージョン定義（最低1件） |
| `categories` | Category[] | カテゴリ定義 |
| `documents` | Document[] | ドキュメント定義 |

**任意フィールド**:

| フィールド | 型 | 説明 |
|-----------|---|------|
| `icon` | string | アイコン名 |
| `tags` | string[] | タグ配列 |
| `visibility` | "public" \| "internal" | 可視性（デフォルト: "public"） |
| `routes` | object | カスタムルーティング |
| `options` | object | ビルドオプション |
| `licenses` | License[] | ライセンス定義 |
| `glossary` | GlossaryTerm[] | 用語集 |
| `contributors` | Contributor[] | コントリビューター |

---

### 3. Document構造（重要）

**必須フィールド**:

| フィールド | 型 | 説明 |
|-----------|---|------|
| `id` | string | ドキュメントID（ファイル名から生成、例: `getting-started`） |
| `slug` | string | URL用スラッグ |
| `title` | LocalizedString | タイトル |
| `versions` | string[] | 対応バージョンID配列（最低1件） |
| `content` | ContentEntry{} | 言語別コンテンツメタ |

**任意フィールド**:

| フィールド | 型 | 説明 |
|-----------|---|------|
| `summary` | LocalizedString | 要約 |
| `keywords` | string[] | 検索キーワード |
| `tags` | string[] | タグ |
| `related` | string[] | 関連ドキュメントID（最大20件） |
| `visibility` | "public" \| "internal" \| "draft" | 可視性（デフォルト: "public"） |
| `status` | "draft" \| "in-review" \| "published" \| "archived" | ステータス |
| `contributors` | Contributor[] | コントリビューター |
| `license` | string | ライセンスID |

---

### 4. DocumentContentEntry構造（最重要）

**Phase 3.1で実装すべきフィールド**:

| フィールド | 型 | 必須 | 説明 | 生成方法 |
|-----------|---|------|------|---------|
| `path` | string | ✅ | コンテンツファイルパス | ファイル発見時に取得 |
| `status` | "draft" \| "in-review" \| "published" \| "missing" | ✅ | コンテンツステータス | ファイル存在確認 |
| `source` | object | ❌ | 翻訳元情報 | Git remote URL取得 |
| `source.repository` | string | ❌ | リポジトリURL | `git remote get-url origin` |
| `source.branch` | string | ❌ | ブランチ名 | `git rev-parse --abbrev-ref HEAD` |
| `source.commit` | string | ❌ | コミットハッシュ | `git log -1 --format=%H {file}` |
| `source.path` | string | ❌ | リポジトリ内パス | 相対パス |
| `syncHash` | string | ❌ | 同期検知ハッシュ | SHA-256（ファイル内容） |
| `lastUpdated` | string (ISO 8601) | ❌ | 最終更新日時 | `git log -1 --format=%cI {file}` |
| `reviewer` | string | ❌ | レビュー担当者 | `git log -1 --format=%cn {file}` |
| `wordCount` | integer | ❌ | 語数 | MDX解析（本文のみカウント） |

**生成アルゴリズム例**:

```javascript
// syncHashの計算
function calculateSyncHash(filePath) {
  const crypto = require('crypto');
  const fs = require('fs');
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

// lastUpdatedの取得
function getLastUpdated(filePath) {
  const { execSync } = require('child_process');
  try {
    const output = execSync(`git log -1 --format=%cI "${filePath}"`, { encoding: 'utf-8' });
    return output.trim();
  } catch (error) {
    // Gitリポジトリでない場合はファイルのmtime
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString();
  }
}
```

---

## データ変換マッピング表

### 1. プロジェクトメタデータ

| 既存フィールド | レジストリフィールド | 変換方法 | 優先度 |
|-------------|------------------|---------|--------|
| `project.config.json` → `basic.baseUrl` | **削除** | - | - |
| `project.config.json` → `basic.supportedLangs[]` | `project.languages[].code` | 配列変換 | 🔴 高 |
| `project.config.json` → `basic.defaultLang` | `project.languages[].default = true` | フラグ変換 | 🔴 高 |
| `project.config.json` → `languageNames.{lang}` | `project.languages[].displayName` | オブジェクト→配列変換 | 🔴 高 |
| `project.config.json` → `translations.{lang}.displayName` | `project.displayName.{lang}` | 再構造化 | 🔴 高 |
| `project.config.json` → `translations.{lang}.displayDescription` | `project.description.{lang}` | 再構造化 | 🔴 高 |
| `project.config.json` → `translations.{lang}.categories` | `project.categories[].name.{lang}` | カテゴリ統合 | 🟡 中 |
| `project.config.json` → `versioning.versions[]` | `project.versions[]` | ほぼそのまま移行 | ✅ 低 |
| `project.config.json` → `licensing.sources[]` | `project.licenses[]` | フィールド名調整 | ✅ 低 |

---

### 2. カテゴリ定義

**既存構造**: ファイルシステムベース

```
apps/sample-docs/src/content/docs/v2/ja/
├── 01-guide/
│   ├── 01-getting-started.mdx
│   └── 02-installation.mdx
├── 02-components/
│   └── 01-button.mdx
└── 03-advanced/
    └── 01-customization.mdx
```

**変換アルゴリズム**:

```javascript
function extractCategoriesFromFileSystem(contentDir, lang) {
  const categories = [];
  const categoryDirs = fs.readdirSync(contentDir)
    .filter(d => fs.statSync(path.join(contentDir, d)).isDirectory())
    .filter(d => /^\d{2}-/.test(d)); // 番号付きディレクトリのみ

  for (const dir of categoryDirs) {
    const match = dir.match(/^(\d{2})-(.+)$/);
    if (match) {
      const [, orderStr, categorySlug] = match;
      const order = parseInt(orderStr, 10);

      // project.config.jsonからカテゴリ名を取得
      const categoryNames = getProjectConfig().translations;

      categories.push({
        id: categorySlug,
        order: order,
        name: {
          en: categoryNames.en.categories[categorySlug] || titleCase(categorySlug),
          ja: categoryNames.ja.categories[categorySlug] || titleCase(categorySlug)
        },
        description: {
          en: "", // 空文字列（未定義）
          ja: ""
        }
      });
    }
  }

  return categories.sort((a, b) => a.order - b.order);
}
```

---

### 3. ドキュメント定義

**既存構造**: ファイルシステムベース + フロントマター

```markdown
---
title: Getting Started
description: Quick start guide
category: guide
categoryOrder: 1
pubDate: 2024-01-01T00:00:00.000Z
order: 1
---

# Getting Started
...
```

**変換アルゴリズム**:

```javascript
function extractDocumentsFromFileSystem(contentDir, version, lang) {
  const documents = [];
  const categoryDirs = getCategories(contentDir);

  for (const categoryDir of categoryDirs) {
    const categoryId = extractCategoryId(categoryDir.name);
    const mdxFiles = fs.readdirSync(path.join(contentDir, categoryDir.name))
      .filter(f => f.endsWith('.mdx'))
      .filter(f => /^\d{2}-/.test(f));

    for (const file of mdxFiles) {
      const match = file.match(/^(\d{2})-(.+)\.mdx$/);
      if (match) {
        const [, orderStr, docSlug] = match;
        const order = parseInt(orderStr, 10);
        const fullPath = path.join(contentDir, categoryDir.name, file);

        // フロントマター解析
        const { data: frontmatter, content } = parseMdxFile(fullPath);

        // docIdは"{categoryId}/{docSlug}"または"{docSlug}"
        const docId = docSlug;

        documents.push({
          docId: docId,
          projectId: getProjectId(),
          versionId: version,
          categoryId: categoryId,
          order: order,
          slug: docSlug,
          title: {
            [lang]: frontmatter.title || titleCase(docSlug)
          },
          description: {
            [lang]: frontmatter.description || ""
          },
          visibility: frontmatter.draft ? "draft" : "public"
        });
      }
    }
  }

  return documents;
}
```

---

### 4. コンテンツメタ生成

**生成フロー**:

1. **ファイル発見**: `apps/{project}/src/content/docs/{version}/{lang}/**/*.mdx`
2. **ステータス判定**:
   - ファイル存在 → `status: "published"`
   - ファイル不在 → `status: "missing"`
   - フロントマターに`draft: true` → `status: "draft"`
3. **syncHash計算**: SHA-256（ファイル全体内容）
4. **Git情報取得**:
   - `lastUpdated`: `git log -1 --format=%cI {file}`
   - `source.commit`: `git log -1 --format=%H {file}`
   - `reviewer`: `git log -1 --format=%cn {file}`
5. **wordCount計算**: MDX解析、コードブロック除外、本文のみカウント

---

## 技術的ギャップ分析

### 1. 構造的ギャップ

| ギャップ | 既存 | 新レジストリ | 影響度 | 緩和策 |
|---------|------|------------|--------|--------|
| カテゴリ`description` | 未定義 | 任意フィールド | 低 | 空文字列で初期化 |
| カテゴリ`icon` | 未定義 | 任意フィールド | 低 | 未設定で初期化 |
| ドキュメント`summary` | フロントマターに`description` | レジストリに`summary` | 低 | `description` → `summary`変換 |
| ドキュメント`keywords` | 未定義 | 任意フィールド | 低 | 空配列で初期化 |
| ドキュメント`tags` | フロントマターに`tags`あり | レジストリに`tags` | 低 | そのまま移行 |
| ドキュメント`related` | フロントマターに`prev/next` | レジストリに`related` | 中 | `prev/next` → `related`変換 |
| コンテンツ`source` | 未定義 | 新規フィールド | 高 | Git情報から生成 |
| コンテンツ`syncHash` | 未定義 | 新規フィールド | 高 | ファイル内容からSHA-256計算 |

---

### 2. データ不在のギャップ

**Phase 3.1で新規生成が必要なデータ**:

| データ | 生成方法 | 優先度 | 備考 |
|-------|---------|--------|------|
| `content.{lang}.syncHash` | SHA-256（ファイル内容） | 🔴 高 | 同期検知に必須 |
| `content.{lang}.lastUpdated` | Git履歴 or ファイルmtime | 🔴 高 | UI表示に利用 |
| `content.{lang}.source.repository` | `git remote get-url origin` | 🟡 中 | 翻訳管理に有用 |
| `content.{lang}.source.commit` | `git log -1 --format=%H {file}` | 🟡 中 | 翻訳管理に有用 |
| `content.{lang}.reviewer` | Git履歴 or デフォルト値 | 🟢 低 | 運用改善に有用 |
| `content.{lang}.wordCount` | MDX解析 | 🟢 低 | 統計情報として有用 |

---

### 3. ツール依存のギャップ

| 依存ツール | 用途 | 入手可否 | リスク | 緩和策 |
|-----------|------|---------|--------|--------|
| Git | 履歴情報取得 | ✅ 常に利用可能 | 低 | - |
| Node.js crypto | syncHash計算 | ✅ 標準ライブラリ | 低 | - |
| MDX parser | wordCount計算 | ✅ 既存依存関係 | 低 | - |
| gray-matter | フロントマター解析 | ⚠️ 要インストール | 低 | `packages/cli`に追加 |

---

## Phase 3.1への推奨事項

### 1. 優先実装項目

**Week 1**:
1. ✅ **設定ファイル解析**（Day 1-2）
   - `project.config.json`読み込み
   - `projects.config.json`読み込み
   - バリデーション
2. ✅ **カテゴリ変換**（Day 3-4）
   - ファイルシステムスキャン
   - 番号付きディレクトリ解析
   - カテゴリ名統合
3. ✅ **ドキュメント変換**（Day 5）
   - MDXファイルスキャン
   - フロントマター解析
   - docId/slug生成

**Week 2**:
4. ✅ **コンテンツメタ生成**（Day 6-8）
   - syncHash計算
   - Git情報取得
   - ステータス判定
5. ✅ **Glossary変換**（Day 9）
   - 用語集ファイル検出（存在する場合）
   - glossary配列生成
6. ✅ **エラーハンドリング**（Day 10）
   - バックアップ機能
   - ロールバック機能

**Week 3**:
7. ✅ **テスト実装**（Day 11-13）
   - ユニットテスト
   - 統合テスト
   - スナップショットテスト
8. ✅ **ドキュメント作成**（Day 14）
   - `guides/migration-data.md`完成

---

### 2. 必要な依存関係追加

```json
// packages/cli/package.json
{
  "dependencies": {
    "gray-matter": "^4.0.3",  // フロントマター解析
    "globby": "^14.0.0",       // ファイルスキャン
    "crypto": "^1.0.1"         // syncHash計算（Node.js標準だが明示）
  }
}
```

---

### 3. テストフィクスチャ準備

**ディレクトリ構造**:

```
packages/cli/tests/fixtures/
├── migrate-from-libx/
│   ├── sample-small/          # 小規模テストケース
│   │   ├── apps/
│   │   │   └── test-project/
│   │   │       ├── src/
│   │   │       │   ├── config/
│   │   │       │   │   └── project.config.json
│   │   │       │   └── content/
│   │   │       │       └── docs/
│   │   │       │           └── v1/
│   │   │       │               ├── en/
│   │   │       │               │   └── 01-guide/
│   │   │       │               │       └── 01-getting-started.mdx
│   │   │       │               └── ja/
│   │   │       │                   └── 01-guide/
│   │   │       │                       └── 01-getting-started.mdx
│   │   └── expected-output.json  # 期待される変換結果
│   ├── sample-medium/         # 中規模テストケース
│   └── edge-cases/            # エッジケース
│       ├── missing-files/     # ファイル欠損
│       ├── invalid-frontmatter/  # 不正なフロントマター
│       └── duplicate-slugs/   # スラッグ重複
```

---

### 4. 変換実行フロー設計

```bash
# コマンド実行例
docs-cli migrate-from-libx \
  --source apps/sample-docs \
  --project-id sample-docs \
  --target registry/docs.json \
  --dry-run \
  --report migration-report.html
```

**処理フロー**:

```
1. 引数解析とバリデーション
   ├─ ソースディレクトリ存在確認
   ├─ プロジェクトID重複チェック
   └─ ターゲットレジストリバックアップ

2. 設定ファイル読み込み
   ├─ project.config.json解析
   └─ projects.config.json解析（該当プロジェクト装飾情報）

3. ファイルシステムスキャン
   ├─ カテゴリディレクトリ検出
   ├─ MDXファイル検出
   └─ バージョン/言語構造解析

4. レジストリ構造生成
   ├─ Project構造構築
   ├─ Language配列生成
   ├─ Version配列生成
   ├─ Category配列生成
   └─ Document配列生成

5. コンテンツメタ生成
   ├─ syncHash計算
   ├─ Git情報取得
   ├─ ステータス判定
   └─ wordCount計算

6. レジストリ書き込み（または dry-run 表示）
   ├─ スキーマバリデーション
   ├─ 既存レジストリとマージ
   └─ ファイル書き込み

7. レポート生成
   ├─ 変換統計（成功/警告/エラー件数）
   ├─ 差分サマリー
   └─ HTML/JSON出力
```

---

### 5. 成功基準の具体化

| 基準 | 目標値 | 測定方法 |
|-----|--------|---------|
| 自動変換成功率 | 90%以上 | （自動変換ドキュメント数 / 全ドキュメント数） × 100 |
| スキーマバリデーション通過率 | 100% | 変換後レジストリの`docs-cli validate`実行 |
| syncHash生成成功率 | 100% | 全ファイルでsyncHashが生成される |
| Git情報取得成功率 | 80%以上 | Git履歴から情報取得できたファイル数 / 全ファイル数 |
| 変換時間（中規模プロジェクト） | 10秒以内 | 100ドキュメント、3言語、2バージョンの変換時間 |

---

## 付録A: 既存プロジェクトの統計情報

| プロジェクト | 言語数 | バージョン数 | カテゴリ数（推定） | ドキュメント数（推定） |
|------------|--------|------------|----------------|------------------|
| sample-docs | 2（en, ja） | 2（v1, v2） | 4 | 13 |
| libx-docs | 2（en, ja） | 1（v1） | 2 | 20 |
| test-verification | 2（en, ja） | 2（v1, v2） | - | 3 |

**合計**: 約36ドキュメント（既存のregistry/docs.jsonと一致）

---

## 付録B: エラーケースと緩和策

| エラーケース | 発生条件 | 緩和策 | 自動対応可否 |
|------------|---------|--------|-------------|
| スラッグ重複 | 同じカテゴリ内で同じファイル名 | 末尾に番号付与（`-2`, `-3`） | ✅ 自動 |
| カテゴリ番号欠番 | `01-guide/`, `03-api/`（02が不在） | orderをそのまま利用、警告ログ出力 | ✅ 自動 |
| フロントマター不正 | YAMLパースエラー | デフォルト値で続行、警告ログ出力 | ✅ 自動 |
| Git情報取得失敗 | `.git/`ディレクトリ不在 | ファイルmtimeをフォールバック | ✅ 自動 |
| ファイルエンコーディング異常 | UTF-8以外 | エラー、手動確認要求 | ❌ 手動 |
| ライセンスID不一致 | project.config.jsonとレジストリで異なる | 警告、プロンプトで選択 | ⚠️ 対話 |

---

## 次のステップ

1. ✅ **Phase 3.0調査完了**（本レポート）
2. ⏭️ **マイグレーションツール設計書作成**（`migration-tool-design.md`）
3. ⏭️ **Phase 3.1詳細タスクブレークダウン作成**（`phase-3-1-task-breakdown.md`）
4. ⏭️ **Phase 3.1キックオフドキュメント作成**（`phase-3-1-kickoff.md`）

---

**作成者**: Claude
**作成日**: 2025-10-20
**次回アクション**: マイグレーションツール設計書の作成
**承認者**: （記入してください）

---

## 🎯 Phase 3.1への準備状況: ✅ **完了**

Phase 3.1（データ変換ロジック）実装に必要な全ての技術情報を収集・分析し、具体的な変換マッピング表とアルゴリズムを提供しました。

**Phase 3.1を開始する準備が整いました。** 🚀
