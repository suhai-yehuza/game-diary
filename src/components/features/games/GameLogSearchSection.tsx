'use client';

import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import { 
  Calendar,
  Clock,
  Filter,
  MapPin,
  Search,
  SortDesc,
  Star,
  Tag,
  Trophy,
  Tv,
  Users,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useCallback, useMemo, useEffect } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { StarRating } from '@/components/ui/star-rating';
import { GET_GAME_LOGS } from '@/lib/graphql/queries';
import { CLASSIFICATION } from '@/lib/types/config.types';
import { GameLog } from '@/lib/types/generated/graphql';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/utils/index.format';

// Constants for GameLogSortBy
const GameLogSortBy = {
  CreatedAt: 'CREATED_AT' as const,
  WatchedDate: 'WATCHED_DATE' as const,
  Rating: 'RATING' as const,
};

// Constants for SortDirection
const SortDirection = {
  Asc: 'ASC' as const,
  Desc: 'DESC' as const,
};

type GameLogSortByType = typeof GameLogSortBy[keyof typeof GameLogSortBy];
type SortDirectionType = typeof SortDirection[keyof typeof SortDirection];

// Loading skeleton component
const GameLogSkeleton = () => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-5 w-24" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-20 w-full mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </CardContent>
  </Card>
);

interface GameLogSearchSectionProps {
  userId?: string;
  initialSearchText?: string;
}

const getClassificationStyles = (classification: string) => {
  switch (classification) {
    case CLASSIFICATION.PUBLIC:
      return {
        variant: 'default' as const,
        className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
        icon: Users,
      };
    case CLASSIFICATION.PROTECTED:
      return {
        variant: 'secondary' as const,
        className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
        icon: Users,
      };
    case CLASSIFICATION.PRIVATE:
      return {
        variant: 'destructive' as const,
        className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
        icon: Users,
      };
    default:
      return {
        variant: 'default' as const,
        className: '',
        icon: Users,
      };
  }
};

// Store cursor information for each page
interface PageCursor {
  startCursor: string | null;
  endCursor: string | null;
}

