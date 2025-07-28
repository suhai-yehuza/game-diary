'use client';

import { User, Gamepad2, Trophy, Building2 } from 'lucide-react';
import { useState } from 'react';

import { GameLogSearchResult } from '@/app/components/search/GameLogSearchResult';
import { GameSearchResult } from '@/app/components/search/GameSearchResult';
import { PlayerSearchResult } from '@/app/components/search/PlayerSearchResult';
import { TeamSearchResult } from '@/app/components/search/TeamSearchResult';
import { UserSearchResult } from '@/app/components/search/UserSearchResult';
import type { ISearchResponse, ISearchResultsProps, ResultType } from '@/lib/types';

export function SearchResults({ results, query }: ISearchResultsProps) {
  const [activeFilter, setActiveFilter] = useState<ResultType>('all');

  const getFilterCount = (type: ResultType) => {
    switch (type) {
      case 'users':
        return results.data.totalUsers;
      case 'games':
        return results.data.totalGames;
      case 'gameLogs':
        return results.data.totalGameLogs;
      case 'teams':
        return results.data.totalTeams;
      case 'players':
        return results.data.totalPlayers;
      case 'all':
      default:
        return (
          results.data.totalUsers +
          results.data.totalGameLogs +
          results.data.totalGames +
          results.data.totalTeams +
          results.data.totalPlayers
        );
    }
  };

  const shouldShowSection = (type: ResultType) => {
    if (activeFilter === 'all') return true;
    return activeFilter === type;
  };

  const getFilterButtonClass = (type: ResultType) => {
    const isActive = activeFilter === type;
    if (isActive) {
      return 'px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer bg-primary text-primary-foreground';
    }

    // Different colors for different result types when not active
    switch (type) {
      case 'users':
        return 'px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800';
      case 'games':
        return 'px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800';
      case 'gameLogs':
        return 'px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800';
      case 'teams':
        return 'px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800';
      case 'players':
        return 'px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800';
      case 'all':
      default:
        return 'px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer bg-muted text-muted-foreground hover:bg-muted/80';
    }
  };

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {getFilterCount(activeFilter)} results for &quot;{query}&quot;
        </p>
        <div className="flex items-center space-x-2 text-xs">
          <span className={getFilterButtonClass('all')} onClick={() => setActiveFilter('all')}>
            {getFilterCount('all')} total
          </span>
          <span className={getFilterButtonClass('users')} onClick={() => setActiveFilter('users')}>
            {results.data.totalUsers} {results.data.totalUsers === 1 ? 'user' : 'users'}
          </span>
          <span className={getFilterButtonClass('games')} onClick={() => setActiveFilter('games')}>
            {results.data.totalGames} {results.data.totalGames === 1 ? 'game' : 'games'}
          </span>
          <span
            className={getFilterButtonClass('gameLogs')}
            onClick={() => setActiveFilter('gameLogs')}
          >
            {results.data.totalGameLogs}{' '}
            {results.data.totalGameLogs === 1 ? 'game log' : 'game logs'}
          </span>
          <span className={getFilterButtonClass('teams')} onClick={() => setActiveFilter('teams')}>
            {results.data.totalTeams} {results.data.totalTeams === 1 ? 'team' : 'teams'}
          </span>
          <span
            className={getFilterButtonClass('players')}
            onClick={() => setActiveFilter('players')}
          >
            {results.data.totalPlayers} {results.data.totalPlayers === 1 ? 'player' : 'players'}
          </span>
        </div>
      </div>

      {/* Users Section */}
      {shouldShowSection('users') && results.data.users.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Users ({results.data.totalUsers})</span>
          </h2>
          <div className="space-y-3">
            {results.data.users.map(user => (
              <UserSearchResult key={`user-${user.id}`} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* Games Section */}
      {shouldShowSection('games') && results.data.games.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Games ({results.data.totalGames})</span>
          </h2>
          <div className="space-y-3">
            {results.data.games.map(game => (
              <GameSearchResult key={`game-${game.id}`} game={game} />
            ))}
          </div>
        </div>
      )}

      {/* Game Logs Section */}
      {shouldShowSection('gameLogs') && results.data.gameLogs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Gamepad2 className="w-5 h-5" />
            <span>Game Logs ({results.data.totalGameLogs})</span>
          </h2>
          <div className="space-y-3">
            {results.data.gameLogs.map(gameLog => (
              <GameLogSearchResult key={`game-log-${gameLog.id}`} gameLog={gameLog} />
            ))}
          </div>
        </div>
      )}

      {/* Teams Section */}
      {shouldShowSection('teams') && results.data.teams.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Teams ({results.data.totalTeams})</span>
          </h2>
          <div className="space-y-3">
            {results.data.teams.map(team => (
              <TeamSearchResult key={`team-${team.id}`} team={team} />
            ))}
          </div>
        </div>
      )}

      {/* Players Section */}
      {shouldShowSection('players') && results.data.players.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Players ({results.data.totalPlayers})</span>
          </h2>
          <div className="space-y-3">
            {results.data.players.map(player => (
              <PlayerSearchResult key={`player-${player.id}`} player={player} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {results.data.users.length === 0 &&
        results.data.gameLogs.length === 0 &&
        results.data.games.length === 0 &&
        results.data.teams.length === 0 &&
        results.data.players.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 text-muted-foreground mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try searching for a different term or check your spelling.
            </p>
          </div>
        )}
    </div>
  );
}
