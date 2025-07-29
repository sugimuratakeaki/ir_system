/**
 * KAGAMI CMS 2.0 - Core Application
 * 世界一のWebエンジニアが設計したコアアプリケーション
 */

// グローバル名前空間
window.KAGAMI = window.KAGAMI || {};

// アプリケーション設定
KAGAMI.config = {
    version: '2.0.0',
    debug: true,
    api: {
        baseUrl: '/api',
        timeout: 30000,
        retryAttempts: 3
    },
    theme: {
        default: 'light',
        storageKey: 'kagami-theme'
    },
    sidebar: {
        storageKey: 'kagami-sidebar-state'
    },
    notifications: {
        duration: 5000,
        position: 'top-right'
    }
};

// アプリケーション初期化
KAGAMI.init = function() {
    console.log('🔮 KAGAMI CMS 2.0 初期化中...');
    
    // イベントリスナーの設定
    this.setupEventListeners();
    
    // テーマの初期化
    this.initTheme();
    
    // サイドバーの初期化
    this.initSidebar();
    
    // ヘッダーの初期化
    this.initHeader();
    
    // グローバルショートカットの設定
    this.setupKeyboardShortcuts();
    
    // ページ固有の初期化
    this.initPageSpecific();
    
    console.log('✅ KAGAMI CMS 2.0 初期化完了');
};

// イベントリスナーの設定
KAGAMI.setupEventListeners = function() {
    // ページ読み込み完了時
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
    } else {
        this.onDOMReady();
    }
    
    // ウィンドウサイズ変更時
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => this.onWindowResize(), 250);
    });
    
    // スクロール時
    let scrollTimer;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => this.onWindowScroll(), 100);
    }, { passive: true });
};

// DOM準備完了時の処理
KAGAMI.onDOMReady = function() {
    // フォームの自動保存
    this.setupAutoSave();
    
    // ツールチップの初期化
    this.initTooltips();
    
    // モーダルの初期化
    this.initModals();
    
    // 遅延読み込みの設定
    this.setupLazyLoading();
};

// ウィンドウリサイズ時の処理
KAGAMI.onWindowResize = function() {
    const isMobile = window.innerWidth < 768;
    document.body.classList.toggle('is-mobile', isMobile);
    
    // モバイルの場合はサイドバーを閉じる
    if (isMobile && KAGAMI.sidebar && !KAGAMI.sidebar.isCollapsed()) {
        KAGAMI.sidebar.close();
    }
};

// スクロール時の処理
KAGAMI.onWindowScroll = function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const header = document.getElementById('header');
    
    if (header) {
        header.classList.toggle('scrolled', scrollTop > 10);
    }
};

// テーマの初期化
KAGAMI.initTheme = function() {
    const savedTheme = localStorage.getItem(this.config.theme.storageKey) || this.config.theme.default;
    this.setTheme(savedTheme);
    
    // テーマ切り替えボタンのイベント
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
        });
    }
};

// テーマの設定
KAGAMI.setTheme = function(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.config.theme.storageKey, theme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.classList.toggle('dark', theme === 'dark');
    }
    
    // テーマ変更イベントを発火
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
};

// サイドバーの初期化
KAGAMI.initSidebar = function() {
    // sidebar.jsで詳細実装
    if (typeof KAGAMI.sidebar !== 'undefined' && KAGAMI.sidebar.init) {
        KAGAMI.sidebar.init();
    }
};

// ヘッダーの初期化
KAGAMI.initHeader = function() {
    // ユーザーメニューの初期化
    const userMenuButton = document.getElementById('userMenuButton');
    const userMenu = document.getElementById('userMenu');
    
    if (userMenuButton && userMenu) {
        userMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('open');
        });
        
        // 外側クリックで閉じる
        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target)) {
                userMenu.classList.remove('open');
            }
        });
    }
    
    // モバイルメニューボタン
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            if (KAGAMI.sidebar) {
                KAGAMI.sidebar.toggle();
            }
        });
    }
};

