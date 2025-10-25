# 旧ドキュメントサイトジェネレーター削除計画

**作成日**: 2025-10-26
**対象**: Phase 2完了後の旧システム削除
**ステータス**: 計画承認済み

---

## 🎯 目的

新ドキュメントサイトジェネレーター（Phase 2完了）への完全移行に伴い、旧ドキュメントサイトジェネレーター関連のファイル・ディレクトリ・設定を安全に削除する。

---

## 📋 調査結果サマリー

### 新システム（保持対象）

- **アプリ**: `demo-docs` - 新ジェネレーター実証プロジェクト
- **パッケージ**: `@docs/generator`, `@docs/runtime`, `@docs/cli`, `@docs/validator`
- **レジストリ**: `registry/docs.json`, `registry/demo-docs.json`
- **計画書**: `docs/new-generator-plan/` 配下の全ドキュメント（Phase 0-5完了）

### 旧システム（削除対象）

- **アプリ**: `sample-docs`, `libx-docs`, `project-template`, `test-verification`, `top-page`
- **スクリプト**: 27個中19個（旧ビルド・同期・マイグレーション系）
- **設定ファイル**: `project.config.json`, `projects.config.json`
- **ドキュメント**: `docs/` 直下の旧ガイド9件

---

## 🗂️ 削除対象の詳細リスト

### 1️⃣ アプリケーション（apps/）

#### 削除対象アプリ（5件）

| アプリ名 | サイズ | 理由 | 削除優先度 |
|---------|-------|------|-----------|
| `apps/sample-docs/` | 7.8MB | 旧モノレポ型プロジェクト、demo-docsに移行済み | 🔴 高 |
| `apps/libx-docs/` | 2.9MB | libx-docs同期対象、新システムでは不要 | 🔴 高 |
| `apps/test-verification/` | 2.4MB | 旧検証プロジェクト、新システムで再実装済み | 🟡 中 |
| `apps/project-template/` | 1.7MB | 旧プロジェクトテンプレート、CLIで自動生成に変更 | 🟡 中 |
| `apps/top-page/` | 1.4MB | 旧トップページ、レジストリ駆動に変更 | 🟢 低 |

**合計削除サイズ**: 約16.2MB

---

### 2️⃣ スクリプト（scripts/）

#### 削除対象スクリプト（19件）

**旧ビルド系（5件）**
```
❌ build-integrated.js          # 旧統合ビルド → 新: Astroビルドのみ
❌ build-selective.js           # 旧選択的ビルド → 新: レジストリ駆動
❌ build-sidebar.js             # 旧サイドバー生成 → 新: @docs/generator
❌ build-sidebar-selective.js   # 旧選択的サイドバー生成
❌ copy-to-docs.js              # 旧デプロイコピー → 新: dist/直接デプロイ
```

**旧同期・検証系（4件）**
```
❌ sync-content.js              # libx-docs同期 → 新: レジストリで管理
❌ sync-utils.js                # 同期ユーティリティ
❌ validate-content.js          # 旧コンテンツ検証 → 新: @docs/validator
❌ copy-to-libx-core.js         # libx-core同期（廃止予定）
❌ sync-to-libx-core.js         # libx-core同期（廃止予定）
```

**旧プロジェクト管理系（5件）**
```
❌ create-document.js           # 旧ドキュメント作成 → 新: docs-cli create doc
❌ create-project.js            # 旧プロジェクト作成 → 新: docs-cli create project
❌ create-version.js            # 旧バージョン作成 → 新: docs-cli create version
❌ add-language.js              # 旧言語追加 → 新: docs-cli add language
❌ document-utils.js            # 旧ドキュメントユーティリティ
```

**旧マイグレーション系（2件）**
```
❌ migrate-to-registry.js       # 旧→新変換ツール（移行完了後不要）
❌ validate-schema.js           # 旧スキーマ検証 → 新: @docs/validator
```

**その他（3件）**
```
❌ utils.js                     # 旧共通ユーティリティ（一部機能は新パッケージへ）
❌ add-demo-to-registry.js      # デモ追加スクリプト（一時的なもの）
❌ fix-demo-docs-schema.js      # デモ修正スクリプト（一時的なもの）
❌ check-demo-docs.cjs          # デモチェック（開発用）
```

