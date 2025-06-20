import { eq } from 'drizzle-orm';

import { seedLogger } from '@lib/core/logger';
import { API_CONFIG } from '@src/lib/config/api.config';
import { seasons } from '@src/lib/db/schema/nba-schemas';
import { handleAPIError } from '@src/lib/external-apis';
import type { ISeasonApiResponse, ISeasonData } from '@src/lib/types';

import { initializeClients } from './utils/initialize-clients';

export async function fetchAndProcessNBASeasons(): Promise<void> {
  try {
    const { db, api } = initializeClients();

    seedLogger.info('Fetching NBA seasons...');
    const res = await api.get<ISeasonApiResponse>(API_CONFIG.endpoints.SEASONS);
    seedLogger.info('Seasons response:', res);

    if (!res?.response) {
      throw new Error('Invalid response structure from NBA API');
    }

    const seasonsData = res.response as unknown as number[]; // API returns array of year numbers
    if (seasonsData.length === 0) {
      seedLogger.info('No seasons found in response, skipping...');
      return;
    }

    seedLogger.info(`Fetched ${seasonsData.length} seasons`);
    const maxYear = Math.max(...seasonsData);

    for (const year of seasonsData) {
      if (typeof year !== 'number') continue;

      // if the season already exists, skip it
      const existingSeason = await db.query.seasons.findFirst({
        where: eq(seasons.id, year),
      });
      if (existingSeason) {
        seedLogger.info(`Season ${year} already exists, skipping...`);
        continue;
      }

      const seasonData: ISeasonData = {
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

    seedLogger.info('Successfully processed and stored NBA seasons');
  } catch (error) {
    seedLogger.error('Error fetching NBA seasons:', error);
    handleAPIError(error);
  }
}
