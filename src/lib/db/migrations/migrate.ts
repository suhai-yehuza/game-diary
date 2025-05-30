import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import type { NeonDbError } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import * as schema from '../schema';
import { createDatabaseClient } from '../seed/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get environment from command line argument or default to development
const env = process.argv[2] || 'development';

function splitStatements(sqlContent: string): string[] {
  const statements: string[] = [];
  let currentStatement = '';
  let inDollarQuote = false;
  let dollarQuoteTag = '';
  let i = 0;

  while (i < sqlContent.length) {
    // Handle dollar quotes ($$, $tag$)
    if (sqlContent[i] === '$') {
      let tag = '';
      let j = i + 1;
      while (j < sqlContent.length && sqlContent[j] !== '$' && /[\w]/.test(sqlContent[j])) {
        tag += sqlContent[j];
        j++;
      }
      if (j < sqlContent.length && sqlContent[j] === '$') {
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarQuoteTag = tag;
        } else if (dollarQuoteTag === tag) {
          inDollarQuote = false;
          dollarQuoteTag = '';
        }
      }
    }

    // Only look for statement terminators when not in a dollar quote
    if (!inDollarQuote && sqlContent[i] === ';') {
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim() + ';');
      }
      currentStatement = '';
    } else {
      currentStatement += sqlContent[i];
    }

    i++;
  }

  // Add the last statement if there is one
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim() + ';');
  }

  return statements.filter(s => s.length > 0);
}

async function executeMigrationFile(db: NeonHttpDatabase<typeof schema>, filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const statements = splitStatements(content);

  for (const statement of statements) {
    try {
      await db.execute(sql.raw(statement));
      console.log('Successfully executed statement');
    } catch (error: unknown) {
      const neonError = error as NeonDbError;
      if (neonError.code === '42710' || neonError.code === '42P07') {
        // Ignore "already exists" errors
        console.log('Skipping statement - object already exists');
        continue;
      }
      throw error;
    }
  }
}

export async function main() {
  console.log(`Starting database migration for ${env} environment...`);
  try {
    const db = createDatabaseClient({ env, logger: true });

    // First ensure the drizzle schema exists
    await db.execute(sql`CREATE SCHEMA IF NOT EXISTS "drizzle"`);

    // Create the migrations table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        createdAt bigint
      )
    `);

    // Get all migration files in order
    const migrationsDir = path.resolve(process.cwd(), 'src/lib/db/migrations');
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    // Execute each migration file
    for (const file of migrationFiles) {
      console.log(`Executing migration file: ${file}`);
      await executeMigrationFile(
        db as unknown as NeonHttpDatabase<typeof schema>,
        path.join(migrationsDir, file)
      );
    }

    console.log(`Migration completed successfully for ${env} environment!`);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// run main if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
