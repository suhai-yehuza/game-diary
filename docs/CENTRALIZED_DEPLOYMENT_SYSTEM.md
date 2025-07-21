# Centralized Deployment Validation System

## Overview

The centralized deployment validation system consolidates all production deployment checks into a single, maintainable script (`scripts/deployment-validator.sh`). This ensures consistency between local development, CI/CD pipelines, and production deployments.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Centralized Validator                    │
│                scripts/deployment-validator.sh              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Validation Components                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │ Quality Gate│ │ Database    │ │ E2E Tests   │ │ Bundle  │ │
│  │ Validation  │ │ Tests       │ │             │ │ Size    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Usage Points                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │ Package.json│ │ CI Scripts  │ │ GitHub      │ │ Local   │ │
│  │ Scripts     │ │             │ │ Actions     │ │ Dev     │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Script Usage

### Basic Usage

```bash
# Full production dry run
./scripts/deployment-validator.sh dry-run

# Fast production dry run (critical tests only)
./scripts/deployment-validator.sh dry-run --fast

# CI validation
./scripts/deployment-validator.sh ci

# Pre-deployment validation only
./scripts/deployment-validator.sh pre-deploy

# Post-deployment validation
DEPLOYMENT_URL="https://your-app.vercel.app" ./scripts/deployment-validator.sh post-deploy
```

### Available Modes

| Mode          | Description                                   | Use Case               |
| ------------- | --------------------------------------------- | ---------------------- |
| `dry-run`     | Full production validation without deployment | Pre-deployment testing |
| `ci`          | CI-specific validation                        | GitHub Actions         |
| `pre-deploy`  | Pre-deployment validation only                | Before deployment      |
| `post-deploy` | Post-deployment validation                    | After deployment       |
| `help`        | Show usage information                        | Documentation          |

### Available Options

| Option               | Description                 | Default |
| -------------------- | --------------------------- | ------- |
| `--skip-db-tests`    | Skip database trigger tests | false   |
| `--skip-e2e-tests`   | Skip E2E tests              | false   |
| `--skip-size-check`  | Skip bundle size check      | false   |
| `--skip-performance` | Skip performance tests      | false   |
| `--fast`             | Run only critical tests     | false   |
| `--full`             | Run full test suite         | true    |
| `--verbose`          | Enable verbose output       | false   |

## Package.json Scripts

The centralized system provides several convenient npm scripts:

### Production Deployment Scripts

```json
{
  "ci:production:dry-run": "./scripts/deployment-validator.sh dry-run",
  "ci:production:dry-run:fast": "./scripts/deployment-validator.sh dry-run --fast",
  "ci:production:pre-deploy": "./scripts/deployment-validator.sh pre-deploy",
  "ci:production:post-deploy": "./scripts/deployment-validator.sh post-deploy",
  "ci:production:validation": "./scripts/deployment-validator.sh ci"
}
```

### Pre-push Validation Scripts

```json
{
  "pre-push:validation": "./scripts/pre-push-validation.sh",
  "pre-push:validation:fast": "PRE_PUSH_FAST=true ./scripts/pre-push-validation.sh",
  "pre-push:validation:no-e2e": "SKIP_E2E=true ./scripts/pre-push-validation.sh",
  "pre-push:coverage": "./scripts/pre-push-coverage.sh",
  "pre-push:coverage:strict": "./scripts/pre-push-coverage.sh --unit-threshold=95 --e2e-threshold=90 --min-unit-tests=100 --min-e2e-tests=50"
}
```

### Usage Examples

```bash
# Full production dry run
pnpm ci:production:dry-run

# Fast production dry run
pnpm ci:production:dry-run:fast

# Pre-deployment validation
pnpm ci:production:pre-deploy

# Post-deployment validation
DEPLOYMENT_URL="https://your-app.vercel.app" pnpm ci:production:post-deploy

# Pre-push validation (comprehensive)
pnpm pre-push:validation

# Pre-push validation (fast mode)
pnpm pre-push:validation:fast

# Pre-push validation (without E2E tests)
pnpm pre-push:validation:no-e2e
```

## Validation Components

### 1. Quality Gate Validation

**What it includes:**

- Code generation (GraphQL)
- Linting and formatting
- TypeScript type checking and fixes
- Circular dependency checks
- Environment verification
- Build process
- Unused exports check
- Strict unit tests
- E2E sanity tests

**Script:** `pnpm validate:production`

### 2. Database Tests

**What it includes:**

- All database trigger tests
- Constraint validation
- Database connection tests

**Script:** `pnpm db:test:all-triggers`

### 3. E2E Tests

**What it includes:**

- Critical tests (sanity, smoke, critical)
- Performance tests
- Full E2E suite (navigation, responsive, cross-browser)
- Comprehensive page tests (base, content, interactive)

**Scripts:**

- `pnpm test:e2e:critical`
- `pnpm test:e2e:performance`
- `pnpm test:e2e:full`
- `pnpm test:e2e:pages`

### 4. Bundle Size Check

**What it includes:**

- Production bundle size validation
- Size limit enforcement

**Script:** `pnpm check:size:ci`

## Pre-push Integration

### Overview

The centralized deployment validator is integrated into the pre-push validation process, ensuring that every push to production-ready branches goes through the same validation as the actual CI pipeline.

