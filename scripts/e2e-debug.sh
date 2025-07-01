#!/bin/bash

# E2E Test Debugging Script
# Usage: ./scripts/e2e-debug.sh

echo "🔍 E2E Test Debugging Information"
echo "=================================="

echo ""
echo "📋 System Information:"
echo "  OS: $(uname -s)"
echo "  Architecture: $(uname -m)"
echo "  Node version: $(node --version)"
echo "  pnpm version: $(pnpm --version)"

echo ""
echo "🔍 Process Status:"
echo "  Next.js dev server: $(pgrep -f 'next dev' | wc -l | tr -d ' ') processes"
echo "  Playwright processes: $(pgrep -f 'playwright' | wc -l | tr -d ' ') processes"
echo "  Browser processes: $(pgrep -f 'chromium\|firefox\|webkit' | wc -l | tr -d ' ') processes"

echo ""
echo "🌐 Port Status:"
echo "  Port 8081 (dev server): $(lsof -i:8081 2>/dev/null | wc -l | tr -d ' ') connections"
echo "  Port 9323 (HTML report): $(lsof -i:9323 2>/dev/null | wc -l | tr -d ' ') connections"

echo ""
echo "📁 Test Artifacts:"
echo "  playwright-report: $(if [ -d "playwright-report" ]; then echo "✅ exists"; else echo "❌ missing"; fi)"
echo "  test-results: $(if [ -d "test-results" ]; then echo "✅ exists"; else echo "❌ missing"; fi)"
echo "  coverage/e2e: $(if [ -d "coverage/e2e" ]; then echo "✅ exists"; else echo "❌ missing"; fi)"

echo ""
echo "📄 Recent Log Files:"
if [ -f "/tmp/playwright.log" ]; then
    echo "  /tmp/playwright.log: $(wc -l < /tmp/playwright.log) lines"
    echo "  Last 5 lines:"
    tail -5 /tmp/playwright.log | sed 's/^/    /'
else
    echo "  /tmp/playwright.log: ❌ not found"
fi

echo ""
echo "🔧 Environment Variables:"
echo "  NODE_ENV: ${NODE_ENV:-not set}"
echo "  CI: ${CI:-not set}"
echo "  DEBUG: ${DEBUG:-not set}"

echo ""
echo "📦 Package Status:"
if [ -f "package.json" ]; then
    echo "  package.json: ✅ exists"
    echo "  node_modules: $(if [ -d "node_modules" ]; then echo "✅ exists"; else echo "❌ missing"; fi)"
else
    echo "  package.json: ❌ missing"
fi

echo ""
echo "🚀 Quick Fixes:"
echo "  1. Kill all processes: pkill -f 'next dev\|playwright\|chromium\|firefox\|webkit'"
echo "  2. Clean artifacts: rm -rf playwright-report test-results coverage/e2e"
echo "  3. Restart dev server: pnpm dev -p 8081"
echo "  4. Run fast tests: pnpm test:e2e:fast"
echo "  5. Run without coverage: ./scripts/e2e-run.sh 'playwright test --project=chromium' 'Debug'"
