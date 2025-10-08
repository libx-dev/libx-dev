# フェーズ1-1：レジストリスキーマ詳細計画

## 目的
- `registry/docs.schema.json` による単一ソース・オブ・トゥルースを確立し、フェーズ2以降のデータ消費レイヤー（ジェネレーター、CLI、マイグレーション）で一貫した型保証を提供する。
- `$schemaVersion` を導入し、スキーマ改定時の互換性管理とマイグレーション指針を明示する。

## スコープ
- ルートレベル構造（`projects`, `settings` 等）の正式定義。
- `LanguageConfig`, `VersionConfig`, `CategoryConfig`, `Document`, `Glossary`, `LicenseMeta`, `ContributorMeta` の属性定義と必須判定。
- `visibility`, `status`, `related`, `keywords`, `tags`, `content.lang` メタ (`source`, `syncHash`, `lastUpdated`, `reviewer`) のバリデーションルール整備。
- `registry/schema/CHANGELOG.md` の初版作成と運用ルール。

## タスク
1. **スキーマドラフト作成**  
   - フェーズ0成果物（requirements-brief, registry-metadata, DECISIONS）の項目を洗い出し JSON Schema に落とす。  
   - 各フィールドに `description`、`examples`、`enum` を付与し、CLI での自動補完に活用できるようにする。
2. **モジュール化構造の検討**  
   - `schemas/partials/` に構造別ファイル（`language.schema.json`, `document.schema.json` 等）を作成し、`$ref` で読み込む。  
   - 将来的な分割読み込み（プロジェクト単位ファイル）に備え、`project.schema.json` を独立させる。
3. **バージョニング方針の策定**  
   - `$schemaVersion` に SemVer を採用し、互換性ルール（MAJOR/MINOR/PATCH）の基準を文書化。  
   - 変更時の手順（CHANGELOG 更新、CLI バージョンチェック、マイグレーションスクリプト作成）をまとめる。
4. **検証用サンプルデータ作成**  
   - `registry/examples/` に小規模データセット（1プロジェクト、2バージョン、2言語）を用意し、ユニットテストで利用。  
   - Pagefind/Glossary/Visibility を含むケースを別途用意し、エッジケース検証に備える。
5. **レビューと承認**  
   - CLI/ジェネレーター担当、コンテンツ担当、QA からレビューを受け、必要なフィールドや制約を調整。  
   - DECISIONS.md に「スキーマ v1.0.0」として記録し、承認日を明記。

### 進捗状況（2024-06-01）
- ✅ タスク1: `registry/docs.schema.json` を初期実装し、`$defs` を含む全体構造と各エンティティのバリデーションルールを反映済み。
- ✅ タスク4: `registry/examples/sample-basic.json` を作成し、`Ajv 2020` + `ajv-formats` で検証済み（検証ログはローカルスクリプト実行で確認）。
- ⏳ タスク2: モジュール分割（`schemas/partials/`）は未着手。`$defs` を分割する際の粒度と import 方法を次ステップで検討する必要あり。
- ⏳ タスク3: `$schemaVersion` 運用ガイドと CHANGELOG の草案は未作成。
- ⏳ タスク5: スキーマレビューと DECISIONS.md への記録は未実施。

## 成果物
- `registry/docs.schema.json` および `registry/schema/*.schema.json`
- `registry/schema/CHANGELOG.md` とバージョニングガイド
- `registry/examples/` 配下のサンプル JSON
- レビュー議事メモ（`docs/new-generator-plan/status/` に記録）

## 完了条件
- Ajv によるバリデーションがサンプルデータで成功し、エラー時のメッセージが意図通り表示される。
- CLI `validate` コマンドからスキーマが参照され、`--strict` オプションで警告をエラー化できる。
- スキーマ変更手順がコミュニケーション計画に沿って承認され、DECISIONS.md に反映されている。

## スキーマドラフト設計メモ（v1.0.0 下書き）

### 1. ルート構造と共通ルール
- ルートスキーマは JSON Schema Draft 2020-12 を使用し、`$schemaVersion`, `projects`, `settings` を必須とする。  
  ```jsonc
  {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "required": ["$schemaVersion", "projects", "settings"],
    "additionalProperties": false
  }
  ```
- `$schemaVersion` は SemVer (`^\d+\.\d+\.\d+$`) を許容し、`description` に互換性ポリシーの概要を記載する。
- `projects` は `ProjectEntry` の配列。`minItems: 1`、`uniqueItems: true` を設定し、`id` 重複はカスタムバリデーションで検出する。
- `settings` は `GlobalSettings` として `$defs` に切り出す。`defaultLocale` と `defaultVersion` はプロジェクト内の存在確認を後続バリデータで行う。
- `metadata`（任意）を追加し、生成日時・作成者などの運用情報を格納できるよう `additionalProperties: true` で緩く定義する。
- 共通 ID フィールドは `pattern: "^[a-z0-9-]+$"` を基本とし、国際化が必要な箇所は別途 `pattern` を緩和する。

