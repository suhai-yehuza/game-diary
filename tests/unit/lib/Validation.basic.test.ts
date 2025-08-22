import { describe, expect, it } from 'vitest';

import {
  extractEmail,
  extractPhoneNumber,
  validateEmail,
  validatePhone,
} from '@/lib/utils/validation';
import { envSchema } from '@/lib/validations/env';

describe('Environment Validation', () => {
  it('validates required environment variables', () => {
    const validEnv = {
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      NEXT_PUBLIC_RAPID_API_KEY: 'test-key',
      NEXT_PUBLIC_RAPID_API_HOST: 'test-host',
      NEXT_PUBLIC_RAPID_API_BASE_URL: 'https://test-api.com',
    };

    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
  });

  it('allows missing API variables (they are optional)', () => {
    const envWithoutApi = {
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      // API variables are optional and can be omitted
    };

    const result = envSchema.safeParse(envWithoutApi);
    expect(result.success).toBe(true);
  });

  it('rejects invalid NEXTAUTH_URL', () => {
    const invalidEnv = {
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      NEXT_PUBLIC_RAPID_API_KEY: 'test-key',
      NEXT_PUBLIC_RAPID_API_HOST: 'test-host',
      NEXT_PUBLIC_RAPID_API_BASE_URL: 'https://test-api.com',
      NEXTAUTH_URL: 'not-a-url',
    };

    const result = envSchema.safeParse(invalidEnv);
    expect(result.success).toBe(false);
  });

  it('rejects missing required DATABASE_URL', () => {
    const invalidEnv = {
      NODE_ENV: 'development',
      // DATABASE_URL is required and missing
      NEXT_PUBLIC_RAPID_API_KEY: 'test-key',
      NEXT_PUBLIC_RAPID_API_HOST: 'test-host',
      NEXT_PUBLIC_RAPID_API_BASE_URL: 'https://test-api.com',
    };

    const result = envSchema.safeParse(invalidEnv);
    expect(result.success).toBe(false);
  });
});

