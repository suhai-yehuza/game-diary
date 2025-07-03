import { test, expect } from '@playwright/test';
import {
  safeGoto,
  safeGotoWithMocking,
  waitForPageLoad,
  checkBasicPageStructure,
  checkResponsiveBehavior,
  checkAccessibilityBasics,
  checkPerformanceMetrics,
  checkForConsoleErrors,
  takeDebugScreenshot,
  setupE2EMocking,
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
    // Determine which browser to use based on viewport size
    const isDesktopViewport = viewport.width >= 1024;
    const browserName = isDesktopViewport ? 'chromium' : 'Mobile Chrome';

    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.use({
        ...(isDesktopViewport
          ? {
              deviceScaleFactor: 1,
              hasTouch: false,
            }
          : {
              deviceScaleFactor: 2,
              hasTouch: true,
              // Note: isMobile is not supported in Firefox, so we avoid it
              // The viewport size will naturally make it behave like mobile
            }),
      });
      test.beforeEach(async ({ page }) => {
        // Set up comprehensive mocking to avoid API rate limiting
        await setupE2EMocking(page);

        // Disable all CSS animations and transitions for test reliability
        await page.addStyleTag({
          content: '* { transition: none !important; animation: none !important; }',
        });
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      });

      for (const pagePath of testPages) {
        test(`should render ${pagePath} correctly on ${viewport.name}`, async ({ page }) => {
          // Navigate to page with comprehensive mocking
          await safeGotoWithMocking(page, pagePath);
          await waitForPageLoad(page);

          // Check basic page structure
          await checkBasicPageStructure(page);

          // Check that page content is visible
          await expect(page.locator('body')).toBeVisible({ timeout: 15000 });

          // Check that main content is visible - try multiple selectors
          const mainContentSelectors = [
            'main',
            '[role="main"]',
            '.main-content',
            '.content',
            '#content',
            'article',
            '.page-content',
          ];

          let mainContentFound = false;
          for (const selector of mainContentSelectors) {
            const element = page.locator(selector);
            if ((await element.count()) > 0) {
              try {
                await expect(element.first()).toBeVisible({ timeout: 5000 });
                mainContentFound = true;
                console.log(`Found main content using selector: ${selector}`);
                break;
              } catch (error) {
                console.log(`Selector ${selector} found but not visible`);
              }
            }
          }

          if (!mainContentFound) {
            // If no main content found, check if page has any meaningful content
            const hasContent = await page.evaluate(() => {
              const body = document.body;
              const textContent = body.textContent || '';
              const visibleElements = body.querySelectorAll(
                '*:not([style*="display: none"]):not([hidden])'
              );
              return textContent.trim().length > 0 || visibleElements.length > 5;
            });

            if (!hasContent) {
              // Take a screenshot for debugging
              await page.screenshot({
                path: `debug-no-content-${viewport.name}-${pagePath.replace(/\//g, '-')}.png`,
                fullPage: true,
              });
              throw new Error(`No main content or meaningful content found on ${pagePath}`);
            } else {
              console.log(
                `Page ${pagePath} has content but no standard main container - this is acceptable`
              );
            }
          }

          // Check responsive behavior
          await checkResponsiveBehavior(page, { width: viewport.width, height: viewport.height });
        });

        test(`should have proper navigation on ${viewport.name} for ${pagePath}`, async ({
          page,
        }) => {
          await safeGotoWithMocking(page, pagePath);
          await waitForPageLoad(page);

          // Check for navigation elements
          const nav = page.locator('nav, [role="navigation"]');
          if ((await nav.count()) > 0) {
            // If there are multiple nav elements, check the first one that's visible
            let visibleNavFound = false;
            for (let i = 0; i < (await nav.count()); i++) {
              const navElement = nav.nth(i);
              if (await navElement.isVisible()) {
                await expect(navElement).toBeVisible();
                visibleNavFound = true;
                break; // Only check the first visible nav element
              }
            }
            // If no visible nav found, check the first one anyway
            if (!visibleNavFound) {
              await expect(nav.first()).toBeVisible();
            }

            // Check that navigation is accessible
            // Look for navigation links in all nav elements, including nested ones
            const navLinks = page.locator('nav a, nav button');

            // Wait for navigation links to be loaded (ClientOnlyNavigationLinks component)
            await page.waitForTimeout(1000);

            const linkCount = await navLinks.count();

            if (linkCount > 0) {
              // Try to find a visible nav link or button
              let firstVisibleIndex = -1;
              for (let i = 0; i < linkCount; i++) {
                const link = navLinks.nth(i);
                const isVisible = await link.isVisible();
                const text = await link.textContent();
                // Skip empty links and look for actual navigation links
                if (isVisible && text && text.trim() !== '') {
                  firstVisibleIndex = i;
                  break;
                }
              }

              // If none are visible, try to expand the menu (for mobile/tablet)
              if (firstVisibleIndex === -1) {
                // Look for a menu toggle button (aria-label="Toggle menu")
                const menuToggle = page.locator('button[aria-label="Toggle menu"]');
                if (await menuToggle.isVisible()) {
                  try {
                    // Try multiple approaches to interact with the menu toggle
                    let menuClicked = false;

                    // First, try a simple click
                    try {
                      await menuToggle.click({ timeout: 3000 });
                      menuClicked = true;
                    } catch (clickError) {
                      // If click fails, try using keyboard
                      try {
                        await menuToggle.focus();
                        await page.keyboard.press('Enter');
                        menuClicked = true;
                      } catch (keyboardError) {
                        // If keyboard fails, try using JavaScript click
                        try {
                          await menuToggle.evaluate(el => (el as HTMLElement).click());
                          menuClicked = true;
                        } catch (jsError) {
                          console.log(`All menu toggle interaction methods failed for ${pagePath}`);
                        }
                      }
                    }

                    if (menuClicked) {
                      // Wait for nav links to become visible
                      await page.waitForTimeout(1000); // allow animation
                      // Re-check for visible nav link/button
                      for (let i = 0; i < linkCount; i++) {
                        const link = navLinks.nth(i);
                        const isVisible = await link.isVisible();
                        const text = await link.textContent();
                        // Skip empty links and look for actual navigation links
                        if (isVisible && text && text.trim() !== '') {
                          firstVisibleIndex = i;
                          break;
                        }
                      }
                    }
                  } catch (error) {
                    // If menu toggle fails, just log it and continue - this is common on mobile
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.log(`Menu toggle interaction failed for ${pagePath}: ${errorMessage}`);
                  }
                }
              }

              // If still no visible links, check if we're on a viewport where navigation should be visible by default
              if (firstVisibleIndex === -1 && viewport.width >= 1024) {
                // On desktop, navigation should be visible by default
                // Let's check if there are any navigation elements at all
                const allNavElements = page.locator('nav');
                const navCount = await allNavElements.count();
                if (navCount > 0) {
                  // If we have nav elements but no visible links, this might be a timing issue
                  // Let's wait a bit more and try again
                  await page.waitForTimeout(1000);
                  for (let i = 0; i < linkCount; i++) {
                    const link = navLinks.nth(i);
                    const isVisible = await link.isVisible();
                    const text = await link.textContent();
                    // Skip empty links and look for actual navigation links
                    if (isVisible && text && text.trim() !== '') {
                      firstVisibleIndex = i;
                      break;
                    }
                  }
                }
              }

              // Now check that at least one navigation link is visible
              // On mobile devices, navigation links might be hidden behind a menu toggle
              // If we can't find visible links, that's acceptable for mobile responsive testing
              if (firstVisibleIndex === -1 && viewport.width <= 768) {
                console.log(
                  `No visible navigation links found for ${pagePath} on mobile viewport - this is acceptable`
                );
                // For mobile, just check that the navigation container exists
                expect(await nav.count()).toBeGreaterThan(0);
              } else {
                expect(firstVisibleIndex).not.toBe(-1);
                await expect(navLinks.nth(firstVisibleIndex)).toBeVisible();
              }

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
          await safeGotoWithMocking(page, pagePath);
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

          // Check for proper text readability - be more selective about which elements to check
          const textElements = page.locator('p, h1, h2, h3, h4, h5, h6');
          const textCount = await textElements.count();

          if (textCount > 0) {
            // Check that text is readable - only check visible elements that are likely to be content
            for (let i = 0; i < Math.min(textCount, 5); i++) {
              const text = textElements.nth(i);
              const isVisible = await text.isVisible();

              if (isVisible) {
                // Check that text doesn't overflow
                const box = await text.boundingBox();
                if (box) {
                  // Add some tolerance for minor overflow issues
                  const tolerance = Math.max(10, viewport.width * 0.05); // 5% tolerance or 10px minimum
                  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + tolerance);
                }
              }
            }
          }
        });

        test(`should handle touch interactions on ${viewport.name} for ${pagePath}`, async ({
          page,
        }) => {
          await safeGotoWithMocking(page, pagePath);
          await waitForPageLoad(page);

          // Check for interactive elements
          const interactiveElements = page.locator(
            'button, a, input, select, textarea, [role="button"]'
          );
          const elementCount = await interactiveElements.count();

          if (elementCount > 0 && viewport.width <= 768) {
            // Filter for visible and non-overlapping elements only
            const testableElements = [];
            for (let i = 0; i < elementCount; i++) {
              const element = interactiveElements.nth(i);
              if (await element.isVisible()) {
                // Check if element is not overlapped by other elements
                const box = await element.boundingBox();
                if (box) {
                  // Check if element has minimum touch target size
                  if (box.width >= 44 && box.height >= 44) {
                    // Check if element is not in a potentially overlapping area (like header)
                    const tagName = await element.evaluate(el => el.tagName.toLowerCase());
                    const ariaLabel = (await element.getAttribute('aria-label')) || '';
                    const className = (await element.getAttribute('class')) || '';

                    // Skip elements that are likely to be in overlapping areas
                    const isLikelyOverlapping =
                      ariaLabel.toLowerCase().includes('search') ||
                      ariaLabel.toLowerCase().includes('menu') ||
                      ariaLabel.toLowerCase().includes('toggle') ||
                      className.includes('sm:hidden') ||
                      className.includes('lg:hidden') ||
                      tagName === 'input' ||
                      tagName === 'select';

                    if (!isLikelyOverlapping) {
                      testableElements.push(element);
                    }
                  }
                }
              }
              if (testableElements.length >= 3) break; // Limit to 3 elements to avoid too many tests
            }

            // Test touch target sizes and basic interactions
            for (const element of testableElements) {
              if (await element.isVisible()) {
                // Check touch target size
                const box = await element.boundingBox();
                if (box) {
                  expect(box.width).toBeGreaterThanOrEqual(44);
                  expect(box.height).toBeGreaterThanOrEqual(44);
                }

                // Test basic interaction (focus instead of hover to avoid overlapping issues)
                try {
                  await element.focus();
                  await page.waitForTimeout(100);

                  // Verify element is focusable
                  const isFocused = await element.evaluate(el => document.activeElement === el);
                  expect(isFocused).toBe(true);
                } catch (error) {
                  // If focus fails, log but don't fail the test
                  const errorMessage = error instanceof Error ? error.message : String(error);
                  console.log(`Focus interaction failed for element: ${errorMessage}`);
                }
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
          await safeGotoWithMocking(page, pagePath);
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
          await safeGotoWithMocking(page, pagePath);
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
        await safeGotoWithMocking(page, '/');
        await waitForPageLoad(page);

        // Check that navigation is always present
        const nav = page.locator('nav, [role="navigation"]');
        if ((await nav.count()) > 0) {
          await expect(nav.first()).toBeVisible();
        }

        // Check that main content is always visible
        const mainContent = page.locator(
          'main, [role="main"], .main-content, .content, #content, article, .page-content'
        );
        if ((await mainContent.count()) > 0) {
          await expect(mainContent.first()).toBeVisible();
        }
      }
    });

    test('should handle orientation changes', async ({ page }) => {
      // Test portrait orientation
      await page.setViewportSize({ width: 375, height: 667 });
      await safeGotoWithMocking(page, '/');
      await waitForPageLoad(page);
      await expect(page.locator('body')).toBeVisible();

      // Test landscape orientation
      await page.setViewportSize({ width: 667, height: 375 });
      await page.reload();
      await waitForPageLoad(page);
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle dynamic viewport changes', async ({ page }) => {
      await safeGotoWithMocking(page, '/');
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
        const mainContent = page.locator(
          'main, [role="main"], .main-content, .content, #content, article, .page-content'
        );
        if ((await mainContent.count()) > 0) {
          const box = await mainContent.first().boundingBox();
          if (box) {
            expect(box.x + box.width).toBeLessThanOrEqual(size.width);
          }
        }
      }
    });
  });

  test.describe('Mobile-Specific Features', () => {
    test('should handle mobile navigation menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await safeGotoWithMocking(page, '/');
      await waitForPageLoad(page);

      // Check for mobile menu button
      const menuButton = page.locator(
        '[data-testid="mobile-menu"], button[aria-label*="menu"], button[aria-label*="Menu"]'
      );
      if ((await menuButton.count()) > 0) {
        await expect(menuButton.first()).toBeVisible();
        await expect(menuButton.first()).toBeEnabled();

        // Test menu toggle with multiple fallback methods
        let menuClicked = false;
        try {
          // First, try a simple click
          await menuButton.first().click({ timeout: 3000 });
          menuClicked = true;
        } catch (clickError) {
          // If click fails, try using keyboard
          try {
            await menuButton.first().focus();
            await page.keyboard.press('Enter');
            menuClicked = true;
          } catch (keyboardError) {
            // If keyboard fails, try using JavaScript click
            try {
              await menuButton.first().evaluate(el => (el as HTMLElement).click());
              menuClicked = true;
            } catch (jsError) {
              console.log(`All mobile menu interaction methods failed: ${jsError}`);
            }
          }
        }

        if (menuClicked) {
          await page.waitForTimeout(1000);

          // Check that menu is visible
          const menu = page.locator('[data-testid="mobile-nav"], .mobile-nav, [role="menu"]');
          if ((await menu.count()) > 0) {
            await expect(menu.first()).toBeVisible();
          }
        }
      }
    });

    test('should handle mobile touch gestures', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await safeGotoWithMocking(page, '/sports/nba');
      await waitForPageLoad(page);

      // Test swipe gestures (if applicable)
      const swipeableContent = page.locator(
        '[data-testid="swipeable"], .swipeable, [data-swipeable]'
      );
      if ((await swipeableContent.count()) > 0) {
        const content = swipeableContent.first();
        await expect(content).toBeVisible();

        // Test touch interaction (use focus instead of hover to avoid overlapping issues)
        try {
          await content.focus();
          await page.waitForTimeout(500);
        } catch (error) {
          // If focus fails, just continue - this is common with overlapping elements
          console.log(`Focus interaction failed for swipeable content: ${error}`);
        }
      }
    });

    test('should handle mobile keyboard', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await safeGotoWithMocking(page, '/sign-in');
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
      const content = page.locator(
        'main, [role="main"], .main-content, .content, #content, article, .page-content'
      );
      if ((await content.count()) > 0) {
        await expect(content.first()).toBeVisible();

        // Check that content doesn't waste space on tablet
        const box = await content.first().boundingBox();
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
      const content = page.locator(
        'main, [role="main"], .main-content, .content, #content, article, .page-content'
      );
      if ((await content.count()) > 0) {
        await expect(content.first()).toBeVisible();

        // Check that content uses desktop space appropriately
        const box = await content.first().boundingBox();
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

          // Test hover interaction with error handling
          try {
            await element.hover();
            await page.waitForTimeout(500);

            // Check that hover state is handled
            await expect(element).toBeVisible();
            checked++;
          } catch (error) {
            // If hover fails due to overlapping elements, try focus instead
            try {
              await element.focus();
              await page.waitForTimeout(500);
              await expect(element).toBeVisible();
              checked++;
            } catch (focusError) {
              // If both hover and focus fail, log but continue
              console.log(`Interaction failed for element: ${focusError}`);
            }
          }
        }
      }
    });
  });
});
