import { expect, type Page, type Route } from '@playwright/test';
import { setupTestAuth } from './auth-utils';
import { seedLogger } from 'lib/core/logger';

/**
 * Wait for the page to fully load including all network requests
 */
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  // Wait for DOM to be ready instead of arbitrary timeout
  await page.waitForFunction(() => document.readyState === 'complete');
}

/**
 * Gets the primary main element from the page
 * In our app, the primary main element has the 'grow' class
 */
export async function getPrimaryMainElement(page: Page) {
  return page.locator('main.grow').first();
}

/**
 * Waits for the page content to be fully loaded and interactive
 */
export async function waitForPageContent(page: Page): Promise<void> {
  // Wait for main content to be visible
  await page.waitForSelector('main.grow', { state: 'visible' });

  // Wait for any loading spinners to disappear
  await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 10000 }).catch(() => {
    // Ignore if no loading spinner is found
  });

  // Wait for any loading text to disappear
  await page.waitForSelector('text=Loading games...', { state: 'hidden', timeout: 10000 }).catch(() => {
    // Ignore if no loading text is found
  });

  // Wait for network to be idle
  await page.waitForLoadState('networkidle');

  // Additional wait to ensure React has finished rendering
  await page.waitForTimeout(500);
}

/**
 * Sets up API mocking for the test environment
 */
export async function setupApiMocking(page: Page, withAuth = false) {
  seedLogger.info('Setting up API mocking...');

  // Mock GraphQL API calls
  await page.route('**/api/graphql', async (route) => {
    const request = route.request();
    const postData = request.postData();
    
    try {
      // Parse the GraphQL query
      const { query, variables } = JSON.parse(postData || '{}');
      
      // Mock responses based on the query
      let mockResponse = {};
      
      if (query.includes('liveGames')) {
        mockResponse = {
          data: {
            liveGames: []
          }
        };
      } else if (query.includes('notifications')) {
        mockResponse = {
          data: {
            notifications: []
          }
        };
      } else {
        // Default mock response for other queries
        mockResponse = {
          data: {}
        };
      }

      seedLogger.info(`Mocking GraphQL query: ${query.split('(')[0]}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      });
    } catch (error) {
      seedLogger.error('Error handling GraphQL request:', error);
      // Return a valid but empty response instead of failing
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: {} })
      });
    }
  });

  // Mock cache API calls
  await page.route('**/api/cache*', async (route) => {
    seedLogger.info(`Mocking API call: ${route.request().url()}`);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] })
    });
  });

  // Mock other API calls
  await page.route('**/api/**', async (route) => {
    seedLogger.info(`Mocking API call: ${route.request().url()}`);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] })
    });
  });

  // Setup authentication if requested
  if (withAuth) {
    seedLogger.info('Setting up authentication...');
    await setupTestAuth(page);
  }

  seedLogger.info('API mocking setup completed');
}

/**
 * Enhanced safe navigation with API mocking and retry logic
 */
export async function safeGotoWithMocking(page: Page, url: string) {
  seedLogger.info(`Navigating to ${url} with API mocking...`);
  await setupApiMocking(page);
  await page.goto(url);
  await waitForPageContent(page);
  seedLogger.info(`Navigation to ${url} completed`);
}

/**
 * Common test pattern: setup mocking, navigate, and wait for content
 * This is the most frequently used pattern in our tests
 */
export async function navigateWithMocking(page: Page, url: string) {
  seedLogger.info(`Navigating to ${url} with API mocking...`);
  await setupApiMocking(page);
  await page.goto(url);
  await waitForPageContent(page);
  seedLogger.info(`Navigation to ${url} completed`);
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
    seedLogger.warn('No main content area found on page');
  }
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
 * Expands the mobile menu if needed based on viewport size
 */
export async function expandMobileMenuIfNeeded(page: Page): Promise<void> {
  const viewport = page.viewportSize();
  if (!viewport || viewport.width >= 1024) {
    return; // Not mobile, menu should be visible
  }

  // Check if menu is already expanded by looking for visible navigation links
  const menuButton = page.getByRole('button', { name: /menu/i });
  const isMenuButtonVisible = await menuButton.isVisible();
  
  if (!isMenuButtonVisible) {
    return; // No menu button, navigation should be visible
  }

  // Check if navigation is already visible
  const nbaLink = page.getByRole('link', { name: /nba/i });
  const isNavVisible = await nbaLink.isVisible();
  
  if (isNavVisible) {
    return; // Navigation is already visible
  }

  // Click menu button to expand
  await menuButton.click();
  
  // Wait for animation and menu to expand
  await page.waitForTimeout(300);
  
  // Wait for navigation links to become visible
  await expect(nbaLink).toBeVisible({ timeout: 5000 });
}

/**
 * Tests the page's responsiveness across different viewports
 */
export async function testResponsiveness(
  page: Page,
  testCallback: (viewport: string) => Promise<void>
) {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 }
  ];

  for (const viewport of viewports) {
    console.log(`[SEED] INFO Testing viewport: ${viewport.name}`);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    
    // Wait for layout to stabilize
    await page.waitForFunction(() => {
      const mainElements = document.querySelectorAll('main');
      return Array.from(mainElements).some(main => 
        window.getComputedStyle(main).display !== 'none' && 
        window.getComputedStyle(main).visibility !== 'hidden'
      );
    });

    // Expand mobile menu if needed
    await expandMobileMenuIfNeeded(page);

    await testCallback(viewport.name);
  }
}

/**
 * Sets up error handling for the test environment
 */
export function setupErrorHandling(page: Page) {
  // Handle console errors more gracefully
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore Apollo Client errors about mocked responses
      if (text.includes('go.apollo.dev/c/err') && text.includes('mocked_response')) {
        return;
      }
      // Log other errors but don't throw
      seedLogger.error('Console error:', text);
    }
  });

  // Handle unhandled rejections
  page.on('pageerror', error => {
    seedLogger.error('Page error:', error);
  });
}
