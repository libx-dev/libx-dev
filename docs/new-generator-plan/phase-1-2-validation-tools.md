# フェーズ1-2：バリデーションツール詳細計画

**ステータス**: 🟢 Week 1完了 / Week 2-3進行中（マイグレーション設計完了）
**最終更新**: 2025-10-16（セッション2）

## 目的
- JSON スキーマと実ファイル構造の整合性を常時検証できるツールチェーンを整備し、フェーズ2以降の自動化基盤を支える。
- CLI と CI の双方から同一ロジックを呼び出せるよう共通ライブラリ化し、再利用性と保守性を高める。

## スコープ
- Ajv ベースのスキーマ検証モジュール（`packages/validator` を想定）。
- レジストリと `content/` ディレクトリの対応関係チェック（言語・バージョン・ファイル存在・命名規則）。
- Pagefind/Glossary/Visibility/翻訳ステータスなどメタ情報の整合性検証。
- CLI `validate` コマンドおよび CI で利用する API の整備。

## タスク
1. **Validator ライブラリ設計**  
   - `src/validator/index.ts` にエントリポイントを用意し、`validateRegistry`, `validateContent`, `validateMeta` をエクスポート。  
   - エラーを `ValidationError` クラス（code, message, hint, path を含む）として統一フォーマット化。
2. **レジストリ検証実装**  
   - Ajv を用いて `docs.schema.json` をコンパイルし、`$schemaVersion` の適合性チェックを追加。  
   - 未使用プロジェクト ID や重複 slug の検出ロジックを実装。
3. **コンテンツ検証実装**  
   - `content/<docId>/<lang>.mdx` の存在確認、`status` と実ファイル有無の一致チェック。  
   - `syncHash` の再計算と差分検出（フェーズ3のマイグレーションでも利用）。
4. **メタ情報検証実装**  
   - Pagefind 用 metadata（keywords/tags）の存在と型検証。  
   - Glossary の重複チェック、Term/Slug の整合性。  
   - Visibility や Draft コンテンツのビルド除外ルール検証。
5. **CLI 連携**  
   - `docs-cli validate` に `--strict`, `--report=json`, `--fix` オプションを実装。  
   - レポート出力を CLI 標準出力と JSON ファイル保存の両対応にする。
6. **テストと CI 連携**  
   - ユニットテスト（正常系/異常系）、スナップショットテスト（エラーメッセージ）を用意。  
   - GitHub Actions で `pnpm validate` を実行し、失敗時のログフォーマットを確認。  
   - `docs/new-generator-plan/examples/ci.md` に実行例を追記。

## 成果物
- `packages/validator/` または同等の共有モジュール。
- CLI `validate` サブコマンド（`docs-cli`）。
- ブリッジ用ユーティリティ（`scripts/validate-content.js` からの移行ラッパー）。
- テストスイートと CI ワークフロー更新。
- エラーフォーマットガイド（ドキュメント化）。

## 完了条件
- ✅ `packages/validator` が全モジュールを実装完了。
- ✅ `scripts/validate-registry.js` がサンプルデータを正常に検証（**スキーマ参照問題を解決済み**）。
- ✅ `package.json` にバリデーションコマンドを追加（`pnpm validate` 系統）。
- ✅ マイグレーションスクリプトの設計完了（`docs/new-generator-plan/migration-design.md`）。
- ⏳ CI 上での `validate` 実行が安定し、失敗時にエラーログが判読可能。
- ⏳ 旧スクリプト利用者向けラッパーが用意され、フェーズ3の移行作業で再利用できる。

---

## 進捗状況（2025年10月16日更新）

---

## 📅 Week 1 完了サマリー（2025-10-16）

### 🎯 達成事項

Week 1の最優先タスク「**スキーマ参照問題の解決**」を完了し、バリデーションツールが正常に動作するようになりました。

#### ✅ 完了したタスク

1. **スキーマ参照問題の完全解決**
   - 全12ファイルのスキーマ`$id`をファイルパスベース形式に統一
   - `packages/validator/src/schema-validator.js` の参照解決ロジック修正
   - バリデーション成功を確認（基本モード・strictモード）

2. **package.jsonへのコマンド追加**
   - `pnpm validate` - 基本バリデーション
   - `pnpm validate:strict` - 厳格モード（警告もエラー扱い）
   - `pnpm validate:full` - コンテンツ+syncHashチェック

3. **マイグレーションスクリプトの設計**
   - `docs/new-generator-plan/migration-design.md` 作成
   - データマッピング仕様の詳細化
   - CLIオプション設計完了
   - テスト計画策定

#### 🔧 技術的な決定

