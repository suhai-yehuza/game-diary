#!/bin/bash

# E2E Compound Test Runner
# This script demonstrates the compound test hierarchy by running tests in sequence

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to run tests with status
run_test() {
    local test_name="$1"
    local test_command="$2"

    print_status "Running $test_name..."
    echo "Command: $test_command"
    echo "----------------------------------------"

    if eval "$test_command"; then
        print_success "$test_name completed successfully"
        echo ""
    else
        print_error "$test_name failed"
        exit 1
    fi
}

# Main execution
main() {
    echo "========================================"
    echo "E2E Compound Test Runner"
    echo "========================================"
    echo ""
    print_status "This script demonstrates the compound test hierarchy"
    echo ""

    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi

    # Check if pnpm is available
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is required but not installed"
        exit 1
    fi

    # Check if Playwright is installed
    if [ ! -d "node_modules/@playwright" ]; then
        print_warning "Playwright not found. Installing..."
        pnpm install
    fi

    # Check if browsers are installed
    if [ ! -d "node_modules/.cache/ms-playwright" ]; then
        print_warning "Playwright browsers not found. Installing..."
        pnpm exec playwright install --with-deps
    fi

    echo "========================================"
    echo "Starting Compound Test Execution"
    echo "========================================"
    echo ""

    # Level 0: Mock Verification (Prerequisite)
    print_status "Level 0: Mock Verification (Prerequisite)"
    print_status "Purpose: Validates API mocking infrastructure"
    run_test "Mock Verification" "pnpm test:e2e:mock-verification"

    # Level 1: Sanity Tests (Base Level)
    print_status "Level 1: Sanity Tests (Base Level)"
    print_status "Purpose: Fundamental requirements for the app"
    run_test "Sanity Tests" "pnpm test:e2e:sanity"

    # Level 2: Smoke Tests (Extends Sanity)
    print_status "Level 2: Smoke Tests (Extends Sanity)"
    print_status "Purpose: Extended functionality while maintaining speed"
    run_test "Smoke Tests" "pnpm test:e2e:smoke"

    # Level 3: Critical Tests (Extends Smoke)
    print_status "Level 3: Critical Tests (Extends Smoke)"
    print_status "Purpose: Essential functionality and error handling"
    run_test "Critical Tests" "pnpm test:e2e:critical"

    # Level 4: Navigation Tests (Extends Critical)
    print_status "Level 4: Navigation Tests (Extends Critical)"
    print_status "Purpose: Comprehensive navigation testing"
    run_test "Navigation Tests" "pnpm test:e2e:navigation"

    # Level 5: Responsive Tests (Extends Navigation)
    print_status "Level 5: Responsive Tests (Extends Navigation)"
    print_status "Purpose: Responsive design testing across multiple viewports"
    run_test "Responsive Tests" "pnpm test:e2e:responsive"

    # Level 6: Cross-Browser Tests (Extends Responsive)
    print_status "Level 6: Cross-Browser Tests (Extends Responsive)"
    print_status "Purpose: Browser compatibility testing"
    run_test "Cross-Browser Tests" "pnpm test:e2e:cross-browser"

    # Level 7: Full Tests (Extends Cross-Browser)
    print_status "Level 7: Full Tests (Extends Cross-Browser)"
    print_status "Purpose: Comprehensive end-to-end testing"
    run_test "Full Tests" "pnpm test:e2e:full"

    echo "========================================"
    echo "Starting Pages Test Hierarchy"
    echo "========================================"
    echo ""

    # Pages Level 1: Base Page Tests
    print_status "Pages Level 1: Base Page Tests"
    print_status "Purpose: Fundamental tests that all pages should pass"
    run_test "Base Page Tests" "pnpm test:e2e:pages:base"

    # Pages Level 2: Content Page Tests
    print_status "Pages Level 2: Content Page Tests"
    print_status "Purpose: Content-specific validations"
    run_test "Content Page Tests" "pnpm test:e2e:pages:content"

    # Pages Level 3: Interactive Page Tests
    print_status "Pages Level 3: Interactive Page Tests"
    print_status "Purpose: Interactive element validations"
    run_test "Interactive Page Tests" "pnpm test:e2e:pages:interactive"

    # Pages Level 4: Comprehensive Page Tests
    print_status "Pages Level 4: Comprehensive Page Tests"
    print_status "Purpose: Advanced validations and edge cases"
    run_test "Comprehensive Page Tests" "pnpm test:e2e:pages:comprehensive"

    # Pages Level 5: Specific Page Tests
    print_status "Pages Level 5: Specific Page Tests"
    print_status "Purpose: Page-specific functionality"
    run_test "Home Page Tests" "pnpm test:e2e:pages:home"
    run_test "Dashboard Tests" "pnpm test:e2e:pages:dashboard"
    run_test "Sports Pages Tests" "pnpm test:e2e:pages:sports"
    run_test "Auth Tests" "pnpm test:e2e:pages:auth"

    echo "========================================"
    print_success "All compound tests completed successfully!"
    echo "========================================"
    echo ""
    print_status "Test Hierarchy Summary:"
    echo "Functional: Mock Verification → Sanity → Smoke → Critical → Navigation → Responsive → Cross-Browser → Full"
    echo "Pages: Base → Content → Interactive → Comprehensive → Specific"
    echo ""
    print_status "Each level extends the previous level's tests, ensuring comprehensive coverage."
}

