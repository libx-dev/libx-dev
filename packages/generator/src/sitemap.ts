/**
 * サイトマップ生成
 *
 * レジストリからサイトマップ(sitemap.xml)を生成します。
 */

import type { Registry } from './types.js';
import { shouldBuildPage } from './utils/visibility.js';

/**
 * サイトマップのURL項目
 */
export interface SitemapEntry {
  /** ページURL */
  url: string;
  /** 最終更新日時（ISO 8601形式） */
  lastmod?: string;
  /** 変更頻度 */
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  /** 優先度（0.0 - 1.0） */
  priority?: number;
}

/**
 * サイトマップ生成オプション
 */
export interface GenerateSitemapOptions {
  /**
   * ビルド環境（production, staging, development）
   * Visibilityフィルタリングに使用
   */
  env?: string;

  /**
   * デバッグログを出力するか
   */
  debug?: boolean;

  /**
   * 変更頻度のデフォルト値
   */
  defaultChangefreq?: SitemapEntry['changefreq'];

  /**
   * 優先度のデフォルト値
   */
  defaultPriority?: number;

  /**
   * 最新バージョンの優先度ブースト
   */
  latestVersionPriorityBoost?: number;
}

/**
 * レジストリからサイトマップを生成
 *
 * @param registry - レジストリオブジェクト
 * @param baseUrl - サイトのベースURL（例: 'https://example.com'）
 * @param options - 生成オプション
 * @returns サイトマップエントリの配列
 *
 * @example
 * ```ts
 * const registry = loadRegistry();
 * const sitemap = generateSitemap(registry, 'https://libx.dev', {
 *   env: 'production',
 *   defaultChangefreq: 'weekly',
 *   defaultPriority: 0.5
 * });
 * console.log(`Generated ${sitemap.length} URLs`);
 * ```
 */
export function generateSitemap(
  registry: Registry,
  baseUrl: string,
  options: GenerateSitemapOptions = {}
): SitemapEntry[] {
  const {
    env = process.env.NODE_ENV || 'development',
    debug = false,
    defaultChangefreq = 'weekly',
    defaultPriority = 0.5,
    latestVersionPriorityBoost = 0.3,
  } = options;

  const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // 末尾のスラッシュを削除
  const entries: SitemapEntry[] = [];
  let totalUrls = 0;
  let filteredUrls = 0;

  if (debug) {
    console.log(`Generating sitemap for ${cleanBaseUrl} (env: ${env})`);
  }

  for (const project of registry.projects) {
    // プロジェクトのvisibilityをチェック
    if (project.visibility === 'internal' && env === 'production') {
      if (debug) {
        console.log(`Skipping internal project: ${project.id}`);
      }
      continue;
    }

    // 最新バージョンを特定
    const latestVersion = project.versions.find((v) => v.isLatest);

    for (const doc of project.documents) {
      totalUrls++;

      // Visibilityチェック
      const visibilityCheck = shouldBuildPage(doc.visibility, env);
      if (!visibilityCheck.shouldBuild) {
        filteredUrls++;
        continue;
      }

      // ドキュメントの各バージョン・言語の組み合わせでURLを生成
      for (const version of doc.versions) {
        // バージョンが存在するか確認
        const versionExists = project.versions.some((v) => v.id === version);
        if (!versionExists) {
          if (debug) {
            console.warn(
              `Version ${version} not found in project ${project.id}`
            );
          }
          continue;
        }

        for (const [lang, content] of Object.entries(doc.content)) {
          // 言語が存在するか確認
          const langExists = project.languages.some((l) => l.code === lang);
          if (!langExists) {
            if (debug) {
              console.warn(
                `Language ${lang} not found in project ${project.id}`
              );
            }
            continue;
          }

          // コンテンツのステータスが公開済みかチェック
          if (content.status !== 'published' && env === 'production') {
            continue;
          }

          const url = `${cleanBaseUrl}/${project.id}/${version}/${lang}/${doc.slug}`;

          // 最新バージョンかどうかで優先度を調整
          const isLatest = latestVersion?.id === version;
          const priority =
            defaultPriority + (isLatest ? latestVersionPriorityBoost : 0);

          entries.push({
            url,
            lastmod: new Date().toISOString(), // 実際には各ドキュメントの更新日時を使用
            changefreq: defaultChangefreq,
            priority: Math.min(1.0, priority), // 1.0を超えないようにする
          });
        }
      }
    }
  }

  if (debug) {
    console.log(
      `Generated ${entries.length} URLs (${filteredUrls} filtered from ${totalUrls} total)`
    );
  }

  return entries;
}

