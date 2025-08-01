"""
アプリケーション設定ファイル
"""

import os
from pathlib import Path

# ベースディレクトリ
BASE_DIR = Path(__file__).resolve().parent.parent

# アプリケーション設定
APP_NAME = "KAGAMI IR管理センター CMS 3.0"
APP_VERSION = "3.0.0"
APP_DESCRIPTION = "次世代IR管理システム - より効率的に、より戦略的に"

# サーバー設定
HOST = "0.0.0.0"
PORT = 8003
DEBUG = True

# セッション設定
SECRET_KEY = "your-secret-key-here-please-change-in-production"
SESSION_EXPIRE_MINUTES = 480  # 8時間

# データベース設定（現在はモックのみ）
DATABASE_URL = None  # 将来的なDB接続用

# ファイルアップロード設定
UPLOAD_DIR = BASE_DIR / "uploads"
MAX_UPLOAD_SIZE = 100 * 1024 * 1024  # 100MB
ALLOWED_EXTENSIONS = {
    "audio": [".mp3", ".wav", ".m4a", ".aac"],
    "document": [".pdf", ".docx", ".xlsx", ".pptx"],
    "image": [".jpg", ".jpeg", ".png", ".gif", ".svg"],
    "video": [".mp4", ".mov", ".avi"]
}

# API設定
API_PREFIX = "/api"
API_VERSION = "v1"

# ログ設定
LOG_LEVEL = "INFO"
LOG_FILE = BASE_DIR / "logs" / "app.log"

# メール設定（モック）
EMAIL_ENABLED = False
EMAIL_HOST = ""
EMAIL_PORT = 587
EMAIL_USER = ""
EMAIL_PASSWORD = ""

# AI機能設定（モック）
AI_ENABLED = True
AI_API_KEY = ""
AI_MODEL = "gpt-4"

# テーマ設定
THEME = {
    "primary_color": "#1e40af",  # KAGAMI Blue
    "secondary_color": "#3b82f6",
    "success_color": "#10b981",
    "warning_color": "#f59e0b",
    "error_color": "#ef4444",
    "font_family": "'Noto Sans JP', sans-serif"
}

# 機能フラグ
FEATURES = {
    "dialogue_ai": True,
    "realtime_updates": False,
    "email_notifications": False,
    "export_pdf": True,
    "multi_language": False
}

# モックデータ設定
USE_MOCK_DATA = True
MOCK_DATA_DIR = BASE_DIR / "static" / "data"

# セキュリティ設定
CORS_ORIGINS = [
    "http://localhost:8003",
    "http://127.0.0.1:8003"
]

# タイムゾーン
TIMEZONE = "Asia/Tokyo"

# 言語設定
DEFAULT_LANGUAGE = "ja"
SUPPORTED_LANGUAGES = ["ja", "en"]