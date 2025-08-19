#!/bin/bash

# Git Validation Setup Script
# Helps users set up and validate git validation requirements

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository. Please run this script from the root of your git repository."
        exit 1
    fi
}

# Function to check Husky installation
check_husky() {
    if [ ! -d ".husky" ]; then
        print_error "Husky not found. Please install Husky first:"
        echo "  pnpm add -D husky"
        echo "  pnpm husky install"
        exit 1
    fi

    if [ ! -f ".husky/pre-commit" ] || [ ! -f ".husky/commit-msg" ]; then
        print_warning "Husky hooks not found. Creating them..."
        create_husky_hooks
    else
        print_success "Husky hooks found"
    fi
}

# Function to create Husky hooks
create_husky_hooks() {
    print_status "Creating Husky hooks..."

    # Create pre-commit hook if it doesn't exist
    if [ ! -f ".husky/pre-commit" ]; then
        cat > ".husky/pre-commit" << 'EOF'
#!/usr/bin/env sh

# Pre-commit Hook
# Runs validation checks before allowing commits

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[PRE-COMMIT]${NC} $1"
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

# Get the current branch name
BRANCH_NAME=$(git branch --show-current)

print_status "Running pre-commit checks..."

# 1. Validate branch name first (fastest check)
print_status "Validating branch name: $BRANCH_NAME"
if command -v tsx >/dev/null 2>&1; then
    if ! tsx scripts/git/validate-branch-name.ts "$BRANCH_NAME"; then
        print_error "Branch name validation failed"
        exit 1
    fi
    print_success "Branch name validation passed"
else
    print_warning "tsx not found, skipping branch name validation"
fi

# 2. Run the full validation pipeline (includes git validation)
print_status "Running validation pipeline..."
if ! ./scripts/validation-pipeline.sh precommit; then
    print_error "Pre-commit validation failed"
    exit 1
fi

print_success "All pre-commit checks passed!"
EOF
        chmod +x .husky/pre-commit
        print_success "Created .husky/pre-commit"
    fi

    # Create pre-push hook if it doesn't exist
    if [ ! -f ".husky/pre-push" ]; then
        cat > ".husky/pre-push" << 'EOF'
#!/usr/bin/env sh

# Pre-push Hook
# Runs comprehensive validation before allowing pushes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[PRE-PUSH]${NC} $1"
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

# Get the current branch name
BRANCH_NAME=$(git branch --show-current)

print_status "Running pre-push checks..."

# 1. Validate branch name first (fastest check)
print_status "Validating branch name: $BRANCH_NAME"
if command -v tsx >/dev/null 2>&1; then
    if ! tsx scripts/git/validate-branch-name.ts "$BRANCH_NAME"; then
        print_error "Branch name validation failed"
        exit 1
    fi
    print_success "Branch name validation passed"
else
    print_warning "tsx not found, skipping branch name validation"
fi

# 2. Validate all commits in the push (if any new commits)
print_status "Validating commit messages..."
if command -v tsx >/dev/null 2>&1; then
    # Get commits that will be pushed
    PUSH_COMMITS=$(git log --oneline --no-merges "$DEFAULT_REMOTE/$DEFAULT_BRANCH"..HEAD 2>/dev/null || git log --oneline --no-merges HEAD~10..HEAD 2>/dev/null)
    if [ -n "$PUSH_COMMITS" ]; then
        echo "$PUSH_COMMITS" | while read -r commit; do
            COMMIT_HASH=$(echo "$commit" | cut -d' ' -f1)
            COMMIT_MSG=$(echo "$commit" | cut -d' ' -f2-)
            print_status "Validating commit: $COMMIT_HASH"
            if ! tsx scripts/git/validate-commit-message.ts "$COMMIT_MSG"; then
                print_error "Commit message validation failed for: $COMMIT_HASH"
                exit 1
            fi
        done
        print_success "All commit messages validated"
    else
        print_status "No new commits to validate"
    fi
else
    print_warning "tsx not found, skipping commit message validation"
fi

# 3. Run the full validation pipeline (includes git validation)
print_status "Running validation pipeline..."
if ! ./scripts/validation-pipeline.sh prepush; then
    print_error "Pre-push validation failed"
    exit 1
fi

print_success "All pre-push checks passed!"
EOF
        chmod +x .husky/pre-push
        print_success "Created .husky/pre-push"
    fi

    # Create prepare-commit-msg hook if it doesn't exist
    if [ ! -f ".husky/prepare-commit-msg" ]; then
        cat > ".husky/prepare-commit-msg" << 'EOF'
#!/usr/bin/env sh

# Prepare Commit Message Hook
# Automatically adds ticket number and username from branch name to commit messages

set -e

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[PREPARE-COMMIT-MSG]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

COMMIT_MSG_FILE="$1"
COMMIT_SOURCE="$2"
SHA1="$3"

# Only add branch info for new commits (not merges, rebases, etc.)
if [ "$COMMIT_SOURCE" = "message" ] || [ "$COMMIT_SOURCE" = "template" ] || [ "$COMMIT_SOURCE" = "merge" ] || [ "$COMMIT_SOURCE" = "squash" ]; then
    exit 0
fi

# Get current branch name
BRANCH_NAME=$(git branch --show-current)

print_status "Preparing commit message for branch: $BRANCH_NAME"

# Extract ticket number and username from branch name if it follows our convention
# Format: username/PROJECT-123-description
if [[ $BRANCH_NAME =~ ^([a-zA-Z0-9_-]+)/([A-Z]+-\d+)- ]]; then
    USERNAME="${BASH_REMATCH[1]}"
    TICKET_NUMBER="${BASH_REMATCH[2]}"
    
    print_status "Extracted from branch: username=$USERNAME, ticket=$TICKET_NUMBER"
    
    # Read the current commit message
    COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")
    
    # Check if the commit message already has the ticket number and username
    if ! echo "$COMMIT_MSG" | grep -q "\[$TICKET_NUMBER\]" || ! echo "$COMMIT_MSG" | grep -q "\[@$USERNAME\]"; then
        print_status "Adding ticket and username to commit message..."
        
        # Check if the commit message follows conventional commits format
        if [[ $COMMIT_MSG =~ ^(feat|fix|docs|style|refactor|perf|test|chore|ci|revert|security)(\([a-z-]+\))?(!)?: ]]; then
            # Insert ticket and username after the type/scope but before the description
            NEW_MSG=$(echo "$COMMIT_MSG" | sed "s/^\([^:]*\): \(.*\)$/\1: [$TICKET_NUMBER] [@$USERNAME] \2/")
            
            # Write the updated message back to the file
            echo "$NEW_MSG" > "$COMMIT_MSG_FILE"
            
            print_success "Added [$TICKET_NUMBER] [@$USERNAME] to commit message"
        else
            print_warning "Commit message doesn't follow conventional commits format, skipping auto-injection"
            print_warning "Please format your commit message as: <type>: [TICKET] [@username] <description>"
        fi
    else
        print_status "Ticket number and username already present in commit message"
    fi
else
    print_warning "Branch name doesn't follow convention: username/PROJECT-123-description"
    print_warning "Please rename your branch to follow the pattern: syehuza/DYL-1234-feature-name"
fi
EOF
        chmod +x .husky/prepare-commit-msg
        print_success "Created .husky/prepare-commit-msg"
    fi
    
    # Create commit-msg hook if it doesn't exist
    if [ ! -f ".husky/commit-msg" ]; then
        cat > ".husky/commit-msg" << 'EOF'
#!/usr/bin/env sh

# Husky commit-msg hook
# Validates commit message format with ticket number and username

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[COMMIT-MSG]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the commit message file
COMMIT_MSG_FILE="$1"

print_status "Validating commit message..."

# Validate commit message format
if command -v tsx >/dev/null 2>&1; then
    if ! tsx scripts/git/validate-commit-message.ts --file "$COMMIT_MSG_FILE"; then
        print_error "Commit message validation failed"
        exit 1
    fi
    print_success "Commit message validation passed"
else
    print_status "tsx not found, skipping commit message validation"
fi
EOF
        chmod +x .husky/commit-msg
        print_success "Created .husky/commit-msg"
    fi
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."

    local missing_deps=()

    # Check for tsx
    if ! command_exists tsx; then
        missing_deps+=("tsx")
    else
        print_success "tsx found"
    fi

    # Check for pnpm
    if ! command_exists pnpm; then
        missing_deps+=("pnpm")
    else
        print_success "pnpm found"
    fi

    # Check for git
    if ! command_exists git; then
        missing_deps+=("git")
    else
        print_success "git found"
    fi

    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_warning "Missing dependencies: ${missing_deps[*]}"
        echo ""
        echo "Install missing dependencies:"
        for dep in "${missing_deps[@]}"; do
            case $dep in
                "tsx")
                    echo "  npm install -g tsx"
                    echo "  or: pnpm add -g tsx"
                    ;;
                "pnpm")
                    echo "  npm install -g pnpm"
                    ;;
                "git")
                    echo "  Install git from https://git-scm.com/"
                    ;;
            esac
        done
        echo ""
    fi
}

