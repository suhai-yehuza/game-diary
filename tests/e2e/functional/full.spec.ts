import { test } from '@playwright/test';
import { runCrossBrowserSuite } from './cross-browser.spec';

// If you have atomic full-level test functions, define them here
// For this example, we'll assume all full logic is handled in the cross-browser suite

// Suite runner for full
export async function runFullSuite(page: any) {
  await runCrossBrowserSuite(page);
  // Add any full-level-specific tests here if needed
}

test.describe('Full Tests (Extends Cross-Browser)', () => {
  test('@full full suite', async ({ page }) => {
    await runFullSuite(page);
  });
});
