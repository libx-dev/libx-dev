# @docs/generator

レジストリ駆動のルーティング・サイドバー・サイトマップ生成パッケージ

## 概要

`@docs/generator`は、`registry/docs.json`に定義されたデータ構造をもとに、Astroサイトのルーティング、サイドバー、サイトマップ、メタデータを自動生成するためのツールを提供します。

## 主要機能

- **レジストリ駆動のルーティング生成**: プロジェクト/バージョン/言語/slugからAstro用のルーティング情報を自動生成
- **サイドバー生成**: カテゴリ階層構造に基づいたナビゲーションメニューを自動生成
- **サイトマップ生成**: SEO最適化されたsitemap.xmlを自動生成
- **メタデータ生成**: robots.txt、manifest.json、OpenGraphメタデータを生成
- **Visibility制御**: `public`/`internal`/`draft`設定に基づいてビルド対象を制御
- **環境別ビルド**: production/staging/development/preview環境ごとに異なるビルド結果を生成
- **型安全**: TypeScriptによる完全な型サポート

## インストール

```bash
pnpm add @docs/generator
```

## 使用方法

### レジストリの読み込み

```typescript
import { loadRegistry } from '@docs/generator';

// レジストリを読み込み
const registry = loadRegistry('registry/docs.json');
console.log(`Projects: ${registry.projects.length}`);
```

### ルーティング生成

```typescript
import { loadRegistry, generateRoutes } from '@docs/generator';

// レジストリからルーティング情報を生成
const registry = loadRegistry();
const routes = generateRoutes(registry, {
  env: 'production', // production環境ではpublicのみ
  debug: true,       // デバッグログを出力
});

console.log(`Generated ${routes.length} routes`);
```

### Astro getStaticPaths での使用

```typescript
// src/pages/[project]/[version]/[lang]/[...slug].astro
---
import { loadRegistry, generateRoutes } from '@docs/generator';

export async function getStaticPaths() {
  const registry = loadRegistry();
  return generateRoutes(registry, {
    env: import.meta.env.MODE || 'production'
  });
}

const { docId, title, summary, contentPath } = Astro.props;
const { project, version, lang, slug } = Astro.params;
---

<h1>{title}</h1>
<p>{summary}</p>
```

### サイドバー生成

```typescript
import { loadRegistry, generateSidebar } from '@docs/generator';

const registry = loadRegistry();
const sidebar = generateSidebar(
  registry,
  'sample-docs',  // プロジェクトID
  'v2',           // バージョン
  'ja',           // 言語
  {
    env: 'production',
    baseUrl: '/docs/sample-docs'
  }
);

console.log(`Generated ${sidebar.length} categories`);
```

### サイトマップ生成

```typescript
import { loadRegistry, generateSitemap, sitemapToXml } from '@docs/generator';

const registry = loadRegistry();
const sitemap = generateSitemap(
  registry,
  'https://example.com',
  {
    env: 'production',
    defaultChangefreq: 'weekly',
    defaultPriority: 0.5
  }
);

// XMLとして出力
const xml = sitemapToXml(sitemap);
fs.writeFileSync('sitemap.xml', xml);
```

### メタデータ生成

```typescript
import {
  generateRobotsTxt,
  generateManifest,
  generateOpenGraph
} from '@docs/generator';

// robots.txt
const robotsTxt = generateRobotsTxt('https://example.com', {
  sitemapUrl: '/sitemap.xml'
});

// manifest.json
const manifest = generateManifest(registry, 'sample-docs', {
  lang: 'ja',
  themeColor: '#1e40af'
});

// OpenGraph メタデータ
const og = generateOpenGraph(
  'ページタイトル',
  'ページ説明',
  'https://example.com/page',
  { lang: 'ja' }
);
```

### Visibility制御

```typescript
import { shouldBuildPage } from '@docs/generator';

// ページをビルドすべきかチェック
const result = shouldBuildPage('draft', 'production');
console.log(result.shouldBuild); // false
console.log(result.reason);      // "draft document excluded in production"
```

### フィルタリング

```typescript
import { filterDocumentsByVisibility } from '@docs/generator';

const documents = [
  { id: 'doc1', visibility: 'public' },
  { id: 'doc2', visibility: 'draft' },
  { id: 'doc3', visibility: 'internal' },
];

// production環境でpublicのみフィルタリング
const filtered = filterDocumentsByVisibility(documents, 'production');
console.log(filtered.length); // 1
```

## API

### レジストリローダー

#### `loadRegistry(registryPath?, basePath?): Registry`

レジストリファイルを読み込んでパースします。

**パラメータ:**
- `registryPath` (string, optional): レジストリファイルのパス（デフォルト: `registry/docs.json`）
- `basePath` (string, optional): ベースディレクトリ（デフォルト: `process.cwd()`）

**戻り値:** `Registry` オブジェクト

**例外:**
- `RegistryLoadError`: ファイル読み込みまたはパースに失敗した場合

#### `getProject(registry, projectId): Project | undefined`

レジストリから特定のプロジェクトを取得します。

#### `getDocument(registry, projectId, docId): Document | undefined`

レジストリから特定のドキュメントを取得します。

#### `getRegistryStats(registry): Object`

レジストリの統計情報を取得します。

### ルーティング生成

#### `generateRoutes(registry, options?): StaticPath[]`

レジストリからAstro用のルーティング情報を生成します。

**パラメータ:**
- `registry` (Registry): レジストリオブジェクト
- `options` (GenerateRoutesOptions, optional): 生成オプション
  - `env` (string): ビルド環境（production/staging/development/preview）
  - `projectId` (string): 特定のプロジェクトIDのみ生成
  - `version` (string): 特定のバージョンのみ生成
  - `lang` (string): 特定の言語のみ生成
  - `debug` (boolean): デバッグログを出力

