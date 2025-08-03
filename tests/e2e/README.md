# E2E Test Documentation

## Overview

This directory contains end-to-end tests for the Game Diary application. The tests are designed to validate user journeys and critical functionality across different browsers and devices.

## Mock Data System

### Overview

The E2E test suite includes a comprehensive mock data system that allows tests to run with consistent, predictable data instead of relying on external APIs. This ensures:

- **Reliability**: Tests don't fail due to API outages or data changes
- **Speed**: No network calls to external services
- **Consistency**: Predictable test results across different environments
- **Isolation**: Tests are independent of external data state

### Mock Data Configuration

The mock data system is controlled by environment variables:

- `E2E_MOCK_MODE`: Enable/disable mock mode for E2E tests
- `API_MOCK_MODE`: Enable/disable mock mode for API calls
- `E2E_POST_DEPLOY_VERIFICATION`: Special flag for post-deployment verification tests

### Mock Data Types

The following mock data types are available:

- **liveGames**: NBA live games data
- **nbaGames**: NBA games data
- **nbaTeams**: NBA teams data
- **nbaPlayers**: NBA players data
- **nbaStandings**: NBA standings data
- **nbaGameStatistics**: NBA game statistics
- **nbaPlayerStatistics**: NBA player statistics
- **nbaTeamStatistics**: NBA team statistics
- **nbaLeagues**: NBA leagues data
- **nbaSeasons**: NBA seasons data

### Usage in Tests

#### Basic Mock Data Setup

```typescript
import { commonTestSetup, enhancedTestSetup } from '@tests/e2e/utils/setup';
import { isMockModeEnabled, getMockDataByType } from '@tests/e2e/utils/mock-config';

test.describe('My Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Basic setup with mock data support
    await commonTestSetup(page, 'my-test-name');
  });

  test('should work with mock data', async ({ page }) => {
    // Check if mock mode is enabled
    if (isMockModeEnabled()) {
      const mockData = getMockDataByType('liveGames');
      console.log('Using mock data:', mockData);
    }

    // Your test logic here
  });
});
```

#### Enhanced Mock Data Setup

```typescript
test.describe('Enhanced Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Enhanced setup with specific mock scenario
    await enhancedTestSetup(page, {
      testName: 'enhanced-test',
      enableMockData: true,
      mockScenario: 'specific-scenario',
    });
  });

  test('should use specific mock scenario', async ({ page }) => {
    // Test with enhanced mock data configuration
  });
});
```

### Mock Data in Workflow

The GitHub Actions workflow automatically enables mock mode for all E2E tests except post-deployment verification:

```yaml
# Regular E2E tests (with mock mode enabled)
- name: Run E2E Tests
  env:
    E2E_MOCK_MODE: 'true'
    API_MOCK_MODE: 'true'
  run: pnpm test:e2e:navigation

# Post-deployment verification (mock mode disabled)
- name: Run Post-Deployment Verification E2E
  env:
    E2E_POST_DEPLOY_VERIFICATION: 'true'
    E2E_MOCK_MODE: 'false'
    API_MOCK_MODE: 'false'
  run: pnpm exec playwright test tests/e2e/functional/smoke.spec.ts
```

### Mock Data Provider

The mock data system uses a singleton provider pattern:

```typescript
import { mockDataProvider } from '@src/lib/mock';

// Enable mock mode
mockDataProvider.enableMockMode();

// Get all mock data
const allMockData = mockDataProvider.getAllMockData();

// Get specific mock data
const liveGames = mockDataProvider.getLiveGamesMock();
const nbaTeams = mockDataProvider.getNbaTeamsMock();
```

### E2E Mock Configuration

The E2E-specific mock configuration provides additional utilities:

```typescript
import { e2eMockConfig } from '@tests/e2e/utils/mock-config';

// Check if mock mode is enabled
if (e2eMockConfig.isMockModeEnabled()) {
  // Setup mock data for test
  e2eMockConfig.setupMockData('test-name');

  // Get mock data
  const mockData = e2eMockConfig.getMockData();

  // Check if endpoint should be mocked
  if (e2eMockConfig.shouldMockEndpoint('/api/proxy/games')) {
    // Mock this endpoint
  }
}
```

## Test Structure

### Functional Tests

Located in `tests/e2e/functional/`:

- **smoke.spec.ts**: Basic functionality tests
- **critical.spec.ts**: Critical path tests
- **live-games.spec.ts**: Live games functionality
- **navigation.spec.ts**: Navigation and routing
- **search.spec.ts**: Search functionality
- **auth-protection.spec.ts**: Authentication and authorization
- **auth-bypass.spec.ts**: Authentication bypass scenarios
- **mock-verification.spec.ts**: Mock data verification

