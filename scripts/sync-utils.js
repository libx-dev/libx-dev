#!/usr/bin/env node

/**
 * libx-docs同期用ユーティリティ関数
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

/**
 * ディレクトリが除外対象かどうかをチェック
 * @param {string} dirName ディレクトリ名
 * @returns {boolean} 除外対象の場合true
 */
export function isExcludedDirectory(dirName) {
  return dirName.startsWith('.') || dirName.startsWith('_');
}

/**
 * ファイル名が適切な形式かどうかをチェック
 * @param {string} fileName ファイル名
 * @returns {boolean} 適切な形式の場合true
 */
export function isValidFileName(fileName) {
  // MDXファイルで数字接頭辞があるかチェック
  if (fileName.endsWith('.mdx')) {
    return /^\d{2}-/.test(fileName);
  }
  return true;
}

/**
 * カテゴリディレクトリ名が適切な形式かどうかをチェック
 * @param {string} categoryName カテゴリ名
 * @returns {boolean} 適切な形式の場合true
 */
export function isValidCategoryName(categoryName) {
  return /^\d{2}-/.test(categoryName);
}

/**
 * ディレクトリ構造を再帰的にスキャンして構造情報を取得
 * @param {string} dirPath スキャンするディレクトリパス
 * @param {string} basePath ベースパス（相対パス計算用）
 * @returns {Promise<Object>} ディレクトリ構造情報
 */
export async function scanDirectoryStructure(dirPath, basePath = dirPath) {
  const structure = {
    path: path.relative(basePath, dirPath),
    type: 'directory',
    children: []
  };

  try {
    const entries = await fs.readdir(dirPath);
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        if (!isExcludedDirectory(entry)) {
          const childStructure = await scanDirectoryStructure(fullPath, basePath);
          structure.children.push(childStructure);
        }
      } else if (stat.isFile()) {
        structure.children.push({
          path: path.relative(basePath, fullPath),
          type: 'file',
          name: entry
        });
      }
    }
  } catch (error) {
    console.warn(`ディレクトリスキャンエラー: ${dirPath} - ${error.message}`);
  }

  return structure;
}

/**
 * プロジェクトの言語間でディレクトリ構造の整合性をチェック
 * @param {string} projectPath プロジェクトのパス
 * @param {Array<string>} supportedLangs サポート言語リスト
 * @param {Array<string>} versions バージョンリスト
 * @returns {Promise<Object>} 整合性チェック結果
 */
