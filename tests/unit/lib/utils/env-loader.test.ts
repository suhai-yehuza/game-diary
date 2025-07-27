/// <reference types="vitest/globals" />

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';

import { loadEnvironmentVariables, validateEnvironmentVariables } from '@/lib/utils/env-loader';

// Mock fs
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
  },
}));

// Mock console methods
const originalConsole = { ...console };
const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
};

describe('env-loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console
    global.console = mockConsole as any;
    // Reset environment
    delete process.env.CI;
    delete process.env.GITHUB_ACTIONS;
    delete process.env.VERCEL;
    delete process.env.DATABASE_URL;
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    delete process.env.CLERK_SECRET_KEY;
  });

  afterEach(() => {
    // Restore console
    global.console = originalConsole;
  });

  describe('loadEnvironmentVariables', () => {
    it('skips loading in CI environment', () => {
      process.env.CI = 'true';
      loadEnvironmentVariables();
      expect(mockConsole.log).toHaveBeenCalledWith(
        '🔧 CI environment detected, skipping .env file loading'
      );
    });

    it('skips loading in GitHub Actions', () => {
      process.env.GITHUB_ACTIONS = 'true';
      loadEnvironmentVariables();
      expect(mockConsole.log).toHaveBeenCalledWith(
        '🔧 CI environment detected, skipping .env file loading'
      );
    });

    it('skips loading in Vercel', () => {
      process.env.VERCEL = 'true';
      loadEnvironmentVariables();
      expect(mockConsole.log).toHaveBeenCalledWith(
        '🔧 CI environment detected, skipping .env file loading'
      );
    });

    it('skips loading when no .env files exist', () => {
      (fs.existsSync as vi.Mock).mockReturnValue(false);
      loadEnvironmentVariables();
      expect(mockConsole.log).toHaveBeenCalledWith(
        '⚠️  No .env files found, using system environment variables'
      );
    });

    it('loads environment variables when .env files exist', () => {
      (fs.existsSync as vi.Mock).mockReturnValue(true);
      loadEnvironmentVariables();
      expect(mockConsole.log).toHaveBeenCalledWith('✅ Environment variables loaded successfully');
    });

    it('handles errors gracefully', () => {
      (fs.existsSync as vi.Mock).mockImplementation(() => {
        throw new Error('File system error');
      });
      loadEnvironmentVariables();
      expect(mockConsole.warn).toHaveBeenCalledWith(
        '⚠️  Failed to load environment variables from .env files:',
        expect.any(Error)
      );
      expect(mockConsole.log).toHaveBeenCalledWith('📝 Using system environment variables instead');
    });
  });

  describe('validateEnvironmentVariables', () => {
    it('passes when all required variables are set', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_key';
      process.env.CLERK_SECRET_KEY = 'sk_test_key';
      expect(() => validateEnvironmentVariables()).not.toThrow();
    });

    it('warns when required variables are missing in development', () => {
      expect(() => validateEnvironmentVariables()).not.toThrow();
      expect(mockConsole.warn).toHaveBeenCalledWith(
        '⚠️  Missing required environment variables:',
        'DATABASE_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY'
      );
    });

    it('throws error when required variables are missing in CI', () => {
      process.env.CI = 'true';
      expect(() => validateEnvironmentVariables()).toThrow(
        'Missing required environment variables: DATABASE_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY'
      );
    });

    it('throws error when required variables are missing in GitHub Actions', () => {
      process.env.GITHUB_ACTIONS = 'true';
      expect(() => validateEnvironmentVariables()).toThrow(
        'Missing required environment variables: DATABASE_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY'
      );
    });

    it('warns for partial missing variables', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      expect(() => validateEnvironmentVariables()).not.toThrow();
      expect(mockConsole.warn).toHaveBeenCalledWith(
        '⚠️  Missing required environment variables:',
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY'
      );
    });
  });
});