### Page Tests

Located in `tests/e2e/pages/`:

- **clerk-auth.spec.ts**: Clerk authentication
- **dashboard.spec.ts**: User dashboard
- **sports.spec.ts**: Sports pages
- **content-page.spec.ts**: Content pages

### Test Utilities

Located in `tests/e2e/utils/`:

- **setup.ts**: Test setup utilities
- **mock-config.ts**: Mock data configuration
- **test-utils.ts**: Common test utilities
- **auth-modal.ts**: Authentication modal tests
- **live-games-tests.ts**: Live games test utilities
- **navigation.ts**: Navigation test utilities
- **page-tests.ts**: Page test utilities

## Running Tests

### Local Development

```bash
# Run all E2E tests with mock data
pnpm test:e2e:sanity

# Run specific test suite
pnpm test:e2e:navigation
pnpm test:e2e:live-games
pnpm test:e2e:search

# Run with specific browser
pnpm test:e2e:navigation --browser=chromium
pnpm test:e2e:navigation --browser=webkit
pnpm test:e2e:navigation --browser=firefox

# Run with UI mode
pnpm test:e2e:debug:ui
```

### CI/CD

The tests run automatically in the GitHub Actions workflow:

1. **Quality Gate**: Basic validation
2. **Unit Tests**: Unit test suite
3. **Database Tests**: Database trigger tests
4. **E2E Mock Verification**: Mock data verification
5. **E2E Tests**: Parallel browser tests (Chromium, WebKit, Firefox, Mobile)
6. **Post-Deployment Verification**: Production verification (no mock data)

### Environment Variables

Key environment variables for E2E tests:

```bash
# Mock data configuration
E2E_MOCK_MODE=true
API_MOCK_MODE=true

# Post-deployment verification (disables mock mode)
E2E_POST_DEPLOY_VERIFICATION=true

# Test configuration
CI=true
E2E_AUTH_BYPASS=true
TEST_USER_EMAIL=test@game-diary.com
TEST_USER_ID=test_user_123

# API configuration
NEXT_PUBLIC_RAPID_API_KEY=your_api_key
NEXT_PUBLIC_RAPID_API_HOST=api-nba-v1.p.rapidapi.com
NEXT_PUBLIC_RAPID_API_BASE_URL=https://api-nba-v1.p.rapidapi.com
```

## Best Practices

### Mock Data Usage

1. **Always check if mock mode is enabled** before using mock data
2. **Use specific mock data types** rather than all mock data
3. **Log mock data usage** for debugging
4. **Clean up mock data** after tests

### Test Structure

1. **Use descriptive test names** that explain the scenario
2. **Group related tests** in describe blocks
3. **Use beforeEach hooks** for common setup
4. **Clean up after tests** to avoid state pollution

### Performance

1. **Use mock data** for faster, more reliable tests
2. **Limit network calls** in tests
3. **Use appropriate timeouts** for different test types
4. **Run tests in parallel** when possible

### Debugging

1. **Enable debug mode** with `--debug` flag
2. **Use UI mode** for visual debugging
3. **Check mock data logs** for data issues
4. **Verify environment variables** are set correctly

## Troubleshooting

### Common Issues

1. **Mock data not loading**: Check `E2E_MOCK_MODE` environment variable
2. **Tests failing in CI**: Verify mock data is available
3. **Post-deployment tests failing**: Ensure mock mode is disabled
4. **Browser compatibility**: Test on multiple browsers

### Debug Commands

```bash
# Check mock data configuration
node -e "console.log(require('./src/lib/mock').mockDataProvider.isMockModeEnabled())"

# Run specific test with debug
pnpm exec playwright test tests/e2e/functional/smoke.spec.ts --debug

# Check environment variables
echo "E2E_MOCK_MODE: $E2E_MOCK_MODE"
echo "API_MOCK_MODE: $API_MOCK_MODE"
echo "E2E_POST_DEPLOY_VERIFICATION: $E2E_POST_DEPLOY_VERIFICATION"
```

## Coverage

The E2E test suite aims for comprehensive coverage of:

- **Core Navigation**: All main navigation paths
- **Authentication**: Sign in, sign up, protected routes
- **Sports Pages**: All major sports league pages
- **Live Games**: Live games functionality
- **User Dashboard**: User dashboard functionality
- **Admin Features**: Admin panel and database management
- **Responsive Design**: Mobile and tablet responsiveness
- **Error Handling**: 404, 500, and other error pages
- **Performance**: Page load times and performance metrics
- **Accessibility**: WCAG compliance and accessibility features
- **Cross Browser**: Cross-browser compatibility

See `coverage.config.ts` for detailed coverage targets and test categories.
