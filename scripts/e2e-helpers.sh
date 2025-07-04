#!/bin/bash

# E2E Test Helper Functions
# Usage: source scripts/e2e-helpers.sh

# Clean up test artifacts
clean_e2e_artifacts() {
    echo "🧹 Cleaning e2e test artifacts..."
    rm -rf playwright-report test-results test-results-e2e coverage/e2e
}

# Kill all related processes
kill_e2e_processes() {
    echo "🔄 Killing e2e-related processes..."

    # Only kill processes if we're actually exiting (not just a test failure)
    if [ "$E2E_CLEANUP_ONLY" = "1" ]; then
        echo "🧹 Cleanup mode - only killing test processes"
        pkill -f "playwright" 2>/dev/null || true
        pkill -f "firefox" 2>/dev/null || true
        pkill -f "chromium" 2>/dev/null || true
        pkill -f "webkit" 2>/dev/null || true
        kill $(lsof -t -i:9323) 2>/dev/null || true
        pkill -f "node.*playwright" 2>/dev/null || true
        pkill -f "npx.*playwright" 2>/dev/null || true
    else
        echo "🔄 Full cleanup - killing all processes including server"
        pkill -f "next dev" 2>/dev/null || true
        pkill -f "playwright" 2>/dev/null || true
        pkill -f "firefox" 2>/dev/null || true
        pkill -f "chromium" 2>/dev/null || true
        pkill -f "webkit" 2>/dev/null || true
        kill $(lsof -t -i:8081) 2>/dev/null || true
        kill $(lsof -t -i:9323) 2>/dev/null || true
        pkill -f "node.*playwright" 2>/dev/null || true
        pkill -f "npx.*playwright" 2>/dev/null || true
    fi
}

# Setup trap for cleanup
setup_e2e_trap() {
    # Only set up trap if not already set
    if [ -z "$E2E_TRAP_SET" ]; then
        trap 'kill_e2e_processes' EXIT
        export E2E_TRAP_SET=1
    fi
}

# Start dev server
start_e2e_server() {
    echo "🚀 Starting e2e test server..."

    # Check if server is already running
    if curl -s http://localhost:8081 >/dev/null 2>&1; then
        echo "✅ Server already running on port 8081"
        return 0
    fi

    # Kill any existing processes on port 8081
    echo "🧹 Cleaning up any existing processes on port 8081..."
    kill $(lsof -t -i:8081) 2>/dev/null || true
    sleep 2

    # Start server in background with E2E environment variables
    echo "🚀 Starting development server..."
    E2E_TESTING=true FORCE_MOCK_API=true pnpm dev -p 8081 > /tmp/e2e-server.log 2>&1 &
    local server_pid=$!

    # Wait for server to start with better error handling
    local attempts=0
    local max_attempts=60  # Increased timeout
    echo "⏳ Waiting for server to start..."

    while [ $attempts -lt $max_attempts ]; do
        if curl -s http://localhost:8081 >/dev/null 2>&1; then
            echo "✅ Server started successfully (PID: $server_pid)"
            # Additional wait to ensure server is fully ready
            sleep 3
            return 0
        fi

        # Check if server process is still running
        if ! kill -0 $server_pid 2>/dev/null; then
            echo "❌ Server process died unexpectedly"
            echo "Server logs:"
            cat /tmp/e2e-server.log
            return 1
        fi

        sleep 1
        attempts=$((attempts + 1))

        # Show progress every 10 attempts
        if [ $((attempts % 10)) -eq 0 ]; then
            echo "⏳ Still waiting... (attempt $attempts/$max_attempts)"
        fi
    done

    echo "❌ Failed to start server after $max_attempts attempts"
    echo "Server logs:"
    cat /tmp/e2e-server.log

    # Try to get more diagnostic information
    echo "🔍 Diagnostic information:"
    echo "Processes on port 8081:"
    lsof -i:8081 2>/dev/null || echo "No processes found"
    echo "Recent server logs:"
    tail -20 /tmp/e2e-server.log

    return 1
}

