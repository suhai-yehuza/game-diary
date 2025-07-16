import type { Config } from 'drizzle-kit';
import dotenvFlow from 'dotenv-flow';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables safely - prioritize .env.development for dev/test
const isDevOrTest =
  process.env.NODE_ENV === 'development' ||
  process.env.NODE_ENV === 'test' ||
  !process.env.NODE_ENV;
if (isDevOrTest) {
  // For development/test, load .env.development first, then .env.local as override
  if (process.env.NODE_ENV === 'development' && fs.existsSync('.env.development')) {
    dotenv.config({ path: '.env.development' });
  }
  // Then load .env.local as override if it exists
  if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
  }
} else {
  // For production/staging, only load environment-specific files synchronously
  const env = process.env.NODE_ENV || 'development';
  let envFile = '.env';
  if (String(env) === 'staging' && fs.existsSync('.env.staging')) {
    envFile = '.env.staging';
  } else if (String(env) === 'production' && fs.existsSync('.env.production')) {
    envFile = '.env.production';
  } else if (String(env) === 'development' && fs.existsSync('.env.development')) {
    envFile = '.env.development';
  }
  dotenv.config({ path: envFile });
}

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
