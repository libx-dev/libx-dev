# @docs/theme

テーマシステム - ドキュメントサイト用のデザイントークンとスタイル定義

## 概要

`@docs/theme`は、ドキュメントサイト全体で一貫したデザインを実現するためのテーマシステムを提供します。CSS変数、カラーパレット、タイポグラフィ、スペーシングシステムなどのデザイントークンを集約管理します。

## 主要機能

- **CSS変数システム**: カスタムプロパティによる柔軟なスタイリング
- **カラーパレット**: ブランドカラー、ステータスカラー、ダークモード対応
- **タイポグラフィ**: フォントサイズ、行間、ウェイトの体系的な定義
- **スペーシングシステム**: 一貫したマージン・パディング
- **レスポンシブ設計**: ブレークポイント定義
- **TypeScript型サポート**: 完全な型定義

## インストール

```bash
pnpm add @docs/theme
```

## 使用方法

### CSS変数の使用

AstroレイアウトでCSS変数をインポートします。

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
  }
</style>
```

### TypeScriptでの使用

カラーパレットやタイポグラフィをTypeScriptで使用できます。

```typescript
import { colors, typography, spacing } from '@docs/theme';

// カラーパレット
const primaryColor = colors.brand.primary; // '#3B82F6'
const errorColor = colors.status.error; // '#EF4444'

// タイポグラフィ
const headingFont = typography.fonts.heading; // 'Inter, sans-serif'
const bodySize = typography.sizes.body; // '1rem'

// スペーシング
const spacingUnit = spacing['4']; // '1rem'
```

## デザイントークン

### カラーパレット

#### ブランドカラー

```javascript
colors.brand = {
  primary: '#3B82F6',   // blue-500
  secondary: '#6B7280', // gray-500
  accent: '#8B5CF6',    // violet-500
}
```

**CSS変数**:
```css
var(--color-primary)
var(--color-secondary)
var(--color-accent)
```

#### テキストカラー

```javascript
colors.text = {
  primary: '#1F2937',   // gray-800（通常のテキスト）
  secondary: '#4B5563', // gray-600（副次的なテキスト）
  muted: '#9CA3AF',     // gray-400（控えめなテキスト）
  inverted: '#FFFFFF',  // white（反転テキスト）
}
```

**CSS変数**:
```css
var(--color-text-primary)
var(--color-text-secondary)
var(--color-text-muted)
var(--color-text-inverted)
```

#### 背景カラー

```javascript
colors.background = {
  primary: '#FFFFFF',   // white（メイン背景）
  secondary: '#F9FAFB', // gray-50（セカンダリ背景）
  tertiary: '#F3F4F6',  // gray-100（三次背景）
  inverted: '#1F2937',  // gray-800（反転背景）
}
```

**CSS変数**:
```css
var(--color-bg-primary)
var(--color-bg-secondary)
var(--color-bg-tertiary)
var(--color-bg-inverted)
```

#### ステータスカラー

```javascript
colors.status = {
  info: '#3B82F6',    // blue-500
  success: '#10B981', // emerald-500
  warning: '#F59E0B', // amber-500
  error: '#EF4444',   // red-500
}
```

**CSS変数**:
```css
var(--color-info)
var(--color-success)
var(--color-warning)
var(--color-error)
```

#### ダークモードカラー

```javascript
colors.dark = {
  background: {
    primary: '#111827',   // gray-900
    secondary: '#1F2937', // gray-800
    tertiary: '#374151',  // gray-700
  },
  text: {
    primary: '#F9FAFB',   // gray-50
    secondary: '#D1D5DB', // gray-300
    muted: '#9CA3AF',     // gray-400
  },
  border: {
    light: '#374151',     // gray-700
    default: '#4B5563',   // gray-600
    dark: '#6B7280',      // gray-500
  }
}
```

### タイポグラフィ

#### フォントファミリー

```javascript
typography.fonts = {
  heading: 'Inter, system-ui, -apple-system, sans-serif',
  body: 'Inter, system-ui, -apple-system, sans-serif',
  mono: 'Menlo, Monaco, "Courier New", monospace',
}
```

**CSS変数**:
```css
var(--font-heading)
var(--font-body)
var(--font-mono)
```

#### フォントサイズ

```javascript
typography.sizes = {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  base: '1rem',    // 16px
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
}
```

**CSS変数**:
```css
var(--font-size-xs)
var(--font-size-sm)
var(--font-size-base)
var(--font-size-lg)
var(--font-size-xl)
var(--font-size-2xl)
var(--font-size-3xl)
var(--font-size-4xl)
var(--font-size-5xl)
```

#### フォントウェイト

```javascript
typography.weights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}
```

**CSS変数**:
```css
var(--font-weight-normal)
var(--font-weight-medium)
var(--font-weight-semibold)
var(--font-weight-bold)
```

#### 行間

```javascript
typography.lineHeights = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
}
```

**CSS変数**:
```css
var(--line-height-tight)
var(--line-height-normal)
var(--line-height-relaxed)
var(--line-height-loose)
```

### スペーシングシステム

8の倍数ベースのスペーシング（8px = 0.5rem）

```javascript
spacing = {
  '0': '0',
  '1': '0.25rem',  // 4px
  '2': '0.5rem',   // 8px
  '3': '0.75rem',  // 12px
  '4': '1rem',     // 16px
  '5': '1.25rem',  // 20px
  '6': '1.5rem',   // 24px
  '8': '2rem',     // 32px
  '10': '2.5rem',  // 40px
  '12': '3rem',    // 48px
  '16': '4rem',    // 64px
  '20': '5rem',    // 80px
  '24': '6rem',    // 96px
}
```

**CSS変数**:
```css
var(--spacing-0)
var(--spacing-1)
var(--spacing-2)
var(--spacing-4)
var(--spacing-8)
/* ...etc */
```

### ボーダー半径

```javascript
borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',   // 完全な円形
}
```

**CSS変数**:
```css
var(--border-radius-sm)
var(--border-radius-md)
var(--border-radius-lg)
var(--border-radius-full)
```

### シャドウ

```javascript
shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  none: 'none',
}
```

**CSS変数**:
```css
var(--shadow-sm)
var(--shadow-md)
var(--shadow-lg)
var(--shadow-xl)
```

### ブレークポイント

```javascript
breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}
```

**CSS変数**:
```css
var(--breakpoint-sm)
var(--breakpoint-md)
var(--breakpoint-lg)
var(--breakpoint-xl)
```

### zインデックス

```javascript
zIndices = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
}
```

**CSS変数**:
```css
var(--z-dropdown)
var(--z-modal)
var(--z-tooltip)
```

## 使用例

### コンポーネントのスタイリング

```astro
---
import '@docs/theme/css/variables.css';
---

