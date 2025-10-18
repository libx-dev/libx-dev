# Phase 2-2 引き継ぎガイド

**作成日**: 2025-10-18
**対象**: Phase 2-2（UI/テーマ統合）担当者
**前提**: Phase 2-1完了

---

## 📋 はじめに

このドキュメントは、Phase 2-1の成果を引き継ぎ、Phase 2-2（UI/テーマ統合）をスムーズに開始するためのガイドです。

### Phase 2-2の目標

✅ **Phase 2-1で完了したこと**:
- レジストリローダー（`loadRegistry`）
- ルーティング生成（`generateRoutes`）
- サイドバー生成（`generateSidebar`）
- サイトマップ生成（`generateSitemap`）
- メタデータ生成（`generateRobotsTxt`, `generateManifest`, `generateOpenGraph`）

🎯 **Phase 2-2で実装すること**:
- Astroランタイムパッケージ作成
- 実際のAstroページテンプレート実装
- レイアウトコンポーネント実装
- 既存UI/テーマパッケージとの統合

---

## 🚀 クイックスタート

### 1. Phase 2-1の成果物を確認

```bash
# generatorパッケージのディレクトリに移動
cd packages/generator

# テストが全て成功することを確認
pnpm test

# 型チェックが成功することを確認
pnpm typecheck

# デモスクリプトの内容を確認（実行はビルドが必要）
cat examples/basic-usage.js
```

### 2. 生成関数の動作確認

以下のコマンドでgeneratorパッケージのテストを実行し、全ての機能が正常に動作していることを確認：

```bash
cd packages/generator

# サイドバー生成のテスト
pnpm test sidebar

# サイトマップ生成のテスト
pnpm test sitemap

# メタデータ生成のテスト
pnpm test metadata
```

### 3. API仕様の確認

完全なAPI仕様は以下を参照：
- [packages/generator/README.md](../../packages/generator/README.md)

---

## 📦 利用可能な機能一覧

### レジストリローダー

```typescript
import { loadRegistry } from '@docs/generator';

// レジストリを読み込み
const registry = loadRegistry('registry/docs.json');
// または相対パス指定
const registry = loadRegistry('registry/docs.json', '../..');
```

### ルーティング生成

```typescript
import { generateRoutes } from '@docs/generator';

// Astro getStaticPaths() 形式でルーティング生成
const routes = generateRoutes(registry, {
  env: 'production', // or 'staging', 'development', 'preview'
  projectId: 'sample-docs', // オプション: 特定プロジェクトのみ
  version: 'v2', // オプション: 特定バージョンのみ
  lang: 'ja', // オプション: 特定言語のみ
  debug: true // オプション: デバッグログ出力
});

// 戻り値の型
type StaticPath = {
  params: {
    project: string;
    version: string;
    lang: string;
    slug: string;
  };
  props: {
    docId: string;
    projectId: string;
    title: string;
    summary: string;
    keywords: string[];
    tags: string[];
    related?: string[];
    license: string;
    contributors?: string[];
    contentPath: string;
    visibility: string;
    status: string;
  };
};
```

### サイドバー生成

```typescript
import { generateSidebar } from '@docs/generator';

// サイドバー構造を生成
const sidebar = generateSidebar(
  registry,
  'sample-docs', // プロジェクトID
  'v2',          // バージョン
  'ja',          // 言語
  {
    env: 'production',
    baseUrl: '/docs/sample-docs',
    debug: false
  }
);

// 戻り値の型
type SidebarItem = {
  title: string;        // カテゴリタイトル
  slug: string;         // カテゴリslug
  icon?: string;        // アイコン名
  order: number;        // 順序
  items: Array<{        // ドキュメントリスト
    title: string;
    href: string;
    order?: number;
    docId: string;
  }>;
};
```

### サイトマップ生成

