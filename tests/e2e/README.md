# End-to-End Tests with Playwright

This directory contains end-to-end tests for the Game Diary application using [Playwright](https://playwright.dev/).

## Setup

The tests are already configured and ready to run. The setup includes:

- **Playwright Config**: `playwright.config.ts` in the root directory
- **Test Files**: Located in `tests/e2e/`
- **Utilities**: Common test utilities in `tests/e2e/utils/`

## Mocking Strategy

To avoid API rate limiting issues and ensure reliable E2E tests, we use a comprehensive mocking strategy:

### Environment Variables

Set these environment variables to enable mock mode:

- `API_MOCK_MODE=true` - Enables API proxy to return mock data

### Mock Data Sources

Mock data is sourced from `src/lib/mock/`:

- `nbaGamesMock.ts` - NBA games data
- `nbaTeamsMock.ts` - NBA teams data
- `nbaStandingsMock.ts` - NBA standings data
- `nbaPlayersMock.ts` - NBA players data
- `liveGamesMock.ts` - Live games data

### API Proxy Mocking

The API proxy (`src/app/api/proxy/[...endpoint]/route.ts`) automatically returns mock data when:

- `CI === 'true'`
- `GITHUB_ACTIONS === 'true'`
- `API_MOCK_MODE === 'true'`

### Playwright Route Mocking

The `setupE2EMocking()` function in `utils/test-utils.ts` mocks:

- All `/api/proxy/**` endpoints with appropriate mock data
- External API calls (RapidAPI, NBA Stats DB)
- Clerk authentication endpoints
- External image requests
- CDN requests

### Usage

```typescript
import { setupE2EMocking, safeGotoWithMocking } from './utils/test-utils';

test('my test', async ({ page }) => {
  // Set up comprehensive mocking
  await setupE2EMocking(page);

  // Navigate with automatic mocking
  await safeGotoWithMocking(page, '/sports/nba');

  // Your test assertions...
});
```

### Verification

Run the mock verification test to ensure mocking is working:

```bash
pnpm test:e2e:mock-verification
```

## Test Files

- `responsive.spec.ts` - Responsive design tests across multiple viewports
- `mock-verification.spec.ts` - Verifies that mocking is working correctly
- `search.spec.ts` - Search functionality tests across all pages
- `fast.spec.ts` - Fast smoke tests
- `auth.spec.ts` - Authentication tests
- `dashboard.spec.ts` - Dashboard functionality tests
- `navigation.spec.ts` - Navigation tests
- `sports.spec.ts` - Sports page tests
- `home.spec.ts` - Home page tests
- `cross-browser.spec.ts` - Cross-browser compatibility tests

## Running Tests

### Run All Tests

```bash
# Run all e2e tests
pnpm test:e2e

# Run tests with UI mode (interactive)
pnpm test:e2e:ui
```

### Run Specific Tests

```bash
# Run only home page tests
npx playwright test home.spec.ts

# Run only navigation tests
npx playwright test navigation.spec.ts

# Run tests in a specific browser
npx playwright test --project=chromium
```

### Debug Mode

```bash
# Run tests in debug mode
npx playwright test --debug

# Run specific test in debug mode
npx playwright test home.spec.ts --debug
```

## Test Structure

### Current Test Files

1. **`home.spec.ts`** - Tests for the home page

   - Basic page loading
   - Navigation links
   - Responsive behavior
   - Basic accessibility checks

2. **`navigation.spec.ts`** - Tests for navigation between pages

   - Sports pages navigation
   - Dashboard navigation
   - 404 error handling
   - Browser back/forward functionality

3. **`utils/test-utils.ts`** - Utility functions
   - Page loading helpers
   - Element existence checks
   - Screenshot utilities
   - Responsive testing helpers

## Test Configuration

The tests are configured to:

- **Auto-start dev server**: Runs `pnpm dev` automatically
- **Multiple browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Screenshots**: Taken on failure
- **Videos**: Recorded on failure
- **Traces**: Collected on retry

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/some-page');
    await page.waitForLoadState('networkidle');

    // Your test assertions here
    await expect(page.locator('main')).toBeVisible();
  });
});
```

### Using Test Utils

```typescript
import { test, expect } from '@playwright/test';
import { safeGoto, checkBasicPageStructure } from './utils/test-utils';