export function GameLogSearchSection({ userId, initialSearchText = '' }: GameLogSearchSectionProps) {
  const router = useRouter();
  const [searchText, setSearchText] = useState(initialSearchText);
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [selectedSetting, setSelectedSetting] = useState<string>('all');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [hasNotes, setHasNotes] = useState<string>('all');
  const [sortBy, setSortBy] = useState<GameLogSortByType>(GameLogSortBy.CreatedAt);
  const [sortDirection, setSortDirection] = useState<SortDirectionType>(SortDirection.Desc);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<Record<number, PageCursor>>({});
  const pageSize = 12;

  // Build filters object
  const filters = useMemo(() => {
    const filterObj: any = {};
    
    if (searchText) filterObj.searchText = searchText;
    if (userId) filterObj.userId = userId;
    
    if (selectedRating !== 'all') {
      const rating = parseInt(selectedRating);
      filterObj.minRating = rating;
      filterObj.maxRating = rating;
    }
    
    if (selectedSetting !== 'all') {
      filterObj.watchedSetting = selectedSetting;
    }
    
    if (selectedClassification !== 'all') {
      filterObj.classification = selectedClassification;
    }
    
    if (hasNotes !== 'all') {
      filterObj.hasNotes = hasNotes === 'yes';
    }
    
    filterObj.sortBy = sortBy;
    filterObj.sortDirection = sortDirection;
    
    return filterObj;
  }, [searchText, userId, selectedRating, selectedSetting, selectedClassification, hasNotes, sortBy, sortDirection]);

  // Get cursor for current page
  const currentCursor = currentPage > 1 ? pageCursors[currentPage - 1]?.endCursor : null;

  // Query only current page data
  const { data, loading, error } = useQuery(GET_GAME_LOGS, {
    variables: {
      first: pageSize,
      after: currentCursor,
      filters,
    },
    notifyOnNetworkStatusChange: true,
  });

  // Store cursor information when data changes
  useEffect(() => {
    if (data?.gameLogs?.pageInfo) {
      setPageCursors(prev => ({
        ...prev,
        [currentPage]: {
          startCursor: data.gameLogs.pageInfo.startCursor,
          endCursor: data.gameLogs.pageInfo.endCursor,
        }
      }));
    }
  }, [data, currentPage]);

  const gameLogs = data?.gameLogs?.edges?.map((edge: any) => edge.node) || [];
  const totalCount = data?.gameLogs?.totalCount || 0;
  const hasNextPage = data?.gameLogs?.pageInfo?.hasNextPage || false;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return;
      setCurrentPage(page);
    },
    [currentPage, totalPages]
  );

  const handleCardClick = (e: React.MouseEvent, gameLogId: string) => {
    e.preventDefault();
    router.push(`/protected/user/game-logs/${gameLogId}`);
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedRating('all');
    setSelectedSetting('all');
    setSelectedClassification('all');
    setHasNotes('all');
    setSortBy(GameLogSortBy.CreatedAt);
    setSortDirection(SortDirection.Desc);
    setCurrentPage(1);
    setPageCursors({});
  };

  const hasActiveFilters = searchText || selectedRating !== 'all' || selectedSetting !== 'all' || 
    selectedClassification !== 'all' || hasNotes !== 'all';

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setPageCursors({});
  }, [searchText, selectedRating, selectedSetting, selectedClassification, hasNotes, sortBy, sortDirection]);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search game logs by teams, notes, tags, or location..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Rating Filter */}
          <div className="space-y-2">
            <Label className="text-sm">Rating</Label>
            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger className="w-[140px]">
                <Star className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ratings</SelectItem>
                <SelectItem value="5">5 stars</SelectItem>
                <SelectItem value="4">4 stars</SelectItem>
                <SelectItem value="3">3 stars</SelectItem>
                <SelectItem value="2">2 stars</SelectItem>
                <SelectItem value="1">1 star</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Setting Filter */}
          <div className="space-y-2">
            <Label className="text-sm">Setting</Label>
            <Select value={selectedSetting} onValueChange={setSelectedSetting}>
              <SelectTrigger className="w-[140px]">
                <Tv className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All settings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All settings</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="venue">Venue</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Classification Filter */}
          <div className="space-y-2">
            <Label className="text-sm">Visibility</Label>
            <Select value={selectedClassification} onValueChange={setSelectedClassification}>
              <SelectTrigger className="w-[140px]">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All visibility</SelectItem>
                <SelectItem value={CLASSIFICATION.PUBLIC}>Public</SelectItem>
                <SelectItem value={CLASSIFICATION.PROTECTED}>Protected</SelectItem>
                <SelectItem value={CLASSIFICATION.PRIVATE}>Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Has Notes Filter */}
          <div className="space-y-2">
            <Label className="text-sm">Notes</Label>
            <Select value={hasNotes} onValueChange={setHasNotes}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All logs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All logs</SelectItem>
                <SelectItem value="yes">With notes</SelectItem>
                <SelectItem value="no">Without notes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <Label className="text-sm">Sort by</Label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as GameLogSortByType)}>
              <SelectTrigger className="w-[160px]">
                <SortDesc className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={GameLogSortBy.CreatedAt}>Date posted</SelectItem>
                <SelectItem value={GameLogSortBy.WatchedDate}>Date watched</SelectItem>
                <SelectItem value={GameLogSortBy.Rating}>Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Direction */}
          <div className="space-y-2">
            <Label className="text-sm">Order</Label>
            <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as SortDirectionType)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SortDirection.Desc}>Newest first</SelectItem>
                <SelectItem value={SortDirection.Asc}>Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-10 mt-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Found {formatCount(totalCount)} game {totalCount === 1 ? 'log' : 'logs'}
            {searchText && ` matching "${searchText}"`}
          </p>
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {formatCount(totalPages)}
          </p>
        </div>
      )}

      {/* Game Logs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(pageSize)].map((_, i) => (
            <GameLogSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/50">
          <CardContent className="py-8">
            <div className="text-center text-destructive">
              Error loading game logs: {error.message}
            </div>
          </CardContent>
        </Card>
      ) : gameLogs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No game logs found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {hasActiveFilters 
                ? 'Try adjusting your filters to find more game logs.'
                : 'No game logs have been created yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameLogs.map((log: GameLog) => {
              const classificationStyles = getClassificationStyles(log.classification);
              const ClassificationIcon = classificationStyles.icon;
              
              return (
                <Card 
                  key={log.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 group"
                  onClick={(e) => handleCardClick(e, log.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      {/* User Info */}
                      <Link
                        href={`/protected/user/${log.userId}`}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={log.user?.imageUrl || undefined} />
                          <AvatarFallback className="text-xs">
                            {log.user?.firstName?.[0]}{log.user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {log.user?.firstName} {log.user?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{log.user?.username}
                          </p>
                        </div>
                      </Link>

                      {/* Classification Badge */}
                      <Badge 
                        variant={classificationStyles.variant}
                        className={cn("gap-1 shrink-0", classificationStyles.className)}
                      >
                        <ClassificationIcon className="h-3 w-3" />
                        {log.classification}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Game Teams */}
                    {log.game && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {log.game.teams?.visitors?.logo && (
                              <div className="relative h-6 w-6 flex-shrink-0">
                                <Image
                                  src={log.game.teams.visitors.logo}
                                  alt={log.game.teams.visitors.name || 'Away'}
                                  fill
                                  sizes="24px"
                                  className="object-contain"
                                />
                              </div>
                            )}
                            <span className="text-sm font-medium truncate">
                              {log.game.teams?.visitors?.nickname || 'Away'}
                            </span>
                            <span className="text-sm font-bold">
                              {log.game.scores?.visitors?.points || 0}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">vs</span>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-bold">
                              {log.game.scores?.home?.points || 0}
                            </span>
                            <span className="text-sm font-medium truncate">
                              {log.game.teams?.home?.nickname || 'Home'}
                            </span>
                            {log.game.teams?.home?.logo && (
                              <div className="relative h-6 w-6 flex-shrink-0">
                                <Image
                                  src={log.game.teams.home.logo}
                                  alt={log.game.teams.home.name || 'Home'}
                                  fill
                                  sizes="24px"
                                  className="object-contain"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Watch Details */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {log.ratingStars && (
                        <div className="flex items-center gap-1">
                          <StarRating rating={log.ratingStars} size="sm" />
                        </div>
                      )}
                      
                      {log.watchedDate && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{format(new Date(log.watchedDate), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      
                      {log.watchedSetting && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Tv className="h-3.5 w-3.5" />
                          <span className="capitalize">{log.watchedSetting}</span>
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    {log.watchedLocation && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{log.watchedLocation}</span>
                      </div>
                    )}

                    {/* Tags */}
                    {log.tags && log.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {log.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {log.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{log.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Notes Preview */}
                    {log.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {log.notes}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{log.reactions?.totalCount || 0} reactions</span>
                        <span>{log.comments?.totalCount || 0} comments</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(log.createdAt), 'MMM d')}</span>
                      </div>
                    </div>
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
                disabled={currentPage === 1 || loading}
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
                    pageNum = i === 0 ? 1 : i === 1 ? -1 : i === 5 ? -1 : i === 6 ? totalPages : currentPage - 3 + i;
                  }

                  if (pageNum === -1) {
                    return <span key={i} className="px-2 text-muted-foreground">...</span>;
                  }

                  return (
                    <Button
                      key={i}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className="w-9 h-9 p-0"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
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
                disabled={currentPage === totalPages || !hasNextPage || loading}
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