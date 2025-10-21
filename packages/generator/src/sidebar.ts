/**
 * サイドバー生成
 *
 * レジストリのカテゴリ構造からサイドバーのナビゲーション構造を生成します。
 */

import type { Registry, LocalizedString } from './types.js';
import { shouldBuildPage } from './utils/visibility.js';

/**
 * サイドバーのドキュメント項目
 */
export interface SidebarDocItem {
  /** ドキュメントタイトル */
  title: string;
  /** ドキュメントURL */
  href: string;
  /** 順序番号 */
  order?: number;
  /** ドキュメントID */
  docId: string;
}

/**
 * サイドバーカテゴリ項目
 */
export interface SidebarItem {
  /** カテゴリタイトル */
  title: string;
  /** カテゴリslug */
  slug: string;
  /** アイコン名（オプション） */
  icon?: string;
  /** 順序番号 */
  order: number;
  /** カテゴリ内のドキュメントリスト */
  items: SidebarDocItem[];
}

/**
 * サイドバー生成オプション
 */
export interface GenerateSidebarOptions {
  /**
   * ビルド環境（production, staging, development）
   * Visibilityフィルタリングに使用
   */
  env?: string;

  /**
   * ベースURL（デフォルト: '/'）
   */
  baseUrl?: string;

  /**
   * デバッグログを出力するか
   */
  debug?: boolean;
}

/**
 * 多言語文字列から指定言語の値を取得（フォールバック機能付き）
 *
 * @param localizedString - 多言語文字列オブジェクト
 * @param lang - 取得したい言語コード
 * @returns 指定言語の文字列（見つからない場合は英語、それも無い場合は最初の値）
 */
function getLocalizedValue(
  localizedString: LocalizedString,
  lang: string
): string {
  // 指定言語の値があればそれを返す
  if (localizedString[lang]) {
    return localizedString[lang];
  }

  // フォールバック: 英語
  if (localizedString['en']) {
    return localizedString['en'];
  }

  // 最終フォールバック: 最初の値
  const firstKey = Object.keys(localizedString)[0];
  return localizedString[firstKey] || '';
}

/**
 * レジストリからサイドバー構造を生成
 *
 * @param registry - レジストリオブジェクト
 * @param projectId - プロジェクトID
 * @param version - バージョンID
 * @param lang - 言語コード
 * @param options - 生成オプション
 * @returns サイドバー項目の配列
 *
 * @example
 * ```ts
 * const registry = loadRegistry();
 * const sidebar = generateSidebar(registry, 'sample-docs', 'v2', 'ja', {
 *   env: 'production',
 *   baseUrl: '/docs/sample-docs',
 *   debug: true
 * });
 * console.log(`Generated ${sidebar.length} categories`);
 * ```
 */
