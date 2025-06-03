import { eq, sql } from 'drizzle-orm';

import { API_CONFIG, getRapidApiConfig, validateAPIKey } from '@/lib/config/api.config';
import { nba_players, teams } from '@/lib/db/schema/nba-schemas';
import { createRapidAPIClient, handleAPIError } from '@/lib/external-apis';
import { seedLogger } from '@/lib/logger';
import { PlayerApiResponse } from '@/lib/types/consolidated.types';

import { createDatabaseClient } from './config';
export async function fetchAndProcessNBAPlayers(season: number): Promise<void> {
  try {
    const db = createDatabaseClient();
    const rapidApiConfig = getRapidApiConfig();
    const apiKey = validateAPIKey(rapidApiConfig.apiKey);
    const api = createRapidAPIClient(apiKey);

    // Get all teams
    const allTeams = await db.select().from(teams);
    seedLogger.info(`Found ${allTeams.length} teams`);

    for (const team of allTeams) {
      seedLogger.info(`Fetching NBA players for team ${team.id}'s ${season} season...`);
      try {
        const res = await api.get<PlayerApiResponse>(`${API_CONFIG.endpoints.PLAYERS}`, {
          params: { team: team.id.toString(), season: season.toString() },
        });

        if (!res?.response) {
          seedLogger.warn(`Invalid response structure from NBA API for team ${team.id}`);
          continue;
        }

        const nbaPlayers = Array.isArray(res.response) ? res.response : [];
        if (nbaPlayers.length === 0) {
          seedLogger.info(`No players found for team ${team.id} in ${season} season, skipping...`);
          continue;
        }

        seedLogger.info(`Fetched ${nbaPlayers.length} players for team ${team.id}`);

        // Process players
        for (const player of nbaPlayers) {
          // if the player already exists, skip it
          const existingPlayer = await db.query.nba_players.findFirst({
            where: eq(nba_players.id, player.id.toString()),
          });
          if (existingPlayer) {
            seedLogger.info(`Player ${player.id} already exists, skipping...`);
            continue;
          }

          try {
            const nbaPlayer = {
              id: player.id.toString(),
              firstName: player.firstname,
              lastName: player.lastname,
              birth: player.birth?.date ? new Date(player.birth.date) : null,
              birthCountry: player.birth?.country || 'no-birth-country',
              nbaStart: player.nba?.start || null,
              nbaProYears: player.nba?.pro || null,
              height: player.height?.meters || null,
              weight: player.weight?.kilograms || null,
              college: player.college || 'no-college',
              affiliation: player.affiliation || 'no-affiliation',
              jersey: player.leagues?.standard?.jersey?.toString() || null,
              active: player.leagues?.standard?.active || false,
              pos: player.leagues?.standard?.pos || 'no-pos',
              seasonsActive: [{ season, teamIds: [team.id] }],
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Store player data in the database
            await db
              .insert(nba_players)
              .values(nbaPlayer)
              .onConflictDoUpdate({
                target: nba_players.id,
                set: {
                  ...nbaPlayer,
                  seasonsActive: sql`CASE 
                    WHEN nba_players."seasonsActive" IS NULL THEN ${JSON.stringify([{ season, teamIds: [team.id] }])}::jsonb
                    WHEN NOT EXISTS (
                      SELECT 1 
                      FROM jsonb_array_elements(nba_players."seasonsActive") AS sa 
                      WHERE (sa->>'season')::int = ${season}
                    ) THEN nba_players."seasonsActive" || ${JSON.stringify({ season, teamIds: [team.id] })}::jsonb
                    WHEN NOT EXISTS (
                      SELECT 1 
                      FROM jsonb_array_elements(nba_players."seasonsActive") AS sa 
                      WHERE (sa->>'season')::int = ${season} 
                      AND (sa->'teamIds')::jsonb ? ${team.id}
                    ) THEN (
                      SELECT jsonb_agg(
                        CASE 
                          WHEN (sa->>'season')::int = ${season} 
                          THEN jsonb_set(sa, '{teamIds}', (sa->'teamIds') || ${JSON.stringify(team.id)}::jsonb)
                          ELSE sa
                        END
                      )
                      FROM jsonb_array_elements(nba_players."seasonsActive") AS sa
                    )
                    ELSE nba_players."seasonsActive"
                  END`,
                  updatedAt: new Date(),
                },
              });

            seedLogger.info('Successfully stored player:', nbaPlayer.id);
          } catch (error) {
            seedLogger.error(`Error storing player ${player.id}:`, error);
            // Continue with next player instead of throwing
            continue;
          }
        }
      } catch (error) {
        seedLogger.error(`Error fetching players for team ${team.id}:`, error);
        // Continue with next team instead of throwing
        continue;
      }
    }

    seedLogger.info('Successfully stored all NBA players.');
  } catch (error) {
    seedLogger.error('Error in fetchAndProcessNBAPlayers:', error);
    handleAPIError(error);
  }
}

// Export the function
export default fetchAndProcessNBAPlayers;
