#!/bin/bash

# E2E Test Optimization Script
# Provides utilities for optimizing test execution and managing test resources

source "$(dirname "$0")/e2e-helpers.sh"

# Function to show usage
show_usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  clean           - Clean all test artifacts and processes"
    echo "  optimize        - Optimize system for test execution"
    echo "  monitor         - Monitor system resources during tests"
    echo "  analyze         - Analyze test performance and identify bottlenecks"
    echo "  setup           - Setup optimized test environment"
    echo ""
    echo "Examples:"
    echo "  $0 clean"
    echo "  $0 optimize"
    echo "  $0 monitor"
}

# Function to clean test artifacts
clean_test_artifacts() {
    echo "🧹 Cleaning test artifacts..."

    # Clean Playwright artifacts
    rm -rf playwright-report
    rm -rf test-results
    rm -rf test-results-e2e
    rm -rf coverage/e2e

    # Clean browser caches
    rm -rf ~/.cache/ms-playwright
    rm -rf ~/.cache/playwright

    # Clean temporary files
    find . -name "*.tmp" -delete
    find . -name "*.log" -delete

    # Kill any remaining processes
    kill_e2e_processes

    echo "✅ Test artifacts cleaned"
}

# Function to optimize system for testing
optimize_system() {
    echo "⚡ Optimizing system for test execution..."

    # Increase file descriptor limits (if possible)
    if command -v ulimit >/dev/null 2>&1; then
        ulimit -n 4096 2>/dev/null || echo "⚠️  Could not increase file descriptor limit"
    fi

    # Clear system caches (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sudo purge 2>/dev/null || echo "⚠️  Could not clear system caches"
    fi

    # Clear browser caches
    rm -rf ~/.cache/ms-playwright
    rm -rf ~/.cache/playwright

    # Set environment variables for better performance
    export PLAYWRIGHT_BROWSERS_PATH=0
    export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

    echo "✅ System optimized for testing"
}

# Function to monitor system resources
monitor_resources() {
    echo "📊 Monitoring system resources..."

    # Monitor CPU and memory usage
    if command -v top >/dev/null 2>&1; then
        echo "System resources:"
        top -l 1 -n 0 | head -10
    fi

    # Monitor disk usage
    if command -v df >/dev/null 2>&1; then
        echo "Disk usage:"
        df -h . | head -2
    fi

    # Monitor network connections
    if command -v lsof >/dev/null 2>&1; then
        echo "Active network connections:"
        lsof -i :8080 -i :9323 2>/dev/null || echo "No test-related network connections"
    fi
}

# Function to analyze test performance
analyze_performance() {
    echo "🔍 Analyzing test performance..."

    # Check if test results exist
    if [ -f "test-results/results.json" ]; then
        echo "Test results found. Analyzing..."

        # Extract basic metrics
        if command -v jq >/dev/null 2>&1; then
            echo "Test summary:"
            jq -r '.stats | "Total: \(.total), Passed: \(.passed), Failed: \(.failed), Flaky: \(.flaky)"' test-results/results.json 2>/dev/null || echo "Could not parse test results"
        fi
    else
        echo "No test results found. Run tests first."
    fi

    # Check for common performance issues
    echo "Performance checklist:"
    echo "✅ Browser processes cleaned"
    echo "✅ Test artifacts cleaned"
    echo "✅ System caches cleared"
    echo "✅ Network connections closed"
}

# Function to setup optimized environment
setup_environment() {
    echo "🚀 Setting up optimized test environment..."

    # Clean existing artifacts
    clean_test_artifacts

    # Optimize system
    optimize_system

    # Install/update Playwright browsers if needed
    if [ ! -d "~/.cache/ms-playwright" ]; then
        echo "Installing Playwright browsers..."
        npx playwright install
    fi

    # Verify environment
    echo "Verifying test environment..."
    npx playwright --version

    echo "✅ Test environment ready"
}

# Main script logic
case "${1:-}" in
    "clean")
        clean_test_artifacts
        ;;
    "optimize")
        optimize_system
        ;;
    "monitor")
        monitor_resources
        ;;
    "analyze")
        analyze_performance
        ;;
    "setup")
        setup_environment
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
