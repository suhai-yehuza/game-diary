#!/bin/bash

# E2E Test Runner - Consolidated
# Usage: ./scripts/e2e-run.sh [mode] [test-command] [description] [timeout-seconds]
#
# Modes:
#   basic     - Basic test execution (default)
#   coverage  - Test execution with coverage (fast)
#   coverage-full - Test execution with full coverage (waits for HTML reports)
#   responsive - Responsive design testing
#
# Examples:
#   ./scripts/e2e-run.sh basic "playwright test --project=chromium" "Chromium tests" 300
#   ./scripts/e2e-run.sh coverage "playwright test tests/e2e/functional/fast.spec.ts" "Fast tests"
#   ./scripts/e2e-run.sh coverage-full "playwright test tests/e2e/functional/full.spec.ts" "Full tests" 600
#   ./scripts/e2e-run.sh responsive 3600

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the helpers file with error handling
if [ -f "${SCRIPT_DIR}/e2e-helpers.sh" ]; then
    source "${SCRIPT_DIR}/e2e-helpers.sh"
else
    echo "❌ Error: e2e-helpers.sh not found at ${SCRIPT_DIR}/e2e-helpers.sh"
    exit 1
fi

# Function to show usage
show_usage() {
    echo "Usage: $0 [mode] [test-command] [description] [timeout-seconds]"
    echo ""
    echo "Modes:"
    echo "  basic          - Basic test execution (default)"
    echo "  coverage       - Test execution with coverage (fast)"
    echo "  coverage-full  - Test execution with full coverage (waits for HTML reports)"
    echo "  responsive     - Responsive design testing"
    echo ""
    echo "Examples:"
    echo "  $0 basic 'playwright test --project=chromium' 'Chromium tests' 300"
    echo "  $0 coverage 'playwright test tests/e2e/functional/fast.spec.ts' 'Fast tests'"
    echo "  $0 coverage-full 'playwright test tests/e2e/functional/full.spec.ts' 'Full tests' 600"
    echo "  $0 responsive 3600"
    echo ""
    echo "Environment variables:"
    echo "  FORCE_MOCK_API=true - Force API mocking"
}

# Function to run basic tests
run_basic_tests() {
    local test_command="$1"
    local description="$2"
    local timeout="$3"

    # Set environment variables for E2E testing
    echo "🔧 E2E testing environment variables set"

    # Add timeout wrapper if timeout is provided
    if [ -n "$timeout" ]; then
        echo "⏰ Setting timeout to ${timeout} seconds"
        if command -v gtimeout >/dev/null 2>&1; then
            gtimeout $timeout run_e2e_test "$test_command" "$description"
        elif command -v timeout >/dev/null 2>&1; then
            timeout $timeout run_e2e_test "$test_command" "$description"
        else
            echo "⚠️  Timeout command not available, running without timeout"
            run_e2e_test "$test_command" "$description"
        fi
    else
        run_e2e_test "$test_command" "$description"
    fi
}

# Function to run tests with coverage (fast)
run_coverage_tests() {
    local test_command="$1"
    local description="$2"
    local timeout="$3"

    # Add timeout wrapper if timeout is provided
    if [ -n "$timeout" ]; then
        echo "⏰ Setting timeout to ${timeout} seconds"
        if command -v gtimeout >/dev/null 2>&1; then
            gtimeout $timeout run_e2e_test_with_coverage_fast "$test_command" "$description"
        elif command -v timeout >/dev/null 2>&1; then
            timeout $timeout run_e2e_test_with_coverage_fast "$test_command" "$description"
        else
            echo "⚠️  Timeout command not available, running without timeout"
            run_e2e_test_with_coverage_fast "$test_command" "$description"
        fi
    else
        run_e2e_test_with_coverage_fast "$test_command" "$description"
    fi
}

# Function to run tests with full coverage
run_coverage_full_tests() {
    local test_command="$1"
    local description="$2"
    local timeout="$3"

    # Use the full version that waits for HTML reports
    if [ -n "$timeout" ]; then
        echo "⏰ Setting timeout to ${timeout} seconds"
        if command -v gtimeout >/dev/null 2>&1; then
            gtimeout $timeout run_e2e_test_with_coverage "$test_command" "$description" "$timeout"
        elif command -v timeout >/dev/null 2>&1; then
            timeout $timeout run_e2e_test_with_coverage "$test_command" "$description" "$timeout"
        else
            echo "⚠️  Timeout command not available, running without timeout"
            run_e2e_test_with_coverage "$test_command" "$description" "$timeout"
        fi
    else
        run_e2e_test_with_coverage "$test_command" "$description"
    fi
}

# Function to run responsive tests
run_responsive_tests() {
    local timeout="${1:-3600}"  # Default 60 minutes

    echo "🧪 Running E2E Responsive Tests"
    echo "📱 Testing responsive behavior across multiple viewports"
    echo "⏰ Timeout: ${timeout} seconds"

    # Set environment variables for E2E testing
    echo "🔧 E2E testing environment variables set"

    # Create a temporary script for timeout handling
    TEMP_SCRIPT=$(mktemp)
    cat > "$TEMP_SCRIPT" << 'EOF'
#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/e2e-helpers.sh"
run_e2e_test "playwright test tests/e2e/functional/responsive.spec.ts" "Responsive Design Tests"
EOF
    chmod +x "$TEMP_SCRIPT"

    # Use timeout wrapper
    if command -v gtimeout >/dev/null 2>&1; then
        gtimeout $timeout "$TEMP_SCRIPT"
    elif command -v timeout >/dev/null 2>&1; then
        timeout $timeout "$TEMP_SCRIPT"
    else
        echo "⚠️  Timeout command not available, running without timeout"
        run_e2e_test "playwright test tests/e2e/functional/responsive.spec.ts" "Responsive Design Tests"
    fi

    # Clean up temp script
    rm -f "$TEMP_SCRIPT"
}

# Main script logic
MODE="${1:-basic}"

case "$MODE" in
    "basic")
        if [ $# -lt 3 ]; then
            echo "❌ Error: basic mode requires test-command and description"
            show_usage
            exit 1
        fi
        run_basic_tests "$2" "$3" "$4"
        ;;
    "coverage")
        if [ $# -lt 3 ]; then
            echo "❌ Error: coverage mode requires test-command and description"
            show_usage
            exit 1
        fi
        run_coverage_tests "$2" "$3" "$4"
        ;;
    "coverage-full")
        if [ $# -lt 3 ]; then
            echo "❌ Error: coverage-full mode requires test-command and description"
            show_usage
            exit 1
        fi
        run_coverage_full_tests "$2" "$3" "$4"
        ;;
    "responsive")
        run_responsive_tests "$2"
        ;;
    "-h"|"--help"|"help")
        show_usage
        exit 0
        ;;
    *)
        echo "❌ Error: Unknown mode '$MODE'"
        show_usage
        exit 1
        ;;
esac
