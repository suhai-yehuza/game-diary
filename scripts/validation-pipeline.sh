#!/bin/bash

# Unified Validation Script - Superset of validate.sh and deployment-validator.sh
# Usage: ./scripts/validation-pipeline.sh [subcommand] [options]
#
# Subcommands:
#   dev          - Development validation (prebuild, postbuild, tests, env verification)
#   ci           - CI-friendly validation (skips environment validation)
#   staging      - Staging validation with size check
#   production   - Production validation (full validation + critical E2E)
#   dry-run      - Production dry run without deployment
#   pre-deploy   - Pre-deployment validation only
#   post-deploy  - Post-deployment validation only
#   circular     - Check circular dependencies
#   types        - Validate and fix types
#   env          - Verify environment variables
#   size         - Check bundle size
#   unused       - Check unused exports
#   dead-code    - Check dead code
#   coverage     - Run unit test coverage validation
#   e2e          - E2E test management (run, setup, cleanup, server)
#   help         - Show this help message
#
# Options:
#   --skip-db-tests     - Skip database trigger tests
#   --skip-e2e-tests    - Skip E2E tests
#   --skip-size-check   - Skip bundle size check
#   --skip-performance  - Skip performance tests
#   --fast              - Run only critical tests (sanity + critical)
#   --full              - Run full test suite (default)
#   --verbose           - Enable verbose output
#   --deployment-url    - URL for post-deployment tests
#   --browser=BROWSER   - Browser for E2E tests (chromium, webkit, firefox, mobile)
#   --workers=N         - Number of E2E test workers (default: 2)
#   --headed            - Run E2E tests in headed mode
#   --debug             - Enable E2E debug mode
#   --port=N            - Server port for E2E tests (default: 3000)
#   --retries=N         - Number of E2E test retries (default: 2)
#   --timeout=N         - E2E test timeout in ms (default: 120000)
#
# Features:
# - Fail-fast behavior for faster feedback
# - Comprehensive environment validation
# - Security key validation
# - Database connection testing
# - E2E test management with browser installation
# - CI/CD optimized workflows
# - Deployment-specific validation modes

set -e

# Source shared utilities
source "$(dirname "$0")/script-utils.sh"

# Configuration
DEFAULT_TIMEOUT=1800 # 30 minutes
DEFAULT_RETRIES=1
CI_TIMEOUT=1800 # 30 minutes
CI_RETRIES=2
E2E_TIMEOUT=1800  # 30 minutes for E2E tests

# E2E Configuration
E2E_BROWSER="chromium"
E2E_WORKERS=2
E2E_HEADED=false
E2E_DEBUG=false
E2E_PORT=3000
E2E_RETRIES=2
E2E_TIMEOUT_MS=120000
E2E_TEST_SUITE=""
E2E_MODE="run"

# URL Configuration
LOCALHOST_URL="${LOCALHOST_URL:-http://localhost:$E2E_PORT}"

# Check if we're in CI environment
is_ci() {
    [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ] || [ "$VERCEL" = "1" ]
}

# Check if timeout command is available
has_timeout() {
    command -v timeout >/dev/null 2>&1
}

# Utility functions for port management
find_server_pids() {
    local port="${1:-$E2E_PORT}"
    lsof -ti:$port 2>/dev/null || echo ""
}

