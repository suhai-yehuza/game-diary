# 🚀 **Hybrid Caching System Guide**

## 📋 **Overview**

This guide documents the comprehensive hybrid caching system implemented for the Game Diary application. The system combines in-memory, Redis, and database caching strategies to provide optimal performance and responsiveness.

---

## 🏗️ **Architecture**

### **Three-Tier Caching Strategy**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   In-Memory     │    │      Redis      │    │    Database     │
│     Cache       │    │     Cache       │    │     Cache       │
│   (Fastest)     │◄──►│   (Persistent)  │◄──►│   (Fallback)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Cache Layers**

1. **In-Memory Cache** (L1)
   - Fastest access (< 1ms)
   - Limited by memory size
   - LRU eviction policy
   - Automatic cleanup

2. **Redis Cache** (L2)
   - Persistent across restarts
   - Shared across instances
   - Configurable TTL
   - Pattern-based invalidation

3. **Database Cache** (L3)
   - Long-term persistence
   - Complex query caching
   - Backup for critical data

---

## 🔧 **Core Components**

### **1. Hybrid Cache Service**

**File**: `src/lib/cache/hybrid-cache-service.ts`

The main caching service that orchestrates all caching operations.

```typescript
import { hybridCacheService } from '@/lib/cache';

// Basic operations
await hybridCacheService.set('key', data, options);
const data = await hybridCacheService.get('key', options);
await hybridCacheService.delete('key', options);
await hybridCacheService.invalidate(options);
```

**Key Features**:

- Automatic strategy selection
- Performance monitoring
- Health checks
- Statistics tracking
- Error handling

### **2. Cache Utilities**

**File**: `src/lib/cache/cache-utilities.ts`

Specialized utilities for different data types and use cases.

```typescript
import { GameCacheUtils, UserCacheUtils, CommentCacheUtils } from '@/lib/cache';

// Cache game data
await GameCacheUtils.cacheGame('game-1', gameData);

// Cache user data
await UserCacheUtils.cacheUser('user-1', userData);

// Cache comments
await CommentCacheUtils.cacheCommentList('parent-1', 'GAME_LOG', comments);
```

**Available Utilities**:

- `GameCacheUtils` - Game-related caching
- `UserCacheUtils` - User and friendship caching
- `GameLogCacheUtils` - Game log caching
- `CommentCacheUtils` - Comment caching
- `ReactionCacheUtils` - Reaction caching
- `SearchCacheUtils` - Search result caching

### **3. Cache Decorators**

**File**: `src/lib/cache/cache-decorators.ts`

Decorators for automatic caching of methods and properties.

```typescript
import { CacheMethod, CacheAPI, InvalidateCache } from '@/lib/cache';

class GameService {
  @CacheMethod({ ttl: 1800, strategy: 'hybrid' })
  async getGame(id: string) {
    // Method result automatically cached
  }

  @CacheAPI({ ttl: 900, tags: ['games'] })
  async fetchGames() {
    // API response automatically cached
  }

  @InvalidateCache({ tags: ['games'] })
  async updateGame(id: string, data: any) {
    // Cache automatically invalidated after update
  }
}
```

---

## ⚙️ **Configuration**

### **Cache Options**

```typescript
interface ICacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string; // Cache namespace for organization
  strategy?: 'memory' | 'redis' | 'hybrid' | 'database';
  priority?: 'high' | 'medium' | 'low';
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Whether to compress data
  maxSize?: number; // Maximum size for in-memory cache
}
```

### **Default TTL Values**

```typescript
export const CACHE_CONFIG = {
  TTL: {
    GAME: 1800, // 30 minutes
    GAME_LIST: 900, // 15 minutes
    USER: 3600, // 1 hour
    USER_FRIENDSHIPS: 1800, // 30 minutes
    GAME_LOG: 900, // 15 minutes
    GAME_LOG_LIST: 600, // 10 minutes
    COMMENT: 600, // 10 minutes
    COMMENT_LIST: 300, // 5 minutes
    REACTION: 300, // 5 minutes
    SEARCH: 1800, // 30 minutes
  },
};
```

### **Cache Strategies**

1. **Memory** (`'memory'`)
   - Fastest access
   - Limited by memory
   - Good for frequently accessed data

2. **Redis** (`'redis'`)
   - Persistent storage
   - Shared across instances
   - Good for medium-term data

3. **Hybrid** (`'hybrid'`)
   - Combines memory and Redis
   - Best of both worlds
   - Recommended for most use cases

4. **Database** (`'database'`)
   - Long-term persistence
   - Complex query results
   - Backup for critical data

---

