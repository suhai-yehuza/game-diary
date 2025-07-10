#!/bin/bash

# Deployment Manager Script
# Manages automated deployments with staging soak periods and production rollouts

# Configuration
DEFAULT_LOCALHOST_URL="${DEFAULT_LOCALHOST_URL:-http://localhost:3000}"
DEPLOY_CONFIG_DIR="./.deploy"
DEPLOY_STATUS_FILE="$DEPLOY_CONFIG_DIR/status.json"
DEPLOY_HISTORY_FILE="$DEPLOY_CONFIG_DIR/history.json"
AUTO_DEPLOY_DELAY=86400  # 24 hours in seconds

# Ensure deployment directory exists
init_deploy_dir() {
    mkdir -p "$DEPLOY_CONFIG_DIR"
}
init_deploy_dir

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Helper functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$DEPLOY_LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1" | tee -a "$DEPLOY_LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1" | tee -a "$DEPLOY_LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1" | tee -a "$DEPLOY_LOG_FILE"
}

log_info() {
    echo -e "${PURPLE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️${NC} $1" | tee -a "$DEPLOY_LOG_FILE"
}

# Get deployment URL based on environment
get_deployment_url() {
    local environment=$1

    case "$environment" in
        "preview")
            echo "${VERCEL_PREVIEW_URL:-$DEFAULT_LOCALHOST_URL}"
            ;;
        "staging")
            echo "${VERCEL_STAGING_URL:-$DEFAULT_LOCALHOST_URL}"
            ;;
        "staging-soak")
            echo "${VERCEL_STAGING_URL:-$DEFAULT_LOCALHOST_URL}"
            ;;
        "production")
            echo "${VERCEL_PRODUCTION_URL:-$DEFAULT_LOCALHOST_URL}"
            ;;
        *)
            echo "$DEFAULT_LOCALHOST_URL"
            ;;
    esac
}

# Check if staging deployment is ready for production
check_staging_readiness() {
    local soak_status_file="./.soak/status.json"

    if [ ! -f "$soak_status_file" ]; then
        log_warning "No soak status found - staging may not be ready"
        return 1
    fi

    local status=$(cat "$soak_status_file" | jq -r '.status')
    local final_metrics=$(cat "$soak_status_file" | jq -r '.final_metrics // empty')

    if [ "$status" = "completed" ] && [ -n "$final_metrics" ]; then
        local error_rate=$(echo "$final_metrics" | jq -r '.error_rate')
        local avg_response_time=$(echo "$final_metrics" | jq -r '.avg_response_time')

        # Check if metrics are within acceptable ranges
        if [ "$(echo "$error_rate <= 0.05" | bc -l 2>/dev/null || echo "0")" = "1" ] && \
           [ "$(echo "$avg_response_time <= 5000" | bc -l 2>/dev/null || echo "0")" = "1" ]; then
            log_success "Staging deployment is ready for production"
            return 0
        else
            log_warning "Staging metrics not acceptable for production: error_rate=$error_rate, avg_response_time=$avg_response_time"
            return 1
        fi
    else
        log_warning "Staging soak period not completed successfully"
        return 1
    fi
}

# Get current deployment status
get_deployment_status() {
    if [ ! -f "$DEPLOY_STATUS_FILE" ]; then
        echo "{\"status\":\"no_deployment\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"
        return
    fi

    cat "$DEPLOY_STATUS_FILE"
}

# Update deployment status
update_deployment_status() {
    local status=$1
    local environment=$2
    local reason=${3:-""}
    local deployment_id=${4:-""}

    local status_data="{\"status\":\"$status\",\"environment\":\"$environment\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"reason\":\"$reason\",\"deployment_id\":\"$deployment_id\"}"

    echo "$status_data" > "$DEPLOY_STATUS_FILE"
    log "Deployment status updated: $status"
}

# Add to deployment history
add_to_history() {
    local action=$1
    local environment=$2
    local details=$3

    local history_entry="{\"action\":\"$action\",\"environment\":\"$environment\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"details\":\"$details\"}"

    if [ ! -f "$DEPLOY_HISTORY_FILE" ]; then
        echo "[$history_entry]" > "$DEPLOY_HISTORY_FILE"
    else
        # Add to existing array
        sed -i '' 's/\]$/,/' "$DEPLOY_HISTORY_FILE" 2>/dev/null || sed -i 's/\]$/,/' "$DEPLOY_HISTORY_FILE"
        echo "$history_entry]" >> "$DEPLOY_HISTORY_FILE"
    fi
}

