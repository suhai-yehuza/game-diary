#!/bin/bash

# GitHub Actions Deployment Troubleshooting Script
# Usage: ./scripts/troubleshoot-deployment.sh [options]

set -e

# Source shared utilities
source "$(dirname "$0")/script-utils.sh"

# Parse arguments
VERBOSE=false
CHECK_SECRETS=false
CHECK_STAGING=false
CHECK_VERCEL=false
CHECK_E2E=false
FULL_CHECK=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose)
            VERBOSE=true
            shift
            ;;
        --check-secrets)
            CHECK_SECRETS=true
            shift
            ;;
        --check-staging)
            CHECK_STAGING=true
            shift
            ;;
        --check-vercel)
            CHECK_VERCEL=true
            shift
            ;;
        --check-e2e)
            CHECK_E2E=true
            shift
            ;;
        --full)
            FULL_CHECK=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --verbose         Enable verbose output"
            echo "  --check-secrets   Check GitHub secrets configuration"
            echo "  --check-staging   Check staging deployment status"
            echo "  --check-vercel    Check Vercel configuration"
            echo "  --check-e2e       Check E2E test setup"
            echo "  --full            Run all checks"
            echo "  --help            Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# If no specific checks are requested, run full check
if [ "$FULL_CHECK" = true ] || ([ "$CHECK_SECRETS" = false ] && [ "$CHECK_STAGING" = false ] && [ "$CHECK_VERCEL" = false ] && [ "$CHECK_E2E" = false ]); then
    CHECK_SECRETS=true
    CHECK_STAGING=true
    CHECK_VERCEL=true
    CHECK_E2E=true
fi

show_header "GitHub Actions Deployment Troubleshooting"

