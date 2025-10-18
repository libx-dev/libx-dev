# Phase 2-4 引き継ぎガイド

**作成日**: 2025-10-19
**対象**: Phase 2-4（パフォーマンス最適化・アクセシビリティ向上・検索機能強化）担当者
**前提**: Phase 2-3完了（MDXコンテンツ統合・検索機能統合成功）

---

## 📋 はじめに

このドキュメントは、Phase 2-3の成果を引き継ぎ、Phase 2-4（パフォーマンス最適化・アクセシビリティ向上・検索機能強化）をスムーズに開始するためのガイドです。

### Phase 2-4の目標

✅ **Phase 2-3で完了したこと**:
- Astroランタイムパッケージ作成（`packages/runtime/`）
- 動的ルーティングページ実装
- BaseLayout.astro、DocLayout.astro レイアウトシステム
- Sidebar、Header、Footerコンポーネント
- **MDXコンテンツの動的読み込み完全成功**（64ファイル検出）
- **Vite Aliasによるモノレポ対応**（`@apps`エイリアス）
- **Pagefind検索機能統合**（4,633語インデックス化）
- RelatedDocs、VersionSelector、Searchコンポーネント実装

🎯 **Phase 2-4で実装すること**:
- パフォーマンス最適化（画像最適化、コード分割、CSS最小化）
- アクセシビリティ向上（WCAG 2.1準拠、キーボード操作、スクリーンリーダー対応）
- 検索機能強化（ファセット検索、ページネーション、ハイライト）
- 統合テスト（全ページ表示確認、Lighthouseスコア測定）

---

## 🚀 クイックスタート

### 1. Phase 2-3の成果物を確認

```bash
# runtimeパッケージのディレクトリに移動
cd packages/runtime

# 依存関係が正しくインストールされていることを確認
pnpm install

# ビルドして動作確認
pnpm build

# ビルド成果物の確認
ls -lh dist/
find dist -name "*.html" | wc -l  # 63ページ生成されるはず
```

期待される結果:
- 63個のHTMLファイルが生成される
- `dist/pagefind/`ディレクトリが存在し、検索インデックスが含まれる
- 各HTMLファイルでMDXコンテンツが正しくレンダリングされている

### 2. 現在の技術スタック確認

**Phase 2-3で確立された技術基盤**:

1. **Vite Alias**:
   - `@apps`: モノレポ内のappsディレクトリへのエイリアス
   - `@docs/generator`, `@docs/ui`, `@docs/theme`等の既存エイリアス

2. **MDX動的読み込み**:
   - `import.meta.glob('@apps/*/src/content/docs/**/*.mdx')` で64ファイル検出
   - 番号接頭辞（`01-`, `02-`）の自動処理

3. **環境変数**:
   - `import.meta.env.PROJECT_ROOT`: レジストリパス解決用

4. **Pagefind検索**:
   - postbuildスクリプトで自動インデックス化
   - 3言語対応（ja, ko, en）

### 3. 重要なファイル一覧

**コア実装ファイル**:
```
packages/runtime/
├── astro.config.mjs              # Vite Alias設定
├── src/
│   ├── pages/
│   │   └── [project]/[version]/[lang]/[...slug].astro  # MDX動的読み込み
│   ├── layouts/
│   │   ├── BaseLayout.astro      # 基本レイアウト
│   │   └── DocLayout.astro       # ドキュメント専用レイアウト
│   ├── components/
│   │   ├── RelatedDocs.astro     # 関連ドキュメント表示
│   │   ├── VersionSelector.astro # バージョン切り替え
│   │   └── Search.astro          # Pagefind検索UI
│   └── content/
│       └── config.ts             # Content Collections設定（現在は空）
└── package.json                  # Pagefind設定
```

---

## 📦 Phase 2-3で実装された機能詳細

### 1. MDXコンテンツの動的読み込み

**実装方法**: Vite Aliasを使用した`import.meta.glob()`

**ファイル**: `src/pages/[project]/[version]/[lang]/[...slug].astro`

```typescript
// @appsエイリアスを使用してMDXファイルを読み込む
const mdxModules = import.meta.glob('@apps/*/src/content/docs/**/*.mdx');

// プロジェクト、バージョン、言語、slugでマッチング
const matchingKey = Object.keys(mdxModules).find(modulePath => {
  // 番号接頭辞を考慮したパス解決
  // 例: "01-guide/01-getting-started.mdx" → "guide/getting-started"
});

if (matchingKey) {
  const module = await mdxModules[matchingKey]();
  Content = module.default || module.Content;
}
```

