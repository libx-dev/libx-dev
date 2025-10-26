#!/bin/bash

# 全プロジェクトをビルドして統合する
#
# このスクリプトは後方互換性のために残されています。
# 実際の処理は scripts/build-integrated.js で行われます。
#
# 統合ビルドの詳細については、以下を参照してください：
#   node scripts/build-integrated.js --help

set -e  # エラー時に停止

# プロジェクトルートディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🏗️  全プロジェクトをビルド中..."
echo "📁 プロジェクトディレクトリ: $PROJECT_ROOT"
echo ""

# Node.js版の統合ビルドスクリプトを呼び出し
# コマンドライン引数をそのまま渡す
node "$SCRIPT_DIR/build-integrated.js" "$@"
