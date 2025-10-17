/**
 * add project コマンドの統合テスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RegistryManager } from '../../src/utils/registry.js';
import { setupTest } from '../helpers/fixtures.js';

describe('add project 統合テスト', () => {
  let testEnv;
  let manager;

  beforeEach(() => {
    testEnv = setupTest('add-project');
    manager = new RegistryManager({
      registryPath: 'registry/docs.json',
      projectRoot: testEnv.tempDir,
      validateOnSave: false,
    });
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  it('プロジェクト追加の完全ワークフロー', () => {
    // レジストリ読み込み
    manager.load();

    // 初期状態確認
    const initialProjects = manager.get().projects;
    const initialCount = initialProjects.length;

    // プロジェクト追加
    const newProject = {
      id: 'integration-test-project',
      displayName: {
        en: 'Integration Test Project',
        ja: '統合テストプロジェクト',
      },
      description: {
        en: 'Project created by integration test',
        ja: '統合テストで作成されたプロジェクト',
      },
      defaultVersion: 'v1',
      defaultLanguage: 'en',
      versions: [
        {
          id: 'v1',
          label: 'v1.0',
          status: 'stable',
          releaseDate: '2025-01-01',
        },
      ],
      languages: [
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
      ],
      documents: [],
    };

    manager.addProject(newProject);

    // プロジェクトが追加されたことを確認
    const addedProject = manager.findProject('integration-test-project');
    expect(addedProject).toBeDefined();
    expect(addedProject.displayName.en).toBe('Integration Test Project');

    // レジストリ保存
    manager.save();

    // 再読み込みして永続化を確認
    const reloadedManager = new RegistryManager({
      registryPath: 'registry/docs.json',
      projectRoot: testEnv.tempDir,
      validateOnSave: false,
    });
    reloadedManager.load();

    const reloadedProject = reloadedManager.findProject('integration-test-project');
    expect(reloadedProject).toBeDefined();
    expect(reloadedProject.displayName.en).toBe('Integration Test Project');
    expect(reloadedProject.versions).toHaveLength(1);
    expect(reloadedProject.languages).toHaveLength(2);

    // プロジェクト数が増えていることを確認
    const finalProjects = reloadedManager.get().projects;
    expect(finalProjects.length).toBe(initialCount + 1);
  });

  it('バリデーションエラーがある場合は保存されない', () => {
    manager.validateOnSave = true;
    manager.load();

    // 不正なプロジェクトを追加
    const invalidProject = {
      id: 'invalid-project',
      // 必須フィールドが欠落
    };

    manager.addProject(invalidProject);

    // バリデーションエラーで保存失敗
    expect(() => manager.save()).toThrow();
  });

  it('バックアップとロールバックの連携', () => {
    manager.load();

    const originalRegistry = JSON.parse(JSON.stringify(manager.get()));

    // プロジェクト追加
    const newProject = {
      id: 'backup-test-project',
      displayName: { en: 'Backup Test', ja: 'バックアップテスト' },
      description: { en: 'Test', ja: 'テスト' },
      defaultVersion: 'v1',
      defaultLanguage: 'en',
      documents: [],
    };

    manager.addProject(newProject);

    // 追加されたことを確認
    expect(manager.findProject('backup-test-project')).toBeDefined();

    // ロールバック（手動でレジストリを元に戻す）
    manager.registry = originalRegistry;

    // ロールバック後はプロジェクトが存在しない
    expect(manager.findProject('backup-test-project')).toBeUndefined();
  });
});
