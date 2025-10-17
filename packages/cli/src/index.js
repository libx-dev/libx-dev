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
    .option('--no-copy', '前バージョンからコンテンツをコピーしない', false)
    .option('--set-latest', '最新バージョンとして設定', true)
    .option('--no-set-latest', '最新バージョンとして設定しない')
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
    .option('--summary <text>', 'ドキュメントの概要')
    .option('--category <category>', 'カテゴリID')
    .option('--keywords <keywords>', 'キーワード（カンマ区切り）')
    .option('--tags <tags>', 'タグ（カンマ区切り）')
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
  // サブコマンドグループ: update
  // ========================================
  const updateCommand = program
    .command('update')
    .description('プロジェクト、バージョン、言語、ドキュメントを更新');

  // update project
  updateCommand
    .command('project <project-id>')
    .description('プロジェクトメタデータを更新')
    .option('--display-name-en <name>', '英語表示名')
    .option('--display-name-ja <name>', '日本語表示名')
    .option('--description-en <text>', '英語説明文')
    .option('--description-ja <text>', '日本語説明文')
    .option('--status <status>', 'ステータス（active, archived）')
    .action(async (projectId, options) => {
      const { default: updateProjectCommand } = await import('./commands/update/project.js');
      await updateProjectCommand(projectId, program.opts(), options);
    });

  // update version
  updateCommand
    .command('version <project-id> <version-id>')
    .description('バージョンメタデータを更新')
    .option('--name <name>', 'バージョン表示名')
    .option('--status <status>', 'ステータス（active, deprecated, draft）')
    .option('--set-latest', '最新バージョンとして設定')
    .option('--no-set-latest', '最新バージョンから除外')
    .action(async (projectId, versionId, options) => {
      const { default: updateVersionCommand } = await import('./commands/update/version.js');
      await updateVersionCommand(projectId, versionId, program.opts(), options);
    });

  // update language
  updateCommand
    .command('language <project-id> <lang-code>')
    .description('言語設定を更新')
    .option('--display-name <name>', '言語表示名')
    .option('--status <status>', 'ステータス（active, inactive）')
    .option('--set-default', 'デフォルト言語として設定')
    .option('--fallback <code>', 'フォールバック言語を設定')
    .action(async (projectId, langCode, options) => {
      const { default: updateLanguageCommand } = await import('./commands/update/language.js');
      await updateLanguageCommand(projectId, langCode, program.opts(), options);
    });

  // update doc
  updateCommand
    .command('doc <project-id> <doc-id>')
    .description('ドキュメントメタデータを更新')
    .option('--title-en <title>', '英語タイトル')
    .option('--title-ja <title>', '日本語タイトル')
    .option('--summary <text>', 'ドキュメントの概要')
    .option('--status <status>', 'ステータス（draft, published, archived）')
    .option('--visibility <visibility>', '可視性（public, private）')
    .option('--keywords <keywords>', 'キーワード（カンマ区切り）')
    .option('--tags <tags>', 'タグ（カンマ区切り）')
    .action(async (projectId, docId, options) => {
      const { default: updateDocCommand } = await import('./commands/update/doc.js');
      await updateDocCommand(projectId, docId, program.opts(), options);
    });

  // ========================================
  // サブコマンドグループ: remove
  // ========================================
  const removeCommand = program
    .command('remove')
    .description('プロジェクト、バージョン、言語、ドキュメントを削除');

  // remove project
  removeCommand
    .command('project <project-id>')
    .description('プロジェクトを削除（確認プロンプト付き）')
    .option('--force', '確認なしで削除', false)
    .action(async (projectId, options) => {
      const { default: removeProjectCommand } = await import('./commands/remove/project.js');
      await removeProjectCommand(projectId, program.opts(), options);
    });

  // remove version
  removeCommand
    .command('version <project-id> <version-id>')
    .description('バージョンを削除（確認プロンプト付き）')
    .option('--force', '確認なしで削除', false)
    .option('--delete-content', 'コンテンツファイルも削除', false)
    .action(async (projectId, versionId, options) => {
      const { default: removeVersionCommand } = await import('./commands/remove/version.js');
      await removeVersionCommand(projectId, versionId, program.opts(), options);
    });

  // remove language
  removeCommand
    .command('language <project-id> <lang-code>')
    .description('言語を削除（確認プロンプト付き）')
    .option('--force', '確認なしで削除', false)
    .option('--delete-content', 'コンテンツファイルも削除', false)
    .action(async (projectId, langCode, options) => {
      const { default: removeLanguageCommand } = await import('./commands/remove/language.js');
      await removeLanguageCommand(projectId, langCode, program.opts(), options);
    });

  // remove doc
  removeCommand
    .command('doc <project-id> <doc-id>')
    .description('ドキュメントを削除（確認プロンプト付き）')
    .option('--force', '確認なしで削除', false)
    .option('--delete-content', 'コンテンツファイルも削除', false)
    .action(async (projectId, docId, options) => {
      const { default: removeDocCommand } = await import('./commands/remove/doc.js');
      await removeDocCommand(projectId, docId, program.opts(), options);
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
