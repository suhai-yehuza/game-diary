import { Page, expect } from '@playwright/test';

export async function testSignInModal(
  page: Page,
  closeMethod: 'escape' | 'click-outside' = 'escape'
) {
  const signInButton = page.getByTestId('sign-in-button');
  await expect(signInButton).toBeVisible();
  await expect(signInButton).toBeEnabled();

  // In E2E test mode, we're using a test button that doesn't open the real Clerk modal
  // So we just verify the button is present and clickable
  // if (process.env.E2E_TESTING === 'true') {
  //   // Just click the button to verify it's interactive
  //   await signInButton.click();
  //   await page.waitForTimeout(500);

  //   // In E2E mode, we don't expect the modal to open, so we're done
  //   return;
  // }

  // In non-E2E mode, test the full modal flow
  await signInButton.click();
  const emailInput = page.getByRole('textbox', { name: /email/i });
  await expect(emailInput).toBeVisible();

  if (closeMethod === 'escape') {
    await page.keyboard.press('Escape');
  } else {
    await page.mouse.click(10, 10);
  }
  await expect(emailInput).not.toBeVisible();
}