#### 保持対象スクリプト（8件）

```
✅ validate-registry.js         # レジストリ検証（新システムでも使用）
✅ capture-screenshots.js       # スクリーンショット取得（Phase 2-6成果物）
✅ plugins/                     # remarkプラグイン（新システムでも使用）
✅ schemas/                     # JSON Schema（新システムでも使用）
✅ compat/                      # 互換レイヤー（Phase 3で使用）
✅ dev/                         # 開発ユーティリティ
```

---

### 3️⃣ 設定ファイル

#### 削除対象設定ファイル（4件 + アプリ内設定）

```
❌ apps/sample-docs/src/config/project.config.json
❌ apps/libx-docs/src/config/project.config.json
❌ apps/test-verification/src/config/project.config.json
❌ apps/project-template/src/config/project.config.json
❌ apps/top-page/src/config/projects.config.json
```

**理由**: 新システムでは `registry/docs.json` に統合済み

---

### 4️⃣ ドキュメント（docs/）

#### 削除対象ドキュメント（9件）

```
❌ docs/BUILD_AND_DEPLOYMENT_GUIDE.md        # 旧ビルド・デプロイガイド
❌ docs/DOCUMENT_ADDITION_GUIDE.md           # 旧ドキュメント追加ガイド
❌ docs/LANGUAGE_ADDITION_GUIDE.md           # 旧言語追加ガイド
❌ docs/NEW_PROJECT_CREATION_GUIDE.md        # 旧プロジェクト作成ガイド
❌ docs/VERSION_ADDITION_GUIDE.md            # 旧バージョン追加ガイド
❌ docs/LIBX_DOCS_SYNC.md                    # libx-docs同期ガイド
❌ docs/LICENSE_GUIDELINES.md                # ライセンスガイドライン（重複、新: packages/i18n/README.md）
❌ docs/PROJECT_PRINCIPLES.md                # 旧プロジェクト原則（新: docs/new-generator-plan/PROJECT_PRINCIPLES.md）
❌ docs/NEW_GENERATOR_PLAN.md                # 初期草案（新: docs/new-generator-plan/README.md）
```

#### 保持対象ドキュメント（1件）

```
✅ docs/new-generator-plan/                  # 新ジェネレーター計画全体（Phase 0-5）
```

---

### 5️⃣ レジストリファイル

#### 削除対象レジストリ（4件）

```
❌ registry/docs.json.backup                # 旧バックアップ（移行完了後不要）
❌ registry/docs.json.backup2               # 旧バックアップ2
❌ registry/test-sample-docs.json           # テスト用レジストリ
❌ registry/test-verification.json          # テスト用レジストリ
```

#### 保持対象レジストリ（3件）

```
✅ registry/docs.json                       # 現行レジストリ（新システム）
✅ registry/demo-docs.json                  # デモプロジェクト（Phase 2-6成果物）
✅ registry/schema/                         # JSON Schema定義
```

---

### 6️⃣ package.json スクリプト

#### 削除対象スクリプト（16件）

```json
{
  "scripts": {
    // 旧ビルド系
    "❌ build": "node scripts/build-integrated.js",
    "❌ build:local": "node scripts/build-integrated.js --local",
    "❌ build:separate": "pnpm --filter=./apps/* build",
    "❌ build:selective": "node scripts/build-selective.js",
    "❌ build:selective:local": "node scripts/build-selective.js --local",
    "❌ build:sidebar": "node scripts/build-sidebar.js",
    "❌ build:sidebar-selective": "node scripts/build-sidebar-selective.js",

    // 旧デプロイ系
    "❌ copy:docs": "node scripts/copy-to-docs.js",
    "❌ build:deploy": "node scripts/build-sidebar.js && node scripts/build-integrated.js && node scripts/copy-to-docs.js",
    "❌ build:deploy-selective": "node scripts/build-sidebar-selective.js && node scripts/build-selective.js && node scripts/copy-to-docs.js",

    // 旧プロジェクト管理系
    "❌ create:project": "node scripts/create-project.js",

    // 旧libx-core同期系
    "❌ copy:libx-core": "node scripts/copy-to-libx-core.js",
    "❌ copy:libx-core:dry-run": "node scripts/copy-to-libx-core.js --dry-run",
    "❌ sync:libx-core": "node scripts/sync-to-libx-core.js",
    "❌ sync:libx-core:dry-run": "node scripts/sync-to-libx-core.js --dry-run",
    "❌ sync:libx-core:verbose": "node scripts/sync-to-libx-core.js --verbose"
  }
}
```

