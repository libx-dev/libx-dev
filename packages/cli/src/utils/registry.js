/**
 * レジストリ操作ユーティリティ
 *
 * registry/docs.json の読み込み、更新、保存を管理
 */

import fs from 'fs';
import path from 'path';
import { validateRegistry } from '../../../validator/src/index.js';
import { getLogger } from './logger.js';

const logger = getLogger();

/**
 * RegistryManagerクラス
 */
export class RegistryManager {
  constructor(options = {}) {
    this.registryPath = options.registryPath;
    this.projectRoot = options.projectRoot || process.cwd();
    this.registry = null;
    this.validateOnSave = options.validateOnSave !== false;
  }

  /**
   * レジストリパスを解決
   */
  _resolveRegistryPath() {
    if (!this.registryPath) {
      throw new Error('レジストリパスが設定されていません');
    }

    return path.isAbsolute(this.registryPath)
      ? this.registryPath
      : path.join(this.projectRoot, this.registryPath);
  }

  /**
   * レジストリを読み込み
   */
  load() {
    const fullPath = this._resolveRegistryPath();

    if (!fs.existsSync(fullPath)) {
      throw new Error(`レジストリファイルが見つかりません: ${fullPath}`);
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      this.registry = JSON.parse(content);
      logger.debug(`レジストリ読み込み成功: ${fullPath}`);
      return this.registry;
    } catch (error) {
      throw new Error(`レジストリの読み込みに失敗しました: ${error.message}`);
    }
  }

  /**
   * レジストリを保存
   */
  save(registry = null) {
    const dataToSave = registry || this.registry;

    if (!dataToSave) {
      throw new Error('保存するレジストリデータがありません');
    }

    // バリデーション実行
    if (this.validateOnSave) {
      const errors = validateRegistry(dataToSave, {
        projectRoot: this.projectRoot,
        strict: false,
        checkContent: false,
      });

      if (errors && errors.hasErrors()) {
        throw new Error(`レジストリのバリデーションに失敗しました:\n${errors.toString()}`);
      }
    }

    // metadata.lastModified を更新
    if (!dataToSave.metadata) {
      dataToSave.metadata = {};
    }
    dataToSave.metadata.lastModified = new Date().toISOString();

    const fullPath = this._resolveRegistryPath();
    const dirPath = path.dirname(fullPath);

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    try {
      const content = JSON.stringify(dataToSave, null, 2);
      fs.writeFileSync(fullPath, content, 'utf-8');
      this.registry = dataToSave;
      logger.debug(`レジストリ保存成功: ${fullPath}`);
      return true;
    } catch (error) {
      throw new Error(`レジストリの保存に失敗しました: ${error.message}`);
    }
  }

  /**
   * レジストリを取得
   */
  get() {
    if (!this.registry) {
      this.load();
    }
    return this.registry;
  }

  /**
   * プロジェクトを検索
   */
  findProject(projectId) {
    const registry = this.get();
    return registry.projects?.find(p => p.id === projectId);
  }

  /**
   * プロジェクトを追加
   */
  addProject(project) {
    const registry = this.get();

    if (!registry.projects) {
      registry.projects = [];
    }

    // 重複チェック
    if (this.findProject(project.id)) {
      throw new Error(`プロジェクト "${project.id}" は既に存在します`);
    }

    registry.projects.push(project);
    logger.debug(`プロジェクト追加: ${project.id}`);
    return project;
  }

  /**
   * プロジェクトを更新
   */
  updateProject(projectId, updates) {
    const registry = this.get();
    const project = this.findProject(projectId);

    if (!project) {
      throw new Error(`プロジェクト "${projectId}" が見つかりません`);
    }

    Object.assign(project, updates);
    logger.debug(`プロジェクト更新: ${projectId}`);
    return project;
  }

  /**
   * プロジェクトを削除
   */
  removeProject(projectId) {
    const registry = this.get();
    const index = registry.projects?.findIndex(p => p.id === projectId);

    if (index === -1 || index === undefined) {
      throw new Error(`プロジェクト "${projectId}" が見つかりません`);
    }

    const removed = registry.projects.splice(index, 1)[0];
    logger.debug(`プロジェクト削除: ${projectId}`);
    return removed;
  }

  /**
   * ドキュメントを検索（docIdまたはslugで検索）
   */
  findDocument(projectId, identifier) {
    const project = this.findProject(projectId);
    if (!project) return null;

    return project.documents?.find(d => d.id === identifier || d.slug === identifier);
  }

  /**
   * ドキュメントを追加
   */
  addDocument(projectId, document) {
    const project = this.findProject(projectId);

    if (!project) {
      throw new Error(`プロジェクト "${projectId}" が見つかりません`);
    }

    if (!project.documents) {
      project.documents = [];
    }

    // 重複チェック
    if (this.findDocument(projectId, document.id)) {
      throw new Error(`ドキュメント "${document.id}" は既に存在します`);
    }

    project.documents.push(document);
    logger.debug(`ドキュメント追加: ${projectId}/${document.id}`);
    return document;
  }

