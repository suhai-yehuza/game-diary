# Test Directory Structure

This directory contains all test files for the application.

## Directory Structure

```
tests/
├── unit/           # Unit tests
│   └── components/ # Component tests
│       └── ui/     # UI component tests
└── e2e/           # End-to-end tests (Playwright)
```

## Running Tests

- Unit Tests: `pnpm test`
- Unit Tests (Watch Mode): `pnpm test:watch`
- Unit Tests (Coverage): `pnpm test:coverage`
- E2E Tests: `pnpm test:e2e`
- E2E Tests (UI Mode): `pnpm test:e2e:ui`

## Debugging Failing Tests (Efficient Development)

Instead of running the entire test suite when debugging failures, use these scripts for faster feedback:

### Quick Debugging Workflow

1. **Generate test results** (captures current state):

   ```bash
   pnpm test:generate-results:fast        # Fast config, quick feedback
   pnpm test:generate-results:popular     # Popular config, comprehensive
   pnpm test:generate-results:responsive  # Responsive tests only
   ```

2. **Run only failing tests**:
   ```bash
   pnpm test:failing:fast        # Run failing tests with fast config
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

- Unit tests are organized by feature/component type
- Each test file should be named with `.test.tsx` or `.spec.tsx` extension
- Tests should be placed in a directory structure that mirrors the source code structure
- E2E tests are managed by Playwright and are in the `e2e` directory
