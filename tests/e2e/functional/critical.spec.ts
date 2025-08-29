import { test } from '@playwright/test';

import { clearTestData, waitForNetworkIdle } from '@tests/e2e/utils/test-utils';

import { runCriticalSuite } from './shared-suite-runners';

// All critical test functions are now in shared-suite-runners.ts

test.beforeEach(async ({ page }) => {
  await clearTestData(page); // Test data isolation: clear storage and cookies
});

test.describe('Critical Tests (Extends Smoke)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addStyleTag({
      content: '* { transition: none !important; animation: none !important; }',
    });
    // Ensure clean state by navigating to home page first
    await page.goto('/');
    await waitForNetworkIdle(page);
  });

  test('should handle critical user flows', async ({ page }) => {
    await runCriticalSuite(page);
  });
});
