# Page-Specific E2E Tests

This directory contains tests focused on specific pages or features of the application, organized in a progressive hierarchy for maximum efficiency and maintainability.

## Progressive Test Hierarchy

The page tests follow a progressive hierarchy that builds upon each level:

### 1. **Base Page Tests** (`base-page.spec.ts`)

- **Purpose**: Fundamental tests that ALL pages should pass
- **Tests**: Page loading, basic structure, navigation, accessibility, performance, console errors, footer
- **Usage**: Foundation for all page testing

### 2. **Content Page Tests** (`content-page.spec.ts`)

- **Purpose**: Extends base tests with content-specific validations
- **Tests**: Content sections, SEO elements, responsive behavior, theme switching, loading states, browser navigation
- **Usage**: Builds on base tests for content-heavy pages

### 3. **Interactive Page Tests** (`interactive-page.spec.ts`)

- **Purpose**: Extends content tests with interactive element validations
- **Tests**: CTA elements, auth modals, form interactions, button/link interactions, keyboard navigation, mouse interactions, error handling
- **Usage**: For pages with user interactions

### 4. **Comprehensive Page Tests** (`comprehensive-page.spec.ts`)

- **Purpose**: Extends interactive tests with advanced validations
- **Tests**: Social media links, contact info, legal links, viewport handling, network interruptions, focus management, dynamic content, ARIA attributes, rapid interactions, loading/error states
- **Usage**: Complete page coverage for critical pages

## Test Files

- **`base-page.spec.ts`** - Base page test suite (foundation)
- **`content-page.spec.ts`** - Content page test suite (extends base)
- **`interactive-page.spec.ts`** - Interactive page test suite (extends content)
- **`comprehensive-page.spec.ts`** - Comprehensive page test suite (extends interactive)
- **`home.spec.ts`** - Home page with comprehensive tests
- **`dashboard.spec.ts`** - Dashboard page with comprehensive tests + dashboard-specific tests
- **`sports.spec.ts`** - Sports pages with comprehensive tests + sports-specific tests
- **`clerk-auth.spec.ts`** - Auth modal tests with interactive tests + auth-specific tests

## Purpose

These tests are designed to:

1. **Follow DRY principles** - Common tests are defined once and reused
2. **Provide progressive coverage** - Each level builds on the previous
3. **Enable targeted testing** - Run tests for specific areas without duplication
4. **Support debugging** - Isolate issues to specific pages or features
5. **Maintain consistency** - All pages get the same base validation

## Usage

### Running All Page Tests

```bash
pnpm test:e2e:pages
```

### Running Progressive Hierarchy Tests

```bash
# Base tests only (fastest)
pnpm test:e2e:pages:base

# Content tests (includes base)
pnpm test:e2e:pages:content

# Interactive tests (includes content + base)
pnpm test:e2e:pages:interactive

# Comprehensive tests (includes all levels)
pnpm test:e2e:pages:comprehensive
```

### Running Specific Page Tests

```bash
# Home page tests (comprehensive)
pnpm test:e2e:pages:home

# Dashboard tests (comprehensive + specific)
pnpm test:e2e:pages:dashboard

# Sports pages tests (comprehensive + specific)
pnpm test:e2e:pages:sports

# Auth tests (interactive + specific)
pnpm test:e2e:pages:auth
```

## Configuration

All page tests use `playwright.pages.config.ts` which provides:

- Multiple browser support (Chromium, WebKit, Mobile Chrome)
- 2-4 workers for parallel execution
- Retry logic for flaky tests
- Comprehensive reporting

## Test Structure

Each progressive level includes:

1. **Base Level**: Essential page functionality
2. **Content Level**: Content structure and SEO
3. **Interactive Level**: User interactions and forms
4. **Comprehensive Level**: Advanced features and edge cases

## Best Practices

1. **Use the hierarchy** - Start with base tests, add specific tests as needed
2. **Extend, don't duplicate** - Each level calls the previous level's tests
3. **Add page-specific tests** - Use the comprehensive suite + add unique tests
4. **Handle async operations** - Use proper wait conditions
5. **Test across different viewports** - Ensure responsive behavior
6. **Mock external dependencies** - Avoid API rate limits
7. **Clean up test data** - Ensure tests don't leave side effects

## Adding New Page Tests

When adding a new page test:

1. **For simple pages**: Use `runComprehensivePageTests(test, '/path', 'Page Name')`
2. **For complex pages**: Use comprehensive tests + add specific tests in a separate describe block
3. **For unique pages**: Create custom test structure but reuse common utilities

### Example: Simple Page

```typescript
import { test } from '@playwright/test';
import { runComprehensivePageTests } from './comprehensive-page.spec';

test.describe('My Page', () => {
  runComprehensivePageTests(test, '/my-page', 'My Page');
});
```

### Example: Complex Page

```typescript
import { test, expect } from '@playwright/test';
import { runComprehensivePageTests } from './comprehensive-page.spec';

test.describe('My Complex Page', () => {
  // Run comprehensive tests
  runComprehensivePageTests(test, '/my-complex-page', 'My Complex Page');

  // Add page-specific tests
  test.describe('My Complex Page - Specific Tests', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/my-complex-page');
      await page.waitForLoadState('networkidle');
    });

    test('should have my specific feature', async ({ page }) => {
      // Your specific test here
    });
  });
});
```

## Integration with Functional Tests

Page tests complement the functional tests in the `../functional/` directory:

- **Functional tests** provide compound hierarchy testing with incremental coverage
- **Page tests** provide detailed, focused testing of specific areas with progressive hierarchy
- Both can be run independently or together for comprehensive coverage

See the main [README.md](../README.md) for more information about the overall test structure.
