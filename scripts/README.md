# Scripts Directory

This directory contains utility scripts for development, testing, CI/CD, and maintenance tasks, now consolidated under a unified CLI system.

## 🚀 Unified CLI System

All script operations are now accessible through a single, well-organized CLI:

```bash
tsx scripts/cli.ts <command> <subcommand> [options]
```

## 🐚 Consolidated Shell Scripts

The shell scripts have been consolidated into four main categories for better organization:

### E2E Testing (`e2e.sh`)

```bash
# Run basic E2E tests
./scripts/e2e.sh run basic 'playwright test --project=chromium' 'Chromium tests' 300

# Run compound E2E tests
./scripts/e2e.sh compound --fast-only

# Debug E2E tests
./scripts/e2e.sh debug --ui

# Optimize E2E tests
./scripts/e2e.sh optimize --analyze

# Generate coverage reports
./scripts/e2e.sh coverage --fast

# Run responsive tests
./scripts/e2e.sh responsive 3600
```

### CI Pipeline (`ci.sh`)

```bash
# Run full CI pipeline
./scripts/ci.sh run preview
./scripts/ci.sh run staging
./scripts/ci.sh run production

# Run individual CI components
./scripts/ci.sh quality-gate production
./scripts/ci.sh unit-tests
./scripts/ci.sh e2e-tests sanity

# Quick pipeline shortcuts
./scripts/ci.sh preview
./scripts/ci.sh staging
./scripts/ci.sh production
```

### Validation (`validate.sh`)

```bash
# Run validation workflows
./scripts/validate.sh basic
./scripts/validate.sh dev
./scripts/validate.sh full
./scripts/validate.sh staging
./scripts/validate.sh production

# Run individual validation checks
./scripts/validate.sh circular
./scripts/validate.sh types
./scripts/validate.sh env
./scripts/validate.sh size
./scripts/validate.sh unused
```

### Workflow (`workflow.sh`)

```bash
# Git operations
./scripts/workflow.sh push-merge feature-branch main

# Deployment management
./scripts/workflow.sh deploy auto-deploy production
./scripts/workflow.sh deploy status staging

# Soak period management
./scripts/workflow.sh soak start staging 600
./scripts/workflow.sh soak monitor staging

# Timed script execution
./scripts/workflow.sh timed 'pnpm test' 300
```

### Available Commands

#### Database Operations (`db`)

```bash
tsx scripts/cli.ts db migrate [options]       # Run database migrations
tsx scripts/cli.ts db setup complete          # Setup database
tsx scripts/cli.ts db truncate --scope=internal # Truncate tables
tsx scripts/cli.ts db view                    # View migration history
tsx scripts/cli.ts db validate                # Validate migrations
tsx scripts/cli.ts db copy-migrations         # Copy custom migrations
```

#### Testing Operations (`test`)

```bash
tsx scripts/cli.ts test e2e [options]         # Run E2E tests
tsx scripts/cli.ts test e2e-compound [options] # Run compound E2E tests
tsx scripts/cli.ts test e2e-debug             # Run E2E debug utilities
tsx scripts/cli.ts test e2e-optimize [options] # Run E2E optimization
tsx scripts/cli.ts test failing [options]     # Run failing tests
tsx scripts/cli.ts test coverage [options]    # Generate coverage report
tsx scripts/cli.ts test db-connection [options] # Test database connection
tsx scripts/cli.ts test migrations [options]  # Test migrations
tsx scripts/cli.ts test redis [options]       # Test Redis connection
tsx scripts/cli.ts test cascade-delete [options] # Test cascade delete
tsx scripts/cli.ts test seeding [options]     # Test seeding functions
tsx scripts/cli.ts test seeding-deps [options] # Test seeding dependencies
tsx scripts/cli.ts test seeding-cli [options] # Test seeding CLI
tsx scripts/cli.ts test notifications [options] # Test notification triggers
tsx scripts/cli.ts test distributions [options] # Test statistical distributions
tsx scripts/cli.ts test configurable [options] # Test configurable distributions
```

#### CI/CD Operations (`ci`)

```bash
tsx scripts/cli.ts ci runner [environment]    # Run CI pipeline
tsx scripts/cli.ts ci unit-tests              # Run CI unit tests
tsx scripts/cli.ts ci e2e-tests [type]        # Run CI E2E tests
tsx scripts/cli.ts ci quality-gate            # Run CI quality gate
```

