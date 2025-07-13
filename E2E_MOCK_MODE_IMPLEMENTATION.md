# E2E Mock Mode Implementation

## Overview

Updated the E2E testing environment to enable mock mode for live games functionality, ensuring consistent test behavior regardless of external API availability.

## Changes Made

### 1. Environment Variables

- **`E2E_MOCK_MODE=true`**: New environment variable to specifically enable mock mode in E2E tests
- **`API_MOCK_MODE=true`**: Existing environment variable maintained for backward compatibility

### 2. Server Configuration Updates

#### `scripts/e2e-helpers.sh`

- Updated `start_e2e_server()` function to include both environment variables:
  ```bash
  API_MOCK_MODE=true E2E_MOCK_MODE=true pnpm dev -p $DEFAULT_PORT
  ```

#### `playwright.config.ts`

- Updated web server configuration to include both environment variables:
  ```typescript
  command: `NODE_ENV=development API_MOCK_MODE=true E2E_MOCK_MODE=true pnpm dev -p ${port}`;
  ```

### 3. Package.json Script Updates

Updated all E2E test scripts to include `E2E_MOCK_MODE=true`:

- `test:e2e:mock-verification`
- `test:e2e:sanity`
- `test:e2e:smoke`
- `test:e2e:search`
- `test:e2e:performance`
- `test:e2e:pages` (and all sub-pages)
- `test:e2e:live-games`

### 4. CI Script Updates

#### `scripts/ci.sh`

Updated all E2E test commands in the CI pipeline:

- `sanity` tests
- `smoke` tests
- `critical` tests
- `responsive` tests
- `cross-browser` tests
- `full` tests

#### `scripts/e2e.sh`

Updated E2E script commands:

- Responsive tests
- Coverage report generation
- Timeout-based test execution

### 5. Hook Behavior

The `useLiveGames` hook already supports the `E2E_MOCK_MODE` environment variable and will:

- Return mock data when `E2E_MOCK_MODE=true`
- Skip API calls and return mock data immediately
- Ensure consistent test behavior

## Testing the Implementation

### Manual Verification

```bash
# Test environment variable setting
E2E_MOCK_MODE=true node -e "console.log('E2E_MOCK_MODE:', process.env.E2E_MOCK_MODE)"

# Run E2E tests with mock mode
pnpm test:e2e:sanity
pnpm test:e2e:live-games
```

### Expected Behavior

- Live games banner should render with mock data in E2E tests
- Tests should pass consistently regardless of external API status
- No dependency on live sports data availability

## Benefits

1. **Consistent Test Results**: Tests no longer depend on external API availability
2. **Faster Test Execution**: No need to wait for API responses
3. **Reliable CI/CD**: E2E tests will pass consistently in all environments
4. **Isolated Testing**: Tests are isolated from external dependencies

## Environment Variable Hierarchy

The `useLiveGames` hook checks for mock mode in this order:

1. `process.env.NODE_ENV === 'test'`
2. `process.env.API_MOCK_MODE === 'true'`
3. `process.env.E2E_MOCK_MODE === 'true'`

If any of these conditions are met, the hook returns mock data instead of making API calls.
