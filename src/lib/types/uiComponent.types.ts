/**
 * UI Component Types
 * Type definitions for UI components
 */

import React from 'react';

// Button component types - Note: IButtonProps already exists in ui.types.ts

// Tabs component types
export interface ITabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export interface ITabsListProps {
  className?: string;
  children: React.ReactNode;
}

export interface ITabsTriggerProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface ITabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

// Sortable header types
export type SortDirection = 'asc' | 'desc' | null;

export interface ISortableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSortKey: string | null;
  currentSortDirection: SortDirection;
  onSort: (sortKey: string, direction: SortDirection) => void;
  className?: string;
  disabled?: boolean;
}
