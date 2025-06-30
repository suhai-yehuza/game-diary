#!/bin/bash

# Validation Runner
# Usage: ./scripts/validation-run.sh [validation-type]
# Types: basic, soft, full, dev, production

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
    "production")
        run_production_validation
        ;;
    *)
        echo "Usage: $0 [basic|soft|full|dev|production]"
        echo "  basic     - Format, typecheck, lint, circular deps, type validation, env verification"
        echo "  soft      - Codegen, format, fix, + basic validation"
        echo "  full      - Soft validation + unused exports + size check"
        echo "  dev       - Soft validation + unused exports + dev tests + size check"
        echo "  production- Soft validation + unused exports + all tests + size check"
        exit 1
        ;;
esac
