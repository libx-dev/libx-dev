# Phase 2-5 引き継ぎガイド

**作成日**: 2025-10-19
**対象**: Phase 2-5（共有パッケージ検証）担当者
**前提**: Phase 2-4完了（パフォーマンス最適化・アクセシビリティ向上完了）

---

## 📋 Phase 2-4完了状況サマリー

### ✅ Phase 2-4で達成したこと

#### パフォーマンス最適化
- ✅ Astro標準の画像最適化（astro:assets）統合
- ✅ コード分割最適化（8チャンク分離戦略）
- ✅ CSS最小化設定

#### アクセシビリティ向上
- ✅ Lighthouse Accessibility 91/100達成（目標90以上）
- ✅ WCAG 2.1主要項目準拠
- ✅ キーボードナビゲーション・スクリーンリーダー対応完了

#### 検索機能強化
- ✅ ファセット検索（プロジェクト/バージョン/言語フィルタ）
- ✅ ページネーション（10件/ページ）
- ✅ 検索ハイライト機能

#### 統合テスト
- ✅ **Lighthouse Performance 100/100**
- ✅ **Lighthouse Best Practices 96/100**
- ✅ **Lighthouse SEO 100/100**
- ✅ ビルド成功（62ページ、4,635語インデックス化）

### 📊 現在のシステム状態

| 項目 | 状態 |
|------|------|
| ビルドシステム | ✅ 完全動作（62ページ生成、約4秒） |
| パフォーマンス | ✅ Lighthouse 100/100 |
| アクセシビリティ | ✅ Lighthouse 91/100 |
| 検索機能 | ✅ 高機能（フィルタ、ページネーション、ハイライト） |
| ビルドサイズ | 5.6MB |
| 対応言語 | 3言語（ja, ko, en） |

---

## 🎯 Phase 2-5の目的と目標

### Phase 2-5の主要目標

**Phase 2-5**: 共有パッケージ検証（想定期間: 1-2週間）

1. **共有パッケージの配布形態決定**
   - npm公開 vs Gitサブモジュール vs モノレポ内配布
   - メリット・デメリット比較
   - 最適な運用モデル確立

2. **ビルド設定・型定義整備**
   - TypeScript型定義（.d.ts）出力
   - ESM/CJS対応検討
   - CSS/アセット配布方法

3. **リリースフロー設計**
   - バージョニング戦略（SemVer）
   - CHANGELOG管理
   - 自動リリースプロセス

4. **互換性検証**
   - 外部プロジェクトでの利用テスト
   - Breaking Change検出
   - マイグレーションガイド作成

---

## 📂 現在の共有パッケージ構成

### パッケージ一覧

```
packages/
├── ui/              # UIコンポーネント（Astroコンポーネント集）
├── theme/           # テーマシステム（CSS変数、カラーパレット）
├── i18n/            # 国際化ユーティリティ
├── versioning/      # バージョン管理ユーティリティ
├── generator/       # レジストリ駆動ジェネレーター
├── runtime/         # Astroランタイム（Phase 2の主成果物）
├── cli/             # CLIツール
└── validator/       # バリデーションツール
```

### 各パッケージの現状

#### 1. @docs/ui

**現在の状態**:
```json
{
  "name": "@docs/ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./components": "./src/components/index.ts"
  },
  "dependencies": {
    "astro": "^5.7.12"
  }
}
```

**特徴**:
- Astroコンポーネント（.astroファイル）集
- TypeScriptソースを直接エクスポート
- ビルド成果物なし（ソース配布）

**Phase 2-4での使用状況**:
- ✅ runtimeパッケージで使用中
- ✅ 動作確認済み
- ⚠️ ビルド・型定義なし

#### 2. @docs/theme

**現在の状態**:
```json
{
  "name": "@docs/theme",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./colors": "./src/colors.ts",
    "./typography": "./src/typography.ts",
    "./spacing": "./src/spacing.ts",
    "./css": "./src/css/index.ts",
    "./css/variables.css": "./src/css/variables.css",
    "./css/base.css": "./src/css/base.css"
  }
}
```

**特徴**:
- CSS変数定義
- TypeScriptカラーパレット定義
- デザイントークン

**Phase 2-4での使用状況**:
- ✅ BaseLayout.astroで使用中
- ✅ CSS変数として動作確認済み
- ⚠️ CSS配布方法未確定

