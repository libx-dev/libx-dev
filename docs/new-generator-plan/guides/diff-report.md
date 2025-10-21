# 差分レポートガイド

**作成日**: 2025-10-21
**最終更新**: 2025-10-21
**Phase**: 3-6（ドキュメント整備）

---

## 📋 目次

1. [概要](#概要)
2. [差分レポートの種類](#差分レポートの種類)
3. [Artifactからのレポート取得](#artifactからのレポート取得)
4. [レポートの見方](#レポートの見方)
5. [レビュープロセス](#レビュープロセス)
6. [レビュー結果記録テンプレート](#レビュー結果記録テンプレート)
7. [トラブルシューティング](#トラブルシューティング)

---

## 概要

差分レポートは、既存プロジェクトから新レジストリ形式への変換時に生成される**変更内容の詳細レポート**です。

### 目的

- 変換前後の差分を視覚的に確認
- データ損失や意図しない変更を防止
- 移行作業の透明性を確保
- レビュー・承認プロセスの効率化

### 対象読者

- **移行作業担当者**: 変換結果の確認
- **レビュー担当者**: 差分レポートのレビュー
- **テックリード**: 承認判断
- **QA担当者**: 品質確認

### レポートの生成タイミング

差分レポートは、以下のタイミングで自動生成されます：

1. **Migration Workflow実行時**（GitHub Actions）
   - Dry-run実行時
   - 本番実行時

2. **ローカルでのmigrate-from-libx実行時**
   ```bash
   pnpm exec docs-cli migrate-from-libx \
     --source apps/sample-docs \
     --project-id sample-docs \
     --dry-run
   ```

---

## 差分レポートの種類

Phase 3-2で実装した差分レポート機能は、3種類の形式を提供します。

### 1. HTML形式（視覚的レビュー用）

**ファイル**: `compatibility-report.html`

**用途**:
- ステークホルダーへの共有
- 視覚的な確認
- プレゼンテーション

**特徴**:
- ✅ カラーコーディングされた差分表示
- ✅ 統計グラフ（追加/変更/削除の割合）
- ✅ クリック可能な目次
- ✅ ブラウザで簡単に閲覧可能

**例**:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Compatibility Report - project-template</title>
  <style>
    .added { background-color: #d4edda; color: #155724; }
    .changed { background-color: #fff3cd; color: #856404; }
    .deleted { background-color: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <h1>Compatibility Report</h1>
  <section>
    <h2>Summary</h2>
    <ul>
      <li>Added: 15 items (🟢 緑色)</li>
      <li>Changed: 3 items (🟡 黄色)</li>
      <li>Deleted: 0 items (🔴 赤色)</li>
    </ul>
  </section>
  ...
</body>
</html>
```

---

### 2. CSV形式（表計算ソフト用）

**ファイル**: `compatibility-report.csv`

**用途**:
- フィルタリング・ソート
- 集計・分析
- Excel/Google Sheetsでの加工

**特徴**:
- ✅ 表計算ソフトで開ける
- ✅ 柔軟なフィルタリング
- ✅ カスタム集計が可能

**例**:
```csv
ProjectID,DocumentID,Type,Field,OldValue,NewValue,Severity
sample-docs,getting-started,added,docId,,getting-started,info
sample-docs,getting-started,changed,title,Getting Started,はじめに,warning
sample-docs,api-reference,deleted,content,...,, error
```

**活用例**:
```
# Excelで開く
1. compatibility-report.csvをダブルクリック
2. オートフィルターを有効化
3. 「Type」列で"deleted"をフィルタ → 削除項目のみ表示
4. 「Severity」列で"error"をフィルタ → 重大な問題のみ表示
```

---

### 3. JSON形式（機械可読）

**ファイル**: `compatibility-report.json`

**用途**:
- CI/自動化での処理
- スクリプトでの解析
- 他ツールとの連携

**特徴**:
- ✅ 完全な差分情報
- ✅ メタデータ付き
- ✅ プログラムで処理可能

**例**:
```json
{
  "projectId": "sample-docs",
  "timestamp": "2025-10-22T12:00:00Z",
  "summary": {
    "added": 15,
    "changed": 3,
    "deleted": 0
  },
  "diffs": [
    {
      "documentId": "getting-started",
      "type": "added",
      "field": "docId",
      "oldValue": null,
      "newValue": "getting-started",
      "severity": "info"
    }
  ]
}
```

**活用例**:
```bash
# jqで重大な差分のみ抽出
cat compatibility-report.json | jq '.diffs[] | select(.severity=="error")'

# 削除項目の数をカウント
cat compatibility-report.json | jq '.diffs[] | select(.type=="deleted")' | wc -l
```

---

## Artifactからのレポート取得

GitHub Actions Migration Workflowを使用した場合、レポートはArtifactsとして保存されます。

### 1. GitHub Actionsから取得

#### ステップ1: Actionsタブを開く

1. GitHubリポジトリのトップページ
2. 上部の「**Actions**」タブをクリック

#### ステップ2: Migration Workflowの実行履歴を選択

1. 左サイドバーから「**Migration Workflow**」を選択
2. 実行履歴から該当の実行をクリック
   - 実行日時で判別
   - プロジェクト名が表示される

#### ステップ3: Artifactsセクションからダウンロード

実行詳細ページの下部に「**Artifacts**」セクションがあります。

**利用可能なArtifacts**:

| Artifact名 | 保持期間 | 内容 |
|-----------|---------|------|
| `migration-reports` | 30日（推奨: 60日） | 移行レポート（チェックリスト、互換性レポート） |
| `compat-check-log` | 7日 | 互換性チェックログ（テキスト） |
| `build-logs-new-cli` | 7日 | ビルドログ、バックアップ（本番実行時のみ） |
| `build-logs-compat` | 7日 | ビルドログ、バックアップ（compatモード時のみ） |

#### ステップ4: ダウンロードと解凍

1. Artifact名をクリックしてダウンロード（ZIP形式）
2. ダウンロードしたZIPファイルを解凍
3. 以下のファイルが含まれます：

**migration-reports**:
```
migration-reports-YYYYMMDD/
├── migration-checklist.md      # 移行チェックリスト
├── compatibility-report.html   # HTML形式レポート
├── compatibility-report.json   # JSON形式レポート
└── compatibility-report.csv    # CSV形式レポート
```

---

### 2. Artifactの保持期間設定

デフォルトの保持期間は短いため、Phase 3期間中は延長を推奨します。

#### 保持期間の延長方法

`.github/workflows/migration.yml`を編集:

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: migration-reports
    retention-days: 60  # 30日 → 60日に延長
```

#### 重要なレポートのバックアップ

```bash
# ローカルにも保存（推奨）
mkdir -p docs/migration-artifacts/

# Artifactをダウンロードして保存
# GitHub > Actions > Download > 解凍
mv migration-reports-YYYYMMDD docs/migration-artifacts/
```

---

## レポートの見方

### HTML形式レポートの見方

HTML形式レポートは、ブラウザで開いて視覚的に確認できます。

#### セクション1: サマリー

```html
## Summary

- Total Diffs: 18
- Added: 15 (🟢 緑色)
- Changed: 3 (🟡 黄色)
- Deleted: 0 (🔴 赤色)
```

**確認ポイント**:
- ✅ `Deleted`が0であることを確認（データ損失なし）
- ⚠️ `Changed`の内容を確認（意図した変更か）
- ✅ `Added`は新規追加項目（期待通りか確認）

#### セクション2: 差分詳細

```html
## Diffs

### Document: getting-started

- [🟢 Added] docId: getting-started
- [🟢 Added] slug: /guide/getting-started
- [🟡 Changed] title: "Getting Started" → "はじめに"
```

**カラーコーディング**:
- 🟢 **緑色（Added）**: 新規追加されたフィールド
- 🟡 **黄色（Changed）**: 変更されたフィールド
- 🔴 **赤色（Deleted）**: 削除されたフィールド

**重大度（Severity）**:
- `info`: 情報（問題なし）
- `warning`: 警告（確認推奨）
- `error`: エラー（要修正）

#### セクション3: 統計グラフ（将来的）

```html
## Statistics

<canvas id="diffChart"></canvas>
<!-- 追加・変更・削除の割合を円グラフで表示 -->
```

---

### CSV形式レポートの見方

CSV形式レポートは、ExcelやGoogle Sheetsで開いて分析できます。

#### 列の説明

| 列名 | 説明 | 例 |
|-----|------|---|
| `ProjectID` | プロジェクトID | `sample-docs` |
| `DocumentID` | ドキュメントID | `getting-started` |
| `Type` | 差分種別 | `added`, `changed`, `deleted` |
| `Field` | フィールド名 | `title`, `docId`, `content.ja.status` |
| `OldValue` | 変更前の値 | `"Getting Started"` |
| `NewValue` | 変更後の値 | `"はじめに"` |
| `Severity` | 重大度 | `info`, `warning`, `error` |

#### フィルタリング例

**例1: 削除項目のみ表示**
```
1. Excelで開く
2. オートフィルター有効化
3. 「Type」列で"deleted"を選択
→ 削除された項目のみ表示
```

**例2: 重大な問題のみ表示**
```
1. 「Severity」列で"error"を選択
→ エラーレベルの差分のみ表示
```

**例3: 特定ドキュメントのみ表示**
```
1. 「DocumentID」列で"api-reference"を選択
→ api-referenceドキュメントの差分のみ表示
```

---

### JSON形式レポートの見方

JSON形式レポートは、jqコマンドやスクリプトで解析できます。

#### jqコマンドでの解析例

**例1: 削除項目のみ抽出**
```bash
cat compatibility-report.json | jq '.diffs[] | select(.type=="deleted")'
```

**例2: エラーレベルの差分のみ抽出**
```bash
cat compatibility-report.json | jq '.diffs[] | select(.severity=="error")'
```

**例3: ドキュメント別の差分数を集計**
```bash
cat compatibility-report.json | jq '[.diffs[] | .documentId] | group_by(.) | map({document: .[0], count: length})'
```

**例4: 変更されたフィールドの一覧**
```bash
cat compatibility-report.json | jq '.diffs[] | select(.type=="changed") | .field' | sort | uniq
```

---

## レビュープロセス

差分レポートのレビューは、以下のプロセスで実施します。

### ステップ1: 差分レポート取得

```bash
# GitHub ActionsのArtifactsからダウンロード
# Artifacts > migration-reports > ダウンロード

# 解凍
unzip migration-reports-YYYYMMDD.zip -d migration-reports-YYYYMMDD/
```

---

### ステップ2: 重大差分の確認

#### 2.1. サマリーの確認

HTML形式レポートを開き、サマリーを確認:

```html
## Summary

- Total Diffs: 18
- Added: 15
- Changed: 3
- Deleted: 0  ← 0であることを確認
```

**確認ポイント**:
- ✅ `Deleted`が0か？（データ損失なし）
- ⚠️ `Changed`が想定内か？
- ✅ `Added`が期待通りか？

#### 2.2. 削除項目の確認（最優先）

🔴 **赤色（Deleted）** の項目を確認:

```bash
# CSV形式でフィルタリング
# Excelで開く > Type列で"deleted"を選択

# またはjqで確認
cat compatibility-report.json | jq '.diffs[] | select(.type=="deleted")'
```

**確認事項**:
- 削除されたフィールドは意図的か？
- データが失われていないか？
- 代替フィールドが追加されているか？

#### 2.3. 変更項目の確認

🟡 **黄色（Changed）** の項目を確認:

```bash
# CSV形式でフィルタリング
# Type列で"changed"を選択

# またはjqで確認
cat compatibility-report.json | jq '.diffs[] | select(.type=="changed")'
```

**確認事項**:
- 変更内容が意図的か？
- 翻訳や設定の変更が正しいか？
- バージョン情報の変更が適切か？

#### 2.4. 追加項目の確認

🟢 **緑色（Added）** の項目を確認:

```bash
# CSV形式でフィルタリング
# Type列で"added"を選択

# またはjqで確認
cat compatibility-report.json | jq '.diffs[] | select(.type=="added")'
```

**確認事項**:
- 追加されたフィールドが期待通りか？
- 新レジストリ形式で必要なフィールドか？
- 値が正しく設定されているか？

---

### ステップ3: 詳細レビュー

#### 3.1. プロジェクト情報の確認

```json
{
  "id": "sample-docs",
  "name": {
    "en": "Sample Documentation",
    "ja": "サンプルドキュメント"
  },
  "description": {
    "en": "Sample documentation for demonstration",
    "ja": "デモンストレーション用のサンプルドキュメント"
  }
}
```

**確認ポイント**:
- ✅ プロジェクトID（`id`）が正しいか
- ✅ 名前（`name`）が各言語で正しいか
- ✅ 説明（`description`）が適切か

#### 3.2. 言語設定の確認

```json
{
  "languages": [
    {
      "code": "en",
      "label": "English",
      "default": true
    },
    {
      "code": "ja",
      "label": "日本語",
      "default": false
    }
  ]
}
```

**確認ポイント**:
- ✅ 言語数が一致するか
- ✅ 各言語のラベルが正しいか
- ✅ デフォルト言語が正しく設定されているか

#### 3.3. バージョン設定の確認

```json
{
  "versions": [
    {
      "id": "v1",
      "label": "v1.0",
      "default": false
    },
    {
      "id": "v2",
      "label": "v2.0",
      "default": true
    }
  ]
}
```

**確認ポイント**:
- ✅ バージョン数が一致するか
- ✅ 各バージョンのラベルが正しいか
- ✅ デフォルトバージョンが正しく設定されているか

#### 3.4. カテゴリ・ドキュメント構造の確認

```json
{
  "categories": [
    {
      "id": "guide",
      "order": 1,
      "name": { "en": "Guide", "ja": "ガイド" }
    }
  ],
  "documents": [
    {
      "docId": "getting-started",
      "categoryId": "guide",
      "order": 1,
      "slug": "/guide/getting-started"
    }
  ]
}
```

**確認ポイント**:
- ✅ カテゴリ数が一致するか
- ✅ ドキュメント数が想定通りか
- ✅ `order`が正しく設定されているか
- ✅ `slug`が適切か

#### 3.5. コンテンツメタ情報の確認

```json
{
  "content": {
    "en": {
      "status": "published",
      "lastUpdated": "2025-10-21",
      "syncHash": "abc123...",
      "wordCount": 500
    },
    "ja": {
      "status": "published",
      "lastUpdated": "2025-10-20",
      "syncHash": "def456...",
      "wordCount": 450
    }
  }
}
```

**確認ポイント**:
- ✅ `status`が適切か（`published`, `draft`, `missing`）
- ✅ `lastUpdated`が最新か
- ✅ `syncHash`が設定されているか
- ✅ `wordCount`が妥当か

#### 3.6. ライセンス情報の確認

```json
{
  "licensing": {
    "sources": [
      {
        "id": "original-docs",
        "name": "Original Documentation",
        "author": "Original Author",
        "license": "MIT",
        "licenseUrl": "https://example.com/LICENSE",
        "sourceUrl": "https://example.com/docs"
      }
    ]
  }
}
```

**確認ポイント**:
- ✅ ライセンス情報が正しいか
- ✅ 原文サイトのURLが正しいか
- ✅ 翻訳ライセンスが設定されているか（必要な場合）

---

### ステップ4: 承認/却下判断

#### 承認基準

以下の条件をすべて満たす場合、承認します：

- ✅ `Deleted`が0、またはすべて意図的な削除
- ✅ `Changed`がすべて意図的な変更
- ✅ `Added`が期待通り
- ✅ プロジェクト情報が正しい
- ✅ 言語設定が正しい
- ✅ バージョン設定が正しい
- ✅ カテゴリ・ドキュメント構造が正しい
- ✅ コンテンツメタ情報が適切
- ✅ ライセンス情報が正しい

#### 却下基準

以下のいずれかに該当する場合、却下します：

- ❌ 意図しない`Deleted`がある
- ❌ 重大な`Changed`（データ損失につながる）
- ❌ プロジェクト情報が不正確
- ❌ 言語設定やバージョン設定が間違っている
- ❌ 重要なフィールドが欠けている
- ❌ ライセンス情報が不足している

---

### ステップ5: レビュー結果の記録

レビュー結果を記録します（次のセクションのテンプレートを使用）。

---

## レビュー結果記録テンプレート

### テンプレート（Markdown形式）

```markdown
# 差分レポート レビュー結果

## プロジェクト: [project-id]
## レビュー日: 2025-XX-XX
## レビュー担当者: [担当者名]

---

## 差分レポート情報

**Artifact**: migration-reports-YYYYMMDD.zip
**ダウンロード日**: 2025-XX-XX
**レポートファイル**:
- migration-checklist.md
- compatibility-report.html
- compatibility-report.json
- compatibility-report.csv

---

## サマリー

**Total Diffs**: XX
- **Added**: XX items (🟢 緑色)
- **Changed**: XX items (🟡 黄色)
- **Deleted**: XX items (🔴 赤色)

---

## レビュー結果

### 重大差分の確認

- [ ] `Deleted`が0、またはすべて意図的
- [ ] `Changed`がすべて意図的
- [ ] `Added`が期待通り

**コメント**:
（具体的なコメント）

---

### 詳細レビュー

#### プロジェクト情報
- [ ] プロジェクトIDが正しい
- [ ] 名前が各言語で正しい
- [ ] 説明が適切

**コメント**:
（具体的なコメント）

#### 言語設定
- [ ] 言語数が一致
- [ ] 各言語のラベルが正しい
- [ ] デフォルト言語が正しい

**コメント**:
（具体的なコメント）

#### バージョン設定
- [ ] バージョン数が一致
- [ ] 各バージョンのラベルが正しい
- [ ] デフォルトバージョンが正しい

**コメント**:
（具体的なコメント）

#### カテゴリ・ドキュメント構造
- [ ] カテゴリ数が一致
- [ ] ドキュメント数が想定通り
- [ ] `order`が正しい
- [ ] `slug`が適切

**コメント**:
（具体的なコメント）

#### コンテンツメタ情報
- [ ] `status`が適切
- [ ] `lastUpdated`が最新
- [ ] `syncHash`が設定されている
- [ ] `wordCount`が妥当

**コメント**:
（具体的なコメント）

#### ライセンス情報
- [ ] ライセンス情報が正しい
- [ ] 原文サイトのURLが正しい
- [ ] 翻訳ライセンスが設定されている（必要な場合）

**コメント**:
（具体的なコメント）

---

## 承認/却下

**判定**: ✅ 承認 / ❌ 却下

**理由**:
（判定の理由を記載）

---

## 次のアクション

**承認の場合**:
- [ ] ステップ5（デプロイフェーズ）へ進む
- [ ] サイドバー生成
- [ ] ビルドテスト
- [ ] デプロイテスト

**却下の場合**:
- [ ] 問題の修正
- [ ] 再度Dry-run実行
- [ ] 再レビュー

**具体的なアクション**:
（必要な作業を記載）

---

## 添付ファイル

- [ ] compatibility-report.html
- [ ] compatibility-report.json
- [ ] compatibility-report.csv
- [ ] スクリーンショット（必要な場合）

---

**作成日**: 2025-XX-XX
**作成者**: [担当者名]
```

---

### テンプレートの保存場所

```bash
# 移行ダッシュボードに記録
# docs/new-generator-plan/status/migration-dashboard.md

# または週次レポートに記録
# docs/new-generator-plan/status/migration-weekly-YYYYMMDD.md
```

---

## トラブルシューティング

### Q1: Artifactが見つかりません

**原因**: 保持期間が過ぎた、または実行が失敗した

**解決方法**:
1. 実行履歴を確認（Actionsタブ）
2. 保持期間内か確認（migration-reports: 30日、compat-check-log: 7日）
3. ローカルの`.backups/`ディレクトリを確認

**参照**: [FAQ - Q14: Artifactが見つかりません](./migration-faq.md#q14-artifactが見つかりません)

---

### Q2: HTMLレポートが開けません

**原因**: ブラウザのセキュリティ設定、ファイルが破損

**解決方法**:
```bash
# 別のブラウザで試す
# Chrome, Firefox, Safari など

# ファイルサイズを確認
ls -lh compatibility-report.html

# ファイルが空でないか確認
cat compatibility-report.html | wc -l
```

---

### Q3: CSV形式で文字化けします

**原因**: 文字エンコーディングの問題

**解決方法**:
```bash
# UTF-8で開く（Excel）
# データ > テキストファイル > エンコーディング: UTF-8

# またはGoogle Sheetsで開く
# ファイル > インポート > エンコーディング: UTF-8
```

---

### Q4: JSON形式が読めません

**原因**: JSON構文エラー、jqがインストールされていない

**解決方法**:
```bash
# jqがインストールされているか確認
which jq

# インストール（macOS）
brew install jq

# JSON構文チェック
cat compatibility-report.json | jq '.'
```

---

## 更新履歴

| 日付 | 更新者 | 変更内容 |
|-----|--------|---------|
| 2025-10-21 | Claude Code | 初版作成（Phase 3-6タスク2） |

---

## 関連ドキュメント

- [マイグレーション手順書](./migration.md) - 移行手順の全体像
- [FAQ/トラブルシューティング](./migration-faq.md) - よくある問題と解決方法
- [移行ダッシュボード](../status/migration-dashboard.md) - レビューステータス管理
- [データ移行ガイド](./migration-data.md) - データ変換の詳細

---

**最終更新**: 2025-10-21
**作成者**: Claude Code (AI Assistant)
