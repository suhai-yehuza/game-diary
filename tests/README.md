# Test Directory Structure

This directory contains all test files for the application with comprehensive coverage enforcement.

## Directory Structure

```
tests/
├── unit/                    # Unit tests with comprehensive coverage
│   ├── app/                 # Mirror src/app/ structure exactly
│   │   ├── dashboard/       # Mirror src/app//
│   │   │   └── dashboard.test.tsx
│   │   ├── protected/       # Mirror src/app/protected/
│   │   │   ├── admin/       # Mirror src/app/protected/admin/
│   │   │   │   └── database/ # Mirror src/app/protected/admin/database/
│   │   │   │       └── admin-database.test.tsx
│   │   │   ├── client/      # Mirror src/app/protected/client/
│   │   │   │   └── protected-client-page.test.tsx
│   │   │   └── protected-layout.test.tsx
│   │   ├── sports/          # Mirror src/app/sports/
│   │   │   ├── all-sports/  # Mirror src/app/sports/all-sports/
│   │   │   │   └── all-sports-page.test.tsx
│   │   │   ├── live/        # Mirror src/app/sports/live/
│   │   │   │   └── live-games-page.test.tsx
│   │   │   ├── mlb/         # Mirror src/app/sports/mlb/
│   │   │   │   └── mlb-page.test.tsx
│   │   │   ├── mls/         # Mirror src/app/sports/mls/
│   │   │   │   └── mls-page.test.tsx
│   │   │   ├── nba/         # Mirror src/app/sports/nba/
│   │   │   │   └── nba-page.test.tsx
│   │   │   ├── nfl/         # Mirror src/app/sports/nfl/
│   │   │   │   └── nfl-page.test.tsx
│   │   │   └── nhl/         # Mirror src/app/sports/nhl/
│   │   │       └── nhl-page.test.tsx
│   │   ├── layout.test.tsx  # Mirror src/app/layout.tsx
│   │   ├── not-found.test.tsx # Mirror src/app/not-found.tsx
│   │   └── page.test.tsx    # Mirror src/app/page.tsx
│   ├── components/          # Mirror src/components/ structure
│   │   ├── auth/           # Authentication component tests
│   │   ├── common/         # Common component tests
│   │   ├── layout/         # Layout component tests
│   │   ├── lazy/           # Mirror src/components/lazy/
│   │   │   ├── lazy-loading.test.tsx
│   │   │   ├── lazy-loading-extended.test.tsx
│   │   │   └── live-games-detail.test.tsx
│   │   ├── providers/      # Provider component tests
│   │   ├── ui/             # UI component tests
│   │   └── live-games-banner.test.tsx
│   ├── hooks/              # Mirror src/hooks/ structure
│   ├── lib/                # Mirror src/lib/ structure
│   └── middleware.test.ts  # Mirror src/middleware.ts
└── e2e/                    # End-to-end tests (Playwright)
    ├── functional/         # Functional test suites
    ├── pages/              # Page-specific tests
    └── utils/              # E2E test utilities
```

## Test Organization Principles

### Mirroring Source Structure

The `tests/unit/` directory now mirrors the `src/` directory structure for better maintainability:

- **`tests/unit/app/`** mirrors **`src/app/`** - Page components and layouts
- **`tests/unit/components/`** mirrors **`src/components/`** - Reusable components
- **`tests/unit/hooks/`** mirrors **`src/hooks/`** - Custom React hooks
- **`tests/unit/lib/`** mirrors **`src/lib/`** - Utilities and configurations
- **`tests/unit/middleware.test.ts`** mirrors **`src/middleware.ts`**

### Benefits of Mirroring

- **Easy Discovery**: Find tests by following the same path as source files
- **Maintainability**: Clear relationship between source and test files
- **Scalability**: Easy to add new tests in the correct location
- **Consistency**: Predictable test organization across the project

## Running Tests

### Unit Tests

```bash
# Basic unit tests
pnpm test:unit              # Run all unit tests with coverage
pnpm test:unit:json         # Run unit tests with JSON reporter
pnpm test:watch             # Watch mode for development
pnpm test:ui                # UI mode for interactive testing

# Coverage and enforcement
pnpm test:coverage          # Run tests with coverage report
pnpm test:strict            # Run tests with verbose reporter and coverage
pnpm coverage:enforce       # Enforce coverage thresholds
pnpm pre-push:coverage      # Pre-push coverage validation
```

### E2E Tests

