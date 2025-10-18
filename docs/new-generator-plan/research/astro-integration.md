# Astro統合技術調査レポート

**調査日**: 2025年10月18日
**目的**: Phase 2（ビルド実装）でのAstro統合方法の技術調査
**対象**: Astro 5.7.12（既存プロジェクトで使用中）

---

## エグゼクティブサマリー

既存プロジェクト（sample-docs）の実装を調査し、**Astro 5.7.12 + Content Collections + 動的ルーティング**のパターンで新ジェネレーターを実装可能と判断しました。

### 主要な知見

- ✅ Astro 5.7.12は安定版で、Content Collectionsが標準機能
- ✅ 動的ルーティング `[version]/[lang]/[...slug].astro` のパターンが実証済み
- ✅ 既存のUI/テーマパッケージとの統合実績あり
- ✅ MDXサポート、シンタックスハイライト、remarkプラグイン連携が可能

### 推奨アプローチ

**Phase 2でのAstro統合方針**:
1. 既存パターンを踏襲: `getStaticPaths()` + Content Collections
2. レジストリ駆動に変更: `registry/docs.json`からルーティング生成
3. 共有パッケージ活用: Vite aliasで`@docs/*`パッケージを参照

---

## 既存実装の調査結果

### 1. Astroバージョンと設定

**使用バージョン**: Astro 5.7.12

**設定ファイル**: `apps/sample-docs/astro.config.mjs`

**主要設定**:
```javascript
{
  site: 'https://libx.dev',
  base: '/docs/sample-docs',
  integrations: [
    mdx({
      syntaxHighlight: 'shiki',
      shikiConfig: {
        theme: 'github-dark',
        wrap: true
      },
      remarkPlugins: [
        [remarkLinkTransformer, { baseUrl: '/docs/sample-docs' }]
      ]
    })
  ],
  vite: {
    resolve: {
      alias: {
        '@docs/ui': path.resolve(__dirname, '../../packages/ui/src'),
        '@docs/versioning': path.resolve(__dirname, '../../packages/versioning/src'),
        '@docs/theme': path.resolve(__dirname, '../../packages/theme/src'),
        '@docs/i18n': path.resolve(__dirname, '../../packages/i18n/src'),
      }
    }
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
    routing: {
      prefixDefaultLocale: true
    }
  }
}
```

**評価**: ✅ 安定した設定、Phase 2でも同様のパターンを採用可能

---

### 2. Content Collections

**設定ファイル**: `apps/sample-docs/src/content/config.ts`

**スキーマ定義**:
```typescript
const docsSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  categoryOrder: z.number().optional(),
  pubDate: z.date().optional(),
  updatedDate: z.date().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  draft: z.boolean().optional().default(false),
  order: z.number().optional(),
  prev: z.object({
    text: z.string(),
    link: z.string()
  }).optional(),
  next: z.object({
    text: z.string(),
    link: z.string()
  }).optional(),
  licenseSource: z.string().optional(),
  customAttribution: z.string().optional(),
  hideAttribution: z.boolean().optional().default(false),
});

export const collections = {
  'docs': defineCollection({
    schema: docsSchema
  }),
};
```

**Phase 2での適用**:
- ✅ レジストリの`documents`スキーマと互換性あり
- ✅ フロントマター主導からレジストリ主導への移行が可能
- 🔄 `draft`, `tags`, `prev/next`などのフィールドはレジストリから取得するよう変更

---

### 3. 動的ルーティング

**ページファイル**: `apps/sample-docs/src/pages/[version]/[lang]/[...slug].astro`

**ルーティングパターン**:
```
URL: /v2/ja/guide/getting-started
├── [version] → "v2"
├── [lang] → "ja"
└── [...slug] → "guide/getting-started"
```

**getStaticPaths() 実装**:
```typescript
export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const docs = await getCollection('docs');

  return docs.map((entry: CollectionEntry<'docs'>) => {
    const pathParts = entry.slug.split('/');
    // entry.slug例: "v2/ja/01-guide/01-getting-started"

    const version = pathParts[0]; // "v2"
    const lang = pathParts[1];    // "ja"
    const slugParts = pathParts.slice(2); // ["01-guide", "01-getting-started"]
    const slug = slugParts.join('/'); // "01-guide/01-getting-started"

    return {
      params: { version, lang, slug },
      props: { entry }
    };
  }).filter(Boolean);
}
```

