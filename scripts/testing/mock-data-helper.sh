#!/bin/bash

# Mock Data Helper Script
# Assists developers with mock data configuration and testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Source shared utilities
source "$(dirname "$0")/../script-utils.sh"

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MOCK_SERVER_URL="http://localhost:3000/api/mock-server"

# Mock data types
MOCK_DATA_TYPES=(
  "liveGames"
  "nbaGames"
  "nbaTeams"
  "nbaPlayers"
  "nbaStandings"
  "nbaGameStatistics"
  "nbaPlayerStatistics"
  "nbaTeamStatistics"
  "nbaLeagues"
  "nbaSeasons"
)

# Utility functions
check_file_exists() {
  local file_path="$1"
  local description="$2"

  if [ -f "$file_path" ]; then
    echo -e "  ${GREEN}✓${NC} $description"
    return 0
  else
    echo -e "  ${RED}✗${NC} $description (missing)"
    return 1
  fi
}

test_endpoint() {
  local endpoint="$1"
  local description="$2"
  local jq_filter="${3:-}"

  if [ -n "$jq_filter" ]; then
    if curl -s "$endpoint" | jq -e "$jq_filter" > /dev/null 2>&1; then
      echo -e "  ${GREEN}✓${NC} $description"
      return 0
    else
      echo -e "  ${RED}✗${NC} $description"
      return 1
    fi
  else
    if curl -s "$endpoint" > /dev/null 2>&1; then
      echo -e "  ${GREEN}✓${NC} $description"
      return 0
    else
      echo -e "  ${RED}✗${NC} $description"
      return 1
    fi
  fi
}

