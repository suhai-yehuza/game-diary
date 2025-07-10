# Script Updates for DRY Test Structure

This document summarizes the updates made to scripts to support the new DRY (Don't Repeat Yourself) test structure with extensible specs.

## Overview

The e2e functional tests have been refactored to follow a progressive hierarchy where each level extends the previous one:

```
sanity → smoke → critical → navigation → responsive → cross-browser → full
```

## Updated Scripts

### 1. **package.json**

#### New E2E Test Scripts

```json
{
  "test:e2e:sanity": "playwright test tests/e2e/functional/sanity.spec.ts --config=playwright.sanity.config.ts",
  "test:e2e:smoke": "playwright test tests/e2e/functional/smoke.spec.ts --config=playwright.sanity.config.ts",
  "test:e2e:critical": "E2E_MOCK_MODE=true playwright test tests/e2e/functional/critical.spec.ts --config=playwright.critical.config.ts",
  "test:e2e:navigation": "E2E_MOCK_MODE=true playwright test tests/e2e/functional/navigation.spec.ts --config=playwright.critical.config.ts",
  "test:e2e:responsive": "E2E_MOCK_MODE=true playwright test tests/e2e/functional/responsive.spec.ts --config=playwright.popular.config.ts",
  "test:e2e:cross-browser": "E2E_MOCK_MODE=true playwright test tests/e2e/functional/cross-browser.spec.ts --config=playwright.popular.config.ts",
  "test:e2e:full": "E2E_MOCK_MODE=true playwright test tests/e2e/functional/full.spec.ts --config=playwright.popular.config.ts"
}
```

#### Updated Compound Scripts

```json
{
  "test:e2e:compound:sanity": "pnpm e2e:compound --sanity-only",
  "test:e2e:compound:smoke": "pnpm e2e:compound --smoke-only",
  "test:e2e:compound:critical": "pnpm e2e:compound --critical-only",
  "test:e2e:compound:navigation": "pnpm e2e:compound --navigation-only",
  "test:e2e:compound:responsive": "pnpm e2e:compound --responsive-only",
  "test:e2e:compound:cross-browser": "pnpm e2e:compound --cross-browser-only",
  "test:e2e:compound:full": "pnpm e2e:compound --full-only"
}
```

#### Updated Deployment Scripts

```json
{
  "test:e2e:smoke:deployed": "DEPLOYMENT_URL=$VERCEL_URL playwright test tests/e2e/functional/smoke.spec.ts --config=playwright.smoke.config.ts",
  "test:e2e:pre-deploy": "pnpm test:e2e:critical && pnpm test:e2e:performance"
}
```

### 2. **scripts/e2e-compound-runner.sh**

#### Updated Test Hierarchy

```bash
# Level 0: Mock Verification (Prerequisite)
# Level 1: Sanity Tests (Base Level)
# Level 2: Smoke Tests (Extends Sanity)
# Level 3: Critical Tests (Extends Smoke)
# Level 4: Navigation Tests (Extends Critical)
# Level 5: Responsive Tests (Extends Navigation)
# Level 6: Cross-Browser Tests (Extends Responsive)
# Level 7: Full Tests (Extends Cross-Browser)
```

#### New Command Line Options

```bash
--sanity-only          # Run only sanity tests
--smoke-only           # Run only smoke tests
--critical-only        # Run only critical tests
--navigation-only      # Run only navigation tests
--responsive-only      # Run only responsive tests
--cross-browser-only   # Run only cross-browser tests
--full-only            # Run only full tests
--mock-verification-only # Run only mock verification tests
```

### 3. **scripts/e2e.sh**

#### Updated Compound Test Options

```bash
# Parse compound options
local sanity_only=false
local smoke_only=false
local critical_only=false
local navigation_only=false
local responsive_only=false
local cross_browser_only=false
local full_only=false
local mock_verification_only=false
```

#### Updated Test Execution

```bash
# Execute compound tests based on options
if [ "$sanity_only" = true ]; then
    run_e2e_test "playwright test tests/e2e/functional/sanity.spec.ts --config=playwright.sanity.config.ts" "Sanity E2E Tests"
elif [ "$smoke_only" = true ]; then
    run_e2e_test "playwright test tests/e2e/functional/smoke.spec.ts --config=playwright.sanity.config.ts" "Smoke E2E Tests"
# ... and so on for each level
```

## Benefits of Updated Scripts

### 1. **Progressive Testing**

- Each script level runs all previous levels' tests
- Ensures complete coverage at each stage
- Prevents regression in lower-level functionality

### 2. **Flexible Execution**

- Run only sanity tests for quick feedback (30 seconds)
- Run critical tests for pre-deployment validation (2-3 minutes)
- Run full tests for comprehensive validation (5-10 minutes)

### 3. **CI/CD Integration**

```bash
# Quick feedback in CI
pnpm test:e2e:sanity

# Pre-deployment validation
pnpm test:e2e:critical

# Full validation before production
pnpm test:e2e:full
```

### 4. **Compound Testing**

```bash
# Run all tests in sequence
pnpm test:e2e:compound

# Run specific level only
pnpm test:e2e:compound --critical-only

# Run multiple levels
pnpm test:e2e:compound --smoke-only --critical-only
```

## Migration Guide

### From Old Scripts to New Scripts

| Old Script            | New Script            | Purpose                |
| --------------------- | --------------------- | ---------------------- |
| `test:e2e:fast`       | `test:e2e:sanity`     | Base level tests       |
| `test:e2e:smoke`      | `test:e2e:smoke`      | Extended functionality |
| `test:e2e:critical`   | `test:e2e:critical`   | Essential user flows   |
| `test:e2e:responsive` | `test:e2e:responsive` | Responsive design      |
| `test:e2e:full`       | `test:e2e:full`       | Comprehensive testing  |

### New Scripts Added

| New Script               | Purpose                          |
| ------------------------ | -------------------------------- |
| `test:e2e:navigation`    | Comprehensive navigation testing |
| `test:e2e:cross-browser` | Browser compatibility testing    |

## Usage Examples

### Development Workflow

```bash
# Quick feedback during development
pnpm test:e2e:sanity

# Extended testing before commit
pnpm test:e2e:smoke

# Full validation before push
pnpm test:e2e:critical
```

### CI/CD Pipeline

```bash
# Pull request validation
pnpm test:e2e:sanity && pnpm test:e2e:smoke

# Pre-deployment validation
pnpm test:e2e:critical

# Production deployment validation
pnpm test:e2e:full
```

### Debugging

```bash
# Debug specific test level
pnpm test:e2e:debug:ui -- tests/e2e/functional/critical.spec.ts

# Run with trace
pnpm test:e2e:debug --trace -- tests/e2e/functional/navigation.spec.ts
```

## Configuration Files

The scripts use appropriate Playwright configuration files:

- `playwright.sanity.config.ts` - For sanity and smoke tests
- `playwright.critical.config.ts` - For critical and navigation tests
- `playwright.popular.config.ts` - For responsive, cross-browser, and full tests

## Performance Characteristics

| Test Level    | Duration      | Coverage   | Use Case              |
| ------------- | ------------- | ---------- | --------------------- |
| Sanity        | 30 seconds    | Basic      | Quick feedback        |
| Smoke         | 1-2 minutes   | Extended   | Pre-commit            |
| Critical      | 2-3 minutes   | Essential  | Pre-deployment        |
| Navigation    | 3-4 minutes   | Navigation | Navigation testing    |
| Responsive    | 5-8 minutes   | Responsive | Responsive testing    |
| Cross-Browser | 8-12 minutes  | Browser    | Browser testing       |
| Full          | 10-15 minutes | Complete   | Production validation |

## Future Enhancements

1. **Parallel Execution** - Run different levels in parallel
2. **Selective Testing** - Run specific test categories within levels
3. **Performance Monitoring** - Track execution times per level
4. **Coverage Reporting** - Measure coverage at each level
5. **Smart Retries** - Retry failed tests intelligently
