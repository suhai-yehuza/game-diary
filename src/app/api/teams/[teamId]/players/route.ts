import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { simpleCacheService } from '@/lib/cache/simple-cache-service';
import { getRapidApiConfig } from '@/lib/config/app.config';
import { createRapidAPIClient } from '@/lib/utils/api-client';
import { logger } from '@/lib/utils/logger';
import type { ITeamPlayersApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season');

    if (!teamId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Team ID is required',
        },
        { status: 400 }
      );
    }

    if (!season) {
      return NextResponse.json(
        {
          success: false,
          error: 'Season is required',
        },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `team-players-${teamId}-${season}`;
    const cachedData = simpleCacheService.get<ITeamPlayersApiResponse>(cacheKey);

    if (cachedData) {
      logger.info('Team players served from cache', {
        teamId,
        season,
        cacheKey,
      });
      return NextResponse.json({
        success: true,
        data: cachedData,
      });
    }

    logger.info(`Fetching team players for team ID: ${teamId}, season: ${season}`);

    // Get API configuration and create API client
    const apiConfig = getRapidApiConfig();
    const apiClient = createRapidAPIClient(apiConfig);

    // Fetch team players from external API
    const teamPlayersData = await apiClient.fetch<ITeamPlayersApiResponse>(`/players`, {
      team: teamId,
      season,
    });

    // Check if there are any errors in the response
    if (teamPlayersData.errors && Object.keys(teamPlayersData.errors).length > 0) {
      logger.error('External API returned errors', {
        teamId,
        season,
        errors: teamPlayersData.errors,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'External API returned errors',
          details: teamPlayersData.errors,
        },
        { status: 400 }
      );
    }

    // Check if there are no results - return empty array instead of error
    if (
      teamPlayersData.results === 0 ||
      !teamPlayersData.response ||
      teamPlayersData.response.length === 0
    ) {
      logger.info('No team players available - returning empty array', {
        teamId,
        season,
        results: teamPlayersData.results,
      });

      // Return successful response with empty array
      const emptyResponse = {
        ...teamPlayersData,
        response: [],
        results: 0,
      };

      // Cache the empty response for 1 hour to avoid repeated API calls
      simpleCacheService.set(cacheKey, emptyResponse, {
        ttl: 3600, // 1 hour in seconds
        tags: ['team-players', `team-${teamId}`, `season-${season}`],
      });

      return NextResponse.json({
        success: true,
        data: emptyResponse,
      });
    }

    logger.info('Team players fetched successfully', {
      teamId,
      season,
      results: teamPlayersData.results,
    });

    // Cache the successful response for 1 hour
    simpleCacheService.set(cacheKey, teamPlayersData, {
      ttl: 3600, // 1 hour in seconds
      tags: ['team-players', `team-${teamId}`, `season-${season}`],
    });

    return NextResponse.json({
      success: true,
      data: teamPlayersData,
    });
  } catch (error) {
    logger.error('Error fetching team players:', {
      error: String(error),
      teamId: (await params).teamId,
      searchParams: Object.fromEntries(new URL(request.url).searchParams),
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
