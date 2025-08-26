#!/bin/bash

# Script to get latest deployment information from GitHub releases
# Usage: ./scripts/get-latest-deployment.sh <environment> [field]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Validate arguments
if [ $# -lt 1 ] || [ $# -gt 2 ]; then
    log_error "Usage: $0 <environment> [field]"
    log_error "Environment: staging or production"
    log_error "Field (optional): commit_hash, deployment_id, workflow_run_id, tag_name, or all"
    log_error "Example: $0 production commit_hash"
    log_error "Example: $0 staging all"
    exit 1
fi

ENVIRONMENT="$1"
FIELD="${2:-all}"

# Validate environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    log_error "Environment must be 'staging' or 'production', got: $ENVIRONMENT"
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

log "Getting latest $ENVIRONMENT deployment from GitHub releases..."

# Get the latest release for the environment
RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases?per_page=100")

# Filter releases by environment and get the latest one
LATEST_RELEASE=$(echo "$RESPONSE" | jq -r --arg env "$ENVIRONMENT" '
  [.[] | select(.tag_name | startswith("deploy/" + $env + "/"))] |
  sort_by(.created_at) |
  reverse |
  .[0] // empty
')

if [ "$LATEST_RELEASE" = "null" ] || [ -z "$LATEST_RELEASE" ]; then
    log_error "No deployment releases found for $ENVIRONMENT environment"
    exit 1
fi

# Extract information from the release
TAG_NAME=$(echo "$LATEST_RELEASE" | jq -r '.tag_name')
RELEASE_ID=$(echo "$LATEST_RELEASE" | jq -r '.id')
CREATED_AT=$(echo "$LATEST_RELEASE" | jq -r '.created_at')
TARGET_COMMITISH=$(echo "$LATEST_RELEASE" | jq -r '.target_commitish')

# Parse deployment information from release body
RELEASE_BODY=$(echo "$LATEST_RELEASE" | jq -r '.body')

# Extract deployment details using regex
DEPLOYMENT_ID=$(echo "$RELEASE_BODY" | grep -o 'Deployment ID: [0-9]*' | cut -d' ' -f3)
WORKFLOW_RUN_ID=$(echo "$RELEASE_BODY" | grep -o 'Workflow Run ID: [0-9]*' | cut -d' ' -f4)

# Get specific field or all information
if [ "$FIELD" = "all" ]; then
    log_success "Latest $ENVIRONMENT deployment information:"
    echo "Tag Name: $TAG_NAME"
    echo "Release ID: $RELEASE_ID"
    echo "Created At: $CREATED_AT"
    echo "Commit Hash: $TARGET_COMMITISH"
    echo "Deployment ID: $DEPLOYMENT_ID"
    echo "Workflow Run ID: $WORKFLOW_RUN_ID"

elif [ "$FIELD" = "commit_hash" ]; then
    echo "$TARGET_COMMITISH"

elif [ "$FIELD" = "deployment_id" ]; then
    echo "$DEPLOYMENT_ID"

elif [ "$FIELD" = "workflow_run_id" ]; then
    echo "$WORKFLOW_RUN_ID"

elif [ "$FIELD" = "tag_name" ]; then
    echo "$TAG_NAME"

else
    log_error "Invalid field: $FIELD"
    log_error "Valid fields: commit_hash, deployment_id, workflow_run_id, tag_name, all"
    exit 1
fi
