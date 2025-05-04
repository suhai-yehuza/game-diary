import dotenv from 'dotenv-flow';
dotenv.config({
  node_env: process.env.NODE_ENV || 'development',
  default_node_env: 'development'
});

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Please check your .env file and make sure it's properly loaded."
  );
}

let sql: ReturnType<typeof neon>;
try {
  console.log('Attempting to connect to database...');
  sql = neon(connectionString, {
    fetchOptions: {
      cache: 'no-store',
      next: { revalidate: 0 },
      timeout: 10000,
      retry: {
        retries: 3,
        minTimeout: 1000,
        maxTimeout: 5000,
      },
    },
  });
  console.log('Database connection established successfully');
} catch (error) {
  console.error('Failed to connect to database:', error);
  if (error instanceof Error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
  throw error;
}

async function testConnection() {
  try {
    await sql`SELECT 1`;
    console.log('Database connection test successful');
  } catch (error) {
    console.error('Database connection test failed:', error);
    throw new Error('Database connection test failed');
  }
}

testConnection().catch(console.error);

export const db = drizzle(sql, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});
