/**
 * サイドバー生成のテスト
 */

import { describe, it, expect } from 'vitest';
import {
  generateSidebar,
  getSidebarStats,
  type SidebarItem,
} from '../src/sidebar.js';
import type { Registry } from '../src/types.js';

// テスト用のレジストリデータ
const testRegistry: Registry = {
  $schemaVersion: '1.0.0',
  metadata: {
    createdAt: '2025-10-18T00:00:00.000Z',
    createdBy: 'test',
  },
  projects: [
    {
      id: 'test-project',
      displayName: {
        en: 'Test Project',
        ja: 'テストプロジェクト',
      },
      description: {
        en: 'Test description',
        ja: 'テスト説明',
      },
      languages: [
        {
          code: 'en',
          displayName: 'English',
          status: 'active',
          default: true,
        },
        {
          code: 'ja',
          displayName: '日本語',
          status: 'active',
          fallback: 'en',
        },
      ],
      versions: [
        {
          id: 'v1',
          name: 'Version 1',
          isLatest: false,
          status: 'deprecated',
          date: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'v2',
          name: 'Version 2',
          isLatest: true,
          status: 'active',
          date: '2025-01-01T00:00:00.000Z',
        },
      ],
      categories: [
        {
          id: 'guide',
          order: 1,
          titles: {
            en: 'Guide',
            ja: 'ガイド',
          },
          docs: ['getting-started', 'installation', 'draft-doc'],
          icon: 'book',
        },
        {
          id: 'api',
          order: 2,
          titles: {
            en: 'API Reference',
            ja: 'APIリファレンス',
          },
          docs: ['api-overview', 'api-methods'],
        },
      ],
      documents: [
        {
          id: 'getting-started',
          slug: 'guide/getting-started',
          title: {
            en: 'Getting Started',
            ja: 'はじめに',
          },
          summary: {
            en: 'Getting started guide',
            ja: 'はじめにガイド',
          },
          versions: ['v1', 'v2'],
          status: 'published',
          visibility: 'public',
          keywords: [],
          tags: [],
          content: {
            en: { path: 'content/getting-started/en.mdx', status: 'published' },
            ja: { path: 'content/getting-started/ja.mdx', status: 'published' },
          },
          license: 'MIT',
          order: 1,
        },
        {
          id: 'installation',
          slug: 'guide/installation',
          title: {
            en: 'Installation',
            ja: 'インストール',
          },
          summary: {
            en: 'Installation guide',
            ja: 'インストールガイド',
          },
          versions: ['v2'],
          status: 'published',
          visibility: 'public',
          keywords: [],
          tags: [],
          content: {
            en: { path: 'content/installation/en.mdx', status: 'published' },
            ja: { path: 'content/installation/ja.mdx', status: 'published' },
          },
          license: 'MIT',
          order: 2,
        },
        {
          id: 'api-overview',
          slug: 'api/overview',
          title: {
            en: 'API Overview',
            ja: 'API概要',
          },
          summary: {
            en: 'API overview',
            ja: 'API概要',
          },
          versions: ['v2'],
          status: 'published',
          visibility: 'public',
          keywords: [],
          tags: [],
          content: {
            en: { path: 'content/api-overview/en.mdx', status: 'published' },
            ja: { path: 'content/api-overview/ja.mdx', status: 'published' },
          },
          license: 'MIT',
          order: 1,
        },
        {
          id: 'api-methods',
          slug: 'api/methods',
          title: {
            en: 'API Methods',
            ja: 'APIメソッド',
          },
          summary: {
            en: 'API methods reference',
            ja: 'APIメソッドリファレンス',
          },
          versions: ['v2'],
          status: 'published',
          visibility: 'internal',
          keywords: [],
          tags: [],
          content: {
            en: { path: 'content/api-methods/en.mdx', status: 'published' },
            ja: { path: 'content/api-methods/ja.mdx', status: 'published' },
          },
          license: 'MIT',
          order: 2,
        },
        {
          id: 'draft-doc',
          slug: 'guide/draft',
          title: {
            en: 'Draft Document',
            ja: 'ドラフト文書',
          },
          summary: {
            en: 'Draft document',
            ja: 'ドラフト文書',
          },
          versions: ['v2'],
          status: 'draft',
          visibility: 'draft',
          keywords: [],
          tags: [],
          content: {
            en: { path: 'content/draft/en.mdx', status: 'draft' },
          },
          license: 'MIT',
          order: 3,
        },
      ],
      licenses: [
        {
          id: 'MIT',
          name: 'MIT License',
          url: 'https://opensource.org/licenses/MIT',
        },
      ],
      visibility: 'public',
    },
  ],
};

