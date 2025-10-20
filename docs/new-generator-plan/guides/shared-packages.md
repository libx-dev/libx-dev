# 共有パッケージ利用ガイド

**作成日**: 2025-10-20
**対象**: Phase 2-5 タスク6（ドキュメント・ライセンス整備）
**ステータス**: ✅ 完成

---

## 📋 概要

このガイドでは、libx-dev モノレポの共有パッケージ（`@docs/ui`, `@docs/theme`, `@docs/generator`, `@docs/i18n`, `@docs/versioning`）の利用方法について説明します。

---

## 🎯 共有パッケージ一覧

| パッケージ | 説明 | 配布形態 | ビルド必要 |
|-----------|------|---------|-----------|
| @docs/generator | レジストリ駆動のルーティング・サイドバー・サイトマップ生成 | dist/ | ✅ |
| @docs/ui | Astro UIコンポーネント集 | src/ | ❌ |
| @docs/theme | テーマシステム（CSS変数、カラーパレット） | dist/ + src/css | ✅ |
| @docs/i18n | 国際化ユーティリティ | dist/ | ✅ |
| @docs/versioning | バージョン管理ユーティリティ・コンポーネント | src/ | ❌ |

---

## 🚀 インストール方法

### モノレポ内での使用（現在の推奨）

pnpm workspaceを使用しているため、自動的に利用可能です。

```bash
# モノレポルートで依存関係インストール
pnpm install
```

**package.json での参照**:
```json
{
  "dependencies": {
    "@docs/generator": "workspace:*",
    "@docs/ui": "workspace:*",
    "@docs/theme": "workspace:*",
    "@docs/i18n": "workspace:*",
    "@docs/versioning": "workspace:*"
  }
}
```

### 将来のnpm公開時の使用（Phase 4-5以降）

```bash
# npm公開後のインストール方法
pnpm add @docs/generator @docs/ui @docs/theme @docs/i18n @docs/versioning
```

---

## 📦 パッケージ詳細

### @docs/generator

レジストリ駆動のルーティング・サイドバー・サイトマップ生成パッケージ

#### 主要機能

- レジストリ読み込み（`loadRegistry`）
- ルーティング生成（`generateRoutes`）
- サイドバー生成（`generateSidebar`）
- サイトマップ生成（`generateSitemap`）
- メタデータ生成（`generateRobotsTxt`, `generateManifest`, `generateOpenGraph`）

#### インストール

```bash
pnpm add @docs/generator
```

#### 使用例

```typescript
import { loadRegistry, generateRoutes, generateSidebar } from '@docs/generator';

// レジストリ読み込み
const registry = loadRegistry('registry/docs.json');

// ルーティング生成
const routes = generateRoutes(registry, {
  env: 'production'
});

// サイドバー生成
const sidebar = generateSidebar(registry, 'sample-docs', 'v2', 'ja', {
  env: 'production'
});
```

**詳細**: [packages/generator/README.md](../../packages/generator/README.md)

---

### @docs/ui

Astro UIコンポーネント集 - ドキュメントサイト用の共有コンポーネントライブラリ

#### 主要コンポーネント

**ナビゲーション**:
- Navigation, Sidebar, TableOfContents, Pagination

**レイアウト**:
- Card, CardGrid, LinkCard, ContentPanel, TwoColumnContent

**フィードバック**:
- Alert, Banner, ContentNotice

**インタラクティブ**:
- Button, Tabs, Dropdown, ThemeToggle

**コンテンツ**:
- Hero, AnchorHeading, Icon

#### インストール

```bash
pnpm add @docs/ui
```

#### 使用例

```astro
---
import { Button, Card, Alert, Navigation, Sidebar } from '@docs/ui/components';
---

<Navigation projectId="sample-docs" version="v2" lang="ja" />

<Sidebar items={sidebarItems} currentPath="/guide/getting-started" />

<Card title="カードタイトル">
  <p>カードの内容</p>
</Card>

<Button variant="primary">クリック</Button>

<Alert type="info">情報メッセージ</Alert>
```

**配布形態**: ソース配布（Astroコンポーネントはビルド不要）

**詳細**: [packages/ui/README.md](../../packages/ui/README.md)

---

### @docs/theme

テーマシステム - デザイントークンとスタイル定義

#### 主要機能

- CSS変数システム
- カラーパレット（ブランドカラー、ステータスカラー、ダークモード）
- タイポグラフィ（フォントサイズ、ウェイト、行間）
- スペーシングシステム（8の倍数ベース）
- ブレークポイント定義
- シャドウ、ボーダー半径

#### インストール

```bash
pnpm add @docs/theme
```

#### 使用例

**CSS変数**:
```astro
---
import '@docs/theme/css/variables.css';
import '@docs/theme/css/base.css';
---

<style>
  .my-component {
    color: var(--color-text-primary);
    background-color: var(--color-bg-primary);
    padding: var(--spacing-4);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-md);
  }
</style>
```

