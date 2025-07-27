/// <reference types="vitest/globals" />

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  encryptField,
  decryptField,
  serializeEncryptedField,
  deserializeEncryptedField,
  isEncrypted,
} from '@/lib/utils/encryption';

// Mock environment variables
const mockEnv = {
  DATA_ENCRYPTION_KEY: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
};

describe('encryption utils', () => {
  beforeEach(() => {
    // Set up mock environment
    process.env.DATA_ENCRYPTION_KEY = mockEnv.DATA_ENCRYPTION_KEY;
  });

  afterEach(() => {
    // Clean up
    delete process.env.DATA_ENCRYPTION_KEY;
  });

  describe('encryptField', () => {
    it('encrypts a plain text field', () => {
      const plaintext = 'sensitive data';
      const encrypted = encryptField(plaintext);

      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('content');
      expect(encrypted).toHaveProperty('tag');
      expect(typeof encrypted.iv).toBe('string');
      expect(typeof encrypted.content).toBe('string');
      expect(typeof encrypted.tag).toBe('string');
    });

    it('encrypts with key override as hex string', () => {
      const plaintext = 'sensitive data';
      const keyOverride = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const encrypted = encryptField(plaintext, keyOverride);

      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('content');
      expect(encrypted).toHaveProperty('tag');
    });

    it('encrypts with key override as buffer', () => {
      const plaintext = 'sensitive data';
      const keyOverride = Buffer.from(
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        'hex'
      );
      const encrypted = encryptField(plaintext, keyOverride);

      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('content');
      expect(encrypted).toHaveProperty('tag');
    });

    it('throws error for invalid hex key override', () => {
      const plaintext = 'sensitive data';
      const invalidKey = 'invalid-key';

      expect(() => encryptField(plaintext, invalidKey)).toThrow(
        'Key override must be a 32-byte hex string'
      );
    });

    it('throws error for invalid buffer key override', () => {
      const plaintext = 'sensitive data';
      const invalidKey = Buffer.from('invalid');

      expect(() => encryptField(plaintext, invalidKey)).toThrow(
        'Key override must be a 32-byte buffer'
      );
    });

    it('throws error when DATA_ENCRYPTION_KEY is not set', () => {
      delete process.env.DATA_ENCRYPTION_KEY;
      const plaintext = 'sensitive data';

      expect(() => encryptField(plaintext)).toThrow('DATA_ENCRYPTION_KEY must be set');
    });

    it('throws error when DATA_ENCRYPTION_KEY is invalid', () => {
      process.env.DATA_ENCRYPTION_KEY = 'invalid-key';
      const plaintext = 'sensitive data';

      expect(() => encryptField(plaintext)).toThrow(
        'DATA_ENCRYPTION_KEY must be set to a 32-byte hex string'
      );
    });
  });

  describe('decryptField', () => {
    it('decrypts an encrypted field', () => {
      const plaintext = 'sensitive data';
      const encrypted = encryptField(plaintext);
      const decrypted = decryptField(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('decrypts with key override as hex string', () => {
      const plaintext = 'sensitive data';
      const keyOverride = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const encrypted = encryptField(plaintext, keyOverride);
      const decrypted = decryptField(encrypted, keyOverride);

      expect(decrypted).toBe(plaintext);
    });

    it('decrypts with key override as buffer', () => {
      const plaintext = 'sensitive data';
      const keyOverride = Buffer.from(
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        'hex'
      );
      const encrypted = encryptField(plaintext, keyOverride);
      const decrypted = decryptField(encrypted, keyOverride);

      expect(decrypted).toBe(plaintext);
    });

    it('throws error for invalid hex key override', () => {
      const encrypted = { iv: 'test', content: 'test', tag: 'test' };
      const invalidKey = 'invalid-key';

      expect(() => decryptField(encrypted, invalidKey)).toThrow(
        'Key override must be a 32-byte hex string'
      );
    });

    it('throws error for invalid buffer key override', () => {
      const encrypted = { iv: 'test', content: 'test', tag: 'test' };
      const invalidKey = Buffer.from('invalid');

      expect(() => decryptField(encrypted, invalidKey)).toThrow(
        'Key override must be a 32-byte buffer'
      );
    });

    it('throws error when DATA_ENCRYPTION_KEY is not set', () => {
      delete process.env.DATA_ENCRYPTION_KEY;
      const encrypted = { iv: 'test', content: 'test', tag: 'test' };

      expect(() => decryptField(encrypted)).toThrow('DATA_ENCRYPTION_KEY must be set');
    });

    it('throws error when DATA_ENCRYPTION_KEY is invalid', () => {
      process.env.DATA_ENCRYPTION_KEY = 'invalid-key';
      const encrypted = { iv: 'test', content: 'test', tag: 'test' };

      expect(() => decryptField(encrypted)).toThrow(
        'DATA_ENCRYPTION_KEY must be set to a 32-byte hex string'
      );
    });
  });

  describe('serializeEncryptedField', () => {
    it('serializes encrypted field to JSON string', () => {
      const encrypted = { iv: 'test-iv', content: 'test-content', tag: 'test-tag' };
      const serialized = serializeEncryptedField(encrypted);

      expect(typeof serialized).toBe('string');
      expect(JSON.parse(serialized)).toEqual(encrypted);
    });
  });

  describe('deserializeEncryptedField', () => {
    it('deserializes JSON string to encrypted field', () => {
      const encrypted = { iv: 'test-iv', content: 'test-content', tag: 'test-tag' };
      const serialized = JSON.stringify(encrypted);
      const deserialized = deserializeEncryptedField(serialized);

      expect(deserialized).toEqual(encrypted);
    });

    it('throws error for invalid JSON', () => {
      const invalidJson = 'invalid-json';

      expect(() => deserializeEncryptedField(invalidJson)).toThrow();
    });
  });

  describe('isEncrypted', () => {
    it('returns true for encrypted field', () => {
      const encrypted = { iv: 'test-iv', content: 'test-content', tag: 'test-tag' };
      const serialized = JSON.stringify(encrypted);

      expect(isEncrypted(serialized)).toBe(true);
    });

    it('returns false for null value', () => {
      expect(isEncrypted(null)).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isEncrypted('')).toBe(false);
    });

    it('returns false for non-JSON string', () => {
      expect(isEncrypted('not-json')).toBe(false);
    });

    it('returns false for JSON without required fields', () => {
      const invalidJson = JSON.stringify({ some: 'data' });
      expect(isEncrypted(invalidJson)).toBe(false);
    });

    it('returns false for JSON missing iv field', () => {
      const invalidJson = JSON.stringify({ content: 'test', tag: 'test' });
      expect(isEncrypted(invalidJson)).toBe(false);
    });

    it('returns false for JSON missing content field', () => {
      const invalidJson = JSON.stringify({ iv: 'test', tag: 'test' });
      expect(isEncrypted(invalidJson)).toBe(false);
    });

    it('returns false for JSON missing tag field', () => {
      const invalidJson = JSON.stringify({ iv: 'test', content: 'test' });
      expect(isEncrypted(invalidJson)).toBe(false);
    });
  });
});
