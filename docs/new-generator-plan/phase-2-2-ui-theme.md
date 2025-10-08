# フェーズ2-2：UI／テーマ統合詳細計画

## 目的
- `@docs/ui`, `@docs/theme`, `@docs/versioning`, `@docs/i18n` を新ジェネレーターに組み込み、既存ブランド体験を維持しながら再利用可能なコンポーネント体系を再構築する。
- npm 公開または Git サブモジュールによる配布方法を検証し、最終方針を決定する。

## スコープ
- 共有パッケージのビルド設定・型定義整備。
- Astro プロジェクトでの導入、アクセシビリティ調整、スタイル統合。
- VersionSelector、Language Switcher、ThemeToggle、Sidebar 等キーパーツの再実装と動作検証。

## タスク
1. **パッケージ抽出・ビルド**
   - 各パッケージに `package.json` の公開設定（`name`, `version`, `exports`, `files`）を追加。  
   - TypeScript 型出力、CSS アセット配布方法（`dist/css`）を整理。
2. **導入検証**
   - npm 仮発行（registry なしで `npm pack`）と Git サブモジュール両方で導入テスト。  
   - インポートパス (`@docs/ui/components/...`) の互換性検証。
3. **アクセシビリティ・スタイル調整**
   - テーマ変数統合（デザイントークンの利用、カラーモード対応）。  
   - コンポーネント単位の A11y テスト（キーボード操作、スクリーンリーダー）。
4. **UI テスト**
   - Storybook or Playwright Visual Regression 導入可否の検討。  
   - コンポーネントごとの Jest/Vitest + astro/test によるスナップショット検証。
5. **ドキュメント**
   - コンポーネント一覧、プロパティ、使用例を `docs/new-generator-plan/guides/ui-components.md` に記載。  
   - テーマカスタマイズ手順、カラーパレット一覧、CSS 変数一覧をまとめる。
6. **意思決定**
   - npm 公開 vs サブモジュールの利点・欠点を比較し、DECISIONS.md に最終方針を記録。  
   - バージョニングポリシーとリリース手順（自動 or 手動）を定義。

## 成果物
- 更新済み `packages/ui`, `theme`, `versioning`, `i18n`（ビルド設定・型定義付き）。
- UI コンポーネントドキュメントとスタイルガイド。
- npm 公開 or サブモジュール導入手順書。

## 完了条件
- 共有パッケージが新ジェネレーターに導入でき、主要ページで UI が崩れない。
- アクセシビリティチェックをクリアし、主要コンポーネントのテストが整備されている。
- 配布方針が承認され、DECISIONS.md に記録済み。 
