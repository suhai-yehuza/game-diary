# Test Organization Migration Guide

This guide helps teams migrate to the new test organization structure that reduces redundancies and maintains clear boundaries between test types.

## Overview

The new test organization introduces:

- **Clear test boundaries** between unit, integration, and E2E tests
- **Shared utilities** to reduce duplication
- **Better organization** with dedicated directories for each test type
- **Automated auditing** to identify redundancies

## Migration Steps

### Phase 1: Audit Current State

1. **Run the redundancy auditor**:

   ```bash
   pnpm test:audit-redundancies
   ```

2. **Review the report** and identify:
   - Boundary violations
   - Duplicate test cases
   - Duplicate mocks
   - Areas for improvement

3. **Document findings** in a spreadsheet or issue tracker

### Phase 2: Create Shared Utilities

1. **Set up shared test data**:

   ```bash
   # Use the existing shared utilities
   import { createMockUser, createMockGameLog } from '@/tests/shared';
   ```

2. **Replace duplicate mocks**:

   ```typescript
   // Before (duplicated in multiple files)
   const mockUser = { id: '1', email: 'test@example.com', username: 'testuser' };

   // After (using shared utilities)
   import { createMockUser } from '@/tests/shared';
   const mockUser = createMockUser({ email: 'test@example.com' });
   ```

3. **Use shared assertions**:

   ```typescript
   // Before (duplicated assertions)
   expect(user).toHaveProperty('id');
   expect(user).toHaveProperty('email');
   expect(user.email).toBe('test@example.com');

   // After (using shared assertions)
   import { assertUserData } from '@/tests/shared';
   assertUserData(user, { email: 'test@example.com' });
   ```

### Phase 3: Fix Boundary Violations

#### Unit Tests

**What to fix**:

- Remove real HTTP requests
- Remove database connections
- Remove integration testing

**Example fixes**:

```typescript
// ❌ Bad: Unit test making real HTTP request
test('should fetch user data', async () => {
  const response = await fetch('/api/users/1');
  expect(response.status).toBe(200);
});

// ✅ Good: Unit test with mocked fetch
test('should fetch user data', async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: '1', email: 'test@example.com' }),
  });
  global.fetch = mockFetch;

  const result = await fetchUserData('1');
  expect(result.email).toBe('test@example.com');
});
```

#### Integration Tests

**What to fix**:

- Remove utility function testing
- Focus on component interactions
- Test real API endpoints

**Example fixes**:

```typescript
// ❌ Bad: Integration test testing utility function
test('should format duration', () => {
  expect(formatDuration(65)).toBe('1m 5s');
});

// ✅ Good: Integration test testing API endpoint
test('should return user data via API', async () => {
  const response = await fetch('/api/users/1');
  expect(response.status).toBe(200);
  const user = await response.json();
  expect(user).toHaveProperty('email');
});
```

#### E2E Tests

**What to fix**:

- Remove direct API testing
- Focus on user journeys
- Test from user perspective

**Example fixes**:

```typescript
// ❌ Bad: E2E test testing API directly
test('API returns correct data', async ({ page }) => {
  const response = await page.request.get('/api/users');
  expect(response.status()).toBe(200);
});

// ✅ Good: E2E test testing user journey
test('user can view profile', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.locator('[data-testid="user-email"]')).toBeVisible();
  await expect(page.locator('[data-testid="user-email"]')).toHaveText('test@example.com');
});
```

### Phase 4: Update Test Files

1. **Update imports** to use shared utilities:

   ```typescript
   // Old imports
   import { mockUser } from './test-utils';

   // New imports
   import { createMockUser } from '@/tests/shared';
   ```

2. **Remove duplicate test data**:

   ```typescript
   // Remove this from individual test files
   const mockUsers = [
     { id: '1', email: 'user1@example.com' },
     { id: '2', email: 'user2@example.com' },
   ];

   // Use shared data instead
   import { mockUsers } from '@/tests/shared';
   ```

3. **Update test configurations**:
   ```typescript
   // Ensure proper test type configuration
   export default defineConfig({
     test: {
       environment: 'jsdom', // For unit tests
       setupFiles: ['./tests/unit/setup.ts'],
     },
   });
   ```

### Phase 5: Update CI/CD Pipeline

1. **Add redundancy audit** to CI:

   ```yaml
   # .github/workflows/test.yml
   - name: Audit test redundancies
     run: pnpm test:audit-redundancies
   ```

