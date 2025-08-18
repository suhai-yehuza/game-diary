#!/bin/bash
# Setup script for the new simplified deployment lifecycle
# This script helps configure the new master → staging → production workflow

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help           Show this help message"
    echo "  -s, --setup          Setup new deployment workflow"
    echo "  -c, --check          Check current configuration"
    echo "  -m, --migrate        Migrate from old deployment system"
    echo ""
    echo "Examples:"
    echo "  $0 --setup           # Setup new deployment workflow"
    echo "  $0 --check           # Check current configuration"
    echo "  $0 --migrate         # Migrate from old system"
    echo ""
}

# Function to validate git repository
validate_repository() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}❌ Error: Not in a git repository${NC}"
        exit 1
    fi

    REMOTE_URL=$(git config --get remote.origin.url)
    if [ -z "$REMOTE_URL" ]; then
        echo -e "${RED}❌ Error: No remote origin found${NC}"
        exit 1
    fi

    echo -e "${BLUE}📋 Current repository: $REMOTE_URL${NC}"
    echo ""
}

# Function to check current branch configuration
check_configuration() {
    echo -e "${BLUE}🔍 Checking current deployment configuration...${NC}"
    echo ""

    # Check if staging branch exists
    if git show-ref --verify --quiet refs/remotes/origin/staging; then
        echo -e "${GREEN}✅ Staging branch exists${NC}"
    else
        echo -e "${YELLOW}⚠️  Staging branch does not exist${NC}"
    fi

    # Check if deployment branch exists (old system)
    if git show-ref --verify --quiet refs/remotes/origin/deployment; then
        echo -e "${YELLOW}⚠️  Deployment branch exists (old system)${NC}"
    else
        echo -e "${GREEN}✅ No deployment branch (new system)${NC}"
    fi

    # Check workflow files
    if [ -f ".github/workflows/sync-staging.yml" ]; then
        echo -e "${GREEN}✅ Sync staging workflow exists${NC}"
    else
        echo -e "${RED}❌ Sync staging workflow missing${NC}"
    fi

    if [ -f ".github/workflows/staging.yml" ]; then
        echo -e "${GREEN}✅ Staging deployment workflow exists${NC}"
    else
        echo -e "${RED}❌ Staging deployment workflow missing${NC}"
    fi

    if [ -f ".github/workflows/production.yml" ]; then
        echo -e "${GREEN}✅ Production deployment workflow exists${NC}"
    else
        echo -e "${RED}❌ Production deployment workflow missing${NC}"
    fi

    echo ""
}

# Function to setup new deployment workflow
setup_new_workflow() {
    echo -e "${BLUE}🚀 Setting up new deployment workflow...${NC}"
    echo ""

    # Create staging branch if it doesn't exist
    if ! git show-ref --verify --quiet refs/remotes/origin/staging; then
        echo -e "${YELLOW}Creating staging branch from master...${NC}"
        git checkout master
        git checkout -b staging
        git push -u origin staging
        echo -e "${GREEN}✅ Staging branch created${NC}"
    else
        echo -e "${GREEN}✅ Staging branch already exists${NC}"
    fi

    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo "1. Set up branch protection rules:"
    echo "   - Master branch: Require PR reviews and CI checks"
    echo "   - Staging branch: Allow automated workflows only"
    echo ""
    echo "2. Configure GitHub environments:"
    echo "   - Staging environment"
    echo "   - Production environment"
    echo ""
    echo "3. Test the workflow:"
    echo "   - Make a change to master"
    echo "   - Verify staging sync and deployment"
    echo "   - Test production deployment after 24h"
    echo ""
}

# Function to migrate from old system
migrate_from_old() {
    echo -e "${BLUE}🔄 Migrating from old deployment system...${NC}"
    echo ""

    # Check if deployment branch exists
    if git show-ref --verify --quiet refs/remotes/origin/deployment; then
        echo -e "${YELLOW}Found deployment branch from old system${NC}"
        echo "The deployment branch will no longer be used in the new workflow."
        echo "You can safely delete it after confirming the new workflow works."
        echo ""
    fi

    # Check for old workflow files
    if [ -f ".github/workflows/cherry-pick-commits.yml" ]; then
        echo -e "${YELLOW}Found cherry-pick workflow (old system)${NC}"
        echo "This workflow is no longer needed in the new system."
        echo "You can archive it after confirming the new workflow works."
        echo ""
    elif [ -f ".github/workflows/archived/cherry-pick-commits.yml" ]; then
        echo -e "${GREEN}✅ Cherry-pick workflow has been archived${NC}"
        echo "This workflow was moved to .github/workflows/archived/"
        echo ""
    fi

    echo -e "${GREEN}✅ Migration preparation complete${NC}"
    echo ""
    echo -e "${BLUE}📋 Migration Steps:${NC}"
    echo "1. Test the new workflow thoroughly"
    echo "2. Archive old workflow files (cherry-pick workflow already archived)"
    echo "3. Delete deployment branch (optional)"
    echo "4. Update team documentation"
    echo ""
}

# Function to generate branch protection instructions
generate_protection_instructions() {
    echo -e "${BLUE}🔒 Branch Protection Setup Instructions${NC}"
    echo "=============================================="
    echo ""
    echo "1. Go to your repository on GitHub:"
    echo "   https://github.com/$(echo $REMOTE_URL | sed 's/.*github\.com[:/]\([^/]*\/[^/]*\)\.git/\1/')"
    echo ""
    echo "2. Navigate to: Settings → Branches"
    echo ""
    echo "3. Configure protection rules:"
    echo ""
    echo "   🔒 Master Branch Protection:"
    echo "   - Branch name pattern: master"
    echo "   - Require a pull request before merging"
    echo "   - Require approvals: 1 (or more as needed)"
    echo "   - Require review from code owners"
    echo "   - Require status checks to pass before merging"
    echo "   - Require branches to be up to date before merging"
    echo "   - Require conversation resolution before merging"
    echo "   - Require signed commits"
    echo "   - Require linear history"
    echo "   - Include administrators"
    echo ""
    echo "   🔒 Staging Branch Protection:"
    echo "   - Branch name pattern: staging"
    echo "   - Allow force pushes (for automated sync)"
    echo "   - Allow deletions (for automated sync)"
    echo "   - Restrict pushes to matching branches"
    echo "   - Include administrators"
    echo ""
    echo "4. Click 'Create' or 'Save changes'"
    echo ""
}

# Parse command line arguments
SETUP=false
CHECK=false
MIGRATE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -s|--setup)
            SETUP=true
            shift
            ;;
        -c|--check)
            CHECK=true
            shift
            ;;
        -m|--migrate)
            MIGRATE=true
            shift
            ;;
        -*)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            show_usage
            exit 1
            ;;
        *)
            echo -e "${RED}❌ Unknown argument: $1${NC}"
            show_usage
            exit 1
            ;;
    esac
done

# If no options specified, default to check
if [ "$SETUP" = false ] && [ "$CHECK" = false ] && [ "$MIGRATE" = false ]; then
    CHECK=true
fi

# Validate repository
validate_repository

# Execute requested actions
if [ "$CHECK" = true ]; then
    check_configuration
fi

if [ "$SETUP" = true ]; then
    setup_new_workflow
    generate_protection_instructions
fi

if [ "$MIGRATE" = true ]; then
    migrate_from_old
fi

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}📚 For more information, see: DEPLOYMENT_LIFECYCLE.md${NC}"
