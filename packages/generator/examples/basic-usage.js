/**
 * @docs/generator の基本的な使用例
 *
 * 実行方法:
 * node examples/basic-usage.js
 */

import {
  loadRegistry,
  generateRoutes,
  dumpRoutes,
  generateSidebar,
  dumpSidebar,
  generateSitemap,
  sitemapToXml,
  generateRobotsTxt,
  generateManifest,
} from '../src/index.js';

console.log('=== @docs/generator デモ ===\n');

// 1. レジストリの読み込み
console.log('1. レジストリを読み込み中...');
const registry = loadRegistry('registry/docs.json', '../..');
console.log(`   ✅ ${registry.projects.length}個のプロジェクトを読み込みました\n`);

// 2. ルーティング生成
console.log('2. ルーティング生成');
console.log('   production環境用のルーティングを生成中...');
const productionRoutes = generateRoutes(registry, {
  env: 'production',
  debug: false,
});
console.log(`   ✅ ${productionRoutes.length}個のルートを生成しました`);

console.log('   development環境用のルーティングを生成中...');
const developmentRoutes = generateRoutes(registry, {
  env: 'development',
  debug: false,
});
console.log(`   ✅ ${developmentRoutes.length}個のルートを生成しました\n`);

// 3. サイドバー生成
console.log('3. サイドバー生成');
const sidebar = generateSidebar(
  registry,
  'sample-docs',
  'v2',
  'ja',
  { baseUrl: '/docs/sample-docs' }
);
console.log(`   ✅ ${sidebar.length}個のカテゴリを生成しました`);
dumpSidebar(sidebar);

// 4. サイトマップ生成
console.log('4. サイトマップ生成');
const sitemap = generateSitemap(
  registry,
  'https://libx.dev',
  {
    env: 'production',
    defaultChangefreq: 'weekly',
    defaultPriority: 0.5,
  }
);
console.log(`   ✅ ${sitemap.length}個のURLを生成しました`);

// サイトマップをXML形式で出力（最初の3件のみ表示）
const sitemapXml = sitemapToXml(sitemap.slice(0, 3));
console.log('\n   サイトマップXMLサンプル（最初の3件）:');
console.log('   ' + sitemapXml.split('\n').join('\n   '));
console.log('');

// 5. robots.txt生成
console.log('5. robots.txt生成');
const robotsTxt = generateRobotsTxt('https://libx.dev', {
  sitemapUrl: '/sitemap.xml',
});
console.log('   ✅ robots.txtを生成しました');
console.log('\n   robots.txt内容:');
console.log('   ' + robotsTxt.split('\n').join('\n   '));

// 6. manifest.json生成
console.log('6. manifest.json生成');
const manifest = generateManifest(registry, 'sample-docs', {
  lang: 'ja',
  themeColor: '#1e40af',
});
console.log('   ✅ manifest.jsonを生成しました');
console.log('\n   manifest.json内容:');
console.log('   ' + JSON.stringify(manifest, null, 2).split('\n').join('\n   '));

console.log('\n=== デモ完了 ===');