### 2. プロジェクト関連定義
- `ProjectEntry`
  - 必須: `id`, `displayName`, `description`, `languages`, `versions`, `categories`, `documents`.
  - 任意: `visibility`（`"public" | "internal" | "draft"`）、`icon`、`tags`, `routes`, `licenses`, `options`, `glossary`, `contributors`.
  - `displayName`/`description` は多言語辞書（`patternProperties` で BCP 47 コードを許容、`minProperties: 1`）。
  - `languages` 配列は `LanguageConfig` を参照。既定言語が複数存在しないよう `contains` + `maxContains: 1` を設定。
  - `versions` 配列は `VersionConfig`。`isLatest` は boolean。`status` は `"active" | "maintenance" | "deprecated"`、`enum` で定義。
  - `categories` はツリー構造を許容するため、`CategoryNode` を再帰参照する `$defs` を用意し、`order` を number、`titles` を多言語辞書として定義。
  - `documents` は `DocumentEntry` の配列。`docId` 重複は CLI 側でチェック。
  - `glossary` は `GlossaryEntry[]`。用語集がないプロジェクトも想定し、省略可能。
  - `licenses` は `LicenseMeta[]`。`id` は `documents[].license` と一致する必要があるため、依存関係チェックをバリデータ側に実装。
  - `contributors` はプロジェクト全体に紐づく寄稿者メタ。`role` は `"maintainer" | "reviewer" | "translator"` を予定。

### 3. 言語・バージョン設定
- `LanguageConfig`
  - `code`: `pattern: "^[a-z]{2}(-[A-Za-z0-9]+)*$"`、`examples`: `["en", "ja", "zh-Hans"]`
  - `displayName`: string（60文字以内目安）  
  - 任意項目: `description`, `default`, `fallback`, `status`, `lastUpdated`, `reviewer`
  - `status` は `"active" | "beta" | "deprecated"`、`description` で公開基準を説明。
  - `lastUpdated` は ISO 8601。`reviewer` は CLI の自動補完対象として `description` に用途を明記。
- `VersionConfig`
  - `id`: `pattern: "^v[0-9]+(\.[0-9]+)*$"`、`examples`: `["v1", "v2.1"]`
  - `name`: 表示用 string。  
  - 任意: `date`（ISO 8601）、`isLatest`, `status`, `changelog`.
  - `status` は `"active" | "maintenance" | "deprecated" | "archived"` を想定し、`enum` を採用。
  - `changelog` は Markdown パスまたはテキストを許容するか未確定。ドラフトでは string とし、フェーズ1-4で精査。

### 4. カテゴリ構造
- `CategoryNode`
  - 必須: `id`, `order`, `titles`.
  - 任意: `description`（多言語）、`docs`, `children`, `icon`.
  - `docs` は `docId` 配列。`minItems: 1`。重複は CLI 検知。
  - `children` は `CategoryNode[]` の再帰参照。`maxDepth` の制約は設定せず、運用ガイドで推奨値を示す。
  - `order` は integer。`minimum: 0`。小数は不可にする。

### 5. ドキュメント定義
- `DocumentEntry`
  - 必須: `id`, `slug`, `title`, `versions`, `content`.
  - 任意: `summary`, `keywords`, `tags`, `related`, `visibility`, `status`, `contributors`, `license`, `toc`, `hero`.
  - `id`: `pattern: "^[a-z0-9-]+$"`。`examples`: `["01-getting-started"]`。
  - `slug`: URL 用、`pattern: "^[a-z0-9-_/]+$"`。`description` でベースパス除外を明記。
  - `title`/`summary` は多言語辞書。`title` は `minProperties: 1` を設定。
  - `versions`: `VersionConfig.id` の配列、`minItems: 1`。
  - `visibility`: `"public" | "internal" | "draft"`。  
  - `status`: 翻訳／制作状況。`"planning" | "draft" | "in-review" | "published" | "archived"` を暫定案とする。
  - `related`: `docId` の配列。スキーマでは `pattern` のみ、整合性チェックは CLI で実装。
  - `keywords`/`tags`: `maxItems: 10` 目安。`description` に用途（検索／トップページ）を記載。
  - `contributors`: `ContributorMeta[]`。`role` は `"author" | "translator" | "reviewer" | "approver"` を想定。
  - `license`: `LicenseMeta.id` を参照。未設定時は既定ライセンスを `settings` 側で定義する余地を残す。

