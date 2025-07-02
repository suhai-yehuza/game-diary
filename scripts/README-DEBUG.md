# Debug Scripts for Efficient Test Development

This directory contains scripts to help you debug test failures efficiently without running the entire test suite.

## Quick Start

1. **Generate test results** (run once to capture current state):

   ```bash
   pnpm test:generate-results:fast        # Fast config, quick feedback
   pnpm test:generate-results:popular     # Popular config, more comprehensive
   pnpm test:generate-results:responsive  # Responsive tests only
   ```

2. **Run only failing tests**:
   ```bash
   pnpm test:failing:fast        # Run failing tests with fast config
   pnpm test:failing:popular     # Run failing tests with popular config
   pnpm test:failing:responsive  # Run failing responsive tests only
   ```

## Available Scripts

### Generate Test Results

- `pnpm test:generate-results` - Generate results with default config
- `pnpm test:generate-results:fast` - Generate results with fast config (recommended for development)
- `pnpm test:generate-results:popular` - Generate results with popular config (more browsers)
- `pnpm test:generate-results:responsive` - Generate results for responsive tests only

### Run Failing Tests

- `pnpm test:failing` - Run failing tests with default config
- `pnpm test:failing:fast` - Run failing tests with fast config (recommended for debugging)
- `pnpm test:failing:popular` - Run failing tests with popular config
- `pnpm test:failing:responsive` - Run failing responsive tests only

## Workflow

### For Development

1. Make changes to your code
2. Run `pnpm test:generate-results:fast` to see what's broken
3. Run `pnpm test:failing:fast` to focus on fixing failures
4. Repeat steps 2-3 until all tests pass
5. Run full suite to ensure no regressions

### For Responsive Testing

1. Make changes to responsive components
2. Run `pnpm test:generate-results:responsive` to see responsive test failures
3. Run `pnpm test:failing:responsive` to focus on fixing responsive failures
4. Repeat steps 2-3 until responsive tests pass
5. Run full responsive suite to ensure no regressions

### For CI/CD Debugging

1. When CI fails, download the test results
2. Place `results.json` in `test-results/` directory
3. Run `pnpm test:failing:popular` to reproduce failures locally
4. Fix issues and verify with `pnpm test:failing:popular`

## Script Details

### `generate-test-results.sh`

- Runs tests with JSON reporter
- Creates `test-results/results.json` for analysis
- Cleans up previous results automatically
- Accepts optional test pattern parameter

### `run-failing-files.sh`

- Parses `test-results/results.json`
- Identifies files with failing tests
- Runs only those specific test files
- Supports optional file filtering (e.g., only responsive tests)
- Much faster than full suite

## Custom Usage

You can also use the scripts directly with custom parameters:

```bash
# Generate results for specific test pattern
./scripts/generate-test-results.sh playwright.fast.config.ts "tests/e2e/responsive.spec.ts"

# Run failing tests with custom config
./scripts/run-failing-files.sh playwright.popular.config.ts html

# Run only failing tests from a specific file
./scripts/run-failing-files.sh playwright.fast.config.ts line "tests/e2e/sports.spec.ts"
```

## Advanced File Filtering

The `run-failing-files.sh` script supports an optional third parameter to filter failing tests by file:

```bash
# Run only failing tests from responsive.spec.ts
./scripts/run-failing-files.sh playwright.popular.config.ts line tests/e2e/responsive.spec.ts

# Run only failing tests from sports.spec.ts
./scripts/run-failing-files.sh playwright.fast.config.ts line tests/e2e/sports.spec.ts

# Run only failing tests from any file containing "auth"
./scripts/run-failing-files.sh playwright.fast.config.ts line auth
```

## Troubleshooting

### No test results found

```bash
# Run this first to generate results
pnpm test:generate-results:fast
```

### Script permissions

```bash
# Make scripts executable if needed
chmod +x scripts/*.sh
```

### Port conflicts

```bash
# Kill processes using test ports
lsof -ti:8081 | xargs kill -9
```

### File filtering not working

```bash
# Check if the file path is correct
ls tests/e2e/responsive.spec.ts

# Verify the filter pattern matches
grep "responsive" test-results/results.json
```

## Benefits

- **Speed**: Run only failing tests instead of full suite
- **Focus**: Concentrate on actual problems
- **Efficiency**: Reduce debugging time from hours to minutes
- **Iterative**: Quick feedback loop for development
- **Targeted**: Filter by specific test files or suites
- **Responsive**: Specialized scripts for responsive testing workflow
