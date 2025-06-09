'use client';

import { useQuery } from '@apollo/client';
import { format, isAfter } from 'date-fns';
import {
  Calendar,
  Clock,
  Search,
  Trophy,
  X,
  MapPin,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState, useCallback, useMemo, useEffect } from 'react';

import { Badge } from '@src/components/ui/badge';
import { Button } from '@src/components/ui/button';
import { Card, CardContent, CardHeader } from '@src/components/ui/card';
import { Input } from '@src/components/ui/input';
import { Label } from '@src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/components/ui/select';
import { Skeleton } from '@src/components/ui/skeleton';
import { API_CONFIG } from '@src/lib/config/api.config';
import { GET_GAMES } from '@src/lib/graphql/queries';
import type { Game } from '@src/lib/types/consolidated.types';
import { cn } from '@src/lib/utils';
import { formatCount } from '@src/lib/utils/format';
import { getCurrentSeason } from '@src/lib/utils/time';

// Loading skeleton component
const GameSkeleton = () => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-20" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-6 w-8" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-6 w-8" />
        </div>
        <Skeleton className="h-4 w-full" />
      </div>
    </CardContent>
  </Card>
);

type GameEdge = { cursor: string; node: Game };

const getStatusBadge = (status: string, isScheduled?: boolean, isFinished?: boolean) => {
  const statusLower = status.toLowerCase();

  if (statusLower.includes('live') || statusLower === 'in play') {
    return (
      <Badge className="bg-red-500 text-white border-red-500 text-xs py-0.5 px-1.5">
        <div className="flex items-center gap-0.5">
          <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      </Badge>
    );
  }

  // Don't show Final badge here anymore since it's shown on the right
  if (isFinished) {
    return null;
  }

  // For scheduled games, show the time
  if (isScheduled) {
    return (
      <Badge variant="outline" className="text-xs py-0.5 px-1.5">
        {format(new Date(status), 'h:mm a')}
      </Badge>
    );
  }

  // For other statuses, show the status
  return (
    <Badge variant="outline" className="text-xs py-0.5 px-1.5">
      {status}
    </Badge>
  );
};

