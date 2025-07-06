# Page-Specific E2E Tests

This directory contains tests focused on specific pages or features of the application.

## Test Files

- **`home.spec.ts`** - Home page functionality and layout testing
- **`navigation.spec.ts`** - Navigation between pages and routes testing
- **`auth.spec.ts`** - Authentication flows and user management testing
- **`dashboard.spec.ts`** - Dashboard functionality and user interface testing
- **`sports.spec.ts`** - Sports pages and data display testing
- **`cross-browser.spec.ts`** - Cross-browser compatibility testing

## Purpose

These tests are designed to:

1. **Focus on specific functionality** - Each test file targets a particular page or feature
2. **Provide detailed coverage** - Comprehensive testing of page-specific behaviors
3. **Enable targeted testing** - Run tests for specific areas without running the entire suite
4. **Support debugging** - Isolate issues to specific pages or features

## Usage

### Running All Page Tests

```bash
pnpm test:e2e:pages
```

### Running Specific Page Tests

```bash
# Home page tests
pnpm test:e2e:pages:home

# Navigation tests
pnpm test:e2e:navigation

# Authentication tests
pnpm test:e2e:clerk-auth

# Dashboard tests
pnpm test:e2e:pages:dashboard

# Sports pages tests
pnpm test:e2e:pages:sports

# Cross-browser tests
pnpm test:e2e:cross-browser
```

## Configuration

All page tests use `playwright.popular.config.ts` which provides:

- Multiple browser support (Chromium, WebKit, Mobile Chrome)
- 2-4 workers for parallel execution
- Retry logic for flaky tests
- Comprehensive reporting

## Test Structure

Each page test file typically includes:

1. **Page loading tests** - Verify pages load correctly
2. **UI element tests** - Check for expected elements and their states
3. **Interaction tests** - Test user interactions (clicks, form inputs, etc.)
4. **Navigation tests** - Verify internal and external navigation
5. **Error handling tests** - Test error states and edge cases
6. **Accessibility tests** - Ensure accessibility compliance
7. **Performance tests** - Validate page performance metrics

## Best Practices

1. **Use descriptive test names** - Make it clear what each test validates
2. **Test both positive and negative scenarios** - Include error cases
3. **Use page objects** - Organize selectors and actions in page objects
4. **Handle async operations** - Use proper wait conditions
5. **Test across different viewports** - Ensure responsive behavior
6. **Mock external dependencies** - Avoid API rate limits
7. **Clean up test data** - Ensure tests don't leave side effects

## Adding New Page Tests

When adding a new page test:

1. Create a new file following the naming convention: `{page-name}.spec.ts`
2. Add a corresponding script in `package.json`
3. Include comprehensive testing for the specific page/feature
4. Follow the established patterns from existing page tests
5. Update this README with the new test information

## Integration with Functional Tests

Page tests complement the functional tests in the `../functional/` directory:

- **Functional tests** provide compound hierarchy testing with incremental coverage
- **Page tests** provide detailed, focused testing of specific areas
- Both can be run independently or together for comprehensive coverage

See the main [README.md](../README.md) for more information about the overall test structure.
