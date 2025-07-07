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

    # Level 1: Fast Tests (Base Level)
    print_status "Level 1: Fast Tests (Base Level)"
    print_status "Purpose: Basic smoke tests for quick feedback"
    run_test "Fast Tests" "pnpm test:e2e:sanity"

    # Level 2: Smoke Tests (Extends Fast)
    print_status "Level 2: Smoke Tests (Extends Fast)"
    print_status "Purpose: Extended smoke tests with additional critical functionality"
    run_test "Smoke Tests" "pnpm test:e2e:smoke"

    # Level 3: Critical Tests (Extends Smoke)
    print_status "Level 3: Critical Tests (Extends Smoke)"
    print_status "Purpose: Core user flows and critical functionality"
    run_test "Critical Tests" "pnpm test:e2e:critical"

    # Level 4: Responsive Tests (Extends Critical)
    print_status "Level 4: Responsive Tests (Extends Critical)"
    print_status "Purpose: Responsive design testing across multiple viewports"
    run_test "Responsive Tests" "pnpm test:e2e:responsive"

    # Level 5: Full Tests (Extends Responsive)
    print_status "Level 5: Full Tests (Extends Responsive)"
    print_status "Purpose: Comprehensive testing including edge cases and advanced scenarios"
    run_test "Full Tests" "pnpm test:e2e:full"

    echo "========================================"
    print_success "All compound tests completed successfully!"
    echo "========================================"
    echo ""
    print_status "Test Hierarchy Summary:"
    echo "  Mock Verification → Fast → Smoke → Critical → Responsive → Full"
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
echo "  --fast-only    Run only fast tests"
echo "  --smoke-only   Run only smoke tests"
echo "  --critical-only Run only critical tests"
echo "  --responsive-only Run only responsive tests"
echo "  --full-only    Run only full tests"
    echo ""
    echo "Examples:"
echo "  $0                    # Run all tests in sequence"
echo "  $0 --mock-verification-only # Run only mock verification tests"
echo "  $0 --fast-only        # Run only fast tests"
echo "  $0 --critical-only    # Run only critical tests"
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
    --fast-only)
        print_status "Running only Fast Tests..."
        run_test "Fast Tests" "pnpm test:e2e:sanity"
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
    --responsive-only)
        print_status "Running only Responsive Tests..."
        run_test "Responsive Tests" "pnpm test:e2e:responsive"
        exit 0
        ;;
    --full-only)
        print_status "Running only Full Tests..."
        run_test "Full Tests" "pnpm test:e2e:full"
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
