#!/bin/bash

# Unified Push and Merge Script
# This script pushes the current branch and merges it into a target branch
# Supports both regular and no-verify modes

set -e  # Exit on any error

# Show usage information
show_usage() {
    echo "Usage: $0 --source=SOURCE_BRANCH --target=TARGET_BRANCH [--no-verify=true]"
    echo ""
    echo "Required Arguments:"
    echo "  --source=SOURCE_BRANCH    Source branch to push and merge"
    echo "  --target=TARGET_BRANCH    Target branch to merge into"
    echo ""
    echo "Optional Arguments:"
    echo "  --no-verify=true          Skip all validation and use force push (requires confirmation)"
    echo ""
    echo "Examples:"
    echo "  $0 --source=feature-branch --target=staging"
    echo "  $0 --source=bugfix-123 --target=main"
    echo "  $0 --source=experiment --target=staging-soak"
    echo "  $0 --source=emergency-fix --target=main --no-verify=true"
    echo ""
    echo "⚠️  When --no-verify=true is used:"
    echo "  - Skip all pre-push validation"
    echo "  - Use force push (--force-with-lease)"
    echo "  - Skip branch sync checks"
    echo "  - Proceed even with uncommitted changes"
    echo "  - Require confirmation before execution"
    echo ""
}

# Parse command line arguments
parse_arguments() {
    # Show help if requested
    if [[ "$1" == "-h" || "$1" == "--help" ]]; then
        show_usage
        exit 0
    fi

    # Initialize variables
    SOURCE_BRANCH=""
    TARGET_BRANCH=""
    NO_VERIFY=false
    DRY_RUN=false

    # Parse arguments
    for arg in "$@"; do
        case $arg in
            --source=*)
                SOURCE_BRANCH="${arg#*=}"
                shift
                ;;
            --target=*)
                TARGET_BRANCH="${arg#*=}"
                shift
                ;;
            --no-verify=true)
                NO_VERIFY=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            *)
                log_error "Unknown argument: $arg"
                show_usage
                exit 1
                ;;
        esac
    done

    # Validate required arguments
    if [[ -z "$SOURCE_BRANCH" ]]; then
        log_error "Source branch is required. Use --source=BRANCH_NAME"
        show_usage
        exit 1
    fi

    if [[ -z "$TARGET_BRANCH" ]]; then
        log_error "Target branch is required. Use --target=BRANCH_NAME"
        show_usage
        exit 1
    fi

    log_info "Source branch: $SOURCE_BRANCH"
    log_info "Target branch: $TARGET_BRANCH"
    if [[ "$NO_VERIFY" == true ]]; then
        log_warn "No-verify mode: ENABLED (will skip validation and use force push)"
    else
        log_info "Regular mode: ENABLED (will run full validation)"
    fi
}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_force() {
    echo -e "${BLUE}[FORCE]${NC} $1"
}

# Show dry-run operations
show_dry_run_operations() {
    echo ""
    log_info "🔍 DRY-RUN: Operations that would be performed:"
    echo ""

    if [[ "$NO_VERIFY" == true ]]; then
        log_info "NO-VERIFY MODE operations:"
        log_info "  1. Force push $SOURCE_BRANCH to remote (--force-with-lease)"
        log_info "  2. Switch to $TARGET_BRANCH"
        log_info "  3. Reset $TARGET_BRANCH to match $SOURCE_BRANCH exactly"
        log_info "  4. Force push $TARGET_BRANCH to remote (--force-with-lease)"
        log_info "  5. Switch back to original branch"
    else
        log_info "REGULAR MODE operations:"
        log_info "  1. Push $SOURCE_BRANCH to remote"
        log_info "  2. Switch to $TARGET_BRANCH"
        log_info "  3. Pull latest changes from $TARGET_BRANCH"
        log_info "  4. Merge $SOURCE_BRANCH changes into $TARGET_BRANCH"
        log_info "  5. Push $TARGET_BRANCH to remote"
        log_info "  6. Switch back to original branch"
    fi

    echo ""
    log_info "🔍 DRY-RUN: No actual operations were performed"
    echo ""
}

# Request confirmation for no-verify mode
request_confirmation() {
    echo ""
    log_warn "🚨 CONFIRMATION REQUIRED 🚨"
    echo ""
    log_warn "You are about to execute a FORCE push and merge operation:"
    log_warn "  Source: $SOURCE_BRANCH"
    log_warn "  Target: $TARGET_BRANCH"
    echo ""
    log_warn "⚠️  This will:"
    log_warn "  - Skip ALL validation and safety checks"
    log_warn "  - Use force push (--force-with-lease)"
    log_warn "  - Overwrite remote changes if any"
    log_warn "  - Proceed even with uncommitted changes"
    echo ""
    log_warn "Are you absolutely sure you want to continue?"
    echo ""
    read -p "Type 'YES' to confirm: " confirmation

    if [[ "$confirmation" != "YES" ]]; then
        log_info "Operation cancelled by user"
        exit 0
    fi

    echo ""
    log_info "Confirmation received. Proceeding with force push and merge..."
    echo ""
}