```typescript
import { generateSitemap, sitemapToXml } from '@docs/generator';

// サイトマップを生成
const sitemap = generateSitemap(
  registry,
  'https://libx.dev',
  {
    env: 'production',
    defaultChangefreq: 'weekly',
    defaultPriority: 0.5,
    latestVersionPriorityBoost: 0.3
  }
);

// XMLに変換
const xml = sitemapToXml(sitemap);

// ファイルに書き出し（Astroビルドスクリプトで実行）
import fs from 'fs';
fs.writeFileSync('dist/sitemap.xml', xml);
```

### メタデータ生成

```typescript
import {
  generateRobotsTxt,
  generateManifest,
  generateOpenGraph,
  openGraphToHtml
} from '@docs/generator';

// robots.txt
const robotsTxt = generateRobotsTxt('https://libx.dev', {
  sitemapUrl: '/sitemap.xml',
  additionalDisallow: ['/admin']
});

// manifest.json
const manifest = generateManifest(registry, 'sample-docs', {
  lang: 'ja',
  themeColor: '#1e40af',
  backgroundColor: '#ffffff',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' }
  ]
});

// OpenGraph メタデータ
const og = generateOpenGraph(
  'ページタイトル',
  'ページ説明',
  'https://libx.dev/docs/page',
  {
    type: 'article',
    imageUrl: '/og-image.png',
    siteName: 'LibX Documentation',
    lang: 'ja'
  }
);

// HTMLメタタグに変換
const metaTags = openGraphToHtml(og);
// => ['<meta property="og:title" content="..." />', ...]
```

---

## 🏗️ Phase 2-2 実装ガイド

### ステップ1: Astroランタイムパッケージ作成

#### 1-1. ディレクトリ構造を作成

```bash
# プロジェクトルートで実行
mkdir -p packages/runtime/src/{pages,layouts,components,lib}
```

推奨ディレクトリ構造:

```
packages/runtime/
├── src/
│   ├── pages/
│   │   └── [project]/
│   │       └── [version]/
│   │           └── [lang]/
│   │               └── [...slug].astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── DocLayout.astro
│   ├── components/
│   │   ├── Sidebar.astro
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── TableOfContents.astro
│   └── lib/
│       └── utils.ts
├── public/
│   ├── robots.txt        # generateRobotsTxt()で生成
│   ├── manifest.json     # generateManifest()で生成
│   └── sitemap.xml       # generateSitemap()で生成
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

#### 1-2. package.json を作成

```json
{
  "name": "@docs/runtime",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "@docs/generator": "workspace:*",
    "@docs/ui": "workspace:*",
    "@docs/theme": "workspace:*",
    "@docs/i18n": "workspace:*",
    "@docs/versioning": "workspace:*",
    "astro": "^5.7.12"
  },
  "devDependencies": {
    "@types/node": "^18.19.100",
    "typescript": "^5.8.3"
  }
}
```

#### 1-3. astro.config.mjs を作成

参考実装: `apps/sample-docs/astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: 'https://libx.dev',
  base: '/', // 統合サイトではルートパス
  integrations: [
    mdx({
      syntaxHighlight: 'shiki',
      shikiConfig: {
        theme: 'github-dark',
        wrap: true
      }
    })
  ],
  vite: {
    resolve: {
      alias: {
        '@docs/generator': path.resolve(__dirname, '../generator/src'),
        '@docs/ui': path.resolve(__dirname, '../ui/src'),
        '@docs/theme': path.resolve(__dirname, '../theme/src'),
        '@docs/i18n': path.resolve(__dirname, '../i18n/src'),
        '@docs/versioning': path.resolve(__dirname, '../versioning/src'),
      }
    }
  }
});
```

---

### ステップ2: Astroページテンプレート実装

#### 2-1. 動的ルーティングページを作成

**ファイル**: `packages/runtime/src/pages/[project]/[version]/[lang]/[...slug].astro`

```astro
---
import { loadRegistry, generateRoutes } from '@docs/generator';
import DocLayout from '../../../../layouts/DocLayout.astro';

