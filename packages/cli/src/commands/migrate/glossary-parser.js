/**
 * Glossary（用語集）変換モジュール
 *
 * 既存プロジェクトの用語集ファイルを検出し、
 * 新レジストリ形式のglossary配列へ変換します。
 *
 * サポート形式:
 * - JSON形式の用語集ファイル（glossary.json）
 * - MDX形式の用語集ファイル（glossary.mdx）
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import * as logger from '../../utils/logger.js';

/**
 * 用語集ファイルを検出
 *
 * 検索対象:
 * - プロジェクトルート/glossary.json
 * - プロジェクトルート/src/glossary.json
 * - プロジェクトルート/src/content/glossary.json
 * - プロジェクトルート/src/content/glossary.mdx
 *
 * @param {string} projectPath - プロジェクトディレクトリのパス
 * @returns {string|null} 用語集ファイルのパス、または null
 */
function detectGlossaryFile(projectPath) {
  const candidates = [
    join(projectPath, 'glossary.json'),
    join(projectPath, 'src/glossary.json'),
    join(projectPath, 'src/content/glossary.json'),
    join(projectPath, 'src/content/glossary.mdx'),
  ];

  for (const path of candidates) {
    if (existsSync(path)) {
      logger.info(`用語集ファイルを検出: ${path}`);
      return path;
    }
  }

  return null;
}

/**
 * JSON形式の用語集ファイルを解析
 *
 * 期待される形式:
 * {
 *   "terms": [
 *     {
 *       "id": "registry",
 *       "term": "Registry",
 *       "titles": { "en": "Registry", "ja": "レジストリ" },
 *       "definition": { "en": "A centralized...", "ja": "ドキュメントを一元管理する..." },
 *       "aliases": ["reg"],
 *       "relatedDocs": ["getting-started"]
 *     }
 *   ]
 * }
 *
 * @param {string} filePath - JSON用語集ファイルのパス
 * @returns {Object[]} レジストリ形式のglossary配列
 */
function parseJsonGlossary(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (!data.terms || !Array.isArray(data.terms)) {
      logger.warn('用語集ファイルに "terms" 配列が見つかりません');
      return [];
    }

    const glossary = [];

    for (const term of data.terms) {
      // 必須フィールドの検証
      if (!term.id || !term.term || !term.titles || !term.definition) {
        logger.warn(`不完全な用語エントリをスキップ: ${JSON.stringify(term)}`);
        continue;
      }

      // レジストリ形式に変換
      const entry = {
        id: term.id,
        term: term.term,
        titles: term.titles,
        definition: term.definition,
      };

      // 任意フィールドを追加
      if (term.aliases && Array.isArray(term.aliases)) {
        entry.aliases = term.aliases;
      }
      if (term.relatedDocs && Array.isArray(term.relatedDocs)) {
        entry.relatedDocs = term.relatedDocs;
      }
      if (term.visibility) {
        entry.visibility = term.visibility;
      }
      if (term.tags && Array.isArray(term.tags)) {
        entry.tags = term.tags;
      }

      glossary.push(entry);
    }

    logger.success(`用語集解析完了: ${glossary.length}件`);
    return glossary;
  } catch (error) {
    logger.error(`用語集ファイルの解析エラー: ${error.message}`);
    return [];
  }
}

/**
 * MDX形式の用語集ファイルを解析
 *
 * 期待される形式（フロントマター）:
 * ---
 * terms:
 *   - id: registry
 *     term: Registry
 *     titles:
 *       en: Registry
 *       ja: レジストリ
 *     definition:
 *       en: A centralized...
 *       ja: ドキュメントを一元管理する...
 *     aliases:
 *       - reg
 *     relatedDocs:
 *       - getting-started
 * ---
 *
 * @param {string} filePath - MDX用語集ファイルのパス
 * @returns {Object[]} レジストリ形式のglossary配列
 */
function parseMdxGlossary(filePath) {
  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const { data: frontmatter } = matter(fileContent);

    if (!frontmatter.terms || !Array.isArray(frontmatter.terms)) {
      logger.warn('用語集ファイルのフロントマターに "terms" 配列が見つかりません');
      return [];
    }

    const glossary = [];

    for (const term of frontmatter.terms) {
      // 必須フィールドの検証
      if (!term.id || !term.term || !term.titles || !term.definition) {
        logger.warn(`不完全な用語エントリをスキップ: ${JSON.stringify(term)}`);
        continue;
      }

      // レジストリ形式に変換
      const entry = {
        id: term.id,
        term: term.term,
        titles: term.titles,
        definition: term.definition,
      };

      // 任意フィールドを追加
      if (term.aliases && Array.isArray(term.aliases)) {
        entry.aliases = term.aliases;
      }
      if (term.relatedDocs && Array.isArray(term.relatedDocs)) {
        entry.relatedDocs = term.relatedDocs;
      }
      if (term.visibility) {
        entry.visibility = term.visibility;
      }
      if (term.tags && Array.isArray(term.tags)) {
        entry.tags = term.tags;
      }

      glossary.push(entry);
    }

    logger.success(`用語集解析完了: ${glossary.length}件`);
    return glossary;
  } catch (error) {
    logger.error(`用語集ファイルの解析エラー: ${error.message}`);
    return [];
  }
}

/**
 * 用語IDの正規化（kebab-case化）
 *
 * 例:
 *   "Registry" → "registry"
 *   "Content Meta" → "content-meta"
 *   "API_Endpoint" → "api-endpoint"
 *
 * @param {string} id - 元のID
 * @returns {string} 正規化されたID
 */
function normalizeTermId(id) {
  return id
    .toLowerCase()
    .replace(/[_\s]+/g, '-') // アンダースコアと空白をハイフンに置換
    .replace(/[^a-z0-9-]/g, '') // 英数字とハイフン以外を除去
    .replace(/-+/g, '-') // 連続するハイフンを1つに
    .replace(/^-|-$/g, ''); // 先頭と末尾のハイフンを除去
}

/**
 * プロジェクトの用語集を解析してレジストリ形式に変換
 *
 * @param {string} projectPath - プロジェクトディレクトリのパス
 * @param {string} projectId - プロジェクトID
 * @returns {Object[]} レジストリ形式のglossary配列（存在しない場合は空配列）
 */
export function parseGlossary(projectPath, projectId) {
  logger.info('用語集を検索中...');

  // 用語集ファイルを検出
  const glossaryFile = detectGlossaryFile(projectPath);

  if (!glossaryFile) {
    logger.info('用語集ファイルが見つかりません。空の配列を返します。');
    return [];
  }

  // ファイル形式に応じて解析
  let glossary = [];

  if (glossaryFile.endsWith('.json')) {
    glossary = parseJsonGlossary(glossaryFile);
  } else if (glossaryFile.endsWith('.mdx')) {
    glossary = parseMdxGlossary(glossaryFile);
  } else {
    logger.warn(`未対応の用語集ファイル形式: ${glossaryFile}`);
    return [];
  }

  // 用語IDを正規化
  for (const entry of glossary) {
    const originalId = entry.id;
    entry.id = normalizeTermId(entry.id);
    if (entry.id !== originalId) {
      logger.info(`用語ID正規化: ${originalId} → ${entry.id}`);
    }
  }

  // 重複チェック
  const idSet = new Set();
  const duplicates = [];

  for (const entry of glossary) {
    if (idSet.has(entry.id)) {
      duplicates.push(entry.id);
    } else {
      idSet.add(entry.id);
    }
  }

  if (duplicates.length > 0) {
    logger.warn(`重複する用語IDが検出されました: ${duplicates.join(', ')}`);
  }

  return glossary;
}