**スキーマ$id形式の最終決定**: ファイルパスベース形式を採用

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

**理由**:
- Ajvの相対参照解決と親和性が高い
- シンプルで確実な実装
- ファイル構造との整合性が明確

**今後の対応**:
- スキーマを公開する際は再検討する可能性あり
- 現時点では内部利用に最適化

#### 📊 バリデーション動作確認

```bash
# 基本モード - 成功
$ pnpm validate
✓ バリデーション成功

# 厳格モード - 成功
$ pnpm validate:strict
⚠ 厳格モードが有効です（警告もエラーとして扱います）
✓ バリデーション成功
```

---

### ✅ 完了した作業（詳細）

#### 1. `packages/validator` パッケージ基盤構築

- **完了日**: 2025-10-16
- **成果物**:
  - `packages/validator/package.json` - パッケージ定義
  - `packages/validator/src/` - ソースディレクトリ構造

#### 2. ValidationError クラスと日本語エラーメッセージシステム

- **完了日**: 2025-10-16
- **成果物**:
  - `packages/validator/src/errors.js`
    - `ValidationError` クラス - エラーコード、メッセージ、ヒント、パスを含む統一フォーマット
    - `ValidationWarning` クラス - 警告レベルのエラー
    - `ValidationErrorCollection` クラス - 複数エラーの集約管理
    - JSON/テキスト出力、カラー対応
  - `packages/validator/src/messages.js`
    - 40種類以上のエラーコード定義
    - 日本語メッセージとヒント
    - プレースホルダー置換機能

**主要エラーコード**:
- スキーマ検証: `SCHEMA_INVALID`, `SCHEMA_VERSION_INCOMPATIBLE`
- プロジェクト: `PROJECT_ID_DUPLICATE`, `PROJECT_REQUIRED_FIELD_MISSING`
- 言語: `LANGUAGE_NOT_FOUND`, `LANGUAGE_DEFAULT_MULTIPLE`
- バージョン: `VERSION_NOT_FOUND`, `VERSION_LATEST_MULTIPLE`
- ドキュメント: `DOCUMENT_ID_DUPLICATE`, `DOCUMENT_NOT_FOUND`
- コンテンツ: `CONTENT_FILE_NOT_FOUND`, `CONTENT_SYNCHASH_MISMATCH`
- カテゴリ: `CATEGORY_CIRCULAR_REFERENCE`, `CATEGORY_DOCUMENT_NOT_FOUND`
- メタ情報: `META_KEYWORDS_EXCESSIVE`, `VISIBILITY_STATUS_CONFLICT`

#### 3. Ajv統合スキーマバリデーター

- **完了日**: 2025-10-16
- **成果物**: `packages/validator/src/schema-validator.js`
- **機能**:
  - Ajv 2020 + ajv-formats 統合
  - `$schemaVersion` の存在確認と互換性チェック
  - サポートバージョン: `['1.0.0']`
  - スキーマファイルの自動読み込み（11ファイル対応）
  - Ajvエラーの日本語ValidationErrorへの変換
  - `loadSchemaByUri` による非同期スキーマ読み込み対応

**検証内容**:
- 必須フィールドチェック (`required`)
- 型チェック (`type`)
- パターンマッチング (`pattern`)
- 列挙値チェック (`enum`)
- 配列・プロパティ数チェック (`minItems`, `minProperties`)

#### 4. 参照整合性チェッカー

- **完了日**: 2025-10-16
- **成果物**: `packages/validator/src/reference-validator.js`
- **機能**:
  - プロジェクトID重複チェック
  - ドキュメントID・スラッグ重複チェック
  - バージョン参照の存在確認 (`documents[].versions` → `projects[].versions[].id`)
  - 言語参照の存在確認 (`documents[].content[lang]` → `projects[].languages[].code`)
  - ライセンス参照の存在確認 (`documents[].license` → `projects[].licenses[].id`)
  - カテゴリ内ドキュメント参照チェック (`categories[].docs[docId]` → `documents[].id`)
  - 用語集の関連ドキュメントチェック (`glossary[].relatedDocs[docId]`)
  - カテゴリ循環参照検出
  - デフォルト言語・最新バージョンの重複/欠落チェック
  - `visibility` と `status` の組み合わせチェック（strictモード）

#### 5. コンテンツファイルバリデーター

- **完了日**: 2025-10-16
- **成果物**: `packages/validator/src/content-validator.js`
- **機能**:
  - `documents[].content[lang].path` のファイル存在確認
  - `status` と実ファイル有無の一致チェック
  - `syncHash` の再計算と差分検出（オプション）
  - SHA-256 ハッシュ計算（先頭16文字使用）
  - `recalculateSyncHashes()` メソッドでレジストリ更新機能

