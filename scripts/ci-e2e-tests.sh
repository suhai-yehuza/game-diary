#!/bin/bash

# CI E2E Tests Script
# Usage: ./scripts/ci-e2e-tests.sh [test-type]
# Test types: smoke, critical, sanity

set -e  # Exit on any error

case "$1" in
    "smoke"|"sanity"|"critical")
        echo "🚀 Running CI E2E Tests ($1)..."

        echo "🔧 Install Playwright browsers..."
        pnpm exec playwright install --with-deps
        echo "🔧 Run E2E tests ($1)..."
        PLAYWRIGHT_TEST=true pnpm run test:e2e:$1
        echo "✅ CI E2E Tests ($1) completed successfully!"
        ;;
    *)
        echo "Usage: $0 [smoke|critical|sanity]"
        echo "  smoke     - Run E2E smoke tests"
        echo "  critical  - Run E2E critical tests"
        echo "  sanity   - Run E2E sanity tests"
        exit 1
        ;;
esac
