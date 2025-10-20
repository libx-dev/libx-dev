# @docs/versioning

バージョン管理ユーティリティ - ドキュメントバージョニング用のコンポーネントとヘルパー

## 概要

`@docs/versioning`は、ドキュメントサイトのバージョン管理を支援するコンポーネントとユーティリティパッケージです。バージョン切り替えUI、バージョン間差分表示、バージョン比較などの機能を提供します。

## 主要機能

- **VersionSelector**: バージョン切り替えUIコンポーネント
- **VersionDiff**: バージョン間の差分表示コンポーネント
- **バージョンユーティリティ**: バージョン比較・ソート関数
- **差分ユーティリティ**: テキスト差分計算
- **ページネーションユーティリティ**: バージョン一覧のページネーション
- **TypeScript型サポート**: 完全な型定義

## インストール

```bash
pnpm add @docs/versioning
```

## 使用方法

### VersionSelector（バージョン切り替え）

ドロップダウンUIでバージョンを切り替えます。

```astro
---
import { VersionSelector } from '@docs/versioning/components';

const versions = [
  { id: 'v3', label: 'v3 (latest)', isLatest: true },
  { id: 'v2', label: 'v2', isLatest: false },
  { id: 'v1', label: 'v1 (legacy)', isLatest: false },
];

const currentVersion = 'v2';
const currentPath = '/sample-docs/v2/ja/guide/getting-started';
---

<VersionSelector
  versions={versions}
  currentVersion={currentVersion}
  currentPath={currentPath}
/>
```

**Props**:
- `versions`: バージョン一覧（`{ id: string, label: string, isLatest: boolean }[]`）
- `currentVersion`: 現在のバージョンID
- `currentPath`: 現在のURLパス

**動作**:
- ドロップダウンメニューでバージョンを選択
- クリックすると同じページの別バージョンに遷移
- 最新バージョンには「(latest)」ラベルを表示

### VersionDiff（差分表示）

2つのバージョン間の差分を表示します。

```astro
---
import { VersionDiff } from '@docs/versioning/components';

const oldContent = `
function hello() {
  console.log('Hello, World!');
}
`;

const newContent = `
function hello() {
  console.log('Hello, LibX!');
  console.log('Welcome to LibX Docs');
}
`;
---

<VersionDiff
  oldVersion="v1"
  newVersion="v2"
  oldContent={oldContent}
  newContent={newContent}
  title="getting-started.md の変更点"
/>
```

**Props**:
- `oldVersion`: 古いバージョンID
- `newVersion`: 新しいバージョンID
- `oldContent`: 古いバージョンのコンテンツ
- `newContent`: 新しいバージョンのコンテンツ
- `title`: 差分表示のタイトル（オプション）

**表示内容**:
- 追加行: 緑色の背景（`+`プレフィックス）
- 削除行: 赤色の背景（`-`プレフィックス）
- 変更なし行: 通常の表示

## ユーティリティAPI

### バージョン管理

#### compareVersions(v1: string, v2: string): number

セマンティックバージョン（SemVer）を比較します。

**パラメータ**:
- `v1` (string): バージョン1（例: `'v1.2.3'`, `'1.2.3'`）
- `v2` (string): バージョン2（例: `'v1.3.0'`, `'1.3.0'`）

**戻り値**: number
- `-1`: v1 < v2
- `0`: v1 === v2
- `1`: v1 > v2

**例**:
```typescript
import { compareVersions } from '@docs/versioning';

compareVersions('v1.2.3', 'v1.3.0'); // -1
compareVersions('v2.0.0', 'v1.9.9'); // 1
compareVersions('v1.0.0', 'v1.0.0'); // 0
```

#### sortVersions(versions: string[]): string[]

バージョン配列を降順（最新→古い）でソートします。

**パラメータ**:
- `versions` (string[]): バージョン配列

**戻り値**: string[] - ソート済みバージョン配列（最新が先頭）

**例**:
```typescript
import { sortVersions } from '@docs/versioning';

const versions = ['v1.0.0', 'v2.1.0', 'v1.5.0', 'v2.0.0'];
const sorted = sortVersions(versions);
console.log(sorted); // ['v2.1.0', 'v2.0.0', 'v1.5.0', 'v1.0.0']
```

#### getLatestVersion(versions: string[]): string | null

最新バージョンを取得します。

**パラメータ**:
- `versions` (string[]): バージョン配列