is_port_in_use() {
    local port="${1:-$E2E_PORT}"
    lsof -i:$port -sTCP:LISTEN >/dev/null 2>&1
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

    # Clean up any processes on common test ports
    for port in 3000 3001 3002 3003; do
        if is_port_in_use "$port"; then
            log_info "Cleaning up processes on port $port..."
            local pids=$(find_server_pids "$port")
            if [ -n "$pids" ]; then
                echo "$pids" | xargs kill -9 2>/dev/null || true
            fi
        fi
    done

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
    echo "  precommit    - Fast pre-commit validation (format, lint, types, circular, dead-code)"
    echo "  prepush      - Medium pre-push validation (build, format, lint, types, coverage)"
    echo "  dev          - Development validation (prebuild, postbuild, tests, env verification)"
    echo "  ci           - CI-friendly validation (skips environment validation)"
    echo "  staging      - Staging validation with size check"
    echo "  production   - Production validation (full validation + critical E2E)"
    echo "  dry-run      - Production dry run without deployment"
    echo "  pre-deploy   - Pre-deployment validation only"
    echo "  post-deploy  - Post-deployment validation only"
    echo "  circular     - Check circular dependencies"
    echo "  types        - Validate and fix types"
    echo "  env          - Verify environment variables"
    echo "  size         - Check bundle size"
    echo "  unused       - Check unused exports"
    echo "  dead-code    - Check dead code"
    echo "  coverage     - Run unit test coverage validation"
    echo "  help         - Show this help message"
    echo ""
    echo "Options:"
    echo "  --skip-db-tests     - Skip database trigger tests"
    echo "  --skip-e2e-tests    - Skip E2E tests"
    echo "  --skip-size-check   - Skip bundle size check"
    echo "  --skip-performance  - Skip performance tests"
    echo "  --fast              - Run only critical tests (sanity + critical)"
    echo "  --full              - Run full test suite (default)"
    echo "  --verbose           - Enable verbose output"
    echo "  --deployment-url    - URL for post-deployment tests"
    echo ""
    echo "Examples:"
    echo "  $0 dev"
    echo "  $0 ci"
    echo "  $0 production"
    echo "  $0 dry-run --fast"
    echo "  $0 pre-deploy --skip-e2e-tests"
    echo "  $0 post-deploy --deployment-url https://app.example.com"
    echo ""
    echo "Environment Variables:"
    echo "  NODE_ENV           - Set to 'production' for production validation"
    echo "  DEPLOYMENT_URL     - URL for post-deployment tests"
    echo "  CI                 - Set to 'true' for CI environment"
}

# Parse command line arguments
SUBCOMMAND="${1:-help}"
SKIP_DB_TESTS=false
SKIP_E2E_TESTS=false
SKIP_SIZE_CHECK=false
SKIP_PERFORMANCE=false
SKIP_COVERAGE=false
FAST_MODE=false
VERBOSE=false
DEPLOYMENT_URL=""

# Handle E2E subcommand
if [ "$SUBCOMMAND" = "e2e" ]; then
    E2E_MODE="${2:-run}"
    E2E_TEST_SUITE="${3:-}"
    shift 2
    # If no subcommand provided, show help
    if [ -z "$E2E_MODE" ]; then
        show_e2e_usage
        exit 0
    fi
    # Skip argument parsing for E2E subcommand
    E2E_ARGS="$@"
else
    shift 1
fi

# Skip argument parsing for E2E subcommand
if [ "$SUBCOMMAND" != "e2e" ]; then
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-db-tests)
            SKIP_DB_TESTS=true
            shift
            ;;
        --skip-e2e-tests)
            SKIP_E2E_TESTS=true
            shift
            ;;
        --skip-size-check)
            SKIP_SIZE_CHECK=true
            shift
            ;;
        --skip-performance)
            SKIP_PERFORMANCE=true
            shift
            ;;
        --fast)
            FAST_MODE=true
            shift
            ;;
        --full)
            FAST_MODE=false
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --deployment-url)
            DEPLOYMENT_URL="$2"
            shift 2
            ;;
        --browser=*)
            E2E_BROWSER="${1#*=}"
            shift
            ;;
        --workers=*)
            E2E_WORKERS="${1#*=}"
            shift
            ;;
        --headed)
            E2E_HEADED=true
            shift
            ;;
        --debug)
            E2E_DEBUG=true
            shift
            ;;
        --port=*)
            E2E_PORT="${1#*=}"
            shift
            ;;
        --retries=*)
            E2E_RETRIES="${1#*=}"
            shift
            ;;
        --timeout=*)
            E2E_TIMEOUT_MS="${1#*=}"
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done
fi

# =============================================================================
# TASK MAPPING CONFIGURATION
# =============================================================================

