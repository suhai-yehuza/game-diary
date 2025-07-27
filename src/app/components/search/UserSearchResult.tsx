'use client';

import { Calendar, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { ISearchResult } from '@/lib/types';

interface IUserSearchResultProps {
  user: ISearchResult;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function UserSearchResult({ user }: IUserSearchResultProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/protected/user`);
  };

  return (
    <div
      className="flex items-center space-x-4 p-4 bg-card border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-foreground truncate">
            {user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : (user.username ?? 'Unknown User')}
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            User
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>@{user.username ?? 'unknown'}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Joined {formatDate(user.created_at)}</span>
          </span>
        </div>
        {user.email_address && (
          <p className="text-xs text-muted-foreground mt-1">{user.email_address}</p>
        )}
      </div>
    </div>
  );
}
