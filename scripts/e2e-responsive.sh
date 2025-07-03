#!/bin/bash

# E2E Responsive Test Runner
# Usage: ./scripts/e2e-responsive.sh [timeout-seconds]

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Debug information for CI environment
echo "🔍 Debug: Current working directory: $(pwd)"
echo "🔍 Debug: Script directory: ${SCRIPT_DIR}"
echo "🔍 Debug: Script name: ${BASH_SOURCE[0]}"
echo "🔍 Debug: Shell: $SHELL"
echo "🔍 Debug: Bash version: $(bash --version | head -1)"

# Source the helpers file with error handling
if [ -f "${SCRIPT_DIR}/e2e-helpers.sh" ]; then
    echo "✅ Found e2e-helpers.sh at ${SCRIPT_DIR}/e2e-helpers.sh"
    source "${SCRIPT_DIR}/e2e-helpers.sh"
    echo "✅ Successfully sourced e2e-helpers.sh"
else
    echo "❌ Error: e2e-helpers.sh not found at ${SCRIPT_DIR}/e2e-helpers.sh"
    echo "🔍 Debug: Directory contents of ${SCRIPT_DIR}:"
    ls -la "${SCRIPT_DIR}/" || echo "Failed to list directory"
    exit 1
fi

# Verify that the required function exists
if ! type run_e2e_test >/dev/null 2>&1; then
    echo "❌ Error: run_e2e_test function not found after sourcing e2e-helpers.sh"
    echo "Available functions:"
    declare -F | grep -E "(clean_e2e_artifacts|kill_e2e_processes|setup_e2e_trap|start_e2e_server|wait_for_e2e_server|run_e2e_test)" || echo "No e2e functions found"
    exit 1
fi
echo "✅ run_e2e_test function is available"

# Default timeout of 60 minutes for responsive tests (they can be slow due to multiple viewports)
DEFAULT_TIMEOUT=3600

# Parse timeout argument
TIMEOUT=${1:-$DEFAULT_TIMEOUT}

echo "🧪 Running E2E Responsive Tests"
echo "📱 Testing responsive behavior across multiple viewports"
echo "⏰ Timeout: ${TIMEOUT} seconds"

# Set environment variables for E2E testing
export E2E_TESTING=true
export FORCE_MOCK_API=true
echo "🔧 E2E testing environment variables set"

# Use timeout wrapper if timeout is provided
if command -v gtimeout >/dev/null 2>&1; then
    gtimeout $TIMEOUT run_e2e_test "playwright test tests/e2e/responsive.spec.ts" "Responsive Design Tests"
elif command -v timeout >/dev/null 2>&1; then
    timeout $TIMEOUT run_e2e_test "playwright test tests/e2e/responsive.spec.ts" "Responsive Design Tests"
else
    echo "⚠️  Timeout command not available, running without timeout"
    run_e2e_test "playwright test tests/e2e/responsive.spec.ts" "Responsive Design Tests"
fi