**特徴**:
- ✅ 64個のMDXファイルを自動検出
- ✅ 番号接頭辞（`01-`, `02-`）の自動処理
- ✅ プロジェクト/バージョン/言語による動的マッチング

**確認方法**:
```bash
# ビルドログでMDX Importの成功を確認
pnpm build 2>&1 | grep "MDX Import"
# [MDX Import] Total MDX modules found: 64
# [MDX Import] Match found: ... が表示されるはず
```

### 2. Pagefind検索機能

**実装方法**: postbuildスクリプトで自動インデックス化

**ファイル**: `package.json`

```json
{
  "scripts": {
    "build": "astro build",
    "postbuild": "pagefind --site dist --glob \"**/*.html\""
  },
  "devDependencies": {
    "pagefind": "^1.4.0"
  }
}
```

**検索UIコンポーネント**: `src/components/Search.astro`

```astro
<div class="search-container">
  <div id="search"></div>
</div>

<script>
  // Pagefindの動的ロード（ビルド後のみ利用可能）
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // ... Pagefind UI初期化 ...
  }
</script>
```

**確認方法**:
```bash
# Pagefindインデックスの確認
ls -lh dist/pagefind/
# pagefind.js, pagefind-ui.js, 各言語のインデックスファイルが存在するはず

# インデックス化語数の確認
pnpm build 2>&1 | grep "Indexed.*words"
# Indexed 4633 words が表示されるはず
```

### 3. 新規コンポーネント

#### 3-1. RelatedDocs.astro（関連ドキュメント表示）

**機能**:
- レジストリから関連ドキュメント情報を取得
- カード形式での表示
- タグ表示、ホバーアニメーション

**使用例**:
```astro
<RelatedDocs
  relatedDocIds={related}
  projectId={projectId}
  currentLang={lang}
  currentVersion={version}
/>
```

#### 3-2. VersionSelector.astro（バージョン切り替え）

**機能**:
- プロジェクトの全バージョンをドロップダウン表示
- 最新版・非推奨版・ベータ版のラベル表示
- リリース日順のソート

**使用例**:
```astro
<VersionSelector
  projectId={projectId}
  currentVersion={version}
  lang={lang}
  slug={slug}
/>
```

#### 3-3. Search.astro（検索UIコンポーネント）

**機能**:
- Pagefindとの動的統合
- デバウンス処理による検索最適化
- キーボードナビゲーション対応

**使用例**:
```astro
<Search />
```

---

## 🎯 Phase 2-4の実装ガイド

### タスク1: パフォーマンス最適化（推定工数: 2-3時間）

#### 1-1. 画像最適化

**目標**: Astro Imageを使用した自動画像最適化

**実装手順**:

1. **Astro Image統合のインストール**:
```bash
cd packages/runtime
pnpm add @astrojs/image
```

2. **astro.config.mjsの更新**:
```javascript
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

3. **MDXファイルでの使用**:
```mdx
---
title: "Example"
---

import { Image } from 'astro:assets';
import myImage from './my-image.png';

<Image src={myImage} alt="Description" width={800} height={600} />
```

**成功基準**:
- ✅ 画像ファイルが自動的にWebP/AVIFに変換される
- ✅ レスポンシブ画像が生成される（srcset）
- ✅ ビルドサイズが削減される

#### 1-2. コード分割最適化

**目標**: ViteのmanualChunksを使用した最適なコード分割

**実装手順**:

**astro.config.mjs**:
```javascript
export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['astro'],
            'ui': ['@docs/ui'],
            'generator': ['@docs/generator'],
            'search': ['pagefind']
          }
        }
      }
    }
  }
});
```

**成功基準**:
- ✅ バンドルサイズが最適化される
- ✅ 初期ロード時間が短縮される
- ✅ Lighthouse Performance スコアが向上する

#### 1-3. CSS最小化

**目標**: 未使用CSSの削除とCritical CSS抽出

**実装手順**:

1. **PurgeCSSの導入**（オプション）:
```bash
pnpm add -D @fullhuman/postcss-purgecss
```

2. **postcss.config.cjsの作成**:
```javascript
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
      safelist: ['dark', 'light']
    })
  ]
};
```

**成功基準**:
- ✅ CSSファイルサイズが削減される
- ✅ 未使用のスタイルが除去される

---

### タスク2: アクセシビリティ向上（推定工数: 2-3時間）

#### 2-1. WCAG 2.1準拠チェック

**ツール**:
- [axe DevTools](https://chrome.google.com/webstore/detail/axe-devtools-web-accessibility/lhdoppojpmngadmnindnejefpokejbdd)
- [WAVE](https://wave.webaim.org/extension/)

**チェック項目**:

1. **キーボードナビゲーション**:
```astro
<!-- すべてのインタラクティブ要素にtabindexを設定 -->
<button tabindex="0">検索</button>
<a href="..." tabindex="0">リンク</a>
```

2. **ARIA属性の追加**:
```astro
<!-- Search.astro -->
<div role="search" aria-label="サイト内検索">
  <input
    type="search"
    aria-label="検索キーワードを入力"
    aria-describedby="search-help"
  />
  <div id="search-help" class="sr-only">
    キーワードを入力してEnterキーを押してください
  </div>
