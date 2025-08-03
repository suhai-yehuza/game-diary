#!/bin/bash

# Script Utilities for Shell Scripts
# Common functions used across multiple scripts

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

log_info() {
    echo -e "${PURPLE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️${NC} $1"
}

# Error handling
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code $exit_code"
    exit $exit_code
}

# Set up error handling
trap handle_error ERR

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if file exists
file_exists() {
    [ -f "$1" ]
}

# Check if directory exists
dir_exists() {
    [ -d "$1" ]
}

# Check if port is in use
port_in_use() {
    lsof -ti:$1 >/dev/null 2>&1
}

# Kill processes on port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null || echo "")
    if [ -n "$pids" ]; then
        log_info "Killing processes on port $port: $pids"
        kill $pids 2>/dev/null || true
        sleep 2
    fi
}

# Wait for port to be available
wait_for_port() {
    local port=$1
    local timeout=${2:-30}
    local attempts=0

    log_info "Waiting for port $port to be available..."
    while [ $attempts -lt $timeout ]; do
        if ! port_in_use $port; then
            log_success "Port $port is available"
            return 0
        fi
        sleep 1
        attempts=$((attempts + 1))
    done

    log_error "Port $port is still in use after $timeout seconds"
    return 1
}

# Check if we're in the right directory
check_project_root() {
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
}

# Install dependencies if needed
ensure_dependencies() {
    if [[ ! -d "node_modules" ]]; then
        log_info "Installing dependencies..."
        pnpm install
    fi
}

# Show script header
show_header() {
    local title="$1"
    echo ""
    echo "=========================================="
    echo "  $title"
    echo "=========================================="
    echo ""
}

# Show script footer
show_footer() {
    local message="$1"
    echo ""
    echo "=========================================="
    echo "  $message"
    echo "=========================================="
    echo ""
}

# Parse command line arguments with help
parse_args() {
    local args=("$@")
    local parsed=()

    for arg in "${args[@]}"; do
        case $arg in
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                parsed+=("$arg")
                ;;
        esac
    done

    echo "${parsed[@]}"
}

# Validate required arguments
validate_required() {
    local value="$1"
    local name="$2"

    if [[ -z "$value" ]]; then
        log_error "$name is required"
        exit 1
    fi
}

# Show progress
show_progress() {
    local current=$1
    local total=$2
    local message="$3"

    local percentage=$((current * 100 / total))
    printf "\r%s: %d%% (%d/%d)" "$message" $percentage $current $total
}

# Complete progress
complete_progress() {
    local message="$1"
    printf "\r%s: 100%% ✅\n" "$message"
}

# Port management functions (centralized)
find_server_pids() {
    local port="${1:-3000}"
    lsof -ti:$port 2>/dev/null || echo ""
}

is_port_in_use() {
    local port="${1:-3000}"
    lsof -i:$port -sTCP:LISTEN >/dev/null 2>&1
}

is_listening_on_port() {
    local port="${1:-3000}"
    lsof -i:$port -sTCP:LISTEN >/dev/null 2>&1
}

# Server management functions (centralized)
start_server_with_retry() {
    local port="${1:-3000}"
    local environment="${2:-development}"
    local max_attempts="${3:-30}"
    local log_file="${4:-/tmp/nextjs-dev-${port}.log}"

    log_info "Starting $environment server on port $port..."

    # Kill any existing processes on port
    if is_port_in_use "$port"; then
        log_info "Stopping existing processes on port $port..."
        local pids=$(find_server_pids "$port")
        if [ -n "$pids" ]; then
            echo "$pids" | xargs kill 2>/dev/null || true
            sleep 2
        fi
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
    if [ -n "$env_vars" ]; then
        env $env_vars npx next dev -p $port > "$log_file" 2>&1 &
    else
        npx next dev -p $port > "$log_file" 2>&1 &
    fi
    local server_pid=$!

    # Wait for server to start
    local attempts=0
    while [ $attempts -lt $max_attempts ]; do
        if is_listening_on_port "$port"; then
            log_success "Server started successfully (PID: $server_pid)"
            return 0
        fi

        if ! kill -0 $server_pid 2>/dev/null; then
            log_error "Server failed to start"
            log_info "Logs:"
            tail -20 "$log_file" 2>/dev/null || true
            return 1
        fi

        sleep 1
        attempts=$((attempts + 1))
    done

    log_error "Server failed to start after $max_attempts attempts"
    return 1
}

stop_server() {
    local port="${1:-3000}"
    local force="${2:-false}"

    log_info "Stopping server on port $port..."

    if is_port_in_use "$port"; then
        local pids=$(find_server_pids "$port")
        if [ -n "$pids" ]; then
            if [ "$force" = "true" ]; then
                log_warning "Force killing processes: $pids"
                echo "$pids" | xargs kill -9 2>/dev/null || true
            else
                log_info "Stopping processes: $pids"
                echo "$pids" | xargs kill 2>/dev/null || true
            fi
            sleep 2
        fi

        if is_port_in_use "$port"; then
            log_error "Failed to stop server on port $port"
            return 1
        else
            log_success "Server stopped"
            return 0
        fi
    else
        log_info "Server is not running"
        return 0
    fi
}

show_server_status() {
    local port="${1:-3000}"

    log_info "Server Status for Port $port"
    echo "================================"

    if is_listening_on_port "$port"; then
        local pids=$(find_server_pids "$port")
        log_success "Server is running"
        echo "   PIDs: $pids"
        echo "   Port: $port"

        # Show process details
        for pid in $pids; do
            local cmd=$(ps -p $pid -o command= 2>/dev/null || echo "Unknown")
            echo "   Process $pid: $cmd"
        done
    else
        log_error "Server is not running"
    fi

    # Show port usage
    echo ""
    log_info "Port $port Usage:"
    lsof -i:$port 2>/dev/null || echo "   No processes found"
}

# Environment validation functions
validate_environment() {
    local environment="$1"
    local required_vars=("$2")

    log_info "Validating environment: $environment"

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "Required environment variable not set: $var"
            return 1
        fi
    done

    log_success "Environment validation passed"
    return 0
}

# Retry logic with timeout
run_with_retry() {
    local task_name="$1"
    local task_command="$2"
    local max_retries="${3:-3}"
    local timeout_seconds="${4:-300}"
    local silent="${5:-false}"

    for ((attempt=1; attempt<=max_retries; attempt++)); do
        if [ "$silent" = "false" ]; then
            log_info "Running $task_name (attempt $attempt/$max_retries)..."
        fi

        local exit_code=0
        if command -v timeout >/dev/null 2>&1; then
            timeout "$timeout_seconds" $task_command
            exit_code=$?
        else
            $task_command
            exit_code=$?
        fi

        if [ $exit_code -eq 0 ]; then
            if [ "$silent" = "false" ]; then
                log_success "$task_name completed successfully"
            fi
            return 0
        fi

        if [ $attempt -lt $max_retries ]; then
            log_warning "$task_name failed (attempt $attempt/$max_retries), retrying..."
            sleep 2
        fi
    done

    log_error "$task_name failed after $max_retries attempts"
    return 1
}
