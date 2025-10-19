/**
 * 共有パッケージの統合互換性テスト
 *
 * 検証項目:
 * - すべての共有パッケージが連携して動作するか
 * - runtimeパッケージと同様の使用パターンで動作するか
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('========================================');
console.log('🧪 共有パッケージ統合互換性テスト');
console.log('========================================\n');

let testsPassed = 0;
let testsFailed = 0;

/**
 * テスト結果を記録
 */
function recordTest(testName, passed, error = null) {
  if (passed) {
    console.log(`  ✅ ${testName}`);
    testsPassed++;
  } else {
    console.log(`  ❌ ${testName}`);
    if (error) {
      console.log(`     エラー: ${error.message}`);
    }
    testsFailed++;
  }
}

// ========================================
// テスト1: レジストリ読み込みと検証
// ========================================
console.log('📦 テスト1: レジストリ読み込みと検証');

try {
  const { loadRegistry } = await import('../../packages/generator/dist/index.js');
  const registryPath = resolve(__dirname, '../../registry/docs.json');

  // レジストリ読み込み
  const registry = loadRegistry(registryPath);
  recordTest('レジストリ読み込み', !!registry);

  // レジストリ構造確認
  recordTest('projects存在確認', !!registry.projects);
  recordTest('$schemaVersion存在確認', !!registry.$schemaVersion);
  console.log(`     スキーマバージョン: ${registry.$schemaVersion}`);

  console.log();
} catch (error) {
  recordTest('レジストリ読み込みと検証', false, error);
  console.log();
}

// ========================================
// テスト2: ルーティング生成
// ========================================
console.log('📦 テスト2: ルーティング生成');

try {
  const { loadRegistry, generateRoutes } = await import('../../packages/generator/dist/index.js');
  const registryPath = resolve(__dirname, '../../registry/docs.json');
  const registry = loadRegistry(registryPath);

  // ルーティング生成
  const routes = generateRoutes(registry);
  recordTest('ルーティング生成', routes.length > 0);
  console.log(`     生成されたルート数: ${routes.length}`);

  // ルート構造確認
  const firstRoute = routes[0];
  recordTest('ルートにparamsが存在', !!firstRoute.params);
  recordTest('ルートにpropsが存在', !!firstRoute.props);

  console.log();
} catch (error) {
  recordTest('ルーティング生成', false, error);
  console.log();
}

// ========================================
// テスト3: サイドバー生成
// ========================================
console.log('📦 テスト3: サイドバー生成');

try {
  const { loadRegistry, generateSidebar } = await import('../../packages/generator/dist/index.js');
  const registryPath = resolve(__dirname, '../../registry/docs.json');
  const registry = loadRegistry(registryPath);

  // サイドバー生成
  const sidebar = generateSidebar(registry, 'sample-docs', 'v2', 'ja');
  recordTest('サイドバー生成', sidebar.length > 0);
  console.log(`     生成されたサイドバー項目数: ${sidebar.length}`);

  // サイドバー構造確認
  const firstItem = sidebar[0];
  recordTest('サイドバー項目にtitleが存在', !!firstItem.title);
  recordTest('サイドバー項目にslugが存在', !!firstItem.slug);
  recordTest('サイドバー項目にitemsが存在', Array.isArray(firstItem.items));

  console.log();
} catch (error) {
  recordTest('サイドバー生成', false, error);
  console.log();
}

// ========================================
// テスト4: テーマシステム
// ========================================
console.log('📦 テスト4: テーマシステム');

try {
  const theme = await import('../../packages/theme/dist/index.js');

  // タイポグラフィ確認
  recordTest('typographyオブジェクト存在', !!theme.typography);

  // スペーシング確認
  recordTest('spacingオブジェクト存在', !!theme.spacing);

  // フォントサイズ確認
  recordTest('fontSizesオブジェクト存在', !!theme.fontSizes);

  console.log();
} catch (error) {
  recordTest('テーマシステム', false, error);
  console.log();
}

// ========================================
// テスト5: CSS配布
// ========================================
console.log('📦 テスト5: CSS配布');

try {
  const fs = await import('fs');
  const variablesCssPath = resolve(__dirname, '../../packages/theme/src/css/variables.css');
  const baseCssPath = resolve(__dirname, '../../packages/theme/src/css/base.css');

  // CSSファイル存在確認
  recordTest('variables.css存在', fs.existsSync(variablesCssPath));
  recordTest('base.css存在', fs.existsSync(baseCssPath));

  // CSS内容確認（最小限）
  if (fs.existsSync(variablesCssPath)) {
    const variablesCss = fs.readFileSync(variablesCssPath, 'utf-8');
    recordTest('variables.cssに:root定義が存在', variablesCss.includes(':root'));
  }

  console.log();
} catch (error) {
  recordTest('CSS配布', false, error);
  console.log();
}

// ========================================
// テスト6: 国際化（i18n）
// ========================================
console.log('📦 テスト6: 国際化（i18n）');

try {
  const i18n = await import('../../packages/i18n/dist/index.js');

  // サポート言語確認
  recordTest('supportedLocales配列存在', Array.isArray(i18n.supportedLocales));

  if (Array.isArray(i18n.supportedLocales)) {
    recordTest('サポート言語リスト取得', i18n.supportedLocales.length > 0);
    console.log(`     サポート言語数: ${i18n.supportedLocales.length}`);
  }

  // 言語取得関数確認
  recordTest('getLanguage関数存在', typeof i18n.getLanguage === 'function');

  // 翻訳関数確認
  recordTest('translate関数存在', typeof i18n.translate === 'function');

  console.log();
} catch (error) {
  recordTest('国際化（i18n）', false, error);
  console.log();
}

// ========================================
// テスト7: エントリーポイント整合性
// ========================================
console.log('📦 テスト7: エントリーポイント整合性');

try {
  // @docs/generator のエントリーポイント
  const generatorMain = await import('../../packages/generator/dist/index.js');
  const generatorRouting = await import('../../packages/generator/dist/routing.js');
  const generatorRegistry = await import('../../packages/generator/dist/registry.js');

  recordTest('generator: メインエントリーポイント', !!generatorMain);
  recordTest('generator: routingエントリーポイント', !!generatorRouting);
  recordTest('generator: registryエントリーポイント', !!generatorRegistry);

  // @docs/theme のエントリーポイント
  const themeMain = await import('../../packages/theme/dist/index.js');
  const themeColors = await import('../../packages/theme/dist/colors.js');
  const themeTypography = await import('../../packages/theme/dist/typography.js');
  const themeSpacing = await import('../../packages/theme/dist/spacing.js');

  recordTest('theme: メインエントリーポイント', !!themeMain);
  recordTest('theme: colorsエントリーポイント', !!themeColors);
  recordTest('theme: typographyエントリーポイント', !!themeTypography);
  recordTest('theme: spacingエントリーポイント', !!themeSpacing);

  console.log();
} catch (error) {
  recordTest('エントリーポイント整合性', false, error);
  console.log();
}

// ========================================
// テスト結果サマリー
// ========================================
console.log('========================================');
console.log('📊 テスト結果サマリー');
console.log('========================================');
console.log(`  ✅ 成功: ${testsPassed}件`);
console.log(`  ❌ 失敗: ${testsFailed}件`);
console.log(`  📊 成功率: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
console.log('========================================\n');

if (testsFailed > 0) {
  console.log('⚠️  一部のテストが失敗しました。詳細を確認してください。');
  process.exit(1);
} else {
  console.log('✅ すべてのテストが成功しました！');
  process.exit(0);
}