describe('Clerk Data Extraction', () => {
  describe('extractEmail', () => {
    it('extracts email from user with email addresses', () => {
      const userWithEmail = {
        email_addresses: [
          { email_address: 'test@example.com' },
          { email_address: 'secondary@example.com' },
        ],
      };

      const result = extractEmail(userWithEmail);
      expect(result).toBe('test@example.com');
    });

    it('returns null for user with no email addresses (phone-only user)', () => {
      const phoneOnlyUser = {
        email_addresses: [],
      };

      const result = extractEmail(phoneOnlyUser);
      expect(result).toBeNull();
    });

    it('returns null for user with undefined email_addresses', () => {
      const userWithUndefinedEmails = {
        email_addresses: undefined as any,
      };

      const result = extractEmail(userWithUndefinedEmails);
      expect(result).toBeNull();
    });

    it('returns null for user with null email_addresses', () => {
      const userWithNullEmails = {
        email_addresses: null as any,
      };

      const result = extractEmail(userWithNullEmails);
      expect(result).toBeNull();
    });

    it('returns null for user with invalid email address', () => {
      const userWithInvalidEmail = {
        email_addresses: [{ email_address: 'invalid-email' }],
      };

      const result = extractEmail(userWithInvalidEmail);
      expect(result).toBeNull();
    });

    it('handles user with empty email_addresses array', () => {
      const userWithEmptyEmails = {
        email_addresses: [],
      };

      const result = extractEmail(userWithEmptyEmails);
      expect(result).toBeNull();
    });

    it('handles user with email_addresses that have undefined email_address', () => {
      const userWithUndefinedEmailAddress = {
        email_addresses: [{ email_address: undefined as any }],
      };

      const result = extractEmail(userWithUndefinedEmailAddress);
      expect(result).toBeNull();
    });
  });

  describe('extractPhoneNumber', () => {
    it('extracts phone number from user with phone numbers', () => {
      const userWithPhone = {
        phone_numbers: [{ phone_number: '+14154251945' }, { phone_number: '+1234567890' }],
      };

      const result = extractPhoneNumber(userWithPhone);
      expect(result).toBe('+14154251945');
    });

    it('returns null for user with no phone numbers (email-only user)', () => {
      const emailOnlyUser = {
        phone_numbers: [],
      };

      const result = extractPhoneNumber(emailOnlyUser);
      expect(result).toBeNull();
    });

    it('returns null for user with undefined phone_numbers', () => {
      const userWithUndefinedPhones = {
        phone_numbers: undefined as any,
      };

      const result = extractPhoneNumber(userWithUndefinedPhones);
      expect(result).toBeNull();
    });

    it('returns null for user with null phone_numbers', () => {
      const userWithNullPhones = {
        phone_numbers: null as any,
      };

      const result = extractPhoneNumber(userWithNullPhones);
      expect(result).toBeNull();
    });

    it('returns null for user with invalid phone number', () => {
      const userWithInvalidPhone = {
        phone_numbers: [{ phone_number: 'invalid-phone' }],
      };

      const result = extractPhoneNumber(userWithInvalidPhone);
      expect(result).toBeNull();
    });

    it('handles user with empty phone_numbers array', () => {
      const userWithEmptyPhones = {
        phone_numbers: [],
      };

      const result = extractPhoneNumber(userWithEmptyPhones);
      expect(result).toBeNull();
    });

    it('handles user with phone_numbers that have undefined phone_number', () => {
      const userWithUndefinedPhoneNumber = {
        phone_numbers: [{ phone_number: undefined }],
      };

      const result = extractPhoneNumber(userWithUndefinedPhoneNumber);
      expect(result).toBeNull();
    });
  });

  describe('Phone-only user edge case', () => {
    it('handles real-world phone-only user data structure', () => {
      const phoneOnlyUser = {
        id: 'user_2znQgIwgMHwzqYAt87SysZnp8gq',
        username: 'suhai-phone',
        first_name: null,
        last_name: null,
        email_addresses: [], // Empty array - no email addresses
        phone_numbers: [
          {
            id: 'idn_2znQebl49fVHmKNsrWGUf1zwJ8p',
            phone_number: '+14154251945',
            verification: {
              status: 'verified',
              strategy: 'phone_code',
            },
          },
        ],
        primary_email_address_id: null,
        primary_phone_number_id: 'idn_2znQebl49fVHmKNsrWGUf1zwJ8p',
      };

      const emailResult = extractEmail(phoneOnlyUser);
      const phoneResult = extractPhoneNumber(phoneOnlyUser);

      expect(emailResult).toBeNull();
      expect(phoneResult).toBe('+14154251945');
    });

    it('handles user with both email and phone', () => {
      const userWithBoth = {
        id: 'user_123',
        username: 'testuser',
        email_addresses: [{ email_address: 'test@example.com' }],
        phone_numbers: [{ phone_number: '+14154251945' }],
        primary_email_address_id: 'email_123',
        primary_phone_number_id: 'phone_123',
      };

      const emailResult = extractEmail(userWithBoth);
      const phoneResult = extractPhoneNumber(userWithBoth);

      expect(emailResult).toBe('test@example.com');
      expect(phoneResult).toBe('+14154251945');
    });

    it('handles user with neither email nor phone', () => {
      const userWithNeither = {
        id: 'user_456',
        username: 'minimaluser',
        email_addresses: [],
        phone_numbers: [],
        primary_email_address_id: null,
        primary_phone_number_id: null,
      };

      const emailResult = extractEmail(userWithNeither);
      const phoneResult = extractPhoneNumber(userWithNeither);

      expect(emailResult).toBeNull();
      expect(phoneResult).toBeNull();
    });
  });
});

describe('Validation Functions', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('123@numbers.com')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('validates correct phone numbers', () => {
      expect(validatePhone('+14154251945')).toBe(true);
      expect(validatePhone('+1234567890')).toBe(true);
      expect(validatePhone('1234567890')).toBe(true);
      expect(validatePhone('123456789')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(validatePhone('invalid-phone')).toBe(false);
      expect(validatePhone('+44 20 7946 0958')).toBe(false); // Contains spaces
      expect(validatePhone('0123456789')).toBe(false); // Starts with 0
      expect(validatePhone('')).toBe(false);
      expect(validatePhone(null as any)).toBe(false);
      expect(validatePhone(undefined as any)).toBe(false);
    });
  });
});
