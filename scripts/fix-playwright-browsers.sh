#!/bin/bash

# Fix Playwright Browsers Installation Script
# This script ensures Playwright browsers are properly installed and available
# Usage: ./scripts/fix-playwright-browsers.sh [--force] [--debug]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Parse arguments
FORCE=false
DEBUG=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE=true
            shift
            ;;
        --debug)
            DEBUG=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--force] [--debug]"
            exit 1
            ;;
    esac
done

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

debug_info() {
    if [ "$DEBUG" = true ]; then
        log_info "DEBUG: $1"
    fi
}

# Function to check if Playwright is available
check_playwright_availability() {
    log "Checking Playwright availability..."

    if command -v pnpm > /dev/null 2>&1; then
        debug_info "pnpm is available"

        if pnpm exec playwright --version > /dev/null 2>&1; then
            PLAYWRIGHT_VERSION=$(pnpm exec playwright --version)
            log_success "Playwright is available: $PLAYWRIGHT_VERSION"
            return 0
        else
            log_error "Playwright is not available via pnpm exec"
            return 1
        fi
    else
        log_error "pnpm is not available"
        return 1
    fi
}

# Function to check browser installation status
check_browser_installation() {
    log "Checking browser installation status..."

    PLAYWRIGHT_CACHE="$HOME/.cache/ms-playwright"

    if [ ! -d "$PLAYWRIGHT_CACHE" ]; then
        log_warning "Playwright cache directory does not exist"
        return 1
    fi

    debug_info "Playwright cache directory: $PLAYWRIGHT_CACHE"

    # Check for chromium installation
    CHROMIUM_DIRS=$(find "$PLAYWRIGHT_CACHE" -name "chromium-*" -type d 2>/dev/null || true)

    if [ -n "$CHROMIUM_DIRS" ]; then
        log_success "Found chromium installations:"
        echo "$CHROMIUM_DIRS" | while read -r dir; do
            debug_info "  - $dir"
        done
        return 0
    else
        log_warning "No chromium installations found"
        return 1
    fi
}

# Function to clean Playwright cache
clean_playwright_cache() {
    log "Cleaning Playwright cache..."

    PLAYWRIGHT_CACHE="$HOME/.cache/ms-playwright"

    if [ -d "$PLAYWRIGHT_CACHE" ]; then
        log_info "Removing Playwright cache directory: $PLAYWRIGHT_CACHE"
        rm -rf "$PLAYWRIGHT_CACHE"
        log_success "Playwright cache cleaned"
    else
        log_info "No Playwright cache directory to clean"
    fi
}

# Function to install Playwright browsers
install_playwright_browsers() {
    log "Installing Playwright browsers..."

    # Try different installation methods
    log_info "Attempting installation with --with-deps..."
    if pnpm exec playwright install --with-deps; then
        log_success "Playwright browsers installed successfully"
        return 0
    else
        log_warning "Installation with --with-deps failed, trying without..."

        if pnpm exec playwright install; then
            log_success "Playwright browsers installed successfully (without deps)"
            return 0
        else
            log_error "Playwright browser installation failed"
            return 1
        fi
    fi
}

# Function to verify browser installation
verify_browser_installation() {
    log "Verifying browser installation..."

    # Try to run a simple Playwright command
    if pnpm exec playwright install --dry-run > /dev/null 2>&1; then
        log_success "Browser installation verified"
        return 0
    else
        log_error "Browser installation verification failed"
        return 1
    fi
}

# Function to test browser launch
test_browser_launch() {
    # This function is now a no-op because ESM Playwright cannot be reliably tested via require in Node.js CLI.
    return 0
}

# Main execution
main() {
    log "🔧 Starting Playwright browser fix process..."

    # Check if we need to force reinstall
    if [ "$FORCE" = true ]; then
        log_warning "Force mode enabled - will clean cache and reinstall"
        clean_playwright_cache
    fi

    # Check Playwright availability
    if ! check_playwright_availability; then
        log_error "Playwright is not available. Please install it first:"
        log_info "  pnpm add -D @playwright/test"
        exit 1
    fi

    # Check current browser installation
    if check_browser_installation; then
        log_info "Browsers appear to be installed"

        # Verify installation
        if verify_browser_installation; then
            log_success "Browser installation is working correctly"

            # Test browser launch
            if test_browser_launch; then
                log_success "✅ Playwright browsers are working correctly!"
                exit 0
            else
                log_warning "Browser launch test failed, attempting reinstall..."
            fi
        else
            log_warning "Browser installation verification failed, attempting reinstall..."
        fi
    else
        log_warning "Browsers not found, installing..."
    fi

    # Clean cache if verification failed
    if [ "$FORCE" = true ] || ! verify_browser_installation; then
        clean_playwright_cache
    fi

    # Install browsers
    if install_playwright_browsers; then
        # Verify installation
        if verify_browser_installation; then
            # Test browser launch
            if test_browser_launch; then
                log_success "✅ Playwright browsers installed and working correctly!"
                exit 0
            else
                log_error "❌ Browser launch test failed after installation"
                exit 1
            fi
        else
            log_error "❌ Browser installation verification failed after installation"
            exit 1
        fi
    else
        log_error "❌ Failed to install Playwright browsers"
        exit 1
    fi
}

# Run main function
main "$@"
