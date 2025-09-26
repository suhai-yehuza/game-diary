# Redis Cache Migration Guide

This document explains the migration from local memory cache to Redis-based distributed cache in the Game Diary application.

## Overview

The application has been migrated from a simple in-memory cache (`SimpleCacheService`) to a hybrid cache system that uses Redis as the primary cache with memory cache as a fallback (`HybridCacheService`).

## Architecture

### Cache Services

1. **SimpleCacheService** (Legacy)
   - In-memory cache using JavaScript Map
   - Limited to single instance
   - No persistence across restarts

2. **RedisCacheService** (New)
   - Redis-based distributed cache
   - Persistent across restarts
   - Shared across multiple instances
   - Memory cache fallback for reliability

3. **HybridCacheService** (New - Primary)
   - Intelligent cache strategy
   - Redis primary, memory fallback
   - Automatic failover
   - Environment-aware configuration

## Migration Components

### New Files Created

- `src/lib/cache/redis-cache-service.ts` - Redis cache implementation
- `src/lib/cache/hybrid-cache-service.ts` - Hybrid cache with fallback
- `src/lib/cache/cache-migration.ts` - Migration utilities
- `scripts/migrate-to-redis-cache.ts` - Migration script
- `scripts/test-redis-migration.ts` - Comprehensive test suite
- `src/app/api/cache/migrate/route.ts` - Migration API endpoint

### Updated Files

- `src/lib/cache/index.ts` - Added new exports
- `src/lib/cache/cache-utilities.ts` - Updated to use hybrid service
- `src/lib/cache/cache-decorators.ts` - Updated to use hybrid service
- `package.json` - Added migration scripts

## Configuration

### Environment Variables

The Redis cache uses the following environment variables:

```env
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
KV_URL="rediss://default:your-token@your-redis-instance.upstash.io:6379"
REDIS_URL="rediss://default:your-token@your-redis-instance.upstash.io:6379"

# Optional: Force Redis usage in test environments
FORCE_REDIS_CACHE="true"
```

### Cache Strategy

The hybrid cache service automatically determines the best strategy:

- **Development**: Redis + Memory (if Redis available)
- **Production**: Redis + Memory (if Redis available)
- **Test**: Memory only (unless `FORCE_REDIS_CACHE=true`)

## Usage

### Basic Cache Operations

```typescript
import { hybridCacheService } from '@/lib/cache/hybrid-cache-service';

// Set data
await hybridCacheService.set('key', data, {
  namespace: 'games',
  ttl: 3600, // 1 hour
  tags: ['game', 'nba'],
});

// Get data
const data = await hybridCacheService.get('key', {
  namespace: 'games',
});

// Delete data
await hybridCacheService.delete('key', {
  namespace: 'games',
});

// Clear all cache
await hybridCacheService.clear();
```

### Cache Utilities

The existing cache utilities have been updated to use the hybrid service:

```typescript
import { GameCacheUtils } from '@/lib/cache/cache-utilities';

// Cache game data
await GameCacheUtils.cacheGame('game-123', gameData);

// Get cached game
const game = await GameCacheUtils.getCachedGame('game-123');
```

### Cache Decorators

Cache decorators now use the hybrid service automatically:

```typescript
import { CacheMethod } from '@/lib/cache/cache-decorators';

class GameService {
  @CacheMethod({ ttl: 3600, namespace: 'games' })
  async getGame(gameId: string) {
    // This will be cached using Redis + Memory
    return await fetchGameFromAPI(gameId);
  }
}
```

## Migration Process

### 1. Run Migration Script

```bash
# Basic migration
pnpm cache:migrate-to-redis

# Migration with verification
pnpm cache:migrate-to-redis:verify

# Complete migration with cleanup
pnpm cache:migrate-to-redis:cleanup
```

### 2. Test Migration

```bash
# Run comprehensive tests
pnpm test:redis:migration
```

### 3. Monitor Cache Health

```bash
# Check cache health via API
curl http://localhost:3000/api/cache/migrate

# Or use the health endpoint
curl http://localhost:3000/api/health
```

## API Endpoints

### Cache Migration API

- `GET /api/cache/migrate` - Get migration status
- `POST /api/cache/migrate` - Start migration
  ```json
  {
    "action": "migrate" | "verify" | "cleanup"
  }
  ```

### Cache Health API

- `GET /api/health` - Overall system health including cache status

## Monitoring

### Cache Statistics

```typescript
const stats = await hybridCacheService.getStats();
console.log({
  size: stats.size,
  maxSize: stats.maxSize,
  redisAvailable: stats.redisAvailable,
  memorySize: stats.memorySize,
  strategy: stats.strategy,
});
```

### Health Status

```typescript
const health = await hybridCacheService.getHealthStatus();
console.log({
  healthy: health.healthy,
  redis: health.redis,
  memory: health.memory,
  strategy: health.strategy,
});
```

## Performance Considerations

### Redis Benefits

- **Distributed**: Shared across multiple app instances
- **Persistent**: Survives app restarts
- **Scalable**: Can handle large datasets
- **Fast**: Sub-millisecond response times

### Memory Fallback Benefits

- **Reliability**: Works even if Redis is unavailable
- **Speed**: Faster than Redis for small datasets
- **Simplicity**: No external dependencies

### Hybrid Strategy Benefits

- **Best of Both**: Redis performance + Memory reliability
- **Automatic Failover**: Seamless fallback to memory
- **Environment Aware**: Different strategies for different environments

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check environment variables
   - Verify Redis instance is running
   - Check network connectivity

2. **Migration Failed**
   - Check Redis connection
   - Verify sufficient memory
   - Review error logs

3. **Cache Misses**
   - Check TTL settings
   - Verify namespace usage
   - Monitor cache statistics

### Debug Commands

```bash
# Test Redis connection
pnpm test:redis

# Check cache health
curl http://localhost:3000/api/health

# View cache statistics
curl http://localhost:3000/api/cache/migrate
```

### Logs

Cache operations are logged with the `cache` logger:

```typescript
// Cache hits/misses
logger.cache('hit', 'redis:games:game-123');
logger.cache('miss', 'memory:games:game-123');

// Redis operations
logger.cache('redis:connected', 'Redis connection established');
logger.cache('redis:error', 'Redis connection failed: timeout');
```

## Rollback Plan

If issues arise, you can rollback to the simple cache:

1. Update imports to use `simpleCacheService` instead of `hybridCacheService`
2. Remove async/await from cache operations
3. Update cache utilities and decorators

## Future Enhancements

### Planned Features

1. **Cache Warming**: Pre-populate cache with frequently accessed data
2. **Cache Invalidation**: Smart invalidation based on data changes
3. **Cache Analytics**: Detailed performance metrics
4. **Cache Compression**: Reduce memory usage for large datasets

### Configuration Options

```typescript
// Future configuration options
const cacheConfig = {
  redis: {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 5000,
  },
  memory: {
    maxSize: 10000,
    cleanupInterval: 60000,
  },
  hybrid: {
    preferRedis: true,
    fallbackToMemory: true,
  },
};
```

## Support

For issues or questions about the Redis cache migration:

1. Check the logs for error messages
2. Run the test suite: `pnpm test:redis:migration`
3. Verify environment configuration
4. Check Redis instance status
5. Review this documentation

## Changelog

### v1.0.0 - Initial Redis Migration

- Added Redis cache service
- Added hybrid cache service
- Updated cache utilities and decorators
- Added migration scripts and tests
- Added monitoring and health checks
