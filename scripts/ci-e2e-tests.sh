#!/bin/bash

# CI E2E Tests Script - Updated for Progressive Hierarchy
# Usage: ./scripts/ci-e2e-tests.sh [test-type]
# Test types: sanity, smoke, critical, navigation, responsive, cross-browser, full
# Pages types: base, content, interactive, comprehensive, specific
# Compound types: functional, pages, all

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to ensure Playwright browsers are installed
ensure_playwright_browsers() {
    log_info "🔧 Ensuring Playwright browsers are installed..."

    # Use our improved browser installation script
    if [ -f "./scripts/install-playwright-browsers.sh" ]; then
        log_info "Using improved browser installation script..."
        ./scripts/install-playwright-browsers.sh --verbose
    else
        log_warn "Improved script not found, falling back to manual installation..."
        pnpm exec playwright install --with-deps
    fi
}

case "$1" in
    # Functional progressive hierarchy
    "sanity"|"smoke"|"critical"|"navigation"|"responsive"|"cross-browser"|"full")
        log_info "🚀 Running CI E2E Functional Tests ($1)..."

        # Ensure browsers are installed before running tests
        ensure_playwright_browsers

        # Run the specific test type
        case "$1" in
            "sanity")
                log_info "Running E2E sanity tests..."
                pnpm test:e2e:sanity
                ;;
            "smoke")
                log_info "Running E2E smoke tests..."
                pnpm test:e2e:smoke
                ;;
            "critical")
                log_info "Running E2E critical tests..."
                pnpm test:e2e:critical
                ;;
            "navigation")
                log_info "Running E2E navigation tests..."
                pnpm test:e2e:navigation
                ;;
            "responsive")
                log_info "Running E2E responsive tests..."
                pnpm test:e2e:responsive
                ;;
            "cross-browser")
                log_info "Running E2E cross-browser tests..."
                pnpm test:e2e:cross-browser
                ;;
            "full")
                log_info "Running E2E full tests..."
                pnpm test:e2e:full
                ;;
        esac
        echo "✅ CI E2E Functional Tests ($1) completed successfully!"
        ;;

    # Pages progressive hierarchy
    "base"|"content"|"interactive"|"comprehensive")
        log_info "🚀 Running CI E2E Pages Tests ($1)..."

        # Ensure browsers are installed before running tests
        ensure_playwright_browsers

        # Run the specific test type
        case "$1" in
            "base")
                log_info "Running E2E base page tests..."
                pnpm test:e2e:pages:content
                ;;
            "content")
                log_info "Running E2E content page tests..."
                pnpm test:e2e:pages:content
                ;;
            "interactive")
                log_info "Running E2E interactive page tests..."
                pnpm test:e2e:pages:dashboard
                ;;
            "comprehensive")
                log_info "Running E2E comprehensive page tests..."
                pnpm test:e2e:pages
                ;;
        esac
        echo "✅ CI E2E Pages Tests ($1) completed successfully!"
        ;;

    # Specific pages
    "home"|"dashboard"|"sports"|"auth")
        log_info "🚀 Running CI E2E Specific Page Tests ($1)..."

        # Ensure browsers are installed before running tests
        ensure_playwright_browsers

        # Run the specific test type
        case "$1" in
            "home")
                log_info "Running E2E home page tests..."
                pnpm test:e2e:pages:home
                ;;
            "dashboard")
                log_info "Running E2E dashboard page tests..."
                pnpm test:e2e:pages:dashboard
                ;;
            "sports")
                log_info "Running E2E sports page tests..."
                pnpm test:e2e:pages:sports
                ;;
            "auth")
                log_info "Running E2E auth page tests..."
                pnpm test:e2e:pages:auth
                ;;
        esac
        echo "✅ CI E2E Specific Page Tests ($1) completed successfully!"
        ;;

    # Compound testing
    "functional")
        log_info "🚀 Running CI E2E Compound Functional Tests..."

        # Ensure browsers are installed before running tests
        ensure_playwright_browsers

        log_info "Running compound functional tests (sanity level)..."
        pnpm test:e2e:sanity
        echo "✅ CI E2E Compound Functional Tests completed successfully!"
        ;;

    "pages")
        log_info "🚀 Running CI E2E Compound Pages Tests..."

        # Ensure browsers are installed before running tests
        ensure_playwright_browsers

        log_info "Running compound pages tests (base level)..."
        pnpm test:e2e:pages:content
        echo "✅ CI E2E Compound Pages Tests completed successfully!"
        ;;

    "all")
        log_info "🚀 Running CI E2E All Tests (Functional + Pages)..."

        # Ensure browsers are installed before running tests
        ensure_playwright_browsers

        log_info "Running all tests (smoke + base pages)..."
        pnpm test:e2e:smoke
        pnpm test:e2e:pages:content
        echo "✅ CI E2E All Tests completed successfully!"
        ;;

    # Legacy support
    "legacy-smoke"|"legacy-critical")
        log_warn "⚠️  Using legacy test type: $1"
        log_info "🚀 Running CI E2E Legacy Tests ($1)..."

        # Ensure browsers are installed before running tests
        ensure_playwright_browsers

        log_info "Running legacy tests using deployment validator..."
        E2E_MOCK_MODE=true ./scripts/deployment-validator.sh ci --skip-db-tests --skip-size-check --fast
        echo "✅ CI E2E Legacy Tests ($1) completed successfully!"
        ;;

    *)
        echo "Usage: $0 [test-type]"
        echo ""
        echo "Functional Progressive Hierarchy:"
        echo "  sanity        - Run E2E sanity tests (fastest)"
        echo "  smoke         - Run E2E smoke tests (includes sanity)"
        echo "  critical      - Run E2E critical tests (includes smoke)"
        echo "  navigation    - Run E2E navigation tests (includes critical)"
        echo "  responsive    - Run E2E responsive tests (includes navigation)"
        echo "  cross-browser - Run E2E cross-browser tests (includes responsive)"
        echo "  full          - Run E2E full tests (includes cross-browser)"
        echo ""
        echo "Pages Progressive Hierarchy:"
        echo "  base          - Run E2E base page tests (fastest)"
        echo "  content       - Run E2E content page tests (includes base)"
        echo "  interactive   - Run E2E interactive page tests (includes content)"
        echo "  comprehensive - Run E2E comprehensive page tests (includes interactive)"
        echo ""
        echo "Specific Pages:"
        echo "  home          - Run E2E home page tests"
        echo "  dashboard     - Run E2E dashboard page tests"
        echo "  sports        - Run E2E sports page tests"
        echo "  auth          - Run E2E auth page tests"
        echo ""
        echo "Compound Testing:"
        echo "  functional    - Run compound functional tests (sanity level)"
        echo "  pages         - Run compound pages tests (base level)"
        echo "  all           - Run all tests (smoke + base pages)"
        echo ""
        echo "Legacy Support:"
        echo "  legacy-smoke  - Run legacy smoke tests"
        echo "  legacy-critical - Run legacy critical tests"
        exit 1
        ;;
esac
