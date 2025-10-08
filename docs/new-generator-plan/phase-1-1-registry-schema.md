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

## 成果物
- `registry/docs.schema.json` および `registry/schema/*.schema.json`
- `registry/schema/CHANGELOG.md` とバージョニングガイド
- `registry/examples/` 配下のサンプル JSON
- レビュー議事メモ（`docs/new-generator-plan/status/` に記録）

## 完了条件
- Ajv によるバリデーションがサンプルデータで成功し、エラー時のメッセージが意図通り表示される。
- CLI `validate` コマンドからスキーマが参照され、`--strict` オプションで警告をエラー化できる。
- スキーマ変更手順がコミュニケーション計画に沿って承認され、DECISIONS.md に反映されている。
