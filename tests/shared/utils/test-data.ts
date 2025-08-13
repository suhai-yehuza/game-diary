import { vi } from 'vitest';

// Type definitions for test data
export interface ITestUser {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
  testId?: string;
}

export interface ITestGameLog {
  id: string;
  user_id: string;
  game_id: string;
  notes: string;
  created_at: string;
  updated_at: string;
  testId?: string;
}

export interface ITestFriendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  testId?: string;
}

// Utility function to generate unique IDs
let idCounter = 1;
export const generateId = (prefix = 'test'): string => {
  return `${prefix}-${idCounter++}-${Date.now()}`;
};

// Test data generators
export const createMockUser = (overrides: Partial<ITestUser> = {}): ITestUser => ({
  id: generateId('user'),
  email: 'test@example.com',
  username: 'testuser',
  first_name: 'Test',
  last_name: 'User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockGameLog = (overrides: Partial<ITestGameLog> = {}): ITestGameLog => ({
  id: generateId('gamelog'),
  user_id: generateId('user'),
  game_id: generateId('game'),
  notes: 'Test game log notes',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockFriendship = (
  overrides: Partial<ITestFriendship> = {}
): ITestFriendship => ({
  id: generateId('friendship'),
  user_id: generateId('user'),
  friend_id: generateId('user'),
  status: 'pending',
  created_at: new Date().toISOString(),
  ...overrides,
});

// Mock function generators
export const createMockFunction = () => vi.fn();

export const createMockApiResponse = <T = any>(data: T, status = 200) => ({
  status,
  data,
  ok: status >= 200 && status < 300,
  json: async () => data,
});

// Common test data sets
export const mockUsers: ITestUser[] = [
  createMockUser({ id: 'user-1', email: 'user1@example.com', username: 'user1' }),
  createMockUser({ id: 'user-2', email: 'user2@example.com', username: 'user2' }),
  createMockUser({ id: 'user-3', email: 'user3@example.com', username: 'user3' }),
];

export const mockGameLogs: ITestGameLog[] = [
  createMockGameLog({
    id: 'gamelog-1',
    user_id: 'user-1',
    game_id: 'game-1',
    notes: 'Great game!',
  }),
  createMockGameLog({
    id: 'gamelog-2',
    user_id: 'user-2',
    game_id: 'game-2',
    notes: 'Amazing performance!',
  }),
  createMockGameLog({
    id: 'gamelog-3',
    user_id: 'user-1',
    game_id: 'game-3',
    notes: 'Solid defense',
  }),
];

export const mockFriendships: ITestFriendship[] = [
  createMockFriendship({
    id: 'friendship-1',
    user_id: 'user-1',
    friend_id: 'user-2',
    status: 'accepted',
  }),
  createMockFriendship({
    id: 'friendship-2',
    user_id: 'user-1',
    friend_id: 'user-3',
    status: 'pending',
  }),
];
