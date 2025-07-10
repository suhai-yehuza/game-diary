#!/bin/bash

# Playwright Browser Installation Script for CI
# This script ensures Playwright browsers are properly installed in CI environments
# Usage: ./scripts/install-playwright-browsers.sh [--force] [--verbose]

set -e

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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Parse arguments
FORCE=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo "Usage: $0 [--force] [--verbose]"
            exit 1
            ;;
    esac
done

log_step "🔧 Installing Playwright browsers for CI environment..."

# Set environment variables for CI
export CI=true
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0

# Check current directory
log_info "Current directory: $(pwd)"
log_info "Node version: $(node --version)"
log_info "pnpm version: $(pnpm --version)"

# Check if Playwright is installed
if ! pnpm exec playwright --version > /dev/null 2>&1; then
    log_error "Playwright is not installed!"
    exit 1
fi

log_info "Playwright version: $(pnpm exec playwright --version)"

# Check if browsers are already installed
# Playwright cache location varies by OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    BROWSER_CACHE_DIR="$HOME/Library/Caches/ms-playwright"
else
    # Linux and other Unix-like systems
    BROWSER_CACHE_DIR="$HOME/.cache/ms-playwright"
fi
if [ -d "$BROWSER_CACHE_DIR" ] && [ "$FORCE" = false ]; then
    log_info "Playwright cache directory exists: $BROWSER_CACHE_DIR"

    # List installed browsers
    if [ "$VERBOSE" = true ]; then
        log_info "Installed browsers:"
        ls -la "$BROWSER_CACHE_DIR" || true
    fi

    # Check if chromium is installed
    CHROMIUM_DIRS=$(find "$BROWSER_CACHE_DIR" -name "*chromium*" -type d 2>/dev/null || true)
    if [ -n "$CHROMIUM_DIRS" ]; then
        log_info "Chromium browser found in: $CHROMIUM_DIRS"

        # Check if the executable exists (different paths for different OS)
        for dir in $CHROMIUM_DIRS; do
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                if [ -f "$dir/chrome-mac/Chromium.app/Contents/MacOS/Chromium" ]; then
                    log_info "✅ Chromium executable found in: $dir"
                    log_info "Browser installation appears to be complete"
                    exit 0
                fi
            else
                # Linux and other Unix-like systems
                if [ -f "$dir/chrome-linux/headless_shell" ] || [ -f "$dir/chrome-linux/chrome" ]; then
                    log_info "✅ Chromium executable found in: $dir"
                    log_info "Browser installation appears to be complete"
                    exit 0
                fi
            fi
        done

        log_warn "Chromium directories found but executable missing, reinstalling..."
    else
        log_warn "No Chromium browser found, installing..."
    fi
else
    log_info "No Playwright cache found or force install requested, installing browsers..."
fi

# Clean up any existing cache if force install
if [ "$FORCE" = true ]; then
    log_info "Force install requested, cleaning existing cache..."
    rm -rf "$BROWSER_CACHE_DIR"
fi

# Install browsers with detailed output
log_step "Installing Playwright browsers..."

if [ "$VERBOSE" = true ]; then
    pnpm exec playwright install --with-deps
else
    pnpm exec playwright install --with-deps > /dev/null 2>&1
fi

# Verify installation
log_step "Verifying browser installation..."

# Check if the cache directory was created
if [ ! -d "$BROWSER_CACHE_DIR" ]; then
    log_error "❌ Playwright cache directory was not created!"
    exit 1
fi

# Check for chromium installation
CHROMIUM_DIRS=$(find "$BROWSER_CACHE_DIR" -name "*chromium*" -type d 2>/dev/null || true)
if [ -z "$CHROMIUM_DIRS" ]; then
    log_error "❌ Chromium browser was not installed!"
    exit 1
fi

# Check for executable (different paths for different OS)
EXECUTABLE_FOUND=false
for dir in $CHROMIUM_DIRS; do
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if [ -f "$dir/chrome-mac/Chromium.app/Contents/MacOS/Chromium" ]; then
            log_info "✅ Chromium executable found in: $dir"
            EXECUTABLE_FOUND=true
            break
        fi
    else
        # Linux and other Unix-like systems
        if [ -f "$dir/chrome-linux/headless_shell" ] || [ -f "$dir/chrome-linux/chrome" ]; then
            log_info "✅ Chromium executable found in: $dir"
            EXECUTABLE_FOUND=true
            break
        fi
    fi
done

if [ "$EXECUTABLE_FOUND" = false ]; then
    log_error "❌ Chromium executable not found in any browser directory!"
    log_info "Browser directories found:"
    find "$BROWSER_CACHE_DIR" -name "*chromium*" -type d -exec ls -la {} \; || true
    exit 1
fi

# Test browser installation with dry run
log_step "Testing browser installation with dry run..."
if pnpm exec playwright install --dry-run > /dev/null 2>&1; then
    log_info "✅ Browser installation verified with dry run"
else
    log_error "❌ Browser installation verification failed"
    exit 1
fi

# List installed browsers
log_step "Installed browsers:"
pnpm exec playwright --version
if [ "$VERBOSE" = true ]; then
    log_info "Browser cache contents:"
    ls -la "$BROWSER_CACHE_DIR" || true
fi

log_info "✅ Playwright browsers installed successfully!"
log_info "Cache directory: $BROWSER_CACHE_DIR"
