# Script Timing Guide

This document provides timing wrappers for all major scripts in the project. Use these commands to measure execution time and performance of different operations.

## 🚀 Development Commands

### `pnpm time:dev`

- **What it does**: Starts the development server
- **Use case**: Measure how long it takes to start the dev server
- **Expected time**: 5-15 seconds

### `pnpm time:build`

- **What it does**: Builds the production application
- **Use case**: Measure build performance
- **Expected time**: 30-120 seconds

### `pnpm time:clean:build:dev`

- **What it does**: Clean build with development validation
- **Use case**: Full development build cycle
- **Expected time**: 2-5 minutes

### `pnpm time:clean:build:prod`

- **What it does**: Clean build with production validation
- **Use case**: Full production build cycle
- **Expected time**: 3-8 minutes

## 🧪 Testing Commands

### `pnpm time:test`

- **What it does**: Runs unit tests with Vitest
- **Use case**: Measure unit test execution time
- **Expected time**: 5-30 seconds

### `pnpm time:test:fast`

- **What it does**: Runs fast test suite (coverage + fast E2E)
- **Use case**: Quick development testing
- **Expected time**: 10-30 seconds

### `pnpm time:test:all`

- **What it does**: Runs all tests (coverage + all E2E)
- **Use case**: Comprehensive testing before release
- **Expected time**: 5-15 minutes

### `pnpm time:test:coverage`

- **What it does**: Runs unit tests with coverage reporting
- **Use case**: Measure test coverage generation time
- **Expected time**: 10-45 seconds

## 🌐 E2E Testing Commands

### `pnpm time:test:e2e:fast`

- **What it does**: Fast E2E tests on Chromium only
- **Use case**: Quick E2E validation during development
- **Expected time**: 8-15 seconds

### `pnpm time:test:e2e:chromium`

- **What it does**: E2E tests on Chromium browser
- **Use case**: Single browser E2E testing
- **Expected time**: 30-90 seconds

### `pnpm time:test:e2e:desktop`

- **What it does**: E2E tests on all desktop browsers (Chrome, Firefox, Safari)
- **Use case**: Cross-browser desktop testing
- **Expected time**: 2-5 minutes

### `pnpm time:test:e2e:mobile`

- **What it does**: E2E tests on mobile devices (Mobile Chrome, iPhone)
- **Use case**: Mobile device testing
- **Expected time**: 1-3 minutes

### `pnpm time:test:e2e:responsive`

- **What it does**: Comprehensive responsive design testing across all viewports
- **Use case**: Responsive design validation
- **Expected time**: 15-30 minutes

### `pnpm time:test:e2e`

- **What it does**: All E2E tests with coverage
- **Use case**: Complete E2E testing suite
- **Expected time**: 10-25 minutes

## ✅ Validation Commands

### `pnpm time:validate`

- **What it does**: Full production validation (lint, typecheck, tests, etc.)
- **Use case**: Pre-deployment validation
- **Expected time**: 5-15 minutes

### `pnpm time:validate:dev`

- **What it does**: Development validation (lighter test suite)
- **Use case**: Development workflow validation
- **Expected time**: 2-8 minutes

### `pnpm time:validate:soft`

- **What it does**: Soft validation (no tests, quick checks)
- **Use case**: Quick validation during development
- **Expected time**: 10-30 seconds

### `pnpm time:lint`

- **What it does**: ESLint code linting
- **Use case**: Measure linting performance
- **Expected time**: 5-15 seconds

### `pnpm time:typecheck`

- **What it does**: TypeScript type checking
- **Use case**: Measure type checking performance
- **Expected time**: 5-20 seconds

### `pnpm time:format`

- **What it does**: Prettier code formatting
- **Use case**: Measure formatting performance
- **Expected time**: 2-10 seconds

### `pnpm time:codegen`

- **What it does**: GraphQL code generation
- **Use case**: Measure code generation performance
- **Expected time**: 5-15 seconds

## 📊 Performance Benchmarks

### Quick Development Workflow

```bash
# Start development (5-15s)
pnpm time:dev

# Quick validation (10-30s)
pnpm time:validate:soft

# Fast testing (10-30s)
pnpm time:test:fast
```

### Pre-Commit Workflow

```bash
# Lint and format (10-25s)
pnpm time:lint
pnpm time:format

# Type check (5-20s)
pnpm time:typecheck

# Unit tests (5-30s)
pnpm time:test
```

### Pre-Release Workflow

```bash
# Full validation (5-15 minutes)
pnpm time:validate

# All tests (5-15 minutes)
pnpm time:test:all

# Responsive testing (15-30 minutes)
pnpm time:test:e2e:responsive
```

### CI/CD Pipeline

```bash
# Production build (3-8 minutes)
pnpm time:clean:build:prod

# All E2E tests (10-25 minutes)
pnpm time:test:e2e
```

## 🎯 Usage Tips

1. **Use for performance monitoring**: Track how script times change over time
2. **CI/CD optimization**: Identify bottlenecks in your pipeline
3. **Development workflow**: Choose the right commands for your current needs
4. **Team communication**: Share timing expectations with your team

## 📈 Monitoring Performance

Keep track of script execution times to:

- Identify performance regressions
- Optimize slow commands
- Set realistic expectations for team members
- Plan CI/CD pipeline improvements

## 🔧 Custom Timing

You can also time any custom command:

```bash
./scripts/time-script.sh your-custom-command
```

## 📊 Timing Log Management

### Helper Functions

After running `./scripts/setup-timing.sh`, you'll have these helper functions available:

#### `show_timing_log`

- **What it does**: Shows the last 20 entries from your timing log
- **Use case**: Quick review of recent script performance
- **Example**: `show_timing_log`

#### `clear_timing_log`

- **What it does**: Deletes the `.timing.log` file
- **Use case**: Clean up old timing data
- **Example**: `clear_timing_log`

#### `enable_timing`

- **What it does**: Enables automatic timing and logging for all `pnpm` commands
- **Use case**: Start timing your workflow
- **Example**: `enable_timing`

#### `disable_timing`

- **What it does**: Disables automatic timing
- **Use case**: Stop timing when not needed
- **Example**: `disable_timing`

### Manual Log Management

You can also manage the log file directly:

```bash
# View full log
cat .timing.log

# View last 10 entries
tail -10 .timing.log

# Search for specific commands
grep "test:e2e" .timing.log

# Clear log manually
rm .timing.log
```

This gives you complete visibility into your development workflow performance! 🚀