# Schedule auto-deployment to production
schedule_auto_deploy() {
    local staging_deploy_time=$(date +%s)
    local prod_deploy_time=$((staging_deploy_time + AUTO_DEPLOY_DELAY))
    # Cross-platform date formatting: Linux (CI) first, then macOS fallback
    local prod_deploy_date=$(date -u -d "@$prod_deploy_time" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -r "$prod_deploy_time" +%Y-%m-%dT%H:%M:%SZ)

    log_info "Scheduling auto-deployment to production for: $prod_deploy_date"

    # Create a scheduled deployment record
    local schedule_data="{\"scheduled\":true,\"staging_deploy_time\":\"$(date -u -d "@$staging_deploy_time" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -r "$staging_deploy_time" +%Y-%m-%dT%H:%M:%SZ)\",\"prod_deploy_time\":\"$prod_deploy_date\",\"status\":\"scheduled\"}"

    echo "$schedule_data" > "$DEPLOY_CONFIG_DIR/auto_deploy_schedule.json"
    update_deployment_status "scheduled" "production" "Auto-deployment scheduled 24hrs after staging"

    add_to_history "schedule_auto_deploy" "production" "Scheduled for $prod_deploy_date"

    log_success "Auto-deployment to production scheduled for $prod_deploy_date"
}

