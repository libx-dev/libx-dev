#!/bin/bash

# Astro ドキュメントサイト用ローカルサーバー起動スクリプト
# dist/ ディレクトリでHTTPサーバーを起動します

set -e  # エラー時に停止

# プロジェクトルートディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "📁 プロジェクトディレクトリ: $PROJECT_ROOT"

# dist ディレクトリの存在確認
if [ ! -d "$PROJECT_ROOT/dist" ]; then
  echo "❌ エラー: dist/ ディレクトリが存在しません"
  echo "💡 ヒント: 以下のコマンドでビルドしてください："
  echo "   pnpm build"
  exit 1
fi

echo "🚀 HTTPサーバーを起動中..."
echo "📍 サーバーURL: http://localhost:8080"
echo "🛑 停止するには Ctrl+C を押してください"
echo ""

# distディレクトリに移動してHTTPサーバーを起動
(
  cd "$PROJECT_ROOT/dist" || exit 1
  python3 -m http.server 8080
)