#!/bin/bash

# CI Pipeline Script - Consolidated
# Usage: ./scripts/ci.sh [subcommand] [options]
#
# Subcommands:
#   run [environment] - Run full CI pipeline for environment
#   quality-gate [environment] - Run quality gate validation
#   unit-tests - Run unit tests
#   e2e-tests [type] - Run E2E tests
#   preview - Run preview pipeline
#   staging - Run staging pipeline
#   production - Run production pipeline
#   help - Show this help message

set -e  # Exit on any error

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
    echo "  run [environment] - Run full CI pipeline for environment"
    echo "    Environments: preview, staging, staging-soak, production"
    echo ""
    echo "  quality-gate [environment] - Run quality gate validation"
    echo "    Environments: preview, staging, production"
    echo ""
    echo "  unit-tests - Run unit tests"
    echo ""
    echo "  e2e-tests [type] - Run E2E tests"
    echo "    Types: sanity, critical, responsive, full"
    echo ""
    echo "  preview - Run preview pipeline (validation + unit + e2e fast)"
    echo "  staging - Run staging pipeline (validation + unit + e2e fast + e2e critical + e2e responsive)"
    echo "  production - Run production pipeline (validation + unit + e2e fast + e2e critical + e2e coverage full)"
    echo ""
    echo "Examples:"
    echo "  $0 run preview"
    echo "  $0 quality-gate production"
    echo "  $0 e2e-tests sanity"
    echo "  $0 staging"
}

# Function to run quality gate
run_quality_gate() {
    local environment=$1
    local step_number=$2

    log "📋 Step $step_number: Quality Gate (Validation)"

    # Use centralized configuration
    local quality_gate_mode=$(./scripts/ci-config.sh get "$environment" QUALITY_GATE_MODE)

    case "$quality_gate_mode" in
        "basic")
            log_info "Running basic quality gate for $environment"
            pnpm lint && pnpm typecheck
            ;;
        "production")
            log_info "Running production quality gate for $environment"
            pnpm lint && pnpm typecheck
            ;;
        *)
            log_error "Unknown quality gate mode: $quality_gate_mode"
            exit 1
            ;;
    esac

    log_success "Quality gate passed for $environment"
}

# Function to run unit tests
run_unit_tests() {
    local step_number=$1

    log "📋 Step $step_number: Unit Tests"
    pnpm test:unit

    log_success "Unit tests passed"
}

# Function to run E2E tests
run_e2e_tests() {
    local test_type=$1
    local step_number=$2
    local environment=$3

    # Install Playwright browsers if not already installed
    log "📋 Step $step_number: Installing Playwright browsers"
    if ! pnpm playwright --version >/dev/null 2>&1 || [ ! -d "$HOME/.cache/ms-playwright" ]; then
        log_info "Installing Playwright browsers..."
        pnpm test:e2e:install-browsers
    else
        log_info "Playwright browsers already installed"
    fi

    # Only run the highest-level suite needed for this job. Use Playwright workers for parallelization.
    case "$test_type" in
        "sanity")
            log "📋 Step $((step_number + 1)): E2E Fast Tests (sanity)"
            pnpm exec playwright test tests/e2e/functional/sanity.spec.ts --workers=2
            ;;
        "smoke")
            log "📋 Step $((step_number + 1)): E2E Smoke Tests (smoke)"
            pnpm exec playwright test tests/e2e/functional/smoke.spec.ts --workers=2
            ;;
        "critical")
            log "📋 Step $((step_number + 1)): E2E Critical Tests (critical)"
            pnpm exec playwright test tests/e2e/functional/critical.spec.ts --workers=2
            ;;
        "responsive")
            log "📋 Step $((step_number + 1)): E2E Responsive Tests (responsive)"
            pnpm exec playwright test tests/e2e/functional/responsive.spec.ts --workers=2
            ;;
        "cross-browser")
            log "📋 Step $((step_number + 1)): E2E Cross-Browser Tests (cross-browser)"
            pnpm exec playwright test tests/e2e/functional/cross-browser.spec.ts --workers=2
            ;;
        "full")
            log "📋 Step $((step_number + 1)): E2E Comprehensive Tests with Coverage (full)"
            pnpm exec playwright test tests/e2e/functional/critical.spec.ts --workers=2
            ;;
        "performance")
            log "📋 Step $((step_number + 1)): E2E Performance Tests"
            pnpm test:e2e:performance
            ;;
        *)
            log_error "Unknown E2E test type: $test_type"
            exit 1
            ;;
    esac

    log_success "E2E tests passed: $test_type"
}

