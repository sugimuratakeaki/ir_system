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
        {
            "id": 1, 
            "question": "2024年度の業績見通しは？", 
            "answer": "売上高は前年比15%増の見込みです。", 
            "status": "published", 
            "confidence": 98,
            "data_sources": [
                {"id": 1, "name": "2024年度第3四半期決算短信", "type": "決算資料", "date": "2024-01-20", "relevance": 95},
                {"id": 2, "name": "2024年度第3四半期決算説明会", "type": "説明会", "date": "2024-01-21", "relevance": 90}
            ],
            "valid_from": "2024-01-20",
            "valid_until": "2024-04-30",
            "category": "財務・業績",
            "version": "2024-Q3",
            "last_updated": "2024-01-20 15:30:00",
            "created_by": "IR担当者A",
            "tags": ["決算", "業績見通し", "売上高"],
            "similar_faqs": [2, 5],
            "view_count": 156,
            "is_current": True
        },
        {
            "id": 2, 
            "question": "配当政策について教えてください", 
            "answer": "配当性向30%を目標としています。", 
            "status": "published", 
            "confidence": 95,
            "data_sources": [
                {"id": 1, "name": "2024年度第3四半期決算短信", "type": "決算資料", "date": "2024-01-20", "relevance": 85},
                {"id": 3, "name": "中期経営計画", "type": "経営計画", "date": "2024-01-10", "relevance": 80}
            ],
            "valid_from": "2024-01-20",
            "valid_until": "2024-12-31",
            "category": "株主還元",
            "version": "2024-Q3",
            "last_updated": "2024-01-20 14:25:00",
            "created_by": "IR担当者B",
            "tags": ["配当", "株主還元", "配当性向"],
            "similar_faqs": [],
            "view_count": 89,
            "is_current": True
        },
        {
            "id": 3, 
            "question": "ESGへの取り組みは？", 
            "answer": "2030年までにカーボンニュートラルを目指します。", 
            "status": "draft", 
            "confidence": 92,
            "data_sources": [
                {"id": 4, "name": "統合報告書2023", "type": "IR資料", "date": "2023-12-15", "relevance": 90}
            ],
            "valid_from": "2023-12-15",
            "valid_until": "2024-12-31",
            "category": "ESG",
            "version": "2023",
            "last_updated": "2024-01-15 10:20:00",
            "created_by": "IR担当者A",
            "tags": ["ESG", "カーボンニュートラル", "環境"],
            "similar_faqs": [],
            "view_count": 45,
            "is_current": True
        }
    ],
    "data_sources": [
        {"id": 1, "name": "2024年度第3四半期決算短信", "type": "決算資料", "date": "2024-01-20", "status": "公開", "url": "/documents/1"},
        {"id": 2, "name": "2024年度第3四半期決算説明会", "type": "説明会", "date": "2024-01-21", "status": "公開", "url": "/events/1"},
        {"id": 3, "name": "中期経営計画", "type": "経営計画", "date": "2024-01-10", "status": "公開", "url": "/documents/2"},
        {"id": 4, "name": "統合報告書2023", "type": "IR資料", "date": "2023-12-15", "status": "公開", "url": "/documents/3"},
        {"id": 5, "name": "2024年度第2四半期決算短信", "type": "決算資料", "date": "2023-10-20", "status": "公開", "url": "/documents/4"},
        {"id": 6, "name": "2024年度第1四半期決算短信", "type": "決算資料", "date": "2023-07-20", "status": "公開", "url": "/documents/5"}
    ],
    "faq_versions": [
        {
            "faq_id": 1,
            "version": "2024-Q2",
            "question": "2024年度の業績見通しは？",
            "answer": "売上高は前年比12%増の見込みです。",
            "valid_from": "2023-10-20",
            "valid_until": "2024-01-19",
            "data_sources": [{"id": 5, "name": "2024年度第2四半期決算短信", "type": "決算資料", "date": "2023-10-20"}],
            "created_at": "2023-10-20 16:00:00"
        },
        {
            "faq_id": 1,
            "version": "2024-Q1",
            "question": "2024年度の業績見通しは？",
            "answer": "売上高は前年比10%増の見込みです。",
            "valid_from": "2023-07-20",
            "valid_until": "2023-10-19",
            "data_sources": [{"id": 6, "name": "2024年度第1四半期決算短信", "type": "決算資料", "date": "2023-07-20"}],
            "created_at": "2023-07-20 15:30:00"
        }
    ],
    "investors": [
        {"id": 1, "name": "山田太郎", "company": "ABC投資顧問", "type": "機関投資家", "last_contact": "2024-01-15"},
        {"id": 2, "name": "鈴木花子", "company": "個人", "type": "個人投資家", "last_contact": "2024-01-10"},
        {"id": 3, "name": "John Smith", "company": "Global Capital", "type": "海外投資家", "last_contact": "2024-01-08"}
    ],
    "documents": [
        {"id": 1, "name": "2024年度決算短信", "type": "決算資料", "date": "2024-01-20", "status": "公開", "downloads": 145},
        {"id": 2, "name": "中期経営計画", "type": "経営計画", "date": "2024-01-10", "status": "公開", "downloads": 89},
        {"id": 3, "name": "統合報告書2023", "type": "IR資料", "date": "2023-12-15", "status": "公開", "downloads": 234}
    ],
    "news": [
        {"id": 1, "title": "2024年度決算発表のお知らせ", "date": "2024-01-20", "category": "決算", "status": "公開"},
        {"id": 2, "title": "新製品開発に関するお知らせ", "date": "2024-01-15", "category": "製品", "status": "公開"},
        {"id": 3, "title": "役員人事に関するお知らせ", "date": "2024-01-10", "category": "人事", "status": "下書き"}
    ],
    "users": [
        {"id": 1, "name": "管理者", "email": "admin@example.com", "role": "管理者", "status": "アクティブ"},
        {"id": 2, "name": "編集者A", "email": "editor1@example.com", "role": "編集者", "status": "アクティブ"},
        {"id": 3, "name": "閲覧者B", "email": "viewer1@example.com", "role": "閲覧者", "status": "アクティブ"}
    ],
    "audit_logs": [
        {"id": 1, "user": "管理者", "action": "ログイン", "target": "システム", "timestamp": "2024-01-20 15:30:00", "ip": "192.168.1.1"},
        {"id": 2, "user": "編集者A", "action": "FAQ更新", "target": "FAQ ID:1", "timestamp": "2024-01-20 14:25:00", "ip": "192.168.1.2"},
        {"id": 3, "user": "管理者", "action": "ユーザー追加", "target": "閲覧者B", "timestamp": "2024-01-20 13:15:00", "ip": "192.168.1.1"}
    ],
    "events": [
        {"id": 1, "title": "2024年度第3四半期決算発表", "type": "決算発表", "date": "2024-02-15", "time": "15:00", "location": "東証兼オンライン", "status": "予定", "assignee": "IR部門責任者", "description": "TDnetへの開示及びウェブサイトでの公開"},
        {"id": 2, "title": "決算説明会", "type": "説明会", "date": "2024-02-16", "time": "10:00", "location": "オンライン", "status": "準備中", "assignee": "広報担当者A", "description": "機関投資家・アナリスト向け説明会"},
        {"id": 3, "title": "第95期定時株主総会", "type": "株主総会", "date": "2024-06-25", "time": "10:00", "location": "本社大会議室", "status": "予定", "assignee": "経理部門", "description": "年次株主総会"}
    ],
    "email_campaigns": [
        {"id": 1, "subject": "【KAGAMI】決算発表のお知らせ", "template": "決算発表通知", "target_group": "すべての投資家", "recipient_count": 324, "scheduled_date": "2024-02-15 15:30", "status": "配信予約", "open_rate": 0},
        {"id": 2, "subject": "【KAGAMI】新製品開発に関するお知らせ", "template": "ニュースリリース", "target_group": "メール通知希望者", "recipient_count": 156, "scheduled_date": "2024-01-15 10:00", "status": "配信済み", "open_rate": 68},
        {"id": 3, "subject": "【KAGAMI】投資家説明会のご案内", "template": "イベント案内", "target_group": "機関投資家", "recipient_count": 89, "scheduled_date": "2024-01-20 14:00", "status": "下書き", "open_rate": 0}
    ],
    "mailing_groups": [
        {"id": 1, "name": "すべての投資家", "icon": "🌐", "count": 324},
        {"id": 2, "name": "機関投資家", "icon": "🏢", "count": 89},
        {"id": 3, "name": "個人投資家", "icon": "👤", "count": 156},
        {"id": 4, "name": "海外投資家", "icon": "🌍", "count": 45}
    ],
    "roles": [
        {"id": 1, "name": "管理者", "description": "すべての機能にアクセス可能", "user_count": 2, "is_system": True, "permissions": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]},
        {"id": 2, "name": "編集者", "description": "コンテンツの作成・編集が可能", "user_count": 5, "is_system": False, "permissions": [1, 2, 3, 5, 6, 7]},
        {"id": 3, "name": "閲覧者", "description": "閲覧のみ可能", "user_count": 10, "is_system": False, "permissions": [1, 5]},
        {"id": 4, "name": "IR担当者", "description": "IR関連業務の管理", "user_count": 3, "is_system": False, "permissions": [1, 2, 3, 4, 5, 6, 7, 8]}
    ],
    "permissions": [
        {"id": 1, "name": "ダッシュボード閲覧", "description": "ダッシュボードへのアクセス"},
        {"id": 2, "name": "FAQ管理", "description": "FAQの作成・編集・削除"},
        {"id": 3, "name": "ドキュメント管理", "description": "ドキュメントのアップロード・管理"},
        {"id": 4, "name": "ニュース管理", "description": "ニュース・お知らせの作成・編集"},
        {"id": 5, "name": "投資家情報閲覧", "description": "投資家情報の閲覧"},
        {"id": 6, "name": "投資家情報編集", "description": "投資家情報の編集"},
        {"id": 7, "name": "メール配信", "description": "メール配信の作成・送信"},
        {"id": 8, "name": "レポート閲覧", "description": "分析レポートの閲覧"},
        {"id": 9, "name": "ユーザー管理", "description": "ユーザーの作成・編集・削除"},
        {"id": 10, "name": "システム設定", "description": "システム設定の変更"}
    ],
    "api_keys": [
        {"id": 1, "name": "フロントエンドAPI", "key": "sk_live_abcd1234efgh5678ijkl", "key_preview": "sk_live_abcd1234", "scope": "読み取り専用", "last_used": "2024-01-20 10:30", "is_active": True},
        {"id": 2, "name": "データ連携API", "key": "sk_live_mnop9012qrst3456uvwx", "key_preview": "sk_live_mnop9012", "scope": "読み書き", "last_used": "2024-01-19 15:45", "is_active": True},
        {"id": 3, "name": "テストAPI", "key": "sk_test_yzab5678cdef9012ghij", "key_preview": "sk_test_yzab5678", "scope": "テスト用", "last_used": "2024-01-15 09:00", "is_active": False}
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
    # 日付計算
    from datetime import datetime, timedelta
    today = datetime.now().date()
    soon_date = today + timedelta(days=30)
    
    return templates.TemplateResponse("faq.html", {
        "request": request,
        "title": "AI-FAQ管理",
        "faqs": MOCK_DATA["faqs"],
        "data_sources": MOCK_DATA["data_sources"],
        "total_faqs": len(MOCK_DATA["faqs"]),
        "published_count": len([f for f in MOCK_DATA["faqs"] if f["status"] == "published"]),
        "current_version_count": len([f for f in MOCK_DATA["faqs"] if f["is_current"]]),
        "expiring_soon_count": len([f for f in MOCK_DATA["faqs"] if f["valid_until"] < str(soon_date)]),
        "today": str(today),
        "soon_date": str(soon_date)
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
    """データ取込設定画面"""
    return templates.TemplateResponse("upload.html", {
        "request": request,
        "title": "データ取込設定"
    })

@app.get("/upload-confirm", response_class=HTMLResponse)
async def upload_confirm(request: Request):
    """アップロード確認・メタ情報登録画面"""
    # URLパラメータからファイル名を取得（モック用）
    file_name = request.query_params.get("file", "野村AM_投資家面談_20250715.mp4")
    file_type = request.query_params.get("type", "video")
    
    return templates.TemplateResponse("upload-confirm.html", {
        "request": request,
        "title": "アップロード確認・メタ情報登録",
        "file_name": file_name,
        "file_type": file_type,
        "current_time": datetime.now().strftime("%Y年%m月%d日 %H:%M")
    })

@app.get("/dialogue", response_class=HTMLResponse)
async def dialogue_management(request: Request):
    """対話記録管理画面"""
    return templates.TemplateResponse("dialogue.html", {
        "request": request,
        "title": "対話記録管理"
    })

@app.get("/dialogue/analysis", response_class=HTMLResponse)
async def dialogue_analysis(request: Request):
    """AI詳細分析画面（モック）"""
    # URLパラメータからIDを取得
    record_id = request.query_params.get("id", "12345")
    
    return templates.TemplateResponse("dialogue-analysis.html", {
        "request": request,
        "title": "AI詳細分析",
        "record_id": record_id,
        "current_time": datetime.now().strftime("%Y年%m月%d日 %H:%M")
    })

@app.get("/dialogue-analysis", response_class=HTMLResponse)
async def dialogue_analysis_alt(request: Request):
    """AI詳細分析画面（別ルート）"""
    # URLパラメータからIDを取得
    record_id = request.query_params.get("id", "12345")
    
    return templates.TemplateResponse("dialogue-analysis.html", {
        "request": request,
        "title": "AI詳細分析",
        "record_id": record_id,
        "current_time": datetime.now().strftime("%Y年%m月%d日 %H:%M")
    })

@app.get("/dialogue/publish", response_class=HTMLResponse)
async def dialogue_publish(request: Request):
    """対話記録公開確認画面"""
    # URLパラメータからIDを取得
    record_id = request.query_params.get("id", "12345")
    
    return templates.TemplateResponse("dialogue-publish.html", {
        "request": request,
        "title": "確認・公開設定",
        "record_id": record_id,
        "current_time": datetime.now().strftime("%Y年%m月%d日 %H:%M")
    })

@app.get("/dialogue/edit", response_class=HTMLResponse)
async def dialogue_edit(request: Request):
    """対話記録編集画面"""
    # URLパラメータからIDを取得
    record_id = request.query_params.get("id", "meeting_001")
    
    # モックデータ（実際はデータベースから取得）
    mock_dialogue_data = {
        "meeting_001": {
            "title": "2024年第3四半期決算説明会",
            "type": "決算説明会",
            "date": "2024-01-15T14:00",
            "participants": "156",
            "investor_name": "機関投資家全般",
            "investor_type": "国内機関投資家",
            "holding_status": "複数",
            "company_participants": ["CEO - 田中一郎", "CFO - 佐藤二郎"],
            "importance": "最重要",
            "confidentiality": "一般",
            "tags": ["決算", "Q3", "AI事業", "成長戦略"],
            "file_name": "決算説明会_Q3_20240115.mp4",
            "file_size": "456.2MB",
            "duration": "45分"
        },
        "voice_001": {
            "title": "投資家B社との個別面談",
            "type": "個別面談",
            "date": "2024-01-13T10:00",
            "participants": "4",
            "investor_name": "投資家B社",
            "investor_type": "国内機関投資家",
            "holding_status": "主要株主（1-5%）",
            "company_participants": ["CFO - 佐藤二郎", "IR部長 - 山本三郎"],
            "importance": "高",
            "confidentiality": "社内限定",
            "tags": ["個別面談", "財務戦略", "配当政策"],
            "file_name": "投資家B社_面談_20240113.mp3",
            "file_size": "89.5MB",
            "duration": "32分"
        }
    }
    
    # 指定されたIDのデータを取得（デフォルトはmeeting_001）
    dialogue_data = mock_dialogue_data.get(record_id, mock_dialogue_data["meeting_001"])
    
    return templates.TemplateResponse("dialogue-edit.html", {
        "request": request,
        "title": "対話記録編集",
        "record_id": record_id,
        "dialogue_data": dialogue_data,
        "current_time": datetime.now().strftime("%Y年%m月%d日 %H:%M")
    })

@app.get("/analytics", response_class=HTMLResponse)
async def analytics(request: Request):
    """分析・レポート画面"""
    return templates.TemplateResponse("analytics.html", {
        "request": request,
        "title": "分析・レポート",
        "kpis": MOCK_DATA["kpis"]
    })

@app.get("/documents", response_class=HTMLResponse)
async def document_management(request: Request):
    """ドキュメント管理画面"""
    return templates.TemplateResponse("documents.html", {
        "request": request,
        "title": "ドキュメント管理",
        "documents": MOCK_DATA["documents"],
        "total_documents": len(MOCK_DATA["documents"])
    })

@app.get("/news", response_class=HTMLResponse)
async def news_management(request: Request):
    """ニュース管理画面"""
    return templates.TemplateResponse("news.html", {
        "request": request,
        "title": "ニュース・お知らせ管理",
        "news": MOCK_DATA["news"],
        "total_news": len(MOCK_DATA["news"])
    })

@app.get("/users", response_class=HTMLResponse)
async def user_management(request: Request):
    """ユーザー管理画面"""
    return templates.TemplateResponse("users.html", {
        "request": request,
        "title": "ユーザー管理",
        "users": MOCK_DATA["users"],
        "total_users": len(MOCK_DATA["users"])
    })

@app.get("/audit-logs", response_class=HTMLResponse)
async def audit_logs(request: Request):
    """監査ログ画面"""
    return templates.TemplateResponse("audit_logs.html", {
        "request": request,
        "title": "監査ログ",
        "logs": MOCK_DATA["audit_logs"],
        "total_logs": len(MOCK_DATA["audit_logs"])
    })

@app.get("/settings", response_class=HTMLResponse)
async def settings(request: Request):
    """設定画面"""
    return templates.TemplateResponse("settings.html", {
        "request": request,
        "title": "システム設定"
    })

@app.get("/login", response_class=HTMLResponse)
async def login(request: Request):
    """ログイン画面"""
    return templates.TemplateResponse("login.html", {
        "request": request,
        "title": "ログイン"
    })

@app.get("/schedule", response_class=HTMLResponse)
async def schedule_management(request: Request):
    """スケジュール管理画面"""
    # イベント統計を計算
    upcoming_events = len([e for e in MOCK_DATA["events"] if e["status"] in ["予定", "準備中"]])
    this_month_events = 2  # モック
    pending_tasks = 5  # モック
    
    return templates.TemplateResponse("schedule.html", {
        "request": request,
        "title": "スケジュール管理",
        "events": MOCK_DATA["events"],
        "upcoming_events": upcoming_events,
        "this_month_events": this_month_events,
        "pending_tasks": pending_tasks
    })

@app.get("/email-campaigns", response_class=HTMLResponse)
async def email_campaigns(request: Request):
    """メール配信管理画面"""
    # 配信統計を計算
    total_recipients = sum(g["count"] for g in MOCK_DATA["mailing_groups"])
    sent_this_month = 3  # モック
    avg_open_rate = 72  # モック
    scheduled_campaigns = len([c for c in MOCK_DATA["email_campaigns"] if c["status"] == "配信予約"])
    
    return templates.TemplateResponse("email_campaigns.html", {
        "request": request,
        "title": "メール配信管理",
        "campaigns": MOCK_DATA["email_campaigns"],
        "mailing_groups": MOCK_DATA["mailing_groups"],
        "total_recipients": total_recipients,
        "sent_this_month": sent_this_month,
        "avg_open_rate": avg_open_rate,
        "scheduled_campaigns": scheduled_campaigns
    })

@app.get("/permissions", response_class=HTMLResponse)
async def permissions_management(request: Request):
    """権限管理画面"""
    # 権限統計を計算
    total_roles = len(MOCK_DATA["roles"])
    total_permissions = len(MOCK_DATA["permissions"])
    active_sessions = 15  # モック
    
    return templates.TemplateResponse("permissions.html", {
        "request": request,
        "title": "権限管理",
        "roles": MOCK_DATA["roles"],
        "permissions": MOCK_DATA["permissions"],
        "api_keys": MOCK_DATA["api_keys"],
        "total_roles": total_roles,
        "total_permissions": total_permissions,
        "active_sessions": active_sessions
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

@app.get("/api/faqs/{faq_id}/versions")
async def get_faq_versions(faq_id: int):
    """FAQバージョン履歴取得API"""
    versions = [v for v in MOCK_DATA["faq_versions"] if v["faq_id"] == faq_id]
    return {"versions": versions}

@app.get("/api/faqs/{faq_id}/data-sources")
async def get_faq_data_sources(faq_id: int):
    """FAQデータソース取得API"""
    faq = next((f for f in MOCK_DATA["faqs"] if f["id"] == faq_id), None)
    if faq:
        return {"data_sources": faq.get("data_sources", [])}
    return {"data_sources": []}

@app.get("/api/data-sources")
async def get_data_sources():
    """データソース一覧取得API"""
    return {"data_sources": MOCK_DATA["data_sources"]}

@app.post("/api/faqs/{faq_id}/update-version")
async def update_faq_version(faq_id: int, request: Request):
    """FAQバージョン更新API"""
    return {"status": "success", "message": "FAQバージョンを更新しました"}

@app.get("/api/faqs/expiring-soon")
async def get_expiring_faqs():
    """期限切れ間近のFAQ取得API"""
    from datetime import datetime, timedelta
    soon_date = datetime.now().date() + timedelta(days=30)
    expiring_faqs = [f for f in MOCK_DATA["faqs"] if f["valid_until"] < str(soon_date)]
    return {"faqs": expiring_faqs}

@app.post("/api/faqs/bulk-generate")
async def bulk_generate_faqs(request: Request):
    """AI一括生成API"""
    return {"status": "success", "message": "AI一括生成を開始しました"}

@app.get("/api/faqs/export")
async def export_faqs():
    """FAQエクスポートAPI"""
    return {"status": "success", "data": MOCK_DATA["faqs"]}

@app.post("/api/faqs/import")
async def import_faqs(request: Request):
    """FAQインポートAPI"""
    return {"status": "success", "message": "FAQをインポートしました"}

# ===== アプリケーション起動 =====
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
