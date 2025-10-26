#!/usr/bin/env node

/**
 * 統合ビルドスクリプト
 *
 * このスクリプトは、apps/配下の各プロジェクトをビルドし、
 * 1つのdistディレクトリに統合します。
 *
 * 主な機能:
 * 1. レジストリファイルからプロジェクト情報を自動検出
 * 2. 各プロジェクトを順次ビルド
 * 3. ビルド出力をルートのdistディレクトリに統合
 *    - top-page: ルートパス (/)
 *    - その他: /docs/{project-id}/
 * 4. HTMLファイル内のベースパスを自動修正（必要に応じて）
 *
 * オプション:
 * --local       : ローカル開発環境用のビルド（ベースパス削除）
 * --skip-build  : ビルドをスキップしてコピーのみ実行
 * --project <id>: 特定プロジェクトのみビルド
 * --clean       : dist/のクリーンアップのみ実行
 * --help        : ヘルプを表示
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import {
  copyDirRecursive,
  updateBasePathsRecursive,
  loadProjectsFromRegistry,
  removeDir,
  measureTime,
} from './utils/build-utils.js';

// ESモジュールで__dirnameを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const registryDir = path.join(rootDir, 'registry');

// コマンドライン引数を解析
const args = process.argv.slice(2);
const options = {
  local: args.includes('--local'),
  skipBuild: args.includes('--skip-build'),
  clean: args.includes('--clean'),
  help: args.includes('--help'),
  project: null,
};

// --project オプションの値を取得
const projectIndex = args.indexOf('--project');
if (projectIndex !== -1 && args[projectIndex + 1]) {
  options.project = args[projectIndex + 1];
}

/**
 * ヘルプメッセージを表示
 */
function showHelp() {
  console.log(`
統合ビルドスクリプト

使用方法:
  node scripts/build-integrated.js [オプション]

オプション:
  --local           ローカル開発環境用のビルド（ベースパス削除）
  --skip-build      ビルドをスキップしてコピーのみ実行
  --project <id>    特定プロジェクトのみビルド（例: demo-docs）
  --clean           dist/のクリーンアップのみ実行
  --help            このヘルプを表示

例:
  # 通常のビルド
  node scripts/build-integrated.js

  # ローカル開発用ビルド
  node scripts/build-integrated.js --local

  # 特定プロジェクトのみビルド
  node scripts/build-integrated.js --project demo-docs

  # dist/をクリーンアップ
  node scripts/build-integrated.js --clean
  `);
}

/**
 * apps/配下のプロジェクト情報を構築
 * @param {Array} registryProjects - レジストリから読み込んだプロジェクト情報
 * @returns {Array} ビルド対象プロジェクトの配列
 */
function buildProjectList(registryProjects) {
  const appsDir = path.join(rootDir, 'apps');
  const projects = [];
  const seenProjects = new Set(); // 重複チェック用

  // top-page は常に含める（レジストリに含まれていなくても）
  const topPagePath = path.join(appsDir, 'top-page');
  if (fs.existsSync(topPagePath)) {
    projects.push({
      id: 'top-page',
      name: 'top-page',
      srcDir: path.join(topPagePath, 'dist'),
      destDir: distDir,
      pathPrefix: '',
      filterName: 'apps-top-page',
      displayName: { en: 'Top Page', ja: 'トップページ' },
    });
    seenProjects.add('top-page');
  }

  // レジストリベースのプロジェクトを追加
  for (const project of registryProjects) {
    const projectPath = path.join(appsDir, project.id);

    // project-template はスキップ
    if (project.id === 'project-template') {
      continue;
    }

    // 既に追加済みのプロジェクトはスキップ（重複回避）
    if (seenProjects.has(project.id)) {
      continue;
    }

    if (fs.existsSync(projectPath)) {
      projects.push({
        id: project.id,
        name: project.id,
        srcDir: path.join(projectPath, 'dist'),
        destDir: path.join(distDir, 'docs', project.id),
        pathPrefix: `/docs/${project.id}`,
        filterName: project.id,
        displayName: project.displayName,
      });
      seenProjects.add(project.id);
    }
  }

  return projects;
}

/**
 * プロジェクトをビルド
 * @param {Object} project - プロジェクト情報
 */
async function buildProject(project) {
  console.log(`📦 ${project.name}をビルド中...`);

  try {
    execSync(`pnpm --filter=${project.filterName} build`, {
      stdio: 'inherit',
      cwd: rootDir,
    });
  } catch (error) {
    console.error(`❌ ${project.name}のビルドに失敗しました`);
    throw error;
  }

  // ビルド出力の存在確認
  if (!fs.existsSync(project.srcDir)) {
    throw new Error(`ビルド出力が見つかりません: ${project.srcDir}`);
  }
}

/**
 * プロジェクトのビルド出力をdistディレクトリにコピー
 * @param {Object} project - プロジェクト情報
 */
