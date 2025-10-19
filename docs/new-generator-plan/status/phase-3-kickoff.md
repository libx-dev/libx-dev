# Phase 3 キックオフガイド

**作成日**: 2025-10-19
**対象**: Phase 3（既存資産移行とCI整備）担当者
**前提**: Phase 2完了（AstroビルドとUI統合完了）

---

## 📋 Phase 2完了状況サマリー

### ✅ Phase 2で達成したこと

#### Phase 2-1: ランタイム/ジェネレーター基盤
- ✅ レジストリ駆動のルーティング生成
- ✅ サイドバー自動生成
- ✅ サイトマップ・メタデータ生成
- ✅ OpenGraphメタデータ生成

#### Phase 2-2: UI/テーマ統合
- ✅ Astroページテンプレート実装
- ✅ BaseLayout・DocLayout実装
- ✅ Sidebar・Header・Footerコンポーネント実装

#### Phase 2-3: MDXコンテンツ統合・検索機能
- ✅ MDXファイルの動的読み込み（64ファイル）
- ✅ Vite Aliasでモノレポ対応
- ✅ Pagefind検索統合（4,635語インデックス化）
- ✅ RelatedDocs・VersionSelectorコンポーネント実装

#### Phase 2-4: パフォーマンス・アクセシビリティ
- ✅ **Lighthouse Performance 100/100**
- ✅ **Lighthouse Accessibility 91/100**
- ✅ **Lighthouse Best Practices 96/100**
- ✅ **Lighthouse SEO 100/100**
- ✅ ファセット検索・ページネーション・ハイライト実装

### 📊 現在のシステム状態

| 項目 | 状態 |
|------|------|
| ビルドシステム | ✅ 完全動作（62ページ生成） |
| MDXコンテンツ読み込み | ✅ 64ファイル対応 |
| 検索機能 | ✅ Pagefind統合完了 |
| パフォーマンス | ✅ Lighthouse 100/100 |
| アクセシビリティ | ✅ Lighthouse 91/100 (WCAG 2.1準拠) |
| 対応言語 | ✅ 3言語（ja, ko, en） |
| ビルドサイズ | 5.6MB |
| ビルド時間 | 約4秒 |

---

## 🎯 Phase 3の目的と目標

### Phase 3の主要目標

**Phase 3**: 既存資産移行とCI整備（想定期間: 2-3週間）

1. **既存コンテンツのレジストリ化・移行**
   - libx-dev既存プロジェクトの棚卸し
   - レジストリへの移行（docs.json生成）
   - MDXファイルの整理・移行

2. **CI/CDパイプライン整備**
   - GitHub Actions設定
   - 自動ビルド・テスト・デプロイ
   - Lighthouseスコア監視

3. **品質保証の自動化**
   - ビルドバリデーション
   - リンクチェック
   - アクセシビリティテスト自動化

4. **ドキュメント整備**
   - 開発者ガイド
   - コントリビューションガイド
   - トラブルシューティングガイド

---

## 📂 Phase 2成果物の場所

### 主要パッケージ

```
packages/
├── runtime/              # Astroランタイムパッケージ（Phase 2の主成果物）
│   ├── src/
│   │   ├── pages/        # 動的ルーティングページ
│   │   ├── layouts/      # レイアウトコンポーネント
│   │   └── components/   # UIコンポーネント
│   ├── astro.config.mjs  # Astro設定（画像最適化・コード分割）
│   ├── test-lighthouse.js # Lighthouseテストスクリプト
│   └── dist/             # ビルド成果物（62ページ）
│
├── generator/            # レジストリ駆動ジェネレーター（Phase 2-1）
│   └── src/
│       ├── core/         # コア機能
│       ├── generators/   # 生成ロジック
│       └── validators/   # バリデーション
│
├── ui/                   # 共有UIコンポーネント
├── theme/                # テーマシステム
├── i18n/                 # 国際化
└── versioning/           # バージョン管理
```

### レジストリファイル

```
registry/
└── docs.json             # 統合レジストリ（3プロジェクト、62ドキュメント）
```

### ドキュメント

