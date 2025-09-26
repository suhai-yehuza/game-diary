import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { SPORTS_CONFIG } from '@/app/components/sports/SportsConfig';
import {
  waitForPageLoad,
  waitForNetworkIdle as waitForNetworkIdleUtil,
  TIMEOUTS,
} from '@tests/e2e/utils/test-utils';

/**
 * Navigation utilities for E2E tests
 * Handles common navigation patterns including mobile menu interactions
 */

export interface INavigationOptions {
  waitForLoad?: boolean;
  timeout?: number;
  checkMainContent?: boolean;
  waitForNetworkIdle?: boolean;
}

export interface ILoadStateOptions {
  state?: 'domcontentloaded' | 'load' | 'networkidle';
  timeout?: number;
}

/**
 * Wait for a specific load state with consistent timeout handling
 */
export async function waitForLoadState(page: Page, options: ILoadStateOptions = {}): Promise<void> {
  const { state = 'networkidle', timeout = 10000 } = options;
  await page.waitForLoadState(state, { timeout });
}

/**
 * Wait for network idle with consistent timeout
 */
export async function waitForNetworkIdle(page: Page, timeout = 10000): Promise<void> {
  await waitForLoadState(page, { state: 'networkidle', timeout });
}

/**
 * Wait for DOM content loaded with consistent timeout
 */
export async function waitForDOMContentLoaded(page: Page, timeout = 10000): Promise<void> {
  await waitForLoadState(page, { state: 'domcontentloaded', timeout });
}

/**
 * Navigate to a page with consistent load state handling
 */
export async function navigateToPage(
  page: Page,
  url: string,
  options: INavigationOptions = {}
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
  options: INavigationOptions = {}
): Promise<void> {
  const {
    waitForLoad = true,
    timeout = TIMEOUTS.MEDIUM,
    checkMainContent = true,
    waitForNetworkIdle = true,
  } = options;

  const isMobile = await page.evaluate(() => window.innerWidth < 1024);

  if (isMobile) {
    // Open mobile menu first with improved click handling
    await openMobileMenu(page, timeout);
    await waitForMenuNavVisible(page, timeout);
  }

  // Wait for the page to be fully loaded and stable
  await waitForNetworkIdleUtil(page, timeout);

  // Wait for navigation to be properly loaded
  await waitForNavigationLoaded(page, timeout);

  // Find and click the navigation link
  let link;
  if (href === '/') {
    if (isMobile) {
      link = page.locator('[data-testid="mobile-menu-overlay"] nav a[href="/"]').first();
    } else {
      link = page.locator('header a[href="/"]').first();
    }
  } else {
    let linkFound = false;
    // Strategy 1: Try the nav selector (scoped by device)
    if (isMobile) {
      link = page.locator(`[data-testid="mobile-menu-overlay"] nav a[href="${href}"]`).first();
    } else {
      link = page.locator(`nav a[href="${href}"]`).first();
    }
    if ((await link.count()) > 0) linkFound = true;
    // Strategy 2: General selector (scoped by device)
    if (!linkFound) {
      if (isMobile) {
        link = page.locator(`[data-testid="mobile-menu-overlay"] nav a[href="${href}"]`).first();
      } else {
        link = page.locator(`a[href="${href}"]`).first();
      }
      if ((await link.count()) > 0) linkFound = true;
    }
    // Strategy 3: By text content (scoped by device)
    if (!linkFound) {
      const linkText = href.split('/').pop()?.toUpperCase() ?? href;
      if (isMobile) {
        link = page
          .locator(`[data-testid="mobile-menu-overlay"] nav a:has-text("${linkText}")`)
          .first();
      } else {
        link = page.locator(`a:has-text("${linkText}")`).first();
      }
      if ((await link.count()) > 0) linkFound = true;
    }
    // Strategy 4: nav by text (scoped by device)
    if (!linkFound) {
      const linkText = href.split('/').pop()?.toUpperCase() ?? href;
      if (isMobile) {
        link = page
          .locator(`[data-testid="mobile-menu-overlay"] nav a:has-text("${linkText}")`)
          .first();
      } else {
        link = page.locator(`nav a:has-text("${linkText}")`).first();
      }
      if ((await link.count()) > 0) linkFound = true;
    }
    // Strategy 5: fallback (scoped by device)
    if (!linkFound) {
      const linkText = href.split('/').pop()?.toUpperCase() ?? href;
      if (isMobile) {
        link = page
          .locator(`[data-testid="mobile-menu-overlay"] nav *:has-text("${linkText}")`)
          .first();
      } else {
        link = page.locator(`*:has-text("${linkText}")`).first();
      }
      if ((await link.count()) > 0) linkFound = true;
    }
    if (!linkFound) {
      console.log(`🔍 Navigation Debug: Could not find link for ${href}`);
      console.log(`🔍 Current URL: ${page.url()}`);
      // Log all navigation links for debugging
      let allNavLinks;
      if (isMobile) {
        allNavLinks = await page.locator('[data-testid="mobile-menu-overlay"] nav a').all();
      } else {
        allNavLinks = await page.locator('nav a').all();
      }
      console.log(`🔍 Found ${allNavLinks.length} navigation links:`);
      for (const navLink of allNavLinks) {
        const href = await navLink.getAttribute('href');
        const text = await navLink.textContent();
        console.log(`🔍   - href: "${href}", text: "${text}"`);
      }
      // Log all links on the page for debugging
      const allLinks = await page.locator('a').all();
      console.log(`🔍 Found ${allLinks.length} total links:`);
      for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
        const href = await allLinks[i].getAttribute('href');
        const text = await allLinks[i].textContent();
        console.log(`🔍   - href: "${href}", text: "${text}"`);
      }
      throw new Error(`Navigation link for ${href} not found on page`);
    }
  }

  // Wait for the link to be visible
  await expect(link).toBeVisible({ timeout });

  // Click the link and wait for navigation to complete
  console.log(`🔍 Clicking navigation link to ${href}...`);
  await link.scrollIntoViewIfNeeded();
  await Promise.all([
    // Wait for navigation to complete (URL change)
    page.waitForURL(`**${href}`, { timeout }),
    // Click the link
    link.click(),
  ]);

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
 * Navigate to home page
 */
