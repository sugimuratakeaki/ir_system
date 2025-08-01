# CMS2 統合実装計画

## 1. 共通コンポーネント設計

### 1.1 基本コンポーネント

```javascript
// /cms2/static/js/components/shared/

// KPIカード
class KPICard {
    constructor(options) {
        this.title = options.title;
        this.value = options.value;
        this.target = options.target;
        this.progress = options.progress;
        this.questionCount = options.questionCount || 0;
        this.status = options.status || 'normal';
    }
    
    render() {
        return `
            <div class="kpi-card ${this.status}">
                <div class="kpi-header">
                    <h3>${this.title}</h3>
                    ${this.questionCount > 0 ? `<span class="question-badge">${this.questionCount}件</span>` : ''}
                </div>
                <div class="kpi-value">${this.value}</div>
                <div class="kpi-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.progress}%"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

// AI インサイトパネル
class AIInsightPanel {
    constructor(insights) {
        this.insights = insights;
    }
    
    render() {
        return `
            <div class="ai-insight-panel">
                <div class="ai-header">
                    <span class="ai-icon">🤖</span>
                    <h3>AIインサイト</h3>
                </div>
                <div class="insights-list">
                    ${this.insights.map(insight => `
                        <div class="insight-item ${insight.type}">
                            <p>${insight.message}</p>
                            <button onclick="${insight.action}">対応する</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}
```

### 1.2 統合CSS設計

```css
/* /cms2/static/css/core/integrated.css */

:root {
    /* カラーパレット */
    --kagami-blue: #1a365d;
    --kagami-blue-dark: #0f2544;
    --accent-teal: #14b8a6;
    --accent-purple: #9333ea;
    
    /* 状態カラー */
    --status-success: #10b981;
    --status-warning: #f59e0b;
    --status-error: #ef4444;
    --status-info: #3b82f6;
    
    /* アニメーション */
    --transition-fast: 0.15s;
    --transition-normal: 0.3s;
    --transition-slow: 0.5s;
}

/* 共通カードスタイル */
.integrated-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    padding: 24px;
    transition: all var(--transition-normal);
}

.integrated-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* AI要素の統一スタイル */
.ai-element {
    background: linear-gradient(135deg, #f0fdfa, #e0f2fe);
    border: 1px solid var(--accent-teal);
    border-radius: 8px;
    position: relative;
    overflow: hidden;
}

.ai-element::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
    transform: rotate(45deg);
    animation: shimmer 3s infinite;
}
```

## 2. データ連携設計

### 2.1 統合API設計

```python
# /cms2/api/integrated.py

from fastapi import APIRouter
from typing import List, Dict, Optional
from datetime import datetime

router = APIRouter(prefix="/api/integrated")

@router.get("/strategy/overview")
async def get_strategy_overview():
    """戦略概要データを統合取得"""
    return {
        "midterm_plan": {
            "period": "2024-2026",
            "last_updated": datetime.now(),
            "targets": await get_all_targets(),
            "progress": await calculate_overall_progress()
        },
        "investor_questions": {
            "total": await get_question_count(),
            "unanswered": await get_unanswered_count(),
            "trending_topics": await get_trending_topics()
        },
        "ai_insights": await generate_ai_insights()
    }

@router.post("/strategy/ai-analysis")
async def trigger_ai_analysis(document_ids: List[str]):
    """AI戦略分析を実行"""
    # 1. ドキュメント読み込み
    documents = await load_documents(document_ids)
    
    # 2. AI分析実行
    analysis_result = await ai_analyze_strategy(documents)
    
    # 3. 結果を中期計画に反映
    updated_plan = await apply_analysis_to_plan(analysis_result)
    
    return {
        "status": "success",
        "changes": analysis_result.changes,
        "recommendations": analysis_result.recommendations,
        "updated_plan": updated_plan
    }

@router.get("/dialogue/unified/{dialogue_id}")
async def get_unified_dialogue(dialogue_id: str):
    """統合対話データ取得"""
    return {
        "dialogue": await get_dialogue_data(dialogue_id),
        "transcription": await get_transcription(dialogue_id),
        "analysis": await get_dialogue_analysis(dialogue_id),
        "generated_faqs": await get_generated_faqs(dialogue_id),
        "related_questions": await get_related_questions(dialogue_id)
    }
```

### 2.2 リアルタイム同期

```javascript
// /cms2/static/js/core/realtime.js

class RealtimeSync {
    constructor() {
        this.ws = null;
        this.reconnectInterval = 5000;
        this.listeners = new Map();
    }
    
    connect() {
        this.ws = new WebSocket('ws://localhost:8002/ws');
        
        this.ws.onopen = () => {
            console.log('Realtime connection established');
            this.subscribe(['strategy', 'questions', 'insights']);
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleUpdate(data);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.reconnect();
        };
    }
    
    handleUpdate(data) {
        const { type, payload } = data;
        
        switch(type) {
            case 'strategy_update':
                this.updateStrategyDisplay(payload);
                break;
            case 'new_question':
                this.addNewQuestion(payload);
                break;
            case 'ai_insight':
                this.showAIInsight(payload);
                break;
        }
        
        // リスナーに通知
        if (this.listeners.has(type)) {
            this.listeners.get(type).forEach(callback => callback(payload));
        }
    }
    
    subscribe(topics) {
        this.ws.send(JSON.stringify({
            action: 'subscribe',
            topics: topics
        }));
    }
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
}
```

## 3. 画面統合実装

### 3.1 中期経営計画統合ダッシュボード

```html
<!-- /cms2/templates/pages/strategy-integrated.html -->
{% extends "base.html" %}

