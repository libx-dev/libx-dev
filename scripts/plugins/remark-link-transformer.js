/**
 * MDXリンク変換プラグイン
 * 
 * このプラグインは、MDXファイル内のリンクを以下のように変換します：
 * 1. 相対リンク: 同じディレクトリ内のファイルへのリンクを正しいパスに変換
 * 2. プロジェクト内絶対パス: /v1/ja/... のようなパスにベースパスを追加
 * 3. その他の絶対パス: /01-guide/... のようなパスに言語・バージョンとベースパスを追加
 */

import { visit } from 'unist-util-visit';
import path from 'path';

export function remarkLinkTransformer(options = {}) {
  const { baseUrl = '/docs/sample-docs' } = options;
  
  return function transformer(tree, file) {
    // ファイルパスから現在の位置情報を取得
    const filePath = file.history[0] || '';
    const relativePath = path.relative(process.cwd(), filePath);
    
    // content/docs/[version]/[lang]/... の形式からパラメータを抽出
    const pathMatch = relativePath.match(/content\/docs\/([v0-9.]+)\/([a-z-]+)\/(.+)\.mdx?$/);
    if (!pathMatch) {
      // パスが期待される形式でない場合はスキップ
      return;
    }
    
    const [, version, lang, currentPath] = pathMatch;
    const currentDir = path.dirname(currentPath);
    
    visit(tree, 'link', (node) => {
      const url = node.url;
      
      // 外部URLやアンカーリンクはスキップ
      if (url.startsWith('http') || url.startsWith('#') || url.startsWith('mailto:')) {
        return;
      }
      
      // 1. 相対リンクの処理 (例: "02-creating-documents" or "./02-creating-documents")
      if (!url.startsWith('/')) {
        // ./ プレフィックスを削除
        let targetFile = url.replace(/^\.\//, '');
        
        // 同じディレクトリ内のファイルへのリンクを構築
        // currentDirが '01-guide' で targetFileが '01-getting-started' の場合
        // '/docs/libx-docs/v1/ja/01-guide/01-getting-started' になる
        let targetPath;
        if (currentDir === '.') {
          // ルートレベルの場合
          targetPath = targetFile;
        } else {
          // サブディレクトリの場合、同じディレクトリ内のファイルを指す
          targetPath = `${currentDir}/${targetFile}`;
        }
        
        // 最終的なURLを構築（バージョンファースト）
        node.url = `${baseUrl}/${version}/${lang}/${targetPath}`;
        
        console.log(`[Link Transform] 相対リンク変換: ${url} → ${node.url}`);
        return;
      }
      
      // 2. プロジェクト内絶対パス（バージョンファースト）の処理 (例: "/v1/ja/01-guide/01-getting-started")
      if (url.match(/^\/v[0-9.]+\/[a-z-]+\//)) {
        // すでにプロジェクトベースパスが含まれていない場合のみ追加
        if (!url.startsWith(baseUrl)) {
          node.url = baseUrl + url;
          console.log(`[Link Transform] プロジェクト内絶対パス変換: ${url} → ${node.url}`);
        }
        return;
      }
      
      // 3. その他の絶対パス (例: "/01-guide/01-getting-started") 
      // これは現在の言語とバージョンを使用して変換
      if (url.startsWith('/') && !url.startsWith(baseUrl)) {
        node.url = `${baseUrl}/${version}/${lang}${url}`;
        console.log(`[Link Transform] 言語・バージョン補完: ${url} → ${node.url}`);
        return;
      }
    });
  };
}

export default remarkLinkTransformer;