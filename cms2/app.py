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
    "analytics": {
        "kpis": {
            "active_investors": {
                "value": 418,
                "trend": 12.5,
                "trend_positive": True
            },
            "investor_satisfaction": {
                "value": 94.5,
                "trend": 2.3,
                "trend_positive": True
            },
            "inquiries": {
                "value": 1256,
                "trend": -8.4,
                "trend_positive": False
            },
            "ai_accuracy": {
                "value": 96.8,
                "trend": 1.2,
                "trend_positive": True
            }
        },
        "top_topics": [
            {"name": "財務・業績", "percentage": 85},
            {"name": "経営戦略", "percentage": 72},
            {"name": "ESG", "percentage": 68},
            {"name": "株主還元", "percentage": 45}
        ],
        "investor_types": [
            {
                "type": "機関投資家",
                "count": 68,
                "avg_activity": "月12.5回",
                "satisfaction": 96
            },
            {
                "type": "個人投資家",
                "count": 256,
                "avg_activity": "月3.2回",
                "satisfaction": 94
            },
            {
                "type": "海外投資家",
                "count": 24,
                "avg_activity": "月8.7回",
                "satisfaction": 92
            }
        ],
        "ai_insights": {
            "key_finding": "過去30日間で「中期経営計画」に関する問い合わせが45%増加しています。特に海外投資家からの関心が高まっており、英語版資料の充実が推奨されます。",
            "recommendation": "中期経営計画の進捗レポートを月次で公開することで、投資家の情報ニーズに応えられます。",
            "warning": "ESG関連の問い合わせが前四半期比で20%減少。情報開示の強化を検討してください。",
            "success_story": "AI-FAQ導入により、基本的な問い合わせが60%減少。IR担当者の業務効率が大幅に改善しました。"
        }
    },
    "audit_logs": [
        {
            "id": 1,
            "timestamp": "2024-01-22 15:30:45",
            "event_type": "login",
            "event_name": "ログイン",
            "user_name": "山田 太郎",
            "ip_address": "192.168.1.100",
            "details": "管理者アカウントでログインしました",
            "severity": "info"
        },
        {
            "id": 2,
            "timestamp": "2024-01-22 15:25:12",
            "event_type": "data",
            "event_name": "ドキュメント更新",
            "user_name": "佐藤 花子",
            "ip_address": "192.168.1.101",
            "details": "ドキュメント「2024年第3四半期決算説明資料」を更新しました",
            "severity": "info"
        },
        {
            "id": 3,
            "timestamp": "2024-01-22 14:50:33",
            "event_type": "security",
            "event_name": "ログイン失敗",
            "user_name": "unknown",
            "ip_address": "203.0.113.42",
            "details": "不正なパスワードで3回連続でログインに失敗しました",
            "severity": "warning"
        },
        {
            "id": 4,
            "timestamp": "2024-01-22 14:15:20",
            "event_type": "system",
            "event_name": "システムエラー",
            "user_name": "SYSTEM",
            "ip_address": "127.0.0.1",
            "details": "メール送信サービスへの接続がタイムアウトしました",
            "severity": "critical"
        },
        {
            "id": 5,
            "timestamp": "2024-01-22 13:45:55",
            "event_type": "data",
            "event_name": "FAQ追加",
            "user_name": "鈴木 一郎",
            "ip_address": "192.168.1.102",
            "details": "新規FAQ「配当政策について」を追加しました",
            "severity": "info"
        }
    ],
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
    ],
    "users": [
        {
            "id": 1,
            "name": "山田 太郎",
            "email": "yamada@example.com",
            "department": "IR部",
            "role": "admin",
            "role_display": "管理者",
            "status": "active",
            "last_login": "2024-01-22 15:30"
        },
        {
            "id": 2,
            "name": "佐藤 花子",
            "email": "sato@example.com",
            "department": "経理部",
            "role": "editor",
            "role_display": "編集者",
            "status": "active",
            "last_login": "2024-01-22 14:15"
        },
        {
            "id": 3,
            "name": "鈴木 一郎",
            "email": "suzuki@example.com",
            "department": "広報部",
            "role": "viewer",
            "role_display": "閲覧者",
            "status": "active",
            "last_login": "2024-01-22 09:45"
        },
        {
            "id": 4,
            "name": "田中 美咲",
            "email": "tanaka@example.com",
            "department": "IR部",
            "role": "editor",
            "role_display": "編集者",
            "status": "inactive",
            "last_login": "2024-01-15 16:20"
        }
    ],
    "news": [
        {
            "id": 1,
            "title": "2024年第3四半期決算発表のお知らせ",
            "content": "2024年第3四半期の決算を発表いたします。売上高は前年同期比15%増の1,250億円、営業利益は同20%増の180億円となりました。",
            "category": "ir",
            "category_display": "IR情報",
            "status": "published",
            "publish_date": "2024-01-22",
            "author": "IR部",
            "view_count": 1250,
            "is_important": True
        },
        {
            "id": 2,
            "title": "新製品発表会のご案内",
            "content": "2024年2月15日に新製品発表会を開催いたします。最新のAI技術を活用した革新的な製品をご紹介します。",
            "category": "event",
            "category_display": "イベント",
            "status": "scheduled",
            "publish_date": "2024-02-01",
            "author": "広報部",
            "view_count": 0,
            "is_important": False
        },
        {
            "id": 3,
            "title": "ESGレポート2023を公開しました",
            "content": "当社の環境・社会・ガバナンスへの取り組みをまとめたESGレポート2023を公開しました。",
            "category": "notice",
            "category_display": "お知らせ",
            "status": "published",
            "publish_date": "2024-01-20",
            "author": "ESG推進室",
            "view_count": 856,
            "is_important": False
        },
        {
            "id": 4,
            "title": "【ドラフト】中期経営計画の進捗について",
            "content": "2024-2026年中期経営計画の初年度進捗状況についてお知らせします。",
            "category": "press",
            "category_display": "プレスリリース",
            "status": "draft",
            "publish_date": "2024-01-25",
            "author": "経営企画部",
            "view_count": 0,
            "is_important": False
        }
    ],
    "schedule": [
        {
            "id": 1,
            "title": "2024年第3四半期決算発表",
            "type": "earnings",
            "type_display": "決算発表",
            "date": "2024-01-15",
            "time": "15:00",
            "location": "本社会議室",
            "status": "scheduled",
            "assignee": "IR部門責任者",
            "description": "第3四半期の決算内容を発表します"
        },
        {
            "id": 2,
            "title": "決算説明会",
            "type": "briefing",
            "type_display": "説明会",
            "date": "2024-01-16",
            "time": "10:00",
            "location": "オンライン",
            "status": "preparing",
            "assignee": "広報担当者A",
            "description": "アナリスト向け決算説明会"
        },
        {
            "id": 3,
            "title": "個別投資家面談",
            "type": "meeting",
            "type_display": "株主総会",
            "date": "2024-01-22",
            "time": "14:00",
            "location": "本社応接室",
            "status": "scheduled",
            "assignee": "IR部門責任者",
            "description": "大手機関投資家との面談"
        },
        {
            "id": 4,
            "title": "ESG説明会",
            "type": "other",
            "type_display": "その他",
            "date": "2024-01-10",
            "time": "13:00",
            "location": "オンライン",
            "status": "completed",
            "assignee": "ESG推進室",
            "description": "ESGへの取り組みについて説明"
        }
    ],
    "todays_meetings": [
        {
            "time": "10:00-11:00",
            "type": "conference",
            "type_label": "決算説明会",
            "title": "Q3決算説明会（オンライン）",
            "detail": "参加予定: 120名"
        },
        {
            "time": "14:00-15:00",
            "type": "individual",
            "type_label": "個別面談",
            "title": "海外投資家B社 個別面談",
            "detail": "CFO対応・英語"
        }
    ],
    "meeting_slots": {
        "CEO": {
            "total": 5,
            "used": 3,
            "usage_percentage": 60,
            "next_available": "1/8（水）15:00-16:00"
        },
        "Director": {
            "total": 4,
            "used": 1,
            "usage_percentage": 25,
            "next_available": "12/27（金）14:00-15:00"
        },
        "CFO": {
            "total": 10,
            "used": 8,
            "usage_percentage": 80,
            "next_available": "1/10（金）10:00-11:00"
        }
    },
    "pending_meetings": [
        {
            "id": "req_001",
            "investor_name": "新規海外投資家C社",
            "meeting_type": "CEO",
            "requested_date": "1/12（日）",
            "requested_time": "10:00-11:00",
            "format": "オンライン",
            "investor_info": "北米大手年金基金、運用資産$50B",
            "topics": "長期成長戦略、サステナビリティ方針"
        }
    ],
    "recent_conferences": [
        {
            "title": "Q3決算説明会",
            "date": "2024/12/25",
            "attendees": 156,
            "questions": 23,
            "duration": 75,
            "qa_list": [
                {
                    "id": "qa_001",
                    "timestamp": "00:35:00",
                    "question": "自己資本比率の目標水準と達成時期について、より具体的な計画を教えてください。",
                    "responder": "CFO",
                    "answer": "中期的には45%を目標としており、2026年度末までの達成を目指しています。具体的には、非コア資産の売却で約200億円、運転資本の効率化で100億円の改善を見込んでいます。"
                }
            ]
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

@app.get("/audit-logs", response_class=HTMLResponse)
async def audit_logs(request: Request):
    """監査ログページ"""
    logs_data = MOCK_DATA["audit_logs"]
    
    # 統計情報を計算
    today_events = len([log for log in logs_data if log["timestamp"].startswith("2024-01-22")])
    security_alerts = len([log for log in logs_data if log["event_type"] == "security"])
    system_errors = len([log for log in logs_data if log["severity"] == "critical"])
    active_users = len(set([log["user_name"] for log in logs_data if log["user_name"] not in ["SYSTEM", "unknown"]]))
    
    return templates.TemplateResponse("pages/audit-logs.html", {
        "request": request,
        "logs": logs_data,
        "total_logs": len(logs_data) * 100,  # モック：実際は全件数
        "today_events": today_events,
        "security_alerts": security_alerts,
        "system_errors": system_errors,
        "active_users": active_users,
        "base_url": "/cms2"
    })

@app.get("/analytics", response_class=HTMLResponse)
async def analytics(request: Request):
    """アナリティクスページ"""
    analytics_data = MOCK_DATA["analytics"]
    
    return templates.TemplateResponse("pages/analytics.html", {
        "request": request,
        "kpis": analytics_data["kpis"],
        "top_topics": analytics_data["top_topics"],
        "investor_types": analytics_data["investor_types"],
        "ai_insights": analytics_data["ai_insights"],
        "last_updated": "2024-01-22 15:30",
        "base_url": "/cms2"
    })

@app.get("/schedule", response_class=HTMLResponse)
async def schedule(request: Request):
    """スケジュール管理ページ"""
    schedule_data = MOCK_DATA["schedule"]
    
    # 統計情報を計算
    from datetime import datetime
    today = datetime.now().date()
    
    upcoming_events = len([e for e in schedule_data if datetime.strptime(e["date"], "%Y-%m-%d").date() >= today])
    this_month_events = len([e for e in schedule_data if e["date"].startswith("2024-01")])
    pending_tasks = len([e for e in schedule_data if e["status"] in ["scheduled", "preparing"]])
    completed_events = len([e for e in schedule_data if e["status"] == "completed"])
    
    return templates.TemplateResponse("pages/schedule.html", {
        "request": request,
        "events": schedule_data,
        "upcoming_events": upcoming_events,
        "this_month_events": this_month_events,
        "pending_tasks": pending_tasks,
        "completed_events": completed_events,
        "current_month": "2024年1月",
        "base_url": "/cms2"
    })

@app.get("/news", response_class=HTMLResponse)
async def news(request: Request):
    """ニュース管理ページ"""
    news_data = MOCK_DATA["news"]
    
    # 統計情報を計算
    published_count = len([n for n in news_data if n["status"] == "published"])
    draft_count = len([n for n in news_data if n["status"] == "draft"])
    scheduled_count = len([n for n in news_data if n["status"] == "scheduled"])
    monthly_count = len([n for n in news_data if n["publish_date"].startswith("2024-01")])  # 今月の記事
    
    return templates.TemplateResponse("pages/news.html", {
        "request": request,
        "articles": news_data,
        "published_count": published_count,
        "draft_count": draft_count,
        "scheduled_count": scheduled_count,
        "monthly_count": monthly_count,
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



@app.get("/faq", response_class=HTMLResponse)
async def faq(request: Request):
    """FAQ管理ページ"""
    return templates.TemplateResponse("pages/faq.html", {
        "request": request,
        "faqs": MOCK_DATA["faqs"],
        "base_url": "/cms2"
    })

@app.get("/users", response_class=HTMLResponse)
async def users(request: Request):
    """ユーザー管理ページ"""
    users_data = MOCK_DATA["users"]
    
    # 統計情報を計算
    total_users = len(users_data)
    active_users = len([u for u in users_data if u["status"] == "active"])
    admin_users = len([u for u in users_data if u["role"] == "admin"])
    inactive_users = len([u for u in users_data if u["status"] == "inactive"])
    
    return templates.TemplateResponse("pages/users.html", {
        "request": request,
        "users": users_data,
        "total_users": total_users,
        "active_users": active_users,
        "admin_users": admin_users,
        "inactive_users": inactive_users,
        "base_url": "/cms2"
    })

@app.get("/permissions", response_class=HTMLResponse)
async def permissions(request: Request):
    """権限管理ページ"""
    return templates.TemplateResponse("pages/permissions.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/settings", response_class=HTMLResponse)
async def settings(request: Request):
    """設定ページ"""
    return templates.TemplateResponse("pages/settings.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/login", response_class=HTMLResponse)
async def login(request: Request):
    """ログインページ"""
    return templates.TemplateResponse("pages/login.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/executive-dashboard", response_class=HTMLResponse)
async def executive_dashboard(request: Request):
    """経営陣ダッシュボードページ"""
    return templates.TemplateResponse("pages/executive-dashboard.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/director-dashboard", response_class=HTMLResponse)
async def director_dashboard(request: Request):
    """社外取締役ダッシュボードページ"""
    return templates.TemplateResponse("pages/director-dashboard.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/dialogue", response_class=HTMLResponse)
async def dialogue(request: Request):
    """議事録管理ページ"""
    return templates.TemplateResponse("pages/dialogue.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/dialogue/{dialogue_id}/edit", response_class=HTMLResponse)
async def dialogue_edit(request: Request, dialogue_id: str):
    """議事録編集ページ"""
    return templates.TemplateResponse("pages/dialogue-edit.html", {
        "request": request,
        "dialogue_id": dialogue_id,
        "base_url": "/cms2"
    })

@app.get("/ir-calendar", response_class=HTMLResponse)
async def ir_calendar(request: Request):
    """IRカレンダーページ"""
    return templates.TemplateResponse("pages/ir-calendar.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/ir-calendar-workspace", response_class=HTMLResponse)
async def ir_calendar_workspace(request: Request):
    """IRカレンダー・面談ワークスペースページ"""
    return templates.TemplateResponse("pages/ir-calendar-workspace.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/content-center", response_class=HTMLResponse)
async def content_center(request: Request):
    """コンテンツセンターページ"""
    return templates.TemplateResponse("pages/content-center.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/email-campaigns", response_class=HTMLResponse)
async def email_campaigns(request: Request):
    """メール配信ページ"""
    return templates.TemplateResponse("pages/email-campaigns.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/strategy", response_class=HTMLResponse)
async def strategy(request: Request):
    """IR戦略ページ"""
    return templates.TemplateResponse("pages/strategy.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/upload", response_class=HTMLResponse)
async def upload(request: Request):
    """音声アップロードページ"""
    return templates.TemplateResponse("pages/upload.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/dialogue-analysis", response_class=HTMLResponse)
async def dialogue_analysis(request: Request):
    """対話分析ページ"""
    return templates.TemplateResponse("pages/dialogue-analysis.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/upload-confirm", response_class=HTMLResponse)
async def upload_confirm(request: Request):
    """アップロード確認・メタ情報登録ページ"""
    return templates.TemplateResponse("pages/upload-confirm.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/dialogue-publish", response_class=HTMLResponse)
async def dialogue_publish(request: Request):
    """対話記録の確認・公開設定ページ"""
    return templates.TemplateResponse("pages/dialogue-publish.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/dialogue/faq", response_class=HTMLResponse)
async def dialogue_faq(request: Request):
    """対話FAQ編集ページ"""
    return templates.TemplateResponse("pages/dialogue/faq.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/dialogue/center-workspace", response_class=HTMLResponse)
async def dialogue_center_workspace(request: Request):
    """対話センターワークスペースページ"""
    return templates.TemplateResponse("pages/dialogue/center-workspace.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/dialogue/edit-unified", response_class=HTMLResponse)
async def dialogue_edit_unified(request: Request):
    """統合議事録編集ページ"""
    return templates.TemplateResponse("pages/dialogue/edit-unified.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/dialogue/upload", response_class=HTMLResponse)
async def dialogue_upload(request: Request):
    """対話記録アップロードページ"""
    return templates.TemplateResponse("pages/dialogue-upload.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/ir-feedback", response_class=HTMLResponse)
async def ir_feedback(request: Request):
    """投資家フィードバック管理ページ"""
    return templates.TemplateResponse("pages/ir-feedback.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/strategy-disclosure-assistant", response_class=HTMLResponse)
async def strategy_disclosure_assistant(request: Request):
    """中長期計画開示支援ツールページ"""
    return templates.TemplateResponse("pages/strategy-disclosure-assistant.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/transcription-step", response_class=HTMLResponse)
async def transcription_step(request: Request):
    """文字起こし・編集ページ"""
    return templates.TemplateResponse("pages/transcription-step.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/upload-step", response_class=HTMLResponse)
async def upload_step(request: Request):
    """ファイルアップロードページ"""
    return templates.TemplateResponse("pages/upload-step.html", {
        "request": request,
        "base_url": "/cms2"
    })

@app.get("/meetings", response_class=HTMLResponse)
async def meetings(request: Request):
    """IRミーティング管理ページ"""
    # モックデータの準備
    today = datetime.now()
    
    return templates.TemplateResponse("pages/meetings.html", {
        "request": request,
        "base_url": "/cms2",
        "current_month": today.strftime("%Y年%m月"),
        "today": today.strftime("%m月%d日"),
        "todays_meetings": MOCK_DATA.get("todays_meetings", []),
        "ceo_slots": MOCK_DATA.get("meeting_slots", {}).get("CEO", {}),
        "director_slots": MOCK_DATA.get("meeting_slots", {}).get("Director", {}),
        "cfo_slots": MOCK_DATA.get("meeting_slots", {}).get("CFO", {}),
        "pending_meetings": MOCK_DATA.get("pending_meetings", []),
        "recent_conferences": MOCK_DATA.get("recent_conferences", [])
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

@app.get("/api/users")
async def get_users():
    """ユーザー一覧取得API"""
    return MOCK_DATA["users"]

@app.get("/api/news")
async def get_news():
    """ニュース一覧取得API"""
    return MOCK_DATA["news"]

@app.get("/api/schedule")
async def get_schedule():
    """スケジュール一覧取得API"""
    return MOCK_DATA["schedule"]

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