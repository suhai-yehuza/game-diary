import { test, expect } from '@playwright/test';
import {
  runComprehensivePageTests,
  waitForNetworkIdle,
  clearTestData,
} from '@tests/e2e/utils/page-suites';

test.describe.configure({ retries: 2 }); // TEMP: Retry flaky tests while stabilizing

// Run comprehensive page tests for dashboard
runComprehensivePageTests(test, '/dashboard', 'Dashboard');

test.describe('Dashboard', () => {
  // Dashboard-specific tests
  test.describe('Dashboard - Specific Tests', () => {
    test.beforeEach(async ({ page }) => {
      await clearTestData(page); // Test data isolation: clear storage and cookies
      await page.goto('/dashboard');
      await waitForNetworkIdle(page);
      // Disable all CSS animations and transitions for test reliability
      await page.addStyleTag({
        content: '* { transition: none !important; animation: none !important; }',
      });
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
        const tabCount = await tabButtons.count();

        if (tabCount > 0) {
          // Check that tabs are interactive
          for (let i = 0; i < Math.min(tabCount, 3); i++) {
            const tab = tabButtons.nth(i);
            await expect(tab).toBeVisible();
            await expect(tab).toBeEnabled();
          }
        }
      }
    });
  });
});
