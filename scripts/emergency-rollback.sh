#!/bin/bash
# Emergency rollback script for quick deployment reversions
# This script can be run locally or in CI for immediate rollbacks

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
    echo "  -e, --environment ENV    Environment to rollback (production|staging)"
    echo "  -t, --target URL         Specific deployment URL to rollback to"
    echo "  -r, --reason REASON      Reason for rollback (required)"
    echo "  -f, --force              Force rollback even if deployment is recent"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e production -r 'Critical bug in latest deployment'"
    echo "  $0 -e staging -t https://game-diary-abc123.vercel.app -r 'Test rollback'"
    echo ""
}

# Function to validate environment
validate_environment() {
    local env=$1
    if [ "$env" != "production" ] && [ "$env" != "staging" ]; then
        echo -e "${RED}❌ Invalid environment: $env${NC}"
        echo "Valid environments: production, staging"
        exit 1
    fi
}

# Function to check required tools
check_requirements() {
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI is not installed${NC}"
        echo "Install with: npm install -g vercel@latest"
        exit 1
    fi

    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl is not installed${NC}"
        exit 1
    fi
}

# Function to get current deployment
get_current_deployment() {
    local env=$1
    echo -e "${BLUE}🔍 Getting current $env deployment...${NC}"

    if [ "$env" = "production" ]; then
        CURRENT_DEPLOYMENT=$(vercel ls --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID" --prod 2>/dev/null | head -1 | awk '{print $1}')
    else
        CURRENT_DEPLOYMENT=$(vercel ls --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID" 2>/dev/null | head -1 | awk '{print $1}')
    fi

    if [ -z "$CURRENT_DEPLOYMENT" ]; then
        echo -e "${RED}❌ Could not determine current $env deployment${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Current $env deployment: $CURRENT_DEPLOYMENT${NC}"
    echo "$CURRENT_DEPLOYMENT"
}

# Function to get rollback target
get_rollback_target() {
    local env=$1
    local target_url=$2

    if [ -n "$target_url" ]; then
        echo -e "${BLUE}🔍 Using specified rollback target: $target_url${NC}"
        echo "$target_url"
        return
    fi

    echo -e "${BLUE}🔍 Finding previous $env deployment...${NC}"

    if [ "$env" = "production" ]; then
        ROLLBACK_URL=$(vercel ls --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID" --prod 2>/dev/null | sed -n '2p' | awk '{print $1}')
    else
        ROLLBACK_URL=$(vercel ls --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID" 2>/dev/null | sed -n '2p' | awk '{print $1}')
    fi

    if [ -z "$ROLLBACK_URL" ]; then
        echo -e "${RED}❌ Could not determine rollback target${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Previous $env deployment: $ROLLBACK_URL${NC}"
    echo "$ROLLBACK_URL"
}

# Function to validate rollback
validate_rollback() {
    local current_url=$1
    local rollback_url=$2

    if [ "$current_url" = "$rollback_url" ]; then
        echo -e "${RED}❌ Current deployment and rollback target are the same${NC}"
        exit 1
    fi

    echo -e "${BLUE}🔍 Validating rollback target...${NC}"

    # Check if rollback target is accessible
    if curl -f -s --max-time 30 "$rollback_url/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Rollback target is accessible and healthy${NC}"
    else
        echo -e "${YELLOW}⚠️ Rollback target may not be accessible, but proceeding${NC}"
    fi
}

# Function to perform rollback
perform_rollback() {
    local env=$1
    local rollback_url=$2

    echo -e "${BLUE}🔄 Performing $env rollback...${NC}"

    if [ "$env" = "production" ]; then
        echo -e "${YELLOW}🚨 Rolling back production to: $rollback_url${NC}"

        # Promote the rollback target to production
        if vercel promote "$rollback_url" --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID" --yes; then
            echo -e "${GREEN}✅ Production rollback successful${NC}"
        else
            echo -e "${RED}❌ Production rollback failed${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}🔄 Rolling back staging to: $rollback_url${NC}"

        # Set staging domain alias to rollback target
        if vercel alias set "$rollback_url" "staging.game-diary.io" --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID"; then
            echo -e "${GREEN}✅ Staging rollback successful${NC}"
        else
            echo -e "${RED}❌ Staging rollback failed${NC}"
            exit 1
        fi
    fi
}

# Function to verify rollback
verify_rollback() {
    local env=$1

    echo -e "${BLUE}🔍 Verifying rollback...${NC}"

    if [ "$env" = "production" ]; then
        DOMAIN="https://www.game-diary.io"
    else
        DOMAIN="https://staging.game-diary.io"
    fi

    # Wait for domain propagation
    echo -e "${BLUE}⏳ Waiting for domain propagation...${NC}"
    sleep 30

    # Verify the domain is accessible
    for i in {1..5}; do
        if curl -f -s --max-time 30 "$DOMAIN/api/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $env domain is accessible after rollback${NC}"
            return 0
        fi
        if [ $i -eq 5 ]; then
            echo -e "${YELLOW}⚠️ Domain verification failed after 5 attempts${NC}"
            echo -e "${YELLOW}The rollback may still be successful, but domain propagation might be delayed${NC}"
            return 1
        fi
        echo -e "${BLUE}⏳ Retrying verification... (attempt $i/5)${NC}"
        sleep 10
    done
}

# Parse command line arguments
ENVIRONMENT=""
TARGET_URL=""
REASON=""
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -t|--target)
            TARGET_URL="$2"
            shift 2
            ;;
        -r|--reason)
            REASON="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
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

# Validate required arguments
if [ -z "$ENVIRONMENT" ]; then
    echo -e "${RED}❌ Environment is required${NC}"
    show_usage
    exit 1
fi

if [ -z "$REASON" ]; then
    echo -e "${RED}❌ Reason for rollback is required${NC}"
    show_usage
    exit 1
fi

# Validate environment
validate_environment "$ENVIRONMENT"

# Check requirements
check_requirements

# Load environment variables
if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${RED}❌ VERCEL_TOKEN environment variable is required${NC}"
    exit 1
fi

if [ -z "$VERCEL_ORG_ID" ]; then
    echo -e "${RED}❌ VERCEL_ORG_ID environment variable is required${NC}"
    exit 1
fi

# Display rollback information
echo -e "${YELLOW}🚨 EMERGENCY ROLLBACK INITIATED${NC}"
echo "================================="
echo -e "Environment: ${BLUE}$ENVIRONMENT${NC}"
echo -e "Reason: ${BLUE}$REASON${NC}"
echo -e "Force: ${BLUE}$FORCE${NC}"
echo ""

# Get current deployment
CURRENT_URL=$(get_current_deployment "$ENVIRONMENT")

# Get rollback target
ROLLBACK_URL=$(get_rollback_target "$ENVIRONMENT" "$TARGET_URL")

# Validate rollback
validate_rollback "$CURRENT_URL" "$ROLLBACK_URL"

# Confirm rollback (unless forced)
if [ "$FORCE" != true ]; then
    echo ""
    echo -e "${YELLOW}⚠️ Are you sure you want to rollback $ENVIRONMENT?${NC}"
    echo -e "From: ${RED}$CURRENT_URL${NC}"
    echo -e "To: ${GREEN}$ROLLBACK_URL${NC}"
    echo -e "Reason: ${BLUE}$REASON${NC}"
    echo ""
    read -p "Type 'yes' to confirm: " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo -e "${YELLOW}Rollback cancelled${NC}"
        exit 0
    fi
fi

# Perform rollback
perform_rollback "$ENVIRONMENT" "$ROLLBACK_URL"

# Verify rollback
verify_rollback "$ENVIRONMENT"

echo ""
echo -e "${GREEN}✅ Emergency rollback completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "- Investigate the issue that caused the rollback"
echo "- Fix the problem in development"
echo "- Test thoroughly before next deployment"
echo "- Consider updating deployment validation to prevent similar issues"
echo ""
echo -e "${YELLOW}Note: This was an emergency rollback. Please document the incident.${NC}"
