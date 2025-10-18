/**
 * レジストリとルーティング生成のための型定義
 *
 * このファイルは、registry/docs.jsonのスキーマに基づいた型定義と、
 * Astroのルーティング生成に必要な型を提供します。
 */

/**
 * 多言語文字列マップ
 */
export type LocalizedString = {
  [lang: string]: string;
};

/**
 * 言語設定
 */
export interface Language {
  code: string;
  displayName: string;
  status: 'active' | 'inactive';
  default?: boolean;
  fallback?: string;
}

/**
 * バージョン設定
 */
export interface Version {
  id: string;
  name: string;
  isLatest: boolean;
  status: 'active' | 'deprecated' | 'beta';
  date: string;
}

/**
 * カテゴリ設定
 */
export interface Category {
  id: string;
  order: number;
  titles: LocalizedString;
  docs: string[];
  icon?: string;
}

/**
 * コンテンツ設定（言語別）
 */
export interface ContentEntry {
  path: string;
  status: 'draft' | 'published' | 'archived';
}

/**
 * ドキュメント定義
 */
export interface Document {
  id: string;
  slug: string;
  title: LocalizedString;
  summary: LocalizedString;
  versions: string[];
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'internal' | 'draft';
  keywords: string[];
  tags: string[];
  content: {
    [lang: string]: ContentEntry;
  };
  license: string;
  related?: string[];
  contributors?: string[];
  order?: number;
}

/**
 * ライセンス定義
 */
export interface License {
  id: string;
  name: string;
  url?: string;
  attribution?: string;
}

/**
 * プロジェクト設定
 */
export interface Project {
  id: string;
  displayName: LocalizedString;
  description: LocalizedString;
  languages: Language[];
  versions: Version[];
  categories: Category[];
  documents: Document[];
  licenses: License[];
  visibility: 'public' | 'internal';
  options?: {
    search?: boolean;
    [key: string]: any;
  };
}

/**
 * レジストリメタデータ
 */
export interface RegistryMetadata {
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * レジストリルート
 */
export interface Registry {
  $schemaVersion: string;
  metadata: RegistryMetadata;
  projects: Project[];
}

/**
 * ルーティングパラメータ（Astro用）
 */
export interface RouteParams {
  project: string;
  version: string;
  lang: string;
  slug: string;
}

/**
 * ルーティングProps（Astro用）
 */
export interface RouteProps {
  docId: string;
  projectId: string;
  title: string;
  summary: string;
  keywords: string[];
  tags: string[];
  related?: string[];
  license: string;
  contributors?: string[];
  contentPath: string;
  visibility: string;
  status: string;
}

/**
 * Astro getStaticPaths用のパス定義
 */
export interface StaticPath {
  params: RouteParams;
  props: RouteProps;
}

/**
 * ルーティング生成オプション
 */
export interface GenerateRoutesOptions {
  /**
   * ビルド環境（production, staging, development）
   */
  env?: string;

  /**
   * 特定のプロジェクトIDのみ生成（指定しない場合は全プロジェクト）
   */
  projectId?: string;

  /**
   * 特定のバージョンのみ生成（指定しない場合は全バージョン）
   */
  version?: string;

  /**
   * 特定の言語のみ生成（指定しない場合は全言語）
   */
  lang?: string;

  /**
   * デバッグログを出力するか
   */
  debug?: boolean;
}

/**
 * Visibility制御の結果
 */
export interface VisibilityCheckResult {
  shouldBuild: boolean;
  reason?: string;
}
