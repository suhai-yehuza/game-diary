import { and, desc, eq, ilike, or, sql, isNull } from 'drizzle-orm';

import { db } from '@/lib/db';
import { nba_players } from '@/lib/db/schema/game-schemas';
import type { IPlayerResponse, IPlayerFilters } from '@/lib/types';
import { errorHandlers } from '@/lib/utils/error-handler';

/**
 * Convert database player record to API format
 */
function convertDbPlayerToApiFormat(dbPlayer: Record<string, unknown>): IPlayerResponse {
  try {
    // Parse JSON fields safely
    const birth = dbPlayer.birth ? JSON.parse(dbPlayer.birth as string) : null;
    const nba = dbPlayer.nba ? JSON.parse(dbPlayer.nba as string) : null;
    const height = dbPlayer.height ? JSON.parse(dbPlayer.height as string) : null;
    const weight = dbPlayer.weight ? JSON.parse(dbPlayer.weight as string) : null;
    const _teams = dbPlayer.teams ? JSON.parse(dbPlayer.teams as string) : null;
    const leagues = dbPlayer.leagues ? JSON.parse(dbPlayer.leagues as string) : null;

    return {
      id: parseInt(dbPlayer.id as string),
      firstname: (dbPlayer.first_name as string) || (dbPlayer.firstName as string),
      lastname: (dbPlayer.last_name as string) || (dbPlayer.lastName as string),
      birth,
      nba,
      height,
      weight,
      college: dbPlayer.college as string | null,
      affiliation: dbPlayer.affiliation as string | null,
      leagues,
    };
  } catch (error) {
    // Use centralized error handling
    errorHandlers.validation(error instanceof Error ? error : new Error(String(error)), {
      component: 'Database Service',
      action: 'Convert DB player to API format',
    });
    // Return basic format on error
    return {
      id: parseInt(dbPlayer.id as string),
      firstname: (dbPlayer.first_name as string) || (dbPlayer.firstName as string) || 'Unknown',
      lastname: (dbPlayer.last_name as string) || (dbPlayer.lastName as string) || 'Player',
      birth: undefined,
      nba: undefined,
      height: undefined,
      weight: undefined,
      college: dbPlayer.college as string | null,
      affiliation: dbPlayer.affiliation as string | null,
      leagues: undefined,
    };
  }
}

/**
 * Get all NBA players from database with optional filtering
 */
export async function getPlayers(filters: IPlayerFilters = {}): Promise<{
  players: IPlayerResponse[];
  total: number;
}> {
  try {
    const {
      searchTerm,
      positionFilter,
      teamFilter,
      collegeFilter,
      countryFilter,
      sortBy = 'name',
      sortDirection = 'asc',
      limit = 50,
      offset = 0,
    } = filters;

    // Build WHERE conditions
    const conditions = [];

    // Search term - search in first name, last name, or college
    if (searchTerm?.trim()) {
      const term = `%${searchTerm.trim()}%`;
      conditions.push(
        or(
          ilike(nba_players.first_name, term),
          ilike(nba_players.last_name, term),
          ilike(nba_players.college, term)
        )
      );
    }

    // College filter
    if (collegeFilter && collegeFilter !== 'all') {
      conditions.push(ilike(nba_players.college, `%${collegeFilter}%`));
    }

    // Position filter - search in leagues JSON
    if (positionFilter && positionFilter !== 'all') {
      conditions.push(ilike(nba_players.leagues, `%${positionFilter}%`));
    }

    // Team filter - search in teams JSON
    if (teamFilter && teamFilter !== 'all') {
      conditions.push(ilike(nba_players.teams, `%${teamFilter}%`));
    }

    // Country filter - search in birth JSON for country
    if (countryFilter && countryFilter !== 'all') {
      conditions.push(ilike(nba_players.birth, `%${countryFilter}%`));
    }

    // TEMPORARILY: Remove all conditions to test if we can fetch any players
    const _whereClause = undefined; // conditions.length > 0 ? and(...conditions) : undefined;

    // Build ORDER BY clause
    let orderBy;
    switch (sortBy) {
      case 'name':
        orderBy =
          sortDirection === 'asc'
            ? [nba_players.last_name, nba_players.first_name]
            : [desc(nba_players.last_name), desc(nba_players.first_name)];
        break;
      case 'college':
        orderBy =
          sortDirection === 'asc'
            ? [nba_players.college, nba_players.last_name]
            : [desc(nba_players.college), desc(nba_players.last_name)];
        break;
      default:
        orderBy = [nba_players.last_name, nba_players.first_name];
    }

    // Use the same database connection method as the working endpoints
    const dbPlayers = await db()?.query.nba_players.findMany({
      limit,
      offset,
      orderBy: orderBy,
    });

    // Get total count using raw SQL like the search endpoint
    const countQuery = sql`SELECT COUNT(*) as count FROM nba_players`;
    const database = db();
    if (!database) {
      throw new Error('Database not available');
    }
    const countResult = await database.execute(countQuery);
    const total = parseInt((countResult.rows[0]?.count as string) ?? '0');

    // Convert to API format
    const players = dbPlayers?.map(convertDbPlayerToApiFormat) ?? [];

    return {
      players,
      total,
    };
  } catch (error) {
    // Use centralized error handling
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Database Service',
      action: 'Fetch players from database',
    });
    return {
      players: [],
      total: 0,
    };
  }
}

