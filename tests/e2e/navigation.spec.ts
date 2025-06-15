import { test, expect } from '@playwright/test';

import { setupTestAuth } from './utils/auth-utils';
import {
  setupApiMocking,
  waitForPageContent,
  getPrimaryMainElement,
  setupErrorHandling,
  expandMobileMenuIfNeeded,
} from './utils/test-utils';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocking(page, true);
    await setupTestAuth(page);
    setupErrorHandling(page);
  });

  test('should navigate to sports pages', async ({ page }) => {
    await page.goto('/');
    await waitForPageContent(page);
    await expandMobileMenuIfNeeded(page);
    await page.getByRole('link', { name: /all sports/i }).click();
    await waitForPageContent(page);
    await expect(page).toHaveURL(/.*\/sports\/all-sports/);
    await expect(await getPrimaryMainElement(page)).toBeVisible();
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/');
    await waitForPageContent(page);
    await expandMobileMenuIfNeeded(page);
    await page.getByRole('link', { name: /dashboard/i }).click();
    await waitForPageContent(page);
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test.skip('should navigate to NBA page', async ({ page }) => {
    await setupApiMocking(page, true);
    await page.goto('/');
    await waitForPageContent(page);

    const isMobileMenuVisible = await page.getByRole('button', { name: /menu/i }).isVisible();
    const isNBALinkVisible = await page.getByRole('link', { name: /nba/i }).isVisible();

    if (isMobileMenuVisible && !isNBALinkVisible) {
      await page.getByRole('button', { name: /menu/i }).click();
      await page.waitForTimeout(300);
      await expect(page.getByRole('link', { name: /nba/i })).toBeVisible();
    }

    await page.getByRole('link', { name: /nba/i }).click();
    await waitForPageContent(page);

    await page.waitForFunction(
      () => {
        const loadingSpinner = document.querySelector('.animate-spin');
        const loadingText = Array.from(document.querySelectorAll('div')).find(
          el => el.textContent === 'Loading games...'
        );
        const mainContent = document.querySelector('main.grow');
        return !loadingSpinner && !loadingText && mainContent?.textContent?.includes('NBA Games');
      },
      { timeout: 15000 }
    );

    await expect(page.getByRole('heading', { name: /nba games/i, level: 1 })).toBeVisible({
      timeout: 15000,
    });
    await expect(page).toHaveURL('/sports/nba');
    await page.waitForLoadState('networkidle');
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/non-existent-page');
    await page.waitForSelector('h2', { state: 'visible' });
    await expect(page.getByRole('heading', { name: 'Not Found', level: 2 })).toBeVisible();
    await expect(page.getByText('Could not find the requested resource')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Return Home' })).toBeVisible();
    await page.getByRole('link', { name: 'Return Home' }).click();
    await expect(page).toHaveURL('/');
  });

  test('should have working back/forward navigation', async ({ page }) => {
    await page.goto('/');
    await waitForPageContent(page);
    await expandMobileMenuIfNeeded(page);
    await page.getByRole('link', { name: /dashboard/i }).click();
    await waitForPageContent(page);
    await expect(page).toHaveURL(/.*\/dashboard/);
    await page.goBack();
    await waitForPageContent(page);
    await expect(page).toHaveURL('/');
    await page.goForward();
    await waitForPageContent(page);
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
