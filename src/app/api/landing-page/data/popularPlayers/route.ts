import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getPlayerEngagementQuery } from '@/lib/db/queries/engagement.queries';
import { logger } from '@/lib/utils/logger';
import type { IPopularPlayer } from '@/types';

export async function GET() {
  try {
    const startTime = Date.now();
    const database = db();

    if (!database) {
      throw new Error('Database connection not available');
    }

    logger.info('Fetching popular players data...');

    // Get players with team info (limit to prevent infinite processing)
    const playersQuery = sql`
      SELECT
        p.id,
        p.first_name,
        p.last_name,
        p.teams,
        p.nba
      FROM basketball_players p
      WHERE p.deleted_at IS NULL
      ORDER BY p.first_name, p.last_name
      LIMIT 100
    `;

    const playersResult = await database.execute(playersQuery);
    const players = playersResult.rows || [];

    logger.info(`Found ${players.length} players`);

    // Enrich each player with engagement data
    const enrichedPlayers: IPopularPlayer[] = [];

    for (const player of players) {
      try {
        const engagement = await getPlayerEngagementQuery(String(player.id));

        const publicComments = engagement?.total_public_comments
          ? Number(engagement.total_public_comments)
          : 0;
        const publicReactions = engagement?.total_public_reactions
          ? Number(engagement.total_public_reactions)
          : 0;
        const allComments = engagement?.total_all_comments
          ? Number(engagement.total_all_comments)
          : 0;
        const allReactions = engagement?.total_all_reactions
          ? Number(engagement.total_all_reactions)
          : 0;
        const uniqueUsers = engagement?.unique_users_logged
          ? Number(engagement.unique_users_logged)
          : 0;
        const uniquePublicUsers = engagement?.unique_public_users
          ? Number(engagement.unique_public_users)
          : 0;
        const gameLogs = engagement?.total_game_logs ? Number(engagement.total_game_logs) : 0;

        // Calculate popularity score using similar algorithm to games
        const publicEngagementScore = publicComments * 2 + publicReactions * 1;
        const totalEngagementScore = allComments * 1.5 + allReactions * 0.8;
        const userDiversityScore = Math.log(uniqueUsers + 1) * 2;
        const publicUserDiversityScore = Math.log(uniquePublicUsers + 1) * 1.5;
        const gameLogVolumeScore = Math.log(gameLogs + 1) * 1.5;

        const popularityScore =
          Math.log(publicEngagementScore + 1) * 0.35 +
          Math.log(totalEngagementScore + 1) * 0.25 +
          userDiversityScore * 0.2 +
          publicUserDiversityScore * 0.15 +
          gameLogVolumeScore * 0.05;

        // Extract team info from the teams JSONB field
        const teamsData = player.teams as Record<string, unknown>;
        const nbaData = player.nba as Record<string, unknown>;

        // Get current team (most recent season)
        let currentTeam = null;
        if (teamsData && Array.isArray(teamsData) && teamsData.length > 0) {
          // Sort seasons by year (descending) to get the most recent
          const sortedSeasons = teamsData.sort(
            (a: Record<string, unknown>, b: Record<string, unknown>) =>
              parseInt(String(b.season)) - parseInt(String(a.season))
          );
          const latestSeason = sortedSeasons[0] as Record<string, unknown>;

          if (
            latestSeason?.teams &&
            Array.isArray(latestSeason.teams) &&
            latestSeason.teams.length > 0
          ) {
            // Get the first team from the most recent season
            const teamInfo = latestSeason.teams[0] as Record<string, unknown>;
            currentTeam = {
              id: teamInfo.team_id as string,
              name: teamInfo.team_name as string,
              code: 'TBD', // We don't have team codes in the teams data
              logo: undefined, // We don't have team logos in the teams data
            };
          }
        }

        // Get position from NBA data
        // The NBA data structure might have different field names
        const position = String(
          (typeof nbaData?.pos === 'string' ? nbaData.pos : '') ||
            (typeof nbaData?.position === 'string' ? nbaData.position : '') ||
            (typeof nbaData?.Pos === 'string' ? nbaData.Pos : '') ||
            'N/A'
        );

        // Handle cases where first_name might be just whitespace or empty
        const firstName = String(player.first_name).trim();
        const lastName = String(player.last_name).trim();
        const fullName = firstName ? `${firstName} ${lastName}` : lastName;

        const enrichedPlayer: IPopularPlayer = {
          id: String(player.id),
          name: fullName,
          position: String(position),
          team: currentTeam
            ? {
                id: String(currentTeam.id),
                name: String(currentTeam.name),
                code: String(currentTeam.code),
                logo: currentTeam.logo ? String(currentTeam.logo) : undefined,
              }
            : {
                id: 'unknown',
                name: 'Unknown Team',
                code: 'UNK',
                logo: undefined,
              },
          gameLogCount: gameLogs,
          commentCount: allComments,
          reactionCount: allReactions,
          popularityScore,
          engagement: {
            total: allComments + allReactions,
            public: publicComments + publicReactions,
            private: allComments + allReactions - (publicComments + publicReactions),
          },
        };

        enrichedPlayers.push(enrichedPlayer);
      } catch (error) {
        logger.error(`Error enriching player ${String(player.id)}:`, { error: String(error) });
      }
    }

    // Sort by popularity score
    // For now, include all players even without engagement to show some data
    // TODO: Once engagement data is available, filter by player.engagement.total > 0
    const mostPopular = [...enrichedPlayers]
      .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
      .slice(0, 10);

    const endTime = Date.now();
    logger.info('Popular players processed successfully', {
      totalPlayers: players.length,
      enrichedPlayers: enrichedPlayers.length,
      mostPopular: mostPopular.length,
      processingTimeMs: endTime - startTime,
    });

    return NextResponse.json({
      success: true,
      data: {
        mostPopular,
      },
      meta: {
        totalPlayers: players.length,
        enrichedPlayers: enrichedPlayers.length,
        processingTimeMs: endTime - startTime,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch popular players:', { error: String(error) });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
