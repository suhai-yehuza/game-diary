/**
 * Game Log Component Types
 * Type definitions for game log related components
 */

import React from 'react';

// Game log modal types
export interface IGameLogModalProps {
  mode: 'create' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gameLog?: any; // Required for edit mode
}

// Game log search result types
export interface IGameLogSearchResult {
  id: number;
  name: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  arena: string;
  season: number;
  status: string;
}

// Note: ISearchResult already exists in search.types.ts
