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

# Function to run CI-friendly validation (skips environment validation)
run_ci_validation() {
    log "Running CI-friendly validation..."

    log_info "Checking circular dependencies..."
    pnpm check:circular

    log_info "Validating and fixing types..."
    pnpm validate:types:fix

    log_info "Skipping environment validation in CI mode..."
    log_warning "Environment variables will be validated in individual CI jobs"

    log_success "CI-friendly validation completed"
}

# Function to run basic validation
run_basic_validation() {
    log "Running basic validation..."

    log_info "Checking circular dependencies..."
    pnpm check:circular

    log_info "Validating and fixing types..."
    pnpm validate:types:fix

    # Skip environment validation in CI mode
    if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
        log_info "Skipping environment validation in CI mode..."
        log_warning "Environment variables will be validated in individual CI jobs"
    else
        log_info "Verifying environment variables..."
        pnpm verify-env
    fi

    log_success "Basic validation completed"
}

# Function to run development workflow
run_dev_workflow() {
    log "Running development workflow..."

    log_info "Running code generation..."
    pnpm codegen

    log_info "Running quick fixes..."
    pnpm fix:lint:format

    log_info "Running basic validation..."
    run_basic_validation

    log_success "Development workflow completed"
}

# Function to run full validation
run_full_validation() {
    log "Running full validation..."

    log_info "Running prebuild..."
    pnpm prebuild

    log_info "Building project..."
    pnpm build

    log_info "Running soft validation..."
    pnpm lint && pnpm typecheck

    log_info "Checking unused exports..."
    pnpm check:unused:exports

    log_info "Running strict tests..."
    pnpm test:strict

    log_info "Running E2E sanity tests..."
    pnpm test:e2e:sanity

    log_success "Full validation completed"
}

# Function to run staging validation
run_staging_validation() {
    log "Running staging validation..."

    log_info "Running full validation..."
    run_full_validation

    log_info "Checking bundle size..."
    pnpm check:size

    log_success "Staging validation completed"
}

# Function to run production validation
run_production_validation() {
    log "Running production validation..."

    log_info "Setting production environment..."
    export NODE_ENV=production

    log_info "Running full validation..."
    run_full_validation

    log_info "Running production-specific checks..."
    pnpm check:size:ci

    log_success "Production validation completed"
}

# Function to check circular dependencies
run_circular_check() {
    log "Checking circular dependencies..."
    pnpm check:circular
    log_success "Circular dependency check completed"
}

# Function to validate and fix types
run_types_validation() {
    log "Validating and fixing types..."
    pnpm fix:types
    log_success "Type validation and fixes completed"
}

# Function to verify environment variables
run_env_verification() {
    log "Verifying environment variables..."
    pnpm verify-env
    log_success "Environment verification completed"
}

# Function to check bundle size
run_size_check() {
    log "Checking bundle size..."
    pnpm check:size
    log_success "Bundle size check completed"
}

# Function to check unused exports
run_unused_check() {
    log "Checking unused exports..."
    pnpm check:unused:exports
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
        run_circular_check
        ;;
    "types")
        run_types_validation
        ;;
    "env")
        run_env_verification
        ;;
    "size")
        run_size_check
        ;;
    "unused")
        run_unused_check
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
