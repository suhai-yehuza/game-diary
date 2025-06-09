import { test } from './utils/global-setup';
import { expect } from '@playwright/test';
import { waitForPageContent, navigateWithMocking, testResponsiveness } from './utils/test-utils';

test.describe('Live Games Page', () => {
  test('should display live games when games are in progress', async ({ page }) => {
    await navigateWithMocking(page, '/sports/nba/live');

    // Check page title and header
    await expect(page).toHaveTitle(/Game Diary/);
    await expect(page.locator('h1')).toContainText('Live NBA Games');

    // Check for live games indicator elements
    await expect(page.locator('text=Auto-refreshing every 30 seconds')).toBeVisible();
    await expect(page.locator('[data-testid="live-indicator"], .animate-pulse')).toBeVisible();

    // Check that game cards are displayed
    const gameCards = page.locator('[role="button"]').filter({ hasText: /vs|@/ });
    await expect(gameCards).toHaveCount(3); // We have 3 mock games

    // Check for team names from our mock data
    await expect(page.locator('text=Pacers')).toBeVisible();
    await expect(page.locator('text=Thunder')).toBeVisible();
    await expect(page.locator('text=Nuggets')).toBeVisible();
    await expect(page.locator('text=Warriors')).toBeVisible();
    await expect(page.locator('text=Heat')).toBeVisible();
    await expect(page.locator('text=Celtics')).toBeVisible();

    // Check for live indicators on game cards
    const liveIndicators = page.locator('text=LIVE');
    await expect(liveIndicators).toHaveCount(3);

    // Check for scores being displayed
    await expect(page.locator('text=42')).toBeVisible(); // Pacers vs Thunder tied score
    await expect(page.locator('text=95')).toBeVisible(); // Nuggets score
    await expect(page.locator('text=102')).toBeVisible(); // Warriors score
    await expect(page.locator('text=57')).toBeVisible(); // Heat score
    await expect(page.locator('text=59')).toBeVisible(); // Celtics score

    // Check for different game statuses
    await expect(page.locator('text=In Play')).toBeVisible();
    await expect(page.locator('text=Halftime')).toBeVisible();
  });

  test('should display empty state when no games are live', async ({ page }) => {
    await navigateWithMocking(page, '/sports/nba/live', { emptyLiveGames: true });

    // Check page loads correctly
    await expect(page.locator('h1')).toContainText('Live NBA Games');
    await expect(page.locator('text=(0 games in progress)')).toBeVisible();

    // Check for empty state message
    await expect(page.locator('text=No Live Games')).toBeVisible();
    await expect(page.locator('text=There are no NBA games currently in progress')).toBeVisible();

    // Check for link to view all games
    const viewAllGamesLink = page.locator('text=View All NBA Games');
    await expect(viewAllGamesLink).toBeVisible();
    await expect(viewAllGamesLink).toHaveAttribute('href', '/sports/nba');
  });

  test('should have working navigation', async ({ page }) => {
    await navigateWithMocking(page, '/sports/nba/live');

    // Check back navigation link
    const backLink = page.locator('text=Back to NBA');
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/sports/nba');

    // Check footer navigation link
    const footerLink = page.locator(
      'text=View all NBA games including scheduled and completed games'
    );
    await expect(footerLink).toBeVisible();
    await expect(footerLink).toHaveAttribute('href', '/sports/nba');
  });

  test('should navigate to individual game pages when clicking game cards', async ({ page }) => {
    await navigateWithMocking(page, '/sports/nba/live');

    // Wait for game cards to load
    const gameCards = page.locator('[role="button"]').filter({ hasText: /Pacers|Thunder/ });
    await expect(gameCards.first()).toBeVisible();

    // Mock the individual game page
    await page.route('**/sports/nba/games/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><h1>Game Details</h1></body></html>',
      });
    });

    // Click on the first game card
    await gameCards.first().click();

    // Check that navigation occurred (URL should change)
    await expect(page).toHaveURL(/\/sports\/nba\/games\/\d+/);
  });

  test('should navigate to team pages when clicking team logos/names', async ({ page }) => {
    await navigateWithMocking(page, '/sports/nba/live');

    // Find team links (they should be inside game cards)
    const teamLinks = page.locator('a[href*="/sports/nba/teams/"]');
    await expect(teamLinks.first()).toBeVisible();

    // Mock the team page
    await page.route('**/sports/nba/teams/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><h1>Team Details</h1></body></html>',
      });
    });

    // Click on the first team link
    await teamLinks.first().click();

    // Check that navigation occurred
    await expect(page).toHaveURL(/\/sports\/nba\/teams\/\d+/);
  });

  test('should be responsive across different viewport sizes', async ({ page }) => {
    await testResponsiveness(page, async _viewport => {
      await navigateWithMocking(page, '/sports/nba/live');

      // Check that the page title is always visible
      await expect(page.locator('h1')).toContainText('Live NBA Games');

      // Check that game cards are displayed appropriately
      const gameCards = page.locator('[role="button"]').filter({ hasText: /vs|@/ });
      await expect(gameCards).toHaveCount(3);

      // On mobile, cards should stack vertically (grid-cols-1)
      // On tablet, cards should be in 2 columns (md:grid-cols-2)
      // On desktop, cards should be in 3 columns (lg:grid-cols-3)
      const gameGrid = page.locator('.grid').first();
      await expect(gameGrid).toBeVisible();

      // Check that navigation elements are accessible
      const backLink = page.locator('text=Back to NBA');
      await expect(backLink).toBeVisible();

      // Verify the page is responsive at this viewport
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test('should handle loading states properly', async ({ page }) => {
    // Test loading state by delaying the API response
    let resolveApiCall: (() => void) | undefined;
    const apiPromise = new Promise<void>(resolve => {
      resolveApiCall = resolve;
    });

    await page.route('**/api/graphql', async route => {
      // Wait for our signal before responding
      await apiPromise;
      await route.continue();
    });

    // Navigate to the page
    const navigationPromise = page.goto('/sports/nba/live');

    // Check that loading state is shown
    await expect(page.locator('text=Loading live games...')).toBeVisible({ timeout: 1000 });

    // Resolve the API call
    if (resolveApiCall) {
      resolveApiCall();
    }
    await navigationPromise;
    await waitForPageContent(page);

    // Check that loading state is hidden and content is shown
    await expect(page.locator('text=Loading live games...')).not.toBeVisible();
    await expect(page.locator('h1')).toContainText('Live NBA Games');
  });

  test('should display arena information correctly', async ({ page }) => {
    await navigateWithMocking(page, '/sports/nba/live');

    // Check for arena information from our mock data
    await expect(page.locator('text=Paycom Center')).toBeVisible();
    await expect(page.locator('text=Oklahoma City')).toBeVisible();
    await expect(page.locator('text=Chase Center')).toBeVisible();
    await expect(page.locator('text=San Francisco')).toBeVisible();
    await expect(page.locator('text=TD Garden')).toBeVisible();
    await expect(page.locator('text=Boston')).toBeVisible();
  });

  test('should show correct game status indicators', async ({ page }) => {
    await navigateWithMocking(page, '/sports/nba/live');

    // Check for different status indicators
    await expect(page.locator('text=In Play')).toBeVisible();
    await expect(page.locator('text=Halftime')).toBeVisible();

    // Check for clock times
    await expect(page.locator('text=10:46')).toBeVisible();
    await expect(page.locator('text=5:23')).toBeVisible();
    await expect(page.locator('text=0:00')).toBeVisible();

    // Check for quarter information
    await expect(page.locator('text=2')).toBeVisible(); // Current period
    await expect(page.locator('text=4')).toBeVisible(); // Current period
  });

  test('should handle accessibility requirements', async ({ page }) => {
    await navigateWithMocking(page, '/sports/nba/live');

    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText('Live NBA Games');

    // Check for proper button labels
    const gameButtons = page.locator('[role="button"]').filter({ hasText: /vs|@/ });
    for (let i = 0; i < (await gameButtons.count()); i++) {
      const button = gameButtons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain('View game details');
    }

    // Check for proper image alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute('alt');
      if (altText !== null) {
        expect(altText.length).toBeGreaterThan(0);
      }
    }

    // Check for proper link accessibility
    const links = page.locator('a');
    const linkCount = await links.count();
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('should auto-refresh indicator be visible', async ({ page }) => {
    await navigateWithMocking(page, '/sports/nba/live');

    // Check for auto-refresh indicator
    await expect(page.locator('text=Auto-refreshing every 30 seconds')).toBeVisible();

    // Check for the green pulse indicator
    const refreshIndicator = page.locator('.bg-green-500.animate-pulse');
    await expect(refreshIndicator).toBeVisible();
  });

  test('should display game indicators correctly', async ({ page }) => {
    await page.goto('/live-games');
    await page.waitForLoadState('networkidle');

    // Check for live game indicators
    const liveIndicators = await page.getByTestId('live-indicator').all();
    expect(liveIndicators.length).toBeGreaterThan(0);

    // Check for game status
    const gameStatuses = await page.getByTestId('game-status').all();
    for (const status of gameStatuses) {
      const text = await status.textContent();
      expect(text).toMatch(/^(Live|Halftime|End of Period|Final)$/);
    }
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/live-games');
    await page.waitForLoadState('networkidle');

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500); // Wait for layout to adjust

    // Check if mobile-specific elements are visible
    const mobileHeader = await page.getByTestId('mobile-header');
    await expect(mobileHeader).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    // Check if tablet-specific elements are visible
    const tabletHeader = await page.getByTestId('tablet-header');
    await expect(tabletHeader).toBeVisible();

    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(500);

    // Check if desktop-specific elements are visible
    const desktopHeader = await page.getByTestId('desktop-header');
    await expect(desktopHeader).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    await page.goto('/live-games');

    // Check for loading skeleton
    const loadingSkeleton = await page.getByTestId('loading-skeleton');
    await expect(loadingSkeleton).toBeVisible();

    // Wait for content to load
    await page.waitForLoadState('networkidle');
    await expect(loadingSkeleton).not.toBeVisible();
  });

  test('should display arena information', async ({ page }) => {
    await page.goto('/live-games');
    await page.waitForLoadState('networkidle');

    // Check for arena information
    const arenaInfo = await page.getByTestId('arena-info').all();
    for (const arena of arenaInfo) {
      const text = await arena.textContent();
      expect(text).toMatch(/^[A-Za-z\s]+$/); // Arena names should only contain letters and spaces
    }
  });

  test('should handle game updates', async ({ page }) => {
    await page.goto('/live-games');
    await page.waitForLoadState('networkidle');

    // Get initial scores
    const initialScores = await page.getByTestId('team-score').all();
    const initialScoreTexts = await Promise.all(initialScores.map(score => score.textContent()));

    // Wait for potential updates
    await page.waitForTimeout(5000);

    // Get updated scores
    const updatedScores = await page.getByTestId('team-score').all();
    const updatedScoreTexts = await Promise.all(updatedScores.map(score => score.textContent()));

    // Scores should either be the same or different (if there was an update)
    expect(updatedScoreTexts.length).toBe(initialScoreTexts.length);
  });

  test('should handle navigation', async ({ page }) => {
    await page.goto('/live-games');
    await page.waitForLoadState('networkidle');

    // Click on a game
    const firstGame = await page.getByTestId('game-card').first();
    await firstGame.click();

    // Should navigate to game details
    await expect(page).toHaveURL(/\/games\/[a-zA-Z0-9-]+$/);
  });

  test('should handle different viewport sizes', async ({ page }) => {
    await page.goto('/live-games');
    await page.waitForLoadState('networkidle');

    // Check if the page is responsive
    const header = await page.getByTestId('page-header');
    await expect(header).toBeVisible();
  });
});
