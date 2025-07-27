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
    "pending_tasks": [
        {
            "id": "task_001",
            "type": "dialogue",
            "title": "野村AMとの面談記録確認",
            "status": "処理待ち",
            "priority": "high",
            "investor": "野村アセットマネジメント",
            "investor_type": "大口機関投資家",
            "created_at": "2024-01-22 08:30",
            "due_date": "2024-01-22",
            "assignee": "IR担当者A",
            "urgency_reason": "決算発表前の重要確認事項あり"
        },
        {
            "id": "task_002",
            "type": "dialogue",
            "title": "海外投資家との電話会議記録",
            "status": "処理待ち",
            "priority": "medium",
            "investor": "BlackRock Inc.",
            "investor_type": "海外機関投資家",
            "created_at": "2024-01-21 17:00",
            "due_date": "2024-01-23",
            "assignee": "IR担当者B",
            "urgency_reason": "ESG関連の追加質問対応"
        },
        {
            "id": "task_003",
            "type": "question",
            "title": "配当政策に関する質問",
            "status": "処理待ち",
            "priority": "medium",
            "investor": "個人投資家",
            "investor_type": "個人投資家",
            "created_at": "2024-01-22 07:00",
            "due_date": "2024-01-24",
            "assignee": "未割当",
            "urgency_reason": "株主総会関連"
        }
    ],
    "todays_schedule": [
        {
            "id": "schedule_001",
            "time": "10:00",
            "title": "投資家B社との個別面談",
            "type": "meeting",
            "location": "本社会議室A",
            "participants": ["CFO", "IR部長"],
            "investor": "投資家B社",
            "importance": "high",
            "preparation_status": "ready",
            "materials": ["決算説明資料", "中期経営計画"]
        },
        {
            "id": "schedule_002",
            "time": "14:00",
            "title": "決算発表準備会議",
            "type": "internal",
            "location": "オンライン",
            "participants": ["経理部", "広報部", "IR部"],
            "importance": "high",
            "preparation_status": "in_progress",
            "tasks_remaining": 3
        },
        {
            "id": "schedule_003",
            "time": "16:00",
            "title": "アナリスト向けスモールミーティング",
            "type": "briefing",
            "location": "オンライン",
            "participants": ["CEO", "CFO"],
            "investor": "証券アナリスト5名",
            "importance": "medium",
            "preparation_status": "ready",
            "registered_count": 5
        }
    ],
    "urgent_items": [
        {
            "type": "alert",
            "title": "決算短信の最終確認",
            "deadline": "本日 17:00",
            "status": "対応中",
            "assignee": "経理部",
            "progress": 85
        },
        {
            "type": "reminder",
            "title": "FAQ更新期限（3件）",
            "deadline": "明日",
            "status": "未着手",
            "items": ["業績見通し", "設備投資計画", "株主還元方針"]
        }
    ],
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
            "answer": "売上高は前年比15%増の見込みです。利益面では営業利益率が改善し、ROEも向上する予定です。特にAI事業の成長が全体業績を牽引しています。", 
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
            "view_count": 256,
            "is_current": True
        },
        {
            "id": 2, 
            "question": "配当政策について教えてください", 
            "answer": "配当性向30%を目標とし、安定的な配当の継続を基本方針としています。業績向上に伴い、段階的な増配も検討しています。", 
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
            "similar_faqs": [8],
            "view_count": 189,
            "is_current": True
        },
        {
            "id": 3, 
            "question": "ESGへの取り組みは？", 
            "answer": "2030年までにカーボンニュートラルを目指し、再生可能エネルギーの活用やデジタル化による効率化を推進しています。ESG経営委員会を設置し、持続可能な成長を追求しています。", 
            "status": "published", 
            "confidence": 92,
            "data_sources": [
                {"id": 4, "name": "統合報告書2023", "type": "IR資料", "date": "2023-12-15", "relevance": 90}
            ],
            "valid_from": "2023-12-15",
            "valid_until": "2024-12-31",
            "category": "ESG",
            "version": "2024-Q3",
            "last_updated": "2024-01-15 10:20:00",
            "created_by": "IR担当者A",
            "tags": ["ESG", "カーボンニュートラル", "環境"],
            "similar_faqs": [4],
            "view_count": 145,
            "is_current": True
        },
        {
            "id": 4,
            "question": "中期経営計画の進捗状況はいかがですか？",
            "answer": "2022年に策定した3カ年計画は順調に進捗しており、売上高・利益とも計画を上回るペースです。特にデジタルトランスフォーメーション投資の効果が表れています。",
            "status": "published",
            "confidence": 94,
            "data_sources": [
                {"id": 3, "name": "中期経営計画", "type": "経営計画", "date": "2024-01-10", "relevance": 95},
                {"id": 1, "name": "2024年度第3四半期決算短信", "type": "決算資料", "date": "2024-01-20", "relevance": 88}
            ],
            "valid_from": "2024-01-10",
            "valid_until": "2025-03-31",
            "category": "経営戦略",
            "version": "2024-Q3",
            "last_updated": "2024-01-18 11:15:00",
            "created_by": "IR担当者A",
            "tags": ["中期経営計画", "戦略", "DX"],
            "similar_faqs": [1, 5],
            "view_count": 134,
            "is_current": True
        },
        {
            "id": 5,
            "question": "AI事業の成長戦略について詳しく教えてください",
            "answer": "AI事業は今後5年間で売上を10倍に拡大する計画です。金融・製造・ヘルスケア分野での展開を加速し、独自技術を活かした差別化戦略を推進します。",
            "status": "published",
            "confidence": 96,
            "data_sources": [
                {"id": 3, "name": "中期経営計画", "type": "経営計画", "date": "2024-01-10", "relevance": 92},
                {"id": 5, "name": "AI事業戦略説明会", "type": "説明会", "date": "2024-01-15", "relevance": 95}
            ],
            "valid_from": "2024-01-15",
            "valid_until": "2025-01-31",
            "category": "経営戦略",
            "version": "2024-Q3",
            "last_updated": "2024-01-19 16:45:00",
            "created_by": "IR担当者C",
            "tags": ["AI", "成長戦略", "新規事業"],
            "similar_faqs": [1, 4],
            "view_count": 178,
            "is_current": True
        },
        {
            "id": 6,
            "question": "株主総会の開催予定について教えてください",
            "answer": "第95期定時株主総会は2024年6月25日に開催予定です。今年も一部オンライン配信を実施し、より多くの株主様にご参加いただけるよう準備しています。",
            "status": "published",
            "confidence": 100,
            "data_sources": [
                {"id": 6, "name": "株主総会招集通知", "type": "株主総会資料", "date": "2024-01-22", "relevance": 100}
            ],
            "valid_from": "2024-01-22",
            "valid_until": "2024-06-30",
            "category": "株主還元",
            "version": "2024-Q3",
            "last_updated": "2024-01-22 09:30:00",
            "created_by": "IR担当者B",
            "tags": ["株主総会", "開催予定", "オンライン"],
            "similar_faqs": [],
            "view_count": 89,
            "is_current": True
        },
        {
            "id": 7,
            "question": "海外展開の状況と今後の計画は？",
            "answer": "アジア・太平洋地域での売上が全体の20%を占めるまで成長しました。今後は欧州・北米市場への展開も視野に入れ、グローバル企業としての基盤強化を図ります。",
            "status": "published",
            "confidence": 91,
            "data_sources": [
                {"id": 7, "name": "グローバル戦略説明資料", "type": "戦略資料", "date": "2024-01-12", "relevance": 93}
            ],
            "valid_from": "2024-01-12",
            "valid_until": "2024-12-31",
            "category": "経営戦略",
            "version": "2024-Q3",
            "last_updated": "2024-01-17 14:20:00",
            "created_by": "IR担当者A",
            "tags": ["海外展開", "グローバル", "成長戦略"],
            "similar_faqs": [4, 5],
            "view_count": 67,
            "is_current": True
        },
        {
            "id": 8,
            "question": "自社株買いの実施予定はありますか？",
            "answer": "資本効率の向上を目的として、適切なタイミングでの自社株買いを検討しています。財務状況と投資機会のバランスを見ながら判断します。",
            "status": "draft",
            "confidence": 87,
            "data_sources": [
                {"id": 8, "name": "財務戦略委員会議事録", "type": "内部資料", "date": "2024-01-19", "relevance": 85}
            ],
            "valid_from": "2024-01-19",
            "valid_until": "2024-03-31",
            "category": "株主還元",
            "version": "2024-Q3",
            "last_updated": "2024-01-21 13:40:00",
            "created_by": "IR担当者B",
            "tags": ["自社株買い", "資本効率", "株主還元"],
            "similar_faqs": [2],
            "view_count": 52,
            "is_current": True
        },
        {
            "id": 9,
            "question": "サステナビリティ経営の具体的な取り組みは？",
            "answer": "気候変動対応、多様性推進、サプライチェーン管理の3つを柱として取り組んでいます。2024年にはサステナビリティ委員会を新設し、より体系的な推進体制を構築しました。",
            "status": "published",
            "confidence": 93,
            "data_sources": [
                {"id": 9, "name": "サステナビリティレポート2024", "type": "ESG資料", "date": "2024-01-08", "relevance": 96}
            ],
            "valid_from": "2024-01-08",
            "valid_until": "2024-12-31",
            "category": "ESG",
            "version": "2024-Q3",
            "last_updated": "2024-01-16 10:55:00",
            "created_by": "IR担当者A",
            "tags": ["サステナビリティ", "ESG", "委員会"],
            "similar_faqs": [3],
            "view_count": 98,
            "is_current": True
        },
        {
            "id": 10,
            "question": "競合他社との差別化要因は何ですか？",
            "answer": "独自のAI技術、豊富な顧客データ、強固なパートナーシップが当社の主要な差別化要因です。特に特許技術による技術的優位性は今後も維持していく予定です。",
            "status": "published",
            "confidence": 89,
            "data_sources": [
                {"id": 10, "name": "競合分析レポート", "type": "分析資料", "date": "2024-01-05", "relevance": 91}
            ],
            "valid_from": "2024-01-05",
            "valid_until": "2024-06-30",
            "category": "経営戦略",
            "version": "2024-Q3",
            "last_updated": "2024-01-14 15:10:00",
            "created_by": "IR担当者C",
            "tags": ["競合優位性", "差別化", "技術"],
            "similar_faqs": [5, 7],
            "view_count": 76,
            "is_current": True
        }
    ],
    "data_sources": [
        {"id": 1, "name": "2024年度第3四半期決算短信", "type": "決算資料", "date": "2024-01-20", "status": "公開", "url": "/documents/1"},
        {"id": 2, "name": "2024年度第3四半期決算説明会", "type": "説明会", "date": "2024-01-21", "status": "公開", "url": "/events/1"},
        {"id": 3, "name": "中期経営計画", "type": "経営計画", "date": "2024-01-10", "status": "公開", "url": "/documents/2"},
        {"id": 4, "name": "統合報告書2023", "type": "IR資料", "date": "2023-12-15", "status": "公開", "url": "/documents/3"},
        {"id": 5, "name": "AI事業戦略説明会", "type": "説明会", "date": "2024-01-15", "status": "公開", "url": "/events/2"},
        {"id": 6, "name": "株主総会招集通知", "type": "株主総会資料", "date": "2024-01-22", "status": "公開", "url": "/documents/4"},
        {"id": 7, "name": "グローバル戦略説明資料", "type": "戦略資料", "date": "2024-01-12", "status": "公開", "url": "/documents/5"},
        {"id": 8, "name": "財務戦略委員会議事録", "type": "内部資料", "date": "2024-01-19", "status": "限定公開", "url": "/documents/6"},
        {"id": 9, "name": "サステナビリティレポート2024", "type": "ESG資料", "date": "2024-01-08", "status": "公開", "url": "/documents/7"},
        {"id": 10, "name": "競合分析レポート", "type": "分析資料", "date": "2024-01-05", "status": "公開", "url": "/documents/8"},
        {"id": 11, "name": "2024年度第2四半期決算短信", "type": "決算資料", "date": "2023-10-20", "status": "公開", "url": "/documents/9"},
        {"id": 12, "name": "2024年度第1四半期決算短信", "type": "決算資料", "date": "2023-07-20", "status": "公開", "url": "/documents/10"}
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
    ],
    # 社外取締役向けデータ
    "company_info": {
        "stock_code": "9999",  # 証券コード（モック）
        "company_name": "株式会社KAGAMI",
        "market": "東証プライム",
        "fiscal_year_end": "3月",
        "latest_earnings_date": "2024-11-10",
        "next_earnings_date": "2025-02-15"
    },
    "period_data": {
        "month": {
            "start": "2024-12-15",
            "end": "2025-01-15",
            "investor_meetings": 12,
            "compliance_score": 98,
            "investor_satisfaction": 76
        },
        "quarter": {
            "start": "2024-10-01",
            "end": "2024-12-31",
            "investor_meetings": 45,
            "compliance_score": 98,
            "investor_satisfaction": 78
        },
        "q3": {
            "start": "2024-07-01",
            "end": "2024-09-30",
            "investor_meetings": 38,
            "compliance_score": 97,
            "investor_satisfaction": 75
        },
        "h2": {
            "start": "2024-07-01",
            "end": "2024-12-31",
            "investor_meetings": 83,
            "compliance_score": 97.5,
            "investor_satisfaction": 76.5
        },
        "h1": {
            "start": "2024-04-01",
            "end": "2024-06-30",
            "investor_meetings": 73,
            "compliance_score": 96,
            "investor_satisfaction": 72
        },
        "year": {
            "start": "2024-04-01",
            "end": "2025-03-31",
            "investor_meetings": 156,
            "compliance_score": 97,
            "investor_satisfaction": 75
        }
    },
    "governance_overview": {
        "compliance_score": {
            "value": 98, 
            "trend": "stable", 
            "label": "コンプライアンススコア",
            "description": "内部監査・外部監査の指摘事項対応率、法令遵守状況を総合評価",
            "benchmark": "業界平均: 92%",
            "calculation": "(対応完了項目数/全指摘項目数) × 重要度加重平均"
        },
        "board_effectiveness": {
            "value": 85, 
            "trend": "+3%", 
            "label": "取締役会実効性評価",
            "description": "第三者評価機関による年次評価。議論の質、情報提供、意思決定プロセスを評価",
            "benchmark": "TOPIX100平均: 82%",
            "details_link": "/board-effectiveness-report"
        },
        "risk_alerts": {
            "value": 2, 
            "items": [
                {"title": "ESG目標達成リスク", "level": "中", "deadline": "Q2対応必要"},
                {"title": "サイバーセキュリティ体制", "level": "低", "deadline": "Q3検討"}
            ],
            "label": "要注意リスク",
            "description": "取締役会での議論・対応が必要なリスク項目"
        },
        "investor_satisfaction": {
            "value": 78,
            "trend": "+5%",
            "label": "投資家満足度",
            "description": "四半期ごとの投資家サーベイ結果。経営戦略への理解度、情報開示の充実度、対話の質を総合評価",
            "calculation": "(戦略理解度×0.4 + 情報開示充実度×0.3 + 対話満足度×0.3) × 100",
            "breakdown": {
                "strategy_understanding": 82,
                "disclosure_quality": 75,
                "dialogue_satisfaction": 76
            }
        }
    },
    "strategic_issues": [
        {
            "id": "issue_001",
            "title": "ESG経営の推進と実効性",
            "category": "ESG/サステナビリティ",
            "risk_level": "中",
            "impact": "高",
            "status": "対応中",
            "description": "2030年カーボンニュートラル目標に向けた具体的な実行計画と投資判断の妥当性について、投資家から継続的な説明要求があります。",
            "board_action_required": "四半期ごとの進捗レビューと戦略の妥当性評価",
            "investor_concerns": 23,
            "last_discussion": "2024-01-15 取締役会",
            "kpi_progress": {
                "co2_reduction": {"target": -30, "actual": -12, "unit": "%"},
                "renewable_energy": {"target": 50, "actual": 28, "unit": "%"}
            },
            "related_documents": [
                {"name": "ESGロードマップ2030", "date": "2023-12-01"},
                {"name": "第3四半期進捗報告", "date": "2024-01-20"}
            ]
        },
        {
            "id": "issue_002",
            "title": "デジタルトランスフォーメーションの進捗",
            "category": "経営戦略",
            "risk_level": "中",
            "impact": "高",
            "status": "モニタリング",
            "description": "AI活用を含むDX投資の費用対効果と、競合他社との差別化戦略について、より明確な説明が求められています。",
            "board_action_required": "投資効果の定期的な検証と戦略見直し",
            "investor_concerns": 18,
            "last_discussion": "2024-01-10 戦略委員会",
            "investment_status": {
                "total_budget": "50億円",
                "spent": "18億円",
                "roi_forecast": "3年後に黒字化見込み"
            },
            "competitor_benchmark": [
                {"company": "競合A社", "dx_investment": "80億円", "focus": "AI自動化"},
                {"company": "競合B社", "dx_investment": "45億円", "focus": "プラットフォーム構築"}
            ]
        },
        {
            "id": "issue_003",
            "title": "グローバルガバナンス体制の強化",
            "category": "ガバナンス",
            "risk_level": "低",
            "impact": "中",
            "status": "計画中",
            "description": "海外子会社のガバナンス体制強化と、グループ全体のリスク管理体制の統合について検討が必要です。",
            "board_action_required": "海外子会社ガバナンス方針の承認",
            "investor_concerns": 8,
            "last_discussion": "2023-12-20 監査委員会",
            "implementation_plan": {
                "phase1": {"period": "2024 Q2", "action": "現状調査・課題整理"},
                "phase2": {"period": "2024 Q3", "action": "ガバナンス方針策定"},
                "phase3": {"period": "2024 Q4", "action": "段階的実施開始"}
            }
        }
    ],
    "quarterly_trends": {
        "investor_sentiment": [
            {"quarter": "Q1 2024", "value": 72, "label": "投資家センチメント"},
            {"quarter": "Q2 2024", "value": 75, "label": "投資家センチメント"},
            {"quarter": "Q3 2024", "value": 78, "label": "投資家センチメント"},
            {"quarter": "Q4 2024", "value": 82, "label": "投資家センチメント"}
        ],
        "shareholder_composition": [
            {"type": "機関投資家", "percentage": 65, "change": "+2%", "major_holders": ["野村AM", "大和AM", "三菱UFJ信託"]},
            {"type": "個人投資家", "percentage": 20, "change": "-1%", "trend_reason": "高配当銘柄へのシフト"},
            {"type": "海外投資家", "percentage": 15, "change": "-1%", "regions": {"北米": 8, "欧州": 5, "アジア": 2}}
        ]
    },
    "risk_monitoring": {
        "early_warning_indicators": [
            {
                "indicator": "投資家懸念度指数",
                "current": 65,
                "threshold": 70,
                "trend": "上昇",
                "status": "注意",
                "description": "投資家との対話で表明された懸念事項の頻度と深刻度を指数化"
            },
            {
                "indicator": "メディアセンチメント",
                "current": 72,
                "threshold": 60,
                "trend": "安定",
                "status": "正常",
                "description": "主要メディアでの報道内容のポジティブ/ネガティブ分析"
            },
            {
                "indicator": "議決権行使反対率予測",
                "current": 15,
                "threshold": 20,
                "trend": "横ばい",
                "status": "正常",
                "description": "次回株主総会での反対票率のAI予測値"
            }
        ],
        "risk_correlation_matrix": {
            "ESG目標未達": {"DX遅延": "高", "人材流出": "中", "規制強化": "高"},
            "DX遅延": {"競争力低下": "高", "収益性悪化": "中"},
            "ガバナンス不備": {"レピュテーション": "高", "投資家離れ": "中"}
        }
    },
    "board_agenda_items": [
        {
            "meeting_date": "2024-02-15",
            "title": "第4四半期決算承認",
            "type": "定例",
            "materials_ready": True,
            "pre_briefing": "2024-02-10",
            "key_decisions": [
                "決算数値の承認",
                "配当金の決定",
                "業績予想の修正要否"
            ],
            "pre_reading_time": "約2時間",
            "related_issues": ["財務・業績"]
        },
        {
            "meeting_date": "2024-02-20",
            "title": "中期経営計画レビュー",
            "type": "臨時",
            "materials_ready": False,
            "pre_briefing": "2024-02-18",
            "key_decisions": [
                "計画の進捗評価",
                "戦略の修正要否",
                "追加投資の承認"
            ],
            "pre_reading_time": "約3時間",
            "related_issues": ["中期経営計画の実現可能性", "DX投資効果"],
            "external_advisor": "〇〇コンサルティング（戦略レビュー）"
        },
        {
            "meeting_date": "2024-03-15",
            "title": "役員報酬制度の見直し",
            "type": "定例",
            "materials_ready": False,
            "pre_briefing": "2024-03-10",
            "key_decisions": [
                "報酬体系の変更",
                "業績連動指標の見直し",
                "株式報酬の導入"
            ],
            "pre_reading_time": "約1.5時間",
            "related_issues": ["ガバナンス"],
            "benchmark_data": "TOPIX100企業の報酬水準分析付き"
        }
    ],
    "external_evaluations": [
        {
            "evaluator": "日本コーポレート・ガバナンス・ネットワーク",
            "rating": "A",
            "date": "2024-01-15",
            "key_points": ["独立社外取締役の割合が適切", "指名・報酬委員会の独立性確保", "情報開示の透明性"]
        },
        {
            "evaluator": "ISS (Institutional Shareholder Services)",
            "rating": "良好",
            "date": "2023-12-20",
            "key_points": ["取締役会の多様性向上", "ESG取り組みの進展", "株主還元方針の明確化"]
        }
    ],
    "compliance_incidents": [
        {"date": "過去6ヶ月", "count": 0, "severity": "該当なし"}
    ],
    "investor_dialogue_summary": {
        "total_meetings": 156,
        "by_type": {
            "機関投資家": {"count": 89, "percentage": 57},
            "個人投資家": {"count": 45, "percentage": 29},
            "海外投資家": {"count": 15, "percentage": 10},
            "議決権行使助言会社": {"count": 4, "percentage": 2},
            "アクティビスト": {"count": 3, "percentage": 2}
        },
        "by_topic": {
            "経営戦略": {"count": 134, "trend": "増加"},
            "財務・業績": {"count": 98, "trend": "横ばい"},
            "ESG": {"count": 87, "trend": "急増"},
            "ガバナンス": {"count": 56, "trend": "増加"},
            "配当・還元": {"count": 43, "trend": "横ばい"}
        },
        "concern_themes": [
            {
                "theme": "中期経営計画の実現可能性",
                "mentions": 45,
                "investor_types": ["機関投資家", "海外投資家"],
                "sentiment": "懸念",
                "key_points": [
                    "新規事業の収益化時期の明確化",
                    "既存事業とのシナジー効果",
                    "投資回収の見通し"
                ]
            },
            {
                "theme": "ESG目標とコスト負担",
                "mentions": 38,
                "investor_types": ["海外投資家", "議決権行使助言会社"],
                "sentiment": "要改善",
                "key_points": [
                    "具体的なロードマップの提示",
                    "投資額と期待効果のバランス",
                    "業界内でのポジショニング"
                ]
            },
            {
                "theme": "デジタル化投資の効果",
                "mentions": 32,
                "investor_types": ["機関投資家", "アクティビスト"],
                "sentiment": "注視",
                "key_points": [
                    "競合他社との差別化要因",
                    "ROIの具体的な測定方法",
                    "人材確保・育成計画"
                ]
            }
        ]
    },
    "key_investor_meetings": [
        {
            "id": "meeting_001",
            "date": "2024-01-20",
            "investor_type": "議決権行使助言会社",
            "investor_name": "ISS",
            "participants": "CFO、社外取締役2名",
            "duration": "90分",
            "topics": ["役員報酬", "ESG目標", "資本効率"],
            "discussion_points": [
                {
                    "topic": "役員報酬",
                    "concern": "業績連動部分の割合と評価指標",
                    "response": "中長期インセンティブの導入を検討中",
                    "satisfaction": "概ね理解"
                },
                {
                    "topic": "ESG目標",
                    "concern": "2030年目標の実現可能性",
                    "response": "詳細ロードマップを次回開示予定",
                    "satisfaction": "追加説明要"
                }
            ],
            "outcome": "概ね好意的な評価",
            "follow_up_required": "ESG目標の定量化",
            "next_meeting": "2024-04-15（予定）"
        },
        {
            "id": "meeting_002",
            "date": "2024-01-15",
            "investor_type": "アクティビスト投資家",
            "investor_name": "〇〇キャピタル",
            "participants": "CEO、CFO、社外取締役1名",
            "duration": "120分",
            "topics": ["資本政策", "事業ポートフォリオ"],
            "discussion_points": [
                {
                    "topic": "資本政策",
                    "concern": "余剰資金の活用方法",
                    "response": "成長投資と株主還元のバランスを検討",
                    "satisfaction": "継続協議"
                },
                {
                    "topic": "事業ポートフォリオ",
                    "concern": "非中核事業の見直し",
                    "response": "事業評価基準の明確化を進行中",
                    "satisfaction": "方向性合意"
                }
            ],
            "outcome": "建設的な対話",
            "follow_up_required": "資本効率改善策の検討",
            "next_meeting": "2024-03-10（予定）"
        }
    ],
    # 経営陣向けデータ
    "top_concerns": [
        {
            "title": "中期経営計画の進捗への懸念",
            "description": "特に新規事業の収益化時期と投資回収見込みについて、複数の機関投資家から質問が集中しています。",
            "mention_count": 23,
            "importance": "高",
            "color": "red"
        },
        {
            "title": "ESG目標達成の実現可能性",
            "description": "2030年カーボンニュートラル目標に対する具体的なロードマップと投資額について説明を求められています。",
            "mention_count": 18,
            "importance": "高",
            "color": "orange"
        },
        {
            "title": "配当政策の持続可能性",
            "description": "成長投資と株主還元のバランスについて、より明確な方針説明が求められています。",
            "mention_count": 15,
            "importance": "中",
            "color": "yellow"
        },
        {
            "title": "競合他社との差別化戦略",
            "description": "市場シェア拡大のための具体的な施策と、技術優位性の維持方法について関心が高まっています。",
            "mention_count": 12,
            "importance": "中",
            "color": "blue"
        },
        {
            "title": "サプライチェーンリスク管理",
            "description": "地政学的リスクへの対応策と、代替調達先の確保状況について説明が求められています。",
            "mention_count": 8,
            "importance": "中",
            "color": "purple"
        }
    ],
    "recommended_actions": [
        {
            "title": "中期経営計画の進捗説明会を開催",
            "description": "新規事業の詳細なKPIと収益化シナリオを含む、包括的な進捗説明会の開催を推奨します。",
            "priority": "緊急",
            "priority_color": "red",
            "icon": "📊"
        },
        {
            "title": "ESGロードマップの可視化資料作成",
            "description": "具体的な投資額、削減目標、マイルストーンを明示した詳細資料の作成と公開が必要です。",
            "priority": "高",
            "priority_color": "orange",
            "icon": "🌱"
        },
        {
            "title": "投資家との個別面談強化",
            "description": "主要機関投資家との1on1面談を増やし、懸念事項に対する直接対話の機会を設けることを推奨します。",
            "priority": "中",
            "priority_color": "blue",
            "icon": "🤝"
        }
    ],
    "important_meetings": [
        {
            "investor": "野村アセットマネジメント",
            "date": "2024-01-24",
            "time": "10:00-11:00",
            "agenda": "中期経営計画の進捗確認",
            "type": "重要",
            "priority_color": "red"
        },
        {
            "investor": "BlackRock Inc.",
            "date": "2024-01-25",
            "time": "15:00-16:00",
            "agenda": "ESG戦略について",
            "type": "海外",
            "priority_color": "orange"
        },
        {
            "investor": "三菱UFJ信託銀行",
            "date": "2024-01-26",
            "time": "13:00-14:00",
            "agenda": "決算説明・業績見通し",
            "type": "定例",
            "priority_color": "blue"
        }
    ],
    "skill_tip": {
        "weekly_point": "数字だけでなく、ビジョンとストーリーを語ることで投資家の共感を得られます。具体例を交えた説明が効果的です。",
        "trainings": [
            "質疑応答シミュレーション（想定問答集の活用）",
            "プレゼンテーション話法トレーニング",
            "投資家心理の理解セミナー受講"
        ]
    },
    "recent_feedback": [
        {
            "investor": "大手機関投資家A",
            "comment": "経営陣の説明が分かりやすく、戦略の方向性に納得感がある",
            "date": "2024-01-20",
            "sentiment_icon": "😊",
            "sentiment_color": "green"
        },
        {
            "investor": "海外投資家B",
            "comment": "ESGの具体的な実行計画をもっと詳しく知りたい",
            "date": "2024-01-19",
            "sentiment_icon": "🤔",
            "sentiment_color": "yellow"
        },
        {
            "investor": "アナリストC",
            "comment": "競合比較の観点から、差別化要因をより明確に示してほしい",
            "date": "2024-01-18",
            "sentiment_icon": "💭",
            "sentiment_color": "orange"
        }
    ]
}

