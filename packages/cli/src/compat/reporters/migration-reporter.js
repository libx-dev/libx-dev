/**
 * 移行レポート生成
 *
 * 互換レイヤーから新CLIへの移行を支援するレポートを生成します。
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import * as logger from '../../utils/logger.js';

/**
 * 移行チェックリストを生成（Markdown形式）
 *
 * @param {object} options - オプション
 * @param {string} options.projectName - プロジェクト名
 * @param {object[]} options.scripts - 使用されているスクリプト一覧
 * @param {string} [options.outputPath] - 出力先パス
 * @returns {string} チェックリストのMarkdown
 */
export function generateMigrationChecklist(options) {
  const { projectName, scripts, outputPath } = options;

  const markdown = `# 移行チェックリスト: ${projectName}

**作成日**: ${new Date().toISOString().split('T')[0]}
**対象プロジェクト**: ${projectName}

---

## 📋 概要

このチェックリストは、旧スクリプトから新CLIへの移行を段階的に進めるためのものです。

## ✅ 移行前の準備

- [ ] 新CLIのインストール確認
  \`\`\`bash
  docs-cli --version
  \`\`\`

- [ ] 設定ファイルのバックアップ
  \`\`\`bash
  cp -r apps/${projectName}/src/config apps/${projectName}/src/config.backup
  \`\`\`

- [ ] 互換性チェックの実行
  \`\`\`bash
  docs-cli compat check
  \`\`\`

## 🔄 スクリプト別移行タスク

${scripts
  .map(
    (script) => `
### ${script.name}

**使用状況**: ${script.usage || '不明'}回
**最終使用**: ${script.lastUsed || '不明'}

**旧スクリプト**:
\`\`\`bash
${script.oldCommand}
\`\`\`

**新CLI**:
\`\`\`bash
${script.newCommand}
\`\`\`

**移行チェックリスト**:
- [ ] 新CLIコマンドの動作確認
- [ ] 既存の呼び出し箇所を特定
- [ ] package.json の scripts セクションを更新
- [ ] CI/CD パイプラインの更新
- [ ] ドキュメントの更新
- [ ] チームメンバーへの通知

${
  script.unsupportedOptions && script.unsupportedOptions.length > 0
    ? `
**未サポートのオプション**:
${script.unsupportedOptions.map((opt) => `- \`${opt}\``).join('\n')}

これらのオプションは新CLIでは利用できません。代替方法を検討してください。
`
    : ''
}
`,
  )
  .join('\n---\n')}

## 📦 設定ファイルの移行

- [ ] \`.env\` ファイルの確認
- [ ] \`project.config.json\` の確認
- [ ] 新設定ファイル \`.docs-cli/config.json\` の生成
  \`\`\`bash
  docs-cli compat migrate-config
  \`\`\`

- [ ] 設定値の検証
  \`\`\`bash
  docs-cli validate --config .docs-cli/config.json
  \`\`\`

## 🧪 テスト

- [ ] 新CLIコマンドの動作テスト
- [ ] ビルドテストの実行
  \`\`\`bash
  pnpm build
  \`\`\`

- [ ] E2Eテストの実行
  \`\`\`bash
  pnpm test:e2e
  \`\`\`

## 📝 ドキュメント更新

- [ ] README.md の更新
- [ ] CONTRIBUTING.md の更新
- [ ] チーム内ドキュメントの更新
- [ ] CI/CD ドキュメントの更新

## 🚀 デプロイ

- [ ] ステージング環境でのテスト
- [ ] 本番環境への移行
- [ ] ロールバック手順の確認

## ✅ 完了確認

- [ ] すべての旧スクリプトが新CLIに置き換わった
- [ ] すべてのテストが合格した
- [ ] ドキュメントが更新された
- [ ] チームメンバーが新CLIを使用できる

---

## 📅 移行スケジュール

| フェーズ | 期限 | ステータス |
|---------|------|-----------|
| 準備 | - | ⬜ 未着手 |
| スクリプト移行 | - | ⬜ 未着手 |
| 設定移行 | - | ⬜ 未着手 |
| テスト | - | ⬜ 未着手 |
| デプロイ | - | ⬜ 未着手 |
| 完了 | - | ⬜ 未着手 |

---

## 🔗 参考資料

- [互換レイヤーガイド](../../docs/new-generator-plan/guides/compat-layer.md)
- [新CLIドキュメント](../../packages/cli/README.md)
- [移行FAQ](../../docs/new-generator-plan/guides/migration-faq.md)

---

**更新履歴**:
- ${new Date().toISOString().split('T')[0]}: チェックリスト作成
`;

  if (outputPath) {
    writeFileSync(outputPath, markdown, 'utf-8');
    logger.success(`移行チェックリスト生成完了: ${outputPath}`);
  }

  return markdown;
}

