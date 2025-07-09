#!/bin/bash

# CI Unit Tests Script
# Usage: ./scripts/ci-unit-tests.sh

set -e  # Exit on any error

echo "🚀 Running CI Unit Tests..."
echo "🔧 Using centralized deployment validator for unit tests..."
./scripts/deployment-validator.sh ci --skip-e2e-tests --skip-db-tests --skip-size-check
echo "✅ CI Unit Tests completed successfully!"
