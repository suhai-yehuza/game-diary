'use client';

import { Search, X, Calendar, MapPin } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';

import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/Card';
import { API_CONFIG } from '@/lib/config/app.config';
import type { IGameSearchProps, IGameLogSearchResult, IGameResponse } from '@/lib/types';

export function GameSearch({ onGameSelect, onClose }: IGameSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [results, setResults] = useState<IGameLogSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(new Date().getFullYear());

  // Generate last 10 seasons (current year and 9 previous)
  const seasons = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const searchGames = useCallback(async (term: string, season: number) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Search for games in the selected season
      const response = await fetch(`/api/proxy/games?season=${season}&league=standard`);

      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }

      const data = (await response.json()) as { errors?: string[]; response?: IGameResponse[] };

      if (data.errors && data.errors.length > 0) {
        throw new Error(data.errors[0]);
      }

      const games: IGameResponse[] = data.response ?? [];

      // Filter games based on search term (team names, arena, etc.)
      const filteredGames = games.filter(game => {
        const searchLower = term.toLowerCase();
        const homeTeam = game.teams.home.name.toLowerCase();
        const awayTeam = game.teams.visitors.name.toLowerCase();
        const arena = game.arena?.name?.toLowerCase() ?? '';
        const gameDate = new Date(game.date.start).toLocaleDateString().toLowerCase();

        return (
          homeTeam.includes(searchLower) ||
          awayTeam.includes(searchLower) ||
          arena.includes(searchLower) ||
          gameDate.includes(searchLower)
        );
      });

      // Sort by date (most recent first) and limit results for performance
      const sortedGames = filteredGames
        .sort((a, b) => new Date(b.date.start).getTime() - new Date(a.date.start).getTime())
        .slice(0, API_CONFIG.pagination.DEFAULT_PAGE_SIZE * 2.5); // Use config-based limit for better search results

      const searchResults: IGameLogSearchResult[] = sortedGames.map(game => ({
        id: game.id,
        name: `${game.teams.visitors.name} @ ${game.teams.home.name}`,
        date: new Date(game.date.start).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        homeTeam: game.teams.home.name,
        awayTeam: game.teams.visitors.name,
        arena: game.arena?.name ?? 'Unknown Arena',
        season: game.season,
        status: game.status?.long ?? game.status?.short ?? 'Unknown',
      }));

      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search when debounced term or season changes
  useEffect(() => {
    void searchGames(debouncedSearchTerm, selectedSeason);
  }, [debouncedSearchTerm, selectedSeason, searchGames]);

  const handleGameSelect = (game: IGameLogSearchResult) => {
    onGameSelect(game.id.toString(), game.name);
    onClose();
  };

  const formatScore = (game: IGameLogSearchResult) => {
    // For now, we'll just show the teams without scores
    // In a real implementation, you'd get the scores from the game data
    return `${game.awayTeam} @ ${game.homeTeam}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Search for NBA Games</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search Controls */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search by team name, arena, or date..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={selectedSeason}
                onChange={e => setSelectedSeason(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {seasons.map(season => (
                  <option key={season} value={season}>
                    {season}-{season + 1} Season
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="text-center py-8">
                <p className="text-gray-600">Searching for games...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-600">
                <p>Error: {error}</p>
                <p className="text-sm mt-2">Please try again or check your connection.</p>
              </div>
            )}

            {!loading && !error && results.length === 0 && debouncedSearchTerm && (
              <div className="text-center py-8">
                <p className="text-gray-600">No games found matching your search.</p>
                <p className="text-sm mt-2">Try a different search term or season.</p>
              </div>
            )}

            {!loading && !error && results.length > 0 && (
              <div className="space-y-2">
                {results.map(game => (
                  <div
                    key={game.id}
                    onClick={() => handleGameSelect(game)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{formatScore(game)}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {game.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {game.arena}
                          </div>
                          <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                            {game.status || 'Unknown'}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">Season {game.season}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && !debouncedSearchTerm && (
              <div className="text-center py-8">
                <p className="text-gray-600">Enter a search term to find NBA games.</p>
                <p className="text-sm mt-2">You can search by team name, arena, or date.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
