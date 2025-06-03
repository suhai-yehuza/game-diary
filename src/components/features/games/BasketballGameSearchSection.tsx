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

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { GET_GAMES } from '@/lib/graphql/queries';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/utils/index.format';
import { getCurrentSeason } from '@/lib/utils/index.time';

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

interface GameTeams {
  home: {
    id: string;
    nickname: string;
    code: string;
    logo: string;
    name: string;
  };
  visitors: {
    id: string;
    nickname: string;
    code: string;
    logo: string;
    name: string;
  };
}

interface GameScores {
  home: {
    points: number;
  };
  visitors: {
    points: number;
  };
}

interface GamePeriods {
  current: number;
  total: number;
}

interface Game {
  id: string;
  date: {
    start: string;
    end?: string;
    duration?: string;
  };
  status: {
    clock?: string;
    halftime?: boolean;
    long: string;
    short: string;
  };
  arena: {
    name: string;
    city: string;
    state: string;
    country: string;
  };
  teams: GameTeams;
  scores: GameScores;
  league: string;
  season: number;
  stage: number;
  periods: GamePeriods;
  officials: string[];
  timesTied?: number;
  leadChanges?: number;
  nugget?: string;
  createdAt: string;
  updatedAt: string;
}

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
  return (
    <Badge variant="outline" className="text-xs py-0.5 px-1.5">
      {format(new Date(status), 'h:mm a')}
    </Badge>
  );
};

// Store cursor information for each page
interface PageCursor {
  startCursor: string | null;
  endCursor: string | null;
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
  const [pageCursors, setPageCursors] = useState<Record<number, PageCursor>>({});
  const pageSize = 12;

  // Build filters object
  const filters = useMemo(() => {
    const filterObj: Record<string, string | number> = {};

    if (selectedSeason !== 'all') {
      filterObj.season = parseInt(selectedSeason);
    }

    if (selectedStatus !== 'all') {
      filterObj.status = selectedStatus.toUpperCase();
    }

    if (selectedTeam !== 'all') {
      filterObj.teamId = selectedTeam;
    }

    return filterObj;
  }, [selectedSeason, selectedStatus, selectedTeam]);

  // Get cursor for current page
  const currentCursor = currentPage > 1 ? pageCursors[currentPage - 1]?.endCursor : null;

  // Query only current page data
  const {
    data: gamesData,
    loading: gamesLoading,
    error: gamesError,
  } = useQuery(GET_GAMES, {
    variables: {
      first: pageSize,
      after: currentCursor,
      filters,
    },
    notifyOnNetworkStatusChange: true,
  });

  // Store cursor information when data changes
  useEffect(() => {
    if (gamesData?.games?.pageInfo) {
      setPageCursors(prev => ({
        ...prev,
        [currentPage]: {
          startCursor: gamesData.games.pageInfo.startCursor,
          endCursor: gamesData.games.pageInfo.endCursor,
        },
      }));
    }
  }, [gamesData, currentPage]);

  const games = useMemo(
    () => gamesData?.games?.edges?.map((edge: GameEdge) => edge.node) || [],
    [gamesData?.games?.edges]
  );
  const totalCount = gamesData?.games?.totalCount || 0;
  const hasNextPage = gamesData?.games?.pageInfo?.hasNextPage || false;
  const totalPages = Math.ceil(totalCount / pageSize);

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

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return;
      setCurrentPage(page);
    },
    [currentPage, totalPages]
  );

  const clearFilters = () => {
    setSearchText('');
    setSelectedSeason(currentYear.toString());
    setSelectedStatus('all');
    setSelectedTeam('all');
    setSortBy('date');
    setCurrentPage(1);
    setPageCursors({});
  };

  const hasActiveFilters =
    searchText ||
    selectedSeason !== currentYear.toString() ||
    selectedStatus !== 'all' ||
    selectedTeam !== 'all';

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setPageCursors({});
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
            Found {formatCount(totalCount)} {totalCount === 1 ? 'game' : 'games'}
            {searchText && ` (showing ${sortedGames.length} on this page matching "${searchText}")`}
          </p>
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {formatCount(totalPages)}
          </p>
        </div>
      )}

      {/* Games Grid */}
      {gamesLoading ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                src={game.teams.visitors.logo}
                                alt={game.teams.visitors.name || 'Away'}
                                fill
                                sizes="32px"
                                className="object-contain"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">
                              {game.teams?.visitors?.nickname || 'Away Team'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {game.teams?.visitors?.name || ''}
                            </div>
                          </div>
                        </div>
                        {!isScheduled && (
                          <div className="text-xl font-bold">
                            {game.scores?.visitors?.points || 0}
                          </div>
                        )}
                      </div>

                      {/* Home Team */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {game.teams?.home?.logo && (
                            <div className="relative h-8 w-8 flex-shrink-0">
                              <Image
                                src={game.teams.home.logo}
                                alt={game.teams.home.name || 'Home'}
                                fill
                                sizes="32px"
                                className="object-contain"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">
                              {game.teams?.home?.nickname || 'Home Team'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {game.teams?.home?.name || ''}
                            </div>
                          </div>
                        </div>
                        {!isScheduled && (
                          <div className="text-xl font-bold">{game.scores?.home?.points || 0}</div>
                        )}
                      </div>
                    </div>

                    {/* Arena */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">
                        {game.arena.name}, {game.arena.city}
                      </span>
                    </div>

                    {/* Game Stats */}
                    {game.status.long === 'Finished' && (game.timesTied || game.leadChanges) && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {game.timesTied !== undefined && <span>Times Tied: {game.timesTied}</span>}
                        {game.leadChanges !== undefined && (
                          <span>Lead Changes: {game.leadChanges}</span>
                        )}
                      </div>
                    )}

                    {/* Live Game Clock */}
                    {isLive && game.status.clock && (
                      <div className="flex items-center justify-center py-2">
                        <Badge
                          variant="destructive"
                          className="animate-pulse text-xs py-0.5 px-1.5"
                        >
                          {game.status.clock} - Q{game.periods?.current || 1}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-8 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || gamesLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i < 5 ? i + 1 : i === 5 ? -1 : totalPages;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = i === 0 ? 1 : i === 1 ? -1 : totalPages - 6 + i;
                  } else {
                    pageNum =
                      i === 0
                        ? 1
                        : i === 1
                          ? -1
                          : i === 5
                            ? -1
                            : i === 6
                              ? totalPages
                              : currentPage - 3 + i;
                  }

                  if (pageNum === -1) {
                    return (
                      <span key={i} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    );
                  }

                  return (
                    <Button
                      key={i}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className="w-9 h-9 p-0"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={gamesLoading}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || !hasNextPage || gamesLoading}
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
