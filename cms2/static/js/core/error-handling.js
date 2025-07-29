/**
 * KAGAMI CMS 2.0 - Error Handling & Loading States
 * エラーハンドリングとローディング状態管理
 */

// エラーハンドラー
KAGAMI.ErrorHandler = class {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.setupGlobalErrorHandling();
    }
    
    setupGlobalErrorHandling() {
        // グローバルエラーハンドリング
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'javascript',
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error
            });
        });
        
        // Promiseのエラーハンドリング
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise',
                message: event.reason.message || event.reason,
                error: event.reason
            });
        });
    }
    
    logError(errorInfo) {
        // エラーログに追加
        this.errorLog.push({
            ...errorInfo,
            timestamp: new Date(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
        
        // ログサイズ制限
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }
        
        // コンソールに出力（開発環境のみ）
        if (KAGAMI.config.debug) {
            console.error('KAGAMI Error:', errorInfo);
        }
        
        // エラー通知
        this.notifyError(errorInfo);
    }
    
    notifyError(errorInfo) {
        // ユーザーへの通知
        if (errorInfo.type === 'api' && errorInfo.status === 401) {
            showNotification('認証エラー: ログインし直してください', 'error', 0);
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else if (errorInfo.type === 'api' && errorInfo.status >= 500) {
            showNotification('サーバーエラーが発生しました。しばらく経ってから再試行してください。', 'error');
        } else if (errorInfo.type === 'network') {
            showNotification('ネットワークエラーが発生しました。接続を確認してください。', 'error');
        }
    }
    
    handleApiError(error, endpoint) {
        const errorInfo = {
            type: 'api',
            endpoint: endpoint,
            message: error.message,
            status: error.status || 0,
            error: error
        };
        
        this.logError(errorInfo);
        
        // エラーレスポンスを返す
        return {
            success: false,
            error: errorInfo
        };
    }
    
    getErrorLog() {
        return this.errorLog;
    }
    
    clearErrorLog() {
        this.errorLog = [];
    }
    
    exportErrorLog() {
        const data = JSON.stringify(this.errorLog, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kagami-error-log-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
};

// ローディング管理
KAGAMI.LoadingManager = class {
    constructor() {
        this.activeLoaders = new Set();
        this.createGlobalLoader();
    }
    
    createGlobalLoader() {
        // グローバルローディングオーバーレイ
        const overlay = document.createElement('div');
        overlay.id = 'globalLoadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <div class="loading-message">処理中...</div>
                <div class="loading-progress" style="display: none;">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%;"></div>
                    </div>
                    <div class="progress-text">0%</div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        this.overlay = overlay;
    }
    
    show(id = 'default', message = '処理中...', showProgress = false) {
        this.activeLoaders.add(id);
        
        const messageEl = this.overlay.querySelector('.loading-message');
        const progressEl = this.overlay.querySelector('.loading-progress');
        
        messageEl.textContent = message;
        progressEl.style.display = showProgress ? 'block' : 'none';
        
        this.overlay.classList.add('active');
        
        return {
            updateMessage: (msg) => this.updateMessage(msg),
            updateProgress: (percent) => this.updateProgress(percent),
            hide: () => this.hide(id)
        };
    }
    
    hide(id = 'default') {
        this.activeLoaders.delete(id);
        
        // すべてのローダーが完了したら非表示
        if (this.activeLoaders.size === 0) {
            this.overlay.classList.remove('active');
            
            // プログレスバーをリセット
            setTimeout(() => {
                this.updateProgress(0);
            }, 300);
        }
    }
    
    updateMessage(message) {
        const messageEl = this.overlay.querySelector('.loading-message');
        messageEl.textContent = message;
    }
    
    updateProgress(percent) {
        const progressFill = this.overlay.querySelector('.progress-fill');
        const progressText = this.overlay.querySelector('.progress-text');
        
        progressFill.style.width = `${percent}%`;
        progressText.textContent = `${Math.round(percent)}%`;
    }
    
    isLoading() {
        return this.activeLoaders.size > 0;
    }
};

// APIエラーハンドリングの拡張
KAGAMI.api.request = async function(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), KAGAMI.config.api.timeout);
    
    // ローディング表示
    const loader = KAGAMI.loading.show('api-request', 'データを取得中...');
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                ...options.headers
            }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw {
                status: response.status,
                statusText: response.statusText,
                message: `HTTP error! status: ${response.status}`,
                response: response
            };
        }
        
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }
        
        loader.hide();
        return data;
        
    } catch (error) {
        loader.hide();
        
        if (error.name === 'AbortError') {
            error.message = 'リクエストがタイムアウトしました';
            error.type = 'timeout';
        } else if (!navigator.onLine) {
            error.message = 'インターネット接続がありません';
            error.type = 'network';
        }
        
        // エラーハンドラーに渡す
        return KAGAMI.errorHandler.handleApiError(error, url);
    }
};

