# libx-docs コンテンツ同期システム

このドキュメントでは、libx-docsリポジトリとlibx-devリポジトリ間でのコンテンツ同期システムについて説明します。

## 概要

libx-docs コンテンツ同期システムは、コンテンツ専用リポジトリ（libx-docs）で管理されているドキュメントを、メインの開発リポジトリ（libx-dev）に自動同期するためのシステムです。

### 主な機能

- **自動コンテンツ同期**: libx-docsからlibx-devへのコンテンツの自動コピー
- **構造バリデーション**: 言語間でのディレクトリ構造整合性チェック
- **設定ファイル管理**: プロジェクト設定の一元管理と自動更新
- **変更検知**: 構造とファイル内容の両方に対応した高精度な変更検知
- **新規プロジェクト自動作成**: libx-docsで新規プロジェクトが追加された場合の自動作成
- **パフォーマンス最適化**: 高速な構造検知と正確な内容検知の選択可能

## アーキテクチャ

### ディレクトリ構造

```
libx-docs/                          # コンテンツ専用リポジトリ
├── sample-docs/                    # プロジェクト
│   ├── config.json                 # プロジェクト設定
│   └── v1/                         # バージョン
│       ├── en/                     # 言語
│       │   └── 01-guide/           # カテゴリ
│       │       └── 01-start.mdx    # ドキュメント
│       └── ja/
└── test-verification/

libx-dev/                           # メイン開発リポジトリ  
├── scripts/
│   ├── sync-content.js             # メイン同期スクリプト
│   ├── sync-utils.js               # 同期ユーティリティ
│   ├── validate-content.js         # バリデーションスクリプト
│   └── schemas/
│       └── libx-docs-config.schema.json  # config.jsonスキーマ
└── apps/
    └── sample-docs/                # 同期されたプロジェクト
        └── src/content/docs/       # 同期されたコンテンツ
```

### config.json設定ファイル

各プロジェクトのルートには`config.json`ファイルが必要です：

```json
{
  "projectName": "sample-docs",
  "displayName": {
    "en": "Sample Documentation",
    "ja": "サンプルドキュメント"
  },
  "description": {
    "en": "A comprehensive sample documentation",
    "ja": "包括的なサンプルドキュメント"
  },
  "supportedLangs": ["en", "ja"],
  "defaultLang": "en",
  "versions": ["v1", "v2"],
  "latestVersion": "v2",
  "categories": {
    "guide": {
      "en": "Guide",
      "ja": "ガイド"
    }
  },
  "icon": "file-text",
  "tags": ["documentation"],
  "baseUrl": "/docs/sample-docs",
  "repository": "https://github.com/libx-dev/libx-docs",
  "lastUpdated": "2025-09-03T15:00:00.000Z",
  "syncMetadata": {
    "lastSyncCommit": null,
    "lastSyncTime": null,
    "contentHash": null
  }
}
```

## 使用方法

### 1. コンテンツのバリデーション

```bash
# 全プロジェクトをバリデーション
node scripts/validate-content.js

# 特定プロジェクトをバリデーション
node scripts/validate-content.js sample-docs

# 自動修正付きバリデーション
node scripts/validate-content.js --fix --verbose

# 厳密バリデーション（警告もエラー扱い）
node scripts/validate-content.js --strict
```

### 2. コンテンツの同期

```bash
# 全プロジェクトを同期（高速な構造検知）
node scripts/sync-content.js

# 特定プロジェクトを同期
node scripts/sync-content.js sample-docs

# ファイル内容も含めた詳細な変更検知（低速だが正確）
node scripts/sync-content.js sample-docs --content-hash

# バリデーションのみ実行
node scripts/sync-content.js --validate-only

# 強制同期（変更検知無視）
node scripts/sync-content.js --force

# ドライラン（実際の変更なし）
node scripts/sync-content.js --dry-run --verbose

# パフォーマンステスト実行
node scripts/sync-content.js sample-docs --benchmark
```

## バリデーションルール

### 1. ディレクトリ構造の整合性

- **言語間一貫性**: 同一バージョン内の全言語で同じディレクトリ構造が必要
- **カテゴリ命名**: カテゴリディレクトリは `01-`, `02-` などの接頭辞が必要
- **ファイル命名**: MDXファイルは `01-`, `02-` などの接頭辞が必要

### 2. 設定ファイルの妥当性

- **JSONスキーマ**: config.jsonはスキーマに準拠する必要
- **言語整合性**: サポート言語すべてで表示名と説明が定義されている必要
- **バージョン整合性**: latestVersionがversionsに含まれている必要

### 3. 除外ルール

- `.` や `_` で始まるディレクトリは除外
- `.DS_Store` などのシステムファイルは除外

## エラーハンドリング

### よくあるエラーと解決方法

#### 1. 構造不整合エラー
```
❌ ディレクトリ "02-api-reference" が ja 言語に存在しません
```