**戻り値**: string | null - 最新バージョン（配列が空の場合はnull）

**例**:
```typescript
import { getLatestVersion } from '@docs/versioning';

const versions = ['v1.0.0', 'v2.1.0', 'v1.5.0'];
const latest = getLatestVersion(versions);
console.log(latest); // 'v2.1.0'
```

#### isValidVersion(version: string): boolean

バージョン文字列の妥当性を検証します。

**パラメータ**:
- `version` (string): バージョン文字列

**戻り値**: boolean - 妥当なバージョンの場合true

**例**:
```typescript
import { isValidVersion } from '@docs/versioning';

isValidVersion('v1.2.3'); // true
isValidVersion('1.0.0');  // true
isValidVersion('invalid'); // false
isValidVersion('v1.2');    // false
```

### 差分計算

#### computeDiff(oldText: string, newText: string): DiffResult[]

2つのテキスト間の差分を計算します。

**パラメータ**:
- `oldText` (string): 古いテキスト
- `newText` (string): 新しいテキスト

**戻り値**: DiffResult[]
```typescript
type DiffResult = {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
  lineNumber?: number;
};
```

**例**:
```typescript
import { computeDiff } from '@docs/versioning';

const oldText = 'Hello, World!';
const newText = 'Hello, LibX!';

const diff = computeDiff(oldText, newText);
console.log(diff);
// [
//   { type: 'unchanged', value: 'Hello, ', lineNumber: 1 },
//   { type: 'removed', value: 'World', lineNumber: 1 },
//   { type: 'added', value: 'LibX', lineNumber: 1 },
//   { type: 'unchanged', value: '!', lineNumber: 1 }
// ]
```

#### getDiffStats(diff: DiffResult[]): DiffStats

差分統計を取得します。

**パラメータ**:
- `diff` (DiffResult[]): 差分結果

**戻り値**: DiffStats
```typescript
type DiffStats = {
  additions: number;    // 追加行数
  deletions: number;    // 削除行数
  changes: number;      // 変更行数
  totalLines: number;   // 合計行数
};
```

**例**:
```typescript
import { computeDiff, getDiffStats } from '@docs/versioning';

const diff = computeDiff(oldText, newText);
const stats = getDiffStats(diff);
console.log(stats);
// { additions: 5, deletions: 2, changes: 7, totalLines: 100 }
```

### ページネーション

#### paginate<T>(items: T[], page: number, perPage: number): PaginationResult<T>

配列をページネーションします。

**パラメータ**:
- `items` (T[]): ページネーション対象の配列
- `page` (number): 現在のページ（1から開始）
- `perPage` (number): 1ページあたりの件数

**戻り値**: PaginationResult<T>
```typescript
type PaginationResult<T> = {
  items: T[];           // 現在ページのアイテム
  currentPage: number;  // 現在ページ
  totalPages: number;   // 合計ページ数
  totalItems: number;   // 合計アイテム数
  hasNext: boolean;     // 次ページの有無
  hasPrev: boolean;     // 前ページの有無
};
```

**例**:
```typescript
import { paginate } from '@docs/versioning';

const versions = ['v3.0.0', 'v2.5.0', 'v2.4.0', 'v2.3.0', 'v2.2.0'];
const result = paginate(versions, 1, 2);

console.log(result);
// {
//   items: ['v3.0.0', 'v2.5.0'],
//   currentPage: 1,
//   totalPages: 3,
//   totalItems: 5,
//   hasNext: true,
//   hasPrev: false
// }
```

#### getPaginationRange(currentPage: number, totalPages: number, delta: number = 2): number[]

ページネーション範囲を取得します（前後delta個のページ番号）。

**パラメータ**:
- `currentPage` (number): 現在ページ
- `totalPages` (number): 合計ページ数
- `delta` (number): 前後に表示するページ数（デフォルト: 2）

**戻り値**: number[] - 表示するページ番号の配列

**例**:
```typescript
import { getPaginationRange } from '@docs/versioning';

getPaginationRange(5, 10, 2); // [3, 4, 5, 6, 7]
getPaginationRange(1, 10, 2); // [1, 2, 3]
getPaginationRange(10, 10, 2); // [8, 9, 10]
```

## 使用例

### バージョン切り替え機能の実装

