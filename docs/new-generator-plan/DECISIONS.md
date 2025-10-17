# 決定事項ログ

フェーズ0までに合意された主要な意思決定を記録します。新しい決定は追記し、参照した文書や目的を明示してください。

## 2024-XX-XX 新ジェネレーター基盤に関する合意

1. **レジストリ構造の扱い**  
   - 初期版は単一 JSON で構成し、プロジェクト単位の分割はフェーズ1終盤に再評価する。  
   - 根拠: フェーズ0 要件ブリーフ / registry-metadata。シンプルなソース・オブ・トゥルース維持と原則4（コンテンツ運用）との整合。

2. **検索エンジン方針**  
   - 初期実装は Pagefind を標準とし、Algolia 等の外部サービスはフェーズ2以降の拡張候補として比較検証する。  
   - 根拠: 競合調査、原則5（自動化と品質保証）。

3. **libx-docs リポジトリの取り扱い**  
   - 移行期間中はソース置き場として維持し、フェーズ3完了時に継続是非を見直すマイルストーンを設定する。  
   - 根拠: asset-inventory、原則6（コラボレーションとナレッジ共有）。

4. **共有パッケージ配布形態**  
   - 第一候補は npm 公開可能なパッケージ化。移行期間中は Git サブモジュール活用もバックアップ案として保持し、フェーズ1で PoC を行う。  
   - 根拠: UI/テーマ調査、原則2（共有資産の最大活用）。

5. **翻訳ステータス管理**  
   - レジストリに `status`, `lastUpdated`, `reviewer` などのフィールドを追加し CLI `validate`/`info` で可視化する。  
   - 根拠: requirements-brief、原則4（コンテンツ運用）。

6. **検索・ナビゲーションメタデータ**  
   - `documents` に `keywords`, `tags`, `related` を保持し、MDX frontmatter は最小化。高度な関連付けはフェーズ5以降で検討する。  
   - 根拠: registry-metadata、原則3・4。

7. **CLI バックアップ/ロールバック戦略**  
   - 既存スクリプト同様 `.backups/` に差分保存し、失敗時自動ロールバックを標準化。バックアップの保有期間とクリーンアップコマンドを設ける。  
   - 根拠: scripts 調査、原則5（信頼性）。

8. **CI/自動化カバレッジ**  
   - フェーズ1で JSON Schema 検証・レジストリ/コンテンツ整合・Astro ビルドを必須にし、フェーズ2でリンク・アクセシビリティ・翻訳整合検査を追加する段階計画を採用。  
   - 根拠: requirements-brief、原則5。

---

## 2025-10-16 スキーマ v1.0.0 承認

### 承認内容

**レジストリスキーマ v1.0.0** を正式承認し、フェーズ1-1（レジストリスキーマ詳細計画）を完了とする。

### 成果物

1. **スキーマファイル群**
   - `registry/docs.schema.json` - ルートスキーマ（JSON Schema Draft 2020-12）
   - `registry/schema/project.schema.json` - プロジェクト定義
   - `registry/schema/document.schema.json` - ドキュメントエントリ定義
   - `registry/schema/category.schema.json` - カテゴリ構造定義
   - `registry/schema/language.schema.json` - 言語設定定義
   - `registry/schema/version.schema.json` - バージョン設定定義
   - `registry/schema/settings.schema.json` - グローバル設定定義
   - `registry/schema/partials/*.schema.json` - 共通定義（contributor, glossary, license, document-content, common）

2. **ドキュメント**
   - `registry/schema/CHANGELOG.md` - スキーマ変更履歴と変更プロセス
   - `registry/schema/VERSIONING.md` - バージョニングガイドとSemVerルール

3. **バリデーションツール**
   - `scripts/validate-schema.js` - スキーマ整合性チェックツール
   - `registry/examples/sample-basic.json` - サンプルデータ

### 主要な設計判断

#### 1. スキーマモジュール化方針

**決定**: エンティティ単位（project, document, category等）でスキーマを分割し、`$ref`で参照する構造を採用。

