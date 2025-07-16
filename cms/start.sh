#!/bin/bash
# KAGAMI CMS 起動スクリプト

echo "🔮 KAGAMI IR管理センター - 起動中..."
echo ""

# 仮想環境の確認
if [ ! -d "venv" ]; then
    echo "仮想環境を作成しています..."
    python -m venv venv
fi

# 仮想環境の有効化
echo "仮想環境を有効化しています..."
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # Mac/Linux
    source venv/bin/activate
fi

# 依存関係のインストール
echo "依存関係を確認しています..."
pip install -r requirements.txt -q

# アプリケーションの起動
echo ""
echo "✨ アプリケーションを起動します"
echo "📍 URL: http://localhost:8000"
echo ""
echo "終了するには Ctrl+C を押してください"
echo ""

python app.py
