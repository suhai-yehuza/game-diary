#!/bin/bash

# Validation Script - Optimized Version 2.0 (Fail-Fast)
# Usage: ./scripts/validate.sh [subcommand] [options]
#
# Subcommands:
#   dev - Basic validation (prebuild, postbuild, db triggers, tests, env verification)
#   ci - CI-friendly validation (skips environment validation)
#   dev - Development workflow (basic validation)
#   full - Full validation with build
#   staging - Full validation + size check (for staging deployment)
#   production - Full validation (prod context)
#   circular - Check circular dependencies
#   types - Validate and fix types
#   env - Verify environment variables
#   size - Check bundle size
#   unused - Check unused exports
#   dead-code - Check dead code
#   coverage - Run unit test coverage validation
#   help - Show this help message
#
# Fail-Fast Behavior:
# - Script stops immediately when any task fails
# - Provides clear error messages indicating which task failed
# - Shows progress (current task / total tasks) during execution
# - Exits with appropriate error codes for CI/CD integration
#
# Optimizations applied:
# - Fixed duplicate function definitions
# - Added missing task mappings
# - Improved error handling and retry logic
# - Better separation of concerns
# - Enhanced performance with optimized timeouts
# - Streamlined validation workflows
# - Implemented fail-fast behavior for faster feedback

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
DEFAULT_TIMEOUT=1800 # 30 minutes
DEFAULT_RETRIES=1
CI_TIMEOUT=1800 # 30 minutes
CI_RETRIES=2
E2E_TIMEOUT=1800  # 30 minutes for E2E tests

# Helper functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

log_info() {
    echo -e "${PURPLE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️${NC} $1"
}

# Check if we're in CI environment
is_ci() {
    [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ] || [ "$VERCEL" = "1" ]
}

# Check if timeout command is available
has_timeout() {
    command -v timeout >/dev/null 2>&1
}

# Cleanup function for E2E tests
cleanup_e2e_resources() {
    log_info "Cleaning up E2E test resources..."

    # Kill any lingering Playwright processes
    pkill -f "playwright" 2>/dev/null || true

    # Clear browser cache and temporary files
    rm -rf ~/.cache/ms-playwright 2>/dev/null || true

    # Force garbage collection if possible
    if command -v node >/dev/null 2>&1; then
        node -e "if (global.gc) global.gc();" 2>/dev/null || true
    fi

    log_success "E2E cleanup completed"
}

# Generic validation function with timeout and retry logic
run_validation_with_retry() {
    local task_name="$1"
    local task_command="$2"
    local max_retries="${3:-$DEFAULT_RETRIES}"
    local timeout_seconds="${4:-$DEFAULT_TIMEOUT}"
    local silent="${5:-false}"

    # Adjust timeout and retries for CI and E2E tests
    if is_ci; then
        timeout_seconds="$CI_TIMEOUT"
        max_retries="$CI_RETRIES"
    elif [[ "$task_name" == *"e2e"* ]]; then
        timeout_seconds="$E2E_TIMEOUT"
        max_retries=1  # Don't retry E2E tests to avoid resource conflicts
    fi

    for ((attempt=1; attempt<=max_retries; attempt++)); do
        if [ "$silent" = "false" ]; then
            log_info "Running $task_name (attempt $attempt/$max_retries)..."
        fi

        local exit_code=0
        # Show output for E2E tests to help with debugging
        if [[ "$task_name" == *"e2e"* ]]; then
            # Cleanup before running E2E tests
            cleanup_e2e_resources

            if has_timeout; then
                timeout "$timeout_seconds" pnpm run "$task_command"
                exit_code=$?
            else
                pnpm run "$task_command"
                exit_code=$?
            fi

            # Cleanup after E2E tests
            cleanup_e2e_resources
        else
            if has_timeout; then
                timeout "$timeout_seconds" pnpm run "$task_command" > /dev/null 2>&1
                exit_code=$?
            else
                pnpm run "$task_command" > /dev/null 2>&1
                exit_code=$?
            fi
        fi

        if [ $exit_code -eq 0 ]; then
            if [ "$silent" = "false" ]; then
                log_success "$task_name completed successfully"
            fi
            return 0
        else
            if [ $attempt -lt $max_retries ]; then
                if [ "$silent" = "false" ]; then
                    log_warning "$task_name failed (attempt $attempt) - retrying..."
                fi
                sleep 2
            else
                if [ "$silent" = "false" ]; then
                    log_error "$task_name failed after $max_retries attempts"
                fi
                return 1
            fi
        fi
    done
}

