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
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "playwright" 2>/dev/null || true
    pkill -f "firefox" 2>/dev/null || true
    pkill -f "chromium" 2>/dev/null || true
    pkill -f "webkit" 2>/dev/null || true
    kill $(lsof -t -i:8081) 2>/dev/null || true
    kill $(lsof -t -i:9323) 2>/dev/null || true
    pkill -f "node.*playwright" 2>/dev/null || true
    pkill -f "npx.*playwright" 2>/dev/null || true
}

# Setup trap for cleanup
setup_e2e_trap() {
    trap 'kill_e2e_processes' EXIT
}

# Start dev server
start_e2e_server() {
    echo "🚀 Starting e2e test server..."
    pnpm dev -p 8081 &
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
    eval "$test_command"
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

    # Run test directly (no background process, no HTML report waiting)
    echo "🚀 Starting test execution..."
    eval "$test_command"
    local exit_code=$?

    echo "📊 Generating coverage report..."
    tsx scripts/e2e-coverage-report.ts

    return $exit_code
}
