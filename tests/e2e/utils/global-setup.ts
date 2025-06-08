/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
import { setupErrorHandling } from './test-utils';

// Extend the base test to add a beforeEach hook
export const test = base.extend({
  page: async ({ page }, use) => {
    // Setup error handling
    setupErrorHandling(page);
    
    // Use the page
    await use(page);
  },
});
