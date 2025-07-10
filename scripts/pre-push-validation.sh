#!/bin/bash

# Pre-push validation script for comprehensive checks
# This script ensures code quality, tests, and build integrity before pushing
# Now uses the centralized deployment validator for consistency

set -e

echo "🚀 Running comprehensive pre-push validation..."

# Detect environment
if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
    echo "🤖 CI environment detected - running full validation"
    pnpm clean:build
    exit 0
fi

echo "🏠 Local environment detected - running enhanced pre-push validation"

# Step 1: Coverage enforcement (keep this separate as it's pre-push specific)
echo "📊 Step 1: Coverage enforcement..."
if ! ./scripts/pre-push-coverage.sh; then
    echo "❌ Coverage enforcement failed!"
    exit 1
fi
echo "✅ Coverage enforcement passed"

# Step 2: Production dry run validation (centralized)
echo "🚀 Step 2: Production dry run validation..."
echo "🔧 Using centralized deployment validator for comprehensive checks..."

# Determine validation level based on environment variables
if [ "$SKIP_E2E" = "true" ]; then
    echo "⚠️  E2E tests skipped - running validation without E2E"
    if ! ./scripts/deployment-validator.sh dry-run --skip-e2e-tests; then
        echo "❌ Production validation (without E2E) failed!"
        exit 1
    fi
else
    echo "🔍 Running full production validation"
    if ! ./scripts/deployment-validator.sh dry-run --fast; then
        echo "❌ Production validation failed!"
        echo "⚠️  Consider if this is a critical issue or if you want to skip E2E tests"
        echo "   You can skip by setting SKIP_E2E=true"
        exit 1
    fi
fi
echo "✅ Production validation passed"

echo "🎉 All pre-push validations completed successfully!"
echo "✅ Code is ready for production deployment!"
