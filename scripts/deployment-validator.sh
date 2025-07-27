#!/bin/bash

# Centralized Deployment Validation Script
# This script consolidates all production deployment validation steps
# Usage: ./scripts/deployment-validator.sh [mode] [options]
#
# Modes:
#   dry-run     - Run all production validation without deployment
#   ci          - Run CI-specific validation (used by GitHub Actions)
#   pre-deploy  - Run pre-deployment validation only
#   post-deploy - Run post-deployment validation only
#   help        - Show this help message
#
# Options:
#   --skip-db-tests     - Skip database trigger tests
#   --skip-e2e-tests    - Skip E2E tests
#   --skip-size-check   - Skip bundle size check
#   --skip-performance  - Skip performance tests
#   --fast              - Run only critical tests (sanity + critical)
#   --full              - Run full test suite (default)
#   --verbose           - Enable verbose output

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

log_step() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')] 🔧${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [mode] [options]"
    echo ""
    echo "Modes:"
    echo "  dry-run     - Run all production validation without deployment"
    echo "  ci          - Run CI-specific validation (used by GitHub Actions)"
    echo "  pre-deploy  - Run pre-deployment validation only"
    echo "  post-deploy - Run post-deployment validation only"
    echo "  help        - Show this help message"
    echo ""
    echo "Options:"
    echo "  --skip-db-tests     - Skip database trigger tests"
    echo "  --skip-e2e-tests    - Skip E2E tests"
    echo "  --skip-size-check   - Skip bundle size check"
    echo "  --skip-performance  - Skip performance tests"
    echo "  --fast              - Run only critical tests (sanity + critical)"
    echo "  --full              - Run full test suite (default)"
    echo "  --verbose           - Enable verbose output"
    echo ""
    echo "Examples:"
    echo "  $0 dry-run                    # Full production dry run"
    echo "  $0 dry-run --fast             # Fast production dry run"
    echo "  $0 ci                         # CI validation"
    echo "  $0 pre-deploy --skip-e2e      # Pre-deploy without E2E"
    echo ""
    echo "Environment Variables:"
    echo "  NODE_ENV           - Set to 'production' for production validation"
    echo "  DEPLOYMENT_URL     - URL for post-deployment tests"
    echo "  CI                 - Set to 'true' for CI environment"
}

# Parse command line arguments
MODE="${1:-help}"
SKIP_DB_TESTS=false
SKIP_E2E_TESTS=false
SKIP_SIZE_CHECK=false
SKIP_PERFORMANCE=false
FAST_MODE=false
VERBOSE=false

shift 1
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-db-tests)
            SKIP_DB_TESTS=true
            shift
            ;;
        --skip-e2e-tests)
            SKIP_E2E_TESTS=true
            shift
            ;;
        --skip-size-check)
            SKIP_SIZE_CHECK=true
            shift
            ;;
        --skip-performance)
            SKIP_PERFORMANCE=true
            shift
            ;;
        --fast)
            FAST_MODE=true
            shift
            ;;
        --full)
            FAST_MODE=false
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Function to run quality gate validation
run_quality_gate() {
    log_step "Running Quality Gate validation..."

    if [ "$VERBOSE" = true ]; then
        log_info "Setting production environment..."
        export NODE_ENV=production
    fi

    # For quality gate, we want to skip E2E tests if the flag is set
    if [ "$SKIP_E2E_TESTS" = true ]; then
        log_info "Running production validation without E2E tests..."
        # Run individual validation steps instead of the full validate:production
        log_info "Running prebuild..."
        pnpm prebuild

        log_info "Building project..."
        pnpm build

        log_info "Running soft validation..."
        pnpm lint && pnpm typecheck

        log_info "Checking unused exports..."
        pnpm check:dead:code

        log_info "Running strict tests..."
        # Skip unit tests in CI mode since they run in separate job
        if [ "$CI" = true ]; then
            log_info "Skipping unit tests in CI mode (run in separate job)"
        else
            pnpm test:strict
        fi

        log_info "Running production-specific checks..."
        pnpm check:size:ci
    else
        log_info "Running production validation..."
        pnpm validate:production
    fi

    log_success "Quality Gate validation completed"
}

