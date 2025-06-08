import { test, expect } from '@playwright/test';
import { waitForPageContent, setupApiMocking } from './utils/test-utils';

test.describe('Navigation', () => {
  test('should navigate to sports pages', async ({ page }) => {
    // Setup API mocking to prevent rate limiting
    await setupApiMocking(page);

    await page.goto('/');
    await waitForPageContent(page);

    // Navigate to sports section
    await page.goto('/sports/all-sports');
    await waitForPageContent(page);

    // Check that we're on the sports page
    await expect(page).toHaveURL(/\/sports\/all-sports/);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to NBA page', async ({ page }) => {
    // Setup API mocking to prevent rate limiting
    await setupApiMocking(page);

    await page.goto('/sports/nba');
    
    // Check that we're on the correct URL first
    await expect(page).toHaveURL(/\/sports\/nba/);
    
    // Wait for Clerk and Apollo to initialize, then for main content
    await page.waitForFunction(
      () => {
        // Check if basic page structure exists
        const body = document.body;
        const main = document.querySelector('main');
        
        // Accept page if we have body content, even if main isn't ready yet
        return body && (
          main !== null || 
          body.textContent?.includes('NBA') ||
          body.textContent?.includes('Loading') ||
          body.textContent?.includes('Error')
        );
      },
      { timeout: 25000 }
    );
    
    // Now check for main element with more patience
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to dashboard', async ({ page }) => {
    // Setup API mocking to prevent rate limiting
    await setupApiMocking(page);

    await page.goto('/dashboard');
    await waitForPageContent(page);

    // Check that we're on the dashboard page
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    // Setup API mocking to prevent rate limiting
    await setupApiMocking(page);

    // Navigate to a non-existent page
    await page.goto('/non-existent-page');
    await waitForPageContent(page);

    // Should show a 404 page or redirect somewhere appropriate
    const isNotFoundPage = await page.locator('text=/404|not found/i').isVisible();
    const isRedirected = page.url() !== 'http://localhost:8080/non-existent-page';

    // Either should show 404 content or redirect to a valid page
    expect(isNotFoundPage || isRedirected).toBe(true);
  });

  test('should have working back/forward navigation', async ({ page }) => {
    // Setup API mocking to prevent rate limiting
    await setupApiMocking(page);

    // Start at home
    await page.goto('/');
    await waitForPageContent(page);

    // Navigate to dashboard
    await page.goto('/dashboard');
    await waitForPageContent(page);

    // Go back
    await page.goBack();
    await waitForPageContent(page);
    await expect(page).toHaveURL('http://localhost:8080/');

    // Go forward
    await page.goForward();
    await waitForPageContent(page);
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
