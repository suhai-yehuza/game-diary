#!/bin/bash

# E2E Test Runner
# Usage: ./scripts/e2e-run.sh [test-command] [description] [timeout-seconds]

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the helpers file with error handling
if [ -f "${SCRIPT_DIR}/e2e-helpers.sh" ]; then
    source "${SCRIPT_DIR}/e2e-helpers.sh"
else
    echo "❌ Error: e2e-helpers.sh not found at ${SCRIPT_DIR}/e2e-helpers.sh"
    exit 1
fi

# Verify that the required function exists
if ! type run_e2e_test >/dev/null 2>&1; then
    echo "❌ Error: run_e2e_test function not found after sourcing e2e-helpers.sh"
    echo "Available functions:"
    declare -F | grep -E "(clean_e2e_artifacts|kill_e2e_processes|setup_e2e_trap|start_e2e_server|wait_for_e2e_server|run_e2e_test)" || echo "No e2e functions found"
    exit 1
fi

if [ $# -lt 2 ]; then
    echo "Usage: $0 <test-command> <description> [timeout-seconds]"
    echo "Example: $0 'playwright test --project=chromium' 'Chromium tests' 300"
    exit 1
fi

# Set environment variables for E2E testing
export E2E_TESTING=true
export FORCE_MOCK_API=true
echo "🔧 E2E testing environment variables set"

# Add timeout wrapper if timeout is provided
if [ $# -eq 3 ]; then
    echo "⏰ Setting timeout to ${3} seconds"
    # Use gtimeout if available (macOS with coreutils), otherwise run without timeout
    if command -v gtimeout >/dev/null 2>&1; then
        gtimeout $3 run_e2e_test "$1" "$2"
    elif command -v timeout >/dev/null 2>&1; then
        timeout $3 run_e2e_test "$1" "$2"
    else
        echo "⚠️  Timeout command not available, running without timeout"
        run_e2e_test "$1" "$2"
    fi
else
    run_e2e_test "$1" "$2"
fi
