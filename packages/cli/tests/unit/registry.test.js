/**
 * RegistryManagerクラスのユニットテスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { RegistryManager, createRegistryManager } from '../../src/utils/registry.js';
import { setupTest, createTestRegistry } from '../helpers/fixtures.js';

describe('RegistryManager', () => {
  let testEnv;
  let manager;

  beforeEach(() => {
    testEnv = setupTest('registry');
    manager = new RegistryManager({
      registryPath: 'registry/docs.json',
      projectRoot: testEnv.tempDir,
      validateOnSave: false, // テストではバリデーションを無効化
    });
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('基本機能', () => {
    it('RegistryManagerインスタンスを作成できる', () => {
      expect(manager).toBeInstanceOf(RegistryManager);
      expect(manager.registryPath).toBe('registry/docs.json');
      expect(manager.projectRoot).toBe(testEnv.tempDir);
    });

    it('createRegistryManager関数でインスタンスを作成できる', () => {
      const m = createRegistryManager({
        registryPath: 'registry/docs.json',
        projectRoot: testEnv.tempDir,
      });
      expect(m).toBeInstanceOf(RegistryManager);
    });

    it('レジストリを読み込める', () => {
      const registry = manager.load();
      expect(registry).toHaveProperty('$schemaVersion');
      expect(registry).toHaveProperty('projects');
    });

    it('レジストリを保存できる', () => {
      const registry = manager.load();
      registry.metadata.note = 'test';

      manager.save(registry);

      // 再読み込みして確認
      const reloaded = manager.load();
      expect(reloaded.metadata.note).toBe('test');
      expect(reloaded.metadata.lastModified).toBeDefined();
    });

    it('存在しないパスを読み込もうとするとエラー', () => {
      const invalidManager = new RegistryManager({
        registryPath: 'nonexistent.json',
        projectRoot: testEnv.tempDir,
      });

      expect(() => invalidManager.load()).toThrow();
    });
  });

  describe('プロジェクト操作', () => {
    it('プロジェクトを検索できる', () => {
      manager.load();
      const project = manager.findProject('test-project-1');
      expect(project).toBeDefined();
      expect(project.id).toBe('test-project-1');
    });

    it('存在しないプロジェクトはnullを返す', () => {
      manager.load();
      const project = manager.findProject('nonexistent');
      expect(project).toBeUndefined();
    });

    it('プロジェクトを追加できる', () => {
      manager.load();
      const newProject = {
        id: 'new-project',
        displayName: { en: 'New Project', ja: '新規プロジェクト' },
        description: { en: 'Test', ja: 'テスト' },
        defaultVersion: 'v1',
        defaultLanguage: 'en',
        documents: [],
      };

      manager.addProject(newProject);
      const found = manager.findProject('new-project');
      expect(found).toEqual(newProject);
    });

    it('重複したプロジェクトIDは追加できない', () => {
      manager.load();
      const duplicate = {
        id: 'test-project-1',
        displayName: { en: 'Duplicate', ja: '重複' },
      };

      expect(() => manager.addProject(duplicate)).toThrow(/既に存在します/);
    });

    it('プロジェクトを更新できる', () => {
      manager.load();
      manager.updateProject('test-project-1', {
        displayName: { en: 'Updated', ja: '更新済み' },
      });

      const updated = manager.findProject('test-project-1');
      expect(updated.displayName.en).toBe('Updated');
      expect(updated.displayName.ja).toBe('更新済み');
    });

    it('存在しないプロジェクトを更新しようとするとエラー', () => {
      manager.load();
      expect(() => {
        manager.updateProject('nonexistent', { displayName: { en: 'Test' } });
      }).toThrow(/が見つかりません/);
    });

    it('プロジェクトを削除できる', () => {
      manager.load();
      const removed = manager.removeProject('test-project-1');
      expect(removed.id).toBe('test-project-1');

      const found = manager.findProject('test-project-1');
      expect(found).toBeUndefined();
    });

    it('存在しないプロジェクトを削除しようとするとエラー', () => {
      manager.load();
      expect(() => manager.removeProject('nonexistent')).toThrow(/が見つかりません/);
    });
  });

  describe('ドキュメント操作', () => {
    it('ドキュメントを検索できる（ID指定）', () => {
      manager.load();
      const doc = manager.findDocument('test-project-1', 'test-project-1-001');
      expect(doc).toBeDefined();
      expect(doc.id).toBe('test-project-1-001');
    });

    it('ドキュメントを検索できる（slug指定）', () => {
      manager.load();
      const doc = manager.findDocument('test-project-1', 'doc-1');
      expect(doc).toBeDefined();
      expect(doc.slug).toBe('doc-1');
    });

    it('存在しないドキュメントはnullを返す', () => {
      manager.load();
      const doc = manager.findDocument('test-project-1', 'nonexistent');
      expect(doc).toBeUndefined();
    });

    it('ドキュメントを追加できる', () => {
      manager.load();
      const newDoc = {
        id: 'test-project-1-003',
        slug: 'new-doc',
        title: { en: 'New Doc', ja: '新規ドキュメント' },
        category: 'general',
        order: 3,
      };

      manager.addDocument('test-project-1', newDoc);
      const found = manager.findDocument('test-project-1', 'test-project-1-003');
      expect(found).toEqual(newDoc);
    });

    it('重複したドキュメントIDは追加できない', () => {
      manager.load();
      const duplicate = {
        id: 'test-project-1-001',
        slug: 'duplicate',
        title: { en: 'Duplicate' },
      };

      expect(() => {
        manager.addDocument('test-project-1', duplicate);
      }).toThrow(/既に存在します/);
    });

    it('ドキュメントを更新できる', () => {
      manager.load();
      manager.updateDocument('test-project-1', 'test-project-1-001', {
        title: { en: 'Updated', ja: '更新済み' },
      });

      const updated = manager.findDocument('test-project-1', 'test-project-1-001');
      expect(updated.title.en).toBe('Updated');
    });

    it('ドキュメントを削除できる（ID指定）', () => {
      manager.load();
      const removed = manager.removeDocument('test-project-1', 'test-project-1-001');
      expect(removed.id).toBe('test-project-1-001');

      const found = manager.findDocument('test-project-1', 'test-project-1-001');
      expect(found).toBeUndefined();
    });

    it('ドキュメントを削除できる（slug指定）', () => {
      manager.load();
      const removed = manager.removeDocument('test-project-1', 'doc-1');
      expect(removed.slug).toBe('doc-1');
    });
  });

  describe('バージョン操作', () => {
    it('バージョンを追加できる', () => {
      manager.load();
      const newVersion = {
        id: 'v2',
        label: 'v2.0',
        status: 'stable',
        releaseDate: '2025-02-01',
      };

      manager.addVersion('test-project-1', newVersion);
      const project = manager.findProject('test-project-1');
      expect(project.versions).toContainEqual(newVersion);
    });

    it('重複したバージョンIDは追加できない', () => {
      manager.load();
      const duplicate = {
        id: 'v1',
        label: 'v1.1',
      };

      expect(() => {
        manager.addVersion('test-project-1', duplicate);
      }).toThrow(/既に存在します/);
    });

    it('バージョンを更新できる', () => {
      manager.load();
      manager.updateVersion('test-project-1', 'v1', { label: 'v1.1' });

      const project = manager.findProject('test-project-1');
      const version = project.versions.find(v => v.id === 'v1');
      expect(version.label).toBe('v1.1');
    });

    it('バージョンを削除できる', () => {
      manager.load();
      const removed = manager.removeVersion('test-project-1', 'v1');
      expect(removed.id).toBe('v1');

      const project = manager.findProject('test-project-1');
      const version = project.versions?.find(v => v.id === 'v1');
      expect(version).toBeUndefined();
    });
  });

  describe('言語操作', () => {
    it('言語を追加できる', () => {
      manager.load();
      const newLang = {
        code: 'zh-Hans',
        displayName: '简体中文',
        status: 'active',
      };

      manager.addLanguage('test-project-1', newLang);
      const project = manager.findProject('test-project-1');
      expect(project.languages).toContainEqual(newLang);
    });

    it('重複した言語コードは追加できない', () => {
      manager.load();
      const duplicate = {
        code: 'en',
        displayName: 'English (US)',
      };

      expect(() => {
        manager.addLanguage('test-project-1', duplicate);
      }).toThrow(/既に存在します/);
    });

    it('言語を更新できる', () => {
      manager.load();
      manager.updateLanguage('test-project-1', 'en', { displayName: 'English (Updated)' });

      const project = manager.findProject('test-project-1');
      const lang = project.languages.find(l => l.code === 'en');
      expect(lang.displayName).toBe('English (Updated)');
    });

    it('言語を削除できる', () => {
      manager.load();
      const removed = manager.removeLanguage('test-project-1', 'en');
      expect(removed.code).toBe('en');

      const project = manager.findProject('test-project-1');
      const lang = project.languages?.find(l => l.code === 'en');
      expect(lang).toBeUndefined();
    });
  });

  describe('ドキュメントID自動採番', () => {
    it('既存ドキュメントがない場合は001から開始', () => {
      const emptyRegistry = createTestRegistry({ documentCount: 0 });
      const registryPath = path.join(testEnv.tempDir, 'registry', 'empty.json');
      fs.writeFileSync(registryPath, JSON.stringify(emptyRegistry, null, 2));

      const emptyManager = new RegistryManager({
        registryPath: 'registry/empty.json',
        projectRoot: testEnv.tempDir,
      });
      emptyManager.load();

      const nextId = emptyManager.getNextDocId('test-project-1');
      expect(nextId).toBe('test-project-1-001');
    });

    it('既存ドキュメントがある場合は次の番号を生成', () => {
      manager.load();
      const nextId = manager.getNextDocId('test-project-1');
      expect(nextId).toBe('test-project-1-003');
    });

    it('存在しないプロジェクトの場合はエラー', () => {
      manager.load();
      expect(() => {
        manager.getNextDocId('nonexistent');
      }).toThrow(/が見つかりません/);
    });
  });
});
