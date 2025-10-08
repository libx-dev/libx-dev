# UI/テーマ資産調査メモ（フェーズ0）

## 1. パッケージ概要
| パッケージ | 主機能 | 主要ファイル | 備考 |
| --- | --- | --- | --- |
| `@docs/ui` | Astro 向け共有 UI コンポーネント（Sidebar、Tabs、Alert 等） | `packages/ui/src/components/**` | Starlight 由来のカスタム要素 (`<docs-tabs>`, `<sl-sidebar-state-persist>` 等) を多用。MDX からも直接利用される。 |
| `@docs/theme` | カラーパレット、タイポグラフィ、CSS 変数、テーマ適用ユーティリティ | `packages/theme/src/{colors,spacing,typography}.ts`, `css/**` | CSS は各アプリから `@import '@docs/theme/css/...';` で取り込み。JS 側は DOM 操作を含む関数を export しているが未使用箇所が多い。 |
| `@docs/i18n` | 言語リストと翻訳ユーティリティ | `packages/i18n/src/utils/**`, `locales/*.json` | `translate`, `translatePath`, `getLanguage` に加え、ライセンス情報テンプレート取得ユーティリティあり。 |
| `@docs/versioning` | バージョンセレクター UI とバージョン差分表示、バージョン関連ユーティリティ | `packages/versioning/src/components/**`, `utils/**` | `Version` 型は `Date` オブジェクト前提だが JSON から読み込むと文字列になりうる。 |

共通事項:
- すべて `private` な workspace パッケージ。外部リポジトリから利用する前提では未整備。
- 各パッケージ配下に個別の `node_modules` が作成されており、単一リポジトリ移行時は整理が必要。
- ビルド設定や型解決は各アプリの `astro.config.mjs` / `tsconfig.json` で手動 alias 指定しており、集中管理されていない。

## 2. アプリ別利用状況
- **sample-docs / project-template / test-verification / libx-docs**  
  - レイアウト: `@docs/ui/components` の `Sidebar`, `TableOfContents`, `Footer`, `ThemeToggle`, `Pagination` 等を使用。  
  - ページ: バージョン切り替え (`@docs/versioning/components/VersionSelector`) とページネーション (`@docs/versioning/utils/mergePagination`) を利用。  
  - MDX コンテンツ: `Alert`, `Icon`, `Tabs`, `Card`, `LicenseAttribution` などを直接インポート。  
  - グローバルスタイル: `@docs/theme/css/{variables,base}.css` を `src/styles/global.css` から import。  
  - i18n: `translate`, `translatePath`, `LocaleKey` 型をユーティリティやコンポーネントで利用。
- **top-page**  
  - UI: `Footer`, `ThemeToggle`, `Dropdown`, `Icon` 等を利用し、`ProjectCard` では `IconName` 型を使用。  
  - `@docs/versioning` の直接利用はなし。  
  - `@docs/theme` を CSS import、`@docs/i18n` をプロジェクト一覧表示に使用。

共通する課題:
- `Icons` レジストリは `@docs/ui/components/icons/Icons` という内部パスで参照されており、公開 API が整理されていない。  
- 各アプリの `astro.config.mjs` で毎回 alias を手書きしており、`@docs/search` のように存在しないパッケージを参照する設定が残存。  
- UI コンポーネントは DOM 依存のインラインスクリプトを含むため、ビルド時に SSR 互換性検証が難しい。

## 3. 技術的負債・懸念事項
- **API 表面の不統一**  
  - `@docs/ui` の公開 API が `components/index.ts` のみで、`Icons` のように internal パスを直接 import するケースが散見。パッケージ化の際に破綻する恐れ。  
  - `@docs/theme` の JS ユーティリティ (`applyTheme`, `toggleDarkMode` 等) は export されているが利用実績がなく、型・動作保証が曖昧。
- **DOM 依存スクリプト**  
  - `SidebarPersister`, `Tabs` などはカスタム要素や `sessionStorage` 操作を含むインラインスクリプトを埋め込み、Astro のクライアント指示子なしで挿入。SSR と静的出力では問題ないが、再利用時に挙動確認が必要。  
  - `applyTheme` 系も `window.matchMedia` に依存し、サーバー実行時に注意が必要。
- **データ型の不整合**  
  - `@docs/versioning` の `Version` 型が `Date` を前提としている一方、`project.config.json` では ISO 文字列で保持。変換処理がアプリ毎に実装されており共通化されていない。  
  - i18n のロケール定義は JSON のみで、型推論が限定的。`LocaleKey` が維持されているが追加時は手動更新が必要。
- **ビルド設定の分散**  
  - 各アプリで alias / Vite 設定 / base path 調整を個別に記述。新ジェネレーターでは一元化した解決ルールが求められる。  
  - `@docs/search` への alias が残留しており、削除済み資産の痕跡が散在。
- **スタイル資産の統合難度**  
  - `@docs/theme` は CSS 変数を提供するが、UI コンポーネント側での利用が散発的（ハードコード色値も残存）。  
  - ダークモード切替はテーマパッケージと UI コンポーネント双方で実装されており重複傾向。
- **配布前提の未整備**  
  - 各パッケージが `private` のまま、`files` やビルド成果物が定義されていない。外部公開するにはビルド手順・型配布の検討が必要。

## 4. 次の検討ポイント
- `@docs/ui` 公開 API の再定義（アイコン、hooks、ユーティリティを含む）と副作用スクリプトの整理。  
- `@docs/theme` のデザイントークンを UI コンポーネントに統合する方針、または CSS 設計の刷新。  
- `@docs/versioning` の `Date` 取り扱い統一（JSON 読み込み時に共通変換処理を提供する等）。  
- alias 設定の集中管理（将来は Astro integration or Vite plugin として提供）。  
- 旧資産（`@docs/search` など）の整理と、実際に利用されているユーティリティの抽出。  
- 新ジェネレーターでの利用を見据え、パッケージを npm 公開または Git サブモジュール化する際のビルド/型定義戦略の検討。