```
docs/new-generator-plan/
├── status/
│   ├── phase-2-1-completion-report.md
│   ├── phase-2-2-completion-report.md
│   ├── phase-2-3-completion-report.md
│   ├── phase-2-4-completion-report.md  # 最新
│   └── phase-3-kickoff.md              # 本ドキュメント
├── phase-2-1-runtime-generator.md
├── phase-2-2-ui-theme.md
├── phase-2-3-search.md
├── phase-2-4-build-pipeline.md
└── phase-3-0-migration.md              # Phase 3計画書
```

---

## 🔧 Phase 3で使用する技術スタック

### 既に利用可能な技術

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| フレームワーク | Astro | 5.7.12 | 静的サイト生成 |
| コンテンツ | MDX | 4.3.7 | ドキュメント記述 |
| 検索 | Pagefind | 1.4.0 | 全文検索 |
| 画像最適化 | Sharp | 0.34.4 | 画像処理 |
| ビルドツール | Vite | 6.3.5 | バンドリング |
| テスト | Lighthouse | 13.0.0 | パフォーマンス測定 |
| モノレポ | pnpm workspaces | 10.10.0 | パッケージ管理 |

### Phase 3で追加する技術（推奨）

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| CI/CD | GitHub Actions | 自動ビルド・デプロイ |
| リンクチェック | markdown-link-check | リンク検証 |
| スキーマバリデーション | ajv | JSONスキーマ検証 |
| E2Eテスト | Playwright（オプション） | ブラウザテスト |
| デプロイ | Cloudflare Pages | ホスティング |

---

## 📝 Phase 3タスク詳細

### タスク1: 既存プロジェクトの棚卸し（1-2日）

#### 目的
libx-dev内の既存プロジェクトを調査し、レジストリ化の対象を決定する。

#### 作業内容

1. **既存プロジェクトのリスト作成**
   ```bash
   # 既存のドキュメントプロジェクトを確認
   ls apps/
   # sample-docs, top-page, project-template, test-verification, libx-docs
   ```

2. **各プロジェクトの調査**
   - プロジェクト構成の確認
   - バージョン数の確認
   - 言語数の確認
   - ドキュメント数の確認

3. **移行優先度の決定**
   ```
   優先度1（即座に移行）:
   - sample-docs（既にレジストリ化済み）
   - test-verification（既にレジストリ化済み）

   優先度2（Phase 3で移行）:
   - libx-docs（部分的にレジストリ化済み）

   優先度3（Phase 4以降）:
   - top-page（ランディングページ）
   - project-template（テンプレート）
   ```

#### 成果物
- `docs/new-generator-plan/migration/project-inventory.md`
  - プロジェクト一覧
  - 各プロジェクトの詳細情報
  - 移行優先度と理由

---

### タスク2: レジストリスキーマの最終確認（1日）

#### 目的
現在のレジストリスキーマが全ての既存プロジェクトに対応できるか確認する。

#### 作業内容

1. **スキーマ検証**
   ```bash
   # 現在のレジストリを読み込んでバリデーション
   node -e "const registry = require('./registry/docs.json'); console.log('Projects:', Object.keys(registry.projects).length);"
   ```

2. **不足フィールドの特定**
   - 既存プロジェクトの特殊なメタデータ
   - 追加が必要なフィールド
   - 廃止予定のフィールド

3. **スキーマ拡張（必要に応じて）**
   ```typescript
   // packages/generator/src/schemas/registry.schema.ts
   // 必要に応じてスキーマを拡張
   ```

#### 成果物
- 更新されたレジストリスキーマ
- スキーマドキュメント（`docs/new-generator-plan/guides/registry-schema.md`）

---

### タスク3: 既存コンテンツの移行（3-5日）

#### 目的
既存のMDXファイルとメタデータを新しいレジストリ構造に移行する。

#### 作業手順

##### 3-1. 自動移行スクリプトの作成

**scripts/migrate-project.js**:

```javascript
/**
 * 既存プロジェクトをレジストリ構造に移行
 */
import fs from 'fs';
import path from 'path';

async function migrateProject(projectName) {
  console.log(`Migrating project: ${projectName}`);

  // 1. 既存のproject.config.jsonを読み込み
  const configPath = `apps/${projectName}/src/config/project.config.json`;
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  // 2. レジストリ形式に変換
  const registryEntry = {
    metadata: {
      name: {
        en: config.metadata.name.en,
        ja: config.metadata.name.ja
      },
      description: {
        en: config.metadata.description.en,
        ja: config.metadata.description.ja
      },
      // ... その他のフィールド
    },
    versions: {},
    documents: {}
  };

  // 3. バージョン情報を追加
  for (const [versionId, versionData] of Object.entries(config.versions)) {
    registryEntry.versions[versionId] = {
      version: versionData.version,
      releaseDate: versionData.releaseDate,
      // ...
    };
  }

  // 4. ドキュメント情報を収集
  const docsDir = `apps/${projectName}/src/content/docs`;
  // ... MDXファイルをスキャンしてドキュメント情報を収集

  // 5. レジストリに追加
  const registry = JSON.parse(fs.readFileSync('registry/docs.json', 'utf-8'));
  registry.projects[projectName] = registryEntry;
  fs.writeFileSync('registry/docs.json', JSON.stringify(registry, null, 2));

  console.log(`✅ ${projectName} migrated successfully`);
}

// 実行
const projectName = process.argv[2];
if (!projectName) {
  console.error('Usage: node scripts/migrate-project.js <project-name>');
  process.exit(1);
}

migrateProject(projectName);
```

##### 3-2. MDXファイルの整理

```bash
# 各プロジェクトのMDXファイルを確認
find apps/libx-docs/src/content/docs -name "*.mdx" -type f

# 番号接頭辞の統一性を確認
# 01-guide/01-getting-started.mdx のような形式になっているか
```

##### 3-3. フロントマター検証

**各MDXファイルのフロントマターをチェック**:

```mdx
---
title: "ドキュメントタイトル"
description: "説明文"
keywords: ["keyword1", "keyword2"]
tags: ["tag1", "tag2"]
related: ["doc-id-1", "doc-id-2"]
---
```

##### 3-4. 移行実行

```bash
# 優先度1のプロジェクトから移行
node scripts/migrate-project.js libx-docs

# レジストリバリデーション
pnpm --filter=@docs/generator test

# ビルドテスト
pnpm build
```

#### 成果物
- 更新された`registry/docs.json`
- 移行済みプロジェクトのリスト
- 移行エラーレポート（`docs/new-generator-plan/migration/migration-errors.md`）

---

### タスク4: CI/CDパイプライン構築（2-3日）

#### 目的
GitHub Actionsで自動ビルド・テスト・デプロイを実現する。

#### ワークフロー設計

##### 4-1. ビルド&テストワークフロー

**.github/workflows/build-test.yml**:

```yaml
name: Build and Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
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
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Build
        run: pnpm build

      - name: Test
        run: pnpm test

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: packages/runtime/dist/
          retention-days: 7

  lighthouse:
    needs: build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: packages/runtime/dist/

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Lighthouse
        run: npm install -g @lhci/cli

      - name: Run Lighthouse CI
        run: |
          cd packages/runtime
          pnpm preview &
          sleep 5
          lhci autorun --config=.lighthouserc.js

      - name: Upload Lighthouse results
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-results
          path: .lighthouseci/
```

##### 4-2. デプロイワークフロー（Cloudflare Pages）

**.github/workflows/deploy.yml**:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      deployments: write

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
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: libx-docs
          directory: packages/runtime/dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

##### 4-3. Lighthouse CI設定

**packages/runtime/.lighthouserc.js**:

```javascript
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4321/sample-docs/v2/ja/guide/getting-started',
        'http://localhost:4321/test-verification/v2/en/guide/getting-started',
        'http://localhost:4321/libx-docs/v1/ja/guide/getting-started'
      ],
      numberOfRuns: 3
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

#### 成果物
- `.github/workflows/build-test.yml`
- `.github/workflows/deploy.yml`
- `packages/runtime/.lighthouserc.js`
- CI/CDドキュメント（`docs/new-generator-plan/guides/ci-cd.md`）

---

### タスク5: 品質保証の自動化（2日）

#### 目的
ビルドバリデーション、リンクチェック、アクセシビリティテストを自動化する。

#### 実装内容

##### 5-1. レジストリバリデーション

**scripts/validate-registry.js**:

```javascript
import Ajv from 'ajv';
import fs from 'fs';
import registrySchema from '../packages/generator/src/schemas/registry.schema.js';

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(registrySchema);

