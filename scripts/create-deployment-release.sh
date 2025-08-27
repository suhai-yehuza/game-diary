#!/bin/bash

# Script to create GitHub releases for deployment tracking
# Usage: ./scripts/create-deployment-release.sh <environment> <commit_hash> <deployment_id> <workflow_run_id>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo -e "${BLUE}[$(date +%Y-%m-%d\ %H:%M:%S)]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Validate arguments
if [ $# -ne 4 ]; then
    log_error "Usage: $0 <environment> <commit_hash> <deployment_id> <workflow_run_id>"
    log_error "Example: $0 production abc123def456 12345 67890"
    exit 1
fi

ENVIRONMENT="$1"
COMMIT_HASH="$2"
DEPLOYMENT_ID="$3"
WORKFLOW_RUN_ID="$4"
DEPLOYMENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Validate environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    log_error "Environment must be 'staging' or 'production', got: $ENVIRONMENT"
    exit 1
fi

# Validate commit hash format (basic check)
if [[ ! "$COMMIT_HASH" =~ ^[a-f0-9]{40}$ ]]; then
    log_error "Invalid commit hash format: $COMMIT_HASH"
    exit 1
fi

# Validate deployment ID (should be numeric)
if [[ ! "$DEPLOYMENT_ID" =~ ^[0-9]+$ ]]; then
    log_error "Invalid deployment ID format: $DEPLOYMENT_ID"
    exit 1
fi

# Validate workflow run ID (should be numeric)
if [[ ! "$WORKFLOW_RUN_ID" =~ ^[0-9]+$ ]]; then
    log_error "Invalid workflow run ID format: $WORKFLOW_RUN_ID"
    exit 1
fi

# Check if we have GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    log_error "GITHUB_TOKEN environment variable is required"
    exit 1
fi

# Get repository info
REPO_OWNER=$(echo "$GITHUB_REPOSITORY" | cut -d'/' -f1)
REPO_NAME=$(echo "$GITHUB_REPOSITORY" | cut -d'/' -f2)

if [ -z "$REPO_OWNER" ] || [ -z "$REPO_NAME" ]; then
    log_error "GITHUB_REPOSITORY environment variable is required"
    exit 1
fi

log "Creating deployment release for $ENVIRONMENT environment..."

# Create release tag name
RELEASE_TAG="deploy/$ENVIRONMENT/$(date +%Y%m%d-%H%M%S)"
RELEASE_TITLE="$ENVIRONMENT Deployment - $(date +%Y-%m-%d\ %H:%M:%S\ UTC)"

# Create release body
RELEASE_BODY=$(cat <<EOF
## $ENVIRONMENT Deployment

**Deployment Time:** $DEPLOYMENT_TIME
**Commit Hash:** \`$COMMIT_HASH\`
**Deployment ID:** $DEPLOYMENT_ID
**Workflow Run ID:** $WORKFLOW_RUN_ID
**Environment:** $ENVIRONMENT

### Deployment Details

- **Repository:** $REPO_OWNER/$REPO_NAME
- **Branch:** $GITHUB_REF_NAME
- **Triggered by:** $GITHUB_ACTOR
- **Workflow:** $GITHUB_WORKFLOW

### Links

- **Commit:** https://github.com/$REPO_OWNER/$REPO_NAME/commit/$COMMIT_HASH
- **Workflow Run:** https://github.com/$REPO_OWNER/$REPO_NAME/actions/runs/$WORKFLOW_RUN_ID
- **Deployment:** https://github.com/$REPO_OWNER/$REPO_NAME/deployments/$DEPLOYMENT_ID

### Notes

This release was automatically created by the deployment workflow to track deployment history.
EOF
)

# Create the release using GitHub API
log "Creating GitHub release with tag: $RELEASE_TAG"

RESPONSE=$(curl -s -w "%{http_code}" -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  -d "{
    \"tag_name\": \"$RELEASE_TAG\",
    \"target_commitish\": \"$COMMIT_HASH\",
    \"name\": \"$RELEASE_TITLE\",
    \"body\": $(echo "$RELEASE_BODY" | jq -Rs .),
    \"draft\": false,
    \"prerelease\": false
  }" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases")

# Extract HTTP status code and response body
HTTP_STATUS="${RESPONSE: -3}"
RESPONSE_BODY="${RESPONSE%???}"

if [ "$HTTP_STATUS" = "201" ]; then
    RELEASE_ID=$(echo "$RESPONSE_BODY" | jq -r '.id')
    RELEASE_URL=$(echo "$RESPONSE_BODY" | jq -r '.html_url')

    log_success "Created deployment release successfully"
    log "  Release ID: $RELEASE_ID"
    log "  Release URL: $RELEASE_URL"
    log "  Tag: $RELEASE_TAG"

    # Output release info for use in workflows
    echo "release_id=$RELEASE_ID" >> $GITHUB_OUTPUT
    echo "release_url=$RELEASE_URL" >> $GITHUB_OUTPUT
    echo "release_tag=$RELEASE_TAG" >> $GITHUB_OUTPUT

else
    log_error "Failed to create release. HTTP Status: $HTTP_STATUS"
    log_error "Response: $RESPONSE_BODY"
    exit 1
fi

log_success "Deployment release created successfully"
