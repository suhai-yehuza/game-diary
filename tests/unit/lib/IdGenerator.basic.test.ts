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
} from '@src/lib/utils/id-generator';

describe('id-generator utility', () => {
  it('generates a UUIDv7', () => {
    const id = generateUUIDv7();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates a ULID', () => {
    const id = generateULID();
    expect(typeof id).toBe('string');
    expect(id.length).toBe(26);
  });

  it('generates a NanoID with default length', () => {
    const id = generateNanoID();
    expect(typeof id).toBe('string');
    expect(id.length).toBe(21);
  });

  it('generates a NanoID with custom length', () => {
    const id = generateNanoID(10);
    expect(typeof id).toBe('string');
    expect(id.length).toBe(10);
  });

  it('generates a CUID2', () => {
    const id = generateCUID2();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates a UUID v4', () => {
    const id = generateUUID();
    expect(typeof id).toBe('string');
    expect(id.length).toBe(36);
  });

  it('generateId returns correct type', () => {
    expect(generateId('uuidv7').length).toBeGreaterThan(0);
    expect(generateId('ulid').length).toBe(26);
    expect(generateId('nanoid', { length: 8 }).length).toBe(8);
    expect(generateId('cuid2').length).toBeGreaterThan(0);
    expect(generateId('uuid').length).toBe(36);
    // Default
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('generateDatabaseId returns UUIDv7 or UUIDv4', () => {
    const idV7 = generateDatabaseId(true);
    const idV4 = generateDatabaseId(false);
    expect(typeof idV7).toBe('string');
    expect(typeof idV4).toBe('string');
    expect(idV4.length).toBe(36);
  });

  it('generateShortId returns a short NanoID', () => {
    const id = generateShortId(12);
    expect(typeof id).toBe('string');
    expect(id.length).toBe(12);
  });

  it('generateSecureId returns a CUID2', () => {
    const id = generateSecureId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generateId falls back to UUIDv7 for unknown type', () => {
    // @ts-expect-error - intentionally passing invalid type
    const id = generateId('unknown');
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
});
