import { test, expect } from '@playwright/test';
import {
  setupE2EMocking,
  safeGotoWithMocking,
  waitForNetworkIdle,
} from '@tests/e2e/utils/test-utils';

test.describe('Mock Verification (Prerequisite)', () => {
  test('@sanity should use mock data for API calls', async ({ page }) => {
    // Set up comprehensive mocking
    await setupE2EMocking(page);

    // Navigate to a page that makes API calls
    await safeGotoWithMocking(page, '/sports/nba');

    // Wait for the page to load
    await waitForNetworkIdle(page);

    // Check that the page loaded without API errors
    const pageContent = await page.content();
    expect(pageContent).not.toContain('too_many_requests');
    expect(pageContent).not.toContain('Too many requests');
    expect(pageContent).not.toContain('Rate limit exceeded');

    // Verify that the page has content (indicating mock data was used)
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check that there's some content on the page
    const textContent = await page.textContent('body');
    expect(textContent).toBeTruthy();
    expect(textContent!.length).toBeGreaterThan(100); // Should have meaningful content
  });

  test('@sanity should mock external API endpoints', async ({ page }) => {
    await setupE2EMocking(page);

    // Navigate to a page that would normally make external API calls
    await safeGotoWithMocking(page, '/sports/live');

    // Wait for any network requests to complete
    await waitForNetworkIdle(page);

    // Check that the page loaded successfully without external API errors
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Verify no API errors in page content
    const pageContent = await page.content();
    expect(pageContent).not.toContain('too_many_requests');
    expect(pageContent).not.toContain('Too many requests');
    expect(pageContent).not.toContain('Rate limit exceeded');
  });

  test('@sanity should handle live games endpoint correctly', async ({ page }) => {
    await setupE2EMocking(page);

    // Navigate to live games page
    await safeGotoWithMocking(page, '/sports/live');

    // Wait for page load
    await waitForNetworkIdle(page);

    // Check that the page loaded successfully
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Verify no API errors
    const pageContent = await page.content();
    expect(pageContent).not.toContain('too_many_requests');
    expect(pageContent).not.toContain('Too many requests');
  });
});
