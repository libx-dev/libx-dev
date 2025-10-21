/**
 * searchコマンド実装
 *
 * レジストリ内のプロジェクト・ドキュメント・カテゴリ・用語集を検索
 */

import { createLogger, LOG_LEVELS } from '../utils/logger.js';
import { getConfigManager } from '../utils/config.js';
import { createRegistryManager } from '../utils/registry.js';

/**
 * 文字列内で検索クエリをハイライト
 */
function highlightQuery(text, query, jsonMode = false) {
  if (!text || !query) return text;

  if (jsonMode) {
    return text; // JSON出力時はハイライトしない
  }

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '\x1b[33m$1\x1b[0m'); // 黄色でハイライト
}

/**
 * テキストフィールド内を検索
 */
function searchInText(text, query, caseSensitive = false) {
  if (!text || !query) return false;

  const searchText = caseSensitive ? text : text.toLowerCase();
  const searchQuery = caseSensitive ? query : query.toLowerCase();

  return searchText.includes(searchQuery);
}

/**
 * 多言語フィールド内を検索
 */
function searchInMultilingualField(field, query, caseSensitive = false) {
  if (!field || typeof field !== 'object') return false;

  return Object.values(field).some(value =>
    searchInText(String(value), query, caseSensitive)
  );
}

/**
 * 配列フィールド内を検索
 */
function searchInArray(array, query, caseSensitive = false) {
  if (!Array.isArray(array) || array.length === 0) return false;

  return array.some(item => searchInText(String(item), query, caseSensitive));
}

/**
 * プロジェクトを検索
 */
function searchProjects(registry, query, options = {}) {
  const { caseSensitive = false, field } = options;
  const results = [];

  for (const project of registry.projects) {
    const matches = {
      id: false,
      displayName: false,
      description: false,
      tags: false,
    };

    // フィールド指定がある場合はそのフィールドのみ検索
    if (field) {
      switch (field) {
        case 'id':
          matches.id = searchInText(project.id, query, caseSensitive);
          break;
        case 'displayName':
          matches.displayName = searchInMultilingualField(project.displayName, query, caseSensitive);
          break;
        case 'description':
          matches.description = searchInMultilingualField(project.description, query, caseSensitive);
          break;
        case 'tags':
          matches.tags = project.tags && searchInArray(project.tags, query, caseSensitive);
          break;
      }
    } else {
      // 全フィールドを検索
      matches.id = searchInText(project.id, query, caseSensitive);
      matches.displayName = searchInMultilingualField(project.displayName, query, caseSensitive);
      matches.description = searchInMultilingualField(project.description, query, caseSensitive);
      matches.tags = project.tags && searchInArray(project.tags, query, caseSensitive);
    }

    if (Object.values(matches).some(Boolean)) {
      results.push({
        type: 'project',
        project: project.id,
        data: project,
        matches,
      });
    }
  }

  return results;
}

/**
 * ドキュメントを検索
 */
function searchDocuments(registry, query, options = {}) {
  const { caseSensitive = false, field, projectId, version, lang } = options;
  const results = [];

  for (const project of registry.projects) {
    // プロジェクトフィルタ
    if (projectId && project.id !== projectId) continue;

    for (const doc of project.documents || []) {
      // バージョンフィルタ
      if (version && !doc.versions?.includes(version)) continue;

      // 言語フィルタ
      if (lang && !doc.content?.[lang]) continue;

      const matches = {
        id: false,
        slug: false,
        title: false,
        summary: false,
        keywords: false,
        tags: false,
      };

      // フィールド指定がある場合はそのフィールドのみ検索
      if (field) {
        switch (field) {
          case 'id':
            matches.id = searchInText(doc.id, query, caseSensitive);
            break;
          case 'slug':
            matches.slug = searchInText(doc.slug, query, caseSensitive);
            break;
          case 'title':
            matches.title = searchInMultilingualField(doc.title, query, caseSensitive);
            break;
          case 'summary':
            matches.summary = doc.summary && (
              typeof doc.summary === 'string'
                ? searchInText(doc.summary, query, caseSensitive)
                : searchInMultilingualField(doc.summary, query, caseSensitive)
            );
            break;
          case 'keywords':
            matches.keywords = doc.keywords && searchInArray(doc.keywords, query, caseSensitive);
            break;
          case 'tags':
            matches.tags = doc.tags && searchInArray(doc.tags, query, caseSensitive);
            break;
        }
      } else {
        // 全フィールドを検索
        matches.id = searchInText(doc.id, query, caseSensitive);
        matches.slug = searchInText(doc.slug, query, caseSensitive);
        matches.title = searchInMultilingualField(doc.title, query, caseSensitive);
        matches.summary = doc.summary && (
          typeof doc.summary === 'string'
            ? searchInText(doc.summary, query, caseSensitive)
            : searchInMultilingualField(doc.summary, query, caseSensitive)
        );
        matches.keywords = doc.keywords && searchInArray(doc.keywords, query, caseSensitive);
        matches.tags = doc.tags && searchInArray(doc.tags, query, caseSensitive);
      }

      if (Object.values(matches).some(Boolean)) {
        results.push({
          type: 'document',
          project: project.id,
          data: doc,
          matches,
        });
      }
    }
  }

  return results;
}

