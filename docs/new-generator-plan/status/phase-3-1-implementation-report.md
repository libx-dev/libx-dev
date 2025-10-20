# Phase 3-1 データ変換ロジック実装レポート

**作成日**: 2025-10-20
**ステータス**: ✅ **完了**
**対象**: Phase 3-1（データ変換ロジック）

---

## 📋 目次

1. [エグゼクティブサマリー](#エグゼクティブサマリー)
2. [実装内容](#実装内容)
3. [テスト結果](#テスト結果)
4. [成果物](#成果物)
5. [次のステップ](#次のステップ)

---

## エグゼクティブサマリー

### 実装結果

既存のlibx-devプロジェクト（`project.config.json`形式）を新レジストリ形式（`registry/docs.json`）へ自動変換する`migrate from-libx`コマンドの実装が完了しました。

### 主要な成果

| 項目 | 目標 | 実績 | ステータス |
|-----|------|------|-----------|
| **自動変換成功率** | 90%以上 | **100%** | ✅ 達成 |
| **コンテンツファイル検出** | 全ファイル | **26/26件** | ✅ 達成 |
| **カテゴリ検出** | 全カテゴリ | **4/4件** | ✅ 達成 |
| **ドキュメント検出** | 全ドキュメント | **13/13件** | ✅ 達成 |
| **コンテンツメタ生成** | 全ファイル | **26/26件** | ✅ 達成 |

---

## 実装内容

### 1. 設定ファイル解析モジュール（`config-parser.js`）

**機能**:
- `project.config.json`の読み込みと解析
- `projects.config.json`からのプロジェクト装飾情報取得
- カテゴリ翻訳情報の抽出

**実装内容**:
```javascript
// 主要な関数
- parseProjectConfig(projectPath, projectId)
- parseProjectDecorations(topPagePath, projectId)
- getCategoryNames(categoryTranslations, categoryId, supportedLangs)
```

**変換マッピング**:
- `basic.supportedLangs` → `project.languages[].code`
- `basic.defaultLang` → `project.languages[].default = true`
- `translations.{lang}.displayName` → `project.displayName.{lang}`
- `versioning.versions[]` → `project.versions[]`
- `licensing.sources[]` → `project.licenses[]`

---

### 2. カテゴリスキャンモジュール（`category-scanner.js`）

**機能**:
- 番号付きディレクトリ（`01-guide/`, `02-components/`）の検出
- カテゴリID・order・多言語名の抽出
- 全バージョン・全言語のカテゴリ統合

**実装内容**:
```javascript
// 主要な関数
- scanCategories(projectPath, versionId, lang, categoryTranslations, supportedLangs)
- scanAllCategories(projectPath, versionIds, langCodes, categoryTranslations)
```

**検出パターン**:
- 番号付きディレクトリ: `/^(\d{2})-(.+)$/`
- 例: `01-guide` → `{ id: "guide", order: 1 }`

---

### 3. ドキュメントスキャンモジュール（`document-scanner.js`）

**機能**:
- MDXファイルのスキャン
- フロントマター解析（`gray-matter`使用）
- docId・slug生成
- 語数カウント

**実装内容**:
```javascript
// 主要な関数
- scanDocuments(projectPath, projectId, versionId, lang, supportedLangs)
- scanAllDocuments(projectPath, projectId, versionIds, langCodes)
- parseFrontmatter(filePath)
- countWords(content)
```

**検出パターン**:
- 番号付きファイル: `/^(\d{2})-(.+)\.mdx$/`
- 例: `01-getting-started.mdx` → `{ id: "getting-started", order: 1 }`

---

### 4. コンテンツメタ生成モジュール（`content-meta.js`）

**機能**:
- コンテンツメタ情報の生成
- syncHash計算（SHA-256）
- Git情報取得（最終更新日時、コミッター、リポジトリ情報）

**実装内容**:
```javascript
// 主要な関数
- generateContentMeta(projectPath, document, versionIds, langCodes)
- generateAllContentMeta(projectPath, documents, versionIds, langCodes)
- convertToContentPath(relativePath)
```

**生成フィールド**:
- `path`: コンテンツファイルの相対パス
- `status`: `published` / `missing` / `draft`
- `syncHash`: SHA-256ハッシュ
- `lastUpdated`: 最終更新日時（ISO 8601形式）
- `reviewer`: 最終コミッター名
- `source`: リポジトリ情報（repository, branch, commit, path）
- `wordCount`: 語数

---

### 5. ユーティリティモジュール

#### `hash.js`
```javascript
- calculateFileHash(filePath) // SHA-256ハッシュ計算
- calculateStringHash(content)
```

#### `git.js`
```javascript
- getLastUpdated(filePath)      // 最終更新日時
- getLastCommit(filePath)        // 最終コミットハッシュ
- getLastCommitter(filePath)     // 最終コミッター名
- getRemoteUrl()                 // リモートURL
- getCurrentBranch()             // 現在のブランチ
- getSourceInfo(filePath, relativePath) // ソース情報統合
```

---

### 6. メインコマンド（`migrate/from-libx.js`）

**コマンド構文**:
```bash
docs-cli migrate from-libx \
  --source <path> \
  --project-id <id> \
  --target <path> \
  --top-page <path> \
  --dry-run
```

**処理フロー**:
1. 引数検証とソースディレクトリ確認
2. レジストリの読み込みまたは初期化
3. バックアップ作成
4. プロジェクト設定解析
5. カテゴリスキャン
6. ドキュメントスキャン
7. コンテンツメタ生成
8. レジストリ統合
9. レジストリ保存（dry-runなら表示のみ）

---

## テスト結果

### sample-docsプロジェクトでの変換テスト

**コマンド**:
```bash
node packages/cli/bin/docs-cli.js migrate from-libx \
  --source apps/sample-docs \
  --project-id sample-docs \
  --target registry/docs-test.json \
  --dry-run
```

**結果**:
```
プロジェクトID: sample-docs
言語数: 2 (en, ja)
バージョン数: 2 (v1, v2)
カテゴリ数: 4 (guide, components, advanced, reference)
ドキュメント数: 13
コンテンツファイル数: 26
  published: 26
  missing: 0
  draft: 0
```

**詳細**:
- ✅ 全カテゴリが正常に検出された（4件）
- ✅ 全ドキュメントが正常に検出された（13件）
- ✅ 全コンテンツファイルが正常に検出された（26件）
- ✅ syncHashが全ファイルで生成された
- ✅ lastUpdated、reviewer、sourceが適切に取得された
- ✅ wordCountが計算された

---

## 成果物

### 実装ファイル

1. **コマンド実装**:
   - `packages/cli/src/commands/migrate/from-libx.js` (251行)

2. **コアモジュール**:
   - `packages/cli/src/commands/migrate/config-parser.js` (135行)
   - `packages/cli/src/commands/migrate/category-scanner.js` (147行)
   - `packages/cli/src/commands/migrate/document-scanner.js` (165行)
   - `packages/cli/src/commands/migrate/content-meta.js` (177行)

3. **ユーティリティ**:
   - `packages/cli/src/utils/hash.js` (25行)
   - `packages/cli/src/utils/git.js` (176行)

4. **CLI統合**:
   - `packages/cli/src/index.js`（migrateコマンド追加）

5. **依存関係**:
   - `packages/cli/package.json`（gray-matter, globby追加）

**合計**: 約1,076行のコード

---

### 変換結果の例

**変換前** (`project.config.json`):
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
      "categories": {
        "guide": "Guide"
      }
    }
  }
}
```

**変換後** (レジストリ):
```json
{
  "id": "sample-docs",
  "displayName": {
    "en": "Sample Documentation",
    "ja": "サンプルドキュメント"
  },
  "languages": [
    {
      "code": "en",
      "displayName": "English",
      "status": "active",
      "default": true
    },
    {
      "code": "ja",
      "displayName": "日本語",
      "status": "active",
      "fallback": "en"
    }
  ],
  "categories": [
    {
      "id": "guide",
      "order": 1,
      "titles": {
        "en": "Guide",
        "ja": "ガイド"
      }
    }
  ],
  "documents": [
    {
      "id": "getting-started",
      "slug": "guide/getting-started",
      "title": {
        "en": "Getting Started",
        "ja": "ドキュメント作成の基本"
      },
      "content": {
        "en": {
          "path": "content/getting-started/en.mdx",
          "status": "published",
          "syncHash": "4f91ca9a...",
          "lastUpdated": "2025-10-20T10:00:00Z",
          "reviewer": "Claude",
          "wordCount": 245
        }
      }
    }
  ]
}
```

---

## 次のステップ

### Phase 3-2: 差分レポート/検証

**目的**: 旧サイトと新サイトの差異を可視化・検証する仕組みを整備

**主要タスク**:
1. データ収集（旧サイト vs 新サイト）
2. 比較ロジック（URL差分、メタデータ比較、コンテンツ差分）
3. 検索比較（代表クエリの結果比較）
4. レポート出力（HTML/CSV/JSON）
5. レビュー支援（手順書、ステータス記録テンプレート）
6. CI連携（差分レポートの自動生成）

---

## 課題と改善点

### 確認された課題

1. **トップページ設定ファイルのパス解決**:
   - 現状: 相対パスで`apps/top-page`を参照しているが、CLIの実行位置によって解決に失敗する
   - 影響: プロジェクト装飾情報（icon, tagsなど）が取得できない
   - 対処: `--top-page`オプションで絶対パスを指定すれば回避可能

2. **コンテンツパス変換ロジック**:
   - 現状: `src/content/docs/v2/ja/01-guide/01-getting-started.mdx` → `content/getting-started/ja.mdx`
   - 改善: レジストリ形式の最終決定に応じて調整が必要

### 今後の改善

1. **エラーハンドリング強化**:
   - スラッグ重複時の自動リネーム
   - カテゴリ番号欠番時の警告
   - フロントマター不正時のフォールバック

2. **パフォーマンス最適化**:
   - ファイルスキャンの並列化
   - Git情報取得のバッチ処理

3. **テストカバレッジ向上**:
   - ユニットテストの追加
   - エッジケースのテスト

---

## 結論

Phase 3-1（データ変換ロジック）の実装は **成功** しました。

- ✅ 自動変換成功率100%を達成
- ✅ 全てのコンテンツファイルが正常に検出・変換された
- ✅ コンテンツメタ情報（syncHash, lastUpdated, source等）が正常に生成された
- ✅ dry-runモードで動作確認完了

**Phase 3-2（差分レポート/検証）** に進む準備が整いました。

---

**作成者**: Claude
**作成日**: 2025-10-20
**承認者**: （記入してください）
**次のフェーズ**: Phase 3-2（差分レポート/検証）
