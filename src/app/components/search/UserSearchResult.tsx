'use client';

import { User, AtSign, Calendar, Mail, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { BaseSearchResult } from '@/app/components/search/BaseSearchResult';
import { formatSearchDate } from '@/app/components/search/utils/searchDataParsers';
import { SEARCH_STYLES } from '@/app/components/search/utils/searchStyles';
import type { IUserSearchResultProps } from '@/types';

// Removed formatDate - using formatSearchDate from utilities instead

export function UserSearchResult({ user }: IUserSearchResultProps) {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to the specific user's profile page using their ID
    router.push(`/users/${user.id}`);
  };

  return (
    <BaseSearchResult
      onClick={handleClick}
      gradient={SEARCH_STYLES.gradients.user}
      badgeColor={SEARCH_STYLES.badge.user}
      badgeText="View Profile"
      badgeIcon={<ArrowRight className={SEARCH_STYLES.actionIndicator.icon} />}
    >
      {/* Enhanced Avatar */}
      <div className="flex-shrink-0">
        <div className={`${SEARCH_STYLES.avatar.base} ${SEARCH_STYLES.avatar.user}`}>
          <User className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* User Information */}
      <div className={SEARCH_STYLES.content.info}>
        <div className="flex items-start justify-between transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className={`${SEARCH_STYLES.content.title} truncate`}>
                {user.first_name && user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.username || 'Anonymous'}
              </h3>
              <span className={`${SEARCH_STYLES.badge.base} ${SEARCH_STYLES.badge.user}`}>
                <span
                  className={`w-1.5 h-1.5 ${SEARCH_STYLES.badgeDot.user} rounded-full mr-1.5`}
                />
                User
              </span>
            </div>

            <div className="flex items-center space-x-1 mb-3" data-testid="username-line">
              <AtSign className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {user.username || 'unknown'}
              </span>
            </div>

            <div className={SEARCH_STYLES.content.meta}>
              {user.created_at && (
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatSearchDate(user.created_at)}</span>
                </div>
              )}
              {user.email_address && (
                <div className="flex items-center space-x-1.5">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user.email_address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseSearchResult>
  );
}