# Get command for a task
get_task_command() {
    local task_name="$1"

    case "$task_name" in
        # Build tasks
        "prebuild") echo "prebuild" ;;
        "postbuild") echo "postbuild" ;;
        "build") echo "build" ;;

        # Code quality tasks
        "format_check") echo "format:check" ;;
        "format") echo "format" ;;
        "lint") echo "lint" ;;
        "lint_fix") echo "lint:fix" ;;
        "typecheck") echo "typecheck" ;;
        "circular") echo "check:circular" ;;
        "dead_code") echo "check:dead:code" ;;
        "size") echo "check:size" ;;

        # Code generation
        "codegen") echo "codegen" ;;

        # Infrastructure tasks
        "db_triggers") echo "db:test:all-triggers" ;;
        "rapidapi") echo "validate:rapidapi" ;;

        # Test tasks
        "test_unit") echo "test:unit" ;;
        "test_strict") echo "test:strict" ;;
        "test_coverage") echo "coverage:validate" ;;
        "test_integration") echo "test:integration" ;;

        # E2E test tasks
        "test_e2e_sanity") echo "test:e2e:sanity" ;;
        "test_e2e_critical") echo "test:e2e:critical" ;;
        "test_e2e_mock") echo "test:e2e:mock-verification" ;;
        "test_e2e_security") echo "test:e2e:security" ;;
        "test_e2e_search") echo "test:e2e:search" ;;
        "test_e2e_performance") echo "test:e2e:performance" ;;
        "test_e2e_navigation") echo "test:e2e:navigation" ;;
        "test_e2e_responsive") echo "test:e2e:responsive" ;;
        "test_e2e_cross_browser") echo "test:e2e:cross-browser" ;;
        "test_e2e_pages") echo "test:e2e:pages" ;;
        "test_e2e_live_games") echo "test:e2e:live-games" ;;
        "test_e2e_auth_protection") echo "test:e2e:auth-protection" ;;
        "test_e2e_clerk_auth") echo "test:e2e:clerk-auth" ;;
        "test_e2e_smoke") echo "test:e2e:smoke" ;;
        "test_e2e_vercel_auth") echo "test:e2e:vercel-auth" ;;

        # Security tasks
        "security_encryption") echo "security:test-encryption" ;;
        "security_keys") echo "security:key-management" ;;
        "security_rls") echo "security:test-rls" ;;
        "security_slack_alerting") echo "security:test-slack-alerting" ;;

        *) echo "" ;;
    esac
}

# Get E2E test path for a suite
get_e2e_test_path() {
    local suite="$1"

    case "$suite" in
        "sanity"|"fast") echo "tests/e2e/functional/sanity.spec.ts" ;;
        "smoke"|"standard") echo "tests/e2e/functional/smoke.spec.ts" ;;
        "critical") echo "tests/e2e/functional/critical.spec.ts" ;;
        "navigation") echo "tests/e2e/functional/navigation.spec.ts" ;;
        "performance") echo "tests/e2e/functional/performance.spec.ts" ;;
        "security"|"auth-protection") echo "tests/e2e/functional/auth-protection.spec.ts" ;;
        "vercel-auth") echo "tests/e2e/functional/vercel-auth-test.spec.ts" ;;
        "clerk-auth") echo "tests/e2e/pages/clerk-auth.spec.ts" ;;
        "search") echo "tests/e2e/functional/search.spec.ts" ;;
        "browser") echo "tests/e2e/functional/browser.spec.ts" ;;
        "mock-verification") echo "tests/e2e/functional/mock-verification.spec.ts" ;;
        "full"|"all") echo "tests/e2e/" ;;
        *) echo "" ;;
    esac
}

# =============================================================================
# VALIDATION FUNCTIONS
# =============================================================================