#### 6. メタ情報バリデーター

- **完了日**: 2025-10-16
- **成果物**: `packages/validator/src/meta-validator.js`
- **機能**:
  - `keywords` 数チェック（デフォルト最大: 10）
  - `tags` 数チェック（デフォルト最大: 10）
  - 警告レベルでの過剰メタデータ検出

#### 7. バリデーター統合エントリポイント

- **完了日**: 2025-10-16
- **成果物**: `packages/validator/src/index.js`
- **機能**:
  - すべてのバリデーターのエクスポート
  - `validateRegistry()` 統合関数
    - スキーマ → 参照整合性 → コンテンツ → メタ情報の順で実行
    - スキーマエラー時は後続バリデーションをスキップ
  - `generateSummary()` レポート生成関数
  - エラーコレクションのマージ機能

**バリデーションオプション**:

```javascript
{
  projectRoot: '/path/to/project',  // プロジェクトルート
  strict: false,                     // 警告もエラー扱い
  checkContent: true,                // コンテンツファイルチェック
  checkSyncHash: false,              // syncHash チェック
  maxKeywords: 10,                   // keywords 最大数
  maxTags: 10,                       // tags 最大数
}
```

#### 8. CLIコマンド実装

- **完了日**: 2025-10-16
- **成果物**: `scripts/validate-registry.js`
- **機能**:
  - カラー出力対応（エラー/警告/情報の色分け）
  - テキスト・JSON形式レポート出力
  - プログレスバー表示準備
  - 終了コード対応（成功: 0, 失敗: 1）

**CLIオプション**:

```bash
node scripts/validate-registry.js [registry-path] [options]

オプション:
  --strict              厳格モード（警告もエラー扱い）
  --report=<format>     レポート形式（text | json）
  --check-content       コンテンツファイルチェック
  --check-sync-hash     syncHash チェック
  --help, -h            ヘルプ表示
```

### ✅ 解決済み: スキーマ参照問題

#### 問題の概要

- **問題**: ルートスキーマの `$id` がURL形式（`https://libx.dev/schemas/docs.schema.json`）のため、相対パス参照（`./schema/project.schema.json`）が正しく解決されない
- **エラー**: `can't resolve reference ./schema/project.schema.json from id https://libx.dev/schemas/docs.schema.json`

#### 試行した解決策

1. ✅ `loadSchema` オプションで非同期読み込み実装 → 効果なし
2. ✅ スキーマ登録順序の調整 → 効果なし
3. ✅ $idと相対パスの両方で登録 → 部分的成功

#### 最終的な解決策

**アプローチ**: スキーマの `$id` をファイルパスベース形式に統一

**実装内容**:
1. 全スキーマファイルの`$id`をファイルパス形式に変更（12ファイル）
2. `schema-validator.js`で`addSchema(schema)`により`$id`を使用した自動登録
3. 非同期`loadSchema`オプションを削除し、同期的な事前ロードに統一

**結果**: ✅ バリデーションが正常に動作

**記録日**: 2025-10-16

### ✅ Week 1 で前倒し完了した作業

#### 9. package.json へのコマンド追加

- **完了日**: 2025-10-16
- **成果物**: [package.json](../../package.json) への追加

```json
{
  "scripts": {
    "validate": "node scripts/validate-registry.js",
    "validate:strict": "node scripts/validate-registry.js --strict",
    "validate:full": "node scripts/validate-registry.js --check-content --check-sync-hash"
  }
}
```

**動作確認**:
```bash
$ pnpm validate        # ✅ 成功
$ pnpm validate:strict # ✅ 成功
```

#### 10. マイグレーションスクリプト設計

- **完了日**: 2025-10-16
- **成果物**: [migration-design.md](./migration-design.md)
- **内容**:
  - データマッピング仕様（5セクション）
    1. プロジェクト基本情報
    2. 言語設定
    3. バージョン設定
    4. カテゴリ設定
    5. ライセンス情報
  - ドキュメントコンテンツのスキャンロジック
  - CLIオプション設計
  - 実行フロー詳細
  - エラーハンドリング戦略
  - テスト計画

---

### ⏳ 未着手の作業（Week 2-4）

#### 11. テストスイートの作成

- **予定**: Week 2（任意 - 時間があれば）
- **内容**:
  - 各バリデーターのユニットテスト
  - 正常系/異常系のテストケース
  - エラーメッセージのスナップショットテスト
  - テストフィクスチャの作成

#### 12. マイグレーションスクリプト実装

