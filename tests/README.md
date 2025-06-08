# Test Directory Structure

This directory contains all test files for the application.

## Directory Structure

```
tests/
├── unit/           # Unit tests
│   └── components/ # Component tests
│       └── ui/     # UI component tests
└── e2e/           # End-to-end tests (Playwright)
```

## Running Tests

- Unit Tests: `pnpm test`
- Unit Tests (Watch Mode): `pnpm test:watch`
- Unit Tests (Coverage): `pnpm test:coverage`
- E2E Tests: `pnpm test:e2e`
- E2E Tests (UI Mode): `pnpm test:e2e:ui`

## Test Organization

- Unit tests are organized by feature/component type
- Each test file should be named with `.test.tsx` or `.spec.tsx` extension
- Tests should be placed in a directory structure that mirrors the source code structure
- E2E tests are managed by Playwright and are in the `e2e` directory
