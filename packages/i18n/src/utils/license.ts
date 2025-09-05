import { t } from './translate';
import type { LocaleKey } from '../locales';

/**
 * ライセンス名からテンプレートキーへのマッピング
 */
const LICENSE_TEMPLATE_MAP: Record<string, string> = {
  // Permissive licenses → minimal template
  'MIT': 'minimal',
  'MIT License': 'minimal',
  'Apache License 2.0': 'minimal',
  'Apache-2.0': 'minimal',
  'BSD License': 'minimal',
  'BSD-2-Clause': 'minimal',
  'BSD-3-Clause': 'minimal',
  'ISC': 'minimal',
  'Unlicense': 'minimal',
  'Zlib': 'zlib',
  'zlib License': 'zlib',
  'zlib/libpng License': 'zlib',
  
  // Mozilla Public License → mpl template
  'MPL-2.0': 'mpl',
  'Mozilla Public License 2.0': 'mpl',
  'Mozilla Public License v2.0': 'mpl',
  'MPL 2.0': 'mpl',
  
  // Eclipse Public License → epl template
  'EPL-2.0': 'epl',
  'Eclipse Public License 2.0': 'epl',
  'Eclipse Public License v2.0': 'epl',
  'EPL 2.0': 'epl',
  
  // Boost Software License → minimal template (permissive)
  'BSL-1.0': 'minimal',
  'Boost Software License 1.0': 'minimal',
  'Boost Software License': 'minimal',
  
  // LaTeX Project Public License → lppl template
  'LPPL': 'lppl',
  'LaTeX Project Public License': 'lppl',
  'LPPL-1.3c': 'lppl',
  
  // Creative Commons → specific templates
  'CC BY': 'cc-by',
  'CC BY 4.0': 'cc-by',
  'Creative Commons Attribution': 'cc-by',
  'CC BY-SA': 'cc-by-sa',
  'CC BY-SA 4.0': 'cc-by-sa',
  'Creative Commons Attribution-ShareAlike': 'cc-by-sa',
  'CC BY-NC': 'cc-by',
  'CC BY-NC-SA': 'cc-by-sa',
  
  // Copyleft licenses → copyleft template
  'GPL v2': 'copyleft',
  'GPL-2.0': 'copyleft',
  'GPL v3': 'copyleft',
  'GPL-3.0': 'copyleft',
  'GNU General Public License v2.0': 'copyleft',
  'GNU General Public License v3.0': 'copyleft',
  'LGPL-2.1': 'copyleft',
  'LGPL-3.0': 'copyleft',
  'AGPL-3.0': 'copyleft',
  'GFDL': 'copyleft',
  'GNU Free Documentation License': 'copyleft',
  
  // Public Domain → public-domain template
  'CC0': 'public-domain',
  'CC0 1.0': 'public-domain',
  'Public Domain': 'public-domain',
  'WTFPL': 'public-domain'
};

/**
 * ライセンス名から適切なテンプレートキーを判定する
 * 
 * @param license ライセンス名
 * @returns テンプレートキー
 */
export function getLicenseTemplateKey(license: string): string {
  // 完全一致を優先
  if (LICENSE_TEMPLATE_MAP[license]) {
    return LICENSE_TEMPLATE_MAP[license];
  }
  
  // 部分一致による判定
  const normalizedLicense = license.toLowerCase().trim();
  
  // MIT系の判定
  if (normalizedLicense.includes('mit')) {
    return 'minimal';
  }
  
  // Apache系の判定
  if (normalizedLicense.includes('apache')) {
    return 'minimal';
  }
  
  // BSD系の判定
  if (normalizedLicense.includes('bsd')) {
    return 'minimal';
  }
  
  // Zlib系の判定
  if (normalizedLicense.includes('zlib') || normalizedLicense.includes('libpng')) {
    return 'zlib';
  }
  
  // Mozilla Public License系の判定
  if (normalizedLicense.includes('mpl') || normalizedLicense.includes('mozilla public')) {
    return 'mpl';
  }
  
  // Eclipse Public License系の判定
  if (normalizedLicense.includes('epl') || normalizedLicense.includes('eclipse public')) {
    return 'epl';
  }
  
  // Boost Software License系の判定
  if (normalizedLicense.includes('boost')) {
    return 'minimal';
  }
  
  // LaTeX Project Public License系の判定
  if (normalizedLicense.includes('lppl') || normalizedLicense.includes('latex project')) {
    return 'lppl';
  }
  
  // Creative Commons系の判定
  if (normalizedLicense.includes('cc by-sa') || normalizedLicense.includes('sharealike')) {
    return 'cc-by-sa';
  }
  if (normalizedLicense.includes('cc by') || normalizedLicense.includes('creative commons attribution')) {
    return 'cc-by';
  }
  
  // GPL系の判定
  if (normalizedLicense.includes('gpl') || normalizedLicense.includes('gnu general')) {
    return 'copyleft';
  }
  
  // GFDL系の判定
  if (normalizedLicense.includes('gfdl') || normalizedLicense.includes('free documentation')) {
    return 'copyleft';
  }
  
  // CC0/Public Domain系の判定
  if (normalizedLicense.includes('cc0') || normalizedLicense.includes('public domain')) {
    return 'public-domain';
  }
  
  // デフォルト：最小テンプレート
  return 'minimal';
}

