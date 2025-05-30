import { API_CONFIG, getRapidApiConfig } from '@/lib/config/api.config';
import { seasons } from '@/lib/db/schema';
import { createRapidAPIClient, validateAPIKey, handleAPIError } from '@/lib/external-apis';
import { SeasonApiResponse } from '@/lib/types/consolidated.types';

import { createDatabaseClient } from './config';

export async function fetchAndProcessNBASeasons(): Promise<void> {
  try {
    const db = createDatabaseClient();
    const rapidApiConfig = getRapidApiConfig();
    const apiKey = validateAPIKey(rapidApiConfig.apiKey);
    const api = createRapidAPIClient(apiKey);

    console.log('Fetching NBA seasons...');
    const res = await api.get<SeasonApiResponse>(API_CONFIG.endpoints.SEASONS);
    console.log('Seasons response:', res);

    if (!res?.response) {
      throw new Error('Invalid response structure from NBA API');
    }

    const seasonsData = res.response as unknown as number[]; // API returns array of year numbers
    if (seasonsData.length === 0) {
      console.log('No seasons found in response, skipping...');
      return;
    }

    console.log(`Fetched ${seasonsData.length} seasons`);
    const maxYear = Math.max(...seasonsData);

    for (const year of seasonsData) {
      if (typeof year !== 'number') continue;

      const seasonData = {
        id: year,
        year: year,
        displayYear: `${year}-${(year + 1).toString().slice(-2)}`,
        startDate: new Date(year, 9, 1), // October 1st
        endDate: new Date(year + 1, 5, 30), // June 30th
        isCurrent: year === maxYear, // Set current season flag
        isPlayoffs: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db
        .insert(seasons)
        .values(seasonData)
        .onConflictDoUpdate({
          target: seasons.id,
          set: {
            ...seasonData,
            updatedAt: new Date(), // Always update the updatedAt timestamp
          },
        });
    }

    console.log('Successfully processed and stored NBA seasons');
  } catch (error) {
    console.error('Error fetching NBA seasons:', error);
    handleAPIError(error);
  }
}
