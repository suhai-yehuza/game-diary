#!/bin/bash

# Git Aliases Setup Script
# Sets up git aliases for branch creation with validation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[GIT-ALIASES]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository. Please run this script from the root of your git repository."
        exit 1
    fi
}

# Function to set up git aliases
setup_git_aliases() {
    print_status "Setting up git aliases..."

    # Get the absolute path to the create-branch script
    local script_path="$(pwd)/scripts/git/create-branch.sh"

    # Check if the script exists
    if [ ! -f "$script_path" ]; then
        print_error "Create branch script not found: $script_path"
        exit 1
    fi

    # Set up git aliases
    print_status "Creating git alias 'cb' for branch creation..."
    git config alias.cb "!$script_path"

    print_status "Creating git alias 'create-branch' for branch creation..."
    git config alias.create-branch "!$script_path"

    print_success "Git aliases created successfully!"
    echo ""
    print_status "You can now use:"
    echo "  • git cb <branch-name> [base-branch]"
    echo "  • git create-branch <branch-name> [base-branch]"
    echo ""
    print_status "Examples:"
    echo "  • git cb syehuza/DYL-1234-feature-add-user-profile"
    echo "  • git cb syehuza/DYL-025-bug-fix-login-validation main"
    echo "  • git create-branch john.doe/DYL-789-hotfix-critical-issue develop"
}

# Function to show current aliases
show_aliases() {
    print_status "Current git aliases:"
    echo ""
    git config --get-regexp alias | grep -E "alias\.(cb|create-branch)" || print_warning "No branch creation aliases found"
    echo ""
}

# Function to remove aliases
remove_aliases() {
    print_status "Removing git aliases..."

    git config --unset alias.cb 2>/dev/null || true
    git config --unset alias.create-branch 2>/dev/null || true

    print_success "Git aliases removed successfully!"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --setup        Set up git aliases (default)"
    echo "  --show         Show current aliases"
    echo "  --remove       Remove git aliases"
    echo ""
    echo "This script sets up git aliases for branch creation with validation."
    echo ""
    echo "After setup, you can use:"
    echo "  • git cb <branch-name> [base-branch]"
    echo "  • git create-branch <branch-name> [base-branch]"
    echo ""
    echo "Examples:"
    echo "  • git cb syehuza/DYL-1234-feature-add-user-profile"
    echo "  • git cb syehuza/DYL-025-bug-fix-login-validation main"
    echo ""
}

# Main function
main() {
    # Parse arguments
    local action="setup"

    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            --setup)
                action="setup"
                shift
                ;;
            --show)
                action="show"
                shift
                ;;
            --remove)
                action="remove"
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    print_status "Git Aliases Setup Script"
    echo ""

    # Check if we're in a git repository
    check_git_repo

    case $action in
        "setup")
            setup_git_aliases
            ;;
        "show")
            show_aliases
            ;;
        "remove")
            remove_aliases
            ;;
    esac

    echo ""
    print_success "Git aliases setup completed!"
}

# Run main function
main "$@"
