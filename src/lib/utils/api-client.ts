import { API_CONFIG } from '@/lib/config/app.config';
import type { IRapidAPIConfig } from '@/types';

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const isRetryableStatus = (status: number): boolean => {
  if (status === 408 || status === 429) return true;
  if (status >= 500 && status < 600) return true;
  return false;
};

export const createRapidAPIClient = (config: IRapidAPIConfig) => {
  return {
    async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
      const url = new URL(`${config.baseUrl}${endpoint}`);
      Object.entries(params).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          url.searchParams.append(key, value);
        }
      });

      const maximumAttempts = Math.max(1, config.retries ?? 3);
      const requestTimeoutMs = Math.max(1000, config.timeout ?? 10000);
      const baseRetryDelayMs = API_CONFIG.request.retryDelay ?? 1000;

      let lastError: unknown;

      for (let attempt = 1; attempt <= maximumAttempts; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);
        try {
          const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
              ...config.headers,
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = (await response.json()) as T;
            return data;
          }

          if (attempt < maximumAttempts && isRetryableStatus(response.status)) {
            const backoffDelay = Math.min(30000, baseRetryDelayMs * 2 ** (attempt - 1));
            await sleep(backoffDelay);
            continue;
          }

          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        } catch (error: unknown) {
          clearTimeout(timeoutId);
          lastError = error;

          const isAbort = error instanceof Error && error.name === 'AbortError';
          const isUndiciNetworkError =
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            typeof (error as { code: unknown }).code === 'string' &&
            (error as { code: string }).code.startsWith('UND_ERR_');
          const isNetworkTypeError = error instanceof TypeError;

          if (
            attempt < maximumAttempts &&
            (isAbort || isUndiciNetworkError || isNetworkTypeError)
          ) {
            const backoffDelay = Math.min(30000, baseRetryDelayMs * 2 ** (attempt - 1));
            await sleep(backoffDelay);
            continue;
          }

          throw error;
        }
      }

      throw lastError instanceof Error ? lastError : new Error('API request failed');
    },
  };
};
