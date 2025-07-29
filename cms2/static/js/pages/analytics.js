/**
 * アナリティクス管理機能
 */
const AnalyticsManager = {
    charts: {
        engagement: null,
        faq: null
    },

    // 初期化
    init() {
        this.bindEvents();
        this.initCharts();
    },

    // イベントバインディング
    bindEvents() {
        // 期間選択
        const periodSelect = document.getElementById('periodSelect');
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => this.handlePeriodChange(e));
        }
    },

    // グラフ初期化
    initCharts() {
        this.initEngagementChart();
        this.initFaqChart();
    },

    // 投資家エンゲージメント推移グラフ
    initEngagementChart() {
        const ctx = document.getElementById('engagementChart');
        if (!ctx) return;

        this.charts.engagement = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                datasets: [{
                    label: 'アクティブユーザー数',
                    data: [285, 298, 312, 289, 324, 342, 338, 356, 371, 389, 402, 418],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: '総アクセス数',
                    data: [1520, 1685, 1890, 1756, 2012, 2234, 2189, 2356, 2512, 2687, 2834, 2976],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    // FAQ利用状況グラフ
    initFaqChart() {
        const ctx = document.getElementById('faqChart');
        if (!ctx) return;

        this.charts.faq = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['財務・業績', '経営戦略', 'ESG', '株主還元', 'ガバナンス', 'その他'],
                datasets: [{
                    data: [35, 28, 18, 12, 5, 2],
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6',
                        '#6b7280'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return label + ': ' + value + '%';
                            }
                        }
                    }
                }
            }
        });
    },

    // 期間変更処理
    handlePeriodChange(e) {
        const period = e.target.value;
        
        // カスタム期間の場合
        if (period === 'custom') {
            this.showCustomPeriodDialog();
            return;
        }
        
        // データ更新
        this.updateCharts(period);
        NotificationManager.show('info', '期間を変更しました');
    },

    // カスタム期間ダイアログ
    showCustomPeriodDialog() {
        // モック：実際の実装では、日付選択モーダルを表示
        const startDate = prompt('開始日を入力してください (YYYY-MM-DD):', '2024-01-01');
        const endDate = prompt('終了日を入力してください (YYYY-MM-DD):', '2024-12-31');
        
        if (startDate && endDate) {
            this.updateCharts('custom', { start: startDate, end: endDate });
            NotificationManager.show('info', `期間を ${startDate} から ${endDate} に設定しました`);
        }
    },

    // グラフデータ更新
    updateCharts(period, customRange = null) {
        // モック：実際の実装では、APIからデータを取得
        
        // エンゲージメントチャート更新
        if (this.charts.engagement) {
            this.charts.engagement.data.datasets[0].data = 
                this.charts.engagement.data.datasets[0].data.map(() => 
                    Math.floor(Math.random() * 150) + 250
                );
            this.charts.engagement.data.datasets[1].data = 
                this.charts.engagement.data.datasets[1].data.map(() => 
                    Math.floor(Math.random() * 1000) + 1500
                );
            this.charts.engagement.update('active');
        }
        
        // FAQチャート更新
        if (this.charts.faq) {
            const values = [35, 28, 18, 12, 5, 2].map(() => Math.floor(Math.random() * 40) + 10);
            const sum = values.reduce((a, b) => a + b, 0);
            this.charts.faq.data.datasets[0].data = values.map(v => Math.round(v / sum * 100));
            this.charts.faq.update('active');
        }
    },

    // データ更新
    refresh() {
        // モック：実際の実装では、APIから最新データを取得
        const btn = event.target.closest('button');
        const originalContent = btn.innerHTML;
        
        btn.disabled = true;
        btn.innerHTML = `
            <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            更新中...
        `;
        
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalContent;
            NotificationManager.show('success', 'データを更新しました');
            
            // グラフを更新
            const period = document.getElementById('periodSelect').value;
            this.updateCharts(period);
        }, 2000);
    },

    // レポート出力
    exportReport() {
        // フォーマット選択ダイアログ
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container" style="max-width: 400px;">
                <div class="modal-header">
                    <h3 class="modal-title">レポート出力</h3>
                    <button onclick="this.closest('.modal-overlay').remove()" class="modal-close">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <p class="mb-4">レポートの出力形式を選択してください。</p>
                    <div class="space-y-3">
                        <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="format" value="pdf" class="mr-3" checked>
                            <div>
                                <div class="font-medium">PDF形式</div>
                                <div class="text-sm text-gray-500">プレゼンテーション用</div>
                            </div>
                        </label>
                        <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="format" value="excel" class="mr-3">
                            <div>
                                <div class="font-medium">Excel形式</div>
                                <div class="text-sm text-gray-500">詳細分析用</div>
                            </div>
                        </label>
                        <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="format" value="ppt" class="mr-3">
                            <div>
                                <div class="font-medium">PowerPoint形式</div>
                                <div class="text-sm text-gray-500">経営報告用</div>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">
                        キャンセル
                    </button>
                    <button onclick="AnalyticsManager.downloadReport()" class="btn btn-primary">
                        ダウンロード
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    // レポートダウンロード
    downloadReport() {
        const format = document.querySelector('input[name="format"]:checked').value;
        const formatNames = {
            'pdf': 'PDF',
            'excel': 'Excel',
            'ppt': 'PowerPoint'
        };
        
        // モーダルを閉じる
        document.querySelector('.modal-overlay').remove();
        
        // モック：実際の実装では、サーバーでレポートを生成してダウンロード
        NotificationManager.show('info', `${formatNames[format]}形式でレポートを生成中...`);
        
        setTimeout(() => {
            // ダミーのダウンロード処理
            const link = document.createElement('a');
            link.href = '#';
            link.download = `analytics_report_${new Date().toISOString().split('T')[0]}.${format}`;
            link.click();
            
            NotificationManager.show('success', 'レポートのダウンロードが完了しました');
        }, 3000);
    },

    // 詳細分析表示
    showDetailedAnalysis(topic) {
        // モック：実際の実装では、詳細分析モーダルを表示
        console.log(`Showing detailed analysis for: ${topic}`);
    }
};

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', () => {
    AnalyticsManager.init();
});