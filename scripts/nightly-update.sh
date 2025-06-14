#!/bin/bash

# Configuration
EMAIL_RECIPIENTS=(
    "sportsdata22@gmail.com"
    "soyehuza@gmail.com"
)
PROJECT_NAME="NBA Game Diary"
SENDGRID_API_KEY="${SENDGRID_API_KEY:-}"  # Get this from SendGrid dashboard
SENDGRID_FROM_EMAIL="sportsdata22@gmail.com"  # Using a verified email address

# Function to send email
send_email() {
    local subject="$1"
    local body="$2"
    
    if [ -z "$SENDGRID_API_KEY" ]; then
        echo "Warning: SENDGRID_API_KEY not set. Email not sent." > logs/nightly-update.log
        return 1
    fi
    
    echo "Attempting to send email..." >> logs/nightly-update.log
    echo "From: $SENDGRID_FROM_EMAIL" >> logs/nightly-update.log
    echo "To: ${EMAIL_RECIPIENTS[*]}" >> logs/nightly-update.log
    echo "Subject: [$PROJECT_NAME] $subject" >> logs/nightly-update.log
    
    # Create JSON payload
    local json_payload=$(cat <<EOF
{
    "personalizations": [
        {
            "to": [
                $(printf '{"email": "%s"}' "${EMAIL_RECIPIENTS[0]}")
                $(for email in "${EMAIL_RECIPIENTS[@]:1}"; do printf ',\n                {"email": "%s"}' "$email"; done)
            ]
        }
    ],
    "from": {
        "email": "$SENDGRID_FROM_EMAIL",
        "name": "$PROJECT_NAME"
    },
    "subject": "[$PROJECT_NAME] $subject",
    "content": [
        {
            "type": "text/plain",
            "value": "$body"
        }
    ]
}
EOF
)

    echo "Sending email via SendGrid API..." >> logs/nightly-update.log
    
    # Send email using SendGrid API and capture the response
    local response=$(curl -s -X POST \
        --url 'https://api.sendgrid.com/v3/mail/send' \
        --header "Authorization: Bearer $SENDGRID_API_KEY" \
        --header 'Content-Type: application/json' \
        --data "$json_payload" 2>&1)
    
    echo "SendGrid API Response: $response" >> logs/nightly-update.log
    
    if [ $? -eq 0 ]; then
        echo "Email sent successfully" >> logs/nightly-update.log
        return 0
    else
        echo "Failed to send email. Response: $response" >> logs/nightly-update.log
        return 1
    fi
}

# Function to handle errors
handle_error() {
    local error_msg="$1"
    local timestamp=$(date)
    echo "Error: $error_msg at $timestamp" > logs/nightly-update.log
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

# Determine which env file to use
if [ -n "$VERCEL_ENV" ]; then
    ENV_FILE=".env.production"
else
    ENV_FILE=".env"
fi

# If the determined env file does not exist, fall back to .env.development
if [ ! -f "$ENV_FILE" ]; then
    ENV_FILE=".env.development"
fi

# Log which env file is being used
: > logs/nightly-update.log

echo "Using environment file: $ENV_FILE" > logs/nightly-update.log

# Load environment variables from the selected env file
if [ -f "$ENV_FILE" ]; then
    set -o allexport
    source "$ENV_FILE"
    set +o allexport
else
    echo "Environment file $ENV_FILE not found. Exiting." > logs/nightly-update.log
    exit 1
fi

# Start time for duration calculation
START_TIME=$(date +%s)

# Run the seeder with appropriate parameters
echo "Starting nightly update at $(date)" > logs/nightly-update.log
echo "Running in directory: $PROJECT_DIR" > logs/nightly-update.log

# Get the last game date from the database, considering only games with status = 'Finished'
LAST_GAME_DATE=$(tsx -e "
const path = require('path');
const { createDatabaseClient } = require('./src/lib/db/seed/config');
const { games } = require('./src/lib/db/schema/game-schemas');
const { eq, desc } = require('drizzle-orm');

async function getLastGameDate() {
  const db = createDatabaseClient();
  const lastGame = await db.query.games.findFirst({
    where: eq(games.status, 'Finished'),
    orderBy: (games, { desc }) => [desc(games.date)]
  });
  console.log(lastGame ? lastGame.date.toISOString() : '');
}

getLastGameDate();
")

if [ -z "$LAST_GAME_DATE" ]; then
    echo "No previous games found, processing entire season" > logs/nightly-update.log
    LAST_GAME_DATE=""
else
    echo "Processing games from $LAST_GAME_DATE" > logs/nightly-update.log
    
    # Get current date in ISO format
    CURRENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
    
    # Extract just the date part from both timestamps
    LAST_GAME_DATE_ONLY=$(echo "$LAST_GAME_DATE" | cut -d'T' -f1)
    CURRENT_DATE_ONLY=$(echo "$CURRENT_DATE" | cut -d'T' -f1)
    
    # Compare dates
    if [ "$LAST_GAME_DATE_ONLY" = "$CURRENT_DATE_ONLY" ]; then
        echo "Games are already up to date with current date ($CURRENT_DATE_ONLY). Skipping update." > logs/nightly-update.log
        send_email "Nightly Update Skipped" "The nightly update was skipped because games are already up to date with the current date ($CURRENT_DATE_ONLY)."
        exit 0
    fi
fi

if ! tsx --max-old-space-size=24576 src/lib/db/seed/optimized-seeder.ts -- \
    --batchSize=10 \
    --concurrency=10 \
    --seasons=$CURRENT_SEASON \
    --resetDb=false \
    --skipExternalDb=false \
    --skipApplicationDb=true \
    --appendingData=true \
    --enableMonitoring=true \
    --aggregate-output \
    --startDate="$LAST_GAME_DATE" > logs/nightly-update.log 2>&1; then
    handle_error "Seeder script failed"
fi

# Calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
DURATION_STR=$(printf '%dh:%dm:%ds\n' $((DURATION/3600)) $((DURATION%3600/60)) $((DURATION%60)))

# Log the completion
echo "Nightly update completed at $(date)" > logs/nightly-update.log

# Send success email
send_email "Nightly Update Completed Successfully" "The nightly update has completed successfully.\n\nDetails:\n- Season: $CURRENT_SEASON\n- Duration: $DURATION_STR\n- Completed at: $(date)\n- Project Directory: $PROJECT_DIR\n- Environment File: $ENV_FILE\n- Last Processed Date: $LAST_GAME_DATE\n\nCheck logs/nightly-update.log for more details." 