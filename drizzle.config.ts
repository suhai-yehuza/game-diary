import type { Config } from 'drizzle-kit';

import { loadEnvironmentVariables, isCI } from '@/lib/utils/env-loader';

// Load environment variables safely
loadEnvironmentVariables();

// Only require DATABASE_URL for non-CI environments or when actually running database operations
if (!process.env.DATABASE_URL && !isCI()) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// In CI, provide a dummy URL if not available (for config validation only)
const databaseUrl =
  process.env.DATABASE_URL || (isCI() ? 'postgresql://dummy:dummy@localhost:5432/dummy' : '');

export default {
  schema: './src/lib/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
} satisfies Config;
