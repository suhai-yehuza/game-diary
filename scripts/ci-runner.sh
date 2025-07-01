#!/bin/bash

# CI Runner Script
# Usage: ./scripts/ci-runner.sh [preview|production]

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
        echo "✅ CI Production Pipeline completed successfully!"
        ;;
    *)
        echo "Usage: $0 [preview|production]"
        echo "  preview    - Run CI preview pipeline (validation + unit + e2e fast)"
        echo "  production - Run CI production pipeline (validation + unit + e2e fast + e2e critical)"
        exit 1
        ;;
esac
