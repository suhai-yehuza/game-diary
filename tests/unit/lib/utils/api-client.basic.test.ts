/// <reference types="vitest/globals" />

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { createRapidAPIClient } from '@/lib/utils/api-client';

// Mock fetch globally
global.fetch = vi.fn();

// Helper function to create valid config
const createMockConfig = () => ({
  baseUrl: 'https://api.example.com',
  apiKey: 'test-key',
  host: 'test-host',
  endpoints: {},
  headers: {
    'X-RapidAPI-Key': 'test-key',
    'X-RapidAPI-Host': 'test-host',
  },
  timeout: 5000,
  retries: 3,
  cacheTTL: 300,
});

describe('createRapidAPIClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a client with the correct configuration', () => {
    const config = createMockConfig();
    const client = createRapidAPIClient(config);
    expect(client).toBeDefined();
    expect(typeof client.fetch).toBe('function');
  });

  it('should make successful API requests', async () => {
    const config = createMockConfig();
    const mockResponse = { data: 'test data' };
    const mockFetchResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    };
    (global.fetch as any).mockResolvedValue(mockFetchResponse);
    const client = createRapidAPIClient(config);
    const result = await client.fetch('/test-endpoint');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/test-endpoint',
      expect.any(Object)
    );
    expect(result).toEqual(mockResponse);
  });

  it('should handle query parameters correctly', async () => {
    const config = createMockConfig();
    const mockResponse = { data: 'test data' };
    const mockFetchResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    };
    (global.fetch as any).mockResolvedValue(mockFetchResponse);
    const client = createRapidAPIClient(config);
    const params = { param1: 'value1', param2: 'value2' };
    await client.fetch('/test-endpoint', params);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/test-endpoint?param1=value1&param2=value2',
      expect.any(Object)
    );
  });

  it('should filter out empty parameters', async () => {
    const config = createMockConfig();
    const mockResponse = { data: 'test data' };
    const mockFetchResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    };
    (global.fetch as any).mockResolvedValue(mockFetchResponse);
    const client = createRapidAPIClient(config);
    const params = { param1: 'value1', param2: '', param3: 'value3' };
    await client.fetch('/test-endpoint', params);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/test-endpoint?param1=value1&param3=value3',
      expect.any(Object)
    );
  });

  it('should handle special characters in parameters', async () => {
    const config = createMockConfig();
    const mockResponse = { data: 'test data' };
    const mockFetchResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    };
    (global.fetch as any).mockResolvedValue(mockFetchResponse);
    const client = createRapidAPIClient(config);
    const params = {
      param1: 'value with spaces',
      param2: 'value&with=special&chars',
      param3: 'value/with/path',
    };
    await client.fetch('/test-endpoint', params);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/test-endpoint?param1=value+with+spaces&param2=value%26with%3Dspecial%26chars&param3=value%2Fwith%2Fpath',
      expect.any(Object)
    );
  });

  it('should handle non-OK responses', async () => {
    const config = createMockConfig();
    const mockFetchResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
    };
    (global.fetch as any).mockResolvedValue(mockFetchResponse);
    const client = createRapidAPIClient(config);
    await expect(client.fetch('/test-endpoint')).rejects.toThrow(
      'API request failed: 404 Not Found'
    );
  });

  it('should handle network errors', async () => {
    const config = createMockConfig();
    const networkError = new Error('Network error');
    (global.fetch as any).mockRejectedValue(networkError);
    const client = createRapidAPIClient(config);
    await expect(client.fetch('/test-endpoint')).rejects.toThrow('Network error');
  });

  it('should handle JSON parsing errors', async () => {
    const config = createMockConfig();
    const mockFetchResponse = {
      ok: true,
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    };
    (global.fetch as any).mockResolvedValue(mockFetchResponse);
    const client = createRapidAPIClient(config);
    await expect(client.fetch('/test-endpoint')).rejects.toThrow('Invalid JSON');
  });

  it('should include correct headers', async () => {
    const config = createMockConfig();
    const mockResponse = { data: 'test data' };
    const mockFetchResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    };
    (global.fetch as any).mockResolvedValue(mockFetchResponse);
    const client = createRapidAPIClient(config);
    await client.fetch('/test-endpoint');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/test-endpoint',
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-RapidAPI-Key': 'test-key',
          'X-RapidAPI-Host': 'test-host',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should handle custom headers', async () => {
    const config = {
      ...createMockConfig(),
      headers: {
        'X-RapidAPI-Key': 'test-key',
        'X-RapidAPI-Host': 'test-host',
        'Custom-Header': 'custom-value',
      },
    };
    const mockResponse = { data: 'test data' };
    const mockFetchResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    };
    (global.fetch as any).mockResolvedValue(mockFetchResponse);
    const client = createRapidAPIClient(config);
    await client.fetch('/test-endpoint');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/test-endpoint',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Custom-Header': 'custom-value',
        }),
      })
    );
  });
});
