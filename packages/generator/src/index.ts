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