{% block content %}
<div id="strategy-dashboard" class="integrated-dashboard">
    <!-- ヘッダー部 -->
    <div class="dashboard-header">
        <div class="header-info">
            <h1>中期経営計画統合ダッシュボード</h1>
            <span class="plan-period">2024-2026</span>
        </div>
        <div class="header-actions">
            <button onclick="startAIAnalysis()" class="btn-ai">
                <i class="ai-icon"></i> AI分析
            </button>
            <button onclick="editStrategy()" class="btn-primary">
                計画を編集
            </button>
        </div>
    </div>
    
    <!-- AI通知エリア -->
    <div id="ai-notifications" class="ai-notifications">
        <!-- 動的に挿入 -->
    </div>
    
    <!-- メインコンテンツ -->
    <div class="dashboard-grid">
        <!-- KPIサマリー -->
        <div class="kpi-section">
            <div id="kpi-container" class="kpi-grid">
                <!-- KPIカードを動的に挿入 -->
            </div>
        </div>
        
        <!-- 投資家対話セクション -->
        <div class="dialogue-section">
            <div class="section-header">
                <h2>投資家からの質問</h2>
                <span class="badge" id="question-count">0</span>
            </div>
            <div id="question-list" class="question-list">
                <!-- 質問リストを動的に挿入 -->
            </div>
        </div>
        
        <!-- 戦略マップ -->
        <div class="strategy-map-section">
            <canvas id="strategy-map"></canvas>
        </div>
        
        <!-- AI インサイト -->
        <div id="ai-insights" class="ai-insights-section">
            <!-- AIインサイトを動的に挿入 -->
        </div>
    </div>
</div>

<script>
// 統合ダッシュボードの初期化
document.addEventListener('DOMContentLoaded', function() {
    const dashboard = new IntegratedStrategyDashboard();
    dashboard.init();
    
    // リアルタイム同期の開始
    const realtime = new RealtimeSync();
    realtime.connect();
    
    realtime.on('strategy_update', (data) => {
        dashboard.updateStrategy(data);
    });
    
    realtime.on('new_question', (data) => {
        dashboard.addQuestion(data);
    });
});
</script>
{% endblock %}
```

### 3.2 対話管理センター統合

```python
# /cms2/routes/dialogue_integrated.py

@app.get("/dialogue-center", response_class=HTMLResponse)
async def dialogue_center(request: Request):
    """統合対話管理センター"""
    return templates.TemplateResponse("pages/dialogue-integrated.html", {
        "request": request,
        "features": {
            "upload": True,
            "transcription": True,
            "analysis": True,
            "faq_generation": True,
            "publishing": True
        },
        "workflows": await get_dialogue_workflows(),
        "templates": await get_dialogue_templates()
    })
```

## 4. 移行計画詳細

### 4.1 段階的移行

```yaml
# migration_plan.yaml

phase1:
  duration: "2 months"
  features:
    - name: "中期経営計画統合ダッシュボード"
      current_pages:
        - strategy-planning.html
        - strategy-edit-ai.html
        - strategy-disclosure-assistant.html
      migration_steps:
        - データモデル統合
        - UI/UXデザイン確定
        - API開発
        - フロントエンド実装
        - テスト・デバッグ

phase2:
  duration: "2 months"
  features:
    - name: "対話管理センター"
      current_pages:
        - dialogue.html
        - dialogue-edit.html
        - dialogue-upload.html
        - dialogue-analysis.html
        - dialogue-publish.html
      migration_steps:
        - ワークフロー設計
        - 統合APIの実装
        - UI統合
        - データ移行ツール開発

phase3:
  duration: "2 months"
  features:
    - name: "統合スケジューラー"
      current_pages:
        - ir-calendar.html
        - meetings.html
        - schedule.html
```

### 4.2 ユーザー教育計画

```markdown
## トレーニングプログラム

### Week 1: 概要説明
- 新システムの利点
- 主要な変更点
- デモンストレーション

### Week 2: ハンズオン
- 中期経営計画ダッシュボードの使い方
- AI機能の活用方法
- 実践演習

### Week 3: 高度な機能
- カスタマイズ方法
- レポート作成
- トラブルシューティング

### Week 4: フィードバック収集
- ユーザーテスト
- 改善要望の収集
- Q&Aセッション
```

## 5. 成功指標

```javascript
// /cms2/static/js/analytics/success_metrics.js

const successMetrics = {
    // 定量的指標
    quantitative: {
        screenReduction: {
            target: 36, // %
            current: 0,
            measure: () => (39 - getCurrentScreenCount()) / 39 * 100
        },
        operationTimeReduction: {
            target: 50, // %
            measure: () => compareAverageTaskTime()
        },
        aiUtilization: {
            target: 80, // %
            measure: () => getAIFeatureUsageRate()
        }
    },
    
    // 定性的指標
    qualitative: {
        userSatisfaction: {
            target: 4.5, // /5
            measure: () => getUserSatisfactionScore()
        },
        decisionSpeed: {
            measure: () => getAverageDecisionTime()
        }
    }
};
```

## 6. 最終チェックリスト

- [ ] データ移行計画の確定
- [ ] バックアップ体制の確立
- [ ] ユーザー権限の移行マッピング
- [ ] パフォーマンステストの実施
- [ ] セキュリティ監査の完了
- [ ] ドキュメントの整備
- [ ] サポート体制の確立
