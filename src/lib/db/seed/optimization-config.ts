// Centralized optimization configuration for database seeding
export const OPTIMIZATION_CONFIG = {
  // Concurrency settings
  concurrency: {
    // Maximum concurrent API requests
    external_api: 5,
    // Maximum concurrent database operations
    database: 10,
    // Maximum concurrent file operations
    file_io: 3,
  },

  // Batch size settings for different operations
  batch_sizes: {
    // Small batches for heavy operations (API calls, complex data)
    small: 25,
    // Medium batches for moderate operations
    medium: 100,
    // Large batches for lightweight operations
    large: 500,
    // Very large batches for simple inserts
    very_large: 1000,

    // Specific batch sizes
    users: 200,
    friendships: 300,
    game_logs: 100,
    comments: 400,
    reactions: 500,
    nba_games: 50, // Smaller due to JSONB fields
    teams: 100,
    players: 200,
    game_stats: 25, // Complex stats data
    player_stats: 50,
  },

  // Memory management settings
  memory: {
    // Force garbage collection every N operations
    gc_interval: 10000,
    // Maximum items to hold in memory before streaming
    max_memory_items: 5000,
    // Chunk size for processing large datasets
    chunk_size: 1000,
  },

  // Retry configuration
  retry: {
    // Maximum retry attempts
    max_attempts: 5,
    // Base delay between retries (ms)
    base_delay: 1000,
    // Maximum delay between retries (ms)
    max_delay: 30000,
    // Exponential backoff multiplier
    backoff_multiplier: 2,
    // Jitter range (0-1)
    jitter_factor: 0.1,
  },

  // Circuit breaker settings
  circuit_breaker: {
    // Failure threshold before opening circuit
    failure_threshold: 5,
    // Timeout before attempting to close circuit (ms)
    timeout: 60000,
    // Success threshold to close circuit
    success_threshold: 3,
  },

  // Rate limiting
  rate_limiting: {
    // Requests per second for external APIs
    api_requests_per_second: 10,
    // Database operations per second
    db_operations_per_second: 50,
    // Burst allowance
    burst_limit: 20,
  },

  // Database optimization
  database: {
    // Use prepared statements
    use_prepared_statements: true,
    // Connection pool size
    connection_pool_size: 20,
    // Query timeout (ms)
    query_timeout: 30000,
    // Use concurrent index creation
    concurrent_index_creation: true,
    // Disable foreign key checks during bulk operations
    disable_fk_checks_during_bulk: true,
  },

  // Monitoring and logging
  monitoring: {
    // Enable performance monitoring
    enabled: true,
    // Log every N operations
    log_interval: 1000,
    // Include memory usage in logs
    include_memory_stats: true,
    // Enable timing statistics
    enable_timing: true,
    // Sample rate for detailed logging (0-1)
    sample_rate: 0.1,
  },

  // Optimization strategies by data type
  strategies: {
    users: {
      strategy: 'stream_insert',
      batch_size: 200,
      use_upsert: true,
      validate_emails: true,
    },
    friendships: {
      strategy: 'bulk_insert',
      batch_size: 300,
      use_upsert: false,
      deduplicate: true,
    },
    game_logs: {
      strategy: 'stream_insert',
      batch_size: 100,
      use_upsert: true,
      validate_dates: true,
    },
    nba_data: {
      strategy: 'api_with_cache',
      batch_size: 50,
      use_upsert: true,
      cache_duration: 3600, // 1 hour
    },
    stats: {
      strategy: 'parallel_processing',
      batch_size: 25,
      use_upsert: true,
      max_parallel: 5,
    },
  },

  // Feature flags
  features: {
    // Enable streaming inserts
    enable_streaming: true,
    // Enable parallel processing
    enable_parallel: true,
    // Enable caching
    enable_caching: true,
    // Enable compression for large data
    enable_compression: false,
    // Enable data validation
    enable_validation: true,
    // Enable automatic index optimization
    enable_auto_index: true,
  },

  // Error handling
  error_handling: {
    // Continue on non-critical errors
    continue_on_error: true,
    // Maximum errors before aborting
    max_errors: 100,
    // Log all errors
    log_all_errors: true,
    // Create error report
    create_error_report: true,
  },
} as const;

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  // Response time thresholds (ms)
  response_time: {
    good: 1000,
    acceptable: 5000,
    poor: 10000,
  },

  // Throughput thresholds (operations per second)
  throughput: {
    users: 100,
    game_logs: 50,
    api_calls: 10,
    db_inserts: 500,
  },

  // Memory usage thresholds (MB)
  memory: {
    warning: 500,
    critical: 1000,
    max: 1500,
  },

  // Error rate thresholds (percentage)
  error_rate: {
    warning: 5,
    critical: 15,
    max: 25,
  },
} as const;

// Constants for magic numbers
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;