// Astro getStaticPaths() - ルーティング生成
export async function getStaticPaths() {
  const registry = loadRegistry('registry/docs.json', '../../../..');

  // 環境に応じたルーティング生成
  const routes = generateRoutes(registry, {
    env: import.meta.env.MODE || 'production'
  });

  return routes;
}

// Astroから渡されるprops
const {
  docId,
  projectId,
  title,
  summary,
  keywords,
  tags,
  related,
  license,
  contributors,
  contentPath,
  visibility,
  status
} = Astro.props;

// URLパラメータ
const { project, version, lang, slug } = Astro.params;

// サイドバーを生成
const registry = loadRegistry('registry/docs.json', '../../../..');
const sidebar = generateSidebar(registry, project, version, lang, {
  env: import.meta.env.MODE || 'production',
  baseUrl: ''
});

// OpenGraphメタデータを生成
const pageUrl = new URL(Astro.url.pathname, Astro.site).toString();
const ogMeta = generateOpenGraph(title, summary, pageUrl, {
  lang,
  siteName: 'LibX Documentation'
});
---

<DocLayout
  title={title}
  summary={summary}
  sidebar={sidebar}
  ogMeta={ogMeta}
  keywords={keywords}
  tags={tags}
  license={license}
  contributors={contributors}
>
  <!--
    TODO: MDXコンテンツの読み込み
    contentPath からコンテンツを読み込んで表示
  -->
  <div class="prose">
    <h1>{title}</h1>
    <p>{summary}</p>
    <!-- コンテンツをここに配置 -->
  </div>

  <!-- related があれば関連ドキュメントを表示 -->
  {related && related.length > 0 && (
    <section class="related-docs">
      <h2>関連ドキュメント</h2>
      <ul>
        {related.map(relatedId => (
          <li>{relatedId}</li>
        ))}
      </ul>
    </section>
  )}
</DocLayout>
```

#### 2-2. 動作確認

```bash
cd packages/runtime

# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm dev

# ブラウザで確認
# http://localhost:4321/sample-docs/v2/ja/guide/getting-started
```

---

### ステップ3: レイアウトコンポーネント実装

#### 3-1. BaseLayout.astro を作成

**ファイル**: `packages/runtime/src/layouts/BaseLayout.astro`

```astro
---
import { openGraphToHtml } from '@docs/generator';

interface Props {
  title: string;
  description?: string;
  ogMeta?: Record<string, string>;
  lang?: string;
}

const {
  title,
  description = '',
  ogMeta,
  lang = 'ja'
} = Astro.props;

const metaTags = ogMeta ? openGraphToHtml(ogMeta) : [];
---

<!DOCTYPE html>
<html lang={lang}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  {description && <meta name="description" content={description}>}

  <!-- OpenGraph メタタグ -->
  {metaTags.map(tag => <Fragment set:html={tag} />)}

  <!-- Manifest -->
  <link rel="manifest" href="/manifest.json">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">

  <!-- スタイル -->
  <link rel="stylesheet" href="/styles/global.css">
</head>
<body>
  <slot />
</body>
</html>
```

#### 3-2. DocLayout.astro を作成

**ファイル**: `packages/runtime/src/layouts/DocLayout.astro`

```astro
---
import BaseLayout from './BaseLayout.astro';
import Sidebar from '../components/Sidebar.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  summary?: string;
  sidebar: any[];
  ogMeta?: Record<string, string>;
  keywords?: string[];
  tags?: string[];
  license?: string;
  contributors?: string[];
}

const {
  title,
  summary,
  sidebar,
  ogMeta,
  keywords = [],
  tags = [],
  license,
  contributors = []
} = Astro.props;
---

