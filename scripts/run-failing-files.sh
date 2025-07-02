#!/bin/bash

# Script to run only failing test files from the last test run
# Usage: ./scripts/run-failing-files.sh [config] [reporter] [file-filter]
# Example: ./scripts/run-failing-files.sh playwright.popular.config.ts line tests/e2e/responsive.spec.ts

set -e

# Default values
CONFIG=${1:-"playwright.fast.config.ts"}
REPORTER=${2:-"line"}
RESULTS_FILE="test-results/results.json"
FILE_FILTER=${3:-""}

echo "🔍 Running Only Failing Test Files"
echo "📋 Config: $CONFIG"
echo "📊 Reporter: $REPORTER"
if [ -n "$FILE_FILTER" ]; then
  echo "🔎 File filter: $FILE_FILTER"
fi

# Check if results file exists
if [ ! -f "$RESULTS_FILE" ]; then
    echo "❌ No test results found at $RESULTS_FILE"
    echo "💡 Run a full test suite first to generate results"
    echo "   Example: pnpm playwright test --config=$CONFIG --reporter=json"
    exit 1
fi

# Extract failing test files
echo "📖 Analyzing test results..."

FAILING_FILES=$(node -e "
const fs = require('fs');
const results = JSON.parse(fs.readFileSync('$RESULTS_FILE', 'utf8'));

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
FILE_LIST=$(echo "$FAILING_FILES" | sed -n '/---FILES_START---/,/---FILES_END---/p' | sed '/---FILES_START---/d' | sed '/---FILES_END---/d' | sed '/^$/d')

# Optional: filter for a specific test file
if [ -n "$FILE_FILTER" ]; then
  FILE_LIST=$(echo "$FILE_LIST" | grep -- "$FILE_FILTER")
fi

if [ -z "$FILE_LIST" ]; then
    echo "✅ No failing tests found!"
    exit 0
fi

echo ""
echo "🚀 Running failing test files..."

# Build the command to run all failing files
TEST_COMMAND="pnpm playwright test"

# Add each failing file to the command
echo "$FILE_LIST" | while read -r file; do
    if [ -f "$file" ]; then
        echo "📝 Adding: $file"
        TEST_COMMAND="$TEST_COMMAND \"$file\""
    fi
done

# Add config and reporter
TEST_COMMAND="$TEST_COMMAND --config=$CONFIG --reporter=$REPORTER"

echo ""
echo "🧪 Executing: $TEST_COMMAND"
echo ""

# Execute the command
eval $TEST_COMMAND

echo ""
echo "✅ Failing test files execution completed!"
