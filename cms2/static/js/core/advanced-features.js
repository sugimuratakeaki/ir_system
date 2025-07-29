/**
 * KAGAMI CMS 2.0 - Advanced Features
 * 高度な機能の実装
 */

// キーボードショートカットの初期化
KAGAMI.initKeyboardShortcuts = function() {
    if (!window.utils || !window.utils.KeyboardShortcuts) return;
    
    const shortcuts = new window.utils.KeyboardShortcuts();
    
    // グローバル検索
    shortcuts.register('ctrl+k', () => {
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }, '検索ボックスにフォーカス');
    
    // サイドバートグル
    shortcuts.register('ctrl+b', () => {
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.click();
        }
    }, 'サイドバーの開閉');
    
    // 新規作成ショートカット
    shortcuts.register('ctrl+n', () => {
        // ページに応じて適切な新規作成アクションを実行
        const newButton = document.querySelector('[id$="NewBtn"], [id$="Button"][id*="new"], .btn-primary');
        if (newButton) {
            newButton.click();
        }
    }, '新規作成');
    
    // ヘルプ表示
    shortcuts.register('ctrl+shift+/', () => {
        showShortcutHelp(shortcuts);
    }, 'ショートカットヘルプ');
    
    // ナビゲーション
    shortcuts.register('ctrl+1', () => navigateToPage('/'), 'ダッシュボード');
    shortcuts.register('ctrl+2', () => navigateToPage('/documents'), 'ドキュメント');
    shortcuts.register('ctrl+3', () => navigateToPage('/meetings'), 'ミーティング');
    shortcuts.register('ctrl+4', () => navigateToPage('/faq'), 'FAQ');
    shortcuts.register('ctrl+5', () => navigateToPage('/investors'), '投資家管理');
    
    // 保存ショートカット
    shortcuts.register('ctrl+s', (e) => {
        e.preventDefault();
        const saveButton = document.querySelector('[type="submit"], .btn-save, .btn-primary');
        if (saveButton && !saveButton.disabled) {
            saveButton.click();
        }
    }, '保存');
    
    // リフレッシュ
    shortcuts.register('ctrl+r', (e) => {
        e.preventDefault();
        const refreshButton = document.querySelector('.btn-refresh, [id*="refresh"]');
        if (refreshButton) {
            refreshButton.click();
        } else {
            location.reload();
        }
    }, 'リフレッシュ');
    
    // グローバルに公開
    KAGAMI.shortcuts = shortcuts;
};

// ショートカットヘルプの表示
function showShortcutHelp(shortcuts) {
    const helpList = shortcuts.getHelp();
    const content = `
        <div class="shortcut-help">
            <style>
                .shortcut-help {
                    max-height: 60vh;
                    overflow-y: auto;
                }
                .shortcut-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .shortcut-table th {
                    background: var(--gray-50);
                    padding: var(--space-sm) var(--space-md);
                    text-align: left;
                    font-weight: var(--font-semibold);
                    border-bottom: 2px solid var(--gray-200);
                }
                .shortcut-table td {
                    padding: var(--space-sm) var(--space-md);
                    border-bottom: 1px solid var(--gray-100);
                }
                .shortcut-table kbd {
                    display: inline-block;
                    padding: 2px 6px;
                    font-family: var(--font-mono);
                    font-size: var(--text-sm);
                    background: var(--gray-100);
                    border: 1px solid var(--gray-300);
                    border-radius: var(--border-radius-sm);
                    box-shadow: 0 1px 0 var(--gray-400);
                }
            </style>
            <table class="shortcut-table">
                <thead>
                    <tr>
                        <th>ショートカット</th>
                        <th>説明</th>
                    </tr>
                </thead>
                <tbody>
                    ${helpList.map(item => `
                        <tr>
                            <td><kbd>${item.shortcut.toUpperCase().replace(/\+/g, ' + ')}</kbd></td>
                            <td>${item.description}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    if (window.showModal) {
        showModal({
            title: 'キーボードショートカット',
            content: content,
            size: 'medium'
        });
    }
}

