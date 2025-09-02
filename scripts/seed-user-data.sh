#!/bin/bash

# User Data Seeding Script
# This script provides an easy way to seed user data with different scenarios

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
SCENARIO="small"
USER_COUNT=""
DISTRIBUTION=""
CLEAR_ONLY=false
HELP=false

# Function to show help
show_help() {
    echo -e "${BLUE}🌱 User Data Seeding Script${NC}"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -s, --scenario <type>    Seeding scenario (small, medium, large, custom)"
    echo "  -u, --users <count>      Custom number of users (for custom scenario)"
    echo "  -d, --distribution <preset>  Statistical distribution preset"
    echo "  -c, --clear              Clear user data only"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Scenarios:"
    echo "  small                    100 users (default)"
    echo "  medium                   1000 users"
    echo "  large                    10000 users"
    echo "  custom                   Use --users flag to specify count"
    echo ""
    echo "Examples:"
    echo "  $0                        # Seed with 100 users (default)"
    echo "  $0 --scenario medium      # Seed with 1000 users"
    echo "  $0 --scenario large       # Seed with 10000 users"
    echo "  $0 --scenario custom --users 500  # Seed with 500 users"
    echo "  $0 --distribution pareto  # Use Pareto distribution"
    echo "  $0 --scenario large --distribution pareto  # Large dataset with Pareto"
    echo "  $0 --distribution normal  # Use normal distribution"
    echo "  $0 --distribution realistic  # Use realistic patterns"
    echo "  $0 --clear                # Clear user data only"
    echo ""
    echo "Available Distribution Presets:"
    echo "  uniform, normal, pareto, exponential, poisson, realistic,"
    echo "  high-engagement, low-engagement, performance"
    echo ""
    echo "Memory Optimization:"
    echo "  This script automatically uses memory-optimized seeding for large datasets"
}

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1"
}

# Function to validate scenario
validate_scenario() {
    case "$1" in
        small|medium|large|custom)
            return 0
            ;;
        *)
            log_error "Invalid scenario: $1"
            log_error "Valid scenarios: small, medium, large, custom"
            return 1
            ;;
    esac
}

# Function to validate user count
validate_user_count() {
    if [[ ! "$1" =~ ^[0-9]+$ ]] || [ "$1" -lt 1 ]; then
        log_error "Invalid user count: $1"
        log_error "User count must be a positive integer"
        return 1
    fi

    if [ "$1" -gt 100000 ]; then
        log_warn "Very large user count: $1"
        log_warn "This may take a long time and require significant resources"
        read -p "Continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Operation cancelled"
            exit 0
        fi
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--scenario)
            SCENARIO="$2"
            shift 2
            ;;
        -u|--users)
            USER_COUNT="$2"
            shift 2
            ;;
        -d|--distribution)
            DISTRIBUTION="$2"
            shift 2
            ;;
        -c|--clear)
            CLEAR_ONLY=true
            shift
            ;;
        -h|--help)
            HELP=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Show help if requested
if [ "$HELP" = true ]; then
    show_help
    exit 0
fi

# Validate scenario
if ! validate_scenario "$SCENARIO"; then
    exit 1
fi

# Validate user count for custom scenario
if [ "$SCENARIO" = "custom" ]; then
    if [ -z "$USER_COUNT" ]; then
        log_error "Custom scenario requires --users flag"
        exit 1
    fi
    if ! validate_user_count "$USER_COUNT"; then
        exit 1
    fi
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "This script must be run from the project root directory"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed or not in PATH"
    exit 1
fi

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    log_error "pnpm is not installed or not in PATH"
    exit 1
fi

# Clear user data if requested
if [ "$CLEAR_ONLY" = true ]; then
    log "🧹 Clearing user data..."
    pnpm run seed:user-data:clear
    log "✅ User data cleared successfully!"
    exit 0
fi

# Determine the command to run
if [ "$SCENARIO" = "custom" ]; then
    COMMAND="pnpm run seed:user-data:custom $USER_COUNT"
    log "🚀 Starting custom user data seeding with $USER_COUNT users..."
else
    COMMAND="pnpm run seed:user-data:$SCENARIO"
    log "🚀 Starting $SCENARIO user data seeding..."
fi

# Add distribution option if specified
if [ -n "$DISTRIBUTION" ]; then
    COMMAND="$COMMAND --distribution $DISTRIBUTION"
    log "📊 Using distribution preset: $DISTRIBUTION"
fi

# Execute the seeding command
log "💡 Using memory-optimized seeding for optimal performance"
log "📊 Executing: $COMMAND"

if eval "$COMMAND"; then
    log "✅ User data seeding completed successfully!"
else
    log_error "User data seeding failed"
    exit 1
fi
