/**
 * メタデータ生成のテスト
 */

import { describe, it, expect } from 'vitest';
import {
  generateRobotsTxt,
  generateManifest,
  generateOpenGraph,
  openGraphToHtml,
} from '../src/metadata.js';
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
        en: 'A comprehensive test project for documentation',
        ja: 'ドキュメント用の包括的なテストプロジェクト',
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
      versions: [],
      categories: [],
      documents: [],
      licenses: [],
      visibility: 'public',
    },
  ],
};

describe('generateRobotsTxt', () => {
  it('基本的なrobots.txtを生成', () => {
    const robotsTxt = generateRobotsTxt('https://example.com');

    expect(robotsTxt).toContain('User-agent: *');
    expect(robotsTxt).toContain('Allow: /');
    expect(robotsTxt).toContain('Sitemap: https://example.com/sitemap.xml');
  });

  it('追加のDisallowルールを含む', () => {
    const robotsTxt = generateRobotsTxt('https://example.com', {
      additionalDisallow: ['/admin', '/api'],
    });

    expect(robotsTxt).toContain('Disallow: /admin');
    expect(robotsTxt).toContain('Disallow: /api');
  });

  it('クローリング遅延を設定', () => {
    const robotsTxt = generateRobotsTxt('https://example.com', {
      crawlDelay: 10,
    });

    expect(robotsTxt).toContain('Crawl-delay: 10');
  });

  it('カスタムサイトマップURLを設定', () => {
    const robotsTxt = generateRobotsTxt('https://example.com', {
      sitemapUrl: '/custom-sitemap.xml',
    });

    expect(robotsTxt).toContain('Sitemap: https://example.com/custom-sitemap.xml');
  });

  it('絶対URLサイトマップを設定', () => {
    const robotsTxt = generateRobotsTxt('https://example.com', {
      sitemapUrl: 'https://cdn.example.com/sitemap.xml',
    });

    expect(robotsTxt).toContain('Sitemap: https://cdn.example.com/sitemap.xml');
  });

  it('ベースURLの末尾スラッシュを自動削除', () => {
    const robotsTxt = generateRobotsTxt('https://example.com/');

    expect(robotsTxt).not.toContain('example.com//');
  });
});

describe('generateManifest', () => {
  it('基本的なmanifest.jsonを生成', () => {
    const manifest = generateManifest(testRegistry, 'test-project');

    expect(manifest).not.toBeNull();
    expect(manifest?.name).toBe('Test Project');
    expect(manifest?.description).toBe(
      'A comprehensive test project for documentation'
    );
    expect(manifest?.start_url).toBe('/');
    expect(manifest?.display).toBe('standalone');
  });

  it('日本語でmanifestを生成', () => {
    const manifest = generateManifest(testRegistry, 'test-project', {
      lang: 'ja',
    });

    expect(manifest?.name).toBe('テストプロジェクト');
    expect(manifest?.description).toBe(
      'ドキュメント用の包括的なテストプロジェクト'
    );
    expect(manifest?.lang).toBe('ja');
  });

  it('短縮名を自動生成（12文字制限）', () => {
    const manifest = generateManifest(testRegistry, 'test-project');

    expect(manifest?.short_name).toBe('Test Project');
    expect(manifest?.short_name.length).toBeLessThanOrEqual(15); // "..."を含めて15文字以内
  });

  it('カスタム設定を適用', () => {
    const manifest = generateManifest(testRegistry, 'test-project', {
      startUrl: '/home',
      display: 'fullscreen',
      backgroundColor: '#ffffff',
      themeColor: '#1e40af',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
      ],
    });

    expect(manifest?.start_url).toBe('/home');
    expect(manifest?.display).toBe('fullscreen');
    expect(manifest?.background_color).toBe('#ffffff');
    expect(manifest?.theme_color).toBe('#1e40af');
    expect(manifest?.icons).toHaveLength(1);
    expect(manifest?.icons[0].src).toBe('/icon-192.png');
  });

  it('存在しないプロジェクトの場合はnullを返す', () => {
    const manifest = generateManifest(testRegistry, 'non-existent');

    expect(manifest).toBeNull();
  });
});

describe('generateOpenGraph', () => {
  it('基本的なOpenGraphメタデータを生成', () => {
    const og = generateOpenGraph(
      'Getting Started',
      'Learn how to get started',
      'https://example.com/guide/getting-started'
    );

    expect(og['og:title']).toBe('Getting Started');
    expect(og['og:description']).toBe('Learn how to get started');
    expect(og['og:type']).toBe('website');
    expect(og['og:url']).toBe('https://example.com/guide/getting-started');
    expect(og['og:locale']).toBe('en');
  });

  it('カスタムオプションを適用', () => {
    const og = generateOpenGraph(
      'API Reference',
      'Complete API documentation',
      'https://example.com/api',
      {
        type: 'article',
        imageUrl: 'https://example.com/og-image.png',
        siteName: 'Example Docs',
        lang: 'ja',
      }
    );

    expect(og['og:type']).toBe('article');
    expect(og['og:image']).toBe('https://example.com/og-image.png');
    expect(og['og:site_name']).toBe('Example Docs');
    expect(og['og:locale']).toBe('ja');
  });

  it('言語コードのハイフンをアンダースコアに変換', () => {
    const og = generateOpenGraph(
      'Title',
      'Description',
      'https://example.com',
      { lang: 'en-US' }
    );

    expect(og['og:locale']).toBe('en_US');
  });
});

describe('openGraphToHtml', () => {
  it('HTMLメタタグを生成', () => {
    const og = generateOpenGraph(
      'Getting Started',
      'Learn how to get started',
      'https://example.com/guide/getting-started'
    );

    const html = openGraphToHtml(og);

    expect(html).toContain('<meta property="og:title" content="Getting Started" />');
    expect(html).toContain(
      '<meta property="og:description" content="Learn how to get started" />'
    );
    expect(html).toContain('<meta property="og:type" content="website" />');
    expect(html).toContain(
      '<meta property="og:url" content="https://example.com/guide/getting-started" />'
    );
  });

  it('HTML特殊文字をエスケープ', () => {
    const og = generateOpenGraph(
      'Title with <tags> & "quotes"',
      'Description with special chars',
      'https://example.com'
    );

    const html = openGraphToHtml(og);
    const titleTag = html.find((tag) => tag.includes('og:title'));

    expect(titleTag).toContain('&lt;tags&gt;');
    expect(titleTag).toContain('&amp;');
    expect(titleTag).toContain('&quot;');
  });
});

describe('スナップショットテスト', () => {
  it('robots.txtのスナップショット', () => {
    const robotsTxt = generateRobotsTxt('https://libx.dev', {
      sitemapUrl: '/sitemap.xml',
      additionalDisallow: ['/admin', '/private'],
      crawlDelay: 5,
    });

    expect(robotsTxt).toMatchSnapshot();
  });

  it('manifest.jsonのスナップショット', () => {
    const manifest = generateManifest(testRegistry, 'test-project', {
      lang: 'ja',
      themeColor: '#1e40af',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    });

    expect(manifest).toMatchSnapshot();
  });

  it('OpenGraphメタデータのスナップショット', () => {
    const og = generateOpenGraph(
      'Getting Started Guide',
      'Learn how to get started with our platform',
      'https://libx.dev/docs/guide/getting-started',
      {
        type: 'article',
        imageUrl: 'https://libx.dev/og-image.png',
        siteName: 'LibX Documentation',
        lang: 'en',
      }
    );

    expect(og).toMatchSnapshot();
  });
});
