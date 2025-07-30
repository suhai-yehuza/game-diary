#!/bin/bash

# Script to validate RapidAPI key and ensure it's working
# This can be run as part of the development process

set -e

# Source shared utilities
source "$(dirname "$0")/../script-utils.sh"

# Configuration
LOCALHOST_URL="${LOCALHOST_URL:-http://localhost:3000}"

# Function to get API key from environment files or environment variables
get_api_key() {
    # First check environment variables (for CI environments)
    local api_key="${NEXT_PUBLIC_RAPID_API_KEY:-}"

    # Debug information for CI environments
    if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
        log_info "Running in CI environment"
        log_info "Checking for NEXT_PUBLIC_RAPID_API_KEY in environment variables..."
        if [ -n "$api_key" ]; then
            log_info "Found API key in environment variables: ${api_key:0:8}..."
        else
            log_info "No API key found in environment variables"
            log_info "Available environment variables:"
            log_info "  CI: $CI"
            log_info "  GITHUB_ACTIONS: $GITHUB_ACTIONS"
            log_info "  NODE_ENV: $NODE_ENV"
            log_info "  NEXT_PUBLIC_RAPID_API_KEY: ${NEXT_PUBLIC_RAPID_API_KEY:+SET}"
            log_info "  NEXT_PUBLIC_RAPID_API_HOST: ${NEXT_PUBLIC_RAPID_API_HOST:+SET}"
            log_info "  NEXT_PUBLIC_RAPID_API_BASE_URL: ${NEXT_PUBLIC_RAPID_API_BASE_URL:+SET}"
        fi
    fi

    # If not found in environment variables, try .env files
    if [ -z "$api_key" ]; then
        log_info "Checking .env files for API key..."
        if [ -f ".env.development" ]; then
            api_key=$(grep "^NEXT_PUBLIC_RAPID_API_KEY=" .env.development | cut -d'=' -f2)
            if [ -n "$api_key" ]; then
                log_info "Found API key in .env.development"
            fi
        elif [ -f ".env.production" ]; then
            api_key=$(grep "^NEXT_PUBLIC_RAPID_API_KEY=" .env.production | cut -d'=' -f2)
            if [ -n "$api_key" ]; then
                log_info "Found API key in .env.production"
            fi
        elif [ -f ".env.staging" ]; then
            api_key=$(grep "^NEXT_PUBLIC_RAPID_API_KEY=" .env.staging | cut -d'=' -f2)
            if [ -n "$api_key" ]; then
                log_info "Found API key in .env.staging"
            fi
        fi
    fi

    echo "$api_key"
}

# Function to get API host from environment files or environment variables
get_api_host() {
    # First check environment variables (for CI environments)
    local api_host="${NEXT_PUBLIC_RAPID_API_HOST:-}"

    # If not found in environment variables, try .env files
    if [ -z "$api_host" ]; then
        if [ -f ".env.development" ]; then
            api_host=$(grep "^NEXT_PUBLIC_RAPID_API_HOST=" .env.development | cut -d'=' -f2)
        elif [ -f ".env.production" ]; then
            api_host=$(grep "^NEXT_PUBLIC_RAPID_API_HOST=" .env.production | cut -d'=' -f2)
        elif [ -f ".env.staging" ]; then
            api_host=$(grep "^NEXT_PUBLIC_RAPID_API_HOST=" .env.staging | cut -d'=' -f2)
        fi
    fi

    echo "$api_host"
}

# Function to validate API key format
validate_api_key_format() {
    local api_key="$1"

    if [[ ! $api_key =~ ^[a-f0-9]{32}$ ]]; then
        log_warning "API key format doesn't look like a standard RapidAPI key (32 hex characters)"
        return 1
    fi

    return 0
}

