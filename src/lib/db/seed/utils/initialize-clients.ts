import { getRapidApiConfig, validateAPIKey } from '@/lib/config/api.config';
import { createRapidAPIClient } from '@/lib/external-apis';

import { createDatabaseClient } from '../config';

/**
 * Initialize both database and API clients with the common pattern used across seed files.
 * This eliminates code duplication across multiple seed files.
 *
 * @returns Object containing initialized database client and API client
 */
export function initializeClients() {
  const db = createDatabaseClient();
  const rapidApiConfig = getRapidApiConfig();
  const apiKey = validateAPIKey(rapidApiConfig.apiKey);
  const api = createRapidAPIClient(apiKey);

  return { db, api };
}

/**
 * Type for the return value of initializeClients
 */
export type ClientsConfig = ReturnType<typeof initializeClients>;
