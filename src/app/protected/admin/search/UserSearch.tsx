import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import type { DbUser } from '@src/lib/types/generated/graphql';
import type { IUserSearchProps } from '@src/lib/types/user.types';

export function UserSearch({ users, onFilteredUsersChange }: IUserSearchProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams?.get('q')?.toLowerCase() || '';

  useEffect(() => {
    const filteredUsers = users.filter((user: DbUser) => {
      if (!searchQuery) return true;
      return (
        user.emailAddress?.toLowerCase().includes(searchQuery) ||
        (user.username?.toLowerCase().includes(searchQuery) ?? false)
      );
    });
    onFilteredUsersChange?.(filteredUsers);

    const cleanup = () => {
      if (searchQuery) {
        router.replace('/protected/admin/users');
      }
    };
    return cleanup;
  }, [searchQuery, users, onFilteredUsersChange, router]);

  return null; // This is a logic-only component
}
