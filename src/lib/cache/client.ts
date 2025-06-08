/**
 * Client-side cache utility that replaces localStorage with Redis cache
 * via API calls to /api/cache endpoints
 */
class ClientCache {
  private isClient: boolean;

  constructor() {
    // Check for window in a way that's safe for SSR
    this.isClient = typeof window !== 'undefined' && typeof window.document !== 'undefined';
  }

  /**
   * Get a value from cache
   */
  async getItem<T = string>(key: string): Promise<T | null> {
    if (!this.isClient) {
      return null;
    }

    try {
      const response = await fetch(`/api/cache?key=${encodeURIComponent(key)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`[ClientCache] Failed to get key: ${key}`, response.status);
        return null;
      }

      const { value } = await response.json();
      return value;
    } catch (error) {
      console.error(`[ClientCache] Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a value in cache
   */
  async setItem<T = string>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (!this.isClient) {
      return false;
    }

    try {
      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value, ttl }),
      });

      if (!response.ok) {
        console.warn(`[ClientCache] Failed to set key: ${key}`, response.status);
        return false;
      }

      const { success } = await response.json();
      return success;
    } catch (error) {
      console.error(`[ClientCache] Error setting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Remove a value from cache
   */
  async removeItem(key: string): Promise<boolean> {
    if (!this.isClient) {
      return false;
    }

    try {
      const response = await fetch(`/api/cache?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`[ClientCache] Failed to delete key: ${key}`, response.status);
        return false;
      }

      const { success } = await response.json();
      return success;
    } catch (error) {
      console.error(`[ClientCache] Error deleting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Sync method for getting cached values (fallback to empty for initial render)
   * This is useful for useState initialization
   */
  getItemSync<T = string>(key: string, fallback: T): T {
    // For SSR compatibility, always return fallback
    // The actual value will be loaded asynchronously in useEffect
    return fallback;
  }

  /**
   * Check if we're in a browser environment
   */
  isClientSide(): boolean {
    return this.isClient;
  }
}

// Export a singleton instance
export const clientCache = new ClientCache();

/**
 * Hook for using client cache with localStorage-like interface
 */
export function useClientCache() {
  return clientCache;
}

/**
 * Cache keys used throughout the application
 */
export const CLIENT_CACHE_KEYS = {
  NOTIFICATIONS: 'notifications',
  COMMENTS_LAST_SEEN: (parentId: string) => `comments-lastseen-${parentId}`,
  FRIEND_REQUEST_NOTIFICATION: (userId: string) => `friend-request-${userId}`,
} as const;
