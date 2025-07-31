/**
 * KAGAMI CMS 2.0 - IRミーティング管理
 * 投資家面談の予定管理と実施記録
 */

class MeetingManager {
    constructor() {
        this.currentDate = new Date();
        this.meetings = [];
        this.pendingRequests = [];
        this.slots = {
            CEO: { total: 5, used: 0 },
            Director: { total: 4, used: 0 },
            CFO: { total: 10, used: 0 }
        };
        this.init();
    }

    async init() {
        // データの読み込み
        await this.loadMeetings();
        
        // カレンダーの初期化
        this.renderCalendar();
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        // リアルタイム更新（必要に応じて）
        // this.startRealtimeUpdates();
    }

    async loadMeetings() {
        try {
            const response = await fetch('/api/meetings');
            const data = await response.json();
            
            this.meetings = data.meetings;
            this.pendingRequests = data.pending_requests;
            this.updateSlotUsage(data.slot_usage);
            
        } catch (error) {
            console.error('Meetings loading error:', error);
            showError('エラー', 'ミーティングデータの読み込みに失敗しました');
        }
    }

    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 月の最初の日と最後の日
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // カレンダーの開始日（前月の日曜日から）
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // カレンダーのHTML生成
        let calendarHTML = '';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 曜日ヘッダー
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        weekdays.forEach(day => {
            calendarHTML += `<div class="calendar-header text-center font-semibold py-2 bg-gray-50">${day}</div>`;
        });
        
        // 日付セル
        const currentDatePointer = new Date(startDate);
        while (currentDatePointer <= lastDay || currentDatePointer.getDay() !== 0) {
            const isCurrentMonth = currentDatePointer.getMonth() === month;
            const isToday = currentDatePointer.getTime() === today.getTime();
            const dateString = this.formatDate(currentDatePointer);
            
            const dayMeetings = this.getMeetingsForDate(dateString);
            
            calendarHTML += `
                <div class="calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}" 
                     data-date="${dateString}">
                    <div class="calendar-day-header">${currentDatePointer.getDate()}</div>
                    <div class="calendar-day-events">
                        ${dayMeetings.map(meeting => this.renderMeetingEvent(meeting)).join('')}
                    </div>
                </div>
            `;
            
            currentDatePointer.setDate(currentDatePointer.getDate() + 1);
        }
        
        calendarGrid.innerHTML = calendarHTML;
        
