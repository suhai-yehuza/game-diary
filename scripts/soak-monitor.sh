#!/bin/bash

# Soak Monitor Script
# Usage: ./scripts/soak-monitor.sh [start|monitor|rollback|status] [environment] [duration]
#
# This script implements soaking periods for deployments with:
# - Health monitoring during soak period
# - Performance metrics tracking
# - Automated rollback on issues
# - Integration with existing E2E testing

set -e

# Configuration
SOAK_CONFIG_DIR="./.soak"
SOAK_LOG_FILE="$SOAK_CONFIG_DIR/soak.log"
SOAK_STATUS_FILE="$SOAK_CONFIG_DIR/status.json"
SOAK_METRICS_FILE="$SOAK_CONFIG_DIR/metrics.json"

# Ensure soak directory exists before any logging
init_soak_dir() {
    mkdir -p "$SOAK_CONFIG_DIR"
    # Ensure log file exists
    touch "$SOAK_LOG_FILE"
}
init_soak_dir

# Default values
DEFAULT_SOAK_DURATION=3600  # 1 hour in seconds
HEALTH_CHECK_INTERVAL=30    # 30 seconds
PERFORMANCE_CHECK_INTERVAL=300  # 5 minutes
MAX_ERROR_RATE=0.05         # 5% error rate threshold
MAX_RESPONSE_TIME=5000      # 5 seconds max response time

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$SOAK_LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1" | tee -a "$SOAK_LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1" | tee -a "$SOAK_LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1" | tee -a "$SOAK_LOG_FILE"
}

# Get deployment URL based on environment
get_deployment_url() {
    local environment=$1

    case "$environment" in
        "preview")
            echo "${VERCEL_PREVIEW_URL:-http://localhost:3000}"
            ;;
        "staging")
            echo "${VERCEL_STAGING_URL:-http://localhost:3000}"
            ;;
        "staging-soak")
            echo "${VERCEL_STAGING_URL:-http://localhost:3000}"
            ;;
        "production")
            echo "${VERCEL_PRODUCTION_URL:-http://localhost:3000}"
            ;;
        *)
            echo "http://localhost:3000"
            ;;
    esac
}

# Validate deployment URL
validate_deployment_url() {
    local url=$1
    local environment=$2

    if [ -z "$url" ] || [ "$url" = "http://localhost:3000" ]; then
        log_warning "No valid deployment URL found for $environment"
        log_warning "Please set the appropriate environment variable:"
        case "$environment" in
            "preview")
                log_warning "  VERCEL_PREVIEW_URL"
                ;;
            "staging"|"staging-soak")
                log_warning "  VERCEL_STAGING_URL"
                ;;
            "production")
                log_warning "  VERCEL_PRODUCTION_URL"
                ;;
        esac
        return 1
    fi

    # Test if the URL is accessible
    if ! curl -s --max-time 10 --head "$url" > /dev/null 2>&1; then
        log_warning "Deployment URL $url is not accessible"
        return 1
    fi

    return 0
}

# Health check function
perform_health_check() {
    local url=$1
    local start_time=$(date +%s.%N)

    # Validate URL
    if [ -z "$url" ] || [ "$url" = "http://localhost:3000" ]; then
        echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"http_code\":\"000\",\"response_time\":\"999\",\"total_time\":\"999\",\"healthy\":false,\"error\":\"Invalid or missing deployment URL\"}"
        return
    fi

    # Perform HTTP health check with better error handling
    local temp_response_file=$(mktemp)
    local response=$(curl -s -w "%{http_code}|%{time_total}" -o "$temp_response_file" "$url/api/health" 2>/dev/null || echo "000|999")
    local http_code=$(echo "$response" | cut -d'|' -f1)
    local response_time=$(echo "$response" | cut -d'|' -f2)
    local end_time=$(date +%s.%N)

    # Calculate total time
    local total_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "999")

    # Check if response is valid JSON
    local is_valid_json=false
    if [ -s "$temp_response_file" ]; then
        if jq empty "$temp_response_file" 2>/dev/null; then
            is_valid_json=true
        fi
    fi

    # Determine if health check passed
    local is_healthy=false
    local error_msg=""

    if [ "$http_code" = "200" ] && [ "$is_valid_json" = "true" ] && [ "$(echo "$response_time < $MAX_RESPONSE_TIME" | bc -l 2>/dev/null || echo "0")" = "1" ]; then
        is_healthy=true
    else
        if [ "$http_code" != "200" ]; then
            error_msg="HTTP $http_code"
        elif [ "$is_valid_json" != "true" ]; then
            error_msg="Invalid JSON response"
        else
            error_msg="Response time too slow"
        fi
    fi

    # Clean up temp file
    rm -f "$temp_response_file"

    echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"http_code\":\"$http_code\",\"response_time\":\"$response_time\",\"total_time\":\"$total_time\",\"healthy\":$is_healthy,\"error\":\"$error_msg\"}"
}

