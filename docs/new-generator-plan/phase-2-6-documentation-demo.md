# フェーズ2-6：ドキュメント／デモ詳細計画

**最終更新**: 2025-10-20
**ステータス**: 🚧 **進行中（約18%完了）**

## 目的
- フェーズ2で実装したランタイム・UI・検索・ビルドフローを可視化し、ステークホルダーへの共有および次フェーズ作業者への引き継ぎを円滑にする。
- 実際の動作サンプルを準備してユーザーテストやレビューを実施し、残課題と改善点を洗い出す。

## スコープ
- サンプルサイト（デモ用プロジェクト）の構築とデプロイ。
- スクリーンショット／動画キャプチャ／ウォークスルー資料の作成。
- ガイドドキュメント（runtime, search, build, UI）の公開とリンク整備。

## 進捗サマリー

| タスク | 状態 | 達成率 | 備考 |
|-------|------|--------|------|
| タスク1: デモプロジェクト準備 | 🚧 進行中 | 80% | ビルド統合に課題あり |
| タスク2: デモサイトデプロイ | ⏸️ 未着手 | 0% | 次回セッションで実施 |
| タスク3: 資料作成 | ⏸️ 未着手 | 0% | 次回セッションで実施 |
| タスク4: レビューとフィードバック収集 | ⏸️ 未着手 | 0% | 次回セッションで実施 |
| タスク5: ドキュメント公開 | 🚧 進行中 | 10% | 進捗レポート作成済み |

**全体進捗**: 約18%（1/5タスク完了、1タスク80%完了）

**関連ドキュメント**: [Phase 2-6進捗状況レポート](status/phase-2-6-progress-report.md)

## タスク

### タスク1: デモプロジェクト準備 🚧 **80%完了**

**目的**: Phase 2の成果を盛り込んだサンプルプロジェクトを作成し、共有パッケージの活用を実証する。

#### ✅ 完了した作業

1. **サンプルレジストリ作成**
   - ✅ [registry/demo-docs.json](../../registry/demo-docs.json) 作成完了（231行）
   - ✅ 6ドキュメント、3言語（en, ja, ko）、3カテゴリ定義
   - ✅ 用語集（glossaryTerms）2件追加

2. **デモコンテンツ作成**
   - ✅ 英語版: 6ページ（guide/getting-started, installation, configuration, api/components, utilities, examples/basic-usage）
   - ✅ 日本語版: 3ページ（guide/getting-started, installation, configuration）
   - ✅ 韓国語版: 2ページ（guide/getting-started, installation）
   - ✅ 合計: 11 MDXファイル作成（約38,000文字）
   - ✅ 共有パッケージの使用例を含むコンテンツ

3. **レジストリスキーマ統合**
   - ✅ demo-docsを既存のdocs.jsonに統合
   - ✅ 既存スキーマ形式への変換完了（scripts/fix-demo-docs-schema.js）
   - ✅ バックアップファイル作成（docs.json.backup, docs.json.backup2）

#### 🚧 進行中の作業

4. **ビルドテスト**
   - 🚧 demo-docsプロジェクトのビルド統合中
   - ⚠️ **課題**: content.pathの解決に関する問題
   - 既存プロジェクト（test-verification, sample-docs, libx-docs）はビルド成功

#### ⏸️ 未完了の作業

5. **Lighthouseスコア確認**
   - ⏸️ demo-docsビルド成功後に実施予定

**成果物**:
- ✅ registry/demo-docs.json（231行）
- ✅ 11 MDXファイル（約38,000文字）
- ✅ レジストリ統合スクリプト（3件）
- ⏸️ demo-docsビルド成功とLighthouseスコア

---

### タスク2: デモサイトデプロイ ⏸️ **未着手**

**目的**: ステージング環境を構築し、デモサイトを公開する。

#### 📋 実施予定の作業

1. **Cloudflare Pages設定**
   - wrangler.toml作成
   - デプロイスクリプト追加

2. **GitHub Actions設定**
   - .github/workflows/deploy-demo.yml作成
   - demoブランチから自動デプロイ