/**
 * カテゴリを検索
 */
function searchCategories(registry, query, options = {}) {
  const { caseSensitive = false, projectId } = options;
  const results = [];

  for (const project of registry.projects) {
    // プロジェクトフィルタ
    if (projectId && project.id !== projectId) continue;

    for (const category of project.categories || []) {
      const matches = {
        id: false,
        displayName: false,
        description: false,
      };

      matches.id = searchInText(category.id, query, caseSensitive);
      matches.displayName = searchInMultilingualField(category.displayName, query, caseSensitive);
      matches.description = category.description &&
        searchInMultilingualField(category.description, query, caseSensitive);

      if (Object.values(matches).some(Boolean)) {
        results.push({
          type: 'category',
          project: project.id,
          data: category,
          matches,
        });
      }
    }
  }

  return results;
}

/**
 * 用語集を検索
 */
function searchGlossary(registry, query, options = {}) {
  const { caseSensitive = false, projectId } = options;
  const results = [];

  for (const project of registry.projects) {
    // プロジェクトフィルタ
    if (projectId && project.id !== projectId) continue;

    for (const term of project.glossary || []) {
      const matches = {
        term: false,
        definition: false,
        abbreviation: false,
      };

      matches.term = searchInMultilingualField(term.term, query, caseSensitive);
      matches.definition = searchInMultilingualField(term.definition, query, caseSensitive);
      matches.abbreviation = term.abbreviation &&
        searchInText(term.abbreviation, query, caseSensitive);

      if (Object.values(matches).some(Boolean)) {
        results.push({
          type: 'glossary',
          project: project.id,
          data: term,
          matches,
        });
      }
    }
  }

  return results;
}

/**
 * テキスト形式で結果を表示
 */
