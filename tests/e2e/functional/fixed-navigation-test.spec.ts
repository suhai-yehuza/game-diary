import { test, expect } from '@playwright/test';

test.describe('Fixed Navigation Test', () => {
  test('should navigate to NBA page via navigation link', async ({ page }) => {
    const deploymentUrl =
      process.env.DEPLOYMENT_URL ||
      'https://game-diary-4rwp8s02v-suhais-projects-33a81a2a.vercel.app';

    console.log(`🔍 Navigating to: ${deploymentUrl}`);
    await page.goto(deploymentUrl);

    console.log(`🔍 Current URL: ${page.url()}`);

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');

    // Wait for navigation to be visible
    console.log('🔍 Waiting for navigation to be visible...');
    await page.waitForSelector('nav', { timeout: 10000 });

    // Find the NBA link
    console.log('🔍 Looking for NBA navigation link...');
    const nbaLink = page.locator('nav a[href="/sports/nba"]').first();

    // Wait for the link to be visible
    console.log('🔍 Waiting for NBA link to be visible...');
    await expect(nbaLink).toBeVisible({ timeout: 10000 });

    console.log('✅ NBA link found and visible');

    // Get link text for verification
    const linkText = await nbaLink.textContent();
    console.log(`🔍 NBA link text: "${linkText}"`);

    // Store the current URL before clicking
    const urlBeforeClick = page.url();
    console.log(`🔍 URL before click: ${urlBeforeClick}`);

    // Click the link and wait for navigation
    console.log('🔍 Clicking NBA link...');
    await Promise.all([
      // Wait for navigation to complete (URL change)
      page.waitForURL('**/sports/nba', { timeout: 10000 }),
      // Click the link
      nbaLink.click(),
    ]);

    // Wait for the new page to load
    await page.waitForLoadState('networkidle');

    console.log(`🔍 After click URL: ${page.url()}`);

    // Verify we navigated to the NBA page
    expect(page.url()).toContain('/sports/nba');
    console.log('✅ Successfully navigated to NBA page');

    // Verify the page content loaded
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    console.log('✅ NBA page content loaded');
  });

  test('should navigate to dashboard via navigation link', async ({ page }) => {
    const deploymentUrl =
      process.env.DEPLOYMENT_URL ||
      'https://game-diary-4rwp8s02v-suhais-projects-33a81a2a.vercel.app';

    console.log(`🔍 Navigating to: ${deploymentUrl}`);
    await page.goto(deploymentUrl);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find the Dashboard link
    console.log('🔍 Looking for Dashboard navigation link...');
    const dashboardLink = page.locator('nav a[href="/dashboard"]').first();

    // Wait for the link to be visible
    await expect(dashboardLink).toBeVisible({ timeout: 10000 });

    console.log('✅ Dashboard link found and visible');

    // Click the link and wait for navigation
    console.log('🔍 Clicking Dashboard link...');
    await Promise.all([
      // Wait for navigation to complete
      page.waitForURL('**/dashboard', { timeout: 10000 }),
      // Click the link
      dashboardLink.click(),
    ]);

    // Wait for the new page to load
    await page.waitForLoadState('networkidle');

    console.log(`🔍 After click URL: ${page.url()}`);

    // Verify we navigated to the dashboard
    expect(page.url()).toContain('/dashboard');
    console.log('✅ Successfully navigated to dashboard');

    // Verify the page content loaded
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    console.log('✅ Dashboard page content loaded');
  });

  test('should find mobile menu button on mobile viewport', async ({ page }) => {
    const deploymentUrl =
      process.env.DEPLOYMENT_URL ||
      'https://game-diary-4rwp8s02v-suhais-projects-33a81a2a.vercel.app';

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    console.log(`🔍 Navigating to: ${deploymentUrl} with mobile viewport`);
    await page.goto(deploymentUrl);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for mobile menu button
    console.log('🔍 Looking for mobile menu button...');
    const menuButton = page.locator('button[aria-label="Toggle menu"]');

    // Wait for the button to be visible (should be visible on mobile)
    console.log('🔍 Waiting for menu button to be visible...');
    await expect(menuButton).toBeVisible({ timeout: 10000 });

    console.log('✅ Mobile menu button found and visible');

    // Verify button is enabled
    const isEnabled = await menuButton.isEnabled();
    console.log(`🔍 Menu button enabled: ${isEnabled}`);

    expect(isEnabled).toBe(true);

    // Test clicking the menu button
    console.log('🔍 Testing menu button click...');
    await menuButton.click();

    // Wait a moment for menu to open
    await page.waitForTimeout(500);

    // Check if menu opened (look for navigation links in mobile menu)
    const mobileNavLinks = page.locator('nav a[href*="/sports"]');
    const navLinksCount = await mobileNavLinks.count();
    console.log(`🔍 Mobile navigation links found: ${navLinksCount}`);

    // Menu should be open and links should be visible
    expect(navLinksCount).toBeGreaterThan(0);
    console.log('✅ Mobile menu opened successfully');
  });
});