**根拠**:
- 保守性の向上：各エンティティを独立して編集可能
- 再利用性：共通定義（partials）を複数箇所から参照
- 段階的な拡張：将来的なプロジェクト単位ファイル分割への準備

**代替案検討**:
- 単一巨大スキーマ：シンプルだが保守性が低い
- 完全分散（プロジェクト単位）：複雑すぎる、フェーズ1では不要

#### 2. バージョニングポリシー

**決定**: Semantic Versioning (SemVer) を採用し、`$schemaVersion`フィールドでバージョン管理。

**根拠**:
- 業界標準：JSON Schemaの一般的なプラクティスに準拠
- 互換性管理：MAJOR/MINOR/PATCHの明確な基準で破壊的変更を識別
- マイグレーション計画：バージョン間の移行パスを明示的に管理

**運用ルール**:
- MAJOR: 後方互換性のない変更（必須フィールド追加、フィールド削除など）
- MINOR: 後方互換性のある機能追加（任意フィールド追加、enum値追加など）
- PATCH: バグ修正、ドキュメント改善

#### 3. バリデーション戦略の分離

**決定**: 基本的な型・形式チェックはJSON Schemaで実施し、参照整合性などの高度なチェックはCLI側で実装。

**根拠**:
- JSON Schemaの限界：言語/バージョン/ライセンスIDの存在チェックなど、クロスリファレンス検証は困難
- 役割分担：スキーマは構造定義に集中、CLIは業務ロジック検証を担当
- エラーメッセージ：CLI側で日本語の分かりやすいエラーメッセージを提供可能

**実装計画**:
- フェーズ1-1: スキーマ定義とbasicバリデーション
- フェーズ1-2: CLIでの参照整合性チェック実装
- フェーズ1-3: strictモードでのビジネスルール検証

#### 4. 拡張性の確保

**決定**: 将来の機能追加に備え、一部フィールドで`additionalProperties: true`を許可。

**対象フィールド**:
- `metadata`: レジストリ生成日時、担当者などの運用メタデータ
- `options`: プロジェクト固有のカスタム設定
- `toc`, `hero`: UI実装時に詳細仕様を確定するフィールド

**根拠**:
- フェーズ間の柔軟性：UI設計（フェーズ2）やマイグレーション（フェーズ3）で新要件が発生する可能性
- 段階的な厳密化：必要に応じて後のMINORバージョンで制約を追加可能

### バリデーション結果

**実施日**: 2025-10-16
**ツール**: `scripts/validate-schema.js`

**チェック項目**:
- ✅ 全スキーマファイルが有効なJSON
- ✅ ルートスキーマの基本構造が正常
- ✅ $ref参照の整合性確認
- ✅ サンプルデータの基本構造検証

**注記**: 完全なAjvベースのスキーマバリデーションはCLI実装時（フェーズ1-2）に統合予定。

### 今後の対応

1. **フェーズ1-2への移行**
   - CLIバリデーションコマンドの実装
   - Ajv統合と参照整合性チェック
   - エラーメッセージの日本語化

2. **レジストリデータの初期作成**
   - 既存プロジェクト（sample-docs, test-verification等）のマッピング
   - マイグレーションスクリプトの設計

3. **ステークホルダーレビュー**
   - CLI担当者: バリデーションインターフェース確認
   - ジェネレーター担当者: ビルド時のデータ消費方法確認
   - コンテンツ担当者: フィールド要件の最終確認

### 参照ドキュメント

- [フェーズ1-1計画](./phase-1-1-registry-schema.md)
- [スキーマ変更履歴](../../registry/schema/CHANGELOG.md)
- [バージョニングガイド](../../registry/schema/VERSIONING.md)

---

## 2025-10-16 Phase 1-2 バリデーションツール完成

### 承認内容

**バリデーションツール基盤とマイグレーションシステム**を正式承認し、フェーズ1-2（バリデーションツール詳細計画）を完了とする。

### 成果物

