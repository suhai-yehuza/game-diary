import { Page, expect } from '@playwright/test';
import {
  waitForPageLoad,
  waitForNetworkIdle as waitForNetworkIdleUtil,
} from '@tests/e2e/utils/test-utils';

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

  // Wait for the page to be fully loaded and stable
  await waitForNetworkIdleUtil(page, timeout);

  // Wait for navigation to be properly loaded
  await waitForNavigationLoaded(page, timeout);

  // Find and click the navigation link
  let link;
  if (href === '/') {
    // Home link is the logo
    link = page.locator('header a[href="/"]').first();
  } else {
    // Try multiple selectors to find the navigation link with better error handling
    let linkFound = false;

    // Strategy 1: Try the specific nav selector
    link = page.locator(`nav a[href="${href}"]`).first();
    if ((await link.count()) > 0) {
      linkFound = true;
    }

    // Strategy 2: If not found, try a more general selector
    if (!linkFound) {
      link = page.locator(`a[href="${href}"]`).first();
      if ((await link.count()) > 0) {
        linkFound = true;
      }
    }

    // Strategy 3: If still not found, try looking for text content
    if (!linkFound) {
      const linkText = href.split('/').pop()?.toUpperCase() || href;
      link = page.locator(`a:has-text("${linkText}")`).first();
      if ((await link.count()) > 0) {
        linkFound = true;
      }
    }

    // Strategy 4: If still not found, try looking for any navigation element with the text
    if (!linkFound) {
      const linkText = href.split('/').pop()?.toUpperCase() || href;
      link = page.locator(`nav a:has-text("${linkText}")`).first();
      if ((await link.count()) > 0) {
        linkFound = true;
      }
    }

    // Strategy 5: If still not found, try looking for any element with the text (fallback)
    if (!linkFound) {
      const linkText = href.split('/').pop()?.toUpperCase() || href;
      link = page.locator(`*:has-text("${linkText}")`).first();
      if ((await link.count()) > 0) {
        linkFound = true;
      }
    }

    // If no link found, provide better debugging information
    if (!linkFound) {
      console.log(`🔍 Navigation Debug: Could not find link for ${href}`);
      console.log(`🔍 Current URL: ${page.url()}`);

      // Log all navigation links on the page for debugging
      const allNavLinks = await page.locator('nav a').all();
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
  await navigateToSection(page, '/', options);
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
 * Wait for navigation to be properly loaded and visible
 */
export async function waitForNavigationLoaded(page: Page, timeout: number = 10000): Promise<void> {
  console.log('🔍 Waiting for navigation to be loaded...');

  // Wait for the navigation container to be present
  await page.waitForSelector('nav', { timeout });

  // Wait for at least one navigation link to be visible
  await page.waitForSelector('nav a', { timeout });

  // Additional wait to ensure navigation is fully rendered
  await page.waitForTimeout(1000);

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

    // Check if menu is already open by looking for the menu container
    const menuContainer = page.locator(
      'div.absolute.lg\\:relative, div.absolute.lg\\:block, div.absolute'
    );
    const isMenuOpen = await menuContainer.isVisible();
    console.log(`Menu already open: ${isMenuOpen}`);

    if (isMenuOpen) {
      console.log('Menu is already open, no need to click');
      return;
    }

    // Strategy 1: Try force click first (bypasses element interception)
    try {
      await menuButton.click({ force: true, timeout: 5000 });
      await page.waitForTimeout(500);

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
    } catch (error) {
      console.log('Force click failed, trying position-based click...');
    }

    // Strategy 2: Try clicking at the exact center of the button
    try {
      const box = await menuButton.boundingBox();
      if (box) {
        // Click at the exact center of the button
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(500);

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
    } catch (error) {
      console.log('Mouse click failed, trying direct click...');
    }

    // Strategy 3: Try direct click as fallback
    try {
      await menuButton.click({ timeout: 5000 });
      await page.waitForTimeout(500);

      const menuOpenAfterDirectClick = await menuContainer.isVisible();
      console.log(`Menu open after direct click: ${menuOpenAfterDirectClick}`);

      if (menuOpenAfterDirectClick) {
        console.log('Menu opened successfully with direct click');
        return;
      } else {
        throw new Error('Menu did not open with direct click');
      }
    } catch (error) {
      console.log('Direct click failed, trying keyboard navigation...');
    }

    // Strategy 3: Try clicking at the center of the button
    try {
      const box = await menuButton.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(500);

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
    } catch (error) {
      console.log('Mouse click failed, trying keyboard navigation...');
    }

    // Strategy 4: Try keyboard navigation
    try {
      await menuButton.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      const menuOpenAfterKeyboard = await menuContainer.isVisible();
      console.log(`Menu open after keyboard: ${menuOpenAfterKeyboard}`);

      if (menuOpenAfterKeyboard) {
        console.log('Menu opened successfully with keyboard');
        return;
      } else {
        throw new Error('Menu did not open with keyboard');
      }
    } catch (error) {
      console.log('Keyboard navigation failed');
    }

    // If all strategies fail, throw an error
    throw new Error('Failed to open mobile menu after trying all strategies');
  }
}

/**
 * Open mobile search overlay if on mobile device
 */
export async function openMobileSearch(page: Page, timeout: number = 10000): Promise<void> {
  const isMobile = await page.evaluate(() => window.innerWidth < 1024);

  if (isMobile) {
    // Wait for the page to be fully loaded and stable
    await waitForNetworkIdleUtil(page, timeout);

    // Check if search overlay is already open
    const searchOverlay = page.locator('.fixed.inset-0.z-40');
    const isSearchOpen = await searchOverlay.isVisible();

    if (isSearchOpen) {
      console.log('Search overlay is already open, no need to focus');
      return;
    }

    // Find the mobile search button and click it to open the overlay
    const searchButton = page.locator('button[aria-label="Toggle search"]');
    await expect(searchButton).toBeVisible({ timeout });

    try {
      // Click the search button to open the overlay
      await searchButton.click();
      await page.waitForTimeout(500);

      // Verify search overlay opened
      const searchOpenAfterClick = await searchOverlay.isVisible();
      console.log(`Search overlay open after click: ${searchOpenAfterClick}`);

      if (searchOpenAfterClick) {
        // Wait for the search input to be attached inside the overlay
        const overlaySearchInput = searchOverlay.locator('input[type="search"]');
        await overlaySearchInput.waitFor({ state: 'attached', timeout: 5000 });
        await overlaySearchInput.focus();
        // Wait for the input to become visible
        await expect(overlaySearchInput).toBeVisible({ timeout: 5000 });
        await page.waitForTimeout(200);
        console.log('Search overlay opened successfully and input focused/visible');
        return;
      } else {
        throw new Error('Search overlay did not open');
      }
    } catch (error) {
      console.log('Search button click failed, trying force click...');

      // Try force click as fallback
      try {
        await searchButton.click({ force: true });
        await page.waitForTimeout(500);

        const searchOpenAfterForceClick = await searchOverlay.isVisible();
        if (searchOpenAfterForceClick) {
          console.log('Search overlay opened successfully with force click');
          return;
        } else {
          throw new Error('Search overlay did not open with force click');
        }
      } catch (forceError) {
        throw new Error('Failed to open mobile search overlay');
      }
    }
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
