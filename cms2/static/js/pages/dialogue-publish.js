// ====================
// 確認・公開設定画面機能
// ====================

(function() {
    'use strict';

    // グローバル変数
    let publishData = null;

    // ページ初期化
    document.addEventListener('DOMContentLoaded', function() {
        loadDialogueData();
        updatePublishReadiness();
        initEventListeners();
    });

    // イベントリスナーの設定
    function initEventListeners() {
        // 公開準備状況の更新
        document.querySelectorAll('.checklist-item input[type="checkbox"]:not(:disabled)').forEach(cb => {
            cb.addEventListener('change', updatePublishReadiness);
        });

        // FAQ承認ボタン
        document.querySelectorAll('.status-badge.pending').forEach(badge => {
            const approveBtn = badge.closest('.faq-content').querySelector('.btn-primary');
            if (approveBtn) {
                approveBtn.addEventListener('click', function() {
                    approveFAQ(this);
                });
            }
        });

        // FAQ編集ボタン
        document.querySelectorAll('.faq-settings .btn-secondary').forEach(btn => {
            if (btn.textContent === '編集') {
                btn.addEventListener('click', function() {
                    editFAQ(this);
                });
            }
        });
    }

    // 対話データの読み込み
    function loadDialogueData() {
        // セッションストレージから対話データを読み込む
        const metadataStr = sessionStorage.getItem('dialogue_metadata');
        if (metadataStr) {
            publishData = JSON.parse(metadataStr);
            console.log('対話データを読み込みました:', publishData);
        }
    }

    // ステップナビゲーション
    window.navigateToStep = function(step) {
        switch(step) {
            case 1:
            case 2:
                if (confirm('公開設定は保存されません。移動しますか？')) {
                    window.location.href = '/upload';
                }
                break;
            case 3:
                if (confirm('公開設定は保存されません。移動しますか？')) {
                    window.location.href = '/upload-confirm';
                }
                break;
            case 4:
                if (confirm('公開設定は保存されません。移動しますか？')) {
                    window.location.href = '/dialogue-analysis';
                }
                break;
            case 5:
                // 現在のページ
                break;
        }
    };

    // 前へ戻る
    window.goBack = function() {
        if (confirm('公開設定は保存されません。前のページに戻りますか？')) {
            window.location.href = '/dialogue-analysis';
        }
    };

    // 公開処理
    window.publishDialogue = function() {
        if (!validatePublishChecklist()) {
            showNotification('公開前チェックリストをすべて確認してください', 'warning');
            return;
        }
        
        // 公開確認ダイアログ
        if (confirm('対話記録を公開しますか？\n\n公開後は、設定した連携システムに自動的に反映されます。')) {
            executePublish();
        }
    };

    // 公開実行
    function executePublish() {
        // 公開データの準備
        const publishSettings = collectPublishSettings();
        
        // プログレスモーダルの表示
        showProgressModal();
        
        // 各処理のシミュレーション
        const steps = [
            { name: 'データ検証', duration: 1000 },
            { name: 'FAQ登録', duration: 1500 },
            { name: 'アクション作成', duration: 1000 },
            { name: '連携システム更新', duration: 2000 },
            { name: '通知送信', duration: 500 }
        ];
        
        let currentStep = 0;
        
        function processStep() {
            if (currentStep < steps.length) {
                updateProgressModal(steps[currentStep].name, (currentStep + 1) / steps.length * 100);
                setTimeout(() => {
                    currentStep++;
                    processStep();
                }, steps[currentStep].duration);
            } else {
                closeProgressModal();
                showNotification('対話記録を正常に公開しました', 'success');
                setTimeout(() => {
                    window.location.href = '/dialogue';
                }, 2000);
            }
        }
        
        processStep();
    }

    // すべてのFAQを選択/解除
    window.toggleAllFAQs = function() {
        const selectAll = document.getElementById('select-all-faqs');
        const checkboxes = document.querySelectorAll('.faq-select');
        checkboxes.forEach(cb => {
            cb.checked = selectAll.checked;
        });
        updateFAQSummary();
    };

    // FAQ承認
    function approveFAQ(button) {
        const item = button.closest('.faq-approval-item');
        const statusBadge = item.querySelector('.status-badge');
        
        // ステータスを更新
        statusBadge.textContent = '承認済み';
        statusBadge.classList.remove('pending');
        statusBadge.classList.add('approved');
        
        // ボーダーカラーを更新
        item.classList.remove('pending');
        item.classList.add('approved');
        
        // ボタンを非表示
        button.style.display = 'none';
        
        showNotification('FAQを承認しました', 'success');
        updateFAQSummary();
    }

    // FAQ編集
    function editFAQ(button) {
        const item = button.closest('.faq-approval-item');
        const question = item.querySelector('.question').textContent.replace('Q: ', '');
        const answer = item.querySelector('.answer').textContent.replace('A: ', '');
        
        // 編集モーダルを表示
        showEditModal(question, answer, (newQuestion, newAnswer) => {
            item.querySelector('.question').textContent = 'Q: ' + newQuestion;
            item.querySelector('.answer').textContent = 'A: ' + newAnswer;
            showNotification('FAQを更新しました', 'success');
        });
    }

    // FAQサマリー更新
    function updateFAQSummary() {
        const total = document.querySelectorAll('.faq-approval-item').length;
        const approved = document.querySelectorAll('.faq-approval-item.approved').length;
        const pending = total - approved;
        
        const summaryElement = document.querySelector('.faq-summary p');
        if (summaryElement) {
            summaryElement.textContent = `承認済み: ${approved}件 / 承認待ち: ${pending}件 / 合計: ${total}件`;
        }
    }

    // 受信者削除
    window.removeRecipient = function(button) {
        button.closest('.recipient-item').remove();
        showNotification('通知先を削除しました', 'info');
    };

    // 受信者追加
    window.addRecipient = function() {
        const name = prompt('通知先の名前またはメールアドレスを入力してください:');
        if (name && name.trim()) {
            const recipientList = document.querySelector('.recipient-list');
            const newRecipient = document.createElement('div');
            newRecipient.className = 'recipient-item';
            newRecipient.innerHTML = `
                <span>${name.trim()}</span>
                <button class="remove-btn" onclick="removeRecipient(this)">×</button>
            `;
            recipientList.appendChild(newRecipient);
            showNotification('通知先を追加しました', 'success');
        }
    };

    // タグ入力処理
    window.handleTagInput = function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const input = event.target;
            const value = input.value.trim();
            
            if (value) {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.textContent = value;
                
                const tagInput = input.parentElement;
                tagInput.insertBefore(tag, input);
                input.value = '';
                
                showNotification('タグを追加しました', 'success');
            }
        }
    };

    // 下書き保存
    window.saveDraft = function() {
        const settings = collectPublishSettings();
        
        // ローカルストレージに保存
        localStorage.setItem('dialogue_publish_draft', JSON.stringify({
            settings: settings,
            timestamp: new Date().toISOString()
        }));
        
        showNotification('設定を保存しました', 'success');
    };

    // 検証して公開
    window.validateAndPublish = function() {
        if (!validatePublishChecklist()) {
            highlightMissingChecks();
            showNotification('公開前チェックリストを確認してください', 'warning');
            
            // チェックリストまでスクロール
            document.querySelector('.pre-publish-checklist').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            return;
        }
        
        publishDialogue();
    };

    // 公開前チェックリストの検証
    function validatePublishChecklist() {
        const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]:not(:disabled)');
        return Array.from(checkboxes).every(cb => cb.checked);
    }

    // 未チェック項目をハイライト
    function highlightMissingChecks() {
        const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]:not(:disabled)');
        checkboxes.forEach(cb => {
            if (!cb.checked) {
                const item = cb.closest('.checklist-item');
                item.classList.add('error');
                setTimeout(() => {
                    item.classList.remove('error');
                }, 3000);
            }
        });
    }

    // 公開設定を収集
    function collectPublishSettings() {
        const settings = {
            dialogue: {
                visibility: document.querySelector('.publish-settings select').value,
                metadata: publishData
            },
            faqs: {
                autoPublish: document.querySelector('.toggle-switch').checked,
                items: []
            },
            integrations: [],
            notifications: {
                enabled: document.querySelector('.notification-settings input[type="checkbox"]').checked,
                recipients: []
            },
            archive: {
                enabled: document.querySelector('.archive-settings input[type="checkbox"]').checked,
                retention: document.querySelector('.archive-settings select').value,
                tags: []
            }
        };
        
        // FAQ設定を収集
        document.querySelectorAll('.faq-approval-item').forEach(item => {
            const checkbox = item.querySelector('.faq-select');
            if (checkbox && checkbox.checked) {
                settings.faqs.items.push({
                    category: item.querySelector('.faq-category').textContent,
                    question: item.querySelector('.question').textContent,
                    answer: item.querySelector('.answer').textContent,
                    visibility: item.querySelector('.form-control-sm').value,
                    status: item.querySelector('.status-badge').textContent
                });
            }
        });
        
        // 連携システムを収集
        document.querySelectorAll('.integration-checklist input:checked').forEach(cb => {
            settings.integrations.push(cb.nextElementSibling.textContent.trim());
        });
        
        // 通知先を収集
        document.querySelectorAll('.recipient-item span:first-child').forEach(span => {
            settings.notifications.recipients.push(span.textContent);
        });
        
        // タグを収集
        document.querySelectorAll('.tag-input .tag').forEach(tag => {
            settings.archive.tags.push(tag.textContent);
        });
        
        return settings;
    }

    // 公開準備状況を更新
    window.updatePublishReadiness = function() {
        const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]:not(:disabled)');
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        const totalCount = checkboxes.length;
        
        // プライマリボタンの有効/無効を切り替え
        const publishBtn = document.querySelector('.btn-primary');
        if (publishBtn) {
            if (checkedCount === totalCount) {
                publishBtn.classList.remove('disabled');
                publishBtn.removeAttribute('disabled');
            } else {
                publishBtn.classList.add('disabled');
                publishBtn.setAttribute('disabled', 'true');
            }
        }
        
        console.log(`公開準備: ${checkedCount}/${totalCount}`);
    };

    // 編集モーダル表示
    function showEditModal(question, answer, onSave) {
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
                    <button class="btn btn-primary" id="save-edit">保存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 保存ボタンのイベント
        document.getElementById('save-edit').addEventListener('click', function() {
            const newQuestion = document.getElementById('edit-question').value;
            const newAnswer = document.getElementById('edit-answer').value;
            onSave(newQuestion, newAnswer);
            modal.remove();
        });
    }

    // プログレスモーダル表示
    function showProgressModal() {
        const modal = document.createElement('div');
        modal.id = 'progress-modal';
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-body" style="text-align: center; padding: 40px;">
                    <h3 style="margin-bottom: 20px;">公開処理中...</h3>
                    <div class="progress" style="height: 20px; margin-bottom: 20px;">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 0%"></div>
                    </div>
                    <p id="progress-status">準備中...</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // プログレスモーダル更新
    function updateProgressModal(status, percent) {
        const progressBar = document.querySelector('#progress-modal .progress-bar');
        const statusText = document.getElementById('progress-status');
        
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
        if (statusText) {
            statusText.textContent = status;
        }
    }

    // プログレスモーダルを閉じる
    function closeProgressModal() {
        const modal = document.getElementById('progress-modal');
        if (modal) {
            modal.remove();
        }
    }

    // 通知表示
    function showNotification(message, type = 'info') {
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

// スタイル追加
const style = document.createElement('style');
style.textContent = `
/* モーダル */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9998;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
    position: relative;
    background-color: white;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    border-radius: 8px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
    from {
        transform: translateY(-50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #E5E7EB;
}

.modal-title {
    font-size: 20px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.modal-close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 6px;
    color: #6B7280;
    transition: all 0.2s;
}

.modal-close:hover {
    background-color: #F3F4F6;
    color: #111827;
}

.modal-body {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid #E5E7EB;
    background-color: #F9FAFB;
}

/* 通知 */
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

/* プログレスバー */
.progress {
    height: 8px;
    background-color: #E5E7EB;
    border-radius: 4px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background-color: #3B82F6;
    transition: width 0.3s ease;
}

.progress-bar-striped {
    background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
    );
    background-size: 1rem 1rem;
}

.progress-bar-animated {
    animation: progress-bar-stripes 1s linear infinite;
}

@keyframes progress-bar-stripes {
    0% {
        background-position: 1rem 0;
    }
    100% {
        background-position: 0 0;
    }
}

/* ボタン無効化 */
.btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
`;
document.head.appendChild(style);
