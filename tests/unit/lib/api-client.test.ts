import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createRapidAPIClient } from '@/lib/utils/api-client';
import { TIMEOUTS } from '@tests/e2e/utils/test-utils';

global.fetch = vi.fn();

describe('api-client utility', () => {
  const config = {
    baseUrl: 'https://api.example.com',
    apiKey: 'test-key',
    host: 'test-host',
    endpoints: { test: '/test' },
    timeout: TIMEOUTS.MEDIUM,
    retries: 3,
    cacheTTL: 300000,
    headers: {
      'X-RapidAPI-Key': 'test-key',
      'X-RapidAPI-Host': 'test-host',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches data successfully', async () => {
    const mockData = { foo: 'bar' };
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });
    const client = createRapidAPIClient(config);
    const result = await client.fetch('/test', { a: '1', b: '2' });
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/test?a=1&b=2',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining(config.headers),
      })
    );
  });

  it('throws on non-ok response', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });
    const client = createRapidAPIClient(config);
    await expect(client.fetch('/fail')).rejects.toThrow(
      'API request failed: 500 Internal Server Error'
    );
  });

  it('builds URL with no params', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const client = createRapidAPIClient(config);
    await client.fetch('/no-params');
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/no-params', expect.any(Object));
  });

  it('ignores empty or blank params', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const client = createRapidAPIClient(config);
    await client.fetch('/ignore', { a: '', b: ' ', c: 'valid' });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/ignore?c=valid',
      expect.any(Object)
    );
  });

  it('parses JSON response', async () => {
    const mockData = { hello: 'world' };
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => mockData });
    const client = createRapidAPIClient(config);
    const result = await client.fetch('/json');
    expect(result).toEqual(mockData);
  });

  it('throws if fetch throws', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));
    const client = createRapidAPIClient(config);
    await expect(client.fetch('/network')).rejects.toThrow('Network error');
  });
});
