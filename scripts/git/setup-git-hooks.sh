#!/bin/bash

# Git Hooks Setup Script
# Sets up pre-commit and commit-msg hooks to enforce best practices

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

# Function to create hooks directory
create_hooks_directory() {
    local hooks_dir=".git/hooks"

    if [ ! -d "$hooks_dir" ]; then
        print_error "Git hooks directory not found: $hooks_dir"
        exit 1
    fi

    print_status "Using hooks directory: $hooks_dir"
}

# Function to create pre-commit hook
create_pre_commit_hook() {
    local hooks_dir=".git/hooks"
    local pre_commit_file="$hooks_dir/pre-commit"

    print_status "Creating pre-commit hook..."

    cat > "$pre_commit_file" << 'EOF'
#!/bin/bash

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

# Get the current branch name
BRANCH_NAME=$(git branch --show-current)

print_status "Running pre-commit checks..."

# 1. Validate branch name
print_status "Validating branch name: $BRANCH_NAME"
if command -v tsx >/dev/null 2>&1; then
    if ! tsx scripts/git/validate-branch-name.ts "$BRANCH_NAME"; then
        print_error "Branch name validation failed"
        exit 1
    fi
    print_success "Branch name validation passed"
else
    print_status "tsx not found, skipping branch name validation"
fi

# 2. Validate staged commit messages (if any)
print_status "Validating staged commit messages..."
STAGED_COMMITS=$(git log --oneline --no-merges origin/main..HEAD 2>/dev/null || git log --oneline --no-merges HEAD~10..HEAD 2>/dev/null)
if [ -n "$STAGED_COMMITS" ]; then
    echo "$STAGED_COMMITS" | while read -r commit; do
        COMMIT_HASH=$(echo "$commit" | cut -d' ' -f1)
        COMMIT_MSG=$(echo "$commit" | cut -d' ' -f2-)
        print_status "Validating commit: $COMMIT_HASH"
        if ! tsx scripts/git/validate-commit-message.ts "$COMMIT_MSG"; then
            print_error "Commit message validation failed for: $COMMIT_HASH"
            exit 1
        fi
    done
    print_success "All staged commit messages validated"
else
    print_status "No staged commits to validate"
fi

# 3. Run linting
print_status "Running linting checks..."
if command -v pnpm >/dev/null 2>&1; then
    if ! pnpm lint --fix; then
        print_error "Linting failed"
        exit 1
    fi
    print_success "Linting passed"
else
    print_status "pnpm not found, skipping linting"
fi

# 4. Run type checking
print_status "Running type checking..."
if command -v pnpm >/dev/null 2>&1; then
    if ! pnpm typecheck; then
        print_error "Type checking failed"
        exit 1
    fi
    print_success "Type checking passed"
else
    print_status "pnpm not found, skipping type checking"
fi

# 5. Run tests (if there are staged test files)
print_status "Checking for test files..."
STAGED_FILES=$(git diff --cached --name-only)
if echo "$STAGED_FILES" | grep -q "\.test\." || echo "$STAGED_FILES" | grep -q "\.spec\."; then
    print_status "Test files detected, running tests..."
    if command -v pnpm >/dev/null 2>&1; then
        if ! pnpm test; then
            print_error "Tests failed"
            exit 1
        fi
        print_success "Tests passed"
    else
        print_status "pnpm not found, skipping tests"
    fi
else
    print_status "No test files staged, skipping tests"
fi

print_success "All pre-commit checks passed!"
EOF

    chmod +x "$pre_commit_file"
    print_success "Pre-commit hook created: $pre_commit_file"
}

# Function to create commit-msg hook
create_commit_msg_hook() {
    local hooks_dir=".git/hooks"
    local commit_msg_file="$hooks_dir/commit-msg"

    print_status "Creating commit-msg hook..."

    cat > "$commit_msg_file" << 'EOF'
#!/bin/bash

# Commit Message Hook
# Validates commit message format

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

    chmod +x "$commit_msg_file"
    print_success "Commit-msg hook created: $commit_msg_file"
}

