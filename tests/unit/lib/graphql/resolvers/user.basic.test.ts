import { describe, it, expect, beforeEach, vi } from 'vitest';

import { userQueryResolvers, userSummaryResolver } from '@/lib/graphql/resolvers/user';
import { encryptField, serializeEncryptedField } from '@/lib/utils/encryption';
import { errorHandlers } from '@/lib/utils/error-handler';

// Check if encryption key is available for testing
const hasEncryptionKey =
  process.env.DATA_ENCRYPTION_KEY && process.env.DATA_ENCRYPTION_KEY.length === 64;

// Mock environment variables with a proper 32-byte hex key for testing
const mockEnv = {
  DATA_ENCRYPTION_KEY: 'a'.repeat(64), // 64 hex characters for 32-byte key
};

// Only stub the environment if we don't have a real key
if (!hasEncryptionKey) {
  vi.stubEnv('DATA_ENCRYPTION_KEY', mockEnv.DATA_ENCRYPTION_KEY);
}

// Mock database
const mockDb = {
  query: {
    users: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
};

vi.mock('@/lib/db', () => ({
  db: () => mockDb,
}));

describe('User GraphQL Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to safely create encrypted fields
  const createEncryptedField = (value: string): string | null => {
    try {
      return serializeEncryptedField(encryptField(value));
    } catch (error) {
      // Use centralized error handling
      errorHandlers.validation(error instanceof Error ? error : new Error(String(error)), {
        component: 'Unit Test',
        action: 'Create encrypted field',
      });
      console.warn('Encryption not available for testing, using plain text:', error);
      return value; // Fall back to plain text for testing
    }
  };

  describe('userSummaryResolver', () => {
    const mockContext = {
      user: { id: 'unit-test-user-123', email: 'unit-test-basic@example.com', banned: false },
    };

    const createMockUser = (id: string, email?: string, phone?: string) => ({
      id,
      username: 'unit-test-basic-user',
      first_name: 'Test',
      last_name: 'User',
      email_address: email ? createEncryptedField(email) : null,
      phone_number: phone ? createEncryptedField(phone) : null,
      image_url: 'https://example.com/avatar.jpg',
    });

    describe('email_address resolver', () => {
      it('should decrypt email for own user', () => {
        const user = createMockUser('unit-test-user-123', 'unit-test-basic@example.com');
        const result = userSummaryResolver.email_address(user, {}, mockContext);

        expect(result).toBe('unit-test-basic@example.com');
      });

      it('should return null for other users', () => {
        const user = createMockUser('unit-test-user-456', 'unit-test-basic@example.com');
        const result = userSummaryResolver.email_address(user, {}, mockContext);

        expect(result).toBeNull();
      });

      it('should return null when no user context', () => {
        const user = createMockUser('unit-test-user-123', 'unit-test-basic@example.com');
        const result = userSummaryResolver.email_address(user, {}, {});

        expect(result).toBeNull();
      });

      it('should handle non-encrypted email', () => {
        const user = {
          ...createMockUser('unit-test-user-123'),
          email_address: 'plain@example.com',
        };
        const result = userSummaryResolver.email_address(user, {}, mockContext);

        expect(result).toBe('plain@example.com');
      });
    });

    describe('phone_number resolver', () => {
      it('should decrypt phone for own user', () => {
        const user = createMockUser('unit-test-user-123', undefined, '+1-555-123-4567');
        const result = userSummaryResolver.phone_number(user, {}, mockContext);

        expect(result).toBe('+1-555-123-4567');
      });

      it('should return null for other users', () => {
        const user = createMockUser('unit-test-user-456', undefined, '+1-555-123-4567');
        const result = userSummaryResolver.phone_number(user, {}, mockContext);

        expect(result).toBeNull();
      });

      it('should return null when no user context', () => {
        const user = createMockUser('unit-test-user-123', undefined, '+1-555-123-4567');
        const result = userSummaryResolver.phone_number(user, {}, {});

        expect(result).toBeNull();
      });

      it('should handle non-encrypted phone', () => {
        const user = {
          ...createMockUser('unit-test-user-123'),
          phone_number: '+1-555-123-4567',
        };
        const result = userSummaryResolver.phone_number(user, {}, mockContext);

        expect(result).toBe('+1-555-123-4567');
      });
    });
  });

  describe('userQueryResolvers', () => {
    const mockContext = {
      user: { id: 'unit-test-user-123', email: 'unit-test-basic@example.com', banned: false },
    };

    const createMockDbUser = (id: string, email?: string, phone?: string) => ({
      id,
      username: 'unit-test-basic-user',
      first_name: 'Test',
      last_name: 'User',
      email_address: email ? createEncryptedField(email) : null,
      phone_number: phone ? createEncryptedField(phone) : null,
      image_url: 'https://example.com/avatar.jpg',
      isAdmin: false,
      created_at: new Date('2023-01-01'),
    });

    describe('me resolver', () => {
      it('should return current user with decrypted sensitive data', async () => {
        const mockUser = createMockDbUser(
          'unit-test-user-123',
          'unit-test-basic@example.com',
          '+1-555-123-4567'
        );
        mockDb.query.users.findFirst.mockResolvedValue(mockUser);

        const result = await userQueryResolvers.me({}, {}, mockContext);

        expect(result).toEqual({
          id: 'unit-test-user-123',
          username: 'unit-test-basic-user',
          first_name: 'Test',
          last_name: 'User',
          email_address: 'unit-test-basic@example.com',
          phone_number: '+1-555-123-4567',
          image_url: 'https://example.com/avatar.jpg',
          isAdmin: false,
          created_at: new Date('2023-01-01'),
        });
      });

      it('should throw error when no user context', async () => {
        await expect(userQueryResolvers.me({}, {}, {})).rejects.toThrow('Authentication required');
      });

      it('should throw error when user not found', async () => {
        mockDb.query.users.findFirst.mockResolvedValue(null);

        await expect(userQueryResolvers.me({}, {}, mockContext)).rejects.toThrow('User not found');
      });
    });

    describe('user resolver', () => {
      it('should return user with decrypted sensitive data for own user', async () => {
        const mockUser = createMockDbUser(
          'unit-test-user-123',
          'unit-test-basic@example.com',
          '+1-555-123-4567'
        );
        mockDb.query.users.findFirst.mockResolvedValue(mockUser);

        const result = await userQueryResolvers.user({}, { id: 'unit-test-user-123' }, mockContext);

        expect(result).toEqual({
          id: 'unit-test-user-123',
          username: 'unit-test-basic-user',
          first_name: 'Test',
          last_name: 'User',
          email_address: 'unit-test-basic@example.com',
          phone_number: '+1-555-123-4567',
          image_url: 'https://example.com/avatar.jpg',
          isAdmin: false,
          created_at: new Date('2023-01-01'),
        });
      });

      it('should return user with null sensitive data for other users', async () => {
        const mockUser = createMockDbUser(
          'unit-test-user-456',
          'unit-test-basic@example.com',
          '+1-555-123-4567'
        );
        mockDb.query.users.findFirst.mockResolvedValue(mockUser);

        const result = await userQueryResolvers.user({}, { id: 'unit-test-user-456' }, mockContext);

        expect(result).toEqual({
          id: 'unit-test-user-456',
          username: 'unit-test-basic-user',
          first_name: 'Test',
          last_name: 'User',
          email_address: null,
          phone_number: null,
          image_url: 'https://example.com/avatar.jpg',
          isAdmin: false,
          created_at: new Date('2023-01-01'),
        });
      });

      it('should return null when user not found', async () => {
        mockDb.query.users.findFirst.mockResolvedValue(null);

        const result = await userQueryResolvers.user({}, { id: 'nonexistent' }, mockContext);

        expect(result).toBeNull();
      });
    });

    describe('users resolver', () => {
      it('should return users list with proper sensitive data protection', async () => {
        const mockUsers = [
          createMockDbUser('unit-test-user-123', 'own@example.com', '+1-555-123-4567'),
          createMockDbUser('unit-test-user-456', 'other@example.com', '+1-555-987-6543'),
        ];
        mockDb.query.users.findMany.mockResolvedValue(mockUsers);

        const result = await userQueryResolvers.users({}, {}, mockContext);

        expect(result).toHaveLength(2);

        // Own user should have decrypted data
        expect(result[0]).toEqual({
          id: 'unit-test-user-123',
          username: 'unit-test-basic-user',
          first_name: 'Test',
          last_name: 'User',
          email_address: 'own@example.com',
          phone_number: '+1-555-123-4567',
          image_url: 'https://example.com/avatar.jpg',
          isAdmin: false,
          created_at: new Date('2023-01-01'),
        });

        // Other user should have null sensitive data
        expect(result[1]).toEqual({
          id: 'unit-test-user-456',
          username: 'unit-test-basic-user',
          first_name: 'Test',
          last_name: 'User',
          email_address: null,
          phone_number: null,
          image_url: 'https://example.com/avatar.jpg',
          isAdmin: false,
          created_at: new Date('2023-01-01'),
        });
      });

      it('should handle empty users list', async () => {
        mockDb.query.users.findMany.mockResolvedValue([]);

        const result = await userQueryResolvers.users({}, {}, mockContext);

        expect(result).toEqual([]);
      });
    });

    describe('searchUsers resolver', () => {
      it('should return search results with proper sensitive data protection', async () => {
        const mockUsers = [
          createMockDbUser('unit-test-user-123', 'own@example.com', '+1-555-123-4567'),
          createMockDbUser('unit-test-user-456', 'other@example.com', '+1-555-987-6543'),
        ];
        mockDb.query.users.findMany.mockResolvedValue(mockUsers);

        const result = await userQueryResolvers.searchUsers({}, {}, mockContext);

        expect(result.edges).toHaveLength(2);
        expect(result.pageInfo).toBeDefined();
        expect(result.totalCount).toBe(2);

        // Own user should have decrypted data
        expect(result.edges[0].node).toEqual({
          id: 'unit-test-user-123',
          username: 'unit-test-basic-user',
          first_name: 'Test',
          last_name: 'User',
          email_address: 'own@example.com',
          phone_number: '+1-555-123-4567',
          image_url: 'https://example.com/avatar.jpg',
          isAdmin: false,
          created_at: new Date('2023-01-01'),
        });

        // Other user should have null sensitive data
        expect(result.edges[1].node).toEqual({
          id: 'unit-test-user-456',
          username: 'unit-test-basic-user',
          first_name: 'Test',
          last_name: 'User',
          email_address: null,
          phone_number: null,
          image_url: 'https://example.com/avatar.jpg',
          isAdmin: false,
          created_at: new Date('2023-01-01'),
        });
      });
    });
  });
});
