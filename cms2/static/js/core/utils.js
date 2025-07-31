/**
 * KAGAMI CMS 2.0 - Utility Functions
 * 共通ユーティリティ関数
 */

// 日付・時刻関連
const DateUtils = {
    /**
     * 相対時間を取得（例：3分前、2時間前）
     */
    getRelativeTime(date) {
        const now = new Date();
        const targetDate = new Date(date);
        const diff = now - targetDate;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
        
        if (seconds < 60) return '今';
        if (minutes < 60) return `${minutes}分前`;
        if (hours < 24) return `${hours}時間前`;
        if (days < 30) return `${days}日前`;
        if (months < 12) return `${months}ヶ月前`;
        return `${years}年前`;
    },
    
    /**
     * 日付をフォーマット
     */
    format(date, format = 'YYYY/MM/DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },
    
    /**
     * 営業日を計算
     */
    addBusinessDays(date, days) {
        const result = new Date(date);
        let count = 0;
        
        while (count < days) {
            result.setDate(result.getDate() + 1);
            if (result.getDay() !== 0 && result.getDay() !== 6) {
                count++;
            }
        }
        
        return result;
    }
};

// 文字列操作
const StringUtils = {
    /**
     * 文字列を切り詰める
     */
    truncate(str, length = 50, suffix = '...') {
        if (!str || str.length <= length) return str;
        return str.substring(0, length) + suffix;
    },
    
    /**
     * HTMLエスケープ
     */
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
    
    /**
     * キャメルケースをケバブケースに変換
     */
    camelToKebab(str) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    },
    
    /**
     * スネークケースをキャメルケースに変換
     */
    snakeToCamel(str) {
        return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    },
    
    /**
     * 全角英数字を半角に変換
     */
    toHalfWidth(str) {
        return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });
    }
};

// 数値関連
const NumberUtils = {
    /**
     * 数値をフォーマット（カンマ区切り）
     */
    format(num, decimals = 0) {
        return new Intl.NumberFormat('ja-JP', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    },
    
    /**
     * バイト数を読みやすい形式に変換
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    
    /**
     * パーセンテージを計算
     */
    percentage(value, total, decimals = 0) {
        if (total === 0) return 0;
        return ((value / total) * 100).toFixed(decimals);
    },
    
    /**
     * 範囲内に収める
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
};

// 配列・オブジェクト操作
const ArrayUtils = {
    /**
     * 配列をチャンクに分割
     */
    chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    },
    
    /**
     * 配列から重複を削除
     */
    unique(array, key = null) {
        if (key) {
            const seen = new Set();
            return array.filter(item => {
                const k = item[key];
                if (seen.has(k)) return false;
                seen.add(k);
                return true;
            });
        }
        return [...new Set(array)];
    },
    
    /**
     * 配列をグループ化
     */
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) result[group] = [];
            result[group].push(item);
            return result;
        }, {});
    },
    
    /**
     * 配列の合計を計算
     */
    sum(array, key = null) {
        if (key) {
            return array.reduce((sum, item) => sum + (item[key] || 0), 0);
        }
        return array.reduce((sum, num) => sum + num, 0);
    }
};

// DOM操作
const DOMUtils = {
    /**
     * 要素の高さをアニメーション付きで変更
     */
    animateHeight(element, targetHeight, duration = 300) {
        const startHeight = element.offsetHeight;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentHeight = startHeight + (targetHeight - startHeight) * easeOutCubic;
            
            element.style.height = `${currentHeight}px`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.height = targetHeight === 'auto' ? '' : `${targetHeight}px`;
            }
        };
        
        requestAnimationFrame(animate);
    },
    
    /**
     * スムーズスクロール
     */
    smoothScroll(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;
        
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset + offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    },
    
    /**
     * 要素が画面内に表示されているかチェック
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    /**
     * 要素の外側クリックを検出
     */
    onClickOutside(element, callback) {
        const handleClick = (e) => {
            if (!element.contains(e.target)) {
                callback(e);
            }
        };
        
        document.addEventListener('click', handleClick);
        
        // クリーンアップ関数を返す
        return () => document.removeEventListener('click', handleClick);
    }
};