#### 保持対象スクリプト（19件）

```json
{
  "scripts": {
    // 新開発コマンド
    "✅ dev": "pnpm --filter=demo-docs dev",
    "✅ preview": "pnpm --filter=demo-docs preview",

    // 新ビルド・デプロイ
    "✅ build": "pnpm --filter=demo-docs build",
    "✅ deploy": "pnpm build && pnpm deploy:pages",
    "✅ deploy:pages": "wrangler pages deploy dist --project-name libx",

    // 新CLI
    "✅ docs-cli": "node packages/cli/bin/docs-cli.js",

    // 品質管理
    "✅ lint": "eslint .",
    "✅ format": "prettier --write .",
    "✅ validate": "node scripts/validate-registry.js",
    "✅ validate:strict": "node scripts/validate-registry.js --strict",
    "✅ validate:full": "node scripts/validate-registry.js --check-content --check-sync-hash",

    // テスト
    "✅ test": "vitest run",
    "✅ test:watch": "vitest watch",
    "✅ test:ui": "vitest --ui",
    "✅ test:coverage": "vitest run --coverage",
    "✅ test:cli": "vitest run --project cli",
    "✅ test:validator": "vitest run --project validator",

    // バージョン管理
    "✅ changeset": "changeset",
    "✅ version-packages": "changeset version",
    "✅ release": "pnpm build && changeset publish"
  }
}
```

---

### 7️⃣ Astro設定ファイル

#### 削除対象（5件）

```
❌ apps/sample-docs/astro.config.mjs
❌ apps/libx-docs/astro.config.mjs
❌ apps/test-verification/astro.config.mjs
❌ apps/project-template/astro.config.mjs
❌ apps/top-page/astro.config.mjs
```

#### 保持対象（1件）

```
✅ apps/demo-docs/astro.config.mjs          # 新システム設定
```

---

### 8️⃣ その他の削除候補

```
❌ .backups/                                # 旧バックアップディレクトリ（移行完了後）
❌ scripts/compat/                          # 互換レイヤー（Phase 3完了後）
```

---

## 🚨 削除リスクと緩和策

### リスク1: 削除ファイルの復元不可能性
**緩和策**: 削除実行前に完全バックアップを作成（別リポジトリまたはアーカイブ）

### リスク2: 新システムへの移行漏れ
**緩和策**: 削除前にチェックリスト検証（後述）

### リスク3: ドキュメントリンク切れ
**緩和策**: `docs/new-generator-plan/` 内のリンクを検証

### リスク4: 誤削除による開発中断
**緩和策**: 段階的削除（フェーズ別）

---

## 📝 削除手順（3フェーズ）

### Phase 1: 準備（削除前の検証）

**1-1. バックアップ作成**
```bash
# 完全バックアップをリポジトリ外に作成
tar -czf ../libx-dev-backup-$(date +%Y%m%d).tar.gz .
```

**1-2. 新システム動作確認**
```bash
# demo-docsビルドテスト
pnpm --filter=demo-docs build

# レジストリ検証
pnpm validate:full

# CLIテスト
pnpm test:cli

# 統合テスト
pnpm test
```

**1-3. 移行完了確認チェックリスト**
- [ ] demo-docsが正常にビルドできる
- [ ] registry/demo-docs.jsonが有効
- [ ] @docs/generatorが動作する
- [ ] docs-cliが正常に動作する
- [ ] Phase 2の全成果物が完成している
- [ ] ドキュメントが整備されている（docs/new-generator-plan/）

---

### Phase 2: 段階的削除

#### **Stage 1: 旧アプリケーション削除（高優先度）**

```bash
# sample-docs削除
rm -rf apps/sample-docs/

# libx-docs削除
rm -rf apps/libx-docs/

# test-verification削除
rm -rf apps/test-verification/
```