#### 3. @docs/i18n

**現在の状態**:
```json
{
  "name": "@docs/i18n",
  "version": "0.1.0",
  "private": true,
  "type": "module"
}
```

**特徴**:
- 言語ユーティリティ
- 翻訳ヘルパー関数

**Phase 2-4での使用状況**:
- ⚠️ 使用頻度低
- 🔍 機能整理が必要

#### 4. @docs/versioning

**現在の状態**:
```json
{
  "name": "@docs/versioning",
  "version": "0.1.0",
  "private": true,
  "type": "module"
}
```

**特徴**:
- バージョン管理ユーティリティ

**Phase 2-4での使用状況**:
- ✅ VersionSelectorコンポーネントで使用
- ⚠️ generatorパッケージと機能重複の可能性

#### 5. @docs/generator

**現在の状態**:
```json
{
  "name": "@docs/generator",
  "version": "0.1.0",
  "private": true,
  "type": "module"
}
```

**特徴**:
- レジストリ駆動のルーティング生成
- サイドバー生成
- メタデータ生成

**Phase 2-4での使用状況**:
- ✅ runtimeパッケージのコア機能
- ✅ 高頻度使用
- ⚠️ 型定義が重要

---

## 🔧 Phase 2-5タスク詳細

### タスク1: ビルド設定・型定義整備（2-3日）

#### 目的
各共有パッケージをビルドし、TypeScript型定義を出力する。

#### 実装手順

##### 1-1. ビルドツールの選定

**推奨**: `tsup`（高速・シンプル）

**代替案**:
- Rollup（細かい制御が必要な場合）
- tsc（型定義のみの場合）

**選定理由**:
- TypeScript専用で設定が簡単
- ESM/CJS両対応
- 型定義自動生成
- 高速ビルド

##### 1-2. @docs/generator のビルド設定

**packages/generator/tsup.config.ts**:

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,  // 型定義生成
  clean: true,
  sourcemap: true,
  minify: false,  // デバッグ容易性のため無効
  splitting: false,
  treeshake: true,
  outDir: 'dist'
});
```

**package.json更新**:

```json
{
  "name": "@docs/generator",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "prepublishOnly": "pnpm build"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.8.3"
  }
}
```

##### 1-3. @docs/ui のビルド設定

**注意**: Astroコンポーネント（.astro）はビルド不要

**推奨アプローチ**: ソース配布

**package.json**:

```json
{
  "name": "@docs/ui",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./components": "./src/components/index.ts",
    "./components/*": "./src/components/*.astro"
  },
  "files": [
    "src",
    "README.md"
  ],
  "peerDependencies": {
    "astro": "^5.0.0"
  },
  "devDependencies": {
    "astro": "^5.7.12",
    "typescript": "^5.8.3"
  }
}
```

**型定義のみ生成**:

```bash
tsc --emitDeclarationOnly --declaration --outDir dist
```

##### 1-4. @docs/theme のビルド設定

**CSS配布**: そのまま配布

**package.json**:

```json
{
  "name": "@docs/theme",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./dist/index.js",
    "./colors": "./dist/colors.js",
    "./css/variables.css": "./src/css/variables.css",
    "./css/base.css": "./src/css/base.css"
  },
  "files": [
    "dist",
    "src/css",
    "README.md"
  ],
  "scripts": {
    "build": "tsup"
  }
}
```

##### 1-5. ビルドテスト

```bash
# 各パッケージでビルド実行
cd packages/generator && pnpm build
cd packages/theme && pnpm build

