#!/bin/bash

# Timed Run Script - Consolidated
# Execute any command with timing and logging
# Usage: ./scripts/timed-run.sh [mode] <command>
#
# Modes:
#   command   - Time any command (default)
#   pnpm      - Time pnpm commands
#   script    - Time pnpm script commands with enhanced logging
#
# Examples:
#   ./scripts/timed-run.sh command "pnpm build"
#   ./scripts/timed-run.sh pnpm build
#   ./scripts/timed-run.sh script test:e2e:sanity

set -e

# Function to show usage
show_usage() {
    echo "Usage: $0 [mode] <command>"
    echo ""
    echo "Modes:"
    echo "  command   - Time any command (default)"
    echo "  pnpm      - Time pnpm commands"
    echo "  script    - Time pnpm script commands with enhanced logging"
    echo ""
    echo "Examples:"
    echo "  $0 command 'pnpm build'"
    echo "  $0 pnpm build"
    echo "  $0 script test:e2e:sanity"
    echo ""
    echo "Environment variables:"
    echo "  TIMING_QUIET=1: Suppress timing output"
    echo "  TIMING_LOG=1: Log timing to file (default: enabled)"
}

# Function to time a command
time_command() {
    local command="$1"
    local description="${2:-$command}"

    local start_time=$(date +%s)
    local start_timestamp=$(date)

    echo "🚀 Starting: $description"
    echo "⏰ Start time: $start_timestamp"
    echo "────────────────────────────────────────────────────────"

    # Execute the command
    eval "$command"
    local exit_code=$?

    local end_time=$(date +%s)
    local end_timestamp=$(date)
    local duration=$((end_time - start_time))
    local minutes=$(echo "scale=2; $duration/60" | bc 2>/dev/null || echo "0")

    # Create timing log entry
    local timing_log_entry="$(date '+%Y-%m-%d %H:%M:%S') | $description | ${duration}s | $minutes min | exit:$exit_code"

    # Log to file if requested
    if [ "${TIMING_LOG:-1}" = "1" ]; then
        echo "$timing_log_entry" >> .timing.log
    fi

    echo "────────────────────────────────────────────────────────"
    echo "⏰ End time: $end_timestamp"
    echo "⏱️  Total duration: ${duration} seconds ($minutes minutes)"
    echo "📊 Exit code: $exit_code"

    if [ $exit_code -eq 0 ]; then
        echo "✅ Command completed successfully"
    else
        echo "❌ Command failed with exit code $exit_code"
    fi

    return $exit_code
}

# Function to time pnpm commands
time_pnpm() {
    local pnpm_command="$1"
    local description="pnpm $pnpm_command"

    time_command "pnpm $pnpm_command" "$description"
}

# Function to time pnpm script commands with enhanced logging
time_script() {
    local script_name="$1"
    local description="pnpm $script_name"

    # Set TIMING_LOG=1 by default unless explicitly set
    : "${TIMING_LOG:=1}"

    local start_time=$(date +%s)
    local start_timestamp=$(date)

    # Check if timing should be quiet
    if [ "$TIMING_QUIET" = "1" ]; then
        # Run command silently but still time it
        pnpm "$script_name" > /dev/null 2>&1
        local exit_code=$?
    else
        # Show timing header
        echo "🚀 Starting: pnpm $script_name"
        echo "⏰ Start time: $start_timestamp"
        echo "────────────────────────────────────────────────────────"

        # Run the command and capture its exit code
        pnpm "$script_name"
        local exit_code=$?
    fi

    local end_time=$(date +%s)
    local end_timestamp=$(date)
    local duration=$((end_time - start_time))
    local minutes=$(echo "scale=2; $duration/60" | bc 2>/dev/null || echo "0")

    # Create timing log entry
    local timing_log_entry="$(date '+%Y-%m-%d %H:%M:%S') | pnpm $script_name | ${duration}s | $minutes min | exit:$exit_code"

    # Log to file if requested
    if [ "$TIMING_LOG" = "1" ]; then
        echo "$timing_log_entry" >> .timing.log
    fi

    # Show timing footer unless quiet
    if [ "$TIMING_QUIET" != "1" ]; then
        echo "────────────────────────────────────────────────────────"
        echo "⏰ End time: $end_timestamp"
        echo "⏱️  Total duration: ${duration} seconds ($minutes minutes)"
        echo "📊 Exit code: $exit_code"

        if [ $exit_code -eq 0 ]; then
            echo "✅ Command completed successfully"
        else
            echo "❌ Command failed with exit code $exit_code"
        fi
    fi

    return $exit_code
}

# Main script logic
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

MODE="${1:-command}"

case "$MODE" in
    "command")
        if [ $# -lt 2 ]; then
            echo "❌ Error: command mode requires a command to execute"
            show_usage
            exit 1
        fi
        shift  # Remove mode argument
        time_command "$*"
        ;;
    "pnpm")
        if [ $# -lt 2 ]; then
            echo "❌ Error: pnpm mode requires a pnpm command"
            show_usage
            exit 1
        fi
        shift  # Remove mode argument
        time_pnpm "$*"
        ;;
    "script")
        if [ $# -lt 2 ]; then
            echo "❌ Error: script mode requires a script name"
            show_usage
            exit 1
        fi
        shift  # Remove mode argument
        time_script "$*"
        ;;
    "-h"|"--help"|"help")
        show_usage
        exit 0
        ;;
    *)
        # If no mode specified, treat first argument as command
        time_command "$*"
        ;;
esac
