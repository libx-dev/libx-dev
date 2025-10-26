/**
 * プロジェクトURL生成ユーティリティ
 * 各プロジェクトの言語サポート状況を考慮したURL生成
 */
import type { LocaleKey } from '@docs/i18n/locales';
import type { TopPageProject } from './registry-schema';

/**
 * プロジェクトの最適なURLを生成
 * 1. プロジェクトが指定言語をサポートしているかチェック
 * 2. サポートしている場合は指定言語のURL
 * 3. サポートしていない場合は英語にフォールバック
 */
export function generateProjectUrl(
  project: TopPageProject,
  lang: LocaleKey
): string {
  // プロジェクトが指定言語をサポートしているかチェック
  const targetLang = project.supportedLangs.includes(lang) ? lang : 'en';

  // fallbackUrlを使用
  if (project.fallbackUrl && project.fallbackUrl[targetLang]) {
    return project.fallbackUrl[targetLang];
  }

  // 英語のフォールバックURLを試す
  if (project.fallbackUrl && project.fallbackUrl['en'] && targetLang !== 'en') {
    return project.fallbackUrl['en'];
  }

  // 最終フォールバック: 基本パス
  return `${project.path}/${project.latestVersion}/${targetLang}/`;
}
