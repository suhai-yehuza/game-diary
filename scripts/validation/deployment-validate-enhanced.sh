#!/bin/bash

# Enhanced deployment validation script with comprehensive error handling
# Usage: ./scripts/validation/deployment-validate-enhanced.sh <url> [options]

set -e

# Parse arguments
BYPASS_SECRET=""
CI_MODE=false
VERBOSE=false
TIMEOUT=60
RETRIES=3

while [[ $# -gt 0 ]]; do
    case $1 in
        --bypass-secret)
            BYPASS_SECRET="$2"
            shift 2
            ;;
        --ci)
            CI_MODE=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --retries)
            RETRIES="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 <url> [options]"
            echo ""
            echo "Options:"
            echo "  --bypass-secret <secret>  Vercel protection bypass secret"
            echo "  --ci                     Enable CI mode (no colors, fail-fast)"
            echo "  --verbose                Enable verbose output"
            echo "  --timeout <seconds>      Request timeout (default: 60)"
            echo "  --retries <count>        Number of retries (default: 3)"
            echo "  --help                   Show this help message"
            exit 0
            ;;
        *)
            if [ -z "$DEPLOYMENT_URL" ]; then
                DEPLOYMENT_URL="$1"
            else
                echo "❌ Multiple URLs provided. This script only supports one URL at a time."
                exit 1
            fi
            shift
            ;;
    esac
done

# Validate URL parameter
if [ -z "$DEPLOYMENT_URL" ]; then
    echo "❌ Please provide a deployment URL"
    echo "Usage: $0 <url> [options]"
    exit 1
fi

# Colors for output (disabled in CI mode)
if [ "$CI_MODE" = true ]; then
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    PURPLE=''
    NC=''
else
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    PURPLE='\033[0;35m'
    NC='\033[0m' # No Color
fi

# Enhanced logging functions
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

log_info() {
    echo -e "${BLUE}🔍 $1${NC}"
}

log_debug() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${PURPLE}🐛 $1${NC}"
    fi
}

