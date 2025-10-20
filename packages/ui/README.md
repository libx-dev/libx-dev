# @docs/ui

Astro UIコンポーネント集 - ドキュメントサイト用の共有コンポーネントライブラリ

## 概要

`@docs/ui`は、ドキュメントサイト構築のためのAstroコンポーネント集です。Starlightスタイルのモダンで使いやすいUIコンポーネントを提供し、一貫性のあるデザインと優れたユーザー体験を実現します。

## 主要機能

- **豊富なUIコンポーネント**: 30以上の実用的なコンポーネント
- **Starlightスタイル**: モダンで美しいドキュメントサイトデザイン
- **アクセシビリティ対応**: WCAG 2.1準拠、キーボード操作・スクリーンリーダー対応
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **ダークモード対応**: テーマシステムと連携
- **ソース配布**: Astroコンポーネントをそのまま配布（ビルド不要）

## インストール

```bash
pnpm add @docs/ui
```

## 使用方法

### 基本的な使い方

Astroコンポーネント内でインポートして使用します。

```astro
---
import { Button, Card, Alert } from '@docs/ui/components';
---

<Button variant="primary">クリック</Button>

<Card title="カードタイトル">
  <p>カードの内容</p>
</Card>

<Alert type="info">
  これは情報メッセージです。
</Alert>
```

## コンポーネント一覧

### ナビゲーション

#### Navigation
メインナビゲーションバー

```astro
---
import { Navigation } from '@docs/ui/components';
---

<Navigation projectId="sample-docs" version="v2" lang="ja" />
```

#### Sidebar
サイドバーナビゲーション（カテゴリ階層構造対応）

```astro
---
import { Sidebar } from '@docs/ui/components';
---

<Sidebar items={sidebarItems} currentPath="/guide/getting-started" />
```

#### TableOfContents
目次コンポーネント

```astro
---
import { TableOfContents } from '@docs/ui/components';
---

<TableOfContents headings={headings} />
```

#### Pagination
前ページ・次ページナビゲーション

```astro
---
import { Pagination } from '@docs/ui/components';
---

<Pagination prev={prevPage} next={nextPage} />
```

### レイアウト

#### Card
カードコンポーネント

```astro
---
import { Card } from '@docs/ui/components';
---

<Card title="タイトル" icon="book">
  <p>カードの内容</p>
</Card>
```

#### CardGrid
カードグリッドレイアウト

```astro
---
import { CardGrid, LinkCard } from '@docs/ui/components';
---

<CardGrid>
  <LinkCard title="ガイド" href="/guide" description="はじめに" />
  <LinkCard title="API" href="/api" description="APIリファレンス" />
</CardGrid>
```

#### ContentPanel
コンテンツパネル

```astro
---
import { ContentPanel } from '@docs/ui/components';
---

<ContentPanel title="パネルタイトル">
  <p>パネルの内容</p>
</ContentPanel>
```

#### TwoColumnContent
2カラムレイアウト

```astro
---
import { TwoColumnContent } from '@docs/ui/components';
---

<TwoColumnContent>
  <div slot="left">左カラム</div>
  <div slot="right">右カラム</div>
</TwoColumnContent>
```

### フィードバック

#### Alert
アラートメッセージ

```astro
---
import { Alert } from '@docs/ui/components';
---

<Alert type="info">情報メッセージ</Alert>
<Alert type="warning">警告メッセージ</Alert>
<Alert type="error">エラーメッセージ</Alert>
<Alert type="success">成功メッセージ</Alert>
```

#### Banner
バナーメッセージ

```astro
---
import { Banner } from '@docs/ui/components';
---

<Banner type="info">重要なお知らせ</Banner>
```

#### ContentNotice
コンテンツ内通知

```astro
---
import { ContentNotice } from '@docs/ui/components';
---

<ContentNotice type="tip">
  ヒント: この機能を使うと便利です。
</ContentNotice>
```

### インタラクティブ

#### Button
ボタンコンポーネント

```astro
---
import { Button } from '@docs/ui/components';
---

<Button variant="primary">プライマリ</Button>
<Button variant="secondary">セカンダリ</Button>
<Button variant="outline">アウトライン</Button>
```

#### Tabs / TabItem
タブコンポーネント

```astro
---
import { Tabs, TabItem } from '@docs/ui/components';
---

<Tabs>
  <TabItem label="JavaScript">
    ```js
    console.log('Hello');
    ```
  </TabItem>
  <TabItem label="TypeScript">
    ```ts
    const msg: string = 'Hello';
    ```
  </TabItem>
</Tabs>
```

#### Dropdown / DropdownItem
ドロップダウンメニュー

```astro
---
import { Dropdown, DropdownItem } from '@docs/ui/components';
---

<Dropdown label="メニュー">
  <DropdownItem href="/docs">ドキュメント</DropdownItem>
  <DropdownItem href="/api">API</DropdownItem>
</Dropdown>
```

#### ThemeToggle
テーマ切り替えボタン（ライト/ダークモード）

```astro
---
import { ThemeToggle } from '@docs/ui/components';
---

<ThemeToggle />
```

### コンテンツ

#### Hero
ヒーローセクション

```astro
---
import { Hero } from '@docs/ui/components';
---

<Hero
  title="ドキュメントサイト"
  tagline="高速で使いやすいドキュメント"
  actions={[
    { text: 'はじめる', link: '/guide', variant: 'primary' },
    { text: '詳細を見る', link: '/about', variant: 'secondary' }
  ]}
/>
```

