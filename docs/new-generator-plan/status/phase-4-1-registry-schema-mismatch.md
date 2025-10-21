# Phase 4-1 緊急問題報告: レジストリスキーマ不一致

**報告日**: 2025-10-21
**発見者**: Claude Code (AI Assistant)
**優先度**: 🔴 Critical
**影響範囲**: demo-docs ビルドブロッカー、Phase 4-1 QAテスト全体

---

## エグゼクティブサマリー

Phase 4-1のQA環境セットアップ中に、**レジストリスキーマとgeneratorパッケージの間で致命的な不一致**が発見されました。この問題により、demo-docsプロジェクトのビルドが失敗し、Phase 4-1のQAテスト全体がブロックされています。

### 問題の本質

**2つの異なるレジストリスキーマ**が混在しており、generatorパッケージが期待する形式と実際のレジストリの形式が一致していません：

1. **公式スキーマ** (`registry/schema/document.schema.json`): `versions: string[]`（配列）
2. **demo-docsレジストリ** (`registry/demo-docs.json`): `versionId: string`（単一値）

---

## 詳細分析

### 1. 公式スキーマの定義

**ファイル**: `registry/schema/document.schema.json`

```json
{
  "versions": {
    "type": "array",
    "description": "対応バージョン ID。最低1件必要。",
    "items": {
      "$ref": "./partials/common.schema.json#/$defs/versionId"
    },
    "minItems": 1,
    "uniqueItems": true
  }
}
```

**特徴**:
- ドキュメントは複数のバージョンに対応可能
- 配列形式で管理
- 最低1件必須

### 2. generatorパッケージの期待値

**ファイル**: `packages/generator/src/types.ts` (line 59-76)

```typescript
export interface Document {
  id: string;
  slug: string;
  title: LocalizedString;
  summary: LocalizedString;
  versions: string[];  // ← 配列を期待
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'internal' | 'draft';
  keywords: string[];
  tags: string[];
  content: {
    [lang: string]: ContentEntry;
  };
  license: string;
  related?: string[];
  contributors?: string[];
  order?: number;
}
```

**ファイル**: `packages/generator/src/routing.ts` (line 140)

```typescript
// ドキュメントが対応しているバージョンのみ処理
const docVersions = versions.filter((v) => doc.versions.includes(v));
//                                         ^^^^^^^^^^^^^^^^^^^^^^^^
//                                         doc.versionsが配列であることを前提
```

### 3. demo-docsレジストリの実際の形式

**ファイル**: `registry/demo-docs.json`

```json
{
  "documents": [
    {
      "docId": "getting-started",
      "projectId": "demo-docs",
      "versionId": "v1",           // ← 単一値（配列ではない）
      "categoryId": "guide",
      "order": 1,
      "slug": "getting-started",
      "title": { ... },
      "description": { ... },
      "visibility": "public"
    }
  ]
}
```

**問題点**:
- `versionId`（単一値）を使用
- `versions`（配列）ではない
- フィールド名も異なる（`docId`、`categoryId`など）

### 4. 既存レジストリ（docs.json）の形式

**ファイル**: `registry/docs.json`

```json
{
  "documents": [
    {
      "id": "getting-started",
      "slug": "getting-started",
      "title": { ... },
      "summary": { ... },
      "versions": ["v1", "v2"],    // ← 配列形式（公式スキーマに準拠）
      "status": "published",
      "visibility": "public",
      "keywords": [...],
      "tags": [...],
      "content": { ... }
    }
  ]
}
```

**特徴**:
- 公式スキーマに準拠
- generatorパッケージが正しく動作する

---

## 根本原因の分析

### タイムライン

1. **Phase 1**: レジストリスキーマ定義（`registry/schema/`）
   - 公式スキーマで`versions: string[]`を定義

2. **Phase 2**: generatorパッケージ実装
   - 公式スキーマに基づいて実装
   - `doc.versions.includes(v)`を使用

3. **Phase 2-6**: demo-docsプロジェクト作成
   - **異なる形式**でレジストリを手動作成
   - `versionId: string`を使用
   - スキーマ検証を実施せずに作成

4. **Phase 4-1**: QA環境セットアップ
   - demo-docsのビルドを試行
   - **スキーマ不一致を発見**

### 原因の推定

**Phase 2-6でdemo-docsレジストリが作成された際の問題**:

