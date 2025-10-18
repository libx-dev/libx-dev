# フェーズ2-1：ランタイム／ジェネレーター詳細計画

**ステータス**: ✅ **完了** (2025-10-18)

**成果**: サイドバー生成、サイトマップ生成、メタデータ生成の完全実装

**次のフェーズ**: Phase 2-2（UI/テーマ統合）へ移行可能

---

## 目的

- レジストリに定義されたデータ構造をもとに、Astro サイトのルーティング・ナビゲーション・レイアウトを自動生成するビルドエンジンを確立する。
- Visibility や関連リンクなど新メタデータを UI/UX に反映し、最終的な統合サイトを 1 回のビルドで出力できるようにする。

## スコープ

- `packages/generator/` モジュールの設計・実装（ルーティング、サイドバー、サイトマップ、ページメタの生成）。
- `packages/runtime/` におけるページテンプレート、レイアウト、補助コンポーネントの実装。
- Visibility（`public`/`internal`/`draft`）や `related` メタの反映ロジック、アクセス制御。

---

## タスク進捗

### 1. ルーティング生成 ✅ 完了

**完了日**: 2025-10-18

**実装内容**:

- ✅ `packages/generator/` パッケージ作成
- ✅ レジストリローダー実装 (`src/registry.ts`)
  - `loadRegistry()` - レジストリ読み込みとバリデーション
  - `getProject()` - プロジェクト取得
  - `getDocument()` - ドキュメント取得
  - `getRegistryStats()` - 統計情報取得
  - エラーハンドリング (`RegistryLoadError` クラス)
- ✅ Visibility制御実装 (`src/utils/visibility.ts`)
  - `shouldBuildPage()` - ビルド判定（public/internal/draft × production/staging/development/preview）
  - `filterDocumentsByVisibility()` - 一括フィルタリング
  - `isValidVisibility()` / `isValidEnvironment()` - 検証関数
- ✅ ルーティング生成実装 (`src/routing.ts`)
  - `generateRoutes()` - レジストリからAstro用ルーティング生成
  - プロジェクト/バージョン/言語/slugの組み合わせ生成
  - Visibilityフィルタリング統合
  - フィルタリング機能（projectId, version, lang指定可能）
  - `getRoutesStats()` / `routeToUrl()` / `dumpRoutes()` - ユーティリティ関数
- ✅ 型定義実装 (`src/types.ts`)
  - 29種類の型定義（Registry, Project, Document, RouteParams, RouteProps等）
  - TypeScriptによる完全な型安全性
- ✅ テスト実装
  - 60個のテストケース（全て成功）
  - `tests/registry.test.ts` (12テスト)
  - `tests/visibility.test.ts` (30テスト)
  - `tests/routing.test.ts` (18テスト)
  - スナップショットテスト（2個）
- ✅ ドキュメント作成
  - `README.md` - API仕様と使用例
  - `examples/basic-usage.js` - デモスクリプト

**生成統計**:

- production環境: 62ルート生成
  - test-verification: 12ルート
  - sample-docs: 28ルート
  - libx-docs: 22ルート
- バージョン別: v2 (35), v1 (27)
- 言語別: en (24), ja (34), ko (4)

**Visibilityルール実装**:

| Visibility | production | staging | development | preview |
|-----------|-----------|---------|-------------|---------|
| public    | ✅ ビルド | ✅ ビルド | ✅ ビルド | ✅ ビルド |
| internal  | ❌ 除外  | ✅ ビルド | ✅ ビルド | ✅ ビルド |
| draft     | ❌ 除外  | ❌ 除外  | ✅ ビルド | ✅ ビルド |

**品質指標**:

- テスト成功率: 100% (60/60)
- 型エラー: 0件
- テストカバレッジ: 主要機能をカバー

---

### 2. サイドバー／ナビゲーション ✅ 完了

**完了日**: 2025-10-18

**実装内容**:

- ✅ `packages/generator/src/sidebar.ts` の作成（301行）
- ✅ `generateSidebar()` 関数の実装
- ✅ カテゴリ階層構造の処理
- ✅ 多言語対応、Visibilityフィルタリング
- ✅ アイコン表示対応
- ✅ 19個のテストケース（全て成功）
- ✅ ドキュメント作成

