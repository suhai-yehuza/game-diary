import { config } from 'dotenv-flow'; // Load env vars based on NODE_ENV
import { sql } from 'drizzle-orm';
import { reset } from 'drizzle-seed';

import { DB_CONFIG } from '@/lib/config/db.config';
import * as schema from '@/lib/db/schema';
import { initializeDb } from '@/lib/db/seed/config';
import { seedApplicationData as seedInternalDb } from '@/lib/db/seed/seed-application-data';
import { seedExternalData } from '@/lib/db/seed/seed-external-api-data';
import type { DatabaseClient } from '@/lib/types/db.types';
import { getCurrentSeason } from '@/lib/utils/index.time';

config();

/**
 * Creates necessary database indexes for performance
 */
async function createIndexes(db: DatabaseClient) {
  console.log('Creating database indexes...');
  for (const index of DB_CONFIG.indexes) {
    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS ${sql.identifier(index.name)} 
        ON ${sql.identifier(index.table)} (${sql.join(index.columns.map(col => sql.identifier(col)))})
      `);
      console.log(`Created index: ${index.name}`);
    } catch (error) {
      console.error(`Error creating index ${index.name}:`, error);
      throw error;
    }
  }
  console.log('Database indexes created successfully');
}

/**
 * Check if a table exists in the database
 */
async function tableExists(db: DatabaseClient, tableName: string): Promise<boolean> {
  const result = await db.execute<{ exists: boolean }>(sql`
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ${tableName}
    )
  `);
  return result.rows[0].exists;
}

/**
 * Truncates specified tables in the database
 */
async function truncateTables(db: DatabaseClient, tables: string[], type: 'external' | 'internal') {
  console.log(`Truncating ${type} data tables...`);
  for (const table of tables) {
    try {
      if (await tableExists(db, table)) {
        await db.execute(sql`TRUNCATE TABLE ${sql.identifier(table)} CASCADE`);
        console.log(`Truncated table: ${table}`);
      } else {
        console.log(`Table ${table} does not exist, skipping truncation`);
      }
    } catch (error) {
      console.error(`Error truncating table ${table}:`, error);
      throw error;
    }
  }
  console.log(`${type} data tables truncated`);
}

export async function setupDatabase(
  options: {
    env: string;
    shouldResetDb?: boolean;
    shouldTruncateTables?: boolean;
    seasons?: number[];
    skipExternalDb?: boolean;
    skipApplicationDb?: boolean;
  } = {
    env: 'development',
    shouldResetDb: false,
    shouldTruncateTables: false,
    seasons: undefined,
    skipExternalDb: false,
    skipApplicationDb: false,
  }
) {
  try {
    // Set default seasons to current season if not provided
    if (!options.seasons) {
      options.seasons = [getCurrentSeason()];
    }

    console.log(`Starting database setup for ${options.env} environment...`);
    console.log('Setup options:', {
      env: options.env,
      shouldResetDb: options.shouldResetDb,
      shouldTruncateTables: options.shouldTruncateTables,
      seasons: options.seasons,
      skipExternalDb: options.skipExternalDb,
      skipApplicationDb: options.skipApplicationDb,
    });

    // Initialize the database client first
    const db = initializeDb();

    // Reset the database if requested
    if (options.shouldResetDb) {
      console.log('Resetting database...');
      await reset(db, schema);
      console.log('Database reset complete');
    } else if (options.shouldTruncateTables) {
      // Only truncate tables if we're not resetting
      if (!options.skipExternalDb) {
        console.log('Truncating external tables...');
        await truncateTables(db, [...DB_CONFIG.seeding.tables.external], 'external');
        console.log('External tables truncated');
      }

      if (!options.skipApplicationDb) {
        console.log('Truncating internal tables...');
        await truncateTables(db, [...DB_CONFIG.seeding.tables.internal], 'internal');
        console.log('Internal tables truncated');
      }
    }

    // Create indexes for better query performance
    await createIndexes(db);

    // Seed external data first since internal data depends on it
    console.log('Seeding external data...');
    console.log('Seasons before externalDataOptions:', options.seasons);
    console.log('Seasons array type:', Array.isArray(options.seasons));
    console.log('Seasons array contents:', JSON.stringify(options.seasons));

    // Create a new array with explicit number conversion
    const seasonsArray = (options.seasons || []).reduce<number[]>((acc, season) => {
      const num = Number(season);
      if (!isNaN(num) && Number.isInteger(num)) {
        acc.push(num);
      }
      return acc;
    }, []);

    const externalDataOptions = {
      seasons: seasonsArray,
      skipExternalDb: options.skipExternalDb,
    };
    console.log('Seasons in externalDataOptions:', externalDataOptions.seasons);
    console.log('ExternalDataOptions array type:', Array.isArray(externalDataOptions.seasons));
    console.log('ExternalDataOptions array contents:', JSON.stringify(externalDataOptions.seasons));
    console.log('Passing to seedExternalData:', externalDataOptions);
    // Seed external data?
    if (!options.skipExternalDb) {
      console.log('Seeding external data...');
      await seedExternalData(externalDataOptions);
      console.log('External data seeding complete');
    } else {
      console.log('Skipping external data seeding as requested');
    }

    // Seed internal data?
    if (!options.skipApplicationDb) {
      console.log('Seeding internal data...');
      await seedInternalDb({
        skipApplicationDb: options.skipApplicationDb,
      });
      console.log('Internal data seeding complete');
    } else {
      console.log('Skipping internal data seeding as requested');
    }

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error during database setup:', error);
    throw error;
  }
}

// Allow running directly from command line
if (import.meta.url === import.meta.resolve('./setup-db.ts')) {
  const args = process.argv.slice(2);
  const options: {
    seasons?: string;
    resetDb?: boolean;
    truncateTables?: boolean;
    skipExternalDb?: boolean;
    skipApplicationDb?: boolean;
  } = {};

  for (const arg of args) {
    const [key, value] = arg.split('=');
    switch (key) {
      case '--seasons':
        options.seasons = value;
        break;
      case '--resetDb':
        options.resetDb = value === 'true';
        break;
      case '--truncateTables':
        options.truncateTables = value === 'true';
        break;
      case '--skipExternalDb':
        options.skipExternalDb = value === 'true';
        break;
      case '--skipApplicationDb':
        options.skipApplicationDb = value === 'true';
        break;
    }
  }

  // Determine environment from npm script name or command line argument
  let env = 'development';
  const npmScript = process.env.npm_lifecycle_event;
  if (npmScript?.endsWith(':prod')) {
    env = 'production';
  }

  setupDatabase({
    env,
    seasons: options.seasons ? options.seasons.split(',').map(s => parseInt(s.trim())) : undefined,
    shouldResetDb: options.resetDb,
    shouldTruncateTables: options.truncateTables,
    skipExternalDb: options.skipExternalDb,
    skipApplicationDb: options.skipApplicationDb,
  })
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Failed to setup database:', error);
      process.exit(1);
    });
}
