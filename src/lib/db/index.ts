import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import type { Database } from '@/lib/types/db.types';
import type { IDatabaseConfig } from '@/lib/types/schema.types';
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
        this.sql = neon(this.config.connectionString);
        this.db = drizzle(this.sql, { schema });

        // Test the connection
        await this.db.execute('SELECT 1');
        console.log('Database connection established successfully');
        this.retryCount = 0; // Reset retry count on success
        return;
      } catch (error) {
        this.retryCount++;
        console.warn(`Database connection attempt ${this.retryCount} failed:`, error);

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

// Initialize database connection
if (connectionString) {
  dbManager.initialize().catch(console.error);
}

// Export database instance for backward compatibility
export const db = dbManager.getDatabase.bind(dbManager);

// Export database manager for advanced usage
export { dbManager };

// Create database client function for scripts
export function createDatabaseClient(options?: { env?: string }) {
  const env = options?.env ?? 'development';

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
