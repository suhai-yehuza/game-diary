# E2E Compound Test Structure

## Overview

This document describes the new compound hierarchy structure for end-to-end tests, where each level extends the tests from the level below it. This approach provides incremental testing with comprehensive coverage while maintaining fast feedback for development.

## Test Hierarchy

```
Mock Verification (Prerequisite) → Fast (Base) → Smoke → Critical → Responsive → Full
```

### 0. Mock Verification (Prerequisite)

- **File:** `tests/e2e/mock-verification.spec.ts`
- **Tags:** `@fast`
- **Purpose:** Validates that API mocking infrastructure is working correctly
- **Configuration:** `playwright.fast.config.ts`

**Tests include:**

- Verification that mock data is used for API calls
- Validation that external API endpoints are properly mocked
- Confirmation that live games endpoint works with mocking
- Prevention of API rate limiting issues

### 1. Fast Tests (Base Level)

- **File:** `tests/e2e/fast.spec.ts`
- **Tags:** `@fast`
- **Purpose:** Basic smoke tests for quick feedback during development (includes mock verification)
- **Configuration:** `playwright.fast.config.ts` (Chromium only, 1 worker, no retries)

**Tests include:**

- Mock verification (prerequisite)
- Basic page loading (home, sign-in, sign-up, NBA sports)
- Simple navigation between pages
- Basic page structure validation
- Console error checking

### 2. Smoke Tests (Extends Fast)

- **File:** `tests/e2e/smoke.spec.ts`
- **Tags:** `@smoke`
- **Purpose:** Extended smoke tests with additional critical functionality
- **Configuration:** `playwright.fast.config.ts`

**Tests include:**

- All fast tests (imported and extended)
- All major sports pages loading
- Dashboard page loading
- Form interaction testing
- Basic accessibility checks
- Performance metrics validation
- Navigation between major sections

### 3. Critical Tests (Extends Smoke)

- **File:** `tests/e2e/critical.spec.ts`
- **Tags:** `@critical`
- **Purpose:** Core user flows and critical functionality
- **Configuration:** `playwright.popular.config.ts`

**Tests include:**

- All smoke tests (imported and extended)
- Complete user authentication flow
- Sports data loading and display
- Protected route access
- Form validation
- Error state handling
- Browser navigation (back/forward)

### 4. Responsive Tests (Extends Critical)

- **File:** `tests/e2e/responsive.spec.ts`
- **Tags:** `@responsive`
- **Purpose:** Responsive design testing across multiple viewports
- **Configuration:** `playwright.popular.config.ts`

**Tests include:**

- All critical tests (imported and extended)
- Multi-viewport testing (mobile, tablet, desktop)
- Responsive behavior validation
- Touch interaction testing
- Mobile navigation testing
- Accessibility across devices
- Performance on different screen sizes

### 5. Full Tests (Extends Responsive)

- **File:** `tests/e2e/full.spec.ts`
- **Tags:** `@full`
- **Purpose:** Comprehensive testing including edge cases and advanced scenarios
- **Configuration:** `playwright.popular.config.ts`

**Tests include:**

- All responsive tests (imported and extended)
- Cross-browser compatibility
- Advanced form interactions
- Comprehensive keyboard navigation
- Mobile touch interactions
- Comprehensive accessibility testing
- SEO elements validation
- Security headers checking
- Edge cases and error scenarios
- Performance under load
- Data persistence and state management
- Concurrent user interactions

## Usage

### Development Workflow

```bash
# Quick feedback during development
pnpm test:e2e:quickie

# Basic validation before committing
pnpm test:e2e:smoke

# Pre-deployment validation
pnpm test:e2e:critical

# Full validation (comprehensive)
pnpm test:e2e:full
```

### Compound Test Runner

The compound test runner demonstrates the hierarchy by running tests in sequence:

```bash
# Run all tests in sequence (Fast → Smoke → Critical → Responsive → Full)
pnpm test:e2e:compound

# Run specific levels only
pnpm test:e2e:compound:quickie
pnpm test:e2e:compound:smoke
pnpm test:e2e:compound:critical
pnpm test:e2e:compound:responsive
pnpm test:e2e:compound:full
```

### CI/CD Integration

```bash
# Development validation
pnpm validate:ci && pnpm test:e2e:smoke

# Pre-deployment validation
pnpm validate:ci && pnpm test:e2e:critical

# Full validation
pnpm validate:ci && pnpm test:e2e:full
```

## Implementation Details

### File Structure

```
tests/e2e/
├── mock-verification.spec.ts       # Prerequisite tests
├── fast.spec.ts                    # Base level tests (includes mock verification)
├── smoke.spec.ts                   # Extends fast
├── critical.spec.ts                # Extends smoke
├── responsive.spec.ts              # Extends critical
├── full.spec.ts                    # Extends responsive
├── utils/
│   └── test-utils.ts              # Shared utilities
└── README.md                       # Documentation
```

