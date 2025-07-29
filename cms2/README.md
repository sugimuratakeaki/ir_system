# KAGAMI CMS 2.0

世界一のWebエンジニアが設計した、次世代IR管理システムのCMS部分です。

## 🎯 主な特徴

### 1. モジュラー設計
- **コンポーネントベース**: 再利用可能なUIコンポーネント
- **責務の分離**: CSS、JS、HTMLテンプレートが明確に分離
- **拡張性**: 新機能の追加が容易

### 2. 高度なUIUX
- **レスポンシブデザイン**: PC、タブレット、モバイルに完全対応
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **キーボードショートカット**: 効率的な操作
- **リアルタイム更新**: WebSocket対応（準備済み）

### 3. パフォーマンス最適化
- **遅延読み込み**: 必要なリソースのみロード
- **キャッシング**: ローカルストレージを活用
- **エラーハンドリング**: 堅牢なエラー処理
- **オフライン対応**: ネットワーク切断時も基本機能は利用可能

## 📁 ディレクトリ構造

```
cms2/
├── static/
│   ├── css/
│   │   ├── core/           # 基本スタイル
│   │   │   ├── base.css        # リセットとベーススタイル
│   │   │   ├── variables.css   # CSS変数定義
│   │   │   ├── utilities.css   # ユーティリティクラス
│   │   │   └── responsive.css  # レスポンシブデザイン
│   │   ├── components/     # コンポーネント別CSS
│   │   │   ├── buttons.css
│   │   │   ├── cards.css
│   │   │   ├── forms.css
│   │   │   ├── header.css
│   │   │   ├── modals.css
│   │   │   ├── notifications.css
│   │   │   ├── sidebar.css
│   │   │   └── tables.css
│   │   └── pages/         # ページ固有のCSS
│   └── js/
│       ├── core/          # コアJavaScript
│       │   ├── app.js              # メインアプリケーション
│       │   ├── utils.js            # ユーティリティ関数
│       │   ├── advanced-features.js # 高度な機能
│       │   └── error-handling.js   # エラーハンドリング
│       ├── components/    # コンポーネント別JS
│       │   ├── forms.js           # フォームバリデーション
│       │   ├── modals.js          # モーダル管理
│       │   ├── notifications.js   # 通知システム
│       │   ├── sidebar.js         # サイドバー制御
│       │   └── tables.js          # データテーブル
│       └── pages/        # ページ固有のJS
└── templates/
    ├── base.html         # ベーステンプレート
    ├── components/       # 共通コンポーネント
    │   ├── header.html
    │   └── sidebar.html
    └── pages/           # 各ページ
        ├── dashboard.html    # ダッシュボード
        ├── documents.html    # ドキュメント管理
        ├── faq.html         # FAQ管理
        ├── investors.html   # 投資家管理
        └── meetings.html    # ミーティング管理
```

## 🚀 主要機能

### 1. データテーブル
高機能なデータテーブルコンポーネント
```javascript
const table = new DataTable('#myTable', {
    columns: [
        { key: 'name', label: '名前' },
        { key: 'email', label: 'メール' }
    ],
    data: myData,
    searchable: true,
    sortable: true,
    paginate: true,
    exportable: true
});
```

### 2. フォームバリデーション
リアルタイムバリデーション機能
```html
<input type="email" data-validate="required|email" />
<input type="text" data-validate="required|minLength:3|maxLength:50" />
```

### 3. キーボードショートカット
効率的な操作のためのショートカット
- `Ctrl/Cmd + K`: グローバル検索
- `Ctrl/Cmd + B`: サイドバートグル
- `Ctrl/Cmd + N`: 新規作成
- `Ctrl/Cmd + S`: 保存
- `Ctrl/Cmd + 1-5`: ページナビゲーション

### 4. 通知システム
```javascript
showNotification('保存しました', 'success');
showNotification('エラーが発生しました', 'error');
showNotification('処理中...', 'info', 0); // 自動的に消えない
```

### 5. モーダル
```javascript
showModal({
    title: 'タイトル',
    content: '<p>コンテンツ</p>',
    size: 'medium', // small, medium, large
    actions: [
        {
            id: 'save',
            label: '保存',
            type: 'primary',
            handler: () => console.log('Saved!')
        }
    ]
});
```

### 6. ローディング状態
```javascript
const loader = showLoading('データを取得中...', true); // プログレスバー付き
loader.updateProgress(50); // 50%
loader.updateMessage('処理中...');
loader.hide();
```

## 🔧 開発ガイドライン

### CSS命名規則
- BEM記法を基本とする
- コンポーネント: `.component-name`
- 要素: `.component-name__element`
- 修飾子: `.component-name--modifier`

### JavaScript命名規則
- キャメルケース: `functionName`, `variableName`
- コンストラクタ: `PascalCase`
- 定数: `UPPER_SNAKE_CASE`
- プライベート: `_prefixUnderscore`

### コンポーネント作成
1. `/static/css/components/` にCSSファイルを作成
2. `/static/js/components/` にJSファイルを作成
3. `/templates/components/` にHTMLテンプレートを作成（必要な場合）
4. `base.html` で読み込み

### ページ追加
1. `/templates/pages/` にHTMLファイルを作成
2. `base.html` を継承
3. 必要なブロックをオーバーライド
4. ページ固有のCSS/JSは各ディレクトリに配置

## 🎨 デザインシステム

### カラーパレット
- Primary: `--kagami-blue` (#1a365d)
- Accent: `--accent-teal` (#14b8a6)
- Success: `--success` (#10b981)
- Warning: `--warning` (#f59e0b)
- Error: `--error` (#ef4444)
- Info: `--info` (#3b82f6)

### スペーシング
- `--space-xs`: 0.25rem (4px)
- `--space-sm`: 0.5rem (8px)
- `--space-md`: 1rem (16px)
- `--space-lg`: 1.5rem (24px)
- `--space-xl`: 2rem (32px)

### ブレークポイント
- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px
- Large: ≥ 1280px

## 🔒 セキュリティ

- XSS対策: すべての出力をエスケープ
- CSRF対策: トークンベースの保護
- CSP: Content Security Policy対応
- 入力検証: クライアント・サーバー両側で実施

## 📈 パフォーマンス

- 初回読み込み: < 3秒（3G環境）
- インタラクティブまで: < 5秒
- APIレスポンス: < 1秒
- 60fps のスムーズなアニメーション

## 🌐 ブラウザサポート

- Chrome/Edge: 最新2バージョン
- Firefox: 最新2バージョン
- Safari: 最新2バージョン
- iOS Safari: iOS 12+
- Chrome for Android: Android 7+

## 📝 今後の拡張予定

1. **リアルタイムコラボレーション**
   - WebSocketによる同時編集
   - プレゼンスインジケーター

2. **AI機能統合**
   - 自動要約
   - 感情分析
   - 予測分析

3. **高度な可視化**
   - インタラクティブダッシュボード
   - 3Dグラフ
   - リアルタイムチャート

4. **プログレッシブWebアプリ（PWA）**
   - オフライン完全対応
   - プッシュ通知
   - アプリインストール

## 🤝 コントリビューション

1. フィーチャーブランチで開発
2. コードレビュー必須
3. テストカバレッジ80%以上
4. ドキュメント更新

---

**KAGAMI CMS 2.0** - 世界最高水準のIR管理システムを目指して