1. **Validatorパッケージ**（`packages/validator/`）
   - エラーハンドリングシステム（`errors.js`, `messages.js`）
   - スキーマバリデーター（`schema-validator.js`）
   - 参照整合性チェッカー（`reference-validator.js`）
   - コンテンツバリデーター（`content-validator.js`）
   - メタ情報バリデーター（`meta-validator.js`）
   - 統合エントリポイント（`index.js`）

2. **CLIコマンド**
   - `scripts/validate-registry.js` - バリデーションCLI
   - `pnpm validate` - 基本バリデーション
   - `pnpm validate:strict` - 厳格モード
   - `pnpm validate:full` - 完全バリデーション

3. **マイグレーションシステム**
   - `scripts/migrate-to-registry.js` - 自動移行スクリプト
   - `docs/new-generator-plan/migration-design.md` - 設計文書

4. **本番レジストリデータ**
   - `registry/docs.json` - 3プロジェクト、36ドキュメント

5. **CI統合**
   - `.github/workflows/validate-registry.yml` - 自動バリデーション

### 主要な設計判断

#### 1. スキーマ参照解決の方式

**決定**: スキーマの `$id` をファイルパスベース形式に統一。

**経緯**:
- 当初はURL形式（`https://libx.dev/schemas/docs.schema.json`）を使用
- Ajvの相対参照解決で問題が発生（`can't resolve reference`）
- 複数の解決策を試行（非同期loadSchema、登録順序調整、重複登録）

**最終的な解決策**:
```json
// 修正前（URL形式）
"$id": "https://libx.dev/schemas/docs.schema.json"

// 修正後（ファイルパスベース）
"$id": "docs.schema.json"
```

**対象ファイル**:
- `registry/docs.schema.json` → `$id: "docs.schema.json"`
- `registry/schema/*.schema.json` (6ファイル) → `$id: "schema/{filename}"`
- `registry/schema/partials/*.schema.json` (5ファイル) → `$id: "schema/partials/{filename}"`

**根拠**:
- Ajvの相対参照解決と親和性が高い
- シンプルで確実な実装
- ファイル構造との整合性が明確

**代替案検討**:
- URL形式 + 非同期loadSchema: 複雑性が増し、エラーハンドリングが困難
- 完全修飾URL: 外部公開時の制約、ローカル開発での不便さ

**今後の対応**:
- スキーマを外部公開する際は再検討する可能性あり
- 現時点では内部利用に最適化した形式を採用

#### 2. エラーメッセージの日本語化

**決定**: すべてのバリデーションエラーメッセージを日本語で提供。

**根拠**:
- プロジェクトのメイン言語が日本語
- ユーザーフレンドリーなCLI体験の重視
- 技術的な用語と日本語説明のバランスを考慮

**実装方針**:
- エラーコード体系の整備（40種類以上）
- エラーメッセージとヒントの両方を日本語化
- プレースホルダー置換機能（`{field}`, `{value}` など）
- カラー出力対応（エラー: 赤、警告: 黄、情報: 青）

**英語対応**:
- 将来的な拡張として言語ファイル分離の余地を残す
- i18n対応のフレームワーク準備

**エラーコード分類**:
- スキーマ検証: `SCHEMA_*`
- プロジェクト: `PROJECT_*`
- 言語: `LANGUAGE_*`
- バージョン: `VERSION_*`
- ドキュメント: `DOCUMENT_*`
- コンテンツ: `CONTENT_*`
- カテゴリ: `CATEGORY_*`
- メタ情報: `META_*`, `VISIBILITY_*`

#### 3. バリデーションの段階的実行

**決定**: スキーマエラー時は後続バリデーションをスキップし、段階的に実行。

**実行順序**:
1. スキーマバリデーション（Ajv）
2. 参照整合性チェック
3. コンテンツファイルチェック（オプション）
4. メタ情報チェック

**根拠**:
- スキーマ不正時の大量エラー出力を防ぐ
- ユーザーに最も重要なエラーを先に提示
- パフォーマンスの最適化（早期終了）

**例外**:
- `--strict` モード時も同じ順序で実行
- 警告は蓄積し、最後にまとめて表示

#### 4. strictモードの実装

