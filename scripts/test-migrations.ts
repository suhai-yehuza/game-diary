import fs from 'fs';
import path from 'path';
import { logger } from '@/lib/logger';
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// List migration files that would be executed
function listMigrations() {
  const migrationsDir = path.resolve(process.cwd(), 'drizzle');
  const files = fs
    .readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  logger.info('Migration files that would be executed (in order):');
  files.forEach((file, index) => {
    logger.info(`${index + 1}. ${file}`);
  });
}

listMigrations();
