#!/bin/bash

# Validation Script - Consolidated
# Usage: ./scripts/validate.sh [subcommand] [options]
#
# Subcommands:
#   basic - Basic validation (circular deps, type validation/fix, env verification)
#   dev - Development workflow (codegen + quick fix + basic validation)
#   full - Prebuild, build, soft validation, unused exports, test:strict, test:e2e:sanity
#   staging - Full validation + size check (for staging deployment)
#   production - Full validation (prod context)
#   circular - Check circular dependencies
#   types - Validate and fix types
#   env - Verify environment variables
#   size - Check bundle size
#   unused - Check unused exports
#   help - Show this help message

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Helper functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

log_info() {
    echo -e "${PURPLE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [subcommand] [options]"
    echo ""
    echo "Subcommands:"
    echo "  basic - Basic validation (circular deps, type validation/fix, env verification)"
    echo "  ci - CI-friendly validation (skips environment validation)"
    echo "  dev - Development workflow (codegen + quick fix + basic validation)"
    echo "  full - Prebuild, build, soft validation, unused exports, test:strict, test:e2e:sanity"
    echo "  staging - Full validation + size check (for staging deployment)"
    echo "  production - Full validation (prod context)"
    echo "  circular - Check circular dependencies"
    echo "  types - Validate and fix types"
    echo "  env - Verify environment variables"
    echo "  size - Check bundle size"
    echo "  unused - Check unused exports"
    echo ""
    echo "Examples:"
    echo "  $0 basic"
    echo "  $0 ci"
    echo "  $0 dev"
    echo "  $0 staging"
    echo "  $0 circular"
}

# =============================================================================
# ATOMIC VALIDATION STEPS (Single responsibility functions)
# =============================================================================

# Cleanup
run_clean() {
    log_info "Cleaning up..."
    pnpm run clean:all
}

# Code Quality Checks
run_format_check() {
    log_info "Checking code format..."
    pnpm run format:check
}

run_format() {
    log_info "Formatting code..."
    pnpm run format
}

run_lint() {
    log_info "Running ESLint..."
    pnpm run lint
}

run_lint_fix() {
    log_info "Fixing lint issues..."
    pnpm run lint:fix
}

# Code Generation
run_codegen() {
    log_info "Generating GraphQL code..."
    pnpm run codegen
}

# Type Safety Checks
run_typecheck() {
    log_info "Running TypeScript type check..."
    pnpm run typecheck
}

run_type_validation() {
    log_info "Validating TypeScript types..."
    pnpm run typecheck
}

run_type_fix() {
    log_info "Fixing TypeScript type violations..."
    pnpm run fix:types
}

run_db_triggers_validation() {
    log_info "Validating database triggers..."
    pnpm run db:test:all-triggers
}

# Build
run_build() {
    log_info "Building project..."
    pnpm run build
}

# Environment & Configuration
run_env_verification() {
    log_info "Verifying environment variables..."
    pnpm run verify-env
}

# Code Analysis
run_circular_check() {
    log_info "Checking circular dependencies..."
    pnpm run check:circular
}

run_unused_exports_check() {
    log_info "Checking for unused exports..."
    pnpm run check:unused:exports
}

run_size_check() {
    log_info "Checking bundle size..."
    pnpm run check:size
}

# Unit Test Validation
run_unit_test_validation() {
    log_info "Running unit test validation..."
    pnpm run test:unit
}

run_unit_test_strict_validation() {
    log_info "Running strict unit test validation..."
    pnpm run test:strict
}

run_unit_test_coverage_validation() {
    log_info "Running unit test coverage validation..."
    pnpm run test:coverage
}

# E2E Test Validation
run_sanity_e2e_test_validation() {
    log_info "Running sanity E2E test validation..."
    pnpm run test:e2e:sanity
}

run_critical_e2e_test_validation() {
    log_info "Running critical E2E test validation..."
    pnpm run test:e2e:critical
}

