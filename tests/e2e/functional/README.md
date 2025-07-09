# E2E Functional Tests - DRY Extensible Structure

This directory contains end-to-end functional tests organized in a DRY (Don't Repeat Yourself) pattern with extensible specs. Each test suite extends the previous one, building up from basic functionality to comprehensive coverage.

## Test Hierarchy

The tests follow this progression, where each level extends the previous:

```
sanity → smoke → critical → navigation → responsive → cross-browser → full
```

### 1. **sanity.spec.ts** (Base Level)

- **Purpose**: Fundamental requirements for the app
- **Scope**: Fast, reliable tests for critical functionality
- **Tests**:
  - Home page loads successfully
  - Sign-in modal shows and closes
  - NBA sports page loads
  - Basic navigation works

### 2. **smoke.spec.ts** (Extends Sanity)

- **Purpose**: Extends sanity with additional functionality
- **Scope**: More comprehensive coverage while maintaining speed
- **Tests**: All sanity tests +
  - All major sports pages load
  - Dashboard page loads
  - Basic accessibility
  - Basic performance
  - Major section navigation

### 3. **critical.spec.ts** (Extends Smoke)

- **Purpose**: Essential functionality and error handling
- **Scope**: Critical user flows and error scenarios
- **Tests**: All smoke tests +
  - Complete authentication flow
  - Sports data loading and display
  - Protected route access
  - Form validation
  - Error state handling
  - Browser navigation (back/forward)

### 4. **navigation.spec.ts** (Extends Critical)

- **Purpose**: Comprehensive navigation testing
- **Scope**: All aspects of navigation functionality
- **Tests**: All critical tests +
  - Sports pages navigation
  - Dashboard navigation
  - Protected routes navigation
  - Link navigation
  - Direct URL navigation
  - Query parameter navigation
  - Non-existent page navigation
  - Navigation performance
  - Deep linking
  - Navigation state preservation

### 5. **responsive.spec.ts** (Extends Navigation)

- **Purpose**: Comprehensive viewport testing
- **Scope**: App works correctly across all device sizes
- **Tests**: All navigation tests +
  - Multiple viewport sizes (mobile, tablet, desktop)
  - Responsive rendering
  - Viewport-specific navigation
  - Viewport-specific accessibility
  - Viewport-specific performance
  - Touch interactions (mobile/tablet)

### 6. **cross-browser.spec.ts** (Extends Responsive)

- **Purpose**: Browser compatibility testing
- **Scope**: App works correctly across different browsers and user agents
- **Tests**: All responsive tests +
  - Multiple user agents (Chrome, Firefox, Safari, Edge, mobile browsers)
  - Language support (multiple locales)
  - JavaScript functionality
  - CSS rendering
  - Performance across browsers
  - Screen density handling
  - Color scheme preferences
  - Reduced motion preferences
  - Network conditions (slow, offline)

### 7. **full.spec.ts** (Extends Cross-Browser)

- **Purpose**: Comprehensive end-to-end testing
- **Scope**: Complete coverage of all application functionality
- **Tests**: All cross-browser tests +
  - Comprehensive cross-browser compatibility
  - Advanced form interactions
  - Comprehensive keyboard navigation
  - Comprehensive mobile touch interactions
  - Comprehensive accessibility
  - Comprehensive SEO elements
  - Comprehensive security headers
  - Comprehensive error scenarios
  - Comprehensive performance testing
  - Comprehensive data validation
  - Comprehensive user interactions

### 8. **mock-verification.spec.ts** (Standalone)

- **Purpose**: Verify mock data functionality
- **Scope**: Ensures API mocking works correctly
- **Tests**:
  - Mock data for API calls
  - External API endpoint mocking
  - Live games endpoint handling

## DRY Benefits

### 1. **Code Reuse**

Each test suite exports its test functions, allowing higher-level suites to reuse them:

```typescript
// In smoke.spec.ts
export const smokeTests = {
  ...sanityTests, // Inherit all sanity tests
  testAllSportsPages: async (page: any) => {
    /* ... */
  },
  // ... additional smoke tests
};

// In critical.spec.ts
export const criticalTests = {
  ...smokeTests, // Inherit all smoke tests
  testAuthenticationFlow: async (page: any) => {
    /* ... */
  },
  // ... additional critical tests
};
```

### 2. **Progressive Testing**

Each level runs all previous levels' tests:

```typescript
// In critical.spec.ts
test('@critical should pass all smoke tests', async ({ page }) => {
  await smokeTests.testHomePageLoad(page);
  await smokeTests.testSignInModal(page);
  // ... run all smoke tests
});
```

### 3. **Maintainability**

- Changes to base tests automatically propagate to higher levels
- New functionality can be added at the appropriate level
- Test failures are isolated to specific levels

### 4. **Flexibility**

- Run only sanity tests for quick feedback
- Run smoke tests for basic coverage
- Run full tests for comprehensive validation
- Each level provides complete coverage up to that point

## Usage

### Running Specific Test Levels

```bash
# Run only sanity tests (fastest)
npx playwright test tests/e2e/functional/sanity.spec.ts

# Run smoke tests (includes sanity)
npx playwright test tests/e2e/functional/smoke.spec.ts

# Run critical tests (includes sanity + smoke)
npx playwright test tests/e2e/functional/critical.spec.ts

# Run full test suite (includes all levels)
npx playwright test tests/e2e/functional/full.spec.ts
```

### CI/CD Integration

```bash
# Quick feedback in CI
npx playwright test tests/e2e/functional/sanity.spec.ts

# Pre-deployment validation
npx playwright test tests/e2e/functional/critical.spec.ts

# Full validation before production
npx playwright test tests/e2e/functional/full.spec.ts
```

## Test Tags

Each test level uses appropriate tags for filtering:

- `@sanity` - Base level tests
- `@smoke` - Smoke level tests
- `@critical` - Critical level tests
- `@navigation` - Navigation level tests
- `@responsive` - Responsive level tests
- `@cross-browser` - Cross-browser level tests
- `@full` - Full level tests

## Best Practices

### 1. **Test Organization**

- Keep base tests simple and fast
- Add complexity progressively
- Each level should provide complete coverage up to that point

### 2. **Test Dependencies**

- Higher levels import and run lower level tests
- Export test functions for reuse
- Maintain clear separation of concerns

### 3. **Performance**

- Base tests should be very fast (< 30 seconds)
- Higher levels can take longer but should be reasonable
- Use appropriate timeouts and retries

### 4. **Maintenance**

- When adding new functionality, add it at the appropriate level
- Update higher levels to include new base tests
- Keep test functions focused and reusable

## Migration from Previous Structure

The previous structure had separate, overlapping test files. The new structure:

1. **Eliminates duplication** - Common tests are defined once
2. **Improves maintainability** - Changes propagate automatically
3. **Provides flexibility** - Run tests at any level
4. **Maintains coverage** - Each level provides complete coverage

## Future Enhancements

1. **Parallel Execution** - Run different levels in parallel
2. **Selective Testing** - Run specific test categories
3. **Performance Monitoring** - Track test execution times
4. **Coverage Reporting** - Measure coverage at each level
