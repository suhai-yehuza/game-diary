// Shared test utilities and mocks
// This file provides a centralized export for all shared test functionality

// Test data generators
export * from './utils/test-data';

// Assertion helpers
export * from './utils/assertions';

// API mocks
export * from './mocks/api';

// Re-export commonly used types
export type { ITestUser, ITestGameLog, ITestFriendship } from './utils/test-data';

// Re-export commonly used functions
export {
  createMockUser,
  createMockGameLog,
  createMockFriendship,
  createMockFunction,
  createMockApiResponse,
  generateId,
  mockUsers,
  mockGameLogs,
  mockFriendships,
} from './utils/test-data';

// Re-export commonly used assertions
export {
  assertApiResponse,
  assertApiError,
  assertUserData,
  assertUserList,
  assertGameLogData,
  assertGameLogList,
  assertFriendshipData,
  assertDatabaseInsert,
  assertDatabaseQuery,
  assertGraphQLResponse,
  assertComponentRenders,
  assertComponentHasText,
  assertComponentHasAttribute,
  assertFormValidation,
  assertPerformanceThreshold,
  assertAccessibility,
  assertErrorHandling,
  assertMockFunctionCalled,
  assertMockFunctionCalledWith,
} from './utils/assertions';

// Re-export API mocks
export { mockApiResponses, createMockFetch, createMockApiClient } from './mocks/api';
