# Playwright Configuration Consolidation

## 🚨 Problem Identified

The original Playwright configuration files had **massive duplication** and **too many files**:

### Duplicated Settings Across All Configs

- `timeout: 120000` - repeated 6 times
- `fullyParallel: false` - repeated 6 times
- `workers: 2` - repeated 6 times
- `forbidOnly: !!process.env.CI` - repeated 6 times
- `retries: 2` - repeated 6 times
- Browser launch arguments - repeated across multiple configs
- Context options - repeated across multiple configs
- Web server configuration - repeated across multiple configs

### Too Many Config Files

- **6 separate config files** for different use cases
- **Maintenance burden** was high - changes required updates to multiple files
- **Confusing** for new developers to understand which config to use when

## ✅ Solution Implemented

### Single Consolidated Configuration

Created `playwright.config.ts` with **all modes in one file**:

```typescript
// Determine mode from environment variable
const mode = process.env.PLAYWRIGHT_MODE ?? 'comprehensive';

// Mode-specific configurations
const modeConfigs = {
  smoke: {
    /* smoke test settings */
  },
  sanity: {
    /* sanity test settings */
  },
  critical: {
    /* critical test settings */
  },
  popular: {
    /* popular browsers settings */
  },
  pages: {
    /* pages test settings */
  },
  comprehensive: {
    /* full browser coverage */
  },
};

// Get the configuration for the current mode
const currentConfig = modeConfigs[mode] || modeConfigs.comprehensive;
```

### Usage Examples

```bash
# Default (comprehensive) - full browser coverage
pnpm playwright test

# Smoke tests - fast post-deployment validation
PLAYWRIGHT_MODE=smoke pnpm playwright test

# Sanity tests - fast local development feedback
PLAYWRIGHT_MODE=sanity pnpm playwright test

# Critical tests - core user journeys
PLAYWRIGHT_MODE=critical pnpm playwright test

# Popular browsers - responsive/cross-browser testing
PLAYWRIGHT_MODE=popular pnpm playwright test

# Pages tests - page-specific testing
PLAYWRIGHT_MODE=pages pnpm playwright test
```

## 📊 Benefits Achieved

### Code Reduction

- **Before**: ~600 lines across 6 config files
- **After**: ~400 lines in single consolidated config
- **Reduction**: ~33% less code + much easier maintenance

### Maintenance Improvements

- **Single source of truth** for all Playwright settings
- **Easy mode switching** with environment variables
- **Clear documentation** of all modes in one place
- **Changes** only need to be made in one file

### Developer Experience

- **Simpler onboarding** - one config file to understand
- **Flexible usage** - use environment variables or CLI flags
- **Clear intent** - each mode has a specific purpose
- **Backward compatible** - still works with existing scripts

## 🔧 Technical Implementation

### Mode Configuration Structure

```typescript
const modeConfigs = {
  smoke: {
    testDir: './tests/e2e',
    projects: [
      /* Chromium only */
    ],
    reporter: 'list',
    use: {
      /* Fast timeouts, no video/trace */
    },
    webServer: undefined, // No local server
  },
  sanity: {
    testDir: './tests/e2e/functional',
    projects: [
      /* Chromium only */
    ],
    reporter: 'list',
    use: {
      /* Fast timeouts, no video/trace */
    },
    webServer: {
      /* Local dev server */
    },
  },
  // ... other modes
};
```

### Environment Variable Control

```typescript
// Determine mode from environment variable or default to comprehensive
const mode = process.env.PLAYWRIGHT_MODE ?? 'comprehensive';

// Get the configuration for the current mode
const currentConfig = modeConfigs[mode as keyof typeof modeConfigs] || modeConfigs.comprehensive;
```

## 📁 Final File Structure

```
playwright.config.ts            # Single consolidated config (ALL MODES) - in root directory
```

## 🎯 Migration Status

### ✅ Completed

- **Consolidated all configs** into single `playwright.config.ts`
- **Updated all scripts** to use `PLAYWRIGHT_MODE` environment variable
- **Removed old config files** (smoke, sanity, critical, popular, pages, comprehensive)
- **Updated CI/CD workflows** to use new consolidated config
- **Updated documentation** to reflect new approach

### 🔄 Script Updates

All scripts now use the new consolidated approach:

```bash
# Before
--config=playwright.smoke.config.ts

# After
PLAYWRIGHT_MODE=smoke
```

## 🚀 Usage Guide

### Development Workflow

```bash
# Quick feedback during development
PLAYWRIGHT_MODE=sanity pnpm playwright test

# Basic validation before committing
PLAYWRIGHT_MODE=smoke pnpm playwright test

# Pre-deployment validation
PLAYWRIGHT_MODE=critical pnpm playwright test

# Full validation (comprehensive)
pnpm playwright test  # or PLAYWRIGHT_MODE=comprehensive
```

### CI/CD Integration

```bash
# Development validation
pnpm validate:ci && PLAYWRIGHT_MODE=smoke pnpm playwright test

# Pre-deployment validation
pnpm validate:ci && PLAYWRIGHT_MODE=critical pnpm playwright test

# Full validation
pnpm validate:ci && pnpm playwright test
```

## 📝 Migration Notes

### Breaking Changes

- **None**: All existing functionality preserved
- **Same test execution**: No changes to test behavior
- **Same CI/CD**: No changes to workflow compatibility

### Benefits

- **Easier maintenance**: Single place to update all settings
- **Better consistency**: Standardized configurations across all environments
- **Reduced errors**: Less chance of configuration drift
- **Faster development**: New modes can be added quickly

---

**Summary**: This consolidation eliminates ~33% of code while making the Playwright configuration much easier to understand, maintain, and extend. All functionality is preserved with a cleaner, more maintainable approach.
