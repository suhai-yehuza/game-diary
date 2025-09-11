import type { ICacheOptions } from '@/types';

import { simpleCacheService } from './simple-cache-service';

/**
 * Cache decorator for class methods
 * Automatically caches method results based on parameters
 */
export function CacheMethod(options: ICacheOptions = {}) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      // Generate cache key from method name and arguments
      const cacheKey = generateMethodCacheKey(propertyKey, args);

      // Try to get from cache first
      const cachedResult = simpleCacheService.get(cacheKey, options);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Cache the result
      simpleCacheService.set(cacheKey, result, options);

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache decorator for class properties
 * Automatically caches property values
 */
export function CacheProperty(options: ICacheOptions = {}) {
  return function (target: object, propertyKey: string) {
    const cacheKey = `property:${target.constructor.name}:${propertyKey}`;

    // Getter
    const getter = function () {
      return simpleCacheService.get(cacheKey, options);
    };

    // Setter
    const setter = function (value: unknown) {
      simpleCacheService.set(cacheKey, value, options);
    };

    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}

/**
 * Cache decorator for API endpoints
 * Automatically caches API responses
 */
export function CacheAPI(options: ICacheOptions = {}) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = generateAPICacheKey(propertyKey, args);

      // Check cache first
      const cachedResult = simpleCacheService.get(cacheKey, options);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Execute API call
      const result = await originalMethod.apply(this, args);

      // Cache successful responses only
      if (result && !result.error) {
        simpleCacheService.set(cacheKey, result, options);
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache decorator for GraphQL queries
 * Automatically caches GraphQL query results
 */
export function CacheGraphQL(options: ICacheOptions = {}) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = generateGraphQLCacheKey(propertyKey, args);

      // Check cache first
      const cachedResult = simpleCacheService.get(cacheKey, options);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Execute GraphQL query
      const result = await originalMethod.apply(this, args);

      // Cache successful responses
      if (result && !result.errors) {
        simpleCacheService.set(cacheKey, result, options);
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache decorator for database queries
 * Automatically caches database query results
 */
export function CacheDatabase(options: ICacheOptions = {}) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = generateDatabaseCacheKey(propertyKey, args);

      // Check cache first
      const cachedResult = simpleCacheService.get(cacheKey, options);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Execute database query
      const result = await originalMethod.apply(this, args);

      // Cache results
      if (result !== null && result !== undefined) {
        simpleCacheService.set(cacheKey, result, options);
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache invalidation decorator
 * Automatically invalidates cache when methods are called
 */
export function InvalidateCache(
  invalidationOptions: {
    namespace?: string;
    tags?: string[];
    pattern?: string;
    all?: boolean;
  } = {}
) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      // Execute original method first
      const result = await originalMethod.apply(this, args);

      // Invalidate cache after successful execution
      simpleCacheService.invalidate(invalidationOptions);

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache warming decorator
 * Pre-populates cache with frequently accessed data
 */
export function WarmCache(options: ICacheOptions = {}) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Warm up cache with related data
      if (result && options.tags) {
        warmUpRelatedCache(result, options);
      }

      return result;
    };

    return descriptor;
  };
}

// Utility functions

function generateMethodCacheKey(methodName: string, args: unknown[]): string {
  const argsHash = JSON.stringify(args);
  return `method:${methodName}:${hashString(argsHash)}`;
}

function generateAPICacheKey(endpointName: string, args: unknown[]): string {
  const argsHash = JSON.stringify(args);
  return `api:${endpointName}:${hashString(argsHash)}`;
}

function generateGraphQLCacheKey(queryName: string, args: unknown[]): string {
  const argsHash = JSON.stringify(args);
  return `graphql:${queryName}:${hashString(argsHash)}`;
}

function generateDatabaseCacheKey(queryName: string, args: unknown[]): string {
  const argsHash = JSON.stringify(args);
  return `db:${queryName}:${hashString(argsHash)}`;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

function warmUpRelatedCache(data: unknown, options: ICacheOptions): void {
  if (!options.tags || options.tags.length === 0) return;

  // This is a placeholder for cache warming logic
  // In a real implementation, you would:
  // 1. Analyze the data structure
  // 2. Identify related data that should be cached
  // 3. Pre-fetch and cache that data

  // logger.debug('Cache warming initiated', { tags: options.tags });
}

// Export logger for use in this file
const _logger = {
  debug: (message: string, data?: unknown) => console.debug(`[Cache] ${message}`, data),
  info: (message: string, data?: unknown) => console.info(`[Cache] ${message}`, data),
  warn: (message: string, data?: unknown) => console.warn(`[Cache] ${message}`, data),
  error: (message: string, data?: unknown) => console.error(`[Cache] ${message}`, data),
};
