/**
 * 対話記録アップロード JavaScript
 */

// グローバル変数
let uploadQueue = [];
let currentTags = [];
let processingFiles = new Map();

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeUploader();
    setupEventListeners();
    startProcessingMonitor();
});

/**
 * アップローダーの初期化
 */
function initializeUploader() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    
    // ドラッグ&ドロップの設定
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
    // タグ入力
    const tagInput = document.querySelector('.tag-input');
    if (tagInput) {
        tagInput.addEventListener('keypress', handleTagInput);
    }
    
    // バッチオプション
    document.getElementById('autoProcess')?.addEventListener('change', updateBatchSettings);
    document.getElementById('aiAnalysis')?.addEventListener('change', updateBatchSettings);
    document.getElementById('notifyComplete')?.addEventListener('change', updateBatchSettings);
}

/**
 * デフォルト動作の防止
 */
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * ドラッグオーバー時のハイライト
 */
function highlight(e) {
    document.getElementById('dropZone').classList.add('dragover');
}

/**
 * ドラッグ離脱時のハイライト解除
 */
function unhighlight(e) {
    document.getElementById('dropZone').classList.remove('dragover');
}

/**
 * ファイルドロップ処理
 */
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

/**
 * ファイル選択処理
 */
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

/**
 * ファイル処理
 */
function handleFiles(files) {
    ([...files]).forEach(uploadFile);
}

/**
 * ファイルアップロード
 */
function uploadFile(file) {
    // ファイルタイプのチェック
    const allowedTypes = ['audio/mp3', 'audio/mp4', 'audio/wav', 'audio/m4a', 'video/mp4', 'video/quicktime'];
    const fileType = file.type || getMimeType(file.name);
    
    if (!allowedTypes.includes(fileType)) {
        showNotification('error', `サポートされていないファイル形式です: ${file.name}`);
        return;
    }
    
    // ファイルサイズのチェック（500MB）
    if (file.size > 500 * 1024 * 1024) {
        showNotification('error', `ファイルサイズが大きすぎます（最大500MB）: ${file.name}`);
        return;
    }
    
    // アップロードキューに追加
    const fileId = generateFileId();
    const uploadItem = {
        id: fileId,
        file: file,
        name: file.name,
        size: formatFileSize(file.size),
        type: fileType,
        progress: 0,
        status: 'pending'
    };
    
    uploadQueue.push(uploadItem);
    updateUploadQueue();
    
    // メタ情報入力モーダルを表示（最初のファイルの場合）
    if (uploadQueue.length === 1) {
        showMetaInfoModal();
    }
}

/**
 * MIMEタイプの推定
 */
function getMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
        'mp3': 'audio/mp3',
        'mp4': 'video/mp4',
        'wav': 'audio/wav',
        'm4a': 'audio/m4a',
        'mov': 'video/quicktime'
    };
    return mimeTypes[ext] || '';
}

/**
 * ファイルIDの生成
 */