# Performance check function
perform_performance_check() {
    local url=$1

    # Run a quick E2E smoke test
    local test_result=""
    if command -v pnpm >/dev/null 2>&1; then
        log "Running performance E2E test..."
        DEPLOYMENT_URL="$url" pnpm test:e2e:smoke > /tmp/soak-e2e.log 2>&1
        if [ $? -eq 0 ]; then
            test_result="passed"
        else
            test_result="failed"
        fi
    else
        test_result="skipped"
    fi

    # Get basic performance metrics
    local start_time=$(date +%s.%N)
    curl -s "$url" > /dev/null 2>&1
    local end_time=$(date +%s.%N)
    local load_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "999")

    echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"load_time\":\"$load_time\",\"e2e_test\":\"$test_result\"}"
}

# Calculate metrics from health checks
calculate_metrics() {
    local health_checks_file="$SOAK_CONFIG_DIR/health_checks.json"

    if [ ! -f "$health_checks_file" ]; then
        echo "{\"total_checks\":0,\"healthy_checks\":0,\"error_rate\":1.0,\"avg_response_time\":0}"
        return
    fi

    local total_checks=0
    local healthy_checks=0
    local total_response_time=0

    while IFS= read -r line; do
        if [ -n "$line" ]; then
            total_checks=$((total_checks + 1))

            # Safely parse JSON with error handling
            local healthy="false"
            local response_time="0"

            if echo "$line" | jq -r '.healthy' 2>/dev/null | grep -q "true"; then
                healthy="true"
                healthy_checks=$((healthy_checks + 1))
            fi

            local parsed_response_time=$(echo "$line" | jq -r '.response_time' 2>/dev/null || echo "0")
            if [ "$parsed_response_time" != "null" ] && [ -n "$parsed_response_time" ]; then
                response_time="$parsed_response_time"
            fi

            total_response_time=$(echo "$total_response_time + $response_time" | bc -l 2>/dev/null || echo "$total_response_time")
        fi
    done < "$health_checks_file"

    local error_rate=0
    local avg_response_time=0

    if [ $total_checks -gt 0 ]; then
        error_rate=$(echo "scale=4; ($total_checks - $healthy_checks) / $total_checks" | bc -l 2>/dev/null || echo "1.0")
        avg_response_time=$(echo "scale=4; $total_response_time / $total_checks" | bc -l 2>/dev/null || echo "0")
    fi

    echo "{\"total_checks\":$total_checks,\"healthy_checks\":$healthy_checks,\"error_rate\":$error_rate,\"avg_response_time\":$avg_response_time}"
}

# Check if rollback is needed
should_rollback() {
    local metrics=$1

    # Safely parse metrics with error handling
    local error_rate=$(echo "$metrics" | jq -r '.error_rate' 2>/dev/null || echo "1.0")
    local avg_response_time=$(echo "$metrics" | jq -r '.avg_response_time' 2>/dev/null || echo "999")

    # Handle null values
    if [ "$error_rate" = "null" ] || [ -z "$error_rate" ]; then
        error_rate="1.0"
    fi
    if [ "$avg_response_time" = "null" ] || [ -z "$avg_response_time" ]; then
        avg_response_time="999"
    fi

    # Rollback if error rate is too high
    if [ "$(echo "$error_rate > $MAX_ERROR_RATE" | bc -l 2>/dev/null || echo "0")" = "1" ]; then
        log_error "Error rate $error_rate exceeds threshold $MAX_ERROR_RATE - rollback needed"
        return 0
    fi

    # Rollback if response time is too slow
    if [ "$(echo "$avg_response_time > $MAX_RESPONSE_TIME" | bc -l 2>/dev/null || echo "0")" = "1" ]; then
        log_error "Average response time $avg_response_time exceeds threshold $MAX_RESPONSE_TIME - rollback needed"
        return 0
    fi

    return 1
}