export function generateSidebar(
  registry: Registry,
  projectId: string,
  version: string,
  lang: string,
  options: GenerateSidebarOptions = {}
): SidebarItem[] {
  const {
    env = process.env.NODE_ENV || 'development',
    baseUrl = '/',
    debug = false,
  } = options;

  // プロジェクトを取得
  const project = registry.projects.find((p) => p.id === projectId);
  if (!project) {
    if (debug) {
      console.warn(`Project not found: ${projectId}`);
    }
    return [];
  }

  // バージョンが存在するか確認
  const versionExists = project.versions.some((v) => v.id === version);
  if (!versionExists) {
    if (debug) {
      console.warn(`Version not found: ${version} in project ${projectId}`);
    }
    return [];
  }

  if (debug) {
    console.log(
      `Generating sidebar for ${projectId}/${version}/${lang} (env: ${env})`
    );
  }

  // カテゴリをフィルタリング（指定バージョンに対応するものだけ）
  // Note: 現在のスキーマではcategoryにversionsフィールドが無いため、
  // 全カテゴリを対象とします
  const categories = project.categories;

  // サイドバー項目を生成
  const sidebarItems: SidebarItem[] = [];
  let totalDocs = 0;
  let filteredDocs = 0;

  for (const category of categories) {
    // カテゴリ内のドキュメントを取得
    const docItems: SidebarDocItem[] = [];

    for (const docId of category.docs) {
      const doc = project.documents.find((d) => d.id === docId);
      if (!doc) {
        if (debug) {
          console.warn(
            `Document not found: ${docId} in category ${category.id}`
          );
        }
        continue;
      }

      totalDocs++;

      // バージョンチェック
      if (!doc.versions.includes(version)) {
        filteredDocs++;
        continue;
      }

      // Visibilityチェック
      const visibilityCheck = shouldBuildPage(doc.visibility, env);
      if (!visibilityCheck.shouldBuild) {
        filteredDocs++;
        continue;
      }

      // 言語コンテンツが存在するかチェック
      if (!doc.content[lang]) {
        if (debug) {
          console.warn(
            `Content not found for lang ${lang} in document ${docId}`
          );
        }
        filteredDocs++;
        continue;
      }

      // ドキュメント項目を作成
      const title = getLocalizedValue(doc.title, lang);
      const cleanBaseUrl = baseUrl === '/' ? '' : baseUrl;
      // baseUrlにprojectIdが含まれている場合は重複を避ける
      const href = cleanBaseUrl.includes(projectId)
        ? `${cleanBaseUrl}/${version}/${lang}/${doc.slug}`
        : `${cleanBaseUrl}/${projectId}/${version}/${lang}/${doc.slug}`;

      docItems.push({
        title,
        href,
        order: doc.order,
        docId: doc.id,
      });
    }

    // ドキュメントが1つも無いカテゴリはスキップ
    if (docItems.length === 0) {
      continue;
    }

    // ドキュメントを順序でソート
    docItems.sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      return orderA - orderB;
    });

    // カテゴリタイトルを取得
    const categoryTitle = getLocalizedValue(category.titles, lang);

    sidebarItems.push({
      title: categoryTitle,
      slug: category.id,
      icon: category.icon,
      order: category.order,
      items: docItems,
    });
  }

  // カテゴリを順序でソート
  sidebarItems.sort((a, b) => a.order - b.order);

  if (debug) {
    console.log(
      `Generated ${sidebarItems.length} categories with ${totalDocs - filteredDocs} documents (${filteredDocs} filtered)`
    );
  }

  return sidebarItems;
}

/**
 * サイドバー統計情報を取得
 *
 * @param sidebar - サイドバー項目の配列
 * @returns 統計情報オブジェクト
 */
export function getSidebarStats(sidebar: SidebarItem[]): {
  categoryCount: number;
  documentCount: number;
  categoriesWithIcon: number;
  averageDocsPerCategory: number;
} {
  const categoryCount = sidebar.length;
  const documentCount = sidebar.reduce(
    (sum, category) => sum + category.items.length,
    0
  );
  const categoriesWithIcon = sidebar.filter((cat) => cat.icon).length;
  const averageDocsPerCategory =
    categoryCount > 0 ? documentCount / categoryCount : 0;

  return {
    categoryCount,
    documentCount,
    categoriesWithIcon,
    averageDocsPerCategory: Math.round(averageDocsPerCategory * 100) / 100,
  };
}

/**
 * サイドバーを人間が読みやすい形式で出力
 *
 * @param sidebar - サイドバー項目の配列
 */
export function dumpSidebar(sidebar: SidebarItem[]): void {
  console.log('\n=== Sidebar Structure ===\n');

  if (sidebar.length === 0) {
    console.log('  (empty)');
    return;
  }

  for (const category of sidebar) {
    const icon = category.icon ? `[${category.icon}] ` : '';
    console.log(`${icon}${category.title} (order: ${category.order})`);

    for (const doc of category.items) {
      const order = doc.order !== undefined ? ` (${doc.order})` : '';
      console.log(`  - ${doc.title}${order}`);
      console.log(`    ${doc.href}`);
    }

    console.log('');
  }

  const stats = getSidebarStats(sidebar);
  console.log('=== Statistics ===');
  console.log(`Categories: ${stats.categoryCount}`);
  console.log(`Documents: ${stats.documentCount}`);
  console.log(`With icons: ${stats.categoriesWithIcon}`);
  console.log(`Avg docs/category: ${stats.averageDocsPerCategory}`);
  console.log('');
}
