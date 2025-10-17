/**
 * 設定管理ユーティリティ
 *
 * .docs-cli/config.json の読み込みと環境変数のサポート
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * デフォルト設定
 */
export const DEFAULT_CONFIG = {
  registryPath: 'registry/docs.json',
  projectRoot: 'apps/',
  contentRoot: 'src/content/docs/',
  nonInteractive: false,
  defaultLang: 'en',
  backupRotation: 5,
  backupDir: '.backups',
};

/**
 * 設定ファイルのデフォルトパス
 */
export const DEFAULT_CONFIG_PATH = '.docs-cli/config.json';

/**
 * ConfigManagerクラス
 */
export class ConfigManager {
  constructor(options = {}) {
    this.config = { ...DEFAULT_CONFIG };
    this.configPath = options.configPath || this._getConfigPathFromEnv() || DEFAULT_CONFIG_PATH;
    this.projectRoot = options.projectRoot || this._findProjectRoot();
  }

  /**
   * 環境変数から設定ファイルパスを取得
   */
  _getConfigPathFromEnv() {
    return process.env.DOCS_CLI_CONFIG;
  }

  /**
   * プロジェクトルートを探索
   */
  _findProjectRoot() {
    let currentDir = process.cwd();
    let prevDir = null;

    // package.jsonまたはpnpm-workspace.yamlを探す
    while (currentDir !== prevDir) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      const workspacePath = path.join(currentDir, 'pnpm-workspace.yaml');

      if (fs.existsSync(packageJsonPath) || fs.existsSync(workspacePath)) {
        return currentDir;
      }

      prevDir = currentDir;
      currentDir = path.dirname(currentDir);
    }

    // 見つからない場合は現在のディレクトリ
    return process.cwd();
  }

  /**
   * 設定ファイルを読み込む
   */
  load() {
    const configFullPath = path.resolve(this.projectRoot, this.configPath);

    if (!fs.existsSync(configFullPath)) {
      // 設定ファイルが存在しない場合はデフォルト設定を使用
      return this.config;
    }

    try {
      const configContent = fs.readFileSync(configFullPath, 'utf-8');
      const userConfig = JSON.parse(configContent);

      // デフォルト設定とマージ
      this.config = {
        ...DEFAULT_CONFIG,
        ...userConfig,
      };

      // 環境変数で上書き
      this._applyEnvironmentVariables();

      return this.config;
    } catch (error) {
      throw new Error(`設定ファイルの読み込みに失敗しました: ${error.message}`);
    }
  }

  /**
   * 環境変数を適用
   */
  _applyEnvironmentVariables() {
    // DOCS_CLI_NON_INTERACTIVE
    if (process.env.DOCS_CLI_NON_INTERACTIVE === 'true') {
      this.config.nonInteractive = true;
    }

    // DOCS_CLI_LOG_LEVEL
    if (process.env.DOCS_CLI_LOG_LEVEL) {
      this.config.logLevel = process.env.DOCS_CLI_LOG_LEVEL;
    }

    // DOCS_CLI_REGISTRY_PATH
    if (process.env.DOCS_CLI_REGISTRY_PATH) {
      this.config.registryPath = process.env.DOCS_CLI_REGISTRY_PATH;
    }
  }

  /**
   * 設定ファイルを保存
   */
  save(config = null) {
    const configToSave = config || this.config;
    const configFullPath = path.resolve(this.projectRoot, this.configPath);
    const configDir = path.dirname(configFullPath);

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    try {
      const configContent = JSON.stringify(configToSave, null, 2);
      fs.writeFileSync(configFullPath, configContent, 'utf-8');
      return true;
    } catch (error) {
      throw new Error(`設定ファイルの保存に失敗しました: ${error.message}`);
    }
  }

  /**
   * 設定値を取得
   */
  get(key, defaultValue = null) {
    return this.config[key] !== undefined ? this.config[key] : defaultValue;
  }

  /**
   * 設定値を設定
   */
  set(key, value) {
    this.config[key] = value;
  }

  /**
   * すべての設定を取得
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * 設定ファイルが存在するか確認
   */
  exists() {
    const configFullPath = path.resolve(this.projectRoot, this.configPath);
    return fs.existsSync(configFullPath);
  }

  /**
   * 絶対パスに解決
   */
  resolvePath(relativePath) {
    return path.resolve(this.projectRoot, relativePath);
  }

  /**
   * レジストリパスを取得（絶対パス）
   */
  getRegistryPath() {
    return this.resolvePath(this.config.registryPath);
  }

  /**
   * プロジェクトルートパスを取得（絶対パス）
   */
  getProjectRootPath() {
    return this.resolvePath(this.config.projectRoot);
  }

  /**
   * コンテンツルートパスを取得（絶対パス）
   */
  getContentRootPath() {
    return this.resolvePath(this.config.contentRoot);
  }

  /**
   * バックアップディレクトリパスを取得（絶対パス）
   */
  getBackupDirPath() {
    return this.resolvePath(this.config.backupDir);
  }

  /**
   * 非対話モードか確認
   */
  isNonInteractive() {
    return this.config.nonInteractive;
  }
}

/**
 * デフォルト設定マネージャーインスタンス
 */
let defaultConfigManager = null;

/**
 * デフォルト設定マネージャーを取得
 */
export function getConfigManager() {
  if (!defaultConfigManager) {
    defaultConfigManager = new ConfigManager();
    defaultConfigManager.load();
  }
  return defaultConfigManager;
}

/**
 * デフォルト設定マネージャーを設定
 */
export function setDefaultConfigManager(configManager) {
  defaultConfigManager = configManager;
}

/**
 * 新しい設定マネージャーを作成
 */
export function createConfigManager(options) {
  const manager = new ConfigManager(options);
  manager.load();
  return manager;
}

/**
 * 設定ファイルテンプレートを生成
 */
export function generateConfigTemplate() {
  return {
    $schema: './config.schema.json',
    ...DEFAULT_CONFIG,
  };
}
