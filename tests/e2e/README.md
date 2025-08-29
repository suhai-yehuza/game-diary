# E2E Test Documentation

## Overview

This directory contains end-to-end tests for the Game Diary application. The tests are designed to validate user journeys and critical functionality across different browsers and devices.

## 🚀 **Optimized Test Structure**

### **New Architecture**

The E2E test suite has been optimized with the following improvements:

#### **📁 File Organization**

```
tests/e2e/
├── functional/                    # Core test suites
│   ├── smoke.spec.ts             # ✅ Optimized smoke tests
│   ├── mock-server.spec.ts       # ✅ Optimized mock server tests
│   ├── critical.spec.ts          # Critical functionality tests
│   ├── navigation.spec.ts        # Navigation and routing tests
│   ├── search.spec.ts            # Search functionality tests
│   ├── live-games.spec.ts        # Live games functionality
│   ├── auth-bypass.spec.ts       # Authentication bypass tests
│   ├── auth-protection.spec.ts   # Authentication protection tests
│   └── ...                       # Other test suites
├── utils/                        # Shared utilities
│   ├── test-utils.ts             # ✅ Core test utilities (simplified)
│   ├── page-checks.ts            # ✅ Page validation utilities
│   ├── performance.ts            # ✅ Performance & error checking
│   ├── test-config.ts            # ✅ Centralized configuration
│   ├── mock-config.ts            # Mock data configuration
│   └── ...                       # Other utilities
├── pages/                        # Page-specific tests
└── coverage.config.ts            # Coverage configuration
```

#### **🔧 Key Improvements**

1. **Modular Utilities**: Split large utility files into focused modules
2. **Centralized Configuration**: All test configs in `test-config.ts`
3. **Enhanced Test Runners**: Better error handling and logging
4. **Optimized Test Patterns**: Consistent, maintainable test structure
5. **Comprehensive Mock Server Testing**: Full coverage of mock endpoints

## Mock Data System

### Overview

The E2E test suite includes a comprehensive mock data system that allows tests to run with consistent, predictable data instead of relying on external APIs. This ensures:

- **Reliability**: Tests don't fail due to API outages or data changes
- **Speed**: No network calls to external services
- **Consistency**: Predictable test results across different environments
- **Isolation**: Tests are independent of external data state

### Mock Data Configuration

The mock data system is controlled by environment variables:

- `MOCK_MODE`: Enable/disable mock mode for API calls and E2E tests
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

## 🧪 **Test Categories**

### **Smoke Tests** (`@smoke`)

- **Purpose**: Quick validation of core functionality
- **Scope**: Essential user journeys
- **Duration**: Fast execution (< 2 minutes)
- **Parallel**: Sequential execution for reliability

### **Critical Tests** (`@critical`)

- **Purpose**: Validation of critical user paths
- **Scope**: Authentication, protected routes, error handling
- **Duration**: Medium execution (< 5 minutes)
- **Parallel**: Sequential execution for stability

### **Full Tests** (`@full`)

- **Purpose**: Comprehensive application testing
- **Scope**: All features, accessibility, performance
- **Duration**: Extended execution (< 10 minutes)
- **Parallel**: Parallel execution for speed

### **Sanity Tests** (`@sanity`)

- **Purpose**: Basic functionality verification
- **Scope**: Page loading, structure, navigation
- **Duration**: Very fast execution (< 1 minute)

## 📋 **Usage Examples**

### **Basic Test Setup**

```typescript
import { test } from '@playwright/test';
import { commonTestSetup } from '@tests/e2e/utils/setup';
import { clearTestData } from '@tests/e2e/utils/test-utils';

test.describe('My Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await commonTestSetup(page, 'my-test-name');
  });

  test('@smoke should work correctly', async ({ page }) => {
    // Your test logic here
  });
});
```

### **Enhanced Test Setup with Mock Data**

```typescript
import { test } from '@playwright/test';
import { enhancedTestSetup } from '@tests/e2e/utils/setup';
import { isMockModeEnabled } from '@tests/e2e/utils/mock-config';

test.describe('Enhanced Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await enhancedTestSetup(page, {
      testName: 'enhanced-test',
      enableMockData: true,
      mockScenario: 'specific-scenario',
    });
  });

  test('@critical should use mock data', async ({ page }) => {
    if (isMockModeEnabled()) {
      console.log('✅ Mock data is enabled');
    }
    // Your test logic here
  });
});
```

### **Optimized Test Runner Pattern**

```typescript
import { OptimizedTestRunner } from '@tests/e2e/utils/test-utils';

class MyTestRunner extends OptimizedTestRunner {
  constructor(testName: string) {
    super(testName);
  }

  async runMyTest(page: any): Promise<void> {
    await this.runTest(page, async () => {
      // Test logic with better error handling
    });
  }
}
```

## 🔧 **Configuration**

### **Test Environment Variables**

```bash
# Enable mock mode for API and E2E tests
MOCK_MODE=true


# Post-deployment verification (disables mock mode)
E2E_POST_DEPLOY_VERIFICATION=true

# Debug mode for detailed logging
DEBUG=true
```

### **Performance Thresholds**

```typescript
// From test-config.ts
export const PERFORMANCE_CONFIG = {
  budgets: {
    loadTime: {
      ci: 15000, // 15s in CI
      local: 8000, // 8s locally
    },
    domContentLoaded: {
      ci: 10000, // 10s in CI
      local: 5000, // 5s locally
    },
  },
};
```

## 🚀 **Running Tests**

### **Quick Commands**

