# スキーマバージョニングガイド

このドキュメントは、LibX Docs Registry スキーマのバージョン管理方針と変更手順を定義します。

## 概要

LibX Docs Registry スキーマは [Semantic Versioning (SemVer)](https://semver.org/spec/v2.0.0.html) を採用しています。

```
MAJOR.MINOR.PATCH (例: 1.2.3)
```

- **MAJOR**: 後方互換性のない変更
- **MINOR**: 後方互換性のある機能追加
- **PATCH**: 後方互換性のあるバグ修正

## バージョン管理の原則

### 1. 単一ソース・オブ・トゥルース

スキーマバージョンは以下の場所で一元管理されます：

- **`registry/docs.schema.json`** の `$schemaVersion` プロパティ
- **`registry/schema/CHANGELOG.md`** の最新バージョンセクション

### 2. 後方互換性の保証

- **MINOR** および **PATCH** 更新では既存のレジストリデータが引き続き有効である必要があります
- **MAJOR** 更新では破壊的変更を許容しますが、マイグレーションパスを提供する必要があります

### 3. 明示的な変更記録

- すべての変更は `CHANGELOG.md` に記録されます
- 設計判断は `DECISIONS.md` に記録されます

---

## バージョン更新ルール

### MAJOR バージョン更新（X.0.0）

以下の変更を含む場合に MAJOR バージョンを更新します：

#### 必須の変更
- ✗ 必須フィールド (`required`) の追加
- ✗ フィールドの削除
- ✗ フィールド名の変更
- ✗ フィールドの型変更（例: `string` → `number`）
- ✗ `enum` 値の削除または変更
- ✗ `pattern` の制約強化（既存データが無効になる場合）

#### 構造の変更
- ✗ `$ref` 参照先の大幅な変更
- ✗ スキーマファイルの分割・統合（パス変更を伴う場合）
- ✗ `additionalProperties: false` の追加（既存の拡張プロパティが無効になる場合）

#### 例
```json
// v1.0.0
{
  "properties": {
    "name": { "type": "string" }
  }
}

// v2.0.0 (MAJOR: 必須フィールド追加)
{
  "properties": {
    "name": { "type": "string" },
    "id": { "type": "string" }
  },
  "required": ["name", "id"]  // 破壊的変更
}
```

### MINOR バージョン更新（0.X.0）

以下の変更を含む場合に MINOR バージョンを更新します：

#### 機能追加
- ✓ 任意フィールドの追加
- ✓ 新しい `enum` 値の追加
- ✓ 新しいスキーマファイルの追加（`$ref` 追加）
- ✓ `pattern` の制約緩和
- ✓ `minItems`/`maxItems` の制約緩和

#### ドキュメント強化
- ✓ 新しい `examples` の追加
- ✓ `description` の大幅な追加・改善

#### 例
```json
// v1.0.0
{
  "properties": {
    "name": { "type": "string" }
  }
}

// v1.1.0 (MINOR: 任意フィールド追加)
{
  "properties": {
    "name": { "type": "string" },
    "description": { "type": "string" }  // 任意フィールド
  }
}
```

### PATCH バージョン更新（0.0.X）

以下の変更を含む場合に PATCH バージョンを更新します：

#### ドキュメント修正
- ✓ `description` の誤字修正・明確化
- ✓ `examples` の修正
- ✓ コメントの追加・修正

#### バグ修正
- ✓ `pattern` の誤りを修正（意図した制約に合わせる）
- ✓ `$ref` パスの修正
- ✓ タイポ修正

#### 例
```json
// v1.0.0
{
  "properties": {
    "email": {
      "type": "string",
      "description": "User email"  // 不明瞭
    }
  }
}

// v1.0.1 (PATCH: description 改善)
{
  "properties": {
    "email": {
      "type": "string",
      "description": "ユーザーのメールアドレス。BCP 47形式で指定します。"
    }
  }
}
```

---

## 互換性マトリクス

| スキーマバージョン | CLI 最小バージョン | ジェネレーター最小バージョン | 備考 |
|-------------------|-------------------|----------------------------|------|
| 1.0.0             | 未実装            | 未実装                      | 初回リリース |

※ CLI およびジェネレーターの実装開始後に更新されます

---

## スキーマ変更手順

### 1. 変更提案フェーズ

1. **Issue 作成**
   - GitHub Issue で変更内容を提案
   - 変更の動機と影響範囲を記載
   - MAJOR/MINOR/PATCH のいずれかを判定

2. **影響範囲の分析**
   - 既存レジストリデータへの影響を確認
   - CLI/ジェネレーター/マイグレーションツールへの影響を評価
   - 必要に応じて代替案を検討

### 2. 実装フェーズ

1. **スキーマファイル編集**
   ```bash
   # 該当するスキーマファイルを編集
   vim registry/schema/project.schema.json
   ```

2. **CHANGELOG 更新**
   ```markdown
   ## [Unreleased]

   ### Added (または Changed, Fixed)
   - 変更内容を記載
   ```

3. **サンプルデータ更新**
   - 必要に応じて `registry/examples/` のサンプルを更新
   - 新機能を示すサンプルを追加

4. **バリデーション確認**
   ```bash
   # Ajv でバリデーションテスト（将来的に自動化）
   node scripts/validate-schema.js
   ```

### 3. レビューフェーズ

1. **Pull Request 作成**
   - 変更内容と動機を明記
   - 破壊的変更の場合はマイグレーション計画を提示

2. **ステークホルダーレビュー**
   - CLI 担当者: CLI への影響を確認
   - ジェネレーター担当者: ビルドへの影響を確認
   - コンテンツ担当者: 既存データへの影響を確認

3. **設計判断記録**
   - 重要な判断は `DECISIONS.md` に記録
   - なぜその設計を選んだのかを明記

### 4. リリースフェーズ

1. **バージョン番号の決定**
   - CHANGELOG の変更内容から適切なバージョンを決定
   - MAJOR/MINOR/PATCH のルールに従う

2. **スキーマバージョン更新**
   ```json
   // registry/docs.schema.json
   {
     "$schemaVersion": "1.1.0",  // 更新
     ...
   }
   ```

3. **CHANGELOG 確定**
   ```markdown
   ## [1.1.0] - 2025-10-20

   ### Added
   - 変更内容
   ```

4. **Git タグ作成**
   ```bash
   git tag -a schema-v1.1.0 -m "Schema version 1.1.0"
   git push origin schema-v1.1.0
   ```

5. **マイグレーション提供（MAJOR のみ）**
   - マイグレーションスクリプトを `scripts/migrations/` に追加
   - マイグレーションガイドを CHANGELOG に記載

---

## マイグレーション戦略

### MAJOR バージョン更新時の対応

1. **マイグレーションスクリプト提供**
   ```bash
   scripts/migrations/
   ├── 1.x-to-2.0.js      # v1.x → v2.0 マイグレーション
   └── README.md          # マイグレーション手順
   ```

2. **移行期間の設定**
   - 旧バージョンのサポート期限を明示
   - 警告メッセージの表示（CLI で実装）

3. **並行サポート期間**
   - 最低3ヶ月は旧バージョンをサポート
   - 段階的な移行を推奨

### 後方互換性チェック

将来的に以下のツールを導入予定：

```bash
# スキーマ間の互換性チェック
node scripts/check-schema-compatibility.js v1.0.0 v1.1.0

# 既存データの検証
node scripts/validate-registry-data.js --schema-version 1.1.0
```

---

## ベストプラクティス

### 1. 段階的な変更

- 一度に多くの変更を加えない
- 小さな MINOR/PATCH 更新を積み重ねる
- MAJOR 更新は慎重に計画する

### 2. 明確なドキュメント

- `description` には使用例と制約を明記
- `examples` は実際のユースケースを反映
- 変更の動機を CHANGELOG に記載

### 3. 早期フィードバック

- 大きな変更は Issue で事前に議論
- プロトタイプを作成してレビューを受ける
- ステークホルダーの合意を得る

### 4. テストデータの充実

- 新機能には対応するサンプルデータを追加
- エッジケースをカバーするテストデータを用意
- バリデーションエラーのテストケースも作成

---

## 参考資料

- [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html)
- [JSON Schema Specification](https://json-schema.org/specification.html)
- [CHANGELOG.md](./CHANGELOG.md)
- [フェーズ1-1計画](../../docs/new-generator-plan/phase-1-1-registry-schema.md)

---

## FAQ

### Q: 任意フィールドを必須にする場合は？
**A:** MAJOR バージョン更新が必要です。既存データが無効になるため、マイグレーションスクリプトを提供してください。

### Q: description の改善だけでバージョンを上げるべき？
**A:** 軽微な修正なら PATCH、大幅な追加・変更なら MINOR を推奨します。

### Q: スキーマファイルを分割したい場合は？
**A:** `$ref` のパスが変わらなければ MINOR、パスが変わる場合は MAJOR です。

### Q: 既存の enum 値の意味を変更したい場合は？
**A:** MAJOR バージョン更新が必要です。または新しい enum 値を追加し、旧値を非推奨にする方法を検討してください。

### Q: バージョンアップのタイミングは？
**A:** 機能的な変更が完了したタイミングで行います。ドキュメントのみの変更は複数まとめてリリースしても構いません。
