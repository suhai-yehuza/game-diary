import { test } from '@playwright/test';
import { runContentPageTests } from '@tests/e2e/utils/page-suites';

// Register the content page tests for the home page ('/')
runContentPageTests(test, '/', 'Home Page');
