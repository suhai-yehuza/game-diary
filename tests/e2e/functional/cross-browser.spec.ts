import { test } from '@playwright/test';
import { runResponsiveSuite } from './responsive.spec';

// If you have atomic cross-browser-level test functions, define them here
// For this example, we'll assume all cross-browser logic is handled in the responsive suite

// Suite runner for cross-browser
export async function runCrossBrowserSuite(page: any) {
  await runResponsiveSuite(page);
  // Add any cross-browser-specific tests here if needed
}

test.describe('Cross-Browser Tests (Extends Responsive)', () => {
  test('@cross-browser full cross-browser suite', async ({ page }) => {
    await runCrossBrowserSuite(page);
  });
});
