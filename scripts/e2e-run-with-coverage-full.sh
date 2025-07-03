#!/bin/bash

# E2E Test Runner with Full Coverage (waits for HTML reports)
# Usage: ./scripts/e2e-run-with-coverage-full.sh [test-command] [description] [timeout]

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
if ! type run_e2e_test_with_coverage >/dev/null 2>&1; then
    echo "❌ Error: run_e2e_test_with_coverage function not found after sourcing e2e-helpers.sh"
    echo "Available functions:"
    declare -F | grep -E "(clean_e2e_artifacts|kill_e2e_processes|setup_e2e_trap|start_e2e_server|wait_for_e2e_server|run_e2e_test)" || echo "No e2e functions found"
    exit 1
fi

if [ $# -lt 2 ]; then
    echo "Usage: $0 <test-command> <description> [timeout-seconds]"
    echo "Example: $0 'playwright test --project=chromium' 'Chromium tests' 120"
    exit 1
fi

# Use the full version that waits for HTML reports
run_e2e_test_with_coverage "$1" "$2" "$3"