**Phase 2での適用**:
```typescript
// レジストリ駆動の実装例
export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const registry = await loadRegistry(); // registry/docs.json読み込み
  const paths = [];

  for (const project of registry.projects) {
    for (const doc of project.documents) {
      for (const version of doc.versions) {
        for (const [lang, content] of Object.entries(doc.content)) {
          // visibilityチェック
          if (doc.visibility === 'draft' && process.env.NODE_ENV === 'production') {
            continue;
          }

          paths.push({
            params: {
              project: project.id,
              version: version,
              lang: lang,
              slug: doc.slug
            },
            props: {
              doc,
              project,
              content,
              registry
            }
          });
        }
      }
    }
  }

  return paths;
}
```

**評価**: ✅ レジストリ駆動への移行が容易

---

### 4. レイアウトシステム

**ディレクトリ構造**:
```
src/
├── layouts/
│   ├── MainLayout.astro  # 基本レイアウト
│   └── DocLayout.astro   # ドキュメント専用レイアウト
├── components/
│   └── LanguageSelector.astro
├── pages/
│   ├── index.astro
│   └── [version]/[lang]/[...slug].astro
```

**DocLayout.astro の責務**:
- ヘッダー／フッター
- サイドバー
- 目次（TableOfContents）
- ページネーション（Pagination）
- ブレッドクラム
- 言語切り替え

**Phase 2での適用**:
- ✅ 既存レイアウトを再利用
- 🔄 サイドバー生成をレジストリの`categories`から自動化
- 🔄 ページネーションを`related`フィールドから生成

---

### 5. UI/テーマパッケージ統合

**Vite Alias設定**:
```javascript
vite: {
  resolve: {
    alias: {
      '@docs/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@docs/versioning': path.resolve(__dirname, '../../packages/versioning/src'),
      '@docs/theme': path.resolve(__dirname, '../../packages/theme/src'),
      '@docs/i18n': path.resolve(__dirname, '../../packages/i18n/src'),
    }
  }
}
```

**使用コンポーネント例**:
```typescript
import { TableOfContents, Pagination } from '@docs/ui/components';
import type { LocaleKey } from '@docs/i18n/locales';
import { mergePagination, type PageLink } from '@docs/versioning/utils';
```

**Phase 2での適用**:
- ✅ 同じVite Alias設定を採用
- ✅ 既存コンポーネントをそのまま再利用
- 🔄 必要に応じてコンポーネントを拡張（例: Glossary表示）

---

### 6. MDXとプラグイン

**MDX設定**:
```javascript
integrations: [
  mdx({
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark',
      langs: [],
      wrap: true
    },
    remarkPlugins: [
      [remarkLinkTransformer, { baseUrl: '/docs/sample-docs' }]
    ],
    rehypePlugins: []
  })
]
```

**remarkLinkTransformer**:
- プロジェクト固有のベースパスを自動付与
- 内部リンクの変換処理

**Phase 2での適用**:
- ✅ remarkプラグインをレジストリ駆動に拡張
- 🔄 プロジェクトIDからベースパスを動的生成
- 🔄 `glossary`項目へのリンク自動生成プラグイン追加検討

---

## Phase 2への適用計画

### 1. ディレクトリ構造（提案）

```
packages/
├── generator/          # ビルドジェネレーター（新規）
│   ├── src/
│   │   ├── routing.ts      # レジストリからルーティング生成
│   │   ├── sidebar.ts      # サイドバーJSON生成
│   │   ├── sitemap.ts      # サイトマップ生成
│   │   └── metadata.ts     # ページメタデータ生成
│   └── package.json
│
├── runtime/            # Astroランタイム（新規）
│   ├── src/
│   │   ├── pages/
│   │   │   └── [project]/[version]/[lang]/[...slug].astro
│   │   ├── layouts/
│   │   │   ├── BaseLayout.astro
│   │   │   └── DocLayout.astro
│   │   ├── components/
│   │   │   ├── Sidebar.astro
│   │   │   ├── Breadcrumb.astro
│   │   │   └── RelatedDocs.astro
│   │   └── lib/
│   │       └── registry.ts  # レジストリ読み込みユーティリティ
│   ├── astro.config.mjs
│   └── package.json
│
├── ui/                 # 既存
├── theme/              # 既存
├── i18n/               # 既存
├── versioning/         # 既存
├── cli/                # Phase 1で作成
└── validator/          # Phase 1で作成
```

---

### 2. レジストリ駆動ルーティングの実装方針

**ステップ1**: レジストリロード

```typescript
// packages/generator/src/routing.ts
import { readFileSync } from 'fs';
import { join } from 'path';

export function loadRegistry(registryPath: string = 'registry/docs.json') {
  const content = readFileSync(join(process.cwd(), registryPath), 'utf-8');
  return JSON.parse(content);
}
```

**ステップ2**: ルーティング生成