**削除後確認**:
```bash
# ビルドテスト
pnpm build

# リンク切れチェック
grep -r "sample-docs\|libx-docs\|test-verification" docs/
```

---

#### **Stage 2: 旧スクリプト削除**

```bash
# 旧ビルド系削除
rm scripts/build-integrated.js
rm scripts/build-selective.js
rm scripts/build-sidebar.js
rm scripts/build-sidebar-selective.js
rm scripts/copy-to-docs.js

# 旧同期・検証系削除
rm scripts/sync-content.js
rm scripts/sync-utils.js
rm scripts/validate-content.js
rm scripts/copy-to-libx-core.js
rm scripts/sync-to-libx-core.js

# 旧プロジェクト管理系削除
rm scripts/create-document.js
rm scripts/create-project.js
rm scripts/create-version.js
rm scripts/add-language.js
rm scripts/document-utils.js

# 旧マイグレーション系削除
rm scripts/migrate-to-registry.js
rm scripts/validate-schema.js

# その他削除
rm scripts/utils.js
rm scripts/add-demo-to-registry.js
rm scripts/fix-demo-docs-schema.js
rm scripts/check-demo-docs.cjs
```

---

#### **Stage 3: 旧ドキュメント削除**

```bash
# 旧ガイド削除
rm docs/BUILD_AND_DEPLOYMENT_GUIDE.md
rm docs/DOCUMENT_ADDITION_GUIDE.md
rm docs/LANGUAGE_ADDITION_GUIDE.md
rm docs/NEW_PROJECT_CREATION_GUIDE.md
rm docs/VERSION_ADDITION_GUIDE.md
rm docs/LIBX_DOCS_SYNC.md
rm docs/LICENSE_GUIDELINES.md
rm docs/PROJECT_PRINCIPLES.md
rm docs/NEW_GENERATOR_PLAN.md
```

---

#### **Stage 4: package.json スクリプト削除**

**削除後のpackage.json例**:
```json
{
  "name": "libx",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm --filter=demo-docs dev",
    "build": "pnpm --filter=demo-docs build",
    "preview": "pnpm --filter=demo-docs preview",
    "lint": "eslint .",
    "format": "prettier --write .",
    "validate": "node scripts/validate-registry.js",
    "validate:strict": "node scripts/validate-registry.js --strict",
    "validate:full": "node scripts/validate-registry.js --check-content --check-sync-hash",
    "docs-cli": "node packages/cli/bin/docs-cli.js",
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:cli": "vitest run --project cli",
    "test:validator": "vitest run --project validator",
    "deploy": "pnpm build && pnpm deploy:pages",
    "deploy:pages": "wrangler pages deploy dist --project-name libx",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "pnpm build && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.29.7",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitest/coverage-v8": "^3.2.4",
    "astro-eslint-parser": "^0.16.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-astro": "^0.29.0",
    "glob": "^11.0.2",
    "gray-matter": "^4.0.3",
    "prettier": "^3.0.0",
    "tsup": "^8.5.0",
    "typescript": "^5.0.0",
    "vitest": "^3.2.4",
    "wrangler": "^3.0.0"
  },
  "dependencies": {
    "ajv": "^8.17.1",
    "ajv-formats": "^3.0.1",
    "unist-util-visit": "^5.0.0"
  }
}
```

---

#### **Stage 5: 旧レジストリファイル削除**

```bash
# 旧バックアップ削除
rm registry/docs.json.backup
rm registry/docs.json.backup2
rm registry/test-sample-docs.json
rm registry/test-verification.json
```

---

#### **Stage 6: 低優先度アプリ削除**

```bash
# project-template削除
rm -rf apps/project-template/

# top-page削除（トップページ機能を新システムで再実装後）
rm -rf apps/top-page/
```

---

### Phase 3: 検証とクリーンアップ

**3-1. ビルド検証**
```bash
# 依存関係インストール
pnpm install

# ビルドテスト
pnpm build

# テスト実行
pnpm test

# Lint
pnpm lint
```

**3-2. リンク切れチェック**
```bash
# ドキュメント内のリンク切れチェック
grep -r "sample-docs\|libx-docs\|test-verification\|project-template\|top-page" docs/new-generator-plan/
```