# Function to create prepare-commit-msg hook (optional)
create_prepare_commit_msg_hook() {
    local hooks_dir=".git/hooks"
    local prepare_commit_msg_file="$hooks_dir/prepare-commit-msg"

    print_status "Creating prepare-commit-msg hook..."

    cat > "$prepare_commit_msg_file" << 'EOF'
#!/bin/bash

# Prepare Commit Message Hook
# Automatically adds branch information to commit messages

set -e

COMMIT_MSG_FILE="$1"
COMMIT_SOURCE="$2"
SHA1="$3"

# Only add branch info for new commits (not merges, rebases, etc.)
if [ "$COMMIT_SOURCE" = "message" ] || [ "$COMMIT_SOURCE" = "template" ] || [ "$COMMIT_SOURCE" = "merge" ] || [ "$COMMIT_SOURCE" = "squash" ]; then
    exit 0
fi

# Get current branch name
BRANCH_NAME=$(git branch --show-current)

# Extract ticket number from branch name if it follows our convention
if [[ $BRANCH_NAME =~ ^[^/]+/([0-9]+)- ]]; then
    TICKET_NUMBER="${BASH_REMATCH[1]}"

    # Read the current commit message
    COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

    # Check if the ticket number is already mentioned in the commit message
    if ! echo "$COMMIT_MSG" | grep -q "#$TICKET_NUMBER"; then
        # Add ticket reference to the end of the commit message
        echo "" >> "$COMMIT_MSG_FILE"
        echo "Closes #$TICKET_NUMBER" >> "$COMMIT_MSG_FILE"
    fi
fi
EOF

    chmod +x "$prepare_commit_msg_file"
    print_success "Prepare-commit-msg hook created: $prepare_commit_msg_file"
}

# Function to create post-commit hook (optional)
create_post_commit_hook() {
    local hooks_dir=".git/hooks"
    local post_commit_file="$hooks_dir/post-commit"

    print_status "Creating post-commit hook..."

    cat > "$post_commit_file" << 'EOF'
#!/bin/bash

# Post-commit Hook
# Runs after successful commits

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[POST-COMMIT]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_status "Commit completed successfully!"

# Get commit info
COMMIT_HASH=$(git rev-parse HEAD)
BRANCH_NAME=$(git branch --show-current)
COMMIT_MSG=$(git log -1 --pretty=%B)

print_status "Commit: $COMMIT_HASH"
print_status "Branch: $BRANCH_NAME"
print_status "Message: $COMMIT_MSG"

# Optional: Show next steps
if [[ $BRANCH_NAME =~ ^(feature|bugfix|hotfix)/ ]]; then
    echo ""
    print_status "Next steps:"
    echo "  1. Push your branch: git push -u origin $BRANCH_NAME"
    echo "  2. Create a pull request"
    echo "  3. Request code review"
fi
EOF

    chmod +x "$post_commit_file"
    print_success "Post-commit hook created: $post_commit_file"
}

# Function to install dependencies
install_dependencies() {
    print_status "Checking dependencies..."

    # Check for tsx
    if ! command_exists tsx; then
        print_warning "tsx not found. Install it with: npm install -g tsx"
        print_warning "Or use: pnpm add -g tsx"
    else
        print_success "tsx found"
    fi

    # Check for pnpm
    if ! command_exists pnpm; then
        print_warning "pnpm not found. Install it with: npm install -g pnpm"
    else
        print_success "pnpm found"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --skip-deps    Skip dependency checks"
    echo "  --minimal      Only install essential hooks (pre-commit, commit-msg)"
    echo ""
    echo "This script sets up git hooks to enforce best practices:"
    echo "  • Branch naming conventions"
    echo "  • Commit message format (Conventional Commits)"
    echo "  • Code quality checks (linting, type checking)"
    echo "  • Test execution for changed files"
    echo ""
}

# Main function
main() {
    # Parse arguments
    SKIP_DEPS=false
    MINIMAL=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            --skip-deps)
                SKIP_DEPS=true
                shift
                ;;
            --minimal)
                MINIMAL=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    print_status "Setting up git hooks for best practices enforcement..."
    echo ""

    # Check if we're in a git repository
    check_git_repo

    # Create hooks directory
    create_hooks_directory

    # Install dependencies (unless skipped)
    if [ "$SKIP_DEPS" = false ]; then
        install_dependencies
        echo ""
    fi

    # Create hooks
    create_pre_commit_hook
    echo ""

    create_commit_msg_hook
    echo ""

    # Create optional hooks (unless minimal mode)
    if [ "$MINIMAL" = false ]; then
        create_prepare_commit_msg_hook
        echo ""

        create_post_commit_hook
        echo ""
    fi

    print_success "Git hooks setup completed!"
    echo ""
    print_status "Hooks installed:"
    echo "  • pre-commit: Validates branch name, runs linting, type checking, and tests"
    echo "  • commit-msg: Validates commit message format"

    if [ "$MINIMAL" = false ]; then
        echo "  • prepare-commit-msg: Automatically adds ticket references"
        echo "  • post-commit: Shows helpful information after commits"
    fi

    echo ""
    print_status "To disable hooks temporarily, use:"
    echo "  git commit --no-verify"
    echo ""
    print_status "To remove hooks, delete files from .git/hooks/"
    echo ""
    print_success "Happy coding! 🚀"
}

# Run main function
main "$@"