2. **Update test commands**:

   ```yaml
   - name: Run unit tests
     run: pnpm test:unit

   - name: Run integration tests
     run: pnpm test:integration

   - name: Run E2E tests
     run: pnpm test:e2e:smoke
   ```

### Phase 6: Team Training

1. **Document the new boundaries**:
   - Share `tests/TEST_BOUNDARIES.md`
   - Explain the purpose of each test type
   - Show examples of good vs bad tests

2. **Train on shared utilities**:
   - Show how to use `@/tests/shared`
   - Demonstrate creating new shared utilities
   - Explain when to use vs when not to use

3. **Establish review process**:
   - Review new tests for boundary compliance
   - Check for proper use of shared utilities
   - Ensure no duplication

## Common Migration Patterns

### Pattern 1: Moving API Client Tests

**Before** (mixed in unit tests):

```typescript
// tests/unit/lib/utils/api-client.test.ts
test('should make HTTP request', async () => {
  const response = await fetch('/api/users');
  expect(response.status).toBe(200);
});
```

**After** (proper separation):

```typescript
// tests/unit/lib/utils/api-client.test.ts (unit tests)
test('should build correct URL', () => {
  const url = buildApiUrl('/users', { page: 1 });
  expect(url).toBe('/api/users?page=1');
});

// tests/integration/api-endpoints.integration.test.ts (integration tests)
test('should return users via API', async () => {
  const response = await fetch('/api/users');
  expect(response.status).toBe(200);
});
```

### Pattern 2: Consolidating Mock Data

**Before** (duplicated everywhere):

```typescript
// tests/unit/components/UserCard.test.tsx
const mockUser = { id: '1', email: 'test@example.com' };

// tests/integration/user-api.integration.test.ts
const mockUser = { id: '1', email: 'test@example.com' };

// tests/e2e/functional/user.spec.ts
const mockUser = { id: '1', email: 'test@example.com' };
```

**After** (shared utilities):

```typescript
// tests/shared/utils/test-data.ts
export const createMockUser = (overrides = {}) => ({
  id: generateId('user'),
  email: 'test@example.com',
  ...overrides,
});

// All test files
import { createMockUser } from '@/tests/shared';
const mockUser = createMockUser();
```

### Pattern 3: Fixing Boundary Violations

**Before** (unit test with real dependencies):

```typescript
// tests/unit/lib/database.test.ts
test('should connect to database', async () => {
  const db = await connectToDatabase(process.env.DATABASE_URL);
  expect(db).toBeDefined();
});
```

**After** (proper unit test):

```typescript
// tests/unit/lib/database.test.ts
test('should create connection string', () => {
  const connectionString = createConnectionString({
    host: 'localhost',
    port: 5432,
    database: 'test',
  });
  expect(connectionString).toBe('postgresql://localhost:5432/test');
});

// tests/integration/database-operations.integration.test.ts
test('should connect to database', async () => {
  const db = await connectToDatabase(process.env.DATABASE_URL);
  expect(db).toBeDefined();
});
```

## Validation Checklist

After migration, verify:

- [ ] `pnpm test:audit-redundancies` passes with no boundary violations
- [ ] All test suites still pass (`pnpm test:unit`, `pnpm test:integration`, `pnpm test:e2e`)
- [ ] No duplicate test data or mocks across test files
- [ ] Shared utilities are being used consistently
- [ ] Test boundaries are respected
- [ ] CI/CD pipeline includes redundancy audit
- [ ] Team is trained on new organization

## Troubleshooting

### Common Issues

1. **Import errors after migration**:

   ```bash
   # Check if shared utilities are properly exported
   pnpm test:unit --run
   ```

2. **Tests failing after boundary fixes**:

   ```bash
   # Run tests individually to isolate issues
   pnpm test:unit --run tests/unit/lib/utils/api-client.test.ts
   ```

3. **Duplicate mocks still present**:
   ```bash
   # Run audit to find remaining duplicates
   pnpm test:audit-redundancies
   ```

### Getting Help

- Review `tests/TEST_BOUNDARIES.md` for boundary definitions
- Check `tests/shared/README.md` for shared utilities documentation
- Run `pnpm test:audit-redundancies` to identify specific issues
- Consult the team for guidance on test organization

## Benefits After Migration

1. **Faster test execution**: Unit tests run quickly without external dependencies
2. **Clearer test purpose**: Each test type has a distinct responsibility
3. **Reduced maintenance**: Shared utilities eliminate duplication
4. **Better organization**: Easy to find and understand tests
5. **Improved reliability**: Proper boundaries prevent test interference
6. **Easier onboarding**: New team members understand test structure quickly
