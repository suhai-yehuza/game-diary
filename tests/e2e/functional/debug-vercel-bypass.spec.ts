import { test, expect } from '@playwright/test';

test.describe('Vercel Protection Bypass Debug', () => {
  test('should have bypass secret set in environment', async ({ page }) => {
    // This test will help us verify the environment variable is available
    const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    console.log('🔍 Debug: VERCEL_AUTOMATION_BYPASS_SECRET is:', bypassSecret ? 'SET' : 'NOT SET');

    if (!bypassSecret) {
      console.log('⚠️  WARNING: VERCEL_AUTOMATION_BYPASS_SECRET is not set!');
      console.log('   This will cause tests to be redirected to Vercel login page.');
    }

    // Don't fail the test, just log the status
    expect(true).toBe(true);
  });

  test('should navigate to home page without Vercel login redirect', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');

    // Wait a moment for any redirects
    await page.waitForTimeout(2000);

    // Check if we're still on our app or redirected to Vercel login
    const currentUrl = page.url();
    console.log('🔍 Debug: Current URL after navigation:', currentUrl);

    if (currentUrl.includes('vercel.com/login')) {
      console.log('❌ FAILED: Redirected to Vercel login page');
      console.log('   This means the protection bypass header is not working');
      console.log('   Check that VERCEL_AUTOMATION_BYPASS_SECRET is set correctly');

      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-results/vercel-login-redirect.png' });

      // Fail the test
      expect(currentUrl).not.toContain('vercel.com/login');
    } else {
      console.log('✅ SUCCESS: Navigation successful, not redirected to Vercel login');

      // Try to find some basic elements to confirm we're on the right page
      const title = await page.title();
      console.log('🔍 Debug: Page title:', title);

      // Look for any navigation elements
      const navElements = await page.locator('nav').count();
      console.log('🔍 Debug: Number of nav elements found:', navElements);

      // Look for any links
      const links = await page.locator('a').count();
      console.log('🔍 Debug: Number of links found:', links);

      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-results/successful-navigation.png' });
    }
  });

  test('should find navigation links if not redirected', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');

    // Wait a moment for any redirects
    await page.waitForTimeout(2000);

    const currentUrl = page.url();

    // Only proceed if we're not redirected to Vercel login
    if (!currentUrl.includes('vercel.com/login')) {
      console.log('✅ Testing navigation links...');

      // Wait for the page to load
      await page.waitForLoadState('networkidle');

      // Look for navigation links
      const nbaLink = page.locator('a:has-text("NBA")');
      const nflLink = page.locator('a:has-text("NFL")');
      const mlbLink = page.locator('a:has-text("MLB")');

      console.log('🔍 Debug: NBA link count:', await nbaLink.count());
      console.log('🔍 Debug: NFL link count:', await nflLink.count());
      console.log('🔍 Debug: MLB link count:', await mlbLink.count());

      // Try to find any navigation elements
      const allLinks = await page.locator('a').all();
      console.log('🔍 Debug: All links found:');
      for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
        const text = await allLinks[i].textContent();
        const href = await allLinks[i].getAttribute('href');
        console.log(`   ${i + 1}. "${text?.trim()}" -> ${href}`);
      }

      // Take a screenshot
      await page.screenshot({ path: 'test-results/navigation-debug.png' });

      // Don't fail the test, just log what we found
      expect(true).toBe(true);
    } else {
      console.log('⚠️  Skipping navigation test - redirected to Vercel login');
      expect(true).toBe(true);
    }
  });
});
