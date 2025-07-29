/**
 * KAGAMI CMS 2.0 - Form Validation Component
 * フォームバリデーション・入力支援コンポーネント
 */

class FormValidator {
    constructor(form, options = {}) {
        this.form = typeof form === 'string' ? document.querySelector(form) : form;
        this.options = {
            validateOnBlur: true,
            validateOnInput: true,
            validateOnSubmit: true,
            showErrorMessages: true,
            scrollToError: true,
            customValidators: {},
            ...options
        };
        
        this.validators = {
            required: {
                validate: (value) => value.trim() !== '',
                message: 'このフィールドは必須です'
            },
            email: {
                validate: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                message: '有効なメールアドレスを入力してください'
            },
            minLength: {
                validate: (value, params) => !value || value.length >= params.min,
                message: (params) => `最低${params.min}文字以上入力してください`
            },
            maxLength: {
                validate: (value, params) => !value || value.length <= params.max,
                message: (params) => `最大${params.max}文字以内で入力してください`
            },
            pattern: {
                validate: (value, params) => !value || new RegExp(params.pattern).test(value),
                message: (params) => params.message || 'フォーマットが正しくありません'
            },
            numeric: {
                validate: (value) => !value || /^\d+$/.test(value),
                message: '数値を入力してください'
            },
            date: {
                validate: (value) => !value || !isNaN(Date.parse(value)),
                message: '有効な日付を入力してください'
            },
            url: {
                validate: (value) => !value || /^https?:\/\/.+/.test(value),
                message: '有効なURLを入力してください'
            },
            phone: {
                validate: (value) => !value || /^[0-9-+() ]+$/.test(value),
                message: '有効な電話番号を入力してください'
            },
            ...this.options.customValidators
        };
        
        this.errors = new Map();
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        // フォーム要素の初期化
        this.initializeFormElements();
        
        // イベントリスナーの設定
        this.attachEventListeners();
        
        // 初期バリデーション状態の設定
        this.form.setAttribute('novalidate', true);
        this.form.classList.add('form-validator-initialized');
    }
    
    initializeFormElements() {
        const fields = this.form.querySelectorAll('[data-validate]');
        
        fields.forEach(field => {
            // エラーメッセージ要素の作成
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.setAttribute('role', 'alert');
            errorElement.setAttribute('aria-live', 'polite');
            
            const wrapper = field.closest('.form-group, .field-wrapper');
            if (wrapper) {
                wrapper.appendChild(errorElement);
            } else {
                field.parentNode.insertBefore(errorElement, field.nextSibling);
            }
            
            // ARIA属性の設定
            const errorId = `error-${field.id || Math.random().toString(36).substr(2, 9)}`;
            errorElement.id = errorId;
            field.setAttribute('aria-describedby', errorId);
            field.setAttribute('aria-invalid', 'false');
        });
    }
    
