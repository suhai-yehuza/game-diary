import { test, expect } from '@playwright/test';
import { testSignInModal } from '@tests/e2e/utils/auth-modal';
import { runContentPageTests } from './content-page.spec';

/**
 * Interactive page test suite - extends content tests with interactive element validations
 * This level adds tests for user interactions, forms, and dynamic content
 */
export async function runInteractivePageTests(page: any, path: string, pageName: string) {
  // Run content tests first
  await runContentPageTests(page, path, pageName);

  test.describe(`${pageName} - Interactive Tests`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      // Disable all CSS animations and transitions for test reliability
      await page.addStyleTag({
        content: '* { transition: none !important; animation: none !important; }',
      });
    });

    test('should have proper call-to-action elements', async ({ page }) => {
      // Check for CTA buttons
      const ctaButtons = page.locator(
        'button:has-text("Get Started"), button:has-text("Learn More"), button:has-text("Sign Up"), button:has-text("Sign In")'
      );
      const ctaCount = await ctaButtons.count();

      if (ctaCount > 0) {
        // Check that CTA buttons are visible and enabled
        for (let i = 0; i < Math.min(ctaCount, 3); i++) {
          const cta = ctaButtons.nth(i);
          await expect(cta).toBeVisible();
          await expect(cta).toBeEnabled();
        }
      }
    });

    test('should show and close the sign in modal', async ({ page }) => {
      await page.goto(path);
      await testSignInModal(page, 'escape');
    });

    test('should have proper form interactions', async ({ page }) => {
      // Check for forms
      const forms = page.locator('form');
      const formCount = await forms.count();

      if (formCount > 0) {
        // Check that forms are visible
        for (let i = 0; i < Math.min(formCount, 2); i++) {
          const form = forms.nth(i);
          await expect(form).toBeVisible();

          // Check for form inputs
          const inputs = form.locator('input, textarea, select');
          const inputCount = await inputs.count();

          if (inputCount > 0) {
            // Check that inputs are interactive
            for (let j = 0; j < Math.min(inputCount, 3); j++) {
              const input = inputs.nth(j);
              await expect(input).toBeVisible();
              await expect(input).toBeEnabled();
            }
          }
        }
      }
    });

    test('should have proper button interactions', async ({ page }) => {
      // Check for interactive buttons
      const buttons = page.locator('button:not([disabled])');
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        // Check that buttons are visible and enabled
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const button = buttons.nth(i);
          await expect(button).toBeVisible();
          await expect(button).toBeEnabled();
        }
      }
    });

    test('should have proper link interactions', async ({ page }) => {
      // Check for internal links
      const internalLinks = page.locator('a[href^="/"]');
      const linkCount = await internalLinks.count();

      if (linkCount > 0) {
        // Check that links are visible and enabled
        for (let i = 0; i < Math.min(linkCount, 5); i++) {
          const link = internalLinks.nth(i);
          await expect(link).toBeVisible();
          await expect(link).toBeEnabled();
        }
      }
    });

    test('should handle keyboard navigation', async ({ page }) => {
      // Test tab navigation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);

      // Check that focus is visible
      const focusedElement = page.locator(':focus');
      if ((await focusedElement.count()) > 0) {
        await expect(focusedElement).toBeVisible();
      }

      // Test enter key on focused element
      if ((await focusedElement.count()) > 0) {
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
        if (tagName === 'button' || tagName === 'a') {
          await page.keyboard.press('Enter');
          await page.waitForTimeout(1000);
        }
      }
    });

    test('should handle mouse interactions', async ({ page }) => {
      // Test hover effects on interactive elements
      const interactiveElements = page.locator('button, a, input, select');
      const elementCount = await interactiveElements.count();

      if (elementCount > 0) {
        // Test hover on first few elements
        for (let i = 0; i < Math.min(elementCount, 3); i++) {
          const element = interactiveElements.nth(i);
          if (await element.isVisible()) {
            await element.hover();
            await page.waitForTimeout(200);
          }
        }
      }
    });

    test('should have proper error handling', async ({ page }) => {
      // Try to access a non-existent route
      await page.goto('/non-existent-page');

      // Check that error page is displayed
      const errorContent = page.locator('h1, h2, [role="alert"]');
      if ((await errorContent.count()) > 0) {
        await expect(errorContent.first()).toBeVisible();
      }

      // Check that there's a way to go back
      const backLink = page.locator('a[href="/"], a[href="/home"], button:has-text("Home")');
      if ((await backLink.count()) > 0) {
        await expect(backLink.first()).toBeVisible();
        await expect(backLink.first()).toBeEnabled();
      }
    });
  });
}
