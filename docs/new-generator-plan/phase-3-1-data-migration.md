# フェーズ3-1：データ変換ロジック詳細計画

## 目的
- 既存 libx-dev / libx-docs の設定・コンテンツ資産を新レジストリ形式へ自動移行するコアロジックを実装し、手作業を最小化する。
- 変換結果が JSON スキーマおよびコンテンツ整合チェックを即時通過する状態を実現する。

## スコープ
- `migrate-from-libx` コマンド内部で使用する変換モジュール（設定ファイル・カテゴリ・MDX・Glossary 等）。
- 番号付きカテゴリ／ファイル名を docId/slug に変換するアルゴリズム。
- 変換後の `content.lang` メタ設定（status, lastUpdated, reviewer, source, syncHash）。

## タスク
1. **設定ファイル解析**
   - `project.config.json` を読み込み、Language/Version/Category 設定をレジストリ構造へマッピング。  
   - `projects.config.json` とトップページ表示設定を `settings` およびプロジェクト metadata に統合。
2. **カテゴリ／ドキュメント変換**
   - `NN-category` ディレクトリから `category.id`, `order` を抽出。  
   - `NN-document.mdx` から docId（slug 正規化）を生成し、`related` 初期値を設定。  
   - 番号衝突や slug 重複時は自動で末尾番号を付与し、レポートに記録。
3. **コンテンツメタ**
   - 各言語のファイル存在を確認し、`status` を `published` / `missing` / `draft` に割り当て。  
   - Git 履歴やファイルタイムスタンプから `lastUpdated`, `reviewer` を推定（可能な範囲で）。  
   - `source`（リポジトリパス、コミット）と `syncHash`（内容ハッシュ）を計算。
4. **Glossary 変換**
   - 用語集（存在する場合）の抽出とレジストリ `glossary` への変換。  
   - 用語 ID と slug の正規化、重複チェック。
5. **エラーハンドリング／バックアップ**
   - 変換前に対象ファイルを `.backups/` へ保存。  
   - 変換失敗時はロールバックし、差分をレポート。
6. **テスト**
   - 小規模サンプルリポジトリでのスナップショットテスト。  
   - 代表的なカテゴリ構造（多階層、欠番）を含むフィクスチャでのユニットテスト。

## 成果物
- `migrate-from-libx` コマンド内のデータ変換モジュール。  
- 変換フィクスチャとテスト。  
- 変換前後の差分を説明するドキュメント（`docs/new-generator-plan/guides/migration-data.md`）。

## 完了条件
- 代表プロジェクトで 90%以上の設定とコンテンツが自動変換され、`docs-cli validate` を通過する。  
- 変換ログにエラーがない、または残課題が明示的にリストアップされている。  
- バックアップとロールバックが正常に機能する。