### Import Chain

Each level imports the previous level to maintain the compound structure:

```typescript
// fast.spec.ts
import './mock-verification.spec';

// smoke.spec.ts
import './fast.spec';

// critical.spec.ts
import './smoke.spec';

// responsive.spec.ts
import './critical.spec';

// full.spec.ts
import './responsive.spec';
```

### Test Utilities

All tests use shared utilities from `utils/test-utils.ts`:

- `safeGoto()` - Safe page navigation with error handling
- `safeGotoWithMocking()` - Navigation with API mocking
- `checkBasicPageStructure()` - Basic page structure validation
- `checkAccessibilityBasics()` - Accessibility testing
- `checkPerformanceMetrics()` - Performance validation
- `checkResponsiveBehavior()` - Responsive design testing
- `setupE2EMocking()` - API mocking setup

## Benefits

### 1. Incremental Testing

- Each level builds upon the previous, ensuring comprehensive coverage
- Tests are organized by complexity and importance
- Easy to understand what each level covers

### 2. Fast Feedback

- Developers can run fast tests for quick validation
- Smoke tests provide basic confidence before committing
- Critical tests validate core functionality before deployment

### 3. CI/CD Optimization

- Different levels for different deployment stages
- Fast tests for development feedback
- Critical tests for pre-deployment validation
- Full tests for comprehensive validation

### 4. Maintainability

- Shared test logic reduces duplication
- Clear separation of concerns
- Easy to add new test levels or extend existing ones

### 5. Scalability

- Easy to add new test levels
- Easy to extend existing levels
- Clear guidelines for where to add new tests

## Best Practices

### 1. Test Organization

- Use appropriate tags: `@fast`, `@smoke`, `@critical`, `@responsive`, `@full`
- Always import the previous level to maintain the compound structure
- Keep tests focused on their level's purpose

### 2. Test Implementation

- Use shared utilities for consistency
- Handle errors gracefully with try-catch blocks and fallback selectors
- Mock external dependencies to avoid API rate limits
- Test across viewports in responsive and full tests
- Include accessibility checks in smoke and above
- Include performance validation in smoke and above

### 3. Adding New Tests

- **Fast Level:** Add basic functionality tests
- **Smoke Level:** Add extended functionality tests
- **Critical Level:** Add user flow tests
- **Responsive Level:** Add viewport-specific tests
- **Full Level:** Add comprehensive and edge case tests

### 4. Configuration

- Use appropriate Playwright configurations for each level
- Fast tests use minimal configuration for speed
- Higher levels use more comprehensive configurations
- Consider browser coverage and retry strategies

## Troubleshooting

### Common Issues

1. **Tests failing due to API rate limits:**

   - Use `setupE2EMocking()` in test setup
   - Use `safeGotoWithMocking()` for navigation

2. **Flaky tests:**

   - Increase retries in test configuration
   - Add proper wait conditions
   - Use `waitForPageLoad()` and `waitForLoadState()`

3. **Responsive tests failing:**

   - Check viewport size settings
   - Verify mobile/desktop configurations
   - Use appropriate device scale factors

4. **Performance test failures:**
   - Adjust timeout values based on environment
   - Consider network conditions
   - Use appropriate performance thresholds

### Debug Commands

```bash
# Run tests with UI for debugging
pnpm test:e2e:debug:ui

# Run specific test file
pnpm playwright test tests/e2e/fast.spec.ts

# Run tests with specific grep pattern
pnpm playwright test --grep @fast

# Run tests with headed browser
pnpm playwright test --headed
```

## Migration Guide

### From Old Structure

If migrating from the old test structure:

1. **Identify test categories:** Map existing tests to appropriate levels
2. **Reorganize tests:** Move tests to appropriate spec files
3. **Update imports:** Ensure proper import chains
4. **Update scripts:** Use new compound test scripts
5. **Update CI/CD:** Use appropriate test levels for different stages

### Adding New Features

When adding new features:

1. **Start with fast tests:** Add basic functionality tests
2. **Extend to smoke tests:** Add extended functionality tests
3. **Add critical tests:** Add user flow tests
4. **Add responsive tests:** Add viewport-specific tests
5. **Add full tests:** Add comprehensive and edge case tests

## Conclusion

The compound test structure provides a scalable, maintainable, and efficient approach to end-to-end testing. By organizing tests in a hierarchy where each level extends the previous, we ensure comprehensive coverage while maintaining fast feedback for development.

This structure supports different testing needs:

- **Development:** Fast and smoke tests for quick feedback
- **Pre-deployment:** Critical tests for core functionality validation
- **Full validation:** Comprehensive testing for major releases

The compound approach makes it easy to understand what each test level covers and ensures that higher-level tests include all the validation from lower levels.