### 6. コンテンツメタ (`content.lang`)
- `content` は言語コードをキーにした辞書。`patternProperties` を使用し、`additionalProperties: false`。
- 値は `DocumentContentEntry`:
  - 必須: `path`, `status`.
  - 任意: `source`, `syncHash`, `lastUpdated`, `reviewer`, `wordCount`.
  - `path`: レポジトリ内の相対パス。`pattern: "^(content|apps)/.+\\.(md|mdx)$"` を暫定採用。
  - `status`: `"draft" | "in-review" | "published" | "missing"`。`enum` を定義し、CLI 側で状態遷移ルールを管理。
  - `source`: `{ "repository": string, "branch": string, "commit": string, "path": string }`。全フィールド任意だが、存在する場合は `pattern` を設定。
  - `syncHash`: `pattern: "^[a-f0-9]{8,64}$"`。旧 `sync-content` のハッシュ互換を考慮。
  - `lastUpdated`: ISO 8601。`examples`: `["2024-05-01T12:34:56Z"]`。
  - `reviewer`: string。必要に応じて `enum`（担当者リスト）を追加できるよう description に記載。

### 7. 用語集・ライセンス・コントリビューター
- `GlossaryEntry`
  - 必須: `id`, `term`, `titles`, `definition`.
  - 任意: `aliases`, `relatedDocs`, `visibility`, `tags`.
  - `term`: string。`pattern` は緩め。`definition` は多言語辞書。
  - `relatedDocs`: `docId` 配列。`minItems: 1`。  
  - 用語集全体に `order` を持たせるか要検討。ドラフトでは `aliases` の `maxItems: 5` を設定。
- `LicenseMeta`
  - 必須: `id`, `name`, `url`.
  - 任意: `attribution`, `notes`, `icons`.
  - `url`: `format: "uri"`。`description` で帰属表記ルールを明記。
- `ContributorMeta`
  - 必須: `name`, `role`.
  - 任意: `link`, `organization`, `avatar`.
  - `role` は `"author" | "translator" | "reviewer" | "maintainer"` で `enum` を定義。

### 8. グローバル設定 (`settings`)
- `defaultLocale`: string。`pattern` は `LanguageConfig.code` と同一。
- `defaultVersion`: string。`pattern` は `VersionConfig.id` と同一。
- `build`: オブジェクト。  
  - `search`: `"pagefind" | "none"` を初期対応。今後の拡張に備えて `enum` を `["pagefind", "none"]` とし、`description` で外部サービス追加手順を案内。
  - `sitemap`: boolean。`default: true`。
  - `sidebar`: `{ "autoGenerate": boolean, "includeHidden": boolean }` などのフラグを想定。詳細はフェーズ2で固めるため、`additionalProperties: true` として余白を残す。
- `deploy`: `{ "provider": "cloudflare-pages", "basePath": string }` を必須。`basePath` の `pattern` に `^/.*$` を設定。
- `backup`: `{ "enabled": boolean, "retentionDays": number }` を想定。CLI のロールバック設定と連携。
- `topPage`: プロジェクトカードの並び替えやハイライト設定。`featuredProjects`（`projectId` 配列）などを含める。

### 9. バリデーション強化ポイント
- 参照整合性（language/version/license/doc）はスキーマだけでは難しいため、Ajv の `unevaluatedProperties` とカスタムキーワード（例: `existingProjectId`）を検討。  
- `projects[].documents[].content` に指定された言語が `projects[].languages[].code` に含まれることを追加バリデータで保証。
- `projects[].versions` の `isLatest: true` が複数存在しないことを `contains` + `maxContains: 1` で制御。
- `visibility` と `status` の組み合わせルール（例: `visibility: "public"` の場合 `status` は `"published"` のみ許容）は CLI の strict オプションで検出する。

### 10. description / examples 記載方針
- `description` は CLI、IDE 補完で参照されることを想定し、1〜2行で用途・入力規則・依存関係を明記する。
- `examples` は最小 1 つ、重要フィールドは 2〜3 例を付けて CLI のサジェストに活用する。
- `enum` フィールドは `description` に値の意味を併記し、QA がレビューしやすいよう補足コメントを添える。

### 11. 未確定事項とフォローアップ
- `documents[].toc` や `hero` の詳細仕様はフェーズ2 UI 設計チームとすり合わせが必要。ドラフトでは `object` + `additionalProperties: true` で余白を確保。
- `glossary` の配置（プロジェクト単位 vs 共通ルート）は現状プロジェクト配下案で前進。将来の共通用語集統合を想定し、`settings.glossary` への拡張余地を記載。
- `metadata` オブジェクトのキー命名規則（`createdAt`, `updatedBy` など）は CLI 実装開始時に確定させる。
- `syncHash` の長さ・ハッシュアルゴリズムはコンテンツチームと再確認し、互換性維持が必要なら仕様を DECISIONS.md に反映する。
