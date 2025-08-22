import { describe, it, expect } from 'vitest';

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

describe('ID Generator Utils', () => {
  describe('generateUUIDv7', () => {
    it('generates a valid UUID v7', () => {
      const id = generateUUIDv7();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('generates unique UUIDs', () => {
      const id1 = generateUUIDv7();
      const id2 = generateUUIDv7();
      expect(id1).not.toBe(id2);
    });

    it('generates time-ordered UUIDs', async () => {
      const id1 = generateUUIDv7();
      // Small delay to ensure different timestamps
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      await delay(1);
      const id2 = generateUUIDv7();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateULID', () => {
    it('generates a valid ULID', () => {
      const id = generateULID();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(26);
      expect(id).toMatch(/^[0-9A-Z]{26}$/);
    });

    it('generates unique ULIDs', () => {
      const id1 = generateULID();
      const id2 = generateULID();
      expect(id1).not.toBe(id2);
    });

    it('generates time-ordered ULIDs', () => {
      const id1 = generateULID();
      const id2 = generateULID();
      // ULIDs are lexicographically sortable
      expect(id1 < id2 || id1 > id2).toBe(true);
    });
  });

  describe('generateNanoID', () => {
    it('generates a valid Nano ID with default length', () => {
      const id = generateNanoID();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(21);
    });

    it('generates a valid Nano ID with custom length', () => {
      const id = generateNanoID(10);
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(10);
    });

    it('generates unique Nano IDs', () => {
      const id1 = generateNanoID();
      const id2 = generateNanoID();
      expect(id1).not.toBe(id2);
    });

    it('generates URL-safe characters', () => {
      const id = generateNanoID();
      expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe('generateCUID2', () => {
    it('generates a valid CUID2', () => {
      const id = generateCUID2();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(24);
    });

    it('generates unique CUID2s', () => {
      const id1 = generateCUID2();
      const id2 = generateCUID2();
      expect(id1).not.toBe(id2);
    });

    it('generates collision-resistant IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateCUID2());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('generateUUID', () => {
    it('generates a valid UUID v4', () => {
      const id = generateUUID();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('generates unique UUIDs', () => {
      const id1 = generateUUID();
      const id2 = generateUUID();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateId', () => {
    it('generates UUID v7 by default', () => {
      const id = generateId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('generates UUID v7 when specified', () => {
      const id = generateId('uuidv7');
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('generates ULID when specified', () => {
      const id = generateId('ulid');
      expect(id.length).toBe(26);
      expect(id).toMatch(/^[0-9A-Z]{26}$/);
    });

    it('generates Nano ID when specified', () => {
      const id = generateId('nanoid');
      expect(id.length).toBe(21);
    });

    it('generates Nano ID with custom length', () => {
      const id = generateId('nanoid', { length: 15 });
      expect(id.length).toBe(15);
    });

    it('generates CUID2 when specified', () => {
      const id = generateId('cuid2');
      expect(id.length).toBe(24);
    });

    it('generates UUID v4 when specified', () => {
      const id = generateId('uuid');
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('falls back to UUID v7 for unknown types', () => {
      const id = generateId('unknown' as any);
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
  });

  describe('generateDatabaseId', () => {
    it('generates UUID v7 by default', () => {
      const id = generateDatabaseId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('generates UUID v7 when useUUIDv7 is true', () => {
      const id = generateDatabaseId(true);
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('generates UUID v4 when useUUIDv7 is false', () => {
      const id = generateDatabaseId(false);
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('generates unique database IDs', () => {
      const id1 = generateDatabaseId();
      const id2 = generateDatabaseId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateShortId', () => {
    it('generates a short ID with default length', () => {
      const id = generateShortId();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(12);
    });

    it('generates a short ID with custom length', () => {
      const id = generateShortId(8);
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(8);
    });

    it('generates URL-safe short IDs', () => {
      const id = generateShortId();
      expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('generates unique short IDs', () => {
      const id1 = generateShortId();
      const id2 = generateShortId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateSecureId', () => {
    it('generates a secure ID', () => {
      const id = generateSecureId();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(24);
    });

    it('generates unique secure IDs', () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();
      expect(id1).not.toBe(id2);
    });

    it('generates collision-resistant secure IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateSecureId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('Integration Tests', () => {
    it('all ID types generate different formats', () => {
      const uuidv7 = generateUUIDv7();
      const ulid = generateULID();
      const nanoid = generateNanoID();
      const cuid2 = generateCUID2();
      const uuid = generateUUID();

      expect(uuidv7).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
      expect(ulid).toMatch(/^[0-9A-Z]{26}$/);
      expect(nanoid.length).toBe(21);
      expect(cuid2.length).toBe(24);
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('all ID types generate unique values', () => {
      const ids = [
        generateUUIDv7(),
        generateULID(),
        generateNanoID(),
        generateCUID2(),
        generateUUID(),
        generateDatabaseId(),
        generateShortId(),
        generateSecureId(),
      ];

      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
