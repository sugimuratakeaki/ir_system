// ====================
// 対話分析ページ機能
// ====================

(function() {
    'use strict';

    // グローバル変数
    let currentFilter = 'all';
    let sentimentChart = null;

    // ページ初期化
    document.addEventListener('DOMContentLoaded', function() {
        initSentimentChart();
        setupScrollSpy();
        animateElements();
        setupEventListeners();
    });

    // イベントリスナーの設定
    function setupEventListeners() {
        // スムーズスクロール
        document.querySelectorAll('.nav-item').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // チェックボックスの変更イベント
        document.querySelectorAll('.action-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateActionStats);
        });

        // タイムラインフィルターボタン
        document.querySelectorAll('.timeline-controls .btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.timeline-controls .btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // 感情分析チャートの初期化
    function initSentimentChart() {
        const ctx = document.getElementById('sentimentChart');
        if (!ctx) return;

        sentimentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['00:00', '05:00', '10:00', '15:00', '20:00', '25:00', '30:00', '35:00', '40:00', '45:00'],
                datasets: [{
                    label: 'ポジティブ',
                    data: [60, 65, 70, 85, 80, 75, 80, 70, 75, 85],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }, {
                    label: '中立',
                    data: [30, 25, 20, 10, 15, 20, 15, 25, 20, 10],
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4
                }, {
                    label: 'ネガティブ',
                    data: [10, 10, 10, 5, 5, 5, 5, 5, 5, 5],
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: '経過時間（分）'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: '感情スコア（%）'
                        },
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    }

    // スクロールスパイ
    function setupScrollSpy() {
        const sections = document.querySelectorAll('.analysis-section');
        const navItems = document.querySelectorAll('.nav-item');
        
        let observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navItems.forEach(item => {
                        item.classList.remove('active');
                        if (item.getAttribute('href') === `#${id}`) {
                            item.classList.add('active');
                        }
                    });
                }
            });
        }, {
            rootMargin: '-20% 0px -70% 0px'
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // アニメーション効果
    function animateElements() {
        // 数値のカウントアップアニメーション
        const animateValue = (element, start, end, duration, suffix = '') => {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const value = Math.floor(progress * (end - start) + start);
                element.textContent = value + suffix;
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        };

        // カード値のアニメーション
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const text = element.textContent.trim();
                    const match = text.match(/(\d+)(%?)/);
                    if (match) {
                        const value = parseInt(match[1]);
                        const suffix = match[2] || '';
                        animateValue(element, 0, value, 1000, suffix);
                    }
                    observer.unobserve(element);
                }
            });
        });

        document.querySelectorAll('.card-value').forEach(element => {
            observer.observe(element);
        });

        // メーターフィルのアニメーション
        const meterFill = document.querySelector('.meter-fill');
        if (meterFill) {
            setTimeout(() => {
                meterFill.style.width = '85%';
            }, 500);
        }
    }

    // ステップナビゲーション
    window.navigateToStep = function(step) {
        switch(step) {
            case 1:
            case 2:
                window.location.href = '/upload';
                break;
            case 3:
                window.location.href = '/upload-confirm';
                break;
            case 4:
                // 現在のページ
                break;
            case 5:
                proceedToPublish();
                break;
        }
    };

    // 前へ戻る
    window.goBack = function() {
        window.location.href = '/upload-confirm';
    };

    // エクスポート機能
    window.exportAnalysis = function() {
        showNotification('分析結果のエクスポートを準備中...', 'info');
        
        // ダミーのエクスポート処理
        setTimeout(() => {
            showNotification('分析結果のエクスポートが完了しました', 'success');
        }, 2000);
    };

    // 次のステップへ
    window.proceedToPublish = function() {
        window.location.href = '/dialogue-publish?id=12345';
    };

    // サマリー編集
    window.editSummary = function() {
        const modal = createModal({
            title: 'エグゼクティブサマリーの編集',
            content: `
                <form class="form-vertical">
                    <div class="form-group">
                        <label for="summary-text">サマリー内容</label>
                        <textarea id="summary-text" class="form-control" rows="6">野村アセットマネジメントとの個別面談では、2025年第1四半期の業績について詳細な説明を行いました。特にAI事業の成長率35%という好調な結果に対して高い評価を受け、今後の成長戦略について建設的な議論が展開されました。</textarea>
                    </div>
                </form>
            `,
            primaryAction: {
                label: '保存',
                onClick: () => {
                    showNotification('サマリーを更新しました', 'success');
                    closeModal(modal);
                }
            }
        });
    };

    // 感情分析ビュー切り替え
    window.toggleSentimentView = function(view) {
        console.log(`感情分析ビューを${view}に切り替え`);
        // ビューに応じてチャートデータを更新
        updateSentimentChart(view);
    };

    // 感情チャートの更新
    function updateSentimentChart(view) {
        if (!sentimentChart) return;

        let data;
        switch(view) {
            case 'speaker':
                data = {
                    labels: ['田中CEO', '山田氏', '鈴木氏', '佐藤CFO'],
                    datasets: [{
                        label: '感情スコア',
                        data: [85, 70, 65, 80],
                        backgroundColor: ['#10B981', '#F59E0B', '#F59E0B', '#10B981']
                    }]
                };
                sentimentChart.config.type = 'bar';
                break;
            case 'topic':
                data = {
                    labels: ['AI事業', '財務', '人材', '競合', 'ESG'],
                    datasets: [{
                        label: '感情スコア',
                        data: [90, 85, 60, 45, 75],
                        backgroundColor: ['#10B981', '#10B981', '#F59E0B', '#EF4444', '#10B981']
                    }]
                };
                sentimentChart.config.type = 'bar';
                break;
            default:
                // タイムラインビューに戻す
                sentimentChart.config.type = 'line';
                return;
        }

        sentimentChart.data = data;
        sentimentChart.update();
    }

    // トピック調整
    window.adjustTopics = function() {
        showNotification('トピック調整パネルを開いています...', 'info');
    };

    // タイムラインフィルター
    window.filterTimeline = function(filter) {
        currentFilter = filter;
        const items = document.querySelectorAll('.timeline-item');
        
        items.forEach(item => {
            switch(filter) {
                case 'key-moments':
                    item.style.display = item.classList.contains('key-moment') ? 'block' : 'none';
                    break;
                case 'questions':
                    item.style.display = item.classList.contains('question') ? 'block' : 'none';
                    break;
                default:
                    item.style.display = 'block';
            }
        });
    };

    // タイムラインナビゲーション
    window.jumpToTime = function(position) {
        const container = document.querySelector('.timeline-container');
        const items = document.querySelectorAll('.timeline-item');
        
        if (!container || items.length === 0) return;

        let targetElement;
        switch(position) {
            case 'start':
                targetElement = items[0];
                break;
            case 'end':
                targetElement = items[items.length - 1];
                break;
            case 'previous':
            case 'next':
                // 現在の表示位置から前後の要素を探す
                const currentPosition = container.scrollTop;
                items.forEach((item, index) => {
                    const itemTop = item.offsetTop;
                    if (position === 'previous' && itemTop < currentPosition - 10) {
                        targetElement = item;
                    } else if (position === 'next' && itemTop > currentPosition + 10 && !targetElement) {
                        targetElement = item;
                    }
                });
                break;
        }

        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // アクションアイテム追加
    window.addActionItem = function() {
        const modal = createModal({
            title: '新しいアクションアイテムの追加',
            content: `
                <form class="form-vertical">
                    <div class="form-group">
                        <label for="action-title">タイトル</label>
                        <input type="text" id="action-title" class="form-control" placeholder="アクションアイテムのタイトル">
                    </div>
                    <div class="form-group">
                        <label for="action-priority">優先度</label>
                        <select id="action-priority" class="form-control">
                            <option value="high">高</option>
                            <option value="medium">中</option>
                            <option value="low">低</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="action-owner">担当者</label>
                        <input type="text" id="action-owner" class="form-control" placeholder="担当部署または担当者名">
                    </div>
                    <div class="form-group">
                        <label for="action-due">期限</label>
                        <input type="date" id="action-due" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="action-context">詳細</label>
                        <textarea id="action-context" class="form-control" rows="3" placeholder="アクションの詳細や背景"></textarea>
                    </div>
                </form>
            `,
            primaryAction: {
                label: '追加',
                onClick: () => {
                    showNotification('アクションアイテムを追加しました', 'success');
                    closeModal(modal);
                    updateActionStats();
                }
            }
        });
    };

    // アクション統計の更新
    function updateActionStats() {
        const totalCheckboxes = document.querySelectorAll('.action-checkbox').length;
        const checkedCheckboxes = document.querySelectorAll('.action-checkbox:checked').length;
        const completionRate = totalCheckboxes > 0 ? Math.round((checkedCheckboxes / totalCheckboxes) * 100) : 0;
        
        const statValue = document.querySelector('.stat-item:last-child .stat-value');
        if (statValue) {
            statValue.textContent = completionRate + '%';
        }
    }

    // レポート生成
    window.generateReport = function() {
        showNotification('レポートを生成しています...', 'info');
        
        // プログレスバーのモーダルを表示
        const modal = createModal({
            title: 'レポート生成中',
            content: `
                <div class="progress-container">
                    <div class="progress-bar" style="width: 0%"></div>
                </div>
                <p class="text-center mt-3">分析データを処理しています...</p>
            `,
            showCloseButton: false
        });

        // プログレスバーのアニメーション
        let progress = 0;
        const progressBar = modal.querySelector('.progress-bar');
        const interval = setInterval(() => {
            progress += 10;
            progressBar.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    closeModal(modal);
                    showNotification('レポートの生成が完了しました', 'success');
                }, 500);
            }
        }, 200);
    };

    // インサイト共有
    window.shareInsights = function() {
        const modal = createModal({
            title: 'インサイトの共有',
            content: `
                <form class="form-vertical">
                    <div class="form-group">
                        <label for="share-recipients">共有先</label>
                        <input type="text" id="share-recipients" class="form-control" placeholder="メールアドレスをカンマ区切りで入力">
                    </div>
                    <div class="form-group">
                        <label for="share-message">メッセージ</label>
                        <textarea id="share-message" class="form-control" rows="4" placeholder="共有時のメッセージ（オプション）"></textarea>
                    </div>
                    <div class="form-group">
                        <label>共有内容</label>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" checked> エグゼクティブサマリー
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" checked> 感情分析結果
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" checked> アクションアイテム
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox"> 詳細タイムライン
                            </label>
                        </div>
                    </div>
                </form>
            `,
            primaryAction: {
                label: '共有',
                onClick: () => {
                    showNotification('インサイトを共有しました', 'success');
                    closeModal(modal);
                }
            }
        });
    };

    // フォローアップスケジュール
    window.scheduleFollowup = function() {
        const modal = createModal({
            title: 'フォローアップのスケジュール',
            content: `
                <form class="form-vertical">
                    <div class="form-group">
                        <label for="followup-date">日付</label>
                        <input type="date" id="followup-date" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="followup-time">時間</label>
                        <input type="time" id="followup-time" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="followup-type">種類</label>
                        <select id="followup-type" class="form-control">
                            <option>メール送信</option>
                            <option>電話会議</option>
                            <option>対面ミーティング</option>
                            <option>資料送付</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="followup-notes">メモ</label>
                        <textarea id="followup-notes" class="form-control" rows="3" placeholder="フォローアップ内容の詳細"></textarea>
                    </div>
                </form>
            `,
            primaryAction: {
                label: 'スケジュール',
                onClick: () => {
                    showNotification('フォローアップをスケジュールしました', 'success');
                    closeModal(modal);
                }
            }
        });
    };

    // トピックバブルのインタラクション
    document.addEventListener('click', function(e) {
        if (e.target.closest('.topic-bubble')) {
            const bubble = e.target.closest('.topic-bubble');
            const topicName = bubble.querySelector('.topic-name').textContent;
            showNotification(`「${topicName}」の詳細分析を表示`, 'info');
        }
    });

})();
