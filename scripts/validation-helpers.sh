#!/bin/bash

# Validation Helper Functions
# Usage: source scripts/validation-helpers.sh

# Clean up
run_clean() {
    echo "🔍 Cleaning up..."
    pnpm run clean
}

# Atomic validation steps
run_format_check() {
    echo "🔍 Checking code format..."
    pnpm run format:check
}

run_format() {
    echo "🔧 Formatting code..."
    pnpm run format
}

run_lint() {
    echo "🔍 Running ESLint..."
    pnpm run lint
}

run_lint_fix() {
    echo "🔧 Fixing lint issues..."
    pnpm run lint:fix
}

run_typecheck() {
    echo "🔍 Running TypeScript type check..."
    pnpm run typecheck
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
    run_type_validation
    run_type_fix
}

run_env_verification() {
    echo "🔍 Verifying environment variables..."
    pnpm run verify-env
}

run_codegen() {
    echo "🔧 Generating GraphQL code..."
    pnpm run codegen
}

run_unused_exports_check() {
    echo "🔍 Checking for unused exports..."
    pnpm run check:unused:exports
}

run_size_check() {
    echo "🔍 Checking bundle size..."
    pnpm run check:size
}

# Composite validation functions (use only atomic helpers)
run_fix() {
    run_lint_fix
    run_format
    run_type_validation
    run_type_fix
    run_typecheck
    run_lint_fix
    run_format
}

run_basic_validation() {
    echo "🚀 Running basic validation..."
    run_circular_check
    run_type_validation_and_fix
    run_env_verification
}

run_soft_validation() {
    echo "🚀 Running soft validation..."
    run_codegen
    run_fix
    run_basic_validation
}

run_prebuild() {
    echo "🚀 Running prebuild steps..."
    run_clean
    run_codegen
    run_fix
    run_soft_validation
}

run_full_validation() {
    echo "🚀 Running full validation (prebuild, build, validate, test:ci)..."
    run_prebuild
    echo "🔧 Building project..."
    pnpm run build
    run_soft_validation
    run_unused_exports_check
    echo "🔍 Running test:unit..."
    pnpm run test:unit
    echo "🔍 Running test:e2e:fast..."
    pnpm run test:e2e:fast
}

run_dev_build() {
    echo "🚀 Running development build"
    run_full_validation
    run_size_check
    # Add any extra dev build steps here if needed
}

run_production_validation() {
    echo "🚀 Running production validation (extends full validation)..."
    run_full_validation
    pnpm run test:e2e:critical
    run_size_check
    # Add any prod-specific steps here if needed
}
