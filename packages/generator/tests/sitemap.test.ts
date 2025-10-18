/**
 * サイトマップ生成のテスト
 */

import { describe, it, expect } from 'vitest';
import {
  generateSitemap,
  sitemapToXml,
  getSitemapStats,
  type SitemapEntry,
} from '../src/sitemap.js';
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
      categories: [],
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
          visibility: 'internal',
          keywords: [],
          tags: [],
          content: {
            en: { path: 'content/api-overview/en.mdx', status: 'published' },
            ja: { path: 'content/api-overview/ja.mdx', status: 'published' },
          },
          license: 'MIT',
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

describe('generateSitemap', () => {
  describe('基本的な生成', () => {
    it('サイトマップを正しく生成できる', () => {
      const sitemap = generateSitemap(
        testRegistry,
        'https://example.com',
        { env: 'development' }
      );

      expect(sitemap.length).toBeGreaterThan(0);
      expect(sitemap[0].url).toContain('https://example.com');
    });

    it('URLが正しいフォーマットで生成される', () => {
      const sitemap = generateSitemap(
        testRegistry,
        'https://example.com',
        { env: 'production' }
      );

      const entry = sitemap.find((e) =>
        e.url.includes('guide/getting-started')
      );
      expect(entry).toBeDefined();
      expect(entry?.url).toMatch(
        /^https:\/\/example\.com\/test-project\/v[12]\/[a-z]{2}\/guide\/getting-started$/
      );
    });

    it('ベースURLの末尾スラッシュを自動削除', () => {
      const sitemap = generateSitemap(
        testRegistry,
        'https://example.com/',
        { env: 'production' }
      );

      // https:// は正常なので、プロトコル以外で // が含まれていないことを確認
      const url = sitemap[0].url.replace('https://', '');
      expect(url).not.toContain('//');
    });
  });

  describe('Visibilityフィルタリング', () => {
    it('production環境ではpublicのみ含まれる', () => {
      const sitemap = generateSitemap(
        testRegistry,
        'https://example.com',
        { env: 'production' }
      );

      const hasInternal = sitemap.some((e) => e.url.includes('api/overview'));
      const hasDraft = sitemap.some((e) => e.url.includes('draft'));

      expect(hasInternal).toBe(false);
      expect(hasDraft).toBe(false);
    });

    it('development環境では全て含まれる', () => {
      const sitemap = generateSitemap(
        testRegistry,
        'https://example.com',
        { env: 'development' }
      );

      const hasPublic = sitemap.some((e) =>
        e.url.includes('guide/getting-started')
      );
      const hasInternal = sitemap.some((e) => e.url.includes('api/overview'));
      const hasDraft = sitemap.some((e) => e.url.includes('draft'));

      expect(hasPublic).toBe(true);
      expect(hasInternal).toBe(true);
      expect(hasDraft).toBe(true);
    });
  });

  describe('バージョンと言語の組み合わせ', () => {
    it('全てのバージョン×言語の組み合わせが生成される', () => {
      const sitemap = generateSitemap(
        testRegistry,
        'https://example.com',
        { env: 'development' }
      );

      // getting-started: v1×2言語 + v2×2言語 = 4
      const gettingStartedUrls = sitemap.filter((e) =>
        e.url.includes('guide/getting-started')
      );
      expect(gettingStartedUrls).toHaveLength(4);

      // 英語版のv1とv2
      const enUrls = gettingStartedUrls.filter((e) => e.url.includes('/en/'));
      expect(enUrls).toHaveLength(2);

      // 日本語版のv1とv2
      const jaUrls = gettingStartedUrls.filter((e) => e.url.includes('/ja/'));
      expect(jaUrls).toHaveLength(2);
    });
  });

  describe('優先度設定', () => {
    it('最新バージョンの優先度が高い', () => {
      const sitemap = generateSitemap(
        testRegistry,
        'https://example.com',
        {
          env: 'production',
          defaultPriority: 0.5,
          latestVersionPriorityBoost: 0.3,
        }
      );

      const v2Entry = sitemap.find((e) => e.url.includes('/v2/'));
      const v1Entry = sitemap.find((e) => e.url.includes('/v1/'));

      expect(v2Entry?.priority).toBe(0.8); // 0.5 + 0.3
      expect(v1Entry?.priority).toBe(0.5);
    });

    it('優先度が1.0を超えない', () => {
      const sitemap = generateSitemap(
        testRegistry,
        'https://example.com',
        {
          env: 'production',
          defaultPriority: 0.9,
          latestVersionPriorityBoost: 0.5, // 合計1.4になるが1.0にクリップされる
        }
      );

      const v2Entry = sitemap.find((e) => e.url.includes('/v2/'));
      expect(v2Entry?.priority).toBe(1.0);
    });
  });

  describe('変更頻度設定', () => {
    it('デフォルトの変更頻度が適用される', () => {
      const sitemap = generateSitemap(
        testRegistry,
        'https://example.com',
        {
          env: 'production',
          defaultChangefreq: 'daily',
        }
      );

      expect(sitemap[0].changefreq).toBe('daily');
    });
  });

  describe('エッジケース', () => {
    it('ドキュメントが無い場合は空配列', () => {
      const emptyRegistry: Registry = {
        ...testRegistry,
        projects: [
          {
            ...testRegistry.projects[0],
            documents: [],
          },
        ],
      };

      const sitemap = generateSitemap(
        emptyRegistry,
        'https://example.com'
      );

      expect(sitemap).toHaveLength(0);
    });
  });
});

