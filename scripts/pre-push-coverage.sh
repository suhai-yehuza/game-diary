#!/bin/bash

# Pre-push Coverage Enforcement Script
# This script enforces minimum test coverage thresholds before allowing git push
# It runs both unit and E2E coverage checks with configurable thresholds

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
UNIT_THRESHOLD=${UNIT_COVERAGE_THRESHOLD:-30}
E2E_THRESHOLD=${E2E_COVERAGE_THRESHOLD:-70}
MIN_UNIT_TESTS=${MIN_UNIT_TESTS:-50}
MIN_E2E_TESTS=${MIN_E2E_TESTS:-1}

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}🔍 Pre-push Coverage Enforcement${NC}"
echo -e "${BLUE}===============================${NC}"
echo "Unit coverage threshold: ${UNIT_THRESHOLD}%"
echo "E2E coverage threshold: ${E2E_THRESHOLD}%"
echo "Min unit tests: ${MIN_UNIT_TESTS}"
echo "Min E2E tests: ${MIN_E2E_TESTS}"
echo ""

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}❌ Not in a git repository${NC}"
        exit 1
    fi
}

# Function to check if there are staged changes
check_staged_changes() {
    if ! git diff --cached --quiet; then
        echo -e "${YELLOW}⚠️  You have staged changes. Running coverage check on staged files...${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  No staged changes. Running coverage check on all files...${NC}"
        return 1
    fi
}

# Function to run unit tests with coverage
run_unit_coverage() {
    echo -e "${BLUE}🧪 Running unit tests with coverage...${NC}"

    # Run unit tests with coverage
    if pnpm test:coverage > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Unit tests completed${NC}"
    else
        echo -e "${RED}❌ Unit tests failed${NC}"
        return 1
    fi
}

# Function to run E2E tests with coverage
run_e2e_coverage() {
    echo -e "${BLUE}🌐 Running E2E tests with coverage...${NC}"

    # Run basic E2E tests for coverage check
    if pnpm test:e2e:sanity > /dev/null 2>&1; then
        echo -e "${GREEN}✅ E2E tests completed${NC}"
    else
        echo -e "${RED}❌ E2E tests failed${NC}"
        return 1
    fi
}

# Function to run coverage enforcement
run_coverage_enforcement() {
    echo -e "${BLUE}📊 Running coverage enforcement...${NC}"

    # Run coverage enforcement script
    if pnpm coverage:enforce \
        --unit-threshold="${UNIT_THRESHOLD}" \
        --e2e-threshold="${E2E_THRESHOLD}" \
        --min-unit-tests="${MIN_UNIT_TESTS}" \
        --min-e2e-tests="${MIN_E2E_TESTS}" \
        --output="./coverage/pre-push-enforcement.json"; then
        echo -e "${GREEN}✅ Coverage enforcement passed${NC}"
        return 0
    else
        echo -e "${RED}❌ Coverage enforcement failed${NC}"
        return 1
    fi
}

# Function to display coverage report
display_coverage_report() {
    if [ -f "./coverage/pre-push-enforcement.json" ]; then
        echo -e "${BLUE}📋 Coverage Report Summary:${NC}"
        echo ""

        # Parse and display the JSON report
        if command -v jq > /dev/null 2>&1; then
            echo "Unit Tests:"
            jq -r '.unit | "  Coverage: \(.coverage | round * 100 / 100)% (threshold: \(.metThreshold | if . then "✅" else "❌" end))"' ./coverage/pre-push-enforcement.json
            jq -r '.unit | "  Test Count: \(.testCount) (minimum: \(.metTestCount | if . then "✅" else "❌" end))"' ./coverage/pre-push-enforcement.json

            echo ""
            echo "E2E Tests:"
            jq -r '.e2e | "  Coverage: \(.coverage | round * 100 / 100)% (threshold: \(.metThreshold | if . then "✅" else "❌" end))"' ./coverage/pre-push-enforcement.json
            jq -r '.e2e | "  Test Count: \(.testCount) (minimum: \(.metTestCount | if . then "✅" else "❌" end))"' ./coverage/pre-push-enforcement.json

            echo ""
            echo "Overall Status:"
            jq -r '.summary.overallPassed | if . then "  ✅ PASSED" else "  ❌ FAILED" end' ./coverage/pre-push-enforcement.json

            echo ""
            echo "Recommendations:"
            jq -r '.summary.recommendations[] | "  - \(.)"' ./coverage/pre-push-enforcement.json
        else
            echo "  📄 Detailed report available at: ./coverage/pre-push-enforcement.json"
            echo "  💡 Install 'jq' for better report formatting"
        fi
    fi
}

