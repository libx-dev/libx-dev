# レジストリ項目一覧（フェーズ0成果物）

新ジェネレーターで管理する JSON レジストリ構造の初期案。フェーズ1 で JSON Schema 化する際の基礎資料とする。

## 1. ルート構造
```jsonc
{
  "projects": [...],
  "settings": {
    "defaultLocale": "en",
    "defaultVersion": "v1",
    "build": { "search": "pagefind", "sitemap": true },
    "deploy": { "provider": "cloudflare-pages", "basePath": "/" }
  }
}
```
- `projects`: 各ドキュメントサイトの定義（配列）。  
- `settings`: 全体設定（ビルド・デプロイ・既定値）。

## 2. プロジェクト定義
| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | string | ✅ | プロジェクト識別子（URL・ディレクトリに使用） |
| `displayName` | object | ✅ | `{ en: string, ja: string, ... }` 各言語表示名 |
| `description` | object | ✅ | プロジェクト概要（翻訳対応） |
| `icon` | string | ⭕️ | `@docs/ui` の `IconName` から選択 |
| `tags` | string[] | ⭕️ | トピック/カテゴリ（検索メタ／トップページ表示用） |
| `languages` | LanguageConfig[] | ✅ | 対応言語設定 |
| `versions` | VersionConfig[] | ✅ | 管理バージョンのリスト |
| `categories` | CategoryConfig[] | ✅ | カテゴリツリー（階層対応） |
| `routes` | object | ⭕️ | カスタムルーティング、リダイレクト設定 |
| `licenses` | LicenseMeta[] | ⭕️ | 翻訳元ライセンス情報 |
| `options` | object | ⭕️ | `search`: true/false, `sidebar`: custom メタなど |

### LanguageConfig
| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `code` | string | ✅ | ISO 言語コード（例: `ja`, `en`, `zh-Hans`） |
| `displayName` | string | ✅ | 表示名 |
| `description` | string | ⭕️ | 言語説明 |
| `default` | boolean | ⭕️ | プロジェクト内の既定言語 |
| `fallback` | string | ⭕️ | フォールバック言語（存在しない場合の参照） |
| `status` | `"active" \| "beta" \| "deprecated"` | ⭕️ | 公開状況 |
| `lastUpdated` | string (ISO8601) | ⭕️ | 最終更新日 |
| `reviewer` | string | ⭕️ | レビュー担当者 |

### VersionConfig
| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | string | ✅ | `v1` 形式の識別子 |
| `name` | string | ✅ | 表示名（例: `v1.0`） |
| `date` | string (ISO8601) | ⭕️ | 公開日 |
| `isLatest` | boolean | ⭕️ | 最新判定 |
| `status` | `"active" \| "maintenance" \| "deprecated"` | ⭕️ | サポート状態 |
| `changelog` | string | ⭕️ | 変更概要 |

### CategoryConfig
```jsonc
{
  "id": "guide",
  "order": 1,
  "titles": { "en": "Guide", "ja": "ガイド" },
  "children": [
    { "id": "getting-started", "order": 1, "titles": {...}, "docs": ["intro"] }
  ]
}
```
- 階層構造をサポート。`order` でソートし、`titles` は多言語対応。
- `docs`: 当該カテゴリに属する Document ID の配列。

### Document 定義
| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | string | ✅ | ドキュメント固有 ID（ファイルディレクトリ名と一致） |
| `slug` | string | ✅ | URL 用スラッグ（番号付与なし） |
| `title` | object | ✅ | 各言語タイトル |
| `summary` | object | ⭕️ | 要約（カード表示・検索メタ用） |
| `keywords` | string[] | ⭕️ | 検索キーワード（Pagefind や Algolia と連携） |
| `tags` | string[] | ⭕️ | コンテンツタグ（トップページ・検索フィルタ用） |
| `related` | string[] | ⭕️ | 関連ドキュメント ID リスト |
| `versions` | string[] | ✅ | 対応バージョン一覧 |
| `content` | object | ✅ | `{ lang: { path: string, status: "draft"|"in-review"|"published"|"missing", lastUpdated: string, reviewer?: string } }` |
| `contributors` | ContributorMeta[] | ⭕️ | 翻訳/レビュー担当 |
| `license` | string | ⭕️ | ライセンス ID（`licenses` リスト参照） |

### LicenseMeta
| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | string | ✅ | ライセンス識別子 |
| `name` | string | ✅ | ライセンス名称 |
| `url` | string | ✅ | リンク |
| `attribution` | string | ⭕️ | 表示用文言 |
| `notes` | string | ⭕️ | 注意事項（翻訳可） |

### ContributorMeta
| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `name` | string | ✅ | 氏名またはハンドル |
| `role` | `"author" \| "translator" \| "reviewer"` | ✅ | 役割 |
| `link` | string | ⭕️ | SNS/GitHub 等 |

## 3. Content ディレクトリの想定
```
content/
  └── <docId>/
      ├── en.mdx
      ├── ja.mdx
      └── metadata.json  // 必要に応じて補足メタ
```
- CLI が `docId` ディレクトリを作成し、レジストリの `content.lang.path` と同期させる。
- 翻訳ステータスの更新はレジストリ経由で行い、 MDX には最小限の frontmatter のみ残す。

## 4. 補助データ
- **トップページ設定**: `projects` から自動生成可能。特別な表示順やピックアップを設定する場合は `settings.topPage` に定義。  
- **検索インデックス補助**: `documents[].keywords`, `tags` などを Pagefind/Algolia 等のメタとして利用。  
- **ビルドフラグ**: プロジェクト単位で `options.build` に `includeInDefaultBuild` 等を追加し、選択的ビルドを CLI から制御。
- **バックアップ管理**: CLI 操作前後のレジストリスナップショットを `.backups/` に保管し、保持期間・クリーンアップ設定を `settings.backup` 等で管理することを想定。

## 5. 今後の検討事項と現時点の方針
- **関連リンクと用語集の扱い**  
  - `documents[].related` を既定の関連リンクとして採用済み。  
  - 用語集は各プロジェクトに `glossary` コレクション（`[{ id, term, titles, description, relatedDocs }]`）を追加する案を推奨し、フェーズ2で実装可否を判断する。
- **アクセスコントロール表現**  
  - プロジェクト・ドキュメント・言語単位で `visibility: "public" | "internal" | "draft"` フィールドを追加し、ビルド時に除外/警告を切り替える設計を採用する。  
  - CLI の `validate` で非公開・ドラフト状態を検知し、パブリッシュ前チェックに利用する。
- **自動化スクリプト由来メタデータ**  
  - `content.lang` オブジェクトに `source` フィールド（例: `{ repository, commit, path }`）と `syncHash` を保持し、移行時のトレースや差分検知に活用する。  
  - 旧 `sync-content` のハッシュはこの `syncHash` に集約し、冗長なログファイルは廃止する。
- **JSON Schema バージョニング**  
  - ルートに `$schemaVersion`（SemVer）を追加し、`registry/schema/` 配下で履歴管理する。  
  - CLI はレジストリ読み込み時にバージョンを検証し、互換性がない場合はマイグレーションコマンドを案内する。
- **大規模化時の分割戦略**  
  - 当面は単一 JSON を維持（DECISIONS.md 参照）しつつ、将来的に `registry/projects/<id>.json` を読み込むアグリゲータを用意する。  
  - フェーズ1終盤で分割条件（例: 1ファイルあたりのプロジェクト数・サイズ）を再評価し、実装是非を決定する。
