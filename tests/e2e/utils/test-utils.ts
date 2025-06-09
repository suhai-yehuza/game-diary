import { expect, type Page } from '@playwright/test';
import { setupTestAuth } from './auth-utils';
import { seedLogger } from 'lib/core/logger';

/**
 * Mock data for live games
 */
const MOCK_LIVE_GAMES_DATA = {
  data: {
    liveGames: {
      edges: [
        {
          cursor: 'cursor1',
          node: {
            id: '15458',
            league: 'NBA',
            season: 2024,
            stage: 3,
            date: {
              start: new Date().toISOString(),
              end: null,
              duration: null,
            },
            status: {
              clock: '10:46',
              halftime: false,
              short: '2',
              long: 'In Play',
            },
            periods: {
              current: 2,
              total: 4,
              endOfPeriod: false,
            },
            arena: {
              name: 'Paycom Center',
              city: 'Oklahoma City',
              state: 'OK',
              country: 'USA',
            },
            teams: {
              visitors: {
                id: '15',
                name: 'Indiana Pacers',
                nickname: 'Pacers',
                code: 'IND',
                logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/c/cf/Pacers_de_l%27Indiana_logo.svg/1180px-Pacers_de_l%27Indiana_logo.svg.png',
              },
              home: {
                id: '25',
                name: 'Oklahoma City Thunder',
                nickname: 'Thunder',
                code: 'OKC',
                logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Oklahoma_City_Thunder.svg/836px-Oklahoma_City_Thunder.svg.png',
              },
            },
            scores: {
              visitors: {
                win: 42,
                loss: 18,
                series: {
                  win: 2,
                  loss: 1,
                },
                linescore: [24, 18, 0, 0],
                points: 42,
              },
              home: {
                win: 38,
                loss: 22,
                series: {
                  win: 1,
                  loss: 2,
                },
                linescore: [22, 20, 0, 0],
                points: 42,
              },
            },
            officials: ['James Capers', 'Scott Foster'],
            timesTied: 3,
            leadChanges: 8,
            nugget: 'Game tied at halftime',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        {
          cursor: 'cursor2',
          node: {
            id: '15459',
            league: 'NBA',
            season: 2024,
            stage: 3,
            date: {
              start: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
              end: null,
              duration: null,
            },
            status: {
              clock: '5:23',
              halftime: false,
              short: '4',
              long: 'In Play',
            },
            periods: {
              current: 4,
              total: 4,
              endOfPeriod: false,
            },
            arena: {
              name: 'Chase Center',
              city: 'San Francisco',
              state: 'CA',
              country: 'USA',
            },
            teams: {
              visitors: {
                id: '9',
                name: 'Denver Nuggets',
                nickname: 'Nuggets',
                code: 'DEN',
                logo: 'https://upload.wikimedia.org/wikipedia/en/7/76/Denver_Nuggets.svg',
              },
              home: {
                id: '11',
                name: 'Golden State Warriors',
                nickname: 'Warriors',
                code: 'GSW',
                logo: 'https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg',
              },
            },
            scores: {
              visitors: {
                win: 45,
                loss: 15,
                series: {
                  win: 3,
                  loss: 0,
                },
                linescore: [28, 25, 24, 18],
                points: 95,
              },
              home: {
                win: 38,
                loss: 22,
                series: {
                  win: 0,
                  loss: 3,
                },
                linescore: [22, 31, 26, 23],
                points: 102,
              },
            },
            officials: ['Tony Brothers', 'Ed Malloy'],
            timesTied: 12,
            leadChanges: 24,
            nugget: 'Close game in the 4th quarter',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        {
          cursor: 'cursor3',
          node: {
            id: '15460',
            league: 'NBA',
            season: 2024,
            stage: 3,
            date: {
              start: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
              end: null,
              duration: null,
            },
            status: {
              clock: '0:00',
              halftime: true,
              short: 'HT',
              long: 'Halftime',
            },
            periods: {
              current: 2,
              total: 4,
              endOfPeriod: true,
            },
            arena: {
              name: 'TD Garden',
              city: 'Boston',
              state: 'MA',
              country: 'USA',
            },
            teams: {
              visitors: {
                id: '20',
                name: 'Miami Heat',
                nickname: 'Heat',
                code: 'MIA',
                logo: 'https://upload.wikimedia.org/wikipedia/en/f/fb/Miami_Heat_logo.svg',
              },
              home: {
                id: '2',
                name: 'Boston Celtics',
                nickname: 'Celtics',
                code: 'BOS',
                logo: 'https://upload.wikimedia.org/wikipedia/en/8/8f/Boston_Celtics.svg',
              },
            },
            scores: {
              visitors: {
                win: 35,
                loss: 25,
                series: {
                  win: 1,
                  loss: 1,
                },
                linescore: [28, 29, 0, 0],
                points: 57,
              },
              home: {
                win: 48,
                loss: 12,
                series: {
                  win: 1,
                  loss: 1,
                },
                linescore: [32, 27, 0, 0],
                points: 59,
              },
            },
            officials: ['Marc Davis', 'John Goble'],
            timesTied: 5,
            leadChanges: 11,
            nugget: 'Tight game at halftime',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      ],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: 'cursor1',
        endCursor: 'cursor3',
      },
      totalCount: 3,
    },
  },
};

/**
 * Mock data for empty live games (no games currently live)
 */
const MOCK_EMPTY_LIVE_GAMES_DATA = {
  data: {
    liveGames: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: 0,
    },
  },
};

/**
 * Wait for the page to fully load including all network requests
 */
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  // Wait for DOM to be ready instead of arbitrary timeout
  await page.waitForFunction(() => document.readyState === 'complete');
}

/**
 * Gets the primary main element from the page
 * In our app, the primary main element has the 'grow' class
 */
export async function getPrimaryMainElement(page: Page) {
  return page.locator('main.grow').first();
}

/**
 * Waits for the page content to be fully loaded and interactive
 */
export async function waitForPageContent(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  await page.waitForFunction(() => {
    const mainElements = document.querySelectorAll('main');
    return Array.from(mainElements).some(
      main =>
        window.getComputedStyle(main).display !== 'none' &&
        window.getComputedStyle(main).visibility !== 'hidden'
    );
  });

  // Wait for any loading text to disappear
  await page
    .waitForSelector('text=Loading games...', { state: 'hidden', timeout: 10000 })
    .catch(() => {
      // Ignore if no loading text is found
    });
}

/**
 * Sets up API mocking for the test environment
 */
export async function setupApiMocking(page: Page, withAuth = false, options: { emptyLiveGames?: boolean } = {}) {
  // Mock GraphQL API calls
  await page.route('**/api/graphql', async route => {
    const request = route.request();
    const postData = request.postData();
    let mockResponse;

    try {
      if (!postData) {
        throw new Error('No post data found');
      }

      const { query } = JSON.parse(postData);

      if (query.includes('liveGames')) {
        mockResponse = options.emptyLiveGames ? MOCK_EMPTY_LIVE_GAMES_DATA : MOCK_LIVE_GAMES_DATA;
      } else if (query.includes('notifications')) {
        mockResponse = {
          data: {
            notifications: [],
          },
        };
      } else if (query.includes('games')) {
        mockResponse = {
          data: {
            games: {
              edges: [],
              pageInfo: {
                hasNextPage: false,
                endCursor: null,
              },
            },
          },
        };
      } else {
        // Default mock response for other queries
        mockResponse = {
          data: {},
        };
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse),
      });
    } catch {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: {} }),
      });
    }
  });

  // Mock cache API calls
  await page.route('**/api/cache*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });

  // Mock other API calls
  await page.route('**/api/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });

  // Setup authentication if requested
  if (withAuth) {
    await setupTestAuth(page);
  }
}

/**
 * Enhanced safe navigation with API mocking and retry logic
 */
export async function safeGotoWithMocking(page: Page, url: string) {
  await setupApiMocking(page);
  await page.goto(url);
  await waitForPageContent(page);
}

/**
 * Common test pattern: setup mocking, navigate, and wait for content
 * This is the most frequently used pattern in our tests
 */
export async function navigateWithMocking(page: Page, url: string, options: { emptyLiveGames?: boolean } = {}) {
  await setupApiMocking(page, false, options);
  await page.goto(url);
  await waitForPageContent(page);
}

/**
 * Change viewport size and wait for layout to stabilize
 * Better alternative to waitForTimeout after viewport changes
 */
export const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  large: { width: 2560, height: 1440 },
} as const;

