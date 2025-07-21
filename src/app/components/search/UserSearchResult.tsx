'use client';

import { User } from 'lucide-react';

import type { ISearchResult } from '@/lib/types';

interface IUserSearchResultProps {
  user: ISearchResult;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function UserSearchResult({ user }: IUserSearchResultProps) {
  return (
    <div className="flex items-center space-x-4 p-4 bg-card border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-foreground truncate">
            {user.first_name ?? ''} {user.last_name ?? ''}
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            User
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">@{user.username ?? 'unknown'}</p>
        <p className="text-xs text-muted-foreground">Joined {formatDate(user.created_at)}</p>
      </div>
    </div>
  );
}
