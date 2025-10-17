# テストポリシーガイド

Phase 1-4で構築したテストスイートの使い方と、新規テスト追加のガイドラインを説明します。

## テストの目的

- **品質保証**: レジストリとCLIの動作を自動的に検証し、バグを早期発見
- **リグレッション防止**: 新機能追加時に既存機能が壊れていないことを確認
- **ドキュメント**: テストコードが実装の動作仕様を示すドキュメントとして機能
- **リファクタリングの安全性**: コードを安心して改善できる基盤を提供

## テストフレームワーク

このプロジェクトでは**Vitest**を使用しています。

**選定理由:**
- ESMネイティブサポート（このプロジェクトは`type: "module"`）
- 高速な実行とHot Module Replacement
- Jestとほぼ互換のAPI（学習コストが低い）
- 組み込みカバレッジツール

## テスト実行方法

### 基本的な実行

```bash
# 全テストを実行
pnpm test

# ウォッチモード（ファイル変更時に自動実行）
pnpm test:watch

# カバレッジレポート生成
pnpm test:coverage

# 特定パッケージのみ
cd packages/cli && pnpm test
cd packages/validator && pnpm test
```

### カバレッジ閾値

プロジェクトのカバレッジ目標:
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 70%
- **Statements**: 80%

## テストの分類

### 1. ユニットテスト (Unit Tests)

**目的**: 個別の関数やクラスを独立してテスト

**配置場所**: `packages/*/tests/unit/*.test.js`

**特徴**:
- 高速（ファイルI/Oやネットワークを最小化）
- 1つの関数/メソッドに焦点
- モックを活用して依存を分離

**例**:
```javascript
// packages/cli/tests/unit/logger.test.js
import { Logger, LOG_LEVELS } from '../../src/utils/logger.js';

describe('Logger', () => {
  it('デフォルトのログレベルはINFO', () => {
    const logger = new Logger();
    expect(logger.level).toBe(LOG_LEVELS.INFO);
  });
});
```

**ユニットテストの対象**:
- Logger
- RegistryManager
- BackupManager
- Validator各モジュール

### 2. 統合テスト (Integration Tests)

**目的**: 複数のモジュールを組み合わせた実際のワークフローをテスト

**配置場所**: `packages/*/tests/integration/*.test.js`

**特徴**:
- 実際のファイルシステムを使用
- 一時ディレクトリで実行（テスト後クリーンアップ）
- エンドツーエンドのフローを検証

**例**:
```javascript
// packages/cli/tests/integration/add-project.test.js
import { RegistryManager } from '../../src/utils/registry.js';
import { setupTest } from '../helpers/fixtures.js';

describe('add project 統合テスト', () => {
  let testEnv;

  beforeEach(() => {
    testEnv = setupTest('add-project');
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  it('プロジェクト追加の完全ワークフロー', () => {
    // 実際のレジストリ操作をテスト
  });
});
```

**統合テストの対象**:
- プロジェクト追加フロー
- バリデーション実行フロー
- バックアップ＆ロールバックフロー

### 3. スナップショットテスト (Snapshot Tests)

**目的**: エラーメッセージやCLI出力の一貫性を保証

**配置場所**: `packages/*/tests/snapshots/*.test.js`

**特徴**:
- 出力フォーマットの変更を検知
- 初回実行時にスナップショットを自動生成
- 意図的な変更時は`vitest -u`で更新

**例**:
```javascript
// packages/cli/tests/snapshots/errors.test.js
it('エラーメッセージの文字列表現', () => {
  const collection = new ValidationErrorCollection();
  collection.add(new ValidationError('MISSING_FIELD', 'Required field is missing'));

  expect(collection.toString()).toMatchSnapshot();
});
```

**スナップショットテストの対象**:
- ValidationErrorCollectionの出力
- CLIコマンドのヘルプメッセージ
- JSON形式のログ出力

## テストヘルパーとユーティリティ

### fixtures.js

テストデータの生成と一時ディレクトリ管理を提供:

```javascript
import { setupTest, createTestRegistry } from '../helpers/fixtures.js';

// テストセットアップ（一時ディレクトリ、レジストリ、設定ファイル作成）
const testEnv = setupTest('my-test');
// testEnv.tempDir, testEnv.registryPath, testEnv.configPath, testEnv.cleanup()

// テスト用レジストリ生成
const registry = createTestRegistry({
  projectCount: 2,
  documentCount: 5,
  withVersions: true,
  withLanguages: true,
});
```

### cli-runner.js