1. **スキーマ検証の欠如**:
   - `registry/docs.schema.json`による検証が実施されなかった
   - 手動作成時に公式スキーマを参照しなかった

2. **異なる参照元**:
   - 旧形式のproject.config.json（libx-dev従来形式）を参照した可能性
   - sample-docsなどの既存プロジェクトを参考にした可能性

3. **ドキュメント不足**:
   - Phase 2-6でのレジストリ作成手順が明確でなかった
   - スキーマ準拠のチェックリストがなかった

---

## 影響範囲

### 直接的な影響

1. **demo-docsビルド失敗**:
   ```
   TypeError: Cannot read properties of undefined (reading 'includes')
   at generateDocumentRoutes (routing.ts:140)
   ```

2. **Phase 4-1 QAテストのブロック**:
   - 動作するデモサイトが前提条件
   - 機能テスト、アクセシビリティテスト、パフォーマンステストが実施不可

3. **generatorパッケージの信頼性**:
   - スキーマ準拠していないレジストリに対してエラーハンドリングが不十分
   - `doc.versions`が`undefined`の場合の処理がない

### 間接的な影響

1. **Phase 2-6成果物の見直し**:
   - demo-docsレジストリの再作成が必要
   - Phase 2-6で作成された他のドキュメントの確認が必要

2. **スキーマ検証プロセスの欠如**:
   - レジストリ作成時のバリデーションが自動化されていない
   - CI/CDパイプラインでのスキーマチェックがない

3. **ドキュメント整備の必要性**:
   - レジストリ作成手順の標準化
   - スキーマ準拠チェックリストの作成

---

## 解決策の比較

### Option A: demo-docsレジストリを修正（推奨）

**作業内容**:
```json
// 修正前
{
  "docId": "getting-started",
  "versionId": "v1",
  "categoryId": "guide"
}

// 修正後
{
  "id": "getting-started",
  "versions": ["v1"],
  "slug": "getting-started",
  "title": { ... },
  "summary": { ... },
  "status": "published",
  "visibility": "public",
  "keywords": [],
  "tags": [],
  "content": {
    "en": { "path": "getting-started/en.mdx", "status": "published" },
    "ja": { "path": "getting-started/ja.mdx", "status": "published" },
    "ko": { "path": "getting-started/ko.mdx", "status": "published" }
  }
}
```

**メリット**:
- ✅ 公式スキーマに準拠
- ✅ generatorパッケージがそのまま動作
- ✅ 長期的に正しいアプローチ
- ✅ 他のプロジェクト（sample-docs等）への移行でも同じ形式

**デメリット**:
- ⚠️ demo-docs全6ドキュメントの修正が必要
- ⚠️ プロジェクトメタデータ（languages、versions、categories）の追加が必要
- ⚠️ 作業時間: 約2-3時間

**リスク**: 低

---

### Option B: generatorパッケージを修正（非推奨）

**作業内容**:
- `routing.ts`で`versionId`（単一値）にも対応
- 型定義を拡張（`versions?: string[] | string`）
- 後方互換性の維持

**メリット**:
- ✅ 既存のdemo-docsレジストリをそのまま使用可能

**デメリット**:
- ❌ 公式スキーマと乖離
- ❌ 技術的負債の蓄積
- ❌ 他のプロジェクトで混乱を招く
- ❌ Phase 3-5での移行ツールとの整合性が取れない

**リスク**: 高

---

### Option C: 両方を許容する互換レイヤー（一時的措置）

**作業内容**:
- generatorパッケージにマイグレーション関数を追加
- ロード時に`versionId` → `versions: [versionId]`に変換
- 警告ログを出力

**メリット**:
- ✅ 即座にビルド成功
- ✅ Option Aの修正作業を並行実施可能

**デメリット**:
- ⚠️ 一時的な措置
- ⚠️ 最終的にはOption Aの実施が必要

**リスク**: 中

---

## 推奨アクション

### 即座の対応（優先度: 🔴 Critical）

**Option C + Option A の組み合わせ**:

1. **Phase 4-1をアンブロック**（30分）:
   - generatorパッケージに互換レイヤーを追加
   - demo-docsのビルド成功を確認
   - Phase 4-1のQAテスト開始を可能に

2. **demo-docsレジストリの正式修正**（2-3時間）:
   - 公式スキーマに準拠した形式に変換
   - スキーマ検証を実施
   - ビルド・動作確認

