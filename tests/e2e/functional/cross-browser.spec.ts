import { test } from '@playwright/test';
import { commonTestSetup } from '@tests/e2e/utils/setup';
import { runCrossBrowserSuite } from '@tests/e2e/utils/page-tests';
import { clearTestData } from '@tests/e2e/utils/test-utils';

test.describe.configure({ mode: 'serial', retries: 2 }); // Only enable serial if test isolation is required

test.beforeEach(async ({ page }) => {
  await clearTestData(page);
  await commonTestSetup(page);
});

runCrossBrowserSuite(test);