// 再試行機能付きリクエスト
KAGAMI.api.requestWithRetry = async function(url, options = {}, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await this.request(url, options);
            
            // エラーレスポンスの場合は再試行しない
            if (result && result.success === false) {
                return result;
            }
            
            return result;
            
        } catch (error) {
            lastError = error;
            
            // 再試行可能なエラーかチェック
            if (error.status && error.status < 500) {
                // 4xxエラーは再試行しない
                throw error;
            }
            
            if (attempt < maxRetries) {
                // 指数バックオフ
                const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                showNotification(`接続を再試行中... (${attempt + 1}/${maxRetries})`, 'warning');
            }
        }
    }
    
    throw lastError;
};

// オフライン対応
KAGAMI.OfflineManager = class {
    constructor() {
        this.isOnline = navigator.onLine;
        this.queue = [];
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            showNotification('オンラインに復帰しました', 'success');
            this.processQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            showNotification('オフラインモードです。データは保存され、オンライン復帰時に同期されます。', 'warning', 0);
        });
    }
    
    addToQueue(request) {
        this.queue.push({
            ...request,
            timestamp: new Date(),
            id: generateId('queue')
        });
        
        // ローカルストレージに保存
        this.saveQueue();
    }
    
    async processQueue() {
        if (!this.isOnline || this.queue.length === 0) return;
        
        const loader = KAGAMI.loading.show('sync', '保留中のデータを同期中...', true);
        const total = this.queue.length;
        let processed = 0;
        
        while (this.queue.length > 0) {
            const request = this.queue.shift();
            
            try {
                await KAGAMI.api.request(request.url, request.options);
                processed++;
                
                // プログレス更新
                loader.updateProgress((processed / total) * 100);
                
            } catch (error) {
                // 失敗したリクエストは再度キューに戻す
                this.queue.unshift(request);
                break;
            }
        }
        
        this.saveQueue();
        loader.hide();
        
        if (processed === total) {
            showNotification('すべてのデータが同期されました', 'success');
        } else {
            showNotification(`${processed}/${total} 件のデータが同期されました`, 'warning');
        }
    }
    
    saveQueue() {
        localStorage.setItem('kagami-offline-queue', JSON.stringify(this.queue));
    }
    
    loadQueue() {
        const saved = localStorage.getItem('kagami-offline-queue');
        if (saved) {
            try {
                this.queue = JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load offline queue:', e);
            }
        }
    }
};