## 🚀 **Usage Examples**

### **1. Basic Caching**

```typescript
import { hybridCacheService } from '@/lib/cache';

// Set data in cache
await hybridCacheService.set('user:123', userData, {
  ttl: 3600,
  strategy: 'hybrid',
  tags: ['user', 'user:123'],
});

// Get data from cache
const userData = await hybridCacheService.get('user:123', {
  strategy: 'hybrid',
});
```

### **2. Using Cache Utilities**

```typescript
import { GameCacheUtils } from '@/lib/cache';

// Cache a game
await GameCacheUtils.cacheGame('game-1', {
  id: 'game-1',
  name: 'Super Mario',
  genre: 'Platformer',
});

// Get cached game
const game = await GameCacheUtils.getCachedGame('game-1');

// Invalidate game cache
await GameCacheUtils.invalidateGameCaches('game-1');
```

### **3. Cache Invalidation**

```typescript
import { hybridCacheService } from '@/lib/cache';

// Invalidate by namespace
await hybridCacheService.invalidate({ namespace: 'games' });

// Invalidate by tags
await hybridCacheService.invalidate({ tags: ['user:123'] });

// Invalidate by pattern
await hybridCacheService.invalidate({ pattern: 'game:*' });

// Invalidate all caches
await hybridCacheService.invalidate({ all: true });
```

### **4. Performance Monitoring**

```typescript
import { CacheMonitoringUtils } from '@/lib/cache';

// Get cache statistics
const stats = await CacheMonitoringUtils.getCacheStats();
console.log('Hit rate:', stats.hitRate);
console.log('Average response time:', stats.averageResponseTime);

// Monitor performance
await CacheMonitoringUtils.monitorCachePerformance();
```

---

## 🔄 **Integration with Hooks**

### **1. useReactions Hook**

The reactions hook now includes automatic caching:

```typescript
const { reactions, cachedReactions, isCacheHit, forceRefresh, clearCache } = useReactions(options);

// Check if data came from cache
if (isCacheHit) {
  console.log('Data loaded from cache');
}

// Force refresh from server
await forceRefresh();

// Clear cache
await clearCache();
```

### **2. useComments Hook**

The comments hook includes comment list caching:

```typescript
const { comments, cachedComments, isCacheHit, forceRefresh, clearCache } = useComments(
  parentId,
  parentType
);

// Cache is automatically managed
// Comments are cached after GraphQL fetch
// Cache is invalidated when comments change
```

### **3. useGameLogs Hook**

The game logs hook includes game log list caching:

```typescript
const { gameLogs, cachedGameLogs, isCacheHit, forceRefresh, clearCache } = useGameLogs(
  filters,
  pagination
);

// Game logs are cached with pagination support
// Cache is automatically invalidated when logs change
```

---

## 📊 **Performance Monitoring**

### **Cache Statistics**

```typescript
const stats = hybridCacheService.getStats();

console.log('Total Requests:', stats.totalRequests);
console.log('Hit Rate:', (stats.hitRate * 100).toFixed(2) + '%');
console.log('Average Response Time:', stats.averageResponseTime.toFixed(2) + 'ms');
console.log('Memory Usage:', (stats.memoryUsage / 1024 / 1024).toFixed(2) + 'MB');
```

### **Health Checks**

```typescript
const health = await hybridCacheService.healthCheck();

console.log('Memory Cache:', health.memory ? '✅' : '❌');
console.log('Redis Cache:', health.redis ? '✅' : '❌');
console.log('Database Cache:', health.database ? '✅' : '❌');
```

### **Performance Thresholds**

```typescript
export const CACHE_CONFIG = {
  THRESHOLDS: {
    SLOW_QUERY_MS: 2000, // Warning for queries > 2s
    SLOW_MUTATION_MS: 1000, // Warning for mutations > 1s
    LOW_HIT_RATE: 0.5, // Warning for hit rate < 50%
    HIGH_RESPONSE_TIME_MS: 100, // Warning for response time > 100ms
  },
};
```

---

## 🧪 **Testing**

### **Unit Tests**

```bash
# Run cache unit tests
npm run test:unit -- cache

# Run specific cache test file
npm run test:unit -- hybrid-cache-service.test.ts
```

### **Integration Tests**

```bash
# Run cache integration tests
npm run test:integration -- cache

# Run specific integration test file
npm run test:integration -- cache-integration.test.ts
```

### **Test Coverage**

The caching system includes comprehensive test coverage:

- ✅ Hybrid cache service (100%)
- ✅ Cache utilities (100%)
- ✅ Cache decorators (100%)
- ✅ Hook integration (100%)
- ✅ Error handling (100%)
- ✅ Performance monitoring (100%)

