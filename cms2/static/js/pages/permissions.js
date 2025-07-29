/**
 * 権限管理機能
 */
const PermissionManager = {
    currentRoleId: null,
    isEditMode: false,

    // 初期化
    init() {
        this.bindEvents();
    },

    // イベントバインディング
    bindEvents() {
        // ロールフォーム送信
        const roleForm = document.getElementById('roleForm');
        if (roleForm) {
            roleForm.addEventListener('submit', (e) => this.handleRoleSubmit(e));
        }
    },

    // ロールモーダルを開く
    openRoleModal() {
        this.isEditMode = false;
        this.currentRoleId = null;
        
        document.getElementById('roleModalTitle').textContent = '新規ロール作成';
        document.getElementById('roleSubmitText').textContent = '作成';
        document.getElementById('roleForm').reset();
        document.getElementById('roleModal').classList.remove('hidden');
    },

    // ロール編集
    editRole(roleId) {
        this.isEditMode = true;
        this.currentRoleId = roleId;
        
        document.getElementById('roleModalTitle').textContent = 'ロール編集';
        document.getElementById('roleSubmitText').textContent = '更新';
        
        // モック：実際の実装では、APIからロール情報を取得
        const mockRole = {
            name: 'コンテンツ編集者',
            description: 'コンテンツの作成・編集権限を持つロール',
            permissions: ['view', 'create', 'edit']
        };
        
        document.getElementById('roleName').value = mockRole.name;
        document.getElementById('roleDescription').value = mockRole.description;
        
        // 権限チェックボックスを設定
        document.querySelectorAll('input[name="basic_permissions"]').forEach(checkbox => {
            checkbox.checked = mockRole.permissions.includes(checkbox.value);
        });
        
        document.getElementById('roleModal').classList.remove('hidden');
    },

    // ロールモーダルを閉じる
    closeRoleModal() {
        document.getElementById('roleModal').classList.add('hidden');
        document.getElementById('roleForm').reset();
        this.isEditMode = false;
        this.currentRoleId = null;
    },

    // ロールフォーム送信
    handleRoleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('roleName').value,
            description: document.getElementById('roleDescription').value,
            permissions: Array.from(document.querySelectorAll('input[name="basic_permissions"]:checked'))
                              .map(cb => cb.value)
        };
        
        // モック：実際の実装では、APIにPOST/PUT
        if (this.isEditMode) {
            NotificationManager.show('success', 'ロールを更新しました');
        } else {
            NotificationManager.show('success', '新規ロールを作成しました');
        }
        
        this.closeRoleModal();
        
        // 実際の実装では、ここでロール一覧を更新
        setTimeout(() => location.reload(), 1000);
    },

    // ロール削除
    deleteRole(roleId) {
        if (confirm('このロールを削除してもよろしいですか？\n関連するユーザーの権限も変更されます。')) {
            // モック：実際の実装では、APIにDELETE
            NotificationManager.show('success', 'ロールを削除しました');
            
            // 実際の実装では、ここでロール一覧を更新
            setTimeout(() => location.reload(), 1000);
        }
    },

    // 権限詳細表示
    showPermissions(roleId) {
        // モック：実際の実装では、権限詳細モーダルを表示
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container modal-lg">
                <div class="modal-header">
                    <h3 class="modal-title">ロール権限詳細</h3>
                    <button onclick="this.closest('.modal-overlay').remove()" class="modal-close">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="space-y-4">
                        <div>
                            <h4 class="font-semibold mb-2">ダッシュボード</h4>
                            <div class="grid grid-cols-2 gap-3">
                                <label class="checkbox-label">
                                    <input type="checkbox" class="checkbox-input" checked>
                                    <span>ダッシュボード閲覧</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" class="checkbox-input" checked>
                                    <span>レポート生成</span>
                                </label>
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="font-semibold mb-2">ドキュメント管理</h4>
                            <div class="grid grid-cols-2 gap-3">
                                <label class="checkbox-label">
                                    <input type="checkbox" class="checkbox-input" checked>
                                    <span>ドキュメント閲覧</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" class="checkbox-input" checked>
                                    <span>ドキュメント作成</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" class="checkbox-input" checked>
                                    <span>ドキュメント編集</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" class="checkbox-input">
                                    <span>ドキュメント削除</span>
                                </label>
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="font-semibold mb-2">投資家管理</h4>
                            <div class="grid grid-cols-2 gap-3">
                                <label class="checkbox-label">
                                    <input type="checkbox" class="checkbox-input" checked>
                                    <span>投資家情報閲覧</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" class="checkbox-input">
                                    <span>投資家情報編集</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">
                        閉じる
                    </button>
                    <button onclick="PermissionManager.saveDetailedPermissions(${roleId})" class="btn btn-primary">
                        保存
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    // 詳細権限保存
    saveDetailedPermissions(roleId) {
        // モック：実際の実装では、APIに権限設定を送信
        NotificationManager.show('success', '権限設定を保存しました');
        document.querySelector('.modal-overlay').remove();
    },

    // 権限更新（マトリックス）
    updatePermission(roleId, permissionId, isChecked) {
        // モック：実際の実装では、APIに権限変更を送信
        console.log(`Update permission: Role ${roleId}, Permission ${permissionId}, Checked: ${isChecked}`);
        
        // 一時的な通知（実際はサイレントで更新）
        if (isChecked) {
            NotificationManager.show('info', '権限を付与しました', 2000);
        } else {
            NotificationManager.show('info', '権限を削除しました', 2000);
        }
    },

    // APIキー生成
    generateApiKey() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h3 class="modal-title">新規APIキー生成</h3>
                    <button onclick="this.closest('.modal-overlay').remove()" class="modal-close">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <form onsubmit="PermissionManager.createApiKey(event)" class="modal-body">
                    <div class="form-group">
                        <label class="form-label">キー名 <span class="required">*</span></label>
                        <input type="text" id="apiKeyName" class="form-input" placeholder="例：外部システム連携用" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">権限スコープ</label>
                        <select id="apiKeyScope" class="form-select">
                            <option value="read">読み取り専用</option>
                            <option value="write">読み書き</option>
                            <option value="admin">管理者</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">有効期限</label>
                        <select id="apiKeyExpiry" class="form-select">
                            <option value="30">30日</option>
                            <option value="90">90日</option>
                            <option value="365">1年</option>
                            <option value="0">無期限</option>
                        </select>
                    </div>
                    
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                        <p class="text-yellow-800">
                            <strong>注意:</strong> 生成されたAPIキーは一度しか表示されません。必ず安全な場所に保管してください。
                        </p>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">
                            キャンセル
                        </button>
                        <button type="submit" class="btn btn-primary">
                            生成
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    // APIキー作成
    createApiKey(e) {
        e.preventDefault();
        
        const keyData = {
            name: document.getElementById('apiKeyName').value,
            scope: document.getElementById('apiKeyScope').value,
            expiry: document.getElementById('apiKeyExpiry').value
        };
        
        // モック：実際の実装では、APIでキーを生成
        const mockApiKey = 'sk-' + Math.random().toString(36).substr(2, 32);
        
        // モーダルを閉じる
        document.querySelector('.modal-overlay').remove();
        
        // APIキー表示モーダル
        this.showGeneratedApiKey(mockApiKey);
    },

    // 生成されたAPIキーを表示
    showGeneratedApiKey(apiKey) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h3 class="modal-title">APIキーが生成されました</h3>
                </div>
                <div class="modal-body">
                    <div class="bg-gray-50 p-4 rounded-lg mb-4">
                        <code class="text-sm font-mono break-all">${apiKey}</code>
                    </div>
                    
                    <div class="flex justify-end mb-4">
                        <button onclick="PermissionManager.copyApiKey('${apiKey}')" class="btn btn-sm btn-secondary">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                            </svg>
                            コピー
                        </button>
                    </div>
                    
                    <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                        <p class="text-red-800">
                            <strong>重要:</strong> このAPIキーは二度と表示されません。今すぐコピーして安全な場所に保管してください。
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-primary">
                        完了
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    // APIキー編集
    editApiKey(keyId) {
        // モック：実際の実装では、編集モーダルを表示
        NotificationManager.show('info', 'APIキー編集機能は開発中です');
    },

    // APIキー有効/無効切り替え
    toggleApiKey(keyId, isActive) {
        const action = isActive ? '無効化' : '有効化';
        
        if (confirm(`このAPIキーを${action}しますか？`)) {
            // モック：実際の実装では、APIに状態変更を送信
            NotificationManager.show('success', `APIキーを${action}しました`);
            
            // 実際の実装では、ここでテーブルを更新
            setTimeout(() => location.reload(), 1000);
        }
    },

    // APIキーをクリップボードにコピー
    copyApiKey(key) {
        navigator.clipboard.writeText(key).then(() => {
            NotificationManager.show('success', 'APIキーをクリップボードにコピーしました');
        }).catch(() => {
            NotificationManager.show('error', 'コピーに失敗しました');
        });
    }
};

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', () => {
    PermissionManager.init();
});