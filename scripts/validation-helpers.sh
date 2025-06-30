#!/bin/bash

# Validation Helper Functions
# Usage: source scripts/validation-helpers.sh

# Core validation steps
run_format_check() {
    echo "🔍 Checking code format..."
    pnpm run format:check
}

run_typecheck() {
    echo "🔍 Running TypeScript type check..."
    pnpm run typecheck
}

run_lint() {
    echo "🔍 Running ESLint..."
    pnpm run lint
}

run_circular_check() {
    echo "🔍 Checking for circular dependencies..."
    pnpm run check:circular
}

run_type_validation() {
    echo "🔍 Validating TypeScript types..."
    pnpm run validate:types
}

run_type_fix() {
    echo "🔧 Fixing TypeScript type violations..."
    pnpm run fix:types
}

run_type_validation_and_fix() {
    echo "🔍 Validating and fixing TypeScript types..."
    pnpm run validate:types:fix
}

run_env_verification() {
    echo "🔍 Verifying environment variables..."
    pnpm run verify-env
}

run_codegen() {
    echo "🔧 Generating GraphQL code..."
    pnpm run codegen
}

run_format() {
    echo "🔧 Formatting code..."
    pnpm run format
}

run_fix() {
    echo "🔧 Running lint and format fixes..."
    pnpm run fix
}

run_unused_exports_check() {
    echo "🔍 Checking for unused exports..."
    pnpm run check:unused:exports
}

run_size_check() {
    echo "🔍 Checking bundle size..."
    pnpm run check:size
}

# Composite validation functions
run_basic_validation() {
    echo "🚀 Running basic validation..."
    run_format_check
    run_typecheck
    run_lint
    run_circular_check
    run_type_validation_and_fix
    run_env_verification
}

run_soft_validation() {
    echo "🚀 Running soft validation..."
    run_codegen
    run_format
    run_fix
    run_basic_validation
}

run_full_validation() {
    echo "🚀 Running full validation..."
    run_soft_validation
    run_unused_exports_check
    run_size_check
}

run_dev_validation() {
    echo "🚀 Running development validation..."
    run_soft_validation
    run_unused_exports_check
    pnpm run test:dev
    run_size_check
}

run_production_validation() {
    echo "🚀 Running production validation..."
    run_soft_validation
    run_unused_exports_check
    pnpm run test:all
    run_size_check
}
