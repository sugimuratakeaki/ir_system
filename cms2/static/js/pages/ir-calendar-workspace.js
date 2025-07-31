/**
 * IRカレンダー・面談ワークスペース JavaScript
 */

// グローバル状態管理
let selectedMeetingId = 'meeting-001';
let currentView = 'month';
let currentDate = new Date();

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeWorkspace();
    setupEventListeners();
    renderCalendar();
});

/**
 * ワークスペースの初期化
 */
function initializeWorkspace() {
    // 初期面談を選択
    selectMeeting('meeting-001');
    
    // カレンダーの初期表示
    updateCalendarHeader();
    
    // リアルタイム更新の準備（WebSocket接続など）
    // initializeWebSocket();
}

/**
 * イベントリスナーのセットアップ
 */
function setupEventListeners() {
    // キーボードショートカット
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // カレンダーナビゲーション
    document.addEventListener('wheel', handleCalendarScroll);
}

/**
 * 面談選択
 */
function selectMeeting(meetingId) {
    // 前の選択を解除
    document.querySelectorAll('.meeting-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // 新しい選択を設定
    const selectedCard = document.querySelector(`[onclick="selectMeeting('${meetingId}')"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    selectedMeetingId = meetingId;
    
    // 詳細パネルを更新
    updateDetailPanel(meetingId);
}

/**
 * 詳細パネルの更新
 */
function updateDetailPanel(meetingId) {
    const meetingDetails = getMeetingDetails(meetingId);
    const detailPanel = document.getElementById('meeting-detail');
    
    if (!meetingDetails || !detailPanel) return;
    
    // 詳細情報を動的に更新
    detailPanel.innerHTML = generateDetailPanelHTML(meetingDetails);
    
    // アニメーション効果
    detailPanel.style.opacity = '0';
    setTimeout(() => {
        detailPanel.style.transition = 'opacity 0.3s';
        detailPanel.style.opacity = '1';
    }, 50);
}

/**
 * 面談詳細データの取得（モック）
 */
function getMeetingDetails(meetingId) {
    const meetings = {
        'meeting-001': {
            investor: '北米年金基金C社',
            avatar: 'C',
            title: 'CEO面談リクエスト',
            status: 'pending',
            urgency: 'urgent',
            date: '1/12（日）10:00-11:00',
            format: 'オンライン (Zoom)',
            participants: 'CEO必須',
            theme: '長期成長戦略',
            aum: '$50B',
            style: 'ESG重視',
            lastMeeting: '初回',
            priority: 4,
            workflowStep: 1
        },
        'meeting-002': {
            investor: 'BlackRock',
            avatar: 'B',
            title: 'ESG戦略個別面談',
            status: 'approved',
            urgency: 'today',
            date: '今日 14:00-15:00',
            format: '対面（本社会議室）',
            participants: 'CEO, CFO, ESG責任者',
            theme: 'ESG取り組みの詳細説明',
            aum: '$9.5T',
            style: 'インデックス',
            lastMeeting: '3ヶ月前',
            priority: 5,
            workflowStep: 3
        },
        'meeting-003': {
            investor: 'Vanguard',
            avatar: 'V',
            title: '決算説明フォローアップ',
            status: 'preparing',
            urgency: 'tomorrow',
            date: '明日 10:00-11:00',
            format: 'オンライン (Teams)',
            participants: 'CFO, IR部長',
            theme: '第3四半期決算の詳細',
            aum: '$7.2T',
            style: 'パッシブ運用',
            lastMeeting: '1ヶ月前',
            priority: 4,
            workflowStep: 2
        }
    };
    
    return meetings[meetingId];
}

/**
 * 詳細パネルHTMLの生成
 */
function generateDetailPanelHTML(details) {
    const urgencyBadge = {
        urgent: '<span class="badge badge-danger"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>承認期限: 2時間後</span>',
        today: '<span class="badge badge-primary">本日実施</span>',
        tomorrow: '<span class="badge badge-warning">明日実施</span>'
    };
    
    return `
        <div class="meeting-detail-header">
            <div class="investor-avatar">${details.avatar}</div>
            <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-900 mb-1">${details.investor}</h3>
                <p class="text-gray-600">${details.title}</p>
                <div class="flex items-center gap-2 mt-2">
                    ${urgencyBadge[details.urgency] || ''}
                </div>
            </div>
        </div>
        
        ${generateWorkflowProgress(details.workflowStep)}
        
        <div class="detail-section">
            <h4 class="detail-section-title">面談詳細</h4>
            <div class="detail-item">
                <span class="detail-label">日時</span>
                <span class="detail-value">${details.date}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">形式</span>
                <span class="detail-value">${details.format}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">参加者</span>
                <span class="detail-value">${details.participants}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">テーマ</span>
                <span class="detail-value">${details.theme}</span>
            </div>
        </div>
        
        <div class="investor-info-card">
            <h4 class="detail-section-title">投資家情報</h4>
            <div class="investor-metrics">
                <div class="metric-item">
                    <span class="metric-label">運用資産</span>
                    <span class="metric-value">${details.aum}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">投資スタイル</span>
                    <span class="metric-value">${details.style}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">前回面談</span>
                    <span class="metric-value">${details.lastMeeting}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">重要度</span>
                    <span class="metric-value text-orange-600">${generatePriorityStars(details.priority)}</span>
                </div>
            </div>
        </div>
        
        ${generateActionButtons(details.status)}
    `;
}

/**
 * ワークフロープログレスの生成
 */
function generateWorkflowProgress(step) {
    const steps = ['申請受付', '承認', '準備', '実施', '完了'];
    
    let html = '<div class="workflow-progress"><h4 class="text-sm font-semibold text-gray-700 mb-3">承認ワークフロー</h4><div class="progress-steps">';
    
    steps.forEach((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === step;
        const isCompleted = stepNumber < step;
        const className = isActive ? 'active' : isCompleted ? 'completed' : '';
        
        html += `
            <div class="progress-step ${className}">
                <div class="step-circle">${stepNumber}</div>
                <div class="step-label">${label}</div>
            </div>
        `;
    });
    
    html += '</div></div>';
    return html;
}

/**
 * 優先度の星表示生成
 */
function generatePriorityStars(priority) {
    let stars = '';
    for (let i = 0; i < priority; i++) {
        stars += '<svg class="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    }
    return stars + ` <span class="ml-1">${priority === 5 ? '最高' : '高'}優先度</span>`;
}

/**
 * アクションボタンの生成
 */
function generateActionButtons(status) {
    const buttons = {
        pending: `
            <button class="btn btn-success" onclick="approveMeeting('${selectedMeetingId}')">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                承認
            </button>
            <button class="btn btn-warning" onclick="rescheduleMeeting('${selectedMeetingId}')">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                日程調整
            </button>
        `,
        approved: `
            <button class="btn btn-primary" onclick="startPreparation('${selectedMeetingId}')">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                準備開始
            </button>
        `,
        preparing: `
            <button class="btn btn-success" onclick="completeMeeting('${selectedMeetingId}')">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                準備完了
            </button>
        `
    };
    
    return `
        <div class="action-buttons">
            ${buttons[status] || ''}
            <button class="btn btn-secondary" onclick="viewInvestorHistory('${selectedMeetingId}')">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                履歴確認
            </button>
        </div>
    `;
}

/**
 * カレンダー操作
 */
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendarHeader();
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendarHeader();
    renderCalendar();
}

function updateCalendarHeader() {
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const header = document.querySelector('.calendar-header h2');
    if (header) {
        header.textContent = `${currentDate.getFullYear()}年${monthNames[currentDate.getMonth()]}`;
    }
}

function renderCalendar() {
    // カレンダーの再描画処理
    console.log('カレンダーを更新:', currentDate);
}

/**
 * ビュー切り替え
 */
function setView(view) {
    currentView = view;
    
    // ボタンのアクティブ状態を更新
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`.view-toggle-btn[onclick="setView('${view}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // ビューに応じてカレンダーを再描画
    renderCalendarView(view);
}

function renderCalendarView(view) {
    // ビューごとの表示処理
    console.log('ビュー変更:', view);
}

/**
 * フィルター処理
 */
function filterMeetings(filter) {
    // フィルターボタンのアクティブ状態を更新
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`.filter-btn[onclick="filterMeetings('${filter}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // フィルターに応じて面談リストを更新
    applyMeetingFilter(filter);
}

function applyMeetingFilter(filter) {
    const meetingCards = document.querySelectorAll('.meeting-card');
    
    meetingCards.forEach(card => {
        switch (filter) {
            case 'pending':
                card.style.display = card.classList.contains('pending') || card.classList.contains('urgent') ? 'flex' : 'none';
                break;
            case 'today':
                card.style.display = card.classList.contains('approved') ? 'flex' : 'none';
                break;
            default:
                card.style.display = 'flex';
        }
    });
}

/**
 * アクション処理
 */
function approveMeeting(meetingId) {
    document.getElementById('quickActionModal').classList.remove('hidden');
}

function closeQuickAction() {
    document.getElementById('quickActionModal').classList.add('hidden');
}

function confirmApproval() {
    showNotification('success', '面談を承認し、準備フェーズに移行しました');
    closeQuickAction();
    
    // ステータスを更新
    updateMeetingStatus(selectedMeetingId, 'approved');
}

function rescheduleMeeting(meetingId) {
    showNotification('info', '日程調整画面を開きます');
}

function viewInvestorHistory(meetingId) {
    showNotification('info', '投資家履歴を表示します');
}

function createNewMeeting() {
    showNotification('info', '新規面談登録画面を開きます');
}

function startPreparation(meetingId) {
    showNotification('success', '準備フェーズを開始しました');
    updateMeetingStatus(meetingId, 'preparing');
}

function completeMeeting(meetingId) {
    showNotification('success', '面談準備が完了しました');
    updateMeetingStatus(meetingId, 'ready');
}

/**
 * ステータス更新
 */
function updateMeetingStatus(meetingId, status) {
    console.log('ステータス更新:', meetingId, status);
    
    // UIを更新
    selectMeeting(meetingId);
}

/**
 * キーボードショートカット
 */
function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'n':
                e.preventDefault();
                createNewMeeting();
                break;
            case 'a':
                e.preventDefault();
                if (selectedMeetingId) {
                    approveMeeting(selectedMeetingId);
                }
                break;
            case 'f':
                e.preventDefault();
                document.querySelector('.filter-btn').focus();
                break;
        }
    }
}

/**
 * カレンダースクロール
 */
function handleCalendarScroll(e) {
    if (e.target.closest('.calendar-grid')) {
        e.preventDefault();
        if (e.deltaY > 0) {
            nextMonth();
        } else {
            previousMonth();
        }
    }
}

/**
 * 通知表示
 */
function showNotification(type, message) {
    if (window.showNotification) {
        window.showNotification(type, message);
    } else {
        console.log(`[${type}] ${message}`);
    }
}