/**
 * LibX Docs CLI - メインロジック
 *
 * Commander.js を使用してCLIを構築します。
 */

import { Command } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * package.jsonからバージョンを取得
 */
function getVersion() {
  try {
    const packagePath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    return packageJson.version;
  } catch (error) {
    return '不明';
  }
}

/**
 * CLIプログラムのメイン実行関数
 */
export async function run() {
  const program = new Command();

  program
    .name('docs-cli')
    .description('LibX Docs - ドキュメントサイトジェネレーターのCLI')
    .version(getVersion(), '-v, --version', 'バージョンを表示')
    .helpOption('-h, --help', 'ヘルプを表示');

  // グローバルオプション
  program
    .option('--config <path>', '設定ファイルのパス', '.docs-cli/config.json')
    .option('--dry-run', '変更をプレビューのみ（実行しない）', false)
    .option('--verbose', '詳細ログを出力', false)
    .option('--json', 'JSON形式で出力', false)
    .option('-y, --yes', '対話をスキップ（CI用）', false);

  // ========================================
  // サブコマンド: init
  // ========================================
  program
    .command('init')
    .description('設定ファイルを初期化')
    .action(async (options) => {
      const { default: initCommand } = await import('./commands/init.js');
      await initCommand(program.opts(), options);
    });

  // ========================================
  // サブコマンドグループ: add
  // ========================================
  const addCommand = program
    .command('add')
    .description('プロジェクト、バージョン、言語、ドキュメントを追加');

  // add project
  addCommand
    .command('project <project-id>')
    .description('新規プロジェクトを追加')
    .option('--display-name-en <name>', '英語表示名')
    .option('--display-name-ja <name>', '日本語表示名')
    .option('--description-en <text>', '英語説明文')
    .option('--description-ja <text>', '日本語説明文')
    .option('--languages <codes>', 'サポート言語（カンマ区切り）', 'en,ja')
    .option('--template <name>', 'テンプレートプロジェクト', 'project-template')
    .action(async (projectId, options) => {
      const { default: addProjectCommand } = await import('./commands/add/project.js');
      await addProjectCommand(projectId, program.opts(), options);
    });

  // add version
  addCommand
    .command('version <project-id> <version-id>')
    .description('既存プロジェクトに新バージョンを追加')
    .option('--name <name>', 'バージョン表示名')
    .option('--copy-from <version>', 'コピー元バージョン')
    .option('--status <status>', 'ステータス（active, deprecated, draft）', 'active')
    .option('--date <date>', 'リリース日（ISO 8601形式）')
    .action(async (projectId, versionId, options) => {
      const { default: addVersionCommand } = await import('./commands/add/version.js');
      await addVersionCommand(projectId, versionId, program.opts(), options);
    });

  // add language
  addCommand
    .command('language <project-id> <lang-code>')
    .description('既存プロジェクトに新しい言語を追加')
    .option('--display-name <name>', '言語表示名')
    .option('--template-lang <code>', 'テンプレート言語', 'en')
    .option('--auto-template', '対話なしでテンプレート生成', false)
    .action(async (projectId, langCode, options) => {
      const { default: addLanguageCommand } = await import('./commands/add/language.js');
      await addLanguageCommand(projectId, langCode, program.opts(), options);
    });

  // add doc
  addCommand
    .command('doc <project-id> <slug>')
    .description('新しいドキュメントを追加')
    .option('--version <version>', '対象バージョン', 'latest')
    .option('--title-en <title>', '英語タイトル')
    .option('--title-ja <title>', '日本語タイトル')
    .option('--category <category>', 'カテゴリID')
    .option('--order <number>', '表示順序', parseInt)
    .action(async (projectId, slug, options) => {
      const { default: addDocCommand } = await import('./commands/add/doc.js');
      await addDocCommand(projectId, slug, program.opts(), options);
    });

  // ========================================
  // サブコマンド: validate
  // ========================================
  program
    .command('validate [registry-path]')
    .description('レジストリをバリデーション')
    .option('--strict', '厳格モード（警告もエラー扱い）', false)
    .option('--check-content', 'コンテンツファイルをチェック', false)
    .option('--check-sync-hash', 'syncHashをチェック', false)
    .option('--report <format>', 'レポート形式（text, json）', 'text')
    .action(async (registryPath, options) => {
      const { default: validateCommand } = await import('./commands/validate.js');
      await validateCommand(registryPath, program.opts(), options);
    });

  // ========================================
  // サブコマンド: list
  // ========================================
  const listCommand = program
    .command('list')
    .description('プロジェクト、ドキュメント、バージョン、言語の一覧を表示');

  // list projects
  listCommand
    .command('projects')
    .description('全プロジェクトの一覧を表示')
    .option('--status <status>', 'ステータスでフィルタ')
    .action(async (options) => {
      const { default: listProjectsCommand } = await import('./commands/list.js');
      await listProjectsCommand('projects', program.opts(), options);
    });

  // list docs
  listCommand
    .command('docs <project-id>')
    .description('ドキュメント一覧を表示')
    .option('--version <version>', 'バージョンでフィルタ')
    .option('--lang <lang>', '言語でフィルタ')
    .option('--status <status>', 'ステータスでフィルタ')
    .action(async (projectId, options) => {
      const { default: listDocsCommand } = await import('./commands/list.js');
      await listDocsCommand('docs', program.opts(), { projectId, ...options });
    });

  // list versions
  listCommand
    .command('versions <project-id>')
    .description('バージョン一覧を表示')
    .option('--status <status>', 'ステータスでフィルタ')
    .action(async (projectId, options) => {
      const { default: listVersionsCommand } = await import('./commands/list.js');
      await listVersionsCommand('versions', program.opts(), { projectId, ...options });
    });

  // list languages
  listCommand
    .command('languages <project-id>')
    .description('言語一覧を表示')
    .option('--status <status>', 'ステータスでフィルタ')
    .action(async (projectId, options) => {
      const { default: listLanguagesCommand } = await import('./commands/list.js');
      await listLanguagesCommand('languages', program.opts(), { projectId, ...options });
    });

  // ========================================
  // コマンドのパース
  // ========================================
  await program.parseAsync(process.argv);
}

/**
 * エクスポート（テスト用）
 */
export { run as default };
