#!/bin/bash

# Script to generate test results for analysis
# Usage: ./scripts/generate-test-results.sh [config] [test-pattern]

set -e

# Default values
CONFIG=${1:-"playwright.fast.config.ts"}
TEST_PATTERN=${2:-"tests/e2e"}

echo "🧪 Generating Test Results"
echo "📋 Config: $CONFIG"
echo "🔍 Test Pattern: $TEST_PATTERN"

# Clean up previous results
echo "🧹 Cleaning up previous results..."
rm -rf test-results/
mkdir -p test-results/

# Run tests with JSON reporter
echo "🚀 Running tests with JSON reporter..."
pnpm playwright test --config="$CONFIG" --reporter=json

echo ""
echo "✅ Test results generated at test-results/results.json"
echo "💡 Now you can run: pnpm test:failing"
