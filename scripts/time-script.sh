#!/bin/bash

# Script Timer
# Usage: ./scripts/time-script.sh <pnpm-command>
# Example: ./scripts/time-script.sh test:e2e:fast
#
# Environment variables:
# - TIMING_ENABLED=1: Enable timing for all scripts
# - TIMING_QUIET=1: Suppress timing output
# - TIMING_LOG=1: Log timing to file

if [ $# -eq 0 ]; then
    echo "Usage: $0 <pnpm-command>"
    echo "Example: $0 test:e2e:fast"
    echo ""
    echo "Environment variables:"
    echo "  TIMING_ENABLED=1: Enable timing for all scripts"
    echo "  TIMING_QUIET=1: Suppress timing output"
    echo "  TIMING_LOG=1: Log timing to file"
    exit 1
fi

COMMAND="$1"
START_TIME=$(date +%s)
START_TIMESTAMP=$(date)

# Check if timing should be quiet
if [ "$TIMING_QUIET" = "1" ]; then
    # Run command silently but still time it
    pnpm "$COMMAND" > /dev/null 2>&1
    EXIT_CODE=$?
else
    # Show timing header
    echo "🚀 Starting: pnpm $COMMAND"
    echo "⏰ Start time: $START_TIMESTAMP"
    echo "────────────────────────────────────────────────────────"

    # Run the command and capture its exit code
    pnpm "$COMMAND"
    EXIT_CODE=$?
fi

END_TIME=$(date +%s)
END_TIMESTAMP=$(date)
DURATION=$((END_TIME - START_TIME))
MINUTES=$(echo "scale=2; $DURATION/60" | bc 2>/dev/null || echo "0")

# Create timing log entry
TIMING_LOG_ENTRY="$(date '+%Y-%m-%d %H:%M:%S') | pnpm $COMMAND | ${DURATION}s | $MINUTES min | exit:$EXIT_CODE"

# Log to file if requested
if [ "$TIMING_LOG" = "1" ]; then
    echo "$TIMING_LOG_ENTRY" >> .timing.log
fi

# Show timing footer unless quiet
if [ "$TIMING_QUIET" != "1" ]; then
    echo "────────────────────────────────────────────────────────"
    echo "⏰ End time: $END_TIMESTAMP"
    echo "⏱️  Total duration: ${DURATION} seconds ($MINUTES minutes)"
    echo "📊 Exit code: $EXIT_CODE"

    if [ $EXIT_CODE -eq 0 ]; then
        echo "✅ Command completed successfully"
    else
        echo "❌ Command failed with exit code $EXIT_CODE"
    fi
fi

exit $EXIT_CODE