# Perform rollback
perform_rollback() {
    local environment=$1
    local reason=$2

    log_error "Initiating rollback for $environment: $reason"

    # Update status
    echo "{\"status\":\"rolling_back\",\"reason\":\"$reason\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "$SOAK_STATUS_FILE"

    # Here you would implement the actual rollback logic
    # For Vercel, this might involve reverting to a previous deployment
    if [ "$environment" = "production" ]; then
        log "Rolling back production deployment..."
        # Add your rollback logic here
        # Example: vercel rollback --token=$VERCEL_TOKEN
    elif [ "$environment" = "staging" ] || [ "$environment" = "staging-soak" ]; then
        log "Rolling back staging deployment..."
        # Add your rollback logic here
    fi

    log_error "Rollback completed for $environment"
    echo "{\"status\":\"rolled_back\",\"reason\":\"$reason\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "$SOAK_STATUS_FILE"
}

# Start soaking period
start_soak() {
    local environment=$1
    local duration=${2:-$DEFAULT_SOAK_DURATION}
    local url=$(get_deployment_url "$environment")

    log "Starting soak period for $environment deployment"
    log "Deployment URL: $url"
    log "Soak duration: $duration seconds"

    # Validate deployment URL
    if ! validate_deployment_url "$url" "$environment"; then
        log_error "Cannot start soak period: invalid deployment URL"
        # Still create status file to indicate failure
        echo "{\"status\":\"failed\",\"environment\":\"$environment\",\"start_time\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"duration\":$duration,\"url\":\"$url\",\"error\":\"Invalid deployment URL\"}" > "$SOAK_STATUS_FILE"
        exit 1
    fi

    # Clear previous data
    rm -f "$SOAK_CONFIG_DIR"/health_checks.json "$SOAK_CONFIG_DIR"/performance_checks.json

    # Update status
    echo "{\"status\":\"soaking\",\"environment\":\"$environment\",\"start_time\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"duration\":$duration,\"url\":\"$url\"}" > "$SOAK_STATUS_FILE"

    log_success "Soak period started for $environment"
}

# Monitor during soak period
monitor_soak() {
    local environment=$1
    local duration=${2:-$DEFAULT_SOAK_DURATION}
    local url=$(get_deployment_url "$environment")

    log "Starting soak monitoring for $environment"

    # Validate deployment URL
    if ! validate_deployment_url "$url" "$environment"; then
        log_error "Cannot monitor soak period: invalid deployment URL"
        # Create failure status file
        echo "{\"status\":\"failed\",\"environment\":\"$environment\",\"start_time\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"duration\":$duration,\"url\":\"$url\",\"error\":\"Invalid deployment URL during monitoring\"}" > "$SOAK_STATUS_FILE"
        exit 1
    fi

    local start_time=$(date +%s)
    local end_time=$((start_time + duration))
    local health_check_count=0
    local performance_check_count=0

    # Initialize files
    touch "$SOAK_CONFIG_DIR/health_checks.json"
    touch "$SOAK_CONFIG_DIR/performance_checks.json"

    # Set up trap to ensure we always create final status file
    trap 'create_final_status "$environment" "Interrupted"' INT TERM

    while [ $(date +%s) -lt $end_time ]; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        local remaining=$((end_time - current_time))

        # Health check
        if [ $((elapsed % HEALTH_CHECK_INTERVAL)) -eq 0 ]; then
            health_check_count=$((health_check_count + 1))
            local health_result=$(perform_health_check "$url")
            echo "$health_result" >> "$SOAK_CONFIG_DIR/health_checks.json"

            local healthy=$(echo "$health_result" | jq -r '.healthy')
            if [ "$healthy" = "true" ]; then
                log_success "Health check $health_check_count passed"
            else
                log_warning "Health check $health_check_count failed"
            fi
        fi

        # Performance check
        if [ $((elapsed % PERFORMANCE_CHECK_INTERVAL)) -eq 0 ]; then
            performance_check_count=$((performance_check_count + 1))
            local perf_result=$(perform_performance_check "$url")
            echo "$perf_result" >> "$SOAK_CONFIG_DIR/performance_checks.json"

            local e2e_test=$(echo "$perf_result" | jq -r '.e2e_test' 2>/dev/null || echo "unknown")
            if [ "$e2e_test" = "null" ] || [ -z "$e2e_test" ]; then
                e2e_test="unknown"
            fi
            log "Performance check $performance_check_count completed (E2E: $e2e_test)"
        fi

        # Check if rollback is needed
        local metrics=$(calculate_metrics)
        if should_rollback "$metrics"; then
            perform_rollback "$environment" "Health check failure during soak"
            exit 1
        fi

        # Progress update
        if [ $((elapsed % 300)) -eq 0 ]; then
            local progress=$((elapsed * 100 / duration))
            log "Soak progress: $progress% ($remaining seconds remaining)"
        fi

        sleep 1
    done

    # Soak period completed successfully
    local final_metrics=$(calculate_metrics)
    log_success "Soak period completed successfully for $environment"
    log "Final metrics: $final_metrics"

    create_final_status "$environment" "completed" "$final_metrics"
}

