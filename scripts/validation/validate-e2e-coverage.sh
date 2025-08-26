#!/bin/bash

# E2E Test Coverage Validation Script
# This script validates that all e2e page tests are included in nightly test runs

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Configuration
E2E_PAGES_DIR="tests/e2e/pages"
E2E_FUNCTIONAL_DIR="tests/e2e/functional"
NIGHTLY_WORKFLOW=".github/workflows/nightly.yml"
PRE_DEPLOYMENT_WORKFLOW=".github/workflows/pre-deployment.yml"

# Get all page test files
get_page_test_files() {
    find "$E2E_PAGES_DIR" -name "*.spec.ts" -type f | sort
}

# Get all functional test files
get_functional_test_files() {
    find "$E2E_FUNCTIONAL_DIR" -name "*.spec.ts" -type f | sort
}

# Check if a test file is mentioned in the nightly workflow
is_test_in_nightly() {
    local test_file="$1"
    local test_name=$(basename "$test_file")

    if grep -q "$test_name" "$NIGHTLY_WORKFLOW"; then
        return 0
    fi

    # Check for directory patterns
    if grep -q "tests/e2e/pages/" "$NIGHTLY_WORKFLOW"; then
        return 0
    fi

    # Check for full e2e directory
    if grep -q "tests/e2e/" "$NIGHTLY_WORKFLOW"; then
        return 0
    fi

    return 1
}

# Check if a test file is mentioned in the pre-deployment workflow
is_test_in_pre_deployment() {
    local test_file="$1"
    local test_name=$(basename "$test_file")

    if grep -q "$test_name" "$PRE_DEPLOYMENT_WORKFLOW"; then
        return 0
    fi

    return 1
}

# Main validation function
validate_e2e_coverage() {
    log_info "Validating E2E test coverage in nightly workflow..."

    local page_tests=($(get_page_test_files))
    local functional_tests=($(get_functional_test_files))
    local missing_in_nightly=()
    local missing_in_pre_deployment=()

    echo ""
    log_info "📄 Page Tests Found (${#page_tests[@]} files):"
    for test_file in "${page_tests[@]}"; do
        local test_name=$(basename "$test_file")
        local nightly_status=""
        local pre_deployment_status=""

        if is_test_in_nightly "$test_file"; then
            nightly_status="✅"
        else
            nightly_status="❌"
            missing_in_nightly+=("$test_file")
        fi

        if is_test_in_pre_deployment "$test_file"; then
            pre_deployment_status="✅"
        else
            pre_deployment_status="❌"
            missing_in_pre_deployment+=("$test_file")
        fi

        echo "   $nightly_status $pre_deployment_status $test_name"
    done

    echo ""
    log_info "🔧 Functional Tests Found (${#functional_tests[@]} files):"
    for test_file in "${functional_tests[@]}"; do
        local test_name=$(basename "$test_file")
        local nightly_status=""
        local pre_deployment_status=""

        if is_test_in_nightly "$test_file"; then
            nightly_status="✅"
        else
            nightly_status="❌"
            missing_in_nightly+=("$test_file")
        fi

        if is_test_in_pre_deployment "$test_file"; then
            pre_deployment_status="✅"
        else
            pre_deployment_status="❌"
            missing_in_pre_deployment+=("$test_file")
        fi

        echo "   $nightly_status $pre_deployment_status $test_name"
    done

    echo ""
    log_info "📊 Coverage Summary:"
    echo "   Nightly Workflow:"
    echo "     ✅ Included: $(( ${#page_tests[@]} + ${#functional_tests[@]} - ${#missing_in_nightly[@]} ))"
    echo "     ❌ Missing: ${#missing_in_nightly[@]}"

    echo "   Pre-deployment Workflow:"
    echo "     ✅ Included: $(( ${#page_tests[@]} + ${#functional_tests[@]} - ${#missing_in_pre_deployment[@]} ))"
    echo "     ❌ Missing: ${#missing_in_pre_deployment[@]}"

    # Report missing tests
    if [ ${#missing_in_nightly[@]} -gt 0 ]; then
        echo ""
        log_warning "Tests missing from nightly workflow:"
        for test_file in "${missing_in_nightly[@]}"; do
            echo "   - $(basename "$test_file")"
        done
    fi

    if [ ${#missing_in_pre_deployment[@]} -gt 0 ]; then
        echo ""
        log_warning "Tests missing from pre-deployment workflow:"
        for test_file in "${missing_in_pre_deployment[@]}"; do
            echo "   - $(basename "$test_file")"
        done
    fi

    # Final status - focus on nightly workflow coverage
    if [ ${#missing_in_nightly[@]} -eq 0 ]; then
        log_success "All E2E tests are included in nightly workflow!"
        if [ ${#missing_in_pre_deployment[@]} -gt 0 ]; then
            log_info "Note: Some tests are not in pre-deployment workflow (this is expected)"
        fi
        return 0
    else
        log_error "Some E2E tests are missing from nightly workflow!"
        return 1
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --validate    Validate E2E test coverage (default)"
    echo "  --list        List all E2E test files"
    echo "  --help        Show this help message"
    echo ""
    echo "This script validates that all e2e page tests are included in nightly test runs."
}

# Main script logic
case "${1:---validate}" in
    "--validate")
        validate_e2e_coverage
        ;;
    "--list")
        echo "📄 Page Tests:"
        get_page_test_files
        echo ""
        echo "🔧 Functional Tests:"
        get_functional_test_files
        ;;
    "--help"|"-h")
        show_usage
        ;;
    *)
        log_error "Unknown option: $1"
        show_usage
        exit 1
        ;;
esac
