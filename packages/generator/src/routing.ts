/**
 * ルーティング生成
 *
 * レジストリからAstroのgetStaticPaths用のルーティング情報を生成します。
 */

import type {
  Registry,
  StaticPath,
  GenerateRoutesOptions,
  Document,
  Project,
} from './types.js';
import { shouldBuildPage } from './utils/visibility.js';

/**
 * レジストリからルーティング情報を生成
 *
 * @param registry - レジストリオブジェクト
 * @param options - 生成オプション
 * @returns Astro getStaticPaths用のパス配列
 *
 * @example
 * ```ts
 * const registry = loadRegistry();
 * const routes = generateRoutes(registry, {
 *   env: 'production',
 *   debug: true
 * });
 * console.log(`Generated ${routes.length} routes`);
 * ```
 */
export function generateRoutes(
  registry: Registry,
  options: GenerateRoutesOptions = {}
): StaticPath[] {
  const {
    env = process.env.NODE_ENV || 'development',
    projectId,
    version,
    lang,
    debug = false,
  } = options;

  const routes: StaticPath[] = [];
  let filteredCount = 0;

  // プロジェクトのフィルタリング
  const targetProjects = projectId
    ? registry.projects.filter((p) => p.id === projectId)
    : registry.projects;

  if (debug) {
    console.log(
      `[generateRoutes] Processing ${targetProjects.length} project(s) in ${env} environment`
    );
  }

  // プロジェクトごとにルーティング生成
  for (const project of targetProjects) {
    // プロジェクトのvisibilityチェック
    const projectVisibility = shouldBuildPage(project.visibility, env);
    if (!projectVisibility.shouldBuild) {
      if (debug) {
        console.log(
          `[generateRoutes] Skipping project "${project.id}": ${projectVisibility.reason}`
        );
      }
      filteredCount++;
      continue;
    }

    // バージョンのフィルタリング
    const targetVersions = version
      ? project.versions.filter((v) => v.id === version)
      : project.versions;

    // 言語のフィルタリング
    const targetLanguages = lang
      ? project.languages.filter((l) => l.code === lang)
      : project.languages;

    // ドキュメントごとにルーティング生成
    for (const doc of project.documents) {
      const docRoutes = generateDocumentRoutes(
        project,
        doc,
        targetVersions.map((v) => v.id),
        targetLanguages.map((l) => l.code),
        env,
        debug
      );

      routes.push(...docRoutes);
    }
  }

  if (debug) {
    console.log(
      `[generateRoutes] Generated ${routes.length} routes (filtered: ${filteredCount})`
    );
  }

  return routes;
}

/**
 * 単一ドキュメントのルーティング情報を生成
 *
 * @param project - プロジェクトオブジェクト
 * @param doc - ドキュメントオブジェクト
 * @param versions - 対象バージョンのID配列
 * @param languages - 対象言語のコード配列
 * @param env - ビルド環境
 * @param debug - デバッグモード
 * @returns ルーティング情報の配列
 */
