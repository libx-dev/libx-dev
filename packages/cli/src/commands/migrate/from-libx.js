/**
 * migrate from-libx コマンド
 *
 * 既存のlibx-devプロジェクト（project.config.json形式）を
 * 新レジストリ形式（registry/docs.json）へ自動変換します。
 */

import { resolve, join } from 'path';
import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'fs';
import * as logger from '../../utils/logger.js';
import { BackupManager } from '../../utils/backup.js';
import { RegistryManager } from '../../utils/registry.js';
import { parseProjectConfig, parseProjectDecorations } from './config-parser.js';
import { scanAllCategories } from './category-scanner.js';
import { scanAllDocuments } from './document-scanner.js';
import { generateAllContentMeta } from './content-meta.js';

/**
 * migrate from-libx コマンドのメイン処理
 *
 * @param {Object} globalOpts - グローバルオプション
 * @param {Object} cmdOpts - コマンドオプション
 */
export default async function migrateFromLibx(globalOpts, cmdOpts) {
  logger.info('='.repeat(60));
  logger.info('migrate from-libx: 既存プロジェクトの変換を開始');
  logger.info('='.repeat(60));

  try {
    // === 引数の検証 ===
    const sourcePath = cmdOpts.source
      ? resolve(cmdOpts.source)
      : process.cwd();

    const projectId = cmdOpts.projectId;
    if (!projectId) {
      throw new Error('--project-id オプションが必要です');
    }

    const targetPath = cmdOpts.target
      ? resolve(cmdOpts.target)
      : resolve('registry/docs.json');

    const topPagePath = cmdOpts.topPage
      ? resolve(cmdOpts.topPage)
      : resolve('apps/top-page');

    logger.info(`変換元: ${sourcePath}`);
    logger.info(`プロジェクトID: ${projectId}`);
    logger.info(`変換先: ${targetPath}`);
    logger.info(`dry-run: ${globalOpts.dryRun ? 'はい' : 'いいえ'}`);
    logger.info('');

    // === ソースディレクトリの存在確認 ===
    if (!existsSync(sourcePath)) {
      throw new Error(`ソースディレクトリが見つかりません: ${sourcePath}`);
    }

    const configPath = join(sourcePath, 'src/config/project.config.json');
    if (!existsSync(configPath)) {
      throw new Error(`設定ファイルが見つかりません: ${configPath}`);
    }

    // === レジストリの読み込みまたは初期化 ===
    let registry;
    if (existsSync(targetPath)) {
      logger.info(`既存のレジストリを読み込み: ${targetPath}`);
      const content = readFileSync(targetPath, "utf-8"); registry = JSON.parse(content);
    } else {
      logger.info('新しいレジストリを初期化');
      registry = {
        $schemaVersion: '1.0.0',
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'migrate-from-libx',
        },
        projects: [],
        settings: {
          siteUrl: 'https://example.com',
          defaultLocale: 'en',
          siteName: 'Documentation',
        },
      };
    }

    // === バックアップの作成 ===
    if (!globalOpts.dryRun && existsSync(targetPath)) {
      const backupManager = new BackupManager({ backupDir: cmdOpts.backup || '.backups' });
      logger.info(`バックアップを作成中...`);
      backupManager.backupFile(targetPath);
      logger.success('バックアップ作成完了');
      logger.info('');
    }

    // === プロジェクト設定の解析 ===
    logger.info('[1/6] プロジェクト設定を解析中...');
    const {
      projectData,
      categoryTranslations,
      supportedLangs,
      versions,
    } = parseProjectConfig(sourcePath, projectId);

    // === プロジェクト装飾情報の取得 ===
    logger.info('[2/6] プロジェクト装飾情報を取得中...');
    const decorations = parseProjectDecorations(topPagePath, projectId);
    Object.assign(projectData, decorations);

    // === カテゴリのスキャン ===
    logger.info('[3/6] カテゴリをスキャン中...');
    const categories = scanAllCategories(
      sourcePath,
      versions,
      supportedLangs,
      categoryTranslations
    );
    projectData.categories = categories;

    // === ドキュメントのスキャン ===
    logger.info('[4/6] ドキュメントをスキャン中...');
    const documents = scanAllDocuments(
      sourcePath,
      projectId,
      versions,
      supportedLangs
    );

    // === コンテンツメタの生成 ===
    logger.info('[5/6] コンテンツメタを生成中...');
    const documentsWithMeta = generateAllContentMeta(
      sourcePath,
      documents,
      versions,
      supportedLangs
    );

    // カテゴリごとにドキュメントを整理
    for (const category of categories) {
      category.docs = documentsWithMeta
        .filter((doc) => doc._categoryId === category.id)
        .sort((a, b) => a._order - b._order)
        .map((doc) => doc.id);
    }

    // ドキュメントデータから内部フィールドを削除
    for (const doc of documentsWithMeta) {
      delete doc._categoryId;
      delete doc._order;
      delete doc._files;
      delete doc._filePath;
      delete doc._relativePath;
      delete doc._wordCount;
    }

    projectData.documents = documentsWithMeta;

    // === レジストリへの統合 ===
    logger.info('[6/6] レジストリに統合中...');

    // 既存プロジェクトを削除（上書き）
    registry.projects = registry.projects.filter((p) => p.id !== projectId);

    // 新しいプロジェクトを追加
    registry.projects.push(projectData);

    // メタデータを更新
    registry.metadata.lastUpdated = new Date().toISOString();

    logger.success('レジストリへの統合完了');
    logger.info('');

    // === サマリーの表示 ===
    logger.info('='.repeat(60));
    logger.info('変換サマリー');
    logger.info('='.repeat(60));
    logger.info(`プロジェクトID: ${projectData.id}`);
    logger.info(`言語数: ${projectData.languages.length}`);
    logger.info(`バージョン数: ${projectData.versions.length}`);
    logger.info(`カテゴリ数: ${projectData.categories.length}`);
    logger.info(`ドキュメント数: ${projectData.documents.length}`);

    const totalContent = projectData.documents.reduce((sum, doc) => {
      return sum + Object.keys(doc.content).length;
    }, 0);
    logger.info(`コンテンツファイル数: ${totalContent}`);

    const publishedCount = projectData.documents.reduce((sum, doc) => {
      return (
        sum +
        Object.values(doc.content).filter((c) => c.status === 'published').length
      );
    }, 0);
    logger.info(`  published: ${publishedCount}`);

    const missingCount = projectData.documents.reduce((sum, doc) => {
      return (
        sum +
        Object.values(doc.content).filter((c) => c.status === 'missing').length
      );
    }, 0);
    logger.info(`  missing: ${missingCount}`);

    const draftCount = projectData.documents.reduce((sum, doc) => {
      return (
        sum +
        Object.values(doc.content).filter((c) => c.status === 'draft').length
      );
    }, 0);
    logger.info(`  draft: ${draftCount}`);

    logger.info('='.repeat(60));
    logger.info('');

    // === レジストリの保存 ===
    if (globalOpts.dryRun) {
      logger.warn('dry-runモード: レジストリは保存されません');
      logger.info('変換後のレジストリ（抜粋）:');
      console.log(JSON.stringify(projectData, null, 2).substring(0, 500) + '...');
    } else {
      logger.info(`レジストリを保存中: ${targetPath}`);
      const targetDir = dirname(targetPath); if (!existsSync(targetDir)) { mkdirSync(targetDir, { recursive: true }); } writeFileSync(targetPath, JSON.stringify(registry, null, 2), "utf-8");
      logger.success('レジストリ保存完了');
    }

    logger.info('');
    logger.success('migrate from-libx: 変換が完了しました！');
    logger.info('');
    logger.info('次のステップ:');
    logger.info('  1. レジストリを検証: docs-cli validate');
    logger.info('  2. プロジェクト一覧を表示: docs-cli list projects');
    logger.info('  3. ドキュメント一覧を表示: docs-cli list docs ' + projectId);
  } catch (error) {
    logger.error('変換中にエラーが発生しました');
    logger.error(error.message);

    if (error.stack && globalOpts.verbose) {
      logger.error('スタックトレース:');
      console.error(error.stack);
    }

    process.exit(1);
  }
}
