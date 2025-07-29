"""
KAGAMI IR管理センター - CMS 2.0 Application
モジュラー設計による次世代IR管理システム
"""

from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from datetime import datetime
import json

# FastAPIアプリケーションの初期化
app = FastAPI(title="KAGAMI IR管理センター 2.0", version="2.0.0")

# 静的ファイルとテンプレートの設定
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# ===== モックデータ（メモリ内） =====
MOCK_DATA = {
    "dashboard": {
        "total_investors": 1250,
        "active_meetings": 8,
        "pending_tasks": 15,
        "recent_activities": [
            {
                "id": "act_001",
                "type": "meeting",
                "title": "野村AMとの面談完了",
                "time": "2024-01-22 10:30",
                "status": "completed"
            },
            {
                "id": "act_002",
                "type": "document",
                "title": "決算資料アップロード",
                "time": "2024-01-22 09:15",
                "status": "completed"
            },
            {
                "id": "act_003",
                "type": "faq",
                "title": "新規FAQ生成",
                "time": "2024-01-22 08:45",
                "status": "pending"
            }
        ]
    },
    "investors": [
        {
            "id": "inv_001",
            "name": "野村アセットマネジメント",
            "type": "機関投資家",
            "status": "active",
            "last_contact": "2024-01-22",
            "holdings": "2.5%",
            "priority": "high"
        },
        {
            "id": "inv_002",
            "name": "BlackRock Inc.",
            "type": "海外機関投資家",
            "status": "active",
            "last_contact": "2024-01-21",
            "holdings": "1.8%",
            "priority": "medium"
        },
        {
            "id": "inv_003",
            "name": "個人投資家A",
            "type": "個人投資家",
            "status": "active",
            "last_contact": "2024-01-20",
            "holdings": "0.1%",
            "priority": "low"
        }
    ],
    "documents": [
        {
            "id": "doc_001",
            "title": "2024年3月期決算説明資料",
            "type": "financial",
            "upload_date": "2024-01-22",
            "status": "published",
            "downloads": 45
        },
        {
            "id": "doc_002",
            "title": "中期経営計画2024-2026",
            "type": "strategy",
            "upload_date": "2024-01-21",
            "status": "draft",
            "downloads": 12
        },
        {
            "id": "doc_003",
            "title": "ESG報告書2023",
            "type": "esg",
            "upload_date": "2024-01-20",
            "status": "published",
            "downloads": 28
        }
    ],
    "meetings": [
        {
            "id": "meet_001",
            "title": "投資家B社との個別面談",
            "date": "2024-01-23",
            "time": "10:00",
            "type": "individual",
            "status": "scheduled",
            "participants": ["CFO", "IR部長"]
        },
        {
            "id": "meet_002",
            "title": "決算発表準備会議",
            "date": "2024-01-22",
            "time": "14:00",
            "type": "internal",
            "status": "completed",
            "participants": ["経理部", "広報部", "IR部"]
        },
        {
            "id": "meet_003",
            "title": "アナリスト向けスモールミーティング",
            "date": "2024-01-22",
            "time": "16:00",
            "type": "briefing",
            "status": "completed",
            "participants": ["CEO", "CFO"]
        }
    ],
    "faqs": [
        {
            "id": "faq_001",
            "question": "配当政策について教えてください",
            "answer": "当社は安定した配当政策を維持しており、年間配当率は30%を目標としています。",
            "category": "financial",
            "status": "published",
            "created_at": "2024-01-22",
            "views": 156
        },
        {
            "id": "faq_002",
            "question": "ESGへの取り組みは？",
            "answer": "環境・社会・ガバナンスの観点から、持続可能な成長を目指しています。",
            "category": "esg",
            "status": "published",
            "created_at": "2024-01-21",
            "views": 89
        },
        {
            "id": "faq_003",
            "question": "中期経営計画の進捗は？",
            "answer": "計画通りに進捗しており、各KPIも目標値を達成しています。",
            "category": "strategy",
            "status": "draft",
            "created_at": "2024-01-20",
            "views": 67
        }
    ]
}

# ===== ルート定義 =====

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """ダッシュボードページ"""
    return templates.TemplateResponse("pages/dashboard.html", {
        "request": request,
        "data": MOCK_DATA["dashboard"],
        "base_url": "/cms2"
    })

@app.get("/investors", response_class=HTMLResponse)
async def investors(request: Request):
    """投資家管理ページ"""
    return templates.TemplateResponse("pages/investors.html", {
        "request": request,
        "investors": MOCK_DATA["investors"],
        "base_url": "/cms2"
    })

@app.get("/documents", response_class=HTMLResponse)
async def documents(request: Request):
    """ドキュメント管理ページ"""
    return templates.TemplateResponse("pages/documents.html", {
        "request": request,
        "documents": MOCK_DATA["documents"],
        "base_url": "/cms2"
    })

@app.get("/meetings", response_class=HTMLResponse)
async def meetings(request: Request):
    """ミーティング管理ページ"""
    return templates.TemplateResponse("pages/meetings.html", {
        "request": request,
        "meetings": MOCK_DATA["meetings"],
        "base_url": "/cms2"
    })

@app.get("/faq", response_class=HTMLResponse)
async def faq(request: Request):
    """FAQ管理ページ"""
    return templates.TemplateResponse("pages/faq.html", {
        "request": request,
        "faqs": MOCK_DATA["faqs"],
        "base_url": "/cms2"
    })

# ===== API エンドポイント =====

@app.get("/api/dashboard")
async def get_dashboard_data():
    """ダッシュボードデータ取得API"""
    return MOCK_DATA["dashboard"]

@app.get("/api/investors")
async def get_investors():
    """投資家一覧取得API"""
    return MOCK_DATA["investors"]

@app.get("/api/documents")
async def get_documents():
    """ドキュメント一覧取得API"""
    return MOCK_DATA["documents"]

@app.get("/api/meetings")
async def get_meetings():
    """ミーティング一覧取得API"""
    return MOCK_DATA["meetings"]

@app.get("/api/faqs")
async def get_faqs():
    """FAQ一覧取得API"""
    return MOCK_DATA["faqs"]

# ===== ヘルスチェック =====

@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy", "version": "2.0.0", "timestamp": datetime.now().isoformat()}

@app.get("/debug/static")
async def debug_static():
    """静的ファイルのデバッグ用エンドポイント"""
    import os
    static_dir = "static"
    files = []
    for root, dirs, filenames in os.walk(static_dir):
        for filename in filenames:
            rel_path = os.path.join(root, filename)
            files.append(rel_path)
    return {"static_files": files, "static_dir": static_dir}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002) 