#### Validation Operations (`validate`)

```bash
tsx scripts/cli.ts validate run [type]        # Run validation pipeline
tsx scripts/cli.ts validate helpers [options] # Run validation helpers
```

#### Utility Operations (`utils`)

```bash

tsx scripts/cli.ts utils validate-types [options] # Validate types
tsx scripts/cli.ts utils check-circular [options] # Check circular dependencies
tsx scripts/cli.ts utils check-unused [options] # Check unused exports
tsx scripts/cli.ts utils manage-deps [options] # Manage dependencies
tsx scripts/cli.ts utils verify-env [options] # Verify environment
tsx scripts/cli.ts utils combine-schema [options] # Combine schema
```

#### Performance Operations (`perf`)

```bash
tsx scripts/cli.ts perf measure [options]     # Measure performance
tsx scripts/cli.ts perf report [options]      # Generate performance report
```

#### Workflow Operations (`workflow`)

```bash
tsx scripts/cli.ts workflow push-merge [options] # Run push and merge workflow
tsx scripts/cli.ts workflow deploy [options]  # Run deployment manager
tsx scripts/cli.ts workflow soak [options]    # Run soak monitor
tsx scripts/cli.ts workflow timed [options]   # Run timed execution
tsx scripts/cli.ts workflow generate-results [options] # Generate test results
tsx scripts/cli.ts workflow rename [options]  # Rename files to kebab case
```

## 📁 Directory Structure

```
scripts/
├── cli.ts                    # 🆕 Unified CLI entry point
├── db/                       # Database management scripts
│   ├── database-manager.ts   # 🆕 Unified database operations
│   ├── migrate.ts            # Backward compatibility wrapper
│   └── README.md             # Database operations documentation
├── tests/                    # 🆕 Consolidated test scripts
│   └── test-all-triggers.ts  # Comprehensive trigger validation
├── utils/                    # Utility scripts

│   ├── validate-types.ts
│   ├── check-circular-deps.ts
│   ├── check-unused-exports.ts
│   ├── manage-deps.ts
│   ├── verify-env.ts
│   └── combine-schema.ts
├── performance/              # Performance measurement scripts
│   ├── performance-measure.ts
│   └── performance-report.ts

├── shared/                   # Shared utilities
│   ├── database-triggers.ts
│   └── script-utils.ts
├── eslint-rules/             # ESLint custom rules
│   └── no-duplicate-main.js
├── e2e.sh                    # 🆕 Consolidated E2E testing script
├── ci.sh                     # 🆕 Consolidated CI pipeline script
├── validate.sh               # Consolidated validation script (ACTIVE)
├── workflow.sh               # 🆕 Consolidated workflow script
├── e2e-run.sh                # E2E test runner (legacy)
├── e2e-compound-runner.sh    # Compound test hierarchy runner (legacy)
├── e2e-helpers.sh            # E2E test helper functions (legacy)
├── e2e-debug.sh              # E2E debugging utilities (legacy)
├── e2e-optimize.sh           # E2E optimization utilities (legacy)
├── ci-runner.sh              # CI/CD pipeline runner (legacy)
├── ci-unit-tests.sh          # CI unit tests (legacy)
├── ci-e2e-tests.sh           # CI E2E tests (legacy)
├── ci-quality-gate.sh        # CI quality gate (legacy)
├── push-and-merge.sh         # Git workflow automation (legacy)
├── deployment-manager.sh     # Deployment management (legacy)
├── soak-monitor.sh           # Soak testing monitor (legacy)
├── timed-run.sh              # Timing utility (legacy)
├── run-failing.sh            # Failing tests runner (legacy)
├── generate-test-results.sh  # Test results generation (legacy)
├── e2e-coverage-report.ts    # E2E coverage reporting
├── print-coverage-link.cjs   # Coverage link printer
├── rename-to-kebab-case.sh   # File renaming utility
├── tsconfig.json             # TypeScript configuration
├── README.md                 # This file
└── README-DEBUG.md           # Debug documentation
```

## 🔄 Migration from Old Scripts

### Database Scripts

