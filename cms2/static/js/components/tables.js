/**
 * KAGAMI CMS 2.0 - Advanced Data Table Component
 * 高機能データテーブルコンポーネント
 */

class DataTable {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            data: [],
            columns: [],
            searchable: true,
            sortable: true,
            filterable: true,
            paginate: true,
            pageSize: 10,
            exportable: true,
            selectable: true,
            responsive: true,
            loading: false,
            emptyMessage: 'データがありません',
            ...options
        };
        
        this.state = {
            currentPage: 1,
            sortColumn: null,
            sortDirection: 'asc',
            searchTerm: '',
            filters: {},
            selectedRows: new Set(),
            loading: false
        };
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        const html = `
            <div class="data-table-wrapper">
                ${this.renderToolbar()}
                ${this.renderTable()}
                ${this.renderPagination()}
            </div>
        `;
        
        this.container.innerHTML = html;
        this.elements = {
            wrapper: this.container.querySelector('.data-table-wrapper'),
            toolbar: this.container.querySelector('.data-table-toolbar'),
            table: this.container.querySelector('.data-table'),
            pagination: this.container.querySelector('.data-table-pagination')
        };
    }
    
    renderToolbar() {
        if (!this.options.searchable && !this.options.exportable && !this.options.filterable) {
            return '';
        }
        
        return `
            <div class="data-table-toolbar">
                <div class="toolbar-left">
                    ${this.options.searchable ? this.renderSearch() : ''}
                    ${this.options.filterable ? this.renderFilters() : ''}
                </div>
                <div class="toolbar-right">
                    ${this.renderSelectedActions()}
                    ${this.options.exportable ? this.renderExportButtons() : ''}
                </div>
            </div>
        `;
    }
    
    renderSearch() {
        return `
            <div class="table-search">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <input type="search" class="table-search-input" placeholder="検索..." value="${this.state.searchTerm}">
            </div>
        `;
    }
    
    renderFilters() {
        return `
            <div class="table-filters">
                <button class="filter-button">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M2.5 5H17.5M5 10H15M7.5 15H12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    フィルター
                    ${Object.keys(this.state.filters).length > 0 ? `<span class="filter-badge">${Object.keys(this.state.filters).length}</span>` : ''}
                </button>
            </div>
        `;
    }
    
    renderSelectedActions() {
        const selectedCount = this.state.selectedRows.size;
        if (selectedCount === 0) return '';
        
        return `
            <div class="selected-actions">
                <span class="selected-count">${selectedCount}件選択中</span>
                <button class="btn btn-sm btn-danger" data-action="delete-selected">削除</button>
                <button class="btn btn-sm btn-secondary" data-action="export-selected">エクスポート</button>
            </div>
        `;
    }
    
    renderExportButtons() {
        return `
            <div class="table-export">
                <button class="export-button" data-format="csv">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M11.3333 5.33333L8 2M8 2L4.66667 5.33333M8 2V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    CSV
                </button>
                <button class="export-button" data-format="excel">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V12C4 12.5304 4.21071 13.0391 4.58579 13.4142C4.96086 13.7893 5.46957 14 6 14H10C10.5304 14 11.0391 13.7893 11.4142 13.4142C11.7893 13.0391 12 12.5304 12 12V4C12 3.46957 11.7893 2.96086 11.4142 2.58579C11.0391 2.21071 10.5304 2 10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Excel
                </button>
            </div>
        `;
    }
    
    renderTable() {
        const filteredData = this.getFilteredData();
        const paginatedData = this.getPaginatedData(filteredData);
        
        return `
            <div class="table-container ${this.state.loading ? 'loading' : ''}">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${this.options.selectable ? '<th class="checkbox-column"><input type="checkbox" class="select-all"></th>' : ''}
                            ${this.options.columns.map(col => this.renderColumnHeader(col)).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${paginatedData.length === 0 
                            ? `<tr><td colspan="${this.options.columns.length + (this.options.selectable ? 1 : 0)}" class="empty-message">${this.options.emptyMessage}</td></tr>`
                            : paginatedData.map(row => this.renderRow(row)).join('')
                        }
                    </tbody>
                </table>
                ${this.state.loading ? '<div class="table-loading-overlay"><div class="loading-spinner"></div></div>' : ''}
            </div>
        `;
    }
    
    renderColumnHeader(column) {
        const isSorted = this.state.sortColumn === column.key;
        const sortIcon = !this.options.sortable ? '' : `
            <svg class="sort-icon ${isSorted ? 'active' : ''}" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3L11 6H5L8 3Z" fill="currentColor" opacity="${isSorted && this.state.sortDirection === 'asc' ? '1' : '0.3'}"/>
                <path d="M8 13L5 10H11L8 13Z" fill="currentColor" opacity="${isSorted && this.state.sortDirection === 'desc' ? '1' : '0.3'}"/>
            </svg>
        `;
        
        return `
            <th class="${this.options.sortable ? 'sortable' : ''}" data-column="${column.key}">
                <div class="th-content">
                    <span>${column.label}</span>
                    ${sortIcon}
                </div>
            </th>
        `;
    }
    
    renderRow(row) {
        const isSelected = this.state.selectedRows.has(row.id);
        
        return `
            <tr class="${isSelected ? 'selected' : ''}" data-row-id="${row.id}">
                ${this.options.selectable ? `<td class="checkbox-column"><input type="checkbox" class="select-row" ${isSelected ? 'checked' : ''}></td>` : ''}
                ${this.options.columns.map(col => `
                    <td data-column="${col.key}">
                        ${col.render ? col.render(row[col.key], row) : row[col.key] || '-'}
                    </td>
                `).join('')}
            </tr>
        `;
    }
    
    renderPagination() {
        if (!this.options.paginate) return '';
        
        const filteredData = this.getFilteredData();
        const totalPages = Math.ceil(filteredData.length / this.options.pageSize);
        const currentPage = this.state.currentPage;
        
        if (totalPages <= 1) return '';
        
        return `
            <div class="data-table-pagination">
                <div class="pagination-info">
                    ${((currentPage - 1) * this.options.pageSize) + 1} - ${Math.min(currentPage * this.options.pageSize, filteredData.length)} / ${filteredData.length}件
                </div>
                <div class="pagination-controls">
                    <button class="pagination-btn" data-page="first" ${currentPage === 1 ? 'disabled' : ''}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11 12L7 8L11 4M5 12V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="pagination-btn" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    ${this.renderPageNumbers(totalPages)}
                    <button class="pagination-btn" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="pagination-btn" data-page="last" ${currentPage === totalPages ? 'disabled' : ''}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M5 4L9 8L5 12M11 4V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }
    
    renderPageNumbers(totalPages) {
        const currentPage = this.state.currentPage;
        const pageNumbers = [];
        const maxVisible = 5;
        
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        
        for (let i = start; i <= end; i++) {
            pageNumbers.push(`
                <button class="pagination-number ${i === currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `);
        }
        
        return pageNumbers.join('');
    }
    
    attachEventListeners() {
        // 検索
        const searchInput = this.container.querySelector('.table-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.state.searchTerm = e.target.value;
                this.state.currentPage = 1;
                this.update();
            }, 300));
        }
        
        // ソート
        this.container.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.column;
                if (this.state.sortColumn === column) {
                    this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.state.sortColumn = column;
                    this.state.sortDirection = 'asc';
                }
                this.update();
            });
        });
        
        // 行選択
        if (this.options.selectable) {
            // 全選択
            const selectAll = this.container.querySelector('.select-all');
            if (selectAll) {
                selectAll.addEventListener('change', (e) => {
                    const filteredData = this.getFilteredData();
                    const paginatedData = this.getPaginatedData(filteredData);
                    
                    if (e.target.checked) {
                        paginatedData.forEach(row => this.state.selectedRows.add(row.id));
                    } else {
                        paginatedData.forEach(row => this.state.selectedRows.delete(row.id));
                    }
                    
                    this.update();
                });
            }
            
            // 個別選択
            this.container.querySelectorAll('.select-row').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    const rowId = e.target.closest('tr').dataset.rowId;
                    if (e.target.checked) {
                        this.state.selectedRows.add(rowId);
                    } else {
                        this.state.selectedRows.delete(rowId);
                    }
                    this.update();
                });
            });
        }
        
        // ページネーション
        this.container.querySelectorAll('.pagination-btn, .pagination-number').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                const filteredData = this.getFilteredData();
                const totalPages = Math.ceil(filteredData.length / this.options.pageSize);
                
                switch (page) {
                    case 'first':
                        this.state.currentPage = 1;
                        break;
                    case 'prev':
                        this.state.currentPage = Math.max(1, this.state.currentPage - 1);
                        break;
                    case 'next':
                        this.state.currentPage = Math.min(totalPages, this.state.currentPage + 1);
                        break;
                    case 'last':
                        this.state.currentPage = totalPages;
                        break;
                    default:
                        this.state.currentPage = parseInt(page);
                }
                
                this.update();
            });
        });
        
        // エクスポート
        this.container.querySelectorAll('.export-button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.export(btn.dataset.format);
            });
        });
        
        // 選択アクション
        this.container.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleAction(action);
            });
        });
    }
    
    getFilteredData() {
        let data = [...this.options.data];
        
        // 検索フィルター
        if (this.state.searchTerm) {
            const searchTerm = this.state.searchTerm.toLowerCase();
            data = data.filter(row => {
                return this.options.columns.some(col => {
                    const value = row[col.key];
                    return value && value.toString().toLowerCase().includes(searchTerm);
                });
            });
        }
        
        // カスタムフィルター
        Object.entries(this.state.filters).forEach(([key, value]) => {
            if (value) {
                data = data.filter(row => row[key] === value);
            }
        });
        
        // ソート
        if (this.state.sortColumn) {
            data.sort((a, b) => {
                const aVal = a[this.state.sortColumn];
                const bVal = b[this.state.sortColumn];
                
                if (aVal === bVal) return 0;
                
                const result = aVal < bVal ? -1 : 1;
                return this.state.sortDirection === 'asc' ? result : -result;
            });
        }
        
        return data;
    }
    
    getPaginatedData(data) {
        if (!this.options.paginate) return data;
        
        const start = (this.state.currentPage - 1) * this.options.pageSize;
        const end = start + this.options.pageSize;
        
        return data.slice(start, end);
    }
    
    update() {
        this.render();
        this.attachEventListeners();
        
        // カスタムイベント発火
        this.container.dispatchEvent(new CustomEvent('table:updated', {
            detail: {
                data: this.getFilteredData(),
                state: this.state
            }
        }));
    }
    
    setData(data) {
        this.options.data = data;
        this.state.currentPage = 1;
        this.state.selectedRows.clear();
        this.update();
    }
    
    setLoading(loading) {
        this.state.loading = loading;
        this.update();
    }
    
    export(format) {
        const data = this.state.selectedRows.size > 0 
            ? this.options.data.filter(row => this.state.selectedRows.has(row.id))
            : this.getFilteredData();
        
        switch (format) {
            case 'csv':
                this.exportCSV(data);
                break;
            case 'excel':
                this.exportExcel(data);
                break;
        }
    }
    
    exportCSV(data) {
        const headers = this.options.columns.map(col => col.label);
        const rows = data.map(row => 
            this.options.columns.map(col => row[col.key] || '')
        );
        
        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }
    
    exportExcel(data) {
        // 実際のExcelエクスポートはサーバーサイドで処理
        showNotification('Excel形式でのエクスポートを準備中...', 'info');
        
        // APIコール例
        fetch('/api/export/excel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: data,
                columns: this.options.columns
            })
        })
        .then(res => res.blob())
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `export_${new Date().toISOString().split('T')[0]}.xlsx`;
            link.click();
        });
    }
    
    handleAction(action) {
        switch (action) {
            case 'delete-selected':
                if (confirm(`${this.state.selectedRows.size}件のデータを削除しますか？`)) {
                    this.deleteSelected();
                }
                break;
            case 'export-selected':
                this.export('csv');
                break;
        }
    }
    
    deleteSelected() {
        // 実際の削除処理
        showNotification(`${this.state.selectedRows.size}件のデータを削除しました`, 'success');
        
        // データから削除
        this.options.data = this.options.data.filter(row => !this.state.selectedRows.has(row.id));
        this.state.selectedRows.clear();
        this.update();
    }
}

// エクスポート
window.DataTable = DataTable;