// ページナビゲーション
function navigateToPage(path) {
    window.location.href = path;
}

// グローバル検索の拡張
KAGAMI.initAdvancedSearch = function() {
    const globalSearch = document.getElementById('globalSearch');
    if (!globalSearch) return;
    
    let searchTimeout;
    let currentSearch = null;
    
    // 検索サジェストコンテナの作成
    const suggestContainer = document.createElement('div');
    suggestContainer.className = 'search-suggestions';
    suggestContainer.style.display = 'none';
    globalSearch.parentNode.appendChild(suggestContainer);
    
    // 検索入力時の処理
    globalSearch.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            hideSuggestions();
            return;
        }
        
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });
    
    // フォーカス時の処理
    globalSearch.addEventListener('focus', function() {
        this.select();
        if (this.value.trim().length >= 2) {
            suggestContainer.style.display = 'block';
        }
    });
    
    // フォーカスが外れた時の処理
    globalSearch.addEventListener('blur', function() {
        setTimeout(() => {
            hideSuggestions();
        }, 200);
    });
    
    // Enterキーで検索実行
    globalSearch.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = e.target.value.trim();
            if (query) {
                executeFullSearch(query);
            }
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            navigateSuggestions(e.key === 'ArrowDown' ? 1 : -1);
        }
    });
    
    // 検索実行
    async function performSearch(query) {
        // モックデータで検索（実際はAPIコール）
        const mockResults = [
            { type: 'document', title: '2024年第3四半期決算説明資料', path: '/documents/123' },
            { type: 'meeting', title: '野村アセットマネジメント様 Q3決算説明', path: '/meetings/456' },
            { type: 'faq', title: 'Q3の業績について', path: '/faq/789' },
            { type: 'investor', title: '野村アセットマネジメント', path: '/investors/101' }
        ].filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase())
        );
        
        displaySuggestions(mockResults, query);
    }
    
    // サジェスト表示
    function displaySuggestions(results, query) {
        if (results.length === 0) {
            suggestContainer.innerHTML = `
                <div class="search-no-results">
                    「${escapeHtml(query)}」に一致する結果が見つかりませんでした
                </div>
            `;
        } else {
            suggestContainer.innerHTML = results.map((result, index) => `
                <a href="${result.path}" class="search-suggestion-item" data-index="${index}">
                    <span class="suggestion-icon">${getTypeIcon(result.type)}</span>
                    <div class="suggestion-content">
                        <div class="suggestion-title">${highlightMatch(result.title, query)}</div>
                        <div class="suggestion-type">${getTypeName(result.type)}</div>
                    </div>
                </a>
            `).join('');
            
            // 全て見るリンク
            suggestContainer.innerHTML += `
                <a href="/search?q=${encodeURIComponent(query)}" class="search-all-results">
                    すべての検索結果を見る →
                </a>
            `;
        }
        
        suggestContainer.style.display = 'block';
    }
    
    // サジェストを隠す
    function hideSuggestions() {
        suggestContainer.style.display = 'none';
    }
    
    // サジェスト内のナビゲーション
    function navigateSuggestions(direction) {
        const items = suggestContainer.querySelectorAll('.search-suggestion-item');
        if (items.length === 0) return;
        
        const current = suggestContainer.querySelector('.search-suggestion-item.active');
        let newIndex = 0;
        
        if (current) {
            const currentIndex = parseInt(current.dataset.index);
            newIndex = currentIndex + direction;
            current.classList.remove('active');
        }
        
        if (newIndex < 0) newIndex = items.length - 1;
        if (newIndex >= items.length) newIndex = 0;
        
        items[newIndex].classList.add('active');
    }
    
    // 完全な検索実行
    function executeFullSearch(query) {
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
    
    // ユーティリティ関数
    function getTypeIcon(type) {
        const icons = {
            document: '📄',
            meeting: '🤝',
            faq: '❓',
            investor: '👥'
        };
        return icons[type] || '📍';
    }
    
    function getTypeName(type) {
        const names = {
            document: 'ドキュメント',
            meeting: 'ミーティング',
            faq: 'FAQ',
            investor: '投資家'
        };
        return names[type] || type;
    }
    
    function highlightMatch(text, query) {
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};

// リアルタイム通知システム
KAGAMI.initRealtimeNotifications = function() {
    // WebSocket接続の初期化（実際の実装では適切なWebSocketサーバーが必要）
    const wsUrl = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws/notifications`;
    
    // WebSocketManagerを使用
    if (window.utils && window.utils.WebSocketManager) {
        const ws = new window.utils.WebSocketManager(wsUrl, {
            reconnect: true,
            reconnectInterval: 5000
        });
        
        ws.on('open', () => {
            console.log('通知WebSocket接続確立');
        });
        
        ws.on('notification', (data) => {
            showNotification(data.message, data.type, data.duration);
        });
        
        ws.on('error', (error) => {
            console.error('WebSocketエラー:', error);
        });
        
        // 接続開始
        // ws.connect(); // 実際のWebSocketサーバーがある場合に有効化
        
        KAGAMI.notificationWS = ws;
    }
};

// アクセシビリティ機能の強化
KAGAMI.initAccessibility = function() {
    // スキップリンクの追加
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'メインコンテンツへスキップ';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // フォーカス可視化の強化
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // ARIAライブリージョンの設定
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);
    
    // 通知関数の拡張
    const originalShowNotification = window.showNotification;
    window.showNotification = function(message, type, duration) {
        // 元の通知関数を呼び出し
        if (originalShowNotification) {
            originalShowNotification(message, type, duration);
        }
        
        // スクリーンリーダー用の通知
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = `${type === 'error' ? 'エラー: ' : ''}${message}`;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 5000);
        }
    };
};

// 初期化処理の追加
document.addEventListener('DOMContentLoaded', function() {
    // キーボードショートカットの初期化
    KAGAMI.initKeyboardShortcuts();
    
    // 高度な検索機能の初期化
    KAGAMI.initAdvancedSearch();
    
    // リアルタイム通知の初期化
    KAGAMI.initRealtimeNotifications();
    
    // アクセシビリティ機能の初期化
    KAGAMI.initAccessibility();
});

// スタイルの追加
const style = document.createElement('style');
style.textContent = `
/* スキップリンク */
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--kagami-blue);
    color: white;
    padding: var(--space-sm) var(--space-md);
    text-decoration: none;
    border-radius: 0 0 var(--border-radius-md) 0;
    z-index: 1000;
    transition: top var(--transition-fast);
}

