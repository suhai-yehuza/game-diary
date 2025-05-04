import dotenv from 'dotenv-flow';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/neon-http/migrator';

// Get environment from command line argument or default to development
const env = process.argv[2] || 'development';

// Load environment variables for the specified environment
dotenv.config({
  node_env: env,
  default_node_env: 'development'
});

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    `DATABASE_URL is not set for ${env} environment. Please check your .env.${env} file.`
  );
}

const sql = neon(connectionString, {
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

const db = drizzle(sql, {
  schema,
  logger: true,
});

async function main() {
  console.log(`Starting database migration for ${env} environment...`);
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log(`Migration completed successfully for ${env} environment!`);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

main();
