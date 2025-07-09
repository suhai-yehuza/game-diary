#!/bin/bash

# CI Quality Gate Script
# Usage: ./scripts/ci-quality-gate.sh [preview|staging|production]

set -e  # Exit on any error

case "$1" in
    "preview"|"staging"|"staging-soak"|"production")
        echo "🚀 Running CI Quality Gate ($1)..."
        echo "🔧 Using centralized deployment validator for quality gate..."
        ./scripts/deployment-validator.sh ci --skip-e2e-tests --skip-db-tests
        echo "✅ CI Quality Gate ($1) completed successfully!"
        ;;
    *)
        echo "Usage: $0 [preview|staging|production]"
        echo "  preview    - Run quality gate for preview (validation only)"
        echo "  staging    - Run quality gate for staging (validation only)"
    echo "  staging-soak - Run quality gate for staging with soak period (validation only)"
        echo "  production - Run quality gate for production (validation only)"
        exit 1
        ;;
esac