<div class="card">
  <h2>カードタイトル</h2>
  <p>カードの内容</p>
</div>

<style>
  .card {
    /* 背景・ボーダー */
    background-color: var(--color-bg-primary);
    border: 1px solid var(--color-border-light);
    border-radius: var(--border-radius-lg);

    /* スペーシング */
    padding: var(--spacing-6);
    margin-bottom: var(--spacing-4);

    /* シャドウ */
    box-shadow: var(--shadow-md);
  }

  h2 {
    /* タイポグラフィ */
    font-family: var(--font-heading);
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
    color: var(--color-text-primary);

    /* スペーシング */
    margin-bottom: var(--spacing-4);
  }

  p {
    font-family: var(--font-body);
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    color: var(--color-text-secondary);
  }
</style>
```

### レスポンシブデザイン

```css
.container {
  padding: var(--spacing-4);
}

@media (min-width: 768px) {
  .container {
    padding: var(--spacing-8);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-12);
  }
}
```

### ダークモード対応

```css
/* ライトモード */
.component {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

/* ダークモード */
[data-theme="dark"] .component {
  background-color: var(--color-dark-bg-primary);
  color: var(--color-dark-text-primary);
}
```

## 配布形態

### ビルド成果物とCSS配布

`@docs/theme`はTypeScriptをビルドし、CSSはそのまま配布します。

**package.json**:
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./colors": "./dist/colors.js",
    "./typography": "./dist/typography.js",
    "./spacing": "./dist/spacing.js",
    "./css/variables.css": "./src/css/variables.css",
    "./css/base.css": "./src/css/base.css"
  },
  "files": [
    "dist",
    "src/css",
    "README.md"
  ]
}
```

### ビルド

```bash
# ビルド実行
pnpm build

# ビルド成果物確認
ls -la dist/
# index.js, index.cjs, index.d.ts
# colors.js, colors.cjs, colors.d.ts
# typography.js, typography.cjs, typography.d.ts
# spacing.js, spacing.cjs, spacing.d.ts
```

## デザインシステムの拡張

### カスタムカラーの追加

プロジェクト固有のカラーを追加する場合:

```css
/* カスタムCSS */
:root {
  --color-custom-primary: #custom-color;
  --color-custom-secondary: #another-color;
}
```

### カスタムスペーシングの追加

```css
:root {
  --spacing-custom: 2.5rem; /* 40px */
}
```

## 開発

### ディレクトリ構造

```
packages/theme/
├── src/
│   ├── index.ts           # メインエントリーポイント
│   ├── colors.ts          # カラーパレット定義
│   ├── typography.ts      # タイポグラフィ定義
│   ├── spacing.ts         # スペーシング定義
│   ├── css/
│   │   ├── index.ts       # CSS読み込み用
│   │   ├── variables.css  # CSS変数定義
│   │   └── base.css       # ベーススタイル
│   └── ...
├── dist/                  # ビルド成果物
├── tsup.config.ts         # tsupビルド設定
├── package.json
└── README.md
```

### ビルド設定

**tsup.config.ts**:
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/colors.ts',
    'src/typography.ts',
    'src/spacing.ts'
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
});
```

## 参考資料

- [CSS Custom Properties](https://developer.mozilla.org/ja/docs/Web/CSS/--*)
- [Design Tokens](https://www.designtokens.org/)
- [Tailwind CSS Design System](https://tailwindcss.com/docs/customizing-colors)

## ライセンス

MIT License

このパッケージはlibx-devプロジェクトの一部です。
