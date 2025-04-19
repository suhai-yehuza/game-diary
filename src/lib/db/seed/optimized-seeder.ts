import { config } from 'dotenv-flow';
import { sql } from 'drizzle-orm';
import { reset } from 'drizzle-seed';

import { DB_CONFIG } from '@/lib/config/db.config';
import * as schema from '@/lib/db/schema';
import { initializeDb } from '@/lib/db/seed/config';
import type { DatabaseClient } from '@/lib/types';
import { getCurrentSeason } from '@/lib/utils/index.time';

import { DataProcessor, PerformanceMonitor } from './data-processor';
import { OptimizedAPIClient } from './utils/api-client';

config();

// Optimized table operations
class TableOperations {
  constructor(private db: DatabaseClient) {}

  async tableExists(tableName: string): Promise<boolean> {
    const result = await this.db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      )
    `);
    return result.rows[0].exists;
  }

  async getTableSize(tableName: string): Promise<number> {
    if (!(await this.tableExists(tableName))) return 0;

    const result = await this.db.execute<{ count: number }>(sql`
      SELECT COUNT(*) as count FROM ${sql.identifier(tableName)}
    `);
    return result.rows[0].count;
  }

  async truncateTablesOptimized(tables: string[], type: 'external' | 'internal'): Promise<void> {
    console.log(`Optimized truncation of ${type} data tables...`);

    // Get existing tables
    const existingTables = await Promise.all(
      tables.map(async table => ({
        name: table,
        exists: await this.tableExists(table),
        size: await this.getTableSize(table),
      }))
    );

    const tablesToTruncate = existingTables.filter(t => t.exists && t.size > 0);

    if (tablesToTruncate.length === 0) {
      console.log(`No ${type} tables to truncate`);
      return;
    }

    // Disable foreign key checks temporarily for faster truncation
    await this.db.execute(sql`SET session_replication_role = replica`);

    try {
      // Parallel truncation for better performance
      await Promise.all(
        tablesToTruncate.map(async ({ name, size }) => {
          await this.db.execute(sql`TRUNCATE TABLE ${sql.identifier(name)} RESTART IDENTITY`);
          console.log(`Truncated ${name} (${size} rows)`);
        })
      );
    } finally {
      // Re-enable foreign key checks
      await this.db.execute(sql`SET session_replication_role = DEFAULT`);
    }

    console.log(`${type} data tables truncated successfully`);
  }

  async createOptimizedIndexes(): Promise<void> {
    console.log('Creating optimized database indexes...');

    const indexOperations = DB_CONFIG.indexes.map(async index => {
      try {
        await this.db.execute(sql`
          CREATE INDEX CONCURRENTLY IF NOT EXISTS ${sql.identifier(index.name)} 
          ON ${sql.identifier(index.table)} (${sql.join(index.columns.map(col => sql.identifier(col)))})
        `);
        console.log(`✓ Created index: ${index.name}`);
      } catch (error) {
        // If CONCURRENTLY fails, try without it
        try {
          await this.db.execute(sql`
            CREATE INDEX IF NOT EXISTS ${sql.identifier(index.name)} 
            ON ${sql.identifier(index.table)} (${sql.join(index.columns.map(col => sql.identifier(col)))})
          `);
          console.log(`✓ Created index: ${index.name} (without CONCURRENTLY)`);
        } catch (fallbackError) {
          console.error(`✗ Failed to create index ${index.name}:`, fallbackError);
          console.log(`✗ Initially failed with error:`, error);
        }
      }
    });

    await Promise.all(indexOperations);
    console.log('Database indexes created successfully');
  }
}

export interface OptimizedSeederOptions {
  env?: string;
  shouldResetDb?: boolean;
  shouldTruncateTables?: boolean;
  seasons?: number[];
  skipExternalDb?: boolean;
  skipApplicationDb?: boolean;
  concurrency?: number;
  batchSize?: number;
  enableMonitoring?: boolean;
  appendingData?: boolean;
  skipUsers?: boolean;
}

export class OptimizedSeeder {
  private db: DatabaseClient;
  private apiClient: OptimizedAPIClient;
  private tableOps: TableOperations;
  private processor: DataProcessor;
  private options: Required<OptimizedSeederOptions>;
  private monitor: PerformanceMonitor = new PerformanceMonitor();

  constructor(options: OptimizedSeederOptions = {}) {
    this.options = {
      env: 'development',
      shouldResetDb: false,
      shouldTruncateTables: false,
      seasons: [getCurrentSeason()],
      skipExternalDb: false,
      skipApplicationDb: false,
      concurrency: DB_CONFIG.seeding.external.CONCURRENT_OPERATIONS,
      batchSize: DB_CONFIG.seeding.external.BATCH_SIZE.GAMES,
      enableMonitoring: true,
      appendingData: false,
      skipUsers: false,
      ...options,
    };

    this.db = initializeDb();
    this.apiClient = new OptimizedAPIClient(this.options.concurrency);
    this.tableOps = new TableOperations(this.db);
    this.processor = new DataProcessor(this.db, this.apiClient, this.monitor);
  }

  async seed(): Promise<void> {
    try {
      console.log(`�� Starting optimized database seeding for ${this.options.env} environment...`);

      if (!this.options.appendingData) {
        await this.prepareDatabaseState();
        await this.createOptimizedSchema();
      }

      await this.seedData();

      console.log(`✅ Optimized database seeding completed`);

      if (this.options.enableMonitoring) {
        this.processor.logResults();
      }
    } catch (error) {
      console.error('❌ Error during optimized database seeding:', error);
      throw error;
    }
  }

  private async prepareDatabaseState(): Promise<void> {
    if (this.options.shouldResetDb) {
      console.log('🔄 Resetting database...');
      await reset(this.db, schema);
      console.log('✅ Database reset complete');
    } else if (this.options.shouldTruncateTables) {
      await this.truncateTables();
    }
  }

  private async truncateTables(): Promise<void> {
    if (!this.options.skipExternalDb) {
      await this.tableOps.truncateTablesOptimized(
        [...DB_CONFIG.seeding.tables.external],
        'external'
      );
    }

    if (!this.options.skipApplicationDb) {
      await this.tableOps.truncateTablesOptimized(
        [...DB_CONFIG.seeding.tables.internal],
        'internal'
      );
    }
  }

  private async createOptimizedSchema(): Promise<void> {
    await this.tableOps.createOptimizedIndexes();
  }

  private async seedData(): Promise<void> {
    // Seed external data first (NBA data)
    if (!this.options.skipExternalDb) {
      await this.seedExternalData();
    }

    // Seed application data (users, game logs, etc.)
    if (!this.options.skipApplicationDb) {
      await this.seedApplicationData();
    }
  }

  private async seedExternalData(): Promise<void> {
    console.log('🌐 Seeding external NBA data...');

    // Import optimized external seeding functions
    const { seedOptimizedExternalData } = await import('./optimized-external-seeder.js');

    await seedOptimizedExternalData({
      seasons: this.options.seasons,
      apiClient: this.apiClient,
      processor: this.processor,
      batchSize: this.options.batchSize,
      appendingData: this.options.appendingData,
    });

    console.log('✅ External data seeding completed');
  }

  private async seedApplicationData(): Promise<void> {
    console.log('👥 Seeding application data...');

    // Import optimized application seeding functions
    const { seedOptimizedApplicationData } = await import('./optimized-application-seeder');

    await seedOptimizedApplicationData({
      db: this.db,
      processor: this.processor,
      batchSize: this.options.batchSize,
      tables: [...DB_CONFIG.seeding.tables.internal],
      skipUsers: this.options.skipUsers,
    });

    console.log('✅ Application data seeding completed');
  }
}

// CLI interface
export async function runOptimizedSeeder(options: OptimizedSeederOptions = {}): Promise<void> {
  const seeder = new OptimizedSeeder(options);
  await seeder.seed();
}

// Allow running directly from command line
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options: OptimizedSeederOptions = {};

  for (const arg of args) {
    const [key, value] = arg.split('=');
    switch (key) {
      case '--seasons':
        options.seasons = value.split(',').map(s => parseInt(s.trim()));
        break;
      case '--resetDb':
        options.shouldResetDb = value === 'true';
        break;
      case '--appendingData':
        options.appendingData = value === 'true';
        break;
      case '--skipUsers':
        options.skipUsers = value === 'true';
        break;
      case '--truncateTables':
        options.shouldTruncateTables = value === 'true';
        break;
      case '--skipExternalDb':
        options.skipExternalDb = value === 'true';
        break;
      case '--skipApplicationDb':
        options.skipApplicationDb = value === 'true';
        break;
      case '--concurrency':
        options.concurrency = parseInt(value);
        break;
      case '--batchSize':
        options.batchSize = parseInt(value);
        break;
    }
  }

  runOptimizedSeeder(options)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Failed to run optimized seeder:', error);
      process.exit(1);
    });
}
