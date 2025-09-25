#!/bin/bash

# Enhanced Workflows Setup Script
# Usage: ./scripts/setup-enhanced-workflows.sh [options]

set -e

# Source shared utilities
source "$(dirname "$0")/script-utils.sh"

# Parse arguments
BACKUP=true
REPLACE_WORKFLOWS=true
TEST_SCRIPTS=true
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-backup)
            BACKUP=false
            shift
            ;;
        --no-replace)
            REPLACE_WORKFLOWS=false
            shift
            ;;
        --no-test)
            TEST_SCRIPTS=false
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --no-backup      Skip creating backup files"
            echo "  --no-replace     Skip replacing workflows"
            echo "  --no-test        Skip testing scripts"
            echo "  --verbose        Enable verbose output"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

show_header "Enhanced Workflows Setup"

log_info "🚀 Setting up enhanced GitHub Actions workflows..."

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    log_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Step 1: Create backups
if [ "$BACKUP" = true ]; then
    log_info "📦 Creating backup files..."

    if [ -f ".github/workflows/production.yml" ]; then
        cp .github/workflows/production.yml .github/workflows/production-backup-$(date +%Y%m%d-%H%M%S).yml
        log_success "✅ Backed up production.yml"
    fi

    if [ -f ".github/workflows/deploy-and-verify.yml" ]; then
        cp .github/workflows/deploy-and-verify.yml .github/workflows/deploy-and-verify-backup-$(date +%Y%m%d-%H%M%S).yml
        log_success "✅ Backed up deploy-and-verify.yml"
    fi
fi

# Step 2: Replace workflows
if [ "$REPLACE_WORKFLOWS" = true ]; then
    log_info "🔄 Replacing workflows with enhanced versions..."

    if [ -f ".github/workflows/production-improved.yml" ]; then
        cp .github/workflows/production-improved.yml .github/workflows/production.yml
        log_success "✅ Replaced production.yml with enhanced version"
    else
        log_error "❌ production-improved.yml not found"
        exit 1
    fi

    if [ -f ".github/workflows/deploy-and-verify-improved.yml" ]; then
        cp .github/workflows/deploy-and-verify-improved.yml .github/workflows/deploy-and-verify.yml
        log_success "✅ Replaced deploy-and-verify.yml with enhanced version"
    else
        log_error "❌ deploy-and-verify-improved.yml not found"
        exit 1
    fi
fi

# Step 3: Make scripts executable
log_info "🔧 Making scripts executable..."
chmod +x scripts/troubleshoot-deployment.sh
chmod +x scripts/validation/deployment-validate-enhanced.sh
chmod +x scripts/monitor-deployment-health.sh
log_success "✅ Scripts are now executable"

# Step 4: Test scripts
if [ "$TEST_SCRIPTS" = true ]; then
    log_info "🧪 Testing enhanced scripts..."

    # Test troubleshooting script
    log_info "Testing troubleshooting script..."
    if ./scripts/troubleshoot-deployment.sh --check-secrets >/dev/null 2>&1; then
        log_success "✅ Troubleshooting script works"
    else
        log_warning "⚠️ Troubleshooting script has issues (expected - secrets not set locally)"
    fi

    # Test validation script
    log_info "Testing validation script..."
    if ./scripts/validation/deployment-validate-enhanced.sh --help >/dev/null 2>&1; then
        log_success "✅ Enhanced validation script works"
    else
        log_error "❌ Enhanced validation script has issues"
    fi

    # Test monitoring script
    log_info "Testing monitoring script..."
    if ./scripts/monitor-deployment-health.sh --help >/dev/null 2>&1; then
        log_success "✅ Health monitoring script works"
    else
        log_error "❌ Health monitoring script has issues"
    fi
fi

# Step 5: Show next steps
show_footer "Setup Complete"

log_success "🎉 Enhanced workflows setup completed!"

echo ""
log_info "📋 Next Steps:"
echo ""
echo "1. 🔐 Configure GitHub Secrets:"
echo "   - Go to your GitHub repository"
echo "   - Navigate to Settings > Secrets and variables > Actions"
echo "   - Add all required secrets (see IMPLEMENTATION_GUIDE.md)"
echo ""
echo "2. 🧪 Test the setup:"
echo "   ./scripts/troubleshoot-deployment.sh --full"
echo ""
echo "3. 🚀 Run a test deployment:"
echo "   - Go to GitHub Actions"
echo "   - Run the Production Deployment workflow"
echo "   - Enable debug mode for detailed output"
echo ""
echo "4. 📊 Monitor deployment health:"
echo "   ./scripts/monitor-deployment-health.sh --url https://your-deployment-url.com"
echo ""

log_info "💡 For detailed instructions, see IMPLEMENTATION_GUIDE.md"
log_success "🎯 Ready to deploy with enhanced reliability!"
