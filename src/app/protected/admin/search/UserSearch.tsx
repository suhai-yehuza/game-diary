import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { UserSearchProps, DbCustomUser } from '@/lib/types';

export function UserSearch({ users, onFilteredUsersChange }: UserSearchProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams?.get('q')?.toLowerCase() || '';

  useEffect(() => {
    const filteredUsers = users.filter((user: DbCustomUser) => {
      if (!searchQuery) return true;
      return (
        user.email?.toLowerCase().includes(searchQuery) ||
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
