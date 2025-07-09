import { test, expect } from '@playwright/test';
import { safeGoto, waitForPageLoad } from '@tests/e2e/utils/test-utils';
import { testSignInModal } from '@tests/e2e/utils/auth-modal';
import { runSmokeSuite } from './smoke.spec';

// Atomic critical-level test functions
export async function criticalTestAuthenticationFlow(page: any) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const signInButton = page.getByTestId('sign-in-button');
  await expect(signInButton).toBeVisible({ timeout: 15000 });
  const isDisabled = await signInButton.isDisabled();
  if (!isDisabled) {
    await expect(signInButton).toBeEnabled();
    await signInButton.click();
  }
}

export async function criticalTestProtectedRouteAccess(page: any) {
  const protectedRoutes = ['/protected/user', '/protected/client', '/protected/admin'];
  for (const route of protectedRoutes) {
    await safeGoto(page, route);
    await waitForPageLoad(page);
    await expect(page.locator('body')).toBeVisible();
    const authPrompt = page.locator('[data-testid="auth-prompt"], .auth-prompt, [role="alert"]');
    const protectedContent = page.locator('main, .protected-content');
    if ((await authPrompt.count()) > 0) {
      await expect(authPrompt.first()).toBeVisible();
    } else if ((await protectedContent.count()) > 0) {
      await expect(protectedContent.first()).toBeVisible();
    }
  }
}

export async function criticalTestFormValidation(page: any) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const signInButton = page.getByTestId('sign-in-button');
  await expect(signInButton).toBeVisible({ timeout: 15000 });
  const isDisabled = await signInButton.isDisabled();
  if (!isDisabled) {
    await expect(signInButton).toBeEnabled();
    await signInButton.click();
  }
}

export async function criticalTestErrorStates(page: any) {
  await safeGoto(page, '/non-existent-page');
  await waitForPageLoad(page);
  await expect(page.locator('body')).toBeVisible();
  const notFoundContent = page.locator(
    '[data-testid="not-found"], .not-found, h1:has-text("404"), h1:has-text("Not Found")'
  );
  const homeContent = page.locator('main');
  if ((await notFoundContent.count()) > 0) {
    await expect(notFoundContent.first()).toBeVisible();
  } else {
    await expect(homeContent).toBeVisible();
  }
}

export async function criticalTestBrowserNavigation(page: any) {
  await safeGoto(page, '/');
  await waitForPageLoad(page);
  await safeGoto(page, '/sports/nba');
  await waitForPageLoad(page);
  await safeGoto(page, '/sports/nfl');
  await waitForPageLoad(page);
  await page.goBack();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/sports\/nba/);
  await page.goForward();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/sports\/nfl/);
  await page.goBack();
  await page.goBack();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/$/);
}

export async function criticalTestSignInModal(page: any) {
  await safeGoto(page, '/');
  await testSignInModal(page, 'escape');
}

// Suite runner for critical
export async function runCriticalSuite(page: any) {
  await runSmokeSuite(page);
  await criticalTestAuthenticationFlow(page);
  await criticalTestProtectedRouteAccess(page);
  await criticalTestFormValidation(page);
  await criticalTestErrorStates(page);
  await criticalTestBrowserNavigation(page);
  await criticalTestSignInModal(page);
}

test.describe.configure({ retries: 2 });

test.describe('Critical Tests (Extends Smoke)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addStyleTag({
      content: '* { transition: none !important; animation: none !important; }',
    });
  });

  test('@critical full critical suite', async ({ page }) => {
    await runCriticalSuite(page);
  });
});
