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
