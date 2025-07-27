/// <reference types="vitest/globals" />

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

describe('id-generator', () => {
  describe('generateUUIDv7', () => {
    it('generates a UUID v7 string', () => {
      const id = generateUUIDv7();
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('generates unique UUIDs', () => {
      const id1 = generateUUIDv7();
      const id2 = generateUUIDv7();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateULID', () => {
    it('generates a ULID string', () => {
      const id = generateULID();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(26);
      expect(id).toMatch(/^[0-9A-Z]{26}$/);
    });

    it('generates unique ULIDs', () => {
      const id1 = generateULID();
      const id2 = generateULID();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateNanoID', () => {
    it('generates a Nano ID with default length', () => {
      const id = generateNanoID();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(21);
    });

    it('generates a Nano ID with custom length', () => {
      const id = generateNanoID(10);
      expect(typeof id).toBe('string');
      expect(id.length).toBe(10);
    });

    it('generates unique Nano IDs', () => {
      const id1 = generateNanoID();
      const id2 = generateNanoID();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateCUID2', () => {
    it('generates a CUID2 string', () => {
      const id = generateCUID2();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(24);
    });

    it('generates unique CUID2s', () => {
      const id1 = generateCUID2();
      const id2 = generateCUID2();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateUUID', () => {
    it('generates a UUID v4 string', () => {
      const id = generateUUID();
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
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('generates UUID v7 when specified', () => {
      const id = generateId('uuidv7');
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('generates ULID when specified', () => {
      const id = generateId('ulid');
      expect(typeof id).toBe('string');
      expect(id.length).toBe(26);
      expect(id).toMatch(/^[0-9A-Z]{26}$/);
    });

    it('generates Nano ID when specified', () => {
      const id = generateId('nanoid');
      expect(typeof id).toBe('string');
      expect(id.length).toBe(21);
    });

    it('generates Nano ID with custom length', () => {
      const id = generateId('nanoid', { length: 15 });
      expect(typeof id).toBe('string');
      expect(id.length).toBe(15);
    });

    it('generates CUID2 when specified', () => {
      const id = generateId('cuid2');
      expect(typeof id).toBe('string');
      expect(id.length).toBe(24);
    });

    it('generates UUID v4 when specified', () => {
      const id = generateId('uuid');
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('defaults to UUID v7 for unknown type', () => {
      const id = generateId('unknown' as any);
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
  });

  describe('generateDatabaseId', () => {
    it('generates UUID v7 by default', () => {
      const id = generateDatabaseId();
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('generates UUID v7 when useUUIDv7 is true', () => {
      const id = generateDatabaseId(true);
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('generates UUID v4 when useUUIDv7 is false', () => {
      const id = generateDatabaseId(false);
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
  });

  describe('generateShortId', () => {
    it('generates a short ID with default length', () => {
      const id = generateShortId();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(12);
    });

    it('generates a short ID with custom length', () => {
      const id = generateShortId(8);
      expect(typeof id).toBe('string');
      expect(id.length).toBe(8);
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
      expect(typeof id).toBe('string');
      expect(id.length).toBe(24);
    });

    it('generates unique secure IDs', () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();
      expect(id1).not.toBe(id2);
    });
  });
});
