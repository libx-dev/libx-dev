#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const docsPath = path.join(rootDir, 'registry', 'docs.json');
const demoPath = path.join(rootDir, 'registry', 'demo-docs.json');

// レジストリファイルを読み込む
const docs = JSON.parse(fs.readFileSync(docsPath, 'utf8'));
const demo = JSON.parse(fs.readFileSync(demoPath, 'utf8'));

// demo-docsプロジェクトがまだ含まれていない場合のみ追加
const existingProject = docs.projects.find(p => p.id === 'demo-docs');

if (!existingProject) {
  // バックアップを作成
  const backupPath = path.join(rootDir, 'registry', 'docs.json.backup');
  fs.writeFileSync(backupPath, JSON.stringify(docs, null, 2));
  console.log('✅ Backup created:', backupPath);

  // demo-docsプロジェクトを追加
  docs.projects.push(demo.projects[0]);

  // 用語集があれば追加
  if (demo.glossaryTerms) {
    docs.glossaryTerms = docs.glossaryTerms || [];
    docs.glossaryTerms.push(...demo.glossaryTerms);
  }

  // 更新したレジストリを保存
  fs.writeFileSync(docsPath, JSON.stringify(docs, null, 2));
  console.log('✅ Added demo-docs project to registry/docs.json');
  console.log('   - Project ID: demo-docs');
  console.log('   - Languages: en, ja, ko');
  console.log('   - Documents:', demo.projects[0].documents.length);
} else {
  console.log('ℹ️  demo-docs project already exists in docs.json');
}
