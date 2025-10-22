/**
 * テスト用フィクスチャヘルパー
 *
 * テストデータの生成、一時ディレクトリ管理、モックファイルシステム操作を提供します。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 一時ディレクトリのベースパス
 */
export const TMP_DIR = path.join(__dirname, '../tmp');

/**
 * テスト用レジストリデータを生成
 */
export function createTestRegistry(options = {}) {
  const {
    projectCount = 1,
    documentCount = 2,
    withVersions = true,
    withLanguages = true,
  } = options;

  const registry = {
    $schemaVersion: '1.0.0',
    metadata: {
      generatorVersion: '1.0.0',
      lastModified: new Date().toISOString(),
    },
    projects: [],
  };

  for (let i = 0; i < projectCount; i++) {
    const projectId = `test-project-${i + 1}`;
    const project = {
      id: projectId,
      displayName: {
        en: `Test Project ${i + 1}`,
        ja: `テストプロジェクト ${i + 1}`,
      },
      description: {
        en: `Description for test project ${i + 1}`,
        ja: `テストプロジェクト ${i + 1} の説明`,
      },
      defaultVersion: 'v1',
      defaultLanguage: 'en',
      documents: [],
    };

    // バージョン追加
    if (withVersions) {
      project.versions = [
        {
          id: 'v1',
          label: 'v1.0',
          status: 'stable',
          releaseDate: '2025-01-01',
        },
      ];
    }

    // 言語追加
    if (withLanguages) {
      project.languages = [
        {
          code: 'en',
          displayName: 'English',
          status: 'active',
        },
        {
          code: 'ja',
          displayName: '日本語',
          status: 'active',
        },
      ];
    }

    // ドキュメント追加
    for (let j = 0; j < documentCount; j++) {
      const docId = `${projectId}-${String(j + 1).padStart(3, '0')}`;
      project.documents.push({
        id: docId,
        slug: `doc-${j + 1}`,
        title: {
          en: `Document ${j + 1}`,
          ja: `ドキュメント ${j + 1}`,
        },
        category: 'general',
        order: j + 1,
      });
    }

    registry.projects.push(project);
  }

  return registry;
}

/**
 * 一時ディレクトリを作成
 */
export function createTempDir(testName = 'test') {
  const timestamp = Date.now();
  const tempPath = path.join(TMP_DIR, `${testName}-${timestamp}`);
  fs.mkdirSync(tempPath, { recursive: true });
  return tempPath;
}

/**
 * 一時ディレクトリをクリーンアップ
 */
export function cleanupTempDir(tempPath) {
  if (fs.existsSync(tempPath)) {
    fs.rmSync(tempPath, { recursive: true, force: true });
  }
}

/**
 * すべての一時ディレクトリをクリーンアップ
 */
export function cleanupAllTempDirs() {
  if (fs.existsSync(TMP_DIR)) {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  }
}

/**
 * テスト用レジストリファイルを作成
 */
export function createTestRegistryFile(tempPath, registry = null) {
  const data = registry || createTestRegistry();
  const registryPath = path.join(tempPath, 'registry', 'docs.json');
  const dirPath = path.dirname(registryPath);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(registryPath, JSON.stringify(data, null, 2), 'utf-8');
  return registryPath;
}

/**
 * テスト用設定ファイルを作成
 */
export function createTestConfigFile(tempPath, config = {}) {
  const defaultConfig = {
    registryPath: 'registry/docs.json',
    projectRoot: 'apps/',
    contentRoot: 'src/content/docs/',
    nonInteractive: true,
    defaultLang: 'en',
    backupRotation: 5,
    backupDir: '.backups',
  };

  const configData = { ...defaultConfig, ...config };
  const configPath = path.join(tempPath, '.docs-cli', 'config.json');
  const dirPath = path.dirname(configPath);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');
  return configPath;
}

/**
 * テスト用バックアップディレクトリを作成
 */
export function createTestBackupDir(tempPath) {
  const backupPath = path.join(tempPath, '.backups');
  fs.mkdirSync(backupPath, { recursive: true });
  return backupPath;
}

/**
 * ファイルが存在するかチェック
 */
export function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * ディレクトリが存在するかチェック
 */
export function dirExists(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

/**
 * ファイルの内容を読み込み
 */
export function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * JSONファイルを読み込み
 */
export function readJSON(filePath) {
  const content = readFile(filePath);
  return JSON.parse(content);
}

/**
 * ディレクトリ内のファイル一覧を取得
 */
export function listFiles(dirPath, recursive = false) {
  if (!dirExists(dirPath)) {
    return [];
  }

  const files = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isFile()) {
      files.push(fullPath);
    } else if (entry.isDirectory() && recursive) {
      files.push(...listFiles(fullPath, recursive));
    }
  }

  return files;
}

/**
 * テストセットアップヘルパー
 * beforeEachで使用する標準的なセットアップ処理
 */
export function setupTest(testName = 'test') {
  const tempDir = createTempDir(testName);

  // package.jsonを作成してConfigManagerがこのディレクトリをprojectRootとして認識するようにする
  const packageJsonPath = path.join(tempDir, 'package.json');
  fs.writeFileSync(packageJsonPath, JSON.stringify({ name: 'test-project' }, null, 2));

  // レジストリディレクトリが作成される前にスキーマファイルパスを準備
  const registryDir = path.join(tempDir, 'registry');
  if (!fs.existsSync(registryDir)) {
    fs.mkdirSync(registryDir, { recursive: true });
  }

  // スキーマファイルとその依存関係をコピー（バリデーションのため）
  const schemaSourceDir = path.join(process.cwd(), 'registry');
  const schemaFile = path.join(schemaSourceDir, 'docs.schema.json');
  const schemaSubDir = path.join(schemaSourceDir, 'schema');

  if (fs.existsSync(schemaFile)) {
    fs.copyFileSync(schemaFile, path.join(registryDir, 'docs.schema.json'));
  }

  // schema/ディレクトリを再帰的にコピー
  if (fs.existsSync(schemaSubDir)) {
    const schemaDestDir = path.join(registryDir, 'schema');
    fs.mkdirSync(schemaDestDir, { recursive: true });

    const copyRecursive = (src, dest) => {
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          fs.mkdirSync(destPath, { recursive: true });
          copyRecursive(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };

    copyRecursive(schemaSubDir, schemaDestDir);
  }

  const registryPath = createTestRegistryFile(tempDir);
  const configPath = createTestConfigFile(tempDir);

  return {
    tempDir,
    registryPath,
    configPath,
    cleanup: () => cleanupTempDir(tempDir),
  };
}