const registry = JSON.parse(fs.readFileSync('registry/docs.json', 'utf-8'));

if (!validate(registry)) {
  console.error('❌ Registry validation failed:');
  console.error(validate.errors);
  process.exit(1);
}

console.log('✅ Registry validation passed');
```

##### 5-2. リンクチェック

**package.json**:

```json
{
  "scripts": {
    "check:links": "markdown-link-check apps/*/src/content/docs/**/*.mdx --config .markdown-link-check.json"
  },
  "devDependencies": {
    "markdown-link-check": "^3.12.0"
  }
}
```

**.markdown-link-check.json**:

```json
{
  "ignorePatterns": [
    { "pattern": "^http://localhost" },
    { "pattern": "^https://example.com" }
  ],
  "timeout": "5s",
  "retryOn429": true,
  "retryCount": 3,
  "fallbackRetryDelay": "30s"
}
```

##### 5-3. アクセシビリティテスト自動化

**test/accessibility.spec.js** (Playwright使用):

```javascript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility tests', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('http://localhost:4321/sample-docs/v2/ja/guide/getting-started');
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    });
  });
});
```

#### 成果物
- `scripts/validate-registry.js`
- `.markdown-link-check.json`
- `test/accessibility.spec.js`（オプション）

---

### タスク6: ドキュメント整備（2-3日）

#### 目的
開発者・コントリビューター向けの包括的なドキュメントを作成する。

#### ドキュメント一覧

##### 6-1. 開発者ガイド

**docs/new-generator-plan/guides/developer-guide.md**:

- 開発環境のセットアップ
- ディレクトリ構造の説明
- レジストリの仕組み
- ビルドプロセスの詳細
- デバッグ方法

##### 6-2. コントリビューションガイド

**CONTRIBUTING.md**:

- プルリクエストの作成方法
- コーディング規約
- コミットメッセージの規約
- レビュープロセス

##### 6-3. レジストリガイド

**docs/new-generator-plan/guides/registry-guide.md**:

- レジストリの構造
- プロジェクトの追加方法
- ドキュメントの追加方法
- バージョン管理

##### 6-4. トラブルシューティングガイド

**docs/new-generator-plan/guides/troubleshooting.md**:

- よくある問題と解決策
- ビルドエラーの対処法
- パフォーマンス問題の診断
- CI/CDのデバッグ

#### 成果物
- `docs/new-generator-plan/guides/developer-guide.md`
- `CONTRIBUTING.md`
- `docs/new-generator-plan/guides/registry-guide.md`
- `docs/new-generator-plan/guides/troubleshooting.md`

---

## 📋 Phase 3チェックリスト

### タスク1: 既存プロジェクトの棚卸し
- [ ] 既存プロジェクト一覧作成
- [ ] 各プロジェクトの詳細調査
- [ ] 移行優先度の決定
- [ ] 棚卸しドキュメント作成

### タスク2: レジストリスキーマの最終確認
- [ ] 現在のスキーマ検証
- [ ] 不足フィールドの特定
- [ ] スキーマ拡張（必要に応じて）
- [ ] スキーマドキュメント更新

### タスク3: 既存コンテンツの移行
- [ ] 自動移行スクリプト作成
- [ ] MDXファイルの整理
- [ ] フロントマター検証
- [ ] libx-docs移行実行
- [ ] レジストリバリデーション
- [ ] ビルドテスト

### タスク4: CI/CDパイプライン構築
- [ ] GitHub Actions設定
- [ ] ビルド&テストワークフロー作成
- [ ] Lighthouseワークフロー作成
- [ ] デプロイワークフロー作成
- [ ] CI/CDドキュメント作成

### タスク5: 品質保証の自動化
- [ ] レジストリバリデーション自動化
- [ ] リンクチェック自動化
- [ ] アクセシビリティテスト自動化（オプション）

### タスク6: ドキュメント整備
- [ ] 開発者ガイド作成
- [ ] コントリビューションガイド作成
- [ ] レジストリガイド作成
- [ ] トラブルシューティングガイド作成

---

## 🎯 Phase 3成功基準

### 必須項目

1. **既存コンテンツ移行完了**
   - libx-docsプロジェクトがレジストリ化されている
   - 全ドキュメントが正しくビルドされる
   - リンク切れがない

2. **CI/CD稼働**
   - GitHub Actionsが正常に動作している
   - プルリクエストで自動ビルド・テストが実行される
   - mainブランチへのマージで自動デプロイが実行される

3. **品質保証**
   - Lighthouseスコアが目標を維持している（Performance ≥80, Accessibility ≥90）
   - レジストリバリデーションが自動実行される
   - リンクチェックが自動実行される

4. **ドキュメント完備**
   - 開発者ガイドが整備されている
   - コントリビューションガイドが整備されている
   - トラブルシューティングガイドが整備されている

### 推奨項目

1. **E2Eテスト**（オプション）
   - Playwrightでのブラウザテスト
   - アクセシビリティ自動テスト

2. **パフォーマンス監視**
   - Lighthouse CI継続監視
   - スコア低下時のアラート

3. **セキュリティ**
   - 依存関係の脆弱性スキャン
   - Secretsの適切な管理

---

## 🚀 Phase 3開始手順

### ステップ1: Phase 2成果物の確認（30分）

```bash
# 現在のビルド状態を確認
cd packages/runtime
pnpm build

