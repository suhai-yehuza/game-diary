#!/bin/bash

# E2E Testing Script - Consolidated
# Usage: ./scripts/e2e.sh [subcommand] [options]
#
# Subcommands:
#   run [mode] [test-command] [description] [timeout] - Run E2E tests
#   compound [options] - Run compound E2E tests
#   debug [options] - Debug E2E tests
#   optimize [options] - Optimize E2E test performance
#   coverage [options] - Generate E2E coverage reports
#   responsive [timeout] - Run responsive design tests
#   help - Show this help message

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Source helpers if available
if [ -f "${SCRIPT_DIR}/e2e-helpers.sh" ]; then
    source "${SCRIPT_DIR}/e2e-helpers.sh"
    log_debug "Loaded e2e-helpers.sh"
fi

# Function to show usage
show_usage() {
    echo "Usage: $0 [subcommand] [options]"
    echo ""
    echo "Subcommands:"
    echo "  run [mode] [test-command] [description] [timeout] - Run E2E tests"
    echo "    Modes: basic, coverage, coverage-full, responsive"
    echo ""
    echo "  compound [options] - Run compound E2E tests"
    echo "    Functional Options: --sanity-only, --smoke-only, --critical-only, --navigation-only, --responsive-only, --cross-browser-only, --full-only, --mock-verification-only"
    echo "    Pages Options: --pages-base-only, --pages-content-only, --pages-interactive-only, --pages-comprehensive-only, --pages-specific-only"
    echo ""
    echo "  debug [options] - Debug E2E tests"
    echo "    Options: --ui, --headed, --trace"
    echo ""
    echo "  optimize [options] - Optimize E2E test performance"
    echo "    Options: --analyze, --profile, --workers"
    echo ""
    echo "  coverage [options] - Generate E2E coverage reports"
    echo "    Options: --fast, --full, --html"
    echo ""
    echo "  responsive [timeout] - Run responsive design tests"
    echo ""
    echo "Examples:"
    echo "  $0 run basic 'playwright test --project=chromium' 'Chromium tests' 300"
    echo "  $0 compound --sanity-only"
    echo "  $0 debug --ui"
    echo "  $0 coverage --fast"
    echo "  $0 responsive 3600"
}

# Function to run basic E2E tests
run_basic_tests() {
    local mode="$1"
    local test_command="$2"
    local description="$3"
    local timeout="$4"

    # Set environment variables for E2E testing
    log_info "E2E testing environment variables set"

    case "$mode" in
        "basic")
            run_e2e_test "$test_command" "$description"
            ;;
        "coverage")
            run_e2e_test_with_coverage_fast "$test_command" "$description"
            ;;
        "coverage-full")
            run_e2e_test_with_coverage "$test_command" "$description" "$timeout"
            ;;
        "responsive")
            run_e2e_test "playwright test tests/e2e/functional/responsive.spec.ts" "Responsive Design Tests"
            ;;
        *)
            log_error "Unknown mode: $mode"
            exit 1
            ;;
    esac
}