/**
 * 互換性レポートを生成（HTML形式）
 *
 * @param {object} options - オプション
 * @param {string} options.projectName - プロジェクト名
 * @param {object[]} options.scripts - スクリプト一覧
 * @param {object} options.stats - 統計情報
 * @param {string} [options.outputPath] - 出力先パス
 * @returns {string} レポートのHTML
 */
export function generateCompatibilityReport(options) {
  const { projectName, scripts, stats, outputPath } = options;

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>互換性レポート - ${projectName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 2rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      opacity: 0.9;
      font-size: 1rem;
    }

    .content {
      padding: 2rem;
    }

    .section {
      margin-bottom: 2rem;
    }

    h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #667eea;
      border-bottom: 2px solid #667eea;
      padding-bottom: 0.5rem;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #667eea;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .script-card {
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      border: 1px solid #e5e7eb;
    }

    .script-name {
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #1f2937;
    }

    .command-block {
      background: #1f2937;
      color: #f3f4f6;
      padding: 1rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
      margin: 0.5rem 0;
      overflow-x: auto;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      margin: 0.25rem;
    }

    .badge-warning {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-info {
      background: #dbeafe;
      color: #1e40af;
    }

    .unsupported-options {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 4px;
    }

    .unsupported-options h4 {
      color: #dc2626;
      margin-bottom: 0.5rem;
    }

    .unsupported-options ul {
      list-style: none;
      padding-left: 1rem;
    }

    .unsupported-options li {
      padding: 0.25rem 0;
    }

    .unsupported-options li::before {
      content: "⚠️ ";
      margin-right: 0.5rem;
    }

    footer {
      background: #f9fafb;
      padding: 1.5rem 2rem;
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
      border-top: 1px solid #e5e7eb;
    }

    .progress-bar {
      background: #e5e7eb;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin: 1rem 0;
    }

    .progress-fill {
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      height: 100%;
      transition: width 0.3s ease;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📊 互換性レポート</h1>
      <div class="subtitle">プロジェクト: ${projectName}</div>
      <div class="subtitle">作成日: ${new Date().toISOString().split('T')[0]}</div>
    </header>

    <div class="content">
      <!-- 統計情報 -->
      <div class="section">
        <h2>📈 統計情報</h2>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">${stats.totalScripts || 0}</div>
            <div class="stat-label">使用スクリプト数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.totalUsage || 0}</div>
            <div class="stat-label">総使用回数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.migrationProgress || 0}%</div>
            <div class="stat-label">移行進捗</div>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${stats.migrationProgress || 0}%"></div>
        </div>
      </div>

      <!-- スクリプト一覧 -->
      <div class="section">
        <h2>🔧 スクリプト一覧</h2>
        ${scripts
          .map(
            (script) => `
        <div class="script-card">
          <div class="script-name">${script.name}</div>
          <div>
            <span class="badge badge-info">使用回数: ${script.usage || 0}</span>
            ${
              script.unsupportedOptions && script.unsupportedOptions.length > 0
                ? '<span class="badge badge-warning">未サポートオプションあり</span>'
                : ''
            }
          </div>

          <h4 style="margin-top: 1rem; margin-bottom: 0.5rem;">旧スクリプト:</h4>
          <div class="command-block">${script.oldCommand}</div>

          <h4 style="margin-top: 1rem; margin-bottom: 0.5rem;">新CLI:</h4>
          <div class="command-block">${script.newCommand}</div>

          ${
            script.unsupportedOptions && script.unsupportedOptions.length > 0
              ? `
          <div class="unsupported-options">
            <h4>⚠️ 未サポートのオプション</h4>
            <ul>
              ${script.unsupportedOptions.map((opt) => `<li><code>${opt}</code></li>`).join('')}
            </ul>
          </div>
          `
              : ''
          }
        </div>
        `,
          )
          .join('')}
      </div>

      <!-- 次のステップ -->
      <div class="section">
        <h2>🚀 次のステップ</h2>
        <ol style="padding-left: 1.5rem;">
          <li>移行チェックリストを確認</li>
          <li>新CLIコマンドの動作確認</li>
          <li>既存の呼び出し箇所を更新</li>
          <li>テストの実行</li>
          <li>ドキュメントの更新</li>
        </ol>
      </div>
    </div>

    <footer>
      <p>LibX Docs CLI - 互換レイヤーレポート</p>
      <p>詳細は <a href="../../docs/new-generator-plan/guides/compat-layer.md">互換レイヤーガイド</a> を参照してください</p>
    </footer>
  </div>