# Check GitHub secrets configuration
if [ "$CHECK_SECRETS" = true ]; then
    log_info "🔐 Checking GitHub secrets configuration..."

    # List of required secrets
    required_secrets=(
        "VERCEL_TOKEN"
        "VERCEL_ORG_ID"
        "VERCEL_PROJECT_ID"
        "DATABASE_URL"
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
        "CLERK_SECRET_KEY"
        "CLERK_WEBHOOK_SIGNING_SECRET"
        "NEXT_PUBLIC_RAPID_API_KEY"
        "NEXT_PUBLIC_RAPID_API_HOST"
        "NEXT_PUBLIC_RAPID_API_BASE_URL"
    )

    missing_secrets=()
    present_secrets=()

    for secret in "${required_secrets[@]}"; do
        if [ -n "${!secret}" ]; then
            present_secrets+=("$secret")
            log_success "✅ $secret is set"
        else
            missing_secrets+=("$secret")
            log_error "❌ $secret is not set"
        fi
    done

    echo ""
    log_info "📊 Secrets Summary:"
    echo "  Present: ${#present_secrets[@]}"
    echo "  Missing: ${#missing_secrets[@]}"

    if [ ${#missing_secrets[@]} -gt 0 ]; then
        log_error "❌ Missing secrets: ${missing_secrets[*]}"
        echo ""
        log_info "💡 To fix missing secrets:"
        echo "  1. Go to your GitHub repository"
        echo "  2. Navigate to Settings > Secrets and variables > Actions"
        echo "  3. Add the missing secrets"
        echo "  4. Ensure they have the correct values"
    else
        log_success "✅ All required secrets are present"
    fi
fi

# Check staging deployment status
if [ "$CHECK_STAGING" = true ]; then
    log_info "🔍 Checking staging deployment status..."

    # Check if we can access GitHub API
    if [ -z "$GITHUB_TOKEN" ]; then
        log_warning "⚠️ GITHUB_TOKEN not set, cannot check staging status"
        log_info "💡 Set GITHUB_TOKEN environment variable to check staging status"
    else
        # Get latest staging deployment
        log_info "Fetching latest staging deployment..."
        local staging_deployment=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
            "https://api.github.com/repos/$GITHUB_REPOSITORY/actions/runs?workflow_id=Staging%20Deployment%20(Automatic%20from%20Master)&branch=staging&status=completed&conclusion=success&per_page=1" | \
            jq -r '.workflow_runs[0] // empty')

        if [ -n "$staging_deployment" ] && [ "$staging_deployment" != "null" ]; then
            local deployment_time=$(echo "$staging_deployment" | jq -r '.created_at')
            local deployment_id=$(echo "$staging_deployment" | jq -r '.id')
            local staging_commit=$(echo "$staging_deployment" | jq -r '.head_sha')

            log_success "✅ Latest staging deployment found:"
            echo "  🆔 ID: $deployment_id"
            echo "  📅 Time: $deployment_time"
            echo "  🔗 Commit: $staging_commit"

            # Check if staging is recent enough for production
            local current_time=$(date +%s)
            local deployment_time_epoch=$(date -d "$deployment_time" +%s)
            local age_hours=$(( (current_time - deployment_time_epoch) / 3600 ))

            echo "  ⏰ Age: $age_hours hours"

            if [ $age_hours -ge 8 ]; then
                log_success "✅ Staging deployment is old enough for production (8+ hours)"
            else
                log_warning "⚠️ Staging deployment is too recent for production (need 8+ hours)"
                log_info "💡 Wait for staging to be deployed for at least 8 hours before production deployment"
            fi
        else
            log_error "❌ No successful staging deployment found"
            log_info "💡 Ensure staging deployment has completed successfully before production deployment"
        fi
    fi
fi

# Check Vercel configuration
if [ "$CHECK_VERCEL" = true ]; then
    log_info "🔧 Checking Vercel configuration..."

    # Check if Vercel CLI is installed
    if ! command -v vercel >/dev/null 2>&1; then
        log_error "❌ Vercel CLI is not installed"
        log_info "💡 Install Vercel CLI: npm install -g vercel@latest"
    else
        log_success "✅ Vercel CLI is installed: $(vercel --version)"

        # Check Vercel authentication
        if [ -n "$VERCEL_TOKEN" ]; then
            log_info "Testing Vercel authentication..."
            if vercel --token "$VERCEL_TOKEN" whoami >/dev/null 2>&1; then
                log_success "✅ Vercel authentication successful"

                # Check team context
                if [ -n "$VERCEL_ORG_ID" ]; then
                    log_success "✅ VERCEL_ORG_ID is set: $VERCEL_ORG_ID"
                else
                    log_warning "⚠️ VERCEL_ORG_ID is not set"
                    log_info "💡 Set VERCEL_ORG_ID to specify team context"
                fi

                # Check project context
                if [ -n "$VERCEL_PROJECT_ID" ]; then
                    log_success "✅ VERCEL_PROJECT_ID is set: $VERCEL_PROJECT_ID"
                else
                    log_warning "⚠️ VERCEL_PROJECT_ID is not set"
                    log_info "💡 Set VERCEL_PROJECT_ID to specify project context"
                fi
            else
                log_error "❌ Vercel authentication failed"
                log_info "💡 Check your VERCEL_TOKEN value"
            fi
        else
            log_error "❌ VERCEL_TOKEN is not set"
            log_info "💡 Set VERCEL_TOKEN environment variable"
        fi
    fi
fi

# Check E2E test setup
if [ "$CHECK_E2E" = true ]; then
    log_info "🧪 Checking E2E test setup..."

    # Check if Playwright is installed
    if ! pnpm exec playwright --version >/dev/null 2>&1; then
        log_error "❌ Playwright is not installed"
        log_info "💡 Install Playwright: pnpm exec playwright install"
    else
        log_success "✅ Playwright is installed: $(pnpm exec playwright --version)"

        # Check if browsers are installed
        log_info "Checking Playwright browsers..."
        if pnpm exec playwright install --list | grep -q "chromium" && \
           pnpm exec playwright install --list | grep -q "firefox" && \
           pnpm exec playwright install --list | grep -q "webkit"; then
            log_success "✅ All required browsers are installed"
        else
            log_warning "⚠️ Some browsers are missing"
            log_info "💡 Install browsers: pnpm exec playwright install --with-deps"
        fi
    fi

    # Check if E2E test files exist
    if [ -d "tests/e2e" ]; then
        log_success "✅ E2E test directory exists"

        # Count test files
        test_count=$(find tests/e2e -name "*.spec.ts" | wc -l)
        log_info "📊 Found $test_count E2E test files"
    else
        log_error "❌ E2E test directory not found"
        log_info "💡 Create tests/e2e directory and add test files"
    fi
fi

# Summary and recommendations
echo ""
show_footer "Troubleshooting Summary"

log_info "📋 Common Issues and Solutions:"
echo ""
echo "1. 🔐 Secrets Issues:"
echo "   - Ensure all required secrets are set in GitHub repository settings"
echo "   - Verify secret values are correct and not expired"
echo "   - Check secret names match exactly (case-sensitive)"
echo ""
echo "2. 🚀 Staging Issues:"
echo "   - Ensure staging deployment has completed successfully"
echo "   - Wait for staging to be deployed for at least 8 hours"
echo "   - Check staging deployment logs for errors"
echo ""
echo "3. 🔧 Vercel Issues:"
echo "   - Verify VERCEL_TOKEN has correct permissions"
echo "   - Check VERCEL_ORG_ID and VERCEL_PROJECT_ID are correct"
echo "   - Ensure Vercel project is properly configured"
echo ""
echo "4. 🧪 E2E Test Issues:"
echo "   - Install Playwright browsers: pnpm exec playwright install --with-deps"
echo "   - Check test files exist and are properly configured"
echo "   - Verify test environment variables are set"
echo ""
echo "5. 🔍 Debugging Tips:"
echo "   - Enable debug mode in workflow inputs"
echo "   - Check workflow logs for specific error messages"
echo "   - Use 'vercel logs' to check deployment logs"
echo "   - Test deployment locally before pushing to GitHub"
echo ""

log_success "🎉 Troubleshooting completed!"
log_info "💡 For more help, check the GitHub Actions logs and Vercel dashboard"
