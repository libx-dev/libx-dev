# Phase 2キックオフメモ

**作成日**: 2025年10月18日
**対象フェーズ**: Phase 2（ビルド実装）
**期間目安**: 4週間
**ステータス**: 🚀 **開始準備完了**

---

## エグゼクティブサマリー

Phase 1の全5フェーズが完了し、**Phase 2（ビルド実装）への移行準備が整いました**。技術調査の結果、Astro 5.7.12 + レジストリ駆動の実装方針で進めることを推奨します。

### Phase 2の目標

1. ✅ Astroランタイムにレジストリデータを取り込み、ルーティング・ナビゲーション・レイアウトを自動生成
2. ✅ 既存のUI/テーマパッケージを再利用し、新ジェネレーターでも統一した体験を提供
3. ✅ Cloudflare Pages を想定したビルド出力とアセット配置を確立
4. ✅ Pagefind ベースの静的検索、`related` メタによるレコメンド、`glossary` 表示などレジストリ項目をUIに反映
5. ✅ npm公開を想定した共有パッケージ導入方法を検証し、最終方針を決定

---

## Phase 1からの引き継ぎ事項

### 完了した成果物

#### 1. レジストリシステム（Phase 1-1）

**バージョン**: v1.0.0
**ファイル**: `registry/docs.json`

**統計**:
- プロジェクト数: 3件
- ドキュメント数: 36件
- スキーマファイル: 12ファイル（ルート + 11モジュール）

**Phase 2での利用**:
- ✅ `packages/generator/src/routing.ts`でレジストリを読み込み
- ✅ `documents`, `categories`, `languages`, `versions`を利用してサイト生成

---

#### 2. Validatorパッケージ（Phase 1-2）

**パッケージ**: `packages/validator/`

**主要機能**:
- ✅ スキーマバリデーション（Ajv 8.17.1）
- ✅ 参照整合性チェック
- ✅ コンテンツファイルチェック

**Phase 2での利用**:
- ✅ ビルド前バリデーション（`prebuild`スクリプト）
- ✅ CI統合（プルリクエスト時の自動検証）

---

#### 3. CLIパッケージ（Phase 1-3, 1-4）

**パッケージ**: `packages/cli/`
**バージョン**: 1.0.0

**実装済みコマンド**:
- ✅ init, add, update, remove, list, validate, search, export（全機能実装済み）

**Phase 2での利用**:
- ✅ コンテンツ追加・更新時のCLI利用
- ✅ ビルド前のバリデーション実行

---

#### 4. ドキュメント体系（Phase 1-5）

**ガイドドキュメント**（約2,500行）:
- ✅ レジストリガイド
- ✅ CLIユーザーガイド
- ✅ CI/CD運用ガイド
- ✅ テストポリシーガイド

**テンプレート**（4ファイル）:
- ✅ CLI設定、MDX、用語集、バックアップREADME

**Phase 2での利用**:
- 🔄 Astro統合ガイド、UI/テーマカスタマイズガイド、デプロイガイドを追加

---

### 技術調査結果

#### 1. Astro統合技術調査

**調査ドキュメント**: `docs/new-generator-plan/research/astro-integration.md`

**主要な知見**:
- ✅ Astro 5.7.12は安定版、Content Collectionsが標準機能
- ✅ 動的ルーティング `[project]/[version]/[lang]/[...slug].astro` のパターンが実証済み
- ✅ 既存パターンを踏襲し、レジストリ駆動に変更可能

**推奨実装方針**:
```typescript
// getStaticPaths() の実装例
export async function getStaticPaths() {
  const registry = await loadRegistry();
  return generateRoutes(registry); // レジストリ駆動でルート生成
}
```

---

#### 2. UI/テーマパッケージ評価

**評価ドキュメント**: `docs/new-generator-plan/research/ui-theme-readiness.md`

**評価結果**:
- ✅ UIパッケージ: 27コンポーネント実装済み
- ✅ テーマパッケージ: CSS変数システム完備
- ⚠️ Astroバージョン不一致（パッケージ: 3.x、既存アプリ: 5.7.12）要対応