export async function validateProjectStructure(projectPath, supportedLangs, versions) {
  const issues = [];
  const structures = {};

  // 各バージョンと言語の構造をチェック
  for (const version of versions) {
    structures[version] = {};
    
    for (const lang of supportedLangs) {
      const versionLangPath = path.join(projectPath, version, lang);
      
      try {
        await fs.access(versionLangPath);
        structures[version][lang] = await scanDirectoryStructure(versionLangPath);
      } catch (error) {
        issues.push({
          type: 'missing_language_directory',
          version,
          language: lang,
          path: versionLangPath,
          message: `言語ディレクトリが存在しません: ${version}/${lang}`
        });
      }
    }
  }

  // 言語間の構造比較
  for (const version of versions) {
    if (Object.keys(structures[version]).length < 2) continue;

    const languages = Object.keys(structures[version]);
    const baseLanguage = languages[0];
    const baseStructure = structures[version][baseLanguage];

    for (let i = 1; i < languages.length; i++) {
      const compareLanguage = languages[i];
      const compareStructure = structures[version][compareLanguage];
      
      const structureIssues = compareDirectoryStructures(
        baseStructure,
        compareStructure,
        version,
        baseLanguage,
        compareLanguage
      );
      
      issues.push(...structureIssues);
    }
  }

  // ファイル命名規則チェック
  for (const version of versions) {
    for (const lang of supportedLangs) {
      if (!structures[version][lang]) continue;
      
      const namingIssues = validateNamingConventions(
        structures[version][lang],
        version,
        lang
      );
      
      issues.push(...namingIssues);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    structures
  };
}

/**
 * 2つのディレクトリ構造を比較して差異を検出
 * @param {Object} structure1 比較元構造
 * @param {Object} structure2 比較先構造
 * @param {string} version バージョン
 * @param {string} lang1 言語1
 * @param {string} lang2 言語2
 * @returns {Array} 検出された問題のリスト
 */
function compareDirectoryStructures(structure1, structure2, version, lang1, lang2) {
  const issues = [];
  
  // ディレクトリとファイルをそれぞれ分離
  const dirs1 = structure1.children.filter(child => child.type === 'directory');
  const files1 = structure1.children.filter(child => child.type === 'file');
  const dirs2 = structure2.children.filter(child => child.type === 'directory');
  const files2 = structure2.children.filter(child => child.type === 'file');
  
  // ディレクトリ構造の比較
  const dirNames1 = dirs1.map(dir => path.basename(dir.path));
  const dirNames2 = dirs2.map(dir => path.basename(dir.path));
  
  for (const dirName of dirNames1) {
    if (!dirNames2.includes(dirName)) {
      issues.push({
        type: 'missing_directory',
        version,
        baseLanguage: lang1,
        compareLanguage: lang2,
        path: dirName,
        message: `ディレクトリ "${dirName}" が ${lang2} 言語に存在しません`
      });
    }
  }
  
  for (const dirName of dirNames2) {
    if (!dirNames1.includes(dirName)) {
      issues.push({
        type: 'extra_directory',
        version,
        baseLanguage: lang1,
        compareLanguage: lang2,
        path: dirName,
        message: `ディレクトリ "${dirName}" が ${lang1} 言語に存在しません`
      });
    }
  }
  
  // ファイル構造の比較
  const fileNames1 = files1.map(file => file.name);
  const fileNames2 = files2.map(file => file.name);
  
  for (const fileName of fileNames1) {
    if (!fileNames2.includes(fileName)) {
      issues.push({
        type: 'missing_file',
        version,
        baseLanguage: lang1,
        compareLanguage: lang2,
        path: fileName,
        message: `ファイル "${fileName}" が ${lang2} 言語に存在しません`
      });
    }
  }
  
  for (const fileName of fileNames2) {
    if (!fileNames1.includes(fileName)) {
      issues.push({
        type: 'extra_file',
        version,
        baseLanguage: lang1,
        compareLanguage: lang2,
        path: fileName,
        message: `ファイル "${fileName}" が ${lang1} 言語に存在しません`
      });
    }
  }
  
  // 再帰的に子ディレクトリも比較
  for (const dirName of dirNames1.filter(name => dirNames2.includes(name))) {
    const subDir1 = dirs1.find(dir => path.basename(dir.path) === dirName);
    const subDir2 = dirs2.find(dir => path.basename(dir.path) === dirName);
    
    const subIssues = compareDirectoryStructures(
      subDir1,
      subDir2,
      version,
      lang1,
      lang2
    );
    
    issues.push(...subIssues);
  }
  
  return issues;
}

/**
 * 命名規則をバリデート
 * @param {Object} structure ディレクトリ構造
 * @param {string} version バージョン
 * @param {string} lang 言語
 * @returns {Array} 検出された問題のリスト
 */
function validateNamingConventions(structure, version, lang) {
  const issues = [];
  
  function validateRecursive(node, currentPath = '') {
    for (const child of node.children) {
      const fullPath = path.join(currentPath, child.name || path.basename(child.path));
      
      if (child.type === 'directory') {
        const dirName = child.name || path.basename(child.path);
        
        // カテゴリディレクトリ（第一階層）の命名規則チェック
        if (currentPath === '') {
          if (!isValidCategoryName(dirName)) {
            issues.push({
              type: 'invalid_category_name',
              version,
              language: lang,
              path: fullPath,
              message: `カテゴリディレクトリ名 "${dirName}" が無効です。"01-", "02-"などの接頭辞が必要です`
            });
          }
        }
        
        validateRecursive(child, fullPath);
      } else if (child.type === 'file') {
        if (!isValidFileName(child.name)) {
          issues.push({
            type: 'invalid_file_name',
            version,
            language: lang,
            path: fullPath,
            message: `ファイル名 "${child.name}" が無効です。MDXファイルは"01-", "02-"などの接頭辞が必要です`
          });
        }
      }
    }
  }
  
  validateRecursive(structure);
  return issues;
}

/**
 * ディレクトリのハッシュ値を計算（変更検出用）
 * @param {string} dirPath ディレクトリパス
 * @returns {Promise<string>} ハッシュ値
 */
export async function calculateDirectoryHash(dirPath) {
  const structure = await scanDirectoryStructure(dirPath);
  
  function getStructureString(node) {
    if (node.type === 'directory') {
      const childStrings = node.children
        .sort((a, b) => a.path.localeCompare(b.path))
        .map(getStructureString);
      return `${node.path}:dir:[${childStrings.join(',')}]`;
    } else {
      return `${node.path}:file`;
    }
  }
  
  const structureString = getStructureString(structure);
  return crypto.createHash('md5').update(structureString).digest('hex');
}

/**
 * config.jsonファイルを読み込み
 * @param {string} configPath config.jsonファイルのパス
 * @returns {Promise<Object|null>} 設定オブジェクト
 */
export async function loadConfig(configPath) {
  try {
    const content = await fs.readFile(configPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`設定ファイルの読み込みエラー: ${configPath} - ${error.message}`);
    return null;
  }
}

/**
 * config.jsonファイルを保存
 * @param {string} configPath config.jsonファイルのパス
 * @param {Object} config 設定オブジェクト
 * @returns {Promise<boolean>} 保存成功の場合true
 */
export async function saveConfig(configPath, config) {
  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`設定ファイルの保存エラー: ${configPath} - ${error.message}`);
    return false;
  }
}