```bash
# Run all E2E tests
pnpm test:e2e:run

# Run specific test categories
pnpm test:e2e:run --grep @smoke
pnpm test:e2e:run --grep @critical
pnpm test:e2e:run --grep @full

# Run smoke tests
pnpm playwright test tests/e2e/functional/smoke.spec.ts

# Run mock server tests
pnpm playwright test tests/e2e/functional/mock-server.spec.ts

# Run with specific browser
pnpm test:e2e:run --project=chromium
```

### **Mock Server Testing**

```bash
# Test mock server functionality
pnpm playwright test tests/e2e/functional/optimized-mock-server.spec.ts

# Test specific mock endpoints
curl "http://localhost:3000/api/mock-server?action=health"
curl "http://localhost:3000/api/mock-server?action=external-api&endpoint=games"
```

## 📊 **Test Coverage**

### **Current Coverage Areas**

- ✅ **Page Structure**: Header, main content, footer validation
- ✅ **Navigation**: Cross-page navigation and routing
- ✅ **Authentication**: Sign-in modal and protected routes
- ✅ **Mock Server**: Complete API endpoint testing
- ✅ **Performance**: Load times and metrics collection
- ✅ **Accessibility**: Basic a11y checks
- ✅ **Error Handling**: Console and network error detection
- ✅ **Responsive Design**: Mobile and tablet viewport testing

### **Coverage Gaps (To Be Added)**

- 🔄 **Form Validation**: Input validation and error states
- 🔄 **Search Functionality**: Search results and filtering
- 🔄 **Game Log CRUD**: Create, read, update, delete operations
- 🔄 **User Profile**: Profile management and settings
- 🔄 **Admin Panel**: Database management and experimental features

## 🛠️ **Development Guidelines**

### **Writing New Tests**

1. **Use Optimized Patterns**: Follow the patterns in `optimized-*.spec.ts` files
2. **Leverage Test Runners**: Use `OptimizedTestRunner` for better error handling
3. **Configure Properly**: Use centralized config from `test-config.ts`
4. **Mock Data**: Enable mock mode for reliable testing
5. **Performance**: Include performance checks where appropriate

### **Test Organization**

```typescript
// ✅ Good: Use test categories
test('@smoke should load home page', async ({ page }) => {
  // Test logic
});

// ✅ Good: Use descriptive test names
test('@critical should handle authentication flow', async ({ page }) => {
  // Test logic
});

// ✅ Good: Use test runners for complex scenarios
const runner = new OptimizedTestRunner('my-test');
await runner.runTest(page, async () => {
  // Test logic
});
```

### **Error Handling**

```typescript
// ✅ Good: Use try-catch with proper logging
try {
  await page.click('[data-testid="button"]');
} catch (error) {
  console.error('Failed to click button:', error);
  throw error;
}

// ✅ Good: Use conditional checks
if (await page.locator('[data-testid="modal"]').isVisible()) {
  await page.click('[data-testid="close"]');
}
```

## 🔍 **Debugging**

### **Common Issues**

1. **Rate Limiting**: Enable mock mode to avoid API rate limits
2. **Timing Issues**: Use proper wait conditions and timeouts
3. **Selector Issues**: Use data-testid attributes for reliable selectors
4. **Mobile Issues**: Test responsive behavior with different viewports

### **Debug Commands**

```bash
# Run tests with debug mode
DEBUG=true pnpm test:e2e:run

# Run specific test with headed browser
pnpm playwright test --headed --debug

# Take screenshots on failure
pnpm playwright test --screenshot=only-on-failure
```

### **Mock Server Debugging**

```bash
# Test mock server endpoints directly
curl "http://localhost:3000/api/mock-server?action=health"
curl "http://localhost:3000/api/mock-server?action=external-api&endpoint=games"
curl "http://localhost:3000/api/mock-server?action=database&operation=SELECT&table=users"
```

## 📈 **Performance Monitoring**

### **Performance Metrics**

The test suite collects and validates:

- **Load Time**: Total page load time
- **DOM Content Loaded**: Time to interactive
- **First Paint**: Initial visual feedback
- **First Contentful Paint**: Meaningful content display

### **Performance Budgets**

```typescript
// Performance thresholds (from test-config.ts)
const PERFORMANCE_CONFIG = {
  budgets: {
    loadTime: { ci: 15000, local: 8000 },
    domContentLoaded: { ci: 10000, local: 5000 },
  },
};
```

## 🔄 **Continuous Integration**

### **GitHub Actions Integration**

The E2E tests are integrated into the CI pipeline with:

- **Mock Mode Enabled**: All tests run with mock data
- **Parallel Execution**: Full tests run in parallel
- **Retry Logic**: Failed tests are retried with exponential backoff
- **Performance Monitoring**: Performance metrics are collected and reported

### **Post-Deployment Verification**

```bash
# Run post-deployment verification (real APIs)
E2E_POST_DEPLOY_VERIFICATION=true pnpm test:e2e:run
```

## 📚 **Additional Resources**

- **Playwright Documentation**: https://playwright.dev/
- **Test Configuration**: See `tests/e2e/utils/test-config.ts`
- **Mock Server**: See `src/lib/mock-server/`
- **Test Utilities**: See `tests/e2e/utils/`

## 🤝 **Contributing**

When adding new tests:

1. **Follow Patterns**: Use the optimized test patterns
2. **Add Documentation**: Update this README if needed
3. **Test Locally**: Run tests locally before committing
4. **Use Mock Data**: Enable mock mode for reliable testing
5. **Performance**: Consider performance impact of new tests

---

**Last Updated**: August 2024
**Version**: 2.0 (Optimized)
**Status**: ✅ Active Development
