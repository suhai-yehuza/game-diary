#!/bin/bash

# CI E2E Tests Script
# Usage: ./scripts/ci-e2e-tests.sh [test-type]
# Test types: smoke, critical, fast

set -e  # Exit on any error

case "$1" in
    "smoke"|"critical"|"fast")
        echo "🚀 Running CI E2E Tests ($1)..."
        echo "🔧 Install Playwright browsers..."
        pnpm exec playwright install --with-deps
        echo "🔧 Run E2E tests ($1)..."
        pnpm run test:e2e:$1
        echo "✅ CI E2E Tests ($1) completed successfully!"
        ;;
    *)
        echo "Usage: $0 [smoke|critical|fast]"
        echo "  smoke     - Run E2E smoke tests"
        echo "  critical  - Run E2E critical tests"
        echo "  fast      - Run E2E fast tests"
        exit 1
        ;;
esac
