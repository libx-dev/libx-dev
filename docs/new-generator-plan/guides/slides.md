# 新ドキュメントサイトジェネレーター - トレーニングスライド

このドキュメントは、新ドキュメントサイトジェネレーターのトレーニングセッション用のプレゼンテーション資料です。Markdown形式で記載されており、Marp、Slidev、またはreveal.js等のツールでスライドに変換できます。

**対象読者**: トレーニング参加者全員

**関連資料**:
- [トレーニング計画書](./training-plan.md) - セッション構成と実施計画
- [ハンズオン実習手順](./hands-on.md) - 実践演習
- [CLI操作ガイド](./cli-operations.md) - コマンドリファレンス

---

## 目次

- [イントロダクション](#イントロダクション) - スライド1-20
- [システムアーキテクチャ](#システムアーキテクチャ) - スライド21-40
- [CLI操作デモ](#cli操作デモ) - スライド41-65
- [コンテンツ管理](#コンテンツ管理) - スライド66-90
- [ビルド・デプロイ](#ビルドデプロイ) - スライド91-105
- [トラブルシューティング](#トラブルシューティング) - スライド106-115
- [ベストプラクティス](#ベストプラクティス) - スライド116-130

---

# イントロダクション

---

## スライド1: タイトルスライド

# 新ドキュメントサイトジェネレーター
## トレーニングプログラム

**日付**: 2025年10月

**担当**: テックリード / プロダクトオーナー

---

## スライド2: アジェンダ

### 本日の内容

1. **プロジェクト背景と目標** (10分)
2. **システムアーキテクチャ** (20分)
3. **ライブデモ** (10分)
4. **Q&A** (5分)

**合計時間**: 45分

---

## スライド3: 自己紹介

### トレーナー紹介

- **テックリード**: システム設計・開発責任者
- **プロダクトオーナー**: プロジェクト全体管理
- **運用リード**: 日常運用サポート
- **コンテンツリード**: コンテンツ戦略

---

## スライド4: 参加者の皆さんへ

### 学習目標

✅ システム全体を理解する

✅ CLI操作の基本を習得する

✅ コンテンツ管理の流れを理解する

✅ トラブルシューティング能力を向上させる

---

## スライド5: プロジェクト背景

### なぜ新しいジェネレーターが必要だったのか？

**現行システムの課題**:
- ⚠️ 複数リポジトリでの管理が複雑
- ⚠️ ビルドプロセスが分散
- ⚠️ コンテンツ追加の手順が煩雑
- ⚠️ 翻訳ワークフローが非効率

---

## スライド6: プロジェクト目標

### 新システムで実現すること

✅ **単一リポジトリ管理**: すべてがlibx-devに集約

✅ **レジストリ駆動**: JSONでメタデータを一元管理

✅ **CLI自動化**: コマンド一つでプロジェクト・ドキュメント追加

✅ **効率的ビルド**: 1回のビルドで統合サイト生成

---

## スライド7: 移行スケジュール

### フェーズ別計画

| フェーズ | 期間 | 内容 |
|---------|------|------|
| Phase 0 | 2週間 | 要件定義 |
| Phase 1 | 4週間 | レジストリ/CLI開発 |
| Phase 2 | 6週間 | Astroビルド/UI統合 |
| Phase 3 | 4週間 | 既存コンテンツ移行 |
| **Phase 4** | **2週間** | **QA・リリース準備（現在）** |
| Phase 5 | 継続 | リリース後改善 |

---

## スライド8: プロジェクトの成果（Phase 4-1）

### 驚異的なパフォーマンス達成

**Lighthouseスコア**（8ページ平均）:

| カテゴリ | スコア | 目標 | 達成率 |
|---------|--------|------|--------|
| **Performance** | **100** | 90 | ✅ **111%** |
| **Accessibility** | **99.5** | 95 | ✅ **105%** |
| **Best Practices** | **99.5** | 90 | ✅ **111%** |
| **SEO** | **100** | 90 | ✅ **111%** |

🌟 **8ページ中7ページで全カテゴリ100点満点達成！**

---

## スライド9: プロジェクトの成果（Phase 4-2）

### 品質向上の取り組み

✅ **アクセシビリティ改善**: スキップリンク追加、見出し階層修正

✅ **多言語対応強化**: メタディスクリプション多言語化

✅ **CI/CD統合**: Lighthouse自動測定、GitHub Actions設定

✅ **テストカバレッジ向上**: 38.91% → **60.28%**（+21.37%）

---

## スライド10: 主要な特徴

### 新システムの3つの柱

```
┌─────────────┐
│     CLI     │ ← コマンドライン操作
└─────────────┘
       ↓
┌─────────────┐
│ Generator   │ ← レジストリ → Astroページ変換
└─────────────┘
       ↓
┌─────────────┐
│   UI/Theme  │ ← 共有コンポーネント
└─────────────┘
```

---

## スライド11: レジストリ駆動設計とは？

### すべての源泉: レジストリJSON

**レジストリ = ドキュメントの設計図**

```json
{
  "$schemaVersion": "0.0.1",
  "projects": [
    {
      "id": "demo-docs",
      "versions": [...],
      "documents": [...]
    }
  ]
}
```

**レジストリを更新 → ビルド → サイト生成**

---

## スライド12: レジストリの役割

### 単一ソース・オブ・トゥルース

```
  レジストリ (registry/demo-docs.json)
         ↓
    ┌────┴────┐
    │         │
  CLI      Generator
    │         │
    └────┬────┘
         ↓
    Astroページ
         ↓
      ビルド
         ↓
   静的サイト
```

---

## スライド13: データフロー全体像

### レジストリ → ビルド → デプロイ

```
1. レジストリ編集
   └→ registry/demo-docs.json

2. CLI操作（オプション）
   └→ docs-gen add doc <id>

3. ビルド
   └→ pnpm build

4. デプロイ
   └→ Cloudflare Pages
```

---

## スライド14: 従来システムとの比較

| 項目 | 従来システム | 新システム |
|-----|-----------|----------|
| **リポジトリ** | 複数（libx-dev + libx-docs） | 単一（libx-dev） |
| **コンテンツ追加** | 手動で複数ファイル編集 | CLI一発（`docs-gen add doc`） |
| **ビルド** | 個別ビルド → 手動統合 | 統合ビルド一発（`pnpm build`） |
| **メタデータ管理** | 分散（astro.config.mjs等） | 集中（レジストリJSON） |
| **翻訳管理** | ファイルベース | レジストリ + 翻訳ステータス |

---

## スライド15: ユーザー体験の向上

### 最終的なサイトの特徴

✅ **高速**: Lighthouse Performance 100点

✅ **アクセシブル**: WCAG 2.1 AA基準準拠

✅ **多言語**: 15言語サポート（RTL対応含む）

✅ **検索**: Pagefind全文検索

✅ **レスポンシブ**: モバイル・デスクトップ最適化

---

## スライド16: サポートされる言語

### 15言語に対応

- 🇬🇧 英語 (en)
- 🇯🇵 日本語 (ja)
- 🇨🇳 簡体字中国語 (zh-Hans)
- 🇹🇼 繁体字中国語 (zh-Hant)
- 🇪🇸 スペイン語 (es)
- 🇧🇷 ポルトガル語 (pt-BR)
- 🇰🇷 韓国語 (ko)
- 🇩🇪 ドイツ語 (de)
- 🇫🇷 フランス語 (fr)
- 🇷🇺 ロシア語 (ru)
- 🇸🇦 アラビア語 (ar) ※RTL対応
- 🇮🇩 インドネシア語 (id)
- 🇹🇷 トルコ語 (tr)
- 🇮🇳 ヒンディー語 (hi)
- 🇻🇳 ベトナム語 (vi)

---

## スライド17: 技術スタック

### 使用技術

**フロントエンド**:
- Astro v5.0.0（静的サイトジェネレーター）
- TypeScript（型安全性）
- CSS Variables（テーマシステム）

**ツール**:
- pnpm（モノレポ管理）
- Vitest（テスト）
- Pagefind（全文検索）

**インフラ**:
- Cloudflare Pages（ホスティング）
- GitHub Actions（CI/CD）

---

## スライド18: プロジェクト構成

### モノレポ構造

```
libx-dev/
├── apps/              # アプリケーション
│   ├── demo-docs/
│   ├── sample-docs/
│   └── top-page/
├── packages/          # 共有パッケージ
│   ├── cli/          # CLIツール
│   ├── generator/    # サイトジェネレーター
│   ├── ui/           # UIコンポーネント
│   ├── theme/        # テーマシステム
│   └── i18n/         # 国際化
├── registry/         # レジストリファイル
└── scripts/          # ビルドスクリプト
```

---

## スライド19: ドキュメントの所在

### 完全なドキュメント体系

```
docs/new-generator-plan/
├── guides/               # 運用ガイド
│   ├── cli-operations.md
│   ├── build-deploy-operations.md
│   ├── troubleshooting.md  ← 今日作成！
│   ├── training-plan.md    ← 今日作成！
│   └── ...
├── status/               # 進捗レポート
└── phase-*.md           # フェーズ計画
```

**合計**: 20以上のガイドドキュメント（約20,000行）

---

## スライド20: このトレーニングで得られるもの

### 学習成果

✅ システム全体の理解

✅ CLIコマンドの実践的スキル

✅ コンテンツ管理の実務知識

✅ トラブルシューティング能力

✅ ベストプラクティスの習得

---

# システムアーキテクチャ

---

## スライド21: システムアーキテクチャ概要

### 3層構造

```
┌──────────────────────────────────────┐
│          CLI (packages/cli)          │ ← ユーザーインターフェース
├──────────────────────────────────────┤
│    Generator (packages/generator)    │ ← コア処理
├──────────────────────────────────────┤
│  UI/Theme (packages/ui, theme, i18n) │ ← 表示層
└──────────────────────────────────────┘
```

**責任の分離**: 各層が独立して進化可能

---

## スライド22: CLI層の役割

### コマンドラインインターフェース

**主なコマンド**:
- `docs-gen init` - 初期化
- `docs-gen add project/doc/version/language` - 追加
- `docs-gen update ...` - 更新
- `docs-gen remove ...` - 削除
- `docs-gen list` - 一覧表示
- `docs-gen validate` - レジストリ検証

**特徴**: 冪等性、ロールバック対応、詳細ログ

---

## スライド23: Generator層の役割

### レジストリ → Astroページ変換

**主な機能**:
- サイドバー生成
- サイトマップ生成
- ルーティング生成
- メタデータ抽出

**入力**: レジストリJSON

**出力**: Astroページ構造

---

## スライド24: UI/Theme層の役割

### 共有コンポーネントとテーマシステム

**UIパッケージ**:
- 30以上のAstroコンポーネント
- Starlightスタイル
- アクセシビリティ対応

**テーマパッケージ**:
- CSS Variables
- デザイントークン
- ダークモード対応

---

## スライド25: レジストリスキーマ

### レジストリの基本構造

```json
{
  "$schemaVersion": "0.0.1",
  "projects": [
    {
      "id": "demo-docs",
      "title": { "en": "Demo Docs", "ja": "デモドキュメント" },
      "versions": [
        {
          "id": "v1",
          "name": "Version 1",
          "status": "active",
          "isLatest": true
        }
      ],
      "documents": [...]
    }
  ]
}
```

---

## スライド26: ドキュメント定義

### documentフィールドの構造

```json
{
  "id": "getting-started",
  "slug": "getting-started",
  "title": {
    "en": "Getting Started",
    "ja": "はじめに"
  },
  "summary": {
    "en": "Quick start guide",
    "ja": "クイックスタートガイド"
  },
  "category": "guide",
  "visibility": "public",
  "translationStatus": {
    "en": "published",
    "ja": "published"
  }
}
```

---

## スライド27: 多言語フィールド

### Phase 4-1で統一されたスキーマ

**標準形式**: オブジェクト形式

```json
{
  "title": {
    "en": "Getting Started",
    "ja": "はじめに"
  }
}
```

**非推奨形式**: 文字列形式（後方互換性のみ）

```json
{
  "title": "Getting Started"
}
```

⚠️ **重要**: 新規作成時は必ずオブジェクト形式を使用

---

## スライド28: バージョン管理

### バージョンの概念

**バージョンとは**:
- プロダクトの特定のリリース（v1, v2, v3...）
- 各バージョンは独立したドキュメントセットを持つ

**バージョン属性**:
- `id`: バージョンID（例: "v1"）
- `name`: 表示名（例: "Version 1.0"）
- `status`: ステータス（active / deprecated / draft）
- `isLatest`: 最新バージョンフラグ

---

## スライド29: カテゴリー管理

### ドキュメントのグループ化

**カテゴリーの役割**:
- サイドバーでのグループ表示
- 検索フィルタ
- ナビゲーション構造

**カテゴリー定義**（レジストリ）:

```json
{
  "categories": {
    "guide": {
      "en": "Guides",
      "ja": "ガイド"
    },
    "api": {
      "en": "API Reference",
      "ja": "APIリファレンス"
    }
  }
}
```

---

## スライド30: 翻訳ステータス

### 翻訳管理の仕組み

**translationStatus**フィールド:

```json
{
  "translationStatus": {
    "en": "published",      # 公開済み
    "ja": "review",         # レビュー中
    "zh-Hans": "draft"      # 下書き
  }
}
```

**ステータス種別**:
- `draft`: 下書き
- `review`: レビュー中
- `published`: 公開済み

---

## スライド31: Visibility設定

### 公開制御

**visibilityフィールド**:

```json
{
  "visibility": "public"  # または "draft", "internal"
}
```

| 値 | 説明 | ビルド対象 |
|----|------|-----------|
| `public` | 一般公開 | ✅ Yes |
| `draft` | 下書き（社内のみ） | ❌ No |
| `internal` | 内部ドキュメント | ❌ No |

---

## スライド32: サイドバー生成

### Generatorの仕組み

**入力**: レジストリJSON

```json
{
  "documents": [
    { "id": "intro", "category": "guide", ... },
    { "id": "install", "category": "guide", ... }
  ]
}
```

**出力**: サイドバーJSON

```json
[
  {
    "label": "Guides",
    "items": [
      { "label": "Introduction", "href": "/v1/en/intro" },
      { "label": "Installation", "href": "/v1/en/install" }
    ]
  }
]
```

---

## スライド33: ルーティング構造

### URL設計

**URL構造**:

```
/[version]/[lang]/[...slug]
```

**具体例**:

```
/v1/en/getting-started/
/v1/ja/getting-started/
/v2/en/api/user/
```

**特徴**: バージョンファースト、言語セカンド

---

## スライド34: ビルドパイプライン

### 統合ビルドの流れ

```
1. 各アプリを個別にビルド
   ├─ demo-docs → apps/demo-docs/dist/
   ├─ sample-docs → apps/sample-docs/dist/
   └─ top-page → apps/top-page/dist/

2. 統合ビルドスクリプト実行
   └─ scripts/build-integrated.js

3. 統一dist/ディレクトリに配置
   └─ dist/
       ├─ index.html (top-page)
       └─ docs/
           ├─ demo-docs/
           └─ sample-docs/
```

---

## スライド35: Pagefind検索

### 全文検索の仕組み

**検索インデックス生成**:

```bash
# postbuildスクリプト（apps/demo-docs/package.json）
"postbuild": "pagefind --site dist --glob \"**/*.html\""
```

**生成されるファイル**:

```
dist/pagefind/
├── pagefind.js
├── pagefind-ui.css
├── pagefind-ui.js
└── index/
    └── *.pf_index
```

---

## スライド36: Pagefind設定

### カスタマイズ可能な設定

**pagefind.toml**:

```toml
# 除外セレクター
exclude_selectors = [
  "nav",
  "footer",
  ".sidebar"
]

# 除外パス
exclude = [
  "**/draft/**",
  "**/internal/**"
]
```

---

## スライド37: アクセシビリティ機能

### WCAG 2.1 AA準拠

✅ **スキップリンク**: メインコンテンツへジャンプ

✅ **ARIA属性**: スクリーンリーダー対応

✅ **キーボードナビゲーション**: Tabキーで操作可能

✅ **コントラスト比**: 4.5:1以上

✅ **セマンティックHTML**: 正しい見出し階層

---

## スライド38: パフォーマンス最適化

### Phase 4-1の成果

**Core Web Vitals**（sample-docs v1/en モバイル）:

- **FCP**: 0.9秒 ✅（目標1.8秒以下）
- **LCP**: 0.9秒 ✅（目標2.5秒以下）
- **TBT**: 0 ms 🌟（完璧）
- **CLS**: 0 🌟（完璧）

**最適化手法**:
- CSS/JS minify
- 画像WebP変換
- コード分割

---

## スライド39: CI/CD統合

### GitHub Actionsワークフロー

**自動化されるタスク**:

✅ Lint（ESLint、Prettier）

✅ テスト（Vitest、カバレッジ測定）

✅ Lighthouse測定

✅ ビルド検証

✅ デプロイ（Cloudflare Pages）

---

## スライド40: まとめ: システムアーキテクチャ

### 覚えておくべきポイント

✅ **レジストリ駆動**: すべてはJSONから始まる

✅ **3層構造**: CLI → Generator → UI/Theme

✅ **統合ビルド**: 1回のコマンドで完成

✅ **品質重視**: Lighthouse 100点、WCAG準拠

---

# CLI操作デモ

---

## スライド41: CLI概要

### docs-gen CLIツール

**インストール方法**:

```bash
# モノレポ内でグローバルインストール
cd packages/cli
pnpm link --global

# 確認
docs-gen --version
```

**基本構文**:

```bash
docs-gen <command> [options]
```

---

## スライド42: CLI基本コマンド一覧

### よく使うコマンド

| コマンド | 説明 |
|---------|------|
| `init` | 初期化 |
| `list` | プロジェクト/ドキュメント一覧 |
| `validate` | レジストリ検証 |
| `add project/doc/version/language` | 追加 |
| `update ...` | 更新 |
| `remove ...` | 削除 |

---

## スライド43: 共通オプション

### すべてのコマンドで使えるオプション

| オプション | 説明 |
|-----------|------|
| `--dry-run` | 実行せずに確認 |
| `--verbose` | 詳細ログ出力 |
| `--json` | JSON形式で出力 |
| `--yes` | 確認をスキップ |

**推奨**: 重要な操作では必ず `--dry-run` で事前確認！

---

## スライド44: docs-gen init

### 初期化コマンド

**用途**: 新規レジストリファイルの作成

```bash
# 対話形式で初期化
docs-gen init

# 自動生成（対話なし）
docs-gen init --yes
```

**生成されるファイル**:

```
registry/
└── my-project.json  # 新しいレジストリファイル
```

---

## スライド45: docs-gen list

### 一覧表示コマンド

**用途**: プロジェクト・ドキュメント一覧の確認

```bash
# すべてのプロジェクトを一覧表示
docs-gen list

# 特定プロジェクトのドキュメント一覧
docs-gen list --project demo-docs

# JSON形式で出力
docs-gen list --json
```

---

## スライド46: docs-gen validate

### レジストリ検証コマンド

**用途**: レジストリファイルのバリデーション

```bash
# すべてのレジストリを検証
docs-gen validate

# 特定プロジェクトのみ検証
docs-gen validate --project demo-docs

# 詳細ログ付き
docs-gen validate --verbose
```

**検証内容**:
- JSONスキーマ準拠
- 必須フィールドの存在
- ID重複チェック

---

## スライド47: docs-gen add project

### プロジェクト追加

**用途**: 新規プロジェクトの作成

```bash
# 対話形式
docs-gen add project

# コマンドライン引数で指定
docs-gen add project \
  --id my-docs \
  --title-en "My Documentation" \
  --title-ja "私のドキュメント"
```

**作成されるファイル**:
- `registry/my-docs.json`
- `apps/my-docs/` ディレクトリ構造

---

## スライド48: docs-gen add doc

### ドキュメント追加

**用途**: 新規ドキュメントの追加

```bash
# 対話形式
docs-gen add doc

# 引数指定
docs-gen add doc \
  --project demo-docs \
  --id getting-started \
  --title-en "Getting Started" \
  --title-ja "はじめに" \
  --category guide
```

**作成されるファイル**:
- レジストリへのエントリ追加
- `apps/demo-docs/src/content/docs/v1/en/getting-started.mdx`
- `apps/demo-docs/src/content/docs/v1/ja/getting-started.mdx`

---

## スライド49: docs-gen add version

### バージョン追加

**用途**: 新規バージョンの作成

```bash
# 対話形式
docs-gen add version

# 引数指定
docs-gen add version \
  --project demo-docs \
  --id v2 \
  --name "Version 2.0" \
  --status active
```

**結果**:
- レジストリにバージョンエントリ追加
- ディレクトリ `v2/` 作成

---

## スライド50: docs-gen add language

### 言語追加

**用途**: 新規言語サポートの追加

```bash
# 対話形式
docs-gen add language

# 引数指定
docs-gen add language \
  --project demo-docs \
  --lang ko \
  --template-lang en
```

**結果**:
- レジストリに言語エントリ追加
- 英語版からテンプレートコピー
- 翻訳ステータス `draft` で初期化

---

## スライド51: docs-gen update project

### プロジェクト更新

**用途**: プロジェクトメタデータの更新

```bash
# 対話形式
docs-gen update project

# 引数指定
docs-gen update project \
  --id demo-docs \
  --title-ja "デモドキュメント（更新版）"
```

---

## スライド52: docs-gen update doc

### ドキュメント更新

**用途**: ドキュメントメタデータの更新

```bash
# 対話形式
docs-gen update doc

# 引数指定
docs-gen update doc \
  --project demo-docs \
  --id getting-started \
  --title-ja "はじめに（改訂版）" \
  --translation-status-ja published
```

---

## スライド53: docs-gen remove project

### プロジェクト削除

**用途**: プロジェクトの削除

⚠️ **警告**: この操作は元に戻せません

```bash
# 対話形式（確認あり）
docs-gen remove project

# 引数指定
docs-gen remove project \
  --id demo-docs \
  --yes  # 確認をスキップ（注意！）
```

**削除されるファイル**:
- `registry/demo-docs.json`
- `apps/demo-docs/` ディレクトリ

**自動バックアップ**: `.backups/` に保存されます

---

## スライド54: docs-gen remove doc

### ドキュメント削除

**用途**: ドキュメントの削除

```bash
# 対話形式
docs-gen remove doc

# 引数指定
docs-gen remove doc \
  --project demo-docs \
  --id getting-started
```

---

## スライド55: バックアップ・リストア

### 安全な運用のために

**自動バックアップ**:
- すべての変更前に自動バックアップ作成
- 保存先: `.backups/registry-<project>-<timestamp>.json`

**手動バックアップ**:

```bash
# バックアップ作成
cp registry/demo-docs.json .backups/registry-demo-docs-manual-$(date +%Y%m%d%H%M%S).json
```

**リストア**:

```bash
# 最新のバックアップから復元
cp .backups/registry-demo-docs-20251025120000.json registry/demo-docs.json
```

---

## スライド56: --dry-runオプションの重要性

### 実行前に必ず確認

**使用例**:

```bash
# ドキュメント削除を事前確認
docs-gen remove doc \
  --project demo-docs \
  --id getting-started \
  --dry-run
```

**出力例**:

```
[DRY RUN] Would remove document:
  Project: demo-docs
  Document ID: getting-started
  Files to delete:
    - apps/demo-docs/src/content/docs/v1/en/getting-started.mdx
    - apps/demo-docs/src/content/docs/v1/ja/getting-started.mdx
```

---

## スライド57: --verboseオプション

### 詳細ログで問題を追跡

**使用例**:

```bash
# 詳細ログ付きでバリデーション
docs-gen validate --verbose
```

**出力例**:

```
[DEBUG] Loading registry: registry/demo-docs.json
[DEBUG] Validating schema version: 0.0.1
[DEBUG] Validating projects: 1 found
[DEBUG] Validating project: demo-docs
[DEBUG] Validating versions: 1 found
[DEBUG] Validating documents: 5 found
[INFO] ✅ Validation successful
```

---

## スライド58: CLIエラーハンドリング

### エラーメッセージの読み方

**エラー例**:

```
Error: Validation failed for project 'demo-docs'
- Document ID 'getting-started' already exists
- Required field 'summary' is missing in document 'intro'
```

**解決手順**:
1. エラーメッセージを全文記録
2. `--verbose`で詳細確認
3. トラブルシューティングガイド参照
4. （必要に応じて）エスカレーション

---

## スライド59: CLIベストプラクティス

### 安全な運用のために

✅ **重要な操作前に --dry-run**

✅ **定期的なバックアップ**（週次推奨）

✅ **Git経由でレジストリをバージョン管理**

✅ **手動編集は最小限に**（CLIを優先）

✅ **バリデーションを習慣化**

---

## スライド60: CLIチートシート

### よく使うコマンド

```bash
# 初期化
docs-gen init

# 一覧表示
docs-gen list --project demo-docs

# バリデーション
docs-gen validate --verbose

# ドキュメント追加
docs-gen add doc --dry-run

# ドキュメント更新
docs-gen update doc --id getting-started

# ドキュメント削除（注意！）
docs-gen remove doc --id old-doc --dry-run
```

---

## スライド61: 実践例: 新規プロジェクト作成

### ステップバイステップ

```bash
# 1. プロジェクト作成
docs-gen add project \
  --id api-docs \
  --title-en "API Documentation" \
  --title-ja "API文書"

# 2. バージョン追加
docs-gen add version \
  --project api-docs \
  --id v1 \
  --name "Version 1.0"

# 3. ドキュメント追加
docs-gen add doc \
  --project api-docs \
  --id intro \
  --title-en "Introduction"

# 4. ビルド
cd apps/api-docs
pnpm build
```

---

## スライド62: 実践例: 翻訳追加

### 既存ドキュメントに日本語版を追加

```bash
# 1. 言語追加
docs-gen add language \
  --project demo-docs \
  --lang ja \
  --template-lang en

# 2. 翻訳ファイルを編集
vim apps/demo-docs/src/content/docs/v1/ja/getting-started.mdx

# 3. 翻訳ステータスを更新
docs-gen update doc \
  --project demo-docs \
  --id getting-started \
  --translation-status-ja review

# 4. レビュー後に公開
docs-gen update doc \
  --id getting-started \
  --translation-status-ja published
```

---

## スライド63: 実践例: 旧バージョンの非推奨化

### バージョンステータスの変更

```bash
# 1. 現在のバージョン確認
docs-gen list --project demo-docs

# 2. v1を非推奨化
docs-gen update version \
  --project demo-docs \
  --id v1 \
  --status deprecated \
  --is-latest false

# 3. v2を最新に設定
docs-gen update version \
  --project demo-docs \
  --id v2 \
  --status active \
  --is-latest true

# 4. 確認
docs-gen list --project demo-docs --json
```

---

## スライド64: トラブルシューティング: CLIコマンドが見つからない

### 症状と解決策

**症状**:

```
Command 'docs-gen' not found
```

**原因**: CLIがグローバルインストールされていない

**解決策**:

```bash
# 1. CLIパッケージに移動
cd packages/cli

# 2. グローバルインストール
pnpm link --global

# 3. 確認
which docs-gen
docs-gen --version
```

---

## スライド65: まとめ: CLI操作

### 覚えておくべきポイント

✅ **基本コマンド**: init, list, validate, add, update, remove

✅ **安全な操作**: --dry-run で事前確認

✅ **詳細ログ**: --verbose でトラブル追跡

✅ **バックアップ**: 自動バックアップは .backups/ に保存

---

# コンテンツ管理

---

## スライド66: コンテンツ管理の全体像

### レジストリ + MDXファイル

```
registry/demo-docs.json  ← メタデータ
         ↓
apps/demo-docs/src/content/docs/
  └─ v1/
      ├─ en/
      │   └─ getting-started.mdx  ← コンテンツ
      └─ ja/
          └─ getting-started.mdx  ← 翻訳
```

---

## スライド67: レジストリの編集方法

### 2つのアプローチ

**方法1**: CLI経由（推奨）

```bash
docs-gen add doc --project demo-docs --id intro
```

**方法2**: 手動編集

```bash
vim registry/demo-docs.json
```

⚠️ **注意**: 手動編集後は必ず `docs-gen validate` を実行

---

## スライド68: MDXファイルの構造

### フロントマター + Markdown

```mdx
---
title: Getting Started
summary: Quick start guide
---

# Getting Started

This is the content...

## Installation

```bash
pnpm install
```

## Usage

...
```

---

## スライド69: フロントマターフィールド

### 必須フィールドと推奨フィールド

**必須**:
- `title`: ページタイトル
- `summary`: 短い説明

**推奨**:
- `description`: メタディスクリプション
- `keywords`: SEOキーワード
- `lastModified`: 最終更新日

**オプション**:
- `author`: 著者名
- `tags`: タグ

---

## スライド70: Markdown記法の確認

### よく使う記法

```markdown
# 見出し1
## 見出し2
### 見出し3

**太字**
*斜体*

- 箇条書き
- 項目2

1. 番号付きリスト
2. 項目2

[リンク](https://example.com)

![画像](./image.png)

`コード`

```bash
コードブロック
```
```

---

## スライド71: Astroコンポーネントの使用

### 共有コンポーネントをMDX内で利用

```mdx
---
title: Advanced Usage
---

import { Card, Button } from '@docs/ui';

# Advanced Usage

<Card title="Important Note">
  This is a callout card.
</Card>

<Button href="/next-page">
  Next Page
</Button>
```

---

## スライド72: よく使うAstroコンポーネント

### @docs/uiパッケージより

| コンポーネント | 用途 |
|--------------|------|
| `<Card>` | 情報カード |
| `<Button>` | ボタン |
| `<Tabs>` | タブ切替 |
| `<CodeBlock>` | コードブロック |
| `<Callout>` | 注意書き |
| `<Steps>` | ステップ表示 |

**詳細**: [UIコンポーネントガイド](../../packages/ui/README.md)

---

## スライド73: 翻訳ワークフロー

### 英語 → 日本語の流れ

```
1. 英語版作成
   └─ apps/demo-docs/src/content/docs/v1/en/intro.mdx

2. 日本語版テンプレート作成
   └─ docs-gen add language --lang ja

3. 翻訳
   └─ apps/demo-docs/src/content/docs/v1/ja/intro.mdx

4. 翻訳ステータス更新
   └─ docs-gen update doc --translation-status-ja review

5. レビュー・公開
   └─ docs-gen update doc --translation-status-ja published
```

---

## スライド74: 翻訳時の注意点

### 品質を保つために

✅ **一貫性**: 用語集を活用

✅ **文脈**: 機械翻訳のみに頼らない

✅ **レイアウト**: コードブロックやリンクを壊さない

✅ **レビュー**: 必ず第三者によるレビュー

---

## スライド75: 機械翻訳 vs 人力翻訳

### 使い分けの基準

| 用途 | 推奨方法 |
|------|---------|
| **初稿作成** | 機械翻訳（DeepL、Google Translate） |
| **技術用語** | 人力翻訳 + 用語集 |
| **重要ページ** | 人力翻訳 |
| **大量の更新** | 機械翻訳 + 人力レビュー |

---

## スライド76: Git連携

### ブランチ戦略

```
main
 ├─ feature/add-api-docs       # 新機能
 ├─ fix/typo-in-getting-started  # バグ修正
 └─ translate/ja-api-docs        # 翻訳
```

**推奨フロー**:
1. 機能ブランチ作成
2. コミット
3. プルリクエスト
4. レビュー
5. マージ

---

## スライド77: プルリクエストのベストプラクティス

### レビュー可能なPRとは

✅ **小さく分割**: 1PR = 1機能

✅ **明確なタイトル**: "Add: API documentation for /users endpoint"

✅ **説明文**: 何を変更したか、なぜ変更したか

✅ **スクリーンショット**: UI変更時は必ず添付

✅ **チェックリスト**: テスト、ビルド、Lighthouseスコア確認

---

## スライド78: レビュープロセス

### コンテンツレビューのポイント

**技術的正確性**:
- コマンド、コード例が正しいか
- リンクが有効か

**言語品質**:
- 文法、誤字脱字
- 一貫性（用語統一）

**アクセシビリティ**:
- 画像にalt属性があるか
- 見出し階層が正しいか

---

## スライド79: カテゴリー設計

### サイドバー構造を考える

**推奨カテゴリー構造**:

```
Guides
├─ Getting Started
├─ Installation
└─ Configuration

API Reference
├─ Authentication
├─ Users
└─ Projects

Tutorials
├─ Build Your First App
└─ Deploy to Production
```

**ポイント**: 階層は3レベルまで

---

## スライド80: ドキュメント命名規則

### 一貫性のある命名

**ファイル名**:
- 小文字、ハイフン区切り: `getting-started.mdx`
- 拡張子は `.mdx`（Markdown + JSX）

**ドキュメントID**:
- 小文字、ハイフン区切り: `getting-started`
- スラッグと同じにする（推奨）

---

## スライド81: 画像管理

### 画像ファイルの配置

**推奨配置**:

```
apps/demo-docs/src/images/
└─ v1/
    └─ en/
        ├─ getting-started-screenshot.png
        └─ architecture-diagram.svg
```

**画像最適化**:
- WebP形式推奨
- サイズ: 1MB以下
- Alt属性必須

---

## スライド82: メタディスクリプションの書き方

### SEO対策

**良い例**:

```mdx
---
description: "Learn how to install and configure the new documentation generator. Step-by-step guide with code examples."
---
```

**ポイント**:
- 120-160文字
- キーワードを含める
- 行動を促す表現

---

## スライド83: 内部リンクの作り方

### 相対パスと絶対パス

**相対パス**（推奨）:

```markdown
[Installation Guide](./installation)
[API Reference](../api/users)
```

**絶対パス**:

```markdown
[Installation Guide](/v1/en/guide/installation)
```

**アンカーリンク**:

```markdown
[Jump to Configuration](#configuration)
```

---

## スライド84: 外部リンク

### 新しいタブで開く

```markdown
[Astro Documentation](https://astro.build/docs) ← 新しいタブで開きたい
```

**Astroコンポーネントを使用**:

```mdx
<a href="https://astro.build/docs" target="_blank" rel="noopener noreferrer">
  Astro Documentation
</a>
```

---

## スライド85: コードブロックのシンタックスハイライト

### 言語指定

````markdown
```bash
pnpm install
```

```typescript
const greeting: string = "Hello, World!";
console.log(greeting);
```

```json
{
  "name": "demo-docs",
  "version": "1.0.0"
}
```
````

---

## スライド86: コードブロックのベストプラクティス

### 読みやすいコード例

✅ **簡潔**: 必要最小限のコード

✅ **動作確認済み**: コピー&ペーストで動く

✅ **コメント**: 複雑な箇所は説明を追加

✅ **出力例**: 実行結果も示す

---

## スライド87: よくある間違い

### 避けるべきパターン

❌ **リンク切れ**: ビルド前にリンクチェック

❌ **画像の巨大サイズ**: 1MB以下に最適化

❌ **見出し階層のスキップ**: h1 → h3（h2なし）

❌ **コードブロックの言語指定なし**: シンタックスハイライトが効かない

---

## スライド88: コンテンツチェックリスト

### 公開前の確認項目

- [ ] フロントマターの必須フィールドを記入
- [ ] 画像にalt属性を追加
- [ ] 内部リンクが有効
- [ ] コードブロックが動作確認済み
- [ ] 誤字脱字をチェック
- [ ] メタディスクリプションを記入
- [ ] 翻訳ステータスを更新

---

## スライド89: ドキュメントのライフサイクル

### draft → review → published

```
1. draft（下書き）
   └─ 執筆中、社内のみ閲覧

2. review（レビュー中）
   └─ レビュアーが確認

3. published（公開済み）
   └─ 一般公開

4. deprecated（非推奨）
   └─ 旧バージョン
```

---

## スライド90: まとめ: コンテンツ管理

### 覚えておくべきポイント

✅ **レジストリ + MDX**: メタデータとコンテンツを分離

✅ **翻訳ワークフロー**: 英語 → テンプレート → 翻訳 → レビュー → 公開

✅ **Git連携**: ブランチ戦略とプルリクエスト

✅ **品質チェック**: コンテンツチェックリスト活用

---

# ビルド・デプロイ

---

## スライド91: ビルドシステム概要

### ローカルビルド vs 統合ビルド

**ローカルビルド**:

```bash
cd apps/demo-docs
pnpm build
```

**統合ビルド**:

```bash
# モノレポルートで実行
pnpm build
```

**違い**: 統合ビルドはすべてのアプリをビルドして `dist/` に統合

---

## スライド92: ビルドコマンド一覧

### よく使うコマンド

| コマンド | 用途 |
|---------|------|
| `pnpm build` | 統合ビルド |
| `pnpm build:local` | ローカルビルド（ベースパスなし） |
| `pnpm build:separate` | 個別ビルド（統合なし） |
| `pnpm preview` | プレビューサーバー起動 |

---

## スライド93: ビルド出力の確認

### distディレクトリ構造

```
dist/
├── index.html          ← top-page
├── _astro/             ← 共通アセット
│   ├── *.css
│   └── *.js
└── docs/
    ├── demo-docs/
    │   └── v1/
    │       ├── en/
    │       └── ja/
    └── sample-docs/
        ├── v1/
        └── v2/
```

---

## スライド94: プレビューサーバー

### ローカルで確認

```bash
# ビルド
pnpm build

# プレビューサーバー起動
pnpm preview

# ブラウザで確認
open http://localhost:4321
```

**ポート番号**: デフォルト4321（変更可能）

---

## スライド95: Cloudflare Pages概要

### ホスティングサービス

**特徴**:
- 静的サイトホスティング
- グローバルCDN
- 自動HTTPS
- プレビューURL（ブランチごと）

**料金**: 無料プラン（500ビルド/月、100GB帯域幅/月）

---

## スライド96: Cloudflare Pages設定

### 必要な設定項目

**ビルド設定**:

| 項目 | 値 |
|------|---|
| **Build command** | `pnpm build` |
| **Build output directory** | `dist` |
| **Node version** | `18` |

**環境変数**:

| 変数名 | 値 |
|--------|---|
| `NODE_VERSION` | `18` |
| `PNPM_VERSION` | `8` |

---

## スライド97: デプロイフロー

### 自動デプロイの流れ

```
1. GitHubへプッシュ
   └→ git push origin main

2. GitHub Actionsトリガー
   └→ CI/CDパイプライン実行

3. ビルド
   └→ pnpm build

4. テスト
   └→ pnpm test, Lighthouse測定

5. デプロイ
   └→ Cloudflare Pages

6. 確認
   └→ https://your-project.pages.dev
```

---

## スライド98: デプロイ前チェックリスト

### 必ず確認すること

- [ ] ローカルビルドが成功
- [ ] 全テストが成功
- [ ] レジストリバリデーションが成功
- [ ] Lighthouseスコアが基準値以上
- [ ] 画像が最適化されている
- [ ] メタディスクリプションが記入されている
- [ ] バックアップを作成

---

## スライド99: CI/CDパイプライン

### GitHub Actionsワークフロー

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
      - run: lighthouse (省略)
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
```

---

## スライド100: ステージング環境

### プレビューデプロイ

**用途**: 本番デプロイ前の確認

```
# ブランチ作成
git checkout -b feature/new-doc

# プッシュ
git push origin feature/new-doc
```

**結果**: 自動的にプレビューURLが生成される

```
https://feature-new-doc.your-project.pages.dev
```

---

## スライド101: ロールバック手順

### 緊急時の対応

**手順**:

```bash
# 1. 直前のコミットを確認
git log --oneline -5

# 2. 特定のコミットにリバート
git revert <commit-hash>

# 3. プッシュ（自動デプロイ）
git push origin main
```

**Cloudflare Pages管理画面**:
- デプロイ履歴から以前のバージョンを選択
- "Rollback to this deployment" をクリック

---

## スライド102: モニタリング

### デプロイ後の確認

**確認項目**:
- ✅ サイトが正常に表示される
- ✅ ページロード時間が許容範囲内
- ✅ 検索機能が動作する
- ✅ 言語切替が動作する
- ✅ エラーログに異常がない

**ツール**:
- Cloudflare Analytics
- Google Search Console
- Lighthouse CI

---

## スライド103: パフォーマンスモニタリング

### 継続的な品質維持

**Lighthouse CI**:
- PR作成時に自動測定
- スコア閾値を下回ったらCIが失敗

**閾値設定**:

| カテゴリ | 閾値 |
|---------|------|
| Performance | 90以上 |
| Accessibility | 95以上 |
| Best Practices | 90以上 |
| SEO | 90以上 |

---

## スライド104: トラブルシューティング: ビルド失敗

### よくある原因

1. **依存関係エラー**: `pnpm install` を実行
2. **レジストリスキーマエラー**: `docs-gen validate` で確認
3. **TypeScriptコンパイルエラー**: 型定義を確認
4. **メモリ不足**: `NODE_OPTIONS="--max-old-space-size=4096"`

**詳細**: [トラブルシューティングガイド](./troubleshooting.md)

---

## スライド105: まとめ: ビルド・デプロイ

### 覚えておくべきポイント

✅ **ローカル確認**: `pnpm build` → `pnpm preview`

✅ **自動デプロイ**: GitHubプッシュ → GitHub Actions → Cloudflare Pages

✅ **ステージング**: ブランチごとにプレビューURL生成

✅ **ロールバック**: Git revert またはCloudflare管理画面

---

# トラブルシューティング

---

## スライド106: トラブルシューティングの基本

### 問題解決の5ステップ

1. **エラーメッセージ確認**: 全文を記録
2. **環境確認**: Node.js、pnpmバージョン
3. **クリーンビルド**: `rm -rf node_modules && pnpm install`
4. **詳細ログ**: `--verbose`オプション
5. **ガイド参照**: [トラブルシューティングガイド](./troubleshooting.md)

---

## スライド107: よくあるエラー1: レジストリスキーマエラー

### 症状

```
Error: Registry validation failed: Invalid schema version
Error: Required field "summary" is missing
```

### 解決策

```bash
# 1. スキーマバージョン確認
cat registry/demo-docs.json | jq '.$schemaVersion'

# 2. バリデーション実行
docs-gen validate --verbose

# 3. 必須フィールドを追加
# summary, descriptionは多言語オブジェクト形式で記入
```

---

## スライド108: よくあるエラー2: 依存関係エラー

### 症状

```
Error: Cannot find module '@docs/ui'
ENOENT: no such file or directory
```

### 解決策

```bash
# 1. クリーンインストール
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 2. 共有パッケージをビルド
cd packages/ui && pnpm build
cd packages/generator && pnpm build
```

---

## スライド109: よくあるエラー3: Pagefindインデックス生成失敗

### 症状

```
Error: Pagefind indexing failed
Error: No HTML files found to index
```

### 解決策

```bash
# 1. postbuildスクリプト確認
cat apps/demo-docs/package.json | grep postbuild

# 2. 手動でPagefind実行
cd apps/demo-docs
pnpm exec pagefind --site dist --glob "**/*.html"

# 3. インデックス確認
ls -la dist/pagefind/
```

---

## スライド110: よくあるエラー4: Lighthouseスコア低下

### 症状

```
Lighthouse Performance: 70点（目標90点）
```

### 解決策

```bash
# 1. Lighthouseレポート確認
lighthouse http://localhost:4321/docs/demo-docs/v1/en/ \
  --output=html \
  --output-path=./report.html

# 2. 原因特定（画像、CSS/JSサイズ等）

# 3. 最適化実施
# - 画像をWebP変換
# - CSS/JS minify
# - コード分割
```

---

## スライド111: よくあるエラー5: 翻訳表示エラー

### 症状

```
日本語版でも英語が表示される
```

### 解決策

```bash
# 1. レジストリの多言語フィールド確認
cat registry/demo-docs.json | jq '.projects[].documents[].title'

# 2. オブジェクト形式に変更
# "title": "Getting Started" ← 文字列形式（古い）
# ↓
# "title": { "en": "Getting Started", "ja": "はじめに" }

# 3. バリデーションとビルド
docs-gen validate
pnpm build
```

---

## スライド112: エスカレーション基準

### いつエスカレーションすべきか

**即座にエスカレーション**:
- 本番環境でビルドが失敗
- データ損失の可能性
- セキュリティインシデント

**8時間以内にエスカレーション**:
- ガイドに記載のない問題
- 複数の問題が連鎖
- ユーザーへの影響が大きい

---

## スライド113: エスカレーション手順

### 準備する情報

1. **エラーメッセージ**: 全文をコピー
2. **再現手順**: ステップバイステップ
3. **試した解決策**: 何を試したか
4. **影響範囲**: ユーザー数、プロジェクト数
5. **緊急度**: Low / Medium / High / Critical

**連絡先**: Slack #docs-support または テックリード

---

## スライド114: 予防策

### トラブルを未然に防ぐ

✅ **定期的なバリデーション**: 週次で `docs-gen validate`

✅ **バックアップ**: レジストリを週次でバックアップ

✅ **Git管理**: すべての変更をGitでバージョン管理

✅ **CI/CD**: 自動テストとLighthouse測定

✅ **ドキュメント参照**: トラブルシューティングガイドを定期的に確認

---

## スライド115: まとめ: トラブルシューティング

### 覚えておくべきポイント

✅ **5ステップ**: エラー確認 → 環境確認 → クリーンビルド → 詳細ログ → ガイド参照

✅ **よくあるエラー**: レジストリ、依存関係、Pagefind、Lighthouse、翻訳

✅ **エスカレーション**: 重大な問題は速やかに報告

✅ **予防策**: 定期的なバリデーション、バックアップ、Git管理

---

# ベストプラクティス

---

## スライド116: アクセシビリティの重要性

### すべてのユーザーのために

**WCAG 2.1 AA基準**: 国際的なアクセシビリティ標準

**対象ユーザー**:
- 視覚障害者（スクリーンリーダー使用）
- 運動障害者（キーボードのみ使用）
- 色覚多様性（色のみに依存しない）
- 高齢者（コントラスト比、文字サイズ）

---

## スライド117: アクセシビリティチェックリスト

### 実装時の確認項目

- [ ] スキップリンク実装
- [ ] ARIA属性の適切な使用
- [ ] 画像にalt属性
- [ ] 見出し階層が正しい（h1 → h2 → h3）
- [ ] コントラスト比 4.5:1以上
- [ ] キーボードナビゲーション可能
- [ ] フォーカススタイル明確

---

## スライド118: スキップリンクの実装

### Phase 4-2で追加

```astro
<body>
  <a href="#main-content" class="skip-link">
    メインコンテンツへスキップ
  </a>

  <main id="main-content">
    <slot />
  </main>
</body>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  /* ... */
}

.skip-link:focus {
  top: 0;
}
</style>
```

---

## スライド119: ARIA属性の使用

### セマンティックHTMLを補完

```html
<!-- ナビゲーション -->
<nav aria-label="メインナビゲーション">
  <ul>...</ul>
</nav>

<!-- サイドバー -->
<aside aria-label="サイドバーナビゲーション">
  ...
</aside>

<!-- 検索 -->
<form role="search" aria-label="サイト内検索">
  <input type="search" aria-label="検索キーワード">
</form>
```

---

## スライド120: パフォーマンス最適化

### Lighthouse 100点への道

**最適化手法**:
1. **画像最適化**: WebP変換、サイズ圧縮
2. **CSS/JS minify**: ビルド時に自動化
3. **コード分割**: 動的インポート
4. **プリロード**: 重要リソースを優先読み込み
5. **キャッシュ**: Cloudflare CDN活用

---

## スライド121: Core Web Vitals

### Googleの品質指標

| 指標 | 目標値 | 説明 |
|------|--------|------|
| **FCP** | 1.8秒以下 | 最初のコンテンツ描画 |
| **LCP** | 2.5秒以下 | 最大コンテンツ描画 |
| **TBT** | 200ms以下 | 総ブロッキング時間 |
| **CLS** | 0.1以下 | 累積レイアウトシフト |

**Phase 4-1の成果**: 全指標で目標達成！

---

## スライド122: 画像最適化

### ベストプラクティス

**推奨形式**: WebP

**推奨サイズ**: 1MB以下

**変換方法**:

```bash
# cwebpで変換
cwebp -q 80 input.png -o output.webp

# Astro Imageコンポーネント使用
```

```astro
<Image
  src={myImage}
  alt="説明"
  format="webp"
  quality={80}
/>
```

---

## スライド123: SEOベストプラクティス

### 検索エンジン最適化

**メタタグ**:

```html
<meta name="description" content="120-160文字の説明">
<meta property="og:title" content="ページタイトル">
<meta property="og:description" content="説明">
<meta property="og:image" content="画像URL">
```

**構造化データ**:

```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Getting Started",
  "description": "Quick start guide",
  "author": {...}
}
```

---

## スライド124: 命名規則

### 一貫性のあるコード

**ファイル名**:
- 小文字、ハイフン区切り: `getting-started.mdx`

**コンポーネント名**:
- パスカルケース: `MyComponent.astro`

**変数名**:
- キャメルケース: `myVariable`

**定数名**:
- 大文字、アンダースコア区切り: `MY_CONSTANT`

---

## スライド125: ディレクトリ構造

### 整理されたプロジェクト

```
apps/demo-docs/
├── src/
│   ├── components/       # アプリ固有のコンポーネント
│   ├── content/
│   │   └── docs/        # MDXコンテンツ
│   ├── layouts/         # レイアウト
│   ├── pages/           # Astroページ
│   └── images/          # 画像
├── public/              # 静的ファイル
└── astro.config.mjs     # Astro設定
```

---

## スライド126: Git管理のベストプラクティス

### 効率的なバージョン管理

✅ **小さいコミット**: 1コミット = 1変更

✅ **明確なコミットメッセージ**:

```
add: API documentation for /users endpoint
fix: typo in getting-started guide
update: Lighthouse threshold to 95
```

✅ **ブランチ戦略**: feature/ fix/ translate/

✅ **プルリクエスト**: レビュー必須

---

## スライド127: セキュリティベストプラクティス

### 安全な運用

✅ **シークレット管理**: 環境変数、.envファイル

✅ **依存関係更新**: 定期的に `pnpm update`

✅ **権限管理**: 最小権限の原則

✅ **バックアップ**: レジストリとコンテンツ

✅ **アクセスログ**: Cloudflare Analyticsで監視

---

## スライド128: ドキュメントの保守

### 最新状態を維持

✅ **定期レビュー**: 四半期ごとに内容確認

✅ **リンクチェック**: CI/CDで自動化

✅ **スクリーンショット更新**: UI変更時

✅ **バージョン管理**: 旧バージョンを非推奨化

✅ **フィードバック収集**: ユーザーからの意見を反映

---

## スライド129: チームコラボレーション

### 効率的な協働

✅ **コミュニケーション**: Slack #docs-support

✅ **知識共有**: 週次ミーティング、ドキュメント更新

✅ **レビュー文化**: 建設的なフィードバック

✅ **オフィスアワー**: 週1回の質問対応時間

✅ **トレーニング**: 定期的なリフレッシュトレーニング

---

## スライド130: まとめ: ベストプラクティス

### 覚えておくべきポイント

✅ **アクセシビリティ**: WCAG 2.1 AA基準遵守

✅ **パフォーマンス**: Lighthouse 100点目標

✅ **SEO**: メタタグ、構造化データ

✅ **命名規則**: 一貫性のあるコード

✅ **Git管理**: 小さいコミット、明確なメッセージ

---

# Thank You!

## ご参加ありがとうございました

**質問**: Slack #docs-support

**オフィスアワー**: 毎週木曜 14:00-15:00

**資料**: 社内ポータル / GitHub

**録画**: 本日のセッションは録画されています

---

**次のステップ**: ハンズオン演習を開始してください！
