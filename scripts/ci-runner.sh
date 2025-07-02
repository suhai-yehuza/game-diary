#!/bin/bash

# CI Runner Script
# Usage: ./scripts/ci-runner.sh [preview|staging|production]

set -e  # Exit on any error

case "$1" in
    "preview")
        echo "🚀 Running CI Preview Pipeline..."
        echo "📋 Step 1: Quality Gate (Validation)"
        ./scripts/ci-quality-gate.sh preview
        echo "📋 Step 2: Unit Tests"
        ./scripts/ci-unit-tests.sh
        echo "📋 Step 3: E2E Fast Tests"
        ./scripts/ci-e2e-tests.sh fast
        echo "✅ CI Preview Pipeline completed successfully!"
        ;;
    "staging")
        echo "🚀 Running CI Staging Pipeline..."
        echo "📋 Step 1: Quality Gate (Validation)"
        ./scripts/ci-quality-gate.sh production
        echo "📋 Step 2: Unit Tests"
        ./scripts/ci-unit-tests.sh
        echo "📋 Step 3: E2E Fast Tests"
        ./scripts/ci-e2e-tests.sh fast
        echo "📋 Step 4: E2E Critical Tests"
        ./scripts/ci-e2e-tests.sh critical
        echo "📋 Step 5: E2E Responsive Tests"
        pnpm run ci:e2e:responsive
        echo "✅ CI Staging Pipeline completed successfully!"
        ;;
    "production")
        echo "🚀 Running CI Production Pipeline..."
        echo "📋 Step 1: Quality Gate (Validation)"
        ./scripts/ci-quality-gate.sh production
        echo "📋 Step 2: Unit Tests"
        ./scripts/ci-unit-tests.sh
        echo "📋 Step 3: E2E Fast Tests"
        ./scripts/ci-e2e-tests.sh fast
        echo "📋 Step 4: E2E Critical Tests"
        ./scripts/ci-e2e-tests.sh critical
        echo "📋 Step 5: E2E Comprehensive Tests with Coverage"
        pnpm run ci:e2e:run:coverage:full
        echo "✅ CI Production Pipeline completed successfully!"
        ;;
    *)
        echo "Usage: $0 [preview|production|staging]"
        echo "  preview    - Run CI preview pipeline (validation + unit + e2e fast)"
        echo "  staging    - Run CI staging pipeline (validation + unit + e2e fast + e2e critical + e2e responsive)"
        echo "  production - Run CI production pipeline (validation + unit + e2e fast + e2e critical + e2e coverage full)"
        exit 1
        ;;
esac