<BaseLayout title={title} description={summary} ogMeta={ogMeta}>
  <div class="layout">
    <Header />

    <div class="main-container">
      <!-- サイドバー -->
      <aside class="sidebar">
        <Sidebar items={sidebar} />
      </aside>

      <!-- メインコンテンツ -->
      <main class="content">
        <article>
          <slot />
        </article>

        <!-- メタ情報 -->
        {(keywords.length > 0 || tags.length > 0) && (
          <div class="meta">
            {keywords.length > 0 && (
              <div class="keywords">
                <strong>Keywords:</strong> {keywords.join(', ')}
              </div>
            )}
            {tags.length > 0 && (
              <div class="tags">
                <strong>Tags:</strong> {tags.join(', ')}
              </div>
            )}
          </div>
        )}

        <!-- ライセンス表示 -->
        {license && (
          <div class="license">
            <p>License: {license}</p>
          </div>
        )}

        <!-- 貢献者 -->
        {contributors.length > 0 && (
          <div class="contributors">
            <strong>Contributors:</strong> {contributors.join(', ')}
          </div>
        )}
      </main>
    </div>

    <Footer />
  </div>
</BaseLayout>

<style>
  .layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-container {
    flex: 1;
    display: flex;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .sidebar {
    width: 280px;
    flex-shrink: 0;
  }

  .content {
    flex: 1;
    padding: 2rem;
    max-width: 800px;
  }

  .meta, .license, .contributors {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }
</style>
```

#### 3-3. Sidebar.astro を作成

**ファイル**: `packages/runtime/src/components/Sidebar.astro`

```astro
---
interface Props {
  items: Array<{
    title: string;
    slug: string;
    icon?: string;
    order: number;
    items: Array<{
      title: string;
      href: string;
      order?: number;
      docId: string;
    }>;
  }>;
}

const { items } = Astro.props;
---

<nav class="sidebar-nav">
  {items.map(category => (
    <div class="category">
      <h3 class="category-title">
        {category.icon && <span class="icon">{category.icon}</span>}
        {category.title}
      </h3>
      <ul class="doc-list">
        {category.items.map(doc => (
          <li>
            <a href={doc.href} class="doc-link">
              {doc.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  ))}
</nav>

<style>
  .sidebar-nav {
    padding: 1rem;
  }

  .category {
    margin-bottom: 1.5rem;
  }

  .category-title {
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }

  .icon {
    margin-right: 0.5rem;
  }

  .doc-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .doc-list li {
    margin-bottom: 0.25rem;
  }

  .doc-link {
    display: block;
    padding: 0.5rem 0.75rem;
    color: #374151;
    text-decoration: none;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
  }

  .doc-link:hover {
    background-color: #f3f4f6;
  }

  .doc-link[aria-current="page"] {
    background-color: #e5e7eb;
    font-weight: 500;
  }
</style>
```

---

### ステップ4: メタデータファイルの生成と配置

#### 4-1. ビルドスクリプトを作成

**ファイル**: `packages/runtime/scripts/generate-metadata.js`

```javascript
#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { loadRegistry, generateRobotsTxt, generateManifest, generateSitemap, sitemapToXml } from '@docs/generator';

console.log('メタデータファイルを生成中...');

// レジストリを読み込み
const registry = loadRegistry('registry/docs.json', '../..');

// robots.txt を生成
const robotsTxt = generateRobotsTxt('https://libx.dev', {
  sitemapUrl: '/sitemap.xml'
});
writeFileSync('public/robots.txt', robotsTxt);
console.log('✅ robots.txt を生成しました');

// サイトマップを生成
const sitemap = generateSitemap(registry, 'https://libx.dev', {
  env: 'production',
  defaultChangefreq: 'weekly',
  defaultPriority: 0.5,
  latestVersionPriorityBoost: 0.3
});
const sitemapXml = sitemapToXml(sitemap);
writeFileSync('public/sitemap.xml', sitemapXml);
console.log(`✅ sitemap.xml を生成しました (${sitemap.length}件のURL)`);

// 各プロジェクトのmanifest.jsonを生成
const projects = ['sample-docs', 'test-verification', 'libx-docs'];
for (const projectId of projects) {
  const manifest = generateManifest(registry, projectId, {
    lang: 'ja',
    themeColor: '#1e40af'
  });

  if (manifest) {
    writeFileSync(
      `public/${projectId}-manifest.json`,
      JSON.stringify(manifest, null, 2)
    );
    console.log(`✅ ${projectId}-manifest.json を生成しました`);
  }
}

console.log('メタデータファイルの生成が完了しました');
```

#### 4-2. package.jsonにスクリプトを追加

```json
{
  "scripts": {
    "dev": "astro dev",
    "prebuild": "node scripts/generate-metadata.js",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

---

## 🧪 テスト・デバッグ手順

### 1. ローカル開発サーバーでの確認

```bash
cd packages/runtime
pnpm dev
```

以下のURLで動作確認：
- `http://localhost:4321/sample-docs/v2/ja/guide/getting-started`
- `http://localhost:4321/test-verification/v2/en/guide/getting-started`
- `http://localhost:4321/libx-docs/v1/ja/guide/getting-started`

### 2. サイドバーの表示確認

- カテゴリが正しく表示されているか
- ドキュメントリンクが正しく動作するか
- 現在のページがハイライトされているか
- アイコンが表示されているか（設定されている場合）

### 3. メタデータの確認

```bash
# ビルド実行
pnpm build

# 生成されたファイルを確認
ls -la dist/

# robots.txtの内容確認
cat dist/robots.txt

# sitemap.xmlの内容確認（最初の10行）
head -20 dist/sitemap.xml

# manifest.jsonの確認
cat dist/sample-docs-manifest.json | jq .
```

### 4. OpenGraphメタデータの確認

ブラウザの開発者ツールで確認：

```html
<!-- Headタグ内に以下が含まれているか -->
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:url" content="..." />
<meta property="og:locale" content="..." />
```

---

## 🎨 既存UI/テーマパッケージとの統合

### 既存パッケージの活用

Phase 2-2では、以下の既存パッケージを統合します：

1. **@docs/ui** - UIコンポーネント
   - `packages/ui/src/components/`配下のコンポーネント
   - Button, Card, Tabs, Icons など

2. **@docs/theme** - テーマシステム
   - CSS変数、カラーパレット
   - ダークモード対応

3. **@docs/i18n** - 国際化
   - 言語ユーティリティ
   - ローカライゼーション

4. **@docs/versioning** - バージョン管理
   - バージョン切り替えUI
   - ページネーション

### 統合例: 既存コンポーネントの使用

```astro
---
// 既存UIコンポーネントをインポート
import { Button, Card, Tabs } from '@docs/ui/components';
import { ThemeToggle } from '@docs/theme/components';
---

<div class="page">
  <ThemeToggle />

  <Card>
    <h2>カードタイトル</h2>
    <p>カードコンテンツ</p>
    <Button>詳細を見る</Button>
  </Card>

  <Tabs items={[
    { label: 'タブ1', content: '内容1' },
    { label: 'タブ2', content: '内容2' }
  ]} />
</div>
```

---

## ⚠️ 注意事項・制約事項

### 1. MDXコンテンツの読み込み

現在のgeneratorパッケージは`contentPath`を返しますが、実際のMDXファイルの読み込みはPhase 2-2で実装が必要です。

**対応方法**:
- Astroの`getCollection()`を使用
- または`contentPath`からファイルを直接読み込み

### 2. ベースURLの設定

統合サイトでは各プロジェクトが異なるベースパスを持つ可能性があります：

- トップページ: `/`
- sample-docs: `/docs/sample-docs` または `/sample-docs`
- その他: プロジェクトごとに設定

`astro.config.mjs`の`base`設定に注意してください。

### 3. 環境変数の管理

```bash
# .env.production
NODE_ENV=production
PUBLIC_SITE_URL=https://libx.dev

# .env.development
NODE_ENV=development
PUBLIC_SITE_URL=http://localhost:4321
```

---

## 📚 参考資料

### Phase 2-1成果物

- [Phase 2-1完了報告書](./phase-2-1-completion-report.md)
- [packages/generator/README.md](../../packages/generator/README.md)
- [packages/generator/examples/basic-usage.js](../../packages/generator/examples/basic-usage.js)

### 既存実装（参考）

- [apps/sample-docs/astro.config.mjs](../../apps/sample-docs/astro.config.mjs)
- [apps/sample-docs/src/pages/[version]/[lang]/[...slug].astro](../../apps/sample-docs/src/pages/[version]/[lang]/[...slug].astro)
- [apps/sample-docs/src/layouts/DocLayout.astro](../../apps/sample-docs/src/layouts/DocLayout.astro)

### Phase 2計画書

- [Phase 2-2 UI/テーマ統合計画](../phase-2-2-ui-theme.md)
- [Astro統合技術調査](../research/astro-integration.md)
- [UI/テーマ準備状況評価](../research/ui-theme-readiness.md)

---

## ✅ Phase 2-2 完了チェックリスト

Phase 2-2を完了する際は、以下のチェックリストを確認してください：

### 必須項目

- [ ] Astroランタイムパッケージが作成されている
- [ ] `[...slug].astro`でページが正しく生成される
- [ ] サイドバーが表示され、ナビゲーションが動作する
- [ ] OpenGraphメタデータが正しく設定されている
- [ ] robots.txt、sitemap.xmlが生成されている
- [ ] manifest.jsonが生成されている
- [ ] `pnpm build`が成功する
- [ ] 生成されたサイトが正しく表示される

### 推奨項目

- [ ] ダークモード対応
- [ ] レスポンシブデザイン
- [ ] アクセシビリティチェック（WAVE、axe）
- [ ] パフォーマンス測定（Lighthouse）
- [ ] 既存UIコンポーネントの80%以上を統合

### オプション項目

- [ ] 検索機能の統合（Pagefind）
- [ ] 目次（Table of Contents）の表示
- [ ] ページネーション（前へ/次へ）
- [ ] 関連ドキュメントの表示

---

## 🆘 トラブルシューティング

### よくある問題

#### 1. `Cannot find module '@docs/generator'`

**原因**: パッケージのエイリアス設定が正しくない

**解決策**:
```javascript
// astro.config.mjs
vite: {
  resolve: {
    alias: {
      '@docs/generator': path.resolve(__dirname, '../generator/src'),
    }
  }
}
```

#### 2. サイドバーが空で表示される

**原因**: カテゴリのdocs配列が空、またはドキュメントがフィルタリングされている

**デバッグ**:
```typescript
const sidebar = generateSidebar(registry, project, version, lang, {
  debug: true // デバッグログを有効化
});
```

#### 3. ルーティングが生成されない

**原因**: Visibilityフィルタリング、バージョン不一致

**デバッグ**:
```typescript
const routes = generateRoutes(registry, {
  env: 'development', // 全て表示
  debug: true
});
```

---

## 📞 サポート・質問

Phase 2-2実装中に不明点があれば、以下を参照してください：

1. **API仕様**: `packages/generator/README.md`
2. **完了報告書**: `docs/new-generator-plan/status/phase-2-1-completion-report.md`
3. **既存実装**: `apps/sample-docs/` ディレクトリ
4. **技術調査**: `docs/new-generator-plan/research/astro-integration.md`

---

**作成者**: Claude
**作成日**: 2025-10-18
**対象フェーズ**: Phase 2-2
**前提フェーズ**: Phase 2-1（完了）

---

🎯 **次のステップ**: [Phase 2-2 UI/テーマ統合計画](../phase-2-2-ui-theme.md)を確認し、実装を開始してください。
