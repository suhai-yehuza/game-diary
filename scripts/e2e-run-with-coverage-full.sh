#!/bin/bash

# E2E Test Runner with Full Coverage (waits for HTML reports)
# Usage: ./scripts/e2e-run-with-coverage-full.sh [test-command] [description] [timeout]

source "$(dirname "$0")/e2e-helpers.sh"

if [ $# -lt 2 ]; then
    echo "Usage: $0 <test-command> <description> [timeout-seconds]"
    echo "Example: $0 'playwright test --project=chromium' 'Chromium tests' 120"
    exit 1
fi

# Use the full version that waits for HTML reports
run_e2e_test_with_coverage "$1" "$2" "$3"
