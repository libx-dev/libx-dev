#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * libx-devプロジェクトからlibx-coreへ必要なファイルをコピーするスクリプト
 * 
 * 除外ルール:
 * - .gitignoreで指定されているファイル・ディレクトリ
 * - 不要なappsディレクトリ（sample-docs, test-verification）  
 * - 開発専用ファイル（pnpm-lock.yaml, .github/workflows/）
 * - 既存のREADME.md、LICENSEファイルは保護
 */

const SOURCE_DIR = path.resolve(__dirname, '..');
const TARGET_DIR = path.resolve(SOURCE_DIR, '../libx-core');

// コマンドライン引数の解析
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run') || args.includes('-n');

// .gitignoreパターンを解析する関数
function parseGitignore(gitignorePath) {
    if (!fs.existsSync(gitignorePath)) {
        return [];
    }
    
    const content = fs.readFileSync(gitignorePath, 'utf8');
    const patterns = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .filter(line => !line.startsWith('/tmp/')) // /tmp/*は除外（システム権限問題回避）
        .map(pattern => {
            // gitignoreパターンをrsyncパターンに変換
            if (pattern.endsWith('/')) {
                return pattern; // ディレクトリパターンはそのまま
            }
            if (pattern.startsWith('**/')) {
                return pattern.substring(3); // **/pattern -> pattern
            }
            if (pattern.includes('/')) {
                return pattern; // パス指定はそのまま
            }
            return `**/${pattern}`; // ファイル名のみの場合は**を追加
        });
    
    return patterns;
}

// 追加の除外ルールを定義
function getAdditionalExcludes() {
    return [
        // 指定外のappsディレクトリ
        'apps/sample-docs/',
        'apps/test-verification/',
        // 開発専用ファイル
        'pnpm-lock.yaml',
        '.github/workflows/',
        // 既存保護ファイル
        'README.md',
        'LICENSE',
        // プロジェクト固有ディレクトリ
        'docs/',
        '.backups/',
        '.wrangler/'
    ];
}

// rsync除外パターンを生成する関数
function generateRsyncExcludes() {
    const gitignorePath = path.join(SOURCE_DIR, '.gitignore');
    const gitignorePatterns = parseGitignore(gitignorePath);
    const additionalExcludes = getAdditionalExcludes();
    
    const allExcludes = [...gitignorePatterns, ...additionalExcludes];
    
    // rsyncのexcludeオプションを生成
    return allExcludes.flatMap(pattern => ['--exclude', pattern]);
}

// ディレクトリ存在確認
function ensureTargetDirectory() {
    if (!fs.existsSync(TARGET_DIR)) {
        console.log(`❌ エラー: ターゲットディレクトリが存在しません: ${TARGET_DIR}`);
        console.log(`   先にlibx-coreディレクトリを作成してください`);
        process.exit(1);
    }
    
    console.log(`✅ ターゲットディレクトリ確認: ${TARGET_DIR}`);
}

// rsyncを使用してファイルをコピー
function copyFiles() {
    const excludeOptions = generateRsyncExcludes();
    
    // rsyncコマンドを構築
    const rsyncCmd = [
        'rsync',
        '-av',
        '--progress',
        '--human-readable',
        DRY_RUN ? '--dry-run' : '',
        ...excludeOptions,
        `${SOURCE_DIR}/`,
        `${TARGET_DIR}/`
    ].filter(Boolean);
    
    if (DRY_RUN) {
        console.log('\n🧪 ドライランモード: 実際のファイルコピーは行いません');
    } else {
        console.log('\n🚀 ファイルコピーを開始します...');
    }
    console.log(`📁 ソース: ${SOURCE_DIR}`);
    console.log(`📁 ターゲット: ${TARGET_DIR}`);
    console.log('\n📋 除外パターン:');
    
    // 除外パターンを表示（--excludeオプションのみ）
    for (let i = 0; i < excludeOptions.length; i += 2) {
        if (excludeOptions[i] === '--exclude') {
            console.log(`   - ${excludeOptions[i + 1]}`);
        }
    }
    
    try {
        console.log('\n⏳ rsyncを実行中...');
        const result = execSync(rsyncCmd.join(' '), { 
            stdio: ['inherit', 'pipe', 'pipe'],
            encoding: 'utf8'
        });
        
        if (DRY_RUN) {
            console.log('\n✅ ドライラン完了！以下がコピー対象です:');
        } else {
            console.log('\n✅ ファイルコピーが完了しました！');
        }
        console.log('\n📊 結果:');
        console.log(result);
        
    } catch (error) {
        console.error('❌ エラー: ファイルコピーに失敗しました');
        console.error(error.message);
        if (error.stderr) {
            console.error('詳細:', error.stderr);
        }
        process.exit(1);
    }
}

// 結果確認
function verifyResult() {
    console.log('\n🔍 コピー結果を確認中...');
    
    // 必要なディレクトリが存在するか確認
    const expectedDirs = [
        'packages',
        'apps/project-template',
        'apps/top-page',
        'config',
        'scripts'
    ];
    
    let allPresent = true;
    expectedDirs.forEach(dir => {
        const dirPath = path.join(TARGET_DIR, dir);
        if (fs.existsSync(dirPath)) {
            console.log(`   ✅ ${dir}`);
        } else {
            console.log(`   ❌ ${dir} (見つかりません)`);
            allPresent = false;
        }
    });
    
    // 除外されるべきディレクトリが存在しないか確認
    const shouldNotExist = [
        'node_modules',
        'dist',
        '.astro',
        'apps/sample-docs',
        'apps/test-verification',
        'docs'
    ];
    
    console.log('\n🚫 除外確認:');
    shouldNotExist.forEach(dir => {
        const dirPath = path.join(TARGET_DIR, dir);
        if (!fs.existsSync(dirPath)) {
            console.log(`   ✅ ${dir} (正常に除外)`);
        } else {
            console.log(`   ⚠️  ${dir} (除外されていません)`);
        }
    });
    
    if (allPresent) {
        console.log('\n🎉 コピー処理が正常に完了しました！');
    } else {
        console.log('\n⚠️  一部のディレクトリが見つかりません。ログを確認してください。');
    }
}

// ヘルプメッセージ
function showHelp() {
    console.log(`
🔄 libx-core コピースクリプト

使用方法:
  node scripts/copy-to-libx-core.js [オプション]

オプション:
  --dry-run, -n    ドライランモード（実際にはコピーしない）
  --help, -h       このヘルプメッセージを表示

説明:
  libx-devプロジェクトから必要なファイルのみを../libx-core/にコピーします。
  .gitignoreで除外されているファイルや、不要なappsディレクトリは除外されます。
    `);
}

// メイン実行
function main() {
    // ヘルプの確認
    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        return;
    }
    
    console.log('🔄 libx-core コピースクリプトを開始します');
    if (DRY_RUN) {
        console.log('🧪 [ドライランモード]');
    }
    console.log('==========================================');
    
    try {
        ensureTargetDirectory();
        copyFiles();
        verifyResult();
        
        console.log('\n✨ 全ての処理が完了しました！');
        console.log(`💡 次のステップ: cd ${TARGET_DIR} でプロジェクトを確認してください`);
        
    } catch (error) {
        console.error('\n💥 予期しないエラーが発生しました:', error.message);
        process.exit(1);
    }
}

// スクリプトが直接実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export {
    parseGitignore,
    getAdditionalExcludes,
    generateRsyncExcludes
};