test('should have proper page structure', async ({ page }) => {
  await safeGoto(page, '/dashboard');
  await checkBasicPageStructure(page);
});
```

## Best Practices

1. **Wait for page load**: Always use `waitForLoadState('networkidle')` or the `safeGoto` utility
2. **Use semantic selectors**: Prefer `getByRole`, `getByText`, `getByLabel` over CSS selectors
3. **Test user journeys**: Focus on real user workflows, not just individual components
4. **Keep tests independent**: Each test should be able to run in isolation
5. **Use descriptive names**: Test names should clearly describe what they're testing

## Debugging Tips

1. **Use headed mode**: Add `--headed` to see the browser
2. **Slow down**: Add `--slow-mo=1000` to slow down actions
3. **Screenshots**: Use `await page.screenshot({ path: 'debug.png' })` for debugging
4. **Console logs**: Check `page.on('console', console.log)` for JavaScript errors

## CI/CD Integration

The tests are configured to work in CI environments:

- Retries failed tests 2 times in CI
- Uses single worker in CI for stability
- Generates HTML reports
- Screenshots and videos are available as artifacts

## Troubleshooting

### Common Issues

1. **Server not starting**: Make sure `pnpm dev` works locally
2. **Tests timing out**: Increase timeout in playwright.config.ts
3. **Flaky tests**: Add more specific waits or use `waitForLoadState`
4. **Element not found**: Check if page has fully loaded or element exists

### Getting Help

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)

# E2E Test Structure

This directory contains end-to-end tests organized in a compound hierarchy where each level extends the tests from the level below it.

## Directory Structure

```
tests/e2e/
├── functional/                     # Compound hierarchy tests
│   ├── mock-verification.spec.ts   # Prerequisite tests
│   ├── search.spec.ts              # Search functionality tests
│   ├── fast.spec.ts                # Base level tests
│   ├── smoke.spec.ts               # Extends fast
│   ├── critical.spec.ts            # Extends smoke
│   ├── responsive.spec.ts          # Extends critical
│   └── full.spec.ts                # Extends responsive
├── pages/                          # Page-specific tests
│   ├── home.spec.ts                # Home page tests
│   ├── navigation.spec.ts          # Navigation tests
│   ├── auth.spec.ts                # Authentication tests
│   ├── dashboard.spec.ts           # Dashboard tests
│   ├── sports.spec.ts              # Sports pages tests

