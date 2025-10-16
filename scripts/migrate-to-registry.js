#!/usr/bin/env node

// Migration Script: project.config.json to registry/docs.json
// Converts apps/*/src/config/project.config.json to registry/docs.json format

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';
import matter from 'gray-matter';
import { validateRegistry } from '../packages/validator/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// カラー出力用のヘルパー
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function logInfo(message) {
  log(`[INFO] ${message}`, colors.cyan);
}

function logSuccess(message) {
  log(`[SUCCESS] ${message}`, colors.green);
}

function logWarn(message) {
  log(`[WARN] ${message}`, colors.yellow);
}

function logError(message) {
  log(`[ERROR] ${message}`, colors.red);
}

// ヘルプメッセージ
function showHelp() {
  console.log(`
${colors.bright}マイグレーションスクリプト: project.config.json → registry/docs.json${colors.reset}

${colors.bright}使用方法:${colors.reset}
  node scripts/migrate-to-registry.js [options]

${colors.bright}オプション:${colors.reset}
  --project=<name>   特定プロジェクトのみ移行（例: --project=sample-docs）
  --dry-run          実際の変換を行わず、プレビューのみ表示
  --validate         変換後にバリデーションを実行
  --output=<path>    出力先（デフォルト: registry/docs.json）
  --force            既存ファイルを上書き
  --help, -h         このヘルプメッセージを表示

${colors.bright}使用例:${colors.reset}
  # dry-runモードでプレビュー
  node scripts/migrate-to-registry.js --dry-run

  # 特定プロジェクトのみ移行
  node scripts/migrate-to-registry.js --project=sample-docs --output=registry/test.json

  # 全プロジェクトを移行してバリデーション
  node scripts/migrate-to-registry.js --validate --output=registry/docs.json

  # 既存ファイルを強制上書き
  node scripts/migrate-to-registry.js --force
`);
}

// CLI引数の解析
function parseArgs(args) {
  const options = {
    project: null,
    dryRun: false,
    validate: false,
    output: 'registry/docs.json',
    force: false,
    help: false,
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--validate') {
      options.validate = true;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg.startsWith('--project=')) {
      options.project = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    }
  }

  return options;
}

// プロジェクト検出
function detectProjects(projectFilter = null) {
  logInfo('プロジェクトを検出中...');

  const configFiles = globSync('apps/*/src/config/project.config.json', {
    cwd: projectRoot,
    absolute: true,
  });

  const projects = [];

  for (const configPath of configFiles) {
    const projectName = path.basename(path.dirname(path.dirname(path.dirname(configPath))));

    // project-template と top-page は除外
    if (projectName === 'project-template' || projectName === 'top-page') {
      continue;
    }

    // プロジェクトフィルタが指定されている場合
    if (projectFilter && projectName !== projectFilter) {
      continue;
    }

    try {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(configContent);

      projects.push({
        name: projectName,
        configPath,
        config,
        contentDir: path.join(path.dirname(path.dirname(configPath)), 'content', 'docs'),
      });
    } catch (error) {
      logWarn(`${projectName} の設定ファイルの読み込みに失敗しました: ${error.message}`);
    }
  }

  logInfo(`検出されたプロジェクト: ${projects.length}件`);
  return projects;
}

// 1. プロジェクト基本情報のマッピング
function mapProjectBasic(projectName, config) {
  const projectId = config.basic?.baseUrl?.replace('/docs/', '') || projectName;
  const displayName = {};
  const description = {};

  // 全言語の翻訳を集約
  for (const [lang, translation] of Object.entries(config.translations || {})) {
    if (translation.displayName) {
      displayName[lang] = translation.displayName;
    }
    if (translation.displayDescription) {
      description[lang] = translation.displayDescription;
    }
  }

  return {
    id: projectId,
    displayName,
    description,
  };
}

// 2. 言語設定のマッピング
function mapLanguages(config) {
  const languages = [];
  const supportedLangs = config.basic?.supportedLangs || [];
  const defaultLang = config.basic?.defaultLang || 'en';
  const languageNames = config.languageNames || {};

  for (const langCode of supportedLangs) {
    const language = {
      code: langCode,
      displayName: languageNames[langCode] || langCode,
      status: 'active',
    };

    if (langCode === defaultLang) {
      language.default = true;
    } else {
      language.fallback = defaultLang;
    }

    languages.push(language);
  }

  return languages;
}

// 3. バージョン設定のマッピング
function mapVersions(config) {
  const versions = [];
  const versionList = config.versioning?.versions || [];

  for (const version of versionList) {
    const mappedVersion = {
      id: version.id,
      name: version.name,
      isLatest: version.isLatest || false,
      status: version.isLatest ? 'active' : 'deprecated',
    };

    if (version.date) {
      mappedVersion.date = version.date;
    }

    versions.push(mappedVersion);
  }

  return versions;
}

