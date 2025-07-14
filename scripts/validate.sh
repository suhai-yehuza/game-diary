#!/bin/bash

# Validation Script - Consolidated
# Usage: ./scripts/validate.sh [subcommand] [options]
#
# Subcommands:
#   basic - Basic validation (circular deps, type validation/fix, env verification)
#   dev - Development workflow (codegen + quick fix + basic validation)
#   full - Prebuild, build, soft validation, unused exports, test:strict, test:e2e:sanity
#   staging - Full validation + size check (for staging deployment)
#   production - Full validation (prod context)
#   circular - Check circular dependencies
#   types - Validate and fix types
#   env - Verify environment variables
#   size - Check bundle size
#   unused - Check unused exports
#   help - Show this help message

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

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

# Generic validation function with timeout and retry logic
run_validation_with_retry() {
    local task_name="$1"
    local task_command="$2"
    local max_retries="${3:-1}"
    local timeout_seconds="${4:-60}"
    local silent="${5:-false}"

    # Check if timeout command is available
    if ! command -v timeout >/dev/null 2>&1; then
        log_warning "timeout command not available, running without timeout"
        local use_timeout=false
    else
        local use_timeout=true
    fi

    for ((attempt=1; attempt<=max_retries; attempt++)); do
        if [ "$silent" = "false" ]; then
            log_info "Testing $task_name (attempt $attempt/$max_retries)..."
        fi

        # Run command with or without timeout
        local exit_code=0
        if [ "$use_timeout" = "true" ]; then
            timeout $timeout_seconds pnpm run "$task_command" > /dev/null 2>&1
            exit_code=$?
        else
            pnpm run "$task_command" > /dev/null 2>&1
            exit_code=$?
        fi

        if [ $exit_code -eq 0 ]; then
            if [ "$silent" = "false" ]; then
                log_success "$task_name validation passed"
            fi
            return 0
        else
            if [ $attempt -lt $max_retries ]; then
                if [ "$silent" = "false" ]; then
                    log_warning "$task_name validation failed (attempt $attempt) - retrying..."
                fi
                sleep 2
            else
                if [ "$silent" = "false" ]; then
                    log_warning "$task_name validation failed after $max_retries attempts"
                fi
                return 1
            fi
        fi
    done
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [subcommand] [options]"
    echo ""
    echo "Subcommands:"
    echo "  basic - Basic validation (circular deps, type validation/fix, env verification)"
    echo "  ci - CI-friendly validation (skips environment validation)"
    echo "  dev - Development workflow (codegen + quick fix + basic validation)"
    echo "  full - Prebuild, build, soft validation, unused exports, test:strict, test:e2e:sanity"
    echo "  staging - Full validation + size check (for staging deployment)"
    echo "  production - Full validation (prod context)"
    echo "  circular - Check circular dependencies"
    echo "  types - Validate and fix types"
    echo "  env - Verify environment variables"
    echo "  size - Check bundle size"
    echo "  unused - Check unused exports"
    echo ""
    echo "Examples:"
    echo "  $0 basic"
    echo "  $0 ci"
    echo "  $0 dev"
    echo "  $0 staging"
    echo "  $0 circular"
}

# =============================================================================
# ATOMIC VALIDATION STEPS (Single responsibility functions)
# =============================================================================

# Cleanup
run_clean() {
    log_info "Cleaning up..."
    pnpm run clean:all
}

# Code Quality Checks
run_format_check() {
    log_info "Checking code format..."
    pnpm run format:check
}

run_format() {
    log_info "Formatting code..."
    pnpm run format
}

run_lint() {
    log_info "Running ESLint..."
    pnpm run lint
}

run_lint_fix() {
    log_info "Fixing lint issues..."
    pnpm run lint:fix
}

# Code Generation
run_codegen() {
    log_info "Generating GraphQL code..."
    pnpm run codegen
}

# Type Safety Checks
run_typecheck() {
    log_info "Running TypeScript type check..."
    pnpm run typecheck
}

run_type_validation() {
    log_info "Validating TypeScript types..."
    pnpm run typecheck
}

run_type_fix() {
    log_info "Fixing TypeScript type violations..."
    pnpm run fix:types
}

run_db_triggers_validation() {
    log_info "Validating database triggers..."
    pnpm run db:test:all-triggers
}

# Build
run_build() {
    log_info "Building project..."
    pnpm run build
}