# Function to validate current setup
validate_setup() {
    print_status "Validating current setup..."

    # Check current branch
    local current_branch=$(git branch --show-current)
    print_status "Current branch: $current_branch"

    if command_exists tsx; then
        if tsx scripts/git/validate-branch-name.ts "$current_branch"; then
            print_success "Branch name validation passed"
        else
            print_error "Branch name validation failed"
            return 1
        fi
    else
        print_warning "tsx not found, skipping branch validation"
    fi

    # Check recent commits
    print_status "Checking recent commits..."
    local recent_commits=$(git log --oneline -5)
    if [ -n "$recent_commits" ]; then
        echo "$recent_commits" | while read -r commit; do
            local commit_hash=$(echo "$commit" | cut -d' ' -f1)
            local commit_msg=$(echo "$commit" | cut -d' ' -f2-)
            print_status "Validating commit: $commit_hash"
            if command_exists tsx; then
                if tsx scripts/git/validate-commit-message.ts "$commit_msg"; then
                    print_success "Commit $commit_hash validation passed"
                else
                    print_error "Commit $commit_hash validation failed"
                    return 1
                fi
            fi
        done
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --check        Check current setup and dependencies"
    echo "  --setup        Set up git validation hooks"
    echo "  --validate     Validate current branch and recent commits"
    echo "  --all          Run all checks and setup (default)"
    echo ""
    echo "This script helps set up and validate git best practices:"
    echo "  • Branch naming conventions"
    echo "  • Commit message format (with ticket number and username)"
    echo "  • Husky hooks configuration"
    echo ""
}

