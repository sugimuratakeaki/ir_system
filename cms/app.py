"""
KAGAMI IR管理センター - CMS Application
AI技術を活用したIR業務支援システム
"""

from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from datetime import datetime
import json

# FastAPIアプリケーションの初期化
app = FastAPI(title="KAGAMI IR管理センター", version="1.0.0")

# 静的ファイルとテンプレートの設定
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/shared", StaticFiles(directory="../shared"), name="shared")
templates = Jinja2Templates(directory="templates")

# ===== モックデータ（メモリ内） =====
MOCK_DATA = {
    "kpis": {
        "investor_satisfaction": {"value": 95, "trend": "+5%", "label": "投資家満足度"},
        "response_time": {"value": 1.2, "trend": "-30%", "label": "平均応答時間（時間）"},
        "faq_accuracy": {"value": 98, "trend": "+2%", "label": "FAQ精度（%）"},
        "active_investors": {"value": 324, "trend": "+12%", "label": "アクティブ投資家数"}
    },
    "recent_activities": [
        {"time": "10分前", "type": "FAQ更新", "content": "決算説明会の日程について", "icon": "📝"},
        {"time": "30分前", "type": "投資家対話", "content": "機関投資家Aとの面談完了", "icon": "💬"},
        {"time": "1時間前", "type": "ファイル処理", "content": "音声ファイルの文字起こし完了", "icon": "📄"},
        {"time": "2時間前", "type": "システム", "content": "定期バックアップ完了", "icon": "⚙️"}
    ],
    "faqs": [
        {"id": 1, "question": "2024年度の業績見通しは？", "answer": "売上高は前年比15%増の見込みです。", "status": "published", "confidence": 98},
        {"id": 2, "question": "配当政策について教えてください", "answer": "配当性向30%を目標としています。", "status": "published", "confidence": 95},
        {"id": 3, "question": "ESGへの取り組みは？", "answer": "2030年までにカーボンニュートラルを目指します。", "status": "draft", "confidence": 92}
    ],
    "investors": [
        {"id": 1, "name": "山田太郎", "company": "ABC投資顧問", "type": "機関投資家", "last_contact": "2024-01-15"},
        {"id": 2, "name": "鈴木花子", "company": "個人", "type": "個人投資家", "last_contact": "2024-01-10"},
        {"id": 3, "name": "John Smith", "company": "Global Capital", "type": "海外投資家", "last_contact": "2024-01-08"}
    ]
}

# ===== ルートハンドラー =====

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """ダッシュボード画面"""
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "title": "ダッシュボード",
        "kpis": MOCK_DATA["kpis"],
        "recent_activities": MOCK_DATA["recent_activities"],
        "current_time": datetime.now().strftime("%Y年%m月%d日 %H:%M")
    })

@app.get("/faq", response_class=HTMLResponse)
async def faq_management(request: Request):
    """FAQ管理画面"""
    return templates.TemplateResponse("faq.html", {
        "request": request,
        "title": "AI-FAQ管理",
        "faqs": MOCK_DATA["faqs"],
        "total_faqs": len(MOCK_DATA["faqs"]),
        "published_count": len([f for f in MOCK_DATA["faqs"] if f["status"] == "published"])
    })

@app.get("/investors", response_class=HTMLResponse)
async def investor_management(request: Request):
    """投資家管理画面"""
    return templates.TemplateResponse("investors.html", {
        "request": request,
        "title": "投資家管理",
        "investors": MOCK_DATA["investors"],
        "total_investors": len(MOCK_DATA["investors"])
    })

@app.get("/upload", response_class=HTMLResponse)
async def file_upload(request: Request):
    """ファイルアップロード画面"""
    return templates.TemplateResponse("upload.html", {
        "request": request,
        "title": "データ取込・処理"
    })

@app.get("/analytics", response_class=HTMLResponse)
async def analytics(request: Request):
    """分析・レポート画面"""
    return templates.TemplateResponse("analytics.html", {
        "request": request,
        "title": "分析・レポート",
        "kpis": MOCK_DATA["kpis"]
    })

# ===== API エンドポイント（モック） =====

@app.get("/api/faqs")
async def get_faqs():
    """FAQ一覧取得API"""
    return {"faqs": MOCK_DATA["faqs"], "total": len(MOCK_DATA["faqs"])}

@app.post("/api/faqs")
async def create_faq(request: Request):
    """FAQ作成API（モック）"""
    return {"status": "success", "message": "FAQを作成しました"}

@app.get("/api/investors")
async def get_investors():
    """投資家一覧取得API"""
    return {"investors": MOCK_DATA["investors"], "total": len(MOCK_DATA["investors"])}

@app.post("/api/upload")
async def upload_file(request: Request):
    """ファイルアップロードAPI（モック）"""
    return {"status": "success", "message": "ファイルをアップロードしました"}

# ===== アプリケーション起動 =====
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
