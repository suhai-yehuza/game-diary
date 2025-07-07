#!/bin/bash

# Validation Runner
# Usage: ./scripts/validation-run.sh [validation-type]
# Types: basic, dev, full, staging, production

source "$(dirname "$0")/validation-helpers.sh"

case "$1" in
    "basic")
        run_basic_validation
        ;;
    "dev")
        run_dev_workflow
        ;;
    "full")
        run_full_validation
        ;;
    "staging")
        run_staging_validation
        ;;
    "production")
        run_production_validation
        ;;
    *)
        echo "Usage: $0 [basic|dev|full|staging|production]"
        echo "  basic       - Circular deps, type validation/fix, env verification"
        echo "  dev         - Development workflow (codegen + quick fix + basic validation)"
        echo "  full        - Prebuild, build, soft validation, unused exports, test:strict, test:e2e:smoke"
        echo "  staging     - Full validation + size check (for staging deployment)"
        echo "  production  - Full validation (prod context)"
        exit 1
        ;;
esac
