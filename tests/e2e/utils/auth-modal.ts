import { Page, expect } from '@playwright/test';

export async function testSignInModal(
  page: Page,
  closeMethod: 'escape' | 'click-outside' = 'escape'
) {
  const signInButton = page.getByTestId('sign-in-button');
  await expect(signInButton).toBeVisible();
  await expect(signInButton).toBeEnabled();

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
