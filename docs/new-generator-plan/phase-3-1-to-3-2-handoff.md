# Phase 3-1 → Phase 3-2 引き継ぎドキュメント

**作成日**: 2025-10-21
**前フェーズ**: Phase 3-1 (データ移行: テスト・ドキュメント作成)
**次フェーズ**: Phase 3-2 (CLI統合・バリデーション)

---

## 📋 目次

1. [Phase 3-1 完了状況](#phase-3-1-完了状況)
2. [Phase 3-2 で実装すべき内容](#phase-3-2-で実装すべき内容)
3. [既存実装の理解](#既存実装の理解)
4. [未実装機能と技術的負債](#未実装機能と技術的負債)
5. [テスト戦略](#テスト戦略)
6. [注意事項](#注意事項)
7. [参考資料](#参考資料)

---

## Phase 3-1 完了状況

### ✅ 完了した作業

#### 1. テスト実装（100%完了）

**ユニットテスト** - 32テスト（全て合格）
- `packages/cli/tests/unit/migrate/content-meta.test.js` (6テスト)
- `packages/cli/tests/unit/migrate/config-parser.test.js` (7テスト)
- `packages/cli/tests/unit/migrate/category-scanner.test.js` (6テスト)
- `packages/cli/tests/unit/migrate/document-scanner.test.js` (7テスト)
- `packages/cli/tests/unit/migrate/glossary-parser.test.js` (6テスト)

**統合テスト** - 11テスト（10合格、1スキップ）
- `packages/cli/tests/integration/migrate/from-libx.test.js` (8テスト)
- `packages/cli/tests/integration/migrate/edge-cases.test.js` (3テスト、1スキップ)

**スナップショットテスト** - 3テスト（全て合格）
- `packages/cli/tests/snapshots/migrate/output.test.js` (3テスト)

#### 2. ドキュメント作成（100%完了）

- `docs/new-generator-plan/guides/migration-data.md` (1,381行)
  - データ変換フローの詳細
  - 実行例とコマンドオプション
  - トラブルシューティング
  - FAQ

#### 3. テストフィクスチャ（100%完了）

```
packages/cli/tests/fixtures/migrate-from-libx/
├── sample-small/                    # 基本テストケース
│   └── apps/test-project/
│       ├── src/config/project.config.json
│       └── src/content/docs/v1/
│           ├── en/01-guide/
│           │   ├── 01-getting-started.mdx
│           │   └── 02-installation.mdx
│           └── ja/01-guide/
│               ├── 01-getting-started.mdx
│               └── 02-installation.mdx
└── edge-cases/                      # エッジケース
    ├── missing-files/               # 言語ファイル欠損
    ├── invalid-frontmatter/         # 不正なYAML
    └── duplicate-slugs/             # スラッグ重複（Phase 3-2実装予定）
```

### 📊 テスト結果サマリー

```bash
npm test tests/unit/migrate/ tests/integration/migrate/ tests/snapshots/migrate/

✅ Test Files: 8 passed
✅ Tests: 45 passed | 1 skipped (46)
⏱️ Duration: 3.45s
```

---

## Phase 3-2 で実装すべき内容

Phase 3-2 の計画書: `docs/new-generator-plan/phase-3-2-cli-validation.md`

### 🎯 主要タスク

#### タスク1: CLIコマンド統合

**実装すべきファイル**:
```
packages/cli/src/
├── index.js                         # メインエントリポイント（更新）
└── commands/
    └── migrate/
        ├── index.js                 # migrate コマンドのエントリポイント（新規作成）
        └── from-libx.js             # 既存（CLIオプション処理を追加）
```

**実装内容**:

1. **Commander.js 統合**
```javascript
// packages/cli/src/commands/migrate/index.js
import { Command } from 'commander';
import migrateFromLibx from './from-libx.js';

export function createMigrateCommand() {
  const migrate = new Command('migrate')
    .description('既存プロジェクトを新レジストリ形式に移行');

  migrate
    .command('from-libx')
    .description('libx-dev プロジェクトを新レジストリ形式に変換')
    .requiredOption('-s, --source <path>', 'ソースディレクトリのパス')
    .requiredOption('-p, --project-id <id>', 'プロジェクトID')
    .option('-t, --target <path>', '出力先レジストリファイル', 'registry/docs.json')
    .option('--top-page <path>', 'トップページディレクトリ', 'apps/top-page')
    .option('--backup <path>', 'バックアップディレクトリ', '.backups')
    .option('--dry-run', '実際にファイルを作成せずに動作確認')
    .action(async (options, command) => {
      const globalOpts = command.optsWithGlobals();
      await migrateFromLibx(globalOpts, options);
    });

  return migrate;
}
```

2. **メインCLIに追加**
```javascript
// packages/cli/src/index.js
import { createMigrateCommand } from './commands/migrate/index.js';

const program = new Command();
// ... 既存のコマンド ...
program.addCommand(createMigrateCommand());
```

#### タスク2: バリデーション機能

**実装すべきファイル**:
```
packages/cli/src/
├── validators/
│   ├── registry-validator.js        # レジストリスキーマバリデーター（新規作成）
│   ├── project-validator.js         # プロジェクトバリデーター（新規作成）
│   └── document-validator.js        # ドキュメントバリデーター（新規作成）
└── commands/
    └── validate.js                   # validate コマンド（新規作成）
```

**実装内容**:

1. **レジストリスキーマバリデーター**
```javascript
// packages/cli/src/validators/registry-validator.js
export function validateRegistry(registry) {
  const errors = [];

  // 必須フィールドの検証
  if (!registry.version) {
    errors.push('version フィールドが必要です');
  }

  if (!Array.isArray(registry.projects)) {
    errors.push('projects フィールドが配列である必要があります');
  }

  // 各プロジェクトの検証
  for (const project of registry.projects) {
    errors.push(...validateProject(project));
  }

  return { valid: errors.length === 0, errors };
}
```

2. **validate コマンド**
```javascript
// packages/cli/src/commands/validate.js
import { Command } from 'commander';
import { validateRegistry } from '../validators/registry-validator.js';

export function createValidateCommand() {
  const validate = new Command('validate')
    .description('レジストリファイルを検証')
    .argument('[path]', 'レジストリファイルのパス', 'registry/docs.json')
    .option('--strict', '厳密モードで検証')
    .action(async (path, options) => {
      const registry = JSON.parse(readFileSync(path, 'utf-8'));
      const result = validateRegistry(registry, options);

      if (result.valid) {
        console.log('✅ バリデーション成功');
      } else {
        console.error('❌ バリデーション失敗:');
        result.errors.forEach(err => console.error(`  - ${err}`));
        process.exit(1);
      }
    });

  return validate;
}
```

#### タスク3: スラッグ重複検知

**実装すべきファイル**:
```
packages/cli/src/commands/migrate/
└── slug-deduplicator.js             # スラッグ重複検知（新規作成）
```

**実装内容**:

```javascript
// packages/cli/src/commands/migrate/slug-deduplicator.js
/**
 * スラッグ重複を検知して自動リネーム
 *
 * @param {Object[]} documents - ドキュメント配列
 * @returns {Object[]} 重複解決済みドキュメント配列
 */
export function deduplicateSlugs(documents) {
  const slugCounts = new Map();

  for (const doc of documents) {
    const originalSlug = doc.slug;

    if (!slugCounts.has(originalSlug)) {
      slugCounts.set(originalSlug, 1);
    } else {
      const count = slugCounts.get(originalSlug);
      slugCounts.set(originalSlug, count + 1);

      // 重複するスラッグに番号を付与
      doc.slug = `${originalSlug}-${count + 1}`;
      doc.id = `${doc.id}-${count + 1}`;

      logger.warn(`スラッグ重複検知: ${originalSlug} → ${doc.slug}`);
    }
  }

  return documents;
}
```

**統合先**: `packages/cli/src/commands/migrate/from-libx.js` の Step 4 の後

```javascript
// from-libx.js 内
// Step 4: ドキュメントをスキャン
const documents = scanAllDocuments(projectPath, projectId, versionIds, langCodes);

// Step 4.5: スラッグ重複を解決
const deduplicatedDocuments = deduplicateSlugs(documents);
```

#### タスク4: プログレスバー表示

**実装すべきパッケージ**:
```bash
npm install cli-progress --workspace=@libx/cli
```

**実装内容**:

```javascript
// packages/cli/src/commands/migrate/from-libx.js
import cliProgress from 'cli-progress';

// プログレスバーの作成
const progressBar = new cliProgress.SingleBar({
  format: '進行状況 |{bar}| {percentage}% | {value}/{total} | {stage}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true
});

progressBar.start(7, 0, { stage: '初期化中...' });

// Step 1
progressBar.update(1, { stage: 'プロジェクト設定を解析中...' });
// ...

// Step 7
progressBar.update(7, { stage: '完了' });
progressBar.stop();
```

#### タスク5: 統計情報の出力

**実装内容**:

```javascript
// 詳細な統計情報を収集
const stats = {
  projectId,
  languageCount: langCodes.length,
  versionCount: versionIds.length,
  categoryCount: categories.length,
  documentCount: documents.length,
  contentFiles: {
    total: 0,
    published: 0,
    missing: 0,
    draft: 0,
    inReview: 0
  },
  glossaryTerms: glossaryData.length,
  processingTime: endTime - startTime,
  warnings: [],
  errors: []
};

// 統計情報の表示
console.log('\n' + '='.repeat(60));
console.log('📊 詳細統計情報');
console.log('='.repeat(60));
console.log(`処理時間: ${stats.processingTime}ms`);
console.log(`プロジェクトID: ${stats.projectId}`);
console.log(`言語数: ${stats.languageCount}`);
console.log(`バージョン数: ${stats.versionCount}`);
console.log(`カテゴリ数: ${stats.categoryCount}`);
console.log(`ドキュメント数: ${stats.documentCount}`);
console.log(`コンテンツファイル数: ${stats.contentFiles.total}`);
console.log(`  - published: ${stats.contentFiles.published}`);
console.log(`  - missing: ${stats.contentFiles.missing}`);
console.log(`  - draft: ${stats.contentFiles.draft}`);
console.log(`  - in-review: ${stats.contentFiles.inReview}`);
console.log(`Glossary用語数: ${stats.glossaryTerms}`);
if (stats.warnings.length > 0) {
  console.log(`⚠️  警告数: ${stats.warnings.length}`);
}
if (stats.errors.length > 0) {
  console.log(`❌ エラー数: ${stats.errors.length}`);
}
console.log('='.repeat(60));
```

---

## 既存実装の理解

### コア実装ファイル

#### 1. from-libx.js (メイン処理)

**場所**: `packages/cli/src/commands/migrate/from-libx.js`

**責務**:
- 7段階の変換プロセスのオーケストレーション
- エラーハンドリングとロールバック
- バックアップ管理

**重要な関数**:
```javascript
export default async function migrateFromLibx(globalOpts, cmdOpts) {
  // グローバルオプション
  const { dryRun, verbose } = globalOpts;

  // コマンドオプション
  const { source, projectId, target, topPage, backup } = cmdOpts;

  // 7段階の処理
  // Step 1: config-parser
  // Step 2: parseProjectDecorations
  // Step 3: category-scanner
  // Step 4: document-scanner
  // Step 5: content-meta
  // Step 6: glossary-parser
  // Step 7: レジストリに統合
}
```

**注意点**:
- `process.exit(1)` でエラー終了する（テストではモックされる）
- バックアップは `.backups/` ディレクトリに保存
- dry-run モードではファイルを作成しない

#### 2. config-parser.js (設定ファイル解析)

**場所**: `packages/cli/src/commands/migrate/config-parser.js`

**主要な関数**:
```javascript
// project.config.json を解析
export function parseProjectConfig(projectPath, projectId);

// projects.config.json から装飾情報を取得
export function parseProjectDecorations(topPagePath, projectId);
```

**データ変換**:
- `project.config.json` → レジストリ形式
- 言語設定に `status: 'active'` と `fallback` を追加
- バージョン設定に `status` を追加（`isLatest ? 'active' : 'deprecated'`）
- ライセンス情報の `licenseUrl` → `url` に変換

#### 3. category-scanner.js (カテゴリスキャン)

**場所**: `packages/cli/src/commands/migrate/category-scanner.js`

**主要な関数**:
```javascript
export function scanAllCategories(projectPath, versionIds, langCodes, categoryTranslations);
```

**重要な動作**:
- 番号付きディレクトリのみスキャン（`/^(\d{2})-(.+)$/`）
- カテゴリ名は `translations` から取得、なければ title-case に変換
- 戻り値の構造: `{ id, order, titles, description, docs }`
  - **注意**: `name` ではなく `titles` を使用

#### 4. document-scanner.js (ドキュメントスキャン)

**場所**: `packages/cli/src/commands/migrate/document-scanner.js`

**主要な関数**:
```javascript
export function scanAllDocuments(projectPath, projectId, versionIds, langCodes);
```

**重要な動作**:
- 番号付きファイルのみスキャン（`/^(\d{2})-(.+)\.mdx$/`）
- スラッグは `${categoryId}/${docSlug}` 形式で生成
- フロントマターから `title`, `description` を取得
- 戻り値の構造に注意:
  - `summary` (not `description`)
  - `_categoryId` (not `categoryId`)
  - `_order` (not `order`)
  - `_files[fileKey]` (not `_filePath`)

#### 5. content-meta.js (コンテンツメタ生成)

**場所**: `packages/cli/src/commands/migrate/content-meta.js`

**主要な関数**:
```javascript
export async function generateContentMeta(filePath, projectId, docId);
export async function generateAllContentMeta(projectPath, projectId, documents);
```

**生成する情報**:
- `syncHash`: SHA-256 ハッシュ（ファイル内容から生成）
- `lastUpdated`: Git log から取得
- `source.commit`: 最終コミットハッシュ
- `source.reviewer`: 最終コミットの著者
- `wordCount`: Markdown からコードブロックを除外してカウント
- `status`: フロントマターの `inReview` フラグで判定

#### 6. glossary-parser.js (Glossary解析)

**場所**: `packages/cli/src/commands/migrate/glossary-parser.js`

**主要な関数**:
```javascript
export function parseGlossary(projectPath, langCodes);
```

**重要な動作**:
- `src/content/glossary.json` を検索
- JSON構造: `{ terms: [{ id, term, titles, definition, ... }] }`
  - **注意**: 配列 `[...]` ではなく `{ terms: [...] }` 形式
- 必須フィールド: `id`, `term`, `titles`, `definition`
- オプションフィールド: `examples`, `related`

### データ構造

#### レジストリ形式

```typescript
interface Registry {
  version: string;
  lastUpdated: string;
  projects: Project[];
}

interface Project {
  id: string;
  displayName: { [lang: string]: string };
  description: { [lang: string]: string };
  languages: Language[];
  versions: Version[];
  categories: Category[];
  documents: Document[];
  licenses?: License[];
  icon?: string;
  tags?: string[];
}

interface Language {
  code: string;
  displayName: string;
  status: 'active' | 'deprecated';
  default: boolean;
  fallback?: string;  // デフォルト言語以外の場合
}

interface Category {
  id: string;
  order: number;
  titles: { [lang: string]: string };
  description: { [lang: string]: string };
  docs: string[];  // ドキュメントID配列
}

interface Document {
  id: string;
  slug: string;
  title: { [lang: string]: string };
  summary: { [lang: string]: string };  // descriptionではない
  versions: string[];
  status: 'published' | 'draft';
  visibility: 'public' | 'internal';
  keywords: string[];
  tags: string[];
  content: {
    [lang: string]: ContentMeta;
  };
  _categoryId: string;  // プライベートフィールド
  _order: number;       // プライベートフィールド
  _files: {             // プライベートフィールド
    [fileKey: string]: {
      path: string;
      filePath: string;
      wordCount: number;
    };
  };
}

interface ContentMeta {
  status: 'published' | 'missing' | 'draft' | 'in-review';
  syncHash: string;
  lastUpdated: string;
  source: {
    commit: string;
    reviewer: string;
  };
  wordCount: number;
}
```

---

## 未実装機能と技術的負債

### 未実装機能（Phase 3-2 で実装）

#### 1. スラッグ重複検知と自動リネーム

**現状**:
- 同じスラッグを持つドキュメントがある場合、後のものが上書きされる
- テストはスキップされている（`edge-cases.test.js`）

**実装方針**:
- `slug-deduplicator.js` を作成
- `from-libx.js` の Step 4 の後に統合
- 重複時に `-2`, `-3` などの番号を付与
- 警告メッセージを表示

**テストの有効化**:
```javascript
// packages/cli/tests/integration/migrate/edge-cases.test.js
it.skip('スラッグが重複する場合、末尾に番号を付与する', async () => {
  // ↓ .skip を削除
it('スラッグが重複する場合、末尾に番号を付与する', async () => {
```

#### 2. CLI統合

**現状**:
- `from-libx.js` は直接関数として呼び出される
- CLIコマンドとしては使用できない

**実装方針**:
- `packages/cli/src/commands/migrate/index.js` を作成
- Commander.js で `migrate from-libx` コマンドを定義
- メインCLI（`src/index.js`）に統合

#### 3. バリデーション機能

**現状**:
- レジストリの検証機能がない
- 不正なデータが作成される可能性がある

**実装方針**:
- `src/validators/` ディレクトリを作成
- スキーマバリデーターを実装
- `validate` コマンドを作成

#### 4. プログレスバー

**現状**:
- 進行状況がログメッセージのみで分かりにくい

**実装方針**:
- `cli-progress` パッケージを使用
- 7段階の処理ごとに進捗を表示

#### 5. 統計情報の充実

**現状**:
- 基本的な統計情報のみ表示

**実装方針**:
- 処理時間の計測
- 警告・エラー数の集計
- より詳細な内訳表示

### 技術的負債

#### 1. process.exit() の使用

**問題**:
- `from-libx.js` がエラー時に `process.exit(1)` を呼ぶ
- テスト環境では問題ないが、ライブラリとして使う場合は不適切

**解決策**:
- エラーを throw して呼び出し側で処理
- CLIコマンドレイヤーで `process.exit()` を呼ぶ

```javascript
// 悪い例（現状）
try {
  // ...
} catch (error) {
  logger.error('エラーが発生しました');
  process.exit(1);  // ライブラリ内で exit
}

// 良い例（Phase 3-2 で修正）
try {
  // ...
} catch (error) {
  throw new MigrationError('エラーが発生しました', { cause: error });
}

// CLI側で処理
try {
  await migrateFromLibx(globalOpts, cmdOpts);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
```

#### 2. ロガーのグローバル依存

**問題**:
- `logger` がグローバルにインポートされている
- テスト時に出力を制御しにくい

**解決策**（Phase 3-3 以降で対応）:
- ロガーをオプションとして渡す
- テスト時にモックロガーを使用

#### 3. ファイルパスのハードコード

**問題**:
- `src/config/project.config.json` などのパスがハードコード
- 将来的な構造変更に対応しにくい

**解決策**（Phase 3-3 以降で対応）:
- パス設定を外部化
- 設定ファイルで指定可能にする

---

## テスト戦略

### Phase 3-2 で追加すべきテスト

#### 1. CLI統合テスト

**ファイル**: `packages/cli/tests/integration/cli/migrate.test.js`

```javascript
describe('migrate from-libx CLI', () => {
  it('コマンドラインから実行できる', async () => {
    const result = execSync(
      'node src/index.js migrate from-libx --source=... --project-id=...',
      { encoding: 'utf-8' }
    );
    expect(result).toContain('✅ 変換が完了しました');
  });

  it('--help でヘルプを表示できる', () => {
    const result = execSync(
      'node src/index.js migrate from-libx --help',
      { encoding: 'utf-8' }
    );
    expect(result).toContain('libx-dev プロジェクトを新レジストリ形式に変換');
  });
});
```

#### 2. バリデーションテスト

**ファイル**: `packages/cli/tests/unit/validators/registry-validator.test.js`

```javascript
describe('registry-validator', () => {
  it('正しいレジストリを検証できる', () => {
    const registry = { version: '1.0.0', projects: [] };
    const result = validateRegistry(registry);
    expect(result.valid).toBe(true);
  });

  it('不正なレジストリでエラーを返す', () => {
    const registry = { projects: 'invalid' };
    const result = validateRegistry(registry);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('projects フィールドが配列である必要があります');
  });
});
```

#### 3. スラッグ重複テスト

既存のスキップされたテストを有効化:

```javascript
// packages/cli/tests/integration/migrate/edge-cases.test.js
describe('スラッグ重複ケース', () => {
  it('スラッグが重複する場合、末尾に番号を付与する', async () => {
    // .skip を削除して有効化
    const registry = await migrateFromLibx(/* ... */);

    expect(registry.projects[0].documents).toHaveLength(2);
    expect(registry.projects[0].documents[0].slug).toBe('guide/example');
    expect(registry.projects[0].documents[1].slug).toBe('guide/example-2');
  });
});
```

### テスト実行コマンド

```bash
# 全テスト実行
npm test

# ユニットテストのみ
npm test tests/unit/

# 統合テストのみ
npm test tests/integration/

# 特定のテストファイル
npm test tests/unit/migrate/config-parser.test.js

# watch モード
npm test -- --watch

# カバレッジ
npm test -- --coverage
```

---

## 注意事項

### 1. データ構造の一貫性

既存実装では以下のフィールド名を使用しています。**変更しないでください**:

- ❌ `name` → ✅ `titles` (Category)
- ❌ `description` → ✅ `summary` (Document)
- ❌ `categoryId` → ✅ `_categoryId` (Document)
- ❌ `order` → ✅ `_order` (Document)
- ❌ `_filePath` → ✅ `_files[fileKey].filePath` (Document)

### 2. テストフィクスチャのパス解決

必ず `__dirname` を使った絶対パス解決を使用してください:

```javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = resolve(__dirname, '../../fixtures/...');
```

### 3. Glossary の JSON 構造

配列形式 `[...]` ではなく、**オブジェクト形式** `{ terms: [...] }` を使用してください:

```json
{
  "terms": [
    {
      "id": "api",
      "term": "API",
      "titles": { "en": "API", "ja": "API" },
      "definition": { "en": "...", "ja": "..." }
    }
  ]
}
```

### 4. process.exit() の扱い

現状では `from-libx.js` 内で `process.exit(1)` が呼ばれますが、これは **Phase 3-2 で修正**してください。

CLIレイヤーで exit を処理するようにします。

### 5. エラーハンドリング

すべてのエラーは以下の形式でキャッチしてください:

```javascript
try {
  // 処理
} catch (error) {
  logger.error(`エラーメッセージ: ${error.message}`);
  if (globalOpts.verbose) {
    logger.error(error.stack);
  }
  throw error;  // 再スロー
}
```

### 6. dry-run モード

`globalOpts.dryRun` が `true` の場合、**ファイルを作成しない**でください:

```javascript
if (!globalOpts.dryRun) {
  writeFileSync(targetPath, JSON.stringify(registry, null, 2));
}
```

### 7. バックアップ管理

バックアップは必ず作成してください（dry-run 以外）:

```javascript
const backupDir = cmdOpts.backup || '.backups';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = join(backupDir, `docs-${timestamp}.json`);

if (!globalOpts.dryRun) {
  mkdirSync(backupDir, { recursive: true });
  copyFileSync(targetPath, backupPath);
}
```

---

## 参考資料

### ドキュメント

1. **Phase 3-1 完了レポート**
   - `docs/new-generator-plan/phase-3-1-completion-report.md`
   - 完了した作業の詳細

2. **データ移行ガイド**
   - `docs/new-generator-plan/guides/migration-data.md`
   - データ変換の詳細仕様（1,381行）

3. **Phase 3-2 計画書**
   - `docs/new-generator-plan/phase-3-2-cli-validation.md`
   - 次フェーズの詳細計画

4. **Phase 3 キックオフ**
   - `docs/new-generator-plan/phase-3-kickoff.md`
   - Phase 3 全体の概要

### テストファイル

**ユニットテスト**:
- `packages/cli/tests/unit/migrate/content-meta.test.js`
- `packages/cli/tests/unit/migrate/config-parser.test.js`
- `packages/cli/tests/unit/migrate/category-scanner.test.js`
- `packages/cli/tests/unit/migrate/document-scanner.test.js`
- `packages/cli/tests/unit/migrate/glossary-parser.test.js`

**統合テスト**:
- `packages/cli/tests/integration/migrate/from-libx.test.js`
- `packages/cli/tests/integration/migrate/edge-cases.test.js`

**スナップショットテスト**:
- `packages/cli/tests/snapshots/migrate/output.test.js`

### 実装ファイル

**メイン処理**:
- `packages/cli/src/commands/migrate/from-libx.js` (300行)

**サブモジュール**:
- `packages/cli/src/commands/migrate/config-parser.js` (160行)
- `packages/cli/src/commands/migrate/category-scanner.js` (180行)
- `packages/cli/src/commands/migrate/document-scanner.js` (230行)
- `packages/cli/src/commands/migrate/content-meta.js` (190行)
- `packages/cli/src/commands/migrate/glossary-parser.js` (90行)

**ユーティリティ**:
- `packages/cli/src/commands/migrate/hash.js` (SHA-256ハッシュ生成)
- `packages/cli/src/commands/migrate/git.js` (Git情報取得)

---

## 次のステップ

### Phase 3-2 開始時のチェックリスト

- [ ] Phase 3-1 のテストが全て通ることを確認
- [ ] `docs/new-generator-plan/phase-3-2-cli-validation.md` を読む
- [ ] この引き継ぎドキュメントを熟読
- [ ] 既存実装のコードを確認
- [ ] テストフィクスチャの構造を理解
- [ ] データ構造（レジストリ形式）を理解

### 最初に実装すべき内容

1. **CLI統合** (最優先)
   - `packages/cli/src/commands/migrate/index.js` を作成
   - Commander.js で `migrate from-libx` コマンドを定義
   - 動作確認

2. **スラッグ重複検知** (重要)
   - `packages/cli/src/commands/migrate/slug-deduplicator.js` を作成
   - `from-libx.js` に統合
   - スキップされたテストを有効化

3. **バリデーション** (中優先)
   - `packages/cli/src/validators/registry-validator.js` を作成
   - 基本的なスキーマ検証を実装

4. **プログレスバー** (低優先)
   - UX改善として実装

### 開発フロー

```bash
# 1. Phase 3-1 のテストを実行（全て通ることを確認）
npm test tests/unit/migrate/ tests/integration/migrate/ tests/snapshots/migrate/

# 2. 新機能を実装

# 3. テストを追加

# 4. テストを実行
npm test

# 5. 動作確認
node packages/cli/src/index.js migrate from-libx --help
```

---

## 質問・相談先

Phase 3-2 の実装中に不明点があれば、以下を参照してください:

1. **既存実装**: `packages/cli/src/commands/migrate/` 内のコード
2. **テスト**: `packages/cli/tests/` 内のテストコード
3. **ドキュメント**: `docs/new-generator-plan/` 内のドキュメント
4. **データ構造**: この引き継ぎドキュメントの「データ構造」セクション

---

**Phase 3-1 完了日**: 2025-10-21
**次フェーズ開始予定**: Phase 3-2 (CLI統合・バリデーション)

**引き継ぎ担当**: Claude Code
**作成日**: 2025-10-21
