import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { simpleCacheService } from '@/lib/cache';
import { getRapidApiConfig } from '@/lib/config/app.config';
import { createRapidAPIClient } from '@/lib/utils/api-client';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import type { IStandingsApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season');
    const conference = searchParams.get('conference');
    const division = searchParams.get('division');
    const team = searchParams.get('team');
    const league = searchParams.get('league') || 'standard';
    const bypassCache = searchParams.get('bypass-cache') === 'true';

    logger.info('Standings API request', {
      season,
      conference,
      division,
      team,
      league,
    });

    // Validate required parameters
    if (!season || season.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Season is required' }, { status: 400 });
    }

    // Get API configuration and create API client
    const apiConfig = getRapidApiConfig();
    const apiClient = createRapidAPIClient(apiConfig);

    // Build cache key
    const cacheKey = `standings:${league}:${season}:${conference || 'all'}:${division || 'all'}:${team || 'all'}`;
    const cacheTTL = 24 * 60 * 60 * 1000; // 24 hours

    // Try to get from cache first (unless bypass is requested)
    if (!bypassCache) {
      const cachedData = simpleCacheService.get(cacheKey);
      if (cachedData) {
        logger.info('Standings cache hit', { season, conference, division, team, cacheKey });
        return NextResponse.json(cachedData);
      }
    }

    // Build API parameters
    const apiParams: Record<string, string> = {
      league,
      season,
    };

    if (conference) {
      apiParams.conference = conference;
    }
    if (division) {
      apiParams.division = division;
    }
    if (team) {
      apiParams.team = team;
    }

    logger.info('Fetching standings from external API', { apiParams });

    // Fetch standings from external API
    const standingsData = await apiClient.fetch<IStandingsApiResponse>('/standings', apiParams);

    // Check if external API has errors
    if (standingsData?.errors && Object.keys(standingsData.errors).length > 0) {
      logger.warn('External API returned errors', {
        errors: standingsData.errors,
      });

      return NextResponse.json({ success: false, error: 'External API error' }, { status: 502 });
    }

    // Check if external API has no data
    if (
      !standingsData ||
      standingsData.results === 0 ||
      !standingsData.response ||
      standingsData.response.length === 0
    ) {
      logger.warn('No standings data available from external API', {
        results: standingsData?.results,
        responseLength: standingsData?.response?.length,
      });

      return NextResponse.json(
        { success: false, error: 'No standings data available' },
        { status: 404 }
      );
    }

    // Process the data to calculate missing W, L, PCT from Home/Away data
    const processedTeams = standingsData.response.map(team => {
      // Calculate total wins and losses from home/away data
      const totalWins = team.win.home + team.win.away;
      const totalLosses = team.loss.home + team.loss.away;
      const totalGames = totalWins + totalLosses;

      // Calculate win percentage
      const winPercentage = totalGames > 0 ? (totalWins / totalGames).toFixed(3) : '0.000';
      const lossPercentage = totalGames > 0 ? (totalLosses / totalGames).toFixed(3) : '0.000';

      return {
        ...team,
        win: {
          ...team.win,
          total: totalWins,
          percentage: winPercentage,
        },
        loss: {
          ...team.loss,
          total: totalLosses,
          percentage: lossPercentage,
        },
        conference: {
          ...team.conference,
          win: totalWins,
          loss: totalLosses,
        },
        division: {
          ...team.division,
          win: team.division.win || 0,
          loss: team.division.loss || 0,
        },
      };
    });

    // Sort teams by conference and then by win percentage (PCT) within each conference
    const eastTeams = processedTeams
      .filter(team => team.conference.name === 'east')
      .sort((a, b) => parseFloat(b.win.percentage) - parseFloat(a.win.percentage));

    const westTeams = processedTeams
      .filter(team => team.conference.name === 'west')
      .sort((a, b) => parseFloat(b.win.percentage) - parseFloat(a.win.percentage));

    // Assign conference ranks based on sorted order
    eastTeams.forEach((team, index) => {
      team.conference.rank = index + 1;
    });

    westTeams.forEach((team, index) => {
      team.conference.rank = index + 1;
    });

    // Assign division ranks within each conference
    const eastDivisions = ['atlantic', 'central', 'southeast'];
    const westDivisions = ['northwest', 'pacific', 'southwest'];

    eastDivisions.forEach(div => {
      const divTeams = eastTeams
        .filter(team => team.division.name === div)
        .sort((a, b) => parseFloat(b.win.percentage) - parseFloat(a.win.percentage));
      divTeams.forEach((team, index) => {
        team.division.rank = index + 1;
      });
    });

    westDivisions.forEach(div => {
      const divTeams = westTeams
        .filter(team => team.division.name === div)
        .sort((a, b) => parseFloat(b.win.percentage) - parseFloat(a.win.percentage));
      divTeams.forEach((team, index) => {
        team.division.rank = index + 1;
      });
    });

    // Combine teams back together (East first, then West)
    const sortedTeams = [...eastTeams, ...westTeams];

    const processedData = {
      ...standingsData,
      response: sortedTeams,
    };

    logger.info('Standings API response processed', {
      hasResponse: !!processedData?.response,
      responseType: Array.isArray(processedData?.response)
        ? 'array'
        : typeof processedData?.response,
      resultsCount: processedData?.results || 0,
    });

    const responseData = {
      success: true,
      data: processedData,
      meta: {
        season,
        conference: conference || 'all',
        division: division || 'all',
        team: team || 'all',
        league,
        apiSource: 'external',
        timestamp: new Date().toISOString(),
      },
    };

    // Cache the processed response
    try {
      simpleCacheService.set(cacheKey, responseData, {
        ttl: cacheTTL,
        tags: ['standings', 'nba', `season:${season}`],
      });
      logger.info('Standings data cached', {
        season,
        conference,
        division,
        team,
        league,
        cacheKey,
      });
    } catch (cacheError) {
      logger.warn('Failed to cache standings data', {
        error: cacheError,
        season,
        conference,
        division,
        team,
        league,
        cacheKey,
      });
    }

    logger.info('Standings data fetched and processed successfully', {
      season,
      conference: conference || 'all',
      division: division || 'all',
      team: team || 'all',
      league,
      resultsCount: processedData?.results || 0,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    logger.error('Error fetching standings', {
      error,
    });

    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/standings',
    });

    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
