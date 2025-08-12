#!/bin/bash

# Unified Integration Testing Script
# Usage: ./scripts/testing/integration.sh [--force-server] [--direct-only]
#
# This script intelligently handles integration testing by:
# 1. Checking if server is already running
# 2. Using direct Vitest execution if server is available (faster)
# 3. Starting server automatically if needed (robust)
# 4. Providing options for different use cases

set -e

# Source shared utilities
source "$(dirname "$0")/../script-utils.sh"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse command line arguments
FORCE_SERVER=false
DIRECT_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --force-server)
            FORCE_SERVER=true
            shift
            ;;
        --direct-only)
            DIRECT_ONLY=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --force-server    Force server management (start/stop server)"
            echo "  --direct-only     Only run tests if server is already running"
            echo "  -h, --help        Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                 # Smart mode: auto-detect server state"
            echo "  $0 --force-server  # Always manage server lifecycle"
            echo "  $0 --direct-only   # Only run if server is already running"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Source e2e helpers if available
if [ -f "${SCRIPT_DIR}/e2e-helpers.sh" ]; then
    source "${SCRIPT_DIR}/e2e-helpers.sh"
    echo "[DEBUG] Loaded e2e-helpers.sh for integration tests"
fi

# Function to check if server is running
check_server_running() {
    local port="${1:-3000}"

    echo "[DEBUG] Checking if server is running on port $port..."

    # Method 1: Try lsof if available
    if command -v lsof >/dev/null 2>&1; then
        echo "[DEBUG] Trying lsof method..."
        if lsof -i :$port | grep LISTEN > /dev/null 2>&1; then
            echo "[DEBUG] Server detected via lsof"
            return 0  # Server is running
        fi
    else
        echo "[DEBUG] lsof not available"
    fi

    # Method 2: Try netstat if available
    if command -v netstat >/dev/null 2>&1; then
        echo "[DEBUG] Trying netstat method..."
        if netstat -tuln 2>/dev/null | grep ":$port " | grep LISTEN > /dev/null 2>&1; then
            echo "[DEBUG] Server detected via netstat"
            return 0  # Server is running
        fi
    else
        echo "[DEBUG] netstat not available"
    fi

    # Method 3: Try ss if available (modern Linux)
    if command -v ss >/dev/null 2>&1; then
        echo "[DEBUG] Trying ss method..."
        if ss -tuln 2>/dev/null | grep ":$port " | grep LISTEN > /dev/null 2>&1; then
            echo "[DEBUG] Server detected via ss"
            return 0  # Server is running
        fi
    else
        echo "[DEBUG] ss not available"
    fi

    # Method 4: Try curl to test if server responds
    if command -v curl >/dev/null 2>&1; then
        echo "[DEBUG] Trying curl method..."
        if curl -s --connect-timeout 2 --max-time 5 "http://localhost:$port" >/dev/null 2>&1; then
            echo "[DEBUG] Server detected via curl"
            return 0  # Server is running
        fi
    else
        echo "[DEBUG] curl not available"
    fi

    # Method 5: Try wget to test if server responds
    if command -v wget >/dev/null 2>&1; then
        echo "[DEBUG] Trying wget method..."
        if wget --timeout=5 --tries=1 -q "http://localhost:$port" -O /dev/null 2>/dev/null; then
            echo "[DEBUG] Server detected via wget"
            return 0  # Server is running
        fi
    else
        echo "[DEBUG] wget not available"
    fi

    # Method 6: Try Node.js to test if server responds (fallback)
    if command -v node >/dev/null 2>&1; then
        echo "[DEBUG] Trying Node.js method..."
        if node -e "
            const http = require('http');
            const req = http.request({
                hostname: 'localhost',
                port: $port,
                path: '/',
                method: 'GET',
                timeout: 3000
            }, (res) => {
                process.exit(0);
            });
            req.on('error', () => process.exit(1));
            req.on('timeout', () => process.exit(1));
            req.end();
        " >/dev/null 2>&1; then
            echo "[DEBUG] Server detected via Node.js"
            return 0  # Server is running
        fi
    else
        echo "[DEBUG] Node.js not available"
    fi

    echo "[DEBUG] No server detected on port $port"
    return 1  # Server is not running
}