**TypeScript**:
```typescript
import { colors, typography, spacing } from '@docs/theme';

const primaryColor = colors.brand.primary; // '#3B82F6'
const headingFont = typography.fonts.heading; // 'Inter, sans-serif'
const spacingUnit = spacing['4']; // '1rem'
```

**詳細**: [packages/theme/README.md](../../packages/theme/README.md)

---

### @docs/i18n

国際化ユーティリティ - 多言語ドキュメントサイト用のi18nヘルパー

#### 主要機能

- 言語検出（`getLanguage`）
- 翻訳ヘルパー（`translate`）
- パス変換（`translatePath`）
- ライセンステンプレート（`getLicenseTemplate`）
- 15言語サポート

#### インストール

```bash
pnpm add @docs/i18n
```

#### 使用例

```typescript
import { getLanguage, translate, translatePath } from '@docs/i18n';

// 言語検出
const lang = getLanguage('/sample-docs/v2/ja/guide');
console.log(lang); // 'ja'

// 翻訳
const text = translate('welcome', 'ja');
console.log(text); // 'ようこそ'

// パス変換
const enPath = translatePath('/sample-docs/v2/ja/guide', 'en');
console.log(enPath); // '/sample-docs/v2/en/guide'
```

**サポート言語**: en, ja, zh-Hans, zh-Hant, es, pt-BR, ko, de, fr, ru, ar, id, tr, hi, vi

**詳細**: [packages/i18n/README.md](../../packages/i18n/README.md)

---

### @docs/versioning

バージョン管理ユーティリティ - ドキュメントバージョニング用のコンポーネントとヘルパー

#### 主要機能

- VersionSelector（バージョン切り替えUI）
- VersionDiff（バージョン間差分表示）
- バージョン比較・ソート（`compareVersions`, `sortVersions`）
- 差分計算（`computeDiff`）
- ページネーション（`paginate`）

#### インストール

```bash
pnpm add @docs/versioning
```

#### 使用例

**コンポーネント**:
```astro
---
import { VersionSelector, VersionDiff } from '@docs/versioning/components';

const versions = [
  { id: 'v3', label: 'v3 (latest)', isLatest: true },
  { id: 'v2', label: 'v2', isLatest: false },
  { id: 'v1', label: 'v1 (legacy)', isLatest: false },
];
---

<VersionSelector
  versions={versions}
  currentVersion="v2"
  currentPath="/sample-docs/v2/ja/guide"
/>

<VersionDiff
  oldVersion="v1"
  newVersion="v2"
  oldContent={oldContent}
  newContent={newContent}
/>
```

**ユーティリティ**:
```typescript
import { compareVersions, sortVersions, getLatestVersion } from '@docs/versioning';

compareVersions('v1.2.3', 'v1.3.0'); // -1
sortVersions(['v1.0.0', 'v2.1.0', 'v1.5.0']); // ['v2.1.0', 'v1.5.0', 'v1.0.0']
getLatestVersion(['v1.0.0', 'v2.1.0']); // 'v2.1.0'
```

**配布形態**: ソース配布（Astroコンポーネント含む）

**詳細**: [packages/versioning/README.md](../../packages/versioning/README.md)

---

## 🔧 ビルド設定

### ビルドが必要なパッケージ

**@docs/generator, @docs/theme, @docs/i18n**

```bash
# 個別ビルド
cd packages/generator && pnpm build
cd packages/theme && pnpm build
cd packages/i18n && pnpm build

# 一括ビルド（ルートから）
pnpm --filter=@docs/generator build
pnpm --filter=@docs/theme build
pnpm --filter=@docs/i18n build
```

**ビルド成果物**:
- ESM/CJS両対応（dist/index.js, dist/index.cjs）
- 型定義（dist/index.d.ts）

### ビルド不要なパッケージ

**@docs/ui, @docs/versioning**

Astroコンポーネント（.astro）を含むため、ソースのまま配布します。

**理由**:
- Astroコンポーネントはビルド時にAstroコンパイラで処理される
- ビルド成果物は不要

---

## 📚 リリースフロー

共有パッケージのバージョニングとリリースについては、専用ガイドを参照してください。

**リリースフローガイド**: [docs/new-generator-plan/guides/release-flow.md](./release-flow.md)

### バージョン管理

- **SemVer採用**: MAJOR.MINOR.PATCH
- **Changesets使用**: 変更内容の記録とバージョン更新を自動化
- **リンクパッケージ**: すべての共有パッケージは常に同じバージョンで更新

### リリース手順（概要）

```bash
# 1. 変更内容を記録
pnpm changeset

# 2. バージョン更新
pnpm version-packages

# 3. コミット
git add .
git commit -m "chore: バージョン0.2.0にリリース"
git push
```

**詳細**: [release-flow.md](./release-flow.md)

---

## 🛠️ トラブルシューティング

### Q1: 型定義が見つからない

**症状**: TypeScriptで型エラーが発生する

**原因**: パッケージがビルドされていない

**解決策**:
```bash
# ビルドが必要なパッケージをビルド
pnpm --filter=@docs/generator build
pnpm --filter=@docs/theme build
pnpm --filter=@docs/i18n build

# または一括ビルド
pnpm build
```

