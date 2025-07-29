/**
 * KAGAMI CMS 2.0 - Modal System
 * 洗練されたモーダルシステム
 */

// モーダルシステム名前空間
KAGAMI.modal = {
    activeModals: [],
    container: null,
    
    // 初期化
    init: function() {
        this.container = document.getElementById('modal-container');
        if (!this.container) {
            this.createContainer();
        }
        
        // ESCキーでモーダルを閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModals.length > 0) {
                const topModal = this.activeModals[this.activeModals.length - 1];
                if (topModal.options.closeOnEscape !== false) {
                    this.close(topModal.id);
                }
            }
        });
    },
    
    // コンテナの作成
    createContainer: function() {
        this.container = document.createElement('div');
        this.container.id = 'modal-container';
        document.body.appendChild(this.container);
    },
    
    /**
     * モーダルを開く
     * @param {Object} options - モーダルオプション
     * @returns {string} モーダルID
     */
    open: function(options = {}) {
        const modal = {
            id: options.id || KAGAMI.utils.generateUUID(),
            title: options.title || '',
            content: options.content || '',
            size: options.size || 'medium', // small, medium, large, full
            closable: options.closable !== false,
            closeOnEscape: options.closeOnEscape !== false,
            closeOnBackdrop: options.closeOnBackdrop !== false,
            showFooter: options.showFooter !== false,
            buttons: options.buttons || [],
            className: options.className || '',
            onOpen: options.onOpen || null,
            onClose: options.onClose || null,
            ...options
        };
        
        // モーダル要素の作成
        const modalElement = this.createElement(modal);
        
        // コンテナに追加
        this.container.appendChild(modalElement);
        
        // アクティブリストに追加
        this.activeModals.push(modal);
        
        // アニメーション
        requestAnimationFrame(() => {
            modalElement.classList.add('modal-show');
            
            // フォーカス管理
            this.trapFocus(modalElement);
            
            // 開いた時のコールバック
            if (modal.onOpen) {
                modal.onOpen(modal);
            }
        });
        
        // イベント発火
        window.dispatchEvent(new CustomEvent('modalOpened', { detail: modal }));
        
        return modal.id;
    },
    
    // モーダル要素の作成
    createElement: function(modal) {
        const element = document.createElement('div');
        element.id = `modal-${modal.id}`;
        element.className = `modal-wrapper ${modal.className}`;
        element.setAttribute('role', 'dialog');
        element.setAttribute('aria-modal', 'true');
        element.setAttribute('aria-labelledby', `modal-title-${modal.id}`);
        
        element.innerHTML = `
            <div class="modal-backdrop" ${modal.closeOnBackdrop ? `data-close="${modal.id}"` : ''}></div>
            <div class="modal modal-${modal.size}">
                ${modal.closable ? `
                    <button class="modal-close" data-close="${modal.id}" aria-label="閉じる">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                ` : ''}
                
                ${modal.title ? `
                    <div class="modal-header">
                        <h2 class="modal-title" id="modal-title-${modal.id}">${modal.title}</h2>
                    </div>
                ` : ''}
                
                <div class="modal-body">
                    ${modal.content}
                </div>
                
                ${modal.showFooter && modal.buttons.length > 0 ? `
                    <div class="modal-footer">
                        ${this.createButtons(modal.buttons, modal.id)}
                    </div>
                ` : ''}
            </div>
        `;
        
        // イベントリスナー
        element.querySelectorAll('[data-close]').forEach(el => {
            el.addEventListener('click', () => {
                this.close(modal.id);
            });
        });
        
        // ボタンのイベント
        modal.buttons.forEach((button, index) => {
            const btn = element.querySelector(`[data-button="${index}"]`);
            if (btn && button.onClick) {
                btn.addEventListener('click', () => {
                    button.onClick(modal);
                    if (button.closeOnClick !== false) {
                        this.close(modal.id);
                    }
                });
            }
        });
        
        return element;
    },
    
    // ボタンの作成
    createButtons: function(buttons, modalId) {
        return buttons.map((button, index) => {
            const classes = ['btn'];
            
            if (button.primary) classes.push('btn-primary');
            else if (button.danger) classes.push('btn-danger');
            else classes.push('btn-secondary');
            
            if (button.size) classes.push(`btn-${button.size}`);
            if (button.className) classes.push(button.className);
            
            return `<button 
                class="${classes.join(' ')}" 
                data-button="${index}"
                ${button.disabled ? 'disabled' : ''}
            >${button.text || 'ボタン'}</button>`;
        }).join('');
    },
    
    // モーダルを閉じる
    close: function(id) {
        const modalElement = document.getElementById(`modal-${id}`);
        if (!modalElement) return;
        
        const modalIndex = this.activeModals.findIndex(m => m.id === id);
        if (modalIndex === -1) return;
        
        const modal = this.activeModals[modalIndex];
        
        // アニメーション
        modalElement.classList.add('modal-hide');
        
        // アクティブリストから削除
        this.activeModals.splice(modalIndex, 1);
        
        // DOM要素の削除
        setTimeout(() => {
            if (modalElement.parentNode) {
                modalElement.parentNode.removeChild(modalElement);
            }
            
            // フォーカスを戻す
            if (modal._previousFocus) {
                modal._previousFocus.focus();
            }
            
            // 閉じた時のコールバック
            if (modal.onClose) {
                modal.onClose(modal);
            }
        }, 300);
        
        // イベント発火
        window.dispatchEvent(new CustomEvent('modalClosed', { detail: { id } }));
    },
    
    // すべてのモーダルを閉じる
    closeAll: function() {
        [...this.activeModals].forEach(modal => {
            this.close(modal.id);
        });
    },
    
    // フォーカストラップ
    trapFocus: function(modalElement) {
        const modal = modalElement.querySelector('.modal');
        const focusableElements = modal.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        const focusableContent = Array.from(focusableElements).filter(el => !el.disabled);
        
        if (focusableContent.length === 0) return;
        
        const firstFocusable = focusableContent[0];
        const lastFocusable = focusableContent[focusableContent.length - 1];
        
        // 現在のフォーカス要素を保存
        const modalId = modalElement.id.replace('modal-', '');
        const modalData = this.activeModals.find(m => m.id === modalId);
        if (modalData) {
            modalData._previousFocus = document.activeElement;
        }
        
        // 最初の要素にフォーカス
        firstFocusable.focus();
        
        // タブキーのトラップ
        modal.addEventListener('keydown', function(e) {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        });
    },
    
    // 便利なメソッド
    
    // 確認ダイアログ
    confirm: function(message, onConfirm, onCancel) {
        return this.open({
            title: '確認',
            content: `<p>${message}</p>`,
            size: 'small',
            buttons: [
                {
                    text: 'キャンセル',
                    onClick: onCancel || (() => {})
                },
                {
                    text: '確認',
                    primary: true,
                    onClick: onConfirm
                }
            ]
        });
    },
    
    // アラート
    alert: function(message, title = 'お知らせ') {
        return this.open({
            title: title,
            content: `<p>${message}</p>`,
            size: 'small',
            buttons: [
                {
                    text: 'OK',
                    primary: true
                }
            ]
        });
    },
    
    // プロンプト
    prompt: function(message, defaultValue = '', onSubmit) {
        const promptId = KAGAMI.utils.generateUUID();
        return this.open({
            title: message,
            content: `
                <form id="prompt-form-${promptId}">
                    <input 
                        type="text" 
                        class="form-input" 
                        id="prompt-input-${promptId}" 
                        value="${defaultValue}"
                        autofocus
                    >
                </form>
            `,
            size: 'small',
            buttons: [
                {
                    text: 'キャンセル'
                },
                {
                    text: 'OK',
                    primary: true,
                    onClick: (modal) => {
                        const input = document.getElementById(`prompt-input-${promptId}`);
                        if (onSubmit) {
                            onSubmit(input.value);
                        }
                    }
                }
            ],
            onOpen: () => {
                const form = document.getElementById(`prompt-form-${promptId}`);
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const input = document.getElementById(`prompt-input-${promptId}`);
                    if (onSubmit) {
                        onSubmit(input.value);
                    }
                    this.close(modal.id);
                });
            }
        });
    },
    
    // ローディング
    loading: function(message = '処理中...') {
        return this.open({
            content: `
                <div class="modal-loading">
                    <div class="loading-spinner"></div>
                    <p>${message}</p>
                </div>
            `,
            size: 'small',
            closable: false,
            closeOnEscape: false,
            closeOnBackdrop: false,
            showFooter: false
        });
    },
    
    // フォーム
    form: function(options) {
        const formId = options.formId || KAGAMI.utils.generateUUID();
        return this.open({
            title: options.title,
            content: options.content || this.buildForm(options.fields, formId),
            size: options.size || 'medium',
            buttons: [
                {
                    text: options.cancelText || 'キャンセル'
                },
                {
                    text: options.submitText || '送信',
                    primary: true,
                    onClick: (modal) => {
                        const form = document.getElementById(`form-${formId}`);
                        if (form && options.onSubmit) {
                            const formData = new FormData(form);
                            const data = Object.fromEntries(formData.entries());
                            options.onSubmit(data, modal);
                        }
                    }
                }
            ],
            ...options
        });
    },
    
    // フォームビルダー
    buildForm: function(fields, formId) {
        const formHtml = fields.map(field => {
            let inputHtml = '';
            
            switch (field.type) {
                case 'text':
                case 'email':
                case 'password':
                case 'number':
                    inputHtml = `
                        <input 
                            type="${field.type}" 
                            id="${field.id || field.name}" 
                            name="${field.name}"
                            class="form-input"
                            placeholder="${field.placeholder || ''}"
                            value="${field.value || ''}"
                            ${field.required ? 'required' : ''}
                            ${field.disabled ? 'disabled' : ''}
                        >
                    `;
                    break;
                    
                case 'textarea':
                    inputHtml = `
                        <textarea 
                            id="${field.id || field.name}" 
                            name="${field.name}"
                            class="form-textarea"
                            placeholder="${field.placeholder || ''}"
                            rows="${field.rows || 3}"
                            ${field.required ? 'required' : ''}
                            ${field.disabled ? 'disabled' : ''}
                        >${field.value || ''}</textarea>
                    `;
                    break;
                    
                case 'select':
                    inputHtml = `
                        <select 
                            id="${field.id || field.name}" 
                            name="${field.name}"
                            class="form-select"
                            ${field.required ? 'required' : ''}
                            ${field.disabled ? 'disabled' : ''}
                        >
                            ${field.options.map(option => `
                                <option 
                                    value="${option.value}" 
                                    ${option.value === field.value ? 'selected' : ''}
                                >${option.label}</option>
                            `).join('')}
                        </select>
                    `;
                    break;
                    
                case 'checkbox':
                    inputHtml = `
                        <label class="form-checkbox">
                            <input 
                                type="checkbox" 
                                id="${field.id || field.name}" 
                                name="${field.name}"
                                value="${field.value || 'on'}"
                                ${field.checked ? 'checked' : ''}
                                ${field.disabled ? 'disabled' : ''}
                            >
                            <span>${field.text || ''}</span>
                        </label>
                    `;
                    break;
            }
            
            return `
                <div class="form-group">
                    ${field.type !== 'checkbox' && field.label ? `
                        <label for="${field.id || field.name}" class="form-label">
                            ${field.label}
                            ${field.required ? '<span class="required">*</span>' : ''}
                        </label>
                    ` : ''}
                    ${inputHtml}
                    ${field.help ? `<p class="form-help">${field.help}</p>` : ''}
                </div>
            `;
        }).join('');
        
        return `<form id="form-${formId}" class="modal-form">${formHtml}</form>`;
    }
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    KAGAMI.modal.init();
});
