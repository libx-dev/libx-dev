/**
 * @docs/generator - レジストリ駆動のルーティング・サイドバー・サイトマップ生成
 *
 * このパッケージは、registry/docs.jsonからAstroサイトのルーティング、
 * サイドバー、サイトマップを自動生成するためのツールを提供します。
 *
 * @packageDocumentation
 */

// レジストリローダー
export {
  loadRegistry,
  getProject,
  getDocument,
  getRegistryStats,
  RegistryLoadError,
} from './registry.js';

// ルーティング生成
export {
  generateRoutes,
  getRoutesStats,
  routeToUrl,
  dumpRoutes,
} from './routing.js';

// サイドバー生成
export {
  generateSidebar,
  getSidebarStats,
  dumpSidebar,
} from './sidebar.js';

export type {
  SidebarItem,
  SidebarDocItem,
  GenerateSidebarOptions,
} from './sidebar.js';

// サイトマップ生成
export {
  generateSitemap,
  sitemapToXml,
  getSitemapStats,
  dumpSitemap,
} from './sitemap.js';

export type {
  SitemapEntry,
  GenerateSitemapOptions,
} from './sitemap.js';

// メタデータ生成
export {
  generateRobotsTxt,
  generateManifest,
  generateOpenGraph,
  openGraphToHtml,
} from './metadata.js';

export type {
  GenerateRobotsTxtOptions,
  WebManifest,
  GenerateManifestOptions,
  OpenGraphMeta,
  GenerateOpenGraphOptions,
} from './metadata.js';

// Visibility制御
export {
  shouldBuildPage,
  filterDocumentsByVisibility,
  isValidVisibility,
  isValidEnvironment,
} from './utils/visibility.js';

// 型定義
export type {
  Registry,
  Project,
  Document,
  Language,
  Version,
  Category,
  License,
  ContentEntry,
  LocalizedString,
  RouteParams,
  RouteProps,
  StaticPath,
  GenerateRoutesOptions,
  VisibilityCheckResult,
} from './types.js';