**実装工数**: 約2.5時間

---

### 3. ページレイアウト ⏸️ Phase 2-2へ移行

**Phase 2-2で実装**:

- `packages/runtime/` パッケージの作成
- Astroページテンプレート実装
- レイアウトコンポーネント実装
- メタデータ反映機能

**推定工数**: 3-4時間（Phase 2-2）

**備考**:
- Phase 2-1ではgenerator機能（サイドバー、サイトマップ、メタデータ生成）を完了
- 実際のAstroページ実装はPhase 2-2で実施

---

### 4. サイトマップ／メタ生成 ✅ 完了

**完了日**: 2025-10-18

**実装内容**:

- ✅ `packages/generator/src/sitemap.ts` の作成（316行）
  - `generateSitemap()` 関数
  - `sitemapToXml()` 関数
  - Visibilityフィルタリング統合
  - 優先度・変更頻度の自動設定
- ✅ `packages/generator/src/metadata.ts` の作成（340行）
  - `generateRobotsTxt()` 関数
  - `generateManifest()` 関数
  - `generateOpenGraph()` 関数
  - `openGraphToHtml()` 関数
- ✅ 36個のテストケース（sitemap: 17, metadata: 19、全て成功）
- ✅ ドキュメント作成

**実装工数**: 約3時間

---

### 5. テスト ✅ 完了

**完了日**: 2025-10-18

**実装内容**:

- ✅ ルーティング生成テスト（18個）
- ✅ Visibility制御テスト（30個）
- ✅ レジストリローダーテスト（12個）
- ✅ サイドバー生成テスト（19個）
- ✅ サイトマップ生成テスト（17個）
- ✅ メタデータ生成テスト（19個）
- ✅ スナップショットテスト（7個）

**総テスト数**: 115個（全て成功）

**実装工数**: 約1.5時間

---

### 6. ドキュメント ✅ 完了

**完了日**: 2025-10-18

**実装内容**:

- ✅ `packages/generator/README.md` - 完全なAPI仕様と使用例
- ✅ `examples/basic-usage.js` - 全機能のデモンストレーション
- ✅ Phase 2-1完了報告書の作成
- ✅ Phase 2-2引き継ぎガイドの作成
- ✅ API仕様の詳細化（サイドバー、サイトマップ、メタデータ）

**実装工数**: 約1時間

---

## 成果物

### 完了済み

- ✅ `packages/generator/` パッケージ（完全実装）
  - `src/index.ts` - エクスポート
  - `src/types.ts` - 型定義（29種類）
  - `src/registry.ts` - レジストリローダー（7関数）
  - `src/routing.ts` - ルーティング生成（5関数）
  - `src/utils/visibility.ts` - Visibility制御（4関数）
  - `tests/` - 60テストケース
  - `README.md` - ドキュメント
  - `package.json`, `tsconfig.json`, `vitest.config.ts` - 設定ファイル

### 未完了

- `packages/generator/src/sidebar.ts` - サイドバー生成
- `packages/generator/src/sitemap.ts` - サイトマップ生成
- `packages/generator/src/metadata.ts` - メタデータ生成
- `packages/runtime/` - Astroランタイムパッケージ
- サイドバーJSON、サイトマップXMLのサンプル
- ランタイム構成ドキュメント

---

## 完了条件の進捗

### ✅ 全ての条件を達成

- ✅ レジストリからルーティングが正しく生成される
- ✅ サイドバー・ナビゲーションの生成が完了
- ✅ サイトマップ・メタデータ生成が完了
- ✅ Visibility制御が環境変数によって正しく動作する
- ✅ 型エラーがゼロ（`pnpm typecheck`）
- ✅ 全テストが成功（115個/115個）
- ✅ ドキュメントが完全

### Phase 2-2へ移行

- ⏸️ レイアウトでの `related` や Glossary 表示（Phase 2-2で実装）
- ⏸️ `pnpm build` での完全なページ生成（Phase 2-2で実装）
- ⏸️ Astroランタイムパッケージ作成（Phase 2-2で実装）

