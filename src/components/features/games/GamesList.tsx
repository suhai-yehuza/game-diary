import { useState, useCallback } from 'react';

import { GameStatusValue } from '@/lib/db/schema/enum-values';
import { GAME_STATUS_VALUES } from '@/lib/types/config.types';
import { Game, GameFilters } from '@/lib/types/game.types';

interface GamesListProps {
  games: Game[];
  initialFilters?: GameFilters;
  onGameSelect?: (game: Game) => void;
}

export const GamesList = ({ games, initialFilters, onGameSelect }: GamesListProps) => {
  const [filters, setFilters] = useState<GameFilters>(
    initialFilters || {
      status: undefined,
      dateRange: undefined,
      sortBy: 'date',
      sortDirection: 'DESC',
    }
  );

  const handleSortChange = useCallback((value: string) => {
    setFilters((prev: GameFilters) => ({
      ...prev,
      sortBy: value,
      sortDirection: prev.sortDirection === 'ASC' ? 'DESC' : 'ASC',
    }));
  }, []);

  const handleStatusChange = useCallback((value: GameStatusValue) => {
    setFilters((prev: GameFilters) => ({
      ...prev,
      status: value,
    }));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <select
            value={filters.status || ''}
            onChange={e => handleStatusChange(e.target.value as GameStatusValue)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="">All Status</option>
            {Object.entries(GAME_STATUS_VALUES).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filters.sortBy}
            onChange={e => handleSortChange(e.target.value)}
            className="px-3 py-1 border rounded"
          >
            <option value="date">Date</option>
            <option value="score">Score</option>
            <option value="team">Team</option>
          </select>
          <select
            value={filters.sortDirection}
            onChange={e => handleSortChange(e.target.value)}
            className="px-3 py-1 border rounded"
          >
            <option value="ASC">Ascending</option>
            <option value="DESC">Descending</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map(game => (
          <div
            key={game.id}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onGameSelect?.(game)}
          >
            <h3 className="font-semibold">
              {game.teams.home.name} vs {game.teams.visitors.name}
            </h3>
            <p className="text-sm text-gray-600">
              {new Date(game.date.start).toLocaleDateString()}
            </p>
            <div className="mt-2 text-sm">
              <span className="text-gray-500">Status: </span>
              <span>{game.status.short}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