</div>
```

3. **スクリーンリーダー対応**:
```astro
<!-- VersionSelector.astro -->
<select
  id="version-select"
  aria-label="ドキュメントのバージョンを選択"
  onchange="window.location.href = this.value"
>
  <option value="...">v2.0 (最新)</option>
</select>
```

**成功基準**:
- ✅ axe DevToolsで重大な問題が0件
- ✅ WAVEで警告が最小限
- ✅ キーボードのみで全機能が操作可能
- ✅ Lighthouse Accessibility スコア90以上

#### 2-2. フォーカス管理

**実装箇所**: `src/components/Navigation.astro`, `src/components/Sidebar.astro`

```astro
<style>
  /* フォーカス時の視覚的フィードバック */
  a:focus,
  button:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  /* スキップリンクの実装 */
  .skip-to-content {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--color-primary);
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
  }

  .skip-to-content:focus {
    top: 0;
  }
</style>
```

---

### タスク3: 検索機能強化（推定工数: 3-4時間）

#### 3-1. ファセット検索（フィルタ機能）

**目標**: プロジェクト、バージョン、言語でフィルタリング可能な検索

**実装手順**:

**Search.astro**の拡張:
```astro
<div class="search-filters">
  <select id="project-filter" aria-label="プロジェクトで絞り込み">
    <option value="">すべてのプロジェクト</option>
    <option value="sample-docs">Sample Docs</option>
    <option value="test-verification">Test Verification</option>
    <option value="libx-docs">LibX Docs</option>
  </select>

  <select id="version-filter" aria-label="バージョンで絞り込み">
    <option value="">すべてのバージョン</option>
    <option value="v2">v2</option>
    <option value="v1">v1</option>
  </select>

  <select id="lang-filter" aria-label="言語で絞り込み">
    <option value="">すべての言語</option>
    <option value="ja">日本語</option>
    <option value="en">English</option>
    <option value="ko">한국어</option>
  </select>
</div>

<script>
  // Pagefindのフィルタ機能を使用
  const search = await pagefind.search(query, {
    filters: {
      project: [projectFilter],
      version: [versionFilter],
      lang: [langFilter]
    }
  });
</script>
```

**Pagefindメタデータの追加**:

**[...slug].astro**:
```astro
<div
  data-pagefind-body
  data-pagefind-filter="project:{project}"
  data-pagefind-filter="version:{version}"
  data-pagefind-filter="lang:{lang}"
>
  {Content ? <Content /> : <div>...</div>}
