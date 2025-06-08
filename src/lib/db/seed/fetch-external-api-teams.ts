import { eq } from 'drizzle-orm';

import { API_CONFIG } from '@src/lib/config/api.config';
import { teams } from '@src/lib/db/schema';
import { handleAPIError } from '@src/lib/external-apis';
import { seedLogger } from 'lib/core/logger';
import type { ApiTeam, ApiTeamResponse } from '@src/lib/types/consolidated.types';

import { initializeClients } from './utils/initialize-clients';

export async function fetchAndProcessNBATeams(): Promise<void> {
  try {
    const { db, api } = initializeClients();

    seedLogger.info('Fetching NBA teams...');

    const res = await api.get<ApiTeamResponse>(API_CONFIG.endpoints.TEAMS);
    seedLogger.info('Teams response:', res);

    if (!res?.response) {
      throw new Error('Invalid response structure from NBA API');
    }

    // Filter only NBA teams (those with nbaFranchise flag) and handle capitalized boolean
    const nbaTeams = res.response.filter((team: ApiTeam) => Boolean(team.nbaFranchise));
    seedLogger.info(
      `There are ${nbaTeams.length} NBA teams, and ${res.response.length} teams in total`
    );
    const dbTeams = res.response;
    if (dbTeams.length === 0) {
      seedLogger.info('No teams found in response, skipping...');
      return;
    }

    seedLogger.info(`Fetched ${dbTeams.length} teams`);

    // Process teams in batches to avoid rate limits
    for (const team of dbTeams) {
      try {
        // Use team name or nickname as fallback for city
        const cityFallback = team.city || team.name.split(' ')[0] || team.nickname || 'Unknown';

        // if the team already exists, skip it

        const existingTeam = await db.query.teams.findFirst({
          where: eq(teams.id, team.id.toString()),
        });
        if (existingTeam) {
          seedLogger.info(`Team ${team.id} already exists, skipping...`);
          continue;
        }

        const dbTeam = {
          id: team.id.toString(),
          name: team.name,
          nickname: team.nickname || team.name,
          code: team.code || team.name.substring(0, 3).toUpperCase(),
          city: cityFallback,
          state: '',
          country: 'USA',
          logo: team.logo || '',
          all_star: team.allStar || false,
          nba_franchise: team.nbaFranchise || false,
          leagues: team.leagues || {},
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Store team data in the database
        await db.insert(teams).values(dbTeam).onConflictDoUpdate({
          target: teams.id,
          set: dbTeam,
        });

        seedLogger.info('Successfully stored team:', dbTeam.id);
      } catch (error) {
        seedLogger.error(`Error storing team ${team.id}:`, error);
        throw error;
      }
    }

    seedLogger.info('Successfully stored all NBA teams.');
  } catch (error) {
    seedLogger.error('Error in fetchAndProcessNBATeams:', error);
    handleAPIError(error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fetchAndProcessNBATeams().catch(handleAPIError);
}