# Function to run compound E2E tests
run_compound_tests() {
    local options="$@"

    # Parse compound options
    local sanity_only=false
    local smoke_only=false
    local critical_only=false
    local navigation_only=false
    local responsive_only=false
    local cross_browser_only=false
    local full_only=false
    local mock_verification_only=false
    local pages_base_only=false
    local pages_content_only=false
    local pages_interactive_only=false
    local pages_comprehensive_only=false
    local pages_specific_only=false

    for opt in $options; do
        case "$opt" in
            "--sanity-only")
                sanity_only=true
                ;;
            "--smoke-only")
                smoke_only=true
                ;;
            "--critical-only")
                critical_only=true
                ;;
            "--navigation-only")
                navigation_only=true
                ;;
            "--responsive-only")
                responsive_only=true
                ;;
            "--cross-browser-only")
                cross_browser_only=true
                ;;
            "--full-only")
                full_only=true
                ;;
            "--mock-verification-only")
                mock_verification_only=true
                ;;
            "--pages-base-only")
                pages_base_only=true
                ;;
            "--pages-content-only")
                pages_content_only=true
                ;;
            "--pages-interactive-only")
                pages_interactive_only=true
                ;;
            "--pages-comprehensive-only")
                pages_comprehensive_only=true
                ;;
            "--pages-specific-only")
                pages_specific_only=true
                ;;
        esac
    done

    log_info "Running compound E2E tests with options: $options"

    # Execute compound tests based on options
    if [ "$sanity_only" = true ]; then
        run_e2e_test "playwright test tests/e2e/functional/sanity.spec.ts --config=playwright.sanity.config.ts" "Sanity E2E Tests"
    elif [ "$smoke_only" = true ]; then
        run_e2e_test "playwright test tests/e2e/functional/smoke.spec.ts --config=playwright.sanity.config.ts" "Smoke E2E Tests"
    elif [ "$critical_only" = true ]; then
        run_e2e_test "playwright test tests/e2e/functional/critical.spec.ts --config=playwright.critical.config.ts" "Critical E2E Tests"
    elif [ "$navigation_only" = true ]; then
        run_e2e_test "playwright test tests/e2e/functional/navigation.spec.ts --config=playwright.critical.config.ts" "Navigation E2E Tests"
    elif [ "$responsive_only" = true ]; then
        run_e2e_test "playwright test tests/e2e/functional/responsive.spec.ts --config=playwright.popular.config.ts" "Responsive E2E Tests"
    elif [ "$cross_browser_only" = true ]; then
        run_e2e_test "playwright test tests/e2e/functional/cross-browser.spec.ts --config=playwright.popular.config.ts" "Cross-Browser E2E Tests"
    elif [ "$full_only" = true ]; then
        run_e2e_test "playwright test tests/e2e/functional/full.spec.ts --config=playwright.popular.config.ts" "Full E2E Tests"
    elif [ "$mock_verification_only" = true ]; then
        run_e2e_test "playwright test tests/e2e/functional/mock-verification.spec.ts --config=playwright.sanity.config.ts" "Mock Verification Tests"
    elif [ "$pages_base_only" = true ]; then
        run_e2e_test "playwright test tests/e2e/pages/base-page.spec.ts --config=playwright.pages.config.ts" "Base Page Tests"
    elif [ "$pages_content_only" = true ]; then
        run_e2e_test "playwright test tests/e2e/pages/content-page.spec.ts --config=playwright.pages.config.ts" "Content Page Tests"
    elif [ "$pages_interactive_only" = true ]; then
        run_e2e_test "playwright test tests/e2e/pages/interactive-page.spec.ts --config=playwright.pages.config.ts" "Interactive Page Tests"
    elif [ "$pages_comprehensive_only" = true ]; then
        run_e2e_test "playwright test tests/e2e/pages/comprehensive-page.spec.ts --config=playwright.pages.config.ts" "Comprehensive Page Tests"
    elif [ "$pages_specific_only" = true ]; then
        run_e2e_test "playwright test tests/e2e/pages/home.spec.ts --config=playwright.pages.config.ts" "Home Page Tests"
        run_e2e_test "playwright test tests/e2e/pages/dashboard.spec.ts --config=playwright.pages.config.ts" "Dashboard Tests"
        run_e2e_test "playwright test tests/e2e/pages/sports.spec.ts --config=playwright.pages.config.ts" "Sports Pages Tests"
        run_e2e_test "playwright test tests/e2e/pages/clerk-auth.spec.ts --config=playwright.pages.config.ts" "Auth Tests"
    else
        # Run all tests in sequence (functional + pages)
        log_info "Running all compound E2E tests (functional + pages)"

        # Functional tests
        run_e2e_test "playwright test tests/e2e/functional/sanity.spec.ts --config=playwright.sanity.config.ts" "Sanity E2E Tests"
        run_e2e_test "playwright test tests/e2e/functional/smoke.spec.ts --config=playwright.sanity.config.ts" "Smoke E2E Tests"
        run_e2e_test "playwright test tests/e2e/functional/critical.spec.ts --config=playwright.critical.config.ts" "Critical E2E Tests"
        run_e2e_test "playwright test tests/e2e/functional/navigation.spec.ts --config=playwright.critical.config.ts" "Navigation E2E Tests"
        run_e2e_test "playwright test tests/e2e/functional/responsive.spec.ts --config=playwright.popular.config.ts" "Responsive E2E Tests"
        run_e2e_test "playwright test tests/e2e/functional/cross-browser.spec.ts --config=playwright.popular.config.ts" "Cross-Browser E2E Tests"
        run_e2e_test "playwright test tests/e2e/functional/full.spec.ts --config=playwright.popular.config.ts" "Full E2E Tests"

        # Pages tests
        run_e2e_test "playwright test tests/e2e/pages/base-page.spec.ts --config=playwright.pages.config.ts" "Base Page Tests"
        run_e2e_test "playwright test tests/e2e/pages/content-page.spec.ts --config=playwright.pages.config.ts" "Content Page Tests"
        run_e2e_test "playwright test tests/e2e/pages/interactive-page.spec.ts --config=playwright.pages.config.ts" "Interactive Page Tests"
        run_e2e_test "playwright test tests/e2e/pages/comprehensive-page.spec.ts --config=playwright.pages.config.ts" "Comprehensive Page Tests"
        run_e2e_test "playwright test tests/e2e/pages/home.spec.ts --config=playwright.pages.config.ts" "Home Page Tests"
        run_e2e_test "playwright test tests/e2e/pages/dashboard.spec.ts --config=playwright.pages.config.ts" "Dashboard Tests"
        run_e2e_test "playwright test tests/e2e/pages/sports.spec.ts --config=playwright.pages.config.ts" "Sports Pages Tests"
        run_e2e_test "playwright test tests/e2e/pages/clerk-auth.spec.ts --config=playwright.pages.config.ts" "Auth Tests"
    fi
}