**決定**: デフォルトは警告を許容し、`--strict` で警告もエラー扱い。

**根拠**:
- 開発中は柔軟に、本番環境では厳格に運用可能
- 段階的な品質向上をサポート
- CI/CDでの使い分けが容易

**使い分け**:
- **開発時**: `pnpm validate` - 警告を許容、エラーのみ失敗
- **プルリクエスト**: `pnpm validate:strict` - 警告もエラー扱い
- **定期検査**: `pnpm validate:full` - syncHashも含む完全チェック

**strictモードで追加される検証**:
- `visibility` と `status` の組み合わせチェック
- 推奨フィールドの欠落チェック
- 警告レベルのメタ情報チェック（keywords/tags上限）

#### 5. syncHash のオプション化

**決定**: syncHash チェックはデフォルト無効、`--check-sync-hash` で有効化。

**根拠**:
- パフォーマンスへの配慮（全ファイル読み込みとSHA-256計算が必要）
- 通常のバリデーションでは不要な場合が多い
- マイグレーション直後やコンテンツ更新時の検証で有用

**実装**:
- SHA-256ハッシュ計算（先頭16文字使用）
- ファイル内容の読み込みとハッシュ比較
- 不一致時は警告レベルで報告（致命的エラーではない）

**使用例**:
```bash
# syncHash チェック付き
pnpm validate:full

# マイグレーション直後の検証
node scripts/migrate-to-registry.js --validate
pnpm validate:full
```

#### 6. マイグレーションデータマッピング戦略

**決定**: 既存設定ファイルとの高い互換性を保ちつつ、新スキーマの要件を満たす。

**マッピング方針**:

1. **基本情報の統合**
   - `baseUrl` → `id`（`/docs/` 以降を抽出）
   - 多言語フィールドの集約（`translations[lang].displayName` → `displayName[lang]`）

2. **言語設定の自動生成**
   - `supportedLangs` → `languages[]`
   - `defaultLang` → `default: true`
   - フォールバック言語の自動設定（非デフォルト言語 → デフォルト言語）
   - `status: "active"` で初期化

3. **バージョンステータスの自動変換**
   - `isLatest: true` → `status: "active"`
   - `isLatest: false` → `status: "deprecated"`
   - `date` フィールド名の修正（設計では `releaseDate`、実装では `date`）

4. **カテゴリの自動整形**
   - 多言語翻訳の集約（`translations[lang].categories` → `titles[lang]`）
   - `order` の自動採番（定義順に1から）

5. **ライセンス情報の変換**
   - `sources[].license` → `name`
   - `sources[].licenseUrl` → `url`
   - `attribution` を文字列形式に統合（"Title by Author (URL)"）
   - `sourceLanguage` フィールドは削除（スキーマに存在しないため）

**柔軟性の確保**:
- `--dry-run` でプレビュー可能
- `--validate` でマイグレーション結果を即座に検証
- エラー時の詳細なログ出力
- デフォルト値の自動補完（必須フィールド欠落時）

**実装時の修正点**:
- バージョンフィールド名: `releaseDate` → `date`（スキーマに準拠）
- ライセンスattribution: オブジェクト型 → 文字列型
- バリデーションメソッド: `formatText()` → `toString()`

#### 7. CI統合のトリガー設計

**決定**: レジストリ・バリデーター関連ファイルの変更時のみ実行。

**トリガー条件**:
- `push` イベント（mainブランチ）
- `pull_request` イベント（mainブランチへの変更）
- `workflow_dispatch`（手動実行）

**パスフィルター**:
- `registry/**` - レジストリファイル
- `packages/validator/**` - バリデーターコード
- `scripts/validate-registry.js` - CLIスクリプト
- `scripts/migrate-to-registry.js` - マイグレーションスクリプト

**根拠**:
- 不要なCI実行を避け、リソースを節約
- レジストリ品質に関係する変更のみを検証
- 既存のCloudflare Pagesデプロイワークフローと独立

