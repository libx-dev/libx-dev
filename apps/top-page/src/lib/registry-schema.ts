/**
 * レジストリスキーマ型定義
 * registry/*.json から読み込むプロジェクト情報の型
 */
import type { LocaleKey } from '@docs/i18n/locales';

/**
 * レジストリファイルのプロジェクト定義
 */
export interface RegistryProject {
  id: string;
  displayName: Record<string, string>;
  description: Record<string, string>;
  languages: {
    code: string;
    displayName: string;
    status: string;
    default?: boolean;
    fallback?: string;
  }[];
  versions: {
    id: string;
    name: string;
    isLatest?: boolean;
    status: string;
    date: string;
  }[];
  documents?: {
    slug: string;
    title: string;
    version: string;
    lang: string;
    category?: string;
  }[];
}

/**
 * レジストリファイルの全体構造
 */
export interface RegistryFile {
  $schemaVersion: string;
  metadata: {
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
    updatedBy?: string;
  };
  projects: RegistryProject[];
}

/**
 * トップページで使用するプロジェクト情報
 */
export interface TopPageProject {
  id: string;
  name: Record<LocaleKey, string>;
  description: Record<LocaleKey, string>;
  path: string;
  supportedLangs: LocaleKey[];
  latestVersion: string;
  fallbackUrl: Record<LocaleKey, string>;
  icon?: string;
  tags?: string[];
  isNew?: boolean;
  isUpdated?: boolean;
}

/**
 * サイト全体の設定
 */
export interface SiteConfig {
  baseUrl: string;
  supportedLangs: LocaleKey[];
  defaultLang: LocaleKey;
  repository: string;
  siteName: string;
}

/**
 * トップページの設定
 */
export interface TopPageConfig extends SiteConfig {
  projects: TopPageProject[];
  siteDescription: Record<LocaleKey, string>;
  heroTitle: Record<LocaleKey, string>;
  heroDescription: Record<LocaleKey, string>;
}
