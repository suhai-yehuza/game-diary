import dotenv from 'dotenv-flow';
dotenv.config();

import { db } from './index';
import { migrate } from 'drizzle-orm/neon-http/migrator';

async function main() {
  console.log('Starting database migration...');
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

main();
