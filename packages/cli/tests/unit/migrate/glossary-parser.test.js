/**
 * glossary-parser.js のユニットテスト
 *
 * Glossary解析ロジックのテスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { parseGlossary } from '../../../src/commands/migrate/glossary-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMP_DIR = resolve(__dirname, '../../tmp/glossary-parser');

describe('glossary-parser', () => {
  beforeEach(() => {
    // 一時ディレクトリを作成
    if (!existsSync(TEMP_DIR)) {
      mkdirSync(TEMP_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // 一時ディレクトリをクリーンアップ
    if (existsSync(TEMP_DIR)) {
      rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  });

  describe('parseGlossary', () => {
    it('glossary.json が存在する場合、解析できる', () => {
      // glossary.jsonを作成（src/content/配下）
      const glossaryDir = join(TEMP_DIR, 'src/content');
      mkdirSync(glossaryDir, { recursive: true });

      const glossaryFile = join(glossaryDir, 'glossary.json');
      writeFileSync(
        glossaryFile,
        JSON.stringify({
          terms: [
            {
              id: 'api',
              term: 'API',
              titles: {
                en: 'API',
                ja: 'API',
              },
              definition: {
                en: 'Application Programming Interface',
                ja: 'アプリケーションプログラミングインターフェース',
              },
            },
            {
              id: 'cli',
              term: 'CLI',
              titles: {
                en: 'CLI',
                ja: 'CLI',
              },
              definition: {
                en: 'Command Line Interface',
                ja: 'コマンドラインインターフェース',
              },
            },
          ],
        })
      );

      const glossary = parseGlossary(TEMP_DIR, 'test-project');

      expect(glossary).toHaveLength(2);
      expect(glossary[0].id).toBe('api');
      expect(glossary[0].term).toBe('API');
      expect(glossary[0].titles.en).toBe('API');
      expect(glossary[0].definition.en).toBe('Application Programming Interface');
      expect(glossary[1].id).toBe('cli');
    });

    it('glossary.json が存在しない場合、空配列を返す', () => {
      const glossary = parseGlossary(TEMP_DIR, 'test-project');

      expect(glossary).toEqual([]);
    });

    it('glossary.json が不正な形式の場合、空配列を返す', () => {
      // 不正なJSONを作成（src/content/配下）
      const glossaryDir = join(TEMP_DIR, 'src/content');
      mkdirSync(glossaryDir, { recursive: true });

      const glossaryFile = join(glossaryDir, 'glossary.json');
      writeFileSync(glossaryFile, '{ invalid json }');

      const glossary = parseGlossary(TEMP_DIR, 'test-project');

      expect(glossary).toEqual([]);
    });

    it('glossary項目にslugを自動生成する', () => {
      const glossaryDir = join(TEMP_DIR, 'src/content');
      mkdirSync(glossaryDir, { recursive: true });

      const glossaryFile = join(glossaryDir, 'glossary.json');
      writeFileSync(
        glossaryFile,
        JSON.stringify({
          terms: [
            {
              id: 'api',
              term: 'API',
              titles: {
                en: 'API',
              },
              definition: {
                en: 'Application Programming Interface',
              },
            },
          ],
        })
      );

      const glossary = parseGlossary(TEMP_DIR, 'test-project');

      expect(glossary[0].id).toBe('api');
    });

    it('重複するIDがある場合、既存の実装では重複チェックしない', () => {
      const glossaryDir = join(TEMP_DIR, 'src/content');
      mkdirSync(glossaryDir, { recursive: true });

      const glossaryFile = join(glossaryDir, 'glossary.json');
      writeFileSync(
        glossaryFile,
        JSON.stringify({
          terms: [
            {
              id: 'api',
              term: 'API',
              titles: {
                en: 'API',
              },
              definition: {
                en: 'Application Programming Interface',
              },
            },
            {
              id: 'api-2',
              term: 'API (Second)',
              titles: {
                en: 'API (Second)',
              },
              definition: {
                en: 'Another API definition',
              },
            },
          ],
        })
      );

      const glossary = parseGlossary(TEMP_DIR, 'test-project');

      expect(glossary[0].id).toBe('api');
      expect(glossary[1].id).toBe('api-2');
    });
  });
});