**必要な作業**:
1. Astroバージョンを5.7.12に統一（1日）
2. 新規コンポーネント追加（Glossary, RelatedDocs, LanguageSelector, VersionSelector）（5日）
3. 既存コンポーネント調整（Sidebar, LicenseAttribution, Pagination）（3日）

---

## Phase 2の詳細計画

### Phase 2の6つのサブフェーズ

| サブフェーズ | 説明 | 期間目安 | 優先度 |
|------------|------|---------|--------|
| Phase 2-1 | ランタイム／ジェネレーター実装 | 1週間 | 🔴 最高 |
| Phase 2-2 | UI／テーマ統合 | 1週間 | 🔴 最高 |
| Phase 2-3 | 検索機能実装（Pagefind） | 3日 | 🟡 高 |
| Phase 2-4 | ビルドパイプライン構築 | 3日 | 🟡 高 |
| Phase 2-5 | 共有パッケージ検証 | 3日 | 🟢 中 |
| Phase 2-6 | ドキュメント・デモ作成 | 2日 | 🟢 中 |

**合計期間**: 約4週間

---

### Phase 2-1: ランタイム／ジェネレーター実装（1週間）

**目的**: レジストリからルーティング・サイドバー・レイアウトを自動生成

**主要タスク**:
1. `packages/generator/` パッケージ作成
2. レジストリロード機能実装
3. ルーティング生成実装
4. サイドバー生成実装
5. サイトマップ・メタデータ生成
6. Visibility制御実装

**成果物**:
- `packages/generator/src/routing.ts`
- `packages/generator/src/sidebar.ts`
- `packages/generator/src/sitemap.ts`
- `packages/generator/src/metadata.ts`

**技術スタック**:
- TypeScript 5.x
- Astro 5.7.12（Content Collections、動的ルーティング）

---

### Phase 2-2: UI／テーマ統合（1週間）

**目的**: 既存パッケージを再利用し、新機能用コンポーネントを追加

**主要タスク**:
1. Astroバージョン統一（`packages/ui/` を5.7.12に更新）
2. 新規コンポーネント実装（Glossary, RelatedDocs, LanguageSelector, VersionSelector）
3. 既存コンポーネント調整（Sidebar, LicenseAttribution, Pagination）
4. テーマスタイル追加（Glossary、RelatedDocs用）
5. 統合テスト

**成果物**:
- `packages/ui/src/components/Glossary.astro`
- `packages/ui/src/components/RelatedDocs.astro`
- `packages/ui/src/components/LanguageSelector.astro`（sample-docsから移動）
- `packages/ui/src/components/VersionSelector.astro`

**技術スタック**:
- Astro 5.7.12
- 既存の`@docs/ui`, `@docs/theme`パッケージ

---

### Phase 2-3: 検索機能実装（3日）

**目的**: Pagefind静的検索インデックスの生成と検索UI実装

**主要タスク**:
1. Pagefindインストールと設定
2. 検索インデックス生成スクリプト作成
3. 検索UI実装（SearchBox, SearchResults）
4. `keywords`, `tags`, `related`メタデータの統合
5. 検索結果のハイライト表示

**成果物**:
- `scripts/generate-search-index.js`
- `packages/ui/src/components/SearchBox.astro`
- `packages/ui/src/components/SearchResults.astro`
- `dist/pagefind/` ディレクトリ（ビルド成果物）

**技術スタック**:
- Pagefind 最新版
- Astro 5.7.12

---

### Phase 2-4: ビルドパイプライン構築（3日）

**目的**: prebuild → build → postbuild の統合パイプライン構築

**主要タスク**:
1. `package.json`スクリプト整備
2. サイドバーJSON事前生成
3. Astroビルド実行
4. Pagefind検索インデックス生成
5. Cloudflare Pages設定（`_redirects`, `_headers`）
6. パフォーマンステスト

**成果物**:
- `package.json`（ビルドスクリプト）
- `scripts/generate-sidebar.js`
- `scripts/generate-search-index.js`
- `.github/workflows/build-and-deploy.yml`

