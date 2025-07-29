/**
 * 設定管理機能
 */
const SettingsManager = {
    // 初期化
    init() {
        this.bindEvents();
        this.initSliders();
    },

    // イベントバインディング
    bindEvents() {
        // タブ切り替え
        document.querySelectorAll('.setting-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });
    },

    // スライダー初期化
    initSliders() {
        const confidenceThreshold = document.getElementById('confidenceThreshold');
        const confidenceValue = document.getElementById('confidenceValue');
        
        if (confidenceThreshold && confidenceValue) {
            confidenceThreshold.addEventListener('input', (e) => {
                confidenceValue.textContent = `${e.target.value}%`;
            });
        }
    },

    // タブ切り替え
    switchTab(activeTab) {
        // タブのアクティブ状態を切り替え
        document.querySelectorAll('.setting-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        activeTab.classList.add('active');
        
        // コンテンツの表示切り替え
        const tabName = activeTab.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        const targetContent = document.getElementById(`${tabName}-content`);
        if (targetContent) {
            targetContent.classList.remove('hidden');
        }
    },

    // 設定保存
    save(section) {
        // フォームデータを収集
        const formData = this.collectFormData(section);
        
        // モック：実際の実装では、APIにPOST
        console.log(`Saving ${section} settings:`, formData);
        
        // 成功通知
        NotificationManager.show('success', `${this.getSectionName(section)}を保存しました`);
    },

    // フォームデータ収集
    collectFormData(section) {
        const formData = {};
        const content = document.getElementById(`${section}-content`);
        
        if (!content) return formData;
        
        // テキスト入力
        content.querySelectorAll('input[type="text"], input[type="email"]').forEach(input => {
            formData[input.name || input.id] = input.value;
        });
        
        // セレクトボックス
        content.querySelectorAll('select').forEach(select => {
            formData[select.name || select.id] = select.value;
        });
        
        // チェックボックス
        content.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            formData[checkbox.name || checkbox.id] = checkbox.checked;
        });
        
        // テキストエリア
        content.querySelectorAll('textarea').forEach(textarea => {
            formData[textarea.name || textarea.id] = textarea.value;
        });
        
        // レンジスライダー
        content.querySelectorAll('input[type="range"]').forEach(range => {
            formData[range.name || range.id] = range.value;
        });
        
        return formData;
    },

    // セクション名を取得
    getSectionName(section) {
        const sectionNames = {
            'general': '一般設定',
            'ai': 'AI設定',
            'notification': '通知設定',
            'security': 'セキュリティ設定',
            'integration': '外部連携設定'
        };
        return sectionNames[section] || section;
    },

    // Webhook設定モーダルを開く
    openWebhookModal() {
        // モック：実際の実装では、モーダルを表示
        const webhookUrl = prompt('Webhook URLを入力してください:', 'https://example.com/webhook');
        
        if (webhookUrl) {
            NotificationManager.show('success', 'Webhook設定を保存しました');
        }
    },

    // 外部サービス連携
    connectService(service) {
        // モック：実際の実装では、OAuth認証フローを開始
        switch (service) {
            case 'slack':
                window.open('https://slack.com/oauth/authorize', '_blank');
                break;
            case 'zoom':
                window.open('https://zoom.us/oauth/authorize', '_blank');
                break;
            default:
                console.log(`Connecting to ${service}...`);
        }
        
        // モック：連携成功を仮定
        setTimeout(() => {
            NotificationManager.show('success', `${service}との連携が完了しました`);
        }, 2000);
    },

    // 設定のエクスポート
    exportSettings() {
        const allSettings = {};
        
        ['general', 'ai', 'notification', 'security', 'integration'].forEach(section => {
            allSettings[section] = this.collectFormData(section);
        });
        
        // JSON形式でダウンロード
        const blob = new Blob([JSON.stringify(allSettings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kagami_settings_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        NotificationManager.show('success', '設定をエクスポートしました');
    },

    // 設定のインポート
    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const settings = JSON.parse(event.target.result);
                    this.applySettings(settings);
                    NotificationManager.show('success', '設定をインポートしました');
                } catch (error) {
                    NotificationManager.show('error', '設定ファイルの読み込みに失敗しました');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    },

    // 設定を適用
    applySettings(settings) {
        // モック：実際の実装では、各フォーム要素に値を設定
        console.log('Applying settings:', settings);
    },

    // 設定のリセット
    resetSettings(section) {
        if (confirm(`${this.getSectionName(section)}を初期値にリセットしますか？`)) {
            // モック：実際の実装では、デフォルト値を適用
            NotificationManager.show('info', `${this.getSectionName(section)}をリセットしました`);
        }
    }
};

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', () => {
    SettingsManager.init();
});