│   └── cross-browser.spec.ts       # Cross-browser tests
├── utils/                          # Shared test utilities
│   └── test-utils.ts              # Common test functions
├── coverage.config.ts              # Coverage configuration
├── COVERAGE.md                     # Coverage documentation
└── README.md                       # This file
```

## Test Hierarchy

### 0. Mock Verification (Prerequisite)

**File:** `functional/mock-verification.spec.ts`
**Tags:** `@fast`
**Purpose:** Validates that API mocking infrastructure is working correctly
**Configuration:** `playwright.fast.config.ts`

**Tests include:**

- Verification that mock data is used for API calls
- Validation that external API endpoints are properly mocked
- Confirmation that live games endpoint works with mocking
- Prevention of API rate limiting issues

### 0.5. Search Tests (Functional Feature)

**File:** `functional/search.spec.ts`
**Tags:** `@search`
**Purpose:** Comprehensive search functionality testing across all pages
**Configuration:** `playwright.fast.config.ts`

**Tests include:**

- Desktop search functionality and interactions
- Mobile search overlay and touch interactions
- Cross-page search functionality validation
- Search edge cases and error handling
- Search accessibility and keyboard navigation
- Search performance and responsiveness

**Usage:**

```bash
pnpm test:e2e::search
```

### 1. Fast Tests (Base Level)

**File:** `functional/fast.spec.ts`
**Tags:** `@fast`
**Purpose:** Basic smoke tests for quick feedback during development (includes mock verification)
**Configuration:** `playwright.fast.config.ts`

**Tests include:**

- Mock verification (prerequisite)
- Basic page loading (home, sign-in, sign-up, NBA sports)
- Simple navigation between pages
- Basic page structure validation
- Console error checking

**Usage:**

```bash
pnpm test:e2e:sanity
```

### 2. Smoke Tests (Extends Fast)

**File:** `functional/smoke.spec.ts`
**Tags:** `@smoke`
**Purpose:** Extended smoke tests with additional critical functionality
**Configuration:** `playwright.fast.config.ts`

**Tests include:**

- All fast tests (imported and extended)
- All major sports pages loading
- Dashboard page loading
- Form interaction testing
- Basic accessibility checks
- Performance metrics validation
- Navigation between major sections

**Usage:**

```bash
pnpm test:e2e:smoke
```

### 3. Critical Tests (Extends Smoke)

**File:** `functional/critical.spec.ts`
**Tags:** `@critical`
**Purpose:** Core user flows and critical functionality
**Configuration:** `playwright.popular.config.ts`

**Tests include:**

- All smoke tests (imported and extended)
- Complete user authentication flow
- Sports data loading and display
- Protected route access
- Form validation
- Error state handling
- Browser navigation (back/forward)

**Usage:**

```bash
pnpm test:e2e:critical
```

### 4. Responsive Tests (Extends Critical)

**File:** `functional/responsive.spec.ts`
**Tags:** `@responsive`
**Purpose:** Responsive design testing across multiple viewports
**Configuration:** `playwright.popular.config.ts`

**Tests include:**

- All critical tests (imported and extended)
- Multi-viewport testing (mobile, tablet, desktop)
- Responsive behavior validation
- Touch interaction testing
- Mobile navigation testing
- Accessibility across devices
- Performance on different screen sizes

**Usage:**

```bash
pnpm test:e2e:responsive
```

### 5. Full Tests (Extends Responsive)

**File:** `functional/full.spec.ts`
**Tags:** `@full`
**Purpose:** Comprehensive testing including edge cases and advanced scenarios
**Configuration:** `playwright.popular.config.ts`

**Tests include:**

- All responsive tests (imported and extended)
- Cross-browser compatibility
- Advanced form interactions
- Comprehensive keyboard navigation
- Mobile touch interactions
- Comprehensive accessibility testing
- SEO elements validation
- Security headers checking
- Edge cases and error scenarios
- Performance under load
- Data persistence and state management
- Concurrent user interactions

**Usage:**

```bash
pnpm test:e2e:full
```

## Page-Specific Tests

The `pages/` directory contains tests focused on specific pages or features:

### Available Page Tests

- **`home.spec.ts`** - Home page functionality and layout
- **`navigation.spec.ts`** - Navigation between pages and routes
- **`auth.spec.ts`** - Authentication flows and user management
- **`dashboard.spec.ts`** - Dashboard functionality and user interface
- **`sports.spec.ts`** - Sports pages and data display

- **`cross-browser.spec.ts`** - Cross-browser compatibility testing

### Running Page Tests

```bash
# Run all page tests
pnpm test:e2e:pages

# Run specific page tests
pnpm test:e2e:pages:home
pnpm test:e2e:navigation
pnpm test:e2e:clerk-auth
pnpm test:e2e:pages:dashboard
pnpm test:e2e:pages:sports

pnpm test:e2e:cross-browser
```

## Test Configuration

### Fast Configuration

- **File:** `playwright.fast.config.ts`
- **Test Directory:** `tests/e2e/functional/`
- **Browsers:** Chromium only
- **Workers:** 1
- **Retries:** 0
- **Purpose:** Fastest execution for development feedback

### Popular Configuration

- **File:** `playwright.popular.config.ts`
- **Test Directory:** `tests/e2e/functional/`
- **Browsers:** Chromium, WebKit, Mobile Chrome
- **Workers:** 2-4
- **Retries:** 1-2
- **Purpose:** Balanced coverage and speed for CI/CD

## Running Tests

### Development

```bash
# Fast tests for quick feedback
pnpm test:e2e:sanity

