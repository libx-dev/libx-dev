#!/usr/bin/env node

/**
 * 選択的統合ビルドスクリプト
 * 
 * このスクリプトは、指定されたプロジェクトのみをビルドして統合します。
 * 既存のdist/内容を保持し、指定されたプロジェクトの部分のみを更新します。
 * 
 * 使用方法:
 * node scripts/build-selective.js --projects=sample-docs,test-verification
 * node scripts/build-selective.js --projects=top-page
 * 
 * オプション:
 * --projects: ビルド対象プロジェクトをカンマ区切りで指定
 * --local: ローカル開発環境用のビルドを行います（ベースパス削除）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { copyDirRecursive } from './utils.js';

// ESモジュールで__dirnameを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// コマンドライン引数を解析
const args = process.argv.slice(2);
const isLocalBuild = args.includes('--local');

/**
 * コマンドライン引数からプロジェクト一覧を解析
 */
function parseProjectsFromArgs(args) {
  const projectsArg = args.find(arg => arg.startsWith('--projects='));
  if (!projectsArg) {
    console.error('エラー: --projects パラメータが指定されていません。');
    console.error('使用方法: node build-selective.js --projects=project1,project2');
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
  const appsDir = path.join(rootDir, 'apps');
  const projects = [];
  
  try {
    const entries = fs.readdirSync(appsDir, { withFileTypes: true });
    const appDirs = entries.filter(entry => entry.isDirectory());
    
    for (const dir of appDirs) {
      const appName = dir.name;
      // project-template は除外
      if (appName !== 'project-template') {
        projects.push(appName);
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
    console.error('エラー: 以下のプロジェクトが見つかりません:');
    invalidProjects.forEach(p => console.error(`  - ${p}`));
    console.error('\n利用可能なプロジェクト:');
    availableProjects.forEach(p => console.error(`  - ${p}`));
    process.exit(1);
  }
}

/**
 * プロジェクト設定を生成
 */
function generateProjectConfig(projectName) {
  const appPath = path.join(rootDir, 'apps', projectName);
  const srcDir = path.join(appPath, 'dist');
  
  if (projectName === 'top-page') {
    // トップページはルートに配置
    return {
      name: projectName,
      srcDir,
      destDir: distDir,
      pathPrefix: ''
    };
  } else {
    // ドキュメントプロジェクトは/docs/{project-name}/に配置
    return {
      name: projectName,
      srcDir,
      destDir: path.join(distDir, 'docs', projectName),
      pathPrefix: `/docs/${projectName}`
    };
  }
}

/**
 * HTMLファイル内のベースパスを修正する関数（既存のコードから流用）
 */
function updateBasePath(filePath, oldBasePath, newBasePath) {
  if (!fs.existsSync(filePath) || !filePath.endsWith('.html')) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // ローカルビルドの場合は、ベースパスを削除
  if (isLocalBuild) {
    oldBasePath = '/libx';
    newBasePath = '';
  }
  
  // アセットパスの修正
  content = content.replace(
    new RegExp(`${oldBasePath}/assets/`, 'g'),
    `${newBasePath}/assets/`
  );
  
  // リダイレクト先URLの修正
  if (filePath.endsWith('index.html')) {
    // リダイレクト時間を修正
    content = content.replace(
      new RegExp(`content="([a-z]+);url=`, 'g'),
      `content="2;url=`
    );
    
    // リダイレクト先URLを修正
    content = content.replace(
      new RegExp(`content="[0-9]+;url=${oldBasePath}/([v0-9]+)/([a-z]+)/"`, 'g'),
      `content="2;url=${newBasePath}/$1/$2/"`
    );
    
    // リンクのhref属性を修正
    content = content.replace(
      new RegExp(`href="${oldBasePath}/([v0-9]+)/([a-z]+)/"`, 'g'),
      `href="${newBasePath}/$1/$2/"`
    );
    
    // リダイレクトメッセージを修正
    content = content.replace(
      new RegExp(`Redirecting from <code>${oldBasePath}</code> to <code>${oldBasePath}/([v0-9]+)/([a-z]+)/</code>`, 'g'),
      `Redirecting from <code>${newBasePath}</code> to <code>${newBasePath}/$1/$2/</code>`
    );
    
    // 直接HTMLを書き換える（ローカルビルドの場合）
    if (isLocalBuild) {
      const localPort = process.env.PORT || 8080;
      content = `<!doctype html><title>Redirecting to: /en/</title><meta http-equiv="refresh" content="2;url=/en/"><meta name="robots" content="noindex"><link rel="canonical" href="http://localhost:${localPort}/en/"><body><a href="/en/">Redirecting from <code>/</code> to <code>/en/</code></a></body>`;
    }
    
    // canonical URLを修正
    if (!isLocalBuild) {
      content = content.replace(
        new RegExp(`href="https://libx.dev${oldBasePath}/([v0-9]+)/([a-z]+)/"`, 'g'),
        `href="https://libx.dev${newBasePath}/$1/$2/"`
      );
    } else {
      const localPort = process.env.PORT || 8080;
      content = content.replace(
        new RegExp(`href="https://libx.dev${oldBasePath}/([v0-9]+)/([a-z]+)/"`, 'g'),
        `href="http://localhost:${localPort}/$1/$2/"`
      );
    }
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * ディレクトリ内のHTMLファイルのベースパスを再帰的に修正する関数
 */
function updateBasePathsRecursive(dir, oldBasePath, newBasePath) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      updateBasePathsRecursive(fullPath, oldBasePath, newBasePath);
    } else if (entry.name.endsWith('.html')) {
      updateBasePath(fullPath, oldBasePath, newBasePath);
    }
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('選択的統合ビルドを開始します...');
  
  if (isLocalBuild) {
    console.log('ローカル開発環境用のビルドを行います...');
  }

  // コマンドライン引数から対象プロジェクトを取得
  const requestedProjects = parseProjectsFromArgs(args);
  console.log('指定されたプロジェクト:', requestedProjects.join(', '));

  // 利用可能なプロジェクトを取得して検証
  const availableProjects = await getAvailableProjects();
  await validateProjects(requestedProjects, availableProjects);

  // distディレクトリが存在しない場合は作成
  if (!fs.existsSync(distDir)) {
    console.log('distディレクトリが存在しないため作成します...');
    fs.mkdirSync(distDir, { recursive: true });
  }

  // プロジェクト設定を生成
  const projectConfigs = requestedProjects.map(generateProjectConfig);

  // 各プロジェクトを個別にビルド
  for (const config of projectConfigs) {
    console.log(`${config.name} をビルドしています...`);
    try {
      execSync(`pnpm --filter=apps-${config.name} build`, { stdio: 'inherit' });
    } catch (error) {
      console.error(`${config.name} のビルドに失敗しました:`, error);
      process.exit(1);
    }
  }

  // 各プロジェクトのビルド出力をdistディレクトリに統合
  for (const config of projectConfigs) {
    console.log(`${config.name} のビルド出力を統合しています...`);
    
    if (!fs.existsSync(config.srcDir)) {
      console.error(`${config.srcDir} が存在しません。`);
      continue;
    }

    // 既存の対象ディレクトリを削除（置換）
    if (fs.existsSync(config.destDir)) {
      console.log(`既存の ${config.destDir} を削除します...`);
      fs.rmSync(config.destDir, { recursive: true, force: true });
    }

    // ディレクトリをコピー
    copyDirRecursive(config.srcDir, config.destDir);

    // サイドバーJSONファイルをコピー（ドキュメントプロジェクトの場合）
    if (config.name !== 'top-page') {
      const sidebarSrcDir = path.join(rootDir, 'apps', config.name, 'public', 'sidebar');
      const sidebarDestDir = path.join(config.destDir, 'sidebar');
      
      if (fs.existsSync(sidebarSrcDir)) {
        console.log(`${config.name} のサイドバーJSONファイルをコピーしています...`);
        if (!fs.existsSync(sidebarDestDir)) {
          fs.mkdirSync(sidebarDestDir, { recursive: true });
        }
        copyDirRecursive(sidebarSrcDir, sidebarDestDir);
        
        const additionalDestDir = path.join(config.destDir, 'pages', 'public', 'sidebar');
        if (!fs.existsSync(additionalDestDir)) {
          fs.mkdirSync(additionalDestDir, { recursive: true });
        }
        copyDirRecursive(sidebarSrcDir, additionalDestDir);
        console.log(`追加の場所にもサイドバーJSONファイルをコピーしました`);
      } else {
        console.warn(`サイドバーディレクトリが見つかりません: ${sidebarSrcDir}`);
      }
    }

    // ベースパスの修正
    if (config.pathPrefix) {
      console.log(`${config.name} のベースパスを修正しています...`);
      let oldBasePath = '/libx'; 
      let newBasePath = '/libx' + config.pathPrefix; 
      
      if (isLocalBuild) {
        oldBasePath = '/libx';
        newBasePath = '';
      }
      
      updateBasePathsRecursive(config.destDir, oldBasePath, newBasePath);
    }
  }

  console.log('選択的統合ビルドが完了しました。');
  console.log(`処理したプロジェクト: ${requestedProjects.join(', ')}`);
}

main().catch(error => {
  console.error('選択的ビルド中にエラーが発生しました:', error);
  process.exit(1);
});