import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  encryptField,
  decryptField,
  serializeEncryptedField,
  deserializeEncryptedField,
  isEncrypted,
} from '@/lib/utils/encryption';

// Mock environment variables
const mockEnv = {
  DATA_ENCRYPTION_KEY: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
};

vi.stubEnv('DATA_ENCRYPTION_KEY', mockEnv.DATA_ENCRYPTION_KEY);

describe('Encryption Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('encryptField', () => {
    it('should encrypt a string field', () => {
      const plaintext = 'test@example.com';
      const TEST_KEY = mockEnv.DATA_ENCRYPTION_KEY;
      const encrypted = encryptField(plaintext, TEST_KEY);

      expect(encrypted).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.content).toBeDefined();
      expect(encrypted.tag).toBeDefined();
      expect(typeof encrypted.iv).toBe('string');
      expect(typeof encrypted.content).toBe('string');
      expect(typeof encrypted.tag).toBe('string');
    });

    it('should produce different ciphertexts for the same plaintext', () => {
      const plaintext = 'test@example.com';
      const TEST_KEY = mockEnv.DATA_ENCRYPTION_KEY;
      const encrypted1 = encryptField(plaintext, TEST_KEY);
      const encrypted2 = encryptField(plaintext, TEST_KEY);

      expect(encrypted1.content).not.toBe(encrypted2.content);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    it('should handle empty string', () => {
      const TEST_KEY = mockEnv.DATA_ENCRYPTION_KEY;
      const encrypted = encryptField('', TEST_KEY);
      expect(encrypted).toBeDefined();
    });

    it('should handle special characters', () => {
      const plaintext = 'test+user@example.com!@#$%^&*()';
      const TEST_KEY = mockEnv.DATA_ENCRYPTION_KEY;
      const encrypted = encryptField(plaintext, TEST_KEY);
      const decrypted = decryptField(encrypted, TEST_KEY);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('decryptField', () => {
    it('should decrypt an encrypted field', () => {
      const plaintext = 'test@example.com';
      const TEST_KEY = mockEnv.DATA_ENCRYPTION_KEY;
      const encrypted = encryptField(plaintext, TEST_KEY);
      const decrypted = decryptField(encrypted, TEST_KEY);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle empty string encryption/decryption', () => {
      const plaintext = '';
      const TEST_KEY = mockEnv.DATA_ENCRYPTION_KEY;
      const encrypted = encryptField(plaintext, TEST_KEY);
      const decrypted = decryptField(encrypted, TEST_KEY);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error for invalid encrypted data', () => {
      const invalidEncrypted = {
        iv: 'invalid-iv',
        content: 'invalid-content',
        tag: 'invalid-tag',
      };
      const TEST_KEY = mockEnv.DATA_ENCRYPTION_KEY;
      expect(() => decryptField(invalidEncrypted, TEST_KEY)).toThrow();
    });
  });

  describe('serializeEncryptedField', () => {
    it('should serialize encrypted field to JSON string', () => {
      const plaintext = 'test@example.com';
      const TEST_KEY = mockEnv.DATA_ENCRYPTION_KEY;
      const encrypted = encryptField(plaintext, TEST_KEY);
      const serialized = serializeEncryptedField(encrypted);

      expect(typeof serialized).toBe('string');
      expect(() => JSON.parse(serialized)).not.toThrow();

      const parsed = JSON.parse(serialized);
      expect(parsed.iv).toBe(encrypted.iv);
      expect(parsed.content).toBe(encrypted.content);
      expect(parsed.tag).toBe(encrypted.tag);
    });
  });

  describe('deserializeEncryptedField', () => {
    it('should deserialize JSON string to encrypted field', () => {
      const plaintext = 'test@example.com';
      const TEST_KEY = mockEnv.DATA_ENCRYPTION_KEY;
      const encrypted = encryptField(plaintext, TEST_KEY);
      const serialized = serializeEncryptedField(encrypted);
      const deserialized = deserializeEncryptedField(serialized);

      expect(deserialized.iv).toBe(encrypted.iv);
      expect(deserialized.content).toBe(encrypted.content);
      expect(deserialized.tag).toBe(encrypted.tag);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => deserializeEncryptedField('invalid-json')).toThrow();
    });
  });

  describe('isEncrypted', () => {
    it('should return true for encrypted field', () => {
      const plaintext = 'test@example.com';
      const TEST_KEY = mockEnv.DATA_ENCRYPTION_KEY;
      const encrypted = encryptField(plaintext, TEST_KEY);
      const serialized = serializeEncryptedField(encrypted);

      expect(isEncrypted(serialized)).toBe(true);
    });

    it('should return false for plain text', () => {
      expect(isEncrypted('test@example.com')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isEncrypted(null)).toBe(false);
      expect(isEncrypted(undefined as any)).toBe(false);
    });

    it('should return false for invalid JSON', () => {
      expect(isEncrypted('invalid-json')).toBe(false);
    });

    it('should return false for JSON without encryption fields', () => {
      const nonEncryptedJson = JSON.stringify({ field: 'value' });
      expect(isEncrypted(nonEncryptedJson)).toBe(false);
    });
  });

  describe('End-to-End Encryption/Decryption', () => {
    it('should encrypt and decrypt sensitive user data', () => {
      const testData = [
        'user@example.com',
        '+1-555-123-4567',
        'john.doe@company.com',
        'jane.smith+test@domain.org',
      ];
      const TEST_KEY = mockEnv.DATA_ENCRYPTION_KEY;

      testData.forEach(plaintext => {
        const encrypted = encryptField(plaintext, TEST_KEY);
        const serialized = serializeEncryptedField(encrypted);
        const deserialized = deserializeEncryptedField(serialized);
        const decrypted = decryptField(deserialized, TEST_KEY);

        expect(decrypted).toBe(plaintext);
        expect(isEncrypted(serialized)).toBe(true);
      });
    });

    it('should handle large data', () => {
      const largeData = 'a'.repeat(1000);
      const TEST_KEY = mockEnv.DATA_ENCRYPTION_KEY;
      const encrypted = encryptField(largeData, TEST_KEY);
      const serialized = serializeEncryptedField(encrypted);
      const deserialized = deserializeEncryptedField(serialized);
      const decrypted = decryptField(deserialized, TEST_KEY);

      expect(decrypted).toBe(largeData);
    });
  });

  describe('Security Properties', () => {
    it('should use different IVs for each encryption', () => {
      const plaintext = 'test@example.com';
      const TEST_KEY = mockEnv.DATA_ENCRYPTION_KEY;
      const encrypted1 = encryptField(plaintext, TEST_KEY);
      const encrypted2 = encryptField(plaintext, TEST_KEY);

      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    it('should produce different ciphertexts for same plaintext', () => {
      const plaintext = 'test@example.com';
      const TEST_KEY = mockEnv.DATA_ENCRYPTION_KEY;
      const encrypted1 = encryptField(plaintext, TEST_KEY);
      const encrypted2 = encryptField(plaintext, TEST_KEY);

      expect(encrypted1.content).not.toBe(encrypted2.content);
    });

    it('should maintain confidentiality', () => {
      const plaintext = 'sensitive-data@example.com';
      const TEST_KEY = mockEnv.DATA_ENCRYPTION_KEY;
      const encrypted = encryptField(plaintext, TEST_KEY);
      const serialized = serializeEncryptedField(encrypted);

      // The serialized string should not contain the plaintext
      expect(serialized).not.toContain('sensitive-data');
      expect(serialized).not.toContain('@example.com');
    });
  });
});
