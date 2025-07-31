/**
 * KAGAMI CMS 2.0 - ドキュメント管理
 * ドキュメントのアップロード、管理、共有機能
 */

class DocumentManager {
    constructor() {
        this.documents = [];
        this.selectedDocuments = new Set();
        this.currentView = 'grid';
        this.currentSort = 'date_desc';
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        // ドキュメント一覧の読み込み
        await this.loadDocuments();
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        // ドラッグ&ドロップの初期化
        this.initDragAndDrop();
    }

    async loadDocuments() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/documents');
            const data = await response.json();
            
            this.documents = data.documents;
            this.renderDocuments();
            this.updateStats();
            
        } catch (error) {
            console.error('Documents loading error:', error);
            showError('エラー', 'ドキュメントの読み込みに失敗しました');
        } finally {
            this.hideLoading();
        }
    }

    renderDocuments() {
        const container = document.getElementById('documentsContainer');
        if (!container) return;

        // フィルタリングとソート
        let filteredDocs = this.filterDocuments(this.documents);
        filteredDocs = this.sortDocuments(filteredDocs);

        if (this.currentView === 'grid') {
            this.renderGridView(container, filteredDocs);
        } else {
            this.renderListView(container, filteredDocs);
        }
    }

    renderGridView(container, documents) {
        container.className = 'documents-grid';
        container.innerHTML = documents.map(doc => `
            <div class="document-card ${this.selectedDocuments.has(doc.id) ? 'selected' : ''}" 
                 data-doc-id="${doc.id}">
                <div class="document-card-header">
                    <input type="checkbox" 
                           class="document-checkbox" 
                           ${this.selectedDocuments.has(doc.id) ? 'checked' : ''}
                           onchange="documentManager.toggleSelection('${doc.id}')">
                    <div class="document-actions">
                        <button class="btn-icon" onclick="documentManager.showActions('${doc.id}')" title="その他の操作">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="document-preview" onclick="documentManager.previewDocument('${doc.id}')">
                    ${this.getDocumentIcon(doc.type, 'large')}
                </div>
                <div class="document-info">
                    <h3 class="document-title">${doc.title}</h3>
                    <p class="document-meta">
                        <span>${this.formatFileSize(doc.size)}</span>
                        <span>•</span>
                        <span>${this.formatDate(doc.updated_at)}</span>
                    </p>
                    <div class="document-tags">
                        ${doc.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderListView(container, documents) {
        container.className = 'documents-list';
        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="table-checkbox">
                            <input type="checkbox" 
                                   onchange="documentManager.toggleAllSelection()"
                                   ${this.selectedDocuments.size === documents.length ? 'checked' : ''}>
                        </th>
                        <th>ドキュメント名</th>
                        <th>タイプ</th>
                        <th>サイズ</th>
                        <th>更新日</th>
                        <th>共有</th>
                        <th class="text-right">操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${documents.map(doc => `
                        <tr class="table-row ${this.selectedDocuments.has(doc.id) ? 'selected' : ''}"
                            data-doc-id="${doc.id}">
                            <td class="table-checkbox">
                                <input type="checkbox" 
                                       ${this.selectedDocuments.has(doc.id) ? 'checked' : ''}
                                       onchange="documentManager.toggleSelection('${doc.id}')">
                            </td>
                            <td>
                                <div class="flex items-center">
                                    ${this.getDocumentIcon(doc.type, 'small')}
                                    <div class="ml-3">
                                        <p class="font-medium">${doc.title}</p>
                                        <div class="text-sm text-gray-500">
                                            ${doc.tags.map(tag => `<span class="tag-sm">${tag}</span>`).join('')}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>${this.getDocumentTypeName(doc.type)}</td>
                            <td>${this.formatFileSize(doc.size)}</td>
                            <td>${this.formatDate(doc.updated_at)}</td>
                            <td>
                                ${doc.shared ? `
                                    <span class="badge badge-success">共有中</span>
                                ` : `
                                    <span class="badge badge-gray">非公開</span>
                                `}
                            </td>
                            <td class="text-right">
                                <div class="flex justify-end gap-2">
                                    <button class="btn-icon" onclick="documentManager.downloadDocument('${doc.id}')" title="ダウンロード">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                        </svg>
                                    </button>
                                    <button class="btn-icon" onclick="documentManager.shareDocument('${doc.id}')" title="共有">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-2.684 0m2.684 0A3 3 0 0112 21m0 0a3 3 0 00-5.316-1.974M12 21a3 3 0 00-3-3m0 0a3 3 0 00-3-3m0 0a3 3 0 103 3m3-9a3 3 0 103 3m-3-3a3 3 0 00-3 3"/>
                                        </svg>
                                    </button>
                                    <button class="btn-icon" onclick="documentManager.deleteDocument('${doc.id}')" title="削除">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    getDocumentIcon(type, size = 'small') {
        const sizeClass = size === 'large' ? 'w-16 h-16' : 'w-10 h-10';
        const icons = {
            pdf: `<div class="document-icon pdf ${sizeClass}"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19L8,14H9.5L10.5,17L11.5,14H13L11,19H10M16,19H14V14H16A2,2 0 0,1 18,16V17A2,2 0 0,1 16,19M16,16H15V18H16A1,1 0 0,0 17,17V16A1,1 0 0,0 16,16Z"/></svg></div>`,
            excel: `<div class="document-icon excel ${sizeClass}"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12.9,14.5L15.8,19H14L12.1,15.5L10.2,19H8.4L11.3,14.5L8.5,10H10.3L12.1,13.5L13.9,10H15.7L12.9,14.5Z"/></svg></div>`,
            word: `<div class="document-icon word ${sizeClass}"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M13.5,16L15,19H13.4L12.6,17.4L11.8,19H10.2L11.7,16L10.2,13H11.8L12.6,14.6L13.4,13H15L13.5,16Z"/></svg></div>`,
            ppt: `<div class="document-icon ppt ${sizeClass}"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19V10H13A2,2 0 0,1 15,12V15A2,2 0 0,1 13,17H11V19H10M13,12H11V15H13V12Z"/></svg></div>`,
            image: `<div class="document-icon image ${sizeClass}"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19M8.5,13.5L11,16.5L14.5,12L19,18H5L8.5,13.5Z"/></svg></div>`,
            default: `<div class="document-icon default ${sizeClass}"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M13,2V9H13.5A1.5,1.5 0 0,0 15,7.5V2H20V20H4V2H13M13,9H6V11H13V9M6,13V15H16V13H6M6,17V19H16V17H6Z"/></svg></div>`
        };
        return icons[type] || icons.default;
    }

    getDocumentTypeName(type) {
        const types = {
            pdf: 'PDF',
            excel: 'Excel',
            word: 'Word',
            ppt: 'PowerPoint',
            image: '画像',
            default: 'その他'
        };
        return types[type] || types.default;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    filterDocuments(documents) {
        if (this.currentFilter === 'all') return documents;
        
        return documents.filter(doc => {
            switch (this.currentFilter) {
                case 'shared':
                    return doc.shared;
                case 'private':
                    return !doc.shared;
                case 'recent':
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(doc.updated_at) > weekAgo;
                default:
                    return doc.type === this.currentFilter;
            }
        });
    }

    sortDocuments(documents) {
        const sorted = [...documents];
        
        switch (this.currentSort) {
            case 'name_asc':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'name_desc':
                return sorted.sort((a, b) => b.title.localeCompare(a.title));
            case 'date_asc':
                return sorted.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
            case 'date_desc':
                return sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            case 'size_asc':
                return sorted.sort((a, b) => a.size - b.size);
            case 'size_desc':
                return sorted.sort((a, b) => b.size - a.size);
            default:
                return sorted;
        }
    }

    setupEventListeners() {
        // ビュー切り替え
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentView = e.currentTarget.dataset.view;
                this.renderDocuments();
                
                // アクティブクラスの更新
                document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // フィルター
        const filterSelect = document.getElementById('documentFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderDocuments();
            });
        }

        // ソート
        const sortSelect = document.getElementById('documentSort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderDocuments();
            });
        }

        // 検索
        const searchInput = document.getElementById('documentSearch');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.searchDocuments(e.target.value);
            }, 300));
        }

        // アップロードボタン
        const uploadBtn = document.getElementById('uploadDocumentBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.showUploadModal());
        }
    }

    initDragAndDrop() {
        const dropZone = document.getElementById('documentDropZone');
        if (!dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFileUpload(files);
        });
    }

    async handleFileUpload(files) {
        const formData = new FormData();
        
        for (let file of files) {
            formData.append('files', file);
        }
        
        try {
            showInfo('アップロード中', 'ファイルをアップロードしています...');
            
            const response = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                showSuccess('成功', 'ファイルがアップロードされました');
                await this.loadDocuments();
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showError('エラー', 'ファイルのアップロードに失敗しました');
        }
    }

    toggleSelection(docId) {
        if (this.selectedDocuments.has(docId)) {
            this.selectedDocuments.delete(docId);
        } else {
            this.selectedDocuments.add(docId);
        }
        this.updateBulkActions();
    }

    toggleAllSelection() {
        const allDocs = this.filterDocuments(this.documents);
        if (this.selectedDocuments.size === allDocs.length) {
            this.selectedDocuments.clear();
        } else {
            allDocs.forEach(doc => this.selectedDocuments.add(doc.id));
        }
        this.renderDocuments();
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        if (bulkActions) {
            if (this.selectedDocuments.size > 0) {
                bulkActions.classList.remove('hidden');
                document.getElementById('selectedCount').textContent = this.selectedDocuments.size;
            } else {
                bulkActions.classList.add('hidden');
            }
        }
    }

    async deleteDocument(docId) {
        const confirmed = await confirmModal({
            title: '削除の確認',
            message: 'このドキュメントを削除しますか？',
            confirmText: '削除',
            type: 'danger'
        });
        
        if (confirmed) {
            try {
                const response = await fetch(`/api/documents/${docId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    showSuccess('削除完了', 'ドキュメントを削除しました');
                    await this.loadDocuments();
                }
            } catch (error) {
                showError('エラー', '削除に失敗しました');
            }
        }
    }

    previewDocument(docId) {
        window.open(`/documents/${docId}/preview`, '_blank');
    }

    downloadDocument(docId) {
        window.location.href = `/api/documents/${docId}/download`;
    }

    shareDocument(docId) {
        openModal('shareDocumentModal', {
            onOpen: (modal) => {
                modal.dataset.docId = docId;
            }
        });
    }

    searchDocuments(query) {
        // 検索処理
        const filtered = this.documents.filter(doc => 
            doc.title.toLowerCase().includes(query.toLowerCase()) ||
            doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        this.renderDocuments();
    }

    showUploadModal() {
        openModal('uploadDocumentModal');
    }

    updateStats() {
        // 統計情報の更新
        const totalDocs = document.getElementById('totalDocuments');
        if (totalDocs) {
            totalDocs.textContent = this.documents.length;
        }
        
        const sharedDocs = document.getElementById('sharedDocuments');
        if (sharedDocs) {
            sharedDocs.textContent = this.documents.filter(d => d.shared).length;
        }
    }

    showLoading() {
        const container = document.getElementById('documentsContainer');
        if (container) {
            container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
        }
    }

    hideLoading() {
        // ローディング表示は renderDocuments で上書きされる
    }
}

// 初期化
const documentManager = new DocumentManager();

// Utility function
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