# Check if auto-deployment is due
check_auto_deploy_due() {
    local schedule_file="$DEPLOY_CONFIG_DIR/auto_deploy_schedule.json"

    if [ ! -f "$schedule_file" ]; then
        return 1
    fi

    local scheduled_time=$(cat "$schedule_file" | jq -r '.prod_deploy_time')
    local current_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)

    # Convert to timestamps for comparison - cross-platform: Linux (CI) first, then macOS fallback
    local scheduled_timestamp=$(date -d "$scheduled_time" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$scheduled_time" +%s 2>/dev/null || date -r "$scheduled_time" +%s 2>/dev/null || echo "0")
    local current_timestamp=$(date -d "$current_time" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$current_time" +%s 2>/dev/null || date -r "$current_time" +%s 2>/dev/null || echo "0")

    if [ "$scheduled_timestamp" != "0" ] && [ "$current_timestamp" != "0" ] && [ $current_timestamp -ge $scheduled_timestamp ]; then
        return 0
    else
        return 1
    fi
}

# Perform production deployment
deploy_to_production() {
    local reason=${1:-"Manual deployment"}

    log_info "Starting production deployment: $reason"
    update_deployment_status "deploying" "production" "$reason"

    # Generate deployment ID
    local deployment_id="prod-$(date +%Y%m%d-%H%M%S)"

    # Here you would implement the actual deployment logic
    # For Vercel, this might involve:
    # 1. Pull production environment info
    # 2. Build project artifacts
    # 3. Deploy to production

    log "Deploying to production with ID: $deployment_id"

    # Simulate deployment process
    sleep 2

    # Update status with deployment ID
    update_deployment_status "deployed" "production" "$reason" "$deployment_id"

    add_to_history "deploy" "production" "Deployment $deployment_id: $reason"

    log_success "Production deployment completed: $deployment_id"

    # Clear auto-deploy schedule
    rm -f "$DEPLOY_CONFIG_DIR/auto_deploy_schedule.json"

    return 0
}

# Perform rollback
perform_rollback() {
    local environment=${1:-"production"}
    local reason=${2:-"Manual rollback"}

    log_warning "Initiating rollback for $environment: $reason"
    update_deployment_status "rolling_back" "$environment" "$reason"

    # Here you would implement the actual rollback logic
    # For Vercel, this might involve reverting to a previous deployment

    log "Rolling back $environment deployment..."

    # Simulate rollback process
    sleep 2

    update_deployment_status "rolled_back" "$environment" "$reason"
    add_to_history "rollback" "$environment" "$reason"

    log_success "Rollback completed for $environment"

    return 0
}

# Show deployment status
show_deployment_status() {
    local status=$(get_deployment_status)
    local current_status=$(echo "$status" | jq -r '.status')

    echo "=== Deployment Status ==="
    echo "Current Status: $current_status"
    echo "Environment: $(echo "$status" | jq -r '.environment // "unknown"')"
    echo "Timestamp: $(echo "$status" | jq -r '.timestamp // "unknown"')"
    echo "Reason: $(echo "$status" | jq -r '.reason // "unknown"')"
    echo "Deployment ID: $(echo "$status" | jq -r '.deployment_id // "unknown"')"

    # Check auto-deploy schedule
    local schedule_file="$DEPLOY_CONFIG_DIR/auto_deploy_schedule.json"
    if [ -f "$schedule_file" ]; then
        echo ""
        echo "=== Auto-Deploy Schedule ==="
        local scheduled_time=$(cat "$schedule_file" | jq -r '.prod_deploy_time')
        echo "Scheduled Production Deploy: $scheduled_time"

        local current_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
        local scheduled_timestamp=$(date -d "$scheduled_time" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$scheduled_time" +%s 2>/dev/null || date -r "$scheduled_time" +%s 2>/dev/null || echo "0")
        local current_timestamp=$(date -d "$current_time" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$current_time" +%s 2>/dev/null || date -r "$current_time" +%s 2>/dev/null || echo "0")
        local time_remaining=$((scheduled_timestamp - current_timestamp))

        if [ $time_remaining -gt 0 ]; then
            local hours=$((time_remaining / 3600))
            local minutes=$(((time_remaining % 3600) / 60))
            echo "Time Remaining: ${hours}h ${minutes}m"
        else
            echo "Status: OVERDUE"
        fi
    fi

    # Check staging readiness
    echo ""
    echo "=== Staging Readiness ==="
    if check_staging_readiness; then
        echo "Staging: ✅ Ready for production"
    else
        echo "Staging: ❌ Not ready for production"
    fi
}

# Show deployment history
show_deployment_history() {
    if [ ! -f "$DEPLOY_HISTORY_FILE" ]; then
        echo "No deployment history found"
        return
    fi

    echo "=== Deployment History ==="
    cat "$DEPLOY_HISTORY_FILE" | jq -r '.[] | "\(.timestamp) [\(.action)] \(.environment): \(.details)"' | tail -10
}

# Auto-deployment check (for cron jobs)
auto_deploy_check() {
    if check_auto_deploy_due; then
        log_info "Auto-deployment is due - checking staging readiness"

        if check_staging_readiness; then
            log_info "Staging is ready - proceeding with auto-deployment"
            deploy_to_production "Auto-deployment after 48hr soak period"
        else
            log_warning "Staging not ready - skipping auto-deployment"
            # Reschedule for later
            local new_time=$(( $(date +%s) + 3600 ))  # 1 hour later
            local new_date=$(date -u -d "@$new_time" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -r "$new_time" +%Y-%m-%dT%H:%M:%SZ)

            local schedule_data="{\"scheduled\":true,\"prod_deploy_time\":\"$new_date\",\"status\":\"rescheduled\"}"
            echo "$schedule_data" > "$DEPLOY_CONFIG_DIR/auto_deploy_schedule.json"

            log_info "Auto-deployment rescheduled for $new_date"
        fi
    else
        log_info "Auto-deployment not due yet"
    fi
}

# Main script logic
case "${1:-}" in
    "auto-deploy")
        if [ "$2" = "check" ]; then
            auto_deploy_check
        else
            schedule_auto_deploy
        fi
        ;;
    "manual-deploy")
        deploy_to_production "${2:-Manual deployment}"
        ;;
    "rollback")
        perform_rollback "${2:-production}" "${3:-Manual rollback}"
        ;;
    "status")
        show_deployment_status
        ;;
    "history")
        show_deployment_history
        ;;
    "list")
        show_deployment_status
        echo ""
        show_deployment_history
        ;;
    *)
        echo "Usage: $0 [auto-deploy|manual-deploy|rollback|status|history|list] [environment] [reason]"
        echo ""
        echo "Commands:"
        echo "  auto-deploy [check]     - Schedule or check auto-deployment"
        echo "  manual-deploy [reason]  - Deploy to production immediately"
        echo "  rollback [env] [reason] - Rollback deployment"
        echo "  status                  - Show current deployment status"
        echo "  history                 - Show deployment history"
        echo "  list                    - Show status and history"
        echo ""
        echo "Examples:"
        echo "  $0 auto-deploy                    # Schedule auto-deployment"
        echo "  $0 auto-deploy check              # Check if auto-deployment is due"
        echo "  $0 manual-deploy \"Hotfix\"        # Deploy immediately"
        echo "  $0 rollback production \"Bug fix\" # Rollback production"
        echo "  $0 status                         # Show current status"
        exit 1
        ;;
esac