- **予定**: Week 2-3（次のステップ）
- **優先度**: 🔴 高
- **内容**:
  - `scripts/migrate-to-registry.js` の作成
  - `apps/*/src/config/project.config.json` からのデータ抽出
  - `registry/docs.json` への変換ロジック
  - 既存プロジェクト（sample-docs, test-verification, libx-docs）のマッピング
  - `--dry-run`, `--validate`, `--project` オプション実装
  - フロントマター解析（gray-matter使用）
  - エラーハンドリングとログ出力

**設計文書**: [migration-design.md](./migration-design.md) ✅ 完成

#### 13. レジストリデータ初期生成

- **予定**: Week 3
- **優先度**: 🔴 高
- **内容**:
  - `registry/docs.json` の本番用データ生成
  - `registry/examples/sample-docs-full.json` の完全サンプル作成
  - 既存プロジェクトのコンテンツスキャン
  - バリデーションによる検証

#### 14. CI統合

- **予定**: Week 4
- **優先度**: 🟡 中
- **内容**:
  - `.github/workflows/validate-registry.yml` の作成
  - プッシュ/プルリクエスト時の自動バリデーション
  - エラーログのフォーマット確認
  - ステータスバッジの追加
  - レジストリファイル変更時のみ実行するトリガー設定

#### 15. Phase 1-2完了報告書作成

- **予定**: Week 4（フェーズ完了時）
- **優先度**: 🔴 高
- **内容**:
  - 成果物のまとめ
  - 技術的な設計判断の記録
  - 次フェーズへの引き継ぎ事項
  - リスクと対策の記録
  - 振り返りとレッスンラーンド

---

## 📋 次のステップ（優先順位順）

### ✅ Week 1 完了タスク（振り返り）

1. ✅ スキーマ参照問題の完全解決
2. ✅ package.jsonへのコマンド追加
3. ✅ マイグレーションスクリプトの設計完了
4. ✅ バリデーション動作確認（基本・strict）

---

### 🔴 Week 2-3: マイグレーション実装（最優先）

#### タスク12: マイグレーションスクリプト実装

**目標**: `scripts/migrate-to-registry.js` の完全実装

**実装内容**:

1. **CLIインターフェース構築**
   ```bash
   node scripts/migrate-to-registry.js [options]

   オプション:
     --project=<name>   特定プロジェクトのみ移行
     --dry-run          プレビューのみ
     --validate         変換後バリデーション実行
     --output=<path>    出力先指定
     --force            既存ファイル上書き
   ```

2. **データ変換ロジック**
   - プロジェクト基本情報のマッピング
   - 言語設定の変換
   - バージョン設定の変換
   - カテゴリ設定の変換
   - ライセンス情報の変換

3. **コンテンツスキャン機能**
   - `src/content/docs/` 配下のMDXファイル検索
   - フロントマター解析（gray-matter使用）
   - ドキュメントエントリの自動生成
   - バージョン・言語の関連付け

4. **エラーハンドリング**
   - 必須フィールド欠落時の警告とデフォルト値補完
   - ファイル読み込みエラーの適切な処理
   - バリデーションエラーの詳細表示

**成果物**:
- ✅ 設計書: `docs/new-generator-plan/migration-design.md`
- ⏳ 実装: `scripts/migrate-to-registry.js`
- ⏳ テスト実行: dry-runモードでの動作確認

**推定工数**: 2-3日

---

#### タスク13: レジストリデータ初期生成

**目標**: 既存プロジェクトからのレジストリ生成

**実行手順**:

1. **dry-runモードでプレビュー**
   ```bash
   node scripts/migrate-to-registry.js --dry-run
   ```

2. **特定プロジェクトでテスト**
   ```bash
   node scripts/migrate-to-registry.js --project=sample-docs --validate --output=registry/test-sample-docs.json
   ```

3. **全プロジェクトの統合**
   ```bash
   node scripts/migrate-to-registry.js --validate --output=registry/docs.json
   ```

4. **バリデーション確認**
   ```bash
   pnpm validate
   pnpm validate:full
   ```

**成果物**:
- `registry/docs.json` - 本番用レジストリデータ
- `registry/examples/sample-docs-full.json` - 完全サンプル

**推定工数**: 1-2日

---

### 🟡 Week 4: CI統合と完了報告（中優先）

#### タスク14: CI統合

**目標**: GitHub ActionsでのバリデーションCI構築

**実装内容**:

**ファイル**: `.github/workflows/validate-registry.yml`

