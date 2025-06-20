import { useQuery } from '@apollo/client';
import Image from 'next/image';
import React, { useState } from 'react';

import { GET_USERS } from '@src/lib/graphql/queries';
import type { IFriend, IUserSearchProps } from '@src/lib/types';

export const UserSearch: React.FC<IUserSearchProps> = ({
  onUserSelect,
  excludeIds = [],
  users = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { loading, data } = useQuery(GET_USERS, {
    variables: { limit: 20, offset: 0 },
    skip: users.length > 0, // Skip if users are provided
  });

  const allUsers = users.length > 0 ? users : data?.users || [];

  const filteredUsers = allUsers
    .filter((user: IFriend) => !excludeIds.includes(user.id))
    .filter((user: IFriend) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 10);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsSearching(value.length > 0);
  };

  const handleUserSelect = (userId: string) => {
    if (onUserSelect) {
      onUserSelect(userId);
    }
    setSearchTerm('');
    setIsSearching(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search for users to add..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto animate-scale-in">
          {filteredUsers.length > 0 ? (
            <div className="py-2 stagger-children">
              {filteredUsers.map((user: IFriend, index: number) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleUserSelect(user.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors animate-slide-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Image
                    src={user.avatar || '/default-avatar.png'}
                    alt={user.username}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.username}</p>
                  </div>
                  <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors tap-scale">
                    Add
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 animate-fade-in">
              {searchTerm ? 'No users found' : 'Start typing to search...'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
