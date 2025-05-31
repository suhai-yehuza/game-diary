import { InferSelectModel, sql } from 'drizzle-orm';
import { NextApiRequest, NextApiResponse } from 'next';

import { nba_games } from '@/lib/db/schema';
import { db } from '@/lib/db/seed';
import { APIError } from '@/lib/errors/api.error';
import { responseUtils } from '@/lib/utils/index.response';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get query parameters
    const { page = '1', limit = '10', selectedFields } = req.query;

    // Parse pagination parameters
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    // Validate pagination parameters
    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    // Calculate offset
    const offset = (pageNumber - 1) * limitNumber;

    // Get total count
    const [{ count }] = await db.select({ count: sql`count(*)` }).from(nba_games);
    const totalCount = parseInt(count as string, 10);

    // Get games with pagination
    const games = await db.select().from(nba_games).limit(limitNumber).offset(offset);

    // Apply field selection if requested
    const fields =
      ((selectedFields as string[] | undefined)
        ?.map(field => {
          switch (field) {
            case 'season':
              return 'season';
            case 'teams':
              return ['homeTeamId', 'awayTeamId'];
            case 'scores':
              return ['homeScore', 'awayScore'];
            default:
              return field;
          }
        })
        .flat() as (keyof InferSelectModel<typeof nba_games>)[]) || [];
    const optimizedGames = games.map((game: InferSelectModel<typeof nba_games>) =>
      responseUtils.selectFields(game, fields)
    );

    // Return paginated response
    return res.status(200).json(
      responseUtils.apiSuccessResponse({
        data: optimizedGames,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNumber),
        },
      })
    );
  } catch (error) {
    if (error instanceof APIError) {
      return responseUtils.apiErrorResponse(error);
    }
    return responseUtils.apiErrorResponse(
      new APIError(error instanceof Error ? error.message : 'Unknown error', 500)
    );
  }
}
