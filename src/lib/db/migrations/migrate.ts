import fs from 'fs';
import path from 'path';

import { sql } from 'drizzle-orm';

import { db } from '../index';

const MIGRATIONS_DIR = path.join(process.cwd(), 'src/lib/db/migrations');

async function getMigrationFiles(): Promise<string[]> {
  const types = ['base', 'feature', 'trigger'];
  const migrations: string[] = [];

  for (const type of types) {
    const typeDir = path.join(MIGRATIONS_DIR, type);
    if (fs.existsSync(typeDir)) {
      const files = fs
        .readdirSync(typeDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
      migrations.push(...files.map(file => path.join(type, file)));
    }
  }

  return migrations;
}

async function runMigration(file: string) {
  const filePath = path.join(MIGRATIONS_DIR, file);
  const sqlContent = fs.readFileSync(filePath, 'utf-8');

  console.log(`Executing migration: ${file}`);
  await db.execute(sql.raw(sqlContent));
  console.log(`Successfully executed migration: ${file}`);
}

export async function migrate() {
  try {
    const migrationFiles = await getMigrationFiles();

    for (const file of migrationFiles) {
      await runMigration(file);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  migrate().catch(console.error);
}
