import { test, expect } from '@playwright/test';
import { setupApiMocking, waitForPageContent, getPrimaryMainElement, setupErrorHandling, expandMobileMenuIfNeeded } from './utils/test-utils';
import { setupTestAuth } from './utils/auth-utils';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocking(page, true);
    await setupTestAuth(page);
    setupErrorHandling(page);
  });

  test('should navigate to sports pages', async ({ page }) => {
    await page.goto('/');
    await waitForPageContent(page);

    // Expand mobile menu if needed
    await expandMobileMenuIfNeeded(page);

    // Click on sports link
    await page.getByRole('link', { name: /all sports/i }).click();
    await waitForPageContent(page);

    // Verify we're on the sports page
    await expect(page).toHaveURL(/.*\/sports\/all-sports/);
    await expect(await getPrimaryMainElement(page)).toBeVisible();
  });

  test('should navigate to NBA page', async ({ page }) => {
    await page.goto('/');
    await waitForPageContent(page);

    // Check if we need to expand the mobile menu
    const isMobile = await page.getByRole('button', { name: /menu/i }).isVisible();
    const isNBALinkVisible = await page.getByRole('link', { name: /nba/i }).isVisible();

    if (isMobile && !isNBALinkVisible) {
      await page.getByRole('button', { name: /menu/i }).click();
      await page.waitForTimeout(300); // Wait for animation
      await expect(page.getByRole('link', { name: /nba/i })).toBeVisible();
    }

    await page.getByRole('link', { name: /nba/i }).click();
    await waitForPageContent(page);

    // Wait for loading spinner and text to disappear
    await page.waitForSelector('.animate-spin', { state: 'hidden' });
    await page.waitForSelector('text=Loading games...', { state: 'hidden' });

    // Wait for the heading to be visible
    await expect(page.getByRole('heading', { name: /nba games/i, level: 1 })).toBeVisible();
    await expect(page).toHaveURL('/sports/nba');
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/');
    await waitForPageContent(page);

    // Expand mobile menu if needed
    await expandMobileMenuIfNeeded(page);

    // Click on dashboard link
    await page.getByRole('link', { name: /dashboard/i }).click();
    await waitForPageContent(page);

    // Verify we're on the dashboard page
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Wait for the page to be ready
    await page.waitForSelector('h2', { state: 'visible' });
    
    // Check for 404 content
    await expect(page.getByRole('heading', { name: 'Not Found', level: 2 })).toBeVisible();
    await expect(page.getByText('Could not find the requested resource')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Return Home' })).toBeVisible();
    
    // Click the return home link
    await page.getByRole('link', { name: 'Return Home' }).click();
    await expect(page).toHaveURL('/');
  });

  test('should have working back/forward navigation', async ({ page }) => {
    // Start at home page
    await page.goto('/');
    await waitForPageContent(page);

    // Navigate to dashboard
    await expandMobileMenuIfNeeded(page);
    await page.getByRole('link', { name: /dashboard/i }).click();
    await waitForPageContent(page);
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Go back to home page
    await page.goBack();
    await waitForPageContent(page);
    await expect(page).toHaveURL('/');

    // Go forward to dashboard
    await page.goForward();
    await waitForPageContent(page);
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
