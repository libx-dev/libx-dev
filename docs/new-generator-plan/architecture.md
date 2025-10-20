# 新ドキュメントサイトジェネレーター アーキテクチャ

**作成日**: 2025-10-20
**Phase**: Phase 2完了時点
**バージョン**: 1.0.0

---

## 目次

1. [概要](#概要)
2. [システム全体図](#システム全体図)
3. [データフロー](#データフロー)
4. [パッケージ構成](#パッケージ構成)
5. [コンポーネント関連図](#コンポーネント関連図)
6. [ビルドパイプライン](#ビルドパイプライン)
7. [ランタイムアーキテクチャ](#ランタイムアーキテクチャ)
8. [技術スタック](#技術スタック)

---

## 概要

新ドキュメントサイトジェネレーターは、**レジストリ駆動**のアプローチを採用し、JSONベースのデータ定義から静的サイトを自動生成します。

### 設計原則

1. **データ駆動**: レジストリ（JSON）を単一ソース・オブ・トゥルースとする
2. **モジュール化**: 共有パッケージによる機能分離
3. **型安全性**: TypeScriptによる堅牢な実装
4. **パフォーマンス**: 静的生成によるゼロランタイムJavaScript
5. **国際化**: 多言語サポートをコアに組み込み

---

## システム全体図

```mermaid
graph TB
    subgraph "データソース"
        A[registry/docs.json]
        B[MDXコンテンツ]
    end

    subgraph "ビルドシステム"
        C[@docs/generator]
        D[@docs/ui]
        E[@docs/theme]
        F[@docs/i18n]
        G[@docs/versioning]
    end

    subgraph "ランタイム"
        H[Astro Runtime]
        I[Static Pages]
    end

    subgraph "検索システム"
        J[Pagefind]
        K[Search Index]
    end

    subgraph "デプロイ"
        L[Cloudflare Pages]
        M[CDN]
    end

    A --> C
    B --> H
    C --> H
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I
    I --> J
    J --> K
    I --> L
    L --> M

    style A fill:#e1f5ff
    style H fill:#fff4e1
    style I fill:#e8f5e9
    style L fill:#f3e5f5
```

---

## データフロー

### 1. ビルド時のデータフロー

```mermaid
sequenceDiagram
    participant R as Registry JSON
    participant G as @docs/generator
    participant A as Astro Runtime
    participant UI as @docs/ui
    participant O as HTML Output
    participant P as Pagefind

    R->>G: レジストリ読み込み
    G->>G: ルート生成（generateRoutes）
    G->>G: サイドバー生成（generateSidebar）
    G->>G: サイトマップ生成（generateSitemap）
    G->>A: ルート情報を渡す
    A->>UI: コンポーネント呼び出し
    UI->>O: HTML生成
    O->>P: インデックス作成
```

### 2. ランタイムのデータフロー

```mermaid
graph LR
    A[ユーザーリクエスト] --> B[静的HTML]
    B --> C[Hydration]
    C --> D[検索インタラクション]
    D --> E[Pagefindクエリ]
    E --> F[検索結果]
    F --> C

    style A fill:#e1f5ff
    style B fill:#e8f5e9
    style C fill:#fff4e1
    style D fill:#f3e5f5
```

---

## パッケージ構成

### 共有パッケージ

```mermaid
graph TB
    subgraph "コア機能"
        A[@docs/generator]
        B[@docs/i18n]
    end

    subgraph "UIシステム"
        C[@docs/ui]
        D[@docs/theme]
        E[@docs/versioning]
    end

    subgraph "ランタイム"
        F[@docs/runtime]
    end

    A --> F
    B --> F
    C --> F
    D --> F
    E --> F

    style A fill:#e3f2fd
    style B fill:#e3f2fd
    style C fill:#f3e5f5
    style D fill:#f3e5f5
    style E fill:#f3e5f5
    style F fill:#fff4e1
```

### パッケージ詳細

| パッケージ | 役割 | 配布形態 | 主要エクスポート |
|-----------|------|---------|----------------|
| @docs/generator | レジストリ駆動のルーティング・サイドバー・サイトマップ生成 | dist/ (ESM/CJS) | `loadRegistry`, `generateRoutes`, `generateSidebar`, `generateSitemap` |
| @docs/ui | Astro UIコンポーネント集（30+コンポーネント） | src/ (ソース配布) | `Navigation`, `Sidebar`, `TableOfContents`, `Pagination`, `Card`, `Alert` 等 |
| @docs/theme | テーマシステム（CSS変数、カラーパレット） | dist/ + src/css | `colors`, `typography`, `spacing`, CSS変数 |
| @docs/i18n | 国際化ユーティリティ（15言語サポート） | dist/ (ESM/CJS) | `getLanguage`, `translate`, `formatDate`, `SUPPORTED_LANGUAGES` |
| @docs/versioning | バージョン管理ユーティリティ・コンポーネント | src/ (ソース配布) | `VersionSelector`, `VersionDiff`, `compareVersions` |

---

## コンポーネント関連図

### UIコンポーネント階層

```mermaid
graph TB
    subgraph "レイアウトコンポーネント"
        A[Navigation]
        B[Sidebar]
        C[TableOfContents]
        D[Pagination]
    end

    subgraph "コンテンツコンポーネント"
        E[Card]
        F[CardGrid]
        G[LinkCard]
        H[Alert]
        I[Badge]
    end

    subgraph "フォームコンポーネント"
        J[Search]
        K[LanguageSwitcher]
        L[ThemeToggle]
    end

    subgraph "バージョニング"
        M[VersionSelector]
        N[VersionDiff]
    end

    A --> K
    A --> L
    B --> M
    F --> E
    F --> G

    style A fill:#e3f2fd
    style B fill:#e3f2fd
    style C fill:#e3f2fd
    style J fill:#fff4e1
    style K fill:#fff4e1
    style M fill:#f3e5f5
```

### コンポーネント依存関係

```mermaid
graph LR
    A[@docs/ui Components] --> B[@docs/theme CSS]
    A --> C[@docs/i18n]
    D[@docs/versioning Components] --> B
    D --> C
    E[Astro Pages] --> A
    E --> D
    E --> F[@docs/generator]

    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style C fill:#fff4e1
    style D fill:#e1bee7
    style E fill:#fff59d
    style F fill:#c5e1a5
```

---

## ビルドパイプライン

### フェーズ1: レジストリ処理

```mermaid
graph LR
    A[registry/docs.json] --> B[スキーマ検証]
    B --> C[レジストリ読み込み]
    C --> D[ルート生成]
    C --> E[サイドバー生成]
    C --> F[サイトマップ生成]

    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#e8f5e9
    style D fill:#f3e5f5
    style E fill:#f3e5f5
    style F fill:#f3e5f5
```

### フェーズ2: ページ生成

```mermaid
graph TB
    A[Astro Pages] --> B[getStaticPaths]
    B --> C[MDXコンテンツ読み込み]
    C --> D[コンポーネントレンダリング]
    D --> E[HTML生成]
    E --> F[CSS最適化]
    F --> G[画像最適化]
    G --> H[静的ファイル出力]

    style A fill:#e1f5ff
    style B fill:#fff4e1
    style H fill:#e8f5e9
```

### フェーズ3: 検索インデックス生成

```mermaid
graph LR
    A[HTML Output] --> B[Pagefindスキャン]
    B --> C[インデックス生成]
    C --> D[言語別インデックス]
    D --> E[pagefind/]

    style A fill:#e1f5ff
    style E fill:#e8f5e9
```

### フェーズ4: デプロイ

```mermaid
graph LR
    A[dist/] --> B[Cloudflare Pages]
    B --> C[CDN配信]
    C --> D[エッジキャッシュ]

    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#e8f5e9
    style D fill:#f3e5f5
```

### 統合ビルドフロー

```mermaid
graph TB
    A[pnpm build] --> B[共有パッケージビルド]
    B --> C[tsup: @docs/generator]
    B --> D[tsup: @docs/theme]
    B --> E[tsup: @docs/i18n]
    C --> F[Astroビルド]
    D --> F
    E --> F
    F --> G[Pagefindインデックス]
    G --> H[dist/]

    style A fill:#e1f5ff
    style H fill:#e8f5e9
```

---

## ランタイムアーキテクチャ

### ページ生成プロセス

```mermaid
sequenceDiagram
    participant U as User Request
    participant CDN as CDN/Edge
    participant H as Static HTML
    participant JS as Client JS
    participant P as Pagefind

    U->>CDN: ページリクエスト
    CDN->>H: HTMLファイル取得
    H->>U: HTMLレスポンス
    U->>JS: インタラクティブ要素 Hydration
    JS->>P: 検索クエリ
    P->>JS: 検索結果
    JS->>U: 結果表示
```

### 検索アーキテクチャ

```mermaid
graph TB
    A[ユーザー入力] --> B[検索コンポーネント]
    B --> C[Pagefindクライアント]
    C --> D[言語フィルタ]
    C --> E[プロジェクトフィルタ]
    C --> F[バージョンフィルタ]
    D --> G[インデックス検索]
    E --> G
    F --> G
    G --> H[結果フォーマット]
    H --> I[ハイライト表示]
    I --> J[ページネーション]

    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#e8f5e9
    style J fill:#f3e5f5
```

---

## 技術スタック

### フロントエンド

```mermaid
mindmap
  root((Frontend))
    Framework
      Astro 5.0
      TypeScript 5.x
    UI
      Astro Components
      CSS Variables
      Responsive Design
    Search
      Pagefind
      Faceted Search
    i18n
      15 Languages
      Auto Detection
```

### ビルドツール

```mermaid
mindmap
  root((Build Tools))
    Bundler
      Astro Build
      tsup 8.x
    Package Manager
      pnpm 10.x
      Workspaces
    Version Control
      Changesets
      SemVer
```

### インフラ

```mermaid
mindmap
  root((Infrastructure))
    Hosting
      Cloudflare Pages
      CDN
    CI/CD
      GitHub Actions
      Automated Deploy
    Monitoring
      Lighthouse CI
      Performance
```

### 技術スタック詳細

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| **フレームワーク** | Astro | ^5.0.0 | 静的サイト生成 |
| **言語** | TypeScript | ^5.0.0 | 型安全な実装 |
| **ビルドツール** | tsup | ^8.5.0 | パッケージビルド |
| **パッケージマネージャー** | pnpm | ^10.0.0 | モノレポ管理 |
| **検索エンジン** | Pagefind | ^1.0.0 | 全文検索 |
| **スタイリング** | CSS Variables | - | テーマシステム |
| **バージョン管理** | Changesets | ^2.27.0 | セマンティックバージョニング |
| **CI/CD** | GitHub Actions | - | 自動ビルド・デプロイ |
| **ホスティング** | Cloudflare Pages | - | CDN配信 |
| **品質管理** | Lighthouse CI | - | パフォーマンス監視 |

---

## パフォーマンス最適化

### 最適化戦略

```mermaid
graph TB
    subgraph "ビルド時最適化"
        A[静的生成]
        B[CSS最小化]
        C[画像最適化]
        D[コード分割]
    end

    subgraph "ランタイム最適化"
        E[遅延読み込み]
        F[CDNキャッシュ]
        G[エッジコンピューティング]
    end

    subgraph "検索最適化"
        H[インデックス圧縮]
        I[言語別分割]
        J[ファセット検索]
    end

    A --> F
    B --> F
    C --> F
    D --> E
    H --> J

    style A fill:#e8f5e9
    style F fill:#e1f5ff
    style H fill:#fff4e1
```

### パフォーマンス指標

| 指標 | 目標 | 達成値 | 状態 |
|-----|------|--------|------|
| Lighthouse Performance | ≥ 90 | **100** | ✅ |
| Lighthouse Accessibility | ≥ 90 | **91** | ✅ |
| Lighthouse Best Practices | ≥ 90 | **96** | ✅ |
| Lighthouse SEO | ≥ 95 | **100** | ✅ |
| ビルド時間 | < 10秒 | **4.21秒** | ✅ |
| 検索速度 | < 100ms | **< 50ms** | ✅ |
| ページサイズ | < 100KB | **約90KB** | ✅ |

---

## セキュリティとアクセシビリティ

### セキュリティ対策

```mermaid
graph TB
    A[コンテンツセキュリティ] --> B[静的生成のみ]
    A --> C[XSS対策]
    A --> D[HTTPS強制]

    E[依存関係管理] --> F[pnpm audit]
    E --> G[Dependabot]

    H[デプロイセキュリティ] --> I[Cloudflare Access]
    H --> J[環境変数管理]

    style A fill:#e8f5e9
    style E fill:#fff4e1
    style H fill:#e1f5ff
```

### アクセシビリティ

```mermaid
graph TB
    A[WAI-ARIA] --> B[セマンティックHTML]
    A --> C[キーボード操作]
    A --> D[スクリーンリーダー対応]

    E[視覚的アクセシビリティ] --> F[カラーコントラスト]
    E --> G[フォントサイズ]
    E --> H[ダークモード]

    I[構造的アクセシビリティ] --> J[見出し階層]
    I --> K[ランドマークロール]
    I --> L[代替テキスト]

    style A fill:#e8f5e9
    style E fill:#fff4e1
    style I fill:#e1f5ff
```

---

## 拡張性と将来計画

### Phase 3以降の拡張計画

```mermaid
timeline
    title システム拡張ロードマップ
    Phase 3 : 既存資産移行 : CI/CD整備 : 自動テスト
    Phase 4 : QA・リリース : ドキュメント整備 : パフォーマンステスト
    Phase 5 : npm公開 : プラグインシステム : 外部連携API
```

### 拡張ポイント

1. **プラグインシステム**（Phase 5）
   - カスタムコンポーネント登録
   - カスタム検索フィルタ
   - カスタムテーマ

2. **外部サービス連携**（Phase 5）
   - Algolia検索（オプション）
   - Analytics統合
   - CDN最適化

3. **高度な機能**（Phase 5）
   - AIベースの翻訳支援
   - リアルタイムコラボレーション
   - バージョン間差分の自動生成

---

## まとめ

新ドキュメントサイトジェネレーターは、**レジストリ駆動**のアプローチにより、以下の特徴を実現しています：

✅ **データ駆動**: JSONレジストリによる一元管理
✅ **モジュール化**: 共有パッケージによる機能分離
✅ **型安全性**: TypeScriptによる堅牢な実装
✅ **高パフォーマンス**: Lighthouse全スコア目標達成
✅ **国際化**: 15言語サポート
✅ **拡張性**: プラグインシステム準備完了

Phase 2の完了により、**安定したビルドシステム**と**高品質なUI/UX**を実現し、Phase 3以降の拡張に向けた強固な基盤が整いました。

---

## 参考資料

### Phase 2関連ドキュメント
- [Phase 2-6計画書](phase-2-6-documentation-demo.md)
- [Phase 2-5完了報告書](status/phase-2-5-completion-report.md)
- [Phase 2-4完了報告書](status/phase-2-4-completion-report.md)

### ガイドドキュメント
- [共有パッケージ利用ガイド](guides/shared-packages.md)
- [リリースフローガイド](guides/release-flow.md)

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