# Environment & Configuration
run_env_verification() {
    log_info "Verifying environment variables..."

    # Load environment file based on NODE_ENV
    local node_env="${NODE_ENV:-development}"
    local env_file=""

    case "$node_env" in
        "production")
            env_file=".env.production"
            ;;
        "staging")
            env_file=".env.staging"
            ;;
        "development")
            env_file=".env.development"
            ;;
    esac

    # Load environment file if it exists
    if [ -f "$env_file" ]; then
        log_info "Loading environment from $env_file"
        export $(grep -v '^#' "$env_file" | xargs)
    else
        log_warning "Environment file $env_file not found - using system environment variables"
    fi

    # Basic environment validation
    if pnpm run verify-env; then
        log_success "Basic environment validation passed"
    else
        log_warning "Basic environment validation failed - continuing with additional checks"
    fi

    # Security-specific validations
    log_info "Running security environment checks..."

    # Check for encryption key in non-CI environments
    if [ "$CI" != "true" ] && [ "$GITHUB_ACTIONS" != "true" ]; then
        if [ -z "$DATA_ENCRYPTION_KEY" ]; then
            log_warning "DATA_ENCRYPTION_KEY not set - encryption features may be limited"
        else
            # Validate encryption key format (should be 64 hex characters)
            if [[ ! "$DATA_ENCRYPTION_KEY" =~ ^[0-9a-fA-F]{64}$ ]]; then
                log_error "DATA_ENCRYPTION_KEY must be a 64-character hex string"
                return 1
            fi
            log_success "DATA_ENCRYPTION_KEY format validated"
        fi
    fi

    # Environment-specific validations
    log_info "Validating environment-specific configuration for: $node_env"

    # Check if we're in a Vercel build environment
    local is_vercel_build=false
    if [ "$VERCEL" = "1" ] || [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
        is_vercel_build=true
        log_info "Detected CI/Vercel build environment"
    fi

    case "$node_env" in
        "production"|"staging")
            # Production/staging specific checks
            if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ] || [ -z "$CLERK_SECRET_KEY" ]; then
                if [ "$is_vercel_build" = true ]; then
                    log_warning "Clerk authentication keys not found in CI/Vercel environment - ensure they are set in deployment settings"
                else
                    log_error "Clerk authentication keys are required for $node_env environment"
                    return 1
                fi
            fi

            if [ -z "$DATABASE_URL" ]; then
                log_error "DATABASE_URL is required for $node_env environment"
                return 1
            fi

            # Check for Redis configuration (recommended for production)
            if [ -z "$UPSTASH_REDIS_REST_URL" ] && [ -z "$REDIS_URL" ]; then
                log_warning "Redis configuration not found - caching may be limited in $node_env"
            fi

            log_success "Production/staging environment validation passed"
            ;;
        "development"|"test")
            # Development/test specific checks
            if [ -z "$DATABASE_URL" ]; then
                log_warning "DATABASE_URL not set - database features will be limited"
            fi

            # Check for API keys (optional but recommended)
            if [ -z "$NEXT_PUBLIC_RAPID_API_KEY" ]; then
                log_warning "NEXT_PUBLIC_RAPID_API_KEY not set - external API features may be limited"
            fi

            log_success "Development/test environment validation passed"
            ;;
        *)
            log_warning "Unknown NODE_ENV: $node_env - using development defaults"
            ;;
    esac

    # Database connection test (if DATABASE_URL is available)
    if [ -n "$DATABASE_URL" ]; then
        # Run database test but don't fail the validation if it doesn't work
        if run_validation_with_retry "database connection" "db:test-connection" 1 30; then
            log_success "Database connection test passed"
        else
            log_warning "Database connection test failed - check DATABASE_URL configuration"
        fi
    else
        log_info "Skipping database connection test - DATABASE_URL not set"
    fi

        # Security validations (if encryption key is available)
    if [ -n "$DATA_ENCRYPTION_KEY" ]; then
        log_info "Running security validations..."

        # Define security validation tasks
        local security_tasks=(
            "encryption:security:test-encryption"
            "key-management:security:key-management"
            "rls:security:test-rls"
        )

        # Run security validations with retry logic
        local failed_validations=0
        for task in "${security_tasks[@]}"; do
            IFS=':' read -r task_name task_command <<< "$task"
            if ! run_validation_with_retry "$task_name" "$task_command" 2 30; then
                ((failed_validations++))
            fi
        done

        # Summary
        if [ $failed_validations -eq 0 ]; then
            log_success "All security validations passed"
        else
            log_warning "$failed_validations security validation(s) failed"
        fi
    else
        log_info "Skipping security validations - DATA_ENCRYPTION_KEY not set"
    fi

    # External service validations
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        run_validation_with_retry "Slack alerting" "security:test-alerting" 1 30
    else
        log_info "Skipping Slack alerting validation - SLACK_WEBHOOK_URL not set"
    fi

    log_success "Environment verification completed"
}

# Code Analysis
run_circular_check() {
    log_info "Checking circular dependencies..."
    pnpm run check:circular
}

run_unused_exports_check() {
    log_info "Checking for unused exports..."
    pnpm run check:unused:exports
}

run_size_check() {
    log_info "Checking bundle size..."
    pnpm run check:size
}

# Unit Test Validation
run_unit_test_validation() {
    log_info "Running unit test validation..."
    pnpm run test:unit
}

run_unit_test_strict_validation() {
    log_info "Running strict unit test validation..."
    pnpm run test:strict
}

run_unit_test_coverage_validation() {
    log_info "Running unit test coverage validation..."
    pnpm run test:coverage
}

# E2E Test Validation
run_security_e2e_test_validation() {
    log_info "Running security E2E test validation..."
    pnpm run test:e2e:security
}

