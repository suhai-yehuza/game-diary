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

# Helper functions (using shared utilities where possible)
is_listening_on_port() {
    lsof -i:$PORT -sTCP:LISTEN >/dev/null 2>&1
}

find_server_pids() {
    lsof -ti:$PORT 2>/dev/null || echo ""
}

is_port_in_use() {
    local port="${1:-$PORT}"
    lsof -i:$port -sTCP:LISTEN >/dev/null 2>&1
}

show_server_status() {
    echo "📊 Server Status for Port $PORT"
    echo "================================"

    if is_listening_on_port; then
        local pids=$(find_server_pids)
        echo "✅ Server is running"
        echo "   PIDs: $pids"
        echo "   Port: $PORT"

        # Show process details
        for pid in $pids; do
            local cmd=$(ps -p $pid -o command= 2>/dev/null || echo "Unknown")
            echo "   Process $pid: $cmd"
        done
    else
        echo "❌ Server is not running"
    fi

    # Show port usage
    echo ""
    echo "🔍 Port $PORT Usage:"
    lsof -i:$PORT 2>/dev/null || echo "   No processes found"
}

start_server() {
    echo "🚀 Starting server on port $PORT..."

    # Kill any existing processes on port
    if is_port_in_use; then
        echo "🔄 Stopping existing processes on port $PORT..."
        kill $(find_server_pids) 2>/dev/null || true
        sleep 2
    fi

    # Set environment variables based on environment
    local env_vars=""
    case $ENVIRONMENT in
        "test")
            env_vars="API_MOCK_MODE=true E2E_MOCK_MODE=true"
            ;;
        "production")
            env_vars="NODE_ENV=production"
            ;;
        *)
            env_vars="NODE_ENV=development"
            ;;
    esac

    # Start server
    echo "🚀 Starting $ENVIRONMENT server..."
    if [ -n "$env_vars" ]; then
        env $env_vars npx next dev -p $PORT > "$LOG_FILE" 2>&1 &
    else
        npx next dev -p $PORT > "$LOG_FILE" 2>&1 &
    fi
    local server_pid=$!

    # Wait for server to start
    local attempts=0
    local max_attempts=30
    while [ $attempts -lt $max_attempts ]; do
        if is_listening_on_port; then
            echo "✅ Server started successfully (PID: $server_pid)"
            return 0
        fi

        if ! kill -0 $server_pid 2>/dev/null; then
            echo "❌ Server failed to start"
            echo "Logs:"
            tail -20 "$LOG_FILE"
            return 1
        fi

        sleep 1
        attempts=$((attempts + 1))
    done

    echo "❌ Server failed to start after $max_attempts attempts"
    return 1
}

stop_server() {
    echo "🛑 Stopping server on port $PORT..."

    if is_port_in_use; then
        local pids=$(find_server_pids)
        echo "🔄 Stopping processes: $pids"
        kill $pids 2>/dev/null || true

        # Wait for processes to stop
        local attempts=0
        local max_attempts=10
        while [ $attempts -lt $max_attempts ] && is_port_in_use; do
            sleep 1
            attempts=$((attempts + 1))
        done

        if is_port_in_use; then
            echo "⚠️  Force killing processes..."
            kill -9 $(find_server_pids) 2>/dev/null || true
        fi

        echo "✅ Server stopped"
    else
        echo "ℹ️  Server is not running"
    fi
}

show_logs() {
    if [[ "$FOLLOW_LOGS" == "true" ]]; then
        echo "📋 Following server logs (Ctrl+C to stop)..."
        tail -f "$LOG_FILE"
    else
        echo "📋 Recent server logs:"
        if [ -f "$LOG_FILE" ]; then
            tail -50 "$LOG_FILE"
        else
            echo "   No log file found"
        fi
    fi
}

# Main execution
case "$MODE" in
    "status")
        show_server_status
        ;;

    "start")
        start_server
        ;;

    "stop")
        stop_server
        ;;

    "restart")
        stop_server
        sleep 2
        start_server
        ;;

    "logs")
        show_logs
        ;;

    "kill")
        echo "💀 Force killing server on port $PORT..."
        kill -9 $(find_server_pids) 2>/dev/null || true
        echo "✅ Server killed"
        ;;

    "help"|"-h"|"--help")
        show_usage
        exit 0
        ;;

    *)
        echo "❌ Unknown mode: $MODE"
        show_usage
        exit 1
        ;;
esac

# Enhanced functionality from dev-server-mngmt.sh

# Function to check if a process is a Next.js server
is_nextjs_server() {
    local pid=$1
    ps -p $pid -o command= 2>/dev/null | grep -q "next"
}

# Function to find Next.js server PIDs on a port
find_nextjs_servers() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null || echo "")
    echo "$pids"
}

# Enhanced server status
enhanced_server_status() {
    local port="$1"
    echo "📊 Enhanced Server Status for Port $port"
    echo "========================================"

    if is_listening_on_port $port; then
        local pids=$(find_nextjs_servers $port)
        echo "✅ Server is running"
        echo "   PIDs: $pids"
        echo "   Port: $port"

        # Show process details
        for pid in $pids; do
            local cmd=$(ps -p $pid -o command= 2>/dev/null || echo "Unknown")
            echo "   Process $pid: $cmd"
        done
    else
        echo "❌ Server is not running"
    fi

    # Show port usage
    echo ""
    echo "🔍 Port $port Usage:"
    lsof -i:$port 2>/dev/null || echo "   No processes found"
}

# Enhanced server operations
enhanced_start_server() {
    local port="$1"
    local environment="${2:-development}"

    log_info "Starting enhanced server on port $port in $environment mode..."

    # Kill any existing processes on port
    if is_port_in_use $port; then
        log_info "Stopping existing processes on port $port..."
        kill $(find_nextjs_servers $port) 2>/dev/null || true
        sleep 2
    fi

    # Set environment variables based on environment
    local env_vars=""
    case $environment in
        "test")
            env_vars="API_MOCK_MODE=true E2E_MOCK_MODE=true"
            ;;
        "production")
            env_vars="NODE_ENV=production"
            ;;
        *)
            env_vars="NODE_ENV=development"
            ;;
    esac

    # Start server
    log_info "Starting $environment server..."
    $env_vars pnpm dev -p $port > "$LOG_FILE" 2>&1 &
    local server_pid=$!

    # Wait for server to start
    local attempts=0
    local max_attempts=30
    while [ $attempts -lt $max_attempts ]; do
        if is_listening_on_port $port; then
            log_success "Enhanced server started successfully (PID: $server_pid)"
            return 0
        fi

        if ! kill -0 $server_pid 2>/dev/null; then
            log_error "Server failed to start"
            echo "Logs:"
            tail -20 "$LOG_FILE"
            return 1
        fi

        sleep 1
        attempts=$((attempts + 1))
    done

    log_error "Server failed to start after $max_attempts attempts"
    return 1
}
