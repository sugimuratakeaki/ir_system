/**
 * ニュース管理機能
 */
const NewsManager = {
    currentArticleId: null,
    isEditMode: false,

    // 初期化
    init() {
        this.bindEvents();
        this.initFilters();
    },

    // イベントバインディング
    bindEvents() {
        // フォーム送信
        const form = document.getElementById('newsForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // 検索・フィルター機能
        const searchInput = document.getElementById('newsSearchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        const sortOrder = document.getElementById('sortOrder');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyFilters());
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (sortOrder) {
            sortOrder.addEventListener('change', () => this.sortArticles());
        }
    },

    // フィルター初期化
    initFilters() {
        this.applyFilters();
    },

    // 新規作成モーダルを開く
    openCreateModal() {
        this.isEditMode = false;
        this.currentArticleId = null;
        
        document.getElementById('modalTitle').textContent = '新規ニュース作成';
        document.getElementById('submitBtnText').textContent = '公開';
        document.getElementById('newsForm').reset();
        
        // 現在日時を設定
        const now = new Date();
        const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, -8);
        document.getElementById('publishDate').value = localISOTime;
        
        document.getElementById('newsModal').classList.remove('hidden');
    },

    // 編集モーダルを開く
    editArticle(articleId) {
        this.isEditMode = true;
        this.currentArticleId = articleId;
        
        document.getElementById('modalTitle').textContent = 'ニュース編集';
        document.getElementById('submitBtnText').textContent = '更新';
        
        // モック：実際の実装では、APIから記事情報を取得
        const mockArticle = {
            category: 'ir',
            title: '2024年第3四半期決算発表のお知らせ',
            content: '2024年第3四半期の決算を発表いたします。詳細は添付資料をご確認ください。',
            publishDate: '2024-01-25T10:00',
            isImportant: true,
            sendEmail: false
        };
        
        document.getElementById('newsCategory').value = mockArticle.category;
        document.getElementById('newsTitle').value = mockArticle.title;
        document.getElementById('newsContent').value = mockArticle.content;
        document.getElementById('publishDate').value = mockArticle.publishDate;
        document.getElementById('isImportant').checked = mockArticle.isImportant;
        document.getElementById('sendEmail').checked = mockArticle.sendEmail;
        
        document.getElementById('newsModal').classList.remove('hidden');
    },

    // モーダルを閉じる
    closeModal() {
        document.getElementById('newsModal').classList.add('hidden');
        document.getElementById('newsForm').reset();
        this.isEditMode = false;
        this.currentArticleId = null;
    },

    // フォーム送信処理
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            category: document.getElementById('newsCategory').value,
            title: document.getElementById('newsTitle').value,
            content: document.getElementById('newsContent').value,
            publishDate: document.getElementById('publishDate').value,
            isImportant: document.getElementById('isImportant').checked,
            sendEmail: document.getElementById('sendEmail').checked,
            status: 'published'
        };
        
        // モック：実際の実装では、APIにPOST/PUT
        if (this.isEditMode) {
            NotificationManager.show('success', 'ニュースを更新しました');
        } else {
            NotificationManager.show('success', 'ニュースを公開しました');
        }
        
        this.closeModal();
        
        // 実際の実装では、ここで一覧を更新
        setTimeout(() => location.reload(), 1000);
    },

    // 下書き保存
    saveDraft() {
        const formData = {
            category: document.getElementById('newsCategory').value,
            title: document.getElementById('newsTitle').value,
            content: document.getElementById('newsContent').value,
            publishDate: document.getElementById('publishDate').value,
            isImportant: document.getElementById('isImportant').checked,
            sendEmail: document.getElementById('sendEmail').checked,
            status: 'draft'
        };
        
        // モック：実際の実装では、APIにPOST/PUT
        NotificationManager.show('success', '下書きとして保存しました');
        this.closeModal();
        
        // 実際の実装では、ここで一覧を更新
        setTimeout(() => location.reload(), 1000);
    },

    // ステータス切り替え
    toggleStatus(articleId, currentStatus) {
        const newStatus = currentStatus === 'published' ? 'draft' : 'published';
        const action = newStatus === 'published' ? '公開' : '非公開に';
        
        if (confirm(`この記事を${action}しますか？`)) {
            // モック：実際の実装では、APIにPUT
            NotificationManager.show('success', `記事を${action}しました`);
            
            // 実際の実装では、ここで一覧を更新
            setTimeout(() => location.reload(), 1000);
        }
    },

    // 記事削除
    deleteArticle(articleId) {
        if (confirm('この記事を削除してもよろしいですか？\nこの操作は取り消せません。')) {
            // モック：実際の実装では、APIにDELETE
            NotificationManager.show('success', '記事を削除しました');
            
            // 実際の実装では、ここで一覧を更新
            setTimeout(() => location.reload(), 1000);
        }
    },

    // フィルター適用
    applyFilters() {
        const searchTerm = (document.getElementById('newsSearchInput')?.value || '').toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter')?.value;
        const statusFilter = document.getElementById('statusFilter')?.value;
        
        const newsItems = document.querySelectorAll('.news-item');
        let visibleCount = 0;
        
        newsItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const category = item.dataset.category;
            const status = item.dataset.status;
            
            const matchesSearch = text.includes(searchTerm);
            const matchesCategory = !categoryFilter || category === categoryFilter;
            const matchesStatus = !statusFilter || status === statusFilter;
            
            const shouldShow = matchesSearch && matchesCategory && matchesStatus;
            item.style.display = shouldShow ? '' : 'none';
            
            if (shouldShow) visibleCount++;
        });
        
        // 結果数の表示（実装する場合）
        console.log(`${visibleCount} 件の記事を表示`);
    },

    // 記事のソート
    sortArticles() {
        const sortOrder = document.getElementById('sortOrder')?.value || 'newest';
        const newsList = document.getElementById('newsList');
        const newsItems = Array.from(document.querySelectorAll('.news-item'));
        
        // ソート処理（モック）
        newsItems.sort((a, b) => {
            switch (sortOrder) {
                case 'oldest':
                    // 実際の実装では、日付でソート
                    return 0;
                case 'title':
                    const titleA = a.querySelector('h3').textContent;
                    const titleB = b.querySelector('h3').textContent;
                    return titleA.localeCompare(titleB);
                default: // newest
                    return 0;
            }
        });
        
        // DOM再配置
        newsList.innerHTML = '';
        newsItems.forEach(item => newsList.appendChild(item));
        
        // フィルターを再適用
        this.applyFilters();
    },

    // カテゴリーの表示名を取得
    getCategoryDisplay(category) {
        const categoryMap = {
            'press': 'プレスリリース',
            'ir': 'IR情報',
            'event': 'イベント',
            'notice': 'お知らせ'
        };
        return categoryMap[category] || category;
    }
};

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', () => {
    NewsManager.init();
});