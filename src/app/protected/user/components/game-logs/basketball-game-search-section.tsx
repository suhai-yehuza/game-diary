'use client';

import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import { Calendar, Clock, Search, MapPin, ArrowUpDown, X } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';

import { Badge } from '@src/app/components/ui/badge';
import { Button } from '@src/app/components/ui/button';
import { Card, CardContent, CardHeader } from '@src/app/components/ui/card';
import { Input } from '@src/app/components/ui/input';
import { Label } from '@src/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/app/components/ui/select';
import { Skeleton } from '@src/app/components/ui/skeleton';
import { API_CONFIG } from '@src/lib/config/api.config';
import { GET_GAMES } from '@src/lib/graphql/queries';
import type { IGame, IGameEdge, IGameQueryResponse } from '@src/lib/types';
import { formatCount } from '@src/lib/utils/format';
import { getCurrentSeason, getSeasonRange, createSeasonOptions } from '@src/lib/utils/time';

// Loading skeleton component
const GameCardSkeleton = () => (
  <Card className="w-full">
    <CardHeader className="p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-24" />
      </div>
    </CardHeader>
    <CardContent className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export function BasketballGameSearchSection() {
  const currentYear = getCurrentSeason();
  const seasonRange = getSeasonRange(currentYear - 2014); // Show seasons from 2015 to current
  const seasonOptions = createSeasonOptions(seasonRange);

  const [searchText, setSearchText] = useState('');
  const [selectedSeason, setSelectedSeason] = useState(currentYear.toString());
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageData, setPageData] = useState<{ [key: number]: IGame[] }>({});
  const pageSize = API_CONFIG.pagination.DEFAULT_PAGE_SIZE;

  // Build filters object
  const filters = useMemo(() => {
    const filterObj: Record<string, string | number> = {};

    if (selectedSeason !== 'all') {
      filterObj.season = parseInt(selectedSeason);
    }

    if (selectedStatus !== 'all') {
      filterObj.status =
        selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1).toLowerCase();
    }

    if (selectedTeam !== 'all') {
      filterObj.teamId = selectedTeam;
    }

    return filterObj;
  }, [selectedSeason, selectedStatus, selectedTeam]);

  // Query only current page data
  const {
    data: gamesData,
    loading: gamesLoading,
    error: gamesError,
  } = useQuery<IGameQueryResponse>(GET_GAMES, {
    variables: {
      first: pageSize,
      after: null,
      filters,
    },
    notifyOnNetworkStatusChange: false,
    fetchPolicy: 'cache-first',
    onCompleted: result => {
      if (result?.games?.edges) {
        const games = result.games.edges.map((edge: IGameEdge) => edge.node);
        setPageData(prev => ({ ...prev, 1: games }));
      }
    },
  });

  // Current page games - use cached data if available, otherwise fall back to query data
  const games = useMemo(
    () =>
      pageData[currentPage] ||
      (currentPage === 1 ? gamesData?.games?.edges?.map((edge: IGameEdge) => edge.node) : []) ||
      [],
    [pageData, currentPage, gamesData]
  );

  // Filter games based on search text
  const filteredGames = useMemo(() => {
    if (!searchText) return games;

    const searchLower = searchText.toLowerCase();
    return games.filter(game => {
      const visitorTeam = game.teams.visitors.name.toLowerCase();
      const homeTeam = game.teams.home.name.toLowerCase();
      const arena =
        typeof game.arena === 'string' ? game.arena : game.arena?.name?.toLowerCase() || '';
      const city = typeof game.arena === 'string' ? '' : game.arena?.city?.toLowerCase() || '';

      return (
        visitorTeam.includes(searchLower) ||
        homeTeam.includes(searchLower) ||
        arena.includes(searchLower) ||
        city.includes(searchLower)
      );
    });
  }, [games, searchText]);

  // Sort games based on selected sort option
  const sortedGames = useMemo(() => {
    return [...filteredGames].sort((a, b) => {
      const dateA = new Date(typeof a.date === 'string' ? a.date : a.date.start);
      const dateB = new Date(typeof b.date === 'string' ? b.date : b.date.start);

      switch (sortBy) {
        case 'date':
          return dateB.getTime() - dateA.getTime();
        case 'score': {
          const scoreA = (a.scores?.visitors?.points || 0) + (a.scores?.home?.points || 0);
          const scoreB = (b.scores?.visitors?.points || 0) + (b.scores?.home?.points || 0);
          return scoreB - scoreA;
        }
        default:
          return 0;
      }
    });
  }, [filteredGames, sortBy]);

  const clearFilters = () => {
    setSearchText('');
    setSelectedSeason(currentYear.toString());
    setSelectedStatus('all');
    setSelectedTeam('all');
    setSortBy('date');
    setCurrentPage(1);
    setPageData({});
  };

  const hasActiveFilters =
    searchText ||
    selectedSeason !== currentYear.toString() ||
    selectedStatus !== 'all' ||
    selectedTeam !== 'all';

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setPageData({});
  }, [selectedSeason, selectedStatus, selectedTeam, sortBy]);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by team, arena, or city..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="pl-10"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Note: Search filters the current page only. Use filters for more comprehensive search.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Season Filter */}
          <div className="space-y-2">
            <Label className="text-sm">Season</Label>
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent>
                {seasonOptions.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                    {option.isCurrent && ' (Current)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm">Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Filter */}
          <div className="space-y-2">
            <Label className="text-sm">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="score">Score</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10 mt-auto">
              <X className="mr-2 h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      {!gamesLoading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {gamesData?.games?.totalCount && gamesData?.games?.totalCount > 0 ? (
              <>
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, gamesData?.games?.totalCount)} of{' '}
                {formatCount(gamesData?.games?.totalCount)}{' '}
                {gamesData?.games?.totalCount === 1 ? 'game' : 'games'}
                {searchText &&
                  ` (showing ${sortedGames.length} on this page matching "${searchText}")`}
              </>
            ) : (
              <>
                Found {formatCount(gamesData?.games?.totalCount ?? 0)}{' '}
                {gamesData?.games?.totalCount === 1 ? 'game' : 'games'}
                {searchText &&
                  ` (showing ${sortedGames.length} on this page matching "${searchText}")`}
              </>
            )}
          </p>
          {(gamesData?.games?.totalCount ?? 0) > pageSize && (
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {Math.ceil((gamesData?.games?.totalCount ?? 0) / pageSize)}
            </p>
          )}
        </div>
      )}

      {/* Pagination Info */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          {gamesData?.games?.totalCount !== undefined ? (
            <>
              Showing {sortedGames.length} of {formatCount(gamesData.games.totalCount)} games
              {searchText && ` (filtered by "${searchText}")`}
            </>
          ) : (
            'No games found'
          )}
        </p>
        {gamesData?.games?.pageInfo?.hasNextPage && (
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={gamesLoading}
          >
            Load More
          </Button>
        )}
      </div>

      {/* Game List */}
      <div className="space-y-4">
        {gamesLoading ? (
          // Loading state
          Array.from({ length: 3 }).map((_, i) => <GameCardSkeleton key={i} />)
        ) : gamesError ? (
          // Error state
          <div className="text-center text-red-500">
            Error loading games. Please try again later.
          </div>
        ) : sortedGames.length === 0 ? (
          // Empty state
          <div className="text-center text-muted-foreground">No games found.</div>
        ) : (
          // Game list
          sortedGames.map(game => (
            <Card key={game.id} className="w-full">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {format(
                        new Date(typeof game.date === 'string' ? game.date : game.date.start),
                        'MMM d, yyyy'
                      )}
                    </span>
                  </div>
                  <Badge
                    variant={
                      game.status.long === 'Finished'
                        ? 'secondary'
                        : game.status.long === 'Live'
                          ? 'destructive'
                          : 'default'
                    }
                  >
                    {game.status.long}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Teams */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{game.teams.visitors.name}</span>
                      <span className="text-muted-foreground">
                        {game.scores?.visitors?.points || 0}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{game.teams.home.name}</span>
                      <span className="text-muted-foreground">
                        {game.scores?.home?.points || 0}
                      </span>
                    </div>
                  </div>

                  {/* Arena */}
                  {game.arena && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {typeof game.arena === 'string'
                          ? game.arena
                          : `${game.arena.name}, ${game.arena.city}${game.arena.state ? `, ${game.arena.state}` : ''}`}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
