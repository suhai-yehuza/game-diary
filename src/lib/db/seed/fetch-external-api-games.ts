import { API_CONFIG, getRapidApiConfig } from '@/lib/config/api.config';
import { nba_games, games } from '@/lib/db/schema';
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
      try {
        // Prepare data for nba_games table
        const nbaGameData = {
          id: game.id.toString(),
          league: game.league,
          season_id: game.season,
          season: game.season,
          date: new Date(game.date.start),
          home_team_id: game.teams.home.id.toString(),
          away_team_id: game.teams.visitors.id.toString(),
          stage: game.stage,
          status: typeof game.status === 'string' ? game.status : game.status.long,
          periods: game.periods,
          arena:
            typeof game.arena === 'string'
              ? { name: game.arena, city: '' }
              : game.arena
                ? {
                    name: game.arena.name || '',
                    city: game.arena.city || '',
                  }
                : null,
          teams: {
            home: {
              id: game.teams.home.id.toString(),
              name: game.teams.home.name,
              nickname: game.teams.home.nickname,
              logo: game.teams.home.logo,
            },
            visitors: {
              id: game.teams.visitors.id.toString(),
              name: game.teams.visitors.name,
              nickname: game.teams.visitors.nickname,
              logo: game.teams.visitors.logo,
            },
          },
          scores: game.scores,
          officials: Array.isArray(game.officials) ? game.officials : [String(game.officials)],
          times_tied: game.timesTied || 0,
          lead_changes: game.leadChanges || 0,
          nugget: game.nugget || null,
          created_at: new Date(),
          updated_at: new Date(),
        };

        // Store in nba_games table
        await db.insert(nba_games).values(nbaGameData).onConflictDoUpdate({
          target: nba_games.id,
          set: nbaGameData,
        });

        // Prepare data for games table
        const gameData = {
          id: game.id.toString(),
          game_type: 'nba',
          nba_game_id: game.id.toString(),
          date: new Date(game.date.start),
          home_team_id: game.teams.home.id.toString(),
          away_team_id: game.teams.visitors.id.toString(),
          home_score: game.scores.home.points,
          away_score: game.scores.visitors.points,
          status: game.status.long,
          created_at: new Date(),
          updated_at: new Date(),
        };

        // Store in games table
        await db.insert(games).values(gameData).onConflictDoUpdate({
          target: games.id,
          set: gameData,
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
