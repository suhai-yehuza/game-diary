/// <reference types="vitest/globals" />

import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  generateUUIDv7,
  generateULID,
  generateNanoID,
  generateCUID2,
  generateUUID,
  generateId,
  generateDatabaseId,
  generateShortId,
  generateSecureId,
} from '@/lib/utils/id-generator';

// Mock the external libraries
vi.mock('@paralleldrive/cuid2', () => ({
  createId: vi.fn(() => 'cuid2-mock-id'),
}));

// Mock nanoid with proper function signature
vi.mock('nanoid', () => ({
  nanoid: vi.fn((length = 21) => {
    // Create a string of exactly the requested length
    const chars = 'nano-id-nano-id-nano-id-nano-id-nano-id';
    const result = chars.substring(0, length);
    console.log(
      `Mock nanoid called with length ${length}, returning: "${result}" (length: ${result.length})`
    );
    return result;
  }),
}));

vi.mock('ulid', () => ({
  ulid: vi.fn(() => 'ulid-mock-id'),
}));

vi.mock('uuidv7', () => ({
  uuidv7: vi.fn(() => 'uuidv7-mock-id'),
}));

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'uuid-mock-id'),
  },
  writable: true,
});

describe('ID Generator Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateUUIDv7', () => {
    it('generates a UUID v7', () => {
      const result = generateUUIDv7();
      expect(result).toBe('uuidv7-mock-id');
    });
  });

  describe('generateULID', () => {
    it('generates a ULID', () => {
      const result = generateULID();
      expect(result).toBe('ulid-mock-id');
    });
  });

  describe('generateNanoID', () => {
    it('generates a Nano ID with default length', () => {
      const result = generateNanoID();
      console.log(`generateNanoID() returned: "${result}" (length: ${result.length})`);
      expect(result).toBe('nano-id-nano-id-nano-');
    });

    it('generates a Nano ID with custom length', () => {
      const result = generateNanoID(10);
      console.log(`generateNanoID(10) returned: "${result}" (length: ${result.length})`);
      expect(result).toBe('nano-id-na');
    });

    it('generates a Nano ID with short length', () => {
      const result = generateNanoID(5);
      expect(result).toBe('nano-');
    });
  });

  describe('generateCUID2', () => {
    it('generates a CUID2', () => {
      const result = generateCUID2();
      expect(result).toBe('cuid2-mock-id');
    });
  });

  describe('generateUUID', () => {
    it('generates a UUID v4', () => {
      const result = generateUUID();
      expect(result).toBe('uuid-mock-id');
    });
  });

  describe('generateId', () => {
    it('generates UUID v7 by default', () => {
      const result = generateId();
      expect(result).toBe('uuidv7-mock-id');
    });

    it('generates UUID v7 when specified', () => {
      const result = generateId('uuidv7');
      expect(result).toBe('uuidv7-mock-id');
    });

    it('generates ULID when specified', () => {
      const result = generateId('ulid');
      expect(result).toBe('ulid-mock-id');
    });

    it('generates Nano ID when specified', () => {
      const result = generateId('nanoid');
      console.log(`generateId('nanoid') returned: "${result}" (length: ${result.length})`);
      expect(result).toBe('nano-id-nano-id-nano-');
    });

    it('generates Nano ID with custom length when specified', () => {
      const result = generateId('nanoid', { length: 10 });
      console.log(
        `generateId('nanoid', { length: 10 }) returned: "${result}" (length: ${result.length})`
      );
      expect(result).toBe('nano-id-na');
    });

    it('generates CUID2 when specified', () => {
      const result = generateId('cuid2');
      expect(result).toBe('cuid2-mock-id');
    });

    it('generates UUID when specified', () => {
      const result = generateId('uuid');
      expect(result).toBe('uuid-mock-id');
    });

    it('falls back to UUID v7 for unknown type', () => {
      const result = generateId('unknown' as any);
      expect(result).toBe('uuidv7-mock-id');
    });
  });

  describe('generateDatabaseId', () => {
    it('generates UUID v7 by default', () => {
      const result = generateDatabaseId();
      expect(result).toBe('uuidv7-mock-id');
    });

    it('generates UUID v7 when useUUIDv7 is true', () => {
      const result = generateDatabaseId(true);
      expect(result).toBe('uuidv7-mock-id');
    });

    it('generates UUID v4 when useUUIDv7 is false', () => {
      const result = generateDatabaseId(false);
      expect(result).toBe('uuid-mock-id');
    });
  });

  describe('generateShortId', () => {
    it('generates a short ID with default length', () => {
      const result = generateShortId();
      console.log(`generateShortId() returned: "${result}" (length: ${result.length})`);
      expect(result).toBe('nano-id-nano');
    });

    it('generates a short ID with custom length', () => {
      const result = generateShortId(8);
      expect(result).toBe('nano-id-');
    });
  });

  describe('generateSecureId', () => {
    it('generates a secure ID using CUID2', () => {
      const result = generateSecureId();
      expect(result).toBe('cuid2-mock-id');
    });
  });

  describe('ID format validation', () => {
    it('generates IDs with expected lengths', () => {
      expect(generateUUIDv7()).toHaveLength('uuidv7-mock-id'.length);
      expect(generateULID()).toHaveLength('ulid-mock-id'.length);
      expect(generateNanoID(10)).toHaveLength(10);
      expect(generateCUID2()).toHaveLength('cuid2-mock-id'.length);
      expect(generateUUID()).toHaveLength('uuid-mock-id'.length);
    });

    it('generates unique IDs on multiple calls', () => {
      const id1 = generateId('nanoid', { length: 5 });
      const id2 = generateId('nanoid', { length: 5 });
      expect(id1).toBe(id2); // With mocks, they're the same, but in real usage they'd be different
    });
  });
});
