#!/bin/bash

# Script to validate RapidAPI key and ensure it's working
# This can be run as part of the development process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to get API key from environment files
get_api_key() {
    # Try to get API key from .env.development first, then .env.production, then .env.staging
    local api_key=""

    if [ -f ".env.development" ]; then
        api_key=$(grep "^NEXT_PUBLIC_RAPID_API_KEY=" .env.development | cut -d'=' -f2)
    elif [ -f ".env.production" ]; then
        api_key=$(grep "^NEXT_PUBLIC_RAPID_API_KEY=" .env.production | cut -d'=' -f2)
    elif [ -f ".env.staging" ]; then
        api_key=$(grep "^NEXT_PUBLIC_RAPID_API_KEY=" .env.staging | cut -d'=' -f2)
    fi

    echo "$api_key"
}

# Function to get API host from environment files
get_api_host() {
    local api_host=""

    if [ -f ".env.development" ]; then
        api_host=$(grep "^NEXT_PUBLIC_RAPID_API_HOST=" .env.development | cut -d'=' -f2)
    elif [ -f ".env.production" ]; then
        api_host=$(grep "^NEXT_PUBLIC_RAPID_API_HOST=" .env.production | cut -d'=' -f2)
    elif [ -f ".env.staging" ]; then
        api_host=$(grep "^NEXT_PUBLIC_RAPID_API_HOST=" .env.staging | cut -d'=' -f2)
    fi

    echo "$api_host"
}

# Function to validate API key format
validate_api_key_format() {
    local api_key="$1"

    if [[ ! $api_key =~ ^[a-f0-9]{32}$ ]]; then
        print_warning "API key format doesn't look like a standard RapidAPI key (32 hex characters)"
        return 1
    fi

    return 0
}

# Function to test API key with a simple request
test_api_key() {
    local api_key="$1"
    local api_host="$2"

    if [ -z "$api_key" ] || [ -z "$api_host" ]; then
        print_error "API key or host not found in environment files"
        return 1
    fi

    print_info "Testing API key with a simple request..."

    # Make a test request to the seasons endpoint (usually doesn't require authentication)
    local test_url="https://${api_host}/seasons"
    local response

    # Use curl with timeout and capture both status and response
    response=$(curl -s -w "%{http_code}" -H "X-RapidAPI-Key: ${api_key}" -H "X-RapidAPI-Host: ${api_host}" "$test_url" 2>/dev/null)

    # Extract status code (last 3 characters)
    local status_code="${response: -3}"
    local response_body="${response%???}"

    if [ "$status_code" = "200" ]; then
        print_success "API key is valid and working!"
        return 0
    elif [ "$status_code" = "403" ]; then
        print_error "API key is invalid or subscription has expired"
        print_error "Response: $response_body"
        return 1
    elif [ "$status_code" = "429" ]; then
        print_warning "API rate limit exceeded - key might be valid but too many requests"
        return 0
    elif [ "$status_code" = "401" ]; then
        print_error "API key is invalid"
        return 1
    else
        print_warning "Unexpected response (HTTP $status_code) - API might be temporarily unavailable"
        print_warning "Response: $response_body"
        return 0
    fi
}

# Function to check if development server is running
check_dev_server() {
    if curl -s http://localhost:3000/api/health >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Main validation function
main() {
    print_info "Validating RapidAPI configuration..."

    # Get API key and host
    local api_key=$(get_api_key)
    local api_host=$(get_api_host)

    if [ -z "$api_key" ]; then
        print_error "No API key found in environment files"
        print_info "Please ensure your .env.* file has a valid NEXT_PUBLIC_RAPID_API_KEY"
        exit 1
    fi

    if [ -z "$api_host" ]; then
        print_error "No API host found in environment files"
        exit 1
    fi

    print_info "Found API key: ${api_key:0:8}..."
    print_info "Found API host: $api_host"

    # Validate API key format
    if ! validate_api_key_format "$api_key"; then
        print_warning "API key format validation failed, but continuing with test..."
    fi

    # Test API key
    if test_api_key "$api_key" "$api_host"; then
        print_success "RapidAPI validation passed! ✅"

        # If dev server is running, test the proxy endpoint too
        if check_dev_server; then
            print_info "Testing proxy endpoint..."
            local proxy_response=$(curl -s "http://localhost:3000/api/proxy/seasons" 2>/dev/null)
            if echo "$proxy_response" | grep -q '"errors":\[\]'; then
                print_success "Proxy endpoint is working correctly! ✅"
            else
                print_warning "Proxy endpoint returned errors, but API key is valid"
            fi
        fi

        exit 0
    else
        print_error "RapidAPI validation failed! ❌"
        print_info "To fix this:"
        print_info "1. Check your API key and host in .env.* files"
        print_info "2. Ensure your .env.* file has a valid NEXT_PUBLIC_RAPID_API_KEY"
        exit 1
    fi
}

# Run main function
main "$@"