# Wait for server to be ready
wait_for_e2e_server() {
    echo "⏳ Waiting for server to be ready..."
    wait-on http://localhost:8081
}

# Run e2e test with full setup
run_e2e_test() {
    local test_command="$1"
    local description="$2"

    echo "🧪 Running e2e test: $description"
    clean_e2e_artifacts
    setup_e2e_trap
    start_e2e_server
    wait_for_e2e_server

    # Set cleanup mode to only kill test processes, not the server
    export E2E_CLEANUP_ONLY=1
    eval "$test_command"
    local exit_code=$?

    # Reset cleanup mode
    unset E2E_CLEANUP_ONLY

    return $exit_code
}

# Run e2e test with coverage
run_e2e_test_with_coverage() {
    local test_command="$1"
    local description="$2"
    local timeout=${3:-60}  # Default 60 second timeout

    echo "🧪 Running e2e test with coverage: $description"
    clean_e2e_artifacts
    setup_e2e_trap
    start_e2e_server
    wait_for_e2e_server

    # Run test and capture output
    echo "🚀 Starting test execution..."
    eval "$test_command" | tee /tmp/playwright.log &
    local playwright_pid=$!
    local start_time=$(date +%s)
    local html_report_found=false

    echo "⏳ Waiting for test completion or HTML report..."

    # Wait for either test completion or HTML report
    while true; do
        # Check if playwright process is still running
        if ! kill -0 $playwright_pid 2>/dev/null; then
            echo "✅ Test process completed"
            break
        fi

        # Check for HTML report (multiple possible patterns)
        if grep -q "Serving HTML report at http://localhost:9323" /tmp/playwright.log 2>/dev/null || \
           grep -q "HTML report saved to" /tmp/playwright.log 2>/dev/null || \
           grep -q "Report saved to" /tmp/playwright.log 2>/dev/null; then
            echo "📊 HTML report detected"
            html_report_found=true
            sleep 2  # Give it a moment to finish writing
            break
        fi

        # Check for test completion indicators
        if grep -q "Test finished" /tmp/playwright.log 2>/dev/null || \
           grep -q "All tests passed" /tmp/playwright.log 2>/dev/null || \
           grep -q "Test results saved" /tmp/playwright.log 2>/dev/null; then
            echo "✅ Test completion detected"
            break
        fi

        # Check timeout
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        if [ $elapsed -gt $timeout ]; then
            echo "⏰ Timeout reached (${timeout}s), stopping test"
            break
        fi

        sleep 1
    done

    # Kill playwright process if still running
    if kill -0 $playwright_pid 2>/dev/null; then
        echo "🔄 Stopping test process..."
        kill -INT $playwright_pid 2>/dev/null || true
        sleep 2
        # Force kill if still running
        if kill -0 $playwright_pid 2>/dev/null; then
            echo "🔄 Force stopping test process..."
            kill -9 $playwright_pid 2>/dev/null || true
        fi
    fi

    # Generate coverage report if we have test results
    if [ -f "playwright-report/index.html" ] || [ -d "test-results" ]; then
        echo "📊 Generating coverage report..."
        tsx scripts/e2e-coverage-report.ts
    else
        echo "⚠️  No test results found, skipping coverage report"
    fi
}

# Run e2e test with coverage (fast version - no HTML report waiting)
run_e2e_test_with_coverage_fast() {
    local test_command="$1"
    local description="$2"

    echo "🧪 Running e2e test with coverage (fast): $description"
    clean_e2e_artifacts
    setup_e2e_trap
    start_e2e_server
    wait_for_e2e_server

    # Set cleanup mode to only kill test processes, not the server
    export E2E_CLEANUP_ONLY=1

    # Run test directly (no background process, no HTML report waiting)
    echo "🚀 Starting test execution..."
    eval "$test_command"
    local exit_code=$?

    # Reset cleanup mode
    unset E2E_CLEANUP_ONLY

    echo "📊 Generating coverage report..."
    tsx scripts/e2e-coverage-report.ts

    return $exit_code
}
