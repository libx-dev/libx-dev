# ドキュメントサイトジェネレーター競合調査（フェーズ0）

最終更新: 2024-10 時点の知見に基づく調査メモ。

## 1. Astro / Starlight の最新動向
| 項目 | 状況 | 新ジェネレーターへの示唆 |
| --- | --- | --- |
| **Astro v4 系** | Hybrid rendering（Streaming SSR、部分再水和）、アセット最適化とViewTransitionsの強化。`content collections` の Zod スキーマ指定が標準化。 | 単一ビルドでの柔軟なルーティング生成に向く。Content Collection + Markdown Pipeline を標準利用する前提で設計する価値。 |
| **Starlight 公式テーマ** | 多言語サポート、サイドバー生成、検索 (Pagefind) が標準搭載。2024年夏に `@astrojs/starlight-search` が追加、Algolia/Meilisearch 連携も改善。 | 既存 UI を維持しつつ、Starlight のプラグイン構造と互換性を保てば保守コスト削減につながる。必要な機能だけを抽出してカスタムジェネレーターへ適用する方針が現実的。 |
| **Starlight 1.x** | `starlight config` で JSON 定義を読み込み、シンプルに構築可能。`sidebar.schema` など JSON Schema 化が進んでいる。 | レジストリスキーマ策定のリファレンスとして有用。Starlight CLI から借用できるエラーメッセージや UX がある。 |
| **Astro Integration エコシステム** | `@astrojs/mdx` が v2 で安定化。`astro:content` の SSR 対応も進行。 | MDX 拡張を自前で抱えず、Astro公式プラグインを最大限活用する。CLI で Content Collection 設定を生成するワークフローが有望。 |

## 2. 類似ツール比較
| ツール | 特徴 | 長所 | 留意点 |
| --- | --- | --- | --- |
| **Starlight (Astro公式)** | Astroベース、設定ファイル中心、Pagefind検索標準、公式テーマ。 | Astroネイティブ、設定JSONのスキーマが整備、OSSで活発。 | UXをカスタマイズする場合はテーマ拡張が必要。サイト統合や高度な自動化ワークフローは自前で追加。 |
| **Docusaurus 3.x** | Reactベース、MDX + plugin、Versioning/Locale標準。 | 大規模コミュニティ、プラグイン豊富、検索(Algolia DocSearch)連携が簡単。 | React 前提で Astro 資産を活かしにくい。ビルド時間が長め、SSR には独自の制約。 |
| **VitePress 1.x** | Vue/Viteベース、Markdown 中心、Content Data API。 | シンプル・高速、カスタマイズしやすい。 | 多言語やバージョン対応は薄い。テーマ自由度は高いが要Vue知識。 |
| **Nextra 3 (Next.js)** | Next.js 上で MDX サイトを構築。App Router対応。 | React/Next エコシステムを利用、MDX+TSX。 | Node ランタイム依存が大きく、SSR/ISR 運用でコスト。Astro資産を転用しづらい。 |
| **Mintlify** | SaaS 型ドキュメントホスティング。 | 執筆体験に優れ、コラボレーション機能が豊富。 | ホスティング前提・マルチリポ連携。OSS 資産や独自テーマ適用には制限。 |
| **Contentlayer + Next.js** | ファイルベースをスキーマ化して Mdx→データ変換。 | CMS 的なモデルで型安全。 | Contentlayer 自体の開発が停滞気味。運用複雑度は高い。 |
| **ReadMe / Stoplight** | API ドキュメント特化 SaaS。 | API スキーマ連携や Try-it-out が充実。 | SaaS前提。静的サイト生成ではないため要件外。 |

## 3. 市場トレンドと示唆
1. **スキーマ駆動構成の普及**  
   - Starlight や Docusaurus でも JSON/YAML スキーマによる設定バリデーションが進行。新ジェネレーターでも JSON Schema を一等市民とし、CLI で安全に生成・更新する方向性が主流。
2. **検索体験の強化**  
   - Pagefind（Starlight）、Algolia DocSearch（Docusaurus）、MeiliSearch などが標準化。フロントのみで完結する静的検索（Pagefind/Typesense）を検討する価値。  
   - 新ジェネレーターでは検索インデックス生成をビルドパイプラインへ組み込み、レジストリ情報と連携する余地がある。
3. **多言語 + バージョニング**  
   - Docusaurus が先行、Starlight でも experimental 機能が充実。新プロダクトは既存資産を活かしつつ、設定/翻訳ステータスをレジストリで管理する点が差別化になる。
4. **MDX 拡張と React/Component 互換性**  
   - Astro は島アーキテクチャで各フレームワークを取り込める。React/Vue/Svelte コンポーネントを一部採用したい場合も、Astro が最も柔軟。  
   - 一方で React 前提の Docusaurus などから移行する事例も増えており、AST 変換や自動移行ツールの需要が高まっている。
5. **SaaS と OSS のハイブリッド**  
   - Write/Preview を SaaS、静的出力を OSS で扱うモデルが一般化。新ジェネレーターはレジストリと CLI を OSS で提供しつつ、JAMStack ホスティング（Cloudflare Pages）に適合させることで差別化。

## 4. 新ジェネレーター設計へのインパクト
- **Astro/Starlight をベースラインに**  
  - Content Collections + Starlight テーマ構成を観察し、必要な UI/UX を抽出。既存 `@docs/ui` を再構成しながらも、Starlight のメンテナンス恩恵を受けられる構成を検討。
- **CLI/スキーマ重視**  
  - Docusaurus や Starlight の CLI は雛形作成程度に留まる。新プロダクトでは CLI でレジストリの CRUD と検証を前面に出し、差別化した開発体験を提供できる。
- **検索・ナビゲーション強化**  
  - Pagefind などの静的検索をビルドパイプラインに組み込む設計をあらかじめ想定。レジストリ情報と統合した検索メタ（タグ、ライセンス情報）を生成する戦略を用意。
- **移行シナリオ**  
  - 他ジェネレーターからの移行を念頭に、MDX 構造の変換、サイドバー JSON→レジストリ変換などのツールを計画段階で検討。  
  - バージョンや翻訳情報の扱いは Docusaurus などに倣い、未翻訳ステータスなどを明示するフィールドを用意する。

## 5. 参考リンク（2024-10時点での主要情報源）
- Astro Docs: https://docs.astro.build/  
- Starlight: https://starlight.astro.build/  
- Docusaurus 公式: https://docusaurus.io/  
- VitePress: https://vitepress.dev/  
- Nextra: https://nextra.site/  
- Pagefind: https://pagefind.app/  
- Algolia DocSearch: https://docsearch.algolia.com/  
- Mintlify: https://mintlify.com/

※ ネットワークアクセス制限環境のため、上記は既知情報をもとにした参照先一覧であり、リンク先の最新情報確認は別途必要。