// パフォーマンスモニタリング
KAGAMI.PerformanceMonitor = class {
    constructor() {
        this.metrics = new Map();
        this.thresholds = {
            pageLoad: 3000,
            apiCall: 1000,
            render: 100
        };
    }
    
    startMeasure(name) {
        performance.mark(`${name}-start`);
    }
    
    endMeasure(name, category = 'general') {
        performance.mark(`${name}-end`);
        
        try {
            performance.measure(name, `${name}-start`, `${name}-end`);
            const measure = performance.getEntriesByName(name)[0];
            
            this.metrics.set(name, {
                duration: measure.duration,
                category: category,
                timestamp: new Date()
            });
            
            // 閾値チェック
            if (this.thresholds[category] && measure.duration > this.thresholds[category]) {
                console.warn(`Performance warning: ${name} took ${measure.duration.toFixed(2)}ms (threshold: ${this.thresholds[category]}ms)`);
            }
            
            // クリーンアップ
            performance.clearMarks(`${name}-start`);
            performance.clearMarks(`${name}-end`);
            performance.clearMeasures(name);
            
            return measure.duration;
        } catch (e) {
            console.error('Performance measurement error:', e);
            return null;
        }
    }
    
    getMetrics() {
        return Array.from(this.metrics.entries()).map(([name, data]) => ({
            name,
            ...data
        }));
    }
    
    getAverageByCategory(category) {
        const categoryMetrics = this.getMetrics().filter(m => m.category === category);
        if (categoryMetrics.length === 0) return 0;
        
        const sum = categoryMetrics.reduce((acc, m) => acc + m.duration, 0);
        return sum / categoryMetrics.length;
    }
    
    generateReport() {
        const report = {
            timestamp: new Date(),
            metrics: this.getMetrics(),
            averages: {
                pageLoad: this.getAverageByCategory('pageLoad'),
                apiCall: this.getAverageByCategory('apiCall'),
                render: this.getAverageByCategory('render')
            },
            userAgent: navigator.userAgent,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null
        };
        
        return report;
    }
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    // エラーハンドラーの初期化
    KAGAMI.errorHandler = new KAGAMI.ErrorHandler();
    
    // ローディングマネージャーの初期化
    KAGAMI.loading = new KAGAMI.LoadingManager();
    
    // オフラインマネージャーの初期化
    KAGAMI.offline = new KAGAMI.OfflineManager();
    KAGAMI.offline.loadQueue();
    
    // パフォーマンスモニターの初期化
    KAGAMI.performance = new KAGAMI.PerformanceMonitor();
    
    // ページロード時間の計測
    if (window.performance && window.performance.timing) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
    }
});

// グローバル関数
window.showLoading = (message, showProgress) => KAGAMI.loading.show('manual', message, showProgress);
window.hideLoading = () => KAGAMI.loading.hide('manual');

// スタイル
const style = document.createElement('style');
style.textContent = `
/* ローディングオーバーレイ */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
    visibility: hidden;
    transition: opacity var(--transition-normal), visibility var(--transition-normal);
}

.loading-overlay.active {
    opacity: 1;
    visibility: visible;
}

.loading-content {
    text-align: center;
}

.loading-spinner {
    width: 80px;
    height: 80px;
    margin: 0 auto var(--space-lg);
    position: relative;
}

.spinner-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 3px solid transparent;
    border-radius: 50%;
    animation: spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
    border-top-color: var(--accent-teal);
    animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
    border-right-color: var(--info);
    animation-delay: -0.3s;
}

.spinner-ring:nth-child(3) {
    border-bottom-color: var(--success);
    animation-delay: -0.15s;
}

.spinner-ring:nth-child(4) {
    border-left-color: var(--warning);
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.loading-message {
    font-size: var(--text-lg);
    color: var(--gray-700);
    margin-bottom: var(--space-md);
}

.loading-progress {
    width: 300px;
    margin: 0 auto;
}

.progress-bar {
    height: 6px;
    background: var(--gray-200);
    border-radius: var(--border-radius-full);
    overflow: hidden;
    margin-bottom: var(--space-sm);
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-teal), var(--info));
    transition: width var(--transition-normal);
}

.progress-text {
    font-size: var(--text-sm);
    color: var(--gray-600);
}

/* エラー通知の強調 */
.notification-error {
    animation: shake 0.5s ease-in-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
}

/* オフラインインジケーター */
body.offline::before {
    content: 'オフライン';
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    background: var(--warning);
    color: white;
    padding: var(--space-xs) var(--space-md);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
    z-index: 10000;
}
`;
document.head.appendChild(style);

// オフライン状態の表示
if (!navigator.onLine) {
    document.body.classList.add('offline');
}
window.addEventListener('online', () => document.body.classList.remove('offline'));
window.addEventListener('offline', () => document.body.classList.add('offline'));