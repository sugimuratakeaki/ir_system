/**
 * 対話記録管理 共通ユーティリティ
 */

// データタイプの定義
const DATA_TYPES = {
    WEB_MEETING: { icon: '💻', label: 'Web会議' },
    AUDIO: { icon: '🎤', label: '音声' },
    VIDEO: { icon: '🎥', label: '動画' },
    DOCUMENT: { icon: '📄', label: '文書' },
    EMAIL: { icon: '✉️', label: 'メール' }
};

// AIステータスの定義
const AI_STATUS = {
    PENDING: { label: '処理待ち', class: 'ai-pending' },
    PROCESSING: { label: '処理中', class: 'ai-processing' },
    COMPLETE: { label: '完了', class: 'ai-complete' },
    ERROR: { label: 'エラー', class: 'ai-error' }
};

/**
 * データアイコンを生成する
 * @param {Object} dataStatus - 各データタイプの有無
 * @returns {string} HTMLテンプレート
 */
function generateDataIcons(dataStatus) {
    let html = '<div class="data-icons">';
    
    for (const [key, type] of Object.entries(DATA_TYPES)) {
        const isActive = dataStatus[key.toLowerCase()] || false;
        const activeClass = isActive ? 'active' : 'inactive';
        const title = `${type.label}${isActive ? 'あり' : 'なし'}`;
        
        html += `<span class="data-icon ${activeClass}" title="${title}">${type.icon}</span>`;
    }
    
    html += '</div>';
    return html;
}

/**
 * AIステータスバッジを生成する
 * @param {string} status - AIステータス
 * @returns {string} HTMLテンプレート
 */
function generateAIStatusBadge(status) {
    const statusConfig = AI_STATUS[status] || AI_STATUS.PENDING;
    return `
        <div class="ai-status">
            <span class="ai-badge ${statusConfig.class}" title="AI${statusConfig.label}">🤖</span>
            <span class="text-xs">${statusConfig.label}</span>
        </div>
    `;
}

/**
 * AIサマリーを生成する
 * @param {Object} summary - サマリー情報
 * @returns {string} HTMLテンプレート
 */
function generateAISummary(summary) {
    if (!summary || !summary.text) return '';
    
    let tagsHtml = '';
    if (summary.tags && summary.tags.length > 0) {
        tagsHtml = '<div class="summary-tags mt-sm">';
        summary.tags.forEach(tag => {
            tagsHtml += `<span class="tag-small">${tag.icon} ${tag.label}</span>`;
        });
        tagsHtml += '</div>';
    }
    
    return `
        <div class="ai-summary">
            <div class="summary-header">
                <span class="icon">📝</span>
                <span class="text-sm font-semibold">AIサマリー</span>
            </div>
            <p class="text-sm mt-sm">${summary.text}</p>
            ${tagsHtml}
        </div>
    `;
}

/**
 * ビューモードの管理
 */
class ViewModeManager {
    constructor(storageKey = 'dialogueViewMode') {
        this.storageKey = storageKey;
        this.currentMode = this.loadMode();
    }
    
    loadMode() {
        return localStorage.getItem(this.storageKey) || 'simple';
    }
    
    saveMode(mode) {
        localStorage.setItem(this.storageKey, mode);
        this.currentMode = mode;
    }
    
    toggleMode() {
        const newMode = this.currentMode === 'simple' ? 'detailed' : 'simple';
        this.saveMode(newMode);
        return newMode;
    }
    
    applyMode(mode = this.currentMode) {
        if (mode === 'detailed') {
            document.body.classList.add('detailed-mode');
        } else {
            document.body.classList.remove('detailed-mode');
        }
        
        // ボタンのアクティブ状態を更新
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === mode);
        });
    }
}

/**
 * データのフィルタリング機能
 */
class DataFilter {
    constructor() {
        this.filters = {
            dataType: null,
            status: null,
            dateFrom: null,
            dateTo: null,
            keyword: null
        };
    }
    
    setFilter(key, value) {
        this.filters[key] = value;
    }
    
    applyFilters(rows) {
        return rows.filter(row => {
            // データタイプのフィルタ
            if (this.filters.dataType && !this.matchDataType(row, this.filters.dataType)) {
                return false;
            }
            
            // ステータスのフィルタ
            if (this.filters.status && !this.matchStatus(row, this.filters.status)) {
                return false;
            }
            
            // 日付範囲のフィルタ
            if (!this.matchDateRange(row, this.filters.dateFrom, this.filters.dateTo)) {
                return false;
            }
            
            // キーワードのフィルタ
            if (this.filters.keyword && !this.matchKeyword(row, this.filters.keyword)) {
                return false;
            }
            
            return true;
        });
    }
    
    matchDataType(row, dataType) {
        // 実装はデータ構造に依存
        return true;
    }
    
    matchStatus(row, status) {
        // 実装はデータ構造に依存
        return true;
    }
    
    matchDateRange(row, dateFrom, dateTo) {
        // 実装はデータ構造に依存
        return true;
    }
    
    matchKeyword(row, keyword) {
        // 実装はデータ構造に依存
        return true;
    }
}

// エクスポート（モジュールとして使用する場合）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DATA_TYPES,
        AI_STATUS,
        generateDataIcons,
        generateAIStatusBadge,
        generateAISummary,
        ViewModeManager,
        DataFilter
    };
}