# Run a validation task with appropriate retry logic
run_task() {
    local task_name="$1"
    local use_retry="${2:-true}"

    # Skip E2E tasks if SKIP_E2E_TESTS is true
    if [[ "$task_name" == test_e2e_* ]] && [ "$SKIP_E2E_TESTS" = true ]; then
        log_warning "Skipping E2E task: $task_name (SKIP_E2E_TESTS=true)"
        return 0
    fi

    # Get command from mapping
    local cmd=$(get_task_command "$task_name")

    if [ -z "$cmd" ]; then
        log_error "Unknown task: $task_name"
        log_info "Available tasks: prebuild, postbuild, build, format_check, format, lint, lint_fix, typecheck, circular, dead_code, size, codegen, db_triggers, rapidapi, test_unit, test_strict, test_coverage, test_integration, test_e2e_*, security_*"
        return 1
    fi

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
    local security_tasks=("security_encryption" "security_keys" "security_rls" "security_slack_alerting")

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
        if ! run_task "security_slack_alerting"; then
            log_error "Slack alerting validation failed - stopping execution"
            return 1
        fi
    else
        log_info "Skipping Slack alerting validation - SLACK_ALERT_WEBHOOK_URL not set"
    fi

    log_success "Environment verification completed successfully"
}

# Function to ensure Playwright browsers are installed
ensure_playwright_browsers() {
    log_step "Ensuring Playwright browsers are installed..."

    # Use direct Playwright install command for better CI reliability
    log_info "Installing Playwright browsers with system dependencies..."
    pnpm exec playwright install --with-deps

    log_info "✅ Browser installation completed"
}

# Function to run E2E tests
run_e2e_tests() {
    if [ "$SKIP_E2E_TESTS" = true ]; then
        log_warning "Skipping E2E tests"
        return 0
    fi

    log_step "Running E2E tests..."

    # Ensure browsers are installed before running tests
    ensure_playwright_browsers

    if [ "$FAST_MODE" = true ]; then
        log_info "Running critical E2E tests only..."
        pnpm test:e2e:critical
    else
        log_info "Running full E2E test suite..."

        # Critical tests (includes sanity and smoke)
        pnpm test:e2e:critical

        # Performance tests
        if [ "$SKIP_PERFORMANCE" = false ]; then
            pnpm test:e2e:performance
        fi

        # Full E2E suite (includes navigation, responsive, cross-browser)
        pnpm test:e2e:navigation
        pnpm test:e2e:responsive
        pnpm test:e2e:cross-browser

        pnpm test:e2e:pages
    fi

    log_success "E2E tests completed"
}

# Function to run bundle size check
run_size_check() {
    if [ "$SKIP_SIZE_CHECK" = true ]; then
        log_warning "Skipping bundle size check"
        return 0
    fi

    log_step "Running bundle size check..."
    pnpm check:size:ci
    log_success "Bundle size check completed"
}

# =============================================================================
# COMMON TASK SETS
# =============================================================================

# Core code quality tasks (fastest)
get_core_tasks() {
    echo "format_check lint typecheck circular dead_code"
}

# Build tasks (medium speed)
get_build_tasks() {
    echo "prebuild postbuild"
}

# Test tasks (slower)
get_test_tasks() {
    echo "test_coverage"
}

# E2E test tasks (slowest)
get_e2e_tasks() {
    echo "test_e2e_mock test_e2e_sanity test_e2e_security test_e2e_search"
}

# Infrastructure tasks
get_infrastructure_tasks() {
    echo "db_triggers rapidapi"
}

# =============================================================================
# VALIDATION WORKFLOWS (HIERARCHICAL)
# =============================================================================

# Level 1: Core validation (fastest - pre-commit)
run_precommit_validation() {
    log "Running pre-commit validation (core tasks only)..."

    local core_tasks=($(get_core_tasks))

    if ! run_tasks "${core_tasks[@]}"; then
        log_error "Pre-commit validation tasks failed - stopping execution"
        return 1
    fi

    log_success "Pre-commit validation completed successfully"
}

# Level 2: Build validation (medium - pre-push)
run_prepush_validation() {
    log "Running pre-push validation (build + core + coverage)..."

    # Start with core tasks
    local core_tasks=($(get_core_tasks))
    local build_tasks=($(get_build_tasks))
    local test_tasks=($(get_test_tasks))

    local prepush_tasks=("${build_tasks[@]}" "${core_tasks[@]}" "${test_tasks[@]}")

    if ! run_tasks "${prepush_tasks[@]}"; then
        log_error "Pre-push validation tasks failed - stopping execution"
        return 1
    fi

    log_success "Pre-push validation completed successfully"
}

