import { useQuery } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import { GET_USERS } from '@/lib/graphql/queries';
import { DBUser } from '@/lib/types/generated/graphql';
import { UserSearchProps } from '@/lib/types/user.types';

export const UserSearch: React.FC<UserSearchProps> = ({ onUserSelect, excludeIds = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { loading, error, data } = useQuery(GET_USERS, {
    variables: {
      pagination: {
        limit: 10,
        offset: 0,
      },
    },
    skip: !debouncedSearch,
  });

  const filteredUsers =
    data?.users
      ?.map((user: DBUser) => user)
      .filter((user: DBUser) => {
        const matchesSearch =
          user.username?.toLowerCase().includes(debouncedSearch.toLowerCase()) ?? false;
        const notExcluded = !excludeIds.includes(user.id);
        return matchesSearch && notExcluded;
      }) || [];

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <AnimatePresence>
        {debouncedSearch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg"
          >
            {loading ? (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : error ? (
              <div className="p-4 text-red-500">Error loading users</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-gray-500">No users found</div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {filteredUsers.map((user: DBUser) => (
                  <motion.button
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => onUserSelect?.(user.id)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                  >
                    <Image
                      src={user.imageUrl || '/default-user-avatar.svg'}
                      alt={user.username || 'User'}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-gray-500">
                        {user.firstName} {user.lastName}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