# Function to check if we should skip coverage
should_skip_coverage() {
    # Skip if this is a merge commit
    if git rev-parse -q --verify MERGE_HEAD > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Merge commit detected, skipping coverage check${NC}"
        return 0
    fi

    # Skip if this is a rebase
    if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
        echo -e "${YELLOW}⚠️  Rebase detected, skipping coverage check${NC}"
        return 0
    fi

    # Skip if environment variable is set
    if [ "$SKIP_COVERAGE_CHECK" = "true" ]; then
        echo -e "${YELLOW}⚠️  Coverage check skipped (SKIP_COVERAGE_CHECK=true)${NC}"
        return 0
    fi

    # Skip if commit message contains [skip coverage]
    if git log -1 --pretty=format:%B | grep -q "\[skip coverage\]"; then
        echo -e "${YELLOW}⚠️  Coverage check skipped (commit message contains [skip coverage])${NC}"
        return 0
    fi

    return 1
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help, -h           Show this help message"
    echo "  --skip, -s           Skip coverage check"
    echo "  --unit-threshold=N   Set unit coverage threshold (default: 80)"
    echo "  --e2e-threshold=N    Set E2E coverage threshold (default: 70)"
    echo "  --min-unit-tests=N   Set minimum unit tests (default: 50)"
    echo "  --min-e2e-tests=N    Set minimum E2E tests (default: 30)"
    echo ""
    echo "Environment Variables:"
    echo "  UNIT_COVERAGE_THRESHOLD  Unit test coverage threshold"
    echo "  E2E_COVERAGE_THRESHOLD   E2E test coverage threshold"
    echo "  MIN_UNIT_TESTS           Minimum number of unit tests"
    echo "  MIN_E2E_TESTS            Minimum number of E2E tests"
    echo "  SKIP_COVERAGE_CHECK      Set to 'true' to skip coverage check"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Run with default thresholds"
    echo "  $0 --unit-threshold=90               # Set unit threshold to 90%"
    echo "  $0 --skip                            # Skip coverage check"
    echo "  SKIP_COVERAGE_CHECK=true $0          # Skip via environment variable"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --skip|-s)
            echo -e "${YELLOW}⚠️  Coverage check skipped by user request${NC}"
            exit 0
            ;;
        --unit-threshold=*)
            UNIT_THRESHOLD="${1#*=}"
            shift
            ;;
        --e2e-threshold=*)
            E2E_THRESHOLD="${1#*=}"
            shift
            ;;
        --min-unit-tests=*)
            MIN_UNIT_TESTS="${1#*=}"
            shift
            ;;
        --min-e2e-tests=*)
            MIN_E2E_TESTS="${1#*=}"
            shift
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
main() {
    # Check if we're in a git repository
    check_git_repo

    # Check if we should skip coverage
    if should_skip_coverage; then
        exit 0
    fi

    # Change to project root
    cd "$PROJECT_ROOT"

    # Check for staged changes (but don't fail if none)
    check_staged_changes || true

    echo -e "${BLUE}🚀 Starting pre-push coverage enforcement...${NC}"
    echo ""

    # Run unit tests with coverage
    if ! run_unit_coverage; then
        echo -e "${RED}❌ Pre-push coverage check failed: Unit tests failed${NC}"
        exit 1
    fi

    # Run E2E tests with coverage
    if ! run_e2e_coverage; then
        echo -e "${RED}❌ Pre-push coverage check failed: E2E tests failed${NC}"
        exit 1
    fi

    # Run coverage enforcement
    if ! run_coverage_enforcement; then
        echo -e "${RED}❌ Pre-push coverage check failed: Coverage thresholds not met${NC}"
        echo ""
        display_coverage_report
        echo ""
        echo -e "${YELLOW}💡 To bypass this check, use:${NC}"
        echo -e "${YELLOW}   git commit --amend -m \"Your message [skip coverage]\"${NC}"
        echo -e "${YELLOW}   or set SKIP_COVERAGE_CHECK=true${NC}"
        exit 1
    fi

    # Display coverage report
    display_coverage_report

    echo ""
    echo -e "${GREEN}✅ Pre-push coverage check passed!${NC}"
    echo -e "${GREEN}🚀 Ready to push!${NC}"
}

# Run main function
main "$@"
