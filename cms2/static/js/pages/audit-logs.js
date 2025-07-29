/**
 * 監査ログ管理機能
 */
const AuditLogManager = {
    autoRefreshInterval: null,
    currentPage: 1,
    itemsPerPage: 20,

    // 初期化
    init() {
        this.bindEvents();
        this.startAutoRefresh();
    },

    // イベントバインディング
    bindEvents() {
        // 日付範囲変更
        const dateRange = document.getElementById('dateRange');
        if (dateRange) {
            dateRange.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    this.showCustomDateDialog();
                }
            });
        }

        // Enterキーでフィルター適用
        const userFilter = document.getElementById('userFilter');
        if (userFilter) {
            userFilter.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.applyFilters();
                }
            });
        }
    },

    // 自動更新開始
    startAutoRefresh() {
        // 30秒ごとに更新
        this.autoRefreshInterval = setInterval(() => {
            this.refreshLogs(true);
        }, 30000);
    },

    // 自動更新停止
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    },

    // ログ更新
    refreshLogs(silent = false) {
        if (!silent) {
            NotificationManager.show('info', 'ログを更新中...');
        }

        // モック：実際の実装では、APIから最新ログを取得
        setTimeout(() => {
            if (!silent) {
                NotificationManager.show('success', 'ログを更新しました');
            }
            console.log('ログを更新しました');
        }, 1000);
    },

    // フィルター適用
    applyFilters() {
        const filters = {
            dateRange: document.getElementById('dateRange').value,
            eventType: document.getElementById('eventType').value,
            severity: document.getElementById('severity').value,
            user: document.getElementById('userFilter').value.toLowerCase()
        };

        // ログ行をフィルタリング
        const rows = document.querySelectorAll('.log-row');
        let visibleCount = 0;

        rows.forEach(row => {
            const matchesType = !filters.eventType || row.dataset.type === filters.eventType;
            const matchesSeverity = !filters.severity || row.dataset.severity === filters.severity;
            const matchesUser = !filters.user || row.textContent.toLowerCase().includes(filters.user);

            const shouldShow = matchesType && matchesSeverity && matchesUser;
            row.style.display = shouldShow ? '' : 'none';

            if (shouldShow) visibleCount++;
        });

        // 結果を通知
        NotificationManager.show('info', `${visibleCount}件のログが見つかりました`);
    },

    // カスタム日付ダイアログ
    showCustomDateDialog() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container" style="max-width: 400px;">
                <div class="modal-header">
                    <h3 class="modal-title">カスタム期間設定</h3>
                    <button onclick="this.closest('.modal-overlay').remove()" class="modal-close">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">開始日</label>
                        <input type="date" id="startDate" class="form-input" value="${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">終了日</label>
                        <input type="date" id="endDate" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">
                        キャンセル
                    </button>
                    <button onclick="AuditLogManager.applyCustomDateRange()" class="btn btn-primary">
                        適用
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    // カスタム日付範囲を適用
    applyCustomDateRange() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (startDate && endDate) {
            // モック：実際の実装では、この期間でログを再取得
            NotificationManager.show('info', `${startDate} から ${endDate} の期間でログを表示`);
            document.querySelector('.modal-overlay').remove();
            this.applyFilters();
        }
    },

    // ログ詳細表示
    showDetails(logId) {
        // モック：実際の実装では、APIから詳細情報を取得
        const mockLogDetail = {
            id: logId,
            timestamp: '2024-01-22 15:30:45',
            event_type: 'data',
            event_name: 'ドキュメント更新',
            user_name: '山田 太郎',
            user_id: 'USR001',
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
            details: 'ドキュメント「2024年第3四半期決算説明資料」を更新しました',
            severity: 'info',
            session_id: 'SES123456789',
            request_id: 'REQ987654321',
            additional_data: {
                document_id: 'DOC001',
                document_name: '2024年第3四半期決算説明資料',
                action: 'update',
                changes: ['タイトル変更', 'ページ15-20更新']
            }
        };

        const content = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-sm font-medium text-gray-500">ログID</label>
                        <p class="mt-1">${mockLogDetail.id}</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-500">タイムスタンプ</label>
                        <p class="mt-1">${mockLogDetail.timestamp}</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-500">イベントタイプ</label>
                        <p class="mt-1">${mockLogDetail.event_type}</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-500">イベント名</label>
                        <p class="mt-1">${mockLogDetail.event_name}</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-500">ユーザー</label>
                        <p class="mt-1">${mockLogDetail.user_name} (${mockLogDetail.user_id})</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-500">IPアドレス</label>
                        <p class="mt-1 font-mono text-sm">${mockLogDetail.ip_address}</p>
                    </div>
                </div>
                
                <div>
                    <label class="text-sm font-medium text-gray-500">ユーザーエージェント</label>
                    <p class="mt-1 text-sm">${mockLogDetail.user_agent}</p>
                </div>
                
                <div>
                    <label class="text-sm font-medium text-gray-500">詳細</label>
                    <p class="mt-1">${mockLogDetail.details}</p>
                </div>
                
                <div>
                    <label class="text-sm font-medium text-gray-500">追加情報</label>
                    <pre class="mt-1 p-3 bg-gray-50 rounded text-sm overflow-x-auto">${JSON.stringify(mockLogDetail.additional_data, null, 2)}</pre>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-sm font-medium text-gray-500">セッションID</label>
                        <p class="mt-1 font-mono text-sm">${mockLogDetail.session_id}</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-500">リクエストID</label>
                        <p class="mt-1 font-mono text-sm">${mockLogDetail.request_id}</p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('logDetailContent').innerHTML = content;
        document.getElementById('logDetailModal').classList.remove('hidden');
    },

    // 詳細モーダルを閉じる
    closeDetailModal() {
        document.getElementById('logDetailModal').classList.add('hidden');
    },

    // ログエクスポート
    exportLogs() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">ログエクスポート</h3>
                    <button onclick="this.closest('.modal-overlay').remove()" class="modal-close">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">エクスポート形式</label>
                        <select id="exportFormat" class="form-select">
                            <option value="csv">CSV形式</option>
                            <option value="json">JSON形式</option>
                            <option value="pdf">PDF形式（レポート）</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">対象期間</label>
                        <select id="exportPeriod" class="form-select">
                            <option value="current">現在のフィルター条件</option>
                            <option value="today">今日</option>
                            <option value="week">過去7日間</option>
                            <option value="month">過去30日間</option>
                            <option value="all">全期間</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="includePersonalInfo" class="checkbox-input">
                            <span>個人情報を含める（IPアドレス、ユーザー名など）</span>
                        </label>
                    </div>
                    
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                        <p class="text-yellow-800">
                            <strong>注意:</strong> エクスポートされたログには機密情報が含まれる可能性があります。適切に管理してください。
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">
                        キャンセル
                    </button>
                    <button onclick="AuditLogManager.performExport()" class="btn btn-primary">
                        エクスポート
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    // エクスポート実行
    performExport() {
        const format = document.getElementById('exportFormat').value;
        const period = document.getElementById('exportPeriod').value;
        const includePersonalInfo = document.getElementById('includePersonalInfo').checked;

        // モーダルを閉じる
        document.querySelector('.modal-overlay').remove();

        // モック：実際の実装では、サーバーでファイルを生成してダウンロード
        NotificationManager.show('info', 'エクスポートを準備中...');

        setTimeout(() => {
            const filename = `audit_logs_${period}_${new Date().toISOString().split('T')[0]}.${format}`;
            
            // ダミーのダウンロード処理
            const link = document.createElement('a');
            link.href = '#';
            link.download = filename;
            link.click();

            NotificationManager.show('success', `ログのエクスポートが完了しました: ${filename}`);
        }, 2000);
    },

    // ページ切り替え
    changePage(page) {
        this.currentPage = page;
        this.refreshLogs();
    }
};

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', () => {
    AuditLogManager.init();
});

// ページ離脱時に自動更新を停止
window.addEventListener('beforeunload', () => {
    AuditLogManager.stopAutoRefresh();
});