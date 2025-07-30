// ====================
// アップロード確認画面機能
// ====================

(function() {
    'use strict';

    // 初期化
    document.addEventListener('DOMContentLoaded', function() {
        initInvestorAutocomplete();
        initTagInput();
        simulateAIAnalysis();
        initEventListeners();
    });

    // イベントリスナーの設定
    function initEventListeners() {
        // チェックボックスの変更監視
        document.querySelectorAll('.faq-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateFAQStats);
        });

        // 参加者タグの削除
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('tag-remove')) {
                e.target.parentElement.remove();
            }
        });
    }

    // 投資家名オートコンプリート
    function initInvestorAutocomplete() {
        const input = document.querySelector('.investor-select input');
        const suggestions = document.querySelector('.investor-suggestions');
        
        if (!input || !suggestions) return;

        let timeout;
        
        input.addEventListener('focus', function() {
            if (this.value.length > 0) {
                suggestions.style.display = 'block';
            }
        });
        
        input.addEventListener('input', function() {
            clearTimeout(timeout);
            const value = this.value.trim();
            
            if (value.length > 0) {
                timeout = setTimeout(() => {
                    // 実際の実装では、ここでAPIを呼び出して候補を取得
                    searchInvestors(value);
                    suggestions.style.display = 'block';
                }, 300);
            } else {
                suggestions.style.display = 'none';
            }
        });
        
        // 候補選択
        suggestions.addEventListener('click', function(e) {
            if (e.target.classList.contains('suggestion-item')) {
                input.value = e.target.textContent.replace('（既存）', '').trim();
                suggestions.style.display = 'none';
            }
        });
        
        // 外側クリックで閉じる
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.investor-select')) {
                suggestions.style.display = 'none';
            }
        });
    }

    // 投資家検索（モック）
    function searchInvestors(query) {
        // 実際の実装ではAPIを呼び出す
        console.log('投資家検索:', query);
    }

    // タグ入力
    function initTagInput() {
        const tagInputs = document.querySelectorAll('.tag-input-field');
        
        tagInputs.forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && this.value.trim()) {
                    e.preventDefault();
                    addTag(this);
                }
            });
            
            input.addEventListener('blur', function() {
                if (this.value.trim()) {
                    addTag(this);
                }
            });
        });
    }

    // タグ追加
    function addTag(input) {
        const value = input.value.trim();
        if (!value) return;
        
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerHTML = `${value} <button class="tag-remove" onclick="this.parentElement.remove()">×</button>`;
        
        input.parentElement.insertBefore(tag, input);
        input.value = '';
    }

    // AI分析のシミュレーション
    function simulateAIAnalysis() {
        const progressBars = [
            { selector: '.analysis-progress .progress-bar:nth-child(2)', target: 100, speed: 30 },
            { selector: '.analysis-progress .progress-bar:nth-child(3)', target: 100, speed: 20 }
        ];
        
        progressBars.forEach(bar => {
            const element = document.querySelector(bar.selector);
            if (!element) return;
            
            let current = parseInt(element.style.width) || 60;
            const interval = setInterval(() => {
                current += 1;
                element.style.width = current + '%';
                
                if (current >= bar.target) {
                    clearInterval(interval);
                    // ステータスを更新
                    const statusElement = element.closest('.progress-item').querySelector('.progress-status');
                    if (statusElement) {
                        statusElement.textContent = '✓ 完了';
                        statusElement.classList.add('success');
                    }
                }
            }, bar.speed);
        });
    }

    // 下書き保存
    window.saveDraft = function() {
        const formData = collectFormData();
        
        // ローカルストレージに保存（デモ用）
        localStorage.setItem('dialogue_draft', JSON.stringify({
            data: formData,
            timestamp: new Date().toISOString()
        }));
        
        showNotification('下書きを保存しました', 'success');
    };

    // キャンセル
    window.cancelUpload = function() {
        if (confirm('入力した内容は保存されません。本当にキャンセルしますか？')) {
            window.location.href = '/dialogue';
        }
    };

    // 前へ戻る
    window.goBack = function() {
        if (confirm('入力した内容は保存されません。前のページに戻りますか？')) {
            window.location.href = '/upload';
        }
    };

    // 次へ進む（AI詳細分析）
    window.proceedToAnalysis = function() {
        // フォームバリデーション
        if (!validateForm()) {
            return;
        }
        
        // フォームデータを収集
        const formData = collectFormData();
        
        // セッションストレージに保存
        sessionStorage.setItem('dialogue_metadata', JSON.stringify(formData));
        
        // 次のステップへ
        window.location.href = '/dialogue-analysis';
    };

    // フォームデータ収集
    function collectFormData() {
        const data = {
            meeting: {
                title: document.querySelector('input[value*="野村アセット"]')?.value || '',
                type: document.querySelector('select option[selected]')?.textContent || '',
                datetime: document.querySelector('input[type="datetime-local"]')?.value || '',
                agenda: document.querySelector('textarea')?.value || ''
            },
            investor: {
                name: document.querySelector('.investor-select input')?.value || '',
                type: document.querySelector('.form-column select')?.value || '',
                holdings: document.querySelector('select option[selected]:nth-child(2)')?.textContent || '',
                participants: []
            },
            company: {
                speakers: [],
                primaryContact: document.querySelector('.form-column:nth-child(2) select')?.value || ''
            },
            settings: {
                importance: document.querySelector('select option[selected]:nth-child(3)')?.textContent || '',
                confidentiality: document.querySelector('select option[selected]:nth-child(2)')?.textContent || '',
                tags: []
            },
            faqs: []
        };
        
        // 参加者タグを収集
        document.querySelectorAll('.participant-tags .tag').forEach(tag => {
            if (!tag.querySelector('button')) { // 追加ボタンを除外
                data.investor.participants.push(tag.textContent.trim());
            }
        });
        
        // 自社参加者を収集
        document.querySelectorAll('.participant-list input:checked').forEach(checkbox => {
            data.company.speakers.push(checkbox.nextElementSibling.textContent.trim());
        });
        
        // タグを収集
        document.querySelectorAll('.tag-input .tag').forEach(tag => {
            const text = tag.textContent.replace('×', '').trim();
            if (text) {
                data.settings.tags.push(text);
            }
        });
        
        // FAQ候補を収集
        document.querySelectorAll('.faq-candidate-card').forEach(card => {
            const checkbox = card.querySelector('.faq-checkbox');
            if (checkbox && checkbox.checked) {
                data.faqs.push({
                    id: card.dataset.faqId,
                    category: card.querySelector('.faq-category').textContent,
                    question: card.querySelector('.faq-question span:last-child').textContent,
                    answer: card.querySelector('.faq-answer span:last-child').textContent,
                    confidence: card.querySelector('.confidence-badge').textContent
                });
            }
        });
        
        return data;
    }

    // フォームバリデーション
    function validateForm() {
        const requiredFields = document.querySelectorAll('.form-label.required');
        let isValid = true;
        const errors = [];
        
        requiredFields.forEach(label => {
            const fieldName = label.textContent.replace(' *', '');
            const input = label.nextElementSibling;
            
            if (input && !input.value.trim()) {
                input.classList.add('error');
                errors.push(fieldName);
                isValid = false;
            } else if (input) {
                input.classList.remove('error');
            }
        });
        
        if (!isValid) {
            showNotification(`必須項目を入力してください: ${errors.join(', ')}`, 'error');
        }
        
        return isValid;
    }

    // ステップナビゲーション
    window.navigateToStep = function(step) {
        switch(step) {
            case 1:
            case 2:
                if (confirm('入力した内容は保存されません。移動しますか？')) {
                    window.location.href = '/upload';
                }
                break;
            case 3:
                // 現在のページ
                break;
            case 4:
                proceedToAnalysis();
                break;
            case 5:
                showNotification('先にAI分析を完了してください', 'warning');
                break;
        }
    };

    // FAQ候補の操作
    window.editFAQ = function(id) {
        const card = document.querySelector(`[data-faq-id="${id}"]`);
        if (!card) return;
        
        const question = card.querySelector('.faq-question span:last-child').textContent;
        const answer = card.querySelector('.faq-answer span:last-child').textContent;
        
        // 編集モーダルを表示（簡易版）
        const modal = createEditModal(id, question, answer);
        document.body.appendChild(modal);
    };

    // FAQ編集モーダル作成
    function createEditModal(id, question, answer) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title"><i class="icon-edit"></i>FAQ編集</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="icon-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">質問</label>
                        <textarea class="form-control" rows="3" id="edit-question">${question}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">回答</label>
                        <textarea class="form-control" rows="5" id="edit-answer">${answer}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">キャンセル</button>
                    <button class="btn btn-primary" onclick="saveFAQEdit(${id})">保存</button>
                </div>
            </div>
        `;
        return modal;
    }

    // FAQ編集保存
    window.saveFAQEdit = function(id) {
        const question = document.getElementById('edit-question').value;
        const answer = document.getElementById('edit-answer').value;
        
        const card = document.querySelector(`[data-faq-id="${id}"]`);
        if (card) {
            card.querySelector('.faq-question span:last-child').textContent = question;
            card.querySelector('.faq-answer span:last-child').textContent = answer;
        }
        
        document.querySelector('.modal').remove();
        showNotification('FAQを更新しました', 'success');
    };

    // FAQ公開設定
    window.setFAQVisibility = function(id) {
        // 公開設定モーダルを表示
        showNotification('公開設定パネルを開発中です', 'info');
    };

    // FAQアクション
    window.showFAQActions = function(id) {
        // コンテキストメニューを表示
        console.log(`FAQ ${id} のアクションメニュー`);
    };

    // FAQタブ切り替え
    window.switchFAQTab = function(tab) {
        // タブボタンのアクティブ状態を更新
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // コンテンツの表示切り替え
        showNotification(`${tab}タブの内容を読み込み中...`, 'info');
    };

    // FAQワークフロー設定
    window.showFAQWorkflow = function() {
        document.getElementById('faq-workflow-modal').style.display = 'block';
    };

    window.closeFAQWorkflowModal = function() {
        document.getElementById('faq-workflow-modal').style.display = 'none';
    };

    window.saveFAQWorkflow = function() {
        const settings = {
            autoApprovalLevel: document.querySelector('.workflow-section select').value,
            approvers: [],
            integrations: []
        };
        
        // チェックされた承認者を取得
        document.querySelectorAll('.approver-list input:checked').forEach(input => {
            settings.approvers.push(input.nextElementSibling.textContent.trim());
        });
        
        // チェックされた連携システムを取得
        document.querySelectorAll('.integration-list input:checked').forEach(input => {
            settings.integrations.push(input.nextElementSibling.textContent.trim());
        });
        
        console.log('ワークフロー設定:', settings);
        showNotification('ワークフロー設定を保存しました', 'success');
        closeFAQWorkflowModal();
    };

    // 類似FAQ表示
    window.showSimilarFAQ = function(id) {
        showNotification(`FAQ ${id} の類似事例を表示`, 'info');
    };

    // FAQ統合
    window.mergeFAQ = function(id) {
        document.getElementById('faq-merge-modal').style.display = 'block';
        document.getElementById('faq-merge-modal').dataset.faqId = id;
    };

    window.closeFAQMergeModal = function() {
        document.getElementById('faq-merge-modal').style.display = 'none';
    };

    window.executeFAQMerge = function() {
        const selectedOption = document.querySelector('input[name="merge-option"]:checked').value;
        const faqId = document.getElementById('faq-merge-modal').dataset.faqId;
        
        let message = '';
        switch(selectedOption) {
            case 'replace':
                message = '既存FAQを更新しました';
                break;
            case 'append':
                message = '既存FAQに情報を追加しました';
                break;
            case 'new':
                message = '新しいFAQとして登録しました';
                break;
        }
        
        showNotification(message, 'success');
        closeFAQMergeModal();
        updateFAQStats();
    };

    // 全FAQのプレビュー
    window.previewAllFAQs = function() {
        const faqs = collectFormData().faqs;
        console.log('FAQ一覧:', faqs);
        showNotification('FAQ一覧プレビューを準備中...', 'info');
    };

    // 全FAQの採用
    window.acceptAllFAQs = function() {
        const checkboxes = document.querySelectorAll('.faq-checkbox');
        checkboxes.forEach(cb => cb.checked = true);
        updateFAQStats();
        showNotification('すべてのFAQ候補を採用しました', 'success');
    };

    // FAQ統計更新
    function updateFAQStats() {
        const total = document.querySelectorAll('.faq-checkbox').length;
        const checked = document.querySelectorAll('.faq-checkbox:checked').length;
        console.log(`FAQ選択状況: ${checked}/${total}`);
    }

    // 参加者追加
    window.addParticipant = function() {
        const name = prompt('参加者名を入力してください（役職も含む）:');
        if (name) {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerHTML = `${name} <button class="tag-remove" onclick="this.parentElement.remove()">×</button>`;
            
            const container = document.querySelector('.participant-tags');
            const addButton = container.querySelector('.btn');
            container.insertBefore(tag, addButton);
            
            showNotification('参加者を追加しました', 'success');
        }
    };

    // 関連資料追加
    window.addRelatedDocument = function() {
        showNotification('関連資料のアップロード機能は開発中です', 'info');
    };

    // 通知表示
    function showNotification(message, type = 'info') {
        // 既存の通知を削除
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // アニメーション
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自動削除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    // グローバルに公開
    window.showNotification = showNotification;

})();

// 通知スタイル
const style = document.createElement('style');
style.textContent = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    z-index: 9999;
    max-width: 400px;
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    border-left: 4px solid #10B981;
}

.notification-error {
    border-left: 4px solid #EF4444;
}

.notification-warning {
    border-left: 4px solid #F59E0B;
}

.notification-info {
    border-left: 4px solid #3B82F6;
}

.notification-message {
    flex: 1;
}

.notification-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #6B7280;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.notification-close:hover {
    background-color: #F3F4F6;
}

.tag-remove {
    margin-left: 8px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    font-size: 16px;
    padding: 0;
}

.tag-remove:hover {
    color: white;
}
`;
document.head.appendChild(style);