# ビルド成果物を確認
find dist -name "*.html" | wc -l  # 62-63ページあるはず

# Lighthouseテスト実行
pnpm preview &
sleep 5
node test-lighthouse.js
```

### ステップ2: 開発環境のセットアップ（30分）

```bash
# 最新のコードを取得
git pull origin main

# 依存関係を更新
pnpm install

# 全パッケージのビルド
pnpm build

# テスト実行
pnpm test
```

### ステップ3: Phase 3計画書の確認（1時間）

1. `docs/new-generator-plan/phase-3-0-migration.md`を読む
2. 本ドキュメント（phase-3-kickoff.md）を読む
3. タスク一覧を確認
4. 不明点があればチームで議論

### ステップ4: タスク1開始（即座）

```bash
# 既存プロジェクトの調査開始
ls -la apps/

# 各プロジェクトのドキュメント数確認
find apps/sample-docs/src/content/docs -name "*.mdx" | wc -l
find apps/libx-docs/src/content/docs -name "*.mdx" | wc -l
find apps/test-verification/src/content/docs -name "*.mdx" | wc -l

# 棚卸しドキュメント作成開始
mkdir -p docs/new-generator-plan/migration
touch docs/new-generator-plan/migration/project-inventory.md
```

---

## 📞 サポート・質問

Phase 3実装中に不明点があれば、以下のリソースを参照してください：

### Phase 2関連ドキュメント
- [Phase 2-4完了報告書](./phase-2-4-completion-report.md)
- [Phase 2-3完了報告書](./phase-2-3-completion-report.md)
- [packages/runtime/README.md](../../packages/runtime/README.md)
- [packages/generator/README.md](../../packages/generator/README.md)

### 外部ドキュメント
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)

---

## 📝 Phase 3進捗報告

週次で進捗を記録してください：

**テンプレート**: `docs/new-generator-plan/status/weekly/2025-W43.md`

```markdown
# Week 43 進捗報告（2025-10-21〜2025-10-27）

## 完了したタスク
- [ ] タスク1-1: 既存プロジェクト一覧作成
- [ ] タスク1-2: プロジェクト詳細調査

## 進行中のタスク
- [ ] タスク2-1: レジストリスキーマ検証

## ブロッカー・課題
- なし

## 次週の予定
- タスク2完了
- タスク3開始
```

---

**作成者**: Claude
**作成日**: 2025-10-19
**対象フェーズ**: Phase 3
**前提フェーズ**: Phase 2（完了）

---

🎯 **次のアクション**: Phase 3計画書（`phase-3-0-migration.md`）を確認し、タスク1（既存プロジェクトの棚卸し）を開始してください。
