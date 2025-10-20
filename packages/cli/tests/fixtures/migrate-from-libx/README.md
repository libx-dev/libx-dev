# migrate-from-libx テストフィクスチャ

このディレクトリには、`migrate-from-libx`コマンドのテスト用フィクスチャが含まれています。

## フィクスチャの種類

### 1. sample-small
小規模なテストケースで、基本的な変換機能をテストします。

**構成**:
- プロジェクト: test-project
- 言語: en, ja (2言語)
- バージョン: v1 (1バージョン)
- カテゴリ: guide (1カテゴリ)
- ドキュメント: getting-started, installation (2ドキュメント)

### 2. edge-cases
エッジケースをテストするためのフィクスチャです。

#### 2-1. missing-files
ファイル欠損ケース（一部の言語版が存在しない）

#### 2-2. invalid-frontmatter
不正なフロントマターを含むケース

#### 2-3. duplicate-slugs
スラッグ重複ケース（同じカテゴリ内で同じファイル名）

## 使用方法

```javascript
import { resolve } from 'path';

const fixturePath = resolve('tests/fixtures/migrate-from-libx/sample-small/apps/test-project');
```

## テストケースの追加

新しいテストケースを追加する場合は、以下の構造に従ってください：

```
new-test-case/
├── apps/
│   └── {project-id}/
│       └── src/
│           ├── config/
│           │   └── project.config.json
│           └── content/
│               └── docs/
│                   └── {version}/
│                       └── {lang}/
│                           └── {NN-category}/
│                               └── {NN-document}.mdx
└── expected-output.json  # 期待される変換結果（任意）
```
