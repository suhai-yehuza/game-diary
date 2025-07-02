#!/bin/bash

# E2E Responsive Test Runner
# Usage: ./scripts/e2e-responsive.sh [timeout-seconds]

source "$(dirname "$0")/e2e-helpers.sh"

# Default timeout of 60 minutes for responsive tests (they can be slow due to multiple viewports)
DEFAULT_TIMEOUT=3600

# Parse timeout argument
TIMEOUT=${1:-$DEFAULT_TIMEOUT}

echo "🧪 Running E2E Responsive Tests"
echo "📱 Testing responsive behavior across multiple viewports"
echo "⏰ Timeout: ${TIMEOUT} seconds"

# Use timeout wrapper if timeout is provided
if command -v gtimeout >/dev/null 2>&1; then
    gtimeout $TIMEOUT run_e2e_test "playwright test tests/e2e/responsive.spec.ts" "Responsive Design Tests"
elif command -v timeout >/dev/null 2>&1; then
    timeout $TIMEOUT run_e2e_test "playwright test tests/e2e/responsive.spec.ts" "Responsive Design Tests"
else
    echo "⚠️  Timeout command not available, running without timeout"
    run_e2e_test "playwright test tests/e2e/responsive.spec.ts" "Responsive Design Tests"
fi
