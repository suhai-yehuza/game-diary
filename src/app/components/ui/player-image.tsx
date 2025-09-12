'use client';

import React from 'react';

import type {
  ITeamPlayersPlayer as _ITeamPlayersPlayer,
  IPlayerResponse as _IPlayerResponse,
  IPlayerImageProps,
} from '@/types';

import { PlayerFallbackAvatar } from './fallback-avatar';

const containerSizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export function PlayerImage({ player, size = 'md', className }: IPlayerImageProps) {
  const playerName = `${player.firstname || ''} ${player.lastname || ''}`.trim() || 'Player';

  // Since player images are not available from the API, always show fallback avatar
  return (
    <div className={`${containerSizes[size]} ${className || ''}`}>
      <PlayerFallbackAvatar name={playerName} size={size} className="w-full h-full" />
    </div>
  );
}

// Specialized component for large player images (like on player detail page)
export function PlayerImageLarge({ player, className }: Omit<IPlayerImageProps, 'size'>) {
  const playerName = `${player.firstname || ''} ${player.lastname || ''}`.trim() || 'Player';

  // Since player images are not available from the API, always show fallback avatar
  return (
    <div
      className={`relative w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg ${className || ''}`}
    >
      <PlayerFallbackAvatar name={playerName} size="xl" className="w-full h-full rounded-2xl" />
    </div>
  );
}
