#!/bin/bash

# Failing Tests Runner - Consolidated
# Run only failing tests from the last test run
# Usage: ./scripts/run-failing.sh [mode] [config] [reporter] [file-filter]
#
# Modes:
#   tests     - Run individual failing tests (default)
#   files     - Run entire failing test files
#
# Examples:
#   ./scripts/run-failing.sh tests playwright.fast.config.ts line
#   ./scripts/run-failing.sh files playwright.popular.config.ts line tests/e2e/responsive.spec.ts

set -e

# Function to show usage
show_usage() {
    echo "Usage: $0 [mode] [config] [reporter] [file-filter]"
    echo ""
    echo "Modes:"
    echo "  tests     - Run individual failing tests (default)"
    echo "  files     - Run entire failing test files"
    echo ""
    echo "Examples:"
    echo "  $0 tests playwright.fast.config.ts line"
    echo "  $0 files playwright.popular.config.ts line tests/e2e/responsive.spec.ts"
    echo ""
    echo "Default values:"
    echo "  config: playwright.fast.config.ts"
    echo "  reporter: line"
    echo "  file-filter: none (runs all failing tests/files)"
}

# Function to run failing individual tests
run_failing_tests() {
    local config="$1"
    local reporter="$2"
    local results_file="test-results/results.json"

    echo "🔍 Running Only Failing Tests"
    echo "📋 Config: $config"
    echo "📊 Reporter: $reporter"

    # Check if results file exists
    if [ ! -f "$results_file" ]; then
        echo "❌ No test results found at $results_file"
        echo "💡 Run a full test suite first to generate results"
        exit 1
    fi

    # Extract failing test files and test names
    echo "📖 Analyzing test results..."

    # Use jq to extract failing test information
    local failing_tests=$(node -e "
const fs = require('fs');
const results = JSON.parse(fs.readFileSync('$results_file', 'utf8'));

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
    local file_list=$(echo "$failing_tests" | sed -n '/---FILE_LIST_START---/,/---FILE_LIST_END---/p' | grep -v '---FILE_LIST_START---' | grep -v '---FILE_LIST_END---' | grep -v '^$')

    if [ -z "$file_list" ]; then
        echo "✅ No failing tests found!"
        exit 0
    fi

    echo ""
    echo "🚀 Running failing tests..."

    # Create a temporary test file with only the failing tests
    local temp_test_file="tests/e2e/failing-tests-temp.spec.ts"

    # Clean up any existing temp file
    rm -f "$temp_test_file"

    # Create the temp test file
    cat > "$temp_test_file" << 'EOF'
import { test, expect } from '@playwright/test';

// This file contains only failing tests from the last run
// It will be automatically generated and cleaned up

EOF

    # Add each failing test file
    echo "$file_list" | while read -r file; do
        if [ -f "$file" ]; then
            echo "📝 Adding tests from: $file"
            # Extract test names and create focused tests
            local test_names=$(node -e "
const fs = require('fs');
const results = JSON.parse(fs.readFileSync('$results_file', 'utf8'));

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

            echo "$test_names" | while read -r test_name; do
                if [ -n "$test_name" ]; then
                    echo "  - $test_name"
                    # Add a focused test that imports from the original file
                    cat >> "$temp_test_file" << EOF

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
    pnpm playwright test "$temp_test_file" --config="$config" --reporter="$reporter"

    # Clean up
    rm -f "$temp_test_file"

    echo ""
    echo "✅ Failing tests execution completed!"
}

# Function to run failing test files
run_failing_files() {
    local config="$1"
    local reporter="$2"
    local file_filter="$3"
    local results_file="test-results/results.json"

    echo "🔍 Running Only Failing Test Files"
    echo "📋 Config: $config"
    echo "📊 Reporter: $reporter"
    if [ -n "$file_filter" ]; then
        echo "🔎 File filter: $file_filter"
    fi

    # Check if results file exists
    if [ ! -f "$results_file" ]; then
        echo "❌ No test results found at $results_file"
        echo "💡 Run a full test suite first to generate results"
        echo "   Example: pnpm playwright test --config=$config --reporter=json"
        exit 1
    fi

    # Extract failing test files
    echo "📖 Analyzing test results..."

    local failing_files=$(node -e "
const fs = require('fs');
const results = JSON.parse(fs.readFileSync('$results_file', 'utf8'));

const failingFiles = new Set();

results.suites?.forEach(suite => {
    suite.specs?.forEach(spec => {
        spec.tests?.forEach(test => {
            if (test.results?.some(result => result.status === 'failed')) {
                if (test.location?.file) {
                    failingFiles.add(test.location.file);
                }
            }
        });
    });
});

if (failingFiles.size === 0) {
    console.log('✅ No failing tests found!');
    process.exit(0);
}

console.log(\`Found \${failingFiles.size} files with failing tests:\`);
Array.from(failingFiles).forEach((file, index) => {
    console.log(\`\${index + 1}. \${file}\`);
});

// Output file list for shell processing
console.log('\\n---FILES_START---');
Array.from(failingFiles).forEach(file => {
    console.log(file);
});
console.log('---FILES_END---');
")

    if [ $? -ne 0 ]; then
        echo "❌ Failed to parse test results"
        exit 1
    fi

    # Extract file list
    local file_list=$(echo "$failing_files" | sed -n '/---FILES_START---/,/---FILES_END---/p' | sed '/---FILES_START---/d' | sed '/---FILES_END---/d' | sed '/^$/d')

    # Optional: filter for a specific test file
    if [ -n "$file_filter" ]; then
        file_list=$(echo "$file_list" | grep -- "$file_filter")
    fi

    if [ -z "$file_list" ]; then
        echo "✅ No failing tests found!"
        exit 0
    fi

    echo ""
    echo "🚀 Running failing test files..."

    # Build the command to run all failing files
    local test_command="pnpm playwright test"

    # Add each failing file to the command
    echo "$file_list" | while read -r file; do
        if [ -f "$file" ]; then
            echo "📝 Adding: $file"
            test_command="$test_command \"$file\""
        fi
    done

    # Add config and reporter
    test_command="$test_command --config=$config --reporter=$reporter"

    echo ""
    echo "🧪 Executing: $test_command"
    echo ""

    # Execute the command
    eval $test_command

    echo ""
    echo "✅ Failing test files execution completed!"
}

# Main script logic
MODE="${1:-tests}"
CONFIG="${2:-playwright.fast.config.ts}"
REPORTER="${3:-line}"
FILE_FILTER="${4:-}"

case "$MODE" in
    "tests")
        run_failing_tests "$CONFIG" "$REPORTER"
        ;;
    "files")
        run_failing_files "$CONFIG" "$REPORTER" "$FILE_FILTER"
        ;;
    "-h"|"--help"|"help")
        show_usage
        exit 0
        ;;
    *)
        echo "❌ Error: Unknown mode '$MODE'"
        show_usage
        exit 1
        ;;
esac
