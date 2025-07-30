#!/bin/bash

# Playwright Browser Installation Script for CI
# This script ensures Playwright browsers and system dependencies are installed in CI environments
# Usage: ./scripts/testing/install-playwright-browsers.sh [--force] [--verbose]

set -e

# Source shared utilities
source "$(dirname "$0")/../script-utils.sh"

# Parse arguments
VERBOSE=false
FORCE=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose)
            VERBOSE=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        *)
            echo "Usage: $0 [--verbose] [--force]"
            exit 1
            ;;
    esac
done

log_info "🔧 Installing Playwright browsers and system dependencies for CI environment..."

# Set environment variables for CI
export CI=true
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0

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
log_info "Checking if browsers are already installed..."
if pnpm exec playwright install --dry-run | grep -q "Install location:"; then
    log_info "Browsers are already installed. Checking if they're accessible..."

    # Test if browsers are actually accessible
    if pnpm exec playwright install --dry-run | grep -q "chromium" && \
       pnpm exec playwright install --dry-run | grep -q "firefox" && \
       pnpm exec playwright install --dry-run | grep -q "webkit"; then
        log_info "✅ All browsers are already installed and accessible!"
        exit 0
    else
        log_warning "Browsers appear to be installed but may not be accessible. Reinstalling..."
    fi
fi

# Install browsers and system dependencies
log_info "Installing Playwright browsers and system dependencies..."

# Build the install command
INSTALL_CMD="pnpm exec playwright install --with-deps"
if [ "$FORCE" = true ]; then
    INSTALL_CMD="$INSTALL_CMD --force"
fi

if [ "$VERBOSE" = true ]; then
    log_info "Running: $INSTALL_CMD"
    $INSTALL_CMD
else
    log_info "Running browser installation (use --verbose for detailed output)..."
    $INSTALL_CMD > /dev/null 2>&1
fi

# Verify installation
log_info "Verifying browser installation..."
if pnpm exec playwright install --dry-run | grep -q "chromium" && \
   pnpm exec playwright install --dry-run | grep -q "firefox" && \
   pnpm exec playwright install --dry-run | grep -q "webkit"; then
    log_info "✅ Playwright browsers and dependencies installed successfully!"

    # Show installed browsers
    log_info "Installed browsers:"
    pnpm exec playwright install --list | grep -E "(chromium|firefox|webkit)" || true
else
    log_error "❌ Browser installation verification failed!"
    log_error "Please check the installation manually with: pnpm exec playwright install --dry-run"
    exit 1
fi

log_info "🎉 Playwright browser installation completed successfully!"
