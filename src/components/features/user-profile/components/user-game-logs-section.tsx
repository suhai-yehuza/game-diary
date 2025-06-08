'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  Globe,
  Lock,
  MapPin,
  MessageSquare,
  Shield,
  Star,
  Trophy,
  Tv,
  Users2,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { GameLogActions } from '@src/components/features/games/game-log-actions';
import { Badge } from '@src/components/ui/badge';
import { Button } from '@src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@src/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/components/ui/select';
import { StarRating } from '@src/components/ui/star-rating';
import type { GameLog } from '@src/lib/types/generated/graphql';
import { cn } from '@src/lib/utils';

const classificationIcons = {
  Private: Lock,
  Protected: Shield,
  Public: Globe,
};

const classificationColors = {
  Private: 'text-red-500 bg-red-50 border-red-200',
  Protected: 'text-amber-500 bg-amber-50 border-amber-200',
  Public: 'text-green-500 bg-green-50 border-green-200',
};

interface UserGameLogsSectionProps {
  gameLogs: GameLog[];
  totalCount: number;
  selectedClassification: string;
  setSelectedClassification: (value: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  ITEMS_PER_PAGE: number;
  refetchUserGameLogs: () => void;
}

export function UserGameLogsSection({
  gameLogs,
  totalCount,
  selectedClassification,
  setSelectedClassification,
  currentPage,
  setCurrentPage,
  totalPages,
  refetchUserGameLogs,
}: UserGameLogsSectionProps) {
  const router = useRouter();
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const toggleNotesExpansion = (gameLogId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gameLogId)) {
        newSet.delete(gameLogId);
      } else {
        newSet.add(gameLogId);
      }
      return newSet;
    });
  };

  const handleGameLogClick = (gameLogId: string, event: React.MouseEvent | React.KeyboardEvent) => {
    // Prevent navigation if clicking on interactive elements
    const target = event.target as HTMLElement;
    const cardElement = event.currentTarget as HTMLElement;

    // Check for buttons, links, and other interactive elements, but exclude the card itself
    const isInteractiveElement =
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[data-interactive]') ||
      target.closest('.dropdown-menu') ||
      target.closest('[data-radix-popper-content-wrapper]') ||
      (target.closest('[role="button"]') && target.closest('[role="button"]') !== cardElement);

    if (!isInteractiveElement) {
      router.push(`/protected/user/game-logs/${gameLogId}`);
    }
  };

  // Calculate stats from game logs
  const averageRating =
    gameLogs.length > 0
      ? gameLogs.reduce((sum, log) => sum + log.ratingForGame, 0) / gameLogs.length
      : 0;

  const classificationCounts = gameLogs.reduce(
    (acc, log) => {
      acc[log.classification] = (acc[log.classification] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Game Logs</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <StarRating ratingForGame={Math.round(averageRating)} size="sm" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                gameLogs.filter(log => {
                  const logDate = new Date(log.createdAt);
                  const now = new Date();
                  return (
                    logDate.getMonth() === now.getMonth() &&
                    logDate.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4" />
        <Select value={selectedClassification} onValueChange={setSelectedClassification}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({totalCount})</SelectItem>
            <SelectItem value="Public">Public ({classificationCounts.Public || 0})</SelectItem>
            <SelectItem value="Protected">
              Protected ({classificationCounts.Protected || 0})
            </SelectItem>
            <SelectItem value="Private">Private ({classificationCounts.Private || 0})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Game Logs List */}
      <div className="space-y-4">
        {gameLogs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No game logs found</h3>
              <p className="text-muted-foreground text-center">
                {selectedClassification === 'all'
                  ? "This user hasn't logged any games yet."
                  : `No ${selectedClassification.toLowerCase()} game logs found.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          gameLogs.map(gameLog => {
            const game = gameLog.game;
            const homeTeam = game.teams?.home;
            const awayTeam = game.teams?.visitors;
            const homeScore = game.scores?.home?.points || 0;
            const awayScore = game.scores?.visitors?.points || 0;
            const isNotesExpanded = expandedNotes.has(gameLog.id);
            const shouldShowExpandButton = gameLog.notes && gameLog.notes.length > 150;

            const ClassificationIcon =
              classificationIcons[gameLog.classification as keyof typeof classificationIcons];

            return (
              <Card
                key={gameLog.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={e => handleGameLogClick(gameLog.id, e)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleGameLogClick(gameLog.id, e);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View game log for ${homeTeam?.name} vs ${awayTeam?.name}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {homeTeam?.logo && (
                          <Image
                            src={homeTeam.logo}
                            alt={`${homeTeam.name} logo`}
                            width={24}
                            height={24}
                            className="rounded"
                          />
                        )}
                        <span className="font-medium text-sm">
                          {homeTeam?.code || homeTeam?.name}
                        </span>
                        <span className="text-lg font-bold">{homeScore}</span>
                      </div>
                      <span className="text-muted-foreground">vs</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{awayScore}</span>
                        <span className="font-medium text-sm">
                          {awayTeam?.code || awayTeam?.name}
                        </span>
                        {awayTeam?.logo && (
                          <Image
                            src={awayTeam.logo}
                            alt={`${awayTeam.name} logo`}
                            width={24}
                            height={24}
                            className="rounded"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2" data-interactive>
                      <GameLogActions gameLog={gameLog} onSuccess={refetchUserGameLogs} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Game Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(game.date?.start || '').toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Tv className="h-4 w-4" />
                      {gameLog.watchedSetting}
                    </div>
                    {gameLog.watchedLocation && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {gameLog.watchedLocation}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(gameLog.createdAt))} ago
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <StarRating ratingForGame={gameLog.ratingForGame} size="sm" />
                    <span className="text-sm text-muted-foreground">{gameLog.ratingForGame}/5</span>
                  </div>

                  {/* Notes */}
                  {gameLog.notes && (
                    <div className="space-y-2">
                      <div className="text-sm">
                        {isNotesExpanded || !shouldShowExpandButton
                          ? gameLog.notes
                          : `${gameLog.notes.slice(0, 150)}...`}
                      </div>
                      {shouldShowExpandButton && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toggleNotesExpansion(gameLog.id);
                          }}
                          className="h-auto p-0 text-blue-600 hover:text-blue-700"
                        >
                          {isNotesExpanded ? (
                            <>
                              <ChevronRight className="h-4 w-4 mr-1" />
                              Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              Show more
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Tags and Classification */}
                  <div className="flex flex-wrap items-center gap-2">
                    {gameLog.tags && gameLog.tags.length > 0 && (
                      <>
                        {gameLog.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </>
                    )}
                    <Badge
                      variant="outline"
                      className={cn(
                        'flex items-center gap-1',
                        classificationColors[
                          gameLog.classification as keyof typeof classificationColors
                        ]
                      )}
                    >
                      <ClassificationIcon className="h-3 w-3" />
                      {gameLog.classification}
                    </Badge>
                  </div>

                  {/* Interaction Counts */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>0 views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>0 comments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users2 className="h-3 w-3" />
                      <span>0 reactions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({totalCount} total)
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
