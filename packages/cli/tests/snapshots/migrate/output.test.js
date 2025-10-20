/**
 * migrate from-libx コマンドの出力スナップショットテスト
 *
 * レジストリ出力のスナップショットテスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
import migrateFromLibx from '../../../src/commands/migrate/from-libx.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = resolve(__dirname, '../../fixtures/migrate-from-libx/sample-small/apps/test-project');
const TEMP_DIR = resolve(__dirname, '../../tmp/migrate-snapshots');

describe('migrate from-libx (スナップショット)', () => {
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

  it('レジストリ出力が期待される構造と一致する', async () => {
    const targetPath = join(TEMP_DIR, 'docs-snapshot.json');

    const globalOpts = {
      dryRun: false,
      verbose: false,
    };

    const cmdOpts = {
      source: FIXTURES_DIR,
      projectId: 'test-project',
      target: targetPath,
      topPage: '/nonexistent/path',
      backup: join(TEMP_DIR, '.backups'),
    };

    await migrateFromLibx(globalOpts, cmdOpts);

    const registry = JSON.parse(readFileSync(targetPath, 'utf-8'));

    // 動的な値（日時、ハッシュ）を除外してスナップショット比較
    const normalizedRegistry = normalizeRegistry(registry);

    expect(normalizedRegistry).toMatchSnapshot();
  });

  it('プロジェクト構造のスナップショット', async () => {
    const targetPath = join(TEMP_DIR, 'docs-project-snapshot.json');

    const globalOpts = {
      dryRun: false,
      verbose: false,
    };

    const cmdOpts = {
      source: FIXTURES_DIR,
      projectId: 'test-project',
      target: targetPath,
      topPage: '/nonexistent/path',
      backup: join(TEMP_DIR, '.backups'),
    };

    await migrateFromLibx(globalOpts, cmdOpts);

    const registry = JSON.parse(readFileSync(targetPath, 'utf-8'));
    const project = registry.projects[0];

    // プロジェクト構造のスナップショット（コンテンツメタを除く）
    const projectStructure = {
      id: project.id,
      displayName: project.displayName,
      description: project.description,
      languages: project.languages,
      versions: project.versions,
      categories: project.categories.map(cat => ({
        id: cat.id,
        order: cat.order,
        name: cat.name,
        description: cat.description,
      })),
      documents: project.documents.map(doc => ({
        id: doc.id,
        slug: doc.slug,
        title: doc.title,
        description: doc.description,
        versions: doc.versions,
      })),
    };

    expect(projectStructure).toMatchSnapshot();
  });

  it('カテゴリとドキュメントの関連構造のスナップショット', async () => {
    const targetPath = join(TEMP_DIR, 'docs-structure-snapshot.json');

    const globalOpts = {
      dryRun: false,
      verbose: false,
    };

    const cmdOpts = {
      source: FIXTURES_DIR,
      projectId: 'test-project',
      target: targetPath,
      topPage: '/nonexistent/path',
      backup: join(TEMP_DIR, '.backups'),
    };

    await migrateFromLibx(globalOpts, cmdOpts);

    const registry = JSON.parse(readFileSync(targetPath, 'utf-8'));
    const project = registry.projects[0];

    // カテゴリとドキュメントの関連構造
    const structure = project.categories.map(cat => ({
      categoryId: cat.id,
      categoryName: cat.name,
      docs: cat.docs,
    }));

    expect(structure).toMatchSnapshot();
  });
});

/**
 * レジストリを正規化（動的な値を除外）
 *
 * @param {Object} registry - レジストリデータ
 * @returns {Object} 正規化されたレジストリデータ
 */
function normalizeRegistry(registry) {
  const normalized = JSON.parse(JSON.stringify(registry));

  // メタデータの日時を除外
  if (normalized.metadata) {
    delete normalized.metadata.createdAt;
    delete normalized.metadata.lastUpdated;
  }

  // プロジェクトごとに正規化
  if (normalized.projects) {
    for (const project of normalized.projects) {
      // ドキュメントのコンテンツメタを正規化
      if (project.documents) {
        for (const doc of project.documents) {
          if (doc.content) {
            for (const lang in doc.content) {
              const content = doc.content[lang];
              // 動的な値を除外
              delete content.syncHash;
              delete content.lastUpdated;
              delete content.reviewer;
              if (content.source) {
                delete content.source.commit;
                delete content.source.repository;
              }
            }
          }
        }
      }
    }
  }

  return normalized;
}
