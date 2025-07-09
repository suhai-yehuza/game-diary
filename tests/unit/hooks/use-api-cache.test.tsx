import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useApiCache } from '@src/hooks/use-api-cache';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useApiCache', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Clear the cache between tests
    const { result } = renderHook(() => useApiCache());
    act(() => {
      result.current.clearCache();
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default options', () => {
    const { result } = renderHook(() => useApiCache());

    expect(result.current).toHaveProperty('fetchWithCache');
    expect(result.current).toHaveProperty('getCachedData');
    expect(result.current).toHaveProperty('setCachedData');
    expect(result.current).toHaveProperty('clearCache');
    expect(result.current).toHaveProperty('getCacheStats');
  });

  it('should initialize with custom options', () => {
    const customOptions = {
      ttl: 600000, // 10 minutes
      enableDeduplication: false,
    };

    const { result } = renderHook(() => useApiCache(customOptions));

    expect(result.current).toHaveProperty('fetchWithCache');
    expect(result.current).toHaveProperty('getCachedData');
    expect(result.current).toHaveProperty('setCachedData');
    expect(result.current).toHaveProperty('clearCache');
    expect(result.current).toHaveProperty('getCacheStats');
  });

  it('should generate cache key correctly', async () => {
    const { result } = renderHook(() => useApiCache());

    const url = 'https://api.example.com/data';
    const params = { id: '123', type: 'user' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'test' }),
    });

    await act(async () => {
      await result.current.fetchWithCache(url, params);
    });

    // The cache key should be the full URL with params
    const expectedKey = 'https://api.example.com/data?id=123&type=user';
    const cachedData = result.current.getCachedData(expectedKey);
    expect(cachedData).toEqual({ data: 'test' });
  });

  it('should cache successful API responses', async () => {
    const { result } = renderHook(() => useApiCache());

    const url = 'https://api.example.com/data';
    const mockData = { id: 1, name: 'Test' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    let response;
    await act(async () => {
      response = await result.current.fetchWithCache(url);
    });

    expect(response).toEqual(mockData);

    // Check that data is cached
    const cachedData = result.current.getCachedData(url);
    expect(cachedData).toEqual(mockData);
  });

  it('should return cached data for subsequent requests', async () => {
    const { result } = renderHook(() => useApiCache());

    const url = 'https://api.example.com/data';
    const mockData = { id: 1, name: 'Test' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    // First request - should call API
    await act(async () => {
      await result.current.fetchWithCache(url);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second request - should use cache
    await act(async () => {
      await result.current.fetchWithCache(url);
    });

    // fetch should still only be called once
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors', async () => {
    const { result } = renderHook(() => useApiCache());

    const url = 'https://api.example.com/error';

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(
      act(async () => {
        await result.current.fetchWithCache(url);
      })
    ).rejects.toThrow('API request failed: 500 Internal Server Error');
  });

  it('should handle network errors', async () => {
    const { result } = renderHook(() => useApiCache());

    const url = 'https://api.example.com/network-error';

    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      act(async () => {
        await result.current.fetchWithCache(url);
      })
    ).rejects.toThrow('Network error');
  });

  it('should deduplicate concurrent requests when enabled', async () => {
    const { result } = renderHook(() => useApiCache({ enableDeduplication: true }));

    const url = 'https://api.example.com/data';
    const mockData = { id: 1, name: 'Test' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    // Make two concurrent requests
    const promises = [result.current.fetchWithCache(url), result.current.fetchWithCache(url)];

    await act(async () => {
      const [response1, response2] = await Promise.all(promises);
      expect(response1).toEqual(mockData);
      expect(response2).toEqual(mockData);
    });

    // fetch should only be called once due to deduplication
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should not deduplicate requests when disabled', async () => {
    const { result } = renderHook(() => useApiCache({ enableDeduplication: false }));

    const url = 'https://api.example.com/data';
    const mockData = { id: 1, name: 'Test' };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

    // Make two concurrent requests
    const promises = [result.current.fetchWithCache(url), result.current.fetchWithCache(url)];

    await act(async () => {
      const [response1, response2] = await Promise.all(promises);
      expect(response1).toEqual(mockData);
      expect(response2).toEqual(mockData);
    });

    // fetch should be called twice since deduplication is disabled
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should expire cached data after TTL', async () => {
    const shortTtl = 100; // 100ms
    const { result } = renderHook(() => useApiCache({ ttl: shortTtl }));

    const url = 'https://api.example.com/data';
    const mockData = { id: 1, name: 'Test' };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 2, name: 'Updated' }),
      });

    // First request
    await act(async () => {
      await result.current.fetchWithCache(url);
    });

    // Wait for cache to expire
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, shortTtl + 50));
    });

    // Second request should call API again
    await act(async () => {
      await result.current.fetchWithCache(url);
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should manually set and get cached data', () => {
    const { result } = renderHook(() => useApiCache());

    const key = 'test-key';
    const data = { id: 1, name: 'Manual Test' };

    act(() => {
      result.current.setCachedData(key, data);
    });

    const cachedData = result.current.getCachedData(key);
    expect(cachedData).toEqual(data);
  });

  it('should return null for non-existent cache entries', () => {
    const { result } = renderHook(() => useApiCache());

    const cachedData = result.current.getCachedData('non-existent-key');
    expect(cachedData).toBeNull();
  });

  it('should clear all cache when no pattern is provided', async () => {
    const { result } = renderHook(() => useApiCache());

    const url1 = 'https://api.example.com/data1';
    const url2 = 'https://api.example.com/data2';
    const mockData = { id: 1, name: 'Test' };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

    // Cache some data
    await act(async () => {
      await result.current.fetchWithCache(url1);
      await result.current.fetchWithCache(url2);
    });

    // Verify data is cached
    expect(result.current.getCachedData(url1)).toEqual(mockData);
    expect(result.current.getCachedData(url2)).toEqual(mockData);

    // Clear all cache
    act(() => {
      result.current.clearCache();
    });

    // Verify cache is cleared
    expect(result.current.getCachedData(url1)).toBeNull();
    expect(result.current.getCachedData(url2)).toBeNull();
  });

  it('should clear cache entries matching pattern', async () => {
    const { result } = renderHook(() => useApiCache());

    const url1 = 'https://api.example.com/users/1';
    const url2 = 'https://api.example.com/posts/1';
    const mockData = { id: 1, name: 'Test' };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

    // Cache some data
    await act(async () => {
      await result.current.fetchWithCache(url1);
      await result.current.fetchWithCache(url2);
    });

    // Clear only users cache
    act(() => {
      result.current.clearCache('users');
    });

    // Verify only users cache is cleared
    expect(result.current.getCachedData(url1)).toBeNull();
    expect(result.current.getCachedData(url2)).toEqual(mockData);
  });

  it('should return correct cache statistics', async () => {
    const { result } = renderHook(() => useApiCache());

    const url1 = 'https://api.example.com/data1';
    const url2 = 'https://api.example.com/data2';
    const mockData = { id: 1, name: 'Test' };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

    // Initial stats
    let stats = result.current.getCacheStats();
    expect(stats.size).toBe(0);
    expect(stats.pendingRequests).toBe(0);

    // Cache some data
    await act(async () => {
      await result.current.fetchWithCache(url1);
      await result.current.fetchWithCache(url2);
    });

    // Stats after caching
    stats = result.current.getCacheStats();
    expect(stats.size).toBe(2);
    expect(stats.pendingRequests).toBe(0);
  });

  it('should handle fetch options correctly', async () => {
    const { result } = renderHook(() => useApiCache());

    const url = 'https://api.example.com/data';
    const fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' }),
    };
    const mockData = { id: 1, name: 'Test' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    await act(async () => {
      await result.current.fetchWithCache(url, undefined, fetchOptions);
    });

    expect(mockFetch).toHaveBeenCalledWith(url, fetchOptions);
  });

  it('should handle URL with existing query parameters', async () => {
    const { result } = renderHook(() => useApiCache());

    const url = 'https://api.example.com/data?existing=param';
    const params = { new: 'param' };
    const mockData = { id: 1, name: 'Test' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    await act(async () => {
      await result.current.fetchWithCache(url, params);
    });

    // Should preserve existing params and add new ones
    const expectedUrl = 'https://api.example.com/data?existing=param&new=param';
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl, undefined);
  });

  it('should handle empty params object', async () => {
    const { result } = renderHook(() => useApiCache());

    const url = 'https://api.example.com/data';
    const params = {};
    const mockData = { id: 1, name: 'Test' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    await act(async () => {
      await result.current.fetchWithCache(url, params);
    });

    // Should not add empty params to URL
    expect(mockFetch).toHaveBeenCalledWith(url, undefined);
  });

  it('should handle multiple concurrent requests with different URLs', async () => {
    const { result } = renderHook(() => useApiCache({ enableDeduplication: true }));

    const url1 = 'https://api.example.com/data1';
    const url2 = 'https://api.example.com/data2';
    const mockData1 = { id: 1, name: 'Test 1' };
    const mockData2 = { id: 2, name: 'Test 2' };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData1,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData2,
      });

    // Make concurrent requests to different URLs
    const promises = [result.current.fetchWithCache(url1), result.current.fetchWithCache(url2)];

    await act(async () => {
      const [response1, response2] = await Promise.all(promises);
      expect(response1).toEqual(mockData1);
      expect(response2).toEqual(mockData2);
    });

    // Both requests should be made since they're different URLs
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
