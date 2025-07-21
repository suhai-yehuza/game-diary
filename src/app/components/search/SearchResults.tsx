'use client';

import { User, Gamepad2 } from 'lucide-react';

import { GameLogSearchResult } from '@/app/components/search/GameLogSearchResult';
import { UserSearchResult } from '@/app/components/search/UserSearchResult';
import type { ISearchResponse } from '@/lib/types';

interface ISearchResultsProps {
  results: ISearchResponse;
  query: string;
}

export function SearchResults({ results, query }: ISearchResultsProps) {
  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {results.data.totalUsers + results.data.totalGameLogs} results for &quot;{query}
          &quot;
        </p>
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <span>{results.data.totalUsers} users</span>
          <span>{results.data.totalGameLogs} game logs</span>
        </div>
      </div>

      {/* Users Section */}
      {results.data.users.length > 0 && (
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

      {/* Game Logs Section */}
      {results.data.gameLogs.length > 0 && (
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

      {/* No Results */}
      {results.data.users.length === 0 && results.data.gameLogs.length === 0 && (
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
