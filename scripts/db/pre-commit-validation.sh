#!/bin/bash

# Pre-commit validation script for all validation checks
# This script ensures code quality and database integrity

set -e

echo "🔍 Running comprehensive pre-commit validation..."

# Step 1: Run lint-staged for code quality
echo "📝 Step 1: Running lint-staged..."
if ! npx lint-staged; then
    echo "❌ Lint-staged validation failed!"
    echo "Please fix the linting issues before committing"
    exit 1
fi
echo "✅ Lint-staged validation passed"

# Step 2: Quick type check (fast)
echo "🔍 Step 2: Running quick type check..."
if ! pnpm typecheck; then
    echo "❌ Type check failed!"
    echo "Please fix type errors before committing"
    exit 1
fi
echo "✅ Type check passed"

# Step 3: Check for circular dependencies (fast)
echo "🔄 Step 3: Checking for circular dependencies..."
if ! pnpm check:circular; then
    echo "❌ Circular dependency check failed!"
    echo "Please fix circular dependencies before committing"
    exit 1
fi
echo "✅ Circular dependency check passed"

# Step 4: Check if any migration files have been modified
echo "🗄️  Step 4: Checking database migrations..."
if git diff --cached --name-only | grep -E "\.sql$" | grep -q "drizzle/"; then
    echo "📄 Migration files detected in commit"

    # Run migration validation
    if ! pnpm db:validate-triggers; then
        echo "❌ Migration validation failed!"
        echo "Please ensure all triggers and functions are properly defined"
        echo "Use 'pnpm db:generate:safe' instead of 'pnpm db:generate'"
        exit 1
    fi

    echo "✅ Migration validation passed"
else
    echo "✅ No migration files in commit, skipping migration validation"
fi

# Step 5: Quick environment verification (fast)
echo "🌍 Step 5: Verifying environment variables..."
if ! pnpm verify-env; then
    echo "❌ Environment verification failed!"
    echo "Please check your environment configuration"
    exit 1
fi
echo "✅ Environment verification passed"

echo "🎉 All pre-commit validations completed successfully!"
