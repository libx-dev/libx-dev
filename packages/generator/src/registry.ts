/**
 * レジストリローダー
 *
 * registry/docs.jsonを読み込み、バリデーションを実行して返します。
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { Registry } from './types.js';

/**
 * レジストリファイルのデフォルトパス
 */
const DEFAULT_REGISTRY_PATH = 'registry/docs.json';

/**
 * レジストリローダーのエラークラス
 */
export class RegistryLoadError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'RegistryLoadError';
  }
}

/**
 * レジストリを読み込み
 *
 * @param registryPath - レジストリファイルのパス（デフォルト: registry/docs.json）
 * @param basePath - ベースディレクトリ（デフォルト: process.cwd()）
 * @returns パース済みのレジストリオブジェクト
 * @throws {RegistryLoadError} ファイル読み込みまたはパースに失敗した場合
 *
 * @example
 * ```ts
 * const registry = loadRegistry();
 * console.log(registry.projects.length);
 * ```
 */
export function loadRegistry(
  registryPath: string = DEFAULT_REGISTRY_PATH,
  basePath: string = process.cwd()
): Registry {
  const fullPath = resolve(basePath, registryPath);

  try {
    // ファイル読み込み
    const content = readFileSync(fullPath, 'utf-8');

    // JSONパース
    const registry = JSON.parse(content) as Registry;

    // 基本構造の検証
    validateRegistryStructure(registry);

    return registry;
  } catch (error) {
    if (error instanceof RegistryLoadError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new RegistryLoadError(
        `Failed to parse registry JSON at ${fullPath}: ${error.message}`,
        error
      );
    }

    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new RegistryLoadError(
        `Registry file not found at ${fullPath}`,
        error as Error
      );
    }

    throw new RegistryLoadError(
      `Failed to load registry from ${fullPath}: ${error}`,
      error as Error
    );
  }
}

/**
 * レジストリの基本構造を検証
 *
 * @param registry - 検証するレジストリオブジェクト
 * @throws {RegistryLoadError} 構造が不正な場合
 */
function validateRegistryStructure(registry: any): asserts registry is Registry {
  if (!registry || typeof registry !== 'object') {
    throw new RegistryLoadError('Registry must be an object');
  }

  if (!registry.$schemaVersion) {
    throw new RegistryLoadError('Registry must have $schemaVersion field');
  }

  if (!registry.metadata || typeof registry.metadata !== 'object') {
    throw new RegistryLoadError('Registry must have metadata field');
  }

  if (!Array.isArray(registry.projects)) {
    throw new RegistryLoadError('Registry must have projects array');
  }

  if (registry.projects.length === 0) {
    throw new RegistryLoadError('Registry must have at least one project');
  }

  // プロジェクトの基本検証
  registry.projects.forEach((project: any, index: number) => {
    if (!project.id || typeof project.id !== 'string') {
      throw new RegistryLoadError(
        `Project at index ${index} must have a valid id field`
      );
    }

    if (!Array.isArray(project.documents)) {
      throw new RegistryLoadError(
        `Project "${project.id}" must have documents array`
      );
    }

    if (!Array.isArray(project.languages)) {
      throw new RegistryLoadError(
        `Project "${project.id}" must have languages array`
      );
    }

    if (!Array.isArray(project.versions)) {
      throw new RegistryLoadError(
        `Project "${project.id}" must have versions array`
      );
    }
  });
}

/**
 * レジストリから特定のプロジェクトを取得
 *
 * @param registry - レジストリオブジェクト
 * @param projectId - プロジェクトID
 * @returns プロジェクトオブジェクト、見つからない場合はundefined
 */
export function getProject(registry: Registry, projectId: string) {
  return registry.projects.find((p) => p.id === projectId);
}

/**
 * レジストリから特定のドキュメントを取得
 *
 * @param registry - レジストリオブジェクト
 * @param projectId - プロジェクトID
 * @param docId - ドキュメントID
 * @returns ドキュメントオブジェクト、見つからない場合はundefined
 */
export function getDocument(registry: Registry, projectId: string, docId: string) {
  const project = getProject(registry, projectId);
  if (!project) return undefined;

  return project.documents.find((d) => d.id === docId);
}

/**
 * プロジェクトの統計情報を取得
 *
 * @param registry - レジストリオブジェクト
 * @returns 統計情報オブジェクト
 */
export function getRegistryStats(registry: Registry) {
  const stats = {
    projectCount: registry.projects.length,
    totalDocuments: 0,
    totalLanguages: new Set<string>(),
    totalVersions: new Set<string>(),
    documentsByProject: {} as Record<string, number>,
  };

  registry.projects.forEach((project) => {
    stats.totalDocuments += project.documents.length;
    stats.documentsByProject[project.id] = project.documents.length;

    project.languages.forEach((lang) => {
      stats.totalLanguages.add(lang.code);
    });

    project.versions.forEach((version) => {
      stats.totalVersions.add(version.id);
    });
  });

  return {
    ...stats,
    totalLanguages: stats.totalLanguages.size,
    totalVersions: stats.totalVersions.size,
  };
}