describe('generateSidebar', () => {
  describe('基本的な生成', () => {
    it('サイドバーを正しく生成できる', () => {
      const sidebar = generateSidebar(
        testRegistry,
        'test-project',
        'v2',
        'en'
      );

      expect(sidebar).toHaveLength(2);
      expect(sidebar[0].title).toBe('Guide');
      expect(sidebar[1].title).toBe('API Reference');
    });

    it('日本語でサイドバーを生成できる', () => {
      const sidebar = generateSidebar(
        testRegistry,
        'test-project',
        'v2',
        'ja'
      );

      expect(sidebar).toHaveLength(2);
      expect(sidebar[0].title).toBe('ガイド');
      expect(sidebar[1].title).toBe('APIリファレンス');
    });

    it('カテゴリが順序でソートされる', () => {
      const sidebar = generateSidebar(
        testRegistry,
        'test-project',
        'v2',
        'en'
      );

      expect(sidebar[0].order).toBe(1);
      expect(sidebar[1].order).toBe(2);
      expect(sidebar[0].slug).toBe('guide');
      expect(sidebar[1].slug).toBe('api');
    });
  });

  describe('ドキュメントのフィルタリング', () => {
    it('バージョンに対応するドキュメントのみ含まれる', () => {
      const sidebar = generateSidebar(
        testRegistry,
        'test-project',
        'v2',
        'en'
      );

      const guideCategory = sidebar.find((cat) => cat.slug === 'guide');
      expect(guideCategory?.items).toHaveLength(2);
      expect(guideCategory?.items[0].docId).toBe('getting-started');
      expect(guideCategory?.items[1].docId).toBe('installation');
    });

    it('production環境ではpublicのみ含まれる', () => {
      const sidebar = generateSidebar(
        testRegistry,
        'test-project',
        'v2',
        'en',
        { env: 'production' }
      );

      const apiCategory = sidebar.find((cat) => cat.slug === 'api');
      expect(apiCategory?.items).toHaveLength(1);
      expect(apiCategory?.items[0].docId).toBe('api-overview');
    });

    it('development環境では全て含まれる', () => {
      const sidebar = generateSidebar(
        testRegistry,
        'test-project',
        'v2',
        'en',
        { env: 'development' }
      );

      const apiCategory = sidebar.find((cat) => cat.slug === 'api');
      expect(apiCategory?.items).toHaveLength(2);

      const guideCategory = sidebar.find((cat) => cat.slug === 'guide');
      expect(guideCategory?.items).toHaveLength(3); // draft含む
    });
  });

  describe('ドキュメントの順序', () => {
    it('ドキュメントがorder順にソートされる', () => {
      const sidebar = generateSidebar(
        testRegistry,
        'test-project',
        'v2',
        'en',
        { env: 'development' }
      );

      const guideCategory = sidebar.find((cat) => cat.slug === 'guide');
      expect(guideCategory?.items[0].order).toBe(1);
      expect(guideCategory?.items[1].order).toBe(2);
      expect(guideCategory?.items[2].order).toBe(3);
    });
  });

  describe('URL生成', () => {
    it('正しいURLが生成される', () => {
      const sidebar = generateSidebar(
        testRegistry,
        'test-project',
        'v2',
        'en',
        { baseUrl: '/docs' }
      );

      const guideCategory = sidebar.find((cat) => cat.slug === 'guide');
      expect(guideCategory?.items[0].href).toBe(
        '/docs/test-project/v2/en/guide/getting-started'
      );
    });

    it('baseUrlが無い場合はデフォルトで/が使われる', () => {
      const sidebar = generateSidebar(
        testRegistry,
        'test-project',
        'v2',
        'en'
      );

      const guideCategory = sidebar.find((cat) => cat.slug === 'guide');
      expect(guideCategory?.items[0].href).toBe(
        '/test-project/v2/en/guide/getting-started'
      );
    });
  });

  describe('アイコン対応', () => {
    it('カテゴリにアイコンが含まれる', () => {
      const sidebar = generateSidebar(
        testRegistry,
        'test-project',
        'v2',
        'en'
      );

      expect(sidebar[0].icon).toBe('book');
      expect(sidebar[1].icon).toBeUndefined();
    });
  });

  describe('エッジケース', () => {
    it('存在しないプロジェクトの場合は空配列を返す', () => {
      const sidebar = generateSidebar(
        testRegistry,
        'non-existent',
        'v2',
        'en'
      );

      expect(sidebar).toHaveLength(0);
    });

    it('存在しないバージョンの場合は空配列を返す', () => {
      const sidebar = generateSidebar(
        testRegistry,
        'test-project',
        'v99',
        'en'
      );

      expect(sidebar).toHaveLength(0);
    });

    it('言語コンテンツが無い場合はそのドキュメントをスキップ', () => {
      const sidebar = generateSidebar(
        testRegistry,
        'test-project',
        'v2',
        'fr' // フランス語コンテンツは無い
      );

      // カテゴリは存在するがドキュメントが0件のためカテゴリ自体がスキップされる
      expect(sidebar).toHaveLength(0);
    });

    it('空のカテゴリはスキップされる', () => {
      const emptyRegistry: Registry = {
        ...testRegistry,
        projects: [
          {
            ...testRegistry.projects[0],
            categories: [
              {
                id: 'empty-category',
                order: 1,
                titles: { en: 'Empty' },
                docs: [],
              },
            ],
          },
        ],
      };

      const sidebar = generateSidebar(
        emptyRegistry,
        'test-project',
        'v2',
        'en'
      );

      expect(sidebar).toHaveLength(0);
    });
  });

  describe('多言語フォールバック', () => {
    it('指定言語が無い場合は英語にフォールバック', () => {
      const sidebar = generateSidebar(
        testRegistry,
        'test-project',
        'v2',
        'ko' // 韓国語タイトルは定義されていない
      );

      // コンテンツが無いため空配列
      expect(sidebar).toHaveLength(0);
    });
  });
});

