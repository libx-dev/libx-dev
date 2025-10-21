# QA環境セットアップガイド

**作成日**: 2025-10-21
**対象**: Phase 4-1 QA/テスト担当者

---

## 📋 目次

1. [必要なツール](#必要なツール)
2. [ローカル環境セットアップ](#ローカル環境セットアップ)
3. [QAツールインストール](#qaツールインストール)
4. [テスト実行環境確認](#テスト実行環境確認)
5. [トラブルシューティング](#トラブルシューティング)

---

## 必要なツール

### 基本ツール

| ツール | バージョン | 用途 | インストール方法 |
|-------|----------|------|----------------|
| **Node.js** | 20.x | ランタイム | [nodejs.org](https://nodejs.org/) |
| **pnpm** | 9.x | パッケージマネージャー | `npm install -g pnpm` |
| **Git** | 最新 | バージョン管理 | [git-scm.com](https://git-scm.com/) |

### QAツール

| ツール | 用途 | インストール方法 |
|-------|------|----------------|
| **Chrome** | Lighthouseテスト、DevTools | [Google Chrome](https://www.google.com/chrome/) |
| **Lighthouse CI** | 自動化測定 | `npm install -g @lhci/cli` |
| **axe DevTools** | アクセシビリティテスト | [Chrome拡張](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd) |

### オプションツール

| ツール | 用途 | インストール方法 |
|-------|------|----------------|
| **NVDA** (Windows) | スクリーンリーダーテスト | [nvaccess.org](https://www.nvaccess.org/) |
| **VoiceOver** (macOS) | スクリーンリーダーテスト | 標準搭載（Cmd+F5で起動） |
| **Visual Studio Code** | コード確認・編集 | [code.visualstudio.com](https://code.visualstudio.com/) |

---

## ローカル環境セットアップ

### 1. リポジトリクローン

```bash
# SSH使用
git clone git@github.com:your-org/libx-dev.git
cd libx-dev

# HTTPS使用
git clone https://github.com/your-org/libx-dev.git
cd libx-dev
```

### 2. 依存関係インストール

```bash
# pnpmのインストール（未インストールの場合）
npm install -g pnpm

# プロジェクトの依存関係インストール
pnpm install
```

**実行時間**: 約2-3分

**期待される出力**:
```
Packages: +XXX
++++++++++++++++++++++++++++++++++++++++++
Progress: resolved XXX, reused XXX, downloaded 0, added XXX, done
```

### 3. ビルド実行

```bash
# 全プロジェクトをビルド
pnpm build:local
```

**実行時間**: 約5-10分

**期待される出力**:
```
✓ built in XXXms
```

**生成されるファイル**:
- `dist/` - ビルド成果物
- `dist/_pagefind/` - 検索インデックス

### 4. 開発サーバー起動

```bash
# 開発サーバー起動
pnpm dev
```

**アクセス先**:
- Top Page: `http://localhost:4321/`
- Demo Docs: `http://localhost:4321/demo-docs/`

### 5. プレビューサーバー起動

```bash
# プレビューサーバー起動（ビルド後）
pnpm preview
```

**用途**: 本番環境に近い状態でのテスト

---

## QAツールインストール

### 1. Chrome DevTools（標準搭載）

**起動方法**:
- Windows/Linux: `F12` または `Ctrl+Shift+I`
- macOS: `Cmd+Option+I`

**主要タブ**:
- **Elements**: HTML/CSS確認
- **Network**: ネットワーク通信・ページロード時間
- **Lighthouse**: パフォーマンス・アクセシビリティ測定
- **Performance**: 詳細なパフォーマンス分析

### 2. Lighthouse

#### ブラウザ版（Chrome DevTools）

**使用方法**:
1. Chrome DevToolsを開く（F12）
2. 「Lighthouse」タブを選択
3. 設定:
   - Mode: **Navigation**
   - Device: **Desktop** または **Mobile**
   - Categories: すべてチェック
4. 「Analyze page load」をクリック

#### CLI版

```bash
# インストール
npm install -g @lhci/cli

# 実行
lhci autorun --url=http://localhost:4321/demo-docs/v1/en/guide/getting-started
```

### 3. axe DevTools（Chrome拡張）

**インストール**:
1. [Chrome Web Store](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)にアクセス
2. 「Chromeに追加」をクリック

**使用方法**:
1. Chrome DevToolsを開く（F12）
2. 「axe DevTools」タブを選択
3. 「Scan ALL of my page」をクリック

**出力**:
- Issues: アクセシビリティ違反
- Needs Review: 手動確認が必要な項目
- Passed: 合格した項目

### 4. スクリーンリーダー

#### macOS VoiceOver

**起動**: `Cmd+F5`

**基本操作**:
- **VO + →**: 次の要素へ移動
- **VO + ←**: 前の要素へ移動
- **VO + U**: ランドマーク一覧表示
- **VO + Shift + H**: 見出し一覧表示

**設定確認**:
- システム環境設定 → アクセシビリティ → VoiceOver

#### Windows NVDA

**インストール**: [nvaccess.org](https://www.nvaccess.org/)からダウンロード

**起動**: `Ctrl+Alt+N`

**基本操作**:
- **↓**: 次の要素へ移動
- **↑**: 前の要素へ移動
- **Insert+F7**: 要素一覧表示
- **H**: 次の見出しへジャンプ

---

## テスト実行環境確認

### 1. ユニットテスト実行

```bash
# 全テスト実行
pnpm test

# ウォッチモード
pnpm test:watch

# カバレッジレポート
pnpm test:coverage
```

**期待される結果**:
```
✓ packages/cli/tests/unit/backup.test.js (17)
✓ packages/cli/tests/unit/logger.test.js (10)
✓ packages/cli/tests/unit/registry.test.js (15)
...
Test Files  X passed (X)
     Tests  XX passed (XX)
```

**カバレッジ目標**: Lines 80%以上

### 2. ビルドテスト

```bash
# ローカルビルド
pnpm build:local

# demo-docsの確認
ls -la dist/demo-docs/
```

**期待される出力**:
```
dist/demo-docs/
├── v1/
│   ├── en/
│   │   ├── guide/
│   │   ├── api/
│   │   └── examples/
│   ├── ja/
│   └── ko/
└── _pagefind/
```

### 3. Pagefind検索テスト

```bash
# ビルド後、プレビューサーバー起動
pnpm preview

# ブラウザでアクセス
# http://localhost:4321/demo-docs/v1/en/guide/getting-started

# 検索ボックスで "getting started" を検索
```

**期待される結果**:
- 検索結果が表示される
- 検索語がハイライトされる

### 4. Lighthouseテスト

```bash
# プレビューサーバー起動（別ターミナル）
pnpm preview

# Lighthouse CLI実行
lhci autorun --url=http://localhost:4321/demo-docs/v1/en/guide/getting-started
```

**期待されるスコア**（Phase 2-4実績）:
- Performance: **100**
- Accessibility: **91+**
- Best Practices: **96+**
- SEO: **100**

---

## トラブルシューティング

### 問題1: `pnpm install`が失敗する

**エラー例**:
```
ERR_PNPM_FETCH_404  GET https://registry.npmjs.org/@docs/ui: Not Found
```

**解決方法**:
```bash
# pnpmのキャッシュをクリア
pnpm store prune

# 再実行
pnpm install
```

### 問題2: ビルドが失敗する

**エラー例**:
```
Error: Cannot find module '@docs/generator'
```

**解決方法**:
```bash
# 依存関係を再インストール
pnpm install --force

# 再ビルド
pnpm build:local
```

### 問題3: Pagefind検索が動作しない

**症状**: 検索ボックスに入力しても結果が表示されない

**確認事項**:
1. `dist/_pagefind/`ディレクトリが存在するか確認
```bash
ls -la dist/_pagefind/
```

2. Pagefindインデックスが生成されているか確認
```bash
du -sh dist/_pagefind/
# 期待される出力: 数百KB以上
```

**解決方法**:
```bash
# 再ビルド
pnpm build:local

# プレビューサーバー再起動
pnpm preview
```

### 問題4: Lighthouseスコアが低い

**症状**: Performance スコアが80未満

**確認事項**:
1. キャッシュを無効化してテスト
   - Chrome DevTools → Lighthouse
   - 「Clear storage」をチェック

2. Throttling設定を確認
   - Device: Desktop / Mobile を適切に選択

**解決方法**:
```bash
# プロダクションビルドで測定
pnpm build

# 結果が改善しない場合は、phase-2-4-completion-report.mdの最適化設定を確認
```

### 問題5: VoiceOverが起動しない（macOS）

**症状**: `Cmd+F5`でVoiceOverが起動しない

**解決方法**:
1. システム環境設定 → アクセシビリティ → VoiceOver
2. 「VoiceOverを有効にする」をチェック
3. 再度 `Cmd+F5` を試す

---

## QA環境確認チェックリスト

### 基本環境
- [ ] Node.js 20.x インストール確認: `node -v`
- [ ] pnpm 9.x インストール確認: `pnpm -v`
- [ ] Git インストール確認: `git --version`

### リポジトリセットアップ
- [ ] リポジトリクローン完了
- [ ] `pnpm install` 成功
- [ ] `pnpm build:local` 成功
- [ ] `pnpm dev` でローカルサーバー起動成功

### QAツール
- [ ] Chrome DevTools動作確認
- [ ] Lighthouse測定成功
- [ ] axe DevTools拡張インストール済み
- [ ] スクリーンリーダー（VoiceOver/NVDA）動作確認

### テスト環境
- [ ] `pnpm test` 成功
- [ ] `pnpm test:coverage` 実行成功
- [ ] demo-docsビルド成功
- [ ] Pagefind検索動作確認
- [ ] Lighthouseスコア測定成功

---

## 参照ドキュメント

- [qa-testing.md](./qa-testing.md) - QA/テスト総合ガイド
- [testing.md](./testing.md) - テストポリシーガイド
- [phase-2-4-completion-report.md](../status/phase-2-4-completion-report.md) - パフォーマンス最適化報告

---

**最終更新**: 2025-10-21
**作成者**: Claude Code (AI Assistant)
