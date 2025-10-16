# スキーマ変更履歴

このファイルは、LibX Docs Registry スキーマ（`docs.schema.json` および関連スキーマファイル）のすべての重要な変更を記録します。

バージョニングは [Semantic Versioning](https://semver.org/spec/v2.0.0.html) に従います。

## [Unreleased]

- 今後の変更はここに記録されます

---

## [1.0.0] - 2025-10-16

### Added

#### ルートスキーマ
- `registry/docs.schema.json` を作成
- `$schemaVersion`, `projects`, `settings`, `metadata` のルート構造を定義
- JSON Schema Draft 2020-12 に準拠

#### モジュール化スキーマ
- `schema/project.schema.json` - プロジェクト定義（言語、バージョン、カテゴリ、ドキュメント、用語集など）
- `schema/document.schema.json` - ドキュメントエントリ定義（メタデータ、可視性、ステータス、コンテンツ参照など）
- `schema/category.schema.json` - カテゴリ構造定義（再帰的な階層構造、順序、多言語タイトル）
- `schema/language.schema.json` - 言語設定定義（BCP 47 コード、デフォルト言語、ステータス）
- `schema/version.schema.json` - バージョン設定定義（バージョンID、リリース日、ステータス、changelog）
- `schema/settings.schema.json` - グローバル設定定義（ビルド設定、デプロイ設定、バックアップ設定）

#### パーシャルスキーマ（共通定義）
- `schema/partials/common.schema.json` - 共通型定義（ID パターン、多言語辞書など）
- `schema/partials/contributor.schema.json` - 寄稿者メタデータ（著者、翻訳者、レビュアーなど）
- `schema/partials/document-content.schema.json` - ドキュメントコンテンツメタ（パス、同期ハッシュ、更新日時）
- `schema/partials/glossary.schema.json` - 用語集定義（用語、定義、エイリアス、関連ドキュメント）
- `schema/partials/license.schema.json` - ライセンスメタデータ（ライセンス名、URL、帰属表記）

#### 検証とサンプル
- `registry/examples/sample-basic.json` - 基本的な検証用サンプルデータ
- Ajv 2020 + ajv-formats による検証をサポート

#### バリデーションルール
- 必須フィールドと任意フィールドの明確な区別
- パターンマッチング（ID、言語コード、バージョン形式など）
- Enum による値の制約（visibility, status など）
- 多言語辞書の最小プロパティ数制約
- 配列の最小アイテム数制約

### Design Decisions

#### スキーマ分割方針
- ルートスキーマから `$ref` で個別スキーマを参照する構造を採用
- エンティティ単位（project, document など）と共通定義（partials）を分離
- 将来的なプロジェクト単位ファイル分割に備えた設計

#### バリデーション方針
- 基本的な型チェックと形式チェックは JSON Schema で実施
- 参照整合性（language/version/license/doc の存在チェック）は CLI 側で実装予定
- `visibility` と `status` の組み合わせルールは `--strict` オプションで検出予定

#### 拡張性の確保
- `additionalProperties: true` を一部フィールドで許可（metadata, options など）
- 将来の機能追加に備えた余白を確保（toc, hero など）
- description フィールドに使用例と制約を詳細に記載

---

## バージョニングポリシー

### MAJOR バージョン（X.0.0）
以下のような後方互換性のない変更を含む場合に更新：
- 必須フィールドの追加または削除
- フィールド名の変更
- フィールドの型変更（string → number など）
- enum 値の削除
- スキーマ構造の大幅な変更

### MINOR バージョン（0.X.0）
以下のような後方互換性のある機能追加を含む場合に更新：
- 任意フィールドの追加
- enum 値の追加
- 新しいパーシャルスキーマの追加
- バリデーションルールの緩和

### PATCH バージョン（0.0.X）
以下のような変更を含む場合に更新：
- description の明確化や補足
- examples の追加・改善
- ドキュメントの修正
- pattern の微調整（意味を変えない範囲）
- バグ修正

---

## 変更プロセス

1. **変更提案**: Issue または PR で変更内容を提案
2. **影響範囲の確認**: MAJOR/MINOR/PATCH のどれに該当するかを判定
3. **CHANGELOG 更新**: `[Unreleased]` セクションに変更内容を記載
4. **レビュー**: 関係者（CLI、ジェネレーター、コンテンツ担当）からレビューを受ける
5. **マージとリリース**:
   - スキーマファイルの `$schemaVersion` を更新
   - CHANGELOG の `[Unreleased]` を新バージョン番号に変更
   - リリース日を記載
6. **マイグレーション**: MAJOR 変更の場合はマイグレーションスクリプトを提供

---

## リンク

- [スキーマ仕様書](./VERSIONING.md)
- [設計判断記録](../../docs/new-generator-plan/DECISIONS.md)
- [フェーズ1-1計画](../../docs/new-generator-plan/phase-1-1-registry-schema.md)
