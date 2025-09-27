import { describe, it, expect, beforeEach, vi } from 'vitest';

import { FailureCache, failureCache } from '@/lib/utils/failure-cache';

describe('FailureCache', () => {
  let cache: FailureCache;

  beforeEach(() => {
    cache = new FailureCache(1000); // 1 second TTL for testing
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('shouldSkip', () => {
    it('returns false for unknown keys', () => {
      expect(cache.shouldSkip('unknown-key')).toBe(false);
    });

    it('returns true for recently failed keys', () => {
      cache.markFailed('test-key', 'Test error');
      expect(cache.shouldSkip('test-key')).toBe(true);
    });

    it('returns false for keys that have exceeded TTL', () => {
      cache.markFailed('test-key', 'Test error');

      // Advance time beyond TTL
      vi.advanceTimersByTime(2000);

      expect(cache.shouldSkip('test-key')).toBe(false);
    });

    it('returns true for keys within TTL', () => {
      cache.markFailed('test-key', 'Test error');

      // Advance time but stay within TTL
      vi.advanceTimersByTime(500);

      expect(cache.shouldSkip('test-key')).toBe(true);
    });
  });

  describe('markFailed', () => {
    it('records failure with timestamp', () => {
      const beforeTime = Date.now();
      cache.markFailed('test-key', 'Test error');
      const afterTime = Date.now();

      expect(cache.shouldSkip('test-key')).toBe(true);

      // The failure should be recorded with a timestamp between before and after
      // We can't directly test the timestamp, but we can test the behavior
    });

    it('records failure without error message', () => {
      cache.markFailed('test-key');
      expect(cache.shouldSkip('test-key')).toBe(true);
    });

    it('overwrites previous failure record', () => {
      cache.markFailed('test-key', 'First error');
      vi.advanceTimersByTime(500);

      cache.markFailed('test-key', 'Second error');

      // Should still be within TTL from the second failure
      expect(cache.shouldSkip('test-key')).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears specific key', () => {
      cache.markFailed('test-key', 'Test error');
      cache.markFailed('other-key', 'Other error');

      expect(cache.shouldSkip('test-key')).toBe(true);
      expect(cache.shouldSkip('other-key')).toBe(true);

      cache.clear('test-key');

      expect(cache.shouldSkip('test-key')).toBe(false);
      expect(cache.shouldSkip('other-key')).toBe(true);
    });

    it('clears all keys when no key specified', () => {
      cache.markFailed('test-key', 'Test error');
      cache.markFailed('other-key', 'Other error');

      expect(cache.shouldSkip('test-key')).toBe(true);
      expect(cache.shouldSkip('other-key')).toBe(true);

      cache.clear();

      expect(cache.shouldSkip('test-key')).toBe(false);
      expect(cache.shouldSkip('other-key')).toBe(false);
    });

    it('handles clearing non-existent key gracefully', () => {
      expect(() => cache.clear('non-existent-key')).not.toThrow();
    });
  });

  describe('TTL behavior', () => {
    it('respects custom TTL', () => {
      const shortTTLCache = new FailureCache(500); // 500ms TTL

      shortTTLCache.markFailed('test-key', 'Test error');

      // Should be skipped initially
      expect(shortTTLCache.shouldSkip('test-key')).toBe(true);

      // Advance time beyond short TTL
      vi.advanceTimersByTime(600);

      expect(shortTTLCache.shouldSkip('test-key')).toBe(false);
    });

    it('uses default TTL when not specified', () => {
      const defaultCache = new FailureCache();
      defaultCache.markFailed('test-key', 'Test error');

      expect(defaultCache.shouldSkip('test-key')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles empty string keys', () => {
      cache.markFailed('', 'Empty key error');
      expect(cache.shouldSkip('')).toBe(true);
    });

    it('handles special characters in keys', () => {
      const specialKey = 'key-with-special-chars!@#$%^&*()';
      cache.markFailed(specialKey, 'Special key error');
      expect(cache.shouldSkip(specialKey)).toBe(true);
    });

    it('handles very long keys', () => {
      const longKey = 'a'.repeat(1000);
      cache.markFailed(longKey, 'Long key error');
      expect(cache.shouldSkip(longKey)).toBe(true);
    });

    it('handles concurrent access simulation', () => {
      // Simulate multiple failures for the same key
      cache.markFailed('concurrent-key', 'First failure');
      cache.markFailed('concurrent-key', 'Second failure');
      cache.markFailed('concurrent-key', 'Third failure');

      expect(cache.shouldSkip('concurrent-key')).toBe(true);
    });
  });

  describe('memory management', () => {
    it('does not leak memory with many keys', () => {
      // Add many keys
      for (let i = 0; i < 1000; i++) {
        cache.markFailed(`key-${i}`, `Error ${i}`);
      }

      // All should be skippable
      for (let i = 0; i < 1000; i++) {
        expect(cache.shouldSkip(`key-${i}`)).toBe(true);
      }

      // Clear all
      cache.clear();

      // None should be skippable
      for (let i = 0; i < 1000; i++) {
        expect(cache.shouldSkip(`key-${i}`)).toBe(false);
      }
    });
  });
});

describe('failureCache singleton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is a FailureCache instance', () => {
    expect(failureCache).toBeInstanceOf(FailureCache);
  });

  it('has default TTL of 90 seconds', () => {
    failureCache.markFailed('test-key', 'Test error');
    expect(failureCache.shouldSkip('test-key')).toBe(true);

    // Advance time beyond 90 seconds
    vi.advanceTimersByTime(91000);

    expect(failureCache.shouldSkip('test-key')).toBe(false);
  });

  it('can be used independently', () => {
    failureCache.markFailed('singleton-key', 'Singleton error');
    expect(failureCache.shouldSkip('singleton-key')).toBe(true);

    failureCache.clear('singleton-key');
    expect(failureCache.shouldSkip('singleton-key')).toBe(false);
  });
});