3. **互換レイヤーの削除**（30分）:
   - 正式修正完了後、互換レイヤーを削除
   - クリーンな状態に戻す

### 中期的な対応（Phase 4-2）

1. **スキーマ検証の自動化**:
   - CI/CDパイプラインに追加
   - レジストリファイル変更時に自動実行

2. **レジストリ作成ツールの整備**:
   - CLIコマンドでスキーマ準拠したレジストリを生成
   - 手動作成による不整合を防止

3. **ドキュメント整備**:
   - レジストリ作成ガイドライン
   - スキーマ準拠チェックリスト

### 長期的な対応（Phase 5）

1. **既存レジストリの監査**:
   - 全レジストリファイルのスキーマ準拠確認
   - 不整合の洗い出しと修正

2. **型安全性の向上**:
   - TypeScriptでのスキーマ定義（Zod等）
   - ビルド時の型チェック強化

3. **マイグレーションツールの改善**:
   - Phase 3の移行ツールでスキーマ検証を必須化
   - 自動修正機能の追加

---

## 学んだ教訓

### プロセスの問題

1. **スキーマ検証の欠如**:
   - JSON Schemaを定義しても、検証しなければ意味がない
   - 手動作成時のチェックリストが必要

2. **Phase間の引き継ぎ不足**:
   - Phase 2-6での成果物レビューが不十分
   - スキーマ準拠の確認が漏れた

3. **ドキュメント不足**:
   - レジストリ作成の標準手順が明確でなかった
   - 公式スキーマの参照が徹底されていなかった

### 技術的な問題

1. **エラーハンドリング不足**:
   - generatorパッケージがスキーマ違反に脆弱
   - `undefined`チェックの欠如

2. **型定義と実装の乖離**:
   - TypeScript型定義があっても、実行時検証がない
   - ランタイムバリデーションの必要性

3. **テストカバレッジ不足**:
   - 異常系のテストケースが不足
   - スキーマ違反データでのテストがない

---

## アクションアイテム

### 担当者割り当て

| アクション | 担当 | 期限 | 優先度 |
|----------|------|------|--------|
| **互換レイヤー実装** | 開発担当 | 2025-10-22 AM | 🔴 Critical |
| **demo-docsレジストリ修正** | 開発担当 | 2025-10-22 PM | 🔴 Critical |
| **スキーマ検証CI追加** | 開発担当 | 2025-10-23 | 🟡 High |
| **レジストリ作成ガイド** | テックリード | 2025-10-24 | 🟡 High |
| **既存レジストリ監査** | QA担当 | 2025-10-25 | 🟢 Medium |

### 完了基準

**即座の対応**:
- ✅ demo-docsのビルドが成功する
- ✅ generatorパッケージが両形式に対応する（一時的）
- ✅ Phase 4-1のQAテストが開始できる

**中期的な対応**:
- ✅ demo-docsが公式スキーマに準拠している
- ✅ CI/CDでスキーマ検証が自動実行される
- ✅ レジストリ作成ガイドが整備されている

**長期的な対応**:
- ✅ 全レジストリファイルがスキーマ準拠している
- ✅ 型安全性が向上している
- ✅ マイグレーションツールでスキーマ検証が必須化されている

---

## 関連資料

### ソースコード

- `registry/schema/document.schema.json` - 公式スキーマ定義
- `registry/demo-docs.json` - 問題のあるレジストリ
- `registry/docs.json` - 正しい形式のレジストリ（参考）
- `packages/generator/src/types.ts` - 型定義
- `packages/generator/src/routing.ts` - エラー発生箇所

### ドキュメント

- `docs/new-generator-plan/phase-2-6-completion-report.md` - demo-docs作成記録
- `docs/new-generator-plan/PROJECT_PRINCIPLES.md` - プロジェクト原則
- `registry/schema/VERSIONING.md` - スキーマバージョニング

### 関連Issue

- （未作成）Phase 4-1: Registry schema validation needed
- （未作成）Phase 4-1: demo-docs registry format correction

---

## 承認

**報告者**: Claude Code (AI Assistant)
**報告日**: 2025-10-21

**レビュー者**: （記入）
**承認日**: （記入）

---

**最終更新**: 2025-10-21
**ステータス**: 🔴 Open - Action Required
