import { expect, type Page, type Route } from '@playwright/test';

/**
 * Wait for the page to fully load including all network requests
 */
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  // Wait for DOM to be ready instead of arbitrary timeout
  await page.waitForFunction(() => document.readyState === 'complete');
}

/**
 * Robust page content waiting with retry logic for API errors
 */
export async function waitForPageContent(page: Page, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Wait for either success content or error state
      await page.waitForFunction(
        () => {
          const main = document.querySelector('main');
          const errorText = document.body.textContent || '';
          return main !== null || errorText.includes('too_many_requests');
        },
        { timeout: 10000 }
      );

      // Check if we have an error state
      const pageContent = await page.textContent('body');
      if (pageContent?.includes('too_many_requests')) {
        if (attempt < maxRetries) {
          console.log(`Rate limited - retrying attempt ${attempt + 1}/${maxRetries}...`);
          await page.waitForTimeout(2000 * attempt); // Exponential backoff
          await page.reload();
          await page.waitForLoadState('networkidle');
          continue;
        } else {
          throw new Error('Rate limited after all retry attempts');
        }
      }

      // If we get here, page loaded successfully
      break;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`Attempt ${attempt} failed, retrying...`);
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Setup API mocking to prevent rate limiting and external dependencies
 */
export async function setupApiMocking(page: Page) {
  // Intercept API calls that might cause rate limiting
  await page.route('**/api/**', (route: Route) => {
    const url = route.request().url();
    console.log(`Mocking API call: ${url}`);
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: 'mocked_response',
        message: 'Test data from mock',
      }),
    });
  });

  // Also mock external API calls that might cause rate limiting
  await page.route('**/v1/**', (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [],
        message: 'Mocked external API response',
      }),
    });
  });
}

/**
 * Enhanced safe navigation with API mocking and retry logic
 */
export async function safeGotoWithMocking(page: Page, url: string) {
  await setupApiMocking(page);
  await page.goto(url);
  await waitForPageContent(page);
}

/**
 * Common test pattern: setup mocking, navigate, and wait for content
 * This is the most frequently used pattern in our tests
 */
export async function navigateWithMocking(page: Page, url: string) {
  await setupApiMocking(page);
  await page.goto(url);
  await waitForPageContent(page);
}

/**
 * Change viewport size and wait for layout to stabilize
 * Better alternative to waitForTimeout after viewport changes
 */
export async function setViewportAndWaitForLayout(
  page: Page,
  size: { width: number; height: number }
) {
  await page.setViewportSize(size);
  // Wait for layout to stabilize by checking main content is properly displayed
  await page.waitForFunction(
    () => {
      const main = document.querySelector('main');
      return main !== null && getComputedStyle(main).visibility !== 'hidden';
    },
    { timeout: 5000 }
  );
}

/**
 * Check if an element exists without failing the test
 */
async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector);
    await element.waitFor({ timeout: 1000 });
    return await element.isVisible();
  } catch {
    return false;
  }
}

/**
 * Safe navigation with error handling (original version)
 */
export async function safeGoto(page: Page, url: string) {
  await page.goto(url);
  await waitForPageLoad(page);
}

/**
 * Check for common page elements that should be present
 */
export async function checkBasicPageStructure(page: Page) {
  // Check for basic HTML structure
  await expect(page.locator('html')).toBeVisible();
  await expect(page.locator('body')).toBeVisible();

  // Check for main content area
  const hasMain = await elementExists(page, 'main');
  const hasContentDiv = await elementExists(page, '[role="main"], .main-content, #main');

  if (!hasMain && !hasContentDiv) {
    console.warn('No main content area found on page');
  }
}

/**
 * Take a screenshot with a descriptive name
 */
async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test-results-e2e/screenshots/${name}.png`,
    fullPage: true,
  });
}

/**
 * Check for JavaScript errors in the console
 */
async function checkForConsoleErrors(page: Page) {
  const errors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  return errors;
}

/**
 * Common viewport sizes for responsive testing
 */
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  large: { width: 2560, height: 1440 },
} as const;

/**
 * Test responsive behavior across multiple viewports
 */
async function testResponsiveness(page: Page, testCallback: (viewport: string) => Promise<void>) {
  for (const [name, size] of Object.entries(VIEWPORTS)) {
    await page.setViewportSize(size);
    // Wait for layout to stabilize by checking for main content instead of arbitrary timeout
    await page.waitForFunction(
      () => {
        const main = document.querySelector('main');
        return main !== null && getComputedStyle(main).visibility !== 'hidden';
      },
      { timeout: 5000 }
    );
    await testCallback(name);
  }
}
