import Image from 'next/image';
import React, { useState } from 'react';

import type { FriendGroup, FriendGroupsProps } from '@src/lib/types/social.types';

export const FriendGroups: React.FC<FriendGroupsProps> = ({ friends, onGroupUpdate }) => {
  const [groups, setGroups] = useState<FriendGroup[]>([
    {
      id: '1',
      name: 'Close Friends',
      description: 'My closest gaming buddies',
      friends: [],
      color: '#3B82F6',
      imageUrl: '',
    },
    {
      id: '2',
      name: 'NBA Watchers',
      description: 'Friends who love watching NBA games',
      friends: [],
      color: '#EF4444',
      imageUrl: '',
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newGroup, setNewGroup] = useState<Partial<FriendGroup>>({
    name: '',
    description: '',
    color: '#3B82F6',
    friends: [],
  });

  const handleCreateGroup = () => {
    if (newGroup.name && newGroup.description) {
      const group: FriendGroup = {
        id: Date.now().toString(),
        name: newGroup.name,
        description: newGroup.description,
        color: newGroup.color || '#3B82F6',
        friends: [],
        imageUrl: '',
      };
      setGroups([...groups, group]);
      onGroupUpdate(group);
      setNewGroup({ name: '', description: '', color: '#3B82F6', friends: [] });
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
  };

  const addFriendToGroup = (groupId: string, friendId: string) => {
    setGroups(
      groups.map(group =>
        group.id === groupId && !group.friends.includes(friendId)
          ? { ...group, friends: [...group.friends, friendId] }
          : group
      )
    );
  };

  // removeFriendFromGroup function removed as unused

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Friend Groups</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors tap-scale"
        >
          Create Group
        </button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {groups.map((group, index) => (
          <div
            key={group.id}
            className="bg-white rounded-lg p-4 shadow-sm border hover-lift animate-slide-in-up"
            style={{
              borderLeft: `4px solid ${group.color}`,
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{group.name}</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    /* Edit functionality not implemented */
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 tap-scale"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="p-1 text-gray-400 hover:text-red-600 tap-scale"
                >
                  🗑️
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{group.description}</p>

            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Members ({group.friends.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {group.friends.slice(0, 3).map(friendId => {
                  const friend = friends.find(f => f.id === friendId);
                  return friend ? (
                    <div
                      key={friend.id}
                      className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1"
                    >
                      <Image
                        src={friend.avatar}
                        alt={friend.username}
                        width={16}
                        height={16}
                        className="w-4 h-4 rounded-full"
                      />
                      <span className="text-xs">{friend.username}</span>
                    </div>
                  ) : null;
                })}
                {group.friends.length > 3 && (
                  <div className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-1">
                    +{group.friends.length - 3} more
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <select
                onChange={e => e.target.value && addFriendToGroup(group.id, e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                defaultValue=""
              >
                <option value="">Add friend...</option>
                {friends
                  .filter(f => !group.friends.includes(f.id))
                  .map(friend => (
                    <option key={friend.id} value={friend.id}>
                      {friend.username}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Create Group Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-overlay-show">
          <div className="bg-white rounded-lg p-6 w-full max-w-md animate-scale-in">
            <h3 className="text-lg font-semibold mb-4">Create New Group</h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="group-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Group Name
                </label>
                <input
                  id="group-name"
                  type="text"
                  value={newGroup.name || ''}
                  onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label
                  htmlFor="group-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="group-description"
                  value={newGroup.description || ''}
                  onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Describe your group"
                />
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">Color</span>
                <div className="flex gap-2">
                  {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(color => (
                    <button
                      key={color}
                      onClick={() => setNewGroup({ ...newGroup, color })}
                      className={`w-8 h-8 rounded-full border-2 tap-scale ${
                        newGroup.color === color ? 'border-gray-400' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsCreating(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 tap-scale"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 tap-scale"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