/**
 * Get a single player by ID
 */
export async function getPlayerById(playerId: string): Promise<IPlayerResponse | null> {
  try {
    const database = db();
    if (!database) {
      throw new Error('Database not available');
    }
    const dbPlayer = await database
      .select()
      .from(nba_players)
      .where(and(eq(nba_players.id, playerId), isNull(nba_players.deleted_at)))
      .limit(1);

    if (dbPlayer.length === 0) {
      return null;
    }

    return convertDbPlayerToApiFormat(dbPlayer[0]);
  } catch (error) {
    // Use centralized error handling
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Database Service',
      action: 'Fetch player by ID',
    });
    return null;
  }
}

/**
 * Get players by team ID
 */
export async function getPlayersByTeam(teamId: string): Promise<IPlayerResponse[]> {
  try {
    const database = db();
    if (!database) {
      throw new Error('Database not available');
    }
    const dbPlayers = await database
      .select()
      .from(nba_players)
      .where(and(ilike(nba_players.teams, `%${teamId}%`), isNull(nba_players.deleted_at)))
      .orderBy(nba_players.last_name, nba_players.first_name);

    return dbPlayers.map(convertDbPlayerToApiFormat);
  } catch (error) {
    // Use centralized error handling
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Database Service',
      action: 'Fetch players by team',
    });
    return [];
  }
}

/**
 * Get unique colleges for filter options
 */
export async function getUniqueColleges(): Promise<string[]> {
  try {
    const database = db();
    if (!database) {
      throw new Error('Database not available');
    }
    const colleges = await database
      .selectDistinct({ college: nba_players.college })
      .from(nba_players)
      .where(
        and(
          isNull(nba_players.deleted_at),
          sql`${nba_players.college} IS NOT NULL AND ${nba_players.college} != ''`
        )
      )
      .orderBy(nba_players.college);

    return colleges
      .map((row: Record<string, unknown>) => row.college as string)
      .filter((college: string | null | undefined) => college?.trim())
      .slice(0, 100); // Limit to top 100 colleges
  } catch (error) {
    // Use centralized error handling
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Database Service',
      action: 'Fetch unique colleges',
    });
    return [];
  }
}

/**
 * Get unique countries for filter options
 */
export async function getUniqueCountries(): Promise<string[]> {
  try {
    // Countries are stored in the birth JSON field
    // We need to extract country from JSON and get unique values
    const database = db();
    if (!database) {
      throw new Error('Database not available');
    }
    const players = await database
      .select({ birth: nba_players.birth })
      .from(nba_players)
      .where(
        and(
          isNull(nba_players.deleted_at),
          sql`${nba_players.birth} IS NOT NULL AND ${nba_players.birth} != ''`
        )
      );

    const countries = new Set<string>();

    for (const player of players) {
      try {
        if (player.birth) {
          const birthData = JSON.parse(player.birth);
          if (birthData?.country && typeof birthData.country === 'string') {
            countries.add(birthData.country.trim());
          }
        }
      } catch (_error) {
        // Skip invalid JSON
      }
    }

    return Array.from(countries)
      .filter(country => country)
      .sort()
      .slice(0, 50); // Limit to top 50 countries
  } catch (error) {
    // Use centralized error handling
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Database Service',
      action: 'Fetch unique countries',
    });
    return [];
  }
}

/**
 * Get unique positions for filter options
 */
export function getUniquePositions(): string[] {
  try {
    // This is more complex since positions are stored in JSON
    // For now, return common NBA positions
    return ['G', 'F', 'C', 'G-F', 'F-C', 'F-G', 'C-F'];
  } catch (error) {
    // Use centralized error handling
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Database Service',
      action: 'Fetch unique positions',
    });
    return ['G', 'F', 'C'];
  }
}