  /**
   * ドキュメントを更新（docIdまたはslugで検索）
   */
  updateDocument(projectId, identifier, updates) {
    const document = this.findDocument(projectId, identifier);

    if (!document) {
      throw new Error(`ドキュメント "${projectId}/${identifier}" が見つかりません`);
    }

    Object.assign(document, updates);
    logger.debug(`ドキュメント更新: ${projectId}/${identifier}`);
    return document;
  }

  /**
   * ドキュメントを削除（docIdまたはslugで検索）
   */
  removeDocument(projectId, identifier) {
    const project = this.findProject(projectId);
    if (!project) {
      throw new Error(`プロジェクト "${projectId}" が見つかりません`);
    }

    // docIdまたはslugで検索
    const index = project.documents?.findIndex(d => d.id === identifier || d.slug === identifier);
    if (index === -1 || index === undefined) {
      throw new Error(`ドキュメント "${projectId}/${identifier}" が見つかりません`);
    }

    const removed = project.documents.splice(index, 1)[0];
    logger.debug(`ドキュメント削除: ${projectId}/${identifier}`);
    return removed;
  }

  /**
   * バージョンを追加
   */
  addVersion(projectId, version) {
    const project = this.findProject(projectId);

    if (!project) {
      throw new Error(`プロジェクト "${projectId}" が見つかりません`);
    }

    if (!project.versions) {
      project.versions = [];
    }

    // 重複チェック
    if (project.versions.find(v => v.id === version.id)) {
      throw new Error(`バージョン "${version.id}" は既に存在します`);
    }

    project.versions.push(version);
    logger.debug(`バージョン追加: ${projectId}/${version.id}`);
    return version;
  }

  /**
   * 言語を追加
   */
  addLanguage(projectId, language) {
    const project = this.findProject(projectId);

    if (!project) {
      throw new Error(`プロジェクト "${projectId}" が見つかりません`);
    }

    if (!project.languages) {
      project.languages = [];
    }

    // 重複チェック
    if (project.languages.find(l => l.code === language.code)) {
      throw new Error(`言語 "${language.code}" は既に存在します`);
    }

    project.languages.push(language);
    logger.debug(`言語追加: ${projectId}/${language.code}`);
    return language;
  }

  /**
   * バージョンを更新
   */
  updateVersion(projectId, versionId, updates) {
    const project = this.findProject(projectId);

    if (!project) {
      throw new Error(`プロジェクト "${projectId}" が見つかりません`);
    }

    const version = project.versions?.find(v => v.id === versionId);
    if (!version) {
      throw new Error(`バージョン "${versionId}" が見つかりません`);
    }

    Object.assign(version, updates);
    logger.debug(`バージョン更新: ${projectId}/${versionId}`);
    return version;
  }

  /**
   * バージョンを削除
   */
  removeVersion(projectId, versionId) {
    const project = this.findProject(projectId);

    if (!project) {
      throw new Error(`プロジェクト "${projectId}" が見つかりません`);
    }

    const index = project.versions?.findIndex(v => v.id === versionId);
    if (index === -1 || index === undefined) {
      throw new Error(`バージョン "${versionId}" が見つかりません`);
    }

    const removed = project.versions.splice(index, 1)[0];
    logger.debug(`バージョン削除: ${projectId}/${versionId}`);
    return removed;
  }

  /**
   * 言語を更新
   */
  updateLanguage(projectId, langCode, updates) {
    const project = this.findProject(projectId);

    if (!project) {
      throw new Error(`プロジェクト "${projectId}" が見つかりません`);
    }

    const language = project.languages?.find(l => l.code === langCode);
    if (!language) {
      throw new Error(`言語 "${langCode}" が見つかりません`);
    }

    Object.assign(language, updates);
    logger.debug(`言語更新: ${projectId}/${langCode}`);
    return language;
  }

  /**
   * 言語を削除
   */
  removeLanguage(projectId, langCode) {
    const project = this.findProject(projectId);

    if (!project) {
      throw new Error(`プロジェクト "${projectId}" が見つかりません`);
    }

    const index = project.languages?.findIndex(l => l.code === langCode);
    if (index === -1 || index === undefined) {
      throw new Error(`言語 "${langCode}" が見つかりません`);
    }

    const removed = project.languages.splice(index, 1)[0];
    logger.debug(`言語削除: ${projectId}/${langCode}`);
    return removed;
  }

  /**
   * 次のドキュメントIDを生成
   */
  getNextDocId(projectId) {
    const project = this.findProject(projectId);

    if (!project) {
      throw new Error(`プロジェクト "${projectId}" が見つかりません`);
    }

    if (!project.documents || project.documents.length === 0) {
      return `${projectId}-001`;
    }

    // 既存のIDから最大番号を取得
    const maxNum = project.documents.reduce((max, doc) => {
      const match = doc.id.match(/-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        return Math.max(max, num);
      }
      return max;
    }, 0);

    const nextNum = (maxNum + 1).toString().padStart(3, '0');
    return `${projectId}-${nextNum}`;
  }

  /**
   * レジストリ全体のバリデーション
   */
  validate(options = {}) {
    const registry = this.get();
    return validateRegistry(registry, {
      projectRoot: this.projectRoot,
      ...options,
    });
  }
}

/**
 * レジストリマネージャーを作成
 */
export function createRegistryManager(options) {
  return new RegistryManager(options);
}

/**
 * エクスポート
 */
export default RegistryManager;
