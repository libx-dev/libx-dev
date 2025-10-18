/**
 * @docs/generator の基本的な使用例
 *
 * 実行方法:
 * node examples/basic-usage.js
 */

import { loadRegistry, generateRoutes, dumpRoutes } from '../src/index.js';

console.log('=== @docs/generator デモ ===\n');

// 1. レジストリの読み込み
console.log('1. レジストリを読み込み中...');
const registry = loadRegistry('registry/docs.json', '../..');
console.log(`   ✅ ${registry.projects.length}個のプロジェクトを読み込みました\n`);

// 2. production環境用のルーティング生成
console.log('2. production環境用のルーティングを生成中...');
const productionRoutes = generateRoutes(registry, {
  env: 'production',
  debug: false,
});
console.log(`   ✅ ${productionRoutes.length}個のルートを生成しました\n`);

// 3. development環境用のルーティング生成
console.log('3. development環境用のルーティングを生成中...');
const developmentRoutes = generateRoutes(registry, {
  env: 'development',
  debug: false,
});
console.log(`   ✅ ${developmentRoutes.length}個のルートを生成しました\n`);

// 4. 特定プロジェクトのみ生成
console.log('4. test-verificationプロジェクトのみ生成中...');
const testRoutes = generateRoutes(registry, {
  env: 'development',
  projectId: 'test-verification',
  debug: false,
});
console.log(`   ✅ ${testRoutes.length}個のルートを生成しました\n`);

// 5. ルーティング情報の詳細表示
console.log('5. production環境のルーティング詳細:');
dumpRoutes(productionRoutes, 10);

console.log('\n=== デモ完了 ===');
