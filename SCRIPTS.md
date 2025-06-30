# 📜 Scripts Documentation

This document provides comprehensive documentation for all scripts in the Game Diary project, including development, testing, database, and utility scripts.

## 📋 Table of Contents

- [Quick Reference](#quick-reference)
- [E2E Testing Scripts](#e2e-testing-scripts)
- [Validation Scripts](#validation-scripts)
- [Database Scripts](#database-scripts)
- [Development Scripts](#development-scripts)
- [Utility Scripts](#utility-scripts)
- [Helper Scripts](#helper-scripts)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Reference

### Most Common Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server

# Testing
pnpm test:e2e:fast         # Fast e2e tests (Chromium only)
pnpm test:e2e:fast:timeout # Fast e2e tests with 5min timeout
pnpm test:e2e:debug        # Debug e2e test issues

# Validation
pnpm validate:soft         # Quick validation (no tests)
pnpm validate:dev          # Development validation
pnpm validate              # Full validation with all tests

# Database
pnpm db:setup              # Setup database
pnpm db:migrate            # Run migrations
pnpm db:studio             # Open database studio
```

## 🧪 E2E Testing Scripts

### Core E2E Commands

| Command                      | Description                 | Use Case                  |
| ---------------------------- | --------------------------- | ------------------------- |
| `pnpm test:e2e`              | All browsers with coverage  | Full test suite           |
| `pnpm test:e2e:fast`         | Chromium only with coverage | Quick development testing |
| `pnpm test:e2e:fast:timeout` | Chromium with 5min timeout  | Reliable fast testing     |
| `pnpm test:e2e:ui`           | Interactive UI mode         | Debugging tests           |
| `pnpm test:e2e:debug`        | Debug information           | Troubleshooting           |

### Browser-Specific Testing

| Command                  | Description          | Browsers/Devices                |
| ------------------------ | -------------------- | ------------------------------- |
| `pnpm test:e2e:chromium` | Chromium browser     | Desktop Chromium                |
| `pnpm test:e2e:firefox`  | Firefox browser      | Desktop Firefox                 |
| `pnpm test:e2e:safari`   | Safari browser       | Desktop Safari                  |
| `pnpm test:e2e:mobile`   | Mobile devices       | Chrome, Safari, iPhones         |
| `pnpm test:e2e:tablet`   | Tablet devices       | iPad, Samsung Galaxy Tab        |
| `pnpm test:e2e:desktop`  | All desktop browsers | Chromium, Firefox, Safari, Edge |
| `pnpm test:e2e:ipad`     | iPad-specific        | iPad landscape/portrait         |

### Responsive & Cross-Browser Testing

| Command                       | Description                 | Focus                        |
| ----------------------------- | --------------------------- | ---------------------------- |
| `pnpm test:e2e:responsive`    | Responsive design tests     | Viewport testing             |
| `pnpm test:e2e:cross-browser` | Cross-browser compatibility | Browser differences          |
| `pnpm test:e2e:all-browsers`  | All browser categories      | Complete browser coverage    |
| `pnpm test:e2e:all-viewports` | All viewport tests          | Complete responsive coverage |

### Coverage & Reporting

| Command                               | Description                   | Output               |
| ------------------------------------- | ----------------------------- | -------------------- |
| `pnpm test:e2e:coverage`              | All browsers with coverage    | Coverage report      |
| `pnpm test:e2e:coverage:fast`         | Chromium with coverage        | Fast coverage report |
| `pnpm test:e2e:coverage:fast:timeout` | Chromium with timeout         | Reliable coverage    |
| `pnpm test:e2e:coverage:report`       | Generate coverage report only | JSON/HTML report     |
| `pnpm test:e2e:coverage:html`         | Generate and open HTML report | Browser report       |

### E2E Helper Scripts

#### Direct Script Usage

```bash
# Standard e2e test (no coverage)
./scripts/e2e-run.sh 'playwright test --project=chromium' 'Chromium Test'

# E2e test with timeout
./scripts/e2e-run.sh 'playwright test --project=chromium' 'Chromium Test' 300

# E2e test with coverage (fast)
./scripts/e2e-run-with-coverage.sh 'playwright test' 'All Browsers'

# E2e test with coverage (full, waits for HTML report)
./scripts/e2e-run-with-coverage-full.sh 'playwright test' 'All Browsers' 600
```

#### Helper Functions (for advanced usage)

```bash
# Source the helpers
source scripts/e2e-helpers.sh

# Use individual functions
clean_e2e_artifacts
start_e2e_server
wait_for_e2e_server
run_e2e_test 'playwright test --project=chromium' 'Chromium'
run_e2e_test_with_coverage_fast 'playwright test' 'All Browsers'
```

## ✅ Validation Scripts

### Core Validation Commands

| Command                   | Description                | Scope                    |
| ------------------------- | -------------------------- | ------------------------ |
| `pnpm validate:types`     | TypeScript type validation | Type checking only       |
| `pnpm fix:types`          | Fix type violations        | Auto-fix types           |
| `pnpm validate:types:fix` | Validate then fix types    | Complete type workflow   |
| `pnpm verify`             | Basic validation           | Format, lint, types, env |
| `pnpm validate:soft`      | Soft validation            | No tests, quick check    |
| `pnpm validate:dev`       | Development validation     | With dev tests           |
| `pnpm validate`           | Full validation            | With all tests           |

### Validation Helper Scripts

#### Direct Script Usage

```bash
# Basic validation (format, typecheck, lint, circular deps, types, env)
./scripts/validation-run.sh basic

# Soft validation (codegen, format, fix, + basic)
./scripts/validation-run.sh soft

# Full validation (soft + unused exports + size check)
./scripts/validation-run.sh full

# Development validation (soft + unused exports + dev tests + size check)
./scripts/validation-run.sh dev

# Production validation (soft + unused exports + all tests + size check)
./scripts/validation-run.sh production
```

#### Helper Functions (for advanced usage)

```bash
# Source the helpers
source scripts/validation-helpers.sh

# Use individual functions
run_format_check
run_typecheck
run_lint
run_circular_check
run_type_validation_and_fix
run_env_verification
run_basic_validation
run_soft_validation
run_full_validation
run_dev_validation
run_production_validation
```

## 🗄 Database Scripts

### Setup & Configuration

| Command              | Description             | Environment      |
| -------------------- | ----------------------- | ---------------- |
| `pnpm db:setup`      | Complete database setup | Default          |
| `pnpm db:setup:dev`  | Development setup       | Development      |
| `pnpm db:setup:prod` | Production setup        | Production       |
| `pnpm db:setup:test` | Test setup              | Test environment |

### Schema Management

| Command              | Description               | Action             |
| -------------------- | ------------------------- | ------------------ |
| `pnpm db:generate`   | Generate schema from code | Create SQL files   |
| `pnpm db:push`       | Push schema to database   | Apply changes      |
| `pnpm db:push:force` | Force push schema         | Overwrite database |
| `pnpm db:pull`       | Pull schema from database | Extract schema     |

### Migration Management

| Command                          | Description               | Use Case        |
| -------------------------------- | ------------------------- | --------------- |
| `pnpm db:migrate`                | Run migrations            | Development     |
| `pnpm db:migrate:prod`           | Run production migrations | Production      |
| `pnpm db:migrate:dry-run`        | Preview migrations        | Safe preview    |
| `pnpm db:copy-custom-migrations` | Copy custom migrations    | Migration setup |
| `pnpm db:validate-migrations`    | Validate migration files  | Quality check   |
| `pnpm db:view-migrations`        | View migration status     | Status check    |

### Triggers & Functions

| Command                 | Description             | Environment |
| ----------------------- | ----------------------- | ----------- |
| `pnpm db:triggers`      | Setup database triggers | Default     |
| `pnpm db:triggers:dev`  | Development triggers    | Development |
| `pnpm db:triggers:prod` | Production triggers     | Production  |

### Testing & Validation

| Command                         | Description              | Type                   |
| ------------------------------- | ------------------------ | ---------------------- |
| `pnpm db:test-migrations`       | Test migration system    | Migration tests        |
| `pnpm db:test-connection`       | Test database connection | Full connection test   |
| `pnpm db:test-connection:basic` | Basic connection test    | Quick connection check |

### Database Tools

| Command          | Description         | Tool         |
| ---------------- | ------------------- | ------------ |
| `pnpm db:studio` | Open Drizzle Studio | Database GUI |

## 🛠 Development Scripts

### Core Development

| Command          | Description              | Use Case          |
| ---------------- | ------------------------ | ----------------- |
| `pnpm dev`       | Start development server | Local development |
| `pnpm build`     | Build production bundle  | Production build  |
| `pnpm start`     | Start production server  | Production server |
| `pnpm clean`     | Clean build artifacts    | Reset build       |
| `pnpm clean:all` | Clean everything         | Complete reset    |

### Code Quality

| Command             | Description         | Action              |
| ------------------- | ------------------- | ------------------- |
| `pnpm lint`         | Run ESLint          | Code linting        |
| `pnpm lint:fix`     | Fix linting issues  | Auto-fix            |
| `pnpm format`       | Format code         | Prettier formatting |
| `pnpm format:check` | Check formatting    | Format validation   |
| `pnpm typecheck`    | TypeScript checking | Type validation     |
| `pnpm fix`          | Run all fixes       | Complete fix        |

### GraphQL

| Command              | Description            | Action          |
| -------------------- | ---------------------- | --------------- |
| `pnpm codegen`       | Generate GraphQL types | Type generation |
| `pnpm codegen:watch` | Watch GraphQL changes  | Auto-generation |

### Analysis & Optimization

| Command                     | Description                 | Analysis            |
| --------------------------- | --------------------------- | ------------------- |
| `pnpm analyze`              | Bundle analysis             | Build analysis      |
| `pnpm analyze:bundle`       | Detailed bundle analysis    | Bundle breakdown    |
| `pnpm check:circular`       | Check circular dependencies | Dependency analysis |
| `pnpm check:unused:exports` | Check unused exports        | Code analysis       |
| `pnpm check:size`           | Check bundle size           | Size analysis       |

### Performance

| Command             | Description                 | Focus                |
| ------------------- | --------------------------- | -------------------- |
| `pnpm perf:build`   | Performance build           | Production build     |
| `pnpm perf:start`   | Performance server          | Production server    |
| `pnpm perf:measure` | Measure performance         | Performance metrics  |
| `pnpm perf:report`  | Generate performance report | Performance analysis |

### Build Variants

| Command              | Description           | Build Type     |
| -------------------- | --------------------- | -------------- |
| `pnpm build:analyze` | Build with analysis   | Analyzed build |
| `pnpm build:debug`   | Debug build           | Debug version  |
| `pnpm build:size`    | Build with size check | Size-optimized |
| `pnpm clean:build`   | Clean build process   | Complete build |

## 🔧 Utility Scripts

### Dependency Management

| Command                 | Description                    | Action            |
| ----------------------- | ------------------------------ | ----------------- |
| `pnpm deps:check`       | Check outdated deps            | List outdated     |
| `pnpm deps:update`      | Update dependencies            | Latest versions   |
| `pnpm deps:clean`       | Clean dependency store         | Clean cache       |
| `pnpm deps:audit`       | Security audit                 | Security check    |
| `pnpm deps:fix`         | Fix security issues            | Auto-fix security |
| `pnpm deps:interactive` | Interactive updates            | Manual updates    |
| `pnpm deps:manage`      | Advanced dependency management | Full management   |

### Environment & Configuration

| Command               | Description                  | Action          |
| --------------------- | ---------------------------- | --------------- |
| `pnpm verify-env`     | Verify environment variables | Env validation  |
| `pnpm validate:types` | Validate TypeScript types    | Type validation |
| `pnpm fix:types`      | Fix type violations          | Type fixing     |

### Testing

| Command              | Description         | Test Type           |
| -------------------- | ------------------- | ------------------- |
| `pnpm test`          | Run unit tests      | Unit testing        |
| `pnpm test:watch`    | Watch mode tests    | Development testing |
| `pnpm test:coverage` | Tests with coverage | Coverage testing    |
| `pnpm test:ui`       | UI test runner      | Interactive testing |
| `pnpm test:all`      | All tests           | Complete testing    |
| `pnpm test:dev`      | Development tests   | Dev testing         |

## 🆘 Helper Scripts

### E2E Helpers (`scripts/e2e-helpers.sh`)

```bash
# Core functions
clean_e2e_artifacts()           # Clean test artifacts
kill_e2e_processes()           # Kill all e2e processes
setup_e2e_trap()               # Setup cleanup trap
start_e2e_server()             # Start dev server
wait_for_e2e_server()          # Wait for server readiness

# Test runners
run_e2e_test()                 # Run standard e2e test
run_e2e_test_with_coverage()   # Run e2e test with coverage (full)
run_e2e_test_with_coverage_fast() # Run e2e test with coverage (fast)
```

### Validation Helpers (`scripts/validation-helpers.sh`)

```bash
# Core validation functions
run_format_check()             # Check code format
run_typecheck()                # TypeScript type check
run_lint()                     # ESLint check
run_circular_check()           # Circular dependency check
run_type_validation_and_fix()  # Type validation and fix
run_env_verification()         # Environment verification

# Composite validation functions
run_basic_validation()         # Basic validation suite
run_soft_validation()          # Soft validation (no tests)
run_full_validation()          # Full validation with tests
run_dev_validation()           # Development validation
run_production_validation()    # Production validation
```

## 🔍 Troubleshooting

### Common Issues

#### E2E Tests Hanging

```bash
# Debug the issue
pnpm test:e2e:debug

# Kill all processes
pkill -f 'next dev\|playwright\|chromium\|firefox\|webkit'

# Clean artifacts
rm -rf playwright-report test-results coverage/e2e

# Run with timeout
pnpm test:e2e:fast:timeout
```

#### Validation Failures

```bash
# Check what's failing
pnpm validate:types
pnpm lint
pnpm typecheck

# Auto-fix issues
pnpm fix:types
pnpm lint:fix
pnpm format
```

#### Database Issues

```bash
# Test connection
pnpm db:test-connection

# Validate migrations
pnpm db:validate-migrations

# Reset database
pnpm db:setup:dev
```

### Debug Scripts

#### E2E Debugging

```bash
# Comprehensive debug info
./scripts/e2e-debug.sh

# Manual test with debugging
DEBUG=pw:api pnpm test:e2e:fast

# Test with screenshots
pnpm test:e2e:fast --screenshot=on

# Test with tracing
pnpm test:e2e:fast --trace=on
```

#### Validation Debugging

```bash
# Run individual validation steps
./scripts/validation-run.sh basic

# Check specific issues
pnpm validate:types
pnpm check:circular
pnpm verify-env
```

### Performance Issues

```bash
# Check bundle size
pnpm check:size

# Analyze bundle
pnpm build:analyze

# Measure performance
pnpm perf:measure
```

## 📚 Additional Resources

- [Package.json Optimization](./PACKAGE_JSON_OPTIMIZATION.md) - Details about script optimizations
- [E2E Coverage Documentation](./tests/e2e/COVERAGE.md) - E2E test coverage details
- [Scripts README](./scripts/README.md) - Scripts directory overview
- [Tests README](./tests/README.md) - Testing overview

## 🤝 Contributing

When adding new scripts:

1. **Follow naming conventions**: Use descriptive names with colons for grouping
2. **Add documentation**: Update this file with new script details
3. **Include help text**: Add usage information in script comments
4. **Test thoroughly**: Ensure scripts work across different environments
5. **Add to package.json**: Include new scripts in the appropriate section

### Script Categories

- **Development**: Core development commands
- **Testing**: All test-related commands
- **Database**: Database management commands
- **Validation**: Code quality and validation
- **Analysis**: Code analysis and optimization
- **Performance**: Performance monitoring
- **Dependencies**: Dependency management
- **Git Hooks**: Pre-commit and pre-push hooks
