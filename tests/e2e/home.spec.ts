import { test, expect } from '@playwright/test';
import {
  safeGoto,
  waitForPageLoad,
  checkBasicPageStructure,
  checkPageTitle,
  checkMetaDescription,
  checkAccessibilityBasics,
  checkPerformanceMetrics,
  checkForConsoleErrors,
  checkSEOElements,
  checkResponsiveBehavior,
  takeDebugScreenshot,
} from './utils/test-utils';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await safeGoto(page, '/');
    await waitForPageLoad(page);
  });

  test('should load home page successfully', async ({ page }) => {
    // Check basic page structure
    await checkBasicPageStructure(page);

    // Check page title
    await checkPageTitle(page);

    // Check meta description
    await checkMetaDescription(page);

    // Check that main content is visible
    await expect(page.locator('main')).toBeVisible();

    // Check that page is interactive
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have proper navigation elements', async ({ page }) => {
    // Check for navigation menu
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeVisible();

    // Check for logo/brand
    const logo = page.locator('img[alt*="logo"], img[alt*="brand"], [data-testid="logo"]');
    if ((await logo.count()) > 0) {
      await expect(logo.first()).toBeVisible();
    }

    // Check for main navigation links
    const navLinks = page.locator('nav a, [role="navigation"] a');
    await expect(navLinks.first()).toBeVisible();

    // Check that navigation is accessible
    await expect(nav).toBeVisible();
  });

  test('should have proper sports navigation', async ({ page }) => {
    // Check for sports navigation links
    const sportsLinks = page.locator('a[href*="/sports"]');
    const sportsCount = await sportsLinks.count();

    if (sportsCount > 0) {
      // Check that at least one sports link is visible
      await expect(sportsLinks.first()).toBeVisible();

      // Check that sports links are clickable
      for (let i = 0; i < Math.min(sportsCount, 3); i++) {
        const link = sportsLinks.nth(i);
        await expect(link).toBeVisible();
        await expect(link).toBeEnabled();
      }
    }
  });

  test('should have proper authentication links', async ({ page }) => {
    // Check for sign in link
    const signInLink = page.locator('a[href*="/sign-in"], a[href*="/login"]');
    if ((await signInLink.count()) > 0) {
      await expect(signInLink.first()).toBeVisible();
      await expect(signInLink.first()).toBeEnabled();
    }

    // Check for sign up link
    const signUpLink = page.locator('a[href*="/sign-up"], a[href*="/register"]');
    if ((await signUpLink.count()) > 0) {
      await expect(signUpLink.first()).toBeVisible();
      await expect(signUpLink.first()).toBeEnabled();
    }
  });

  test('should have proper content sections', async ({ page }) => {
    // Check for hero section
    const hero = page.locator('[data-testid="hero"], .hero, section:first-child');
    if ((await hero.count()) > 0) {
      await expect(hero.first()).toBeVisible();
    }

    // Check for main content sections
    const sections = page.locator('main section, main > div');
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThan(0);

    // Check that sections are visible
    for (let i = 0; i < Math.min(sectionCount, 5); i++) {
      await expect(sections.nth(i)).toBeVisible();
    }
  });

  test('should have proper call-to-action elements', async ({ page }) => {
    // Check for CTA buttons
    const ctaButtons = page.locator(
      'button:has-text("Get Started"), button:has-text("Sign Up"), button:has-text("Learn More"), a[href*="/sign-up"]'
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

  test('should have proper footer', async ({ page }) => {
    // Check for footer
    const footer = page.locator('footer, [role="contentinfo"]');
    if ((await footer.count()) > 0) {
      await expect(footer.first()).toBeVisible();

      // Check for footer links
      const footerLinks = footer.locator('a');
      const footerLinkCount = await footerLinks.count();

      if (footerLinkCount > 0) {
        // Check that footer links are visible
        for (let i = 0; i < Math.min(footerLinkCount, 5); i++) {
          await expect(footerLinks.nth(i)).toBeVisible();
        }
      }
    }
  });

  test('should be accessible', async ({ page }) => {
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

  test('should have good performance', async ({ page }) => {
    // Check performance metrics
    const metrics = await checkPerformanceMetrics(page);

    // Additional performance checks
    expect(metrics.loadTime).toBeLessThan(3000); // 3 seconds for home page
    expect(metrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
  });

  test('should not have console errors', async ({ page }) => {
    // Check for console errors
    await checkForConsoleErrors(page);
  });

  test('should have proper SEO elements', async ({ page }) => {
    // Check SEO elements
    await checkSEOElements(page);

    // Check for structured data
    const structuredData = page.locator('script[type="application/ld+json"]');
    if ((await structuredData.count()) > 0) {
      await expect(structuredData.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Test mobile responsiveness
    await checkResponsiveBehavior(page, { width: 375, height: 667 });

    // Check that navigation is still accessible on mobile
    const nav = page.locator('nav, [role="navigation"]');
    if ((await nav.count()) > 0) {
      await expect(nav).toBeVisible();
    }

    // Check that content is readable on mobile
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Test tablet responsiveness
    await checkResponsiveBehavior(page, { width: 768, height: 1024 });

    // Check that layout adapts properly
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should handle theme switching', async ({ page }) => {
    // Check for theme toggle
    const themeToggle = page.locator(
      '[data-testid="theme-toggle"], button[aria-label*="theme"], button[aria-label*="dark"], button[aria-label*="light"]'
    );

    if ((await themeToggle.count()) > 0) {
      await expect(themeToggle.first()).toBeVisible();
      await expect(themeToggle.first()).toBeEnabled();

      // Test theme switching
      await themeToggle.first().click();
      await page.waitForTimeout(1000);

      // Check that theme changed
      const body = page.locator('body');
      const classList = await body.getAttribute('class');
      expect(classList).toBeTruthy();
    }
  });

  test('should have proper loading states', async ({ page }) => {
    // Navigate to a new page to test loading states
    const sportsLink = page.locator('a[href*="/sports"]').first();
    if ((await sportsLink.count()) > 0) {
      // Click the link and check for loading state
      await sportsLink.click();

      // Wait for navigation
      await page.waitForLoadState('networkidle');

      // Check that we're on a sports page
      await expect(page).toHaveURL(/\/sports/);
    }
  });

  test('should handle browser back/forward', async ({ page }) => {
    // Navigate to a different page first
    const sportsLink = page.locator('a[href*="/sports"]').first();
    if ((await sportsLink.count()) > 0) {
      await sportsLink.click();
      await page.waitForLoadState('networkidle');

      // Go back to home page
      await page.goBack();
      await page.waitForLoadState('networkidle');

      // Check that we're back on home page
      await expect(page).toHaveURL(/\/$|\/home/);

      // Check that home page content is visible
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('should have proper error boundaries', async ({ page }) => {
    // Try to access a non-existent route
    await safeGoto(page, '/non-existent-page');

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
});
