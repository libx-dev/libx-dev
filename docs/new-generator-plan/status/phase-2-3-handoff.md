# Phase 2-3 引き継ぎガイド

**作成日**: 2025-10-18
**対象**: Phase 2-3（MDXコンテンツ統合・既存UI連携）担当者
**前提**: Phase 2-2完了

---

## 📋 はじめに

このドキュメントは、Phase 2-2の成果を引き継ぎ、Phase 2-3（MDXコンテンツ統合・既存UI連携）をスムーズに開始するためのガイドです。

### Phase 2-3の目標

✅ **Phase 2-2で完了したこと**:
- Astroランタイムパッケージ作成（`packages/runtime/`）
- 動的ルーティングページ `[project]/[version]/[lang]/[...slug].astro` の実装
- BaseLayout.astro、DocLayout.astro レイアウトシステムの実装
- Sidebar、Header、Footerコンポーネントの実装
- メタデータ自動生成（robots.txt、sitemap.xml、manifest.json）

🎯 **Phase 2-3で実装すること**:
- MDXコンテンツの実際の読み込みと表示
- 既存UIコンポーネント（@docs/ui）の統合
- 新規コンポーネント追加（Glossary、RelatedDocs等）
- 検索機能統合（Pagefind）
- パフォーマンス最適化

---

## 🚀 クイックスタート

### 1. Phase 2-2の成果物を確認

```bash
# runtimeパッケージのディレクトリに移動
cd packages/runtime

# 依存関係が正しくインストールされていることを確認
pnpm install

# ディレクトリ構造を確認
tree -L 3 src/
```

期待される出力:
```
src/
├── components
│   ├── Footer.astro
│   ├── Header.astro
│   └── Sidebar.astro
├── layouts
│   ├── BaseLayout.astro
│   └── DocLayout.astro
├── lib
└── pages
    └── [project]
        └── [version]
            └── [lang]
                └── [...slug].astro
```

### 2. 現在のプレースホルダー部分を確認

Phase 2-2では、MDXコンテンツの読み込み部分はプレースホルダーになっています：

**ファイル**: `src/pages/[project]/[version]/[lang]/[...slug].astro`

```astro
<!--
  TODO: MDXコンテンツの読み込み
  contentPath からコンテンツを読み込んで表示
  Phase 2-3で実装予定
-->
<div class="prose">
  <h1>{title}</h1>
  <p class="summary">{summary}</p>

  <div class="placeholder-content">
    <p>ドキュメントID: <code>{docId}</code></p>
    <p>コンテンツパス: <code>{contentPath}</code></p>
    <p>Visibility: <code>{visibility}</code></p>
    <p>ステータス: <code>{status}</code></p>
  </div>
</div>
```

### 3. レジストリ構造の確認

レジストリ（`registry/docs.json`）から提供される情報を確認：

```bash
# レジストリの構造を確認
cat registry/docs.json | jq '.projects[0].documents[0]' | head -30
```

---

## 📦 利用可能な機能一覧

### Phase 2-2で完成した機能

#### 1. 動的ルーティング生成

```typescript
import { loadRegistry, generateRoutes } from '@docs/generator';

export async function getStaticPaths() {
  const registry = loadRegistry('registry/docs.json', '../../../..');
  const routes = generateRoutes(registry, {
    env: import.meta.env.MODE || 'production'
  });
  return routes;
}
```

**提供されるprops**:
```typescript
{
  docId: string;           // ドキュメントID
  projectId: string;       // プロジェクトID
  title: string;           // ドキュメントタイトル
  summary: string;         // 概要
  keywords: string[];      // キーワード
  tags: string[];          // タグ
  related: string[];       // 関連ドキュメントID
  license: string;         // ライセンス
  contributors: string[];  // 貢献者
  contentPath: string;     // MDXファイルパス ← Phase 2-3で使用
  visibility: string;      // 公開設定
  status: string;          // ステータス
}
```

#### 2. サイドバー生成

```typescript
import { generateSidebar } from '@docs/generator';

const sidebar = generateSidebar(registry, project, version, lang, {
  env: import.meta.env.MODE || 'production',
  baseUrl: ''
});
```