**戻り値:** `StaticPath[]` - Astro getStaticPaths用のパス配列

#### `getRoutesStats(routes): Object`

生成されたルーティング情報の統計を取得します。

#### `routeToUrl(route, baseUrl?): string`

ルーティング情報をURL形式の文字列に変換します。

#### `dumpRoutes(routes, maxRoutes?): void`

ルーティング情報を人間が読みやすい形式で出力します。

### サイドバー生成

#### `generateSidebar(registry, projectId, version, lang, options?): SidebarItem[]`

レジストリからサイドバー構造を生成します。

**パラメータ:**
- `registry` (Registry): レジストリオブジェクト
- `projectId` (string): プロジェクトID
- `version` (string): バージョンID
- `lang` (string): 言語コード
- `options` (GenerateSidebarOptions, optional): 生成オプション
  - `env` (string): ビルド環境
  - `baseUrl` (string): ベースURL
  - `debug` (boolean): デバッグログ出力

**戻り値:** `SidebarItem[]` - サイドバーカテゴリの配列

#### `getSidebarStats(sidebar): Object`

サイドバーの統計情報を取得します。

#### `dumpSidebar(sidebar): void`

サイドバーを人間が読みやすい形式で出力します。

### サイトマップ生成

#### `generateSitemap(registry, baseUrl, options?): SitemapEntry[]`

レジストリからサイトマップを生成します。

**パラメータ:**
- `registry` (Registry): レジストリオブジェクト
- `baseUrl` (string): サイトのベースURL
- `options` (GenerateSitemapOptions, optional): 生成オプション
  - `env` (string): ビルド環境
  - `defaultChangefreq` (string): デフォルト変更頻度
  - `defaultPriority` (number): デフォルト優先度
  - `latestVersionPriorityBoost` (number): 最新バージョンの優先度ブースト

**戻り値:** `SitemapEntry[]` - サイトマップエントリの配列

#### `sitemapToXml(entries): string`

サイトマップエントリをXML形式の文字列に変換します。

#### `getSitemapStats(entries): Object`

サイトマップの統計情報を取得します。

#### `dumpSitemap(entries, maxEntries?): void`

サイトマップを人間が読みやすい形式で出力します。

### メタデータ生成

#### `generateRobotsTxt(baseUrl, options?): string`

robots.txtを生成します。

**パラメータ:**
- `baseUrl` (string): サイトのベースURL
- `options` (GenerateRobotsTxtOptions, optional): 生成オプション
  - `sitemapUrl` (string): サイトマップURL
  - `additionalDisallow` (string[]): 追加のDisallowルール
  - `crawlDelay` (number): クローリング遅延

**戻り値:** `string` - robots.txtの内容

#### `generateManifest(registry, projectId, options?): WebManifest | null`

manifest.jsonを生成します。

**パラメータ:**
- `registry` (Registry): レジストリオブジェクト
- `projectId` (string): プロジェクトID
- `options` (GenerateManifestOptions, optional): 生成オプション
  - `lang` (string): 言語コード
  - `themeColor` (string): テーマカラー
  - `backgroundColor` (string): 背景色
  - `icons` (Array): アイコン設定

**戻り値:** `WebManifest | null` - マニフェストオブジェクト

#### `generateOpenGraph(title, description, url, options?): OpenGraphMeta`

OpenGraphメタデータを生成します。

**パラメータ:**
- `title` (string): ページタイトル
- `description` (string): ページ説明
- `url` (string): ページURL
- `options` (GenerateOpenGraphOptions, optional): 生成オプション
  - `type` (string): ページタイプ
  - `imageUrl` (string): OGイメージURL
  - `siteName` (string): サイト名
  - `lang` (string): 言語コード

**戻り値:** `OpenGraphMeta` - OpenGraphメタデータオブジェクト

#### `openGraphToHtml(meta): string[]`

OpenGraphメタデータをHTMLメタタグの配列に変換します。

### Visibility制御

#### `shouldBuildPage(visibility, env?): VisibilityCheckResult`

ページをビルドすべきかどうかを判定します。

**パラメータ:**
- `visibility` (string): ドキュメントのvisibility設定（public/internal/draft）
- `env` (string, optional): ビルド環境（デフォルト: `process.env.NODE_ENV || 'development'`）

**戻り値:**
```typescript
{
  shouldBuild: boolean;
  reason?: string;
}
```

#### `filterDocumentsByVisibility(documents, env?): T[]`

複数のドキュメントをVisibility設定に基づいてフィルタリングします。

#### `isValidVisibility(visibility): boolean`

Visibility設定の検証を行います。

#### `isValidEnvironment(env): boolean`

環境変数の検証を行います。

## Visibilityルール

| Visibility | production | staging | development | preview |
|-----------|-----------|---------|-------------|---------|
| public    | ✅ ビルド | ✅ ビルド | ✅ ビルド | ✅ ビルド |
| internal  | ❌ 除外  | ✅ ビルド | ✅ ビルド | ✅ ビルド |
| draft     | ❌ 除外  | ❌ 除外  | ✅ ビルド | ✅ ビルド |

## 開発

### テスト実行

```bash
# テスト実行
pnpm test

# カバレッジ付きテスト
pnpm test:coverage

# watch モード
pnpm test:watch
```

### 型チェック

```bash
pnpm typecheck
```

## ライセンス

このパッケージはlibx-devプロジェクトの一部です。