export async function navigateToHome(page: Page, options: INavigationOptions = {}): Promise<void> {
  await navigateToSection(page, '/', options);
}

/**
 * Navigate to sports section
 */
export async function navigateToSports(
  page: Page,
  options: INavigationOptions = {}
): Promise<void> {
  const firstSportHref = Object.values(SPORTS_CONFIG)[0].href;
  await navigateToSection(page, firstSportHref, options);
}

/**
 * Navigate to dashboard
 */
export async function navigateToDashboard(
  page: Page,
  options: INavigationOptions = {}
): Promise<void> {
  await navigateToSection(page, '/', options);
}

/**
 * Navigate to user profile
 */
export async function navigateToProfile(
  page: Page,
  options: INavigationOptions = {}
): Promise<void> {
  await navigateToSection(page, '/protected/user', options);
}

/**
 * Wait for navigation to be properly loaded and visible
 */
export async function waitForNavigationLoaded(page: Page, timeout = 10000): Promise<void> {
  console.log('🔍 Waiting for navigation to be loaded...');

  const isMobile = await page.evaluate(() => window.innerWidth < 1024);

  if (isMobile) {
    // Wait for the nav inside the mobile menu overlay
    await page.waitForSelector('[data-testid="mobile-menu-overlay"] nav', { timeout });
    await page.waitForSelector('[data-testid="mobile-menu-overlay"] nav a', { timeout });
  } else {
    // Wait for the main nav
    await page.waitForSelector('nav', { timeout });
    await page.waitForSelector('nav a', { timeout });
  }

  await page.waitForLoadState('domcontentloaded');
  console.log('🔍 Navigation loaded successfully');
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
      await page.waitForLoadState('domcontentloaded');
    }
  }
}

/**
 * Open mobile menu if on mobile device with improved click handling
 */
