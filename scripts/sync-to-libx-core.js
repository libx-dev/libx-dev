#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * libx-devプロジェクトからlibx-coreへ必要なファイルのみを選択的に同期するスクリプト
 * 
 * 特徴:
 * - 必要なパスのみを明示的に指定
 * - 削除ではなく追加のみのクリーンなGit履歴
 * - 既存のREADME.md、LICENSEファイルは保護
 */

const SOURCE_DIR = path.resolve(__dirname, '..');
const TARGET_DIR = path.resolve(SOURCE_DIR, '../libx-core');

// コマンドライン引数の解析
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run') || args.includes('-n');
const VERBOSE = args.includes('--verbose') || args.includes('-v');

// 必要なパスを明示的に指定（除外ベースではなく包含ベース）
const INCLUDE_PATHS = [
    // 共有パッケージ
    'packages/',
    
    // 指定されたアプリケーション
    'apps/project-template/',
    'apps/top-page/',
    
    // 設定ディレクトリ
    'config/',
    
    // スクリプトディレクトリ
    'scripts/',
    
    // ルートレベル設定ファイル
    'package.json',
    'pnpm-workspace.yaml',
    '.eslintrc.cjs',
    '.eslintignore',
    '.prettierrc',
    'wrangler.toml'
];

// 保護されたファイル（上書きしない）
const PROTECTED_FILES = [
    'README.md',
    'LICENSE'
];

// ディレクトリ存在確認
function ensureTargetDirectory() {
    if (!fs.existsSync(TARGET_DIR)) {
        console.log(`❌ エラー: ターゲットディレクトリが存在しません: ${TARGET_DIR}`);
        console.log(`   先にlibx-coreディレクトリを作成してください`);
        process.exit(1);
    }
    
    // .gitディレクトリが存在するか確認
    const gitDir = path.join(TARGET_DIR, '.git');
    if (!fs.existsSync(gitDir)) {
        console.log(`❌ エラー: libx-coreディレクトリがGitリポジトリではありません: ${TARGET_DIR}`);
        console.log(`   git init を実行してください`);
        process.exit(1);
    }
    
    console.log(`✅ ターゲットディレクトリ確認: ${TARGET_DIR}`);
}

// パスが存在するか確認
function validateSourcePaths() {
    const missingPaths = [];
    
    for (const includePath of INCLUDE_PATHS) {
        const sourcePath = path.join(SOURCE_DIR, includePath);
        if (!fs.existsSync(sourcePath)) {
            missingPaths.push(includePath);
        }
    }
    
    if (missingPaths.length > 0) {
        console.log('⚠️  以下のパスがソースディレクトリに見つかりません:');
        missingPaths.forEach(p => console.log(`   - ${p}`));
        
        if (!args.includes('--force')) {
            console.log('   --force オプションで続行するか、パスを確認してください');
            process.exit(1);
        }
    }
    
    return INCLUDE_PATHS.filter(p => !missingPaths.includes(p));
}