**解決方法**: 不足している言語に該当するディレクトリとファイルを追加

#### 2. 命名規則エラー
```
❌ ファイル名 "getting-started.mdx" が無効です
```

**解決方法**: ファイル名を `01-getting-started.mdx` のように変更

#### 3. 設定エラー
```
❌ 表示名が言語 "ja" で定義されていません
```

**解決方法**: config.jsonに不足している言語の翻訳を追加、または `--fix` オプションで自動修正

## 開発ワークフロー

### 1. 新しいコンテンツの追加

1. libx-docsリポジトリで作業
2. バリデーション実行: `node scripts/validate-content.js [project]`
3. 問題があれば修正
4. 同期実行: `node scripts/sync-content.js [project]`

### 2. 新しいプロジェクトの追加

1. libx-docsにプロジェクトディレクトリを作成
2. config.jsonファイルを作成
3. バリデーション実行
4. 同期実行（自動的にlibx-devにプロジェクトが作成される）

### 3. 言語の追加

1. config.jsonのsupportedLangsに言語を追加
2. 各バージョンに言語ディレクトリを作成
3. コンテンツをコピーまたは翻訳
4. バリデーション・同期実行

## 変更検知システム

### 2種類の検知モード

#### 1. 構造のみ検知（デフォルト）
- **対象**: ファイル・ディレクトリの追加/削除/リネーム
- **速度**: 高速（数十ミリ秒）
- **用途**: 日常的な同期チェック

#### 2. ファイル内容検知（`--content-hash`オプション）
- **対象**: ファイル内容の変更、メタデータの更新
- **対象拡張子**: `.mdx`, `.md`, `.json`, `.yml`, `.yaml`, `.txt`
- **速度**: やや低速（ファイル数に依存）
- **用途**: 正確な変更検知が必要な場合

### パフォーマンス比較

```bash
# ベンチマークテストで性能差を確認
node scripts/sync-content.js [project] --benchmark
```

**典型的な結果例:**
- 構造のみ: 1-10ms
- 内容込み: 5-20ms
- 性能差: 1-5倍程度（プロジェクト規模に依存）

## トラブルシューティング

### パフォーマンス問題

- **大量ファイル**: `--dry-run` で事前確認、`--benchmark`でパフォーマンステスト
- **頻繁な同期**: デフォルトの構造検知は高速
- **正確性が必要**: `--content-hash`オプションでファイル内容も検知

### データ整合性

- **ロールバック**: 同期エラー時は自動的にロールバックされる
- **バックアップ**: 重要な変更前は手動バックアップを推奨

### 権限問題

- **ファイルアクセス**: libx-docsとlibx-devの両方への読み書き権限が必要
- **Git権限**: コミットハッシュ取得のためのGit権限が必要

## 設定オプション

### 環境変数

現在、特別な環境変数は不要ですが、将来的に以下が追加される可能性があります：

- `LIBX_DOCS_PATH`: libx-docsリポジトリのパス
- `LIBX_DEV_PATH`: libx-devリポジトリのパス
- `SYNC_TIMEOUT`: 同期処理のタイムアウト

### スクリプトオプション

詳細は各スクリプトの `--help` オプションを参照してください。

## API リファレンス

### sync-utils.js

主要な関数：

- `validateProjectStructure(projectPath, supportedLangs, versions)`: プロジェクト構造の検証
- `calculateDirectoryHash(dirPath, includeContent?)`: ディレクトリのハッシュ計算（ファイル内容オプション対応）
- `calculateFileContentHash(filePath)`: 個別ファイル内容のハッシュ計算
- `shouldIncludeFileContent(fileName)`: ファイル内容検知対象の判定
- `benchmarkHashCalculation(dirPath, verbose?)`: パフォーマンステスト機能
- `copyDirectory(srcDir, destDir)`: ディレクトリの再帰的コピー
- `loadConfig(configPath)` / `saveConfig(configPath, config)`: 設定ファイルの読み書き

### config.jsonスキーマ

完全なスキーマ定義は `scripts/schemas/libx-docs-config.schema.json` を参照してください。

## 今後の拡張予定

- **増分同期**: より効率的な部分同期
- **並列処理**: 複数プロジェクトの並列同期
- **Git差分検知**: Git commitハッシュベースの変更検知
- **Webhook対応**: Git hooksとの連携
- **CI/CD統合**: GitHub ActionsやCloudflare Pagesとの統合

## サポート

問題や質問がある場合は、以下を確認してください：

1. このドキュメントの関連セクション
2. スクリプトの `--help` オプション
3. バリデーションエラーメッセージの詳細
4. GitHub Issuesでの既知の問題

---

## 変更履歴

- **2025-09-03**: 
  - 初回リリース - 基本的な同期機能とバリデーション機能
  - ファイル内容変更検知機能追加（`--content-hash`オプション）
  - パフォーマンステスト機能追加（`--benchmark`オプション）
  - 構造検知と内容検知の選択可能な2段階システム実装