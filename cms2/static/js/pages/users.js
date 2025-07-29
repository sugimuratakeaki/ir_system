/**
 * ユーザー管理機能
 */
const UserManager = {
    currentUserId: null,
    isEditMode: false,

    // 初期化
    init() {
        this.bindEvents();
        this.initFilters();
    },

    // イベントバインディング
    bindEvents() {
        // フォーム送信
        const form = document.getElementById('userForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // 検索機能
        const searchInput = document.getElementById('userSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        // フィルター
        const roleFilter = document.getElementById('roleFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (roleFilter) {
            roleFilter.addEventListener('change', () => this.applyFilters());
        }
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
    },

    // フィルター初期化
    initFilters() {
        this.applyFilters();
    },

    // 新規作成モーダルを開く
    openCreateModal() {
        this.isEditMode = false;
        this.currentUserId = null;
        
        document.getElementById('modalTitle').textContent = '新規ユーザー追加';
        document.getElementById('submitBtnText').textContent = '追加';
        document.getElementById('userForm').reset();
        document.getElementById('userModal').classList.remove('hidden');
    },

    // 編集モーダルを開く
    editUser(userId) {
        this.isEditMode = true;
        this.currentUserId = userId;
        
        document.getElementById('modalTitle').textContent = 'ユーザー編集';
        document.getElementById('submitBtnText').textContent = '更新';
        
        // モック：実際の実装では、APIからユーザー情報を取得
        const mockUser = {
            name: '山田 太郎',
            email: 'yamada@example.com',
            department: 'IR部',
            role: 'editor'
        };
        
        document.getElementById('userName').value = mockUser.name;
        document.getElementById('userEmail').value = mockUser.email;
        document.getElementById('userDepartment').value = mockUser.department;
        document.getElementById('userRole').value = mockUser.role;
        
        document.getElementById('userModal').classList.remove('hidden');
    },

    // モーダルを閉じる
    closeModal() {
        document.getElementById('userModal').classList.add('hidden');
        document.getElementById('userForm').reset();
        this.isEditMode = false;
        this.currentUserId = null;
    },

    // フォーム送信処理
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            department: document.getElementById('userDepartment').value,
            role: document.getElementById('userRole').value
        };
        
        // モック：実際の実装では、APIにPOST/PUT
        if (this.isEditMode) {
            NotificationManager.show('success', 'ユーザー情報を更新しました');
        } else {
            NotificationManager.show('success', '新規ユーザーを追加しました');
        }
        
        this.closeModal();
        
        // 実際の実装では、ここでテーブルを更新
        setTimeout(() => location.reload(), 1000);
    },

    // ステータス切り替え
    toggleStatus(userId, currentStatus) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const action = newStatus === 'active' ? '有効化' : '無効化';
        
        if (confirm(`このユーザーを${action}しますか？`)) {
            // モック：実際の実装では、APIにPUT
            NotificationManager.show('success', `ユーザーを${action}しました`);
            
            // 実際の実装では、ここでテーブルを更新
            setTimeout(() => location.reload(), 1000);
        }
    },

    // 検索処理
    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#usersTableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
        
        this.updateResultCount();
    },

    // フィルター適用
    applyFilters() {
        const roleFilter = document.getElementById('roleFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const rows = document.querySelectorAll('#usersTableBody tr');
        
        rows.forEach(row => {
            let shouldShow = true;
            
            // 役割フィルター
            if (roleFilter) {
                const roleCell = row.querySelector('td:nth-child(2) .badge');
                const userRole = this.getRoleFromDisplay(roleCell.textContent.trim());
                if (userRole !== roleFilter) {
                    shouldShow = false;
                }
            }
            
            // ステータスフィルター
            if (statusFilter && shouldShow) {
                const statusCell = row.querySelector('td:nth-child(4) .badge');
                const userStatus = statusCell.textContent.trim() === 'アクティブ' ? 'active' : 'inactive';
                if (userStatus !== statusFilter) {
                    shouldShow = false;
                }
            }
            
            row.style.display = shouldShow ? '' : 'none';
        });
        
        this.updateResultCount();
    },

    // 表示名から役割を取得
    getRoleFromDisplay(displayName) {
        const roleMap = {
            '管理者': 'admin',
            '編集者': 'editor',
            '閲覧者': 'viewer'
        };
        return roleMap[displayName] || 'viewer';
    },

    // 結果数を更新
    updateResultCount() {
        const visibleRows = document.querySelectorAll('#usersTableBody tr:not([style*="display: none"])');
        const totalRows = document.querySelectorAll('#usersTableBody tr');
        
        // 結果数の表示（実装する場合）
        console.log(`${visibleRows.length} / ${totalRows.length} ユーザーを表示`);
    }
};

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', () => {
    UserManager.init();
});