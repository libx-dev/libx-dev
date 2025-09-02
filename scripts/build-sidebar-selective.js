#!/usr/bin/env node

/**
 * 選択的サイドバー生成スクリプト
 * 
 * このスクリプトは、指定されたプロジェクトのサイドバーのみを生成します。
 * 既存のサイドバーファイルを保持し、指定されたプロジェクトの分のみを更新します。
 * 
 * 使用方法:
 * node scripts/build-sidebar-selective.js --projects=sample-docs,test-verification
 * node scripts/build-sidebar-selective.js --projects=sample-docs
 * 
 * オプション:
 * --projects: サイドバー生成対象プロジェクトをカンマ区切りで指定
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { saveCompressedJson, parseMarkdownFile } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 基本設定
const config = {
  appsDir: path.join(rootDir, 'apps'),
  excludedProjects: ['top-page', 'project-template'], // 除外するプロジェクト名
};

/**
 * コマンドライン引数からプロジェクト一覧を解析
 */
function parseProjectsFromArgs(args) {
  const projectsArg = args.find(arg => arg.startsWith('--projects='));
  if (!projectsArg) {
    console.error('エラー: --projects パラメータが指定されていません。');
    console.error('使用方法: node build-sidebar-selective.js --projects=project1,project2');
    process.exit(1);
  }

  const projectsStr = projectsArg.split('=')[1];
  if (!projectsStr) {
    console.error('エラー: --projects パラメータに値が指定されていません。');
    process.exit(1);
  }

  return projectsStr.split(',').map(p => p.trim()).filter(p => p);
}

/**
 * appsディレクトリから利用可能なプロジェクト一覧を取得
 */
async function getAvailableProjects() {
  const projects = [];
  
  try {
    const entries = await fs.readdir(config.appsDir, { withFileTypes: true });
    const appDirs = entries.filter(entry => entry.isDirectory());
    
    for (const dir of appDirs) {
      const appName = dir.name;
      // 除外プロジェクトをスキップ
      if (config.excludedProjects.includes(appName)) {
        continue;
      }
      
      const projectPath = path.join(config.appsDir, appName);
      const contentPath = path.join(projectPath, 'src', 'content', 'docs');
      
      try {
        await fs.access(contentPath);
        projects.push(appName);
      } catch (error) {
        // ドキュメントディレクトリがない場合はスキップ
        continue;
      }
    }
  } catch (error) {
    console.error('プロジェクト検出中にエラーが発生しました:', error);
  }
  
  return projects;
}

/**
 * 指定されたプロジェクトの存在を検証
 */
async function validateProjects(requestedProjects, availableProjects) {
  const invalidProjects = requestedProjects.filter(p => !availableProjects.includes(p));
  
  if (invalidProjects.length > 0) {
    console.error('エラー: 以下のプロジェクトが見つからないか、ドキュメントサイトではありません:');
    invalidProjects.forEach(p => console.error(`  - ${p}`));
    console.error('\n利用可能なドキュメントプロジェクト:');
    availableProjects.forEach(p => console.error(`  - ${p}`));
    process.exit(1);
  }
}

/**
 * 指定されたプロジェクトのプロジェクト情報を取得
 */
async function getProjectInfo(projectName) {
  const projectPath = path.join(config.appsDir, projectName);
  const contentPath = path.join(projectPath, 'src', 'content', 'docs');
  
  // バージョンディレクトリを検出
  const versions = await detectVersions(contentPath);
  
  if (versions.length === 0) {
    console.warn(`${projectName} にバージョンディレクトリが見つかりませんでした。`);
    return null;
  }
  
  // 各バージョンディレクトリ内の言語を検出
  const languages = await detectLanguages(contentPath, versions[0]);
  
  if (languages.length === 0) {
    console.warn(`${projectName} に言語ディレクトリが見つかりませんでした。`);
    return null;
  }
  
  // 出力ディレクトリを設定
  const outputDir = path.join(projectPath, 'public', 'sidebar');
  
  return {
    name: projectName,
    path: projectPath,
    contentPath,
    outputDir,
    languages,
    versions
  };
}

