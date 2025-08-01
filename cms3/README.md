# KAGAMI - IR統合管理システム

## 概要
KAGAMIは、企業のIR（Investor Relations）活動を統合的に管理し、投資家との効果的なコミュニケーションを実現するWebアプリケーションです。

## 主な機能

### 🏢 投資家向け機能
- 企業情報・財務データの閲覧
- 決算資料・開示資料のダウンロード
- IRカレンダーでのイベント確認
- 面談申込・お問い合わせ

### 👔 IR担当者向け機能
- 投資家情報の一元管理
- 議事録作成・管理
- スケジュール管理
- コンテンツ管理（資料アップロード・配信）
- 投資家動向分析
- 適時開示ワークフロー

### 📊 経営陣向け機能
- 経営ダッシュボード
- 市場動向・投資家動向分析
- 四半期レポート自動生成

### 🔍 社外取締役向け機能
- ガバナンス監督ダッシュボード
- コンプライアンスチェック
- 投資家フィードバック分析

## 技術スタック

### バックエンド
- Python 3.8+
- Django 4.2.8
- Django REST Framework
- Celery（非同期タスク）

### フロントエンド
- HTML5 / CSS3
- JavaScript (Vanilla)
- Tailwind CSS
- Chart.js（データ可視化）

### データベース
- SQLite（開発環境）
- MySQL/PostgreSQL（本番環境推奨）

### その他
- Redis（キャッシュ・セッション）
- Gunicorn（本番環境）
- Nginx（リバースプロキシ）

## クイックスタート

### 1. リポジトリのクローン
```bash
git clone https://github.com/your-org/kagami-ir-system.git
cd kagami-ir-system/cms3
```

### 2. 実行権限の付与
```bash
chmod +x start.sh
```

### 3. 初期セットアップ
```bash
./start.sh setup
```

### 4. サーバーの起動
```bash
./start.sh start
```

### 5. アクセス
- フロントサイト: http://localhost:8000/
- 管理画面: http://localhost:8000/admin/

## プロジェクト構造
```
cms3/
├── start.sh              # 起動スクリプト
├── manage.py            # Django管理コマンド
├── requirements.txt     # Python依存関係
├── .env                # 環境変数（要作成）
├── cms3/               # プロジェクト設定
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/               # アプリケーション
│   ├── investors/      # 投資家管理
│   ├── documents/      # ドキュメント管理
│   ├── analytics/      # 分析機能
│   └── ...
├── templates/          # HTMLテンプレート
│   ├── base/          # ベーステンプレート
│   ├── front/         # フロントサイト
│   ├── investor/      # 投資家向け
│   ├── ir/            # IR担当者向け
│   ├── executive/     # 経営陣向け
│   └── director/      # 社外取締役向け
├── static/            # 静的ファイル
│   ├── css/
│   ├── js/
│   └── images/
└── logs/              # ログファイル
```

## 開発ガイド

### 仮想環境の有効化
```bash
source venv/bin/activate
```

### マイグレーションの実行
```bash
./start.sh migrate
```

### テストの実行
```bash
./start.sh test
```

### 新しいアプリの作成
```bash
python manage.py startapp app_name
```

## デプロイ

### 本番環境の設定
1. `.env`ファイルの編集
   - `DEBUG=False`
   - `SECRET_KEY`を安全な値に変更
   - `ALLOWED_HOSTS`に本番ドメインを追加

2. 静的ファイルの収集
```bash
python manage.py collectstatic
```

3. 本番環境での起動
```bash
./start.sh start --production
```

### Docker対応（オプション）
```bash
docker-compose up -d
```

## セキュリティ

- SQLインジェクション対策：Django ORM使用
- XSS対策：テンプレートの自動エスケープ
- CSRF対策：Django組み込みミドルウェア
- 認証・認可：Django認証システム
- HTTPS：本番環境では必須

## ライセンス
このプロジェクトは株式会社KAGAMIの専有ソフトウェアです。

## サポート
- 技術的な質問：tech-support@kagami.co.jp
- バグ報告：GitHub Issues
- ドキュメント：[Wiki](https://github.com/your-org/kagami-ir-system/wiki)

## 貢献
プルリクエストを歓迎します。大きな変更の場合は、まずissueを作成して変更内容を議論してください。

## 更新履歴
- v1.0.0 (2024-12-XX) - 初回リリース