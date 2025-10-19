# フェーズ2-5：共有パッケージ検証詳細計画

**ステータス**: 🟡 進行中（タスク1完了、タスク2以降進行中）
**開始日**: 2025-10-19
**最終更新**: 2025-10-19

## 目的
- 共有パッケージ（`@docs/ui`, `@docs/theme`, `@docs/versioning`, `@docs/i18n`, `@docs/generator`）の配布形態とバージョニング戦略を決定し、新ジェネレーターおよび将来の外部利用に備える。
- npm 公開と Git サブモジュールの双方で導入した際のメリット／デメリットを比較検証し、最適な運用モデルを確立する。

## スコープ
- パッケージビルド設定、型定義、依存関係の整理。
- リリースプロセス（バージョン管理、CHANGELOG、配布チャネル）の設計。
- セキュリティ・ライセンス・メンテナンス観点の評価。

---

## 📊 進捗状況サマリー

| タスク | ステータス | 完了日 | 備考 |
|-------|-----------|--------|------|
| タスク1: ビルド設定・型定義整備 | ✅ 完了 | 2025-10-19 | Lighthouseスコア維持確認済み |
| タスク2: 依存関係チェック・最適化 | ✅ 完了 | 2025-10-19 | peerDependencies最適化完了 |
| タスク3: リリースフロー設計 | ✅ 完了 | 2025-10-19 | Changesets設定完了、ドキュメント作成済み |
| タスク4: 配布戦略決定 | ⏳ 未着手 | - | npm vs Gitサブモジュール比較 |
| タスク5: 互換性検証 | ⏳ 未着手 | - | テストプロジェクト作成予定 |
| タスク6: ドキュメント・ライセンス整備 | ⏳ 未着手 | - | ガイド作成予定 |

---

## ✅ タスク1完了報告（2025-10-19）

### 実装した内容

#### 1-1. ビルドツール導入
- ✅ tsup@8.5.0をルートパッケージに追加
- ✅ @changesets/cli@2.29.7をルートパッケージに追加

#### 1-2. @docs/generatorパッケージ
- ✅ tsup.config.ts作成（ESM/CJS/型定義生成）
- ✅ package.json更新（main, module, types, exports設定）
- ✅ ビルド成功（dist/に26ファイル生成、約150KB）
- ✅ 4つのエントリーポイント対応（index, routing, registry, types）

#### 1-3. @docs/themeパッケージ
- ✅ tsup.config.ts作成（CSS + TypeScript）
- ✅ tsconfig.build.json作成（DOM型定義追加）
- ✅ package.json更新（CSS配布 + ビルド成果物）
- ✅ ビルド成功（dist/に24ファイル生成、CSSファイル含む）
- ✅ 4つのエントリーポイント対応（index, colors, typography, spacing）

#### 1-4. @docs/i18nパッケージ
- ✅ tsup.config.ts作成
- ✅ package.json更新（astro ^5.0.0にpeerDependencies移動）
- ✅ ビルド成功（dist/に4ファイル生成、約94KB）

#### 1-5. @docs/versioningパッケージ
- ✅ Astroコンポーネント含むためソース配布に変更
- ✅ package.json更新（@docs/uiと同様の設定）
- ✅ tsup.config.ts削除（ビルド不要）

#### 1-6. @docs/uiパッケージ
- ✅ 既存のソース配布設定を確認（変更不要）

### 統合テスト結果

**runtimeパッケージビルド**: ✅ 成功
- 62ページ生成
- Pagefindインデックス: 4,635語、3言語（ja, ko, en）
- ビルド時間: 約4秒（Phase 2-4と同等）

**Lighthouseスコア**: ✅ Phase 2-4と同等維持
- Performance: **100/100** 🟢
- Accessibility: **91/100** 🟢
- Best Practices: **96/100** 🟢
- SEO: **100/100** 🟢

### 成果物サマリー