**ジョブ構成**:
1. `validate-basic`: 基本バリデーション（必須）
2. `validate-strict`: 厳格モードバリデーション（必須）
3. `validate-full`: 完全バリデーション（警告のみ、`continue-on-error: true`）
4. `validate-report`: JSONレポート生成（プルリクエスト時のみ）

**既存CIとの整合性**:
- 同じNode.jsバージョン（20）
- 同じpnpmバージョン（9）
- 同じsetupアクション（`actions/checkout@v4`, `pnpm/action-setup@v4`, `actions/setup-node@v4`）

### マイグレーション結果

**移行済みプロジェクト**:

1. **sample-docs**: 13ドキュメント、2言語、2バージョン
2. **test-verification**: 3ドキュメント、3言語、2バージョン
3. **libx-docs**: 20ドキュメント、2言語、1バージョン

**合計**: 3プロジェクト、36ドキュメント

**バリデーション結果**: 全件成功（スキーマ、参照整合性、ID重複チェック）

### 今後の対応

1. **フェーズ1-3への移行**
   - CLIコマンド群の実装（add, update, remove, list等）
   - 検証コマンドの機能拡張（fix, check）
   - ユーティリティコマンド（info, search, export）

2. **パフォーマンス最適化**
   - 大量ドキュメント時のベンチマークテスト
   - キャッシュ機能の検討

3. **ユーザーエクスペリエンス向上**
   - プログレスバー表示
   - プルリクエストコメントへのバリデーション結果投稿
   - TypeScript型定義の自動生成

### 参照ドキュメント

- [フェーズ1-2計画](./phase-1-2-validation-tools.md)
- [フェーズ1-2完了報告書](./status/phase-1-2-completion-report.md)
- [マイグレーション設計](./migration-design.md)

---

## 2025-10-17 Phase 1-3 CLI Core 完成

### 承認内容

**CLI基盤とCRUD系コマンド**を正式承認し、フェーズ1-3（CLI Core詳細計画）を完了とする。

### 成果物

1. **CLIパッケージ**（`packages/cli/`）
   - bin/docs-cli.js - エントリポイント（実行可能）
   - src/index.js - Commander.jsベースのメインロジック
   - src/commands/ - コマンド実装（init, add, validate, list）
   - src/utils/ - 共通ユーティリティ（logger, config, backup, registry）

2. **共通ユーティリティ**
   - logger.js - カラー出力、ログレベル、JSON出力
   - config.js - 設定管理（.docs-cli/config.json）
   - backup.js - バックアップ/ロールバック管理
   - registry.js - レジストリ操作（CRUD）

3. **実装済みコマンド**
   - `docs-cli init` - 設定ファイル初期化
   - `docs-cli add project` - 新規プロジェクト追加
   - `docs-cli add version` - バージョン追加（スタブ）
   - `docs-cli add language` - 言語追加（スタブ）
   - `docs-cli add doc` - ドキュメント追加（スタブ）
   - `docs-cli validate` - レジストリバリデーション
   - `docs-cli list projects/docs/versions/languages` - 一覧表示

4. **ドキュメント**
   - docs/new-generator-plan/guides/docs-cli.md - CLIユーザーガイド
   - packages/cli/README.md - 開発者向けドキュメント

5. **統合**
   - ルートpackage.jsonに`docs-cli`スクリプト追加
   - 依存パッケージインストール（commander, chalk, inquirer, ora）
   - 動作確認テスト完了

### 主要な設計判断

#### 1. コマンドフレームワークの選定

**決定**: **Commander.js**を採用

**根拠**:
- Node.js CLIの業界標準
- サブコマンド、オプション、ヘルプの自動生成
- TypeScript型定義のサポート
- 軽量（依存関係が少ない）

**代替案検討**:
- yargs: 機能は豊富だが、やや重い
- oclif: 大規模CLI向けで今回のユースケースには過剰

**採用理由**:
- シンプルで学習曲線が緩やか
- 既存の多くのNode.jsプロジェクトで実績あり
- 非同期処理との相性が良い

#### 2. CLI配置場所

**決定**: `packages/cli/`にCLIパッケージを作成

