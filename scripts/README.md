# scripts/

This directory contains utility scripts for database management, performance monitoring, testing, and general project automation.

> 📚 **For comprehensive script documentation, see [SCRIPTS.md](../SCRIPTS.md)**

## Structure

- **db/**: Database setup, migration, validation, and connection scripts.
- **performance/**: Performance measurement and reporting scripts.
- **utils/**: General utilities (type validation, env checks, dependency management, etc).
- **test/**: Test helpers and validation scripts.
- **e2e-coverage-report.ts**: Generates E2E coverage reports after Playwright runs.

## Key Helper Scripts

### E2E Testing

- `e2e-helpers.sh` - Core helper functions for e2e tests
- `e2e-run.sh` - Standard e2e test runner
- `e2e-run-with-coverage.sh` - E2E test runner with coverage (fast)
- `e2e-run-with-coverage-full.sh` - E2E test runner with coverage (full)
- `e2e-debug.sh` - Comprehensive debugging for e2e issues

### Validation

- `validation-helpers.sh` - Core validation helper functions
- `validation-run.sh` - Validation task runner

## Quick Examples

```bash
# E2E Testing
./scripts/e2e-run.sh 'playwright test --project=chromium' 'Chromium Test'
./scripts/e2e-run-with-coverage.sh 'playwright test' 'All Browsers'

# Validation
./scripts/validation-run.sh soft
./scripts/validation-run.sh dev

# Debugging
./scripts/e2e-debug.sh
```

## Usage

- All TypeScript scripts can be run with `pnpm tsx scripts/<path-to-script>.ts`.
- Many scripts are invoked via `pnpm run <script-name>` as defined in the root `package.json`.
- Helper scripts can be sourced for advanced usage: `source scripts/e2e-helpers.sh`

## Adding Scripts

- Prefer TypeScript for new scripts for type safety and maintainability.
- Add JSDoc comments to all new scripts.
- Document new scripts in [SCRIPTS.md](../SCRIPTS.md).
- Follow the established naming conventions and helper patterns.
