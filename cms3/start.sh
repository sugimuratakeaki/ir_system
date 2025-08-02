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
DEFAULT_PORT=8003
DEFAULT_HOST="0.0.0.0"
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
fastapi==0.104.1
uvicorn[standard]==0.24.0
jinja2==3.1.2
python-multipart==0.0.6
aiofiles==23.2.1
EOF
        log "INFO" "requirements.txtを作成しました"
    fi
    
    pip install --upgrade pip > /dev/null 2>&1
    pip install -r "$REQUIREMENTS_FILE" > /dev/null 2>&1 || error_exit "依存関係のインストールに失敗しました"
    log "INFO" "依存関係のインストールが完了しました"
}

# データベースの初期化（FastAPIではファイルベースなのでスキップ）
setup_database() {
    log "INFO" "データベースセットアップをスキップします（FastAPIはファイルベース）"
}

# 静的ファイルの収集（FastAPIでは自動処理）
collect_static() {
    log "INFO" "静的ファイルはFastAPIが自動処理します"
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
    
    # ポートの使用状況をチェック
    if check_port_usage $port >/dev/null; then
        log "WARN" "ポート $port は既に使用されています"
        local pids=$(check_port_usage $port)
        log "INFO" "使用中のプロセス: $pids"
        
        read -p "ポートを使用しているプロセスを強制終了しますか? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            force_kill_port $port
            sleep 2
        else
            error_exit "ポート $port が使用中のため、サーバーを起動できません"
        fi
    fi
    
    setup_venv
    
    log "INFO" "サーバーを起動中... ($host:$port)"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        collect_static
        uvicorn app:app \
            --host $host \
            --port $port \
            --workers 4 \
            --access-log \
            --loop uvloop &
        echo $! > "$PID_FILE"
    else
        uvicorn app:app \
            --host $host \
            --port $port \
            --reload \
            --access-log &
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

# ポートの使用状況をチェック
check_port_usage() {
    local port=$1
    lsof -ti :$port 2>/dev/null
}

# ポートが解放されるまで待機
wait_for_port_release() {
    local port=$1
    local max_wait=${2:-30}  # 最大30秒待機
    local count=0
    
    log "INFO" "ポート $port の解放を待機中..."
    
    while [ $count -lt $max_wait ]; do
        if ! check_port_usage $port >/dev/null; then
            log "INFO" "ポート $port が解放されました"
            return 0
        fi
        sleep 1
        count=$((count + 1))
        echo -n "."
    done
    
    echo ""
    log "WARN" "ポート $port の解放を $max_wait 秒待機しましたが、まだ使用中です"
    return 1
}

# ポートを使用しているプロセスを強制終了
force_kill_port() {
    local port=$1
    local pids=$(check_port_usage $port)
    
    if [ -n "$pids" ]; then
        log "WARN" "ポート $port を使用しているプロセスを強制終了します: $pids"
        echo "$pids" | xargs kill -9 2>/dev/null
        sleep 2
        
        # 再度チェック
        if check_port_usage $port >/dev/null; then
            log "ERROR" "ポート $port の強制終了に失敗しました"
            return 1
        else
            log "INFO" "ポート $port のプロセスを強制終了しました"
            return 0
        fi
    fi
    return 0
}

# サーバー停止
stop_server() {
    local port=${PORT:-$DEFAULT_PORT}
    
    if [ ! -f "$PID_FILE" ]; then
        log "WARN" "PIDファイルが見つかりません"
        # PIDファイルがなくてもポートをチェック
        if check_port_usage $port >/dev/null; then
            log "INFO" "ポート $port を使用しているプロセスが見つかりました"
            force_kill_port $port
        else
            log "INFO" "サーバーは起動していません"
        fi
        return
    fi
    
    local pid=$(cat "$PID_FILE")
    if kill -0 $pid 2>/dev/null; then
        log "INFO" "サーバーを停止中... (PID: $pid)"
        kill $pid
        
        # プロセスの終了を待機
        local count=0
        while [ $count -lt 10 ] && kill -0 $pid 2>/dev/null; do
            sleep 1
            count=$((count + 1))
        done
        
        # まだ生きている場合は強制終了
        if kill -0 $pid 2>/dev/null; then
            log "WARN" "プロセス $pid を強制終了します"
            kill -9 $pid 2>/dev/null
        fi
        
        rm -f "$PID_FILE"
        log "INFO" "サーバーを停止しました"
    else
        log "WARN" "プロセスが見つかりません"
        rm -f "$PID_FILE"
    fi
    
    # ポートの解放を確認
    if check_port_usage $port >/dev/null; then
        log "WARN" "ポート $port がまだ使用中です。強制終了を試行します"
        force_kill_port $port
    fi
}

# サーバー状態確認
check_status() {
    local port=${PORT:-$DEFAULT_PORT}
    local host=${HOST:-$DEFAULT_HOST}
    
    echo -e "${BLUE}=== サーバー状態確認 ===${NC}"
    
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        local pid=$(cat "$PID_FILE")
        log "INFO" "サーバーは起動しています"
        echo "  PID: $pid"
        echo "  URL: http://$host:$port/"
        
        # ポートの使用状況も確認
        if check_port_usage $port >/dev/null; then
            echo -e "  ポート $port: ${GREEN}使用中${NC}"
        else
            echo -e "  ポート $port: ${YELLOW}未使用${NC} (プロセスは起動中だが、ポートが開いていません)"
        fi
    else
        log "INFO" "サーバーは停止しています"
        
        # PIDファイルがない場合でもポートをチェック
        if check_port_usage $port >/dev/null; then
            local pids=$(check_port_usage $port)
            echo -e "  ポート $port: ${YELLOW}他のプロセスが使用中${NC}"
            echo "  使用中のプロセス: $pids"
        else
            echo -e "  ポート $port: ${GREEN}利用可能${NC}"
        fi
    fi
    
    # ログファイルの情報
    if [ -d "$LOG_DIR" ]; then
        local log_count=$(find "$LOG_DIR" -name "*.log" 2>/dev/null | wc -l)
        echo "  ログファイル: $log_count 個"
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

# マイグレーション実行（FastAPIではスキップ）
run_migrations() {
    setup_venv
    log "INFO" "FastAPIではマイグレーションは不要です"
}

# テスト実行
run_tests() {
    setup_venv
    log "INFO" "テストを実行中..."
    python -m pytest tests/ -v
}

# Pythonシェル起動
run_shell() {
    setup_venv
    log "INFO" "Pythonシェルを起動します..."
    python -i -c "from app import app; print('FastAPI app imported as app')"
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
            show_logo
            local port=${PORT:-$DEFAULT_PORT}
            
            log "INFO" "サーバーを再起動しています..."
            
            # 1. 既存サーバーを停止
            stop_server
            
            # 2. ポートの解放を待機
            if ! wait_for_port_release $port 15; then
                # 3. 必要に応じて強制終了
                force_kill_port $port
                
                # 4. 再度待機
                if ! wait_for_port_release $port 10; then
                    error_exit "ポート $port の解放に失敗しました。手動で確認してください。"
                fi
            fi
            
            # 5. 少し待ってからサーバー起動
            sleep 2
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