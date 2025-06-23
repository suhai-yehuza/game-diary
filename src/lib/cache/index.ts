// Removed client export as client.ts was deleted
// export * from './client';

// Additional cache utilities for scripts
export async function testRedisConnection(): Promise<boolean> {
  try {
    // Simple connection test - placeholder implementation
    console.warn('Redis connection test not implemented');
    return true;
  } catch {
    return false;
  }
}

export function getCache() {
  // Simple cache getter - placeholder implementation
  console.warn('Cache getter not implemented');
  return null;
}
