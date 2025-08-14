#!/bin/bash

# Vercel Deployment Helper Script
# This script provides robust Vercel deployment promotion with proper team context handling

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to wait for deployment to be ready
wait_for_deployment() {
    local deployment_url=$1
    local max_attempts=30
    local attempt=1

    print_status "Waiting for deployment to be ready: $deployment_url"

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s --max-time 10 "$deployment_url" > /dev/null 2>&1; then
            print_success "Deployment is ready!"
            return 0
        fi

        print_status "Attempt $attempt/$max_attempts - Deployment not ready yet..."
        sleep 10
        ((attempt++))
    done

    print_warning "Deployment may not be fully ready, but proceeding anyway"
    return 0
}

# Function to promote deployment with team context
promote_deployment() {
    local deployment_url=$1
    local team_id=$2
    local token=$3

    print_status "Promoting deployment to production..."
    print_status "Deployment URL: $deployment_url"
    print_status "Team ID: $team_id"

    # Try with team context first
    if [ -n "$team_id" ]; then
        print_status "Attempting promotion with team context..."
        if vercel promote "$deployment_url" --token "$token" --scope "$team_id" --yes; then
            print_success "Successfully promoted deployment with team context"
            return 0
        else
            print_warning "Team context promotion failed, trying without team context..."
        fi
    fi

    # Fallback without team context
    print_status "Attempting promotion without team context..."
    if vercel promote "$deployment_url" --token "$token" --yes; then
        print_success "Successfully promoted deployment without team context"
        return 0
    else
        print_error "Failed to promote deployment"
        return 1
    fi
}

# Function to set domain alias with team context
set_domain_alias() {
    local deployment_url=$1
    local domain_name=$2
    local team_id=$3
    local token=$4

    print_status "Setting domain alias..."
    print_status "Deployment URL: $deployment_url"
    print_status "Domain: $domain_name"
    print_status "Team ID: $team_id"

    # Try with team context first
    if [ -n "$team_id" ]; then
        print_status "Attempting alias set with team context..."
        if vercel alias set "$deployment_url" "$domain_name" --token "$token" --scope "$team_id"; then
            print_success "Successfully set domain alias with team context"
            return 0
        else
            print_warning "Team context alias set failed, trying without team context..."
        fi
    fi

    # Fallback without team context
    print_status "Attempting alias set without team context..."
    if vercel alias set "$deployment_url" "$domain_name" --token "$token"; then
        print_success "Successfully set domain alias without team context"
        return 0
    else
        print_error "Failed to set domain alias"
        return 1
    fi
}

# Function to verify domain accessibility
verify_domain() {
    local domain_url=$1
    local endpoint=$2
    local environment_name=$3
    local max_attempts=5

    print_status "Verifying domain accessibility..."
    print_status "Domain: $domain_url"
    print_status "Endpoint: $endpoint"

    for i in $(seq 1 $max_attempts); do
        if curl -f -s --max-time 30 "$domain_url$endpoint" > /dev/null 2>&1; then
            print_success "$environment_name domain is accessible and working"
            return 0
        fi

        if [ $i -eq $max_attempts ]; then
            print_warning "$environment_name domain verification failed after $max_attempts attempts, but deployment may still be working"
            return 1
        fi

        print_status "Retrying domain verification... (attempt $i/$max_attempts)"
        sleep 10
    done
}

# Main function
main() {
    local deployment_url=$1
    local environment=$2
    local team_id=$3
    local token=$4

    # Validate required parameters
    if [ -z "$deployment_url" ]; then
        print_error "Deployment URL is required"
        exit 1
    fi

    if [ -z "$environment" ]; then
        print_error "Environment is required"
        exit 1
    fi

    if [ -z "$token" ]; then
        print_error "Vercel token is required"
        exit 1
    fi

    # Set environment-specific variables
    if [ "$environment" = "Production" ]; then
        DOMAIN_NAME="www.game-diary.io"
        DOMAIN_URL="https://www.game-diary.io"
        ENVIRONMENT_NAME="production"
        VERIFICATION_ENDPOINT="/api/health"
    else
        DOMAIN_NAME="staging.game-diary.io"
        DOMAIN_URL="https://staging.game-diary.io"
        ENVIRONMENT_NAME="staging"
        VERIFICATION_ENDPOINT="/api/health"
    fi

    print_status "Starting deployment update for $ENVIRONMENT_NAME environment..."
    print_status "Deployment URL: $deployment_url"
    print_status "Domain: $DOMAIN_NAME"
    print_status "Team ID: $team_id"

    # Wait for deployment to be ready
    wait_for_deployment "$deployment_url"

    # Update domain based on environment
    if [ "$environment" = "Production" ]; then
        promote_deployment "$deployment_url" "$team_id" "$token"
    else
        set_domain_alias "$deployment_url" "$DOMAIN_NAME" "$team_id" "$token"
    fi

    # Verify the domain is working
    verify_domain "$DOMAIN_URL" "$VERIFICATION_ENDPOINT" "$ENVIRONMENT_NAME"

    print_success "Deployment update completed successfully!"
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Script is being executed directly
    if [ $# -lt 4 ]; then
        echo "Usage: $0 <deployment_url> <environment> <team_id> <token>"
        echo "Example: $0 https://example.vercel.app Production team_123 token_456"
        exit 1
    fi

    main "$1" "$2" "$3" "$4"
fi
