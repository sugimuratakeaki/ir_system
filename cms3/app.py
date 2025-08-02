"""
KAGAMI IR管理センター CMS 3.0
メインアプリケーション
"""

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path

# アプリケーションの初期化
app = FastAPI(title="KAGAMI IR管理センター CMS 3.0")

# 静的ファイルのマウント
app.mount("/static", StaticFiles(directory="static"), name="static")

# テンプレートの設定
templates = Jinja2Templates(directory="templates")

# ルートディレクトリ
BASE_DIR = Path(__file__).resolve().parent

# ===================
# 認証・共通ページ
# ===================

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """ログインページへのリダイレクト"""
    return templates.TemplateResponse("login.html", {
        "request": request,
        "title": "ログイン - KAGAMI IR管理センター"
    })

@app.get("/login", response_class=HTMLResponse)
async def login(request: Request):
    """ログインページ"""
    return templates.TemplateResponse("login.html", {
        "request": request,
        "title": "ログイン - KAGAMI IR管理センター"
    })

# ===================
# IR担当者向けページ
# ===================

@app.get("/ir/workspace", response_class=HTMLResponse)
async def ir_workspace(request: Request):
    """IR担当者メインダッシュボード"""
    return templates.TemplateResponse("ir/workspace.html", {
        "request": request,
        "title": "ワークスペース - IR担当者",
        "role": "ir"
    })

@app.get("/ir/dialogue-factory", response_class=HTMLResponse)
async def ir_dialogue_factory(request: Request):
    """議事録作成統合ワークフロー"""
    return templates.TemplateResponse("ir/dialogue-factory.html", {
        "request": request,
        "title": "議事録ファクトリー",
        "role": "ir"
    })

@app.get("/ir/investor-hub", response_class=HTMLResponse)
async def ir_investor_hub(request: Request):
    """投資家管理センター"""
    return templates.TemplateResponse("ir/investor-hub.html", {
        "request": request,
        "title": "投資家ハブ",
        "role": "ir"
    })

@app.get("/ir/investor-management", response_class=HTMLResponse)
async def ir_investor_management(request: Request):
    """投資家管理"""
    return templates.TemplateResponse("ir/investor-management.html", {
        "request": request,
        "title": "投資家管理",
        "role": "ir"
    })

@app.get("/ir/schedule-center", response_class=HTMLResponse)
async def ir_schedule_center(request: Request):
    """スケジュール統合管理"""
    return templates.TemplateResponse("ir/schedule-center.html", {
        "request": request,
        "title": "スケジュールセンター",
        "role": "ir"
    })

@app.get("/ir/content-studio", response_class=HTMLResponse)
async def ir_content_studio(request: Request):
    """コンテンツ管理"""
    return templates.TemplateResponse("ir/content-studio.html", {
        "request": request,
        "title": "コンテンツスタジオ",
        "role": "ir"
    })

@app.get("/ir/strategy-assistant", response_class=HTMLResponse)
async def ir_strategy_assistant(request: Request):
    """戦略支援ツール"""
    return templates.TemplateResponse("ir/strategy-assistant.html", {
        "request": request,
        "title": "戦略アシスタント",
        "role": "ir"
    })

@app.get("/ir/strategy-dashboard", response_class=HTMLResponse)
async def ir_strategy_dashboard(request: Request):
    """戦略ダッシュボード - 中期計画・投資家対応統合管理"""
    return templates.TemplateResponse("ir/strategy-dashboard.html", {
        "request": request,
        "title": "戦略ダッシュボード",
        "role": "ir"
    })

@app.get("/ir/strategy-assistant/timeline-analysis", response_class=HTMLResponse)
async def ir_timeline_analysis(request: Request):
    """時系列分析 - 戦略アシスタント"""
    return templates.TemplateResponse("ir/strategy-assistant/timeline-analysis.html", {
        "request": request,
        "title": "時系列分析 - 戦略アシスタント",
        "role": "ir"
    })

