/**
 * CommonJS (CJS) 形式でのビルド成果物テスト
 *
 * 検証項目:
 * - @docs/generatorのCJS出力が正しく読み込めるか
 * - 主要な関数がエクスポートされているか
 */

const path = require('path');

console.log('========================================');
console.log('🧪 CJS形式 ビルド成果物テスト');
console.log('========================================\n');

// テスト1: @docs/generator のCJS読み込み
console.log('📦 テスト1: @docs/generator (CJS)');
try {
  const generatorPath = path.resolve(__dirname, '../../packages/generator/dist/index.cjs');
  const generator = require(generatorPath);

  console.log('  ✅ CJS読み込み成功');

  // エクスポートされた関数の確認
  const exports = Object.keys(generator);
  console.log(`  ✅ エクスポート数: ${exports.length}`);
  console.log(`  📋 エクスポート一覧: ${exports.join(', ')}`);

  // 主要な関数の存在確認
  const expectedExports = ['loadRegistry', 'validateRegistry', 'generateRoutes', 'generateSidebar'];
  const missingExports = expectedExports.filter(name => !exports.includes(name));

  if (missingExports.length > 0) {
    console.log(`  ⚠️  不足しているエクスポート: ${missingExports.join(', ')}`);
  } else {
    console.log('  ✅ すべての主要関数がエクスポートされています');
  }

  console.log();
} catch (error) {
  console.error('  ❌ CJS読み込み失敗:', error.message);
  console.log();
}

// テスト2: @docs/theme のCJS読み込み
console.log('📦 テスト2: @docs/theme (CJS)');
try {
  const themePath = path.resolve(__dirname, '../../packages/theme/dist/index.cjs');
  const theme = require(themePath);

  console.log('  ✅ CJS読み込み成功');

  const exports = Object.keys(theme);
  console.log(`  ✅ エクスポート数: ${exports.length}`);
  console.log(`  📋 エクスポート一覧: ${exports.join(', ')}`);

  console.log();
} catch (error) {
  console.error('  ❌ CJS読み込み失敗:', error.message);
  console.log();
}

// テスト3: @docs/i18n のCJS読み込み
console.log('📦 テスト3: @docs/i18n (CJS)');
try {
  const i18nPath = path.resolve(__dirname, '../../packages/i18n/dist/index.cjs');
  const i18n = require(i18nPath);

  console.log('  ✅ CJS読み込み成功');

  const exports = Object.keys(i18n);
  console.log(`  ✅ エクスポート数: ${exports.length}`);
  console.log(`  📋 エクスポート一覧: ${exports.join(', ')}`);

  console.log();
} catch (error) {
  console.error('  ❌ CJS読み込み失敗:', error.message);
  console.log();
}

// テスト4: @docs/generator のサブエントリーポイント
console.log('📦 テスト4: @docs/generator サブエントリーポイント');
try {
  const routingPath = path.resolve(__dirname, '../../packages/generator/dist/routing.cjs');
  const registryPath = path.resolve(__dirname, '../../packages/generator/dist/registry.cjs');
  const typesPath = path.resolve(__dirname, '../../packages/generator/dist/types.cjs');

  const routing = require(routingPath);
  const registry = require(registryPath);
  const types = require(typesPath);

  console.log('  ✅ routing.cjs 読み込み成功');
  console.log('  ✅ registry.cjs 読み込み成功');
  console.log('  ✅ types.cjs 読み込み成功');

  console.log();
} catch (error) {
  console.error('  ❌ サブエントリーポイント読み込み失敗:', error.message);
  console.log();
}

console.log('========================================');
console.log('✅ CJS形式テスト完了');
console.log('========================================\n');
