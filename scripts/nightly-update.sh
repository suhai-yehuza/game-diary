#!/bin/bash

# Configuration
EMAIL_RECIPIENTS=(
    "sportsdata22@gmail.com"
    "soyehuza@gmail.com"
)
PROJECT_NAME="NBA Game Diary"

# Function to send email
send_email() {
    local subject="$1"
    local body="$2"
    # Join all email addresses with commas
    local recipients=$(IFS=,; echo "${EMAIL_RECIPIENTS[*]}")
    echo "$body" | mail -s "[$PROJECT_NAME] $subject" "$recipients"
}

# Function to handle errors
handle_error() {
    local error_msg="$1"
    local timestamp=$(date)
    echo "Error: $error_msg at $timestamp" >> logs/nightly-update.log
    send_email "Nightly Update Failed" "The nightly update failed with the following error:\n\n$error_msg\n\nTimestamp: $timestamp"
    exit 1
}

# Set up error handling
trap 'handle_error "Script failed unexpectedly"' ERR

# Get the current NBA season (assuming it's the current year if we're in the latter half)
CURRENT_YEAR=$(date +%Y)
CURRENT_MONTH=$(date +%m)
CURRENT_SEASON=$CURRENT_YEAR

# If we're in the first half of the year, use previous year as season
if [ "$CURRENT_MONTH" -lt 7 ]; then
    CURRENT_SEASON=$((CURRENT_YEAR - 1))
fi

# Determine project directory
if [ -n "$VERCEL_DIR" ]; then
    # We're in a Vercel environment
    PROJECT_DIR="$VERCEL_DIR"
else
    # Local development or other environment
    PROJECT_DIR="$(dirname "$0")/.."
fi

# Change to the project directory
cd "$PROJECT_DIR" || handle_error "Failed to change to project directory: $PROJECT_DIR"

# Create logs directory if it doesn't exist
mkdir -p logs

# Start time for duration calculation
START_TIME=$(date +%s)

# Run the seeder with appropriate parameters
echo "Starting nightly update at $(date)" >> logs/nightly-update.log
echo "Running in directory: $PROJECT_DIR" >> logs/nightly-update.log

if ! tsx --max-old-space-size=24576 src/lib/db/seed/optimized-seeder.ts -- \
    --batchSize=10 \
    --concurrency=10 \
    --seasons=$CURRENT_SEASON \
    --resetDb=false \
    --skipExternalDb=false \
    --skipApplicationDb=true \
    --appendingData=true \
    --enableMonitoring=true \
    --aggregate-output >> logs/nightly-update.log 2>&1; then
    handle_error "Seeder script failed"
fi

# Calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
DURATION_STR=$(printf '%dh:%dm:%ds\n' $((DURATION/3600)) $((DURATION%3600/60)) $((DURATION%60)))

# Log the completion
echo "Nightly update completed at $(date)" >> logs/nightly-update.log

# Send success email
send_email "Nightly Update Completed Successfully" "The nightly update has completed successfully.\n\nDetails:\n- Season: $CURRENT_SEASON\n- Duration: $DURATION_STR\n- Completed at: $(date)\n- Project Directory: $PROJECT_DIR\n\nCheck logs/nightly-update.log for more details." 