function generateDocumentRoutes(
  project: Project,
  doc: Document,
  versions: string[],
  languages: string[],
  env: string,
  debug: boolean
): StaticPath[] {
  const routes: StaticPath[] = [];

  // ドキュメントのvisibilityチェック
  const docVisibility = shouldBuildPage(doc.visibility, env);
  if (!docVisibility.shouldBuild) {
    if (debug) {
      console.log(
        `[generateDocumentRoutes] Skipping document "${doc.id}": ${docVisibility.reason}`
      );
    }
    return routes;
  }

  // ドキュメントが対応しているバージョンのみ処理
  const docVersions = versions.filter((v) => doc.versions.includes(v));

  if (docVersions.length === 0) {
    if (debug) {
      console.log(
        `[generateDocumentRoutes] Document "${doc.id}" has no matching versions`
      );
    }
    return routes;
  }

  // バージョン × 言語の組み合わせでルーティング生成
  for (const versionId of docVersions) {
    for (const langCode of languages) {
      // この言語のコンテンツが存在するかチェック
      const contentEntry = doc.content[langCode];
      if (!contentEntry) {
        if (debug) {
          console.log(
            `[generateDocumentRoutes] Document "${doc.id}" has no content for language "${langCode}"`
          );
        }
        continue;
      }

      // コンテンツのステータスチェック（publishedのみビルド対象）
      if (contentEntry.status !== 'published') {
        if (debug) {
          console.log(
            `[generateDocumentRoutes] Document "${doc.id}" (${langCode}) is not published: ${contentEntry.status}`
          );
        }
        continue;
      }

      // ルーティング情報を生成
      routes.push({
        params: {
          project: project.id,
          version: versionId,
          lang: langCode,
          slug: doc.slug,
        },
        props: {
          docId: doc.id,
          projectId: project.id,
          title: doc.title[langCode] || doc.title.en || Object.values(doc.title)[0],
          summary:
            doc.summary[langCode] || doc.summary.en || Object.values(doc.summary)[0],
          keywords: doc.keywords || [],
          tags: doc.tags || [],
          related: doc.related,
          license: doc.license,
          contributors: doc.contributors,
          contentPath: contentEntry.path,
          visibility: doc.visibility,
          status: doc.status,
        },
      });

      if (debug) {
        console.log(
          `[generateDocumentRoutes] Generated route: ${project.id}/${versionId}/${langCode}/${doc.slug}`
        );
      }
    }
  }

  return routes;
}

/**
 * 生成されたルーティング情報の統計を取得
 *
 * @param routes - ルーティング情報の配列
 * @returns 統計情報オブジェクト
 */
export function getRoutesStats(routes: StaticPath[]) {
  const stats = {
    totalRoutes: routes.length,
    byProject: {} as Record<string, number>,
    byVersion: {} as Record<string, number>,
    byLanguage: {} as Record<string, number>,
    byVisibility: {} as Record<string, number>,
  };

  routes.forEach((route) => {
    const { project, version, lang } = route.params;
    const { visibility } = route.props;

    stats.byProject[project] = (stats.byProject[project] || 0) + 1;
    stats.byVersion[version] = (stats.byVersion[version] || 0) + 1;
    stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;
    stats.byVisibility[visibility] = (stats.byVisibility[visibility] || 0) + 1;
  });

  return stats;
}

/**
 * ルーティング情報をURL形式の文字列に変換
 *
 * @param route - ルーティング情報
 * @param baseUrl - ベースURL（デフォルト: '/'）
 * @returns URL文字列
 */
export function routeToUrl(route: StaticPath, baseUrl: string = '/'): string {
  const { project, version, lang, slug } = route.params;
  const segments = [baseUrl, project, version, lang, slug].filter(Boolean);
  return segments.join('/').replace(/\/+/g, '/');
}

/**
 * ルーティング情報を人間が読みやすい形式でダンプ
 *
 * @param routes - ルーティング情報の配列
 * @param maxRoutes - 表示する最大ルート数（デフォルト: 10）
 */
export function dumpRoutes(routes: StaticPath[], maxRoutes: number = 10): void {
  const stats = getRoutesStats(routes);

  console.log('\n=== Routing Statistics ===');
  console.log(`Total Routes: ${stats.totalRoutes}`);
  console.log('\nBy Project:');
  Object.entries(stats.byProject).forEach(([project, count]) => {
    console.log(`  ${project}: ${count}`);
  });
  console.log('\nBy Version:');
  Object.entries(stats.byVersion).forEach(([version, count]) => {
    console.log(`  ${version}: ${count}`);
  });
  console.log('\nBy Language:');
  Object.entries(stats.byLanguage).forEach(([lang, count]) => {
    console.log(`  ${lang}: ${count}`);
  });
  console.log('\nBy Visibility:');
  Object.entries(stats.byVisibility).forEach(([visibility, count]) => {
    console.log(`  ${visibility}: ${count}`);
  });

  if (routes.length > 0) {
    console.log(`\n=== Sample Routes (first ${Math.min(maxRoutes, routes.length)}) ===`);
    routes.slice(0, maxRoutes).forEach((route, i) => {
      const url = routeToUrl(route);
      console.log(
        `${i + 1}. ${url} (${route.props.visibility}, ${route.props.status})`
      );
    });
  }

  console.log('');
}
