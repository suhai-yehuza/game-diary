import { getAppUrl } from '@/lib/config/app.config';

/**
 * Helper function to construct absolute URLs for server-side API calls
 * This prevents issues with relative URLs in server-side contexts where there's no base URL
 */
export function getServerApiUrl(endpoint: string): string {
  const baseUrl = getAppUrl();
  // Ensure endpoint starts with / and baseUrl doesn't end with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  return `${cleanBaseUrl}${cleanEndpoint}`;
}

/**
 * Helper function to make server-side API calls with proper error handling
 */
export async function serverApiCall<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getServerApiUrl(endpoint);

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Server API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