export async function openMobileMenu(page: Page, timeout = 10000): Promise<void> {
  const isMobile = await page.evaluate(() => window.innerWidth < 1024);

  if (isMobile) {
    // Wait for the page to be fully loaded and stable
    await waitForNetworkIdleUtil(page, timeout);

    // Try multiple strategies to click the menu button
    const menuButton = page.locator(
      'button[aria-label="Open menu"], button[aria-label="Close menu"]'
    );
    await expect(menuButton).toBeVisible({ timeout });

    // Debug: Check if menu button is actually clickable
    const isEnabled = await menuButton.isEnabled();
    const isVisible = await menuButton.isVisible();
    console.log(`Menu button - Enabled: ${isEnabled}, Visible: ${isVisible}`);

    // Check if menu is already open by looking for the menu container
    const menuContainer = page.locator('[data-testid="mobile-menu-overlay"]');
    const isMenuOpen = await menuContainer.isVisible();
    console.log(`Menu already open: ${isMenuOpen}`);

    if (isMenuOpen) {
      console.log('Menu is already open, no need to click');
      return;
    }

    // Strategy 1: Try force click first (bypasses element interception)
    try {
      await menuButton.click({ force: true, timeout: 5000 });
      await page.waitForLoadState('domcontentloaded');

      // Verify menu opened
      const menuOpenAfterClick = await menuContainer.isVisible();
      console.log(`Menu open after force click: ${menuOpenAfterClick}`);

      if (menuOpenAfterClick) {
        console.log('Menu opened successfully with force click');
        return;
      } else {
        console.log('Menu did not open with force click');
        throw new Error('Menu did not open');
      }
    } catch (_error) {
      console.log('Force click failed, trying position-based click...');
    }

    // Strategy 2: Try clicking at the exact center of the button
    try {
      const box = await menuButton.boundingBox();
      if (box) {
        // Click at the exact center of the button
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForLoadState('domcontentloaded');

        const menuOpenAfterMouseClick = await menuContainer.isVisible();
        console.log(`Menu open after mouse click: ${menuOpenAfterMouseClick}`);

        if (menuOpenAfterMouseClick) {
          console.log('Menu opened successfully with mouse click');
          return;
        } else {
          throw new Error('Menu did not open with mouse click');
        }
      } else {
        throw new Error('Could not get bounding box for menu button');
      }
    } catch (_error) {
      console.log('Mouse click failed, trying direct click...');
    }

    // Strategy 3: Try direct click as fallback
    try {
      await menuButton.click({ timeout: 5000 });
      await page.waitForLoadState('domcontentloaded');

      const menuOpenAfterDirectClick = await menuContainer.isVisible();
      console.log(`Menu open after direct click: ${menuOpenAfterDirectClick}`);

      if (menuOpenAfterDirectClick) {
        console.log('Menu opened successfully with direct click');
        return;
      } else {
        throw new Error('Menu did not open with direct click');
      }
    } catch (_error) {
      console.log('Direct click failed, trying keyboard navigation...');
    }

    // Strategy 3: Try clicking at the center of the button
    try {
      const box = await menuButton.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForLoadState('domcontentloaded');

        const menuOpenAfterMouseClick = await menuContainer.isVisible();
        console.log(`Menu open after mouse click: ${menuOpenAfterMouseClick}`);

        if (menuOpenAfterMouseClick) {
          console.log('Menu opened successfully with mouse click');
          return;
        } else {
          throw new Error('Menu did not open with mouse click');
        }
      } else {
        throw new Error('Could not get bounding box for menu button');
      }
    } catch (_error) {
      console.log('Mouse click failed, trying keyboard navigation...');
    }

    // Strategy 4: Try keyboard navigation
    try {
      await menuButton.focus();
      await page.keyboard.press('Enter');
      await page.waitForLoadState('domcontentloaded');

      const menuOpenAfterKeyboard = await menuContainer.isVisible();
      console.log(`Menu open after keyboard: ${menuOpenAfterKeyboard}`);

      if (menuOpenAfterKeyboard) {
        console.log('Menu opened successfully with keyboard');
        return;
      } else {
        throw new Error('Menu did not open with keyboard');
      }
    } catch (_error) {
      console.log('Keyboard navigation failed');
    }

    // If all strategies fail, throw an error
    throw new Error('Failed to open mobile menu after trying all strategies');
  }
}

/**
 * Open mobile search by navigating to search page via bottom navigation
 */
export async function openMobileSearch(page: Page, timeout = 10000): Promise<void> {
  const isMobile = await page.evaluate(() => window.innerWidth < 1024);

  if (isMobile) {
    // Wait for the page to be fully loaded and stable
    await waitForNetworkIdleUtil(page, timeout);

    // Find the search navigation item in the bottom navigation
    const searchNavItem = page.locator('nav a[href="/search"], nav button[aria-label="Search"]');
    await expect(searchNavItem).toBeVisible({ timeout });

    try {
      // Click the search navigation item to go to the search page
      await searchNavItem.click();
      await page.waitForLoadState('domcontentloaded');

      // Verify we're on the search page
      await expect(page).toHaveURL(/.*\/search.*/);

      // Wait for the search input to be visible on the search page
      const searchInput = page.locator(
        'input[type="search"], input[placeholder*="search"], [data-testid="search-input"]'
      );
      await expect(searchInput.first()).toBeVisible({ timeout: 5000 });
      console.log('Successfully navigated to search page and input is visible');
      return;
    } catch (_error) {
      console.log('Search navigation failed, trying force click...');

      // Try force click as fallback
      try {
        await searchNavItem.click({ force: true });
        await page.waitForLoadState('domcontentloaded');

        await expect(page).toHaveURL(/.*\/search.*/);
        const searchInput = page.locator(
          'input[type="search"], input[placeholder*="search"], [data-testid="search-input"]'
        );
        await expect(searchInput.first()).toBeVisible({ timeout: 5000 });
        console.log('Successfully navigated to search page with force click');
        return;
      } catch (_forceError) {
        throw new Error('Failed to navigate to mobile search page');
      }
    }
  }
}

/**
 * Wait for the correct nav container to be visible after opening the menu
 */
export async function waitForMenuNavVisible(page: Page, timeout = 5000): Promise<void> {
  const isMobile = await page.evaluate(() => window.innerWidth < 1024);
  if (isMobile) {
    await expect(page.locator('[data-testid="mobile-menu-overlay"] nav')).toBeVisible({ timeout });
  } else {
    await expect(page.locator('nav')).toBeVisible({ timeout });
  }
}

/**
 * Get current viewport size
 */
export async function getViewportSize(page: Page): Promise<{ width: number; height: number }> {
  return page.evaluate(() => ({
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