export type ViewportSize = (typeof VIEWPORTS)[keyof typeof VIEWPORTS];

export async function setViewportAndWaitForLayout(page: Page, size: ViewportSize) {
  await page.setViewportSize(size);
  await page.waitForLoadState('networkidle');
}

/**
 * Check if an element exists without failing the test
 */
async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector);
    await element.waitFor({ timeout: 1000 });
    return await element.isVisible();
  } catch {
    return false;
  }
}

/**
 * Safe navigation with error handling (original version)
 */
export async function safeGoto(page: Page, url: string) {
  await page.goto(url);
  await waitForPageLoad(page);
}

/**
 * Check for common page elements that should be present
 */
export async function checkBasicPageStructure(page: Page) {
  // Check for basic HTML structure
  await expect(page.locator('html')).toBeVisible();
  await expect(page.locator('body')).toBeVisible();

  // Check for main content area
  const hasMain = await elementExists(page, 'main');
  const hasContentDiv = await elementExists(page, '[role="main"], .main-content, #main');

  if (!hasMain && !hasContentDiv) {
    seedLogger.warn('No main content area found on page');
  }
}

/**
 * Expands the mobile menu if needed based on viewport size
 */
export async function expandMobileMenuIfNeeded(page: Page): Promise<void> {
  const viewport = page.viewportSize();
  if (!viewport || viewport.width >= 1024) {
    return; // Not mobile, menu should be visible
  }

  // Check if menu is already expanded by looking for visible navigation links
  const menuButton = page.getByRole('button', { name: /menu/i });
  const isMenuButtonVisible = await menuButton.isVisible();

  if (!isMenuButtonVisible) {
    return; // No menu button, navigation should be visible
  }

  // Check if navigation is already visible
  const nbaLink = page.getByRole('link', { name: /nba/i });
  const isNavVisible = await nbaLink.isVisible();

  if (isNavVisible) {
    return; // Navigation is already visible
  }

  // Click menu button to expand
  await menuButton.click();

  // Wait for animation and menu to expand
  await page.waitForTimeout(300);

  // Wait for navigation links to become visible
  await expect(nbaLink).toBeVisible({ timeout: 5000 });
}

/**
 * Tests the page's responsiveness across different viewports
 */
export async function testResponsiveness(
  page: Page,
  testCallback: (viewport: string) => Promise<void>
) {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 },
  ];

  for (const viewport of viewports) {
    seedLogger.info(`[SEED] INFO Testing viewport: ${viewport.name}`);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    // Wait for layout to stabilize
    await page.waitForFunction(() => {
      const mainElements = document.querySelectorAll('main');
      return Array.from(mainElements).some(
        main =>
          window.getComputedStyle(main).display !== 'none' &&
          window.getComputedStyle(main).visibility !== 'hidden'
      );
    });

    // Expand mobile menu if needed
    await expandMobileMenuIfNeeded(page);

    await testCallback(viewport.name);
  }
}

/**
 * Sets up error handling for the test environment
 */
export function setupErrorHandling(page: Page) {
  // Handle console errors more gracefully
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore Apollo Client errors about mocked responses
      if (text.includes('go.apollo.dev/c/err') && text.includes('mocked_response')) {
        return;
      }
      // Log other errors but don't throw
      console.error('Console error:', text);
    }
  });

  // Handle unhandled rejections
  page.on('pageerror', error => {
    console.error('Page error:', error);
  });
}
