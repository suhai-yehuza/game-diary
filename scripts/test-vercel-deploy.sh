#!/bin/bash

# Test script for Vercel deployment configuration
set -e

echo "🧪 Testing Vercel deployment configuration..."

# Check if we're in a CI environment
if [ "$CI" = "true" ]; then
    echo "✅ Running in CI environment"
else
    echo "⚠️  Running in local environment"
fi

# Check if pnpm is available
echo "📦 Checking pnpm availability..."
if command -v pnpm >/dev/null 2>&1; then
    echo "✅ pnpm is available: $(pnpm --version)"
else
    echo "⚠️  pnpm not found globally - this is expected in local environment"
    echo "   In Vercel environment, corepack will handle pnpm installation"
fi

# Test dependency installation (simulating Vercel's approach)
echo "📦 Testing dependency installation..."
pnpm install --frozen-lockfile --prefer-offline --no-optional

# Test build command
echo "🔨 Testing build command..."
pnpm run build

echo "✅ Vercel deployment configuration test completed successfully!"
echo "📋 Summary:"
echo "   - Dependencies installed successfully"
echo "   - Build completed successfully"
echo "   - Configuration is ready for Vercel deployment"
