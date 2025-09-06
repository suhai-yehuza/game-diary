'use client';

import { Search, X, Calendar, MapPin } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';

import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/Card';
import { API_CONFIG } from '@/lib/config/app.config';
import type { IGameSearchProps, IGameLogSearchResult, Game } from '@/types';

// Helper function to safely extract date from various game date formats
function getGameDate(date: string | { start?: string } | unknown): string {
  if (typeof date === 'string') return date;
  if (date && typeof date === 'object' && 'start' in date && typeof date.start === 'string')
    return date.start;
  // For any other unknown type, return empty string instead of calling String()
  return '';
}

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

      const data = (await response.json()) as { errors?: string[]; response?: Game[] };

      if (data.errors && data.errors.length > 0) {
        throw new Error(data.errors[0]);
      }

      const games: Game[] = data.response ?? [];

      // Filter games based on search term (team names, nicknames, codes, arena, etc.)
      const filteredGames = games.filter(game => {
        const searchLower = term.toLowerCase();

        // Check home team fields
        const homeTeamName = game.teams.home.name.toLowerCase();
        const homeTeamNickname = game.teams.home.nickname.toLowerCase();
        const homeTeamCode = game.teams.home.code.toLowerCase();

        // Check away team fields
        const awayTeamName = game.teams.visitors.name.toLowerCase();
        const awayTeamNickname = game.teams.visitors.nickname.toLowerCase();
        const awayTeamCode = game.teams.visitors.code.toLowerCase();

        // Check arena fields
        const arenaName = game.arena?.name?.toLowerCase() ?? '';
        const arenaCity = game.arena?.city?.toLowerCase() ?? '';

        // Check game date
        const gameDate = new Date(getGameDate(game.date)).toLocaleDateString().toLowerCase();

        return (
          // Home team matches
          homeTeamName.includes(searchLower) ||
          homeTeamNickname.includes(searchLower) ||
          homeTeamCode.includes(searchLower) ||
          // Away team matches
          awayTeamName.includes(searchLower) ||
          awayTeamNickname.includes(searchLower) ||
          awayTeamCode.includes(searchLower) ||
          // Arena matches
          arenaName.includes(searchLower) ||
          arenaCity.includes(searchLower) ||
          // Date matches
          gameDate.includes(searchLower)
        );
      });

      // Sort by date (most recent first) and limit results for performance
      const sortedGames = filteredGames
        .sort((a, b) => {
          const bDate = getGameDate(b.date);
          const aDate = getGameDate(a.date);
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        })
        .slice(0, API_CONFIG.pagination.DEFAULT_PAGE_SIZE * 2.5); // Use config-based limit for better search results

      const searchResults: IGameLogSearchResult[] = sortedGames.map(game => ({
        id: game.id,
        name: `${game.teams?.visitors?.name || game.away_team} @ ${game.teams?.home?.name || game.home_team}`,
        date: new Date(getGameDate(game.date)).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        homeTeam: game.teams?.home?.name || game.home_team,
        awayTeam: game.teams?.visitors?.name || game.away_team,
        arena: game.arena?.name ?? 'Unknown Arena',
        season: game.season ? parseInt(game.season) : 2024,
        status: typeof game.status === 'string' ? game.status : game.status?.short || 'Unknown',
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
      <Card
        className="w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden border border-neutral-200 dark:border-neutral-700"
        style={{
          backgroundColor: document.documentElement.classList.contains('dark')
            ? 'rgb(248, 250, 252)'
            : 'rgb(17, 24, 39)',
        }}
      >
        <div className="p-6 text-neutral-100 dark:text-neutral-900">
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={selectedSeason}
                onChange={e => setSelectedSeason(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
                <p className="text-gray-600 dark:text-gray-400">Searching for games...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-600 dark:text-red-400">
                <p>Error: {error}</p>
                <p className="text-sm mt-2">Please try again or check your connection.</p>
              </div>
            )}

            {!loading && !error && results.length === 0 && debouncedSearchTerm && (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No games found matching your search.
                </p>
                <p className="text-sm mt-2">Try a different search term or season.</p>
              </div>
            )}

            {!loading && !error && results.length > 0 && (
              <div className="space-y-2">
                {results.map(game => (
                  <div
                    key={game.id}
                    onClick={() => handleGameSelect(game)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {formatScore(game)}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {game.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {game.arena}
                          </div>
                          <div className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {game.status || 'Unknown'}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Season {game.season}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && !debouncedSearchTerm && (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  Enter a search term to find NBA games.
                </p>
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
