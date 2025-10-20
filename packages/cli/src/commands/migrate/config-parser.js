/**
 * 設定ファイル解析モジュール
 *
 * 既存のproject.config.jsonとprojects.config.jsonを解析し、
 * 新レジストリ形式へのマッピングデータを生成します。
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as logger from '../../utils/logger.js';

/**
 * project.config.jsonを解析してレジストリ形式のプロジェクトデータを生成
 *
 * @param {string} projectPath - プロジェクトディレクトリのパス（例: apps/sample-docs）
 * @param {string} projectId - プロジェクトID
 * @returns {Object} レジストリ形式のプロジェクトデータ
 */
export function parseProjectConfig(projectPath, projectId) {
  const configPath = join(projectPath, 'src/config/project.config.json');

  if (!existsSync(configPath)) {
    throw new Error(`設定ファイルが見つかりません: ${configPath}`);
  }

  logger.info(`設定ファイルを読み込み中: ${configPath}`);

  let config;
  try {
    const configContent = readFileSync(configPath, 'utf-8');
    config = JSON.parse(configContent);
  } catch (error) {
    throw new Error(`設定ファイルの解析に失敗しました: ${error.message}`);
  }

  // レジストリ形式のプロジェクトデータを構築
  const projectData = {
    id: projectId,
    displayName: {},
    description: {},
    languages: [],
    versions: [],
    categories: [],
    documents: [],
  };

  // === 言語設定の変換 ===
  const supportedLangs = config.basic?.supportedLangs || ['en', 'ja'];
  const defaultLang = config.basic?.defaultLang || 'en';
  const languageNames = config.languageNames || {};

  for (const langCode of supportedLangs) {
    projectData.languages.push({
      code: langCode,
      displayName: languageNames[langCode] || langCode.toUpperCase(),
      status: 'active',
      default: langCode === defaultLang,
      ...(langCode !== defaultLang && { fallback: defaultLang }),
    });
  }

  // === プロジェクト名・説明の変換 ===
  const translations = config.translations || {};
  for (const [lang, trans] of Object.entries(translations)) {
    if (trans.displayName) {
      projectData.displayName[lang] = trans.displayName;
    }
    if (trans.displayDescription) {
      projectData.description[lang] = trans.displayDescription;
    }
  }

  // === バージョン設定の変換 ===
  const versions = config.versioning?.versions || [];
  projectData.versions = versions.map((v) => ({
    id: v.id,
    name: v.name,
    isLatest: v.isLatest,
    status: v.isLatest ? 'active' : 'deprecated',
    date: v.date,
  }));

  // === ライセンス情報の変換 ===
  const licensingSources = config.licensing?.sources || [];
  if (licensingSources.length > 0) {
    projectData.licenses = licensingSources.map((source) => ({
      id: source.id,
      name: source.name,
      author: source.author,
      license: source.license,
      url: source.licenseUrl,
    }));
  }

  // === カテゴリ名の一時保存（後でファイルシステムスキャンと統合） ===
  const categoryTranslations = {};
  for (const [lang, trans] of Object.entries(translations)) {
    if (trans.categories) {
      categoryTranslations[lang] = trans.categories;
    }
  }

  logger.success(`設定ファイルの解析完了: ${projectId}`);
  logger.info(`  言語: ${supportedLangs.join(', ')}`);
  logger.info(`  バージョン: ${versions.map((v) => v.id).join(', ')}`);

  return {
    projectData,
    categoryTranslations,
    supportedLangs,
    versions: versions.map((v) => v.id),
  };
}

/**
 * projects.config.jsonからプロジェクト装飾情報を取得
 *
 * @param {string} topPagePath - トップページのパス（例: apps/top-page）
 * @param {string} projectId - プロジェクトID
 * @returns {Object} プロジェクト装飾情報（icon, tagsなど）
 */
export function parseProjectDecorations(topPagePath, projectId) {
  const configPath = join(topPagePath, 'src/config/projects.config.json');

  if (!existsSync(configPath)) {
    logger.warn(`トップページ設定ファイルが見つかりません: ${configPath}`);
    return {};
  }

  logger.info(`トップページ設定を読み込み中: ${configPath}`);

  let config;
  try {
    const configContent = readFileSync(configPath, 'utf-8');
    config = JSON.parse(configContent);
  } catch (error) {
    logger.warn(`トップページ設定の解析に失敗しました: ${error.message}`);
    return {};
  }

  const decorations = config.projectDecorations?.[projectId] || {};

  const result = {};
  if (decorations.icon) {
    result.icon = decorations.icon;
  }
  if (decorations.tags && Array.isArray(decorations.tags)) {
    result.tags = decorations.tags;
  }

  logger.success(`プロジェクト装飾情報の取得完了: ${projectId}`);

  return result;
}

/**
 * カテゴリ翻訳情報を取得（プロジェクト設定から）
 *
 * @param {Object} categoryTranslations - カテゴリ翻訳情報
 * @param {string} categoryId - カテゴリID
 * @param {string[]} supportedLangs - サポート言語リスト
 * @returns {Object} 多言語カテゴリ名
 */
export function getCategoryNames(categoryTranslations, categoryId, supportedLangs) {
  const names = {};
  for (const lang of supportedLangs) {
    if (categoryTranslations[lang] && categoryTranslations[lang][categoryId]) {
      names[lang] = categoryTranslations[lang][categoryId];
    } else {
      // フォールバック: IDをタイトルケースに変換
      names[lang] = toTitleCase(categoryId);
    }
  }
  return names;
}

/**
 * 文字列をタイトルケースに変換
 *
 * @param {string} str - 変換する文字列
 * @returns {string} タイトルケースに変換された文字列
 */
function toTitleCase(str) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
