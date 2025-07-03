# Package.json Scripts Optimization

## Overview

This document outlines the optimization of `package.json` scripts to reduce redundancy, improve organization, and enhance maintainability.

## Key Changes Made

### 1. **Eliminated Redundant Timed Scripts**

- **Before**: 15+ individual `timed:*` scripts
- **After**: Single `timed` script that can time any command
- **Usage**: `pnpm timed "pnpm build"` or `pnpm timed "pnpm test:unit"`

### 2. **Consolidated Duplicate E2E Tests**

- **Removed**: `test:e2e:fast` and `test:e2e:smoke` (they were identical)
- **Kept**: `test:e2e:smoke` as the primary smoke test
- **Maintained**: All other E2E test variations for specific use cases

### 3. **Improved Organization with Clear Sections**

- Development
- Timing Wrapper
- Cleanup
- Code Quality
- Testing
- E2E Testing
- Validation
- Database
- Code Generation
- Analysis & Performance
- Dependencies
- Git Hooks
- CI Pipeline Scripts
- Legacy CI Validation (Deprecated)
- Workflow Scripts
- Debug & Maintenance

### 4. **Removed Redundant Validation Scripts**

- Consolidated overlapping validation commands
- Marked legacy CI validation scripts as deprecated
- Streamlined validation workflow

## Usage Examples

### Timing Any Command

```bash
# Time a build
pnpm timed "pnpm build"

# Time tests
pnpm timed "pnpm test:unit"

# Time validation
pnpm timed "pnpm validate:ci"
```

### Common Development Workflows

```bash
# Quick development setup
pnpm dev

# Full validation before deployment
pnpm validate:predeploy

# Complete test suite
pnpm test:all:strict

# Database setup
pnpm db:setup:dev
```

### CI/CD Commands

```bash
# Production deployment
pnpm ci:production

# Staging deployment
pnpm ci:staging

# Quality gate
pnpm ci:quality-gate
```

## Script Categories

### Development

- `dev`, `dev:staging` - Development servers
- `build`, `build:staging` - Production builds
- `start`, `start:staging` - Production servers

### Code Quality

- `lint`, `lint:fix` - ESLint operations
- `typecheck` - TypeScript checking
- `format`, `format:check` - Prettier formatting
- `fix` - Complete code fix (lint + format + types)

### Testing

- `test` - Basic unit tests
- `test:coverage` - Tests with coverage
- `test:strict` - Verbose tests with coverage
- `test:all` - Unit + E2E tests
- `test:e2e:*` - Various E2E test configurations

### Validation

- `validate:ci` - CI validation (lint + typecheck + unit tests)
- `validate:predeploy` - Pre-deployment validation
- `validate:all` - Complete validation suite

### Database

- `db:migrate:*` - Database migrations
- `db:setup:*` - Database setup
- `db:studio` - Database GUI

## Migration Guide

### From Old Timed Scripts

```bash
# Old way
pnpm timed:build

# New way
pnpm timed "pnpm build"
```

### From Duplicate E2E Tests

```bash
# Old way (both did the same thing)
pnpm test:e2e:fast
pnpm test:e2e:smoke

# New way (use smoke)
pnpm test:e2e:smoke
```

## Benefits

1. **Reduced Maintenance**: Fewer scripts to maintain
2. **Better Organization**: Clear categorization with headers
3. **Flexible Timing**: Time any command, not just predefined ones
4. **Eliminated Duplicates**: No more redundant functionality
5. **Clearer Intent**: Script names and organization make purpose obvious
6. **Easier Onboarding**: New developers can quickly understand available commands

## Deprecated Scripts

The following scripts are marked as deprecated but kept for backward compatibility:

- `ci:validation:*` - Use the new validation scripts instead
- Legacy timed scripts - Use `pnpm timed "<command>"` instead

## Future Improvements

1. Consider removing deprecated scripts in next major version
2. Add script aliases for common combinations
3. Implement script validation to catch future duplicates
4. Add performance monitoring for frequently used scripts
