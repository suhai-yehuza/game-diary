import { test } from './utils/global-setup';
import { expect } from '@playwright/test';
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
    // Setup API mocking and authentication
    await setupApiMocking(page, true);

    await page.goto('/sports/nba');

    // Check that we're on the correct URL first
    await expect(page).toHaveURL(/\/sports\/nba/);

    // Wait for main element to appear (should be faster with auth mocked)
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });

    // Verify page has NBA content or loading state
    await expect(page.locator('main')).toContainText(/NBA|Loading|Games/, { timeout: 10000 });

    // Use test.info() for test logging instead of console.log
    test.info().annotations.push({
      type: 'success',
      description: 'NBA page loaded successfully with authentication',
    });
  });

  test('should navigate to dashboard', async ({ page }) => {
    // Setup API mocking and authentication for protected route
    await setupApiMocking(page, true);

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