# Simple validation function for quick tasks
run_simple_validation() {
    local task_name="$1"
    local task_command="$2"

    log_info "Running $task_name..."

    # Show output for E2E tests to help with debugging
    if [[ "$task_name" == *"e2e"* ]]; then
        if pnpm run "$task_command"; then
            log_success "$task_name completed"
            return 0
        else
            log_error "$task_name failed"
            return 1
        fi
    else
        if pnpm run "$task_command" > /dev/null 2>&1; then
            log_success "$task_name completed"
            return 0
        else
            log_error "$task_name failed"
            return 1
        fi
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [subcommand] [options]"
    echo ""
    echo "Subcommands:"
    echo "  dev - Basic validation (prebuild, postbuild, db triggers, tests, env verification)"
    echo "  ci - CI-friendly validation (skips environment validation)"
    echo "  dev - Development workflow (dev validation)"
    echo "  full - Full validation with build"
    echo "  staging - Full validation + size check (for staging deployment)"
    echo "  production - Full validation (prod context)"
    echo "  circular - Check circular dependencies"
    echo "  types - Validate and fix types"
    echo "  env - Verify environment variables"
    echo "  size - Check bundle size"
    echo "  unused - Check unused exports"
    echo "  dead-code - Check dead code"
    echo "  coverage - Run unit test coverage validation"
    echo ""
    echo "Examples:"
    echo "  $0 dev"
    echo "  $0 ci"
    echo "  $0 dev"
    echo "  $0 staging"
    echo "  $0 circular"
    echo "  $0 coverage"
}

# =============================================================================
# VALIDATION FUNCTIONS
# =============================================================================

# Run a validation task with appropriate retry logic
run_task() {
    local task_name="$1"
    local use_retry="${2:-true}"

    # Map task names to pnpm commands
    case "$task_name" in
        "prebuild") local cmd="prebuild" ;;
        "postbuild") local cmd="postbuild" ;;
        "build") local cmd="build" ;;
        "format_check") local cmd="format:check" ;;
        "format") local cmd="format" ;;
        "lint") local cmd="lint" ;;
        "lint_fix") local cmd="lint:fix" ;;
        "codegen") local cmd="codegen" ;;
        "typecheck") local cmd="typecheck" ;;
        "types_validate") local cmd="validate:types" ;;
        "circular") local cmd="check:circular" ;;
        "dead_code") local cmd="check:dead:code" ;;
        "size") local cmd="check:size" ;;
        "db_triggers") local cmd="db:test:all-triggers" ;;
        "rapidapi") local cmd="validate:rapidapi" ;;
        "test_unit") local cmd="test:unit" ;;
        "test_strict") local cmd="test:strict" ;;
        "test_coverage") local cmd="coverage:validate" ;;
        "test_e2e_sanity") local cmd="test:e2e:sanity" ;;
        "test_e2e_critical") local cmd="test:e2e:critical" ;;
        "test_e2e_mock") local cmd="test:e2e:mock-verification" ;;
        "test_e2e_security") local cmd="test:e2e:security" ;;
        "test_e2e_search") local cmd="test:e2e:search" ;;
        "test_integration") local cmd="test:integration" ;;
        "security_encryption") local cmd="security:test-encryption" ;;
        "security_keys") local cmd="security:key-management" ;;
        "security_rls") local cmd="security:test-rls" ;;
        "security_alerting") local cmd="security:test-alerting" ;;
        *)
            log_error "Unknown task: $task_name"
            return 1
            ;;
    esac

    if [ "$use_retry" = "true" ]; then
        run_validation_with_retry "$task_name" "$cmd"
    else
        run_simple_validation "$task_name" "$cmd"
    fi
}

