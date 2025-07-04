# Scripts Directory

This directory contains utility scripts for development, testing, CI/CD, and maintenance tasks.

## 📁 Directory Structure

```
scripts/
├── e2e-run.sh                    # Consolidated E2E test runner
├── timed-run.sh                  # Consolidated timing utility
├── run-failing.sh                # Consolidated failing tests runner
├── e2e-compound-runner.sh        # Compound test hierarchy runner
├── e2e-helpers.sh                # E2E test helper functions
├── e2e-debug.sh                  # E2E debugging utilities
├── e2e-optimize.sh               # E2E optimization utilities
├── ci-runner.sh                  # CI/CD pipeline runner
├── ci-unit-tests.sh              # CI unit tests
├── ci-e2e-tests.sh               # CI E2E tests
├── ci-quality-gate.sh            # CI quality gate
├── validation-run.sh             # Validation runner
├── validation-helpers.sh         # Validation helper functions
├── push-and-merge.sh             # Git workflow automation
├── generate-test-results.sh      # Test results generation
├── print-coverage-link.cjs       # Coverage link printer
├── rename-to-kebab-case.sh       # File renaming utility
├── e2e-coverage-report.ts        # E2E coverage reporting
├── db/                           # Database scripts
├── utils/                        # Utility scripts
├── test/                         # Test utilities
├── performance/                  # Performance scripts
├── eslint-rules/                 # ESLint rules
├── shared/                       # Shared utilities
└── README.md                     # This file
```

## 🚀 Core Scripts

### E2E Test Runner (`e2e-run.sh`)

**Consolidated E2E test execution with multiple modes.**

```bash
# Basic test execution
./scripts/e2e-run.sh basic "playwright test --project=chromium" "Chromium tests" 300

# Coverage testing (fast)
./scripts/e2e-run.sh coverage "playwright test tests/e2e/functional/fast.spec.ts" "Fast tests"

# Full coverage testing (waits for HTML reports)
./scripts/e2e-run.sh coverage-full "playwright test tests/e2e/functional/full.spec.ts" "Full tests" 600

# Responsive design testing
./scripts/e2e-run.sh responsive 3600
```

**Modes:**

- `basic` - Basic test execution (default)
- `coverage` - Test execution with coverage (fast)
- `coverage-full` - Test execution with full coverage (waits for HTML reports)
- `responsive` - Responsive design testing

### Timed Run (`timed-run.sh`)

**Consolidated timing utility for any command execution.**

```bash
# Time any command
./scripts/timed-run.sh command "pnpm build"

# Time pnpm commands
./scripts/timed-run.sh pnpm build

# Time pnpm script commands with enhanced logging
./scripts/timed-run.sh script test:e2e:quickie
```

**Modes:**

- `command` - Time any command (default)
- `pnpm` - Time pnpm commands
- `script` - Time pnpm script commands with enhanced logging

**Environment Variables:**

- `TIMING_QUIET=1` - Suppress timing output
- `TIMING_LOG=1` - Log timing to file (default: enabled)

### Failing Tests Runner (`run-failing.sh`)

**Consolidated failing tests execution.**

```bash
# Run individual failing tests
./scripts/run-failing.sh tests playwright.fast.config.ts line

# Run entire failing test files
./scripts/run-failing.sh files playwright.popular.config.ts line tests/e2e/functional/responsive.spec.ts
```

**Modes:**

- `tests` - Run individual failing tests (default)
- `files` - Run entire failing test files

## 🧪 Testing Scripts

### Compound Test Runner (`e2e-compound-runner.sh`)

**Run the compound test hierarchy in sequence.**

```bash
# Run all tests in sequence
./scripts/e2e-compound-runner.sh

# Run specific levels only
./scripts/e2e-compound-runner.sh --fast-only
./scripts/e2e-compound-runner.sh --smoke-only
./scripts/e2e-compound-runner.sh --critical-only
./scripts/e2e-compound-runner.sh --responsive-only
./scripts/e2e-compound-runner.sh --full-only
```

### E2E Debug (`e2e-debug.sh`)

**Debugging utilities for E2E tests.**

```bash
./scripts/e2e-debug.sh
```

Provides system information, process status, port status, and quick fixes.

### E2E Optimize (`e2e-optimize.sh`)

**Optimization utilities for E2E tests.**

```bash
# Clean test artifacts
./scripts/e2e-optimize.sh clean

# Optimize system for testing
./scripts/e2e-optimize.sh optimize

# Monitor system resources
./scripts/e2e-optimize.sh monitor

# Analyze test performance
./scripts/e2e-optimize.sh analyze

# Setup optimized environment
./scripts/e2e-optimize.sh setup
```

## 🔧 CI/CD Scripts

### CI Runner (`ci-runner.sh`)

**Main CI/CD pipeline runner.**

```bash
./scripts/ci-runner.sh preview
./scripts/ci-runner.sh staging
./scripts/ci-runner.sh production
```