```typescript
export function generateRoutes(registry: Registry) {
  const routes = [];

  for (const project of registry.projects) {
    for (const doc of project.documents) {
      // visibilityフィルタリング
      if (shouldExclude(doc.visibility, process.env.NODE_ENV)) {
        continue;
      }

      for (const version of doc.versions) {
        for (const [lang, content] of Object.entries(doc.content)) {
          routes.push({
            params: {
              project: project.id,
              version,
              lang,
              slug: doc.slug
            },
            props: {
              docId: doc.id,
              title: doc.title[lang] || doc.title.en,
              summary: doc.summary[lang] || doc.summary.en,
              keywords: doc.keywords,
              tags: doc.tags,
              related: doc.related,
              license: doc.license,
              contributors: doc.contributors,
              content: content
            }
          });
        }
      }
    }
  }

  return routes;
}

function shouldExclude(visibility: string, env: string) {
  if (visibility === 'draft' && env === 'production') return true;
  if (visibility === 'internal' && env === 'production') return true;
  return false;
}
```

**ステップ3**: Astroページでの利用

```typescript
// packages/runtime/src/pages/[project]/[version]/[lang]/[...slug].astro
---
import { loadRegistry } from '@docs/generator/routing';
import DocLayout from '../../../../layouts/DocLayout.astro';

export async function getStaticPaths() {
  const registry = loadRegistry();
  return generateRoutes(registry);
}

const { docId, title, summary, keywords, tags, related, content } = Astro.props;
const { project, version, lang, slug } = Astro.params;
---

<DocLayout
  title={title}
  summary={summary}
  keywords={keywords}
  tags={tags}
  related={related}
>
  <Fragment set:html={content.html} />
</DocLayout>
```

---

### 3. サイドバー生成の実装方針

**既存パターン**:
- ファイルシステムベースでサイドバーを生成
- カテゴリ順序はフロントマターの`order`フィールド

**Phase 2での変更**:
- レジストリの`categories`から生成
- 階層構造、順序、アイコンをレジストリで管理

**実装例**:
```typescript
// packages/generator/src/sidebar.ts
export function generateSidebar(registry: Registry, projectId: string, version: string, lang: string) {
  const project = registry.projects.find(p => p.id === projectId);
  if (!project) return [];

  const categories = project.categories.filter(cat =>
    cat.versions.includes(version)
  );

  return categories
    .sort((a, b) => a.order - b.order)
    .map(category => ({
      title: category.titles[lang] || category.titles.en,
      slug: category.slug,
      icon: category.icon,
      items: category.docs.map(docId => {
        const doc = project.documents.find(d => d.id === docId);
        return {
          title: doc.title[lang] || doc.title.en,
          url: `/${projectId}/${version}/${lang}/${doc.slug}`,
          order: doc.order
        };
      }).sort((a, b) => a.order - b.order)
    }));
}
```

---

### 4. サイトマップ・メタデータ生成

**sitemap.xml**:
```typescript
export function generateSitemap(registry: Registry) {
  const urls = [];
  const baseUrl = registry.settings.siteUrl;

  for (const project of registry.projects) {
    for (const doc of project.documents) {
      if (doc.visibility === 'draft' || doc.visibility === 'internal') {
        continue; // 検索エンジンに公開しない
      }

      for (const version of doc.versions) {
        for (const lang of Object.keys(doc.content)) {
          urls.push({
            url: `${baseUrl}/${project.id}/${version}/${lang}/${doc.slug}`,
            lastmod: doc.lastModified || new Date().toISOString(),
            changefreq: 'weekly',
            priority: version === project.latestVersion ? 0.8 : 0.5
          });
        }
      }
    }
  }

  return urls;
}
```

**robots.txt**:
```typescript
export function generateRobotsTxt(registry: Registry) {
  const baseUrl = registry.settings.siteUrl;
  return `
User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`.trim();
}
```

---

### 5. Visibilityとアクセス制御

**ビルド時の制御**:
```typescript
function shouldBuildPage(visibility: string, env: string) {
  switch (visibility) {
    case 'public':
      return true;
    case 'draft':
      return env === 'development' || env === 'preview';
    case 'internal':
      return env === 'development' || env === 'staging';
    default:
      return false;
  }
}
```

**環境変数**:
- `NODE_ENV=production` - 本番環境（`public`のみビルド）
- `NODE_ENV=staging` - ステージング環境（`public` + `internal`）
- `NODE_ENV=development` - 開発環境（全てビルド）

---

### 6. ビルドパイプライン統合

**package.jsonスクリプト**:
```json
{
  "scripts": {
    "prebuild": "pnpm validate && node scripts/generate-sidebar.js",
    "build": "astro build",
    "postbuild": "node scripts/generate-search-index.js"
  }
}
```

