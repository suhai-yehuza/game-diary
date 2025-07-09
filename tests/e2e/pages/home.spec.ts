import { test, expect } from '@playwright/test';
import { runComprehensivePageTests } from '@tests/e2e/utils/page-suites';

test.describe.configure({ retries: 2 }); // TEMP: Retry flaky tests while stabilizing

// Run comprehensive page tests for home page
runComprehensivePageTests(test, '/', 'Home Page');
