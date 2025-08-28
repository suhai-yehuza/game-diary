import { test } from '@playwright/test';

import { commonTestSetup } from '@tests/e2e/utils/setup';
import { testSportsPagesWithScope } from '@tests/e2e/utils/shared-tests';

import { runSanitySuite } from './shared-suite-runners';

test.describe('Sanity Tests (Base Level)', () => {
  test.beforeEach(async ({ page }) => {
    await commonTestSetup(page);
  });

  test('should pass basic sanity checks', async ({ page }) => {
    await runSanitySuite(page);
  });

  test('@sanity should test sports page', async ({ page }) => {
    await testSportsPagesWithScope(page, {
      sport: 'nba',
      scope: 'single',
    });
  });
});
