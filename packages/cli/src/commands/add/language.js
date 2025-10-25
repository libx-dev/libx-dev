/**
 * add languageコマンド実装
 *
 * 既存プロジェクトに新しい言語を追加
 */

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { createLogger, LOG_LEVELS } from '../../utils/logger.js';
import { getConfigManager } from '../../utils/config.js';
import { createRegistryManager } from '../../utils/registry.js';
import { createBackupManager } from '../../utils/backup.js';

/**
 * サポート済み言語のマップ
 */
const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'ja': '日本語',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
  'es': 'Español',
  'pt-BR': 'Português (Brasil)',
  'ko': '한국어',
  'de': 'Deutsch',
  'fr': 'Français',
  'ru': 'Русский',
  'ar': 'العربية',
  'id': 'Bahasa Indonesia',
  'tr': 'Türkçe',
  'hi': 'हिन्दी',
  'vi': 'Tiếng Việt'
};

/**
 * 言語コードのバリデーション
 */
function validateLanguageCode(langCode) {
  if (!SUPPORTED_LANGUAGES[langCode]) {
    return `言語コード "${langCode}" はサポートされていません。サポート言語: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`;
  }
  return true;
}

/**
 * テンプレート言語からコンテンツをコピー
 */
async function copyFromTemplateLanguage(
  projectId,
  newLangCode,
  templateLangCode,
  versions,
  projectRoot,
  logger
) {
  logger.progress(`テンプレート言語 ${templateLangCode} からコンテンツをコピー中...`);

  const projectPath = path.join(projectRoot, 'apps', projectId);
  let copiedCount = 0;

  for (const version of versions) {
    const templateDir = path.join(projectPath, 'src', 'content', 'docs', version.id, templateLangCode);
    const newDir = path.join(projectPath, 'src', 'content', 'docs', version.id, newLangCode);

    if (fs.existsSync(templateDir)) {
      try {
        fs.mkdirSync(newDir, { recursive: true });
        copyDirectoryWithTranslationMarkers(templateDir, newDir, newLangCode);
        copiedCount++;
        logger.debug(`  ✓ ${version.id}: コピー完了`);
      } catch (error) {
        logger.warn(`  ⚠ ${version.id}: コピー中にエラーが発生しました - ${error.message}`);
      }
    } else {
      fs.mkdirSync(newDir, { recursive: true });
      logger.debug(`  ✓ ${version.id}: 空のディレクトリを作成`);
    }
  }

  logger.progressDone(`${copiedCount}/${versions.length} バージョンのコンテンツをコピーしました`);
}

/**
 * ディレクトリを翻訳マーカー付きでコピー
 */
function copyDirectoryWithTranslationMarkers(src, dest, langCode) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirectoryWithTranslationMarkers(srcPath, destPath, langCode);
    } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
      // MDXファイルに翻訳マーカーを追加
      const content = fs.readFileSync(srcPath, 'utf-8');
      const markedContent = addTranslationMarkers(content, langCode);
      fs.writeFileSync(destPath, markedContent, 'utf-8');
    } else {
      // その他のファイルはそのままコピー
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * 翻訳マーカーを追加
 */
function addTranslationMarkers(content, langCode) {
  const lines = content.split('\n');
  let inFrontmatter = false;
  let frontmatterEnd = -1;

  // フロントマター終了位置を検索
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      if (inFrontmatter) {
        frontmatterEnd = i;
        break;
      }
      inFrontmatter = true;
    }
  }

  // フロントマター直後に翻訳マーカーを挿入
  if (frontmatterEnd >= 0) {
    const marker = `\n<!-- TODO: ${langCode.toUpperCase()} - この文書は翻訳が必要です -->\n`;
    lines.splice(frontmatterEnd + 1, 0, marker);
  }

  return lines.join('\n');
}

/**
 * 空のディレクトリ構造を作成
 */
function createEmptyDirectories(projectId, langCode, versions, projectRoot, logger) {
  logger.progress(`言語 ${langCode} のディレクトリ構造を作成中...`);

  const projectPath = path.join(projectRoot, 'apps', projectId);

  for (const version of versions) {
    const contentDir = path.join(projectPath, 'src', 'content', 'docs', version.id, langCode);
    fs.mkdirSync(contentDir, { recursive: true });
    logger.debug(`  ✓ ${version.id}: ${contentDir}`);
  }

  logger.progressDone(`${versions.length} バージョンのディレクトリを作成しました`);
}