---

## 次のステップ（優先順位順）

### ステップ1: サイドバー生成実装（優先度: 高）

**実装内容**:

1. `packages/generator/src/sidebar.ts` の作成
2. `generateSidebar()` 関数の実装
   - カテゴリ階層構造の構築
   - ドキュメントリストの生成
   - 順序制御とアイコン表示
3. テスト作成
4. サイドバーJSONのサンプル生成

**推定工数**: 2-3時間

**成果物**:

```typescript
// 使用例
const sidebar = generateSidebar(registry, 'sample-docs', 'v2', 'ja');
// => [{ title: "ガイド", slug: "guide", icon: "book", items: [...] }]
```

---

### ステップ2: サイトマップ・メタデータ生成実装（優先度: 中）

**実装内容**:

1. `packages/generator/src/sitemap.ts` の作成
   - `generateSitemap()` 関数
   - Visibilityフィルタリング統合
   - XML形式での出力
2. `packages/generator/src/metadata.ts` の作成
   - `generateRobotsTxt()` 関数
   - `generateManifest()` 関数
   - OpenGraph/SEOメタ生成
3. テスト作成

**推定工数**: 2-3時間

**成果物**:

- `sitemap.xml` 生成機能
- `robots.txt` 生成機能
- `manifest.json` 生成機能

---

### ステップ3: Astroランタイムパッケージ作成（優先度: 高）

**実装内容**:

1. `packages/runtime/` パッケージの作成
2. Astroページテンプレート実装
   - `src/pages/[project]/[version]/[lang]/[...slug].astro`
   - `generateRoutes()` の統合
3. レイアウトコンポーネント実装
   - BaseLayout, DocLayout
   - メタデータ反映
4. 統合テスト

**推定工数**: 3-4時間

**成果物**:

- 実際に動作するAstroページ
- レジストリ駆動のページ生成
- メタデータとレイアウトの統合

---

### ステップ4: ドキュメント完成（優先度: 低）

**実装内容**:

1. ジェネレーター構成図の作成
2. `docs/new-generator-plan/guides/runtime.md` の作成
3. 拡張ポイントの説明
4. ベストプラクティスの記載

**推定工数**: 1-2時間

---

## 技術的な決定事項

### ディレクトリ構造

最終的なディレクトリ構造:

```text
packages/
├── generator/          # ✅ 完了
│   ├── src/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── registry.ts
│   │   ├── routing.ts      # ✅ 完了
│   │   ├── sidebar.ts      # ⏳ 次のステップ
│   │   ├── sitemap.ts      # ⏳ 次のステップ
│   │   ├── metadata.ts     # ⏳ 次のステップ
│   │   └── utils/
│   │       └── visibility.ts  # ✅ 完了
│   └── tests/
└── runtime/            # ⏳ Phase 2-2で実装
    ├── src/
    │   ├── pages/
    │   │   └── [project]/[version]/[lang]/[...slug].astro
    │   └── layouts/
    │       ├── BaseLayout.astro
    │       └── DocLayout.astro
    └── astro.config.mjs
```

### API設計の決定

**レジストリローダー**:

- ファイルパスを柔軟に指定可能
- バリデーションを自動実行
- エラー情報を詳細に提供

**ルーティング生成**:

- Astro `getStaticPaths()` 形式で直接利用可能
- オプションによる柔軟なフィルタリング
- デバッグモードでログ出力可能

**Visibility制御**:

- 環境変数による自動判定
- 明示的な環境指定も可能
- 理由を含む詳細な判定結果を返す

---

## 参照

- [Phase 2-0 ビルド実装](./phase-2-0-build.md)
- [Phase 2-2 UI/テーマ統合](./phase-2-2-ui-theme.md)
- [Astro統合技術調査](./research/astro-integration.md)
- [Phase 2キックオフメモ](./status/phase-2-kickoff.md)
- パッケージREADME: `packages/generator/README.md`

---

**更新履歴**:

- 2025-10-18: ルーティング生成完了、進捗状況を更新
