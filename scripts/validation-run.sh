#!/bin/bash

# Validation Runner
# Usage: ./scripts/validation-run.sh [validation-type]
# Types: basic, soft, full, dev, dev-build, production

source "$(dirname "$0")/validation-helpers.sh"

case "$1" in
    "basic")
        run_basic_validation
        ;;
    "soft")
        run_soft_validation
        ;;
    "full")
        run_full_validation
        ;;
    "dev")
        run_dev_validation
        ;;
    "dev-build")
        run_dev_build
        ;;
    "production")
        run_production_validation
        ;;
    *)
        echo "Usage: $0 [basic|soft|full|dev|dev-build|production]"
        echo "  basic       - Circular deps, type validation/fix, env verification"
        echo "  soft        - Codegen, fix, basic validation"
        echo "  full        - Prebuild, build, soft validation, unused exports, test:strict, test:e2e:fast"
        echo "  dev         - Full validation (dev context)"
        echo "  dev-build   - Dev validation + size check (for dev build pipelines)"
        echo "  production  - Full validation (prod context)"
        exit 1
        ;;
esac
