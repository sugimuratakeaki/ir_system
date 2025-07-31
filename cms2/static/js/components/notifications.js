/**
 * KAGAMI CMS 2.0 - 通知管理システム
 * 通知の表示、管理、履歴保存を統合的に処理
 */

class NotificationManager {
    constructor() {
        this.container = document.getElementById('notificationContainer') || this.createContainer();
        this.notifications = new Map();
        this.history = [];
        this.maxNotifications = 5;
        this.defaultDuration = 5000;
        this.init();
    }

    init() {
        // 通知音の準備（オプション）
        this.notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCAFmtn0wnkwBw9UqOHwvmw/');
        
        // グローバル関数として登録
        window.NotificationManager = this;
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);
        return container;
    }

    /**
     * 通知を表示
     * @param {string} type - success, info, warning, error
     * @param {string} title - 通知のタイトル
     * @param {string} message - 通知のメッセージ
     * @param {Object} options - 追加オプション
     */
    show(type, title, message, options = {}) {
        const id = this.generateId();
        const notification = this.createNotification(id, type, title, message, options);
        
        // 最大表示数を超えたら古い通知を削除
        if (this.notifications.size >= this.maxNotifications) {
            const firstId = this.notifications.keys().next().value;
            this.remove(firstId);
        }
        
        this.container.appendChild(notification);
        this.notifications.set(id, notification);
        
        // アニメーション開始
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // 自動削除タイマー
        if (options.duration !== 0) {
            setTimeout(() => this.remove(id), options.duration || this.defaultDuration);
        }
        
        // 履歴に追加
        this.addToHistory(type, title, message);
        
        // 音を再生（オプション）
        if (options.sound !== false && (type === 'error' || type === 'warning')) {
            this.playSound();
        }
        
        return id;
    }

    createNotification(id, type, title, message, options) {
        const template = document.getElementById('notificationTemplate');
        const notification = template ? template.content.cloneNode(true).firstElementChild : this.createNotificationElement();
        
        notification.setAttribute('data-id', id);
        notification.setAttribute('data-type', type);
        notification.className = `notification-toast notification-${type}`;
        
        // アイコン設定
        const iconContainer = notification.querySelector('.notification-toast-icon');
        iconContainer.innerHTML = this.getIcon(type);
        
        // コンテンツ設定
        notification.querySelector('.notification-toast-title').textContent = title;
        notification.querySelector('.notification-toast-message').textContent = message;
        
        // アクション設定
        if (options.actions) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'notification-toast-actions';
            options.actions.forEach(action => {
                const button = document.createElement('button');
                button.className = 'notification-action-btn';
                button.textContent = action.label;
                button.onclick = () => {
                    action.callback();
                    if (action.closeOnClick !== false) {
                        this.remove(id);
                    }
                };
                actionsContainer.appendChild(button);
            });
            notification.querySelector('.notification-toast-body').appendChild(actionsContainer);
        }
        
        // 閉じるボタン
        const closeBtn = notification.querySelector('.notification-toast-close');
        closeBtn.onclick = () => this.remove(id);
        
        // プログレスバー
        if (options.showProgress !== false && options.duration !== 0) {
            const progressBar = notification.querySelector('.notification-toast-progress-bar');
            if (progressBar) {
                progressBar.style.animationDuration = `${options.duration || this.defaultDuration}ms`;
            }
        }
        
        return notification;
    }

    createNotificationElement() {
        const notification = document.createElement('div');
        notification.className = 'notification-toast';
        notification.innerHTML = `
            <div class="notification-toast-content">
                <div class="notification-toast-icon"></div>
                <div class="notification-toast-body">
                    <h4 class="notification-toast-title"></h4>
                    <p class="notification-toast-message"></p>
                </div>
                <button class="notification-toast-close">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <div class="notification-toast-progress">
                <div class="notification-toast-progress-bar"></div>
            </div>
        `;
        return notification;
    }

    getIcon(type) {
        const icons = {
            success: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>`,
            info: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>`,
            warning: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>`,
            error: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>`
        };
        return icons[type] || icons.info;
    }

    remove(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        setTimeout(() => {
            notification.remove();
            this.notifications.delete(id);
        }, 300);
    }

    removeAll() {
        this.notifications.forEach((_, id) => this.remove(id));
    }

    generateId() {
        return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    addToHistory(type, title, message) {
        this.history.push({
            type,
            title,
            message,
            timestamp: new Date().toISOString()
        });
        
        // 最大100件まで保持
        if (this.history.length > 100) {
            this.history.shift();
        }
    }

    playSound() {
        try {
            this.notificationSound.play().catch(() => {
                // 音声再生エラーは無視
            });
        } catch (e) {
            // エラーを無視
        }
    }

    // 便利なメソッド
    success(title, message, options) {
        return this.show('success', title, message, options);
    }

    info(title, message, options) {
        return this.show('info', title, message, options);
    }

    warning(title, message, options) {
        return this.show('warning', title, message, options);
    }

    error(title, message, options) {
        return this.show('error', title, message, options);
    }
}

// シングルトンインスタンスを作成
const notificationManager = new NotificationManager();

// グローバル関数として公開
window.showNotification = (type, title, message, options) => {
    return notificationManager.show(type, title, message, options);
};

window.showSuccess = (title, message, options) => {
    return notificationManager.success(title, message, options);
};

window.showError = (title, message, options) => {
    return notificationManager.error(title, message, options);
};

window.showWarning = (title, message, options) => {
    return notificationManager.warning(title, message, options);
};

window.showInfo = (title, message, options) => {
    return notificationManager.info(title, message, options);
};