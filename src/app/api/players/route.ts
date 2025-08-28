import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  getPlayers,
  getUniqueColleges,
  getUniqueCountries,
  getUniquePositions,
  type IPlayerFilters,
} from '@/lib/db/services/players.service';
import type { IPlayersApiResponse } from '@/lib/types';

/**
 * GET /api/players
 * Fetch NBA players from database with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get filter parameters
    const searchTerm = searchParams.get('search') || undefined;
    const positionFilter = searchParams.get('position') || undefined;
    const teamFilter = searchParams.get('team') || undefined;
    const collegeFilter = searchParams.get('college') || undefined;
    const countryFilter = searchParams.get('country') || undefined;
    const sortBy = (searchParams.get('sortBy') as IPlayerFilters['sortBy']) || 'name';
    const sortDirection =
      (searchParams.get('sortDirection') as IPlayerFilters['sortDirection']) || 'asc';

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Special endpoint for filter options
    const getOptions = searchParams.get('options');
    if (getOptions === 'true') {
      const [colleges, countries, positions] = await Promise.all([
        getUniqueColleges(),
        getUniqueCountries(),
        getUniquePositions(),
      ]);

      return NextResponse.json({
        colleges,
        countries,
        positions,
      });
    }

    // Build filters
    const filters: IPlayerFilters = {
      searchTerm,
      positionFilter,
      teamFilter,
      collegeFilter,
      countryFilter,
      sortBy,
      sortDirection,
      limit,
      offset,
    };

    // Fetch players from database
    const { players, total } = await getPlayers(filters);

    // Format response to match external API structure
    const response: IPlayersApiResponse = {
      get: 'players',
      parameters: {
        league: 'standard',
        season: '2024',
        ...(searchTerm && { search: searchTerm }),
        ...(positionFilter && { position: positionFilter }),
        ...(teamFilter && { team: teamFilter }),
        ...(collegeFilter && { college: collegeFilter }),
      },
      errors: [],
      results: total,
      response: players,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/players GET:', error);

    return NextResponse.json(
      {
        get: 'players',
        parameters: {},
        errors: ['Internal server error'],
        results: 0,
        response: [],
      },
      { status: 500 }
    );
  }
}
