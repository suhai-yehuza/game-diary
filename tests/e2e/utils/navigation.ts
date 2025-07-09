import { Page, expect } from '@playwright/test';
import { waitForPageLoad, waitForNetworkIdle as waitForNetworkIdleUtil } from './test-utils';

/**
 * Navigation utilities for E2E tests
 * Handles common navigation patterns including mobile menu interactions
 */

export interface NavigationOptions {
  waitForLoad?: boolean;
  timeout?: number;
  checkMainContent?: boolean;
  waitForNetworkIdle?: boolean;
}

export interface LoadStateOptions {
  state?: 'domcontentloaded' | 'load' | 'networkidle';
  timeout?: number;
}

/**
 * Wait for a specific load state with consistent timeout handling
 */
export async function waitForLoadState(page: Page, options: LoadStateOptions = {}): Promise<void> {
  const { state = 'networkidle', timeout = 10000 } = options;
  await page.waitForLoadState(state, { timeout });
}

/**
 * Wait for network idle with consistent timeout
 */
export async function waitForNetworkIdle(page: Page, timeout: number = 10000): Promise<void> {
  await waitForLoadState(page, { state: 'networkidle', timeout });
}

/**
 * Wait for DOM content loaded with consistent timeout
 */
export async function waitForDOMContentLoaded(page: Page, timeout: number = 10000): Promise<void> {
  await waitForLoadState(page, { state: 'domcontentloaded', timeout });
}

/**
 * Navigate to a page with consistent load state handling
 */
export async function navigateToPage(
  page: Page,
  url: string,
  options: NavigationOptions = {}
): Promise<void> {
  const {
    waitForLoad = true,
    timeout = 10000,
    checkMainContent = true,
    waitForNetworkIdle = true,
  } = options;

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  if (waitForNetworkIdle) {
    await waitForNetworkIdleUtil(page, timeout);
  } else if (waitForLoad) {
    await waitForDOMContentLoaded(page, timeout);
  }

  if (checkMainContent) {
    await expect(page.locator('main')).toBeVisible({ timeout });
  }
}

/**
 * Navigate to a specific section, handling mobile menu if needed
 */
export async function navigateToSection(
  page: Page,
  href: string,
  options: NavigationOptions = {}
): Promise<void> {
  const {
    waitForLoad = true,
    timeout = 10000,
    checkMainContent = true,
    waitForNetworkIdle = true,
  } = options;

  const isMobile = await page.evaluate(() => window.innerWidth < 1024);

  if (isMobile) {
    // Open mobile menu first with improved click handling
    await openMobileMenu(page, timeout);
  }

  // Find and click the navigation link
  let link;
  if (href === '/') {
    // Home link is the logo
    link = page.locator('header a[href="/"]').first();
  } else {
    link = page.locator(`nav a[href="${href}"]`).first();
  }

  // Wait for the link to be visible
  await expect(link).toBeVisible({ timeout });

  // Try clicking the link
  try {
    await link.click();
  } catch (error) {
    console.log('Direct link click failed, trying alternative strategies...');

    // Strategy 1: Try force click
    try {
      await link.click({ force: true });
    } catch (forceError) {
      console.log('Force click failed, trying position-based click...');

      // Strategy 2: Try clicking at the center of the link
      try {
        const box = await link.boundingBox();
        if (box) {
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        } else {
          throw new Error('Could not get bounding box for link');
        }
      } catch (positionError) {
        console.log('Position-based click failed, trying keyboard navigation...');

        // Strategy 3: Try keyboard navigation
        try {
          await link.focus();
          await page.keyboard.press('Enter');
        } catch (keyboardError) {
          console.log('Keyboard navigation failed, trying direct navigation...');

          // Strategy 4: Try direct navigation
          await navigateToPage(page, href, options);
          return;
        }
      }
    }
  }

  if (waitForNetworkIdle) {
    await waitForNetworkIdleUtil(page, timeout);
  } else if (waitForLoad) {
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
 * Open mobile menu if on mobile device with improved click handling
 */
export async function openMobileMenu(page: Page, timeout: number = 10000): Promise<void> {
  const isMobile = await page.evaluate(() => window.innerWidth < 1024);

  if (isMobile) {
    // Wait for the page to be fully loaded and stable
    await waitForNetworkIdleUtil(page, timeout);

    // Try multiple strategies to click the menu button
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await expect(menuButton).toBeVisible({ timeout });

    // Debug: Check if menu button is actually clickable
    const isEnabled = await menuButton.isEnabled();
    const isVisible = await menuButton.isVisible();
    console.log(`Menu button - Enabled: ${isEnabled}, Visible: ${isVisible}`);

    // Check if menu is already open
    const menuContent = page.locator('nav').filter({ hasText: /NBA|NFL|MLB|NHL|MLS/ });
    const isMenuOpen = await menuContent.isVisible();
    console.log(`Menu already open: ${isMenuOpen}`);

    if (isMenuOpen) {
      console.log('Menu is already open, no need to click');
      return;
    }

    // Strategy 1: Try direct click
    try {
      await menuButton.click({ timeout: 5000 });
      await page.waitForTimeout(500);

      // Verify menu opened
      const menuOpenAfterClick = await menuContent.isVisible();
      console.log(`Menu open after click: ${menuOpenAfterClick}`);

      if (menuOpenAfterClick) {
        console.log('Menu opened successfully with direct click');
        return;
      } else {
        console.log('Menu did not open with direct click');
        throw new Error('Menu did not open');
      }
    } catch (error) {
      console.log('Direct click failed, trying alternative strategies...');
    }

    // Strategy 2: Try force click
    try {
      await menuButton.click({ force: true, timeout: 5000 });
      await page.waitForTimeout(500);

      const menuOpenAfterForceClick = await menuContent.isVisible();
      if (menuOpenAfterForceClick) {
        console.log('Menu opened successfully with force click');
        return;
      } else {
        console.log('Menu did not open with force click');
        throw new Error('Menu did not open with force click');
      }
    } catch (error) {
      console.log('Force click failed, trying position-based click...');
    }

    // Strategy 3: Try clicking at the center of the button
    try {
      const box = await menuButton.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(500);

        const menuOpenAfterMouseClick = await menuContent.isVisible();
        if (menuOpenAfterMouseClick) {
          console.log('Menu opened successfully with mouse click');
          return;
        } else {
          console.log('Menu did not open with mouse click');
          throw new Error('Menu did not open with mouse click');
        }
      } else {
        throw new Error('Could not get bounding box for menu button');
      }
    } catch (error) {
      console.log('Position-based click failed, trying keyboard navigation...');
    }

    // Strategy 4: Try keyboard navigation
    try {
      await menuButton.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      const menuOpenAfterKeyboard = await menuContent.isVisible();
      if (menuOpenAfterKeyboard) {
        console.log('Menu opened successfully with keyboard');
        return;
      } else {
        console.log('Menu did not open with keyboard');
        throw new Error('Menu did not open with keyboard');
      }
    } catch (error) {
      console.log('Keyboard navigation failed');
    }

    // If all strategies fail, throw an error
    throw new Error('Failed to open mobile menu after trying multiple strategies');
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