**戻り値の型**:
```typescript
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

#### 3. メタデータ生成

```typescript
import { generateOpenGraph, openGraphToHtml } from '@docs/generator';

const ogMeta = generateOpenGraph(title, summary, pageUrl, {
  lang,
  siteName: 'LibX Documentation'
});

const metaTags = openGraphToHtml(ogMeta);
// => ['<meta property="og:title" content="..." />', ...]
```

#### 4. レイアウトシステム

**BaseLayout.astro**:
- HTML基本構造
- OpenGraphメタタグ挿入
- CSS変数テーマシステム（ダークモード対応）

**DocLayout.astro**:
- ヘッダー、サイドバー、フッター統合
- メタ情報表示（keywords、tags、license、contributors）
- レスポンシブデザイン

---

## 🏗️ Phase 2-3 実装ガイド

### ステップ1: MDXコンテンツの読み込み実装

#### 1-1. MDXファイルの配置場所を確認

レジストリの`contentPath`フィールドから、実際のMDXファイルの場所を確認します。

**想定される配置**:
```
registry/
└── content/
    └── [projectId]/
        └── [version]/
            └── [lang]/
                └── [docId].mdx
```

または

```
apps/[projectId]/
└── src/
    └── content/
        └── docs/
            └── [version]/
                └── [lang]/
                    └── [docId].mdx
```

#### 1-2. MDXファイルの動的import実装

**方法1: Astroの動的import（推奨）**

```astro
---
// src/pages/[project]/[version]/[lang]/[...slug].astro

import { loadRegistry, generateRoutes, generateSidebar, generateOpenGraph } from '@docs/generator';
import DocLayout from '../../../../layouts/DocLayout.astro';

export async function getStaticPaths() {
  const registry = loadRegistry('registry/docs.json', '../../../..');
  const routes = generateRoutes(registry, {
    env: import.meta.env.MODE || 'production',
    debug: true
  });
  return routes;
}

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
  contentPath,  // ← これを使用してMDXを読み込む
  visibility,
  status
} = Astro.props;

const { project, version, lang, slug } = Astro.params;

// MDXファイルの動的import
// contentPath例: "registry/content/sample-docs/v2/ja/getting-started.mdx"
let Content;
try {
  const module = await import(`../../../../${contentPath}`);
  Content = module.default;
} catch (error) {
  console.error(`MDXファイルの読み込みに失敗: ${contentPath}`, error);
  Content = null;
}

// レジストリ再読み込み（サイドバー用）
const registry = loadRegistry('registry/docs.json', '../../../..');
const sidebar = generateSidebar(registry, project, version, lang, {
  env: import.meta.env.MODE || 'production',
  baseUrl: ''
});

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
  project={project}
  version={version}
  lang={lang}
>
  {Content ? (
    <div class="prose">
      <Content />
    </div>
  ) : (
    <div class="error-message">
      <h1>{title}</h1>
      <p>コンテンツの読み込みに失敗しました。</p>
      <p>パス: <code>{contentPath}</code></p>
    </div>
  )}

  <!-- 関連ドキュメント -->
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

**方法2: Astro Content Collections（代替案）**

Content Collectionsを使用する場合：

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const docsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    keywords: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  })
});

export const collections = {
  'docs': docsCollection,
};
```

```astro
---
// ページファイル内
import { getCollection } from 'astro:content';

// Content Collectionsから取得
const allDocs = await getCollection('docs');
const doc = allDocs.find(d => d.id === docId);

if (doc) {
  const { Content } = await doc.render();
}
---
```

#### 1-3. MDXファイルのフロントマター処理

MDXファイル内のフロントマターとレジストリデータの優先順位を決定：

**優先順位**: レジストリ > MDXフロントマター

理由: レジストリが単一ソース・オブ・トゥルースとして機能するため。

---

### ステップ2: 既存UIコンポーネント（@docs/ui）の統合

#### 2-1. @docs/uiパッケージのAstroバージョン確認

現在の状況:
- `packages/ui/package.json`: `"astro": "^3.0.0"`
- `packages/runtime/package.json`: `"astro": "^5.7.12"`

**必要な対応**:

```bash
cd packages/ui

