@echo off
REM KAGAMI CMS 起動スクリプト (Windows)

echo 🔮 KAGAMI IR管理センター - 起動中...
echo.

REM 仮想環境の確認
if not exist "venv" (
    echo 仮想環境を作成しています...
    python -m venv venv
)

REM 仮想環境の有効化
echo 仮想環境を有効化しています...
call venv\Scripts\activate.bat

REM 依存関係のインストール
echo 依存関係を確認しています...
pip install -r requirements.txt -q

REM アプリケーションの起動
echo.
echo ✨ アプリケーションを起動します
echo 📍 URL: http://localhost:8000
echo.
echo 終了するには Ctrl+C を押してください
echo.

python app.py