# Function to get pipeline configuration
get_pipeline_config() {
    local environment=$1

    # Use centralized configuration to determine pipeline steps
    local e2e_tests=$(./scripts/ci-config.sh get "$environment" E2E_TESTS)
    local e2e_pages=$(./scripts/ci-config.sh get "$environment" E2E_PAGES)
    local performance_tests=$(./scripts/ci-config.sh get "$environment" PERFORMANCE_TESTS)
    local coverage_tests=$(./scripts/ci-config.sh get "$environment" COVERAGE_TESTS)

    # Build pipeline based on configuration
    local pipeline="quality_gate:$environment unit_tests"

    # Add E2E tests based on configuration
    IFS=',' read -ra tests <<< "$e2e_tests"
    for test in "${tests[@]}"; do
        pipeline="$pipeline e2e_$test"
    done

    # Add performance tests if enabled
    if [ "$performance_tests" = "true" ]; then
        pipeline="$pipeline e2e_performance"
    fi

    # Add coverage tests if enabled
    if [ "$coverage_tests" = "true" ]; then
        pipeline="$pipeline e2e_coverage_full"
    fi

    echo "$pipeline"
}

# Function to execute pipeline
execute_pipeline() {
    local environment=$1
    local pipeline_steps=$(get_pipeline_config "$environment")

    log "🚀 Running CI ${environment} Pipeline..."

    local step_number=1
    IFS=' ' read -ra steps <<< "$pipeline_steps"

    for step in "${steps[@]}"; do
        IFS=':' read -ra step_parts <<< "$step"
        local step_name=${step_parts[0]}
        local step_arg=${step_parts[1]:-}

        case "$step_name" in
            "quality_gate")
                run_quality_gate "$step_arg" "$step_number"
                ;;
            "unit_tests")
                run_unit_tests "$step_number"
                ;;
            "e2e_sanity")
                run_e2e_tests "sanity" "$step_number" "$environment"
                ;;
            "e2e_smoke")
                run_e2e_tests "smoke" "$step_number" "$environment"
                ;;
            "e2e_critical")
                run_e2e_tests "critical" "$step_number" "$environment"
                ;;
            "e2e_responsive")
                run_e2e_tests "responsive" "$step_number" "$environment"
                ;;
            "e2e_performance")
                run_e2e_tests "performance" "$step_number" "$environment"
                ;;
            "e2e_coverage_full")
                run_e2e_tests "full" "$step_number" "$environment"
                ;;
            *)
                log_error "Unknown step: $step_name"
                exit 1
                ;;
        esac

        ((step_number++))
    done

    log_success "CI ${environment} Pipeline completed successfully!"
}

# Function to run quality gate standalone
run_quality_gate_standalone() {
    local environment=$1

    if [ -z "$environment" ]; then
        log_error "Environment required for quality gate"
        show_usage
        exit 1
    fi

    run_quality_gate "$environment" "1"
}

# Function to run E2E tests standalone
run_e2e_tests_standalone() {
    local test_type=$1

    if [ -z "$test_type" ]; then
        log_error "Test type required for E2E tests"
        show_usage
        exit 1
    fi

    # Install Playwright browsers if not already installed
    log "📋 Step 1: Installing Playwright browsers"
    if ! pnpm playwright --version >/dev/null 2>&1 || [ ! -d "$HOME/.cache/ms-playwright" ]; then
        log_info "Installing Playwright browsers..."
        pnpm test:e2e:install-browsers
    else
        log_info "Playwright browsers already installed"
    fi

    run_e2e_tests "$test_type" "2"
}

# Main script logic
SUBCOMMAND="${1:-help}"

case "$SUBCOMMAND" in
    "run")
        if [ -z "$2" ]; then
            log_error "Environment required for run subcommand"
            show_usage
            exit 1
        fi
        execute_pipeline "$2"
        ;;
    "quality-gate")
        run_quality_gate_standalone "$2"
        ;;
    "unit-tests")
        run_unit_tests "1"
        ;;
    "e2e-tests")
        run_e2e_tests_standalone "$2"
        ;;
    "preview")
        execute_pipeline "preview"
        ;;
    "staging")
        execute_pipeline "staging"
        ;;
    "production")
        execute_pipeline "production"
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
