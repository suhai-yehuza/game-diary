# Test Boundaries and Organization

This document defines clear boundaries between different test types to reduce redundancies and ensure each test serves a distinct purpose.

## Test Type Boundaries

### 1. **Unit Tests** (`tests/unit/`)

**Purpose**: Test individual functions, components, and utilities in isolation.

**Scope**:

- Individual function behavior and edge cases
- Component rendering and interactions
- Hook behavior and state management
- Utility function logic
- Input validation and error handling
- Mock dependencies and external services

**What Unit Tests Should NOT Do**:

- Make real HTTP requests
- Connect to real databases
- Test integration between multiple components
- Test end-to-end user flows

**Examples**:

```typescript
// ✅ Good: Testing utility function logic
describe('formatDuration', () => {
  it('should format seconds correctly', () => {
    expect(formatDuration(65)).toBe('1m 5s');
  });
});

// ✅ Good: Testing component rendering
describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});

// ❌ Bad: Making real HTTP requests in unit tests
describe('apiClient', () => {
  it('should fetch data', async () => {
    const data = await fetch('/api/users'); // Real HTTP call
    expect(data).toBeDefined();
  });
});
```

### 2. **Integration Tests** (`tests/integration/`)

**Purpose**: Test the interaction between multiple components, services, or systems.

**Scope**:

- API endpoint behavior with real HTTP requests
- Database operations and triggers
- GraphQL endpoint functionality
- Cross-component interactions
- Service integration
- Real external API calls (when appropriate)

**What Integration Tests Should NOT Do**:

- Test individual function logic (use unit tests)
- Test UI interactions (use E2E tests)
- Test browser-specific behavior
- Test responsive design

**Examples**:

```typescript
// ✅ Good: Testing API endpoint behavior
describe('User API Endpoints', () => {
  it('should create user via HTTP', async () => {
    const response = await fetch('/api/user', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    expect(response.status).toBe(201);
  });
});

// ✅ Good: Testing database operations
describe('Database Operations', () => {
  it('should insert and retrieve user', async () => {
    const user = await db.insert(users).values({ email: 'test@example.com' });
    const retrieved = await db.query.users.findFirst({ where: eq(users.id, user.id) });
    expect(retrieved).toBeDefined();
  });
});

// ❌ Bad: Testing individual utility functions
describe('formatDuration', () => {
  it('should format seconds', () => {
    expect(formatDuration(65)).toBe('1m 5s'); // This belongs in unit tests
  });
});
```

### 3. **E2E Tests** (`tests/e2e/`)

**Purpose**: Test complete user journeys and application functionality from a user's perspective.

**Scope**:

- Complete user workflows
- UI interactions and user experience
- Cross-browser compatibility
- Responsive design
- Performance from user perspective
- Accessibility
- Real user scenarios

**What E2E Tests Should NOT Do**:

- Test individual function logic (use unit tests)
- Test API endpoints directly (use integration tests)
- Test database operations directly
- Test utility functions

**Examples**:

```typescript
// ✅ Good: Testing complete user journey
test('user can sign up and access dashboard', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="sign-up-button"]');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.click('[data-testid="submit-button"]');
  await expect(page).toHaveURL('/dashboard');
});

// ✅ Good: Testing responsive design
test('page is responsive on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page.locator('.mobile-menu')).toBeVisible();
});

// ❌ Bad: Testing API endpoints directly
test('API returns correct data', async ({ page }) => {
  const response = await page.request.get('/api/users');
  expect(response.status()).toBe(200); // This belongs in integration tests
});
```

## Test Organization Principles

### 1. **Clear Separation of Concerns**

Each test type should have a distinct responsibility:

| Test Type   | Tests                           | Mocks                     | Dependencies      |
| ----------- | ------------------------------- | ------------------------- | ----------------- |
| Unit        | Individual functions/components | All external dependencies | None              |
| Integration | Component interactions          | External APIs only        | Internal services |
| E2E         | User journeys                   | None (or minimal)         | Full application  |

### 2. **Progressive Test Hierarchy**

Tests should build upon each other without duplication:

```
Unit Tests → Integration Tests → E2E Tests
     ↓              ↓              ↓
  Function    Component      User Journey
  Logic       Interaction    Experience
```