</div>
```

**成功基準**:
- ✅ フィルタが正常に動作する
- ✅ 複数フィルタの組み合わせが可能
- ✅ フィルタ選択状態がURLパラメータで保持される

#### 3-2. 検索結果のページネーション

**実装手順**:

```astro
<script>
  let currentPage = 1;
  const resultsPerPage = 10;

  function displayResults(results, page) {
    const start = (page - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    const pageResults = results.slice(start, end);

    // 結果表示
    renderResults(pageResults);

    // ページネーション表示
    renderPagination(results.length, page);
  }

  function renderPagination(totalResults, currentPage) {
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    const paginationHTML = `
      <nav aria-label="検索結果のページネーション">
        <ul class="pagination">
          ${currentPage > 1 ? `<li><a href="#" data-page="${currentPage - 1}">前へ</a></li>` : ''}
          ${Array.from({length: totalPages}, (_, i) => i + 1).map(page => `
            <li class="${page === currentPage ? 'active' : ''}">
              <a href="#" data-page="${page}">${page}</a>
            </li>
          `).join('')}
          ${currentPage < totalPages ? `<li><a href="#" data-page="${currentPage + 1}">次へ</a></li>` : ''}
        </ul>
      </nav>
    `;
    document.getElementById('pagination').innerHTML = paginationHTML;
  }
</script>
```

**成功基準**:
- ✅ 検索結果が10件ずつ表示される
- ✅ ページネーションが正常に動作する
- ✅ キーボードで操作可能

#### 3-3. 検索ハイライト機能

**実装手順**:

```astro
<script>
  function highlightSearchTerms(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  async function displaySearchResults(results, query) {
    const resultsHTML = results.map(result => `
      <article class="search-result">
        <h3>
          <a href="${result.url}">
            ${highlightSearchTerms(result.meta.title, query)}
          </a>
        </h3>
        <p class="excerpt">
          ${highlightSearchTerms(result.excerpt, query)}
        </p>
        <div class="meta">
          <span class="project">${result.meta.project}</span>
          <span class="version">${result.meta.version}</span>
          <span class="lang">${result.meta.lang}</span>
        </div>
      </article>
    `).join('');

    document.getElementById('search-results').innerHTML = resultsHTML;
  }
</script>

<style>
  mark {
    background-color: yellow;
    font-weight: bold;
    padding: 0 2px;
  }
</style>
```

**成功基準**:
- ✅ 検索キーワードがハイライト表示される
- ✅ タイトルと本文の両方でハイライトされる
- ✅ ハイライト色がアクセシブル（コントラスト比4.5:1以上）

---

### タスク4: 統合テスト（推定工数: 2-3時間）

#### 4-1. 全ページ表示確認

**テストスクリプト作成**:

**test-pages.sh**:
```bash
#!/bin/bash

# ビルド実行
pnpm build

# 全HTMLファイルのリスト取得
find dist -name "*.html" > page-list.txt

# 各ページのHTMLバリデーション
while IFS= read -r file; do
  echo "Validating: $file"
  # HTML構造が正しいか確認
  if ! grep -q "<html" "$file"; then
    echo "ERROR: Missing <html> tag in $file"
  fi
  if ! grep -q "</html>" "$file"; then
    echo "ERROR: Missing </html> tag in $file"
  fi
done < page-list.txt

echo "Page validation complete!"
```

**成功基準**:
- ✅ 全63ページがエラーなく生成される
- ✅ 各ページにMDXコンテンツが含まれる
- ✅ HTMLバリデーションをパスする

#### 4-2. Lighthouseスコア測定

**測定手順**:

```bash
# Lighthouseのインストール
pnpm add -D lighthouse

# テストスクリプトの作成
cat > test-lighthouse.js << 'EOF'
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {logLevel: 'info', output: 'html', port: chrome.port};
  const runnerResult = await lighthouse(url, options);

  console.log('Performance score:', runnerResult.lhr.categories.performance.score * 100);
  console.log('Accessibility score:', runnerResult.lhr.categories.accessibility.score * 100);
  console.log('Best Practices score:', runnerResult.lhr.categories['best-practices'].score * 100);
  console.log('SEO score:', runnerResult.lhr.categories.seo.score * 100);

  await chrome.kill();
}

runLighthouse('http://localhost:4321/sample-docs/v2/ja/guide/getting-started');
EOF

node test-lighthouse.js
```

**目標スコア**:
- Performance: 80以上
- Accessibility: 90以上
- Best Practices: 90以上
- SEO: 90以上

#### 4-3. 機能テスト

**テスト項目**:

1. **ナビゲーション**:
   - [ ] サイドバーの展開/折りたたみが動作する
   - [ ] サイドバーのリンクが正しいページに遷移する
   - [ ] ブレッドクラムが正しく表示される

2. **バージョンセレクター**:
   - [ ] ドロップダウンが表示される
   - [ ] バージョンを変更すると正しいページに遷移する
   - [ ] 最新版・非推奨版のラベルが表示される

3. **検索機能**:
   - [ ] 検索ボックスにキーワードを入力すると結果が表示される
   - [ ] フィルタが正常に動作する
   - [ ] ページネーションが動作する
   - [ ] 検索結果をクリックすると該当ページに遷移する

4. **関連ドキュメント**:
   - [ ] 関連ドキュメントが表示される
   - [ ] カードをクリックすると該当ページに遷移する

---

## ⚠️ 注意事項・制約事項

### 1. Vite Aliasの制約

**問題**: `@apps`エイリアスは開発時とビルド時で動作が異なる可能性がある

**対応**:
- 必ずビルドして動作確認すること
- 開発サーバーとビルド成果物の両方でテストすること

### 2. Pagefindの制約

**問題**: Pagefindはビルド後にのみ動作する

**対応**:
- 開発時は検索機能が動作しない
- `pnpm preview`でビルド成果物をプレビューして検索をテストすること

### 3. MDXファイルの番号接頭辞

**問題**: ファイル名に番号接頭辞（`01-`, `02-`）が必須

**対応**:
- 新しいMDXファイルを追加する際は必ず番号接頭辞を付けること
- レジストリのslugには番号接頭辞を含めないこと

---

## 🧪 テスト・デバッグ手順

### 1. ローカル開発サーバーでの確認

```bash
cd packages/runtime
pnpm dev
```

以下のURLで動作確認：
- http://localhost:4321/sample-docs/v2/ja/guide/getting-started
- http://localhost:4321/test-verification/v2/en/guide/getting-started

### 2. ビルドテスト

```bash
# ビルド実行
pnpm build

# 生成ファイル確認
ls -la dist/
find dist -name "*.html" | wc -l  # 63が表示されるはず

# プレビュー
pnpm preview
```

### 3. パフォーマンステスト

```bash
# Lighthouseでパフォーマンス測定
lighthouse http://localhost:4321/sample-docs/v2/ja/guide/getting-started --view
```

---

## 📚 参考資料

### Phase 2-3成果物

- [Phase 2-3完了報告書](./phase-2-3-completion-report.md)
- [packages/runtime/README.md](../../packages/runtime/README.md)
- [packages/runtime/src/pages/[project]/[version]/[lang]/[...slug].astro](../../packages/runtime/src/pages/[project]/[version]/[lang]/[...slug].astro)

### Phase 2計画書

- [Phase 2-3 計画書](../phase-2-3-search.md)
- [Astro統合技術調査](../research/astro-integration.md)
- [UI/テーマ準備状況評価](../research/ui-theme-readiness.md)

### 外部ドキュメント

- [Astro Performance](https://docs.astro.build/en/guides/performance/)
- [Astro Accessibility](https://docs.astro.build/en/guides/accessibility/)
- [Pagefind Documentation](https://pagefind.app/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)

---

## 💡 推奨作業順序

Phase 2-4の実装は以下の順序で進めることを推奨：

1. **パフォーマンス最適化**（2-3時間）
   - 画像最適化（Astro Image統合）
   - コード分割最適化
   - CSS最小化

2. **アクセシビリティ向上**（2-3時間）
   - WCAG 2.1準拠チェック
   - キーボードナビゲーション改善
   - ARIA属性追加
   - スクリーンリーダー対応

3. **検索機能強化**（3-4時間）
   - ファセット検索実装
   - ページネーション実装
   - 検索ハイライト実装

4. **統合テスト**（2-3時間）
   - 全ページ表示確認
   - Lighthouseスコア測定
   - 機能テスト

**推定総工数**: 9-13時間（2-3営業日）

---

## 🆘 トラブルシューティング

### よくある問題

#### 1. Lighthouseスコアが低い

**原因**: 画像最適化が不十分、未使用CSSが多い

**解決策**:
- Astro Imageを使用してすべての画像を最適化
- PurgeCSSで未使用CSSを削除
- コード分割を最適化

#### 2. アクセシビリティエラーが多い

**原因**: ARIA属性の不足、コントラスト比不足

**解決策**:
- axe DevToolsで具体的なエラーを確認
- 各エラーに対して適切なARIA属性を追加
- カラーパレットを調整してコントラスト比を改善

#### 3. 検索フィルタが動作しない

**原因**: Pagefindメタデータの不足

**解決策**:
- HTMLに`data-pagefind-filter`属性を追加
- ビルドを再実行してインデックスを再生成

---

## 📞 サポート・質問

Phase 2-4実装中に不明点があれば、以下を参照してください：

1. **Phase 2-3完了報告**: `docs/new-generator-plan/status/phase-2-3-completion-report.md`
2. **generatorパッケージAPI**: `packages/generator/README.md`
3. **Astro公式ドキュメント**: https://docs.astro.build/

---

**作成者**: Claude
**作成日**: 2025-10-19
**対象フェーズ**: Phase 2-4
**前提フェーズ**: Phase 2-3（完了）

---

🎯 **次のステップ**: Phase 2-4の詳細計画書を確認し、パフォーマンス最適化から実装を開始してください。