// キーボードショートカットの設定
KAGAMI.setupKeyboardShortcuts = function() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K で検索
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('globalSearch');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Ctrl/Cmd + \ でサイドバー切り替え
        if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
            e.preventDefault();
            if (KAGAMI.sidebar) {
                KAGAMI.sidebar.toggle();
            }
        }
        
        // Escape でモーダルやドロップダウンを閉じる
        if (e.key === 'Escape') {
            // ユーザーメニューを閉じる
            const userMenu = document.getElementById('userMenu');
            if (userMenu) {
                userMenu.classList.remove('open');
            }
            
            // モーダルを閉じる
            if (KAGAMI.modal) {
                KAGAMI.modal.closeAll();
            }
        }
    });
};

// フォームの自動保存設定
KAGAMI.setupAutoSave = function() {
    const forms = document.querySelectorAll('form[data-autosave]');
    
    forms.forEach(form => {
        const formId = form.getAttribute('data-autosave');
        const inputs = form.querySelectorAll('input, textarea, select');
        
        // 保存されたデータの復元
        const savedData = localStorage.getItem(`autosave-${formId}`);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                Object.keys(data).forEach(name => {
                    const input = form.querySelector(`[name="${name}"]`);
                    if (input) {
                        input.value = data[name];
                    }
                });
            } catch (e) {
                console.error('自動保存データの復元に失敗しました:', e);
            }
        }
        
        // 入力時の自動保存
        let saveTimer;
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(saveTimer);
                saveTimer = setTimeout(() => {
                    const data = {};
                    inputs.forEach(inp => {
                        if (inp.name) {
                            data[inp.name] = inp.value;
                        }
                    });
                    localStorage.setItem(`autosave-${formId}`, JSON.stringify(data));
                    
                    // 保存通知
                    if (KAGAMI.notification) {
                        KAGAMI.notification.show('下書きを保存しました', 'success', 2000);
                    }
                }, 1000);
            });
        });
        
        // フォーム送信時に自動保存データをクリア
        form.addEventListener('submit', () => {
            localStorage.removeItem(`autosave-${formId}`);
        });
    });
};

// ツールチップの初期化
KAGAMI.initTooltips = function() {
    // CSSのみで実装されているため、特別な初期化は不要
    // 必要に応じて拡張可能
};

// モーダルの初期化
KAGAMI.initModals = function() {
    // modals.jsで詳細実装
    if (typeof KAGAMI.modal !== 'undefined' && KAGAMI.modal.init) {
        KAGAMI.modal.init();
    }
};

// 遅延読み込みの設定
KAGAMI.setupLazyLoading = function() {
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-lazy]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.lazy;
                    img.removeAttribute('data-lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
};

// ページ固有の初期化
KAGAMI.initPageSpecific = function() {
    const pageInit = document.body.getAttribute('data-page-init');
    if (pageInit && typeof window[pageInit] === 'function') {
        window[pageInit]();
    }
};

// APIヘルパー関数
KAGAMI.api = {
    // GETリクエスト
    get: async function(endpoint, params = {}) {
        const url = new URL(KAGAMI.config.api.baseUrl + endpoint, window.location.origin);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        
        return this.request(url, {
            method: 'GET'
        });
    },
    
    // POSTリクエスト
    post: async function(endpoint, data = {}) {
        return this.request(KAGAMI.config.api.baseUrl + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    },
    
    // PUTリクエスト
    put: async function(endpoint, data = {}) {
        return this.request(KAGAMI.config.api.baseUrl + endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    },
    
    // DELETEリクエスト
    delete: async function(endpoint) {
        return this.request(KAGAMI.config.api.baseUrl + endpoint, {
            method: 'DELETE'
        });
    },
    
    // 基本的なリクエスト処理
    request: async function(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), KAGAMI.config.api.timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                credentials: 'same-origin'
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('リクエストがタイムアウトしました');
            }
            throw error;
        }
    }
};

// アプリケーション起動
KAGAMI.init();
