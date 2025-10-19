# npm-usage テストプロジェクト

このディレクトリは、Phase 2-5 タスク5（互換性検証）のために作成されたテストプロジェクトです。

## 目的

共有パッケージのビルド成果物が正しく動作することを検証します。

## テスト内容

### 1. CJS形式テスト (`test-cjs.cjs`)

CommonJS形式でのビルド成果物の読み込みと動作確認。

**検証項目**:
- `@docs/generator`のCJS出力が読み込めるか
- `@docs/theme`のCJS出力が読み込めるか
- `@docs/i18n`のCJS出力が読み込めるか
- サブエントリーポイントが正しく読み込めるか

**実行方法**:
```bash
npm run test:cjs
# または
node test-cjs.cjs
```

### 2. ESM形式テスト (`test-esm.js`)

ECMAScript Modules形式でのビルド成果物の読み込みと動作確認。

**検証項目**:
- `@docs/generator`のESM出力が読み込めるか
- `@docs/theme`のESM出力が読み込めるか
- `@docs/i18n`のESM出力が読み込めるか
- サブエントリーポイントが正しく読み込めるか
- CSS配布ファイルの存在確認

**実行方法**:
```bash
npm run test:esm
# または
node test-esm.js
```

### 3. 型定義完全性テスト (`test-types.ts`)

TypeScript型定義の完全性と正確性の確認。

**検証項目**:
- すべてのエクスポートに型定義が存在するか
- 型定義が正しく動作するか
- TypeScriptコンパイラがエラーなく型チェックできるか

**実行方法**:
```bash
npm run test:types
# または
npx tsc --noEmit test-types.ts
```

## セットアップ

```bash
# 依存関係のインストール
npm install
```

## 期待される結果

- ✅ すべてのテストがエラーなく完了する
- ✅ CJS/ESM両方の形式で読み込みが成功する
- ✅ TypeScript型チェックがエラーなく完了する

## 関連ドキュメント

- [Phase 2-5 計画書](../../docs/new-generator-plan/phase-2-5-shared-packages.md)
- [Phase 2-5 引き継ぎガイド](../../docs/new-generator-plan/status/phase-2-5-handoff.md)
