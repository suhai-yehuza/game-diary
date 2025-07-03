#!/bin/bash

# Timed Run Script - Execute any command with timing
# Usage: ./scripts/timed-run.sh <command>
# Example: ./scripts/timed-run.sh "pnpm build"

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <command>"
    echo "Example: $0 'pnpm build'"
    exit 1
fi

COMMAND="$*"
START_TIME=$(date +%s)

echo "🚀 Starting: $COMMAND"
echo "⏰ Start time: $(date)"

# Execute the command
eval "$COMMAND"
EXIT_CODE=$?

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "✅ Completed: $COMMAND"
echo "⏰ End time: $(date)"
echo "⏱️  Duration: ${DURATION} seconds ($(echo "scale=2; $DURATION/60" | bc) minutes)"

exit $EXIT_CODE