### Q2: Astroコンポーネントが読み込めない

**症状**: `@docs/ui`や`@docs/versioning`のコンポーネントがインポートできない

**原因**: pnpm workspaceの依存関係が正しく解決されていない

**解決策**:
```bash
# モノレポルートで再インストール
pnpm install

# または依存関係を明示的に追加
pnpm add @docs/ui @docs/versioning
```

### Q3: CSS変数が適用されない

**症状**: `@docs/theme`のCSS変数が使えない

**原因**: CSSファイルがインポートされていない

**解決策**:
```astro
---
import '@docs/theme/css/variables.css';
import '@docs/theme/css/base.css';
---
```

### Q4: モジュールが見つからない

**症状**: `Cannot find module '@docs/...'`エラー

**原因**: package.jsonの依存関係が不足している

**解決策**:
```json
{
  "dependencies": {
    "@docs/generator": "workspace:*",
    "@docs/ui": "workspace:*",
    "@docs/theme": "workspace:*",
    "@docs/i18n": "workspace:*",
    "@docs/versioning": "workspace:*"
  }
}
```

---

## 🔍 使用例: 完全なドキュメントページ

以下は、すべての共有パッケージを使用した完全なドキュメントページの例です。

```astro
---
// packages/runtime/src/pages/[project]/[version]/[lang]/[...slug].astro

import { loadRegistry, generateRoutes, generateSidebar } from '@docs/generator';
import { Navigation, Sidebar, TableOfContents, Pagination } from '@docs/ui/components';
import { VersionSelector } from '@docs/versioning/components';
import { getLanguage, translate } from '@docs/i18n';
import '@docs/theme/css/variables.css';
import '@docs/theme/css/base.css';

// Astro getStaticPaths
export async function getStaticPaths() {
  const registry = loadRegistry();
  return generateRoutes(registry, {
    env: import.meta.env.MODE || 'production'
  });
}

const { docId, title, summary, contentPath } = Astro.props;
const { project, version, lang, slug } = Astro.params;

// サイドバー生成
const registry = loadRegistry();
const sidebar = generateSidebar(registry, project, version, lang);

// 言語検出
const currentLang = getLanguage(Astro.url.pathname);
const welcomeText = translate('welcome', currentLang);

// バージョン一覧
const versions = [
  { id: 'v3', label: 'v3 (latest)', isLatest: true },
  { id: 'v2', label: 'v2', isLatest: false },
  { id: 'v1', label: 'v1 (legacy)', isLatest: false },
];
---

<!DOCTYPE html>
<html lang={lang}>
<head>
  <meta charset="UTF-8">
  <title>{title} - {project}</title>
  <meta name="description" content={summary}>
</head>
<body>
  <!-- ナビゲーション -->
  <Navigation projectId={project} version={version} lang={lang} />

  <div class="layout">
    <!-- サイドバー -->
    <aside>
      <VersionSelector
        versions={versions}
        currentVersion={version}
        currentPath={Astro.url.pathname}
      />

      <Sidebar
        items={sidebar}
        currentPath={Astro.url.pathname}
      />
    </aside>

    <!-- メインコンテンツ -->
    <main>
      <article>
        <h1>{title}</h1>
        <p>{summary}</p>

        <!-- MDXコンテンツ -->
        <div class="prose">
          <!-- 実際のコンテンツ -->
        </div>
      </article>

      <!-- 目次 -->
      <TableOfContents headings={headings} />
    </main>
  </div>

  <!-- ページネーション -->
  <Pagination
    prev={prevPage}
    next={nextPage}
  />
</body>
</html>

<style>
  .layout {
    display: grid;
    grid-template-columns: 250px 1fr 200px;
    gap: var(--spacing-8);
    max-width: var(--container-xl);
    margin: 0 auto;
    padding: var(--spacing-4);
  }

  .prose {
    font-family: var(--font-body);
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    color: var(--color-text-primary);
  }

  @media (max-width: 768px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
</style>
```

---

## 📖 参考資料

### プロジェクト内ドキュメント

- [Phase 2-5計画書](../phase-2-5-shared-packages.md)
- [Phase 2-5引き継ぎガイド](../status/phase-2-5-handoff.md)
- [リリースフローガイド](./release-flow.md)
- [依存関係チェックレポート](../status/phase-2-5-dependencies-report.md)
- [配布戦略決定レポート](../status/phase-2-5-distribution-strategy.md)

### パッケージREADME

- [@docs/generator README](../../packages/generator/README.md)
- [@docs/ui README](../../packages/ui/README.md)
- [@docs/theme README](../../packages/theme/README.md)
- [@docs/i18n README](../../packages/i18n/README.md)
- [@docs/versioning README](../../packages/versioning/README.md)

### 外部ドキュメント

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Astro Documentation](https://docs.astro.build/)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)

---

## 📝 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2025-10-20 | 共有パッケージ利用ガイド初版作成 | Claude |

---

**作成者**: Claude
**作成日**: 2025-10-20
**対象フェーズ**: Phase 2-5
**タスク**: タスク6（ドキュメント・ライセンス整備）