```astro
---
import { VersionSelector } from '@docs/versioning/components';
import { sortVersions, getLatestVersion } from '@docs/versioning';

// レジストリからバージョン取得
const allVersions = ['v1', 'v2', 'v3'];
const sorted = sortVersions(allVersions);
const latest = getLatestVersion(allVersions);

// VersionSelector用のデータ作成
const versions = sorted.map(v => ({
  id: v,
  label: v === latest ? `${v} (latest)` : v,
  isLatest: v === latest
}));

const currentVersion = 'v2';
const currentPath = Astro.url.pathname;
---

<VersionSelector
  versions={versions}
  currentVersion={currentVersion}
  currentPath={currentPath}
/>
```

### バージョン間差分の表示

```astro
---
import { VersionDiff } from '@docs/versioning/components';
import { computeDiff, getDiffStats } from '@docs/versioning';

// 2つのバージョンのコンテンツを取得
const v1Content = await fetchContent('v1', 'getting-started');
const v2Content = await fetchContent('v2', 'getting-started');

// 差分計算
const diff = computeDiff(v1Content, v2Content);
const stats = getDiffStats(diff);
---

<h2>バージョン間の差分</h2>
<p>追加: {stats.additions}行 / 削除: {stats.deletions}行</p>

<VersionDiff
  oldVersion="v1"
  newVersion="v2"
  oldContent={v1Content}
  newContent={v2Content}
  title="getting-started.md"
/>
```

### バージョン一覧のページネーション

```astro
---
import { paginate, getPaginationRange } from '@docs/versioning';

const allVersions = ['v3.0.0', 'v2.5.0', 'v2.4.0', /* ... */];
const currentPage = 1;
const perPage = 10;

const paginationResult = paginate(allVersions, currentPage, perPage);
const pageRange = getPaginationRange(
  paginationResult.currentPage,
  paginationResult.totalPages
);
---

<ul>
  {paginationResult.items.map(version => (
    <li><a href={`/docs/${version}`}>{version}</a></li>
  ))}
</ul>

<nav>
  {paginationResult.hasPrev && (
    <a href={`?page=${currentPage - 1}`}>前へ</a>
  )}

  {pageRange.map(page => (
    <a
      href={`?page=${page}`}
      class={page === currentPage ? 'active' : ''}
    >
      {page}
    </a>
  ))}

  {paginationResult.hasNext && (
    <a href={`?page=${currentPage + 1}`}>次へ</a>
  )}
</nav>
```

## 配布形態

### ソース配布

`@docs/versioning`はAstroコンポーネント（.astro）を含むため、ソース配布します。

**理由**:
- Astroコンポーネントはビルド時にAstroコンパイラで処理される
- ビルド成果物は不要
- TypeScriptユーティリティもソースのまま配布

**package.json**:
```json
{
  "exports": {
    ".": "./src/index.ts",
    "./components": "./src/components/index.ts",
    "./components/*": "./src/components/*.astro",
    "./utils": "./src/utils/index.ts"
  },
  "files": [
    "src",
    "README.md"
  ],
  "peerDependencies": {
    "astro": "^5.0.0",
    "@docs/ui": "workspace:*"
  }
}
```

## 依存関係

### 外部依存

- `diff`: テキスト差分計算ライブラリ（v5.2.0）

### ピア依存

- `astro`: Astroフレームワーク（^5.0.0）
- `@docs/ui`: UIコンポーネントパッケージ（workspace:*）

## 開発

### ディレクトリ構造

```
packages/versioning/
├── src/
│   ├── index.ts
│   ├── components/
│   │   ├── VersionSelector.astro  # バージョン切り替えUI
│   │   ├── VersionDiff.astro      # 差分表示UI
│   │   └── index.ts
│   └── utils/
│       ├── version.ts             # バージョン管理
│       ├── diff.ts                # 差分計算
│       ├── pagination.ts          # ページネーション
│       └── index.ts
├── package.json
└── README.md
```

### 新しいコンポーネントの追加

1. `src/components/`にコンポーネントファイルを作成
2. `src/components/index.ts`にエクスポートを追加
3. このREADME.mdに使用例を追加

### 新しいユーティリティの追加

1. `src/utils/`にユーティリティファイルを作成
2. `src/utils/index.ts`にエクスポートを追加
3. このREADME.mdにAPI説明を追加

## 参考資料

- [Semantic Versioning 2.0.0](https://semver.org/lang/ja/)
- [diff (npm package)](https://www.npmjs.com/package/diff)
- [Astro Documentation](https://docs.astro.build/)

## ライセンス

MIT License

このパッケージはlibx-devプロジェクトの一部です。
