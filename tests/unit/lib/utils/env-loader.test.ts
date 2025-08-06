/// <reference types="vitest/globals" />

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { loadEnvironmentVariables, validateEnvironmentVariables } from '@/lib/utils/env-loader';

// Mock fs
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
  },
}));

// Mock dotenv-flow
vi.mock('dotenv-flow', () => ({
  config: vi.fn(),
}));

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
};

describe('Environment Loader Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console methods before each test
    vi.spyOn(console, 'log').mockImplementation(mockConsole.log);
    vi.spyOn(console, 'warn').mockImplementation(mockConsole.warn);

    // Reset process.env
    delete process.env.CI;
    delete process.env.GITHUB_ACTIONS;
    delete process.env.VERCEL;
    delete process.env.DATABASE_URL;
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    delete process.env.CLERK_SECRET_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadEnvironmentVariables', () => {
    it('skips loading in CI environment', () => {
      process.env.CI = 'true';

      loadEnvironmentVariables();

      expect(mockConsole.log).toHaveBeenCalledWith(
        '🔧 CI environment detected, skipping .env file loading'
      );
    });

    it('skips loading in GitHub Actions environment', () => {
      process.env.GITHUB_ACTIONS = 'true';

      loadEnvironmentVariables();

      expect(mockConsole.log).toHaveBeenCalledWith(
        '🔧 CI environment detected, skipping .env file loading'
      );
    });

    it('skips loading in Vercel environment', () => {
      process.env.VERCEL = 'true';

      loadEnvironmentVariables();

      expect(mockConsole.log).toHaveBeenCalledWith(
        '🔧 CI environment detected, skipping .env file loading'
      );
    });

    it('skips loading when no .env files exist', async () => {
      const fs = await import('fs');
      vi.mocked(fs.default.existsSync).mockReturnValue(false);

      loadEnvironmentVariables();

      expect(mockConsole.log).toHaveBeenCalledWith(
        '⚠️  No .env files found, using system environment variables'
      );
    });

    it('loads environment variables when .env files exist', async () => {
      const fs = await import('fs');
      const dotenvFlow = await import('dotenv-flow');

      vi.mocked(fs.default.existsSync).mockReturnValue(true);
      vi.mocked(dotenvFlow.config).mockReturnValue({
        error: undefined,
        parsed: { TEST_VAR: 'test_value' },
      });

      loadEnvironmentVariables();

      expect(dotenvFlow.config).toHaveBeenCalledWith({
        silent: true,
        default_node_env: 'development',
      });
      expect(mockConsole.log).toHaveBeenCalledWith('✅ Environment variables loaded successfully');
    });

    it('handles errors gracefully', async () => {
      const fs = await import('fs');
      const dotenvFlow = await import('dotenv-flow');

      vi.mocked(fs.default.existsSync).mockReturnValue(true);
      vi.mocked(dotenvFlow.config).mockImplementation(() => {
        throw new Error('Config error');
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
    it('passes validation when all required variables are present', () => {
      process.env.DATABASE_URL = 'test-db-url';
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-clerk-key';
      process.env.CLERK_SECRET_KEY = 'test-clerk-secret';

      expect(() => validateEnvironmentVariables()).not.toThrow();
    });

    it('warns about missing variables in non-CI environment', () => {
      // Only set one required variable
      process.env.DATABASE_URL = 'test-db-url';

      validateEnvironmentVariables();

      expect(mockConsole.warn).toHaveBeenCalledWith(
        '⚠️  Missing required environment variables:',
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY'
      );
    });

    it('throws error in CI environment when variables are missing', () => {
      process.env.CI = 'true';
      // Only set one required variable
      process.env.DATABASE_URL = 'test-db-url';

      expect(() => validateEnvironmentVariables()).toThrow(
        'Missing required environment variables: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY'
      );
    });

    it('throws error in GitHub Actions environment when variables are missing', () => {
      process.env.GITHUB_ACTIONS = 'true';
      // Only set one required variable
      process.env.DATABASE_URL = 'test-db-url';

      expect(() => validateEnvironmentVariables()).toThrow(
        'Missing required environment variables: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY'
      );
    });

    it('validates all required variables are checked', () => {
      // Don't set any required variables
      validateEnvironmentVariables();

      expect(mockConsole.warn).toHaveBeenCalledWith(
        '⚠️  Missing required environment variables:',
        'DATABASE_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY'
      );
    });
  });

  describe('integration scenarios', () => {
    it('handles mixed environment scenarios', async () => {
      const fs = await import('fs');
      const dotenvFlow = await import('dotenv-flow');

      // Set up a scenario where .env files exist but some required vars are missing
      vi.mocked(fs.default.existsSync).mockReturnValue(true);
      vi.mocked(dotenvFlow.config).mockReturnValue({
        error: undefined,
        parsed: { TEST_VAR: 'test_value' },
      });
      process.env.DATABASE_URL = 'test-db-url';
      // Missing other required variables

      loadEnvironmentVariables();
      validateEnvironmentVariables();

      expect(dotenvFlow.config).toHaveBeenCalled();
      expect(mockConsole.log).toHaveBeenCalledWith('✅ Environment variables loaded successfully');
      expect(mockConsole.warn).toHaveBeenCalledWith(
        '⚠️  Missing required environment variables:',
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY'
      );
    });

    it('handles CI environment with missing variables', () => {
      process.env.CI = 'true';
      // Don't set any required variables

      loadEnvironmentVariables();
      expect(() => validateEnvironmentVariables()).toThrow();
    });
  });
});
