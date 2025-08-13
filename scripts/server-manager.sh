#!/bin/bash

# Server Manager Script
# Usage: ./scripts/server-manager.sh [mode] [options]

set -e

# Source shared utilities
source "$(dirname "$0")/script-utils.sh"

# Default values
PORT=3000
MODE="status"  # status, start, stop, restart, logs, kill
LOG_FILE="/tmp/nextjs-dev-${PORT}.log"
ENVIRONMENT="development"  # development, test, production

# Function to show usage
show_usage() {
    echo "Usage: $0 [mode] [options]"
    echo ""
    echo "Modes:"
    echo "  status              - Show server status (default)"
    echo "  start [env]         - Start server"
    echo "  stop                - Stop server"
    echo "  restart [env]       - Restart server"
    echo "  logs [follow]       - Show server logs"
    echo "  kill                - Force kill server"
    echo ""
    echo "Environments:"
    echo "  development (default), test, production"
    echo ""
    echo "Options:"
    echo "  --port=N            - Port number (default: 3000)"
    echo "  --env=ENV           - Environment (dev, test, prod)"
    echo "  --follow            - Follow logs (for logs mode)"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 start test"
    echo "  $0 logs --follow"
    echo "  $0 restart production --port=3001"
}

# Parse arguments
MODE="${1:-status}"
shift 1

while [[ $# -gt 0 ]]; do
    case $1 in
        --port=*)
            PORT="${1#*=}"
            LOG_FILE="/tmp/nextjs-dev-${PORT}.log"
            shift
            ;;
        --env=*)
            ENVIRONMENT="${1#*=}"
            shift
            ;;
        --follow)
            FOLLOW_LOGS=true
            shift
            ;;
        --help|-h)
            show_usage
            exit 0
            ;;
        *)
            if [[ "$MODE" == "start" || "$MODE" == "restart" ]] && [[ -z "$ENVIRONMENT" ]]; then
                ENVIRONMENT="$1"
            fi
            shift
            ;;
    esac
done



# Main functions using centralized utilities
display_server_status() {
    show_server_status "$PORT"
}

start_server() {
    start_server_with_retry "$PORT" "$ENVIRONMENT" 30 "$LOG_FILE"
}



show_logs() {
    if [ -f "$LOG_FILE" ]; then
        if [ "$FOLLOW_LOGS" = true ]; then
            log_info "Following server logs (Ctrl+C to stop)..."
            tail -f "$LOG_FILE"
        else
            log_info "Showing recent server logs:"
            tail -50 "$LOG_FILE"
        fi
    else
        log_error "Log file not found: $LOG_FILE"
        return 1
    fi
}

restart_server() {
    log_info "Restarting server on port $PORT..."
    stop_server "$PORT" false
    sleep 2
    start_server
}

# Enhanced server status with more details
show_enhanced_status() {
    local port="$1"
    log_info "Enhanced Server Status for Port $port"
    echo "=========================================="

    if is_listening_on_port "$port"; then
        local pids=$(find_server_pids "$port")
        log_success "Server is running"
        echo "   PIDs: $pids"
        echo "   Port: $port"
        echo "   Environment: $ENVIRONMENT"

        # Show memory usage
        for pid in $pids; do
            local mem_usage=$(ps -p $pid -o rss= 2>/dev/null || echo "Unknown")
            local cpu_usage=$(ps -p $pid -o %cpu= 2>/dev/null || echo "Unknown")
            echo "   Process $pid: Memory=${mem_usage}KB, CPU=${cpu_usage}%"
        done

        # Show recent log entries
        if [ -f "$LOG_FILE" ]; then
            echo ""
            log_info "Recent Log Entries:"
            tail -5 "$LOG_FILE" | sed 's/^/   /'
        fi
    else
        log_error "Server is not running"
    fi
}

# Main execution
case "$MODE" in
    status)
        display_server_status
        ;;
    start)
        start_server
        ;;
    stop)
        stop_server "$PORT" false
        ;;
    restart)
        restart_server
        ;;
    logs)
        show_logs
        ;;
    kill)
        log_warning "Force killing processes on port $PORT..."
        stop_server "$PORT" true
        ;;
    enhanced-status)
        show_enhanced_status "$PORT"
        ;;
    *)
        log_error "Unknown mode: $MODE"
        show_usage
        exit 1
        ;;
esac
