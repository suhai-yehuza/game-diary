'use client';

import * as Icons from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { IUserSearchResultProps } from '@/lib/types';

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
      className="flex items-center space-x-4 p-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-semantic-success/10 dark:bg-semantic-success/20 rounded-full flex items-center justify-center">
          <Icons.User className="w-5 h-5 text-semantic-success" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
            {user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.username || 'Unknown User'}
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-semantic-success/10 text-semantic-success border border-semantic-success/20">
            User
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center space-x-1" data-testid="username-line">
            <Icons.User className="w-3 h-3" />
            <span>@{user.username || 'unknown'}</span>
          </div>
          {user.created_at && (
            <span className="flex items-center space-x-1">
              <Icons.Calendar className="w-3 h-3" />
              <span>Joined {formatDate(user.created_at)}</span>
            </span>
          )}
        </div>
        {user.email_address && (
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
            {user.email_address}
          </p>
        )}
      </div>
    </div>
  );
}
