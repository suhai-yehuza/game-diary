import { Page, expect } from '@playwright/test';
import { waitForPageLoad } from './test-utils';

/**
 * Navigation utilities for E2E tests
 * Handles common navigation patterns including mobile menu interactions
 */

export interface NavigationOptions {
  waitForLoad?: boolean;
  timeout?: number;
  checkMainContent?: boolean;
}

/**
 * Navigate to a specific section, handling mobile menu if needed
 */
export async function navigateToSection(
  page: Page,
  href: string,
  options: NavigationOptions = {}
): Promise<void> {
  const { waitForLoad = true, timeout = 10000, checkMainContent = true } = options;

  const isMobile = await page.evaluate(() => window.innerWidth < 1024);

  if (isMobile) {
    // Open mobile menu first
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await expect(menuButton).toBeVisible({ timeout });
    await menuButton.click();
    await page.waitForTimeout(500); // Wait for menu animation
  }

  // Find and click the navigation link
  let link;
  if (href === '/') {
    // Home link is the logo
    link = page.locator('header a[href="/"]').first();
  } else {
    link = page.locator(`nav a[href="${href}"]`).first();
  }
  await expect(link).toBeVisible({ timeout });
  await link.click();

  if (waitForLoad) {
    await waitForPageLoad(page);
  }

  if (checkMainContent) {
    await expect(page.locator('main')).toBeVisible({ timeout });
  }
}

/**
 * Navigate back to home page
 */
export async function navigateToHome(page: Page, options: NavigationOptions = {}): Promise<void> {
  await navigateToSection(page, '/', options);
}

/**
 * Navigate to sports section
 */
export async function navigateToSports(page: Page, options: NavigationOptions = {}): Promise<void> {
  await navigateToSection(page, '/sports/nba', options);
}

/**
 * Navigate to dashboard
 */
export async function navigateToDashboard(
  page: Page,
  options: NavigationOptions = {}
): Promise<void> {
  await navigateToSection(page, '/dashboard', options);
}

/**
 * Navigate to user profile
 */
export async function navigateToProfile(
  page: Page,
  options: NavigationOptions = {}
): Promise<void> {
  await navigateToSection(page, '/protected/user', options);
}

/**
 * Check if mobile menu is open and close it if needed
 */
export async function ensureMobileMenuClosed(page: Page): Promise<void> {
  const isMobile = await page.evaluate(() => window.innerWidth < 1024);

  if (isMobile) {
    // Check if menu is open by looking for the close button or menu content
    const menuContent = page.locator('nav').filter({ hasText: /NBA|NFL|MLB|NHL|MLS/ });
    if (await menuContent.isVisible()) {
      // Close menu by clicking outside or escape key
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  }
}

/**
 * Open mobile menu if on mobile device
 */
export async function openMobileMenu(page: Page): Promise<void> {
  const isMobile = await page.evaluate(() => window.innerWidth < 1024);

  if (isMobile) {
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await page.waitForTimeout(500);
  }
}

/**
 * Get current viewport size
 */
export async function getViewportSize(page: Page): Promise<{ width: number; height: number }> {
  return await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
}

/**
 * Check if current viewport is mobile
 */
export async function isMobileViewport(page: Page): Promise<boolean> {
  const size = await getViewportSize(page);
  return size.width < 1024;
}
