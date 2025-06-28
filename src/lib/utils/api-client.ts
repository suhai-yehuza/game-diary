import type { IRapidAPIConfig } from '@/lib/types/external.api.types';

export const createRapidAPIClient = (config: IRapidAPIConfig) => {
  return {
    async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
      const url = new URL(`${config.baseUrl}${endpoint}`);
      Object.entries(params).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          url.searchParams.append(key, value);
        }
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          ...config.headers,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as T;
      return data;
    },
  };
};