check_server_running() {
  if curl -s "$MOCK_SERVER_URL/health" > /dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

print_environment_vars() {
  echo "Environment Variables:"
  echo "  E2E_MOCK_MODE: ${E2E_MOCK_MODE:-'not set'}"
  echo "  API_MOCK_MODE: ${API_MOCK_MODE:-'not set'}"
  echo "  E2E_POST_DEPLOY_VERIFICATION: ${E2E_POST_DEPLOY_VERIFICATION:-'not set'}"
  echo "  CI: ${CI:-'not set'}"
}

check_mock_data_files() {
  echo -e "\nMock Data Files:"
  for type in "${MOCK_DATA_TYPES[@]}"; do
    file_path="$PROJECT_ROOT/src/lib/mock/${type}Mock.ts"
    check_file_exists "$file_path" "$type"
  done
}

check_mock_server_components() {
  echo -e "\nMock Server Components:"

  local components=(
    "$PROJECT_ROOT/src/lib/mock-server/index.ts:Mock server core"
    "$PROJECT_ROOT/src/app/api/mock-server/route.ts:Mock server API routes"
    "$PROJECT_ROOT/src/lib/types/mockServer.types.ts:Mock server types"
  )

  for component in "${components[@]}"; do
    IFS=':' read -r file_path description <<< "$component"
    check_file_exists "$file_path" "$description"
  done
}

test_mock_server_functionality() {
  if ! check_server_running; then
    echo -e "\n${YELLOW}⚠${NC} Mock server is not running"
    echo -e "  ${BLUE}ℹ${NC} Start server with: pnpm dev"
    return
  fi

  echo -e "\nMock Server Functionality:"

  # Test health endpoint
  test_endpoint "$MOCK_SERVER_URL/health" "Health endpoint" '.status == "healthy"'

  # Test mock data endpoint
  test_endpoint "$MOCK_SERVER_URL/data?type=nba-games" "Mock data endpoint" '.success == true'

  # Test database endpoint
  test_endpoint "$MOCK_SERVER_URL?action=database&operation=SELECT&table=users" "Database endpoint" '.success == true'
}

# Show usage information
show_usage() {
  cat << EOF
Mock Data Helper Script

Usage: $0 [COMMAND] [OPTIONS]

Commands:
  check           Check mock data configuration and availability
  enable          Enable mock mode for local development
  disable         Disable mock mode for local development
  test            Run mock data verification tests
  list            List available mock data types
  validate        Validate mock data structure
  help            Show this help message

Options:
  --type=TYPE     Specify mock data type for specific operations
  --verbose       Enable verbose output
  --debug         Enable debug mode

Examples:
  $0 check                    # Check mock data configuration
  $0 enable                   # Enable mock mode
  $0 test                     # Run mock verification tests
  $0 list                     # List available mock data types
  $0 validate --type=liveGames # Validate live games mock data
EOF
}

# Check mock data configuration
check_mock_config() {
  log_info "Checking mock data configuration..."

  print_environment_vars
  check_mock_data_files

  # Check mock data provider via HTTP API
  echo -e "\nMock Data Provider:"
  if check_server_running; then
    echo -e "  ${GREEN}✓${NC} Mock data provider is available (via HTTP API)"
  else
    echo -e "  ${YELLOW}⚠${NC} Mock data provider check requires running server"
    echo -e "  ${BLUE}ℹ${NC} Start server with: pnpm dev"
  fi

  # Check E2E mock config
  echo -e "\nE2E Mock Configuration:"
  check_file_exists "$PROJECT_ROOT/tests/e2e/utils/mock-config.ts" "E2E mock configuration file"

  check_mock_server_components
  test_mock_server_functionality
}

# Enable mock mode
enable_mock_mode() {
  log_info "Enabling mock mode..."

  # Set environment variables
  export E2E_MOCK_MODE=true
  export API_MOCK_MODE=true
  unset E2E_POST_DEPLOY_VERIFICATION

  echo "Environment variables set:"
  echo "  E2E_MOCK_MODE=true"
  echo "  API_MOCK_MODE=true"
  echo "  E2E_POST_DEPLOY_VERIFICATION=unset"

  echo -e "\n${GREEN}Mock mode enabled!${NC}"
  echo "You can now run E2E tests with mock data:"
  echo "  pnpm test:e2e:sanity"
  echo "  pnpm test:e2e:navigation"
  echo "  pnpm test:e2e:live-games"
}

# Disable mock mode
disable_mock_mode() {
  log_info "Disabling mock mode..."

  # Unset environment variables
  unset E2E_MOCK_MODE
  unset API_MOCK_MODE

  echo "Environment variables unset:"
  echo "  E2E_MOCK_MODE=unset"
  echo "  API_MOCK_MODE=unset"

  echo -e "\n${YELLOW}Mock mode disabled!${NC}"
  echo "Tests will now use real API data (if available)"
}

# Run mock data verification tests
run_mock_tests() {
  log_info "Running mock data verification tests..."

  # Check if we're in the right directory
  if [ ! -f "package.json" ]; then
    log_error "Please run this script from the project root directory"
    exit 1
  fi

  # Run mock verification test
  echo "Running mock verification test..."
  if pnpm test:e2e:mock-verification; then
    echo -e "\n${GREEN}✓ Mock verification tests passed!${NC}"
  else
    echo -e "\n${RED}✗ Mock verification tests failed!${NC}"
    exit 1
  fi

  # Run a quick smoke test with mock data
  echo -e "\nRunning smoke test with mock data..."
  if E2E_MOCK_MODE=true API_MOCK_MODE=true pnpm test:e2e:sanity; then
    echo -e "\n${GREEN}✓ Smoke test with mock data passed!${NC}"
  else
    echo -e "\n${RED}✗ Smoke test with mock data failed!${NC}"
    exit 1
  fi
}

# List available mock data types
list_mock_types() {
  log_info "Available mock data types:"

  for type in "${MOCK_DATA_TYPES[@]}"; do
    file_path="$PROJECT_ROOT/src/lib/mock/${type}Mock.ts"
    if check_file_exists "$file_path" "$type"; then
      # Show function name if available
      if grep -q "export function createMock" "$file_path" 2>/dev/null; then
        func_name=$(grep -o "export function createMock[^(]*" "$file_path" | head -1)
        echo "      Function: $func_name"
      fi
    fi
  done
}

# Validate mock data structure
validate_mock_data() {
  local mock_type="${1:-}"

  if [ -z "$mock_type" ]; then
    log_error "Please specify a mock data type with --type=TYPE"
    echo "Available types:"
    for type in "${MOCK_DATA_TYPES[@]}"; do
      echo "  - $type"
    done
    exit 1
  fi

  log_info "Validating mock data for type: $mock_type"

  # Check if the mock data file exists
  file_path="$PROJECT_ROOT/src/lib/mock/${mock_type}Mock.ts"
  if ! check_file_exists "$file_path" "Mock data file"; then
    log_error "Mock data file not found: $file_path"
    exit 1
  fi

  # Validate the mock data structure
  echo "Checking mock data structure..."

  # Create a temporary TypeScript script
  cat > /tmp/validate_mock.ts << EOF
  try {
    const mockData = require('$PROJECT_ROOT/src/lib/mock').mockDataProvider.getLiveGamesMock();
    console.log('Mock data structure:');
    console.log('  Type:', typeof mockData);
    console.log('  Keys:', Object.keys(mockData || {}));
    if (mockData && typeof mockData === 'object') {
      console.log('  Sample data:', JSON.stringify(mockData, null, 2).substring(0, 500) + '...');
    }
    console.log('✓ Mock data validation passed');
  } catch (error) {
    console.error('✗ Mock data validation failed:', error.message);
    process.exit(1);
  }
EOF

  if npx tsx /tmp/validate_mock.ts; then
    echo -e "\n${GREEN}✓ Mock data validation passed!${NC}"
  else
    echo -e "\n${RED}✗ Mock data validation failed!${NC}"
    exit 1
  fi
}

# Main script logic
main() {
  local command="${1:-help}"
  local mock_type=""
  local verbose=false
  local debug=false

  # Parse arguments
  shift
  while [[ $# -gt 0 ]]; do
    case $1 in
      --type=*)
        mock_type="${1#*=}"
        shift
        ;;
      --verbose)
        verbose=true
        shift
        ;;
      --debug)
        debug=true
        shift
        ;;
      *)
        log_error "Unknown option: $1"
        show_usage
        exit 1
        ;;
    esac
  done

  # Set debug mode
  if [ "$debug" = true ]; then
    set -x
  fi

  # Execute command
  case "$command" in
    check)
      check_mock_config
      ;;
    enable)
      enable_mock_mode
      ;;
    disable)
      disable_mock_mode
      ;;
    test)
      run_mock_tests
      ;;
    list)
      list_mock_types
      ;;
    validate)
      validate_mock_data "$mock_type"
      ;;
    help|--help|-h)
      show_usage
      ;;
    *)
      log_error "Unknown command: $command"
      show_usage
      exit 1
      ;;
  esac
}

# Run main function with all arguments
main "$@"