/**
 * Gitから最新のコミットハッシュを取得
 * @param {string} repoPath リポジトリパス
 * @returns {string|null} コミットハッシュ
 */
export function getLatestCommitHash(repoPath) {
  try {
    const originalCwd = process.cwd();
    process.chdir(repoPath);
    const hash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    process.chdir(originalCwd);
    return hash;
  } catch (error) {
    console.warn(`コミットハッシュの取得エラー: ${error.message}`);
    return null;
  }
}

/**
 * ディレクトリを再帰的にコピー
 * @param {string} srcDir コピー元ディレクトリ
 * @param {string} destDir コピー先ディレクトリ
 * @returns {Promise<boolean>} コピー成功の場合true
 */
export async function copyDirectory(srcDir, destDir) {
  try {
    await fs.mkdir(destDir, { recursive: true });
    
    const entries = await fs.readdir(srcDir);
    
    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry);
      const destPath = path.join(destDir, entry);
      const stat = await fs.stat(srcPath);
      
      if (stat.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`ディレクトリコピーエラー: ${srcDir} -> ${destDir} - ${error.message}`);
    return false;
  }
}

/**
 * ディレクトリを削除
 * @param {string} dirPath 削除するディレクトリパス
 * @returns {Promise<boolean>} 削除成功の場合true
 */
export async function removeDirectory(dirPath) {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
    return true;
  } catch (error) {
    console.error(`ディレクトリ削除エラー: ${dirPath} - ${error.message}`);
    return false;
  }
}

/**
 * libx-devプロジェクトが存在するかチェック
 * @param {string} libxDevPath libx-devのパス
 * @param {string} projectName プロジェクト名
 * @returns {Promise<boolean>} 存在する場合true
 */
export async function projectExistsInLibxDev(libxDevPath, projectName) {
  const projectPath = path.join(libxDevPath, 'apps', projectName);
  
  try {
    await fs.access(projectPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * エラー詳細を表示
 * @param {Array} issues 問題のリスト
 */
export function displayValidationIssues(issues) {
  if (issues.length === 0) {
    console.log('✅ バリデーション: 問題は見つかりませんでした。');
    return;
  }

  console.log(`❌ バリデーション: ${issues.length}個の問題が見つかりました:\\n`);
  
  const groupedIssues = issues.reduce((groups, issue) => {
    const key = `${issue.version || 'global'}-${issue.type}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(issue);
    return groups;
  }, {});

  for (const [, groupIssues] of Object.entries(groupedIssues)) {
    const firstIssue = groupIssues[0];
    console.log(`\\n📁 ${firstIssue.version || '全体'} - ${getIssueTypeLabel(firstIssue.type)}:`);
    
    for (const issue of groupIssues) {
      console.log(`   ⚠️  ${issue.message}`);
      if (issue.path) {
        console.log(`      パス: ${issue.path}`);
      }
    }
  }
}

/**
 * 問題タイプのラベルを取得
 * @param {string} issueType 問題タイプ
 * @returns {string} ラベル
 */
function getIssueTypeLabel(issueType) {
  const labels = {
    'missing_language_directory': '言語ディレクトリ不足',
    'missing_directory': 'ディレクトリ不足',
    'extra_directory': '余分なディレクトリ',
    'missing_file': 'ファイル不足',
    'extra_file': '余分なファイル',
    'invalid_category_name': '無効なカテゴリ名',
    'invalid_file_name': '無効なファイル名'
  };
  
  return labels[issueType] || issueType;
}