### 3. **DRY (Don't Repeat Yourself)**

- Common test utilities should be shared
- Test data should be centralized
- Mock configurations should be reusable
- Test setup should be consistent

## Specific Redundancy Areas to Address

### 1. **API Client Testing**

**Current Issue**: Both unit and integration tests test API functionality.

**Solution**:

- **Unit Tests**: Test utility functions (parameter handling, error processing, URL building)
- **Integration Tests**: Test actual HTTP behavior and endpoint responses

### 2. **GraphQL Testing**

**Current Issue**: Both unit and integration tests test GraphQL functionality.

**Solution**:

- **Unit Tests**: Test resolver logic, input validation, error handling
- **Integration Tests**: Test endpoint availability, schema introspection, query execution

### 3. **Database Testing**

**Current Issue**: Both unit and integration tests test database operations.

**Solution**:

- **Unit Tests**: Test query builders, data transformation utilities
- **Integration Tests**: Test actual database operations and triggers

### 4. **Security Testing**

**Current Issue**: Both unit and integration tests test security features.

**Solution**:

- **Unit Tests**: Test security utility functions, encryption/decryption
- **Integration Tests**: Test security endpoints, authentication flows
- **E2E Tests**: Test security from user perspective (login, protected routes)

## Implementation Guidelines

### 1. **Test File Naming**

Use clear naming conventions to indicate test type:

```
tests/
├── unit/
│   ├── lib/
│   │   └── utils/
│   │       └── api-client.test.ts          # Unit tests for API client utilities
│   └── components/
│       └── Button.test.tsx                 # Unit tests for Button component
├── integration/
│   ├── api-endpoints.integration.test.ts   # Integration tests for API endpoints
│   └── database-operations.integration.test.ts # Integration tests for DB operations
└── e2e/
    ├── functional/
    │   └── smoke.spec.ts                   # E2E tests for smoke scenarios
    └── pages/
        └── home.spec.ts                    # E2E tests for home page
```

### 2. **Test Configuration**

Each test type should have appropriate configuration:

```typescript
// Unit tests: Fast, isolated, mocked
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/unit/setup.ts'],
    mockReset: true,
  },
});

// Integration tests: Real dependencies, slower
export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/integration/setup.ts'],
    testTimeout: 10000,
  },
});

// E2E tests: Full application, slowest
export default defineConfig({
  test: {
    use: {
      baseURL: 'http://localhost:3000',
      trace: 'on-first-retry',
    },
    timeout: 30000,
  },
});
```

### 3. **Test Data Management**

- **Unit Tests**: Use static test data or simple mocks
- **Integration Tests**: Use test database with controlled data
- **E2E Tests**: Use mock server or controlled test environment

### 4. **Coverage Expectations**

Different test types should have different coverage expectations:

| Test Type         | Coverage Target | Focus                                |
| ----------------- | --------------- | ------------------------------------ |
| Unit Tests        | 80%+            | Function logic, edge cases           |
| Integration Tests | 70%+            | Component interactions, API behavior |
| E2E Tests         | 60%+            | User journeys, critical paths        |

## Migration Strategy

### Phase 1: Document Current State

- [x] Create test boundaries document
- [ ] Audit existing tests for redundancies
- [ ] Identify overlapping test cases

### Phase 2: Consolidate Redundancies

- [ ] Remove duplicate test cases
- [ ] Move tests to appropriate test type
- [ ] Update test configurations

### Phase 3: Improve Organization

- [ ] Reorganize test file structure
- [ ] Create shared test utilities
- [ ] Update documentation

### Phase 4: Enforce Boundaries

- [ ] Add linting rules for test boundaries
- [ ] Update CI/CD pipeline
- [ ] Train team on new boundaries

## Benefits

By implementing these boundaries:

1. **Reduced Redundancy**: No duplicate test cases across test types
2. **Faster Execution**: Unit tests run quickly, integration tests run when needed
3. **Clearer Purpose**: Each test type has a distinct responsibility
4. **Better Maintenance**: Easier to understand and maintain test suites
5. **Improved Coverage**: Better coverage of different aspects of the application
6. **Faster Feedback**: Unit tests provide quick feedback during development
