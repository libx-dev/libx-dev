#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const docsPath = path.join(rootDir, 'registry', 'docs.json');

// レジストリファイルを読み込む
const docs = JSON.parse(fs.readFileSync(docsPath, 'utf8'));

// demo-docsプロジェクトを見つける
const demoProject = docs.projects.find(p => p.id === 'demo-docs');

if (!demoProject) {
  console.log('❌ demo-docs project not found');
  process.exit(1);
}

// ドキュメント形式を既存の形式に変換
const convertedDocuments = demoProject.documents.map(doc => ({
  id: doc.slug, // slugをidとして使用
  slug: `${doc.categoryId}/${doc.slug}`,
  title: doc.title,
  summary: doc.description,
  versions: [doc.versionId],
  status: 'published',
  visibility: doc.visibility,
  keywords: [],
  tags: [],
  content: Object.fromEntries(
    demoProject.languages.map(lang => [
      lang.code,
      {
        path: `demo-docs/v1/${lang.code}/${doc.categoryId}/${doc.slug}.mdx`,
        status: 'published'
      }
    ])
  ),
  license: 'MIT'
}));

// プロジェクト構造を既存形式に変換
const convertedProject = {
  id: demoProject.id,
  displayName: demoProject.displayName,
  description: demoProject.description,
  languages: demoProject.languages,
  versions: demoProject.versions,
  categories: demoProject.categories,
  documents: convertedDocuments
};

// demo-docsプロジェクトを置き換え
const projectIndex = docs.projects.findIndex(p => p.id === 'demo-docs');
docs.projects[projectIndex] = convertedProject;

// バックアップを作成
const backupPath = path.join(rootDir, 'registry', 'docs.json.backup2');
fs.writeFileSync(backupPath, fs.readFileSync(docsPath, 'utf8'));
console.log('✅ Backup created:', backupPath);

// 更新したレジストリを保存
fs.writeFileSync(docsPath, JSON.stringify(docs, null, 2));
console.log('✅ Fixed demo-docs schema in registry/docs.json');
console.log('   - Converted', convertedDocuments.length, 'documents to existing schema format');
console.log('   - Added content paths for', demoProject.languages.length, 'languages');
