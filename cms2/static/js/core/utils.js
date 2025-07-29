/**
 * KAGAMI CMS 2.0 - Utility Functions
 * 共通ユーティリティ関数群
 */

// デバウンス関数
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

// スロットル関数
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

// 日付フォーマット
function formatDate(date, format = 'YYYY/MM/DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes);
}

// 相対時間表示
function getRelativeTime(date) {
    const now = new Date();
    const target = new Date(date);
    const diff = now - target;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 7) {
        return formatDate(date);
    } else if (days > 0) {
        return `${days}日前`;
    } else if (hours > 0) {
        return `${hours}時間前`;
    } else if (minutes > 0) {
        return `${minutes}分前`;
    } else {
        return 'たった今';
    }
}

// クエリパラメータ取得
function getQueryParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams) {
        params[key] = value;
    }
    return params;
}

// クッキー操作
const Cookie = {
    set(name, value, days = 7) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    },
    
    get(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    
    delete(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
};

// ローカルストレージのラッパー
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage.set error:', e);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage.get error:', e);
            return defaultValue;
        }
    },
    
    remove(key) {
        localStorage.removeItem(key);
    },
    
    clear() {
        localStorage.clear();
    }
};

// 数値フォーマット
function formatNumber(num, decimals = 0) {
    return new Intl.NumberFormat('ja-JP', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

// ファイルサイズフォーマット
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// URLパラメータ更新
function updateURLParams(params) {
    const url = new URL(window.location);
    
    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, value);
        }
    });
    
    window.history.pushState({}, '', url);
}

// 要素の表示/非表示アニメーション
function fadeIn(element, duration = 300) {
    element.style.opacity = 0;
    element.style.display = 'block';
    
    const start = performance.now();
    
    const fade = (timestamp) => {
        const elapsed = timestamp - start;
        const progress = elapsed / duration;
        
        element.style.opacity = Math.min(progress, 1);
        
        if (progress < 1) {
            requestAnimationFrame(fade);
        }
    };
    
    requestAnimationFrame(fade);
}

function fadeOut(element, duration = 300) {
    const start = performance.now();
    const initialOpacity = parseFloat(element.style.opacity) || 1;
    
    const fade = (timestamp) => {
        const elapsed = timestamp - start;
        const progress = elapsed / duration;
        
        element.style.opacity = initialOpacity * (1 - progress);
        
        if (progress < 1) {
            requestAnimationFrame(fade);
        } else {
            element.style.display = 'none';
        }
    };
    
    requestAnimationFrame(fade);
}

// スムーズスクロール
function smoothScroll(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    
    if (element) {
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// コピー機能
function copyToClipboard(text) {
    if (navigator.clipboard) {
        return navigator.clipboard.writeText(text);
    }
    
    // フォールバック
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return Promise.resolve();
    } catch (err) {
        document.body.removeChild(textArea);
        return Promise.reject(err);
    }
}

// ランダムID生成
function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// オブジェクトのディープクローン
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Object) {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

// ==== 新規追加機能 ====

// 高度な検索機能
class AdvancedSearch {
    constructor(data, options = {}) {
        this.data = data;
        this.options = {
            fuzzy: true,
            threshold: 0.3,
            keys: [],
            ...options
        };
    }
    
    search(query) {
        if (!query) return this.data;
        
        const terms = query.toLowerCase().split(' ').filter(t => t.length > 0);
        
        return this.data.filter(item => {
            return terms.every(term => {
                return this.options.keys.some(key => {
                    const value = this.getNestedValue(item, key);
                    if (!value) return false;
                    
                    const valueStr = value.toString().toLowerCase();
                    
                    if (this.options.fuzzy) {
                        return this.fuzzyMatch(valueStr, term);
                    } else {
                        return valueStr.includes(term);
                    }
                });
            });
        });
    }
    
    fuzzyMatch(str, pattern) {
        const patternLength = pattern.length;
        const strLength = str.length;
        
        if (patternLength > strLength) return false;
        if (patternLength === strLength) return pattern === str;
        
        let patternIdx = 0;
        let strIdx = 0;
        
        while (patternIdx < patternLength && strIdx < strLength) {
            if (pattern[patternIdx] === str[strIdx]) {
                patternIdx++;
            }
            strIdx++;
        }
        
        return patternIdx === patternLength;
    }
    
    getNestedValue(obj, path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }
}

// キーボードショートカット管理
class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.enabled = true;
        this.init();
    }
    
    init() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return;
            
            const key = this.getKey(e);
            const handler = this.shortcuts.get(key);
            
            if (handler && this.shouldHandle(e)) {
                e.preventDefault();
                handler(e);
            }
        });
    }
    
    getKey(e) {
        const parts = [];
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        parts.push(e.key.toLowerCase());
        return parts.join('+');
    }
    
    shouldHandle(e) {
        const tagName = e.target.tagName.toLowerCase();
        const isInput = ['input', 'textarea', 'select'].includes(tagName);
        const isEditable = e.target.contentEditable === 'true';
        
        return !isInput && !isEditable;
    }
    
    register(shortcut, handler, description) {
        this.shortcuts.set(shortcut.toLowerCase(), handler);
        
        // ヘルプ用に説明も保存
        if (!this.descriptions) this.descriptions = {};
        this.descriptions[shortcut] = description;
    }
    
    unregister(shortcut) {
        this.shortcuts.delete(shortcut.toLowerCase());
        delete this.descriptions[shortcut];
    }
    
    disable() {
        this.enabled = false;
    }
    
    enable() {
        this.enabled = true;
    }
    
    getHelp() {
        return Object.entries(this.descriptions || {}).map(([key, desc]) => ({
            shortcut: key,
            description: desc
        }));
    }
}

