# フェーズ3-4：CI／自動化詳細計画

## 目的
- フェーズ1で構築したテスト／バリデーションに加え、移行作業用の CI ワークフローを整備し、大規模移行時の品質を保証する。
- 差分レポート生成や Pagefind 検証などフェーズ3特有のプロセスを自動化し、レビュー効率を高める。

## スコープ
- GitHub Actions（または相当）での `migrate → validate → build → diff-report` パイプライン。  
- 成果物（レポート、バックアップ、ログ）の Artifact 化と通知。  
- CI 用環境変数・シークレット管理。

## タスク
1. **ワークフロー設計**
   - `migration.yml`（仮）を作成し、以下ステージを定義：  
     1. Checkout + pnpm install  
     2. `docs-cli migrate-from-libx`（対象プロジェクト指定）  
     3. `docs-cli validate`  
     4. `pnpm build`  
     5. `docs-cli diff-report`  
     6. Artifact アップロード
2. **環境設定**
   - `.docs-cli/config.ci.json` を用意し、CI から `DOCS_CLI_CONFIG` で指定。  
   - Secrets（Git 認証、Cloudflare トークン等）を整理し、ドキュメント化。
3. **通知／承認フロー**
   - 差分が検出された場合に Slack or GitHub コメントで通知。  
   - 承認が必要な場合は GitHub Environments の `manual approval` を活用。
4. **Artifact 管理**
   - 差分レポート、ビルドログ、`.backups/` を Artifact として保存。  
   - 保存期間とアクセス権を定義。
5. **テスト**
   - サンプルプロジェクトで CI ワークフローを実行し、成功/失敗パターンを確認。  
   - ネットワーク制限時の代替パスやリトライ戦略を整備。
6. **ドキュメント**
   - `docs/new-generator-plan/examples/ci.md` にフェーズ3向けワークフロー例を追記。  
   - Secrets 取扱手順と注意事項を `guides/ci.md` に記載。

## 成果物
- `migration.yml`（GitHub Actions）または同等 CI 設定。  
- `.docs-cli/config.ci.json` テンプレート。  
- Artifact 保存ポリシー。  
- CI ドキュメント更新。

## 完了条件
- CI 上で移行→検証→差分レポートまで自動実行でき、失敗時に適切な通知が届く。  
- 成果物（レポート、バックアップ）が Artifact として閲覧できる。  
- Secrets や設定の運用手順が文書化され、チームで共有されている。
