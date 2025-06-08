'use client';

import { Filter, Search, SortDesc, Star, Tv, Users, X } from 'lucide-react';

import { Button } from '@src/components/ui/button';
import { Input } from '@src/components/ui/input';
import { Label } from '@src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/components/ui/select';
import { CLASSIFICATION } from '@src/lib/types/config.types';

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

type GameLogSortByType = (typeof GameLogSortBy)[keyof typeof GameLogSortBy];
type SortDirectionType = (typeof SortDirection)[keyof typeof SortDirection];

interface GameLogFiltersProps {
  searchText: string;
  setSearchText: (value: string) => void;
  selectedRating: string;
  setSelectedRating: (value: string) => void;
  selectedSetting: string;
  setSelectedSetting: (value: string) => void;
  selectedClassification: string;
  setSelectedClassification: (value: string) => void;
  hasNotes: string;
  setHasNotes: (value: string) => void;
  sortBy: GameLogSortByType;
  setSortBy: (value: GameLogSortByType) => void;
  sortDirection: SortDirectionType;
  setSortDirection: (value: SortDirectionType) => void;
  onClearFilters: () => void;
}

export function GameLogFilters({
  searchText,
  setSearchText,
  selectedRating,
  setSelectedRating,
  selectedSetting,
  setSelectedSetting,
  selectedClassification,
  setSelectedClassification,
  hasNotes,
  setHasNotes,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  onClearFilters,
}: GameLogFiltersProps) {
  const hasActiveFilters =
    searchText ||
    selectedRating !== 'all' ||
    selectedSetting !== 'all' ||
    selectedClassification !== 'all' ||
    hasNotes !== 'all';

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search game logs by teams, notes, tags, or location..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
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
          <Select value={sortBy} onValueChange={value => setSortBy(value as GameLogSortByType)}>
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
          <Select
            value={sortDirection}
            onValueChange={value => setSortDirection(value as SortDirectionType)}
          >
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
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-10 mt-auto">
            <X className="mr-2 h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}

// Export the constants for use in other components
export { GameLogSortBy, SortDirection, type GameLogSortByType, type SortDirectionType };
