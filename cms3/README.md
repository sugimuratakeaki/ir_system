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
- FastAPI 0.104.1
- Uvicorn（ASGIサーバー）
- Jinja2（テンプレートエンジン）
- Python-multipart（フォーム処理）
- Aiofiles（非同期ファイル操作）

### フロントエンド
- HTML5 / CSS3
- JavaScript (Vanilla)
- CSS Grid / Flexbox
- Chart.js（データ可視化）

### データベース
- ファイルベース（JSON）
- 将来的にはPostgreSQL/MySQL対応予定

### その他
- Uvicorn（本番環境対応）
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
- フロントサイト: http://localhost:8003/
- ヘルスチェック: http://localhost:8003/health
- API: http://localhost:8003/api/test-data/sample

## プロジェクト構造
```
cms3/
├── start.sh              # 起動スクリプト（FastAPI用）
├── app.py               # FastAPIメインアプリケーション
├── requirements.txt     # Python依存関係
├── config/             # 設定ファイル
│   ├── __init__.py
│   ├── roles.py
│   └── settings.py
├── utils/              # ユーティリティ
├── templates/          # HTMLテンプレート（Jinja2）
│   ├── base/          # ベーステンプレート
│   ├── components/    # 再利用可能なコンポーネント
│   ├── front/         # フロントサイト
│   ├── ir/            # IR担当者向け
│   ├── executive/     # 経営陣向け
│   ├── director/      # 社外取締役向け
│   └── errors/        # エラーページ
├── static/            # 静的ファイル
│   ├── css/           # スタイルシート
│   ├── js/            # JavaScript
│   ├── images/        # 画像ファイル
│   └── data/          # テストデータ（JSON）
├── venv/              # Python仮想環境
└── logs/              # ログファイル
```

## 開発ガイド

### 仮想環境の有効化
```bash
source venv/bin/activate
```

### サーバーの停止
```bash
./start.sh stop
```

### サーバーの状態確認
```bash
./start.sh status
```

### テストの実行
```bash
./start.sh test
```

### 開発用シェルの起動
```bash
./start.sh shell
```

## デプロイ

### 本番環境の設定
1. 本番環境での起動
```bash
./start.sh start --production
```

2. 特定のポート/ホストでの起動
```bash
./start.sh start --port 8080 --host 127.0.0.1
```

3. FastAPI自動ドキュメント
- Swagger UI: http://localhost:8003/docs
- ReDoc: http://localhost:8003/redoc

### Docker対応（オプション）
```bash
docker-compose up -d
```

## セキュリティ

- XSS対策：Jinja2テンプレートの自動エスケープ
- CORS対策：FastAPI組み込み機能
- 認証・認可：実装予定
- HTTPS：本番環境では必須
- 入力検証：Pydanticモデル使用

## ライセンス
このプロジェクトは株式会社KAGAMIの専有ソフトウェアです。

## サポート
- 技術的な質問：tech-support@kagami.co.jp
- バグ報告：GitHub Issues
- ドキュメント：[Wiki](https://github.com/your-org/kagami-ir-system/wiki)

## 貢献
プルリクエストを歓迎します。大きな変更の場合は、まずissueを作成して変更内容を議論してください。

## 更新履歴
- v3.0.0 (2025-01-XX) - FastAPIによる新アーキテクチャ
- v1.0.0 (2024-12-XX) - 初回リリース