**フロー**:
1. **prebuild**: レジストリバリデーション + サイドバーJSON生成
2. **build**: Astroビルド（ルーティング、ページ生成）
3. **postbuild**: Pagefind検索インデックス生成

---

## 技術的な課題と対応策

### 1. パフォーマンス

**課題**: レジストリが大規模化した場合のビルド時間

**対応策**:
- ビルドキャッシュの活用（Astroの`--cache-dir`）
- インクリメンタルビルド（変更されたドキュメントのみ再生成）
- 並列ビルド（複数プロジェクトを並列処理）

### 2. 型安全性

**課題**: レジストリの型定義とAstroの型定義の統合

**対応策**:
- JSON Schemaから TypeScript型定義を自動生成
- `json-schema-to-typescript` ツールの活用
- Astroの`CollectionEntry`型との統合

**実装例**:
```bash
# TypeScript型定義生成
json-schema-to-typescript registry/docs.schema.json -o packages/generator/src/types/registry.ts
```

### 3. エラーハンドリング

**課題**: ビルド時のエラーハンドリングと診断

**対応策**:
- 詳細なエラーメッセージ（どのドキュメントで失敗したか）
- ビルドログの構造化（JSON形式で出力）
- 失敗したページをスキップしてビルド継続するオプション

---

## 推奨技術スタック

### Phase 2で使用する技術

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| フレームワーク | Astro | 5.7.12 | 静的サイト生成 |
| コンテンツ | MDX | @astrojs/mdx | ドキュメント記述 |
| シンタックスハイライト | Shiki | 内蔵 | コードブロック |
| スキーマ検証 | Zod | 最新 | Content Collections |
| 検索 | Pagefind | 最新 | 静的検索インデックス |
| ビルドツール | Vite | Astro内蔵 | バンドリング |
| 型定義 | TypeScript | 5.x | 型安全性 |

### 新規導入が必要なツール

| ツール | 用途 | 優先度 |
|-------|------|--------|
| json-schema-to-typescript | 型定義自動生成 | 🔴 高 |
| Pagefind | 検索インデックス生成 | 🔴 高 |
| astro-compress | ビルド最適化 | 🟡 中 |
| astro-robots-txt | robots.txt生成 | 🟢 低 |

---

## 次のステップ

### Phase 2-1（ランタイム／ジェネレーター）開始時

1. **パッケージ作成**
   - `packages/generator/` ディレクトリ作成
   - `packages/runtime/` ディレクトリ作成
   - package.json、tsconfig.json設定

2. **レジストリロード機能実装**
   - `loadRegistry()` 関数
   - バリデーション統合
   - エラーハンドリング

3. **ルーティング生成実装**
   - `generateRoutes()` 関数
   - Visibility フィルタリング
   - テスト作成

4. **サイドバー生成実装**
   - `generateSidebar()` 関数
   - カテゴリ階層構造処理
   - JSON出力

### Phase 2-2（UI/テーマ統合）開始時

1. **既存パッケージ評価**
   - `packages/ui/` の棚卸し
   - Astro 5.7.12 との互換性確認
   - 必要な調整のリストアップ

2. **Vite Alias設定**
   - `@docs/*` パッケージの参照設定
   - ビルド動作確認

3. **新規コンポーネント実装**
   - Glossary表示コンポーネント
   - RelatedDocs表示コンポーネント

---

## 参照ドキュメント

### 既存実装
- [apps/sample-docs/astro.config.mjs](../../apps/sample-docs/astro.config.mjs)
- [apps/sample-docs/src/content/config.ts](../../apps/sample-docs/src/content/config.ts)
- [apps/sample-docs/src/pages/[version]/[lang]/[...slug].astro](../../apps/sample-docs/src/pages/[version]/[lang]/[...slug].astro)

### Phase 2計画
- [Phase 2-0 ビルド実装](../phase-2-0-build.md)
- [Phase 2-1 ランタイム／ジェネレーター](../phase-2-1-runtime-generator.md)
- [Phase 2-2 UI／テーマ統合](../phase-2-2-ui-theme.md)

### Astro公式ドキュメント
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Dynamic Routing](https://docs.astro.build/en/core-concepts/routing/#dynamic-routes)
- [Astro MDX](https://docs.astro.build/en/guides/integrations-guide/mdx/)

---

**調査者**: Claude
**調査日**: 2025年10月18日
**承認者**: 未定（Phase 2開始時に確認）
**次回レビュー**: Phase 2-1開始時

---

**Phase 2への適用可否**: ✅ **適用可能**
**推奨アプローチ**: レジストリ駆動 + 既存パターンの踏襲
