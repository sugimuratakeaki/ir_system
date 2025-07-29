#!/bin/bash

# KAGAMI CMS 2.0 起動スクリプト

echo "🚀 KAGAMI CMS 2.0 を起動しています..."

# 仮想環境の確認と作成
if [ ! -d "venv" ]; then
    echo "📦 仮想環境を作成しています..."
    python3 -m venv venv
fi

# 仮想環境の有効化
echo "🔧 仮想環境を有効化しています..."
source venv/bin/activate

# 依存関係のインストール
echo "📚 依存関係をインストールしています..."
pip install -r requirements.txt

# アプリケーションの起動
echo "🌟 CMS 2.0 を起動しています..."
echo "📍 アクセス先: http://localhost:8002"
echo "🔍 ヘルスチェック: http://localhost:8002/health"
echo ""
echo "停止するには Ctrl+C を押してください"
echo ""

python app.py 