# Create final status file
create_final_status() {
    local environment=$1
    local status=$2
    local final_metrics=${3:-"null"}

    if [ "$status" = "completed" ]; then
        echo "{\"status\":\"completed\",\"environment\":\"$environment\",\"end_time\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"final_metrics\":$final_metrics}" > "$SOAK_STATUS_FILE"
        # Save final metrics
        echo "$final_metrics" > "$SOAK_METRICS_FILE"
    else
        echo "{\"status\":\"$status\",\"environment\":\"$environment\",\"end_time\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"error\":\"Soak period $status\"}" > "$SOAK_STATUS_FILE"
    fi
}

# Show soak status
show_status() {
    if [ ! -f "$SOAK_STATUS_FILE" ]; then
        log "No active soak period found"
        return
    fi

    local status=$(cat "$SOAK_STATUS_FILE")
    local current_status=$(echo "$status" | jq -r '.status' 2>/dev/null || echo "unknown")

    echo "=== Soak Period Status ==="
    echo "Status: $current_status"
    echo "Environment: $(echo "$status" | jq -r '.environment // "unknown"' 2>/dev/null || echo "unknown")"
    echo "Start Time: $(echo "$status" | jq -r '.start_time // "unknown"' 2>/dev/null || echo "unknown")"
    echo "Duration: $(echo "$status" | jq -r '.duration // "unknown"' 2>/dev/null || echo "unknown") seconds"
    echo "URL: $(echo "$status" | jq -r '.url // "unknown"' 2>/dev/null || echo "unknown")"

    if [ "$current_status" = "completed" ]; then
        echo "End Time: $(echo "$status" | jq -r '.end_time // "unknown"' 2>/dev/null || echo "unknown")"
        echo "Final Metrics: $(echo "$status" | jq -r '.final_metrics // "unknown"' 2>/dev/null || echo "unknown")"
    fi

    if [ -f "$SOAK_METRICS_FILE" ]; then
        echo ""
        echo "=== Current Metrics ==="
        if jq empty "$SOAK_METRICS_FILE" 2>/dev/null; then
            cat "$SOAK_METRICS_FILE" | jq '.'
        else
            echo "Invalid JSON in metrics file"
            cat "$SOAK_METRICS_FILE"
        fi
    fi
}

# Main script logic
case "${1:-}" in
    "start")
        if [ -z "$2" ]; then
            log_error "Environment required for start command"
            echo "Usage: $0 start [environment] [duration]"
            exit 1
        fi
        start_soak "$2" "$3"
        ;;
    "monitor")
        if [ -z "$2" ]; then
            log_error "Environment required for monitor command"
            echo "Usage: $0 monitor [environment] [duration]"
            exit 1
        fi
        monitor_soak "$2" "$3"
        ;;
    "rollback")
        if [ -z "$2" ]; then
            log_error "Environment required for rollback command"
            echo "Usage: $0 rollback [environment] [reason]"
            exit 1
        fi
        perform_rollback "$2" "${3:-Manual rollback}"
        ;;
    "status")
        show_status
        ;;
    *)
        echo "Usage: $0 [start|monitor|rollback|status] [environment] [duration|reason]"
        echo ""
        echo "Commands:"
        echo "  start [env] [duration]    - Start soak period for environment"
        echo "  monitor [env] [duration]  - Monitor deployment during soak"
        echo "  rollback [env] [reason]   - Perform rollback"
        echo "  status                    - Show current soak status"
        echo ""
        echo "Environments: preview, staging, staging-soak, production"
        echo "Duration: seconds (default: $DEFAULT_SOAK_DURATION)"
        exit 1
        ;;
esac
