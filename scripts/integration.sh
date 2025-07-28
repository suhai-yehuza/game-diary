#!/bin/bash

# Unified Integration Testing Script
# Usage: ./scripts/integration.sh [--force-server] [--direct-only]
#
# This script intelligently handles integration testing by:
# 1. Checking if server is already running
# 2. Using direct Vitest execution if server is available (faster)
# 3. Starting server automatically if needed (robust)
# 4. Providing options for different use cases

set -e

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
    if lsof -i :$port | grep LISTEN > /dev/null 2>&1; then
        return 0  # Server is running
    else
        return 1  # Server is not running
    fi
}

# Function to run tests directly (fastest)
run_tests_direct() {
    echo "🚀 Running integration tests directly (server already running)..."
    pnpm vitest run --config vitest.integration.config.ts
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
            pnpm dev -p $DEFAULT_PORT > /tmp/integration-server.log 2>&1 &
            server_pid=$!
            server_started_by_script=1
            echo "⏳ Waiting for integration server to start..."
            max_attempts=20
            attempt=1
            while ! check_server_running $DEFAULT_PORT; do
                if [ $attempt -ge $max_attempts ]; then
                    echo "❌ Failed to start integration server after $max_attempts attempts"
                    echo "Server logs:"
                    cat /tmp/integration-server.log
                    exit 1
                fi
                sleep 1
                attempt=$((attempt + 1))
            done
            echo "✅ Integration server started successfully (PID: $server_pid)"
            # Additional wait to ensure server is fully ready
            sleep 2
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
    pnpm vitest run --config vitest.integration.config.ts
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
