#!/bin/bash

# E2E Test Runner with Coverage
# Usage: ./scripts/e2e-run-with-coverage.sh [test-command] [description] [timeout-seconds]

source "$(dirname "$0")/e2e-helpers.sh"

if [ $# -lt 2 ]; then
    echo "Usage: $0 <test-command> <description> [timeout-seconds]"
    echo "Example: $0 'playwright test --project=chromium' 'Chromium tests' 300"
    exit 1
fi

# Add timeout wrapper if timeout is provided
if [ $# -eq 3 ]; then
    echo "⏰ Setting timeout to ${3} seconds"
    # Use gtimeout if available (macOS with coreutils), otherwise run without timeout
    if command -v gtimeout >/dev/null 2>&1; then
        gtimeout $3 run_e2e_test_with_coverage_fast "$1" "$2"
    elif command -v timeout >/dev/null 2>&1; then
        timeout $3 run_e2e_test_with_coverage_fast "$1" "$2"
    else
        echo "⚠️  Timeout command not available, running without timeout"
        # Use the fast version to avoid hanging on HTML report waiting
        run_e2e_test_with_coverage_fast "$1" "$2"
    fi
else
    # Use the fast version to avoid hanging on HTML report waiting
    run_e2e_test_with_coverage_fast "$1" "$2"
fi
