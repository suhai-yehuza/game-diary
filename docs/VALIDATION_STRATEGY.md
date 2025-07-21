# Validation Strategy

This document outlines the comprehensive validation strategy for the Game Diary application, including pre-commit and pre-push hooks.

## Overview

Our validation strategy is designed to catch issues at the earliest possible stage while maintaining developer productivity. We use a tiered approach:

- **Pre-commit**: Fast checks that don't slow down development
- **Pre-push**: Comprehensive checks that ensure code quality before sharing
- **CI/CD**: Full validation pipeline for deployment safety

## Pre-commit Validation

**Location**: `scripts/db/pre-commit-validation.sh`

**Purpose**: Fast validation that runs on every commit to catch issues early.

**Checks**:

1. **Lint-staged** - Formatting and linting of staged files
2. **Type Check** - Quick TypeScript type validation
3. **Circular Dependencies** - Detect circular import issues
4. **Database Migrations** - Validate triggers and functions (if migration files changed)
5. **Environment Variables** - Verify environment configuration

**Execution Time**: ~10-30 seconds

**Skip Option**: None (these are fast enough to run on every commit)

## Pre-push Validation

**Location**: `scripts/db/pre-push-validation.sh`

**Purpose**: Comprehensive validation before pushing to catch issues that might break CI or deployment.

**Checks**:

1. **Clean & Prepare** - Clean build artifacts and regenerate code
2. **Code Quality** - Linting, formatting, type validation and fixes
3. **Code Analysis** - Circular dependencies, unused exports
4. **Build Validation** - Production build test
5. **Size & Performance** - Bundle size limits
6. **Unit Tests** - Comprehensive unit test suite with coverage
7. **Database Validation** - Trigger and function tests
8. **E2E Smoke Tests** - Quick end-to-end validation

**Execution Time**: ~2-5 minutes

**Skip Options**:

- `SKIP_E2E=true` - Skip E2E tests if they're too slow
- `--no-verify` - Skip entire pre-push validation (not recommended)

## CI/CD Validation

**Purpose**: Full validation pipeline for deployment safety.

**Checks**:

- All pre-push validations
- Full E2E test suite
- Performance benchmarks
- Security audits
- Deployment-specific validations

## Available Validation Scripts

### Quick Validation

```bash
# Basic validation (fast)
pnpm validate:basic

# Development workflow
pnpm validate:dev

# Full validation
pnpm validate:full
```

### Individual Checks

```bash
# Code quality
pnpm lint                    # ESLint
pnpm typecheck              # TypeScript
pnpm format:check           # Prettier
pnpm check:circular         # Circular dependencies
pnpm check:dead:code   # Dead code detection (ts-prune + ts-unused-exports)
pnpm check:size             # Bundle size

# Testing
pnpm test:unit              # Unit tests
pnpm test:strict            # Unit tests with coverage
pnpm test:e2e:smoke         # E2E smoke tests
pnpm test:e2e:critical      # E2E critical tests

# Database
pnpm db:test:all-triggers   # Database trigger tests
pnpm db:validate-triggers   # Migration validation

# Environment
pnpm verify-env             # Environment variables
```

### Consolidated Scripts

```bash
# Validation workflows
pnpm validate:ci            # CI validation
pnpm validate:predeploy     # Pre-deployment validation
pnpm validate:all           # Full validation with E2E

# Environment-specific
pnpm validate:staging       # Staging validation
pnpm validate:production    # Production validation
```

## Best Practices

### For Developers

1. **Commit Frequently**: Use pre-commit hooks to catch issues early
2. **Push Regularly**: Use pre-push hooks to ensure code quality
3. **Skip When Appropriate**: Use skip flags for non-critical issues during development
4. **Fix Issues Promptly**: Address validation failures before they accumulate

### For CI/CD

1. **Never Skip**: Always run full validation in CI/CD
2. **Fail Fast**: Stop on first validation failure
3. **Parallel Execution**: Run independent checks in parallel when possible
4. **Clear Reporting**: Provide clear error messages and remediation steps

## Troubleshooting

### Common Issues

1. **Pre-commit Too Slow**

   - Ensure only fast checks are in pre-commit
   - Consider moving slow checks to pre-push

2. **Pre-push Too Slow**

   - Use `SKIP_E2E=true` for development
   - Consider running E2E tests in CI only

3. **Validation Failures**
   - Check error messages for specific issues
   - Use `pnpm validate:dev` for development workflow
   - Use `pnpm validate:full` for comprehensive validation

### Performance Optimization

1. **Incremental Checks**: Use tools that support incremental checking
2. **Caching**: Enable caching for build tools and tests
3. **Parallel Execution**: Run independent checks in parallel
4. **Selective Validation**: Only validate changed files when possible

## Future Enhancements

### Planned Improvements

1. **Incremental Type Checking**: Only check changed files
2. **Parallel Test Execution**: Run tests in parallel
3. **Smart Validation**: Skip checks based on file changes
4. **Performance Monitoring**: Track validation performance over time

### Potential Additions

1. **Security Scanning**: SAST/DAST integration
2. **Dependency Analysis**: Vulnerability scanning
3. **Performance Regression**: Automated performance testing
4. **Accessibility Testing**: Automated a11y validation