function generateFileId() {
    return 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * ファイルサイズのフォーマット
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * アップロードキューの更新
 */
function updateUploadQueue() {
    const queueContainer = document.getElementById('uploadQueue');
    
    if (uploadQueue.length === 0) {
        queueContainer.innerHTML = `
            <div class="empty-state">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
                <p class="text-gray-500">アップロードするファイルを選択してください</p>
            </div>
        `;
        return;
    }
    
    queueContainer.innerHTML = uploadQueue.map(item => `
        <div class="upload-item" data-file-id="${item.id}">
            <div class="upload-item-icon ${item.type.includes('audio') ? 'file-icon-audio' : 'file-icon-video'}">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${item.type.includes('audio') ? 
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>' :
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>'
                    }
                </svg>
            </div>
            <div class="upload-item-info">
                <div class="upload-item-name">${item.name}</div>
                <div class="upload-item-meta">
                    <span>${item.size}</span>
                    <span>${item.status === 'pending' ? '待機中' : '処理中'}</span>
                </div>
                ${item.status === 'uploading' ? `
                    <div class="upload-item-progress">
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${item.progress}%"></div>
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="upload-item-actions">
                <button class="btn-icon" onclick="removeFromQueue('${item.id}')" title="削除">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * キューからファイルを削除
 */
function removeFromQueue(fileId) {
    uploadQueue = uploadQueue.filter(item => item.id !== fileId);
    updateUploadQueue();
}

/**
 * メタ情報モーダルの表示
 */
function showMetaInfoModal() {
    document.getElementById('metaInfoModal').classList.remove('hidden');
    
    // 現在の日時を設定
    const now = new Date();
    const dateInput = document.querySelector('input[name="meetingDate"]');
    if (dateInput) {
        dateInput.value = now.toISOString().slice(0, 16);
    }
}

/**
 * メタ情報モーダルを閉じる
 */
function closeMetaInfoModal() {
    document.getElementById('metaInfoModal').classList.add('hidden');
    
    // フォームをリセット
    document.getElementById('metaInfoForm').reset();
    currentTags = [];
    updateTagList();
}

/**
 * メタ情報の送信
 */
async function submitMetaInfo() {
    const form = document.getElementById('metaInfoForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const metaInfo = {
        title: formData.get('title'),
        meetingDate: formData.get('meetingDate'),
        meetingType: formData.get('meetingType'),
        participants: formData.get('participants'),
        notes: formData.get('notes'),
        tags: currentTags
    };
    
    // バッチ設定を取得
    const batchSettings = {
        autoProcess: document.getElementById('autoProcess').checked,
        aiAnalysis: document.getElementById('aiAnalysis').checked,
        notifyComplete: document.getElementById('notifyComplete').checked
    };
    
    closeMetaInfoModal();
    
    // アップロード処理を開始
    for (const item of uploadQueue) {
        await startUpload(item, metaInfo, batchSettings);
    }
}

/**
 * アップロード開始
 */
async function startUpload(uploadItem, metaInfo, batchSettings) {
    uploadItem.status = 'uploading';
    updateUploadQueue();
    
    // シミュレートされたアップロード進行
    const interval = setInterval(() => {
        if (uploadItem.progress < 100) {
            uploadItem.progress += Math.random() * 20;
            if (uploadItem.progress > 100) uploadItem.progress = 100;
            updateUploadProgress(uploadItem.id, uploadItem.progress);
            
            if (uploadItem.progress === 100) {
                clearInterval(interval);
                completeUpload(uploadItem, metaInfo, batchSettings);
            }
        }
    }, 500);
}

/**
 * アップロード進行状況の更新
 */
function updateUploadProgress(fileId, progress) {
    const progressBar = document.querySelector(`[data-file-id="${fileId}"] .progress-bar-fill`);
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
}

/**
 * アップロード完了
 */
function completeUpload(uploadItem, metaInfo, batchSettings) {
    // キューから削除
    removeFromQueue(uploadItem.id);
    
    // 処理状況に追加
    const processId = 'process-' + Date.now();
    const processItem = {
        id: processId,
        fileName: uploadItem.name,
        metaInfo: metaInfo,
        settings: batchSettings,
        status: 'processing',
        progress: 0,
        startTime: new Date()
    };
    
    processingFiles.set(processId, processItem);
    updateProcessingList();
    
    // 自動処理が有効な場合は文字起こしを開始
    if (batchSettings.autoProcess) {
        startTranscription(processId);
    }
    
    showNotification('success', `${uploadItem.name} のアップロードが完了しました`);
}

/**
 * タグ入力処理
 */
function handleTagInput(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const input = e.target;
        const tag = input.value.trim();
        
        if (tag && !currentTags.includes(tag)) {
            currentTags.push(tag);
            updateTagList();
            input.value = '';
        }
    }
}

/**
 * タグリストの更新
 */
function updateTagList() {
    const tagList = document.getElementById('tagList');
    if (!tagList) return;
    
    tagList.innerHTML = currentTags.map(tag => `
        <span class="tag">
            ${tag}
            <span class="tag-remove" onclick="removeTag('${tag}')">×</span>
        </span>
    `).join('');
}

/**
 * タグの削除
 */
function removeTag(tag) {
    currentTags = currentTags.filter(t => t !== tag);
    updateTagList();
}

/**
 * バッチ設定の更新
 */
function updateBatchSettings() {
    console.log('バッチ設定が更新されました');
}

/**
 * 処理状況の監視開始
 */
function startProcessingMonitor() {
    // 定期的に処理状況を更新
    setInterval(() => {
        updateProcessingList();
    }, 5000);
}

/**
 * 処理リストの更新
 */
function updateProcessingList() {
    // 実際の実装では、サーバーから処理状況を取得
    console.log('処理リストを更新');
}

/**
 * 文字起こし開始
 */
function startTranscription(processId) {
    const processItem = processingFiles.get(processId);
    if (!processItem) return;
    
    // シミュレートされた処理進行
    const interval = setInterval(() => {
        if (processItem.progress < 100) {
            processItem.progress += Math.random() * 10;
            if (processItem.progress > 100) processItem.progress = 100;
            
            if (processItem.progress === 100) {
                clearInterval(interval);
                completeTranscription(processId);
            }
        }
    }, 1000);
}

/**
 * 文字起こし完了
 */
function completeTranscription(processId) {
    const processItem = processingFiles.get(processId);
    if (!processItem) return;
    
    processItem.status = 'completed';
    
    if (processItem.settings.notifyComplete) {
        showNotification('success', `${processItem.fileName} の文字起こしが完了しました`);
    }
    
    if (processItem.settings.aiAnalysis) {
        // AI分析を開始
        console.log('AI分析を開始');
    }
}

/**
 * 処理状況の更新
 */
function refreshProcessingStatus() {
    showNotification('info', '処理状況を更新しています...');
    updateProcessingList();
}

/**
 * 議事録の確認
 */
function viewTranscript(transcriptId) {
    window.location.href = `/cms2/dialogue/${transcriptId}/edit`;
}

/**
 * 結果のダウンロード
 */
function downloadResults(transcriptId) {
    showNotification('info', 'ダウンロードを準備しています...');
}

/**
 * 再試行
 */
function retryProcessing(processId) {
    showNotification('info', '処理を再試行しています...');
    startTranscription(processId);
}

/**
 * 問題の報告
 */
function reportIssue(processId) {
    showNotification('info', '問題報告フォームを開きます');
}

/**
 * 通知表示
 */
function showNotification(type, message) {
    if (window.showNotification) {
        window.showNotification(type, message);
    } else {
        console.log(`[${type}] ${message}`);
    }
}