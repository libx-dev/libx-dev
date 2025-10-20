# デモサイトウォークスルー

**作成日**: 2025-10-20
**Phase**: Phase 2-6（ドキュメント/デモ）
**目的**: Phase 2の成果を視覚的に示し、主要機能を実演する

---

## 概要

このウォークスルーでは、新ドキュメントサイトジェネレーターの主要機能を実演します。Phase 2-1〜Phase 2-5で実装したすべての機能が統合され、実際に動作している様子を確認できます。

**デモサイトURL**: [https://demo.libx.dev](https://demo.libx.dev)（予定）

---

## 主要な機能

### 1. トップページ

![トップページ](screenshots/01-homepage.png)

**機能**:
- 複数プロジェクトの一覧表示
- 各プロジェクトの最新バージョンへのリンク
- 多言語対応（EN/JA/KO）
- レスポンシブデザイン

**実装**:
- `packages/runtime/src/pages/index.astro`
- `@docs/ui` の `Card` と `CardGrid` コンポーネント
- `@docs/generator` でレジストリから自動生成

---

### 2. サイドバーナビゲーション

![サイドバーナビゲーション](screenshots/02-sidebar-navigation.png)

**機能**:
- カテゴリ階層構造
- 現在ページのハイライト
- 折りたたみ可能なセクション
- レスポンシブ対応（モバイルではハンバーガーメニュー）

**実装**:
- `@docs/ui` の `Sidebar` コンポーネント
- `@docs/generator` の `generateSidebar` 関数
- レジストリの `categories` と `documents` から自動生成

**レジストリ構造**:
```json
{
  "categories": [
    {
      "id": "guide",
      "name": { "en": "Guide", "ja": "ガイド" },
      "order": 1
    }
  ],
  "documents": [
    {
      "docId": "getting-started",
      "categoryId": "guide",
      "order": 1,
      "title": { "en": "Getting Started", "ja": "はじめに" }
    }
  ]
}
```

---

### 3. 検索機能

#### 3-1. 検索ボックス

![検索ボックス](screenshots/03-search-input.png)

**機能**:
- モーダルベースの検索UI
- キーボードショートカット対応（Cmd/Ctrl + K）
- アクセシビリティ対応

#### 3-2. 検索結果とフィルタ

![検索結果](screenshots/04-search-results.png)

**機能**:
- ファセット検索（プロジェクト/バージョン/言語フィルタ）
- ページネーション（10件/ページ）
- 検索ハイライト
- スニペット表示

**実装**:
- Pagefindによる全文検索
- `packages/runtime/src/components/Search.astro`
- Phase 2-3で統合、Phase 2-4で最適化

**パフォーマンス**:
- インデックスサイズ: 約120KB（3言語、62ページ）
- 検索速度: < 50ms（平均）
- Lighthouse Performance: 100/100

---

### 4. バージョン切り替え

![バージョンセレクター](screenshots/05-version-selector.png)

**機能**:
- ドロップダウンでバージョン選択
- 最新バージョンの明示（"v2 (latest)"）
- バージョン間の差分表示（VersionDiff）

**実装**:
- `@docs/versioning` の `VersionSelector` コンポーネント
- レジストリの `versions` から自動生成

**レジストリ構造**:
```json
{
  "versions": [
    {
      "id": "v2",
      "name": "Version 2.0",
      "isLatest": true,
      "status": "stable"
    },
    {
      "id": "v1",
      "name": "Version 1.0",
      "status": "deprecated"
    }
  ]
}
```

---

### 5. 言語切り替え

![言語切り替え](screenshots/06-language-switcher.png)

**機能**:
- 言語ドロップダウン（EN/JA/KO）
- 現在の言語をハイライト
- 翻訳未完了の場合はフォールバック言語へ誘導

**実装**:
- `@docs/i18n` の言語検出とパス変換機能
- `@docs/ui` の `LanguageSwitcher` コンポーネント
- 15言語サポート（現在は3言語を使用）

**対応言語**:
- English (en)
- 日本語 (ja)
- 한국어 (ko)
- その他12言語（zh-Hans, zh-Hant, es, pt-BR, de, fr, ru, ar, id, tr, hi, vi）

---

### 6. レスポンシブデザイン

#### 6-1. タブレット（768x1024）

![タブレット表示](screenshots/07-responsive-tablet.png)

**特徴**:
- サイドバーが折りたたみ可能
- 目次（TOC）が下部に移動
- タッチ操作に最適化

#### 6-2. モバイル（375x667）

![モバイル表示](screenshots/08-responsive-mobile.png)

**特徴**:
- ハンバーガーメニュー
- 単一カラムレイアウト
- 検索ボックスが全画面モーダル

**実装**:
- `@docs/theme` のレスポンシブCSS変数
- メディアクエリ（`@media (max-width: 768px)`）
- モバイルファースト設計

---

### 7. ダークモード

![ダークモード](screenshots/09-dark-mode.png)

**機能**:
- テーマトグルボタン（ライト/ダーク）
- システム設定の自動検出
- カラーパレットの動的切り替え

**実装**:
- `@docs/theme` のCSS変数
- `prefers-color-scheme` メディアクエリ
- ローカルストレージに設定を保存

**カラーパレット**:
```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-primary: #0066cc;
}

[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-text: #f5f5f5;
  --color-primary: #3399ff;
}
```

---

### 8. ドキュメントページ（目次付き）

![ドキュメントページ](screenshots/10-document-with-toc.png)

**機能**:
- 目次（Table of Contents）
- 見出しへのアンカーリンク
- 前後ページナビゲーション（Pagination）
- フロントマター情報の表示

**実装**:
- `@docs/ui` の `TableOfContents` コンポーネント
- `@docs/ui` の `Pagination` コンポーネント
- MDXコンテンツのレンダリング

**MDXの例**:
```mdx
---
title: "はじめに"
description: "新ドキュメントジェネレーターのクイックスタート"
---

# はじめに

新ドキュメントジェネレーターへようこそ！

## インストール

\`\`\`bash
pnpm install @docs/generator @docs/ui @docs/theme
\`\`\`
```

---

## アーキテクチャ概要

### データフロー

```mermaid
graph LR
    A[Registry JSON] --> B[@docs/generator]
    B --> C[Routes]
    B --> D[Sidebar]
    B --> E[Sitemap]
    C --> F[Astro Pages]
    D --> F
    F --> G[@docs/ui Components]
    F --> H[@docs/theme]
    F --> I[@docs/i18n]
    F --> J[@docs/versioning]
    G --> K[HTML Output]
    H --> K
    K --> L[Pagefind Index]
    L --> M[Search Results]
```

### パッケージ構成

| パッケージ | 役割 | 配布形態 |
|-----------|------|---------|
| @docs/generator | レジストリ駆動のルーティング・サイドバー・サイトマップ生成 | dist/ |
| @docs/ui | Astro UIコンポーネント集（30+コンポーネント） | src/ |
| @docs/theme | テーマシステム（CSS変数、カラーパレット） | dist/ + src/css |
| @docs/i18n | 国際化ユーティリティ（15言語サポート） | dist/ |
| @docs/versioning | バージョン管理ユーティリティ・コンポーネント | src/ |

---

## パフォーマンス指標

### Lighthouseスコア（Phase 2-4で達成）

| 項目 | スコア | 目標 | 状態 |
|-----|-------|------|------|
| Performance | **100/100** | ≥ 90 | ✅ |
| Accessibility | **91/100** | ≥ 90 | ✅ |
| Best Practices | **96/100** | ≥ 90 | ✅ |
| SEO | **100/100** | ≥ 95 | ✅ |

### ビルド統計

- **生成ページ数**: 62ページ
- **ビルド時間**: 4.21秒
- **ビルドサイズ**: 5.6MB
- **Pagefindインデックス**: 4,635語、3言語

### 検索パフォーマンス

- **インデックスサイズ**: 約120KB
- **検索速度**: < 50ms（平均）
- **サポート言語**: ja, ko, en

---

## 共有パッケージの活用例

### 完全なドキュメントページの実装

```astro
---
// packages/runtime/src/pages/[project]/[version]/[lang]/[...slug].astro

import { loadRegistry, generateRoutes, generateSidebar } from '@docs/generator';
import {
  Navigation,
  Sidebar,
  TableOfContents,
  Pagination,
  Alert,
  Card,
  CardGrid,
  LinkCard
} from '@docs/ui/components';
import { VersionSelector } from '@docs/versioning/components';
import { getLanguage, translate } from '@docs/i18n';
import '@docs/theme/css/variables.css';
import '@docs/theme/css/base.css';

export async function getStaticPaths() {
  const registry = loadRegistry('registry/docs.json');
  return generateRoutes(registry, { env: 'production' });
}

const { docId, title, summary } = Astro.props;
const { project, version, lang, slug } = Astro.params;

const registry = loadRegistry('registry/docs.json');
const sidebar = generateSidebar(registry, project, version, lang);
const currentLang = getLanguage(Astro.url.pathname);
---

<!DOCTYPE html>
<html lang={lang}>
<head>
  <meta charset="UTF-8">
  <title>{title} - {translate('site.title', currentLang)}</title>
</head>
<body>
  <Navigation projectId={project} version={version} lang={lang} />

  <div class="layout">
    <aside>
      <VersionSelector
        versions={registry.versions}
        currentVersion={version}
        currentPath={Astro.url.pathname}
      />
      <Sidebar items={sidebar} currentPath={Astro.url.pathname} />
    </aside>

    <main>
      <Alert type="info">
        {translate('demo.welcome', currentLang)}
      </Alert>

      <h1>{title}</h1>

      <CardGrid>
        <LinkCard
          title={translate('demo.guide', currentLang)}
          href={`/${project}/${version}/${lang}/guide/getting-started`}
          description={translate('demo.guide.description', currentLang)}
        />
        <LinkCard
          title={translate('demo.api', currentLang)}
          href={`/${project}/${version}/${lang}/api/components`}
          description={translate('demo.api.description', currentLang)}
        />
      </CardGrid>

      <Pagination
        prev={{ href: '/prev', title: 'Previous' }}
        next={{ href: '/next', title: 'Next' }}
      />
    </main>

    <TableOfContents headings={[]} />
  </div>
</body>
</html>
```

---

## 技術的ハイライト

### Phase 2-1: ランタイム/ジェネレーター
- ✅ レジストリ駆動のルーティング
- ✅ サイドバー自動生成
- ✅ サイトマップ生成

### Phase 2-2: UI/テーマ統合
- ✅ 30+のAstroコンポーネント
- ✅ Starlightスタイルの統一
- ✅ アクセシビリティ対応

### Phase 2-3: コンテンツ統合
- ✅ MDXコンテンツレンダリング
- ✅ Pagefind検索統合
- ✅ 検索フィルタ・ページネーション

### Phase 2-4: パフォーマンス最適化
- ✅ Lighthouse全スコア目標達成
- ✅ 画像最適化（Astro Image）
- ✅ CSS最小化・インライン化

### Phase 2-5: 共有パッケージ検証
- ✅ tsupによるビルド設定
- ✅ TypeScript型定義自動生成
- ✅ ドキュメント整備（約6,276行）

---

## 次のステップ

### Phase 3: 既存資産移行とCI整備
- 既存コンテンツの移行ツール開発
- CI/CDパイプラインの構築
- 自動テストの整備

### Phase 4: QA・リリース準備
- 包括的なQAテスト
- リリースノート作成
- ユーザーガイド整備

### Phase 5: リリース後の継続改善
- フィードバック収集と対応
- パフォーマンス継続監視
- 新機能追加

---

## フィードバック

デモサイトに関するフィードバックは以下の方法で受け付けています：

1. **GitHubのIssue**: [libx-dev/issues](https://github.com/dolphilia/libx-dev/issues)
2. **フィードバックフォーム**: （準備中）
3. **直接連絡**: プロジェクトマネージャーまで

---

## 参考資料

### Phase 2関連ドキュメント
- [Phase 2-6計画書](../phase-2-6-documentation-demo.md)
- [Phase 2-6進捗レポート](../status/phase-2-6-progress-report.md)
- [Phase 2-5完了報告書](../status/phase-2-5-completion-report.md)

### ガイドドキュメント
- [共有パッケージ利用ガイド](../guides/shared-packages.md)
- [リリースフローガイド](../guides/release-flow.md)

### パッケージドキュメント
- [packages/generator/README.md](../../packages/generator/README.md)
- [packages/ui/README.md](../../packages/ui/README.md)
- [packages/theme/README.md](../../packages/theme/README.md)
- [packages/i18n/README.md](../../packages/i18n/README.md)
- [packages/versioning/README.md](../../packages/versioning/README.md)

---

**作成者**: Claude
**作成日**: 2025-10-20
**最終更新**: 2025-10-20
