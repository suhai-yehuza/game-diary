/**
 * Image Service for API-Sports.io NBA v2 API
 *
 * This service provides utilities for generating proper image URLs
 * from the API-Sports.io NBA v2 API documentation:
 * https://api-sports.io/documentation/nba/v2#section/Logos-Images
 */

import type {
  IImageServiceConfig,
  IPlayerImageOptions,
  ITeamImageOptions,
  ILeagueImageOptions,
} from '@/types';

class ImageService {
  private readonly config: IImageServiceConfig;

  constructor(config: IImageServiceConfig) {
    this.config = config;
  }

  /**
   * Generate player image URL from API-Sports.io
   * Based on: https://api-sports.io/documentation/nba/v2#section/Logos-Images
   */
  getPlayerImage(options: IPlayerImageOptions): string {
    const { playerId, season: _season, size = 'medium' } = options;

    // Use our image proxy endpoint with RapidAPI configuration
    const sizeParam = this.getSizeParam(size);
    const imagePath = `basketball/players/${playerId}${sizeParam}.png`;

    return `/api/images/${imagePath}`;
  }

  /**
   * Generate team logo URL from API-Sports.io
   */
  getTeamLogo(options: ITeamImageOptions): string {
    const { teamId, season: _season, size = 'medium' } = options;

    // Use our image proxy endpoint with RapidAPI configuration
    const sizeParam = this.getSizeParam(size);
    const imagePath = `basketball/teams/${teamId}${sizeParam}.png`;

    return `/api/images/${imagePath}`;
  }

  /**
   * Generate league logo URL from API-Sports.io
   */
  getLeagueLogo(options: ILeagueImageOptions): string {
    const { leagueId, season: _season, size = 'medium' } = options;

    // Use our image proxy endpoint with RapidAPI configuration
    const sizeParam = this.getSizeParam(size);
    const imagePath = `basketball/leagues/${leagueId}${sizeParam}.png`;

    return `/api/images/${imagePath}`;
  }

  /**
   * Get fallback image URL for players
   */
  getPlayerFallback(): string {
    return this.config.fallbackImages.player;
  }

  /**
   * Get fallback image URL for teams
   */
  getTeamFallback(): string {
    return this.config.fallbackImages.team;
  }

  /**
   * Get fallback image URL for leagues
   */
  getLeagueFallback(): string {
    return this.config.fallbackImages.league;
  }

  /**
   * Convert size parameter to API-Sports.io format
   */
  private getSizeParam(size: 'small' | 'medium' | 'large'): string {
    switch (size) {
      case 'small':
        return '_small';
      case 'large':
        return '_large';
      case 'medium':
      default:
        return '';
    }
  }

  /**
   * Generate Next.js Image component props for players
   */
  getPlayerImageProps(options: IPlayerImageOptions & { alt: string }) {
    const { alt, ...imageOptions } = options;
    const src = this.getPlayerImage(imageOptions);

    return {
      src,
      alt,
      onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.target as HTMLImageElement;
        target.src = this.getPlayerFallback();
      },
    };
  }

  /**
   * Generate Next.js Image component props for teams
   */
  getTeamImageProps(options: ITeamImageOptions & { alt: string }) {
    const { alt, ...imageOptions } = options;
    const src = this.getTeamLogo(imageOptions);

    return {
      src,
      alt,
      onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.target as HTMLImageElement;
        target.src = this.getTeamFallback();
      },
    };
  }

  /**
   * Generate Next.js Image component props for leagues
   */
  getLeagueImageProps(options: ILeagueImageOptions & { alt: string }) {
    const { alt, ...imageOptions } = options;
    const src = this.getLeagueLogo(imageOptions);

    return {
      src,
      alt,
      onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.target as HTMLImageElement;
        target.src = this.getLeagueFallback();
      },
    };
  }
}

// Default configuration
const defaultConfig: IImageServiceConfig = {
  baseUrl: process.env.NEXT_PUBLIC_RAPID_API_BASE_URL || 'https://v2.nba.api-sports.io',
  fallbackImages: {
    player: '/defaults/default-player-logo.svg',
    team: '/logos/default-nba-team-logo.svg',
    league: '/logos/default-league-logo.svg',
  },
};

// Export singleton instance
export const imageService = new ImageService(defaultConfig);

// Export utility functions for easy use
export const getPlayerImage = (options: IPlayerImageOptions) =>
  imageService.getPlayerImage(options);

export const getTeamLogo = (options: ITeamImageOptions) => imageService.getTeamLogo(options);

export const getLeagueLogo = (options: ILeagueImageOptions) => imageService.getLeagueLogo(options);

export const getPlayerImageProps = (options: IPlayerImageOptions & { alt: string }) =>
  imageService.getPlayerImageProps(options);

export const getTeamImageProps = (options: ITeamImageOptions & { alt: string }) =>
  imageService.getTeamImageProps(options);

export const getLeagueImageProps = (options: ILeagueImageOptions & { alt: string }) =>
  imageService.getLeagueImageProps(options);