3. **アクセスポリシー設定**
   - Cloudflare Access設定
   - ステークホルダー限定公開

**成果物**:
- ⏸️ wrangler.toml
- ⏸️ .github/workflows/deploy-demo.yml
- ⏸️ デモサイトURL
- ⏸️ アクセスガイド

---

### タスク3: 資料作成 ⏸️ **未着手**

**目的**: Phase 2の成果を視覚的に示す資料を作成する。

#### 📋 実施予定の作業

1. **スクリーンショット作成**
   - トップページ、サイドバー、検索、バージョン切り替え等（10枚以上）
   - Playwrightスクリプトで自動化

2. **動画キャプチャ作成**
   - 検索デモ、バージョン切り替えデモ、言語切り替えデモ、レスポンシブデザインデモ（4本）

3. **ウォークスルー資料作成**
   - docs/new-generator-plan/demos/walkthrough.md
   - 主要機能の説明と画像

4. **アーキテクチャ図更新**
   - docs/new-generator-plan/architecture.md
   - Mermaid図でシステム全体を可視化

**成果物**:
- ⏸️ スクリーンショット（10枚以上）
- ⏸️ 動画キャプチャ（4本）
- ⏸️ ウォークスルー資料（walkthrough.md）
- ⏸️ アーキテクチャ図（architecture.md）

---

### タスク4: レビューとフィードバック収集 ⏸️ **未着手**

**目的**: ステークホルダーにデモを提示し、フィードバックを収集する。

#### 📋 実施予定の作業

1. **レビュー計画作成**
   - 参加者リスト（コンテンツチーム、QAチーム、翻訳担当、プロジェクトマネージャー）
   - レビュー項目（UI/UX、パフォーマンス、アクセシビリティ、多言語対応、コンテンツ構造）

2. **フィードバックフォーム作成**
   - Google Forms / TypeForm
   - 評価項目（1-5点評価 + コメント）

3. **フィードバック集計とIssue化**
   - 集計スプレッドシート作成
   - GitHubラベル定義（phase-3, phase-4, phase-5, priority-high/medium/low）
   - Issueテンプレート作成

**成果物**:
- ⏸️ レビュー計画
- ⏸️ フィードバックフォーム
- ⏸️ フィードバック集計（スプレッドシート）
- ⏸️ Issue一覧（GitHub Issues）

---

### タスク5: ドキュメント公開 🚧 **10%完了**

**目的**: Phase 2の成果をドキュメント化し、公開する。

#### ✅ 完了した作業

1. **Phase 2-6進捗レポート作成**
   - ✅ [docs/new-generator-plan/status/phase-2-6-progress-report.md](status/phase-2-6-progress-report.md) 作成
   - ✅ 完了した作業、技術的な課題、次回の推奨タスクを文書化

#### ⏸️ 未完了の作業

2. **ガイドドキュメントリンク集作成**
   - ⏸️ docs/new-generator-plan/README.md更新

3. **DECISIONS.md更新**
   - ⏸️ Phase 2成果のハイライト追記

4. **アーキテクチャ図公開**
   - ⏸️ docs/new-generator-plan/architecture.md

5. **Phase 2-6完了報告書作成**
   - ⏸️ 実装内容、成果物、次フェーズへの引き継ぎ事項

**成果物**:
- ✅ Phase 2-6進捗レポート
- ⏸️ ガイドドキュメントリンク集（README.md更新）
- ⏸️ DECISIONS.md更新
- ⏸️ アーキテクチャ図公開
- ⏸️ Phase 2-6完了報告書

## 成果物
- デモサイト URL とアクセスガイド。
- スクリーンショット／動画／アーキテクチャ図。
- ドキュメントリンク集、ウォークスルー資料。
- フィードバック集計と課題リスト。

## 完了条件

### 必須項目

- [ ] **デモサイト稼働**
  - [ ] demo-docsプロジェクトがビルド成功
  - [ ] Lighthouseスコアが維持されている（Performance 100, Accessibility 91以上）
  - [ ] 主要なユースケース（検索、ナビゲーション、ビルド結果）が確認できる

