@echo off

REM KAGAMI CMS 2.0 起動スクリプト (Windows)

echo 🚀 KAGAMI CMS 2.0 を起動しています...

REM 仮想環境の確認と作成
if not exist "venv" (
    echo 📦 仮想環境を作成しています...
    python -m venv venv
)

REM 仮想環境の有効化
echo 🔧 仮想環境を有効化しています...
call venv\Scripts\activate.bat

REM 依存関係のインストール
echo 📚 依存関係をインストールしています...
pip install -r requirements.txt

REM アプリケーションの起動
echo 🌟 CMS 2.0 を起動しています...
echo 📍 アクセス先: http://localhost:8002
echo 🔍 ヘルスチェック: http://localhost:8002/health
echo.
echo 停止するには Ctrl+C を押してください
echo.

python app.py 