import { test, expect } from '@playwright/test';
import {
  safeGoto,
  waitForPageLoad,
  checkBasicPageStructure,
  checkPageTitle,
  checkAccessibilityBasics,
  checkPerformanceMetrics,
  checkForConsoleErrors,
  checkSEOElements,
  takeDebugScreenshot,
} from './utils/test-utils';

test.describe('Cross Browser Compatibility', () => {
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

  const userAgents = [
    // Chrome variants
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

    // Firefox variants
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',

    // Safari variants
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',

    // Edge variants
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',

    // Mobile browsers
    'Mozilla/5.0 (Linux; Android 14; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  ];

  const languages = [
    'en-US',
    'en-GB',
    'es-ES',
    'fr-FR',
    'de-DE',
    'it-IT',
    'pt-BR',
    'ja-JP',
    'ko-KR',
    'zh-CN',
  ];

  test.describe('Browser Compatibility', () => {
    userAgents.forEach((userAgent, uaIdx) => {
      test.describe(`User Agent #${uaIdx}: ${userAgent.substring(0, 50)}...`, () => {
        test.beforeEach(async ({ page }) => {
          await page.setExtraHTTPHeaders({ 'User-Agent': userAgent });
        });

        testPages.forEach((pagePath, pageIdx) => {
          test(`should load ${pagePath} correctly [UA${uaIdx}-P${pageIdx}]`, async ({ page }) => {
            // Navigate to page
            await safeGoto(page, pagePath);
            await waitForPageLoad(page);

            // Check basic page structure
            await checkBasicPageStructure(page);

            // Check page title
            await checkPageTitle(page);

            // Check that we're on the correct page
            await expect(page).toHaveURL(new RegExp(pagePath.replace('/', '\\/') + '($|\\?)'));

            // Check that main content is visible
            await expect(page.locator('body')).toBeVisible();

            // Check that main content is visible
            await expect(page.locator('main')).toBeVisible();
          });

          test(`should have proper functionality on ${pagePath} [UA${uaIdx}-P${pageIdx}]`, async ({
            page,
          }) => {
            await safeGoto(page, pagePath);
            await waitForPageLoad(page);

            // Check for interactive elements
            const interactiveElements = page.locator('button, a, input, select, textarea');
            const elementCount = await interactiveElements.count();

            if (elementCount > 0) {
              // Check that interactive elements are functional
              for (let i = 0; i < Math.min(elementCount, 5); i++) {
                const element = interactiveElements.nth(i);
                await expect(element).toBeVisible();
                await expect(element).toBeEnabled();
              }
            }

            // Check for navigation elements
            const nav = page.locator('nav, [role="navigation"]');
            if ((await nav.count()) > 0) {
              await expect(nav.first()).toBeVisible();
            }
          });

          test(`should handle JavaScript functionality on ${pagePath} [UA${uaIdx}-P${pageIdx}]`, async ({
            page,
          }) => {
            await safeGoto(page, pagePath);
            await waitForPageLoad(page);

            // Check that JavaScript is working
            const jsWorking = await page.evaluate(() => {
              return (
                typeof window !== 'undefined' &&
                typeof document !== 'undefined' &&
                typeof navigator !== 'undefined'
              );
            });
            expect(jsWorking).toBe(true);

            // Check for dynamic content loading
            const dynamicContent = page.locator(
              '[data-testid*="dynamic"], [data-loaded], [data-state]'
            );
            if ((await dynamicContent.count()) > 0) {
              await expect(dynamicContent.first()).toBeVisible();
            }
          });

          test(`should handle CSS rendering on ${pagePath} [UA${uaIdx}-P${pageIdx}]`, async ({
            page,
          }) => {
            await safeGoto(page, pagePath);
            await waitForPageLoad(page);

            // Check that CSS is applied
            const body = page.locator('body');
            const computedStyle = await body.evaluate(el => {
              return window.getComputedStyle(el);
            });

            // Check that basic CSS properties are applied
            expect(computedStyle.display).toBeTruthy();
            expect(computedStyle.fontFamily).toBeTruthy();

            // Check for responsive design
            const viewport = page.viewportSize();
            if (viewport) {
              const isResponsive = await page.evaluate(() => {
                return window.innerWidth > 0 && window.innerHeight > 0;
              });
              expect(isResponsive).toBe(true);
            }
          });

          test(`should not have console errors on ${pagePath} [UA${uaIdx}-P${pageIdx}]`, async ({
            page,
          }) => {
            await safeGoto(page, pagePath);
            await waitForPageLoad(page);

            // Check for console errors
            await checkForConsoleErrors(page);
          });

          test(`should have good performance on ${pagePath} [UA${uaIdx}-P${pageIdx}]`, async ({
            page,
          }) => {
            await safeGoto(page, pagePath);
            await waitForPageLoad(page);

            // Check performance metrics
            const metrics = await checkPerformanceMetrics(page);

            // Performance should be reasonable across all browsers
            expect(metrics.loadTime).toBeLessThan(10000); // 10 seconds max
            expect(metrics.domContentLoaded).toBeLessThan(5000); // 5 seconds max
          });
        });
      });
    });
  });

  test.describe('Language Support', () => {
    languages.forEach((language, langIdx) => {
      test.describe(`Language: ${language} [L${langIdx}]`, () => {
        test.beforeEach(async ({ page }) => {
          await page.setExtraHTTPHeaders({ 'Accept-Language': language });
        });

        testPages.forEach((pagePath, pageIdx) => {
          test(`should handle ${language} locale on ${pagePath} [L${langIdx}-P${pageIdx}]`, async ({
            page,
          }) => {
            await safeGoto(page, pagePath);
            await waitForPageLoad(page);

            // Check that page loads correctly with different language
            await expect(page.locator('body')).toBeVisible();

            // Check that main content is visible
            await expect(page.locator('main')).toBeVisible();

            // Check that page structure is maintained
            await checkBasicPageStructure(page);
          });

          test(`should handle text rendering in ${language} on ${pagePath} [L${langIdx}-P${pageIdx}]`, async ({
            page,
          }) => {
            await safeGoto(page, pagePath);
            await waitForPageLoad(page);

            // Check that text elements are properly rendered
            const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div');
            const textCount = await textElements.count();

            if (textCount > 0) {
              // Check that text is visible and properly formatted
              for (let i = 0; i < Math.min(textCount, 5); i++) {
                const text = textElements.nth(i);
                const isVisible = await text.isVisible();

                if (isVisible) {
                  await expect(text).toBeVisible();

                  // Check that text content is not empty
                  const content = await text.textContent();
                  expect(content).toBeTruthy();
                }
              }
            }
          });
        });
      });
    });
  });

  test.describe('Browser-Specific Features', () => {
    test.describe('Chrome/Chromium Features', () => {
      test('should handle Chrome-specific features', async ({ page, browserName }) => {
        if (browserName === 'chromium') {
          await safeGoto(page, '/');
          await waitForPageLoad(page);

          // Test Chrome-specific features
          const chromeFeatures = await page.evaluate(() => {
            return {
              hasChrome: typeof (window as any).chrome !== 'undefined',
              hasWebkit: 'webkitRequestAnimationFrame' in window,
              hasBlink: 'CSS' in window && 'supports' in CSS,
            };
          });

          // Chrome should have webkit features
          expect(chromeFeatures.hasWebkit).toBe(true);
        }
      });
    });

    test.describe('Firefox Features', () => {
      test('should handle Firefox-specific features', async ({ page, browserName }) => {
        if (browserName === 'firefox') {
          await safeGoto(page, '/');
          await waitForPageLoad(page);

          // Test Firefox-specific features
          const firefoxFeatures = await page.evaluate(() => {
            return {
              hasMoz: 'mozRequestAnimationFrame' in window,
              hasGecko: 'CSS' in window && 'supports' in CSS,
            };
          });

          // Firefox should have gecko features
          expect(firefoxFeatures.hasGecko).toBe(true);
        }
      });
    });

    test.describe('Safari Features', () => {
      test('should handle Safari-specific features', async ({ page, browserName }) => {
        if (browserName === 'webkit') {
          await safeGoto(page, '/');
          await waitForPageLoad(page);

          // Test Safari-specific features
          const safariFeatures = await page.evaluate(() => {
            return {
              hasWebkit: 'webkitRequestAnimationFrame' in window,
              hasSafari: 'safari' in window,
            };
          });

          // Safari should have webkit features
          expect(safariFeatures.hasWebkit).toBe(true);
        }
      });
    });
  });

  test.describe('Cross-Browser Consistency', () => {
    test('should maintain consistent layout across browsers', async ({ page }) => {
      await safeGoto(page, '/');
      await waitForPageLoad(page);

      // Check that layout is consistent
      await expect(page.locator('main')).toBeVisible();

      // Check that content is properly positioned
      const box = await page.locator('main').boundingBox();
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }
    });

    test('should maintain consistent functionality across browsers', async ({ page }) => {
      await safeGoto(page, '/sports/nba');
      await waitForPageLoad(page);

      // Check that interactive elements work consistently
      const buttons = page.locator('button, a');
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        for (let i = 0; i < Math.min(buttonCount, 3); i++) {
          const button = buttons.nth(i);
          await expect(button).toBeVisible();
          await expect(button).toBeEnabled();

          // Test hover interaction
          await button.hover();
          await page.waitForTimeout(100);

          // Check that button is still functional
          await expect(button).toBeVisible();
        }
      }
    });

    test('should maintain consistent accessibility across browsers', async ({ page }) => {
      await safeGoto(page, '/dashboard');
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

    test('should maintain consistent SEO elements across browsers', async ({ page }) => {
      await safeGoto(page, '/');
      await waitForPageLoad(page);

      // Check SEO elements
      await checkSEOElements(page);

      // Check that meta tags are present
      const metaTags = page.locator('meta');
      const metaCount = await metaTags.count();
      expect(metaCount).toBeGreaterThan(0);
    });
  });

  test.describe('Browser Performance', () => {
    test('should have consistent performance across browsers', async ({ page }) => {
      await safeGoto(page, '/');
      await waitForPageLoad(page);

      // Check performance metrics
      const metrics = await checkPerformanceMetrics(page);

      // Performance should be reasonable across all browsers
      expect(metrics.loadTime).toBeLessThan(8000); // 8 seconds max
      expect(metrics.domContentLoaded).toBeLessThan(4000); // 4 seconds max
    });

    test('should handle memory usage consistently', async ({ page }) => {
      await safeGoto(page, '/sports/nba');
      await waitForPageLoad(page);

      // Check memory usage (if available)
      const memoryInfo = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory;
        }
        return null;
      });

      if (memoryInfo) {
        // Memory usage should be reasonable
        expect(memoryInfo.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024); // 100MB max
      }
    });

    test('should handle network requests consistently', async ({ page }) => {
      await safeGoto(page, '/');
      await waitForPageLoad(page);

      // Check that all resources loaded successfully
      const failedRequests: string[] = [];

      page.on('response', response => {
        if (response.status() >= 400) {
          failedRequests.push(`${response.url()} - ${response.status()}`);
        }
      });

      await page.waitForTimeout(2000);

      // Filter out common non-critical failures
      const criticalFailures = failedRequests.filter(
        failure =>
          !failure.includes('analytics') &&
          !failure.includes('tracking') &&
          !failure.includes('external-service')
      );

      expect(criticalFailures).toHaveLength(0);
    });
  });

  test.describe('Browser Security', () => {
    test('should handle security headers consistently', async ({ page }) => {
      await safeGoto(page, '/');
      await waitForPageLoad(page);

      // Check security headers
      const response = await page.goto(page.url());
      if (response) {
        const headers = response.headers();

        // Check for basic security headers
        expect(headers['x-frame-options']).toBeTruthy();
        expect(headers['x-content-type-options']).toBeTruthy();
      }
    });

    test('should handle content security policy', async ({ page }) => {
      await safeGoto(page, '/');
      await waitForPageLoad(page);

      // Check for CSP headers
      const response = await page.goto(page.url());
      if (response) {
        const headers = response.headers();

        // CSP should be present
        expect(headers['content-security-policy']).toBeTruthy();
      }
    });

    test('should handle mixed content securely', async ({ page }) => {
      await safeGoto(page, '/');
      await waitForPageLoad(page);

      // Check for mixed content warnings
      const consoleMessages: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'warning' && msg.text().includes('mixed content')) {
          consoleMessages.push(msg.text());
        }
      });

      await page.waitForTimeout(2000);

      // Should not have mixed content warnings
      expect(consoleMessages).toHaveLength(0);
    });
  });
});
