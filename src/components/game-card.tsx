'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Game } from '@/lib/types/types';

interface GameCardProps {
  game: Game;
  index: number;
  imageErrors: Record<string, boolean>;
  onImageError: (id: string) => void;
}

export const GameCard = memo(({ game, index, imageErrors, onImageError }: GameCardProps) => {
  const isLive = game.status.long === 'In Play';
  const winningTeam =
    game.scores.visitors.points > game.scores.home.points
      ? 'visitors'
      : game.scores.home.points > game.scores.visitors.points
        ? 'home'
        : null;

  return (
    <Link href={`/sports/nba/games/${game.id}`} className="block">
      <div
        className={`bg-card rounded-xl shadow-lg p-6 transform transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl cursor-pointer h-[280px] flex flex-col border ${
          isLive
            ? 'border-red-500/50 hover:border-red-500 animate-pulse-slow overflow-hidden'
            : 'border-border/50 hover:border-blue-500/50'
        }`}
        style={{
          animationDelay: `${index * 50}ms`,
          animationFillMode: 'both',
        }}
      >
        {isLive && (
          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-1 text-sm font-medium animate-pulse rounded-t-xl">
            LIVE
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {game.league.logo && (
              <Image
                src={game.league.logo}
                alt={game.league.name}
                width={24}
                height={24}
                className="rounded-full transition-transform duration-300 hover:scale-110"
              />
            )}
            <span className="text-sm text-muted-foreground">
              {format(new Date(game.date.start), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isLive ? (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-500 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm" />
                <span className="text-red-600">Q{game.periods.current}</span>
                <span className="font-bold">{game.status.clock}</span>
              </div>
            ) : (
              <div className="text-sm font-medium px-2 py-1 rounded-full bg-purple-500/10 text-purple-500">
                {game.status.long}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 flex-grow">
          {/* Away Team */}
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              {game.teams.visitors.logo && (
                <Link href={`/sports/nba/teams/${game.teams.visitors.id}`} className="flex items-center gap-3">
                  <Image
                    src={
                      imageErrors[`${game.id}-visitors`] ? '/gamelog.svg' : game.teams.visitors.logo
                    }
                    alt={game.teams.visitors.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain"
                    onError={() => onImageError(`${game.id}-visitors`)}
                  />
                  <div>
                    <div className="font-semibold text-lg transition-colors duration-300 group-hover:text-purple-500">
                      {game.teams.visitors.nickname}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {game.scores.visitors.win}-{game.scores.visitors.loss}
                    </div>
                  </div>
                </Link>
              )}
            </div>
            <div
              className={`text-2xl font-bold transition-colors duration-300 group-hover:text-purple-500 ${
                winningTeam === 'visitors'
                  ? isLive
                    ? 'text-green-500 animate-pulse'
                    : 'text-green-500'
                  : ''
              }`}
            >
              {game.scores.visitors.points}
            </div>
          </div>

          {/* Home Team */}
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              {game.teams.home.logo && (
                <Link href={`/sports/nba/teams/${game.teams.home.id}`} className="flex items-center gap-3">
                  <Image
                    src={imageErrors[`${game.id}-home`] ? '/gamelog.svg' : game.teams.home.logo}
                    alt={game.teams.home.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain"
                    onError={() => onImageError(`${game.id}-home`)}
                  />
                  <div>
                    <div className="font-semibold text-lg transition-colors duration-300 group-hover:text-purple-500">
                      {game.teams.home.nickname}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {game.scores.home.win}-{game.scores.home.loss}
                    </div>
                  </div>
                </Link>
              )}
            </div>
            <div
              className={`text-2xl font-bold transition-colors duration-300 group-hover:text-purple-500 ${
                winningTeam === 'home'
                  ? isLive
                    ? 'text-green-500 animate-pulse'
                    : 'text-green-500'
                  : ''
              }`}
            >
              {game.scores.home.points}
            </div>
          </div>
        </div>

        <div className="mt-auto">
          {game.nugget && (
            <div className="text-sm text-muted-foreground line-clamp-2">{game.nugget}</div>
          )}
          <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-500"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {game.arena.name}, {game.arena.city}, {game.arena.state}
          </div>
        </div>
      </div>
    </Link>
  );
});

GameCard.displayName = 'GameCard';
