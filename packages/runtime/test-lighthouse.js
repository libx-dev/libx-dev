/**
 * Lighthouse パフォーマンス・アクセシビリティテスト
 */
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

/**
 * 指定したURLでLighthouseテストを実行
 * @param {string} url - テスト対象のURL
 * @returns {Promise<object>} Lighthouseの結果
 */
async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
  });

  try {
    const options = {
      logLevel: 'info',
      output: 'html',
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
    };

    const runnerResult = await lighthouse(url, options);

    // スコアを表示
    const { lhr } = runnerResult;
    const scores = {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100)
    };

    console.log('\n========================================');
    console.log(`📊 Lighthouse スコア - ${url}`);
    console.log('========================================');
    console.log(`⚡ Performance:      ${scores.performance}/100 ${getEmoji(scores.performance)}`);
    console.log(`♿ Accessibility:    ${scores.accessibility}/100 ${getEmoji(scores.accessibility)}`);
    console.log(`✨ Best Practices:   ${scores.bestPractices}/100 ${getEmoji(scores.bestPractices)}`);
    console.log(`🔍 SEO:              ${scores.seo}/100 ${getEmoji(scores.seo)}`);
    console.log('========================================\n');

    // 詳細な監査結果
    const audits = lhr.audits;
    console.log('📋 主要なメトリクス:');
    console.log(`  FCP (First Contentful Paint): ${audits['first-contentful-paint']?.displayValue || 'N/A'}`);
    console.log(`  LCP (Largest Contentful Paint): ${audits['largest-contentful-paint']?.displayValue || 'N/A'}`);
    console.log(`  TBT (Total Blocking Time): ${audits['total-blocking-time']?.displayValue || 'N/A'}`);
    console.log(`  CLS (Cumulative Layout Shift): ${audits['cumulative-layout-shift']?.displayValue || 'N/A'}`);
    console.log(`  SI (Speed Index): ${audits['speed-index']?.displayValue || 'N/A'}`);

    // アクセシビリティの問題
    console.log('\n♿ アクセシビリティ監査:');
    const a11yAudits = Object.values(audits).filter(audit =>
      audit.scoreDisplayMode === 'binary' &&
      audit.score !== null &&
      audit.score < 1 &&
      (audit.id.includes('aria') || audit.id.includes('color-contrast') || audit.id.includes('heading'))
    );

    if (a11yAudits.length > 0) {
      a11yAudits.slice(0, 5).forEach(audit => {
        console.log(`  ⚠️  ${audit.title}`);
      });
    } else {
      console.log('  ✅ 主要なアクセシビリティ問題は見つかりませんでした');
    }

    return { scores, lhr };
  } finally {
    await chrome.kill();
  }
}

/**
 * スコアに応じた絵文字を返す
 * @param {number} score - スコア (0-100)
 * @returns {string} 絵文字
 */
function getEmoji(score) {
  if (score >= 90) return '🟢 優秀';
  if (score >= 50) return '🟡 改善可能';
  return '🔴 要改善';
}

/**
 * 複数のページをテスト
 */
async function runTests() {
  const baseUrl = 'http://localhost:4321';

  const testUrls = [
    `${baseUrl}/sample-docs/v2/ja/guide/getting-started`,
    `${baseUrl}/test-verification/v2/en/guide/getting-started`,
    `${baseUrl}/libx-docs/v1/ja/guide/getting-started`
  ];

  console.log('🚀 Lighthouseテストを開始します...\n');
  console.log(`📝 テスト対象: ${testUrls.length}ページ\n`);

  const results = [];

  for (const url of testUrls) {
    try {
      const result = await runLighthouse(url);
      results.push({ url, ...result });
    } catch (error) {
      console.error(`❌ エラー: ${url}`, error.message);
    }
  }

  // 平均スコアを計算
  console.log('\n========================================');
  console.log('📈 平均スコア');
  console.log('========================================');

  const avgScores = {
    performance: Math.round(results.reduce((sum, r) => sum + r.scores.performance, 0) / results.length),
    accessibility: Math.round(results.reduce((sum, r) => sum + r.scores.accessibility, 0) / results.length),
    bestPractices: Math.round(results.reduce((sum, r) => sum + r.scores.bestPractices, 0) / results.length),
    seo: Math.round(results.reduce((sum, r) => sum + r.scores.seo, 0) / results.length)
  };

  console.log(`⚡ Performance:      ${avgScores.performance}/100 ${getEmoji(avgScores.performance)}`);
  console.log(`♿ Accessibility:    ${avgScores.accessibility}/100 ${getEmoji(avgScores.accessibility)}`);
  console.log(`✨ Best Practices:   ${avgScores.bestPractices}/100 ${getEmoji(avgScores.bestPractices)}`);
  console.log(`🔍 SEO:              ${avgScores.seo}/100 ${getEmoji(avgScores.seo)}`);
  console.log('========================================\n');

  // 目標達成確認
  console.log('🎯 目標達成状況:');
  console.log(`  Performance ≥ 80:    ${avgScores.performance >= 80 ? '✅ 達成' : '❌ 未達成'}`);
  console.log(`  Accessibility ≥ 90:  ${avgScores.accessibility >= 90 ? '✅ 達成' : '❌ 未達成'}`);
  console.log(`  Best Practices ≥ 90: ${avgScores.bestPractices >= 90 ? '✅ 達成' : '❌ 未達成'}`);
  console.log(`  SEO ≥ 90:            ${avgScores.seo >= 90 ? '✅ 達成' : '❌ 未達成'}`);
  console.log('');

  return avgScores;
}

// テスト実行
runTests().catch(console.error);
