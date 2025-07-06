import { test, expect } from '@playwright/test';

test.describe('Clerk Auth Modal', () => {
  test('should open Clerk sign in modal and show form fields', async ({ page }) => {
    await page.goto('/');
    // Find the real Clerk Sign In button (by text, role, or data-testid)
    const signInButton = page.getByText('Sign In', { exact: false });
    await expect(signInButton).toBeVisible();
    await signInButton.click();
    // Wait for Clerk modal to appear
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    // Optionally, fill in credentials and submit, then check for success
  });

  // You can add a similar test for sign-up if needed
});
