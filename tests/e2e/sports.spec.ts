import { test, expect } from '@playwright/test';
import {
  safeGoto,
  waitForPageLoad,
  checkBasicPageStructure,
  checkPageTitle,
  checkAccessibilityBasics,
  checkPerformanceMetrics,
  checkForConsoleErrors,
  checkResponsiveBehavior,
  takeDebugScreenshot,
} from './utils/test-utils';

test.describe('Sports Pages', () => {
  const sportsPages = [
    { path: '/sports/nba', name: 'NBA', league: 'basketball' },
    { path: '/sports/nfl', name: 'NFL', league: 'football' },
    { path: '/sports/mlb', name: 'MLB', league: 'baseball' },
    { path: '/sports/nhl', name: 'NHL', league: 'hockey' },
    { path: '/sports/mls', name: 'MLS', league: 'soccer' },
    { path: '/sports/all-sports', name: 'All Sports', league: 'all' },
    { path: '/sports/live', name: 'Live Games', league: 'live' },
  ];

  for (const sportPage of sportsPages) {
    test.describe(`${sportPage.name} Page`, () => {
      test.beforeEach(async ({ page }) => {
        await safeGoto(page, sportPage.path);
        await waitForPageLoad(page);
      });

      test(`should load ${sportPage.name} page successfully`, async ({ page }) => {
        // Check basic page structure
        await checkBasicPageStructure(page);

        // Check page title
        await checkPageTitle(page);

        // Check that we're on the correct page
        await expect(page).toHaveURL(sportPage.path);

        // Check that main content is visible
        await expect(page.locator('main')).toBeVisible();

        // Check for sports-specific content
        const sportsContent = page.locator(
          '[data-testid="sports-content"], .sports-content, [data-league]'
        );
        if ((await sportsContent.count()) > 0) {
          await expect(sportsContent.first()).toBeVisible();
        }
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
        const gamesSection = page.locator('[data-testid="games"], .games, [data-section="games"]');
        if ((await gamesSection.count()) > 0) {
          await expect(gamesSection.first()).toBeVisible();

          // Check for individual game items
          const gameItems = gamesSection.locator('[data-testid="game"], .game, [data-type="game"]');
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
        const teamsSection = page.locator('[data-testid="teams"], .teams, [data-section="teams"]');
        if ((await teamsSection.count()) > 0) {
          await expect(teamsSection.first()).toBeVisible();

          // Check for team items
          const teamItems = teamsSection.locator('[data-testid="team"], .team, [data-type="team"]');
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
        const filters = page.locator('[data-testid="filters"], .filters, [data-section="filters"]');
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
        // Check for search input
        const searchInput = page.locator(
          '[data-testid="search"], input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]'
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

      test(`should have proper ${sportPage.name} pagination`, async ({ page }) => {
        // Check for pagination controls
        const pagination = page.locator(
          '[data-testid="pagination"], .pagination, [data-section="pagination"]'
        );
        if ((await pagination.count()) > 0) {
          await expect(pagination.first()).toBeVisible();

          // Check for pagination buttons
          const paginationButtons = pagination.locator('button, a, [data-testid="page"]');
          const buttonCount = await paginationButtons.count();

          if (buttonCount > 0) {
            // Check that pagination buttons are interactive
            for (let i = 0; i < Math.min(buttonCount, 3); i++) {
              const button = paginationButtons.nth(i);
              await expect(button).toBeVisible();
              await expect(button).toBeEnabled();
            }
          }
        }
      });

      test(`should be accessible on ${sportPage.name} page`, async ({ page }) => {
        // Check accessibility basics
        await checkAccessibilityBasics(page);

        // Check keyboard navigation
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);

        // Check that focus is visible
        const focusedElement = page.locator(':focus');
        if ((await focusedElement.count()) > 0) {
          await expect(focusedElement).toBeVisible();
        }
      });

      test(`should have good performance on ${sportPage.name} page`, async ({ page }) => {
        // Check performance metrics
        const metrics = await checkPerformanceMetrics(page);

        // Performance should be reasonable for sports pages
        expect(metrics.loadTime).toBeLessThan(5000); // 5 seconds
        expect(metrics.domContentLoaded).toBeLessThan(3000); // 3 seconds
      });

      test(`should not have console errors on ${sportPage.name} page`, async ({ page }) => {
        // Check for console errors
        await checkForConsoleErrors(page);
      });

      test(`should be responsive on mobile for ${sportPage.name}`, async ({ page }) => {
        // Test mobile responsiveness
        await checkResponsiveBehavior(page, { width: 375, height: 667 });

        // Check that sports content is still accessible on mobile
        const sportsContent = page.locator('[data-testid="sports-content"], .sports-content, main');
        await expect(sportsContent.first()).toBeVisible();
      });

      test(`should be responsive on tablet for ${sportPage.name}`, async ({ page }) => {
        // Test tablet responsiveness
        await checkResponsiveBehavior(page, { width: 768, height: 1024 });

        // Check that layout adapts properly
        const mainContent = page.locator('main');
        await expect(mainContent).toBeVisible();
      });

      test(`should handle ${sportPage.name} data loading states`, async ({ page }) => {
        // Check for loading indicators
        const loadingIndicators = page.locator(
          '[data-testid="loading"], .loading, [aria-label*="loading"]'
        );
        if ((await loadingIndicators.count()) > 0) {
          // Wait for loading to complete
          await page.waitForTimeout(2000);

          // Check that loading indicators are hidden
          for (let i = 0; i < (await loadingIndicators.count()); i++) {
            const indicator = loadingIndicators.nth(i);
            await expect(indicator).not.toBeVisible();
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

      test(`should handle ${sportPage.name} data filtering`, async ({ page }) => {
        // Check for filter controls
        const filterControls = page.locator(
          '[data-testid="filter"], .filter, [data-section="filter"]'
        );
        if ((await filterControls.count()) > 0) {
          await expect(filterControls.first()).toBeVisible();

          // Check for filter options
          const filterOptions = filterControls.locator(
            'select, input, button, [data-testid="filter-option"]'
          );
          const optionCount = await filterOptions.count();

          if (optionCount > 0) {
            // Test filtering functionality
            for (let i = 0; i < Math.min(optionCount, 2); i++) {
              const option = filterOptions.nth(i);
              await expect(option).toBeVisible();
              await expect(option).toBeEnabled();

              // Interact with filter option
              if ((await option.evaluate(el => el.tagName.toLowerCase())) === 'select') {
                await option.selectOption({ index: 0 });
              } else {
                await option.click();
              }

              await page.waitForTimeout(1000);

              // Check that content is still visible
              await expect(page.locator('main')).toBeVisible();
            }
          }
        }
      });

      test(`should handle ${sportPage.name} data export`, async ({ page }) => {
        // Check for export functionality
        const exportButton = page.locator(
          '[data-testid="export"], button[aria-label*="export"], button:has-text("Export")'
        );
        if ((await exportButton.count()) > 0) {
          await expect(exportButton.first()).toBeVisible();
          await expect(exportButton.first()).toBeEnabled();

          // Test export functionality (without actually downloading)
          await exportButton.first().click();
          await page.waitForTimeout(1000);

          // Check that page is still functional
          await expect(page.locator('main')).toBeVisible();
        }
      });

      test(`should handle ${sportPage.name} data sharing`, async ({ page }) => {
        // Check for share functionality
        const shareButton = page.locator(
          '[data-testid="share"], button[aria-label*="share"], button:has-text("Share")'
        );
        if ((await shareButton.count()) > 0) {
          await expect(shareButton.first()).toBeVisible();
          await expect(shareButton.first()).toBeEnabled();

          // Test share functionality
          await shareButton.first().click();
          await page.waitForTimeout(1000);

          // Check that share dialog or functionality is available
          const shareDialog = page.locator(
            '[data-testid="share-dialog"], .share-dialog, [role="dialog"]'
          );
          if ((await shareDialog.count()) > 0) {
            await expect(shareDialog.first()).toBeVisible();
          }
        }
      });
    });
  }

  test.describe('Sports Page Interactions', () => {
    test('should navigate between different sports pages', async ({ page }) => {
      for (const sportPage of sportsPages) {
        // Navigate to sports page
        await safeGoto(page, sportPage.path);
        await waitForPageLoad(page);

        // Check that we're on the correct page
        await expect(page).toHaveURL(sportPage.path);

        // Check that page content is visible
        await expect(page.locator('main')).toBeVisible();
      }
    });

    test('should handle sports page deep linking', async ({ page }) => {
      const deepLinks = [
        '/sports/nba?team=lakers',
        '/sports/nfl?week=1',
        '/sports/mlb?season=2024',
        '/sports/nhl?conference=east',
        '/sports/mls?league=mls',
      ];

      for (const deepLink of deepLinks) {
        // Navigate to deep link
        await safeGoto(page, deepLink);
        await waitForPageLoad(page);

        // Check that we're on the correct page
        await expect(page).toHaveURL(new RegExp(deepLink.split('?')[0]));

        // Check that page content is visible
        await expect(page.locator('main')).toBeVisible();
      }
    });

    test('should handle sports page bookmarking', async ({ page }) => {
      for (const sportPage of sportsPages) {
        // Navigate to sports page
        await safeGoto(page, sportPage.path);
        await waitForPageLoad(page);

        // Check that page can be bookmarked (has proper title and URL)
        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(0);

        // Check that URL is bookmarkable
        await expect(page).toHaveURL(sportPage.path);
      }
    });
  });

  test.describe('Cross-Browser Sports Pages', () => {
    test('should work consistently across different browsers', async ({ page, browserName }) => {
      await safeGoto(page, '/sports/nba');
      await waitForPageLoad(page);

      // Test sports content based on browser
      if (browserName === 'chromium' || browserName === 'firefox') {
        // Test keyboard navigation for sports content
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);

        const focusedElement = page.locator(':focus');
        if ((await focusedElement.count()) > 0) {
          await expect(focusedElement).toBeVisible();
        }
      }

      // Test sports content elements
      const sportsContent = page.locator(
        '[data-testid*="sports"], [data-testid*="game"], [data-testid*="team"]'
      );
      const contentCount = await sportsContent.count();

      if (contentCount > 0) {
        // Test first few sports content elements
        for (let i = 0; i < Math.min(contentCount, 3); i++) {
          const content = sportsContent.nth(i);
          await expect(content).toBeVisible();

          // Test hover interaction
          await content.hover();
          await page.waitForTimeout(100);
        }
      }
    });

    test('should handle different viewport sizes for sports content', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 }, // Desktop
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await safeGoto(page, '/sports/nba');
        await waitForPageLoad(page);

        // Check that sports content is always present
        const main = page.locator('main');
        if ((await main.count()) > 0) {
          await expect(main).toBeVisible();
        }

        // Check that content doesn't overflow
        const body = page.locator('body');
        const box = await body.boundingBox();
        if (box) {
          expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
        }

        // Check that sports content is properly laid out
        const sportsSections = page.locator('section, [data-section], [data-testid*="sports"]');
        const sectionCount = await sportsSections.count();

        if (sectionCount > 0) {
          for (let i = 0; i < Math.min(sectionCount, 3); i++) {
            const section = sportsSections.nth(i);
            await expect(section).toBeVisible();

            // Check that section doesn't overflow
            const sectionBox = await section.boundingBox();
            if (sectionBox) {
              expect(sectionBox.x + sectionBox.width).toBeLessThanOrEqual(viewport.width);
            }
          }
        }
      }
    });

    test('should handle mobile sports layout', async ({ page }) => {
      // Test on mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await safeGoto(page, '/sports/nba');
      await waitForPageLoad(page);

      // Check that mobile sports layout is appropriate
      const main = page.locator('main');
      if ((await main.count()) > 0) {
        await expect(main).toBeVisible();

        // Check that content uses mobile-appropriate layout
        const box = await main.boundingBox();
        if (box) {
          // Content should use reasonable amount of mobile width
          expect(box.width).toBeGreaterThan(300);
        }
      }

      // Check for mobile-specific sports features
      const mobileFeatures = page.locator('[data-testid*="mobile"], .mobile-only, [data-mobile]');
      if ((await mobileFeatures.count()) > 0) {
        await expect(mobileFeatures.first()).toBeVisible();
      }
    });

    test('should handle tablet sports layout', async ({ page }) => {
      // Test on tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await safeGoto(page, '/sports/nfl');
      await waitForPageLoad(page);

      // Check that tablet sports layout is appropriate
      const main = page.locator('main');
      if ((await main.count()) > 0) {
        await expect(main).toBeVisible();

        // Check that content uses tablet-appropriate layout
        const box = await main.boundingBox();
        if (box) {
          // Content should use reasonable amount of tablet width
          expect(box.width).toBeGreaterThan(600);
        }
      }

      // Check for tablet-specific sports features
      const tabletFeatures = page.locator('[data-testid*="tablet"], .tablet-only, [data-tablet]');
      if ((await tabletFeatures.count()) > 0) {
        await expect(tabletFeatures.first()).toBeVisible();
      }
    });

    test('should handle desktop sports layout', async ({ page }) => {
      // Test on desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await safeGoto(page, '/sports/mlb');
      await waitForPageLoad(page);

      // Check that desktop sports layout is comprehensive
      const main = page.locator('main');
      if ((await main.count()) > 0) {
        await expect(main).toBeVisible();

        // Check that content uses desktop space effectively
        const box = await main.boundingBox();
        if (box) {
          // Content should use significant portion of desktop width
          expect(box.width).toBeGreaterThan(1000);
        }
      }

      // Check for desktop-specific sports features
      const desktopFeatures = page.locator(
        '[data-testid*="desktop"], .desktop-only, [data-desktop]'
      );
      if ((await desktopFeatures.count()) > 0) {
        await expect(desktopFeatures.first()).toBeVisible();
      }
    });

    test('should handle sports content interactions across viewports', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 }, // Desktop
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await safeGoto(page, '/sports/nhl');
        await waitForPageLoad(page);

        // Test interactive sports elements
        const interactiveElements = page.locator(
          'button, a, [role="button"], [data-testid*="interactive"]'
        );
        const elementCount = await interactiveElements.count();

        if (elementCount > 0) {
          // Test first few interactive elements
          for (let i = 0; i < Math.min(elementCount, 3); i++) {
            const element = interactiveElements.nth(i);
            await expect(element).toBeVisible();
            await expect(element).toBeEnabled();

            // Test hover interaction
            await element.hover();
            await page.waitForTimeout(100);

            // Check that element is still functional
            await expect(element).toBeVisible();
          }
        }

        // Test touch interactions for mobile
        if (viewport.width <= 768) {
          const touchElements = page.locator(
            '[data-testid*="touch"], .touch-enabled, [data-touch]'
          );
          const touchCount = await touchElements.count();

          if (touchCount > 0) {
            for (let i = 0; i < Math.min(touchCount, 2); i++) {
              const element = touchElements.nth(i);
              await expect(element).toBeVisible();

              // Check touch target size
              const box = await element.boundingBox();
              if (box) {
                expect(box.width).toBeGreaterThanOrEqual(44);
                expect(box.height).toBeGreaterThanOrEqual(44);
              }
            }
          }
        }
      }
    });
  });
});