/**
 * ドキュメントディレクトリ内のバージョンディレクトリを検出する
 */
async function detectVersions(contentPath) {
  try {
    const entries = await fs.readdir(contentPath, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  } catch (error) {
    console.error('バージョンディレクトリの検出中にエラーが発生しました:', error);
    return [];
  }
}

/**
 * バージョンディレクトリ内の言語ディレクトリを検出する
 */
async function detectLanguages(contentPath, version) {
  try {
    const versionPath = path.join(contentPath, version);
    const entries = await fs.readdir(versionPath, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  } catch (error) {
    console.error('言語ディレクトリの検出中にエラーが発生しました:', error);
    return [];
  }
}

/**
 * ディレクトリ名から順序番号を抽出します
 */
function extractOrderFromDirectoryName(dirname) {
  const match = dirname.match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : 999;
}

/**
 * 指定された言語とバージョンのサイドバーを生成する
 */
async function generateSidebarForVersion(project, lang, version) {
  // プロジェクトの翻訳設定を取得
  const categoryTranslations = await getProjectCategoryTranslations(project);
  
  // ドキュメントファイルを検索
  const pattern = `${version}/${lang}/**/*.{md,mdx}`;
  const files = await glob(pattern, { cwd: project.contentPath });
  
  // ドキュメント情報を収集
  const docs = [];
  
  for (const file of files) {
    try {
      const filePath = path.join(project.contentPath, file);
      const { frontmatter: data } = await parseMarkdownFile(filePath);
      
      // スラグを生成
      const slug = file.replace(/\.[^.]+$/, '');
      
      docs.push({
        slug,
        data
      });
    } catch (error) {
      console.warn(`ファイルの処理中にエラーが発生しました: ${file}`, error);
    }
  }
  
  // カテゴリごとにドキュメントを整理
  const categories = {};
  
  docs.forEach(doc => {
    const parts = doc.slug.split('/');
    const pathCategory = parts.length >= 3 ? parts[2] : 'uncategorized';
    
    const cleanCategory = pathCategory.replace(/^\d+-/, '');
    const category = doc.data.category || cleanCategory;
    
    const categoryDirName = parts[2] || 'uncategorized';
    const order = extractOrderFromDirectoryName(categoryDirName);
    
    if (!categories[category]) {
      categories[category] = {
        docs: [],
        order: order,
        title: undefined
      };
    }
    
    if (order < categories[category].order) {
      categories[category].order = order;
    }
    
    categories[category].docs.push(doc);
  });
  
  // カテゴリごとにドキュメントを順序で並べ替え
  Object.keys(categories).forEach(category => {
    categories[category].docs.sort((a, b) => {
      const orderA = a.data.order || 999;
      const orderB = b.data.order || 999;
      return orderA - orderB;
    });
  });
  
  // カテゴリを順序で並べ替え
  const sortedCategories = Object.entries(categories).sort((a, b) => {
    return a[1].order - b[1].order;
  });
  
  // プロジェクト固有のベースURLを取得
  const baseUrl = await getProjectBaseUrl(project);
  
  // サイドバー項目の生成
  return sortedCategories.map(([category, { docs }]) => {
    const title = translateCategory(category, lang, categoryTranslations);
    
    return {
      title,
      items: docs.map(doc => {
        const slugParts = doc.slug.split('/').slice(2);
        let fullPath;
        if (baseUrl === '/') {
          fullPath = `/${lang}/${version}/${slugParts.join('/')}`;
        } else {
          fullPath = `${baseUrl}/${lang}/${version}/${slugParts.join('/')}`;
        }
        return {
          title: doc.data.title,
          href: fullPath
        };
      })
    };
  });
}

/**
 * プロジェクト設定からカテゴリ翻訳を取得する
 */
async function getProjectCategoryTranslations(project) {
  try {
    const configPath = path.join(project.path, 'src', 'config', 'project.config.ts');
    const configContent = await fs.readFile(configPath, 'utf-8');
    
    // 最小限の翻訳設定（よく使われるものだけ）
    const translations = {
      en: {
        guide: 'Guide',
        reference: 'Reference'
      },
      ja: {
        guide: 'ガイド',
        reference: 'リファレンス'
      }
    };
    return translations;
  } catch (error) {
    console.warn(`  プロジェクト ${project.name} の翻訳設定の読み込み中にエラー: ${error.message}`);
  }
  
  return null;
}

/**
 * カテゴリ名を翻訳する
 */
function translateCategory(category, lang, translations) {
  if (translations && translations[lang] && translations[lang][category]) {
    return translations[lang][category];
  }
  
  if (translations && translations['en'] && translations['en'][category]) {
    return translations['en'][category];
  }
  
  return category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * プロジェクト固有のベースURLを取得する
 */
async function getProjectBaseUrl(project) {
  let projectSpecificBase = `/docs/${project.name}`;
  const configPath = path.join(project.path, 'astro.config.mjs');
  let astroBase = '';

  try {
    const configFileContent = await fs.readFile(configPath, 'utf-8');
    const baseMatch = configFileContent.match(/base\s*:\s*['"]((?:\/[^\\s'"]*|\.)*)['"]/);
    if (baseMatch && baseMatch[1]) {
      astroBase = baseMatch[1];
      if (astroBase === '.') {
        astroBase = '';
      }
      if (astroBase && !astroBase.startsWith('/')) {
        astroBase = '/' + astroBase;
      }
      if (astroBase.length > 1 && astroBase.endsWith('/')) {
        astroBase = astroBase.slice(0, -1);
      }
      if (astroBase) {
        console.log(`  プロジェクト ${project.name} の astro.config.mjs から base='${astroBase}' を読み込みました。`);
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`  プロジェクト ${project.name} の astro.config.mjs の読み込み/解析中にエラー: ${error.message}`);
    }
  }

  let finalBaseUrl = projectSpecificBase;
  if (astroBase && astroBase !== '/') {
    if (finalBaseUrl.endsWith('/')) {
      finalBaseUrl = finalBaseUrl.slice(0, -1);
    }
    finalBaseUrl = finalBaseUrl + astroBase;
  }
  
  if (finalBaseUrl.endsWith('/') && finalBaseUrl !== '/') {
     finalBaseUrl = finalBaseUrl.slice(0, -1);
  }

  return finalBaseUrl;
}

/**
 * メイン処理
 */
async function main() {
  try {
    console.log('選択的サイドバー生成を開始します...');
    
    // コマンドライン引数から対象プロジェクトを取得
    const args = process.argv.slice(2);
    const requestedProjects = parseProjectsFromArgs(args);
    console.log('指定されたプロジェクト:', requestedProjects.join(', '));

    // 利用可能なプロジェクトを取得して検証
    const availableProjects = await getAvailableProjects();
    await validateProjects(requestedProjects, availableProjects);
    
    // 各プロジェクトの処理
    for (const projectName of requestedProjects) {
      console.log(`プロジェクト ${projectName} の処理を開始します...`);
      
      const project = await getProjectInfo(projectName);
      if (!project) {
        console.warn(`プロジェクト ${projectName} をスキップします`);
        continue;
      }
      
      // 出力ディレクトリの作成
      await fs.mkdir(project.outputDir, { recursive: true });
      
      // 言語とバージョンの組み合わせごとにサイドバーを生成
      for (const lang of project.languages) {
        for (const version of project.versions) {
          console.log(`  ${lang}/${version} のサイドバーを生成中...`);
          
          try {
            // サイドバーを生成
            const sidebar = await generateSidebarForVersion(project, lang, version);
            
            // サイドバーをJSONとして保存（圧縮版も含む）
            const outputPath = path.join(project.outputDir, `sidebar-${lang}-${version}.json`);
            await saveCompressedJson(outputPath, sidebar);
          } catch (error) {
            console.error(`  ${lang}/${version} のサイドバー生成中にエラーが発生しました:`, error);
          }
        }
      }
    }
    
    console.log('選択的サイドバー生成が完了しました');
    console.log(`処理したプロジェクト: ${requestedProjects.join(', ')}`);
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトの実行
main();