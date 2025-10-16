#!/usr/bin/env node

/**
 * レジストリスキーマのバリデーションスクリプト
 *
 * このスクリプトは以下をチェックします：
 * 1. 全スキーマファイルが有効なJSONであること
 * 2. サンプルデータがスキーマに適合すること
 * 3. $ref参照が正しいパスを指していること
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Ajvインスタンスの作成
const ajv = new Ajv({
  strict: false,
  allErrors: true,
  verbose: true,
  validateSchema: false, // メタスキーマ検証を無効化
});

addFormats(ajv);

// カラー出力用のヘルパー
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, prefix, message) {
  console.log(`${color}${prefix}${colors.reset} ${message}`);
}

function success(message) {
  log(colors.green, '✓', message);
}

function error(message) {
  log(colors.red, '✗', message);
}

function info(message) {
  log(colors.blue, 'ℹ', message);
}

function warn(message) {
  log(colors.yellow, '⚠', message);
}

// スキーマファイルの検証
async function validateSchemaFiles() {
  info('スキーマファイルの検証を開始...');

  const schemaDir = path.resolve(projectRoot, 'registry', 'schema');
  const schemaFiles = [
    'category.schema.json',
    'document.schema.json',
    'language.schema.json',
    'project.schema.json',
    'settings.schema.json',
    'version.schema.json',
    'partials/common.schema.json',
    'partials/contributor.schema.json',
    'partials/document-content.schema.json',
    'partials/glossary.schema.json',
    'partials/license.schema.json',
  ];

  let allValid = true;

  for (const file of schemaFiles) {
    const filePath = path.join(schemaDir, file);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      JSON.parse(content);
      success(`${file} - 有効なJSON`);
    } catch (err) {
      error(`${file} - JSONパースエラー: ${err.message}`);
      allValid = false;
    }
  }

  return allValid;
}

// ルートスキーマの検証
async function validateRootSchema() {
  info('ルートスキーマの検証を開始...');

  const rootSchemaPath = path.resolve(projectRoot, 'registry', 'docs.schema.json');

  try {
    const content = fs.readFileSync(rootSchemaPath, 'utf-8');
    const schema = JSON.parse(content);

    // 基本構造のチェック
    if (!schema.$schema) {
      warn('$schema フィールドが見つかりません');
    }

    if (!schema.$id) {
      warn('$id フィールドが見つかりません');
    }

    if (!schema.properties || !schema.properties.$schemaVersion) {
      error('$schemaVersion プロパティが定義されていません');
      return false;
    }

    success('ルートスキーマの基本構造は正常です');
    return true;
  } catch (err) {
    error(`ルートスキーマの検証エラー: ${err.message}`);
    return false;
  }
}

// サンプルデータの検証（簡易版）
async function validateSampleData() {
  info('サンプルデータの検証を開始...');

  const sampleDataPath = path.resolve(projectRoot, 'registry', 'examples', 'sample-basic.json');

  try {
    // サンプルデータの読み込み
    const dataContent = fs.readFileSync(sampleDataPath, 'utf-8');
    const data = JSON.parse(dataContent);

    info('サンプルデータを読み込みました');

    // 基本的な構造チェック
    const checks = [
      { condition: data.$schemaVersion, message: '$schemaVersion が存在します' },
      { condition: data.$schemaVersion === '1.0.0', message: '$schemaVersion が 1.0.0 です' },
      { condition: Array.isArray(data.projects), message: 'projects が配列です' },
      { condition: data.projects.length > 0, message: 'projects に少なくとも1つのプロジェクトがあります' },
      { condition: data.settings, message: 'settings が存在します' },
    ];

    let allChecksPass = true;
    for (const check of checks) {
      if (check.condition) {
        success(check.message);
      } else {
        error(`検証失敗: ${check.message}`);
        allChecksPass = false;
      }
    }

    // プロジェクト構造のチェック
    if (data.projects && data.projects.length > 0) {
      const project = data.projects[0];
      const projectChecks = [
        { condition: project.id, message: 'プロジェクトに id が存在します' },
        { condition: project.displayName, message: 'プロジェクトに displayName が存在します' },
        { condition: Array.isArray(project.languages), message: 'プロジェクトに languages 配列が存在します' },
        { condition: Array.isArray(project.versions), message: 'プロジェクトに versions 配列が存在します' },
        { condition: Array.isArray(project.categories), message: 'プロジェクトに categories 配列が存在します' },
        { condition: Array.isArray(project.documents), message: 'プロジェクトに documents 配列が存在します' },
      ];

      for (const check of projectChecks) {
        if (check.condition) {
          success(check.message);
        } else {
          warn(`警告: ${check.message}`);
        }
      }
    }

    if (allChecksPass) {
      success('サンプルデータの基本構造は正常です');
      info('注意: 完全なスキーマバリデーションは CLI 実装時に Ajv で行います');
      return true;
    } else {
      error('サンプルデータの基本構造に問題があります');
      return false;
    }
  } catch (err) {
    error(`サンプルデータ検証エラー: ${err.message}`);
    console.error(err.stack);
    return false;
  }
}

// $ref参照のチェック
function checkReferences() {
  info('$ref 参照の整合性チェックを開始...');

  const rootSchemaPath = path.resolve(projectRoot, 'registry', 'docs.schema.json');
  const rootSchema = JSON.parse(fs.readFileSync(rootSchemaPath, 'utf-8'));

  let allRefsValid = true;

  // ルートスキーマの$refをチェック
  if (rootSchema.properties?.projects?.items?.$ref) {
    const ref = rootSchema.properties.projects.items.$ref;
    const refPath = path.resolve(projectRoot, 'registry', ref);
    if (fs.existsSync(refPath)) {
      success(`参照確認: ${ref}`);
    } else {
      error(`参照エラー: ${ref} が見つかりません`);
      allRefsValid = false;
    }
  }

  if (rootSchema.properties?.settings?.$ref) {
    const ref = rootSchema.properties.settings.$ref;
    const refPath = path.resolve(projectRoot, 'registry', ref);
    if (fs.existsSync(refPath)) {
      success(`参照確認: ${ref}`);
    } else {
      error(`参照エラー: ${ref} が見つかりません`);
      allRefsValid = false;
    }
  }

  return allRefsValid;
}

// メイン処理
async function main() {
  console.log('\n' + colors.cyan + '═══════════════════════════════════════════' + colors.reset);
  console.log(colors.cyan + '  レジストリスキーマ検証ツール' + colors.reset);
  console.log(colors.cyan + '═══════════════════════════════════════════' + colors.reset + '\n');

  let allTestsPassed = true;

  // 1. スキーマファイルの検証
  const schemaFilesValid = await validateSchemaFiles();
  allTestsPassed = allTestsPassed && schemaFilesValid;
  console.log('');

  // 2. ルートスキーマの検証
  const rootSchemaValid = await validateRootSchema();
  allTestsPassed = allTestsPassed && rootSchemaValid;
  console.log('');

  // 3. $ref参照のチェック
  const refsValid = checkReferences();
  allTestsPassed = allTestsPassed && refsValid;
  console.log('');

  // 4. サンプルデータの検証
  const sampleDataValid = await validateSampleData();
  allTestsPassed = allTestsPassed && sampleDataValid;
  console.log('');

  // 結果サマリー
  console.log(colors.cyan + '═══════════════════════════════════════════' + colors.reset);
  if (allTestsPassed) {
    success('すべての検証が成功しました！');
    console.log(colors.cyan + '═══════════════════════════════════════════' + colors.reset + '\n');
    process.exit(0);
  } else {
    error('一部の検証が失敗しました');
    console.log(colors.cyan + '═══════════════════════════════════════════' + colors.reset + '\n');
    process.exit(1);
  }
}

main().catch((err) => {
  error(`予期しないエラー: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
