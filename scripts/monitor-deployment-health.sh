#!/bin/bash

# Deployment Health Monitoring Script
# Usage: ./scripts/monitor-deployment-health.sh <url> [options]

set -e

# Source shared utilities
source "$(dirname "$0")/script-utils.sh"

# Parse arguments
MONITOR_URL=""
INTERVAL=60
DURATION=300
VERBOSE=false
ALERT_EMAIL=""
SLACK_WEBHOOK=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --url)
            MONITOR_URL="$2"
            shift 2
            ;;
        --interval)
            INTERVAL="$2"
            shift 2
            ;;
        --duration)
            DURATION="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --alert-email)
            ALERT_EMAIL="$2"
            shift 2
            ;;
        --slack-webhook)
            SLACK_WEBHOOK="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 --url <url> [options]"
            echo ""
            echo "Options:"
            echo "  --url <url>           Deployment URL to monitor"
            echo "  --interval <seconds>  Check interval (default: 60)"
            echo "  --duration <seconds>  Total monitoring duration (default: 300)"
            echo "  --verbose             Enable verbose output"
            echo "  --alert-email <email> Email for alerts"
            echo "  --slack-webhook <url> Slack webhook for alerts"
            echo "  --help                Show this help message"
            exit 0
            ;;
        *)
            if [ -z "$MONITOR_URL" ]; then
                MONITOR_URL="$1"
            else
                log_error "Unknown option: $1"
                exit 1
            fi
            shift
            ;;
    esac
done

# Validate required parameters
if [ -z "$MONITOR_URL" ]; then
    log_error "Deployment URL is required"
    echo "Usage: $0 --url <url> [options]"
    exit 1
fi

# Validate URL format
if [[ ! "$MONITOR_URL" =~ ^https?:// ]]; then
    log_error "Invalid URL format: $MONITOR_URL"
    exit 1
fi

show_header "Deployment Health Monitoring"

log_info "🔍 Monitoring deployment: $MONITOR_URL"
log_info "⏰ Check interval: $INTERVAL seconds"
log_info "⏱️  Duration: $DURATION seconds"

# Initialize monitoring variables
local start_time=$(date +%s)
local end_time=$((start_time + DURATION))
local check_count=0
local success_count=0
local failure_count=0
local last_status="unknown"

# Health check function
check_deployment_health() {
    local url="$1"
    local check_number="$2"

    log_info "Check #$check_number: Testing $url"

    # Test basic connectivity
    local http_code=$(curl -s -w "%{http_code}" --max-time 30 "$url" -o /dev/null 2>/dev/null || echo "000")

    if [ "$http_code" = "200" ]; then
        log_success "✅ Health check passed (HTTP $http_code)"
        return 0
    elif [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
        log_warning "⚠️ Health check requires authentication (HTTP $http_code)"
        return 0  # This is acceptable for protected endpoints
    else
        log_error "❌ Health check failed (HTTP $http_code)"
        return 1
    fi
}

# Send alert function
send_alert() {
    local message="$1"
    local status="$2"

    # Send email alert
    if [ -n "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "Deployment Health Alert: $status" "$ALERT_EMAIL" 2>/dev/null || true
    fi

    # Send Slack alert
    if [ -n "$SLACK_WEBHOOK" ]; then
        local color="good"
        if [ "$status" = "DOWN" ]; then
            color="danger"
        elif [ "$status" = "DEGRADED" ]; then
            color="warning"
        fi

        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\", \"attachments\":[{\"color\":\"$color\", \"text\":\"Status: $status\"}]}" \
            "$SLACK_WEBHOOK" 2>/dev/null || true
    fi
}

# Main monitoring loop
log_info "🚀 Starting health monitoring..."

while [ $(date +%s) -lt $end_time ]; do
    ((check_count++))
    local current_time=$(date +%s)
    local elapsed=$((current_time - start_time))
    local remaining=$((end_time - current_time))

    log_info "⏰ Elapsed: ${elapsed}s, Remaining: ${remaining}s"

    if check_deployment_health "$MONITOR_URL" "$check_count"; then
        ((success_count++))
        if [ "$last_status" != "UP" ]; then
            log_success "🟢 Deployment is UP"
            last_status="UP"
        fi
    else
        ((failure_count++))
        if [ "$last_status" != "DOWN" ]; then
            log_error "🔴 Deployment is DOWN"
            send_alert "Deployment health check failed for $MONITOR_URL" "DOWN"
            last_status="DOWN"
        fi
    fi

    # Calculate success rate
    local success_rate=0
    if [ $check_count -gt 0 ]; then
        success_rate=$((success_count * 100 / check_count))
    fi

    log_info "📊 Success rate: $success_rate% ($success_count/$check_count)"

    # Check if we should continue
    if [ $remaining -gt 0 ]; then
        log_info "⏳ Waiting $INTERVAL seconds for next check..."
        sleep $INTERVAL
    fi
done

# Final summary
show_footer "Monitoring Summary"

log_info "📊 Final Statistics:"
echo "  Total checks: $check_count"
echo "  Successful: $success_count"
echo "  Failed: $failure_count"
echo "  Success rate: $((success_count * 100 / check_count))%"

# Determine overall status
local overall_status="UNKNOWN"
if [ $failure_count -eq 0 ]; then
    overall_status="HEALTHY"
    log_success "🎉 Deployment is healthy!"
elif [ $success_count -gt $failure_count ]; then
    overall_status="DEGRADED"
    log_warning "⚠️ Deployment is degraded but mostly functional"
else
    overall_status="UNHEALTHY"
    log_error "❌ Deployment is unhealthy"
fi

echo "  Overall status: $overall_status"

# Send final alert if unhealthy
if [ "$overall_status" = "UNHEALTHY" ]; then
    send_alert "Deployment monitoring completed. Status: $overall_status. Success rate: $((success_count * 100 / check_count))%" "$overall_status"
fi

log_success "🏁 Monitoring completed!"
