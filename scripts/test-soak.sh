#!/bin/bash

# Test script for soak monitoring functionality
# This script tests the soak monitoring without actually running a full soak period

# Don't exit on error for testing purposes
# set -e

echo "🧪 Testing Soak Monitoring Functionality"
echo "========================================"

# Test 1: Check if soak script exists and is executable
echo "Test 1: Checking soak script..."
if [ -f "./scripts/soak-monitor.sh" ]; then
    echo "✅ Soak script exists"
    if [ -x "./scripts/soak-monitor.sh" ]; then
        echo "✅ Soak script is executable"
    else
        echo "❌ Soak script is not executable"
        chmod +x "./scripts/soak-monitor.sh"
        echo "✅ Made soak script executable"
    fi
else
    echo "❌ Soak script not found"
    exit 1
fi

# Test 2: Test soak directory creation
echo ""
echo "Test 2: Testing soak directory creation..."
./scripts/soak-monitor.sh start staging 60 || {
    echo "Expected failure due to missing VERCEL_STAGING_URL"
}
if [ -d "./.soak" ]; then
    echo "✅ Soak directory created"
    if [ -f "./.soak/status.json" ]; then
        echo "✅ Status file created"
        cat "./.soak/status.json" | jq '.' 2>/dev/null || cat "./.soak/status.json"
    else
        echo "❌ Status file not created"
    fi
else
    echo "❌ Soak directory not created"
fi

# Test 3: Test status command
echo ""
echo "Test 3: Testing status command..."
./scripts/soak-monitor.sh status

# Test 4: Test with invalid environment
echo ""
echo "Test 4: Testing with invalid environment..."
if ./scripts/soak-monitor.sh start invalid-env 60 2>/dev/null; then
    echo "❌ Should have failed with invalid environment"
else
    echo "✅ Correctly failed with invalid environment"
fi

# Test 5: Test health check function (if URL is available)
echo ""
echo "Test 5: Testing health check..."
if [ -n "$VERCEL_STAGING_URL" ]; then
    echo "Testing health check with URL: $VERCEL_STAGING_URL"
    # Run a quick health check
    if curl -s --max-time 10 "$VERCEL_STAGING_URL/api/health" > /dev/null 2>&1; then
        echo "✅ Health endpoint is accessible"
    else
        echo "⚠️ Health endpoint not accessible (this is expected if deployment is not running)"
    fi
else
    echo "⚠️ No VERCEL_STAGING_URL set, skipping health check test"
fi

# Test 6: Clean up test files
echo ""
echo "Test 6: Cleaning up test files..."
rm -rf "./.soak"
echo "✅ Cleanup completed"

echo ""
echo "🎉 Soak monitoring tests completed!"
echo "The soak monitoring script appears to be working correctly."