# Function to debug E2E tests
run_debug_tests() {
    local options="$@"

    log_info "Starting E2E debug session with options: $options"

    # Set debug environment variables
    export PWDEBUG=1
    log_info "E2E testing environment variables set"

    for opt in $options; do
        case "$opt" in
            "--ui")
                log_info "Starting Playwright UI mode"
                playwright test --ui
                ;;
            "--headed")
                log_info "Running tests in headed mode"
                playwright test --headed
                ;;
            "--trace")
                log_info "Running tests with trace enabled"
                playwright test --trace on
                ;;
            *)
                log_warn "Unknown debug option: $opt"
                ;;
        esac
    done
}

# Function to optimize E2E tests
run_optimize_tests() {
    local options="$@"

    log_info "Running E2E optimization with options: $options"

    for opt in $options; do
        case "$opt" in
            "--analyze")
                log_info "Analyzing test performance"
                playwright test --reporter=html
                ;;
            "--profile")
                log_info "Profiling test execution"
                playwright test --project=chromium --workers=1
                ;;
            "--workers")
                log_info "Testing with different worker configurations"
                for workers in 1 2 4; do
                    log_info "Testing with $workers workers"
                    playwright test --workers=$workers
                done
                ;;
            *)
                log_warn "Unknown optimization option: $opt"
                ;;
        esac
    done
}

# Function to generate coverage reports
run_coverage_reports() {
    local options="$@"

    log_info "Generating E2E coverage reports with options: $options"

    for opt in $options; do
        case "$opt" in
            "--fast")
                log_info "Generating fast coverage report"
                playwright test --grep @fast --config=playwright.fast.config.ts --reporter=html
                ;;
            "--full")
                log_info "Generating full coverage report"
                playwright test tests/e2e/functional/full.spec.ts --config=playwright.popular.config.ts --reporter=html
                ;;
            "--html")
                log_info "Opening HTML coverage report"
                playwright show-report
                ;;
            *)
                log_warn "Unknown coverage option: $opt"
                ;;
        esac
    done
}

# Function to run responsive tests
run_responsive_tests() {
    local timeout="${1:-3600}"  # Default 60 minutes

    log_info "Running E2E Responsive Tests"
    log_info "Testing responsive behavior across multiple viewports"
    log_info "Timeout: ${timeout} seconds"

    # Set environment variables for E2E testing
    log_info "E2E testing environment variables set"

    # Run responsive tests with timeout
    if command -v gtimeout >/dev/null 2>&1; then
        gtimeout $timeout playwright test tests/e2e/functional/responsive.spec.ts --config=playwright.popular.config.ts
    elif command -v timeout >/dev/null 2>&1; then
        timeout $timeout playwright test tests/e2e/functional/responsive.spec.ts --config=playwright.popular.config.ts
    else
        log_warn "Timeout command not available, running without timeout"
        playwright test tests/e2e/functional/responsive.spec.ts --config=playwright.popular.config.ts
    fi
}

# Main script logic
SUBCOMMAND="${1:-help}"

case "$SUBCOMMAND" in
    "run")
        if [ $# -lt 3 ]; then
            log_error "run subcommand requires mode and test-command"
            show_usage
            exit 1
        fi
        run_basic_tests "$2" "$3" "$4" "$5"
        ;;
    "compound")
        shift
        run_compound_tests "$@"
        ;;
    "debug")
        shift
        run_debug_tests "$@"
        ;;
    "optimize")
        shift
        run_optimize_tests "$@"
        ;;
    "coverage")
        shift
        run_coverage_reports "$@"
        ;;
    "responsive")
        run_responsive_tests "$2"
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