function displayTextResults(results, query, logger, jsonMode) {
  if (results.length === 0) {
    logger.info(`検索結果なし: "${query}"`);
    return;
  }

  logger.info(`\n🔍 検索結果: "${query}" (${results.length}件)\n`);

  const grouped = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {});

  // プロジェクト
  if (grouped.project) {
    logger.info('📦 プロジェクト:');
    grouped.project.forEach(r => {
      const displayName = r.data.displayName?.en || r.data.displayName?.ja || r.data.id;
      logger.info(`  • ${highlightQuery(r.data.id, query, jsonMode)} - ${displayName}`);

      if (r.matches.description) {
        const desc = r.data.description?.en || r.data.description?.ja || '';
        logger.info(`    ${highlightQuery(desc.substring(0, 80), query, jsonMode)}...`);
      }
    });
    logger.newline();
  }

  // ドキュメント
  if (grouped.document) {
    logger.info('📄 ドキュメント:');
    grouped.document.forEach(r => {
      const title = r.data.title?.en || r.data.title?.ja || r.data.slug;
      logger.info(`  • [${r.project}] ${highlightQuery(r.data.id, query, jsonMode)} - ${title}`);
      logger.info(`    スラッグ: ${highlightQuery(r.data.slug, query, jsonMode)}`);

      if (r.matches.summary && r.data.summary) {
        logger.info(`    概要: ${highlightQuery(r.data.summary.substring(0, 80), query, jsonMode)}...`);
      }

      if (r.matches.keywords && r.data.keywords) {
        logger.info(`    キーワード: ${r.data.keywords.map(k => highlightQuery(k, query, jsonMode)).join(', ')}`);
      }
    });
    logger.newline();
  }

  // カテゴリ
  if (grouped.category) {
    logger.info('📂 カテゴリ:');
    grouped.category.forEach(r => {
      const displayName = r.data.displayName?.en || r.data.displayName?.ja || r.data.id;
      logger.info(`  • [${r.project}] ${highlightQuery(r.data.id, query, jsonMode)} - ${displayName}`);
    });
    logger.newline();
  }

  // 用語集
  if (grouped.glossary) {
    logger.info('📖 用語集:');
    grouped.glossary.forEach(r => {
      const term = r.data.term?.en || r.data.term?.ja || '';
      const definition = r.data.definition?.en || r.data.definition?.ja || '';
      logger.info(`  • [${r.project}] ${highlightQuery(term, query, jsonMode)}`);
      logger.info(`    ${highlightQuery(definition.substring(0, 80), query, jsonMode)}...`);
    });
    logger.newline();
  }

  logger.separator();
  logger.info(`合計: ${results.length}件の結果が見つかりました`);
}

/**
 * JSON形式で結果を表示
 */
function displayJsonResults(results, query, logger) {
  const output = {
    query,
    count: results.length,
    results: results.map(r => ({
      type: r.type,
      project: r.project,
      data: r.data,
      matches: r.matches,
    })),
  };

  logger.info(JSON.stringify(output, null, 2));
}

/**
 * searchコマンドのメイン処理
 */
export default async function searchCommand(query, globalOpts, cmdOpts) {
  // ロガーの初期化
  const logger = globalOpts.json
    ? createLogger({ jsonMode: true })
    : createLogger({ verbose: globalOpts.verbose });

  if (globalOpts.verbose) {
    logger.setLevel(LOG_LEVELS.DEBUG);
  }

  try {
    if (!query || query.trim() === '') {
      logger.error('検索クエリを指定してください');
      logger.info('使用例: pnpm docs-cli search "検索キーワード"');
      process.exit(1);
    }

    if (!globalOpts.json) {
      logger.info(`レジストリ検索: "${query}"`);
      logger.separator();
    }

    // 設定とマネージャーの初期化
    const configManager = getConfigManager();
    const registryManager = createRegistryManager({
      registryPath: configManager.getRegistryPath(),
      projectRoot: configManager.projectRoot,
    });

    registryManager.load();
    const registry = registryManager.get();

    // 検索オプション
    const searchOptions = {
      caseSensitive: cmdOpts.caseSensitive || false,
      field: cmdOpts.field,
      projectId: cmdOpts.project,
      version: cmdOpts.version,
      lang: cmdOpts.lang,
    };

    if (globalOpts.verbose) {
      logger.debug('検索オプション:', searchOptions);
    }

    // 検索実行
    let results = [];
    const types = cmdOpts.type ? cmdOpts.type.split(',') : ['project', 'document', 'category', 'glossary'];

    if (types.includes('project')) {
      results.push(...searchProjects(registry, query, searchOptions));
    }

    if (types.includes('document')) {
      results.push(...searchDocuments(registry, query, searchOptions));
    }

    if (types.includes('category')) {
      results.push(...searchCategories(registry, query, searchOptions));
    }

    if (types.includes('glossary')) {
      results.push(...searchGlossary(registry, query, searchOptions));
    }

    // 結果の表示
    if (globalOpts.json) {
      displayJsonResults(results, query, logger);
    } else {
      displayTextResults(results, query, logger, false);
    }

    // 終了コード（結果がない場合は1）
    process.exit(results.length > 0 ? 0 : 1);

  } catch (error) {
    logger.error(`検索に失敗しました: ${error.message}`);

    if (globalOpts.verbose) {
      logger.error(error.stack);
    }

    process.exit(1);
  }
}
