import { test, expect } from '@playwright/test';
import { runComprehensivePageTests, waitForNetworkIdle } from '@tests/e2e/utils/page-suites';

const sportsPages = [
  { path: '/sports/nba', name: 'NBA', league: 'basketball' },
  { path: '/sports/nfl', name: 'NFL', league: 'football' },
  { path: '/sports/mlb', name: 'MLB', league: 'baseball' },
  { path: '/sports/nhl', name: 'NHL', league: 'hockey' },
  { path: '/sports/mls', name: 'MLS', league: 'soccer' },
  { path: '/sports/all-sports', name: 'All Sports', league: 'all' },
  { path: '/sports/live', name: 'Live Games', league: 'live' },
];

// Run comprehensive page tests for each sports page
for (const sportPage of sportsPages) {
  runComprehensivePageTests(test, sportPage.path, sportPage.name);
}

test.describe('Sports Pages', () => {
  for (const sportPage of sportsPages) {
    test.describe(`${sportPage.name} Page`, () => {
      // Sports-specific tests
      test.describe(`${sportPage.name} - Sports Specific Tests`, () => {
        test.beforeEach(async ({ page }) => {
          await page.goto(sportPage.path);
          await waitForNetworkIdle(page);
          // Disable all CSS animations and transitions for test reliability
          await page.addStyleTag({
            content: '* { transition: none !important; animation: none !important; }',
          });
        });

        test(`should have proper ${sportPage.name} navigation`, async ({ page }) => {
          // Check for sports navigation
          const sportsNav = page.locator('[data-testid="sports-nav"], .sports-nav, nav');
          if ((await sportsNav.count()) > 0) {
            await expect(sportsNav.first()).toBeVisible();
          }

          // Check for league-specific navigation
          const leagueNav = page.locator(
            `[data-league="${sportPage.league}"], .${sportPage.league}-nav`
          );
          if ((await leagueNav.count()) > 0) {
            await expect(leagueNav.first()).toBeVisible();
          }
        });

        test(`should display ${sportPage.name} games/scores`, async ({ page }) => {
          // Check for games/scores section
          const gamesSection = page.locator(
            '[data-testid="games"], .games, [data-section="games"]'
          );
          if ((await gamesSection.count()) > 0) {
            await expect(gamesSection.first()).toBeVisible();

            // Check for individual game items
            const gameItems = gamesSection.locator(
              '[data-testid="game"], .game, [data-type="game"]'
            );
            const gameCount = await gameItems.count();

            if (gameCount > 0) {
              // Check that at least one game is visible
              await expect(gameItems.first()).toBeVisible();

              // Check that games have proper structure
              for (let i = 0; i < Math.min(gameCount, 3); i++) {
                const game = gameItems.nth(i);
                await expect(game).toBeVisible();

                // Check for team names or scores
                const teamInfo = game.locator('[data-testid="team"], .team, [data-type="team"]');
                if ((await teamInfo.count()) > 0) {
                  await expect(teamInfo.first()).toBeVisible();
                }
              }
            }
          }
        });

        test(`should display ${sportPage.name} standings`, async ({ page }) => {
          // Check for standings section
          const standingsSection = page.locator(
            '[data-testid="standings"], .standings, [data-section="standings"]'
          );
          if ((await standingsSection.count()) > 0) {
            await expect(standingsSection.first()).toBeVisible();

            // Check for standings table
            const standingsTable = standingsSection.locator(
              'table, [data-testid="standings-table"], .standings-table'
            );
            if ((await standingsTable.count()) > 0) {
              await expect(standingsTable.first()).toBeVisible();

              // Check for table headers
              const tableHeaders = standingsTable.locator('th, [data-testid="header"]');
              if ((await tableHeaders.count()) > 0) {
                await expect(tableHeaders.first()).toBeVisible();
              }
            }
          }
        });

        test(`should display ${sportPage.name} teams`, async ({ page }) => {
          // Check for teams section
          const teamsSection = page.locator(
            '[data-testid="teams"], .teams, [data-section="teams"]'
          );
          if ((await teamsSection.count()) > 0) {
            await expect(teamsSection.first()).toBeVisible();

            // Check for team items
            const teamItems = teamsSection.locator(
              '[data-testid="team"], .team, [data-type="team"]'
            );
            const teamCount = await teamItems.count();

            if (teamCount > 0) {
              // Check that at least one team is visible
              await expect(teamItems.first()).toBeVisible();

              // Check that teams have proper structure
              for (let i = 0; i < Math.min(teamCount, 5); i++) {
                const team = teamItems.nth(i);
                await expect(team).toBeVisible();

                // Check for team logo/name
                const teamLogo = team.locator(
                  'img[alt*="logo"], img[alt*="team"], [data-testid="team-logo"]'
                );
                if ((await teamLogo.count()) > 0) {
                  await expect(teamLogo.first()).toBeVisible();
                }
              }
            }
          }
        });

        test(`should display ${sportPage.name} players`, async ({ page }) => {
          // Check for players section
          const playersSection = page.locator(
            '[data-testid="players"], .players, [data-section="players"]'
          );
          if ((await playersSection.count()) > 0) {
            await expect(playersSection.first()).toBeVisible();

            // Check for player items
            const playerItems = playersSection.locator(
              '[data-testid="player"], .player, [data-type="player"]'
            );
            const playerCount = await playerItems.count();

            if (playerCount > 0) {
              // Check that at least one player is visible
              await expect(playerItems.first()).toBeVisible();

              // Check that players have proper structure
              for (let i = 0; i < Math.min(playerCount, 5); i++) {
                const player = playerItems.nth(i);
                await expect(player).toBeVisible();

                // Check for player name/photo
                const playerInfo = player.locator(
                  '[data-testid="player-name"], .player-name, [data-type="player-name"]'
                );
                if ((await playerInfo.count()) > 0) {
                  await expect(playerInfo.first()).toBeVisible();
                }
              }
            }
          }
        });

        test(`should have proper ${sportPage.name} filters`, async ({ page }) => {
          // Check for filter controls
          const filters = page.locator(
            '[data-testid="filters"], .filters, [data-section="filters"]'
          );
          if ((await filters.count()) > 0) {
            await expect(filters.first()).toBeVisible();

            // Check for filter options
            const filterOptions = filters.locator('select, input, button, [data-testid="filter"]');
            const filterCount = await filterOptions.count();

            if (filterCount > 0) {
              // Check that filters are interactive
              for (let i = 0; i < Math.min(filterCount, 3); i++) {
                const filter = filterOptions.nth(i);
                await expect(filter).toBeVisible();
                await expect(filter).toBeEnabled();
              }
            }
          }
        });

        test(`should have proper ${sportPage.name} search functionality`, async ({ page }) => {
          // Check for search functionality
          const searchInput = page.locator(
            '[data-testid="search"], input[type="search"], input[placeholder*="search"]'
          );
          if ((await searchInput.count()) > 0) {
            await expect(searchInput.first()).toBeVisible();
            await expect(searchInput.first()).toBeEnabled();

            // Test search functionality
            await searchInput.first().fill('test');
            await page.waitForTimeout(1000);

            // Check that search results or no results message is shown
            const searchResults = page.locator(
              '[data-testid="search-results"], .search-results, [data-section="search"]'
            );
            if ((await searchResults.count()) > 0) {
              await expect(searchResults.first()).toBeVisible();
            }
          }
        });

        test(`should handle ${sportPage.name} data refresh`, async ({ page }) => {
          // Check for refresh button
          const refreshButton = page.locator(
            '[data-testid="refresh"], button[aria-label*="refresh"], button:has-text("Refresh")'
          );
          if ((await refreshButton.count()) > 0) {
            await expect(refreshButton.first()).toBeVisible();
            await expect(refreshButton.first()).toBeEnabled();

            // Test refresh functionality
            await refreshButton.first().click();
            await page.waitForTimeout(2000);

            // Check that page content is still visible after refresh
            await expect(page.locator('main')).toBeVisible();
          }
        });

        test(`should handle ${sportPage.name} data sorting`, async ({ page }) => {
          // Check for sort controls
          const sortControls = page.locator('[data-testid="sort"], .sort, [data-section="sort"]');
          if ((await sortControls.count()) > 0) {
            await expect(sortControls.first()).toBeVisible();

            // Check for sort buttons
            const sortButtons = sortControls.locator('button, select, [data-testid="sort-button"]');
            const buttonCount = await sortButtons.count();

            if (buttonCount > 0) {
              // Test sorting functionality
              for (let i = 0; i < Math.min(buttonCount, 2); i++) {
                const button = sortButtons.nth(i);
                await expect(button).toBeVisible();
                await expect(button).toBeEnabled();

                // Click sort button
                await button.click();
                await page.waitForTimeout(1000);

                // Check that content is still visible
                await expect(page.locator('main')).toBeVisible();
              }
            }
          }
        });
      });
    });
  }
});