# Function to run database tests
run_database_tests() {
    if [ "$SKIP_DB_TESTS" = true ]; then
        log_warning "Skipping database trigger tests"
        return 0
    fi

    log_step "Running database trigger tests..."
    pnpm db:test:all-triggers
    log_success "Database trigger tests completed"
}

# Function to ensure Playwright browsers are installed
ensure_playwright_browsers() {
    log_step "Ensuring Playwright browsers are installed..."

    # Use direct Playwright install command for better CI reliability
    log_info "Installing Playwright browsers with system dependencies..."
    pnpm exec playwright install --with-deps

    log_info "✅ Browser installation completed"
}

# Function to run E2E tests
run_e2e_tests() {
    if [ "$SKIP_E2E_TESTS" = true ]; then
        log_warning "Skipping E2E tests"
        return 0
    fi

    log_step "Running E2E tests..."

    # Ensure browsers are installed before running tests
    ensure_playwright_browsers

    if [ "$FAST_MODE" = true ]; then
        log_info "Running critical E2E tests only..."
        pnpm test:e2e:critical
    else
        log_info "Running full E2E test suite..."

        # Critical tests (includes sanity and smoke)
        pnpm test:e2e:critical

        # Performance tests
        if [ "$SKIP_PERFORMANCE" = false ]; then
            pnpm test:e2e:performance
        fi

        # Full E2E suite (includes navigation, responsive, cross-browser)
        pnpm test:e2e:navigation
        pnpm test:e2e:responsive
        pnpm test:e2e:cross-browser

        pnpm test:e2e:pages
    fi

    log_success "E2E tests completed"
}

# Function to run bundle size check
run_size_check() {
    if [ "$SKIP_SIZE_CHECK" = true ]; then
        log_warning "Skipping bundle size check"
        return 0
    fi

    log_step "Running bundle size check..."
    pnpm check:size:ci
    log_success "Bundle size check completed"
}

# Function to run pre-deployment validation
run_pre_deployment() {
    log "🚀 Starting pre-deployment validation..."

    run_quality_gate
    run_database_tests

    # Only run E2E tests if not skipped
    if [ "$SKIP_E2E_TESTS" = false ]; then
        run_e2e_tests
    fi

    # Only run size check if not skipped
    if [ "$SKIP_SIZE_CHECK" = false ]; then
        run_size_check
    fi

    log_success "Pre-deployment validation completed successfully!"
}

# Function to run post-deployment validation
run_post_deployment() {
    log "🚀 Starting post-deployment validation..."

    if [ -z "$DEPLOYMENT_URL" ]; then
        log_error "DEPLOYMENT_URL environment variable is required for post-deployment validation"
        exit 1
    fi

    log_step "Running post-deployment smoke tests..."
    DEPLOYMENT_URL="$DEPLOYMENT_URL" pnpm test:e2e:smoke:deployed

    log_success "Post-deployment validation completed successfully!"
}

# Function to run full dry run
run_dry_run() {
    log "🚀 Starting production deployment dry run..."

    run_pre_deployment

    log_success "Production CI dry run completed successfully!"
    log_info "All validation checks passed - ready for production deployment"
}

# Function to run CI validation
run_ci_validation() {
    log "🚀 Starting CI validation..."

    # CI environment specific settings
    export CI=true
    export NODE_ENV=production

    run_pre_deployment

    log_success "CI validation completed successfully!"
}

# Main script logic
case "$MODE" in
    "dry-run")
        run_dry_run
        ;;
    "ci")
        run_ci_validation
        ;;
    "pre-deploy")
        run_pre_deployment
        ;;
    "post-deploy")
        run_post_deployment
        ;;
    "help"|"-h"|"--help")
        show_usage
        exit 0
        ;;
    *)
        log_error "Unknown mode: $MODE"
        show_usage
        exit 1
        ;;
esac