// Utility to ensure logo URLs use https
function ensureHttps(url?: string) {
  if (!url) return url;
  return url.replace(/^http:\/\//, 'https://');
}

export function BasketballGameSearchSection() {
  const router = useRouter();
  const currentYear = getCurrentSeason();

  const [searchText, setSearchText] = useState('');
  const [selectedSeason, setSelectedSeason] = useState(currentYear.toString());
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const [pageData, setPageData] = useState<{ [key: number]: Game[] }>({});
  const [cursors, setCursors] = useState<{ [key: number]: string | null }>({ 1: null });
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
    fetchMore,
  } = useQuery(GET_GAMES, {
    variables: {
      first: pageSize,
      after: null,
      filters,
    },
    notifyOnNetworkStatusChange: false,
    fetchPolicy: 'cache-first',
    onCompleted: result => {
      if (result?.games?.edges) {
        const games = result.games.edges.map((edge: GameEdge) => edge.node);
        setPageData(prev => ({ ...prev, 1: games }));
        if (result.games.pageInfo?.endCursor) {
          setCursors(prev => ({ ...prev, 2: result.games.pageInfo.endCursor }));
        }
      }
    },
  });

  // Current page games - use cached data if available, otherwise fall back to query data
  const games = useMemo(
    () =>
      pageData[currentPage] ||
      (currentPage === 1 ? gamesData?.games?.edges?.map((edge: GameEdge) => edge.node) : []) ||
      [],
    [pageData, currentPage, gamesData]
  );
  const totalCount = gamesData?.games?.totalCount || 0;
  const hasNextPage = gamesData?.games?.pageInfo?.hasNextPage || false;
  const hasPreviousPage = currentPage > 1;

  // Pre-fetch next page data when user hovers over Next button
  const prefetchNextPage = useCallback(async () => {
    const nextPage = currentPage + 1;
    const nextCursor = cursors[nextPage];

    if (!pageData[nextPage] && nextCursor && hasNextPage) {
      try {
        await fetchMore({
          variables: {
            first: pageSize,
            after: nextCursor,
            filters,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (fetchMoreResult?.games?.edges) {
              const games = fetchMoreResult.games.edges.map((edge: GameEdge) => edge.node);
              setPageData(prevData => ({ ...prevData, [nextPage]: games }));

              if (fetchMoreResult.games.pageInfo?.endCursor) {
                setCursors(prevCursors => ({
                  ...prevCursors,
                  [nextPage + 1]: fetchMoreResult.games.pageInfo.endCursor,
                }));
              }
            }
            return prev; // Don't update the main query
          },
        });
      } catch (error) {
        console.error('Error prefetching next page:', error);
      }
    }
  }, [currentPage, cursors, pageData, hasNextPage, fetchMore, pageSize, filters]);

  const handlePageChange = useCallback(
    async (page: number) => {
      if (gamesLoading || isNavigating) return;

      const isNextPage = page > currentPage;

      // If we already have the data cached, switch immediately
      if (pageData[page]) {
        setCurrentPage(page);
        return;
      }

      setIsNavigating(true);

      try {
        if (isNextPage && hasNextPage) {
          const cursor = cursors[page];
          if (cursor) {
            await fetchMore({
              variables: {
                first: pageSize,
                after: cursor,
                filters,
              },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (fetchMoreResult?.games?.edges) {
                  const games = fetchMoreResult.games.edges.map((edge: GameEdge) => edge.node);
                  setPageData(prevData => ({ ...prevData, [page]: games }));

                  if (fetchMoreResult.games.pageInfo?.endCursor) {
                    setCursors(prevCursors => ({
                      ...prevCursors,
                      [page + 1]: fetchMoreResult.games.pageInfo.endCursor,
                    }));
                  }
                }
                return prev;
              },
            });
          }
        } else if (!isNextPage && page === currentPage - 1) {
          // For previous page, calculate cursor and fetch
          const targetOffset = (page - 1) * pageSize;
          const targetCursor = targetOffset > 0 ? btoa(targetOffset.toString()) : null;

          await fetchMore({
            variables: {
              first: pageSize,
              after: targetCursor,
              filters,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (fetchMoreResult?.games?.edges) {
                const games = fetchMoreResult.games.edges.map((edge: GameEdge) => edge.node);
                setPageData(prevData => ({ ...prevData, [page]: games }));
              }
              return prev;
            },
          });
        }

        setCurrentPage(page);
      } catch (error) {
        console.error('Error navigating pages:', error);
      } finally {
        setIsNavigating(false);
      }
    },
    [
      currentPage,
      pageData,
      cursors,
      gamesLoading,
      hasNextPage,
      fetchMore,
      pageSize,
      filters,
      isNavigating,
    ]
  );

  // Filter games by search text (client-side for current page only)
  const filteredGames = useMemo(() => {
    if (!searchText.trim()) return games;

    const searchLower = searchText.toLowerCase();
    return games.filter((game: Game) => {
      const homeTeam = game.teams?.home?.nickname?.toLowerCase() || '';
      const awayTeam = game.teams?.visitors?.nickname?.toLowerCase() || '';
      const arena = game.arena?.name?.toLowerCase() || '';
      const city = game.arena?.city?.toLowerCase() || '';

      return (
        homeTeam.includes(searchLower) ||
        awayTeam.includes(searchLower) ||
        arena.includes(searchLower) ||
        city.includes(searchLower)
      );
    });
  }, [games, searchText]);

  // Sort games
  const sortedGames = useMemo(() => {
    const sorted = [...filteredGames];

    if (sortBy === 'date') {
      sorted.sort((a: Game, b: Game) => {
        return new Date(b.date.start).getTime() - new Date(a.date.start).getTime();
      });
    } else if (sortBy === 'score') {
      sorted.sort((a: Game, b: Game) => {
        const totalA = (a.scores?.home?.points || 0) + (a.scores?.visitors?.points || 0);
        const totalB = (b.scores?.home?.points || 0) + (b.scores?.visitors?.points || 0);
        return totalB - totalA;
      });
    }

    return sorted;
  }, [filteredGames, sortBy]);

  const clearFilters = () => {
    setSearchText('');
    setSelectedSeason(currentYear.toString());
    setSelectedStatus('all');
    setSelectedTeam('all');
    setSortBy('date');
    setCurrentPage(1);
    setPageData({});
    setCursors({ 1: null });
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
    setCursors({ 1: null });
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
                {/* Show seasons from 2015 to current year */}
                {Array.from({ length: currentYear - 2014 }, (_, i) => currentYear - i).map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}-{(year + 1).toString().slice(2)}
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
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All games</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <Label className="text-sm">Sort by</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="score">Total Score</SelectItem>
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
            {totalCount > 0 ? (
              <>
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, totalCount)} of {formatCount(totalCount)}{' '}
                {totalCount === 1 ? 'game' : 'games'}
                {searchText &&
                  ` (showing ${sortedGames.length} on this page matching "${searchText}")`}
              </>
            ) : (
              <>
                Found {formatCount(totalCount)} {totalCount === 1 ? 'game' : 'games'}
                {searchText &&
                  ` (showing ${sortedGames.length} on this page matching "${searchText}")`}
              </>
            )}
          </p>
          {totalCount > pageSize && (
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {Math.ceil(totalCount / pageSize)}
            </p>
          )}
        </div>
      )}

      {/* Games Grid */}
      {gamesLoading && !gamesData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(pageSize)].map((_, i) => (
            <GameSkeleton key={i} />
          ))}
        </div>
      ) : gamesError ? (
        <Card className="border-destructive/50">
          <CardContent className="py-8">
            <div className="text-center text-destructive">
              Error loading games: {gamesError.message}
            </div>
          </CardContent>
        </Card>
      ) : sortedGames.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No games found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {searchText && games.length > 0
                ? 'No games on this page match your search. Try navigating to other pages or clearing the search.'
                : hasActiveFilters
                  ? 'Try adjusting your filters to find more games.'
                  : 'No games are available for the selected criteria.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div
            className={cn(
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-200',
              isNavigating && 'opacity-60'
            )}
          >
            {sortedGames.map((game: Game) => {
              const gameDate = new Date(game.date.start);
              const isLive =
                game.status.long.toLowerCase().includes('live') ||
                game.status.long.toLowerCase() === 'in play';
              const isScheduled =
                game.status.long.toLowerCase() === 'scheduled' || isAfter(gameDate, new Date());
              const isFinished = game.status.long.toLowerCase() === 'finished';

              return (
                <Card
                  key={game.id}
                  className={cn(
                    'overflow-hidden transition-all duration-200 hover:shadow-lg',
                    isLive && 'border-red-500 ring-2 ring-red-500/20'
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <div className="text-sm text-muted-foreground">
                          {format(gameDate, 'MMM d, yyyy')}
                        </div>
                        <div className="mt-1">
                          {getStatusBadge(
                            isScheduled ? game.date.start : game.status.long,
                            isScheduled,
                            isFinished
                          )}
                        </div>
                      </div>
                      {/* Scheduled Badge */}
                      {isScheduled && (
                        <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 gap-0.5 shrink-0 text-xs py-0.5 px-1.5">
                          <Calendar className="h-2.5 w-2.5" />
                          Scheduled
                        </Badge>
                      )}
                      {/* Final Badge */}
                      {isFinished && (
                        <Badge variant="secondary" className="shrink-0 text-xs py-0.5 px-1.5">
                          Final
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent
                    className="space-y-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => router.push(`/sports/nba/games/${game.id}`)}
                  >
                    {/* Teams */}
                    <div className="space-y-2">
                      {/* Away Team */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {game.teams?.visitors?.logo && (
                            <div className="relative h-8 w-8 flex-shrink-0">
                              <Image
                                src={ensureHttps(game.teams.visitors.logo) || ''}
                                alt={game.teams.visitors.name || 'Away'}
                                fill
                                sizes="32px"
                                className="object-contain"
                              />
                            </div>
                          )}
                          <span className="font-medium text-sm">
                            {game.teams?.visitors?.nickname || game.teams?.visitors?.name}
                          </span>
                        </div>
                        <span className="font-bold text-lg">
                          {game.scores?.visitors?.points || 0}
                        </span>
                      </div>

                      {/* Home Team */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {game.teams?.home?.logo && (
                            <div className="relative h-8 w-8 flex-shrink-0">
                              <Image
                                src={ensureHttps(game.teams.home.logo) || ''}
                                alt={game.teams.home.name || 'Home'}
                                fill
                                sizes="32px"
                                className="object-contain"
                              />
                            </div>
                          )}
                          <span className="font-medium text-sm">
                            {game.teams?.home?.nickname || game.teams?.home?.name}
                          </span>
                        </div>
                        <span className="font-bold text-lg">{game.scores?.home?.points || 0}</span>
                      </div>
                    </div>

                    {/* Game Details */}
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {game.arena?.name}, {game.arena?.city}
                        </span>
                      </div>
                      {game.timesTied !== undefined && game.leadChanges !== undefined && (
                        <div className="flex items-center gap-4">
                          <span>Times tied: {game.timesTied}</span>
                          <span>Lead changes: {game.leadChanges}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {(hasNextPage || hasPreviousPage) && (
            <div className="flex items-center justify-center mt-8 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPreviousPage || isNavigating}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2 px-4">
                <span className="text-sm text-muted-foreground">
                  {isNavigating ? 'Loading...' : `Page ${currentPage}`}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                onMouseEnter={prefetchNextPage}
                disabled={!hasNextPage || isNavigating}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