# Run multiple tasks in sequence with fail-fast behavior
run_tasks() {
    local tasks=("$@")
    local total_tasks=${#tasks[@]}
    local current_task=0

    log_info "Running $total_tasks task(s) with fail-fast behavior..."

    for task in "${tasks[@]}"; do
        ((current_task++))
        log_info "Running task $current_task/$total_tasks: $task"

        if ! run_task "$task"; then
            log_error "Task '$task' failed - stopping execution (fail-fast)"
            log_error "$current_task of $total_tasks task(s) completed before failure"
            return 1
        fi

        log_success "Task $current_task/$total_tasks completed: $task"
    done

    log_success "All $total_tasks task(s) completed successfully"
    return 0
}

# Environment validation functions
validate_basic_env() {
    log_info "Running basic environment validation..."
    if pnpm run verify-env; then
        log_success "Basic environment validation passed"
        return 0
    else
        log_warning "Basic environment validation failed"
        return 1
    fi
}

validate_env_file() {
    local node_env="${NODE_ENV:-development}"
    local env_file=""

    case "$node_env" in
        "production") env_file=".env.production" ;;
        "staging") env_file=".env.staging" ;;
        "development") env_file=".env.development" ;;
    esac

    if [ -f "$env_file" ]; then
        log_info "Loading environment from $env_file"
        export $(grep -v '^#' "$env_file" | xargs)
    else
        log_warning "Environment file $env_file not found"
    fi
}

validate_security_keys() {
    if is_ci; then
        log_info "Skipping security key validation in CI"
        return 0
    fi

    local failed_checks=0

    # Check encryption key
    if [ -z "$DATA_ENCRYPTION_KEY" ]; then
        log_warning "DATA_ENCRYPTION_KEY not set"
        ((failed_checks++))
    elif [[ ! "$DATA_ENCRYPTION_KEY" =~ ^[0-9a-fA-F]{64}$ ]]; then
        log_error "DATA_ENCRYPTION_KEY must be a 64-character hex string"
        ((failed_checks++))
    else
        log_success "DATA_ENCRYPTION_KEY format validated"
    fi

    # Check Slack webhook
    if [ -z "$SLACK_ALERT_WEBHOOK_URL" ]; then
        log_warning "SLACK_ALERT_WEBHOOK_URL not set"
    else
        log_success "SLACK_ALERT_WEBHOOK_URL found"
    fi

    return $failed_checks
}

validate_production_env() {
    local node_env="${NODE_ENV:-development}"
    local failed_checks=0

    case "$node_env" in
        "production"|"staging")
            if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ] || [ -z "$CLERK_SECRET_KEY" ]; then
                log_error "Clerk authentication keys are required for $node_env"
                ((failed_checks++))
            fi

            if [ -z "$DATABASE_URL" ]; then
                log_error "DATABASE_URL is required for $node_env"
                ((failed_checks++))
            fi

            if [ -z "$UPSTASH_REDIS_REST_URL" ] && [ -z "$REDIS_URL" ]; then
                log_warning "Redis configuration not found - caching may be limited"
            fi
            ;;
        "development"|"test")
            if [ -z "$DATABASE_URL" ]; then
                log_warning "DATABASE_URL not set - database features will be limited"
            fi

            if [ -z "$NEXT_PUBLIC_RAPID_API_KEY" ]; then
                log_warning "NEXT_PUBLIC_RAPID_API_KEY not set - external API features may be limited"
            fi
            ;;
    esac

    return $failed_checks
}

validate_database_connection() {
    if [ -n "$DATABASE_URL" ]; then
        log_info "Testing database connection..."
        if run_validation_with_retry "database connection" "db:test-connection" 1 30; then
            log_success "Database connection test passed"
            return 0
        else
            log_warning "Database connection test failed"
            return 1
        fi
    else
        log_info "Skipping database connection test - DATABASE_URL not set"
        return 0
    fi
}

