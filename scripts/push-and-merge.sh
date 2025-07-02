#!/bin/bash

# Push and Merge Script - Optimized version
# This script pushes the current branch and merges it into staging

set -e  # Exit on any error

# Configuration - Default values
DEFAULT_SOURCE_BRANCH="syehuza/demo"
DEFAULT_TARGET_BRANCH="staging"

# Show usage information
show_usage() {
    echo "Usage: $0 [source_branch] [target_branch]"
    echo ""
    echo "Arguments:"
    echo "  source_branch    Source branch to push and merge (default: $DEFAULT_SOURCE_BRANCH)"
    echo "  target_branch    Target branch to merge into (default: $DEFAULT_TARGET_BRANCH)"
    echo ""
    echo "Examples:"
    echo "  $0                                   # Use defaults: $DEFAULT_SOURCE_BRANCH -> $DEFAULT_TARGET_BRANCH"
    echo "  $0 feature-branch                    # feature-branch -> $DEFAULT_TARGET_BRANCH"
    echo "  $0 feature-branch main               # feature-branch -> main"
    echo "  $0 '' main                           # $DEFAULT_SOURCE_BRANCH -> main"
    echo ""
}

# Parse command line arguments
parse_arguments() {
    # Show help if requested
    if [[ "$1" == "-h" || "$1" == "--help" ]]; then
        show_usage
        exit 0
    fi

    SOURCE_BRANCH="${1:-$DEFAULT_SOURCE_BRANCH}"
    TARGET_BRANCH="${2:-$DEFAULT_TARGET_BRANCH}"

    log_info "Source branch: $SOURCE_BRANCH"
    log_info "Target branch: $TARGET_BRANCH"
}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're on the correct source branch
check_current_branch() {
    local current_branch=$(git branch --show-current)
    if [[ "$current_branch" != "$SOURCE_BRANCH" ]]; then
        log_error "Not on $SOURCE_BRANCH branch. Current branch: $current_branch"
        log_info "Switching to $SOURCE_BRANCH..."
        git checkout "$SOURCE_BRANCH" || {
            log_error "Failed to checkout $SOURCE_BRANCH"
            exit 1
        }
    fi
}

# Check if there are uncommitted changes
check_working_directory() {
    if ! git diff-index --quiet HEAD --; then
        log_warn "You have uncommitted changes. Please commit or stash them first."
        exit 1
    fi
}

# Check if branches exist
check_branches() {
    if ! git show-ref --verify --quiet refs/heads/"$SOURCE_BRANCH"; then
        log_error "Source branch '$SOURCE_BRANCH' does not exist"
        exit 1
    fi

    if ! git show-ref --verify --quiet refs/heads/"$TARGET_BRANCH"; then
        log_error "Target branch '$TARGET_BRANCH' does not exist"
        exit 1
    fi
}

# Main execution
main() {
    log_info "Starting push and merge process..."

    # Parse arguments
    parse_arguments "$@"

    # Pre-flight checks
    check_working_directory
    check_branches
    check_current_branch

    # Store original branch for cleanup
    local original_branch=$(git branch --show-current)

    # Push current branch
    log_info "Pushing $SOURCE_BRANCH..."
    git push origin "$SOURCE_BRANCH" || {
        log_error "Failed to push $SOURCE_BRANCH"
        exit 1
    }

    # Switch to target branch and merge
    log_info "Switching to $TARGET_BRANCH..."
    git checkout "$TARGET_BRANCH" || {
        log_error "Failed to checkout $TARGET_BRANCH"
        exit 1
    }

    # Pull latest changes to avoid conflicts
    log_info "Pulling latest changes from $TARGET_BRANCH..."
    git pull origin "$TARGET_BRANCH" || {
        log_error "Failed to pull latest changes from $TARGET_BRANCH"
        exit 1
    }

    # Merge source branch
    log_info "Merging $SOURCE_BRANCH into $TARGET_BRANCH..."
    git merge --no-edit "$SOURCE_BRANCH" || {
        log_error "Merge failed. Please resolve conflicts manually."
        log_info "You can continue with: git merge --continue"
        log_info "Or abort with: git merge --abort"
        exit 1
    }

    # Push merged changes
    log_info "Pushing merged changes to $TARGET_BRANCH..."
    git push origin "$TARGET_BRANCH" || {
        log_error "Failed to push merged changes to $TARGET_BRANCH"
        exit 1
    }

    # Return to original branch
    log_info "Switching back to $original_branch..."
    git checkout "$original_branch" || {
        log_warn "Failed to switch back to $original_branch"
        log_info "You are currently on $TARGET_BRANCH"
    }

    log_info "Push and merge completed successfully! 🎉"
}

# Run main function
main "$@"