```bash
# Basic E2E tests
pnpm test:e2e:sanity        # Sanity tests (fast)
pnpm test:e2e:smoke         # Smoke tests (comprehensive)
pnpm test:e2e:critical      # Critical path tests
pnpm test:e2e:full          # Full test suite

# Specialized E2E tests
pnpm test:e2e:navigation    # Navigation tests
pnpm test:e2e:responsive    # Responsive design tests
pnpm test:e2e:cross-browser # Cross-browser tests
pnpm test:e2e:performance   # Performance tests
```

### Combined Test Suites

```bash
# All tests
pnpm test:all               # Unit + E2E sanity tests
pnpm test:all:strict        # Unit + E2E with strict coverage

# Coverage enforcement
pnpm coverage:enforce:coverage    # Coverage analysis only
pnpm coverage:enforce:test-count  # Test count enforcement only
pnpm coverage:enforce:both        # Both coverage and test count
```

## Coverage Enforcement

The project implements comprehensive coverage enforcement with configurable thresholds:

### Default Thresholds

| Test Type  | Coverage Threshold | Min Test Count |
| ---------- | ------------------ | -------------- |
| Unit Tests | 80%                | 50             |
| E2E Tests  | 70%                | 30             |

### Coverage Commands

```bash
# Basic enforcement
pnpm coverage:enforce

# Custom thresholds
pnpm coverage:enforce --unit-threshold=90 --e2e-threshold=80

# Test count enforcement
pnpm coverage:enforce --test-count-only --min-unit-tests=100

# Strict pre-push validation
pnpm pre-push:coverage:strict
```

## Current Coverage Status

### Unit Test Coverage (Latest Results)

- **Overall Coverage**: 18.74% (focused on src/ directory)
- **Hooks**: 97.12% coverage ✅
- **App Components**: 85.79% coverage ✅
- **UI Components**: 98.69% coverage ✅
- **Lazy Loading**: 99.42% coverage ✅
- **Utilities**: 86.95% coverage ✅

### Test Statistics

- **Unit Test Files**: 43 files
- **Unit Tests**: 558 tests passed, 5 skipped
- **E2E Tests**: All smoke tests passing
- **Database Validation**: 13/13 triggers working

## Debugging Failing Tests (Efficient Development)

Instead of running the entire test suite when debugging failures, use these scripts for faster feedback:

### Quick Debugging Workflow

1. **Generate test results** (captures current state):

   ```bash
   pnpm test:generate-results:sanity        # Fast config, quick feedback
   pnpm test:generate-results:popular     # Popular config, comprehensive
   pnpm test:generate-results:responsive  # Responsive tests only
   ```

2. **Run only failing tests**:
   ```bash
   pnpm test:failing:sanity        # Run failing tests with fast config
   pnpm test:failing:popular     # Run failing tests with popular config
   pnpm test:failing:responsive  # Run failing responsive tests only
   ```

### Benefits

- **Speed**: Run only failing tests instead of full suite
- **Focus**: Concentrate on actual problems
- **Efficiency**: Reduce debugging time from hours to minutes
- **Iterative**: Quick feedback loop for development

### Advanced Usage

For more control, use the scripts directly:

```bash
# Generate results for specific test pattern
./scripts/generate-test-results.sh playwright.fast.config.ts "tests/e2e/responsive.spec.ts"

# Run only failing tests from a specific file
./scripts/run-failing-files.sh playwright.fast.config.ts line "tests/e2e/sports.spec.ts"
```

See [scripts/README-DEBUG.md](../scripts/README-DEBUG.md) for complete documentation.

## Test Organization

### Unit Tests

- **Component Tests**: Organized by feature/component type
- **Hook Tests**: All custom hooks have comprehensive test coverage
- **Utility Tests**: All utility functions are tested
- **File Naming**: `.test.tsx` or `.spec.tsx` extension
- **Structure**: Mirrors the source code structure

### E2E Tests

- **Functional Tests**: Core user journeys and workflows
- **Page Tests**: Individual page functionality
- **Cross-browser**: Multiple browser compatibility
- **Performance**: Load and performance testing

## Best Practices

1. **Test Coverage**: Aim for 80%+ coverage on new code
2. **Test Organization**: Keep tests close to the code they test
3. **Descriptive Names**: Use clear, descriptive test names
4. **Isolation**: Each test should be independent
5. **Mocking**: Use mocks for external dependencies
6. **Assertions**: Use specific, meaningful assertions

## Coverage Reports

Coverage reports are generated automatically and can be viewed at:

- **HTML Report**: `./coverage/lcov-report/index.html`
- **JSON Report**: `./coverage/coverage-final.json`
- **Enforcement Report**: `./coverage/enforcement-report.json`