# Smoke tests for basic validation
pnpm test:e2e:smoke

# Page-specific tests
pnpm test:e2e:pages:home
```

### Pre-deployment

```bash
# Critical tests for deployment validation
pnpm test:e2e:critical
```

### Full Validation

```bash
# Complete test suite
pnpm test:e2e:full

# All page tests
pnpm test:e2e:pages
```

### Responsive Testing

```bash
# Responsive design validation
pnpm test:e2e:responsive
```

### Compound Test Runner

```bash
# Run all functional tests in sequence
pnpm test:e2e:compound

# Run specific levels only
pnpm test:e2e:compound:mock-verification
pnpm test:e2e:compound:sanity
pnpm test:e2e:compound:smoke
pnpm test:e2e:compound:critical
pnpm test:e2e:compound:responsive
pnpm test:e2e:compound:full
```

## Test Utilities

The tests use shared utilities from `utils/test-utils.ts`:

- `safeGoto()` - Safe page navigation with error handling
- `safeGotoWithMocking()` - Navigation with API mocking
- `checkBasicPageStructure()` - Basic page structure validation
- `checkAccessibilityBasics()` - Accessibility testing
- `checkPerformanceMetrics()` - Performance validation
- `checkResponsiveBehavior()` - Responsive design testing
- `setupE2EMocking()` - API mocking setup

## Compound Structure Benefits

1. **Incremental Testing:** Each level builds upon the previous, ensuring comprehensive coverage
2. **Fast Feedback:** Developers can run fast tests for quick validation
3. **CI/CD Optimization:** Different levels for different deployment stages
4. **Maintainability:** Shared test logic reduces duplication
5. **Scalability:** Easy to add new test levels or extend existing ones
6. **Organization:** Clear separation between functional and page-specific tests

## Adding New Tests

### Functional Tests

When adding new functional tests:

1. **Fast Level:** Add basic functionality tests
2. **Smoke Level:** Add extended functionality tests
3. **Critical Level:** Add user flow tests
4. **Responsive Level:** Add viewport-specific tests
5. **Full Level:** Add comprehensive and edge case tests

### Page Tests

When adding new page tests:

1. Create a new file in `pages/` directory
2. Follow the naming convention: `{page-name}.spec.ts`
3. Add a corresponding script in `package.json`
4. Include comprehensive page-specific testing

## Best Practices

1. **Use appropriate tags:** `@fast`, `@smoke`, `@critical`, `@responsive`, `@full`
2. **Import previous levels:** Always import the previous level to maintain the compound structure
3. **Use shared utilities:** Leverage test utilities for consistency
4. **Handle errors gracefully:** Use try-catch blocks and fallback selectors
5. **Mock external dependencies:** Use `setupE2EMocking()` to avoid API rate limits
6. **Test across viewports:** Ensure responsive behavior in responsive and full tests
7. **Validate accessibility:** Include accessibility checks in smoke and above
8. **Check performance:** Include performance validation in smoke and above

## Troubleshooting

### Common Issues

1. **Tests failing due to API rate limits:**

   - Use `setupE2EMocking()` in test setup
   - Use `safeGotoWithMocking()` for navigation

2. **Flaky tests:**

   - Increase retries in test configuration
   - Add proper wait conditions
   - Use `waitForPageLoad()` and `waitForLoadState()`

3. **Responsive tests failing:**

   - Check viewport size settings
   - Verify mobile/desktop configurations
   - Use appropriate device scale factors

4. **Performance test failures:**
   - Adjust timeout values based on environment
   - Consider network conditions
   - Use appropriate performance thresholds

### Debug Commands

```bash
# Run tests with UI for debugging
pnpm test:e2e:debug:ui

# Run specific test file
pnpm playwright test tests/e2e/functional/fast.spec.ts

# Run tests with specific grep pattern
pnpm playwright test --grep @fast

# Run tests with headed browser
pnpm playwright test --headed
```
