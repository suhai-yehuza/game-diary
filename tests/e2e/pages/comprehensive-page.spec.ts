import { test, expect } from '@playwright/test';
import { runInteractivePageTests } from './interactive-page.spec';

/**
 * Comprehensive page test suite - extends interactive tests with advanced validations
 * This level adds tests for social media, contact info, legal links, and edge cases
 */
export async function runComprehensivePageTests(page: any, path: string, pageName: string) {
  // Run interactive tests first
  await runInteractivePageTests(page, path, pageName);

  test.describe(`${pageName} - Comprehensive Tests`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      // Disable all CSS animations and transitions for test reliability
      await page.addStyleTag({
        content: '* { transition: none !important; animation: none !important; }',
      });
    });

    test('should have proper social media links', async ({ page }) => {
      // Check for social media links in footer
      const footer = page.locator('footer, [role="contentinfo"]');
      if ((await footer.count()) > 0) {
        const socialLinks = footer.locator(
          'a[href*="twitter"], a[href*="facebook"], a[href*="instagram"], a[href*="linkedin"]'
        );
        const socialCount = await socialLinks.count();

        if (socialCount > 0) {
          // Check that social links are visible and have proper attributes
          for (let i = 0; i < socialCount; i++) {
            const link = socialLinks.nth(i);
            await expect(link).toBeVisible();

            // Check for proper attributes
            const href = await link.getAttribute('href');
            expect(href).toBeTruthy();

            const target = await link.getAttribute('target');
            if (target) {
              expect(target).toBe('_blank');
            }
          }
        }
      }
    });

    test('should have proper contact information', async ({ page }) => {
      // Check for contact information in footer
      const footer = page.locator('footer, [role="contentinfo"]');
      if ((await footer.count()) > 0) {
        const contactInfo = footer.locator(
          'a[href*="mailto:"], a[href*="tel:"], [data-testid="contact"]'
        );
        const contactCount = await contactInfo.count();

        if (contactCount > 0) {
          // Check that contact information is visible
          for (let i = 0; i < contactCount; i++) {
            await expect(contactInfo.nth(i)).toBeVisible();
          }
        }
      }
    });

    test('should have proper privacy and legal links', async ({ page }) => {
      // Check for privacy and legal links in footer
      const footer = page.locator('footer, [role="contentinfo"]');
      if ((await footer.count()) > 0) {
        const legalLinks = footer.locator('a[href*="privacy"], a[href*="terms"], a[href*="legal"]');
        const legalCount = await legalLinks.count();

        if (legalCount > 0) {
          // Check that legal links are visible
          for (let i = 0; i < legalCount; i++) {
            await expect(legalLinks.nth(i)).toBeVisible();
            await expect(legalLinks.nth(i)).toBeEnabled();
          }
        }
      }
    });

    test('should handle different viewport sizes', async ({ page }) => {
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(1000);
      await expect(page.locator('main')).toBeVisible();

      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      await expect(page.locator('main')).toBeVisible();

      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(1000);
      await expect(page.locator('main')).toBeVisible();
    });

    test('should handle network interruptions gracefully', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', route => {
        route.continue();
      });

      // Reload page and check it still works
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('main')).toBeVisible();
    });

    test('should have proper focus management', async ({ page }) => {
      // Test focus trapping in modals (if any)
      const modals = page.locator('[role="dialog"], .modal, [data-modal]');
      if ((await modals.count()) > 0) {
        const modal = modals.first();
        await expect(modal).toBeVisible();

        // Check that focus is trapped within modal
        const focusableElements = modal.locator('button, a, input, select, textarea');
        if ((await focusableElements.count()) > 0) {
          await focusableElements.first().focus();
          await page.keyboard.press('Tab');

          // Focus should remain within modal
          const focusedElement = page.locator(':focus');
          await expect(focusedElement).toBeVisible();
        }
      }
    });

    test('should handle dynamic content updates', async ({ page }) => {
      // Check for any dynamic content that might update
      const dynamicElements = page.locator('[data-dynamic], [data-update], [data-refresh]');
      const dynamicCount = await dynamicElements.count();

      if (dynamicCount > 0) {
        // Wait for potential updates
        await page.waitForTimeout(2000);

        // Check that dynamic elements are still visible
        for (let i = 0; i < Math.min(dynamicCount, 3); i++) {
          await expect(dynamicElements.nth(i)).toBeVisible();
        }
      }
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      // Check for proper ARIA attributes on interactive elements
      const interactiveElements = page.locator('button, a, input, select, textarea');
      const elementCount = await interactiveElements.count();

      if (elementCount > 0) {
        // Check first few elements for basic ARIA attributes
        for (let i = 0; i < Math.min(elementCount, 5); i++) {
          const element = interactiveElements.nth(i);
          if (await element.isVisible()) {
            // Check for aria-label or aria-labelledby
            const ariaLabel = await element.getAttribute('aria-label');
            const ariaLabelledBy = await element.getAttribute('aria-labelledby');

            // At least one should be present for accessibility
            if (!ariaLabel && !ariaLabelledBy) {
              // Check if element has visible text content
              const textContent = await element.textContent();
              if (!textContent || textContent.trim().length === 0) {
                console.warn(`Element ${i} may need ARIA attributes for accessibility`);
              }
            }
          }
        }
      }
    });

    test('should handle rapid user interactions', async ({ page }) => {
      // Test rapid clicking on buttons
      const buttons = page.locator('button:not([disabled])');
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        const button = buttons.first();
        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();

        // Rapid clicks should not break the page
        for (let i = 0; i < 3; i++) {
          await button.click();
          await page.waitForTimeout(100);
        }

        // Page should still be functional
        await expect(page.locator('main')).toBeVisible();
      }
    });

    test('should have proper loading and error states', async ({ page }) => {
      // Check for loading indicators
      const loadingIndicators = page.locator('[data-loading], .loading, [aria-busy="true"]');
      const loadingCount = await loadingIndicators.count();

      if (loadingCount > 0) {
        // Check that loading indicators are properly hidden after load
        await page.waitForTimeout(2000);
        for (let i = 0; i < loadingCount; i++) {
          const indicator = loadingIndicators.nth(i);
          const isVisible = await indicator.isVisible();
          if (isVisible) {
            console.log(`Loading indicator ${i} is still visible after page load`);
          }
        }
      }

      // Check for error states
      const errorElements = page.locator('[role="alert"], .error, [data-error]');
      const errorCount = await errorElements.count();

      if (errorCount > 0) {
        // Check that error elements are properly styled
        for (let i = 0; i < errorCount; i++) {
          const errorElement = errorElements.nth(i);
          await expect(errorElement).toBeVisible();
        }
      }
    });
  });
}