**根拠**:
- 既存のvalidator, ui, themeパッケージと同じモノレポ構造
- `@docs/cli`としてパッケージ化
- エントリポイント: `packages/cli/bin/docs-cli.js`（#!/usr/bin/env node）

**ディレクトリ構造**:
```
packages/cli/
├── bin/
│   └── docs-cli.js          # エントリポイント
├── src/
│   ├── index.js             # メインCLIロジック
│   ├── commands/            # コマンド実装
│   │   ├── add/             # addサブコマンド群
│   │   ├── validate.js
│   │   ├── list.js
│   │   └── init.js
│   ├── utils/               # ユーティリティ
│   │   ├── logger.js
│   │   ├── config.js
│   │   ├── backup.js
│   │   └── registry.js
│   └── templates/           # テンプレートファイル（将来）
└── tests/                   # テスト（Phase 2以降）
```

#### 3. グローバルオプション設計

**決定**: すべてのコマンドで共通のオプションを提供

**実装オプション**:
- `--config <path>` - 設定ファイルパス（デフォルト: `.docs-cli/config.json`）
- `--dry-run` - プレビューモード（変更を実行しない）
- `--verbose, -v` - 詳細ログ出力
- `--json` - JSON形式出力
- `--yes, -y` - 対話スキップ（CI用）

**根拠**:
- dry-runモードで安全に変更内容を確認可能
- JSON出力でCI/CD統合が容易
- 非対話モードでCIパイプラインに統合可能

#### 4. バックアップ/ロールバック戦略

**決定**: すべての変更操作で自動バックアップを実施

**実装方針**:
- 変更前のファイルを`.backups/<timestamp>/`に保存
- エラー時は自動ロールバック
- バックアップローテーション（デフォルト: 5世代保持）

**BackupManagerクラス**:
- `backupFile(filePath)` - ファイルをバックアップ
- `recordCreated(path)` - 新規作成パスを記録
- `rollback()` - ロールバック実行
- `static cleanup()` - 古いバックアップ削除

**根拠**:
- 既存のadd-language.jsで実証済みの安全なパターン
- 失敗時のリカバリー手順が明確
- ユーザーの誤操作からの保護

#### 5. 設定管理方式

**決定**: `.docs-cli/config.json`と環境変数の併用

**優先順位**:
1. コマンドラインオプション
2. 環境変数
3. .docs-cli/config.json
4. デフォルト値

**環境変数**:
- `DOCS_CLI_CONFIG` - 設定ファイルパス
- `DOCS_CLI_NON_INTERACTIVE` - 非対話モード
- `DOCS_CLI_LOG_LEVEL` - ログレベル
- `DOCS_CLI_REGISTRY_PATH` - レジストリパス

**根拠**:
- 柔軟な設定方法を提供
- CI/CD環境での使いやすさを重視
- 環境ごとの設定切り替えが容易

#### 6. ロガー設計

**決定**: カスタムLoggerクラスを実装

**機能**:
- ログレベル（DEBUG, INFO, WARN, ERROR, SILENT）
- カラー出力（chalk使用）
- JSON出力モード
- プログレス表示（progress, progressDone, progressFail）

**根拠**:
- 既存のvalidate-registry.jsで使用していたパターンを統一
- ユーザーフレンドリーな視覚的フィードバック
- CI/CDでのログ解析に対応

#### 7. レジストリ操作の抽象化

**決定**: RegistryManagerクラスでCRUD操作を統一

**主要メソッド**:
- `load()`, `save()` - 読み込み/保存
- `findProject()`, `addProject()`, `updateProject()`, `removeProject()`
- `findDocument()`, `addDocument()`, `updateDocument()`, `removeDocument()`
- `addVersion()`, `addLanguage()`
- `getNextDocId()` - 次のドキュメントID生成
- `validate()` - バリデーション実行

**根拠**:
- レジストリ操作ロジックを一箇所に集約
- バリデーション統合で品質保証
- 各コマンドでの実装重複を排除

### 動作確認結果

#### テスト実行