CLIコマンド実行とキャプチャ:

```javascript
import { runCLI, runCLISuccess, runCLIDryRun } from '../helpers/cli-runner.js';

// CLIコマンド実行
const result = await runCLI(['add', 'project', 'my-project'], {
  cwd: testEnv.tempDir,
});

// 成功を期待
await runCLISuccess(['validate']);

// dry-runモード
await runCLIDryRun(['add', 'project', 'test']);
```

## 新規テスト追加ガイドライン

### 1. テストの命名規則

**ファイル名**:
- ユニット: `<module-name>.test.js`
- 統合: `<command-name>.test.js`
- スナップショット: `<category>.test.js`

**describe/itブロック**:
- `describe`: 機能やコンポーネント名
- `it`: 期待する動作を日本語で記述

```javascript
describe('RegistryManager', () => {
  describe('プロジェクト操作', () => {
    it('プロジェクトを追加できる', () => {
      // テストコード
    });

    it('重複したプロジェクトIDは追加できない', () => {
      // テストコード
    });
  });
});
```

### 2. テストの構造（AAA パターン）

```javascript
it('テストケース', () => {
  // Arrange（準備）
  const manager = new RegistryManager({
    registryPath: 'registry/docs.json',
    projectRoot: testEnv.tempDir,
  });
  manager.load();

  // Act（実行）
  const result = manager.findProject('test-project');

  // Assert（検証）
  expect(result).toBeDefined();
  expect(result.id).toBe('test-project');
});
```

### 3. beforeEach / afterEachの活用

テスト間の状態をクリーンに保つ:

```javascript
describe('MyModule', () => {
  let testEnv;
  let module;

  beforeEach(() => {
    testEnv = setupTest('my-module');
    module = new MyModule({ projectRoot: testEnv.tempDir });
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  it('テスト1', () => {
    // testEnvとmoduleは毎回クリーンな状態
  });
});
```

### 4. エラーケースのテスト

```javascript
it('存在しないプロジェクトを更新しようとするとエラー', () => {
  manager.load();

  expect(() => {
    manager.updateProject('nonexistent', { displayName: { en: 'Test' } });
  }).toThrow(/が見つかりません/);
});
```

### 5. モックの活用

console.logなどの副作用をモック化:

```javascript
import { vi } from 'vitest';

it('ログ出力をテスト', () => {
  const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  logger.info('test message');

  expect(consoleLogSpy).toHaveBeenCalledOnce();
  expect(consoleLogSpy.mock.calls[0][0]).toContain('test message');

  consoleLogSpy.mockRestore();
});
```

## テスト実行時の注意事項

### 一時ディレクトリの管理

テスト用の一時ファイルは必ずクリーンアップ:

```javascript
afterEach(() => {
  testEnv.cleanup(); // 一時ディレクトリを削除
});
```

### 並列実行

- デフォルトで並列実行されます
- テスト間で状態を共有しないこと
- ファイル名の衝突を避けること

### タイムアウト

長時間かかるテストはタイムアウトを調整:

```javascript
it('時間のかかる処理', async () => {
  // タイムアウトを30秒に設定
}, 30000);
```

## CI統合

GitHub Actions等のCI環境では以下のワークフローを推奨:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm test:coverage

      # カバレッジレポートをアップロード
      - uses: codecov/codecov-action@v3
        if: always()
```

## トラブルシューティング

### テストが失敗する

1. **エラーメッセージを確認**: `pnpm test`の出力を詳しく読む
2. **単一テストを実行**: `vitest run path/to/test.test.js`
3. **デバッグ出力を追加**: `console.log()` でデバッグ情報を表示

### スナップショットが一致しない

意図的な変更の場合:

```bash
pnpm test -- -u  # スナップショットを更新
```

### カバレッジが足りない

```bash
pnpm test:coverage
```

カバレッジレポート（`coverage/index.html`）を開いて、どの行がテストされていないか確認。

## ベストプラクティス

1. **小さく書く**: 1テストで1つの動作を検証
2. **独立性**: テスト間で状態を共有しない
3. **可読性**: テストコードは仕様書。わかりやすく書く
4. **高速**: ユニットテストは1秒以内に完了するように
5. **リアルな入力**: edge case（境界値、異常値）もテスト

## まとめ

このテストスイートを活用することで:

- ✅ 自信を持ってコードを変更できる
- ✅ バグを早期に発見できる
- ✅ ドキュメントとしても機能する
- ✅ チーム全体の品質意識が向上する

新機能を追加したら、必ずテストも追加してください!
