# E2E Test Scripts Reorganization

## Overview

The e2e test scripts have been reorganized to improve clarity, consistency, and maintainability. This document outlines the changes made and the new structure.

## Changes Made

### 1. **Logical Grouping with Comments**

All e2e scripts are now organized into logical groups with clear section headers:

- `// E2E Testing` - Core e2e testing commands
- `// E2E Coverage` - Coverage-specific commands
- `// E2E Browser Testing` - Browser-specific commands
- `// E2E Feature Testing` - Feature-specific commands
- `// E2E Combined Testing` - Combined test suites
- `// E2E Development` - Development-focused commands
- `// E2E Utilities` - Utility commands

### 2. **Consistent Naming Patterns**

- **Core commands**: `test:e2e`, `test:e2e:fast`, `test:e2e:ui`, `test:e2e:debug`
- **Coverage commands**: `test:e2e:coverage`, `test:e2e:coverage:fast`, `test:e2e:coverage:report`
- **Browser commands**: `test:e2e:chromium`, `test:e2e:firefox`, `test:e2e:safari`, `test:e2e:desktop`, `test:e2e:mobile`, `test:e2e:tablet`
- **Feature commands**: `test:e2e:responsive`, `test:e2e:cross-browser`
- **Combined commands**: `test:e2e:all-browsers`, `test:e2e:all-viewports`
- **Development commands**: `test:e2e:dev`, `test:e2e:dev:watch`
- **Utility commands**: `test:e2e:clean`, `test:e2e:server`, `test:e2e:wait`

### 3. **Removed Redundancies**

- **Removed**: `test:e2e:fast:timeout` (redundant with timeout parameter in scripts)
- **Removed**: `test:e2e:coverage:fast:timeout` (redundant)
- **Removed**: `test:e2e:fast:dev` (renamed to `test:e2e:fast`)
- **Removed**: `test:e2e:fast:dev:watch` (renamed to `test:e2e:fast:watch`)
- **Removed**: `test:e2e:optimized` (redundant with `test:e2e`)
- **Removed**: `test:e2e:optimized:fast` (redundant with `test:e2e:coverage:fast`)
- **Removed**: `test:e2e:optimized:timeout` (redundant)
- **Removed**: `test:e2e:ipad` (duplicate of `test:e2e:tablet`)

### 4. **Simplified Browser Configurations**

- **Desktop**: Now uses only the 3 core browsers (chromium, firefox, webkit) instead of 6
- **Mobile**: Simplified to 2 representative devices (Mobile Chrome, iPhone) instead of 5
- **Tablet**: Simplified to 1 representative device (Tablet) instead of 3

### 5. **Improved Development Workflow**

- `test:e2e:dev` → `test:e2e:fast` (clearer naming)
- `test:e2e:dev:watch` → `test:e2e:fast:watch` (consistent with fast naming)
- `test:e2e:fast` now uses `test:e2e:fast` instead of the old `test:e2e:fast:dev`

## New Script Structure

### Core E2E Testing

```bash
pnpm test:e2e                    # All browsers with coverage
pnpm test:e2e:fast              # Fast tests (Chromium only, fast config)
pnpm test:e2e:fast:watch        # Fast tests in watch mode
pnpm test:e2e:ui                # UI mode for interactive testing
pnpm test:e2e:debug             # Debug mode with enhanced logging
```

### Coverage Commands

```bash
pnpm test:e2e:coverage          # All browsers with coverage
pnpm test:e2e:coverage:fast     # Chromium with coverage
pnpm test:e2e:coverage:report   # Generate coverage report
pnpm test:e2e:coverage:html     # Generate and open HTML coverage report
```

### Browser-Specific Testing

```bash
pnpm test:e2e:chromium          # Chromium only
pnpm test:e2e:firefox           # Firefox only
pnpm test:e2e:safari            # Safari only
pnpm test:e2e:desktop           # All desktop browsers
pnpm test:e2e:mobile            # Mobile devices
pnpm test:e2e:tablet            # Tablet devices
```

### Feature Testing

```bash
pnpm test:e2e:responsive        # Responsive design tests
pnpm test:e2e:cross-browser     # Cross-browser compatibility tests
```

### Combined Test Suites

```bash
pnpm test:e2e:all-browsers      # Desktop + Mobile + Tablet
pnpm test:e2e:all-viewports     # Responsive + Cross-browser
```

### Development Commands

```bash
pnpm test:e2e:dev               # Alias for test:e2e:fast
pnpm test:e2e:dev:watch         # Alias for test:e2e:fast:watch
```

### Utility Commands

```bash
pnpm test:e2e:clean             # Clean test artifacts
pnpm test:e2e:server            # Start dev server on port 8080
pnpm test:e2e:wait              # Wait for server to be ready
```

## Migration Guide

### For Developers

- **Before**: `pnpm test:e2e:fast:dev` → **After**: `pnpm test:e2e:fast`
- **Before**: `pnpm test:e2e:fast:dev:watch` → **After**: `pnpm test:e2e:fast:watch`
- **Before**: `pnpm test:e2e:optimized` → **After**: `pnpm test:e2e`
- **Before**: `pnpm test:e2e:ipad` → **After**: `pnpm test:e2e:tablet`

### For CI/CD

- **Before**: `pnpm test:e2e:optimized:fast` → **After**: `pnpm test:e2e:coverage:fast`
- **Before**: `pnpm test:e2e:fast:timeout` → **After**: Use timeout parameter in scripts

## Benefits

1. **Clearer Intent**: Script names now clearly indicate their purpose
2. **Reduced Confusion**: Eliminated similar-sounding scripts with different behaviors
3. **Better Organization**: Logical grouping makes it easier to find the right command
4. **Simplified Maintenance**: Fewer scripts to maintain and update
5. **Consistent Patterns**: All scripts follow the same naming conventions
6. **Improved Performance**: Simplified browser configurations run faster

## Script Dependencies

The scripts rely on these helper files:

- `scripts/e2e-run.sh` - Basic e2e test runner
- `scripts/e2e-run-with-coverage.sh` - E2e test runner with coverage
- `scripts/e2e-helpers.sh` - Common e2e helper functions
- `scripts/e2e-debug.sh` - Debug mode setup
- `scripts/e2e-coverage-report.ts` - Coverage report generation

## Configuration Files

- `playwright.config.ts` - Main e2e configuration (all browsers)
- `playwright.fast.config.ts` - Fast e2e configuration (Chromium only)