// ファイルをコピーする
function copyPath(sourcePath, targetPath) {
    const sourceFullPath = path.join(SOURCE_DIR, sourcePath);
    const targetFullPath = path.join(TARGET_DIR, targetPath);
    
    // 保護されたファイルのチェック
    if (PROTECTED_FILES.includes(path.basename(targetPath))) {
        if (fs.existsSync(targetFullPath)) {
            if (VERBOSE) {
                console.log(`   🛡️  保護されたファイルをスキップ: ${targetPath}`);
            }
            return false;
        }
    }
    
    if (DRY_RUN) {
        console.log(`   📋 [DRY RUN] コピー予定: ${sourcePath} → ${targetPath}`);
        return true;
    }
    
    try {
        // ターゲットディレクトリを作成
        const targetDir = path.dirname(targetFullPath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // ディレクトリの場合
        const stat = fs.statSync(sourceFullPath);
        if (stat.isDirectory()) {
            // rsyncを使用してディレクトリを同期
            execSync(`rsync -a --delete "${sourceFullPath}/" "${targetFullPath}/"`, {
                stdio: VERBOSE ? 'inherit' : 'pipe'
            });
        } else {
            // ファイルをコピー
            fs.copyFileSync(sourceFullPath, targetFullPath);
        }
        
        if (VERBOSE) {
            console.log(`   ✅ コピー完了: ${targetPath}`);
        }
        return true;
        
    } catch (error) {
        console.error(`   ❌ コピー失敗: ${sourcePath}`);
        console.error(`      エラー: ${error.message}`);
        return false;
    }
}

// メイン同期処理
function syncFiles() {
    console.log('\n🔄 ファイル同期を開始します...');
    if (DRY_RUN) {
        console.log('🧪 [ドライランモード] 実際のファイル操作は行いません');
    }
    console.log(`📁 ソース: ${SOURCE_DIR}`);
    console.log(`📁 ターゲット: ${TARGET_DIR}`);
    
    const validPaths = validateSourcePaths();
    
    console.log('\n📋 同期対象パス:');
    validPaths.forEach(p => console.log(`   - ${p}`));
    
    if (PROTECTED_FILES.length > 0) {
        console.log('\n🛡️  保護されたファイル（上書きしません）:');
        PROTECTED_FILES.forEach(f => console.log(`   - ${f}`));
    }
    
    console.log('\n⏳ 同期処理中...');
    
    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;
    
    for (const includePath of validPaths) {
        const result = copyPath(includePath, includePath);
        if (result === true) {
            successCount++;
        } else if (result === false) {
            skipCount++;
        } else {
            failCount++;
        }
    }
    
    console.log('\n📊 同期結果:');
    console.log(`   ✅ 成功: ${successCount}件`);
    if (skipCount > 0) console.log(`   🛡️  保護: ${skipCount}件`);
    if (failCount > 0) console.log(`   ❌ 失敗: ${failCount}件`);
    
    if (failCount > 0) {
        console.log('\n⚠️  一部のファイル同期に失敗しました');
        process.exit(1);
    }
    
    if (DRY_RUN) {
        console.log('\n✅ ドライラン完了！');
    } else {
        console.log('\n✅ ファイル同期が完了しました！');
    }
}

// Git状態の確認
function checkGitStatus() {
    console.log('\n🔍 Git状態を確認中...');
    
    try {
        const result = execSync('git status --porcelain', { 
            cwd: TARGET_DIR, 
            encoding: 'utf8' 
        });
        
        if (result.trim() === '') {
            console.log('   ✅ 変更はありません');
        } else {
            const lines = result.trim().split('\n');
            console.log(`   📝 ${lines.length}件の変更があります:`);
            
            const added = lines.filter(line => line.startsWith('A ') || line.startsWith('??')).length;
            const modified = lines.filter(line => line.startsWith('M ')).length;
            const deleted = lines.filter(line => line.startsWith('D ')).length;
            
            if (added > 0) console.log(`      ➕ 追加: ${added}件`);
            if (modified > 0) console.log(`      ✏️  変更: ${modified}件`);
            if (deleted > 0) console.log(`      ➖ 削除: ${deleted}件`);
            
            if (VERBOSE && lines.length <= 20) {
                console.log('\n   詳細:');
                lines.forEach(line => console.log(`      ${line}`));
            }
        }
        
    } catch (error) {
        console.error('   ❌ Git状態確認に失敗:', error.message);
    }
}

// ヘルプメッセージ
function showHelp() {
    console.log(`
🔄 libx-core 選択的同期スクリプト

使用方法:
  node scripts/sync-to-libx-core.js [オプション]

オプション:
  --dry-run, -n    ドライランモード（実際にはコピーしない）
  --verbose, -v    詳細なログを出力
  --force          存在しないパスがあっても続行
  --help, -h       このヘルプメッセージを表示

説明:
  libx-devプロジェクトから必要なファイル・ディレクトリのみを
  ../libx-core/に選択的に同期します。
  
  従来のrsync方式と異なり、必要なパスのみを明示的に指定するため、
  Gitの履歴に不要な削除記録が残りません。

保護されたファイル:
  - README.md
  - LICENSE
  （これらのファイルが既に存在する場合は上書きされません）
    `);
}

// メイン実行
function main() {
    // ヘルプの確認
    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        return;
    }
    
    console.log('🔄 libx-core 選択的同期スクリプトを開始します');
    if (DRY_RUN) {
        console.log('🧪 [ドライランモード]');
    }
    if (VERBOSE) {
        console.log('📝 [詳細モード]');
    }
    console.log('==========================================');
    
    try {
        ensureTargetDirectory();
        syncFiles();
        
        if (!DRY_RUN) {
            checkGitStatus();
        }
        
        console.log('\n✨ 全ての処理が完了しました！');
        console.log(`💡 次のステップ: cd ${TARGET_DIR} でリポジトリを確認してください`);
        
    } catch (error) {
        console.error('\n💥 予期しないエラーが発生しました:', error.message);
        if (VERBOSE) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// スクリプトが直接実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export {
    INCLUDE_PATHS,
    PROTECTED_FILES,
    copyPath,
    syncFiles
};