# Astroバージョンを5.7.12に更新
pnpm add astro@^5.7.12

# 動作確認
cd ../runtime
pnpm dev
```

#### 2-2. 既存UIコンポーネントの活用

**利用可能なコンポーネント**:

```astro
---
// 既存UIコンポーネントのインポート例
import { Card, CardGrid, LinkCard } from '@docs/ui/components';
import { Alert, Banner } from '@docs/ui/components';
import { Tabs, TabItem } from '@docs/ui/components/Tabs';
import { ThemeToggle } from '@docs/ui/components';
import { TableOfContents } from '@docs/ui/components/TableOfContents';
import { Pagination } from '@docs/ui/components';
import { LicenseAttribution } from '@docs/ui/components';
---

<!-- 使用例 -->
<Card>
  <h3>カードタイトル</h3>
  <p>カードコンテンツ</p>
</Card>

<Alert type="info">
  重要な情報をここに記載
</Alert>

<ThemeToggle />
```

#### 2-3. DocLayout.astroへの既存コンポーネント統合

```astro
---
// src/layouts/DocLayout.astro
import BaseLayout from './BaseLayout.astro';
import { Sidebar } from '@docs/ui/components';  // 既存Sidebarを使用
import { Navigation } from '@docs/ui/components';  // 既存Navigationを使用
import { Footer } from '@docs/ui/components';  // 既存Footerを使用
import { ThemeToggle } from '@docs/ui/components';
import { TableOfContents } from '@docs/ui/components/TableOfContents';

// ... props定義 ...
---

<BaseLayout title={title} description={summary} ogMeta={ogMeta} lang={lang} keywords={keywords}>
  <div class="layout">
    <!-- 既存Navigationコンポーネントを使用 -->
    <Navigation project={project} version={version} lang={lang}>
      <ThemeToggle slot="theme-toggle" />
    </Navigation>

    <div class="main-container">
      <!-- 既存Sidebarコンポーネントを使用 -->
      <aside class="sidebar-wrapper">
        <Sidebar items={sidebar} currentPath={Astro.url.pathname} />
      </aside>

      <main class="content">
        <article class="article">
          <slot />
        </article>

        <!-- 目次を追加 -->
        <aside class="toc-wrapper">
          <TableOfContents />
        </aside>
      </main>
    </div>

    <!-- 既存Footerコンポーネントを使用 -->
    <Footer />
  </div>
</BaseLayout>
```

---

### ステップ3: 新規コンポーネント実装

#### 3-1. Glossary.astro（用語集表示）

**ファイル**: `packages/runtime/src/components/Glossary.astro`

```astro
---
interface Props {
  terms: Array<{
    id: string;
    term: Record<string, string>;  // 多言語対応
    definition: Record<string, string>;
    aliases?: string[];
    relatedDocs?: string[];
    tags?: string[];
  }>;
  lang: string;
}

const { terms, lang } = Astro.props;

// 言語に応じたソート
const sortedTerms = terms.sort((a, b) => {
  const termA = a.term[lang] || a.term['en'];
  const termB = b.term[lang] || b.term['en'];
  return termA.localeCompare(termB, lang);
});
---

<div class="glossary">
  <h2>用語集</h2>
  <dl class="glossary-list">
    {sortedTerms.map(item => (
      <div class="glossary-item">
        <dt id={item.id} class="glossary-term">
          {item.term[lang] || item.term['en']}
        </dt>
        <dd class="glossary-definition">
          {item.definition[lang] || item.definition['en']}

          {item.aliases && item.aliases.length > 0 && (
            <div class="aliases">
              別名: {item.aliases.join(', ')}
            </div>
          )}

          {item.relatedDocs && item.relatedDocs.length > 0 && (
            <div class="related">
              関連: {item.relatedDocs.map(docId => (
                <a href={`#${docId}`}>{docId}</a>
              )).join(', ')}
            </div>
          )}
        </dd>
      </div>
    ))}
  </dl>
</div>