**ビルドフロー**:
```bash
pnpm prebuild   # レジストリバリデーション + サイドバー生成
pnpm build      # Astroビルド
pnpm postbuild  # Pagefind検索インデックス生成
```

---

### Phase 2-5: 共有パッケージ検証（3日）

**目的**: npm公開 or Gitサブモジュールの最終方針決定

**主要タスク**:
1. npm仮発行（`npm pack`）での導入テスト
2. Gitサブモジュールでの導入テスト
3. 利点・欠点の比較
4. 最終方針の決定とDECISIONS.mdへの記録

**成果物**:
- 導入手順ドキュメント
- DECISIONS.mdへの記録
- npm公開手順書（採用した場合）

**判断基準**:
- 導入の容易さ
- バージョン管理
- CI/CD統合
- ローカル開発の効率性

---

### Phase 2-6: ドキュメント・デモ作成（2日）

**目的**: Phase 2成果物のドキュメント化とデモサイト作成

**主要タスク**:
1. Astro統合ガイド作成
2. UI/テーマカスタマイズガイド作成
3. デプロイガイド作成
4. サンプルサイトのスクリーンショット・動画キャプチャ
5. 検索・ナビゲーション利用ガイド

**成果物**:
- `docs/new-generator-plan/guides/astro-integration.md`
- `docs/new-generator-plan/guides/ui-customization.md`
- `docs/new-generator-plan/guides/deployment.md`
- デモサイト（サンプルプロジェクトを用いた実行結果）

---

## Phase 2の前提条件チェック

### ✅ 完了している前提条件

| 前提条件 | ステータス | 備考 |
|---------|----------|------|
| CLI でレジストリ操作が可能 | ✅ 完了 | 全コマンド動作確認済み |
| レジストリデータが準備済み | ✅ 完了 | 3プロジェクト、36ドキュメント |
| Validatorパッケージが動作 | ✅ 完了 | バリデーション成功 |
| テストスイートが整備済み | ✅ 完了 | 111テスト実行可能 |

### ⚠️ Phase 2開始時に確認が必要な項目

| 項目 | ステータス | 対応予定 |
|------|----------|---------|
| UI/テーマ資産の抽出計画が確定 | ⚠️ 要確認 | Phase 2-2開始時に評価完了 |
| Cloudflare Pages 設定整理済み | ⚠️ 要確認 | Phase 2-4で設定確認 |

---

## リスクと緩和策

### Phase 2のリスク管理

| リスク | 影響度 | 対策 | ステータス |
|--------|--------|------|-----------|
| Astro側の制約で動的生成が複雑化 | 🟡 中 | 事前ビルド用の補助スクリプトを追加 | ⏳ 監視中 |
| UI/テーマ資産の互換性問題 | 🟡 中 | Astroバージョン統一とカバレッジテスト | ⏳ Phase 2-2で対応 |
| パフォーマンス劣化 | 🟢 低 | ビルドプロファイル定期計測、キャッシュ戦略検討 | ⏳ Phase 2-4で検証 |
| Pagefindインデックスサイズ肥大化 | 🟢 低 | keywords/tags最適化と除外設定導入 | ⏳ Phase 2-3で対応 |
| 共有パッケージ導入手段の確定遅延 | 🟡 中 | Phase 2-5前半でnpm版PoC実施、問題あればサブモジュール切替 | ⏳ Phase 2-5で判断 |

---

## 成功基準

### Phase 2完了の定義

#### 必須（Must）:
- ✅ CLI で生成したサンプルデータを用いて `pnpm build` が成功し、全ページが想定通り出力される
- ✅ 主要ページのLighthouse スコアが既存libx-devと同等または上回る
- ✅ Cloudflare Pages でのデプロイテストが成功し、ルーティング/アセットが正常動作する
- ✅ Pagefind 検索と関連ドキュメント表示がレジストリのメタデータと一致する
- ✅ Visibility 設定（draft/internal）がビルド結果に反映されている

#### 推奨（Should）:
- ✅ UI コンポーネントの移植完了率が80%以上
- ✅ アクセシビリティチェックをクリアし、主要コンポーネントのテストが整備されている
- ✅ 配布方針（npm or サブモジュール）が承認され、DECISIONS.mdに記録済み