function copyProjectOutput(project) {
  console.log(`📋 ${project.name}のビルド出力をコピー中...`);

  if (!fs.existsSync(project.srcDir)) {
    console.error(`❌ ビルド出力が見つかりません: ${project.srcDir}`);
    return;
  }

  // ディレクトリをコピー
  copyDirRecursive(project.srcDir, project.destDir);
  console.log(`   ✓ ${project.srcDir} → ${project.destDir}`);

  // ベースパスの修正が必要な場合
  if (project.pathPrefix) {
    console.log(`🔧 ${project.name}のベースパスを修正中...`);
    const oldBasePath = project.pathPrefix; // 例: /docs/demo-docs
    const newBasePath = options.local ? '' : project.pathPrefix;

    if (options.local) {
      console.log(`   ローカル開発環境用にベースパスを削除します`);
    }

    updateBasePathsRecursive(project.destDir, oldBasePath, newBasePath, options.local);
    console.log(`   ✓ ベースパス修正完了`);
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🏗️  統合ビルドを開始します...\n');

  // ヘルプ表示
  if (options.help) {
    showHelp();
    return;
  }

  // クリーンアップのみ実行
  if (options.clean) {
    console.log('🧹 dist/ディレクトリをクリーンアップ中...');
    await removeDir(distDir);
    console.log('✅ クリーンアップ完了\n');
    return;
  }

  // ビルドモードの表示
  if (options.local) {
    console.log('🏠 ローカル開発環境用のビルドを行います');
  }
  if (options.skipBuild) {
    console.log('⏩ ビルドをスキップしてコピーのみ実行します');
  }
  if (options.project) {
    console.log(`🎯 特定プロジェクトのみビルド: ${options.project}`);
  }
  console.log('');

  // レジストリからプロジェクト情報を読み込み
  let registryProjects = [];
  try {
    registryProjects = await measureTime('レジストリ読み込み', async () => {
      return await loadProjectsFromRegistry(registryDir);
    });
    console.log(`📚 検出されたプロジェクト: ${registryProjects.map(p => p.id).join(', ')}\n`);
  } catch (error) {
    console.error('❌ レジストリの読み込みに失敗しました:', error);
    process.exit(1);
  }

  // 存在しないプロジェクトを警告
  const appsDir = path.join(rootDir, 'apps');
  const missingProjects = registryProjects.filter(p => {
    return p.id !== 'project-template' && !fs.existsSync(path.join(appsDir, p.id));
  });
  if (missingProjects.length > 0) {
    console.log('⚠️  以下のプロジェクトはレジストリに登録されていますが、apps/配下に存在しません:');
    missingProjects.forEach(p => {
      console.log(`   - ${p.id}`);
    });
    console.log('');
  }

  // プロジェクトリストを構築
  let projects = buildProjectList(registryProjects);

  // 特定プロジェクトのみビルドする場合はフィルタリング
  if (options.project) {
    projects = projects.filter(p => p.id === options.project);
    if (projects.length === 0) {
      console.error(`❌ プロジェクトが見つかりません: ${options.project}`);
      process.exit(1);
    }
  }

  console.log(`🎯 ビルド対象: ${projects.map(p => p.name).join(', ')}\n`);

  // dist/ディレクトリをクリーンアップ
  await measureTime('dist/クリーンアップ', async () => {
    console.log('🧹 既存のdist/ディレクトリをクリーンアップ中...');
    await removeDir(distDir);
    fs.mkdirSync(distDir, { recursive: true });
  });
  console.log('');

  // 各プロジェクトをビルド
  if (!options.skipBuild) {
    for (const project of projects) {
      try {
        await measureTime(`${project.name}のビルド`, async () => {
          await buildProject(project);
        });
      } catch (error) {
        console.error(`❌ ${project.name}のビルドに失敗しました:`, error.message);
        process.exit(1);
      }
    }
    console.log('');
  }

  // 各プロジェクトのビルド出力をコピー
  for (const project of projects) {
    try {
      await measureTime(`${project.name}のコピー`, async () => {
        copyProjectOutput(project);
      });
    } catch (error) {
      console.error(`❌ ${project.name}のコピーに失敗しました:`, error.message);
      process.exit(1);
    }
  }

  // ビルド完了メッセージ
  console.log('');
  console.log('✅ 統合ビルドが完了しました！\n');
  console.log('📊 ディレクトリ構造:');
  console.log('dist/');
  for (const project of projects) {
    if (project.pathPrefix) {
      console.log(`  └── ${project.pathPrefix}/ (${project.name})`);
    } else {
      console.log(`  └── / (${project.name})`);
    }
  }
  console.log('');
  console.log('🚀 プレビューするには:');
  console.log('   pnpm preview');
  console.log('   または');
  console.log('   bash scripts/dev/start_server.sh');
  console.log('');
}

// メイン処理を実行
main().catch(error => {
  console.error('❌ 統合ビルド中にエラーが発生しました:', error);
  process.exit(1);
});
