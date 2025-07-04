#!/bin/bash

# CI Runner Script
# Usage: ./scripts/ci-runner.sh [preview|staging|production]

set -e  # Exit on any error

# Define step functions
run_quality_gate() {
    local environment=$1
    echo "📋 Step $2: Quality Gate (Validation)"
    ./scripts/ci-quality-gate.sh "$environment"
}

run_unit_tests() {
    echo "📋 Step $1: Unit Tests"
    ./scripts/ci-unit-tests.sh
}

run_e2e_fast() {
    echo "📋 Step $1: E2E Fast Tests"
    ./scripts/ci-e2e-tests.sh fast
}

run_e2e_critical() {
    echo "📋 Step $1: E2E Critical Tests"
    ./scripts/ci-e2e-tests.sh critical
}

run_e2e_responsive() {
    echo "📋 Step $1: E2E Responsive Tests"
    ./scripts/e2e-responsive.sh
}

run_e2e_coverage_full() {
    echo "📋 Step $1: E2E Comprehensive Tests with Coverage"
    ./scripts/e2e-run-with-coverage-full.sh
}

# Define pipeline configurations
get_preview_pipeline() {
    echo "quality_gate:preview unit_tests e2e_fast"
}

get_staging_pipeline() {
    echo "quality_gate:production unit_tests e2e_fast e2e_critical e2e_responsive"
}

get_staging_soak_pipeline() {
    echo "quality_gate:production unit_tests e2e_fast e2e_critical e2e_responsive"
}

get_production_pipeline() {
    echo "quality_gate:production unit_tests e2e_fast e2e_critical e2e_responsive e2e_coverage_full"
}

# Execute pipeline
execute_pipeline() {
    local environment=$1
    local pipeline_steps

    case "$environment" in
        "preview")
            pipeline_steps=$(get_preview_pipeline)
            ;;
        "staging")
            pipeline_steps=$(get_staging_pipeline)
            ;;
        "staging-soak")
            pipeline_steps=$(get_staging_soak_pipeline)
            ;;
        "production")
            pipeline_steps=$(get_production_pipeline)
            ;;
        *)
            echo "Error: Unknown environment '$environment'"
            exit 1
            ;;
    esac

    echo "🚀 Running CI ${environment} Pipeline..."

    local step_number=1
    IFS=' ' read -ra steps <<< "$pipeline_steps"

    for step in "${steps[@]}"; do
        IFS=':' read -ra step_parts <<< "$step"
        local step_name=${step_parts[0]}
        local step_arg=${step_parts[1]:-}

        case "$step_name" in
            "quality_gate")
                run_quality_gate "$step_arg" "$step_number"
                ;;
            "unit_tests")
                run_unit_tests "$step_number"
                ;;
            "e2e_fast")
                run_e2e_fast "$step_number"
                ;;
            "e2e_critical")
                run_e2e_critical "$step_number"
                ;;
            "e2e_responsive")
                run_e2e_responsive "$step_number"
                ;;
            "e2e_coverage_full")
                run_e2e_coverage_full "$step_number"
                ;;
            *)
                echo "Error: Unknown step '$step_name'"
                exit 1
                ;;
        esac

        ((step_number++))
    done

    echo "✅ CI ${environment} Pipeline completed successfully!"
}

# Main execution
case "$1" in
    "preview"|"staging"|"staging-soak"|"production")
        execute_pipeline "$1"
        ;;
    *)
        echo "Usage: $0 [preview|production|staging|staging-soak]"
        echo "  preview     - Run CI preview pipeline (validation + unit + e2e fast)"
        echo "  staging     - Run CI staging pipeline (validation + unit + e2e fast + e2e critical + e2e responsive)"
        echo "  staging-soak - Run CI staging with soak pipeline (validation + unit + e2e fast + e2e critical + e2e responsive)"
        echo "  production  - Run CI production pipeline (validation + unit + e2e fast + e2e critical + e2e coverage full)"
        exit 1
        ;;
esac