// 4. カテゴリ設定のマッピング
function mapCategories(config) {
  const categories = [];
  const defaultLang = config.basic?.defaultLang || 'en';
  const defaultCategories = config.translations?.[defaultLang]?.categories || {};

  let order = 1;
  for (const [categoryId, defaultTitle] of Object.entries(defaultCategories)) {
    const titles = {};

    // 全言語の翻訳を集約
    for (const [lang, translation] of Object.entries(config.translations || {})) {
      if (translation.categories?.[categoryId]) {
        titles[lang] = translation.categories[categoryId];
      }
    }

    categories.push({
      id: categoryId,
      order: order++,
      titles,
      docs: [], // 後でコンテンツスキャンで追加
    });
  }

  return categories;
}

// 5. ライセンス情報のマッピング
function mapLicenses(config) {
  const licenses = [];
  const sources = config.licensing?.sources || [];

  for (const source of sources) {
    const license = {
      id: source.id,
      name: source.license,
    };

    if (source.licenseUrl) {
      license.url = source.licenseUrl;
    }

    // attributionは文字列形式で生成
    const attributionParts = [];
    if (source.name) {
      attributionParts.push(source.name);
    }
    if (source.author) {
      attributionParts.push(`by ${source.author}`);
    }
    if (source.sourceUrl) {
      attributionParts.push(`(${source.sourceUrl})`);
    }

    if (attributionParts.length > 0) {
      license.attribution = attributionParts.join(' ');
    }

    licenses.push(license);
  }

  return licenses;
}

// コンテンツディレクトリのスキャン
function scanContent(contentDir, config) {
  if (!fs.existsSync(contentDir)) {
    logWarn(`コンテンツディレクトリが見つかりません: ${contentDir}`);
    return { documents: [], categoryDocs: {} };
  }

  const documents = [];
  const categoryDocs = {}; // カテゴリIDごとのドキュメントリスト
  const supportedLangs = config.basic?.supportedLangs || [];
  const defaultLang = config.basic?.defaultLang || 'en';
  const defaultLicense = config.licensing?.sources?.[0]?.id || null;

  // ドキュメントを収集するためのマップ（ID別）
  const docMap = new Map();

  // MDXファイルをスキャン
  const mdxFiles = globSync('**/*.mdx', {
    cwd: contentDir,
    absolute: false,
  });

  for (const mdxPath of mdxFiles) {
    const parts = mdxPath.split('/');
    if (parts.length < 3) continue; // v1/en/file.mdx の形式が最小

    const version = parts[0]; // 例: v1, v2
    const lang = parts[1]; // 例: en, ja
    const categoryWithPrefix = parts[2]; // 例: 01-guide
    const fileName = parts[parts.length - 1]; // 例: 01-getting-started.mdx

    // カテゴリIDを抽出（プレフィックスを削除）
    const categoryId = categoryWithPrefix.replace(/^\d+-/, '');

    // ドキュメントIDを抽出（プレフィックスと拡張子を削除）
    const docId = fileName.replace(/^\d+-/, '').replace('.mdx', '');

    // フロントマターを読み取る
    const fullPath = path.join(contentDir, mdxPath);
    let frontmatter = {};
    try {
      const fileContent = fs.readFileSync(fullPath, 'utf-8');
      const parsed = matter(fileContent);
      frontmatter = parsed.data;
    } catch (error) {
      logWarn(`フロントマターの解析に失敗: ${mdxPath} - ${error.message}`);
    }

    // ドキュメントエントリを取得または作成
    if (!docMap.has(docId)) {
      docMap.set(docId, {
        id: docId,
        slug: `${categoryId}/${docId}`,
        title: {},
        summary: {},
        versions: [],
        status: 'published',
        visibility: 'public',
        keywords: frontmatter.keywords || [],
        tags: frontmatter.tags || [],
        content: {},
      });

      if (defaultLicense) {
        docMap.get(docId).license = defaultLicense;
      }

      // カテゴリのドキュメントリストに追加
      if (!categoryDocs[categoryId]) {
        categoryDocs[categoryId] = [];
      }
      if (!categoryDocs[categoryId].includes(docId)) {
        categoryDocs[categoryId].push(docId);
      }
    }

    const doc = docMap.get(docId);

    // バージョンを追加（重複を避ける）
    if (!doc.versions.includes(version)) {
      doc.versions.push(version);
    }

    // タイトルと説明を追加
    if (frontmatter.title) {
      doc.title[lang] = frontmatter.title;
    }
    if (frontmatter.description) {
      doc.summary[lang] = frontmatter.description;
    }

    // コンテンツパスを追加
    doc.content[lang] = {
      path: `content/${docId}/${lang}.mdx`,
      status: 'published',
    };

    // 最終更新日時があれば追加
    if (frontmatter.lastUpdated) {
      doc.content[lang].lastUpdated = frontmatter.lastUpdated;
    }
  }

  return {
    documents: Array.from(docMap.values()),
    categoryDocs,
  };
}