- [ ] **資料整備**
  - [ ] スクリーンショット・動画が整備されている
  - [ ] ウォークスルー資料が作成されている
  - [ ] アーキテクチャ図が更新されている

- [ ] **フィードバック収集**
  - [ ] レビュー参加者がフィードバックを記録している
  - [ ] フィードバックが集計されている
  - [ ] 課題がIssue化されている

- [ ] **ドキュメント公開**
  - [ ] ガイドドキュメントリンク集が作成されている
  - [ ] DECISIONS.mdが更新されている
  - [ ] Phase 2-6完了報告書が作成されている

### 推奨項目

- [ ] **自動化**
  - [ ] スクリーンショット自動撮影スクリプト
  - [ ] デプロイ自動化（GitHub Actions）

- [ ] **アクセス制御**
  - [ ] Cloudflare Access設定
  - [ ] ステークホルダー限定公開

---

## 🚧 技術的な課題

### 課題1: demo-docsビルド問題（優先度: 高）

**問題**:
- content.pathの形式が既存プロジェクトと異なる
- generateRoutesでdemo-docsのルートが生成されていない
- shouldBuildPage関数でslugがundefinedになる

**詳細**:
- 既存プロジェクト: `"content/frontmatter/ja.mdx"`（相対パス）
- demo-docs: `"demo-docs/v1/en/guide/getting-started.mdx"`（プロジェクト相対パス）
- 実際のファイル: `"packages/runtime/src/content/docs/demo-docs/v1/en/guide/getting-started.mdx"`

**ビルドエラー**:
```
Cannot read properties of undefined (reading 'toLowerCase')
  at shouldBuildPage (file:///.../packages/runtime/dist/assets/_...Bba4ZASZ.js:87:43)
```

**次のステップ**:
1. generatorパッケージのcontent.path解決ロジックを確認
2. demo-docsのcontent.pathを既存の形式に統一
3. または、新しい形式をサポートするようgeneratorを更新

---

## 🎯 次回セッションの推奨タスク

### 優先度: 高 🔥

1. **demo-docsビルド問題の解決**（想定時間: 2-3時間）
   - [ ] generatorパッケージのcontent.path解決ロジックを確認
   - [ ] packages/generator/src/routing.tsのshouldBuildPage関数を修正
   - [ ] demo-docsのルート生成をデバッグ
   - [ ] ビルドテスト成功確認
   - [ ] Lighthouseスコア測定（Performance 100, Accessibility 91以上）

2. **デモサイトデプロイ設定**（想定時間: 1-2時間）
   - [ ] wrangler.toml作成
   - [ ] package.jsonにデプロイスクリプト追加
   - [ ] GitHub Actions設定（.github/workflows/deploy-demo.yml）
   - [ ] demoブランチ作成とデプロイテスト

### 優先度: 中 ⚡

3. **資料作成**（想定時間: 3-4時間）
   - [ ] スクリーンショット作成スクリプト実装（Playwright）
   - [ ] スクリーンショット撮影（10枚以上）
   - [ ] ウォークスルー資料作成（docs/new-generator-plan/demos/walkthrough.md）
   - [ ] アーキテクチャ図作成（Mermaid、docs/new-generator-plan/architecture.md）
   - [ ] 動画キャプチャ作成（4本、オプション）

### 優先度: 低 📝

4. **フィードバック収集計画**（想定時間: 1時間）
   - [ ] レビュー項目リスト作成
   - [ ] フィードバックフォームテンプレート作成
   - [ ] GitHubラベル定義
   - [ ] Issueテンプレート作成

5. **ドキュメント公開**（想定時間: 2時間）
   - [ ] README.md更新（ガイドリンク集）
   - [ ] DECISIONS.md更新（Phase 2成果のハイライト）
   - [ ] architecture.md公開
   - [ ] Phase 2-6完了報告書作成

---

## 📊 想定スケジュール

