# フェーズ1-5：ドキュメント整備詳細計画

## 目的
- レジストリ／CLI／テスト基盤の利用方法と設計意図をドキュメント化し、フェーズ2以降のチーム内外コラボレーションを円滑にする。
- フェーズ1で決定した規約・運用ルールを一箇所に集約し、変更時の影響範囲を追跡可能にする。

## スコープ
- レジストリ記述ガイド (`registry.md`)、CLI ガイド (`docs-cli.md`)、CI 例 (`examples/ci.md`) の執筆。
- DECISIONS.md への合意事項追記、`status/` ディレクトリでの週次更新テンプレート整備。
- テンプレートファイル（`.docs-cli/config.json`, サンプル MDX, バックアップ README）の作成。

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
- ガイド文書がリンク付き目次を備え、必要な参照資料（スキーマ、CLI コマンド、CI 設定）に直アクセスできる。
- テンプレートが CLI やチームの初期セットアップで再利用され、レビューで承認済み。
- ドキュメント更新手順がコミュニケーション計画に沿って運用開始されている。