# ===== ルートハンドラー =====

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """ダッシュボード画面"""
    from datetime import datetime, timedelta
    import random
    
    # 新しいミーティング処理データの追加
    active_meetings = [
        {
            "id": "meeting_001",
            "title": "野村AMとの面談記録",
            "investor_name": "野村アセットマネジメント",
            "investor_type": "大口機関投資家",
            "date": "2024-01-22 10:00",
            "duration": "1時間30分",
            "priority": "high",
            "days_elapsed": 2,
            "is_urgent": False,
            "stages": {
                "upload": {
                    "status": "completed",
                    "files": ["🎥", "🎤", "📄"]
                },
                "transcription": {
                    "status": "completed",
                    "duration": "15分",
                    "progress": 100
                },
                "ai_summary": {
                    "status": "completed"
                },
                "faq": {
                    "status": "in_progress",
                    "draft_count": 3,
                    "count": 0
                },
                "review": {
                    "status": "waiting"
                },
                "publish": {
                    "status": "waiting"
                }
            }
        },
        {
            "id": "meeting_002",
            "title": "BlackRock定例ミーティング",
            "investor_name": "BlackRock Inc.",
            "investor_type": "海外機関投資家",
            "date": "2024-01-21 17:00",
            "duration": "45分",
            "priority": "high",
            "days_elapsed": 3,
            "is_urgent": False,
            "stages": {
                "upload": {
                    "status": "completed",
                    "files": ["💻", "🎤"]
                },
                "transcription": {
                    "status": "processing",
                    "progress": 65
                },
                "ai_summary": {
                    "status": "waiting"
                },
                "faq": {
                    "status": "waiting"
                },
                "review": {
                    "status": "waiting"
                },
                "publish": {
                    "status": "waiting"
                }
            }
        },
        {
            "id": "meeting_003",
            "title": "個人投資家説明会",
            "investor_name": "個人投資家（30名）",
            "investor_type": "個人投資家",
            "date": "2024-01-20 14:00",
            "duration": "2時間",
            "priority": "medium",
            "days_elapsed": 4,
            "is_urgent": True,
            "stages": {
                "upload": {
                    "status": "pending"
                },
                "transcription": {
                    "status": "waiting"
                },
                "ai_summary": {
                    "status": "waiting"
                },
                "faq": {
                    "status": "waiting"
                },
                "review": {
                    "status": "waiting"
                },
                "publish": {
                    "status": "waiting"
                }
            }
        },
        {
            "id": "meeting_004",
            "title": "アナリスト向けスモールミーティング",
            "investor_name": "証券アナリスト5名",
            "investor_type": "アナリスト",
            "date": "2024-01-19 16:00",
            "duration": "1時間",
            "priority": "high",
            "days_elapsed": 5,
            "is_urgent": True,
            "stages": {
                "upload": {
                    "status": "completed",
                    "files": ["💻", "📄"]
                },
                "transcription": {
                    "status": "completed",
                    "duration": "10分"
                },
                "ai_summary": {
                    "status": "completed"
                },
                "faq": {
                    "status": "completed",
                    "count": 5
                },
                "review": {
                    "status": "approved",
                    "approver": "IR部長"
                },
                "publish": {
                    "status": "ready"
                }
            }
        }
    ]
    
    urgent_meetings = [m for m in active_meetings if m["is_urgent"]]
    
    # 本日のミーティング数（モック）
    todays_meetings = 3
    
    # KPIデータ（モック）
    processing_efficiency = 87
    avg_processing_time = "2.5時間"
    ai_usage_rate = 92
    ai_automated_tasks = 156
    ai_improvement = 15
    investor_satisfaction = 95
    
    # 処理完了時の追加データ
    todays_schedule = {
        "meetings": 3,
        "followups": 5,
        "reports": 2
    }
    
    priority_followups = [
        {"name": "野村アセットマネジメント", "priority": "high", "reason": "追加質問"},
        {"name": "BlackRock Inc.", "priority": "high", "reason": "ESG懸念"},
        {"name": "三菱UFJ信託銀行", "priority": "medium", "reason": "定期確認"},
        {"name": "個人投資家グループ", "priority": "medium", "reason": "配当質問"}
    ]
    
    executive_reports = {
        "weekly_status": "作成中",
        "concerns": 3,
        "next_board_meeting": "2月15日"
    }
    
    weekly_summary = {
        "period": "2024年1月15日〜21日",
        "total_meetings": 12,
        "avg_processing_time": "2.3時間",
        "ai_usage": 95,
        "satisfaction_score": 4.3,
        "top_topics": [
            {"name": "AI事業戦略", "count": 8, "percentage": 67},
            {"name": "ESG目標", "count": 6, "percentage": 50},
            {"name": "財務見通し", "count": 5, "percentage": 42}
        ],
        "concerns": [
            {"issue": "AI投資のROI明確化", "mentions": 5},
            {"issue": "ESG目標の実現可能性", "mentions": 4}
        ]
    }
    
    performance_metrics = {
        "transcription_accuracy": 96,
        "summary_quality": 89,
        "faq_efficiency": 92,
        "ai_recommendation": "文字起こし精度が向上しています。FAQ作成時により多くのコンテキストを活用することをお勧めします。"
    }
    
    investor_engagement = [
        {"type": "機関投資家", "count": 45, "meetings": 89, "satisfaction": 4.2},
        {"type": "海外投資家", "count": 15, "meetings": 28, "satisfaction": 3.8},
        {"type": "個人投資家", "count": 156, "meetings": 45, "satisfaction": 4.5}
    ]
    
    # 52週分の処理件数データ（モック）
    weekly_processing_data = []
    current_date = datetime.now()
    for week in range(52):
        week_date = current_date - timedelta(weeks=52-week)
        # 季節性を考慮したランダムデータ生成
        base_count = 5
        if week_date.month in [2, 5, 8, 11]:  # 決算発表時期
            base_count = 15
        
        institutional = random.randint(base_count, base_count + 5)
        overseas = random.randint(int(base_count * 0.3), int(base_count * 0.7))
        individual = random.randint(int(base_count * 0.5), int(base_count * 0.8))
        analyst = random.randint(1, 3)
        
        weekly_processing_data.append({
            "week": week_date.strftime("%m/%d"),
            "institutional": institutional,
            "overseas": overseas,
            "individual": individual,
            "analyst": analyst,
            "total": institutional + overseas + individual + analyst
        })
    
    # 直近のヒアリング質問カテゴリデータ（モック）
    question_categories = [
        {"category": "業績・財務", "count": 45, "percentage": 28, "color": "#3B82F6"},
        {"category": "AI事業戦略", "count": 38, "percentage": 23, "color": "#10B981"},
        {"category": "ESG/サステナビリティ", "count": 32, "percentage": 20, "color": "#F59E0B"},
        {"category": "配当・株主還元", "count": 25, "percentage": 16, "color": "#EF4444"},
        {"category": "ガバナンス", "count": 13, "percentage": 8, "color": "#8B5CF6"},
        {"category": "その他", "count": 8, "percentage": 5, "color": "#6B7280"}
    ]
    
    # 今日の投資家との予定（詳細版）
    todays_meetings_detail = [
        {
            "id": "meeting_today_001",
            "time": "10:00",
            "investor_name": "野村アセットマネジメント",
            "duration": "60分",
            "topics": ["Q3決算", "AI事業進捗"],
            "is_important": True,
            "last_meeting_summary": "AI事業の収益化時期について懸念を表明。具体的なKPIとロードマップの提示を求められた。",
            "pending_items": [
                "AI事業の詳細なKPI資料の提供",
                "競合他社との比較分析レポート"
            ],
            "past_questions": [
                "AI人材の確保状況は？",
                "R&D投資のROIは？"
            ]
        },
        {
            "id": "meeting_today_002",
            "time": "14:00",
            "investor_name": "BlackRock Inc.",
            "duration": "45分",
            "topics": ["ESG目標", "グローバル投資"],
            "is_important": False,
            "last_meeting_summary": "ESG目標の進捗状況を定期的にアップデート。特にカーボンニュートラルの具体的施策に関心。",
            "pending_items": [
                "ESGロードマップの更新版"
            ],
            "past_questions": [
                "スコープ3目標の具体的施策は？",
                "サプライチェーンのCO2排出量把握は？"
            ]
        }
    ]
    
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "title": "ミーティング処理ダッシュボード",
        "active_meetings": active_meetings,
        "urgent_meetings": urgent_meetings,
        "todays_meetings": todays_meetings,
        "processing_efficiency": processing_efficiency,
        "avg_processing_time": avg_processing_time,
        "ai_usage_rate": ai_usage_rate,
        "ai_automated_tasks": ai_automated_tasks,
        "ai_improvement": ai_improvement,
        "investor_satisfaction": investor_satisfaction,
        "todays_schedule": todays_schedule,
        "priority_followups": priority_followups,
        "executive_reports": executive_reports,
        "weekly_summary": weekly_summary,
        "performance_metrics": performance_metrics,
        "investor_engagement": investor_engagement,
        "weekly_processing_data": weekly_processing_data,
        "question_categories": question_categories,
        "todays_meetings_detail": todays_meetings_detail,
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
async def dialogue_edit_unified(request: Request):
    """統合議事録編集画面（段階適応型UI）"""
    # URLパラメータからIDを取得
    meeting_id = request.query_params.get("id", "meeting_001")
    
    # モックデータ（実際はデータベースから取得）
    # 基本データを先に定義
    base_meeting_data = {
        "meeting_001": {
            "title": "野村AMとの面談記録",
            "investor_name": "野村アセットマネジメント",
            "investor_type": "大口機関投資家",
            "type": "個別面談",
            "date": "2024-01-22 10:00",
            "formatted_date": "2024年1月22日 10:00",
            "participants": 4,
            "company_participants": ["CEO - 田中一郎", "CFO - 佐藤二郎"],
            "tags": ["決算", "Q3", "AI事業", "成長戦略"],
            "priority": "high",
            "days_elapsed": 2,
            "current_stage": "faq",
            "stages": {
                "upload": {
                    "status": "completed",
                    "files": ["🎥", "🎤", "📄"]
                },
                "transcription": {
                    "status": "completed",
                    "duration": "15分",
                    "progress": 100
                },
                "ai_summary": {
                    "status": "completed"
                },
                "faq": {
                    "status": "in_progress",
                    "draft_count": 3,
                    "count": 0
                },
                "review": {
                    "status": "waiting"
                },
                "publish": {
                    "status": "waiting"
                }
            },
            "files": [
                {
                    "id": "file_001",
                    "name": "野村AM_面談_20240122.mp4",
                    "type": "video",
                    "size": "456.2MB",
                    "duration": "1時間30分"
                },
                {
                    "id": "file_002",
                    "name": "野村AM_面談_音声.mp3",
                    "type": "audio",
                    "size": "89.5MB",
                    "duration": "1時間30分"
                },
                {
                    "id": "file_003",
                    "name": "説明資料.pdf",
                    "type": "document",
                    "size": "12.3MB",
                    "duration": "-"
                }
            ],
            "transcript_preview": "【田中（CEO）】本日はお忙しい中、お時間をいただきありがとうございます。第3四半期の決算についてご説明させていただきます。\n\n【投資家】ありがとうございます。特にAI事業の進捗について詳しくお聞きしたいです。\n\n【田中（CEO）】AI事業については、予想を上回るペースで成長しております。特に金融機関向けのAIソリューションが好調で...",
            "transcript_stats": {
                "total_chars": 15680,
                "reading_time": 12
            },
            "investor_profile": {
                "investment_style": "長期バリュー投資",
                "esg_focus": "高",
                "holding_period": "平均3.2年",
                "total_meetings": 12,
                "last_meeting_date": "2023-10-15",
                "satisfaction_trend": "向上",
                "key_interests": ["技術優位性", "ESG戦略", "収益性"],
                "risk_tolerance": "中",
                "typical_concerns": ["競合優位性", "長期成長性", "リスク管理"]
            },
            "past_meetings": [
                {
                    "id": "meeting_20231015",
                    "date": "2023-10-15",
                    "title": "Q2決算説明会",
                    "topics": ["Q2業績", "中期戦略", "ESG進捗"],
                    "investor_satisfaction": 8.5,
                    "key_concerns": ["AI投資効率", "競合対応"]
                },
                {
                    "id": "meeting_20230715", 
                    "date": "2023-07-15",
                    "title": "中期経営計画説明",
                    "topics": ["3ヵ年計画", "M&A戦略", "DX推進"],
                    "investor_satisfaction": 7.8,
                    "key_concerns": ["計画実現性", "投資回収"]
                }
            ],
            "ai_analysis": {
                "sentiment_score": 78,
                "engagement_level": 8.2,
                "understanding_level": 6.5, 
                "satisfaction_level": 7.8,
                "key_topics": [
                    {"topic": "AI事業戦略", "mentions": 23, "sentiment": "positive"},
                    {"topic": "競合優位性", "mentions": 18, "sentiment": "concerned"},
                    {"topic": "ESG目標", "mentions": 15, "sentiment": "interested"},
                    {"topic": "収益性", "mentions": 12, "sentiment": "positive"}
                ],
                "concerns_detected": [
                    {
                        "topic": "AI事業の競争優位性",
                        "confidence": 0.94,
                        "urgency": "high",
                        "detail": "競合他社との技術的差別化について複数回質問",
                        "suggested_response": "特許ポートフォリオと独自技術の詳細説明"
                    },
                    {
                        "topic": "ESG目標の実現可能性", 
                        "confidence": 0.87,
                        "urgency": "medium",
                        "detail": "2030年カーボンニュートラル目標の具体性への疑問",
                        "suggested_response": "詳細ロードマップと投資計画の提示"
                    }
                ],
                "recommendations": [
                    "次回面談時に特許技術の詳細資料を準備",
                    "競合比較分析レポートの作成",
                    "ESGロードマップの早期公表"
                ]
            },
            "ai_summary": {
                "executive_summary": "第3四半期の業績は全体的に好調で、特にAI事業が予想を上回る成長を示しました。投資家からは今後の成長性と競争優位性について高い関心が寄せられました。",
                "key_points": [
                    "AI事業の売上が前年同期比150%成長",
                    "金融機関向けAIソリューションの契約数が倍増",
                    "2024年度の業績予想を上方修正の可能性",
                    "ESG目標達成に向けた具体的なロードマップを策定中"
                ],
                "investor_concerns": [
                    {
                        "topic": "AI事業の競争優位性",
                        "detail": "競合他社との差別化要因、技術的優位性の持続可能性"
                    },
                    {
                        "topic": "投資効率",
                        "detail": "AI開発への投資額とROIの具体的な数値"
                    },
                    {
                        "topic": "ESG目標",
                        "detail": "2030年カーボンニュートラルの実現可能性とコスト"
                    }
                ],
                "recommended_actions": [
                    "AI事業の詳細な事業計画とKPIを次回決算説明会で公表",
                    "ESGロードマップを2月末までに公開",
                    "競合分析レポートを作成し、投資家向けに共有"
                ]
            },
            "faq_drafts": [
                {
                    "id": "faq_001",
                    "question": "AI事業の今後の成長性について教えてください",
                    "answer": "AI事業は当社の成長戦略の中核であり、特に金融機関向けソリューションで強い競争力を持っています。今期は前年同期比150%の成長を達成し、来期も100%以上の成長を見込んでいます。",
                    "ai_generated": True,
                    "confidence": 95
                },
                {
                    "id": "faq_002",
                    "question": "ESG目標の進捗状況は？",
                    "answer": "2030年カーボンニュートラル目標に向けて、現在詳細なロードマップを策定中です。2月末までに具体的な施策とマイルストーンを公表予定です。",
                    "ai_generated": True,
                    "confidence": 88
                },
                {
                    "id": "faq_003",
                    "question": "配当政策に変更はありますか？",
                    "answer": "現時点で配当政策に変更はありません。配当性合30%を維持し、安定的な株主還元を継続します。",
                    "ai_generated": False,
                    "confidence": 100
                }
            ],
            "timeline": [
                {
                    "type": "success",
                    "title": "ファイルアップロード完了",
                    "timestamp": "2024-01-22 11:35",
                    "user": "IR担当者A"
                },
                {
                    "type": "success",
                    "title": "文字起こし完了",
                    "timestamp": "2024-01-22 11:50",
                    "user": "AI自動処理"
                },
                {
                    "type": "success",
                    "title": "AI要約完了",
                    "timestamp": "2024-01-22 12:05",
                    "user": "AI自動処理"
                },
                {
                    "type": "processing",
                    "title": "FAQ作成中",
                    "timestamp": "2024-01-22 14:30",
                    "user": "IR担当者A"
                }
            ],
            "current_stage_info": {
                "action_required": True,
                "message": "FAQの作成・確認が必要です。AIが生成した3件のFAQ案を確認し、必要に応じて編集・追加してください。",
                "action_label": "FAQを編集",
                "action_function": "manageFAQs()"
            },
            "can_edit_basic_info": True,
            "can_generate_more_faqs": True,
            "can_upload_more": True,
            "can_save": True,
            "show_action_bar": True,
            "primary_action": {
                "label": "レビューに進む",
                "function": "submitForReview()"
            },
            "total_processing_time": "2時間30分",
            "progress_percentage": 65,
            "last_updated": "2024-01-22 14:30",
            "action_items": [
                {"id": "action_001", "title": "特許ポートフォリオの詳細資料作成", "assignee": "法務部", "due_date": "2024-02-15", "priority": "high", "status": "pending", "estimated_hours": 16},
                {"id": "action_002", "title": "ESGロードマップの最終確認・公表準備", "assignee": "サステナビリティ部", "due_date": "2024-02-28", "priority": "high", "status": "in_progress", "estimated_hours": 24},
                {"id": "action_003", "title": "競合他社比較分析レポート作成", "assignee": "戦略企画部", "due_date": "2024-03-10", "priority": "medium", "status": "pending", "estimated_hours": 20}
            ],
            "next_meeting_suggestion": {
                "recommended_date": "2024-04-15", "reason": "Q4決算発表後のフォローアップ",
                "agenda_items": ["Q4業績説明", "ESG進捗報告", "特許戦略詳細", "競合分析結果"],
                "preparation_materials": ["決算説明資料", "ESGロードマップ更新版", "特許ポートフォリオ詳細版", "競合比較分析"]
            },
            "comparison_data": {
                "previous_meeting": {
                    "date": "2023-10-15", "key_topics": ["Q2業績", "一般的な技術説明", "ESG検討段階"],
                    "investor_satisfaction": 7.5, "concerns": ["技術優位性", "成長持続性"],
                    "changes_since": [
                        {"aspect": "技術説明", "change": "一般的→具体的特許技術", "trend": "positive"},
                        {"aspect": "投資家関心", "change": "中程度→高い関心", "trend": "positive"},
                        {"aspect": "懸念レベル", "change": "低→中程度", "trend": "attention"}
                    ]
                }
            }
        },
        "meeting_002": {
            "title": "BlackRock定例ミーティング",
            "investor_name": "BlackRock Inc.",
            "investor_type": "海外機関投資家",
            "type": "Web会議",
            "date": "2024-01-21 17:00",
            "formatted_date": "2024年1月21日 17:00",
            "participants": 6,
            "company_participants": ["CFO - 佐藤二郎", "IR部長 - 山本三郎"],
            "tags": ["ESG", "グローバル投資", "ガバナンス"],
            "priority": "high",
            "days_elapsed": 3,
            "current_stage": "transcription",
            "stages": {
                "upload": {
                    "status": "completed",
                    "files": ["💻", "🎤"]
                },
                "transcription": {
                    "status": "processing",
                    "progress": 65
                },
                "ai_summary": {
                    "status": "waiting"
                },
                "faq": {
                    "status": "waiting"
                },
                "review": {
                    "status": "waiting"
                },
                "publish": {
                    "status": "waiting"
                }
            },
            "files": [
                {
                    "id": "file_004",
                    "name": "BlackRock_meeting_20240121.mp4",
                    "type": "video",
                    "size": "234.5MB",
                    "duration": "45分"
                },
                {
                    "id": "file_005",
                    "name": "BlackRock_meeting_audio.mp3",
                    "type": "audio",
                    "size": "45.2MB",
                    "duration": "45分"
                }
            ],
            "timeline": [
                {
                    "type": "success",
                    "title": "ファイルアップロード完了",
                    "timestamp": "2024-01-21 18:00",
                    "user": "IR担当者B"
                },
                {
                    "type": "processing",
                    "title": "文字起こし開始",
                    "timestamp": "2024-01-21 18:15",
                    "user": "AI自動処理"
                }
            ],
            "current_stage_info": {
                "action_required": False,
                "message": "文字起こしを処理中です。完了まで約 15分かかります。"
            },
            "can_edit_basic_info": True,
            "can_upload_more": False,
            "show_action_bar": False,
            "total_processing_time": "1時間",
            "progress_percentage": 30,
            "last_updated": "2024-01-21 18:15"
        },
        "activity-002": {
            "title": "BlackRock個別面談",
            "investor_name": "BlackRock Inc.",
            "investor_type": "海外機関投資家",
            "type": "個別面談",
            "date": "2024-01-21 15:00",
            "formatted_date": "2024年1月21日 15:00",
            "participants": 2,
            "company_participants": ["CFO - 佐藤二郎", "IR部長 - 山本三郎"],
            "tags": ["ESG", "個別面談", "海外投資家"],
            "priority": "high",
            "days_elapsed": 3,
            "current_stage": "faq",
            "stages": {
                "upload": {"status": "completed"},
                "transcription": {"status": "completed"},
                "ai_summary": {"status": "completed"},
                "faq": {"status": "processing", "progress": 75},
                "review": {"status": "waiting"},
                "publish": {"status": "waiting"}
            },
            "files": [
                {
                    "id": "file_004",
                    "name": "BlackRock_meeting_20240121.mp4",
                    "type": "video",
                    "size": "234.5MB",
                    "duration": "45分"
                }
            ],
            "transcript_preview": "【佐藤（CFO）】ESG目標の進捗についてご説明いたします。\n\n【投資家】特に環境目標の具体的なロードマップについて詳しくお聞きしたいです。",
            "investor_profile": {
                "investment_style": "ESG重視投資",
                "esg_focus": "非常に高",
                "total_meetings": 8,
                "satisfaction_trend": "安定"
            },
            "current_stage_info": {
                "action_required": True,
                "message": "FAQ作成・確認が必要です。"
            }
        }
    }
    
    # 循環参照を避けるため、activity-001は別途作成
    mock_meeting_data = base_meeting_data.copy()
    if "meeting_001" in base_meeting_data:
        activity_001_data = base_meeting_data["meeting_001"].copy()
        activity_001_data.update({
            "title": "野村AM決算説明会",
            "current_stage": "ai_summary",
            "urgency": "urgent"
        })
        mock_meeting_data["activity-001"] = activity_001_data
    
    # 指定されたIDのデータを取得（デフォルトはmeeting_001）
    meeting_data = mock_meeting_data.get(meeting_id, mock_meeting_data["meeting_001"])
    
    return templates.TemplateResponse("dialogue-edit-unified.html", {
        "request": request,
        "title": f"{meeting_data['title']} - 議事録編集",
        "meeting_id": meeting_id,
        "meeting_data": meeting_data,
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

@app.get("/executive-dashboard", response_class=HTMLResponse)
async def executive_dashboard(request: Request):
    """経営陣向けダッシュボード画面"""
    from datetime import datetime
    
    # 緊急対応事項の数を計算
    urgent_items = len([c for c in MOCK_DATA["top_concerns"] if c["importance"] == "高"])
    
    # 今週の面談数を計算
    meetings_this_week = len(MOCK_DATA["important_meetings"])
    
    return templates.TemplateResponse("executive-dashboard.html", {
        "request": request,
        "title": "経営陣ダッシュボード",
        "top_concerns": MOCK_DATA["top_concerns"],
        "recommended_actions": MOCK_DATA["recommended_actions"],
        "important_meetings": MOCK_DATA["important_meetings"],
        "skill_tip": MOCK_DATA["skill_tip"],
        "recent_feedback": MOCK_DATA["recent_feedback"],
        "urgent_items": urgent_items,
        "meetings_this_week": meetings_this_week,
        "current_time": datetime.now().strftime("%Y年%m月%d日 %H:%M")
    })

@app.get("/director-dashboard", response_class=HTMLResponse)
async def director_dashboard(request: Request):
    """社外取締役向けダッシュボード画面"""
    from datetime import datetime
    import json
    
    # 重要課題の数を計算
    high_impact_issues = len([i for i in MOCK_DATA["strategic_issues"] if i["impact"] == "高"])
    
    # 今後の取締役会の数
    upcoming_board_meetings = len(MOCK_DATA["board_agenda_items"])
    
    return templates.TemplateResponse("director-dashboard.html", {
        "request": request,
        "title": "社外取締役ダッシュボード",
        "company_info": MOCK_DATA["company_info"],
        "period_data": MOCK_DATA["period_data"],
        "governance_overview": MOCK_DATA["governance_overview"],
        "strategic_issues": MOCK_DATA["strategic_issues"],
        "quarterly_trends": MOCK_DATA["quarterly_trends"],
        "board_agenda_items": MOCK_DATA["board_agenda_items"],
        "external_evaluations": MOCK_DATA["external_evaluations"],
        "compliance_incidents": MOCK_DATA["compliance_incidents"],
        "investor_dialogue_summary": MOCK_DATA["investor_dialogue_summary"],
        "key_investor_meetings": MOCK_DATA["key_investor_meetings"],
        "risk_monitoring": MOCK_DATA["risk_monitoring"],
        "high_impact_issues": high_impact_issues,
        "upcoming_board_meetings": upcoming_board_meetings,
        "current_time": datetime.now().strftime("%Y年%m月%d日 %H:%M")
    })

# ===== API エンドポイント（モック） =====

@app.get("/api/director/dashboard/{period}")
async def get_director_dashboard_data(period: str):
    """社外取締役ダッシュボードの期間別データ取得API"""
    
    # 期間に応じたデータを返す
    period_info = MOCK_DATA["period_data"].get(period, MOCK_DATA["period_data"]["quarter"])
    
    # 期間に応じたデータをフィルタリング（実際の実装ではDBから取得）
    response_data = {
        "period": period,
        "period_info": period_info,
        "governance_overview": MOCK_DATA["governance_overview"],
        "investor_dialogue_summary": {
            "total_meetings": period_info["investor_meetings"],
            "by_type": MOCK_DATA["investor_dialogue_summary"]["by_type"],
            "by_topic": MOCK_DATA["investor_dialogue_summary"]["by_topic"],
            "concern_themes": MOCK_DATA["investor_dialogue_summary"]["concern_themes"]
        },
        "strategic_issues": MOCK_DATA["strategic_issues"],
        "risk_monitoring": MOCK_DATA["risk_monitoring"]
    }
    
    return response_data

@app.get("/ir-feedback", response_class=HTMLResponse)
async def ir_feedback(request: Request):
    """投資家フィードバック管理画面"""
    return templates.TemplateResponse("ir-feedback.html", {
        "request": request,
        "title": "投資家フィードバック管理"
    })

@app.get("/ir-meeting", response_class=HTMLResponse)
async def ir_meeting(request: Request):
    """IRミーティング管理画面"""
    return templates.TemplateResponse("ir-meeting.html", {
        "request": request,
        "title": "IRミーティング管理"
    })

@app.get("/ir-strategy", response_class=HTMLResponse)
async def ir_strategy(request: Request):
    """中長期戦略開示管理画面"""
    return templates.TemplateResponse("ir-strategy.html", {
        "request": request,
        "title": "中長期戦略開示管理"
    })

@app.get("/strategy-disclosure-assistant", response_class=HTMLResponse)
async def strategy_disclosure_assistant(request: Request):
    """中長期計画開示支援ツール画面"""
    return templates.TemplateResponse("strategy-disclosure-assistant.html", {
        "request": request,
        "title": "中長期計画開示支援ツール"
    })

@app.get("/ir-calendar-workspace", response_class=HTMLResponse)
async def ir_calendar_workspace(request: Request):
    """IRカレンダー・面談ワークスペース画面"""
    from datetime import datetime, timedelta
    
    # 現在日時の取得
    current_time = datetime.now()
    today = current_time.date()
    
    # モック面談データ
    meeting_data = {
        "meeting-001": {
            "id": "meeting-001",
            "investor": "北米年金基金C社",
            "avatar": "C",
            "title": "CEO面談リクエスト",
            "status": "承認待ち",
            "urgency": "urgent",
            "date": "2024-01-12",
            "time": "10:00-11:00",
            "format": "オンライン (Zoom)",
            "participants": "CEO必須",
            "theme": "長期成長戦略",
            "priority": 4,
            "asset_size": "$50B",
            "investment_style": "ESG重視",
            "last_meeting": "初回",
            "deadline": "2時間後"
        },
        "meeting-002": {
            "id": "meeting-002", 
            "investor": "BlackRock",
            "avatar": "B",
            "title": "ESG戦略個別面談",
            "status": "実施準備完了",
            "urgency": "today",
            "date": "2024-12-26",
            "time": "14:00-15:00",
            "format": "対面会議",
            "participants": "CFO、IR部長",
            "theme": "ESG戦略、サステナビリティ",
            "priority": 5,
            "asset_size": "$8.5T",
            "investment_style": "長期投資",
            "last_meeting": "2023-11-15"
        },
        "meeting-003": {
            "id": "meeting-003",
            "investor": "Vanguard", 
            "avatar": "V",
            "title": "決算説明フォローアップ",
            "status": "資料準備中",
            "urgency": "tomorrow",
            "date": "2024-12-27",
            "time": "10:00-11:00",
            "format": "オンライン",
            "participants": "CFO、経営企画部長",
            "theme": "Q3決算、業績見通し",
            "priority": 3,
            "asset_size": "$7.2T",
            "investment_style": "インデックス投資",
            "last_meeting": "2024-10-25"
        },
        "meeting-004": {
            "id": "meeting-004",
            "investor": "Fidelity",
            "avatar": "F", 
            "title": "中期戦略ディスカッション",
            "status": "承認済み",
            "urgency": "scheduled",
            "date": "2025-01-03",
            "time": "15:00-16:00",
            "format": "対面会議",
            "participants": "CEO、CFO",
            "theme": "中期経営計画、M&A戦略",
            "priority": 4,
            "asset_size": "$4.2T",
            "investment_style": "アクティブ投資",
            "last_meeting": "2024-08-20"
        }
    }
    
    # カレンダーイベントデータ
    calendar_events = [
        {
            "date": "2024-12-26",
            "events": [
                {
                    "id": "meeting-002",
                    "title": "BlackRock 14:00",
                    "type": "approved",
                    "meeting_data": meeting_data["meeting-002"]
                }
            ]
        },
        {
            "date": "2024-12-27", 
            "events": [
                {
                    "id": "meeting-003",
                    "title": "Vanguard 10:00",
                    "type": "pending",
                    "meeting_data": meeting_data["meeting-003"]
                }
            ]
        },
        {
            "date": "2025-01-03",
            "events": [
                {
                    "id": "meeting-004", 
                    "title": "Fidelity 15:00",
                    "type": "approved",
                    "meeting_data": meeting_data["meeting-004"]
                }
            ]
        },
        {
            "date": "2025-01-12",
            "events": [
                {
                    "id": "meeting-001",
                    "title": "北米年金C社 (承認待ち)",
                    "type": "urgent", 
                    "meeting_data": meeting_data["meeting-001"]
                }
            ]
        }
    ]
    
    # 統計データ
    statistics = {
        "today_meetings": 2,
        "pending_approvals": 3,
        "this_month_total": 24,
        "satisfaction_rate": 95
    }
    
    return templates.TemplateResponse("ir-calendar-workspace.html", {
        "request": request,
        "title": "IRカレンダー・面談ワークスペース",
        "meeting_data": meeting_data,
        "calendar_events": calendar_events,
        "statistics": statistics,
        "current_time": current_time.strftime("%Y年%m月%d日 %H:%M"),
        "today": today.strftime("%Y-%m-%d")
    })

@app.get("/dialogue-center", response_class=HTMLResponse)
async def dialogue_center(request: Request):
    """外部MTG議事録画面（統合ワークスペース）"""
    from datetime import datetime, timedelta
    
    # 現在日時の取得
    current_time = datetime.now()
    today = current_time.date()
    
    # モック対話記録データ
    activity_data = {
        "activity-001": {
            "id": "activity-001",
            "title": "野村AM決算説明会",
            "investor": "野村アセットマネジメント",
            "type": "決算説明会",
            "duration": "90分",
            "timestamp": "2時間前",
            "status": "処理停滞",
            "urgency": "urgent",
            "progress": {
                "stage": "ai_summary",
                "percentage": 65,
                "stages": {
                    "upload": "completed",
                    "transcription": "completed", 
                    "ai_summary": "processing",
                    "faq": "waiting",
                    "review": "waiting",
                    "publish": "waiting"
                }
            },
            "meta": {
                "file_size": "234MB",
                "transcript_chars": 15680,
                "accuracy": 96,
                "assignee": "IR担当者A",
                "participants": ["CEO", "CFO", "IR部長"]
            }
        },
        "activity-002": {
            "id": "activity-002",
            "title": "BlackRock個別面談",
            "investor": "BlackRock Inc.",
            "type": "個別面談",
            "duration": "45分",
            "timestamp": "5時間前",
            "status": "FAQ作成中",
            "urgency": "processing",
            "progress": {
                "stage": "faq",
                "percentage": 75,
                "stages": {
                    "upload": "completed",
                    "transcription": "completed",
                    "ai_summary": "completed",
                    "faq": "processing",
                    "review": "waiting",
                    "publish": "waiting"
                }
            },
            "meta": {
                "file_size": "123MB",
                "transcript_chars": 8240,
                "accuracy": 98,
                "assignee": "IR担当者B",
                "participants": ["CFO", "IR部長"]
            }
        },
        "activity-003": {
            "id": "activity-003",
            "title": "個人投資家説明会",
            "investor": "個人投資家",
            "type": "説明会",
            "duration": "2時間",
            "timestamp": "1日前",
            "status": "公開済み",
            "urgency": "completed",
            "progress": {
                "stage": "publish",
                "percentage": 100,
                "stages": {
                    "upload": "completed",
                    "transcription": "completed",
                    "ai_summary": "completed",
                    "faq": "completed",
                    "review": "completed",
                    "publish": "completed"
                }
            },
            "meta": {
                "file_size": "456MB",
                "transcript_chars": 24560,
                "accuracy": 94,
                "assignee": "IR担当者C",
                "participants": ["CEO", "CFO", "IR部長", "経営企画部長"]
            }
        },
        "activity-004": {
            "id": "activity-004",
            "title": "Vanguard定期面談",
            "investor": "Vanguard",
            "type": "定期面談",
            "duration": "60分",
            "timestamp": "14:00予定",
            "status": "準備完了",
            "urgency": "scheduled",
            "progress": {
                "stage": "upload",
                "percentage": 0,
                "stages": {
                    "upload": "waiting",
                    "transcription": "waiting",
                    "ai_summary": "waiting",
                    "faq": "waiting",
                    "review": "waiting",
                    "publish": "waiting"
                }
            },
            "meta": {
                "assignee": "IR担当者A",
                "participants": ["CFO", "IR部長"]
            }
        }
    }
    
    # 統計データ
    statistics = {
        "processing": 12,
        "urgent": 3,
        "completed_today": 8,
        "avg_processing_time": "2.3h",
        "ai_accuracy": 96,
        "efficiency_improvement": 20
    }
    
    # AI洞察データ
    ai_insights = [
        {
            "type": "improvement",
            "message": "今日の処理効率が20%向上しています",
            "icon": "💡"
        },
        {
            "type": "warning",
            "message": "3件の記録で処理遅延が発生中",
            "icon": "⚠️"
        },
        {
            "type": "trend",
            "message": "ESG関連の質問が急増しています",
            "icon": "📈"
        }
    ]
    
    # アクションアイテム
    action_items = [
        {
            "title": "BlackRockへの回答",
            "priority": "high",
            "deadline": "今日",
            "assignee": "IR担当者A"
        },
        {
            "title": "FAQ承認",
            "priority": "medium", 
            "deadline": "明日",
            "assignee": "IR部長"
        },
        {
            "title": "レポート作成",
            "priority": "low",
            "deadline": "来週",
            "assignee": "IR担当者C"
        }
    ]
    
    return templates.TemplateResponse("dialogue-center-workspace.html", {
        "request": request,
        "title": "外部MTG議事録",
        "activity_data": activity_data,
        "statistics": statistics,
        "ai_insights": ai_insights,
        "action_items": action_items,
        "current_time": current_time.strftime("%Y年%m月%d日 %H:%M"),
        "today": today.strftime("%Y-%m-%d")
    })

@app.get("/investor-relations", response_class=HTMLResponse)
async def investor_relations(request: Request):
    """投資家・フィードバック統合管理画面"""
    from datetime import datetime
    
    # 投資家管理とフィードバックを統合した画面（現在は投資家管理ページを表示）
    return templates.TemplateResponse("investors.html", {
        "request": request,
        "title": "投資家・フィードバック統合管理",
        "investors": MOCK_DATA["investors"],
        "total_investors": len(MOCK_DATA["investors"]),
        "current_time": datetime.now().strftime("%Y年%m月%d日 %H:%M")
    })

@app.get("/strategy-workspace", response_class=HTMLResponse) 
async def strategy_workspace(request: Request):
    """戦略・開示ワークスペース画面"""
    from datetime import datetime
    
    # IR戦略管理と開示支援ツールを統合した画面（現在はIR戦略ページを表示）
    return templates.TemplateResponse("ir-strategy.html", {
        "request": request,
        "title": "戦略・開示ワークスペース",
        "current_time": datetime.now().strftime("%Y年%m月%d日 %H:%M")
    })

@app.get("/ir-content-center", response_class=HTMLResponse)
async def ir_content_center(request: Request):
    """IR情報統合センター画面"""
    from datetime import datetime, timedelta
    
    # 現在日時の取得
    current_time = datetime.now()
    today = current_time.date()
    
    # モックFAQデータ
    faq_data = [
        {
            "id": "faq-001",
            "title": "2024年第3四半期の業績見通しについて",
            "category": "財務・業績",
            "answer": "第3四半期の売上高は前年同期比15%増の見込みです。主力事業の好調な推移により、通期業績予想を上方修正いたします。",
            "status": "published",
            "view_count": 128,
            "last_updated": "2時間前",
            "confidence": 94,
            "type": "faq"
        },
        {
            "id": "faq-002", 
            "title": "ESG経営の取り組みについて",
            "category": "ESG",
            "answer": "2030年までにカーボンニュートラル達成を目指し、再生可能エネルギー導入を進めています。",
            "status": "published",
            "view_count": 89,
            "last_updated": "2日前",
            "confidence": 96,
            "type": "faq"
        }
    ]
    
    # モックドキュメントデータ
    document_data = [
        {
            "id": "doc-001",
            "title": "2024年第3四半期決算短信",
            "category": "決算短信",
            "file_size": "2.4MB",
            "download_count": 45,
            "uploaded": "5時間前",
            "status": "published",
            "type": "document"
        },
        {
            "id": "doc-002",
            "title": "中期経営計画説明資料",
            "category": "説明会資料", 
            "file_size": "8.7MB",
            "download_count": 167,
            "uploaded": "3日前",
            "status": "published",
            "type": "document"
        }
    ]
    
    # モックニュースデータ
    news_data = [
        {
            "id": "news-001",
            "title": "第3四半期決算説明会の開催について",
            "category": "イベント",
            "published": "1日前",
            "view_count": 234,
            "status": "published",
            "type": "news"
        },
        {
            "id": "news-002",
            "title": "株主優待制度の変更について",
            "category": "株主還元",
            "published": "1週間前",
            "view_count": 456,
            "status": "published",
            "type": "news"
        }
    ]
    
    # 統計データ
    statistics = {
        "total_faq": 156,
        "total_documents": 67,
        "total_news": 25,
        "total_views": 12547,
        "monthly_growth": {
            "faq": 12,
            "documents": 5,
            "news": 8,
            "views": 18
        }
    }
    
    # 統合コンテンツリスト（時系列順）
    all_content = []
    
    # FAQを追加
    for faq in faq_data:
        all_content.append({
            **faq,
            "content_type": "faq",
            "timestamp": faq["last_updated"]
        })
    
    # ドキュメントを追加  
    for doc in document_data:
        all_content.append({
            **doc,
            "content_type": "document",
            "timestamp": doc["uploaded"]
        })
    
    # ニュースを追加
    for news in news_data:
        all_content.append({
            **news,
            "content_type": "news", 
            "timestamp": news["published"]
        })
    
    # 時系列でソート（最新順）
    all_content.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return templates.TemplateResponse("ir-content-center.html", {
        "request": request,
        "title": "IR情報統合センター",
        "all_content": all_content,
        "faq_data": faq_data,
        "document_data": document_data,
        "news_data": news_data,
        "statistics": statistics,
        "current_time": current_time.strftime("%Y年%m月%d日 %H:%M"),
        "today": today.strftime("%Y-%m-%d")
    })

@app.get("/dialogue/faq/{meeting_id}", response_class=HTMLResponse)
async def dialogue_faq_edit(request: Request, meeting_id: str):
    """ミーティングFAQ編集画面"""
    from datetime import datetime
    
    # モックデータ
    meeting_data = {
        "title": "野村AMとの面談記録",
        "investor_name": "野村アセットマネジメント",
        "date": "2024-01-22 10:00"
    }
    
    # AIトピック分析
    ai_topics = [
        {"id": "ai_business", "name": "AI事業の成長性", "mention_count": 8, "has_faq": True},
        {"id": "esg", "name": "ESG目標", "mention_count": 5, "has_faq": True},
        {"id": "dividend", "name": "配当政策", "mention_count": 3, "has_faq": True},
        {"id": "competition", "name": "競争優位性", "mention_count": 4, "has_faq": False},
        {"id": "global_expansion", "name": "グローバル展開", "mention_count": 2, "has_faq": False}
    ]
    
    # FAQリスト
    faqs = [
        {
            "id": "faq_001",
            "question": "AI事業の今後の成長性について教えてください",
            "answer": "AI事業は当社の成長戦略の中核であり、特に金融機関向けソリューションで強い競争力を持っています。今期は前年同期比150%の成長を達成し、来期も100%以上の成長を見込んでいます。",
            "status": "approved",
            "ai_generated": True,
            "confidence": 95,
            "has_source": True,
            "category": "事業戦略"
        },
        {
            "id": "faq_002",
            "question": "ESG目標の進捗状況は？",
            "answer": "2030年カーボンニュートラル目標に向けて、現在詳細なロードマップを策定中です。2月末までに具体的な施策とマイルストーンを公表予定です。",
            "status": "draft",
            "ai_generated": True,
            "confidence": 88,
            "has_source": True,
            "category": "ESG"
        },
        {
            "id": "faq_003",
            "question": "配当政策に変更はありますか？",
            "answer": "現時点で配当政策に変更はありません。配当性合30%を維持し、安定的な株主還元を継続します。",
            "status": "published",
            "ai_generated": False,
            "confidence": 100,
            "has_source": False,
            "category": "株主還元"
        }
    ]
    
    # 文字起こしセグメント
    transcript_segments = [
        {
            "id": "seg_001",
            "speaker": "田中（CEO）",
            "timestamp": "00:05:23",
            "formatted_time": "5:23",
            "text": "AI事業については、予想を上回るペースで成長しております。特に金融機関向けのAIソリューションが好調で、前年同期比150%の成長を達成しました。",
            "is_important": True,
            "is_highlighted": False,
            "tags": ["AI事業", "成長率"]
        },
        {
            "id": "seg_002",
            "speaker": "投資家",
            "timestamp": "00:06:45",
            "formatted_time": "6:45",
            "text": "その成長は持続可能でしょうか？競合他社も同様の分野に参入してきていると思いますが。",
            "is_important": True,
            "is_highlighted": False,
            "tags": ["競争優位性"]
        },
        {
            "id": "seg_003",
            "speaker": "田中（CEO）",
            "timestamp": "00:07:12",
            "formatted_time": "7:12",
            "text": "そのご懸念はごもっともです。私たちは技術的優位性を維持するため、研究開発への投資を強化しています。特に、特許取得済みの独自アルゴリズムが強みです。",
            "is_important": True,
            "is_highlighted": True,
            "tags": ["競争優位性", "技術"]
        },
        {
            "id": "seg_004",
            "speaker": "佐藤（CFO）",
            "timestamp": "00:15:30",
            "formatted_time": "15:30",
            "text": "ESGに関しては、現在詳細なロードマップを策定中です。2月末には具体的なマイルストーンと予算を公表できる予定です。",
            "is_important": True,
            "is_highlighted": False,
            "tags": ["ESG", "ロードマップ"]
        }
    ]
    
    # 類似FAQ
    similar_faqs = [
        {
            "id": "faq_legacy_001",
            "question": "AI事業の収益性について教えてください",
            "similarity": 85,
            "last_updated": "2023-10-20"
        },
        {
            "id": "faq_legacy_002",
            "question": "環境目標の進捗はどうですか？",
            "similarity": 78,
            "last_updated": "2023-07-15"
        }
    ]
    
    # 選択されたFAQ
    selected_faq_id = request.query_params.get("selected", "faq_001")
    selected_faq = next((f for f in faqs if f["id"] == selected_faq_id), faqs[0] if faqs else None)
    
    if selected_faq:
        selected_faq["source_quotes"] = [
            {
                "text": "AI事業については、予想を上回るペースで成長しております。",
                "speaker": "田中（CEO）",
                "timestamp": "5:23"
            }
        ]
    
    return templates.TemplateResponse("dialogue-faq.html", {
        "request": request,
        "title": f"FAQ編集 - {meeting_data['title']}",
        "meeting_id": meeting_id,
        "meeting_data": meeting_data,
        "ai_topics": ai_topics,
        "faqs": faqs,
        "total_faqs": len(faqs),
        "ai_generated_count": len([f for f in faqs if f.get("ai_generated")]),
        "selected_faq_id": selected_faq_id,
        "selected_faq": selected_faq,
        "transcript_segments": transcript_segments,
        "similar_faqs": similar_faqs,
        "current_time": datetime.now().strftime("%Y年%m月%d日 %H:%M")
    })

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

# 重複エンドポイント削除 - dialogue/edit に統合

# ===== アプリケーション起動 =====
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
