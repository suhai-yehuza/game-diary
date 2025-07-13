# E2E Test Utilities - DRY Implementation

This document outlines the comprehensive DRY (Don't Repeat Yourself) implementation for E2E tests, eliminating code duplication and providing consistent utilities.

## Overview

The E2E test suite has been refactored to eliminate duplicated patterns, particularly around:

- Load state management (`networkidle`, `domcontentloaded`)
- Navigation patterns
- Timeout configurations
- Element interactions
- **Test isolation and data isolation**

## Test Isolation & Data Isolation

### **Test Isolation (Reduced Parallelism)**

To prevent cross-test interference, all major E2E suites use:

- **Serial execution**: `test.describe.configure({ mode: 'serial' })`
- **Reduced workers**: 1 worker locally, 2 in CI for critical configs
- **Disabled full parallelism**: `fullyParallel: false` for critical suites

**Applied to:**

- `critical.spec.ts` - Core user flows and error handling
- `navigation.spec.ts` - Comprehensive navigation testing
- `smoke.spec.ts` - Extended smoke tests
- `sanity.spec.ts` - Base level tests
- `responsive.spec.ts` - Responsive and viewport tests
- `cross-browser.spec.ts` - Cross-browser compatibility tests
- `full.spec.ts` - Full regression and coverage tests
- All page-level suites (dashboard, sports, auth, etc.)

### **Data Isolation (Clean State)**

Every test starts with a clean browser state via `clearTestData()`:

- **localStorage**: Cleared completely
- **sessionStorage**: Cleared completely
- **IndexedDB**: All databases deleted
- **Cookies**: All cookies cleared

**Applied to:**

- All functional test suites (via `commonTestSetup()`)
- All page test suites (via page suite utilities)
- Individual page tests (dashboard, sports, auth)
- All major E2E suites (critical, navigation, smoke, sanity, responsive, cross-browser, full)

### **Implementation Pattern**

```typescript
// Test isolation
test.describe.configure({ mode: 'serial' });

// Data isolation
test.beforeEach(async ({ page }) => {
  await clearTestData(page); // Test data isolation: clear storage and cookies
  // ... other setup
});
```

## Constants

### Timeouts (`TIMEOUTS`)

Centralized timeout constants to ensure consistency across all tests:

```typescript
export const TIMEOUTS = {
  SHORT: 5000, // Quick operations
  MEDIUM: 10000, // Standard operations
  LONG: 15000, // Complex operations
  EXTENDED: 30000, // Very complex operations
} as const;
```

### Load States (`LOAD_STATES`)

Type-safe load state constants:

```typescript
export const LOAD_STATES = {
  DOM_CONTENT_LOADED: 'domcontentloaded',
  LOAD: 'load',
  NETWORK_IDLE: 'networkidle',
} as const;
```

## Core Utilities

### Load State Management

#### `waitForLoadState(page, state, timeout)`

Generic load state waiter with consistent timeout handling:

```typescript
await waitForLoadState(page, 'NETWORK_IDLE', TIMEOUTS.MEDIUM);
```

#### `waitForNetworkIdle(page, timeout)`

Convenience function for network idle waits:

```typescript
await waitForNetworkIdle(page, TIMEOUTS.MEDIUM);
```

#### `waitForDOMContentLoaded(page, timeout)`

Convenience function for DOM content loaded waits:

```typescript
await waitForDOMContentLoaded(page, TIMEOUTS.MEDIUM);
```

### Navigation Utilities

#### `navigateToPage(page, url, options)`

Consistent page navigation with load state handling:

```typescript
await navigateToPage(page, '/', {
  waitForNetworkIdle: true,
  timeout: TIMEOUTS.MEDIUM,
  checkMainContent: true,
});
```

#### `safeGoto(page, path, config)`

Enhanced navigation with retry logic and error handling:

```typescript
await safeGoto(page, '/sports/nba', {
  timeout: TIMEOUTS.EXTENDED,
  retries: 3,
});
```

### Data Isolation Utilities

#### `clearTestData(page)`

Comprehensive browser state clearing for test isolation:

```typescript
await clearTestData(page); // Clears localStorage, sessionStorage, IndexedDB, cookies
```

## Updated Files

### Core Utility Files

- `tests/e2e/utils/test-utils.ts` - Added constants and core utilities
- `tests/e2e/utils/navigation.ts` - Enhanced with new utilities
- `tests/e2e/utils/page-suites.ts` - Updated imports and added data isolation
- `tests/e2e/utils/setup.ts` - Enhanced with data isolation

### Test Files Updated

- `tests/e2e/functional/critical.spec.ts` - Added serial mode and data isolation
- `tests/e2e/functional/navigation.spec.ts` - Added serial mode and data isolation
- `tests/e2e/functional/smoke.spec.ts` - Added serial mode
- `tests/e2e/functional/sanity.spec.ts` - Added serial mode
- `tests/e2e/functional/mock-verification.spec.ts` - Updated to use new utilities
- `tests/e2e/pages/.spec.ts` - Added data isolation
- `tests/e2e/pages/sports.spec.ts` - Added data isolation
- `tests/e2e/pages/clerk-auth.spec.ts` - Added data isolation

### Configuration Files Updated

- `playwright.critical.config.ts` - Reduced parallelism for test isolation

### Utility Files Updated

- `tests/e2e/utils/auth-modal.ts` - Updated to use new utilities
- `tests/e2e/utils/setup.ts` - Enhanced with data isolation

## Migration Guide

### Before (Duplicated Code)

```typescript
// Inconsistent timeouts
await page.waitForLoadState('networkidle', { timeout: 10000 });
await page.waitForLoadState('networkidle', { timeout: 5000 });
await page.waitForLoadState('networkidle');

// Direct navigation without error handling
await page.goto('/');
await page.waitForLoadState('networkidle');

// No test isolation
test.describe('My Tests', () => {
  test('test 1', async ({ page }) => {
    // Could interfere with other tests
  });
});
```

### After (DRY Implementation)

```typescript
// Consistent timeouts using constants
await waitForNetworkIdle(page, TIMEOUTS.MEDIUM);
await waitForNetworkIdle(page, TIMEOUTS.SHORT);
await waitForNetworkIdle(page); // Uses default

// Enhanced navigation with error handling
await navigateToPage(page, '/', {
  waitForNetworkIdle: true,
  timeout: TIMEOUTS.MEDIUM,
});

// Test isolation and data isolation
test.describe.configure({ mode: 'serial' });
test.beforeEach(async ({ page }) => {
  await clearTestData(page); // Clean state every test
});
```

## Benefits

1. **Consistency**: All tests use the same timeout values and load state patterns
2. **Maintainability**: Changes to timeouts or load states only need to be made in one place
3. **Type Safety**: Constants provide compile-time safety
4. **Error Handling**: Enhanced navigation utilities include retry logic and better error messages
5. **Readability**: Clear, descriptive function names make test code more readable
6. **Performance**: Consistent timeouts prevent unnecessary waits or premature failures
7. **Test Isolation**: Serial execution and data clearing prevent cross-test interference
8. **Reliability**: Clean state ensures tests don't affect each other

## Usage Examples

### Basic Page Navigation with Isolation

```typescript
import { waitForNetworkIdle, TIMEOUTS, clearTestData } from '@tests/e2e/utils/test-utils';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await clearTestData(page);
});

test('should navigate to dashboard', async ({ page }) => {
  await page.goto('/');
  await waitForNetworkIdle(page, TIMEOUTS.MEDIUM);
  await expect(page.locator('main')).toBeVisible();
});
```

### Enhanced Navigation with Options

```typescript
import { navigateToPage, TIMEOUTS } from '@tests/e2e/utils/test-utils';

test('should navigate with full load state', async ({ page }) => {
  await navigateToPage(page, '/sports/nba', {
    waitForNetworkIdle: true,
    timeout: TIMEOUTS.LONG,
    checkMainContent: true,
  });
});
```

### Safe Navigation with Retry Logic

```typescript
import { safeGoto } from '@tests/e2e/utils/test-utils';

test('should handle navigation interruptions', async ({ page }) => {
  await safeGoto(page, '/protected/user', {
    timeout: TIMEOUTS.EXTENDED,
    retries: 3,
  });
});
```

## Future Enhancements

1. **Custom Load State Combinations**: Create utilities for common load state sequences
2. **Performance Monitoring**: Add utilities for measuring and reporting navigation performance
3. **Conditional Waits**: Create utilities that wait for specific conditions rather than just load states
4. **Mobile-Specific Utilities**: Enhanced utilities for mobile-specific navigation patterns
5. **Backend Reset Endpoints**: Add API endpoints for full database isolation
6. **Test-Specific Data Seeding**: Implement data seeding for specific test scenarios

This DRY implementation significantly reduces code duplication while improving test reliability and maintainability through comprehensive isolation mechanisms.