| セッション | タスク | 想定時間 | 成果物 |
|----------|-------|---------|--------|
| **セッション1**（完了） | タスク1（80%）、タスク5（10%） | 4時間 | レジストリ、MDXコンテンツ、進捗レポート |
| **セッション2**（次回） | タスク1完了、タスク2 | 3-5時間 | ビルド成功、デプロイ設定 |
| **セッション3** | タスク3 | 3-4時間 | 資料、スクリーンショット、図 |
| **セッション4** | タスク4、タスク5完了 | 3時間 | フィードバック、完了報告書 |

**想定合計時間**: 13-16時間

---

## 📁 ファイル構成

### 作成済みファイル

```
/Users/dolphilia/github/libx-dev/
├── registry/
│   ├── demo-docs.json                    # ✅ デモレジストリ（231行）
│   ├── docs.json                         # ✅ 統合レジストリ（demo-docs含む）
│   ├── docs.json.backup                  # ✅ バックアップ1
│   └── docs.json.backup2                 # ✅ バックアップ2
├── packages/runtime/src/content/docs/demo-docs/
│   └── v1/
│       ├── en/
│       │   ├── guide/
│       │   │   ├── getting-started.mdx   # ✅ 3,835文字
│       │   │   ├── installation.mdx      # ✅ 4,432文字
│       │   │   └── configuration.mdx     # ✅ 6,858文字
│       │   ├── api/
│       │   │   ├── components.mdx        # ✅ 約6,000文字
│       │   │   └── utilities.mdx         # ✅ 約5,000文字
│       │   └── examples/
│       │       └── basic-usage.mdx       # ✅ 約8,000文字
│       ├── ja/
│       │   └── guide/
│       │       ├── getting-started.mdx   # ✅ 約2,800文字
│       │       ├── installation.mdx      # ✅ 約2,200文字
│       │       └── configuration.mdx     # ✅ 約3,000文字
│       └── ko/
│           └── guide/
│               ├── getting-started.mdx   # ✅ 約2,500文字
│               └── installation.mdx      # ✅ 約2,500文字
├── scripts/
│   ├── add-demo-to-registry.js           # ✅ demo-docs統合スクリプト
│   ├── fix-demo-docs-schema.js           # ✅ スキーマ変換スクリプト
│   └── check-demo-docs.cjs               # ✅ 確認スクリプト
└── docs/new-generator-plan/
    ├── phase-2-6-documentation-demo.md   # ✅ 本ドキュメント（更新済み）
    └── status/
        └── phase-2-6-progress-report.md  # ✅ 進捗レポート
```

### 作成予定ファイル

```
/Users/dolphilia/github/libx-dev/
├── wrangler.toml                         # ⏸️ Cloudflare Pages設定
├── .github/workflows/
│   └── deploy-demo.yml                   # ⏸️ GitHub Actions設定
├── scripts/
│   └── capture-screenshots.js            # ⏸️ スクリーンショット作成スクリプト
└── docs/new-generator-plan/
    ├── architecture.md                   # ⏸️ アーキテクチャ図
    ├── demos/
    │   ├── walkthrough.md                # ⏸️ ウォークスルー資料
    │   ├── screenshots/                  # ⏸️ スクリーンショット（10枚以上）
    │   └── videos/                       # ⏸️ 動画キャプチャ（4本）
    └── status/
        └── phase-2-6-completion-report.md # ⏸️ 完了報告書
```

---

## 成果物（更新）

### 完了した成果物

- ✅ デモレジストリ（registry/demo-docs.json、231行）
- ✅ デモコンテンツ（11 MDXファイル、約38,000文字、3言語）
- ✅ レジストリ統合スクリプト（3件）
- ✅ Phase 2-6進捗レポート

### 未完了の成果物

- ⏸️ demo-docsビルド成功
- ⏸️ Lighthouseスコア測定結果
- ⏸️ デプロイ設定（wrangler.toml、GitHub Actions）
- ⏸️ スクリーンショット（10枚以上）
- ⏸️ 動画キャプチャ（4本）
- ⏸️ ウォークスルー資料
- ⏸️ アーキテクチャ図
- ⏸️ フィードバック収集計画
- ⏸️ ガイドドキュメントリンク集
- ⏸️ Phase 2-6完了報告書

---

**最終更新**: 2025-10-20
**次回更新予定**: demo-docsビルド問題解決後 
