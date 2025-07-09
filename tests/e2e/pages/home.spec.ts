import { test, expect } from '@playwright/test';
import { runComprehensivePageTests } from './comprehensive-page.spec';

test.describe.configure({ retries: 2 }); // TEMP: Retry flaky tests while stabilizing

test.describe('Home Page', () => {
  // Run comprehensive page tests for home page
  runComprehensivePageTests(test, '/', 'Home Page');
});