// Environment-specific configurations
export const ENVIRONMENT_CONFIGS = {
  development: {
    ...OPTIMIZATION_CONFIG,
    concurrency: {
      ...OPTIMIZATION_CONFIG.concurrency,
      external_api: 2,
      database: 5,
    },
    monitoring: {
      ...OPTIMIZATION_CONFIG.monitoring,
      enabled: true,
      log_interval: 100,
    },
    connectionPool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND, // 60 seconds
      acquireTimeoutMillis: SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND, // 60 seconds
      reapIntervalMillis: SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND, // 60 seconds
    },
  },

  production: {
    ...OPTIMIZATION_CONFIG,
    concurrency: {
      ...OPTIMIZATION_CONFIG.concurrency,
      external_api: 10,
      database: 20,
    },
    monitoring: {
      ...OPTIMIZATION_CONFIG.monitoring,
      sample_rate: 0.01, // Less verbose in production
    },
    error_handling: {
      ...OPTIMIZATION_CONFIG.error_handling,
      continue_on_error: false, // Stricter in production
    },
  },

  test: {
    ...OPTIMIZATION_CONFIG,
    batch_sizes: {
      ...OPTIMIZATION_CONFIG.batch_sizes,
      // Smaller batches for faster tests
      small: 5,
      medium: 10,
      large: 25,
    },
    retry: {
      ...OPTIMIZATION_CONFIG.retry,
      max_attempts: 2, // Faster failures in tests
    },
  },
} as const;

// Utility function to get configuration for current environment
export function getOptimizationConfig(env = 'development') {
  switch (env) {
    case 'production':
      return ENVIRONMENT_CONFIGS.production;
    case 'test':
      return ENVIRONMENT_CONFIGS.test;
    default:
      return ENVIRONMENT_CONFIGS.development;
  }
}

// Performance monitoring utilities
export class PerformanceTracker {
  private readonly metrics = new Map<string, number[]>();
  private readonly timers = new Map<string, number>();

  startTimer(operation: string): void {
    this.timers.set(operation, Date.now());
  }

  endTimer(operation: string): number {
    const start = this.timers.get(operation);
    if (!start) {
      throw new Error(`Timer for ${operation} not found`);
    }

    const duration = Date.now() - start;
    this.timers.delete(operation);

    // Store metric
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    const operationMetrics = this.metrics.get(operation);
    if (operationMetrics) {
      operationMetrics.push(duration);
    }

    return duration;
  }

  getAverageTime(operation: string): number {
    const times = this.metrics.get(operation);
    if (!times || times.length === 0) return 0;

    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    for (const [operation, times] of Array.from(this.metrics.entries())) {
      result[operation] = {
        avg: this.getAverageTime(operation),
        min: Math.min(...times),
        max: Math.max(...times),
        count: times.length,
      };
    }

    return result;
  }

  checkThresholds(operation: string): 'good' | 'acceptable' | 'poor' {
    const avgTime = this.getAverageTime(operation);
    const thresholds = PERFORMANCE_THRESHOLDS.response_time;

    if (avgTime <= thresholds.good) return 'good';
    if (avgTime <= thresholds.acceptable) return 'acceptable';
    return 'poor';
  }
}

// Export types

// Add missing getCacheManager function
import type { ICacheManager } from '@src/lib/types/infrastructureTypes';

// Cache TTL constant
const CACHE_TTL_MS = 3600000; // 1 hour in milliseconds

// Note: Methods must be async to satisfy ICacheManager interface, even if not using await
class InMemoryCache implements ICacheManager {
  private readonly cache = new Map<string, { value: unknown; expires: number }>();

  async get<T>(key: string): Promise<T | null> {
    await Promise.resolve(); // Satisfy async requirement
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl: number = CACHE_TTL_MS): Promise<void> {
    await Promise.resolve(); // Satisfy async requirement
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl,
    });
  }

  async delete(key: string): Promise<void> {
    await Promise.resolve(); // Satisfy async requirement
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    await Promise.resolve(); // Satisfy async requirement
    this.cache.clear();
  }
}

let cacheManager: ICacheManager | null = null;

export function getCacheManager(): ICacheManager {
  cacheManager ??= new InMemoryCache();
  return cacheManager;
}

// Add missing API_CONFIG export
export const API_CONFIG = {
  rapidApi: {
    key: process.env.RAPID_API_KEY ?? '',
    host: process.env.RAPID_API_HOST ?? 'api-nba-v1.p.rapidapi.com',
    baseUrl: 'https://api-nba-v1.p.rapidapi.com',
  },
  nbaApi: {
    key: process.env.NBA_API_KEY ?? '',
    host: process.env.NBA_API_HOST ?? 'nba-stats-db.herokuapp.com',
    baseUrl: 'https://nba-stats-db.herokuapp.com',
  },
  timeout: 30000,
  retries: 3,
} as const;