/**
 * 言語情報を対話式で取得
 */
async function getLanguageInfo(projectId, langCode, cmdOpts, project, logger) {
  const nonInteractive = cmdOpts.yes || cmdOpts.autoTemplate || process.env.DOCS_CLI_NON_INTERACTIVE === 'true';

  // 言語表示名
  let displayName = cmdOpts.displayName;
  if (!displayName) {
    if (nonInteractive) {
      displayName = SUPPORTED_LANGUAGES[langCode];
    } else {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'displayName',
          message: '言語の表示名を入力してください:',
          default: SUPPORTED_LANGUAGES[langCode],
        },
      ]);
      displayName = answers.displayName;
    }
  }

  // テンプレート言語からのコピー
  let copyFromTemplate = cmdOpts.templateLang !== undefined;
  let templateLangCode = cmdOpts.templateLang || 'en';

  if (!copyFromTemplate && !nonInteractive) {
    const availableLangs = project.languages.map(l => l.code);
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'copyFromTemplate',
        message: '既存言語からコンテンツをコピーしますか?',
        default: true,
      },
    ]);

    copyFromTemplate = answers.copyFromTemplate;

    if (copyFromTemplate && availableLangs.length > 0) {
      const langAnswers = await inquirer.prompt([
        {
          type: 'list',
          name: 'templateLangCode',
          message: 'コピー元の言語を選択してください:',
          choices: availableLangs.map(code => ({
            name: `${code} (${SUPPORTED_LANGUAGES[code] || code})`,
            value: code,
          })),
          default: 'en',
        },
      ]);
      templateLangCode = langAnswers.templateLangCode;
    }
  }

  // デフォルト言語として設定するか
  let setAsDefault = cmdOpts.setDefault || false;
  if (!nonInteractive && project.languages.length === 0) {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'setAsDefault',
        message: 'この言語をデフォルト言語として設定しますか?',
        default: true,
      },
    ]);
    setAsDefault = answers.setAsDefault;
  }

  // フォールバック言語
  let fallbackLang = null;
  if (!setAsDefault && project.languages.length > 0) {
    const defaultLang = project.languages.find(l => l.default);
    fallbackLang = defaultLang?.code || project.languages[0].code;
  }

  return {
    displayName,
    copyFromTemplate,
    templateLangCode,
    setAsDefault,
    fallbackLang,
  };
}

/**
 * add languageコマンドのメイン処理
 */
