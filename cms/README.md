# 🔮 KAGAMI IR管理センター

AI技術を活用したIR業務支援システムのCMS部分

## 🚀 セットアップ

### 1. 必要な環境

- Python 3.8以上
- pip（Pythonパッケージマネージャー）

### 2. インストール

```bash
# CMSディレクトリに移動
cd cms

# 仮想環境の作成（推奨）
python -m venv venv

# 仮想環境の有効化
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 依存関係のインストール
pip install -r requirements.txt
```

### 3. 起動

```bash
# アプリケーションの起動
python app.py
```

ブラウザで `http://localhost:8000` にアクセスしてください。

## 📁 ディレクトリ構造

```
cms/
├── app.py              # FastAPIメインアプリケーション
├── requirements.txt    # Python依存関係
├── templates/          # HTMLテンプレート
│   ├── base.html      # ベーステンプレート
│   ├── dashboard.html # ダッシュボード
│   ├── faq.html       # FAQ管理
│   ├── investors.html # 投資家管理
│   ├── upload.html    # ファイルアップロード
│   └── analytics.html # 分析・レポート
└── static/            # 静的ファイル
    ├── css/          # スタイルシート
    └── js/           # JavaScript
```

## 🎯 主要機能

### 実装済み（モック）
- ✅ ダッシュボード（KPI表示、アクティビティフィード）
- ✅ AI-FAQ管理（作成、編集、削除、AI生成）
- ✅ 投資家管理（追加、詳細表示、活動履歴）
- ✅ ファイルアップロード（音声・動画、文書）
- ✅ 分析・レポート（グラフ、インサイト）

### 今後の実装予定
- 🔄 認証システム（ログイン機能）
- 🔄 実際のデータベース連携
- 🔄 AIエンジンとの統合
- 🔄 リアルタイムのファイル処理
- 🔄 レポートのPDF/Excel出力

## 🎨 デザインシステム

- **カラーテーマ**: KAGAMI Blue (#1a365d)
- **UIフレームワーク**: カスタムCSS（モダン・ミニマル）
- **レスポンシブ対応**: モバイル・タブレット・デスクトップ

## 📝 開発メモ

- 現在はすべてモックデータで動作
- フロントエンド（投資家向け）とCMS（管理者向け）のコンポーネントは分離済み
- 共通コンポーネントは `/shared` ディレクトリに配置

## 🛠️ トラブルシューティング

### ポートが使用中の場合
```bash
# 別のポートで起動
python app.py --port 8001
```

### 依存関係のエラー
```bash
# pipをアップグレード
pip install --upgrade pip

# 依存関係を再インストール
pip install -r requirements.txt --force-reinstall
```

## 📞 お問い合わせ

質問や不具合がある場合は、Issueを作成してください。