# 型定義確認
ls -la packages/generator/dist/*.d.ts

# runtimeパッケージでビルドテスト
cd packages/runtime && pnpm build
```

#### 成果物
- ✅ 各パッケージの`dist/`ディレクトリ
- ✅ 型定義ファイル（.d.ts）
- ✅ ESM/CJS両対応のビルド成果物

---

### タスク2: 依存関係チェック・最適化（1日）

#### 目的
各パッケージの依存関係を見直し、最小限にする。

#### チェック項目

##### 2-1. peerDependencies vs dependencies

**原則**:
- **peerDependencies**: Astro、React等のフレームワーク
- **dependencies**: ユーティリティライブラリ
- **devDependencies**: ビルド・テストツール

**例（@docs/ui）**:

```json
{
  "peerDependencies": {
    "astro": "^5.0.0"
  },
  "devDependencies": {
    "astro": "^5.7.12",
    "typescript": "^5.8.3"
  }
}
```

##### 2-2. 不要な依存関係の削除

```bash
# 各パッケージの依存関係を確認
pnpm list --depth=0 --filter=@docs/ui
pnpm list --depth=0 --filter=@docs/generator
pnpm list --depth=0 --filter=@docs/theme

# 未使用の依存関係を検出
pnpm why <package-name>
```

##### 2-3. バージョン範囲の統一

**推奨**:
- メジャーバージョンは`^`（SemVer互換）
- Astro等のフレームワークは`^5.0.0`（広めの範囲）

#### 成果物
- ✅ 最適化された各パッケージの`package.json`
- ✅ 依存関係チェックレポート

---

### タスク3: リリースフロー設計（2-3日）

#### 目的
バージョニング戦略とリリースプロセスを確立する。

#### 3-1. バージョニング戦略

**SemVer（セマンティックバージョニング）採用**:

- **MAJOR (1.0.0)**: Breaking Changes
- **MINOR (0.1.0)**: 新機能追加（後方互換）
- **PATCH (0.0.1)**: バグフィックス

**例**:
```
0.1.0 → 初期リリース
0.2.0 → 新機能追加
0.2.1 → バグフィックス
1.0.0 → 安定版リリース
```

#### 3-2. CHANGELOG管理

**推奨**: Conventional Commits + Changesets

**インストール**:

```bash
pnpm add -D -w @changesets/cli
pnpm changeset init
```

**.changeset/config.json**:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@2.3.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [
    ["@docs/ui", "@docs/theme", "@docs/generator", "@docs/i18n", "@docs/versioning"]
  ],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@docs/runtime", "@docs/cli"]
}
```

#### 3-3. リリーススクリプト

**package.json（ルート）**:

```json
{
  "scripts": {
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm build && changeset publish"
  }
}
```

**使用方法**:

```bash
# 1. 変更内容を記録
pnpm changeset
# → パッケージ選択、変更タイプ選択、説明入力

# 2. バージョン更新
pnpm version
# → package.jsonとCHANGELOG.mdが自動更新

# 3. npm公開
pnpm release
# → ビルド→公開
```

#### 3-4. GitHub Actions自動リリース

**.github/workflows/release.yml**:

```yaml
name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          publish: pnpm release
          commit: 'chore: release packages'
          title: 'chore: release packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### 成果物
- ✅ Changesets設定
- ✅ リリーススクリプト
- ✅ GitHub Actions設定
- ✅ リリースフロードキュメント

---

### タスク4: npm vs Gitサブモジュール比較（1-2日）

#### 目的
配布形態のメリット・デメリットを比較し、最適な方法を決定する。

#### 4-1. 比較表

| 項目 | npm公開 | Gitサブモジュール | モノレポ内配布 |
|------|---------|-------------------|----------------|
| **配布の容易性** | ✅ 非常に簡単<br>`npm install @docs/ui` | ⚠️ やや複雑<br>`git submodule add` | ✅ 簡単<br>pnpm workspace |
| **バージョン管理** | ✅ SemVerで明確 | ⚠️ Git commitベース | ✅ workspace:*で管理 |
| **更新通知** | ✅ npm outdatedで確認可能 | ❌ 手動確認必要 | ✅ pnpm updateで一括 |
| **セキュリティ** | ⚠️ npm公開リスク | ✅ プライベート管理 | ✅ プライベート管理 |
| **CI/CD統合** | ✅ 簡単 | ⚠️ サブモジュール更新必要 | ✅ 簡単 |
| **外部利用** | ✅ 可能 | ⚠️ 制限的 | ❌ 不可能 |
| **開発速度** | ⚠️ リリース待ち | ✅ 即座に反映 | ✅ 即座に反映 |
| **依存関係解決** | ✅ npm自動解決 | ⚠️ 手動管理 | ✅ pnpm自動解決 |
| **ビルド成果物** | ✅ 必要（dist/） | ⚠️ ソース配布可 | ⚠️ ソース配布可 |
| **型定義** | ✅ .d.tsパッケージング | ✅ ソースから直接 | ✅ ソースから直接 |

#### 4-2. 推奨戦略

**段階的アプローチ**:

1. **Phase 2-5（現在）**: モノレポ内配布継続
   - 開発速度最優先
   - ビルド設定・型定義整備

2. **Phase 3**: npm公開準備
   - スコープ付きパッケージ（@docs/*）
   - 内部利用のみ（private: false、但しドキュメント未公開）

3. **Phase 4-5**: npm公開（オプション）
   - 外部利用を想定する場合のみ
   - ドキュメント・サンプル整備

**判断基準**:

```
外部利用を想定する場合:
→ npm公開 + Changesets + 自動リリース

内部利用のみの場合:
→ モノレポ内配布継続（pnpm workspace）
```

#### 成果物
- ✅ 比較表（上記）
- ✅ 配布戦略決定ドキュメント
- ✅ DECISIONS.mdへの記録

---

### タスク5: 互換性検証（2-3日）

#### 目的
各配布方法で実際に動作することを確認する。

#### 5-1. テストプロジェクトの作成

**test-projects/npm-usage/**:

```bash
mkdir -p test-projects/npm-usage
cd test-projects/npm-usage
npm init -y
npm install ../../packages/generator
```

**test-projects/npm-usage/test.js**:

```javascript
import { loadRegistry, generateRoutes } from '@docs/generator';

const registry = loadRegistry('../../registry/docs.json');
const routes = generateRoutes(registry);

console.log('Routes generated:', routes.length);
```

#### 5-2. ビルド成果物テスト

```bash
# generatorパッケージをビルド
cd packages/generator
pnpm build

# distから読み込みテスト
node -e "const { loadRegistry } = require('./dist/index.cjs'); console.log(loadRegistry);"
```

#### 5-3. 型定義テスト

**test-projects/types-test/test.ts**:

```typescript
import { Registry, Route, SidebarItem } from '@docs/generator';

const registry: Registry = {
  projects: {},
  documents: {},
  categories: {}
};

// 型チェックが通ることを確認
```

```bash
npx tsc --noEmit test.ts
```

#### 5-4. runtimeパッケージでの統合テスト

```bash
# generatorパッケージのビルド成果物を使用してruntimeをビルド
cd packages/runtime
pnpm build

# ビルド成功 + Lighthouseテスト
pnpm preview &
node test-lighthouse.js
```

**成功基準**:
- ✅ ビルド成功
- ✅ Lighthouseスコア維持（Performance 100, Accessibility 91以上）
- ✅ 型エラーなし

#### 成果物
- ✅ テストプロジェクト（test-projects/）
- ✅ 互換性検証レポート
- ✅ Breaking Change一覧

---

### タスク6: ドキュメント・ライセンス整備（1-2日）

#### 目的
共有パッケージの利用方法とライセンス情報を整備する。

#### 6-1. 共有パッケージ利用ガイド

**docs/new-generator-plan/guides/shared-packages.md**:

```markdown
# 共有パッケージ利用ガイド

## パッケージ一覧

### @docs/generator
レジストリ駆動のルーティング・サイドバー・メタデータ生成

**インストール**:
\`\`\`bash
pnpm add @docs/generator
\`\`\`

**使用例**:
\`\`\`typescript
import { loadRegistry, generateRoutes } from '@docs/generator';

const registry = loadRegistry('registry/docs.json');
const routes = generateRoutes(registry);
\`\`\`

### @docs/ui
Astro UIコンポーネント集

**インストール**:
\`\`\`bash
pnpm add @docs/ui
\`\`\`

**使用例**:
\`\`\`astro
---
import { Button, Card } from '@docs/ui/components';
---

<Button variant="primary">クリック</Button>
\`\`\`

### @docs/theme
テーマシステム（CSS変数、カラーパレット）

**インストール**:
\`\`\`bash
pnpm add @docs/theme
\`\`\`

**使用例**:
\`\`\`css
@import '@docs/theme/css/variables.css';
@import '@docs/theme/css/base.css';
\`\`\`

## リリースフロー

### 変更内容の記録

\`\`\`bash
pnpm changeset
\`\`\`

### バージョン更新

\`\`\`bash
pnpm version
\`\`\`

### npm公開

\`\`\`bash
pnpm release
\`\`\`

## トラブルシューティング

### 型定義が見つからない

\`\`\`bash
pnpm build  # dist/配下に.d.tsが生成される
\`\`\`
```

#### 6-2. 各パッケージのREADME.md

**packages/generator/README.md**:

```markdown
# @docs/generator

レジストリ駆動のドキュメントサイト生成ライブラリ

## インストール

\`\`\`bash
pnpm add @docs/generator
\`\`\`

## 使用方法

### レジストリ読み込み

\`\`\`typescript
import { loadRegistry } from '@docs/generator';

const registry = loadRegistry('registry/docs.json');
\`\`\`

### ルーティング生成

\`\`\`typescript
import { generateRoutes } from '@docs/generator';

const routes = generateRoutes(registry, {
  env: 'production',
  debug: false
});
\`\`\`

### サイドバー生成

\`\`\`typescript
import { generateSidebar } from '@docs/generator';

const sidebar = generateSidebar(registry, 'sample-docs', 'v2', 'ja');
\`\`\`

## API

詳細は[API Documentation](./docs/api.md)を参照してください。

## ライセンス

MIT License
\`\`\`

#### 6-3. ライセンス情報整理

**各パッケージのpackage.json**:

```json
{
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/dolphilia/libx-dev.git",
    "directory": "packages/generator"
  },
  "bugs": {
    "url": "https://github.com/dolphilia/libx-dev/issues"
  },
  "homepage": "https://github.com/dolphilia/libx-dev#readme"
}
```

**LICENSEファイル**（各パッケージ）:

```
MIT License

Copyright (c) 2025 libx-dev contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

#### 成果物
- ✅ `docs/new-generator-plan/guides/shared-packages.md`
- ✅ 各パッケージの`README.md`
- ✅ 各パッケージの`LICENSE`
- ✅ `package.json`のライセンス・リポジトリ情報

---

## 📋 Phase 2-5チェックリスト

### タスク1: ビルド設定・型定義整備
- [ ] tsup設定作成（generator、theme）
- [ ] package.json更新（exports、types、files）
- [ ] ビルド実行・型定義確認
- [ ] runtimeパッケージでのビルドテスト

### タスク2: 依存関係チェック・最適化
- [ ] peerDependencies/dependencies整理
- [ ] 不要な依存関係削除
- [ ] バージョン範囲統一
- [ ] 依存関係チェックレポート作成

### タスク3: リリースフロー設計
- [ ] Changesets導入
- [ ] リリーススクリプト作成
- [ ] GitHub Actions設定
- [ ] リリースフロードキュメント作成

### タスク4: npm vs Gitサブモジュール比較
- [ ] 比較表作成
- [ ] 配布戦略決定
- [ ] DECISIONS.mdへ記録

### タスク5: 互換性検証
- [ ] テストプロジェクト作成
- [ ] ビルド成果物テスト
- [ ] 型定義テスト
- [ ] runtimeパッケージ統合テスト
- [ ] 互換性検証レポート作成

### タスク6: ドキュメント・ライセンス整備
- [ ] 共有パッケージ利用ガイド作成
- [ ] 各パッケージREADME.md作成
- [ ] LICENSEファイル作成
- [ ] package.jsonライセンス情報追加

---

## 🎯 Phase 2-5成功基準

### 必須項目

1. **ビルド成果物生成**
   - [ ] @docs/generatorのdist/が生成される
   - [ ] 型定義（.d.ts）が正しく生成される
   - [ ] ESM/CJS両方のビルドが成功する

2. **互換性維持**
   - [ ] runtimeパッケージがビルド成功する
   - [ ] Lighthouseスコアが維持される（Performance 100, Accessibility 91以上）
   - [ ] 型エラーがない

3. **リリースフロー確立**
   - [ ] Changesetsが動作する
   - [ ] バージョン更新が自動化される
   - [ ] CHANGELOG.mdが自動生成される

4. **ドキュメント完備**
   - [ ] 共有パッケージ利用ガイドが整備されている
   - [ ] 各パッケージのREADME.mdが整備されている
   - [ ] リリースフローが文書化されている

### 推奨項目

1. **npm公開準備**（オプション）
   - [ ] npmアカウント・組織作成
   - [ ] GitHub Actions設定
   - [ ] npm公開テスト（dry-run）

2. **パフォーマンス**
   - [ ] ビルド時間が許容範囲（各パッケージ < 10秒）
   - [ ] パッケージサイズが適切（< 100KB）

---

## 🚀 Phase 2-5開始手順

### ステップ1: Phase 2-4成果物の確認（30分）

```bash
# 現在のビルド状態を確認
cd packages/runtime
pnpm build

# Lighthouseスコア確認
pnpm preview &
node test-lighthouse.js

# 現在の共有パッケージ確認
ls -la packages/
```

### ステップ2: 開発環境のセットアップ（30分）

```bash
# 最新のコードを取得
git pull origin main

# 依存関係を更新
pnpm install

# tsupをインストール
pnpm add -D -w tsup @changesets/cli
```

### ステップ3: Phase 2-5計画書の確認（1時間）

1. `docs/new-generator-plan/phase-2-5-shared-packages.md`を読む
2. 本ドキュメント（phase-2-5-handoff.md）を読む
3. タスク一覧を確認
4. 不明点があればチームで議論

### ステップ4: タスク1開始（即座）

```bash
# generatorパッケージのビルド設定作成
cd packages/generator
touch tsup.config.ts

# tsup.config.tsを編集（上記テンプレート参照）
# package.jsonを更新（上記テンプレート参照）

# ビルドテスト
pnpm add -D tsup
pnpm build

# ビルド成果物確認
ls -la dist/
```

---

## 📞 サポート・質問

Phase 2-5実装中に不明点があれば、以下のリソースを参照してください：

### Phase 2関連ドキュメント
- [Phase 2-4完了報告書](./phase-2-4-completion-report.md)
- [Phase 2-3完了報告書](./phase-2-3-completion-report.md)
- [packages/runtime/README.md](../../packages/runtime/README.md)

### 外部ドキュメント
- [tsup Documentation](https://tsup.egoist.dev/)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)

---

## 📝 Phase 2-5進捗報告

週次で進捗を記録してください：

**テンプレート**: `docs/new-generator-plan/status/weekly/2025-W43.md`

```markdown
# Week 43 進捗報告（2025-10-21〜2025-10-27）

## 完了したタスク
- [ ] タスク1-1: tsup設定作成
- [ ] タスク1-2: package.json更新

## 進行中のタスク
- [ ] タスク2: 依存関係チェック

## ブロッカー・課題
- なし

## 次週の予定
- タスク3: リリースフロー設計開始
```

---

## 🔍 重要な注意事項

### 1. Astroコンポーネントはビルド不要

**@docs/ui**パッケージはAstroコンポーネント（.astro）を含むため、ビルド成果物は不要です。

**理由**:
- Astroコンポーネントはビルド時にAstroコンパイラで処理される
- .astroファイルをそのまま配布するのが標準
- 型定義のみ生成すれば十分

### 2. CSS配布方法

**@docs/theme**のCSSファイルは以下の方法で配布：

```json
"exports": {
  "./css/variables.css": "./src/css/variables.css",
  "./css/base.css": "./src/css/base.css"
}
```

**使用側**:

```astro
---
import '@docs/theme/css/variables.css';
import '@docs/theme/css/base.css';
---
```

### 3. モノレポ内での開発継続

Phase 2-5では**npm公開は必須ではありません**。

**推奨アプローチ**:
1. モノレポ内で開発継続（pnpm workspace）
2. ビルド設定・型定義のみ整備
3. npm公開は後続フェーズで検討

---

## 🎁 Phase 2-4からの引き継ぎ資産

### 利用可能な成果物

1. **高パフォーマンスなビルドシステム**
   - Lighthouse Performance 100/100
   - ビルド時間: 約4秒
   - ビルドサイズ: 5.6MB

2. **完全なアクセシビリティ対応**
   - Lighthouse Accessibility 91/100
   - WCAG 2.1準拠

3. **高機能検索システム**
   - ファセット検索
   - ページネーション
   - ハイライト

4. **最適化された設定ファイル**
   - [astro.config.mjs](../../packages/runtime/astro.config.mjs)
     - 画像最適化設定
     - コード分割戦略
     - CSS最小化設定

5. **自動テストスクリプト**
   - [test-lighthouse.js](../../packages/runtime/test-lighthouse.js)

これらの資産を**壊さないよう**に、共有パッケージのビルド設定を整備してください。

---

**作成者**: Claude
**作成日**: 2025-10-19
**対象フェーズ**: Phase 2-5
**前提フェーズ**: Phase 2-4（完了）

---

🎯 **次のアクション**: Phase 2-5計画書（`phase-2-5-shared-packages.md`）を確認し、タスク1（ビルド設定・型定義整備）を開始してください。
