/**
 * レジストリローダー
 * registry/*.json から全プロジェクト情報を読み込み、トップページ用に変換
 */
import fs from 'fs/promises';
import path from 'path';
import type {
  RegistryFile,
  RegistryProject,
  TopPageProject,
  TopPageConfig,
} from './registry-schema';
import type { LocaleKey } from '@docs/i18n/locales';

// レジストリディレクトリのパス
const REGISTRY_DIR = path.resolve(process.cwd(), '../../registry');

/**
 * registry/ディレクトリ内の全.jsonファイルを読み込み
 */
async function loadAllRegistryFiles(): Promise<RegistryFile[]> {
  const registryFiles: RegistryFile[] = [];

  try {
    const files = await fs.readdir(REGISTRY_DIR);
    const jsonFiles = files.filter(
      (file) => file.endsWith('.json') && !file.endsWith('.schema.json')
    );

    for (const file of jsonFiles) {
      const filePath = path.join(REGISTRY_DIR, file);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const registry = JSON.parse(content) as RegistryFile;
        registryFiles.push(registry);
      } catch (error) {
        console.warn(`レジストリファイルの読み込みに失敗: ${file}`, error);
      }
    }
  } catch (error) {
    console.error('レジストリディレクトリの読み込みに失敗:', error);
  }

  return registryFiles;
}

/**
 * レジストリプロジェクトをトップページ用のプロジェクトに変換
 */
function convertToTopPageProject(
  registryProject: RegistryProject
): TopPageProject {
  // 最新バージョンを取得
  const latestVersion =
    registryProject.versions.find((v) => v.isLatest)?.id ||
    registryProject.versions[0]?.id ||
    'v1';

  // サポートされている言語を取得
  const supportedLangs = registryProject.languages
    .filter((lang) => lang.status === 'active')
    .map((lang) => lang.code as LocaleKey);

  // デフォルト言語を取得
  const defaultLang =
    (registryProject.languages.find((lang) => lang.default)?.code as LocaleKey) ||
    'en';

  // フォールバックURLを生成
  const fallbackUrl: Record<LocaleKey, string> = {};

  for (const lang of supportedLangs) {
    // 各言語の最初のドキュメントを探す
    const firstDoc = registryProject.documents?.find(
      (doc) => doc.version === latestVersion && doc.lang === lang
    );

    if (firstDoc) {
      // ドキュメントが見つかった場合
      const category = firstDoc.category ? `/${firstDoc.category}` : '';
      fallbackUrl[lang] = `/docs/${registryProject.id}/${latestVersion}/${lang}${category}/${firstDoc.slug}`;
    } else {
      // ドキュメントが見つからない場合は汎用パス
      fallbackUrl[lang] = `/docs/${registryProject.id}/${latestVersion}/${lang}/`;
    }
  }

  // 英語フォールバックを追加（全言語でアクセス可能にする）
  if (!fallbackUrl['en'] && fallbackUrl[defaultLang]) {
    fallbackUrl['en'] = fallbackUrl[defaultLang];
  }

  return {
    id: registryProject.id,
    name: registryProject.displayName as Record<LocaleKey, string>,
    description: registryProject.description as Record<LocaleKey, string>,
    path: `/docs/${registryProject.id}`,
    supportedLangs,
    latestVersion,
    fallbackUrl,
  };
}

/**
 * トップページ設定をロード
 */
export async function loadTopPageConfig(): Promise<TopPageConfig> {
  // 全レジストリファイルを読み込み
  const registryFiles = await loadAllRegistryFiles();

  // 全プロジェクトを収集
  const allProjects: TopPageProject[] = [];
  for (const registry of registryFiles) {
    for (const project of registry.projects) {
      allProjects.push(convertToTopPageProject(project));
    }
  }

  // サイト設定ファイルを読み込み
  const siteConfigPath = path.resolve(
    process.cwd(),
    'src',
    'config',
    'site.config.json'
  );
  let siteConfig: any;

  try {
    const siteConfigContent = await fs.readFile(siteConfigPath, 'utf-8');
    siteConfig = JSON.parse(siteConfigContent);
  } catch (error) {
    console.warn('site.config.json が見つかりません。デフォルト設定を使用します。');
    // デフォルト設定
    siteConfig = {
      siteConfig: {
        baseUrl: '',
        supportedLangs: ['en', 'ja'],
        defaultLang: 'en',
        repository: 'https://github.com/libx-dev/libx-dev',
        siteName: 'Libx',
      },
      content: {
        siteDescription: {
          en: 'Documentation site built with Astro',
          ja: 'Astroで構築されたドキュメントサイト',
        },
        heroTitle: {
          en: 'Documentation Hub',
          ja: 'ドキュメントハブ',
        },
        heroDescription: {
          en: 'Find the documentation you need in one place',
          ja: '必要なドキュメントを一箇所で見つけることができます',
        },
      },
    };
  }

  return {
    projects: allProjects,
    baseUrl: siteConfig.siteConfig.baseUrl,
    supportedLangs: siteConfig.siteConfig.supportedLangs,
    defaultLang: siteConfig.siteConfig.defaultLang,
    repository: siteConfig.siteConfig.repository,
    siteName: siteConfig.siteConfig.siteName,
    siteDescription: siteConfig.content.siteDescription,
    heroTitle: siteConfig.content.heroTitle,
    heroDescription: siteConfig.content.heroDescription,
  };
}

/**
 * 設定キャッシュ
 */
let _configCache: TopPageConfig | null = null;

/**
 * キャッシュ付き設定ロード
 */
export async function getTopPageConfig(): Promise<TopPageConfig> {
  if (_configCache) {
    return _configCache;
  }

  _configCache = await loadTopPageConfig();
  return _configCache;
}

/**
 * 設定キャッシュをクリア（開発用）
 */
export function clearConfigCache(): void {
  _configCache = null;
}
