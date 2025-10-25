# 検索機能ガイド（Pagefind）

**最終更新**: 2025-10-25
**Phase**: 4-2 Documentation/Training
**ステータス**: ✅ 完了

---

## 📋 目次

1. [概要](#概要)
2. [Pagefindとは](#pagefindとは)
3. [セットアップ手順](#セットアップ手順)
4. [Search.astroコンポーネント](#searchastroコンポーネント)
5. [カスタマイズ方法](#カスタマイズ方法)
6. [メタデータ仕様](#メタデータ仕様)
7. [パフォーマンス最適化](#パフォーマンス最適化)
8. [トラブルシューティング](#トラブルシューティング)
9. [ベストプラクティス](#ベストプラクティス)

---

## 概要

このプロジェクトでは、[Pagefind](https://pagefind.app/)を使用した静的検索機能を提供しています。Pagefindは、ビルド時に静的HTMLから検索インデックスを自動生成し、クライアントサイドで高速な全文検索を実現します。

### 主な特徴

- ✅ **完全な静的検索**: サーバーサイド処理不要
- ✅ **高速**: WASM（WebAssembly）による高速検索
- ✅ **軽量**: インデックスサイズが小さい（demo-docs: 412KB）
- ✅ **多言語対応**: 英語、日本語、韓国語をサポート
- ✅ **アクセシビリティ**: WCAG 2.1準拠
- ✅ **カスタマイズ可能**: フィルタ、ページネーション、ハイライト

---

## Pagefindとは

### 技術概要

Pagefindは、CloudCannon社が開発した静的サイト向け検索エンジンです。

**動作の仕組み**:

1. **ビルド時**: HTMLファイルからコンテンツとメタデータを抽出
2. **インデックス生成**: 圧縮された検索インデックスを生成
3. **ランタイム**: WASM検索エンジンで高速検索

**他の検索エンジンとの比較**:

| 機能 | Pagefind | Algolia | Lunr.js |
|------|----------|---------|---------|
| **サーバー不要** | ✅ | ❌ | ✅ |
| **インデックスサイズ** | 小 | - | 大 |
| **検索速度** | 高速 | 非常に高速 | 中速 |
| **コスト** | 無料 | 有料 | 無料 |
| **多言語** | ✅ | ✅ | 限定的 |

---

## セットアップ手順

### 新規プロジェクトへの追加

新しいドキュメントプロジェクトにPagefind検索機能を追加する手順です。

#### Step 1: 依存関係の追加

**ファイル**: `apps/your-project/package.json`

```json
{
  "devDependencies": {
    "pagefind": "^1.4.0"
  }
}
```

#### Step 2: postbuildスクリプトの追加

**ファイル**: `apps/your-project/package.json`

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "postbuild": "pagefind --site dist --glob \"**/*.html\"",
    "preview": "astro preview"
  }
}
```

**説明**:
- `--site dist`: ビルド出力ディレクトリ
- `--glob "**/*.html"`: 対象HTMLファイルのパターン

#### Step 3: Astro設定の更新

**ファイル**: `apps/your-project/astro.config.mjs`

```javascript
export default defineConfig({
  // ... 既存の設定 ...
  vite: {
    build: {
      rollupOptions: {
        external: [/\/pagefind\//],  // Pagefindを外部化
        output: {
          // ... その他の設定 ...
        }
      }
    },
  },
});
```

**説明**:
- `external: [/\/pagefind\//]`: Viteのバンドルからpagefindを除外

#### Step 4: Search.astroコンポーネントの追加

**ファイル**: `apps/your-project/src/layouts/DocLayout.astro`

```astro
---
import Search from '@docs/runtime/components/Search.astro';
// ... その他のインポート ...
---

<body>
  <div class="layout">
    <Navigation items={[]} siteTitle="Your Project" />

    <!-- 検索コンポーネント -->
    <div class="search-wrapper">
      <Search />
    </div>

    <!-- ... その他のレイアウト ... -->
  </div>
</body>

<style is:global>
  .search-wrapper {
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    padding: 1rem 2rem;
    display: flex;
    justify-content: center;
  }

  @media (max-width: 768px) {
    .search-wrapper {
      padding: 1rem;
    }
  }
</style>
```

#### Step 5: ビルドと動作確認

```bash
# 依存関係をインストール
cd apps/your-project
pnpm install

# ビルド実行
pnpm build

# インデックス生成確認
ls -la dist/pagefind

# プレビューサーバー起動
pnpm preview
```

**期待される出力**:

```
Running Pagefind v1.4.0 (Extended)
...
Total:
  Indexed 3 languages
  Indexed 18 pages
  Indexed 195 words
  Indexed 0 filters
  Indexed 0 sorts

Finished in 0.676 seconds
```

---

## Search.astroコンポーネント

### 概要

`packages/runtime/src/components/Search.astro`は、Pagefindと統合した検索UIコンポーネントです。

### 主な機能

1. **リアルタイム検索**: 入力時に自動的に検索実行（デバウンス: 300ms）
2. **ページネーション**: 10件ずつ表示、ページ遷移可能
3. **検索ハイライト**: 検索キーワードを黄色でハイライト
4. **ファセット検索**: プロジェクト/バージョン/言語でフィルタ（※現在は非表示）
5. **キーボードナビゲーション**:
   - `↓`: 検索結果にフォーカス
   - `Esc`: 検索結果を閉じる
6. **アクセシビリティ**:
   - ARIA属性（role、aria-label、aria-live等）
   - スクリーンリーダー対応

### コンポーネント構造

```
Search.astro
├── 検索入力フィールド
├── 検索アイコン（SVG）
├── スクリーンリーダー用ヘルプテキスト
├── 検索結果コンテナ
│   ├── 検索結果アイテム（リンク）
│   │   ├── タイトル（ハイライト付き）
│   │   ├── 抜粋（ハイライト付き）
│   │   ├── メタデータバッジ（プロジェクト/バージョン/言語）
│   │   └── URL
│   └── "結果なし"メッセージ
└── ページネーション
    ├── 結果件数表示
    └── ページ番号ボタン
```

### スクリプト詳細

#### 初期化

```javascript
async function initSearch() {
  try {
    // ベースパスを取得してPagefindのパスを構築
    const baseUrl = import.meta.env.BASE_URL || '/';
    const pagefindPath = `${baseUrl}pagefind/pagefind.js`.replace('//', '/');

    // Pagefind動的読み込み
    const pagefind = await import(/* @vite-ignore */ pagefindPath);

    // Pagefindオプション設定
    await pagefind.options({
      excerptLength: 30,
      highlightParam: 'highlight'
    });

    // ... UI初期化 ...
  } catch (error) {
    console.error('Pagefind初期化エラー:', error);
    // エラー時はdisabled入力フィールドを表示
  }
}
```

#### 検索実行

```javascript
async function performSearch(query: string) {
  if (!query.trim()) {
    resultsContainer.style.display = 'none';
    return;
  }

  try {
    // Pagefind検索（デバウンス付き）
    const results = await pagefind.debouncedSearch(query);

    if (results && results.results && results.results.length > 0) {
      // 結果データ取得
      const dataPromises = results.results.map((r: any) => r.data());
      allResults = await Promise.all(dataPromises);

      // フィルタ適用
      let filteredResults = allResults;
      if (projectValue) {
        filteredResults = filteredResults.filter(r => r.meta?.project === projectValue);
      }
      // ... 他のフィルタ ...

      displayResults(filteredResults, currentPage, query);
    } else {
      displayResults([], currentPage, query);
    }
  } catch (error) {
    console.error('検索エラー:', error);
    resultsContainer.innerHTML = '<div class="no-results">検索中にエラーが発生しました</div>';
  }
}
```

#### ハイライト機能

```javascript
function highlightText(text: string, query: string): string {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
```

### プロパティ（将来の拡張用）

現在はプロパティなしで動作しますが、将来の拡張用に以下を検討：

```typescript
interface SearchProps {
  /** 検索プレースホルダーテキスト */
  placeholder?: string;
  /** 1ページあたりの結果数 */
  resultsPerPage?: number;
  /** デバウンス遅延（ms） */
  debounceDelay?: number;
  /** フィルタの表示/非表示 */
  showFilters?: boolean;
}
```

---

## カスタマイズ方法

### スタイルのカスタマイズ

CSS変数を使用してテーマをカスタマイズできます。

**ファイル**: `packages/theme/src/css/variables.css`

```css
:root {
  /* 検索入力フィールド */
  --color-bg: #ffffff;
  --color-text: #1f2937;
  --color-border: #e5e7eb;
  --color-primary: #1e40af;
  --color-secondary: #6b7280;

  /* 検索ハイライト */
  --search-highlight-bg: #fef08a;
  --search-highlight-color: #000;
}

/* ダークモード */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1f2937;
    --color-text: #f9fafb;
    --color-border: #374151;
    --color-primary: #3b82f6;
    --color-secondary: #9ca3af;

    --search-highlight-bg: #ca8a04;
    --search-highlight-color: #fff;
  }
}
```

### Pagefind設定ファイル

高度な設定には`pagefind.toml`または`pagefind.json`を使用します。

**ファイル**: `apps/your-project/pagefind.toml`

```toml
# 基本設定
site = "dist"
glob = "**/*.html"

# 除外パス
exclude_selectors = [
    "nav",
    "footer",
    ".sidebar",
    ".no-index"
]

# 言語設定
languages = ["en", "ja", "ko"]

# カスタム重み付け
ranking = {
    page_length = 1.0,
    term_frequency = 1.0,
    term_saturation = 2.0
}

# 抜粋の長さ
excerpt_length = 30
```

### HTMLメタデータの追加

検索インデックスにカスタムメタデータを追加できます。

**ファイル**: `apps/your-project/src/layouts/DocLayout.astro`

```astro
<body
  data-pagefind-body
  data-pagefind-meta="project:demo-docs"
  data-pagefind-meta="version:${version}"
  data-pagefind-meta="lang:${lang}"
  data-pagefind-meta="category:${category}"
>
  <!-- ... コンテンツ ... -->
</body>
```

**検索時のフィルタ使用**:

```javascript
const results = await pagefind.search(query, {
  filters: {
    project: 'demo-docs',
    version: 'v1',
    lang: 'ja'
  }
});
```

### フィルタの動的生成

レジストリからフィルタ選択肢を動的に生成する例：

```javascript
// レジストリ読み込み
const registry = await import(`/registry/${projectId}.json`);

// プロジェクトフィルタ生成
const projectFilter = document.getElementById('project-filter');
Object.keys(registry.projects).forEach(projectId => {
  const option = document.createElement('option');
  option.value = projectId;
  option.textContent = registry.projects[projectId].title.en;
  projectFilter.appendChild(option);
});

// バージョンフィルタ生成
const versionFilter = document.getElementById('version-filter');
Object.keys(registry.versions).forEach(versionId => {
  const option = document.createElement('option');
  option.value = versionId;
  option.textContent = versionId;
  versionFilter.appendChild(option);
});
```

---

## メタデータ仕様

### 標準メタデータフィールド

Pagefindは以下のメタデータを自動抽出します：

| フィールド | 説明 | 抽出元 |
|----------|------|--------|
| **title** | ページタイトル | `<title>`タグ、または`<h1>`タグ |
| **excerpt** | ページ抜粋 | `<meta name="description">`、またはコンテンツの最初の数文 |
| **url** | ページURL | `<link rel="canonical">`、またはファイルパス |

### カスタムメタデータ

`data-pagefind-meta`属性を使用してカスタムメタデータを追加：

```html
<div data-pagefind-body>
  <h1 data-pagefind-meta="heading">ページタイトル</h1>
  <div data-pagefind-meta="author">著者名</div>
  <div data-pagefind-meta="tags:Technology,Web">タグ</div>

  <!-- コンテンツ -->
</div>
```

### メタデータの優先順位

1. `data-pagefind-meta`属性（最優先）
2. 特定のHTML要素（`<title>`、`<meta>`）
3. コンテンツからの自動抽出

---

## パフォーマンス最適化

### インデックスサイズの削減

#### 1. 不要なコンテンツを除外

```toml
# pagefind.toml
exclude_selectors = [
    "nav",
    "footer",
    ".sidebar",
    ".breadcrumbs",
    ".toc",
    ".no-index",
    "script",
    "style"
]
```

#### 2. ページごとの除外

```html
<!-- この要素を検索インデックスから除外 -->
<div data-pagefind-ignore>
  <!-- 広告、コメントセクション等 -->
</div>
```

#### 3. 抜粋の長さを調整

```toml
# pagefind.toml
excerpt_length = 20  # デフォルト: 30
```

### 初回ロード時間の最適化

#### 遅延ロード

```javascript
// ユーザーが検索フィールドにフォーカスした時にPagefindを読み込む
input.addEventListener('focus', async () => {
  if (!pagefindLoaded) {
    const pagefind = await import('/pagefind/pagefind.js');
    pagefindLoaded = true;
  }
}, { once: true });
```

### 検索レスポンス時間の改善

#### デバウンス遅延の調整

```javascript
// デフォルト: 300ms
searchTimeout = setTimeout(() => performSearch(query), 200);
```

#### キャッシュ戦略

```javascript
// 検索結果をキャッシュ
const searchCache = new Map();

async function performSearch(query) {
  if (searchCache.has(query)) {
    return searchCache.get(query);
  }

  const results = await pagefind.search(query);
  searchCache.set(query, results);
  return results;
}
```

### 測定方法

```bash
# インデックスサイズ
du -sh apps/demo-docs/dist/pagefind

# Lighthouse測定（検索機能の影響確認）
lighthouse http://localhost:4321/docs/demo-docs/v1/en/getting-started \
  --output=html \
  --output-path=lighthouse-report.html
```

**目標値**:
- インデックスサイズ: 500KB以下
- 初回ロード時間: 100ms以下
- 検索レスポンス時間: 300ms以下
- Lighthouseスコア: Performance 90以上、Accessibility 95以上

---

## トラブルシューティング

### 問題1: "Pagefind初期化エラー"

**症状**:
```
console.error: Pagefind初期化エラー: Failed to load module '/pagefind/pagefind.js'
```

**原因**:
- Pagefindインデックスが生成されていない
- パスが正しくない

**解決方法**:

```bash
# 1. ビルドを実行
pnpm build

# 2. Pagefindディレクトリが生成されているか確認
ls -la dist/pagefind

# 3. ベースパスが正しいか確認
# Search.astroで動的パス生成を使用している場合は問題なし
```

### 問題2: "検索結果が表示されない"

**症状**:
- 検索入力はできるが、結果が0件

**原因**:
- `data-pagefind-body`属性がない
- コンテンツが除外されている

**解決方法**:

```html
<!-- DocLayout.astro -->
<body data-pagefind-body>
  <!-- または -->
  <main data-pagefind-body>
    <!-- コンテンツ -->
  </main>
</body>
```

```bash
# Pagefindログを確認
pnpm build

# 出力例:
# Did not find a data-pagefind-body element on the site.
# ↳ Indexing all <body> elements on the site.
```

### 問題3: "統合ビルド後に検索が動作しない"

**症状**:
- 個別ビルドでは動作するが、統合ビルド後に動作しない

**原因**:
- ベースパスの不一致

**解決方法**:

```javascript
// Search.astro
const baseUrl = import.meta.env.BASE_URL || '/';
const pagefindPath = `${baseUrl}pagefind/pagefind.js`.replace('//', '/');

console.log('Pagefind path:', pagefindPath);
// 期待される出力: "/docs/demo-docs/pagefind/pagefind.js"
```

### 問題4: "多言語の検索結果が混在する"

**症状**:
- 日本語で検索しても英語の結果が表示される

**原因**:
- 言語フィルタが機能していない

**解決方法**:

```html
<!-- HTMLに言語メタデータを追加 -->
<body
  data-pagefind-body
  data-pagefind-meta="lang:${lang}"
>
```

```javascript
// 検索時に言語フィルタを適用
const results = await pagefind.search(query, {
  filters: {
    lang: currentLang
  }
});
```

### 問題5: "インデックスサイズが大きすぎる"

**症状**:
- `pagefind`ディレクトリが1MB以上

**解決方法**:

```toml
# pagefind.toml
exclude_selectors = [
    "nav",
    "footer",
    ".sidebar",
    ".code-block",  # コードブロックを除外
    "pre",
    ".no-index"
]

# 抜粋の長さを削減
excerpt_length = 15
```

### デバッグツール

#### 検索インデックスの確認

```bash
# Pagefindメタデータファイルを確認
cat dist/pagefind/pagefind-entry.json | jq

# 言語別インデックス確認
ls -lh dist/pagefind/*.pf_meta
```

#### ブラウザDevTools

```javascript
// Pagefindオブジェクトをグローバルに公開（デバッグ用）
window.pagefind = pagefind;

// 検索テスト
const results = await window.pagefind.search('test');
console.log(results);
```

---

## ベストプラクティス

### 1. コンテンツ構造

```html
<!-- ✅ 良い例 -->
<body data-pagefind-body>
  <main>
    <h1 data-pagefind-meta="heading">ページタイトル</h1>
    <article>
      <!-- 検索対象コンテンツ -->
    </article>
  </main>

  <!-- 検索対象外（自動除外される） -->
  <nav data-pagefind-ignore>...</nav>
  <footer data-pagefind-ignore>...</footer>
</body>

<!-- ❌ 悪い例 -->
<body>
  <!-- data-pagefind-body属性がない -->
  <div>
    <!-- 全てのコンテンツが検索対象になり、無関係な情報も含まれる -->
  </div>
</body>
```

### 2. メタデータの適切な使用

```html
<!-- ✅ 良い例 -->
<article
  data-pagefind-meta="project:demo-docs"
  data-pagefind-meta="version:v1"
  data-pagefind-meta="lang:ja"
  data-pagefind-meta="category:guide"
>
  <h1 data-pagefind-meta="title">Getting Started</h1>
  <p>This guide will help you get started...</p>
</article>

<!-- ❌ 悪い例 -->
<article>
  <!-- メタデータなし：フィルタ機能が使えない -->
  <h1>Getting Started</h1>
  <p>This guide will help you get started...</p>
</article>
```

### 3. アクセシビリティ

```astro
<!-- ✅ 良い例 -->
<input
  type="search"
  aria-label="ドキュメントを検索"
  aria-describedby="search-help"
  aria-autocomplete="list"
  aria-controls="search-results"
/>
<div id="search-help" class="sr-only">
  キーワードを入力して検索してください。矢印キーで結果を移動できます。
</div>
<div id="search-results" role="listbox" aria-label="検索結果">
  <!-- 検索結果 -->
</div>

<!-- ❌ 悪い例 -->
<input type="text" placeholder="検索..." />
<!-- ARIA属性なし、スクリーンリーダー非対応 -->
```

### 4. パフォーマンス

```javascript
// ✅ 良い例：デバウンス付き検索
let searchTimeout;
input.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => performSearch(e.target.value), 300);
});

// ❌ 悪い例：毎回即座に検索
input.addEventListener('input', (e) => {
  performSearch(e.target.value);  // 入力ごとに検索が実行される
});
```

### 5. エラーハンドリング

```javascript
// ✅ 良い例
async function initSearch() {
  try {
    const pagefind = await import('/pagefind/pagefind.js');
    // ... 初期化処理 ...
  } catch (error) {
    console.error('Pagefind初期化エラー:', error);
    // ユーザーにエラーを表示
    searchElement.innerHTML = '<input type="text" placeholder="検索機能は現在利用できません" disabled />';
  }
}

// ❌ 悪い例
async function initSearch() {
  const pagefind = await import('/pagefind/pagefind.js');  // エラーハンドリングなし
}
```

### 6. 統合ビルド対応

```javascript
// ✅ 良い例：動的ベースパス
const baseUrl = import.meta.env.BASE_URL || '/';
const pagefindPath = `${baseUrl}pagefind/pagefind.js`.replace('//', '/');
const pagefind = await import(/* @vite-ignore */ pagefindPath);

// ❌ 悪い例：ハードコードされたパス
const pagefind = await import('/pagefind/pagefind.js');  // 統合ビルドで動作しない
```

---

## 参考資料

### 公式ドキュメント

- [Pagefind公式サイト](https://pagefind.app/)
- [Pagefind GitHub](https://github.com/CloudCannon/pagefind)
- [Pagefind設定ドキュメント](https://pagefind.app/docs/config-options/)

### 関連ドキュメント

- [Phase 2-3計画書](../phase-2-3-search.md) - 検索機能の設計計画
- [Phase 4-1 to 4-2引き継ぎドキュメント](../status/phase-4-1-to-4-2-handoff.md) - 検索機能実装の引き継ぎ
- [runtime/Search.astro](../../packages/runtime/src/components/Search.astro) - 検索コンポーネント実装

### 実装例

- **demo-docs**: シンプルな検索実装
  - package.json: [/apps/demo-docs/package.json](../../apps/demo-docs/package.json)
  - astro.config.mjs: [/apps/demo-docs/astro.config.mjs](../../apps/demo-docs/astro.config.mjs)
  - DocLayout.astro: [/apps/demo-docs/src/layouts/DocLayout.astro](../../apps/demo-docs/src/layouts/DocLayout.astro)

- **sample-docs**: フル機能検索実装
  - package.json: [/apps/sample-docs/package.json](../../apps/sample-docs/package.json)
  - Search.astro: [/apps/sample-docs/src/components/Search.astro](../../apps/sample-docs/src/components/Search.astro)

---

## まとめ

Pagefind検索機能は以下の点で優れています：

1. **シンプル**: 3ステップでセットアップ完了
2. **高速**: WASM検索エンジンで瞬時に結果を表示
3. **軽量**: インデックスサイズが小さく、帯域幅を節約
4. **アクセシブル**: WCAG 2.1準拠で全ユーザーが利用可能
5. **カスタマイズ可能**: フィルタ、ページネーション、スタイルを自由に調整

新しいプロジェクトに検索機能を追加する際は、このガイドを参照してください。

---

**次のステップ**:

1. [パフォーマンス測定](./performance.md)（作成予定）
2. [運用マニュアル](./operations.md)（作成予定）
3. [FAQ](./faq.md)（作成予定）

---

**作成者**: Claude Code (AI Assistant)
**作成日**: 2025-10-25
**Phase**: 4-2 Documentation/Training
