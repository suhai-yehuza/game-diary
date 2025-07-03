#!/bin/bash
# scripts/timed-pnpm.sh

if [ -z "$1" ]; then
  echo "Usage: $0 <script> [args...]"
  exit 1
fi

SCRIPT="$1"
shift

# Run the timing wrapper with the script name and any additional arguments
./scripts/timed-run.sh pnpm run "$SCRIPT" "$@"
