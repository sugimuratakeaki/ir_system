/**
 * KAGAMI CMS 2.0 - モーダル管理システム
 * モーダルの表示、管理、スタック処理を統合的に処理
 */

class ModalManager {
    constructor() {
        this.modals = new Map();
        this.activeModals = [];
        this.zIndexBase = 2000;
        this.init();
    }

    init() {
        // ESCキーでモーダルを閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModals.length > 0) {
                const topModal = this.activeModals[this.activeModals.length - 1];
                if (!topModal.preventClose) {
                    this.close(topModal.id);
                }
            }
        });
        
        // グローバル関数として登録
        window.ModalManager = this;
    }

    /**
     * モーダルを開く
     * @param {string} modalId - モーダルのID
     * @param {Object} options - オプション
     */
    open(modalId, options = {}) {
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            // 動的モーダルの場合
            modal = this.createModal(modalId, options);
        }
        
        // オプションを保存
        const modalData = {
            id: modalId,
            element: modal,
            options: options,
            preventClose: options.preventClose || false
        };
        
        this.modals.set(modalId, modalData);
        this.activeModals.push(modalData);
        
        // Z-indexを設定
        modal.style.zIndex = this.zIndexBase + (this.activeModals.length * 10);
        
        // 表示
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
        
        // フォーカス管理
        this.trapFocus(modal);
        
        // アニメーション
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
        
        // コールバック
        if (options.onOpen) {
            options.onOpen(modal);
        }
        
        return modal;
    }

    /**
     * モーダルを閉じる
     * @param {string} modalId - モーダルのID
     */
    close(modalId) {
        const modalData = this.modals.get(modalId);
        if (!modalData) return;
        
        const modal = modalData.element;
        
        // beforeCloseコールバック
        if (modalData.options.beforeClose) {
            const shouldClose = modalData.options.beforeClose(modal);
            if (shouldClose === false) return;
        }
        
        // アニメーション
        modal.classList.remove('show');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            
            // アクティブリストから削除
            const index = this.activeModals.findIndex(m => m.id === modalId);
            if (index > -1) {
                this.activeModals.splice(index, 1);
            }
            
            // body classを更新
            if (this.activeModals.length === 0) {
                document.body.classList.remove('modal-open');
            }
            
            // フォーカスを復元
            this.restoreFocus();
            
            // 動的モーダルの場合は削除
            if (modalData.options.dynamic) {
                modal.remove();
            }
            
            // マップから削除
            this.modals.delete(modalId);
            
            // コールバック
            if (modalData.options.onClose) {
                modalData.options.onClose();
            }
        }, 300);
    }

    /**
     * すべてのモーダルを閉じる
     */
    closeAll() {
        [...this.activeModals].reverse().forEach(modal => {
            this.close(modal.id);
        });
    }

    /**
     * 動的モーダルを作成
     */
    createModal(id, options) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = `modal-overlay ${options.class || ''}`;
        modal.innerHTML = `
            <div class="modal-container ${options.size || 'modal-md'}">
                ${options.showHeader !== false ? `
                <div class="modal-header">
                    <h3 class="modal-title">${options.title || ''}</h3>
                    ${options.showClose !== false ? `
                    <button class="modal-close" onclick="ModalManager.close('${id}')">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    ` : ''}
                </div>
                ` : ''}
                <div class="modal-body">
                    ${options.content || ''}
                </div>
                ${options.footer ? `
                <div class="modal-footer">
                    ${options.footer}
                </div>
                ` : ''}
            </div>
        `;
        
        // オーバーレイクリックで閉じる
        if (options.closeOnOverlay !== false) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close(id);
                }
            });
        }
        
        document.body.appendChild(modal);
        options.dynamic = true;
        
        return modal;
    }

    /**
     * 確認モーダルを表示
     */
    confirm(options) {
        return new Promise((resolve) => {
            const modalId = `confirm-modal-${Date.now()}`;
            
            this.open(modalId, {
                title: options.title || '確認',
                content: `
                    <div class="text-center py-4">
                        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                            <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                        </div>
                        <p class="text-lg font-medium text-gray-900">${options.message || '本当に実行しますか？'}</p>
                        ${options.subMessage ? `<p class="mt-2 text-sm text-gray-500">${options.subMessage}</p>` : ''}
                    </div>
                `,
                footer: `
                    <button class="btn btn-gray" onclick="ModalManager.close('${modalId}')">
                        ${options.cancelText || 'キャンセル'}
                    </button>
                    <button class="btn btn-primary" onclick="ModalManager.confirmAction('${modalId}', true)">
                        ${options.confirmText || '確認'}
                    </button>
                `,
                size: 'modal-sm',
                preventClose: options.preventClose,
                onClose: () => {
                    if (!this._confirmResult) {
                        resolve(false);
                    }
                }
            });
            
            // 確認アクション用の一時的なメソッド
            this.confirmAction = (id, result) => {
                this._confirmResult = result;
                resolve(result);
                this.close(id);
                delete this._confirmResult;
            };
        });
    }

    /**
     * アラートモーダルを表示
     */
    alert(options) {
        const modalId = `alert-modal-${Date.now()}`;
        const types = {
            success: {
                icon: 'text-green-600',
                bg: 'bg-green-100',
                svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>'
            },
            error: {
                icon: 'text-red-600',
                bg: 'bg-red-100',
                svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>'
            },
            warning: {
                icon: 'text-yellow-600',
                bg: 'bg-yellow-100',
                svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>'
            },
            info: {
                icon: 'text-blue-600',
                bg: 'bg-blue-100',
                svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
            }
        };
        
        const type = types[options.type] || types.info;
        
        return this.open(modalId, {
            title: options.title || 'お知らせ',
            content: `
                <div class="text-center py-4">
                    <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full ${type.bg} mb-4">
                        <svg class="h-8 w-8 ${type.icon}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            ${type.svg}
                        </svg>
                    </div>
                    <p class="text-lg font-medium text-gray-900">${options.message || ''}</p>
                    ${options.subMessage ? `<p class="mt-2 text-sm text-gray-500">${options.subMessage}</p>` : ''}
                </div>
            `,
            footer: `
                <button class="btn btn-primary w-full" onclick="ModalManager.close('${modalId}')">
                    ${options.buttonText || '閉じる'}
                </button>
            `,
            size: 'modal-sm',
            showHeader: false
        });
    }

    /**
     * フォーカストラップ
     */
    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];
        
        if (firstFocusableElement) {
            firstFocusableElement.focus();
        }
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    /**
     * フォーカスを復元
     */
    restoreFocus() {
        // 前のモーダルにフォーカスを戻す
        if (this.activeModals.length > 0) {
            const previousModal = this.activeModals[this.activeModals.length - 1];
            const focusableElements = previousModal.element.querySelectorAll(
                'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
            );
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }
    }
}

// シングルトンインスタンスを作成
const modalManager = new ModalManager();

// グローバル関数として公開
window.openModal = (modalId, options) => modalManager.open(modalId, options);
window.closeModal = (modalId) => modalManager.close(modalId);
window.confirmModal = (options) => modalManager.confirm(options);
window.alertModal = (options) => modalManager.alert(options);

// 静的メソッドも公開
window.ModalManager = modalManager;