export default async function addLanguageCommand(projectId, langCode, globalOpts, cmdOpts) {
  // ロガーの初期化
  const logger = globalOpts.json
    ? createLogger({ jsonMode: true })
    : createLogger({ verbose: globalOpts.verbose });

  if (globalOpts.verbose) {
    logger.setLevel(LOG_LEVELS.DEBUG);
  }

  try {
    logger.info(`言語追加: ${projectId} / ${langCode}`);
    logger.separator();

    // 言語コードのバリデーション
    const validationResult = validateLanguageCode(langCode);
    if (validationResult !== true) {
      logger.error(validationResult);
      logger.info('\nサポート済み言語:');
      Object.entries(SUPPORTED_LANGUAGES).forEach(([code, name]) => {
        logger.info(`  ${code.padEnd(10)} ${name}`);
      });
      process.exit(1);
      return; // テスト環境でprocess.exitがモックされている場合のため
    }

    // 設定とマネージャーの初期化
    const configManager = getConfigManager();
    const registryManager = createRegistryManager({
      registryPath: configManager.getRegistryPath(),
      projectRoot: configManager.projectRoot,
    });

    registryManager.load();

    // プロジェクト存在チェック
    const project = registryManager.findProject(projectId);
    if (!project) {
      logger.error(`プロジェクト "${projectId}" が見つかりません`);
      logger.info('利用可能なプロジェクト一覧を確認するには: pnpm docs-cli list projects');
      process.exit(1);
      return; // テスト環境でprocess.exitがモックされている場合のため
    }

    // 言語重複チェック
    if (project.languages.find(l => l.code === langCode)) {
      logger.error(`言語 "${langCode}" は既に存在します`);
      process.exit(1);
      return; // テスト環境でprocess.exitがモックされている場合のため
    }

    // 言語情報を取得
    const langInfo = await getLanguageInfo(projectId, langCode, cmdOpts, project, logger);

    // dry-runチェック
    if (globalOpts.dryRun) {
      logger.info('dry-run モード: 以下の変更が実行されます\n');
      logger.info('言語情報:');
      logger.info(`  コード: ${langCode}`);
      logger.info(`  表示名: ${langInfo.displayName}`);
      logger.info(`  デフォルト言語: ${langInfo.setAsDefault ? 'はい' : 'いいえ'}`);
      if (langInfo.copyFromTemplate) {
        logger.info(`  コピー元: ${langInfo.templateLangCode}`);
      }
      if (langInfo.fallbackLang) {
        logger.info(`  フォールバック言語: ${langInfo.fallbackLang}`);
      }
      process.exit(0);
      return; // テスト環境でprocess.exitがモックされている場合のため
    }

    // バックアップマネージャーの初期化
    const backupManager = createBackupManager({
      backupDir: configManager.get('backupDir'),
      projectRoot: configManager.projectRoot,
    });

    // レジストリファイルをバックアップ
    backupManager.backupFile(configManager.getRegistryPath());

    // デフォルト言語として設定する場合、既存のデフォルトを更新
    if (langInfo.setAsDefault) {
      project.languages.forEach(l => {
        if (l.default) {
          l.default = false;
          logger.debug(`既存のデフォルト言語 ${l.code} の default を false に更新`);
        }
      });
    }

    // 新しい言語エントリを作成
    const language = {
      code: langCode,
      displayName: langInfo.displayName,
      status: 'active',
      default: langInfo.setAsDefault,
      ...(langInfo.fallbackLang && { fallback: langInfo.fallbackLang }),
    };

    // レジストリに追加
    registryManager.addLanguage(projectId, language);
    logger.success(`レジストリに追加: ${langCode}`);

    // ディレクトリ構造の作成
    const versions = project.versions;

    if (langInfo.copyFromTemplate && langInfo.templateLangCode) {
      // テンプレート言語の存在確認
      if (!project.languages.find(l => l.code === langInfo.templateLangCode)) {
        logger.warn(`テンプレート言語 "${langInfo.templateLangCode}" が見つかりません。空のディレクトリを作成します。`);
        createEmptyDirectories(projectId, langCode, versions, configManager.projectRoot, logger);
      } else {
        await copyFromTemplateLanguage(
          projectId,
          langCode,
          langInfo.templateLangCode,
          versions,
          configManager.projectRoot,
          logger
        );
      }

      backupManager.recordCreated(
        path.join(configManager.projectRoot, 'apps', projectId, 'src', 'content', 'docs')
      );
    } else {
      createEmptyDirectories(projectId, langCode, versions, configManager.projectRoot, logger);
      backupManager.recordCreated(
        path.join(configManager.projectRoot, 'apps', projectId, 'src', 'content', 'docs')
      );
    }

    // レジストリを保存
    registryManager.save();
    logger.success('レジストリ保存完了');

    logger.separator();
    logger.success(`✨ 言語 "${langCode}" の追加が完了しました!`);
    logger.info(`\n次のステップ:`);
    logger.info(`  1. pnpm docs-cli list languages ${projectId} - 言語一覧を確認`);
    logger.info(`  2. pnpm docs-cli add doc ${projectId} <slug> - ドキュメントを追加`);
    logger.info(`  3. pnpm docs-cli validate - レジストリの検証`);

    if (langInfo.copyFromTemplate) {
      logger.info(`\n⚠️  注意: コピーしたファイルには翻訳マーカーが付いています。`);
      logger.info(`  "TODO: ${langCode.toUpperCase()}" を検索して翻訳を進めてください。`);
    }

  } catch (error) {
    logger.error(`言語追加に失敗しました: ${error.message}`);

    if (globalOpts.verbose) {
      logger.error(error.stack);
    }

    process.exit(1);
    return; // テスト環境でprocess.exitがモックされている場合のため
  }
}