### Pre-push Validation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Pre-push Hook                            │
│                .husky/pre-push                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Pre-push Validation                          │
│            scripts/pre-push-validation.sh                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Validation Steps                         │
│  ┌─────────────────┐ ┌─────────────────────────────────────┐ │
│  │ Coverage        │ │ Production Dry Run                  │ │
│  │ Enforcement     │ │ (Centralized Validator)             │ │
│  └─────────────────┘ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Pre-push Validation Modes

| Mode        | Description                           | Use Case          |
| ----------- | ------------------------------------- | ----------------- |
| **Default** | Coverage + Fast production validation | Standard pre-push |
| **Fast**    | Coverage + Critical tests only        | Quick validation  |
| **No E2E**  | Coverage + Validation without E2E     | Skip E2E tests    |

### Environment Variables

| Variable        | Description                            | Default |
| --------------- | -------------------------------------- | ------- |
| `PRE_PUSH_FAST` | Enable fast mode (critical tests only) | `false` |
| `SKIP_E2E`      | Skip E2E tests in validation           | `false` |

### Benefits

1. **Consistency**: Same validation as production CI
2. **Early Detection**: Catch issues before they reach CI
3. **Flexibility**: Multiple validation levels for different needs
4. **Efficiency**: Removes redundant validation steps

## CI/CD Integration

### GitHub Actions

The centralized validator is used in the production workflow:

```yaml
# Quality Gate
- name: Run CI Quality Gate
  run: ./scripts/ci-quality-gate.sh production

# Unit Tests
- name: Run CI Unit Tests
  run: ./scripts/ci-unit-tests.sh

# E2E Tests
- name: Run CI E2E Tests
  run: ./scripts/ci-e2e-tests.sh critical
```

### CI Scripts

All CI scripts now use the centralized validator:

- `scripts/ci-quality-gate.sh` → Uses `deployment-validator.sh ci --skip-e2e-tests --skip-db-tests`
- `scripts/ci-unit-tests.sh` → Uses `deployment-validator.sh ci --skip-e2e-tests --skip-db-tests --skip-size-check`
- `scripts/ci-e2e-tests.sh` → Uses `deployment-validator.sh ci --skip-db-tests --skip-size-check`

## Environment Variables

| Variable         | Description                   | Required          | Default      |
| ---------------- | ----------------------------- | ----------------- | ------------ |
| `NODE_ENV`       | Node environment              | No                | `production` |
| `DEPLOYMENT_URL` | URL for post-deployment tests | Yes (post-deploy) | -            |
| `CI`             | CI environment flag           | No                | `false`      |

## Benefits

### 1. Single Source of Truth

All deployment validation logic is centralized in one script, ensuring consistency across all environments.

### 2. Easy Maintenance

Changes to validation logic only need to be made in one place, reducing the risk of inconsistencies.

### 3. Flexible Configuration

The script supports various modes and options to accommodate different use cases.

### 4. Comprehensive Coverage

The centralized system covers all aspects of production validation:

- Code quality
- Database integrity
- End-to-end functionality
- Performance
- Bundle size

### 5. Clear Documentation

Each component is well-documented with clear usage examples and explanations.

## Migration Guide

### From Old System

**Before:**

```bash
# Multiple separate commands
pnpm validate:production
pnpm db:test:all-triggers
pnpm test:e2e:critical
pnpm test:e2e:performance
pnpm test:e2e:full
pnpm test:e2e:pages
pnpm check:size:ci
```

**After:**

```bash
# Single centralized command
./scripts/deployment-validator.sh dry-run
```

### Package.json Updates

**Before:**

```json
{
  "ci:production:dry-run": "NODE_ENV=production pnpm validate:production && pnpm db:test:all-triggers && ..."
}
```

**After:**

```json
{
  "ci:production:dry-run": "./scripts/deployment-validator.sh dry-run"
}
```

### Pre-push Validation Changes

**Before:**

```bash
# Pre-push validation had redundant steps
pnpm run clean:all
pnpm run codegen
pnpm run lint:fix && pnpm run format
pnpm run validate:types && pnpm run fix:types
pnpm run typecheck
pnpm run check:circular
pnpm run check:dead:code
NODE_ENV=production pnpm run build
pnpm run check:size
./scripts/pre-push-coverage.sh
pnpm run db:test:all-triggers
pnpm run test:e2e:smoke
```

**After:**

```bash
# Pre-push validation uses centralized validator
./scripts/pre-push-coverage.sh
./scripts/deployment-validator.sh dry-run --fast
```

## Troubleshooting

### Common Issues

1. **Script not executable:**

   ```bash
   chmod +x scripts/deployment-validator.sh
   ```

2. **Missing environment variables:**

   ```bash
   export NODE_ENV=production
   export DEPLOYMENT_URL="https://your-app.vercel.app"
   ```

3. **Permission denied:**
   ```bash
   sudo chmod +x scripts/deployment-validator.sh
   ```

### Debug Mode

Enable verbose output for debugging:

```bash
./scripts/deployment-validator.sh dry-run --verbose
```

## Future Enhancements

1. **Parallel Execution**: Run independent validation steps in parallel for faster execution
2. **Caching**: Cache validation results to speed up subsequent runs
3. **Custom Validation**: Allow custom validation steps to be added
4. **Reporting**: Generate detailed validation reports
5. **Integration**: Add support for other CI/CD platforms

## Contributing

When adding new validation steps:

1. Add the step to the appropriate function in `scripts/deployment-validator.sh`
2. Update this documentation
3. Add corresponding package.json scripts if needed
4. Update CI scripts to use the centralized validator
5. Test thoroughly in all environments