    attachEventListeners() {
        // フォーム送信時
        if (this.options.validateOnSubmit) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                if (this.validateForm()) {
                    if (this.options.onSubmit) {
                        this.options.onSubmit(this.getFormData(), this.form);
                    } else {
                        this.form.submit();
                    }
                } else if (this.options.scrollToError) {
                    this.scrollToFirstError();
                }
            });
        }
        
        // フィールドのイベント
        const fields = this.form.querySelectorAll('[data-validate]');
        
        fields.forEach(field => {
            // Blur時のバリデーション
            if (this.options.validateOnBlur) {
                field.addEventListener('blur', () => {
                    this.validateField(field);
                });
            }
            
            // Input時のバリデーション
            if (this.options.validateOnInput) {
                field.addEventListener('input', debounce(() => {
                    if (this.errors.has(field)) {
                        this.validateField(field);
                    }
                }, 300));
            }
            
            // 特殊な入力補助
            this.attachSpecialInputHandlers(field);
        });
    }
    
    attachSpecialInputHandlers(field) {
        const type = field.dataset.inputType || field.type;
        
        switch (type) {
            case 'phone':
                this.attachPhoneInputHandler(field);
                break;
            case 'date':
                this.attachDateInputHandler(field);
                break;
            case 'currency':
                this.attachCurrencyInputHandler(field);
                break;
            case 'credit-card':
                this.attachCreditCardInputHandler(field);
                break;
        }
    }
    
    attachPhoneInputHandler(field) {
        field.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^\d]/g, '');
            
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = value;
                } else if (value.length <= 7) {
                    value = `${value.slice(0, 3)}-${value.slice(3)}`;
                } else {
                    value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
                }
            }
            
            e.target.value = value;
        });
    }
    
    attachDateInputHandler(field) {
        // Flatpickrなどのライブラリと連携可能
        field.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^\d]/g, '');
            
            if (value.length >= 4) {
                value = `${value.slice(0, 4)}/${value.slice(4, 6)}/${value.slice(6, 8)}`;
            }
            
            e.target.value = value;
        });
    }
    
    attachCurrencyInputHandler(field) {
        field.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9.-]/g, '');
            
            if (value) {
                const parts = value.split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                e.target.value = '¥' + parts.join('.');
            }
        });
        
        field.addEventListener('focus', (e) => {
            e.target.value = e.target.value.replace(/[¥,]/g, '');
        });
    }
    
    attachCreditCardInputHandler(field) {
        field.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            const chunks = value.match(/.{1,4}/g) || [];
            e.target.value = chunks.join(' ');
        });
    }
    
    validateForm() {
        const fields = this.form.querySelectorAll('[data-validate]');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        const rules = this.parseValidationRules(field.dataset.validate);
        const value = field.value;
        let isValid = true;
        let errorMessage = '';
        
        for (const rule of rules) {
            const validator = this.validators[rule.name];
            
            if (validator) {
                const valid = validator.validate(value, rule.params);
                
                if (!valid) {
                    isValid = false;
                    errorMessage = typeof validator.message === 'function' 
                        ? validator.message(rule.params) 
                        : validator.message;
                    break;
                }
            }
        }
        
        // カスタムバリデーション
        if (isValid && field.dataset.customValidate) {
            const customResult = this.options.customValidate?.(field, value);
            if (customResult !== true) {
                isValid = false;
                errorMessage = customResult || 'バリデーションエラー';
            }
        }
        
        // エラー表示の更新
        this.updateFieldError(field, isValid, errorMessage);
        
        return isValid;
    }
    
    parseValidationRules(rulesString) {
        const rules = [];
        const ruleParts = rulesString.split('|');
        
        ruleParts.forEach(part => {
            const [name, ...params] = part.split(':');
            const rule = { name: name.trim(), params: {} };
            
            if (params.length > 0) {
                const paramString = params.join(':');
                
                // パラメータのパース
                if (name === 'minLength' || name === 'maxLength') {
                    rule.params[name.replace('Length', '')] = parseInt(paramString);
                } else if (name === 'pattern') {
                    const [pattern, ...messageParts] = paramString.split(',');
                    rule.params.pattern = pattern;
                    if (messageParts.length > 0) {
                        rule.params.message = messageParts.join(',');
                    }
                } else {
                    rule.params = paramString;
                }
            }
            
            rules.push(rule);
        });
        
        return rules;
    }
    
    updateFieldError(field, isValid, errorMessage) {
        const wrapper = field.closest('.form-group, .field-wrapper') || field.parentNode;
        const errorElement = wrapper.querySelector('.field-error');
        
        if (isValid) {
            this.errors.delete(field);
            field.classList.remove('is-invalid');
            field.setAttribute('aria-invalid', 'false');
            wrapper.classList.remove('has-error');
            
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
        } else {
            this.errors.set(field, errorMessage);
            field.classList.add('is-invalid');
            field.setAttribute('aria-invalid', 'true');
            wrapper.classList.add('has-error');
            
            if (errorElement && this.options.showErrorMessages) {
                errorElement.textContent = errorMessage;
                errorElement.style.display = 'block';
                
                // アニメーション
                errorElement.classList.add('error-shake');
                setTimeout(() => {
                    errorElement.classList.remove('error-shake');
                }, 500);
            }
        }
    }
    
    scrollToFirstError() {
        const firstError = this.form.querySelector('.is-invalid');
        
        if (firstError) {
            const offset = 100;
            const elementTop = firstError.getBoundingClientRect().top + window.pageYOffset;
            
            window.scrollTo({
                top: elementTop - offset,
                behavior: 'smooth'
            });
            
            firstError.focus();
        }
    }
    
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }
    
    reset() {
        this.errors.clear();
        
        const fields = this.form.querySelectorAll('[data-validate]');
        fields.forEach(field => {
            this.updateFieldError(field, true, '');
        });
        
        this.form.reset();
    }
    
    addValidator(name, validator) {
        this.validators[name] = validator;
    }
    
    removeValidator(name) {
        delete this.validators[name];
    }
}