/**
 * ライセンス情報を基にライセンステンプレートを取得する
 * 
 * @param licenseInfo ライセンス情報オブジェクト
 * @param lang 言語コード
 * @returns フォーマットされたライセンステキスト
 */
export function getLicenseTemplate(
  licenseInfo: {
    name: string;
    author: string;
    license: string;
    licenseUrl?: string;
    sourceUrl?: string;
    title?: string;
  },
  lang: LocaleKey
): string {
  const templateKey = getLicenseTemplateKey(licenseInfo.license);
  const i18nKey = `license.templates.${templateKey}`;
  
  // テンプレート用のパラメータを準備
  const params = {
    title: licenseInfo.title || licenseInfo.name,
    author: licenseInfo.author,
    license: licenseInfo.license,
    licenseUrl: licenseInfo.licenseUrl || '',
    sourceUrl: licenseInfo.sourceUrl || '',
    name: licenseInfo.name
  };
  
  // i18nシステムを使用してテンプレートを取得・変数置換
  return t(i18nKey, lang, params);
}

/**
 * ライセンスの種類を判定する（追加情報用）
 * 
 * @param license ライセンス名
 * @returns ライセンスカテゴリ情報
 */
export function getLicenseCategory(license: string): {
  category: 'permissive' | 'copyleft' | 'creative-commons' | 'public-domain' | 'unknown';
  requiresAttribution: boolean;
  requiresShareAlike: boolean;
} {
  const normalizedLicense = license.toLowerCase().trim();
  
  // Creative Commons系
  if (normalizedLicense.includes('cc by') || normalizedLicense.includes('creative commons')) {
    const requiresShareAlike = normalizedLicense.includes('sa') || normalizedLicense.includes('sharealike');
    return {
      category: 'creative-commons',
      requiresAttribution: true,
      requiresShareAlike
    };
  }
  
  // Copyleft系
  if (normalizedLicense.includes('gpl') || normalizedLicense.includes('gfdl') || normalizedLicense.includes('agpl') || 
      normalizedLicense.includes('mpl') || normalizedLicense.includes('epl') || normalizedLicense.includes('lppl')) {
    const isWeakCopyleft = normalizedLicense.includes('mpl') || normalizedLicense.includes('epl');
    return {
      category: 'copyleft',
      requiresAttribution: true,
      requiresShareAlike: !isWeakCopyleft // MPL/EPLは弱いコピーレフト
    };
  }
  
  // Public Domain系
  if (normalizedLicense.includes('cc0') || normalizedLicense.includes('public domain') || normalizedLicense.includes('wtfpl')) {
    return {
      category: 'public-domain',
      requiresAttribution: false,
      requiresShareAlike: false
    };
  }
  
  // Permissive系
  if (normalizedLicense.includes('mit') || normalizedLicense.includes('apache') || normalizedLicense.includes('bsd') || 
      normalizedLicense.includes('zlib') || normalizedLicense.includes('boost') || normalizedLicense.includes('isc')) {
    return {
      category: 'permissive',
      requiresAttribution: true,
      requiresShareAlike: false
    };
  }
  
  // 不明
  return {
    category: 'unknown',
    requiresAttribution: true,
    requiresShareAlike: false
  };
}