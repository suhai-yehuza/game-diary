import { test, expect } from '@playwright/test';

test.describe('Page Structure Debug', () => {
  test('should inspect page structure and find navigation elements', async ({ page }) => {
    const deploymentUrl =
      process.env.DEPLOYMENT_URL ||
      'https://game-diary-4rwp8s02v-suhais-projects-33a81a2a.vercel.app';

    console.log(`🔍 Navigating to: ${deploymentUrl}`);
    await page.goto(deploymentUrl);

    console.log(`🔍 Current URL: ${page.url()}`);

    // Check if we're on the right page
    if (page.url().includes('vercel.com/login')) {
      console.log('❌ Still redirected to Vercel login - protection bypass not working');
      return;
    }

    console.log('✅ Successfully accessed deployment');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Inspect navigation elements
    console.log('🔍 Inspecting navigation elements...');

    // Check for nav element
    const nav = page.locator('nav');
    const navCount = await nav.count();
    console.log(`  - nav elements found: ${navCount}`);

    if (navCount > 0) {
      const navText = await nav.first().textContent();
      console.log(`  - nav content: ${navText?.substring(0, 100)}...`);
    }

    // Check for navigation links
    const navLinks = page.locator('nav a');
    const navLinksCount = await navLinks.count();
    console.log(`  - nav a elements found: ${navLinksCount}`);

    for (let i = 0; i < Math.min(navLinksCount, 5); i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      console.log(`    ${i + 1}. href="${href}" text="${text?.trim()}"`);
    }

    // Check for mobile menu button
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    const menuButtonCount = await menuButton.count();
    console.log(`  - button[aria-label="Toggle menu"] found: ${menuButtonCount}`);

    // Check for any button elements
    const allButtons = page.locator('button');
    const allButtonsCount = await allButtons.count();
    console.log(`  - total button elements: ${allButtonsCount}`);

    // List first few buttons
    for (let i = 0; i < Math.min(allButtonsCount, 5); i++) {
      const button = allButtons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      console.log(`    ${i + 1}. aria-label="${ariaLabel}" text="${text?.trim()}"`);
    }

    // Check for any navigation-related elements
    const navigationElements = page.locator('[class*="nav"], [class*="menu"], [class*="header"]');
    const navElementsCount = await navigationElements.count();
    console.log(`  - navigation-related elements: ${navElementsCount}`);

    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'test-results/page-structure-debug.png', fullPage: true });
    console.log('📸 Screenshot saved to test-results/page-structure-debug.png');

    // Basic assertion to ensure page loaded
    expect(page.url()).toContain('vercel.app');
  });
});
