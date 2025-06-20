import { eq } from 'drizzle-orm';

import { seedLogger } from '@lib/core/logger';
import { API_CONFIG } from '@src/lib/config/api.config';
import { nba_games } from '@src/lib/db/schema';
import { handleAPIError } from '@src/lib/external-apis';
import type { IGameApiResponse } from '@src/lib/types';

import { initializeClients } from './utils/initialize-clients';

export async function fetchAndProcessNBAGames(season: number): Promise<void> {
  try {
    const { db, api } = initializeClients();

    seedLogger.info(`Fetching NBA games for season ${season}...`);
    const res = await api.get<IGameApiResponse>(API_CONFIG.endpoints.GAMES, {
      params: { season: season.toString() },
    });
    seedLogger.info('Games response:', res);

    if (!res?.response) {
      throw new Error('Invalid response structure from NBA API');
    }

    const nbaGames = res.response;
    if (nbaGames.length === 0) {
      seedLogger.info('No games found in response, skipping...');
      return;
    }

    seedLogger.info(`Fetched ${nbaGames.length} games`);

    // Process games
    for (const game of nbaGames) {
      // if the game already exists, skip it
      const existingGame = await db.query.nba_games.findFirst({
        where: eq(nba_games.id, game.id.toString()),
      });
      if (existingGame) {
        seedLogger.info(`Game ${game.id} already exists, skipping...`);
        continue;
      }

      seedLogger.info('Game value:', game);
      try {
        // Type guards for date and status
        const dateObj =
          typeof game.date === 'object' && game.date !== null && 'start' in game.date
            ? (game.date as { start?: string; end?: string; duration?: string })
            : {};
        const statusObj =
          typeof game.status === 'object' &&
          game.status !== null &&
          ('clock' in game.status || 'halftime' in game.status)
            ? (game.status as { clock?: string; halftime?: boolean; short?: string; long?: string })
            : {};
        // Prepare data for nba_games table
        const nbaGameData = {
          id: game.id.toString(),
          league: typeof game.league === 'string' ? game.league : '',
          season: typeof game.season === 'number' ? game.season : 0,
          date: {
            start: dateObj.start || '',
            end: dateObj.end || null,
            duration: dateObj.duration || null,
          },
          homeTeamId: game.teams.home.id.toString(),
          awayTeamId: game.teams.visitors.id.toString(),
          stage: typeof game.stage === 'number' ? game.stage : 0,
          status: {
            clock: statusObj.clock || null,
            halftime: statusObj.halftime || false,
            short: statusObj.short || '',
            long: statusObj.long || '',
          },
          periods: {
            current: game.periods?.current ?? 0,
            total: game.periods?.total ?? 0,
            endOfPeriod: game.periods?.endOfPeriod ?? false,
          },
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
          scores: game.scores
            ? {
                home: {
                  ...game.scores.home,
                  linescore: (game.scores.home.linescore || []).map(score => {
                    const num = Number(score);
                    return isNaN(num) ? 0 : num;
                  }),
                },
                visitors: {
                  ...game.scores.visitors,
                  linescore: (game.scores.visitors.linescore || []).map(score => {
                    const num = Number(score);
                    return isNaN(num) ? 0 : num;
                  }),
                },
              }
            : {
                home: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [], points: 0 },
                visitors: {
                  win: 0,
                  loss: 0,
                  series: { win: 0, loss: 0 },
                  linescore: [],
                  points: 0,
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
        await db
          .insert(nba_games)
          .values(nbaGameData as typeof nba_games.$inferInsert)
          .onConflictDoUpdate({
            target: nba_games.id,
            set: nbaGameData as typeof nba_games.$inferInsert,
          });

        seedLogger.info('Successfully stored game:', game.id);
      } catch (error) {
        seedLogger.error(`Error storing game ${game.id}:`, error);
        throw error;
      }
    }

    seedLogger.info('Successfully stored all NBA games.');
  } catch (error) {
    seedLogger.error('Error in fetchAndProcessNBAGames:', error);
    handleAPIError(error);
  }
}

// Export the function
export default fetchAndProcessNBAGames;

if (import.meta.url === `file://${process.argv[1]}`) {
  fetchAndProcessNBAGames(2024).catch(handleAPIError);
}