@app.get("/ir/analytics-lab", response_class=HTMLResponse)
async def ir_analytics_lab(request: Request):
    """分析ラボ"""
    return templates.TemplateResponse("ir/analytics-lab.html", {
        "request": request,
        "title": "分析ラボ",
        "role": "ir"
    })

@app.get("/ir/disclosure-hub", response_class=HTMLResponse)
async def ir_disclosure_hub(request: Request):
    """開示管理ハブ"""
    return templates.TemplateResponse("ir/disclosure-hub.html", {
        "request": request,
        "title": "開示ハブ",
        "role": "ir"
    })

@app.get("/ir/admin-panel", response_class=HTMLResponse)
async def ir_admin_panel(request: Request):
    """管理パネル"""
    return templates.TemplateResponse("ir/admin-panel.html", {
        "request": request,
        "title": "管理パネル",
        "role": "ir"
    })

# ===================
# 経営陣向けページ
# ===================

@app.get("/executive/dashboard", response_class=HTMLResponse)
async def executive_dashboard(request: Request):
    """経営陣ダッシュボード"""
    return templates.TemplateResponse("executive/dashboard.html", {
        "request": request,
        "title": "エグゼクティブダッシュボード",
        "role": "executive"
    })

@app.get("/executive/insights", response_class=HTMLResponse)
async def executive_insights(request: Request):
    """経営インサイト"""
    return templates.TemplateResponse("executive/insights.html", {
        "request": request,
        "title": "経営インサイト",
        "role": "executive"
    })

@app.get("/executive/approvals", response_class=HTMLResponse)
async def executive_approvals(request: Request):
    """承認管理"""
    return templates.TemplateResponse("executive/approvals.html", {
        "request": request,
        "title": "承認管理",
        "role": "executive"
    })

# ===================
# 社外取締役向けページ
# ===================

@app.get("/director/oversight", response_class=HTMLResponse)
async def director_oversight(request: Request):
    """社外取締役監督画面"""
    return templates.TemplateResponse("director/oversight.html", {
        "request": request,
        "title": "ガバナンス監督",
        "role": "director"
    })

@app.get("/director/voices", response_class=HTMLResponse)
async def director_voices(request: Request):
    """投資家の声"""
    return templates.TemplateResponse("director/voices.html", {
        "request": request,
        "title": "投資家の声",
        "role": "director"
    })

@app.get("/director/audit-trail", response_class=HTMLResponse)
async def director_audit_trail(request: Request):
    """監査証跡"""
    return templates.TemplateResponse("director/audit-trail.html", {
        "request": request,
        "title": "監査証跡",
        "role": "director"
    })

# ===================
# 投資家向けフロントページ
# ===================

@app.get("/front/investor-portal", response_class=HTMLResponse)
async def front_investor_portal(request: Request):
    """投資家ポータル"""
    return templates.TemplateResponse("front/investor-portal.html", {
        "request": request,
        "title": "投資家ポータル - KAGAMI"
    })

@app.get("/front/meeting-request", response_class=HTMLResponse)
async def front_meeting_request(request: Request):
    """面談リクエスト"""
    return templates.TemplateResponse("front/meeting-request.html", {
        "request": request,
        "title": "面談リクエスト - KAGAMI"
    })

@app.get("/front/resources", response_class=HTMLResponse)
async def front_resources(request: Request):
    """IR資料ライブラリ"""
    return templates.TemplateResponse("front/resources.html", {
        "request": request,
        "title": "IR資料 - KAGAMI"
    })

# ===================
# API エンドポイント（モック）
# ===================

@app.get("/api/test-data/{data_type}")
async def get_test_data(data_type: str):
    """テストデータAPI"""
    import json
    try:
        with open(f"static/data/{data_type}.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": f"Test data '{data_type}' not found"}

# ===================
# ヘルスチェック
# ===================

@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy", "version": "3.0.0"}

# ===================
# メイン実行
# ===================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)