<style>
  .glossary {
    margin: 2rem 0;
  }

  .glossary-list {
    display: grid;
    gap: 1.5rem;
  }

  .glossary-item {
    border-left: 3px solid var(--color-primary);
    padding-left: 1rem;
  }

  .glossary-term {
    font-weight: 600;
    font-size: 1.125rem;
    margin-bottom: 0.5rem;
  }

  .glossary-definition {
    color: var(--color-secondary);
  }

  .aliases, .related {
    font-size: 0.875rem;
    margin-top: 0.5rem;
    font-style: italic;
  }
</style>
```

#### 3-2. RelatedDocs.astro（関連ドキュメント表示）

**ファイル**: `packages/runtime/src/components/RelatedDocs.astro`

```astro
---
import { loadRegistry, getDocument } from '@docs/generator';

interface Props {
  relatedDocIds: string[];
  projectId: string;
  currentLang: string;
  currentVersion: string;
}

const { relatedDocIds, projectId, currentLang, currentVersion } = Astro.props;

// レジストリから関連ドキュメント情報を取得
const registry = loadRegistry('registry/docs.json', '../../../../');
const relatedDocs = relatedDocIds
  .map(docId => getDocument(registry, projectId, docId))
  .filter(doc => doc !== undefined);
---

{relatedDocs.length > 0 && (
  <section class="related-docs">
    <h2>関連ドキュメント</h2>
    <div class="related-grid">
      {relatedDocs.map(doc => (
        <a
          href={`/${projectId}/${currentVersion}/${currentLang}/${doc.slug}`}
          class="related-card"
        >
          <h3>{doc.title[currentLang] || doc.title['en']}</h3>
          <p>{doc.summary[currentLang] || doc.summary['en']}</p>
          {doc.tags && doc.tags.length > 0 && (
            <div class="tags">
              {doc.tags.map(tag => (
                <span class="tag">{tag}</span>
              ))}
            </div>
          )}
        </a>
      ))}
    </div>
  </section>
)}

<style>
  .related-docs {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border);
  }

  .related-docs h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .related-card {
    display: block;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .related-card:hover {
    border-color: var(--color-primary);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .related-card h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--color-text);
  }

  .related-card p {
    font-size: 0.875rem;
    color: var(--color-secondary);
    margin-bottom: 1rem;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    background-color: var(--color-border);
    border-radius: 0.25rem;
    color: var(--color-text);
  }
</style>
```

#### 3-3. VersionSelector.astro（バージョン切り替え）

**ファイル**: `packages/runtime/src/components/VersionSelector.astro`

```astro
---
import { loadRegistry, getProject } from '@docs/generator';

interface Props {
  projectId: string;
  currentVersion: string;
  lang: string;
  slug: string;
}

const { projectId, currentVersion, lang, slug } = Astro.props;

// レジストリからバージョン情報を取得
const registry = loadRegistry('registry/docs.json', '../../../../');
const project = getProject(registry, projectId);

if (!project) {
  throw new Error(`Project not found: ${projectId}`);
}

const versions = project.versions.map(v => ({
  id: v.id,
  name: v.name[lang] || v.name['en'],
  status: v.status,
  isLatest: v.id === project.latestVersion,
  releaseDate: v.releaseDate
})).sort((a, b) => {
  // 最新版を最初に
  if (a.isLatest) return -1;
  if (b.isLatest) return 1;
  // リリース日でソート
  return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
});
---

<div class="version-selector">
  <label for="version-select">バージョン:</label>
  <select
    id="version-select"
    class="version-select"
    onchange="window.location.href = this.value"
  >
    {versions.map(version => (
      <option
        value={`/${projectId}/${version.id}/${lang}/${slug}`}
        selected={version.id === currentVersion}
      >
        {version.name}
        {version.isLatest && ' (最新)'}
        {version.status === 'deprecated' && ' (非推奨)'}
      </option>
    ))}
  </select>
</div>

<style>
  .version-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .version-selector label {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .version-select {
    padding: 0.5rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.375rem;
    background-color: var(--color-bg);
    color: var(--color-text);
    font-size: 0.875rem;
    cursor: pointer;
    transition: border-color 0.2s ease;
  }

  .version-select:hover {
    border-color: var(--color-primary);
  }

  .version-select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
  }
