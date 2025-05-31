import { eq } from 'drizzle-orm';

import { API_CONFIG, getRapidApiConfig } from '@/lib/config/api.config';
import { nba_games } from '@/lib/db/schema';
import { createRapidAPIClient, validateAPIKey, handleAPIError } from '@/lib/external-apis';
import type { GameApiResponse } from '@/lib/types/game.types';

import { createDatabaseClient } from './config';

export async function fetchAndProcessNBAGames(season: number): Promise<void> {
  try {
    const db = createDatabaseClient();
    const rapidApiConfig = getRapidApiConfig();
    const apiKey = validateAPIKey(rapidApiConfig.apiKey);
    const api = createRapidAPIClient(apiKey);

    console.log(`Fetching NBA games for season ${season}...`);
    const res = await api.get<GameApiResponse>(API_CONFIG.endpoints.GAMES, {
      params: { season: season.toString() },
    });
    console.log('Games response:', res);

    if (!res?.response) {
      throw new Error('Invalid response structure from NBA API');
    }

    const nbaGames = res.response;
    if (nbaGames.length === 0) {
      console.log('No games found in response, skipping...');
      return;
    }

    console.log(`Fetched ${nbaGames.length} games`);

    // Process games
    for (const game of nbaGames) {
      // if the game already exists, skip it
      const existingGame = await db.query.nba_games.findFirst({
        where: eq(nba_games.id, game.id.toString()),
      });
      if (existingGame) {
        console.log(`Game ${game.id} already exists, skipping...`);
        continue;
      }

      console.log('Game value:', game);
      try {
        // Prepare data for nba_games table
        const nbaGameData = {
          id: game.id.toString(),
          league: game.league,
          season: game.season,
          date: {
            start: game.date.start,
            end: game.date.end || null,
            duration: game.date.duration || null,
          },
          homeTeamId: game.teams.home.id.toString(),
          awayTeamId: game.teams.visitors.id.toString(),
          stage: game.stage,
          status: {
            clock: game.status.clock || null,
            halftime: game.status.halftime || false,
            short: game.status.short || '',
            long: game.status.long || '',
          },
          periods: game.periods,
          arena:
            typeof game.arena === 'string'
              ? { name: game.arena, city: '', state: null, country: null }
              : game.arena
                ? {
                    name: game.arena.name || '',
                    city: game.arena.city || '',
                    state: game.arena.state || null,
                    country: game.arena.country || null,
                  }
                : null,
          teams: {
            home: {
              id: parseInt(game.teams.home.id.toString()),
              name: game.teams.home.name,
              nickname: game.teams.home.nickname,
              code: game.teams.home.code || '',
              logo: game.teams.home.logo,
            },
            visitors: {
              id: parseInt(game.teams.visitors.id.toString()),
              name: game.teams.visitors.name,
              nickname: game.teams.visitors.nickname,
              code: game.teams.visitors.code || '',
              logo: game.teams.visitors.logo,
            },
          },
          scores: {
            home: {
              ...game.scores.home,
              linescore: (game.scores.home.linescore || []).map(String),
            },
            visitors: {
              ...game.scores.visitors,
              linescore: (game.scores.visitors.linescore || []).map(String),
            },
          },
          officials: Array.isArray(game.officials) ? game.officials : [String(game.officials)],
          timesTied: game.timesTied || 0,
          leadChanges: game.leadChanges || 0,
          nugget: game.nugget || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Store in nba_games table
        await db.insert(nba_games).values(nbaGameData).onConflictDoUpdate({
          target: nba_games.id,
          set: nbaGameData,
        });

        console.log('Successfully stored game:', game.id);
      } catch (error) {
        console.error(`Error storing game ${game.id}:`, error);
        throw error;
      }
    }

    console.log('Successfully stored all NBA games.');
  } catch (error) {
    console.error('Error in fetchAndProcessNBAGames:', error);
    handleAPIError(error);
  }
}

// Export the function
export default fetchAndProcessNBAGames;

if (import.meta.url === `file://${process.argv[1]}`) {
  fetchAndProcessNBAGames(2024).catch(handleAPIError);
}
