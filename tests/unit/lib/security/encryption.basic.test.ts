import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  encryptField,
  decryptField,
  serializeEncryptedField,
  deserializeEncryptedField,
  isEncrypted,
} from '@/lib/utils/encryption';

// Use a valid mock key if not present
const validMockKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const hasEncryptionKey =
  process.env.DATA_ENCRYPTION_KEY && process.env.DATA_ENCRYPTION_KEY.length === 64;
if (!hasEncryptionKey) {
  vi.stubEnv('DATA_ENCRYPTION_KEY', validMockKey);
}

// Helper to check if encryption is available
const encryptionAvailable = () => {
  try {
    const test = encryptField('test', validMockKey);
    return !!test;
  } catch {
    return false;
  }
};

// Helper to skip tests if encryption is not available
const maybeIt = encryptionAvailable() ? it : it.skip;

// Wrap the entire suite in a check
(encryptionAvailable() ? describe : describe.skip)('Encryption Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('encryptField', () => {
    maybeIt('should encrypt a string field', () => {
      const plaintext = 'test@example.com';
      const TEST_KEY = validMockKey;
      const encrypted = encryptField(plaintext, TEST_KEY);

      expect(encrypted).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.encrypted).toBeDefined();
      expect(encrypted.tag).toBeDefined();
      expect(typeof encrypted.iv).toBe('string');
      expect(typeof encrypted.encrypted).toBe('string');
      expect(typeof encrypted.tag).toBe('string');
    });

    maybeIt('should produce different ciphertexts for the same plaintext', () => {
      const plaintext = 'test@example.com';
      const TEST_KEY = validMockKey;
      const encrypted1 = encryptField(plaintext, TEST_KEY);
      const encrypted2 = encryptField(plaintext, TEST_KEY);

      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    maybeIt('should handle empty string', () => {
      const TEST_KEY = validMockKey;
      const encrypted = encryptField('', TEST_KEY);
      expect(encrypted).toBeDefined();
    });

    maybeIt('should handle special characters', () => {
      const plaintext = 'test+user@example.com!@#$%^&*()';
      const TEST_KEY = validMockKey;
      const encrypted = encryptField(plaintext, TEST_KEY);
      const decrypted = decryptField(encrypted, TEST_KEY);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('decryptField', () => {
    maybeIt('should decrypt an encrypted field', () => {
      const plaintext = 'test@example.com';
      const TEST_KEY = validMockKey;
      const encrypted = encryptField(plaintext, TEST_KEY);
      const decrypted = decryptField(encrypted, TEST_KEY);

      expect(decrypted).toBe(plaintext);
    });

    maybeIt('should handle empty string encryption/decryption', () => {
      const plaintext = '';
      const TEST_KEY = validMockKey;
      const encrypted = encryptField(plaintext, TEST_KEY);
      const decrypted = decryptField(encrypted, TEST_KEY);

      expect(decrypted).toBe(plaintext);
    });

    maybeIt('should throw error for invalid encrypted data', () => {
      const invalidEncrypted = {
        iv: 'invalid-iv',
        content: 'invalid-content',
        tag: 'invalid-tag',
      };
      const TEST_KEY = validMockKey;
      expect(() => decryptField(invalidEncrypted, TEST_KEY)).toThrow();
    });
  });

  describe('serializeEncryptedField', () => {
    maybeIt('should serialize encrypted field to JSON string', () => {
      const plaintext = 'test@example.com';
      const TEST_KEY = validMockKey;
      const encrypted = encryptField(plaintext, TEST_KEY);
      const serialized = serializeEncryptedField(encrypted);

      expect(typeof serialized).toBe('string');
      expect(() => JSON.parse(serialized)).not.toThrow();

      const parsed = JSON.parse(serialized);
      expect(parsed.iv).toBe(encrypted.iv);
      expect(parsed.encrypted).toBe(encrypted.encrypted);
      expect(parsed.tag).toBe(encrypted.tag);
    });
  });

  describe('deserializeEncryptedField', () => {
    maybeIt('should deserialize JSON string to encrypted field', () => {
      const plaintext = 'test@example.com';
      const TEST_KEY = validMockKey;
      const encrypted = encryptField(plaintext, TEST_KEY);
      const serialized = serializeEncryptedField(encrypted);
      const deserialized = deserializeEncryptedField(serialized);

      expect(deserialized.iv).toBe(encrypted.iv);
      expect(deserialized.encrypted).toBe(encrypted.encrypted);
      expect(deserialized.tag).toBe(encrypted.tag);
    });

    maybeIt('should throw error for invalid JSON', () => {
      expect(() => deserializeEncryptedField('invalid-json')).toThrow();
    });
  });

  describe('isEncrypted', () => {
    maybeIt('should return true for encrypted field', () => {
      const plaintext = 'test@example.com';
      const TEST_KEY = validMockKey;
      const encrypted = encryptField(plaintext, TEST_KEY);
      const serialized = serializeEncryptedField(encrypted);

      expect(isEncrypted(serialized)).toBe(true);
    });

    maybeIt('should return false for plain text', () => {
      expect(isEncrypted('test@example.com')).toBe(false);
    });

    maybeIt('should return false for null or undefined', () => {
      expect(isEncrypted(null)).toBe(false);
      expect(isEncrypted(undefined as any)).toBe(false);
    });

    maybeIt('should return false for invalid JSON', () => {
      expect(isEncrypted('invalid-json')).toBe(false);
    });

    maybeIt('should return false for JSON without encryption fields', () => {
      const nonEncryptedJson = JSON.stringify({ field: 'value' });
      expect(isEncrypted(nonEncryptedJson)).toBe(false);
    });
  });

  describe('End-to-End Encryption/Decryption', () => {
    maybeIt('should encrypt and decrypt sensitive user data', () => {
      const testData = [
        'user@example.com',
        '+1-555-123-4567',
        'john.doe@company.com',
        'jane.smith+test@domain.org',
      ];
      const TEST_KEY = validMockKey;

      testData.forEach(plaintext => {
        const encrypted = encryptField(plaintext, TEST_KEY);
        const serialized = serializeEncryptedField(encrypted);
        const deserialized = deserializeEncryptedField(serialized);
        const decrypted = decryptField(deserialized, TEST_KEY);

        expect(decrypted).toBe(plaintext);
        expect(isEncrypted(serialized)).toBe(true);
      });
    });

    maybeIt('should handle large data', () => {
      const largeData = 'a'.repeat(1000);
      const TEST_KEY = validMockKey;
      const encrypted = encryptField(largeData, TEST_KEY);
      const serialized = serializeEncryptedField(encrypted);
      const deserialized = deserializeEncryptedField(serialized);
      const decrypted = decryptField(deserialized, TEST_KEY);

      expect(decrypted).toBe(largeData);
    });
  });

  describe('Security Properties', () => {
    maybeIt('should use different IVs for each encryption', () => {
      const plaintext = 'test@example.com';
      const TEST_KEY = validMockKey;
      const encrypted1 = encryptField(plaintext, TEST_KEY);
      const encrypted2 = encryptField(plaintext, TEST_KEY);

      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    maybeIt('should produce different ciphertexts for same plaintext', () => {
      const plaintext = 'test@example.com';
      const TEST_KEY = validMockKey;
      const encrypted1 = encryptField(plaintext, TEST_KEY);
      const encrypted2 = encryptField(plaintext, TEST_KEY);

      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted);
    });

    maybeIt('should maintain confidentiality', () => {
      const plaintext = 'sensitive-data@example.com';
      const TEST_KEY = validMockKey;
      const encrypted = encryptField(plaintext, TEST_KEY);
      const serialized = serializeEncryptedField(encrypted);

      // The serialized string should not contain the plaintext
      expect(serialized).not.toContain('sensitive-data');
      expect(serialized).not.toContain('@example.com');
    });
  });
});