run_vercel_auth_e2e_test_validation() {
    log_info "Running vercel auth E2E test validation..."
    pnpm run test:e2e:vercel-auth
}

run_sanity_e2e_test_validation() {
    log_info "Running sanity E2E test validation..."
    pnpm run test:e2e:sanity
}

run_critical_e2e_test_validation() {
    log_info "Running critical E2E test validation..."
    pnpm run test:e2e:critical
}

# =============================================================================
# COMPOSITE VALIDATION FUNCTIONS (Logical groupings)
# =============================================================================

# Quick Fixes (format + lint + types)
run_quick_fix() {
    log_info "Running quick fixes..."
    run_lint_fix
    run_format
    run_type_fix
    run_typecheck
}

# Code Quality Validation (format + lint + types)
run_code_quality_validation() {
    log_info "Running code quality validation..."
    run_format_check
    run_lint
    run_typecheck
}

# Function to run CI-friendly validation (skips environment validation)
run_ci_validation() {
    log "Running CI-friendly validation..."

    run_circular_check
    run_type_validation
    run_type_fix

    log_info "Skipping comprehensive environment validation in CI mode..."
    log_warning "Environment variables will be validated in individual CI jobs"
    log_info "Running basic environment checks for CI..."

    # Run basic environment validation for CI (without connection tests)
    if pnpm run verify-env > /dev/null 2>&1; then
        log_success "Basic environment validation passed for CI"
    else
        log_warning "Basic environment validation failed - check CI environment variables"
    fi

    log_success "CI-friendly validation completed"
}

# Function to run basic validation
run_basic_validation() {
    log "Running basic validation..."

    run_circular_check
    run_type_validation
    run_type_fix
    run_db_triggers_validation

    # Environment validation (with CI handling)
    if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
        log_info "Running CI-optimized environment validation..."
        # Run basic environment check for CI
        if pnpm run verify-env > /dev/null 2>&1; then
            log_success "CI environment validation passed"
        else
            log_warning "CI environment validation failed - check CI environment variables"
        fi
    else
        run_env_verification
    fi

    log_success "Basic validation completed"
}

# Function to run development workflow
run_dev_workflow() {
    log "Running development workflow..."

    run_codegen
    run_quick_fix
    run_basic_validation

    log_success "Development workflow completed"
}

# Function to run full validation
run_full_validation() {
    log "Running full validation..."

    log_info "Running prebuild..."
    pnpm run prebuild

    run_build
    run_code_quality_validation
    run_unused_exports_check
    run_unit_test_strict_validation
    run_sanity_e2e_test_validation

    log_success "Full validation completed"
}

# Function to run staging validation
run_staging_validation() {
    log "Running staging validation..."

    # For local development, use development environment validation
    if [ "$CI" != "true" ] && [ "$GITHUB_ACTIONS" != "true" ]; then
        log_info "Running staging validation in development mode (local build)"
        export NODE_ENV=development
    fi

    run_full_validation
    run_size_check

    log_success "Staging validation completed"
}

# Function to run production validation
run_production_validation() {
    log "Running production validation..."

    log_info "Setting production environment..."
    export NODE_ENV=production

    run_full_validation
    run_critical_e2e_test_validation
    run_size_check

    log_success "Production validation completed"
}

# Function to check circular dependencies (standalone)
run_circular_check_standalone() {
    log "Checking circular dependencies..."
    run_circular_check
    log_success "Circular dependency check completed"
}

# Function to validate and fix types (standalone)
run_types_validation_standalone() {
    log "Validating and fixing types..."
    run_type_validation
    run_type_fix
    log_success "Type validation and fixes completed"
}

# Function to verify environment variables (standalone)
run_env_verification_standalone() {
    log "Verifying environment variables..."

    # Run the comprehensive environment verification
    run_env_verification

    # Additional standalone checks
    log_info "Running additional environment checks..."

    # Check for common environment issues
    if [ -z "$NODE_ENV" ]; then
        log_warning "NODE_ENV not set - defaulting to development"
    fi

    # Check for potential security issues
    if [ -n "$DEBUG" ] && [ "$NODE_ENV" = "production" ]; then
        log_warning "DEBUG mode enabled in production environment"
    fi

    # Check for required files
    if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
        log_warning "No .env file found - using system environment variables"
    fi

    log_success "Environment verification completed"
}

# Function to check bundle size (standalone)
run_size_check_standalone() {
    log "Checking bundle size..."
    run_size_check
    log_success "Bundle size check completed"
}

# Function to check unused exports (standalone)
run_unused_check_standalone() {
    log "Checking unused exports..."
    run_unused_exports_check
    log_success "Unused exports check completed"
}

# Main script logic
SUBCOMMAND="${1:-help}"

case "$SUBCOMMAND" in
    "basic")
        run_basic_validation
        ;;
    "ci")
        run_ci_validation
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
    "circular")
        run_circular_check_standalone
        ;;
    "types")
        run_types_validation_standalone
        ;;
    "env")
        run_env_verification_standalone
        ;;
    "size")
        run_size_check_standalone
        ;;
    "unused")
        run_unused_check_standalone
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
