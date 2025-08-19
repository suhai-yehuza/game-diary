#!/bin/bash

# Manual Preview Deployment Script
# This script helps trigger preview deployments manually when needed

set -e

echo "🚀 Manual Preview Deployment Helper"
echo "=================================="

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if we have the GitHub CLI installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if we're authenticated with GitHub
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub"
    echo "Please run: gh auth login"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check if we're on a feature branch
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" || "$CURRENT_BRANCH" == "staging" ]]; then
    echo "⚠️  Warning: You're on the $CURRENT_BRANCH branch"
    echo "Preview deployments are typically for feature branches"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled"
        exit 1
    fi
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "It's recommended to commit your changes before deploying"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled"
        exit 1
    fi
fi

echo ""
echo "🔧 Triggering manual preview deployment..."
echo "This will:"
echo "  - Run all validation checks"
echo "  - Deploy to Vercel preview environment"
echo "  - Comment on any open PRs with the preview URL"
echo ""

# Trigger the workflow with deploy-to-vercel=true
gh workflow run preview.yml --field deploy-to-vercel=true

echo ""
echo "✅ Preview deployment triggered!"
echo ""
echo "📊 You can monitor the progress at:"
echo "   https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"
echo ""
echo "💡 Tips:"
echo "   - The deployment will take a few minutes to complete"
echo "   - You'll get a comment on any open PRs with the preview URL"
echo "   - Preview deployments are automatically cleaned up when PRs are closed"
echo ""