</style>
```

---

### ステップ4: 検索機能統合（Pagefind）

#### 4-1. Pagefindのインストール

```bash
cd packages/runtime
pnpm add -D pagefind
```

#### 4-2. ビルドスクリプトの更新

```json
{
  "scripts": {
    "prebuild": "node scripts/generate-metadata.js",
    "build": "astro build",
    "postbuild": "pagefind --site dist --glob \"**/*.html\""
  }
}
```

#### 4-3. 検索UIコンポーネント作成

**ファイル**: `packages/runtime/src/components/Search.astro`

```astro
---
// 検索コンポーネント
---

<div class="search-container">
  <div id="search"></div>
</div>

<script>
  import { PagefindUI } from '@pagefind/default-ui';

  new PagefindUI({
    element: '#search',
    showSubResults: true,
    showImages: false,
    excerptLength: 30
  });
</script>

<style>
  .search-container {
    margin: 2rem 0;
  }
</style>

<link href="/_pagefind/pagefind-ui.css" rel="stylesheet">
```

---

### ステップ5: パフォーマンス最適化

#### 5-1. 画像最適化

```bash
# Astro Image統合
pnpm add @astrojs/image
```

```javascript
// astro.config.mjs
import image from '@astrojs/image';

export default defineConfig({
  integrations: [
    mdx(),
    image({
      serviceEntryPoint: '@astrojs/image/sharp'
    })
  ]
});
```

#### 5-2. コード分割最適化

```javascript
// astro.config.mjs
export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['astro'],
            'ui': ['@docs/ui'],
          }
        }
      }
    }
  }
});
```

---

## ✅ Phase 2-3 完了チェックリスト

### 必須項目

- [ ] MDXコンテンツの読み込みが正常に動作する
- [ ] 既存UIコンポーネント（@docs/ui）が統合されている
- [ ] Glossaryコンポーネントが実装されている
- [ ] RelatedDocsコンポーネントが実装されている
- [ ] VersionSelectorコンポーネントが実装されている
- [ ] 検索機能（Pagefind）が動作する
- [ ] `pnpm build`が成功する
- [ ] 生成されたサイトが正しく表示される
- [ ] 全てのリンクが正常に動作する

### 推奨項目

- [ ] ダークモード切り替えUIが動作する
- [ ] レスポンシブデザインが適用されている
- [ ] アクセシビリティチェック（WAVE、axe）をクリア
- [ ] パフォーマンス測定（Lighthouse）でスコア80以上
- [ ] 目次（TableOfContents）が表示される
- [ ] ページネーション（前へ/次へ）が動作する

### オプション項目

- [ ] 画像最適化が適用されている
- [ ] コード分割が最適化されている
- [ ] CSS最小化が適用されている
- [ ] Service Workerが実装されている（PWA対応）

---

## ⚠️ 注意事項・制約事項

### 1. MDXファイルのパス解決

**問題**: `contentPath`からの相対パス解決が複雑

**対応**:
- Astroのimport.meta.globを使用した事前収集
- または、Content Collectionsへの移行を検討

### 2. Astroバージョンの統一

**重要**: `packages/ui`のAstroバージョンを5.7.12に統一すること

```bash
cd packages/ui
pnpm add astro@^5.7.12
```

### 3. ビルド時のメモリ使用量

大量のMDXファイルをビルドする場合、Node.jsのメモリ制限を増やす：

```json
{
  "scripts": {
    "build": "NODE_OPTIONS=--max-old-space-size=4096 astro build"
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

### 2. MDXコンテンツの表示確認

- タイトル、本文が正しく表示されているか
- コードブロックのシンタックスハイライトが動作しているか
- 画像が正しく表示されているか
- リンクが正しく動作しているか

### 3. UIコンポーネントの確認

- サイドバーの展開/折りたたみが動作するか
- テーマ切り替えが動作するか
- バージョンセレクターが動作するか
- 検索機能が動作するか

### 4. ビルドテスト

```bash
# ビルド実行
pnpm build

# 生成ファイル確認
ls -la dist/

# プレビュー
pnpm preview
```

### 5. パフォーマンステスト

```bash
# Lighthouseでパフォーマンス測定
lighthouse http://localhost:4321/sample-docs/v2/ja/guide/getting-started --view
```

---

## 📚 参考資料

### Phase 2-2成果物

- [Phase 2-2完了報告書](./phase-2-2-completion-report.md)
- [packages/runtime/README.md](../../packages/runtime/README.md)
- [packages/runtime/src/pages/[project]/[version]/[lang]/[...slug].astro](../../packages/runtime/src/pages/[project]/[version]/[lang]/[...slug].astro)

### 既存実装（参考）

- [apps/sample-docs/src/pages/[version]/[lang]/[...slug].astro](../../apps/sample-docs/src/pages/[version]/[lang]/[...slug].astro)
- [apps/sample-docs/src/layouts/DocLayout.astro](../../apps/sample-docs/src/layouts/DocLayout.astro)
- [packages/ui/src/components/](../../packages/ui/src/components/)

### Phase 2計画書

- [Phase 2-3 計画書](../phase-2-3-content-integration.md)（作成予定）
- [Astro統合技術調査](../research/astro-integration.md)
- [UI/テーマ準備状況評価](../research/ui-theme-readiness.md)

### 外部ドキュメント

- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Dynamic Routing](https://docs.astro.build/en/core-concepts/routing/#dynamic-routes)
- [Pagefind Documentation](https://pagefind.app/)

---

## 💡 推奨作業順序

Phase 2-3の実装は以下の順序で進めることを推奨：

1. **MDXコンテンツ読み込み実装**（2-3時間）
   - 動的importの実装
   - エラーハンドリング
   - 動作確認

2. **既存UIコンポーネント統合**（2-3時間）
   - Astroバージョン統一
   - DocLayout.astroへの統合
   - スタイル調整

3. **新規コンポーネント実装**（3-4時間）
   - Glossary.astro
   - RelatedDocs.astro
   - VersionSelector.astro

4. **検索機能統合**（1-2時間）
   - Pagefindインストール
   - 検索UIコンポーネント実装
   - ビルド確認

5. **パフォーマンス最適化**（1-2時間）
   - 画像最適化
   - コード分割
   - ビルドサイズ確認

6. **テスト・デバッグ**（2-3時間）
   - 全機能の動作確認
   - アクセシビリティチェック
   - パフォーマンステスト

**推定工数**: 11-19時間（2-3営業日）

---

## 🆘 トラブルシューティング

### よくある問題

#### 1. `Cannot find module` エラー

**原因**: MDXファイルのパス解決が失敗

**解決策**:
```typescript
// 絶対パスを使用
const module = await import(`/Users/.../registry/content/${contentPath}`);

// または、import.meta.globを使用
const modules = import.meta.glob('/registry/content/**/*.mdx');
const module = await modules[contentPath]();
```

#### 2. UIコンポーネントのスタイルが適用されない

**原因**: CSS変数の定義が不足

**解決策**:
```astro
<!-- BaseLayout.astroで確実に定義 -->
<style is:global>
  :root {
    --color-text: #1f2937;
    --color-bg: #ffffff;
    /* ... 必要な変数を全て定義 */
  }
</style>
```

#### 3. ビルドが遅い

**原因**: 大量のMDXファイル処理

**解決策**:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS=--max-old-space-size=4096 astro build"
  }
}
```

---

## 📞 サポート・質問

Phase 2-3実装中に不明点があれば、以下を参照してください：

1. **Phase 2-2完了報告**: `docs/new-generator-plan/status/phase-2-2-completion-report.md`
2. **generatorパッケージAPI**: `packages/generator/README.md`
3. **既存実装**: `apps/sample-docs/` ディレクトリ
4. **Astro公式ドキュメント**: https://docs.astro.build/

---

**作成者**: Claude
**作成日**: 2025-10-18
**対象フェーズ**: Phase 2-3
**前提フェーズ**: Phase 2-2（完了）

---

🎯 **次のステップ**: Phase 2-3の詳細計画書を確認し、MDXコンテンツ読み込みから実装を開始してください。
