#!/bin/bash

# Debug script for deployment URL connectivity issues
# Usage: ./scripts/debug-deployment.sh <deployment-url>

set -e

DEPLOYMENT_URL="${1:-}"

if [ -z "$DEPLOYMENT_URL" ]; then
    echo "❌ Please provide a deployment URL"
    echo "Usage: $0 <deployment-url>"
    echo "Example: $0 https://game-diary-lnqfbt6ha-suhais-projects-33a81a2a.vercel.app"
    exit 1
fi

echo "🔍 Debugging deployment URL: $DEPLOYMENT_URL"
echo "=========================================="

# Validate URL format
if [[ ! "$DEPLOYMENT_URL" =~ ^https?:// ]]; then
    echo "❌ Invalid URL format: $DEPLOYMENT_URL"
    exit 1
fi

echo "✅ URL format is valid"

# Extract domain for DNS testing
DOMAIN=$(echo "$DEPLOYMENT_URL" | sed 's|https://||' | sed 's|/.*||')
echo "🌐 Testing domain: $DOMAIN"

# Test DNS resolution
echo ""
echo "🔍 Testing DNS resolution..."
if nslookup "$DOMAIN" >/dev/null 2>&1; then
    echo "✅ DNS resolution successful"
else
    echo "❌ DNS resolution failed"
    exit 1
fi

# Test basic connectivity with different methods
echo ""
echo "🔍 Testing basic connectivity..."

# Method 1: curl with verbose output
echo "Method 1: curl verbose test"
if curl -v --max-time 30 "$DEPLOYMENT_URL" 2>&1 | head -30; then
    echo "✅ curl test successful"
else
    echo "❌ curl test failed"
fi

# Method 2: Test health check endpoint
echo ""
echo "Method 2: Health check endpoint test"
if curl -v --max-time 30 "$DEPLOYMENT_URL/api/health" 2>&1 | head -30; then
    echo "✅ Health check endpoint accessible"
else
    echo "❌ Health check endpoint failed"
fi

# Method 3: Test with different user agents
echo ""
echo "Method 3: Testing with different user agents..."
for user_agent in "curl/7.68.0" "Mozilla/5.0 (compatible; Googlebot/2.1)" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"; do
    echo "Testing with User-Agent: $user_agent"
    if curl -H "User-Agent: $user_agent" --max-time 30 "$DEPLOYMENT_URL/api/health" >/dev/null 2>&1; then
        echo "✅ Success with User-Agent: $user_agent"
    else
        echo "❌ Failed with User-Agent: $user_agent"
    fi
done

# Method 4: Test with different HTTP methods
echo ""
echo "Method 4: Testing different HTTP methods..."
for method in GET HEAD OPTIONS; do
    echo "Testing $method method..."
    if [ "$method" = "HEAD" ]; then
        # For HEAD requests, check if we get a response (even if it's 401)
        if curl -I --max-time 30 "$DEPLOYMENT_URL/api/health" >/dev/null 2>&1; then
            echo "✅ $method method successful"
        else
            echo "❌ $method method failed"
        fi
    else
        if curl -X "$method" --max-time 30 "$DEPLOYMENT_URL/api/health" >/dev/null 2>&1; then
            echo "✅ $method method successful"
        else
            echo "❌ $method method failed"
        fi
    fi
done

# Method 5: Test response headers
echo ""
echo "Method 5: Testing response headers..."
HEADERS=$(curl -I --max-time 30 "$DEPLOYMENT_URL/api/health" 2>/dev/null || echo "")
if [ -n "$HEADERS" ]; then
    echo "✅ Headers received:"
    echo "$HEADERS" | head -20
else
    echo "❌ No headers received"
fi

# Method 6: Test with wget as alternative
echo ""
echo "Method 6: Testing with wget..."
if command -v wget >/dev/null 2>&1; then
    if wget --timeout=30 --tries=1 --spider "$DEPLOYMENT_URL/api/health" 2>&1 | head -10; then
        echo "✅ wget test successful"
    else
        echo "❌ wget test failed"
    fi
else
    echo "⚠️ wget not available"
fi

# Method 7: Test with telnet (if available)
echo ""
echo "Method 7: Testing port connectivity..."
PORT=443
if command -v telnet >/dev/null 2>&1; then
    if timeout 10 bash -c "</dev/tcp/$DOMAIN/$PORT" 2>/dev/null; then
        echo "✅ Port $PORT is accessible"
    else
        echo "❌ Port $PORT is not accessible"
    fi
else
    echo "⚠️ telnet not available, using bash built-in"
    if timeout 10 bash -c "</dev/tcp/$DOMAIN/$PORT" 2>/dev/null; then
        echo "✅ Port $PORT is accessible"
    else
        echo "❌ Port $PORT is not accessible"
    fi
fi

echo ""
echo "🔍 Debug summary:"
echo "Deployment URL: $DEPLOYMENT_URL"
echo "Domain: $DOMAIN"
echo "Health check URL: $DEPLOYMENT_URL/api/health"
echo ""
echo "If all tests fail, the deployment might be:"
echo "1. Still building/deploying"
echo "2. Failed to deploy properly"
echo "3. Blocked by firewall/security rules"
echo "4. Having DNS propagation issues"
echo "5. Requiring authentication"
echo ""
echo "Check the Vercel dashboard for deployment status."
