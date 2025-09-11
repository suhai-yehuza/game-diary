import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getUserEngagementQuery } from '@/lib/db/queries/engagement.queries';
import { logger } from '@/lib/utils/logger';
import type { IActiveFan } from '@/types';

export async function GET() {
  try {
    const startTime = Date.now();
    const database = db();

    if (!database) {
      throw new Error('Database connection not available');
    }

    logger.info('Fetching active fans data...');

    // Get users with basic info (limit to prevent infinite processing)
    const usersQuery = sql`
      SELECT id, username, image_url
      FROM users
      WHERE deleted_at IS NULL
      ORDER BY username
      LIMIT 50
    `;

    const usersResult = await database.execute(usersQuery);
    const users = usersResult.rows || [];

    logger.info(`Found ${users.length} users`);

    // Enrich each user with engagement data
    const enrichedUsers: IActiveFan[] = [];

    for (const user of users) {
      try {
        const engagement = await getUserEngagementQuery(String(user.id));

        const totalComments = engagement?.total_comments ? Number(engagement.total_comments) : 0;
        const publicComments = engagement?.public_comments ? Number(engagement.public_comments) : 0;
        const totalReactions = engagement?.total_reactions ? Number(engagement.total_reactions) : 0;
        const publicReactions = engagement?.public_reactions
          ? Number(engagement.public_reactions)
          : 0;
        const receivedComments = engagement?.received_comments
          ? Number(engagement.received_comments)
          : 0;
        const receivedReactions = engagement?.received_reactions
          ? Number(engagement.received_reactions)
          : 0;
        const gameLogs = engagement?.total_game_logs ? Number(engagement.total_game_logs) : 0;
        const publicGameLogs = engagement?.public_game_logs
          ? Number(engagement.public_game_logs)
          : 0;

        // Calculate activity score based on content creation and engagement received
        const contentCreationScore = gameLogs * 2 + totalComments * 1.5 + totalReactions * 1;
        const engagementReceivedScore = receivedComments * 2 + receivedReactions * 1;
        const publicActivityScore = publicGameLogs * 3 + publicComments * 2 + publicReactions * 1.5;
        const diversityScore = Math.log(gameLogs + totalComments + totalReactions + 1) * 2;

        const activityScore =
          Math.log(contentCreationScore + 1) * 0.3 +
          Math.log(engagementReceivedScore + 1) * 0.25 +
          Math.log(publicActivityScore + 1) * 0.25 +
          diversityScore * 0.2;

        const enrichedUser: IActiveFan = {
          id: String(user.id),
          username: String(user.username),
          imageUrl:
            user.image_url && typeof user.image_url === 'string' ? user.image_url : undefined,
          gameLogCount: gameLogs,
          commentCount: totalComments,
          reactionCount: totalReactions,
          receivedEngagement: receivedComments + receivedReactions,
          activityScore,
          engagement: {
            created: gameLogs + totalComments + totalReactions,
            received: receivedComments + receivedReactions,
            public: publicGameLogs + publicComments + publicReactions,
            private:
              gameLogs +
              totalComments +
              totalReactions -
              (publicGameLogs + publicComments + publicReactions),
          },
        };

        enrichedUsers.push(enrichedUser);
      } catch (error) {
        logger.error(`Error enriching user ${String(user.id)}:`, { error: String(error) });
      }
    }

    // Sort by activity score
    const mostActive = [...enrichedUsers]
      .filter(user => user.engagement.created > 0) // Only users with activity
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, 10);

    const endTime = Date.now();
    logger.info('Active fans processed successfully', {
      totalUsers: users.length,
      enrichedUsers: enrichedUsers.length,
      mostActive: mostActive.length,
      processingTimeMs: endTime - startTime,
    });

    return NextResponse.json({
      success: true,
      data: {
        mostActive,
      },
      meta: {
        totalUsers: users.length,
        enrichedUsers: enrichedUsers.length,
        processingTimeMs: endTime - startTime,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch active fans:', { error: String(error) });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
