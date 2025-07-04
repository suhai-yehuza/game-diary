#!/bin/bash

# Validation Helper Functions
# Usage: source scripts/validation-helpers.sh
#
# NOTE: For fail-fast behavior when sourcing, ensure 'set -e' is enabled in the parent shell.
set -euo pipefail

# =============================================================================
# ATOMIC VALIDATION STEPS (Single responsibility functions)
# =============================================================================

# Code Quality Checks
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

# Type Safety Checks
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

# Code Generation
run_codegen() {
    echo "🔧 Generating GraphQL code..."
    pnpm run codegen
}

# Build
run_build() {
    echo "🔧 Building project..."
    pnpm run build
}

# Environment & Configuration
run_env_verification() {
    echo "🔍 Verifying environment variables..."
    pnpm run verify-env
}

# Code Analysis
run_circular_check() {
    echo "🔍 Checking circular dependencies..."
    pnpm run check:circular
}

run_unused_exports_check() {
    echo "🔍 Checking for unused exports..."
    pnpm run check:unused:exports
}

run_size_check() {
    echo "🔍 Checking bundle size..."
    pnpm run check:size
}

# Cleanup
run_clean() {
    echo "🧹 Cleaning up..."
    pnpm run clean:all
}

# =============================================================================
# COMPOSITE VALIDATION FUNCTIONS (Logical groupings)
# =============================================================================

# Quick Fixes (format + lint + types)
run_quick_fix() {
    echo "🔧 Running quick fixes..."
    run_lint_fix
    run_format
    run_type_validation
    run_type_fix
    run_typecheck
}

# Basic Validation (essential checks)
run_basic_validation() {
    echo "🚀 Running basic validation..."
    run_circular_check
    run_type_validation
    run_type_fix
    run_env_verification
}

# Code Quality Validation (format + lint + types)
run_code_quality_validation() {
    echo "🚀 Running code quality validation..."
    run_format_check
    run_lint
    run_typecheck
    run_type_validation
}

# Unit Test Validation
run_unit_test_validation() {
    echo "🚀 Running unit test validation..."
    pnpm run test:unit
}

run_unit_test_strict_validation() {
    echo "🚀 Running strict unit test validation..."
    pnpm run test:strict
}

run_unit_test_coverage_validation() {
    echo "🚀 Running unit test coverage validation..."
    pnpm run test:coverage
}

# E2E Test Validation
run_e2e_mock_verification_test_validation() {
    echo "🚀 Running E2E mock verification test validation..."
    pnpm run test:e2e:mock-verification
}

run_quickie_e2e_test_validation() {
    echo "🚀 Running quickie E2E test validation..."
    pnpm run test:e2e:quickie
}

run_e2e_smoke_test_validation() {
    echo "🚀 Running E2E smoke test validation..."
    pnpm run test:e2e:smoke
}

run_critical_e2e_test_validation() {
    echo "🚀 Running critical E2E test validation..."
    pnpm run test:e2e:critical
}

run_e2e_responsive_test_validation() {
    echo "🚀 Running responsive E2E test validation..."
    pnpm run test:e2e:responsive
}

run_e2e_full_test_validation() {
    echo "🚀 Running E2E full test validation..."
    pnpm run test:e2e:full
}

run_e2e_pages_test_validation() {
    echo "🚀 Running E2E pages test validation..."
    pnpm run test:e2e:pages
}

run_e2e_compound_test_validation() {
    echo "🚀 Running E2E compound test validation..."
    pnpm run test:e2e:compound
}

run_e2e_performance_test_validation() {
    echo "🚀 Running E2E performance test validation..."
    pnpm run test:e2e:performance
}

run_e2e_load_test_validation() {
    echo "🚀 Running E2E load test validation..."
    pnpm run test:e2e:load
}

run_e2e_pre_deploy_test_validation() {
    echo "🚀 Running E2E pre-deploy test validation..."
    pnpm run test:e2e:pre-deploy
}

run_e2e_post_deploy_test_validation() {
    echo "🚀 Running E2E post-deploy test validation..."
    pnpm run test:e2e:post-deploy
}

# =============================================================================
# WORKFLOW VALIDATION FUNCTIONS (Complete workflows)
# =============================================================================

# Development Workflow
run_dev_workflow() {
    echo "🚀 Running development workflow..."
    run_codegen
    run_quick_fix
    run_basic_validation
}

# Pre-build Workflow
run_prebuild() {
    echo "🚀 Running prebuild workflow..."
    run_clean
    run_codegen
    run_quick_fix
    run_basic_validation
}

# Full Validation Workflow
run_full_validation() {
    echo "🚀 Running full validation workflow..."
    run_prebuild
    run_build
    run_code_quality_validation
    run_unused_exports_check
    run_unit_test_validation
    run_quickie_e2e_test_validation
}

# Development Build Workflow
run_staging_validation() {
    echo "🚀 Running staging validation workflow..."
    run_full_validation
    run_size_check
}

# Production Validation Workflow
run_production_validation() {
    echo "🚀 Running production validation workflow..."
    run_full_validation
    run_critical_e2e_test_validation
    run_size_check
}
