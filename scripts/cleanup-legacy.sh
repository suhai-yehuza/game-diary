#!/bin/bash

# Legacy Script Cleanup Utility
# This script identifies and helps clean up legacy scripts and package.json entries

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

# Legacy scripts that can be removed
LEGACY_SCRIPTS=(
    "scripts/ci-runner.sh"
    "scripts/ci-quality-gate.sh"
    "scripts/ci-unit-tests.sh"
    "scripts/ci-e2e-tests.sh"
    "scripts/e2e-run.sh"
    "scripts/validation-run.sh"
    "scripts/deployment-manager.sh"
    "scripts/soak-monitor.sh"
    "scripts/test-soak.sh"
    "scripts/e2e-debug.sh"
    "scripts/e2e-optimize.sh"
    "scripts/e2e-compound-runner.sh"
    "scripts/e2e-coverage-report.ts"
    "scripts/coverage-enforcement.ts"
    "scripts/pre-commit-validation.sh"
    "scripts/pre-push-coverage.sh"
    "scripts/pre-push-validation.sh"
    "scripts/timed-run.sh"
    "scripts/run-failing.sh"
    "scripts/generate-test-results.sh"
    "scripts/print-coverage-link.cjs"
    "scripts/rename-to-kebab-case.sh"
    "scripts/fix-game-ratings-trigger.sql"
)

# Legacy package.json scripts that can be removed
LEGACY_PACKAGE_SCRIPTS=(
    "ci:preview:legacy"
    "ci:staging:legacy"
    "ci:production:legacy"
    "ci:quality-gate:legacy"
    "ci:unit-tests:legacy"
    "ci:e2e-tests:legacy"
    "ci:e2e:run:legacy"
    "ci:e2e:run:coverage:legacy"
    "ci:e2e:run:coverage:full:legacy"
    "ci:e2e:responsive:legacy"
    "ci:e2e:debug:legacy"
    "ci:validation:basic:legacy"
    "ci:validation:dev:legacy"
    "ci:validation:full:legacy"
    "ci:validation:staging:legacy"
    "ci:validation:production:legacy"
    "soak:start:legacy"
    "soak:monitor:legacy"
    "soak:rollback:legacy"
    "soak:status:legacy"
    "soak:test:legacy"
    "deploy:auto:legacy"
    "deploy:auto:check:legacy"
    "deploy:manual:legacy"
    "deploy:rollback:legacy"
    "deploy:status:legacy"
    "deploy:history:legacy"
    "deploy:list:legacy"
    "test:ci:legacy"
)

# Function to check if a file exists
file_exists() {
    local file="$1"
    if [ -f "$file" ]; then
        return 0
    else
        return 1
    fi
}

# Function to check if a script is referenced in package.json
script_referenced_in_package() {
    local script_name="$1"
    if grep -q "\"$script_name\"" package.json; then
        return 0
    else
        return 1
    fi
}

# Function to analyze legacy scripts
analyze_legacy_scripts() {
    log "🔍 Analyzing legacy scripts..."

    local total_legacy=0
    local referenced=0
    local unreferenced=0

    for script in "${LEGACY_SCRIPTS[@]}"; do
        if file_exists "$script"; then
            total_legacy=$((total_legacy + 1))
            if script_referenced_in_package "$(basename "$script" .sh)"; then
                log_warning "  📄 $script (referenced in package.json)"
                referenced=$((referenced + 1))
            else
                log "  📄 $script (unreferenced)"
                unreferenced=$((unreferenced + 1))
            fi
        fi
    done

    echo ""
    log_success "Analysis complete:"
    echo "  - Total legacy scripts: $total_legacy"
    echo "  - Referenced in package.json: $referenced"
    echo "  - Unreferenced: $unreferenced"
}

# Function to analyze legacy package.json scripts
analyze_legacy_package_scripts() {
    log "🔍 Analyzing legacy package.json scripts..."

    local total_legacy=0
    local found=0

    for script in "${LEGACY_PACKAGE_SCRIPTS[@]}"; do
        if script_referenced_in_package "$script"; then
            log_warning "  📦 $script"
            found=$((found + 1))
        fi
        total_legacy=$((total_legacy + 1))
    done

    echo ""
    log_success "Analysis complete:"
    echo "  - Total legacy package scripts: $total_legacy"
    echo "  - Found in package.json: $found"
}

# Function to show cleanup recommendations
show_cleanup_recommendations() {
    log "💡 Cleanup Recommendations:"
    echo ""
    echo "1. Remove unreferenced legacy scripts:"
    for script in "${LEGACY_SCRIPTS[@]}"; do
        if file_exists "$script" && ! script_referenced_in_package "$(basename "$script" .sh)"; then
            echo "   rm $script"
        fi
    done

    echo ""
    echo "2. Remove legacy package.json scripts:"
    for script in "${LEGACY_PACKAGE_SCRIPTS[@]}"; do
        if script_referenced_in_package "$script"; then
            echo "   Remove: \"$script\": \"...\""
        fi
    done

    echo ""
    echo "3. Consolidate CI workflows:"
    echo "   - Use .github/workflows/reusable-deployment.yml"
    echo "   - Remove duplicate code from staging.yml, production.yml, etc."
    echo "   - Use reusable workflow templates"

    echo ""
    echo "4. Simplify script organization:"
    echo "   - Keep only essential scripts in package.json"
    echo "   - Use scripts/ci.sh as the main CI entry point"
    echo "   - Use scripts/deployment-validator.sh for deployment validation"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  analyze     - Analyze legacy scripts and package.json entries"
    echo "  recommend   - Show cleanup recommendations"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 analyze"
    echo "  $0 recommend"
}

# Main script logic
case "${1:-help}" in
    "analyze")
        analyze_legacy_scripts
        echo ""
        analyze_legacy_package_scripts
        ;;
    "recommend")
        show_cleanup_recommendations
        ;;
    "help"|*)
        show_usage
        ;;
esac