// フォーム関連
const FormUtils = {
    /**
     * フォームデータをオブジェクトに変換
     */
    serialize(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData) {
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
    },
    
    /**
     * フォームバリデーション
     */
    validate(form) {
        const errors = {};
        const inputs = form.querySelectorAll('[required], [pattern], [min], [max], [minlength], [maxlength]');
        
        inputs.forEach(input => {
            const value = input.value.trim();
            const name = input.name;
            
            // 必須チェック
            if (input.hasAttribute('required') && !value) {
                errors[name] = '必須項目です';
                return;
            }
            
            // パターンチェック
            if (input.hasAttribute('pattern') && value) {
                const pattern = new RegExp(input.getAttribute('pattern'));
                if (!pattern.test(value)) {
                    errors[name] = '形式が正しくありません';
                }
            }
            
            // 長さチェック
            if (input.hasAttribute('minlength') && value.length < input.minLength) {
                errors[name] = `${input.minLength}文字以上入力してください`;
            }
            
            if (input.hasAttribute('maxlength') && value.length > input.maxLength) {
                errors[name] = `${input.maxLength}文字以内で入力してください`;
            }
        });
        
        return errors;
    },
    
    /**
     * エラーメッセージを表示
     */
    showErrors(form, errors) {
        // 既存のエラーをクリア
        form.querySelectorAll('.form-error').forEach(el => el.remove());
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        
        // 新しいエラーを表示
        Object.entries(errors).forEach(([name, message]) => {
            const input = form.querySelector(`[name="${name}"]`);
            if (input) {
                input.classList.add('error');
                const errorEl = document.createElement('p');
                errorEl.className = 'form-error';
                errorEl.textContent = message;
                input.parentElement.appendChild(errorEl);
            }
        });
    }
};

// ストレージ関連
const StorageUtils = {
    /**
     * ローカルストレージに保存（有効期限付き）
     */
    set(key, value, expiryMinutes = null) {
        const data = {
            value: value,
            timestamp: new Date().getTime()
        };
        
        if (expiryMinutes) {
            data.expiry = data.timestamp + (expiryMinutes * 60 * 1000);
        }
        
        localStorage.setItem(key, JSON.stringify(data));
    },
    
    /**
     * ローカルストレージから取得
     */
    get(key) {
        const item = localStorage.getItem(key);
        if (!item) return null;
        
        try {
            const data = JSON.parse(item);
            
            // 有効期限チェック
            if (data.expiry && new Date().getTime() > data.expiry) {
                localStorage.removeItem(key);
                return null;
            }
            
            return data.value;
        } catch (e) {
            return null;
        }
    },
    
    /**
     * セッションストレージのラッパー
     */
    session: {
        set(key, value) {
            sessionStorage.setItem(key, JSON.stringify(value));
        },
        
        get(key) {
            const item = sessionStorage.getItem(key);
            try {
                return JSON.parse(item);
            } catch (e) {
                return null;
            }
        },
        
        remove(key) {
            sessionStorage.removeItem(key);
        }
    }
};

// その他のユーティリティ
const Utils = {
    /**
     * UUIDを生成
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    
    /**
     * ディープコピー
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Object) {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },
    
    /**
     * クエリパラメータを取得
     */
    getQueryParams() {
        const params = {};
        const searchParams = new URLSearchParams(window.location.search);
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
        return params;
    },
    
    /**
     * クリップボードにコピー
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // フォールバック
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                return true;
            } catch (err) {
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    }
};

// エクスポート
window.DateUtils = DateUtils;
window.StringUtils = StringUtils;
window.NumberUtils = NumberUtils;
window.ArrayUtils = ArrayUtils;
window.DOMUtils = DOMUtils;
window.FormUtils = FormUtils;
window.StorageUtils = StorageUtils;
window.Utils = Utils;