/**
 * KAGAMI CMS 2.0 - Core Application
 * アプリケーション全体の初期化と管理
 */

class KagamiApp {
    constructor() {
        this.version = '2.0.0';
        this.debug = false;
        this.config = {
            apiBaseUrl: '/api',
            refreshInterval: 30000,
            theme: 'light',
            locale: 'ja-JP'
        };
        this.modules = new Map();
        this.init();
    }

    async init() {
        try {
            // 基本設定の読み込み
            await this.loadConfig();
            
            // テーマの初期化
            this.initTheme();
            
            // グローバルイベントの設定
            this.setupGlobalEvents();
            
            // セキュリティ設定
            this.setupSecurity();
            
            // 各モジュールの初期化
            await this.initModules();
            
            // ショートカットキーの設定
            this.setupKeyboardShortcuts();
            
            // WebSocketの初期化（リアルタイム通信用）
            // this.initWebSocket();
            
            console.log(`KAGAMI CMS ${this.version} initialized`);
            
        } catch (error) {
            console.error('Application initialization error:', error);
            this.handleInitError(error);
        }
    }

    async loadConfig() {
        // ローカルストレージから設定を読み込み
        const savedConfig = localStorage.getItem('kagami_config');
        if (savedConfig) {
            Object.assign(this.config, JSON.parse(savedConfig));
        }
    }

    saveConfig() {
        localStorage.setItem('kagami_config', JSON.stringify(this.config));
    }

    initTheme() {
        const savedTheme = localStorage.getItem('kagami_theme') || this.config.theme;
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.config.theme = theme;
        localStorage.setItem('kagami_theme', theme);
        
        // テーマ切り替えボタンの更新
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const lightIcon = themeToggle.querySelector('.theme-icon-light');
            const darkIcon = themeToggle.querySelector('.theme-icon-dark');
            
            if (theme === 'dark') {
                lightIcon.style.display = 'none';
                darkIcon.style.display = 'block';
            } else {
                lightIcon.style.display = 'block';
                darkIcon.style.display = 'none';
            }
        }
    }

    setupGlobalEvents() {
        // テーマ切り替え
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const newTheme = this.config.theme === 'light' ? 'dark' : 'light';
                this.setTheme(newTheme);
            });
        }

        // グローバル検索
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', debounce((e) => {
                this.performGlobalSearch(e.target.value);
            }, 300));
        }

        // ネットワークステータス監視
        window.addEventListener('online', () => {
            showSuccess('接続回復', 'インターネット接続が回復しました');
        });

        window.addEventListener('offline', () => {
            showError('接続エラー', 'インターネット接続が失われました');
        });

        // ページ離脱前の確認
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
            }
        });

        // エラーハンドリング
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            if (this.debug) {
                showError('エラー', 'システムエラーが発生しました');
            }
        });
    }

    setupSecurity() {
        // CSRF対策
        const token = document.querySelector('meta[name="csrf-token"]');
        if (token) {
            axios.defaults.headers.common['X-CSRF-Token'] = token.content;
        }

        // XSS対策: 動的に追加されるコンテンツのサニタイズ
        this.sanitizeHTML = (html) => {
            const temp = document.createElement('div');
            temp.textContent = html;
            return temp.innerHTML;
        };
    }

    async initModules() {
        // ページ固有のモジュールを初期化
        const pageModule = document.body.dataset.page;
        if (pageModule) {
            try {
                const module = await this.loadModule(pageModule);
                if (module && module.init) {
                    await module.init();
                }
            } catch (error) {
                console.error(`Module initialization error: ${pageModule}`, error);
            }
        }
    }

    async loadModule(moduleName) {
        if (this.modules.has(moduleName)) {
            return this.modules.get(moduleName);
        }

        // 動的インポート（必要に応じて）
        // const module = await import(`./modules/${moduleName}.js`);
        // this.modules.set(moduleName, module);
        // return module;
    }

    setupKeyboardShortcuts() {
        const shortcuts = {
            'ctrl+k': () => document.getElementById('globalSearch')?.focus(),
            'ctrl+/': () => this.toggleHelp(),
            'ctrl+,': () => window.location.href = '/settings',
            'ctrl+shift+d': () => this.toggleDebugMode(),
            'esc': () => this.closeActiveModal()
        };

        document.addEventListener('keydown', (e) => {
            const key = this.getShortcutKey(e);
            if (shortcuts[key]) {
                e.preventDefault();
                shortcuts[key]();
            }
        });
    }

    getShortcutKey(e) {
        const keys = [];
        if (e.ctrlKey || e.metaKey) keys.push('ctrl');
        if (e.shiftKey) keys.push('shift');
        if (e.altKey) keys.push('alt');
        if (e.key) keys.push(e.key.toLowerCase());
        return keys.join('+');
    }

    async performGlobalSearch(query) {
        if (!query || query.length < 2) return;

        try {
            const response = await fetch(`${this.config.apiBaseUrl}/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            this.displaySearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    displaySearchResults(results) {
        // 検索結果の表示処理
        console.log('Search results:', results);
    }

    hasUnsavedChanges() {
        // フォームの変更チェック
        const forms = document.querySelectorAll('form[data-unsaved]');
        return forms.length > 0;
    }

    toggleDebugMode() {
        this.debug = !this.debug;
        console.log(`Debug mode: ${this.debug ? 'ON' : 'OFF'}`);
        if (this.debug) {
            document.body.classList.add('debug-mode');
        } else {
            document.body.classList.remove('debug-mode');
        }
    }

    toggleHelp() {
        // ヘルプパネルの表示/非表示
        console.log('Toggle help');
    }

    closeActiveModal() {
        // アクティブなモーダルを閉じる
        if (window.ModalManager && window.ModalManager.activeModals.length > 0) {
            const topModal = window.ModalManager.activeModals[window.ModalManager.activeModals.length - 1];
            window.ModalManager.close(topModal.id);
        }
    }

    handleInitError(error) {
        // 初期化エラーの処理
        const errorContainer = document.createElement('div');
        errorContainer.className = 'init-error';
        errorContainer.innerHTML = `
            <div class="error-content">
                <h2>システムエラー</h2>
                <p>アプリケーションの初期化中にエラーが発生しました。</p>
                <p class="error-detail">${error.message}</p>
                <button onclick="location.reload()" class="btn btn-primary">再読み込み</button>
            </div>
        `;
        document.body.appendChild(errorContainer);
    }

    // API通信のラッパー
    async api(endpoint, options = {}) {
        const url = `${this.config.apiBaseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'same-origin'
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // ユーティリティメソッド
    formatDate(date, format = 'YYYY-MM-DD') {
        // 日付フォーマット処理
        return new Date(date).toLocaleDateString(this.config.locale);
    }

    formatNumber(num) {
        // 数値フォーマット処理
        return new Intl.NumberFormat(this.config.locale).format(num);
    }

    formatCurrency(amount, currency = 'JPY') {
        // 通貨フォーマット処理
        return new Intl.NumberFormat(this.config.locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
}

// グローバルユーティリティ関数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    window.KagamiApp = new KagamiApp();
});