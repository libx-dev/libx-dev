/**
 * メタデータ生成
 *
 * robots.txt、manifest.json、OpenGraphメタデータなどを生成します。
 */

import type { Registry, LocalizedString } from './types.js';

/**
 * robots.txt生成オプション
 */
export interface GenerateRobotsTxtOptions {
  /**
   * サイトマップURL（相対パスまたは絶対URL）
   */
  sitemapUrl?: string;

  /**
   * 追加のDisallowルール
   */
  additionalDisallow?: string[];

  /**
   * クローリング遅延（秒）
   */
  crawlDelay?: number;
}

/**
 * robots.txtを生成
 *
 * @param baseUrl - サイトのベースURL
 * @param options - 生成オプション
 * @returns robots.txtの内容
 *
 * @example
 * ```ts
 * const robotsTxt = generateRobotsTxt('https://libx.dev', {
 *   sitemapUrl: '/sitemap.xml',
 *   additionalDisallow: ['/admin', '/api']
 * });
 * fs.writeFileSync('robots.txt', robotsTxt);
 * ```
 */
export function generateRobotsTxt(
  baseUrl: string,
  options: GenerateRobotsTxtOptions = {}
): string {
  const {
    sitemapUrl = '/sitemap.xml',
    additionalDisallow = [],
    crawlDelay,
  } = options;

  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const lines: string[] = [];

  // 基本設定
  lines.push('User-agent: *');
  lines.push('Allow: /');

  // 追加のDisallowルール
  for (const path of additionalDisallow) {
    lines.push(`Disallow: ${path}`);
  }

  // クローリング遅延
  if (crawlDelay !== undefined && crawlDelay > 0) {
    lines.push(`Crawl-delay: ${crawlDelay}`);
  }

  // サイトマップ
  lines.push('');
  const fullSitemapUrl = sitemapUrl.startsWith('http')
    ? sitemapUrl
    : `${cleanBaseUrl}${sitemapUrl}`;
  lines.push(`Sitemap: ${fullSitemapUrl}`);

  return lines.join('\n') + '\n';
}

/**
 * Web App Manifest
 */
export interface WebManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  background_color: string;
  theme_color: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: string;
  }>;
  lang?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  orientation?:
    | 'any'
    | 'natural'
    | 'landscape'
    | 'portrait'
    | 'portrait-primary'
    | 'portrait-secondary'
    | 'landscape-primary'
    | 'landscape-secondary';
}

/**
 * manifest.json生成オプション
 */
export interface GenerateManifestOptions {
  /**
   * 開始URL（デフォルト: '/'）
   */
  startUrl?: string;

  /**
   * 表示モード（デフォルト: 'standalone'）
   */
  display?: WebManifest['display'];

  /**
   * 背景色（デフォルト: '#ffffff'）
   */
  backgroundColor?: string;

  /**
   * テーマ色（デフォルト: '#000000'）
   */
  themeColor?: string;

  /**
   * アイコン設定
   */
  icons?: WebManifest['icons'];

  /**
   * 言語コード
   */
  lang?: string;
}

/**
 * 多言語文字列から指定言語の値を取得（フォールバック機能付き）
 */
function getLocalizedValue(
  localizedString: LocalizedString,
  lang: string
): string {
  if (localizedString[lang]) {
    return localizedString[lang];
  }
  if (localizedString['en']) {
    return localizedString['en'];
  }
  const firstKey = Object.keys(localizedString)[0];
  return localizedString[firstKey] || '';
}

/**
 * manifest.jsonを生成
 *
 * @param registry - レジストリオブジェクト
 * @param projectId - プロジェクトID
 * @param options - 生成オプション
 * @returns WebManifestオブジェクト
 *
 * @example
 * ```ts
 * const registry = loadRegistry();
 * const manifest = generateManifest(registry, 'sample-docs', {
 *   lang: 'ja',
 *   themeColor: '#1e40af'
 * });
 * fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));
 * ```
 */
export function generateManifest(
  registry: Registry,
  projectId: string,
  options: GenerateManifestOptions = {}
): WebManifest | null {
  const {
    startUrl = '/',
    display = 'standalone',
    backgroundColor = '#ffffff',
    themeColor = '#000000',
    icons = [],
    lang = 'en',
  } = options;

  // プロジェクトを取得
  const project = registry.projects.find((p) => p.id === projectId);
  if (!project) {
    return null;
  }

  const name = getLocalizedValue(project.displayName, lang);
  const description = getLocalizedValue(project.description, lang);

  // 短縮名を生成（最大12文字）
  const shortName =
    name.length > 12 ? name.substring(0, 12).trim() + '...' : name;

  return {
    name,
    short_name: shortName,
    description,
    start_url: startUrl,
    display,
    background_color: backgroundColor,
    theme_color: themeColor,
    icons,
    lang,
    dir: 'ltr',
  };
}

/**
 * OpenGraphメタデータ
 */
export interface OpenGraphMeta {
  'og:title': string;
  'og:description': string;
  'og:type': string;
  'og:url': string;
  'og:image'?: string;
  'og:locale'?: string;
  'og:site_name'?: string;
}

/**
 * OpenGraphメタデータ生成オプション
 */
export interface GenerateOpenGraphOptions {
  /**
   * ページタイプ（デフォルト: 'website'）
   */
  type?: string;

  /**
   * OGイメージURL
   */
  imageUrl?: string;

  /**
   * サイト名
   */
  siteName?: string;

  /**
   * 言語コード
   */
  lang?: string;
}

/**
 * OpenGraphメタデータを生成
 *
 * @param title - ページタイトル
 * @param description - ページ説明
 * @param url - ページURL
 * @param options - 生成オプション
 * @returns OpenGraphメタデータオブジェクト
 *
 * @example
 * ```ts
 * const ogMeta = generateOpenGraph(
 *   'Getting Started',
 *   'Learn how to get started',
 *   'https://libx.dev/docs/guide/getting-started',
 *   { lang: 'en', siteName: 'LibX Documentation' }
 * );
 * ```
 */
export function generateOpenGraph(
  title: string,
  description: string,
  url: string,
  options: GenerateOpenGraphOptions = {}
): OpenGraphMeta {
  const {
    type = 'website',
    imageUrl,
    siteName,
    lang = 'en',
  } = options;

  const meta: OpenGraphMeta = {
    'og:title': title,
    'og:description': description,
    'og:type': type,
    'og:url': url,
    'og:locale': lang.replace('-', '_'), // en-US -> en_US
  };

  if (imageUrl) {
    meta['og:image'] = imageUrl;
  }

  if (siteName) {
    meta['og:site_name'] = siteName;
  }

  return meta;
}

/**
 * OpenGraphメタデータをHTMLメタタグに変換
 *
 * @param meta - OpenGraphメタデータ
 * @returns HTMLメタタグの配列
 */
export function openGraphToHtml(meta: OpenGraphMeta): string[] {
  return Object.entries(meta).map(
    ([property, content]) =>
      `<meta property="${property}" content="${escapeHtml(content)}" />`
  );
}

/**
 * HTML特殊文字をエスケープ
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
