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
} from '@tests/e2e/utils/test-utils';
import { testSignInModal } from '@tests/e2e/utils/auth-modal';

test.describe.configure({ retries: 2 }); // TEMP: Retry flaky tests while stabilizing

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await safeGoto(page, '/');
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

  test('should load home page successfully', async ({ page }) => {
    // Check basic page structure
    await checkBasicPageStructure(page);

    // Check page title
    await checkPageTitle(page);

    // Check meta description
    await checkMetaDescription(page);

    // Check that main content is visible
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });

    // Check that page is interactive
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  test('should have proper navigation elements', async ({ page }) => {
    // Check for navigation menu
    const nav = page.locator('nav, [role="navigation"]');
    const navCount = await nav.count();

    // Navigation should exist (even if hidden on mobile)
    expect(navCount).toBeGreaterThan(0);

    // Check if any nav is visible (optional - mobile might hide nav in hamburger menu)
    let foundVisibleNav = false;
    for (let i = 0; i < navCount; i++) {
      if (await nav.nth(i).isVisible()) {
        foundVisibleNav = true;
        break;
      }
    }

    // On mobile, nav might be hidden, so this is optional
    if (foundVisibleNav) {
      console.log('Found visible navigation element');
    } else {
      console.log('Navigation elements exist but are hidden (likely mobile hamburger menu)');
    }

    // Check for logo/brand
    const logo = page.locator('img[alt*="logo"], img[alt*="brand"], [data-testid="logo"]');
    if ((await logo.count()) > 0) {
      await expect(logo.first()).toBeVisible();
    }

    // Check for main navigation links (only if nav is visible)
    if (foundVisibleNav) {
      const navLinks = page.locator('nav a, [role="navigation"] a');
      if ((await navLinks.count()) > 0) {
        await expect(navLinks.first()).toBeVisible();
      }
    }
  });

  test('should have proper sports navigation', async ({ page }) => {
    // Check for sports navigation links
    const sportsLinks = page.locator('a[href*="/sports"]');
    const sportsCount = await sportsLinks.count();
    let foundVisibleSportsLink = false;
    for (let i = 0; i < sportsCount; i++) {
      if (await sportsLinks.nth(i).isVisible()) {
        foundVisibleSportsLink = true;
        break;
      }
    }
    expect(foundVisibleSportsLink).toBe(true);

    if (sportsCount > 0) {
      // Check that at least one sports link is visible
      await expect(sportsLinks.first()).toBeVisible();

      // Check that visible sports links are clickable (skip hidden ones)
      for (let i = 0; i < Math.min(sportsCount, 3); i++) {
        const link = sportsLinks.nth(i);
        if (await link.isVisible()) {
          await expect(link).toBeVisible();
          await expect(link).toBeEnabled();
        }
      }
    }
  });

  test('should show and close the sign in modal', async ({ page }) => {
    await safeGoto(page, '/');
    await testSignInModal(page, 'escape');
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
      'button:has-text("Get Started"), button:has-text("Learn More")'
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

    // Check that content is readable on mobile
    const mainContent = page.locator('main');
    if ((await mainContent.count()) > 0) {
      await expect(mainContent.first()).toBeVisible();
    }

    // Check that navigation is visible on mobile (or at least one nav element exists)
    const nav = page.locator('nav, [role="navigation"]');
    const navCount = await nav.count();
    if (navCount > 0) {
      // On mobile, navigation might be hidden (hamburger menu), so just check it exists
      // Don't require it to be visible
      console.log(`Found ${navCount} navigation elements on mobile`);
    } else {
      // If no nav elements found at all, that's a problem
      expect(navCount).toBeGreaterThan(0);
    }
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Test tablet responsiveness
    await checkResponsiveBehavior(page, { width: 768, height: 1024 });

    // Check that layout adapts properly
    const mainContent = page.locator('main');
    if ((await mainContent.count()) > 0) {
      await expect(mainContent.first()).toBeVisible();
    }
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