validate_security_features() {
    if [ -z "$DATA_ENCRYPTION_KEY" ]; then
        log_info "Skipping security validations - DATA_ENCRYPTION_KEY not set"
        return 0
    fi

    log_info "Running security validations with fail-fast behavior..."
    local security_tasks=("security_encryption" "security_keys" "security_rls")

    for task in "${security_tasks[@]}"; do
        if ! run_task "$task"; then
            log_error "Security validation '$task' failed - stopping execution"
            return 1
        fi
    done

    log_success "All security validations passed"
    return 0
}

# Comprehensive environment validation with fail-fast behavior
run_env_verification() {
    log_info "Running comprehensive environment verification with fail-fast behavior..."

    log_info "Step 1/6: Validating environment file..."
    validate_env_file

    log_info "Step 2/6: Running basic environment validation..."
    if ! validate_basic_env; then
        log_error "Basic environment validation failed - stopping execution"
        return 1
    fi

    log_info "Step 3/6: Validating security keys..."
    if ! validate_security_keys; then
        log_error "Security keys validation failed - stopping execution"
        return 1
    fi

    log_info "Step 4/6: Validating production environment..."
    if ! validate_production_env; then
        log_error "Production environment validation failed - stopping execution"
        return 1
    fi

    log_info "Step 5/6: Testing database connection..."
    if ! validate_database_connection; then
        log_error "Database connection validation failed - stopping execution"
        return 1
    fi

    log_info "Step 6/6: Running security features validation..."
    if ! validate_security_features; then
        log_error "Security features validation failed - stopping execution"
        return 1
    fi

    # Test Slack alerting if configured
    if [ -n "$SLACK_ALERT_WEBHOOK_URL" ]; then
        log_info "Testing Slack alerting..."
        if ! run_task "security_alerting"; then
            log_error "Slack alerting validation failed - stopping execution"
            return 1
        fi
    else
        log_info "Skipping Slack alerting validation - SLACK_ALERT_WEBHOOK_URL not set"
    fi

    log_success "Environment verification completed successfully"
}

# =============================================================================
# VALIDATION WORKFLOWS
# =============================================================================

# CI-friendly validation (skips comprehensive environment checks)
run_ci_validation() {
    log "Running CI-friendly validation with fail-fast behavior..."

    local ci_tasks=("circular" "typecheck" "types_validate" "dead_code")
    if ! run_tasks "${ci_tasks[@]}"; then
        log_error "CI validation tasks failed - stopping execution"
        return 1
    fi

    log_info "Running basic environment check for CI..."
    if ! validate_basic_env; then
        log_error "CI environment validation failed - stopping execution"
        return 1
    fi

    log_success "CI-friendly validation completed successfully"
}

# Precommit validation workflow
run_precommit_validation() {
    log "Running precommit validation with fail-fast behavior..."

    local precommit_tasks=(
        "postbuild"
    )

    if ! run_tasks "${precommit_tasks[@]}"; then
        log_error "Precommit validation tasks failed - stopping execution"
        return 1
    fi

    log_success "Precommit validation completed successfully"
}

# Basic validation workflow
run_dev_validation() {
    log "Running dev validation with fail-fast behavior..."

    local dev_tasks=(
        "prebuild"
        "postbuild"
        "db_triggers"
        "rapidapi"
        "test_coverage"
        "test_integration"
        "test_e2e_mock"
        "test_e2e_sanity"
        "test_e2e_security"
        "test_e2e_search"
    )

    if ! run_tasks "${dev_tasks[@]}"; then
        log_error "Dev validation tasks failed - stopping execution"
        return 1
    fi

    # Environment validation (with CI handling)
    if is_ci; then
        log_info "Running CI-optimized environment validation..."
        if ! validate_basic_env; then
            log_error "CI environment validation failed - stopping execution"
            return 1
        fi
    else
        if ! run_env_verification; then
            log_error "Environment verification failed - stopping execution"
            return 1
        fi
    fi

    log_success "Dev validation completed successfully"
}