```yaml
name: Validate Registry

on:
  push:
    branches: [main]
    paths:
      - 'registry/**'
      - 'packages/validator/**'
      - 'scripts/validate-registry.js'
  pull_request:
    paths:
      - 'registry/**'
      - 'packages/validator/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm validate:strict
```

**推定工数**: 半日

---

#### タスク15: Phase 1-2完了報告書作成

**目標**: フェーズの成果と学びを文書化

**ファイル**: `docs/new-generator-plan/status/phase-1-2-completion-report.md`

**内容**:
1. エグゼクティブサマリー
2. タスク完了状況
3. 成果物詳細
4. 技術的な設計判断
5. 承認記録
6. 次のステップ（フェーズ1-3）
7. 振り返りとレッスンラーンド

**推定工数**: 1日

---

### ⏸️ 低優先（任意 - 時間があれば）

#### タスク11: テストスイートの作成

- 各バリデーターのユニットテスト
- 正常系/異常系のテストケース
- スナップショットテスト

**備考**: CI統合が優先。テストはPhase 2以降で拡充可能。

---

## 🗓️ スケジュール見積もり

| 週 | タスク | 推定工数 | ステータス |
|----|--------|----------|-----------|
| Week 1 | スキーマ参照問題解決 + package.json + 設計 | 2-3日 | ✅ 完了 |
| Week 2 | マイグレーションスクリプト実装 | 2-3日 | ⏳ 次回 |
| Week 3 | レジストリ初期データ生成 + テスト | 1-2日 | ⏳ 予定 |
| Week 4 | CI統合 + 完了報告書 | 1.5日 | ⏳ 予定 |

**合計推定**: 約2-3週間

---

## 🎯 次のセッションの推奨作業

### 最優先タスク

1. **マイグレーションスクリプト実装開始**
   - `scripts/migrate-to-registry.js` の骨格作成
   - CLIオプション解析の実装
   - プロジェクト検出ロジックの実装

2. **既存プロジェクトの詳細分析**
   - `apps/sample-docs/src/config/project.config.json` の構造確認
   - `apps/sample-docs/src/content/docs/` のディレクトリ構造調査
   - MDXフロントマターのサンプル収集

3. **データ変換ロジックの実装**
   - プロジェクト基本情報のマッピング関数
   - 言語設定の変換関数
   - バージョン設定の変換関数

### 推奨コマンド

```bash
# 既存プロジェクト構造の確認
ls -R apps/sample-docs/src/content/docs/
cat apps/sample-docs/src/config/project.config.json

# マイグレーションスクリプトの作成開始
touch scripts/migrate-to-registry.js
chmod +x scripts/migrate-to-registry.js
```

---

## 技術的な決定事項

### 1. エラーメッセージの日本語化

**決定**: すべてのエラーメッセージを日本語で提供し、英語は将来的な拡張として残す。

**理由**:


- プロジェクトのメイン言語が日本語
- ユーザーフレンドリーなCLI体験の重視

### 2. バリデーションの段階的実行

**決定**: スキーマエラー時は後続バリデーションをスキップ。

**理由**:


- スキーマ不正時の大量エラー出力を防ぐ
- ユーザーに最も重要なエラーを先に提示

### 3. strictモードの実装

**決定**: デフォルトは警告を許容し、`--strict` で警告もエラー扱い。

**理由**:


- 開発中は柔軟に、本番環境では厳格に運用可能
- 段階的な品質向上をサポート

### 4. syncHash のオプション化

**決定**: syncHash チェックはデフォルト無効、`--check-sync-hash` で有効化。

**理由**:


- パフォーマンスへの配慮
- 通常のバリデーションでは不要な場合が多い

---

## 依存関係とリスク

### 技術的依存関係

- **Ajv 8.17.1**: JSON Schema Draft 2020-12 対応
- **ajv-formats 3.0.1**: 日付・URL等のフォーマット検証
- **Node.js ESモジュール**: import/export構文使用

### 既知のリスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| スキーマ参照解決の問題 | 🔴 高 | 複数のアプローチを試行中 |
| Ajv非同期処理の複雑性 | 🟡 中 | 必要に応じて同期処理に変更 |
| 大量ファイルでの性能問題 | 🟢 低 | ベンチマーク後に最適化 |
| エラーメッセージの分かりやすさ | 🟡 中 | ユーザーテストとフィードバック収集 |

---

## 参照ドキュメント

- [フェーズ1-1完了報告書](./status/phase-1-1-completion-report.md)
- [スキーマCHANGELOG](../../registry/schema/CHANGELOG.md)
- [スキーマVERSIONING](../../registry/schema/VERSIONING.md)
- [DECISIONS.md](./DECISIONS.md)
