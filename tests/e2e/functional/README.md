# Functional E2E Tests

This directory contains the compound test hierarchy where each level extends the tests from the level below it.

## Test Hierarchy

```
Mock Verification (Prerequisite)
    ↓
Fast Tests (Base Level)
    ↓
Smoke Tests (Extends Fast)
    ↓
Critical Tests (Extends Smoke)
    ↓
Responsive Tests (Extends Critical)
    ↓
Full Tests (Extends Responsive)
```

## Files

- **`mock-verification.spec.ts`** - Prerequisite tests for API mocking validation
- **`fast.spec.ts`** - Base level tests with basic functionality
- **`smoke.spec.ts`** - Extends fast with additional critical functionality
- **`critical.spec.ts`** - Extends smoke with core user flows
- **`responsive.spec.ts`** - Extends critical with responsive design testing
- **`full.spec.ts`** - Extends responsive with comprehensive testing

## Usage

Each test file imports the previous level to maintain the compound structure:

```typescript
// In smoke.spec.ts
import '@tests/e2e/functional/fast.spec'; // Extends fast tests

// In critical.spec.ts
import '@tests/e2e/functional/smoke.spec'; // Extends smoke tests

// And so on...
```

## Running Tests

```bash
# Run specific levels
pnpm test:e2e:mock-verification
pnpm test:e2e:quickie
pnpm test:e2e:smoke
pnpm test:e2e:critical
pnpm test:e2e:responsive
pnpm test:e2e:full

# Run compound hierarchy
pnpm test:e2e:compound
```

## Configuration

- **Fast/Smoke:** Uses `playwright.fast.config.ts` (Chromium only, 1 worker)
- **Critical/Responsive/Full:** Uses `playwright.popular.config.ts` (Multiple browsers, 2-4 workers)

See the main [README.md](../README.md) for detailed information about each test level.
