#!/bin/bash

# Integration Testing Script
# Usage: ./scripts/integration.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source e2e helpers if available
if [ -f "${SCRIPT_DIR}/e2e-helpers.sh" ]; then
    source "${SCRIPT_DIR}/e2e-helpers.sh"
    echo "[DEBUG] Loaded e2e-helpers.sh for integration tests"
fi

# Track if we started the server
server_started_by_script=0
server_pid=""

# Start the integration server (if not already running)
if type start_integration_server &>/dev/null; then
    start_integration_server
else
    # Fallback: check if server is running, else start it
    DEFAULT_PORT=3000
    if lsof -i :$DEFAULT_PORT | grep LISTEN; then
        echo "✅ Server already running on port $DEFAULT_PORT"
    else
        echo "🚀 Starting development server for integration tests..."
        pnpm dev -p $DEFAULT_PORT > /tmp/integration-server.log 2>&1 &
        server_pid=$!
        server_started_by_script=1
        echo "⏳ Waiting for integration server to start..."
        max_attempts=20
        attempt=1
        while ! lsof -i :$DEFAULT_PORT | grep LISTEN; do
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
