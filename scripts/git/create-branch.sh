#!/bin/bash

# Create Branch Script
# Creates a new branch with validation to ensure it follows naming conventions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[CREATE-BRANCH]${NC} $1"
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

# Function to show usage
show_usage() {
    echo "Usage: $0 <branch-name> [base-branch]"
    echo ""
    echo "Creates a new branch with validation to ensure it follows naming conventions."
    echo ""
    echo "Arguments:"
    echo "  branch-name    The name of the branch to create (required)"
    echo "  base-branch    The base branch to create from (optional, defaults to current branch)"
    echo ""
    echo "Branch naming convention: username/PROJECT-123-description"
    echo ""
    echo "Examples:"
    echo "  $0 syehuza/DYL-1234-feature-add-user-profile"
    echo "  $0 syehuza/DYL-025-bug-fix-login-validation main"
    echo "  $0 john.doe/DYL-789-hotfix-critical-issue develop"
    echo ""
    echo "Valid branch name patterns:"
    echo "  • syehuza/DYL-1234-feature-do-xyz"
    echo "  • syehuza/DYL-025-bug-fix-xyz"
    echo "  • john.doe/DYL-789-hotfix-critical-issue"
    echo ""
}

# Function to validate branch name
validate_branch_name() {
    local branch_name="$1"

    # Use the TypeScript validation script for consistency
    if command -v tsx >/dev/null 2>&1; then
        if tsx scripts/git/validate-branch-name.ts "$branch_name" >/dev/null 2>&1; then
            return 0
        else
            print_error "Invalid branch name: $branch_name"
            print_error "Branch name must follow the pattern: username/PROJECT-123-description"
            print_error ""
            print_error "Examples of valid branch names:"
            print_error "  • syehuza/DYL-1234-feature-add-user-profile"
            print_error "  • syehuza/DYL-025-bug-fix-login-validation"
            print_error "  • john.doe/DYL-789-hotfix-critical-issue"
            return 1
        fi
    else
        print_warning "tsx not found, using basic validation"

        # Basic validation as fallback
        if [[ ! $branch_name =~ ^([a-zA-Z0-9_-]+)/([A-Z]+-\d+)-([a-z0-9-]+)$ ]]; then
            print_error "Invalid branch name: $branch_name"
            print_error "Branch name must follow the pattern: username/PROJECT-123-description"
            return 1
        fi
    fi

    return 0
}

# Function to check if branch already exists
check_branch_exists() {
    local branch_name="$1"

    if git show-ref --verify --quiet refs/heads/"$branch_name"; then
        print_error "Branch '$branch_name' already exists locally"
        return 1
    fi

    if git ls-remote --heads origin "$branch_name" | grep -q "$branch_name"; then
        print_error "Branch '$branch_name' already exists on remote"
        return 1
    fi

    return 0
}

# Function to create the branch
create_branch() {
    local branch_name="$1"
    local base_branch="$2"

    print_status "Creating branch: $branch_name"

    if [ -n "$base_branch" ]; then
        print_status "From base branch: $base_branch"

        # Check if base branch exists
        if ! git show-ref --verify --quiet refs/heads/"$base_branch"; then
            print_error "Base branch '$base_branch' does not exist"
            return 1
        fi

        # Create branch from specified base
        if git checkout -b "$branch_name" "$base_branch"; then
            print_success "Created branch '$branch_name' from '$base_branch'"
        else
            print_error "Failed to create branch '$branch_name' from '$base_branch'"
            return 1
        fi
    else
        # Create branch from current branch
        local current_branch=$(git branch --show-current)
        print_status "From current branch: $current_branch"

        if git checkout -b "$branch_name"; then
            print_success "Created branch '$branch_name' from '$current_branch'"
        else
            print_error "Failed to create branch '$branch_name'"
            return 1
        fi
    fi

    return 0
}

# Main function
main() {
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository. Please run this script from the root of your git repository."
        exit 1
    fi

    # Parse arguments
    if [ $# -eq 0 ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        show_usage
        exit 0
    fi

    local branch_name="$1"
    local base_branch="$2"

    print_status "Validating branch name: $branch_name"

    # Validate branch name
    if ! validate_branch_name "$branch_name"; then
        exit 1
    fi

    print_success "Branch name validation passed"

    # Check if branch already exists
    if ! check_branch_exists "$branch_name"; then
        exit 1
    fi

    # Create the branch
    if ! create_branch "$branch_name" "$base_branch"; then
        exit 1
    fi

    echo ""
    print_success "Branch '$branch_name' created successfully!"
    echo ""
    print_status "Next steps:"
    echo "  1. Make your changes"
    echo "  2. Commit with: git commit -m 'feat: your message' (auto-injection will add ticket/username)"
    echo "  3. Push with: git push -u origin $branch_name"
    echo ""
    print_success "Happy coding! 🚀"
}

# Run main function
main "$@"
