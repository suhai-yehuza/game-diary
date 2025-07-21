import type { Config } from 'drizzle-kit';

import { loadEnvironmentVariables } from '@/lib/utils/env-loader';

// Load environment variables safely
loadEnvironmentVariables();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

export default {
  schema: './src/lib/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
} satisfies Config;