- **Old**: `tsx scripts/db/apply-migrations.ts`
- **New**: `tsx scripts/cli.ts db migrate`

- **Old**: `tsx scripts/db/setup-database.ts`
- **New**: `tsx scripts/cli.ts db setup complete`

- **Old**: `tsx scripts/db/truncate-tables.ts --scope=internal`
- **New**: `tsx scripts/cli.ts db truncate --scope=internal`

### Test Scripts

- **Old**: `tsx scripts/test-cascade-delete.ts`
- **New**: `tsx scripts/cli.ts test cascade-delete` (removed)

- **Old**: `tsx scripts/test-seeding-functions.ts`
- **New**: `tsx scripts/cli.ts test seeding` (removed)

**Note**: Most individual test scripts have been consolidated into `test-all-triggers.ts` for comprehensive trigger validation.

### Utility Scripts

- **Old**: `tsx scripts/utils/validate-types.ts`
- **New**: `tsx scripts/cli.ts utils validate-types`

### Shell Scripts

| Legacy Command                                         | New Command                                            |
| ------------------------------------------------------ | ------------------------------------------------------ |
| `./scripts/ci-runner.sh preview`                       | `./scripts/ci.sh preview`                              |
| `./scripts/e2e-run.sh basic 'playwright test' 'Tests'` | `./scripts/e2e.sh run basic 'playwright test' 'Tests'` |
| `./scripts/validation-run.sh basic`                    | `./scripts/validate.sh basic`                          |
| `./scripts/push-and-merge.sh`                          | `./scripts/workflow.sh push-merge`                     |
| `./scripts/deployment-manager.sh status`               | `./scripts/workflow.sh deploy status`                  |
| `./scripts/soak-monitor.sh start`                      | `./scripts/workflow.sh soak start`                     |
| `./scripts/timed-run.sh 'pnpm test'`                   | `./scripts/workflow.sh timed 'pnpm test'`              |

## 🎯 Benefits of Consolidation

1. **Unified Interface**: Single entry point for all script operations
2. **Consistent Patterns**: All operations use the same error handling and logging
3. **Better Documentation**: Centralized help and usage information
4. **Easier Maintenance**: Shared utilities and common patterns
5. **Improved Discoverability**: Clear command structure and help system
6. **Backward Compatibility**: Old scripts still work through wrappers

## 🧪 Testing

### Running Tests

```bash
# Run all E2E tests
tsx scripts/cli.ts test e2e basic

# Run comprehensive trigger validation
tsx scripts/cli.ts test all-triggers

# Run E2E tests
tsx scripts/cli.ts test e2e basic
tsx scripts/cli.ts test e2e-compound
tsx scripts/cli.ts test e2e-debug
tsx scripts/cli.ts test e2e-optimize
tsx scripts/cli.ts test failing
tsx scripts/cli.ts test coverage
```

### Test Scripts Location

All test scripts are now organized in `scripts/tests/` for better organization and discoverability.

## 🔧 Development

### Adding New Commands

To add a new command to the CLI:

1. Add a new case in the appropriate handler function in `cli.ts`
2. Update the help text in `showHelp()`
3. Add any necessary utility functions
4. Update this README

### Script Organization

- **Core scripts**: Keep in root `scripts/` directory
- **Test scripts**: Move to `scripts/tests/`
- **Utility scripts**: Keep in `scripts/utils/`
- **Database scripts**: Keep in `scripts/db/`
- **Performance scripts**: Keep in `scripts/performance/`

## 📚 Additional Documentation

- [Database Operations](db/README.md) - Detailed database management guide
- [Debug Guide](README-DEBUG.md) - Debugging and troubleshooting
- [Package.json Scripts](../package.json) - NPM script definitions

## 🚨 Troubleshooting

### Common Issues

1. **Command not found**: Ensure you're using the correct command structure
2. **Environment variables**: The CLI automatically loads environment variables
3. **Database connection**: Check your `DATABASE_URL` environment variable
4. **Permission errors**: Ensure scripts have execute permissions

### Getting Help

```bash
# Show general help
tsx scripts/cli.ts

# Show help for specific command
tsx scripts/cli.ts db --help
tsx scripts/cli.ts test --help
```

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=true tsx scripts/cli.ts <command> <subcommand>
```
