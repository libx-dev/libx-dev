# フェーズ1-2：バリデーションツール詳細計画

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
- `docs-cli validate` が成功/失敗パターンを網羅する自動テストを通過。
- CI 上での `validate` 実行が安定し、失敗時にエラーログが判読可能。
- 旧スクリプト利用者向けラッパーが用意され、フェーズ3の移行作業で再利用できる。
