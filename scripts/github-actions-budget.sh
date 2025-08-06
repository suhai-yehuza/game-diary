#!/bin/bash

# GitHub Actions Budget Management Script
# This script helps monitor and manage GitHub Actions usage and costs

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="suhai-yehuza"
REPO_NAME="game-diary"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

# Budget limits (in minutes per month)
FREE_TIER_LIMIT=2000
PRO_TIER_LIMIT=3000
ENTERPRISE_LIMIT=50000

# Current month
CURRENT_MONTH=$(date +%Y-%m)

echo -e "${BLUE}📊 GitHub Actions Budget Monitor${NC}"
echo -e "${BLUE}Repository: $REPO_OWNER/$REPO_NAME${NC}"
echo -e "${BLUE}Current Month: $CURRENT_MONTH${NC}"
echo ""

# Function to check if GitHub CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
        echo "Install it from: https://cli.github.com/"
        exit 1
    fi
}

# Function to get current month usage
get_monthly_usage() {
    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${YELLOW}⚠️  GITHUB_TOKEN not set, using GitHub CLI authentication${NC}"
        gh auth status || {
            echo -e "${RED}❌ Not authenticated with GitHub CLI${NC}"
            echo "Run: gh auth login"
            exit 1
        }
    fi

    echo -e "${BLUE}📈 Fetching usage data...${NC}"

    # Get workflow runs for current month
    local usage_data
    usage_data=$(gh api repos/$REPO_OWNER/$REPO_NAME/actions/runs \
        --jq '.workflow_runs[] | select(.created_at | startswith("'$CURRENT_MONTH'")) | {id: .id, status: .status, conclusion: .conclusion, duration: .run_duration_ms}')

    if [ -z "$usage_data" ]; then
        echo -e "${GREEN}✅ No workflow runs found for $CURRENT_MONTH${NC}"
        return 0
    fi

    # Calculate total duration in minutes
    local total_minutes=0
    local completed_runs=0

    while IFS= read -r line; do
        if [ -n "$line" ]; then
            local duration_ms=$(echo "$line" | jq -r '.duration // 0')
            local status=$(echo "$line" | jq -r '.status')
            local conclusion=$(echo "$line" | jq -r '.conclusion')

            if [ "$status" = "completed" ] && [ "$conclusion" != "cancelled" ]; then
                local duration_minutes=$((duration_ms / 60000))
                total_minutes=$((total_minutes + duration_minutes))
                completed_runs=$((completed_runs + 1))
            fi
        fi
    done <<< "$usage_data"

    echo -e "${GREEN}✅ Usage Summary for $CURRENT_MONTH:${NC}"
    echo -e "   • Completed runs: $completed_runs"
    echo -e "   • Total minutes: $total_minutes"
    echo -e "   • Free tier limit: $FREE_TIER_LIMIT minutes"
    echo -e "   • Usage percentage: $((total_minutes * 100 / FREE_TIER_LIMIT))%"

    # Budget warnings
    if [ $total_minutes -gt $((FREE_TIER_LIMIT * 80 / 100)) ]; then
        echo -e "${YELLOW}⚠️  Warning: Approaching free tier limit (80%+)${NC}"
    fi

    if [ $total_minutes -gt $FREE_TIER_LIMIT ]; then
        echo -e "${RED}❌ Exceeded free tier limit!${NC}"
    fi
}

# Function to optimize workflows
optimize_workflows() {
    echo -e "${BLUE}🔧 Workflow Optimization Suggestions:${NC}"
    echo ""
    echo "1. Add timeouts to all jobs:"
    echo "   timeout-minutes: 30"
    echo ""
    echo "2. Reduce artifact retention:"
    echo "   retention-days: 7"
    echo ""
    echo "3. Use caching for dependencies:"
    echo "   - uses: actions/cache@v3"
    echo ""
    echo "4. Limit parallel jobs:"
    echo "   strategy:"
    echo "     max-parallel: 4"
    echo ""
    echo "5. Skip unnecessary jobs on PRs:"
    echo "   if: github.event_name != 'pull_request'"
    echo ""
    echo "6. Use smaller runners when possible:"
    echo "   runs-on: ubuntu-latest"
    echo ""
    echo "7. Combine similar jobs to reduce overhead"
}

# Function to show cost-saving tips
show_cost_tips() {
    echo -e "${BLUE}💰 Cost-Saving Tips:${NC}"
    echo ""
    echo "• Use self-hosted runners for heavy workloads"
    echo "• Implement conditional job execution"
    echo "• Cache dependencies and build artifacts"
    echo "• Use matrix strategy efficiently"
    echo "• Set appropriate timeouts"
    echo "• Clean up old artifacts regularly"
    echo "• Monitor and optimize workflow efficiency"
    echo "• Consider using GitHub Actions minutes for critical workflows only"
}

# Main execution
main() {
    check_gh_cli
    get_monthly_usage
    echo ""
    optimize_workflows
    echo ""
    show_cost_tips
}

# Run main function
main "$@"
