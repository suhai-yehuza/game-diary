#!/bin/bash

# CI Unit Tests Script
# Usage: ./scripts/ci-unit-tests.sh

set -e  # Exit on any error

echo "🚀 Running CI Unit Tests..."
echo "🔧 Install Playwright browsers..."
pnpm exec playwright install --with-deps
echo "🔧 Run unit tests..."
pnpm run test:unit
echo "✅ CI Unit Tests completed successfully!"