.skip-link:focus {
    top: 0;
}

/* キーボードナビゲーション時のフォーカススタイル */
.keyboard-navigation *:focus {
    outline: 3px solid var(--accent-teal);
    outline-offset: 2px;
}

/* 検索サジェスト */
.search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid var(--gray-200);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-lg);
    margin-top: var(--space-xs);
    max-height: 400px;
    overflow-y: auto;
    z-index: 100;
}

.search-suggestion-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    text-decoration: none;
    color: var(--gray-900);
    transition: background var(--transition-fast);
}

.search-suggestion-item:hover,
.search-suggestion-item.active {
    background: var(--gray-50);
}

.suggestion-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
}

.suggestion-content {
    flex: 1;
    min-width: 0;
}

.suggestion-title {
    font-weight: var(--font-medium);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.suggestion-title mark {
    background: rgba(20, 184, 166, 0.2);
    color: inherit;
    font-weight: var(--font-semibold);
}

.suggestion-type {
    font-size: var(--text-sm);
    color: var(--gray-600);
}

.search-all-results {
    display: block;
    padding: var(--space-sm) var(--space-md);
    text-align: center;
    color: var(--info);
    text-decoration: none;
    border-top: 1px solid var(--gray-200);
    background: var(--gray-50);
}

.search-all-results:hover {
    background: var(--gray-100);
}

.search-no-results {
    padding: var(--space-lg);
    text-align: center;
    color: var(--gray-600);
}

/* スクリーンリーダー専用 */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
`;
document.head.appendChild(style);