```bash
# バージョン確認
$ pnpm docs-cli --version
1.0.0

# プロジェクト一覧表示
$ pnpm docs-cli list projects
📦 プロジェクト一覧 (3件)
  test-verification - 検証テスト
  sample-docs - サンプルドキュメント
  libx-docs - LibX ドキュメント

# レジストリバリデーション
$ pnpm docs-cli validate
✅ バリデーション成功！問題は見つかりませんでした
エラー: 0件
警告: 0件
```

#### 実装状況

**完全実装**:
- ✅ init コマンド
- ✅ add project コマンド
- ✅ validate コマンド
- ✅ list コマンド（projects, docs, versions, languages）

**スタブ実装**（Phase 1-4以降で完全実装予定）:
- ⏸️ add version コマンド
- ⏸️ add language コマンド
- ⏸️ add doc コマンド

### 今後の対応

1. **Phase 1-4への移行**
   - add version, add language, add docの完全実装
   - 既存スクリプト（add-language.js等）からのロジック移植
   - update, removeコマンド群の実装

2. **テストスイート拡充**
   - ユニットテスト（各ユーティリティ関数）
   - 統合テスト（エンドツーエンドフロー）
   - CI統合テスト

3. **機能拡張**
   - search コマンド
   - export コマンド
   - migrate コマンドの詳細化（Phase 3連携）

### 参照ドキュメント

- [Phase 1-3計画](./phase-1-3-cli-core.md)
- [CLIユーザーガイド](./guides/docs-cli.md)
- [packages/cli/README.md](../../packages/cli/README.md)

---

## 2025-10-17 Phase 1-4 (Week 1) - スタブコマンド完全実装完了

### 承認内容

**add version, add language, add doc コマンドの完全実装**を完了し、Week 1のタスクを達成。

### 成果物

1. **add version コマンド（packages/cli/src/commands/add/version.js）**
   - バージョンID検証（v1, v2.0, v2.1形式）
   - 前バージョンからのコンテンツ自動コピー機能
   - ディレクトリ再帰コピー機能（copyDirectoryRecursive）
   - 最新バージョンフラグ（isLatest）の自動更新
   - 全言語対応のディレクトリ構造自動作成
   - 対話式/非対話式モード完全サポート
   - dry-run、バックアップ、ロールバック機能統合

2. **add language コマンド（packages/cli/src/commands/add/language.js）**
   - 15言語サポート（en, ja, zh-Hans, zh-Hant, es, pt-BR, ko, de, fr, ru, ar, id, tr, hi, vi）
   - テンプレート言語からの自動コピー機能
   - 翻訳マーカー自動挿入（`<!-- TODO: XX - この文書は翻訳が必要です -->`）
   - デフォルト言語/フォールバック言語の自動設定
   - 全バージョン対応のディレクトリ構造自動作成
   - 対話式/非対話式モード完全サポート
   - dry-run、バックアップ、ロールバック機能統合

3. **add doc コマンド（packages/cli/src/commands/add/doc.js）**
   - 自動ドキュメントID生成（project-001, project-002...）
   - スラッグバリデーション（小文字英数字、ハイフン、スラッシュ）
   - 全言語対応のMDXファイル自動生成
   - フロントマター付きテンプレート生成（docId, lang, title, summary, keywords, tags, category）
   - カテゴリへの自動追加（order自動採番）
   - レジストリへの自動登録
   - 対話式/非対話式モード完全サポート
   - dry-run、バックアップ、ロールバック機能統合

4. **CLIガイド更新（docs/new-generator-plan/guides/docs-cli.md）**
   - add version, add language, add docコマンドのドキュメントを「実装中」→「完全実装済み✅」に更新
   - 主要機能リストの追加
   - 詳細な使用例の追加
   - オプション説明の更新

### 主要な設計判断

#### 1. コンテンツコピー機能の実装方針

**決定**: 再帰的ディレクトリコピーを共通関数として実装

**根拠**:
- add versionとadd languageで同じロジックが必要
- 既存の`scripts/create-version.js`と`scripts/add-language.js`からパターンを踏襲
- ファイル種別に応じた処理分岐（MDX/MD vs その他）

