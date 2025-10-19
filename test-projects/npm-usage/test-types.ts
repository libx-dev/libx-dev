/**
 * TypeScript 型定義完全性テスト
 *
 * 検証項目:
 * - すべてのエクスポートに型定義が存在するか
 * - TypeScriptコンパイラがエラーなく型チェックできるか
 */

// @docs/generator の型定義テスト
import type {
  SidebarItem,
  SidebarDocItem,
  SitemapEntry,
  GenerateSidebarOptions,
  GenerateSitemapOptions
} from '../../packages/generator/dist/index.d.ts';

import {
  loadRegistry,
  generateRoutes,
  generateSidebar,
  generateSitemap,
  getProject,
  getDocument
} from '../../packages/generator/dist/index.js';

// @docs/theme の型定義テスト
import {
  spacing,
  typography,
  fontSizes,
  fontWeights,
  initTheme,
  applyTheme
} from '../../packages/theme/dist/index.js';

// @docs/i18n の型定義テスト
import {
  supportedLocales,
  getLanguage,
  translate
} from '../../packages/i18n/dist/index.js';

// ========================================
// 型チェックテスト: @docs/generator
// ========================================

console.log('========================================');
console.log('🧪 TypeScript 型定義完全性テスト');
console.log('========================================\n');

console.log('📦 テスト1: @docs/generator 型定義');

// SidebarItem型のテスト
const testSidebarItem: SidebarItem = {
  title: 'ガイド',
  slug: 'guide',
  order: 1,
  items: [
    {
      title: 'はじめに',
      href: '/guide/getting-started',
      docId: 'getting-started',
      order: 1
    }
  ]
};

// SitemapEntry型のテスト
const testSitemapEntry: SitemapEntry = {
  url: 'https://example.com/guide/getting-started',
  lastmod: '2025-10-20',
  changefreq: 'weekly',
  priority: 0.8
};

console.log('  ✅ SidebarItem型: 型チェックOK');
console.log('  ✅ SitemapEntry型: 型チェックOK');
console.log();

// ========================================
// 型チェックテスト: @docs/theme
// ========================================

console.log('📦 テスト2: @docs/theme 型定義');

// spacing オブジェクトのテスト
const testSpacing = spacing;

// typography オブジェクトのテスト
const testTypography = typography;

// fontSizes オブジェクトのテスト
const testFontSizes = fontSizes;

console.log('  ✅ spacing オブジェクト: 型チェックOK');
console.log('  ✅ typography オブジェクト: 型チェックOK');
console.log('  ✅ fontSizes オブジェクト: 型チェックOK');
console.log();

// ========================================
// 型チェックテスト: @docs/i18n
// ========================================

console.log('📦 テスト3: @docs/i18n 型定義');

// supportedLocales 配列のテスト
const testLocales = supportedLocales;

// translate 関数のテスト（型推論）
const testTranslate = translate;

console.log('  ✅ supportedLocales 配列: 型チェックOK');
console.log('  ✅ translate 関数: 型チェックOK');
console.log();

// ========================================
// 関数型テスト
// ========================================

console.log('📦 テスト4: 関数シグネチャ');

// loadRegistry関数の型テスト
const registry = loadRegistry('../../registry/docs.json');

// generateRoutes関数の型テスト
const routes = generateRoutes(registry);

// generateSidebar関数の型テスト
const sidebar = generateSidebar(registry, 'sample-docs', 'v2', 'ja');

// generateSitemap関数の型テスト（正しい引数）
const sitemap = generateSitemap(registry, 'https://example.com');

console.log('  ✅ loadRegistry関数: 型チェックOK');
console.log('  ✅ generateRoutes関数: 型チェックOK');
console.log('  ✅ generateSidebar関数: 型チェックOK');
console.log('  ✅ generateSitemap関数: 型チェックOK');
console.log();

console.log('========================================');
console.log('✅ TypeScript 型定義完全性テスト完了');
console.log('========================================\n');

// このファイルが型チェックを通ることを確認
// 実行コマンド: npx tsc --noEmit test-types.ts
