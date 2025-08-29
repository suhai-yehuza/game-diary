import { Redis } from '@upstash/redis';

import { errorHandlers } from '@/lib/utils/error-handler';

class UpstashRedisClient {
  private client: Redis | null = null;
  private isConnected = false;
  private connectionAttempts = 0;
  private readonly maxConnectionAttempts = 3;

  constructor() {
    // Initialize Redis from environment variables
    try {
      this.client = Redis.fromEnv();
      this.isConnected = true;
      console.log('✅ Upstash Redis client initialized from environment');
    } catch (error) {
      console.warn('⚠️ Failed to initialize Upstash Redis from environment:', error);
      this.isConnected = false;
    }
  }

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    if (this.client && this.isConnected) {
      return;
    }

    try {
      // Try to initialize from environment
      this.client = Redis.fromEnv();
      this.isConnected = true;
      this.connectionAttempts = 0;

      console.log('✅ Upstash Redis client connected successfully');
    } catch (error) {
      this.connectionAttempts++;
      this.isConnected = false;

      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'Upstash Redis Client',
        action: 'Connect',
      });

      if (this.connectionAttempts < this.maxConnectionAttempts) {
        console.warn(
          `⚠️ Upstash Redis connection attempt ${this.connectionAttempts} failed, retrying...`
        );
        await new Promise(resolve => setTimeout(resolve, 1000 * this.connectionAttempts));
        return this.connect();
      } else {
        console.error('❌ Upstash Redis connection failed after maximum attempts');
        throw error;
      }
    }
  }

  /**
   * Test Redis connection
   */
  private async testConnection(): Promise<void> {
    if (!this.client) {
      throw new Error('Upstash Redis client not initialized');
    }

    try {
      // Test with a simple ping operation
      await this.client.set('test:connection', 'ping', { ex: 10 });
      const result = await this.client.get('test:connection');

      if (result !== 'ping') {
        throw new Error('Connection test failed - unexpected response');
      }

      // Clean up test key
      await this.client.del('test:connection');
    } catch (error) {
      throw new Error(
        `Upstash Redis connection test failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get Redis client instance
   */
  getClient(): Redis | null {
    return this.client;
  }

  /**
   * Check if Redis is connected
   */
  isClientConnected(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Disconnect Redis client
   */
  disconnect(): Promise<void> {
    if (this.client) {
      // Upstash Redis client doesn't have a quit method, just set to null
      this.client = null;
      this.isConnected = false;
      console.log('🔌 Upstash Redis client disconnected');
    }
    // No async operation needed
    return Promise.resolve();
  }

  /**
   * Get Redis connection info
   */
  getConnectionInfo(): {
    connected: boolean;
    type: 'upstash';
  } {
    if (!this.client || !this.isConnected) {
      return { connected: false, type: 'upstash' };
    }

    return {
      connected: true,
      type: 'upstash',
    };
  }

  /**
   * Set a key with expiration
   */
  async setex(key: string, seconds: number, value: string): Promise<void> {
    if (!this.client) {
      throw new Error('Upstash Redis client not connected');
    }

    await this.client.set(key, value, { ex: seconds });
  }

  /**
   * Get a key
   */
  async get(key: string): Promise<string | null> {
    if (!this.client) {
      throw new Error('Upstash Redis client not connected');
    }

    return this.client.get(key);
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<void> {
    if (!this.client) {
      throw new Error('Upstash Redis client not connected');
    }

    await this.client.del(key);
  }

  /**
   * Delete multiple keys
   */
  async delMultiple(...keys: string[]): Promise<void> {
    if (!this.client) {
      throw new Error('Upstash Redis client not connected');
    }

    await this.client.del(...keys);
  }

  /**
   * Get keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    if (!this.client) {
      throw new Error('Upstash Redis client not connected');
    }

    return this.client.keys(pattern);
  }

  /**
   * Flush all keys in the current database
   */
  async flushdb(): Promise<void> {
    if (!this.client) {
      throw new Error('Upstash Redis client not connected');
    }

    await this.client.flushdb();
  }

  /**
   * Set a key with complex value (JSON serialization)
   */
  async setComplex(key: string, value: unknown, options?: { ex?: number }): Promise<void> {
    if (!this.client) {
      throw new Error('Upstash Redis client not connected');
    }

    const serializedValue = JSON.stringify(value);
    if (options?.ex) {
      await this.client.set(key, serializedValue, { ex: options.ex });
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  /**
   * Get a key with complex value (JSON deserialization)
   */
  async getComplex<T>(key: string): Promise<T | null> {
    if (!this.client) {
      throw new Error('Upstash Redis client not connected');
    }

    const result = await this.client.get(key);
    if (result === null) {
      return null;
    }

    try {
      return JSON.parse(result as string) as T;
    } catch (error) {
      console.warn(`Failed to parse Redis value for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('Upstash Redis client not connected');
    }

    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Get TTL for a key
   */
  async ttl(key: string): Promise<number> {
    if (!this.client) {
      throw new Error('Upstash Redis client not connected');
    }

    return this.client.ttl(key);
  }

  /**
   * Set expiration for a key
   */
  async expire(key: string, seconds: number): Promise<void> {
    if (!this.client) {
      throw new Error('Upstash Redis client not connected');
    }

    await this.client.expire(key, seconds);
  }
}

// Create Upstash Redis client instance
function createUpstashRedisClient(): UpstashRedisClient | null {
  try {
    console.log('🔧 Initializing Upstash Redis client from environment');
    return new UpstashRedisClient();
  } catch (error) {
    console.warn('⚠️ Failed to create Upstash Redis client:', error);
    return null;
  }
}

// Export singleton instance
export const upstashRedisClient = createUpstashRedisClient();

// Export utilities
export { UpstashRedisClient };
