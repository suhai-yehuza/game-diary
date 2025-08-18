#!/bin/bash
# Unified script to set up branch protection rules for important branches
# This ensures branches are protected and require proper workflows

set -e

# Default branches to protect
DEFAULT_BRANCHES=("master" "deployment" "staging")

# Function to display usage
show_usage() {
    echo "Usage: $0 [OPTIONS] [BRANCHES...]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -a, --all      Protect all default branches: ${DEFAULT_BRANCHES[*]}"
    echo "  -m, --master   Protect master branch only"
    echo "  -d, --deploy   Protect deployment branch only"
    echo "  -s, --staging  Protect staging branch only"
    echo ""
    echo "Examples:"
    echo "  $0 --all                    # Protect all default branches"
    echo "  $0 master deployment        # Protect specific branches"
    echo "  $0 --master                 # Protect master branch only"
    echo ""
}

# Function to validate git repository
validate_repository() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "❌ Error: Not in a git repository"
        exit 1
    fi

    REMOTE_URL=$(git config --get remote.origin.url)
    if [ -z "$REMOTE_URL" ]; then
        echo "❌ Error: No remote origin found"
        exit 1
    fi

    echo "📋 Current repository: $REMOTE_URL"
    echo ""
}

# Function to check and create branch if needed
check_branch() {
    local branch=$1

    echo "🔍 Checking $branch branch..."

    # Check if branch exists locally
    if ! git show-ref --verify --quiet refs/heads/$branch; then
        echo "⚠️  $branch branch does not exist locally"
        if [ "$branch" = "deployment" ]; then
            echo "Creating $branch branch from master..."
            git checkout master
            git checkout -b $branch
        else
            echo "Please create the $branch branch first:"
            echo "  git checkout -b $branch"
            echo "  git push -u origin $branch"
            return 1
        fi
    else
        echo "✅ $branch branch exists locally"
    fi

    # Check if branch exists on remote
    if ! git ls-remote --heads origin $branch | grep -q $branch; then
        echo "⚠️  $branch branch does not exist on remote"
        echo "Pushing $branch branch to remote..."
        git push -u origin $branch
    else
        echo "✅ $branch branch exists on remote"
    fi

    echo ""
}

# Function to generate protection instructions
generate_instructions() {
    local branch=$1
    local is_master=false
    local is_deployment=false

    if [ "$branch" = "master" ]; then
        is_master=true
    elif [ "$branch" = "deployment" ]; then
        is_deployment=true
    fi

    echo "🔧 Branch Protection Setup for '$branch':"
    echo "=========================================="
    echo ""
    echo "1. Go to your repository on GitHub:"
    echo "   https://github.com/$(echo $REMOTE_URL | sed 's/.*github\.com[:/]\([^/]*\/[^/]*\)\.git/\1/')"
    echo ""
    echo "2. Navigate to: Settings → Branches"
    echo ""
    echo "3. Click 'Add rule' or 'Add branch protection rule'"
    echo ""
    echo "4. Configure the following settings for the '$branch' branch:"
    echo ""
    echo "   ✅ Branch name pattern: $branch"
    echo ""
    echo "   🔒 Protect matching branches:"
    echo "   ✅ Require a pull request before merging"
    echo "   ✅ Require approvals: 1 (or more as needed)"
    echo "   ✅ Dismiss stale PR approvals when new commits are pushed"

    if [ "$is_master" = true ]; then
        echo "   ✅ Require review from code owners"
    fi

    echo ""
    echo "   🚫 Restrict pushes:"
    echo "   ✅ Restrict pushes that create files"
    echo "   ✅ Restrict pushes that delete files"
    echo "   ✅ Restrict pushes that force push"
    echo "   ✅ Restrict pushes that update the branch"
    echo "   ✅ Include administrators"
    echo ""

    if [ "$is_master" = true ]; then
        echo "   ✅ Require status checks to pass before merging"
        echo "   ✅ Require branches to be up to date before merging"
        echo "   ✅ Require conversation resolution before merging"
        echo "   ✅ Require signed commits"
        echo "   ✅ Require linear history"
        echo "   ✅ Require deployments to succeed before merging"
        echo "   ✅ Lock branch"
    fi

    echo ""
    echo "   ✅ Do not allow bypassing the above settings"
    echo ""
    echo "5. Click 'Create' or 'Save changes'"
    echo ""

    if [ "$is_master" = true ]; then
        echo "🎯 Master Branch Specific Notes:"
        echo "==============================="
        echo "- All changes must go through pull requests"
        echo "- Code review required from code owners"
        echo "- CI checks must pass before merging"
        echo "- Linear history enforced"
        echo ""
    elif [ "$is_deployment" = true ]; then
        echo "🎯 Deployment Branch Specific Notes:"
        echo "===================================="
        echo "- Only automated workflows can update this branch"
        echo "- No manual pushes allowed"
        echo "- Used for production deployments only"
        echo ""
    fi
}

# Function to show summary
show_summary() {
    echo "✅ Branch Protection Summary:"
    echo "============================="
    echo ""
    for branch in "$@"; do
        echo "🔒 $branch branch will be protected"
    done
    echo ""
    echo "🎯 Benefits:"
    echo "- Prevents accidental direct pushes"
    echo "- Ensures code review for all changes"
    echo "- Maintains code quality standards"
    echo "- Protects against force pushes"
    echo ""
    echo "🚀 Automated workflows will still work:"
    echo "- Staging deployment (hourly)"
    echo "- Production deployment (MTWTh)"
    echo "- Cherry-picking operations"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Follow the instructions above for each branch"
    echo "2. Test the protection by trying to push directly (should fail)"
    echo "3. Verify automated workflows still function correctly"
    echo ""
}

# Parse command line arguments
BRANCHES=()
PROTECT_ALL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -a|--all)
            PROTECT_ALL=true
            shift
            ;;
        -m|--master)
            BRANCHES+=("master")
            shift
            ;;
        -d|--deploy)
            BRANCHES+=("deployment")
            shift
            ;;
        -s|--staging)
            BRANCHES+=("staging")
            shift
            ;;
        -*)
            echo "❌ Unknown option: $1"
            show_usage
            exit 1
            ;;
        *)
            BRANCHES+=("$1")
            shift
            ;;
    esac
done

# If --all is specified, use default branches
if [ "$PROTECT_ALL" = true ]; then
    BRANCHES=("${DEFAULT_BRANCHES[@]}")
fi

# If no branches specified, default to master
if [ ${#BRANCHES[@]} -eq 0 ]; then
    BRANCHES=("master")
fi

# Validate repository
validate_repository

echo "🔒 Setting up branch protection for: ${BRANCHES[*]}"
echo ""

# Check each branch
for branch in "${BRANCHES[@]}"; do
    if ! check_branch "$branch"; then
        echo "❌ Failed to prepare $branch branch"
        exit 1
    fi
done

echo "✅ All branches are ready for protection setup"
echo ""

# Generate instructions for each branch
for branch in "${BRANCHES[@]}"; do
    generate_instructions "$branch"
    echo "---"
    echo ""
done

# Show summary
show_summary "${BRANCHES[@]}"

echo "🔒 Branch protection setup complete!"
