#!/bin/bash

# CI Quality Gate Script
# Usage: ./scripts/ci-quality-gate.sh [preview|staging|production]

set -e  # Exit on any error

case "$1" in
    "preview"|"staging"|"production")
        echo "🚀 Running CI Quality Gate ($1)..."
        echo "🔧 Clean up..."
        pnpm run clean:all
        echo "🔧 Generate GraphQL code..."
        pnpm run codegen
        echo "🔧 Fix lint and format issues..."
        pnpm run lint:fix && pnpm run format
        echo "🔧 Validate and fix TypeScript types..."
        pnpm run validate:types && pnpm run fix:types
        echo "🔧 TypeScript type check..."
        pnpm run typecheck
        echo "🔧 Fix lint and format issues again..."
        pnpm run lint:fix && pnpm run format
        echo "🔧 Check circular dependencies..."
        pnpm run check:circular
        echo "🔧 Verify environment variables..."
        if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
            echo "🤖 CI environment detected - skipping environment verification"
        else
            pnpm run verify-env
        fi
        echo "🔧 Build project..."
        pnpm run build
        echo "🔧 Check for unused exports..."
        pnpm run check:unused:exports
        echo "🔧 Check bundle size..."
        pnpm run check:size
        echo "✅ CI Quality Gate ($1) completed successfully!"
        ;;
    *)
        echo "Usage: $0 [preview|staging|production]"
        echo "  preview    - Run quality gate for preview (validation only)"
        echo "  staging    - Run quality gate for staging (validation only)"
        echo "  production - Run quality gate for production (validation only)"
        exit 1
        ;;
esac