// ドラッグ＆ドロップマネージャー
class DragDropManager {
    constructor(options = {}) {
        this.options = {
            dragClass: 'dragging',
            overClass: 'drag-over',
            handleClass: 'drag-handle',
            ...options
        };
        this.draggedElement = null;
    }
    
    enable(container, itemSelector) {
        const items = container.querySelectorAll(itemSelector);
        
        items.forEach(item => {
            const handle = item.querySelector(`.${this.options.handleClass}`) || item;
            
            handle.draggable = true;
            
            handle.addEventListener('dragstart', (e) => {
                this.draggedElement = item;
                item.classList.add(this.options.dragClass);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.innerHTML);
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove(this.options.dragClass);
            });
            
            item.addEventListener('dragover', (e) => {
                if (e.preventDefault) e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                const afterElement = this.getDragAfterElement(container, e.clientY);
                if (afterElement == null) {
                    container.appendChild(this.draggedElement);
                } else {
                    container.insertBefore(this.draggedElement, afterElement);
                }
                
                return false;
            });
            
            item.addEventListener('dragenter', () => {
                item.classList.add(this.options.overClass);
            });
            
            item.addEventListener('dragleave', () => {
                item.classList.remove(this.options.overClass);
            });
        });
    }
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll(`:not(.${this.options.dragClass})`)]
            .filter(el => el.draggable);
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}

// WebSocket接続管理
class WebSocketManager {
    constructor(url, options = {}) {
        this.url = url;
        this.options = {
            reconnect: true,
            reconnectInterval: 5000,
            maxReconnectAttempts: 5,
            ...options
        };
        this.ws = null;
        this.reconnectAttempts = 0;
        this.handlers = new Map();
    }
    
    connect() {
        try {
            this.ws = new WebSocket(this.url);
            
            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.reconnectAttempts = 0;
                this.emit('open');
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.emit('message', data);
                    
                    if (data.type) {
                        this.emit(data.type, data);
                    }
                } catch (e) {
                    console.error('WebSocket message parse error:', e);
                }
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.emit('close');
                
                if (this.options.reconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
                    setTimeout(() => {
                        this.reconnectAttempts++;
                        this.connect();
                    }, this.options.reconnectInterval);
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.emit('error', error);
            };
        } catch (e) {
            console.error('WebSocket connection error:', e);
        }
    }
    
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }
    
    on(event, handler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event).push(handler);
    }
    
    off(event, handler) {
        if (this.handlers.has(event)) {
            const handlers = this.handlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    
    emit(event, data) {
        if (this.handlers.has(event)) {
            this.handlers.get(event).forEach(handler => handler(data));
        }
    }
    
    disconnect() {
        this.options.reconnect = false;
        if (this.ws) {
            this.ws.close();
        }
    }
}

// インフィニットスクロール
class InfiniteScroll {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            threshold: 200,
            loadMore: null,
            ...options
        };
        this.loading = false;
        this.hasMore = true;
        this.init();
    }
    
    init() {
        this.handleScroll = throttle(() => {
            if (this.loading || !this.hasMore) return;
            
            const scrollTop = this.container.scrollTop;
            const scrollHeight = this.container.scrollHeight;
            const clientHeight = this.container.clientHeight;
            
            if (scrollHeight - scrollTop - clientHeight < this.options.threshold) {
                this.loadMore();
            }
        }, 200);
        
        this.container.addEventListener('scroll', this.handleScroll);
    }
    
    async loadMore() {
        if (!this.options.loadMore || this.loading) return;
        
        this.loading = true;
        
        try {
            const hasMore = await this.options.loadMore();
            this.hasMore = hasMore;
        } catch (e) {
            console.error('InfiniteScroll load error:', e);
        } finally {
            this.loading = false;
        }
    }
    
    reset() {
        this.hasMore = true;
        this.loading = false;
    }
    
    destroy() {
        this.container.removeEventListener('scroll', this.handleScroll);
    }
}

// パフォーマンス監視
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
    }
    
    mark(name) {
        performance.mark(name);
    }
    
    measure(name, startMark, endMark) {
        try {
            performance.measure(name, startMark, endMark);
            const measure = performance.getEntriesByName(name)[0];
            this.metrics[name] = measure.duration;
            return measure.duration;
        } catch (e) {
            console.error('Performance measure error:', e);
            return null;
        }
    }
    
    getMetrics() {
        return this.metrics;
    }
    
    logMetrics() {
        console.table(this.metrics);
    }
    
    clear() {
        performance.clearMarks();
        performance.clearMeasures();
        this.metrics = {};
    }
}

// ローディングオーバーレイ
function showLoading(message = '処理中...') {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    overlay.querySelector('.loading-message').textContent = message;
    overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// エクスポート
window.utils = {
    debounce,
    throttle,
    formatDate,
    getRelativeTime,
    getQueryParams,
    Cookie,
    Storage,
    formatNumber,
    formatFileSize,
    updateURLParams,
    fadeIn,
    fadeOut,
    smoothScroll,
    copyToClipboard,
    generateId,
    deepClone,
    showLoading,
    hideLoading,
    AdvancedSearch,
    KeyboardShortcuts,
    DragDropManager,
    WebSocketManager,
    InfiniteScroll,
    PerformanceMonitor
};

// KAGAMI名前空間との互換性も保持
if (typeof KAGAMI !== 'undefined') {
    KAGAMI.utils = window.utils;
}