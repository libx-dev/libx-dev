# compatibility テストプロジェクト

このディレクトリは、Phase 2-5 タスク5（互換性検証）のために作成された統合テストプロジェクトです。

## 目的

すべての共有パッケージが連携して正しく動作することを検証します。

## テスト内容

### 統合互換性テスト (`test-integration.js`)

すべての共有パッケージの統合動作確認。

**検証項目**:
1. レジストリ読み込みと検証
2. ルーティング生成
3. サイドバー生成
4. テーマシステム
5. CSS配布
6. 国際化（i18n）
7. エントリーポイント整合性

**実行方法**:
```bash
npm test
# または
node test-integration.js
```

## セットアップ

```bash
# 依存関係のインストール
npm install
```

## 期待される結果

- ✅ すべてのテストが成功する
- ✅ runtimeパッケージと同様の使用パターンで動作する
- ✅ Breaking Changeが検出されない

## 関連ドキュメント

- [Phase 2-5 計画書](../../docs/new-generator-plan/phase-2-5-shared-packages.md)
- [Phase 2-5 引き継ぎガイド](../../docs/new-generator-plan/status/phase-2-5-handoff.md)
