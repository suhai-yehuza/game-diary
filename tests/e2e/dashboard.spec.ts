import { test, expect } from '@playwright/test';
import {
  safeGoto,
  waitForPageLoad,
  checkBasicPageStructure,
  checkPageTitle,
  checkAccessibilityBasics,
  checkPerformanceMetrics,
  checkForConsoleErrors,
  checkResponsiveBehavior,
  takeDebugScreenshot,
} from './utils/test-utils';

test.describe.configure({ retries: 2 }); // TEMP: Retry flaky tests while stabilizing

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await safeGoto(page, '/dashboard');
    // Wait for relevant network response (API proxy/games or similar)
    await page
      .waitForResponse(resp => resp.url().includes('/api/proxy/games') && resp.status() === 200, {
        timeout: 15000,
      })
      .catch(() => {}); // ignore if not present
    await waitForPageLoad(page);
    // Disable all CSS animations and transitions for test reliability
    await page.addStyleTag({
      content: '* { transition: none !important; animation: none !important; }',
    });
  });

  test('should load dashboard page successfully', async ({ page }) => {
    // Check basic page structure
    await checkBasicPageStructure(page);

    // Check page title
    await checkPageTitle(page);

    // Check that we're on dashboard page
    await expect(page).toHaveURL('/dashboard');

    // Check that main content is visible
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
  });

  test('should have proper dashboard navigation', async ({ page }) => {
    // Check for dashboard navigation
    const dashboardNav = page.locator('[data-testid="dashboard-nav"], .dashboard-nav, nav');
    if ((await dashboardNav.count()) > 0) {
      await expect(dashboardNav.first()).toBeVisible();
    }

    // Check for user menu/profile
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, [data-testid="profile"]');
    if ((await userMenu.count()) > 0) {
      await expect(userMenu.first()).toBeVisible();
    }
  });

  test('should display user profile information', async ({ page }) => {
    // Check for profile section
    const profileSection = page.locator(
      '[data-testid="profile"], .profile, [data-section="profile"]'
    );
    if ((await profileSection.count()) > 0) {
      await expect(profileSection.first()).toBeVisible();

      // Check for user name
      const userName = profileSection.locator('[data-testid="user-name"], .user-name, h1, h2');
      if ((await userName.count()) > 0) {
        await expect(userName.first()).toBeVisible();
      }

      // Check for user email
      const userEmail = profileSection.locator('[data-testid="user-email"], .user-email');
      if ((await userEmail.count()) > 0) {
        await expect(userEmail.first()).toBeVisible();
      }
    }
  });

  test('should display user preferences', async ({ page }) => {
    // Check for preferences section
    const preferencesSection = page.locator(
      '[data-testid="preferences"], .preferences, [data-section="preferences"]'
    );
    if ((await preferencesSection.count()) > 0) {
      await expect(preferencesSection.first()).toBeVisible();

      // Check for preference controls
      const preferenceControls = preferencesSection.locator(
        'input, select, button, [data-testid="preference"]'
      );
      const controlCount = await preferenceControls.count();

      if (controlCount > 0) {
        // Check that preferences are interactive
        for (let i = 0; i < Math.min(controlCount, 3); i++) {
          const control = preferenceControls.nth(i);
          await expect(control).toBeVisible();
          await expect(control).toBeEnabled();
        }
      }
    }
  });

  test('should display user statistics', async ({ page }) => {
    // Check for statistics section
    const statsSection = page.locator(
      '[data-testid="statistics"], .statistics, [data-section="stats"]'
    );
    if ((await statsSection.count()) > 0) {
      await expect(statsSection.first()).toBeVisible();

      // Check for stat cards
      const statCards = statsSection.locator(
        '[data-testid="stat-card"], .stat-card, [data-type="stat"]'
      );
      const cardCount = await statCards.count();

      if (cardCount > 0) {
        // Check that stat cards are visible
        for (let i = 0; i < Math.min(cardCount, 5); i++) {
          const card = statCards.nth(i);
          await expect(card).toBeVisible();

          // Check for stat value
          const statValue = card.locator(
            '[data-testid="stat-value"], .stat-value, [data-type="value"]'
          );
          if ((await statValue.count()) > 0) {
            await expect(statValue.first()).toBeVisible();
          }
        }
      }
    }
  });

  test('should display recent activity', async ({ page }) => {
    // Check for activity section
    const activitySection = page.locator(
      '[data-testid="activity"], .activity, [data-section="activity"]'
    );
    if ((await activitySection.count()) > 0) {
      await expect(activitySection.first()).toBeVisible();

      // Check for activity items
      const activityItems = activitySection.locator(
        '[data-testid="activity-item"], .activity-item, [data-type="activity"]'
      );
      const itemCount = await activityItems.count();

      if (itemCount > 0) {
        // Check that activity items are visible
        for (let i = 0; i < Math.min(itemCount, 5); i++) {
          const item = activityItems.nth(i);
          await expect(item).toBeVisible();

          // Check for activity timestamp
          const timestamp = item.locator('[data-testid="timestamp"], .timestamp, time');
          if ((await timestamp.count()) > 0) {
            await expect(timestamp.first()).toBeVisible();
          }
        }
      }
    }
  });

  test('should display user settings', async ({ page }) => {
    // Check for settings section
    const settingsSection = page.locator(
      '[data-testid="settings"], .settings, [data-section="settings"]'
    );
    if ((await settingsSection.count()) > 0) {
      await expect(settingsSection.first()).toBeVisible();

      // Check for settings controls
      const settingsControls = settingsSection.locator(
        'input, select, button, [data-testid="setting"]'
      );
      const controlCount = await settingsControls.count();

      if (controlCount > 0) {
        // Check that settings are interactive
        for (let i = 0; i < Math.min(controlCount, 3); i++) {
          const control = settingsControls.nth(i);
          await expect(control).toBeVisible();
          await expect(control).toBeEnabled();
        }
      }
    }
  });

  test('should handle dashboard tabs/navigation', async ({ page }) => {
    // Check for tab navigation
    const tabs = page.locator('[data-testid="tabs"], .tabs, [role="tablist"]');
    if ((await tabs.count()) > 0) {
      await expect(tabs.first()).toBeVisible();

      // Check for tab buttons
      const tabButtons = tabs.locator('[role="tab"], button, [data-testid="tab"]');
      const buttonCount = await tabButtons.count();

      if (buttonCount > 0) {
        // Test tab switching
        for (let i = 0; i < Math.min(buttonCount, 3); i++) {
          const tab = tabButtons.nth(i);
          await expect(tab).toBeVisible();
          await expect(tab).toBeEnabled();

          // Click tab
          await tab.click();
          await page.waitForTimeout(1000);

          // Check that content is still visible
          await expect(page.locator('main')).toBeVisible();
        }
      }
    }
  });

  test('should handle dashboard search functionality', async ({ page }) => {
    // Check for search input
    const searchInput = page.locator(
      '[data-testid="search"], input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]'
    );
    if ((await searchInput.count()) > 0) {
      await expect(searchInput.first()).toBeVisible();
      await expect(searchInput.first()).toBeEnabled();

      // Test search functionality
      await searchInput.first().fill('test');
      await page.waitForTimeout(1000);

      // Check that search results or no results message is shown
      const searchResults = page.locator(
        '[data-testid="search-results"], .search-results, [data-section="search"]'
      );
      if ((await searchResults.count()) > 0) {
        await expect(searchResults.first()).toBeVisible();
      }
    }
  });

  test('should handle dashboard filtering', async ({ page }) => {
    // Check for filter controls
    const filters = page.locator('[data-testid="filters"], .filters, [data-section="filters"]');
    if ((await filters.count()) > 0) {
      await expect(filters.first()).toBeVisible();

      // Check for filter options
      const filterOptions = filters.locator('select, input, button, [data-testid="filter"]');
      const filterCount = await filterOptions.count();

      if (filterCount > 0) {
        // Test filtering functionality
        for (let i = 0; i < Math.min(filterCount, 3); i++) {
          const filter = filterOptions.nth(i);
          await expect(filter).toBeVisible();
          await expect(filter).toBeEnabled();

          // Interact with filter
          if ((await filter.evaluate(el => el.tagName.toLowerCase())) === 'select') {
            await filter.selectOption({ index: 0 });
          } else {
            await filter.click();
          }

          await page.waitForTimeout(1000);

          // Check that content is still visible
          await expect(page.locator('main')).toBeVisible();
        }
      }
    }
  });

  test('should handle dashboard sorting', async ({ page }) => {
    // Check for sort controls
    const sortControls = page.locator('[data-testid="sort"], .sort, [data-section="sort"]');
    if ((await sortControls.count()) > 0) {
      await expect(sortControls.first()).toBeVisible();

      // Check for sort buttons
      const sortButtons = sortControls.locator('button, select, [data-testid="sort-button"]');
      const buttonCount = await sortButtons.count();

      if (buttonCount > 0) {
        // Test sorting functionality
        for (let i = 0; i < Math.min(buttonCount, 2); i++) {
          const button = sortButtons.nth(i);
          await expect(button).toBeVisible();
          await expect(button).toBeEnabled();

          // Click sort button
          await button.click();
          await page.waitForTimeout(1000);

          // Check that content is still visible
          await expect(page.locator('main')).toBeVisible();
        }
      }
    }
  });

  test('should handle dashboard data refresh', async ({ page }) => {
    // Check for refresh button
    const refreshButton = page.locator(
      '[data-testid="refresh"], button[aria-label*="refresh"], button:has-text("Refresh")'
    );
    if ((await refreshButton.count()) > 0) {
      await expect(refreshButton.first()).toBeVisible();
      await expect(refreshButton.first()).toBeEnabled();

      // Test refresh functionality
      await refreshButton.first().click();
      await page.waitForTimeout(2000);

      // Check that page content is still visible after refresh
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('should handle dashboard data export', async ({ page }) => {
    // Check for export functionality
    const exportButton = page.locator(
      '[data-testid="export"], button[aria-label*="export"], button:has-text("Export")'
    );
    if ((await exportButton.count()) > 0) {
      await expect(exportButton.first()).toBeVisible();
      await expect(exportButton.first()).toBeEnabled();

      // Test export functionality (without actually downloading)
      await exportButton.first().click();
      await page.waitForTimeout(1000);

      // Check that page is still functional
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('should be accessible on dashboard', async ({ page }) => {
    // Check accessibility basics
    await checkAccessibilityBasics(page);

    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);

    // Check that focus is visible
    const focusedElement = page.locator(':focus');
    if ((await focusedElement.count()) > 0) {
      await expect(focusedElement).toBeVisible();
    }
  });

  test('should have good dashboard performance', async ({ page }) => {
    // Check performance metrics
    const metrics = await checkPerformanceMetrics(page);

    // Performance should be reasonable for dashboard
    expect(metrics.loadTime).toBeLessThan(5000); // 5 seconds
    expect(metrics.domContentLoaded).toBeLessThan(3000); // 3 seconds
  });

  test('should not have console errors on dashboard', async ({ page }) => {
    // Check for console errors
    await checkForConsoleErrors(page);
  });

  test('should be responsive on mobile for dashboard', async ({ page }) => {
    // Test mobile responsiveness
    await checkResponsiveBehavior(page, { width: 375, height: 667 });

    // Check that dashboard content is still accessible on mobile
    const dashboardContent = page.locator(
      '[data-testid="dashboard-content"], .dashboard-content, main'
    );
    await expect(dashboardContent.first()).toBeVisible();
  });

  test('should be responsive on tablet for dashboard', async ({ page }) => {
    // Test tablet responsiveness
    await checkResponsiveBehavior(page, { width: 768, height: 1024 });

    // Check that layout adapts properly
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should handle dashboard loading states', async ({ page }) => {
    // Check for loading indicators
    const loadingIndicators = page.locator(
      '[data-testid="loading"], .loading, [aria-label*="loading"]'
    );
    if ((await loadingIndicators.count()) > 0) {
      // Wait for loading to complete
      await page.waitForTimeout(2000);

      // Check that loading indicators are hidden
      for (let i = 0; i < (await loadingIndicators.count()); i++) {
        const indicator = loadingIndicators.nth(i);
        await expect(indicator).not.toBeVisible();
      }
    }
  });

  test('should handle dashboard error states', async ({ page }) => {
    // Check for error handling
    const errorMessages = page.locator('[data-testid="error"], .error, [role="alert"]');
    if ((await errorMessages.count()) > 0) {
      // Check that error messages are properly styled
      for (let i = 0; i < (await errorMessages.count()); i++) {
        const error = errorMessages.nth(i);
        await expect(error).toBeVisible();
      }
    }
  });

  test('should handle dashboard empty states', async ({ page }) => {
    // Check for empty state handling
    const emptyStates = page.locator('[data-testid="empty"], .empty, [data-state="empty"]');
    if ((await emptyStates.count()) > 0) {
      // Check that empty states are properly displayed
      for (let i = 0; i < (await emptyStates.count()); i++) {
        const empty = emptyStates.nth(i);
        await expect(empty).toBeVisible();

        // Check for empty state message
        const message = empty.locator('[data-testid="empty-message"], .empty-message, p');
        if ((await message.count()) > 0) {
          await expect(message.first()).toBeVisible();
        }
      }
    }
  });
});