# Level 3: Development validation (comprehensive)
run_dev_validation() {
    log "Running development validation (full validation suite)..."

    # Build on pre-push tasks
    local prepush_tasks=($(get_build_tasks) $(get_core_tasks) $(get_test_tasks))
    local infrastructure_tasks=($(get_infrastructure_tasks))
    local e2e_tasks=($(get_e2e_tasks))

    local dev_tasks=("${prepush_tasks[@]}" "${infrastructure_tasks[@]}" "${e2e_tasks[@]}")

    if ! run_tasks "${dev_tasks[@]}"; then
        log_error "Development validation tasks failed - stopping execution"
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

    log_success "Development validation completed successfully"
}

# Level 4: Staging validation (build + dev validation)
run_staging_validation() {
    log "Running staging validation (dev validation + build check)..."

    # For local development, use development environment
    if ! is_ci; then
        log_info "Running staging validation in development mode (local build)"
        export NODE_ENV=development
    fi

    # Start with development validation
    if ! run_dev_validation; then
        log_error "Development validation failed - stopping execution"
        return 1
    fi

    # Add build check
    if ! run_task "build"; then
        log_error "Build task failed - stopping execution"
        return 1
    fi

    # Add size check
    if ! run_size_check; then
        log_error "Size check failed - stopping execution"
        return 1
    fi

    log_success "Staging validation completed successfully"
}

# Level 5: Production validation (staging + critical E2E)
run_production_validation() {
    log "Running production validation (staging + critical E2E)..."

    log_info "Setting production environment..."
    export NODE_ENV=production

    # Start with staging validation
    if ! run_staging_validation; then
        log_error "Staging validation failed - stopping execution"
        return 1
    fi

    # Add critical E2E tests
    if ! run_task "test_e2e_critical"; then
        log_error "Critical E2E tests failed - stopping execution"
        return 1
    fi

    log_success "Production validation completed successfully"
}

# CI-friendly validation (skips comprehensive environment checks)
run_ci_validation() {
    log "Running CI-friendly validation (optimized for CI environment)..."

    # Use development validation but skip environment verification
    local dev_tasks=($(get_build_tasks) $(get_core_tasks) $(get_test_tasks) $(get_infrastructure_tasks))

    # Add E2E tasks only if not skipped
    if [ "$SKIP_E2E_TESTS" != true ]; then
        dev_tasks+=($(get_e2e_tasks))
    fi

    if ! run_tasks "${dev_tasks[@]}"; then
        log_error "CI validation tasks failed - stopping execution"
        return 1
    fi

    # Basic environment validation only
    if ! validate_basic_env; then
        log_error "CI environment validation failed - stopping execution"
        return 1
    fi

    log_success "CI-friendly validation completed successfully"
}

# Pre-deployment validation workflow
run_pre_deployment() {
    log "🚀 Starting pre-deployment validation..."

    # Use production validation
    if ! run_production_validation; then
        log_error "Production validation failed - stopping execution"
        return 1
    fi

    log_success "Pre-deployment validation completed successfully"
}

# Post-deployment validation workflow
run_post_deployment() {
    log "🔍 Starting post-deployment validation..."

    # Use production validation
    if ! run_production_validation; then
        log_error "Production validation failed - stopping execution"
        return 1
    fi

    log_success "Post-deployment validation completed successfully"
}

# Production dry run workflow
run_dry_run() {
    log "🧪 Starting production dry run..."

    # Use production validation
    if ! run_production_validation; then
        log_error "Production validation failed - stopping execution"
        return 1
    fi

    log_success "Production dry run completed successfully"
}

# =============================================================================
# E2E CONFIGURATION
# =============================================================================

# E2E server management
E2E_SERVER_PID=""
E2E_SERVER_STARTED=false

# =============================================================================
# E2E FUNCTIONS
# =============================================================================