</body>
</html>`;

  if (outputPath) {
    writeFileSync(outputPath, html, 'utf-8');
    logger.success(`互換性レポート生成完了: ${outputPath}`);
  }

  return html;
}

/**
 * スクリプトマッピングテーブルを生成
 *
 * @returns {object[]} スクリプトマッピング
 */
export function getScriptMapping() {
  return [
    {
      name: 'create-project',
      oldCommand: 'node scripts/create-project.js <project-name> <display-name-en> <display-name-ja>',
      newCommand: 'docs-cli add project <project-id> --display-name-en "<name>" --display-name-ja "<name>"',
      unsupportedOptions: ['--icon', '--tags', '--skip-test'],
    },
    {
      name: 'add-language',
      oldCommand: 'node scripts/add-language.js <project-name> <lang-code>',
      newCommand: 'docs-cli add language <project-id> <lang-code>',
      unsupportedOptions: ['--auto-template', '--skip-test', '--skip-top-page', '--interactive'],
    },
    {
      name: 'create-version',
      oldCommand: 'node scripts/create-version.js <project-name> <version>',
      newCommand: 'docs-cli add version <project-id> <version-id>',
      unsupportedOptions: ['--interactive'],
    },
    {
      name: 'create-document',
      oldCommand: 'node scripts/create-document.js <project-name> <lang> <version> <category> <title>',
      newCommand: 'docs-cli add document <project-id> <version> <lang> <category> <title>',
      note: '引数の順序が変更されています: lang と version の位置が入れ替わりました',
      unsupportedOptions: ['--interactive'],
    },
  ];
}

/**
 * 移行レポートのサマリーを表示
 *
 * @param {object} report - レポート内容
 */
export function showMigrationReportSummary(report) {
  console.log('');
  console.log(chalk.cyan('📊 移行レポート サマリー'));
  console.log(chalk.gray('━'.repeat(60)));
  console.log('');

  console.log(chalk.white(`  プロジェクト: ${report.projectName}`));
  console.log(chalk.white(`  使用スクリプト数: ${report.totalScripts}`));
  console.log(chalk.white(`  移行進捗: ${report.migrationProgress}%`));
  console.log('');

  if (report.checklistPath) {
    console.log(chalk.green(`  ✅ チェックリスト: ${report.checklistPath}`));
  }

  if (report.reportPath) {
    console.log(chalk.green(`  ✅ 互換性レポート: ${report.reportPath}`));
  }

  console.log('');
  console.log(chalk.gray('━'.repeat(60)));
  console.log('');
}
