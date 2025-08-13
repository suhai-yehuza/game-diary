# Shared Test Utilities

This directory contains shared utilities, mocks, and test data that can be used across all test types (unit, integration, and E2E) to reduce duplication and maintain consistency.

## Directory Structure

```
tests/shared/
├── mocks/              # Shared mock data and functions
│   ├── api/           # API response mocks
│   ├── database/      # Database mock data
│   ├── components/    # Component mock data
│   └── index.ts       # Centralized mock exports
├── utils/             # Shared test utilities
│   ├── test-data.ts   # Common test data generators
│   ├── assertions.ts  # Custom assertion helpers
│   ├── setup.ts       # Common test setup functions
│   └── index.ts       # Centralized utility exports
├── fixtures/          # Test fixtures and static data
│   ├── users.json     # User test data
│   ├── game-logs.json # Game log test data
│   └── sports.json    # Sports data fixtures
└── types/             # Shared test type definitions
    ├── test-data.ts   # Test data type definitions
    └── mocks.ts       # Mock type definitions
```

## Usage Guidelines

### 1. **When to Use Shared Utilities**

**Use shared utilities when:**

- The same test data is needed across multiple test types
- Common setup logic is repeated
- Mock data is used in multiple places
- Assertion patterns are repeated

**Don't use shared utilities when:**

- Test-specific data or logic is needed
- The utility would create tight coupling between test types
- The utility would make tests harder to understand

### 2. **Import Patterns**

```typescript
// ✅ Good: Import from shared utilities
import { createMockUser, mockApiResponse } from '@/tests/shared/mocks';
import { assertUserData } from '@/tests/shared/utils/assertions';

// ❌ Bad: Duplicate test data in each test file
const mockUser = { id: '1', email: 'test@example.com' }; // Duplicated everywhere
```

### 3. **Mock Data Guidelines**

- Keep mock data realistic but simple
- Use consistent naming conventions
- Provide factory functions for dynamic data
- Include type definitions for all mock data

## Shared Utilities

### 1. **Test Data Generators**

```typescript
// tests/shared/utils/test-data.ts
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: generateId(),
  email: 'test@example.com',
  username: 'testuser',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockGameLog = (overrides: Partial<GameLog> = {}): GameLog => ({
  id: generateId(),
  user_id: generateId(),
  game_id: generateId(),
  notes: 'Test game log',
  created_at: new Date().toISOString(),
  ...overrides,
});
```

### 2. **Custom Assertions**

```typescript
// tests/shared/utils/assertions.ts
export const assertUserData = (user: any, expected: Partial<User>) => {
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('email');
  expect(user).toHaveProperty('username');

  if (expected.email) {
    expect(user.email).toBe(expected.email);
  }
  if (expected.username) {
    expect(user.username).toBe(expected.username);
  }
};

export const assertApiResponse = (response: any, expectedStatus: number = 200) => {
  expect(response).toHaveProperty('status');
  expect(response.status).toBe(expectedStatus);

  if (expectedStatus === 200) {
    expect(response).toHaveProperty('data');
  }
};
```

### 3. **Common Setup Functions**

```typescript
// tests/shared/utils/setup.ts
export const setupTestDatabase = async () => {
  // Common database setup logic
};

export const cleanupTestDatabase = async () => {
  // Common database cleanup logic
};

export const setupMockServer = () => {
  // Common mock server setup
};
```

## Mock Data

### 1. **API Response Mocks**

```typescript
// tests/shared/mocks/api/index.ts
export const mockApiResponses = {
  users: {
    list: {
      status: 200,
      data: [
        { id: '1', email: 'user1@example.com', username: 'user1' },
        { id: '2', email: 'user2@example.com', username: 'user2' },
      ],
    },
    create: {
      status: 201,
      data: { id: '3', email: 'new@example.com', username: 'newuser' },
    },
  },
  gameLogs: {
    list: {
      status: 200,
      data: [{ id: '1', user_id: '1', game_id: 'game1', notes: 'Great game!' }],
    },
  },
};
```

### 2. **Database Mock Data**

```typescript
// tests/shared/mocks/database/index.ts
export const mockDatabaseData = {
  users: [
    { id: '1', email: 'user1@example.com', username: 'user1' },
    { id: '2', email: 'user2@example.com', username: 'user2' },
  ],
  gameLogs: [
    { id: '1', user_id: '1', game_id: 'game1', notes: 'Great game!' },
    { id: '2', user_id: '2', game_id: 'game2', notes: 'Amazing performance!' },
  ],
};
```

### 3. **Component Mock Data**

```typescript
// tests/shared/mocks/components/index.ts
export const mockComponentProps = {
  Button: {
    default: {
      children: 'Click me',
      onClick: vi.fn(),
    },
    disabled: {
      children: 'Disabled',
      disabled: true,
      onClick: vi.fn(),
    },
  },
  UserCard: {
    default: {
      user: createMockUser(),
      onEdit: vi.fn(),
    },
  },
};
```

## Type Definitions

### 1. **Test Data Types**

```typescript
// tests/shared/types/test-data.ts
export interface TestUser extends User {
  testId?: string; // For test identification
}

export interface TestGameLog extends GameLog {
  testId?: string;
}

export interface MockApiResponse<T = any> {
  status: number;
  data: T;
  error?: string;
}
```

### 2. **Mock Types**

```typescript
// tests/shared/types/mocks.ts
export interface MockConfig {
  delay?: number;
  shouldFail?: boolean;
  errorMessage?: string;
}

export interface MockApiConfig extends MockConfig {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}
```

## Best Practices

### 1. **Consistency**

- Use consistent naming conventions across all shared utilities
- Follow the same patterns for similar functionality
- Use TypeScript for all shared utilities

### 2. **Flexibility**

- Provide factory functions with sensible defaults
- Allow overrides for test-specific needs
- Don't make shared utilities too rigid

### 3. **Documentation**

- Document all shared utilities with JSDoc comments
- Provide usage examples
- Keep documentation up to date

### 4. **Testing**

- Test shared utilities themselves
- Ensure utilities work across all test types
- Validate type safety

## Migration Guide

### 1. **Identify Duplication**

Look for:

- Repeated test data
- Similar setup logic
- Duplicate mock configurations
- Repeated assertion patterns

### 2. **Extract Common Code**

Move common code to shared utilities:

- Create factory functions for test data
- Extract common setup logic
- Centralize mock configurations

### 3. **Update Imports**

Replace duplicated code with imports from shared utilities:

- Update import statements
- Remove duplicate definitions
- Ensure all tests still pass

### 4. **Validate**

- Run all test suites
- Check for any broken imports
- Verify test coverage is maintained
- Ensure tests are still readable and maintainable

## Examples

### Before (Duplicated Code)

```typescript
// tests/unit/lib/utils/api-client.test.ts
const mockUser = { id: '1', email: 'test@example.com', username: 'testuser' };

// tests/integration/api-endpoints.integration.test.ts
const mockUser = { id: '1', email: 'test@example.com', username: 'testuser' };

// tests/e2e/functional/auth.spec.ts
const mockUser = { id: '1', email: 'test@example.com', username: 'testuser' };
```

### After (Shared Utilities)

```typescript
// tests/shared/mocks/index.ts
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  ...overrides,
});

// All test files
import { createMockUser } from '@/tests/shared/mocks';
const mockUser = createMockUser();
```

This approach reduces duplication, improves maintainability, and ensures consistency across all test types.