# Function to run tests directly (fastest)
run_tests_direct() {
    echo "🚀 Running integration tests directly (server already running)..."
    pnpm vitest run --config vitest.config.ts
}

# Function to manage server and run tests
run_tests_with_server_management() {
    echo "🔧 Managing server lifecycle for integration tests..."

    # Track if we started the server
    server_started_by_script=0
    server_pid=""

    # Start the integration server (if not already running)
    if type start_integration_server &>/dev/null; then
        start_integration_server
    else
        # Fallback: check if server is running, else start it
        DEFAULT_PORT=3000
        if check_server_running $DEFAULT_PORT; then
            echo "✅ Server already running on port $DEFAULT_PORT"
        else
            echo "🚀 Starting development server for integration tests..."
            PORT=$DEFAULT_PORT pnpm dev > /tmp/integration-server.log 2>&1 &
            server_pid=$!
            server_started_by_script=1
            echo "⏳ Waiting for integration server to start..."
            max_attempts=30  # Increased from 20 for CI environments
            attempt=1
            while ! check_server_running $DEFAULT_PORT; do
                if [ $attempt -ge $max_attempts ]; then
                    echo "❌ Failed to start integration server after $max_attempts attempts"
                    echo "Server logs:"
                    cat /tmp/integration-server.log
                    echo ""
                    echo "Process status:"
                    ps aux | grep -E "(next|node)" | grep -v grep || echo "No Next.js processes found"
                    echo ""
                    echo "Port status:"
                    if command -v lsof >/dev/null 2>&1; then
                        lsof -i :$DEFAULT_PORT || echo "lsof not available"
                    fi
                    if command -v netstat >/dev/null 2>&1; then
                        netstat -tuln | grep ":$DEFAULT_PORT" || echo "netstat not available"
                    fi
                    exit 1
                fi
                echo "[DEBUG] Attempt $attempt/$max_attempts - waiting for server..."
                sleep 2  # Increased from 1 second for CI environments
                attempt=$((attempt + 1))
            done
            echo "✅ Integration server started successfully (PID: $server_pid)"
            # Additional wait to ensure server is fully ready
            sleep 3  # Increased from 2 seconds for CI environments
        fi
    fi

    # Cleanup function to kill the server if we started it
    cleanup() {
        if [ "$server_started_by_script" = "1" ] && [ -n "$server_pid" ]; then
            echo "🧹 Cleaning up integration server (PID: $server_pid)"
            kill $server_pid 2>/dev/null || true
            # Wait for process to exit
            wait $server_pid 2>/dev/null || true
        fi
    }
    trap cleanup EXIT

    # Run integration tests
    pnpm vitest run --config vitest.config.ts
}

# Main execution logic
main() {
    echo "🔍 Integration Test Runner - Smart Mode"
    echo "======================================"

    # Check if server is running
    if check_server_running 3000; then
        echo "✅ Server detected on port 3000"
        server_running=true
    else
        echo "No server detected on port 3000"
        server_running=false
    fi

    echo ""

    # Determine execution strategy based on arguments and server state
    if [ "$DIRECT_ONLY" = true ]; then
        if [ "$server_running" = true ]; then
            echo "📋 Mode: Direct-only (server available)"
            run_tests_direct
        else
            echo "❌ Direct-only mode requested but no server running"
            echo "   Start the server manually or use --force-server"
            exit 1
        fi
    elif [ "$FORCE_SERVER" = true ]; then
        echo "📋 Mode: Force server management"
        run_tests_with_server_management
    else
        # Smart mode: auto-detect best approach
        if [ "$server_running" = true ]; then
            echo "📋 Mode: Smart (using existing server - fastest)"
            run_tests_direct
        else
            echo "📋 Mode: Smart (starting server - most robust)"
            run_tests_with_server_management
        fi
    fi
}

# Run main function
main "$@"