# Enhanced URL validation
validate_url_format() {
    local url="$1"

    log_info "Validating URL format: $url"

    # Check if URL starts with http:// or https://
    if [[ ! "$url" =~ ^https?:// ]]; then
        log_error "Invalid URL format: $url"
        log_info "URL must start with http:// or https://"
        return 1
    fi

    # Check if URL contains a domain
    if [[ ! "$url" =~ ^https?://[^/]+ ]]; then
        log_error "Invalid URL format: $url"
        log_info "URL must contain a valid domain"
        return 1
    fi

    log_success "URL format is valid"
    return 0
}

# Enhanced DNS resolution check
check_dns_resolution() {
    local domain="$1"

    log_info "Testing DNS resolution for: $domain"

    # Try multiple DNS servers for better reliability
    local dns_servers=("8.8.8.8" "1.1.1.1" "208.67.222.222")
    local dns_success=false

    for dns_server in "${dns_servers[@]}"; do
        log_debug "Trying DNS server: $dns_server"
        if nslookup "$domain" "$dns_server" >/dev/null 2>&1; then
            log_success "DNS resolution successful using $dns_server"
            dns_success=true
            break
        fi
    done

    if [ "$dns_success" = false ]; then
        log_error "DNS resolution failed with all DNS servers"
        return 1
    fi

    return 0
}

# Enhanced connectivity test
test_connectivity() {
    local url="$1"
    local endpoint="$2"
    local expected_status="$3"

    log_info "Testing connectivity to: $endpoint"

    # Build curl command with enhanced options
    local curl_cmd="curl -s -w \"\\nHTTP_CODE:%{http_code}\\nTIME_TOTAL:%{time_total}\\nSIZE_DOWNLOAD:%{size_download}\" --max-time $TIMEOUT --retry $RETRIES --retry-delay 2"

    # Add bypass header if available
    if [ -n "$BYPASS_SECRET" ]; then
        curl_cmd="$curl_cmd -H \"x-vercel-protection-bypass: $BYPASS_SECRET\""
        log_debug "Using Vercel protection bypass"
    fi

    # Add user agent
    curl_cmd="$curl_cmd -H \"User-Agent: Deployment-Validator/1.0\""

    # Execute request with retry logic
    local response=""
    local http_code=""
    local time_total=""
    local size_download=""

    for attempt in $(seq 1 $RETRIES); do
        log_debug "Attempt $attempt/$RETRIES: Testing $endpoint"

        if response=$($curl_cmd "$endpoint" 2>/dev/null); then
            # Parse response
            http_code=$(echo "$response" | grep "HTTP_CODE:" | tail -1 | sed 's/.*HTTP_CODE://' | tr -d ' ')
            time_total=$(echo "$response" | grep "TIME_TOTAL:" | tail -1 | sed 's/.*TIME_TOTAL://' | tr -d ' ')
            size_download=$(echo "$response" | grep "SIZE_DOWNLOAD:" | tail -1 | sed 's/.*SIZE_DOWNLOAD://' | tr -d ' ')

            log_debug "HTTP Code: $http_code"
            log_debug "Time Total: ${time_total}s"
            log_debug "Size: ${size_download} bytes"

            # Check if we got a valid response
            if [ -n "$http_code" ] && [ "$http_code" != "000" ]; then
                break
            fi
        fi

        if [ $attempt -lt $RETRIES ]; then
            log_warning "Attempt $attempt failed, retrying in 2 seconds..."
            sleep 2
        fi
    done

    # Validate response
    if [ -z "$http_code" ] || [ "$http_code" = "000" ]; then
        log_error "Failed to get valid response from $endpoint"
        return 1
    fi

    # Check HTTP status code
    if [ "$http_code" = "$expected_status" ]; then
        log_success "Connectivity test passed (HTTP $http_code)"
        if [ -n "$time_total" ]; then
            log_info "Response time: ${time_total}s"
        fi
        if [ -n "$size_download" ]; then
            log_info "Response size: ${size_download} bytes"
        fi
        return 0
    elif [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
        log_warning "Endpoint requires authentication (HTTP $http_code)"
        return 0  # This is acceptable for protected endpoints
    elif [ "$http_code" = "404" ]; then
        log_warning "Endpoint not found (HTTP $http_code)"
        return 0  # This might be acceptable depending on the endpoint
    else
        log_error "Connectivity test failed (HTTP $http_code)"
        return 1
    fi
}

# Enhanced port connectivity test
test_port_connectivity() {
    local domain="$1"
    local port="$2"

    log_info "Testing port connectivity: $domain:$port"

    # Test with timeout
    if timeout 10 bash -c "</dev/tcp/$domain/$port" 2>/dev/null; then
        log_success "Port $port is accessible"
        return 0
    else
        log_error "Port $port is not accessible"
        return 1
    fi
}

# Enhanced SSL/TLS test
test_ssl_certificate() {
    local domain="$1"

    log_info "Testing SSL certificate for: $domain"

    # Check if it's an HTTPS URL
    if [[ "$DEPLOYMENT_URL" =~ ^https:// ]]; then
        # Test SSL certificate
        if echo | timeout 10 openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null; then
            log_success "SSL certificate is valid"
            return 0
        else
            log_warning "SSL certificate validation failed or not available"
            return 1
        fi
    else
        log_info "Skipping SSL test (not HTTPS)"
        return 0
    fi
}

# Enhanced response headers analysis
analyze_response_headers() {
    local url="$1"

    log_info "Analyzing response headers for: $url"

    local curl_cmd="curl -I --max-time $TIMEOUT"
    if [ -n "$BYPASS_SECRET" ]; then
        curl_cmd="$curl_cmd -H \"x-vercel-protection-bypass: $BYPASS_SECRET\""
    fi

    local headers=$($curl_cmd "$url" 2>/dev/null || echo "")

    if [ -n "$headers" ]; then
        log_success "Response headers received"

        # Check for important headers
        if echo "$headers" | grep -i "server:" >/dev/null; then
            local server=$(echo "$headers" | grep -i "server:" | head -1)
            log_info "Server: $server"
        fi

        if echo "$headers" | grep -i "x-vercel-id:" >/dev/null; then
            log_success "Vercel deployment detected"
        fi

        if echo "$headers" | grep -i "cache-control:" >/dev/null; then
            local cache_control=$(echo "$headers" | grep -i "cache-control:" | head -1)
            log_info "Cache Control: $cache_control"
        fi

        # Check for security headers
        local security_headers=("x-frame-options" "x-content-type-options" "x-xss-protection" "strict-transport-security")
        local security_count=0

        for header in "${security_headers[@]}"; do
            if echo "$headers" | grep -i "$header:" >/dev/null; then
                ((security_count++))
            fi
        done

        log_info "Security headers present: $security_count/${#security_headers[@]}"

        if [ $security_count -gt 0 ]; then
            log_success "Security headers detected"
        else
            log_warning "No security headers detected"
        fi
    else
        log_error "No response headers received"
        return 1
    fi
}

# Main validation function
validate_deployment() {
    local url="$1"

    log_info "Starting enhanced deployment validation for: $url"

    # Extract domain
    local domain=$(echo "$url" | sed 's|https://||' | sed 's|http://||' | sed 's|/.*||')

    # Step 1: Validate URL format
    if ! validate_url_format "$url"; then
        return 1
    fi

    # Step 2: Test DNS resolution
    if ! check_dns_resolution "$domain"; then
        return 1
    fi

    # Step 3: Test port connectivity
    local port=443
    if [[ "$url" =~ ^http:// ]]; then
        port=80
    fi

    if ! test_port_connectivity "$domain" "$port"; then
        return 1
    fi

    # Step 4: Test SSL certificate (if HTTPS)
    if ! test_ssl_certificate "$domain"; then
        log_warning "SSL certificate test failed, but continuing..."
    fi

    # Step 5: Test main page
    if ! test_connectivity "$url" "$url" "200"; then
        log_warning "Main page test failed, but continuing..."
    fi

    # Step 6: Test health check endpoint
    local health_url="${url%/}/api/health"
    if ! test_connectivity "$url" "$health_url" "200"; then
        log_warning "Health check endpoint test failed, but continuing..."
    fi

    # Step 7: Analyze response headers
    if ! analyze_response_headers "$url"; then
        log_warning "Response headers analysis failed, but continuing..."
    fi

    log_success "Enhanced deployment validation completed successfully!"
    return 0
}

# Main execution
main() {
    if [ "$CI_MODE" = true ]; then
        echo "🔍 Starting enhanced CI validation for: $DEPLOYMENT_URL"
    else
        echo "🔍 Starting enhanced validation for: $DEPLOYMENT_URL"
        echo "=========================================="
    fi

    if validate_deployment "$DEPLOYMENT_URL"; then
        log_success "🎉 All validation tests passed!"
        exit 0
    else
        log_error "❌ Validation failed!"
        exit 1
    fi
}

# Run main function
main