# Function to test API key with a simple request
test_api_key() {
    local api_key="$1"
    local api_host="$2"

    if [ -z "$api_key" ] || [ -z "$api_host" ]; then
        log_error "API key or host not found in environment files"
        return 1
    fi

    log_info "Testing API key with a simple request..."

    # Make a test request to the seasons endpoint (usually doesn't require authentication)
    local test_url="https://${api_host}/seasons"
    local response

    # Use curl with timeout and capture both status and response
    response=$(curl -s -w "%{http_code}" -H "X-RapidAPI-Key: ${api_key}" -H "X-RapidAPI-Host: ${api_host}" "$test_url" 2>/dev/null)

    # Extract status code (last 3 characters)
    local status_code="${response: -3}"
    local response_body="${response%???}"

    if [ "$status_code" = "200" ]; then
        log_success "API key is valid and working!"
        return 0
    elif [ "$status_code" = "403" ]; then
        log_error "API key is invalid or subscription has expired"
        log_error "Response: $response_body"
        return 1
    elif [ "$status_code" = "429" ]; then
        log_warning "API rate limit exceeded - key might be valid but too many requests"
        return 0
    elif [ "$status_code" = "401" ]; then
        log_error "API key is invalid"
        return 1
    else
        log_warning "Unexpected response (HTTP $status_code) - API might be temporarily unavailable"
        log_warning "Response: $response_body"
        return 0
    fi
}

# Function to check if development server is running
check_dev_server() {
    if curl -s "$LOCALHOST_URL/api/health" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Main validation function
main() {
    log_info "Validating RapidAPI configuration..."

    # Debug environment information
    if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
        log_info "CI Environment detected"
        log_info "Available environment variables:"
        log_info "  CI: $CI"
        log_info "  GITHUB_ACTIONS: $GITHUB_ACTIONS"
        log_info "  NODE_ENV: $NODE_ENV"
        log_info "  NEXT_PUBLIC_RAPID_API_KEY: ${NEXT_PUBLIC_RAPID_API_KEY:+SET}"
        log_info "  NEXT_PUBLIC_RAPID_API_HOST: ${NEXT_PUBLIC_RAPID_API_HOST:+SET}"
        log_info "  NEXT_PUBLIC_RAPID_API_BASE_URL: ${NEXT_PUBLIC_RAPID_API_BASE_URL:+SET}"
    fi

    # Get API key and host
    local api_key=$(get_api_key)
    local api_host=$(get_api_host)

    if [ -z "$api_key" ]; then
        log_error "No API key found in environment files or environment variables"
        log_info "Please ensure your .env.* file has a valid NEXT_PUBLIC_RAPID_API_KEY"
        log_info "Or set the NEXT_PUBLIC_RAPID_API_KEY environment variable"

        # In CI environments, provide more specific guidance
        if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
            log_info "In CI environment, ensure NEXT_PUBLIC_RAPID_API_KEY is set in GitHub Secrets"
            log_info "and properly passed to the workflow environment"
        fi

        exit 1
    fi

    if [ -z "$api_host" ]; then
        log_error "No API host found in environment files"
        exit 1
    fi

    log_info "Found API key: ${api_key:0:8}..."
    log_info "Found API host: $api_host"

    # Validate API key format
    if ! validate_api_key_format "$api_key"; then
        log_warning "API key format validation failed, but continuing with test..."
    fi

    # Test API key
    if test_api_key "$api_key" "$api_host"; then
        log_success "RapidAPI validation passed! ✅"

        # If dev server is running, test the proxy endpoint too
        if check_dev_server; then
            log_info "Testing proxy endpoint..."
            local proxy_response=$(curl -s "$LOCALHOST_URL/api/proxy/seasons" 2>/dev/null)
            if echo "$proxy_response" | grep -q '"errors":\[\]'; then
                log_success "Proxy endpoint is working correctly! ✅"
            else
                log_warning "Proxy endpoint returned errors, but API key is valid"
            fi
        fi

        exit 0
    else
        log_error "RapidAPI validation failed! ❌"
        log_info "To fix this:"
        log_info "1. Check your API key and host in .env.* files"
        log_info "2. Ensure your .env.* file has a valid NEXT_PUBLIC_RAPID_API_KEY"
        exit 1
    fi
}

# Run main function
main "$@"
