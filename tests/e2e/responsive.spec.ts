import { test, expect } from '@playwright/test';
import {
  safeGoto,
  waitForPageLoad,
  checkBasicPageStructure,
  checkResponsiveBehavior,
  checkAccessibilityBasics,
  checkPerformanceMetrics,
  checkForConsoleErrors,
  takeDebugScreenshot,
} from './utils/test-utils';
import { MOCK_NBA_GAMES } from '@src/lib/mock/nbaGamesMock';
import { MOCK_NBA_TEAMS } from '@src/lib/mock/nbaTeamsMock';
import { MOCK_NBA_STANDINGS } from '@src/lib/mock/nbaStandingsMock';
import { MOCK_NBA_PLAYERS } from '@src/lib/mock/nbaPlayersMock';

test.describe.configure({ retries: 2 }); // TEMP: Retry flaky tests while stabilizing

test.describe('Responsive Design', () => {
  const viewports = [
    // Mobile devices
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12 Pro', width: 390, height: 844 },
    { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
    { name: 'Samsung Galaxy S20', width: 360, height: 800 },
    { name: 'Samsung Galaxy S21', width: 384, height: 854 },

    // Tablet devices
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
    { name: 'Samsung Galaxy Tab', width: 800, height: 1280 },

    // Desktop devices
    { name: 'Small Desktop', width: 1024, height: 768 },
    { name: 'Medium Desktop', width: 1366, height: 768 },
    { name: 'Large Desktop', width: 1920, height: 1080 },
    { name: 'Ultra Wide', width: 2560, height: 1440 },
  ];

  const testPages = [
    '/',
    '/sports/nba',
    '/sports/nfl',
    '/sports/mlb',
    '/sports/nhl',
    '/sports/mls',
    '/sports/all-sports',
    '/sports/live',
    '/dashboard',
    '/sign-in',
    '/sign-up',
  ];

  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        // Mock Clerk CDN JS requests to avoid network flakiness and ChunkLoadError
        await page.route('https://meet-kite-73.clerk.accounts.dev/npm/@clerk/clerk-js*', route => {
          route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: '',
          });
        });
        // Mock Clerk session endpoint to simulate a signed-in user
        await page.route('https://api.clerk.dev/v1/client/sessions/*', route => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              object: 'session',
              id: 'sess_test',
              status: 'active',
              user_id: 'user_test',
              last_active_organization_id: null,
            }),
          });
        });
        // Mock Clerk user endpoint
        await page.route('https://api.clerk.dev/v1/client/users/*', route => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              object: 'user',
              id: 'user_test',
              email_addresses: [{ id: 'email_test', email_address: 'test@example.com' }],
            }),
          });
        });
        // Mock NBA API endpoints with realistic data
        await page.route('https://api-nba-v1.p.rapidapi.com/games*', route => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_NBA_GAMES),
          });
        });
        await page.route('https://api-nba-v1.p.rapidapi.com/teams*', route => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_NBA_TEAMS),
          });
        });
        await page.route('https://api-nba-v1.p.rapidapi.com/standings*', route => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_NBA_STANDINGS),
          });
        });
        await page.route('https://api-nba-v1.p.rapidapi.com/players*', route => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_NBA_PLAYERS),
          });
        });
        // Fallback for any other NBA API endpoint
        await page.route('https://api-nba-v1.p.rapidapi.com/**', route => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ mocked: true, message: 'Mocked NBA API fallback response' }),
          });
        });
        await page.route('https://nba-stats-db.herokuapp.com/**', route => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ mocked: true, message: 'Mocked NBA Stats DB response' }),
          });
        });
        await page.route('https://media.api-sports.io/**', route => {
          // For images, return a 1x1 transparent SVG
          route.fulfill({
            status: 200,
            contentType: 'image/svg+xml',
            body: `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>`,
          });
        });
        // Disable all CSS animations and transitions for test reliability
        await page.addStyleTag({
          content: '* { transition: none !important; animation: none !important; }',
        });
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      });

      for (const pagePath of testPages) {
        test(`should render ${pagePath} correctly on ${viewport.name}`, async ({ page }) => {
          // Navigate to page
          await safeGoto(page, pagePath);
          // Wait for relevant network response (API proxy/games or similar)
          await page
            .waitForResponse(
              resp => resp.url().includes('/api/proxy/games') && resp.status() === 200,
              { timeout: 15000 }
            )
            .catch(() => {}); // ignore if not present
          await waitForPageLoad(page);

          // Check basic page structure
          await checkBasicPageStructure(page);

          // Check that page content is visible
          await expect(page.locator('body')).toBeVisible({ timeout: 15000 });

          // Check that main content is visible
          await expect(page.locator('main')).toBeVisible({ timeout: 15000 });

          // Check responsive behavior
          await checkResponsiveBehavior(page, { width: viewport.width, height: viewport.height });
        });

        test(`should have proper navigation on ${viewport.name} for ${pagePath}`, async ({
          page,
        }) => {
          await safeGoto(page, pagePath);
          await waitForPageLoad(page);

          // Check for navigation elements
          const nav = page.locator('nav, [role="navigation"]');
          if ((await nav.count()) > 0) {
            await expect(nav.first()).toBeVisible();

            // Check that navigation is accessible
            const navLinks = nav.locator('a, button');
            const linkCount = await navLinks.count();

            if (linkCount > 0) {
              // Try to find a visible nav link or button
              let firstVisibleIndex = -1;
              for (let i = 0; i < linkCount; i++) {
                if (await navLinks.nth(i).isVisible()) {
                  firstVisibleIndex = i;
                  break;
                }
              }

              // If none are visible, try to expand the menu (for mobile/tablet)
              if (firstVisibleIndex === -1) {
                // Look for a menu toggle button (aria-label="Toggle menu")
                const menuToggle = nav.locator('button[aria-label="Toggle menu"]');
                if (await menuToggle.isVisible()) {
                  await menuToggle.click();
                  // Wait for nav links to become visible
                  await page.waitForTimeout(300); // allow animation
                  // Re-check for visible nav link/button
                  for (let i = 0; i < linkCount; i++) {
                    if (await navLinks.nth(i).isVisible()) {
                      firstVisibleIndex = i;
                      break;
                    }
                  }
                }
              }

              // Now check that at least one navigation link is visible
              expect(firstVisibleIndex).not.toBe(-1);
              await expect(navLinks.nth(firstVisibleIndex)).toBeVisible();

              // Check that navigation links are properly sized for touch
              const visibleLinks = [];
              for (let i = 0; i < linkCount; i++) {
                const link = navLinks.nth(i);
                if (await link.isVisible()) {
                  visibleLinks.push(link);
                }
                if (visibleLinks.length >= 5) break;
              }
              for (const link of visibleLinks) {
                await expect(link).toBeVisible();
                // Check touch target size (minimum 44px for mobile)
                if (viewport.width <= 768) {
                  const box = await link.boundingBox();
                  if (box) {
                    expect(box.width).toBeGreaterThanOrEqual(44);
                    expect(box.height).toBeGreaterThanOrEqual(44);
                  }
                }
              }
            }
          }
        });

        test(`should have proper content layout on ${viewport.name} for ${pagePath}`, async ({
          page,
        }) => {
          await safeGoto(page, pagePath);
          await waitForPageLoad(page);

          // Check for content sections
          const sections = page.locator('main section, main > div, [data-section]');
          const sectionCount = await sections.count();

          if (sectionCount > 0) {
            // Check that sections are visible and properly laid out
            for (let i = 0; i < Math.min(sectionCount, 5); i++) {
              const section = sections.nth(i);
              await expect(section).toBeVisible();

              // Check that content doesn't overflow horizontally
              const box = await section.boundingBox();
              if (box) {
                expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
              }
            }
          }

          // Check for proper text readability
          const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div');
          const textCount = await textElements.count();

          if (textCount > 0) {
            // Check that text is readable
            for (let i = 0; i < Math.min(textCount, 10); i++) {
              const text = textElements.nth(i);
              const isVisible = await text.isVisible();

              if (isVisible) {
                // Check that text doesn't overflow
                const box = await text.boundingBox();
                if (box) {
                  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
                }
              }
            }
          }
        });

        test(`should handle touch interactions on ${viewport.name} for ${pagePath}`, async ({
          page,
        }) => {
          await safeGoto(page, pagePath);
          await waitForPageLoad(page);

          // Check for interactive elements
          const interactiveElements = page.locator(
            'button, a, input, select, textarea, [role="button"]'
          );
          const elementCount = await interactiveElements.count();

          if (elementCount > 0 && viewport.width <= 768) {
            // Filter for visible elements only
            const visibleElements = [];
            for (let i = 0; i < elementCount; i++) {
              const element = interactiveElements.nth(i);
              if (await element.isVisible()) {
                visibleElements.push(element);
              }
              if (visibleElements.length >= 5) break;
            }
            for (const element of visibleElements) {
              if (await element.isVisible()) {
                // Check touch target size
                const box = await element.boundingBox();
                if (box) {
                  if (box.width < 44 || box.height < 44) {
                    const html = await element.evaluate(el => el.outerHTML);
                    console.log('Small touch target:', html, box);
                  }
                  expect(box.width).toBeGreaterThanOrEqual(44);
                  expect(box.height).toBeGreaterThanOrEqual(44);
                }
                // Test touch interaction (without actually clicking)
                await element.hover();
                await page.waitForTimeout(100);
              }
            }
          }
        });

        test(`should have proper accessibility on ${viewport.name} for ${pagePath}`, async ({
          page,
        }) => {
          await safeGoto(page, pagePath);
          await waitForPageLoad(page);

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

        test(`should have good performance on ${viewport.name} for ${pagePath}`, async ({
          page,
        }) => {
          await safeGoto(page, pagePath);
          await waitForPageLoad(page);

          // Check performance metrics
          const metrics = await checkPerformanceMetrics(page);

          // Performance should be reasonable for all viewports
          expect(metrics.loadTime).toBeLessThan(8000); // 8 seconds max
          expect(metrics.domContentLoaded).toBeLessThan(5000); // 5 seconds max
        });

        test(`should not have console errors on ${viewport.name} for ${pagePath}`, async ({
          page,
        }) => {
          await safeGoto(page, pagePath);
          await waitForPageLoad(page);

          // Check for console errors
          await checkForConsoleErrors(page);
        });
      }
    });
  }

  test.describe('Cross-Viewport Consistency', () => {
    test('should maintain consistent navigation across viewports', async ({ page }) => {
      const testViewports = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 }, // Desktop
      ];

      for (const viewport of testViewports) {
        await page.setViewportSize(viewport);
        await safeGoto(page, '/');
        await waitForPageLoad(page);

        // Check that navigation is always present
        const nav = page.locator('nav, [role="navigation"]');
        if ((await nav.count()) > 0) {
          await expect(nav.first()).toBeVisible();
        }

        // Check that main content is always visible
        await expect(page.locator('main')).toBeVisible();
      }
    });

    test('should handle orientation changes', async ({ page }) => {
      // Test portrait orientation
      await page.setViewportSize({ width: 375, height: 667 });
      await safeGoto(page, '/');
      await waitForPageLoad(page);
      await expect(page.locator('body')).toBeVisible();

      // Test landscape orientation
      await page.setViewportSize({ width: 667, height: 375 });
      await page.reload();
      await waitForPageLoad(page);
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle dynamic viewport changes', async ({ page }) => {
      await safeGoto(page, '/');
      await waitForPageLoad(page);

      // Test different viewport sizes dynamically
      const viewportSizes = [
        { width: 320, height: 568 },
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1024, height: 768 },
        { width: 1920, height: 1080 },
      ];

      for (const size of viewportSizes) {
        await page.setViewportSize(size);
        await page.waitForTimeout(1000); // Wait for layout to adjust

        // Check that page is still functional
        await expect(page.locator('body')).toBeVisible();

        // Check that content doesn't overflow
        const main = page.locator('main');
        const box = await main.boundingBox();
        if (box) {
          expect(box.x + box.width).toBeLessThanOrEqual(size.width);
        }
      }
    });
  });

  test.describe('Mobile-Specific Features', () => {
    test('should handle mobile navigation menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await safeGoto(page, '/');
      await waitForPageLoad(page);

      // Check for mobile menu button
      const menuButton = page.locator(
        '[data-testid="mobile-menu"], button[aria-label*="menu"], button[aria-label*="Menu"]'
      );
      if ((await menuButton.count()) > 0) {
        await expect(menuButton.first()).toBeVisible();
        await expect(menuButton.first()).toBeEnabled();

        // Test menu toggle
        await menuButton.first().click();
        await page.waitForTimeout(1000);

        // Check that menu is visible
        const menu = page.locator('[data-testid="mobile-nav"], .mobile-nav, [role="menu"]');
        if ((await menu.count()) > 0) {
          await expect(menu.first()).toBeVisible();
        }
      }
    });

    test('should handle mobile touch gestures', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await safeGoto(page, '/sports/nba');
      await waitForPageLoad(page);

      // Test swipe gestures (if applicable)
      const swipeableContent = page.locator(
        '[data-testid="swipeable"], .swipeable, [data-swipeable]'
      );
      if ((await swipeableContent.count()) > 0) {
        const content = swipeableContent.first();
        await expect(content).toBeVisible();

        // Test touch interaction
        await content.hover();
        await page.waitForTimeout(500);
      }
    });

    test('should handle mobile keyboard', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await safeGoto(page, '/sign-in');
      await waitForPageLoad(page);

      // Target the visible sign-in input by label
      const emailInput = page.getByLabel('Email address');
      await expect(emailInput).toBeVisible({ timeout: 2000 });
      await emailInput.click();
      await emailInput.fill('test@example.com');
      await page.waitForTimeout(500);

      // Check that virtual keyboard doesn't break layout
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Tablet-Specific Features', () => {
    test('should handle tablet navigation', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await safeGoto(page, '/');
      await waitForPageLoad(page);

      // Check that tablet navigation is appropriate
      const nav = page.locator('nav, [role="navigation"]');
      if ((await nav.count()) > 0) {
        await expect(nav.first()).toBeVisible();

        // Check that navigation items are properly spaced for tablet
        const navItems = nav.locator('a, button');
        const itemCount = await navItems.count();

        if (itemCount > 1) {
          // Check spacing between items
          const firstItem = navItems.first();
          const secondItem = navItems.nth(1);

          const firstBox = await firstItem.boundingBox();
          const secondBox = await secondItem.boundingBox();

          if (firstBox && secondBox) {
            const spacing = secondBox.x - (firstBox.x + firstBox.width);
            expect(spacing).toBeGreaterThan(10); // Minimum spacing
          }
        }
      }
    });

    test('should handle tablet content layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await safeGoto(page, '/sports/nba');
      await waitForPageLoad(page);

      // Check that content uses tablet-appropriate layout
      const content = page.locator('main');
      if ((await content.count()) > 0) {
        await expect(content).toBeVisible();

        // Check that content doesn't waste space on tablet
        const box = await content.boundingBox();
        if (box) {
          // Content should use reasonable amount of available width
          expect(box.width).toBeGreaterThan(600);
        }
      }
    });
  });

  test.describe('Desktop-Specific Features', () => {
    test('should handle desktop navigation', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await safeGoto(page, '/');
      await waitForPageLoad(page);

      // Check that desktop navigation is comprehensive
      const nav = page.locator('nav, [role="navigation"]');
      if ((await nav.count()) > 0) {
        await expect(nav.first()).toBeVisible();

        // Check that all navigation items are visible on desktop
        const navItems = nav.locator('a, button');
        const itemCount = await navItems.count();

        if (itemCount > 0) {
          // All items should be visible on desktop, except hidden mobile menu buttons
          for (let i = 0; i < itemCount; i++) {
            const navItem = navItems.nth(i);
            // Skip mobile menu toggle button if hidden
            const isMenuToggle = (await navItem.getAttribute('aria-label')) === 'Toggle menu';
            if (isMenuToggle && !(await navItem.isVisible())) {
              continue;
            }
            await expect(navItem).toBeVisible();
          }
        }
      }
    });

    test('should handle desktop content layout', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await safeGoto(page, '/dashboard');
      await waitForPageLoad(page);

      // Check that desktop layout uses available space effectively
      const content = page.locator('main');
      if ((await content.count()) > 0) {
        await expect(content).toBeVisible();

        // Check that content uses desktop space appropriately
        const box = await content.boundingBox();
        if (box) {
          // Content should use significant portion of desktop width
          expect(box.width).toBeGreaterThan(1000);
        }
      }
    });

    test('should handle desktop hover interactions', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await safeGoto(page, '/sports/nba');
      await waitForPageLoad(page);

      // Test hover interactions
      const hoverableElements = page.locator('a, button, [data-testid*="hover"]');
      const elementCount = await hoverableElements.count();

      if (elementCount > 0) {
        let checked = 0;
        for (let i = 0; i < elementCount && checked < 3; i++) {
          const element = hoverableElements.nth(i);
          if (!(await element.isVisible())) {
            continue; // skip hidden elements (e.g., mobile menu button)
          }
          await expect(element).toBeVisible();

          // Test hover interaction
          await element.hover();
          await page.waitForTimeout(500);

          // Check that hover state is handled
          await expect(element).toBeVisible();
          checked++;
        }
      }
    });
  });
});