**実装詳細**:
```javascript
// add version: copyDirectoryRecursive()
// add language: copyDirectoryWithTranslationMarkers()
```

#### 2. 翻訳マーカーの実装方式

**決定**: MDXフロントマター直後にHTMLコメントを挿入

**形式**: `<!-- TODO: {LANG_CODE} - この文書は翻訳が必要です -->`

**根拠**:
- 視覚的に分かりやすい
- MDXレンダリングに影響しない
- grepで簡単に検索可能（`grep -r "TODO: KO"`）

**実装場所**: `addTranslationMarkers(content, langCode)`

#### 3. ドキュメントID生成戦略

**決定**: プロジェクトIDをプレフィックスとした連番形式（project-001, project-002...）

**根拠**:
- プロジェクト間で一意性を保証
- ソート可能で管理しやすい
- 既存のRegistryManager.getNextDocId()メソッドを活用

**フォーマット**: `{projectId}-{3桁の連番}`

**実装詳細**:
- 既存ドキュメントIDから最大番号を取得
- 次の番号を3桁ゼロ埋めで生成

#### 4. MDXテンプレートの構造

**決定**: フロントマターに必須フィールドとオプショナルフィールドを含める

**必須フィールド**:
- title: ドキュメントタイトル
- summary: 概要
- docId: ドキュメントID
- lang: 言語コード

**オプショナルフィールド**:
- keywords: キーワード配列
- tags: タグ配列
- category: カテゴリID

**根拠**:
- Astroのフロントマターパースと互換性
- 検索エンジン最適化（SEO）対応
- 将来的なメタデータ拡張に対応

#### 5. 非対話式モードの実装戦略

**決定**: 3つの方法で非対話モードを判定

1. `--yes`/`-y` グローバルオプション
2. `--auto-template` コマンド固有オプション（add languageのみ）
3. `DOCS_CLI_NON_INTERACTIVE=true` 環境変数

**根拠**:
- CI/CD環境での自動実行をサポート
- 既存の`scripts/add-language.js`のパターンを踏襲
- 柔軟な運用方法を提供

**実装パターン**:
```javascript
const nonInteractive = cmdOpts.yes || cmdOpts.autoTemplate || process.env.DOCS_CLI_NON_INTERACTIVE === 'true';
```

#### 6. バックアップとロールバック統合

**決定**: すべてのaddコマンドでBackupManagerを統一的に使用

**バックアップ対象**:
- レジストリファイル（registry/docs.json）
- 作成されたファイル・ディレクトリ（recordCreated）

**ロールバックトリガー**:
- エラー発生時に自動実行（CLI本体で処理）
- バックアップから元のファイルを復元
- 作成されたファイルを削除

**利点**:
- データ整合性の保証
- 安全な試行錯誤
- 失敗時の確実な復旧

### 動作確認結果

**実施日**: 2025年10月17日

**確認項目**:
1. ✅ add version --help - オプション表示正常
2. ✅ add language --help - オプション表示正常（15言語リスト表示）
3. ✅ add doc --help - オプション表示正常

**未実施の動作確認**（次のタスク）:
- 実際のプロジェクトでの実行テスト
- エラーケースの確認
- バックアップ/ロールバック機能の検証

### 次のステップ

**Week 1残り**:
- スタブコマンドの実動作確認
- エラーハンドリングの改善
- ドキュメントの最終確認

**Week 2以降**（Phase 1-4継続）:
- update/removeコマンド群の実装
- テストスイート構築（Vitest、ユニットテスト、統合テスト）
- CI統合（GitHub Actions）
- 機能拡張（search, export コマンド）

### 参照ドキュメント

- [Phase 1-4計画](./phase-1-4-testing-ci.md)
- [CLIユーザーガイド](./guides/docs-cli.md)（更新済み）
- [Phase 1-3完了報告書](./status/phase-1-3-completion-report.md)

---

**記録者**: Claude
**承認者**: 未定（Week 1完了時に確認）
**次回レビュー**: Week 1完了時（動作確認後）
