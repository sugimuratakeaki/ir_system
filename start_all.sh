#!/bin/bash

# KAGAMI IR System - 起動スクリプト

echo "🚀 KAGAMI IR System を起動します..."

# CMSの起動
echo "📊 CMS管理画面を起動中..."
cd cms
python app.py &
CMS_PID=$!
echo "✅ CMS管理画面: http://localhost:8000"

# フロントエンドの起動
echo "🌐 投資家向けサイトを起動中..."
cd ../frontend
python app.py &
FRONTEND_PID=$!
echo "✅ 投資家向けサイト: http://localhost:8001"

echo ""
echo "================================"
echo "🎉 KAGAMI IR System 起動完了！"
echo "================================"
echo ""
echo "📝 アクセス情報:"
echo "  - CMS管理画面: http://localhost:8000"
echo "  - 投資家向けサイト: http://localhost:8001"
echo ""
echo "🛑 終了するには Ctrl+C を押してください"

# 終了処理
trap "echo ''; echo '🛑 システムを停止中...'; kill $CMS_PID $FRONTEND_PID; exit" INT

# プロセスの監視
wait
