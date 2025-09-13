#!/bin/bash

# CI wrapper to simulate integration tests for both development and production env files
# This script sources .env.development and .env.production (if present) and runs the
# integration test runner for each environment with CI=true.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

usage() {
  cat <<EOF
Usage: CI=true $0 [--help]

Runs integration tests twice in CI:
  1) With variables from .env.development
  2) With variables from .env.production

Relies on scripts/testing/integration.sh to manage server and run tests.

Environment variables:
  CI=true            Ensures CI-mode is active

Notes:
  - This script exports variables from the env files into the process environment.
  - It unsets DATABASE_URL/POSTGRES_URL between runs to avoid cross-env leakage.
  - Integration tests require a Neon DATABASE_URL to be reachable.
EOF
}

if [[ "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ "${CI:-}" != "true" ]]; then
  echo "⚠️  CI environment not detected (CI=true). Continuing anyway..."
fi

load_env_file() {
  local env_file="$1"
  if [[ -f "$env_file" ]]; then
    echo "🔧 Loading environment from $env_file"
    # shellcheck disable=SC1090
    set -a; source "$env_file"; set +a
  else
    echo "⚠️  $env_file not found. Skipping explicit load; relying on existing environment."
  fi
}

run_for_env() {
  local node_env="$1"
  local env_file="$2"
  local override_url="${3:-}"

  echo "\n==============================================="
  echo "🏃 Running integration tests for NODE_ENV=$node_env"
  echo "===============================================\n"

  # Avoid cross-env leakage for critical DB vars
  unset DATABASE_URL || true
  unset POSTGRES_URL || true

  export NODE_ENV="$node_env"
  export CI=true

  # Prefer explicit overrides from CI secrets if provided
  if [[ -n "$override_url" ]]; then
    export DATABASE_URL="$override_url"
  else
    load_env_file "$env_file"
  fi

  # Basic validation
  if [[ -z "${DATABASE_URL:-}" && -z "${POSTGRES_URL:-}" ]]; then
    echo "❌ Missing DATABASE_URL/POSTGRES_URL after loading $env_file"
    exit 1
  fi

  # Do not echo the full connection string to avoid leaking secrets
  echo "✅ Database URL detected for $node_env"

  # Run cleanup before tests
  echo "🧹 Running pre-test cleanup for $node_env..."
  (cd "$ROOT_DIR" && tsx scripts/testing/cleanup-integration-tests.ts)

  # Delegate to the unified integration runner (manages server + runs tests)
  # Run only integration tests to avoid unit noise
  (cd "$ROOT_DIR" && VITEST_ARGS="tests/integration" ./scripts/testing/integration.sh --force-server)

  # Run post-test cleanup
  echo "🧹 Running post-test cleanup for $node_env..."
  (cd "$ROOT_DIR" && tsx scripts/testing/post-integration-cleanup.ts)
}

# Read optional explicit URLs from CI environment
DEV_OVERRIDE_URL="${DATABASE_URL_DEVELOPMENT:-${DATABASE_URL_DEV:-}}"
PROD_OVERRIDE_URL="${DATABASE_URL_PRODUCTION:-${DATABASE_URL_PROD:-}}"

STATUS=0

# Development
if ! run_for_env "development" "$ROOT_DIR/.env.development" "$DEV_OVERRIDE_URL"; then
  STATUS=1
fi

# Production
if ! run_for_env "production" "$ROOT_DIR/.env.production" "$PROD_OVERRIDE_URL"; then
  STATUS=1
fi

if [[ $STATUS -eq 0 ]]; then
  echo "\n✅ Integration tests completed for development and production environments."
else
  echo "\n❌ Integration tests had failures. See logs above."
fi
exit $STATUS