# =============================================================================
# COMPOSITE VALIDATION FUNCTIONS (Logical groupings)
# =============================================================================

# Quick Fixes (format + lint + types)
run_quick_fix() {
    log_info "Running quick fixes..."
    run_lint_fix
    run_format
    run_type_fix
    run_typecheck
}

# Code Quality Validation (format + lint + types)
run_code_quality_validation() {
    log_info "Running code quality validation..."
    run_format_check
    run_lint
    run_typecheck
}

# Function to run CI-friendly validation (skips environment validation)
run_ci_validation() {
    log "Running CI-friendly validation..."

    run_circular_check
    run_type_validation
    run_type_fix

    log_info "Skipping environment validation in CI mode..."
    log_warning "Environment variables will be validated in individual CI jobs"

    log_success "CI-friendly validation completed"
}

# Function to run basic validation
run_basic_validation() {
    log "Running basic validation..."

    run_circular_check
    run_type_validation
    run_type_fix
    run_db_triggers_validation

    # Skip environment validation in CI mode
    if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
        log_info "Skipping environment validation in CI mode..."
        log_warning "Environment variables will be validated in individual CI jobs"
    else
        run_env_verification
    fi

    log_success "Basic validation completed"
}

# Function to run development workflow
run_dev_workflow() {
    log "Running development workflow..."

    run_codegen
    run_quick_fix
    run_basic_validation

    log_success "Development workflow completed"
}

# Function to run full validation
run_full_validation() {
    log "Running full validation..."

    log_info "Running prebuild..."
    pnpm run prebuild

    run_build
    run_code_quality_validation
    run_unused_exports_check
    run_unit_test_strict_validation
    run_sanity_e2e_test_validation

    log_success "Full validation completed"
}

# Function to run staging validation
run_staging_validation() {
    log "Running staging validation..."

    run_full_validation
    run_size_check

    log_success "Staging validation completed"
}

# Function to run production validation
run_production_validation() {
    log "Running production validation..."

    log_info "Setting production environment..."
    export NODE_ENV=production

    run_full_validation
    run_critical_e2e_test_validation
    run_size_check

    log_success "Production validation completed"
}

# Function to check circular dependencies (standalone)
run_circular_check_standalone() {
    log "Checking circular dependencies..."
    run_circular_check
    log_success "Circular dependency check completed"
}

# Function to validate and fix types (standalone)
run_types_validation_standalone() {
    log "Validating and fixing types..."
    run_type_validation
    run_type_fix
    log_success "Type validation and fixes completed"
}

# Function to verify environment variables (standalone)
run_env_verification_standalone() {
    log "Verifying environment variables..."
    run_env_verification
    log_success "Environment verification completed"
}

# Function to check bundle size (standalone)
run_size_check_standalone() {
    log "Checking bundle size..."
    run_size_check
    log_success "Bundle size check completed"
}

# Function to check unused exports (standalone)
run_unused_check_standalone() {
    log "Checking unused exports..."
    run_unused_exports_check
    log_success "Unused exports check completed"
}

# Main script logic
SUBCOMMAND="${1:-help}"

case "$SUBCOMMAND" in
    "basic")
        run_basic_validation
        ;;
    "ci")
        run_ci_validation
        ;;
    "dev")
        run_dev_workflow
        ;;
    "full")
        run_full_validation
        ;;
    "staging")
        run_staging_validation
        ;;
    "production")
        run_production_validation
        ;;
    "circular")
        run_circular_check_standalone
        ;;
    "types")
        run_types_validation_standalone
        ;;
    "env")
        run_env_verification_standalone
        ;;
    "size")
        run_size_check_standalone
        ;;
    "unused")
        run_unused_check_standalone
        ;;
    "help"|"-h"|"--help")
        show_usage
        exit 0
        ;;
    *)
        log_error "Unknown subcommand: $SUBCOMMAND"
        show_usage
        exit 1
        ;;
esac
