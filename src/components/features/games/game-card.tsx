'use client';

import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { memo } from 'react';

import { GameCardProps } from '@/lib/types/consolidated.types';

export const GameCard = memo(({ game, index, imageErrors, onImageError }: GameCardProps) => {
  const router = useRouter();
  const isLive = game.status === 'In Progress' || game.status === 'Live';
  const winningTeam =
    game.scores.visitors.points > game.scores.home.points
      ? 'visitors'
      : game.scores.home.points > game.scores.visitors.points
        ? 'home'
        : null;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If the click was on a team link, let that handle navigation
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    router.push(`/sports/nba/games/${game.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-card rounded-xl shadow-lg p-6 transform transition-all duration-300 ease-out group/card hover:scale-[1.05] hover:rotate-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:-translate-y-1 active:scale-[0.98] active:rotate-0 active:shadow-lg cursor-pointer h-[280px] flex flex-col border ${
        isLive
          ? 'border-red-500/50 group-hover/card:border-red-500 animate-pulse-slow overflow-hidden'
          : 'border-border/50 group-hover/card:border-blue-500/50'
      }`}
      style={{
        animationDelay: `${(index ?? 0) * 50}ms`,
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
          <span className="text-sm text-muted-foreground">
            {format(new Date(game.date), 'MMM d, yyyy h:mm a')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLive ? (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-500 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm" />
              <span className="text-red-600">{game.status}</span>
            </div>
          ) : (
            <div className="text-sm font-medium px-2 py-1 rounded-full bg-purple-500/10 text-purple-500">
              {game.status}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 flex-grow">
        {/* Away Team */}
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            {game.teams.visitors.logo && (
              <Link
                href={`/sports/nba/teams/${game.teams.visitors.id}`}
                className="flex items-center gap-3 hover:no-underline group/team"
              >
                <Image
                  src={
                    imageErrors?.has(`${game.id}-visitors`)
                      ? '/gamelog.svg'
                      : game.teams.visitors.logo
                  }
                  alt={game.teams.visitors.name}
                  width={64}
                  height={64}
                  priority
                  className="w-16 h-16 object-contain transition-transform duration-300 group-hover/team:scale-110"
                  onError={() => onImageError?.(`${game.id}-visitors`)}
                />
                <div>
                  <div className="font-semibold text-lg transition-colors duration-300 group-hover/team:text-blue-500">
                    {game.teams.visitors.nickname}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {game.scores.visitors.points}-{game.scores.home.points}
                  </div>
                </div>
              </Link>
            )}
          </div>
          <div
            className={`text-2xl font-bold ${
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
              <Link
                href={`/sports/nba/teams/${game.teams.home.id}`}
                className="flex items-center gap-3 hover:no-underline group/team"
              >
                <Image
                  src={imageErrors?.has(`${game.id}-home`) ? '/gamelog.svg' : game.teams.home.logo}
                  alt={game.teams.home.name}
                  width={64}
                  height={64}
                  priority
                  className="w-16 h-16 object-contain transition-transform duration-300 group-hover/team:scale-110"
                  onError={() => onImageError?.(`${game.id}-home`)}
                />
                <div>
                  <div className="font-semibold text-lg transition-colors duration-300 group-hover/team:text-blue-500">
                    {game.teams.home.nickname}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {game.scores.home.points}-{game.scores.visitors.points}
                  </div>
                </div>
              </Link>
            )}
          </div>
          <div
            className={`text-2xl font-bold ${
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
          {`${game.arena.name}, ${game.arena.city}, ${game.arena.state}`}
        </div>
      </div>
    </div>
  );
});

GameCard.displayName = 'GameCard';
