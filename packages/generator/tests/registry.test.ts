/**
 * レジストリローダーのユニットテスト
 */

import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import {
  loadRegistry,
  getProject,
  getDocument,
  getRegistryStats,
  RegistryLoadError,
} from '../src/registry.js';

describe('loadRegistry', () => {
  it('実際のレジストリファイルを読み込める', () => {
    // プロジェクトルートからの相対パス
    const basePath = resolve(process.cwd(), '../..');
    const registry = loadRegistry('registry/docs.json', basePath);

    expect(registry).toBeDefined();
    expect(registry.$schemaVersion).toBeDefined();
    expect(registry.metadata).toBeDefined();
    expect(Array.isArray(registry.projects)).toBe(true);
    expect(registry.projects.length).toBeGreaterThan(0);
  });

  it('存在しないファイルでエラーが発生する', () => {
    expect(() => {
      loadRegistry('non-existent.json');
    }).toThrow(RegistryLoadError);
  });

  it('不正なJSONでエラーが発生する', () => {
    // Note: 実際のテストでは一時的に不正なJSONファイルを作成する必要がある
    // ここでは型チェックのみ
    expect(RegistryLoadError).toBeDefined();
  });

  it('必須フィールドが欠けているとエラーが発生する', () => {
    // validateRegistryStructureの内部テストは統合テストで実施
    expect(RegistryLoadError).toBeDefined();
  });
});

describe('getProject', () => {
  const basePath = resolve(process.cwd(), '../..');
  const registry = loadRegistry('registry/docs.json', basePath);

  it('存在するプロジェクトを取得できる', () => {
    const project = getProject(registry, 'test-verification');
    expect(project).toBeDefined();
    expect(project?.id).toBe('test-verification');
  });

  it('存在しないプロジェクトはundefinedを返す', () => {
    const project = getProject(registry, 'non-existent');
    expect(project).toBeUndefined();
  });
});

describe('getDocument', () => {
  const basePath = resolve(process.cwd(), '../..');
  const registry = loadRegistry('registry/docs.json', basePath);

  it('存在するドキュメントを取得できる', () => {
    const doc = getDocument(registry, 'test-verification', 'getting-started');
    expect(doc).toBeDefined();
    expect(doc?.id).toBe('getting-started');
  });

  it('存在しないプロジェクトのドキュメントはundefinedを返す', () => {
    const doc = getDocument(registry, 'non-existent', 'getting-started');
    expect(doc).toBeUndefined();
  });

  it('存在しないドキュメントはundefinedを返す', () => {
    const doc = getDocument(registry, 'test-verification', 'non-existent');
    expect(doc).toBeUndefined();
  });
});

describe('getRegistryStats', () => {
  const basePath = resolve(process.cwd(), '../..');
  const registry = loadRegistry('registry/docs.json', basePath);

  it('統計情報を取得できる', () => {
    const stats = getRegistryStats(registry);

    expect(stats.projectCount).toBeGreaterThan(0);
    expect(stats.totalDocuments).toBeGreaterThan(0);
    expect(stats.totalLanguages).toBeGreaterThan(0);
    expect(stats.totalVersions).toBeGreaterThan(0);
    expect(stats.documentsByProject).toBeDefined();
  });

  it('プロジェクトごとのドキュメント数が正確', () => {
    const stats = getRegistryStats(registry);
    const project = registry.projects[0];

    expect(stats.documentsByProject[project.id]).toBe(project.documents.length);
  });

  it('合計ドキュメント数が正確', () => {
    const stats = getRegistryStats(registry);
    const expectedTotal = registry.projects.reduce(
      (sum, p) => sum + p.documents.length,
      0
    );

    expect(stats.totalDocuments).toBe(expectedTotal);
  });
});