### CI Unit Tests (`ci-unit-tests.sh`)

**CI unit tests execution.**

```bash
./scripts/ci-unit-tests.sh
```

### CI E2E Tests (`ci-e2e-tests.sh`)

**CI E2E tests execution.**

```bash
./scripts/ci-e2e-tests.sh smoke
./scripts/ci-e2e-tests.sh critical
./scripts/ci-e2e-tests.sh quickie
```

### CI Quality Gate (`ci-quality-gate.sh`)

**CI quality gate checks.**

```bash
./scripts/ci-quality-gate.sh
```

## 📊 Validation Scripts

### Validation Runner (`validation-run.sh`)

**Validation pipeline runner.**

```bash
./scripts/validation-run.sh basic
./scripts/validation-run.sh soft
./scripts/validation-run.sh full
./scripts/validation-run.sh dev
./scripts/validation-run.sh production
```

## 🗄️ Database Scripts

Located in `scripts/db/`:

- `setup-database.ts` - Database setup
- `apply-migrations.ts` - Migration application
- `drizzle-migrate.ts` - Drizzle migration utilities
- `validate-migrations.ts` - Migration validation
- `view-migrations.ts` - Migration viewing
- `copy-custom-migrations.ts` - Custom migration copying

## 🛠️ Utility Scripts

Located in `scripts/utils/`:

- `verify-env.ts` - Environment verification
- `check-unused-exports.ts` - Unused exports checking
- `validate-types.ts` - Type validation
- `check-circular-deps.ts` - Circular dependency checking
- `fix-type-violations.ts` - Type violation fixing
- `combine-schema.ts` - Schema combination
- `manage-deps.ts` - Dependency management

## 📈 Performance Scripts

Located in `scripts/performance/`:

- `performance-measure.ts` - Performance measurement
- `performance-report.ts` - Performance reporting

## 🔍 Test Utilities

Located in `scripts/test/`:

- `test-db-connection.ts` - Database connection testing
- `test-migrations.ts` - Migration testing
- `test-redis.ts` - Redis testing

## 📝 Workflow Scripts

### Push and Merge (`push-and-merge.sh`)

**Git workflow automation.**

```bash
./scripts/push-and-merge.sh
./scripts/push-and-merge.sh --help
```

### Generate Test Results (`generate-test-results.sh`)

**Test results generation.**

```bash
./scripts/generate-test-results.sh
./scripts/generate-test-results.sh playwright.fast.config.ts
./scripts/generate-test-results.sh playwright.popular.config.ts tests/e2e/functional/responsive.spec.ts
```

## 🎯 Package.json Integration

Most scripts are integrated into package.json for easy access:

```bash
# E2E testing
pnpm test:e2e:quickie
pnpm test:e2e:smoke
pnpm test:e2e:critical
pnpm test:e2e:responsive
pnpm test:e2e:full

# Timing
pnpm timed test:e2e:quickie

# Failing tests
pnpm test:failing
pnpm test:failing:fast
pnpm test:failing:popular

# CI/CD
pnpm ci:unit-tests
pnpm ci:e2e-tests
pnpm ci:quality-gate

# Validation
pnpm validate
pnpm validate:ci
pnpm validate:all
```

## 🔄 Recent Consolidations

The following scripts have been consolidated to reduce complexity:

### E2E Testing (Consolidated into `e2e-run.sh`)

- ❌ `e2e-run-with-coverage.sh` → ✅ `e2e-run.sh coverage`
- ❌ `e2e-run-with-coverage-full.sh` → ✅ `e2e-run.sh coverage-full`
- ❌ `e2e-responsive.sh` → ✅ `e2e-run.sh responsive`

### Timing (Consolidated into `timed-run.sh`)

- ❌ `timed-pnpm.sh` → ✅ `timed-run.sh pnpm`
- ❌ `time-script.sh` → ✅ `timed-run.sh script`

### Failing Tests (Consolidated into `run-failing.sh`)

- ❌ `run-failing-tests.sh` → ✅ `run-failing.sh tests`
- ❌ `run-failing-files.sh` → ✅ `run-failing.sh files`

## 📚 Best Practices

1. **Use package.json scripts** when possible for better integration
2. **Check script help** with `--help` or `-h` flags
3. **Use appropriate modes** for different use cases
4. **Leverage environment variables** for customization
5. **Check script documentation** before use

## 🆘 Troubleshooting

### Common Issues

1. **Script not found**: Ensure script is executable (`chmod +x script.sh`)
2. **Permission denied**: Check file permissions and ownership
3. **Dependencies missing**: Install required tools (Node.js, pnpm, etc.)
4. **Environment issues**: Check environment variables and configuration

### Debug Commands

```bash
# Check script permissions
ls -la scripts/

# Test script execution
./scripts/e2e-debug.sh

# Check environment
./scripts/utils/verify-env.ts

# Validate setup
./scripts/validation-run.sh basic
```