# E2E management function
run_e2e_management() {
    local e2e_subcommand="$E2E_MODE"

    case "$e2e_subcommand" in
        "run")
            if [ -z "$E2E_TEST_SUITE" ]; then
                log_error "E2E test suite not specified"
                show_e2e_usage
                return 1
            fi
            setup_e2e_environment
            start_e2e_server
            trap stop_e2e_server EXIT
            log_info "🧪 Running $E2E_TEST_SUITE tests..."
            run_e2e_test_suite "$E2E_TEST_SUITE"
            ;;
        "setup")
            setup_e2e_environment
            ;;
        "cleanup")
            stop_e2e_server
            cleanup_e2e_artifacts
            ;;
        "server")
            local action="$E2E_TEST_SUITE"
            case $action in
                "start")
                    start_e2e_server
                    ;;
                "stop")
                    stop_e2e_server
                    ;;
                "restart")
                    stop_e2e_server
                    sleep 2
                    start_e2e_server
                    ;;
                *)
                    log_error "Unknown server action: $action"
                    log_info "Valid actions: start, stop, restart"
                    return 1
                    ;;
            esac
            ;;
        *)
            log_error "Unknown E2E subcommand: $e2e_subcommand"
            show_e2e_usage
            return 1
            ;;
    esac
}

# Show E2E usage
show_e2e_usage() {
    echo "E2E Usage: $0 e2e [subcommand] [options]"
    echo ""
    echo "E2E Subcommands:"
    echo "  run [suite]       - Run E2E tests (default)"
    echo "  setup             - Setup E2E environment"
    echo "  cleanup           - Cleanup E2E artifacts"
    echo "  server [action]   - Manage test server"
    echo ""
    echo "E2E Test Suites:"
    echo "  sanity, smoke, critical, navigation, performance, security, vercel-auth, clerk-auth, auth-protection, search, browser, mock-verification, fast, standard, full, all"
    echo ""
    echo "E2E Options:"
    echo "  --browser=BROWSER  - Browser (chromium, webkit, firefox, mobile)"
    echo "  --workers=N        - Number of workers (default: 2)"
    echo "  --headed           - Run in headed mode"
    echo "  --debug            - Enable debug mode"
    echo "  --port=N           - Server port (default: 3000)"
    echo "  --retries=N        - Number of retries (default: 2)"
    echo "  --timeout=N        - Timeout in ms (default: 120000)"
}

# Setup E2E test environment
setup_e2e_environment() {
    log_info "🔧 Setting up E2E test environment..."

    # Install dependencies if needed
    if [[ ! -d "node_modules" ]]; then
        log_info "Installing dependencies..."
        pnpm install
    fi

    # Install Playwright browsers if needed
    if ! pnpm playwright --version >/dev/null 2>&1; then
        log_info "Installing Playwright browsers..."
        pnpm exec playwright install
    fi

    # Clean up artifacts
    cleanup_e2e_artifacts

    log_success "E2E test environment ready"
}

# Cleanup E2E artifacts
cleanup_e2e_artifacts() {
    rm -rf playwright-report test-results test-results-e2e coverage/e2e
}

# Start E2E test server
start_e2e_server() {
    log_info "🚀 Starting E2E test server on port $E2E_PORT..."

    # Kill any existing processes on port
    if is_port_in_use "$E2E_PORT"; then
        log_info "Port $E2E_PORT is in use, stopping existing processes..."
        stop_e2e_server
        sleep 2

        # Double-check that port is free
        if is_port_in_use "$E2E_PORT"; then
            log_warning "Port $E2E_PORT still in use, forcing cleanup..."
            local pids=$(find_server_pids "$E2E_PORT")
            if [ -n "$pids" ]; then
                echo "$pids" | xargs kill -9 2>/dev/null || true
                sleep 1
            fi
        fi
    fi

    # Start the development server
    if [ "$E2E_DEBUG" = "true" ]; then
        log_info "Starting server in debug mode..."
        npx next dev --port "$E2E_PORT" &
    else
        log_info "Starting server in background..."
        npx next dev --port "$E2E_PORT" > /dev/null 2>&1 &
    fi

    E2E_SERVER_PID=$!
    E2E_SERVER_STARTED=true

    # Wait for server to be ready
    local max_attempts=30
    local attempt=0

    log_info "Waiting for server to be ready..."
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$LOCALHOST_URL/api/health" > /dev/null 2>&1; then
            log_success "E2E test server started successfully (PID: $E2E_SERVER_PID)"
            return 0
        fi

        sleep 2
        ((attempt++))
    done

    log_error "E2E test server failed to start within timeout"
    return 1
}