# Function to show help
show_help() {
    echo "E2E Compound Test Runner"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
echo "  -h, --help     Show this help message"
echo "  --mock-verification-only Run only mock verification tests"
echo "  --sanity-only  Run only sanity tests"
echo "  --smoke-only   Run only smoke tests"
echo "  --critical-only Run only critical tests"
echo "  --navigation-only Run only navigation tests"
echo "  --responsive-only Run only responsive tests"
echo "  --cross-browser-only Run only cross-browser tests"
echo "  --full-only    Run only full tests"
echo "  --pages-base-only Run only base page tests"
echo "  --pages-content-only Run only content page tests"
echo "  --pages-interactive-only Run only interactive page tests"
echo "  --pages-comprehensive-only Run only comprehensive page tests"
echo "  --pages-specific-only Run only specific page tests"
    echo ""
    echo "Examples:"
echo "  $0                    # Run all tests in sequence"
echo "  $0 --mock-verification-only # Run only mock verification tests"
echo "  $0 --sanity-only      # Run only sanity tests"
echo "  $0 --critical-only    # Run only critical tests"
echo "  $0 --pages-base-only  # Run only base page tests"
echo "  $0 --pages-comprehensive-only # Run only comprehensive page tests"
    echo ""
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    --mock-verification-only)
        print_status "Running only Mock Verification Tests..."
        run_test "Mock Verification" "pnpm test:e2e:mock-verification"
        exit 0
        ;;
    --sanity-only)
        print_status "Running only Sanity Tests..."
        run_test "Sanity Tests" "pnpm test:e2e:sanity"
        exit 0
        ;;
    --smoke-only)
        print_status "Running only Smoke Tests..."
        run_test "Smoke Tests" "pnpm test:e2e:smoke"
        exit 0
        ;;
    --critical-only)
        print_status "Running only Critical Tests..."
        run_test "Critical Tests" "pnpm test:e2e:critical"
        exit 0
        ;;
    --navigation-only)
        print_status "Running only Navigation Tests..."
        run_test "Navigation Tests" "pnpm test:e2e:navigation"
        exit 0
        ;;
    --responsive-only)
        print_status "Running only Responsive Tests..."
        run_test "Responsive Tests" "pnpm test:e2e:responsive"
        exit 0
        ;;
    --cross-browser-only)
        print_status "Running only Cross-Browser Tests..."
        run_test "Cross-Browser Tests" "pnpm test:e2e:cross-browser"
        exit 0
        ;;
    --full-only)
        print_status "Running only Full Tests..."
        run_test "Full Tests" "pnpm test:e2e:full"
        exit 0
        ;;
    --pages-base-only)
        print_status "Running only Base Page Tests..."
        run_test "Base Page Tests" "pnpm test:e2e:pages:base"
        exit 0
        ;;
    --pages-content-only)
        print_status "Running only Content Page Tests..."
        run_test "Content Page Tests" "pnpm test:e2e:pages:content"
        exit 0
        ;;
    --pages-interactive-only)
        print_status "Running only Interactive Page Tests..."
        run_test "Interactive Page Tests" "pnpm test:e2e:pages:interactive"
        exit 0
        ;;
    --pages-comprehensive-only)
        print_status "Running only Comprehensive Page Tests..."
        run_test "Comprehensive Page Tests" "pnpm test:e2e:pages:comprehensive"
        exit 0
        ;;
    --pages-specific-only)
        print_status "Running only Specific Page Tests..."
        run_test "Home Page Tests" "pnpm test:e2e:pages:home"
        run_test "Dashboard Tests" "pnpm test:e2e:pages:dashboard"
        run_test "Sports Pages Tests" "pnpm test:e2e:pages:sports"
        run_test "Auth Tests" "pnpm test:e2e:pages:auth"
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
