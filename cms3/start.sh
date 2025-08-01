#!/bin/bash

# KAGAMI IR System - Startup Script
# =================================

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# プロジェクト情報
PROJECT_NAME="KAGAMI IR System"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$PROJECT_DIR/venv"
REQUIREMENTS_FILE="$PROJECT_DIR/requirements.txt"
LOG_DIR="$PROJECT_DIR/logs"
PID_FILE="$PROJECT_DIR/.server.pid"

# デフォルト設定
DEFAULT_PORT=8000
DEFAULT_HOST="127.0.0.1"
ENVIRONMENT="development"

# ロゴ表示
show_logo() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║                                                       ║"
    echo "║   ██╗  ██╗ █████╗  ██████╗  █████╗ ███╗   ███╗██╗   ║"
    echo "║   ██║ ██╔╝██╔══██╗██╔════╝ ██╔══██╗████╗ ████║██║   ║"
    echo "║   █████╔╝ ███████║██║  ███╗███████║██╔████╔██║██║   ║"
    echo "║   ██╔═██╗ ██╔══██║██║   ██║██╔══██║██║╚██╔╝██║██║   ║"
    echo "║   ██║  ██╗██║  ██║╚██████╔╝██║  ██║██║ ╚═╝ ██║██║   ║"
    echo "║   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝   ║"
    echo "║                                                       ║"
    echo "║           IR Integration Management System            ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 使用方法表示
show_usage() {
    echo "使用方法: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "COMMANDS:"
    echo "  start       開発サーバーを起動"
    echo "  stop        開発サーバーを停止"
    echo "  restart     開発サーバーを再起動"
    echo "  status      サーバーの状態を確認"
    echo "  setup       初期セットアップを実行"
    echo "  migrate     データベースマイグレーションを実行"
    echo "  test        テストを実行"
    echo "  shell       Djangoシェルを起動"
    echo "  logs        ログを表示"
    echo ""
    echo "OPTIONS:"
    echo "  --port PORT      ポート番号を指定 (デフォルト: $DEFAULT_PORT)"
    echo "  --host HOST      ホストを指定 (デフォルト: $DEFAULT_HOST)"
    echo "  --production     本番環境モードで起動"
    echo "  --help           このヘルプを表示"
    echo ""
}

# ログ関数
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} ${timestamp} - $message"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} ${timestamp} - $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} ${timestamp} - $message"
            ;;
        *)
            echo "${timestamp} - $message"
            ;;
    esac
    
    # ファイルにも記録
    [ ! -d "$LOG_DIR" ] && mkdir -p "$LOG_DIR"
    echo "${timestamp} [$level] $message" >> "$LOG_DIR/startup.log"
}

# エラーハンドリング
error_exit() {
    log "ERROR" "$1"
    exit 1
}

# Python環境チェック
check_python() {
    log "INFO" "Python環境をチェック中..."
    
    if ! command -v python3 &> /dev/null; then
        error_exit "Python3がインストールされていません。"
    fi
    
    PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
    log "INFO" "Python $PYTHON_VERSION を検出しました"
    
    # Python 3.8以上を推奨
    if (( $(echo "$PYTHON_VERSION < 3.8" | bc -l) )); then
        log "WARN" "Python 3.8以上を推奨します"
    fi
}

# 仮想環境のセットアップ
setup_venv() {
    if [ ! -d "$VENV_DIR" ]; then
        log "INFO" "仮想環境を作成中..."
        python3 -m venv "$VENV_DIR" || error_exit "仮想環境の作成に失敗しました"
        log "INFO" "仮想環境を作成しました"
    fi
    
    log "INFO" "仮想環境をアクティベート中..."
    source "$VENV_DIR/bin/activate" || error_exit "仮想環境のアクティベートに失敗しました"
}

# 依存関係のインストール
install_dependencies() {
    log "INFO" "依存関係をチェック中..."
    
    if [ ! -f "$REQUIREMENTS_FILE" ]; then
        log "WARN" "requirements.txtが見つかりません。作成します..."
        cat > "$REQUIREMENTS_FILE" << EOF
Django==4.2.8
python-dotenv==1.0.0
mysqlclient==2.2.0
Pillow==10.1.0
django-crispy-forms==2.1
crispy-bootstrap5==0.7
djangorestframework==3.14.0
django-cors-headers==4.3.0
celery==5.3.4
redis==5.0.1
gunicorn==21.2.0
whitenoise==6.6.0
EOF
        log "INFO" "requirements.txtを作成しました"
    fi
    
    pip install --upgrade pip > /dev/null 2>&1
    pip install -r "$REQUIREMENTS_FILE" > /dev/null 2>&1 || error_exit "依存関係のインストールに失敗しました"
    log "INFO" "依存関係のインストールが完了しました"
}

# データベースの初期化
setup_database() {
    log "INFO" "データベースをセットアップ中..."
    
    # マイグレーションファイルの作成
    python manage.py makemigrations --noinput > /dev/null 2>&1
    
    # マイグレーションの実行
    python manage.py migrate --noinput || error_exit "データベースマイグレーションに失敗しました"
    
    log "INFO" "データベースのセットアップが完了しました"
}