| パッケージ | 配布形態 | ビルド成果物 | 型定義 | CSS | 備考 |
|-----------|---------|------------|--------|-----|------|
| @docs/generator | dist/ | ✅ ESM/CJS | ✅ .d.ts | ❌ | 4エントリーポイント |
| @docs/theme | dist/ + src/css | ✅ ESM/CJS | ✅ .d.ts | ✅ | CSS配布含む |
| @docs/i18n | dist/ | ✅ ESM/CJS | ✅ .d.ts | ❌ | peerDeps整理済み |
| @docs/versioning | src/ | ❌ ソース配布 | ❌ | ❌ | Astroコンポーネント含む |
| @docs/ui | src/ | ❌ ソース配布 | ❌ | ❌ | Astroコンポーネント集 |

### 技術的な決定事項

1. **tsupをビルドツールとして採用**
   - 理由: TypeScript専用、ESM/CJS両対応、型定義自動生成、高速ビルド
   - 代替案（Rollup）は不採用: 設定が複雑、オーバースペック

2. **Astroコンポーネントはソース配布**
   - @docs/ui、@docs/versioningはビルド不要
   - 理由: Astroコンポーネント（.astro）はビルド時にAstroコンパイラで処理される
   - 型定義も不要（Astro内部で処理）

3. **themeパッケージのDOM型定義追加**
   - tsconfig.build.jsonにDOM libを追加
   - 理由: src/css/index.tsでdocument、window使用のため

4. **i18nパッケージのpeerDependencies整理**
   - astro ^3.0.0 → ^5.0.0に更新
   - dependencies → peerDependenciesに移動

---

## タスク詳細

