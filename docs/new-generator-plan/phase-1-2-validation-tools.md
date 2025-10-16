# フェーズ1-2：バリデーションツール詳細計画

**ステータス**: 🟡 進行中（Week 1-2 実装フェーズ）
**最終更新**: 2025-10-16

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
- 🟡 `scripts/validate-registry.js` がサンプルデータを正常に検証（スキーマ参照問題を解決中）。
- ⏳ CI 上での `validate` 実行が安定し、失敗時にエラーログが判読可能。
- ⏳ 旧スクリプト利用者向けラッパーが用意され、フェーズ3の移行作業で再利用できる。

---

## 進捗状況（2025年10月16日更新）

### ✅ 完了した作業

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

### 🟡 進行中の作業

#### スキーマ参照解決の問題修正

- **ステータス**: 🟡 技術的問題を調査中
- **問題**:
  - ルートスキーマ (`docs.schema.json`) の `$id` が URL形式: `https://libx.dev/schemas/docs.schema.json`
  - 相対パス参照 `./schema/project.schema.json` が正しく解決されない
  - Ajvの `loadSchema` オプションで非同期読み込みを実装済みだが、まだエラーが発生

**エラーメッセージ**:

```text
can't resolve reference ./schema/project.schema.json from id https://libx.dev/schemas/docs.schema.json
```

**試行した解決策**:

1. ✅ `loadSchema` オプションで非同期読み込み実装
2. ✅ スキーマ登録順序の調整（参照スキーマを先に登録）
3. 🟡 $id と相対パスの両方で登録（部分的成功）

**次の対策候補**:

1. スキーマの `$id` を相対パス形式に変更（例: `./docs.schema.json`）
2. Ajv の `loadSchema` を同期処理に変更し、事前に全スキーマをロード
3. `compileAsync` を使用して非同期コンパイルに完全対応

### ⏳ 未着手の作業

#### 9. テストスイートの作成

- **予定**: Week 2
- **内容**:
  - 各バリデーターのユニットテスト
  - 正常系/異常系のテストケース
  - エラーメッセージのスナップショットテスト
  - テストフィクスチャの作成

#### 10. package.json へのコマンド追加

- **予定**: Week 2
- **内容**:

```json
{
  "scripts": {
    "validate": "node scripts/validate-registry.js",
    "validate:strict": "node scripts/validate-registry.js --strict",
    "validate:full": "node scripts/validate-registry.js --check-content --check-sync-hash"
  }
}
```

#### 11. マイグレーションスクリプト実装

- **予定**: Week 3
- **内容**:
  - `scripts/migrate-to-registry.js` の作成
  - `apps/*/src/config/project.config.json` からのデータ抽出
  - `registry/docs.json` への変換ロジック
  - 既存プロジェクト（sample-docs, test-verification）のマッピング
  - `--dry-run`, `--validate` オプション実装

#### 12. レジストリデータ初期生成

- **予定**: Week 3
- **内容**:
  - `registry/docs.json` の本番用データ生成
  - `registry/examples/sample-docs-full.json` の完全サンプル作成
  - 既存プロジェクトのコンテンツスキャン

#### 13. CI統合

- **予定**: Week 4
- **内容**:
  - `.github/workflows/validate-registry.yml` の作成
  - プッシュ/プルリクエスト時の自動バリデーション
  - エラーログのフォーマット確認
  - ステータスバッジの追加

#### 14. ステークホルダーレビュー準備

- **予定**: Week 4
- **内容**:
  - デモ資料の作成
  - エラーメッセージ実例集
  - レビューポイントチェックリスト
  - フィードバック収集方法の確立

---

## 次のステップ（優先順位順）

### 🔴 最優先: スキーマ参照問題の解決（即時対応）

#### アプローチ1: スキーマ$idの相対パス化（推奨）

```bash
# registry/docs.schema.json の $id を変更
# 変更前: "$id": "https://libx.dev/schemas/docs.schema.json"
# 変更後: "$id": "./docs.schema.json" または削除
```

**メリット**:

- シンプルで確実
- ファイルベースの参照と整合性が高い
- 他のスキーマも同様に修正可能

**デメリット**:

- スキーマのグローバルIDが失われる
- 将来的なスキーマ公開時に再変更が必要

#### アプローチ2: Ajv compileAsync の使用

```javascript
// schema-validator.js を修正
async validateWithAjv(data, errors) {
  const validate = await this.ajv.compileAsync(this.schemas.root);
  // ...
}
```

**メリット**:

- 非同期スキーマ読み込みに完全対応
- URL形式の $id を維持可能

**デメリット**:

- validateRegistry() を async 関数に変更が必要
- CLI側も async/await に対応が必要

#### アプローチ3: 全スキーマの事前同期ロード（現実的）

```javascript
// 全スキーマを事前に addSchema() で登録
// $ref 参照時に自動解決されるようにする
```

**推奨アクション**: アプローチ1を試し、問題が残ればアプローチ3に移行

### 🟡 高優先: 動作確認とテスト（Week 2前半）

1. **スキーマ参照問題解決後の動作確認**

   ```bash
   node scripts/validate-registry.js
   node scripts/validate-registry.js --strict
   node scripts/validate-registry.js --report=json
   ```

2. **package.json へのコマンド追加**
   - `pnpm validate` で実行可能に
   - `pnpm validate:strict` の追加

3. **基本的なテストケース作成**
   - 正常系: sample-basic.json のバリデーション成功
   - 異常系: 意図的なエラーを含むデータでエラー検出

### 🟢 中優先: マイグレーション準備（Week 2後半〜Week 3）

1. **既存プロジェクト構造の分析**

   ```bash
   # sample-docs の project.config.json を確認
   # ディレクトリ構造とMDXファイルをスキャン
   ```

2. **マイグレーションスクリプトの設計**
   - データマッピングロジックの設計書作成
   - エッジケースの洗い出し

3. **マイグレーションスクリプトの実装**
   - `scripts/migrate-to-registry.js` の作成
   - dry-run モードでの動作確認

### ⚪ 低優先: CI統合とドキュメント（Week 4）

1. **GitHub Actions ワークフロー追加**
   - `.github/workflows/validate-registry.yml`
   - プルリクエストでの自動検証

2. **ステークホルダーレビュー準備**
   - デモ実施
   - フィードバック収集

3. **フェーズ1-2完了報告書作成**
   - 成果物のまとめ
   - 設計判断の記録

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
