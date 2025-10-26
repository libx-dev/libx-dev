import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

/**
 * ディレクトリを再帰的にコピーする関数
 * @param {string} src - コピー元のディレクトリパス
 * @param {string} dest - コピー先のディレクトリパス
 */
export function copyDirRecursive(src, dest) {
  // ディレクトリが存在しない場合は作成
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // ディレクトリ内のファイルとサブディレクトリを取得
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // サブディレクトリの場合は再帰的にコピー
      copyDirRecursive(srcPath, destPath);
    } else {
      // ファイルの場合はコピー
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * HTMLファイル内のベースパスを修正する関数
 * @param {string} filePath - HTMLファイルのパス
 * @param {string} oldBasePath - 置換前のベースパス
 * @param {string} newBasePath - 置換後のベースパス
 * @param {boolean} isLocalBuild - ローカルビルドかどうか
 */
export function updateBasePath(filePath, oldBasePath, newBasePath, isLocalBuild = false) {
  if (!fs.existsSync(filePath) || !filePath.endsWith('.html')) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // アセットパスの修正
  content = content.replace(
    new RegExp(`${escapeRegExp(oldBasePath)}/assets/`, 'g'),
    `${newBasePath}/assets/`
  );

  // リダイレクト先URLの修正（index.htmlの場合）
  if (filePath.endsWith('index.html')) {
    // リダイレクト時間を修正（数字ではなく言語コードになっている場合がある）
    content = content.replace(
      /content="([a-z]+);url=/g,
      'content="2;url='
    );

    // リダイレクト先URLを修正
    content = content.replace(
      new RegExp(`content="[0-9]+;url=${escapeRegExp(oldBasePath)}/([v0-9]+)/([a-z-]+)/"`, 'g'),
      `content="2;url=${newBasePath}/$1/$2/"`
    );

    // リンクのhref属性を修正
    content = content.replace(
      new RegExp(`href="${escapeRegExp(oldBasePath)}/([v0-9]+)/([a-z-]+)/"`, 'g'),
      `href="${newBasePath}/$1/$2/"`
    );

    // リダイレクトメッセージを修正
    content = content.replace(
      new RegExp(`Redirecting from <code>${escapeRegExp(oldBasePath)}</code> to <code>${escapeRegExp(oldBasePath)}/([v0-9]+)/([a-z-]+)/</code>`, 'g'),
      `Redirecting from <code>${newBasePath}</code> to <code>${newBasePath}/$1/$2/</code>`
    );

    // canonical URLを修正
    if (!isLocalBuild) {
      content = content.replace(
        new RegExp(`href="https://libx.dev${escapeRegExp(oldBasePath)}/([v0-9]+)/([a-z-]+)/"`, 'g'),
        `href="https://libx.dev${newBasePath}/$1/$2/"`
      );
    } else {
      // ローカル開発環境用のポート番号（デフォルト: 8080）
      const localPort = process.env.PORT || 8080;
      content = content.replace(
        new RegExp(`href="https://libx.dev${escapeRegExp(oldBasePath)}/([v0-9]+)/([a-z-]+)/"`, 'g'),
        `href="http://localhost:${localPort}/$1/$2/"`
      );
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * ディレクトリ内のHTMLファイルのベースパスを再帰的に修正する関数
 * @param {string} dir - 対象ディレクトリ
 * @param {string} oldBasePath - 置換前のベースパス
 * @param {string} newBasePath - 置換後のベースパス
 * @param {boolean} isLocalBuild - ローカルビルドかどうか
 */
export function updateBasePathsRecursive(dir, oldBasePath, newBasePath, isLocalBuild = false) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // サブディレクトリの場合は再帰的に処理
      updateBasePathsRecursive(fullPath, oldBasePath, newBasePath, isLocalBuild);
    } else if (entry.name.endsWith('.html')) {
      // HTMLファイルの場合はベースパスを修正
      updateBasePath(fullPath, oldBasePath, newBasePath, isLocalBuild);
    }
  }
}

/**
 * レジストリファイルからプロジェクト情報を読み込む
 * @param {string} registryDir - レジストリディレクトリのパス
 * @returns {Promise<Array>} プロジェクト情報の配列
 */
export async function loadProjectsFromRegistry(registryDir) {
  const projects = [];

  try {
    const files = await fsPromises.readdir(registryDir);
    const jsonFiles = files.filter(f => f.endsWith('.json') && !f.endsWith('.schema.json'));

    for (const file of jsonFiles) {
      const filePath = path.join(registryDir, file);
      const content = await fsPromises.readFile(filePath, 'utf8');
      const registry = JSON.parse(content);

      if (registry.projects && Array.isArray(registry.projects)) {
        for (const project of registry.projects) {
          projects.push({
            id: project.id,
            registryFile: file,
            displayName: project.displayName || { en: project.id },
            description: project.description || {},
          });
        }
      }
    }
  } catch (error) {
    console.error('レジストリファイルの読み込み中にエラーが発生しました:', error);
    throw error;
  }

  return projects;
}

/**
 * 正規表現の特殊文字をエスケープする
 * @param {string} string - エスケープする文字列
 * @returns {string} エスケープされた文字列
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * ディレクトリを削除する（再帰的）
 * @param {string} dirPath - 削除するディレクトリのパス
 */
export async function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    await fsPromises.rm(dirPath, { recursive: true, force: true });
  }
}

/**
 * ビルド時間を計測して表示する
 * @param {string} label - ラベル
 * @param {Function} fn - 実行する関数
 * @returns {Promise<any>} 関数の実行結果
 */
export async function measureTime(label, fn) {
  const startTime = Date.now();
  const result = await fn();
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  console.log(`  ⏱️  ${label} (${duration}秒)`);
  return result;
}
