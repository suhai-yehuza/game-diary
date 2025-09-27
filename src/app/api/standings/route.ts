import type { NextRequest } from 'next/server';

import { simpleCacheService } from '@/lib/cache';
import { getRapidApiConfig } from '@/lib/config/app.config';
import { createRapidAPIClient } from '@/lib/utils/api-client';
import { createCorsResponse, handleCorsOptions } from '@/lib/utils/cors';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import type { IStandingsApiResponse } from '@/types';

/**
 * Handle CORS preflight requests
 */
export function OPTIONS() {
  return handleCorsOptions();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season');
    const conference = searchParams.get('conference');
    const division = searchParams.get('division');
    const team = searchParams.get('team');
    const league = searchParams.get('league') || 'standard';
    const bypassCache = searchParams.get('bypass-cache') === 'true';

    // Check if we're in mock mode
    if (process.env.MOCK_MODE === 'true') {
      logger.info('Standings API request - Mock Mode', {
        season,
        conference,
        division,
        team,
        league,
      });

      // Return mock standings data
      const mockStandings = {
        success: true,
        data: {
          get: 'standings',
          parameters: {
            season: season || '2024',
            conference: conference || 'all',
            division: division || 'all',
            team: team || 'all',
            league: league || 'standard',
          },
          errors: [],
          results: 0,
          response: [],
        },
        timestamp: new Date().toISOString(),
        mock: true,
      };

      return createCorsResponse(mockStandings);
    }

    logger.info('Standings API request', {
      season,
      conference,
      division,
      team,
      league,
    });

    // Validate required parameters
    if (!season || season.trim().length === 0) {
      return createCorsResponse({ success: false, error: 'Season is required' }, 400);
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
        return createCorsResponse(cachedData);
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

      return createCorsResponse({ success: false, error: 'External API error' }, 502);
    }

    // Check if external API has no data - return empty array instead of error
    if (
      !standingsData ||
      standingsData.results === 0 ||
      !standingsData.response ||
      standingsData.response.length === 0
    ) {
      logger.info('No standings data available - returning empty array', {
        results: standingsData?.results,
        responseLength: standingsData?.response?.length,
        season,
        conference,
        division,
        team,
        league,
      });

      // Return successful response with empty array
      const emptyResponse = {
        ...standingsData,
        response: [],
        results: 0,
      };

      // Cache the empty response for 1 hour to avoid repeated API calls
      simpleCacheService.set(cacheKey, emptyResponse, {
        ttl: 3600, // 1 hour in seconds
        tags: [
          'standings',
          `season-${season}`,
          conference ? `conference-${conference}` : '',
          division ? `division-${division}` : '',
          team ? `team-${team}` : '',
          league ? `league-${league}` : '',
        ].filter(Boolean),
      });

      return createCorsResponse({
        success: true,
        data: emptyResponse,
      });
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

    return createCorsResponse(responseData);
  } catch (error) {
    logger.error('Error fetching standings', {
      error,
    });

    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/standings',
    });

    return createCorsResponse({ success: false, error: 'Internal Server Error' }, 500);
  }
}

export const runtime = 'nodejs';
