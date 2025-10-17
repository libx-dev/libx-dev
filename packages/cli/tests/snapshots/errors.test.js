/**
 * エラーメッセージのスナップショットテスト
 *
 * エラーメッセージの一貫性を保証するためのテスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ValidationErrorCollection, ValidationError, ValidationWarning } from '../../../validator/src/index.js';
import { RegistryManager } from '../../src/utils/registry.js';
import { setupTest } from '../helpers/fixtures.js';

describe('エラーメッセージスナップショット', () => {
  let testEnv;

  beforeEach(() => {
    testEnv = setupTest('snapshot');
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('RegistryManagerエラー', () => {
    it('存在しないプロジェクトエラー', () => {
      const manager = new RegistryManager({
        registryPath: 'registry/docs.json',
        projectRoot: testEnv.tempDir,
      });
      manager.load();

      try {
        manager.findProject('nonexistent');
        manager.updateProject('nonexistent', { displayName: { en: 'Test' } });
      } catch (error) {
        expect(error.message).toMatchSnapshot();
      }
    });

    it('重複プロジェクトエラー', () => {
      const manager = new RegistryManager({
        registryPath: 'registry/docs.json',
        projectRoot: testEnv.tempDir,
        validateOnSave: false,
      });
      manager.load();

      try {
        manager.addProject({
          id: 'test-project-1',
          displayName: { en: 'Duplicate' },
        });
      } catch (error) {
        expect(error.message).toMatchSnapshot();
      }
    });

    it('存在しないドキュメントエラー', () => {
      const manager = new RegistryManager({
        registryPath: 'registry/docs.json',
        projectRoot: testEnv.tempDir,
      });
      manager.load();

      try {
        manager.updateDocument('test-project-1', 'nonexistent', { title: { en: 'Test' } });
      } catch (error) {
        expect(error.message).toMatchSnapshot();
      }
    });
  });

  describe('ValidationErrorCollection', () => {
    it('単一エラーの文字列表現', () => {
      const collection = new ValidationErrorCollection();
      const error = new ValidationError(
        'MISSING_FIELD',
        'Required field "displayName" is missing',
        null,
        'projects[0].displayName'
      );
      collection.add(error);

      expect(collection.toString()).toMatchSnapshot();
    });

    it('複数エラーと警告の文字列表現', () => {
      const collection = new ValidationErrorCollection();
      collection.add(new ValidationError('MISSING_FIELD', 'Required field "displayName" is missing'));
      collection.add(new ValidationError('INVALID_ID', 'Project ID contains invalid characters'));
      collection.add(new ValidationWarning('DEPRECATED_FIELD', 'Field "oldField" is deprecated'));

      expect(collection.toString()).toMatchSnapshot();
    });

    it('エラー件数サマリー', () => {
      const collection = new ValidationErrorCollection();
      collection.add(new ValidationError('ERROR_1', 'Error 1'));
      collection.add(new ValidationError('ERROR_2', 'Error 2'));
      collection.add(new ValidationWarning('WARNING_1', 'Warning 1'));

      const summary = collection.getSummary();
      expect(summary).toMatchSnapshot();
    });
  });

  describe('Logger出力形式', () => {
    it('JSONモード出力形式', () => {
      const logEntry = {
        level: 'error',
        message: 'Failed to load registry',
        data: {
          path: 'registry/docs.json',
          error: 'File not found',
        },
        timestamp: '2025-01-01T00:00:00.000Z',
      };

      expect(JSON.stringify(logEntry, null, 2)).toMatchSnapshot();
    });
  });
});
