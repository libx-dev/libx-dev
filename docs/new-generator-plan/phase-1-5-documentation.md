# フェーズ1-5：ドキュメント整備詳細計画

**最終更新**: 2025年10月18日
**ステータス**: ✅ 完了（100%）

## 目的
- レジストリ／CLI／テスト基盤の利用方法と設計意図をドキュメント化し、フェーズ2以降のチーム内外コラボレーションを円滑にする。
- フェーズ1で決定した規約・運用ルールを一箇所に集約し、変更時の影響範囲を追跡可能にする。

## スコープ
- レジストリ記述ガイド (`registry.md`)、CLI ガイド (`docs-cli.md`)、CI 例 (`examples/ci.md`) の執筆。
- DECISIONS.md への合意事項追記、`status/` ディレクトリでの週次更新テンプレート整備。
- テンプレートファイル（`.docs-cli/config.json`, サンプル MDX, バックアップ README）の作成。

---

## 進捗状況

### ✅ 完了済み（6/6タスク - 100%）

1. **CLIガイド作成（✅ 完了）**
   - ファイル: `docs/new-generator-plan/guides/docs-cli.md`（796行）
   - 内容:
     - 全コマンドのリファレンス（add, update, remove, list, validate, search, export）
     - `--dry-run`, `--json`, `.docs-cli/config.json`の使い方
     - バックアップ/ロールバック手順
     - トラブルシューティング
     - CI/CD統合例
   - 完了日: 2025-10-18

2. **テスト/CIドキュメント作成（✅ 完了）**
   - ファイル:
     - `docs/new-generator-plan/guides/testing.md`（392行）
     - `docs/new-generator-plan/guides/ci-cd.md`（405行）
   - 内容:
     - テストポリシーとケース分類（ユニット/統合/スナップショット）
     - テスト実行方法とカバレッジ目標
     - CI/CDワークフロー構成（10ジョブ）
     - トラブルシューティングとローカルテスト実行
   - 完了日: 2025-10-18

3. **DECISIONS.md更新（✅ 完了）**
   - Phase 1-4での決定事項が記録済み
   - CLI設計、バリデーション戦略、テストポリシーが文書化済み

4. **レジストリガイド作成（✅ 完了）**
   - ファイル: `docs/new-generator-plan/guides/registry.md`（約700行）
   - 内容:
     - レジストリの目的と役割、データ駆動型アーキテクチャの説明
     - 12スキーマファイルの完全なフィールドリファレンス
     - JSON Schemaとの対応表
     - 3種類のサンプルコード（diff例）
     - ベストプラクティス（ID命名規則、バージョン管理戦略、翻訳ステータス管理）
     - トラブルシューティング（5つの典型的なエラーと解決方法）
   - 完了日: 2025-10-18

5. **テンプレート整備（✅ 完了）**
   - ファイル:
     - `templates/docs-cli-config.json` - CLI設定テンプレート（コメント付き）
     - `templates/sample-document.mdx` - MDXテンプレート（フロントマター付き）
     - `templates/glossary-template.json` - 用語集テンプレート（3サンプルエントリ）
     - `templates/backup-readme.md` - バックアップREADME（運用ガイド）
   - 完了日: 2025-10-18

6. **Phase 1-5完了報告書作成（✅ 完了）**
   - ファイル: `docs/new-generator-plan/status/phase-1-5-completion-report.md`
   - 内容:
     - エグゼクティブサマリー
     - 全タスクの完了状況
     - 成果物概要（レジストリガイド、テンプレート、既存ドキュメント統合）
     - 主要な設計判断
     - Phase 1全体の総括
     - Phase 2への引き継ぎ事項
   - 完了日: 2025-10-18

---

## タスク
1. **情報アーキテクチャ設計**
   - ガイド文書の構成（概要→ステップ→FAQ→トラブルシューティング）を統一し、参照しやすくする。  
   - 既存ドキュメントとの重複チェックを行い、リンク整備。
2. **レジストリガイド作成**
   - フィールド一覧、必須/任意、例、変更時チェックリストをまとめる。  
   - JSON Schema との対応表、およびサンプルコード（diff 例）を掲載。
3. **CLI ガイド作成**
   - 主要コマンドの例と結果イメージ、`--dry-run`, `--json`, `.docs-cli/config.json` の使い方を記載。  
   - バックアップ/ロールバック手順、トラブルシューティング（バリデーションエラー時の対処）。
4. **テスト/CI ドキュメント作成**
   - `docs/new-generator-plan/guides/testing.md` にテストポリシーとケース分類を記載。  
   - `examples/ci.md` に GitHub Actions YAML と説明を掲載。
5. **テンプレート整備**
   - `.docs-cli/config.json` のコメント付きテンプレート。  
   - サンプル MDX（frontmatter 最小化、`related` 設定例）と Glossary JSON テンプレ。  
   - バックアップディレクトリ向け README（ローテーションポリシー）作成。
6. **承認と公開**
   - ドキュメントレビュー（テックリード／コンテンツリード）を実施。  
   - DECISIONS.md にフェーズ1ドキュメント公開を記録し、以降の更新フローを定義。

## 成果物
- `docs/new-generator-plan/guides/registry.md`
- `docs/new-generator-plan/guides/docs-cli.md`
- `docs/new-generator-plan/guides/testing.md`
- `docs/new-generator-plan/examples/ci.md`
- 各種テンプレートファイル
- 更新履歴（`status/phase-1.md` など）