// プロジェクトを変換
function convertProject(project) {
  const { name, config, contentDir } = project;

  logInfo(`${name} をマイグレーション中...`);

  // 1. 基本情報
  const basic = mapProjectBasic(name, config);
  log(`  ├─ 基本情報を変換`, colors.gray);

  // 2. 言語設定
  const languages = mapLanguages(config);
  log(`  ├─ 言語設定を変換 (${languages.length}言語)`, colors.gray);

  // 3. バージョン設定
  const versions = mapVersions(config);
  log(`  ├─ バージョン設定を変換 (${versions.length}バージョン)`, colors.gray);

  // 4. カテゴリ設定
  const categories = mapCategories(config);
  log(`  ├─ カテゴリを変換 (${categories.length}カテゴリ)`, colors.gray);

  // 5. ライセンス情報
  const licenses = mapLicenses(config);
  log(`  ├─ ライセンス情報を変換 (${licenses.length}件)`, colors.gray);

  // 6. コンテンツスキャン
  const { documents, categoryDocs } = scanContent(contentDir, config);
  log(`  └─ ドキュメントをスキャン (${documents.length}ドキュメント)`, colors.gray);

  // カテゴリにドキュメントを割り当て
  for (const category of categories) {
    if (categoryDocs[category.id]) {
      category.docs = categoryDocs[category.id];
    }
  }

  return {
    ...basic,
    languages,
    versions,
    categories,
    documents,
    licenses,
    visibility: 'public',
    options: {
      search: true,
    },
  };
}

// レジストリを生成
function generateRegistry(projects) {
  const registry = {
    $schemaVersion: '1.0.0',
    metadata: {
      createdAt: new Date().toISOString(),
      createdBy: 'migrate-to-registry.js',
    },
    projects: projects.map(convertProject),
    settings: {
      defaultLocale: 'en',
      defaultVersion: 'v1',
      build: {
        search: 'pagefind',
        sitemap: true,
      },
      deploy: {
        provider: 'cloudflare-pages',
        basePath: '/',
      },
      backup: {
        enabled: true,
        retentionDays: 14,
      },
    },
  };

  return registry;
}

// メイン処理
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  // ヘルプ表示
  if (options.help) {
    showHelp();
    process.exit(0);
  }

  log(`\n${colors.bright}=== マイグレーションスクリプト ===${colors.reset}\n`);

  // プロジェクト検出
  const projects = detectProjects(options.project);

  if (projects.length === 0) {
    logError('変換対象のプロジェクトが見つかりませんでした。');
    process.exit(1);
  }

  // レジストリ生成
  logInfo('レジストリを生成中...');
  const registry = generateRegistry(projects);
  logSuccess('レジストリ生成完了');

  // dry-runモード
  if (options.dryRun) {
    log(`\n${colors.bright}=== プレビュー (--dry-run) ===${colors.reset}\n`);
    console.log(JSON.stringify(registry, null, 2));
    process.exit(0);
  }

  // バリデーション
  if (options.validate) {
    logInfo('バリデーションを実行中...');
    const errors = validateRegistry(registry, {
      projectRoot,
      strict: false,
      checkContent: false, // コンテンツファイルはまだ移動していないのでスキップ
      checkSyncHash: false,
    });

    if (errors.hasErrors()) {
      logError('バリデーションエラーが発生しました:');
      console.log(errors.toString());
      process.exit(1);
    }

    if (errors.warnings && errors.warnings.length > 0) {
      logWarn('バリデーション警告がありました:');
      console.log(errors.toString());
    } else {
      logSuccess('バリデーション成功');
    }
  }

  // ファイル出力
  const outputPath = path.resolve(projectRoot, options.output);

  // 既存ファイルチェック
  if (fs.existsSync(outputPath) && !options.force) {
    logError(`出力先ファイルが既に存在します: ${outputPath}`);
    logInfo('上書きする場合は --force オプションを使用してください。');
    process.exit(1);
  }

  // ディレクトリが存在しない場合は作成
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // ファイルに書き込み
  fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2), 'utf-8');
  logSuccess(`レジストリを出力しました: ${outputPath}`);

  log(`\n${colors.bright}=== マイグレーション完了 ===${colors.reset}\n`);
}

// エラーハンドリング
main().catch((error) => {
  logError(`予期しないエラーが発生しました: ${error.message}`);
  console.error(error);
  process.exit(1);
});
