/**
 * スケジュール管理機能
 */
const ScheduleManager = {
    currentEventId: null,
    isEditMode: false,
    currentView: 'list', // 'list' or 'calendar'
    currentMonth: new Date(),

    // 初期化
    init() {
        this.bindEvents();
        this.initFilters();
        this.renderCalendar();
    },

    // イベントバインディング
    bindEvents() {
        // フォーム送信
        const form = document.getElementById('eventForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // 検索・フィルター機能
        const searchInput = document.getElementById('scheduleSearchInput');
        const typeFilter = document.getElementById('typeFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyFilters());
        }
        
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
    },

    // フィルター初期化
    initFilters() {
        this.applyFilters();
    },

    // ビュー切り替え
    toggleView() {
        const calendarView = document.getElementById('calendarView');
        const listView = document.getElementById('listView');
        const toggleText = document.getElementById('viewToggleText');
        
        if (this.currentView === 'list') {
            this.currentView = 'calendar';
            calendarView.style.display = 'block';
            listView.style.display = 'none';
            toggleText.textContent = 'リスト表示';
            this.renderCalendar();
        } else {
            this.currentView = 'list';
            calendarView.style.display = 'none';
            listView.style.display = 'block';
            toggleText.textContent = 'カレンダー表示';
        }
    },

    // カレンダーをレンダリング
    renderCalendar() {
        const calendarBody = document.getElementById('calendarBody');
        if (!calendarBody) return;
        
        // カレンダーをクリア
        calendarBody.innerHTML = '';
        
        // 現在の月の情報を取得
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // モックイベントデータ
        const events = [
            { date: '2024-01-15', title: '決算発表', type: 'earnings' },
            { date: '2024-01-22', title: 'IR説明会', type: 'briefing' },
            { date: '2024-01-25', title: '投資家面談', type: 'meeting' }
        ];
        
        // カレンダーの日付を生成
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            
            // 今日の日付をハイライト
            if (currentDate.toDateString() === today.toDateString()) {
                dayDiv.classList.add('today');
            }
            
            // 当月以外の日付をグレーアウト
            if (currentDate.getMonth() !== month) {
                dayDiv.classList.add('other-month');
            }
            
            // 日付番号
            const dayNumber = document.createElement('div');
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = currentDate.getDate();
            dayDiv.appendChild(dayNumber);
            
            // イベントを追加
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayEvents = events.filter(e => e.date === dateStr);
            
            dayEvents.forEach(event => {
                const eventDiv = document.createElement('div');
                eventDiv.className = `calendar-event type-${event.type}`;
                eventDiv.textContent = event.title;
                eventDiv.onclick = () => this.showEventDetails(event);
                dayDiv.appendChild(eventDiv);
            });
            
            calendarBody.appendChild(dayDiv);
        }
    },

    // 前月へ
    previousMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
        this.renderCalendar();
        this.updateMonthDisplay();
    },

    // 次月へ
    nextMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
        this.renderCalendar();
        this.updateMonthDisplay();
    },

    // 月表示を更新
    updateMonthDisplay() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth() + 1;
        const monthDisplay = `${year}年${month}月`;
        
        // 実際の実装では、ここで月表示を更新
        console.log(monthDisplay);
    },

    // 新規作成モーダルを開く
    openCreateModal() {
        this.isEditMode = false;
        this.currentEventId = null;
        
        document.getElementById('modalTitle').textContent = '新規イベント登録';
        document.getElementById('submitBtnText').textContent = '登録';
        document.getElementById('eventForm').reset();
        
        // デフォルト値を設定
        document.getElementById('eventStatus').value = 'scheduled';
        
        document.getElementById('eventModal').classList.remove('hidden');
    },

    // 編集モーダルを開く
    editEvent(eventId) {
        this.isEditMode = true;
        this.currentEventId = eventId;
        
        document.getElementById('modalTitle').textContent = 'イベント編集';
        document.getElementById('submitBtnText').textContent = '更新';
        
        // モック：実際の実装では、APIからイベント情報を取得
        const mockEvent = {
            title: '2024年第3四半期決算発表',
            type: 'earnings',
            status: 'scheduled',
            date: '2024-01-15',
            time: '15:00',
            location: '本社会議室',
            description: '第3四半期の決算内容を発表します',
            assignee: 'IR部門責任者'
        };
        
        document.getElementById('eventTitle').value = mockEvent.title;
        document.getElementById('eventType').value = mockEvent.type;
        document.getElementById('eventStatus').value = mockEvent.status;
        document.getElementById('eventDate').value = mockEvent.date;
        document.getElementById('eventTime').value = mockEvent.time;
        document.getElementById('eventLocation').value = mockEvent.location;
        document.getElementById('eventDescription').value = mockEvent.description;
        document.getElementById('eventAssignee').value = mockEvent.assignee;
        
        document.getElementById('eventModal').classList.remove('hidden');
    },

    // モーダルを閉じる
    closeModal() {
        document.getElementById('eventModal').classList.add('hidden');
        document.getElementById('eventForm').reset();
        this.isEditMode = false;
        this.currentEventId = null;
    },

    // フォーム送信処理
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('eventTitle').value,
            type: document.getElementById('eventType').value,
            status: document.getElementById('eventStatus').value,
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            location: document.getElementById('eventLocation').value,
            description: document.getElementById('eventDescription').value,
            assignee: document.getElementById('eventAssignee').value
        };
        
        // モック：実際の実装では、APIにPOST/PUT
        if (this.isEditMode) {
            NotificationManager.show('success', 'イベントを更新しました');
        } else {
            NotificationManager.show('success', 'イベントを登録しました');
        }
        
        this.closeModal();
        
        // 実際の実装では、ここで一覧を更新
        setTimeout(() => location.reload(), 1000);
    },

    // イベント削除
    deleteEvent(eventId) {
        if (confirm('このイベントを削除してもよろしいですか？')) {
            // モック：実際の実装では、APIにDELETE
            NotificationManager.show('success', 'イベントを削除しました');
            
            // 実際の実装では、ここで一覧を更新
            setTimeout(() => location.reload(), 1000);
        }
    },

    // イベント詳細を表示
    showEventDetails(event) {
        // モック：実際の実装では、イベント詳細モーダルを表示
        alert(`イベント: ${event.title}\n日付: ${event.date}\n種類: ${event.type}`);
    },

    // フィルター適用
    applyFilters() {
        const searchTerm = (document.getElementById('scheduleSearchInput')?.value || '').toLowerCase();
        const typeFilter = document.getElementById('typeFilter')?.value;
        const statusFilter = document.getElementById('statusFilter')?.value;
        
        const rows = document.querySelectorAll('#eventsTableBody tr');
        let visibleCount = 0;
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const typeCell = row.querySelector('td:nth-child(3) .badge');
            const statusCell = row.querySelector('td:nth-child(5) .badge');
            
            const matchesSearch = text.includes(searchTerm);
            const matchesType = !typeFilter || this.getTypeFromDisplay(typeCell?.textContent.trim()) === typeFilter;
            const matchesStatus = !statusFilter || this.getStatusFromDisplay(statusCell?.textContent.trim()) === statusFilter;
            
            const shouldShow = matchesSearch && matchesType && matchesStatus;
            row.style.display = shouldShow ? '' : 'none';
            
            if (shouldShow) visibleCount++;
        });
        
        console.log(`${visibleCount} 件のイベントを表示`);
    },

    // 表示名から種類を取得
    getTypeFromDisplay(displayName) {
        const typeMap = {
            '決算発表': 'earnings',
            '説明会': 'briefing',
            '株主総会': 'meeting',
            'その他': 'other'
        };
        return typeMap[displayName] || 'other';
    },

    // 表示名からステータスを取得
    getStatusFromDisplay(displayName) {
        const statusMap = {
            '予定': 'scheduled',
            '準備中': 'preparing',
            '完了': 'completed'
        };
        return statusMap[displayName] || 'scheduled';
    }
};

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', () => {
    ScheduleManager.init();
});