# Stop E2E test server
stop_e2e_server() {
    if [ "$E2E_SERVER_STARTED" = "true" ] && [ -n "$E2E_SERVER_PID" ]; then
        log_info "🛑 Stopping E2E test server on port $E2E_PORT..."

        # Kill the server process
        if kill -0 "$E2E_SERVER_PID" 2>/dev/null; then
            kill "$E2E_SERVER_PID" 2>/dev/null || true
            log_info "Stopping processes: $E2E_SERVER_PID"
        fi

        # Kill any remaining processes on the port
        local pids=$(find_server_pids "$E2E_PORT")
        if [ -n "$pids" ]; then
            echo "$pids" | xargs kill -9 2>/dev/null || true
        fi

        E2E_SERVER_PID=""
        E2E_SERVER_STARTED=false
        log_success "E2E test server stopped"
    fi
}

# Run E2E test suite
run_e2e_test_suite() {
    local suite="$1"
    local test_path=$(get_e2e_test_path "$suite")

    if [ -z "$test_path" ]; then
        log_error "Unknown test suite: $suite"
        log_info "Valid suites: ${!E2E_TEST_SUITES[*]}"
        return 1
    fi

    # Build Playwright command
    local cmd="pnpm exec playwright test"

    # Add browser configuration
    if [ "$E2E_BROWSER" != "chromium" ]; then
        cmd="$cmd --project=$E2E_BROWSER"
    fi

    # Add worker configuration
    if [ "$E2E_WORKERS" != "2" ]; then
        cmd="$cmd --workers=$E2E_WORKERS"
    fi

    # Add headed mode
    if [ "$E2E_HEADED" = "true" ]; then
        cmd="$cmd --headed"
    fi

    # Add debug mode
    if [ "$E2E_DEBUG" = "true" ]; then
        cmd="$cmd --debug"
    fi

    # Add retries
    if [ "$E2E_RETRIES" != "2" ]; then
        cmd="$cmd --retries=$E2E_RETRIES"
    fi

    # Add timeout
    if [ "$E2E_TIMEOUT_MS" != "120000" ]; then
        cmd="$cmd --timeout=$E2E_TIMEOUT_MS"
    fi

    # Add test path
    cmd="$cmd $test_path"

    # Run the tests
    log_info "🧪 Running $suite tests..."
    if eval "$cmd"; then
        log_success "$suite tests completed successfully"
        return 0
    else
        log_error "$suite tests failed"
        return 1
    fi
}

# =============================================================================
# MAIN SCRIPT LOGIC
# =============================================================================

case "$SUBCOMMAND" in
    "precommit")
        if ! run_precommit_validation; then
            log_error "Pre-commit validation failed"
            exit 1
        fi
        ;;
    "prepush")
        if ! run_prepush_validation; then
            log_error "Pre-push validation failed"
            exit 1
        fi
        ;;
    "dev")
        if ! run_dev_validation; then
            log_error "Development validation failed"
            exit 1
        fi
        ;;
    "ci")
        if ! run_ci_validation; then
            log_error "CI validation failed"
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
    "dry-run")
        if ! run_dry_run; then
            log_error "Production dry run failed"
            exit 1
        fi
        ;;
    "pre-deploy")
        if ! run_pre_deployment; then
            log_error "Pre-deployment validation failed"
            exit 1
        fi
        ;;
    "post-deploy")
        if ! run_post_deployment; then
            log_error "Post-deployment validation failed"
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
        if ! run_task "typecheck"; then
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
    "e2e")
        if ! run_e2e_management "$@"; then
            log_error "E2E management failed"
            exit 1
        fi
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
