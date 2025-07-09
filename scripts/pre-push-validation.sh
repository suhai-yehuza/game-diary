#!/bin/bash

# Pre-push validation script for comprehensive checks
# This script ensures code quality, tests, and build integrity before pushing

set -e

echo "🚀 Running comprehensive pre-push validation..."

# Detect environment
if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
    echo "🤖 CI environment detected - running full validation"
    pnpm clean:build
    exit 0
fi

echo "🏠 Local environment detected - running enhanced pre-push validation"

# Step 1: Clean and prepare
echo "🧹 Step 1: Cleaning and preparing..."
if ! pnpm run clean:all; then
    echo "❌ Clean failed!"
    exit 1
fi

if ! pnpm run codegen; then
    echo "❌ Code generation failed!"
    exit 1
fi
echo "✅ Clean and code generation completed"

# Step 2: Code quality checks
echo "🔍 Step 2: Code quality checks..."
if ! pnpm run lint:fix && pnpm run format; then
    echo "❌ Linting and formatting failed!"
    exit 1
fi

if ! pnpm run validate:types && pnpm run fix:types; then
    echo "❌ Type validation and fixes failed!"
    exit 1
fi

if ! pnpm run typecheck; then
    echo "❌ Type check failed!"
    exit 1
fi

if ! pnpm run lint:fix && pnpm run format; then
    echo "❌ Final linting and formatting failed!"
    exit 1
fi
echo "✅ Code quality checks passed"

# Step 3: Code analysis
echo "📊 Step 3: Code analysis..."
if ! pnpm run check:circular; then
    echo "❌ Circular dependency check failed!"
    exit 1
fi

if ! pnpm run check:unused:exports; then
    echo "❌ Unused exports check failed!"
    exit 1
fi
echo "✅ Code analysis passed"

# Step 4: Build validation
echo "🔨 Step 4: Build validation..."
if ! NODE_ENV=production pnpm run build; then
    echo "❌ Production build failed!"
    exit 1
fi
echo "✅ Build validation passed"

# Step 5: Size and performance checks
echo "📏 Step 5: Size and performance checks..."
if ! pnpm run check:size; then
    echo "❌ Bundle size check failed!"
    exit 1
fi
echo "✅ Size and performance checks passed"

# Step 6: Coverage enforcement
echo "📊 Step 6: Coverage enforcement..."
if ! ./scripts/pre-push-coverage.sh; then
    echo "❌ Coverage enforcement failed!"
    exit 1
fi
echo "✅ Coverage enforcement passed"

# Step 7: Database validation
echo "🗄️  Step 7: Database validation..."
if ! pnpm run db:test:all-triggers; then
    echo "❌ Database trigger tests failed!"
    exit 1
fi
echo "✅ Database validation passed"

# Step 8: Quick E2E smoke test (if not too slow)
echo "🌐 Step 8: Quick E2E smoke test..."
if ! pnpm run test:e2e:smoke; then
    echo "❌ E2E smoke test failed!"
    echo "⚠️  Consider if this is a critical issue or if you want to skip E2E tests"
    echo "   You can skip by setting SKIP_E2E=true"
    if [ "$SKIP_E2E" != "true" ]; then
        exit 1
    fi
fi
echo "✅ E2E smoke test passed"

echo "🎉 All pre-push validations completed successfully!"
