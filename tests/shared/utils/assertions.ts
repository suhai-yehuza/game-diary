import { expect } from 'vitest';

import type { ITestUser, ITestGameLog, ITestFriendship } from './test-data';

// Generic API response assertions
export const assertApiResponse = (response: any, expectedStatus = 200) => {
  expect(response).toHaveProperty('status');
  expect(response.status).toBe(expectedStatus);

  if (expectedStatus >= 200 && expectedStatus < 300) {
    expect(response).toHaveProperty('data');
  }
};

export const assertApiError = (response: any, expectedStatus = 400) => {
  expect(response).toHaveProperty('status');
  expect(response.status).toBe(expectedStatus);
  expect(response).toHaveProperty('error');
};

// User data assertions
export const assertUserData = (user: any, expected: Partial<ITestUser> = {}) => {
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('email');
  expect(user).toHaveProperty('username');
  expect(user).toHaveProperty('created_at');

  if (expected.email) {
    expect(user.email).toBe(expected.email);
  }
  if (expected.username) {
    expect(user.username).toBe(expected.username);
  }
  if (expected.id) {
    expect(user.id).toBe(expected.id);
  }
};

export const assertUserList = (users: any[], expectedCount?: number) => {
  expect(Array.isArray(users)).toBe(true);

  if (expectedCount !== undefined) {
    expect(users).toHaveLength(expectedCount);
  }

  users.forEach(user => assertUserData(user));
};

// Game log assertions
export const assertGameLogData = (gameLog: any, expected: Partial<ITestGameLog> = {}) => {
  expect(gameLog).toHaveProperty('id');
  expect(gameLog).toHaveProperty('user_id');
  expect(gameLog).toHaveProperty('game_id');
  expect(gameLog).toHaveProperty('notes');
  expect(gameLog).toHaveProperty('created_at');

  if (expected.notes) {
    expect(gameLog.notes).toBe(expected.notes);
  }
  if (expected.user_id) {
    expect(gameLog.user_id).toBe(expected.user_id);
  }
  if (expected.game_id) {
    expect(gameLog.game_id).toBe(expected.game_id);
  }
};

export const assertGameLogList = (gameLogs: any[], expectedCount?: number) => {
  expect(Array.isArray(gameLogs)).toBe(true);

  if (expectedCount !== undefined) {
    expect(gameLogs).toHaveLength(expectedCount);
  }

  gameLogs.forEach(gameLog => assertGameLogData(gameLog));
};

// Friendship assertions
export const assertFriendshipData = (friendship: any, expected: Partial<ITestFriendship> = {}) => {
  expect(friendship).toHaveProperty('id');
  expect(friendship).toHaveProperty('user_id');
  expect(friendship).toHaveProperty('friend_id');
  expect(friendship).toHaveProperty('status');
  expect(friendship).toHaveProperty('created_at');

  if (expected.status) {
    expect(friendship.status).toBe(expected.status);
  }
  if (expected.user_id) {
    expect(friendship.user_id).toBe(expected.user_id);
  }
  if (expected.friend_id) {
    expect(friendship.friend_id).toBe(expected.friend_id);
  }
};

// Database operation assertions
export const assertDatabaseInsert = (result: any, _expectedTable: string) => {
  expect(result).toHaveProperty('rows');
  expect(Array.isArray(result.rows)).toBe(true);
  expect(result.rows.length).toBeGreaterThan(0);
};

export const assertDatabaseQuery = (result: any, expectedCount?: number) => {
  expect(result).toHaveProperty('rows');
  expect(Array.isArray(result.rows)).toBe(true);

  if (expectedCount !== undefined) {
    expect(result.rows).toHaveLength(expectedCount);
  }
};

// GraphQL response assertions
export const assertGraphQLResponse = (response: any, hasErrors = false) => {
  expect(response).toHaveProperty('data');

  if (hasErrors) {
    expect(response).toHaveProperty('errors');
    expect(Array.isArray(response.errors)).toBe(true);
    expect(response.errors.length).toBeGreaterThan(0);
  } else {
    expect(response.data).toBeDefined();
  }
};

// Component rendering assertions
export const assertComponentRenders = (component: any) => {
  expect(component).toBeDefined();
  expect(component).not.toBeNull();
};

export const assertComponentHasText = (component: any, text: string) => {
  expect(component).toHaveTextContent(text);
};

export const assertComponentHasAttribute = (component: any, attribute: string, value?: string) => {
  if (value) {
    expect(component).toHaveAttribute(attribute, value);
  } else {
    expect(component).toHaveAttribute(attribute);
  }
};

// Form validation assertions
export const assertFormValidation = (form: any, fieldName: string, isValid: boolean) => {
  const field = form.querySelector(`[name="${fieldName}"]`);
  expect(field).toBeDefined();

  if (isValid) {
    expect(field).not.toHaveClass('error');
  } else {
    expect(field).toHaveClass('error');
  }
};

// Performance assertions
export const assertPerformanceThreshold = (
  metric: number,
  threshold: number,
  metricName: string
) => {
  expect(metric, `${metricName} should be below ${threshold}ms`).toBeLessThan(threshold);
};

// Accessibility assertions
export const assertAccessibility = (element: any) => {
  // Basic accessibility checks
  expect(element).toHaveAttribute('role');
  expect(element).toHaveAttribute('aria-label');
};

// Error handling assertions
export const assertErrorHandling = (error: any, expectedMessage?: string) => {
  expect(error).toBeDefined();
  expect(error).toBeInstanceOf(Error);

  if (expectedMessage) {
    expect(error.message).toContain(expectedMessage);
  }
};

// Mock function assertions
export const assertMockFunctionCalled = (mockFn: any, times = 1) => {
  expect(mockFn).toHaveBeenCalledTimes(times);
};

export const assertMockFunctionCalledWith = (mockFn: any, ...args: any[]) => {
  expect(mockFn).toHaveBeenCalledWith(...args);
};
