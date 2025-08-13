#!/bin/bash

# Debug validation script for multiple deployment URLs
# Usage: ./scripts/validation/deployment-validate.sh <url1> <url2> <url3> ... [--bypass-secret <secret>] [--ci]

set -e

# Parse bypass secret if provided
BYPASS_SECRET=""
CI_MODE=false

# Parse arguments
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
        *)
            break
            ;;
    esac
done

# Colors for output (disabled in CI mode)
if [ "$CI_MODE" = true ]; then
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    NC=''
else
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m' # No Color
fi

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️ $message${NC}"
            ;;
        "info")
            echo -e "${BLUE}🔍 $message${NC}"
            ;;
    esac
}

# Function to validate a single URL
validate_url() {
    local url=$1
    local url_number=$2
    local total_urls=$3
    local has_failures=false

    if [ "$CI_MODE" = false ]; then
        echo ""
        echo "=========================================="
        print_status "info" "Validating URL $url_number/$total_urls: $url"
        echo "=========================================="
    else
        print_status "info" "Validating URL $url_number/$total_urls: $url"
    fi

    # Validate URL format
    if [[ ! "$url" =~ ^https?:// ]]; then
        print_status "error" "Invalid URL format: $url"
        return 1
    fi

    print_status "success" "URL format is valid"

    # Extract domain for DNS testing
    local domain=$(echo "$url" | sed 's|https://||' | sed 's|/.*||')
    print_status "info" "Testing domain: $domain"

    # Test DNS resolution
    if [ "$CI_MODE" = false ]; then
        echo ""
    fi
    print_status "info" "Testing DNS resolution..."
    if nslookup "$domain" >/dev/null 2>&1; then
        print_status "success" "DNS resolution successful"
    else
        print_status "error" "DNS resolution failed"
        return 1
    fi

    # Test basic connectivity
    if [ "$CI_MODE" = false ]; then
        echo ""
    fi
    print_status "info" "Testing basic connectivity..."

    # Test health check endpoint
    local health_url="${url%/}/api/health"
    print_status "info" "Testing health check endpoint: $health_url"

    # Build curl command with bypass header if available
    local curl_cmd="curl -s -w \"\\nHTTP_CODE:%{http_code}\" --max-time 30"
    if [ -n "$BYPASS_SECRET" ]; then
        curl_cmd="$curl_cmd -H \"x-vercel-protection-bypass: $BYPASS_SECRET\""
    fi

    local health_response=$($curl_cmd "$health_url" 2>/dev/null || echo "HTTP_CODE:000")
    local http_code=$(echo "$health_response" | grep "HTTP_CODE:" | cut -d: -f2 | tr -d '%"' | tr -d "'")
    local response_body=$(echo "$health_response" | grep -v "HTTP_CODE:")

    # Debug: Show the actual response for troubleshooting (only in non-CI mode)
    if [ "$VERBOSE" = "true" ] && [ "$CI_MODE" = false ]; then
        echo "Debug: Full response: $health_response"
        echo "Debug: HTTP code: '$http_code'"
        echo "Debug: Response body: $response_body"
    fi

    if [ "$http_code" = "200" ]; then
        print_status "success" "Health check successful (HTTP $http_code)"
        if [ -n "$response_body" ] && [ "$CI_MODE" = false ]; then
            echo "Response: $response_body"
        fi
    elif [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
        print_status "warning" "Health check requires authentication (HTTP $http_code)"
    elif [ "$http_code" = "404" ]; then
        print_status "warning" "Health check endpoint not found (HTTP $http_code)"
    else
        print_status "error" "Health check failed (HTTP $http_code)"
        return 1
    fi

    # Test main page
    if [ "$CI_MODE" = false ]; then
        echo ""
    fi
    print_status "info" "Testing main page..."
    local main_response=$($curl_cmd "$url" 2>/dev/null || echo "HTTP_CODE:000")
    local main_http_code=$(echo "$main_response" | grep "HTTP_CODE:" | cut -d: -f2 | tr -d '%"' | tr -d "'")

    if [ "$main_http_code" = "200" ]; then
        print_status "success" "Main page accessible (HTTP $main_http_code)"
    elif [ "$main_http_code" = "401" ] || [ "$main_http_code" = "403" ]; then
        print_status "warning" "Main page requires authentication (HTTP $main_http_code)"
    else
        print_status "error" "Main page failed (HTTP $main_http_code)"
        return 1
    fi

    # Test with different user agents (informational - doesn't fail validation)
    if [ "$CI_MODE" = false ]; then
        echo ""
        print_status "info" "Testing with different user agents..."
        local user_agents=(
            "curl/7.68.0"
            "Mozilla/5.0 (compatible; Googlebot/2.1)"
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )

        for user_agent in "${user_agents[@]}"; do
            local ua_curl_cmd="curl -H \"User-Agent: $user_agent\" --max-time 30"
            if [ -n "$BYPASS_SECRET" ]; then
                ua_curl_cmd="$ua_curl_cmd -H \"x-vercel-protection-bypass: $BYPASS_SECRET\""
            fi
            if $ua_curl_cmd "$health_url" >/dev/null 2>&1; then
                print_status "success" "Success with User-Agent: $user_agent"
            else
                print_status "error" "Failed with User-Agent: $user_agent"
            fi
        done

        # Test response headers (informational - doesn't fail validation)
        echo ""
        print_status "info" "Testing response headers..."
        local header_curl_cmd="curl -I --max-time 30"
        if [ -n "$BYPASS_SECRET" ]; then
            header_curl_cmd="$header_curl_cmd -H \"x-vercel-protection-bypass: $BYPASS_SECRET\""
        fi
        local headers=$($header_curl_cmd "$health_url" 2>/dev/null || echo "")
        if [ -n "$headers" ]; then
            print_status "success" "Headers received:"
            echo "$headers" | head -10
        else
            print_status "error" "No headers received"
        fi
    fi

    # Test port connectivity
    if [ "$CI_MODE" = false ]; then
        echo ""
    fi
    print_status "info" "Testing port connectivity..."
    local port=443
    if timeout 10 bash -c "</dev/tcp/$domain/$port" 2>/dev/null; then
        print_status "success" "Port $port is accessible"
    else
        print_status "error" "Port $port is not accessible"
        return 1
    fi

    print_status "success" "Validation completed for: $url"
    if [ "$CI_MODE" = false ]; then
        echo ""
    fi
}

# Main execution
main() {
    local urls=("$@")
    local total_urls=${#urls[@]}

    if [ $total_urls -eq 0 ]; then
        echo "❌ Please provide at least one URL to validate"
        echo "Usage: $0 <url1> <url2> <url3> ... [--bypass-secret <secret>] [--ci]"
        echo "Example: $0 https://staging.game-diary.io https://www.game-diary.io/"
        exit 1
    fi

    if [ "$CI_MODE" = true ]; then
        echo "🔍 Starting CI validation for $total_urls URL(s) (fail-fast mode)"
    else
        echo "🔍 Starting validation for $total_urls URL(s) (fail-fast mode)"
        echo "=========================================="
    fi

    local successful_urls=()

    for i in "${!urls[@]}"; do
        local url="${urls[$i]}"
        local url_number=$((i + 1))

        if [ "$CI_MODE" = false ]; then
            echo ""
            echo "Validating URL $url_number/$total_urls: $url"
            echo "=========================================="
        fi

        if validate_url "$url" "$url_number" "$total_urls"; then
            successful_urls+=("$url")
            print_status "success" "✅ URL $url_number/$total_urls passed validation"
        else
            print_status "error" "❌ URL $url_number/$total_urls failed validation - stopping execution"
            if [ "$CI_MODE" = false ]; then
                echo ""
                echo "=========================================="
                print_status "error" "FAIL-FAST: Validation stopped at first failure"
                echo "=========================================="
                echo "Failed URL: $url"
                echo "Successful URLs: ${#successful_urls[@]}"
                echo "Remaining URLs: $((total_urls - url_number))"
            fi
            exit 1
        fi
    done

    # All URLs passed
    if [ "$CI_MODE" = false ]; then
        echo ""
        echo "=========================================="
        print_status "success" "VALIDATION SUMMARY - ALL URLs PASSED"
        echo "=========================================="
        echo "Total URLs tested: $total_urls"
        echo "Successful: ${#successful_urls[@]}"
        echo ""
    fi
    print_status "success" "All URLs passed validation!"
}

# Run main function with all arguments
main "$@"