### タスク1: ビルドおよび型定義整備 ✅ 完了
   - ✅ tsupを用いたビルド設定作成（@docs/generator, @docs/theme, @docs/i18n）
   - ✅ `.d.ts` 出力、ESM/CJS 対応完了
   - ✅ CSS アセットの取り扱い決定（plain CSS、src/css/*.cssをそのまま配布）
   - ✅ Astroコンポーネントパッケージ（@docs/ui, @docs/versioning）はソース配布
   - ✅ runtimeパッケージでの統合ビルドテスト成功
   - ✅ Lighthouseスコア維持確認（Performance 100, Accessibility 91, Best Practices 96, SEO 100）

### タスク2: 依存関係チェック・最適化 ✅ 完了
   - ✅ 各パッケージの peerDependencies / dependencies を見直し、最小限にする
   - ✅ Astro / React / Vue など外部フレームワーク依存がないか確認
   - ✅ バージョン範囲の統一（Astro ^5.0.0等）
   - ✅ 依存関係チェックレポート作成

**実施内容**:
- TypeScript、@types/node、tsupのバージョン統一完了
- @docs/uiのastroをpeerDependenciesに移動（重要な最適化）
- 全パッケージにライセンス・リポジトリ情報追加
- pnpm install成功（2.1秒）

**成果物**:
- 最適化された各パッケージの`package.json`
- `docs/new-generator-plan/status/phase-2-5-dependencies-report.md`（完成）

### タスク3: リリースフロー設計 ✅ 完了
   - ✅ npm 公開手順（`npm publish --access public`）とバージョニングポリシー（SemVer）
   - ✅ Changesets設定（.changeset/config.json）
   - ✅ GitHub Actions での自動リリース設定
   - ✅ リリーススクリプト作成（package.json）

**実施内容**:

1. **Changesets初期化**
   ```bash
   pnpm changeset init
   ```

2. **.changeset/config.json設定**
   - linked設定: `["@docs/ui", "@docs/theme", "@docs/generator", "@docs/i18n", "@docs/versioning"]`
   - ignore設定: `["@docs/runtime", "@docs/cli", "@docs/validator"]`
   - access: `"public"`（将来のnpm公開に備えて）

3. **リリーススクリプト追加（ルートpackage.json）**
   ```json
   "scripts": {
     "changeset": "changeset",
     "version-packages": "changeset version",
     "release": "pnpm build && changeset publish"
   }
   ```

4. **GitHub Actions設定作成（コメントアウト状態）**
   - `.github/workflows/release.yml`作成
   - Phase 2-5では有効化せず、設定のみ保持

5. **リリースフロードキュメント作成**
   - `docs/new-generator-plan/guides/release-flow.md`
   - SemVer戦略、リリースプロセス、使用例を記載

**成果物**:
- ✅ `.changeset/config.json`（完成）
- ✅ `.github/workflows/release.yml`（コメントアウト状態）
- ✅ `docs/new-generator-plan/guides/release-flow.md`（完成）
- ✅ ルートpackage.jsonのリリーススクリプト追加

### タスク4: 配布戦略決定（npm vs Gitサブモジュール） ⏳ 未着手
   - ⏳ npm公開 vs Gitサブモジュール vs モノレポ内配布の比較表作成
   - ⏳ 配布戦略の決定
   - ⏳ DECISIONS.mdへの記録

**比較項目**:
- 配布の容易性
- バージョン管理
- 更新通知
- セキュリティ
- CI/CD統合
- 外部利用可能性
- 開発速度
- 依存関係解決

**推奨アプローチ**:
1. **Phase 2-5（現在）**: モノレポ内配布継続（pnpm workspace）
2. **Phase 3以降**: npm公開準備（スコープ付きパッケージ @docs/*）
3. **Phase 4-5**: 外部利用を想定する場合のみnpm公開

**成果物**:
- npm vs Gitサブモジュール比較表
- 配布戦略決定ドキュメント
- `docs/new-generator-plan/DECISIONS.md`への記録

### タスク5: 互換性検証 ⏳ 未着手
   - ⏳ テストプロジェクト作成（test-projects/npm-usage/）
   - ⏳ ビルド成果物テスト（dist/からの読み込み）
   - ⏳ 型定義テスト（TypeScript型チェック）
   - ⏳ runtimeパッケージ統合テスト
   - ⏳ Breaking Change検出

**実施内容（予定）**:
```bash
# テストプロジェクト作成
mkdir -p test-projects/npm-usage
cd test-projects/npm-usage
npm init -y
npm install ../../packages/generator

# ビルド成果物テスト
node -e "const { loadRegistry } = require('../../packages/generator/dist/index.cjs'); console.log(loadRegistry);"

# 型定義テスト
npx tsc --noEmit test.ts
```

**成功基準**:
- ✅ ビルド成功
- ✅ Lighthouseスコア維持（Performance 100, Accessibility 91以上）
- ✅ 型エラーなし

**成果物**:
- `test-projects/npm-usage/`
- `docs/new-generator-plan/status/phase-2-5-compatibility-report.md`
- Breaking Change一覧

### タスク6: ドキュメント・ライセンス整備 ⏳ 未着手
   - ⏳ `docs/new-generator-plan/guides/shared-packages.md` 作成
   - ⏳ 各パッケージのREADME.md作成
   - ⏳ LICENSEファイル作成
   - ⏳ package.jsonライセンス情報追加

**実施内容（予定）**:

**共有パッケージ利用ガイド** (`docs/new-generator-plan/guides/shared-packages.md`):
- パッケージ一覧
- インストール方法
- 使用例
- リリースフロー
- トラブルシューティング

**各パッケージREADME.md**:
- `packages/generator/README.md`
- `packages/ui/README.md`
- `packages/theme/README.md`
- `packages/i18n/README.md`
- `packages/versioning/README.md`

**ライセンス情報**:
```json
{
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/dolphilia/libx-dev.git",
    "directory": "packages/generator"
  }
}
```

**成果物**:
- `docs/new-generator-plan/guides/shared-packages.md`
- 各パッケージの`README.md`（5ファイル）
- 各パッケージの`LICENSE`（5ファイル）
- package.jsonライセンス情報更新

---

## 🎯 次のステップ（優先順位順）

### 1. タスク2: 依存関係チェック・最適化（所要時間: 1-2時間）
**即座に開始可能**

```bash
# 1. 各パッケージの依存関係確認
pnpm list --depth=0 --filter=@docs/*

# 2. peerDependencies vs dependencies整理
# - @docs/ui: astro を peerDependencies へ移動（既に完了）
# - @docs/versioning: astro, @docs/ui を peerDependencies へ移動（既に完了）

# 3. バージョン範囲統一確認
# - Astro ^5.0.0で統一

# 4. 依存関係チェックレポート作成
# docs/new-generator-plan/status/phase-2-5-dependencies-report.md
```

### 2. タスク3: リリースフロー設計（所要時間: 2-3時間）
**タスク2完了後に実施**

```bash
# 1. Changesets初期化
pnpm changeset init

# 2. .changeset/config.json編集
# 3. リリーススクリプト追加
# 4. GitHub Actions設定（オプション）
```

### 3. タスク4: 配布戦略決定（所要時間: 1-2時間）
**タスク3完了後に実施**

- npm vs Gitサブモジュール比較表作成
- Phase 2-5の方針: モノレポ内配布継続
- DECISIONS.mdへ記録

### 4. タスク5: 互換性検証（所要時間: 2-3時間）
**タスク4完了後に実施**

- テストプロジェクト作成
- ビルド成果物テスト
- 型定義テスト
- Lighthouseスコア維持確認

### 5. タスク6: ドキュメント・ライセンス整備（所要時間: 2-3時間）
**最終タスク**

- 共有パッケージ利用ガイド作成
- 各パッケージREADME.md作成
- ライセンス情報整備

---

## 成果物（最終）

### 完了済み
- ✅ 更新された `packages/*` のビルド設定（tsup.config.ts、package.json）
- ✅ generatorパッケージのビルド成果物（dist/、26ファイル）
- ✅ themeパッケージのビルド成果物（dist/、24ファイル + CSS）
- ✅ i18nパッケージのビルド成果物（dist/、4ファイル）

### 予定
- ⏳ 依存関係チェックレポート
- ⏳ Changesets設定（.changeset/config.json）
- ⏳ リリーススクリプト
- ⏳ npm vs Gitサブモジュール比較表
- ⏳ 互換検証レポート
- ⏳ 共有パッケージ利用ガイド
- ⏳ 各パッケージREADME.md（5ファイル）
- ⏳ DECISIONS.mdへの記録

## 完了条件

### 必須項目
- ✅ ビルド成果物生成（@docs/generator, @docs/theme, @docs/i18n）
- ✅ 型定義（.d.ts）生成
- ✅ ESM/CJS両対応
- ✅ runtimeパッケージビルド成功
- ✅ Lighthouseスコア維持（Performance 100, Accessibility 91以上）
- ⏳ Changesetsが動作する
- ⏳ バージョン更新が自動化される
- ⏳ 配布戦略が決定されている
- ⏳ 共有パッケージ利用ガイドが整備されている

### 推奨項目（オプション）
- ⏳ GitHub Actions設定
- ⏳ npm公開テスト（dry-run）
- ⏳ パッケージサイズ最適化（< 100KB）

---

## リスクと課題

### 既知のリスク
1. **Astroコンポーネントのバージョン互換性**
   - 対策: peerDependenciesでAstro ^5.0.0を指定
   - 監視: Astroアップデート時の動作確認

2. **CSS配布方法の標準化**
   - 現状: src/css/*.cssをそのまま配布
   - 懸念: CSSモジュール化の検討は不要か？
   - 判断: Phase 2-5ではplain CSSで進める

3. **型定義の完全性**
   - 確認項目: すべてのexportに型定義があるか
   - 検証方法: tsc --noEmit でテスト

### 未解決の課題
なし（タスク1完了時点）

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2025-10-19 | タスク1完了、進捗状況追加、次のステップ明確化 | Claude |
| 2025-10-19 | Phase 2-5計画書作成 | Claude |

---

## 参考資料

### Phase 2関連
- [Phase 2-5引き継ぎガイド](./status/phase-2-5-handoff.md)
- [Phase 2-4完了報告書](./status/phase-2-4-completion-report.md)

### 外部ドキュメント
- [tsup Documentation](https://tsup.egoist.dev/)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [SemVer仕様](https://semver.org/lang/ja/)
