/**
 * KAGAMI CMS 2.0 - Notification System
 * 洗練された通知システム
 */

// 通知システム名前空間
KAGAMI.notification = {
    container: null,
    queue: [],
    activeNotifications: [],
    maxNotifications: 5,
    
    // 初期化
    init: function() {
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            this.createContainer();
        }
    },
    
    // コンテナの作成
    createContainer: function() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    },
    
    /**
     * 通知を表示
     * @param {string} message - 通知メッセージ
     * @param {string} type - 通知タイプ (success, error, warning, info)
     * @param {number} duration - 表示時間（ミリ秒）
     * @param {Object} options - 追加オプション
     */
    show: function(message, type = 'info', duration = 5000, options = {}) {
        const notification = {
            id: KAGAMI.utils.generateUUID(),
            message: message,
            type: type,
            duration: duration,
            timestamp: new Date(),
            ...options
        };
        
        // キューに追加
        this.queue.push(notification);
        
        // 最大表示数を超えている場合は古いものを削除
        if (this.activeNotifications.length >= this.maxNotifications) {
            const oldest = this.activeNotifications.shift();
            this.remove(oldest.id);
        }
        
        // 通知を作成して表示
        this.create(notification);
        
        return notification.id;
    },
    
    // 通知要素の作成
    create: function(notification) {
        const element = document.createElement('div');
        element.id = `notification-${notification.id}`;
        element.className = `notification notification-${notification.type}`;
        element.setAttribute('role', 'alert');
        element.setAttribute('aria-live', 'polite');
        
        // アイコンの設定
        const icon = this.getIcon(notification.type);
        
        // 通知の構造
        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icon}</div>
                <div class="notification-body">
                    <div class="notification-message">${notification.message}</div>
                    ${notification.description ? `<div class="notification-description">${notification.description}</div>` : ''}
                </div>
                ${notification.actions ? this.createActions(notification.actions) : ''}
                <button class="notification-close" aria-label="閉じる">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            ${notification.progress ? '<div class="notification-progress"><div class="notification-progress-bar"></div></div>' : ''}
        `;
        
        // クローズボタンのイベント
        const closeBtn = element.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.remove(notification.id));
        
        // アクションボタンのイベント
        if (notification.actions) {
            notification.actions.forEach((action, index) => {
                const actionBtn = element.querySelector(`[data-action="${index}"]`);
                if (actionBtn) {
                    actionBtn.addEventListener('click', () => {
                        action.callback();
                        if (action.closeOnClick !== false) {
                            this.remove(notification.id);
                        }
                    });
                }
            });
        }
        
        // コンテナに追加
        this.container.appendChild(element);
        
        // アクティブリストに追加
        this.activeNotifications.push(notification);
        
        // アニメーション
        requestAnimationFrame(() => {
            element.classList.add('notification-show');
        });
        
        // 自動削除の設定
        if (notification.duration > 0) {
            notification.timeoutId = setTimeout(() => {
                this.remove(notification.id);
            }, notification.duration);
            
            // プログレスバーのアニメーション
            if (notification.progress) {
                const progressBar = element.querySelector('.notification-progress-bar');
                progressBar.style.transitionDuration = `${notification.duration}ms`;
                requestAnimationFrame(() => {
                    progressBar.style.width = '0%';
                });
            }
        }
        
        // イベント発火
        window.dispatchEvent(new CustomEvent('notificationShown', { detail: notification }));
    },
    
    // アイコンの取得
    getIcon: function(type) {
        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6667 5L7.5 14.1667L3.33334 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 10V6.66667M10 13.3333H10.0083M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.57465 3.21396L1.51632 15.4806C1.37079 15.7397 1.29379 16.0317 1.29253 16.329C1.29126 16.6263 1.36576 16.9189 1.50905 17.1791C1.65234 17.4394 1.85956 17.6589 2.11152 17.8163C2.36349 17.9738 2.65202 18.0641 2.94798 18.0786H17.0646C17.3606 18.0641 17.6491 17.9738 17.9011 17.8163C18.1531 17.6589 18.3603 17.4394 18.5036 17.1791C18.6469 16.9189 18.7214 16.6263 18.7201 16.329C18.7189 16.0317 18.6419 15.7397 18.4963 15.4806L11.438 3.21396C11.2781 2.97383 11.0598 2.77754 10.8027 2.64333C10.5456 2.50912 10.2578 2.44141 9.96632 2.44678C9.67479 2.45214 9.38852 2.53039 9.13289 2.6742C8.87727 2.81801 8.66038 3.02255 8.50131 3.26975L8.57465 3.21396Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 7.5V11.6667M10 15H10.0083" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 9.16667V13.3333M10 6.66667H10.0083M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        };
        return icons[type] || icons.info;
    },
    
    // アクションボタンの作成
    createActions: function(actions) {
        const actionsHtml = actions.map((action, index) => `
            <button class="notification-action" data-action="${index}">${action.label}</button>
        `).join('');
        return `<div class="notification-actions">${actionsHtml}</div>`;
    },
    
    // 通知の削除
    remove: function(id) {
        const element = document.getElementById(`notification-${id}`);
        if (!element) return;
        
        // アニメーション
        element.classList.add('notification-hide');
        
        // アクティブリストから削除
        const index = this.activeNotifications.findIndex(n => n.id === id);
        if (index > -1) {
            const notification = this.activeNotifications[index];
            
            // タイムアウトのクリア
            if (notification.timeoutId) {
                clearTimeout(notification.timeoutId);
            }
            
            this.activeNotifications.splice(index, 1);
        }
        
        // DOM要素の削除
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);
        
        // イベント発火
        window.dispatchEvent(new CustomEvent('notificationRemoved', { detail: { id } }));
    },
    
    // すべての通知をクリア
    clearAll: function() {
        this.activeNotifications.forEach(notification => {
            this.remove(notification.id);
        });
    },
    
    // 成功通知
    success: function(message, options = {}) {
        return this.show(message, 'success', options.duration || 3000, options);
    },
    
    // エラー通知
    error: function(message, options = {}) {
        return this.show(message, 'error', options.duration || 0, options);
    },
    
    // 警告通知
    warning: function(message, options = {}) {
        return this.show(message, 'warning', options.duration || 5000, options);
    },
    
    // 情報通知
    info: function(message, options = {}) {
        return this.show(message, 'info', options.duration || 5000, options);
    },
    
    // 確認通知
    confirm: function(message, onConfirm, onCancel) {
        return this.show(message, 'warning', 0, {
            actions: [
                {
                    label: '確認',
                    callback: onConfirm,
                    closeOnClick: true
                },
                {
                    label: 'キャンセル',
                    callback: onCancel || (() => {}),
                    closeOnClick: true
                }
            ]
        });
    },
    
    // プログレス通知
    progress: function(message, options = {}) {
        return this.show(message, 'info', 0, {
            ...options,
            progress: true
        });
    },
    
    // プログレスの更新
    updateProgress: function(id, progress, message) {
        const element = document.getElementById(`notification-${id}`);
        if (!element) return;
        
        const progressBar = element.querySelector('.notification-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${100 - progress}%`;
        }
        
        if (message) {
            const messageElement = element.querySelector('.notification-message');
            if (messageElement) {
                messageElement.textContent = message;
            }
        }
    }
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    KAGAMI.notification.init();
});