# 静的ファイルの収集
collect_static() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log "INFO" "静的ファイルを収集中..."
        python manage.py collectstatic --noinput || log "WARN" "静的ファイルの収集に失敗しました"
    fi
}

# 初期セットアップ
initial_setup() {
    show_logo
    log "INFO" "初期セットアップを開始します..."
    
    check_python
    setup_venv
    install_dependencies
    
    # .envファイルの作成
    if [ ! -f "$PROJECT_DIR/.env" ]; then
        log "INFO" ".envファイルを作成中..."
        cat > "$PROJECT_DIR/.env" << EOF
# Django設定
DEBUG=True
SECRET_KEY=your-secret-key-here-$(openssl rand -hex 32)
ALLOWED_HOSTS=localhost,127.0.0.1

# データベース設定
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3

# その他の設定
LANGUAGE_CODE=ja
TIME_ZONE=Asia/Tokyo
EOF
        log "INFO" ".envファイルを作成しました"
    fi
    
    setup_database
    
    # スーパーユーザーの作成
    log "INFO" "管理者アカウントを作成しますか？ (y/N)"
    read -r CREATE_SUPERUSER
    if [[ "$CREATE_SUPERUSER" =~ ^[Yy]$ ]]; then
        python manage.py createsuperuser
    fi
    
    log "INFO" "初期セットアップが完了しました！"
}

# サーバー起動
start_server() {
    local port=${PORT:-$DEFAULT_PORT}
    local host=${HOST:-$DEFAULT_HOST}
    
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        log "WARN" "サーバーは既に起動しています (PID: $(cat $PID_FILE))"
        return
    fi
    
    setup_venv
    
    log "INFO" "サーバーを起動中... ($host:$port)"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        collect_static
        gunicorn cms3.wsgi:application \
            --bind $host:$port \
            --workers 4 \
            --pid "$PID_FILE" \
            --daemon \
            --access-logfile "$LOG_DIR/access.log" \
            --error-logfile "$LOG_DIR/error.log"
    else
        python manage.py runserver $host:$port &
        echo $! > "$PID_FILE"
    fi
    
    sleep 2
    
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        log "INFO" "サーバーが起動しました！"
        log "INFO" "URL: http://$host:$port/"
        log "INFO" "管理画面: http://$host:$port/admin/"
        log "INFO" "停止するには: $0 stop"
    else
        error_exit "サーバーの起動に失敗しました"
    fi
}

# サーバー停止
stop_server() {
    if [ ! -f "$PID_FILE" ]; then
        log "WARN" "サーバーは起動していません"
        return
    fi
    
    local pid=$(cat "$PID_FILE")
    if kill -0 $pid 2>/dev/null; then
        log "INFO" "サーバーを停止中... (PID: $pid)"
        kill $pid
        rm -f "$PID_FILE"
        log "INFO" "サーバーを停止しました"
    else
        log "WARN" "プロセスが見つかりません"
        rm -f "$PID_FILE"
    fi
}

# サーバー状態確認
check_status() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        log "INFO" "サーバーは起動しています (PID: $(cat $PID_FILE))"
    else
        log "INFO" "サーバーは停止しています"
    fi
}

# ログ表示
show_logs() {
    if [ -d "$LOG_DIR" ]; then
        log "INFO" "最新のログを表示します..."
        tail -f "$LOG_DIR"/*.log
    else
        log "WARN" "ログファイルが見つかりません"
    fi
}

# マイグレーション実行
run_migrations() {
    setup_venv
    log "INFO" "マイグレーションを実行中..."
    python manage.py makemigrations
    python manage.py migrate
    log "INFO" "マイグレーションが完了しました"
}

# テスト実行
run_tests() {
    setup_venv
    log "INFO" "テストを実行中..."
    python manage.py test
}

# Djangoシェル起動
run_shell() {
    setup_venv
    log "INFO" "Djangoシェルを起動します..."
    python manage.py shell
}

# メイン処理
main() {
    cd "$PROJECT_DIR" || error_exit "プロジェクトディレクトリに移動できません"
    
    # コマンドライン引数の解析
    COMMAND=${1:-"start"}
    shift
    
    # オプションの解析
    while [[ $# -gt 0 ]]; do
        case $1 in
            --port)
                PORT="$2"
                shift 2
                ;;
            --host)
                HOST="$2"
                shift 2
                ;;
            --production)
                ENVIRONMENT="production"
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                log "ERROR" "不明なオプション: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # コマンドの実行
    case $COMMAND in
        start)
            show_logo
            start_server
            ;;
        stop)
            stop_server
            ;;
        restart)
            stop_server
            sleep 1
            start_server
            ;;
        status)
            check_status
            ;;
        setup)
            initial_setup
            ;;
        migrate)
            run_migrations
            ;;
        test)
            run_tests
            ;;
        shell)
            run_shell
            ;;
        logs)
            show_logs
            ;;
        *)
            log "ERROR" "不明なコマンド: $COMMAND"
            show_usage
            exit 1
            ;;
    esac
}

# スクリプトの実行
main "$@"