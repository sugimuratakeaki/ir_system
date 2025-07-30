// ====================
// フロントサイト共通JavaScript
// ====================

// グローバル変数
let aiChatOpen = false;
let chatHistory = [];

// ページ読み込み完了時の処理
document.addEventListener('DOMContentLoaded', function() {
    initializeCommon();
    initializeSearch();
    initializeAIAssistant();
});

// 共通初期化処理
function initializeCommon() {
    // スムーススクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 外部リンクの処理
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (!link.href.includes(window.location.hostname)) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

// 検索機能の初期化
function initializeSearch() {
    const searchInput = document.querySelector('header input[type="text"]');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length > 2) {
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        }
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = e.target.value.trim();
            if (query) {
                window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }
        }
    });
}

// 検索実行
async function performSearch(query) {
    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        displaySearchSuggestions(data.results);
    } catch (error) {
        console.error('検索エラー:', error);
    }
}

// 検索候補表示
function displaySearchSuggestions(results) {
    // 既存の候補を削除
    const existingSuggestions = document.querySelector('.search-suggestions');
    if (existingSuggestions) {
        existingSuggestions.remove();
    }
    
    if (results.length === 0) return;
    
    // 候補リストを作成
    const searchInput = document.querySelector('header input[type="text"]');
    const suggestions = document.createElement('div');
    suggestions.className = 'search-suggestions absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50';
    
    results.slice(0, 5).forEach(result => {
        const item = document.createElement('a');
        item.href = result.url;
        item.className = 'block px-4 py-3 hover:bg-gray-50 border-b last:border-b-0';
        item.innerHTML = `
            <div class="font-medium">${result.title}</div>
            <div class="text-sm text-gray-600">${result.highlight}</div>
        `;
        suggestions.appendChild(item);
    });
    
    searchInput.parentElement.appendChild(suggestions);
    
    // 外側クリックで閉じる
    setTimeout(() => {
        document.addEventListener('click', function closeSearch(e) {
            if (!e.target.closest('.relative')) {
                suggestions.remove();
                document.removeEventListener('click', closeSearch);
            }
        });
    }, 100);
}

// AIアシスタントの初期化
function initializeAIAssistant() {
    // 初回メッセージ
    if (localStorage.getItem('aiWelcomeShown') !== 'true') {
        setTimeout(() => {
            showToast('AIアシスタントがご質問にお答えします', 'info', 5000);
            localStorage.setItem('aiWelcomeShown', 'true');
        }, 3000);
    }
}

// AIアシスタントの開閉
function toggleAIAssistant() {
    const panel = document.getElementById('ai-chat-panel');
    aiChatOpen = !aiChatOpen;
    
    if (aiChatOpen) {
        panel.classList.remove('hidden');
        document.getElementById('ai-message-input').focus();
        
        // 初回オープン時のメッセージ
        if (chatHistory.length === 0) {
            addAssistantMessage('こんにちは！IR情報について何でもお聞きください。決算、業績、事業戦略など、どんなご質問でもお答えします。');
        }
    } else {
        panel.classList.add('hidden');
    }
}

// AIメッセージ送信
async function sendAIMessage(event) {
    event.preventDefault();
    
    const input = document.getElementById('ai-message-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // ユーザーメッセージを追加
    addUserMessage(message);
    input.value = '';
    
    // タイピングインジケーターを表示
    showTypingIndicator();
    
    try {
        // APIにメッセージを送信
        const response = await fetch('/api/ai-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        
        // タイピングインジケーターを削除
        hideTypingIndicator();
        
        // アシスタントの返答を追加
        addAssistantMessage(data.response);
        
        // 提案を表示
        if (data.suggestions && data.suggestions.length > 0) {
            addSuggestions(data.suggestions);
        }
        
    } catch (error) {
        hideTypingIndicator();
        addAssistantMessage('申し訳ございません。一時的にエラーが発生しました。しばらくしてから再度お試しください。');
    }
}

// ユーザーメッセージ追加
function addUserMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message user';
    messageElement.innerHTML = `
        <div class="message-bubble">${escapeHtml(message)}</div>
        <div class="timestamp">${formatTime(new Date())}</div>
    `;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 履歴に追加
    chatHistory.push({ type: 'user', message: message, timestamp: new Date() });
}

// アシスタントメッセージ追加
function addAssistantMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message assistant';
    messageElement.innerHTML = `
        <div class="message-bubble">${message}</div>
        <div class="timestamp">${formatTime(new Date())}</div>
    `;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 履歴に追加
    chatHistory.push({ type: 'assistant', message: message, timestamp: new Date() });
}

// 提案ボタン追加
function addSuggestions(suggestions) {
    const chatMessages = document.getElementById('chat-messages');
    const suggestionsElement = document.createElement('div');
    suggestionsElement.className = 'suggestions flex flex-wrap gap-2 mb-4';
    
    suggestions.forEach(suggestion => {
        const button = document.createElement('button');
        button.className = 'bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm transition';
        button.textContent = suggestion.text;
        
        button.addEventListener('click', () => {
            if (suggestion.action === 'navigate') {
                window.location.href = suggestion.url;
            } else if (suggestion.action === 'search') {
                window.location.href = `/search?q=${encodeURIComponent(suggestion.query)}`;
            }
        });
        
        suggestionsElement.appendChild(button);
    });
    
    chatMessages.appendChild(suggestionsElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// タイピングインジケーター表示
function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'chat-message assistant';
    indicator.innerHTML = `
        <div class="message-bubble">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// タイピングインジケーター削除
function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// 時刻フォーマット
function formatTime(date) {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

// HTMLエスケープ
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// トースト通知表示
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // アニメーション後に削除
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

// ローディング表示
function showLoading(target) {
    const spinner = document.createElement('div');
    spinner.className = 'spinner mx-auto my-4';
    spinner.id = 'loading-spinner';
    
    if (typeof target === 'string') {
        document.querySelector(target).appendChild(spinner);
    } else {
        target.appendChild(spinner);
    }
}

// ローディング非表示
function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}

// 数値フォーマット
function formatNumber(num) {
    return new Intl.NumberFormat('ja-JP').format(num);
}

// 通貨フォーマット
function formatCurrency(num) {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY'
    }).format(num);
}

// 日付フォーマット
function formatDate(date) {
    return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

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

// スクロール位置の保存と復元
function saveScrollPosition(key) {
    sessionStorage.setItem(`scroll-${key}`, window.scrollY);
}

function restoreScrollPosition(key) {
    const position = sessionStorage.getItem(`scroll-${key}`);
    if (position) {
        window.scrollTo(0, parseInt(position));
        sessionStorage.removeItem(`scroll-${key}`);
    }
}

// エラーハンドリング
window.addEventListener('error', function(e) {
    console.error('エラーが発生しました:', e.error);
    // 本番環境では、エラーロギングサービスに送信
});

// グローバル関数の公開
window.toggleAIAssistant = toggleAIAssistant;
window.sendAIMessage = sendAIMessage;
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.formatNumber = formatNumber;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
