/**
 * migrate from-libx コマンド
 *
 * 既存のlibx-devプロジェクト（project.config.json形式）を
 * 新レジストリ形式（registry/docs.json）へ自動変換します。
 */

import { resolve, join, dirname } from 'path';
import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'fs';
import cliProgress from 'cli-progress';
import * as logger from '../../utils/logger.js';
import { BackupManager } from '../../utils/backup.js';
import { RegistryManager } from '../../utils/registry.js';
import { parseProjectConfig, parseProjectDecorations } from './config-parser.js';
import { scanAllCategories } from './category-scanner.js';
import { scanAllDocuments } from './document-scanner.js';
import { generateAllContentMeta } from './content-meta.js';
import { parseGlossary } from './glossary-parser.js';
import { deduplicateSlugs } from './slug-deduplicator.js';

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

  // 開始時刻を記録
  const startTime = Date.now();

  // バックアップマネージャーを初期化（エラー時のロールバック用）
  const backupManager = new BackupManager({
    backupDir: cmdOpts.backup || '.backups'
  });

  // プログレスバーの作成
  const progressBar = new cliProgress.SingleBar({
    format: '進行状況 |{bar}| {percentage}% | {stage}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });

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

    // プログレスバーを開始（8段階）
    progressBar.start(8, 0, { stage: '初期化中...' });

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
      try {
        const content = readFileSync(targetPath, "utf-8");
        registry = JSON.parse(content);
      } catch (error) {
        throw new Error(`レジストリの読み込みに失敗しました: ${error.message}`);
      }
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
      logger.info(`バックアップを作成中...`);
      backupManager.backupFile(targetPath);
      logger.success('バックアップ作成完了');
      logger.info('');
    }

    // === プロジェクト設定の解析 ===
    progressBar.update(1, { stage: 'プロジェクト設定を解析中...' });
    logger.info('[1/8] プロジェクト設定を解析中...');
    const {
      projectData,
      categoryTranslations,
      supportedLangs,
      versions,
    } = parseProjectConfig(sourcePath, projectId);

    // === プロジェクト装飾情報の取得 ===
    progressBar.update(2, { stage: 'プロジェクト装飾情報を取得中...' });
    logger.info('[2/8] プロジェクト装飾情報を取得中...');
    const decorations = parseProjectDecorations(topPagePath, projectId);
    Object.assign(projectData, decorations);

    // === カテゴリのスキャン ===
    progressBar.update(3, { stage: 'カテゴリをスキャン中...' });
    logger.info('[3/8] カテゴリをスキャン中...');
    const categories = scanAllCategories(
      sourcePath,
      versions,
      supportedLangs,
      categoryTranslations
    );
    projectData.categories = categories;

    // === ドキュメントのスキャン ===
    progressBar.update(4, { stage: 'ドキュメントをスキャン中...' });
    logger.info('[4/8] ドキュメントをスキャン中...');
    let documents = scanAllDocuments(
      sourcePath,
      projectId,
      versions,
      supportedLangs
    );

    // === スラッグ重複の検知と解決 ===
    progressBar.update(5, { stage: 'スラッグ重複を検知中...' });
    logger.info('[5/8] スラッグ重複を検知中...');
    documents = deduplicateSlugs(documents);

    // === コンテンツメタの生成 ===
    progressBar.update(6, { stage: 'コンテンツメタを生成中...' });
    logger.info('[6/8] コンテンツメタを生成中...');
    const documentsWithMeta = generateAllContentMeta(
      sourcePath,
      documents,
      versions,
      supportedLangs
    );

    // === Glossary（用語集）の解析 ===
    progressBar.update(7, { stage: 'Glossaryを解析中...' });
    logger.info('[7/8] Glossary（用語集）を解析中...');
    const glossary = parseGlossary(sourcePath, projectId);
    if (glossary.length > 0) {
      projectData.glossary = glossary;
    }

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
    progressBar.update(8, { stage: 'レジストリに統合中...' });
    logger.info('[8/8] レジストリに統合中...');

    // 既存プロジェクトを削除（上書き）
    registry.projects = registry.projects.filter((p) => p.id !== projectId);

    // 新しいプロジェクトを追加
    registry.projects.push(projectData);

    // メタデータを更新
    registry.metadata.lastUpdated = new Date().toISOString();

    // プログレスバーを停止
    progressBar.stop();

    logger.success('レジストリへの統合完了');
    logger.info('');

    // === 処理時間を計算 ===
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // === 詳細統計情報の収集 ===
    const totalContent = projectData.documents.reduce((sum, doc) => {
      return sum + Object.keys(doc.content).length;
    }, 0);

    const publishedCount = projectData.documents.reduce((sum, doc) => {
      return (
        sum +
        Object.values(doc.content).filter((c) => c.status === 'published').length
      );
    }, 0);

    const missingCount = projectData.documents.reduce((sum, doc) => {
      return (
        sum +
        Object.values(doc.content).filter((c) => c.status === 'missing').length
      );
    }, 0);

    const draftCount = projectData.documents.reduce((sum, doc) => {
      return (
        sum +
        Object.values(doc.content).filter((c) => c.status === 'draft').length
      );
    }, 0);

    const inReviewCount = projectData.documents.reduce((sum, doc) => {
      return (
        sum +
        Object.values(doc.content).filter((c) => c.status === 'in-review').length
      );
    }, 0);

    const glossaryCount = projectData.glossary ? projectData.glossary.length : 0;

    // 警告とエラーの収集（スラッグ重複など）
    const warnings = [];
    const errors = [];

    // === 詳細統計情報の表示 ===
    logger.info('\n' + '='.repeat(60));
    logger.info('📊 詳細統計情報');
    logger.info('='.repeat(60));
    logger.info(`処理時間: ${processingTime}ms (${(processingTime / 1000).toFixed(2)}秒)`);
    logger.info('');
    logger.info('【プロジェクト情報】');
    logger.info(`  プロジェクトID: ${projectData.id}`);
    logger.info(`  言語数: ${projectData.languages.length}`);
    logger.info(`  バージョン数: ${projectData.versions.length}`);
    logger.info('');
    logger.info('【コンテンツ情報】');
    logger.info(`  カテゴリ数: ${projectData.categories.length}`);
    logger.info(`  ドキュメント数: ${projectData.documents.length}`);
    logger.info(`  Glossary用語数: ${glossaryCount}`);
    logger.info('');
    logger.info('【コンテンツファイル】');
    logger.info(`  合計: ${totalContent} ファイル`);
    logger.info(`  published: ${publishedCount}`);
    logger.info(`  missing: ${missingCount}`);
    logger.info(`  draft: ${draftCount}`);
    logger.info(`  in-review: ${inReviewCount}`);

    if (warnings.length > 0) {
      logger.info('');
      logger.warn(`⚠️  警告数: ${warnings.length}`);
    }

    if (errors.length > 0) {
      logger.info('');
      logger.error(`❌ エラー数: ${errors.length}`);
    }

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
    logger.error('='.repeat(60));
    logger.error('変換中にエラーが発生しました');
    logger.error('='.repeat(60));
    logger.error(`エラー: ${error.message}`);

    if (error.stack && globalOpts.verbose) {
      logger.error('スタックトレース:');
      console.error(error.stack);
    }

    // バックアップが存在する場合はロールバックを実行
    if (!globalOpts.dryRun && backupManager.backups.size > 0) {
      logger.info('');
      logger.warn('エラーが発生したため、ロールバックを実行します...');

      try {
        await backupManager.rollback();
        logger.success('ロールバックが完了しました');
        logger.info('');
        logger.info('バックアップから復元するには以下のコマンドを実行してください:');
        logger.info(`  docs-cli migrate rollback --backup-dir ${backupManager.backupDir}`);
      } catch (rollbackError) {
        logger.error(`ロールバックに失敗しました: ${rollbackError.message}`);
        logger.info('');
        logger.info('手動でバックアップから復元してください:');
        logger.info(`  バックアップディレクトリ: ${backupManager.sessionDir}`);
      }
    }

    logger.info('');
    logger.info('トラブルシューティング:');
    logger.info('  1. ソースディレクトリとプロジェクトIDを確認してください');
    logger.info('  2. 設定ファイル（project.config.json）の形式を確認してください');
    logger.info('  3. --verbose オプションで詳細なエラー情報を表示できます');
    logger.info('  4. バックアップは .backups/ ディレクトリに保存されています');

    process.exit(1);
  } finally {
    // クリーンアップ: 古いバックアップを削除（最大5件保持）
    if (!globalOpts.dryRun) {
      BackupManager.cleanup({
        backupDir: cmdOpts.backup || '.backups',
        keepCount: 5,
      });
    }
  }
}