**3-3. 不要ファイル削除**
```bash
# node_modules再インストール
rm -rf node_modules
pnpm install

# .backups削除（移行完了後）
rm -rf .backups/

# scripts/compat削除（Phase 3完了後）
rm -rf scripts/compat/
```

**3-4. Git commit**
```bash
git add -A
git commit -m "chore: 旧ドキュメントサイトジェネレーター関連ファイルを削除

- 旧アプリ削除: sample-docs, libx-docs, test-verification, project-template, top-page
- 旧スクリプト削除: 19ファイル（ビルド、同期、プロジェクト管理系）
- 旧ドキュメント削除: 9ファイル（旧ガイド類）
- package.jsonスクリプト整理: 16個削除、新システム用に統一
- 旧レジストリファイル削除: バックアップ・テスト用ファイル

新ドキュメントサイトジェネレーター（Phase 2完了）への完全移行完了
"
```

---

## ✅ 削除完了後の検証チェックリスト

- [ ] `pnpm install` が成功する
- [ ] `pnpm build` が成功する
- [ ] `pnpm test` が全て成功する
- [ ] `pnpm lint` がエラーなし
- [ ] `pnpm docs-cli --help` が正常に動作する
- [ ] `pnpm validate:full` が成功する
- [ ] demo-docsがローカルで正常に動作する（`pnpm dev`）
- [ ] Cloudflare Pagesへのデプロイが成功する
- [ ] docs/new-generator-plan/ 内のリンクが全て有効

---

## 📊 削除効果の見積もり

### ファイル数削減
- **アプリ**: 5個削除（apps/内が6個→1個）
- **スクリプト**: 19個削除（27個→8個）
- **ドキュメント**: 9個削除
- **設定ファイル**: 5個削除

### ディレクトリサイズ削減
- **apps/削除**: 約16.2MB
- **scripts/削除**: 約200KB
- **合計**: 約16.4MB

### package.jsonスクリプト削減
- **削除**: 16個
- **保持**: 19個（新システム用）

---

## 🔄 ロールバック手順（緊急時）

削除後に問題が発生した場合：

```bash
# バックアップから復元
cd ..
tar -xzf libx-dev-backup-YYYYMMDD.tar.gz -C libx-dev-rollback/
cd libx-dev-rollback/

# または、Gitから復元（削除前のコミットに戻る）
git log --oneline  # 削除前のコミットハッシュを確認
git checkout <commit-hash>
```

---

## 📅 実行スケジュール案

| フェーズ | 期間 | 作業内容 |
|---------|------|---------|
| **Phase 1: 準備** | 1日 | バックアップ作成、新システム動作確認、チェックリスト検証 |
| **Phase 2-1: 高優先度削除** | 1日 | 旧アプリ3個削除（sample-docs, libx-docs, test-verification） |
| **Phase 2-2: スクリプト削除** | 半日 | 旧スクリプト19個削除 |
| **Phase 2-3: ドキュメント削除** | 半日 | 旧ドキュメント9個削除 |
| **Phase 2-4: 設定整理** | 半日 | package.json整理、レジストリファイル削除 |
| **Phase 2-5: 低優先度削除** | 半日 | project-template, top-page削除 |
| **Phase 3: 検証** | 1日 | ビルド検証、テスト、リンクチェック、Git commit |

**合計期間**: 約4-5日

---

## 🎯 成功基準

1. ✅ 新システム（demo-docs）が完全に動作する
2. ✅ 全テストがパスする
3. ✅ ビルド・デプロイが成功する
4. ✅ ドキュメントのリンク切れがない
5. ✅ リポジトリサイズが約16MB削減される
6. ✅ package.jsonスクリプトが整理される
7. ✅ 新システムへの完全移行が完了する

---

## 📚 参考資料

- [Phase 2最終確認レポート](status/phase-2-final-check.md)
- [アーキテクチャ図](architecture.md)
- [資産棚卸しレポート](phase-0/asset-inventory.md)
- [データ移行ガイド](guides/migration-data.md)

---

**作成者**: Claude
**作成日**: 2025-10-26
**承認者**: （記入してください）
**実行予定日**: （記入してください）
