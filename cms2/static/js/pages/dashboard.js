/**
 * KAGAMI CMS 2.0 - ダッシュボード
 * メインダッシュボードの機能実装
 */

class DashboardManager {
    constructor() {
        this.charts = {};
        this.refreshInterval = 30000; // 30秒
        this.init();
    }

    async init() {
        // チャートの初期化
        this.initCharts();
        
        // データの読み込み
        await this.loadDashboardData();
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        // 自動更新の開始
        this.startAutoRefresh();
    }

    initCharts() {
        // 投資家エンゲージメントチャート
        const engagementCtx = document.getElementById('engagementChart');
        if (engagementCtx) {
            this.charts.engagement = new Chart(engagementCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'ログイン数',
                        data: [],
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }, {
                        label: '問い合わせ数',
                        data: [],
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            display: true,
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // 活動タイプ別チャート
        const activityCtx = document.getElementById('activityChart');
        if (activityCtx) {
            this.charts.activity = new Chart(activityCtx, {
                type: 'doughnut',
                data: {
                    labels: ['面談', 'メール', 'FAQ閲覧', 'ドキュメントDL'],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            'rgb(59, 130, 246)',
                            'rgb(16, 185, 129)',
                            'rgb(251, 146, 60)',
                            'rgb(163, 163, 163)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                        }
                    }
                }
            });
        }
    }

    async loadDashboardData() {
        try {
            // ローディング表示
            this.showLoading();

            // データ取得
            const response = await fetch('/api/dashboard');
            const data = await response.json();

            // 統計カードの更新
            this.updateStatCards(data);

            // チャートの更新
            this.updateCharts(data);

            // アクティビティリストの更新
            this.updateActivityList(data.recent_activities);

            // タスクリストの更新
            this.updateTaskList(data.pending_tasks);

        } catch (error) {
            console.error('Dashboard data loading error:', error);
            showError('エラー', 'ダッシュボードデータの読み込みに失敗しました');
        } finally {
            this.hideLoading();
        }
    }

    updateStatCards(data) {
        // 投資家数
        const investorCount = document.getElementById('totalInvestors');
        if (investorCount) {
            this.animateValue(investorCount, 0, data.total_investors, 1000);
        }

        // アクティブミーティング
        const meetingCount = document.getElementById('activeMeetings');
        if (meetingCount) {
            this.animateValue(meetingCount, 0, data.active_meetings, 1000);
        }

        // 保留中タスク
        const taskCount = document.getElementById('pendingTasks');
        if (taskCount) {
            this.animateValue(taskCount, 0, data.pending_tasks_count, 1000);
        }

        // AI応答精度
        const aiAccuracy = document.getElementById('aiAccuracy');
        if (aiAccuracy) {
            aiAccuracy.textContent = `${data.ai_accuracy}%`;
        }
    }

    updateCharts(data) {
        // エンゲージメントチャート更新
        if (this.charts.engagement && data.engagement_data) {
            this.charts.engagement.data.labels = data.engagement_data.labels;
            this.charts.engagement.data.datasets[0].data = data.engagement_data.logins;
            this.charts.engagement.data.datasets[1].data = data.engagement_data.inquiries;
            this.charts.engagement.update();
        }

        // アクティビティチャート更新
        if (this.charts.activity && data.activity_data) {
            this.charts.activity.data.datasets[0].data = data.activity_data.values;
            this.charts.activity.update();
        }
    }

    updateActivityList(activities) {
        const container = document.getElementById('recentActivitiesContainer');
        if (!container) return;

        container.innerHTML = activities.map(activity => `
            <div class="activity-item ${activity.status}">
                <div class="activity-icon">
                    ${this.getActivityIcon(activity.type)}
                </div>
                <div class="activity-content">
                    <p class="activity-title">${activity.title}</p>
                    <p class="activity-time">${this.formatTime(activity.time)}</p>
                </div>
                <div class="activity-status">
                    ${this.getActivityStatus(activity.status)}
                </div>
            </div>
        `).join('');
    }

    updateTaskList(tasks) {
        const container = document.getElementById('pendingTasksContainer');
        if (!container) return;

        container.innerHTML = tasks.map(task => `
            <div class="task-item" data-task-id="${task.id}">
                <input type="checkbox" 
                       class="task-checkbox" 
                       id="task-${task.id}"
                       onchange="dashboardManager.toggleTask('${task.id}')">
                <label for="task-${task.id}" class="task-label">
                    <span class="task-title">${task.title}</span>
                    <span class="task-meta">期限: ${this.formatDate(task.due_date)}</span>
                </label>
                <button class="task-action" onclick="dashboardManager.viewTask('${task.id}')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            meeting: '<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
            document: '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
            faq: '<svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
            email: '<svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>'
        };
        return icons[type] || icons.document;
    }

    getActivityStatus(status) {
        const statuses = {
            completed: '<span class="badge badge-success">完了</span>',
            pending: '<span class="badge badge-warning">保留中</span>',
            in_progress: '<span class="badge badge-info">進行中</span>'
        };
        return statuses[status] || statuses.pending;
    }

    animateValue(element, start, end, duration) {
        const startTimestamp = Date.now();
        const step = () => {
            const progress = Math.min((Date.now() - startTimestamp) / duration, 1);
            element.textContent = Math.floor(progress * (end - start) + start).toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    formatTime(timeString) {
        const date = new Date(timeString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return '今';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}時間前`;
        return date.toLocaleDateString('ja-JP');
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric'
        });
    }

    setupEventListeners() {
        // 更新ボタン
        const refreshBtn = document.getElementById('dashboardRefresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        // 期間選択
        const periodSelect = document.getElementById('dashboardPeriod');
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => this.changePeriod(e.target.value));
        }
    }

    async refresh() {
        const btn = document.getElementById('dashboardRefresh');
        if (btn) {
            btn.disabled = true;
            btn.querySelector('svg').classList.add('animate-spin');
        }
        
        await this.loadDashboardData();
        
        if (btn) {
            btn.disabled = false;
            btn.querySelector('svg').classList.remove('animate-spin');
        }
        
        showSuccess('更新完了', 'ダッシュボードを更新しました');
    }

    changePeriod(period) {
        // 期間変更時の処理
        console.log('Period changed:', period);
        this.loadDashboardData();
    }

    toggleTask(taskId) {
        // タスクの完了/未完了切り替え
        console.log('Toggle task:', taskId);
    }

    viewTask(taskId) {
        // タスク詳細表示
        window.location.href = `/tasks/${taskId}`;
    }

    startAutoRefresh() {
        setInterval(() => {
            this.loadDashboardData();
        }, this.refreshInterval);
    }

    showLoading() {
        document.querySelectorAll('.dashboard-loading').forEach(el => {
            el.classList.remove('hidden');
        });
    }

    hideLoading() {
        document.querySelectorAll('.dashboard-loading').forEach(el => {
            el.classList.add('hidden');
        });
    }
}

// 初期化
const dashboardManager = new DashboardManager();