#### AnchorHeading
アンカーリンク付き見出し

```astro
---
import { AnchorHeading } from '@docs/ui/components';
---

<AnchorHeading level={2} id="section-1">セクション1</AnchorHeading>
```

#### LinkCard
リンクカード

```astro
---
import { LinkCard } from '@docs/ui/components';
---

<LinkCard
  title="ガイド"
  href="/guide"
  description="詳しい使い方を確認"
/>
```

### アイコン

#### Icon
アイコンコンポーネント

```astro
---
import { Icon } from '@docs/ui/components';
---

<Icon name="book" size={24} />
<Icon name="github" size={32} />
<Icon name="search" size={16} />
```

**利用可能なアイコン**:
- `book`, `github`, `search`, `menu`, `close`, `arrow-right`, `arrow-left`
- `check`, `warning`, `error`, `info`, `lightbulb`, `external-link`
- その他多数（`Icons.ts`を参照）

### ユーティリティ

#### Footer
フッターコンポーネント

```astro
---
import { Footer } from '@docs/ui/components';
---

<Footer copyright="2025 My Project" />
```

#### LicenseAttribution
ライセンス表示コンポーネント

```astro
---
import { LicenseAttribution } from '@docs/ui/components';
---

<LicenseAttribution
  licenseName="MIT License"
  licenseUrl="https://opensource.org/licenses/MIT"
  originalProject="Original Project"
  originalUrl="https://example.com"
/>
```

### サイドバー機能

#### SidebarPersister
サイドバー状態の永続化（ローカルストレージ）

```astro
---
import { SidebarPersister } from '@docs/ui/components';
---

<SidebarPersister />
```

#### SidebarResizer
サイドバーのリサイズ機能

```astro
---
import { SidebarResizer } from '@docs/ui/components';
---

<SidebarResizer />
```

#### SidebarRestorePoint
サイドバー状態の復元ポイント

```astro
---
import { SidebarRestorePoint } from '@docs/ui/components';
---

<SidebarRestorePoint />
```

## 配布形態

### ソース配布

`@docs/ui`はAstroコンポーネント（.astroファイル）をそのまま配布します。

**理由**:
- Astroコンポーネントはビルド時にAstroコンパイラで処理される
- ビルド成果物は不要
- 型定義も不要（Astro内部で処理）

### package.json設定

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./components": "./src/components/index.ts"
  },
  "files": [
    "src",
    "README.md"
  ],
  "peerDependencies": {
    "astro": "^5.0.0"
  }
}
```

## スタイリング

### テーマシステムとの連携

`@docs/theme`パッケージのCSS変数を使用してスタイリングされています。

```css
/* テーマ変数の例 */
--color-primary: #1e40af;
--color-secondary: #64748b;
--color-border: #e2e8f0;
--color-bg: #ffffff;
--color-text: #1e293b;
```

### カスタムスタイル

コンポーネントのスタイルをカスタマイズする場合は、グローバルCSSでオーバーライドできます。

```css
/* カスタムスタイル */
.button-primary {
  background-color: #custom-color;
}
```

## アクセシビリティ

すべてのコンポーネントはアクセシビリティに配慮して設計されています。

- **ARIA属性**: 適切なrole、aria-label、aria-current等を使用
- **キーボード操作**: Tab、Enter、Escapeキーでの操作をサポート
- **スクリーンリーダー**: 視覚障害者向けのテキスト（.sr-only）を提供
- **フォーカスインジケーター**: 明確なフォーカス状態の表示
- **カラーコントラスト**: WCAG 2.1 AA基準を満たすコントラスト比

## 使用例

### ドキュメントページの作成

```astro
---
import {
  Navigation,
  Sidebar,
  TableOfContents,
  Pagination,
  Footer
} from '@docs/ui/components';

const sidebarItems = [...];
const headings = [...];
---

<!DOCTYPE html>
<html>
<head>
  <title>ドキュメント</title>
</head>
<body>
  <Navigation projectId="my-docs" version="v1" lang="ja" />

  <div class="layout">
    <Sidebar items={sidebarItems} currentPath="/guide/getting-started" />

    <main>
      <article>
        <h1>はじめに</h1>
        <p>ドキュメントの内容...</p>
      </article>

      <TableOfContents headings={headings} />
    </main>
  </div>

  <Pagination
    prev={{ title: "前のページ", href: "/prev" }}
    next={{ title: "次のページ", href: "/next" }}
  />

  <Footer copyright="2025 My Project" />
</body>
</html>
```

## 開発

### ディレクトリ構造

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button.astro
│   │   ├── Card.astro
│   │   ├── Sidebar.astro
│   │   ├── Tabs/
│   │   │   ├── Tabs.astro
│   │   │   └── TabItem.astro
│   │   ├── icons/
│   │   │   ├── Icons.ts
│   │   │   └── Icon.astro
│   │   └── ...
│   └── index.ts
├── package.json
└── README.md
```

### コンポーネント追加

新しいコンポーネントを追加する場合:

1. `src/components/`にコンポーネントファイルを作成
2. `src/components/index.ts`にエクスポートを追加
3. このREADME.mdに使用例を追加

## 参考資料

- [Astro公式ドキュメント](https://docs.astro.build/)
- [Starlight UI](https://starlight.astro.build/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## ライセンス

MIT License

このパッケージはlibx-devプロジェクトの一部です。