# Clean up uncommitted changes that might prevent branch switching
cleanup_uncommitted_changes() {
    # In no-verify mode, always clean up changes without asking
    if [[ "$NO_VERIFY" == true ]]; then
        # Check for unstaged changes
        if ! git diff --quiet; then
            log_warn "Unstaged changes detected. Discarding in no-verify mode..."
            git checkout -- .
            log_info "Unstaged changes have been discarded."
        fi

        # Check for staged changes
        if ! git diff --cached --quiet; then
            log_warn "Staged changes detected. Discarding in no-verify mode..."
            git reset HEAD .
            git checkout -- .
            log_info "Staged changes have been discarded."
        fi
        return 0
    fi

    # Regular mode - check for unstaged changes
    if ! git diff --quiet; then
        log_warn "Unstaged changes detected. These will be discarded before proceeding."
        git checkout -- .
        log_info "Unstaged changes have been discarded."
    fi

    # Check for staged changes
    if ! git diff --cached --quiet; then
        local staged_files=$(git diff --cached --name-only)

        # Check if only auto-generated files have staged changes
        local auto_files=("pnpm-lock.yaml" "package-lock.json" "yarn.lock")
        local has_other_changes=false
        local auto_files_changed=()

        for file in $staged_files; do
            if [[ " ${auto_files[@]} " =~ " ${file} " ]]; then
                auto_files_changed+=("$file")
            else
                has_other_changes=true
            fi
        done

        if [[ "$has_other_changes" == false && ${#auto_files_changed[@]} -gt 0 ]]; then
            log_info "Auto-generated files have staged changes: ${auto_files_changed[*]}"
            log_info "Discarding auto-generated file changes and proceeding..."
            git reset HEAD "${auto_files_changed[@]}"
            git checkout -- "${auto_files_changed[@]}"
            log_info "Successfully discarded auto-generated file changes"
        else
            log_warn "You have staged (but uncommitted) changes that need to be handled before merging."
            log_info "Files with staged changes:"
            echo "$staged_files"
            log_info ""
            log_info "Please commit or stash these changes and run the script again."
            log_info "Or use --no-verify=true to bypass this check."
            exit 1
        fi
    fi
}

# Check if we're on the correct source branch
check_current_branch() {
    local current_branch=$(git branch --show-current)
    if [[ "$current_branch" != "$SOURCE_BRANCH" ]]; then
        if [[ "$NO_VERIFY" == true ]]; then
            log_warn "Not on $SOURCE_BRANCH branch. Current branch: $current_branch"
        else
            log_error "Not on $SOURCE_BRANCH branch. Current branch: $current_branch"
        fi

        # Clean up any uncommitted changes before switching
        cleanup_uncommitted_changes

        log_info "Switching to $SOURCE_BRANCH..."
        git checkout "$SOURCE_BRANCH" || {
            log_error "Failed to checkout $SOURCE_BRANCH"
            exit 1
        }
    fi
}

# Check if there are uncommitted changes (only in regular mode)
check_working_directory() {
    if [[ "$NO_VERIFY" == true ]]; then
        log_warn "Skipping working directory check (no-verify mode)"
        return 0
    fi

    # Use the cleanup function to handle uncommitted changes
    cleanup_uncommitted_changes
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

# Check if local branch is up to date with remote (only in regular mode)
check_branch_sync() {
    if [[ "$NO_VERIFY" == true ]]; then
        log_warn "Skipping branch sync check (no-verify mode)"
        return 0
    fi

    log_info "Checking if $SOURCE_BRANCH is up to date with remote..."

    # Fetch latest changes from remote
    git fetch origin "$SOURCE_BRANCH" || {
        log_error "Failed to fetch latest changes for $SOURCE_BRANCH"
        exit 1
    }

    # Compare local and remote branches
    local local_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse "origin/$SOURCE_BRANCH")

    if [[ "$local_commit" == "$remote_commit" ]]; then
        log_info "✅ $SOURCE_BRANCH is already up to date with remote"
        log_info "Skipping push and merge process..."
        exit 0
    else
        log_info "📤 Local branch has new commits, proceeding with push and merge..."
    fi
}

# Run validation before push (only in regular mode)
run_validation() {
    if [[ "$NO_VERIFY" == true ]]; then
        log_warn "Skipping validation (no-verify mode)"
        return 0
    fi

    log_info "Running pre-push validation (skipping E2E tests)..."

    # Run deployment validator in dry-run mode, skipping E2E tests
    if ! ./scripts/deployment-validator.sh dry-run --skip-e2e-tests; then
        log_error "Pre-push validation failed!"
        log_info "Fix the issues above or use --no-verify=true to bypass validation"
        exit 1
    fi

    log_info "✅ Pre-push validation passed"
}

# Main execution
main() {
    # Parse arguments first (this handles help display)
    parse_arguments "$@"

    if [[ "$DRY_RUN" == true ]]; then
        log_info "🔍 Starting DRY-RUN push and merge process..."
        echo ""
    elif [[ "$NO_VERIFY" == true ]]; then
        log_warn "🚨 Starting FORCE push and merge process (NO VERIFICATION) 🚨"
        echo ""
        log_warn "⚠️  This script will skip all validation and use force push!"
        log_warn "⚠️  Make sure you know what you're doing!"
        echo ""
    else
        log_info "Starting push and merge process..."
    fi

    # Handle dry-run mode early (before any validation)
    if [[ "$DRY_RUN" == true ]]; then
        show_dry_run_operations
        exit 0
    fi

    # Pre-flight checks
    check_branches
    check_current_branch
    check_working_directory
    check_branch_sync

    # Run validation (only in regular mode)
    run_validation

    # Request confirmation for no-verify mode
    if [[ "$NO_VERIFY" == true ]]; then
        request_confirmation
    fi

    # Store original branch for cleanup
    local original_branch=$(git branch --show-current)

    if [[ "$NO_VERIFY" == true ]]; then
        # NO-VERIFY MODE: Force push source, then reset target to source and force push
        log_force "Force pushing $SOURCE_BRANCH to remote..."
        git push --force-with-lease origin "$SOURCE_BRANCH" || {
            log_error "Failed to force push $SOURCE_BRANCH"
            exit 1
        }

        # Switch to target branch
        log_info "Switching to $TARGET_BRANCH..."

        # Clean up any uncommitted changes before switching
        cleanup_uncommitted_changes

        git checkout "$TARGET_BRANCH" || {
            log_error "Failed to checkout $TARGET_BRANCH"
            exit 1
        }

        # Reset target branch to match source branch exactly
        log_force "Resetting $TARGET_BRANCH to match $SOURCE_BRANCH..."
        git reset --hard "$SOURCE_BRANCH" || {
            log_error "Failed to reset $TARGET_BRANCH to $SOURCE_BRANCH"
            exit 1
        }

        # Force push target branch
        log_force "Force pushing $TARGET_BRANCH to remote..."
        git push --force-with-lease origin "$TARGET_BRANCH" || {
            log_error "Failed to force push $TARGET_BRANCH"
            exit 1
        }
    else
        # REGULAR MODE: Regular push source, then merge changes into target
        log_info "Pushing $SOURCE_BRANCH to remote..."
        git push origin "$SOURCE_BRANCH" || {
            log_error "Failed to push $SOURCE_BRANCH"
            exit 1
        }

        # Switch to target branch
        log_info "Switching to $TARGET_BRANCH..."

        # Clean up any uncommitted changes before switching
        cleanup_uncommitted_changes

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

        # Check if source branch changes are already in target branch
        if git merge-base --is-ancestor "$SOURCE_BRANCH" "$TARGET_BRANCH" 2>/dev/null; then
            log_info "✅ $SOURCE_BRANCH changes are already in $TARGET_BRANCH"
            log_info "No merge needed, pushing current state..."
        else
            # Merge source branch changes into target
            log_info "Merging $SOURCE_BRANCH changes into $TARGET_BRANCH..."
            git merge --no-edit "$SOURCE_BRANCH" || {
                log_error "Merge failed. Please resolve conflicts manually."
                log_info "You can continue with: git merge --continue"
                log_info "Or abort with: git merge --abort"
                exit 1
            }
        fi

        # Push target branch
        log_info "Pushing $TARGET_BRANCH to remote..."
        git push origin "$TARGET_BRANCH" || {
            log_error "Failed to push $TARGET_BRANCH"
            exit 1
        }
    fi

    # Return to original branch
    log_info "Switching back to $original_branch..."
    git checkout "$original_branch" || {
        log_warn "Failed to switch back to $original_branch"
        log_info "You are currently on $TARGET_BRANCH"
    }

    if [[ "$NO_VERIFY" == true ]]; then
        log_info "🚀 Force push and merge completed successfully! 🎉"
        log_warn "⚠️  Remember: This bypassed all validation - verify your changes!"
    else
        log_info "Push and merge completed successfully! 🎉"
    fi
}

# Run main function
main "$@"
