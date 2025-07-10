#!/bin/bash

# Centralized CI Configuration Script
# This script provides environment-specific configurations for CI/CD pipelines

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

# Function to get environment configuration
get_env_config() {
    local environment=$1
    local config_key=$2

    case "$environment" in
        "preview")
            case "$config_key" in
                "QUALITY_GATE_MODE") echo "basic" ;;
                "UNIT_TESTS_MODE") echo "standard" ;;
                "E2E_TESTS") echo "sanity,smoke" ;;
                "E2E_PAGES") echo "base,content" ;;
                "SOAK_DURATION") echo "0" ;;
                "PERFORMANCE_TESTS") echo "false" ;;
                "COVERAGE_TESTS") echo "false" ;;
                *) echo "Unknown config key: $config_key" >&2; exit 1 ;;
            esac
            ;;
        "staging")
            case "$config_key" in
                "QUALITY_GATE_MODE") echo "production" ;;
                "UNIT_TESTS_MODE") echo "strict" ;;
                "E2E_TESTS") echo "sanity,smoke,critical" ;;
                "E2E_PAGES") echo "base,content,interactive" ;;
                "SOAK_DURATION") echo "1800" ;;
                "PERFORMANCE_TESTS") echo "true" ;;
                "COVERAGE_TESTS") echo "false" ;;
                *) echo "Unknown config key: $config_key" >&2; exit 1 ;;
            esac
            ;;
        "production")
            case "$config_key" in
                "QUALITY_GATE_MODE") echo "production" ;;
                "UNIT_TESTS_MODE") echo "strict" ;;
                "E2E_TESTS") echo "sanity,smoke,critical,responsive" ;;
                "E2E_PAGES") echo "base,content,interactive,advanced" ;;
                "SOAK_DURATION") echo "3600" ;;
                "PERFORMANCE_TESTS") echo "true" ;;
                "COVERAGE_TESTS") echo "true" ;;
                *) echo "Unknown config key: $config_key" >&2; exit 1 ;;
            esac
            ;;
        *)
            echo "Unknown environment: $environment" >&2
            exit 1
            ;;
    esac
}

# Function to validate environment
validate_environment() {
    local environment=$1

    case "$environment" in
        "preview"|"staging"|"production")
            log_success "Environment '$environment' is valid"
            ;;
        *)
            echo "Unknown environment: $environment" >&2
            echo "Available environments: preview, staging, production" >&2
            exit 1
            ;;
    esac
}

# Function to show available environments
show_environments() {
    echo "Available environments:"
    echo "  - preview"
    echo "  - staging"
    echo "  - production"
}

# Function to show environment details
show_environment_details() {
    local environment=$1

    validate_environment "$environment"

    echo "Configuration for environment: $environment"
    echo "=========================================="
    printf "%-20s: %s\n" "QUALITY_GATE_MODE" "$(get_env_config "$environment" "QUALITY_GATE_MODE")"
    printf "%-20s: %s\n" "UNIT_TESTS_MODE" "$(get_env_config "$environment" "UNIT_TESTS_MODE")"
    printf "%-20s: %s\n" "E2E_TESTS" "$(get_env_config "$environment" "E2E_TESTS")"
    printf "%-20s: %s\n" "E2E_PAGES" "$(get_env_config "$environment" "E2E_PAGES")"
    printf "%-20s: %s\n" "SOAK_DURATION" "$(get_env_config "$environment" "SOAK_DURATION")"
    printf "%-20s: %s\n" "PERFORMANCE_TESTS" "$(get_env_config "$environment" "PERFORMANCE_TESTS")"
    printf "%-20s: %s\n" "COVERAGE_TESTS" "$(get_env_config "$environment" "COVERAGE_TESTS")"
}

# Main script logic
case "${1:-help}" in
    "get")
        if [[ $# -lt 3 ]]; then
            echo "Usage: $0 get <environment> <config_key>" >&2
            exit 1
        fi
        get_env_config "$2" "$3"
        ;;
    "validate")
        if [[ $# -lt 2 ]]; then
            echo "Usage: $0 validate <environment>" >&2
            exit 1
        fi
        validate_environment "$2"
        ;;
    "list")
        show_environments
        ;;
    "show")
        if [[ $# -lt 2 ]]; then
            echo "Usage: $0 show <environment>" >&2
            exit 1
        fi
        show_environment_details "$2"
        ;;
    "help"|*)
        echo "Usage: $0 <command> [options]"
        echo ""
        echo "Commands:"
        echo "  get <environment> <config_key>  - Get specific configuration value"
        echo "  validate <environment>          - Validate environment exists"
        echo "  list                            - List available environments"
        echo "  show <environment>              - Show all configuration for environment"
        echo "  help                            - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 get staging E2E_TESTS"
        echo "  $0 validate production"
        echo "  $0 show preview"
        ;;
esac