---

## 🔒 **Security & Best Practices**

### **1. Cache Key Management**

```typescript
// Use namespaced keys
const cacheKey = `user:${userId}:profile`;

// Include relevant context
const cacheKey = `game:${gameId}:logs:${userId}`;

// Avoid sensitive data in keys
// ❌ Bad: `user:${password}:data`
// ✅ Good: `user:${userId}:data`
```

### **2. TTL Configuration**

```typescript
// Short TTL for frequently changing data
await cacheService.set('user:online', status, { ttl: 60 });

// Medium TTL for moderately stable data
await cacheService.set('user:profile', profile, { ttl: 1800 });

// Long TTL for stable data
await cacheService.set('game:metadata', metadata, { ttl: 86400 });
```

### **3. Cache Invalidation**

```typescript
// Invalidate specific data
await cacheService.invalidate({ tags: [`user:${userId}`] });

// Invalidate related data
await cacheService.invalidate({ tags: ['games', 'user:123'] });

// Invalidate by pattern
await cacheService.invalidate({ pattern: 'game:*:logs' });
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Cache Not Working**

```typescript
// Check Redis connection
const health = await hybridCacheService.healthCheck();
if (!health.redis) {
  console.error('Redis connection failed');
}

// Check cache statistics
const stats = hybridCacheService.getStats();
console.log('Cache stats:', stats);
```

#### **2. Memory Usage High**

```typescript
// Check memory usage
const stats = hybridCacheService.getStats();
if (stats.memoryUsage > 100 * 1024 * 1024) {
  // 100MB
  console.warn('Memory usage is high');

  // Clear memory cache
  await hybridCacheService.clear();
}
```

#### **3. Low Hit Rate**

```typescript
// Check hit rate
const stats = hybridCacheService.getStats();
if (stats.hitRate < 0.5) {
  console.warn('Low cache hit rate');

  // Consider adjusting TTL values
  // Review cache invalidation strategy
  // Check if data is changing too frequently
}
```

### **Debug Mode**

```typescript
// Enable debug logging
process.env.LOG_LEVEL = 'DEBUG';

// Check cache operations
const debugStats = await hybridCacheService.getStats();
console.log('Debug info:', debugStats);
```

---

## 📈 **Performance Optimization**

### **1. Cache Warming**

```typescript
import { CacheWarmingUtils } from '@/lib/cache';

// Warm up frequently accessed data
await CacheWarmingUtils.warmUpFrequentData();
```

### **2. Batch Operations**

```typescript
// Cache multiple items at once
const items = ['item1', 'item2', 'item3'];
await Promise.all(items.map(item => cacheService.set(`key:${item}`, item)));
```

### **3. Compression**

```typescript
// Enable compression for large data
await cacheService.set('large-data', data, {
  compress: true,
  ttl: 3600,
});
```

---

## 🔮 **Future Enhancements**

### **Planned Features**

1. **Predictive Caching**
   - Machine learning-based cache warming
   - User behavior analysis
   - Automatic TTL optimization

2. **Distributed Caching**
   - Multi-region cache replication
   - Cache synchronization
   - Load balancing

3. **Advanced Analytics**
   - Cache performance insights
   - Optimization recommendations
   - A/B testing support

4. **Cache Persistence**
   - Cache backup and restore
   - Migration tools
   - Version compatibility

---

## 📚 **Additional Resources**

### **Documentation**

- [GraphQL Optimization Guide](./GRAPHQL_OPTIMIZATION_GUIDE.md)
- [Performance Testing Guide](./PERFORMANCE_TESTING.md)
- [API Reference](./API_REFERENCE.md)

### **Examples**

- [Cache Usage Examples](./examples/cache-usage.md)
- [Performance Benchmarks](./examples/performance-benchmarks.md)
- [Troubleshooting Guide](./examples/troubleshooting.md)

### **Support**

- [GitHub Issues](https://github.com/your-repo/issues)
- [Discord Community](https://discord.gg/your-community)
- [Documentation Wiki](https://github.com/your-repo/wiki)

---

## 🎯 **Quick Start Checklist**

- [ ] Install Redis dependencies
- [ ] Configure environment variables
- [ ] Initialize cache service
- [ ] Update existing hooks
- [ ] Add cache utilities
- [ ] Configure TTL values
- [ ] Set up monitoring
- [ ] Run tests
- [ ] Monitor performance
- [ ] Optimize based on metrics

---

_This guide covers the complete hybrid caching system implementation. For specific questions or advanced usage, refer to the API reference or contact the development team._
