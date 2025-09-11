import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import { isCI } from '@/lib/utils/env-loader';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import type { Database, IDatabaseConfig } from '@/types';
import * as schema from '@src/lib/db/schema';

// Database connection pool configuration
class DatabaseManager {
  private sql: ReturnType<typeof neon> | null = null;
  private db: Database | null = null;
  private readonly config: IDatabaseConfig;
  private retryCount = 0;
  private readonly maxRetries: number;

  constructor(config: IDatabaseConfig) {
    this.config = {
      poolSize: 10,
      connectionTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };
    this.maxRetries = this.config.retryAttempts ?? 3;
  }

  async initialize(): Promise<void> {
    if (!this.config.connectionString) {
      throw new Error('Database connection string is required');
    }

    await this.connectWithRetry();
  }

  private async connectWithRetry(): Promise<void> {
    while (this.retryCount < this.maxRetries) {
      try {
        if (!this.config.connectionString) {
          throw new Error('Database connection string is required');
        }
        this.sql = neon(this.config.connectionString);
        this.db = drizzle(this.sql, { schema });

        // Test the connection
        await this.db.execute('SELECT 1');
        logger.info('Database connection established successfully');
        this.retryCount = 0; // Reset retry count on success
        return;
      } catch (error) {
        this.retryCount++;
        logger.warn(`Database connection attempt ${this.retryCount} failed:`, {
          error: error as Error,
        });

        if (this.retryCount >= this.maxRetries) {
          throw new Error(`Failed to connect to database after ${this.maxRetries} attempts`);
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
      }
    }
  }

  getDatabase(): Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.db) return false;
      await this.db.execute('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  close(): void {
    // Note: Neon serverless doesn't require explicit connection closing
    this.sql = null;
    this.db = null;
  }
}

// Global database manager instance
const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';
const dbManager = new DatabaseManager({ connectionString });

// Initialize database connection in all runtimes except explicit CI/test runners or when MOCK_MODE is enabled
// Note: Production platforms like Vercel are NOT considered CI by our isCI().
if (connectionString && !isCI() && process.env.MOCK_MODE !== 'true') {
  dbManager.initialize().catch(error => {
    // Use centralized error handling
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Database Manager',
      action: 'Database initialization',
    });
  });
}

// Export database instance for backward compatibility
export const db = () => {
  // If MOCK_MODE is enabled, return null to indicate no database connection
  if (process.env.MOCK_MODE === 'true') {
    return null;
  }

  try {
    return dbManager.getDatabase();
  } catch (_error) {
    // If database is not initialized, return null
    return null;
  }
};

// Export database manager for advanced usage
export { dbManager };

// Create database client function for scripts
export function createDatabaseClient(options?: { env?: string }) {
  const env = options?.env ?? 'development';

  // 🚨 PRODUCTION DATABASE PROTECTION
  if (
    env === 'production' &&
    process.env.CI !== 'true' &&
    process.env.ALLOW_ACCESS_TO_PRODUCTION_DB !== 'true'
  ) {
    throw new Error(
      '🚨 PRODUCTION DATABASE ACCESS BLOCKED: Tests cannot run against production database. ' +
        'If this is intentional, set ALLOW_ACCESS_TO_PRODUCTION_DB=true environment variable.'
    );
  }

  // Try to get DATABASE_URL from environment variables
  let databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

  // If no DATABASE_URL is found and we're in a CI environment, try to construct it
  if (!databaseUrl && process.env.CI) {
    // In CI, we should have the DATABASE_URL from the workflow environment
    databaseUrl = process.env.DATABASE_URL ?? '';
  }

  // For non-CI environments, try environment-specific variables
  if (!databaseUrl && !process.env.CI) {
    const envSpecificUrl = process.env[`DATABASE_URL_${env.toUpperCase()}`];
    if (envSpecificUrl) {
      databaseUrl = envSpecificUrl;
    }
  }

  if (!databaseUrl) {
    throw new Error(`DATABASE_URL environment variable is required for ${env} environment`);
  }

  // 🚨 ADDITIONAL PRODUCTION URL VALIDATION
  if (
    (env === 'production' && databaseUrl.includes('localhost')) ||
    databaseUrl.includes('127.0.0.1')
  ) {
    throw new Error(
      '🚨 PRODUCTION DATABASE PROTECTION: Production environment cannot use localhost database URLs'
    );
  }

  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

// Test database connection function for scripts
export async function testConnection(
  config: { connectionString: string },
  _logger: { info: (msg: string) => void; error: (msg: string) => void }
): Promise<boolean> {
  try {
    const db = config.connectionString ? drizzle(neon(config.connectionString), { schema }) : null;
    await db?.execute('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