describe('sitemapToXml', () => {
  it('正しいXMLフォーマットで出力される', () => {
    const entries: SitemapEntry[] = [
      {
        url: 'https://example.com/page1',
        lastmod: '2025-10-18T00:00:00.000Z',
        changefreq: 'weekly',
        priority: 0.8,
      },
      {
        url: 'https://example.com/page2',
        priority: 0.5,
      },
    ];

    const xml = sitemapToXml(entries);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://example.com/page1</loc>');
    expect(xml).toContain('<lastmod>2025-10-18T00:00:00.000Z</lastmod>');
    expect(xml).toContain('<changefreq>weekly</changefreq>');
    expect(xml).toContain('<priority>0.8</priority>');
    expect(xml).toContain('</urlset>');
  });

  it('XML特殊文字をエスケープ', () => {
    const entries: SitemapEntry[] = [
      {
        url: 'https://example.com/page?foo=1&bar=2',
      },
    ];

    const xml = sitemapToXml(entries);

    expect(xml).toContain('foo=1&amp;bar=2');
  });

  it('空の配列でも正しいXML構造を返す', () => {
    const xml = sitemapToXml([]);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset');
    expect(xml).toContain('</urlset>');
  });
});

describe('getSitemapStats', () => {
  it('正しい統計情報を返す', () => {
    const entries: SitemapEntry[] = [
      { url: 'https://example.com/page1', priority: 0.8, changefreq: 'weekly' },
      { url: 'https://example.com/page2', priority: 0.8, changefreq: 'daily' },
      { url: 'https://example.com/page3', priority: 0.5, changefreq: 'weekly' },
    ];

    const stats = getSitemapStats(entries);

    expect(stats.totalUrls).toBe(3);
    expect(stats.urlsByPriority['0.8']).toBe(2);
    expect(stats.urlsByPriority['0.5']).toBe(1);
    expect(stats.urlsByChangefreq['weekly']).toBe(2);
    expect(stats.urlsByChangefreq['daily']).toBe(1);
  });

  it('空の配列の統計情報', () => {
    const stats = getSitemapStats([]);

    expect(stats.totalUrls).toBe(0);
    expect(stats.urlsByPriority).toEqual({});
    expect(stats.urlsByChangefreq).toEqual({});
  });
});

describe('スナップショットテスト', () => {
  it('production環境のサイトマップ構造', () => {
    const sitemap = generateSitemap(
      testRegistry,
      'https://libx.dev',
      {
        env: 'production',
        defaultChangefreq: 'weekly',
        defaultPriority: 0.5,
        latestVersionPriorityBoost: 0.3,
      }
    );

    expect(sitemap).toMatchSnapshot();
  });

  it('XML出力のスナップショット', () => {
    const sitemap = generateSitemap(
      testRegistry,
      'https://libx.dev',
      {
        env: 'production',
        defaultChangefreq: 'weekly',
        defaultPriority: 0.5,
      }
    );

    const xml = sitemapToXml(sitemap);
    // 日時を除外してスナップショット比較（日時は常に変わるため）
    const xmlWithoutDate = xml.replace(
      /<lastmod>.*?<\/lastmod>/g,
      '<lastmod>TIMESTAMP</lastmod>'
    );

    expect(xmlWithoutDate).toMatchSnapshot();
  });
});
