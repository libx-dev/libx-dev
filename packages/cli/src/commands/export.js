/**
 * exportコマンド実装
 *
 * レジストリデータをJSON/CSV/Markdown形式でエクスポート
 */

import fs from 'fs';
import path from 'path';
import { createLogger, LOG_LEVELS } from '../utils/logger.js';
import { getConfigManager } from '../utils/config.js';
import { createRegistryManager } from '../utils/registry.js';

/**
 * JSON形式でエクスポート
 */
function exportToJson(data, options = {}) {
  const { pretty = true } = options;
  return JSON.stringify(data, null, pretty ? 2 : 0);
}

/**
 * CSV形式でエクスポート（プロジェクト一覧）
 */
function exportProjectsToCSV(projects) {
  const lines = [
    '"ID","Display Name (EN)","Display Name (JA)","Description (EN)","Description (JA)","Default Version","Default Language","Status","Languages","Versions"',
  ];

  for (const project of projects) {
    const displayNameEn = (project.displayName?.en || '').replace(/"/g, '""');
    const displayNameJa = (project.displayName?.ja || '').replace(/"/g, '""');
    const descriptionEn = (project.description?.en || '').replace(/"/g, '""');
    const descriptionJa = (project.description?.ja || '').replace(/"/g, '""');
    const languages = project.languages?.map(l => l.code).join(';') || '';
    const versions = project.versions?.map(v => v.id).join(';') || '';

    lines.push(
      `"${project.id}","${displayNameEn}","${displayNameJa}","${descriptionEn}","${descriptionJa}","${project.defaultVersion || ''}","${project.defaultLanguage || ''}","${project.status || ''}","${languages}","${versions}"`
    );
  }

  return lines.join('\n');
}

/**
 * CSV形式でエクスポート（ドキュメント一覧）
 */
function exportDocumentsToCSV(documents, projectId) {
  const lines = [
    '"Project","Document ID","Slug","Title (EN)","Title (JA)","Summary","Status","Visibility","Versions","Keywords","Tags","Last Updated"',
  ];

  for (const doc of documents) {
    const titleEn = (doc.title?.en || '').replace(/"/g, '""');
    const titleJa = (doc.title?.ja || '').replace(/"/g, '""');
    // summaryは文字列または多言語オブジェクトの可能性がある
    const summaryText = typeof doc.summary === 'string'
      ? doc.summary
      : (doc.summary?.en || doc.summary?.ja || '');
    const summary = summaryText.replace(/"/g, '""');
    const versions = doc.versions?.join(';') || '';
    const keywords = doc.keywords?.join(';') || '';
    const tags = doc.tags?.join(';') || '';

    lines.push(
      `"${projectId}","${doc.id}","${doc.slug}","${titleEn}","${titleJa}","${summary}","${doc.status || ''}","${doc.visibility || ''}","${versions}","${keywords}","${tags}","${doc.lastUpdated || ''}"`
    );
  }

  return lines.join('\n');
}

/**
 * CSV形式でエクスポート（カテゴリ一覧）
 */
function exportCategoriesToCSV(categories, projectId) {
  const lines = [
    '"Project","Category ID","Display Name (EN)","Display Name (JA)","Description (EN)","Description (JA)","Order","Parent","Documents"',
  ];

  for (const category of categories) {
    const displayNameEn = (category.displayName?.en || '').replace(/"/g, '""');
    const displayNameJa = (category.displayName?.ja || '').replace(/"/g, '""');
    const descriptionEn = (category.description?.en || '').replace(/"/g, '""');
    const descriptionJa = (category.description?.ja || '').replace(/"/g, '""');
    const docs = category.docs ? Object.keys(category.docs).join(';') : '';

    lines.push(
      `"${projectId}","${category.id}","${displayNameEn}","${displayNameJa}","${descriptionEn}","${descriptionJa}","${category.order || ''}","${category.parent || ''}","${docs}"`
    );
  }

  return lines.join('\n');
}

/**
 * CSV形式でエクスポート（用語集）
 */
function exportGlossaryToCSV(glossary, projectId) {
  const lines = [
    '"Project","Term (EN)","Term (JA)","Definition (EN)","Definition (JA)","Abbreviation","Related Docs"',
  ];

  for (const term of glossary) {
    const termEn = (term.term?.en || '').replace(/"/g, '""');
    const termJa = (term.term?.ja || '').replace(/"/g, '""');
    const definitionEn = (term.definition?.en || '').replace(/"/g, '""');
    const definitionJa = (term.definition?.ja || '').replace(/"/g, '""');
    const relatedDocs = term.relatedDocs?.join(';') || '';

    lines.push(
      `"${projectId}","${termEn}","${termJa}","${definitionEn}","${definitionJa}","${term.abbreviation || ''}","${relatedDocs}"`
    );
  }

  return lines.join('\n');
}

/**
 * Markdown形式でエクスポート（プロジェクト一覧）
 */
function exportProjectsToMarkdown(projects) {
  const lines = [
    '# プロジェクト一覧\n',
    '| ID | 表示名 (EN) | 表示名 (JA) | 言語 | バージョン | ステータス |',
    '|----|------------|------------|------|-----------|----------|',
  ];

  for (const project of projects) {
    const displayNameEn = project.displayName?.en || '';
    const displayNameJa = project.displayName?.ja || '';
    const languages = project.languages?.map(l => l.code).join(', ') || '';
    const versions = project.versions?.map(v => v.id).join(', ') || '';

    lines.push(
      `| ${project.id} | ${displayNameEn} | ${displayNameJa} | ${languages} | ${versions} | ${project.status || ''} |`
    );
  }

  return lines.join('\n');
}

/**
 * Markdown形式でエクスポート（ドキュメント一覧）
 */
function exportDocumentsToMarkdown(documents, projectId) {
  const lines = [
    `# ドキュメント一覧 - ${projectId}\n`,
    '| Doc ID | スラッグ | タイトル (EN) | タイトル (JA) | バージョン | ステータス |',
    '|--------|---------|--------------|--------------|-----------|----------|',
  ];

  for (const doc of documents) {
    const titleEn = doc.title?.en || '';
    const titleJa = doc.title?.ja || '';
    const versions = doc.versions?.join(', ') || '';

    lines.push(
      `| ${doc.id} | ${doc.slug} | ${titleEn} | ${titleJa} | ${versions} | ${doc.status || ''} |`
    );
  }

  return lines.join('\n');
}

/**
 * Markdown形式でエクスポート（カテゴリ一覧）
 */
function exportCategoriesToMarkdown(categories, projectId) {
  const lines = [
    `# カテゴリ一覧 - ${projectId}\n`,
    '| Category ID | 表示名 (EN) | 表示名 (JA) | 順序 | 親カテゴリ |',
    '|-------------|------------|------------|------|-----------|',
  ];

  for (const category of categories) {
    const displayNameEn = category.displayName?.en || '';
    const displayNameJa = category.displayName?.ja || '';

    lines.push(
      `| ${category.id} | ${displayNameEn} | ${displayNameJa} | ${category.order || ''} | ${category.parent || ''} |`
    );
  }

  return lines.join('\n');
}

/**
 * Markdown形式でエクスポート（用語集）
 */
function exportGlossaryToMarkdown(glossary, projectId) {
  const lines = [
    `# 用語集 - ${projectId}\n`,
    '| 用語 (EN) | 用語 (JA) | 定義 (EN) | 定義 (JA) | 略称 |',
    '|----------|----------|----------|----------|------|',
  ];

  for (const term of glossary) {
    const termEn = term.term?.en || '';
    const termJa = term.term?.ja || '';
    const definitionEn = term.definition?.en || '';
    const definitionJa = term.definition?.ja || '';

    lines.push(
      `| ${termEn} | ${termJa} | ${definitionEn} | ${definitionJa} | ${term.abbreviation || ''} |`
    );
  }

  return lines.join('\n');
}

/**
 * データを準備
 */
function prepareExportData(registry, options) {
  const { type, projectId } = options;
  const exportData = {};

  // プロジェクトフィルタ
  const projects = projectId
    ? registry.projects.filter(p => p.id === projectId)
    : registry.projects;

  if (projects.length === 0) {
    throw new Error(`プロジェクト "${projectId}" が見つかりません`);
  }

  // エクスポート対象の選択
  if (type === 'all' || type === 'projects') {
    exportData.projects = projects;
  }

  if (type === 'all' || type === 'documents') {
    exportData.documents = projects.flatMap(p =>
      (p.documents || []).map(doc => ({ projectId: p.id, ...doc }))
    );
  }

  if (type === 'all' || type === 'categories') {
    exportData.categories = projects.flatMap(p =>
      (p.categories || []).map(cat => ({ projectId: p.id, ...cat }))
    );
  }

  if (type === 'all' || type === 'glossary') {
    exportData.glossary = projects.flatMap(p =>
      (p.glossary || []).map(term => ({ projectId: p.id, ...term }))
    );
  }

  return exportData;
}

/**
 * フォーマットに応じてエクスポート
 */
function formatExport(exportData, format, projectId) {
  switch (format) {
    case 'json':
      return exportToJson(exportData, { pretty: true });

    case 'csv': {
      const parts = [];
      if (exportData.projects) {
        parts.push('# Projects\n' + exportProjectsToCSV(exportData.projects));
      }
      if (exportData.documents) {
        const groupedDocs = exportData.documents.reduce((acc, doc) => {
          const pid = doc.projectId;
          if (!acc[pid]) acc[pid] = [];
          acc[pid].push(doc);
          return acc;
        }, {});

        Object.entries(groupedDocs).forEach(([pid, docs]) => {
          parts.push(`\n# Documents - ${pid}\n` + exportDocumentsToCSV(docs, pid));
        });
      }
      if (exportData.categories) {
        const groupedCats = exportData.categories.reduce((acc, cat) => {
          const pid = cat.projectId;
          if (!acc[pid]) acc[pid] = [];
          acc[pid].push(cat);
          return acc;
        }, {});

        Object.entries(groupedCats).forEach(([pid, cats]) => {
          parts.push(`\n# Categories - ${pid}\n` + exportCategoriesToCSV(cats, pid));
        });
      }
      if (exportData.glossary) {
        const groupedGlossary = exportData.glossary.reduce((acc, term) => {
          const pid = term.projectId;
          if (!acc[pid]) acc[pid] = [];
          acc[pid].push(term);
          return acc;
        }, {});

        Object.entries(groupedGlossary).forEach(([pid, terms]) => {
          parts.push(`\n# Glossary - ${pid}\n` + exportGlossaryToCSV(terms, pid));
        });
      }
      return parts.join('\n\n');
    }

    case 'markdown': {
      const parts = [];
      if (exportData.projects) {
        parts.push(exportProjectsToMarkdown(exportData.projects));
      }
      if (exportData.documents) {
        const groupedDocs = exportData.documents.reduce((acc, doc) => {
          const pid = doc.projectId;
          if (!acc[pid]) acc[pid] = [];
          acc[pid].push(doc);
          return acc;
        }, {});

        Object.entries(groupedDocs).forEach(([pid, docs]) => {
          parts.push(exportDocumentsToMarkdown(docs, pid));
        });
      }
      if (exportData.categories) {
        const groupedCats = exportData.categories.reduce((acc, cat) => {
          const pid = cat.projectId;
          if (!acc[pid]) acc[pid] = [];
          acc[pid].push(cat);
          return acc;
        }, {});

        Object.entries(groupedCats).forEach(([pid, cats]) => {
          parts.push(exportCategoriesToMarkdown(cats, pid));
        });
      }
      if (exportData.glossary) {
        const groupedGlossary = exportData.glossary.reduce((acc, term) => {
          const pid = term.projectId;
          if (!acc[pid]) acc[pid] = [];
          acc[pid].push(term);
          return acc;
        }, {});

        Object.entries(groupedGlossary).forEach(([pid, terms]) => {
          parts.push(exportGlossaryToMarkdown(terms, pid));
        });
      }
      return parts.join('\n\n---\n\n');
    }

    default:
      throw new Error(`サポートされていないフォーマット: ${format}`);
  }
}

/**
 * exportコマンドのメイン処理
 */
export default async function exportCommand(globalOpts, cmdOpts) {
  // ロガーの初期化
  const logger = globalOpts.json
    ? createLogger({ jsonMode: true })
    : createLogger({ verbose: globalOpts.verbose });

  if (globalOpts.verbose) {
    logger.setLevel(LOG_LEVELS.DEBUG);
  }

  try {
    const format = cmdOpts.format || 'json';
    const type = cmdOpts.type || 'all';
    const projectId = cmdOpts.project;
    const outputPath = cmdOpts.output;

    if (!['json', 'csv', 'markdown'].includes(format)) {
      logger.error(`サポートされていないフォーマット: ${format}`);
      logger.info('使用可能なフォーマット: json, csv, markdown');
      process.exit(1);
    }

    if (!['projects', 'documents', 'categories', 'glossary', 'all'].includes(type)) {
      logger.error(`サポートされていないタイプ: ${type}`);
      logger.info('使用可能なタイプ: projects, documents, categories, glossary, all');
      process.exit(1);
    }

    if (!globalOpts.json) {
      logger.info(`レジストリエクスポート: ${format} 形式`);
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

    if (globalOpts.verbose) {
      logger.debug(`エクスポートタイプ: ${type}`);
      logger.debug(`プロジェクトフィルタ: ${projectId || 'なし'}`);
    }

    // データ準備
    const exportData = prepareExportData(registry, { type, projectId });

    // フォーマット変換
    const formattedData = formatExport(exportData, format, projectId);

    // 出力
    if (outputPath) {
      // ファイルに出力
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, formattedData, 'utf-8');

      if (!globalOpts.json) {
        logger.success(`エクスポート完了: ${outputPath}`);

        const stats = fs.statSync(outputPath);
        logger.info(`ファイルサイズ: ${(stats.size / 1024).toFixed(2)} KB`);
      }
    } else {
      // 標準出力に出力
      console.log(formattedData);
    }

    if (!globalOpts.json && outputPath) {
      logger.separator();
      logger.info('エクスポート統計:');
      if (exportData.projects) {
        logger.info(`  プロジェクト: ${exportData.projects.length}件`);
      }
      if (exportData.documents) {
        logger.info(`  ドキュメント: ${exportData.documents.length}件`);
      }
      if (exportData.categories) {
        logger.info(`  カテゴリ: ${exportData.categories.length}件`);
      }
      if (exportData.glossary) {
        logger.info(`  用語集: ${exportData.glossary.length}件`);
      }
    }

  } catch (error) {
    logger.error(`エクスポートに失敗しました: ${error.message}`);

    if (globalOpts.verbose) {
      logger.error(error.stack);
    }

    process.exit(1);
  }
}
