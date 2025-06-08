# End-to-End Tests with Playwright

This directory contains end-to-end tests for the Game Diary application using [Playwright](https://playwright.dev/).

## Setup

The tests are already configured and ready to run. The setup includes:

- **Playwright Config**: `playwright.config.ts` in the root directory
- **Test Files**: Located in `tests/e2e/`
- **Utilities**: Common test utilities in `tests/e2e/utils/`

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
