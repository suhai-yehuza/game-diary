#!/bin/bash

# Playwright Browser Installation Script for CI
# This script ensures Playwright browsers and system dependencies are installed in CI environments
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
VERBOSE=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo "Usage: $0 [--verbose]"
            exit 1
            ;;
    esac
done

log_step "🔧 Installing Playwright browsers and system dependencies for CI environment..."

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

# Always install browsers and system dependencies
log_step "Installing Playwright browsers and system dependencies..."
if [ "$VERBOSE" = true ]; then
    pnpm exec playwright install --with-deps
else
    pnpm exec playwright install --with-deps > /dev/null 2>&1
fi

log_info "✅ Playwright browsers and dependencies installed successfully!"