/**
 * サイトマップエントリをXML形式の文字列に変換
 *
 * @param entries - サイトマップエントリの配列
 * @returns XML形式のサイトマップ文字列
 *
 * @example
 * ```ts
 * const entries = generateSitemap(registry, 'https://libx.dev');
 * const xml = sitemapToXml(entries);
 * fs.writeFileSync('sitemap.xml', xml);
 * ```
 */
export function sitemapToXml(entries: SitemapEntry[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen =
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';

  const urls = entries
    .map((entry) => {
      const parts = [`  <url>`, `    <loc>${escapeXml(entry.url)}</loc>`];

      if (entry.lastmod) {
        parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      }

      if (entry.changefreq) {
        parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      }

      if (entry.priority !== undefined) {
        parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
      }

      parts.push(`  </url>`);
      return parts.join('\n');
    })
    .join('\n');

  return [xmlHeader, urlsetOpen, urls, urlsetClose].join('\n');
}

/**
 * XML特殊文字をエスケープ
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * サイトマップ統計情報を取得
 *
 * @param entries - サイトマップエントリの配列
 * @returns 統計情報オブジェクト
 */
export function getSitemapStats(entries: SitemapEntry[]): {
  totalUrls: number;
  urlsByPriority: Record<string, number>;
  urlsByChangefreq: Record<string, number>;
} {
  const urlsByPriority: Record<string, number> = {};
  const urlsByChangefreq: Record<string, number> = {};

  for (const entry of entries) {
    // 優先度でカウント
    const priorityKey = entry.priority?.toFixed(1) || 'none';
    urlsByPriority[priorityKey] = (urlsByPriority[priorityKey] || 0) + 1;

    // 変更頻度でカウント
    const changefreqKey = entry.changefreq || 'none';
    urlsByChangefreq[changefreqKey] =
      (urlsByChangefreq[changefreqKey] || 0) + 1;
  }

  return {
    totalUrls: entries.length,
    urlsByPriority,
    urlsByChangefreq,
  };
}

/**
 * サイトマップを人間が読みやすい形式で出力
 *
 * @param entries - サイトマップエントリの配列
 * @param maxEntries - 表示する最大エントリ数
 */
export function dumpSitemap(entries: SitemapEntry[], maxEntries = 20): void {
  console.log('\n=== Sitemap ===\n');

  if (entries.length === 0) {
    console.log('  (empty)');
    return;
  }

  const displayEntries = entries.slice(0, maxEntries);

  for (const entry of displayEntries) {
    console.log(`${entry.url}`);
    if (entry.priority !== undefined) {
      console.log(`  Priority: ${entry.priority.toFixed(1)}`);
    }
    if (entry.changefreq) {
      console.log(`  Changefreq: ${entry.changefreq}`);
    }
    console.log('');
  }

  if (entries.length > maxEntries) {
    console.log(`... and ${entries.length - maxEntries} more URLs\n`);
  }

  const stats = getSitemapStats(entries);
  console.log('=== Statistics ===');
  console.log(`Total URLs: ${stats.totalUrls}`);
  console.log('URLs by priority:', stats.urlsByPriority);
  console.log('URLs by changefreq:', stats.urlsByChangefreq);
  console.log('');
}