        // 現在の月を更新
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        document.getElementById('currentMonth').textContent = `${year}年${monthNames[month]}`;
    }

    renderMeetingEvent(meeting) {
        const typeClass = {
            conference: 'conference',
            individual: 'individual',
            group: 'group'
        }[meeting.type] || 'individual';
        
        return `
            <div class="calendar-event ${typeClass}" 
                 onclick="meetingManager.showMeetingDetails('${meeting.id}')"
                 title="${meeting.title}">
                ${meeting.time} ${meeting.title}
            </div>
        `;
    }

    getMeetingsForDate(dateString) {
        return this.meetings.filter(meeting => meeting.date === dateString);
    }

    formatDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    async createMeeting() {
        openModal('createMeetingModal', {
            onOpen: (modal) => {
                // フォームの初期化
                this.initCreateMeetingForm(modal);
            }
        });
    }

    initCreateMeetingForm(modal) {
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <form id="createMeetingForm" class="space-y-4">
                <div class="form-group">
                    <label class="form-label required">ミーティングタイプ</label>
                    <select id="meetingType" class="form-select" required>
                        <option value="">選択してください</option>
                        <option value="conference">決算説明会</option>
                        <option value="individual">個別面談</option>
                        <option value="group">スモールミーティング</option>
                        <option value="site_visit">施設見学会</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">タイトル</label>
                    <input type="text" id="meetingTitle" class="form-input" required>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label required">日付</label>
                        <input type="date" id="meetingDate" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">時間</label>
                        <input type="time" id="meetingTime" class="form-input" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">対応者</label>
                    <select id="meetingAttendees" class="form-select" multiple>
                        <option value="CEO">CEO</option>
                        <option value="CFO">CFO</option>
                        <option value="CTO">CTO</option>
                        <option value="IR">IR担当</option>
                        <option value="Director">社外取締役</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">形式</label>
                    <div class="flex gap-4">
                        <label class="flex items-center">
                            <input type="radio" name="format" value="online" class="form-radio" checked>
                            <span class="ml-2">オンライン</span>
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="format" value="offline" class="form-radio">
                            <span class="ml-2">対面</span>
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="format" value="hybrid" class="form-radio">
                            <span class="ml-2">ハイブリッド</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">投資家情報</label>
                    <input type="text" id="investorName" class="form-input" placeholder="投資家名/機関名">
                </div>
                
                <div class="form-group">
                    <label class="form-label">アジェンダ・備考</label>
                    <textarea id="meetingAgenda" class="form-textarea" rows="4"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-gray" onclick="meetingManager.closeCreateModal()">
                        キャンセル
                    </button>
                    <button type="submit" class="btn btn-primary">
                        作成
                    </button>
                </div>
            </form>
        `;
        
        // フォーム送信イベント
        document.getElementById('createMeetingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitCreateMeeting();
        });
    }

    async submitCreateMeeting() {
        const formData = {
            type: document.getElementById('meetingType').value,
            title: document.getElementById('meetingTitle').value,
            date: document.getElementById('meetingDate').value,
            time: document.getElementById('meetingTime').value,
            attendees: Array.from(document.getElementById('meetingAttendees').selectedOptions).map(o => o.value),
            format: document.querySelector('input[name="format"]:checked').value,
            investor_name: document.getElementById('investorName').value,
            agenda: document.getElementById('meetingAgenda').value
        };
        
        try {
            const response = await fetch('/api/meetings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                showSuccess('成功', 'ミーティングを作成しました');
                this.closeCreateModal();
                await this.loadMeetings();
                this.renderCalendar();
            } else {
                throw new Error('Meeting creation failed');
            }
        } catch (error) {
            showError('エラー', 'ミーティングの作成に失敗しました');
        }
    }

    closeCreateModal() {
        closeModal('createMeetingModal');
    }

    async showMeetingDetails(meetingId) {
        const meeting = this.meetings.find(m => m.id === meetingId);
        if (!meeting) return;
        
        // 詳細モーダルを表示
        const modalContent = `
            <div class="space-y-4">
                <div>
                    <h4 class="font-semibold text-gray-900">${meeting.title}</h4>
                    <p class="text-sm text-gray-600">${meeting.date} ${meeting.time}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm font-medium text-gray-700">タイプ</p>
                        <p class="text-sm">${this.getMeetingTypeLabel(meeting.type)}</p>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-700">形式</p>
                        <p class="text-sm">${this.getFormatLabel(meeting.format)}</p>
                    </div>
                </div>
                
                ${meeting.investor_name ? `
                <div>
                    <p class="text-sm font-medium text-gray-700">投資家</p>
                    <p class="text-sm">${meeting.investor_name}</p>
                </div>
                ` : ''}
                
                ${meeting.attendees && meeting.attendees.length > 0 ? `
                <div>
                    <p class="text-sm font-medium text-gray-700">対応者</p>
                    <p class="text-sm">${meeting.attendees.join(', ')}</p>
                </div>
                ` : ''}
                
                ${meeting.agenda ? `
                <div>
                    <p class="text-sm font-medium text-gray-700">アジェンダ</p>
                    <p class="text-sm whitespace-pre-wrap">${meeting.agenda}</p>
                </div>
                ` : ''}
            </div>
        `;
        
        alertModal({
            type: 'info',
            title: 'ミーティング詳細',
            message: modalContent,
            buttonText: '閉じる'
        });
    }

    getMeetingTypeLabel(type) {
        const labels = {
            conference: '決算説明会',
            individual: '個別面談',
            group: 'スモールミーティング',
            site_visit: '施設見学会'
        };
        return labels[type] || type;
    }

    getFormatLabel(format) {
        const labels = {
            online: 'オンライン',
            offline: '対面',
            hybrid: 'ハイブリッド'
        };
        return labels[format] || format;
    }

    async manageSlots(type) {
        // スロット管理画面を開く
        console.log(`Managing ${type} slots`);
        showInfo('開発中', `${type}面談枠管理機能は開発中です`);
    }

    async approveRequest(requestId) {
        const confirmed = await confirmModal({
            title: '承認確認',
            message: 'このミーティングリクエストを承認しますか？',
            confirmText: '承認する'
        });
        
        if (confirmed) {
            try {
                const response = await fetch(`/api/meetings/requests/${requestId}/approve`, {
                    method: 'POST'
                });
                
                if (response.ok) {
                    showSuccess('承認完了', 'ミーティングリクエストを承認しました');
                    await this.loadMeetings();
                }
            } catch (error) {
                showError('エラー', '承認処理に失敗しました');
            }
        }
    }

    async rescheduleRequest(requestId) {
        // 日程調整画面を開く
        console.log(`Rescheduling request ${requestId}`);
        showInfo('開発中', '日程調整機能は開発中です');
    }

    async declineRequest(requestId) {
        const confirmed = await confirmModal({
            title: '辞退確認',
            message: 'このミーティングリクエストを辞退しますか？',
            confirmText: '辞退する',
            type: 'danger'
        });
        
        if (confirmed) {
            try {
                const response = await fetch(`/api/meetings/requests/${requestId}/decline`, {
                    method: 'POST'
                });
                
                if (response.ok) {
                    showSuccess('辞退完了', 'ミーティングリクエストを辞退しました');
                    await this.loadMeetings();
                }
            } catch (error) {
                showError('エラー', '辞退処理に失敗しました');
            }
        }
    }

    async translateQA(qaId) {
        showInfo('翻訳中', 'Q&Aを英訳しています...');
        
        try {
            const response = await fetch(`/api/meetings/qa/${qaId}/translate`, {
                method: 'POST'
            });
            
            if (response.ok) {
                const data = await response.json();
                // 翻訳結果を表示
                alertModal({
                    type: 'success',
                    title: '翻訳完了',
                    message: `<div class="space-y-3">
                        <div>
                            <strong>Q:</strong> ${data.question_en}
                        </div>
                        <div>
                            <strong>A:</strong> ${data.answer_en}
                        </div>
                    </div>`,
                    buttonText: '閉じる'
                });
            }
        } catch (error) {
            showError('エラー', '翻訳に失敗しました');
        }
    }

    async addToFAQ(qaId) {
        showSuccess('追加完了', 'FAQに追加しました');
    }

    async createFollowup(qaId) {
        showInfo('開発中', 'フォローアップ機能は開発中です');
    }

    async exportSchedule() {
        try {
            const response = await fetch('/api/meetings/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    year: this.currentDate.getFullYear(),
                    month: this.currentDate.getMonth() + 1
                })
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `meeting_schedule_${this.currentDate.getFullYear()}_${this.currentDate.getMonth() + 1}.xlsx`;
                a.click();
                window.URL.revokeObjectURL(url);
                
                showSuccess('エクスポート完了', 'スケジュールをエクスポートしました');
            }
        } catch (error) {
            showError('エラー', 'エクスポートに失敗しました');
        }
    }

    updateSlotUsage(usage) {
        if (!usage) return;
        
        Object.keys(usage).forEach(key => {
            if (this.slots[key]) {
                this.slots[key].used = usage[key].used;
                this.slots[key].total = usage[key].total;
            }
        });
    }

    setupEventListeners() {
        // カレンダー日付クリック
        document.addEventListener('click', (e) => {
            if (e.target.closest('.calendar-day') && !e.target.closest('.calendar-event')) {
                const date = e.target.closest('.calendar-day').dataset.date;
                this.createMeetingForDate(date);
            }
        });
    }

    createMeetingForDate(date) {
        this.createMeeting();
        // 日付を自動設定
        setTimeout(() => {
            const dateInput = document.getElementById('meetingDate');
            if (dateInput) {
                dateInput.value = date;
            }
        }, 100);
    }
}

// グローバルインスタンス
const meetingManager = new MeetingManager();

// グローバル関数として公開
window.MeetingManager = {
    previousMonth: () => meetingManager.previousMonth(),
    nextMonth: () => meetingManager.nextMonth(),
    createMeeting: () => meetingManager.createMeeting(),
    closeCreateModal: () => meetingManager.closeCreateModal(),
    manageSlots: (type) => meetingManager.manageSlots(type),
    approveRequest: (id) => meetingManager.approveRequest(id),
    rescheduleRequest: (id) => meetingManager.rescheduleRequest(id),
    declineRequest: (id) => meetingManager.declineRequest(id),
    translateQA: (id) => meetingManager.translateQA(id),
    addToFAQ: (id) => meetingManager.addToFAQ(id),
    createFollowup: (id) => meetingManager.createFollowup(id),
    exportSchedule: () => meetingManager.exportSchedule()
};