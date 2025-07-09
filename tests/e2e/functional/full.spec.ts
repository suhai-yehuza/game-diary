import { test } from '@playwright/test';
import { commonTestSetup } from '@tests/e2e/utils/setup';
import { runFullSuite } from '@tests/e2e/utils/page-tests';
import { clearTestData } from '@tests/e2e/utils/test-utils';

test.describe.configure({ mode: 'serial' }); // Enforce serial execution for test isolation

test.beforeEach(async ({ page }) => {
  await clearTestData(page);
  await commonTestSetup(page);
});

runFullSuite(test);
