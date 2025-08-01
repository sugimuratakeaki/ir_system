# KAGAMI IR System - 起動スクリプト

## 概要
`start.sh`は、KAGAMI IR Systemの開発・本番環境での起動と管理を簡単に行うためのスクリプトです。

## 実行権限の付与
```bash
chmod +x start.sh
```

## 基本的な使い方

### 初期セットアップ
初めてシステムを起動する場合：
```bash
./start.sh setup
```
これにより以下が実行されます：
- Python環境のチェック
- 仮想環境の作成
- 依存関係のインストール
- データベースの初期化
- 管理者アカウントの作成（オプション）

### サーバーの起動
```bash
./start.sh start
```

### サーバーの停止
```bash
./start.sh stop
```

### サーバーの再起動
```bash
./start.sh restart
```

### サーバーの状態確認
```bash
./start.sh status
```

## 高度な使い方

### ポートを指定して起動
```bash
./start.sh start --port 8080
```

### ホストを指定して起動
```bash
./start.sh start --host 0.0.0.0
```

### 本番環境モードで起動
```bash
./start.sh start --production
```

### データベースマイグレーション
```bash
./start.sh migrate
```

### テストの実行
```bash
./start.sh test
```

### Djangoシェルの起動
```bash
./start.sh shell
```

### ログの表示
```bash
./start.sh logs
```

## 環境設定

### .envファイル
初期セットアップ時に`.env`ファイルが自動生成されます。必要に応じて以下の設定を変更してください：

```env
# Django設定
DEBUG=True                          # 本番環境ではFalseに設定
SECRET_KEY=your-secret-key-here     # 安全なランダム文字列に変更
ALLOWED_HOSTS=localhost,127.0.0.1   # 本番環境では適切なドメインに設定

# データベース設定
DB_ENGINE=django.db.backends.sqlite3  # MySQL等に変更可能
DB_NAME=db.sqlite3                    # データベース名

# その他の設定
LANGUAGE_CODE=ja
TIME_ZONE=Asia/Tokyo
```

### requirements.txt
必要なPythonパッケージは`requirements.txt`に記載されています：
- Django 4.2.8
- python-dotenv
- mysqlclient
- Pillow
- django-crispy-forms
- djangorestframework
- celery
- redis
- gunicorn
- whitenoise

## トラブルシューティング

### サーバーが起動しない
1. Python 3.8以上がインストールされているか確認
2. `./start.sh status`でプロセスの状態を確認
3. `logs/`ディレクトリのログファイルを確認

### データベースエラー
```bash
./start.sh migrate
```
を実行してデータベースを最新の状態に更新

### 依存関係のエラー
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### ポートが使用中
別のポートを指定して起動：
```bash
./start.sh start --port 8001
```

## セキュリティに関する注意

1. **SECRET_KEY**：本番環境では必ず変更してください
2. **DEBUG**：本番環境では必ず`False`に設定
3. **ALLOWED_HOSTS**：本番環境では適切なドメインのみを指定
4. **データベース**：本番環境ではSQLiteではなくPostgreSQLやMySQLを推奨

## サポート

問題が発生した場合は、以下を確認してください：
- `logs/startup.log`：起動時のログ
- `logs/error.log`：エラーログ（本番環境）
- `logs/access.log`：アクセスログ（本番環境）