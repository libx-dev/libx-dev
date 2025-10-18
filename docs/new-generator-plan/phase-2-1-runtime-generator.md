# フェーズ2-1：ランタイム／ジェネレーター詳細計画

**ステータス**: 🟢 **ルーティング生成完了** (2025-10-18)

**次のステップ**: サイドバー生成、ページレイアウト、サイトマップ生成

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

### 2. サイドバー／ナビゲーション ⏳ 未着手

**タスク**:

- CategoryConfig から階層構造を構築し、サイドバー用 JSON を生成
- 現在地ハイライト、展開状態復元のためのデータ属性を付与
- カテゴリの順序制御とアイコン表示

**実装予定**:

- `packages/generator/src/sidebar.ts` の作成
- `generateSidebar()` 関数の実装
- カテゴリ階層構造の処理
- JSON出力機能

**推定工数**: 2-3時間

---

### 3. ページレイアウト ⏳ 未着手

**タスク**:

- レジストリの `title`, `summary`, `contributors`, `license`, `related` をページに反映
- `related` リストから関連記事カードを生成
- Glossary 用セクションを追加（該当用語が存在する場合のみ表示）

**実装予定**:

- `packages/runtime/` パッケージの作成
- Astroページテンプレート実装
- レイアウトコンポーネント実装
- メタデータ反映機能

**推定工数**: 3-4時間

---

### 4. サイトマップ／メタ生成 ⏳ 未着手

**タスク**:

- `sitemap.xml` と `robots.txt` を生成し、Visibility ルールに従って除外
- `manifest.json` や OpenGraph/SEO メタをプロジェクト設定から生成

**実装予定**:

- `packages/generator/src/sitemap.ts` の作成
- `packages/generator/src/metadata.ts` の作成
- XML/テキスト生成ロジック
- SEOメタデータ生成

**推定工数**: 2-3時間

---

### 5. テスト ⏳ 部分完了

**完了**:

- ✅ ルーティング生成テスト
- ✅ Visibility制御テスト
- ✅ レジストリローダーテスト

**未完了**:

- サイドバー生成テスト
- サイトマップ生成テスト
- 統合テスト（ルーティング → サイドバー → サイトマップの連携）

**推定工数**: 1-2時間

---

### 6. ドキュメント ⏳ 部分完了

**完了**:

- ✅ `packages/generator/README.md` - API仕様と使用例
- ✅ 基本的な使用例（examples/basic-usage.js）

**未完了**:

- ジェネレーター構成図
- `docs/new-generator-plan/guides/runtime.md` の作成
- サイドバー／メタ生成の拡張ポイント説明

**推定工数**: 1-2時間

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

### 完了済みの条件

- ✅ レジストリからルーティングが正しく生成される
- ✅ Visibility制御が環境変数によって正しく動作する
- ✅ 型エラーがゼロ（`tsc --noEmit`）
- ✅ ルーティング生成のリグレッション検知が可能

### 残りの条件

- ⏳ サイドバー・ナビゲーションの生成
- ⏳ レイアウトでの `related` や Glossary 表示
- ⏳ サイトマップ・メタデータ生成
- ⏳ `pnpm build` での完全なページ生成

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