# Function to run tests
run_tests() {
    print_status "Running validation tests..."

    # Test branch name validation
    print_status "Testing branch name validation..."
    if command_exists tsx; then
                # Test valid branch name
        if tsx scripts/git/validate-branch-name.ts "syehuza/DYL-1234-test-branch"; then
            print_success "Valid branch name test passed"
        else
            print_error "Valid branch name test failed"
            return 1
        fi

        # Test invalid branch name (should fail)
        if ! tsx scripts/git/validate-branch-name.ts "invalid-branch" 2>/dev/null; then
            print_success "Invalid branch name test passed (correctly failed)"
        else
            print_error "Invalid branch name test failed (should have failed)"
            return 1
        fi
    fi

    # Test commit message validation
    print_status "Testing commit message validation..."
    if command_exists tsx; then
        # Test valid commit message
        if tsx scripts/git/validate-commit-message.ts "feat: [PROJ-123] [@john.doe] add new feature"; then
            print_success "Valid commit message test passed"
        else
            print_error "Valid commit message test failed"
            return 1
        fi

        # Test invalid commit message (should fail)
        if ! tsx scripts/git/validate-commit-message.ts "invalid commit message" 2>/dev/null; then
            print_success "Invalid commit message test passed (correctly failed)"
        else
            print_error "Invalid commit message test failed (should have failed)"
            return 1
        fi
    fi
}

# Main function
main() {
    # Parse arguments
    local action="all"

    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            --check)
                action="check"
                shift
                ;;
            --setup)
                action="setup"
                shift
                ;;
            --validate)
                action="validate"
                shift
                ;;
            --all)
                action="all"
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    print_status "Git Validation Setup Script"
    echo ""

    # Check if we're in a git repository
    check_git_repo

    case $action in
        "check")
            check_dependencies
            check_husky
            ;;
        "setup")
            check_dependencies
            check_husky
            create_husky_hooks
            ;;
        "validate")
            validate_setup
            ;;
        "all")
            check_dependencies
            check_husky
            create_husky_hooks
            validate_setup
            run_tests
            ;;
    esac

    echo ""
    print_success "Git validation setup completed!"
    echo ""
    print_status "Next steps:"
    echo "  1. Create a feature branch: git checkout -b syehuza/DYL-1234-your-feature"
    echo "  2. Make your changes"
    echo "  3. Commit with proper format: git commit -m 'feat: [DYL-1234] [@syehuza] your message'"
    echo "  4. Push your branch: git push -u origin syehuza/DYL-1234-your-feature"
    echo ""
    print_status "Validation will run automatically on:"
    echo "  • git commit (commit message validation)"
    echo "  • git push (branch name and commit validation)"
    echo ""
    print_success "Happy coding! 🚀"
}

# Run main function
main "$@"
