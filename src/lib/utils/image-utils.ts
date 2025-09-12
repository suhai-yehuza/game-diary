/**
 * Image Utilities for NBA Application
 *
 * Provides helper functions for handling player and team images
 * with proper fallbacks and Next.js Image optimization
 */

import { getPlayerImageProps, getTeamImageProps } from '@/lib/services/image-service';
import type { ITeamPlayersPlayer, IPlayerResponse, ITeamResponse } from '@/types';

/**
 * Get player image props for Next.js Image component
 */
export function getPlayerImagePropsFromData(
  player: ITeamPlayersPlayer | IPlayerResponse,
  options: {
    alt?: string;
    size?: 'small' | 'medium' | 'large';
  } = {}
) {
  const { alt, size = 'medium' } = options;

  // Use the player's ID for the image URL
  const playerId = player.id?.toString();

  if (!playerId) {
    return {
      src: '/defaults/default-player-logo.svg',
      alt: alt || 'Player',
      onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.target as HTMLImageElement;
        target.src = '/defaults/default-player-logo.svg';
      },
    };
  }

  return getPlayerImageProps({
    playerId,
    size,
    alt: alt || `${player.firstname || ''} ${player.lastname || ''}`.trim() || 'Player',
  });
}

/**
 * Get team image props for Next.js Image component
 */
export function getTeamImagePropsFromData(
  team: ITeamResponse | { id: string | number; name: string },
  options: {
    alt?: string;
    size?: 'small' | 'medium' | 'large';
  } = {}
) {
  const { alt, size = 'medium' } = options;

  // Use the team's ID for the image URL
  const teamId = team.id?.toString();

  if (!teamId) {
    return {
      src: '/logos/default-nba-team-logo.svg',
      alt: alt || 'Team',
      onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.target as HTMLImageElement;
        target.src = '/logos/default-nba-team-logo.svg';
      },
    };
  }

  return getTeamImageProps({
    teamId,
    size,
    alt: alt || team.name || 'Team',
  });
}

/**
 * Get team logo from team data with fallback
 */
export function getTeamLogo(
  team: ITeamResponse | { id: string | number; name: string; logo?: string }
) {
  // If team already has a logo URL, use it
  if (team.logo) {
    return team.logo;
  }

  // Otherwise, generate from API-Sports.io
  const teamId = team.id?.toString();
  if (!teamId) {
    return '/logos/default-nba-team-logo.svg';
  }

  return getTeamImagePropsFromData(team).src;
}

/**
 * Get player image from player data with fallback
 */
export function getPlayerImage(player: ITeamPlayersPlayer | IPlayerResponse) {
  // If player already has an image URL, use it (check if property exists)
  if ('image_url' in player && player.image_url) {
    return player.image_url;
  }

  // Check if player has logo in leagues data
  if (player.leagues?.standard?.logo) {
    return player.leagues.standard.logo;
  }

  // Otherwise, generate from API-Sports.io
  const playerId = player.id?.toString();
  if (!playerId) {
    return '/defaults/default-player-logo.svg';
  }

  return getPlayerImagePropsFromData(player).src;
}

/**
 * Generate proper sizes attribute for Next.js Image component
 */
export function getImageSizes(width: number): string {
  if (width <= 40) {
    return '40px';
  } else if (width <= 80) {
    return '80px';
  } else if (width <= 120) {
    return '120px';
  } else if (width <= 200) {
    return '200px';
  } else {
    return '400px';
  }
}

/**
 * Generate blur data URL for Next.js Image placeholder
 */
export function getBlurDataURL(): string {
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';
}

/**
 * Check if an image URL is valid
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get optimized image props for Next.js Image component (with width/height)
 */
export function getOptimizedImageProps(
  src: string,
  alt: string,
  width: number,
  height: number,
  options: {
    className?: string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    sizes?: string;
  } = {}
) {
  const { className, priority = false, loading = 'lazy', sizes } = options;

  return {
    src,
    alt,
    width,
    height,
    className,
    priority,
    loading,
    sizes: sizes || getImageSizes(width),
    placeholder: 'blur' as const,
    blurDataURL: getBlurDataURL(),
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      // Only fallback if the current src is not already a fallback
      if (!target.src.includes('default') && !target.src.includes('placeholder')) {
        target.src = '/defaults/default-player-logo.svg';
      }
    },
  };
}

/**
 * Get optimized image props for Next.js Image component (with fill)
 */
export function getOptimizedImagePropsWithFill(
  src: string,
  alt: string,
  options: {
    className?: string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    sizes?: string;
  } = {}
) {
  const { className, priority = false, loading = 'lazy', sizes } = options;

  return {
    src,
    alt,
    fill: true,
    className,
    priority,
    loading,
    sizes: sizes || '400px',
    placeholder: 'blur' as const,
    blurDataURL: getBlurDataURL(),
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      // Only fallback if the current src is not already a fallback
      if (!target.src.includes('default') && !target.src.includes('placeholder')) {
        target.src = '/defaults/default-player-logo.svg';
      }
    },
  };
}