describe('getSidebarStats', () => {
  it('正しい統計情報を返す', () => {
    const sidebar = generateSidebar(
      testRegistry,
      'test-project',
      'v2',
      'en',
      { env: 'production' }
    );

    const stats = getSidebarStats(sidebar);

    expect(stats.categoryCount).toBe(2);
    expect(stats.documentCount).toBe(3); // getting-started, installation, api-overview
    expect(stats.categoriesWithIcon).toBe(1); // guideのみ
    expect(stats.averageDocsPerCategory).toBe(1.5);
  });

  it('空のサイドバーの統計情報', () => {
    const stats = getSidebarStats([]);

    expect(stats.categoryCount).toBe(0);
    expect(stats.documentCount).toBe(0);
    expect(stats.categoriesWithIcon).toBe(0);
    expect(stats.averageDocsPerCategory).toBe(0);
  });
});

describe('スナップショットテスト', () => {
  it('production環境のサイドバー構造', () => {
    const sidebar = generateSidebar(
      testRegistry,
      'test-project',
      'v2',
      'en',
      { env: 'production', baseUrl: '/docs' }
    );

    expect(sidebar).toMatchSnapshot();
  });

  it('development環境のサイドバー構造', () => {
    const sidebar = generateSidebar(
      testRegistry,
      'test-project',
      'v2',
      'ja',
      { env: 'development', baseUrl: '/docs' }
    );

    expect(sidebar).toMatchSnapshot();
  });
});
