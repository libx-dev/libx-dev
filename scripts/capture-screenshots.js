/**
 * スクリーンショット自動撮影スクリプト
 *
 * Phase 2-6のデモ資料作成用に、主要な画面のスクリーンショットを自動撮影します。
 *
 * 使用方法:
 *   pnpm install playwright  # 初回のみ
 *   node scripts/capture-screenshots.js
 *
 * 撮影される画面:
 *   1. トップページ
 *   2. サイドバーナビゲーション
 *   3. 検索機能（検索ボックス、結果表示）
 *   4. バージョン切り替え
 *   5. 言語切り替え
 *   6. レスポンシブデザイン（モバイル/タブレット）
 *   7. ダークモード
 */

import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 設定
const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';
const OUTPUT_DIR = resolve(__dirname, '../docs/new-generator-plan/demos/screenshots');
const TIMEOUT = 3000; // 各ページの読み込み待機時間（ミリ秒）

// スクリーンショット設定
const screenshots = [
  // 1. トップページ
  {
    name: '01-homepage',
    url: '/',
    description: 'トップページ - プロジェクト一覧',
    viewport: { width: 1920, height: 1080 },
    actions: []
  },

  // 2. サイドバーナビゲーション
  {
    name: '02-sidebar-navigation',
    url: '/sample-docs/v2/ja/',
    description: 'サイドバーナビゲーション - カテゴリ階層',
    viewport: { width: 1920, height: 1080 },
    actions: [
      { type: 'wait', selector: 'nav[aria-label*="サイドバー"], aside nav' }
    ]
  },

  // 3. 検索機能（検索ボックス）
  {
    name: '03-search-input',
    url: '/sample-docs/v2/ja/',
    description: '検索機能 - 検索ボックス',
    viewport: { width: 1920, height: 1080 },
    actions: [
      { type: 'click', selector: 'button[aria-label*="検索"], [data-pagefind-search-trigger], input[type="search"]' },
      { type: 'wait', timeout: 1000 }
    ]
  },

  // 4. 検索結果表示
  {
    name: '04-search-results',
    url: '/sample-docs/v2/ja/',
    description: '検索機能 - 結果表示とフィルタ',
    viewport: { width: 1920, height: 1080 },
    actions: [
      { type: 'click', selector: 'button[aria-label*="検索"], [data-pagefind-search-trigger], input[type="search"]' },
      { type: 'wait', timeout: 500 },
      { type: 'fill', selector: 'input[type="search"]', value: 'コンポーネント' },
      { type: 'wait', timeout: 1500 }
    ]
  },

  // 5. バージョン切り替え
  {
    name: '05-version-selector',
    url: '/sample-docs/v2/ja/',
    description: 'バージョンセレクター',
    viewport: { width: 1920, height: 1080 },
    actions: [
      { type: 'click', selector: '[data-version-selector], select[aria-label*="バージョン"], button[aria-label*="バージョン"]' },
      { type: 'wait', timeout: 500 }
    ]
  },

  // 6. 言語切り替え
  {
    name: '06-language-switcher',
    url: '/sample-docs/v2/ja/',
    description: '言語切り替え',
    viewport: { width: 1920, height: 1080 },
    actions: [
      { type: 'click', selector: '[data-language-selector], select[aria-label*="言語"], button[aria-label*="言語"]' },
      { type: 'wait', timeout: 500 }
    ]
  },

  // 7. レスポンシブデザイン（タブレット）
  {
    name: '07-responsive-tablet',
    url: '/sample-docs/v2/ja/',
    description: 'レスポンシブデザイン（タブレット）',
    viewport: { width: 768, height: 1024 },
    actions: []
  },

  // 8. レスポンシブデザイン（モバイル）
  {
    name: '08-responsive-mobile',
    url: '/sample-docs/v2/ja/',
    description: 'レスポンシブデザイン（モバイル）',
    viewport: { width: 375, height: 667 },
    actions: []
  },

  // 9. ダークモード
  {
    name: '09-dark-mode',
    url: '/sample-docs/v2/ja/',
    description: 'ダークモード',
    viewport: { width: 1920, height: 1080 },
    actions: [
      { type: 'click', selector: 'button[aria-label*="テーマ"], [data-theme-toggle]', optional: true },
      { type: 'wait', timeout: 500 }
    ]
  },

  // 10. ドキュメントページ（目次付き）
  {
    name: '10-document-with-toc',
    url: '/sample-docs/v2/ja/guide/01-introduction',
    description: 'ドキュメントページ - 目次表示',
    viewport: { width: 1920, height: 1080 },
    actions: [
      { type: 'wait', selector: 'article, main' }
    ]
  }
];

/**
 * 出力ディレクトリを作成
 */
function ensureOutputDirectory() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ 出力ディレクトリを作成しました: ${OUTPUT_DIR}`);
  }
}

/**
 * アクションを実行
 */
async function executeAction(page, action) {
  try {
    switch (action.type) {
      case 'wait':
        if (action.selector) {
          await page.waitForSelector(action.selector, { timeout: TIMEOUT });
        } else if (action.timeout) {
          await page.waitForTimeout(action.timeout);
        }
        break;

      case 'click':
        try {
          await page.click(action.selector, { timeout: 1000 });
        } catch (error) {
          if (!action.optional) {
            throw error;
          }
          console.log(`   ⚠️  オプショナルな要素が見つかりません: ${action.selector}`);
        }
        break;

      case 'fill':
        await page.fill(action.selector, action.value);
        break;

      default:
        console.log(`   ⚠️  未知のアクションタイプ: ${action.type}`);
    }
  } catch (error) {
    console.log(`   ⚠️  アクション実行エラー: ${action.type} - ${error.message}`);
  }
}

/**
 * スクリーンショットを撮影
 */
async function captureScreenshot(page, config) {
  const { name, url, description, viewport, actions } = config;
  const outputPath = resolve(OUTPUT_DIR, `${name}.png`);

  console.log(`\n📸 撮影中: ${name}`);
  console.log(`   説明: ${description}`);
  console.log(`   URL: ${BASE_URL}${url}`);
  console.log(`   解像度: ${viewport.width}x${viewport.height}`);

  try {
    // ビューポート設定
    await page.setViewportSize(viewport);

    // ページ遷移
    await page.goto(`${BASE_URL}${url}`, {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    // 追加の待機時間
    await page.waitForTimeout(TIMEOUT);

    // アクション実行
    for (const action of actions) {
      await executeAction(page, action);
    }

    // スクリーンショット撮影
    await page.screenshot({
      path: outputPath,
      fullPage: false // ビューポート内のみ撮影
    });

    console.log(`   ✅ 保存完了: ${outputPath}`);
  } catch (error) {
    console.error(`   ❌ エラー: ${error.message}`);
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 スクリーンショット自動撮影を開始します...');
  console.log(`📁 出力先: ${OUTPUT_DIR}`);
  console.log(`🌐 ベースURL: ${BASE_URL}`);
  console.log(`📊 撮影枚数: ${screenshots.length}枚\n`);

  // 出力ディレクトリ作成
  ensureOutputDirectory();

  // ブラウザ起動
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo'
  });

  const page = await context.newPage();

  // スクリーンショット撮影
  for (const config of screenshots) {
    await captureScreenshot(page, config);
  }

  // ブラウザ終了
  await browser.close();

  console.log('\n✨ すべてのスクリーンショット撮影が完了しました！');
  console.log(`📁 出力先: ${OUTPUT_DIR}`);
}

// 実行
main().catch((error) => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});
