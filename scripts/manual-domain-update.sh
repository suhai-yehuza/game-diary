#!/bin/bash

# Manual Domain Update Script
# This script can be used to manually update domain aliases when automated workflows fail

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to update staging domain
update_staging_domain() {
    local deployment_url=$1
    local team_id=$2
    local token=$3

    print_status "Updating staging domain alias..."
    print_status "Deployment URL: $deployment_url"
    print_status "Domain: staging.game-diary.io"
    print_status "Team ID: $team_id"

    # Try with team context first
    if [ -n "$team_id" ]; then
        print_status "Attempting with team context..."
        if vercel alias set "$deployment_url" "staging.game-diary.io" --token "$token" --scope "$team_id"; then
            print_success "Successfully updated staging domain with team context"
            return 0
        else
            print_warning "Team context failed, trying without team context..."
        fi
    fi

    # Fallback without team context
    print_status "Attempting without team context..."
    if vercel alias set "$deployment_url" "staging.game-diary.io" --token "$token"; then
        print_success "Successfully updated staging domain without team context"
        return 0
    else
        print_error "Failed to update staging domain"
        return 1
    fi
}

# Function to verify domain is working
verify_staging_domain() {
    print_status "Verifying staging domain accessibility..."

    for i in {1..5}; do
        if curl -f -s --max-time 30 "https://staging.game-diary.io/api/health" > /dev/null 2>&1; then
            print_success "Staging domain is accessible and working"
            return 0
        fi

        if [ $i -eq 5 ]; then
            print_warning "Staging domain verification failed after 5 attempts, but deployment may still be working"
            return 1
        fi

        print_status "Retrying domain verification... (attempt $i/5)"
        sleep 10
    done
}

# Main function
main() {
    local deployment_url=$1
    local team_id=$2
    local token=$3

    # Validate required parameters
    if [ -z "$deployment_url" ]; then
        print_error "Deployment URL is required"
        echo "Usage: $0 <deployment_url> [team_id] [token]"
        echo "Example: $0 https://example.vercel.app team_123 token_456"
        exit 1
    fi

    if [ -z "$token" ]; then
        print_error "Vercel token is required"
        echo "Usage: $0 <deployment_url> [team_id] [token]"
        exit 1
    fi

    print_status "Starting manual staging domain update..."
    print_status "Deployment URL: $deployment_url"
    print_status "Team ID: $team_id"

    # Update staging domain
    if update_staging_domain "$deployment_url" "$team_id" "$token"; then
        # Verify the domain is working
        verify_staging_domain
        print_success "Manual staging domain update completed successfully!"
    else
        print_error "Manual staging domain update failed"
        print_warning "You may need to check your Vercel token permissions"
        print_warning "Or manually update the domain alias in the Vercel dashboard"
        exit 1
    fi
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Script is being executed directly
    main "$1" "$2" "$3"
fi