## 完了条件

### 達成状況（100%完了）

- ✅ **CLIガイド**: リンク付き目次を備え、全コマンドのリファレンスが完備
- ✅ **テスト/CIガイド**: ワークフロー構成とトラブルシューティングが文書化済み
- ✅ **DECISIONS.md**: Phase 1の決定事項が記録済み
- ✅ **レジストリガイド**: 完成（約700行、12スキーマファイル完全対応）
- ✅ **テンプレート**: 完備（4ファイル、即利用可能）
- ✅ **Phase 1-5完了報告書**: 作成完了

### 最終完了条件（すべて達成）

- [x] ガイド文書がリンク付き目次を備え、必要な参照資料（CLI コマンド、CI 設定）に直アクセスできる
- [x] レジストリガイド（registry.md）が完成し、JSON Schemaとの対応表を含む
- [x] テンプレートが CLI やチームの初期セットアップで再利用可能な状態になっている
- [x] ドキュメント更新手順がコミュニケーション計画に沿って運用開始されている

---

## Phase 1-5 完了サマリー

### 成果物一覧

#### 1. レジストリガイド（✅ 完了）

**ファイル**: `docs/new-generator-plan/guides/registry.md`（約700行）

**内容**:
- レジストリの目的と役割、データ駆動型アーキテクチャの説明
- 12スキーマファイルの完全なフィールドリファレンス
- JSON Schemaとの対応表
- 3種類のサンプルコード（diff例：プロジェクト追加、ドキュメント更新、バージョン追加）
- ベストプラクティス（ID命名規則、バージョン管理戦略、翻訳ステータス管理、可視性設定）
- トラブルシューティング（5つの典型的なエラーと解決方法、参照整合性エラーの診断手順）

**完了日**: 2025-10-18

#### 2. テンプレート整備（✅ 完了）

**作成したテンプレート**:

1. **`templates/docs-cli-config.json`** - CLI設定テンプレート（コメント付き）
2. **`templates/sample-document.mdx`** - MDXテンプレート（フロントマター付き、翻訳マーカー含む）
3. **`templates/glossary-template.json`** - 用語集テンプレート（3サンプルエントリ）
4. **`templates/backup-readme.md`** - バックアップREADME（運用ガイド、約200行）

**完了日**: 2025-10-18

#### 3. Phase 1-5完了報告書（✅ 完了）

**ファイル**: `docs/new-generator-plan/status/phase-1-5-completion-report.md`

**内容**:
- エグゼクティブサマリー
- 全タスクの完了状況（6/6タスク、100%）
- 成果物概要（レジストリガイド、テンプレート、既存ドキュメント統合）
- 主要な設計判断（4項目）
- Phase 1全体の総括
- Phase 2への引き継ぎ事項（5項目）

**完了日**: 2025-10-18

---

## 次のステップ（Phase 2準備）

Phase 1-5完了後、Phase 2（Astroビルドと UI統合）に向けて以下を推奨:

1. **Phase 2キックオフミーティング**
   - Phase 1の成果物レビュー
   - Phase 2のスコープ確認
   - リソース配分と担当者決定

2. **技術調査**
   - Astro最新バージョンの機能確認
   - 既存UI/テーマパッケージの棚卸し
   - レジストリ駆動のAstro統合方法の検討

3. **依存関係の整理**
   - Phase 1で作成したCLI/Validatorパッケージのバージョン固定
   - Phase 2で必要なパッケージのインストール

---

## Phase 1全体の振り返り

### 達成した成果

- ✅ **レジストリスキーマ**: JSON Schema完成、バリデーション実装
- ✅ **CLIツール**: 8コマンド実装（add, update, remove, list, validate, search, export, init）
- ✅ **テストスイート**: 111テスト、80%カバレッジ達成
- ✅ **CI/CDパイプライン**: 10ジョブ構成、自動デプロイ対応
- ✅ **ドキュメント**: CLIガイド、テスト/CIガイド完成

### Phase 2への引き継ぎ事項

1. **レジストリ構造**: `registry/docs.json`をAstroビルドシステムで参照可能に
2. **CLI統合**: ビルド前処理としてCLI validateを実行
3. **テスト戦略**: Astroコンポーネントのテスト追加（Phase 2で実装）
4. **CI拡張**: ビルド成果物の検証ジョブ追加

---

## 参考資料

### Phase 1-5の成果物

- [レジストリガイド](../guides/registry.md) - **NEW**（本フェーズで作成）
- [Phase 1-5 完了報告書](../status/phase-1-5-completion-report.md) - **NEW**（本フェーズで作成）
- [CLI設定テンプレート](../../templates/docs-cli-config.json) - **NEW**
- [MDXテンプレート](../../templates/sample-document.mdx) - **NEW**
- [用語集テンプレート](../../templates/glossary-template.json) - **NEW**
- [バックアップREADME](../../templates/backup-readme.md) - **NEW**

### Phase 1の関連ドキュメント

- [Phase 1-4 完了報告書](../status/phase-1-4-completion-report.md)
- [CLIユーザーガイド](../guides/docs-cli.md)
- [CI/CD運用ガイド](../guides/ci-cd.md)
- [テストポリシーガイド](../guides/testing.md)
- [DECISIONS.md](../DECISIONS.md)

---

**最終更新**: 2025年10月18日
**次回レビュー**: Phase 2開始前（レジストリガイド完成後）
