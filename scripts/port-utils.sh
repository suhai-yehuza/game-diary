#!/bin/bash

# Port Management Utilities
# Centralized functions for port detection and process management

# Available port detection methods
PORT_METHODS=(
    "lsof"
    "netstat"
    "ss"
)

# Timeout for commands (in seconds)
DEFAULT_TIMEOUT=5

# Check if a command exists and is available
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Run command with timeout if available
run_with_timeout() {
    local cmd="$1"
    local timeout="${2:-$DEFAULT_TIMEOUT}"

    if command_exists timeout; then
        timeout "${timeout}s" $cmd 2>/dev/null || echo ""
    else
        $cmd 2>/dev/null || echo ""
    fi
}

# Get the best available port detection method
get_best_port_method() {
    for method in "${PORT_METHODS[@]}"; do
        if command_exists "$method"; then
            echo "$method"
            return 0
        fi
    done
    return 1
}

# Find processes using a specific port
find_processes_on_port() {
    local port="${1:-3000}"
    local method="${2:-$(get_best_port_method)}"

    case "$method" in
        "lsof")
            run_with_timeout "lsof -ti:$port"
            ;;
        "netstat")
            run_with_timeout "netstat -tlnp" | grep ":$port " | awk '{print $7}' | cut -d'/' -f1 | grep -v '-' || echo ""
            ;;
        "ss")
            run_with_timeout "ss -tlnp" | grep ":$port " | awk '{print $7}' | cut -d'/' -f1 | cut -d',' -f1 | grep -v '-' || echo ""
            ;;
        *)
            echo ""
            ;;
    esac
}

# Check if port is in use
is_port_in_use() {
    local port="${1:-3000}"
    local method="${2:-$(get_best_port_method)}"

    case "$method" in
        "lsof")
            run_with_timeout "lsof -i:$port -sTCP:LISTEN" >/dev/null 2>&1
            ;;
        "netstat")
            run_with_timeout "netstat -tln" | grep ":$port " >/dev/null 2>&1
            ;;
        "ss")
            run_with_timeout "ss -tln" | grep ":$port " >/dev/null 2>&1
            ;;
        *)
            return 1
            ;;
    esac
}

# Check if port is listening (alias for is_port_in_use)
is_listening_on_port() {
    is_port_in_use "$@"
}

# Kill processes safely
kill_processes() {
    local pids="$1"
    local force="${2:-false}"

    if [ -z "$pids" ]; then
        return 0
    fi

    if [ "$force" = "true" ]; then
        echo "$pids" | xargs -r kill -9 2>/dev/null || true
    else
        echo "$pids" | xargs -r kill 2>/dev/null || true
    fi
}

# Find and kill processes on a port
kill_processes_on_port() {
    local port="${1:-3000}"
    local force="${2:-false}"
    local method="${3:-$(get_best_port_method)}"

    local pids=$(find_processes_on_port "$port" "$method")
    if [ -n "$pids" ]; then
        kill_processes "$pids" "$force"
        return 0
    fi
    return 1
}

# Wait for port to be available
wait_for_port_available() {
    local port="${1:-3000}"
    local timeout="${2:-30}"
    local attempts=0

    while [ $attempts -lt $timeout ]; do
        if ! is_port_in_use "$port"; then
            return 0
        fi
        sleep 1
        attempts=$((attempts + 1))
    done

    return 1
}

# Wait for port to be in use
wait_for_port_in_use() {
    local port="${1:-3000}"
    local timeout="${2:-30}"
    local attempts=0

    while [ $attempts -lt $timeout ]; do
        if is_port_in_use "$port"; then
            return 0
        fi
        sleep 1
        attempts=$((attempts + 1))
    done

    return 1
}

# Get port status information
get_port_status() {
    local port="${1:-3000}"
    local method="${2:-$(get_best_port_method)}"

    if is_port_in_use "$port" "$method"; then
        local pids=$(find_processes_on_port "$port" "$method")
        echo "LISTENING:$pids"
    else
        echo "FREE"
    fi
}

# Kill all node processes (nuclear option for CI)
kill_all_node_processes() {
    local pattern="${1:-next dev}"
    local pids=$(pgrep -f "$pattern" 2>/dev/null || echo "")

    if [ -n "$pids" ]; then
        kill_processes "$pids" true
        return 0
    fi
    return 1
}
