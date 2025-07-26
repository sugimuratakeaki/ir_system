"""
KAGAMI IR フロントエンド - 投資家向けサイト
"""

from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from datetime import datetime

# FastAPIアプリケーションの初期化
app = FastAPI(title="KAGAMI IR", version="1.0.0")

# 静的ファイルとテンプレートの設定
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/shared", StaticFiles(directory="../shared"), name="shared")
templates = Jinja2Templates(directory="templates")

# モックデータ
MOCK_DATA = {
    "company_info": {
        "name": "株式会社KAGAMI",
        "stock_code": "9999",
        "market": "東証プライム",
        "fiscal_year_end": "3月"
    },
    "latest_news": [
        {
            "date": "2024-01-20",
            "title": "2024年度第3四半期決算発表",
            "category": "決算",
            "url": "/news/1"
        },
        {
            "date": "2024-01-15",
            "title": "新製品開発に関するお知らせ",
            "category": "製品",
            "url": "/news/2"
        }
    ],
    "ir_calendar": [
        {
            "date": "2024-02-15",
            "event": "第3四半期決算発表",
            "time": "15:00"
        },
        {
            "date": "2024-02-16",
            "event": "決算説明会（機関投資家向け）",
            "time": "10:00"
        }
    ],
    "stock_info": {
        "price": "2,456",
        "change": "+32",
        "change_rate": "+1.32%",
        "updated": "15:00"
    },
    "financial_highlights": {
        "revenue": "1,234億円",
        "revenue_growth": "+15.2%",
        "operating_profit": "234億円",
        "profit_growth": "+18.5%",
        "net_income": "156億円",
        "roe": "12.5%"
    }
}

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """ホームページ"""
    return templates.TemplateResponse("home.html", {
        "request": request,
        "title": "ホーム",
        "company_info": MOCK_DATA["company_info"],
        "latest_news": MOCK_DATA["latest_news"],
        "ir_calendar": MOCK_DATA["ir_calendar"],
        "stock_info": MOCK_DATA["stock_info"],
        "financial_highlights": MOCK_DATA["financial_highlights"],
        "current_time": datetime.now().strftime("%Y年%m月%d日 %H:%M")
    })

@app.get("/investor-qa", response_class=HTMLResponse)
async def investor_qa(request: Request):
    """投資家Q&A"""
    qa_data = [
        {
            "question": "2024年度の業績見通しはどうですか？",
            "answer": "売上高は前年比15%増、営業利益は18%増を見込んでいます。AI事業の成長が主な牽引役となっています。",
            "category": "業績・財務",
            "updated": "2024-01-20"
        },
        {
            "question": "配当政策について教えてください",
            "answer": "配当性向30%を目標とし、安定的な株主還元を継続する方針です。",
            "category": "株主還元",
            "updated": "2024-01-20"
        },
        {
            "question": "ESGへの取り組みについて教えてください",
            "answer": "2030年までにカーボンニュートラルを目指し、具体的なロードマップを策定中です。2月末に詳細を公表予定です。",
            "category": "ESG",
            "updated": "2024-01-15"
        }
    ]
    
    return templates.TemplateResponse("investor_qa.html", {
        "request": request,
        "title": "投資家Q&A",
        "qa_data": qa_data,
        "current_time": datetime.now().strftime("%Y年%m月%d日 %H:%M")
    })

@app.get("/financial-info", response_class=HTMLResponse)
async def financial_info(request: Request):
    """財務情報"""
    return templates.TemplateResponse("financial_info.html", {
        "request": request,
        "title": "財務情報",
        "current_time": datetime.now().strftime("%Y年%m月%d日 %H:%M")
    })

@app.get("/ir-library", response_class=HTMLResponse)
async def ir_library(request: Request):
    """IRライブラリ"""
    documents = [
        {
            "category": "決算短信",
            "items": [
                {"title": "2024年3月期 第3四半期決算短信", "date": "2024-01-20", "file_size": "1.2MB"},
                {"title": "2024年3月期 第2四半期決算短信", "date": "2023-10-20", "file_size": "1.1MB"}
            ]
        },
        {
            "category": "決算説明会資料",
            "items": [
                {"title": "2024年3月期 第3四半期決算説明会資料", "date": "2024-01-21", "file_size": "3.5MB"},
                {"title": "2024年3月期 第2四半期決算説明会資料", "date": "2023-10-21", "file_size": "3.2MB"}
            ]
        }
    ]
    
    return templates.TemplateResponse("ir_library.html", {
        "request": request,
        "title": "IRライブラリ",
        "documents": documents,
        "current_time": datetime.now().strftime("%Y年%m月%d日 %H:%M")
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8001, reload=True)
