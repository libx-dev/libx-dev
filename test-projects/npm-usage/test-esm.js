/**
 * ECMAScript Modules (ESM) 形式でのビルド成果物テスト
 *
 * 検証項目:
 * - @docs/generatorのESM出力が正しく読み込めるか
 * - 主要な関数がエクスポートされているか
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('========================================');
console.log('🧪 ESM形式 ビルド成果物テスト');
console.log('========================================\n');

// テスト1: @docs/generator のESM読み込み
console.log('📦 テスト1: @docs/generator (ESM)');
try {
  const generatorPath = resolve(__dirname, '../../packages/generator/dist/index.js');
  const generator = await import(generatorPath);

  console.log('  ✅ ESM読み込み成功');

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
  console.error('  ❌ ESM読み込み失敗:', error.message);
  console.log();
}

// テスト2: @docs/theme のESM読み込み
console.log('📦 テスト2: @docs/theme (ESM)');
try {
  const themePath = resolve(__dirname, '../../packages/theme/dist/index.js');
  const theme = await import(themePath);

  console.log('  ✅ ESM読み込み成功');

  const exports = Object.keys(theme);
  console.log(`  ✅ エクスポート数: ${exports.length}`);
  console.log(`  📋 エクスポート一覧: ${exports.join(', ')}`);

  console.log();
} catch (error) {
  console.error('  ❌ ESM読み込み失敗:', error.message);
  console.log();
}

// テスト3: @docs/i18n のESM読み込み
console.log('📦 テスト3: @docs/i18n (ESM)');
try {
  const i18nPath = resolve(__dirname, '../../packages/i18n/dist/index.js');
  const i18n = await import(i18nPath);

  console.log('  ✅ ESM読み込み成功');

  const exports = Object.keys(i18n);
  console.log(`  ✅ エクスポート数: ${exports.length}`);
  console.log(`  📋 エクスポート一覧: ${exports.join(', ')}`);

  console.log();
} catch (error) {
  console.error('  ❌ ESM読み込み失敗:', error.message);
  console.log();
}

// テスト4: @docs/generator のサブエントリーポイント
console.log('📦 テスト4: @docs/generator サブエントリーポイント');
try {
  const routingPath = resolve(__dirname, '../../packages/generator/dist/routing.js');
  const registryPath = resolve(__dirname, '../../packages/generator/dist/registry.js');
  const typesPath = resolve(__dirname, '../../packages/generator/dist/types.js');

  const routing = await import(routingPath);
  const registry = await import(registryPath);
  const types = await import(typesPath);

  console.log('  ✅ routing.js 読み込み成功');
  console.log('  ✅ registry.js 読み込み成功');
  console.log('  ✅ types.js 読み込み成功');

  console.log();
} catch (error) {
  console.error('  ❌ サブエントリーポイント読み込み失敗:', error.message);
  console.log();
}

// テスト5: @docs/theme のサブエントリーポイント
console.log('📦 テスト5: @docs/theme サブエントリーポイント');
try {
  const colorsPath = resolve(__dirname, '../../packages/theme/dist/colors.js');
  const typographyPath = resolve(__dirname, '../../packages/theme/dist/typography.js');
  const spacingPath = resolve(__dirname, '../../packages/theme/dist/spacing.js');

  const colors = await import(colorsPath);
  const typography = await import(typographyPath);
  const spacing = await import(spacingPath);

  console.log('  ✅ colors.js 読み込み成功');
  console.log('  ✅ typography.js 読み込み成功');
  console.log('  ✅ spacing.js 読み込み成功');

  console.log();
} catch (error) {
  console.error('  ❌ サブエントリーポイント読み込み失敗:', error.message);
  console.log();
}

// テスト6: CSS配布の確認
console.log('📦 テスト6: @docs/theme CSS配布');
try {
  const fs = await import('fs');
  const variablesCssPath = resolve(__dirname, '../../packages/theme/src/css/variables.css');
  const baseCssPath = resolve(__dirname, '../../packages/theme/src/css/base.css');

  if (fs.existsSync(variablesCssPath)) {
    console.log('  ✅ variables.css 存在確認');
  } else {
    console.log('  ❌ variables.css が見つかりません');
  }

  if (fs.existsSync(baseCssPath)) {
    console.log('  ✅ base.css 存在確認');
  } else {
    console.log('  ❌ base.css が見つかりません');
  }

  console.log();
} catch (error) {
  console.error('  ❌ CSS配布確認失敗:', error.message);
  console.log();
}

console.log('========================================');
console.log('✅ ESM形式テスト完了');
console.log('========================================\n');
