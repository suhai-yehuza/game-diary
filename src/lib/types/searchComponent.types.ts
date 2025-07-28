/**
 * Search Component Types
 * Type definitions for search-related components
 */

import React from 'react';

import type { ISearchResponse } from './search.types';

// Search results types
export interface ISearchResultsProps {
  results: ISearchResponse;
  query: string;
}

export type ResultType = 'all' | 'users' | 'games' | 'gameLogs' | 'teams' | 'players';

// Search result item types
import type { ISearchResult } from './search.types';

export interface IGameSearchResultProps {
  game: ISearchResult;
  onClick?: (game: ISearchResult) => void;
  className?: string;
}

export interface IGameLogSearchResultProps {
  gameLog: ISearchResult;
}

export interface IPlayerSearchResultProps {
  player: import('./search.types').ISearchResult;
  onClick?: (player: import('./search.types').ISearchResult) => void;
  className?: string;
}

export interface ITeamSearchResultProps {
  team: import('./search.types').ISearchResult;
  onClick?: (team: import('./search.types').ISearchResult) => void;
  className?: string;
}

export interface IUserSearchResultProps {
  user: import('./search.types').ISearchResult;
  onClick?: (user: import('./search.types').ISearchResult) => void;
  className?: string;
}

// Search empty state types
export interface ISearchEmptyStateProps {
  hasQuery: boolean;
}

// Game search types
export interface IGameSearchProps {
  onGameSelect: (gameId: string, gameName: string) => void;
  onClose: () => void;
}

// Note: ISearchResult already exists in search.types.ts

// Game logs search types
export interface IGameLogsSearchProps {
  onSearchChange: (searchTerm: string, searchField: string) => void;
  onClear: () => void;
  searchTerm: string;
  searchField: string;
}