# Full validation workflow
run_full_validation() {
    log "Running full validation with fail-fast behavior..."

    if ! run_dev_validation; then
        log_error "Dev validation failed - stopping execution"
        return 1
    fi

    if ! run_task "build"; then
        log_error "Build task failed - stopping execution"
        return 1
    fi

    log_success "Full validation completed successfully"
}

# Staging validation workflow
run_staging_validation() {
    log "Running staging validation with fail-fast behavior..."

    # For local development, use development environment
    if ! is_ci; then
        log_info "Running staging validation in development mode (local build)"
        export NODE_ENV=development
    fi

    if ! run_full_validation; then
        log_error "Full validation failed - stopping execution"
        return 1
    fi

    if ! run_task "size"; then
        log_error "Size check failed - stopping execution"
        return 1
    fi

    log_success "Staging validation completed successfully"
}

# Production validation workflow
run_production_validation() {
    log "Running production validation with fail-fast behavior..."

    log_info "Setting production environment..."
    export NODE_ENV=production

    if ! run_full_validation; then
        log_error "Full validation failed - stopping execution"
        return 1
    fi

    if ! run_task "test_e2e_critical"; then
        log_error "Critical E2E tests failed - stopping execution"
        return 1
    fi

    if ! run_task "size"; then
        log_error "Size check failed - stopping execution"
        return 1
    fi

    log_success "Production validation completed successfully"
}

# =============================================================================
# MAIN SCRIPT LOGIC
# =============================================================================

SUBCOMMAND="${1:-help}"

case "$SUBCOMMAND" in
    "precommit")
        if ! run_precommit_validation; then
            log_error "Precommit validation failed"
            exit 1
        fi
        ;;
    "dev")
        if ! run_dev_validation; then
            log_error "Dev validation failed"
            exit 1
        fi
        ;;
    "ci")
        if ! run_ci_validation; then
            log_error "CI validation failed"
            exit 1
        fi
        ;;
    "full")
        if ! run_full_validation; then
            log_error "Full validation failed"
            exit 1
        fi
        ;;
    "staging")
        if ! run_staging_validation; then
            log_error "Staging validation failed"
            exit 1
        fi
        ;;
    "production")
        if ! run_production_validation; then
            log_error "Production validation failed"
            exit 1
        fi
        ;;
    "circular")
        log "Checking circular dependencies..."
        if ! run_task "circular"; then
            log_error "Circular dependency check failed"
            exit 1
        fi
        log_success "Circular dependency check completed"
        ;;
    "types")
        log "Validating and fixing types..."
        if ! run_tasks "typecheck" "types_validate"; then
            log_error "Type validation failed"
            exit 1
        fi
        log_success "Type validation and fixes completed"
        ;;
    "env")
        if ! run_env_verification; then
            log_error "Environment verification failed"
            exit 1
        fi
        ;;
    "size")
        log "Checking bundle size..."
        if ! run_task "size"; then
            log_error "Bundle size check failed"
            exit 1
        fi
        log_success "Bundle size check completed"
        ;;
    "unused")
        log "Checking unused exports..."
        if ! run_task "dead_code"; then
            log_error "Unused exports check failed"
            exit 1
        fi
        log_success "Unused exports check completed"
        ;;
    "dead-code")
        log "Checking dead code..."
        if ! run_task "dead_code"; then
            log_error "Dead code check failed"
            exit 1
        fi
        log_success "Dead code check completed"
        ;;
    "coverage")
        log "Running coverage validation..."
        if ! run_task "test_coverage"; then
            log_error "Coverage validation failed"
            exit 1
        fi
        log_success "Coverage validation completed"
        ;;
    "help"|"-h"|"--help")
        show_usage
        exit 0
        ;;
    *)
        log_error "Unknown subcommand: $SUBCOMMAND"
        show_usage
        exit 1
        ;;
esac
