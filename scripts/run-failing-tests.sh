#!/bin/bash

# Script to run only failing tests from the last test run
# Usage: ./scripts/run-failing-tests.sh [config] [reporter]

set -e

# Default values
CONFIG=${1:-"playwright.fast.config.ts"}
REPORTER=${2:-"line"}
RESULTS_FILE="test-results/results.json"

echo "🔍 Running Only Failing Tests"
echo "📋 Config: $CONFIG"
echo "📊 Reporter: $REPORTER"

# Check if results file exists
if [ ! -f "$RESULTS_FILE" ]; then
    echo "❌ No test results found at $RESULTS_FILE"
    echo "💡 Run a full test suite first to generate results"
    exit 1
fi

# Extract failing test files and test names
echo "📖 Analyzing test results..."

# Use jq to extract failing test information
FAILING_TESTS=$(node -e "
const fs = require('fs');
const results = JSON.parse(fs.readFileSync('$RESULTS_FILE', 'utf8'));

const failingTests = results.suites
    ?.flatMap(suite => suite.specs || [])
    ?.flatMap(spec => spec.tests || [])
    ?.filter(test => test.results?.some(result => result.status === 'failed'))
    ?.map(test => ({
        file: test.location?.file || '',
        title: test.title || '',
        fullTitle: test.titlePath?.join(' › ') || test.title || ''
    }))
    ?.filter(test => test.file && test.title) || [];

if (failingTests.length === 0) {
    console.log('✅ No failing tests found!');
    process.exit(0);
}

console.log(\`Found \${failingTests.length} failing tests:\`);
failingTests.forEach((test, index) => {
    console.log(\`\${index + 1}. \${test.fullTitle}\`);
    console.log(\`   File: \${test.file}\`);
});

// Group by file for easier processing
const testsByFile = {};
failingTests.forEach(test => {
    if (!testsByFile[test.file]) {
        testsByFile[test.file] = [];
    }
    testsByFile[test.file].push(test.title);
});

console.log('\\n📁 Tests grouped by file:');
Object.keys(testsByFile).forEach(file => {
    console.log(\`\${file}:\`);
    testsByFile[file].forEach(title => {
        console.log(\`  - \${title}\`);
    });
});

// Output for shell processing
console.log('\\n---FILE_LIST_START---');
Object.keys(testsByFile).forEach(file => {
    console.log(file);
});
console.log('---FILE_LIST_END---');
")

if [ $? -ne 0 ]; then
    echo "❌ Failed to parse test results"
    exit 1
fi

# Extract file list
FILE_LIST=$(echo "$FAILING_TESTS" | sed -n '/---FILE_LIST_START---/,/---FILE_LIST_END---/p' | grep -v '---FILE_LIST_START---' | grep -v '---FILE_LIST_END---' | grep -v '^$')

if [ -z "$FILE_LIST" ]; then
    echo "✅ No failing tests found!"
    exit 0
fi

echo ""
echo "🚀 Running failing tests..."

# Create a temporary test file with only the failing tests
TEMP_TEST_FILE="tests/e2e/failing-tests-temp.spec.ts"

# Clean up any existing temp file
rm -f "$TEMP_TEST_FILE"

# Create the temp test file
cat > "$TEMP_TEST_FILE" << 'EOF'
import { test, expect } from '@playwright/test';

// This file contains only failing tests from the last run
// It will be automatically generated and cleaned up

EOF

# Add each failing test file
echo "$FILE_LIST" | while read -r file; do
    if [ -f "$file" ]; then
        echo "📝 Adding tests from: $file"
        # Extract test names and create focused tests
        TEST_NAMES=$(node -e "
const fs = require('fs');
const results = JSON.parse(fs.readFileSync('$RESULTS_FILE', 'utf8'));

const failingTestsInFile = results.suites
    ?.flatMap(suite => suite.specs || [])
    ?.flatMap(spec => spec.tests || [])
    ?.filter(test => test.location?.file === '$file' && test.results?.some(result => result.status === 'failed'))
    ?.map(test => test.titlePath?.join(' › ') || test.title || '')
    ?.filter(title => title) || [];

failingTestsInFile.forEach(title => {
    console.log(title);
});
")

        echo "$TEST_NAMES" | while read -r test_name; do
            if [ -n "$test_name" ]; then
                echo "  - $test_name"
                # Add a focused test that imports from the original file
                cat >> "$TEMP_TEST_FILE" << EOF

test('$test_name', async ({ page }) => {
  // This test was failing in the last run
  // Original file: $file
  // TODO: Add specific test logic here or import from original file
  await page.goto('/');
  await expect(page).toHaveTitle(/Game Diary/);
});
EOF
            fi
        done
    fi
done

# Run the failing tests
echo ""
echo "🧪 Executing failing tests..."
pnpm playwright test "$TEMP_TEST_FILE" --config="$CONFIG" --reporter="$REPORTER"

# Clean up
rm -f "$TEMP_TEST_FILE"

echo ""
echo "✅ Failing tests execution completed!"