// フォームビルダーヘルパー
class FormBuilder {
    static createField(config) {
        const {
            type = 'text',
            name,
            label,
            placeholder,
            required = false,
            validation,
            options,
            value,
            helpText,
            className = ''
        } = config;
        
        let fieldHtml = '';
        
        switch (type) {
            case 'select':
                fieldHtml = this.createSelectField(config);
                break;
            case 'radio':
            case 'checkbox':
                fieldHtml = this.createOptionsField(config);
                break;
            case 'textarea':
                fieldHtml = this.createTextareaField(config);
                break;
            default:
                fieldHtml = this.createInputField(config);
        }
        
        return `
            <div class="form-group ${className}">
                ${label ? `<label for="${name}" class="form-label ${required ? 'required' : ''}">${label}</label>` : ''}
                ${fieldHtml}
                ${helpText ? `<small class="form-help-text">${helpText}</small>` : ''}
            </div>
        `;
    }
    
    static createInputField(config) {
        const { type, name, placeholder, validation, value } = config;
        
        return `
            <input 
                type="${type}"
                id="${name}"
                name="${name}"
                class="form-input"
                ${placeholder ? `placeholder="${placeholder}"` : ''}
                ${validation ? `data-validate="${validation}"` : ''}
                ${value ? `value="${value}"` : ''}
            >
        `;
    }
    
    static createSelectField(config) {
        const { name, placeholder, validation, options = [], value } = config;
        
        return `
            <select 
                id="${name}"
                name="${name}"
                class="form-select"
                ${validation ? `data-validate="${validation}"` : ''}
            >
                ${placeholder ? `<option value="">${placeholder}</option>` : ''}
                ${options.map(opt => `
                    <option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>
                        ${opt.label}
                    </option>
                `).join('')}
            </select>
        `;
    }
    
    static createTextareaField(config) {
        const { name, placeholder, validation, value, rows = 4 } = config;
        
        return `
            <textarea 
                id="${name}"
                name="${name}"
                class="form-textarea"
                rows="${rows}"
                ${placeholder ? `placeholder="${placeholder}"` : ''}
                ${validation ? `data-validate="${validation}"` : ''}
            >${value || ''}</textarea>
        `;
    }
    
    static createOptionsField(config) {
        const { type, name, options = [], value } = config;
        const values = Array.isArray(value) ? value : [value];
        
        return `
            <div class="form-options">
                ${options.map((opt, index) => `
                    <label class="form-${type}">
                        <input 
                            type="${type}"
                            name="${name}"
                            value="${opt.value}"
                            ${values.includes(opt.value) ? 'checked' : ''}
                            ${type === 'radio' ? `id="${name}_${index}"` : ''}
                        >
                        <span class="${type}-label">${opt.label}</span>
                    </label>
                `).join('')}
            </div>
        `;
    }
}

// エクスポート
window.FormValidator = FormValidator;
window.FormBuilder = FormBuilder;