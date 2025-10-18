#!/usr/bin/env node

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// @docs/generatorはTypeScriptファイル (.ts) なので、直接TypeScript形式で読み込む
import { loadRegistry, generateRobotsTxt, generateManifest, generateSitemap, sitemapToXml } from '../../generator/src/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  try {

    console.log('📄 メタデータファイルを生成中...\n');

    // レジストリを読み込み
    const registryPath = join(__dirname, '../../../registry/docs.json');
    const registry = loadRegistry(registryPath, join(__dirname, '../../..'));
    console.log(`✅ レジストリを読み込みました（${registry.projects.length}プロジェクト）\n`);

    // publicディレクトリを作成
    const publicDir = join(__dirname, '../public');
    mkdirSync(publicDir, { recursive: true });

    // robots.txt を生成
    console.log('🤖 robots.txt を生成中...');
    const robotsTxt = generateRobotsTxt('https://libx.dev', {
      sitemapUrl: '/sitemap.xml'
    });
    writeFileSync(join(publicDir, 'robots.txt'), robotsTxt);
    console.log('   ✅ robots.txt を生成しました\n');

    // サイトマップを生成
    console.log('🗺️  sitemap.xml を生成中...');
    const sitemap = generateSitemap(registry, 'https://libx.dev', {
      env: 'production',
      defaultChangefreq: 'weekly',
      defaultPriority: 0.5,
      latestVersionPriorityBoost: 0.3
    });
    const sitemapXml = sitemapToXml(sitemap);
    writeFileSync(join(publicDir, 'sitemap.xml'), sitemapXml);
    console.log(`   ✅ sitemap.xml を生成しました（${sitemap.length}件のURL）\n`);

    // 各プロジェクトのmanifest.jsonを生成
    console.log('📦 manifest.json を生成中...');
    for (const project of registry.projects) {
      const manifest = generateManifest(registry, project.id, {
        lang: 'ja',
        themeColor: '#1e40af'
      });

      if (manifest) {
        const manifestFilename = `${project.id}-manifest.json`;
        writeFileSync(
          join(publicDir, manifestFilename),
          JSON.stringify(manifest, null, 2)
        );
        console.log(`   ✅ ${manifestFilename} を生成しました`);
      }
    }

    // デフォルトのmanifest.jsonも生成
    if (registry.projects.length > 0) {
      const defaultManifest = generateManifest(registry, registry.projects[0].id, {
        lang: 'ja',
        themeColor: '#1e40af'
      });
      if (defaultManifest) {
        writeFileSync(
          join(publicDir, 'manifest.json'),
          JSON.stringify(defaultManifest, null, 2)
        );
        console.log(`   ✅ manifest.json を生成しました（デフォルト）\n`);
      }
    }

    console.log('🎉 メタデータファイルの生成が完了しました！');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

main();