#### オプション（Nice to Have）:
- 🔄 ビルド時間が既存統合ビルドより短縮されている
- 🔄 検索インデックス生成時間が2分以内
- 🔄 デモサイトが公開されている

---

## 開発体制

### 推奨チーム構成

| 役割 | 担当範囲 | 稼働率 |
|------|---------|--------|
| テックリード | 全体設計レビュー、ビルド成果物の品質確認 | 30% |
| フロントエンドエンジニア | Astro実装、UI/テーマ適用 | 100% |
| インフラ担当（兼任可） | Cloudflare Pages設定、CDフロー相談 | 20% |
| QAリード | UI/UX観点での初期レビュー、アクセシビリティ要件策定 | 30% |

---

## 次のステップ（今すぐ実施可能）

### Step 1: Phase 2-1開始準備（今日〜明日）

1. **ディレクトリ作成**
   ```bash
   mkdir -p packages/generator/src
   mkdir -p packages/runtime/src
   ```

2. **package.json作成**
   ```bash
   cd packages/generator
   npm init -y
   npm pkg set name="@docs/generator"
   npm pkg set version="0.1.0"
   npm pkg set type="module"
   npm pkg set exports.="./src/index.ts"
   ```

3. **依存関係インストール**
   ```bash
   pnpm add -D typescript @types/node
   pnpm add ajv ajv-formats
   ```

### Step 2: 技術調査結果の確認（明日）

1. **Astro統合技術調査の再読**
   - `docs/new-generator-plan/research/astro-integration.md`を確認
   - 実装方針の理解

2. **UI/テーマ評価の再読**
   - `docs/new-generator-plan/research/ui-theme-readiness.md`を確認
   - 必要な調整のリストアップ

### Step 3: Phase 2-1キックオフ（明後日以降）

1. **レジストリロード機能実装**
   - `packages/generator/src/registry.ts`作成
   - `loadRegistry()` 関数実装

2. **ルーティング生成実装**
   - `packages/generator/src/routing.ts`作成
   - `generateRoutes()` 関数実装

3. **テスト作成**
   - `packages/generator/tests/routing.test.ts`作成
   - スナップショットテスト整備

---

## 参照ドキュメント

### Phase 1完了報告書
- [Phase 1最終確認レポート](./phase-1-final-check.md)
- [Phase 1-5完了報告書](./phase-1-5-completion-report.md)
- [Phase 1-4完了報告書](./phase-1-4-completion-report.md)
- [Phase 1-3完了報告書](./phase-1-3-completion-report.md)
- [Phase 1-2完了報告書](./phase-1-2-completion-report.md)
- [Phase 1-1完了報告書](./phase-1-1-completion-report.md)

### 技術調査
- [Astro統合技術調査](../research/astro-integration.md)
- [UI/テーマ準備状況評価](../research/ui-theme-readiness.md)

### Phase 2計画
- [Phase 2-0 ビルド実装](../phase-2-0-build.md)
- [Phase 2-1 ランタイム／ジェネレーター](../phase-2-1-runtime-generator.md)
- [Phase 2-2 UI／テーマ統合](../phase-2-2-ui-theme.md)
- [Phase 2-3 検索機能](../phase-2-3-search.md)
- [Phase 2-4 ビルドパイプライン](../phase-2-4-build-pipeline.md)
- [Phase 2-5 共有パッケージ](../phase-2-5-shared-packages.md)
- [Phase 2-6 ドキュメント・デモ](../phase-2-6-documentation-demo.md)

### 設計ドキュメント
- [DECISIONS.md](../DECISIONS.md)
- [PROJECT_PRINCIPLES.md](../PROJECT_PRINCIPLES.md)
- [OVERVIEW.md](../OVERVIEW.md)

---

**作成者**: Claude
**作成日**: 2025年10月18日
**承認者**: 未定（Phase 2-1開始時に確認）
**次回レビュー**: Phase 2-1開始時

---

**Phase 2開始準備**: ✅ **完了**
**推奨開始日**: 2025年10月19日以降
