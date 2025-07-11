import { test, expect } from '@playwright/test';

test.describe('Simple Navigation Test', () => {
  test('should find and click NBA navigation link', async ({ page }) => {
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

    // Try to find the NBA link
    console.log('🔍 Looking for NBA navigation link...');
    const nbaLink = page.locator('nav a[href="/sports/nba"]').first();

    // Wait for the link to be visible
    console.log('🔍 Waiting for NBA link to be visible...');
    await expect(nbaLink).toBeVisible({ timeout: 10000 });

    console.log('✅ NBA link found and visible');

    // Get link text for verification
    const linkText = await nbaLink.textContent();
    console.log(`🔍 NBA link text: "${linkText}"`);

    // Click the link
    console.log('🔍 Clicking NBA link...');
    await nbaLink.click();

    // Wait for navigation
    await page.waitForLoadState('networkidle');

    console.log(`🔍 After click URL: ${page.url()}`);

    // Verify we navigated to the NBA page
    expect(page.url()).toContain('/sports/nba');
    console.log('✅ Successfully navigated to NBA page');
  });

  test('should find mobile menu button', async ({ page }) => {
    const deploymentUrl =
      process.env.DEPLOYMENT_URL ||
      'https://game-diary-4rwp8s02v-suhais-projects-33a81a2a.vercel.app';

    console.log(`🔍 Navigating to: ${deploymentUrl}`);
    await page.goto(deploymentUrl);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for mobile menu button
    console.log('🔍 Looking for mobile menu button...');
    const menuButton = page.locator('button[aria-label="Toggle menu"]');

    // Wait for the button to be visible
    console.log('🔍 Waiting for menu button to be visible...');
    await expect(menuButton).toBeVisible({ timeout: 10000 });

    console.log('✅ Mobile menu button found and visible');

    // Verify button is enabled
    const isEnabled = await menuButton.isEnabled();
    console.log(`🔍 Menu button enabled: ${isEnabled}`);

    expect(isEnabled).toBe(true);
  });
});
