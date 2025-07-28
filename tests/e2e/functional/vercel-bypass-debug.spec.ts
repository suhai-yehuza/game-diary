import { test, expect } from '@playwright/test';

test.describe('Vercel Protection Bypass Debug', () => {
  test('should show Vercel protection bypass environment variables', async ({ page }) => {
    // Log environment variables for debugging
    console.log('🔍 Environment Variables Debug:');
    console.log(
      `  - VERCEL_AUTOMATION_BYPASS_SECRET: ${process.env.VERCEL_AUTOMATION_BYPASS_SECRET ? 'SET' : 'NOT SET'}`
    );
    console.log(`  - VERCEL_URL: ${process.env.VERCEL_URL ?? 'NOT SET'}`);
    console.log(`  - VERCEL_ENV: ${process.env.VERCEL_ENV ?? 'NOT SET'}`);
    console.log(`  - DEPLOYMENT_URL: ${process.env.DEPLOYMENT_URL ?? 'NOT SET'}`);

    // Try to navigate to the deployment URL
    const deploymentUrl =
      process.env.DEPLOYMENT_URL ??
      'https://game-diary-4rwp8s02v-suhais-projects-33a81a2a.vercel.app';
    console.log(`🔍 Attempting to navigate to: ${deploymentUrl}`);

    try {
      // Set extra headers at context level for initial navigation
      const vercelBypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
      if (vercelBypassSecret) {
        await page.setExtraHTTPHeaders({
          'x-vercel-protection-bypass': vercelBypassSecret,
        });
        console.log('✅ Set protection bypass header at context level');
      }

      // Navigate to the deployment
      const response = await page.goto(deploymentUrl);
      console.log(`🔍 Navigation response status: ${response?.status()}`);
      console.log(`🔍 Final URL: ${page.url()}`);

      // Check if we were redirected to Vercel login
      if (page.url().includes('vercel.com/login')) {
        console.log('❌ Redirected to Vercel login - protection bypass not working');
        expect(page.url()).not.toContain('vercel.com/login');
      } else {
        console.log('✅ Successfully accessed deployment without Vercel login redirect');
        expect(page.url()).toContain('vercel.app');
      }
    } catch (error) {
      console.log(`❌ Navigation failed: ${String(error)}`);
      throw error;
    }
  });
});
